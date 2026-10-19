// Rome: commercial days, deadlines, costs and preservation of all other provinces.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const http = require('node:http');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const catalog=read('data/fiere.json'),audit=read('data/fiere-roma.json');
const events=catalog.events.filter(e=>e.province==='Roma');
const baseline=JSON.parse(cp.execFileSync('git',['show','da814ba6632303ee33f9defe72fa47bb605d1992:data/fiere.json'],{cwd:root,maxBuffer:20*1024*1024}));
assert.deepEqual(catalog.events.filter(e=>e.province!=='Roma'),baseline.events.filter(e=>e.province!=='Roma'));
for(const old of baseline.events.filter(e=>e.province==='Roma'))assert(events.some(e=>e.id===old.id));
assert.equal(events.length,127);assert.equal(new Set(events.map(e=>e.city)).size,48);
assert.equal(audit.research.municipalities.length,121);
assert.equal(new Set(audit.research.municipalities.map(m=>m.city)).size,121);
assert.equal(audit.research.regionalRegistry.length,31);
assert(audit.research.status.startsWith('documental-research-complete'));
assert.equal(audit.research.closure20261016.municipalCoverage.length,15);
assert.equal(audit.research.closure20261016.eventsAdded,11);
const find=name=>{const e=events.find(e=>e.name===name);assert(e,name);return e;};
for(const old of baseline.events.filter(e=>e.province==='Roma'))assert.deepEqual(events.find(e=>e.id===old.id),old);
assert.equal(audit.research.followUp20261016.eventsAdded,17);
assert(!events.some(e=>/Casal Monastero/.test(e.name)));
const tolfa=find('TolfArte, area TTS Food');assert.equal(tolfa.editions[0].start,'2026-08-08');assert.equal(tolfa.editions[0].end,'2026-08-09');
assert.deepEqual(tolfa.merchandiseSectors,['alimentare']);assert(!tolfa.pricing);
for(const name of audit.research.followUp20261016.addedNames){const e=find(name);assert(e.editions[0].end<'2026-10-16');assert.match(e.participation.note,/selezionati/);assert(!e.pricing);}

const perdono=find('Fiera del Perdono');
assert.equal(perdono.city,'Vicovaro');assert.equal(perdono.participation.deadline,'2026-07-28');
assert.match(perdono.pricing.details,/0,60 euro/);assert.match(perdono.pricing.details,/30%/);
assert.match(perdono.participation.note,/ore 11/);assert.match(perdono.hours,/14:30/);
const befana=find('Festa della Befana in Piazza Navona');assert.equal(befana.editions[0].start,'2026-12-01');
assert.equal(befana.editions[0].end,'2027-01-06');assert.equal(befana.editions[0].periodOnly,true);assert(!befana.participation.deadline);
assert.equal(find('Festa del Fungo Porcino e area espositiva').city,'Velletri');
const lariano=find('Sagra del Fungo Porcino, area fiera ed espositori');assert.equal(lariano.city,'Lariano');assert.equal(lariano.editions[0].start,'2026-09-11');assert.equal(lariano.editions[0].end,'2026-09-14');assert.equal(lariano.editions[0].periodOnly,true);assert.match(lariano.participation.note,/23 gazebo/);assert.match(lariano.pricing.details,/Non equivale a stand gratuito/);
const artisan=find('TolfArte, mercatino di artigianato artistico');assert(!artisan.editions[0].start);assert.match(artisan.participation.note,/37 espositori/);
for(const venue of ['Piazza degli Euganei','Viale Adriatico','Via Francesco Jovine'])assert.equal(find('Mercatino di Natale Municipio III, '+venue).editions[0].periodOnly,true);
const days=name=>find(name).editions.map(e=>e.start);
const has=(name,day)=>find(name).editions.some(e=>e.start&&e.start<=day&&day<=e.end);
assert.deepEqual(days('Mercatini di Natale'),['2026-12-13','2026-12-20','2026-12-27']);
assert.equal(find('Mercatini di Natale').participation.deadline,'2026-11-15');
assert.match(find('Mercatini di Natale').pricing.details,/50 euro a giornata.*70 euro a giornata/);
assert.equal(find('Sagra del Marrone Segnino, fiera ambulante').participation.deadline,'2026-10-09');
assert(!has('Sagra del Marrone Segnino, fiera ambulante','2026-10-23'));
assert(has('Sagra del Marrone Segnino, fiera ambulante','2026-10-24'));
assert.match(find('Sagra del Marrone Segnino, fiera ambulante').pricing.details,/canone/);
assert(!find('Bajocco Festival, mercatino artigianato artistico').participation.deadline);
assert.match(find('Bajocco Festival, mercatino artigianato artistico').pricing.details,/130 euro.*IVA/);
assert.equal(find('Fiera della Beata Vergine del Carmine').participation.deadline,'2026-09-29');
assert.equal(find('Fiera di San Nicola da Bari').participation.deadline,'2026-04-24');
assert.match(find('Fiera di San Nicola da Bari').pricing.details,/43,10 euro/);
assert(!has('Festa di Maggio, fiera gastronomica','2026-05-04'));
assert(has('Festa di Maggio, fiera gastronomica','2026-05-09'));
assert(!has('Sagra delle Pesche, street food e mercatino sul lungolago','2026-07-26'));
assert.deepEqual(days('Maker Faire Rome'),['2026-10-23']);
assert.deepEqual(days('Primavera alla Landriana'),['2026-03-28']);
assert(find('Fiera di Santa Lucia').editions.every(d=>d.year===2025));
assert(find("Fiera di Sant'Agostino").editions.every(d=>d.year===2025));
assert.equal(find('Fiera di San Clemente').editions.length,0);
assert.equal(find('Mercatino del Formale').editions.length,0);
assert.equal(find('Blue Planet Economy Expoforum').city,'Fiumicino');
assert(has('Mostra Mercato Natalizia, Piazza Giuseppe Mazzini','2027-01-06'));
assert(!has('Mostra Mercato Natalizia, Largo San Giovanni de Matha','2026-12-31'));
for(const e of events){
 assert(e.source.checkedAt&&e.participation.note);
 assert(!/\uFFFD|[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(JSON.stringify(e)));
 assert(Number.isFinite(e.lat)&&Number.isFinite(e.lng));
 for(const d of e.editions)if(d.start)for(let x=new Date(d.start+'T12:00:00Z');x<=new Date(d.end+'T12:00:00Z');x.setUTCDate(x.getUTCDate()+1))assert(e.months.includes(x.getUTCMonth()+1),e.name);
}
const server=http.createServer((req,res)=>{
  let file=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1);
  if(!path.extname(file))file+='.html';const full=path.resolve(root,file);
  if(!full.startsWith(root+path.sep))return res.writeHead(403).end();
  res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css'})[path.extname(full)]||'text/plain');
  fs.readFile(full,(e,data)=>e?res.writeHead(404).end():res.end(data));
});
const selected=["Mercatini di Natale", "Sagra del Marrone Segnino, fiera ambulante", "Bajocco Festival, mercatino artigianato artistico", "Fiera Nazionale dell'Artigianato e dell'Enogastronomia", "Fiera di San Nicola da Bari", "Fiera della Beata Vergine del Carmine", "Festa di Maggio, fiera gastronomica", "Sagra delle Pesche, street food e mercatino sul lungolago", "Maker Faire Rome", "Primavera alla Landriana", "Fiera di Santa Lucia", "Mercatino di Trevignano Romano"];
selected.push(...audit.research.followUp20261016.addedNames, ...audit.research.closure20261016.addedNames);
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
    await page.goto(base+'/fiere?provincia=Roma');
    await page.waitForFunction(()=>document.querySelector('#list-count').textContent==='127');
    assert.equal(await page.locator('#province-filter').inputValue(),'Roma');
    const markers=await page.locator('#map-markers > g').evaluateAll(nodes=>nodes.flatMap(n=>n.dataset.events.split(',')).sort());
    assert.deepEqual(markers,events.map(e=>e.id).sort());
    await page.locator('#extra-filters > summary').click();
    for(const name of selected){
      const e=find(name);await page.locator('#fair-search').fill(name);
      await page.locator('.fiere-card[data-event-id="'+e.id+'"] .fiere-card-button').click();
      assert.equal(await page.locator('#detail-title').textContent(),name);
      assert.equal(await page.locator('#detail-location').textContent(),e.city+' · Roma');
      assert.equal(await page.locator('#detail-source').getAttribute('data-fiere-source'),e.source.url);
      assert.equal(await page.locator('#detail-editions .fiere-edition').count(),e.editions.length);
      if(e.pricing)assert.equal(await page.locator('#detail-costs').textContent(),e.pricing.details);
      if(e.participation.deadline)assert((await page.locator('#detail-deadline').textContent()).length>0);
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(process.env.FIERE_SCREENSHOT_DIR&&name==='Mercatini di Natale') await page.screenshot({path:path.join(process.env.FIERE_SCREENSHOT_DIR,label.replace(/\W/g,'-')+'.png'),fullPage:true});
      await page.locator('#close-detail').click();
    }
    assert.deepEqual(errors,[]);console.log(label+': 127 risultati, mappa e 40 dettagli verificati');
  }finally{await browser.close();}
}
(async()=>{
  const pw=require(process.env.PLAYWRIGHT_MODULE);let base=process.env.FIERE_TEST_BASE_URL;
  if(!base){await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;}
  else for(const file of ['data/fiere.json','js/pages/fiere.js','fiere.html']){
    const response=await fetch(base+'/'+file+'?verify=roma-20261016');assert.equal(response.status,200);
    const published=Buffer.from(await response.arrayBuffer());const committed=cp.execFileSync('git',['show','HEAD:'+file],{cwd:root,maxBuffer:20*1024*1024});
    const hash=b=>crypto.createHash('sha256').update(b).digest('hex');assert.equal(hash(published),hash(committed),file+' online identico al commit');
  }
  await browserTest(pw.chromium,'Chromium computer',{width:1440,height:1000},base);
  await browserTest(pw.chromium,'Chromium telefono',{width:390,height:844},base);
  await browserTest(pw.webkit,'WebKit telefono',{width:390,height:844},base);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
