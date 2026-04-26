-- ============================================================
--  SUBINGRESSO.IT - PATCH PERFORMANCE + SICUREZZA
--  Data: 2026-04-26
--
--  Esegui questo file nel SQL Editor Supabase.
--  Non cancella dati. Aggiunge indici e rinforza la RPC welcome.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Indici per velocizzare annunci.html, dashboard e profili
-- ------------------------------------------------------------

create index if not exists idx_annunci_status_created_at
  on public.annunci (status, created_at desc);

create index if not exists idx_annunci_status_regione_created_at
  on public.annunci (status, regione, created_at desc);

create index if not exists idx_annunci_status_comune_created_at
  on public.annunci (status, comune, created_at desc);

create index if not exists idx_annunci_status_tipo_created_at
  on public.annunci (status, tipo, created_at desc);

create index if not exists idx_annunci_status_stato_created_at
  on public.annunci (status, stato, created_at desc);

create index if not exists idx_annunci_status_prezzo
  on public.annunci (status, prezzo);

create index if not exists idx_annunci_status_superficie
  on public.annunci (status, superficie);

create index if not exists idx_annunci_user_status_created_at
  on public.annunci (user_id, status, created_at desc);

create index if not exists idx_annunci_featured_until
  on public.annunci (featured, featured_until);

create index if not exists idx_profiles_id_avatar_nome
  on public.profiles (id, avatar_url, nome);

-- ------------------------------------------------------------
-- 2. Vetrina welcome: impedisce chiamate per conto di altri user
-- ------------------------------------------------------------

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
    IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    SELECT vetrina_welcome_days INTO v_credits
    FROM public.profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_credits IS NULL OR v_credits < 1 THEN
        RETURN false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM public.annunci
        WHERE id = p_annuncio_id AND user_id = p_user_id
    ) THEN
        RETURN false;
    END IF;

    UPDATE public.profiles
    SET vetrina_welcome_days = 0
    WHERE id = p_user_id;

    SET LOCAL session_replication_role = 'replica';

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

REVOKE ALL ON FUNCTION public.grant_welcome_vetrina(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_welcome_vetrina(uuid, uuid) TO authenticated;

NOTIFY pgrst, 'reload schema';
