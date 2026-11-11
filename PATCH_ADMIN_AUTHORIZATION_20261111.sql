-- C-07: fail-closed authorization for the five affected administrative RPCs.
-- Baseline: read-only production metadata, 2026-11-11T16:17:13Z.
-- Preserve signatures, result payloads, analytics exclusions and business operations.
-- Apply after historical patches. No data changes occur when applying this file.
-- Bando RPCs retain service_role access. Blog RPCs still require an admin user.
BEGIN;

CREATE OR REPLACE FUNCTION public.admin_bando_alerts_stats()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_total int;
    v_today int;
    v_7d int;
    v_30d int;
    v_by_regione jsonb;
    v_by_source jsonb;
    v_recent jsonb;
BEGIN
    -- Keep trusted service calls; every user must have an authoritative admin profile.
    IF coalesce(auth.role(), '') <> 'service_role'
       AND NOT EXISTS (
           SELECT 1 FROM public.profiles
           WHERE id = auth.uid() AND is_admin IS TRUE
       ) THEN
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
$function$;

CREATE OR REPLACE FUNCTION public.admin_bando_scouting_list(p_status text DEFAULT 'pending'::text, p_limit integer DEFAULT 50)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_rows jsonb;
    v_counts jsonb;
BEGIN
    -- Keep trusted service calls; every user must have an authoritative admin profile.
    IF coalesce(auth.role(), '') <> 'service_role'
       AND NOT EXISTS (
           SELECT 1 FROM public.profiles
           WHERE id = auth.uid() AND is_admin IS TRUE
       ) THEN
        RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
    END IF;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', id,
        'regione', regione,
        'titolo', titolo,
        'link', link,
        'fonte', fonte,
        'ai_summary', ai_summary,
        'status', status,
        'discovered_at', discovered_at,
        'reviewed_at', reviewed_at,
        'sent_at', sent_at,
        'sent_count', sent_count,
        'approve_token', approve_token,
        'reject_token', reject_token,
        'published_slug', published_slug,
        'published_at', published_at
    ) ORDER BY discovered_at DESC), '[]'::jsonb) INTO v_rows
    FROM (
        SELECT * FROM public.bando_scouting_log
        WHERE (p_status IS NULL OR status = p_status)
        ORDER BY discovered_at DESC
        LIMIT p_limit
    ) sub;

    SELECT jsonb_build_object(
        'pending',  (SELECT COUNT(*) FROM public.bando_scouting_log WHERE status = 'pending'),
        'approved', (SELECT COUNT(*) FROM public.bando_scouting_log WHERE status IN ('approved','sent')),
        'rejected', (SELECT COUNT(*) FROM public.bando_scouting_log WHERE status = 'rejected'),
        'sent_total_recipients', (SELECT COALESCE(SUM(sent_count), 0) FROM public.bando_scouting_log WHERE status = 'sent'),
        'published_pages', (SELECT COUNT(*) FROM public.bando_scouting_log WHERE published_slug IS NOT NULL)
    ) INTO v_counts;

    RETURN jsonb_build_object('counts', v_counts, 'rows', v_rows);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_bando_scouting_decide(p_id uuid, p_action text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_row record;
BEGIN
    -- Keep trusted service calls; every user must have an authoritative admin profile.
    IF coalesce(auth.role(), '') <> 'service_role'
       AND NOT EXISTS (
           SELECT 1 FROM public.profiles
           WHERE id = auth.uid() AND is_admin IS TRUE
       ) THEN
        RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
    END IF;
    IF p_action NOT IN ('approve','reject') THEN
        RAISE EXCEPTION 'invalid action';
    END IF;

    SELECT * INTO v_row FROM public.bando_scouting_log WHERE id = p_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'not found';
    END IF;
    IF v_row.status NOT IN ('pending') THEN
        RAISE EXCEPTION 'already %', v_row.status;
    END IF;

    IF p_action = 'reject' THEN
        UPDATE public.bando_scouting_log
        SET status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
        WHERE id = p_id;
        RETURN jsonb_build_object('ok', true, 'action', 'rejected');
    ELSE
        -- approve: marca approved. L'invio mail effettivo è fatto da bando-action edge function
        -- (che ha service_role per accedere a bando_alerts senza RLS pain).
        UPDATE public.bando_scouting_log
        SET status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
        WHERE id = p_id;
        RETURN jsonb_build_object('ok', true, 'action', 'approved', 'next', 'edge function trigger broadcast');
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_blog_stats(p_days integer DEFAULT 30)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_caller uuid := auth.uid();
    v_since timestamptz := now() - (p_days || ' days')::interval;
    v_rows jsonb;
    v_total_views int;
    v_total_conv int;
BEGIN
    IF v_caller IS NULL THEN
        RAISE EXCEPTION 'unauthorized' USING ERRCODE = '42501';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = v_caller AND is_admin IS TRUE
    ) THEN
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
$function$;

CREATE OR REPLACE FUNCTION public.admin_bump_post_freshness(p_slug text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_caller uuid := auth.uid();
    v_new_ts timestamptz;
BEGIN
    IF v_caller IS NULL THEN
        RAISE EXCEPTION 'unauthorized' USING ERRCODE = '42501';
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = v_caller AND is_admin IS TRUE
    ) THEN
        RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
    END IF;

    UPDATE public.blog_posts
       SET published_at = now()
     WHERE slug = p_slug
     RETURNING published_at INTO v_new_ts;

    IF v_new_ts IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'slug_not_found');
    END IF;

    RETURN jsonb_build_object('ok', true, 'slug', p_slug, 'published_at', v_new_ts);
END;
$function$;

-- CREATE OR REPLACE retains ACLs: revoke the explicit anon grants as well as PUBLIC.
REVOKE ALL ON FUNCTION public.admin_bando_alerts_stats() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_bando_alerts_stats() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.admin_bando_scouting_list(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_bando_scouting_list(text, integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.admin_bando_scouting_decide(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_bando_scouting_decide(uuid, text) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.admin_blog_stats(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_blog_stats(integer) TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.admin_bump_post_freshness(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_bump_post_freshness(text) TO authenticated, service_role;

COMMIT;
