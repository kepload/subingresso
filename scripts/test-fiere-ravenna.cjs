// Provincial regressions: unrelated records, commercial days and public rendering.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const catalog = read('data/fiere.json'), audit = read('data/fiere-ravenna.json');
const events = catalog.events.filter(e => e.province === 'Ravenna');
const baseline = JSON.parse(cp.execFileSync('git', ['show', '627ae99:data/fiere.json'], {cwd:root,maxBuffer:20*1024*1024}));
assert.deepEqual(catalog.events.filter(e=>e.province!=='Ravenna'), baseline.events.filter(e=>e.province!=='Ravenna'));
for(const old of baseline.events.filter(e=>e.province==='Ravenna')) assert(events.some(e=>e.id===old.id));
assert.equal(events.length,131);
assert.equal(new Set(events.map(e=>e.city)).size,17);
assert.equal(new Set(audit.research.municipalities.map(m=>m.city)).size,18);
assert(audit.research.sourceDownloads.length>=300);
assert(audit.research.excluded.length>=10);
const find = name => {const e=events.find(e=>e.name===name);assert(e,name);return e;};
const starts = name => find(name).editions.map(e=>e.start);
assert(!events.some(e=>e.city==='Bagnara di Romagna'));
assert.deepEqual(starts('Festa di San Lazzaro, fiera ambulanti'),['2026-03-22']);
assert.deepEqual(starts('Carnevale dei Ragazzi, fiera ambulanti'),['2026-02-15','2026-02-17']);
assert.equal(audit.research.regionalAttempts.length,221);
assert.equal(audit.research.regionalAttempts.filter(r=>r.status===200).length,23);
assert(!events.some(e=>/Mercabimbi|Mercatino dei bambini/.test(e.name)));
assert.deepEqual(starts("Festa di Primavera, mercatino artistico"),['2026-04-25','2026-05-01']);
assert.equal(find("Festa di Primavera, mercatino artistico").participation.deadline,'2026-04-18');
assert.match(find("Festa di Primavera, mercatino artistico").pricing.details,/18 .*due giorni/);
assert.deepEqual(starts("Festa della Musica, Notte Rosa, mercatino"),['2026-06-20']);
assert.equal(find("Festa della Musica, Notte Rosa, mercatino").editions[0].end,'2026-06-21');
assert.deepEqual(starts("Sapore di Sale, mercatino Borgomarina"),['2026-09-04']);
assert.deepEqual(starts("Sagra dello Scalogno di Romagna IGP"),['2026-07-17','2026-07-24']);
assert.deepEqual(starts("Mercato 100 Ceramiche alla 100 Km"),['2026-05-23']);
assert.equal(find("Fatto ad Arte").pricing.kind,'partial');
assert(!find("Fatto ad Arte").months.includes(9));
assert(!find("Mercatino degli hobbisti").editions[0].start);
assert.deepEqual(starts("La Pulce d\u2019Acqua"),['2026-03-08','2026-04-11','2026-06-07','2026-09-13','2026-10-11','2026-11-01','2026-12-08']);
assert.deepEqual(starts("SUA MAESTA' IL TARTUFO"),['2026-11-22']);
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
 const base=process.env.FIERE_RAVENNA_BASE_URL || 'http://127.0.0.1:'+server.address().port;
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
    await page.goto(base+'/fiere?provincia=Ravenna&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
    await page.waitForFunction(()=>document.querySelector('#list-count').textContent==='131');
    while(await page.locator('#load-more').isVisible())await page.locator('#load-more').click();
    const ids=await page.locator('.fiere-card').evaluateAll(es=>es.map(e=>e.dataset.eventId).sort());
    assert.deepEqual(ids,events.map(e=>e.id).sort());
    await page.waitForFunction(()=>document.querySelector('#map-markers').children.length>0);
    const mapped=await page.locator('#map-markers > g').evaluateAll(es=>es.flatMap(e=>e.dataset.events.split(',')).sort());
    assert.deepEqual(mapped,ids);
    for(const name of ["Festa di Primavera, mercatino artistico", "Sagra dello Scalogno di Romagna IGP", "Fatto ad Arte", "La Pulce d\u2019Acqua", "Mercato 100 Ceramiche alla 100 Km"]){
     await page.locator('.fiere-card[data-event-id="'+find(name).id+'"] .fiere-card-button').click();
     assert(await page.locator('#fair-dialog').isVisible());assert.match(await page.locator('#fair-dialog').innerText(),/Ravenna/);
     await page.keyboard.press('Escape');
    }
    await page.selectOption('#sector-filter','alimentare');
    const expected=events.filter(e=>e.merchandiseSectors.includes('alimentare')).length;
    await page.waitForFunction(n=>document.querySelector('#list-count').textContent===String(n),expected);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
    const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}});
    const staticPage=await staticContext.newPage();
    for(const name of ["Festa di Primavera, mercatino artistico", "Fatto ad Arte", "Sagra dello Scalogno di Romagna IGP"]){
     const response=await staticPage.goto(base+'/fiere/'+find(name).id);assert.equal(response.status(),200);
     assert.equal(await staticPage.locator('h1').textContent(),name);assert((await staticPage.locator('main').innerText()).includes('Per partecipare'));
     assert(await staticPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    console.log(engine+' '+width+': 131 schede, mappa, settori, dettagli e pagine senza JS OK');
   }finally{await browser.close();}
  }
 }finally{await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
