// Chieti: fonti originali, date, oneri, esclusioni e isolamento provinciale.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const data = read('data/fiere.json'), audit = read('data/fiere-chieti.json'), research = audit.research;
const baseline = JSON.parse(cp.execFileSync('git', ['show', research.baselineCommit + ':data/fiere.json'], { cwd: root, maxBuffer: 25 * 1024 * 1024 }));
const events = data.events.filter(e => e.province === 'Chieti');
assert.equal(events.length, 82); assert.equal(data.events.length, 7451);
assert.equal(new Set(events.map(e => e.city)).size, 31); assert.equal(data.eventsWithEditionData, 7261);
assert.deepEqual(data.events.filter(e => e.province !== 'Chieti'), baseline.events.filter(e => e.province !== 'Chieti'));
for (const e of baseline.events.filter(e => e.province === 'Chieti')) assert(events.some(n => n.id === e.id), e.id);
assert.equal(research.municipalities.length, 104);
assert.deepEqual(research.municipalities.map(m => m.city).sort(), read('data/comuni.json').filter(c => c.provincia === 'Chieti').map(c => c.nome).sort());
assert.deepEqual(research.municipalities.flatMap(m => m.events).sort(), events.map(e => e.id).sort());
assert.equal(research.regionalRowAudit[0].rowsChieti, 5); assert.equal(research.unpliAudit.length, 236);
assert.equal(research.openLeads.length, 0); assert.equal(research.closedLeads.length, 35); assert.equal(research.exclusions.length, 33);
assert.equal(research.sourceReceipts.length, research.statistics.sourceReceipts);
for (const m of research.municipalities) { assert(m.sources.length, m.city); assert(m.sourceReceipts.length, m.city); assert.equal(m.eventCount, m.events.length); }
for (const e of events) {
 assert.equal(e.source.checkedAt, '2026-10-26'); assert(e.participation.note.length > 100);
 for (const url of e.sourceRecordIds) assert(research.sourceReceipts.some(r => r.url === url && r.status === 200), url);
 for (const d of e.editions) {
  assert(e.sourceRecordIds.includes(d.sourceUrl.split('#')[0]), e.id);
  if (!d.start) { assert(d.label); assert.equal(d.dateType, 'calendar'); continue; }
  assert(d.start <= d.end); assert(e.months.includes(Number(d.start.slice(5, 7)))); assert(e.months.includes(Number(d.end.slice(5, 7))));
 }
 if (e.pricing) { assert.equal(e.participation.costs, e.pricing.details); assert(e.sourceRecordIds.includes(e.pricing.sourceUrl)); }
}
const event = (city, name) => { const e = events.find(e => e.city === city && e.name.includes(name)); assert(e, city + ' ' + name); return e; };
const guardia = event('Guardiagrele', "Mostra dell'artigianato");
assert.equal(guardia.editions[0].start, '2026-08-01'); assert.equal(guardia.editions[0].end, '2026-08-23');
assert.match(guardia.participation.note, /4–18/);
const tornareccio = event('Tornareccio', 'Regina'); assert.equal(tornareccio.participation.deadline, '2026-09-07');
assert.equal(tornareccio.pricing.kind, 'conditional');
for (const value of ['70 €','370 €','450 €','225 €','350 €','300 €','650 €','200 €','150 €']) assert(tornareccio.pricing.details.includes(value), value);
const miracoli = event('Casalbordino', 'Miracoli'); assert.equal(miracoli.participation.deadline, '2026-04-30');
assert.equal(miracoli.pricing.kind, 'partial'); assert.match(miracoli.pricing.details, /10 €.*30 €/s);
const egidio = event('Lanciano', "Sant'Egidio"); assert.equal(egidio.participation.deadline, '2026-06-30'); assert.match(egidio.participation.note, /275\/2026/);
assert.equal(event('Lanciano', "Fiera dell'Agricoltura").editions[0].start, '2026-04-17');
assert.equal(event('Lanciano', 'posteggi esterni').editions[0].start, '2026-04-18');
assert.equal(event('Lanciano', 'Mastrogiurato').editions[0].start, '2026-09-06');
assert.equal(event('Lanciano', 'Erythrura').editions[0].start, '2026-10-03');
assert.equal(event('Lanciano', 'Progress').editions[0].dateType, 'calendar');
assert.equal(event('Vasto', 'Trofeo').editions[0].start, '2026-10-25');
assert(!events.some(e => /Cioccolato/.test(e.name)));
assert.equal(event('San Salvo', 'San Rocco').editions[0].start, '2026-09-15');
assert.equal(event('San Salvo', 'San Vitale').hours, '8:00–14:00');
assert.equal(event('Carunchio', 'Fiera').editions.length, 4);
assert(event('Carunchio', 'Fiera').editions.every(d => d.year === 2025));
assert.equal(event('Fossacesia', 'produttori').editions[0].periodOnly, true);
assert.equal(event('Fossacesia', 'street food').editions[0].end, '2026-09-20');
assert.match(event('Fossacesia', 'street food').participation.note, /dieci/);
assert.equal(event('Francavilla al Mare', 'Tarlo').editions.length, 7);
assert.equal(event('Chieti', 'Curiosità').editions.length, 6);
assert.equal(new Set(event('Chieti', 'Curiosità').editions.map(d => d.sourceUrl)).size, 4);
assert(!event('Chieti', 'Natale').editions[0].start);
assert.match(event('Santa Maria Imbaro', 'Natale').participation.note, /Gioventù.*Plebiscito/s);
assert.equal(event('Roccaspinalveti', 'Natale').editions[0].start, '2025-12-06');
assert.equal(events.filter(e => e.pricing).length, 3);
for (const e of events.filter(e => /Natale|Avvento|Pretoro in Fiaba/.test(e.name))) assert(!e.editions.some(d => d.year === 2026 && d.start && d.start > '2026-10-26'), e.id);
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
    if (process.env.FIERE_CHIETI_DATA_ONLY === '1') { console.log('Chieti: dati, isolamento e 82 pagine SSR OK'); return; }
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_CHIETI_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Chieti&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
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
                if (process.env.FIERE_CHIETI_QA_DIR) { fs.mkdirSync(process.env.FIERE_CHIETI_QA_DIR, { recursive: true }); await page.screenshot({ path: path.join(process.env.FIERE_CHIETI_QA_DIR, engine + '-' + width + '.png') }); }
                await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => e.pricing || ['Guardiagrele', 'Fossacesia', 'Santa Maria Imbaro', 'Chieti'].includes(e.city)).slice(0, 8)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: events.length, base, status: 'passed' });
                console.log(engine, width, 'Chieti: elenco, mappa, tutti i dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally { server.close(); if (process.env.FIERE_CHIETI_OUT) fs.writeFileSync(process.env.FIERE_CHIETI_OUT, JSON.stringify(results, null, 2)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
