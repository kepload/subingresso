-- Only the new listing's first checkout, within ten minutes of publication.
-- Keep standard checkout, frozen orders, activation, refunds and approval intact.
BEGIN;
CREATE OR REPLACE FUNCTION public.register_vetrina_publication_checkout(
    p_session_id text, p_user_id uuid, p_listing_id uuid, p_expected_amount integer
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE a public.annunci%ROWTYPE;
BEGIN
    IF p_user_id IS NULL OR p_listing_id IS NULL OR p_expected_amount IS DISTINCT FROM 22410
       OR p_session_id IS NULL OR p_session_id !~ '^cs_(live|test)_[A-Za-z0-9_]+$' THEN
        RAISE EXCEPTION 'Invalid publication offer';
    END IF;
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_session_id,0));
    IF EXISTS(SELECT 1 FROM public.payments WHERE checkout_session_id=p_session_id) THEN
        IF (SELECT count(*) FROM public.payments WHERE checkout_session_id=p_session_id)=1
           AND EXISTS(SELECT 1 FROM public.payments WHERE checkout_session_id=p_session_id
               AND user_id=p_user_id AND annuncio_id=p_listing_id AND tier='90d'
               AND amount_cents=22410 AND list_price_cents=24900 AND bundle_size=1 AND bundle_discount=0) THEN
            RETURN jsonb_build_object('duplicate',true);
        END IF;
        RAISE EXCEPTION 'Checkout identity mismatch';
    END IF;
    SELECT * INTO a FROM public.annunci WHERE id=p_listing_id FOR UPDATE;
    IF NOT FOUND OR a.user_id IS DISTINCT FROM p_user_id OR NOT coalesce(a.status IN ('active','pending'),false)
       OR a.created_at IS NULL OR a.created_at<now()-interval '10 minutes' OR a.created_at>now()
       OR (a.expires_at IS NOT NULL AND a.expires_at<=now())
       OR coalesce(a.featured,false) OR a.featured_since IS NOT NULL
       OR EXISTS(SELECT 1 FROM public.payments WHERE annuncio_id=p_listing_id) THEN
        RAISE EXCEPTION 'Publication offer unavailable';
    END IF;
    INSERT INTO public.payments(user_id,annuncio_id,amount_cents,currency,tier,status,stripe_session_id,
                                checkout_session_id,bundle_size,bundle_discount,list_price_cents)
    VALUES(p_user_id,a.id,22410,'eur','90d','pending',p_session_id,p_session_id,1,0,24900);
    RETURN jsonb_build_object('count',1,'total',22410,'discount',10,'offer','publication_90d_v1');
END $$;
REVOKE ALL ON FUNCTION public.register_vetrina_publication_checkout(text,uuid,uuid,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.register_vetrina_publication_checkout(text,uuid,uuid,integer) TO service_role;
COMMIT;
