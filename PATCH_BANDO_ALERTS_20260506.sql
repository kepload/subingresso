-- Fase 1.1 — Schema "Avvisi Bandi" (lead magnet bundle).
-- Chi si iscrive riceve sia gli avvisi sui bandi pubblici sia gli annunci
-- nuovi della stessa regione. Single opt-in, unsub via token in 1 click.

BEGIN;

-- ── bando_alerts ────────────────────────────────────────────
-- Una iscrizione = 1 email + 1 regione. Stessa email può iscriversi a più
-- regioni (UNIQUE composito). Token unsub generato server-side, non derivabile.
CREATE TABLE IF NOT EXISTS public.bando_alerts (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email        text NOT NULL,
    regione      text NOT NULL,
    source       text,                      -- post_slug origine (debug + analytics)
    unsub_token  uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    created_at   timestamptz NOT NULL DEFAULT now(),
    last_listing_sent_at  timestamptz,
    last_bando_digest_sent_at timestamptz,
    UNIQUE (email, regione)
);

CREATE INDEX IF NOT EXISTS idx_bando_alerts_regione    ON public.bando_alerts (regione);
CREATE INDEX IF NOT EXISTS idx_bando_alerts_unsub      ON public.bando_alerts (unsub_token);
CREATE INDEX IF NOT EXISTS idx_bando_alerts_email      ON public.bando_alerts (email);

-- ── bando_alert_log (dedup invio annunci) ───────────────────
-- PK composita: stessa coppia (alert, annuncio) NON può essere notificata 2 volte.
CREATE TABLE IF NOT EXISTS public.bando_alert_log (
    alert_id     uuid NOT NULL REFERENCES public.bando_alerts(id) ON DELETE CASCADE,
    annuncio_id  uuid NOT NULL REFERENCES public.annunci(id) ON DELETE CASCADE,
    sent_at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (alert_id, annuncio_id)
);

-- ── RLS ─────────────────────────────────────────────────────
-- bando_alerts: anon+authenticated possono SOLO inserire (lead magnet pubblico).
-- L'unsub e l'invio passano da Edge Function service-role, che bypassa RLS.
ALTER TABLE public.bando_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Iscrizione bandi pubblica" ON public.bando_alerts;
CREATE POLICY "Iscrizione bandi pubblica"
    ON public.bando_alerts
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

GRANT INSERT ON public.bando_alerts TO anon, authenticated;
-- gen_random_uuid genera id e unsub_token lato DB → niente sequence da grantare.

-- bando_alert_log: nessun accesso pubblico.
ALTER TABLE public.bando_alert_log ENABLE ROW LEVEL SECURITY;
-- (nessuna policy = nessun accesso da anon/authenticated; service_role bypassa)

COMMIT;
