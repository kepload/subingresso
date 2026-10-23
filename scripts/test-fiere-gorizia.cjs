// Gorizia: provincial isolation, original documents, market days and publication.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const catalog=read('data/fiere.json'),audit=read('data/fiere-gorizia.json');
const baseline=JSON.parse(cp.execFileSync('git',['show',audit.research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:30*1024*1024}));
const events=catalog.events.filter(e=>e.province==='Gorizia');
assert.deepEqual(catalog.events.filter(e=>e.province!=='Gorizia'),baseline.events.filter(e=>e.province!=='Gorizia'));
assert.equal(events.length,45);assert.equal(catalog.events.length,6507);assert.equal(new Set(events.map(e=>e.city)).size,13);
for(const old of baseline.events.filter(e=>e.province==='Gorizia'))assert(events.some(e=>e.id===old.id),old.id);
assert.equal(baseline.events.filter(e=>e.province==='Gorizia').length,2);
assert.equal(audit.research.municipalities.length,25);assert.equal(new Set(audit.research.municipalities.map(m=>m.city)).size,25);
for(const m of audit.research.municipalities)assert(m.sources.length>=4,m.city);
assert.equal(audit.research.municipalRowAudit.length,65);assert.equal(audit.research.regionalRegistry.goriziaRows,0);
assert.equal(audit.research.municipalRegistryAudit.eventRowsReturned,4029);assert.equal(audit.research.municipalRegistryAudit.newsRowsReturned,3336);
assert.equal(audit.research.unpliAudit.municipalityQueries,25);assert.equal(audit.research.unpliAudit.detailUrlsRetrieved,49);
assert.equal(audit.research.openLeads.length,0);assert.equal(audit.research.limits.length,24);assert.equal(audit.research.exclusions.length,18);
assert(audit.research.sourceReceipts.length>=530);
for(const r of audit.research.sourceReceipts){assert(r.archiveStem);assert.equal(r.key,undefined);}
for(const row of audit.research.municipalRowAudit)for(const id of row.eventIds||[])assert(events.some(e=>e.id===id),id);
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-23');assert(e.participation.note.length>80,e.id);
 for(const u of e.sourceRecordIds)assert(audit.research.sourceReceipts.some(r=>r.url===u),u);
 for(const d of e.editions)assert(e.sourceRecordIds.includes(d.sourceUrl),e.id+' '+d.sourceUrl);
 if(e.pricing){assert(e.sourceRecordIds.includes(e.pricing.sourceUrl));assert.equal(e.participation.costs,e.pricing.details);}
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.toLowerCase().includes(name.toLowerCase()));assert(e,city+' '+name);return e;};
const dates=(city,name)=>event(city,name).editions.map(d=>d.start).filter(Boolean);
const span=(city,name,start,end)=>{assert.equal(event(city,name).editions[0].start,start);assert.equal(event(city,name).editions[0].end,end);};
span('Gorizia',"Sant'Andrea",'2026-12-05','2026-12-07');
assert.match(event('Gorizia',"Sant'Andrea").pricing.details,/85 €.*32 m².*100 €.*60 m².*115 €/);
assert.match(event('Gorizia',"Sant'Andrea").pricing.details,/aggiuntiva al canone/);
span('Gorizia','Contea','2026-04-26','2026-04-26');span('Gorizia','Bookweek','2026-06-12','2026-06-14');
assert.deepEqual(dates('Gorizia','Soffitta'),[]);assert.equal(event('Gorizia','Soffitta').months.includes(12),false);
span('Monfalcone','San Nicolò','2026-12-05','2026-12-05');
assert.deepEqual(dates('Monfalcone','Sbaracco'),['2026-02-28','2026-08-29']);
span('Monfalcone','Villaggio di Natale','2026-12-03','2026-12-26');
assert.equal(event('Monfalcone','Villaggio di Natale').participation.deadline,'2026-11-09');
assert.match(event('Monfalcone','Villaggio di Natale').pricing.details,/cauzione di 100 € restituita/);
assert.match(event('Monfalcone','Villaggio di Natale').participation.note,/non esercitano commercio/);
assert(event('Monfalcone','Bosco').editions[0].periodOnly);
span('Monfalcone','Vino e del Pesce','2026-06-12','2026-06-14');span('Monfalcone','Danza','2026-09-18','2026-09-20');
assert.deepEqual(dates('Grado','Arte Antiqua'),['2026-06-19','2026-08-21','2026-09-04']);assert.deepEqual(dates('Grado','Hobbisti'),[]);
assert(event('Grado','Nadal').editions[0].periodOnly);
assert.deepEqual(dates('Grado','FoodX'),['2026-09-03']);span('Grado','FriuliDoc','2026-05-29','2026-06-02');
assert.equal(events.filter(e=>e.name.includes('Vigili')).length,1);assert.equal(event('Grado','Vigili').contacts,undefined);
span("Gradisca d'Isonzo",'FABER','2026-10-09','2026-10-11');span("Gradisca d'Isonzo",'Sbaracco','2026-03-07','2026-03-07');
assert.deepEqual(dates("Gradisca d'Isonzo",'Fortezza'),[]);assert.equal(event("Gradisca d'Isonzo",'Fortezza').pricing,undefined);
assert.match(event('Cormons','Soffitta').source.label,/Il Goriziano/);
assert.match(event('Cormons','Soffitta').participation.note,/stampa|giornale|fonte locale/i);
assert(event("Romans d'Isonzo",'Elisabetta').editions[1].periodOnly);
assert.deepEqual(event("Romans d'Isonzo",'Langobardorum').editions.map(d=>d.year),[2026,2027]);
assert.deepEqual(dates('Ronchi dei Legionari','Di tutto'),['2026-01-03','2026-02-07']);
assert.deepEqual(event('Ronchi dei Legionari','Di tutto').months,[1,2,10,11,12]);
span('Turriaco','Mis Mas','2026-12-06','2026-12-06');assert.equal(event('Turriaco','Mis Mas').participation.deadline,'2026-11-07');
assert.match(event('Turriaco','Mis Mas').pricing.details,/10 €/);
span('San Floriano del Collio','Ciliegie','2025-06-08','2025-06-08');
assert.equal(events.filter(e=>e.editions.every(d=>d.year<=2025)).length,8);
assert.equal(audit.events.filter(e=>e.pricing).length,3);assert.equal(events.filter(e=>e.pricing).length,4);
assert.deepEqual(event('Gorizia','Gusti').pricing,baseline.events.find(e=>e.province==='Gorizia'&&e.name.includes('Gusti')).pricing);
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
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.FIERE_GO_BASE_URL||'http://127.0.0.1:'+server.address().port;
 try{for(const [engine,width]of [['chromium',1440],['chromium',320],['webkit',390]]){
  if(process.env.FIERE_GO_ENGINE&&process.env.FIERE_GO_ENGINE!==engine)continue;
  const browser=await pw[engine].launch();try{
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route('**/*',route=>{const u=new URL(route.request().url());if(['/js/supabase-config.js','/js/auth.js','/js/ui-components.js'].includes(u.pathname))return route.fulfill({contentType:'application/javascript',body:''});return u.origin===new URL(base).origin?route.continue():route.abort();});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await navigate(page,base+'/fiere?provincia=Gorizia&mesi=1,2,3,4,5,6,7,8,9,10,11,12');await page.waitForFunction(()=>document.querySelector('#list-count').textContent==='45');
   while(await page.locator('#load-more').isVisible())await page.locator('#load-more').click();
   assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es=>es.map(e=>e.dataset.eventId).sort()),events.map(e=>e.id).sort());
   await page.waitForFunction(()=>document.querySelector('#map-markers').children.length>0);
   assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es=>es.flatMap(e=>e.dataset.events.split(',')).sort()),events.map(e=>e.id).sort());
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   for(const e of events){await page.locator('.fiere-card[data-event-id="'+e.id+'"] .fiere-card-button').click();await page.waitForFunction(()=>document.querySelector('#fair-dialog').open);const dialog=page.locator('#fair-dialog');assert((await dialog.innerText()).replace(/\s+/g,' ').includes(e.name.replace(/\s+/g,' ')),e.id);assert(await dialog.locator('a[data-fiere-source]').count());if(e.pricing)assert.equal(await page.locator('#detail-costs').innerText(),e.pricing.details);assert(await dialog.evaluate(d=>d.scrollWidth<=d.clientWidth+1),e.id+' '+width);await page.locator('#close-detail').click();}
   assert.deepEqual(errors,[]);if(process.env.FIERE_GO_QA_DIR){fs.mkdirSync(process.env.FIERE_GO_QA_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.FIERE_GO_QA_DIR,engine+'-'+width+'.png')});}await context.close();
   const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}}),q=await nojs.newPage();
   for(const e of [event('Gorizia',"Sant'Andrea"),event('Monfalcone','Villaggio di Natale'),event('Turriaco','Mis Mas'),event("Romans d'Isonzo",'Elisabetta')]){const response=await navigate(q,base+'/fiere/'+e.id);assert.equal(response.status(),200);assert((await q.locator('h1').innerText()).replace(/\s+/g,' ').includes(e.name.replace(/\s+/g,' ')));assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
   await nojs.close();results.push({engine,width,events:events.length,dialogs:events.length,base,status:'passed'});console.log(engine,width,'Gorizia: catalogo, mappa, 45 dettagli e pagine senza JS OK');
  }finally{await browser.close();}
 }}finally{server.close();if(process.env.FIERE_GO_OUT)fs.writeFileSync(process.env.FIERE_GO_OUT,JSON.stringify(results,null,2));}
})().catch(e=>{console.error(e);process.exitCode=1;});
