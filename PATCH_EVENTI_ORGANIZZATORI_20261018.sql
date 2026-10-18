-- Organizzatori ed eventi. Prenotazioni predisposte, disabilitate per tutti.
-- Nessuna modifica ai trigger annunci o ai pagamenti Vetrina.
BEGIN;
CREATE SCHEMA IF NOT EXISTS event_private;
REVOKE ALL ON SCHEMA event_private FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.organizer_profiles (
 user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
 organization_name text NOT NULL CHECK(char_length(organization_name) BETWEEN 3 AND 160),
 organization_type text NOT NULL CHECK(organization_type IN ('impresa','associazione','ente','altro')),
 description text NOT NULL DEFAULT '' CHECK(char_length(description)<=4000),
 website text NOT NULL DEFAULT '' CHECK(char_length(website)<=1000 AND (website='' OR website ~ '^https://[^[:space:]]+$')),
 contact_name text NOT NULL CHECK(char_length(contact_name) BETWEEN 3 AND 160),
 private_phone text NOT NULL CHECK(private_phone ~ '^\+?[0-9 ()-]{7,25}$' AND length(regexp_replace(private_phone,'[^0-9]','','g')) BETWEEN 7 AND 15),
 public_email text NOT NULL DEFAULT '' CHECK(char_length(public_email)<=254 AND (public_email='' OR public_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
 public_phone text NOT NULL DEFAULT '' CHECK(public_phone='' OR (public_phone ~ '^\+?[0-9 ()-]{7,25}$' AND length(regexp_replace(public_phone,'[^0-9]','','g')) BETWEEN 7 AND 15)),
 CHECK(website<>'' OR public_email<>'' OR public_phone<>''),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected','suspended')),
 review_note text NOT NULL DEFAULT '', reviewed_by uuid, reviewed_at timestamptz,
 revision integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.organizer_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organizer_id uuid NOT NULL REFERENCES public.organizer_profiles(user_id) ON DELETE RESTRICT,
 title text NOT NULL CHECK(char_length(title) BETWEEN 5 AND 180),
 description text NOT NULL CHECK(char_length(description) BETWEEN 40 AND 12000),
 category text NOT NULL CHECK(category IN ('tradizionale','artigianato','sagra','espositiva','mercatino')),
 region text NOT NULL, province text NOT NULL, city text NOT NULL, venue text NOT NULL CHECK(char_length(venue) BETWEEN 3 AND 300),
 latitude double precision NOT NULL CHECK(latitude BETWEEN 35 AND 48), longitude double precision NOT NULL CHECK(longitude BETWEEN 6 AND 19),
 start_date date NOT NULL CHECK(start_date BETWEEN DATE '2000-01-01' AND DATE '2100-12-31'),
 end_date date NOT NULL CHECK(end_date>=start_date AND end_date-start_date<=366),
 hours text NOT NULL DEFAULT '' CHECK(char_length(hours)<=300),
 sectors text[] NOT NULL CHECK(cardinality(sectors) BETWEEN 1 AND 4 AND sectors <@ ARRAY['alimentare','non-alimentare','antiquariato','artigianato']::text[]),
 goods text NOT NULL DEFAULT '' CHECK(char_length(goods)<=2000),
 participation_rules text NOT NULL DEFAULT '' CHECK(char_length(participation_rules)<=6000),
 application_deadline date CHECK(application_deadline<=start_date),
 status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','pending','published','rejected','cancelled')),
 review_note text NOT NULL DEFAULT '', reviewed_by uuid, reviewed_at timestamptz,
 submitted_at timestamptz, published_at timestamptz,
 bookings_enabled boolean NOT NULL DEFAULT false,
 revision integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS organizer_events_owner ON public.organizer_events(organizer_id,updated_at DESC);
CREATE INDEX IF NOT EXISTS organizer_events_public ON public.organizer_events(start_date) WHERE status='published';
CREATE TABLE IF NOT EXISTS public.event_places (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), event_id uuid NOT NULL REFERENCES public.organizer_events(id) ON DELETE RESTRICT,
 label text NOT NULL CHECK(char_length(label) BETWEEN 2 AND 120),
 description text NOT NULL DEFAULT '' CHECK(char_length(description)<=2000),
 quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 10000),
 price_cents integer NOT NULL CHECK(price_cents BETWEEN 0 AND 10000000),
 width_m numeric(6,2) CHECK(width_m>0 AND width_m<=1000), depth_m numeric(6,2) CHECK(depth_m>0 AND depth_m<=1000),
 active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_places_event ON public.event_places(event_id);
CREATE TABLE IF NOT EXISTS event_private.settings (
 id boolean PRIMARY KEY DEFAULT true CHECK(id), bookings_enabled boolean NOT NULL DEFAULT false,
 commission_bps integer NOT NULL DEFAULT 800 CHECK(commission_bps=800)
);
INSERT INTO event_private.settings(id) VALUES(true) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS event_private.connected_accounts (
 organizer_id uuid PRIMARY KEY REFERENCES public.organizer_profiles(user_id) ON DELETE RESTRICT,
 stripe_account_id text UNIQUE NOT NULL CHECK(stripe_account_id LIKE 'acct_%'),
 transfers_ready boolean NOT NULL DEFAULT false, verified_at timestamptz
);
CREATE TABLE IF NOT EXISTS public.event_bookings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), buyer_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
 organizer_id uuid NOT NULL REFERENCES public.organizer_profiles(user_id) ON DELETE RESTRICT,
 event_id uuid NOT NULL REFERENCES public.organizer_events(id) ON DELETE RESTRICT,
 place_id uuid NOT NULL REFERENCES public.event_places(id) ON DELETE RESTRICT,
 request_key uuid NOT NULL, quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 100),
 event_title text NOT NULL, organization_name text NOT NULL, place_label text NOT NULL,
 start_date date NOT NULL, end_date date NOT NULL,
 unit_price_cents integer NOT NULL CHECK(unit_price_cents>0),
 total_cents integer NOT NULL CHECK(total_cents=unit_price_cents*quantity AND total_cents<=1000000000),
 currency text NOT NULL DEFAULT 'eur' CHECK(currency='eur'),
 commission_bps integer NOT NULL DEFAULT 800 CHECK(commission_bps=800),
 commission_cents integer GENERATED ALWAYS AS (((total_cents::bigint*800+5000)/10000)::integer) STORED,
 organizer_cents integer GENERATED ALWAYS AS (total_cents-((total_cents::bigint*800+5000)/10000)::integer) STORED,
 status text NOT NULL DEFAULT 'pending_payment' CHECK(status IN ('pending_payment','paid','expired','cancelled','refunded','partially_refunded','disputed')),
 expires_at timestamptz NOT NULL DEFAULT now()+interval '15 minutes',
 stripe_session_id text UNIQUE, stripe_payment_intent_id text UNIQUE,
 paid_at timestamptz, refunded_cents integer NOT NULL DEFAULT 0 CHECK(refunded_cents BETWEEN 0 AND total_cents),
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(buyer_id,request_key)
);
CREATE INDEX IF NOT EXISTS event_bookings_inventory ON public.event_bookings(place_id,status,expires_at);
CREATE TABLE IF NOT EXISTS event_private.payment_events (
 provider_event_id text PRIMARY KEY, booking_id uuid NOT NULL REFERENCES public.event_bookings(id) ON DELETE RESTRICT,
 event_type text NOT NULL, received_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS event_private.transfers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), booking_id uuid NOT NULL UNIQUE REFERENCES public.event_bookings(id) ON DELETE RESTRICT,
 amount_cents integer NOT NULL CHECK(amount_cents>0), stripe_transfer_id text UNIQUE,
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sent','failed','reversed','blocked')),
 reversed_cents integer NOT NULL DEFAULT 0 CHECK(reversed_cents BETWEEN 0 AND amount_cents),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS event_private.audit (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, actor_id uuid, action text NOT NULL,
 entity_id uuid NOT NULL, detail jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE OR REPLACE FUNCTION event_private.guard_booking_history() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF TG_OP='DELETE' THEN RAISE EXCEPTION 'Lo storico delle prenotazioni non può essere cancellato'; END IF;
 IF (to_jsonb(NEW)-ARRAY['status','expires_at','stripe_session_id','stripe_payment_intent_id','paid_at','refunded_cents','buyer_id','commission_cents','organizer_cents'])
 IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['status','expires_at','stripe_session_id','stripe_payment_intent_id','paid_at','refunded_cents','buyer_id','commission_cents','organizer_cents'])
 OR (NEW.buyer_id IS DISTINCT FROM OLD.buyer_id AND NEW.buyer_id IS NOT NULL) THEN
  RAISE EXCEPTION 'Dati economici e condizioni della prenotazione immutabili';
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_booking_history ON public.event_bookings;
CREATE TRIGGER guard_booking_history BEFORE UPDATE OR DELETE ON public.event_bookings FOR EACH ROW EXECUTE FUNCTION event_private.guard_booking_history();

ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.organizer_profiles,public.organizer_events,public.event_places,public.event_bookings FROM PUBLIC,anon,authenticated,service_role;
-- Solo RPC: nessun inserimento diretto, nessuna auto-approvazione o dato privato pubblico.
CREATE OR REPLACE FUNCTION event_private.is_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT auth.uid() IS NOT NULL AND EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin=true)
$$;
CREATE OR REPLACE FUNCTION event_private.require_user() RETURNS uuid LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
BEGIN IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Accedi per continuare' USING ERRCODE='42501'; END IF; RETURN auth.uid(); END $$;

CREATE OR REPLACE FUNCTION public.save_organizer_profile(p_data jsonb, p_revision integer DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=event_private.require_user(); current_row public.organizer_profiles%ROWTYPE; saved public.organizer_profiles%ROWTYPE;
BEGIN
 -- Serializza anche il primo inserimento, quando non esiste ancora un profilo organizzatore.
 PERFORM 1 FROM public.profiles WHERE id=uid FOR UPDATE;
 SELECT * INTO current_row FROM public.organizer_profiles WHERE user_id=uid FOR UPDATE;
 IF FOUND AND (p_revision IS NULL OR current_row.revision<>p_revision) THEN RAISE EXCEPTION 'Il profilo è cambiato. Ricarica prima di salvare.'; END IF;
 IF current_row.status='suspended' THEN RAISE EXCEPTION 'Profilo sospeso: contatta il supporto.'; END IF;
 INSERT INTO public.organizer_profiles(user_id,organization_name,organization_type,description,website,contact_name,private_phone,public_email,public_phone)
 VALUES(uid,btrim(p_data->>'organization_name'),p_data->>'organization_type',btrim(coalesce(p_data->>'description','')),btrim(coalesce(p_data->>'website','')),
 btrim(p_data->>'contact_name'),btrim(p_data->>'private_phone'),btrim(coalesce(p_data->>'public_email','')),btrim(coalesce(p_data->>'public_phone','')))
 ON CONFLICT(user_id) DO UPDATE SET organization_name=EXCLUDED.organization_name,organization_type=EXCLUDED.organization_type,
 description=EXCLUDED.description,website=EXCLUDED.website,contact_name=EXCLUDED.contact_name,private_phone=EXCLUDED.private_phone,
 public_email=EXCLUDED.public_email,public_phone=EXCLUDED.public_phone,status='pending',review_note='',reviewed_by=NULL,reviewed_at=NULL,
 revision=public.organizer_profiles.revision+1,updated_at=now() RETURNING * INTO saved;
 INSERT INTO event_private.audit(actor_id,action,entity_id) VALUES(uid,'organizer_submitted',uid);
 RETURN to_jsonb(saved);
END $$;

CREATE OR REPLACE FUNCTION public.save_organizer_event(p_id uuid,p_data jsonb,p_revision integer DEFAULT NULL) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=event_private.require_user(); current_row public.organizer_events%ROWTYPE; saved public.organizer_events%ROWTYPE;
 loc record;
BEGIN
 PERFORM 1 FROM public.organizer_profiles WHERE user_id=uid AND status='approved' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Il profilo organizzatore deve essere approvato prima di creare o modificare eventi.' USING ERRCODE='42501'; END IF;
 IF p_id IS NOT NULL THEN
  SELECT * INTO current_row FROM public.organizer_events WHERE id=p_id AND organizer_id=uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Evento non disponibile' USING ERRCODE='42501'; END IF;
  IF p_revision IS NULL OR current_row.revision<>p_revision THEN RAISE EXCEPTION 'Evento cambiato. Ricarica prima di salvare.'; END IF;
  IF EXISTS(SELECT 1 FROM public.event_bookings WHERE event_id=p_id AND (status IN ('paid','partially_refunded','disputed') OR (status='pending_payment' AND expires_at>now()))) THEN
   RAISE EXCEPTION 'Evento con prenotazioni: contatta il supporto per modificare le condizioni.';
  END IF;
 END IF;
 SELECT name,regione,provincia,lat,lng INTO loc FROM data_quality.locations
 WHERE name=p_data->>'city' AND regione=p_data->>'region' AND provincia=p_data->>'province' LIMIT 1;
 IF NOT FOUND THEN RAISE EXCEPTION 'Seleziona un comune valido con la sua provincia e regione.'; END IF;
 INSERT INTO public.organizer_events(id,organizer_id,title,description,category,region,province,city,venue,latitude,longitude,start_date,end_date,hours,sectors,goods,participation_rules,application_deadline)
 VALUES(coalesce(p_id,gen_random_uuid()),uid,btrim(p_data->>'title'),btrim(p_data->>'description'),p_data->>'category',loc.regione,loc.provincia,loc.name,
 btrim(p_data->>'venue'),loc.lat,loc.lng,(p_data->>'start_date')::date,(p_data->>'end_date')::date,btrim(coalesce(p_data->>'hours','')),
 ARRAY(SELECT jsonb_array_elements_text(p_data->'sectors')),btrim(coalesce(p_data->>'goods','')),btrim(coalesce(p_data->>'participation_rules','')),nullif(p_data->>'application_deadline','')::date)
 ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,description=EXCLUDED.description,category=EXCLUDED.category,
 region=EXCLUDED.region,province=EXCLUDED.province,city=EXCLUDED.city,venue=EXCLUDED.venue,latitude=EXCLUDED.latitude,longitude=EXCLUDED.longitude,
 start_date=EXCLUDED.start_date,end_date=EXCLUDED.end_date,hours=EXCLUDED.hours,sectors=EXCLUDED.sectors,goods=EXCLUDED.goods,
 participation_rules=EXCLUDED.participation_rules,application_deadline=EXCLUDED.application_deadline,status='draft',review_note='',reviewed_by=NULL,reviewed_at=NULL,
 bookings_enabled=false,revision=public.organizer_events.revision+1,updated_at=now() RETURNING * INTO saved;
 INSERT INTO event_private.audit(actor_id,action,entity_id) VALUES(uid,'event_saved',saved.id);
 RETURN to_jsonb(saved);
END $$;

CREATE OR REPLACE FUNCTION public.save_event_place(p_event_id uuid,p_id uuid,p_data jsonb,p_revision integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=event_private.require_user(); e public.organizer_events%ROWTYPE; saved public.event_places%ROWTYPE;
BEGIN
 PERFORM 1 FROM public.organizer_profiles WHERE user_id=uid AND status='approved' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Profilo organizzatore non approvato' USING ERRCODE='42501'; END IF;
 SELECT * INTO e FROM public.organizer_events WHERE id=p_event_id AND organizer_id=uid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Evento non disponibile' USING ERRCODE='42501'; END IF;
 IF p_revision IS NULL OR e.revision<>p_revision THEN RAISE EXCEPTION 'Evento cambiato. Ricarica prima di salvare.'; END IF;
 IF EXISTS(SELECT 1 FROM public.event_bookings WHERE event_id=p_event_id AND (status IN ('paid','partially_refunded','disputed') OR (status='pending_payment' AND expires_at>now()))) THEN
  RAISE EXCEPTION 'Sono presenti prenotazioni: contatta il supporto per cambiare i posteggi.';
 END IF;
 IF p_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.event_places WHERE id=p_id AND event_id=p_event_id) THEN
  RAISE EXCEPTION 'Posteggio non disponibile' USING ERRCODE='42501';
 END IF;
 INSERT INTO public.event_places(id,event_id,label,description,quantity,price_cents,width_m,depth_m,active)
 VALUES(coalesce(p_id,gen_random_uuid()),p_event_id,btrim(p_data->>'label'),btrim(coalesce(p_data->>'description','')),
 (p_data->>'quantity')::integer,(p_data->>'price_cents')::integer,nullif(p_data->>'width_m','')::numeric,nullif(p_data->>'depth_m','')::numeric,coalesce((p_data->>'active')::boolean,true))
 ON CONFLICT(id) DO UPDATE SET label=EXCLUDED.label,description=EXCLUDED.description,quantity=EXCLUDED.quantity,price_cents=EXCLUDED.price_cents,
 width_m=EXCLUDED.width_m,depth_m=EXCLUDED.depth_m,active=EXCLUDED.active RETURNING * INTO saved;
 UPDATE public.organizer_events SET status='draft',bookings_enabled=false,revision=revision+1,review_note='',reviewed_by=NULL,reviewed_at=NULL,updated_at=now() WHERE id=p_event_id;
 INSERT INTO event_private.audit(actor_id,action,entity_id) VALUES(uid,'place_saved',saved.id);
 RETURN to_jsonb(saved);
END $$;

CREATE OR REPLACE FUNCTION public.submit_organizer_event(p_id uuid,p_revision integer) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=event_private.require_user(); e public.organizer_events%ROWTYPE;
BEGIN
 PERFORM 1 FROM public.organizer_profiles WHERE user_id=uid AND status='approved' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Attendi l’approvazione del profilo organizzatore.' USING ERRCODE='42501'; END IF;
 SELECT * INTO e FROM public.organizer_events WHERE id=p_id AND organizer_id=uid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Evento non disponibile' USING ERRCODE='42501'; END IF;
 IF p_revision IS NULL OR e.revision<>p_revision THEN RAISE EXCEPTION 'Evento cambiato. Ricarica prima di inviarlo.'; END IF;
 IF e.status NOT IN ('draft','rejected') THEN RAISE EXCEPTION 'Questo evento non è una bozza da inviare.'; END IF;
 IF e.start_date<(now() AT TIME ZONE 'Europe/Rome')::date THEN RAISE EXCEPTION 'La data di inizio è già passata.'; END IF;
 IF char_length(btrim(e.participation_rules))<20 THEN RAISE EXCEPTION 'Descrivi le condizioni di partecipazione (almeno 20 caratteri).'; END IF;
 IF NOT EXISTS(SELECT 1 FROM public.event_places WHERE event_id=p_id AND active) THEN RAISE EXCEPTION 'Aggiungi almeno una tipologia di posteggio prima di inviare.'; END IF;
 UPDATE public.organizer_events SET status='pending',submitted_at=now(),review_note='',revision=revision+1,updated_at=now() WHERE id=p_id;
 INSERT INTO event_private.audit(actor_id,action,entity_id) VALUES(uid,'event_submitted',p_id);
END $$;

CREATE OR REPLACE FUNCTION public.cancel_organizer_event(p_id uuid,p_revision integer) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=event_private.require_user(); e public.organizer_events%ROWTYPE;
BEGIN
 SELECT * INTO e FROM public.organizer_events WHERE id=p_id AND organizer_id=uid FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Evento non disponibile' USING ERRCODE='42501'; END IF;
 IF p_revision IS NULL OR e.revision<>p_revision THEN RAISE EXCEPTION 'Evento cambiato. Ricarica prima di ritirarlo.'; END IF;
 IF EXISTS(SELECT 1 FROM public.event_bookings WHERE event_id=p_id AND (status IN ('paid','partially_refunded','disputed') OR (status='pending_payment' AND expires_at>now()))) THEN
  RAISE EXCEPTION 'Evento con prenotazioni: contatta il supporto per annullamento e rimborsi.';
 END IF;
 UPDATE public.organizer_events SET status='cancelled',bookings_enabled=false,revision=revision+1,updated_at=now() WHERE id=p_id;
 INSERT INTO event_private.audit(actor_id,action,entity_id) VALUES(uid,'event_cancelled',p_id);
END $$;

CREATE OR REPLACE FUNCTION public.organizer_workspace() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=event_private.require_user(); BEGIN
 RETURN jsonb_build_object('profile',(SELECT to_jsonb(p) FROM public.organizer_profiles p WHERE user_id=uid),
 'events',coalesce((SELECT jsonb_agg(to_jsonb(e)||jsonb_build_object('places',coalesce((SELECT jsonb_agg(to_jsonb(s) ORDER BY s.created_at,s.id) FROM public.event_places s WHERE s.event_id=e.id),'[]'::jsonb)) ORDER BY e.updated_at DESC) FROM public.organizer_events e WHERE e.organizer_id=uid),'[]'::jsonb),
 'bookings_enabled',false,'commission_bps',800);
END $$;

CREATE OR REPLACE FUNCTION public.admin_event_workspace() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT event_private.is_admin() THEN RAISE EXCEPTION 'Solo amministratore' USING ERRCODE='42501'; END IF;
 RETURN jsonb_build_object('organizers',coalesce((SELECT jsonb_agg(to_jsonb(p) ORDER BY (p.status='pending') DESC,p.updated_at DESC) FROM public.organizer_profiles p),'[]'::jsonb),
 'events',coalesce((SELECT jsonb_agg(to_jsonb(e)||jsonb_build_object('organization_name',p.organization_name,'organizer_status',p.status,
 'places',coalesce((SELECT jsonb_agg(to_jsonb(s) ORDER BY s.created_at,s.id) FROM public.event_places s WHERE s.event_id=e.id),'[]'::jsonb)) ORDER BY (e.status='pending') DESC,e.updated_at DESC)
 FROM public.organizer_events e JOIN public.organizer_profiles p ON p.user_id=e.organizer_id),'[]'::jsonb),
 'bookings_enabled',false,'commission_bps',800);
END $$;

CREATE OR REPLACE FUNCTION public.review_organizer(p_id uuid,p_action text,p_note text,p_revision integer) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE p public.organizer_profiles%ROWTYPE; BEGIN
 IF NOT event_private.is_admin() THEN RAISE EXCEPTION 'Solo amministratore' USING ERRCODE='42501'; END IF;
 SELECT * INTO p FROM public.organizer_profiles WHERE user_id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Profilo non disponibile'; END IF;
 IF p_revision IS NULL OR p.revision<>p_revision THEN RAISE EXCEPTION 'Profilo cambiato. Aggiorna la revisione.'; END IF;
 IF p_action NOT IN ('approved','rejected','suspended') OR p_action IS NULL THEN RAISE EXCEPTION 'Azione non valida'; END IF;
 IF p_action<>'approved' AND char_length(btrim(coalesce(p_note,'')))<5 THEN RAISE EXCEPTION 'Indica il motivo (almeno 5 caratteri).'; END IF;
 IF char_length(coalesce(p_note,''))>2000 THEN RAISE EXCEPTION 'Nota troppo lunga'; END IF;
 UPDATE public.organizer_profiles SET status=p_action,review_note=btrim(coalesce(p_note,'')),reviewed_by=auth.uid(),reviewed_at=now(),revision=revision+1,updated_at=now() WHERE user_id=p_id;
 INSERT INTO event_private.audit(actor_id,action,entity_id,detail) VALUES(auth.uid(),'organizer_reviewed',p_id,jsonb_build_object('status',p_action,'note',p_note,'revision',p.revision));
END $$;

CREATE OR REPLACE FUNCTION public.review_organizer_event(p_id uuid,p_action text,p_note text,p_revision integer) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE e public.organizer_events%ROWTYPE; oid uuid; BEGIN
 IF NOT event_private.is_admin() THEN RAISE EXCEPTION 'Solo amministratore' USING ERRCODE='42501'; END IF;
 SELECT organizer_id INTO oid FROM public.organizer_events WHERE id=p_id;
 PERFORM 1 FROM public.organizer_profiles WHERE user_id=oid AND status='approved' FOR SHARE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Il profilo organizzatore non è approvato.'; END IF;
 SELECT * INTO e FROM public.organizer_events WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Evento non disponibile'; END IF;
 IF p_revision IS NULL OR e.revision<>p_revision THEN RAISE EXCEPTION 'Evento cambiato. Aggiorna la revisione.'; END IF;
 IF p_action IS NULL OR p_action NOT IN ('published','rejected') THEN RAISE EXCEPTION 'Azione non valida'; END IF;
 IF p_action='published' AND e.status<>'pending' THEN RAISE EXCEPTION 'Puoi approvare soltanto un evento inviato in revisione.'; END IF;
 IF p_action='published' AND e.end_date<(now() AT TIME ZONE 'Europe/Rome')::date THEN RAISE EXCEPTION 'Evento già concluso'; END IF;
 IF p_action='rejected' AND char_length(btrim(coalesce(p_note,'')))<5 THEN RAISE EXCEPTION 'Indica il motivo (almeno 5 caratteri).'; END IF;
 IF char_length(coalesce(p_note,''))>2000 THEN RAISE EXCEPTION 'Nota troppo lunga'; END IF;
 UPDATE public.organizer_events SET status=p_action,review_note=btrim(coalesce(p_note,'')),reviewed_by=auth.uid(),reviewed_at=now(),
 published_at=CASE WHEN p_action='published' THEN now() ELSE published_at END,bookings_enabled=false,revision=revision+1,updated_at=now() WHERE id=p_id;
 INSERT INTO event_private.audit(actor_id,action,entity_id,detail) VALUES(auth.uid(),'event_reviewed',p_id,jsonb_build_object('status',p_action,'note',p_note,'revision',e.revision));
END $$;

-- Proiezioni pubbliche esplicite: non pubblicano contatto privato, note admin, bozze o riferimenti Stripe.
CREATE OR REPLACE FUNCTION public.published_organizer_events(p_id uuid DEFAULT NULL,p_organizer_id uuid DEFAULT NULL) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT coalesce(jsonb_agg(row_data ORDER BY start_date,id),'[]'::jsonb) FROM (
 SELECT e.start_date,e.id,jsonb_build_object('id',e.id,'organizer_id',e.organizer_id,'title',e.title,'description',e.description,'category',e.category,
 'region',e.region,'province',e.province,'city',e.city,'venue',e.venue,'latitude',e.latitude,'longitude',e.longitude,'start_date',e.start_date,'end_date',e.end_date,
 'hours',e.hours,'sectors',e.sectors,'goods',e.goods,'participation_rules',e.participation_rules,'application_deadline',e.application_deadline,
 'organization_name',p.organization_name,'organization_description',p.description,'website',p.website,'public_email',p.public_email,'public_phone',p.public_phone,
 'updated_at',e.updated_at,'bookings_enabled',false,
 'places',coalesce((SELECT jsonb_agg(jsonb_build_object('id',s.id,'label',s.label,'description',s.description,'quantity',s.quantity,'price_cents',s.price_cents,'width_m',s.width_m,'depth_m',s.depth_m) ORDER BY s.price_cents,s.label) FROM public.event_places s WHERE s.event_id=e.id AND s.active),'[]'::jsonb)) AS row_data
 FROM public.organizer_events e JOIN public.organizer_profiles p ON p.user_id=e.organizer_id
 WHERE e.status='published' AND p.status='approved' AND (p_id IS NULL OR e.id=p_id) AND (p_organizer_id IS NULL OR e.organizer_id=p_organizer_id)
 ) t
$$;
CREATE OR REPLACE FUNCTION public.published_organizer_profile(p_id uuid) RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT jsonb_build_object('user_id',user_id,'organization_name',organization_name,'organization_type',organization_type,'description',description,'website',website,'public_email',public_email,'public_phone',public_phone)
 FROM public.organizer_profiles WHERE user_id=p_id AND status='approved'
$$;

-- Primitiva futura: nessun checkout esposto, nessuna attivazione dal browser o dal pannello admin.
-- Account Connect verificato + impostazioni server + evento abilitato sono tutti necessari.
CREATE OR REPLACE FUNCTION public.reserve_event_place(p_place_id uuid,p_quantity integer,p_request_key uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=event_private.require_user(); s public.event_places%ROWTYPE; e public.organizer_events%ROWTYPE;
 p public.organizer_profiles%ROWTYPE; b public.event_bookings%ROWTYPE; used integer;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM event_private.settings WHERE id AND bookings_enabled) THEN RAISE EXCEPTION 'Prenotazioni online non ancora attive.'; END IF;
 IF p_quantity IS NULL OR p_quantity NOT BETWEEN 1 AND 100 OR p_request_key IS NULL THEN RAISE EXCEPTION 'Quantità o richiesta non valida'; END IF;
 -- Una sola richiesta per acquirente alla volta: rende idempotente anche un primo invio simultaneo.
 PERFORM 1 FROM public.profiles WHERE id=uid FOR UPDATE;
 SELECT * INTO b FROM public.event_bookings WHERE buyer_id=uid AND request_key=p_request_key;
 IF FOUND THEN
  IF b.place_id<>p_place_id OR b.quantity<>p_quantity THEN RAISE EXCEPTION 'Richiesta già usata per un altro acquisto'; END IF;
  RETURN to_jsonb(b);
 END IF;
 SELECT p0.* INTO p FROM public.organizer_profiles p0 WHERE user_id=(SELECT organizer_id FROM public.organizer_events WHERE id=(SELECT event_id FROM public.event_places WHERE id=p_place_id)) FOR SHARE;
 SELECT * INTO e FROM public.organizer_events WHERE id=(SELECT event_id FROM public.event_places WHERE id=p_place_id) FOR UPDATE;
 IF e.id IS NULL OR e.status<>'published' OR NOT e.bookings_enabled OR p.status<>'approved' OR e.organizer_id=uid
 OR e.start_date<(now() AT TIME ZONE 'Europe/Rome')::date OR (e.application_deadline IS NOT NULL AND e.application_deadline<(now() AT TIME ZONE 'Europe/Rome')::date)
 OR NOT EXISTS(SELECT 1 FROM event_private.connected_accounts WHERE organizer_id=e.organizer_id AND transfers_ready) THEN RAISE EXCEPTION 'Prenotazioni non disponibili per questo evento.'; END IF;
 SELECT * INTO s FROM public.event_places WHERE id=p_place_id AND active FOR UPDATE;
 IF NOT FOUND OR s.price_cents<=0 THEN RAISE EXCEPTION 'Posteggio non prenotabile'; END IF;
 SELECT coalesce(sum(quantity),0) INTO used FROM public.event_bookings WHERE place_id=s.id AND (status IN ('paid','partially_refunded','disputed') OR (status='pending_payment' AND expires_at>now()));
 IF used+p_quantity>s.quantity THEN RAISE EXCEPTION 'Posti insufficienti'; END IF;
 INSERT INTO public.event_bookings(buyer_id,organizer_id,event_id,place_id,request_key,quantity,event_title,organization_name,place_label,start_date,end_date,unit_price_cents,total_cents)
 VALUES(uid,e.organizer_id,e.id,s.id,p_request_key,p_quantity,e.title,p.organization_name,s.label,e.start_date,e.end_date,s.price_cents,s.price_cents*p_quantity) RETURNING * INTO b;
 RETURN to_jsonb(b);
END $$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA event_private FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION public.save_organizer_profile(jsonb,integer),public.save_organizer_event(uuid,jsonb,integer),public.save_event_place(uuid,uuid,jsonb,integer),public.submit_organizer_event(uuid,integer),public.cancel_organizer_event(uuid,integer),public.organizer_workspace(),public.admin_event_workspace(),public.review_organizer(uuid,text,text,integer),public.review_organizer_event(uuid,text,text,integer),public.reserve_event_place(uuid,integer,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.save_organizer_profile(jsonb,integer),public.save_organizer_event(uuid,jsonb,integer),public.save_event_place(uuid,uuid,jsonb,integer),public.submit_organizer_event(uuid,integer),public.cancel_organizer_event(uuid,integer),public.organizer_workspace(),public.admin_event_workspace(),public.review_organizer(uuid,text,text,integer),public.review_organizer_event(uuid,text,text,integer),public.reserve_event_place(uuid,integer,uuid) TO authenticated;
REVOKE ALL ON FUNCTION public.published_organizer_events(uuid,uuid),public.published_organizer_profile(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.published_organizer_events(uuid,uuid),public.published_organizer_profile(uuid) TO anon,authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
