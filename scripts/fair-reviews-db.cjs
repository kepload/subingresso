// Explicit --apply installs; default runs migration + fixtures in one ROLLBACK.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..');
const { events } = require('../api/_fiere');
const fixture = `
INSERT INTO fair_review_private.catalog(id) VALUES('qa-recensioni-rollback');
DO $$
DECLARE uid uuid; other_uid uuid; payload jsonb; result jsonb;
BEGIN
    SELECT id INTO uid FROM public.profiles WHERE nullif(btrim(telefono),'') IS NOT NULL LIMIT 1;
    SELECT id INTO other_uid FROM public.profiles WHERE id<>uid LIMIT 1;
    IF uid IS NULL OR other_uid IS NULL THEN RAISE EXCEPTION 'Two profile fixtures required'; END IF;
    IF has_table_privilege('anon','fair_review_private.reviews','SELECT') OR has_table_privilege('authenticated','fair_review_private.reviews','INSERT') OR has_schema_privilege('authenticated','fair_review_private','USAGE') THEN RAISE EXCEPTION 'Private tables exposed'; END IF;
    IF has_function_privilege('anon','public.publish_fair_review(jsonb)','EXECUTE') THEN RAISE EXCEPTION 'Guest publication allowed'; END IF;
    payload := jsonb_build_object('kind','catalog','fair_id','qa-recensioni-rollback','visit_month','2000-01-01','sector','artigianato','rating',4,'organization',5,'body','Esperienza fittizia soltanto in transazione, mai pubblicata sul sito.','recommend','yes','confirmed',true,'user_id',other_uid);
    PERFORM set_config('request.jwt.claim.sub','',true);
    BEGIN PERFORM public.publish_fair_review(payload); RAISE EXCEPTION 'Anonymous accepted'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
    PERFORM set_config('request.jwt.claim.sub',uid::text,true);
    result := public.publish_fair_review(payload);
    IF NOT EXISTS(SELECT 1 FROM fair_review_private.reviews WHERE id=(result->>'id')::uuid AND user_id=uid) THEN RAISE EXCEPTION 'Identity spoofed'; END IF;
    BEGIN PERFORM public.publish_fair_review(payload); RAISE EXCEPTION 'Duplicate accepted'; EXCEPTION WHEN unique_violation THEN NULL; END;
    BEGIN PERFORM public.publish_fair_review(payload || '{"visit_month":"2099-01-01"}'::jsonb); RAISE EXCEPTION 'Future accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
    BEGIN PERFORM public.publish_fair_review(payload || '{"fair_id":"not-a-real-fair"}'::jsonb); RAISE EXCEPTION 'Unknown fair accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
    BEGIN PERFORM public.publish_fair_review(payload || '{"confirmed":false}'::jsonb); RAISE EXCEPTION 'Unconfirmed accepted'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
    BEGIN PERFORM public.publish_fair_review(payload || '{"visit_month":"2001-01-01","rating":8}'::jsonb); RAISE EXCEPTION 'Bad rating accepted'; EXCEPTION WHEN check_violation THEN NULL; END;
    BEGIN PERFORM public.publish_fair_review(payload || '{"visit_month":"2001-01-01","body":"short"}'::jsonb); RAISE EXCEPTION 'Short text accepted'; EXCEPTION WHEN check_violation THEN NULL; END;
    PERFORM set_config('request.jwt.claim.sub',other_uid::text,true);
    EXECUTE 'SET LOCAL ROLE anon';
    result := public.read_fair_reviews('catalog','qa-recensioni-rollback',0);
    IF (result->>'count')::int<>1 OR result->>'average'<>'4.0' OR jsonb_array_length(result->'reviews')<>1 THEN RAISE EXCEPTION 'Wrong aggregate'; END IF;
    IF (result->'reviews'->0) ?| ARRAY['user_id','email','telefono','cognome'] THEN RAISE EXCEPTION 'Private data exposed'; END IF;
    EXECUTE 'RESET ROLE';
    PERFORM set_config('request.jwt.claim.sub',uid::text,true);
    FOR i IN 1..9 LOOP PERFORM public.publish_fair_review(payload || jsonb_build_object('visit_month',(2000+i)::text||'-01-01')); END LOOP;
    BEGIN PERFORM public.publish_fair_review(payload || '{"visit_month":"2011-01-01"}'::jsonb); RAISE EXCEPTION 'Rate limit absent'; EXCEPTION WHEN raise_exception THEN IF SQLERRM NOT LIKE 'Hai già pubblicato%' THEN RAISE; END IF; END;
END;
$$;
SELECT jsonb_build_object('passed',true,'checks','private grants, guest deny, server identity, duplicates, future, canonical ids, confirmation, constraints, public aggregates, no PII, rate limit') AS result;
`;
(async () => {
    const settings = JSON.parse(fs.readFileSync(path.join(root,'.claude/settings.local.json'),'utf8'));
    const token = process.env.SUPABASE_ACCESS_TOKEN || settings.env.SUPABASE_ACCESS_TOKEN;
    const migration = fs.readFileSync(path.join(root,'PATCH_FIERE_RECENSIONI_20261104.sql'),'utf8').replace(/^BEGIN;/,'').replace(/COMMIT;\s*$/,'');
    const ids = JSON.stringify(events.map(e => e.id)).replace(/'/g,"''");
    const seed = `INSERT INTO fair_review_private.catalog(id) SELECT jsonb_array_elements_text('${ids}'::jsonb) ON CONFLICT DO NOTHING;`;
    const apply = process.argv.includes('--apply'), sync = process.argv.includes('--sync-catalog');
    const query = 'BEGIN;\n' + (sync ? '' : migration) + '\n' + seed + '\n' + (apply || sync ? "SELECT jsonb_build_object('catalog',count(*)) AS result FROM fair_review_private.catalog;\nCOMMIT;" : fixture + '\nROLLBACK;');
    const response = await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query}),signal:AbortSignal.timeout(60000)});
    const result = await response.json();
    if (!response.ok) throw Error(JSON.stringify(result));
    if (!apply && !sync) assert(result.some(r=>r.result?.passed));
    console.log(JSON.stringify({mode:apply?'applied':sync?'catalog synced':'rollback tests passed',result}));
})().catch(error=>{console.error(error.message);process.exitCode=1});
