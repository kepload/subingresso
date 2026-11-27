// Genera transazioni ROLLBACK: nessun utente creato, nessun dato test conservato.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const V = require('../js/valuation.js');
const root = path.resolve(__dirname, '..');
const output = process.env.VAL_DB_QA_DIR || path.join(root, '.local/verifiche/valutatore-v27/database');
fs.mkdirSync(output, {recursive:true});
const base = {baseIncasso:'giorno', incasso:200, giornate:50, frequenza:'settimanale', settore:'non_alimentare', zona:'interna', clientela:'residenti', passaggio:'laterale', posizione:'linea', sole:'riparato', concessione:'stabile', utileGiorno:null};
const keys = ['min','avg','max','rent','monthly','base','beforeProfit','uncapped','cap'];
const scenarios = [];
function add(input) {
    const r = V.estimate(input);
    scenarios.push({input:r.input, status:r.status, expected:r.status === 'ok' ? Object.fromEntries(keys.map(k => [k,r[k]])) : null});
}
for (const settore of V.choices.settore)
for (const daily of [20,99.99,100,100.01,199.99,200,200.01,339.99,340,390,399.99,400,400.01,580,999.99,1000,1000.01])
for (const giornate of [1,26,50,52,300,366])
for (const context of [{},{zona:'turistica',clientela:'mista',passaggio:'alto',posizione:'angolare'},{passaggio:'non_so',clientela:'non_so',sole:'non_so',concessione:'non_so'}])
for (const utileGiorno of [null,0,Math.round(daily*20)/100])
for (const baseIncasso of ['giorno','anno']) {
    if (daily*giornate < 100) continue;
    add({...base, settore, giornate, baseIncasso, incasso:baseIncasso==='giorno' ? daily : Math.round(daily*giornate*100)/100,
        frequenza:giornate>53 ? 'giornaliero' : 'settimanale', utileGiorno, ...context});
}
let seed = 20261127;
const random = () => { seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; };
const pick = a => a[Math.floor(random()*a.length)];
for (let i=0; i<2000; i++) {
    const giornate = 1+Math.floor(random()*366), incasso = Math.round((100+random()*99900)*100)/100;
    const daily = incasso/giornate;
    if (daily > 50000) continue;
    add({...base,baseIncasso:'anno',incasso,giornate,frequenza:giornate>53?'giornaliero':'settimanale',
        settore:pick(V.choices.settore),zona:pick(V.choices.zona),clientela:pick(V.choices.clientela),
        passaggio:pick(V.choices.passaggio),posizione:pick(V.choices.posizione),sole:pick(V.choices.sole),
        concessione:pick(V.choices.concessione),mesiResidui:1+Math.floor(random()*35),
        utileGiorno:pick([null,0,Math.floor(daily*20)/100])});
}
const quote = s => "'"+s.replaceAll("'","''")+"'";
const json = x => quote(JSON.stringify(x))+'::jsonb';
const patch = fs.readFileSync(path.join(root,'PATCH_VALUTATORE_V27.sql'),'utf8').replace(/COMMIT;\s*$/,'');
const batches = [];
for (let offset=0; offset<scenarios.length; offset+=300) {
    const batch = scenarios.slice(offset,offset+300);
    const sql = patch+`
DO $parity$
DECLARE t jsonb; r jsonb; actual jsonb;
BEGIN
 FOR t IN SELECT value FROM jsonb_array_elements(${json(batch)}) LOOP
  IF t->>'status'='ok' THEN
   r:=data_quality.calculate_valutazione_v27(t->'input');
   SELECT jsonb_object_agg(k,r->k) INTO actual FROM unnest(ARRAY[${keys.map(quote).join(',')}]) k;
   IF actual IS DISTINCT FROM t->'expected' THEN
    RAISE EXCEPTION 'Parità JS/SQL: input %, atteso %, ottenuto %',t->'input',t->'expected',actual;
   END IF;
  ELSE
   BEGIN
    PERFORM data_quality.calculate_valutazione_v27(t->'input');
    RAISE EXCEPTION 'Prezzo automatico non consentito' USING ERRCODE='23514';
   EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
  END IF;
 END LOOP;
END; $parity$;
SELECT 'OK: ${batch.length} risultati e casi senza prezzo, ROLLBACK' AS result;
ROLLBACK;
`;
    const file = path.join(output,'parity-'+String(batches.length+1).padStart(2,'0')+'.sql');
    fs.writeFileSync(file,sql); batches.push({file,scenarios:batch.length});
}
const token = () => crypto.randomBytes(32).toString('hex');
const request = () => crypto.randomUUID();
let security = patch+`
CREATE TEMP TABLE v27_checks(request_id uuid, expected jsonb);
GRANT INSERT ON v27_checks TO anon;
SET LOCAL ROLE anon;
DO $save$
DECLARE r jsonb; again jsonb; t text; req uuid;
BEGIN
`;
for (const input of [base,{...base,incasso:390,giornate:26,passaggio:'laterale',zona:'turistica',posizione:'angolare',sole:'frontale'},
    {...base,incasso:580,giornate:52,sole:'variabile'},{...base,incasso:100,giornate:300,frequenza:'giornaliero'},
    {...base,baseIncasso:'anno',incasso:10000,utileGiorno:50,settore:'alimentare',sole:'frontale'}]) {
    const r = V.estimate(input), expected = {prezzo_min:r.min,prezzo_avg:r.avg,prezzo_max:r.max};
    security += `t:='${token()}'; req:='${request()}';
r:=public.save_valutazione_v27(${json(input)},t,req);
IF r-'id' IS DISTINCT FROM ${json(expected)} THEN RAISE EXCEPTION 'Prezzi RPC diversi'; END IF;
again:=public.save_valutazione_v27(${json(input)},t,req);
IF again IS DISTINCT FROM r THEN RAISE EXCEPTION 'Idempotenza'; END IF;
INSERT INTO pg_temp.v27_checks VALUES(req,${json({rent:r.rent,monthly:r.monthly,input:r.input})});
BEGIN PERFORM public.save_valutazione_v27(${json({...input,incasso:input.incasso+1})},t,req); RAISE EXCEPTION 'ID riutilizzato' USING ERRCODE='23514'; EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
BEGIN PERFORM public.save_valutazione_v27(${json(input)},'${token()}',req); RAISE EXCEPTION 'Sessione diversa' USING ERRCODE='23514'; EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
`;
}
for (const patchInput of [{incasso:0},{incasso:'Infinity'},{incasso:50001},{incasso:-1},{giornate:0},{giornate:54},{giornate:1.5},
    {utileGiorno:201},{sole:'<script>'},{concessione:'temporanea'},{concessione:'breve',mesiResidui:0},
    {concessione:'breve',mesiResidui:35},{incasso:1000.01},{incasso:1000,giornate:300,frequenza:'giornaliero'},{utileGiorno:0}]) {
    security += `BEGIN PERFORM public.save_valutazione_v27(${json({...base,...patchInput})},'${token()}','${request()}'); RAISE EXCEPTION 'Input da respingere' USING ERRCODE='23514'; EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;\n`;
}
security += `r:=public.save_valutazione_v27(${json({...base,user_id:request(),fatturato:999999,prezzo_avg:99999999})},'${token()}','${request()}');
IF (r->>'prezzo_avg')::numeric<>${V.estimate(base).avg} THEN RAISE EXCEPTION 'Risultato manipolato'; END IF;
t:='${token()}'; FOR i IN 1..30 LOOP PERFORM public.save_valutazione_v27(${json(base)},t,gen_random_uuid()); END LOOP;
BEGIN PERFORM public.save_valutazione_v27(${json(base)},t,gen_random_uuid()); RAISE EXCEPTION 'Rate limit assente' USING ERRCODE='23514'; EXCEPTION WHEN SQLSTATE 'P0001' THEN NULL; END;
END; $save$;
RESET ROLE;
DO $stored$
BEGIN
 IF EXISTS(SELECT 1 FROM pg_temp.v27_checks c LEFT JOIN public.valutatore_logs l ON l.request_id=c.request_id
  WHERE l.affitto_annuo IS DISTINCT FROM (c.expected->>'rent')::numeric
   OR l.affitto_mensile IS DISTINCT FROM (c.expected->>'monthly')::numeric
   OR l.dettagli_calcolo->'input' IS DISTINCT FROM c.expected->'input'
   OR l.algoritmo_version IS DISTINCT FROM '2.7') THEN RAISE EXCEPTION 'Report salvato incoerente'; END IF;
 IF has_table_privilege('anon','public.valutatore_logs','INSERT') OR has_table_privilege('authenticated','public.valutatore_logs','UPDATE')
  OR has_function_privilege('anon','public.link_valutatore_to_user(text)','EXECUTE')
  OR has_function_privilege('anon','data_quality.calculate_valutazione_v27(jsonb)','EXECUTE')
  OR has_function_privilege('authenticated','data_quality.valuation_v27_curve(double precision,boolean)','EXECUTE')
 THEN RAISE EXCEPTION 'Permessi eccessivi'; END IF;
END; $stored$;
DO $owner$
DECLARE u uuid; other_u uuid; r jsonb; t text:='${token()}'; req uuid:='${request()}'; n integer;
BEGIN
 SELECT id INTO u FROM auth.users ORDER BY created_at LIMIT 1;
 SELECT id INTO other_u FROM auth.users WHERE id<>u ORDER BY created_at LIMIT 1;
 IF u IS NULL OR other_u IS NULL THEN RAISE EXCEPTION 'Servono due identità esistenti'; END IF;
 PERFORM set_config('request.jwt.claim.sub','',true);
 r:=public.save_valutazione_v27(${json(base)},t,req);
 PERFORM set_config('request.jwt.claim.sub',u::text,true);
 IF public.link_valutatore_to_user(t)<>1 OR public.link_valutatore_to_user(t)<>0 THEN RAISE EXCEPTION 'Claim 2.7'; END IF;
 IF (SELECT user_id FROM public.valutatore_logs WHERE request_id=req) IS DISTINCT FROM u THEN RAISE EXCEPTION 'Owner errato'; END IF;
 PERFORM set_config('request.jwt.claim.sub',other_u::text,true);
 IF public.link_valutatore_to_user(t)<>0 THEN RAISE EXCEPTION 'Owner riassegnato'; END IF;
 BEGIN PERFORM public.save_valutazione_v27(${json(base)},t,req); RAISE EXCEPTION 'Richiesta altrui' USING ERRCODE='23514'; EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;
 IF public.link_valutatore_to_user('old_weak_token')<>0 OR public.link_valutatore_to_annuncio(gen_random_uuid()) THEN RAISE EXCEPTION 'Collegamento non autorizzato'; END IF;
 EXECUTE 'SET LOCAL ROLE authenticated';
 SELECT count(*) INTO n FROM public.valutatore_logs WHERE request_id=req;
 IF n<>0 THEN RAISE EXCEPTION 'RLS report altrui'; END IF;
 PERFORM set_config('request.jwt.claim.sub',u::text,true);
 SELECT count(*) INTO n FROM public.valutatore_logs WHERE request_id=req;
 IF n<>1 THEN RAISE EXCEPTION 'RLS report proprio'; END IF;
 EXECUTE 'RESET ROLE';
END; $owner$;
DO $legacy$
DECLARE version text; r jsonb; t text; req uuid; u uuid;
BEGIN
 SELECT id INTO u FROM auth.users ORDER BY created_at LIMIT 1;
`;
for (const version of ['2.0','2.1','2.2','2.3','2.4','2.5','2.6']) {
    const fn = version==='2.0'?'v2':'v'+version.replace('.','');
    security += `PERFORM set_config('request.jwt.claim.sub','',true); t:='${token()}'; req:='${request()}';
r:=public.save_valutazione_${fn}(${json(base)},t,req);
IF (r->>'prezzo_avg')::numeric<>${V.estimate(base,version).avg} THEN RAISE EXCEPTION 'RPC storica ${version}'; END IF;
PERFORM set_config('request.jwt.claim.sub',u::text,true);
IF public.link_valutatore_to_user(t)<>1 THEN RAISE EXCEPTION 'Claim storico ${version}'; END IF;
`;
}
security += `END; $legacy$;
SELECT 'OK: RPC, salvataggio, idempotenza, input, rate limit, permessi, RLS, claim 2.0–2.7, ROLLBACK' AS result;
ROLLBACK;
`;
const securityFile = path.join(output,'security.sql');
fs.writeFileSync(securityFile,security);
const manifest = {total:scenarios.length,batches,securityFile,real_writes:0};
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2));
console.log(JSON.stringify({total:scenarios.length,batches:batches.length,output}));
