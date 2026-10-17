// Provincial regressions: unrelated records, commercial days and public rendering.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const catalog = read('data/fiere.json'), audit = read('data/fiere-rimini.json');
const events = catalog.events.filter(e => e.province === 'Rimini');
const baseline = JSON.parse(cp.execFileSync('git', ['show', '1c6e0cb:data/fiere.json'], {cwd:root,maxBuffer:20*1024*1024}));
assert.deepEqual(catalog.events.filter(e=>e.province!=='Rimini'), baseline.events.filter(e=>e.province!=='Rimini'));
for(const old of baseline.events.filter(e=>e.province==='Rimini')) assert(events.some(e=>e.id===old.id));
assert.equal(events.length,115);
assert.equal(new Set(events.map(e=>e.city)).size,25);
assert.equal(new Set(audit.research.municipalities.map(m=>m.city)).size,27);
assert.equal(audit.research.regionalAttempts.length,375);
const find = name => {const e=events.find(e=>e.name===name);assert(e,name);return e;};
const starts = name => find(name).editions.map(e=>e.start);
assert(!events.some(e=>e.name==='Fiera di Pasqua'));
assert.deepEqual(starts('FIERA DI NATALE'),['2026-12-11','2027-12-11']);
assert.equal(find('FIERA DI NATALE').stallCount,2);
assert.deepEqual(starts('Fiera di Natale, generi vari').filter(d=>d.startsWith('2026')),['2026-12-20','2026-12-21','2026-12-22','2026-12-24']);
assert.equal(find('Fiera di Natale, generi vari').participation.deadline,'2026-10-20');
assert.match(find('Fiera di Natale, casette di piazza Tre Martiri').participation.note,/nessuna domanda/);
assert.equal(find('Fiera della Fogheraccia').participation.deadline,'2027-01-17');
assert.match(find('Fiera della Fogheraccia').participation.url,/202027\.pdf$/);
assert.deepEqual(starts('IL PAESE DEL NATALE'),['2026-12-06','2026-12-07','2026-12-08','2026-12-13','2026-12-20']);
assert.match(find('IL PAESE DEL NATALE').pricing.details,/cinque giornate/);
assert.match(find('Fiera nazionale del Tartufo Bianco').pricing.details,/300 euro.*6 euro/);
assert.deepEqual(starts('FIERA DEI SANTI'),['2026-11-01']);
assert.deepEqual(starts('Sagra Fagioli e Cotiche, bancarelle'),['2026-10-03','2026-10-04']);
assert.equal(find('Sagra Fagioli e Cotiche, bancarelle').region,'Emilia-Romagna');
assert.equal(find('Millenaria Fiera di Pugliano').participation.deadline,'2026-07-15');
assert(!find('Fiera di San Marco').editions[0].start);
assert.equal(find('La Notte delle Streghe').participation.deadline,'2026-06-13');
assert.match(find('MotoGP, posteggi commerciali esterni').pricing.details,/61 euro.*55 euro/);
assert.equal(find('MotoGP, posteggi commerciali esterni').stallCount,35);
assert(find('Antica Fiera di San Gregorio').editions[0].periodOnly);
assert(!find('FIERA DELL\'OLIVA E DEI PRODOTTI AUTUNNALI').participation.deadline);
assert.equal(find('Giardini d’Autore, autunno').city,'Bellaria-Igea Marina');
assert.equal(find('Riccione Christmas Village').editions[0].end,'2027-01-10');
assert(!events.some(e=>/Mercabimbi|Balocchi|Domenica del Riuso/.test(e.name)));
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
 const base=process.env.FIERE_RIMINI_BASE_URL || 'http://127.0.0.1:'+server.address().port;
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
    await page.goto(base+'/fiere?provincia=Rimini&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
    await page.waitForFunction(()=>document.querySelector('#list-count').textContent==='115');
    while(await page.locator('#load-more').isVisible())await page.locator('#load-more').click();
    const ids=await page.locator('.fiere-card').evaluateAll(es=>es.map(e=>e.dataset.eventId).sort());
    assert.deepEqual(ids,events.map(e=>e.id).sort());
    await page.waitForFunction(()=>document.querySelector('#map-markers').children.length>0);
    const mapped=await page.locator('#map-markers > g').evaluateAll(es=>es.flatMap(e=>e.dataset.events.split(',')).sort());
    assert.deepEqual(mapped,ids);
    for(const name of ['Fiera di Natale, generi vari','IL PAESE DEL NATALE','MotoGP, posteggi commerciali esterni','Sagra Fagioli e Cotiche, bancarelle']){
     await page.locator('.fiere-card[data-event-id="'+find(name).id+'"] .fiere-card-button').click();
     assert(await page.locator('#fair-dialog').isVisible());assert.match(await page.locator('#fair-dialog').innerText(),/Rimini/);
     await page.keyboard.press('Escape');
    }
    await page.selectOption('#sector-filter','alimentare');
    const expected=events.filter(e=>e.merchandiseSectors.includes('alimentare')).length;
    await page.waitForFunction(n=>document.querySelector('#list-count').textContent===String(n),expected);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
    const staticContext=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}});
    const staticPage=await staticContext.newPage();
    for(const name of ['Fiera di Natale, generi vari','Millenaria Fiera di Pugliano','Riccione Christmas Village','Sagra Fagioli e Cotiche, bancarelle']){
     const response=await staticPage.goto(base+'/fiere/'+find(name).id);assert.equal(response.status(),200);
     assert.equal(await staticPage.locator('h1').textContent(),name);assert((await staticPage.locator('main').innerText()).includes('Per partecipare'));
     assert(await staticPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    }
    console.log(engine+' '+width+': 115 schede, mappa, settori, dettagli e pagine senza JS OK');
   }finally{await browser.close();}
  }
 }finally{await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
