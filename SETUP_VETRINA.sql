-- ============================================================
--  SUBINGRESSO.IT — SETUP VETRINA A PAGAMENTO (Stripe)
--  Esegui dopo SETUP_DEF_SUBINGRESSO.sql nel SQL Editor di Supabase.
--  Idempotente: può essere rieseguito senza errori.
-- ============================================================

-- ── 1. COLONNE VETRINA SU ANNUNCI ───────────────────────────
ALTER TABLE public.annunci ADD COLUMN IF NOT EXISTS featured        boolean     DEFAULT false;
ALTER TABLE public.annunci ADD COLUMN IF NOT EXISTS featured_until  timestamptz;
ALTER TABLE public.annunci ADD COLUMN IF NOT EXISTS featured_tier   text;          -- '30d' | '90d'
ALTER TABLE public.annunci ADD COLUMN IF NOT EXISTS featured_since  timestamptz;

-- Index per filtrare velocemente annunci featured attivi
CREATE INDEX IF NOT EXISTS annunci_featured_idx
  ON public.annunci (featured, featured_until)
  WHERE featured = true;


-- ── 2. TABELLA PAGAMENTI (log transazioni) ──────────────────
CREATE TABLE IF NOT EXISTS public.payments (
    id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                 uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    annuncio_id             uuid REFERENCES public.annunci(id)  ON DELETE SET NULL,
    amount_cents            integer     NOT NULL,
    currency                text        DEFAULT 'eur',
    tier                    text        NOT NULL,              -- '30d' | '90d'
    status                  text        DEFAULT 'pending',     -- pending | succeeded | failed | refunded
    stripe_session_id       text        UNIQUE,
    stripe_payment_intent   text,
    customer_email          text,
    created_at              timestamptz DEFAULT now(),
    activated_at            timestamptz
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Utente legge solo i propri pagamenti
DROP POLICY IF EXISTS "Utente legge i propri pagamenti" ON public.payments;
CREATE POLICY "Utente legge i propri pagamenti" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

-- Nessun INSERT/UPDATE/DELETE client-side. Solo service_role (webhook) può scrivere.


-- ── 3. PROTEZIONE ANTI SELF-PROMOZIONE ──────────────────────
-- Modifica trigger esistente per impedire agli utenti di self-promuoversi a featured=true.
-- Solo admin o service_role (auth.uid() IS NULL dentro la edge function con service key) possono.
CREATE OR REPLACE FUNCTION public.enforce_annunci_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Admin: bypass totale
  IF auth.email() = 'kycykuardit@gmail.com' THEN
    RETURN NEW;
  END IF;

  -- Service role (webhook Stripe): bypass totale
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- INSERT utenti normali: status forzato a pending, featured forzato a false
  IF TG_OP = 'INSERT' THEN
    NEW.status         = 'pending';
    NEW.featured       = false;
    NEW.featured_until = NULL;
    NEW.featured_tier  = NULL;
    NEW.featured_since = NULL;
    RETURN NEW;
  END IF;

  -- UPDATE utenti normali
  IF TG_OP = 'UPDATE' THEN
    -- Non possono promuoversi ad 'active'
    IF NEW.status = 'active' AND OLD.status != 'active' THEN
      NEW.status = OLD.status;
    END IF;
    -- Non possono attivare / prolungare la vetrina da soli
    IF NEW.featured IS DISTINCT FROM OLD.featured
       OR NEW.featured_until IS DISTINCT FROM OLD.featured_until
       OR NEW.featured_tier  IS DISTINCT FROM OLD.featured_tier
       OR NEW.featured_since IS DISTINCT FROM OLD.featured_since
    THEN
      NEW.featured       = OLD.featured;
      NEW.featured_until = OLD.featured_until;
      NEW.featured_tier  = OLD.featured_tier;
      NEW.featured_since = OLD.featured_since;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_annunci_status ON public.annunci;
CREATE TRIGGER trg_enforce_annunci_status
  BEFORE INSERT OR UPDATE ON public.annunci
  FOR EACH ROW EXECUTE FUNCTION public.enforce_annunci_status();


-- ── 4. SCADENZA AUTOMATICA (pg_cron) ────────────────────────
-- Ogni giorno alle 03:00 UTC (04:00 ora italiana estiva) disattiva le vetrine scadute.
-- Richiede estensioni pg_cron + pg_net (disponibili su Supabase).

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Funzione che rimuove featured scaduti (chiamabile anche manualmente)
CREATE OR REPLACE FUNCTION public.unfeature_expired()
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.annunci
     SET featured       = false,
         featured_until = NULL,
         featured_tier  = NULL,
         featured_since = NULL
   WHERE featured = true
     AND featured_until IS NOT NULL
     AND featured_until < now();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- Rimuovi schedule vecchio se presente, poi crea
DO $$
BEGIN
  PERFORM cron.unschedule('unfeature-expired-daily');
EXCEPTION WHEN OTHERS THEN NULL;
END$$;

SELECT cron.schedule(
  'unfeature-expired-daily',
  '0 3 * * *',
  $$ SELECT public.unfeature_expired(); $$
);


-- ── 5. RELOAD SCHEMA CACHE ──────────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ✅ SETUP VETRINA COMPLETATO!
--  Ricorda di configurare su Supabase → Edge Functions → Secrets:
--    STRIPE_SECRET_KEY          (sk_live_... o sk_test_...)
--    STRIPE_WEBHOOK_SECRET      (whsec_... generato dopo creare il webhook)
--  E su supabase-config.js / dashboard.html lato client:
--    window.STRIPE_PUBLISHABLE_KEY (pk_live_... o pk_test_...) — già pubblica per design.
