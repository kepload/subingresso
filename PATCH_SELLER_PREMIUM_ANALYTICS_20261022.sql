-- Paid analytics belong to the listing, permanently, including each bundle item.
-- No writes to listings, orders or their triggers; failed/test/gift orders do not unlock.
BEGIN;

CREATE OR REPLACE FUNCTION public.has_listing_premium_analytics(p_listing_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
    SELECT auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.payments p
        JOIN public.annunci a ON a.id = p_listing_id AND a.user_id = auth.uid()
        WHERE p.user_id = auth.uid()
          AND COALESCE(p.listing_id_snapshot, p.annuncio_id) = p_listing_id
          AND p.status IN ('succeeded', 'refunded')
          AND p.amount_cents > 0 AND p.tier IN ('10d', '30d', '90d')
          AND p.stripe_session_id LIKE 'cs\_live\_%' ESCAPE '\'
    );
$$;
REVOKE ALL ON FUNCTION public.has_listing_premium_analytics(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_listing_premium_analytics(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.dashboard_seller_analytics(p_days integer DEFAULT 30)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
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
        FROM public.conversazioni c JOIN owned l ON l.id=c.annuncio_id
        JOIN public.messaggi m ON m.conversazione_id=c.id
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
END $$;
REVOKE ALL ON FUNCTION public.dashboard_seller_analytics(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.dashboard_seller_analytics(integer) TO authenticated;

-- Direct table reads follow the same access rule; tracking keeps running for all listings.
ALTER POLICY listing_stats_daily_owner_select ON public.listing_stats_daily
USING ((auth.uid()=user_id AND public.has_listing_premium_analytics(annuncio_id))
    OR EXISTS(SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.is_admin=true));

CREATE OR REPLACE FUNCTION public.dashboard_vetrina_stats(p_days integer DEFAULT 30)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    uid uuid := auth.uid();
    days integer := CASE WHEN p_days IN (7,30,90) THEN p_days ELSE 30 END;
    last_day date := (now() AT TIME ZONE 'UTC')::date;
    result jsonb;
BEGIN
    IF uid IS NULL THEN RETURN jsonb_build_object('error','unauthorized'); END IF;
    SELECT COALESCE(jsonb_agg(jsonb_build_object('id',a.id,
        'impressions',COALESCE(s.impressions,0),'detail_views',COALESCE(s.detail_views,0),
        'contact_actions',COALESCE(s.contact_actions,0),
        'waiting_days',(SELECT COALESCE(sum(CASE tier WHEN '10d' THEN 10 WHEN '30d' THEN 30 WHEN '90d' THEN 90 ELSE 0 END),0)
            FROM public.payments p WHERE p.annuncio_id=a.id AND p.user_id=uid
            AND p.status='succeeded' AND p.activated_at IS NULL)
    )),'[]'::jsonb) INTO result
    FROM public.annunci a LEFT JOIN (
        SELECT annuncio_id,sum(impressions) AS impressions,sum(detail_views) AS detail_views,
            sum(contact_actions) AS contact_actions
        FROM public.vetrina_stats_daily WHERE user_id=uid
            AND day BETWEEN last_day-(days-1) AND last_day GROUP BY annuncio_id
    ) s ON s.annuncio_id=a.id
    WHERE a.user_id=uid AND a.status IS DISTINCT FROM 'deleted'
        AND public.has_listing_premium_analytics(a.id);
    RETURN jsonb_build_object('listings',result,'tracking_since','2026-10-08');
END $$;
REVOKE ALL ON FUNCTION public.dashboard_vetrina_stats(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.dashboard_vetrina_stats(integer) TO authenticated;
CREATE OR REPLACE FUNCTION public.dashboard_vetrina_account(p_days integer DEFAULT 30, p_offset integer DEFAULT 0, p_status text DEFAULT 'all'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE uid uuid := auth.uid(); orders jsonb; campaigns jsonb; summary jsonb; total bigint;
BEGIN
    IF uid IS NULL THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501'; END IF;
    IF p_status NOT IN ('all','succeeded','pending','failed','refunded') THEN RAISE EXCEPTION 'Invalid status'; END IF;
    SELECT count(*) INTO total FROM public.payments
    WHERE user_id = uid AND (p_status = 'all' OR status = p_status);
    SELECT COALESCE(jsonb_agg(row ORDER BY row.created_at DESC, row.id DESC), '[]'::jsonb) INTO orders FROM (
        SELECT p.id, p.annuncio_id, p.listing_id_snapshot, p.listing_title, p.tier, p.status,
               p.amount_cents, p.currency, p.refunded_cents, p.created_at, p.paid_at, p.activated_at,
               p.promotion_starts_at, p.promotion_ends_at, p.checkout_session_id, p.bundle_size, p.bundle_discount, p.list_price_cents,
               p.stripe_session_id LIKE 'cs_test_%' AS is_test,
               p.stripe_payment_intent IS NOT NULL AND p.status IN ('succeeded','refunded') AS has_receipt,
               COALESCE((SELECT jsonb_agg(jsonb_build_object('at',h.occurred_at,'kind',h.kind,'status',h.status,
                           'refunded_cents',h.refunded_cents) ORDER BY h.id)
                        FROM public.payment_history h WHERE h.payment_id = p.id), '[]'::jsonb) AS history
        FROM public.payments p WHERE p.user_id = uid AND (p_status = 'all' OR p.status = p_status)
        ORDER BY p.created_at DESC, p.id DESC LIMIT 50 OFFSET GREATEST(COALESCE(p_offset,0),0)
    ) row;
    SELECT jsonb_build_object(
        'paid_orders', count(DISTINCT coalesce(checkout_session_id,stripe_session_id)) FILTER (WHERE status IN ('succeeded','refunded')),
        'spent_cents', COALESCE(sum(amount_cents) FILTER (WHERE status IN ('succeeded','refunded')),0),
        'refunded_cents', COALESCE(sum(refunded_cents) FILTER (WHERE status IN ('succeeded','refunded')),0)
    ) INTO summary FROM public.payments WHERE user_id = uid AND stripe_session_id LIKE 'cs_live_%';
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', c.id, 'title', c.title, 'status', a.status, 'available', a.id IS NOT NULL AND a.status <> 'deleted',
        'active', COALESCE(a.status = 'active' AND a.featured AND a.featured_until > now()
                          AND (a.expires_at IS NULL OR a.expires_at > now()), false),
        'featured_until', a.featured_until, 'premium_analytics', public.has_listing_premium_analytics(c.id),
        'waiting_days', (SELECT COALESCE(sum(CASE tier WHEN '10d' THEN 10 WHEN '30d' THEN 30 WHEN '90d' THEN 90 END),0)
                         FROM public.payments WHERE user_id = uid AND listing_id_snapshot = c.id
                         AND status = 'succeeded' AND activated_at IS NULL),
        'impressions', COALESCE(s.impressions,0), 'detail_views', COALESCE(s.detail_views,0),
        'contact_actions', COALESCE(s.contact_actions,0), 'daily', COALESCE(s.daily,'[]'::jsonb)
    )), '[]'::jsonb) INTO campaigns
    FROM (
        SELECT DISTINCT ON (listing_id_snapshot) listing_id_snapshot AS id, listing_title AS title
        FROM public.payments WHERE user_id = uid AND status IN ('succeeded','refunded') AND listing_id_snapshot IS NOT NULL
        ORDER BY listing_id_snapshot, created_at DESC, id DESC
    ) c LEFT JOIN public.annunci a ON a.id = c.id AND a.user_id = uid
    LEFT JOIN (
        SELECT annuncio_id, sum(impressions) AS impressions, sum(detail_views) AS detail_views,
               sum(contact_actions) AS contact_actions,
               jsonb_agg(jsonb_build_object('day',day,'impressions',impressions,'detail_views',detail_views,
                                           'contact_actions',contact_actions) ORDER BY day) AS daily
        FROM public.vetrina_stats_daily WHERE user_id = uid
          AND day BETWEEN (now() AT TIME ZONE 'UTC')::date - (CASE WHEN p_days IN (7,30,90) THEN p_days ELSE 30 END - 1) AND (now() AT TIME ZONE 'UTC')::date
        GROUP BY annuncio_id
    ) s ON s.annuncio_id = c.id AND public.has_listing_premium_analytics(c.id);
    RETURN jsonb_build_object('orders',orders,'total',total,'summary',summary,'campaigns',campaigns,
                              'tracking_since','2026-10-08','days',CASE WHEN p_days IN (7,30,90) THEN p_days ELSE 30 END);
END $function$
;
REVOKE ALL ON FUNCTION public.dashboard_vetrina_account(integer,integer,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.dashboard_vetrina_account(integer,integer,text) TO authenticated;

NOTIFY pgrst,'reload schema';
COMMIT;
