const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-valle-aosta.json'),province=audit.province,research=audit.research;
const baseline=JSON.parse(cp.execFileSync('git',['show',research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province===province);
assert.equal(province,"Valle d'Aosta/Vall\u00e9e d'Aoste");
assert.deepEqual(data.events.filter(e=>e.province!==province),baseline.events.filter(e=>e.province!==province));
assert.equal(events.length,91);assert.equal(data.events.length,7011);assert.equal(new Set(events.map(e=>e.city)).size,38);
assert.equal(baseline.events.filter(e=>e.province===province).length,10);
for(const e of baseline.events.filter(e=>e.province===province))assert(events.some(n=>n.id===e.id));
assert.equal(research.municipalities.length,74);assert.equal(new Set(research.municipalities.map(e=>e.city)).size,74);
assert.equal(research.regionalRowAudit.length,15);assert.equal(research.openLeads.length,0);assert.equal(research.closedLeads.length,24);
assert(research.limits.length>=29);assert(research.exclusions.length>=17);
for(const m of research.municipalities){assert(m.sources.length,m.city);assert(m.sourceReceipts.length,m.city);for(const id of m.events)assert(events.some(e=>e.id===id));}
assert.equal(research.sourceReceipts.length,research.statistics.sourceReceipts);
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-25');assert(e.participation.note.length>50,e.name);
 for(const u of e.sourceRecordIds)assert(research.sourceReceipts.some(r=>r.url===u&&r.status===200),u);
 for(const d of e.editions){assert(e.sourceRecordIds.includes(d.sourceUrl));if(d.start){assert(d.start<=d.end);let [y,m]=d.start.slice(0,7).split('-').map(Number),[ey,em]=d.end.slice(0,7).split('-').map(Number);while(y<ey||(y===ey&&m<=em)){assert(e.months.includes(m),e.id+' '+m);if(m===12){y++;m=1;}else m++;}}else assert(d.label);}
 if(e.pricing){assert(research.sourceReceipts.some(r=>r.url===e.pricing.sourceUrl&&r.status===200));assert.equal(e.participation.costs,e.pricing.details);}
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.toLowerCase().includes(name.toLowerCase()));assert(e,city+' '+name);return e;};
const dates=(city,name)=>event(city,name).editions.map(d=>d.start).filter(Boolean);
assert.deepEqual(dates('Donnas',"Sant'Orso"),['2026-01-18']);assert.deepEqual(dates('Donnas','Luca'),['2026-10-19']);
assert.deepEqual(dates('Aosta',"Sant'Orso"),['2026-01-30','2027-01-30']);
assert.deepEqual(event('Aosta','Vert').months,[1,11,12]);assert.equal(event('Aosta','Vert').participation.deadline,'2026-06-30');
assert.deepEqual(dates('Nus','Tsalende'),['2026-12-06']);assert.equal(event('Nus','Tsalende').participation.deadline,'2026-11-09');assert.match(event('Nus','Tsalende').participation.note,/spunta NON/);
assert.deepEqual(dates('Gressoney-La-Trinit\u00e9','Wiehnacht'),['2026-01-04','2026-12-05','2026-12-12','2026-12-19','2026-12-26','2027-01-05']);
assert.deepEqual(dates('\u00c9mar\u00e8se','Emaresotto'),['2026-08-15']);assert.equal(event('\u00c9mar\u00e8se','Emaresotto').editions[0].end,'2026-08-16');
assert.deepEqual(dates('Torgnon',"outon"),['2026-11-01']);assert(event('Torgnon','Torgnolein').editions.every(d=>!d.start));
assert.deepEqual(dates('Courmayeur','Mats'),['2026-09-06']);assert.deepEqual(dates('Issogne','Saveurs'),['2026-05-17']);
assert.deepEqual(dates('Gressoney-Saint-Jean','artigianato'),['2026-07-14','2026-07-28','2026-08-11','2026-08-25']);
assert.equal(event('Ayas','Immacul').participation.deadline,'2026-10-30');assert.match(event('Ayas','Immacul').pricing.details,/550/);assert.match(event('Ayas','Immacul').pricing.details,/Due bolli/);
assert.match(event('Ch\u00e2tillon','miele').pricing.details,/20 .*40 .*70 /);assert.match(event('Ch\u00e2tillon','Petit').pricing.details,/20 .*30 .*40 /);
assert.equal(event('Aosta','Padiglione').pricing.period,'2027');assert.match(event('Aosta','Padiglione').pricing.details,/300 .*IVA per modulo/);
assert(event('Pr\u00e9-Saint-Didier','Glaciers').editions.every(d=>d.year===2015&&!d.start));assert.deepEqual(dates('Bard','Bourg'),['2025-12-08']);
assert.equal(events.filter(e=>e.pricing).length,6);assert.equal(event('Ayas','Curiosit').editions.length,6);
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
    if(process.env.FIERE_VALLE_AOSTA_DATA_ONLY==='1'){console.log("Valle Aosta dati, isolamento e tutte le 91 pagine SSR OK");return;}
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_VALLE_AOSTA_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=' + encodeURIComponent(province) + '&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '91');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                const dialogs = events;
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
                assert.deepEqual(errors, []); if(process.env.FIERE_VALLE_AOSTA_QA_DIR) { fs.mkdirSync(process.env.FIERE_VALLE_AOSTA_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_VALLE_AOSTA_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => e.pricing || ['Aosta','Nus','Ayas'].includes(e.city)).slice(0, 8)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, "Valle Aosta: catalogo, mappa, dettagli e pagine senza JS OK");
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_VALLE_AOSTA_OUT) fs.writeFileSync(process.env.FIERE_VALLE_AOSTA_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
