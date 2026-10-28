'use strict';
// Real SQL, isolated fixture relations, no customer writes; always ROLLBACK.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
let migration=fs.readFileSync(path.join(root,'PATCH_BLOG_AD_READERSHIP_20261028.sql'),'utf8');
assert(migration.includes('FROM data_quality.analytics_page_views'));
assert(!/INSERT|UPDATE|DELETE|CREATE TABLE|CREATE TRIGGER/.test(migration));
migration=migration.replace(/^BEGIN;$/m,'').replace(/^COMMIT;$/m,'').replaceAll('data_quality.analytics_page_views','pg_temp.qa_blog_visits').replaceAll('public.profiles','pg_temp.qa_blog_profiles').replaceAll('public.blog_posts','pg_temp.qa_blog_posts');
const sql=`BEGIN;
SET LOCAL TIME ZONE 'Europe/Rome';
CREATE TEMP TABLE qa_blog_profiles(id uuid,is_admin boolean);
CREATE TEMP TABLE qa_blog_posts(slug text,title text);
CREATE TEMP TABLE qa_blog_raw(path text,created_at timestamptz,internal boolean DEFAULT false);
CREATE TEMP VIEW qa_blog_visits AS SELECT path,created_at FROM qa_blog_raw WHERE NOT internal;
${migration}
DO $test$
DECLARE cutoff timestamptz:=now()-interval '5 minutes'; report jsonb; sum_rows bigint; admin_id uuid:='00000000-0000-4000-8000-000000000001';
BEGIN
 INSERT INTO qa_blog_profiles VALUES(admin_id,true),('00000000-0000-4000-8000-000000000002',false);
 INSERT INTO qa_blog_posts VALUES('articolo-a','Titolo A'),('articolo-b','Titolo B');
 INSERT INTO qa_blog_raw(path,created_at) VALUES
 ('/blog/articolo-a',cutoff-interval '168 hours'),('/blog/articolo-a',cutoff-interval '1 day'),
 ('/blog/articolo-b',cutoff-interval '1 day'),('/blog/articolo-b',cutoff),
 ('/blog/articolo-a',cutoff-interval '168 hours 1 millisecond'),('/blog/articolo-a',cutoff+interval '1 millisecond'),
 ('/blog',cutoff-interval '1 hour'),('/annunci',cutoff-interval '1 hour');
 INSERT INTO qa_blog_raw VALUES('/blog/articolo-a',cutoff-interval '1 hour',true);
 PERFORM set_config('request.jwt.claims','{}',true);
 BEGIN PERFORM public.admin_blog_ad_readership(7,cutoff);RAISE EXCEPTION 'Anonymous access';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 PERFORM set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
 BEGIN PERFORM public.admin_blog_ad_readership(7,cutoff);RAISE EXCEPTION 'Customer access';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',admin_id,'role','authenticated')::text,true);
 BEGIN PERFORM public.admin_blog_ad_readership(8,cutoff);RAISE EXCEPTION 'Invalid days';EXCEPTION WHEN invalid_parameter_value THEN NULL;END;
 BEGIN PERFORM public.admin_blog_ad_readership(7,now()+interval '1 second');RAISE EXCEPTION 'Future snapshot';EXCEPTION WHEN invalid_parameter_value THEN NULL;END;
 BEGIN PERFORM public.admin_blog_ad_readership(7,'infinity');RAISE EXCEPTION 'Infinite snapshot';EXCEPTION WHEN invalid_parameter_value THEN NULL;END;
 report:=public.admin_blog_ad_readership(7,cutoff);
 IF (report->>'total_visits')::int<>4 OR (report->>'until')::timestamptz<>cutoff OR (report->>'since')::timestamptz<>cutoff-interval '168 hours' THEN RAISE EXCEPTION 'Snapshot or counting %',report;END IF;
 SELECT sum((r->>'visits')::bigint) INTO sum_rows FROM jsonb_array_elements(report->'rows') r;
 IF sum_rows<>4 OR (SELECT count(*) FROM jsonb_array_elements(report->'rows') r WHERE r->>'article_slug'='articolo-b')<>2 THEN RAISE EXCEPTION 'Article totals';END IF;
 IF EXISTS(SELECT FROM jsonb_array_elements(report->'rows') r WHERE r->>'event_day' !~ '^\\d{4}-\\d{2}-\\d{2}$' OR r->>'article_title' NOT IN('Titolo A','Titolo B')) THEN RAISE EXCEPTION 'UTC dates or titles';END IF;
 IF report::text LIKE '%session_id%' OR report::text LIKE '%visitor_id%' OR report::text LIKE '%user_id%' THEN RAISE EXCEPTION 'Identity exposed';END IF;
 IF has_function_privilege('anon','public.admin_blog_ad_readership(integer,timestamptz)','EXECUTE') OR NOT has_function_privilege('authenticated','public.admin_blog_ad_readership(integer,timestamptz)','EXECUTE') THEN RAISE EXCEPTION 'RPC privileges';END IF;
 DELETE FROM qa_blog_raw;
 report:=public.admin_blog_ad_readership(7,cutoff);
 IF (report->>'total_visits')::int<>0 OR report->'rows'<>'[]'::jsonb OR report->>'started_at' IS NOT NULL THEN RAISE EXCEPTION 'Empty report';END IF;
END $test$;
SELECT jsonb_build_object('passed',true,'rollback',true,'customer_writes',0,'checks','admin-only, filtered views, UTC days, exact cutoff, window boundaries, independent article visits, totals, empty state, no identities') result;
ROLLBACK;`;
(async()=>{
 const settings=JSON.parse(fs.readFileSync(process.env.PERSONAL_ADS_SETTINGS||path.join(root,'.claude/settings.local.json'),'utf8'));
 const token=process.env.SUPABASE_ACCESS_TOKEN||settings.env?.SUPABASE_ACCESS_TOKEN;assert(token);
 const response=await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)});
 const data=await response.json();if(!response.ok)throw Error(JSON.stringify(data));assert(data.some(row=>row.result?.passed));
 if(process.env.BLOG_READERSHIP_QA_DIR)fs.writeFileSync(path.join(process.env.BLOG_READERSHIP_QA_DIR,'db-rollback.json'),JSON.stringify(data,null,2));
 console.log(JSON.stringify(data));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
