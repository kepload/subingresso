-- Disponibilità degli eventi gestiti dagli organizzatori. Il catalogo documentale resta distinto.
BEGIN;
ALTER TABLE public.event_places ADD COLUMN IF NOT EXISTS external_reserved integer NOT NULL DEFAULT 0 CHECK(external_reserved>=0);
ALTER TABLE public.event_places ADD COLUMN IF NOT EXISTS capacity_revision integer NOT NULL DEFAULT 1;

CREATE OR REPLACE FUNCTION event_private.place_inventory(p_id uuid) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT jsonb_build_object('capacity',s.quantity,'external_reserved',s.external_reserved,
 'confirmed',coalesce(b.confirmed,0),'held',coalesce(b.held,0),
 'available',greatest(0,s.quantity-s.external_reserved-coalesce(b.confirmed,0)-coalesce(b.held,0)),
 'capacity_revision',s.capacity_revision)
 FROM public.event_places s LEFT JOIN LATERAL (
  SELECT coalesce(sum(quantity) FILTER(WHERE status IN ('paid','partially_refunded','disputed')),0)::integer confirmed,
  coalesce(sum(quantity) FILTER(WHERE status='pending_payment' AND expires_at>now()),0)::integer held
  FROM public.event_bookings WHERE place_id=s.id
 ) b ON true WHERE s.id=p_id
$$;

CREATE OR REPLACE FUNCTION event_private.guard_place_capacity() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE used integer;
BEGIN
 -- Le RPC di prenotazione e gestione prendono prima il lock sull'evento, poi sul posteggio.
 SELECT coalesce(sum(quantity),0) INTO used FROM public.event_bookings WHERE place_id=NEW.id
 AND (status IN ('paid','partially_refunded','disputed') OR (status='pending_payment' AND expires_at>now()));
 IF NEW.quantity<NEW.external_reserved+used THEN RAISE EXCEPTION 'Il massimo non può essere inferiore ai posti già assegnati o in pagamento.'; END IF;
 IF NOT NEW.active AND (used>0 OR NEW.external_reserved>0) THEN RAISE EXCEPTION 'Sono presenti prenotazioni: non puoi disattivare questa tipologia.'; END IF;
 IF TG_OP='UPDATE' AND (NEW.quantity,NEW.external_reserved) IS DISTINCT FROM (OLD.quantity,OLD.external_reserved) THEN
  NEW.capacity_revision=OLD.capacity_revision+1;
 END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS guard_place_capacity ON public.event_places;
CREATE TRIGGER guard_place_capacity BEFORE INSERT OR UPDATE ON public.event_places
FOR EACH ROW EXECUTE FUNCTION event_private.guard_place_capacity();

CREATE OR REPLACE FUNCTION public.set_event_capacity(p_place_id uuid,p_quantity integer,p_external_reserved integer,p_revision integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=event_private.require_user(); e public.organizer_events%ROWTYPE; s public.event_places%ROWTYPE;
BEGIN
 SELECT * INTO e FROM public.organizer_events WHERE id=(SELECT event_id FROM public.event_places WHERE id=p_place_id) FOR UPDATE;
 IF e.id IS NULL OR e.organizer_id<>uid OR NOT EXISTS(SELECT 1 FROM public.organizer_profiles WHERE user_id=uid AND status='approved') THEN
  RAISE EXCEPTION 'Operazione non consentita' USING ERRCODE='42501'; END IF;
 SELECT * INTO s FROM public.event_places WHERE id=p_place_id FOR UPDATE;
 IF p_revision IS DISTINCT FROM s.capacity_revision THEN RAISE EXCEPTION 'Disponibilità aggiornata da un’altra sessione. Ricarica e riprova.'; END IF;
 IF p_quantity IS NULL OR p_quantity NOT BETWEEN 1 AND 10000 OR p_external_reserved IS NULL OR p_external_reserved NOT BETWEEN 0 AND p_quantity THEN
  RAISE EXCEPTION 'Controlla il massimo e i posti assegnati fuori dal sito.'; END IF;
 UPDATE public.event_places SET quantity=p_quantity,external_reserved=p_external_reserved WHERE id=s.id;
 INSERT INTO event_private.audit(actor_id,action,entity_id,detail) VALUES(uid,'capacity_updated',s.id,
  jsonb_build_object('capacity',p_quantity,'external_reserved',p_external_reserved));
 RETURN event_private.place_inventory(s.id);
END $$;

CREATE OR REPLACE FUNCTION public.published_organizer_events(p_id uuid DEFAULT NULL,p_organizer_id uuid DEFAULT NULL) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT coalesce(jsonb_agg(row_data ORDER BY start_date,id),'[]'::jsonb) FROM (
 SELECT e.start_date,e.id,jsonb_build_object('id',e.id,'organizer_id',e.organizer_id,'title',e.title,'description',e.description,'category',e.category,
 'region',e.region,'province',e.province,'city',e.city,'venue',e.venue,'latitude',e.latitude,'longitude',e.longitude,'start_date',e.start_date,'end_date',e.end_date,
 'hours',e.hours,'sectors',e.sectors,'goods',e.goods,'participation_rules',e.participation_rules,'application_deadline',e.application_deadline,
 'organization_name',p.organization_name,'organization_description',p.description,'website',p.website,'public_email',p.public_email,'public_phone',p.public_phone,
 'updated_at',e.updated_at,'bookings_enabled',false,
 'places',coalesce((SELECT jsonb_agg(jsonb_build_object('id',s.id,'label',s.label,'description',s.description,'quantity',s.quantity,'price_cents',s.price_cents,
  'width_m',s.width_m,'depth_m',s.depth_m,'available',(event_private.place_inventory(s.id)->>'available')::integer) ORDER BY s.price_cents,s.label)
  FROM public.event_places s WHERE s.event_id=e.id AND s.active),'[]'::jsonb)) AS row_data
 FROM public.organizer_events e JOIN public.organizer_profiles p ON p.user_id=e.organizer_id
 WHERE e.status='published' AND p.status='approved' AND (p_id IS NULL OR e.id=p_id) AND (p_organizer_id IS NULL OR e.organizer_id=p_organizer_id)
 ) t
$$;

CREATE OR REPLACE FUNCTION public.organizer_workspace() RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE uid uuid:=event_private.require_user(); BEGIN
 RETURN jsonb_build_object('profile',(SELECT to_jsonb(p) FROM public.organizer_profiles p WHERE user_id=uid),
 'events',coalesce((SELECT jsonb_agg(to_jsonb(e)||jsonb_build_object('places',coalesce((SELECT jsonb_agg(to_jsonb(s)||event_private.place_inventory(s.id) ORDER BY s.created_at,s.id)
 FROM public.event_places s WHERE s.event_id=e.id),'[]'::jsonb)) ORDER BY e.updated_at DESC) FROM public.organizer_events e WHERE e.organizer_id=uid),'[]'::jsonb),
 'bookings_enabled',false,'commission_bps',800);
END $$;

-- La vecchia primitiva conserva tutte le verifiche; aggiunge i posti assegnati esternamente.
DO $patch$
DECLARE definition text;
BEGIN
 SELECT pg_get_functiondef('public.reserve_event_place(uuid,integer,uuid)'::regprocedure) INTO definition;
 IF position('s.external_reserved' IN definition)=0 THEN
  definition=replace(definition,'IF used+p_quantity>s.quantity THEN','IF used+p_quantity+s.external_reserved>s.quantity THEN');
  IF position('s.external_reserved' IN definition)=0 THEN RAISE EXCEPTION 'Primitiva prenotazioni inattesa'; END IF;
  EXECUTE definition;
 END IF;
END $patch$;

REVOKE ALL ON FUNCTION public.set_event_capacity(uuid,integer,integer,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.set_event_capacity(uuid,integer,integer,integer) TO authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA event_private FROM PUBLIC,anon,authenticated;
NOTIFY pgrst,'reload schema';
COMMIT;
