BEGIN;
CREATE OR REPLACE FUNCTION public.read_fair_review_summaries(p_fairs jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF jsonb_typeof(p_fairs) IS DISTINCT FROM 'array' THEN
        RAISE EXCEPTION 'Fiere non valide.' USING ERRCODE='22023';
    END IF;
    IF jsonb_array_length(p_fairs) NOT BETWEEN 1 AND 50 THEN
        RAISE EXCEPTION 'Fiere non valide.' USING ERRCODE='22023';
    END IF;
    RETURN (SELECT coalesce(jsonb_agg(to_jsonb(s)), '[]'::jsonb) FROM (
        SELECT f.kind, f.id, count(r.id) AS count, round(avg(r.rating),1) AS average
        FROM (SELECT DISTINCT kind,id FROM jsonb_to_recordset(p_fairs) AS x(kind text,id text)) f
        LEFT JOIN fair_review_private.reviews r ON r.fair_kind=f.kind AND r.fair_id=f.id
        WHERE (f.kind='catalog' AND EXISTS(SELECT 1 FROM fair_review_private.catalog c WHERE c.id=f.id))
           OR (f.kind='organizer' AND EXISTS(SELECT 1 FROM public.organizer_events e WHERE e.id::text=f.id AND e.status='published'))
        GROUP BY f.kind,f.id
    ) s);
END;
$$;
REVOKE ALL ON FUNCTION public.read_fair_review_summaries(jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_fair_review_summaries(jsonb) TO anon,authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
