// Teramo: originali, ricorrenze, tariffe condizionate e isolamento provinciale.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const data = read('data/fiere.json'), audit = read('data/fiere-teramo.json'), research = audit.research;
const baseline = JSON.parse(cp.execFileSync('git', ['show', research.baselineCommit + ':data/fiere.json'], { cwd: root, maxBuffer: 25 * 1024 * 1024 }));
const events = data.events.filter(e => e.province === 'Teramo');
assert.equal(events.length, 80); assert.equal(data.events.length, 7373);
assert.equal(new Set(events.map(e => e.city)).size, 32); assert.equal(data.eventsWithEditionData, 7179);
assert.deepEqual(data.events.filter(e => e.province !== 'Teramo'), baseline.events.filter(e => e.province !== 'Teramo'));
for (const e of baseline.events.filter(e => e.province === 'Teramo')) assert(events.some(n => n.id === e.id), e.id);
assert.equal(research.municipalities.length, 47);
assert.deepEqual(research.municipalities.map(m => m.city).sort(), read('data/comuni.json').filter(c => c.provincia === 'Teramo').map(c => c.nome).sort());
assert.deepEqual(research.municipalities.flatMap(m => m.events).sort(), events.map(e => e.id).sort());
assert.equal(research.regionalRowAudit[0].rowsTeramo, 0); assert.equal(research.unpliAudit.length, 125);
assert.equal(research.openLeads.length, 0); assert(research.closedLeads.length >= 28); assert(research.exclusions.length >= 25);
assert.equal(research.sourceReceipts.length, research.statistics.sourceReceipts);
for (const m of research.municipalities) { assert(m.sources.length, m.city); assert(m.sourceReceipts.length, m.city); assert.equal(m.eventCount, m.events.length); }
for (const e of events) {
 assert.equal(e.source.checkedAt, '2026-10-26'); assert(e.participation.note.length > 100);
 for (const url of e.sourceRecordIds) assert(research.sourceReceipts.some(r => r.url === url && (r.status === 200 || r.alternativeRead)), url);
 for (const d of e.editions) {
  assert(e.sourceRecordIds.includes(d.sourceUrl.split('#')[0]), e.id);
  if (!d.start) { assert(d.label); assert.equal(d.dateType, 'calendar'); continue; }
  assert(d.start <= d.end); assert(e.months.includes(Number(d.start.slice(5, 7)))); assert(e.months.includes(Number(d.end.slice(5, 7))));
 }
 if (e.pricing) { assert.equal(e.participation.costs, e.pricing.details); assert(e.sourceRecordIds.includes(e.pricing.sourceUrl)); }
}
const event = (city, name) => { const e = events.find(e => e.city === city && e.name.includes(name)); assert(e, city + ' ' + name); return e; };
const martino = event('Nereto', 'San Martino');
assert.equal(martino.editions[0].start, '2026-11-14'); assert.equal(martino.editions[0].end, '2026-11-15'); assert.equal(martino.participation.deadline, '2026-11-02');
assert.equal(martino.pricing.kind, 'partial'); assert.match(martino.pricing.details, /10 €/); assert.match(martino.participation.note, /POS/);
const natale = event("Sant'Egidio alla Vibrata", 'Natale'); assert.equal(natale.editions[0].start, '2026-12-06'); assert.equal(natale.participation.deadline, '2026-11-06'); assert.match(natale.pricing.details, /42.*16/s);
assert.equal(event("Sant'Omero", 'Immacolata').participation.deadline, '2026-11-07');
const ceramica = event('Castelli', 'Mostra mercato'); assert.equal(ceramica.pricing.kind, 'conditional'); assert.match(ceramica.pricing.details, /sede legale a Castelli/); assert.match(ceramica.participation.note, /Albo artigiani/);
assert.equal(events.filter(e => e.pricing).length, 3);
const assunta = event('Castel Castagna', 'Assunta'); assert(!assunta.editions.some(d => d.start)); assert.match(assunta.editions[0].label, /14–15.*15–16/);
assert(!event('Pineto', 'Pineto in Fiera').editions.some(d => d.start));
assert.equal(event('Torricella Sicura', '15 maggio').editions[0].start, '2026-05-15');
assert.equal(event('Crognaleto', 'Pastorizia').editions[0].start, '2026-07-03'); assert.equal(event('Crognaleto', 'Pastorizia').editions[0].periodOnly, true);
assert(!events.some(e => e.city === 'Cortino'));
assert.equal(event('Teramo', 'San Giuseppe').editions[0].start, '2026-03-15');
assert.equal(event('Teramo', 'Agricoltura').editions[0].end, '2026-04-26');
assert(!event("Isola del Gran Sasso d'Italia", 'Venerdì').editions.some(d => d.start));
assert(!events.some(e => /Con Lucrezia|Casa di Babbo Natale|Swap party|Mercante in fiera/.test(e.name)));
for (const e of events.filter(e => e.name.includes('Natale') && !["Sant'Egidio alla Vibrata"].includes(e.city))) assert(!e.editions.some(d => d.year === 2026 && d.start && d.start > '2026-10-26'), e.id);
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
    if (process.env.FIERE_TERAMO_DATA_ONLY === '1') { console.log('Teramo: dati, isolamento e 80 pagine SSR OK'); return; }
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_TERAMO_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Teramo&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
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
                if (process.env.FIERE_TERAMO_QA_DIR) { fs.mkdirSync(process.env.FIERE_TERAMO_QA_DIR, { recursive: true }); await page.screenshot({ path: path.join(process.env.FIERE_TERAMO_QA_DIR, engine + '-' + width + '.png') }); }
                await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => e.pricing || ['Nereto', 'Castel Castagna', 'Giulianova', 'Teramo'].includes(e.city)).slice(0, 8)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: events.length, base, status: 'passed' });
                console.log(engine, width, 'Teramo: elenco, mappa, tutti i dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally { server.close(); if (process.env.FIERE_TERAMO_OUT) fs.writeFileSync(process.env.FIERE_TERAMO_OUT, JSON.stringify(results, null, 2)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
