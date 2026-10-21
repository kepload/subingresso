// Perugia: original-document corrections, preserved catalogue and real browser checks.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-perugia.json');
const baseline=JSON.parse(cp.execFileSync('git',['show','1a82bc8:data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const province='Perugia',events=data.events.filter(e=>e.province===province);
assert.deepEqual(data.events.filter(e=>e.province!==province),baseline.events.filter(e=>e.province!==province));
assert.equal(events.length,152);assert.equal(data.events.length,5580);
assert.equal(new Set(events.map(e=>e.city)).size,47);
assert.equal(audit.research.municipalities.length,59);
assert.equal(new Set(audit.research.municipalities.map(c=>c.city)).size,59);
assert(audit.research.municipalities.every(c=>c.searchReceipts.length&&c.sources.length));
assert.equal(audit.research.regionalRowAudit.length,120);
assert.equal(audit.research.openLeads.length,0);
assert.equal(events.filter(e=>e.pricing).length,9);
for(const b of baseline.events.filter(e=>e.province===province)){
 const current=events.find(e=>e.id===b.id);assert(current,b.id);
 if(b.contacts)assert.deepEqual(current.contacts,b.contacts,b.id+' preserved public contacts');
}
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-21');
 for(const u of e.sourceRecordIds)assert(audit.research.sourceReceipts.some(r=>r.url===u),u);
 assert(e.participation.note.length>40,e.name);
 if(e.pricing){assert.equal(e.participation.costs,e.pricing.details);assert.equal(e.pricing.period,'2026');}
}
const event=(city,part)=>events.find(e=>e.city===city&&e.name.toLowerCase()===part.toLowerCase())||events.find(e=>e.city===city&&e.name.toLowerCase().includes(part.toLowerCase()));
assert.equal(event('Perugia','Fiera dei Morti').editions[0].start,'2026-11-01');
assert.equal(event('Perugia','Fiera dei Morti').participation.deadline,'2026-07-01');
assert.equal(event('Todi','disfida').editions[0].end,'2026-10-11');
assert.equal(event('Todi','disfida').editions.length,1);
assert.equal(event('Castiglione del Lago','Fiori e Passioni').editions.length,2);
assert.equal(event('Castiglione del Lago','Fiori e Passioni').editions[0].start,'2026-04-25');
assert.equal(event('Bevagna','Gaite').editions[0].start,'2026-06-26');
assert.equal(event('Assisi','UNTO').editions[0].start,'2026-10-28');
assert.equal(event('Castel Ritaldi','Frantotipico').editions[0].start,'2026-10-25');
assert.equal(event('Foligno','rasiglia').editions.length,6);
assert.equal(event('Marsciano','Verde').participation.deadline,'2026-03-31');
assert.match(event('Marsciano','Verde').pricing.details,/23/);
assert.match(event('Gubbio','Tartufo').pricing.details,/732/);
assert.match(event('Gubbio','Ubaldo').pricing.details,/54/);
assert(!events.some(e=>/Grande Fiera di Pasqua/i.test(e.name)));
assert.equal(events.filter(e=>e.city==='Perugia'&&/quattro ponti/i.test(e.name)).length,1);
for(const [city,part] of [['Foligno','San Feliciano'],['Foligno','Plestia'],['Cannara','San Matteo'],['Sellano','Caterina'],['Scheggia e Pascelupo','Paterniano']])assert(event(city,part).editions.every(d=>!d.start),part);
const secondary=events.filter(e=>/secondari/.test(e.source.label));assert.equal(secondary.length,3);
assert(secondary.every(e=>e.editions.every(d=>d.dateType==='calendar')));
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
    const base = process.env.FIERE_PERUGIA_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Perugia&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '152');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                const dialogs = [...events.filter(e => e.pricing), ...events.filter(e => ['San Giustino', 'Cannara', 'Spello'].includes(e.city))];
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
                for (const e of events.filter(e => ['Perugia', 'Gubbio', 'Marsciano'].includes(e.city)).slice(0, 4)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Perugia: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_PERUGIA_OUT) fs.writeFileSync(process.env.FIERE_PERUGIA_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
