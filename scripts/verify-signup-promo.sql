-- Run with PATCH_SIGNUP_PROMO_OPTIN in the same transaction; always ROLLBACK.
DO $$ DECLARE yes_id uuid:=gen_random_uuid(); no_id uuid:=gen_random_uuid();
 string_id uuid:=gen_random_uuid(); old_id uuid:=gen_random_uuid(); missing_id uuid:=gen_random_uuid();
 initial_permissions integer:=(SELECT count(*) FROM public.vetrina_email_permissions);
BEGIN
 INSERT INTO auth.users(id,email,raw_user_meta_data,created_at,email_confirmed_at,aud,role)
 VALUES
 (yes_id,'yes-'||yes_id||'@example.invalid','{"nome":"Consenso","cognome":"Prova","promotional_email_opt_in":true,"promotional_email_consent_version":"vetrina-email-20261023"}'::jsonb,now(),now(),'authenticated','authenticated'),
 (no_id,'no-'||no_id||'@example.invalid','{"nome":"Nessunconsenso","cognome":"Prova","promotional_email_opt_in":false,"promotional_email_consent_version":"vetrina-email-20261023"}'::jsonb,now(),now(),'authenticated','authenticated'),
 (string_id,'str-'||string_id||'@example.invalid','{"nome":"Testostringa","cognome":"Prova","promotional_email_opt_in":"true","promotional_email_consent_version":"vetrina-email-20261023"}'::jsonb,now(),now(),'authenticated','authenticated'),
 (old_id,'old-'||old_id||'@example.invalid','{"nome":"Versionevecchia","cognome":"Prova","promotional_email_opt_in":true,"promotional_email_consent_version":"unknown-version"}'::jsonb,now(),now(),'authenticated','authenticated'),
 (missing_id,'missing-'||missing_id||'@example.invalid','{"nome":"Sceltaassente","cognome":"Prova"}'::jsonb,now(),now(),'authenticated','authenticated');
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=yes_id) THEN RAISE EXCEPTION 'Auth/profile flow did not run';END IF;
 IF NOT EXISTS(SELECT 1 FROM public.vetrina_email_permissions WHERE user_id=yes_id AND source='explicit_site_optin' AND consented_at IS NOT NULL AND revoked_at IS NULL AND evidence_note LIKE '%vetrina-email-20261023%') THEN RAISE EXCEPTION 'Explicit consent not recorded';END IF;
 IF EXISTS(SELECT 1 FROM public.vetrina_email_permissions WHERE user_id IN(no_id,string_id,old_id,missing_id)) THEN RAISE EXCEPTION 'Absent/false/string/version mismatch opted in';END IF;
 IF (SELECT count(*) FROM public.vetrina_email_permissions)<>initial_permissions+1 THEN RAISE EXCEPTION 'Unrelated permission changed';END IF;
 UPDATE public.vetrina_email_permissions SET revoked_at=now() WHERE user_id=yes_id;
 UPDATE auth.users SET raw_user_meta_data=raw_user_meta_data||'{"promotional_email_opt_in":true}'::jsonb WHERE id=yes_id;
 UPDATE public.profiles SET nome='Consensorevocato' WHERE id=yes_id;
 IF NOT EXISTS(SELECT 1 FROM public.vetrina_email_permissions WHERE user_id=yes_id AND revoked_at IS NOT NULL) THEN RAISE EXCEPTION 'Revocation overwritten by profile/metadata update';END IF;
 IF has_function_privilege('anon','public.capture_signup_vetrina_optin()','EXECUTE') THEN RAISE EXCEPTION 'Trigger callable by anonymous';END IF;
END $$;
SELECT 'PASS: new auth/profile insertion, explicit true and current version only, false/missing/string/old version excluded, consent evidence and timestamp, prior revocation preserved. All fixtures require ROLLBACK.' AS result;
