-- ============================================================
--  PATCH_ANNUNCI_IS_DEMO_20260520
--  Aggiunge flag is_demo su annunci per escludere i seed/demo
--  dai numeri admin (dashboard cards, RPC stats, growth chart).
--  Gli annunci demo restano visibili al pubblico su /annunci
--  e nelle card del blog: filtro applicato SOLO ai panel admin.
--
--  Pattern demo identificati il 20 mag 2026:
--   - 11 annunci dell'admin (Ardit Kycyku)
--   - 10 annunci di utenti seed con user_id 'a1b2c3d4-%' (Carla M.,
--     Marco V. ecc., vedi memory project_annunci_demo)
--  Totale: 21 demo su 59 annunci, 42 attivi dei quali ~12 demo.
--
--  Idempotente: ALTER IF NOT EXISTS + UPDATE solo dove serve.
-- ============================================================

BEGIN;

-- 1. Colonna is_demo (default false, niente NOT NULL per non rompere
-- eventuali INSERT senza la colonna dai client che non la conoscono).
ALTER TABLE public.annunci
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_annunci_is_demo
  ON public.annunci (is_demo) WHERE is_demo = true;

-- 1.1 GRANT SELECT esplicito sulla nuova colonna.
-- ATTENZIONE: su annunci ci sono GRANT column-level (PATCH_CONTACT_REVEAL_20260503
-- ha REVOKE su tel/email per authenticated). ADD COLUMN eredita i GRANT
-- table-level (INSERT/UPDATE) ma NON il SELECT che e' column-level esplicito.
-- Senza questo grant, .eq('is_demo', false) lato client fallisce con
-- "permission denied for column is_demo" e la dashboard mostra 0.
GRANT SELECT (is_demo) ON public.annunci TO authenticated, anon;

-- 2. Marca demo: admin + utenti seed pattern a1b2c3d4-*
UPDATE public.annunci
SET is_demo = true
WHERE is_demo = false
  AND (
    user_id IN (SELECT id FROM public.profiles WHERE is_admin = true)
    OR user_id::text LIKE 'a1b2c3d4-%'
  );

-- 3. RPC admin_total_listing_value: escludi is_demo.
CREATE OR REPLACE FUNCTION public.admin_total_listing_value()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin       boolean;
  v_vendita_eur bigint := 0;
  v_affitto_eur bigint := 0;
  v_n_vendita   integer := 0;
  v_n_affitto   integer := 0;
BEGIN
  SELECT COALESCE(is_admin, false) INTO v_admin
  FROM profiles WHERE id = auth.uid();
  IF NOT COALESCE(v_admin, false) THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT
    COALESCE(SUM(GREATEST(prezzo, 1000)), 0),
    COUNT(*)
  INTO v_vendita_eur, v_n_vendita
  FROM annunci
  WHERE status = 'active'
    AND stato  = 'Vendita'
    AND prezzo IS NOT NULL
    AND prezzo > 0
    AND is_demo = false;

  SELECT
    COALESCE(SUM(prezzo * 8), 0),
    COUNT(*)
  INTO v_affitto_eur, v_n_affitto
  FROM annunci
  WHERE status = 'active'
    AND stato  = 'Affitto mensile'
    AND prezzo IS NOT NULL
    AND prezzo > 0
    AND is_demo = false;

  RETURN jsonb_build_object(
    'total_eur',   v_vendita_eur + v_affitto_eur,
    'vendita_eur', v_vendita_eur,
    'affitto_eur', v_affitto_eur,
    'n_vendita',   v_n_vendita,
    'n_affitto',   v_n_affitto,
    'rent_multiplier', 8,
    'civetta_floor', 1000
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_total_listing_value() TO authenticated;

-- 4. RPC admin_listings_per_regione: escludi is_demo.
CREATE OR REPLACE FUNCTION public.admin_listings_per_regione()
RETURNS TABLE (regione text, cnt bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(NULLIF(TRIM(a.regione), ''), 'Senza regione') AS regione,
    COUNT(*)::bigint AS cnt
  FROM public.annunci a
  WHERE a.status = 'active'
    AND a.is_demo = false
  GROUP BY 1
  ORDER BY cnt DESC, regione ASC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_listings_per_regione() FROM public;
REVOKE ALL ON FUNCTION public.admin_listings_per_regione() FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_listings_per_regione() TO authenticated;

-- 5. RPC admin_funnel_stats: escludi is_demo nel calcolo "primo annuncio"
-- (sia all_time che last_30_days). Il count e' "venditori unici con
-- almeno un annuncio reale", coerente con la metrica di funnel.
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
            'signups', (SELECT count(*) FROM public.profiles),
            'profile_complete', (
                SELECT count(*) FROM public.profiles
                WHERE telefono IS NOT NULL AND telefono <> ''
            ),
            'first_listing', (
                SELECT count(DISTINCT user_id) FROM public.annunci
                WHERE status <> 'deleted'
                  AND user_id IS NOT NULL
                  AND is_demo = false
            ),
            'first_contact_received', (
                SELECT count(DISTINCT venditore_id) FROM public.conversazioni
                WHERE venditore_id IS NOT NULL
            ),
            'first_message_sent', (
                SELECT count(DISTINCT mittente_id) FROM public.messaggi
                WHERE mittente_id IS NOT NULL
            )
        ),
        'last_30_days', json_build_object(
            'signups', (
                SELECT count(*) FROM public.profiles
                WHERE created_at >= now() - interval '30 days'
            ),
            'profile_complete', (
                SELECT count(*) FROM public.profiles
                WHERE created_at >= now() - interval '30 days'
                  AND telefono IS NOT NULL AND telefono <> ''
            ),
            'first_listing', (
                SELECT count(DISTINCT a.user_id) FROM public.annunci a
                JOIN public.profiles p ON p.id = a.user_id
                WHERE a.status <> 'deleted'
                  AND a.user_id IS NOT NULL
                  AND a.is_demo = false
                  AND p.created_at >= now() - interval '30 days'
            ),
            'first_contact_received', (
                SELECT count(DISTINCT c.venditore_id) FROM public.conversazioni c
                JOIN public.profiles p ON p.id = c.venditore_id
                WHERE c.venditore_id IS NOT NULL
                  AND p.created_at >= now() - interval '30 days'
            ),
            'first_message_sent', (
                SELECT count(DISTINCT m.mittente_id) FROM public.messaggi m
                JOIN public.profiles p ON p.id = m.mittente_id
                WHERE m.mittente_id IS NOT NULL
                  AND p.created_at >= now() - interval '30 days'
            )
        )
    ) INTO res;
    RETURN res;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_funnel_stats() TO authenticated;

-- 6. Verifica
SELECT json_build_object(
  'colonna_is_demo_creata', EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='annunci' AND column_name='is_demo'),
  'demo_marcati', (SELECT count(*) FROM public.annunci WHERE is_demo = true),
  'demo_attivi', (SELECT count(*) FROM public.annunci WHERE is_demo = true AND status = 'active'),
  'reali_totali', (SELECT count(*) FROM public.annunci WHERE is_demo = false),
  'reali_attivi', (SELECT count(*) FROM public.annunci WHERE is_demo = false AND status = 'active')
) AS verifica;

COMMIT;
