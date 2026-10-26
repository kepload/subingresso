'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),root=path.resolve(__dirname,'..');
let base=fs.readFileSync(path.join(root,'PATCH_PERSONAL_ADS_20261024.sql'),'utf8').replace(/^BEGIN;$/m,'').replace(/^COMMIT;$/m,'').replace('REFERENCES auth.users(id) ON DELETE CASCADE','').replace('UNIQUE(ad_id,format,placement,kind,session_id)','CONSTRAINT personal_ad_events_ad_id_format_placement_kind_session_id_key UNIQUE(ad_id,format,placement,kind,session_id)');
let patch=fs.readFileSync(path.join(root,'PATCH_PERSONAL_AD_CONTEXT_20261026.sql'),'utf8').replace(/^BEGIN;$/m,'').replace(/^COMMIT;$/m,'');
for(const name of ['personal_ad_events','personal_ad_fair_actions','profiles','annunci','payments','saved_fairs','contact_reveals','blog_posts']){base=base.replaceAll('public.'+name,'pg_temp.pa_'+name);patch=patch.replaceAll('public.'+name,'pg_temp.pa_'+name);}
const sql=`BEGIN;
CREATE TEMP TABLE pa_profiles(id uuid,created_at timestamptz,is_admin boolean DEFAULT false,is_demo boolean DEFAULT false);
CREATE TEMP TABLE pa_annunci(id uuid,user_id uuid,created_at timestamptz,status text,is_demo boolean DEFAULT false);
CREATE TEMP TABLE pa_contact_reveals(id integer,revealer_id uuid,seller_id uuid,created_at timestamptz);
CREATE TEMP TABLE pa_saved_fairs(id uuid,user_id uuid,created_at timestamptz);
CREATE TEMP TABLE pa_blog_posts(slug text,title text,published_at timestamptz);
CREATE TEMP TABLE pa_payments(id uuid,user_id uuid,created_at timestamptz,paid_at timestamptz,checkout_session_id text,stripe_session_id text,status text,currency text,amount_cents bigint,refunded_cents bigint);
${base}
${patch}
DO $test$
DECLARE admin_id uuid:='00000000-0000-4000-8000-000000000001'; user_a uuid:='00000000-0000-4000-8000-000000000002'; user_b uuid:='00000000-0000-4000-8000-000000000003';
 ctx jsonb:='{"article_slug":"fiera-a","creative_version":6,"source":"blog","device_class":"phone","referrer_type":"search","topics":["fiere"],"keywords":["fiera"],"match_basis":"title","engine_version":4,"candidate_count":6,"post_rule_revision":0,"ad_rule_revision":0,"visible_ms":1500,"page_ms":3000,"scroll_percent":50,"motion":"static"}';
 impression_a uuid; click_a uuid; click_b uuid; old_click uuid; report jsonb; row jsonb; raw jsonb; next_page jsonb; bad jsonb; n integer;
BEGIN
 INSERT INTO pa_profiles VALUES(admin_id,now()-interval '1 year',true,false),(user_a,now()-interval '1 hour',false,false),(user_b,now()-interval '1 year',false,false);
 INSERT INTO pa_blog_posts VALUES('fiera-a','Fiera A',now()),('fiera-b','Fiera B',now());
 PERFORM set_config('request.jwt.claims','{}',true);
 old_click:=public.personal_ad_event('fiere-01','300x250','blog_inline','click','legacy-session-01');
 impression_a:=public.personal_ad_event_v2('fiere-01','300x250','blog_inline','impression','context-session-01',ctx);
 click_a:=public.personal_ad_event_v2('fiere-01','300x250','blog_inline','click','context-session-01',ctx);
 IF click_a IS DISTINCT FROM public.personal_ad_event_v2('fiere-01','300x250','blog_inline','click','context-session-01',ctx||'{"visible_ms":9900}') THEN RAISE EXCEPTION 'Duplicate context click';END IF;
 IF (SELECT context->>'visible_ms' FROM pa_personal_ad_events WHERE id=click_a)<>'1500' THEN RAISE EXCEPTION 'Retry rewrites original metadata';END IF;
 click_b:=public.personal_ad_event_v2('fiere-01','300x250','blog_inline','click','context-session-01',ctx||'{"article_slug":"fiera-b"}');
 IF click_b=click_a THEN RAISE EXCEPTION 'Different articles merged';END IF;
 IF public.personal_ad_event_v2('fiere-01','300x250','blog_inline','click','context-session-01',ctx||'{"creative_version":5}')=click_a THEN RAISE EXCEPTION 'Creative versions merged';END IF;
 IF (SELECT context->>'article_title' FROM pa_personal_ad_events WHERE id=click_a)<>'Fiera A' THEN RAISE EXCEPTION 'Article title snapshot absent';END IF;
 IF (SELECT article_slug FROM pa_personal_ad_events WHERE id=old_click)<>'' THEN RAISE EXCEPTION 'Historical article invented';END IF;
 UPDATE pa_personal_ad_events SET created_at=now()-interval '3 hours' WHERE id=impression_a;
 UPDATE pa_personal_ad_events SET created_at=now()-interval '2 hours' WHERE id=click_a;
 PERFORM public.personal_ad_event_v2('fiere-02','300x250','blog_inline','impression','boundary-session-01',ctx);
 UPDATE pa_personal_ad_events SET created_at=now()-interval '35 days' WHERE session_id='boundary-session-01';
 PERFORM public.personal_ad_event_v2('fiere-02','300x250','blog_inline','click','boundary-session-01',ctx);
 FOR bad IN SELECT value FROM jsonb_array_elements('[{"email":"private@example.invalid"},{"url":"https://site.invalid/?email=private"},{"device_class":"fingerprint"},{"topics":["private"]},{"keywords":["email@example.invalid"]},{"visible_ms":-1},{"page_ms":86400001},{"creative_version":1.5},{"article_slug":"missing"},{"article_published_at":"not-a-date"}]') LOOP
  BEGIN PERFORM public.personal_ad_event_v2('fiere-01','300x250','blog_inline','click','invalid-session-01',bad);RAISE EXCEPTION 'Invalid context accepted %',bad;EXCEPTION WHEN invalid_parameter_value THEN NULL;END;
 END LOOP;
 BEGIN PERFORM public.admin_personal_ad_events();RAISE EXCEPTION 'Anon raw export';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 IF has_table_privilege('anon','pg_temp.pa_personal_ad_events','SELECT') OR has_table_privilege('authenticated','pg_temp.pa_personal_ad_events','SELECT') OR has_function_privilege('anon','public.admin_personal_ad_events(integer,timestamptz,timestamptz,uuid,integer)','EXECUTE') THEN RAISE EXCEPTION 'Context data exposed';END IF;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',user_a,'role','authenticated')::text,true);
 IF NOT public.personal_ad_claim(click_a) THEN RAISE EXCEPTION 'Claim failed';END IF;
 INSERT INTO pa_saved_fairs VALUES(gen_random_uuid(),user_a,now());
 INSERT INTO pa_payments VALUES(gen_random_uuid(),user_a,now()-interval '20 minutes',now()-interval '10 minutes','context-bundle',NULL,'succeeded','eur',4900,0),
 (gen_random_uuid(),user_a,now()-interval '20 minutes',now()-interval '10 minutes','context-bundle',NULL,'refunded','eur',4900,900);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',user_b,'role','authenticated')::text,true);
 IF public.personal_ad_claim(click_a) THEN RAISE EXCEPTION 'Cross-account claim';END IF;
 BEGIN PERFORM public.admin_personal_ad_events();RAISE EXCEPTION 'User raw export';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',admin_id,'role','authenticated')::text,true);
 IF public.personal_ad_event_v2('fiere-01','300x250','blog_inline','click','admin-session-01',ctx) IS NOT NULL THEN RAISE EXCEPTION 'Admin event recorded';END IF;
 report:=public.admin_personal_ads(30);
 SELECT COALESCE(sum((value->>'clicks')::int),0) INTO n FROM jsonb_array_elements(report->'rows');IF n<>5 THEN RAISE EXCEPTION 'Click totals changed %',report;END IF;
 SELECT value INTO row FROM jsonb_array_elements(report->'rows') WHERE value->>'ad_id'='fiere-01' AND value->>'article_slug'='fiera-a' AND value->>'creative_version'='6';
 IF (row->>'measured_clicks')::int<>1 OR (row->>'converted_clicks')::int<>1 OR row->>'device_class'<>'phone' OR row->>'visible_click_ms_sum'<>'1500' OR row->>'paid_orders'<>'1' OR row->>'revenue_cents'<>'8900' THEN RAISE EXCEPTION 'Context conversion/visibility/payment metrics %',row;END IF;
 SELECT value INTO row FROM jsonb_array_elements(report->'rows') WHERE value->>'article_slug'='fiera-b';IF (row->>'measured_clicks')::int<>0 THEN RAISE EXCEPTION 'Another article supplies impression';END IF;
 SELECT value INTO row FROM jsonb_array_elements(report->'rows') WHERE value->>'ad_id'='fiere-02';IF (row->>'measured_clicks')::int<>0 THEN RAISE EXCEPTION 'Old impression outside period supplies CTR';END IF;
 raw:=public.admin_personal_ad_events(30,NULL,NULL,NULL,2);IF jsonb_array_length(raw->'rows')<>2 OR NOT (raw->>'has_more')::boolean THEN RAISE EXCEPTION 'Pagination missing %',raw;END IF;
 IF raw::text LIKE '%session_id%' OR raw::text LIKE '%user_id%' OR raw::text LIKE '%claimed_at%' THEN RAISE EXCEPTION 'Export contains identity';END IF;
 next_page:=public.admin_personal_ad_events(30,(raw->>'until')::timestamptz,(raw->'next'->>'at')::timestamptz,(raw->'next'->>'id')::uuid,2);
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(raw->'rows') a JOIN jsonb_array_elements(next_page->'rows') b ON a->>'id'=b->>'id') THEN RAISE EXCEPTION 'Pagination duplicates';END IF;
END $test$;
SELECT jsonb_build_object('passed',true,'rollback',true,'real_customer_writes',0,'checks','article/version dedup, old rows, metadata validation, no private fields, permission checks, snapshot, conversions, matched CTR, timing sums and cursor pagination') result;
ROLLBACK;`;
(async()=>{const settings=JSON.parse(fs.readFileSync(process.env.PERSONAL_ADS_SETTINGS||path.join(root,'.claude/settings.local.json'),'utf8')),token=process.env.SUPABASE_ACCESS_TOKEN||settings.env?.SUPABASE_ACCESS_TOKEN;assert(token);
 const r=await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)}),data=await r.json();if(!r.ok)throw Error(JSON.stringify(data));assert(data.some(row=>row.result?.passed));if(process.env.PERSONAL_AD_CONTEXT_QA_DIR)fs.writeFileSync(path.join(process.env.PERSONAL_AD_CONTEXT_QA_DIR,'db-rollback.json'),JSON.stringify(data,null,2));console.log(JSON.stringify(data));})().catch(e=>{console.error(e.message);process.exitCode=1;});
