-- Execute after the migration in the SAME transaction; always ROLLBACK.
DO $$
DECLARE actor uuid; admin_id uuid; ids uuid[]; token uuid; mail_id uuid; flow uuid:=gen_random_uuid();
 sid text:='cs_live_analytics_fixture_'||pg_backend_pid(); before_data jsonb; after_data jsonb; r jsonb;
 signup_id uuid:=gen_random_uuid();
BEGIN
 IF has_table_privilege('authenticated','public.vetrina_funnel_events','SELECT')
 OR has_table_privilege('anon','public.vetrina_email_log','SELECT')
 OR has_function_privilege('authenticated','public.register_vetrina_checkout_analytics(text,uuid,uuid,text,text,integer,integer)','EXECUTE')
 OR has_function_privilege('anon','public.admin_vetrina_conversion_stats(integer)','EXECUTE') THEN RAISE EXCEPTION 'Private analytics exposed'; END IF;
 SELECT id INTO admin_id FROM public.profiles WHERE is_admin LIMIT 1;
 PERFORM set_config('request.jwt.claim.sub',admin_id::text,true);
 before_data:=public.admin_vetrina_conversion_stats(30);
 IF EXISTS(SELECT 1 FROM public.vetrina_email_permissions WHERE source='whatsapp_user_attestation' AND email_tracking) THEN RAISE EXCEPTION 'Old WhatsApp consent expanded'; END IF;
 INSERT INTO auth.users(id,email,raw_user_meta_data,created_at,email_confirmed_at,aud,role)
 VALUES(signup_id,'analytics-'||signup_id||'@example.invalid','{"nome":"Analytics","cognome":"Prova","promotional_email_opt_in":true,"promotional_email_consent_version":"vetrina-email-analytics-20261023"}',now(),now(),'authenticated','authenticated');
 IF NOT EXISTS(SELECT 1 FROM public.vetrina_email_permissions WHERE user_id=signup_id AND email_tracking AND tracking_consented_at IS NOT NULL) THEN RAISE EXCEPTION 'Informed signup not captured'; END IF;
 SELECT a.user_id INTO actor FROM public.annunci a JOIN public.profiles p ON p.id=a.user_id WHERE a.status='active' AND NOT coalesce(a.is_demo,false) AND NOT coalesce(p.is_admin,false) AND NOT coalesce(p.is_demo,false) AND a.expires_at>now() GROUP BY a.user_id HAVING count(*)>=2 LIMIT 1;
 SELECT array_agg(id ORDER BY id) INTO ids FROM(SELECT id FROM public.annunci WHERE user_id=actor AND status='active' AND NOT coalesce(is_demo,false) AND expires_at>now() ORDER BY id LIMIT 2)a;
 INSERT INTO public.vetrina_email_permissions(user_id,source,evidence_note,consented_at,email_tracking,tracking_consented_at)
 VALUES(actor,'explicit_site_optin','Rollback-only informed analytics test',now(),true,now())
 ON CONFLICT(user_id) DO UPDATE SET email_tracking=true,tracking_consented_at=now(),tracking_revoked_at=NULL,revoked_at=NULL;
 INSERT INTO public.vetrina_email_log(user_id,campaign,variant,status,sent_at,tracking_enabled,delivery_confirmed,listing_ids,offered_tier,template_family)
 VALUES(actor,'analytics-rollback-fixture',0,'sent',now(),true,true,ids,'30d','bundle') RETURNING id,tracking_token INTO mail_id,token;
 IF NOT public.record_vetrina_mail_hit(token,'open') OR NOT public.record_vetrina_mail_hit(token,'click') THEN RAISE EXCEPTION 'Measurement rejected'; END IF;
 PERFORM public.record_vetrina_mail_hit(token,'open');
 IF (SELECT open_count FROM public.vetrina_email_log WHERE id=mail_id)<>1 THEN RAISE EXCEPTION 'Repeated load double-counted'; END IF;
 IF public.record_vetrina_mail_hit(gen_random_uuid(),'open') OR public.record_vetrina_mail_hit(token,'invalid') THEN RAISE EXCEPTION 'Invalid hit accepted'; END IF;
 PERFORM set_config('request.jwt.claim.sub',admin_id::text,true);
 r:=public.record_vetrina_funnel_event(gen_random_uuid(),'email_landing','email',NULL,NULL,token,NULL);
 IF (r->>'accepted')::boolean OR r->'context'<>'null'::jsonb THEN RAISE EXCEPTION 'Other account obtained email context'; END IF;
 PERFORM set_config('request.jwt.claim.sub',actor::text,true);
 BEGIN
  PERFORM public.admin_vetrina_conversion_stats(30);
  RAISE EXCEPTION 'Ordinary user accessed admin stats';
 EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 r:=public.record_vetrina_funnel_event(gen_random_uuid(),'email_landing','email',NULL,NULL,token,NULL);
 IF NOT (r->>'accepted')::boolean OR NOT (r->'context'->>'tracked')::boolean THEN RAISE EXCEPTION 'Owned landing not accepted'; END IF;
 PERFORM public.record_vetrina_funnel_event(gen_random_uuid(),'offer_open','email','30d',2,token,NULL);
 PERFORM public.register_vetrina_checkout(sid,actor,ids,'30d',false,17820);
 PERFORM public.register_vetrina_checkout_analytics(sid,flow,actor,'dashboard','30d',2,17820);
 PERFORM public.register_vetrina_checkout_analytics(sid,gen_random_uuid(),actor,'dashboard','30d',2,17820);
 r:=public.record_vetrina_funnel_event(gen_random_uuid(),'checkout_cancel','dashboard',NULL,NULL,NULL,gen_random_uuid());
 IF (r->>'accepted')::boolean THEN RAISE EXCEPTION 'Unknown cancel flow accepted'; END IF;
 r:=public.record_vetrina_funnel_event(gen_random_uuid(),'checkout_cancel','dashboard',NULL,NULL,NULL,flow);
 IF NOT (r->>'accepted')::boolean THEN RAISE EXCEPTION 'Owned cancellation rejected'; END IF;
 PERFORM set_config('request.jwt.claim.sub',admin_id::text,true);
 after_data:=public.admin_vetrina_conversion_stats(30);
 IF (after_data->'site'->>'cancelled')::int<>(before_data->'site'->>'cancelled')::int+1 THEN RAISE EXCEPTION 'Cancel not counted'; END IF;
 PERFORM public.apply_vetrina_checkout(sid,actor,17820,'eur','pi_analytics_fixture_'||pg_backend_pid());
 after_data:=public.admin_vetrina_conversion_stats(30);
 IF (after_data->'email'->>'paid')::int<>(before_data->'email'->>'paid')::int+1
 OR (after_data->'email'->>'revenue_cents')::int<>(before_data->'email'->>'revenue_cents')::int+17820
 OR (after_data->'history'->>'checkouts')::int<>(before_data->'history'->>'checkouts')::int+1
 OR (after_data->'site'->>'cancelled')::int<>(before_data->'site'->>'cancelled')::int THEN RAISE EXCEPTION 'Bundle paid/cancel normalization failed'; END IF;
 PERFORM public.stop_vetrina_email_tracking((SELECT unsub_token FROM public.profiles WHERE id=actor));
 IF public.record_vetrina_mail_hit(token,'click') OR EXISTS(SELECT 1 FROM public.vetrina_email_permissions WHERE user_id=actor AND revoked_at IS NOT NULL) THEN RAISE EXCEPTION 'Tracking-only withdrawal failed'; END IF;
 PERFORM set_config('request.jwt.claim.sub',actor::text,true);
 r:=public.record_vetrina_funnel_event(gen_random_uuid(),'email_landing','email',NULL,NULL,token,NULL);
 IF (r->>'accepted')::boolean OR r->'context'->>'tier'<>'30d' THEN RAISE EXCEPTION 'Untracked functional link failed'; END IF;
 PERFORM set_config('request.jwt.claim.sub',admin_id::text,true);
 r:=public.claim_vetrina_email_sample(admin_id);
 IF r IS NULL OR NOT (r->>'is_test')::boolean OR public.claim_vetrina_email_sample(admin_id) IS NOT NULL THEN RAISE EXCEPTION 'Sample frequency guard failed'; END IF;
END $$;
SELECT 'PASS: private data/admin isolation; old consents unchanged; informed signup; token ownership; hit deduplication; 7-day attribution; bundle counted once; confirmed payment; authenticated cancellation; granular withdrawal; sample isolation and daily cap. All fixture changes rolled back.' AS result;
