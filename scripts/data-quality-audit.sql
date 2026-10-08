-- Le sezioni dettagliate servono alla ricognizione; l'ultimo SELECT restituisce
-- un riepilogo senza recapiti personali, token, comandi cron o scritture.
BEGIN TRANSACTION READ ONLY;
SELECT 'constraints' AS section, c.conrelid::regclass::text AS object, c.conname AS name, pg_get_constraintdef(c.oid) AS definition
FROM pg_constraint c WHERE c.connamespace='public'::regnamespace AND c.conrelid::regclass::text IN
('annunci','profiles','alerts','page_views','auth_modal_opens','blog_conversions','conversazioni','messaggi','conversation_reports','bando_alerts','pending_email_verifications','payments') ORDER BY object,name;
SELECT 'triggers' AS section, event_object_table AS object, trigger_name AS name, action_statement AS definition
FROM information_schema.triggers WHERE trigger_schema='public' ORDER BY object,name;
SELECT 'policies' AS section, tablename AS object, policyname AS name, jsonb_build_object('cmd',cmd,'roles',roles,'using',qual,'check',with_check) AS definition
FROM pg_policies WHERE schemaname='public' AND tablename IN ('profiles','annunci','alerts','page_views','auth_modal_opens','blog_conversions','conversazioni','messaggi','conversation_reports','bando_alerts');
SELECT 'distributions' AS section, jsonb_build_object(
 'listing_types',(SELECT jsonb_agg(t) FROM (SELECT tipo,stato,settore,count(*) FROM annunci WHERE NOT is_demo GROUP BY 1,2,3) t),
 'listing_quality',(SELECT jsonb_build_object('total',count(*),'bad_price',count(*) FILTER(WHERE prezzo IS NULL OR prezzo<101 OR prezzo>400000),'bad_area',count(*) FILTER(WHERE superficie IS NULL OR superficie<=0),'no_province',count(*) FILTER(WHERE nullif(trim(provincia),'') IS NULL),'no_phone',count(*) FILTER(WHERE nullif(trim(tel),'') IS NULL),'short_description',count(*) FILTER(WHERE length(trim(descrizione))<40),'legacy_extra_string',count(*) FILTER(WHERE jsonb_typeof(dettagli_extra)='string')) FROM annunci WHERE NOT is_demo AND status IN ('active','pending')),
 'profile_quality',(SELECT jsonb_build_object('total',count(*),'no_name',count(*) FILTER(WHERE nullif(trim(nome),'') IS NULL),'no_phone',count(*) FILTER(WHERE nullif(trim(telefono),'') IS NULL)) FROM profiles WHERE NOT is_demo),
 'alerts',(SELECT jsonb_agg(t) FROM (SELECT regione,tipo,raggio_km,count(*),count(*) FILTER(WHERE (lat IS NULL)<>(lng IS NULL)) partial_coords FROM alerts GROUP BY 1,2,3) t),
 'pending_email_columns',(SELECT jsonb_agg(column_name) FROM information_schema.columns WHERE table_schema='public' AND table_name='pending_email_verifications'),
 'pending_email_exists',to_regclass('public.pending_email_verifications') IS NOT NULL,
 'grants',(SELECT jsonb_agg(t) FROM (SELECT table_name,grantee,privilege_type FROM information_schema.role_table_grants WHERE table_schema='public' AND grantee IN ('anon','authenticated') AND table_name IN ('profiles','annunci','page_views','auth_modal_opens','blog_conversions','bando_alerts')) t)
) AS result;
SELECT proname,pg_get_functiondef(oid) AS definition FROM pg_proc WHERE pronamespace='public'::regnamespace
AND proname IN ('enforce_annunci_status','handle_new_user','protect_profile_admin','admin_get_recent_users','track_listing_view','track_listing_event','amo_link_signup');
DO $$ DECLARE uid uuid; BEGIN
 SELECT id INTO uid FROM public.profiles WHERE is_admin LIMIT 1;
 IF uid IS NULL THEN RAISE EXCEPTION 'Amministratore mancante'; END IF;
 PERFORM set_config('request.jwt.claim.sub',uid::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',uid,'role','authenticated')::text,true);
END $$;
SELECT jsonb_build_object(
 'summary',public.admin_control_room()->'summary',
 'issue_groups',(SELECT jsonb_agg(t) FROM (SELECT issue,count(*) AS records FROM public.annunci a CROSS JOIN LATERAL unnest(data_quality.listing_issues(to_jsonb(a))) issue WHERE NOT a.is_demo AND a.status IN ('active','pending') GROUP BY issue ORDER BY count(*) DESC) t),
 'anonymous_email_rpc',has_function_privilege('anon','public.admin_get_recent_users(integer)','EXECUTE'),
 'authenticated_phone_read',has_column_privilege('authenticated','public.profiles','telefono','SELECT'),
 'anonymous_truncate',EXISTS(SELECT 1 FROM pg_tables WHERE schemaname='public' AND has_table_privilege('anon',quote_ident(schemaname)||'.'||quote_ident(tablename),'TRUNCATE')),
 'quality_triggers',(SELECT jsonb_agg(DISTINCT trigger_name ORDER BY trigger_name) FROM information_schema.triggers WHERE trigger_schema='public' AND trigger_name LIKE 'dq_%'),
 'test_listings',(SELECT count(*) FROM public.annunci WHERE titolo IN ('Prova controlli qualità dati','Prova modifica e revisione obbligatoria'))
) AS result;
COMMIT;
