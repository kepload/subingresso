// Pescara: documentary distinctions, preservation and public calendar behavior.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const data = read('data/fiere.json'), audit = read('data/fiere-pescara.json'), research = audit.research;
const baseline = JSON.parse(cp.execFileSync('git', ['show', research.baselineCommit + ':data/fiere.json'], { cwd: root, maxBuffer: 25 * 1024 * 1024 }));
const events = data.events.filter(e => e.province === 'Pescara');
assert.equal(events.length, 49); assert.equal(data.events.length, 7295);
assert.equal(new Set(events.map(e => e.city)).size, 21); assert.equal(data.eventsWithEditionData, 7099);
assert.deepEqual(data.events.filter(e => e.province !== 'Pescara'), baseline.events.filter(e => e.province !== 'Pescara'));
for (const e of baseline.events.filter(e => e.province === 'Pescara')) assert(events.some(n => n.id === e.id), e.id);
assert.equal(research.municipalities.length, 46);
assert.deepEqual(research.municipalities.map(m => m.city).sort(), read('data/comuni.json').filter(c => c.provincia === 'Pescara').map(c => c.nome).sort());
assert.deepEqual(research.municipalities.flatMap(m => m.events).sort(), events.map(e => e.id).sort());
assert.equal(research.regionalRowAudit.length, 4); assert.equal(research.unpliAudit.length, 71);
assert.equal(research.openLeads.length, 0); assert(research.closedLeads.length >= 24); assert(research.exclusions.length >= 20);
assert.equal(research.sourceReceipts.length, research.statistics.sourceReceipts);
for (const m of research.municipalities) { assert(m.sources.length, m.city); assert(m.sourceReceipts.length, m.city); assert.equal(m.eventCount, m.events.length); }
for (const e of events) {
    assert.equal(e.source.checkedAt, '2026-10-25'); assert(e.participation.note.length > 100);
    for (const url of e.sourceRecordIds) assert(research.sourceReceipts.some(r => r.url === url && (r.status === 200 || r.alternativeRead)), url);
    for (const d of e.editions) {
        assert(e.sourceRecordIds.includes(d.sourceUrl.split('#')[0]), e.id);
        if (!d.start) { assert(d.label); continue; }
        assert(d.start <= d.end); assert(e.months.includes(Number(d.start.slice(5, 7)))); assert(e.months.includes(Number(d.end.slice(5, 7))));
    }
    if (e.pricing) { assert.equal(e.participation.costs, e.pricing.details); assert(e.sourceRecordIds.includes(e.pricing.sourceUrl)); }
}
const event = (city, name) => { const e = events.find(e => e.city === city && e.name.includes(name)); assert(e, city + ' ' + name); return e; };
const immacolata = event('Popoli', 'Immacolata');
assert.equal(immacolata.editions[0].start, '2026-12-08'); assert.equal(immacolata.participation.deadline, '2026-11-16'); assert.equal(immacolata.stallCount, 91);
assert.deepEqual(immacolata.merchandiseSectors, ['non-alimentare']); assert.match(immacolata.participation.note, /Non è prevista la spunta/); assert(!immacolata.pricing);
const pace = event('Popoli', 'Madonna della Pace'); assert.equal(pace.stallCount, 21); assert.equal(pace.participation.deadline, '2026-05-11');
const caramanico = event('Caramanico Terme', 'Villaggio'); assert.equal(caramanico.editions.length, 8);
for (const d of ['2026-11-16', '2026-12-21', '2026-12-22', '2026-12-25']) assert(!caramanico.editions.some(e => e.start <= d && d <= e.end), d);
assert.equal(caramanico.editions.at(-1).end, '2027-01-06'); assert.equal(caramanico.pricing.period, '2026/2027'); assert.match(caramanico.pricing.details, /250 € o 500 €/);
assert.equal(event('Pescara', 'Pescara Sposi').editions[0].start, '2026-10-03'); assert.equal(event('Pescara', 'Abruzzo Sposi').editions[0].start, '2026-10-17');
assert.equal(event('Montesilvano', 'Radioamatore').editions[0].start, '2026-11-28'); assert(!events.some(e => e.city === 'Pescara' && /Radioamatore|Comix/.test(e.name)));
const comix = event('Montesilvano', 'Comix'); assert.match(comix.pricing.details, /100 €.*120 €.*240\/270\/290 €.*1\.800 €/); assert(!comix.participation.deadline); assert.match(comix.participation.note, /snack confezionati/);
assert.match(event('Penne', 'San Massimo').pricing.details, /sola area.*gazebo/s); assert.equal(events.filter(e => e.pricing).length, 4);
const bonsai = event('Cepagatti', 'Bonsai'); assert(!bonsai.editions.some(d => d.start)); assert.match(bonsai.editions[0].label, /4–6.*5–6/);
assert.deepEqual(event('Montesilvano', 'Mercanti').editions.map(d => d.start), ['2026-04-12', '2026-05-10', '2026-06-14']);
assert(!event('Pescara', 'Caccia').editions.some(d => d.start >= '2026-10-25'));
assert.equal(event('Picciano', 'Natale').editions[0].start, '2026-11-28'); assert.match(event('Picciano', 'Natale').participation.note, /non sostituiscono concessioni/);
assert.equal(event('Loreto Aprutino', 'Fiera').editions[0].start, '2026-09-13'); assert.equal(event('Bussi sul Tirino', 'Giugno').editions[0].start, '2026-06-07');
assert.equal(event('Cugnoli', 'Natale').editions[0].year, 2025); assert.equal(event('Roccamorice', 'Fiera').editions[0].year, 2025);
assert(!event('Catignano', 'Novello').editions.some(d => d.year === 2026 && d.start));
assert(!events.some(e => /Fun Fest|Chocofestival|Baratto|Car Boot|Fieragricola|Sbaracco/.test(e.name)));
const pancrazio = event('Manoppello', 'San Pancrazio');
assert.equal(pancrazio.editions[0].start, '2026-09-10'); assert.equal(pancrazio.editions[0].end, '2026-09-13'); assert.equal(pancrazio.editions[0].periodOnly, true);
assert.match(pancrazio.participation.note, /disallestimento/);
assert.deepEqual(event('Pescara', 'Mercantico').editions.map(d => d.start), ['2025-11-02', '2025-12-07']);
assert.equal(event('Lettomanoppello', 'Mercatini').editions[0].start, '2025-12-14');
assert.equal(event('Pescosansonesco', 'Uncinetto').editions[0].start, '2025-12-07');
assert.equal(event('Pianella', 'Cerratina').editions[0].start, '2025-12-14');
const penneNatale = event('Penne', 'Mercatini di Natale'); assert.equal(penneNatale.editions.length, 6);
assert.equal(penneNatale.editions.at(-1).start, '2026-01-06');
assert(!penneNatale.editions.some(d => d.start <= '2025-12-15' && d.end >= '2025-12-15'));
assert(!penneNatale.editions.some(d => d.start >= '2026-10-25'));
assert(!event('Scafa', 'Magnalavino').pricing); assert(!event('Scafa', 'Magnalavino').participation.deadline);
assert.equal(event("Città Sant'Angelo", 'OrgOlio').editions[0].year, 2025);
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
    if (process.env.FIERE_PESCARA_DATA_ONLY === '1') { console.log('Pescara: dati, isolamento e 49 pagine SSR OK'); return; }
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_PESCARA_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Pescara&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
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
                if (process.env.FIERE_PESCARA_QA_DIR) { fs.mkdirSync(process.env.FIERE_PESCARA_QA_DIR, { recursive: true }); await page.screenshot({ path: path.join(process.env.FIERE_PESCARA_QA_DIR, engine + '-' + width + '.png') }); }
                await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => e.pricing || ['Popoli', 'Picciano', 'Catignano', 'Pescara'].includes(e.city)).slice(0, 8)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: events.length, base, status: 'passed' });
                console.log(engine, width, 'Pescara: elenco, mappa, tutti i dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally { server.close(); if (process.env.FIERE_PESCARA_OUT) fs.writeFileSync(process.env.FIERE_PESCARA_OUT, JSON.stringify(results, null, 2)); }
})().catch(e => { console.error(e); process.exitCode = 1; });
