// Vercelli: original documents, corrected dates, historical limits and provincial isolation.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-vercelli.json');
const baseline=JSON.parse(cp.execFileSync('git',['show',audit.research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province==='Vercelli');
assert.deepEqual(data.events.filter(e=>e.province!=='Vercelli'),baseline.events.filter(e=>e.province!=='Vercelli'));
assert.equal(events.length,102);assert.equal(data.events.length,6219);assert.equal(new Set(events.map(e=>e.city)).size,42);
for(const e of baseline.events.filter(e=>e.province==='Vercelli'))assert(events.some(n=>n.id===e.id),e.id);
assert.equal(audit.research.municipalities.length,82);assert.equal(new Set(audit.research.municipalities.map(e=>e.city)).size,82);
for(const m of audit.research.municipalities){assert(m.sources.length,m.city);assert(m.searchReceipts.length,m.city);}
assert.equal(audit.research.openLeads.length,0);assert.equal(audit.research.regionalRowAudit.length,18);assert.equal(audit.research.territorialRecordAudit.length,415);
assert.equal(audit.research.sourceReceipts.length,594);assert(audit.research.limits.length>=18);assert(audit.research.exclusions.length>=15);
for(const e of events){
 assert(['2026-10-13','2026-10-22'].includes(e.source.checkedAt));assert(e.participation.note.length>50,e.name);
 for(const u of e.sourceRecordIds)assert(audit.research.sourceReceipts.some(r=>r.url===u&&r.status===200),u);
 for(const d of e.editions)assert(e.sourceRecordIds.includes(d.sourceUrl),d.sourceUrl);
 if(e.pricing)assert(audit.research.sourceReceipts.some(r=>r.url===e.pricing.sourceUrl&&r.status===200));
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.toLowerCase().includes(name.toLowerCase()));assert(e,city+' '+name);return e;};
const dates=(city,name)=>event(city,name).editions.map(d=>d.start);
assert.deepEqual(dates('Trino','Dicembre'),['2026-12-05']);assert.equal(event('Trino','Dicembre').participation.deadline,'2026-10-06');
assert.deepEqual(dates('Fobello','Val Mastallone'),['2026-05-24']);
assert.deepEqual(dates('Quarona','Ottobre'),['2026-10-25']);
assert.deepEqual(dates('Tronzano Vercellese','San Martino'),['2026-11-08']);assert(!event('Tronzano Vercellese','San Martino').stallCount);
assert.deepEqual(dates('Santhi\u00e0','Fiera di Santa Caterina'),['2026-11-22']);assert.equal(event('Santhi\u00e0','Fiera di Santa Caterina').participation.deadline,'2026-11-06');
assert.deepEqual(dates('Santhi\u00e0','Agricola'),['2026-11-25']);
assert.deepEqual(dates('Santhi\u00e0','Ruggine'),['2026-02-22','2026-03-29','2026-04-26','2026-05-24','2026-09-27','2026-10-25','2026-11-22']);
assert.equal(event("Borgo d'Ale",'usato').editions.length,12);
assert.equal(event('Santhi\u00e0','cunicola').editions.length,2);
assert.deepEqual(dates('Moncrivello','Mirtillo'),['2026-06-20']);assert.equal(event('Moncrivello','Mirtillo').editions[0].end,'2026-06-21');
assert.deepEqual(dates('Saluggia','Fagiolo'),['2026-10-18']);
assert.deepEqual(dates('Vercelli','Ris\u00f2'),['2026-09-11']);assert.equal(event('Vercelli','Ris\u00f2').editions[0].end,'2026-09-13');
assert.deepEqual(dates('Vercelli','Hospitales'),['2026-04-17']);
assert.equal(event('Gattinara','LUVA').participation.deadline,'2026-08-14');
assert.equal(events.filter(e=>e.pricing).length,6);
assert.equal(events.filter(e=>e.editions.length&&e.editions.every(d=>d.year===2025)).length,9);
assert(event('Quinto Vercellese','Mercatino').editions.every(d=>d.year===2025));
assert(event('Vercelli','magia del dono').editions.every(d=>!d.start));
assert(!events.some(e=>/lupinaria/i.test(e.name)));
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
    const base = process.env.FIERE_VC_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Vercelli&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '102');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                const dialogs = events.filter(e => e.pricing || ['Trino', 'Santhi\u00e0', 'Quarona', 'Tronzano Vercellese'].includes(e.city));
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
                assert.deepEqual(errors, []); if(process.env.FIERE_VC_QA_DIR) { fs.mkdirSync(process.env.FIERE_VC_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_VC_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => ['Trino', 'Santhi\u00e0', 'Quarona'].includes(e.city)).slice(0, 4)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Vercelli: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_VC_OUT) fs.writeFileSync(process.env.FIERE_VC_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
