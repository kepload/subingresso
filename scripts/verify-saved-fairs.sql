BEGIN;
SET LOCAL TIME ZONE 'UTC';
DO $$
DECLARE uid uuid; other_uid uuid; item jsonb; again jsonb; batch jsonb; delivery uuid; saved_id uuid;
 data jsonb; ref date:=((now() AT TIME ZONE 'Europe/Rome')::date+interval '2 years')::date;
 token uuid; payload jsonb:='{"to":["qa@example.invalid"],"subject":"QA rollback"}'::jsonb;
BEGIN
 SELECT id INTO uid FROM public.profiles WHERE NOT coalesce(is_admin,false) ORDER BY id LIMIT 1;
 SELECT id INTO other_uid FROM public.profiles WHERE NOT coalesce(is_admin,false) AND id<>uid ORDER BY id LIMIT 1;
 IF uid IS NULL OR other_uid IS NULL THEN RAISE EXCEPTION 'Account fixture mancanti'; END IF;
 IF has_table_privilege('anon','public.saved_fairs','SELECT,INSERT,UPDATE,DELETE')
 OR has_table_privilege('authenticated','public.saved_fairs','SELECT,INSERT,UPDATE,DELETE')
 OR has_schema_privilege('authenticated','fair_private','USAGE')
 OR has_function_privilege('authenticated','public.claim_fair_reminders(integer,boolean)','EXECUTE')
 OR has_function_privilege('anon','public.my_saved_fairs()','EXECUTE') THEN RAISE EXCEPTION 'Permessi troppo ampi'; END IF;
 IF fair_private.reminder_date('2028-03-31',1)<>'2028-02-29' OR fair_private.reminder_date('2027-03-31',1)<>'2027-02-28'
 OR fair_private.reminder_date('2028-02-29',12)<>'2027-02-28' OR fair_private.reminder_date('2029-02-15',5)<>'2028-09-15'
 THEN RAISE EXCEPTION 'Calcolo mesi errato'; END IF;
 data:=jsonb_build_object('fair_kind','catalog','fair_id','qa-fiera-promemoria-rollback','fair_name','QA fiera transazionale','city','Milano',
 'reference_date',ref,'date_origin','personal','reminder_enabled',true,'months_before',12,'user_id',other_uid);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',uid,'role','authenticated')::text,true);
 PERFORM set_config('request.jwt.claim.sub',uid::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 item:=public.save_fair(data,0); saved_id:=(item->>'id')::uuid;
 IF (item->>'months_before')::integer<>12 OR NOT (item->>'reminder_enabled')::boolean THEN RAISE EXCEPTION 'Salvataggio 12 mesi fallito'; END IF;
 BEGIN PERFORM public.save_fair(data,0); RAISE EXCEPTION 'Conflitto ignorato'; EXCEPTION WHEN serialization_failure THEN NULL; END;
 BEGIN PERFORM public.save_fair(data||jsonb_build_object('months_before',121),1); RAISE EXCEPTION 'Mesi invalidi accettati'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN PERFORM public.save_fair(data||jsonb_build_object('reference_date',current_date+5),1); RAISE EXCEPTION 'Promemoria passato accettato'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 BEGIN PERFORM public.claim_fair_reminders(); RAISE EXCEPTION 'Coda accessibile al browser'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 EXECUTE 'RESET ROLE';
 IF (SELECT user_id FROM public.saved_fairs WHERE id=saved_id)<>uid THEN RAISE EXCEPTION 'Identità falsificabile'; END IF;
 SELECT unsub_token INTO token FROM public.saved_fairs WHERE id=saved_id;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',other_uid,'role','authenticated')::text,true);
 PERFORM set_config('request.jwt.claim.sub',other_uid::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(public.my_saved_fairs()) WHERE value->>'id'=saved_id::text) THEN RAISE EXCEPTION 'Dati di altro utente visibili'; END IF;
 PERFORM public.remove_saved_fair(saved_id,1); EXECUTE 'RESET ROLE';
 IF NOT EXISTS(SELECT 1 FROM public.saved_fairs WHERE id=saved_id) THEN RAISE EXCEPTION 'Rimozione tra utenti'; END IF;
 UPDATE public.saved_fairs SET remind_on='1900-01-01' WHERE id=saved_id;
 PERFORM set_config('request.jwt.claims','{"role":"service_role"}',true); EXECUTE 'SET LOCAL ROLE service_role';
 batch:=public.claim_fair_reminders(1); delivery:=(batch->0->>'delivery_id')::uuid;
 IF jsonb_array_length(batch)<>1 OR batch->0->>'id'<>saved_id::text THEN RAISE EXCEPTION 'Coda dovuta errata'; END IF;
 IF jsonb_array_length(public.claim_fair_reminders(1))<>0 THEN RAISE EXCEPTION 'Lease concorrente ignorata'; END IF;
 IF public.prepare_fair_reminder(delivery,payload)<>payload THEN RAISE EXCEPTION 'Payload non conservato'; END IF;
 IF public.prepare_fair_reminder(delivery,'{"changed":true}'::jsonb)<>payload THEN RAISE EXCEPTION 'Payload di retry mutabile'; END IF;
 PERFORM public.finish_fair_reminder(delivery,'sent','qa-not-sent-real');
 IF jsonb_array_length(public.claim_fair_reminders(1))<>0 THEN RAISE EXCEPTION 'Invio duplicabile'; END IF;
 EXECUTE 'RESET ROLE';
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',uid,'role','authenticated')::text,true);
 PERFORM set_config('request.jwt.claim.sub',uid::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 again:=public.save_fair(data||jsonb_build_object('months_before',5),1);
 IF again->>'sent_at' IS NULL THEN RAISE EXCEPTION 'Invio già effettuato dimenticato'; END IF;
 PERFORM public.remove_saved_fair(saved_id,2);
 again:=public.save_fair(data,0);
 IF again->>'sent_at' IS NULL THEN RAISE EXCEPTION 'Rimuovi/risalva duplica il promemoria'; END IF;
 saved_id:=(again->>'id')::uuid;
 EXECUTE 'RESET ROLE';
 SELECT unsub_token INTO token FROM public.saved_fairs WHERE id=saved_id;
 PERFORM set_config('request.jwt.claims','{"role":"service_role"}',true); EXECUTE 'SET LOCAL ROLE service_role';
 IF NOT public.stop_fair_reminders(token) THEN RAISE EXCEPTION 'Disattivazione fallita'; END IF;
 EXECUTE 'RESET ROLE';
 IF (SELECT reminder_enabled FROM public.saved_fairs WHERE id=saved_id) THEN RAISE EXCEPTION 'Avviso non disattivato'; END IF;
 -- A different edition can receive its own reminder; unknown provider outcomes expire safely.
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',uid,'role','authenticated')::text,true);
 PERFORM set_config('request.jwt.claim.sub',uid::text,true); EXECUTE 'SET LOCAL ROLE authenticated';
 again:=public.save_fair(data||jsonb_build_object('reference_date',ref+10),2);
 EXECUTE 'RESET ROLE';
 UPDATE public.saved_fairs SET remind_on='1900-01-01' WHERE id=saved_id;
 PERFORM set_config('request.jwt.claims','{"role":"service_role"}',true); EXECUTE 'SET LOCAL ROLE service_role';
 batch:=public.claim_fair_reminders(1); delivery:=(batch->0->>'delivery_id')::uuid;
 IF delivery IS NULL THEN RAISE EXCEPTION 'Nuova edizione non avvisabile'; END IF;
 PERFORM public.prepare_fair_reminder(delivery,payload);
 PERFORM public.finish_fair_reminder(delivery,'unknown',NULL,'QA timeout');
 EXECUTE 'RESET ROLE';
 UPDATE fair_private.deliveries SET next_attempt_at=now()-interval '1 hour',uncertain_since=now()-interval '24 hours' WHERE id=delivery;
 PERFORM set_config('request.jwt.claims','{"role":"service_role"}',true); EXECUTE 'SET LOCAL ROLE service_role';
 IF jsonb_array_length(public.claim_fair_reminders(1))<>0 THEN RAISE EXCEPTION 'Invio incerto ritentato oltre la finestra'; END IF;
 EXECUTE 'RESET ROLE';
 IF (SELECT status FROM fair_private.deliveries WHERE id=delivery)<>'needs_review' THEN RAISE EXCEPTION 'Esito incerto perso'; END IF;
END $$;
SELECT jsonb_build_object('passed',true,'email_requests',0,'checks',jsonb_build_array('months and leap years','12 months','ownership and RLS','optimistic concurrency','past dates','leases','immutable retry payload','edition deduplication','remove/resave','unsubscribe','uncertain outcomes')) AS result;
ROLLBACK;
