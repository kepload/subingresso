-- ============================================================
--  SUBINGRESSO.IT — LOTTERIA VETRINA WELCOME (PRIMO ANNUNCIO)
--  Probabilità vincita: 0,1% (1 su 1000). Premio: 30 giorni.
--  Condizione: pubblicare entro 30 giorni dall'iscrizione.
--  Esegui nel SQL Editor di Supabase. Idempotente.
-- ============================================================

-- ── 1. Nuova colonna su profiles ────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_lottery_eligible bool DEFAULT true;

-- Migrazione dati esistenti:
-- chi aveva già usato il credito (vetrina_welcome_days=0) → non eleggibile
UPDATE public.profiles
SET welcome_lottery_eligible = false
WHERE vetrina_welcome_days IS NOT NULL AND vetrina_welcome_days = 0
  AND welcome_lottery_eligible = true;

-- ── 2. Funzione grant_welcome_vetrina ───────────────────────
-- SECURITY DEFINER: bypassa RLS
-- SET LOCAL session_replication_role='replica': bypassa trigger enforce_annunci_status
-- FOR UPDATE sul profilo: previene race condition doppio-click
CREATE OR REPLACE FUNCTION public.grant_welcome_vetrina(
    p_annuncio_id uuid,
    p_user_id     uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_eligible   bool;
    v_created_at timestamptz;
BEGIN
    -- Leggo e blocco il profilo (FOR UPDATE previene doppio utilizzo concorrente)
    SELECT welcome_lottery_eligible, created_at INTO v_eligible, v_created_at
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    -- Non eleggibile o profilo non trovato
    IF v_eligible IS NULL OR v_eligible = false THEN
        RETURN false;
    END IF;

    -- Scaduto: più di 30 giorni dall'iscrizione
    IF v_created_at < now() - interval '30 days' THEN
        UPDATE public.profiles SET welcome_lottery_eligible = false WHERE id = p_user_id;
        RETURN false;
    END IF;

    -- Verifico che l'annuncio appartenga davvero a questo utente
    IF NOT EXISTS (
        SELECT 1 FROM public.annunci
        WHERE id = p_annuncio_id AND user_id = p_user_id
    ) THEN
        RETURN false;
    END IF;

    -- Consumo il diritto (un solo tiro per utente, vinca o no)
    UPDATE public.profiles
    SET welcome_lottery_eligible = false
    WHERE id = p_user_id;

    -- Tiro dei dadi: 0,1% di probabilità (1 su 1000)
    IF random() >= 0.001 THEN
        RETURN false;
    END IF;

    -- Bypass del trigger enforce_annunci_status per questa transazione
    SET LOCAL session_replication_role = 'replica';

    -- Attivo la vetrina 30 giorni sull'annuncio
    UPDATE public.annunci
    SET featured       = true,
        featured_until = now() + interval '30 days',
        featured_tier  = 'welcome_lottery',
        featured_since = now()
    WHERE id = p_annuncio_id
      AND user_id = p_user_id;

    RETURN true;
END;
$$;

-- Solo gli utenti autenticati possono chiamare questa funzione
REVOKE ALL ON FUNCTION public.grant_welcome_vetrina(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_welcome_vetrina(uuid, uuid) TO authenticated;

-- ── 3. Reload schema cache ───────────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ✅ FATTO!
-- Nuovi utenti: welcome_lottery_eligible=true al momento dell'upsert profilo (auth.js).
-- Alla pubblicazione del primo annuncio (entro 30gg), viene tirato il dado: 0,1% vince 30gg vetrina.
