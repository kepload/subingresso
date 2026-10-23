-- Eseguire dopo la migrazione nella STESSA transazione, poi ROLLBACK.
DO $test$
DECLARE owner_id uuid; foreign_id uuid; item uuid; other_item uuid; result jsonb; valid_outcome text; valid_price numeric;
    bad numeric; first_time text; before_queue bigint; after_queue bigint;
BEGIN
    SELECT a.id,a.user_id INTO item,owner_id FROM public.annunci a JOIN public.profiles p ON p.id=a.user_id
        WHERE a.status='active' AND NOT a.is_demo AND p.is_admin IS NOT TRUE
        AND a.prezzo BETWEEN 120 AND 120000 AND a.stato IN ('Vendita','Affitto mensile') ORDER BY a.created_at LIMIT 1;
    SELECT a.id,a.user_id INTO other_item,foreign_id FROM public.annunci a
        WHERE a.status='active' AND NOT a.is_demo AND a.user_id<>owner_id LIMIT 1;
    IF item IS NULL OR other_item IS NULL THEN RAISE EXCEPTION 'Missing existing fixtures'; END IF;
    PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'role','authenticated')::text,true);
    SET LOCAL ROLE authenticated;
    BEGIN PERFORM public.record_listing_outcome(other_item,'sold',2000,'subingresso'); RAISE EXCEPTION 'Foreign listing accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN PERFORM 1 FROM public.listing_outcomes; RAISE EXCEPTION 'Raw table readable'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN INSERT INTO public.listing_outcomes(listing_id,user_id,outcome,price_quality) VALUES(item,owner_id,'neither','missing'); RAISE EXCEPTION 'Raw table writable'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN UPDATE public.listing_outcomes SET outcome='sold' WHERE listing_id=item; RAISE EXCEPTION 'Raw table update allowed'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN PERFORM 1 FROM public.listing_outcome_prices; RAISE EXCEPTION 'Private view readable'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN UPDATE public.annunci SET status='sold' WHERE id=item; RAISE EXCEPTION 'Direct close accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    FOREACH bad IN ARRAY ARRAY[0,1,10,99,-100,500001,10000000,'NaN'::numeric,'Infinity'::numeric,100.001] LOOP
        BEGIN PERFORM public.record_listing_outcome(item,'sold',bad,'facebook'); RAISE EXCEPTION 'Invalid sale price accepted: %',bad; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
    END LOOP;
    FOREACH bad IN ARRAY ARRAY[1,10,119,120001,10000000] LOOP
        BEGIN PERFORM public.record_listing_outcome(item,'rented',bad,'facebook'); RAISE EXCEPTION 'Invalid annual rent accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
    END LOOP;
    BEGIN PERFORM public.record_listing_outcome(item,'sold',NULL,NULL); RAISE EXCEPTION 'Missing source accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
    BEGIN PERFORM public.record_listing_outcome(item,'sold',NULL,'invented'); RAISE EXCEPTION 'Unknown source accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
    BEGIN PERFORM public.record_listing_outcome(item,NULL,NULL,NULL); RAISE EXCEPTION 'Missing outcome accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
    BEGIN PERFORM public.record_listing_outcome(item,'neither',100,'other'); RAISE EXCEPTION 'Neither accepts price/source'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
    result:=public.record_listing_outcome(item,'neither');
    IF result->>'ok'<>'true' THEN RAISE EXCEPTION 'Neither failed'; END IF;
    RESET ROLE;
    IF (SELECT status FROM public.annunci WHERE id=item)<>'active' THEN RAISE EXCEPTION 'Neither changed listing'; END IF;
    IF EXISTS(SELECT 1 FROM public.listing_outcome_prices WHERE listing_id=item) THEN RAISE EXCEPTION 'Neither price in stats'; END IF;
    SET LOCAL ROLE authenticated;
    result:=public.record_listing_outcome(item,'sold',NULL,'subingresso');
    first_time:=result->>'reported_at';
    result:=public.record_listing_outcome(item,'sold',NULL,'subingresso');
    IF result->>'reported_at'<>first_time OR result->>'price_quality'<>'missing' THEN RAISE EXCEPTION 'Retry or missing price'; END IF;
    BEGIN PERFORM public.record_listing_outcome(item,'rented',2000,'other'); RAISE EXCEPTION 'Closed outcome overwritten'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
    IF NOT EXISTS(SELECT 1 FROM jsonb_array_elements(public.get_my_listing_outcomes()) r WHERE r->>'listing_id'=item::text AND r->>'outcome'='sold') THEN RAISE EXCEPTION 'Own labels missing'; END IF;
    RESET ROLE;
    IF (SELECT status FROM public.annunci WHERE id=item)<>'sold' THEN RAISE EXCEPTION 'Listing not closed'; END IF;
    IF EXISTS(SELECT 1 FROM public.listing_outcome_prices WHERE listing_id=item) THEN RAISE EXCEPTION 'Missing price in stats'; END IF;
    -- Reset ONLY inside this rollback fixture, service context; no production row persists.
    PERFORM set_config('request.jwt.claims','{}',true);
    UPDATE public.annunci SET status='active' WHERE id=item;
    PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'role','authenticated')::text,true);
    SET LOCAL ROLE authenticated;
    -- Low valid-bound price is retained but excluded if the requested price is far away.
    result:=public.record_listing_outcome(item,'sold',100,'word_of_mouth');
    RESET ROLE;
    IF (SELECT prezzo FROM public.annunci WHERE id=item)>500 AND result->>'price_quality'<>'review' THEN RAISE EXCEPTION 'Outlier accepted'; END IF;
    IF result->>'price_quality'='review' AND EXISTS(SELECT 1 FROM public.listing_outcome_prices WHERE listing_id=item) THEN RAISE EXCEPTION 'Outlier in stats'; END IF;
    PERFORM set_config('request.jwt.claims','{}',true);
    UPDATE public.annunci SET status='active' WHERE id=item;
    -- Guard cannot reuse an outcome from an older transaction.
    UPDATE public.listing_outcomes SET recorded_txid=txid_current()-1 WHERE listing_id=item;
    PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'role','authenticated')::text,true);
    SET LOCAL ROLE authenticated;
    BEGIN UPDATE public.annunci SET status='sold' WHERE id=item; RAISE EXCEPTION 'Stale outcome reused'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    result:=public.record_listing_outcome(item,'rented',3000,'other_site');
    RESET ROLE;
    IF (SELECT outcome FROM public.listing_outcomes WHERE listing_id=item)<>'rented' OR
        (SELECT price_period FROM public.listing_outcomes WHERE listing_id=item)<>'year' THEN RAISE EXCEPTION 'Annual rent not stored'; END IF;
    PERFORM set_config('request.jwt.claims','{}',true);
    UPDATE public.annunci SET status='active' WHERE id=item;
    SELECT CASE stato WHEN 'Vendita' THEN 'sold' ELSE 'rented' END,prezzo INTO valid_outcome,valid_price FROM public.annunci WHERE id=item;
    PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'role','authenticated')::text,true);
    SET LOCAL ROLE authenticated;
    result:=public.record_listing_outcome(item,valid_outcome,valid_price,'subingresso');
    RESET ROLE;
    IF result->>'price_quality'<>'plausible' OR NOT EXISTS(SELECT 1 FROM public.listing_outcome_prices WHERE listing_id=item AND final_price=valid_price) THEN RAISE EXCEPTION 'Plausible declared price missing'; END IF;
    PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',foreign_id,'role','authenticated')::text,true);
    IF EXISTS(SELECT 1 FROM jsonb_array_elements(public.get_my_listing_outcomes()) r WHERE r->>'listing_id'=item::text) THEN RAISE EXCEPTION 'Foreign labels leaked'; END IF;
    PERFORM set_config('request.jwt.claims','{}',true);
    SET LOCAL ROLE anon;
    BEGIN PERFORM public.record_listing_outcome(item,'sold',NULL,'other'); RAISE EXCEPTION 'Anonymous RPC'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    BEGIN PERFORM public.get_my_listing_outcomes(); RAISE EXCEPTION 'Anonymous labels'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    RESET ROLE;
END $test$;
SELECT 'listing outcomes permission, validation, retry, labels and price filters passed' AS result;
