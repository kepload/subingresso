-- Corregge il box admin "Valore totale richiesto".
-- Il campo prezzo degli affitti contiene gia' il canone annuale: va sommato una volta sola.
-- Nessun prezzo minimo artificiale: il totale rispecchia esattamente le cifre pubblicate.

CREATE OR REPLACE FUNCTION public.admin_total_listing_value()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vendita_eur bigint := 0;
  v_affitto_eur bigint := 0;
  v_n_vendita   integer := 0;
  v_n_affitto   integer := 0;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(SUM(prezzo), 0), COUNT(*)
  INTO v_vendita_eur, v_n_vendita
  FROM public.annunci
  WHERE status = 'active'
    AND stato = 'Vendita'
    AND prezzo IS NOT NULL
    AND prezzo > 0
    AND is_demo = false;

  SELECT COALESCE(SUM(prezzo), 0), COUNT(*)
  INTO v_affitto_eur, v_n_affitto
  FROM public.annunci
  WHERE status = 'active'
    AND stato IN ('Affitto', 'Affitto mensile')
    AND prezzo IS NOT NULL
    AND prezzo > 0
    AND is_demo = false;

  RETURN jsonb_build_object(
    'total_eur',   v_vendita_eur + v_affitto_eur,
    'vendita_eur', v_vendita_eur,
    'affitto_eur', v_affitto_eur,
    'n_vendita',   v_n_vendita,
    'n_affitto',   v_n_affitto,
    'rent_years',  1
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_total_listing_value() TO authenticated;
