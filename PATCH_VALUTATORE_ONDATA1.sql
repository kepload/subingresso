-- ============================================================
--  Subingresso.it — Valutatore Logs: tracking Ondata 1
--  Aggiunge campi non-PII per analytics di acquisizione e qualità lead.
--  IDEMPOTENTE: si può rieseguire senza errori.
-- ============================================================

ALTER TABLE public.valutatore_logs
    ADD COLUMN IF NOT EXISTS referrer            text,
    ADD COLUMN IF NOT EXISTS utm_source          text,
    ADD COLUMN IF NOT EXISTS utm_medium          text,
    ADD COLUMN IF NOT EXISTS utm_campaign        text,
    ADD COLUMN IF NOT EXISTS landing_path        text,
    ADD COLUMN IF NOT EXISTS device_type         text,
    ADD COLUMN IF NOT EXISTS country             text,
    ADD COLUMN IF NOT EXISTS region              text,
    ADD COLUMN IF NOT EXISTS tempo_compilazione_sec integer,
    ADD COLUMN IF NOT EXISTS algoritmo_version   text DEFAULT '1.0';

-- Indice utile per analytics su periodo
CREATE INDEX IF NOT EXISTS idx_valutatore_logs_created_at
    ON public.valutatore_logs (created_at DESC);

-- Indice per filtro geo
CREATE INDEX IF NOT EXISTS idx_valutatore_logs_country
    ON public.valutatore_logs (country)
    WHERE country IS NOT NULL;
