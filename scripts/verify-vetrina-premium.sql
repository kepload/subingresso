-- Run after the migration inside the SAME transaction, then ROLLBACK.
-- No Stripe calls. User data, payment rows and queued trigger work are rolled back.
DO $$
DECLARE owner_id uuid; ids uuid[]; sid text := 'cs_test_premium_'||pg_backend_pid();
        before_dates jsonb; after_dates jsonb; before_expiry jsonb; r jsonb; n integer;
BEGIN
    IF has_function_privilege('anon','public.register_vetrina_checkout(text,uuid,uuid[],text,boolean,integer)','EXECUTE')
       OR has_function_privilege('authenticated','public.apply_vetrina_checkout(text,uuid,integer,text,text)','EXECUTE') THEN
        RAISE EXCEPTION 'Privileged checkout exposed';
    END IF;
    SELECT user_id INTO owner_id FROM public.annunci
    WHERE status='active' AND is_demo IS NOT TRUE AND (expires_at IS NULL OR expires_at>now())
    GROUP BY user_id HAVING count(*)>=5 ORDER BY count(*) DESC LIMIT 1;
    IF owner_id IS NULL THEN RAISE EXCEPTION 'Need an existing seller with five active listings'; END IF;
    SELECT array_agg(id ORDER BY id) INTO ids FROM (
        SELECT id FROM public.annunci WHERE user_id=owner_id AND status='active' AND is_demo IS NOT TRUE
        AND (expires_at IS NULL OR expires_at>now()) ORDER BY id LIMIT 5
    ) a;
    PERFORM set_config('request.jwt.claims',jsonb_build_object('role','service_role')::text,true);
    SELECT jsonb_agg(jsonb_build_array(id,expires_at) ORDER BY id) INTO before_expiry FROM public.annunci WHERE id=ANY(ids);
    PERFORM public.register_vetrina_checkout(sid,owner_id,ids[1:3],'30d',false,25245);
    IF (SELECT count(*) FROM public.payments WHERE checkout_session_id=sid AND amount_cents=8415 AND bundle_discount=15)<>3 THEN RAISE EXCEPTION 'Frozen amounts'; END IF;
    r:=public.register_vetrina_checkout(sid,owner_id,ids[1:3],'30d',false,25245);
    IF r->>'duplicate'<>'true' THEN RAISE EXCEPTION 'Registration replay'; END IF;
    BEGIN
        PERFORM public.apply_vetrina_checkout(sid,owner_id,1,'eur','pi_premium_test');
        RAISE EXCEPTION 'wrong amount accepted';
    EXCEPTION WHEN OTHERS THEN IF SQLERRM='wrong amount accepted' THEN RAISE; END IF; END;
    IF EXISTS(SELECT 1 FROM public.payments WHERE checkout_session_id=sid AND status<>'pending') THEN RAISE EXCEPTION 'Partial fulfilment'; END IF;
    r:=public.apply_vetrina_checkout(sid,owner_id,25245,'eur','pi_premium_test');
    IF (SELECT count(*) FROM public.payments WHERE checkout_session_id=sid AND status='succeeded' AND activated_at IS NOT NULL AND promotion_ends_at>now())<>3 THEN RAISE EXCEPTION 'Bundle not fully activated'; END IF;
    IF (SELECT count(*) FROM public.annunci WHERE id=ANY(ids[1:3]) AND featured AND featured_until>now())<>3 THEN RAISE EXCEPTION 'Listing promotion not applied'; END IF;
    SELECT jsonb_agg(jsonb_build_array(id,featured_until) ORDER BY id) INTO before_dates FROM public.annunci WHERE id=ANY(ids[1:3]);
    r:=public.apply_vetrina_checkout(sid,owner_id,25245,'eur','pi_premium_test');
    SELECT jsonb_agg(jsonb_build_array(id,featured_until) ORDER BY id) INTO after_dates FROM public.annunci WHERE id=ANY(ids[1:3]);
    IF r->>'duplicate'<>'true' OR before_dates IS DISTINCT FROM after_dates THEN RAISE EXCEPTION 'Webhook replay extends days'; END IF;
    PERFORM public.register_vetrina_checkout(sid||'_renew',owner_id,ids[1:2],'10d',false,8820);
    PERFORM public.apply_vetrina_checkout(sid||'_renew',owner_id,8820,'eur','pi_premium_renew');
    IF EXISTS(SELECT 1 FROM public.payments WHERE checkout_session_id=sid||'_renew' AND promotion_starts_at<=now()) THEN RAISE EXCEPTION 'Renewal not appended'; END IF;
    PERFORM public.record_vetrina_refund('pi_premium_test',5000);
    PERFORM public.record_vetrina_refund('pi_premium_test',5000);
    PERFORM public.record_vetrina_refund('pi_premium_test',1000);
    IF (SELECT sum(refunded_cents) FROM public.payments WHERE checkout_session_id=sid)<>5000 THEN RAISE EXCEPTION 'Partial refund totals/replay'; END IF;
    PERFORM public.record_vetrina_refund('pi_premium_test',25245);
    IF (SELECT count(*) FROM public.payments WHERE checkout_session_id=sid AND status='refunded')<>3 THEN RAISE EXCEPTION 'Full refund'; END IF;
    PERFORM public.register_vetrina_checkout(sid||'_five',owner_id,ids,'90d',false,95865);
    IF (SELECT sum(amount_cents) FROM public.payments WHERE checkout_session_id=sid||'_five')<>95865 THEN RAISE EXCEPTION 'Five discount'; END IF;
    BEGIN
        PERFORM public.register_vetrina_checkout(sid||'_dup',owner_id,ARRAY[ids[1],ids[1]],'30d',false,17820);
        RAISE EXCEPTION 'duplicate listing accepted';
    EXCEPTION WHEN OTHERS THEN IF SQLERRM='duplicate listing accepted' THEN RAISE; END IF; END;
    BEGIN
        UPDATE public.payments SET bundle_discount=99 WHERE checkout_session_id=sid||'_five';
        RAISE EXCEPTION 'order mutation accepted';
    EXCEPTION WHEN OTHERS THEN IF SQLERRM='order mutation accepted' THEN RAISE; END IF; END;
    BEGIN
        PERFORM public.register_vetrina_checkout(sid||'_foreign','00000000-0000-0000-0000-000000000000',ids[1:2],'30d',false,17820);
        RAISE EXCEPTION 'foreign owner accepted';
    EXCEPTION WHEN OTHERS THEN IF SQLERRM='foreign owner accepted' THEN RAISE; END IF; END;
    -- One item can be under review when a paid bundle is fulfilled. The existing
    -- approval trigger must start its whole duration exactly once afterwards.
    PERFORM public.register_vetrina_checkout(sid||'_wait',owner_id,ids[4:5],'30d',false,17820);
    UPDATE public.annunci SET status='pending' WHERE id=ids[4];
    r:=public.apply_vetrina_checkout(sid||'_wait',owner_id,17820,'eur','pi_premium_wait');
    IF (r->>'waiting')::integer<>1 THEN RAISE EXCEPTION 'Waiting item lost'; END IF;
    IF (SELECT count(*) FROM public.payments WHERE checkout_session_id=sid||'_wait' AND status='succeeded')<>2 THEN RAISE EXCEPTION 'Waiting bundle partly unpaid'; END IF;
    UPDATE public.annunci SET status='active' WHERE id=ids[4];
    IF EXISTS(SELECT 1 FROM public.payments WHERE checkout_session_id=sid||'_wait' AND activated_at IS NULL) THEN RAISE EXCEPTION 'Approval failed to preserve days'; END IF;
    -- Existing dashboard counts checkouts once, while sums count the allocated cents.
    PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'role','authenticated')::text,true);
    r:=public.dashboard_vetrina_account(30,0,'all');
    IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(r->'orders') x WHERE x->>'bundle_size'='3') THEN RAISE EXCEPTION 'Account bundle metadata missing'; END IF;
    IF before_expiry IS DISTINCT FROM (SELECT jsonb_agg(jsonb_build_array(id,expires_at) ORDER BY id) FROM public.annunci WHERE id=ANY(ids)) THEN RAISE EXCEPTION 'Listing expiry changed'; END IF;
END $$;
SELECT 'OK: bundle 2/3/5, importi, attivazione atomica, rinnovi, replay, rimborsi parziali/totali, permessi, storico e scadenze' AS premium_checks;
