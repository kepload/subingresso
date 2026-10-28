-- Read-only comparison: article openings and advertising impressions stay separate.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='30s';
CREATE OR REPLACE FUNCTION public.admin_blog_ad_readership(p_days integer DEFAULT 30,p_until timestamptz DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE until_at timestamptz:=COALESCE(p_until,now()); since_at timestamptz; result jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin IS TRUE) THEN
  RAISE EXCEPTION 'Riservato all’amministratore' USING ERRCODE='42501';
 END IF;
 IF p_days IS NULL OR p_days NOT IN(7,30,90,365) OR NOT isfinite(until_at) OR until_at>now() OR until_at<now()-interval '366 days' THEN
  RAISE EXCEPTION 'Periodo non valido' USING ERRCODE='22023';
 END IF;
 since_at:=until_at-(p_days*interval '24 hours');
 WITH visits AS (
  SELECT substring(v.path FROM '^/blog/(.+)$') article_slug,v.created_at
  FROM data_quality.analytics_page_views v
  WHERE v.path ~ '^/blog/[a-z0-9-]+$' AND v.created_at>=since_at AND v.created_at<=until_at
 ), daily AS (
  SELECT v.article_slug,to_char(v.created_at AT TIME ZONE 'UTC','YYYY-MM-DD') event_day,count(*) visits
  FROM visits v GROUP BY 1,2
 ) SELECT jsonb_build_object('period_days',p_days,'since',since_at,'until',until_at,
  'started_at',(SELECT min(v.created_at) FROM data_quality.analytics_page_views v WHERE v.path ~ '^/blog/[a-z0-9-]+$' AND v.created_at<=until_at),
  'total_visits',(SELECT count(*) FROM visits),
  'rows',COALESCE((SELECT jsonb_agg(jsonb_build_object('article_slug',d.article_slug,'article_title',COALESCE(b.title,d.article_slug),'event_day',d.event_day,'visits',d.visits) ORDER BY d.event_day,d.article_slug)
   FROM daily d LEFT JOIN public.blog_posts b ON b.slug=d.article_slug),'[]'::jsonb)) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.admin_blog_ad_readership(integer,timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_blog_ad_readership(integer,timestamptz) TO authenticated,service_role;
COMMIT;
