-- Fase 0.3: RPC admin_blog_stats per il pannello "Performance blog" in dashboard.
-- Aggrega views (da page_views path '/blog/<slug>') + conversioni (blog_conversions).
-- SECURITY DEFINER + check is_admin: bypassa la RLS owner-only di page_views.

CREATE OR REPLACE FUNCTION public.admin_blog_stats(p_days int DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    SELECT COALESCE(is_admin, false) INTO v_is_admin FROM public.profiles WHERE id = v_caller;
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
    END IF;

    WITH pv AS (
        SELECT
            substring(path FROM '^/blog/(.+)$') AS slug,
            visitor_id
        FROM public.page_views
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
        FROM public.blog_conversions
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
$$;

REVOKE ALL ON FUNCTION public.admin_blog_stats(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_blog_stats(int) TO authenticated;
