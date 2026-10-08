-- Protezioni nuovi dati + controllo admin. Non cancella e non riscrive record storici.
-- Prima dell'attivazione dei trigger, caricare l'anagrafica con scripts/seed-data-locations.cjs.
BEGIN;
CREATE SCHEMA IF NOT EXISTS data_quality;
REVOKE ALL ON SCHEMA data_quality FROM PUBLIC,anon,authenticated;
CREATE TABLE IF NOT EXISTS data_quality.locations (
    name text NOT NULL, regione text NOT NULL, provincia text NOT NULL,
    lat double precision, lng double precision,
    PRIMARY KEY(name,regione,provincia),
    CHECK ((lat IS NULL AND lng IS NULL) OR (lat BETWEEN 35 AND 48 AND lng BETWEEN 6 AND 19))
);
CREATE INDEX IF NOT EXISTS dq_locations_name ON data_quality.locations(lower(name),regione);

CREATE OR REPLACE FUNCTION data_quality.phone_digits(raw text) RETURNS text
LANGUAGE plpgsql IMMUTABLE SET search_path='' AS $$
DECLARE n text;
BEGIN
    IF raw IS NULL OR length(raw)>40 OR raw !~ '^[+0-9[:space:]()./-]+$' THEN RETURN NULL; END IF;
    n := regexp_replace(trim(raw),'[[:space:]()./-]','','g');
    IF n LIKE '+39%' THEN n:=substr(n,4);
    ELSIF n LIKE '0039%' THEN n:=substr(n,5);
    ELSIF n ~ '^393[0-9]{8,9}$' OR n ~ '^390[0-9]{5,10}$' THEN n:=substr(n,3); END IF;
    IF n !~ '^(3[0-9]{8,9}|0[0-9]{5,10})$' OR n ~ '^([0-9])\1+$' THEN RETURN NULL; END IF;
    RETURN n;
END $$;
CREATE OR REPLACE FUNCTION data_quality.valid_text(raw text,lo integer,hi integer,multiline boolean DEFAULT false) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path='' AS $$
    SELECT coalesce(length(trim(raw)) BETWEEN lo AND hi AND
        CASE WHEN multiline THEN raw !~ '[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]' ELSE raw !~ '[[:cntrl:]]' END,false)
$$;
CREATE OR REPLACE FUNCTION data_quality.valid_email(raw text) RETURNS boolean
LANGUAGE sql IMMUTABLE SET search_path='' AS $$
    SELECT coalesce(length(raw)<=200 AND length(split_part(raw,'@',1))<=64
      AND raw ~ '^[A-Za-z0-9!#$%&''*+/=?^_`{|}~.-]+@[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]*[A-Za-z0-9])?)+$'
      AND raw NOT LIKE '.%' AND raw NOT LIKE '%..%' AND raw NOT LIKE '%.@%',false)
$$;
CREATE OR REPLACE FUNCTION data_quality.is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin=true)
$$;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA data_quality FROM PUBLIC,anon,authenticated;

-- TABLE grants prevalgono sui column grants: revocare entrambi prima di riaprire solo i campi del profilo.
REVOKE INSERT,UPDATE,TRUNCATE,TRIGGER,REFERENCES ON public.profiles FROM anon,authenticated;
DO $$ DECLARE cols text; BEGIN
    SELECT string_agg(quote_ident(column_name),',') INTO cols FROM information_schema.columns
       WHERE table_schema='public' AND table_name='profiles';
    EXECUTE 'REVOKE INSERT ('||cols||'), UPDATE ('||cols||') ON public.profiles FROM anon,authenticated';
END $$;
GRANT INSERT(id,nome,cognome,telefono,avatar_url,email_digest,email_stats),
      UPDATE(nome,cognome,telefono,avatar_url,email_digest,email_stats) ON public.profiles TO authenticated;
-- Supabase upsert include id nella parte UPDATE anche se invariato.
GRANT UPDATE(id) ON public.profiles TO authenticated;
DROP POLICY IF EXISTS "Inserimento profilo" ON public.profiles;
CREATE POLICY "Inserimento profilo" ON public.profiles FOR INSERT TO authenticated WITH CHECK(auth.uid()=id);

CREATE OR REPLACE FUNCTION public.admin_get_recent_users(p_limit integer DEFAULT 5)
RETURNS TABLE(id uuid,email text,created_at timestamptz,last_sign_in_at timestamptz,confirmed_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
    IF NOT (coalesce(auth.role(),'')='service_role' OR data_quality.is_admin()) THEN
        RAISE EXCEPTION 'Accesso amministratore richiesto' USING ERRCODE='42501';
    END IF;
    RETURN QUERY SELECT u.id,u.email,u.created_at,u.last_sign_in_at,u.email_confirmed_at
       FROM auth.users u ORDER BY u.created_at DESC LIMIT greatest(1,least(coalesce(p_limit,5),5000));
END $$;
REVOKE ALL ON FUNCTION public.admin_get_recent_users(integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_get_recent_users(integer) TO authenticated,service_role;

CREATE OR REPLACE FUNCTION data_quality.guard_profile() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
    IF TG_OP='UPDATE' AND NEW.id IS DISTINCT FROM OLD.id THEN RAISE EXCEPTION 'Identità profilo non modificabile'; END IF;
    IF TG_OP='INSERT' OR NEW.nome IS DISTINCT FROM OLD.nome THEN
      IF NOT data_quality.valid_text(coalesce(NEW.nome,''),0,100) THEN RAISE EXCEPTION 'Nome non valido (massimo 100 caratteri)' USING ERRCODE='23514'; END IF;
      NEW.nome:=trim(NEW.nome);
    END IF;
    IF TG_OP='INSERT' OR NEW.cognome IS DISTINCT FROM OLD.cognome THEN
      IF NOT data_quality.valid_text(coalesce(NEW.cognome,''),0,100) THEN RAISE EXCEPTION 'Cognome non valido (massimo 100 caratteri)' USING ERRCODE='23514'; END IF;
      NEW.cognome:=trim(NEW.cognome);
    END IF;
    IF TG_OP='INSERT' OR NEW.telefono IS DISTINCT FROM OLD.telefono THEN
      IF nullif(trim(NEW.telefono),'') IS NOT NULL THEN
        IF data_quality.phone_digits(NEW.telefono) IS NULL THEN RAISE EXCEPTION 'Telefono non valido' USING ERRCODE='23514'; END IF;
        NEW.telefono:=data_quality.phone_digits(NEW.telefono);
        IF NEW.telefono ~ '^3[0-9]{9}$' THEN NEW.telefono:=substr(NEW.telefono,1,3)||' '||substr(NEW.telefono,4); END IF;
      END IF;
    END IF;
    IF TG_OP='INSERT' OR NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN
      IF nullif(NEW.avatar_url,'') IS NOT NULL AND (length(NEW.avatar_url)>2000 OR NEW.avatar_url !~ '^https://[^[:space:]<>]+$') THEN RAISE EXCEPTION 'Indirizzo foto profilo non valido'; END IF;
    END IF;
    RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS dq_profile ON public.profiles;
CREATE TRIGGER dq_profile BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION data_quality.guard_profile();

CREATE OR REPLACE FUNCTION data_quality.listing_issues(a jsonb) RETURNS text[]
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE issues text[]:='{}'; p numeric; s numeric; loc record; e jsonb;
BEGIN
    IF NOT data_quality.valid_text(a->>'titolo',3,110) THEN issues:=array_append(issues,'titolo'); END IF;
    IF NOT data_quality.valid_text(a->>'descrizione',40,10000,true) THEN issues:=array_append(issues,'descrizione'); END IF;
    IF NOT data_quality.valid_text(a->>'contatto',1,100) THEN issues:=array_append(issues,'contatto'); END IF;
    IF data_quality.phone_digits(a->>'tel') IS NULL THEN issues:=array_append(issues,'telefono'); END IF;
    IF nullif(trim(a->>'email'),'') IS NOT NULL AND NOT data_quality.valid_email(a->>'email') THEN issues:=array_append(issues,'email'); END IF;
    IF coalesce(a->>'stato','') NOT IN ('Vendita','Affitto mensile') THEN issues:=array_append(issues,'stato'); END IF;
    IF coalesce(a->>'tipo','') NOT IN ('Mercato settimanale','Fiera') THEN issues:=array_append(issues,'tipo'); END IF;
    IF coalesce(a->>'settore','') NOT IN ('Frutta e verdura','Pesce','Carne','Formaggi e salumi','Pane e prodotti da forno','Gastronomia / cibi pronti','Dolci e pasticceria','Biologico e km0','Altro alimentare','Abbigliamento e accessori','Calzature','Biancheria e tessuti','Fiori e piante','Casalinghi','Libri e giocattoli','Gioielli e bigiotteria','Elettronica','Antiquariato','Altro non alimentare') THEN issues:=array_append(issues,'settore'); END IF;
    BEGIN p:=(a->>'prezzo')::numeric; EXCEPTION WHEN OTHERS THEN p:=NULL; END;
    IF p IS NULL OR NOT(p BETWEEN 101 AND 400000) OR p<>round(p,2) THEN issues:=array_append(issues,'prezzo'); END IF;
    BEGIN s:=(a->>'superficie')::numeric; EXCEPTION WHEN OTHERS THEN s:=NULL; END;
    IF s IS NULL OR NOT(s>0 AND s<=10000) OR s<>round(s,2) THEN issues:=array_append(issues,'superficie'); END IF;
    IF a->>'tipo'='Mercato settimanale' AND (coalesce(a->>'giorni','') !~ '^(Lunedì|Martedì|Mercoledì|Giovedì|Venerdì|Sabato|Domenica)(, (Lunedì|Martedì|Mercoledì|Giovedì|Venerdì|Sabato|Domenica))*$'
      OR (SELECT count(*)<>count(DISTINCT d) FROM unnest(string_to_array(a->>'giorni',', ')) d)) THEN issues:=array_append(issues,'giorni'); END IF;
    IF a->>'tipo'='Fiera' AND NOT data_quality.valid_text(a->>'giorni',1,500,true) THEN issues:=array_append(issues,'giorni'); END IF;
    IF NOT EXISTS(SELECT 1 FROM data_quality.locations l WHERE l.name=a->>'comune' AND l.regione=a->>'regione' AND l.provincia=a->>'provincia') THEN issues:=array_append(issues,'localita'); END IF;
    e:=a->'dettagli_extra';
    IF e IS NOT NULL AND e<>'null'::jsonb AND jsonb_typeof(e)<>'object' THEN issues:=array_append(issues,'dettagli'); END IF;
    IF octet_length(coalesce(e::text,''))>50000 THEN issues:=array_append(issues,'dettagli'); END IF;
    IF e ? 'nome_fiera' AND NOT data_quality.valid_text(e->>'nome_fiera',0,150) THEN issues:=array_append(issues,'fiera'); END IF;
    IF e ? 'note_fiera' AND NOT data_quality.valid_text(e->>'note_fiera',0,500,true) THEN issues:=array_append(issues,'fiera'); END IF;
    IF jsonb_typeof(a->'img_urls')='array' THEN
      IF jsonb_array_length(a->'img_urls')>5 OR EXISTS(SELECT 1 FROM jsonb_array_elements(a->'img_urls') v WHERE jsonb_typeof(v)<>'string' OR length(v#>>'{}')>2000 OR (v#>>'{}') !~ '^https://[^[:space:]<>]+$') THEN issues:=array_append(issues,'foto'); END IF;
    END IF;
    IF e ? 'images' AND e->'images' IS DISTINCT FROM coalesce(a->'img_urls','[]'::jsonb) THEN issues:=array_append(issues,'foto'); END IF;
    RETURN issues;
END $$;

-- Il trigger invoker distingue le scritture API dalle RPC privilegiate (contatori, rinnovi e Stripe).
GRANT USAGE ON SCHEMA data_quality TO authenticated;
GRANT EXECUTE ON FUNCTION data_quality.is_admin(),data_quality.listing_issues(jsonb),data_quality.phone_digits(text) TO authenticated;
CREATE OR REPLACE FUNCTION data_quality.guard_listing() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$
DECLARE issues text[]; content_changed boolean; raw jsonb;
BEGIN
    IF TG_OP='UPDATE' THEN
      content_changed := (to_jsonb(NEW)-ARRAY['status','visualizzazioni','tel_clicks','saved_count','featured','featured_until','featured_tier','featured_since','expires_at','dettagli_extra'])
          IS DISTINCT FROM (to_jsonb(OLD)-ARRAY['status','visualizzazioni','tel_clicks','saved_count','featured','featured_until','featured_tier','featured_since','expires_at','dettagli_extra'])
          OR (coalesce(NEW.dettagli_extra,'{}')-ARRAY['rejection_reason','rejected_at']) IS DISTINCT FROM (coalesce(OLD.dettagli_extra,'{}')-ARRAY['rejection_reason','rejected_at']);
      IF current_user IN ('anon','authenticated') THEN
        IF NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.created_at IS DISTINCT FROM OLD.created_at OR NEW.data IS DISTINCT FROM OLD.data
          OR NEW.is_demo IS DISTINCT FROM OLD.is_demo OR NEW.visualizzazioni IS DISTINCT FROM OLD.visualizzazioni OR NEW.tel_clicks IS DISTINCT FROM OLD.tel_clicks OR NEW.saved_count IS DISTINCT FROM OLD.saved_count THEN
          RAISE EXCEPTION 'Proprietà, date e statistiche non modificabili dal modulo' USING ERRCODE='42501';
        END IF;
        IF NOT data_quality.is_admin() THEN
          IF NEW.expires_at IS DISTINCT FROM OLD.expires_at THEN RAISE EXCEPTION 'Usa Riattiva per rinnovare l’annuncio' USING ERRCODE='42501'; END IF;
          IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status NOT IN ('pending','sold','deleted') THEN RAISE EXCEPTION 'Stato annuncio non autorizzato' USING ERRCODE='42501'; END IF;
          IF content_changed THEN NEW.status:='pending'; END IF;
        END IF;
      END IF;
    ELSE
      content_changed:=true;
      IF current_user IN ('anon','authenticated') THEN
        NEW.created_at:=now(); NEW.data:=current_date; NEW.expires_at:=now()+interval '200 days';
        NEW.visualizzazioni:=0; NEW.tel_clicks:=0; NEW.saved_count:=0; NEW.is_demo:=false;
      END IF;
    END IF;
    IF content_changed THEN
      raw:=to_jsonb(NEW);
      issues:=data_quality.listing_issues(raw);
      -- Le informazioni storiche non modificate restano leggibili e segnalate all'admin.
      -- Un edit deve correggere i campi del modulo; i vecchi settori/giorni non editabili restano invariati.
      IF TG_OP='UPDATE' THEN
        IF NEW.tipo IS NOT DISTINCT FROM OLD.tipo AND NEW.giorni IS NOT DISTINCT FROM OLD.giorni THEN issues:=array_remove(issues,'giorni'); issues:=array_remove(issues,'tipo'); END IF;
        IF NEW.settore IS NOT DISTINCT FROM OLD.settore THEN issues:=array_remove(issues,'settore'); END IF;
      END IF;
      IF cardinality(issues)>0 THEN RAISE EXCEPTION 'Controlla i dati dell’annuncio: %',array_to_string(issues,', ') USING ERRCODE='23514'; END IF;
      NEW.titolo:=trim(NEW.titolo); NEW.descrizione:=trim(NEW.descrizione); NEW.contatto:=trim(NEW.contatto);
      NEW.tel:=data_quality.phone_digits(NEW.tel);
      IF NEW.tel ~ '^3[0-9]{9}$' THEN NEW.tel:=substr(NEW.tel,1,3)||' '||substr(NEW.tel,4); END IF;
    END IF;
    RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS dq_listing ON public.annunci;
CREATE TRIGGER dq_listing BEFORE INSERT OR UPDATE ON public.annunci FOR EACH ROW EXECUTE FUNCTION data_quality.guard_listing();

REVOKE TRUNCATE,TRIGGER,REFERENCES ON public.annunci,public.alerts,public.conversazioni,public.messaggi,public.conversation_reports,public.saved_listings FROM anon,authenticated;
REVOKE UPDATE,DELETE,TRUNCATE,TRIGGER,REFERENCES ON public.page_views,public.auth_modal_opens,public.blog_conversions FROM anon,authenticated;

CREATE OR REPLACE FUNCTION data_quality.guard_alert() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE loc record;
BEGIN
    IF TG_OP='UPDATE' AND (NEW.id IS DISTINCT FROM OLD.id OR NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.created_at IS DISTINCT FROM OLD.created_at) THEN RAISE EXCEPTION 'Identità alert non modificabile'; END IF;
    IF TG_OP='INSERT' THEN NEW.created_at:=now(); END IF;
    NEW.comune:=nullif(trim(NEW.comune),''); NEW.regione:=nullif(trim(NEW.regione),''); NEW.tipo:=nullif(trim(NEW.tipo),'');
    IF NEW.tipo IS NOT NULL AND NEW.tipo NOT IN ('Mercato settimanale','Fiera') THEN RAISE EXCEPTION 'Tipo alert non valido'; END IF;
    IF NEW.regione IS NOT NULL AND NOT EXISTS(SELECT 1 FROM data_quality.locations WHERE regione=NEW.regione) THEN RAISE EXCEPTION 'Regione alert non valida'; END IF;
    IF NEW.comune IS NULL THEN
      NEW.lat:=NULL; NEW.lng:=NULL;
    ELSE
      SELECT count(*) AS n,min(lat) AS lat,min(lng) AS lng,min(regione) AS regione INTO loc
      FROM data_quality.locations WHERE name=NEW.comune AND (NEW.regione IS NULL OR regione=NEW.regione);
      IF loc.n<>1 OR loc.lat IS NULL THEN RAISE EXCEPTION 'Scegli un comune o una frazione univoca dall’elenco'; END IF;
      NEW.lat:=loc.lat; NEW.lng:=loc.lng; NEW.regione:=loc.regione;
    END IF;
    IF NEW.raggio_km IS NULL THEN NEW.raggio_km:=100; END IF;
    IF NOT(NEW.raggio_km BETWEEN 1 AND 400) THEN RAISE EXCEPTION 'Raggio alert non valido (1–400 km)'; END IF;
    RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS dq_alert ON public.alerts;
CREATE TRIGGER dq_alert BEFORE INSERT OR UPDATE ON public.alerts FOR EACH ROW EXECUTE FUNCTION data_quality.guard_alert();

CREATE OR REPLACE FUNCTION data_quality.guard_chat() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
    IF TG_TABLE_NAME='conversazioni' THEN
      IF NEW.acquirente_id=NEW.venditore_id THEN RAISE EXCEPTION 'Non puoi contattare te stesso'; END IF;
      IF NEW.is_support THEN
        IF NEW.annuncio_id IS NOT NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=NEW.venditore_id AND is_admin=true) THEN RAISE EXCEPTION 'Destinatario supporto non valido'; END IF;
      ELSIF NOT EXISTS(SELECT 1 FROM public.annunci WHERE id=NEW.annuncio_id AND user_id=NEW.venditore_id AND status='active' AND (expires_at IS NULL OR expires_at>now())) THEN
        RAISE EXCEPTION 'Annuncio o venditore non disponibile';
      END IF;
      NEW.created_at:=now();
    ELSIF TG_TABLE_NAME='messaggi' THEN
      IF TG_OP='UPDATE' THEN
        IF NEW.id IS DISTINCT FROM OLD.id OR NEW.testo IS DISTINCT FROM OLD.testo OR NEW.mittente_id IS DISTINCT FROM OLD.mittente_id OR NEW.conversazione_id IS DISTINCT FROM OLD.conversazione_id OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN RAISE EXCEPTION 'Il messaggio inviato non è modificabile'; END IF;
      ELSE
        IF NOT data_quality.valid_text(NEW.testo,1,5000,true) THEN RAISE EXCEPTION 'Messaggio non valido (1–5.000 caratteri)'; END IF;
        NEW.testo:=trim(NEW.testo); NEW.created_at:=now(); NEW.letto:=false;
      END IF;
    ELSE
      IF NOT data_quality.valid_text(coalesce(NEW.details,''),0,2000,true) THEN RAISE EXCEPTION 'Dettagli segnalazione troppo lunghi (massimo 2.000 caratteri)'; END IF;
      NEW.details:=nullif(trim(NEW.details),''); NEW.created_at:=now(); NEW.status:='open'; NEW.reviewed_at:=NULL; NEW.reviewed_by:=NULL; NEW.admin_notes:=NULL;
    END IF;
    RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS dq_conversation ON public.conversazioni;
CREATE TRIGGER dq_conversation BEFORE INSERT ON public.conversazioni FOR EACH ROW EXECUTE FUNCTION data_quality.guard_chat();
DROP TRIGGER IF EXISTS dq_message ON public.messaggi;
CREATE TRIGGER dq_message BEFORE INSERT OR UPDATE ON public.messaggi FOR EACH ROW EXECUTE FUNCTION data_quality.guard_chat();
DROP TRIGGER IF EXISTS dq_report ON public.conversation_reports;
CREATE TRIGGER dq_report BEFORE INSERT ON public.conversation_reports FOR EACH ROW EXECUTE FUNCTION data_quality.guard_chat();

CREATE INDEX IF NOT EXISTS dq_page_view_lookup ON public.page_views(session_id,path,visitor_id);
CREATE INDEX IF NOT EXISTS dq_blog_conversion_lookup ON public.blog_conversions(session_id,post_slug,kind);
CREATE OR REPLACE FUNCTION data_quality.guard_event() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
    IF TG_TABLE_NAME='page_views' THEN
      IF NEW.path !~ '^/[a-zA-Z0-9/_-]*$' OR length(NEW.path)>200 THEN RAISE EXCEPTION 'Percorso visita non valido'; END IF;
      IF NEW.referrer IS NOT NULL AND NEW.referrer !~ '^https?://[a-zA-Z0-9.-]+(:[0-9]{1,5})?$' THEN RAISE EXCEPTION 'Origine visita non valida'; END IF;
      IF nullif(NEW.visitor_id,'') IS NULL OR nullif(NEW.session_id,'') IS NULL THEN RAISE EXCEPTION 'Identificativi visita mancanti'; END IF;
      PERFORM pg_advisory_xact_lock(hashtextextended('pv:'||NEW.session_id||':'||NEW.path||':'||NEW.visitor_id,0));
      IF EXISTS(SELECT 1 FROM public.page_views WHERE session_id=NEW.session_id AND path=NEW.path AND visitor_id=NEW.visitor_id) THEN RETURN NULL; END IF;
    ELSIF TG_TABLE_NAME='auth_modal_opens' THEN
      IF length(NEW.anon_session) NOT BETWEEN 8 AND 80 THEN RAISE EXCEPTION 'Sessione registrazione non valida'; END IF;
      IF current_setting('role',true) IN ('anon','authenticated') THEN NEW.signed_up_user_id:=NULL; NEW.opened_at:=now(); NEW.time_bucket:=to_char(now() AT TIME ZONE 'UTC','YYYYMMDDHH24MI'); END IF;
      PERFORM pg_advisory_xact_lock(hashtextextended('amo:'||NEW.anon_session||':'||NEW.source||':'||NEW.time_bucket,0));
      IF EXISTS(SELECT 1 FROM public.auth_modal_opens WHERE anon_session=NEW.anon_session AND source=NEW.source AND time_bucket=NEW.time_bucket) THEN RETURN NULL; END IF;
      RETURN NEW;
    ELSE
      IF NEW.post_slug IS NULL OR NEW.post_slug !~ '^[a-z0-9-]{1,120}$' THEN RAISE EXCEPTION 'Articolo conversione non valido'; END IF;
      IF NEW.visitor_id IS NULL OR NEW.session_id IS NULL OR length(NEW.visitor_id) NOT BETWEEN 8 AND 80 OR length(NEW.session_id) NOT BETWEEN 8 AND 80 THEN RAISE EXCEPTION 'Sessione conversione non valida'; END IF;
      IF current_setting('role',true) IN ('anon','authenticated') AND NEW.kind='alert_signup' THEN RAISE EXCEPTION 'Iscrizione registrata solo dal servizio avvisi' USING ERRCODE='42501'; END IF;
      PERFORM pg_advisory_xact_lock(hashtextextended('blog:'||NEW.session_id||':'||NEW.post_slug||':'||NEW.kind,0));
      IF EXISTS(SELECT 1 FROM public.blog_conversions WHERE session_id=NEW.session_id AND post_slug=NEW.post_slug AND kind=NEW.kind) THEN RETURN NULL; END IF;
    END IF;
    IF current_setting('role',true) IN ('anon','authenticated') THEN NEW.created_at:=now(); END IF;
    RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS dq_page_view ON public.page_views;
CREATE TRIGGER dq_page_view BEFORE INSERT ON public.page_views FOR EACH ROW EXECUTE FUNCTION data_quality.guard_event();
DROP TRIGGER IF EXISTS dq_auth_open ON public.auth_modal_opens;
CREATE TRIGGER dq_auth_open BEFORE INSERT ON public.auth_modal_opens FOR EACH ROW EXECUTE FUNCTION data_quality.guard_event();
DROP TRIGGER IF EXISTS dq_blog_conversion ON public.blog_conversions;
CREATE TRIGGER dq_blog_conversion BEFORE INSERT ON public.blog_conversions FOR EACH ROW EXECUTE FUNCTION data_quality.guard_event();

CREATE OR REPLACE FUNCTION data_quality.guard_bando_subscription() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
    NEW.email:=lower(trim(NEW.email)); NEW.source:=nullif(trim(NEW.source),'');
    IF NOT data_quality.valid_email(NEW.email) THEN RAISE EXCEPTION 'Email avvisi non valida'; END IF;
    IF NOT EXISTS(SELECT 1 FROM data_quality.locations WHERE regione=NEW.regione) THEN RAISE EXCEPTION 'Regione avvisi non valida'; END IF;
    IF NEW.source IS NOT NULL AND NEW.source !~ '^[a-z0-9/_-]{1,120}$' THEN RAISE EXCEPTION 'Provenienza avvisi non valida'; END IF;
    RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS dq_bando_subscription ON public.bando_alerts;
CREATE TRIGGER dq_bando_subscription BEFORE INSERT OR UPDATE OF email,regione,source ON public.bando_alerts FOR EACH ROW EXECUTE FUNCTION data_quality.guard_bando_subscription();

-- Match geografico unico, nessuna coordinata inventata dal capoluogo della regione.
CREATE OR REPLACE FUNCTION public.matching_listing_alerts(p_listing_id uuid)
RETURNS TABLE(user_id uuid,comune text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 WITH listing AS (SELECT * FROM public.annunci WHERE id=p_listing_id AND status='active' AND NOT is_demo AND (expires_at IS NULL OR expires_at>now())),
 coords AS (SELECT min(l.lat) lat,min(l.lng) lng FROM data_quality.locations l,listing a
     WHERE lower(l.name)=lower(a.comune) AND l.regione=a.regione AND (nullif(a.provincia,'') IS NULL OR a.provincia=l.provincia) HAVING count(*)=1)
 SELECT DISTINCT al.user_id,al.comune FROM public.alerts al CROSS JOIN listing a LEFT JOIN coords c ON true
 WHERE al.user_id<>a.user_id AND (nullif(al.tipo,'') IS NULL OR al.tipo=a.tipo) AND (
   (nullif(al.comune,'') IS NULL AND (nullif(al.regione,'') IS NULL OR al.regione=a.regione)) OR
   (nullif(al.comune,'') IS NOT NULL AND (nullif(al.comune,'')=al.regione AND al.regione=a.regione)) OR
   (al.lat IS NOT NULL AND al.lng IS NOT NULL AND c.lat IS NOT NULL AND c.lng IS NOT NULL AND
    6371*2*asin(sqrt(least(1.0,greatest(0.0,power(sin(radians(c.lat-al.lat)/2),2)+cos(radians(al.lat))*cos(radians(c.lat))*power(sin(radians(c.lng-al.lng)/2),2)))))<=coalesce(al.raggio_km,100))
 )
$$;
REVOKE ALL ON FUNCTION public.matching_listing_alerts(uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.matching_listing_alerts(uuid) TO service_role;

-- Evita che un chiamante possa moltiplicare i contatti di un annuncio con amount=1000000.
CREATE OR REPLACE FUNCTION public.track_listing_event(listing_id uuid,event_type text,amount integer DEFAULT 1)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
    IF event_type IS NULL OR event_type NOT IN ('call','whatsapp','chat') OR amount IS DISTINCT FROM 1 THEN RETURN; END IF;
    IF NOT EXISTS(SELECT 1 FROM public.annunci WHERE id=listing_id AND status='active' AND NOT is_demo
      AND (expires_at IS NULL OR expires_at>now()) AND user_id IS DISTINCT FROM auth.uid()) THEN RETURN; END IF;
    IF event_type IN ('call','whatsapp') THEN UPDATE public.annunci SET tel_clicks=coalesce(tel_clicks,0)+1 WHERE id=listing_id; END IF;
    PERFORM public._bump_listing_daily(listing_id,event_type,1);
END $$;
REVOKE ALL ON FUNCTION public.track_listing_event(uuid,text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_listing_event(uuid,text,integer) TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.increment_views(listing_id uuid,amount integer DEFAULT 1)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
    IF amount IS DISTINCT FROM 1 THEN RETURN; END IF;
    IF NOT EXISTS(SELECT 1 FROM public.annunci WHERE id=listing_id AND status='active' AND NOT is_demo
      AND (expires_at IS NULL OR expires_at>now()) AND user_id IS DISTINCT FROM auth.uid()) THEN RETURN; END IF;
    UPDATE public.annunci SET visualizzazioni=coalesce(visualizzazioni,0)+1 WHERE id=listing_id;
    PERFORM public._bump_listing_daily(listing_id,'view',1);
END $$;
REVOKE ALL ON FUNCTION public.increment_views(uuid,integer) FROM PUBLIC,anon,authenticated;
-- track_listing_view è l'unico ingresso pubblico per visualizzazioni/impression.
GRANT EXECUTE ON FUNCTION public.increment_views(uuid,integer) TO service_role;

-- TRUNCATE non applica RLS: nessun ruolo del browser deve poterlo eseguire.
DO $$ DECLARE t record; BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' LOOP
    EXECUTE format('REVOKE TRUNCATE,TRIGGER,REFERENCES ON public.%I FROM anon,authenticated',t.tablename);
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.admin_control_room(p_offset integer DEFAULT 0,p_kind text DEFAULT 'all')
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
DECLARE result jsonb;
BEGIN
    IF NOT data_quality.is_admin() THEN RAISE EXCEPTION 'Accesso amministratore richiesto' USING ERRCODE='42501'; END IF;
    IF p_kind NOT IN ('all','annuncio','profilo','alert') OR p_offset<0 OR p_offset>100000 THEN RAISE EXCEPTION 'Filtro non valido'; END IF;
    WITH listing_quality AS MATERIALIZED (
      SELECT a.id,a.titolo,a.comune,a.status,a.created_at,data_quality.listing_issues(to_jsonb(a)) AS issues
      FROM public.annunci a WHERE NOT a.is_demo AND a.status IN ('active','pending')
    ), profile_quality AS MATERIALIZED (
      SELECT p.id,trim(coalesce(p.nome,'')||' '||coalesce(p.cognome,'')) AS name,p.created_at,
        array_remove(ARRAY[CASE WHEN nullif(trim(p.nome),'') IS NULL THEN 'nome_mancante' END,
          CASE WHEN nullif(trim(p.telefono),'') IS NOT NULL AND data_quality.phone_digits(p.telefono) IS NULL THEN 'telefono' END,
          CASE WHEN nullif(trim(p.telefono),'') IS NULL THEN 'telefono_facoltativo' END,
          CASE WHEN p.nome IS NOT NULL AND NOT data_quality.valid_text(p.nome,1,100) THEN 'nome' END],NULL) AS issues
      FROM public.profiles p WHERE NOT p.is_demo
    ), all_issues AS MATERIALIZED (
      SELECT 'annuncio' AS kind,id,titolo AS label,comune AS context,status,created_at,issues,'warning' AS severity FROM listing_quality WHERE cardinality(issues)>0
      UNION ALL SELECT 'profilo',id,name,'Profilo utente',NULL,created_at,issues,
         CASE WHEN issues=ARRAY['telefono_facoltativo']::text[] THEN 'info' ELSE 'warning' END FROM profile_quality WHERE cardinality(issues)>0
      UNION ALL SELECT 'alert',al.id,coalesce(al.comune,al.regione,'Tutta Italia'),'Avviso geografico',NULL,al.created_at,
        ARRAY['alert_localita'], 'warning' FROM public.alerts al
        WHERE (al.lat IS NULL)<>(al.lng IS NULL) OR
          (nullif(al.comune,'') IS NOT NULL AND NOT EXISTS(SELECT 1 FROM data_quality.locations l WHERE lower(l.name)=lower(al.comune) AND (nullif(al.regione,'') IS NULL OR l.regione=al.regione)) AND al.comune IS DISTINCT FROM al.regione)
    ), filtered AS (SELECT * FROM all_issues WHERE p_kind='all' OR kind=p_kind), page AS (
      SELECT * FROM filtered ORDER BY CASE severity WHEN 'warning' THEN 0 ELSE 1 END,kind,created_at DESC,id LIMIT 25 OFFSET p_offset
    )
    SELECT jsonb_build_object(
      'checked_at',now(),'issues_total',(SELECT count(*) FROM filtered),'offset',p_offset,'page_size',25,
      'issues',coalesce((SELECT jsonb_agg(to_jsonb(page)) FROM page),'[]'),
      'summary',jsonb_build_object(
        'total_listings',(SELECT count(*) FROM public.annunci WHERE NOT is_demo),
        'available_listings',(SELECT count(*) FROM public.annunci WHERE NOT is_demo AND status='active' AND (expires_at IS NULL OR expires_at>now())),
        'total_users',(SELECT count(*) FROM public.profiles WHERE NOT is_demo),
        'listings_checked',(SELECT count(*) FROM listing_quality),'listings_with_issues',(SELECT count(*) FROM listing_quality WHERE cardinality(issues)>0),
        'profiles_checked',(SELECT count(*) FROM profile_quality),'profiles_with_issues',(SELECT count(*) FROM profile_quality WHERE cardinality(array_remove(issues,'telefono_facoltativo'))>0),
        'optional_phone_missing',(SELECT count(*) FROM profile_quality WHERE 'telefono_facoltativo'=ANY(issues)),
        'location_issues',(SELECT count(*) FROM listing_quality WHERE 'localita'=ANY(issues)),
        'pending_listings',(SELECT count(*) FROM public.annunci WHERE status='pending' AND NOT is_demo),
        'pending_bandi',(SELECT count(*) FROM public.bando_scouting_log WHERE status='pending'),
        'open_reports',(SELECT count(*) FROM public.conversation_reports WHERE status='open'),
        'expired_listings',(SELECT count(*) FROM public.annunci WHERE status='active' AND NOT is_demo AND expires_at<=now()),
        'expiring_listings',(SELECT count(*) FROM public.annunci WHERE status='active' AND NOT is_demo AND expires_at>now() AND expires_at<=now()+interval '14 days'),
        'support_unread',(SELECT count(*) FROM public.messaggi m JOIN public.conversazioni c ON c.id=m.conversazione_id WHERE c.is_support AND c.venditore_id=auth.uid() AND m.mittente_id<>auth.uid() AND coalesce(m.letto,false)=false),
        'paid_waiting',(SELECT count(*) FROM public.payments WHERE status='succeeded' AND activated_at IS NULL AND stripe_session_id LIKE 'cs_live_%'),
        'paid_activation_problem',(SELECT count(*) FROM public.payments p LEFT JOIN public.annunci a ON a.id=p.annuncio_id WHERE p.status='succeeded' AND p.activated_at IS NULL AND p.stripe_session_id LIKE 'cs_live_%' AND (a.id IS NULL OR a.status='active')),
        'gross_cents',(SELECT coalesce(sum(amount_cents),0) FROM public.payments WHERE status='succeeded' AND stripe_session_id LIKE 'cs_live_%'),
        'refunded_cents',(SELECT coalesce(sum(refunded_cents),0) FROM public.payments WHERE status='succeeded' AND stripe_session_id LIKE 'cs_live_%'),
        'new_users_30d',(SELECT count(*) FROM public.profiles WHERE NOT is_demo AND created_at>=now()-interval '30 days'),
        'new_listings_30d',(SELECT count(*) FROM public.annunci WHERE NOT is_demo AND status<>'deleted' AND created_at>=now()-interval '30 days'),
        'valuations_30d',(SELECT count(*) FROM public.valutatore_logs WHERE created_at>=now()-interval '30 days'),
        'old_valuation_model',(SELECT count(*) FROM public.valutatore_logs WHERE algoritmo_version IS DISTINCT FROM '2.0'),
        'bando_subscribers',(SELECT count(*) FROM public.bando_alerts),
        'last_candidate',(SELECT max(discovered_at) FROM public.bando_scouting_log),
        'last_anomaly_check',(SELECT max(checked_at) FROM public.admin_alerts_log),
        'unverified_email_bypass',(SELECT count(*) FROM auth.users u JOIN public.profiles p ON p.id=u.id WHERE NOT p.is_demo AND u.raw_user_meta_data->>'email_verification_mode'='bypass'),
        'locations_loaded',(SELECT count(*) FROM data_quality.locations)
      ),
      'automations',coalesce((SELECT jsonb_agg(t) FROM (
        SELECT j.jobname,j.schedule,j.active,r.status AS last_status,r.start_time AS last_started_at,r.end_time AS last_finished_at
        FROM cron.job j LEFT JOIN LATERAL (SELECT status,start_time,end_time FROM cron.job_run_details d WHERE d.jobid=j.jobid ORDER BY start_time DESC LIMIT 1) r ON true
        WHERE j.jobname IN ('scout-bandi-daily','admin-anomaly-check','engagement-reminders','weekly-buyer-digest','weekly-seller-stats','unfeature-expired-daily','auth-modal-opens-cleanup')
      ) t),'[]')
    ) INTO result;
    RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.admin_control_room(integer,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_control_room(integer,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_user_details(p_user_id uuid) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
BEGIN
    IF NOT data_quality.is_admin() THEN RAISE EXCEPTION 'Accesso amministratore richiesto' USING ERRCODE='42501'; END IF;
    RETURN (SELECT jsonb_build_object('id',u.id,'email',u.email,'nome',p.nome,'cognome',p.cognome,'telefono',p.telefono,'created_at',u.created_at,'last_sign_in_at',u.last_sign_in_at,
       'supabase_confirmed_at',u.email_confirmed_at,'verification_mode',u.raw_user_meta_data->>'email_verification_mode',
       'email_digest',p.email_digest,'email_stats',p.email_stats,
       'listings',(SELECT count(*) FROM public.annunci WHERE user_id=u.id AND status<>'deleted'),
       'alerts',(SELECT count(*) FROM public.alerts WHERE user_id=u.id),
       'valuations',(SELECT count(*) FROM public.valutatore_logs WHERE user_id=u.id))
     FROM auth.users u LEFT JOIN public.profiles p ON p.id=u.id WHERE u.id=p_user_id);
END $$;
REVOKE ALL ON FUNCTION public.admin_user_details(uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_user_details(uuid) TO authenticated;

REVOKE ALL ON FUNCTION data_quality.guard_profile(),data_quality.guard_listing(),data_quality.guard_alert(),data_quality.guard_chat(),data_quality.guard_event(),data_quality.guard_bando_subscription() FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.admin_user_directory(p_offset integer DEFAULT 0,p_limit integer DEFAULT 1000) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF NOT(coalesce(auth.role(),'')='service_role' OR data_quality.is_admin()) THEN RAISE EXCEPTION 'Accesso amministratore richiesto' USING ERRCODE='42501'; END IF;
 IF p_offset<0 OR p_limit NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Paginazione non valida'; END IF;
 RETURN jsonb_build_object('total',(SELECT count(*) FROM auth.users),'users',coalesce((SELECT jsonb_agg(to_jsonb(t)) FROM (
   SELECT u.id,u.email,u.created_at,u.last_sign_in_at,u.email_confirmed_at AS confirmed_at,
      p.nome,p.cognome,p.telefono,p.email_digest,p.email_stats,
      u.raw_user_meta_data->>'email_verification_mode' AS verification_mode,
      (SELECT count(*) FROM public.annunci a WHERE a.user_id=u.id AND a.status='active' AND (a.expires_at IS NULL OR a.expires_at>now())) AS annunci_active,
      (SELECT count(*) FROM public.annunci a WHERE a.user_id=u.id) AS annunci_total,
      (SELECT count(*) FROM public.messaggi m WHERE m.mittente_id=u.id) AS messaggi_inviati,
      (SELECT count(*) FROM public.conversazioni c WHERE c.venditore_id=u.id AND NOT c.is_support AND EXISTS(SELECT 1 FROM public.messaggi m WHERE m.conversazione_id=c.id)) AS contatti_ricevuti
   FROM auth.users u LEFT JOIN public.profiles p ON p.id=u.id ORDER BY u.created_at DESC,u.id LIMIT p_limit OFFSET p_offset
 ) t),'[]'));
END $$;
REVOKE ALL ON FUNCTION public.admin_user_directory(integer,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_user_directory(integer,integer) TO authenticated,service_role;

REVOKE SELECT ON public.profiles FROM anon,authenticated;
REVOKE SELECT(telefono,unsub_token) ON public.profiles FROM anon,authenticated;
GRANT SELECT(id,nome,cognome,avatar_url,created_at,is_admin,is_demo,email_digest,email_stats,vetrina_welcome_days) ON public.profiles TO authenticated;
GRANT SELECT(id,nome,cognome,avatar_url,created_at,is_demo) ON public.profiles TO anon;
CREATE OR REPLACE FUNCTION public.get_my_profile() RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT jsonb_build_object('nome',p.nome,'cognome',p.cognome,'telefono',p.telefono)
 FROM public.profiles p WHERE p.id=auth.uid()
$$;
REVOKE ALL ON FUNCTION public.get_my_profile() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

CREATE OR REPLACE FUNCTION data_quality.guard_valuation_context() RETURNS trigger
LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF NEW.landing_path IS NOT NULL AND (length(NEW.landing_path)>200 OR NEW.landing_path !~ '^/[a-zA-Z0-9/_-]*$') THEN NEW.landing_path:=NULL; END IF;
 IF NEW.referrer IS NOT NULL AND NEW.referrer !~ '^https?://[a-zA-Z0-9.-]+(:[0-9]{1,5})?$' THEN NEW.referrer:=NULL; END IF;
 IF NEW.utm_source IS NOT NULL AND NEW.utm_source !~ '^[a-z0-9_-]{1,80}$' THEN NEW.utm_source:=NULL; END IF;
 IF NEW.utm_medium IS NOT NULL AND NEW.utm_medium !~ '^[a-z0-9_-]{1,80}$' THEN NEW.utm_medium:=NULL; END IF;
 IF NEW.utm_campaign IS NOT NULL AND NEW.utm_campaign !~ '^[a-z0-9_-]{1,80}$' THEN NEW.utm_campaign:=NULL; END IF;
 RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS dq_valuation_context ON public.valutatore_logs;
CREATE TRIGGER dq_valuation_context BEFORE INSERT ON public.valutatore_logs FOR EACH ROW EXECUTE FUNCTION data_quality.guard_valuation_context();
REVOKE ALL ON FUNCTION data_quality.guard_valuation_context() FROM PUBLIC,anon,authenticated;

NOTIFY pgrst,'reload schema';
COMMIT;
