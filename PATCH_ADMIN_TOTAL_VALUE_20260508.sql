-- PATCH_ADMIN_TOTAL_VALUE_20260508
-- Box admin "Valore Annunci" — totale stimato del valore degli annunci attivi.
-- Vendita: max(prezzo, 1000) per neutralizzare i prezzi civetta.
-- Affitto: prezzo annuale * 8 (capitalizzazione conservativa per stima valore di vendita).
-- Idempotente.

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
    AND prezzo > 0;

  SELECT
    COALESCE(SUM(prezzo * 8), 0),
    COUNT(*)
  INTO v_affitto_eur, v_n_affitto
  FROM annunci
  WHERE status = 'active'
    AND stato  = 'Affitto mensile'
    AND prezzo IS NOT NULL
    AND prezzo > 0;

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
