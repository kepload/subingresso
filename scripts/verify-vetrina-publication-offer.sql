-- Run with the migration in the same transaction, ending in ROLLBACK.
CREATE OR REPLACE FUNCTION pg_temp.reject_publication_offer(sid text, owner_id uuid, listing_id uuid, amount integer)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    BEGIN
        PERFORM public.register_vetrina_publication_checkout(sid,owner_id,listing_id,amount);
    EXCEPTION WHEN OTHERS THEN RETURN;
    END;
    RAISE EXCEPTION 'Ineligible publication offer accepted';
END $$;
DO $$
DECLARE ids uuid[]; owner_id uuid; sid text := 'cs_test_publication_'||pg_backend_pid();
        r jsonb; ending timestamptz;
BEGIN
    IF has_function_privilege('anon','public.register_vetrina_publication_checkout(text,uuid,uuid,integer)','EXECUTE')
       OR has_function_privilege('authenticated','public.register_vetrina_publication_checkout(text,uuid,uuid,integer)','EXECUTE') THEN
        RAISE EXCEPTION 'Publication offer RPC exposed';
    END IF;
    SELECT array_agg(id) INTO ids FROM (SELECT a.id FROM public.annunci a
        WHERE a.status='active' AND a.is_demo IS NOT TRUE AND NOT coalesce(a.featured,false)
        AND cardinality(data_quality.listing_issues(to_jsonb(a)))=0
        AND NOT EXISTS(SELECT 1 FROM public.payments p WHERE p.annuncio_id=a.id) ORDER BY a.id LIMIT 2) q;
    IF cardinality(ids)<>2 THEN RAISE EXCEPTION 'Need two existing unpaid listings for rollback fixture'; END IF;
    PERFORM set_config('request.jwt.claims','{"role":"service_role"}',true);
    SELECT user_id INTO owner_id FROM public.annunci WHERE id=ids[1];
    UPDATE public.annunci SET created_at=now()-interval '11 minutes',featured_since=NULL,expires_at=now()+interval '100 days' WHERE id=ids[1];
    PERFORM pg_temp.reject_publication_offer(sid,owner_id,ids[1],22410);
    UPDATE public.annunci SET created_at=now()+interval '1 minute' WHERE id=ids[1];
    PERFORM pg_temp.reject_publication_offer(sid,owner_id,ids[1],22410);
    UPDATE public.annunci SET created_at=now()-interval '1 second',featured_since=now() WHERE id=ids[1];
    PERFORM pg_temp.reject_publication_offer(sid,owner_id,ids[1],22410);
    UPDATE public.annunci SET featured_since=NULL,expires_at=now()-interval '1 second' WHERE id=ids[1];
    PERFORM pg_temp.reject_publication_offer(sid,owner_id,ids[1],22410);
    UPDATE public.annunci SET expires_at=now()+interval '100 days',status='pending' WHERE id=ids[1];
    PERFORM pg_temp.reject_publication_offer(sid,owner_id,ids[1],24900);
    PERFORM pg_temp.reject_publication_offer(sid,'00000000-0000-0000-0000-000000000000',ids[1],22410);
    r:=public.register_vetrina_publication_checkout(sid,owner_id,ids[1],22410);
    IF r->>'discount'<>'10' OR NOT EXISTS(SELECT 1 FROM public.payments WHERE checkout_session_id=sid
        AND amount_cents=22410 AND tier='90d' AND bundle_size=1 AND bundle_discount=0 AND list_price_cents=24900) THEN
        RAISE EXCEPTION 'Publication price not frozen';
    END IF;
    PERFORM pg_temp.reject_publication_offer(sid||'_second',owner_id,ids[1],22410);
    UPDATE public.annunci SET created_at=now()-interval '1 day' WHERE id=ids[1];
    r:=public.register_vetrina_publication_checkout(sid,owner_id,ids[1],22410);
    IF r->>'duplicate'<>'true' THEN RAISE EXCEPTION 'Registration replay failed'; END IF;
    BEGIN
        PERFORM public.apply_vetrina_checkout(sid,owner_id,24900,'eur','pi_publication');
        RAISE EXCEPTION 'wrong payment accepted';
    EXCEPTION WHEN OTHERS THEN IF SQLERRM='wrong payment accepted' THEN RAISE; END IF; END;
    r:=public.apply_vetrina_checkout(sid,owner_id,22410,'eur','pi_publication');
    IF r->>'waiting'<>'1' THEN RAISE EXCEPTION 'Pending listing lost purchased days'; END IF;
    UPDATE public.annunci SET status='active' WHERE id=ids[1];
    SELECT featured_until INTO ending FROM public.annunci WHERE id=ids[1];
    IF ending IS NULL OR ending<now()+interval '89 days 23 hours' THEN RAISE EXCEPTION 'Approval did not start 90 days'; END IF;
    r:=public.apply_vetrina_checkout(sid,owner_id,22410,'eur','pi_publication');
    IF r->>'duplicate'<>'true' OR ending IS DISTINCT FROM (SELECT featured_until FROM public.annunci WHERE id=ids[1]) THEN
        RAISE EXCEPTION 'Payment replay changed duration';
    END IF;
    PERFORM public.record_vetrina_refund('pi_publication',2490);
    PERFORM public.record_vetrina_refund('pi_publication',2490);
    IF (SELECT refunded_cents FROM public.payments WHERE checkout_session_id=sid)<>2490 THEN RAISE EXCEPTION 'Partial refund mismatch'; END IF;
    PERFORM public.record_vetrina_refund('pi_publication',22410);
    IF NOT EXISTS(SELECT 1 FROM public.payments WHERE checkout_session_id=sid AND status='refunded' AND refunded_cents=22410) THEN
        RAISE EXCEPTION 'Full refund mismatch';
    END IF;
    SELECT user_id INTO owner_id FROM public.annunci WHERE id=ids[2];
    UPDATE public.annunci SET created_at=now()-interval '1 second',featured_since=NULL,expires_at=now()+interval '100 days' WHERE id=ids[2];
    PERFORM public.register_vetrina_publication_checkout(sid||'_active',owner_id,ids[2],22410);
    PERFORM public.apply_vetrina_checkout(sid||'_active',owner_id,22410,'eur','pi_publication_active');
    IF NOT EXISTS(SELECT 1 FROM public.annunci WHERE id=ids[2] AND featured AND featured_until>=now()+interval '89 days 23 hours') THEN
        RAISE EXCEPTION 'Active listing not promoted';
    END IF;
END $$;
SELECT 'OK: publication offer, freshness, ownership, first checkout, exact cents, pending approval, 90 days, replay, refunds, private permissions' AS publication_checks;
