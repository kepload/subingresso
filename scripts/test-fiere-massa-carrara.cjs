// Massa-Carrara: originali, conflitti di calendario, costi parziali e isolamento.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-massa-carrara.json'),province='Massa-Carrara',research=audit.research;
const baseline=JSON.parse(cp.execFileSync('git',['show',research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province===province);
assert.deepEqual(data.events.filter(e=>e.province!==province),baseline.events);
assert.equal(baseline.events.filter(e=>e.province===province).length,0);
assert.equal(events.length,117);assert.equal(data.events.length,6845);assert.equal(new Set(events.map(e=>e.city)).size,15);
assert.equal(research.municipalities.length,17);assert.equal(new Set(research.municipalities.map(e=>e.city)).size,17);
for(const m of research.municipalities){assert(m.sources.length,m.city);assert(m.sourceReceipts.length,m.city);assert(m.sources.some(u=>research.sourceReceipts.some(r=>r.url===u&&r.status===200)),m.city);}
assert.equal(research.regionalRowAudit.length,4);assert.equal(research.aefiRowAudit.length,12);assert.equal(research.immRowAudit.length,30);assert.equal(research.territorialRecordAudit.length,113);
for(const group of ['regionalRowAudit','aefiRowAudit','immRowAudit','territorialRecordAudit','municipalities'])for(const row of research[group])for(const id of row.events)assert(events.some(e=>e.id===id),group+' '+id);
assert.equal(research.openLeads.length,0);assert(research.closedLeads.length>=17);assert(research.limits.length>=30);assert(research.exclusions.length>=14);
assert.equal(research.sourceReceipts.length,research.statistics.sourceReceipts);
const retrieved=u=>research.sourceReceipts.some(r=>r.url===u&&r.status===200);
for(const e of events){
 assert.equal(e.source.checkedAt,'2026-10-24');assert(e.participation.note.length>50,e.name);
 for(const u of e.sourceRecordIds)assert(research.sourceReceipts.some(r=>r.url===u),u);
 assert(retrieved(e.source.url)||e.name==='Fiera di San Caprasio',e.source.url);
 for(const d of e.editions){assert(e.sourceRecordIds.includes(d.sourceUrl),d.sourceUrl);if(d.start){assert(d.start<=d.end,e.id);assert(e.months.includes(Number(d.start.slice(5,7))),e.id);}else assert(d.label,e.id);}
 if(e.pricing){assert(retrieved(e.pricing.sourceUrl));assert.equal(e.participation.costs,e.pricing.details);}
}
const event=(city,name)=>{const e=events.find(e=>e.city===city&&e.name.toLowerCase().includes(name.toLowerCase()));assert(e,city+' '+name);return e;};
const dates=(city,name)=>event(city,name).editions.map(d=>d.start).filter(Boolean);
assert.deepEqual(dates('Fivizzano','Disfida'),['2026-07-10']);assert.equal(event('Fivizzano','Disfida').editions[0].end,'2026-07-11');
assert.deepEqual(dates('Casola in Lunigiana','Sagra dei Pomi'),['2026-08-29']);assert.equal(event('Casola in Lunigiana','Sagra dei Pomi').editions[0].end,'2026-08-30');
assert.deepEqual(dates('Fivizzano','Soffitta'),['2026-06-20']);assert.deepEqual(dates('Fosdinovo','Km Zero'),['2026-06-26']);
assert.deepEqual(dates('Carrara','Festival dell’Oriente'),['2026-10-24','2026-10-31']);assert.equal(event('Carrara','Festival dell’Oriente').editions[1].end,'2026-11-01');
assert.deepEqual(dates('Comano','Comano Cavalli'),['2026-09-18']);assert.equal(event('Comano','Comano Cavalli').editions[0].end,'2026-09-20');
assert.deepEqual(dates('Carrara','4x4'),['2026-10-09']);assert.equal(event('Carrara','4x4').editions[0].end,'2026-10-11');
assert.deepEqual(dates('Carrara','Accoglienza'),['2026-06-05','2026-08-10','2026-09-21']);assert(event('Carrara','Accoglienza').editions.every(d=>d.dateType==='calendar'));
assert.deepEqual(dates('Carrara','Tirreno'),['2026-03-01','2027-02-28']);assert.deepEqual(dates('Carrara','Balnearia'),['2026-03-01','2027-02-28']);
assert(event('Carrara','Seatec').editions.every(d=>d.year===2026));
assert.deepEqual(dates('Filattiera','Sant’Orsola'),['2026-10-11']);assert.deepEqual(dates('Filattiera','Castanicoltori'),['2026-03-21']);
assert.deepEqual(dates('Montignoso','San Rocchino'),['2026-08-17']);assert.deepEqual(dates('Massa','San Francesco'),['2026-10-04']);
assert.equal(dates('Bagnone','Mercatino nel Borgo').length,8);assert.deepEqual(dates('Pontremoli','Creatività'),['2026-03-01','2026-10-25','2026-11-01','2026-12-06']);
for(const [city,name] of [['Montignoso','San Vito'],['Montignoso','San Iacopo'],['Montignoso','San Paolino'],['Montignoso','Sant’Eustachio'],['Pontremoli','San Geminiano'],['Filattiera','Fiera del Ponte'],['Massa','Massa Antique'],['Bagnone','Pasquetta']])assert(event(city,name).editions.every(d=>!d.start),city+' '+name);
assert.equal(events.filter(e=>e.editions.every(d=>d.year===2025)).length,17);
assert.equal(events.filter(e=>e.editions.some(d=>d.start)).length,105);
assert.equal(events.filter(e=>e.pricing).length,3);assert.match(event('Comano','Comano Cavalli').pricing.details,/30 €/);assert.match(event('Comano','Comano Cavalli').pricing.details,/IVA non precisata/);
for(const name of ['estivo del Piccolo','natalizio del Piccolo']){const e=event('Massa',name);assert.match(e.pricing.details,/50 €/);assert.match(e.pricing.details,/16 €/);assert.match(e.pricing.details,/Non è il prezzo totale/);assert.equal(e.participation.deadline,'2026-05-30');}
assert.equal(event('Massa','natalizio del Piccolo').editions[0].end,'2026-12-24');
assert(!events.some(e=>/White Carrara|ENCI|Halloween Village/.test(e.name)));
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
    if(process.env.FIERE_MASSA_CARRARA_DATA_ONLY==='1'){console.log('Massa-Carrara dati, isolamento e tutte le 117 pagine SSR OK');return;}
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_MASSA_CARRARA_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.goto(base + '/fiere?provincia=Massa-Carrara&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '117');
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
                assert.deepEqual(errors, []); if(process.env.FIERE_MASSA_CARRARA_QA_DIR) { fs.mkdirSync(process.env.FIERE_MASSA_CARRARA_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_MASSA_CARRARA_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => e.pricing || ['Massa','Carrara','Comano'].includes(e.city)).slice(0, 8)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, 'Massa-Carrara: catalogo, mappa, dettagli e pagine senza JS OK');
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_MASSA_CARRARA_OUT) fs.writeFileSync(process.env.FIERE_MASSA_CARRARA_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
