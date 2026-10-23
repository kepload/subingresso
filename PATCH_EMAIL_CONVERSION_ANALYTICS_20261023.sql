-- Campaign metrics and authenticated purchase events. No historical opens invented.
ALTER TABLE public.vetrina_email_permissions ADD COLUMN IF NOT EXISTS email_tracking boolean NOT NULL DEFAULT false;
ALTER TABLE public.vetrina_email_permissions ADD COLUMN IF NOT EXISTS tracking_consented_at timestamptz;
ALTER TABLE public.vetrina_email_permissions ADD COLUMN IF NOT EXISTS tracking_revoked_at timestamptz;
ALTER TABLE public.vetrina_email_log ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;
ALTER TABLE public.vetrina_email_log ADD COLUMN IF NOT EXISTS tracking_token uuid NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.vetrina_email_log ADD COLUMN IF NOT EXISTS tracking_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.vetrina_email_log ADD COLUMN IF NOT EXISTS delivery_confirmed boolean NOT NULL DEFAULT false;
ALTER TABLE public.vetrina_email_log ADD COLUMN IF NOT EXISTS opened_at timestamptz;
ALTER TABLE public.vetrina_email_log ADD COLUMN IF NOT EXISTS clicked_at timestamptz;
ALTER TABLE public.vetrina_email_log ADD COLUMN IF NOT EXISTS last_open_at timestamptz;
ALTER TABLE public.vetrina_email_log ADD COLUMN IF NOT EXISTS last_click_at timestamptz;
ALTER TABLE public.vetrina_email_log ADD COLUMN IF NOT EXISTS open_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.vetrina_email_log ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.vetrina_email_log ADD COLUMN IF NOT EXISTS offered_tier text;
ALTER TABLE public.vetrina_email_log ADD COLUMN IF NOT EXISTS template_family text;
CREATE UNIQUE INDEX IF NOT EXISTS vetrina_mail_tracking_token ON public.vetrina_email_log(tracking_token);
UPDATE public.vetrina_email_log SET delivery_confirmed=true WHERE provider_event IN ('delivered','opened','clicked') AND NOT delivery_confirmed;

CREATE TABLE IF NOT EXISTS public.vetrina_analytics_settings (
 id integer PRIMARY KEY CHECK(id=1), started_at timestamptz NOT NULL DEFAULT now(), provider_synced_at timestamptz
);
INSERT INTO public.vetrina_analytics_settings(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS public.vetrina_checkout_analytics (
 session_id text PRIMARY KEY CHECK(session_id LIKE 'cs_%'), flow_id uuid NOT NULL UNIQUE,
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 email_id uuid REFERENCES public.vetrina_email_log(id),
 source text NOT NULL CHECK(source IN ('dashboard','vendi_creation')),
 tier text NOT NULL CHECK(tier IN ('10d','30d','90d')),
 listing_count integer NOT NULL CHECK(listing_count BETWEEN 1 AND 10),
 amount_cents integer NOT NULL CHECK(amount_cents>=0),
 created_at timestamptz NOT NULL DEFAULT now(), cancelled_at timestamptz,
 is_test boolean NOT NULL DEFAULT false
);
CREATE TABLE IF NOT EXISTS public.vetrina_funnel_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 kind text NOT NULL CHECK(kind IN ('offer_open','offer_close','tier_select','listing_select','checkout_attempt','checkout_error','email_landing','checkout_cancel')),
 source text NOT NULL CHECK(source IN ('dashboard','email','vendi','account','analytics')),
 tier text CHECK(tier IN ('10d','30d','90d')), listing_count integer CHECK(listing_count BETWEEN 0 AND 10),
 email_id uuid REFERENCES public.vetrina_email_log(id), flow_id uuid,
 created_at timestamptz NOT NULL DEFAULT now(), is_test boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS vetrina_events_user_time ON public.vetrina_funnel_events(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS vetrina_events_email_time ON public.vetrina_funnel_events(email_id,created_at DESC);
ALTER TABLE public.vetrina_checkout_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vetrina_funnel_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vetrina_analytics_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.vetrina_checkout_analytics,public.vetrina_funnel_events,public.vetrina_analytics_settings FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.vetrina_checkout_analytics,public.vetrina_funnel_events,public.vetrina_analytics_settings TO service_role;

CREATE OR REPLACE FUNCTION public.claim_vetrina_email(p_user_id uuid,p_campaign text,p_variant integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE candidate jsonb; delivery_id uuid; token uuid; measure boolean;
BEGIN
 IF p_campaign IS NULL OR p_campaign !~ '^[a-z0-9-]{6,80}$' OR p_variant IS NULL OR p_variant NOT BETWEEN 0 AND 2 THEN RAISE EXCEPTION 'Invalid campaign'; END IF;
 PERFORM pg_advisory_xact_lock(793267401);
 IF (SELECT count(*) FROM public.vetrina_email_log WHERE NOT is_test AND created_at>now()-interval '24 hours' AND status<>'cancelled')>=20
 OR (SELECT count(*) FROM public.vetrina_email_log WHERE NOT is_test AND campaign=p_campaign AND status<>'cancelled')>=20 THEN RETURN NULL; END IF;
 IF EXISTS(SELECT 1 FROM public.vetrina_email_log WHERE user_id=p_user_id AND campaign=p_campaign) THEN RETURN NULL; END IF;
 candidate:=public.vetrina_email_candidate(p_user_id);IF candidate IS NULL THEN RETURN NULL;END IF;
 SELECT email_tracking AND tracking_consented_at IS NOT NULL AND tracking_revoked_at IS NULL INTO measure FROM public.vetrina_email_permissions WHERE user_id=p_user_id AND revoked_at IS NULL;
 INSERT INTO public.vetrina_email_log(user_id,campaign,variant,tracking_enabled) VALUES(p_user_id,p_campaign,p_variant,coalesce(measure,false)) RETURNING id,tracking_token INTO delivery_id,token;
 RETURN candidate||jsonb_build_object('delivery_id',delivery_id,'variant',p_variant,'tracking_token',token,'tracking_enabled',coalesce(measure,false));
END $$;

CREATE OR REPLACE FUNCTION public.record_vetrina_mail_hit(p_token uuid,p_kind text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE target public.vetrina_email_log;
BEGIN
 IF p_kind IS NULL OR p_kind NOT IN ('open','click') THEN RETURN false;END IF;
 SELECT * INTO target FROM public.vetrina_email_log WHERE tracking_token=p_token AND status='sent' AND tracking_enabled FOR UPDATE;
 IF NOT FOUND THEN RETURN false;END IF;
 IF NOT target.is_test AND NOT EXISTS(SELECT 1 FROM public.vetrina_email_permissions WHERE user_id=target.user_id AND revoked_at IS NULL AND email_tracking AND tracking_consented_at IS NOT NULL AND tracking_revoked_at IS NULL) THEN RETURN false;END IF;
 IF p_kind='open' THEN
  UPDATE public.vetrina_email_log SET opened_at=coalesce(opened_at,now()),last_open_at=now(),open_count=open_count+CASE WHEN last_open_at IS NULL OR last_open_at<now()-interval '30 seconds' THEN 1 ELSE 0 END WHERE id=target.id;
 ELSE
  UPDATE public.vetrina_email_log SET clicked_at=coalesce(clicked_at,now()),last_click_at=now(),click_count=click_count+CASE WHEN last_click_at IS NULL OR last_click_at<now()-interval '30 seconds' THEN 1 ELSE 0 END WHERE id=target.id;
 END IF;
 RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.stop_vetrina_email_tracking(p_token text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE target uuid;
BEGIN
 SELECT id INTO target FROM public.profiles WHERE unsub_token=p_token;
 IF target IS NULL THEN RETURN false;END IF;
 UPDATE public.vetrina_email_permissions SET email_tracking=false,tracking_revoked_at=coalesce(tracking_revoked_at,now()) WHERE user_id=target;
 RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.record_vetrina_funnel_event(
 p_id uuid,p_kind text,p_source text DEFAULT 'dashboard',p_tier text DEFAULT NULL,
 p_count integer DEFAULT NULL,p_mail_token uuid DEFAULT NULL,p_flow uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=auth.uid(); person public.profiles; mail public.vetrina_email_log; credit boolean:=false; context jsonb:=NULL;
BEGIN
 IF actor IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501';END IF;
 SELECT * INTO person FROM public.profiles WHERE id=actor;
 IF NOT FOUND THEN RAISE EXCEPTION 'Profile unavailable' USING ERRCODE='42501';END IF;
 IF p_id IS NULL OR p_kind IS NULL OR p_kind NOT IN ('offer_open','offer_close','tier_select','listing_select','checkout_attempt','checkout_error','email_landing','checkout_cancel')
 OR p_source IS NULL OR p_source NOT IN ('dashboard','email','vendi','account','analytics') OR (p_tier IS NOT NULL AND p_tier NOT IN ('10d','30d','90d')) OR (p_count IS NOT NULL AND p_count NOT BETWEEN 0 AND 10) THEN RAISE EXCEPTION 'Invalid event' USING ERRCODE='22023';END IF;
 IF p_mail_token IS NOT NULL THEN
  SELECT * INTO mail FROM public.vetrina_email_log WHERE tracking_token=p_mail_token AND user_id=actor AND status='sent';
  IF FOUND THEN
   credit:=mail.tracking_enabled AND (mail.is_test OR EXISTS(SELECT 1 FROM public.vetrina_email_permissions WHERE user_id=actor AND revoked_at IS NULL AND email_tracking AND tracking_consented_at IS NOT NULL AND tracking_revoked_at IS NULL));
   context:=jsonb_build_object('listing_ids',coalesce(mail.listing_ids,'{}'::uuid[]),'tier',mail.offered_tier,'tracked',credit);
  END IF;
 END IF;
 IF p_kind='email_landing' AND NOT credit THEN RETURN jsonb_build_object('accepted',false,'context',context);END IF;
 IF p_kind='checkout_cancel' THEN
  IF p_flow IS NULL THEN RETURN jsonb_build_object('accepted',false);END IF;
  UPDATE public.vetrina_checkout_analytics SET cancelled_at=coalesce(cancelled_at,now()) WHERE flow_id=p_flow AND user_id=actor;
  IF NOT FOUND THEN RETURN jsonb_build_object('accepted',false);END IF;
 END IF;
 IF (SELECT count(*) FROM public.vetrina_funnel_events WHERE user_id=actor AND created_at>now()-interval '1 day')>=300
 OR (SELECT count(*) FROM public.vetrina_funnel_events WHERE user_id=actor AND created_at>now()-interval '1 minute')>=30 THEN RETURN jsonb_build_object('accepted',false,'context',context);END IF;
 INSERT INTO public.vetrina_funnel_events(id,user_id,kind,source,tier,listing_count,email_id,flow_id,is_test)
 VALUES(p_id,actor,p_kind,CASE WHEN p_source='email' AND NOT credit THEN 'dashboard' ELSE p_source END,p_tier,p_count,CASE WHEN credit THEN mail.id ELSE NULL END,p_flow,coalesce(person.is_admin,false) OR coalesce(person.is_demo,false) OR coalesce(mail.is_test,false))
 ON CONFLICT(id) DO NOTHING;
 RETURN jsonb_build_object('accepted',true,'context',context);
END $$;

CREATE OR REPLACE FUNCTION public.register_vetrina_checkout_analytics(p_session text,p_flow uuid,p_user uuid,p_source text,p_tier text,p_count integer,p_amount integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE mail_id uuid; testing boolean;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.payments WHERE user_id=p_user AND (checkout_session_id=p_session OR stripe_session_id=p_session)) THEN RAISE EXCEPTION 'Unknown registered order';END IF;
 SELECT coalesce(is_admin,false) OR coalesce(is_demo,false) INTO testing FROM public.profiles WHERE id=p_user;
 SELECT e.email_id INTO mail_id FROM public.vetrina_funnel_events e JOIN public.vetrina_email_log m ON m.id=e.email_id JOIN public.vetrina_email_permissions c ON c.user_id=p_user
 WHERE e.user_id=p_user AND e.kind='email_landing' AND e.created_at>now()-interval '7 days' AND m.tracking_enabled AND c.email_tracking AND c.revoked_at IS NULL AND c.tracking_revoked_at IS NULL
 ORDER BY e.created_at DESC LIMIT 1;
 INSERT INTO public.vetrina_checkout_analytics(session_id,flow_id,user_id,email_id,source,tier,listing_count,amount_cents,is_test)
 VALUES(p_session,p_flow,p_user,mail_id,p_source,p_tier,p_count,p_amount,coalesce(testing,false)) ON CONFLICT(session_id) DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.claim_vetrina_email_sample(p_user uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE person public.profiles; example jsonb; target uuid; token uuid; today text:=(now() AT TIME ZONE 'UTC')::date::text;
BEGIN
 SELECT * INTO person FROM public.profiles WHERE id=p_user AND is_admin;
 IF NOT FOUND THEN RAISE EXCEPTION 'Admin required' USING ERRCODE='42501';END IF;
 PERFORM pg_advisory_xact_lock(793267402);
 IF EXISTS(SELECT 1 FROM public.vetrina_email_log WHERE user_id=p_user AND is_test AND created_at>now()-interval '24 hours') THEN RETURN NULL;END IF;
 -- A copy uses an actual public campaign listing, never revives the admin's deleted ad.
 SELECT jsonb_build_object('id',a.id,'title',a.titolo,'comune',a.comune,'views_14d',coalesce((SELECT sum(views) FROM public.listing_stats_daily WHERE annuncio_id=a.id AND day>=(now() AT TIME ZONE 'UTC')::date-14 AND day<(now() AT TIME ZONE 'UTC')::date),0))
 INTO example FROM public.annunci a WHERE a.status='active' AND NOT coalesce(a.is_demo,false) AND a.expires_at>now() AND EXISTS(SELECT 1 FROM public.vetrina_email_log l WHERE NOT l.is_test AND a.id=ANY(l.listing_ids)) ORDER BY a.created_at DESC LIMIT 1;
 IF example IS NULL THEN RAISE EXCEPTION 'No public example available';END IF;
 INSERT INTO public.vetrina_email_log(user_id,campaign,variant,is_test,tracking_enabled,offered_tier,template_family)
 VALUES(p_user,'sample-email-'||today,0,true,true,'10d','stats') RETURNING id,tracking_token INTO target,token;
 RETURN jsonb_build_object('user_id',p_user,'delivery_id',target,'tracking_token',token,'tracking_enabled',true,'is_test',true,'variant',0,'nome',person.nome,'unsub_token',person.unsub_token,'active_count',1,'listings',jsonb_build_array(example),'period_start',(now() AT TIME ZONE 'UTC')::date-14,'period_end',(now() AT TIME ZONE 'UTC')::date-1);
END $$;

-- Internal telemetry stays private; token endpoints can only increment a known sent message.
REVOKE ALL ON FUNCTION public.record_vetrina_mail_hit(uuid,text),public.stop_vetrina_email_tracking(text),public.record_vetrina_funnel_event(uuid,text,text,text,integer,uuid,uuid),public.register_vetrina_checkout_analytics(text,uuid,uuid,text,text,integer,integer),public.claim_vetrina_email_sample(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_vetrina_mail_hit(uuid,text) TO anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.record_vetrina_funnel_event(uuid,text,text,text,integer,uuid,uuid) TO authenticated,service_role;
GRANT EXECUTE ON FUNCTION public.stop_vetrina_email_tracking(text),public.register_vetrina_checkout_analytics(text,uuid,uuid,text,text,integer,integer),public.claim_vetrina_email_sample(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.admin_vetrina_conversion_stats(p_days integer DEFAULT 30)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE cutoff timestamptz; result jsonb;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin) THEN RAISE EXCEPTION 'Admin required' USING ERRCODE='42501';END IF;
 IF p_days IS NULL OR p_days NOT IN (0,7,30,90) THEN RAISE EXCEPTION 'Invalid period' USING ERRCODE='22023';END IF;
 cutoff:=CASE WHEN p_days=0 THEN '-infinity'::timestamptz ELSE date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'-(p_days-1)*interval '1 day' END;
 WITH mails AS MATERIALIZED(SELECT * FROM public.vetrina_email_log WHERE NOT is_test AND created_at>=cutoff),
 events AS MATERIALIZED(SELECT * FROM public.vetrina_funnel_events WHERE NOT is_test AND created_at>=cutoff),
 orders AS MATERIALIZED(
  SELECT coalesce(p.checkout_session_id,split_part(p.stripe_session_id,':',1)) session_id,p.user_id,min(p.created_at) created_at,
   bool_or(p.status IN ('succeeded','refunded')) paid,sum(p.amount_cents) amount_cents,sum(p.refunded_cents) refunded_cents,
   bool_or(p.status='failed') incomplete,bool_or(p.status='pending') pending
  FROM public.payments p JOIN public.profiles u ON u.id=p.user_id
  WHERE p.stripe_session_id LIKE 'cs_live_%' AND NOT coalesce(u.is_admin,false) AND NOT coalesce(u.is_demo,false)
  GROUP BY coalesce(p.checkout_session_id,split_part(p.stripe_session_id,':',1)),p.user_id
 ), journeys AS MATERIALIZED(
  SELECT j.*,coalesce(o.paid,false) paid,coalesce(o.incomplete,false) incomplete,coalesce(o.pending,false) pending,
   coalesce(o.refunded_cents,0) refunded_cents
  FROM public.vetrina_checkout_analytics j LEFT JOIN orders o ON o.session_id=j.session_id AND o.user_id=j.user_id WHERE NOT j.is_test AND j.created_at>=cutoff
 ), variant_rows AS(
  SELECT coalesce(template_family,CASE WHEN cardinality(listing_ids)>1 THEN 'bundle' ELSE 'single' END) family,variant,
   count(*) sent,count(*) FILTER(WHERE delivery_confirmed) delivered,count(*) FILTER(WHERE tracking_enabled) measured,
   count(*) FILTER(WHERE tracking_enabled AND opened_at IS NOT NULL) opened,count(*) FILTER(WHERE tracking_enabled AND clicked_at IS NOT NULL) clicked,
   coalesce((SELECT count(DISTINCT j.session_id) FROM journeys j WHERE j.email_id=ANY(array_agg(m.id)) AND j.paid),0) paid,
   coalesce((SELECT sum(j.amount_cents) FROM journeys j WHERE j.email_id=ANY(array_agg(m.id)) AND j.paid),0) revenue_cents
  FROM mails m WHERE status='sent' GROUP BY coalesce(template_family,CASE WHEN cardinality(listing_ids)>1 THEN 'bundle' ELSE 'single' END),variant
 )
 SELECT jsonb_build_object('days',p_days,'checked_at',now(),'tracking_started_at',(SELECT started_at FROM public.vetrina_analytics_settings WHERE id=1),'provider_synced_at',(SELECT provider_synced_at FROM public.vetrina_analytics_settings WHERE id=1),
  'email',jsonb_build_object('sent',(SELECT count(*) FROM mails WHERE status='sent'),'delivered',(SELECT count(*) FROM mails WHERE delivery_confirmed),'measured',(SELECT count(*) FROM mails WHERE status='sent' AND tracking_enabled),'unmeasured',(SELECT count(*) FROM mails WHERE status='sent' AND NOT tracking_enabled),'opened',(SELECT count(*) FROM mails WHERE tracking_enabled AND opened_at IS NOT NULL),'clicked',(SELECT count(*) FROM mails WHERE tracking_enabled AND clicked_at IS NOT NULL),'paid',(SELECT count(*) FROM journeys WHERE email_id IN(SELECT id FROM mails) AND paid),'revenue_cents',(SELECT coalesce(sum(amount_cents),0) FROM journeys WHERE email_id IN(SELECT id FROM mails) AND paid),'refunded_cents',(SELECT coalesce(sum(refunded_cents),0) FROM journeys WHERE email_id IN(SELECT id FROM mails) AND paid)),
  'site',jsonb_build_object('opened',(SELECT count(DISTINCT user_id) FROM events WHERE kind='offer_open'),'closed',(SELECT count(DISTINCT user_id) FROM events WHERE kind='offer_close'),'attempts',(SELECT count(DISTINCT user_id) FROM events WHERE kind='checkout_attempt'),'errors',(SELECT count(DISTINCT user_id) FROM events WHERE kind='checkout_error'),'checkouts',(SELECT count(*) FROM journeys),'paid',(SELECT count(*) FROM journeys WHERE paid),'cancelled',(SELECT count(*) FROM journeys WHERE cancelled_at IS NOT NULL AND NOT paid),'incomplete',(SELECT count(*) FROM journeys WHERE incomplete AND NOT paid),'pending',(SELECT count(*) FROM journeys WHERE pending AND NOT paid AND cancelled_at IS NULL),'revenue_cents',(SELECT coalesce(sum(amount_cents),0) FROM journeys WHERE paid)),
  'history',jsonb_build_object('checkouts',(SELECT count(*) FROM orders WHERE created_at>=cutoff),'paid',(SELECT count(*) FROM orders WHERE created_at>=cutoff AND paid),'incomplete',(SELECT count(*) FROM orders WHERE created_at>=cutoff AND incomplete AND NOT paid),'pending',(SELECT count(*) FROM orders WHERE created_at>=cutoff AND pending AND NOT paid)),
  'variants',(SELECT coalesce(jsonb_agg(v ORDER BY v.family,v.variant),'[]'::jsonb) FROM variant_rows v),
  'choices',(SELECT coalesce(jsonb_agg(v),'[]'::jsonb) FROM(SELECT tier,count(DISTINCT user_id) users FROM events WHERE kind='tier_select' GROUP BY tier)v),
  'recent',(SELECT coalesce(jsonb_agg(v),'[]'::jsonb) FROM(SELECT e.kind,e.source,e.tier,e.listing_count,e.created_at,p.nome FROM events e JOIN public.profiles p ON p.id=e.user_id ORDER BY e.created_at DESC LIMIT 10)v),
  'sample',(SELECT to_jsonb(v) FROM(SELECT status,provider_event,delivery_confirmed,opened_at IS NOT NULL opened,clicked_at IS NOT NULL clicked,created_at FROM public.vetrina_email_log WHERE is_test AND user_id=auth.uid() ORDER BY created_at DESC LIMIT 1)v)
 ) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.admin_vetrina_conversion_stats(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_vetrina_conversion_stats(integer) TO authenticated,service_role;

CREATE OR REPLACE FUNCTION public.capture_signup_vetrina_optin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE metadata jsonb; version text; measured boolean;
BEGIN
 SELECT raw_user_meta_data INTO metadata FROM auth.users WHERE id=NEW.id;
 version:=metadata->>'promotional_email_consent_version';
 IF metadata->'promotional_email_opt_in'='true'::jsonb AND version IN ('vetrina-email-20261023','vetrina-email-analytics-20261023') THEN
  measured:=version='vetrina-email-analytics-20261023';
  INSERT INTO public.vetrina_email_permissions(user_id,source,evidence_note,consented_at,email_tracking,tracking_consented_at)
  VALUES(NEW.id,'explicit_site_optin','Optional unchecked signup choice affirmatively selected. Version '||version||'. Vetrina offers at most once every 30 days. '||CASE WHEN measured THEN 'Informed email open/click measurement; separate withdrawal available.' ELSE 'No email measurement consent.' END,now(),measured,CASE WHEN measured THEN now() ELSE NULL END)
  ON CONFLICT(user_id) DO NOTHING;
 END IF;
 RETURN NEW;
EXCEPTION WHEN OTHERS THEN RAISE WARNING 'Signup promotional preference was not recorded';RETURN NEW;
END $$;
DO $$ DECLARE cname text; BEGIN
 SELECT conname INTO cname FROM pg_constraint WHERE conrelid='public.email_unsubscribe_feedback'::regclass AND contype='c' AND pg_get_constraintdef(oid) LIKE '%email_type%';
 IF cname IS NOT NULL THEN EXECUTE format('ALTER TABLE public.email_unsubscribe_feedback DROP CONSTRAINT %I',cname);END IF;
 ALTER TABLE public.email_unsubscribe_feedback ADD CONSTRAINT email_unsubscribe_feedback_type_check CHECK(email_type IN ('digest','stats','all','bando_alert','promo','tracking'));
END $$;
