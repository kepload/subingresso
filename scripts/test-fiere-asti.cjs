// Asti: original-document regressions, other provinces preserved and real calendar UI.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const data = read('data/fiere.json'), audit = read('data/fiere-asti.json');
const baseline = JSON.parse(cp.execFileSync('git', ['show', '0f6cf6d:data/fiere.json'], { cwd: root, maxBuffer: 25 * 1024 * 1024 }));
const events = data.events.filter(e => e.province === 'Asti');
assert.deepEqual(data.events.filter(e => e.province !== 'Asti'), baseline.events.filter(e => e.province !== 'Asti'));
assert.equal(events.length, 100); assert.equal(data.events.length, 5292);
assert.equal(new Set(events.map(e => e.city)).size, 49);
assert.deepEqual(audit.research.municipalities.map(c => c.city).sort(), read('data/comuni.json').filter(c => c.provincia === 'Asti').map(c => c.nome).sort());
assert.equal(audit.research.municipalities.length, 118);
assert(audit.research.municipalities.every(c => c.searchReceipts.length && c.sources.length));
assert.equal(audit.research.regionalRowAudit.length, 94);
assert.equal(audit.research.openLeads.length, 0);
assert.equal(audit.research.statistics.only2025Events, 2);
for (const b of baseline.events.filter(e => e.province === 'Asti')) assert(events.some(e => e.id === b.id), b.id);
const get = (name, city) => {
    const a = events.filter(e => e.name === name && (!city || e.city === city));
    assert.equal(a.length, 1, name); return a[0];
};
const dates = (name, city) => get(name, city).editions.filter(d => d.start).map(d => [d.start, d.end]);
assert.deepEqual(dates('Fiera di Primavera', 'Asti'), [['2026-03-29', '2026-03-29']]);
assert.equal(get('Fiera di Primavera', 'Asti').participation.deadline, '2026-01-28');
assert.deepEqual(dates('Fiera di San Bartolomeo'), [['2026-08-24', '2026-08-24']]);
assert.deepEqual(dates('Fiera della Menta'), [['2026-06-07', '2026-06-07']]);
assert.deepEqual(dates('Fiera Nazionale del Tartufo Bianco del Monferrato'), [['2026-11-08', '2026-11-08']]);
assert.deepEqual(dates('Fiera Nazionale del Tartufo', 'Moncalvo'), [['2026-10-18', '2026-10-18'], ['2026-10-24', '2026-10-25']]);
assert.match(get('Fiera Nazionale del Tartufo', 'Moncalvo').pricing.details, /183.*61.*244.*79.*305.*97.*366.*105/);
assert.equal(get('Fiera Nazionale del Tartufo', 'Moncalvo').participation.deadline, '2026-04-30');
assert.deepEqual(dates('Fiera dei Santi 2026'), [['2026-11-08', '2026-11-09']]);
assert.equal(get('Fiera dei Santi 2026').pricing.kind, 'partial');
assert.equal(get('Fiera "Citta\' della Nocciola"').pricing.kind, 'free');
assert.deepEqual(dates('Fiera del Santo Cristo'), [['2026-04-26', '2026-04-26']]);
assert.deepEqual(dates('Benefica on the Road', 'Cocconato'), [['2026-09-14', '2026-09-14'], ['2026-11-22', '2026-11-22']]);
assert.equal(get('Fiera del Tartufo 2026').participation.deadline, '2026-10-25');
assert.equal(get('Fiera del Tartufo 2026').stallCount, 43);
assert.equal(get('Fiera di Sant° Andrea').participation.deadline, '2026-10-25');
assert.equal(get('Fiera di Sant° Andrea').stallCount, 123);
assert.equal(get('Il Magico Paese di Natale - Mercatino di Natale').editions.length, 7);
assert.equal(get('Il Magico Paese di Natale - Mercatino di Natale').editions[0].start, '2026-11-13');
for (const n of ['Fiera di San Simone', 'Fiera di Santa Lucia', 'Mercatino antiquariato e artigianato']) assert(get(n).editions.every(d => !d.start));
for (const n of ['Malvagia - mercatino del Solstizio d’Estate', 'Fiera Nazionale della Zucca - La Zucca delle Meraviglie']) assert(get(n).editions[0].periodOnly);
assert.deepEqual(dates('Mercatino dello scambio e del baratto'), [['2025-12-08', '2025-12-08']]);
assert.deepEqual(dates('SaltinPiazza Winter - mercatino solidale'), [['2025-12-13', '2025-12-13']]);
const nizza = events.find(e => e.city === 'Nizza Monferrato' && e.name.startsWith('Mercatino dei Produttori'));
assert(nizza.editions.some(d => d.start === '2026-11-15' && d.end === '2026-11-15'));
assert(!events.some(e => /Festa della Barbera|Usanze/.test(e.name)));
for (const e of events) {
    assert.equal(e.source.checkedAt, '2026-10-20'); assert(e.sourceRecordIds.includes(e.source.url));
    for (const u of e.sourceRecordIds) assert(audit.research.sourceReceipts.some(r => r.url === u), u);
    assert(e.participation.note.length > 80, e.name);
    if (e.pricing) assert.equal(e.participation.costs, e.pricing.details);
}
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
    const base = process.env.FIERE_ASTI_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Asti&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '100');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                const dialogs = [...events.filter(e => e.pricing), get('Il Magico Paese di Natale - Mercatino di Natale'), get('Mercatino dello scambio e del baratto'), get('Fiera di San Simone'), get('Fiera di Santa Lucia'), get('Malvagia - mercatino del Solstizio d’Estate')];
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
                assert.deepEqual(errors, []); await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of [get('Il Magico Paese di Natale - Mercatino di Natale'), get('Fiera Nazionale del Tartufo', 'Moncalvo'), get('Fiera di San Simone'), get('Fiera dei Santi 2026')]) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Asti: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_ASTI_OUT) fs.writeFileSync(process.env.FIERE_ASTI_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
