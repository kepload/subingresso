-- ============================================================================
--  PATCH_SELLER_DASHBOARD_20260509.sql
--  Hero dashboard venditore + milestones (achievement) + regional demand
--  Idempotente, riapplicabile.
--
--  Componenti:
--    1. Tabella listing_milestones (achievement persistenti)
--    2. Trigger su annunci (views/saves) e messaggi (first/5th)
--    3. RPC dashboard_seller_summary() — hero card + regional demand
--    4. RPC unseen_milestones() / mark_milestone_seen() / mark_all_milestones_seen()
--
--  Privacy: regional_alerts e regional_active_buyers sono aggregati (no IDs).
-- ============================================================================

-- ──────────────── 1. listing_milestones table ────────────────
CREATE TABLE IF NOT EXISTS public.listing_milestones (
    id bigserial PRIMARY KEY,
    annuncio_id uuid NOT NULL REFERENCES public.annunci(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    kind text NOT NULL CHECK (kind IN (
        'first_view','views_10','views_50','views_100','views_500',
        'first_save','saves_5','saves_10',
        'first_message','msgs_5'
    )),
    triggered_at timestamptz NOT NULL DEFAULT now(),
    seen_at timestamptz,
    UNIQUE (annuncio_id, kind)
);

CREATE INDEX IF NOT EXISTS idx_milestones_user_unseen
ON public.listing_milestones (user_id, triggered_at DESC)
WHERE seen_at IS NULL;

ALTER TABLE public.listing_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "milestones_owner_select" ON public.listing_milestones;
CREATE POLICY "milestones_owner_select" ON public.listing_milestones
    FOR SELECT USING (auth.uid() = user_id);

-- INSERT/UPDATE solo via trigger SECURITY DEFINER e RPC. Niente policy diretta.

GRANT SELECT ON public.listing_milestones TO authenticated;

-- ──────────────── 2. Trigger: views + saved milestones ────────────────
CREATE OR REPLACE FUNCTION public.check_listing_milestones()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NEW.user_id IS NULL THEN RETURN NEW; END IF;

    -- View thresholds
    IF NEW.visualizzazioni >= 1 AND COALESCE(OLD.visualizzazioni, 0) < 1 THEN
        INSERT INTO public.listing_milestones (annuncio_id, user_id, kind)
        VALUES (NEW.id, NEW.user_id, 'first_view') ON CONFLICT DO NOTHING;
    END IF;
    IF NEW.visualizzazioni >= 10 AND COALESCE(OLD.visualizzazioni, 0) < 10 THEN
        INSERT INTO public.listing_milestones (annuncio_id, user_id, kind)
        VALUES (NEW.id, NEW.user_id, 'views_10') ON CONFLICT DO NOTHING;
    END IF;
    IF NEW.visualizzazioni >= 50 AND COALESCE(OLD.visualizzazioni, 0) < 50 THEN
        INSERT INTO public.listing_milestones (annuncio_id, user_id, kind)
        VALUES (NEW.id, NEW.user_id, 'views_50') ON CONFLICT DO NOTHING;
    END IF;
    IF NEW.visualizzazioni >= 100 AND COALESCE(OLD.visualizzazioni, 0) < 100 THEN
        INSERT INTO public.listing_milestones (annuncio_id, user_id, kind)
        VALUES (NEW.id, NEW.user_id, 'views_100') ON CONFLICT DO NOTHING;
    END IF;
    IF NEW.visualizzazioni >= 500 AND COALESCE(OLD.visualizzazioni, 0) < 500 THEN
        INSERT INTO public.listing_milestones (annuncio_id, user_id, kind)
        VALUES (NEW.id, NEW.user_id, 'views_500') ON CONFLICT DO NOTHING;
    END IF;

    -- Saved thresholds
    IF NEW.saved_count >= 1 AND COALESCE(OLD.saved_count, 0) < 1 THEN
        INSERT INTO public.listing_milestones (annuncio_id, user_id, kind)
        VALUES (NEW.id, NEW.user_id, 'first_save') ON CONFLICT DO NOTHING;
    END IF;
    IF NEW.saved_count >= 5 AND COALESCE(OLD.saved_count, 0) < 5 THEN
        INSERT INTO public.listing_milestones (annuncio_id, user_id, kind)
        VALUES (NEW.id, NEW.user_id, 'saves_5') ON CONFLICT DO NOTHING;
    END IF;
    IF NEW.saved_count >= 10 AND COALESCE(OLD.saved_count, 0) < 10 THEN
        INSERT INTO public.listing_milestones (annuncio_id, user_id, kind)
        VALUES (NEW.id, NEW.user_id, 'saves_10') ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'check_listing_milestones failed: %', SQLERRM;
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_check_listing_milestones ON public.annunci;
CREATE TRIGGER trg_check_listing_milestones
AFTER UPDATE ON public.annunci
FOR EACH ROW
WHEN (
    OLD.visualizzazioni IS DISTINCT FROM NEW.visualizzazioni
    OR OLD.saved_count IS DISTINCT FROM NEW.saved_count
)
EXECUTE FUNCTION public.check_listing_milestones();

-- ──────────────── 3. Trigger: first_message + msgs_5 ────────────────
CREATE OR REPLACE FUNCTION public.check_message_milestone()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_owner uuid;
    v_annuncio uuid;
    v_count int;
BEGIN
    SELECT venditore_id, annuncio_id INTO v_owner, v_annuncio
    FROM public.conversazioni WHERE id = NEW.conversazione_id;

    IF v_owner IS NULL OR v_annuncio IS NULL THEN RETURN NEW; END IF;
    IF NEW.mittente_id = v_owner THEN RETURN NEW; END IF;

    SELECT COUNT(*) INTO v_count
    FROM public.messaggi m
    JOIN public.conversazioni c ON c.id = m.conversazione_id
    WHERE c.annuncio_id = v_annuncio AND m.mittente_id IS DISTINCT FROM v_owner;

    IF v_count = 1 THEN
        INSERT INTO public.listing_milestones (annuncio_id, user_id, kind)
        VALUES (v_annuncio, v_owner, 'first_message') ON CONFLICT DO NOTHING;
    ELSIF v_count = 5 THEN
        INSERT INTO public.listing_milestones (annuncio_id, user_id, kind)
        VALUES (v_annuncio, v_owner, 'msgs_5') ON CONFLICT DO NOTHING;
    END IF;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'check_message_milestone failed: %', SQLERRM;
    RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_check_message_milestone ON public.messaggi;
CREATE TRIGGER trg_check_message_milestone
AFTER INSERT ON public.messaggi
FOR EACH ROW EXECUTE FUNCTION public.check_message_milestone();

-- ──────────────── 4. RPC dashboard_seller_summary ────────────────
DROP FUNCTION IF EXISTS public.dashboard_seller_summary();
CREATE OR REPLACE FUNCTION public.dashboard_seller_summary()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_listings jsonb;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'unauthorized');
    END IF;

    WITH active_listings AS (
        SELECT
            a.id, a.titolo, a.comune, a.regione, a.tipo, a.prezzo,
            a.img_urls, a.created_at, a.expires_at, a.featured,
            a.featured_until, a.featured_tier, a.user_id,
            a.visualizzazioni AS views_total,
            a.saved_count AS saved_total
        FROM public.annunci a
        WHERE a.user_id = v_user_id AND a.status = 'active'
        ORDER BY a.visualizzazioni DESC, a.created_at DESC
    )
    SELECT jsonb_agg(jsonb_build_object(
        'id', al.id,
        'titolo', al.titolo,
        'comune', al.comune,
        'regione', al.regione,
        'tipo', al.tipo,
        'prezzo', al.prezzo,
        'img_urls', al.img_urls,
        'created_at', al.created_at,
        'expires_at', al.expires_at,
        'featured', al.featured,
        'featured_until', al.featured_until,
        'featured_tier', al.featured_tier,
        'views_total', al.views_total,
        'saved_total', al.saved_total,
        'saved_7d', (
            SELECT COUNT(*) FROM public.saved_listings sl
            WHERE sl.annuncio_id = al.id
              AND sl.created_at > now() - interval '7 days'
        ),
        'msg_total', (
            SELECT COUNT(*) FROM public.messaggi m
            JOIN public.conversazioni c ON c.id = m.conversazione_id
            WHERE c.annuncio_id = al.id
              AND m.mittente_id IS DISTINCT FROM al.user_id
        ),
        'msg_7d', (
            SELECT COUNT(*) FROM public.messaggi m
            JOIN public.conversazioni c ON c.id = m.conversazione_id
            WHERE c.annuncio_id = al.id
              AND m.mittente_id IS DISTINCT FROM al.user_id
              AND m.created_at > now() - interval '7 days'
        ),
        'msg_unread', (
            SELECT COUNT(*) FROM public.messaggi m
            JOIN public.conversazioni c ON c.id = m.conversazione_id
            WHERE c.annuncio_id = al.id
              AND m.mittente_id IS DISTINCT FROM al.user_id
              AND m.letto = false
        ),
        'regional_alerts', (
            SELECT COUNT(*) FROM public.bando_alerts ba
            WHERE ba.regione = al.regione
        ),
        'regional_active_buyers', (
            SELECT COUNT(DISTINCT c.acquirente_id)
            FROM public.conversazioni c
            JOIN public.annunci an ON an.id = c.annuncio_id
            WHERE an.regione = al.regione
              AND c.created_at > now() - interval '30 days'
              AND c.acquirente_id IS DISTINCT FROM al.user_id
        )
    )) INTO v_listings
    FROM active_listings al;

    RETURN jsonb_build_object(
        'listings', COALESCE(v_listings, '[]'::jsonb)
    );
END $$;

GRANT EXECUTE ON FUNCTION public.dashboard_seller_summary() TO authenticated;

-- ──────────────── 5. RPC unseen_milestones ────────────────
DROP FUNCTION IF EXISTS public.unseen_milestones();
CREATE OR REPLACE FUNCTION public.unseen_milestones()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_rows jsonb;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'unauthorized');
    END IF;

    WITH top_unseen AS (
        SELECT m.id, m.kind, m.annuncio_id, m.triggered_at,
               a.titolo, a.comune
        FROM public.listing_milestones m
        JOIN public.annunci a ON a.id = m.annuncio_id
        WHERE m.user_id = v_user_id AND m.seen_at IS NULL
        ORDER BY m.triggered_at DESC
        LIMIT 10
    )
    SELECT jsonb_agg(jsonb_build_object(
        'id', id,
        'kind', kind,
        'annuncio_id', annuncio_id,
        'titolo', titolo,
        'comune', comune,
        'triggered_at', triggered_at
    )) INTO v_rows
    FROM top_unseen;

    RETURN jsonb_build_object('rows', COALESCE(v_rows, '[]'::jsonb));
END $$;

GRANT EXECUTE ON FUNCTION public.unseen_milestones() TO authenticated;

-- ──────────────── 6. RPC mark_milestone_seen ────────────────
DROP FUNCTION IF EXISTS public.mark_milestone_seen(bigint);
CREATE OR REPLACE FUNCTION public.mark_milestone_seen(p_id bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_count int;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'unauthorized');
    END IF;

    UPDATE public.listing_milestones SET seen_at = now()
    WHERE id = p_id AND user_id = v_user_id AND seen_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;

    RETURN jsonb_build_object('ok', true, 'updated', v_count);
END $$;

GRANT EXECUTE ON FUNCTION public.mark_milestone_seen(bigint) TO authenticated;

-- ──────────────── 7. RPC mark_all_milestones_seen ────────────────
DROP FUNCTION IF EXISTS public.mark_all_milestones_seen();
CREATE OR REPLACE FUNCTION public.mark_all_milestones_seen()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_count int;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'unauthorized');
    END IF;

    UPDATE public.listing_milestones SET seen_at = now()
    WHERE user_id = v_user_id AND seen_at IS NULL;
    GET DIAGNOSTICS v_count = ROW_COUNT;

    RETURN jsonb_build_object('ok', true, 'updated', v_count);
END $$;

GRANT EXECUTE ON FUNCTION public.mark_all_milestones_seen() TO authenticated;

-- Done.
