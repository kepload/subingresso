// Latina: originali, giornate commerciali, costi e isolamento provinciale.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const data = read('data/fiere.json'), audit = read('data/fiere-latina.json'), research = audit.research;
const baseline = JSON.parse(cp.execFileSync('git', ['show', research.baselineCommit + ':data/fiere.json'], { cwd: root, maxBuffer: 25 * 1024 * 1024 }));
const events = data.events.filter(e => e.province === 'Latina');
assert.equal(events.length, 77); assert.equal(data.events.length, 7527);
assert.equal(new Set(events.map(e => e.city )).size, 27); assert.equal(data.eventsWithEditionData, 7316);
assert.deepEqual(data.events.filter(e => e.province !== 'Latina'), baseline.events.filter(e => e.province !== 'Latina'));
for (const e of baseline.events.filter(e => e.province === 'Latina')) assert(events.some(n => n.id === e.id), e.id);
assert.equal(research.municipalities.length, 33);
assert.deepEqual(research.municipalities.map(m => m.city).sort(), read('data/comuni.json').filter(c => c.provincia === 'Latina').map(c => c.nome).sort());
assert.deepEqual(research.municipalities.flatMap(m => m.events).sort(), events.map(e => e.id).sort());
assert.equal(research.openLeads.length, 0); assert.equal(research.closedLeads.length, 33); assert.equal(research.exclusions.length, 28);
assert.equal(research.sourceReceipts.length, 558); assert.equal(research.statistics.originalFilesHashVerified, 547);
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
assert.equal(event('Sermoneta', 'San Michele').editions[0].start, '2026-09-25');
assert.equal(event('Cisterna di Latina', 'Ascensione').editions[0].start, '2026-05-17');
assert.equal(event('Cisterna di Latina', 'Ricalata').editions[0].start, '2026-10-18');
assert.equal(event('Cisterna di Latina', 'Mattoncini').editions.length, 1);
assert.equal(event('Cisterna di Latina', 'Mattoncini').editions[0].start, '2026-10-18');
assert.equal(event('Cisterna di Latina', 'AgriLazio').editions[0].start, '2026-09-18');
assert.equal(event('Aprilia', 'Campoverde').editions.length, 2);
assert.equal(event('Aprilia', 'Campoverde').editions[0].end, '2026-04-26');
assert.equal(event('Aprilia', 'Campoverde').editions[1].start, '2026-05-01');
assert.equal(event('Rocca Massima', 'Marroni').editions[0].start, '2026-10-17');
assert.equal(event('Norma', 'Castagne').editions[0].start, '2026-10-24');
assert.equal(event('Norma', 'Castagne').participation.deadline, '2026-10-05');
assert.equal(event('Itri', 'Civita').editions[0].start, '2026-07-19');
assert.equal(event('Itri', 'Civita').pricing.kind, 'partial');
assert.equal(event('Priverno', 'Fiera Nostra').hours, '8:00–16:00');
assert.equal(event('Priverno', 'Fiera Nostra').pricing.kind, 'free');
assert.match(event('Priverno', 'Fossanova').pricing.details, /1\.6000,00/);
assert.equal(event('Priverno', 'Fossanova').participation.deadline, '2026-07-27');
assert.equal(event('Sabaudia', 'Sotto la Torre').editions.length, 0);
assert.match(event('Sabaudia', 'Sotto la Torre').participation.note, /quarta domenica/);
assert.equal(events.filter(e => e.city === 'Cori').length, 3);
assert(events.filter(e => e.city === 'Cori').every(e => e.editions.length === 0));
const recurringMinturno = events.filter(e => e.city === 'Minturno' && e.source.url === event('Minturno', 'Pasta al Torchio').source.url);
assert.equal(recurringMinturno.length, 13); assert(recurringMinturno.every(e => e.editions.length === 0));
assert(event('Minturno', 'Vacca Marchigiana')); assert(!events.some(e => /Grazie – Marina|Torchio e della Vacca/.test(e.name)));
assert.equal(event('Minturno', 'Santa Lucia').editions[0].year, 2025);
assert.equal(event('Minturno', 'Santa Lucia').pricing.period, '2025');
assert.equal(event('Latina', 'Carnevale').editions.length, 3);
assert(!event('Latina', 'Carnevale').editions.some(d => d.end === '2026-02-22'));
assert.equal(event('Latina', 'Villaggio natalizio').editions[0].periodOnly, true);
assert.equal(event('Latina', 'Villaggio natalizio').editions[0].end, '2027-01-06');
assert.equal(event('Latina', 'Memoria').editions.length, 0);
assert.equal(event('Latina', 'Marina').editions[0].start, undefined);
assert.equal(event('Monte San Biagio', 'San Innocenzo').editions[0].start, '2026-10-25');
assert.match(event('Monte San Biagio', 'San Innocenzo').participation.note, /Errore 5001/);
assert.equal(event('Sperlonga', 'Sapori in Campo').editions[0].start, '2026-10-30');
assert.equal(event('Sperlonga', 'Torre Truglia').editions.length, 3);
assert.match(event('Sperlonga', 'Torre Truglia').pricing.details, /165 €.*220 €.*135 €/s);
assert.equal(event('Terracina', 'Cioccolato').editions.length, 2);
assert(event('Terracina', 'Cioccolato').editions.every(d => d.year === 2025));
assert.equal(event('Lenola', 'Colle').editions[0].dateType, 'calendar');
assert(!events.some(e => e.city === 'Roccagorga'));
assert.equal(event('Roccasecca dei Volsci', 'Caciottelle').editions[0].start, '2026-09-13');
assert.equal(event('Roccasecca dei Volsci', 'Primavera').editions[0].year, 2025);
assert.equal(event('Roccasecca dei Volsci', 'Primavera').editions[0].start, undefined);
assert.equal(events.filter(e => e.pricing).length, 11);
for (const e of events.filter(e => /Natale|natalizio/.test(e.name))) assert(!e.editions.some(d => d.year === 2026 && d.start && d.start > '2026-10-26' && !d.periodOnly), e.id);
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
    if (process.env.FIERE_LATINA_DATA_ONLY === '1') { console.log('Latina: dati, isolamento e 77 pagine SSR OK'); return; }
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_LATINA_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Latina&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
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
                if (process.env.FIERE_LATINA_QA_DIR) { fs.mkdirSync(process.env.FIERE_LATINA_QA_DIR, { recursive: true }); await page.screenshot({ path: path.join(process.env.FIERE_LATINA_QA_DIR, engine + '-' + width + '.png') }); }
                await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => e.pricing || ['Sermoneta', 'Cisterna di Latina', 'Sperlonga', 'Latina'].includes(e.city)).slice(0, 8)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: events.length, base, status: 'passed' });
                console.log(engine, width, 'Latina: elenco, mappa, tutti i dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally { server.close(); if (process.env.FIERE_LATINA_OUT) fs.writeFileSync(process.env.FIERE_LATINA_OUT, JSON.stringify(results, null, 2)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
