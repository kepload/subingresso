-- Stores the existing internal bearer in Vault without returning it to the client.
-- The cron command contains only the Vault name, never a literal credential.
BEGIN;
DO $$
DECLARE bearer text; secret_id uuid;
BEGIN
 SELECT (regexp_match(pg_get_functiondef('public.notify_alert_on_annunci'::regproc),'Bearer\s+(sb_secret_[A-Za-z0-9_-]+)'))[1] INTO bearer;
 IF bearer IS NULL THEN RAISE EXCEPTION 'Credenziale interna non trovata. Nessun cron creato.'; END IF;
 SELECT id INTO secret_id FROM vault.secrets WHERE name='fair_reminders_bearer';
 IF secret_id IS NULL THEN PERFORM vault.create_secret(bearer,'fair_reminders_bearer','Internal fair reminder worker bearer');
 ELSE PERFORM vault.update_secret(secret_id,bearer); END IF;
END $$;
SELECT cron.schedule('fair-reminders-hourly','15 * * * *', $cron$
 SELECT net.http_post(
  url:='https://mhfbtltgwibwmsudsuvf.supabase.co/functions/v1/fair-reminders',
  headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(SELECT decrypted_secret FROM vault.decrypted_secrets WHERE name='fair_reminders_bearer')),
  body:='{}'::jsonb, timeout_milliseconds:=120000
 );
$cron$);
COMMIT;
