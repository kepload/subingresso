'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const patch=fs.readFileSync(path.join(root,'PATCH_BLOG_VETRINE_ADS_20261026.sql'),'utf8')
 .replace(/^BEGIN;$/m,'').replace(/^COMMIT;$/m,'')
 .replace('CREATE TABLE IF NOT EXISTS public.blog_listing_ad_events','CREATE TEMP TABLE blog_listing_ad_events')
 .replaceAll('public.blog_listing_ad_events','pg_temp.blog_listing_ad_events')
 .replaceAll('public.profiles','pg_temp.ads_profiles').replaceAll('public.annunci','pg_temp.ads_listings')
 .replaceAll('public.blog_posts','pg_temp.ads_posts').replaceAll('public.blog_listing_ads(','pg_temp.ads_context(');
const sql=`BEGIN;
CREATE TEMP TABLE ads_profiles(id uuid,is_admin boolean,is_demo boolean);
INSERT INTO ads_profiles VALUES('00000000-0000-4000-8000-000000000001',true,false),('00000000-0000-4000-8000-000000000002',false,false),('00000000-0000-4000-8000-000000000003',false,true);
CREATE TEMP TABLE ads_listings(id uuid,user_id uuid,titolo text,comune text DEFAULT 'Milano',regione text DEFAULT 'Lombardia',stato text DEFAULT 'Vendita',prezzo numeric DEFAULT 15000,img_urls text[] DEFAULT '{}',status text DEFAULT 'active',is_demo boolean DEFAULT false,featured boolean DEFAULT true,featured_until timestamptz DEFAULT now()+interval '1 day',featured_tier text DEFAULT '30d',expires_at timestamptz DEFAULT now()+interval '1 year');
INSERT INTO ads_listings(id,user_id,titolo) VALUES('00000000-0000-4000-8000-000000000010','00000000-0000-4000-8000-000000000002','Posteggio prova');
INSERT INTO ads_listings SELECT '00000000-0000-4000-8000-000000000011',user_id,'Posteggio scaduto',comune,regione,stato,prezzo,img_urls,status,is_demo,featured,now()-interval '1 day',featured_tier,expires_at FROM ads_listings;
CREATE TEMP TABLE ads_posts(slug text,published_at timestamptz DEFAULT now()-interval '1 day');
INSERT INTO ads_posts(slug) VALUES('lombardia'),('veneto'),('nazionale');
CREATE FUNCTION pg_temp.ads_context(text,integer) RETURNS jsonb LANGUAGE sql AS $context$ SELECT jsonb_build_object('regions',CASE WHEN $1='nazionale' THEN '[]'::jsonb WHEN $1='veneto' THEN '["Veneto"]'::jsonb ELSE '["Lombardia"]'::jsonb END,'listings','[]'::jsonb) $context$;
${patch}
DO $test$
DECLARE first_id uuid; second_id uuid; report jsonb; r jsonb; n bigint; bad boolean:=false;
BEGIN
 IF has_table_privilege('anon','pg_temp.blog_listing_ad_events','SELECT') OR has_table_privilege('authenticated','pg_temp.blog_listing_ad_events','INSERT') THEN RAISE EXCEPTION 'Tabella esposta'; END IF;
 IF has_function_privilege('anon','public.admin_blog_listing_ads(integer)','EXECUTE') THEN RAISE EXCEPTION 'RPC admin pubblica'; END IF;
 PERFORM set_config('request.jwt.claims','{}',true);
 BEGIN PERFORM public.admin_blog_listing_ads(30); EXCEPTION WHEN insufficient_privilege THEN bad:=true; END; IF NOT bad THEN RAISE EXCEPTION 'Anon admin'; END IF;
 first_id:=public.blog_listing_ad_event('00000000-0000-4000-8000-000000000010','lombardia','blog_inline','impression','synthetic-session');
 second_id:=public.blog_listing_ad_event('00000000-0000-4000-8000-000000000010','lombardia','blog_inline','impression','synthetic-session');
 IF first_id IS NULL OR first_id<>second_id THEN RAISE EXCEPTION 'Deduplica'; END IF;
 PERFORM public.blog_listing_ad_event('00000000-0000-4000-8000-000000000010','lombardia','blog_inline','click','synthetic-session');
 PERFORM public.blog_listing_ad_event('00000000-0000-4000-8000-000000000010','nazionale','blog_closing','click','unmeasured-session');
 IF public.blog_listing_ad_event('00000000-0000-4000-8000-000000000010','veneto','blog_inline','click','synthetic-session') IS NOT NULL THEN RAISE EXCEPTION 'Fuori regione'; END IF;
 IF public.blog_listing_ad_event('00000000-0000-4000-8000-000000000011','lombardia','blog_inline','click','synthetic-session') IS NOT NULL THEN RAISE EXCEPTION 'Scaduto'; END IF;
 IF public.blog_listing_ad_event('00000000-0000-4000-8000-000000000010','inesistente','blog_inline','click','synthetic-session') IS NOT NULL THEN RAISE EXCEPTION 'Articolo inesistente'; END IF;
 bad:=false;BEGIN PERFORM public.blog_listing_ad_event('00000000-0000-4000-8000-000000000010','lombardia','blog_inline','invalid','synthetic-session'); EXCEPTION WHEN invalid_parameter_value THEN bad:=true;END;IF NOT bad THEN RAISE EXCEPTION 'Validazione';END IF;
 SELECT count(*) INTO n FROM pg_temp.blog_listing_ad_events;
 PERFORM set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000002"}',true);
 PERFORM public.blog_listing_ad_event('00000000-0000-4000-8000-000000000010','lombardia','blog_inline','click','owner-session');
 PERFORM set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000003"}',true);
 PERFORM public.blog_listing_ad_event('00000000-0000-4000-8000-000000000010','lombardia','blog_inline','click','demo-session');
 PERFORM set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001"}',true);
 PERFORM public.blog_listing_ad_event('00000000-0000-4000-8000-000000000010','lombardia','blog_inline','click','admin-session');
 IF (SELECT count(*) FROM pg_temp.blog_listing_ad_events)<>n THEN RAISE EXCEPTION 'Esclusioni identità';END IF;
 report:=public.admin_blog_listing_ads(30);
 IF jsonb_array_length(report->'listings')<>1 OR jsonb_array_length(report->'rows')<>2 THEN RAISE EXCEPTION 'Inventario/report %',report; END IF;
 SELECT value INTO r FROM jsonb_array_elements(report->'rows') WHERE value->>'post_slug'='lombardia';
 IF (r->>'clicks')::int<>1 OR (r->>'impressions')::int<>1 OR (r->>'measured_clicks')::int<>1 THEN RAISE EXCEPTION 'CTR %',r;END IF;
 SELECT value INTO r FROM jsonb_array_elements(report->'rows') WHERE value->>'post_slug'='nazionale';
 IF (r->>'measured_clicks')::int<>0 THEN RAISE EXCEPTION 'Clic non misurato';END IF;
 UPDATE pg_temp.ads_listings SET featured_until=now()-interval '1 day';
 report:=public.admin_blog_listing_ads(30);
 IF (report->'listings'->0->>'active')::boolean OR jsonb_array_length(report->'rows')<>2 THEN RAISE EXCEPTION 'Storico perso'; END IF;
 UPDATE pg_temp.blog_listing_ad_events SET created_at=now()-interval '31 days' WHERE kind='impression';
 report:=public.admin_blog_listing_ads(30);
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(report->'rows') e WHERE (e->>'measured_clicks')::int>0) THEN RAISE EXCEPTION 'CTR fuori periodo'; END IF;
END $test$;
SELECT jsonb_build_object('passed',true,'rollback',true,'real_customer_writes',0,'checks','RLS/admin,validazione,deduplica,geografia,scadenza,owner/demo/admin,CTR,periodo,storico') AS result;
ROLLBACK;`;
(async()=>{
 const settings=JSON.parse(fs.readFileSync(path.join(root,'.claude/settings.local.json'),'utf8'));
 const token=process.env.SUPABASE_ACCESS_TOKEN||settings.env?.SUPABASE_ACCESS_TOKEN;assert(token);
 const response=await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)});
 const result=await response.json();if(!response.ok)throw Error(JSON.stringify(result));assert(result.some(r=>r.result?.passed));console.log(JSON.stringify(result));
 if(process.env.BLOG_VETRINE_QA_DIR)fs.writeFileSync(path.join(process.env.BLOG_VETRINE_QA_DIR,'db-rollback.json'),JSON.stringify(result,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
