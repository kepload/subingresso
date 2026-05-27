-- bando_scouting_log: campi per pagina pubblicata sul sito Subingresso
-- 27 mag 2026
--
-- Strategia: quando admin approva un bando, generiamo uno slug unico,
-- salviamo `published_slug` + `published_at`, e l'utente nella mail
-- riceve link a https://subingresso.it/bandi/<slug> invece del PDF
-- ufficiale. La pagina /bandi/<slug> è SSR su Vercel e include
-- cross-sell annunci + valutatore + CTA iscrizione.

ALTER TABLE public.bando_scouting_log
    ADD COLUMN IF NOT EXISTS published_slug text,
    ADD COLUMN IF NOT EXISTS published_at   timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bando_scouting_published_slug
    ON public.bando_scouting_log (published_slug)
    WHERE published_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bando_scouting_published_at
    ON public.bando_scouting_log (published_at DESC)
    WHERE published_at IS NOT NULL;

-- RPC aggiornata: include i nuovi campi nella response admin
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
        'reject_token', reject_token,
        'published_slug', published_slug,
        'published_at', published_at
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
        'sent_total_recipients', (SELECT COALESCE(SUM(sent_count), 0) FROM public.bando_scouting_log WHERE status = 'sent'),
        'published_pages', (SELECT COUNT(*) FROM public.bando_scouting_log WHERE published_slug IS NOT NULL)
    ) INTO v_counts;

    RETURN jsonb_build_object('counts', v_counts, 'rows', v_rows);
END;
$$;
