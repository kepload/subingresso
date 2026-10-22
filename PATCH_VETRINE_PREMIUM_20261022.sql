-- Premium checkout: one Stripe checkout, one immutable allocation per listing.
-- Existing listing approval triggers and previous payments stay unchanged.
BEGIN;
ALTER TABLE public.payments
    ADD COLUMN IF NOT EXISTS checkout_session_id text,
    ADD COLUMN IF NOT EXISTS bundle_size integer NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS bundle_discount integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS list_price_cents integer;
CREATE INDEX IF NOT EXISTS payments_checkout_idx ON public.payments(checkout_session_id);
CREATE INDEX IF NOT EXISTS payments_intent_idx ON public.payments(stripe_payment_intent);

CREATE OR REPLACE FUNCTION public.protect_vetrina_bundle_fields()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
    IF NEW.checkout_session_id IS DISTINCT FROM OLD.checkout_session_id
       OR NEW.bundle_size IS DISTINCT FROM OLD.bundle_size
       OR NEW.bundle_discount IS DISTINCT FROM OLD.bundle_discount
       OR NEW.list_price_cents IS DISTINCT FROM OLD.list_price_cents THEN
        RAISE EXCEPTION 'Pacchetto ordine immutabile';
    END IF;
    RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.protect_vetrina_bundle_fields() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS payments_bundle_immutable ON public.payments;
CREATE TRIGGER payments_bundle_immutable BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.protect_vetrina_bundle_fields();

CREATE OR REPLACE FUNCTION public.register_vetrina_checkout(
    p_session_id text, p_user_id uuid, p_listing_ids uuid[], p_tier text,
    p_creation boolean, p_expected_amount integer
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE n integer; discount integer; base integer; unit integer; a public.annunci%ROWTYPE;
BEGIN
    n := cardinality(p_listing_ids);
    base := CASE p_tier WHEN '10d' THEN 4900 WHEN '30d' THEN 9900 WHEN '90d' THEN 24900 END;
    IF n IS NULL OR n < 1 OR n > 10 OR base IS NULL OR p_user_id IS NULL
       OR p_session_id IS NULL OR p_session_id !~ '^cs_(live|test)_[A-Za-z0-9_]+$'
       OR n <> (SELECT count(DISTINCT id) FROM unnest(p_listing_ids) id) THEN
        RAISE EXCEPTION 'Invalid checkout';
    END IF;
    discount := CASE WHEN n >= 5 THEN 20 WHEN n >= 3 THEN 15 WHEN n = 2 THEN 10 ELSE 0 END;
    unit := round(base::numeric * (100-discount)/100)::integer;
    IF p_expected_amount IS DISTINCT FROM unit*n THEN RAISE EXCEPTION 'Price mismatch'; END IF;
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_session_id,0));
    IF EXISTS(SELECT 1 FROM public.payments WHERE checkout_session_id=p_session_id) THEN
        IF (SELECT count(*) FROM public.payments WHERE checkout_session_id=p_session_id
            AND user_id=p_user_id AND annuncio_id=ANY(p_listing_ids) AND tier=p_tier
            AND amount_cents=unit AND bundle_size=n AND bundle_discount=discount) <> n THEN
            RAISE EXCEPTION 'Checkout identity mismatch';
        END IF;
        RETURN jsonb_build_object('duplicate',true);
    END IF;
    PERFORM id FROM public.annunci WHERE id=ANY(p_listing_ids) ORDER BY id FOR UPDATE;
    IF (SELECT count(*) FROM public.annunci WHERE id=ANY(p_listing_ids)) <> n THEN RAISE EXCEPTION 'Listing missing'; END IF;
    FOR a IN SELECT * FROM public.annunci WHERE id=ANY(p_listing_ids) ORDER BY id LOOP
        IF a.user_id IS DISTINCT FROM p_user_id
           OR NOT (a.status='active' OR (coalesce(p_creation,false) AND n=1 AND a.status='pending'))
           OR (a.expires_at IS NOT NULL AND a.expires_at<=now()) THEN RAISE EXCEPTION 'Listing unavailable'; END IF;
        INSERT INTO public.payments(user_id,annuncio_id,amount_cents,currency,tier,status,stripe_session_id,
                                    checkout_session_id,bundle_size,bundle_discount,list_price_cents)
        VALUES(p_user_id,a.id,unit,'eur',p_tier,'pending',
               CASE WHEN n=1 THEN p_session_id ELSE p_session_id||':'||a.id::text END,
               p_session_id,n,discount,base);
    END LOOP;
    RETURN jsonb_build_object('count',n,'total',unit*n,'discount',discount);
END $$;
REVOKE ALL ON FUNCTION public.register_vetrina_checkout(text,uuid,uuid[],text,boolean,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.register_vetrina_checkout(text,uuid,uuid[],text,boolean,integer) TO service_role;

CREATE OR REPLACE FUNCTION public.apply_vetrina_checkout(
    p_session_id text,p_user_id uuid,p_amount_cents integer,p_currency text,p_payment_intent text
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE p public.payments%ROWTYPE; a public.annunci%ROWTYPE; total integer; n integer;
        days integer; start_at timestamptz; waiting integer := 0;
BEGIN
    IF p_session_id IS NULL OR p_user_id IS NULL OR p_currency IS DISTINCT FROM 'eur'
       OR p_payment_intent IS NULL OR p_payment_intent='' THEN RAISE EXCEPTION 'Invalid payment'; END IF;
    PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_session_id,0));
    -- Match the lock order of the existing approval/payment flow.
    PERFORM listing.id FROM public.annunci listing WHERE listing.id IN
        (SELECT annuncio_id FROM public.payments WHERE checkout_session_id=p_session_id) ORDER BY listing.id FOR UPDATE;
    PERFORM id FROM public.payments WHERE checkout_session_id=p_session_id ORDER BY id FOR UPDATE;
    SELECT count(*),sum(amount_cents) INTO n,total FROM public.payments WHERE checkout_session_id=p_session_id;
    IF n<1 OR n>10 OR total IS DISTINCT FROM p_amount_cents
       OR EXISTS(SELECT 1 FROM public.payments WHERE checkout_session_id=p_session_id
                  AND (user_id IS DISTINCT FROM p_user_id OR currency IS DISTINCT FROM p_currency OR bundle_size<>n)) THEN
        RAISE EXCEPTION 'Frozen order mismatch';
    END IF;
    IF NOT EXISTS(SELECT 1 FROM public.payments WHERE checkout_session_id=p_session_id AND status NOT IN ('succeeded','refunded')) THEN
        IF EXISTS(SELECT 1 FROM public.payments WHERE checkout_session_id=p_session_id AND stripe_payment_intent IS DISTINCT FROM p_payment_intent) THEN
            RAISE EXCEPTION 'Intent mismatch';
        END IF;
        RETURN jsonb_build_object('duplicate',true,'count',n);
    END IF;
    IF EXISTS(SELECT 1 FROM public.payments WHERE checkout_session_id=p_session_id AND status IN ('succeeded','refunded')) THEN
        RAISE EXCEPTION 'Inconsistent order';
    END IF;
    FOR p IN SELECT * FROM public.payments WHERE checkout_session_id=p_session_id ORDER BY annuncio_id NULLS LAST,id LOOP
        days := CASE p.tier WHEN '10d' THEN 10 WHEN '30d' THEN 30 WHEN '90d' THEN 90 END;
        IF days IS NULL THEN RAISE EXCEPTION 'Invalid duration'; END IF;
        SELECT * INTO a FROM public.annunci WHERE id=p.annuncio_id;
        IF FOUND AND a.user_id=p_user_id AND a.status='active' AND (a.expires_at IS NULL OR a.expires_at>now()) THEN
            start_at := CASE WHEN a.featured AND a.featured_until>now() THEN a.featured_until ELSE now() END;
            UPDATE public.annunci SET featured=true,featured_until=start_at+pg_catalog.make_interval(days=>days),
                featured_tier=p.tier,featured_since=CASE WHEN a.featured AND a.featured_until>now() THEN coalesce(a.featured_since,now()) ELSE now() END
            WHERE id=a.id;
            UPDATE public.payments SET status='succeeded',stripe_payment_intent=p_payment_intent,activated_at=now() WHERE id=p.id;
        ELSE
            -- Preserve the purchased days, including an unavailable listing; never promote a new owner.
            UPDATE public.payments SET status='succeeded',stripe_payment_intent=p_payment_intent WHERE id=p.id;
            waiting := waiting+1;
        END IF;
    END LOOP;
    RETURN jsonb_build_object('duplicate',false,'count',n,'waiting',waiting);
END $$;
REVOKE ALL ON FUNCTION public.apply_vetrina_checkout(text,uuid,integer,text,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.apply_vetrina_checkout(text,uuid,integer,text,text) TO service_role;

-- Stripe refunds are cumulative amounts for the whole payment intent. Allocate
-- oldest-first: exact cents, monotonic amounts, duplicate events have no effect.
CREATE OR REPLACE FUNCTION public.record_vetrina_refund(p_intent text,p_refunded_cents integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE p public.payments%ROWTYPE; total integer; previous integer; remaining integer; part integer;
BEGIN
    PERFORM id FROM public.payments WHERE stripe_payment_intent=p_intent ORDER BY id FOR UPDATE;
    SELECT sum(amount_cents),sum(refunded_cents) INTO total,previous FROM public.payments WHERE stripe_payment_intent=p_intent;
    IF total IS NULL OR p_refunded_cents IS NULL OR p_refunded_cents<0 OR p_refunded_cents>total
       OR EXISTS(SELECT 1 FROM public.payments WHERE stripe_payment_intent=p_intent AND status NOT IN ('succeeded','refunded')) THEN
        RAISE EXCEPTION 'Invalid refund';
    END IF;
    IF p_refunded_cents<=previous THEN RETURN; END IF;
    remaining := p_refunded_cents;
    FOR p IN SELECT * FROM public.payments WHERE stripe_payment_intent=p_intent ORDER BY id LOOP
        part := least(p.amount_cents,remaining);
        UPDATE public.payments SET refunded_cents=part,
            status=CASE WHEN part=amount_cents THEN 'refunded' ELSE status END WHERE id=p.id;
        remaining := remaining-part;
    END LOOP;
END $$;
REVOKE ALL ON FUNCTION public.record_vetrina_refund(text,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.record_vetrina_refund(text,integer) TO service_role;
CREATE OR REPLACE FUNCTION public.dashboard_vetrina_account(p_days integer DEFAULT 30, p_offset integer DEFAULT 0, p_status text DEFAULT 'all'::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE uid uuid := auth.uid(); orders jsonb; campaigns jsonb; summary jsonb; total bigint;
BEGIN
    IF uid IS NULL THEN RAISE EXCEPTION 'Unauthorized' USING ERRCODE = '42501'; END IF;
    IF p_status NOT IN ('all','succeeded','pending','failed','refunded') THEN RAISE EXCEPTION 'Invalid status'; END IF;
    SELECT count(*) INTO total FROM public.payments
    WHERE user_id = uid AND (p_status = 'all' OR status = p_status);
    SELECT COALESCE(jsonb_agg(row ORDER BY row.created_at DESC, row.id DESC), '[]'::jsonb) INTO orders FROM (
        SELECT p.id, p.annuncio_id, p.listing_id_snapshot, p.listing_title, p.tier, p.status,
               p.amount_cents, p.currency, p.refunded_cents, p.created_at, p.paid_at, p.activated_at,
               p.promotion_starts_at, p.promotion_ends_at, p.checkout_session_id, p.bundle_size, p.bundle_discount, p.list_price_cents,
               p.stripe_session_id LIKE 'cs_test_%' AS is_test,
               p.stripe_payment_intent IS NOT NULL AND p.status IN ('succeeded','refunded') AS has_receipt,
               COALESCE((SELECT jsonb_agg(jsonb_build_object('at',h.occurred_at,'kind',h.kind,'status',h.status,
                           'refunded_cents',h.refunded_cents) ORDER BY h.id)
                        FROM public.payment_history h WHERE h.payment_id = p.id), '[]'::jsonb) AS history
        FROM public.payments p WHERE p.user_id = uid AND (p_status = 'all' OR p.status = p_status)
        ORDER BY p.created_at DESC, p.id DESC LIMIT 50 OFFSET GREATEST(COALESCE(p_offset,0),0)
    ) row;
    SELECT jsonb_build_object(
        'paid_orders', count(DISTINCT coalesce(checkout_session_id,stripe_session_id)) FILTER (WHERE status IN ('succeeded','refunded')),
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
END $function$
;
REVOKE ALL ON FUNCTION public.dashboard_vetrina_account(integer,integer,text) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.dashboard_vetrina_account(integer,integer,text) TO authenticated;
CREATE OR REPLACE FUNCTION public.blog_listing_ads(p_slug text, p_limit integer DEFAULT 3)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
    post record;
    doc text;
    regions text[] := '{}';
    cities text[] := '{}';
    words text[];
    place_names text[];
    intent text;
    sector text;
    ads jsonb := '[]';
BEGIN
    IF p_slug IS NULL OR p_slug !~ '^[a-z0-9-]{1,200}$' THEN
        RETURN jsonb_build_object('regions',regions,'listings',ads);
    END IF;
    SELECT p.slug,p.title,p.category INTO post FROM public.blog_posts p
        WHERE p.slug=p_slug AND p.published_at<=now() ORDER BY p.published_at DESC LIMIT 1;
    IF NOT FOUND THEN RETURN jsonb_build_object('regions',regions,'listings',ads); END IF;

    -- Solo titolo e slug editoriali: non corpo, link, pubblicità o riferimenti incidentali.
    doc := ' ' || data_quality.blog_ads_text(post.title || ' ' || post.slug) || ' ';
    SELECT coalesce(array_agg(DISTINCT r.name ORDER BY r.name),'{}') INTO regions
    FROM (VALUES
        ('Abruzzo',ARRAY['abruzzo','abruzzesi']),('Basilicata',ARRAY['basilicata','lucani']),
        ('Calabria',ARRAY['calabria','calabresi']),('Campania',ARRAY['campania','campani']),
        ('Emilia-Romagna',ARRAY['emilia romagna','emilia','romagna']),
        ('Friuli-Venezia Giulia',ARRAY['friuli venezia giulia','friuli','venezia giulia']),
        ('Lazio',ARRAY['lazio','laziali']),('Liguria',ARRAY['liguria','liguri']),
        ('Lombardia',ARRAY['lombardia','lombardo','lombarda','lombardi','lombarde']),
        ('Marche',ARRAY['marche','marchigiani']),('Molise',ARRAY['molise','molisani']),
        ('Piemonte',ARRAY['piemonte','piemontesi']),('Puglia',ARRAY['puglia','pugliesi']),
        ('Sardegna',ARRAY['sardegna','sardi']),('Sicilia',ARRAY['sicilia','siciliani']),
        ('Toscana',ARRAY['toscana','toscani']),
        ('Trentino-Alto Adige',ARRAY['trentino alto adige','trentino','alto adige']),
        ('Umbria',ARRAY['umbria','umbri']),('Valle d''Aosta',ARRAY['valle d aosta','valle aosta','valdostani']),
        ('Veneto',ARRAY['veneto','veneti'])
    ) r(name,aliases)
    WHERE EXISTS(SELECT 1 FROM unnest(r.aliases) alias WHERE strpos(doc,' '||alias||' ')>0);

    IF cardinality(regions)=0 THEN
        -- Zone sovraregionali: non ridurre il Garda alla sola Lombardia.
        IF strpos(doc,' lago di garda ')>0 OR strpos(doc,' lago garda ')>0 THEN
            regions:=ARRAY['Lombardia','Trentino-Alto Adige','Veneto'];
        ELSIF strpos(doc,' salento ')>0 THEN regions:=ARRAY['Puglia'];
        ELSIF strpos(doc,' costa degli dei ')>0 THEN regions:=ARRAY['Calabria'];
        ELSE
            -- Cerca solo le sequenze presenti nel titolo/slug, tramite indice: non
            -- normalizzare e scorrere migliaia di comuni ad ogni visualizzazione.
            words:=string_to_array(trim(doc),' ');
            SELECT array_agg(DISTINCT array_to_string(words[pos:pos+span],' ')) INTO place_names
            FROM generate_subscripts(words,1) pos CROSS JOIN generate_series(0,7) span
            WHERE pos+span<=cardinality(words);
            -- Comuni dall'anagrafica già presente. Omonimi tra regioni non risolti per ipotesi.
            SELECT coalesce(array_agg(DISTINCT c.name ORDER BY c.name),'{}'),
                   coalesce(array_agg(DISTINCT c.regione ORDER BY c.regione),'{}')
            INTO cities,regions FROM (
                SELECT l.name,min(l.regione) AS regione FROM data_quality.locations l
                WHERE l.name NOT LIKE '%(%' AND length(l.name)>=3
                  AND data_quality.blog_ads_text(l.name) NOT IN ('licenza','opera','costa','scala','ora','alto')
                  AND data_quality.blog_ads_text(l.name)=ANY(place_names)
                  AND (post.category IN ('Fiere','Guide Regionali') OR
                    doc ~ (' (a|in|di|mercati|mercato|posteggi|posteggio|fiera) '||data_quality.blog_ads_text(l.name)||' '))
                GROUP BY l.name HAVING count(DISTINCT l.regione)=1
            ) c;
        END IF;
    END IF;

    -- Preferenza di tema solo tra annunci con la stessa priorità Vetrina/geografica.
    IF doc ~ ' (affitto|affitti|affittare) ' AND doc !~ ' (vendere|vendita) ' THEN intent:='Affitto mensile'; END IF;
    IF doc ~ ' non alimentar(e|i) ' THEN sector:='non_alimentare';
    ELSIF doc ~ ' (alimentare|alimentari|haccp) ' OR post.category='Alimentare' THEN sector:='alimentare'; END IF;

    SELECT coalesce(jsonb_agg(chosen.item ORDER BY chosen.position),'[]') INTO ads
    FROM (
        SELECT jsonb_build_object(
            'id',a.id,'user_id',a.user_id,'titolo',a.titolo,'status',a.status,
            'comune',a.comune,'regione',a.regione,'stato',a.stato,'prezzo',a.prezzo,
            'contatto',a.contatto,'img_urls',a.img_urls,
            'dettagli_extra',jsonb_build_object('images',a.dettagli_extra->'images'),
            'expires_at',a.expires_at,
            'featured',coalesce(a.featured AND a.featured_until>now(),false),
            'featured_until',a.featured_until
        ) AS item,
        row_number() OVER (ORDER BY
            coalesce(a.featured AND a.featured_until>now(),false) DESC,
            coalesce(a.comune=ANY(cities),false) DESC,
            coalesce((CASE
                WHEN a.settore IN ('Frutta e verdura','Pesce','Carne','Formaggi e salumi',
                    'Pane e prodotti da forno','Gastronomia / cibi pronti','Dolci e pasticceria',
                    'Biologico e km0','Altro alimentare') THEN 'alimentare'
                WHEN a.settore IN ('Abbigliamento e accessori','Calzature','Biancheria e tessuti',
                    'Fiori e piante','Casalinghi','Libri e giocattoli','Gioielli e bigiotteria',
                    'Elettronica','Antiquariato','Altro non alimentare') THEN 'non_alimentare'
            END)=sector,false) DESC,
            coalesce(a.stato=intent,false) DESC,
            random()
        ) AS position
        FROM public.annunci a
        WHERE a.status='active' AND (a.expires_at IS NULL OR a.expires_at>now())
          AND a.is_demo IS NOT TRUE AND a.featured IS TRUE AND a.featured_until>now() AND a.featured_tier IN ('10d','30d','90d') AND (cardinality(regions)=0 OR a.regione=ANY(regions))
        ORDER BY position LIMIT least(3,greatest(1,coalesce(p_limit,3)))
    ) chosen;
    RETURN jsonb_build_object('regions',regions,'listings',ads);
END $function$
;
COMMENT ON FUNCTION public.blog_listing_ads(text,integer) IS 'Spazi pubblicitari: solo Vetrine attive, con geografia pertinente e rotazione fra pari; nessun riempimento gratuito.';
NOTIFY pgrst,'reload schema';
COMMIT;
