-- ============================================================
--  Funzione per "Ultimi 5 iscritti" in dashboard admin
--  Bypassa l'Auth Admin REST API (instabile su questo progetto)
--  e legge auth.users direttamente via RPC SECURITY DEFINER.
--
--  ESEGUIRE UNA VOLTA nel SQL Editor di Supabase.
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_get_recent_users(p_limit integer DEFAULT 5)
RETURNS TABLE (
  id              uuid,
  email           text,
  created_at      timestamptz,
  last_sign_in_at timestamptz,
  confirmed_at    timestamptz
)
SECURITY DEFINER
SET search_path = auth, public
LANGUAGE sql
AS $$
  SELECT
    u.id,
    u.email,
    u.created_at,
    u.last_sign_in_at,
    u.email_confirmed_at AS confirmed_at
  FROM auth.users u
  ORDER BY u.created_at DESC
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_recent_users TO service_role;
