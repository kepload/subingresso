// Imperia: original sources, conflicting schedules, prices and provincial isolation.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-imperia.json'),province='Imperia',research=audit.research;
const baseline=JSON.parse(cp.execFileSync('git',['show',research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province===province);
assert.deepEqual(data.events.filter(e=>e.province!==province),baseline.events.filter(e=>e.province!==province));
assert.equal(events.length,197);assert.equal(data.events.length,6728);assert.equal(new Set(events.map(e=>e.city)).size,35);
const removed=research.removedBaselineEvents.map(e=>e.id);assert.equal(removed.length,2);
for(const e of baseline.events.filter(e=>e.province===province))assert.equal(events.some(n=>n.id===e.id),!removed.includes(e.id),e.id);
assert.equal(research.municipalities.length,66);assert.equal(new Set(research.municipalities.map(e=>e.city)).size,66);
for(const m of research.municipalities){assert(m.sources.length,m.city);assert(m.sourceReceipts.length,m.city);assert(m.sources.some(u=>research.sourceReceipts.some(r=>r.url===u&&r.status===200)),m.city);}
assert.equal(research.regionalRowAudit.length,196);assert.equal(research.marketRowAudit.length,41);assert.equal(research.fairManifestationRowAudit.length,3);assert.equal(research.authenticEventRowAudit.length,28);assert.equal(research.territorialRecordAudit.length,585);
for(const group of ['regionalRowAudit','marketRowAudit','fairManifestationRowAudit','authenticEventRowAudit','territorialRecordAudit','municipalities'])for(const row of research[group])for(const id of row.events)assert(events.some(e=>e.id===id),group+' '+id);
for(const row of research.regionalRowAudit)assert(row.decision);
assert.equal(research.openLeads.length,0);assert.equal(research.sourceReceipts.length,research.statistics.sourceReceipts);
assert(research.limits.length>=30);assert(research.exclusions.length>=17);
const retrieved=u=>research.sourceReceipts.some(r=>r.url===u&&(r.status===200||(r.downloaded&&r.pdf)));
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-24');assert(e.participation.note.length>50,e.name);
 for(const u of e.sourceRecordIds)assert(retrieved(u),u);
 for(const d of e.editions){assert(e.sourceRecordIds.includes(d.sourceUrl),d.sourceUrl);if(d.start){assert(d.start<=d.end,e.id);assert(e.months.includes(Number(d.start.slice(5,7))),e.id);}}
 if(e.pricing){assert(retrieved(e.pricing.sourceUrl));assert.equal(e.participation.costs,e.pricing.details);}
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.toLowerCase().includes(name.toLowerCase()));assert(e,city+' '+name);return e;};
const dates=(city,name)=>event(city,name).editions.map(d=>d.start);
assert.deepEqual(dates('Pieve di Teco','Fiera di ottobre'),['2026-10-18']);assert.deepEqual(dates('Pieve di Teco','Fiera di maggio'),['2026-05-17']);
assert.deepEqual(dates('Triora','Strigora'),['2026-08-23']);assert.equal(event('Triora','Halloween').editions[0].start,'2026-10-31');assert.equal(event('Triora','Halloween').editions[0].end,'2026-11-01');
assert.deepEqual(dates('Bordighera','Fiera delle Anime'),['2026-04-19']);
assert.deepEqual(dates('Imperia','Natura e Benessere'),['2026-10-23']);assert.equal(event('Imperia','Natura e Benessere').editions[0].end,'2026-10-24');
assert.deepEqual(dates('Vallecrosia','Giornata commerciale'),['2026-07-26','2026-12-06']);
assert.deepEqual(dates('Taggia','Sulle orme'),['2026-08-29']);assert.equal(dates('Taggia','Artigianato sotto')[0],'2026-06-25');
assert.deepEqual(dates('San Bartolomeo al Mare','Benefica on'),['2026-05-01']);assert.equal(event('San Bartolomeo al Mare','Benefica on').editions[0].end,'2026-05-02');
assert.deepEqual(dates('Cervo','Nuovamente'),['2026-05-01']);assert.deepEqual(dates('Montegrosso Pian Latte','Montagna'),['2026-07-12']);
assert.equal(event('San Lorenzo al Mare','Expo Valle').editions[0].end,'2026-04-06');assert.deepEqual(dates('Perinaldo','carciofo'),['2026-05-10']);
assert.equal(dates('Diano Marina','Diano Colleziona').length,12);assert.equal(dates('Diano Marina','Diano Colleziona')[9],'2026-10-11');
assert.deepEqual(dates('Pieve di Teco','Mercatino dell’Antiquariato').filter(Boolean),['2026-01-25','2026-10-25']);
assert(event('Sanremo','Mercatino di Coldirodi').editions.every(d=>!d.start));
assert(event('Camporosso','Mercatino hobbisti').editions.every(d=>!d.start));
assert.deepEqual(event('Diano Marina','porto turistico').months,[5,6,7,8,9]);
assert.deepEqual(event('San Bartolomeo al Mare','Mercatino serale').months,[6,7,8,9]);
assert.equal(dates('San Lorenzo al Mare','Mercatini del Mare').length,17);
assert.equal(event('Santo Stefano al Mare','Collezionismo').editions.length,5);
for(const [city,name] of [['Imperia',"Vele d'Epoca"],['Perinaldo','castagnata'],['Ospedaletti','Antiquariato'],['Diano Marina','porto turistico']])assert(event(city,name).editions.every(d=>!d.start),city+' '+name);
assert.equal(events.filter(e=>e.editions.every(d=>d.year===2025)).length,1);assert.deepEqual(dates('Bajardo','Natale Bajocco'),['2025-12-14']);
assert.equal(events.filter(e=>e.pricing).length,2);assert.match(event('Diano Marina','Aromatica').pricing.details,/355 €/);assert.match(event('Diano Marina','Aromatica').pricing.details,/IVA 22%/);assert.match(event('Vessalico','aglio').pricing.details,/giornaliere/);assert.match(event('Vessalico','aglio').pricing.details,/IVA non precisata/);
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
    if(process.env.FIERE_IMPERIA_DATA_ONLY==='1'){console.log('Imperia dati, isolamento e tutte le 197 pagine SSR OK');return;}
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_IMPERIA_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Imperia&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '197');
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
                assert.deepEqual(errors, []); if(process.env.FIERE_IMPERIA_QA_DIR) { fs.mkdirSync(process.env.FIERE_IMPERIA_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_IMPERIA_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => e.pricing || ['Triora','Pieve di Teco','San Lorenzo al Mare'].includes(e.city)).slice(0, 8)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Imperia: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_IMPERIA_OUT) fs.writeFileSync(process.env.FIERE_IMPERIA_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
