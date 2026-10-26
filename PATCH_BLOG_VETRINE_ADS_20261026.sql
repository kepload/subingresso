-- Misura dedicata agli spazi Vetrina del blog. Nessuna modifica a pagamenti o annunci.
BEGIN;
CREATE TABLE IF NOT EXISTS public.blog_listing_ad_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 listing_id uuid NOT NULL,
 post_slug text NOT NULL CHECK(post_slug ~ '^[a-z0-9-]{1,200}$'),
 placement text NOT NULL CHECK(placement IN ('blog_inline','blog_closing')),
 kind text NOT NULL CHECK(kind IN ('impression','click')),
 session_id text NOT NULL CHECK(session_id ~ '^[a-zA-Z0-9_-]{8,80}$'),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(session_id,listing_id,post_slug,placement,kind)
);
ALTER TABLE public.blog_listing_ad_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.blog_listing_ad_events FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.blog_listing_ad_events TO service_role;
CREATE INDEX IF NOT EXISTS blog_listing_ad_events_time ON public.blog_listing_ad_events(created_at);
CREATE INDEX IF NOT EXISTS blog_listing_ad_events_listing ON public.blog_listing_ad_events(listing_id,created_at);

CREATE OR REPLACE FUNCTION public.blog_listing_ad_event(p_listing uuid,p_post text,p_placement text,p_kind text,p_session text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=auth.uid(); result uuid; ad record; context jsonb;
BEGIN
 IF p_listing IS NULL OR p_post IS NULL OR p_post !~ '^[a-z0-9-]{1,200}$'
 OR p_placement IS NULL OR p_placement NOT IN ('blog_inline','blog_closing')
 OR p_kind IS NULL OR p_kind NOT IN ('impression','click')
 OR p_session IS NULL OR p_session !~ '^[a-zA-Z0-9_-]{8,80}$'
 THEN RAISE EXCEPTION 'Evento non valido' USING ERRCODE='22023'; END IF;
 IF uid IS NOT NULL AND EXISTS(SELECT 1 FROM public.profiles WHERE id=uid AND (is_admin IS TRUE OR is_demo IS TRUE)) THEN RETURN NULL; END IF;
 SELECT a.user_id,a.regione INTO ad FROM public.annunci a WHERE a.id=p_listing
 AND a.status='active' AND a.is_demo IS NOT TRUE AND a.featured IS TRUE
 AND a.featured_until>now() AND a.featured_tier IN ('10d','30d','90d')
 AND (a.expires_at IS NULL OR a.expires_at>now());
 IF NOT FOUND OR (uid IS NOT NULL AND ad.user_id=uid) THEN RETURN NULL; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.blog_posts WHERE slug=p_post AND published_at<=now()) THEN RETURN NULL; END IF;
 context:=public.blog_listing_ads(p_post,1);
 IF jsonb_array_length(context->'regions')>0 AND NOT (context->'regions' ? ad.regione) THEN RETURN NULL; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('blog-listing-ad:'||p_session,0));
 SELECT id INTO result FROM public.blog_listing_ad_events WHERE session_id=p_session AND listing_id=p_listing
 AND post_slug=p_post AND placement=p_placement AND kind=p_kind;
 IF result IS NOT NULL THEN RETURN result; END IF;
 IF (SELECT count(*) FROM public.blog_listing_ad_events WHERE session_id=p_session AND created_at>now()-interval '1 hour')>=250 THEN RETURN NULL; END IF;
 INSERT INTO public.blog_listing_ad_events(listing_id,post_slug,placement,kind,session_id)
 VALUES(p_listing,p_post,p_placement,p_kind,p_session) RETURNING id INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.blog_listing_ad_event(uuid,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.blog_listing_ad_event(uuid,text,text,text,text) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.admin_blog_listing_ads(p_days integer DEFAULT 30)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE since_at timestamptz:=now()-make_interval(days=>least(365,greatest(1,coalesce(p_days,30)))); result jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin IS TRUE)
 THEN RAISE EXCEPTION 'Solo amministratore' USING ERRCODE='42501'; END IF;
 WITH measured AS (
  SELECT c.id FROM public.blog_listing_ad_events c WHERE c.kind='click' AND c.created_at>=since_at
  AND EXISTS(SELECT 1 FROM public.blog_listing_ad_events i WHERE i.kind='impression' AND i.session_id=c.session_id
   AND i.listing_id=c.listing_id AND i.post_slug=c.post_slug AND i.placement=c.placement AND i.created_at<=c.created_at)
 ), rows AS (
  SELECT e.listing_id,e.post_slug,e.placement,
   count(*) FILTER(WHERE e.kind='impression') AS impressions,
   count(*) FILTER(WHERE e.kind='click') AS clicks,
   count(*) FILTER(WHERE e.id IN (SELECT id FROM measured) AND EXISTS(
    SELECT 1 FROM public.blog_listing_ad_events i WHERE i.kind='impression' AND i.created_at>=since_at
    AND i.session_id=e.session_id AND i.listing_id=e.listing_id AND i.post_slug=e.post_slug AND i.placement=e.placement)) AS measured_clicks
  FROM public.blog_listing_ad_events e WHERE e.created_at>=since_at GROUP BY e.listing_id,e.post_slug,e.placement
 ), inventory AS (
  SELECT a.id,a.titolo,a.comune,a.regione,a.stato,a.prezzo,a.img_urls,a.featured_until,
   coalesce(a.status='active' AND a.is_demo IS NOT TRUE AND a.featured IS TRUE AND a.featured_until>now()
    AND a.featured_tier IN ('10d','30d','90d') AND (a.expires_at IS NULL OR a.expires_at>now()),false) AS active
  FROM public.annunci a WHERE a.is_demo IS NOT TRUE AND (
   (a.status='active' AND a.featured IS TRUE AND a.featured_until>now() AND a.featured_tier IN ('10d','30d','90d')
    AND (a.expires_at IS NULL OR a.expires_at>now())) OR a.id IN (SELECT listing_id FROM rows))
 ) SELECT jsonb_build_object(
  'listings',coalesce((SELECT jsonb_agg(to_jsonb(i) ORDER BY i.active DESC,i.titolo,i.id) FROM inventory i),'[]'::jsonb),
  'rows',coalesce((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.clicks DESC,r.listing_id,r.post_slug,r.placement) FROM rows r),'[]'::jsonb),
  'started_at',(SELECT min(created_at) FROM public.blog_listing_ad_events),'updated_at',now()
 ) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.admin_blog_listing_ads(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_blog_listing_ads(integer) TO authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
