// Pesaro e Urbino: preserved research, original-document regressions and real calendar UI.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const data = read('data/fiere.json'), audit = read('data/fiere-pesaro-urbino.json');
const baseline = JSON.parse(cp.execFileSync('git', ['show', '85bb41a:data/fiere.json'], { cwd: root, maxBuffer: 25 * 1024 * 1024 }));
const province = 'Pesaro e Urbino', events = data.events.filter(e => e.province === province);
assert.deepEqual(data.events.filter(e => e.province !== province), baseline.events.filter(e => e.province !== province));
assert.equal(events.length, 136); assert.equal(data.events.length, 5378);
assert.equal(new Set(events.map(e => e.city)).size, 45);
assert.equal(audit.research.municipalities.length, 51);
assert.equal(new Set(audit.research.municipalities.map(c => c.city)).size, 51);
assert(audit.research.municipalities.every(c => c.searchReceipts.length && c.sources.length));
assert.equal(audit.research.regionalRowAudit.length, 119);
assert.equal(audit.research.openLeads.length, 0);
assert.equal(audit.research.statistics.only2025Events, 2);
assert.equal(events.filter(e => e.pricing).length, 11);
const removed = 'marche-pesaro-festa-di-san-nicola';
for (const b of baseline.events.filter(e => e.province === province && e.id !== removed)) assert(events.some(e => e.id === b.id), b.id);
assert(!events.some(e => e.id === removed));
for (const e of events) {
 assert.equal(e.source.checkedAt, '2026-10-20');
 for (const url of e.sourceRecordIds) assert(audit.research.sourceReceipts.some(r => r.url === url), url);
 assert(e.participation.note.length > 40, e.name);
 if (e.pricing) assert.equal(e.participation.costs, e.pricing.details);
}
const urbania = events.filter(e => e.city === 'Urbania');
assert(urbania.some(e => e.editions.some(d => d.start === '2026-03-22')));
assert(urbania.some(e => e.editions.some(d => d.start === '2026-07-19')));
assert(urbania.some(e => e.editions.some(d => d.start === '2026-10-24')));
assert(urbania.some(e => e.editions.some(d => d.start === '2026-10-25')));
assert(events.filter(e => e.name === 'Nel Castello di Babbo Natale').every(e => e.editions.every(d => !d.start)));
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
    const base = process.env.FIERE_PU_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Pesaro%20e%20Urbino&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '136');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                const dialogs = [...events.filter(e => e.pricing), ...events.filter(e => e.city === 'Frontone')];
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
                for (const e of events.filter(e => ['Frontone', 'Mombaroccio'].includes(e.city)).slice(0, 4)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Pesaro e Urbino: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_PU_OUT) fs.writeFileSync(process.env.FIERE_PU_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
