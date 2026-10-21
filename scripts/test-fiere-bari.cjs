// Bari: documentary conflicts, operative notices and preservation of every other province.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-bari.json');
const baseline=JSON.parse(cp.execFileSync('git',['show','15b0ae5:data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province==='Bari');
assert.deepEqual(data.events.filter(e=>e.province!=='Bari'),baseline.events.filter(e=>e.province!=='Bari'));
assert.equal(events.length,90);assert.equal(new Set(events.map(e=>e.city)).size,36);
assert.equal(audit.research.municipalities.length,41);
assert.equal(new Set(audit.research.municipalities.map(e=>e.city)).size,41);
assert(audit.research.municipalities.every(e=>e.homeAttempt.url&&e.searchEvidence));
assert.equal(audit.research.openLeads.length,0);
assert(audit.research.exclusions.length>=19&&audit.research.limitations.length>=17);
for(const e of baseline.events.filter(e=>e.province==='Bari'))assert(events.some(x=>x.id===e.id));
for(const e of events){assert.equal(e.source.checkedAt,'2026-10-21');assert(e.participation.note.length>60);for(const u of e.sourceRecordIds)assert(audit.research.sourceReceipts.some(r=>r.url===u),u);}
const event=(city,name)=>events.find(e=>e.city===city&&e.name.includes(name));
assert.equal(event('Bitonto','San Leone').editions[0].start,'2026-03-29');
assert.equal(event('Monopoli','Santa Lucia').editions[0].start,'2026-12-13');
assert.equal(event('Monopoli','Santa Lucia').participation.deadline,'2026-10-13');
assert.equal(event('Terlizzi','San Nicola').participation.deadline,'2026-10-23');
assert.equal(event('Conversano','Flaviano').participation.deadline,'2026-10-24');
assert.match(event('Conversano','Flaviano').sectors,/vietata vendita animali vivi/);
assert.equal(event('Noicattaro','Carmine').participation.deadline,'2026-05-20');
assert.match(event('Noicattaro','Carmine').sectors,/limitato ai truck food/);
assert.equal(event('Palo del Colle','Tarallo').participation.deadline,'2026-10-19');
assert.match(event('Palo del Colle','Tarallo').pricing.details,/300/);
assert.match(event('Gravina in Puglia','San Giorgio').pricing.details,/50/);
assert.equal(event('Bari','Fiera del Levante').editions[0].start,'2026-09-19');
for(const [city,name] of [['Mola di Bari','Raffaele'],['Rutigliano','Fischietto in'],['Bari','San Nicola'],['Adelfia','Trifone']])assert(event(city,name).editions.every(e=>!e.start));
assert.equal(event('Modugno','Crocifisso').participation.deadline,undefined);
assert.equal(event('Modugno','Crocifisso').editions.length,2);
assert(event('Polignano a Mare','estivo').editions.every(e=>!e.start));
assert(events.filter(e=>e.city==='Ruvo di Puglia'&&/Ottavario|Medici/.test(e.name)).every(e=>e.editions.every(d=>d.year===2025)));
assert.equal(events.filter(e=>e.pricing).length,24);
const fees=read('data/fiere-costi.json').events;
const beforeFees=JSON.parse(cp.execFileSync('git',['show','15b0ae5:data/fiere-costi.json'],{cwd:root,maxBuffer:8*1024*1024})).events;
for(const [id,value] of Object.entries(beforeFees))assert.deepEqual(fees[id],value,id);
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
    const base = process.env.FIERE_BARI_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Bari&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '90');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                const dialogs = events.filter(e => e.pricing || ['Mola di Bari', 'Rutigliano', 'Polignano a Mare'].includes(e.city));
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
                assert.deepEqual(errors, []); if(process.env.FIERE_BARI_QA_DIR) { fs.mkdirSync(process.env.FIERE_BARI_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_BARI_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => ['Bari', 'Terlizzi', 'Conversano'].includes(e.city)).slice(0, 4)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Bari: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_BARI_OUT) fs.writeFileSync(process.env.FIERE_BARI_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
