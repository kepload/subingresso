-- Eseguire con ROLLBACK: nessun acquisto, rimborso o cancellazione effettivo.
BEGIN;
SET LOCAL TIME ZONE 'UTC';
SELECT set_config('request.jwt.claim.sub','',true), set_config('request.jwt.claims','{}',true);
DO $$
DECLARE target record; other_owner uuid; pid uuid; p public.payments%ROWTYPE; result jsonb;
    session_id text := 'cs_test_account_' || gen_random_uuid();
    intent text := 'pi_account_' || gen_random_uuid();
    stats_count bigint; history_count bigint;
BEGIN
    IF has_any_column_privilege('authenticated','public.payments','UPDATE')
       OR has_table_privilege('authenticated','public.payments','INSERT,DELETE,TRUNCATE')
       OR has_table_privilege('service_role','public.payments','TRUNCATE')
       OR has_table_privilege('authenticated','public.payment_history','SELECT,INSERT,UPDATE,DELETE')
       OR has_function_privilege('anon','public.dashboard_vetrina_account(integer,integer,text)','EXECUTE')
       OR has_function_privilege('authenticated','public.record_vetrina_refund(text,integer)','EXECUTE') THEN
       RAISE EXCEPTION 'Incorrect order permissions';
    END IF;
    SELECT id,user_id,expires_at INTO target FROM public.annunci
    WHERE status='active' AND user_id IS NOT NULL AND (expires_at IS NULL OR expires_at>now()) LIMIT 1;
    SELECT id INTO other_owner FROM public.profiles WHERE id<>target.user_id LIMIT 1;
    IF target.id IS NULL OR other_owner IS NULL THEN RAISE EXCEPTION 'Missing test accounts'; END IF;
    UPDATE public.annunci SET status='pending',featured=false,featured_until=NULL WHERE id=target.id;
    PERFORM public.apply_vetrina_payment(session_id,target.id,target.user_id,'30d',4990,'eur',intent,NULL);
    SELECT * INTO p FROM public.payments WHERE stripe_session_id=session_id; pid:=p.id;
    IF p.listing_id_snapshot IS DISTINCT FROM target.id OR p.listing_title IS NULL OR p.paid_at IS NULL
       OR p.promotion_starts_at IS NOT NULL THEN RAISE EXCEPTION 'Snapshot/approval incorrect'; END IF;
    UPDATE public.annunci SET status='active' WHERE id=target.id;
    SELECT * INTO p FROM public.payments WHERE id=pid;
    IF p.promotion_starts_at IS DISTINCT FROM now() OR p.promotion_ends_at IS DISTINCT FROM now()+interval '30 days'
       THEN RAISE EXCEPTION 'Order schedule incorrect'; END IF;
    PERFORM public.apply_vetrina_payment(session_id||'_renew',target.id,target.user_id,'10d',2490,'eur',intent||'_renew',NULL);
    IF NOT EXISTS (SELECT 1 FROM public.payments WHERE stripe_session_id=session_id||'_renew'
                   AND promotion_starts_at=now()+interval '30 days' AND promotion_ends_at=now()+interval '40 days')
       THEN RAISE EXCEPTION 'Renewal schedule incorrect'; END IF;
    SELECT count(*) INTO history_count FROM public.payment_history WHERE payment_id=pid;
    PERFORM public.apply_vetrina_payment(session_id,target.id,target.user_id,'30d',4990,'eur',intent,NULL);
    IF (SELECT count(*) FROM public.payment_history WHERE payment_id=pid) <> history_count
       THEN RAISE EXCEPTION 'Replay duplicated history'; END IF;
    PERFORM set_config('request.jwt.claim.sub',target.user_id::text,true);
    EXECUTE 'SET LOCAL ROLE authenticated';
    result:=public.dashboard_vetrina_account(30,0,'all');
    IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(result->'orders') o WHERE o->>'id'=pid::text)
       THEN RAISE EXCEPTION 'Owner cannot see order'; END IF;
    IF EXISTS(SELECT 1 FROM jsonb_array_elements(result->'orders') o
              WHERE o->>'id' NOT IN (SELECT id::text FROM public.payments WHERE user_id=target.user_id))
       THEN RAISE EXCEPTION 'Leaked other orders'; END IF;
    EXECUTE 'RESET ROLE';
    PERFORM set_config('request.jwt.claim.sub',other_owner::text,true);
    EXECUTE 'SET LOCAL ROLE authenticated';
    result:=public.dashboard_vetrina_account(7,0,'all');
    IF EXISTS(SELECT 1 FROM jsonb_array_elements(result->'orders') o WHERE o->>'id'=pid::text)
       THEN RAISE EXCEPTION 'Another owner sees order'; END IF;
    EXECUTE 'RESET ROLE';
    PERFORM set_config('request.jwt.claim.sub','',true);
    BEGIN
        PERFORM public.dashboard_vetrina_account(); RAISE EXCEPTION 'Unauthorized accepted';
    EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN
        UPDATE public.payments SET amount_cents=1 WHERE id=pid; RAISE EXCEPTION 'Price tamper accepted';
    EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Dati di acquisto immutabili' THEN RAISE; END IF; END;
    BEGIN
        DELETE FROM public.payments WHERE id=pid; RAISE EXCEPTION 'Order deletion accepted';
    EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Lo storico degli ordini non puo essere cancellato o riscritto' THEN RAISE; END IF; END;
    BEGIN
        UPDATE public.payment_history SET status='failed' WHERE payment_id=pid; RAISE EXCEPTION 'History tamper accepted';
    EXCEPTION WHEN raise_exception THEN IF SQLERRM <> 'Lo storico degli ordini non puo essere cancellato o riscritto' THEN RAISE; END IF; END;
    PERFORM public.record_vetrina_refund(intent,1000);
    PERFORM public.record_vetrina_refund(intent,1000);
    PERFORM public.record_vetrina_refund(intent,500);
    IF (SELECT refunded_cents FROM public.payments WHERE id=pid) <> 1000 THEN RAISE EXCEPTION 'Refund replay incorrect'; END IF;
    PERFORM public.record_vetrina_refund(intent,4990);
    IF NOT EXISTS(SELECT 1 FROM public.payments WHERE id=pid AND status='refunded' AND amount_cents=4990)
       THEN RAISE EXCEPTION 'Full refund lost original amount'; END IF;
    SELECT count(*) INTO stats_count FROM public.vetrina_stats_daily WHERE annuncio_id=target.id;
    DELETE FROM public.annunci WHERE id=target.id;
    IF NOT EXISTS(SELECT 1 FROM public.payments WHERE id=pid AND annuncio_id IS NULL AND listing_id_snapshot=target.id
                   AND listing_title IS NOT NULL) OR (SELECT count(*) FROM public.vetrina_stats_daily WHERE annuncio_id=target.id) <> stats_count
       THEN RAISE EXCEPTION 'Listing deletion lost history/stats'; END IF;
END $$;
SELECT 'OK: owner isolation, immutable orders/history, approval and renewals, refund replay, listing removal retention' AS result;
ROLLBACK;
