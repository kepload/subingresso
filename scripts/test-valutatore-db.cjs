const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const V=require(root+'/js/valuation.js');
const crypto=require('node:crypto');
const base={baseIncasso:'giorno',incasso:500,giornate:50,frequenza:'settimanale',settore:'non_alimentare',zona:'interna',clientela:'residenti',passaggio:'medio',posizione:'linea',sole:'riparato',concessione:'stabile',utileGiorno:null};
const scenarios=[];
for(const sole of V.choices.sole) for(const concessione of ['stabile','non_so','breve']) for(const utileGiorno of [null,0,80.50]) {
const input={...base,sole,concessione,utileGiorno,mesiResidui:6};const r=V.estimate(input);
scenarios.push({input:r.input,expected:{prezzo_min:r.min,prezzo_avg:r.avg,prezzo_max:r.max},token:crypto.randomBytes(32).toString('hex'),request:crypto.randomUUID()});
}
const q=s=>"'"+s.replaceAll("'","''")+"'";
let sql=fs.readFileSync(root+'/PATCH_VALUTATORE_V2.sql','utf8').replace(/COMMIT;\s*$/,'');
sql+='\nSET LOCAL ROLE anon;\nDO $test$ DECLARE t jsonb; r jsonb; BEGIN\n';
sql+='FOR t IN SELECT value FROM jsonb_array_elements('+q(JSON.stringify(scenarios))+'::jsonb) LOOP\n';
sql+="r := public.save_valutazione_v2(t->'input',t->>'token',(t->>'request')::uuid);\n";
sql+="IF r-'id' IS DISTINCT FROM t->'expected' THEN RAISE EXCEPTION 'Parità JS/SQL fallita: % / %',r,t->'expected'; END IF;\n";
sql+="IF public.save_valutazione_v2(t->'input',t->>'token',(t->>'request')::uuid) IS DISTINCT FROM r THEN RAISE EXCEPTION 'Idempotenza fallita'; END IF;\nEND LOOP;\n";
for(const delta of [{incasso:'Infinity'},{incasso:-1},{incasso:0},{giornate:400},{giornate:54},{giornate:1.5},{utileGiorno:600},{sole:'<script>'},{concessione:'temporanea'},{concessione:'breve',mesiResidui:0},{baseIncasso:'anno',incasso:2000001}]) {
sql+=`BEGIN PERFORM public.save_valutazione_v2(${q(JSON.stringify({...base,...delta}))}::jsonb,'${crypto.randomBytes(32).toString('hex')}','${crypto.randomUUID()}'); RAISE EXCEPTION 'Input errato accettato'; EXCEPTION WHEN SQLSTATE '22023' THEN NULL; END;\n`;
}
const rateToken=crypto.randomBytes(32).toString('hex');
sql+=`FOR i IN 1..30 LOOP PERFORM public.save_valutazione_v2(${q(JSON.stringify(base))}::jsonb,'${rateToken}',gen_random_uuid()); END LOOP;\n`;
sql+=`BEGIN PERFORM public.save_valutazione_v2(${q(JSON.stringify(base))}::jsonb,'${rateToken}',gen_random_uuid()); RAISE EXCEPTION 'Limite richieste fallito' USING ERRCODE='22023'; EXCEPTION WHEN SQLSTATE 'P0001' THEN NULL; END;\n`;
sql+=`r:=public.save_valutazione_v2(${q(JSON.stringify({...base,user_id:crypto.randomUUID(),prezzo_avg:99999999,affitto_annuo:99999}))}::jsonb,'${crypto.randomBytes(32).toString('hex')}','${crypto.randomUUID()}'); IF r->>'prezzo_avg'<>'12500' THEN RAISE EXCEPTION 'Risultato manomesso'; END IF;\n`;
sql+="IF has_table_privilege('anon','public.valutatore_logs','INSERT') OR has_table_privilege('anon','public.valutatore_logs','TRUNCATE') OR has_table_privilege('authenticated','public.valutatore_logs','UPDATE') THEN RAISE EXCEPTION 'Permessi eccessivi'; END IF;\n";
sql+="IF has_function_privilege('anon','public.link_valutatore_to_user(text)','EXECUTE') THEN RAISE EXCEPTION 'Claim anonimo consentito'; END IF;\nEND; $test$;\n";
sql+='RESET ROLE;\n';
// Real identities are used only within this rolled-back transaction; no PII is returned.
sql+=`DO $owner$ DECLARE u uuid; other_u uuid; r jsonb; n integer; token text := '${crypto.randomBytes(32).toString('hex')}'; req uuid := '${crypto.randomUUID()}'; BEGIN
SELECT id INTO u FROM auth.users ORDER BY created_at LIMIT 1;
SELECT id INTO other_u FROM auth.users WHERE id<>u ORDER BY created_at LIMIT 1;
IF u IS NULL OR other_u IS NULL THEN RAISE EXCEPTION 'Due identità necessarie per il test'; END IF;
PERFORM set_config('request.jwt.claim.sub',u::text,true);
r:=public.save_valutazione_v2(${q(JSON.stringify(base))}::jsonb,token,req);
IF (SELECT user_id FROM public.valutatore_logs WHERE request_id=req)<>u THEN RAISE EXCEPTION 'Owner non attribuito'; END IF;
PERFORM set_config('request.jwt.claim.sub',other_u::text,true);
IF public.link_valutatore_to_user(token)<>0 THEN RAISE EXCEPTION 'Owner riassegnato'; END IF;
IF public.link_valutatore_to_user('vs_weak_old_token')<>0 THEN RAISE EXCEPTION 'Token debole accettato'; END IF;
IF public.link_valutatore_to_annuncio(gen_random_uuid()) THEN RAISE EXCEPTION 'Collegamento annuncio non proprio'; END IF;
EXECUTE 'SET LOCAL ROLE authenticated';
SELECT count(*) INTO n FROM public.valutatore_logs WHERE request_id=req;
IF n<>0 THEN RAISE EXCEPTION 'Report di altro utente visibile'; END IF;
PERFORM set_config('request.jwt.claim.sub',u::text,true);
SELECT count(*) INTO n FROM public.valutatore_logs WHERE request_id=req;
IF n<>1 THEN RAISE EXCEPTION 'Report del proprietario non visibile'; END IF;
EXECUTE 'RESET ROLE';
END; $owner$;
SELECT 'OK: 36 parità JS/SQL, idempotenza, 11 input ostili, limite 30/ora, risultati manomessi, permessi e RLS; nessun dato test conservato' AS result;
ROLLBACK;`;
fs.writeFileSync(path.join(process.env.TEMP,'subingresso-valutatore-db-test.sql'),sql);
console.log('Test SQL pronto (transazione con ROLLBACK).');
