-- ============================================================
--  SUBINGRESSO.IT — VETRINA WELCOME 10 GIORNI (PRIMO ANNUNCIO)
--  Esegui nel SQL Editor di Supabase.
--  Idempotente: può essere rieseguito senza errori.
-- ============================================================

-- ── 1. Colonna credito su profiles ──────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS vetrina_welcome_days int2 DEFAULT 0;

-- ── 2. Funzione grant_welcome_vetrina ───────────────────────
-- SECURITY DEFINER: gira come superuser → bypassa RLS
-- SET LOCAL session_replication_role='replica': bypassa il trigger enforce_annunci_status
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
    v_credits int2;
BEGIN
    -- Leggo e blocco il profilo (FOR UPDATE previene doppio utilizzo concorrente)
    SELECT vetrina_welcome_days INTO v_credits
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    -- Credito esaurito o profilo non trovato
    IF v_credits IS NULL OR v_credits < 1 THEN
        RETURN false;
    END IF;

    -- Verifico che l'annuncio appartenga davvero a questo utente
    IF NOT EXISTS (
        SELECT 1 FROM public.annunci
        WHERE id = p_annuncio_id AND user_id = p_user_id
    ) THEN
        RETURN false;
    END IF;

    -- Azzero il credito atomicamente (impedisce doppio utilizzo)
    UPDATE public.profiles
    SET vetrina_welcome_days = 0
    WHERE id = p_user_id;

    -- Bypass del trigger enforce_annunci_status per questa transazione
    SET LOCAL session_replication_role = 'replica';

    -- Attivo la vetrina sull'annuncio
    UPDATE public.annunci
    SET featured       = true,
        featured_until = now() + interval '10 days',
        featured_tier  = 'welcome',
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
-- Ora i nuovi utenti ricevono vetrina_welcome_days=10 al momento della registrazione
-- (auth.js → handleRegister upsert), e la funzione RPC consuma il credito una volta sola.
