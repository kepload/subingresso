// Alessandria: documentary regressions, preserved national data and real calendar UI.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-alessandria.json');
const events=data.events.filter(e=>e.province==='Alessandria');
const baseline=JSON.parse(cp.execFileSync('git',['show','e56b986:data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
assert.deepEqual(data.events.filter(e=>e.province!=='Alessandria'),baseline.events.filter(e=>e.province!=='Alessandria'));
assert.equal(events.length,158);assert.equal(new Set(events.map(e=>e.city)).size,75);
assert.equal(data.events.length,5220);
assert.deepEqual(audit.research.municipalities.map(c=>c.city).sort(),read('data/comuni.json').filter(c=>c.provincia==='Alessandria').map(c=>c.nome).sort());
assert.equal(audit.research.openLeads.length,0);assert.equal(audit.research.regionalRowAudit.length,104);
assert(audit.research.sourceReceipts.length>=546);assert.equal(audit.research.searchReceipts.length,47);
assert(audit.research.municipalities.every(c=>c.searchReceipts.length));
assert.equal(audit.research.statistics.only2025Events,6);
const get=(name,city)=>{const a=events.filter(e=>e.name===name&&(!city||e.city===city));assert.equal(a.length,1,name);return a[0]};
const dates=(name,city)=>get(name,city).editions.filter(e=>e.start).map(e=>[e.start,e.end]);
assert.deepEqual(dates('Fiera di Marzo'),[['2026-03-15','2026-03-15'],['2026-03-22','2026-03-22']]);
assert.deepEqual(dates('Fiera di Aprile'),[['2026-04-14','2026-04-14']]);
assert.deepEqual(dates('Fiera di Agosto','Novi Ligure'),[['2026-08-03','2026-08-05']]);
assert.deepEqual(dates('Fiera di Santa Caterina','Novi Ligure'),[['2026-11-22','2026-11-25']]);
assert.deepEqual(dates('Serravalle con Gusto'),[['2026-06-07','2026-06-07']]);
assert.deepEqual(dates('Acqui & Sapori - Mostra Regionale del Tartufo'),[['2026-11-22','2026-11-22']]);
assert.deepEqual(dates('Innovart'),[['2026-07-24','2026-07-26']]);
assert.deepEqual(dates('Mercatino di Maggio 2026'),[['2026-05-17','2026-05-17']]);
assert.deepEqual(dates('Fiera Nazionale del Tartufo Nero - Trifola nOir'),[['2026-06-07','2026-06-07'],['2026-06-14','2026-06-14']]);
assert.equal(get('Fiera di San Guido').participation.deadline,'2026-05-13');
assert.equal(get('Fiera del Tartufo -  Tarsobi - Tartufo e Vino').participation.deadline,'2026-10-10');
assert.match(get('Fiera del Tartufo -  Tarsobi - Tartufo e Vino').pricing.details,/20 €.*30 €/);
assert.match(get('Monferrato Green Farm').pricing.details,/Vivai: iscrizione 100 € \+ 6/);
assert.match(get('Mostra nazionale di San Giuseppe').pricing.details,/IVA 22%/);
assert.match(get("Mostra Mercato dell'Antiquariato e dell'Usato").pricing.details,/61 €.*244 €/);
assert.equal(get('Mercatini di Natale','Castelletto Monferrato').participation.deadline,undefined);
assert.match(get('Mercatini di Natale','Castelletto Monferrato').participation.note,/sabato 30 novembre/);
assert(!get("Sagra dell'aglio").editions.some(e=>e.start));
assert(get("Sagra dell'aglio").editions[0].label.includes('discordanti'));
assert(get('Festa patronale - bancarelle','Alzano Scrivia').editions[0].periodOnly);
assert.deepEqual(dates('Mercatino di Natale','Solero'),[['2025-12-13','2025-12-14']]);
assert.equal(events.filter(e=>e.pricing).length,7);
for(const e of baseline.events.filter(e=>e.province==='Alessandria'))assert(events.some(x=>x.id===e.id),e.id);
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-20');assert(e.sourceRecordIds.includes(e.source.url));
 for(const u of e.sourceRecordIds.filter(u=>u.startsWith('https://')))assert(audit.research.sourceReceipts.some(r=>r.url===u),u);
 assert(e.participation.note.length>80,e.name);if(e.pricing)assert.equal(e.participation.costs,e.pricing.details);
 if(['Alluvioni Piovera','Cassano Spinola'].includes(e.city))assert(e.coordinateSource.url.startsWith('https://'));
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
    const base=process.env.FIERE_AL_BASE_URL||'http://127.0.0.1:'+server.address().port;
    try{for(const [engine,width] of [['chromium',1440],['chromium',320],['webkit',390]]){
        const b=await pw[engine].launch();
        try{
            const c=await b.newContext({viewport:{width,height:900}});
            await c.route('**/*',route=>{const u=new URL(route.request().url());if(['/js/supabase-config.js','/js/auth.js','/js/ui-components.js'].includes(u.pathname))return route.fulfill({contentType:'application/javascript',body:''});return u.origin===new URL(base).origin?route.continue():route.abort()});
            const p=await c.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));
            await p.goto(base+'/fiere?provincia=Alessandria&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
            await p.waitForFunction(()=>document.querySelector('#list-count').textContent==='158');
            while(await p.locator('#load-more').isVisible())await p.locator('#load-more').click();
            assert.deepEqual(await p.locator('.fiere-card').evaluateAll(es=>es.map(e=>e.dataset.eventId).sort()),events.map(e=>e.id).sort());
            await p.waitForFunction(()=>document.querySelector('#map-markers').children.length>0);
            assert.deepEqual(await p.locator('#map-markers > g').evaluateAll(es=>es.flatMap(e=>e.dataset.events.split(',')).sort()),events.map(e=>e.id).sort());
            assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
            const dialogs=[...events.filter(e=>e.pricing),get('Fiera di Santa Caterina','Novi Ligure'),get('Mercatino di Natale','Solero'),get('Mercatini di Natale','Castelletto Monferrato'),get('Sagra dell\'aglio'),get('Fiorissima'),get('Serravalle con Gusto'),get('Vinile Alessandria')];
            for(const e of dialogs){
                await p.locator('.fiere-card[data-event-id="'+e.id+'"] .fiere-card-button').click();
                await p.waitForFunction(()=>document.querySelector('#fair-dialog').open);
                const dialog=p.locator('#fair-dialog');assert((await dialog.innerText()).replace(/\s+/g,' ').includes(e.name.replace(/\s+/g,' ')),e.name);assert(await dialog.locator('a[data-fiere-source]').count());
                if(e.pricing){assert.equal(await p.locator('#detail-costs').innerText(),e.pricing.details);assert.equal(await p.locator('#detail-costs-source').getAttribute('data-fiere-source'),e.pricing.sourceUrl)}
                assert(await dialog.evaluate(d=>d.scrollWidth<=d.clientWidth+1),e.id+' '+width+' '+JSON.stringify(await dialog.evaluate(d=>({scroll:d.scrollWidth,client:d.clientWidth,wide:[...d.querySelectorAll('*')].filter(x=>x.scrollWidth>x.clientWidth+2).map(x=>({tag:x.tagName,id:x.id,w:x.clientWidth,s:x.scrollWidth,text:x.textContent.slice(0,80)}))}))));await p.locator('#close-detail').click();
            }
            assert.deepEqual(errors,[]);await c.close();
            const nojs=await b.newContext({javaScriptEnabled:false,viewport:{width,height:900}}),q=await nojs.newPage();
            for(const n of ['Fiera di San Guido','Fiera di Aprile','Fiera Tufo & Tartufo','Vinile Alessandria']){const e=get(n),r=await q.goto(base+'/fiere/'+e.id);assert.equal(r.status(),200);assert((await q.locator('h1').innerText()).replace(/\s+/g,' ').includes(e.name.replace(/\s+/g,' ')),e.name);assert(await q.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1))}
            await nojs.close();results.push({engine,width,events:events.length,dialogs:dialogs.length,status:'passed',base});console.log(engine,width,'Alessandria: catalogo, mappa, dettagli e pagine senza JS OK');
        }finally{await b.close()}
    }}finally{server.close();if(process.env.FIERE_AL_OUT)fs.writeFileSync(process.env.FIERE_AL_OUT,JSON.stringify(results,null,2))}
})().catch(e=>{console.error(e);process.exitCode=1});
