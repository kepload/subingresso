// Fixture transazionali: nessuna modifica definitiva a profili/eventi/prenotazioni.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const checks=`
 EXECUTE 'RESET ROLE';
 IF has_function_privilege('anon','public.organizer_analytics(integer,uuid)','EXECUTE')
 OR has_table_privilege('authenticated','event_private.analytics_events','SELECT,INSERT,UPDATE,DELETE')
 OR has_schema_privilege('anon','event_private','USAGE') THEN RAISE EXCEPTION 'Privacy statistiche';END IF;
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);EXECUTE 'SET LOCAL ROLE authenticated';
 PERFORM public.track_organizer_event(event_id,'view',request_id);
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',admin_id::text,true);EXECUTE 'SET LOCAL ROLE authenticated';
 PERFORM public.track_organizer_event(event_id,'view',request_id);
 EXECUTE 'RESET ROLE';
 IF EXISTS(SELECT 1 FROM event_private.analytics_events a WHERE a.event_id=event_id AND a.session_hash=encode(extensions.digest(request_id::text||event_id::text||(now() AT TIME ZONE 'UTC')::date::text,'sha256'),'hex')) THEN RAISE EXCEPTION 'Visite proprie/admin incluse';END IF;
 PERFORM set_config('request.jwt.claim.sub','',true);EXECUTE 'SET LOCAL ROLE anon';
 PERFORM public.track_organizer_event(event_id,'view',request_id,'calendar','mobile');
 PERFORM public.track_organizer_event(event_id,'view',request_id,'calendar','mobile');
 PERFORM public.track_organizer_event(event_id,'email',request_id,'calendar','mobile');
 PERFORM public.track_organizer_event(event_id,'email',request_id,'calendar','mobile');
 PERFORM public.track_organizer_event(event_id,'phone',request_id,'calendar','mobile'); -- Nessun telefono pubblico: ignorato.
 PERFORM public.track_organizer_event(event_id,'invented',request_id,'calendar','mobile');
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);EXECUTE 'SET LOCAL ROLE authenticated';
 data:=public.organizer_analytics(7,event_id);
 IF data->'totals'->>'views'<>'1' OR data->'totals'->>'contacts'<>'1' OR jsonb_array_length(data->'daily')<>7
 OR data->'sources'->0->>'source'<>'calendar' OR data->'devices'->0->>'device'<>'mobile' THEN RAISE EXCEPTION 'Deduplica o conteggi: %',data;END IF;
 IF data->'events'->0->>'capacity'<>'2' OR data->'events'->0->>'available'<>'2' THEN RAISE EXCEPTION 'Capienza statistiche';END IF;
 BEGIN PERFORM public.organizer_analytics(8);RAISE EXCEPTION 'Periodo non valido accettato';EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Periodo non valido%' THEN RAISE;END IF;END;
 EXECUTE 'RESET ROLE';
 -- Confini UTC, stessi istanti nel periodo precedente, dati futuri esclusi.
 INSERT INTO event_private.analytics_events(event_id,day,metric,session_hash,source,device,created_at)
 SELECT event_id,(x AT TIME ZONE 'UTC')::date,'view',encode(extensions.digest(x::text,'sha256'),'hex'),'direct','desktop',x
 FROM unnest(ARRAY[((now() AT TIME ZONE 'UTC')::date-6)::timestamp AT TIME ZONE 'UTC',
 (((now() AT TIME ZONE 'UTC')::date-6)::timestamp AT TIME ZONE 'UTC')-interval '1 microsecond',
 (((now() AT TIME ZONE 'UTC')::date-13)::timestamp AT TIME ZONE 'UTC'),
 (((now() AT TIME ZONE 'UTC')::date-13)::timestamp AT TIME ZONE 'UTC')-interval '1 microsecond',
 now()+interval '1 hour']) x;
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);EXECUTE 'SET LOCAL ROLE authenticated';
 data:=public.organizer_analytics(7,event_id);
 IF data->'totals'->>'views'<>'2' OR data->'totals'->>'previous_views'<>'1' THEN RAISE EXCEPTION 'Confini periodo: %',data->'totals';END IF;
 PERFORM set_config('TimeZone','Pacific/Kiritimati',true);
 IF public.organizer_analytics(7,event_id)->'totals' IS DISTINCT FROM data->'totals' THEN RAISE EXCEPTION 'Fuso diverso cambia conteggi';END IF;
 PERFORM set_config('TimeZone','UTC',true);
 EXECUTE 'RESET ROLE';
 INSERT INTO public.saved_fairs(user_id,fair_kind,fair_id,fair_name,city) VALUES(buyer_id,'organizer',event_id::text,'QA fiera','Milano');
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);EXECUTE 'SET LOCAL ROLE authenticated';
 data:=public.organizer_analytics(30,event_id);
 IF data->'events'->0->>'saved'<>'1' OR data->'events'->0->>'reminders'<>'0' THEN RAISE EXCEPTION 'Salvataggi';END IF;
 IF data::text LIKE '%example.invalid%' OR data::text LIKE '%session_hash%' OR data::text LIKE '%buyer_id%' THEN RAISE EXCEPTION 'Dati personali nelle statistiche';END IF;
 IF jsonb_array_length(public.organizer_analytics(90,event_id)->'daily')<>90 THEN RAISE EXCEPTION 'Serie incompleta';END IF;
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',outsider_id::text,true);EXECUTE 'SET LOCAL ROLE authenticated';
 IF public.organizer_analytics(30)->'events'<>'[]'::jsonb OR public.organizer_analytics(30)->'totals'->>'views'<>'0' THEN RAISE EXCEPTION 'Statistiche altrui visibili';END IF;
 BEGIN PERFORM public.organizer_analytics(30,event_id);RAISE EXCEPTION 'Filtro evento altrui';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 EXECUTE 'RESET ROLE';
 -- Bozze e organizzatori sospesi non producono attività.
 UPDATE public.organizer_events SET status='draft' WHERE id=event_id;
 PERFORM set_config('request.jwt.claim.sub','',true);EXECUTE 'SET LOCAL ROLE anon';
 PERFORM public.track_organizer_event(event_id,'view',gen_random_uuid());
 EXECUTE 'RESET ROLE';
 UPDATE public.organizer_events SET status='published' WHERE id=event_id;
 UPDATE public.organizer_profiles SET status='suspended' WHERE user_id=owner_id;
 PERFORM public.track_organizer_event(event_id,'view',gen_random_uuid());
 UPDATE public.organizer_profiles SET status='approved' WHERE user_id=owner_id;
 IF (SELECT count(*) FROM event_private.analytics_events a WHERE a.event_id=event_id)<>7 THEN RAISE EXCEPTION 'Evento non pubblico tracciato';END IF;
`;
(async()=>{
 let sql=fs.readFileSync(path.join(__dirname,'verify-organizer-events.sql'),'utf8');
 const anchor=' -- Predisposizione futura, abilitata ESCLUSIVAMENTE';assert(sql.includes(anchor));
 sql=sql.replace(anchor,checks+'\n'+anchor);
 // Le variabili fixture hanno gli stessi nomi di alcune colonne: risolvi esplicitamente nelle nuove query.
 sql=sql.replace('DO $$',()=> 'DO $$\n#variable_conflict use_variable');
 if(process.argv.includes('--with-migration'))sql=fs.readFileSync(path.join(root,'PATCH_ORGANIZZATORI_STATISTICHE_20261021.sql'),'utf8').replace(/COMMIT;\s*$/,'')+'\n'+sql.replace('BEGIN;','');
 const token=process.env.SUPABASE_ACCESS_TOKEN||JSON.parse(fs.readFileSync(path.join(root,'.claude/settings.local.json'),'utf8')).env.SUPABASE_ACCESS_TOKEN;
 const response=await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)});
 const result=await response.json();if(!response.ok)throw Error(JSON.stringify(result));assert(result.some(row=>row.result?.passed));
 if(process.env.EVENT_QA_DIR){fs.mkdirSync(process.env.EVENT_QA_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.EVENT_QA_DIR,'analytics-database.json'),JSON.stringify({passed:true,rollback:true,result},null,2));}
 console.log('OK SQL/ROLLBACK: periodi 7/30/90, UTC, deduplica, esclusione proprietario/admin, privacy, isolamento, salvataggi, inventario e regressioni eventi.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
