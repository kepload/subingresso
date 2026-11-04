BEGIN;
CREATE SCHEMA IF NOT EXISTS fair_review_private;
REVOKE ALL ON SCHEMA fair_review_private FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS fair_review_private.catalog (
    id text PRIMARY KEY
);
CREATE TABLE IF NOT EXISTS fair_review_private.reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    fair_kind text NOT NULL CHECK (fair_kind IN ('catalog','organizer')),
    fair_id text NOT NULL CHECK (length(fair_id) BETWEEN 1 AND 200),
    visit_month date NOT NULL CHECK (extract(day FROM visit_month) = 1),
    edition_year integer GENERATED ALWAYS AS (extract(year FROM visit_month)::integer) STORED,
    sector text NOT NULL CHECK (sector IN ('alimentare','abbigliamento','artigianato','casa','altro')),
    rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
    organization smallint CHECK (organization BETWEEN 1 AND 5),
    turnout smallint CHECK (turnout BETWEEN 1 AND 5),
    value smallint CHECK (value BETWEEN 1 AND 5),
    body text NOT NULL CHECK (length(btrim(body)) BETWEEN 40 AND 2000),
    recommend text NOT NULL CHECK (recommend IN ('yes','maybe','no')),
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (user_id, fair_kind, fair_id, edition_year)
);
CREATE INDEX IF NOT EXISTS fair_reviews_lookup ON fair_review_private.reviews(fair_kind,fair_id,created_at DESC,id);
ALTER TABLE fair_review_private.catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE fair_review_private.reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA fair_review_private FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.read_fair_reviews(p_kind text, p_id text, p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE result jsonb;
BEGIN
    IF p_kind IS NULL OR p_kind NOT IN ('catalog','organizer') OR p_id IS NULL OR length(p_id) NOT BETWEEN 1 AND 200 OR p_offset IS NULL OR p_offset NOT BETWEEN 0 AND 10000 THEN
        RAISE EXCEPTION 'Fiera non valida.' USING ERRCODE = '22023';
    END IF;
    SELECT jsonb_build_object('count', count(*), 'average', round(avg(r.rating),1),
        'organization',round(avg(r.organization),1),'turnout',round(avg(r.turnout),1),'value',round(avg(r.value),1))
        INTO result FROM fair_review_private.reviews r WHERE r.fair_kind=p_kind AND r.fair_id=p_id;
    RETURN result || jsonb_build_object('reviews',coalesce((
        SELECT jsonb_agg(to_jsonb(listed)) FROM (
            SELECT r.id, coalesce(nullif(split_part(btrim(p.nome),' ',1),''),'Ambulante') AS author,
                r.visit_month,r.sector,r.rating,r.organization,r.turnout,r.value,r.body,r.recommend,r.created_at
            FROM fair_review_private.reviews r LEFT JOIN public.profiles p ON p.id=r.user_id
            WHERE r.fair_kind=p_kind AND r.fair_id=p_id ORDER BY r.created_at DESC,r.id DESC LIMIT 10 OFFSET p_offset
        ) listed), '[]'::jsonb));
END;
$$;

CREATE OR REPLACE FUNCTION public.publish_fair_review(p_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE uid uuid := auth.uid(); review_id uuid; month_date date; kind text := p_data->>'kind'; fid text := p_data->>'fair_id';
BEGIN
    IF uid IS NULL THEN RAISE EXCEPTION 'Accedi per pubblicare.' USING ERRCODE = '42501'; END IF;
    IF p_data->>'confirmed' IS DISTINCT FROM 'true' THEN RAISE EXCEPTION 'Conferma di aver partecipato con il tuo banco.' USING ERRCODE = '22023'; END IF;
    IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=uid AND nullif(btrim(telefono),'') IS NOT NULL) THEN
        RAISE EXCEPTION 'Completa il telefono nel tuo profilo prima di pubblicare.' USING ERRCODE = '22023';
    END IF;
    IF kind='catalog' THEN
        IF NOT EXISTS(SELECT 1 FROM fair_review_private.catalog WHERE id=fid) THEN RAISE EXCEPTION 'Fiera non disponibile.' USING ERRCODE='22023'; END IF;
    ELSIF kind='organizer' THEN
        IF NOT EXISTS(SELECT 1 FROM public.organizer_events WHERE id::text=fid AND status='published' AND start_date <= (now() AT TIME ZONE 'Europe/Rome')::date) THEN
            RAISE EXCEPTION 'Puoi recensire solo un evento pubblicato e già iniziato.' USING ERRCODE='22023';
        END IF;
    ELSE RAISE EXCEPTION 'Fiera non valida.' USING ERRCODE='22023'; END IF;
    IF coalesce(p_data->>'visit_month','') !~ '^20[0-9]{2}-(0[1-9]|1[0-2])-01$' THEN RAISE EXCEPTION 'Scegli il mese della partecipazione.' USING ERRCODE='22023'; END IF;
    month_date := (p_data->>'visit_month')::date;
    IF month_date > date_trunc('month',now() AT TIME ZONE 'Europe/Rome')::date THEN RAISE EXCEPTION 'La partecipazione non può essere futura.' USING ERRCODE='22023'; END IF;
    IF kind='organizer' AND NOT EXISTS(SELECT 1 FROM public.organizer_events WHERE id::text=fid AND month_date BETWEEN date_trunc('month',start_date)::date AND date_trunc('month',coalesce(end_date,start_date))::date) THEN
        RAISE EXCEPTION 'Il mese non corrisponde alle date di questo evento.' USING ERRCODE='22023';
    END IF;
    PERFORM pg_advisory_xact_lock(hashtextextended(uid::text,0));
    IF (SELECT count(*) FROM fair_review_private.reviews WHERE user_id=uid AND created_at > now()-interval '24 hours') >= 10 THEN
        RAISE EXCEPTION 'Hai già pubblicato molte recensioni oggi. Riprova domani.' USING ERRCODE='P0001';
    END IF;
    INSERT INTO fair_review_private.reviews(user_id,fair_kind,fair_id,visit_month,sector,rating,organization,turnout,value,body,recommend)
    VALUES(uid,kind,fid,month_date,p_data->>'sector',(p_data->>'rating')::smallint,(p_data->>'organization')::smallint,(p_data->>'turnout')::smallint,(p_data->>'value')::smallint,btrim(p_data->>'body'),p_data->>'recommend')
    RETURNING id INTO review_id;
    RETURN jsonb_build_object('id',review_id);
END;
$$;
REVOKE ALL ON FUNCTION public.read_fair_reviews(text,text,integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.publish_fair_review(jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.read_fair_reviews(text,text,integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.publish_fair_review(jsonb) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
