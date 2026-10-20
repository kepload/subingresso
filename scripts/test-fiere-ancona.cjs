// Ancona: preserved research, original-document regressions and real calendar UI.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const data = read('data/fiere.json'), audit = read('data/fiere-ancona.json');
const baseline = JSON.parse(cp.execFileSync('git', ['show', '7cb388a:data/fiere.json'], { cwd: root, maxBuffer: 25 * 1024 * 1024 }));
const province = 'Ancona', events = data.events.filter(e => e.province === province);
assert.deepEqual(data.events.filter(e => e.province !== province), baseline.events.filter(e => e.province !== province));
assert.equal(events.length, 104); assert.equal(data.events.length, 5438);
assert.equal(new Set(events.map(e => e.city)).size, 40);
assert.equal(audit.research.municipalities.length, 47);
assert.equal(new Set(audit.research.municipalities.map(c => c.city)).size, 47);
assert(audit.research.municipalities.every(c => c.searchReceipts.length && c.sources.length));
assert.equal(audit.research.regionalRowAudit.length, 65);
assert.equal(audit.research.openLeads.length, 0);
assert.equal(events.filter(e => e.pricing).length, 6);
for (const b of baseline.events.filter(e => e.province === province)) assert(events.some(e => e.id === b.id), b.id);
for (const e of events) {
 assert.equal(e.source.checkedAt, '2026-10-20');
 for (const url of e.sourceRecordIds) assert(audit.research.sourceReceipts.some(r => r.url === url), url);
 assert(e.participation.note.length > 40, e.name);
 if (e.pricing) assert.equal(e.participation.costs, e.pricing.details);
}
const event = (city, name) => events.find(e => e.city === city && e.name === name);
assert.equal(event('Agugliano', 'Fiera di primavera').editions[0].start, '2026-04-12');
assert.equal(event('Senigallia', "Fiera di Sant'Agostino").editions[0].start, '2026-08-27');
assert.equal(event('Offagna', 'Fiera del colombaccio').editions[0].start, '2026-09-12');
assert.equal(event('Jesi', 'Fiera di San Settimio').editions[0].start, '2026-09-23');
assert.equal(event('Ancona', 'Mercato Europeo FIVA').editions[0].end, '2026-11-01');
assert.equal(event('Genga', "Festa d'Autunno e Sagra della Polenta - mercatini").editions[0].start, '2026-10-23');
assert.equal(event("Morro d'Alba", 'Festa del Lacrima e del Tartufo - mostra mercato').editions[0].start, '2026-10-16');
assert.equal(event('Numana', "Fiera dell'avvenuta"), undefined);
assert.deepEqual(event('Loreto', "Fiera dell'avvenuta").months, [12]);
assert.equal(event('Senigallia', 'Le Meraviglie del Foro').editions.length, 9);
assert.match(event('Senigallia', 'Le Meraviglie del Foro').pricing.details, /40/);
for (const [city,name] of [['Offagna','Fiera di san bernardino'],['Castelleone di Suasa','Fiera del perdono'],['Montecarotto','Fiera di san placido'],['Osimo','Fiera san giuseppe copertino']]) {
 assert(event(city,name).editions.every(d => !d.start), city + ' unresolved dates must remain textual');
}
assert.equal(events.filter(e => e.city === 'Montecarotto' && e.name === 'Fiera di san placido').length, 1);
const secondary = events.filter(e => /secondari/.test(e.source.label)); assert.equal(secondary.length,5);
assert(secondary.every(e => e.editions.every(d => d.dateType === 'calendar')));
assert(!events.some(e => e.city === 'Castelplanio' && /Natale/.test(e.name)), 'A trip to Arezzo is not a Castelplanio fair');
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
    const base = process.env.FIERE_ANCONA_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Ancona&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '104');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                const dialogs = [...events.filter(e => e.pricing), ...events.filter(e => ['Offagna', 'Montecarotto', 'Osimo'].includes(e.city))];
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
                for (const e of events.filter(e => ['Ancona', 'Jesi', 'Osimo'].includes(e.city)).slice(0, 4)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Ancona: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_ANCONA_OUT) fs.writeFileSync(process.env.FIERE_ANCONA_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
