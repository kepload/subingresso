-- Verifica privata per tutti gli account e per i periodi 7/30/90 giorni.
-- Tutte le scritture di prova vengono annullate da ROLLBACK.
BEGIN;
CREATE TEMP TABLE seller_analytics_checks (check_name text, checked integer);

DO $$
DECLARE
    account record;
    period integer;
    payload jsonb;
    listing jsonb;
    daily jsonb;
    expected record;
    today date := (now() AT TIME ZONE 'UTC')::date;
    expected_count integer;
    expected_ids uuid[];
    checked_users integer := 0;
BEGIN
    IF has_function_privilege('anon', 'public.dashboard_seller_analytics(integer)', 'EXECUTE')
       OR NOT has_function_privilege('authenticated', 'public.dashboard_seller_analytics(integer)', 'EXECUTE') THEN
        RAISE EXCEPTION 'Permessi RPC statistiche errati';
    END IF;

    FOR account IN SELECT id FROM public.profiles LOOP
        SELECT count(*), COALESCE(array_agg(id), ARRAY[]::uuid[])
        INTO expected_count, expected_ids
        FROM public.annunci
        WHERE user_id = account.id AND status IS DISTINCT FROM 'deleted';

        PERFORM set_config('request.jwt.claim.sub', account.id::text, true);
        PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', account.id, 'role', 'authenticated')::text, true);
        FOREACH period IN ARRAY ARRAY[7, 30, 90] LOOP
            EXECUTE 'SET LOCAL ROLE authenticated';
            payload := public.dashboard_seller_analytics(period);
            EXECUTE 'RESET ROLE';
            IF payload ? 'error' OR (payload->>'days')::integer <> period
               OR jsonb_array_length(payload->'listings') <> expected_count
               OR payload->>'start_day' <> (today - (period - 1))::text
               OR payload->>'end_day' <> today::text OR payload->>'timezone' <> 'UTC'
               OR payload->>'tracking_since' <> '2026-10-06' THEN
                RAISE EXCEPTION 'Statistiche mancanti o periodo errato';
            END IF;
            FOR listing IN SELECT value FROM jsonb_array_elements(payload->'listings') LOOP
                IF NOT ((listing->>'id')::uuid = ANY(expected_ids)) THEN
                    RAISE EXCEPTION 'La RPC espone un annuncio di un altro utente';
                END IF;
                IF listing ? 'tel' OR listing ? 'email' OR listing ? 'mittente_id' THEN
                    RAISE EXCEPTION 'La RPC espone dati personali';
                END IF;
                IF EXISTS (
                    SELECT 1 FROM jsonb_array_elements(listing->'daily') AS d
                    WHERE (d->>'day')::date NOT BETWEEN today - (period - 1) AND today
                ) THEN
                    RAISE EXCEPTION 'Il grafico include eventi fuori periodo';
                END IF;
                FOR daily IN SELECT value FROM jsonb_array_elements(listing->'daily') LOOP
                    SELECT COALESCE(sum(s.views), 0) AS views, COALESCE(sum(s.call_clicks), 0) AS calls,
                           COALESCE(sum(s.whatsapp_clicks), 0) AS whatsapp, COALESCE(sum(s.chat_clicks), 0) AS chats,
                           COALESCE(sum(s.saves), 0) AS saves
                    INTO expected FROM public.listing_stats_daily s
                    WHERE s.annuncio_id = (listing->>'id')::uuid AND s.user_id = account.id
                      AND s.day = (daily->>'day')::date;
                    IF (daily->>'views')::bigint <> expected.views OR (daily->>'call_clicks')::bigint <> expected.calls
                       OR (daily->>'whatsapp_clicks')::bigint <> expected.whatsapp
                       OR (daily->>'chat_clicks')::bigint <> expected.chats
                       OR (daily->>'saves')::bigint <> expected.saves THEN
                        RAISE EXCEPTION 'Contatori giornalieri diversi dai dati registrati';
                    END IF;
                    IF (daily->>'messages')::bigint <> (
                        SELECT count(*) FROM public.messaggi m
                        JOIN public.conversazioni c ON c.id = m.conversazione_id
                        WHERE c.annuncio_id = (listing->>'id')::uuid AND c.venditore_id = account.id
                          AND c.is_support IS NOT TRUE AND m.mittente_id = c.acquirente_id
                          AND m.mittente_id <> account.id
                          AND (m.created_at AT TIME ZONE 'UTC')::date = (daily->>'day')::date
                    ) THEN RAISE EXCEPTION 'Il grafico non corrisponde ai messaggi ricevuti'; END IF;
                END LOOP;
                IF (listing->>'msg_period')::bigint <> (
                    SELECT count(*) FROM public.messaggi m
                    JOIN public.conversazioni c ON c.id = m.conversazione_id
                    WHERE c.annuncio_id = (listing->>'id')::uuid AND c.venditore_id = account.id
                      AND c.is_support IS NOT TRUE AND m.mittente_id = c.acquirente_id
                      AND m.mittente_id <> account.id
                      AND (m.created_at AT TIME ZONE 'UTC')::date BETWEEN today - (period - 1) AND today
                ) OR (listing->>'msg_period')::bigint <> (
                    SELECT COALESCE(sum((d->>'messages')::bigint), 0) FROM jsonb_array_elements(listing->'daily') d
                ) THEN RAISE EXCEPTION 'Totale e grafico dei messaggi non coincidono'; END IF;
            END LOOP;
        END LOOP;
        checked_users := checked_users + 1;
    END LOOP;
    INSERT INTO seller_analytics_checks VALUES ('account_privacy_periods', checked_users);

    -- Account senza annunci e limiti dei periodi.
    PERFORM set_config('request.jwt.claim.sub', gen_random_uuid()::text, true);
    EXECUTE 'SET LOCAL ROLE authenticated';
    payload := public.dashboard_seller_analytics(NULL);
    IF payload->>'days' <> '30' OR payload->'listings' <> '[]'::jsonb
       OR public.dashboard_seller_analytics(-1)->>'days' <> '7'
       OR public.dashboard_seller_analytics(120)->>'days' <> '90' THEN
        RAISE EXCEPTION 'Account vuoto o limiti periodo errati';
    END IF;
    EXECUTE 'RESET ROLE';
    INSERT INTO seller_analytics_checks VALUES ('empty_account_and_period_bounds', 1);
    PERFORM set_config('request.jwt.claim.sub', '', true);
    PERFORM set_config('request.jwt.claims', '{}', true);
    IF public.dashboard_seller_analytics(7)->>'error' <> 'unauthorized' THEN
        RAISE EXCEPTION 'Accesso senza identita accettato';
    END IF;
END $$;

DO $$
DECLARE
    target record;
    buyer uuid;
    daily_before record;
    daily_after record;
    payload jsonb;
    listing jsonb;
    after_views integer;
    after_tel integer;
    after_saved integer;
BEGIN
    SELECT a.id, a.user_id, COALESCE(a.visualizzazioni, 0) AS views,
           COALESCE(a.tel_clicks, 0) AS tel, COALESCE(a.saved_count, 0) AS saved
    INTO target
    FROM public.annunci a
    WHERE a.status = 'active' AND NOT a.is_demo AND (a.expires_at IS NULL OR a.expires_at > now())
    LIMIT 1;
    IF target.id IS NULL THEN RAISE EXCEPTION 'Nessun annuncio disponibile per la prova'; END IF;

    SELECT COALESCE(sum(views), 0) AS views, COALESCE(sum(call_clicks), 0) AS calls,
           COALESCE(sum(whatsapp_clicks), 0) AS whatsapp, COALESCE(sum(chat_clicks), 0) AS chats,
           COALESCE(sum(saves), 0) AS saves
    INTO daily_before FROM public.listing_stats_daily
    WHERE annuncio_id = target.id AND day = current_date;

    EXECUTE 'SET LOCAL ROLE anon';
    PERFORM public.track_listing_view(target.id, 'impression');
    PERFORM public.track_listing_view(target.id, 'detail');
    PERFORM public.increment_tel_clicks(target.id);
    PERFORM public.track_listing_event(target.id, 'whatsapp', 1);
    PERFORM public.track_listing_event(target.id, 'chat', 1);
    EXECUTE 'RESET ROLE';

    SELECT p.id INTO buyer FROM public.profiles p
    WHERE p.id <> target.user_id AND NOT EXISTS (
        SELECT 1 FROM public.saved_listings s WHERE s.user_id = p.id AND s.annuncio_id = target.id
    ) LIMIT 1;
    IF buyer IS NULL THEN RAISE EXCEPTION 'Nessun account disponibile per la prova preferiti'; END IF;
    PERFORM set_config('request.jwt.claim.sub', buyer::text, true);
    EXECUTE 'SET LOCAL ROLE authenticated';
    INSERT INTO public.saved_listings(user_id, annuncio_id) VALUES (buyer, target.id);
    EXECUTE 'RESET ROLE';
    SELECT saved_count INTO after_saved FROM public.annunci WHERE id = target.id;
    IF after_saved <> target.saved + 1 THEN RAISE EXCEPTION 'Totale preferiti non aggiornato'; END IF;
    EXECUTE 'SET LOCAL ROLE authenticated';
    DELETE FROM public.saved_listings WHERE user_id = buyer AND annuncio_id = target.id;
    EXECUTE 'RESET ROLE';

    SELECT visualizzazioni, tel_clicks, saved_count INTO after_views, after_tel, after_saved
    FROM public.annunci WHERE id = target.id;
    SELECT views, call_clicks AS calls, whatsapp_clicks AS whatsapp, chat_clicks AS chats, saves
    INTO daily_after FROM public.listing_stats_daily
    WHERE annuncio_id = target.id AND day = current_date;
    IF after_views <> target.views + 2 OR after_tel <> target.tel + 2 OR after_saved <> target.saved
       OR daily_after.views <> daily_before.views + 2 OR daily_after.calls <> daily_before.calls + 1
       OR daily_after.whatsapp <> daily_before.whatsapp + 1 OR daily_after.chats <> daily_before.chats + 1
       OR daily_after.saves <> daily_before.saves + 1 THEN
        RAISE EXCEPTION 'I contatori giornalieri o totali non corrispondono agli eventi';
    END IF;

    -- I dati aggiornati devono essere visibili al proprietario tramite la RPC.
    PERFORM set_config('request.jwt.claim.sub', target.user_id::text, true);
    EXECUTE 'SET LOCAL ROLE authenticated';
    payload := public.dashboard_seller_analytics(7);
    SELECT value INTO listing FROM jsonb_array_elements(payload->'listings')
    WHERE value->>'id' = target.id::text;
    IF (listing->>'views_total')::integer <> after_views OR (listing->>'tel_clicks_total')::integer <> after_tel
       OR NOT EXISTS (SELECT 1 FROM jsonb_array_elements(listing->'daily') d
                      WHERE d->>'day' = current_date::text AND (d->>'views')::integer = daily_after.views) THEN
        RAISE EXCEPTION 'Gli eventi aggiornati non arrivano alla dashboard';
    END IF;
    EXECUTE 'RESET ROLE';
    INSERT INTO seller_analytics_checks VALUES ('views_contacts_saves_and_dashboard', 1);
END $$;

-- Fixture temporanee per date arbitrarie: il DB forza correttamente now()
-- sui messaggi reali. Stessa funzione, solo queste due sorgenti sostituite;
-- nessun messaggio reale e nessuna modifica ai trigger di qualità.
CREATE TEMP TABLE seller_test_messages (LIKE public.messaggi INCLUDING DEFAULTS);
CREATE TEMP TABLE seller_test_conversations (LIKE public.conversazioni INCLUDING DEFAULTS);
DO $$
DECLARE
    target record;
    support_id uuid := gen_random_uuid();
    today date := (now() AT TIME ZONE 'UTC')::date;
    payload jsonb;
    listing jsonb;
    period integer;
    expected integer;
BEGIN
    SELECT c.id AS conversation_id, c.annuncio_id, c.acquirente_id, c.venditore_id
    INTO target FROM public.conversazioni c JOIN public.annunci a ON a.id = c.annuncio_id
    WHERE c.is_support IS NOT TRUE AND c.acquirente_id <> c.venditore_id
      AND a.user_id = c.venditore_id AND a.status IS DISTINCT FROM 'deleted'
    LIMIT 1;
    IF target.conversation_id IS NULL THEN RAISE EXCEPTION 'Manca una conversazione per verificare i messaggi'; END IF;
    PERFORM set_config('request.jwt.claim.sub', target.venditore_id::text, true);
    INSERT INTO seller_test_conversations SELECT * FROM public.conversazioni WHERE id = target.conversation_id;
    INSERT INTO seller_test_conversations(id, annuncio_id, acquirente_id, venditore_id, is_support)
    VALUES (support_id, target.annuncio_id, target.acquirente_id, target.venditore_id, true);
    EXECUTE replace(replace(replace(
        pg_get_functiondef('public.dashboard_seller_analytics(integer)'::regprocedure),
        'public.dashboard_seller_analytics', 'pg_temp.seller_period_fixture'),
        'public.messaggi', 'pg_temp.seller_test_messages'),
        'public.conversazioni', 'pg_temp.seller_test_conversations');

    INSERT INTO seller_test_messages(conversazione_id, mittente_id, testo, created_at)
    SELECT target.conversation_id, target.acquirente_id, 'Verifica statistiche - rollback', d
    FROM unnest(ARRAY[
        today::timestamp AT TIME ZONE 'UTC',
        (today - 6)::timestamp AT TIME ZONE 'UTC',
        ((today - 6)::timestamp AT TIME ZONE 'UTC') - interval '1 microsecond',
        (today - 20)::timestamp AT TIME ZONE 'UTC',
        ((today - 29)::timestamp AT TIME ZONE 'UTC') - interval '1 microsecond',
        (today - 90)::timestamp AT TIME ZONE 'UTC',
        (today + 1)::timestamp AT TIME ZONE 'UTC'
    ]) AS d;
    INSERT INTO seller_test_messages(conversazione_id, mittente_id, testo, created_at)
    VALUES (target.conversation_id, target.venditore_id, 'Risposta venditore - rollback', now());
    INSERT INTO seller_test_messages(conversazione_id, mittente_id, testo, created_at)
    VALUES (support_id, target.acquirente_id, 'Supporto - rollback', now());

    -- Le date del server non cambiano con il fuso della connessione.
    PERFORM set_config('TimeZone', 'Pacific/Kiritimati', true);
    FOREACH period IN ARRAY ARRAY[7, 30, 90] LOOP
        payload := pg_temp.seller_period_fixture(period);
        SELECT value INTO listing FROM jsonb_array_elements(payload->'listings')
        WHERE value->>'id' = target.annuncio_id::text;
        expected := CASE period WHEN 7 THEN 2 WHEN 30 THEN 4 ELSE 5 END;
        IF (listing->>'msg_period')::integer <> expected OR payload->>'end_day' <> today::text
           OR (SELECT COALESCE(sum((d->>'messages')::integer), 0) FROM jsonb_array_elements(listing->'daily') d) <> expected THEN
            RAISE EXCEPTION 'Messaggi: periodo %, attesi %, ricevuti %, giorno % (atteso %), grafico %',
                period, expected, listing->>'msg_period', payload->>'end_day', today,
                (SELECT COALESCE(sum((d->>'messages')::integer), 0) FROM jsonb_array_elements(listing->'daily') d);
        END IF;
        IF period = 30 AND NOT EXISTS (
            SELECT 1 FROM jsonb_array_elements(listing->'daily') d
            WHERE d->>'day' = (today - 20)::text AND (d->>'messages')::integer >= 1
        ) THEN RAISE EXCEPTION 'Giorno con messaggio senza contatori assente dal grafico'; END IF;
    END LOOP;
    PERFORM set_config('TimeZone', 'UTC', true);
    INSERT INTO seller_analytics_checks VALUES ('incoming_messages_utc_boundaries_and_support', 3);
END $$;

SELECT check_name, checked FROM seller_analytics_checks;
ROLLBACK;
