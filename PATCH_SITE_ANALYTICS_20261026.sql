-- Eventi essenziali del sito. Nessun testo dei moduli, recapito o account nel registro.
BEGIN;
CREATE TABLE IF NOT EXISTS public.site_analytics_config (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
 started_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.site_analytics_config(singleton) VALUES(true) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS public.site_analytics_events (
 id uuid PRIMARY KEY,
 created_at timestamptz NOT NULL DEFAULT now(),
 session_id uuid NOT NULL,
 name text NOT NULL,
 page text NOT NULL,
 entity text,
 device text NOT NULL CHECK(device IN ('mobile','tablet','desktop')),
 source text NOT NULL,
 entry_page text NOT NULL,
 campaign text,
 medium text,
 channel text,
 authenticated boolean NOT NULL DEFAULT false,
 data jsonb NOT NULL DEFAULT '{}'
);
CREATE INDEX IF NOT EXISTS site_analytics_time ON public.site_analytics_events(created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS site_analytics_session ON public.site_analytics_events(session_id,created_at DESC);
ALTER TABLE public.site_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_analytics_config ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.site_analytics_events,public.site_analytics_config FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.track_site_events(p_events jsonb)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE e jsonb; d jsonb; clean jsonb; k text; v text; n integer:=0; sid uuid; eid uuid; used integer; actor uuid:=auth.uid();
 names constant text[]:=ARRAY['page_enter','page_engagement','page_leave','search_results','publish_start','publish_step','publish_error','publish_resume','publish_attempt','publish_success','photo_select','photo_error','auth_open','auth_tab','auth_attempt','auth_error','auth_success','signup_success','auth_confirmation','valuation_start','valuation_step','valuation_error','valuation_result','valuation_save','fair_search','fair_open','fair_source','fair_save','fair_reminder','blog_read','cta_click','listing_open','listing_contact','listing_save','message_sent','vetrina_action','technical_error'];
 pages constant text[]:=ARRAY['home','search','publish','listing','fairs','fair','event','blog','valuation','auth','dashboard','messages','other'];
 sources constant text[]:=ARRAY['home','search','publish','listing','fairs','fair','event','blog','valuation','auth','dashboard','messages','other','similar','external','direct'];
BEGIN
 IF jsonb_typeof(p_events) IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Invalid batch' USING ERRCODE='22023'; END IF;
 IF jsonb_array_length(p_events)>20 OR octet_length(p_events::text)>32000 THEN RAISE EXCEPTION 'Invalid batch' USING ERRCODE='22023'; END IF;
 IF actor IS NOT NULL AND EXISTS(SELECT 1 FROM public.profiles WHERE id=actor AND (coalesce(is_admin,false) OR coalesce(is_demo,false))) THEN RETURN 0; END IF;
 FOR e IN SELECT value FROM jsonb_array_elements(p_events) LOOP
  IF jsonb_typeof(e)<>'object' OR NOT coalesce(e->>'name'=ANY(names),false) OR NOT coalesce(e->>'page'=ANY(pages),false) OR NOT coalesce(e->>'device'=ANY(ARRAY['mobile','tablet','desktop']),false) THEN CONTINUE; END IF;
  BEGIN sid:=(e->>'session_id')::uuid; eid:=(e->>'id')::uuid; EXCEPTION WHEN invalid_text_representation THEN CONTINUE; END;
  IF sid IS NULL OR eid IS NULL THEN CONTINUE; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(sid::text,846));
  SELECT count(*) INTO used FROM public.site_analytics_events WHERE session_id=sid AND created_at>now()-interval '1 hour';
  IF used>=300 THEN CONTINUE; END IF;
  d:=e->'data'; IF jsonb_typeof(d) IS DISTINCT FROM 'object' THEN d:='{}'; END IF; clean:='{}';
  FOR k,v IN SELECT key,value #>> '{}' FROM jsonb_each(d) LOOP
   IF k=ANY(ARRAY['step','results','radius','rank','photos','http_status','visible_seconds','elapsed_seconds','scroll_percent','month_from','month_to','days_mask','price_min_band','price_max_band','area_band']) THEN
    IF v ~ '^[0-9]{1,7}$' AND v::bigint<=1000000 THEN
     IF (k='step' AND v::integer NOT BETWEEN 1 AND 8) OR (k='scroll_percent' AND v::integer>100) OR (k='http_status' AND v::integer>599) OR (k=ANY(ARRAY['visible_seconds','elapsed_seconds']) AND v::integer>86400) OR (k=ANY(ARRAY['month_from','month_to']) AND v::integer NOT BETWEEN 1 AND 12) THEN CONTINUE; END IF;
     clean:=clean||jsonb_build_object(k,v::integer);
    END IF;
   ELSIF k=ANY(ARRAY['has_query','empty','resumed','success','saved','reminder','needs_confirmation']) AND v IN ('true','false') THEN clean:=clean||jsonb_build_object(k,v::boolean);
   ELSIF k IN ('region','province','place') THEN
    IF EXISTS(SELECT 1 FROM data_quality.locations l WHERE (k='region' AND l.regione=v) OR (k='province' AND l.provincia=v) OR (k='place' AND l.name=v AND l.regione=d->>'region')) THEN clean:=clean||jsonb_build_object(k,v); END IF;
   ELSIF k='field' AND v=ANY(ARRAY['form','fComune','fTipo','fGiorni','fMerce','fSuperficie','fPrezzo','fTitolo','fDescrizione','fNome','fTel','fNomeFieraInput','fNoteFiera','fileInput','regNome','regCognome','regEmail','regTelefono','regPassword','regTerms','regTermsAccepted','loginEmail','loginPassword','fatturato','giornate','utileGiorno','concessione','unknown']) THEN clean:=clean||jsonb_build_object(k,v);
   ELSIF k='error_code' AND v=ANY(ARRAY['validation','network','timeout','unauthorized','forbidden','rate_limit','server','storage','upload','credentials','confirmation','javascript','resource','unknown']) THEN clean:=clean||jsonb_build_object(k,v);
   ELSIF k='action' AND v=ANY(ARRAY['login','register','forgot','call','whatsapp','chat','email','website','save','publish','search','valuation','fairs','annunci','vendi','offer_open','offer_close','tier_select','checkout_attempt','checkout_error','checkout_cancel','unknown']) THEN clean:=clean||jsonb_build_object(k,v);
   ELSIF k='target' AND v=ANY(pages) THEN clean:=clean||jsonb_build_object(k,v);
   ELSIF k='target_entity' AND v ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN clean:=clean||jsonb_build_object(k,v);
   ELSIF k='placement' AND v=ANY(ARRAY['header','footer','body','card','similar','form','unknown']) THEN clean:=clean||jsonb_build_object(k,v);
   ELSIF k='offer' AND v=ANY(ARRAY['sale','rent','all']) THEN clean:=clean||jsonb_build_object(k,v);
   ELSIF k='market' AND v=ANY(ARRAY['weekly','fair','all']) THEN clean:=clean||jsonb_build_object(k,v);
   ELSIF k='category' AND v=ANY(ARRAY['fiera','sagra','mercato','evento','antiquariato','artigianato','alimentare','non-alimentare','all']) THEN clean:=clean||jsonb_build_object(k,v);
   ELSIF k='tier' AND v=ANY(ARRAY['free','10d','30d','90d']) THEN clean:=clean||jsonb_build_object(k,v);
   END IF;
  END LOOP;
  v:=e->>'entity'; IF v IS NOT NULL AND NOT(v ~ '^[a-z0-9][a-z0-9-]{0,119}$') THEN v:=NULL; END IF;
  INSERT INTO public.site_analytics_events(id,session_id,name,page,entity,device,source,entry_page,campaign,medium,channel,authenticated,data)
  VALUES(eid,sid,e->>'name',e->>'page',v,e->>'device',CASE WHEN e->>'source'=ANY(sources) THEN e->>'source' ELSE 'direct' END,
   CASE WHEN e->>'entry_page'=ANY(pages) THEN e->>'entry_page' ELSE 'other' END,
   CASE WHEN e->>'campaign' ~ '^[a-z0-9_-]{1,80}$' THEN e->>'campaign' END,
   CASE WHEN e->>'medium' ~ '^[a-z0-9_-]{1,80}$' THEN e->>'medium' END,
   CASE WHEN e->>'channel' ~ '^[a-z0-9.-]{1,100}$' THEN e->>'channel' END,actor IS NOT NULL,clean)
  ON CONFLICT(id) DO NOTHING;
  GET DIAGNOSTICS used=ROW_COUNT; n:=n+used;
 END LOOP;
 RETURN n;
END $$;
REVOKE ALL ON FUNCTION public.track_site_events(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_site_events(jsonb) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.admin_site_analytics(p_days integer DEFAULT 30,p_offset integer DEFAULT 0,p_limit integer DEFAULT 100,p_device text DEFAULT NULL,p_until timestamptz DEFAULT now())
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE result jsonb; upper_at timestamptz:=least(coalesce(p_until,now()),now()); days integer:=greatest(1,least(coalesce(p_days,30),190));
BEGIN
 IF NOT coalesce((SELECT is_admin FROM public.profiles WHERE id=auth.uid()),false) THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
 WITH filtered AS MATERIALIZED (
  SELECT * FROM public.site_analytics_events WHERE created_at>=upper_at-make_interval(days=>days) AND created_at<=upper_at AND (p_device IS NULL OR p_device='' OR device=p_device)
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
END $$;
REVOKE ALL ON FUNCTION public.admin_site_analytics(integer,integer,integer,text,timestamptz) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_site_analytics(integer,integer,integer,text,timestamptz) TO authenticated;
COMMENT ON TABLE public.site_analytics_events IS 'Eventi pseudonimi di sessione; esclusi contenuti privati e account. Conservazione 190 giorni. Esportazione solo admin e senza session_id.';
DO $$ BEGIN
 IF EXISTS(SELECT 1 FROM pg_extension WHERE extname='pg_cron') AND NOT EXISTS(SELECT 1 FROM cron.job WHERE jobname='site-analytics-retention') THEN
  PERFORM cron.schedule('site-analytics-retention','25 3 * * *',$job$DELETE FROM public.site_analytics_events WHERE created_at < now()-interval '190 days'$job$);
 END IF;
END $$;
COMMIT;
