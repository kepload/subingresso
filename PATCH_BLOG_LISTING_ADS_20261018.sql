-- Solo lettura: selezione contestuale su tutti gli annunci idonei, senza il limite dei 24 recenti.
BEGIN;
CREATE OR REPLACE FUNCTION data_quality.blog_ads_text(value text) RETURNS text
LANGUAGE sql IMMUTABLE SET search_path='' AS $$
    SELECT trim(regexp_replace(lower(translate(coalesce(value,''),
        'àáâäèéêëìíîïòóôöùúûüÀÁÂÄÈÉÊËÌÍÎÏÒÓÔÖÙÚÛÜ',
        'aaaaeeeeiiiioooouuuuAAAAEEEEIIIIOOOOUUUU')), '[^a-z0-9]+', ' ', 'g'))
$$;
REVOKE ALL ON FUNCTION data_quality.blog_ads_text(text) FROM PUBLIC,anon,authenticated;
CREATE INDEX IF NOT EXISTS dq_blog_ads_places_name
    ON data_quality.locations(data_quality.blog_ads_text(name)) WHERE name NOT LIKE '%(%';

CREATE OR REPLACE FUNCTION public.blog_listing_ads(p_slug text, p_limit integer DEFAULT 3)
RETURNS jsonb LANGUAGE plpgsql VOLATILE SECURITY DEFINER SET search_path='' AS $$
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
          AND a.is_demo IS NOT TRUE AND (cardinality(regions)=0 OR a.regione=ANY(regions))
        ORDER BY position LIMIT least(3,greatest(1,coalesce(p_limit,3)))
    ) chosen;
    RETURN jsonb_build_object('regions',regions,'listings',ads);
END $$;
REVOKE ALL ON FUNCTION public.blog_listing_ads(text,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.blog_listing_ads(text,integer) TO anon,authenticated,service_role;
COMMENT ON FUNCTION public.blog_listing_ads(text,integer) IS
    'Blog: geografia editoriale, Vetrine prima dei gratuiti, tema e rotazione casuale tra pari. Solo campi pubblici, massimo tre annunci.';
COMMIT;
