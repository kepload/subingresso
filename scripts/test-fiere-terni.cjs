// Terni: copertura, date commerciali, costi, isolamento e tre formati browser.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-terni.json'),research=audit.research,events=data.events.filter(e=>e.province==='Terni');
const baseline=JSON.parse(cp.execFileSync('git',['show',research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
assert.equal(events.length,69);assert.equal(data.events.length,7744);assert.equal(data.eventsWithEditionData,7491);
assert.equal(new Set(events.map(e=>e.city)).size,24);
assert.deepEqual(data.events.filter(e=>e.province!=='Terni'),baseline.events.filter(e=>e.province!=='Terni'));
assert.deepEqual(research.municipalities.map(m=>m.city).sort(),read('data/comuni.json').filter(c=>c.provincia==='Terni').map(c=>c.nome).sort());
assert.equal(research.municipalities.length,33);assert.equal(research.closedLeads.length,33);assert.equal(research.openLeads.length,0);
assert.deepEqual(research.municipalities.flatMap(m=>m.events).sort(),events.map(e=>e.id).sort());
for(const m of research.municipalities){assert(m.sources.length);assert(m.sourceReceipts.length);assert.equal(m.eventCount,m.events.length);for(const i of m.sourceReceipts)assert(m.sources.includes(research.sourceReceipts[i].url));}
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-27');assert(e.participation.note.length>100);
 for(const u of e.sourceRecordIds)assert(research.sourceReceipts.some(r=>r.url===u&&r.status===200),u);
 for(const d of e.editions){assert(d.start<=d.end);assert(e.sourceRecordIds.includes(d.sourceUrl));assert(e.months.includes(Number(d.start.slice(5,7))));assert(e.months.includes(Number(d.end.slice(5,7))));}
 if(e.pricing){assert.equal(e.participation.costs,e.pricing.details);assert(e.sourceRecordIds.includes(e.pricing.sourceUrl));}
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.includes(name));assert(e,city+' '+name);return e;};
assert.equal(event('Terni','Cioccolentino').editions[0].start,'2026-02-12');
assert.equal(event('Terni','Wine Love').editions[0].end,'2026-06-06');
assert.equal(event('Terni','Collescipoli').editions[0].start,'2026-05-17');
assert.equal(event('Terni','Cantamaggio').editions[0].end,'2026-05-01');
assert.deepEqual(event('Montecchio','Melezzole').editions.map(d=>[d.start,d.end]),[['2026-10-17','2026-10-18'],['2026-10-24','2026-10-25']]);
assert.deepEqual(event('Stroncone','Pane e Olio').editions.map(d=>d.start),['2026-10-10','2026-10-17','2026-10-24']);
assert.equal(event('Stroncone','Prati').editions.length,0);
assert.equal(event('Orvieto','Natale').editions[0].end,'2027-01-06');assert.equal(event('Orvieto','Natale').editions[0].periodOnly,true);
assert.equal(event('Baschi','Morruzze').editions[0].periodOnly,true);
assert.equal(event('Fabro','Tartufo').editions[0].year,2025);
assert.equal(event('San Gemini','annuale').editions.length,0);
assert.equal(event('San Gemini','Vininsorgenti').editions[0].start,'2026-12-05');
assert.equal(event('Amelia','Artigiani Amerini').editions.length,11);
assert(!event('Amelia','Artigiani Amerini').editions.some(d=>['2026-03-21','2026-03-28'].includes(d.start)));
assert.equal(event('Giove','Cactus').editions[0].start,'2026-06-06');assert(!events.some(e=>e.city==='Attigliano'));
assert(!events.some(e=>e.name.includes('Mille Sassi')||e.name.includes('ARI')||e.city==='Guardea'));
assert.match(event('Montecastrilli','Agricollina').pricing.details,/incongruente/);
assert.match(event('Lugnano in Teverina','Olea').participation.note,/pasticcieri soltanto 6 dicembre/);
assert.equal(events.filter(e=>e.pricing).length,3);
const costs=read('data/fiere-costi.json'),oldCosts=JSON.parse(cp.execFileSync('git',['show',research.baselineCommit+':data/fiere-costi.json'],{cwd:root,maxBuffer:10*1024*1024}));
const outside=JSON.parse(JSON.stringify(costs));for(const e of events)delete outside.events[e.id];assert.deepEqual(outside,oldCosts);
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
    fs.readFile(file, (err, d) => { if (err) { res.writeHead(404); return res.end(); }
        res.setHeader('Content-Type', /\.m?js$/.test(file) ? 'application/javascript' : file.endsWith('.json') ? 'application/json' : file.endsWith('.css') ? 'text/css' : 'text/html'); res.end(d);
    });
});
(async () => {
    if (process.env.FIERE_TERNI_DATA_ONLY === '1') { console.log('Terni: dati, isolamento e 69 pagine SSR OK'); return; }
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_TERNI_BASE_URL || 'http://127.0.0.1:' + server.address().port;
    try {
        for (const [engine, width] of [['chromium', 1440], ['chromium', 320], ['webkit', 390]]) {
            const browser = await pw[engine].launch();
            try {
                const context = await browser.newContext({ viewport: { width, height: 900 } });
                await context.route('**/*', route => {
                    const u = new URL(route.request().url());
                    if (!['GET', 'HEAD'].includes(route.request().method())) return route.abort();
                    if (['/js/supabase-config.js', '/js/auth.js', '/js/ui-components.js', '/js/site-analytics.js'].includes(u.pathname)) return route.fulfill({ contentType: 'application/javascript', body: '' });
                    return u.origin === new URL(base).origin ? route.continue() : route.abort();
                });
                const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
                await page.goto(base + '/fiere?provincia=Terni&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(n => document.querySelector('#list-count').textContent === String(n), events.length);
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                for (const e of events) {
                    await page.locator('.fiere-card[data-event-id="' + e.id + '"] .fiere-card-button').click();
                    await page.waitForFunction(() => document.querySelector('#fair-dialog').open);
                    const dialog = page.locator('#fair-dialog');
                    assert((await dialog.innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')), e.name);
                    assert(await dialog.locator('a[data-fiere-source]').count());
                    if (e.pricing) assert.equal(await page.locator('#detail-costs').innerText(), e.pricing.details);
                    assert(await dialog.evaluate(d => d.scrollWidth <= d.clientWidth + 1), e.id + ' ' + width);
                    await page.locator('#close-detail').click();
                }
                assert.deepEqual(errors, []);
                if (process.env.FIERE_TERNI_QA_DIR) { fs.mkdirSync(process.env.FIERE_TERNI_QA_DIR, { recursive: true }); await page.screenshot({ path: path.join(process.env.FIERE_TERNI_QA_DIR, engine + '-' + width + '.png') }); }
                await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => e.pricing || ['Montecchio', 'Giove', 'Stroncone'].includes(e.city)).slice(0, 8)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: events.length, base, status: 'passed' });
                console.log(engine, width, 'Terni: elenco, mappa, tutti i dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally { server.close(); if (process.env.FIERE_TERNI_OUT) fs.writeFileSync(process.env.FIERE_TERNI_OUT, JSON.stringify(results, null, 2)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
