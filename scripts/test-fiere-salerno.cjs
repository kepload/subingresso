// Salerno: date conflicts, operator conditions, scanned notices and provincial isolation.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-salerno.json');
const baseline=JSON.parse(cp.execFileSync('git',['show','5666ee1:data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province==='Salerno');
assert.deepEqual(data.events.filter(e=>e.province!=='Salerno'),baseline.events.filter(e=>e.province!=='Salerno'));
assert.equal(events.length,85);assert.equal(new Set(events.map(e=>e.city)).size,49);
assert.equal(audit.research.municipalities.length,158);
assert.equal(new Set(audit.research.municipalities.map(e=>e.city)).size,158);
assert(audit.research.municipalities.every(e=>e.homeAttempt.url&&e.searchEvidence.query&&e.searchEvidence.file));
assert.equal(audit.research.openLeads.length,0);
assert(audit.research.exclusions.length>=30&&audit.research.limitations.length>=20);
for(const e of baseline.events.filter(e=>e.province==='Salerno'))assert(events.some(x=>x.id===e.id));
for(const e of events){
    assert.equal(e.source.checkedAt,'2026-10-21');assert(e.participation.note.length>90);
    for(const url of e.sourceRecordIds)assert(audit.research.sourceReceipts.some(r=>r.url===url),url);
    for(const d of e.editions)assert(e.sourceRecordIds.includes(d.sourceUrl),d.sourceUrl);
    if(e.source.label.startsWith('Fonte secondaria'))assert(e.editions.every(d=>d.dateType==='calendar'));
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name===name)||events.find(e=>e.city===city&&e.name.includes(name));assert(e,city+' '+name);return e;};
assert.equal(event('Salerno','Crocifisso Ritrovato').id,'campania-salerno-fiera-del-crocifisso-ritrovato');
assert.equal(event('Salerno','Crocifisso Ritrovato').editions[0].start,'2026-04-30');
assert.deepEqual(event('Salerno','Fiera del Crocifisso').editions.map(d=>d.start),['2026-03-06','2026-03-13','2026-03-20','2026-03-27']);
assert.equal(event('Salerno','Fiera del Crocifisso').participation.deadline,'2026-02-15');
assert.equal(event('Salerno','Salerno Boat Show').editions[0].start,'2026-11-06');
assert.equal(event('Oliveto Citra','San Macario').editions[0].start,'2026-05-30');
assert.equal(event('Campagna','San Michele').editions[0].start,'2026-09-25');
assert.equal(event('Campagna','San Nicola').editions[0].start,'2026-09-14');
assert.equal(event('Castellabate','San Marco').editions[0].end,'2026-04-24');
const natale=event('Castellabate','Natale');
assert.equal(natale.participation.deadline,'2026-10-26');
assert.deepEqual(natale.editions.map(d=>[d.start,d.end]),[['2026-12-05','2026-12-08'],['2026-12-12','2026-12-13'],['2026-12-19','2026-12-20']]);
assert.match(natale.pricing.details,/200.*400.*600/);
assert.match(natale.sectors,/bevande vietata/);
const freca=event('Cannalonga','Frecagnola');assert.match(freca.participation.note,/solo il 12 settembre/);assert.match(freca.pricing.details,/50.*100/);
const cava=event("Cava de' Tirreni",'pasquali');assert(cava.editions.every(d=>!d.start));assert.equal(cava.participation.deadline,'2026-03-09');assert.match(cava.pricing.details,/10 €.*CUP e TARIG/);
assert.equal(event('Pagani','Galline').editions[0].end,'2026-04-13');
assert.equal(event('Pagani','Galline').participation.deadline,undefined);
assert.match(event('Pagani','Alfonso').participation.note,/6 luglio.*15 luglio/);
assert.equal(event('Eboli','ExpoSele').participation.deadline,undefined);
assert.equal(event('Eboli','ExpoSele').pricing,undefined);
assert.match(event('Eboli','ExpoSele').participation.note,/rimborso|rendicontazione/);
assert.match(event('Capaccio Paestum','Borsa').pricing.details,/3\.660.*4\.270/);
assert.equal(event('Vallo della Lucania','Pantaleone').participation.deadline,'2026-05-11');
assert(events.filter(e=>['Futani','Roccagloriosa'].includes(e.city)).every(e=>e.editions.length===0));
assert(events.filter(e=>e.city==='Laureana Cilento').every(e=>e.editions.every(d=>d.year===2025)));
assert(event('Laurito','Maddalena').editions.find(d=>d.year===2026).label);
assert.equal(event('Mercato San Severino','Vincenzo').editions[0].start,undefined);
assert.match(event('Mercato San Severino','Vincenzo').editions[0].label,/ultima giornata commerciale non chiarita/);
assert.deepEqual(event('Sicignano degli Alburni','Castagna').editions.map(d=>[d.start,d.end]),[['2026-10-17','2026-10-18'],['2026-10-24','2026-10-25']]);
assert.equal(event('Capaccio Paestum','Wine Fest').editions[1].start,'2027-02-28');
assert.equal(event('Capaccio Paestum','OPEN').editions[1].start,'2027-04-02');
assert.equal(events.filter(e=>e.pricing).length,8);
const fees=read('data/fiere-costi.json').events;
const beforeFees=JSON.parse(cp.execFileSync('git',['show','5666ee1:data/fiere-costi.json'],{cwd:root,maxBuffer:8*1024*1024})).events;
for(const [id,value] of Object.entries(beforeFees))assert.deepEqual(fees[id],value,id);

const handler = require('../api/fiera');
for (const e of events) {
    const r = { setHeader() {}, status(n) { this.code = n; return this; }, send(s) { this.body = s; } };
    handler({ query: { slug: e.id } }, r); assert.equal(r.code, 200); assert(!r.body.includes('undefined'));
}
const server = http.createServer((req, res) => {
    const u = new URL(req.url, 'http://localhost');
    if (u.pathname.startsWith('/fiere/')) return handler({ query: { slug: decodeURIComponent(u.pathname.slice(7)) } }, {
        setHeader: (k, v) => res.setHeader(k, v), status(n) { res.statusCode = n; return this; }, send: s => res.end(s)
    });
    const file = path.join(root, u.pathname === '/fiere' ? 'fiere.html' : u.pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end(); }
    fs.readFile(file, (err, d) => {
        if (err) { res.writeHead(404); return res.end(); }
        res.setHeader('Content-Type', /\.m?js$/.test(file) ? 'application/javascript' : file.endsWith('.json') ? 'application/json' : file.endsWith('.css') ? 'text/css' : 'text/html'); res.end(d);
    });
});
(async () => {
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_SALERNO_BASE_URL || 'http://127.0.0.1:' + server.address().port;
    try {
        for (const [engine, width] of [['chromium', 1440], ['chromium', 320], ['webkit', 390]]) {
            const browser = await pw[engine].launch();
            try {
                const context = await browser.newContext({ viewport: { width, height: 900 } });
                await context.route('**/*', route => {
                    const u = new URL(route.request().url());
                    if (['/js/supabase-config.js', '/js/auth.js', '/js/ui-components.js'].includes(u.pathname)) return route.fulfill({ contentType: 'application/javascript', body: '' });
                    return u.origin === new URL(base).origin ? route.continue() : route.abort();
                });
                const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
                await page.goto(base + '/fiere?provincia=Salerno&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '85');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                const dialogs = events.filter(e => e.pricing || ['Ascea', 'Laurito', 'Eboli'].includes(e.city));
                for (const e of dialogs) {
                    await page.locator('.fiere-card[data-event-id="' + e.id + '"] .fiere-card-button').click();
                    await page.waitForFunction(() => document.querySelector('#fair-dialog').open);
                    const dialog = page.locator('#fair-dialog');
                    assert((await dialog.innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')), e.name);
                    assert(await dialog.locator('a[data-fiere-source]').count());
                    if (e.pricing) assert.equal(await page.locator('#detail-costs').innerText(), e.pricing.details);
                    assert(await dialog.evaluate(d => d.scrollWidth <= d.clientWidth + 1), e.id + ' ' + width);
                    await page.locator('#close-detail').click();
                }
                assert.deepEqual(errors, []); if(process.env.FIERE_SALERNO_QA_DIR) { fs.mkdirSync(process.env.FIERE_SALERNO_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_SALERNO_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => ['Salerno', 'Castellabate', 'Cava de\' Tirreni'].includes(e.city)).slice(0, 4)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Salerno: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_SALERNO_OUT) fs.writeFileSync(process.env.FIERE_SALERNO_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
