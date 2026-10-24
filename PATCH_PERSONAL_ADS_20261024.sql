-- Libreria privata admin; eventi pseudonimi e attribuzione ultima ADS / 7 giorni.
-- Flussi annunci, email e pagamenti conservati. Ricevuta minima dei salvataggi fiere.
BEGIN;
CREATE TABLE IF NOT EXISTS public.personal_ad_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 ad_id text NOT NULL CHECK(ad_id ~ '^(vendi-0[1-7]|compra-0[1-7]|fiere-0[1-6])$'),
 format text NOT NULL CHECK(format IN('300x250','336x280','728x90','970x250','320x100','300x600','1080x1080','1080x1920','editoriale')),
 placement text NOT NULL CHECK(placement ~ '^[a-z0-9_-]{1,80}$'),
 kind text NOT NULL CHECK(kind IN('impression','click')),
 session_id text CHECK(session_id ~ '^[a-zA-Z0-9_-]{8,80}$'),
 user_id uuid,
 claimed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(ad_id,format,placement,kind,session_id)
);
ALTER TABLE public.personal_ad_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.personal_ad_events FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.personal_ad_events TO service_role;
CREATE INDEX IF NOT EXISTS personal_ad_events_time_idx ON public.personal_ad_events(created_at);
CREATE INDEX IF NOT EXISTS personal_ad_click_user_idx ON public.personal_ad_events(user_id,created_at DESC) WHERE kind='click';

-- Salva/rimuovi è un'azione avvenuta, non lo stato attuale dei preferiti.
-- Nessun nome/luogo/token della fiera nella ricevuta; cancellazione account coerente.
CREATE TABLE IF NOT EXISTS public.personal_ad_fair_actions (
 id uuid PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 occurred_at timestamptz NOT NULL
);
ALTER TABLE public.personal_ad_fair_actions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.personal_ad_fair_actions FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.personal_ad_fair_actions TO service_role;
CREATE INDEX IF NOT EXISTS personal_ad_fair_actions_time_idx ON public.personal_ad_fair_actions(occurred_at);
CREATE OR REPLACE FUNCTION public.personal_ad_record_fair_action()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 INSERT INTO public.personal_ad_fair_actions(id,user_id,occurred_at) VALUES(NEW.id,NEW.user_id,NEW.created_at) ON CONFLICT(id) DO NOTHING;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.personal_ad_record_fair_action() FROM PUBLIC,anon,authenticated;
DROP TRIGGER IF EXISTS personal_ad_fair_action ON public.saved_fairs;
CREATE TRIGGER personal_ad_fair_action AFTER INSERT ON public.saved_fairs FOR EACH ROW EXECUTE FUNCTION public.personal_ad_record_fair_action();
INSERT INTO public.personal_ad_fair_actions(id,user_id,occurred_at) SELECT id,user_id,created_at FROM public.saved_fairs ON CONFLICT(id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.personal_ad_event(p_ad text,p_format text,p_placement text,p_kind text,p_session text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result uuid; sid text:=NULLIF(p_session,''); uid uuid:=auth.uid();
BEGIN
 IF p_ad IS NULL OR p_ad !~ '^(vendi-0[1-7]|compra-0[1-7]|fiere-0[1-6])$'
 OR p_format IS NULL OR p_format NOT IN('300x250','336x280','728x90','970x250','320x100','300x600','1080x1080','1080x1920','editoriale')
 OR p_placement IS NULL OR p_placement !~ '^[a-z0-9_-]{1,80}$'
 OR p_kind IS NULL OR p_kind NOT IN('impression','click')
 OR (sid IS NOT NULL AND sid !~ '^[a-zA-Z0-9_-]{8,80}$') THEN RAISE EXCEPTION 'Evento non valido' USING ERRCODE='22023'; END IF;
 IF uid IS NOT NULL AND EXISTS(SELECT 1 FROM public.profiles WHERE id=uid AND (is_admin IS TRUE OR is_demo IS TRUE)) THEN RETURN NULL; END IF;
 IF sid IS NOT NULL THEN
   PERFORM pg_advisory_xact_lock(hashtextextended('personal-ad:'||sid,0));
   SELECT id INTO result FROM public.personal_ad_events WHERE ad_id=p_ad AND format=p_format AND placement=p_placement AND kind=p_kind AND session_id=sid;
   IF result IS NOT NULL THEN RETURN result; END IF;
   IF (SELECT count(*) FROM public.personal_ad_events WHERE session_id=sid AND created_at>now()-interval '1 hour')>=250 THEN RETURN NULL; END IF;
 END IF;
 INSERT INTO public.personal_ad_events(ad_id,format,placement,kind,session_id,user_id,claimed_at)
 VALUES(p_ad,p_format,p_placement,p_kind,sid,CASE WHEN p_kind='click' THEN uid END,CASE WHEN p_kind='click' AND uid IS NOT NULL THEN now() END)
 RETURNING id INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.personal_ad_event(text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.personal_ad_event(text,text,text,text,text) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.personal_ad_claim(p_click uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=auth.uid(); result uuid;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Accesso richiesto' USING ERRCODE='42501'; END IF;
 IF EXISTS(SELECT 1 FROM public.profiles WHERE id=uid AND (is_admin IS TRUE OR is_demo IS TRUE)) THEN RETURN false; END IF;
 UPDATE public.personal_ad_events SET user_id=uid,claimed_at=COALESCE(claimed_at,now())
 WHERE id=p_click AND kind='click' AND created_at>=now()-interval '7 days'
 AND (user_id IS NULL OR user_id=uid) RETURNING id INTO result;
 RETURN result IS NOT NULL;
END $$;
REVOKE ALL ON FUNCTION public.personal_ad_claim(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.personal_ad_claim(uuid) TO authenticated;

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
  SELECT e.ad_id,e.format,e.placement,
   count(*) FILTER(WHERE e.kind='impression') impressions,count(*) FILTER(WHERE e.kind='click') clicks,
   count(*) FILTER(WHERE e.kind='click' AND e.session_id IS NOT NULL AND EXISTS(
     SELECT 1 FROM public.personal_ad_events i WHERE i.kind='impression' AND i.ad_id=e.ad_id AND i.format=e.format
      AND i.placement=e.placement AND i.session_id=e.session_id AND i.created_at<=e.created_at)) measured_clicks,
   count(*) FILTER(WHERE c.goal) converted_clicks,
   coalesce(sum(c.signups),0) signups,coalesce(sum(c.listings),0) listings,coalesce(sum(c.contacts),0) contacts,coalesce(sum(c.fairs),0) fairs,
   coalesce(sum(c.paid_orders),0) paid_orders,coalesce(sum(c.revenue_cents),0) revenue_cents,coalesce(sum(c.refunded_cents),0) refunded_cents
  FROM public.personal_ad_events e LEFT JOIN conversions c ON c.click_id=e.id WHERE e.created_at>=since_at
  GROUP BY e.ad_id,e.format,e.placement
 ) SELECT jsonb_build_object('period_days',LEAST(365,GREATEST(1,COALESCE(p_days,30))),'updated_at',now(),
  'started_at',(SELECT min(created_at) FROM public.personal_ad_events),
  'rows',coalesce((SELECT jsonb_agg(to_jsonb(g) ORDER BY g.ad_id,g.format,g.placement) FROM grouped g),'[]'::jsonb)) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.admin_personal_ads(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_personal_ads(integer) TO authenticated;
COMMENT ON TABLE public.personal_ad_events IS 'ADS personali: nessun IP, email, user agent o nuovo identificativo persistente. Sessione riusata dal sito. Clic esterni senza sessione separati per richiesta. Metriche dal 24 ottobre 2026; storico precedente non ricostruito.';
COMMIT;
