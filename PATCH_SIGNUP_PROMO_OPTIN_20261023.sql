-- Explicit signup choice only. No backfill or opt-in for existing accounts.
CREATE OR REPLACE FUNCTION public.capture_signup_vetrina_optin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE metadata jsonb;
BEGIN
 SELECT raw_user_meta_data INTO metadata FROM auth.users WHERE id=NEW.id;
 IF metadata->'promotional_email_opt_in'='true'::jsonb
 AND metadata->>'promotional_email_consent_version'='vetrina-email-20261023' THEN
  INSERT INTO public.vetrina_email_permissions(user_id,source,evidence_note,consented_at)
  VALUES(NEW.id,'explicit_site_optin',
   'Optional unchecked signup checkbox affirmatively selected. Version vetrina-email-20261023: email offers for Vetrine, at most once every 30 days; withdrawal through each email. Privacy link presented.',now())
  ON CONFLICT(user_id) DO NOTHING;
 END IF;
 RETURN NEW;
EXCEPTION WHEN OTHERS THEN
 -- A missing consent fails closed for marketing, without breaking a free account.
 RAISE WARNING 'Signup promotional preference was not recorded';
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.capture_signup_vetrina_optin() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.capture_signup_vetrina_optin() TO service_role;
DROP TRIGGER IF EXISTS zz_capture_signup_vetrina_optin ON public.profiles;
CREATE TRIGGER zz_capture_signup_vetrina_optin AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.capture_signup_vetrina_optin();
