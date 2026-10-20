// Schema reale, fixture solo nella transazione annullata. Nessuna email o addebito.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const checks=`
 -- Disponibilità pubblica, assegnazioni esterne e aggiornamenti senza riapprovazione.
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);EXECUTE 'SET LOCAL ROLE authenticated';
 data:=public.set_event_capacity(place_id,2,2,1);
 IF (data->>'available')::integer<>0 THEN RAISE EXCEPTION 'Sold out esterno';END IF;
 IF public.published_organizer_events(event_id)->0->'places'->0->>'available'<>'0' THEN RAISE EXCEPTION 'Sold out pubblico';END IF;
 IF public.organizer_workspace()->'events'->0->>'status'<>'published' THEN RAISE EXCEPTION 'Aggiornamento posti ritira evento';END IF;
 BEGIN PERFORM public.set_event_capacity(place_id,2,0,1);RAISE EXCEPTION 'Revisione vecchia accettata';EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Disponibilità aggiornata%' THEN RAISE;END IF;END;
 BEGIN PERFORM public.set_event_capacity(place_id,1,2,2);RAISE EXCEPTION 'Massimo non valido accettato';EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Controlla il massimo%' THEN RAISE;END IF;END;
 data:=public.set_event_capacity(place_id,3,2,2);
 IF (data->>'available')::integer<>1 THEN RAISE EXCEPTION 'Riapertura non corretta';END IF;
 data:=public.set_event_capacity(place_id,2,0,3);
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',outsider_id::text,true);EXECUTE 'SET LOCAL ROLE authenticated';
 BEGIN PERFORM public.set_event_capacity(place_id,2,2,4);RAISE EXCEPTION 'Posti altrui modificabili';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 EXECUTE 'RESET ROLE';
 IF has_function_privilege('anon','public.set_event_capacity(uuid,integer,integer,integer)','EXECUTE') THEN RAISE EXCEPTION 'Gestione posti anonima';END IF;
 IF public.published_organizer_events(event_id)::text LIKE '%external_reserved%' THEN RAISE EXCEPTION 'Assegnazioni private pubbliche';END IF;
`;
const heldChecks=`
 IF event_private.place_inventory(place_id)->>'available'<>'1' THEN RAISE EXCEPTION 'Blocco pagamento non sottratto';END IF;
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);EXECUTE 'SET LOCAL ROLE authenticated';
 BEGIN PERFORM public.set_event_capacity(place_id,1,1,4);RAISE EXCEPTION 'Massimo sotto occupati accettato';EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Il massimo non può%' THEN RAISE;END IF;END;
 data:=public.set_event_capacity(place_id,2,1,4);
 IF data->>'available'<>'0' THEN RAISE EXCEPTION 'Esterni più blocco pagamento';END IF;
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',outsider_id::text,true);EXECUTE 'SET LOCAL ROLE authenticated';
 BEGIN PERFORM public.reserve_event_place(place_id,1,gen_random_uuid());RAISE EXCEPTION 'Sovraprenotazione esterni';EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'Posti insufficienti' THEN RAISE;END IF;END;
 EXECUTE 'RESET ROLE';
 UPDATE public.event_bookings SET status='paid' WHERE id=booking_id;
 IF event_private.place_inventory(place_id)->>'available'<>'0' THEN RAISE EXCEPTION 'Pagamento confermato non sottratto';END IF;
 UPDATE public.event_bookings SET status='partially_refunded' WHERE id=booking_id;
 IF event_private.place_inventory(place_id)->>'available'<>'0' THEN RAISE EXCEPTION 'Rimborso parziale libera posti';END IF;
 UPDATE public.event_bookings SET status='refunded' WHERE id=booking_id;
 IF event_private.place_inventory(place_id)->>'available'<>'1' THEN RAISE EXCEPTION 'Rimborso totale non libera posti';END IF;
 UPDATE public.event_bookings SET status='pending_payment' WHERE id=booking_id;
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);EXECUTE 'SET LOCAL ROLE authenticated';
 PERFORM public.set_event_capacity(place_id,2,0,5);
 EXECUTE 'RESET ROLE';
`;
(async()=>{
 let sql=fs.readFileSync(path.join(__dirname,'verify-organizer-events.sql'),'utf8');
 const anchor=' -- Predisposizione futura, abilitata ESCLUSIVAMENTE';assert(sql.includes(anchor));
 sql=sql.replace(anchor,checks+'\n'+anchor);
 const expiry=" UPDATE public.event_bookings SET expires_at=now()-interval '1 second' WHERE id=booking_id;";assert(sql.includes(expiry));
 sql=sql.replace(expiry,heldChecks+'\n'+expiry);
 if(process.argv.includes('--with-migration'))sql=fs.readFileSync(path.join(root,'PATCH_EVENTI_DISPONIBILITA_20261020.sql'),'utf8').replace(/COMMIT;\s*$/,'')+'\n'+sql.replace('BEGIN;','');
 const token=process.env.SUPABASE_ACCESS_TOKEN||JSON.parse(fs.readFileSync(path.join(root,'.claude/settings.local.json'),'utf8')).env.SUPABASE_ACCESS_TOKEN;
 const response=await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)});
 const data=await response.json();if(!response.ok)throw Error(JSON.stringify(data));assert(data.some(row=>row.result?.passed));
 if(process.env.EVENT_QA_DIR){fs.mkdirSync(process.env.EVENT_QA_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.EVENT_QA_DIR,'capacity-database.json'),JSON.stringify({at:new Date().toISOString(),passed:true,rollback:true,result:data},null,2));}
 console.log('OK: SQL reale in ROLLBACK: massimo, esterni, sold out/riapertura, revisioni, privacy, isolamento, blocchi pagamento, scadenza, pagati, rimborsi, protezione sovraprenotazioni e regressioni organizzatori.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
