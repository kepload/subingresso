-- Storico privato degli acquisti, dati congelati e registro append-only.
-- Nessun dato carta. Gli ordini restano anche dopo la rimozione di un annuncio.
BEGIN;
ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS listing_title text,
    ADD COLUMN IF NOT EXISTS listing_id_snapshot uuid,
    ADD COLUMN IF NOT EXISTS paid_at timestamptz,
    ADD COLUMN IF NOT EXISTS promotion_starts_at timestamptz,
    ADD COLUMN IF NOT EXISTS promotion_ends_at timestamptz,
    ADD COLUMN IF NOT EXISTS refunded_cents integer NOT NULL DEFAULT 0;

UPDATE public.payments p SET listing_title = a.titolo, listing_id_snapshot = a.id
FROM public.annunci a WHERE p.annuncio_id = a.id AND p.listing_id_snapshot IS NULL;
-- Le date esatte degli acquisti precedenti non vengono inventate.
UPDATE public.payments SET refunded_cents = amount_cents
WHERE status = 'refunded' AND refunded_cents = 0;

CREATE TABLE IF NOT EXISTS public.payment_history (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    payment_id uuid NOT NULL REFERENCES public.payments(id) ON DELETE RESTRICT,
    occurred_at timestamptz NOT NULL DEFAULT now(),
    kind text NOT NULL,
    status text,
    amount_cents integer,
    refunded_cents integer,
    promotion_starts_at timestamptz,
    promotion_ends_at timestamptz
);
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.payment_history FROM PUBLIC, anon, authenticated;
REVOKE UPDATE, DELETE, TRUNCATE ON public.payment_history FROM service_role;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.payments FROM anon, authenticated;
REVOKE TRUNCATE ON public.payments FROM service_role;
CREATE INDEX IF NOT EXISTS payment_history_order_idx ON public.payment_history(payment_id, id);
CREATE INDEX IF NOT EXISTS payments_owner_date_idx ON public.payments(user_id, created_at DESC, id DESC);

CREATE OR REPLACE FUNCTION public.protect_payment_history()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
    RAISE EXCEPTION 'Lo storico degli ordini non puo essere cancellato o riscritto';
END $$;
REVOKE ALL ON FUNCTION public.protect_payment_history() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS payment_history_append_only ON public.payment_history;
CREATE TRIGGER payment_history_append_only BEFORE UPDATE OR DELETE ON public.payment_history
FOR EACH ROW EXECUTE FUNCTION public.protect_payment_history();
DROP TRIGGER IF EXISTS payments_no_delete ON public.payments;
CREATE TRIGGER payments_no_delete BEFORE DELETE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.protect_payment_history();

CREATE OR REPLACE FUNCTION public.freeze_payment_order()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE a public.annunci%ROWTYPE; days integer;
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NEW.id IS DISTINCT FROM OLD.id OR NEW.created_at IS DISTINCT FROM OLD.created_at
           OR NEW.stripe_session_id IS DISTINCT FROM OLD.stripe_session_id
           OR (NEW.user_id IS DISTINCT FROM OLD.user_id AND NEW.user_id IS NOT NULL)
           OR (NEW.annuncio_id IS DISTINCT FROM OLD.annuncio_id AND NEW.annuncio_id IS NOT NULL)
           OR NEW.listing_id_snapshot IS DISTINCT FROM OLD.listing_id_snapshot
           OR NEW.listing_title IS DISTINCT FROM OLD.listing_title THEN
            RAISE EXCEPTION 'Identita ordine immutabile';
        END IF;
        IF OLD.status IN ('succeeded', 'refunded') AND (
            NEW.amount_cents IS DISTINCT FROM OLD.amount_cents OR NEW.currency IS DISTINCT FROM OLD.currency
            OR NEW.tier IS DISTINCT FROM OLD.tier OR NEW.stripe_payment_intent IS DISTINCT FROM OLD.stripe_payment_intent
            OR NEW.paid_at IS DISTINCT FROM OLD.paid_at
            OR NEW.status NOT IN ('succeeded', 'refunded')
            OR (OLD.status = 'refunded' AND NEW.status <> 'refunded')
            OR (OLD.activated_at IS NOT NULL AND NEW.activated_at IS DISTINCT FROM OLD.activated_at)
            OR (OLD.promotion_starts_at IS NOT NULL AND NEW.promotion_starts_at IS DISTINCT FROM OLD.promotion_starts_at)
            OR (OLD.promotion_ends_at IS NOT NULL AND NEW.promotion_ends_at IS DISTINCT FROM OLD.promotion_ends_at)
        ) THEN RAISE EXCEPTION 'Dati di acquisto immutabili'; END IF;
        IF NEW.refunded_cents < OLD.refunded_cents THEN RAISE EXCEPTION 'Rimborso non puo diminuire'; END IF;
    ELSE
        SELECT * INTO a FROM public.annunci WHERE id = NEW.annuncio_id;
        NEW.listing_title := a.titolo;
        NEW.listing_id_snapshot := NEW.annuncio_id;
    END IF;
    IF NEW.refunded_cents < 0 OR NEW.refunded_cents > NEW.amount_cents THEN
        RAISE EXCEPTION 'Importo rimborso invalido';
    END IF;
    IF NEW.status = 'succeeded' AND (TG_OP = 'INSERT' OR OLD.status NOT IN ('succeeded','refunded')) THEN
        NEW.paid_at := now();
    END IF;
    IF NEW.activated_at IS NOT NULL AND NEW.promotion_ends_at IS NULL
       AND (TG_OP = 'INSERT' OR OLD.activated_at IS NULL) THEN
        SELECT * INTO a FROM public.annunci WHERE id = NEW.annuncio_id;
        days := CASE NEW.tier WHEN '10d' THEN 10 WHEN '30d' THEN 30 WHEN '90d' THEN 90 END;
        NEW.promotion_ends_at := a.featured_until;
        NEW.promotion_starts_at := a.featured_until - pg_catalog.make_interval(days => days);
    END IF;
    RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.freeze_payment_order() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS payments_freeze_order ON public.payments;
CREATE TRIGGER payments_freeze_order BEFORE INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.freeze_payment_order();

CREATE OR REPLACE FUNCTION public.log_payment_order()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
    IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status
       OR NEW.refunded_cents IS DISTINCT FROM OLD.refunded_cents
       OR NEW.activated_at IS DISTINCT FROM OLD.activated_at THEN
        INSERT INTO public.payment_history(payment_id, kind, status, amount_cents, refunded_cents,
                                           promotion_starts_at, promotion_ends_at)
        VALUES (NEW.id, CASE WHEN TG_OP = 'INSERT' THEN 'created'
                    WHEN NEW.refunded_cents IS DISTINCT FROM OLD.refunded_cents THEN 'refund'
                    WHEN NEW.activated_at IS DISTINCT FROM OLD.activated_at THEN 'activation' ELSE 'payment' END,
                NEW.status, NEW.amount_cents, NEW.refunded_cents, NEW.promotion_starts_at, NEW.promotion_ends_at);
    END IF;
    RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.log_payment_order() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS payments_log_order ON public.payments;
CREATE TRIGGER payments_log_order AFTER INSERT OR UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.log_payment_order();
INSERT INTO public.payment_history(payment_id, kind, status, amount_cents, refunded_cents)
SELECT p.id, 'imported', p.status, p.amount_cents, p.refunded_cents FROM public.payments p
WHERE NOT EXISTS (SELECT 1 FROM public.payment_history h WHERE h.payment_id = p.id);

-- Mantiene l'attivazione alla moderazione, assegnando una finestra a ogni rinnovo.
CREATE OR REPLACE FUNCTION public.start_paid_vetrina_on_approval()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE p record; starts timestamptz; ends timestamptz; days integer;
BEGIN
    starts := CASE WHEN NEW.featured AND NEW.featured_until > now() THEN NEW.featured_until ELSE now() END;
    FOR p IN SELECT id, tier FROM public.payments
        WHERE annuncio_id = NEW.id AND user_id = NEW.user_id AND status = 'succeeded' AND activated_at IS NULL
        ORDER BY created_at, id FOR UPDATE LOOP
        days := CASE p.tier WHEN '10d' THEN 10 WHEN '30d' THEN 30 WHEN '90d' THEN 90 END;
        IF days IS NULL THEN CONTINUE; END IF;
        ends := starts + pg_catalog.make_interval(days => days);
        UPDATE public.payments SET activated_at = now(), promotion_starts_at = starts, promotion_ends_at = ends
        WHERE id = p.id;
        NEW.featured_since := CASE WHEN NEW.featured AND NEW.featured_until > now()
                                  THEN COALESCE(NEW.featured_since, now()) ELSE now() END;
        NEW.featured_until := ends;
        NEW.featured := true;
        NEW.featured_tier := p.tier;
        starts := ends;
    END LOOP;
    RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.start_paid_vetrina_on_approval() FROM PUBLIC, anon, authenticated;

-- Le metriche private non spariscono con l'annuncio/account; nessuna nuova PII.
ALTER TABLE public.vetrina_stats_daily DROP CONSTRAINT IF EXISTS vetrina_stats_daily_annuncio_id_fkey;
ALTER TABLE public.vetrina_stats_daily DROP CONSTRAINT IF EXISTS vetrina_stats_daily_user_id_fkey;

CREATE OR REPLACE FUNCTION public.record_vetrina_refund(p_intent text, p_refunded_cents integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE p public.payments%ROWTYPE;
BEGIN
    SELECT * INTO p FROM public.payments WHERE stripe_payment_intent = p_intent FOR UPDATE;
    IF NOT FOUND OR p.status NOT IN ('succeeded','refunded') THEN RAISE EXCEPTION 'Payment not ready'; END IF;
    IF p_refunded_cents < 0 OR p_refunded_cents > p.amount_cents THEN RAISE EXCEPTION 'Invalid refund'; END IF;
    UPDATE public.payments SET refunded_cents = GREATEST(refunded_cents, p_refunded_cents),
        status = CASE WHEN p_refunded_cents = amount_cents THEN 'refunded' ELSE status END WHERE id = p.id;
END $$;
REVOKE ALL ON FUNCTION public.record_vetrina_refund(text,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_vetrina_refund(text,integer) TO service_role;

CREATE OR REPLACE FUNCTION public.dashboard_vetrina_account(
    p_days integer DEFAULT 30, p_offset integer DEFAULT 0, p_status text DEFAULT 'all'
)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
DECLARE uid uuid := auth.uid(); orders jsonb; campaigns jsonb; summary jsonb; total bigint;
BEGIN
    IF uid IS NULL THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501'; END IF;
    IF p_status NOT IN ('all','succeeded','pending','failed','refunded') THEN RAISE EXCEPTION 'Invalid status'; END IF;
    SELECT count(*) INTO total FROM public.payments
    WHERE user_id = uid AND (p_status = 'all' OR status = p_status);
    SELECT COALESCE(jsonb_agg(row ORDER BY row.created_at DESC, row.id DESC), '[]'::jsonb) INTO orders FROM (
        SELECT p.id, p.annuncio_id, p.listing_id_snapshot, p.listing_title, p.tier, p.status,
               p.amount_cents, p.currency, p.refunded_cents, p.created_at, p.paid_at, p.activated_at,
               p.promotion_starts_at, p.promotion_ends_at,
               p.stripe_session_id LIKE 'cs_test_%' AS is_test,
               p.stripe_payment_intent IS NOT NULL AND p.status IN ('succeeded','refunded') AS has_receipt,
               COALESCE((SELECT jsonb_agg(jsonb_build_object('at',h.occurred_at,'kind',h.kind,'status',h.status,
                           'refunded_cents',h.refunded_cents) ORDER BY h.id)
                        FROM public.payment_history h WHERE h.payment_id = p.id), '[]'::jsonb) AS history
        FROM public.payments p WHERE p.user_id = uid AND (p_status = 'all' OR p.status = p_status)
        ORDER BY p.created_at DESC, p.id DESC LIMIT 50 OFFSET GREATEST(COALESCE(p_offset,0),0)
    ) row;
    SELECT jsonb_build_object(
        'paid_orders', count(*) FILTER (WHERE status IN ('succeeded','refunded')),
        'spent_cents', COALESCE(sum(amount_cents) FILTER (WHERE status IN ('succeeded','refunded')),0),
        'refunded_cents', COALESCE(sum(refunded_cents) FILTER (WHERE status IN ('succeeded','refunded')),0)
    ) INTO summary FROM public.payments WHERE user_id = uid AND stripe_session_id LIKE 'cs_live_%';
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', c.id, 'title', c.title, 'status', a.status, 'available', a.id IS NOT NULL AND a.status <> 'deleted',
        'active', COALESCE(a.status = 'active' AND a.featured AND a.featured_until > now()
                          AND (a.expires_at IS NULL OR a.expires_at > now()), false),
        'featured_until', a.featured_until,
        'waiting_days', (SELECT COALESCE(sum(CASE tier WHEN '10d' THEN 10 WHEN '30d' THEN 30 WHEN '90d' THEN 90 END),0)
                         FROM public.payments WHERE user_id = uid AND listing_id_snapshot = c.id
                         AND status = 'succeeded' AND activated_at IS NULL),
        'impressions', COALESCE(s.impressions,0), 'detail_views', COALESCE(s.detail_views,0),
        'contact_actions', COALESCE(s.contact_actions,0), 'daily', COALESCE(s.daily,'[]'::jsonb)
    )), '[]'::jsonb) INTO campaigns
    FROM (
        SELECT DISTINCT ON (listing_id_snapshot) listing_id_snapshot AS id, listing_title AS title
        FROM public.payments WHERE user_id = uid AND status IN ('succeeded','refunded') AND listing_id_snapshot IS NOT NULL
        ORDER BY listing_id_snapshot, created_at DESC, id DESC
    ) c LEFT JOIN public.annunci a ON a.id = c.id AND a.user_id = uid
    LEFT JOIN (
        SELECT annuncio_id, sum(impressions) AS impressions, sum(detail_views) AS detail_views,
               sum(contact_actions) AS contact_actions,
               jsonb_agg(jsonb_build_object('day',day,'impressions',impressions,'detail_views',detail_views,
                                           'contact_actions',contact_actions) ORDER BY day) AS daily
        FROM public.vetrina_stats_daily WHERE user_id = uid
          AND day >= current_date - (CASE WHEN p_days IN (7,30,90) THEN p_days ELSE 30 END - 1)
        GROUP BY annuncio_id
    ) s ON s.annuncio_id = c.id;
    RETURN jsonb_build_object('orders',orders,'total',total,'summary',summary,'campaigns',campaigns,
                              'tracking_since','2026-10-08','days',CASE WHEN p_days IN (7,30,90) THEN p_days ELSE 30 END);
END $$;
REVOKE ALL ON FUNCTION public.dashboard_vetrina_account(integer,integer,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.dashboard_vetrina_account(integer,integer,text) TO authenticated;
NOTIFY pgrst, 'reload schema';
COMMIT;
