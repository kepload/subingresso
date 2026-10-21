// Napoli: evidence limits, preserved baseline, operative notices and actual browser catalogue.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-napoli.json');
const baseline=JSON.parse(cp.execFileSync('git',['show','5d405b9:data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province==='Napoli');
assert.deepEqual(data.events.filter(e=>e.province!=='Napoli'),baseline.events.filter(e=>e.province!=='Napoli'));
assert.equal(events.length,76);assert.equal(data.events.length,5653);assert.equal(new Set(events.map(e=>e.city)).size,28);
assert.equal(audit.research.municipalities.length,92);assert.equal(new Set(audit.research.municipalities.map(e=>e.city)).size,92);
assert(audit.research.municipalities.every(e=>e.searchReceipts.length&&e.homeAttempt.url));
assert.equal(audit.research.venueRowAudit.length,125);assert.equal(audit.research.openLeads.length,0);
assert(audit.research.exclusions.length>=36);assert(audit.research.sourceReceipts.length>=300);
assert.equal(events.filter(e=>e.pricing).length,10);
for(const e of baseline.events.filter(e=>e.province==='Napoli'))assert(events.some(x=>x.id===e.id),e.id);
for(const e of events){assert.equal(e.source.checkedAt,'2026-10-21');assert(e.participation.note.length>60);for(const u of e.sourceRecordIds)assert(audit.research.sourceReceipts.some(r=>r.url===u),u);}
const event=(city,name)=>events.find(e=>e.city===city&&e.name.includes(name));
assert.equal(event('Napoli','Chocoland').editions[0].start,'2026-10-28');
assert.equal(event('Napoli','MED EXHIBIT PRINT').editions[0].start,'2026-04-17');
assert.equal(event('Napoli','TUTTO SPOSI').editions.length,2);
assert.equal(event('Napoli','Baratto').editions.length,2);
assert.equal(event('Napoli','NapoliVinile').editions[1].start,'2027-03-12');
assert.equal(event('Pozzuoli','Pizza Village').editions[0].start,'2026-07-07');
assert(!events.some(e=>e.city==='Napoli'&&e.name==='Napoli Pizza Village'));
assert.equal(event('Ercolano','Exotic').venue,'Complesso Zeno, via Trentola II');
assert.equal(event('Piano di Sorrento','Costiera').venue,'Mercato ortofrutticolo coperto cittadino, area di piazza della Repubblica');
assert.equal(event('Piano di Sorrento','San Michele').editions[0].end,'2026-09-29');
assert.equal(event("Sant'Agnello",'Fiera di').participation.deadline,'2026-11-01');
assert.match(event('Agerola','Fiera').pricing.details,/4 €/);
assert.match(event("Sant'Antonio Abate",'Fiera').pricing.details,/3 €/);
assert(event("Sant'Anastasia",'Madonna').editions.some(d=>d.start==='2026-09-10'));
assert(event("Sant'Anastasia",'Madonna').editions.some(d=>d.start==='2026-09-19'));
assert.equal(event('Somma Vesuviana','Fiera').participation.deadline,'2026-03-26');
assert.match(event('Somma Vesuviana','Fiera').participation.note,/nessuna spunta/);
assert.match(event('Portici','Pietrarsa').pricing.details,/1.400/);
assert.match(event('Portici','Pietrarsa').pricing.details,/20 novembre 2025/);
assert(event('Portici','Pietrarsa').editions.every(d=>d.periodOnly));
assert.equal(event('Frattamaggiore','prodotti natalizi').editions[0].year,2025);
for(const [city,name] of [['Lettere','Natale'],['Ottaviano','Castello'],['Forio','San Vito'],['Capri','San Costanzo'],['Napoli','Saporitissimo']])assert(event(city,name).editions.every(d=>!d.start),city+' '+name);
assert(!event('San Gennaro Vesuviano','Vesuviana').editions.some(d=>d.year===2026&&d.start));
assert.equal(event('Torre Annunziata','Paniere').editions[0].end,'2026-06-30');
assert(!events.some(e=>/Mercato di Resina|ORIENTASUD|SALONE DELLO STUDENTE|FUTURIAMO|Dohrn|Antignano/i.test(e.name)));
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
    const base = process.env.FIERE_NAPOLI_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Napoli&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '76');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.deepEqual(await page.locator('.fiere-card').evaluateAll(es => es.map(e => e.dataset.eventId).sort()), events.map(e => e.id).sort());
                await page.waitForFunction(() => document.querySelector('#map-markers').children.length > 0);
                assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(es => es.flatMap(e => e.dataset.events.split(',')).sort()), events.map(e => e.id).sort());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                const dialogs = [...events.filter(e => e.pricing), ...events.filter(e => ['Forio', 'Ottaviano', 'Lettere', 'San Gennaro Vesuviano'].includes(e.city))];
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
                assert.deepEqual(errors, []); await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => ['Napoli', 'Portici', 'Arzano'].includes(e.city)).slice(0, 4)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Napoli: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_NAPOLI_OUT) fs.writeFileSync(process.env.FIERE_NAPOLI_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
