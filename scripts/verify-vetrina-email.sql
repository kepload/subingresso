-- Execute after migration in the SAME transaction and always ROLLBACK.
DO $$ DECLARE person record; target uuid; candidate jsonb; first_claim jsonb;
 token text; checked integer:=0; original_stats boolean; original_digest boolean;
BEGIN
 IF has_table_privilege('authenticated','public.vetrina_email_permissions','SELECT') OR has_function_privilege('anon','public.claim_vetrina_email(uuid,text,integer)','EXECUTE') THEN RAISE EXCEPTION 'Permissions leaked'; END IF;
 FOR person IN SELECT id FROM public.profiles WHERE NOT coalesce(is_admin,false) AND NOT coalesce(is_demo,false) AND email_stats AND email_digest LOOP
  IF public.vetrina_email_candidate(person.id) IS NOT NULL THEN RAISE EXCEPTION 'Unrecorded consent accepted'; END IF;
  INSERT INTO public.vetrina_email_permissions(user_id,source,evidence_note) VALUES(person.id,'whatsapp_user_attestation','Temporary verification fixture, rolled back.');
  candidate:=public.vetrina_email_candidate(person.id);
  IF candidate IS NOT NULL THEN target:=person.id;EXIT;END IF;
 END LOOP;
 IF target IS NULL THEN RAISE EXCEPTION 'No suitable rollback fixture';END IF;
 checked:=checked+1;
 IF jsonb_array_length(candidate->'listings')<1 THEN RAISE EXCEPTION 'Empty listings';END IF;
 IF (candidate->>'period_end')::date-(candidate->>'period_start')::date<>13 THEN RAISE EXCEPTION 'Not 14 complete days';END IF;
 first_claim:=public.claim_vetrina_email(target,'fixture-first',0);
 IF first_claim IS NULL THEN RAISE EXCEPTION 'First valid claim refused';END IF;
 IF public.claim_vetrina_email(target,'fixture-first',0) IS NOT NULL THEN RAISE EXCEPTION 'Duplicate allowed';END IF;
 IF public.claim_vetrina_email(target,'fixture-second',0) IS NOT NULL THEN RAISE EXCEPTION '30-day cap bypassed';END IF;
 UPDATE public.vetrina_email_log SET created_at=now()-interval '31 days' WHERE id=(first_claim->>'delivery_id')::uuid;
 IF public.vetrina_email_candidate(target) IS NULL THEN RAISE EXCEPTION '30-day release failed';END IF;
 SELECT email_stats,email_digest,unsub_token INTO original_stats,original_digest,token FROM public.profiles WHERE id=target;
 IF NOT public.stop_vetrina_offers(token) OR NOT public.stop_vetrina_offers(token) THEN RAISE EXCEPTION 'Idempotent opt-out failed';END IF;
 IF public.vetrina_email_candidate(target) IS NOT NULL THEN RAISE EXCEPTION 'Revoked permission accepted';END IF;
 IF EXISTS(SELECT 1 FROM public.profiles WHERE id=target AND (email_stats IS DISTINCT FROM original_stats OR email_digest IS DISTINCT FROM original_digest)) THEN RAISE EXCEPTION 'Unrelated preferences changed';END IF;
 UPDATE public.vetrina_email_permissions SET revoked_at=NULL WHERE user_id=target;
 INSERT INTO public.vetrina_email_log(user_id,campaign,variant)
 SELECT id,'fixture-cap',0 FROM public.profiles WHERE id<>target LIMIT 20;
 IF public.claim_vetrina_email(target,'fixture-daily',0) IS NOT NULL THEN RAISE EXCEPTION '24-hour cap bypassed';END IF;
 UPDATE public.vetrina_email_log SET created_at=now()-interval '2 days' WHERE campaign='fixture-cap';
 IF public.claim_vetrina_email(target,'fixture-cap',0) IS NOT NULL THEN RAISE EXCEPTION 'Campaign cap bypassed';END IF;
 IF public.claim_vetrina_email(target,'fixture-third',2) IS NULL THEN RAISE EXCEPTION 'Unrelated campaign blocked';END IF;
 IF public.stop_vetrina_offers('fixture-invalid-token') THEN RAISE EXCEPTION 'Unknown token accepted';END IF;
 RAISE NOTICE 'PASS: consent, eligibility, 14-day UTC data, idempotency, 30-day/24-hour/campaign caps, isolated and repeatable opt-out, service-only permissions. All fixtures rolled back.';
END $$;
SELECT 'PASS: vetrina email database checks (ROLLBACK required)' AS result;
