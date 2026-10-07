-- Provenienza: prime pagine di sessione e iscrizioni attribuibili.
-- Nessun nuovo identificativo, nessuna riscrittura dello storico.
BEGIN;

ALTER TABLE public.page_views
    ADD COLUMN IF NOT EXISTS utm_source text,
    ADD COLUMN IF NOT EXISTS utm_campaign text;
ALTER TABLE public.auth_modal_opens
    ADD COLUMN IF NOT EXISTS landing_path text,
    ADD COLUMN IF NOT EXISTS utm_source text,
    ADD COLUMN IF NOT EXISTS utm_campaign text;

DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.page_views'::regclass AND conname='page_views_campaign_safe') THEN
        ALTER TABLE public.page_views ADD CONSTRAINT page_views_campaign_safe CHECK (
            (utm_source IS NULL OR utm_source ~ '^[a-z0-9_-]{1,80}$') AND
            (utm_campaign IS NULL OR utm_campaign ~ '^[a-z0-9_-]{1,80}$'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='public.auth_modal_opens'::regclass AND conname='amo_acquisition_safe') THEN
        ALTER TABLE public.auth_modal_opens ADD CONSTRAINT amo_acquisition_safe CHECK (
            (landing_path IS NULL OR (length(landing_path) BETWEEN 1 AND 200 AND landing_path ~ '^/[a-zA-Z0-9/_-]*$')) AND
            (utm_source IS NULL OR utm_source ~ '^[a-z0-9_-]{1,80}$') AND
            (utm_campaign IS NULL OR utm_campaign ~ '^[a-z0-9_-]{1,80}$'));
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_page_views_session_entry
    ON public.page_views(visitor_id, session_id, created_at, id);

-- Helper interno: Bandi e Fiere sono separati dal blog generale.
CREATE OR REPLACE FUNCTION public.acquisition_source(p_path text, p_utm_source text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE
    v_path text := lower(regexp_replace(split_part(split_part(coalesce(p_path,''),'?',1),'#',1), '\.html/?$|/+$', ''));
    v_slug text;
    v_category text;
BEGIN
    IF lower(coalesce(p_utm_source,'')) IN ('fiera','fiere') OR v_path ~ '^/fiere?(/|$)' THEN RETURN 'fiere'; END IF;
    IF v_path IN ('','/','/index') THEN RETURN 'homepage'; END IF;
    IF v_path = '/valutatore' THEN RETURN 'valutatore'; END IF;
    IF v_path ~ '^/bandi(/|$)' THEN RETURN 'bandi'; END IF;
    IF v_path ~ '^/blog(/|$)' THEN
        v_slug := substring(v_path FROM '^/blog/(.+)$');
        SELECT lower(category) INTO v_category FROM public.blog_posts WHERE slug = v_slug LIMIT 1;
        IF v_category = 'bandi' OR v_slug ~ '^(bandi|bando)-' THEN RETURN 'bandi'; END IF;
        IF v_category ~ '(fier|sagr)' OR v_slug ~ '(^|-)(fiera|fiere|sagra|sagre)(-|$)' THEN RETURN 'fiere'; END IF;
        RETURN 'blog';
    END IF;
    RETURN 'altro';
END $$;
REVOKE ALL ON FUNCTION public.acquisition_source(text,text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_acquisition_stats(p_days integer DEFAULT 30)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
        FROM public.page_views
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
        SELECT id,created_at FROM public.profiles
        WHERE created_at >= v_since AND created_at <= now()
          AND NOT coalesce(is_admin,false) AND NOT coalesce(is_demo,false)
    ),
    -- Una sola attribuzione per account. Le aperture successive al signup
    -- e quelle senza pagina di ingresso non sono prove di provenienza.
    attributed AS MATERIALIZED (
        SELECT DISTINCT ON (u.id) u.id,
            public.acquisition_source(a.landing_path,a.utm_source) AS source
        FROM new_users u JOIN public.auth_modal_opens a ON a.signed_up_user_id=u.id
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
        'attribution_since',(SELECT min(opened_at) FROM public.auth_modal_opens WHERE landing_path IS NOT NULL),
        'rows',(SELECT jsonb_agg(jsonb_build_object(
            'source',source,'sessions',sessions,'visitors',visitors,'signups',signups,
            'share_pct',coalesce(round(100.0*sessions/nullif((SELECT count(*) FROM traffic),0),1),0)
        ) ORDER BY sort_order) FROM by_source),
        'channels',coalesce((SELECT jsonb_agg(to_jsonb(c) ORDER BY sessions DESC,channel) FROM channels c),'[]'::jsonb)
    ) INTO v_result;
    RETURN v_result;
END $$;
REVOKE ALL ON FUNCTION public.admin_acquisition_stats(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_acquisition_stats(integer) TO authenticated;

COMMIT;
