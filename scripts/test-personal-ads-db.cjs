'use strict';
// Migrazione e funzioni reali, dati sintetici solo in tabelle temporanee; ROLLBACK.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
let migration=fs.readFileSync(path.join(root,'PATCH_PERSONAL_ADS_20261024.sql'),'utf8').replace(/^BEGIN;$/m,'').replace(/^COMMIT;$/m,'');
// Le identità sono sintetiche: l'FK di produzione ad auth.users resta verificata
// nel sorgente; qui nessun account reale viene creato o modificato.
assert(migration.includes('REFERENCES auth.users(id) ON DELETE CASCADE'));
migration=migration.replace('REFERENCES auth.users(id) ON DELETE CASCADE','');
for(const name of ['profiles','annunci','payments','saved_fairs','contact_reveals'])migration=migration.replaceAll('public.'+name,'pg_temp.pa_'+name);
const sql=`BEGIN;
CREATE TEMP TABLE pa_profiles(id uuid,created_at timestamptz,is_admin boolean DEFAULT false,is_demo boolean DEFAULT false);
CREATE TEMP TABLE pa_annunci(id uuid,user_id uuid,created_at timestamptz,status text,is_demo boolean DEFAULT false);
CREATE TEMP TABLE pa_contact_reveals(id integer,revealer_id uuid,seller_id uuid,created_at timestamptz);
CREATE TEMP TABLE pa_saved_fairs(id uuid,user_id uuid,created_at timestamptz);
CREATE TEMP TABLE pa_payments(id uuid,user_id uuid,created_at timestamptz,paid_at timestamptz,checkout_session_id text,stripe_session_id text,status text,currency text,amount_cents bigint,refunded_cents bigint);
${migration}
DO $test$
DECLARE admin_id uuid:='00000000-0000-4000-8000-000000000001'; user_a uuid:='00000000-0000-4000-8000-000000000002'; user_b uuid:='00000000-0000-4000-8000-000000000003';
 first_click uuid; second_click uuid; old_click uuid; fair_click uuid; item jsonb; report jsonb;
BEGIN
 INSERT INTO pa_profiles(id,created_at,is_admin) VALUES(admin_id,now()-interval '1 year',true),(user_a,now()-interval '1 hour',false),(user_b,now()-interval '1 year',false);
 PERFORM set_config('request.jwt.claims','{}',true);
 BEGIN PERFORM public.admin_personal_ads();RAISE EXCEPTION 'Anonimo vede risultati';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 IF has_table_privilege('anon','public.personal_ad_events','SELECT') OR has_table_privilege('authenticated','public.personal_ad_events','SELECT') OR has_table_privilege('anon','public.personal_ad_events','INSERT') THEN RAISE EXCEPTION 'Tabella esposta'; END IF;
 IF has_function_privilege('anon','public.admin_personal_ads(integer)','EXECUTE') OR has_function_privilege('anon','public.personal_ad_claim(uuid)','EXECUTE') THEN RAISE EXCEPTION 'RPC private esposte';END IF;
 BEGIN PERFORM public.personal_ad_event('bad','300x250','blog','click');RAISE EXCEPTION 'ID invalido accettato';EXCEPTION WHEN invalid_parameter_value THEN NULL;END;
 BEGIN PERFORM public.personal_ad_event('vendi-01','300x250','email@example.com','click');RAISE EXCEPTION 'Posizione personale accettata';EXCEPTION WHEN invalid_parameter_value THEN NULL;END;
 first_click:=public.personal_ad_event('vendi-01','300x250','test_centro','click','session-synthetic-01');
 IF first_click IS DISTINCT FROM public.personal_ad_event('vendi-01','300x250','test_centro','click','session-synthetic-01') THEN RAISE EXCEPTION 'Clic duplicati';END IF;
 UPDATE public.personal_ad_events SET created_at=now()-interval '2 hours' WHERE id=first_click;
 PERFORM public.personal_ad_event('vendi-01','300x250','test_centro','impression','session-synthetic-01');
 UPDATE public.personal_ad_events SET created_at=now()-interval '3 hours' WHERE kind='impression' AND session_id='session-synthetic-01';
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',user_a,'role','authenticated')::text,true);
 BEGIN PERFORM public.admin_personal_ads();RAISE EXCEPTION 'Utente vede risultati';EXCEPTION WHEN insufficient_privilege THEN NULL;END;
 IF NOT public.personal_ad_claim(first_click) THEN RAISE EXCEPTION 'Claim anonimo al login';END IF;
 INSERT INTO pa_annunci(id,user_id,created_at,status) VALUES(gen_random_uuid(),user_a,now()-interval '30 minutes','pending');
 INSERT INTO pa_payments VALUES(gen_random_uuid(),user_a,now()-interval '20 minutes',now()-interval '10 minutes','checkout-bundle',NULL,'succeeded','eur',4900,0),
 (gen_random_uuid(),user_a,now()-interval '20 minutes',now()-interval '10 minutes','checkout-bundle',NULL,'refunded','eur',4900,900);
 second_click:=public.personal_ad_event('compra-01','320x100','test_basso','click','session-synthetic-02');
 UPDATE public.personal_ad_events SET created_at=now()-interval '15 minutes' WHERE id=second_click;
 INSERT INTO pa_contact_reveals VALUES(1,user_a,user_b,now()-interval '5 minutes');
 -- L'ordine era già iniziato prima del secondo clic: resta attribuito al primo.
 fair_click:=public.personal_ad_event('fiere-06','1080x1080','test_social','click');
 UPDATE public.personal_ad_events SET created_at=now()-interval '2 minutes' WHERE id=fair_click;
 INSERT INTO pa_saved_fairs VALUES(gen_random_uuid(),user_a,now()-interval '1 minute');
 old_click:=public.personal_ad_event('vendi-02','300x250','test_vecchio','click');
 UPDATE public.personal_ad_events SET created_at=now()-interval '8 days' WHERE id=old_click;
 IF public.personal_ad_claim(old_click) THEN RAISE EXCEPTION 'Claim scaduto';END IF;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',user_b,'role','authenticated')::text,true);
 IF public.personal_ad_claim(first_click) THEN RAISE EXCEPTION 'Cambio proprietario del clic';END IF;
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',admin_id,'role','authenticated')::text,true);
 IF public.personal_ad_event('vendi-07','728x90','admin_test','click') IS NOT NULL OR public.personal_ad_claim(first_click) THEN RAISE EXCEPTION 'Test admin conteggiato';END IF;
 report:=public.admin_personal_ads(30);
 SELECT value INTO item FROM jsonb_array_elements(report->'rows') WHERE value->>'ad_id'='vendi-01';
 IF (item->>'clicks')::integer<>1 OR (item->>'impressions')::integer<>1 OR (item->>'measured_clicks')::integer<>1 OR (item->>'converted_clicks')::integer<>1 OR (item->>'listings')::integer<>1 OR (item->>'signups')::integer<>1 OR (item->>'paid_orders')::integer<>1 OR (item->>'revenue_cents')::bigint<>8900 THEN RAISE EXCEPTION 'Metriche vendita/bundle/rimborsi %',item;END IF;
 SELECT value INTO item FROM jsonb_array_elements(report->'rows') WHERE value->>'ad_id'='compra-01';
 IF (item->>'contacts')::integer<>1 OR (item->>'converted_clicks')::integer<>1 OR (item->>'measured_clicks')::integer<>0 OR (item->>'paid_orders')::integer<>0 THEN RAISE EXCEPTION 'Contatti/CTR misurato %',item;END IF;
 SELECT value INTO item FROM jsonb_array_elements(report->'rows') WHERE value->>'ad_id'='fiere-06';
 IF (item->>'fairs')::integer<>1 OR (item->>'converted_clicks')::integer<>1 THEN RAISE EXCEPTION 'Fiere salvate %',item;END IF;
 UPDATE pa_annunci SET status='sold' WHERE user_id=user_a;
 DELETE FROM pa_saved_fairs WHERE user_id=user_a;
 report:=public.admin_personal_ads(30);
 SELECT value INTO item FROM jsonb_array_elements(report->'rows') WHERE value->>'ad_id'='vendi-01';
 IF (item->>'converted_clicks')::integer<>1 OR (item->>'listings')::integer<>1 THEN RAISE EXCEPTION 'Venduto cancella lo storico %',item;END IF;
 SELECT value INTO item FROM jsonb_array_elements(report->'rows') WHERE value->>'ad_id'='fiere-06';
 IF (item->>'converted_clicks')::integer<>1 OR (item->>'fairs')::integer<>1 THEN RAISE EXCEPTION 'Rimozione fiera cancella lo storico %',item;END IF;
 IF (report->>'period_days')::integer<>30 OR (public.admin_personal_ads(999)->>'period_days')::integer<>365 OR (public.admin_personal_ads(0)->>'period_days')::integer<>1 THEN RAISE EXCEPTION 'Periodi fuori limite';END IF;
END $test$;
SELECT jsonb_build_object('passed',true,'rollback',true,'real_customer_writes',0,'checks','admin/RLS,validazione,dedup,claim,isolamento,scadenza,ultimo clic,obiettivi,CTR,bundle,rimborsi,periodi,pending-sold,salva-rimuovi') AS result;
ROLLBACK;`;
(async()=>{
 const settings=JSON.parse(fs.readFileSync(path.join(root,'.claude/settings.local.json'),'utf8'));
 const token=process.env.SUPABASE_ACCESS_TOKEN||settings.env?.SUPABASE_ACCESS_TOKEN;assert(token);
 const response=await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)});
 const result=await response.json();if(!response.ok)throw Error(JSON.stringify(result));assert(result.some(r=>r.result?.passed));console.log(JSON.stringify(result));
 if(process.env.PERSONAL_ADS_TEST_OUT)fs.writeFileSync(path.join(process.env.PERSONAL_ADS_TEST_OUT,'database-test.json'),JSON.stringify(result,null,2));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
