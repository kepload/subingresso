-- Solo lettura dell'inbox: nessun nuovo invio, trigger o modifica allo storico.
BEGIN;
CREATE INDEX IF NOT EXISTS msg_chat_order_idx
    ON public.messaggi (conversazione_id, created_at DESC, id DESC);

CREATE OR REPLACE FUNCTION public.get_chat_inbox(
    p_limit integer DEFAULT 40,
    p_before_at timestamptz DEFAULT NULL,
    p_before_id uuid DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $fn$
DECLARE
    actor uuid := auth.uid();
    page_size integer := greatest(1, least(coalesce(p_limit, 40), 100));
    rows jsonb;
    more boolean;
BEGIN
    IF actor IS NULL THEN
        RAISE EXCEPTION 'Accedi per leggere i messaggi' USING ERRCODE = '42501';
    END IF;
    IF (p_before_at IS NULL) <> (p_before_id IS NULL) THEN
        RAISE EXCEPTION 'Cursore non valido' USING ERRCODE = '22023';
    END IF;

    WITH scoped AS (
        SELECT c.id, c.annuncio_id, c.acquirente_id, c.venditore_id, c.is_support, c.created_at,
            coalesce(m.created_at, c.created_at) AS activity_at,
            CASE WHEN a.id IS NOT NULL AND a.status <> 'deleted' THEN jsonb_build_object(
                'id', a.id, 'titolo', a.titolo, 'img_urls', a.img_urls, 'prezzo', a.prezzo,
                'stato', a.stato, 'tipo', a.tipo, 'comune', a.comune) END AS annuncio,
            jsonb_build_object('id', p.id, 'nome', p.nome, 'cognome', p.cognome,
                'avatar_url', p.avatar_url) AS other_profile,
            CASE WHEN m.id IS NOT NULL THEN jsonb_build_object(
                'id', m.id, 'conversazione_id', m.conversazione_id, 'mittente_id', m.mittente_id,
                'testo', m.testo, 'created_at', m.created_at, 'letto', m.letto) END AS "lastMessage",
            (SELECT count(*) FROM public.messaggi unread
                WHERE unread.conversazione_id = c.id AND unread.mittente_id <> actor
                AND coalesce(unread.letto, false) = false) AS unread_count
        FROM public.conversazioni c
        LEFT JOIN public.annunci a ON a.id = c.annuncio_id
        LEFT JOIN public.profiles p ON p.id = CASE WHEN c.acquirente_id = actor
            THEN c.venditore_id ELSE c.acquirente_id END
        LEFT JOIN LATERAL (
            SELECT x.id, x.conversazione_id, x.mittente_id, x.testo, x.created_at, x.letto
            FROM public.messaggi x WHERE x.conversazione_id = c.id
            ORDER BY x.created_at DESC, x.id DESC LIMIT 1
        ) m ON true
        WHERE (c.acquirente_id = actor OR c.venditore_id = actor)
            AND (m.id IS NOT NULL OR c.is_support)
    ), page AS (
        SELECT * FROM scoped
        WHERE p_before_at IS NULL OR (activity_at, id) < (p_before_at, p_before_id)
        ORDER BY activity_at DESC, id DESC LIMIT page_size + 1
    ), numbered AS (
        SELECT *, row_number() OVER (ORDER BY activity_at DESC, id DESC) AS n FROM page
    )
    SELECT coalesce(jsonb_agg(to_jsonb(numbered) - 'n' ORDER BY activity_at DESC, id DESC)
            FILTER (WHERE n <= page_size), '[]'::jsonb), count(*) > page_size
    INTO rows, more FROM numbered;

    RETURN jsonb_build_object('items', rows, 'has_more', more,
        'is_admin', EXISTS(SELECT 1 FROM public.profiles p WHERE p.id = actor AND p.is_admin),
        'support_admin_id', public.support_admin_id());
END $fn$;
REVOKE ALL ON FUNCTION public.get_chat_inbox(integer, timestamptz, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_chat_inbox(integer, timestamptz, uuid) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
