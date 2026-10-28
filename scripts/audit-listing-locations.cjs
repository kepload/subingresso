// Confronto completo dei valori del selettore con il vero controllo del DB.
// Solo letture. --candidate crea la patch in ciascuna transazione e fa ROLLBACK.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root,file),'utf8');
const context = {window:{},setTimeout,clearTimeout,AbortController,fetch:async url=>({ok:true,json:async()=>JSON.parse(read(new URL(url,'https://fixture.invalid').pathname.slice(1)))})};
vm.createContext(context);
vm.runInContext(read('js/comune-picker.js'),context);
const literal = value => "'"+value.replaceAll("'","''")+"'";
const baseline = process.argv.includes('--baseline');
const candidate = process.argv.includes('--candidate');
const patch = read('PATCH_LISTING_LOCATION_PREFLIGHT_20261028.sql').replace(/^BEGIN;\r?$/m,'').replace(/^COMMIT;\r?$/m,'');
(async()=>{
    const places = await context.window.ComuniItaliani.load();
    const rows = places.map(row=>({comune:row.nome,provincia:row.provincia,regione:context.window.ComuniItaliani.canonicalRegion(row.regione),original_region:row.regione}));
    assert.equal(rows.length,63182);
    const token = process.env.SUPABASE_ACCESS_TOKEN || JSON.parse(read('.claude/settings.local.json')).env?.SUPABASE_ACCESS_TOKEN;
    assert(token,'Accesso Supabase mancante');
    const results=[];
    const size=2000;
    for(let offset=0;offset<rows.length;offset+=size){
        const batch=rows.slice(offset,offset+size);
        const sql=`BEGIN; ${candidate?patch:''}
WITH expected AS (SELECT * FROM jsonb_to_recordset(${literal(JSON.stringify(batch))}::jsonb) AS x(comune text,provincia text,regione text,original_region text)),
base AS (SELECT '{"titolo":"Prova completa località","descrizione":"Annuncio di verifica dei luoghi senza alcuna pubblicazione o dato persistente.","stato":"Vendita","tipo":"Mercato settimanale","settore":"Abbigliamento e accessori","superficie":12,"giorni":"Sabato","prezzo":15000,"contatto":"Prova","tel":"3471234567","img_urls":[],"dettagli_extra":{"images":[]}}'::jsonb v),
checked AS (SELECT e.*,
data_quality.listing_issues(base.v||jsonb_build_object('comune',e.comune,'provincia',e.provincia,'regione',e.regione)) issues,
${baseline?'true':"public.validate_listing_location(e.comune,e.provincia,e.regione)"} preflight,
${baseline?'true':"public.validate_listing_location(e.comune,e.provincia,e.original_region)"} historical
FROM expected e CROSS JOIN base)
SELECT count(*) checked,count(*) FILTER(WHERE cardinality(issues)>0 OR NOT preflight OR NOT historical) failed,
coalesce(jsonb_agg(jsonb_build_object('comune',comune,'provincia',provincia,'regione',regione,'issues',issues,'preflight',preflight,'historical',historical)) FILTER(WHERE cardinality(issues)>0 OR NOT preflight OR NOT historical),'[]'::jsonb) failures FROM checked;
ROLLBACK;`;
        const response=await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({query:sql}),signal:AbortSignal.timeout(60000)});
        const data=await response.json();if(!response.ok)throw Error(JSON.stringify(data));
        assert.equal(data.length,1);results.push(data[0]);
        assert.equal(Number(data[0].failed),0,JSON.stringify(data[0].failures));
        if(offset%10000===0)console.log('Località verificate: '+(offset+batch.length)+'/'+rows.length);
    }
    const report={passed:true,mode:baseline?'baseline':candidate?'candidate-rollback':'live',municipalities:places.filter(row=>!row.nomeLocalita).length,localities:places.filter(row=>row.nomeLocalita).length,checked:results.reduce((n,row)=>n+Number(row.checked),0),failed:results.reduce((n,row)=>n+Number(row.failed),0),batches:results.length};
    assert.equal(report.checked,rows.length);
    if(process.env.LOCATION_QA_OUTPUT)fs.writeFileSync(process.env.LOCATION_QA_OUTPUT,JSON.stringify(report,null,2));
    console.log(JSON.stringify(report));
})().catch(error=>{console.error(error.message);process.exitCode=1;});
