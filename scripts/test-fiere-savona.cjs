// Savona: provincial isolation, original evidence and public calendar regressions.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-savona.json');
const baseline=JSON.parse(cp.execFileSync('git',['show',audit.research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province==='Savona');
assert.deepEqual(data.events.filter(e=>e.province!=='Savona'),baseline.events.filter(e=>e.province!=='Savona'));
assert.equal(events.length,293);assert.equal(data.events.length,6043);assert.equal(new Set(events.map(e=>e.city)).size,42);
for(const e of baseline.events.filter(e=>e.province==='Savona'))assert(events.some(n=>n.id===e.id),e.id);
assert.equal(audit.research.municipalities.length,69);assert.equal(new Set(audit.research.municipalities.map(e=>e.city)).size,69);
assert.equal(audit.research.openLeads.length,0);assert.equal(audit.research.regionalRows.length,385);
assert.equal(audit.research.sourceReceiptCount,audit.research.sourceReceipts.length);
assert(audit.research.sourceReceiptCount>=550);assert(audit.research.limitations.length>=20);
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-21');assert(e.participation.note.length>90,e.name);
 for(const u of e.sourceRecordIds)assert(audit.research.sourceReceipts.some(r=>r.url===u&&r.status===200),u);
 for(const d of e.editions)assert(e.sourceRecordIds.includes(d.sourceUrl),d.sourceUrl);
 if(e.pricing)assert(audit.research.sourceReceipts.some(r=>r.url===e.pricing.sourceUrl&&r.status===200));
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.includes(name));assert(e,city+' '+name);return e;};
assert.equal(event('Albenga','San Martino').participation.deadline,'2026-10-23');
assert.equal(event('Laigueglia','San Matteo').participation.deadline,'2026-04-29');
assert.match(event('Laigueglia','San Matteo').pricing.sourceUrl,/comune.laigueglia/);
assert.equal(event('Savona','Why Bio').editions[0].start,'2026-05-22');
assert.equal(event('Savona','brick festival').editions[0].start,'2026-10-24');
assert.equal(event('Sassello',"amaretto").editions[0].start,'2026-09-05');
assert(event('Borghetto Santo Spirito','San Matteo').editions.every(d=>!d.start));
assert.equal(event('Murialdo','Tecci').editions[0].start,'2026-11-08');
assert(event('Garlenda','Natale').editions.some(d=>d.start==='2026-11-29'));
assert.equal(events.filter(e=>e.city==='Urbe').length,9);
assert.equal(events.filter(e=>e.pricing).length,11);
assert.equal(events.filter(e=>e.editions.every(d=>d.year===2025)).length,4);
const finalborgo=event('Finale Ligure','dentro e fuori');
assert(!finalborgo.editions.some(d=>d.start==='2026-09-05'));
assert(finalborgo.editions.some(d=>d.start==='2026-12-08'));
assert(!events.some(e=>e.city==='Urbe'&&/Tiglieto|Molare|Olbicella/.test(e.venue)));
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
    const base = process.env.FIERE_SV_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Savona&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '293');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                const dialogs = events.filter(e => e.pricing || ['Albenga', 'Laigueglia', 'Murialdo'].includes(e.city));
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
                assert.deepEqual(errors, []); if(process.env.FIERE_SV_QA_DIR) { fs.mkdirSync(process.env.FIERE_SV_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_SV_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => ['Savona', 'Albenga', 'Finale Ligure'].includes(e.city)).slice(0, 4)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Savona: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_SV_OUT) fs.writeFileSync(process.env.FIERE_SV_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
