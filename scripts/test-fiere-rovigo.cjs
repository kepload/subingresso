// Rovigo: isolation, documented commercial days, recurring/historical dates and browser publication.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const catalog=read('data/fiere.json'),audit=read('data/fiere-rovigo.json');
const baseline=JSON.parse(cp.execFileSync('git',['show',audit.research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:30*1024*1024}));
const events=catalog.events.filter(e=>e.province==='Rovigo');
assert.deepEqual(catalog.events.filter(e=>e.province!=='Rovigo'),baseline.events.filter(e=>e.province!=='Rovigo'));
assert.equal(events.length,63);assert.equal(catalog.events.length,6567);assert.equal(new Set(events.map(e=>e.city)).size,32);
assert.equal(baseline.events.filter(e=>e.province==='Rovigo').length,3);
for(const old of baseline.events.filter(e=>e.province==='Rovigo'))assert(events.some(e=>e.id===old.id),old.id);
assert.equal(audit.research.municipalities.length,50);assert.equal(new Set(audit.research.municipalities.map(m=>m.city)).size,50);
for(const m of audit.research.municipalities){assert(m.sources.length>=1,m.city);assert(m.result.length>70,m.city);}
assert.equal(audit.research.regionalRowAudit.length,33);assert.equal(audit.research.commercialRowAudit.length,5);assert.equal(audit.research.antiquityRowAudit.length,6);
assert.equal(audit.research.municipalRegistryAudit.eventRowsReturned,3184);assert.equal(audit.research.municipalRegistryAudit.newsRowsReturned,7849);
assert.equal(audit.research.unpliAudit.keywordCandidatesReviewed,134);assert.equal(audit.research.unpliAudit.rows.length,134);
assert.equal(audit.research.openLeads.length,0);assert.equal(audit.research.limits.length,26);assert.equal(audit.research.exclusions.length,29);
assert(audit.research.sourceReceipts.length>=1400);
for(const r of audit.research.sourceReceipts){assert(r.archiveStem);assert.equal(r.key,undefined);assert(!r.url.includes('myintranet'));assert(!r.url.includes('\\'));}
for(const row of [...audit.research.regionalRowAudit,...audit.research.commercialRowAudit,...audit.research.antiquityRowAudit,...audit.research.unpliAudit.rows])for(const id of row.eventIds||[])assert(events.some(e=>e.id===id),id);
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-23');assert(e.participation.note.length>80,e.id);
 for(const u of e.sourceRecordIds)assert(audit.research.sourceReceipts.some(r=>r.url===u),u);
 for(const d of e.editions)assert(e.sourceRecordIds.includes(d.sourceUrl),e.id+' '+d.sourceUrl);
 if(e.pricing){assert(e.sourceRecordIds.includes(e.pricing.sourceUrl));assert.equal(e.participation.costs,e.pricing.details);}
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.toLowerCase().includes(name.toLowerCase()));assert(e,city+' '+name);return e;};
const dates=(city,name)=>event(city,name).editions.map(d=>d.start).filter(Boolean);
const span=(city,name,start,end)=>{assert.equal(event(city,name).editions[0].start,start);assert.equal(event(city,name).editions[0].end,end);};
span('Occhiobello','SANTA MARIA','2026-07-17','2026-07-26');
assert.deepEqual(dates('Villanova del Ghebbo','SAN MICHELE'),['2026-09-20','2026-09-27']);
assert.deepEqual(dates('Lendinara','San Marco'),['2026-04-25','2026-04-26']);
assert.deepEqual(dates('Lendinara','Settembre'),['2026-09-06','2026-09-08']);
assert.deepEqual(dates('Lendinara','Mercatino in Riviera'),['2026-01-25','2026-03-22']);
assert.deepEqual(dates('Loreo','San Michele'),['2026-09-26','2026-09-27','2026-09-29']);
assert.deepEqual(dates('Loreo','Sagra del Pane'),['2026-06-21']);
assert.deepEqual(dates('Giacciano con Baruchella','Fungo'),['2026-10-11']);
assert.deepEqual(dates('Trecenta',"Fiera d'Ottobre"),['2026-10-11']);
span('Fiesso Umbertiano','Natività','2026-09-04','2026-09-14');
span('Salara','Miele','2026-10-02','2026-10-04');
span('Melara','Zucca','2026-08-06','2026-08-18');
span('Castelmassa','San Martino','2026-11-06','2026-11-09');
assert.equal(event('Castelmassa','San Martino').participation.deadline,'2026-09-07');
assert.deepEqual(dates('Porto Viro','Fiera Mata'),['2026-11-04']);
assert.deepEqual(dates('Porto Tolle','Fiera del Delta'),['2026-09-04','2026-09-11']);
assert.deepEqual(dates('Porto Tolle','Festa del Riso'),[]);assert(event('Porto Tolle','Festa del Riso').editions[0].periodOnly);assert.match(event('Porto Tolle','Festa del Riso').participation.note,/17–20.*17 è il gala/s);
assert.equal(events.filter(e=>e.pricing).length,2);
assert.match(event('Ceregnano','Radioamatore').pricing.details,/20 €.*gratuita per gli iscritti CISAR/s);
assert.match(event('Rovigo','Radioamatore').pricing.details,/20 €.*ogni 2 metri.*anche agli iscritti CISAR/s);
assert.equal(event('Ceregnano','Radioamatore').participation.deadline,'2026-04-27');
assert.equal(event('Rovigo','Radioamatore').participation.deadline,'2026-10-29');
assert.deepEqual(dates('Rovigo','Sbaracco'),['2026-03-07','2026-09-05']);
assert.deepEqual(dates('Fiesso Umbertiano','Antiquariato'),[]);assert.deepEqual(dates('Castelguglielmo','Antiquariato'),[]);
assert.match(event('Fiesso Umbertiano','Antiquariato').source.label,/secondarie/);
assert.match(event('San Martino di Venezze','Motori').source.label,/Rovigo.News/);
assert.deepEqual(dates('Adria','Antiquariato'),['2025-12-06','2025-12-13']);
assert.equal(events.filter(e=>e.editions.every(d=>d.year<2026)).length,9);
for(const city of ['Stienta','Bergantino','Ficarolo','Villanova Marchesana'])assert(!events.some(e=>e.city===city),city);
const handler=require('../api/fiera');
async function navigate(page,url){
 for(let attempt=0;;attempt++){
  try{return await page.goto(url,{waitUntil:'domcontentloaded'});}
  catch(error){if(attempt>=2||!/HTTP2|ERR_HTTP2|ECONNRESET|NS_ERROR_NET_RESET|ERR_CONNECTION_RESET/i.test(error.message))throw error;}
 }
}
for(const e of events){const r={setHeader(){},status(n){this.code=n;return this;},send(s){this.body=s;}};handler({query:{slug:e.id}},r);assert.equal(r.code,200);assert(r.body.includes(e.id));assert(!r.body.includes('undefined'));}
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');
 if(u.pathname.startsWith('/fiere/'))return handler({query:{slug:decodeURIComponent(u.pathname.slice(7))}},{setHeader:(k,v)=>res.setHeader(k,v),status(n){res.statusCode=n;return this;},send:s=>res.end(s)});
 const file=path.join(root,u.pathname==='/fiere'?'fiere.html':u.pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(err,d)=>{if(err){res.writeHead(404);return res.end();}res.setHeader('Content-Type',/\.m?js$/.test(file)?'application/javascript':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':'text/html');res.end(d);});
});
(async()=>{
 assert(process.env.PLAYWRIGHT_MODULE,'PLAYWRIGHT_MODULE richiesto');const pw=require(process.env.PLAYWRIGHT_MODULE),results=[];
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.FIERE_RO_BASE_URL||'http://127.0.0.1:'+server.address().port;
 try{for(const [engine,width]of [['chromium',1440],['chromium',320],['webkit',390]]){
  if(process.env.FIERE_RO_ENGINE&&process.env.FIERE_RO_ENGINE!==engine)continue;
  const browser=await pw[engine].launch();try{
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route('**/*',route=>{const u=new URL(route.request().url());if(['/js/supabase-config.js','/js/auth.js','/js/ui-components.js'].includes(u.pathname))return route.fulfill({contentType:'application/javascript',body:''});return u.origin===new URL(base).origin?route.continue():route.abort();});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await navigate(page,base+'/fiere?provincia=Rovigo&mesi=1,2,3,4,5,6,7,8,9,10,11,12');await page.waitForFunction(()=>document.querySelector('#list-count').textContent==='63');
   while(await page.locator('#load-more').isVisible())await page.locator('#load-more').click();
   assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es=>es.map(e=>e.dataset.eventId).sort()),events.map(e=>e.id).sort());
   await page.waitForFunction(()=>document.querySelector('#map-markers').children.length>0);
   assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es=>es.flatMap(e=>e.dataset.events.split(',')).sort()),events.map(e=>e.id).sort());
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   for(const e of events){await page.locator('.fiere-card[data-event-id="'+e.id+'"] .fiere-card-button').click();await page.waitForFunction(()=>document.querySelector('#fair-dialog').open);const dialog=page.locator('#fair-dialog');assert((await dialog.innerText()).replace(/\s+/g,' ').includes(e.name.replace(/\s+/g,' ')),e.id);assert(await dialog.locator('a[data-fiere-source]').count());if(e.pricing)assert.equal(await page.locator('#detail-costs').innerText(),e.pricing.details);assert(await dialog.evaluate(d=>d.scrollWidth<=d.clientWidth+1),e.id+' '+width);await page.locator('#close-detail').click();}
   assert.deepEqual(errors,[]);if(process.env.FIERE_RO_QA_DIR){fs.mkdirSync(process.env.FIERE_RO_QA_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.FIERE_RO_QA_DIR,engine+'-'+width+'.png')});}await context.close();
   const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}}),q=await nojs.newPage();
   for(const e of [event('Ceregnano','Radioamatore'),event('Rovigo','Radioamatore'),event('Porto Tolle','Festa del Riso'),event('Castelnovo Bariano','Villaggio di Natale')]){const response=await navigate(q,base+'/fiere/'+e.id);assert.equal(response.status(),200);assert((await q.locator('h1').innerText()).replace(/\s+/g,' ').includes(e.name.replace(/\s+/g,' ')));assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
   await nojs.close();results.push({engine,width,events:events.length,dialogs:events.length,base,status:'passed'});console.log(engine,width,'Rovigo: catalogo, mappa, 63 dettagli e pagine senza JS OK');
  }finally{await browser.close();}
 }}finally{server.close();if(process.env.FIERE_RO_OUT)fs.writeFileSync(process.env.FIERE_RO_OUT,JSON.stringify(results,null,2));}
})().catch(e=>{console.error(e);process.exitCode=1;});
