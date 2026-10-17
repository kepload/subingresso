-- Avvisi riservati agli account del sito; le vecchie iscrizioni restano conservate.
BEGIN;

DROP POLICY IF EXISTS "Iscrizione bandi pubblica" ON public.bando_alerts;
REVOKE INSERT ON public.bando_alerts FROM anon, authenticated;

-- Solo le funzioni interne possono leggere i destinatari e l'esistenza dell'account.
CREATE OR REPLACE VIEW public.registered_bando_alerts AS
SELECT b.* FROM public.bando_alerts b
WHERE EXISTS (
    SELECT 1 FROM auth.users u
    WHERE lower(u.email) = lower(b.email)
      AND u.deleted_at IS NULL
      AND NOT coalesce(u.is_anonymous, false)
);
REVOKE ALL ON public.registered_bando_alerts FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.registered_bando_alerts TO service_role;
COMMENT ON VIEW public.registered_bando_alerts IS 'Destinatari avvisi con account esistente, accesso esclusivo service_role.';
NOTIFY pgrst, 'reload schema';

COMMIT;
