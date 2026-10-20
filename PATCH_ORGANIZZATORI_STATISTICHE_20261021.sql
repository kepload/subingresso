-- Statistiche proprietario: soli aggregati, nessuna attivazione prenotazioni/pagamenti.
BEGIN;
CREATE TABLE IF NOT EXISTS event_private.analytics_settings (
 id boolean PRIMARY KEY DEFAULT true CHECK(id), started_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO event_private.analytics_settings(id) VALUES(true) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS event_private.analytics_events (
 event_id uuid NOT NULL REFERENCES public.organizer_events(id) ON DELETE CASCADE,
 day date NOT NULL, metric text NOT NULL CHECK(metric IN('view','email','phone','website')),
 session_hash text NOT NULL CHECK(length(session_hash)=64),
 source text NOT NULL CHECK(source IN('calendar','profile','site','external','direct')),
 device text NOT NULL CHECK(device IN('mobile','desktop')),
 created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(event_id,day,metric,session_hash)
);
ALTER TABLE event_private.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_private.analytics_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON event_private.analytics_events,event_private.analytics_settings FROM PUBLIC,anon,authenticated;
CREATE INDEX IF NOT EXISTS event_analytics_period ON event_private.analytics_events(day,event_id);
CREATE INDEX IF NOT EXISTS event_analytics_retention ON event_private.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS saved_fairs_organizer_stats ON public.saved_fairs(fair_id) WHERE fair_kind='organizer';

CREATE OR REPLACE FUNCTION public.track_organizer_event(p_event_id uuid,p_metric text,p_session uuid,p_source text DEFAULT 'direct',p_device text DEFAULT 'desktop')
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=auth.uid(); today date:=(now() AT TIME ZONE 'UTC')::date;
BEGIN
 IF p_session IS NULL OR p_metric IS NULL OR p_metric NOT IN('view','email','phone','website')
 OR p_source IS NULL OR p_source NOT IN('calendar','profile','site','external','direct')
 OR p_device IS NULL OR p_device NOT IN('mobile','desktop') THEN RETURN; END IF;
 IF EXISTS(SELECT 1 FROM public.profiles WHERE id=uid AND is_admin) THEN RETURN; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.organizer_events e JOIN public.organizer_profiles p ON p.user_id=e.organizer_id
 WHERE e.id=p_event_id AND e.status='published' AND p.status='approved' AND e.organizer_id IS DISTINCT FROM uid
 AND (p_metric<>'email' OR p.public_email<>'') AND (p_metric<>'phone' OR p.public_phone<>'') AND (p_metric<>'website' OR p.website<>'')) THEN RETURN; END IF;
 INSERT INTO event_private.analytics_events(event_id,day,metric,session_hash,source,device)
 VALUES(p_event_id,today,p_metric,encode(extensions.digest(p_session::text||p_event_id::text||today::text,'sha256'),'hex'),p_source,p_device)
 ON CONFLICT DO NOTHING;
END $$;

CREATE OR REPLACE FUNCTION public.organizer_analytics(p_days integer DEFAULT 30,p_event_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' SET timezone='UTC' AS $$
DECLARE uid uuid:=event_private.require_user(); result jsonb;
 current_day date:=(now() AT TIME ZONE 'UTC')::date; from_at timestamptz; previous_from timestamptz; previous_to timestamptz;
BEGIN
 IF p_days IS NULL OR p_days NOT IN(7,30,90) THEN RAISE EXCEPTION 'Periodo non valido'; END IF;
 IF p_event_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.organizer_events WHERE id=p_event_id AND organizer_id=uid) THEN
 RAISE EXCEPTION 'Evento non disponibile' USING ERRCODE='42501'; END IF;
 from_at:=((current_day-p_days+1)::timestamp AT TIME ZONE 'UTC');
 previous_from:=from_at-make_interval(days=>p_days); previous_to:=now()-make_interval(days=>p_days);
 WITH mine AS MATERIALIZED (
  SELECT e.* FROM public.organizer_events e WHERE organizer_id=uid AND (p_event_id IS NULL OR e.id=p_event_id)
 ), activity AS MATERIALIZED (
  SELECT a.* FROM event_private.analytics_events a JOIN mine e ON e.id=a.event_id
  WHERE a.day>=(previous_from AT TIME ZONE 'UTC')::date AND a.created_at>=previous_from AND a.created_at<=now()
 ), totals AS (
  SELECT count(*) FILTER(WHERE metric='view' AND created_at>=from_at) views,
  count(*) FILTER(WHERE metric<>'view' AND created_at>=from_at) contacts,
  count(*) FILTER(WHERE metric='email' AND created_at>=from_at) email,
  count(*) FILTER(WHERE metric='phone' AND created_at>=from_at) phone,
  count(*) FILTER(WHERE metric='website' AND created_at>=from_at) website,
  count(*) FILTER(WHERE metric='view' AND created_at>=previous_from AND created_at<=previous_to AND created_at<from_at) previous_views,
  count(*) FILTER(WHERE metric<>'view' AND created_at>=previous_from AND created_at<=previous_to AND created_at<from_at) previous_contacts
  FROM activity
 ), rows AS (
  SELECT e.id,e.title,e.status,e.city,e.start_date,e.end_date,e.application_deadline,
  coalesce(i.capacity,0) capacity,coalesce(i.external_reserved,0) external_reserved,coalesce(i.confirmed,0) confirmed,
  coalesce(i.held,0) held,coalesce(i.available,0) available,
  (SELECT count(*) FROM activity a WHERE a.event_id=e.id AND metric='view' AND created_at>=from_at) views,
  (SELECT count(*) FROM activity a WHERE a.event_id=e.id AND metric<>'view' AND created_at>=from_at) contacts,
  (SELECT count(*) FROM public.saved_fairs s WHERE s.fair_kind='organizer' AND s.fair_id=e.id::text AND s.user_id<>uid) saved,
  (SELECT count(*) FROM public.saved_fairs s WHERE s.fair_kind='organizer' AND s.fair_id=e.id::text AND s.user_id<>uid AND s.reminder_enabled) reminders
  FROM mine e LEFT JOIN LATERAL (
   SELECT sum(p.quantity) capacity,sum(p.external_reserved) external_reserved,
   sum((v->>'confirmed')::integer) confirmed,sum((v->>'held')::integer) held,sum((v->>'available')::integer) available
   FROM public.event_places p CROSS JOIN LATERAL event_private.place_inventory(p.id) v WHERE p.event_id=e.id AND p.active
  ) i ON true
 ) SELECT jsonb_build_object('days',p_days,'from',from_at,'to',now(),'previous_from',previous_from,'previous_to',previous_to,
 'started_at',(SELECT started_at FROM event_private.analytics_settings WHERE id),
 'profile_status',(SELECT status FROM public.organizer_profiles WHERE user_id=uid),
 'totals',(SELECT to_jsonb(t) FROM totals t),'events',coalesce((SELECT jsonb_agg(to_jsonb(r) ORDER BY r.start_date,r.title,r.id) FROM rows r),'[]'::jsonb),
 'daily',(SELECT jsonb_agg(jsonb_build_object('day',d::date,'views',(SELECT count(*) FROM activity a WHERE a.day=d::date AND a.metric='view' AND a.created_at>=from_at),
 'contacts',(SELECT count(*) FROM activity a WHERE a.day=d::date AND a.metric<>'view' AND a.created_at>=from_at)) ORDER BY d)
 FROM generate_series((current_day-p_days+1)::timestamp,current_day::timestamp,interval '1 day') d),
 'sources',coalesce((SELECT jsonb_agg(to_jsonb(s)) FROM (SELECT source,count(*) views FROM activity WHERE created_at>=from_at AND metric='view' GROUP BY source ORDER BY count(*) DESC,source) s),'[]'::jsonb),
 'devices',coalesce((SELECT jsonb_agg(to_jsonb(s)) FROM (SELECT device,count(*) views FROM activity WHERE created_at>=from_at AND metric='view' GROUP BY device ORDER BY count(*) DESC,device) s),'[]'::jsonb)) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.organizer_analytics(integer,uuid),public.track_organizer_event(uuid,text,uuid,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.organizer_analytics(integer,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.track_organizer_event(uuid,text,uuid,text,text) TO anon,authenticated;
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM cron.job WHERE jobname='event-analytics-retention') THEN
 PERFORM cron.schedule('event-analytics-retention','17 3 * * *',
 'DELETE FROM event_private.analytics_events WHERE created_at < now() - interval ''190 days''');
 END IF;
END $$;
NOTIFY pgrst,'reload schema';
COMMIT;
