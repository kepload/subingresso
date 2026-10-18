-- Solo fixture in transazione, nessun account/email/pagamento reale creato.
BEGIN;
SET LOCAL TIME ZONE 'UTC';
SELECT set_config('request.jwt.claim.sub','',true),set_config('request.jwt.claims','{}',true);
DO $$
DECLARE owner_id uuid; buyer_id uuid; admin_id uuid; outsider_id uuid; p jsonb; e jsonb; s jsonb;
 profile_data jsonb; event_data jsonb; rev integer; event_id uuid; place_id uuid; data jsonb; reserved jsonb;
 request_id uuid:=gen_random_uuid(); failed boolean; item integer; booking_id uuid;
BEGIN
 SELECT id INTO owner_id FROM public.profiles WHERE NOT coalesce(is_admin,false) AND NOT EXISTS(SELECT 1 FROM public.organizer_profiles o WHERE o.user_id=profiles.id) ORDER BY id LIMIT 1;
 SELECT id INTO buyer_id FROM public.profiles WHERE NOT coalesce(is_admin,false) AND id<>owner_id ORDER BY id LIMIT 1;
 SELECT id INTO outsider_id FROM public.profiles WHERE NOT coalesce(is_admin,false) AND id NOT IN(owner_id,buyer_id) ORDER BY id LIMIT 1;
 SELECT id INTO admin_id FROM public.profiles WHERE is_admin ORDER BY id LIMIT 1;
 IF owner_id IS NULL OR buyer_id IS NULL OR admin_id IS NULL OR outsider_id IS NULL THEN RAISE EXCEPTION 'Account fixture mancanti'; END IF;
 IF has_table_privilege('anon','public.organizer_profiles','SELECT,INSERT,UPDATE,DELETE')
 OR has_table_privilege('authenticated','public.organizer_events','SELECT,INSERT,UPDATE,DELETE')
 OR has_table_privilege('authenticated','public.event_places','SELECT,INSERT,UPDATE,DELETE')
 OR has_table_privilege('authenticated','public.event_bookings','SELECT,INSERT,UPDATE,DELETE')
 OR has_table_privilege('service_role','public.event_bookings','INSERT,UPDATE,DELETE')
 OR has_schema_privilege('authenticated','event_private','USAGE')
 OR has_function_privilege('anon','public.admin_event_workspace()','EXECUTE')
 OR has_function_privilege('anon','public.organizer_workspace()','EXECUTE') THEN RAISE EXCEPTION 'Privilegi non sicuri'; END IF;
 BEGIN PERFORM public.organizer_workspace(); RAISE EXCEPTION 'Accesso anonimo consentito'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 profile_data:=jsonb_build_object('organization_name','QA Organizzatore transazionale','organization_type','associazione','description','Descrizione pubblica di collaudo',
 'contact_name','REFERENTE_PRIVATO_QA','private_phone','+39 333 0000000','public_email','pubblico@example.invalid','public_phone','','website','https://example.invalid','status','approved','user_id',buyer_id);
 event_data:=jsonb_build_object('title','QA Mercatino transazionale','description','Descrizione evento di collaudo abbastanza lunga per le verifiche. Nessuna pubblicazione reale.',
 'category','mercatino','city','Milano','province','Milano','region','Lombardia','venue','Piazza di collaudo',
 'start_date',current_date+30,'end_date',current_date+31,'sectors',jsonb_build_array('artigianato'),'goods','Artigianato locale',
 'participation_rules','Domanda all’organizzatore, documenti e servizi da concordare.','status','published','organizer_id',buyer_id,'bookings_enabled',true);
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 BEGIN PERFORM public.admin_event_workspace(); RAISE EXCEPTION 'Admin simulabile dal browser'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 p:=public.save_organizer_profile(profile_data);
 IF p->>'status'<>'pending' OR (p->>'user_id')::uuid<>owner_id THEN RAISE EXCEPTION 'Autoapprovazione profilo'; END IF;
 BEGIN PERFORM public.save_organizer_event(NULL,event_data); RAISE EXCEPTION 'Evento prima di approvazione profilo'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',admin_id::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 PERFORM public.review_organizer(owner_id,'approved','',(p->>'revision')::integer);
 BEGIN PERFORM public.review_organizer(owner_id,'approved','',1); RAISE EXCEPTION 'Revisione obsoleta accettata'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Profilo cambiato%' THEN RAISE; END IF; END;
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 BEGIN PERFORM public.save_organizer_event(NULL,event_data||'{"city":"Comune inesistente"}'); RAISE EXCEPTION 'Comune inventato accettato'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Seleziona un comune%' THEN RAISE; END IF; END;
 -- Le stesse regole del modulo devono restare obbligatorie anche chiamando direttamente le API.
 BEGIN PERFORM public.save_organizer_event(NULL,event_data||jsonb_build_object('end_date',current_date+29)); RAISE EXCEPTION 'Fine prima di inizio accettata'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN PERFORM public.save_organizer_event(NULL,event_data||jsonb_build_object('end_date',current_date+397)); RAISE EXCEPTION 'Durata oltre 366 giorni accettata'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN PERFORM public.save_organizer_event(NULL,event_data||jsonb_build_object('application_deadline',current_date+31)); RAISE EXCEPTION 'Scadenza dopo inizio accettata'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN PERFORM public.save_organizer_event(NULL,event_data||'{"description":"Troppo breve"}'); RAISE EXCEPTION 'Descrizione breve accettata'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN PERFORM public.save_organizer_event(NULL,event_data||'{"sectors":[]}'); RAISE EXCEPTION 'Nessun settore accettato'; EXCEPTION WHEN check_violation THEN NULL; END;
 BEGIN
  data:=public.save_organizer_event(NULL,event_data||jsonb_build_object('start_date',current_date-2,'end_date',current_date-1));
  PERFORM public.submit_organizer_event((data->>'id')::uuid,(data->>'revision')::integer);RAISE EXCEPTION 'Invio evento passato accettato';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'La data di inizio%' THEN RAISE; END IF;END;
 BEGIN
  data:=public.save_organizer_event(NULL,event_data||'{"participation_rules":""}');
  PERFORM public.submit_organizer_event((data->>'id')::uuid,(data->>'revision')::integer);RAISE EXCEPTION 'Invio senza condizioni accettato';
 EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Descrivi le condizioni%' THEN RAISE; END IF;END;
 e:=public.save_organizer_event(NULL,event_data); event_id:=(e->>'id')::uuid;
 IF e->>'status'<>'draft' OR (e->>'bookings_enabled')::boolean OR (e->>'organizer_id')::uuid<>owner_id THEN RAISE EXCEPTION 'Pubblicazione o proprietà manomettibile'; END IF;
 BEGIN PERFORM public.submit_organizer_event(event_id,(e->>'revision')::integer); RAISE EXCEPTION 'Invio senza posteggi'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Aggiungi almeno%' THEN RAISE; END IF; END;
 BEGIN PERFORM public.save_event_place(event_id,NULL,'{"label":"Banco QA","quantity":0,"price_cents":10000}',(e->>'revision')::integer);RAISE EXCEPTION 'Quantità nulla accettata';EXCEPTION WHEN check_violation THEN NULL;END;
 BEGIN PERFORM public.save_event_place(event_id,NULL,'{"label":"Banco QA","quantity":1,"price_cents":-1}',(e->>'revision')::integer);RAISE EXCEPTION 'Prezzo negativo accettato';EXCEPTION WHEN check_violation THEN NULL;END;
 s:=public.save_event_place(event_id,NULL,'{"label":"Banco 3 x 3","quantity":2,"price_cents":10000,"width_m":3,"depth_m":3}',(e->>'revision')::integer);place_id:=(s->>'id')::uuid;
 e:=public.organizer_workspace()->'events'->0;
 PERFORM public.submit_organizer_event(event_id,(e->>'revision')::integer);
 EXECUTE 'RESET ROLE';
 IF jsonb_array_length(public.published_organizer_events(event_id))<>0 THEN RAISE EXCEPTION 'Bozza pubblica'; END IF;
 PERFORM set_config('request.jwt.claim.sub',buyer_id::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 IF jsonb_array_length(public.organizer_workspace()->'events')<>0 THEN RAISE EXCEPTION 'Eventi di altro utente'; END IF;
 BEGIN PERFORM public.save_organizer_event(event_id,event_data,2); RAISE EXCEPTION 'Modifica altrui'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM public.reserve_event_place(place_id,1,request_id); RAISE EXCEPTION 'Prenotazioni anticipate'; EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'Prenotazioni online non ancora attive.' THEN RAISE; END IF; END;
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',admin_id::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 data:=public.admin_event_workspace(); SELECT (x->>'revision')::integer INTO rev FROM jsonb_array_elements(data->'events') x WHERE x->>'id'=event_id::text;
 PERFORM public.review_organizer_event(event_id,'published','Approvazione di collaudo',rev);
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub','',true); EXECUTE 'SET LOCAL ROLE anon';
 data:=public.published_organizer_events(event_id);
 IF jsonb_array_length(data)<>1 OR data::text LIKE '%REFERENTE_PRIVATO_QA%' OR data::text LIKE '%private_phone%' OR data::text LIKE '%review_note%' OR data::text LIKE '%stripe_%' THEN RAISE EXCEPTION 'Proiezione pubblica errata'; END IF;
 p:=public.published_organizer_profile(owner_id);
 IF p ? 'contact_name' OR p ? 'private_phone' OR p ? 'review_note' OR p->>'organization_name'<>'QA Organizzatore transazionale' THEN RAISE EXCEPTION 'Profilo pubblico privato'; END IF;
 EXECUTE 'RESET ROLE';
 -- Anche un altro organizzatore approvato deve restare isolato.
 PERFORM set_config('request.jwt.claim.sub',buyer_id::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 p:=public.save_organizer_profile(profile_data||'{"organization_name":"QA Secondo organizzatore"}');
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',admin_id::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 PERFORM public.review_organizer(buyer_id,'approved','',(p->>'revision')::integer);
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',buyer_id::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 BEGIN PERFORM public.save_organizer_event(event_id,event_data,4); RAISE EXCEPTION 'Altro organizzatore modifica evento'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 BEGIN PERFORM public.save_event_place(event_id,place_id,'{"label":"Intrusione","quantity":100,"price_cents":1}',4); RAISE EXCEPTION 'Altro organizzatore modifica posteggi'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 e:=public.organizer_workspace()->'events'->0;
 e:=public.save_organizer_event(event_id,event_data||'{"title":"QA Evento modificato"}',(e->>'revision')::integer);
 IF e->>'status'<>'draft' OR jsonb_array_length(public.published_organizer_events(event_id))<>0 THEN RAISE EXCEPTION 'Modifiche senza riapprovazione'; END IF;
 PERFORM public.submit_organizer_event(event_id,(e->>'revision')::integer);
 EXECUTE 'RESET ROLE';
 SELECT revision INTO rev FROM public.organizer_events WHERE id=event_id;
 PERFORM set_config('request.jwt.claim.sub',admin_id::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 PERFORM public.review_organizer_event(event_id,'published','',rev);
 EXECUTE 'RESET ROLE';
 SELECT revision INTO rev FROM public.organizer_profiles WHERE user_id=owner_id;
 PERFORM set_config('request.jwt.claim.sub',admin_id::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 PERFORM public.review_organizer(owner_id,'suspended','Sospensione di collaudo',rev);
 IF jsonb_array_length(public.published_organizer_events(event_id))<>0 THEN RAISE EXCEPTION 'Eventi di sospeso pubblici'; END IF;
 PERFORM public.review_organizer(owner_id,'approved','',rev+1);
 EXECUTE 'RESET ROLE';
 -- Predisposizione futura, abilitata ESCLUSIVAMENTE all’interno di questo ROLLBACK.
 UPDATE event_private.settings SET bookings_enabled=true;
 UPDATE public.organizer_events SET bookings_enabled=true WHERE id=event_id;
 INSERT INTO event_private.connected_accounts(organizer_id,stripe_account_id,transfers_ready) VALUES(owner_id,'acct_qa_transaction_only',true);
 PERFORM set_config('request.jwt.claim.sub',buyer_id::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 reserved:=public.reserve_event_place(place_id,1,request_id);booking_id:=(reserved->>'id')::uuid;
 IF (reserved->>'total_cents')::integer<>10000 OR (reserved->>'commission_cents')::integer<>800 OR (reserved->>'organizer_cents')::integer<>9200 THEN RAISE EXCEPTION 'Ripartizione 8%% non corretta'; END IF;
 IF public.reserve_event_place(place_id,1,request_id)->>'id'<>reserved->>'id' THEN RAISE EXCEPTION 'Idempotenza'; END IF;
 BEGIN PERFORM public.reserve_event_place(place_id,2,request_id);RAISE EXCEPTION 'Idempotenza senza controllo carrello';EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Richiesta già usata%' THEN RAISE;END IF;END;
 BEGIN PERFORM public.reserve_event_place(place_id,2,gen_random_uuid());RAISE EXCEPTION 'Sovraprenotazione';EXCEPTION WHEN raise_exception THEN IF SQLERRM<>'Posti insufficienti' THEN RAISE;END IF;END;
 EXECUTE 'RESET ROLE';
 UPDATE public.event_bookings SET expires_at=now()-interval '1 second' WHERE id=booking_id;
 PERFORM set_config('request.jwt.claim.sub',outsider_id::text,true);EXECUTE 'SET LOCAL ROLE authenticated';
 reserved:=public.reserve_event_place(place_id,2,gen_random_uuid());
 IF (reserved->>'quantity')::integer<>2 THEN RAISE EXCEPTION 'Scadenza blocco posti';END IF;
 EXECUTE 'RESET ROLE';
 -- Importi piccoli e arrotondamento, verificati sulle colonne generate reali.
 FOREACH item IN ARRAY ARRAY[1,6,7,19,99,100,101,9999,10000,10000000] LOOP
  INSERT INTO public.event_bookings(buyer_id,organizer_id,event_id,place_id,request_key,quantity,event_title,organization_name,place_label,start_date,end_date,unit_price_cents,total_cents)
  VALUES(buyer_id,owner_id,event_id,place_id,gen_random_uuid(),1,'QA','QA','QA',current_date+30,current_date+31,item,item) RETURNING id INTO booking_id;
  IF NOT EXISTS(SELECT 1 FROM public.event_bookings WHERE id=booking_id AND commission_cents+organizer_cents=total_cents AND commission_cents=round(total_cents*0.08)) THEN RAISE EXCEPTION 'Arrotondamento %',item;END IF;
 END LOOP;
 IF NOT EXISTS(SELECT 1 FROM event_private.audit WHERE entity_id=event_id) THEN RAISE EXCEPTION 'Audit assente'; END IF;
 BEGIN UPDATE public.event_bookings SET unit_price_cents=1,total_cents=quantity WHERE id=booking_id;RAISE EXCEPTION 'Prezzo storico riscrivibile';EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Dati economici%' THEN RAISE;END IF;END;
 BEGIN DELETE FROM public.event_bookings WHERE id=booking_id;RAISE EXCEPTION 'Storico cancellabile';EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Lo storico delle prenotazioni%' THEN RAISE;END IF;END;
END $$;
SELECT jsonb_build_object('passed',true,'rollback',true,'checks',ARRAY['authorization','ownership','double moderation','stale revisions','geography','public privacy','edit reapproval','suspension','bookings disabled','8 percent','idempotency','inventory','expired holds']) AS result;
ROLLBACK;
