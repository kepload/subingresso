// Prova la validazione server con i nomi regionali restituiti dal selettore.
// Tutte le scritture e le eventuali code email terminano con ROLLBACK.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root, 'js/comune-picker.js'), 'utf8'), context);
const canonicalRegion = context.window.ComuniItaliani.canonicalRegion;
const { locations } = require('./seed-data-locations.cjs');
const rows = locations();
const bilingual = rows.filter(row => canonicalRegion(row.regione) !== row.regione);
assert.equal(bilingual.length, 2761);
const samples = ['Trento', 'Bolzano', 'Aosta'].map(name => rows.find(row => row.name === name));
for (const province of ['Trento', 'Bolzano/Bozen', "Valle d'Aosta/Vallée d'Aoste"]) {
    samples.push(rows.find(row => row.provincia === province && row.name.includes(' (')));
}
samples.push(rows.find(row => row.name === 'Brescia'));
assert(samples.every(Boolean));
const payloads = samples.flatMap(row => [...new Set([row.regione, canonicalRegion(row.regione)])].map(regione => ({
    comune: row.name, provincia: row.provincia, regione
})));
const literal = value => "'" + value.replaceAll("'", "''") + "'";
const patch = fs.readFileSync(path.join(root, 'PATCH_LISTING_LOCATION_PREFLIGHT_20261028.sql'), 'utf8')
    .replace(/^BEGIN;\r?$/m, '').replace(/^COMMIT;\r?$/m, '');
const sql = `BEGIN;
${process.argv.includes('--candidate') ? patch : ''}
CREATE TEMP TABLE qa_location_input AS SELECT * FROM jsonb_to_recordset(${literal(JSON.stringify(payloads))}::jsonb) AS x(comune text,provincia text,regione text);
CREATE TEMP TABLE qa_location_expected AS SELECT * FROM jsonb_to_recordset(${literal(JSON.stringify(bilingual.map(row => ({comune:row.name,provincia:row.provincia,regione:canonicalRegion(row.regione)}))))}::jsonb) AS x(comune text,provincia text,regione text);
DO $$ DECLARE v jsonb; actual text[]; owner_id uuid; row record;
BEGIN
  v:=jsonb_build_object('titolo','Prova località regionali','descrizione','Annuncio di prova per verificare i nomi delle regioni senza pubblicazione definitiva.',
    'stato','Vendita','tipo','Mercato settimanale','settore','Abbigliamento e accessori','superficie',12,'giorni','Sabato','prezzo',15000,
    'contatto','Prova','tel','3471234567','img_urls','[]'::jsonb,'dettagli_extra','{"images":[]}'::jsonb);
  FOR row IN SELECT * FROM qa_location_expected LOOP
    actual:=data_quality.listing_issues(v||to_jsonb(row));
    IF cardinality(actual)>0 THEN RAISE EXCEPTION 'Località del selettore rifiutata: %, %',to_jsonb(row),actual; END IF;
  END LOOP;
  SELECT id INTO owner_id FROM public.profiles WHERE NOT coalesce(is_admin,false) AND NOT is_demo LIMIT 1;
  IF owner_id IS NULL THEN RAISE EXCEPTION 'Identità test mancante'; END IF;
  PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'role','authenticated','email','qa@example.invalid')::text,true);
  PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);
  PERFORM set_config('qa.location.owner',owner_id::text,true);
  GRANT SELECT ON qa_location_input TO authenticated;
  PERFORM set_config('qa.location.base',v::text,true);
END $$;
SET LOCAL ROLE authenticated;
DO $$ DECLARE row record; v jsonb:=current_setting('qa.location.base')::jsonb; bad jsonb; failed boolean; inserted_id uuid;
BEGIN
  FOR row IN SELECT * FROM qa_location_input LOOP
    INSERT INTO public.annunci(user_id,titolo,descrizione,stato,tipo,settore,comune,provincia,regione,superficie,giorni,prezzo,contatto,tel,status,img_urls,dettagli_extra)
    VALUES(current_setting('qa.location.owner')::uuid,v->>'titolo',v->>'descrizione',v->>'stato',v->>'tipo',v->>'settore',row.comune,row.provincia,row.regione,12,'Sabato',15000,'Prova','3471234567','pending','{}','{"images":[]}') RETURNING id INTO inserted_id;
    IF inserted_id IS NULL THEN RAISE EXCEPTION 'Inserimento non eseguito'; END IF;
  END LOOP;
  FOR bad IN SELECT value FROM jsonb_array_elements($bad$[{"comune":"Trento","provincia":"Trento","regione":"Veneto"},{"comune":"Trento","provincia":"Bolzano/Bozen","regione":"Trentino-Alto Adige"},{"comune":"Comune inventato","provincia":"Trento","regione":"Trentino-Alto Adige"},{"comune":"Aosta","provincia":"Valle d'Aosta/Vallée d'Aoste","regione":"Lombardia"}]$bad$::jsonb) LOOP
    failed:=false;
    BEGIN
      INSERT INTO public.annunci(user_id,titolo,descrizione,stato,tipo,settore,comune,provincia,regione,superficie,giorni,prezzo,contatto,tel,status,img_urls,dettagli_extra)
      VALUES(current_setting('qa.location.owner')::uuid,v->>'titolo',v->>'descrizione',v->>'stato',v->>'tipo',v->>'settore',bad->>'comune',bad->>'provincia',bad->>'regione',12,'Sabato',15000,'Prova','3471234567','pending','{}','{"images":[]}');
    EXCEPTION WHEN check_violation THEN failed:=true;
    END;
    IF NOT failed THEN RAISE EXCEPTION 'Combinazione errata accettata: %',bad; END IF;
  END LOOP;
END $$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ BEGIN
  IF public.validate_listing_location('Trento','Trento','Trentino-Alto Adige') IS DISTINCT FROM true
    OR public.validate_listing_location('Aosta','Valle d''Aosta/Vallée d''Aoste','Valle d''Aosta') IS DISTINCT FROM true
    OR public.validate_listing_location('Trento','Trento','Veneto') IS DISTINCT FROM false
    OR public.validate_listing_location(NULL,'Trento','Trentino-Alto Adige') IS DISTINCT FROM false
    OR public.validate_listing_location('','Trento','Trentino-Alto Adige') IS DISTINCT FROM false
    OR public.validate_listing_location(repeat('a',251),'Trento','Trentino-Alto Adige') IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'Verifica pubblica diversa dal controllo finale';
  END IF;
END $$;
RESET ROLE;
DO $$ BEGIN
  IF has_table_privilege('anon','data_quality.locations','SELECT') OR has_function_privilege('anon','data_quality.listing_location_valid(text,text,text)','EXECUTE')
    OR has_function_privilege('authenticated','data_quality.listing_location_valid(text,text,text)','EXECUTE') THEN RAISE EXCEPTION 'Anagrafica privata esposta'; END IF;
END $$;
SELECT jsonb_build_object('passed',true,'places_checked',(SELECT count(*) FROM qa_location_expected),'insertions_checked',(SELECT count(*) FROM qa_location_input),'invalid_combinations_rejected',4) result;
ROLLBACK;`;
(async () => {
    const token = process.env.SUPABASE_ACCESS_TOKEN || JSON.parse(fs.readFileSync(path.join(root, '.claude/settings.local.json'), 'utf8')).env?.SUPABASE_ACCESS_TOKEN;
    assert(token, 'Accesso Supabase mancante');
    const response = await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query', {
        method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)
    });
    const data = await response.json();
    if (!response.ok) throw Error(JSON.stringify(data));
    assert(data.some(row => row.result?.passed));
    if (process.env.LOCATION_QA_OUTPUT) fs.writeFileSync(process.env.LOCATION_QA_OUTPUT, JSON.stringify(data,null,2));
    console.log(JSON.stringify(data));
})().catch(error => { console.error(error.message);process.exitCode=1; });
