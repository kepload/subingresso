-- Internal accounts keep all product capabilities; only analytics excludes them.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='60s';
CREATE TABLE IF NOT EXISTS data_quality.analytics_excluded_accounts (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS data_quality.analytics_excluded_identifiers (
 kind text NOT NULL CHECK(kind IN ('visitor','session','auth_session')),
 value text NOT NULL CHECK(length(value) BETWEEN 8 AND 80),
 identified_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(kind,value)
);
REVOKE ALL ON data_quality.analytics_excluded_accounts,data_quality.analytics_excluded_identifiers FROM PUBLIC,anon,authenticated;
-- analytics-exclusion-accounts
CREATE OR REPLACE FUNCTION data_quality.analytics_account_excluded(p_user uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT coalesce(EXISTS(SELECT 1 FROM data_quality.analytics_excluded_accounts WHERE user_id=p_user)
 OR EXISTS(SELECT 1 FROM public.profiles WHERE id=p_user AND (is_admin IS TRUE OR is_demo IS TRUE)),false)
$$;
REVOKE ALL ON FUNCTION data_quality.analytics_account_excluded(uuid) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION data_quality.analytics_row_allowed(p_row jsonb)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE key text; value text;
BEGIN
 FOREACH key IN ARRAY ARRAY['user_id','signed_up_user_id','revealer_id','seller_id','acquirente_id','venditore_id','mittente_id'] LOOP
  value:=p_row->>key;
  IF value IS NOT NULL AND data_quality.analytics_account_excluded(value::uuid) THEN RETURN false; END IF;
 END LOOP;
 IF EXISTS(SELECT 1 FROM data_quality.analytics_excluded_identifiers i WHERE
  (i.kind='visitor' AND i.value=p_row->>'visitor_id' AND coalesce((p_row->>'created_at')::timestamptz,now())>=i.identified_at) OR
  (i.kind='session' AND i.value=p_row->>'session_id') OR
  (i.kind='auth_session' AND i.value=p_row->>'anon_session')) THEN RETURN false; END IF;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION data_quality.analytics_row_allowed(jsonb) FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE FUNCTION public.analytics_tracking_context(p_visitor text DEFAULT NULL,p_session text DEFAULT NULL,p_auth_session text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE excluded boolean:=data_quality.analytics_account_excluded(auth.uid()); item record;
BEGIN
 IF excluded THEN
  FOR item IN SELECT * FROM (VALUES ('visitor',p_visitor),('session',p_session),('auth_session',p_auth_session)) v(kind,value) LOOP
   IF item.value ~ '^[a-zA-Z0-9_-]{8,80}$' THEN
    INSERT INTO data_quality.analytics_excluded_identifiers(kind,value) VALUES(item.kind,item.value) ON CONFLICT DO NOTHING;
   END IF;
  END LOOP;
 END IF;
 RETURN jsonb_build_object('excluded',excluded,'user_id',auth.uid());
END $$;
REVOKE ALL ON FUNCTION public.analytics_tracking_context(text,text,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.analytics_tracking_context(text,text,text) TO authenticated,service_role;
CREATE OR REPLACE FUNCTION data_quality.guard_analytics_actor()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF data_quality.analytics_account_excluded(auth.uid()) OR NOT data_quality.analytics_row_allowed(to_jsonb(NEW)) THEN RETURN NULL; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION data_quality.guard_analytics_actor() FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE VIEW data_quality.analytics_analytics_events AS SELECT t."event_id",t."day",t."metric",t."session_hash",t."source",t."device",t."created_at" FROM event_private.analytics_events t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_analytics_events FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS analytics_exclude_actor ON event_private.analytics_events;
CREATE TRIGGER analytics_exclude_actor BEFORE INSERT OR UPDATE ON event_private.analytics_events FOR EACH ROW EXECUTE FUNCTION data_quality.guard_analytics_actor();
CREATE OR REPLACE VIEW data_quality.analytics_annunci AS SELECT t."id",t."user_id",t."titolo",t."descrizione",t."stato",t."categoria",t."tipo",t."settore",t."dettagli_extra",t."regione",t."provincia",t."comune",t."superficie",t."giorni",t."prezzo",t."contatto",t."tel",t."email",t."data",t."status",t."created_at",t."img_urls",t."expires_at",t."visualizzazioni",t."featured",t."featured_until",t."featured_tier",t."featured_since",t."tel_clicks",t."video_url",t."saved_count",t."is_demo" FROM public.annunci t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_annunci FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE VIEW data_quality.analytics_auth_modal_opens AS SELECT t."id",t."source",t."opened_at",t."anon_session",t."time_bucket",t."signed_up_user_id",t."landing_path",t."utm_source",t."utm_campaign" FROM public.auth_modal_opens t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_auth_modal_opens FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS analytics_exclude_actor ON public.auth_modal_opens;
CREATE TRIGGER analytics_exclude_actor BEFORE INSERT OR UPDATE ON public.auth_modal_opens FOR EACH ROW EXECUTE FUNCTION data_quality.guard_analytics_actor();
CREATE OR REPLACE VIEW data_quality.analytics_bando_alerts AS SELECT t."id",t."email",t."regione",t."source",t."unsub_token",t."created_at",t."last_listing_sent_at",t."last_bando_digest_sent_at" FROM public.bando_alerts t WHERE data_quality.analytics_row_allowed(to_jsonb(t)) AND NOT EXISTS(SELECT 1 FROM auth.users u WHERE lower(u.email)=lower(t.email) AND data_quality.analytics_account_excluded(u.id));
REVOKE ALL ON data_quality.analytics_bando_alerts FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE VIEW data_quality.analytics_blog_conversions AS SELECT t."id",t."post_slug",t."regione",t."kind",t."visitor_id",t."session_id",t."created_at" FROM public.blog_conversions t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_blog_conversions FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS analytics_exclude_actor ON public.blog_conversions;
CREATE TRIGGER analytics_exclude_actor BEFORE INSERT OR UPDATE ON public.blog_conversions FOR EACH ROW EXECUTE FUNCTION data_quality.guard_analytics_actor();
CREATE OR REPLACE VIEW data_quality.analytics_blog_listing_ad_events AS SELECT t."id",t."listing_id",t."post_slug",t."placement",t."kind",t."session_id",t."created_at" FROM public.blog_listing_ad_events t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_blog_listing_ad_events FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS analytics_exclude_actor ON public.blog_listing_ad_events;
CREATE TRIGGER analytics_exclude_actor BEFORE INSERT OR UPDATE ON public.blog_listing_ad_events FOR EACH ROW EXECUTE FUNCTION data_quality.guard_analytics_actor();
CREATE OR REPLACE VIEW data_quality.analytics_contact_reveals AS SELECT t."id",t."revealer_id",t."annuncio_id",t."seller_id",t."created_at" FROM public.contact_reveals t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_contact_reveals FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE VIEW data_quality.analytics_conversazioni AS SELECT t."id",t."annuncio_id",t."acquirente_id",t."venditore_id",t."created_at",t."is_support" FROM public.conversazioni t WHERE data_quality.analytics_row_allowed(to_jsonb(t)) AND t.is_support IS NOT TRUE;
REVOKE ALL ON data_quality.analytics_conversazioni FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE VIEW data_quality.analytics_listing_stats_daily AS SELECT t."annuncio_id",t."user_id",t."day",t."views",t."call_clicks",t."whatsapp_clicks",t."chat_clicks",t."saves",t."created_at",t."updated_at" FROM public.listing_stats_daily t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_listing_stats_daily FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS analytics_exclude_actor ON public.listing_stats_daily;
CREATE TRIGGER analytics_exclude_actor BEFORE INSERT OR UPDATE ON public.listing_stats_daily FOR EACH ROW EXECUTE FUNCTION data_quality.guard_analytics_actor();
CREATE OR REPLACE VIEW data_quality.analytics_location_search_events AS SELECT t."session_id",t."name",t."regione",t."provincia",t."created_at" FROM public.location_search_events t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_location_search_events FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS analytics_exclude_actor ON public.location_search_events;
CREATE TRIGGER analytics_exclude_actor BEFORE INSERT OR UPDATE ON public.location_search_events FOR EACH ROW EXECUTE FUNCTION data_quality.guard_analytics_actor();
CREATE OR REPLACE VIEW data_quality.analytics_messaggi AS SELECT t."id",t."conversazione_id",t."mittente_id",t."testo",t."letto",t."created_at" FROM public.messaggi t WHERE data_quality.analytics_row_allowed(to_jsonb(t)) AND EXISTS(SELECT 1 FROM data_quality.analytics_conversazioni c WHERE c.id=t.conversazione_id);
REVOKE ALL ON data_quality.analytics_messaggi FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE VIEW data_quality.analytics_page_views AS SELECT t."id",t."path",t."visitor_id",t."session_id",t."referrer",t."created_at",t."utm_source",t."utm_campaign" FROM public.page_views t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_page_views FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS analytics_exclude_actor ON public.page_views;
CREATE TRIGGER analytics_exclude_actor BEFORE INSERT OR UPDATE ON public.page_views FOR EACH ROW EXECUTE FUNCTION data_quality.guard_analytics_actor();
CREATE OR REPLACE VIEW data_quality.analytics_payments AS SELECT t."id",t."user_id",t."annuncio_id",t."amount_cents",t."currency",t."tier",t."status",t."stripe_session_id",t."stripe_payment_intent",t."customer_email",t."created_at",t."activated_at",t."listing_title",t."listing_id_snapshot",t."paid_at",t."promotion_starts_at",t."promotion_ends_at",t."refunded_cents",t."checkout_session_id",t."bundle_size",t."bundle_discount",t."list_price_cents" FROM public.payments t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_payments FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE VIEW data_quality.analytics_personal_ad_events AS SELECT t."id",t."ad_id",t."format",t."placement",t."kind",t."session_id",t."user_id",t."claimed_at",t."created_at",t."article_slug",t."creative_version",t."context_version",t."context" FROM public.personal_ad_events t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_personal_ad_events FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS analytics_exclude_actor ON public.personal_ad_events;
CREATE TRIGGER analytics_exclude_actor BEFORE INSERT OR UPDATE ON public.personal_ad_events FOR EACH ROW EXECUTE FUNCTION data_quality.guard_analytics_actor();
CREATE OR REPLACE VIEW data_quality.analytics_personal_ad_fair_actions AS SELECT t."id",t."user_id",t."occurred_at" FROM public.personal_ad_fair_actions t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_personal_ad_fair_actions FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS analytics_exclude_actor ON public.personal_ad_fair_actions;
CREATE TRIGGER analytics_exclude_actor BEFORE INSERT OR UPDATE ON public.personal_ad_fair_actions FOR EACH ROW EXECUTE FUNCTION data_quality.guard_analytics_actor();
CREATE OR REPLACE VIEW data_quality.analytics_profiles AS SELECT t."id",t."nome",t."cognome",t."telefono",t."created_at",t."avatar_url",t."is_admin",t."email_digest",t."email_stats",t."unsub_token",t."vetrina_welcome_days",t."is_demo" FROM public.profiles t WHERE NOT data_quality.analytics_account_excluded(t.id);
REVOKE ALL ON data_quality.analytics_profiles FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE VIEW data_quality.analytics_site_analytics_events AS SELECT t."id",t."created_at",t."session_id",t."name",t."page",t."entity",t."device",t."source",t."entry_page",t."campaign",t."medium",t."channel",t."authenticated",t."data" FROM public.site_analytics_events t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_site_analytics_events FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS analytics_exclude_actor ON public.site_analytics_events;
CREATE TRIGGER analytics_exclude_actor BEFORE INSERT OR UPDATE ON public.site_analytics_events FOR EACH ROW EXECUTE FUNCTION data_quality.guard_analytics_actor();
CREATE OR REPLACE VIEW data_quality.analytics_valutatore_logs AS SELECT t."id",t."session_token",t."user_id",t."annuncio_id",t."fatturato",t."frequenza",t."durata_fiera",t."stagionalita",t."zona",t."settore",t."posizione",t."anzianita",t."prezzo_min",t."prezzo_avg",t."prezzo_max",t."affitto_annuo",t."affitto_mensile",t."created_at",t."user_linked_at",t."annuncio_linked_at",t."referrer",t."utm_source",t."utm_medium",t."utm_campaign",t."landing_path",t."device_type",t."country",t."region",t."tempo_compilazione_sec",t."algoritmo_version",t."dettagli_calcolo",t."request_id" FROM public.valutatore_logs t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_valutatore_logs FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE VIEW data_quality.analytics_vetrina_checkout_analytics AS SELECT t."session_id",t."flow_id",t."user_id",t."email_id",t."source",t."tier",t."listing_count",t."amount_cents",t."created_at",t."cancelled_at",t."is_test" FROM public.vetrina_checkout_analytics t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_vetrina_checkout_analytics FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE VIEW data_quality.analytics_vetrina_email_log AS SELECT t."id",t."user_id",t."campaign",t."variant",t."status",t."created_at",t."sent_at",t."provider_id",t."provider_event",t."error_code",t."listing_ids",t."subject",t."is_test",t."tracking_token",t."tracking_enabled",t."delivery_confirmed",t."opened_at",t."clicked_at",t."last_open_at",t."last_click_at",t."open_count",t."click_count",t."offered_tier",t."template_family" FROM public.vetrina_email_log t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_vetrina_email_log FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE VIEW data_quality.analytics_vetrina_funnel_events AS SELECT t."id",t."user_id",t."kind",t."source",t."tier",t."listing_count",t."email_id",t."flow_id",t."created_at",t."is_test" FROM public.vetrina_funnel_events t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_vetrina_funnel_events FROM PUBLIC,anon,authenticated;
CREATE OR REPLACE VIEW data_quality.analytics_vetrina_stats_daily AS SELECT t."annuncio_id",t."user_id",t."day",t."impressions",t."detail_views",t."contact_actions" FROM public.vetrina_stats_daily t WHERE data_quality.analytics_row_allowed(to_jsonb(t));
REVOKE ALL ON data_quality.analytics_vetrina_stats_daily FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS analytics_exclude_actor ON public.vetrina_stats_daily;
CREATE TRIGGER analytics_exclude_actor BEFORE INSERT OR UPDATE ON public.vetrina_stats_daily FOR EACH ROW EXECUTE FUNCTION data_quality.guard_analytics_actor();

-- Known authenticated historical sessions can be excluded without deleting events.
INSERT INTO data_quality.analytics_excluded_identifiers(kind,value)
 SELECT 'session',session_id FROM public.personal_ad_events
 WHERE data_quality.analytics_account_excluded(user_id) AND session_id ~ '^[a-zA-Z0-9_-]{8,80}$' ON CONFLICT DO NOTHING;
INSERT INTO data_quality.analytics_excluded_identifiers(kind,value)
 SELECT 'auth_session',anon_session FROM public.auth_modal_opens
 WHERE data_quality.analytics_account_excluded(signed_up_user_id) AND anon_session ~ '^[a-zA-Z0-9_-]{8,80}$' ON CONFLICT DO NOTHING;
CREATE OR REPLACE FUNCTION data_quality.guard_internal_listing_counters()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF data_quality.analytics_account_excluded(auth.uid()) THEN
  NEW.visualizzazioni:=OLD.visualizzazioni; NEW.tel_clicks:=OLD.tel_clicks; NEW.saved_count:=OLD.saved_count;
 END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION data_quality.guard_internal_listing_counters() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS zz_analytics_internal_counters ON public.annunci;
CREATE TRIGGER zz_analytics_internal_counters BEFORE UPDATE ON public.annunci FOR EACH ROW EXECUTE FUNCTION data_quality.guard_internal_listing_counters();
CREATE OR REPLACE FUNCTION public._sync_saved_count()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  IF NOT data_quality.analytics_account_excluded(NEW.user_id) THEN
   UPDATE public.annunci SET saved_count=saved_count+1 WHERE id=NEW.annuncio_id;
   PERFORM public._bump_listing_daily(NEW.annuncio_id,'save',1);
  END IF;
  RETURN NEW;
 ELSIF TG_OP='DELETE' THEN
  IF NOT data_quality.analytics_account_excluded(OLD.user_id) THEN
   UPDATE public.annunci SET saved_count=greatest(saved_count-1,0) WHERE id=OLD.annuncio_id;
  END IF;
  RETURN OLD;
 END IF;
 RETURN NULL;
END $$;
-- Snapshot only counters that can be corrected from retained, attributable saves.
CREATE TABLE IF NOT EXISTS data_quality.analytics_counter_corrections (
 listing_id uuid PRIMARY KEY,old_saved_count integer NOT NULL,corrected_saved_count integer NOT NULL,
 corrected_at timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON data_quality.analytics_counter_corrections FROM PUBLIC,anon,authenticated;
INSERT INTO data_quality.analytics_counter_corrections(listing_id,old_saved_count,corrected_saved_count)
 SELECT a.id,a.saved_count,(SELECT count(*) FROM public.saved_listings s WHERE s.annuncio_id=a.id AND NOT data_quality.analytics_account_excluded(s.user_id))
 FROM public.annunci a WHERE EXISTS(SELECT 1 FROM public.saved_listings s WHERE s.annuncio_id=a.id AND data_quality.analytics_account_excluded(s.user_id))
 ON CONFLICT(listing_id) DO NOTHING;
UPDATE public.annunci a SET saved_count=(SELECT count(*) FROM public.saved_listings s WHERE s.annuncio_id=a.id AND NOT data_quality.analytics_account_excluded(s.user_id))
 WHERE a.id IN(SELECT listing_id FROM data_quality.analytics_counter_corrections);
CREATE TABLE IF NOT EXISTS data_quality.analytics_daily_save_corrections (
 listing_id uuid NOT NULL,day date NOT NULL,old_saves integer NOT NULL,removed_saves integer NOT NULL,
 corrected_at timestamptz NOT NULL DEFAULT now(),PRIMARY KEY(listing_id,day)
);
REVOKE ALL ON data_quality.analytics_daily_save_corrections FROM PUBLIC,anon,authenticated;
WITH affected AS(SELECT annuncio_id,(created_at AT TIME ZONE 'UTC')::date AS day,count(*) n FROM public.saved_listings
 WHERE data_quality.analytics_account_excluded(user_id) GROUP BY annuncio_id,(created_at AT TIME ZONE 'UTC')::date),
fresh AS(INSERT INTO data_quality.analytics_daily_save_corrections(listing_id,day,old_saves,removed_saves)
 SELECT s.annuncio_id,s.day,s.saves,least(s.saves,a.n)::integer FROM public.listing_stats_daily s JOIN affected a ON a.annuncio_id=s.annuncio_id AND a.day=s.day
 WHERE s.saves>0 ON CONFLICT DO NOTHING RETURNING *)
UPDATE public.listing_stats_daily s SET saves=greatest(s.saves-f.removed_saves,0) FROM fresh f WHERE s.annuncio_id=f.listing_id AND s.day=f.day;

CREATE OR REPLACE FUNCTION public.admin_acquisition_stats(p_days integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_days integer := least(365, greatest(1, coalesce(p_days,30)));
    v_since timestamptz;
    v_result jsonb;
BEGIN
    IF NOT coalesce((SELECT is_admin FROM public.profiles WHERE id=auth.uid()),false) THEN
        RETURN jsonb_build_object('error','forbidden');
    END IF;
    v_since := now() - make_interval(days => v_days);
    WITH
    -- Prima pagina nell'intero storico: una visita precedente al periodo
    -- non viene trasformata in un nuovo ingresso dal filtro temporale.
    entries AS MATERIALIZED (
        SELECT DISTINCT ON (visitor_id,session_id) visitor_id, session_id, path, referrer,
            utm_source, utm_campaign, created_at, id
        FROM data_quality.analytics_page_views
        WHERE visitor_id IS NOT NULL AND session_id IS NOT NULL
        ORDER BY visitor_id, session_id, created_at, id
    ),
    traffic AS MATERIALIZED (
        SELECT *, public.acquisition_source(path,utm_source) AS source,
            coalesce(nullif(utm_source,''),
                nullif(lower(substring(referrer FROM '^https?://(?:www\.)?([^/:?#]+)')), ''),
                'diretto_sconosciuto') AS channel
        FROM entries WHERE created_at >= v_since AND created_at <= now()
    ),
    new_users AS MATERIALIZED (
        SELECT id,created_at FROM data_quality.analytics_profiles
        WHERE created_at >= v_since AND created_at <= now()
          AND NOT coalesce(is_admin,false) AND NOT coalesce(is_demo,false)
    ),
    -- Una sola attribuzione per account. Le aperture successive al signup
    -- e quelle senza pagina di ingresso non sono prove di provenienza.
    attributed AS MATERIALIZED (
        SELECT DISTINCT ON (u.id) u.id,
            public.acquisition_source(a.landing_path,a.utm_source) AS source
        FROM new_users u JOIN data_quality.analytics_auth_modal_opens a ON a.signed_up_user_id=u.id
        WHERE a.landing_path IS NOT NULL
          AND a.opened_at BETWEEN u.created_at - interval '24 hours' AND u.created_at
        ORDER BY u.id,a.opened_at,a.id
    ),
    sources(source,sort_order) AS (VALUES ('blog',1),('bandi',2),('valutatore',3),('homepage',4),('fiere',5),('altro',6)),
    by_source AS (
        SELECT s.source,s.sort_order,
            (SELECT count(*) FROM traffic t WHERE t.source=s.source) AS sessions,
            (SELECT count(DISTINCT visitor_id) FROM traffic t WHERE t.source=s.source) AS visitors,
            (SELECT count(*) FROM attributed a WHERE a.source=s.source) AS signups
        FROM sources s
    ),
    channels AS (
        SELECT channel,count(*) AS sessions FROM traffic GROUP BY channel ORDER BY sessions DESC,channel LIMIT 8
    )
    SELECT jsonb_build_object(
        'period_days',v_days,
        'total_sessions',(SELECT count(*) FROM traffic),
        'total_visitors',(SELECT count(DISTINCT visitor_id) FROM traffic),
        'total_signups',(SELECT count(*) FROM new_users),
        'attributed_signups',(SELECT count(*) FROM attributed),
        'unattributed_signups',(SELECT count(*) FROM new_users)-(SELECT count(*) FROM attributed),
        'attribution_since',(SELECT min(opened_at) FROM data_quality.analytics_auth_modal_opens WHERE landing_path IS NOT NULL),
        'rows',(SELECT jsonb_agg(jsonb_build_object(
            'source',source,'sessions',sessions,'visitors',visitors,'signups',signups,
            'share_pct',coalesce(round(100.0*sessions/nullif((SELECT count(*) FROM traffic),0),1),0)
        ) ORDER BY sort_order) FROM by_source),
        'channels',coalesce((SELECT jsonb_agg(to_jsonb(c) ORDER BY sessions DESC,channel) FROM channels c),'[]'::jsonb)
    ) INTO v_result;
    RETURN v_result;
END $function$
;

CREATE OR REPLACE FUNCTION public.admin_bando_alerts_stats()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_is_admin boolean;
    v_total int;
    v_today int;
    v_7d int;
    v_30d int;
    v_by_regione jsonb;
    v_by_source jsonb;
    v_recent jsonb;
BEGIN
    SELECT COALESCE(is_admin, false) INTO v_is_admin
    FROM public.profiles
    WHERE id = auth.uid();

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
    END IF;

    SELECT COUNT(*) INTO v_total FROM data_quality.analytics_bando_alerts;
    SELECT COUNT(*) INTO v_today FROM data_quality.analytics_bando_alerts WHERE created_at > now() - interval '1 day';
    SELECT COUNT(*) INTO v_7d FROM data_quality.analytics_bando_alerts WHERE created_at > now() - interval '7 days';
    SELECT COUNT(*) INTO v_30d FROM data_quality.analytics_bando_alerts WHERE created_at > now() - interval '30 days';

    SELECT COALESCE(jsonb_agg(t ORDER BY (t->>'iscritti')::int DESC), '[]'::jsonb) INTO v_by_regione
    FROM (
        SELECT jsonb_build_object('regione', regione, 'iscritti', COUNT(*)) AS t
        FROM data_quality.analytics_bando_alerts
        GROUP BY regione
    ) sub;

    SELECT COALESCE(jsonb_agg(t ORDER BY (t->>'iscritti')::int DESC), '[]'::jsonb) INTO v_by_source
    FROM (
        SELECT jsonb_build_object('source', COALESCE(source, 'unknown'), 'iscritti', COUNT(*)) AS t
        FROM data_quality.analytics_bando_alerts
        GROUP BY source
    ) sub;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'email', email,
        'regione', regione,
        'source', source,
        'created_at', created_at
    ) ORDER BY created_at DESC), '[]'::jsonb) INTO v_recent
    FROM (
        SELECT email, regione, source, created_at
        FROM data_quality.analytics_bando_alerts
        ORDER BY created_at DESC
        LIMIT 20
    ) sub;

    RETURN jsonb_build_object(
        'total', v_total,
        'today', v_today,
        'last_7d', v_7d,
        'last_30d', v_30d,
        'by_regione', v_by_regione,
        'by_source', v_by_source,
        'recent', v_recent
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_blog_listing_ads(p_days integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE since_at timestamptz:=now()-make_interval(days=>least(365,greatest(1,coalesce(p_days,30)))); result jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin IS TRUE)
 THEN RAISE EXCEPTION 'Solo amministratore' USING ERRCODE='42501'; END IF;
 WITH measured AS (
  SELECT c.id FROM data_quality.analytics_blog_listing_ad_events c WHERE c.kind='click' AND c.created_at>=since_at
  AND EXISTS(SELECT 1 FROM data_quality.analytics_blog_listing_ad_events i WHERE i.kind='impression' AND i.session_id=c.session_id
   AND i.listing_id=c.listing_id AND i.post_slug=c.post_slug AND i.placement=c.placement AND i.created_at<=c.created_at)
 ), rows AS (
  SELECT e.listing_id,e.post_slug,e.placement,
   count(*) FILTER(WHERE e.kind='impression') AS impressions,
   count(*) FILTER(WHERE e.kind='click') AS clicks,
   count(*) FILTER(WHERE e.id IN (SELECT id FROM measured) AND EXISTS(
    SELECT 1 FROM data_quality.analytics_blog_listing_ad_events i WHERE i.kind='impression' AND i.created_at>=since_at
    AND i.session_id=e.session_id AND i.listing_id=e.listing_id AND i.post_slug=e.post_slug AND i.placement=e.placement)) AS measured_clicks
  FROM data_quality.analytics_blog_listing_ad_events e WHERE e.created_at>=since_at GROUP BY e.listing_id,e.post_slug,e.placement
 ), inventory AS (
  SELECT a.id,a.titolo,a.comune,a.regione,a.stato,a.prezzo,a.img_urls,a.featured_until,
   coalesce(a.status='active' AND a.is_demo IS NOT TRUE AND a.featured IS TRUE AND a.featured_until>now()
    AND a.featured_tier IN ('10d','30d','90d') AND (a.expires_at IS NULL OR a.expires_at>now()),false) AS active
  FROM data_quality.analytics_annunci a WHERE a.is_demo IS NOT TRUE AND (
   (a.status='active' AND a.featured IS TRUE AND a.featured_until>now() AND a.featured_tier IN ('10d','30d','90d')
    AND (a.expires_at IS NULL OR a.expires_at>now())) OR a.id IN (SELECT listing_id FROM rows))
 ) SELECT jsonb_build_object(
  'listings',coalesce((SELECT jsonb_agg(to_jsonb(i) ORDER BY i.active DESC,i.titolo,i.id) FROM inventory i),'[]'::jsonb),
  'rows',coalesce((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.clicks DESC,r.listing_id,r.post_slug,r.placement) FROM rows r),'[]'::jsonb),
  'started_at',(SELECT min(created_at) FROM data_quality.analytics_blog_listing_ad_events),'updated_at',now()
 ) INTO result;
 RETURN result;
END $function$
;

CREATE OR REPLACE FUNCTION public.admin_blog_stats(p_days integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_caller uuid := auth.uid();
    v_is_admin boolean;
    v_since timestamptz := now() - (p_days || ' days')::interval;
    v_rows jsonb;
    v_total_views int;
    v_total_conv int;
BEGIN
    IF v_caller IS NULL THEN
        RAISE EXCEPTION 'unauthorized' USING ERRCODE = '42501';
    END IF;
    SELECT COALESCE(is_admin, false) INTO v_is_admin FROM data_quality.analytics_profiles WHERE id = v_caller;
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
    END IF;

    WITH pv AS (
        SELECT
            substring(path FROM '^/blog/(.+)$') AS slug,
            visitor_id
        FROM data_quality.analytics_page_views
        WHERE created_at >= v_since
          AND path LIKE '/blog/%'
    ),
    pv_agg AS (
        SELECT
            slug,
            COUNT(*) AS views,
            COUNT(DISTINCT visitor_id) AS uniq
        FROM pv
        WHERE slug IS NOT NULL
        GROUP BY slug
    ),
    bc_agg AS (
        SELECT
            post_slug AS slug,
            COUNT(*) FILTER (WHERE kind = 'cta_annunci_click')   AS cta_clicks,
            COUNT(*) FILTER (WHERE kind = 'alert_signup')        AS alert_signups,
            COUNT(*) FILTER (WHERE kind = 'box_listing_click')   AS box_clicks,
            COUNT(*) AS total_conv
        FROM data_quality.analytics_blog_conversions
        WHERE created_at >= v_since
          AND post_slug IS NOT NULL
        GROUP BY post_slug
    ),
    merged AS (
        SELECT
            COALESCE(p.slug, b.slug) AS slug,
            COALESCE(p.views, 0) AS views,
            COALESCE(p.uniq, 0) AS uniq,
            COALESCE(b.cta_clicks, 0) AS cta_clicks,
            COALESCE(b.alert_signups, 0) AS alert_signups,
            COALESCE(b.box_clicks, 0) AS box_clicks,
            COALESCE(b.total_conv, 0) AS total_conv
        FROM pv_agg p
        FULL OUTER JOIN bc_agg b ON p.slug = b.slug
    )
    SELECT
        jsonb_agg(
            jsonb_build_object(
                'slug',           m.slug,
                'title',          bp.title,
                'category',       bp.category,
                'views',          m.views,
                'unique_visitors', m.uniq,
                'cta_clicks',     m.cta_clicks,
                'alert_signups',  m.alert_signups,
                'box_clicks',     m.box_clicks,
                'total_conv',     m.total_conv,
                'cr_pct',         CASE WHEN m.views > 0
                                       THEN ROUND((m.total_conv::numeric / m.views) * 100, 1)
                                       ELSE 0 END
            )
            ORDER BY m.views DESC, m.total_conv DESC
        ),
        SUM(m.views),
        SUM(m.total_conv)
    INTO v_rows, v_total_views, v_total_conv
    FROM merged m
    LEFT JOIN public.blog_posts bp ON bp.slug = m.slug;

    RETURN jsonb_build_object(
        'period_days', p_days,
        'total_views', COALESCE(v_total_views, 0),
        'total_conversions', COALESCE(v_total_conv, 0),
        'rows', COALESCE(v_rows, '[]'::jsonb)
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_control_room(p_offset integer DEFAULT 0, p_kind text DEFAULT 'all'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$

DECLARE result jsonb;

BEGIN

    IF NOT data_quality.is_admin() THEN RAISE EXCEPTION 'Accesso amministratore richiesto' USING ERRCODE='42501'; END IF;

    IF p_kind NOT IN ('all','annuncio','profilo','alert') OR p_offset<0 OR p_offset>100000 THEN RAISE EXCEPTION 'Filtro non valido'; END IF;

    WITH listing_quality AS MATERIALIZED (

      SELECT a.id,a.titolo,a.comune,a.status,a.created_at,data_quality.listing_issues(to_jsonb(a)) AS issues

      FROM data_quality.analytics_annunci a WHERE NOT a.is_demo AND a.status IN ('active','pending')

    ), profile_quality AS MATERIALIZED (

      SELECT p.id,trim(coalesce(p.nome,'')||' '||coalesce(p.cognome,'')) AS name,p.created_at,

        array_remove(ARRAY[CASE WHEN nullif(trim(p.nome),'') IS NULL THEN 'nome_mancante' END,

          CASE WHEN nullif(trim(p.telefono),'') IS NOT NULL AND data_quality.phone_digits(p.telefono) IS NULL THEN 'telefono' END,

          CASE WHEN nullif(trim(p.telefono),'') IS NULL THEN 'telefono_facoltativo' END,

          CASE WHEN p.nome IS NOT NULL AND NOT data_quality.valid_text(p.nome,1,100) THEN 'nome' END],NULL) AS issues

      FROM data_quality.analytics_profiles p WHERE NOT p.is_demo

    ), all_issues AS MATERIALIZED (

      SELECT 'annuncio' AS kind,id,titolo AS label,comune AS context,status,created_at,issues,'warning' AS severity FROM listing_quality WHERE cardinality(issues)>0

      UNION ALL SELECT 'profilo',id,name,'Profilo utente',NULL,created_at,issues,

         CASE WHEN issues=ARRAY['telefono_facoltativo']::text[] THEN 'info' ELSE 'warning' END FROM profile_quality WHERE cardinality(issues)>0

      UNION ALL SELECT 'alert',al.id,coalesce(al.comune,al.regione,'Tutta Italia'),'Avviso geografico',NULL,al.created_at,

        ARRAY['alert_localita'], 'warning' FROM public.alerts al

        WHERE (al.lat IS NULL)<>(al.lng IS NULL) OR

          (nullif(al.comune,'') IS NOT NULL AND NOT EXISTS(SELECT 1 FROM data_quality.locations l WHERE lower(l.name)=lower(al.comune) AND (nullif(al.regione,'') IS NULL OR l.regione=al.regione)) AND al.comune IS DISTINCT FROM al.regione)

    ), filtered AS (SELECT * FROM all_issues WHERE p_kind='all' OR kind=p_kind), page AS (

      SELECT * FROM filtered ORDER BY CASE severity WHEN 'warning' THEN 0 ELSE 1 END,kind,created_at DESC,id LIMIT 25 OFFSET p_offset

    )

    SELECT jsonb_build_object(

      'checked_at',now(),'issues_total',(SELECT count(*) FROM filtered),'offset',p_offset,'page_size',25,

      'issues',coalesce((SELECT jsonb_agg(to_jsonb(page)) FROM page),'[]'),

      'summary',jsonb_build_object(

        'total_listings',(SELECT count(*) FROM data_quality.analytics_annunci WHERE NOT is_demo),

        'available_listings',(SELECT count(*) FROM data_quality.analytics_annunci WHERE NOT is_demo AND status='active' AND (expires_at IS NULL OR expires_at>now())),

        'total_users',(SELECT count(*) FROM data_quality.analytics_profiles WHERE NOT is_demo),

        'listings_checked',(SELECT count(*) FROM listing_quality),'listings_with_issues',(SELECT count(*) FROM listing_quality WHERE cardinality(issues)>0),

        'profiles_checked',(SELECT count(*) FROM profile_quality),'profiles_with_issues',(SELECT count(*) FROM profile_quality WHERE cardinality(array_remove(issues,'telefono_facoltativo'))>0),

        'optional_phone_missing',(SELECT count(*) FROM profile_quality WHERE 'telefono_facoltativo'=ANY(issues)),

        'location_issues',(SELECT count(*) FROM listing_quality WHERE 'localita'=ANY(issues)),

        'pending_listings',(SELECT count(*) FROM data_quality.analytics_annunci WHERE status='pending' AND NOT is_demo),

        'pending_bandi',(SELECT count(*) FROM public.bando_scouting_log WHERE status='pending'),

        'open_reports',(SELECT count(*) FROM public.conversation_reports WHERE status='open'),

        'expired_listings',(SELECT count(*) FROM data_quality.analytics_annunci WHERE status='active' AND NOT is_demo AND expires_at<=now()),

        'expiring_listings',(SELECT count(*) FROM data_quality.analytics_annunci WHERE status='active' AND NOT is_demo AND expires_at>now() AND expires_at<=now()+interval '14 days'),

        'support_unread',(SELECT count(*) FROM public.messaggi m JOIN public.conversazioni c ON c.id=m.conversazione_id WHERE c.is_support AND c.venditore_id=auth.uid() AND m.mittente_id<>auth.uid() AND coalesce(m.letto,false)=false),

        'paid_waiting',(SELECT count(*) FROM public.payments WHERE status='succeeded' AND activated_at IS NULL AND stripe_session_id LIKE 'cs_live_%'),

        'paid_activation_problem',(SELECT count(*) FROM public.payments p LEFT JOIN data_quality.analytics_annunci a ON a.id=p.annuncio_id WHERE p.status='succeeded' AND p.activated_at IS NULL AND p.stripe_session_id LIKE 'cs_live_%' AND (a.id IS NULL OR a.status='active')),

        'gross_cents',(SELECT coalesce(sum(amount_cents),0) FROM public.payments WHERE status='succeeded' AND stripe_session_id LIKE 'cs_live_%'),

        'refunded_cents',(SELECT coalesce(sum(refunded_cents),0) FROM public.payments WHERE status='succeeded' AND stripe_session_id LIKE 'cs_live_%'),

        'new_users_30d',(SELECT count(*) FROM data_quality.analytics_profiles WHERE NOT is_demo AND created_at>=now()-interval '30 days'),

        'new_listings_30d',(SELECT count(*) FROM data_quality.analytics_annunci WHERE NOT is_demo AND status<>'deleted' AND created_at>=now()-interval '30 days'),

        'valuations_30d',(SELECT count(*) FROM data_quality.analytics_valutatore_logs WHERE created_at>=now()-interval '30 days'),

        'old_valuation_model',(SELECT count(*) FROM data_quality.analytics_valutatore_logs WHERE algoritmo_version IS DISTINCT FROM '2.6'),

        'bando_subscribers',(SELECT count(*) FROM data_quality.analytics_bando_alerts),

        'last_candidate',(SELECT max(discovered_at) FROM public.bando_scouting_log),

        'last_anomaly_check',(SELECT max(checked_at) FROM public.admin_alerts_log),

        'unverified_email_bypass',(SELECT count(*) FROM auth.users u JOIN data_quality.analytics_profiles p ON p.id=u.id WHERE NOT p.is_demo AND u.raw_user_meta_data->>'email_verification_mode'='bypass'),

        'locations_loaded',(SELECT count(*) FROM data_quality.locations)

      ),

      'automations',coalesce((SELECT jsonb_agg(t) FROM (

        SELECT j.jobname,j.schedule,j.active,r.status AS last_status,r.start_time AS last_started_at,r.end_time AS last_finished_at

        FROM cron.job j LEFT JOIN LATERAL (SELECT status,start_time,end_time FROM cron.job_run_details d WHERE d.jobid=j.jobid ORDER BY start_time DESC LIMIT 1) r ON true

        WHERE j.jobname IN ('scout-bandi-daily','admin-anomaly-check','engagement-reminders','weekly-buyer-digest','weekly-seller-stats','unfeature-expired-daily','auth-modal-opens-cleanup')

      ) t),'[]')

    ) INTO result;

    RETURN result;

END $function$
;

CREATE OR REPLACE FUNCTION public.admin_funnel_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    is_adm boolean;
    res    json;
BEGIN
    SELECT COALESCE((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false)
        INTO is_adm;
    IF NOT is_adm THEN
        RETURN json_build_object('error', 'forbidden');
    END IF;

    SELECT json_build_object(
        'all_time', json_build_object(
            'signups', (SELECT count(*) FROM data_quality.analytics_profiles WHERE is_demo = false),
            'profile_complete', (
                SELECT count(*) FROM data_quality.analytics_profiles
                WHERE is_demo = false
                  AND telefono IS NOT NULL AND telefono <> ''
            ),
            'first_listing', (
                SELECT count(DISTINCT user_id) FROM data_quality.analytics_annunci
                WHERE status <> 'deleted'
                  AND user_id IS NOT NULL
                  AND is_demo = false
            ),
            'first_contact_received', (
                SELECT count(DISTINCT c.venditore_id) FROM data_quality.analytics_conversazioni c
                JOIN data_quality.analytics_profiles p ON p.id = c.venditore_id
                WHERE c.venditore_id IS NOT NULL
                  AND p.is_demo = false
            ),
            'first_message_sent', (
                SELECT count(DISTINCT m.mittente_id) FROM data_quality.analytics_messaggi m
                JOIN data_quality.analytics_profiles p ON p.id = m.mittente_id
                WHERE m.mittente_id IS NOT NULL
                  AND p.is_demo = false
            )
        ),
        'last_30_days', json_build_object(
            'signups', (
                SELECT count(*) FROM data_quality.analytics_profiles
                WHERE is_demo = false
                  AND created_at >= now() - interval '30 days'
            ),
            'profile_complete', (
                SELECT count(*) FROM data_quality.analytics_profiles
                WHERE is_demo = false
                  AND created_at >= now() - interval '30 days'
                  AND telefono IS NOT NULL AND telefono <> ''
            ),
            'first_listing', (
                SELECT count(DISTINCT a.user_id) FROM data_quality.analytics_annunci a
                JOIN data_quality.analytics_profiles p ON p.id = a.user_id
                WHERE a.status <> 'deleted'
                  AND a.user_id IS NOT NULL
                  AND a.is_demo = false
                  AND p.is_demo = false
                  AND p.created_at >= now() - interval '30 days'
            ),
            'first_contact_received', (
                SELECT count(DISTINCT c.venditore_id) FROM data_quality.analytics_conversazioni c
                JOIN data_quality.analytics_profiles p ON p.id = c.venditore_id
                WHERE c.venditore_id IS NOT NULL
                  AND p.is_demo = false
                  AND p.created_at >= now() - interval '30 days'
            ),
            'first_message_sent', (
                SELECT count(DISTINCT m.mittente_id) FROM data_quality.analytics_messaggi m
                JOIN data_quality.analytics_profiles p ON p.id = m.mittente_id
                WHERE m.mittente_id IS NOT NULL
                  AND p.is_demo = false
                  AND p.created_at >= now() - interval '30 days'
            )
        )
    ) INTO res;
    RETURN res;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_page_views_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    is_adm boolean;
    res    json;
begin
    select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
        into is_adm;
    if not is_adm then
        return json_build_object('error', 'forbidden');
    end if;

    select json_build_object(
        'total', (select count(*) from data_quality.analytics_page_views),
        'today', (select count(*) from data_quality.analytics_page_views where created_at >= date_trunc('day', now())),
        'monthly_12', (
            select coalesce(json_agg(json_build_object('bucket', bucket, 'count', cnt) order by bucket), '[]'::json)
            from (
                select date_trunc('month', created_at) as bucket, count(*)::int as cnt
                from data_quality.analytics_page_views
                where created_at >= (date_trunc('month', now()) - interval '11 months')
                group by 1
            ) t
        ),
        'all_monthly', (
            select coalesce(json_agg(json_build_object('bucket', bucket, 'count', cnt) order by bucket), '[]'::json)
            from (
                select date_trunc('month', created_at) as bucket, count(*)::int as cnt
                from data_quality.analytics_page_views
                group by 1
            ) t
        ),
        'yearly', (
            select coalesce(json_agg(json_build_object('bucket', bucket, 'count', cnt) order by bucket), '[]'::json)
            from (
                select date_trunc('year', created_at) as bucket, count(*)::int as cnt
                from data_quality.analytics_page_views
                group by 1
            ) t
        ),
        'daily_30', (
            select coalesce(json_agg(json_build_object('bucket', bucket, 'count', cnt) order by bucket), '[]'::json)
            from (
                select date_trunc('day', created_at) as bucket, count(*)::int as cnt
                from data_quality.analytics_page_views
                where created_at >= (now() - interval '30 days')
                group by 1
            ) t
        )
    ) into res;

    return res;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_personal_ad_events(p_days integer DEFAULT 30, p_until timestamp with time zone DEFAULT NULL::timestamp with time zone, p_before timestamp with time zone DEFAULT NULL::timestamp with time zone, p_before_id uuid DEFAULT NULL::uuid, p_limit integer DEFAULT 500)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE until_at timestamptz:=LEAST(COALESCE(p_until,now()),now()); size integer:=LEAST(500,GREATEST(1,COALESCE(p_limit,500))); items jsonb; total integer;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin IS TRUE) THEN RAISE EXCEPTION 'Solo amministratore' USING ERRCODE='42501'; END IF;
 IF (p_before IS NULL)<>(p_before_id IS NULL) THEN RAISE EXCEPTION 'Cursore non valido' USING ERRCODE='22023'; END IF;
 WITH selected AS (
  SELECT id,ad_id,format,placement,kind,created_at,article_slug,creative_version,context_version,context FROM data_quality.analytics_personal_ad_events
  WHERE created_at>=until_at-make_interval(days=>LEAST(365,GREATEST(1,COALESCE(p_days,30)))) AND created_at<=until_at
   AND (p_before IS NULL OR (created_at,id)<(p_before,p_before_id)) ORDER BY created_at DESC,id DESC LIMIT size+1
 ) SELECT COALESCE(jsonb_agg(to_jsonb(selected) ORDER BY created_at DESC,id DESC),'[]'::jsonb),count(*) INTO items,total FROM selected;
 RETURN jsonb_build_object('until',until_at,'rows',CASE WHEN total>size THEN items-size ELSE items END,'has_more',total>size,
 'next',CASE WHEN total>size THEN jsonb_build_object('at',items->(size-1)->>'created_at','id',items->(size-1)->>'id') ELSE NULL END);
END $function$
;

CREATE OR REPLACE FUNCTION public.admin_personal_ads(p_days integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

DECLARE since_at timestamptz:=now()-make_interval(days=>LEAST(365,GREATEST(1,COALESCE(p_days,30)))); result jsonb;

BEGIN

 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin IS TRUE)

 THEN RAISE EXCEPTION 'Solo amministratore' USING ERRCODE='42501'; END IF;

 WITH actions AS (

  SELECT 'signup' kind,p.id::text action_id,p.id uid,p.created_at at,p.created_at started_at,0::bigint cents,0::bigint refunded FROM data_quality.analytics_profiles p

   WHERE p.created_at>=since_at AND p.is_admin IS NOT TRUE AND p.is_demo IS NOT TRUE

  UNION ALL SELECT 'listing',a.id::text,a.user_id,a.created_at,a.created_at,0,0 FROM data_quality.analytics_annunci a

   WHERE a.created_at>=since_at AND a.status IS DISTINCT FROM 'draft' AND a.is_demo IS NOT TRUE

  UNION ALL SELECT 'contact',c.id::text,c.revealer_id,c.created_at,c.created_at,0,0 FROM data_quality.analytics_contact_reveals c

   WHERE c.created_at>=since_at AND c.revealer_id<>c.seller_id

  UNION ALL SELECT 'fair',s.id::text,s.user_id,s.occurred_at,s.occurred_at,0,0 FROM data_quality.analytics_personal_ad_fair_actions s WHERE s.occurred_at>=since_at

  UNION ALL SELECT 'paid',coalesce(p.checkout_session_id,p.stripe_session_id,p.id::text),p.user_id,min(p.paid_at),min(p.created_at),sum(p.amount_cents-p.refunded_cents),sum(p.refunded_cents)

   FROM data_quality.analytics_payments p WHERE p.paid_at>=since_at AND p.status IN('succeeded','refunded') AND p.currency='eur'

   GROUP BY coalesce(p.checkout_session_id,p.stripe_session_id,p.id::text),p.user_id

 ), attributed AS (

  SELECT a.*,e.id click_id,e.ad_id FROM actions a JOIN LATERAL (

    SELECT e.id,e.ad_id FROM data_quality.analytics_personal_ad_events e

    WHERE e.kind='click' AND e.user_id=a.uid AND e.created_at BETWEEN a.at-interval '7 days' AND a.started_at

    ORDER BY e.created_at DESC,e.id DESC LIMIT 1

  ) e ON true

 ), conversions AS (

  SELECT click_id,

   bool_or((ad_id LIKE 'vendi-%' AND kind='listing') OR (ad_id LIKE 'compra-%' AND kind='contact') OR (ad_id LIKE 'fiere-%' AND kind='fair')) AS goal,

   count(*) FILTER(WHERE kind='signup') signups,count(*) FILTER(WHERE kind='listing') listings,

   count(*) FILTER(WHERE kind='contact') contacts,count(*) FILTER(WHERE kind='fair') fairs,

   count(*) FILTER(WHERE kind='paid') paid_orders,coalesce(sum(cents) FILTER(WHERE kind='paid'),0) revenue_cents,

   coalesce(sum(refunded) FILTER(WHERE kind='paid'),0) refunded_cents

   FROM attributed GROUP BY click_id

 ), grouped AS (

  SELECT e.ad_id,e.format,e.placement,e.article_slug,e.creative_version,e.context_version,
   max(e.context->>'article_title') article_title,e.context->>'article_region' article_region,to_char(e.created_at AT TIME ZONE 'UTC','YYYY-MM-DD') AS event_day,
   COALESCE(e.context->>'device_class','unknown') device_class,COALESCE(e.context->>'source','unknown') source,
   COALESCE(e.context->>'referrer_type','unknown') referrer_type,COALESCE(e.context->>'motion','unknown') motion,
   COALESCE(e.context->>'match_basis','unknown') match_basis,e.context->'topics' topics,e.context->'keywords' keywords,e.context->'priority_matches' priority_matches,e.context->>'selection_weight' selection_weight,
   e.context->>'article_published_at' article_published_at,e.context->>'engine_version' engine_version,
   e.context->>'post_rule_revision' post_rule_revision,e.context->>'ad_rule_revision' ad_rule_revision,
   coalesce(sum((e.context->>'visible_ms')::bigint) FILTER(WHERE e.kind='click'),0) visible_click_ms_sum,
   count(*) FILTER(WHERE e.kind='click' AND e.context ? 'visible_ms') timed_clicks,
   coalesce(sum((e.context->>'page_ms')::bigint) FILTER(WHERE e.kind='click'),0) page_click_ms_sum,
   count(*) FILTER(WHERE e.kind='click' AND e.context ? 'page_ms') page_timed_clicks,

   count(*) FILTER(WHERE e.kind='impression') impressions,count(*) FILTER(WHERE e.kind='click') clicks,

   count(*) FILTER(WHERE e.kind='click' AND e.session_id IS NOT NULL AND EXISTS(

     SELECT 1 FROM data_quality.analytics_personal_ad_events i WHERE i.kind='impression' AND i.ad_id=e.ad_id AND i.format=e.format

      AND i.placement=e.placement AND i.session_id=e.session_id AND i.article_slug=e.article_slug AND i.creative_version=e.creative_version AND i.created_at>=since_at AND i.created_at<=e.created_at)) measured_clicks,
   count(*) FILTER(WHERE c.goal) converted_clicks,

   coalesce(sum(c.signups),0) signups,coalesce(sum(c.listings),0) listings,coalesce(sum(c.contacts),0) contacts,coalesce(sum(c.fairs),0) fairs,

   coalesce(sum(c.paid_orders),0) paid_orders,coalesce(sum(c.revenue_cents),0) revenue_cents,coalesce(sum(c.refunded_cents),0) refunded_cents

  FROM data_quality.analytics_personal_ad_events e LEFT JOIN conversions c ON c.click_id=e.id WHERE e.created_at>=since_at

  GROUP BY e.ad_id,e.format,e.placement,e.article_slug,e.creative_version,e.context_version,
   to_char(e.created_at AT TIME ZONE 'UTC','YYYY-MM-DD'),e.context->>'article_region',e.context->>'device_class',e.context->>'source',e.context->>'referrer_type',
   e.context->>'motion',e.context->>'match_basis',e.context->'topics',e.context->'keywords',e.context->'priority_matches',e.context->>'selection_weight',e.context->>'article_published_at',
   e.context->>'engine_version',e.context->>'post_rule_revision',e.context->>'ad_rule_revision'

 ) SELECT jsonb_build_object('period_days',LEAST(365,GREATEST(1,COALESCE(p_days,30))),'updated_at',now(),

  'started_at',(SELECT min(created_at) FROM data_quality.analytics_personal_ad_events),
  'context_started_at',(SELECT min(created_at) FROM data_quality.analytics_personal_ad_events WHERE context_version=2),

  'rows',coalesce((SELECT jsonb_agg(to_jsonb(g) ORDER BY g.ad_id,g.format,g.placement) FROM grouped g),'[]'::jsonb)) INTO result;

 RETURN result;

END $function$
;

CREATE OR REPLACE FUNCTION public.admin_revenue_stats()
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
    is_adm boolean;
    res    json;
begin
    select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
        into is_adm;
    if not is_adm then
        return json_build_object('error', 'forbidden');
    end if;

    -- Solo session live (cs_live_*). Esclude cs_test_* (transazioni di test
    -- in fase di sviluppo). Le vetrine regalate admin non passano da payments
    -- (vanno su annunci.featured_tier='admin_free'), quindi non serve filtrare
    -- esplicitamente per tier.
    select json_build_object(
        'lifetime_cents', coalesce((
            select sum(amount_cents) from data_quality.analytics_payments
            where status = 'succeeded'
              and stripe_session_id like 'cs_live_%'
        ), 0),
        'mtd_cents', coalesce((
            select sum(amount_cents) from data_quality.analytics_payments
            where status = 'succeeded'
              and stripe_session_id like 'cs_live_%'
              and created_at >= date_trunc('month', now())
        ), 0),
        'count_paid', (
            select count(*) from data_quality.analytics_payments
            where status = 'succeeded'
              and stripe_session_id like 'cs_live_%'
        ),
        'count_paid_mtd', (
            select count(*) from data_quality.analytics_payments
            where status = 'succeeded'
              and stripe_session_id like 'cs_live_%'
              and created_at >= date_trunc('month', now())
        ),
        'today_cents', coalesce((
            select sum(amount_cents) from data_quality.analytics_payments
            where status = 'succeeded'
              and stripe_session_id like 'cs_live_%'
              and created_at >= date_trunc('day', now())
        ), 0),
        'today_count', (
            select count(*) from data_quality.analytics_payments
            where status = 'succeeded'
              and stripe_session_id like 'cs_live_%'
              and created_at >= date_trunc('day', now())
        )
    ) into res;

    return res;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_signup_funnel_by_source(p_days integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    is_adm boolean;
    res jsonb;
    total_opens int;
    total_signups int;
BEGIN
    SELECT coalesce((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false) INTO is_adm;
    IF NOT is_adm THEN
        RETURN jsonb_build_object('error', 'forbidden');
    END IF;

    -- Ridenominato il subquery in t1/t2 per evitare ambiguità di alias
    SELECT
        coalesce(jsonb_agg(t.row_obj ORDER BY (t.row_obj->>'opens')::int DESC), '[]'::jsonb),
        coalesce(sum((t.row_obj->>'opens')::int), 0),
        coalesce(sum((t.row_obj->>'signups')::int), 0)
    INTO res, total_opens, total_signups
    FROM (
        SELECT jsonb_build_object(
            'source', src,
            'opens', opens_count,
            'signups', signups_count,
            'conversion_pct', CASE WHEN opens_count > 0
                THEN ROUND(100.0 * signups_count / opens_count, 1)
                ELSE 0 END
        ) AS row_obj
        FROM (
            SELECT
                source AS src,
                COUNT(*)::int AS opens_count,
                COUNT(signed_up_user_id)::int AS signups_count
            FROM data_quality.analytics_auth_modal_opens
            WHERE opened_at >= now() - (p_days || ' days')::interval
            GROUP BY source
        ) sub
    ) t;

    RETURN jsonb_build_object(
        'period_days', p_days,
        'total_opens', total_opens,
        'total_signups', total_signups,
        'rows', res
    );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_site_analytics(p_days integer DEFAULT 30, p_offset integer DEFAULT 0, p_limit integer DEFAULT 100, p_device text DEFAULT NULL::text, p_until timestamp with time zone DEFAULT now())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE result jsonb; upper_at timestamptz:=least(coalesce(p_until,now()),now()); days integer:=greatest(1,least(coalesce(p_days,30),190));
BEGIN
 IF NOT coalesce((SELECT is_admin FROM public.profiles WHERE id=auth.uid()),false) THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 WITH filtered AS MATERIALIZED (
  SELECT * FROM data_quality.analytics_site_analytics_events WHERE created_at>=upper_at-make_interval(days=>days) AND created_at<=upper_at AND (p_device IS NULL OR p_device='' OR device=p_device)
 ), groups AS (
  SELECT name,page,entity,device,source,data,count(*) AS events,count(DISTINCT session_id) AS sessions
  FROM filtered GROUP BY name,page,entity,device,source,data
 ), rows AS (
  SELECT id,created_at,name,page,entity,device,source,entry_page,campaign,medium,channel,authenticated,data FROM filtered
  ORDER BY created_at DESC,id DESC OFFSET greatest(0,coalesce(p_offset,0)) LIMIT greatest(1,least(coalesce(p_limit,100),500))
 )
 SELECT jsonb_build_object('until',upper_at,'days',days,'started_at',(SELECT started_at FROM public.site_analytics_config),'total',(SELECT count(*) FROM filtered),
  'summary',(SELECT jsonb_build_object('sessions',count(DISTINCT session_id),'searches',count(*) FILTER(WHERE name='search_results'),'empty_searches',count(*) FILTER(WHERE name='search_results' AND data->>'empty'='true'),'errors',count(*) FILTER(WHERE name IN ('publish_error','photo_error','auth_error','valuation_error','technical_error'))) FROM filtered),
  'groups',coalesce((SELECT jsonb_agg(to_jsonb(g)) FROM (SELECT * FROM groups ORDER BY events DESC,name LIMIT 500) g),'[]'::jsonb),
  'rows',coalesce((SELECT jsonb_agg(to_jsonb(r) ORDER BY created_at DESC,id DESC) FROM rows r),'[]'::jsonb)) INTO result;
 RETURN result;
END $function$
;

CREATE OR REPLACE FUNCTION public.admin_top_location_searches(p_days integer DEFAULT 30)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare result json;
begin
 if not coalesce((select is_admin from public.profiles where id=auth.uid()),false) then return json_build_object('error','forbidden'); end if;
 select coalesce(json_agg(t order by t.cnt desc,t.name),'[]'::json) into result from (
  select name,provincia,regione,sum(cnt)::bigint as cnt from public.geo_stats_daily where metric='search'
  and (p_days=0 or day >= (now() at time zone 'UTC')::date - (greatest(1,least(coalesce(p_days,30),365))-1))
  group by name,provincia,regione order by cnt desc,name limit 10
 ) t; return result;
end $function$
;

CREATE OR REPLACE FUNCTION public.admin_vetrina_conversion_stats(p_days integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE cutoff timestamptz; result jsonb;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin) THEN RAISE EXCEPTION 'Admin required' USING ERRCODE='42501';END IF;
 IF p_days IS NULL OR p_days NOT IN (0,7,30,90) THEN RAISE EXCEPTION 'Invalid period' USING ERRCODE='22023';END IF;
 cutoff:=CASE WHEN p_days=0 THEN '-infinity'::timestamptz ELSE date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'-(p_days-1)*interval '1 day' END;
 WITH mails AS MATERIALIZED(SELECT * FROM data_quality.analytics_vetrina_email_log WHERE NOT is_test AND created_at>=cutoff),
 events AS MATERIALIZED(SELECT * FROM data_quality.analytics_vetrina_funnel_events WHERE NOT is_test AND created_at>=cutoff),
 orders AS MATERIALIZED(
  SELECT coalesce(p.checkout_session_id,split_part(p.stripe_session_id,':',1)) session_id,p.user_id,min(p.created_at) created_at,
   bool_or(p.status IN ('succeeded','refunded')) paid,sum(p.amount_cents) amount_cents,sum(p.refunded_cents) refunded_cents,
   bool_or(p.status='failed') incomplete,bool_or(p.status='pending') pending
  FROM data_quality.analytics_payments p JOIN data_quality.analytics_profiles u ON u.id=p.user_id
  WHERE p.stripe_session_id LIKE 'cs_live_%' AND NOT coalesce(u.is_admin,false) AND NOT coalesce(u.is_demo,false)
  GROUP BY coalesce(p.checkout_session_id,split_part(p.stripe_session_id,':',1)),p.user_id
 ), journeys AS MATERIALIZED(
  SELECT j.*,coalesce(o.paid,false) paid,coalesce(o.incomplete,false) incomplete,coalesce(o.pending,false) pending,
   coalesce(o.refunded_cents,0) refunded_cents
  FROM data_quality.analytics_vetrina_checkout_analytics j LEFT JOIN orders o ON o.session_id=j.session_id AND o.user_id=j.user_id WHERE NOT j.is_test AND j.created_at>=cutoff
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
  'recent',(SELECT coalesce(jsonb_agg(v),'[]'::jsonb) FROM(SELECT e.kind,e.source,e.tier,e.listing_count,e.created_at,p.nome FROM events e JOIN data_quality.analytics_profiles p ON p.id=e.user_id ORDER BY e.created_at DESC LIMIT 10)v),
  'sample',(SELECT to_jsonb(v) FROM(SELECT status,provider_event,delivery_confirmed,opened_at IS NOT NULL opened,clicked_at IS NOT NULL clicked,created_at FROM public.vetrina_email_log WHERE is_test AND user_id=auth.uid() ORDER BY created_at DESC LIMIT 1)v)
 ) INTO result;
 RETURN result;
END $function$
;

CREATE OR REPLACE FUNCTION public.dashboard_seller_analytics(p_days integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    uid uuid := auth.uid();
    days integer := CASE WHEN p_days IN (7,30,90) THEN p_days ELSE 30 END;
    last_day date := (now() AT TIME ZONE 'UTC')::date;
    first_day date := last_day - (days - 1);
    listings jsonb;
BEGIN
    IF uid IS NULL THEN RETURN jsonb_build_object('error','unauthorized'); END IF;
    WITH owned AS (
        SELECT a.id,a.titolo,a.comune,a.regione,a.status,a.tipo,a.stato,a.prezzo,
               a.created_at,a.expires_at,a.featured,a.featured_until,a.img_urls,
               COALESCE(a.visualizzazioni,0) AS views_total,
               COALESCE(a.saved_count,0) AS saved_total,
               COALESCE(a.tel_clicks,0) AS tel_clicks_total,
               COALESCE(length(a.descrizione),0) AS description_length,
               COALESCE(jsonb_array_length(to_jsonb(a.img_urls)),0) AS photo_count,
               public.has_listing_premium_analytics(a.id) AS premium_analytics
        FROM public.annunci a WHERE a.user_id=uid AND a.status IS DISTINCT FROM 'deleted'
    ), incoming AS (
        SELECT c.annuncio_id,m.created_at
        FROM data_quality.analytics_conversazioni c JOIN owned l ON l.id=c.annuncio_id
        JOIN data_quality.analytics_messaggi m ON m.conversazione_id=c.id
        WHERE c.venditore_id=uid AND c.is_support IS NOT TRUE
          AND m.mittente_id=c.acquirente_id AND m.mittente_id<>uid
          AND m.created_at < ((last_day+1)::timestamp AT TIME ZONE 'UTC')
    ), message_totals AS (
        SELECT annuncio_id,count(*) AS msg_total,
            count(*) FILTER (WHERE created_at >= (first_day::timestamp AT TIME ZONE 'UTC')) AS msg_period
        FROM incoming GROUP BY annuncio_id
    ), message_daily AS (
        SELECT annuncio_id,(created_at AT TIME ZONE 'UTC')::date AS day,count(*) AS messages
        FROM incoming WHERE created_at >= (first_day::timestamp AT TIME ZONE 'UTC')
        GROUP BY annuncio_id,(created_at AT TIME ZONE 'UTC')::date
    ), stats AS (
        SELECT s.* FROM public.listing_stats_daily s JOIN owned l ON l.id=s.annuncio_id
        WHERE s.user_id=uid AND s.day BETWEEN first_day AND last_day
    ), daily AS (
        SELECT COALESCE(s.annuncio_id,m.annuncio_id) AS annuncio_id,COALESCE(s.day,m.day) AS day,
            COALESCE(s.views,0) AS views,COALESCE(s.call_clicks,0) AS call_clicks,
            COALESCE(s.whatsapp_clicks,0) AS whatsapp_clicks,COALESCE(s.chat_clicks,0) AS chat_clicks,
            COALESCE(s.saves,0) AS saves,COALESCE(m.messages,0) AS messages
        FROM stats s FULL JOIN message_daily m ON m.annuncio_id=s.annuncio_id AND m.day=s.day
    ), aggregated AS (
        SELECT annuncio_id,sum(views) AS period_views,
            jsonb_agg(jsonb_build_object('day',day,'views',views,'call_clicks',call_clicks,
                'whatsapp_clicks',whatsapp_clicks,'chat_clicks',chat_clicks,'saves',saves,'messages',messages)
                ORDER BY day) AS daily
        FROM daily GROUP BY annuncio_id
    )
    SELECT COALESCE(jsonb_agg(
        (to_jsonb(l)-'views_total'-'saved_total'-'tel_clicks_total') || jsonb_build_object(
            'period_views',COALESCE(d.period_views,0),'period_messages',COALESCE(m.msg_period,0)) ||
        CASE WHEN l.premium_analytics THEN jsonb_build_object(
            'views_total',l.views_total,'saved_total',l.saved_total,'tel_clicks_total',l.tel_clicks_total,
            'msg_total',COALESCE(m.msg_total,0),'msg_period',COALESCE(m.msg_period,0),
            'daily',COALESCE(d.daily,'[]'::jsonb)) ELSE '{}'::jsonb END
        ORDER BY l.created_at DESC,l.id),'[]'::jsonb) INTO listings
    FROM owned l LEFT JOIN message_totals m ON m.annuncio_id=l.id
    LEFT JOIN aggregated d ON d.annuncio_id=l.id;
    RETURN jsonb_build_object('days',days,'start_day',first_day,'end_day',last_day,
        'timezone','UTC','tracking_since','2026-10-06','listings',listings,'access_version',1);
END $function$
;

CREATE OR REPLACE FUNCTION public.home_top_location_searches()
 RETURNS TABLE(name text, regione text, provincia text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
    select e.name, e.regione, e.provincia
    from data_quality.analytics_location_search_events e
    where e.created_at >= now() - interval '30 days'
    group by e.name, e.regione, e.provincia
    order by count(*) desc, e.name, e.regione, e.provincia
    limit 12;
$function$
;

CREATE OR REPLACE FUNCTION public.organizer_analytics(p_days integer DEFAULT 30, p_event_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
 SET "TimeZone" TO 'UTC'
AS $function$
DECLARE uid uuid:=event_private.require_user(); result jsonb;
 current_day date:=(now() AT TIME ZONE 'UTC')::date; from_at timestamptz; previous_from timestamptz; previous_to timestamptz;
BEGIN
 IF p_days IS NULL OR p_days NOT IN(7,30,90) THEN RAISE EXCEPTION 'Periodo non valido'; END IF;
 IF p_event_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.organizer_events WHERE id=p_event_id AND organizer_id=uid) THEN
 RAISE EXCEPTION 'Evento non disponibile' USING ERRCODE='42501'; END IF;
 from_at:=((current_day-p_days+1)::timestamp AT TIME ZONE 'UTC');
 previous_from:=from_at-make_interval(days=>p_days); previous_to:=now()-make_interval(days=>p_days);
 WITH mine AS MATERIALIZED (
  SELECT e.* FROM public.organizer_events e WHERE organizer_id=uid AND (p_event_id IS NULL OR e.id=p_event_id)
 ), activity AS MATERIALIZED (
  SELECT a.* FROM data_quality.analytics_analytics_events a JOIN mine e ON e.id=a.event_id
  WHERE a.day>=(previous_from AT TIME ZONE 'UTC')::date AND a.created_at>=previous_from AND a.created_at<=now()
 ), totals AS (
  SELECT count(*) FILTER(WHERE metric='view' AND created_at>=from_at) views,
  count(*) FILTER(WHERE metric<>'view' AND created_at>=from_at) contacts,
  count(*) FILTER(WHERE metric='email' AND created_at>=from_at) email,
  count(*) FILTER(WHERE metric='phone' AND created_at>=from_at) phone,
  count(*) FILTER(WHERE metric='website' AND created_at>=from_at) website,
  count(*) FILTER(WHERE metric='view' AND created_at>=previous_from AND created_at<=previous_to AND created_at<from_at) previous_views,
  count(*) FILTER(WHERE metric<>'view' AND created_at>=previous_from AND created_at<=previous_to AND created_at<from_at) previous_contacts
  FROM activity
 ), rows AS (
  SELECT e.id,e.title,e.status,e.city,e.start_date,e.end_date,e.application_deadline,
  coalesce(i.capacity,0) capacity,coalesce(i.external_reserved,0) external_reserved,coalesce(i.confirmed,0) confirmed,
  coalesce(i.held,0) held,coalesce(i.available,0) available,
  (SELECT count(*) FROM activity a WHERE a.event_id=e.id AND metric='view' AND created_at>=from_at) views,
  (SELECT count(*) FROM activity a WHERE a.event_id=e.id AND metric<>'view' AND created_at>=from_at) contacts,
  (SELECT count(*) FROM public.saved_fairs s WHERE s.fair_kind='organizer' AND s.fair_id=e.id::text AND s.user_id<>uid) saved,
  (SELECT count(*) FROM public.saved_fairs s WHERE s.fair_kind='organizer' AND s.fair_id=e.id::text AND s.user_id<>uid AND s.reminder_enabled) reminders
  FROM mine e LEFT JOIN LATERAL (
   SELECT sum(p.quantity) capacity,sum(p.external_reserved) external_reserved,
   sum((v->>'confirmed')::integer) confirmed,sum((v->>'held')::integer) held,sum((v->>'available')::integer) available
   FROM public.event_places p CROSS JOIN LATERAL event_private.place_inventory(p.id) v WHERE p.event_id=e.id AND p.active
  ) i ON true
 ) SELECT jsonb_build_object('days',p_days,'from',from_at,'to',now(),'previous_from',previous_from,'previous_to',previous_to,
 'started_at',(SELECT started_at FROM event_private.analytics_settings WHERE id),
 'profile_status',(SELECT status FROM public.organizer_profiles WHERE user_id=uid),
 'totals',(SELECT to_jsonb(t) FROM totals t),'events',coalesce((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.start_date,r.title,r.id) FROM rows r),'[]'::jsonb),
 'daily',(SELECT jsonb_agg(jsonb_build_object('day',d::date,'views',(SELECT count(*) FROM activity a WHERE a.day=d::date AND a.metric='view' AND a.created_at>=from_at),
 'contacts',(SELECT count(*) FROM activity a WHERE a.day=d::date AND a.metric<>'view' AND a.created_at>=from_at)) ORDER BY d)
 FROM generate_series((current_day-p_days+1)::timestamp,current_day::timestamp,interval '1 day') d),
 'sources',coalesce((SELECT jsonb_agg(to_jsonb(s)) FROM (SELECT source,count(*) views FROM activity WHERE created_at>=from_at AND metric='view' GROUP BY source ORDER BY count(*) DESC,source) s),'[]'::jsonb),
 'devices',coalesce((SELECT jsonb_agg(to_jsonb(s)) FROM (SELECT device,count(*) views FROM activity WHERE created_at>=from_at AND metric='view' GROUP BY device ORDER BY count(*) DESC,device) s),'[]'::jsonb)) INTO result;
 RETURN result;
END $function$
;

CREATE OR REPLACE FUNCTION public.admin_listings_per_regione()
 RETURNS TABLE(regione text, cnt bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
  SELECT
    COALESCE(NULLIF(TRIM(a.regione), ''), 'Senza regione') AS regione,
    COUNT(*)::bigint AS cnt
  FROM data_quality.analytics_annunci a
  WHERE a.status = 'active'
    AND a.is_demo = false
  GROUP BY 1
  ORDER BY cnt DESC, regione ASC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_total_listing_value()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_vendita_eur bigint := 0;
  v_affitto_eur bigint := 0;
  v_n_vendita   integer := 0;
  v_n_affitto   integer := 0;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT COALESCE(SUM(prezzo), 0), COUNT(*)
  INTO v_vendita_eur, v_n_vendita
  FROM data_quality.analytics_annunci
  WHERE status = 'active'
    AND stato = 'Vendita'
    AND prezzo IS NOT NULL
    AND prezzo > 0
    AND is_demo = false;

  SELECT COALESCE(SUM(prezzo), 0), COUNT(*)
  INTO v_affitto_eur, v_n_affitto
  FROM data_quality.analytics_annunci
  WHERE status = 'active'
    AND stato IN ('Affitto', 'Affitto mensile')
    AND prezzo IS NOT NULL
    AND prezzo > 0
    AND is_demo = false;

  RETURN jsonb_build_object(
    'total_eur',   v_vendita_eur + v_affitto_eur,
    'vendita_eur', v_vendita_eur,
    'affitto_eur', v_affitto_eur,
    'n_vendita',   v_n_vendita,
    'n_affitto',   v_n_affitto,
    'rent_years',  1
  );
END;
$function$
;

CREATE OR REPLACE FUNCTION public.admin_business_stats()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin IS TRUE) THEN RAISE EXCEPTION 'Admin required' USING ERRCODE='42501'; END IF;
 RETURN jsonb_build_object(
  'total_listings',(SELECT count(*) FROM data_quality.analytics_annunci WHERE is_demo IS NOT TRUE),
  'active_listings',(SELECT count(*) FROM data_quality.analytics_annunci WHERE is_demo IS NOT TRUE AND status='active' AND (expires_at IS NULL OR expires_at>now())),
  'total_users',(SELECT count(*) FROM data_quality.analytics_profiles),
  'growth',jsonb_build_object(
   'profiles',(SELECT coalesce(jsonb_agg(created_at),'[]'::jsonb) FROM data_quality.analytics_profiles),
   'annunci',(SELECT coalesce(jsonb_agg(created_at),'[]'::jsonb) FROM data_quality.analytics_annunci WHERE is_demo IS NOT TRUE AND status<>'deleted'),
   'vetrine',(SELECT coalesce(jsonb_agg(paid_at),'[]'::jsonb) FROM(SELECT min(coalesce(paid_at,created_at)) paid_at FROM data_quality.analytics_payments WHERE status IN('succeeded','refunded') AND stripe_session_id LIKE 'cs_live_%' GROUP BY coalesce(checkout_session_id,split_part(stripe_session_id,':',1),id::text)) q)
  )
 );
END $$;
REVOKE ALL ON FUNCTION public.admin_business_stats() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_business_stats() TO authenticated;
-- Service-only read endpoint: retained valuation reports still work for their owners.
CREATE OR REPLACE FUNCTION public.analytics_excluded_account_ids()
RETURNS SETOF uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT id FROM public.profiles WHERE data_quality.analytics_account_excluded(id)
$$;
REVOKE ALL ON FUNCTION public.analytics_excluded_account_ids() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.analytics_excluded_account_ids() TO service_role;
COMMIT;
