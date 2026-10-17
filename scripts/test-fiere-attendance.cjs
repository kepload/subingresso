// Attendance evidence, comparable units, boundaries, expiry and public rendering.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
require('../js/pages/fiere.js');
const api = globalThis.FiereCalendar;
const handler = require('../api/fiera');
const catalog = require('../data/fiere.json');
const research = require('../data/fiere-affluenza.json');
const today = research.checkedAt;
const sample = structuredClone(Object.values(research.events)[0]);
const info = (patch = {}, extra = {}) => api.attendanceInfo({ attendance: { ...sample, ...patch }, ...extra }, today);
for (const [value, level] of [[1,'low'],[999,'low'],[1000,'medium'],[4999,'medium'],[5000,'high'],[19999,'high'],[20000,'veryHigh']]) {
    assert.equal(info({ value, openDays: 1, relation: 'exact' }).level, level);
}
assert.equal(info({value: 9000, openDays: 3, relation: 'exact'}).level, 'medium');
assert.match(info().label, /almeno/);
for (const unit of ['visitors', 'uniqueVisitors', 'passages']) assert.equal(info({unit}).level, null);
for (const scope of ['whole-event', 'partial']) assert.equal(info({scope}).level, null);
assert.equal(info({openDays:0}).level, null);
assert.equal(info({relation:'under'}).level, null);
assert.equal(info({}, {editions:[{end:'2026-09-01'}]}).level, null);
for (const patch of [{value:0},{value:-3},{value:'5000'},{value:Infinity},{openDays:1.5},{openDays:4},
    {unit:'toString'},{status:'verified'},{status:'counted',countingMethod:'not-published'},
    {source:{url:'javascript:alert(1)',label:'test'}},{end:'2026-11-01'},
    {checkedAt:'2026-11-01'},{reviewAfter:'2026-10-01'},{start:'2026-02-30'}]) assert.equal(info(patch),null);
assert.equal(api.attendanceInfo({attendance:sample},'2028-10-17'),null);
assert.equal(api.attendanceInfo({name:'Fiera famosa',stallCount:800}),null);
const counts = {};
for (const [id, record] of Object.entries(research.events)) {
    const event = catalog.events.find(e => e.id === id); assert(event,id); assert.deepEqual(event.attendance,record);
    const assessment = api.attendanceInfo(event,today); assert(assessment,id);
    counts[assessment.level || 'data-only'] = (counts[assessment.level || 'data-only'] || 0) + 1;
    let html;handler({query:{slug:id}}, {setHeader(){},status(n){assert.equal(n,200);return this;},send(value){html=value;}});
    assert(html.includes('Dato, fonte e criterio')); assert(html.includes(record.source.url.replace(/&/g,'&amp;')));
    assert.equal(html.includes('data-attendance='), Boolean(assessment.level));
}
const original = JSON.parse(execFileSync('git',['show','HEAD:data/fiere.json'],{cwd:root,encoding:'utf8',maxBuffer:40*1024*1024}));
const strip = data => ({...data,events:data.events.map(({attendance,...e})=>e)});
assert.deepEqual(strip(catalog),strip(original),'Every pre-existing catalogue field is preserved');
assert.equal(catalog.events.filter(e => e.attendance).length,Object.keys(research.events).length);
// Python build must reject unsupported evidence before publishing.
execFileSync('python',['-c', `
import importlib.util,json,copy
from pathlib import Path
s=importlib.util.spec_from_file_location('build','scripts/build-fiere.py');b=importlib.util.module_from_spec(s);s.loader.exec_module(b)
records=json.loads(Path('data/fiere-affluenza.json').read_text(encoding='utf-8'))['events']
for r in records.values():b.validate_attendance(r)
sample=next(iter(records.values()))
for patch in [{'value':True},{'value':-1},{'openDays':999},{'unit':'banchetti'},{'status':'counted'},{'end':'2027-01-01'}]:
 r=copy.deepcopy(sample);r.update(patch)
 try:b.validate_attendance(r)
 except (AssertionError,ValueError):pass
 else:raise AssertionError(patch)
`],{cwd:root,stdio:'pipe'});
const server=http.createServer((req,res)=>{
 const u=new URL(req.url,'http://localhost');
 let file=u.pathname==='/fiere'?'fiere.html':decodeURIComponent(u.pathname).slice(1);
 const full=path.resolve(root,file);if(!full.startsWith(root+path.sep))return res.writeHead(403).end();
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[path.extname(file)]||'text/plain');
 fs.readFile(full,(err,data)=>err?res.writeHead(404).end():res.end(data));
});
(async()=>{
 const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
 let base=process.env.FIERE_TEST_BASE_URL;
 if(!base){await new Promise(r=>server.listen(0,'127.0.0.1',r));base='http://127.0.0.1:'+server.address().port;}
 try{for(const [engine,width] of [['chromium',1440],['chromium',320],['webkit',390]]){
  const browser=await pw[engine].launch({headless:true});try{
   const context=await browser.newContext({viewport:{width,height:1000}}),origin=new URL(base).origin;
   await context.route('**/*',r=>{const u=new URL(r.request().url());return u.origin!==origin||/\/js\/(auth|supabase-config|page-view-tracker)\.js$/.test(u.pathname)?r.fulfill({status:200,body:''}):r.continue();});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   for(const event of [catalog.events.find(e=>api.attendanceInfo(e)?.level==='veryHigh'),catalog.events.find(e=>api.attendanceInfo(e)?.level==='high'),catalog.events.find(e=>e.attendance?.unit==='visitors'),catalog.events.find(e=>!e.attendance)]){
    await page.goto(base+'/fiere?provincia='+encodeURIComponent(event.province)+'&q='+encodeURIComponent(event.name));
    const card=page.locator('[data-event-id="'+event.id+'"]');await card.waitFor();
    const a=api.attendanceInfo(event),hasBadge=Boolean(a?.level);
    assert.equal(await card.locator('.fiere-attendance').count(),Number(hasBadge));
    const button=card.locator(hasBadge?'.fiere-attendance':'.fiere-card-button');await button.focus();await page.keyboard.press('Enter');
    await page.waitForSelector('#fair-dialog[open]');assert.equal(await page.locator('#detail-attendance').isVisible(),Boolean(a));
    if(a){assert((await page.locator('#detail-attendance').textContent()).includes(a.total));await page.locator('#detail-attendance summary').click();assert.equal(await page.locator('#detail-attendance a').first().getAttribute('href'),a.record.source.url);}
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.keyboard.press('Escape');
    if(hasBadge){
     await page.locator('[data-month="'+event.months[0]+'"]').click();
     await page.locator('.fiere-marker').first().click();await page.waitForSelector('#map-popup:not([hidden])');
     assert.equal(await page.locator('#map-popup .fiere-attendance').count(),1);
     const colors=await page.locator('#map-popup .fiere-attendance').evaluate(e=>({fg:getComputedStyle(e).color,bg:getComputedStyle(e).backgroundColor}));assert.equal(colors.fg,'rgb(255, 255, 255)');
    }
   }
   assert.deepEqual(errors,[]);console.log(engine+' '+width+': badges, source, unclassified facts, missing data, popup and overflow passed');
  }finally{await browser.close();}
 }}finally{if(server.listening)await new Promise(r=>server.close(r));}
 console.log('Attendance records and levels:',JSON.stringify(counts));
})().catch(e=>{console.error(e);process.exitCode=1;if(server.listening)server.close();});
