-- Dichiarazioni del proprietario: mai prezzi di compravendite certificate.
-- Migrazione idempotente. Non ricostruisce esiti o date dello storico.
CREATE TABLE IF NOT EXISTS public.listing_outcomes (
    listing_id uuid PRIMARY KEY REFERENCES public.annunci(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    outcome text NOT NULL CHECK (outcome IN ('sold','rented','neither')),
    final_price numeric(12,2),
    price_period text CHECK (price_period IN ('total','year')),
    source text CHECK (source IN ('subingresso','facebook','other_site','word_of_mouth','other')),
    requested_price numeric,
    listing_offer text,
    price_quality text NOT NULL CHECK (price_quality IN ('missing','plausible','review')),
    reported_at timestamptz NOT NULL DEFAULT now(),
    recorded_txid bigint NOT NULL DEFAULT txid_current(),
    CHECK ((outcome='neither' AND final_price IS NULL AND price_period IS NULL AND source IS NULL AND price_quality='missing')
        OR (outcome IN ('sold','rented') AND source IS NOT NULL
            AND price_period=CASE outcome WHEN 'sold' THEN 'total' ELSE 'year' END
            AND ((final_price IS NULL AND price_quality='missing') OR
                (price_quality IN ('plausible','review') AND final_price>=CASE outcome WHEN 'sold' THEN 100 ELSE 120 END
                AND final_price<=CASE outcome WHEN 'sold' THEN 500000 ELSE 120000 END))))
);
ALTER TABLE public.listing_outcomes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.listing_outcomes FROM PUBLIC, anon, authenticated;
-- Nessuna lettura pubblica, né scrittura diretta: solo le RPC con identità verificata.

CREATE OR REPLACE FUNCTION public.get_my_listing_outcomes()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path=''
AS $fn$
    SELECT coalesce(jsonb_agg(jsonb_build_object('listing_id',o.listing_id,'outcome',o.outcome)), '[]'::jsonb)
    FROM public.listing_outcomes o JOIN public.annunci a ON a.id=o.listing_id AND a.user_id=o.user_id
    WHERE o.user_id=auth.uid() AND a.status<>'deleted';
$fn$;
REVOKE ALL ON FUNCTION public.get_my_listing_outcomes() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_listing_outcomes() TO authenticated;

CREATE OR REPLACE FUNCTION public.record_listing_outcome(p_listing_id uuid, p_outcome text, p_final_price numeric DEFAULT NULL, p_source text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $fn$
DECLARE actor uuid:=auth.uid(); listing public.annunci%ROWTYPE; previous public.listing_outcomes%ROWTYPE;
    quality text:='missing'; offer_matches boolean; min_price numeric; max_price numeric;
BEGIN
    IF actor IS NULL THEN RAISE EXCEPTION 'Accedi per aggiornare il tuo annuncio' USING ERRCODE='42501'; END IF;
    IF p_outcome IS NULL OR p_outcome NOT IN ('sold','rented','neither') THEN
        RAISE EXCEPTION 'Seleziona venduto, affittato o nessuna delle due' USING ERRCODE='22023'; END IF;
    SELECT * INTO listing FROM public.annunci WHERE id=p_listing_id AND user_id=actor FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Annuncio non disponibile per questo account' USING ERRCODE='42501'; END IF;
    IF listing.is_demo THEN RAISE EXCEPTION 'Gli annunci dimostrativi non raccolgono esiti' USING ERRCODE='22023'; END IF;
    IF p_outcome='neither' THEN
        IF p_final_price IS NOT NULL OR p_source IS NOT NULL THEN RAISE EXCEPTION 'Nessun prezzo o canale per questo esito' USING ERRCODE='22023'; END IF;
    ELSE
        IF p_source IS NULL OR p_source NOT IN ('subingresso','facebook','other_site','word_of_mouth','other') THEN
            RAISE EXCEPTION 'Seleziona dove hai trovato la persona' USING ERRCODE='22023'; END IF;
        min_price:=CASE p_outcome WHEN 'sold' THEN 100 ELSE 120 END;
        max_price:=CASE p_outcome WHEN 'sold' THEN 500000 ELSE 120000 END;
        IF p_final_price IS NOT NULL THEN
            IF p_final_price::text IN ('NaN','Infinity','-Infinity') OR p_final_price<min_price OR p_final_price>max_price
                OR p_final_price<>round(p_final_price,2) THEN
                RAISE EXCEPTION 'Controlla l''importo oppure lascia il campo vuoto' USING ERRCODE='22023'; END IF;
            offer_matches:=(p_outcome='sold' AND listing.stato='Vendita') OR (p_outcome='rented' AND listing.stato='Affitto mensile');
            quality:=CASE WHEN NOT coalesce(offer_matches,false) OR listing.prezzo IS NULL
                OR listing.prezzo<min_price OR listing.prezzo>max_price
                OR p_final_price<listing.prezzo*0.2 OR p_final_price>listing.prezzo*3
                THEN 'review' ELSE 'plausible' END;
        END IF;
    END IF;
    SELECT * INTO previous FROM public.listing_outcomes WHERE listing_id=p_listing_id;
    -- Retry dopo risposta persa: stesso esito, senza riscrivere date o generare nuovi eventi.
    IF listing.status='sold' AND previous.outcome=p_outcome AND previous.user_id=actor
        AND previous.final_price IS NOT DISTINCT FROM p_final_price AND previous.source IS NOT DISTINCT FROM p_source THEN
        RETURN jsonb_build_object('ok',true,'outcome',previous.outcome,'price_quality',previous.price_quality,'reported_at',previous.reported_at);
    END IF;
    IF listing.status IS DISTINCT FROM 'active' THEN RAISE EXCEPTION 'L''annuncio non è più disponibile. Ricarica la pagina.' USING ERRCODE='22023'; END IF;
    INSERT INTO public.listing_outcomes(listing_id,user_id,outcome,final_price,price_period,source,requested_price,listing_offer,price_quality,reported_at,recorded_txid)
    VALUES(p_listing_id,actor,p_outcome,p_final_price,CASE p_outcome WHEN 'sold' THEN 'total' WHEN 'rented' THEN 'year' END,p_source,
        listing.prezzo,listing.stato,quality,now(),txid_current())
    ON CONFLICT(listing_id) DO UPDATE SET user_id=excluded.user_id,outcome=excluded.outcome,final_price=excluded.final_price,
        price_period=excluded.price_period,source=excluded.source,requested_price=excluded.requested_price,
        listing_offer=excluded.listing_offer,price_quality=excluded.price_quality,reported_at=excluded.reported_at,recorded_txid=excluded.recorded_txid;
    IF p_outcome IN ('sold','rented') THEN
        -- 'sold' resta lo stato tecnico di chiusura, compatibile con tutte le letture esistenti.
        UPDATE public.annunci SET status='sold' WHERE id=p_listing_id AND user_id=actor;
    END IF;
    RETURN jsonb_build_object('ok',true,'outcome',p_outcome,'price_quality',quality,'reported_at',now());
END $fn$;
REVOKE ALL ON FUNCTION public.record_listing_outcome(uuid,text,numeric,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.record_listing_outcome(uuid,text,numeric,text) TO authenticated;

-- Guardia aggiuntiva necessaria per rendere obbligatorio il mini modulo anche via API.
-- Le funzioni e i trigger precedenti non vengono sostituiti.
CREATE OR REPLACE FUNCTION public.require_listing_outcome()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $fn$
BEGIN
    IF NEW.status='sold' AND OLD.status IS DISTINCT FROM 'sold' AND auth.uid() IS NOT NULL THEN
        IF OLD.status IS DISTINCT FROM 'active' OR NEW.user_id IS DISTINCT FROM auth.uid() OR NOT EXISTS(
            SELECT 1 FROM public.listing_outcomes o WHERE o.listing_id=NEW.id AND o.user_id=NEW.user_id
            AND o.outcome IN ('sold','rented') AND o.recorded_txid=txid_current()
        ) THEN RAISE EXCEPTION 'Completa il modulo Venduto o affittato' USING ERRCODE='42501'; END IF;
    END IF;
    RETURN NEW;
END $fn$;
REVOKE ALL ON FUNCTION public.require_listing_outcome() FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE TRIGGER zz_require_listing_outcome BEFORE UPDATE OF status ON public.annunci
    FOR EACH ROW EXECUTE FUNCTION public.require_listing_outcome();

-- Vista privata per le analisi: soglie e confronto sono filtri, non certificazione.
-- Solo prezzi dichiarati plausibili, esclusi demo, anomalie, mancanti e vecchi 'sold'.
CREATE OR REPLACE VIEW public.listing_outcome_prices AS
SELECT o.listing_id,o.outcome,o.final_price,o.price_period,o.source,o.reported_at,o.requested_price,
    a.regione,a.provincia,a.comune,a.tipo,a.settore,a.superficie
FROM public.listing_outcomes o JOIN public.annunci a ON a.id=o.listing_id AND a.user_id=o.user_id
WHERE o.outcome IN ('sold','rented') AND o.price_quality='plausible' AND o.final_price IS NOT NULL
    AND NOT a.is_demo AND a.status='sold';
REVOKE ALL ON public.listing_outcome_prices FROM PUBLIC, anon, authenticated;
NOTIFY pgrst,'reload schema';
