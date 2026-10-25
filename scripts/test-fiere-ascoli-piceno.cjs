// Ascoli Piceno: preserve existing IDs and other provinces; verify documentary distinctions in data and browser.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const data=read('data/fiere.json'),audit=read('data/fiere-ascoli-piceno.json'),province=audit.province,research=audit.research;
const baseline=JSON.parse(cp.execFileSync('git',['show',research.baselineCommit+':data/fiere.json'],{cwd:root,maxBuffer:25*1024*1024}));
const events=data.events.filter(e=>e.province===province);
assert.equal(province,'Ascoli Piceno');
assert.deepEqual(data.events.filter(e=>e.province!==province),baseline.events.filter(e=>e.province!==province));
assert.equal(events.length,98);assert.equal(data.events.length,7249);assert.equal(new Set(events.map(e=>e.city)).size,29);
assert.equal(baseline.events.filter(e=>e.province===province).length,39);
for(const e of baseline.events.filter(e=>e.province===province))assert(events.some(n=>n.id===e.id),e.id);
assert.equal(research.municipalities.length,33);assert.equal(new Set(research.municipalities.map(e=>e.city)).size,33);
assert.deepEqual(research.municipalities.map(m=>m.city).sort(),read('data/comuni.json').filter(c=>c.provincia===province).map(c=>c.nome).sort());
assert.deepEqual(research.municipalities.flatMap(m=>m.events).sort(),events.map(e=>e.id).sort());
assert.equal(research.municipalities.filter(m=>m.eventCount===0).length,4);
assert.equal(research.regionalRowAudit.length,89);assert.equal(research.regionalMarketRowAudit.length,112);assert.equal(research.specializedRowAudit.length,3);
assert.equal(research.openLeads.length,0);assert(research.closedLeads.length>=20);assert(research.exclusions.length>=12);assert(research.limits.length>=25);
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
assert.equal(data.eventsWithEditionData,7050);
assert.deepEqual(dates('Grottammare','San Martino'),['2026-11-10']);assert.equal(event('Grottammare','San Martino').editions[0].end,'2026-11-11');assert.equal(event('Grottammare','San Martino').stallCount,378);assert.match(event('Grottammare','San Martino').participation.note,/non sono 378 posti liberi/);assert.match(event('Grottammare','San Martino').pricing.details,/90 €.*109 €/);
assert.deepEqual(dates('Spinetoli','immacolata'),['2026-12-08']);assert.equal(event('Spinetoli','immacolata').stallCount,12);assert.equal(event('Spinetoli','immacolata').participation.deadline,'2026-11-13');
assert.deepEqual(dates('Spinetoli','Pagliare'),['2026-10-11']);assert.equal(event('Spinetoli','Pagliare').stallCount,217);
assert.deepEqual(dates('Comunanza','ornitologica'),['2026-10-04']);assert.equal(event('Comunanza','ornitologica').stallCount,238);assert.deepEqual(dates('Comunanza','caterina'),['2026-11-29']);assert.equal(event('Comunanza','caterina').stallCount,60);assert(!event('Comunanza','caterina').pricing);
assert.deepEqual(dates('Colli del Tronto','Piante'),['2026-03-01']);
assert.deepEqual(dates('Castel di Lama','Crocifisso'),['2026-09-03']);assert.equal(event('Castel di Lama','Crocifisso').editions[0].end,'2026-09-06');assert.match(event('Castel di Lama','Crocifisso').pricing.details,/IVA/);
assert.deepEqual(dates('Ascoli Piceno','Natale'),['2026-12-20']);assert(!event('Ascoli Piceno','Natale').pricing);assert.match(event('Ascoli Piceno','Natale').participation.note,/10 €.*istruttoria/);
assert.equal(event('Ascoli Piceno','antiquario').editions.length,9);assert(!dates('Ascoli Piceno','antiquario').some(d=>d.startsWith('2026-02')));
assert.deepEqual(dates('Ascoli Piceno','Fritto Misto'),['2026-04-24','2026-04-29']);assert.equal(event('Ascoli Piceno','Fritto Misto').editions[0].end,'2026-04-26');assert.deepEqual(dates('Ascoli Piceno','Ascoliva'),['2026-08-08']);assert.equal(event('Ascoli Piceno','Ascoliva').editions[0].end,'2026-08-19');
assert.deepEqual(dates('Montemonaco','Sagra mercato'),['2026-10-24']);assert.equal(event('Montemonaco','Sagra mercato').editions[0].end,'2026-10-25');assert.equal(event('Montegallo','Fiera di balzo').editions.length,7);assert(!event('Montegallo','Sagra della castagna').editions.some(d=>d.start));
assert.deepEqual(dates('San Benedetto del Tronto','Madonna'),['2026-07-25']);assert.equal(event('San Benedetto del Tronto','Madonna').stallCount,115);assert.match(event('San Benedetto del Tronto','Madonna').participation.note,/unicamente sabato/);
assert.deepEqual(dates('San Benedetto del Tronto','Antico e le Palme'),['2026-01-03','2026-04-04','2026-06-26','2026-08-21']);
assert.deepEqual(dates('Acquasanta Terme','Autunno'),['2026-10-17']);assert.equal(event('Acquasanta Terme','Autunno').participation.deadline,'2026-10-09');assert.match(event('Acquasanta Terme','Autunno').pricing.details,/100 €.*50 €/);
assert.deepEqual(dates('Acquaviva Picena','Sponsalia'),['2027-08-05','2027-08-06']);
assert.deepEqual(dates('Cupra Marittima','Fiera di Cupra'),['2026-05-31']);assert(event('Cupra Marittima','Mercatini estivi').editions[0].periodOnly);assert(event('Cupra Marittima','calzatura').editions[0].periodOnly);
assert(event('Grottammare','De LeGrotte').editions[0].periodOnly);assert.match(event('Grottammare','De LeGrotte').participation.note,/minor numero di presenze/);assert.match(event('Grottammare','De LeGrotte').pricing.details,/275/);
assert.deepEqual(dates('Massignano','Bio e Terracotta'),['2026-07-11']);assert.deepEqual(dates('Massignano','capoluogo'),['2025-12-07']);assert.deepEqual(dates('Massignano','Villa Santi'),['2025-12-21']);
assert.deepEqual(dates('San Benedetto del Tronto','Francese'),['2025-08-29']);assert(event('San Benedetto del Tronto','Christmas').editions[0].periodOnly);assert.deepEqual(dates('Folignano','LibrArte'),['2026-05-06']);
assert.deepEqual(dates('Roccafluvione','delle piante'),['2026-03-08']);assert.match(event('Roccafluvione','delle piante').hours,/8:15/);assert.match(event('Roccafluvione','delle piante').pricing.details,/40 €.*50 €.*20 €/);assert.match(event('Roccafluvione','delle piante').pricing.details,/Non è chiarito/);
assert.equal(events.filter(e=>e.pricing).length,5);assert(!events.some(e=>/Templaria|Ponte d.Arli|Bianco d.Autore|Gnè|Saharawi/i.test(e.name)));
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
    if(process.env.FIERE_ASCOLI_PICENO_DATA_ONLY==='1'){console.log("Ascoli Piceno dati, isolamento e tutte le 98 pagine SSR OK");return;}
    assert(process.env.PLAYWRIGHT_MODULE, 'PLAYWRIGHT_MODULE richiesto');
    const pw = require(process.env.PLAYWRIGHT_MODULE), results = [];
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    const base = process.env.FIERE_ASCOLI_PICENO_BASE_URL || 'http://127.0.0.1:' + server.address().port;
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
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '98');
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
                assert.deepEqual(errors, []); if(process.env.FIERE_ASCOLI_PICENO_QA_DIR) { fs.mkdirSync(process.env.FIERE_ASCOLI_PICENO_QA_DIR,{recursive:true}); await page.screenshot({path:path.join(process.env.FIERE_ASCOLI_PICENO_QA_DIR,engine+'-'+width+'.png')}); } await context.close();
                const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height: 900 } }), q = await nojs.newPage();
                for (const e of events.filter(e => e.pricing || ['Ascoli Piceno','Grottammare','Acquasanta Terme'].includes(e.city)).slice(0, 8)) {
                    const response = await q.goto(base + '/fiere/' + e.id); assert.equal(response.status(), 200);
                    assert((await q.locator('h1').innerText()).replace(/\s+/g, ' ').includes(e.name.replace(/\s+/g, ' ')));
                    assert(await q.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                }
                await nojs.close(); results.push({ engine, width, events: events.length, dialogs: dialogs.length, base, status: 'passed' });
                console.log(engine, width, "Ascoli Piceno: catalogo, mappa, dettagli e pagine senza JS OK");
            } finally { await browser.close(); }
        }
    } finally {
        server.close();
        if (process.env.FIERE_ASCOLI_PICENO_OUT) fs.writeFileSync(process.env.FIERE_ASCOLI_PICENO_OUT, JSON.stringify(results, null, 2));
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
