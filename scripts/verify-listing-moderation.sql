-- Verifica le RLS senza pubblicare, rifiutare o modificare annunci reali.
BEGIN;
CREATE TEMP TABLE moderation_checks (check_name text, checked integer);
CREATE TEMP TABLE moderation_fixture (id uuid, user_id uuid, status text);
ALTER TABLE moderation_fixture ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON moderation_fixture TO anon, authenticated;
DO $$
DECLARE
    account record;
    policy record;
    expected_count integer;
    visible_count integer;
    checked_users integer := 0;
    checked_admins integer := 0;
BEGIN
    -- Copia le policy SELECT effettive su una tabella temporanea senza trigger.
    -- Così si verifica anche quando non ci sono pending reali in produzione.
    FOR policy IN SELECT policyname, qual FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'annunci' AND cmd = 'SELECT' LOOP
        EXECUTE format('CREATE POLICY %I ON moderation_fixture FOR SELECT USING (%s)', policy.policyname, policy.qual);
    END LOOP;
    INSERT INTO moderation_fixture SELECT gen_random_uuid(), id, 'pending' FROM public.profiles;
    INSERT INTO moderation_fixture VALUES (gen_random_uuid(), gen_random_uuid(), 'pending');
    PERFORM set_config('request.jwt.claim.sub', '', true);
    PERFORM set_config('request.jwt.claims', '{"role":"anon"}', true);
    EXECUTE 'SET LOCAL ROLE anon';
    SELECT count(*) INTO visible_count FROM moderation_fixture WHERE status = 'pending';
    IF visible_count <> 0 THEN RAISE EXCEPTION 'Annunci pending esposti agli anonimi'; END IF;
    EXECUTE 'RESET ROLE';
    INSERT INTO moderation_checks VALUES ('anon_pending_hidden', 1);

    FOR account IN SELECT p.id, p.is_admin, u.email FROM public.profiles p JOIN auth.users u ON u.id = p.id LOOP
        SELECT count(*) INTO expected_count FROM moderation_fixture
        WHERE status = 'pending' AND (user_id = account.id OR account.is_admin);
        PERFORM set_config('request.jwt.claim.sub', account.id::text, true);
        PERFORM set_config('request.jwt.claim.email', account.email, true);
        PERFORM set_config('request.jwt.claims', jsonb_build_object('sub', account.id, 'email', account.email, 'role', 'authenticated')::text, true);
        EXECUTE 'SET LOCAL ROLE authenticated';
        SELECT count(*) INTO visible_count FROM moderation_fixture WHERE status = 'pending';
        IF visible_count <> expected_count THEN
            RAISE EXCEPTION 'Accesso pending errato per admin o proprietario';
        END IF;
        -- Esegue la select effettiva del dettaglio: include le nuove colonne,
        -- senza telefono/email protetti a livello di colonna.
        PERFORM id, titolo, descrizione, stato, tipo, settore, regione, provincia,
            comune, superficie, giorni, prezzo, contatto, dettagli_extra,
            img_urls, user_id, status, created_at, featured, featured_until,
            featured_tier, saved_count, expires_at, video_url
        FROM public.annunci WHERE status = 'pending';
        EXECUTE 'RESET ROLE';
        checked_users := checked_users + 1;
        IF account.is_admin THEN checked_admins := checked_admins + 1; END IF;
    END LOOP;
    IF checked_admins = 0 THEN RAISE EXCEPTION 'Nessun admin verificato'; END IF;
    INSERT INTO moderation_checks VALUES ('account_pending_isolation', checked_users), ('admin_pending_access', checked_admins);
END $$;
SELECT check_name, checked FROM moderation_checks
UNION ALL SELECT 'pending_fixtures', count(*)::integer FROM moderation_fixture;
ROLLBACK;
