-- No recipient is opted in by this migration. Permissions require an explicit,
-- individually matched attestation from the operator; original date may be unknown.
CREATE TABLE IF NOT EXISTS public.vetrina_email_permissions (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 source text NOT NULL CHECK (source IN ('whatsapp_user_attestation','explicit_site_optin','unsubscribe_request')),
 evidence_note text NOT NULL CHECK (length(evidence_note) BETWEEN 10 AND 500),
 consented_at timestamptz,
 recorded_at timestamptz NOT NULL DEFAULT now(),
 revoked_at timestamptz
);
CREATE TABLE IF NOT EXISTS public.vetrina_email_log (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
 campaign text NOT NULL CHECK (campaign ~ '^[a-z0-9-]{6,80}$'),
 variant smallint NOT NULL CHECK (variant BETWEEN 0 AND 2),
 status text NOT NULL DEFAULT 'reserved' CHECK (status IN ('reserved','sent','failed','unknown','cancelled')),
 created_at timestamptz NOT NULL DEFAULT now(),
 sent_at timestamptz,
 provider_id text,
 provider_event text,
 error_code text,
 listing_ids uuid[],
 subject text,
 UNIQUE(user_id,campaign)
);
CREATE INDEX IF NOT EXISTS vetrina_email_log_user_time ON public.vetrina_email_log(user_id,created_at DESC);
ALTER TABLE public.vetrina_email_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vetrina_email_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.vetrina_email_permissions,public.vetrina_email_log FROM PUBLIC,anon,authenticated;
GRANT ALL ON public.vetrina_email_permissions,public.vetrina_email_log TO service_role;

CREATE OR REPLACE FUNCTION public.vetrina_email_candidate(p_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE person public.profiles; permission public.vetrina_email_permissions;
 result jsonb; day_end date := (now() AT TIME ZONE 'UTC')::date;
BEGIN
 SELECT * INTO person FROM public.profiles WHERE id=p_user_id;
 IF NOT FOUND OR person.is_admin OR person.is_demo OR person.email_digest IS DISTINCT FROM true OR person.email_stats IS DISTINCT FROM true THEN RETURN NULL; END IF;
 SELECT * INTO permission FROM public.vetrina_email_permissions WHERE user_id=p_user_id AND revoked_at IS NULL;
 IF NOT FOUND THEN RETURN NULL; END IF;
 IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id=p_user_id AND email_confirmed_at IS NOT NULL AND (banned_until IS NULL OR banned_until<now())) THEN RETURN NULL; END IF;
 IF EXISTS (SELECT 1 FROM public.vetrina_email_log WHERE user_id=p_user_id AND created_at>now()-interval '30 days' AND status<>'cancelled') THEN RETURN NULL; END IF;
 IF EXISTS (SELECT 1 FROM (
  SELECT sent_at FROM public.weekly_stats_snapshot WHERE user_id=p_user_id
  UNION ALL SELECT sent_at FROM public.weekly_digest_log WHERE user_id=p_user_id
  UNION ALL SELECT sent_at FROM public.email_reminder_log WHERE user_id=p_user_id AND success
  UNION ALL SELECT sent_at FROM public.notify_alert_log WHERE user_id=p_user_id
 ) e WHERE sent_at>now()-interval '72 hours') THEN RETURN NULL; END IF;
 SELECT jsonb_agg(t ORDER BY t.views_14d DESC,t.id) INTO result FROM (
  SELECT a.id,a.titolo AS title,a.comune,a.created_at,a.expires_at,
   coalesce((SELECT sum(d.views) FROM public.listing_stats_daily d WHERE d.annuncio_id=a.id AND d.day>=day_end-14 AND d.day<day_end),0) AS views_14d
  FROM public.annunci a
  WHERE a.user_id=p_user_id AND a.status='active' AND a.stato='Vendita'
   AND NOT coalesce(a.is_demo,false) AND a.created_at<=now()-interval '14 days'
   AND a.expires_at>now()+interval '31 days'
   AND NOT (coalesce(a.featured,false) AND a.featured_until>now())
  ORDER BY views_14d DESC,a.id LIMIT 10
 ) t;
 IF result IS NULL THEN RETURN NULL; END IF;
 RETURN jsonb_build_object('user_id',p_user_id,'nome',person.nome,'unsub_token',person.unsub_token,
  'active_count',(SELECT count(*) FROM public.annunci WHERE user_id=p_user_id AND status='active' AND expires_at>now() AND NOT coalesce(is_demo,false)),
  'listings',result,'period_start',day_end-14,'period_end',day_end-1);
END $$;

CREATE OR REPLACE FUNCTION public.claim_vetrina_email(p_user_id uuid,p_campaign text,p_variant integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE candidate jsonb; delivery_id uuid;
BEGIN
 IF p_campaign IS NULL OR p_campaign !~ '^[a-z0-9-]{6,80}$' OR p_variant IS NULL OR p_variant NOT BETWEEN 0 AND 2 THEN RAISE EXCEPTION 'Invalid campaign'; END IF;
 -- One global transaction lock makes daily/campaign caps safe under concurrency.
 PERFORM pg_advisory_xact_lock(793267401);
 IF (SELECT count(*) FROM public.vetrina_email_log WHERE created_at>now()-interval '24 hours' AND status<>'cancelled')>=20
 OR (SELECT count(*) FROM public.vetrina_email_log WHERE campaign=p_campaign AND status<>'cancelled')>=20 THEN RETURN NULL; END IF;
 IF EXISTS(SELECT 1 FROM public.vetrina_email_log WHERE user_id=p_user_id AND campaign=p_campaign) THEN RETURN NULL; END IF;
 candidate:=public.vetrina_email_candidate(p_user_id);
 IF candidate IS NULL THEN RETURN NULL; END IF;
 INSERT INTO public.vetrina_email_log(user_id,campaign,variant) VALUES(p_user_id,p_campaign,p_variant) RETURNING id INTO delivery_id;
 RETURN candidate||jsonb_build_object('delivery_id',delivery_id,'variant',p_variant);
END $$;

CREATE OR REPLACE FUNCTION public.stop_vetrina_offers(p_token text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE target uuid;
BEGIN
 IF p_token IS NULL OR length(p_token)<16 OR length(p_token)>100 THEN RETURN false; END IF;
 SELECT id INTO target FROM public.profiles WHERE unsub_token=p_token;
 IF target IS NULL THEN RETURN false; END IF;
 UPDATE public.vetrina_email_permissions SET revoked_at=coalesce(revoked_at,now()) WHERE user_id=target;
 -- Also remember opt-out when no permission exists yet. Do not invent consent.
 IF NOT FOUND THEN
  INSERT INTO public.vetrina_email_permissions(user_id,source,evidence_note,revoked_at)
  VALUES(target,'unsubscribe_request','Opt-out requested; no positive consent recorded.',now());
 END IF;
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.vetrina_email_candidate(uuid),public.claim_vetrina_email(uuid,text,integer),public.stop_vetrina_offers(text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.vetrina_email_candidate(uuid),public.claim_vetrina_email(uuid,text,integer),public.stop_vetrina_offers(text) TO service_role;

DO $$ DECLARE cname text; BEGIN
 SELECT conname INTO cname FROM pg_constraint WHERE conrelid='public.email_unsubscribe_feedback'::regclass AND contype='c' AND pg_get_constraintdef(oid) LIKE '%email_type%';
 IF cname IS NOT NULL THEN EXECUTE format('ALTER TABLE public.email_unsubscribe_feedback DROP CONSTRAINT %I',cname); END IF;
 ALTER TABLE public.email_unsubscribe_feedback ADD CONSTRAINT email_unsubscribe_feedback_type_check CHECK(email_type IN ('digest','stats','all','bando_alert','promo'));
END $$;
