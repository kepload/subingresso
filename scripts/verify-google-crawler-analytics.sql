-- Funzioni reali e tabelle temporanee; nessuna riga di prova nei dati del sito.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
CREATE TEMP TABLE qa_google_measurements (
    visitor_id text,
    session_id text,
    user_id uuid,
    created_at timestamptz DEFAULT now(),
    payload text NOT NULL
);
CREATE TRIGGER a0_exclude_google_crawler BEFORE INSERT ON qa_google_measurements
FOR EACH ROW EXECUTE FUNCTION data_quality.guard_google_crawler_measurement();
CREATE TRIGGER analytics_exclude_actor BEFORE INSERT ON qa_google_measurements
FOR EACH ROW EXECUTE FUNCTION data_quality.guard_analytics_actor();

DO $test$
DECLARE
    ipv4 text;
    ipv6 text;
    first4 text;
    last4 text;
    example record;
    actual boolean;
    cases integer := 0;
    internal_id uuid;
    n integer;
    total_before bigint;
    event_id uuid := gen_random_uuid();
BEGIN
    SELECT host(network::inet + 1), host(network::inet), host(broadcast(network::inet))
    INTO STRICT ipv4, first4, last4
    FROM data_quality.analytics_google_crawler_ranges WHERE family(network) = 4 AND masklen(network) < 32 LIMIT 1;
    SELECT host(network::inet + 1) INTO STRICT ipv6
    FROM data_quality.analytics_google_crawler_ranges WHERE family(network) = 6 LIMIT 1;

    FOR example IN SELECT * FROM (VALUES
        ('no headers', '{}'::jsonb, false),
        ('normal browser', jsonb_build_object('user-agent', 'Mozilla/5.0 Chrome/157.0'), false),
        ('Google search app', jsonb_build_object('user-agent', 'Mozilla/5.0 GSA/447.9 Mobile/15E148'), false),
        ('Google search referrer', jsonb_build_object('referer', 'https://www.google.com/'), false),
        ('Googlebot UA', jsonb_build_object('user-agent', 'Mozilla/5.0 (compatible; Googlebot/2.1)'), true),
        ('Googlebot case', jsonb_build_object('user-agent', 'googlebot-image/1.0'), true),
        ('GoogleOther', jsonb_build_object('user-agent', 'GoogleOther'), true),
        ('Inspection tool', jsonb_build_object('user-agent', 'Google-InspectionTool/1.0'), true),
        ('IPv4', jsonb_build_object('cf-connecting-ip', ipv4), true),
        ('IPv4 range start', jsonb_build_object('cf-connecting-ip', first4), true),
        ('IPv4 range end', jsonb_build_object('cf-connecting-ip', last4), true),
        ('IPv6', jsonb_build_object('cf-connecting-ip', ipv6), true),
        ('IPv4 mapped', jsonb_build_object('cf-connecting-ip', '::ffff:' || ipv4), true),
        ('real IP fallback', jsonb_build_object('x-real-ip', ipv4), true),
        ('forwarded fallback', jsonb_build_object('x-forwarded-for', ipv4 || ', 10.0.0.1'), true),
        ('not any Google IP', jsonb_build_object('cf-connecting-ip', '8.8.8.8'), false),
        ('normal IP', jsonb_build_object('cf-connecting-ip', '192.0.2.45'), false),
        ('prefer gateway', jsonb_build_object('cf-connecting-ip', '192.0.2.45', 'x-forwarded-for', ipv4), false),
        ('not any forwarded hop', jsonb_build_object('x-forwarded-for', '192.0.2.45, ' || ipv4), false),
        ('invalid IP', jsonb_build_object('cf-connecting-ip', 'not-an-ip'), false),
        ('empty IP', jsonb_build_object('cf-connecting-ip', '   '), false),
        ('network is not client IP', jsonb_build_object('cf-connecting-ip', ipv4 || '/24'), false),
        ('array headers', '[]'::jsonb, false),
        ('null headers', 'null'::jsonb, false)
    ) AS c(label, headers, excluded) LOOP
        PERFORM set_config('request.headers', example.headers::text, true);
        actual := data_quality.analytics_google_crawler_request();
        IF actual IS DISTINCT FROM example.excluded THEN
            RAISE EXCEPTION 'Wrong request classification: % (expected %, got %)', example.label, example.excluded, actual;
        END IF;
        -- A NOT NULL violation would reveal that the bot reached the insert.
        IF example.excluded THEN
            INSERT INTO qa_google_measurements(payload) VALUES(NULL);
            GET DIAGNOSTICS n = ROW_COUNT;
            IF n <> 0 THEN RAISE EXCEPTION 'Crawler counted: %', example.label; END IF;
        END IF;
        cases := cases + 1;
    END LOOP;

    PERFORM set_config('request.headers', '{bad-json', true);
    IF data_quality.analytics_google_crawler_request() THEN RAISE EXCEPTION 'Invalid JSON blocked measurement'; END IF;
    PERFORM set_config('request.headers', '', true);
    IF data_quality.analytics_google_crawler_request() THEN RAISE EXCEPTION 'Empty setting blocked measurement'; END IF;

    -- Il normale visitatore viene registrato nella fixture, con le vecchie guardie.
    INSERT INTO qa_google_measurements(visitor_id, session_id, payload)
    VALUES ('qa-google-normal-' || gen_random_uuid(), gen_random_uuid()::text, 'normal');
    IF (SELECT count(*) FROM qa_google_measurements) <> 1 THEN RAISE EXCEPTION 'Normal visitor lost'; END IF;

    -- Le esclusioni interne originali restano operative, senza toccare profili.
    SELECT user_id INTO STRICT internal_id FROM data_quality.analytics_excluded_accounts LIMIT 1;
    INSERT INTO qa_google_measurements(user_id, payload) VALUES (internal_id, 'internal');
    IF (SELECT count(*) FROM qa_google_measurements) <> 1 THEN RAISE EXCEPTION 'Internal exclusion changed'; END IF;

    PERFORM set_config('request.headers', jsonb_build_object('user-agent', 'Googlebot/2.1')::text, true);
    INSERT INTO qa_google_measurements(payload) SELECT 'bot' FROM generate_series(1, 3);
    GET DIAGNOSTICS n = ROW_COUNT;
    IF n <> 0 THEN RAISE EXCEPTION 'Crawler bulk inserted'; END IF;

    -- La vera RPC riceve un evento valido, ma il trigger non crea alcuna riga.
    SELECT count(*) INTO total_before FROM public.site_analytics_events;
    n := public.track_site_events(jsonb_build_array(jsonb_build_object(
        'id', event_id, 'session_id', gen_random_uuid(), 'name', 'page_enter',
        'page', 'home', 'device', 'mobile', 'source', 'direct', 'entry_page', 'home'
    )));
    IF n <> 0 OR (SELECT count(*) FROM public.site_analytics_events) <> total_before THEN
        RAISE EXCEPTION 'Crawler reached the real event table';
    END IF;

    IF (SELECT count(*) FROM pg_trigger WHERE tgname = 'a0_exclude_google_crawler'
        AND tgrelid IN ('public.page_views'::regclass, 'public.site_analytics_events'::regclass)) <> 2 THEN
        RAISE EXCEPTION 'Missing measurement triggers';
    END IF;
    IF has_table_privilege('anon', 'data_quality.analytics_google_crawler_ranges', 'SELECT')
       OR has_table_privilege('authenticated', 'data_quality.analytics_google_crawler_ranges', 'INSERT')
       OR has_function_privilege('anon', 'data_quality.analytics_google_crawler_request()', 'EXECUTE')
       OR has_function_privilege('authenticated', 'data_quality.guard_google_crawler_measurement()', 'EXECUTE') THEN
        RAISE EXCEPTION 'Unexpected public privileges';
    END IF;
    RAISE NOTICE 'PASS: % header cases, invalid JSON, fixture inserts, internal exclusion, bulk, real RPC zero-write, triggers and permissions', cases;
END;
$test$;
SELECT jsonb_build_object('passed', true, 'rollback', true, 'real_customer_rows_created', 0,
    'checks', '24 header cases; malformed settings; IPv4/IPv6/mapped/boundaries; precedence; normal browser/GSA/referrer; internal exclusion; bulk; true RPC zero-write; trigger scope; private grants') AS result;
ROLLBACK;
