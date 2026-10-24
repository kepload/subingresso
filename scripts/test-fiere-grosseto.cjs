// Grosseto: isolamento, originali, quote distinte e conflitti di calendario.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-grosseto.json'),province='Grosseto',research=audit.research;
const baseline=JSON.parse(cp.execFileSync('git',['show',research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province===province);
assert.deepEqual(data.events.filter(e=>e.province!==province),baseline.events.filter(e=>e.province!==province));
assert.equal(baseline.events.filter(e=>e.province===province).length,1);
assert.equal(events.length,86);assert.equal(data.events.length,6930);assert.equal(new Set(events.map(e=>e.city)).size,24);
assert(events.some(e=>e.id==='toscana-grosseto-fiera-del-madonnino'));
assert.equal(research.municipalities.length,28);assert.equal(new Set(research.municipalities.map(e=>e.city)).size,28);
for(const m of research.municipalities){assert(m.sources.length,m.city);assert(m.sourceReceipts.length,m.city);for(const id of m.events)assert(events.some(e=>e.id===id),id);}
assert.equal(research.regionalRowAudit.length,3);assert.equal(research.historicalReenactmentRowAudit.length,10);
assert.equal(research.openLeads.length,0);assert.equal(research.closedLeads.length,28);assert(research.limits.length>=25);assert(research.exclusions.length>=18);
assert.equal(research.sourceReceipts.length,research.statistics.sourceReceipts);
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-24');assert(e.participation.note.length>50,e.name);
 for(const u of e.sourceRecordIds)assert(research.sourceReceipts.some(r=>r.url===u),u);
 assert(research.sourceReceipts.some(r=>r.url===e.source.url&&r.status===200),e.source.url);
 for(const d of e.editions){assert(e.sourceRecordIds.includes(d.sourceUrl),d.sourceUrl);if(d.start){assert(d.start<=d.end,e.id);assert(e.months.includes(Number(d.start.slice(5,7))),e.id);}else assert(d.label,e.id);}
 if(e.pricing){assert(research.sourceReceipts.some(r=>r.url===e.pricing.sourceUrl&&r.status===200));assert.equal(e.participation.costs,e.pricing.details);}
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.toLowerCase().includes(name.toLowerCase()));assert(e,city+' '+name);return e;};
const dates=(city,name)=>event(city,name).editions.map(d=>d.start).filter(Boolean);
assert.deepEqual(dates('Grosseto','Madonnino'),['2026-04-24','2027-04-23']);assert.equal(event('Grosseto','Madonnino').participation.deadline,'2027-01-13');
assert.deepEqual(dates('Grosseto','Game Fair'),['2026-04-24','2027-04-23']);assert.equal(event('Grosseto','Game Fair').pricing.period,'2026');
assert.match(event('Grosseto','Game Fair').pricing.details,/300 €/);assert.match(event('Grosseto','Game Fair').pricing.details,/35 €/);
assert.match(event('Grosseto','Madonnino').pricing.details,/640 €/);assert.match(event('Grosseto','Madonnino').pricing.details,/800 €/);
assert.deepEqual(dates('Grosseto','Motor Village'),['2026-10-03']);assert.equal(event('Grosseto','Motor Village').editions[0].end,'2026-10-04');
assert(event('Grosseto','Oltre Idea').editions.every(d=>d.dateType==='calendar'));
assert.deepEqual(dates('Manciano','Cantine'),['2026-09-11']);assert.equal(event('Manciano','Cantine').editions[0].end,'2026-09-13');
assert.deepEqual(dates('Cinigiano','Uva'),['2026-10-03']);assert.equal(event('Cinigiano','Uva').editions[0].end,'2026-10-04');
assert.deepEqual(dates('Civitella Paganico','Artigianato'),['2026-09-05']);assert(event('Civitella Paganico','Porcino').editions.every(d=>!d.start));
assert.deepEqual(dates('Scansano','Mercanteggiando'),['2026-09-26']);assert.equal(event('Scansano','Mercanteggiando').editions[0].end,'2026-09-27');
assert.deepEqual(dates('Sorano','Le mani creano'),['2026-08-13']);assert.equal(event('Sorano','Le mani creano').editions[0].end,'2026-08-22');
assert.deepEqual(dates('Pitigliano','Fiera del 29'),['2026-09-29']);
assert.deepEqual(dates('Follonica','Follos'),['2026-05-10']);
assert.deepEqual(dates('Scarlino','Marrone'),['2025-11-02']);assert.deepEqual(dates('Scarlino','Natale'),['2025-12-14']);
assert.deepEqual(dates('Gavorrano','Salto'),['2026-08-09']);
assert.deepEqual(dates('Orbetello','Lagunare'),['2026-04-04','2026-05-01','2026-06-06','2026-07-04','2026-08-01','2026-09-04','2026-10-03']);
assert.equal(event('Orbetello','Gustatus').participation.deadline,'2026-10-05');assert(!event('Orbetello','Gustatus').pricing);assert.match(event('Orbetello','Gustatus').participation.costs,/senza importo pubblicato/);
assert.equal(event('Magliano in Toscana','Vinellando').participation.deadline,'2026-08-03');assert.match(event('Magliano in Toscana','Vinellando').pricing.details,/10 €/);assert.match(event('Magliano in Toscana','Vinellando').pricing.details,/IVA non precisata/);
assert.equal(event('Santa Fiora','Mercatini estivi').editions.length,8);
assert.equal(events.filter(e=>e.editions.every(d=>d.year===2025)).length,4);assert.equal(events.filter(e=>e.editions.some(d=>d.start)).length,49);assert.equal(events.filter(e=>e.pricing).length,4);
assert(!events.some(e=>/Catabbio|Petricci|Panda Day|Jurassic Lagoon|Toscoleum|Etruria Vinum/.test(e.name)));
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
    if(process.env.FIERE_GROSSETO_DATA_ONLY==='1'){console.log('Grosseto dati, isolamento e tutte le 86 pagine SSR OK');return;}
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_GROSSETO_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Grosseto&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '86');
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
                assert.deepEqual(errors, []); if(process.env.FIERE_GROSSETO_QA_DIR) { fs.mkdirSync(process.env.FIERE_GROSSETO_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_GROSSETO_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => e.pricing || ['Grosseto','Manciano','Magliano in Toscana'].includes(e.city)).slice(0, 8)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Grosseto: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_GROSSETO_OUT) fs.writeFileSync(process.env.FIERE_GROSSETO_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
