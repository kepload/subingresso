// Florence: source-specific commercial dates, deadlines, fees and catalogue preservation.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const http = require('node:http');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const catalog = read('data/fiere.json');
const audit = read('data/fiere-firenze.json');
const events = catalog.events.filter(e => e.province === 'Firenze');
const baseline = JSON.parse(cp.execFileSync('git', ['show','c10b9e9:data/fiere.json'], {cwd:root,maxBuffer:20*1024*1024}));
assert.deepEqual(catalog.events.filter(e=>e.province!=='Firenze'),baseline.events.filter(e=>e.province!=='Firenze'));
for(const e of baseline.events.filter(e=>e.province==='Firenze')) assert(events.some(n=>n.id===e.id));
assert.equal(events.length,113);
assert.equal(new Set(events.map(e=>e.city)).size,40);
assert.equal(audit.research.municipalities.length,41);
assert.equal(new Set(audit.research.municipalities.map(m=>m.city)).size,41);
const find = name => {const e=events.find(e=>e.name===name);assert(e,name);return e;};
const days = name => find(name).editions.filter(e=>e.start&&!e.periodOnly).map(e=>e.start);
const has = (name,day) => find(name).editions.some(e=>e.start&&!e.periodOnly&&e.start<=day&&day<=e.end);
assert.deepEqual(days('Fiera di Novembre'),['2026-11-01','2026-11-03','2026-11-05','2026-11-07']);
assert(!has('Fiera di Novembre','2026-11-02'));
assert(has('Fiera di Novembre','2026-11-08'));
assert.deepEqual(days('Fiera Arte e Sport di Cerbaia'),['2026-06-07','2026-06-14']);
assert(!has('Fiera Arte e Sport di Cerbaia','2026-06-08'));
assert.deepEqual(days('Fiera di Pratolino, mercato contadino'),['2026-07-26']);
assert(!has('Fiera di Pratolino, mercato contadino','2026-07-27'));
assert.deepEqual(days('Fiera delle merci del Perdono'),['2026-09-14']);
assert(!has('Cèramica, mostra mercato','2026-12-09'));
assert(has('Cèramica, mostra mercato','2026-12-07'));
assert.equal(find('Cèramica, mostra mercato').participation.deadline,'2026-10-12');
assert.match(find('Cèramica, mostra mercato').pricing.details,/Bando B non professionisti: quota 25/);
assert.equal(find('Prim.OLIO').participation.deadline,'2026-10-26');
assert.match(find('Prim.OLIO').pricing.details,/300.*Onlus gratuite/s);
assert.equal(find('Empolissima').participation.deadline,'2026-10-30');
assert.equal(find('Rionalissima').participation.deadline,'2026-10-16');
assert.equal(find('Fiera di Natale, posteggi per abeti').participation.deadline,'2026-10-23');
assert(!has('Fiera di Natale, posteggi per abeti','2026-12-25'));
assert(has('Fiera di Natale, posteggi per dolciumi e articoli natalizi','2027-01-05'));
assert.equal(find('Cascine in Fiera, Grande Fiera di Ognissanti').participation.deadline,'2026-10-14');
assert(has('Fierucola di Santo Spirito','2026-06-14'));
assert(!has('Fierucola di Santo Spirito','2026-06-21'));
assert(has('Fierucola del Carmine','2026-06-07'));
assert(!has('Fierucola del Carmine','2026-06-14'));
assert(has('Fierucola del Pane','2026-09-06'));
assert(!events.some(e=>/legnaioli|San Giovanni/i.test(e.name)));
assert(has('Collezionisti in Piazza','2026-08-30'));
assert(!has('Collezionisti in Piazza','2026-09-06'));
assert(find('Festa di Settembre, mercato della Pesca Regina').editions.every(e=>e.year===2025));
assert(find('Fiera di Novembre a Galliano').editions.every(e=>e.year===2025));
for(const e of events){
  assert(e.source.checkedAt&&e.participation.note);
  assert(!/\uFFFD|[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(JSON.stringify(e)));
  assert(Number.isFinite(e.lat)&&Number.isFinite(e.lng));
  for(const d of e.editions) if(d.start){
    for(let day=new Date(d.start+'T12:00:00Z');day<=new Date(d.end+'T12:00:00Z');day.setUTCDate(day.getUTCDate()+1)) assert(e.months.includes(day.getUTCMonth()+1),e.name);
  }
}
const server=http.createServer((req,res)=>{
  let file=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1);
  if(!path.extname(file))file+='.html';const full=path.resolve(root,file);
  if(!full.startsWith(root+path.sep))return res.writeHead(403).end();
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css'})[path.extname(full)]||'text/plain');
  fs.readFile(full,(e,data)=>e?res.writeHead(404).end():res.end(data));
});
const selected=['Prim.OLIO','Empolissima','Rionalissima','Fiera di Natale, posteggi per abeti','Fiera di Natale, posteggi per dolciumi e articoli natalizi','Cèramica, mostra mercato','Fiera di Novembre','Fiera Arte e Sport di Cerbaia','Fierucola di Santo Spirito','Fiera di Oltrarno','Collezionisti in Piazza','Festa di Settembre, mercato della Pesca Regina'];
async function browserTest(engine,label,viewport,base){
  const browser=await engine.launch();
  try{
    const context=await browser.newContext({viewport});
    await context.route('**/*',route=>{
      const u=new URL(route.request().url());
      if(u.origin!==base||/\/js\/(?:auth|supabase-config|page-view-tracker)\.js$/.test(u.pathname))return route.fulfill({status:200,body:''});
      return route.continue();
    });
    const page=await context.newPage(), errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/fiere?provincia=Firenze');
    await page.waitForFunction(()=>document.querySelector('#list-count').textContent==='113');
    assert.equal(await page.locator('#province-filter').inputValue(),'Firenze');
    const markers=await page.locator('#map-markers > g').evaluateAll(nodes=>nodes.flatMap(n=>n.dataset.events.split(',')).sort());
    assert.deepEqual(markers,events.map(e=>e.id).sort());
    await page.locator('#extra-filters > summary').click();
    for(const name of selected){
      const e=find(name);await page.locator('#fair-search').fill(name);
      await page.locator('.fiere-card[data-event-id="'+e.id+'"] .fiere-card-button').click();
      assert.equal(await page.locator('#detail-title').textContent(),name);
      assert.equal(await page.locator('#detail-location').textContent(),e.city+' · Firenze');
      assert.equal(await page.locator('#detail-source').getAttribute('href'),e.source.url);
      assert.equal(await page.locator('#detail-editions .fiere-edition').count(),e.editions.length);
      if(e.pricing)assert.equal(await page.locator('#detail-costs').textContent(),e.pricing.details);
      if(e.participation.deadline)assert((await page.locator('#detail-deadline').textContent()).length>0);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(process.env.FIERE_SCREENSHOT_DIR&&name==='Prim.OLIO') await page.screenshot({path:path.join(process.env.FIERE_SCREENSHOT_DIR,label.replace(/\W/g,'-')+'.png'),fullPage:true});
      await page.locator('#close-detail').click();
    }
    assert.deepEqual(errors,[]);console.log(label+': 113 risultati, mappa e 12 dettagli verificati');
  }finally{await browser.close();}
}
(async()=>{
  const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');let base=process.env.FIERE_TEST_BASE_URL;
  if(!base){await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;}
  else for(const file of ['data/fiere.json','js/pages/fiere.js','fiere.html']){
    const response=await fetch(base+'/'+file+'?verify=firenze-20261016');assert.equal(response.status,200);
    const published=Buffer.from(await response.arrayBuffer());const committed=cp.execFileSync('git',['show','HEAD:'+file],{cwd:root,maxBuffer:20*1024*1024});
    const hash=b=>crypto.createHash('sha256').update(b).digest('hex');assert.equal(hash(published),hash(committed),file+' online identico al commit');
  }
  await browserTest(pw.chromium,'Chromium computer',{width:1440,height:1000},base);
  await browserTest(pw.chromium,'Chromium telefono',{width:390,height:844},base);
  await browserTest(pw.webkit,'WebKit telefono',{width:390,height:844},base);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
