// Documentary exceptions, preservation of other provinces, real calendar UI.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const data = read('data/fiere.json'), audit = read('data/fiere-genova.json');
const events = data.events.filter(e => e.province === 'Genova');
const baseline = JSON.parse(cp.execFileSync('git', ['show', '1ff71ed:data/fiere.json'], {cwd: root, maxBuffer: 25*1024*1024}));
assert.deepEqual(data.events.filter(e => e.province !== 'Genova'), baseline.events.filter(e => e.province !== 'Genova'));
assert.equal(events.length, 274);
assert.equal(new Set(events.map(e=>e.city)).size,47);
assert.deepEqual(audit.research.municipalities.map(c=>c.city).sort(),read('data/comuni.json').filter(c=>c.provincia==='Genova').map(c=>c.nome).sort());
assert.equal(audit.research.openLeads.length,0);
assert.equal(audit.research.regionalRowAudit.length,384);
assert.equal(audit.research.periodicRegisterAudit.length,58);
assert(audit.research.sourceReceipts.length>=655);
const get=(name,city)=>{const found=events.filter(e=>e.name===name&&(!city||e.city===city));assert.equal(found.length,1,name);return found[0]};
const dates=(name,city)=>get(name,city).editions.map(e=>[e.start,e.end]);
assert.deepEqual(dates('LIBRO PRIMAVERA'),[['2026-04-09','2026-05-03']]);
assert.deepEqual(dates('MERCATINO OPI'),[['2026-12-08','2026-12-24']]);
assert.equal(get('MERCATINO OPI').participation.deadline,'2026-10-08');
for(const n of ['NATALE','LIBRO INVERNALE'])assert.equal(get(n).participation.deadline,'2026-10-02');
assert.deepEqual(dates('Festa Carnevale'),[['2026-02-21','2026-02-22']]);
assert.deepEqual(dates('S. MARIA MADDALENA'),[['2026-08-30','2026-08-30']]);
assert.deepEqual(dates('Festa della caccia'),[['2026-07-03','2026-07-05']]);
assert.deepEqual(dates('FIERA DI N.S. DEL SUFFRAGIO'),[['2026-09-07','2026-09-08']]);
assert.match(get('FIERA S.G. BATTISTA').participation.note,/Non è prevista domanda preventiva/);
assert.equal(get('Mercatino di Natale','Campomorone').participation.deadline,'2026-10-30');
assert.match(get('Mercatino di Natale','Campomorone').pricing.details,/20 €.*singoli/);
assert.equal(get('Fiera San Simone').participation.deadline,'2026-10-09');
assert.deepEqual(dates('Festa del Cioccolato - Chocomoments'),[['2026-02-19','2026-02-22']]);
assert.deepEqual(dates('Chocomoments'),[['2026-10-23','2026-10-25']]);
assert.match(get('Chocomoments').source.url,/chocomoments.it/);
assert.equal(get('Mercatini di Natale della Creatività').editions[0].year,2025);
assert.equal(get('Fiera del Carmine').editions[0].year,2025);
assert.deepEqual(dates('Mercatino','Ne'),[['2026-12-05','2026-12-05'],['2026-12-12','2026-12-12'],['2026-12-19','2026-12-19']]);
assert(get('Antiquariato in Galleria Mazzini').editions.every(e=>!e.start&&e.label));
assert(get('MERCATINO DELLA SAGRA DELLE FOCACCETTE').editions[0].periodOnly);
const retired=new Set(audit.research.retiredDuplicateIds.map(x=>x.id));
for(const e of baseline.events.filter(e=>e.province==='Genova'))assert(events.some(x=>x.id===e.id)||retired.has(e.id),e.id);
assert.equal(retired.size,1);
for(const e of events){
    assert.equal(e.source.checkedAt,'2026-10-19');assert(e.sourceRecordIds.includes(e.source.url));
    for(const u of e.sourceRecordIds.filter(u=>u.startsWith('https://')))assert(audit.research.sourceReceipts.some(r=>r.url===u),u);
    assert(e.participation.note.length>80);
    if(e.pricing)assert.equal(e.participation.costs,e.pricing.details);
}
const handler = require('../api/fiera');
for(const e of events){const r={setHeader(){},status(n){this.code=n;return this},send(s){this.body=s}};handler({query:{slug:e.id}},r);assert.equal(r.code,200);assert(!r.body.includes('undefined'))}
const server=http.createServer((req,res)=>{
    const u=new URL(req.url,'http://localhost');
    if(u.pathname.startsWith('/fiere/'))return handler({query:{slug:decodeURIComponent(u.pathname.slice(7))}},{setHeader:(k,v)=>res.setHeader(k,v),status(n){res.statusCode=n;return this},send:s=>res.end(s)});
    const file=path.join(root,u.pathname==='/fiere'?'fiere.html':u.pathname);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()}
    fs.readFile(file,(err,d)=>{if(err){res.writeHead(404);return res.end()}res.setHeader('Content-Type',/\.m?js$/.test(file)?'application/javascript':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':'text/html');res.end(d)});
});
(async()=>{
    assert(process.env.PLAYWRIGHT_MODULE,'PLAYWRIGHT_MODULE richiesto');
    const pw=require(process.env.PLAYWRIGHT_MODULE),results=[];
    await new Promise(r=>server.listen(0,'127.0.0.1',r));
    const base=process.env.FIERE_GE_BASE_URL||'http://127.0.0.1:'+server.address().port;
    try{for(const [engine,width] of [['chromium',1440],['chromium',320],['webkit',390]]){
        const b=await pw[engine].launch();
        try{
            const c=await b.newContext({viewport:{width,height:900}});
            await c.route('**/*',route=>{const u=new URL(route.request().url());if(['/js/supabase-config.js','/js/auth.js','/js/ui-components.js'].includes(u.pathname))return route.fulfill({contentType:'application/javascript',body:''});return u.origin===new URL(base).origin?route.continue():route.abort()});
            const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
            await p.goto(base+'/fiere?provincia=Genova&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
            await p.waitForFunction(()=>document.querySelector('#list-count').textContent==='274');
            while(await p.locator('#load-more').isVisible())await p.locator('#load-more').click();
            assert.deepEqual(await p.locator('.fiere-card').evaluateAll(es=>es.map(e=>e.dataset.eventId).sort()),events.map(e=>e.id).sort());
            await p.waitForFunction(()=>document.querySelector('#map-markers').children.length>0);
            assert.deepEqual(await p.locator('#map-markers > g').evaluateAll(es=>es.flatMap(e=>e.dataset.events.split(',')).sort()),events.map(e=>e.id).sort());
            assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
            const dialogs=[...events.filter(e=>e.pricing),...['LIBRO PRIMAVERA','MERCATINO OPI','Fiera San Simone','Chocomoments','Festa Carnevale','FIERA DI N.S. DEL SUFFRAGIO','Mele Comics','Mercatini di Natale della Creatività'].map(n=>get(n))];
            for(const e of dialogs){
                await p.locator('.fiere-card[data-event-id="'+e.id+'"] .fiere-card-button').click();
                await p.waitForFunction(()=>document.querySelector('#fair-dialog').open);
                const dialog=p.locator('#fair-dialog');assert((await dialog.innerText()).includes(e.name));assert(await dialog.locator('a[data-fiere-source]').count());
                if(e.pricing){assert.equal(await p.locator('#detail-costs').innerText(),e.pricing.details);assert.equal(await p.locator('#detail-costs-source').getAttribute('data-fiere-source'),e.pricing.sourceUrl)}
                assert(await dialog.evaluate(d=>d.scrollWidth<=d.clientWidth+1),e.id+' '+width+' '+JSON.stringify(await dialog.evaluate(d=>({scroll:d.scrollWidth,client:d.clientWidth,wide:[...d.querySelectorAll('*')].filter(x=>x.scrollWidth>x.clientWidth+2).map(x=>({tag:x.tagName,id:x.id,w:x.clientWidth,s:x.scrollWidth,text:x.textContent.slice(0,80)}))}))));await p.locator('#close-detail').click();
            }
            assert.deepEqual(errors,[]);await c.close();
            const nojs=await b.newContext({javaScriptEnabled:false,viewport:{width,height:900}}),q=await nojs.newPage();
            for(const n of ['LIBRO PRIMAVERA','MERCATINO OPI','Fiera San Simone','Mercatini di Natale della Creatività']){const e=get(n),r=await q.goto(base+'/fiere/'+e.id);assert.equal(r.status(),200);assert((await q.locator('h1').innerText()).includes(e.name));assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))}
            await nojs.close();results.push({engine,width,events:events.length,dialogs:dialogs.length,status:'passed',base});console.log(engine,width,'Genova: catalogo, mappa, dettagli e pagine senza JS OK');
        }finally{await b.close()}
    }}finally{server.close();if(process.env.FIERE_GE_OUT)fs.writeFileSync(process.env.FIERE_GE_OUT,JSON.stringify(results,null,2))}
})().catch(e=>{console.error(e);process.exitCode=1});
