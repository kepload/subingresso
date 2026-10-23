// Biella: provincial isolation, original evidence, dates, fees and browser publication.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-biella.json');
const baseline=JSON.parse(cp.execFileSync('git',['show',audit.research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province==='Biella');
assert.deepEqual(data.events.filter(e=>e.province!=='Biella'),baseline.events.filter(e=>e.province!=='Biella'));
assert.equal(events.length,61);assert.equal(data.events.length,6278);assert.equal(new Set(events.map(e=>e.city)).size,26);
for(const e of baseline.events.filter(e=>e.province==='Biella'))assert(events.some(n=>n.id===e.id),e.id);
assert.equal(audit.research.municipalities.length,74);assert.equal(new Set(audit.research.municipalities.map(e=>e.city)).size,74);
for(const m of audit.research.municipalities){assert(m.sources.length,m.city);assert(m.sourceReceipts.length,m.city);}
assert.equal(audit.research.openLeads.length,0);assert.equal(audit.research.regionalRowAudit.length,27);
assert(audit.research.sourceReceipts.length>=640);assert(audit.research.limits.length>=20);assert(audit.research.exclusions.length>=15);
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-23');assert(e.participation.note.length>50,e.name);
 for(const u of e.sourceRecordIds)assert(audit.research.sourceReceipts.some(r=>r.url===u),u);
 for(const d of e.editions)assert(e.sourceRecordIds.includes(d.sourceUrl),d.sourceUrl);
 if(e.pricing){assert(e.sourceRecordIds.includes(e.pricing.sourceUrl));assert.equal(e.participation.costs,e.pricing.details);}
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.toLowerCase().includes(name.toLowerCase()));assert(e,city+' '+name);return e;};
const dates=(city,name)=>event(city,name).editions.map(d=>d.start).filter(Boolean);
assert.equal(dates('Biella','Agroalimentare').length,25);
assert.deepEqual(dates('Biella','Riva'),['2026-03-29','2026-06-28','2026-09-27']);
assert.deepEqual(dates('Biella','Bolle'),['2026-09-03']);assert.equal(event('Biella','Bolle').editions[0].end,'2026-09-07');assert.match(event('Biella','Bolle').participation.note,/4–6 settembre/);
assert.deepEqual(dates('Borriana','Zootecnica'),['2026-10-24']);assert.equal(event('Borriana','Zootecnica').participation.deadline,'2026-10-19');assert.equal(event('Borriana','Zootecnica').pricing.kind,'partial');
assert.deepEqual(dates('Borriana','Natale'),['2026-12-19']);assert.equal(event('Borriana','Natale').participation.deadline,'2026-12-10');assert.match(event('Borriana','Natale').participation.note,/errato/);assert.match(event('Borriana','Natale').pricing.details,/15 €/);
assert.equal(dates('Candelo','Babbo Natale').length,10);assert(!events.some(e=>/candelo in fiore/i.test(e.name)));
assert.deepEqual(dates('Cerrione','Giorgio'),['2026-04-26']);assert.match(event('Cerrione','Giorgio').participation.note,/9:30/);
assert.deepEqual(dates('Cossato','Rocco'),['2026-08-16']);assert.deepEqual(dates('Cossato','Orizzont'),['2026-06-27']);
assert.deepEqual(dates('Graglia','Primaverile'),['2026-05-03']);assert.deepEqual(dates('Graglia','Toma'),['2026-10-25']);
assert.match(event('Masserano','Antiquariato').participation.note,/refuso/);assert.equal(event('Masserano','Beltane').editions[0].dateType,'calendar');assert.match(event('Masserano','Beltane').participation.note,/ridotta/);
assert.deepEqual(dates('Pollone','Cielo'),['2026-05-17']);assert.match(event('Pollone','Cielo').pricing.details,/50 € \+ IVA/);
assert.deepEqual(dates('Pray','Vetrina'),['2026-09-19']);assert.equal(event('Pray','Vetrina').editions[0].end,'2026-09-20');
assert.deepEqual(dates('Ronco Biellese','Pailet'),['2026-10-04']);assert.deepEqual(dates('Sala Biellese','Martino'),['2026-11-08']);
assert.deepEqual(dates('Sordevolo','Angeli'),['2026-11-15','2026-11-22','2026-11-29','2026-12-06','2026-12-08','2026-12-13']);assert.match(event('Sordevolo','Angeli').pricing.details,/70 €\/giorno o 350 €/);assert.match(event('Sordevolo','Angeli').pricing.details,/95 €\/giorno o 475 €/);
assert.deepEqual(dates('Valdilana','Macagn'),['2026-09-27']);assert.deepEqual(dates('Valdilana','Presepe'),['2026-11-29']);assert.match(event('Valdilana','Presepe').pricing.details,/10 €/);assert.match(event('Valdilana','Presepe').participation.note,/10 professionisti/);
for(const e of events.filter(e=>e.city==='Valdilana')){assert(Number.isFinite(e.lat));assert(e.coordinateSource.label.includes('non posizione degli stalli'));}
assert.deepEqual(dates('Vigliano Biellese','Vigna'),['2026-10-11']);assert.deepEqual(dates('Viverone','Hobbisti'),['2026-06-07','2026-10-04']);assert.deepEqual(dates('Viverone','Arte'),['2026-04-19','2026-05-10','2026-06-21']);
assert.equal(events.filter(e=>e.pricing).length,5);assert.equal(events.filter(e=>e.editions.every(d=>d.year===2025)).length,8);
assert(event('Biella','Cuore').editions[0].periodOnly);assert(event('Biella','Brocanterie').editions.every(d=>!d.start));
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
    const base = process.env.FIERE_BI_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Biella&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '61');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                const dialogs = events.filter(e => e.pricing || ['Biella', 'Borriana', 'Valdilana', 'Viverone', 'Masserano'].includes(e.city));
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
                assert.deepEqual(errors, []); if(process.env.FIERE_BI_QA_DIR) { fs.mkdirSync(process.env.FIERE_BI_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_BI_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => ['Borriana', 'Sordevolo', 'Valdilana'].includes(e.city)).slice(0, 4)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Biella: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_BI_OUT) fs.writeFileSync(process.env.FIERE_BI_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
