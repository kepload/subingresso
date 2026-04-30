-- ============================================================
--  Subingresso.it — Valutatore Funnel Tracking
--  Eseguire nel SQL Editor di Supabase
--  IDEMPOTENTE: si può rieseguire senza errori
-- ============================================================

-- ── 1. TABELLA ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.valutatore_logs (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token   text        NOT NULL,
    user_id         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
    annuncio_id     uuid        REFERENCES public.annunci(id) ON DELETE SET NULL,

    -- Input (etichette leggibili, non moltiplicatori numerici)
    fatturato       numeric     NOT NULL CHECK (fatturato >= 100),
    frequenza       text,       -- 'settimanale' | 'giornaliero' | 'fiera'
    durata_fiera    text,       -- null | '1_giorno' | 'weekend' | 'settimana_piu'
    stagionalita    text,       -- 'annuale' | 'stagionale'
    zona            text,       -- 'storica_turistica' | 'capoluogo' | 'rionale'
    settore         text,       -- 'alimentare' | 'non_alimentare'
    posizione       text,       -- 'angolare' | 'linea'
    anzianita       text,       -- 'storica' | 'recente'

    -- Output calcolato
    prezzo_min      numeric,
    prezzo_avg      numeric,
    prezzo_max      numeric,
    affitto_annuo   numeric,
    affitto_mensile numeric,

    -- Correlazioni
    created_at          timestamptz DEFAULT now(),
    user_linked_at      timestamptz,
    annuncio_linked_at  timestamptz
);

-- ── 2. RLS ───────────────────────────────────────────────────
ALTER TABLE public.valutatore_logs ENABLE ROW LEVEL SECURITY;

-- Chiunque (anche anonimo) può inserire la propria valutazione
DROP POLICY IF EXISTS "Inserimento valutatore anonimo" ON public.valutatore_logs;
CREATE POLICY "Inserimento valutatore anonimo" ON public.valutatore_logs
    FOR INSERT WITH CHECK (true);

-- Lettura e aggiornamento solo via service_role (admin analytics)
-- Nessuna policy SELECT/UPDATE per utenti normali: la lettura avviene
-- solo dall'admin tramite le edge functions con service_role key.

-- ── 3. RPC: collega session → user al login/registrazione ────
CREATE OR REPLACE FUNCTION public.link_valutatore_to_user(p_session_token text)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE updated_count integer;
BEGIN
    -- Guardie: utente non loggato o token troppo corto → skip silenzioso
    IF auth.uid() IS NULL THEN RETURN 0; END IF;
    IF p_session_token IS NULL OR length(trim(p_session_token)) < 8 THEN RETURN 0; END IF;

    UPDATE public.valutatore_logs
    SET user_id        = auth.uid(),
        user_linked_at = now()
    WHERE session_token = trim(p_session_token)
      AND user_id       IS NULL
      AND created_at    > now() - interval '90 days';

    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$;

-- ── 4. RPC: collega l'annuncio pubblicato all'ultima valutazione ─
CREATE OR REPLACE FUNCTION public.link_valutatore_to_annuncio(p_annuncio_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE log_id uuid;
BEGIN
    IF auth.uid() IS NULL THEN RETURN false; END IF;
    IF p_annuncio_id IS NULL THEN RETURN false; END IF;

    -- Prende il log più recente dell'utente senza annuncio (entro 60 giorni)
    SELECT id INTO log_id
    FROM public.valutatore_logs
    WHERE user_id    = auth.uid()
      AND annuncio_id IS NULL
      AND created_at  > now() - interval '60 days'
    ORDER BY created_at DESC
    LIMIT 1;

    IF log_id IS NULL THEN RETURN false; END IF;

    UPDATE public.valutatore_logs
    SET annuncio_id        = p_annuncio_id,
        annuncio_linked_at = now()
    WHERE id = log_id;

    RETURN true;
END;
$$;

GRANT EXECUTE ON FUNCTION public.link_valutatore_to_user(text)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.link_valutatore_to_annuncio(uuid) TO authenticated;
