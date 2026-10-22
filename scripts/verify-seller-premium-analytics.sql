-- Append to the migration before COMMIT and finish with ROLLBACK.
-- Only temporary payments/statistics on existing listings; no Stripe/email calls.
DO $$
DECLARE owner_id uuid; other_id uuid; free_id uuid; ids uuid[]; sid text := 'cs_live_qa_analytics_'||pg_backend_pid();
        result jsonb; listing jsonb; period integer; n integer; expected bigint;
BEGIN
    SELECT user_id INTO owner_id FROM public.annunci WHERE status='active'
        GROUP BY user_id HAVING count(*)>=5 ORDER BY count(*) DESC LIMIT 1;
    SELECT array_agg(id ORDER BY id) INTO ids FROM (
        SELECT id FROM public.annunci WHERE user_id=owner_id AND status='active' ORDER BY id LIMIT 5
    ) a;
    SELECT a.user_id,a.id INTO other_id,free_id FROM public.annunci a JOIN public.profiles p ON p.id=a.user_id
        WHERE a.user_id<>owner_id AND p.is_admin IS NOT TRUE AND a.status='active' LIMIT 1;
    IF array_length(ids,1)<>5 OR other_id IS NULL THEN RAISE EXCEPTION 'Need existing fixtures'; END IF;
    INSERT INTO public.listing_stats_daily(annuncio_id,user_id,day,views,call_clicks)
        VALUES(free_id,other_id,(now() AT TIME ZONE 'UTC')::date,7,3)
        ON CONFLICT(annuncio_id,day) DO UPDATE SET views=listing_stats_daily.views+7,call_clicks=listing_stats_daily.call_clicks+3;
    PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'role','authenticated')::text,true);
    IF public.has_listing_premium_analytics(ids[1]) THEN RAISE EXCEPTION 'Fixture already paid'; END IF;
    INSERT INTO public.payments(user_id,annuncio_id,stripe_session_id,tier,amount_cents,status,activated_at)
        VALUES(owner_id,ids[1],sid||'_single','30d',9900,'succeeded',now()-interval '100 days');
    INSERT INTO public.payments(user_id,annuncio_id,stripe_session_id,checkout_session_id,bundle_size,bundle_discount,list_price_cents,tier,amount_cents,status,activated_at)
        VALUES(owner_id,ids[2],sid||'_bundle:'||ids[2],sid||'_bundle',2,10,9900,'30d',8910,'succeeded',now()-interval '100 days'),
              (owner_id,ids[3],sid||'_bundle:'||ids[3],sid||'_bundle',2,10,9900,'30d',8910,'succeeded',now()-interval '100 days');
    INSERT INTO public.payments(user_id,annuncio_id,stripe_session_id,tier,amount_cents,status)
        VALUES(owner_id,ids[4],sid||'_failed','30d',9900,'failed'),
              (owner_id,ids[4],sid||'_pending','30d',9900,'pending'),
              (owner_id,ids[4],'cs_test_qa_analytics_'||pg_backend_pid(),'30d',9900,'succeeded'),
              (owner_id,ids[5],sid||'_gift','30d',0,'succeeded');
    IF NOT public.has_listing_premium_analytics(ids[1]) OR NOT public.has_listing_premium_analytics(ids[2])
       OR NOT public.has_listing_premium_analytics(ids[3]) OR public.has_listing_premium_analytics(ids[4])
       OR public.has_listing_premium_analytics(ids[5]) THEN RAISE EXCEPTION 'Single/bundle/free gate'; END IF;
    -- Paid items remain unlocked with promotion ends in the past: current featured flags are irrelevant.
    IF EXISTS(SELECT 1 FROM public.payments WHERE stripe_session_id LIKE sid||'%' AND status='succeeded'
              AND amount_cents>0 AND promotion_ends_at>=now()) THEN RAISE EXCEPTION 'Fixture is not expired'; END IF;
    UPDATE public.payments SET status='refunded',refunded_cents=amount_cents WHERE stripe_session_id=sid||'_single';
    IF NOT public.has_listing_premium_analytics(ids[1]) THEN RAISE EXCEPTION 'Acquired access lost'; END IF;
    FOREACH period IN ARRAY ARRAY[7,30,90] LOOP
        result:=public.dashboard_seller_analytics(period);
        FOR listing IN SELECT value FROM jsonb_array_elements(result->'listings') LOOP
            IF (listing->>'id')::uuid=ANY(ids[1:3]) THEN
                IF listing->>'premium_analytics'<>'true' OR NOT (listing ? 'daily') THEN RAISE EXCEPTION 'Paid data missing'; END IF;
                IF (listing->>'period_views')::bigint<>(SELECT COALESCE(sum((d->>'views')::bigint),0) FROM jsonb_array_elements(listing->'daily')d)
                   OR (listing->>'period_messages')::bigint<>(SELECT COALESCE(sum((d->>'messages')::bigint),0) FROM jsonb_array_elements(listing->'daily')d) THEN
                    RAISE EXCEPTION 'Summary/daily totals disagree';
                END IF;
            ELSIF listing->>'premium_analytics'<>'false' OR listing ?| ARRAY['daily','tel_clicks_total','saved_total','msg_total'] THEN
                RAISE EXCEPTION 'Unpaid data leaked';
            END IF;
            SELECT COALESCE(sum(views),0) INTO expected FROM public.listing_stats_daily
                WHERE user_id=owner_id AND annuncio_id=(listing->>'id')::uuid
                AND day BETWEEN (result->>'start_day')::date AND (result->>'end_day')::date;
            IF (listing->>'period_views')::bigint<>expected THEN RAISE EXCEPTION 'Basic views mismatch'; END IF;
        END LOOP;
        result:=public.dashboard_vetrina_stats(period);
        IF jsonb_array_length(result->'listings')<>3 THEN RAISE EXCEPTION 'Vetrina paid isolation'; END IF;
    END LOOP;
    -- Actual authenticated table reads, including a free non-admin account.
    PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',other_id,'role','authenticated')::text,true);
    IF public.has_listing_premium_analytics(ids[1]) THEN RAISE EXCEPTION 'Foreign listing unlocked'; END IF;
    result:=public.dashboard_seller_analytics(30);
    IF EXISTS(SELECT 1 FROM jsonb_array_elements(result->'listings')l WHERE (l->>'id')::uuid=ANY(ids)) THEN RAISE EXCEPTION 'Foreign data leaked'; END IF;
    SET LOCAL ROLE authenticated;
    SELECT count(*) INTO n FROM public.listing_stats_daily WHERE annuncio_id=ANY(ids);
    IF n<>0 THEN RAISE EXCEPTION 'Raw table foreign read'; END IF;
    SELECT count(*) INTO n FROM public.listing_stats_daily WHERE annuncio_id=free_id;
    IF n<>0 THEN RAISE EXCEPTION 'Raw table unpaid owner read'; END IF;
    RESET ROLE;
    PERFORM set_config('request.jwt.claims','{}',true);
    IF public.dashboard_seller_analytics(30)->>'error'<>'unauthorized' THEN RAISE EXCEPTION 'Anonymous access'; END IF;
    IF has_function_privilege('anon','public.has_listing_premium_analytics(uuid)','EXECUTE') THEN RAISE EXCEPTION 'Anonymous helper'; END IF;
END $$;
SELECT 'PASS: paid single/bundle, expired/refunded, free/test/failed/pending/gift, periods, totals, ownership, RLS and anonymous' AS result;

DO $$
DECLARE account record; period integer; result jsonb; listing jsonb; expected bigint; checked integer:=0;
BEGIN
    -- Compare every existing seller and period against the underlying dated records.
    FOR account IN SELECT id FROM public.profiles LOOP
        PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',account.id,'role','authenticated')::text,true);
        FOREACH period IN ARRAY ARRAY[7,30,90] LOOP
            result:=public.dashboard_seller_analytics(period);
            FOR listing IN SELECT value FROM jsonb_array_elements(result->'listings') LOOP
                IF NOT EXISTS(SELECT 1 FROM public.annunci WHERE id=(listing->>'id')::uuid AND user_id=account.id) THEN RAISE EXCEPTION 'Account isolation'; END IF;
                SELECT COALESCE(sum(views),0) INTO expected FROM public.listing_stats_daily
                    WHERE user_id=account.id AND annuncio_id=(listing->>'id')::uuid
                    AND day BETWEEN (result->>'start_day')::date AND (result->>'end_day')::date;
                IF (listing->>'period_views')::bigint<>expected THEN RAISE EXCEPTION 'Period views'; END IF;
                SELECT count(*) INTO expected FROM public.conversazioni c JOIN public.messaggi m ON m.conversazione_id=c.id
                    WHERE c.annuncio_id=(listing->>'id')::uuid AND c.venditore_id=account.id AND c.is_support IS NOT TRUE
                    AND m.mittente_id=c.acquirente_id AND m.mittente_id<>account.id
                    AND (m.created_at AT TIME ZONE 'UTC')::date BETWEEN (result->>'start_day')::date AND (result->>'end_day')::date;
                IF (listing->>'period_messages')::bigint<>expected THEN RAISE EXCEPTION 'Period messages'; END IF;
                IF (listing->>'premium_analytics')::boolean IS DISTINCT FROM public.has_listing_premium_analytics((listing->>'id')::uuid) THEN RAISE EXCEPTION 'Entitlement'; END IF;
                IF listing->>'premium_analytics'='false' AND listing ?| ARRAY['daily','saved_total','tel_clicks_total','msg_total'] THEN RAISE EXCEPTION 'Free advanced data'; END IF;
            END LOOP;
        END LOOP;
        checked:=checked+1;
    END LOOP;
    PERFORM set_config('request.jwt.claims','{}',true);
    RAISE NOTICE 'All % profiles checked for 7/30/90 days',checked;
END $$;
SELECT 'PASS: all profiles, all periods, ownership and exact views/messages' AS result;
