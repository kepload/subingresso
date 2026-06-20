-- ============================================================================
--  PATCH_LISTING_ANALYTICS_20260620.sql
--  Dashboard statistiche venditore: aggregati giornalieri per annuncio.
--
--  Obiettivo:
--  - Grafico privato in dashboard senza query pesanti su eventi grezzi.
--  - Nessun dato personale degli acquirenti: solo conteggi aggregati.
--  - Compatibile con le funzioni esistenti increment_views/increment_tel_clicks.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.listing_stats_daily (
    annuncio_id     uuid NOT NULL REFERENCES public.annunci(id) ON DELETE CASCADE,
    user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day             date NOT NULL DEFAULT current_date,
    views           integer NOT NULL DEFAULT 0,
    call_clicks     integer NOT NULL DEFAULT 0,
    whatsapp_clicks integer NOT NULL DEFAULT 0,
    chat_clicks     integer NOT NULL DEFAULT 0,
    saves           integer NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (annuncio_id, day)
);

CREATE INDEX IF NOT EXISTS idx_listing_stats_daily_user_day
    ON public.listing_stats_daily (user_id, day DESC);

CREATE INDEX IF NOT EXISTS idx_listing_stats_daily_annuncio_day
    ON public.listing_stats_daily (annuncio_id, day DESC);

ALTER TABLE public.listing_stats_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS listing_stats_daily_owner_select ON public.listing_stats_daily;
CREATE POLICY listing_stats_daily_owner_select ON public.listing_stats_daily
    FOR SELECT TO authenticated
    USING (
        auth.uid() = user_id
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid() AND p.is_admin = true
        )
    );

GRANT SELECT ON public.listing_stats_daily TO authenticated;

-- Bump atomico di un contatore giornaliero. Nessuna policy INSERT/UPDATE diretta:
-- si scrive solo tramite funzioni SECURITY DEFINER.
CREATE OR REPLACE FUNCTION public._bump_listing_daily(
    p_listing_id uuid,
    p_event text,
    p_amount integer DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id uuid;
    v_amount integer := GREATEST(COALESCE(p_amount, 1), 1);
BEGIN
    IF p_listing_id IS NULL THEN
        RETURN;
    END IF;

    SELECT a.user_id INTO v_user_id
    FROM public.annunci a
    WHERE a.id = p_listing_id
      AND COALESCE(a.status, '') <> 'deleted';

    IF v_user_id IS NULL THEN
        RETURN;
    END IF;

    INSERT INTO public.listing_stats_daily (
        annuncio_id, user_id, day,
        views, call_clicks, whatsapp_clicks, chat_clicks, saves
    )
    VALUES (
        p_listing_id, v_user_id, current_date,
        CASE WHEN p_event = 'view' THEN v_amount ELSE 0 END,
        CASE WHEN p_event = 'call' THEN v_amount ELSE 0 END,
        CASE WHEN p_event = 'whatsapp' THEN v_amount ELSE 0 END,
        CASE WHEN p_event = 'chat' THEN v_amount ELSE 0 END,
        CASE WHEN p_event = 'save' THEN v_amount ELSE 0 END
    )
    ON CONFLICT (annuncio_id, day) DO UPDATE SET
        views = public.listing_stats_daily.views + EXCLUDED.views,
        call_clicks = public.listing_stats_daily.call_clicks + EXCLUDED.call_clicks,
        whatsapp_clicks = public.listing_stats_daily.whatsapp_clicks + EXCLUDED.whatsapp_clicks,
        chat_clicks = public.listing_stats_daily.chat_clicks + EXCLUDED.chat_clicks,
        saves = public.listing_stats_daily.saves + EXCLUDED.saves,
        updated_at = now();
END $$;

REVOKE ALL ON FUNCTION public._bump_listing_daily(uuid, text, integer) FROM public;

-- Mantiene il comportamento storico: aumenta annunci.visualizzazioni.
-- In piu' salva il dato giornaliero per il grafico venditore.
CREATE OR REPLACE FUNCTION public.increment_views(
    listing_id uuid,
    amount integer DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_amount integer := GREATEST(COALESCE(amount, 1), 1);
BEGIN
    UPDATE public.annunci
    SET visualizzazioni = COALESCE(visualizzazioni, 0) + v_amount
    WHERE id = listing_id
      AND COALESCE(status, '') <> 'deleted';

    PERFORM public._bump_listing_daily(listing_id, 'view', v_amount);
END $$;

GRANT EXECUTE ON FUNCTION public.increment_views(uuid, integer) TO anon, authenticated;

-- Eventi contatto separati per capire dove ottimizzare l'annuncio.
CREATE OR REPLACE FUNCTION public.track_listing_event(
    listing_id uuid,
    event_type text,
    amount integer DEFAULT 1
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_amount integer := GREATEST(COALESCE(amount, 1), 1);
BEGIN
    IF event_type NOT IN ('call', 'whatsapp', 'chat') THEN
        RETURN;
    END IF;

    IF event_type IN ('call', 'whatsapp') THEN
        UPDATE public.annunci
        SET tel_clicks = COALESCE(tel_clicks, 0) + v_amount
        WHERE id = listing_id
          AND COALESCE(status, '') <> 'deleted';
    END IF;

    PERFORM public._bump_listing_daily(listing_id, event_type, v_amount);
END $$;

GRANT EXECUTE ON FUNCTION public.track_listing_event(uuid, text, integer) TO anon, authenticated;

-- Wrapper legacy: i vecchi client continuano a funzionare.
CREATE OR REPLACE FUNCTION public.increment_tel_clicks(listing_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.track_listing_event(listing_id, 'call', 1);
$$;

GRANT EXECUTE ON FUNCTION public.increment_tel_clicks(uuid) TO anon, authenticated;

-- Se il cron vetrina esiste, da ora alimenta anche gli aggregati giornalieri.
CREATE OR REPLACE FUNCTION public.increment_featured_views()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r record;
    v_amount integer;
BEGIN
    FOR r IN
        SELECT id
        FROM public.annunci
        WHERE featured = true
          AND featured_until > now()
          AND status = 'active'
    LOOP
        v_amount := (floor(random() * 6) + 3)::int;
        PERFORM public.increment_views(r.id, v_amount);
    END LOOP;
END $$;

-- Estende il trigger esistente dei preferiti senza perdere saved_count.
CREATE OR REPLACE FUNCTION public._sync_saved_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.annunci
        SET saved_count = saved_count + 1
        WHERE id = NEW.annuncio_id;

        PERFORM public._bump_listing_daily(NEW.annuncio_id, 'save', 1);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.annunci
        SET saved_count = GREATEST(saved_count - 1, 0)
        WHERE id = OLD.annuncio_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_saved_count ON public.saved_listings;
CREATE TRIGGER trg_sync_saved_count
AFTER INSERT OR DELETE ON public.saved_listings
FOR EACH ROW EXECUTE FUNCTION public._sync_saved_count();

-- RPC privata per la dashboard utente. Torna solo annunci dell'utente loggato.
CREATE OR REPLACE FUNCTION public.dashboard_seller_analytics(p_days integer DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
DECLARE
    v_user_id uuid := auth.uid();
    v_days integer := LEAST(GREATEST(COALESCE(p_days, 30), 7), 90);
    v_listings jsonb;
BEGIN
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'unauthorized');
    END IF;

    WITH my_listings AS (
        SELECT
            a.id,
            a.titolo,
            a.comune,
            a.regione,
            a.status,
            a.tipo,
            a.stato,
            a.prezzo,
            a.created_at,
            a.expires_at,
            a.featured,
            a.featured_until,
            a.img_urls,
            COALESCE(a.visualizzazioni, 0) AS views_total,
            COALESCE(a.saved_count, 0) AS saved_total,
            COALESCE(a.tel_clicks, 0) AS tel_clicks_total,
            COALESCE(length(a.descrizione), 0) AS description_length,
            COALESCE(jsonb_array_length(to_jsonb(a.img_urls)), 0) AS photo_count
        FROM public.annunci a
        WHERE a.user_id = v_user_id
          AND COALESCE(a.status, '') <> 'deleted'
        ORDER BY a.visualizzazioni DESC NULLS LAST, a.created_at DESC
        LIMIT 50
    )
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', ml.id,
        'titolo', ml.titolo,
        'comune', ml.comune,
        'regione', ml.regione,
        'status', ml.status,
        'tipo', ml.tipo,
        'stato', ml.stato,
        'prezzo', ml.prezzo,
        'created_at', ml.created_at,
        'expires_at', ml.expires_at,
        'featured', ml.featured,
        'featured_until', ml.featured_until,
        'img_urls', ml.img_urls,
        'views_total', ml.views_total,
        'saved_total', ml.saved_total,
        'tel_clicks_total', ml.tel_clicks_total,
        'description_length', ml.description_length,
        'photo_count', ml.photo_count,
        'msg_total', (
            SELECT COUNT(*)::int
            FROM public.messaggi m
            JOIN public.conversazioni c ON c.id = m.conversazione_id
            WHERE c.annuncio_id = ml.id
              AND m.mittente_id IS DISTINCT FROM v_user_id
        ),
        'msg_period', (
            SELECT COUNT(*)::int
            FROM public.messaggi m
            JOIN public.conversazioni c ON c.id = m.conversazione_id
            WHERE c.annuncio_id = ml.id
              AND m.mittente_id IS DISTINCT FROM v_user_id
              AND m.created_at >= (current_date - (v_days - 1))::timestamptz
        ),
        'daily', (
            SELECT COALESCE(jsonb_agg(jsonb_build_object(
                'day', s.day,
                'views', s.views,
                'call_clicks', s.call_clicks,
                'whatsapp_clicks', s.whatsapp_clicks,
                'chat_clicks', s.chat_clicks,
                'saves', s.saves
            ) ORDER BY s.day), '[]'::jsonb)
            FROM public.listing_stats_daily s
            WHERE s.annuncio_id = ml.id
              AND s.day >= current_date - (v_days - 1)
        )
    )), '[]'::jsonb) INTO v_listings
    FROM my_listings ml;

    RETURN jsonb_build_object(
        'days', v_days,
        'listings', v_listings
    );
END $$;

GRANT EXECUTE ON FUNCTION public.dashboard_seller_analytics(integer) TO authenticated;

NOTIFY pgrst, 'reload schema';
