-- Pannello admin "Avvisi Bandi" — mostra iscritti email al lead magnet del blog.
-- 27 mag 2026

CREATE OR REPLACE FUNCTION public.admin_bando_alerts_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin boolean;
    v_total int;
    v_today int;
    v_7d int;
    v_30d int;
    v_by_regione jsonb;
    v_by_source jsonb;
    v_recent jsonb;
BEGIN
    SELECT COALESCE(is_admin, false) INTO v_is_admin
    FROM public.profiles
    WHERE id = auth.uid();

    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
    END IF;

    SELECT COUNT(*) INTO v_total FROM public.bando_alerts;
    SELECT COUNT(*) INTO v_today FROM public.bando_alerts WHERE created_at > now() - interval '1 day';
    SELECT COUNT(*) INTO v_7d FROM public.bando_alerts WHERE created_at > now() - interval '7 days';
    SELECT COUNT(*) INTO v_30d FROM public.bando_alerts WHERE created_at > now() - interval '30 days';

    SELECT COALESCE(jsonb_agg(t ORDER BY (t->>'iscritti')::int DESC), '[]'::jsonb) INTO v_by_regione
    FROM (
        SELECT jsonb_build_object('regione', regione, 'iscritti', COUNT(*)) AS t
        FROM public.bando_alerts
        GROUP BY regione
    ) sub;

    SELECT COALESCE(jsonb_agg(t ORDER BY (t->>'iscritti')::int DESC), '[]'::jsonb) INTO v_by_source
    FROM (
        SELECT jsonb_build_object('source', COALESCE(source, 'unknown'), 'iscritti', COUNT(*)) AS t
        FROM public.bando_alerts
        GROUP BY source
    ) sub;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'email', email,
        'regione', regione,
        'source', source,
        'created_at', created_at
    ) ORDER BY created_at DESC), '[]'::jsonb) INTO v_recent
    FROM (
        SELECT email, regione, source, created_at
        FROM public.bando_alerts
        ORDER BY created_at DESC
        LIMIT 20
    ) sub;

    RETURN jsonb_build_object(
        'total', v_total,
        'today', v_today,
        'last_7d', v_7d,
        'last_30d', v_30d,
        'by_regione', v_by_regione,
        'by_source', v_by_source,
        'recent', v_recent
    );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_bando_alerts_stats() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_bando_alerts_stats() TO authenticated;
