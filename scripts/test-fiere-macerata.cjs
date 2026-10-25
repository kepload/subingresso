const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-macerata.json'),province=audit.province,research=audit.research;
const baseline=JSON.parse(cp.execFileSync('git',['show',research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province===province);
assert.equal(province,'Macerata');
assert.deepEqual(data.events.filter(e=>e.province!==province),baseline.events.filter(e=>e.province!==province));
assert.equal(events.length,177);assert.equal(data.events.length,7127);assert.equal(new Set(events.map(e=>e.city)).size,47);
assert.equal(baseline.events.filter(e=>e.province===province).length,61);
for(const e of baseline.events.filter(e=>e.province===province))assert(events.some(n=>n.id===e.id));
assert.equal(research.municipalities.length,55);assert.equal(new Set(research.municipalities.map(e=>e.city)).size,55);
assert.equal(research.regionalRowAudit.length,121);assert.equal(research.specializedRowAudit.length,5);assert.equal(research.openLeads.length,0);
assert.equal(research.closedLeads.length,30);assert.equal(research.limits.length,33);assert.equal(research.exclusions.length,20);
for(const m of research.municipalities){assert(m.sources.length,m.city);assert(m.sourceReceipts.length,m.city);for(const id of m.events)assert(events.some(e=>e.id===id));}
assert.equal(research.sourceReceipts.length,research.statistics.sourceReceipts);
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-25');assert(e.participation.note.length>50,e.name);
 for(const u of e.sourceRecordIds)assert(research.sourceReceipts.some(r=>r.url===u&&(r.status===200||r.alternativeRead)),u);
 for(const d of e.editions){assert(e.sourceRecordIds.includes(d.sourceUrl));if(d.start){assert(d.start<=d.end);let [y,m]=d.start.slice(0,7).split('-').map(Number),[ey,em]=d.end.slice(0,7).split('-').map(Number);while(y<ey||(y===ey&&m<=em)){assert(e.months.includes(m),e.id+' '+m);if(m===12){y++;m=1;}else m++;}}else assert(d.label);}
 if(e.pricing){assert(research.sourceReceipts.some(r=>r.url===e.pricing.sourceUrl&&r.status===200));assert.equal(e.participation.costs,e.pricing.details);}
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.toLowerCase().includes(name.toLowerCase()));assert(e,city+' '+name);return e;};
const dates=(city,name)=>event(city,name).editions.map(d=>d.start).filter(Boolean);
assert.deepEqual(dates('Camerino',"sant'antonio"),['2026-01-17']);
assert.deepEqual(dates('Castelraimondo','Infiorata'),['2026-06-05']);assert.equal(event('Castelraimondo','Infiorata').editions[0].end,'2026-06-07');
assert.deepEqual(dates('Castelraimondo','Festività'),['2026-06-02']);
assert.deepEqual(dates('Macerata','San Giuliano'),['2026-08-30']);assert.equal(event('Macerata','San Giuliano').editions[0].end,'2026-08-31');
assert.deepEqual(dates('Porto Recanati',"apertura dell'estate"),['2026-06-21']);
assert.deepEqual(dates('Porto Recanati','Corso Matteotti'),['2026-09-06']);assert.match(event('Porto Recanati','Corso Matteotti').participation.note,/26 luglio è stato annullato/);
assert.deepEqual(dates('Sarnano','Patrono'),['2026-08-15']);assert.deepEqual(dates('Sarnano','Assunta'),['2026-08-16']);
assert.deepEqual(dates('Macerata','Caccia'),['2026-02-28','2026-11-21']);
assert.deepEqual(dates('Bolognola','Filiera'),['2026-10-11']);
assert.deepEqual(dates('Monte San Martino','Mela Rosa'),['2026-11-07']);assert.match(event('Monte San Martino','Mela Rosa').hours,/8:30/);
assert.deepEqual(dates('Recanati','InChiostri'),['2026-03-21']);assert.equal(event('Recanati','L’Antico').editions[0].start,undefined);
assert(event('Macerata','Cibaria').editions.every(d=>d.dateType==='calendar'&&d.periodOnly));
assert(event('Macerata','Mielemente').editions.every(d=>d.year===2026&&d.start==='2026-12-05'&&d.dateType==='calendar'));
assert(event('Petriolo','San Martino').editions.every(d=>!d.start&&d.dateType==='calendar'));
assert.deepEqual(dates('Pollenza','Natale in Piazza'),['2025-12-14']);assert.equal(event('Pollenza','Natale in Piazza').pricing.kind,'conditional');
assert.equal(event('Pollenza','Fiera di primavera').pricing.period,'2025');
assert.match(event('Macerata','Epicomics').pricing.details,/45 .*minimo 2/);assert.match(event('Macerata','Epicomics').pricing.details,/105/);assert.equal(event('Macerata','Epicomics').pricing.kind,'partial');
assert.equal(event('Montefano','Conca').stallCount,50);assert.equal(event('Montefano','Conca').participation.deadline,'2026-04-04');
assert.equal(event('Montefano',"Sapori d'autunno").participation.deadline,'2026-08-24');assert.match(event('Montefano',"Sapori d'autunno").pricing.details,/25 .*10 /);
assert.match(event('Appignano','Leguminaria').pricing.details,/40 .*60 /);assert.equal(event('Appignano','Leguminaria').participation.deadline,'2026-08-31');
assert.equal(event('Pieve Torina','Paese dei Balocchi').editions.length,18);assert.equal(events.filter(e=>e.pricing).length,6);
assert(!events.some(e=>/car boot|fiera franca|fiera di natale$/i.test(e.name)));
assert.equal(research.regionalRowAudit.filter(r=>r.eventId===null).length,1);
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
    if(process.env.FIERE_MACERATA_DATA_ONLY==='1'){console.log("Macerata dati, isolamento e tutte le 177 pagine SSR OK");return;}
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_MACERATA_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '177');
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
                assert.deepEqual(errors, []); if(process.env.FIERE_MACERATA_QA_DIR) { fs.mkdirSync(process.env.FIERE_MACERATA_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_MACERATA_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => e.pricing || ['Macerata','Montefano','Appignano'].includes(e.city)).slice(0, 8)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, "Macerata: catalogo, mappa, dettagli e pagine senza JS OK");
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_MACERATA_OUT) fs.writeFileSync(process.env.FIERE_MACERATA_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
