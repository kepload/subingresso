// Siena: isolation, original source evidence and public calendar verification.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-siena.json');
const baseline=JSON.parse(cp.execFileSync('git',['show','793b2f3e9cb3ffa6f86c2e0916103d4ab98ae3db:data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province==='Siena');
assert.deepEqual(data.events.filter(e=>e.province!=='Siena'),baseline.events.filter(e=>e.province!=='Siena'));
assert.equal(data.events.length,5908);assert.equal(events.length,85);assert.equal(new Set(events.map(e=>e.city)).size,33);
assert.equal(audit.research.municipalities.length,35);assert.equal(new Set(audit.research.municipalities.map(e=>e.city)).size,35);
assert.equal(audit.research.openLeads.length,0);assert.equal(audit.research.exclusions.length,28);assert.equal(audit.research.limitations.length,15);
for(const old of baseline.events.filter(e=>e.province==='Siena'))assert(events.some(e=>e.id===old.id));
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-21');assert(e.participation.note.length>90,e.name);
 for(const url of e.sourceRecordIds)assert(audit.research.sourceReceipts.some(r=>r.url===url&&r.status===200),url);
 for(const d of e.editions)assert(e.sourceRecordIds.includes(d.sourceUrl),d.sourceUrl);
 if(e.source.label.startsWith('Fonte secondaria'))assert(e.editions.every(d=>d.dateType==='calendar'));
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.includes(name));assert(e,city+' '+name);return e;};
assert(event('Siena','estate').editions.every(d=>!d.start));
assert.match(event('Siena','estate').participation.note,/giugno|giugno/i);
assert.equal(event('Siena','Mercato nel Campo').editions[0].start,'2026-12-04');
assert.equal(event('Abbadia San Salvatore','19 settembre').participation.deadline,'2026-07-16');
assert.equal(event('Gaiole in Chianti','Eroico').editions[0].start,'2026-10-01');
assert.equal(event('Pienza','Pienza e i Fiori').editions[0].start,'2026-05-09');
assert.equal(event('Pienza','Cacio').editions[0].start,'2026-09-05');
assert(event('Chianciano Terme','Immacolata').editions.every(d=>d.year===2025));
assert(event('Montepulciano','Natale').editions.every(d=>!d.start));
assert.equal(event('Trequanda','Trequanda').participation.deadline,'2026-10-16');
assert.deepEqual(event('Buonconvento','Collezionista').editions.map(d=>d.start),['2026-09-27','2026-12-08']);
assert.equal(events.filter(e=>e.pricing).length,6);
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
    const base = process.env.FIERE_SI_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Siena&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '85');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                const dialogs = events.filter(e => e.pricing || ['Siena', 'San Gimignano'].includes(e.city));
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
                assert.deepEqual(errors, []); if(process.env.FIERE_SI_QA_DIR) { fs.mkdirSync(process.env.FIERE_SI_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_SI_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => ['Siena', 'Trequanda', 'Montalcino'].includes(e.city)).slice(0, 4)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Siena: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_SI_OUT) fs.writeFileSync(process.env.FIERE_SI_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
