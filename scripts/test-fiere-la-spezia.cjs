// La Spezia: original evidence, date corrections and provincial isolation.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-la-spezia.json');
const baseline=JSON.parse(cp.execFileSync('git',['show',audit.research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province==='La Spezia');
assert.deepEqual(data.events.filter(e=>e.province!=='La Spezia'),baseline.events.filter(e=>e.province!=='La Spezia'));
assert.equal(events.length,164);assert.equal(data.events.length,6129);assert.equal(new Set(events.map(e=>e.city)).size,26);
for(const e of baseline.events.filter(e=>e.province==='La Spezia')){
 if(e.id==='liguria-bonassola-mercatino-dei-sapori'){assert(!events.some(n=>n.id===e.id));continue;}
 assert(events.some(n=>n.id===e.id),e.id);
}
assert.equal(audit.research.municipalities.length,32);assert.equal(new Set(audit.research.municipalities.map(e=>e.city)).size,32);
assert.equal(audit.research.openLeads.length,0);assert.equal(audit.research.regionalRows.length,118);assert.equal(audit.research.periodicRows.length,37);
assert.equal(audit.research.sourceReceiptCount,audit.research.sourceReceipts.length);
assert(audit.research.sourceReceiptCount>=480);assert(audit.research.limitations.length>=25);
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-22');assert(e.participation.note.length>90,e.name);
 for(const u of e.sourceRecordIds)assert(audit.research.sourceReceipts.some(r=>r.url===u&&r.status===200),u);
 for(const d of e.editions)assert(e.sourceRecordIds.includes(d.sourceUrl),d.sourceUrl);
 if(e.pricing)assert(audit.research.sourceReceipts.some(r=>r.url===e.pricing.sourceUrl&&r.status===200));
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.toLowerCase().includes(name.toLowerCase()));assert(e,city+' '+name);return e;};
assert.deepEqual(event('Bonassola','Mercatino').editions.map(d=>d.start),['2026-04-06']);
assert.equal(event('Lerici','Mytiliade').editions[0].start,'2026-09-11');
assert.equal(event('Sarzana','Sarzana a tavola').editions[0].start,'2026-07-03');
assert.equal(event('Sarzana','Soffitta nella').editions[0].end,'2026-08-23');
assert.equal(event('Sesta Godano','cipolla').editions[0].start,'2026-07-05');
assert.equal(event('Vernazza','Vigna').editions[0].start,'2026-07-19');
assert.equal(event('Riomaggiore','Amore').editions[0].start,'2026-10-03');
assert.equal(event('Monterosso al Mare','acciughe').editions[0].end,'2026-06-20');
assert.equal(event('Portovenere','Fiera della Madonna delle Grazie').participation.deadline,'2026-08-31');
assert.equal(event('Calice al Cornoviglio','Castagno').editions.length,2);
assert.equal(event('Sarzana','Scartozzera').editions.length,2);
assert.equal(event('Sarzana','Trebbiatura').editions.length,2);
assert(event('Arcola','Carnevale').editions.every(d=>!d.start));
assert.equal(events.filter(e=>e.pricing).length,3);
assert(!events.some(e=>e.city==='Sarzana'&&/Winter|Christmas|Aspettando Natale/i.test(e.name)));
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
    const base = process.env.FIERE_SP_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=La Spezia&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '164');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                const dialogs = events.filter(e => e.pricing || ['Sarzana', 'Vezzano Ligure', 'Bonassola'].includes(e.city));
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
                assert.deepEqual(errors, []); if(process.env.FIERE_SP_QA_DIR) { fs.mkdirSync(process.env.FIERE_SP_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_SP_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => ['La Spezia', 'Sarzana', 'Calice al Cornoviglio'].includes(e.city)).slice(0, 4)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'La Spezia: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_SP_OUT) fs.writeFileSync(process.env.FIERE_SP_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
