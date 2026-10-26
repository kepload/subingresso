-- Complete ADS context. Historical rows stay unknown; no reconstruction or customer data edits.
BEGIN;
ALTER TABLE public.personal_ad_events
 ADD COLUMN IF NOT EXISTS article_slug text NOT NULL DEFAULT '',
 ADD COLUMN IF NOT EXISTS creative_version integer NOT NULL DEFAULT 0,
 ADD COLUMN IF NOT EXISTS context_version smallint NOT NULL DEFAULT 0,
 ADD COLUMN IF NOT EXISTS context jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.personal_ad_events DROP CONSTRAINT IF EXISTS personal_ad_events_ad_id_format_placement_kind_session_id_key;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid='public.personal_ad_events'::regclass AND conname='personal_ad_events_context_key') THEN
  ALTER TABLE public.personal_ad_events ADD CONSTRAINT personal_ad_events_context_key UNIQUE(ad_id,format,placement,kind,session_id,article_slug,creative_version);
 END IF;
END $$;
CREATE INDEX IF NOT EXISTS personal_ad_article_time_idx ON public.personal_ad_events(article_slug,created_at DESC);

CREATE OR REPLACE FUNCTION public.personal_ad_event_v2(p_ad text,p_format text,p_placement text,p_kind text,p_session text DEFAULT NULL,p_context jsonb DEFAULT '{}'::jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result uuid; sid text:=NULLIF(p_session,''); uid uuid:=auth.uid(); ctx jsonb:=COALESCE(p_context,'{}'::jsonb);
 article_key text:=COALESCE(ctx->>'article_slug',''); version integer:=0; item record; entry jsonb; post_title text; post_date timestamptz;
BEGIN
 IF p_ad IS NULL OR p_ad !~ '^(vendi-0[1-7]|compra-0[1-7]|fiere-0[1-6])$'
 OR p_format IS NULL OR p_format NOT IN('300x250','336x280','728x90','970x250','320x100','300x600','1080x1080','1080x1920','editoriale')
 OR p_placement IS NULL OR p_placement !~ '^[a-z0-9_-]{1,80}$' OR p_kind IS NULL OR p_kind NOT IN('impression','click')
 OR (sid IS NOT NULL AND sid !~ '^[a-zA-Z0-9_-]{8,80}$')
 OR jsonb_typeof(ctx)<>'object' OR octet_length(ctx::text)>8192 THEN RAISE EXCEPTION 'Evento non valido' USING ERRCODE='22023'; END IF;
 FOR item IN SELECT key,value FROM jsonb_each(ctx) LOOP
  IF item.key IN('creative_version','engine_version','candidate_count','selection_weight','post_rule_revision','ad_rule_revision','visible_ms','page_ms','scroll_percent') THEN
   IF jsonb_typeof(item.value)<>'number' OR item.value::text !~ '^[0-9]{1,9}$' THEN RAISE EXCEPTION 'Numero contesto non valido' USING ERRCODE='22023'; END IF;
   IF item.value::text::bigint>(CASE WHEN item.key IN('creative_version','engine_version') THEN 9999 WHEN item.key='candidate_count' THEN 100 WHEN item.key='selection_weight' THEN 9 WHEN item.key='visible_ms' THEN 3600000 WHEN item.key='page_ms' THEN 86400000 WHEN item.key='scroll_percent' THEN 100 ELSE 999999999 END) THEN RAISE EXCEPTION 'Numero contesto fuori limite' USING ERRCODE='22023'; END IF;
  ELSIF item.key IN('topics','keywords','priority_matches') THEN
   IF jsonb_typeof(item.value)<>'array' OR jsonb_array_length(item.value)>(CASE WHEN item.key='topics' THEN 4 ELSE 20 END) THEN RAISE EXCEPTION 'Parole contesto non valide' USING ERRCODE='22023'; END IF;
   FOR entry IN SELECT value FROM jsonb_array_elements(item.value) LOOP
    IF jsonb_typeof(entry)<>'string' OR length(entry#>>'{}')>80 OR (entry#>>'{}') !~ '^[a-z0-9][a-z0-9 ]*$' OR (item.key='topics' AND (entry#>>'{}') NOT IN('fiere','vendita','acquisto','mercati')) THEN RAISE EXCEPTION 'Parola contesto non valida' USING ERRCODE='22023'; END IF;
   END LOOP;
  ELSIF item.key IN('article_slug','article_region','device_class','source','referrer_type','match_basis','motion','article_published_at') THEN
   IF jsonb_typeof(item.value)<>'string' THEN RAISE EXCEPTION 'Testo contesto non valido' USING ERRCODE='22023'; END IF;
   IF (item.key='article_slug' AND (length(item.value#>>'{}')>200 OR (item.value#>>'{}') !~ '^[a-z0-9-]+$'))
   OR (item.key='article_region' AND (item.value#>>'{}') NOT IN('Abruzzo','Basilicata','Calabria','Campania','Emilia-Romagna','Friuli-Venezia Giulia','Lazio','Liguria','Lombardia','Marche','Molise','Piemonte','Puglia','Sardegna','Sicilia','Toscana','Trentino-Alto Adige','Umbria','Valle d''Aosta','Veneto'))
   OR (item.key='device_class' AND (item.value#>>'{}') NOT IN('phone','tablet','desktop','unknown'))
   OR (item.key='source' AND (item.value#>>'{}') NOT IN('blog','site','external','unknown'))
   OR (item.key='referrer_type' AND (item.value#>>'{}') NOT IN('direct','internal','search','social','other','unknown'))
   OR (item.key='match_basis' AND (item.value#>>'{}') NOT IN('title','slug','intro','body','manual','none','unknown'))
   OR (item.key='motion' AND (item.value#>>'{}') NOT IN('animated','static','unknown')) THEN RAISE EXCEPTION 'Categoria contesto non valida' USING ERRCODE='22023'; END IF;
   IF item.key='article_published_at' THEN
    IF (item.value#>>'{}') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9:.+Z-]+$' OR length(item.value#>>'{}')>40 THEN RAISE EXCEPTION 'Data articolo non valida' USING ERRCODE='22023'; END IF;
    BEGIN PERFORM (item.value#>>'{}')::timestamptz; EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'Data articolo non valida' USING ERRCODE='22023'; END;
   END IF;
  ELSE RAISE EXCEPTION 'Campo contesto non ammesso' USING ERRCODE='22023'; END IF;
 END LOOP;
 version:=COALESCE((ctx->>'creative_version')::integer,0);
 IF article_key<>'' THEN
  SELECT post.title,post.published_at INTO post_title,post_date FROM public.blog_posts post WHERE post.slug=article_key;
  IF NOT FOUND THEN RAISE EXCEPTION 'Articolo non valido' USING ERRCODE='22023'; END IF;
  ctx:=ctx||jsonb_build_object('article_title',post_title,'source','blog');
 END IF;
 IF uid IS NOT NULL AND EXISTS(SELECT 1 FROM public.profiles WHERE id=uid AND (is_admin IS TRUE OR is_demo IS TRUE)) THEN RETURN NULL; END IF;
 IF sid IS NOT NULL THEN
  PERFORM pg_advisory_xact_lock(hashtextextended('personal-ad:'||sid,0));
  SELECT id INTO result FROM public.personal_ad_events WHERE ad_id=p_ad AND format=p_format AND placement=p_placement AND kind=p_kind AND session_id=sid AND article_slug=article_key AND creative_version=version;
  IF result IS NOT NULL THEN RETURN result; END IF;
  IF (SELECT count(*) FROM public.personal_ad_events WHERE session_id=sid AND created_at>now()-interval '1 hour')>=250 THEN RETURN NULL; END IF;
 END IF;
 INSERT INTO public.personal_ad_events(ad_id,format,placement,kind,session_id,user_id,claimed_at,article_slug,creative_version,context_version,context)
 VALUES(p_ad,p_format,p_placement,p_kind,sid,CASE WHEN p_kind='click' THEN uid END,CASE WHEN p_kind='click' AND uid IS NOT NULL THEN now() END,article_key,version,CASE WHEN ctx='{}'::jsonb THEN 0 ELSE 2 END,ctx)
 RETURNING id INTO result;RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.personal_ad_event_v2(text,text,text,text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.personal_ad_event_v2(text,text,text,text,text,jsonb) TO anon,authenticated;

-- Old clients retain their historical unknown-article scope and signature.
CREATE OR REPLACE FUNCTION public.personal_ad_event(p_ad text,p_format text,p_placement text,p_kind text,p_session text DEFAULT NULL)
RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path='' AS $$
 SELECT public.personal_ad_event_v2(p_ad,p_format,p_placement,p_kind,p_session,'{}'::jsonb)
$$;
REVOKE ALL ON FUNCTION public.personal_ad_event(text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.personal_ad_event(text,text,text,text,text) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.admin_personal_ad_events(p_days integer DEFAULT 30,p_until timestamptz DEFAULT NULL,p_before timestamptz DEFAULT NULL,p_before_id uuid DEFAULT NULL,p_limit integer DEFAULT 500)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE until_at timestamptz:=LEAST(COALESCE(p_until,now()),now()); size integer:=LEAST(500,GREATEST(1,COALESCE(p_limit,500))); items jsonb; total integer;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin IS TRUE) THEN RAISE EXCEPTION 'Solo amministratore' USING ERRCODE='42501'; END IF;
 IF (p_before IS NULL)<>(p_before_id IS NULL) THEN RAISE EXCEPTION 'Cursore non valido' USING ERRCODE='22023'; END IF;
 WITH selected AS (
  SELECT id,ad_id,format,placement,kind,created_at,article_slug,creative_version,context_version,context FROM public.personal_ad_events
  WHERE created_at>=until_at-make_interval(days=>LEAST(365,GREATEST(1,COALESCE(p_days,30)))) AND created_at<=until_at
   AND (p_before IS NULL OR (created_at,id)<(p_before,p_before_id)) ORDER BY created_at DESC,id DESC LIMIT size+1
 ) SELECT COALESCE(jsonb_agg(to_jsonb(selected) ORDER BY created_at DESC,id DESC),'[]'::jsonb),count(*) INTO items,total FROM selected;
 RETURN jsonb_build_object('until',until_at,'rows',CASE WHEN total>size THEN items-size ELSE items END,'has_more',total>size,
 'next',CASE WHEN total>size THEN jsonb_build_object('at',items->(size-1)->>'created_at','id',items->(size-1)->>'id') ELSE NULL END);
END $$;
REVOKE ALL ON FUNCTION public.admin_personal_ad_events(integer,timestamptz,timestamptz,uuid,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_personal_ad_events(integer,timestamptz,timestamptz,uuid,integer) TO authenticated;

-- CONTEXT_ADMIN_REPORT
CREATE OR REPLACE FUNCTION public.admin_personal_ads(p_days integer DEFAULT 30)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE since_at timestamptz:=now()-make_interval(days=>LEAST(365,GREATEST(1,COALESCE(p_days,30)))); result jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin IS TRUE)
 THEN RAISE EXCEPTION 'Solo amministratore' USING ERRCODE='42501'; END IF;
 WITH actions AS (
  SELECT 'signup' kind,p.id::text action_id,p.id uid,p.created_at at,p.created_at started_at,0::bigint cents,0::bigint refunded FROM public.profiles p
   WHERE p.created_at>=since_at AND p.is_admin IS NOT TRUE AND p.is_demo IS NOT TRUE
  UNION ALL SELECT 'listing',a.id::text,a.user_id,a.created_at,a.created_at,0,0 FROM public.annunci a
   WHERE a.created_at>=since_at AND a.status IS DISTINCT FROM 'draft' AND a.is_demo IS NOT TRUE
  UNION ALL SELECT 'contact',c.id::text,c.revealer_id,c.created_at,c.created_at,0,0 FROM public.contact_reveals c
   WHERE c.created_at>=since_at AND c.revealer_id<>c.seller_id
  UNION ALL SELECT 'fair',s.id::text,s.user_id,s.occurred_at,s.occurred_at,0,0 FROM public.personal_ad_fair_actions s WHERE s.occurred_at>=since_at
  UNION ALL SELECT 'paid',coalesce(p.checkout_session_id,p.stripe_session_id,p.id::text),p.user_id,min(p.paid_at),min(p.created_at),sum(p.amount_cents-p.refunded_cents),sum(p.refunded_cents)
   FROM public.payments p WHERE p.paid_at>=since_at AND p.status IN('succeeded','refunded') AND p.currency='eur'
   GROUP BY coalesce(p.checkout_session_id,p.stripe_session_id,p.id::text),p.user_id
 ), attributed AS (
  SELECT a.*,e.id click_id,e.ad_id FROM actions a JOIN LATERAL (
    SELECT e.id,e.ad_id FROM public.personal_ad_events e
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
     SELECT 1 FROM public.personal_ad_events i WHERE i.kind='impression' AND i.ad_id=e.ad_id AND i.format=e.format
      AND i.placement=e.placement AND i.session_id=e.session_id AND i.article_slug=e.article_slug AND i.creative_version=e.creative_version AND i.created_at>=since_at AND i.created_at<=e.created_at)) measured_clicks,
   count(*) FILTER(WHERE c.goal) converted_clicks,
   coalesce(sum(c.signups),0) signups,coalesce(sum(c.listings),0) listings,coalesce(sum(c.contacts),0) contacts,coalesce(sum(c.fairs),0) fairs,
   coalesce(sum(c.paid_orders),0) paid_orders,coalesce(sum(c.revenue_cents),0) revenue_cents,coalesce(sum(c.refunded_cents),0) refunded_cents
  FROM public.personal_ad_events e LEFT JOIN conversions c ON c.click_id=e.id WHERE e.created_at>=since_at
  GROUP BY e.ad_id,e.format,e.placement,e.article_slug,e.creative_version,e.context_version,
   to_char(e.created_at AT TIME ZONE 'UTC','YYYY-MM-DD'),e.context->>'article_region',e.context->>'device_class',e.context->>'source',e.context->>'referrer_type',
   e.context->>'motion',e.context->>'match_basis',e.context->'topics',e.context->'keywords',e.context->'priority_matches',e.context->>'selection_weight',e.context->>'article_published_at',
   e.context->>'engine_version',e.context->>'post_rule_revision',e.context->>'ad_rule_revision'
 ) SELECT jsonb_build_object('period_days',LEAST(365,GREATEST(1,COALESCE(p_days,30))),'updated_at',now(),
  'started_at',(SELECT min(created_at) FROM public.personal_ad_events),
  'context_started_at',(SELECT min(created_at) FROM public.personal_ad_events WHERE context_version=2),
  'rows',coalesce((SELECT jsonb_agg(to_jsonb(g) ORDER BY g.ad_id,g.format,g.placement) FROM grouped g),'[]'::jsonb)) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.admin_personal_ads(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_personal_ads(integer) TO authenticated;

COMMENT ON COLUMN public.personal_ad_events.context IS 'ADS context v2: public article, creative/matching revision, coarse device/source and viewing metrics. No IP, email, full URL/referrer, user agent or fingerprint. Historical rows remain unknown.';
COMMIT;
