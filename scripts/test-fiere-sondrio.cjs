// Sondrio: isolation, original-source decisions, commercial days and publication.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const catalog=read('data/fiere.json'),audit=read('data/fiere-sondrio.json');
const baseline=JSON.parse(cp.execFileSync('git',['show',audit.research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:30*1024*1024}));
const events=catalog.events.filter(e=>e.province==='Sondrio');
assert.deepEqual(catalog.events.filter(e=>e.province!=='Sondrio'),baseline.events.filter(e=>e.province!=='Sondrio'));
assert.equal(events.length,90);assert.equal(catalog.events.length,6343);assert.equal(new Set(events.map(e=>e.city)).size,38);
for(const old of baseline.events.filter(e=>e.province==='Sondrio'))assert(events.some(e=>e.id===old.id),old.id);
assert.equal(audit.research.municipalities.length,77);assert.equal(new Set(audit.research.municipalities.map(m=>m.city)).size,77);
for(const m of audit.research.municipalities){assert(m.sources.length,m.city);assert(m.sourceReceipts.length,m.city);}
assert.equal(audit.research.regionalRowAudit.length,532);assert.equal(audit.research.localFairsRegistry.length,3);
assert.equal(audit.research.destinationCalendarAudit.length,832);assert.equal(audit.research.regionalProgramsOcrUnique,99);
assert.equal(audit.research.openLeads.length,0);assert(audit.research.limits.length>=19);assert(audit.research.exclusions.length>=18);
assert(audit.research.sourceReceipts.length>=1450);
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-23');assert(e.participation.note.length>80,e.id);
 for(const u of e.sourceRecordIds)assert(audit.research.sourceReceipts.some(r=>r.url===u),u);
 for(const d of e.editions)assert(e.sourceRecordIds.includes(d.sourceUrl),e.id+' '+d.sourceUrl);
 if(e.pricing){assert(e.sourceRecordIds.includes(e.pricing.sourceUrl));assert.equal(e.participation.costs,e.pricing.details);}
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.toLowerCase().includes(name.toLowerCase()));assert(e,city+' '+name);return e;};
const dates=(city,name)=>event(city,name).editions.map(d=>d.start).filter(Boolean);
assert.deepEqual(dates('Sondrio','maggio'),['2026-05-03']);assert.equal(event('Sondrio','maggio').participation.deadline,'2026-03-04');
assert.deepEqual(dates('Sondrio','Vie del gusto'),['2026-10-31']);assert.equal(event('Sondrio','Vie del gusto').editions[0].end,'2026-11-01');
assert.deepEqual(dates('Chiuro','andrea'),['2026-11-29','2026-12-06']);
assert.deepEqual(dates('Chiuro','Grappolo'),['2026-08-29']);assert.deepEqual(dates('Villa di Tirano','Mela'),['2026-10-11']);
assert.deepEqual(dates('Berbenno di Valtellina','Giuseppe'),['2026-03-15']);
assert.deepEqual(dates('Madesimo','Fera'),['2026-08-22']);
assert.equal(dates('Valfurva','Mercatini').length,6);assert.deepEqual(dates('Lanzada','Sera'),['2026-07-28','2026-08-18']);
assert.equal(dates('Caspoggio','Mercatini').length,4);assert.equal(dates('Sondrio','Scarpabellando').length,6);
assert.deepEqual(dates('Tirano','pentecoste'),['2026-05-24','2026-05-25']);assert.match(event('Tirano','san martino').participation.note,/dieci giorni/);
assert.deepEqual(dates('Livigno','settembre'),['2026-09-06']);assert.equal(event('Livigno','settembre').participation.deadline,'2026-07-08');assert.match(event('Livigno','settembre').participation.note,/contenuto è espressamente 2026/);
assert.equal(event('Bormio','Gervasio').participation.deadline,'2026-04-30');assert.equal(event('Bormio','Donne').participation.deadline,'2026-08-12');
assert.equal(dates('Bormio','Natale').length,31);for(const d of ['2026-12-25','2026-12-26','2027-01-01'])assert(!dates('Bormio','Natale').includes(d));
assert.equal(event('Bormio','Natale').participation.deadline,'2026-10-04');assert.match(event('Bormio','Natale').pricing.details,/Cauzione 200/);
assert.equal(dates('Livigno','Natale').length,37);for(const d of ['2026-12-01','2026-12-09','2026-12-15','2026-12-25'])assert(!dates('Livigno','Natale').includes(d));
assert.equal(event('Novate Mezzola','Natale').participation.deadline,'2026-12-04');assert.equal(event('Novate Mezzola','Natale').pricing.kind,'free');
assert.equal(event('Cercino','Natale').participation.deadline,'2026-11-05');assert.equal(event('Mese','Natale').participation.deadline,'2026-11-16');
assert.equal(event('Prata Camportaccio','Natale').participation.deadline,'2026-11-08');
assert(event('Madesimo','Natale').editions[0].periodOnly);assert(event('Sondrio','Natale').editions[0].periodOnly);
assert(event('Campodolcino','Artigiani').editions.every(d=>d.year===2025));
assert.equal(dates('Teglio','Eufemia').length,0);assert.equal(dates('Teglio','Omobono').length,0);
assert.deepEqual(dates('Rasura','Mirtillo'),['2026-08-02']);assert.deepEqual(dates('Albaredo per San Marco','San Rocco'),['2026-08-15']);
assert.equal(events.filter(e=>e.pricing).length,7);assert(!events.some(e=>/Aspettando il Natale|Parco in Festa|Fiera di Autunno/i.test(e.name)&&e.city!=='Livigno'));
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
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=process.env.FIERE_SO_BASE_URL||'http://127.0.0.1:'+server.address().port;
 try{for(const [engine,width]of [['chromium',1440],['chromium',320],['webkit',390]]){
  const browser=await pw[engine].launch();try{
   const context=await browser.newContext({viewport:{width,height:900}});
   await context.route('**/*',route=>{const u=new URL(route.request().url());if(['/js/supabase-config.js','/js/auth.js','/js/ui-components.js'].includes(u.pathname))return route.fulfill({contentType:'application/javascript',body:''});return u.origin===new URL(base).origin?route.continue():route.abort();});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/fiere?provincia=Sondrio&mesi=1,2,3,4,5,6,7,8,9,10,11,12');await page.waitForFunction(()=>document.querySelector('#list-count').textContent==='90');
   while(await page.locator('#load-more').isVisible())await page.locator('#load-more').click();
   assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es=>es.map(e=>e.dataset.eventId).sort()),events.map(e=>e.id).sort());
   await page.waitForFunction(()=>document.querySelector('#map-markers').children.length>0);
   assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es=>es.flatMap(e=>e.dataset.events.split(',')).sort()),events.map(e=>e.id).sort());
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
   for(const e of events){await page.locator('.fiere-card[data-event-id="'+e.id+'"] .fiere-card-button').click();await page.waitForFunction(()=>document.querySelector('#fair-dialog').open);const dialog=page.locator('#fair-dialog');assert((await dialog.innerText()).replace(/\s+/g,' ').includes(e.name.replace(/\s+/g,' ')),e.id);assert(await dialog.locator('a[data-fiere-source]').count());if(e.pricing)assert.equal(await page.locator('#detail-costs').innerText(),e.pricing.details);assert(await dialog.evaluate(d=>d.scrollWidth<=d.clientWidth+1),e.id+' '+width);await page.locator('#close-detail').click();}
   assert.deepEqual(errors,[]);if(process.env.FIERE_SO_QA_DIR){fs.mkdirSync(process.env.FIERE_SO_QA_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.FIERE_SO_QA_DIR,engine+'-'+width+'.png')});}await context.close();
   const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}}),q=await nojs.newPage();
   for(const e of [event('Bormio','Natale'),event('Cercino','Natale'),event('Novate Mezzola','Natale'),event('Livigno','settembre')]){const response=await q.goto(base+'/fiere/'+e.id);assert.equal(response.status(),200);assert((await q.locator('h1').innerText()).replace(/\s+/g,' ').includes(e.name.replace(/\s+/g,' ')));assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
   await nojs.close();results.push({engine,width,events:events.length,dialogs:events.length,base,status:'passed'});console.log(engine,width,'Sondrio: catalogo, mappa, 90 dettagli e pagine senza JS OK');
  }finally{await browser.close();}
 }}finally{server.close();if(process.env.FIERE_SO_OUT)fs.writeFileSync(process.env.FIERE_SO_OUT,JSON.stringify(results,null,2));}
})().catch(e=>{console.error(e);process.exitCode=1;});
