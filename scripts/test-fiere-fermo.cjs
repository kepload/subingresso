// Fermo: preserve existing IDs and other provinces; verify documentary distinctions in data and browser.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-fermo.json'),province=audit.province,research=audit.research;
const baseline=JSON.parse(cp.execFileSync('git',['show',research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province===province);
assert.equal(province,'Fermo');
assert.deepEqual(data.events.filter(e=>e.province!==province),baseline.events.filter(e=>e.province!==province));
assert.equal(events.length,86);assert.equal(data.events.length,7190);assert.equal(new Set(events.map(e=>e.city)).size,31);
assert.equal(baseline.events.filter(e=>e.province===province).length,23);
for(const e of baseline.events.filter(e=>e.province===province))assert(events.some(n=>n.id===e.id),e.id);
assert.equal(research.municipalities.length,40);assert.equal(new Set(research.municipalities.map(e=>e.city)).size,40);
assert.equal(research.regionalRowAudit.length,45);assert.equal(research.regionalMarketRowAudit.length,60);assert.equal(research.specializedRowAudit.length,1);
assert.equal(research.openLeads.length,0);assert.equal(research.closedLeads.length,16);assert.equal(research.exclusions.length,13);assert.equal(research.limits.length,25);
for(const m of research.municipalities){assert(m.sources.length,m.city);assert(m.sourceReceipts.length,m.city);assert.equal(m.events.length,m.eventCount);for(const id of m.events)assert(events.some(e=>e.id===id),id);}
assert.equal(research.sourceReceipts.length,research.statistics.sourceReceipts);
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-25');assert(e.participation.note.length>50,e.name);
 for(const u of e.sourceRecordIds)assert(research.sourceReceipts.some(r=>r.url===u&&(r.status===200||r.alternativeRead)),u);
 for(const d of e.editions){assert(e.sourceRecordIds.includes(d.sourceUrl.split('#')[0]),e.id+' '+d.sourceUrl);if(d.start){assert(d.start<=d.end);let [y,m]=d.start.slice(0,7).split('-').map(Number),[ey,em]=d.end.slice(0,7).split('-').map(Number);while(y<ey||(y===ey&&m<=em)){assert(e.months.includes(m),e.id+' '+m);if(m===12){y++;m=1;}else m++;}}else assert(d.label);}
 if(e.pricing){assert(research.sourceReceipts.some(r=>r.url===e.pricing.sourceUrl&&r.status===200));assert.equal(e.participation.costs,e.pricing.details);assert.match(e.pricing.period,/^20[0-9]{2}$/);}
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.toLowerCase().includes(name.toLowerCase()));assert(e,city+' '+name);return e;};
const dates=(city,name)=>event(city,name).editions.map(d=>d.start).filter(Boolean);
assert(event('Altidona','Fornaciai').editions[0].periodOnly);
assert.deepEqual(dates('Amandola','Diamanti'),['2026-10-31','2026-11-07']);assert.equal(event('Amandola','Diamanti').editions[0].end,'2026-11-01');assert.equal(event('Amandola','Diamanti').participation.deadline,'2026-10-28');assert.match(event('Amandola','Diamanti').pricing.details,/0 €.*soltanto/);
assert.deepEqual(dates('Montegranaro','Serafino'),['2026-10-18']);assert(event('Montegranaro','Giuseppe').editions.every(d=>!d.start));
assert.deepEqual(dates('Montegranaro','Veregra Street'),['2026-06-18']);assert.deepEqual(dates('Montegranaro','Veregra Children'),['2026-06-14']);assert.match(event('Montegranaro','Veregra Street').pricing.details,/600 €.*700 €/);
assert.deepEqual(dates('Monte San Pietrangeli','Biagio'),['2026-02-01']);assert.deepEqual(dates('Monte Urano','Michele'),['2026-05-10']);
assert.deepEqual(dates('Porto San Giorgio','Autunno'),['2026-11-22']);assert.match(event('Porto San Giorgio','Autunno').participation.note,/2025/);
assert.deepEqual(dates("Porto Sant'Elpidio",'Crispino'),['2026-10-25']);assert.match(event("Porto Sant'Elpidio",'Crispino').pricing.details,/150 €.*200 €/);
assert.deepEqual(dates('Fermo','Natale'),['2026-12-08']);assert.match(event('Fermo','Natale').frequencyNote,/7–24/);
assert.deepEqual(dates('Fermo','Tipicità'),['2026-03-06','2027-03-12']);assert.equal(event('Fermo','Tipicità').pricing.period,'2027');assert.equal(event('Fermo','Tipicità').participation.deadline,'2027-01-31');
assert.deepEqual(dates('Fermo','ABC'),['2026-03-18','2026-10-21','2027-03-23']);assert(!event('Fermo','Esotika').pricing);
assert(dates('Fermo','Arte e Sapori – Lido').includes('2026-06-02'));assert(!dates('Fermo','Arte e Sapori – Lido').includes('2026-06-06'));
assert.match(event('Fermo','Antiquariato e dell’Artigianato').hours,/17/);assert.match(event('Fermo','Gran Bazar').venue,/San Tommaso/);
assert.equal(event('Fermo','Curiosando').editions.length,9);assert(dates('Fermo','Curiosando').includes('2026-07-16'));
assert.deepEqual(dates('Monte Rinaldo','Tipicità'),['2026-10-18']);assert.deepEqual(dates('Torre San Patrizio','Antichi Aromi'),['2026-11-08']);assert(event('Monte Giberto','Festa d’Autunno').editions[0].periodOnly);
assert.deepEqual(dates('Porto San Giorgio','Meraviglie'),['2026-08-23']);assert.deepEqual(dates('Porto San Giorgio','Tesori in Strada'),['2025-12-20','2026-07-24']);assert.equal(event('Porto San Giorgio','Tesori in Strada').editions[1].end,'2026-07-26');assert.deepEqual(dates('Porto San Giorgio','Merry Xmas'),['2025-12-20']);
assert.equal(events.filter(e=>e.pricing).length,6);assert(!events.some(e=>/Kodama|Soffitte|Fermhamente|BeOpen/i.test(e.name)));
for(const row of research.regionalRowAudit)assert(events.some(e=>e.id===row.eventId),row.eventId);
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
    if(process.env.FIERE_FERMO_DATA_ONLY==='1'){console.log("Fermo dati, isolamento e tutte le 86 pagine SSR OK");return;}
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_FERMO_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                assert.deepEqual(errors, []); if(process.env.FIERE_FERMO_QA_DIR) { fs.mkdirSync(process.env.FIERE_FERMO_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_FERMO_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => e.pricing || ['Fermo','Amandola','Porto San Giorgio'].includes(e.city)).slice(0, 8)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, "Fermo: catalogo, mappa, dettagli e pagine senza JS OK");
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_FERMO_OUT) fs.writeFileSync(process.env.FIERE_FERMO_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
