-- Progressive bundle pricing only. Existing frozen orders and fulfilment are unchanged.
BEGIN;
CREATE OR REPLACE FUNCTION public.register_vetrina_checkout(p_session_id text, p_user_id uuid, p_listing_ids uuid[], p_tier text, p_creation boolean, p_expected_amount integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE n integer; discount integer; base integer; unit integer; a public.annunci%ROWTYPE;
BEGIN
    n := cardinality(p_listing_ids);
    base := CASE p_tier WHEN '10d' THEN 4900 WHEN '30d' THEN 9900 WHEN '90d' THEN 24900 END;
    IF n IS NULL OR n < 1 OR n > 10 OR base IS NULL OR p_user_id IS NULL
       OR p_session_id IS NULL OR p_session_id !~ '^cs_(live|test)_[A-Za-z0-9_]+$'
       OR n <> (SELECT count(DISTINCT id) FROM unnest(p_listing_ids) id) THEN
        RAISE EXCEPTION 'Invalid checkout';
    END IF;
    discount := (ARRAY[0,10,15,19,23,26,29,32,35,37])[n];
    unit := round(base::numeric * (100-discount)/100)::integer;
    IF p_expected_amount IS DISTINCT FROM unit*n THEN RAISE EXCEPTION 'Price mismatch'; END IF;
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_session_id,0));
    IF EXISTS(SELECT 1 FROM public.payments WHERE checkout_session_id=p_session_id) THEN
        IF (SELECT count(*) FROM public.payments WHERE checkout_session_id=p_session_id
            AND user_id=p_user_id AND annuncio_id=ANY(p_listing_ids) AND tier=p_tier
            AND amount_cents=unit AND bundle_size=n AND bundle_discount=discount) <> n THEN
            RAISE EXCEPTION 'Checkout identity mismatch';
        END IF;
        RETURN jsonb_build_object('duplicate',true);
    END IF;
    PERFORM id FROM public.annunci WHERE id=ANY(p_listing_ids) ORDER BY id FOR UPDATE;
    IF (SELECT count(*) FROM public.annunci WHERE id=ANY(p_listing_ids)) <> n THEN RAISE EXCEPTION 'Listing missing'; END IF;
    FOR a IN SELECT * FROM public.annunci WHERE id=ANY(p_listing_ids) ORDER BY id LOOP
        IF a.user_id IS DISTINCT FROM p_user_id
           OR NOT (a.status='active' OR (coalesce(p_creation,false) AND n=1 AND a.status='pending'))
           OR (a.expires_at IS NOT NULL AND a.expires_at<=now()) THEN RAISE EXCEPTION 'Listing unavailable'; END IF;
        INSERT INTO public.payments(user_id,annuncio_id,amount_cents,currency,tier,status,stripe_session_id,
                                    checkout_session_id,bundle_size,bundle_discount,list_price_cents)
        VALUES(p_user_id,a.id,unit,'eur',p_tier,'pending',
               CASE WHEN n=1 THEN p_session_id ELSE p_session_id||':'||a.id::text END,
               p_session_id,n,discount,base);
    END LOOP;
    RETURN jsonb_build_object('count',n,'total',unit*n,'discount',discount);
END $function$
;
COMMIT;
