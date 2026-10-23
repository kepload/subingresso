// Belluno: isolation, original-source decisions, commercial days and publication.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const catalog=read('data/fiere.json'),audit=read('data/fiere-belluno.json');
const baseline=JSON.parse(cp.execFileSync('git',['show',audit.research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:30*1024*1024}));
const events=catalog.events.filter(e=>e.province==='Belluno');
assert.deepEqual(catalog.events.filter(e=>e.province!=='Belluno'),baseline.events.filter(e=>e.province!=='Belluno'));
assert.equal(events.length,134);assert.equal(catalog.events.length,6464);assert.equal(new Set(events.map(e=>e.city)).size,43);
for(const old of baseline.events.filter(e=>e.province==='Belluno'))assert(events.some(e=>e.id===old.id),old.id);
assert.equal(audit.research.municipalities.length,60);assert.equal(new Set(audit.research.municipalities.map(m=>m.city)).size,60);
for(const m of audit.research.municipalities){assert(m.sources.length,m.city);assert(m.sourceReceipts.length,m.city);}
assert.equal(audit.research.regionalRowAudit.length,94);assert.equal(audit.research.tradeFairsRegistry.length,33);
assert.equal(audit.research.tradeFairsRegistry.filter(r=>r.decision==='excluded-other-province').length,1);
assert.equal(audit.research.destinationCalendarAudit.sitemapEvents,254);assert.equal(audit.research.destinationCalendarAudit.apiRecords,429);
assert.equal(audit.research.openLeads.length,0);assert.equal(audit.research.limits.length,24);assert.equal(audit.research.exclusions.length,20);
assert(audit.research.sourceReceipts.length>=518);assert.equal(baseline.events.filter(e=>e.province==='Belluno').length,13);
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-23');assert(e.participation.note.length>80,e.id);
 for(const u of e.sourceRecordIds)assert(audit.research.sourceReceipts.some(r=>r.url===u),u);
 for(const d of e.editions)assert(e.sourceRecordIds.includes(d.sourceUrl),e.id+' '+d.sourceUrl);
 if(e.pricing){assert(e.sourceRecordIds.includes(e.pricing.sourceUrl));assert.equal(e.participation.costs,e.pricing.details);}
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.toLowerCase().includes(name.toLowerCase()));assert(e,city+' '+name);return e;};
const dates=(city,name)=>event(city,name).editions.map(d=>d.start).filter(Boolean);
assert.deepEqual(dates('Limana','17^ FESTA'),['2026-10-18']);assert.equal(event('Limana','17^ FESTA').participation.deadline,'2026-10-04');
assert.match(event('Limana','17^ FESTA').pricing.details,/30 €/);
assert.deepEqual(dates('Fonzaso',"FESTA DELL'UVA"),['2026-09-27']);assert.match(event('Fonzaso',"FESTA DELL'UVA").pricing.details,/20 €/);
assert.deepEqual(dates('Sedico','SEDICO IN FESTA'),['2026-05-17']);
assert.deepEqual(dates('Lamon','Fagiolo'),['2026-09-19']);assert.equal(event('Lamon','Fagiolo').editions[0].end,'2026-09-20');
assert.match(event('Lamon','Fagiolo').pricing.details,/550/);
assert.deepEqual(dates('Borgo Valbelluna','Fantasy'),['2026-05-30']);assert.equal(event('Borgo Valbelluna','Fantasy').editions[0].end,'2026-05-31');
assert.deepEqual(dates('Borgo Valbelluna','Era Ora'),['2026-05-24']);assert.match(event('Borgo Valbelluna','Era Ora').pricing.details,/15 €/);
assert.match(event('Borgo Valbelluna','Era Ora').participation.note,/gazebo vietato/i);
assert.deepEqual(dates('Setteville','Zucca'),['2026-10-03']);assert.equal(event('Setteville','Zucca').editions[0].end,'2026-10-04');
assert.deepEqual(dates('Santo Stefano di Cadore','Santi'),['2026-11-07']);assert.equal(event('Santo Stefano di Cadore','Santi').editions[0].end,'2026-11-08');
assert.deepEqual(dates('Seren del Grappa','Moroni'),['2026-10-11']);assert.deepEqual(dates('Feltre','Palio'),['2026-08-01']);
assert.deepEqual(dates('Colle Santa Lucia','Col in Festa'),['2026-08-22']);assert.deepEqual(dates('Alpago','Sant’Anna'),['2026-07-26']);
assert.deepEqual(dates('Tambre','Alchemico'),['2026-06-20']);
assert.deepEqual(dates('Lozzo di Cadore','Lorenzo'),['2025-08-10','2026-08-10']);
assert.deepEqual(dates('Lozzo di Cadore','Rosario'),['2025-10-12','2026-10-11']);
assert.equal(event('Lozzo di Cadore','Rosario').editions[1].dateType,'calendar');
assert.equal(dates('Feltre','Oggetto').length,10);assert.equal(dates('Borgo Valbelluna','Natale').length,8);
assert.deepEqual(dates('Feltre','San Matteo'),['2026-11-08']);assert.equal(event('Feltre','San Matteo').participation.deadline,'2026-10-18');
assert.equal(event('Borca di Cadore','San Simon').pricing.kind,'partial');
for(const [city,name]of [['Alpago','Ariapura'],['Gosaldo','Primavera'],['Val di Zoldo','Antiquariato'],['Val di Zoldo','Vivi il Giorno'],['Pieve di Cadore','Antiquariato'],["Cortina d'Ampezzo",'Filippo']])assert.equal(dates(city,name).length,0);
assert(event('Limana','NATALE').editions[0].periodOnly);
assert.equal(events.filter(e=>e.editions.every(d=>d.year<=2025)).length,8);
assert.equal(events.filter(e=>e.pricing).length,10);
assert.equal(event('Longarone','MIG').editions[0].dateType,'calendar');
assert.equal(event('Longarone','Agrimont').editions.length,10);
const handler=require('../api/fiera');
for(const e of events){const r={setHeader(){},status(n){this.code=n;return this;},send(s){this.body=s;}};handler({query:{slug:e.id}},r);assert.equal(r.code,200);assert(r.body.includes(e.id));assert(!r.body.includes('undefined'));}
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');
 if(u.pathname.startsWith('/fiere/'))return handler({query:{slug:decodeURIComponent(u.pathname.slice(7))}},{setHeader:(k,v)=>res.setHeader(k,v),status(n){res.statusCode=n;return this;},send:s=>res.end(s)});
 const file=path.join(root,u.pathname==='/fiere'?'fiere.html':u.pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(err,d)=>{if(err){res.writeHead(404);return res.end();}res.setHeader('Content-Type',/\.m?js$/.test(file)?'application/javascript':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':'text/html');res.end(d);});
});
(async()=>{
 assert(process.env.PLAYWRIGHT_MODULE,'PLAYWRIGHT_MODULE richiesto');const pw=require(process.env.PLAYWRIGHT_MODULE),results=[];
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.FIERE_BL_BASE_URL||'http://127.0.0.1:'+server.address().port;
 try{for(const [engine,width]of [['chromium',1440],['chromium',320],['webkit',390]]){
  const browser=await pw[engine].launch();try{
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route('**/*',route=>{const u=new URL(route.request().url());if(['/js/supabase-config.js','/js/auth.js','/js/ui-components.js'].includes(u.pathname))return route.fulfill({contentType:'application/javascript',body:''});return u.origin===new URL(base).origin?route.continue():route.abort();});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/fiere?provincia=Belluno&mesi=1,2,3,4,5,6,7,8,9,10,11,12');await page.waitForFunction(()=>document.querySelector('#list-count').textContent==='134');
   while(await page.locator('#load-more').isVisible())await page.locator('#load-more').click();
   assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es=>es.map(e=>e.dataset.eventId).sort()),events.map(e=>e.id).sort());
   await page.waitForFunction(()=>document.querySelector('#map-markers').children.length>0);
   assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es=>es.flatMap(e=>e.dataset.events.split(',')).sort()),events.map(e=>e.id).sort());
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   for(const e of events){await page.locator('.fiere-card[data-event-id="'+e.id+'"] .fiere-card-button').click();await page.waitForFunction(()=>document.querySelector('#fair-dialog').open);const dialog=page.locator('#fair-dialog');assert((await dialog.innerText()).replace(/\s+/g,' ').includes(e.name.replace(/\s+/g,' ')),e.id);assert(await dialog.locator('a[data-fiere-source]').count());if(e.pricing)assert.equal(await page.locator('#detail-costs').innerText(),e.pricing.details);assert(await dialog.evaluate(d=>d.scrollWidth<=d.clientWidth+1),e.id+' '+width);await page.locator('#close-detail').click();}
   assert.deepEqual(errors,[]);if(process.env.FIERE_BL_QA_DIR){fs.mkdirSync(process.env.FIERE_BL_QA_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.FIERE_BL_QA_DIR,engine+'-'+width+'.png')});}await context.close();
   const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}}),q=await nojs.newPage();
   for(const e of [event('Limana','17^ FESTA'),event('Borgo Valbelluna','Era Ora'),event('Santo Stefano di Cadore','Santi'),event('Lozzo di Cadore','Rosario')]){const response=await q.goto(base+'/fiere/'+e.id);assert.equal(response.status(),200);assert((await q.locator('h1').innerText()).replace(/\s+/g,' ').includes(e.name.replace(/\s+/g,' ')));assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
   await nojs.close();results.push({engine,width,events:events.length,dialogs:events.length,base,status:'passed'});console.log(engine,width,'Belluno: catalogo, mappa, 134 dettagli e pagine senza JS OK');
  }finally{await browser.close();}
 }}finally{server.close();if(process.env.FIERE_BL_OUT)fs.writeFileSync(process.env.FIERE_BL_OUT,JSON.stringify(results,null,2));}
})().catch(e=>{console.error(e);process.exitCode=1;});
