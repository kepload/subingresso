-- Eseguire dopo la patch. Tutti gli eventi di prova vengono annullati.
BEGIN;
DO $test$
DECLARE
    admin_id uuid;
    user_id uuid;
    signup_at timestamptz;
    prefix text := 'acq-test-' || gen_random_uuid()::text;
    baseline jsonb;
    result jsonb;
    linked_before integer;
BEGIN
    IF public.acquisition_source('/blog/bandi-posteggi-mercatali-lombardia',NULL) <> 'bandi'
       OR public.acquisition_source('/bandi/bando-fiera',NULL) <> 'bandi'
       OR public.acquisition_source('/blog/autorizzazione-temporanea-sagre-fiere-ambulanti',NULL) <> 'fiere'
       OR public.acquisition_source('/blog/quanto-costa-un-posteggio-al-mercato',NULL) <> 'blog'
       OR public.acquisition_source('/valutatore.html',NULL) <> 'valutatore'
       OR public.acquisition_source('/index.html',NULL) <> 'homepage'
       OR public.acquisition_source('/annunci',NULL) <> 'altro'
       OR public.acquisition_source('/','fiere') <> 'fiere'
       OR public.acquisition_source('/fiere/lombardia',NULL) <> 'fiere' THEN
        RAISE EXCEPTION 'Classificazione errata';
    END IF;
    IF has_function_privilege('anon','public.admin_acquisition_stats(integer)','EXECUTE')
       OR has_function_privilege('authenticated','public.acquisition_source(text,text)','EXECUTE')
       OR NOT has_function_privilege('authenticated','public.admin_acquisition_stats(integer)','EXECUTE') THEN
        RAISE EXCEPTION 'Permessi RPC errati';
    END IF;
    PERFORM set_config('request.jwt.claim.sub','',true);
    IF public.admin_acquisition_stats(30)->>'error' <> 'forbidden' THEN RAISE EXCEPTION 'Accesso senza identita'; END IF;
    SELECT id INTO admin_id FROM public.profiles WHERE is_admin LIMIT 1;
    SELECT id,created_at INTO user_id,signup_at FROM public.profiles
        WHERE NOT coalesce(is_admin,false) AND NOT coalesce(is_demo,false)
          AND created_at >= now()-interval '30 days' ORDER BY created_at DESC LIMIT 1;
    IF admin_id IS NULL OR user_id IS NULL THEN RAISE EXCEPTION 'Identita per i controlli mancanti'; END IF;
    PERFORM set_config('request.jwt.claim.sub',user_id::text,true);
    EXECUTE 'SET LOCAL ROLE authenticated';
    IF public.admin_acquisition_stats(30)->>'error' <> 'forbidden' THEN RAISE EXCEPTION 'Utente normale legge statistiche admin'; END IF;
    EXECUTE 'RESET ROLE';
    PERFORM set_config('request.jwt.claim.sub',admin_id::text,true);
    baseline := public.admin_acquisition_stats(30);
    linked_before := (baseline->>'attributed_signups')::integer;

    -- Un browser, sei sessioni: visitatori non additivi; ingressi additivi.
    INSERT INTO public.page_views(path,visitor_id,session_id,created_at,utm_source,utm_campaign) VALUES
        ('/blog/quanto-costa-un-posteggio-al-mercato',prefix,prefix||'-1',now()-interval '1 hour',NULL,NULL),
        ('/blog/bandi-posteggi-mercatali-lombardia',prefix,prefix||'-2',now()-interval '1 hour',NULL,NULL),
        ('/valutatore',prefix,prefix||'-3',now()-interval '1 hour',NULL,NULL),
        ('/',prefix,prefix||'-4',now()-interval '1 hour',NULL,NULL),
        ('/',prefix,prefix||'-5',now()-interval '1 hour','fiere','san-faustino'),
        ('/annunci',prefix,prefix||'-6',now()-interval '1 hour',NULL,NULL),
        ('/dashboard',prefix,prefix||'-1',now()-interval '30 minutes',NULL,NULL),
        ('/',prefix,prefix||'-old',now()-interval '31 days',NULL,NULL),
        ('/valutatore',prefix,prefix||'-old',now()-interval '1 day',NULL,NULL);
    result := public.admin_acquisition_stats(30);
    IF (result->>'total_sessions')::int <> (baseline->>'total_sessions')::int + 6
       OR (result->>'total_visitors')::int <> (baseline->>'total_visitors')::int + 1
       OR (SELECT sum((r->>'sessions')::int) FROM jsonb_array_elements(result->'rows') r) <> (result->>'total_sessions')::int THEN
        RAISE EXCEPTION 'Sessioni duplicate o filtro temporale errato';
    END IF;
    IF public.admin_acquisition_stats(NULL)->>'period_days' <> '30'
       OR public.admin_acquisition_stats(0)->>'period_days' <> '1'
       OR public.admin_acquisition_stats(999)->>'period_days' <> '365' THEN
        RAISE EXCEPTION 'Limiti del periodo errati';
    END IF;

    -- Un account non deve contare due volte per due aperture diverse.
    -- Il campo nuovo non e' presente nello storico: solo la prova attribuisce.
    IF EXISTS (SELECT 1 FROM public.auth_modal_opens WHERE signed_up_user_id=user_id AND landing_path IS NOT NULL) THEN
        RAISE EXCEPTION 'Usare un account recente senza attribuzione per questa prova';
    END IF;
    INSERT INTO public.auth_modal_opens(source,anon_session,time_bucket,opened_at,signed_up_user_id,landing_path) VALUES
        ('nav_accedi',prefix,'test-1',signup_at-interval '2 minutes',user_id,'/blog/bandi-posteggi-mercatali-lombardia'),
        ('popup_vetrina',prefix,'test-2',signup_at-interval '1 minute',user_id,'/blog/bandi-posteggi-mercatali-lombardia'),
        ('direct',prefix,'test-3',signup_at+interval '1 minute',user_id,'/valutatore');
    EXECUTE 'SET LOCAL ROLE authenticated';
    result := public.admin_acquisition_stats(30);
    EXECUTE 'RESET ROLE';
    IF (result->>'attributed_signups')::int <> linked_before+1
       OR (result->>'unattributed_signups')::int <> (baseline->>'unattributed_signups')::int-1
       OR (result->>'total_signups')::int <> (baseline->>'total_signups')::int
       OR (SELECT (r->>'signups')::int FROM jsonb_array_elements(result->'rows') r WHERE r->>'source'='bandi') < 1 THEN
        RAISE EXCEPTION 'Iscrizioni duplicate o non attribuite correttamente';
    END IF;
    -- Verifica scrittura pubblica dei nuovi campi e rifiuto di query personali.
    PERFORM set_config('request.jwt.claim.sub','',true);
    EXECUTE 'SET LOCAL ROLE anon';
    INSERT INTO public.page_views(path,visitor_id,session_id,utm_source,utm_campaign)
        VALUES ('/',prefix,prefix||'-anon','fiere','test-fiera');
    INSERT INTO public.auth_modal_opens(source,anon_session,time_bucket,landing_path,utm_source)
        VALUES ('direct',prefix,'test-anon','/blog/test','fiere');
    BEGIN
        INSERT INTO public.auth_modal_opens(source,anon_session,time_bucket,landing_path)
            VALUES ('direct',prefix,'unsafe','/reset-password?token=private');
        RAISE EXCEPTION 'URL personale accettata';
    EXCEPTION WHEN check_violation THEN NULL; END;
    EXECUTE 'RESET ROLE';
END $test$;
SELECT 'OK: 9 provenienze, permessi admin/utente/anon, dedup sessioni/account, confini periodo e minimizzazione URL' AS result;
ROLLBACK;
