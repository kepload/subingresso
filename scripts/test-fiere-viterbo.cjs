// Viterbo: originali, giornate commerciali, costi e isolamento provinciale.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const data = read('data/fiere.json'), audit = read('data/fiere-viterbo.json'), research = audit.research;
const baseline = JSON.parse(cp.execFileSync('git', ['show', research.baselineCommit + ':data/fiere.json'], { cwd: root, maxBuffer: 25 * 1024 * 1024 }));
const events = data.events.filter(e => e.province === 'Viterbo');
assert.equal(events.length, 76); assert.equal(data.events.length, 7599);
assert.equal(new Set(events.map(e => e.city)).size, 42); assert.equal(data.eventsWithEditionData, 7378);
assert.deepEqual(data.events.filter(e => e.province !== 'Viterbo'), baseline.events.filter(e => e.province !== 'Viterbo'));
for (const e of baseline.events.filter(e => e.province === 'Viterbo')) assert(events.some(n => n.id === e.id), e.id);
assert.deepEqual(research.municipalities.map(m => m.city).sort(), read('data/comuni.json').filter(c => c.provincia === 'Viterbo').map(c => c.nome).sort());
assert.equal(research.municipalities.length, 60); assert.equal(research.closedLeads.length, 60); assert.equal(research.openLeads.length, 0);
assert.deepEqual(research.municipalities.flatMap(m => m.events).sort(), events.map(e => e.id).sort());
for (const m of research.municipalities) { assert(m.sources.length); assert(m.sourceReceipts.length); assert.equal(m.eventCount,m.events.length); }
for (const e of events) {
 assert.equal(e.source.checkedAt,'2026-10-26'); assert(e.participation.note.length > 100);
 for (const u of e.sourceRecordIds) assert(research.sourceReceipts.some(r => r.url === u && r.status === 200),u);
 for (const d of e.editions) { assert(d.start <= d.end); assert(e.sourceRecordIds.includes(d.sourceUrl)); assert(e.months.includes(Number(d.start.slice(5,7)))); assert(e.months.includes(Number(d.end.slice(5,7)))); }
 if (e.pricing) {assert.equal(e.participation.costs,e.pricing.details);assert(e.sourceRecordIds.includes(e.pricing.sourceUrl));}
}
const event = (city,name) => {const e=events.find(e=>e.city===city && e.name.includes(name)); assert(e,city+' '+name);return e;};
assert.equal(event('Canino','Fiera').editions[0].start,'2026-05-16');
assert.equal(event('Vasanello','Fiera').editions[0].start,'2026-10-25');
assert.equal(event('Graffignano','San Filippo').editions[0].start,'2026-05-31');
assert.equal(event('Bagnoregio','Buon Consiglio').editions[0].start,'2026-04-19');
assert.equal(event('Latera','Marrone').editions[0].start,'2026-10-24');
assert.equal(event('Latera','Marrone').editions[1].end,'2026-11-01');
assert.equal(event('Viterbo','Christmas').editions[0].periodOnly,true);
assert.equal(event('Viterbo','Coltivare').editions[0].start,'2026-09-26');
assert.equal(event('Viterbo','Assaggi').editions.length,1);
assert.equal(event('Viterbo','Assaggi').editions[0].end,'2026-05-18');
assert.equal(event('Grotte di Castro','Maggio').editions[0].year,2024);
assert.equal(event('Grotte di Castro','Settembre').editions.length,0);
assert.equal(event('Sutri','Parco').editions.length,0);
assert(events.filter(e=>e.city==='San Lorenzo Nuovo').every(e=>!e.editions.length));
assert(!events.some(e=>e.city==='Nepi'));
assert.match(event('Montalto di Castro','tra le mura').pricing.label,/45/);
assert.equal(event('Fabrica di Roma','Natale').pricing.kind,'free');
assert.equal(events.filter(e=>e.pricing).length,7);
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
    if (process.env.FIERE_VITERBO_DATA_ONLY === '1') { console.log('Viterbo: dati, isolamento e 76 pagine SSR OK'); return; }
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_VITERBO_BASE_URL || 'http://127.0.0.1:' + server.address().port;
    try {
        for (const [engine, width] of [['chromium', 1440], ['chromium', 320], ['webkit', 390]]) {
            const browser = await pw[engine].launch();
            try {
                const context = await browser.newContext({ viewport: { width, height: 900 } });
                await context.route('**/*', route => {
                    const u = new URL(route.request().url());
                    if (!['GET', 'HEAD'].includes(route.request().method())) return route.abort();
                    if (['/js/supabase-config.js', '/js/auth.js', '/js/ui-components.js'].includes(u.pathname)) return route.fulfill({ contentType: 'application/javascript', body: '' });
                    return u.origin === new URL(base).origin ? route.continue() : route.abort();
                });
                const page = await context.newPage(), errors = []; page.on('pageerror', e => errors.push(e.message));
                await page.goto(base + '/fiere?provincia=Viterbo&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
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
                if (process.env.FIERE_VITERBO_QA_DIR) { fs.mkdirSync(process.env.FIERE_VITERBO_QA_DIR, { recursive: true }); await page.screenshot({ path: path.join(process.env.FIERE_VITERBO_QA_DIR, engine + '-' + width + '.png') }); }
                await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => e.pricing || ['Viterbo', 'Bolsena', 'Latera'].includes(e.city)).slice(0, 8)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: events.length, base, status: 'passed' });
                console.log(engine, width, 'Viterbo: elenco, mappa, tutti i dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally { server.close(); if (process.env.FIERE_VITERBO_OUT) fs.writeFileSync(process.env.FIERE_VITERBO_OUT, JSON.stringify(results, null, 2)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
