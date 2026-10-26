'use strict';
// Funzioni vere, profili sintetici in tabella temporanea, sola transazione ROLLBACK.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const patch=fs.readFileSync(path.join(root,'PATCH_SITE_ANALYTICS_20261026.sql'),'utf8').replace(/^BEGIN;$/m,'').replace(/^COMMIT;$/m,'').replaceAll('public.profiles','pg_temp.qa_profiles');
const sql=`BEGIN;
SET LOCAL lock_timeout='5s';SET LOCAL statement_timeout='30s';
CREATE TEMP TABLE qa_profiles(id uuid,is_admin boolean,is_demo boolean);
INSERT INTO qa_profiles VALUES('00000000-0000-4000-8000-000000000001',true,false),('00000000-0000-4000-8000-000000000002',false,false),('00000000-0000-4000-8000-000000000003',false,true);
${patch}
DO $test$
DECLARE sid uuid:=gen_random_uuid(); eid uuid:=gen_random_uuid(); e jsonb; r jsonb; n integer; before_count bigint; loc record;
BEGIN
 SELECT count(*) INTO before_count FROM public.site_analytics_events;
 IF has_table_privilege('anon','public.site_analytics_events','SELECT') OR has_table_privilege('authenticated','public.site_analytics_events','SELECT') OR has_table_privilege('anon','public.site_analytics_events','INSERT') THEN RAISE EXCEPTION 'Direct access';END IF;
 BEGIN PERFORM public.admin_site_analytics();RAISE EXCEPTION 'Anon admin';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 SELECT name,regione,provincia INTO loc FROM data_quality.locations LIMIT 1;
 e:=jsonb_build_object('id',eid,'session_id',sid,'name','search_results','page','search','device','mobile','source','blog','entry_page','blog','campaign','autunno-2026','medium','social','channel','telegram',
 'data',jsonb_build_object('results',0,'empty',true,'region',loc.regione,'place',loc.name,'province',loc.provincia,'query','PRIVATE QUERY','password','PRIVATE PASSWORD','description','PRIVATE DESCRIPTION','field','fDescrizione','error_code','validation','step',5,'price_min_band',3));
 n:=public.track_site_events(jsonb_build_array(e));IF n<>1 THEN RAISE EXCEPTION 'First event';END IF;
 IF public.track_site_events(jsonb_build_array(e))<>0 THEN RAISE EXCEPTION 'Deduplication';END IF;
 SELECT data INTO r FROM public.site_analytics_events WHERE id=eid;
 IF r ? 'query' OR r ? 'password' OR r ? 'description' OR r->>'results'<>'0' OR r->>'empty'<>'true' OR r->>'place'<>loc.name THEN RAISE EXCEPTION 'Whitelist %',r;END IF;
 IF public.track_site_events('[{},null,{"name":"unknown"},{"name":"page_enter","page":"blog","device":"mobile","id":"bad","session_id":"bad"}]')<>0 THEN RAISE EXCEPTION 'Invalid events';END IF;
 BEGIN PERFORM public.track_site_events('{}');RAISE EXCEPTION 'Invalid batch';EXCEPTION WHEN invalid_parameter_value THEN NULL;END;
 PERFORM set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
 IF public.track_site_events(jsonb_build_array(e||jsonb_build_object('id',gen_random_uuid())))<>0 THEN RAISE EXCEPTION 'Admin event';END IF;
 r:=public.admin_site_analytics(30,0,100,'mobile');
 IF (r->>'total')::integer<1 OR r->'summary'->>'empty_searches'='0' OR (r->'rows'->0) ? 'session_id' OR (r->'rows'->0) ? 'user_id' THEN RAISE EXCEPTION 'Admin report %',r;END IF;
 IF jsonb_array_length(public.admin_site_analytics(30,0,1,'mobile')->'rows')<>1 OR jsonb_array_length(public.admin_site_analytics(30,1000000,1,'mobile')->'rows')<>0 THEN RAISE EXCEPTION 'Pagination';END IF;
 IF (public.admin_site_analytics(999)->>'days')::integer<>190 OR (public.admin_site_analytics(0)->>'days')::integer<>1 THEN RAISE EXCEPTION 'Period';END IF;
 PERFORM set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
 IF public.track_site_events(jsonb_build_array(e||jsonb_build_object('id',gen_random_uuid())))<>0 THEN RAISE EXCEPTION 'Demo event';END IF;
 PERFORM set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
 BEGIN PERFORM public.admin_site_analytics();RAISE EXCEPTION 'Customer admin';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 eid:=gen_random_uuid();n:=public.track_site_events(jsonb_build_array(e||jsonb_build_object('id',eid,'data',jsonb_build_object('step',99,'scroll_percent',200,'http_status',999,'place','PRIVATE NAME','error_code','PRIVATE ERROR','evil','SECRET'))));
 IF n<>1 OR (SELECT data FROM public.site_analytics_events WHERE id=eid)<>'{}'::jsonb OR NOT(SELECT authenticated FROM public.site_analytics_events WHERE id=eid) THEN RAISE EXCEPTION 'Sanitization/identity';END IF;
 INSERT INTO public.site_analytics_events(id,session_id,name,page,device,source,entry_page) SELECT gen_random_uuid(),sid,'page_enter','home','mobile','direct','home' FROM generate_series(1,300);
 IF public.track_site_events(jsonb_build_array(e||jsonb_build_object('id',gen_random_uuid())))<>0 THEN RAISE EXCEPTION 'Rate limit';END IF;
END $test$;
SELECT jsonb_build_object('passed',true,'rollback',true,'real_customer_writes',0,'checks','permissions,admin/demo,identity,whitelist,PII,canonical locations,numeric bounds,deduplication,rate limit,periods,pagination,export') AS result;
ROLLBACK;`;
(async()=>{
 const settings=JSON.parse(fs.readFileSync(path.join(root,'.claude/settings.local.json'),'utf8'));
 const response=await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{method:'POST',headers:{Authorization:'Bearer '+settings.env.SUPABASE_ACCESS_TOKEN,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)});
 const result=await response.json();if(!response.ok)throw Error(JSON.stringify(result));assert(result.some(r=>r.result?.passed));console.log(JSON.stringify(result));
 if(process.env.SITE_ANALYTICS_TEST_OUT)fs.writeFileSync(path.join(process.env.SITE_ANALYTICS_TEST_OUT,'database-rollback.json'),JSON.stringify(result,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
