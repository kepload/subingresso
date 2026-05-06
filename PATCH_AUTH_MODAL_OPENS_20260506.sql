-- Auth modal opens tracking — full funnel by source (opzione B).
-- Idempotente. Pseudonimo by-design (no IP, no UA, dedup_key effimero per minuto).
-- Compliance GDPR: legittimo interesse art. 6.1.f, retention 90gg anonimi / 13 mesi signed-up.

-- ── Tabella ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.auth_modal_opens (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source            TEXT NOT NULL CHECK (source IN (
        'popup_vetrina','blog_promo','vendi_submit','nav_accedi',
        'salva_preferito','valutatore_create','welcome_popup',
        'tel_reveal','direct'
    )),
    opened_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    anon_session      TEXT NOT NULL,
    time_bucket       TEXT NOT NULL,                    -- "YYYYMMDDHHMM" UTC, granularità minuto
    signed_up_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ── Indici ───────────────────────────────────────────────
-- UNIQUE per dedup: (source, anon_session, time_bucket) → max 1 riga al minuto per (sorgente, sessione)
CREATE UNIQUE INDEX IF NOT EXISTS idx_amo_dedup
    ON public.auth_modal_opens(source, anon_session, time_bucket);
CREATE INDEX IF NOT EXISTS idx_amo_opened_at
    ON public.auth_modal_opens(opened_at);
CREATE INDEX IF NOT EXISTS idx_amo_source_opened_at
    ON public.auth_modal_opens(source, opened_at);
CREATE INDEX IF NOT EXISTS idx_amo_signed_up
    ON public.auth_modal_opens(signed_up_user_id)
    WHERE signed_up_user_id IS NOT NULL;

-- ── RLS ──────────────────────────────────────────────────
ALTER TABLE public.auth_modal_opens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS amo_insert_all ON public.auth_modal_opens;
CREATE POLICY amo_insert_all ON public.auth_modal_opens
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Nessuna policy SELECT/UPDATE/DELETE → leggibile/modificabile solo via RPC SECURITY DEFINER

-- ── RPC: linka anon_session al signup appena completato ──
CREATE OR REPLACE FUNCTION public.amo_link_signup(p_anon_session text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    IF auth.uid() IS NULL THEN RETURN; END IF;
    IF p_anon_session IS NULL OR length(p_anon_session) < 8 THEN RETURN; END IF;
    UPDATE public.auth_modal_opens
    SET signed_up_user_id = auth.uid()
    WHERE anon_session = p_anon_session
      AND signed_up_user_id IS NULL
      AND opened_at >= now() - interval '24 hours';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.amo_link_signup(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.amo_link_signup(text) TO authenticated;

-- ── RPC: breakdown per admin ─────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_signup_funnel_by_source(p_days int DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    is_adm boolean;
    res jsonb;
    total_opens int;
    total_signups int;
BEGIN
    SELECT coalesce((SELECT is_admin FROM public.profiles WHERE id = auth.uid()), false) INTO is_adm;
    IF NOT is_adm THEN
        RETURN jsonb_build_object('error', 'forbidden');
    END IF;

    -- Ridenominato il subquery in t1/t2 per evitare ambiguità di alias
    SELECT
        coalesce(jsonb_agg(t.row_obj ORDER BY (t.row_obj->>'opens')::int DESC), '[]'::jsonb),
        coalesce(sum((t.row_obj->>'opens')::int), 0),
        coalesce(sum((t.row_obj->>'signups')::int), 0)
    INTO res, total_opens, total_signups
    FROM (
        SELECT jsonb_build_object(
            'source', src,
            'opens', opens_count,
            'signups', signups_count,
            'conversion_pct', CASE WHEN opens_count > 0
                THEN ROUND(100.0 * signups_count / opens_count, 1)
                ELSE 0 END
        ) AS row_obj
        FROM (
            SELECT
                source AS src,
                COUNT(*)::int AS opens_count,
                COUNT(signed_up_user_id)::int AS signups_count
            FROM public.auth_modal_opens
            WHERE opened_at >= now() - (p_days || ' days')::interval
            GROUP BY source
        ) sub
    ) t;

    RETURN jsonb_build_object(
        'period_days', p_days,
        'total_opens', total_opens,
        'total_signups', total_signups,
        'rows', res
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_signup_funnel_by_source(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_signup_funnel_by_source(int) TO authenticated;

-- ── Cron retention (90gg anonimi, 395gg ≈ 13 mesi signed-up) ──
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
        IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'auth-modal-opens-cleanup') THEN
            PERFORM cron.unschedule('auth-modal-opens-cleanup');
        END IF;
        PERFORM cron.schedule(
            'auth-modal-opens-cleanup',
            '0 4 * * *',
            'DELETE FROM public.auth_modal_opens WHERE (signed_up_user_id IS NULL AND opened_at < now() - interval ''90 days'') OR (signed_up_user_id IS NOT NULL AND opened_at < now() - interval ''395 days'');'
        );
    END IF;
END $$;
