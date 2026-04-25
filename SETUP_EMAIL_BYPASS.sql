-- ============================================================
--  SUBINGRESSO.IT — EMAIL BYPASS: tabella pending verifications
--  Esegui nel SQL Editor di Supabase.
-- ============================================================

-- Tabella per utenti registrati durante il rate limit (email non ancora verificata)
CREATE TABLE IF NOT EXISTS public.pending_email_verifications (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
    email           text        NOT NULL,
    created_at      timestamptz DEFAULT now(),
    sent_at         timestamptz,           -- quando è stata inviata l'email di verifica notturna
    verified_at     timestamptz            -- quando l'utente ha cliccato il link
);

ALTER TABLE public.pending_email_verifications ENABLE ROW LEVEL SECURITY;
-- Nessun accesso client-side: solo service_role (Edge Function) legge/scrive

-- Index per query notturna
CREATE INDEX IF NOT EXISTS pev_unsent_idx
  ON public.pending_email_verifications (created_at)
  WHERE sent_at IS NULL;

-- ── Cron notturno: invia email di verifica alle 02:00 ────────
-- La Edge Function "nightly-verify-emails" legge i pending e manda via Resend
DO $$
BEGIN
  PERFORM cron.unschedule('nightly-verify-emails');
EXCEPTION WHEN OTHERS THEN NULL;
END$$;

SELECT cron.schedule(
  'nightly-verify-emails',
  '0 2 * * *',
  $$ SELECT net.http_post(
       url    := current_setting('app.supabase_url') || '/functions/v1/nightly-verify-emails',
       body   := '{}',
       params := jsonb_build_object('apikey', current_setting('app.supabase_anon_key'))
     ); $$
);

NOTIFY pgrst, 'reload schema';
