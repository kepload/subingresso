BEGIN;
-- Preserve every existing review and its original month. New contributions
-- may identify only a year, or one of several documented dates in that year.
ALTER TABLE fair_review_private.catalog ADD COLUMN IF NOT EXISTS editions jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE fair_review_private.reviews ALTER COLUMN visit_month DROP NOT NULL;
ALTER TABLE fair_review_private.reviews ALTER COLUMN recommend DROP NOT NULL;
ALTER TABLE fair_review_private.reviews ADD COLUMN IF NOT EXISTS visit_year integer CHECK (visit_year BETWEEN 1900 AND 9999);
ALTER TABLE fair_review_private.reviews ADD COLUMN IF NOT EXISTS visit_start date;
ALTER TABLE fair_review_private.reviews ADD COLUMN IF NOT EXISTS visit_end date;
ALTER TABLE fair_review_private.reviews ADD COLUMN IF NOT EXISTS edition_key text;
ALTER TABLE fair_review_private.reviews DROP CONSTRAINT IF EXISTS reviews_body_check;
ALTER TABLE fair_review_private.reviews ADD CONSTRAINT reviews_body_check CHECK (length(body) <= 2000);
ALTER TABLE fair_review_private.reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fair_kind_fair_id_edition_year_key;
CREATE UNIQUE INDEX IF NOT EXISTS fair_review_edition_unique ON fair_review_private.reviews(user_id,fair_kind,fair_id,(coalesce(edition_key,'year:'||edition_year::text)));

CREATE OR REPLACE FUNCTION public.read_fair_reviews(p_kind text,p_id text,p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE result jsonb;
BEGIN
    IF p_kind IS NULL OR p_kind NOT IN ('catalog','organizer') OR p_id IS NULL OR length(p_id) NOT BETWEEN 1 AND 200 OR p_offset IS NULL OR p_offset NOT BETWEEN 0 AND 10000 THEN
        RAISE EXCEPTION 'Fiera non valida.' USING ERRCODE='22023';
    END IF;
    SELECT jsonb_build_object('count',count(*),'average',round(avg(r.rating),1),'organization',round(avg(r.organization),1),'turnout',round(avg(r.turnout),1),'value',round(avg(r.value),1))
        INTO result FROM fair_review_private.reviews r WHERE r.fair_kind=p_kind AND r.fair_id=p_id;
    RETURN result || jsonb_build_object('reviews',coalesce((SELECT jsonb_agg(to_jsonb(listed)) FROM (
        SELECT r.id,coalesce(nullif(split_part(btrim(p.nome),' ',1),''),'Ambulante') AS author,r.visit_month,
            coalesce(r.visit_year,r.edition_year) AS visit_year,r.visit_start,r.visit_end,
            r.sector,r.rating,r.organization,r.turnout,r.value,r.body,r.recommend,r.created_at
        FROM fair_review_private.reviews r LEFT JOIN public.profiles p ON p.id=r.user_id
        WHERE r.fair_kind=p_kind AND r.fair_id=p_id ORDER BY r.created_at DESC,r.id DESC LIMIT 10 OFFSET p_offset
    ) listed),'[]'::jsonb));
END;
$$;

CREATE OR REPLACE FUNCTION public.publish_fair_review(p_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE uid uuid:=auth.uid(); review_id uuid; month_date date; kind text:=p_data->>'kind'; fid text:=p_data->>'fair_id';
    selected_key text:=p_data->>'edition_key'; selected_year integer; start_date date; end_date date;
    known jsonb; selected jsonb; now_date date:=(now() AT TIME ZONE 'Europe/Rome')::date;
BEGIN
    IF uid IS NULL THEN RAISE EXCEPTION 'Accedi per pubblicare.' USING ERRCODE='42501'; END IF;
    IF p_data->>'confirmed' IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Conferma di aver partecipato.' USING ERRCODE='22023'; END IF;
    IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=uid AND nullif(btrim(telefono),'') IS NOT NULL) THEN
        RAISE EXCEPTION 'Aggiungi il telefono nel tuo profilo.' USING ERRCODE='22023';
    END IF;
    IF kind='catalog' THEN
        SELECT editions INTO known FROM fair_review_private.catalog WHERE id=fid;
        IF NOT FOUND THEN RAISE EXCEPTION 'Fiera non disponibile.' USING ERRCODE='22023'; END IF;
    ELSIF kind='organizer' THEN
        SELECT jsonb_build_array(jsonb_build_object('start',e.start_date::text,'end',coalesce(e.end_date,e.start_date)::text)) INTO known
        FROM public.organizer_events e WHERE e.id::text=fid AND e.status='published' AND e.start_date<=now_date;
        IF NOT FOUND THEN RAISE EXCEPTION 'Questa fiera non si è ancora svolta.' USING ERRCODE='22023'; END IF;
    ELSE RAISE EXCEPTION 'Fiera non valida.' USING ERRCODE='22023'; END IF;
    IF selected_key IS NULL AND coalesce(p_data->>'visit_month','') ~ '^(19|20)[0-9]{2}-(0[1-9]|1[0-2])-01$' THEN
        month_date:=(p_data->>'visit_month')::date;
        IF month_date>date_trunc('month',now_date)::date THEN RAISE EXCEPTION 'Scegli un’edizione già svolta.' USING ERRCODE='22023'; END IF;
        IF kind='organizer' AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(known) e WHERE month_date BETWEEN date_trunc('month',(e->>'start')::date)::date AND date_trunc('month',(e->>'end')::date)::date) THEN
            RAISE EXCEPTION 'Scegli l’edizione di questo evento.' USING ERRCODE='22023';
        END IF;
        selected_key:='year:'||extract(year FROM month_date)::integer::text;
    END IF;
    IF selected_key ~ '^year:(19|20)[0-9]{2}$' THEN
        selected_year:=substring(selected_key FROM 6)::integer;
        IF selected_year>extract(year FROM now_date)::integer THEN RAISE EXCEPTION 'Scegli un’edizione già svolta.' USING ERRCODE='22023'; END IF;
        IF EXISTS(SELECT 1 FROM jsonb_array_elements(known) e WHERE substring(e->>'start',1,4)::integer=selected_year)
            AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(known) e WHERE substring(e->>'start',1,4)::integer=selected_year AND (e->>'start')::date<=now_date) THEN
            RAISE EXCEPTION 'Questa edizione non si è ancora svolta.' USING ERRCODE='22023';
        END IF;
        IF kind='organizer' AND NOT EXISTS(SELECT 1 FROM jsonb_array_elements(known) e WHERE substring(e->>'start',1,4)::integer=selected_year) THEN
            RAISE EXCEPTION 'Scegli l’edizione di questo evento.' USING ERRCODE='22023';
        END IF;
    ELSIF selected_key LIKE 'date:%' THEN
        SELECT e INTO selected FROM jsonb_array_elements(known) e WHERE 'date:'||(e->>'start')||':'||(e->>'end')=selected_key;
        IF selected IS NULL OR (selected->>'start')::date>now_date THEN RAISE EXCEPTION 'Scegli un’edizione già svolta.' USING ERRCODE='22023'; END IF;
        start_date:=(selected->>'start')::date; end_date:=(selected->>'end')::date;
        selected_year:=extract(year FROM start_date)::integer;
        month_date:=date_trunc('month',start_date)::date;
    ELSE RAISE EXCEPTION 'Scegli l’edizione.' USING ERRCODE='22023'; END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended(uid::text,0));
    IF EXISTS(SELECT 1 FROM fair_review_private.reviews r WHERE r.user_id=uid AND r.fair_kind=kind AND r.fair_id=fid AND coalesce(r.visit_year,r.edition_year)=selected_year
        AND (selected_key LIKE 'year:%' OR r.edition_key IS NULL OR r.edition_key LIKE 'year:%' OR r.edition_key=selected_key)) THEN
        RAISE EXCEPTION 'Hai già recensito questa edizione.' USING ERRCODE='23505';
    END IF;
    IF (SELECT count(*) FROM fair_review_private.reviews WHERE user_id=uid AND created_at>now()-interval '24 hours')>=10 THEN
        RAISE EXCEPTION 'Riprova domani.' USING ERRCODE='P0001';
    END IF;
    INSERT INTO fair_review_private.reviews(user_id,fair_kind,fair_id,visit_month,visit_year,visit_start,visit_end,edition_key,sector,rating,organization,turnout,value,body,recommend)
    VALUES(uid,kind,fid,month_date,selected_year,start_date,end_date,selected_key,coalesce(p_data->>'sector','altro'),(p_data->>'rating')::smallint,
        (p_data->>'organization')::smallint,(p_data->>'turnout')::smallint,(p_data->>'value')::smallint,btrim(coalesce(p_data->>'body','')),p_data->>'recommend') RETURNING id INTO review_id;
    RETURN jsonb_build_object('id',review_id);
END;
$$;
NOTIFY pgrst,'reload schema';
COMMIT;
