-- ──────────────────────────────────────────────────────────────
-- PATCH: Chat di Supporto (1-a-1 user ↔ admin, senza annuncio)
-- Data: 2026-05-04
-- ──────────────────────────────────────────────────────────────

-- 1. annuncio_id nullable (le chat supporto non hanno annuncio)
ALTER TABLE public.conversazioni
    ALTER COLUMN annuncio_id DROP NOT NULL;

-- 2. flag is_support
ALTER TABLE public.conversazioni
    ADD COLUMN IF NOT EXISTS is_support boolean NOT NULL DEFAULT false;

-- 3. una sola conv supporto per utente
DROP INDEX IF EXISTS public.uniq_support_per_user;
CREATE UNIQUE INDEX uniq_support_per_user
    ON public.conversazioni(acquirente_id)
    WHERE is_support;

-- 4. RPC che ritorna l'admin a cui dirigere il supporto.
--    SECURITY DEFINER → bypassa eventuali RLS restrittive su profiles.
CREATE OR REPLACE FUNCTION public.support_admin_id()
    RETURNS uuid
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
AS $$
    SELECT id
    FROM public.profiles
    WHERE is_admin = true
    ORDER BY created_at
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.support_admin_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.support_admin_id() TO authenticated;
