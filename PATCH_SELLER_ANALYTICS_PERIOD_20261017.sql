-- Riepilogo e grafico usano gli stessi giorni UTC; nessuna ricostruzione
-- dei contatori storici senza data. I messaggi sono quelli degli acquirenti,
-- effettivamente salvati nelle conversazioni del venditore.
BEGIN;

CREATE OR REPLACE FUNCTION public.dashboard_seller_analytics(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_days integer := LEAST(GREATEST(COALESCE(p_days, 30), 7), 90);
    v_end date := (now() AT TIME ZONE 'UTC')::date;
    v_start date := v_end - (v_days - 1);
    v_listings jsonb;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'unauthorized');
    END IF;

    WITH my_listings AS (
        SELECT a.id, a.titolo, a.comune, a.regione, a.status, a.tipo, a.stato,
               a.prezzo, a.created_at, a.expires_at, a.featured, a.featured_until,
               a.img_urls,
               COALESCE(a.visualizzazioni, 0) AS views_total,
               COALESCE(a.saved_count, 0) AS saved_total,
               COALESCE(a.tel_clicks, 0) AS tel_clicks_total,
               COALESCE(length(a.descrizione), 0) AS description_length,
               COALESCE(jsonb_array_length(to_jsonb(a.img_urls)), 0) AS photo_count
        FROM public.annunci a
        WHERE a.user_id = v_user_id AND a.status IS DISTINCT FROM 'deleted'
    ), incoming AS (
        SELECT c.annuncio_id, m.created_at
        FROM public.conversazioni c
        JOIN my_listings l ON l.id = c.annuncio_id
        JOIN public.messaggi m ON m.conversazione_id = c.id
        WHERE c.venditore_id = v_user_id
          AND c.is_support IS NOT TRUE
          AND m.mittente_id = c.acquirente_id
          AND m.mittente_id <> v_user_id
          AND m.created_at < ((v_end + 1)::timestamp AT TIME ZONE 'UTC')
    ), message_totals AS (
        SELECT annuncio_id, count(*) AS msg_total,
               count(*) FILTER (WHERE created_at >= (v_start::timestamp AT TIME ZONE 'UTC')) AS msg_period
        FROM incoming GROUP BY annuncio_id
    ), message_daily AS (
        SELECT annuncio_id, (created_at AT TIME ZONE 'UTC')::date AS day, count(*) AS messages
        FROM incoming
        WHERE created_at >= (v_start::timestamp AT TIME ZONE 'UTC')
        GROUP BY annuncio_id, (created_at AT TIME ZONE 'UTC')::date
    ), stats AS (
        SELECT s.* FROM public.listing_stats_daily s
        JOIN my_listings l ON l.id = s.annuncio_id
        WHERE s.user_id = v_user_id AND s.day BETWEEN v_start AND v_end
    ), daily AS (
        SELECT COALESCE(s.annuncio_id, m.annuncio_id) AS annuncio_id,
               COALESCE(s.day, m.day) AS day,
               COALESCE(s.views, 0) AS views,
               COALESCE(s.call_clicks, 0) AS call_clicks,
               COALESCE(s.whatsapp_clicks, 0) AS whatsapp_clicks,
               COALESCE(s.chat_clicks, 0) AS chat_clicks,
               COALESCE(s.saves, 0) AS saves,
               COALESCE(m.messages, 0) AS messages
        FROM stats s FULL JOIN message_daily m
          ON m.annuncio_id = s.annuncio_id AND m.day = s.day
    ), daily_json AS (
        SELECT annuncio_id, jsonb_agg(jsonb_build_object(
            'day', day, 'views', views, 'call_clicks', call_clicks,
            'whatsapp_clicks', whatsapp_clicks, 'chat_clicks', chat_clicks,
            'saves', saves, 'messages', messages
        ) ORDER BY day) AS rows
        FROM daily GROUP BY annuncio_id
    )
    SELECT COALESCE(jsonb_agg(to_jsonb(l) || jsonb_build_object(
        -- Campi storici conservati per compatibilità, mai usati nel riepilogo del periodo.
        'msg_total', COALESCE(m.msg_total, 0), 'msg_period', COALESCE(m.msg_period, 0),
        'daily', COALESCE(d.rows, '[]'::jsonb)
    ) ORDER BY l.created_at DESC, l.id), '[]'::jsonb) INTO v_listings
    FROM my_listings l
    LEFT JOIN message_totals m ON m.annuncio_id = l.id
    LEFT JOIN daily_json d ON d.annuncio_id = l.id;

    RETURN jsonb_build_object(
        'days', v_days, 'start_day', v_start, 'end_day', v_end,
        'timezone', 'UTC', 'tracking_since', '2026-10-06', 'listings', v_listings
    );
END $$;

REVOKE ALL ON FUNCTION public.dashboard_seller_analytics(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dashboard_seller_analytics(integer) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
