-- Fiere scelte dall'utente e un promemoria per l'edizione/data scelta.
-- Nessun segreto, nessuna email o modifica agli annunci in questa migrazione.
BEGIN;
CREATE SCHEMA IF NOT EXISTS fair_private;
REVOKE ALL ON SCHEMA fair_private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION fair_private.reminder_date(p_date date,p_months integer)
RETURNS date LANGUAGE sql IMMUTABLE STRICT SET search_path='' AS $$
 SELECT (p_date-pg_catalog.make_interval(months=>p_months))::date;
$$;

CREATE TABLE IF NOT EXISTS public.saved_fairs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 fair_kind text NOT NULL CHECK(fair_kind IN('catalog','organizer')),
 fair_id text NOT NULL CHECK(fair_id ~ '^[a-z0-9][a-z0-9-]{0,219}$'),
 fair_name text NOT NULL CHECK(length(btrim(fair_name)) BETWEEN 1 AND 300),
 city text NOT NULL CHECK(length(city)<=200),
 reference_date date,
 date_origin text NOT NULL DEFAULT 'personal' CHECK(date_origin IN('published','personal')),
 reminder_enabled boolean NOT NULL DEFAULT false,
 months_before integer NOT NULL DEFAULT 5 CHECK(months_before BETWEEN 1 AND 120),
 remind_on date,
 edition_key text NOT NULL DEFAULT '',
 revision integer NOT NULL DEFAULT 1 CHECK(revision>0),
 unsub_token uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,fair_kind,fair_id),
 CHECK(NOT reminder_enabled OR (reference_date IS NOT NULL AND remind_on IS NOT NULL))
);
ALTER TABLE public.saved_fairs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.saved_fairs FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.saved_fairs TO service_role;
CREATE INDEX IF NOT EXISTS saved_fairs_due_idx ON public.saved_fairs(remind_on) WHERE reminder_enabled;

CREATE TABLE IF NOT EXISTS fair_private.deliveries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 fair_kind text NOT NULL, fair_id text NOT NULL, edition_key text NOT NULL,
 favorite_id uuid, favorite_revision integer NOT NULL,
 status text NOT NULL DEFAULT 'retry' CHECK(status IN('retry','sending','sent','cancelled','failed','needs_review')),
 payload jsonb, attempts integer NOT NULL DEFAULT 0,
 lease_until timestamptz, next_attempt_at timestamptz NOT NULL DEFAULT now(),
 uncertain_since timestamptz, sent_at timestamptz, provider_id text, last_error text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(user_id,fair_kind,fair_id,edition_key)
);
REVOKE ALL ON fair_private.deliveries FROM PUBLIC,anon,authenticated;
CREATE INDEX IF NOT EXISTS fair_deliveries_retry_idx ON fair_private.deliveries(next_attempt_at) WHERE status IN('retry','sending');

CREATE OR REPLACE FUNCTION public.my_saved_fairs() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Accedi per vedere le tue fiere.' USING ERRCODE='42501'; END IF;
 RETURN coalesce((SELECT jsonb_agg(jsonb_build_object(
  'id',s.id,'fair_kind',s.fair_kind,'fair_id',s.fair_id,'fair_name',s.fair_name,'city',s.city,
  'reference_date',s.reference_date,'date_origin',s.date_origin,'reminder_enabled',s.reminder_enabled,
  'months_before',s.months_before,'remind_on',s.remind_on,'revision',s.revision,
  'sent_at',d.sent_at,'delivery_status',d.status,'created_at',s.created_at
 ) ORDER BY s.updated_at DESC) FROM public.saved_fairs s LEFT JOIN fair_private.deliveries d
 ON d.user_id=s.user_id AND d.fair_kind=s.fair_kind AND d.fair_id=s.fair_id AND d.edition_key=s.edition_key
 WHERE s.user_id=auth.uid()),'[]'::jsonb);
END $$;

CREATE OR REPLACE FUNCTION public.save_fair(p_data jsonb,p_expected_revision integer DEFAULT 0) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=auth.uid(); old public.saved_fairs; result_id uuid; ref date; months integer;
 enabled boolean; target date; kind text:=p_data->>'fair_kind'; fid text:=p_data->>'fair_id'; origin text:=p_data->>'date_origin';
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'Accedi per salvare la fiera.' USING ERRCODE='42501'; END IF;
 IF kind IS NULL OR kind NOT IN('catalog','organizer') OR fid IS NULL OR fid !~ '^[a-z0-9][a-z0-9-]{0,219}$'
 OR length(btrim(coalesce(p_data->>'fair_name',''))) NOT BETWEEN 1 AND 300
 OR length(coalesce(p_data->>'city',''))>200 OR origin IS NULL OR origin NOT IN('published','personal')
 THEN RAISE EXCEPTION 'Dati della fiera non validi.' USING ERRCODE='22023'; END IF;
 ref:=nullif(p_data->>'reference_date','')::date;
 months:=coalesce((p_data->>'months_before')::integer,5);
 enabled:=coalesce((p_data->>'reminder_enabled')::boolean,false);
 IF months NOT BETWEEN 1 AND 120 OR (ref IS NOT NULL AND (ref<'1900-01-01' OR ref>((now() AT TIME ZONE 'Europe/Rome')::date+interval '10 years')::date))
 THEN RAISE EXCEPTION 'Scegli mesi e data validi.' USING ERRCODE='22023'; END IF;
 IF enabled THEN
  target:=fair_private.reminder_date(ref,months);
  IF ref IS NULL OR ref<=(now() AT TIME ZONE 'Europe/Rome')::date OR target<(now() AT TIME ZONE 'Europe/Rome')::date
  THEN RAISE EXCEPTION 'La data del promemoria è già passata: riduci i mesi o scegli un’altra data per la fiera.' USING ERRCODE='22023'; END IF;
 END IF;
 -- Serialize the first save too, so retries cannot create conflicting rows.
 PERFORM pg_advisory_xact_lock(hashtextextended(uid::text||':'||kind||':'||fid,0));
 SELECT * INTO old FROM public.saved_fairs WHERE user_id=uid AND fair_kind=kind AND fair_id=fid FOR UPDATE;
 IF old.id IS NOT NULL AND old.revision<>p_expected_revision THEN
  RAISE EXCEPTION 'La fiera è stata modificata altrove. Riapri e riprova.' USING ERRCODE='40001';
 END IF;
 INSERT INTO public.saved_fairs(user_id,fair_kind,fair_id,fair_name,city,reference_date,date_origin,reminder_enabled,months_before,remind_on,edition_key)
 VALUES(uid,kind,fid,btrim(p_data->>'fair_name'),coalesce(p_data->>'city',''),ref,origin,enabled,months,target,
  CASE WHEN kind='organizer' THEN 'event' ELSE coalesce(ref::text,'') END)
 ON CONFLICT(user_id,fair_kind,fair_id) DO UPDATE SET fair_name=EXCLUDED.fair_name,city=EXCLUDED.city,
 reference_date=EXCLUDED.reference_date,date_origin=EXCLUDED.date_origin,reminder_enabled=EXCLUDED.reminder_enabled,
 months_before=EXCLUDED.months_before,remind_on=EXCLUDED.remind_on,edition_key=EXCLUDED.edition_key,
 revision=saved_fairs.revision+1,updated_at=now() RETURNING id INTO result_id;
 UPDATE fair_private.deliveries d SET status='retry',payload=NULL,next_attempt_at=now(),lease_until=NULL,
  favorite_id=result_id,favorite_revision=s.revision,updated_at=now()
 FROM public.saved_fairs s WHERE s.id=result_id AND d.user_id=uid AND d.fair_kind=kind AND d.fair_id=fid
 AND d.edition_key=s.edition_key AND d.status IN('failed','cancelled') AND d.uncertain_since IS NULL;
 RETURN (SELECT value FROM jsonb_array_elements(public.my_saved_fairs()) WHERE value->>'id'=result_id::text);
END $$;

CREATE OR REPLACE FUNCTION public.remove_saved_fair(p_id uuid,p_expected_revision integer) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE item public.saved_fairs;
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Accedi per gestire le tue fiere.' USING ERRCODE='42501'; END IF;
 SELECT * INTO item FROM public.saved_fairs WHERE id=p_id AND user_id=auth.uid() FOR UPDATE;
 IF item.id IS NULL THEN RETURN true; END IF;
 IF item.revision<>p_expected_revision THEN RAISE EXCEPTION 'La fiera è stata modificata altrove. Riapri e riprova.' USING ERRCODE='40001'; END IF;
 DELETE FROM public.saved_fairs WHERE id=item.id;
 -- Leave in-flight attempts to report their real outcome, including uncertainty.
 UPDATE fair_private.deliveries SET status='cancelled',updated_at=now() WHERE favorite_id=item.id AND status NOT IN('sending','sent','failed','needs_review');
 RETURN true;
END $$;

-- Service-only queue, leases and provider idempotency keep concurrent cron calls safe.
CREATE OR REPLACE FUNCTION public.claim_fair_reminders(p_limit integer DEFAULT 20,p_dry_run boolean DEFAULT false) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE item public.saved_fairs; delivery fair_private.deliveries; result jsonb:='[]'::jsonb;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Accesso riservato.' USING ERRCODE='42501'; END IF;
 IF p_dry_run THEN RETURN jsonb_build_object('due',(SELECT count(*) FROM public.saved_fairs WHERE reminder_enabled AND remind_on<=(now() AT TIME ZONE 'Europe/Rome')::date AND reference_date>(now() AT TIME ZONE 'Europe/Rome')::date)); END IF;
 -- A published organizer event keeps the same identity when its date moves.
 UPDATE public.saved_fairs s SET reference_date=e.start_date,
  remind_on=CASE WHEN s.reminder_enabled THEN fair_private.reminder_date(e.start_date,s.months_before) ELSE NULL END,
  revision=s.revision+1,updated_at=now()
 FROM public.organizer_events e JOIN public.organizer_profiles p ON p.user_id=e.organizer_id
 WHERE s.fair_kind='organizer' AND s.fair_id=e.id::text AND s.date_origin='published'
 AND e.status='published' AND p.status='approved' AND s.reference_date IS DISTINCT FROM e.start_date;
 FOR item IN SELECT s.* FROM public.saved_fairs s WHERE s.reminder_enabled
 AND s.remind_on<=(now() AT TIME ZONE 'Europe/Rome')::date AND s.reference_date>(now() AT TIME ZONE 'Europe/Rome')::date
 AND (s.remind_on<(now() AT TIME ZONE 'Europe/Rome')::date OR extract(hour FROM now() AT TIME ZONE 'Europe/Rome')>=9)
 AND NOT EXISTS(SELECT 1 FROM fair_private.deliveries d WHERE d.user_id=s.user_id AND d.fair_kind=s.fair_kind
  AND d.fair_id=s.fair_id AND d.edition_key=s.edition_key AND (d.status IN('sent','failed','needs_review')
   OR (d.status='cancelled' AND d.favorite_id=s.id AND d.favorite_revision=s.revision) OR d.next_attempt_at>now() OR d.lease_until>now()))
 ORDER BY s.remind_on,s.id LIMIT greatest(1,least(coalesce(p_limit,20),50)) FOR UPDATE OF s SKIP LOCKED
 LOOP
  INSERT INTO fair_private.deliveries(user_id,fair_kind,fair_id,edition_key,favorite_id,favorite_revision)
  VALUES(item.user_id,item.fair_kind,item.fair_id,item.edition_key,item.id,item.revision) ON CONFLICT DO NOTHING;
  SELECT * INTO delivery FROM fair_private.deliveries WHERE user_id=item.user_id AND fair_kind=item.fair_kind AND fair_id=item.fair_id AND edition_key=item.edition_key FOR UPDATE;
  IF delivery.status IN('sent','failed','needs_review') OR delivery.lease_until>now() THEN CONTINUE; END IF;
  IF delivery.uncertain_since<now()-interval '23 hours' THEN
   UPDATE fair_private.deliveries SET status='needs_review',last_error='Esito del precedente invio da verificare.',lease_until=NULL WHERE id=delivery.id;
   CONTINUE;
  END IF;
  -- An in-flight attempt might have been accepted; never change its payload.
  IF delivery.payload IS NOT NULL AND delivery.favorite_revision<>item.revision THEN
   UPDATE fair_private.deliveries SET status='needs_review',lease_until=NULL,last_error='Preferenze cambiate durante un invio da verificare.' WHERE id=delivery.id;
   CONTINUE;
  END IF;
  UPDATE fair_private.deliveries SET status='sending',favorite_id=item.id,favorite_revision=item.revision,
   attempts=attempts+1,lease_until=now()+interval '5 minutes',uncertain_since=coalesce(uncertain_since,CASE WHEN delivery.status='sending' THEN delivery.updated_at END),updated_at=now()
   WHERE id=delivery.id;
  result:=result||jsonb_build_array(to_jsonb(item)-'created_at'-'updated_at'||jsonb_build_object('delivery_id',delivery.id,'payload',delivery.payload));
 END LOOP;
 RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.prepare_fair_reminder(p_delivery_id uuid,p_payload jsonb) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE d fair_private.deliveries; f public.saved_fairs;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Accesso riservato.' USING ERRCODE='42501'; END IF;
 SELECT * INTO d FROM fair_private.deliveries WHERE id=p_delivery_id;
 SELECT * INTO f FROM public.saved_fairs WHERE id=d.favorite_id AND reminder_enabled AND revision=d.favorite_revision FOR UPDATE;
 SELECT * INTO d FROM fair_private.deliveries WHERE id=p_delivery_id FOR UPDATE;
 IF d.id IS NULL OR d.status<>'sending' OR d.lease_until<now() OR f.id IS NULL THEN RETURN NULL; END IF;
 IF d.payload IS NULL THEN
  IF p_payload IS NULL OR jsonb_typeof(p_payload)<>'object' THEN RETURN NULL; END IF;
  UPDATE fair_private.deliveries SET payload=p_payload,updated_at=now() WHERE id=d.id;
  RETURN p_payload;
 END IF;
 RETURN d.payload;
END $$;

CREATE OR REPLACE FUNCTION public.finish_fair_reminder(p_delivery_id uuid,p_outcome text,p_provider_id text DEFAULT NULL,p_error text DEFAULT NULL) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Accesso riservato.' USING ERRCODE='42501'; END IF;
 IF p_outcome NOT IN('sent','retry','unknown','cancelled','failed') THEN RAISE EXCEPTION 'Esito non valido.'; END IF;
 UPDATE fair_private.deliveries SET status=CASE WHEN p_outcome='unknown' THEN 'retry' ELSE p_outcome END,
  sent_at=CASE WHEN p_outcome='sent' THEN now() ELSE sent_at END,
  payload=CASE WHEN p_outcome IN('sent','failed') THEN NULL ELSE payload END,
  provider_id=coalesce(left(p_provider_id,200),provider_id),last_error=left(p_error,400),lease_until=NULL,
  uncertain_since=CASE WHEN p_outcome='unknown' THEN coalesce(uncertain_since,now()) ELSE uncertain_since END,
  next_attempt_at=now()+interval '1 hour',updated_at=now()
 WHERE id=p_delivery_id AND (status='sending' OR (p_outcome='sent' AND status IN('cancelled','retry')));
 RETURN FOUND;
END $$;

CREATE OR REPLACE FUNCTION public.stop_fair_reminders(p_token uuid DEFAULT NULL,p_user_id uuid DEFAULT NULL) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN RAISE EXCEPTION 'Accesso riservato.' USING ERRCODE='42501'; END IF;
 IF p_token IS NULL AND p_user_id IS NULL THEN RETURN false; END IF;
 UPDATE public.saved_fairs SET reminder_enabled=false,remind_on=NULL,revision=revision+1,updated_at=now()
 WHERE (p_token IS NOT NULL AND unsub_token=p_token) OR (p_user_id IS NOT NULL AND user_id=p_user_id);
 RETURN FOUND;
END $$;

REVOKE ALL ON FUNCTION public.my_saved_fairs(),public.save_fair(jsonb,integer),public.remove_saved_fair(uuid,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.my_saved_fairs(),public.save_fair(jsonb,integer),public.remove_saved_fair(uuid,integer) TO authenticated;
REVOKE ALL ON FUNCTION public.claim_fair_reminders(integer,boolean),public.prepare_fair_reminder(uuid,jsonb),public.finish_fair_reminder(uuid,text,text,text),public.stop_fair_reminders(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.claim_fair_reminders(integer,boolean),public.prepare_fair_reminder(uuid,jsonb),public.finish_fair_reminder(uuid,text,text,text),public.stop_fair_reminders(uuid,uuid) TO service_role;
NOTIFY pgrst,'reload schema';
COMMIT;
