-- Vetrine: attivazione atomica dopo approvazione, rinnovi idempotenti e risultati reali.
-- Non modifica expires_at e non ricostruisce conteggi storici.
BEGIN;

CREATE OR REPLACE FUNCTION public.apply_vetrina_payment(
    p_session_id text, p_annuncio_id uuid, p_user_id uuid,
    p_tier text, p_amount_cents integer, p_currency text,
    p_payment_intent text, p_customer_email text
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    a public.annunci%ROWTYPE;
    payment public.payments%ROWTYPE;
    days integer;
    starts_at timestamptz := now();
    ends_at timestamptz;
BEGIN
    days := CASE p_tier WHEN '10d' THEN 10 WHEN '30d' THEN 30 WHEN '90d' THEN 90 END;
    IF days IS NULL OR p_session_id IS NULL OR p_session_id = ''
       OR p_amount_cents IS NULL OR p_amount_cents < 0 OR p_currency IS DISTINCT FROM 'eur' THEN
        RAISE EXCEPTION 'Invalid payment';
    END IF;

    -- Stesso lock della moderazione: pagamento e approvazione non perdono giorni.
    SELECT * INTO a FROM public.annunci WHERE id = p_annuncio_id FOR UPDATE;
    IF NOT FOUND OR a.user_id IS DISTINCT FROM p_user_id THEN
        RAISE EXCEPTION 'Listing ownership mismatch';
    END IF;
    SELECT * INTO payment FROM public.payments WHERE stripe_session_id = p_session_id FOR UPDATE;
    IF FOUND THEN
        IF payment.annuncio_id IS DISTINCT FROM p_annuncio_id OR payment.user_id IS DISTINCT FROM p_user_id THEN
            RAISE EXCEPTION 'Session ownership mismatch';
        END IF;
        IF payment.status IN ('succeeded', 'refunded') THEN
            RETURN jsonb_build_object('duplicate', true, 'waiting_approval', payment.activated_at IS NULL);
        END IF;
    END IF;

    IF a.status = 'active' THEN
        starts_at := CASE WHEN a.featured AND a.featured_until > now() THEN a.featured_until ELSE now() END;
        ends_at := starts_at + make_interval(days => days);
        UPDATE public.annunci SET
            featured = true, featured_until = ends_at, featured_tier = p_tier,
            featured_since = CASE WHEN a.featured AND a.featured_until > now()
                                  THEN COALESCE(a.featured_since, now()) ELSE now() END
        WHERE id = a.id;
    END IF;

    INSERT INTO public.payments (user_id, annuncio_id, amount_cents, currency, tier, status,
                                stripe_session_id, stripe_payment_intent, customer_email, activated_at)
    VALUES (p_user_id, p_annuncio_id, p_amount_cents, p_currency, p_tier, 'succeeded',
            p_session_id, p_payment_intent, p_customer_email,
            CASE WHEN a.status = 'active' THEN now() ELSE NULL END)
    ON CONFLICT (stripe_session_id) DO UPDATE SET
        amount_cents = EXCLUDED.amount_cents, currency = EXCLUDED.currency, tier = EXCLUDED.tier,
        status = EXCLUDED.status, stripe_payment_intent = EXCLUDED.stripe_payment_intent,
        customer_email = EXCLUDED.customer_email, activated_at = EXCLUDED.activated_at;
    RETURN jsonb_build_object('duplicate', false, 'waiting_approval', a.status IS DISTINCT FROM 'active',
                             'featured_until', ends_at);
END $$;
REVOKE ALL ON FUNCTION public.apply_vetrina_payment(text, uuid, uuid, text, integer, text, text, text)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_vetrina_payment(text, uuid, uuid, text, integer, text, text, text)
TO service_role;

CREATE OR REPLACE FUNCTION public.start_paid_vetrina_on_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    days integer;
    latest_tier text;
BEGIN
    SELECT COALESCE(sum(CASE tier WHEN '10d' THEN 10 WHEN '30d' THEN 30 WHEN '90d' THEN 90 ELSE 0 END), 0)
    INTO days FROM public.payments
    WHERE annuncio_id = NEW.id AND user_id = NEW.user_id AND status = 'succeeded' AND activated_at IS NULL;
    IF days > 0 THEN
        SELECT tier INTO latest_tier FROM public.payments
        WHERE annuncio_id = NEW.id AND user_id = NEW.user_id AND status = 'succeeded' AND activated_at IS NULL
        ORDER BY created_at DESC, id DESC LIMIT 1;
        NEW.featured_since := CASE WHEN NEW.featured AND NEW.featured_until > now()
                                  THEN COALESCE(NEW.featured_since, now()) ELSE now() END;
        NEW.featured_until := CASE WHEN NEW.featured AND NEW.featured_until > now()
                                  THEN NEW.featured_until ELSE now() END + make_interval(days => days);
        NEW.featured := true;
        NEW.featured_tier := latest_tier;
        UPDATE public.payments SET activated_at = now()
        WHERE annuncio_id = NEW.id AND user_id = NEW.user_id AND status = 'succeeded' AND activated_at IS NULL;
    END IF;
    RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.start_paid_vetrina_on_approval() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS zz_start_paid_vetrina_on_approval ON public.annunci;
-- Esegue dopo enforce_annunci_status; prende solo transizioni effettivamente approvate.
CREATE TRIGGER zz_start_paid_vetrina_on_approval BEFORE UPDATE OF status ON public.annunci
FOR EACH ROW WHEN (OLD.status IS DISTINCT FROM 'active' AND NEW.status = 'active')
EXECUTE FUNCTION public.start_paid_vetrina_on_approval();

CREATE INDEX IF NOT EXISTS payments_waiting_vetrina_idx ON public.payments(annuncio_id)
WHERE status = 'succeeded' AND activated_at IS NULL;

CREATE TABLE IF NOT EXISTS public.vetrina_stats_daily (
    annuncio_id uuid NOT NULL REFERENCES public.annunci(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day date NOT NULL DEFAULT current_date,
    impressions integer NOT NULL DEFAULT 0,
    detail_views integer NOT NULL DEFAULT 0,
    contact_actions integer NOT NULL DEFAULT 0,
    PRIMARY KEY (annuncio_id, day)
);
ALTER TABLE public.vetrina_stats_daily ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.vetrina_stats_daily FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public._bump_vetrina_daily(p_listing_id uuid, p_event text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE owner_id uuid;
BEGIN
    IF p_event NOT IN ('impression', 'detail', 'call', 'whatsapp', 'chat') THEN RETURN; END IF;
    SELECT user_id INTO owner_id FROM public.annunci
    WHERE id = p_listing_id AND status = 'active' AND featured = true AND featured_until > now()
      AND (expires_at IS NULL OR expires_at > now()) AND user_id IS DISTINCT FROM auth.uid();
    IF owner_id IS NULL THEN RETURN; END IF;
    INSERT INTO public.vetrina_stats_daily(annuncio_id, user_id, day, impressions, detail_views, contact_actions)
    VALUES (p_listing_id, owner_id, current_date,
            CASE WHEN p_event = 'impression' THEN 1 ELSE 0 END,
            CASE WHEN p_event = 'detail' THEN 1 ELSE 0 END,
            CASE WHEN p_event IN ('call', 'whatsapp', 'chat') THEN 1 ELSE 0 END)
    ON CONFLICT (annuncio_id, day) DO UPDATE SET
        impressions = vetrina_stats_daily.impressions + EXCLUDED.impressions,
        detail_views = vetrina_stats_daily.detail_views + EXCLUDED.detail_views,
        contact_actions = vetrina_stats_daily.contact_actions + EXCLUDED.contact_actions;
END $$;
REVOKE ALL ON FUNCTION public._bump_vetrina_daily(uuid, text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.track_listing_view(listing_id uuid, view_type text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
    IF view_type NOT IN ('impression', 'detail') THEN RETURN; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.annunci WHERE id = listing_id AND status = 'active'
                   AND (expires_at IS NULL OR expires_at > now()) AND user_id IS DISTINCT FROM auth.uid()) THEN
        RETURN;
    END IF;
    PERFORM public.increment_views(listing_id, 1);
    PERFORM public._bump_vetrina_daily(listing_id, view_type);
END $$;
REVOKE ALL ON FUNCTION public.track_listing_view(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.track_listing_view(uuid, text) TO anon, authenticated;

-- Conserva eventi e contatori legacy; registra separatamente le azioni durante la Vetrina.
CREATE OR REPLACE FUNCTION public._bump_listing_daily(p_listing_id uuid, p_event text, p_amount integer DEFAULT 1)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
    v_user_id uuid;
    v_amount integer := GREATEST(COALESCE(p_amount, 1), 1);
BEGIN
    SELECT a.user_id INTO v_user_id FROM public.annunci a
    WHERE a.id = p_listing_id AND COALESCE(a.status, '') <> 'deleted';
    IF v_user_id IS NULL THEN RETURN; END IF;
    INSERT INTO public.listing_stats_daily(annuncio_id, user_id, day, views, call_clicks, whatsapp_clicks, chat_clicks, saves)
    VALUES (p_listing_id, v_user_id, current_date,
        CASE WHEN p_event = 'view' THEN v_amount ELSE 0 END,
        CASE WHEN p_event = 'call' THEN v_amount ELSE 0 END,
        CASE WHEN p_event = 'whatsapp' THEN v_amount ELSE 0 END,
        CASE WHEN p_event = 'chat' THEN v_amount ELSE 0 END,
        CASE WHEN p_event = 'save' THEN v_amount ELSE 0 END)
    ON CONFLICT (annuncio_id, day) DO UPDATE SET
        views = listing_stats_daily.views + EXCLUDED.views,
        call_clicks = listing_stats_daily.call_clicks + EXCLUDED.call_clicks,
        whatsapp_clicks = listing_stats_daily.whatsapp_clicks + EXCLUDED.whatsapp_clicks,
        chat_clicks = listing_stats_daily.chat_clicks + EXCLUDED.chat_clicks,
        saves = listing_stats_daily.saves + EXCLUDED.saves, updated_at = now();
    IF p_event IN ('call', 'whatsapp', 'chat') THEN
        PERFORM public._bump_vetrina_daily(p_listing_id, p_event);
    END IF;
END $$;
REVOKE ALL ON FUNCTION public._bump_listing_daily(uuid, text, integer) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.dashboard_vetrina_stats(p_days integer DEFAULT 30)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
    IF auth.uid() IS NULL THEN RETURN jsonb_build_object('error', 'unauthorized'); END IF;
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', a.id, 'impressions', COALESCE(s.impressions, 0),
        'detail_views', COALESCE(s.detail_views, 0), 'contact_actions', COALESCE(s.contact_actions, 0),
        'waiting_days', (SELECT COALESCE(sum(CASE tier WHEN '10d' THEN 10 WHEN '30d' THEN 30 WHEN '90d' THEN 90 ELSE 0 END), 0)
                         FROM public.payments p WHERE p.annuncio_id = a.id AND p.user_id = auth.uid()
                         AND p.status = 'succeeded' AND p.activated_at IS NULL)
    )), '[]'::jsonb) INTO result
    FROM public.annunci a LEFT JOIN (
        SELECT annuncio_id, sum(impressions) AS impressions, sum(detail_views) AS detail_views,
               sum(contact_actions) AS contact_actions
        FROM public.vetrina_stats_daily WHERE user_id = auth.uid()
          AND day >= current_date - (LEAST(GREATEST(COALESCE(p_days, 30), 7), 90) - 1)
        GROUP BY annuncio_id
    ) s ON s.annuncio_id = a.id
    WHERE a.user_id = auth.uid() AND a.status IS DISTINCT FROM 'deleted';
    RETURN jsonb_build_object('listings', result, 'tracking_since', '2026-10-08');
END $$;
REVOKE ALL ON FUNCTION public.dashboard_vetrina_stats(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dashboard_vetrina_stats(integer) TO authenticated;

-- Ferma il vecchio incremento casuale: lo storico resta, i nuovi risultati sono eventi reali.
SELECT cron.alter_job(jobid, active := false) FROM cron.job WHERE jobname = 'increment-featured-views';
NOTIFY pgrst, 'reload schema';
COMMIT;
