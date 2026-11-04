-- Only server-signed, session-bound advertising events enter the measured series.
-- Original events and their exclusion evidence remain recoverable.
BEGIN;
SET LOCAL lock_timeout='5s';
SET LOCAL statement_timeout='60s';
CREATE TABLE IF NOT EXISTS data_quality.personal_ad_ingestion_key (
 singleton boolean PRIMARY KEY DEFAULT true CHECK(singleton),
 secret text NOT NULL CHECK(length(secret)>=64)
);
CREATE TABLE IF NOT EXISTS data_quality.personal_ad_event_exclusions (
 event_id uuid PRIMARY KEY REFERENCES public.personal_ad_events(id) ON DELETE CASCADE,
 reason text NOT NULL CHECK(reason IN('automatic_scan','unverified_request')),
 excluded_at timestamptz NOT NULL DEFAULT now(),
 evidence text NOT NULL,
 original_event jsonb NOT NULL
);
ALTER TABLE data_quality.personal_ad_ingestion_key ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_quality.personal_ad_event_exclusions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON data_quality.personal_ad_ingestion_key,data_quality.personal_ad_event_exclusions FROM PUBLIC,anon,authenticated;
CREATE INDEX IF NOT EXISTS personal_ad_session_time_idx ON public.personal_ad_events(session_id,created_at DESC);

CREATE OR REPLACE VIEW data_quality.analytics_personal_ad_events AS
 SELECT t.id,t.ad_id,t.format,t.placement,t.kind,t.session_id,t.user_id,t.claimed_at,t.created_at,
 t.article_slug,t.creative_version,t.context_version,t.context FROM public.personal_ad_events t
 WHERE data_quality.analytics_row_allowed(to_jsonb(t))
 AND NOT EXISTS(SELECT 1 FROM data_quality.personal_ad_event_exclusions x WHERE x.event_id=t.id);
REVOKE ALL ON data_quality.analytics_personal_ad_events FROM PUBLIC,anon,authenticated;

REVOKE ALL ON FUNCTION public.personal_ad_event(text,text,text,text,text) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.personal_ad_event_v2(text,text,text,text,text,jsonb) FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.personal_ad_event_v3(p_payload text,p_signature text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE secret_key text; item jsonb; sid text; ctx jsonb; prior uuid; result uuid; issued numeric; impression_id uuid;
BEGIN
 IF p_payload IS NULL OR octet_length(p_payload)>12000 OR p_signature IS NULL OR p_signature !~ '^[a-f0-9]{64}$' THEN
  RAISE EXCEPTION 'Firma richiesta' USING ERRCODE='42501'; END IF;
 SELECT secret INTO secret_key FROM data_quality.personal_ad_ingestion_key WHERE singleton;
 IF secret_key IS NULL OR encode(extensions.hmac('event:'||p_payload,secret_key,'sha256'),'hex') IS DISTINCT FROM p_signature THEN
  RAISE EXCEPTION 'Firma non valida' USING ERRCODE='42501'; END IF;
 item:=p_payload::jsonb;
 IF jsonb_typeof(item)<>'object' OR (item->>'at') IS NULL OR (item->>'at') !~ '^[0-9]{13}$' THEN
  RAISE EXCEPTION 'Evento non valido' USING ERRCODE='22023'; END IF;
 issued:=(item->>'at')::numeric;
 IF issued<extract(epoch FROM clock_timestamp())*1000-60000 OR issued>extract(epoch FROM clock_timestamp())*1000+5000 THEN
  RAISE EXCEPTION 'Firma scaduta' USING ERRCODE='42501'; END IF;
 sid:=item->>'session';ctx:=item->'context';
 IF sid IS NULL OR sid !~ '^[a-zA-Z0-9_-]{8,80}$' OR ctx IS NULL OR jsonb_typeof(ctx)<>'object'
 OR (item->>'kind') IS NULL OR (item->>'kind') NOT IN('impression','click') THEN
  RAISE EXCEPTION 'Evento non valido' USING ERRCODE='22023'; END IF;
 IF data_quality.analytics_account_excluded(auth.uid()) OR NOT data_quality.analytics_row_allowed(jsonb_build_object('session_id',sid)) THEN RETURN NULL; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('personal-ad:'||sid,0));
 IF item->>'kind'='impression' THEN
  IF coalesce((ctx->>'visible_ms')::bigint,0)<1000 OR coalesce((ctx->>'page_ms')::bigint,0)<1000
  OR (ctx->>'device_class') IS NULL OR (ctx->>'device_class') NOT IN('phone','tablet','desktop') THEN RETURN NULL; END IF;
 ELSE
  IF (item->>'impression') IS NULL OR (item->>'impression') !~ '^[a-f0-9-]{36}$' THEN RETURN NULL; END IF;
  impression_id:=(item->>'impression')::uuid;
  SELECT id INTO prior FROM data_quality.analytics_personal_ad_events i WHERE i.id=impression_id AND i.kind='impression'
   AND i.session_id=sid AND i.ad_id=item->>'ad' AND i.format=item->>'format' AND i.placement=item->>'placement'
   AND i.article_slug=coalesce(ctx->>'article_slug','') AND i.creative_version=coalesce((ctx->>'creative_version')::integer,0);
  IF prior IS NULL THEN RETURN NULL; END IF;
 END IF;
 SELECT id INTO result FROM data_quality.analytics_personal_ad_events e WHERE e.session_id=sid AND e.kind=item->>'kind'
  AND e.ad_id=item->>'ad' AND e.format=item->>'format' AND e.placement=item->>'placement'
  AND e.article_slug=coalesce(ctx->>'article_slug','') AND e.creative_version=coalesce((ctx->>'creative_version')::integer,0);
 IF result IS NOT NULL THEN RETURN result; END IF;
 IF item->>'kind'='click' AND (SELECT count(*) FROM public.personal_ad_events WHERE session_id=sid AND kind='click' AND created_at>now()-interval '1 hour')>=20 THEN RETURN NULL; END IF;
 RETURN public.personal_ad_event_v2(item->>'ad',item->>'format',item->>'placement',item->>'kind',sid,ctx);
END $$;
REVOKE ALL ON FUNCTION public.personal_ad_event_v3(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.personal_ad_event_v3(text,text) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.personal_ad_claim(p_click uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=auth.uid(); result uuid;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Accesso richiesto' USING ERRCODE='42501'; END IF;
 IF data_quality.analytics_account_excluded(uid) THEN RETURN false; END IF;
 UPDATE public.personal_ad_events SET user_id=uid,claimed_at=coalesce(claimed_at,now())
 WHERE id=p_click AND kind='click' AND created_at>=now()-interval '7 days' AND (user_id IS NULL OR user_id=uid)
 AND NOT EXISTS(SELECT 1 FROM data_quality.personal_ad_event_exclusions x WHERE x.event_id=p_click)
 RETURNING id INTO result;
 RETURN result IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.personal_ad_claim(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.personal_ad_claim(uuid) TO authenticated;
COMMENT ON TABLE public.personal_ad_events IS 'Measured advertising events. GET never records a click. Since 2026-11-04 ingestion requires a server signature, browser session and previous measured impression for clicks. Historical excluded requests remain in data_quality.personal_ad_event_exclusions and outside all measured reports.';
COMMIT;
