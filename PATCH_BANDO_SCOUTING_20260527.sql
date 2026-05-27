-- AI Scout Bandi: tabella + RPC per scoping admin
-- 27 mag 2026

-- ── Tabella scouting log ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.bando_scouting_log (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    regione         text NOT NULL,
    titolo          text NOT NULL,
    link            text NOT NULL,
    fonte           text NOT NULL DEFAULT 'gemini',
    ai_summary      text,
    status          text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'sent', 'failed')),
    discovered_at   timestamptz NOT NULL DEFAULT now(),
    reviewed_at     timestamptz,
    reviewed_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    sent_at         timestamptz,
    sent_count      int DEFAULT 0,
    approve_token   uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    reject_token    uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    -- hash unico per dedup automatica scoperte ripetute (stesso link nella stessa regione)
    content_hash    text NOT NULL,
    UNIQUE (regione, content_hash)
);

CREATE INDEX IF NOT EXISTS idx_bando_scouting_status ON public.bando_scouting_log (status, discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_bando_scouting_regione ON public.bando_scouting_log (regione, discovered_at DESC);

-- RLS: bloccata da fuori. Solo edge functions (service_role) e admin via RPC.
ALTER TABLE public.bando_scouting_log ENABLE ROW LEVEL SECURITY;
-- Nessuna policy → tutto bloccato per anon/authenticated. service_role bypassa RLS by design.

-- ── RPC admin: lista pending ──────────────────────────────
CREATE OR REPLACE FUNCTION public.admin_bando_scouting_list(p_status text DEFAULT 'pending', p_limit int DEFAULT 50)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin boolean;
    v_rows jsonb;
    v_counts jsonb;
BEGIN
    SELECT COALESCE(is_admin, false) INTO v_is_admin
    FROM public.profiles WHERE id = auth.uid();
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
    END IF;

    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', id,
        'regione', regione,
        'titolo', titolo,
        'link', link,
        'fonte', fonte,
        'ai_summary', ai_summary,
        'status', status,
        'discovered_at', discovered_at,
        'reviewed_at', reviewed_at,
        'sent_at', sent_at,
        'sent_count', sent_count,
        'approve_token', approve_token,
        'reject_token', reject_token
    ) ORDER BY discovered_at DESC), '[]'::jsonb) INTO v_rows
    FROM (
        SELECT * FROM public.bando_scouting_log
        WHERE (p_status IS NULL OR status = p_status)
        ORDER BY discovered_at DESC
        LIMIT p_limit
    ) sub;

    SELECT jsonb_build_object(
        'pending',  (SELECT COUNT(*) FROM public.bando_scouting_log WHERE status = 'pending'),
        'approved', (SELECT COUNT(*) FROM public.bando_scouting_log WHERE status IN ('approved','sent')),
        'rejected', (SELECT COUNT(*) FROM public.bando_scouting_log WHERE status = 'rejected'),
        'sent_total_recipients', (SELECT COALESCE(SUM(sent_count), 0) FROM public.bando_scouting_log WHERE status = 'sent')
    ) INTO v_counts;

    RETURN jsonb_build_object('counts', v_counts, 'rows', v_rows);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_bando_scouting_list(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_bando_scouting_list(text, int) TO authenticated;

-- ── RPC admin: approva/scarta da dashboard (alternativa al link mail) ──
CREATE OR REPLACE FUNCTION public.admin_bando_scouting_decide(p_id uuid, p_action text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_is_admin boolean;
    v_row record;
BEGIN
    SELECT COALESCE(is_admin, false) INTO v_is_admin
    FROM public.profiles WHERE id = auth.uid();
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'admin only' USING ERRCODE = '42501';
    END IF;
    IF p_action NOT IN ('approve','reject') THEN
        RAISE EXCEPTION 'invalid action';
    END IF;

    SELECT * INTO v_row FROM public.bando_scouting_log WHERE id = p_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'not found';
    END IF;
    IF v_row.status NOT IN ('pending') THEN
        RAISE EXCEPTION 'already %', v_row.status;
    END IF;

    IF p_action = 'reject' THEN
        UPDATE public.bando_scouting_log
        SET status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
        WHERE id = p_id;
        RETURN jsonb_build_object('ok', true, 'action', 'rejected');
    ELSE
        -- approve: marca approved. L'invio mail effettivo è fatto da bando-action edge function
        -- (che ha service_role per accedere a bando_alerts senza RLS pain).
        UPDATE public.bando_scouting_log
        SET status = 'approved', reviewed_at = now(), reviewed_by = auth.uid()
        WHERE id = p_id;
        RETURN jsonb_build_object('ok', true, 'action', 'approved', 'next', 'edge function trigger broadcast');
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_bando_scouting_decide(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_bando_scouting_decide(uuid, text) TO authenticated;
