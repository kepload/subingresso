-- Prove su annunci esistenti, interamente annullate: nessun acquisto o email reale.
BEGIN;
SET LOCAL TIME ZONE 'UTC';
SELECT set_config('request.jwt.claim.sub', '', true), set_config('request.jwt.claims', '{}', true);
DO $$
DECLARE
    target record;
    other_owner uuid;
    session_one text := 'cs_test_vetrina_' || gen_random_uuid();
    session_two text := 'cs_test_vetrina_' || gen_random_uuid();
    session_three text := 'cs_test_vetrina_' || gen_random_uuid();
    result jsonb;
    expiry timestamptz;
    v_until timestamptz;
    v_since timestamptz;
    v_featured boolean;
    before_stats public.vetrina_stats_daily%ROWTYPE;
    after_stats public.vetrina_stats_daily%ROWTYPE;
BEGIN
    IF has_function_privilege('anon', 'public.apply_vetrina_payment(text,uuid,uuid,text,integer,text,text,text)', 'EXECUTE')
       OR has_function_privilege('authenticated', 'public.apply_vetrina_payment(text,uuid,uuid,text,integer,text,text,text)', 'EXECUTE')
       OR NOT has_function_privilege('service_role', 'public.apply_vetrina_payment(text,uuid,uuid,text,integer,text,text,text)', 'EXECUTE')
       OR has_function_privilege('anon', 'public.dashboard_vetrina_stats(integer)', 'EXECUTE') THEN
        RAISE EXCEPTION 'Payment/stats permissions incorrect';
    END IF;
    SELECT id, user_id, expires_at INTO target FROM public.annunci
    WHERE status = 'active' AND user_id IS NOT NULL AND (expires_at IS NULL OR expires_at > now()) LIMIT 1;
    IF target.id IS NULL THEN RAISE EXCEPTION 'No eligible listing'; END IF;
    SELECT id INTO other_owner FROM public.profiles WHERE id <> target.user_id LIMIT 1;

    UPDATE public.annunci SET status = 'pending', featured = false,
        featured_until = NULL, featured_since = NULL, featured_tier = NULL WHERE id = target.id;
    result := public.apply_vetrina_payment(session_one, target.id, target.user_id, '30d', 4491, 'eur', 'pi_test', NULL);
    IF result->>'waiting_approval' <> 'true'
       OR (SELECT featured FROM public.annunci WHERE id = target.id)
       OR (SELECT activated_at FROM public.payments WHERE stripe_session_id = session_one) IS NOT NULL THEN
        RAISE EXCEPTION 'Pending listing consumed promotion days';
    END IF;
    result := public.apply_vetrina_payment(session_one, target.id, target.user_id, '30d', 4491, 'eur', 'pi_test', NULL);
    IF result->>'duplicate' <> 'true' THEN RAISE EXCEPTION 'Replay not ignored'; END IF;
    PERFORM public.apply_vetrina_payment(session_two, target.id, target.user_id, '10d', 2241, 'eur', 'pi_test2', NULL);

    -- L'utente normale non può approvare né attivare i giorni in attesa.
    PERFORM set_config('request.jwt.claim.sub', target.user_id::text, true);
    PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', target.user_id, 'role', 'authenticated')::text, true);
    EXECUTE 'SET LOCAL ROLE authenticated';
    UPDATE public.annunci SET status = 'active' WHERE id = target.id;
    result := public.dashboard_vetrina_stats(30);
    IF EXISTS (SELECT 1 FROM jsonb_array_elements(result->'listings') l WHERE l->>'id' <> target.id::text
               AND NOT EXISTS (SELECT 1 FROM public.annunci a WHERE a.id::text = l->>'id' AND a.user_id = target.user_id)) THEN
        RAISE EXCEPTION 'Stats exposed another user';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM jsonb_array_elements(result->'listings') l
                   WHERE l->>'id' = target.id::text AND l->>'waiting_days' = '40') THEN
        RAISE EXCEPTION 'Waiting days missing from seller dashboard';
    END IF;
    EXECUTE 'RESET ROLE';
    IF (SELECT status FROM public.annunci WHERE id = target.id) <> 'pending' THEN
        RAISE EXCEPTION 'Owner approved own listing';
    END IF;
    PERFORM set_config('request.jwt.claim.sub', '', true);
    PERFORM set_config('request.jwt.claims', '{}', true);
    UPDATE public.annunci SET status = 'active' WHERE id = target.id;
    SELECT featured_until, featured_since, featured, expires_at INTO v_until, v_since, v_featured, expiry
    FROM public.annunci WHERE id = target.id;
    IF NOT v_featured OR v_until IS DISTINCT FROM now() + interval '40 days' OR v_since IS DISTINCT FROM now()
       OR expiry IS DISTINCT FROM target.expires_at
       OR EXISTS (SELECT 1 FROM public.payments WHERE stripe_session_id IN (session_one, session_two) AND activated_at IS NULL) THEN
        RAISE EXCEPTION 'Approval duration or listing expiry incorrect';
    END IF;
    PERFORM public.apply_vetrina_payment(session_one, target.id, target.user_id, '30d', 4491, 'eur', 'pi_test', NULL);
    IF (SELECT featured_until FROM public.annunci WHERE id = target.id) IS DISTINCT FROM v_until THEN
        RAISE EXCEPTION 'Replay extended promotion';
    END IF;
    PERFORM public.apply_vetrina_payment(session_three, target.id, target.user_id, '90d', 9990, 'eur', 'pi_test3', NULL);
    IF (SELECT featured_until FROM public.annunci WHERE id = target.id) IS DISTINCT FROM v_until + interval '90 days' THEN
        RAISE EXCEPTION 'Renewal lost existing days';
    END IF;
    BEGIN
        PERFORM public.apply_vetrina_payment('cs_test_bad', target.id, other_owner, '10d', 2490, 'eur', NULL, NULL);
        RAISE EXCEPTION 'Owner mismatch accepted';
    EXCEPTION WHEN raise_exception THEN
        IF SQLERRM <> 'Listing ownership mismatch' THEN RAISE; END IF;
    END;

    SELECT * INTO before_stats FROM public.vetrina_stats_daily WHERE annuncio_id = target.id AND day = current_date;
    EXECUTE 'SET LOCAL ROLE anon';
    PERFORM public.track_listing_view(target.id, 'impression');
    PERFORM public.track_listing_view(target.id, 'detail');
    PERFORM public.track_listing_event(target.id, 'whatsapp', 1);
    PERFORM public.track_listing_event(target.id, 'chat', 1);
    EXECUTE 'RESET ROLE';
    SELECT * INTO after_stats FROM public.vetrina_stats_daily WHERE annuncio_id = target.id AND day = current_date;
    IF after_stats.impressions <> COALESCE(before_stats.impressions, 0) + 1
       OR after_stats.detail_views <> COALESCE(before_stats.detail_views, 0) + 1
       OR after_stats.contact_actions <> COALESCE(before_stats.contact_actions, 0) + 2 THEN
        RAISE EXCEPTION 'Real promotion events incorrect';
    END IF;
    PERFORM set_config('request.jwt.claim.sub', target.user_id::text, true);
    EXECUTE 'SET LOCAL ROLE authenticated';
    PERFORM public.track_listing_view(target.id, 'detail');
    PERFORM public.track_listing_event(target.id, 'whatsapp', 1);
    EXECUTE 'RESET ROLE';
    IF EXISTS (SELECT 1 FROM public.vetrina_stats_daily WHERE annuncio_id = target.id AND day = current_date
                AND (detail_views <> after_stats.detail_views OR contact_actions <> after_stats.contact_actions)) THEN
        RAISE EXCEPTION 'Owner activity counted as buyer activity';
    END IF;
    PERFORM set_config('request.jwt.claim.sub', '', true);
    UPDATE public.annunci SET featured_until = now() - interval '1 second' WHERE id = target.id;
    PERFORM public.track_listing_view(target.id, 'detail');
    IF (SELECT detail_views FROM public.vetrina_stats_daily WHERE annuncio_id = target.id AND day = current_date)
       <> after_stats.detail_views THEN RAISE EXCEPTION 'Expired promotion counted'; END IF;
END $$;
SELECT 'OK: waiting approval, owner security, replay, renewals, expiry, real metrics and privacy' AS result;
ROLLBACK;
