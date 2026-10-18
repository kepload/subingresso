// Funzione SQL reale su tabelle temporanee, dentro ROLLBACK. Nessun annuncio/email reale.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const patch = fs.readFileSync(path.join(root, 'PATCH_BLOG_LISTING_ADS_20261018.sql'), 'utf8');
const helperStart = patch.indexOf('CREATE OR REPLACE FUNCTION data_quality.blog_ads_text');
const helper = patch.slice(helperStart, patch.indexOf('$$;', helperStart) + 3);
const functionStart = patch.indexOf('CREATE OR REPLACE FUNCTION public.blog_listing_ads');
const production = patch.slice(functionStart, patch.indexOf('END $$;', functionStart) + 7);
assert(helper.includes('IMMUTABLE') && production.endsWith('END $$;'));
const fixtureFunction = production.replace('FUNCTION public.blog_listing_ads', 'FUNCTION pg_temp.blog_listing_ads')
    .replaceAll('public.blog_posts', 'pg_temp.blog_ads_posts').replaceAll('public.annunci', 'pg_temp.blog_ads_listings')
    .replaceAll('data_quality.locations', 'pg_temp.blog_ads_locations');
const sql = `BEGIN;
${helper}
CREATE TEMP TABLE blog_ads_posts(slug text,title text,category text,published_at timestamptz DEFAULT now()-interval '1 day');
CREATE TEMP TABLE blog_ads_locations(name text,regione text);
CREATE TEMP TABLE blog_ads_listings(id text,user_id text DEFAULT 'owner',titolo text DEFAULT 'Posteggio',
 status text DEFAULT 'active',comune text DEFAULT 'Milano',regione text DEFAULT 'Lombardia',
 stato text DEFAULT 'Vendita',prezzo numeric DEFAULT 10000,contatto text DEFAULT 'Telefono',
 img_urls text[] DEFAULT '{}',dettagli_extra jsonb DEFAULT '{"images":["https://example.invalid/photo.jpg"],"tel":"private","email":"private"}',
 expires_at timestamptz DEFAULT now()+interval '1 year',featured boolean DEFAULT false,
 featured_until timestamptz,settore text DEFAULT 'Abbigliamento e accessori',is_demo boolean DEFAULT false,
 created_at timestamptz DEFAULT now());
INSERT INTO blog_ads_locations VALUES ('Gattinara','Piemonte'),('Roma','Lazio'),('Firenze','Toscana'),
 ('Licenza','Lazio'),('San Martino','Lombardia'),('San Martino','Veneto'),('Noto','Sicilia');
INSERT INTO blog_ads_posts(slug,title,category) VALUES
 ('generico','Quanto costa un posteggio al mercato?','Guida'),
 ('lombardia','Le migliori fiere in Lombardia','Fiere'),
 ('bandi-lombardia','Bandi posteggi mercatali Lombardia','Bandi'),
 ('piemonte-liguria','Posteggi in Piemonte e Liguria','Guide Regionali'),
 ('garda','Mercati sul Lago di Garda','Guida'),('salento','Mercati nel Salento','Guida'),
 ('gattinara','Fiera di San Martino a Gattinara','Fiere'),
 ('licenza','Cessione di licenza ambulante: cosa serve','Guida'),
 ('citta','Mercati a Roma','Guida'),('vuoto','Mercati in Basilicata','Guide Regionali'),
 ('sardegna','Posteggi in Sardegna','Guide Regionali'),
 ('alimentare','HACCP per ambulanti alimentari','Alimentare'),
 ('affitti','Come scegliere un affitto al mercato','Guida'),
 ('non-alimentare','Vendere prodotti non alimentari','Guida'),
 ('futuro','Mercati in Lombardia','Fiere');
UPDATE blog_ads_posts SET published_at=now()+interval '1 year' WHERE slug='futuro';
INSERT INTO blog_ads_listings(id,regione,comune,featured,featured_until,settore,stato,created_at)
 SELECT 'featured-'||i, (ARRAY['Lombardia','Veneto','Piemonte','Liguria'])[1+i%4],
 CASE WHEN i=2 THEN 'Gattinara' ELSE 'Altro comune' END,true,now()+interval '30 days',
 CASE WHEN i%10=0 THEN 'Frutta e verdura' ELSE 'Abbigliamento e accessori' END,
 CASE WHEN i%7=0 THEN 'Affitto mensile' ELSE 'Vendita' END,now()-interval '5 years'
 FROM generate_series(0,59) i;
INSERT INTO blog_ads_listings(id) SELECT 'free-'||i FROM generate_series(0,99) i;
INSERT INTO blog_ads_listings(id,regione) VALUES ('local-free-1','Sardegna'),('local-free-2','Sardegna');
INSERT INTO blog_ads_listings(id,featured,featured_until,status,expires_at,is_demo) VALUES
 ('expired',true,now()+interval '1 year','active',now()-interval '1 day',false),
 ('pending',true,now()+interval '1 year','pending',now()+interval '1 year',false),
 ('rejected',true,now()+interval '1 year','rejected',now()+interval '1 year',false),
 ('demo',true,now()+interval '1 year','active',now()+interval '1 year',true),
 ('ended',true,now()-interval '1 day','active',NULL,false);
${fixtureFunction}
DO $$ DECLARE r jsonb; item jsonb; counts jsonb:='{}'; k text; n integer; BEGIN
 r:=pg_temp.blog_listing_ads('generico');
 IF jsonb_array_length(r->'listings')<>3 OR r->'regions'<>'[]'::jsonb THEN RAISE EXCEPTION 'Generic selection'; END IF;
 FOR item IN SELECT * FROM jsonb_array_elements(r->'listings') LOOP
   IF item->>'id' NOT LIKE 'featured-%' THEN RAISE EXCEPTION 'Old Vetrine excluded by recent free listings'; END IF;
   IF item ? 'tel' OR item ? 'email' OR item->'dettagli_extra' ? 'tel' OR item->'dettagli_extra' ? 'email' THEN RAISE EXCEPTION 'PII projection'; END IF;
 END LOOP;
 FOREACH k IN ARRAY ARRAY['lombardia','bandi-lombardia'] LOOP
   r:=pg_temp.blog_listing_ads(k);
   IF r->'regions'<>'["Lombardia"]'::jsonb THEN RAISE EXCEPTION 'Region context %',k; END IF;
   IF EXISTS(SELECT 1 FROM jsonb_array_elements(r->'listings') x WHERE x->>'regione'<>'Lombardia' OR NOT (x->>'featured')::boolean) THEN RAISE EXCEPTION 'Regional paid priority'; END IF;
 END LOOP;
 r:=pg_temp.blog_listing_ads('piemonte-liguria');
 IF jsonb_array_length(r->'regions')<>2 OR EXISTS(SELECT 1 FROM jsonb_array_elements(r->'listings') x WHERE x->>'regione' NOT IN ('Piemonte','Liguria')) THEN RAISE EXCEPTION 'Multiple regions'; END IF;
 r:=pg_temp.blog_listing_ads('garda');
 IF r->'regions'<>'["Lombardia","Trentino-Alto Adige","Veneto"]'::jsonb THEN RAISE EXCEPTION 'Garda %',r->'regions'; END IF;
 r:=pg_temp.blog_listing_ads('gattinara');
 IF r->'regions'<>'["Piemonte"]'::jsonb OR r->'listings'->0->>'id'<>'featured-2' THEN RAISE EXCEPTION 'City context %',r; END IF;
 r:=pg_temp.blog_listing_ads('citta');
 IF r->'regions'<>'["Lazio"]'::jsonb THEN RAISE EXCEPTION 'Rome'; END IF;
 r:=pg_temp.blog_listing_ads('licenza');
 IF r->'regions'<>'[]'::jsonb THEN RAISE EXCEPTION 'False positive: Licenza municipality'; END IF;
 r:=pg_temp.blog_listing_ads('sardegna');
 IF jsonb_array_length(r->'listings')<>2 OR EXISTS(SELECT 1 FROM jsonb_array_elements(r->'listings') x WHERE x->>'regione'<>'Sardegna' OR (x->>'featured')::boolean) THEN RAISE EXCEPTION 'Local free beats unrelated paid'; END IF;
 r:=pg_temp.blog_listing_ads('alimentare');
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(r->'listings') x WHERE (substring(x->>'id' FROM 10)::integer)%10<>0) THEN RAISE EXCEPTION 'Food relevance'; END IF;
 r:=pg_temp.blog_listing_ads('non-alimentare');
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(r->'listings') x WHERE (substring(x->>'id' FROM 10)::integer)%10=0) THEN RAISE EXCEPTION 'Non-food relevance'; END IF;
 r:=pg_temp.blog_listing_ads('affitti');
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(r->'listings') x WHERE x->>'stato'<>'Affitto mensile') THEN RAISE EXCEPTION 'Rental relevance'; END IF;
 IF jsonb_array_length(pg_temp.blog_listing_ads('generico',999)->'listings')<>3
 OR jsonb_array_length(pg_temp.blog_listing_ads('generico',-1)->'listings')<>1
 OR jsonb_array_length(pg_temp.blog_listing_ads('generico',NULL)->'listings')<>3 THEN RAISE EXCEPTION 'Limit clamp'; END IF;
 FOREACH k IN ARRAY ARRAY['vuoto','mancante','futuro','bad/slug'] LOOP
   IF pg_temp.blog_listing_ads(k)->'listings'<>'[]'::jsonb THEN RAISE EXCEPTION 'Empty/unknown/future/invalid %',k; END IF;
 END LOOP;
 FOR n IN 1..800 LOOP
   r:=pg_temp.blog_listing_ads('generico');
   IF jsonb_array_length(r->'listings')<>3 OR (SELECT count(DISTINCT x->>'id') FROM jsonb_array_elements(r->'listings') x)<>3 THEN RAISE EXCEPTION 'Missing/duplicate slot'; END IF;
   FOR item IN SELECT * FROM jsonb_array_elements(r->'listings') LOOP
     k:=item->>'id';
     IF k NOT LIKE 'featured-%' THEN RAISE EXCEPTION 'Ineligible/fallback while paid pool full: %',k; END IF;
     counts:=jsonb_set(counts,ARRAY[k],to_jsonb(coalesce((counts->>k)::integer,0)+1));
   END LOOP;
 END LOOP;
 IF (SELECT count(*) FROM jsonb_each(counts))<>60 OR (SELECT min(value::integer) FROM jsonb_each_text(counts))<5
 OR (SELECT max(value::integer) FROM jsonb_each_text(counts))>100 THEN RAISE EXCEPTION 'Rotation coverage/bias: %',counts; END IF;
 -- Testa il riempimento: una Vetrina locale, poi gratuiti locali; zero Vetrine -> tutti gratuiti.
 UPDATE blog_ads_listings SET featured=false WHERE id NOT IN ('featured-0','ended');
 r:=pg_temp.blog_listing_ads('lombardia');
 IF r->'listings'->0->>'id'<>'featured-0' OR jsonb_array_length(r->'listings')<>3 THEN RAISE EXCEPTION 'Mixed slots'; END IF;
 UPDATE blog_ads_listings SET featured=false WHERE id='featured-0';
 r:=pg_temp.blog_listing_ads('generico');
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(r->'listings') x WHERE (x->>'featured')::boolean OR x->>'id' IN ('expired','pending','rejected','demo')) THEN RAISE EXCEPTION 'No paid fallback/expired flags'; END IF;
 DELETE FROM blog_ads_listings WHERE id<>'ended';
 r:=pg_temp.blog_listing_ads('generico');
 IF jsonb_array_length(r->'listings')<>1 OR (r->'listings'->0->>'featured')::boolean THEN RAISE EXCEPTION 'Ended promotion is free'; END IF;
 DELETE FROM blog_ads_listings;
 IF pg_temp.blog_listing_ads('generico')->'listings'<>'[]'::jsonb THEN RAISE EXCEPTION 'No inventory'; END IF;
 RAISE NOTICE 'OK: 60 simultaneous Vetrine, 800 rotations, geography, topics, eligibility, privacy and all fallbacks';
END $$;
SELECT jsonb_build_object('passed',true,'simultaneousVetrine',60,'rotations',800,'temporaryFixtures',true,'rolledBack',true) AS result;
ROLLBACK;`;

(async () => {
    const out = process.env.BLOG_ADS_QA_DIR;
    if (out) { fs.mkdirSync(out,{recursive:true}); fs.writeFileSync(path.join(out,'database-test.sql'),sql); }
    const settingsPath = process.env.BLOG_ADS_SETTINGS || path.join(root,'.claude/settings.local.json');
    const settings = process.env.SUPABASE_ACCESS_TOKEN ? null : JSON.parse(fs.readFileSync(settingsPath,'utf8'));
    const token = process.env.SUPABASE_ACCESS_TOKEN || settings.env?.SUPABASE_ACCESS_TOKEN;
    assert(token,'SUPABASE_ACCESS_TOKEN mancante');
    const response = await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{
        method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
        body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(result));
    assert(result.some(row=>row.result?.passed),'Risultato test mancante');
    if (out) fs.writeFileSync(path.join(out,'database-test.json'),JSON.stringify({at:new Date().toISOString(),result},null,2));
    console.log('OK: SQL reale, 60 Vetrine simultanee, 800 rotazioni, regioni/città/Garda, tema, scadenze, privacy e fallback. Tabelle temporanee annullate.');
})().catch(error=>{console.error(error.message);process.exitCode=1;});
