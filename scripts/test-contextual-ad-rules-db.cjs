'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const patch=fs.readFileSync(path.join(root,'PATCH_CONTEXTUAL_AD_RULES_20261026.sql'),'utf8').replace(/^BEGIN;$/m,'').replace(/^COMMIT;$/m,'').replaceAll('public.profiles','pg_temp.rule_profiles').replaceAll('public.blog_posts','pg_temp.rule_posts');
const sql=`BEGIN;
CREATE TEMP TABLE rule_profiles(id uuid,is_admin boolean);
CREATE TEMP TABLE rule_posts(slug text);
INSERT INTO rule_profiles VALUES('00000000-0000-4000-8000-000000000001',true),('00000000-0000-4000-8000-000000000002',false);
INSERT INTO rule_posts VALUES('articolo-fixture');
${patch}
DO $test$
DECLARE report jsonb; bad jsonb;
BEGIN
 IF has_table_privilege('anon','public.contextual_ad_rules','SELECT') OR has_table_privilege('authenticated','public.contextual_ad_rules','INSERT') OR has_table_privilege('authenticated','public.contextual_ad_rules','UPDATE') THEN RAISE EXCEPTION 'Tabella esposta';END IF;
 IF has_function_privilege('anon','public.admin_save_contextual_ad_rule(text,text,jsonb,bigint)','EXECUTE') OR has_function_privilege('anon','public.admin_contextual_ad_rules()','EXECUTE') THEN RAISE EXCEPTION 'RPC admin pubbliche';END IF;
 PERFORM set_config('request.jwt.claims','{}',true);
 BEGIN PERFORM public.admin_contextual_ad_rules();RAISE EXCEPTION 'Anon admin';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 BEGIN PERFORM public.admin_save_contextual_ad_rule('ad','fiere-01','{}',0);RAISE EXCEPTION 'Anon scrive';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 PERFORM set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
 BEGIN PERFORM public.admin_contextual_ad_rules();RAISE EXCEPTION 'Utente admin';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 BEGIN PERFORM public.admin_save_contextual_ad_rule('ad','fiere-01','{}',0);RAISE EXCEPTION 'Utente scrive';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 PERFORM set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
 FOR bad IN SELECT value FROM jsonb_array_elements('[{}, {"priorityKeywords":null,"excludedKeywords":[]}, {"priorityKeywords":"x","excludedKeywords":[]}, {"priorityKeywords":["<script>"],"excludedKeywords":[]}, {"priorityKeywords":["fiere","fiere"],"excludedKeywords":[]}, {"priorityKeywords":[],"excludedKeywords":[],"kind":"paid"}]'::jsonb) LOOP
  BEGIN PERFORM public.admin_save_contextual_ad_rule('ad','fiere-01',bad,0);RAISE EXCEPTION 'Regola ad non valida accettata: %',bad;EXCEPTION WHEN invalid_parameter_value THEN NULL;END;
 END LOOP;
 BEGIN PERFORM public.admin_save_contextual_ad_rule('ad','fiere-07','{"priorityKeywords":[],"excludedKeywords":[]}',0);RAISE EXCEPTION 'ID inesistente';EXCEPTION WHEN invalid_parameter_value THEN NULL;END;
 BEGIN PERFORM public.admin_save_contextual_ad_rule('post','inesistente','{"topics":null,"excludedAds":[]}',0);RAISE EXCEPTION 'Post inesistente';EXCEPTION WHEN invalid_parameter_value THEN NULL;END;
 FOR bad IN SELECT value FROM jsonb_array_elements('[{}, {"topics":"fiere","excludedAds":[]}, {"topics":["paid"],"excludedAds":[]}, {"topics":null,"excludedAds":["fiere-07"]}, {"topics":null,"excludedAds":[],"script":"x"}]'::jsonb) LOOP
  BEGIN PERFORM public.admin_save_contextual_ad_rule('post','articolo-fixture',bad,0);RAISE EXCEPTION 'Regola post non valida accettata: %',bad;EXCEPTION WHEN invalid_parameter_value THEN NULL;END;
 END LOOP;
 report:=public.admin_save_contextual_ad_rule('ad','fiere-01','{"priorityKeywords":["presenze","anzianita"],"excludedKeywords":["maltempo"]}',0);
 IF (report->>'revision')::integer<>1 THEN RAISE EXCEPTION 'Prima revisione';END IF;
 BEGIN PERFORM public.admin_save_contextual_ad_rule('ad','fiere-01','{"priorityKeywords":[],"excludedKeywords":[]}',0);RAISE EXCEPTION 'Conflitto ignorato';EXCEPTION WHEN serialization_failure THEN NULL;END;
 report:=public.admin_save_contextual_ad_rule('ad','fiere-01','{"priorityKeywords":["spunta"],"excludedKeywords":[]}',1);
 IF (report->>'revision')::integer<>2 THEN RAISE EXCEPTION 'Seconda revisione';END IF;
 BEGIN PERFORM public.admin_save_contextual_ad_rule('ad','fiere-01','{"priorityKeywords":[],"excludedKeywords":[]}',1);RAISE EXCEPTION 'Revisione vecchia';EXCEPTION WHEN serialization_failure THEN NULL;END;
 PERFORM public.admin_save_contextual_ad_rule('post','articolo-fixture','{"topics":["acquisto"],"excludedAds":["compra-01"]}',0);
 report:=public.admin_contextual_ad_rules();
 IF report->'ads'->'fiere-01'->'rule'->'priorityKeywords' <> '["spunta"]'::jsonb OR report->'posts'->'articolo-fixture'->'rule'->'topics' <> '["acquisto"]'::jsonb THEN RAISE EXCEPTION 'Salvataggio incompleto';END IF;
 IF report::text LIKE '%updated_by%' OR report::text LIKE '%00000000-0000%' THEN RAISE EXCEPTION 'Dati account pubblici';END IF;
END $test$;
SET LOCAL ROLE anon;
SELECT public.contextual_ad_rules() AS public_rules;
RESET ROLE;
SELECT jsonb_build_object('passed',true,'rollback',true,'real_customer_writes',0,'checks','RLS,admin,validazione,post,revisioni,conflitti,lettura pubblica senza account') AS result;
ROLLBACK;`;
module.exports={sql};
if(require.main===module)(async()=>{const settings=JSON.parse(fs.readFileSync(path.join(root,'.claude/settings.local.json'),'utf8')),token=process.env.SUPABASE_ACCESS_TOKEN||settings.env?.SUPABASE_ACCESS_TOKEN;assert(token);const r=await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)}),data=await r.json();if(!r.ok)throw Error(JSON.stringify(data));assert(data.some(row=>row.result?.passed));console.log(JSON.stringify(data));if(process.env.CONTEXTUAL_RULES_QA_DIR)fs.writeFileSync(path.join(process.env.CONTEXTUAL_RULES_QA_DIR,'db-rollback.json'),JSON.stringify(data,null,2));})().catch(e=>{console.error(e.message);process.exitCode=1;});
