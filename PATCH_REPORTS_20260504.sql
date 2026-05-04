-- ──────────────────────────────────────────────────────────────
-- PATCH: Segnalazioni conversazioni (DSA/GDPR compliance)
-- Data: 2026-05-04
-- ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.conversation_reports (
    id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversazione_id  uuid NOT NULL REFERENCES public.conversazioni(id) ON DELETE CASCADE,
    reporter_id       uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reason            text NOT NULL CHECK (reason IN ('scam','harassment','spam','other')),
    details           text,
    status            text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed')),
    created_at        timestamptz NOT NULL DEFAULT now(),
    reviewed_at       timestamptz,
    reviewed_by       uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    admin_notes       text
);

CREATE INDEX IF NOT EXISTS idx_conversation_reports_status
    ON public.conversation_reports(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_conversation_reports_conv
    ON public.conversation_reports(conversazione_id);

-- Anti-flood: max 1 report aperto per utente sulla stessa conv
CREATE UNIQUE INDEX IF NOT EXISTS uniq_open_report_per_user_conv
    ON public.conversation_reports(reporter_id, conversazione_id)
    WHERE status = 'open';

ALTER TABLE public.conversation_reports ENABLE ROW LEVEL SECURITY;

-- INSERT: solo partecipanti della conv segnalata, e reporter_id = se stesso
DROP POLICY IF EXISTS "Insert report partecipanti" ON public.conversation_reports;
CREATE POLICY "Insert report partecipanti" ON public.conversation_reports
    FOR INSERT WITH CHECK (
        auth.uid() = reporter_id
        AND EXISTS (
            SELECT 1 FROM public.conversazioni c
            WHERE c.id = conversazione_id
              AND (c.acquirente_id = auth.uid() OR c.venditore_id = auth.uid())
        )
    );

-- SELECT: solo admin
DROP POLICY IF EXISTS "Select admin reports" ON public.conversation_reports;
CREATE POLICY "Select admin reports" ON public.conversation_reports
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- UPDATE: solo admin
DROP POLICY IF EXISTS "Update admin reports" ON public.conversation_reports;
CREATE POLICY "Update admin reports" ON public.conversation_reports
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- RPC per il pannello admin (snella, joina dati utili senza esporre tutta la tabella profiles)
CREATE OR REPLACE FUNCTION public.admin_list_reports(p_status text DEFAULT 'open')
    RETURNS TABLE(
        id uuid,
        conversazione_id uuid,
        reporter_id uuid,
        reporter_name text,
        reporter_email text,
        reason text,
        details text,
        status text,
        created_at timestamptz,
        annuncio_id uuid,
        annuncio_titolo text,
        is_support boolean
    )
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = public
AS $$
    SELECT
        r.id,
        r.conversazione_id,
        r.reporter_id,
        coalesce(p.nome, '') || ' ' || coalesce(p.cognome, '') AS reporter_name,
        u.email AS reporter_email,
        r.reason,
        r.details,
        r.status,
        r.created_at,
        c.annuncio_id,
        a.titolo AS annuncio_titolo,
        c.is_support
    FROM public.conversation_reports r
    JOIN public.conversazioni c ON c.id = r.conversazione_id
    LEFT JOIN public.profiles p ON p.id = r.reporter_id
    LEFT JOIN auth.users  u ON u.id = r.reporter_id
    LEFT JOIN public.annunci a ON a.id = c.annuncio_id
    WHERE (
        SELECT is_admin FROM public.profiles WHERE id = auth.uid()
    ) = true
      AND (p_status IS NULL OR p_status = '' OR r.status = p_status)
    ORDER BY r.created_at DESC
    LIMIT 200;
$$;

REVOKE ALL ON FUNCTION public.admin_list_reports(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_list_reports(text) TO authenticated;

-- RPC update status (solo admin via SECURITY DEFINER + check)
CREATE OR REPLACE FUNCTION public.admin_update_report_status(
    p_report_id uuid,
    p_status    text,
    p_notes     text DEFAULT NULL
)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
AS $$
DECLARE
    v_is_admin boolean;
BEGIN
    SELECT is_admin INTO v_is_admin FROM public.profiles WHERE id = auth.uid();
    IF v_is_admin IS NOT TRUE THEN
        RAISE EXCEPTION 'unauthorized';
    END IF;
    IF p_status NOT IN ('open','reviewed','dismissed') THEN
        RAISE EXCEPTION 'invalid status';
    END IF;
    UPDATE public.conversation_reports
       SET status      = p_status,
           reviewed_at = CASE WHEN p_status = 'open' THEN NULL ELSE now() END,
           reviewed_by = CASE WHEN p_status = 'open' THEN NULL ELSE auth.uid() END,
           admin_notes = COALESCE(p_notes, admin_notes)
     WHERE id = p_report_id;
    RETURN FOUND;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_report_status(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_update_report_status(uuid, text, text) TO authenticated;
