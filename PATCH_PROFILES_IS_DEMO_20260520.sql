-- ============================================================
--  PATCH_PROFILES_IS_DEMO_20260520
--  Estende il pattern is_demo (da annunci) anche a profiles, per
--  escludere i 10 utenti seed (Lucia R., Marco V., Elena R. ...,
--  pattern id 'a1b2c3d4-XXXX-...') dai numeri admin.
--
--  Punti aggiornati:
--   - card "Utenti Iscritti" (dashboard.html, query diretta)
--   - growth chart admin (serie profiles, dashboard.html)
--   - RPC admin_funnel_stats: signups, profile_complete,
--     first_contact_received (escludere venditore_id demo)
--
--  Nota: come per annunci, ADD COLUMN su profiles non eredita SELECT
--  perche' i grant SELECT sono column-level (telefono e' REVOKE per
--  anon). Quindi GRANT SELECT (is_demo) subito - lezione imparata.
-- ============================================================

BEGIN;

-- 1. Colonna is_demo su profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_is_demo
  ON public.profiles (is_demo) WHERE is_demo = true;

-- 1.1 GRANT SELECT esplicito (lezione da is_demo su annunci).
GRANT SELECT (is_demo) ON public.profiles TO authenticated, anon;

-- 2. Marca i 10 utenti seed (Lucia R., Marco V., ecc.)
UPDATE public.profiles
SET is_demo = true
WHERE is_demo = false
  AND id::text LIKE 'a1b2c3d4-%';

-- 3. RPC admin_funnel_stats: filtra is_demo lato profiles ovunque sensato.
-- Logica:
--  - signups / profile_complete: contiamo solo utenti reali.
--  - first_listing: gia' filtra annunci.is_demo = false (i demo annunci
--    sono dell'admin o dei fake users -> esclusi gia').
--  - first_contact_received: escludiamo venditore_id se il profilo e' demo
--    (3 conversazioni con venditore fake al 20 mag 2026, gonfiavano il dato).
--  - first_message_sent: idem per mittente (al 20 mag 2026 = 0 dai fake,
--    ma filtriamo per robustezza).
CREATE OR REPLACE FUNCTION public.admin_funnel_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    is_adm boolean;
    res    json;
BEGIN
    SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false)
        INTO is_adm;
    IF NOT is_adm THEN
        RETURN json_build_object('error', 'forbidden');
    END IF;

    SELECT json_build_object(
        'all_time', json_build_object(
            'signups', (SELECT count(*) FROM public.profiles WHERE is_demo = false),
            'profile_complete', (
                SELECT count(*) FROM public.profiles
                WHERE is_demo = false
                  AND telefono IS NOT NULL AND telefono <> ''
            ),
            'first_listing', (
                SELECT count(DISTINCT user_id) FROM public.annunci
                WHERE status <> 'deleted'
                  AND user_id IS NOT NULL
                  AND is_demo = false
            ),
            'first_contact_received', (
                SELECT count(DISTINCT c.venditore_id) FROM public.conversazioni c
                JOIN public.profiles p ON p.id = c.venditore_id
                WHERE c.venditore_id IS NOT NULL
                  AND p.is_demo = false
            ),
            'first_message_sent', (
                SELECT count(DISTINCT m.mittente_id) FROM public.messaggi m
                JOIN public.profiles p ON p.id = m.mittente_id
                WHERE m.mittente_id IS NOT NULL
                  AND p.is_demo = false
            )
        ),
        'last_30_days', json_build_object(
            'signups', (
                SELECT count(*) FROM public.profiles
                WHERE is_demo = false
                  AND created_at >= now() - interval '30 days'
            ),
            'profile_complete', (
                SELECT count(*) FROM public.profiles
                WHERE is_demo = false
                  AND created_at >= now() - interval '30 days'
                  AND telefono IS NOT NULL AND telefono <> ''
            ),
            'first_listing', (
                SELECT count(DISTINCT a.user_id) FROM public.annunci a
                JOIN public.profiles p ON p.id = a.user_id
                WHERE a.status <> 'deleted'
                  AND a.user_id IS NOT NULL
                  AND a.is_demo = false
                  AND p.is_demo = false
                  AND p.created_at >= now() - interval '30 days'
            ),
            'first_contact_received', (
                SELECT count(DISTINCT c.venditore_id) FROM public.conversazioni c
                JOIN public.profiles p ON p.id = c.venditore_id
                WHERE c.venditore_id IS NOT NULL
                  AND p.is_demo = false
                  AND p.created_at >= now() - interval '30 days'
            ),
            'first_message_sent', (
                SELECT count(DISTINCT m.mittente_id) FROM public.messaggi m
                JOIN public.profiles p ON p.id = m.mittente_id
                WHERE m.mittente_id IS NOT NULL
                  AND p.is_demo = false
                  AND p.created_at >= now() - interval '30 days'
            )
        )
    ) INTO res;
    RETURN res;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_funnel_stats() TO authenticated;

-- 4. Verifica
SELECT json_build_object(
  'colonna_creata', EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='is_demo'),
  'select_granted', EXISTS(
    SELECT 1 FROM information_schema.column_privileges
    WHERE table_schema='public' AND table_name='profiles'
      AND column_name='is_demo' AND grantee='authenticated' AND privilege_type='SELECT'
  ),
  'demo_marcati', (SELECT count(*) FROM public.profiles WHERE is_demo = true),
  'reali_totali', (SELECT count(*) FROM public.profiles WHERE is_demo = false)
) AS verifica;

COMMIT;
