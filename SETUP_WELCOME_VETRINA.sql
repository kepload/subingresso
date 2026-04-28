-- ============================================================
--  SUBINGRESSO.IT — LOTTERIA VETRINA WELCOME
--  Flusso: click popup → dado (0,1%) → risultato immediato
--          → se vince, credito salvato → si applica al primo annuncio pubblicato
--  Scadenza: 30 giorni dall'iscrizione per cliccare. Dopo = perso.
--  Esegui nel SQL Editor di Supabase. Idempotente.
-- ============================================================

-- ── 1. Colonne su profiles ───────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_lottery_eligible bool DEFAULT true;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS welcome_lottery_won bool DEFAULT false;

-- Migrazione dati esistenti:
-- chi aveva già usato il credito (vetrina_welcome_days=0) → non eleggibile
UPDATE public.profiles
SET welcome_lottery_eligible = false
WHERE vetrina_welcome_days IS NOT NULL AND vetrina_welcome_days = 0
  AND welcome_lottery_eligible = true;

-- ── 2. Funzione try_welcome_lottery ─────────────────────────
-- Chiamata al click sul popup. Tira i dadi, segna il risultato.
-- Un solo tiro per utente, indipendentemente dal risultato.
CREATE OR REPLACE FUNCTION public.try_welcome_lottery(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_eligible   bool;
    v_created_at timestamptz;
BEGIN
    SELECT welcome_lottery_eligible, created_at INTO v_eligible, v_created_at
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_eligible IS NULL OR v_eligible = false THEN
        RETURN false;
    END IF;

    -- Scaduto: più di 30 giorni dall'iscrizione
    IF v_created_at < now() - interval '30 days' THEN
        UPDATE public.profiles SET welcome_lottery_eligible = false WHERE id = p_user_id;
        RETURN false;
    END IF;

    -- Consumo il diritto (un solo tiro, vinca o no)
    UPDATE public.profiles SET welcome_lottery_eligible = false WHERE id = p_user_id;

    -- Dado: 0,1% di probabilità (1 su 1000)
    IF random() >= 0.001 THEN
        RETURN false;
    END IF;

    -- Ha vinto! Salvo il credito
    UPDATE public.profiles SET welcome_lottery_won = true WHERE id = p_user_id;
    RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.try_welcome_lottery(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.try_welcome_lottery(uuid) TO authenticated;

-- ── 3. Funzione grant_welcome_vetrina ───────────────────────
-- Chiamata in vendi.html dopo la pubblicazione dell'annuncio.
-- Controlla welcome_lottery_won e applica la vetrina se true.
CREATE OR REPLACE FUNCTION public.grant_welcome_vetrina(
    p_annuncio_id uuid,
    p_user_id     uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_won bool;
BEGIN
    SELECT welcome_lottery_won INTO v_won
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_won IS NULL OR v_won = false THEN
        RETURN false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.annunci
        WHERE id = p_annuncio_id AND user_id = p_user_id
    ) THEN
        RETURN false;
    END IF;

    -- Consumo il credito (una sola applicazione)
    UPDATE public.profiles SET welcome_lottery_won = false WHERE id = p_user_id;

    -- Bypass del trigger enforce_annunci_status per questa transazione
    SET LOCAL session_replication_role = 'replica';

    -- Attivo la vetrina 30 giorni
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

REVOKE ALL ON FUNCTION public.grant_welcome_vetrina(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_welcome_vetrina(uuid, uuid) TO authenticated;

-- ── 4. Reload schema cache ───────────────────────────────────
NOTIFY pgrst, 'reload schema';

-- ✅ FATTO!
-- Flusso completo:
-- 1. Nuovo utente → upsert profilo con welcome_lottery_eligible=true (auth.js)
-- 2. Popup benvenuto → click "Tenta la fortuna" → RPC try_welcome_lottery
--    - Controlla eligible=true E created_at entro 30gg
--    - Tira il dado (0,1%)
--    - Segna eligible=false sempre; se vince segna won=true
--    - Mostra risultato immediato nel popup
-- 3. Utente pubblica annuncio → RPC grant_welcome_vetrina
--    - Controlla won=true, applica 30gg vetrina, segna won=false
