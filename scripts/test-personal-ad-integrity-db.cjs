'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
async function query(sql){const key=process.env.SUPABASE_ACCESS_TOKEN||JSON.parse(fs.readFileSync(path.join(root,'.claude/settings.local.json'),'utf8')).env.SUPABASE_ACCESS_TOKEN;const r=await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)});const data=await r.json();assert(r.ok,JSON.stringify(data));return data;}
(async()=>{
 const [definition]=await query("BEGIN READ ONLY;SELECT pg_get_functiondef('public.personal_ad_event_v2(text,text,text,text,text,jsonb)'::regprocedure) definition;ROLLBACK;");
 const remap=sql=>sql.replaceAll('public.personal_ad_events','pg_temp.qa_ad_events').replaceAll('public.profiles','pg_temp.qa_profiles').replaceAll('public.blog_posts','pg_temp.qa_posts').replaceAll('data_quality.personal_ad_ingestion_key','pg_temp.qa_ingestion_key').replaceAll('data_quality.personal_ad_event_exclusions','pg_temp.qa_exclusions').replaceAll('data_quality.analytics_personal_ad_events','pg_temp.qa_allowed');
 const migration=remap(fs.readFileSync(path.join(root,'PATCH_PERSONAL_AD_INTEGRITY_20261104.sql'),'utf8').replace(/^BEGIN;$/m,'').replace(/^COMMIT;$/m,''));
 const sql=`BEGIN;
 CREATE TEMP TABLE qa_ad_events(LIKE public.personal_ad_events INCLUDING ALL);
 CREATE TEMP TABLE qa_profiles(id uuid,is_admin boolean,is_demo boolean);
 CREATE TEMP TABLE qa_posts(slug text,title text,published_at timestamptz);
 ${remap(definition.definition)};
 ${migration}
 INSERT INTO qa_ingestion_key VALUES(true,repeat('fixture-only-key-',5));
 INSERT INTO qa_posts VALUES('integrity-fixture','Fixture',now());
 DO $test$
 DECLARE ctx jsonb:='{"article_slug":"integrity-fixture","creative_version":6,"visible_ms":1200,"page_ms":3000,"device_class":"phone"}';
 item jsonb; payload text; signature text; impression uuid; click_id uuid; n integer; i integer; signing_key text:=repeat('fixture-only-key-',5);
 BEGIN
  PERFORM set_config('request.jwt.claims','{}',true);
  IF has_function_privilege('anon','public.personal_ad_event(text,text,text,text,text)','EXECUTE') OR has_function_privilege('authenticated','public.personal_ad_event_v2(text,text,text,text,text,jsonb)','EXECUTE') THEN RAISE EXCEPTION 'Legacy RPC open';END IF;
  IF has_table_privilege('anon','pg_temp.qa_ingestion_key','SELECT') OR has_table_privilege('authenticated','pg_temp.qa_exclusions','SELECT') THEN RAISE EXCEPTION 'Private tables exposed';END IF;
  BEGIN PERFORM public.personal_ad_event_v3('{}',repeat('0',64));RAISE EXCEPTION 'Forged signature accepted';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
  item:=jsonb_build_object('ad','fiere-01','format','300x250','placement','qa_main','session','integrity-session-01','kind','click','context',ctx,'impression',gen_random_uuid(),'at',floor(extract(epoch FROM clock_timestamp())*1000));
  payload:=item::text;signature:=encode(extensions.hmac('event:'||payload,signing_key,'sha256'),'hex');
  IF public.personal_ad_event_v3(payload,signature) IS NOT NULL THEN RAISE EXCEPTION 'Click without impression';END IF;
  item:=item||jsonb_build_object('kind','impression');payload:=item::text;signature:=encode(extensions.hmac('event:'||payload,signing_key,'sha256'),'hex');
  impression:=public.personal_ad_event_v3(payload,signature);IF impression IS NULL THEN RAISE EXCEPTION 'Measured impression rejected';END IF;
  IF public.personal_ad_event_v3(payload,signature) IS DISTINCT FROM impression THEN RAISE EXCEPTION 'Duplicate impression';END IF;
  item:=item||jsonb_build_object('kind','click','impression',impression);payload:=item::text;signature:=encode(extensions.hmac('event:'||payload,signing_key,'sha256'),'hex');
  click_id:=public.personal_ad_event_v3(payload,signature);IF click_id IS NULL THEN RAISE EXCEPTION 'Valid click rejected';END IF;
  IF public.personal_ad_event_v3(payload,signature) IS DISTINCT FROM click_id THEN RAISE EXCEPTION 'Duplicate click';END IF;
  FOR i IN 1..4 LOOP
   payload:=(item||CASE i WHEN 1 THEN '{"session":"different-session"}' WHEN 2 THEN '{"ad":"fiere-02"}' WHEN 3 THEN '{"format":"728x90"}' ELSE '{"placement":"different"}' END::jsonb)::text;
   signature:=encode(extensions.hmac('event:'||payload,signing_key,'sha256'),'hex');
   IF public.personal_ad_event_v3(payload,signature) IS NOT NULL THEN RAISE EXCEPTION 'Cross-context receipt accepted';END IF;
  END LOOP;
  payload:=(item||jsonb_build_object('at',floor(extract(epoch FROM clock_timestamp())*1000)-120000))::text;signature:=encode(extensions.hmac('event:'||payload,signing_key,'sha256'),'hex');
  BEGIN PERFORM public.personal_ad_event_v3(payload,signature);RAISE EXCEPTION 'Expired signature accepted';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
  payload:=(item||'{"kind":"impression","session":null}')::text;signature:=encode(extensions.hmac('event:'||payload,signing_key,'sha256'),'hex');
  BEGIN PERFORM public.personal_ad_event_v3(payload,signature);RAISE EXCEPTION 'No session accepted';EXCEPTION WHEN invalid_parameter_value THEN NULL;END;
  payload:=(item||jsonb_build_object('kind','impression','session','low-visibility-session','context',ctx||'{"visible_ms":900}'))::text;signature:=encode(extensions.hmac('event:'||payload,signing_key,'sha256'),'hex');
  IF public.personal_ad_event_v3(payload,signature) IS NOT NULL THEN RAISE EXCEPTION 'Short impression accepted';END IF;
  INSERT INTO qa_exclusions SELECT id,'unverified_request',now(),'fixture',to_jsonb(e) FROM qa_ad_events e WHERE id=click_id;
  IF EXISTS(SELECT 1 FROM qa_allowed WHERE id=click_id) OR NOT EXISTS(SELECT 1 FROM qa_ad_events WHERE id=click_id) THEN RAISE EXCEPTION 'Quarantine lost original';END IF;
  PERFORM set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000077","role":"authenticated"}',true);
  IF public.personal_ad_claim(click_id) THEN RAISE EXCEPTION 'Excluded click claimed';END IF;
  PERFORM set_config('request.jwt.claims','{}',true);
  FOR i IN 1..21 LOOP
   item:=jsonb_build_object('ad','fiere-01','format','300x250','placement','rate_'||i,'session','integrity-rate-session','kind','impression','context',ctx,'at',floor(extract(epoch FROM clock_timestamp())*1000));payload:=item::text;signature:=encode(extensions.hmac('event:'||payload,signing_key,'sha256'),'hex');impression:=public.personal_ad_event_v3(payload,signature);
   payload:=(item||jsonb_build_object('kind','click','impression',impression))::text;signature:=encode(extensions.hmac('event:'||payload,signing_key,'sha256'),'hex');click_id:=public.personal_ad_event_v3(payload,signature);
   IF (i<=20 AND click_id IS NULL) OR (i=21 AND click_id IS NOT NULL) THEN RAISE EXCEPTION 'Session click cap failed';END IF;
  END LOOP;
 END $test$;
 SELECT jsonb_build_object('passed',true,'rollback',true,'real_event_writes',0,'checks','HMAC,expiry,legacy grants,private key,session,viewability,impression binding,dedup,quarantine,claim,rate limit') result;
 ROLLBACK;`;
 const result=await query(sql);assert(result[0].result.passed);console.log(JSON.stringify(result));
 if(process.env.PERSONAL_AD_INTEGRITY_QA_DIR)fs.writeFileSync(path.join(process.env.PERSONAL_AD_INTEGRITY_QA_DIR,'integrity-database.json'),JSON.stringify(result,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
