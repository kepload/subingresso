// Forlì-Cesena: source dates, operational categories, preservation and rendering.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const catalog=read('data/fiere.json'),audit=read('data/fiere-forli-cesena.json'),events=catalog.events.filter(e=>e.province==='Forlì-Cesena');
const baseline=JSON.parse(cp.execFileSync('git',['show','07c5e5c:data/fiere.json'],{cwd:root,maxBuffer:20*1024*1024}));
assert.deepEqual(catalog.events.filter(e=>e.province!=='Forlì-Cesena'),baseline.events.filter(e=>e.province!=='Forlì-Cesena'));
for(const old of baseline.events.filter(e=>e.province==='Forlì-Cesena'))assert(events.some(e=>e.id===old.id));
assert.equal(events.length,88);assert.equal(new Set(events.map(e=>e.city)).size,30);
assert.equal(new Set(audit.research.municipalities.map(m=>m.city)).size,30);
for(const m of audit.research.municipalities)assert.equal(m.eventCount,events.filter(e=>e.city===m.city).length);
assert(audit.research.sourceDownloads.length>=1000);assert(audit.research.excluded.length>=20);
const find=name=>{const e=events.find(e=>e.name===name);assert(e,name);return e;},starts=name=>find(name).editions.map(e=>e.start);
assert.deepEqual(starts('FIERA E SAGRA DEL TARTUFO'),['2026-10-18','2026-10-25']);
assert.deepEqual(starts('Fiera del Formaggio di Fossa'),['2026-11-22','2026-11-29','2026-12-06']);
assert.match(find('Fiera del Formaggio di Fossa').pricing.details,/IVA esclusa/);
assert.equal(find('FIERA DI NATALE').editions[0].start,'2026-11-21');assert.equal(find('FIERA DI NATALE').editions[0].end,'2027-01-06');
assert.equal(find('Piccola Fiera d’Autunno').participation.deadline,'2026-10-02');assert.match(find('Piccola Fiera d’Autunno').pricing.details,/IVA inclusa/);
assert.match(find('Sagra del Pisello, mercati').participation.note,/SOLO domenica/);assert.match(find('Sagra del Pisello, mercati').pricing.details,/70 € per domenica/);
assert.equal(find('Mercatino di Natale, viale Anita Garibaldi').participation.deadline,'2026-10-30');assert.match(find('Mercatino di Natale, viale Anita Garibaldi').pricing.details,/cauzione di 100/);
assert.deepEqual(starts('FIERA DI SAN CRISPINO'),['2026-10-24']);assert.equal(find('FIERA DI SAN CRISPINO').editions[0].end,'2026-10-25');
assert.deepEqual(starts('R’Estate in Paese, mercatino hobbisti'),['2026-06-16']);
assert(find('Sagra de Bustrengh, mercatini artigianali').editions[0].periodOnly);
assert.equal(find('Mercatino di Natale di Fratta Terme').editions[0].year,2025);
assert(!find('Le Meraviglie di Zadina').editions[0].start);
assert(!events.some(e=>e.name==='Casa in Piazza'));
assert.equal(find('Festa Artusiana, mercato').participation.deadline,'2026-05-20');assert.equal(find('Festa Artusiana, mercato').pricing.kind,'partial');assert.match(find('Festa Artusiana, mercato').pricing.details,/cauzione 100/);
assert(!audit.research.limits.some(x=>x.includes('Allegati2026 non recuperati')));
const handler = require('../api/fiera');
for(const e of events){
 const response={setHeader(){},status(n){this.code=n;return this;},send(v){this.body=v;}};
 handler({query:{slug:e.id}},response);assert.equal(response.code,200);assert(!response.body.includes('undefined'));
 if(e.contacts?.email)assert(response.body.includes(e.contacts.email));
}
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/fiere/'))return handler({query:{slug:decodeURIComponent(url.pathname.slice(7))}},{setHeader:(k,v)=>res.setHeader(k,v),status(n){res.statusCode=n;return this;},send:v=>res.end(v)});
 const file=path.join(root,url.pathname==='/fiere'?'fiere.html':url.pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
 fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.js')?'application/javascript':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':'text/html');res.end(data);});
});
(async()=>{
 const pw=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=process.env.FIERE_FC_BASE_URL || 'http://127.0.0.1:'+server.address().port;
 try{
  for(const [engine,width] of [['chromium',1440],['chromium',390],['webkit',390]]){
   const browser=await pw[engine].launch({headless:true});
   try{
    const context=await browser.newContext({viewport:{width,height:900}});
    await context.route('**/*',route=>{
     const url=new URL(route.request().url());
     // Read-only calendar test: isolate unrelated auth/analytics integrations.
     if(['/js/supabase-config.js','/js/auth.js','/js/ui-components.js'].includes(url.pathname))return route.fulfill({contentType:'application/javascript',body:''});
     return url.origin===new URL(base).origin?route.continue():route.abort();
    });
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/fiere?provincia=Forl%C3%AC-Cesena&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
    await page.waitForFunction(()=>document.querySelector('#list-count').textContent==='88');
    while(await page.locator('#load-more').isVisible())await page.locator('#load-more').click();
    const ids=await page.locator('.fiere-card').evaluateAll(es=>es.map(e=>e.dataset.eventId).sort());
    assert.deepEqual(ids,events.map(e=>e.id).sort());
    await page.waitForFunction(()=>document.querySelector('#map-markers').children.length>0);
    const mapped=await page.locator('#map-markers > g').evaluateAll(es=>es.flatMap(e=>e.dataset.events.split(',')).sort());
    assert.deepEqual(mapped,ids);
    for(const name of ["Fiera del Formaggio di Fossa", "Piccola Fiera d’Autunno", "Sagra del Pisello, mercati", "Mercatino di Natale, viale Anita Garibaldi", "R’Estate in Paese, mercatino hobbisti"]){
     await page.locator('.fiere-card[data-event-id="'+find(name).id+'"] .fiere-card-button').click();
     assert(await page.locator('#fair-dialog').isVisible());assert.match(await page.locator('#fair-dialog').innerText(),/Forlì-Cesena/);
     await page.keyboard.press('Escape');
    }
    await page.selectOption('#sector-filter','alimentare');
    const expected=events.filter(e=>e.merchandiseSectors.includes('alimentare')).length;
    await page.waitForFunction(n=>document.querySelector('#list-count').textContent===String(n),expected);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
    const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}});
    const staticPage=await staticContext.newPage();
    for(const name of ["Fiera del Formaggio di Fossa", "Piccola Fiera d’Autunno", "Sagra del Pisello, mercati"]){
     const response=await staticPage.goto(base+'/fiere/'+find(name).id);assert.equal(response.status(),200);
     assert.equal(await staticPage.locator('h1').textContent(),name);assert((await staticPage.locator('main').innerText()).includes('Per partecipare'));
     assert(await staticPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    console.log(engine+' '+width+': 88 schede, mappa, settori, dettagli e pagine senza JS OK');
   }finally{await browser.close();}
  }
 }finally{await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
