'use strict';
// Solo API Google in lettura. Nessun server pubblico, dipendenza o task periodico.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {spawnSync} = require('node:child_process');
const ROOT = path.resolve(__dirname, '..');
const HOME = path.join(ROOT, '.local', 'search-console');
const VAULT = path.join(HOME, 'credentials.dpapi');
const API = 'https://www.googleapis.com/webmasters/v3';
const TOKEN = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';

function fail(message) { throw new Error(message); }
function day(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '') || new Date(value + 'T12:00:00Z').toISOString().slice(0,10) !== value) fail('Data non valida: usare YYYY-MM-DD.');
  return value;
}
function shift(value, n) { const d = new Date(day(value)+'T12:00:00Z'); d.setUTCDate(d.getUTCDate()+n); return d.toISOString().slice(0,10); }
function pacificToday(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', {timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  return ['year','month','day'].map(k=>parts.find(p=>p.type===k).value).join('-');
}
function ranges(end, days=28) {
  day(end); if (!Number.isInteger(days) || days<1 || days>90) fail('Il periodo deve avere da 1 a 90 giorni.');
  const current={startDate:shift(end,1-days),endDate:end};
  const previous={startDate:shift(current.startDate,-days),endDate:shift(current.startDate,-1)};
  return {current,previous};
}
function validateProperty(value) {
  if (!['sc-domain:subingresso.it','https://subingresso.it/','https://www.subingresso.it/','http://subingresso.it/','http://www.subingresso.it/'].includes(value)) fail('Proprietà non ammessa: usare la proprietà Subingresso presente in Search Console.');
  return value;
}
function validateCredentials(c) {
  if (c?.type!=='service_account' || !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.iam\.gserviceaccount\.com$/.test(c.client_email || '') || typeof c.private_key!=='string') fail('Serve il JSON di un account di servizio Google.');
  try { const key=crypto.createPrivateKey(c.private_key); if(key.asymmetricKeyType!=='rsa') fail('key'); } catch { fail('Chiave privata Google non valida.'); }
  // Non usare URL indicati dal JSON: destinazioni Google fisse nel codice.
  return {type:'service_account',client_email:c.client_email,private_key:c.private_key};
}
function vault(action, input) {
  if (process.platform!=='win32') fail('Questo archivio usa la cifratura dell’utente Windows.');
  const r=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-File',path.join(__dirname,'search-console-vault.ps1'),'-Action',action],{input,encoding:'utf8',windowsHide:true,maxBuffer:1024*1024});
  if(r.error || r.status!==0) fail('Impossibile usare l’archivio cifrato dell’utente Windows.');
  return r.stdout.trim();
}
function loadCredentials() {
  if(!fs.existsSync(VAULT)) fail('Google non collegato. Leggere data/SEARCH_CONSOLE.md e poi eseguire setup.');
  try { const c=JSON.parse(vault('unprotect',fs.readFileSync(VAULT,'utf8'))); validateProperty(c.property); return {...validateCredentials(c),property:c.property}; }
  catch(e) { if(e.message.startsWith('Impossibile')) throw e; fail('Archivio Google non valido o non accessibile.'); }
}
async function jsonRequest(url, options={}, fetcher=fetch) {
  let response;
  try { response=await fetcher(url,{...options,redirect:'error',signal:AbortSignal.timeout(30000)}); }
  catch { fail('Connessione a Google non riuscita. Nessun rapporto aggiornato.'); }
  if(!response.ok) {
    const messages={400:'Richiesta Google non valida: controllare proprietà e date.',401:'Credenziale Google scaduta o revocata.',403:'Google nega l’accesso: verificare API abilitata e permesso sulla proprietà Search Console.',404:'Proprietà Search Console non trovata.',429:'Quota Google raggiunta: riprovare più tardi.'};
    fail(messages[response.status] || `Google non disponibile (HTTP ${response.status}). Nessun rapporto aggiornato.`);
  }
  try { return await response.json(); } catch { fail('Risposta Google non leggibile.'); }
}
async function accessToken(c, fetcher=fetch) {
  const issued=Math.floor(Date.now()/1000);
  const b64=value=>Buffer.from(JSON.stringify(value)).toString('base64url');
  const unsigned=b64({alg:'RS256',typ:'JWT'})+'.'+b64({iss:c.client_email,scope:SCOPE,aud:TOKEN,iat:issued,exp:issued+3600});
  const signature=crypto.sign('RSA-SHA256',Buffer.from(unsigned),c.private_key).toString('base64url');
  const result=await jsonRequest(TOKEN,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion:unsigned+'.'+signature}).toString()},fetcher);
  if(typeof result.access_token!=='string' || !result.access_token) fail('Google non ha rilasciato un token.');
  return result.access_token;
}
function validateRow(row, dimensions) {
  if(!row || !['clicks','impressions','ctr','position'].every(k=>Number.isFinite(row[k]) && row[k]>=0) || row.ctr>1 || !Array.isArray(row.keys) && dimensions.length || dimensions.length && (row.keys.length!==dimensions.length || row.keys.some(k=>typeof k!=='string'))) fail('Dati Google incompleti o non validi.');
  return {...row,keys:row.keys || []};
}
async function query(token, property, period, dimensions=[], extraFilters=[], fetcher=fetch) {
  validateProperty(property);
  const rows=[]; const cap=50000; const size=25000;
  const filters=[{dimension:'country',operator:'equals',expression:'ita'},...extraFilters];
  for(let start=0; start<cap; start+=size) {
    const body={...period,type:'web',dataState:'final',dimensions,rowLimit:size,startRow:start,dimensionFilterGroups:[{groupType:'and',filters}]};
    const result=await jsonRequest(`${API}/sites/${encodeURIComponent(property)}/searchAnalytics/query`,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)},fetcher);
    if(result.rows!==undefined && !Array.isArray(result.rows)) fail('Righe Google non valide.');
    const batch=(result.rows || []).map(r=>validateRow(r,dimensions)); rows.push(...batch);
    if(batch.length<size || !dimensions.length) return {rows,capped:false};
  }
  return {rows,capped:true};
}
function segment(url) {
  let u; try{u=new URL(url);}catch{return 'altro';}
  if(!['subingresso.it','www.subingresso.it'].includes(u.hostname)) return 'altro';
  if(/^\/blog(?:\/|$)/.test(u.pathname)) return 'blog';
  if(/^\/(?:annunci|annuncio|vendi)(?:\/|$)/.test(u.pathname)) return 'posteggi';
  if(/^\/(?:fiere|evento|organizzatore)(?:\/|$)/.test(u.pathname)) return 'fiere';
  if(/^\/valutatore(?:\/|$)/.test(u.pathname)) return 'valutatore';
  return 'altro';
}
const METRICS=['clicks','impressions','ctr','position'];
function metrics(result) { return result.rows.length ? Object.fromEntries(METRICS.map(k=>[k,result.rows[0][k]])) : null; }
function change(current, previous) {
  if(!current || !previous) return null;
  return {clicks:current.clicks-previous.clicks,clicksPercent:previous.clicks ? (current.clicks/previous.clicks-1)*100 : null,impressions:current.impressions-previous.impressions,positionImprovement:previous.position-current.position};
}
function compareRows(current,previous) {
  const old=new Map(previous.rows.map(r=>[JSON.stringify(r.keys),r]));
  return current.rows.map(r=>{const before=old.get(JSON.stringify(r.keys));return {...r,previous:before || null,change:change(r,before)};}).sort((a,b)=>b.clicks-a.clicks || b.impressions-a.impressions);
}
function sectionFilters(name) {
  const patterns={blog:'^https?://(www\\.)?subingresso\\.it/blog([/?]|$)',posteggi:'^https?://(www\\.)?subingresso\\.it/(annunci|annuncio|vendi)([/?]|$)',fiere:'^https?://(www\\.)?subingresso\\.it/(fiere|evento|organizzatore)([/?]|$)',valutatore:'^https?://(www\\.)?subingresso\\.it/valutatore([/?]|$)'};
  return [{dimension:'page',operator:'includingRegex',expression:patterns[name]}];
}
async function collect(c, options={}, fetcher=fetch) {
  // Ritardo prudente; dataState final esclude dati provvisori, non garantisce che ogni giorno sia già presente.
  const end=options.end || shift(pacificToday(),-3);
  if(end>shift(pacificToday(),-3)) fail('Usare una data finale di almeno tre giorni fa.');
  const periods=ranges(end,options.days || 28);
  const token=await accessToken(c,fetcher);
  const report={version:1,generatedAt:new Date().toISOString(),property:c.property,country:'ita',searchType:'web',timezone:'America/Los_Angeles',dataState:'final',periods,sections:{},limits:['L’API restituisce le righe principali, non tutte le ricerche; alcune query sono anonimizzate.','Le somme delle righe query/pagina possono differire dai totali. I totali delle sezioni sono richiesti separatamente.','Posizione media, non posizione fissa; i cambi possono dipendere dal mix di query, pagine e dispositivi.','Search Console non contiene posizioni o traffico dei concorrenti.','Giorni senza righe non sono ricostruiti come zeri; rapporto precedente conservato in caso di errore.']};
  const pair=async(dimensions=[],filters=[])=>{
    const current=await query(token,c.property,periods.current,dimensions,filters,fetcher);
    const previous=await query(token,c.property,periods.previous,dimensions,filters,fetcher);
    return {current,previous};
  };
  const totals=await pair();
  report.total={current:metrics(totals.current),previous:metrics(totals.previous)};
  report.total.change=change(report.total.current,report.total.previous);
  const daily=await pair(['date']); report.daily=daily;
  report.observedDays={current:daily.current.rows.map(r=>r.keys[0]).sort(),previous:daily.previous.rows.map(r=>r.keys[0]).sort()};
  for(const name of ['posteggi','blog','fiere','valutatore']) {
    const value=await pair([],sectionFilters(name));
    report.sections[name]={current:metrics(value.current),previous:metrics(value.previous)};
    report.sections[name].change=change(report.sections[name].current,report.sections[name].previous);
  }
  for(const [name,dims] of [['queries',['query']],['pages',['page']],['queryPages',['query','page']],['devices',['device']]]) {
    const value=await pair(dims);
    const currentKeys=new Set(value.current.rows.map(r=>JSON.stringify(r.keys)));
    report[name]={...value,comparison:compareRows(value.current,value.previous),previousOnly:value.previous.rows.filter(r=>!currentKeys.has(JSON.stringify(r.keys)))};
  }
  report.pages.comparison.forEach(r=>{r.section=segment(r.keys[0]);});
  return report;
}
function escape(value) { return String(value).replace(/[\r\n\t]/g,' ').replace(/\|/g,'\\|').replace(/[<>]/g,'').replace(/`/g,''); }
function markdown(r) {
  const num=n=>n==null?'—':Number(n).toLocaleString('it-IT',{maximumFractionDigits:2});
  const line=(name,data)=>`| ${name} | ${num(data.current?.clicks)} | ${num(data.previous?.clicks)} | ${num(data.current?.impressions)} | ${num(data.current?.position)} |`;
  const lines=['# Google Search Console — Subingresso',`Aggiornato: ${r.generatedAt}. Italia, ricerca web, giorni Google nel fuso Pacifico.`,
    `Periodo: ${r.periods.current.startDate} – ${r.periods.current.endDate}; confronto: ${r.periods.previous.startDate} – ${r.periods.previous.endDate}.`,
    `Giorni con dati: ${r.observedDays.current.length} attuali, ${r.observedDays.previous.length} precedenti. Dati mancanti non equivalgono a zero.`,
    '', '| Sezione | Clic | Clic precedenti | Impressioni | Posizione media |','|---|---:|---:|---:|---:|',line('Sito',r.total),...Object.entries(r.sections).map(([name,data])=>line(name,data)),
    '', '## Ricerche principali','| Ricerca | Clic | Impressioni | Posizione media | Miglioramento posizione |','|---|---:|---:|---:|---:|',
    ...r.queries.comparison.slice(0,30).map(v=>`| ${escape(v.keys[0])} | ${num(v.clicks)} | ${num(v.impressions)} | ${num(v.position)} | ${num(v.change?.positionImprovement)} |`),
    '', '## Pagine principali','| Pagina | Sezione | Clic | Impressioni | Posizione media |','|---|---|---:|---:|---:|',
    ...r.pages.comparison.slice(0,30).map(v=>`| ${escape(v.keys[0])} | ${v.section} | ${num(v.clicks)} | ${num(v.impressions)} | ${num(v.position)} |`),
    '', '## Limiti',...r.limits.map(v=>'- '+v)];
  lines.push('- Ricerche presenti solo nel periodo precedente: '+r.queries.previousOnly.length+'. Consultare previousOnly nel JSON; assenza dalle righe non significa necessariamente zero impressioni.');
  if(['queries','pages','queryPages','devices'].some(k=>r[k].current.capped || r[k].previous.capped)) lines.push('- Raggiunto il limite locale di 50.000 righe per una o più estrazioni.');
  return lines.join('\n')+'\n';
}
function writeReport(report, home=HOME) {
  const folder=path.join(home,'reports',report.generatedAt.replace(/[:.]/g,'-')+'-'+crypto.randomBytes(3).toString('hex'));
  fs.mkdirSync(folder,{recursive:true});
  fs.writeFileSync(path.join(folder,'report.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx',mode:0o600});
  fs.writeFileSync(path.join(folder,'report.md'),markdown(report),{flag:'wx',mode:0o600});
  // Il puntatore cambia solo dopo aver acquisito e scritto l'intero rapporto.
  const temporary=path.join(home,'latest-'+crypto.randomBytes(6).toString('hex')+'.tmp');
  fs.writeFileSync(temporary,JSON.stringify({generatedAt:report.generatedAt,report:path.relative(home,path.join(folder,'report.json'))},null,2),{flag:'wx',mode:0o600});
  fs.renameSync(temporary,path.join(home,'latest.json'));
  return folder;
}
function args(argv) {
  const command=argv[0] || 'status', options={};
  for(let i=1;i<argv.length;i+=2) { if(!['--credentials','--property','--days','--end'].includes(argv[i]) || !argv[i+1] || argv[i+1].startsWith('--')) fail('Argomenti non validi. Consultare data/SEARCH_CONSOLE.md.'); if(Object.hasOwn(options,argv[i].slice(2))) fail('Argomento duplicato.'); options[argv[i].slice(2)]=argv[i+1]; }
  const allowed={setup:['credentials','property'],status:[],report:['days','end']};
  if(!allowed[command] || Object.keys(options).some(k=>!allowed[command].includes(k))) fail('Comando o argomenti non validi.');
  if(options.days!==undefined && !/^\d+$/.test(options.days)) fail('Numero di giorni non valido.');
  if(options.end) day(options.end);
  if(command==='report') ranges(options.end || shift(pacificToday(),-3),options.days===undefined ? 28 : Number(options.days));
  return {command,options};
}
async function main(argv=process.argv.slice(2)) {
  const {command,options}=args(argv);
  if(command==='setup') {
    if(!options.credentials) fail('Indicare --credentials con il percorso del JSON Google privato.');
    const filename=path.resolve(options.credentials);
    if(!filename.startsWith(HOME+path.sep)) fail('Spostare il JSON Google dentro .local/search-console/ prima di importarlo.');
    let raw;try{raw=JSON.parse(fs.readFileSync(filename,'utf8').replace(/^\uFEFF/,''));}catch{fail('File Google non leggibile o JSON non valido.');}
    const c={...validateCredentials(raw),property:validateProperty(options.property || 'sc-domain:subingresso.it')};
    if(fs.existsSync(VAULT)) fail('Credenziale già presente. Nessuna sovrascrittura automatica; gestire la rotazione secondo la guida.');
    const encrypted=vault('protect',JSON.stringify(c));
    fs.mkdirSync(HOME,{recursive:true});fs.writeFileSync(VAULT,encrypted,{flag:'wx',mode:0o600});
    console.log('Credenziale importata e cifrata per questo utente Windows. Verificare l’accesso con report. Il JSON originale resta presente: seguire la guida per la sua gestione.');
    return;
  }
  if(command==='status') {
    console.log(JSON.stringify({configured:fs.existsSync(VAULT),latestReport:fs.existsSync(path.join(HOME,'latest.json'))?JSON.parse(fs.readFileSync(path.join(HOME,'latest.json'),'utf8')):null,scheduled:false},null,2));return;
  }
  const c=loadCredentials();
  const report=await collect(c,{days:options.days===undefined?28:Number(options.days),end:options.end});
  const folder=writeReport(report);
  console.log(markdown(report)); console.log('Rapporto privato: '+folder);
}
module.exports={day,shift,pacificToday,ranges,validateProperty,validateCredentials,jsonRequest,accessToken,query,segment,metrics,change,compareRows,sectionFilters,collect,markdown,args,vault,writeReport};
if(require.main===module) main().catch(e=>{console.error(e.message);process.exitCode=1;});
