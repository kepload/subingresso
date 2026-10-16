// Bolzano/Bozen: evidence, commercial days, fees, unchanged provinces and real UI.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const cp = require('node:child_process');
const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const audit = read('data/fiere-bolzano.json');
const catalog = read('data/fiere.json');
const province = 'Bolzano/Bozen';
const events = catalog.events.filter(e => e.province === province);
const find = (city, name) => {
    const e = events.find(e => e.city === city && e.name === name);
    assert(e, city + ': ' + name); return e;
};
const has = (e, day) => e.editions.some(d => !d.periodOnly && d.start <= day && day <= d.end);
assert.equal(events.length, 207);
assert.equal(new Set(events.map(e => e.city)).size, 73);
assert.equal(audit.research.municipalities.length, 116);
assert.equal(new Set(audit.research.municipalities.map(c => c.city)).size, 116);
assert(audit.research.municipalities.every(c => c.query && c.outcome && c.searchArchive));
assert.equal(audit.research.calendarRows.length, 338);
assert.equal(audit.research.calendarRows.filter(r => r.kind === 'J/A').length, 123);
assert.equal(audit.research.calendarRows.filter(r => r.decision === 'excluded-ordinary-cycle').length, 184);
assert(audit.research.calendarRows.every(r => r.decision));
assert(audit.research.calendar.visualReview);
const baseline = JSON.parse(cp.execFileSync('git', ['show', '3545152:data/fiere.json'], {cwd:root,maxBuffer:20*1024*1024}));
assert.deepEqual(catalog.events.filter(e => e.province !== province), baseline.events.filter(e => e.province !== province));
for (const old of baseline.events.filter(e => e.province === province)) assert(events.some(e => e.id === old.id));
const merano = find('Merano', 'Mercatino di Natale di Merano');
const bressanone = find('Bressanone', 'Mercatino di Natale di Bressanone');
const brunico = find('Brunico', 'Mercatino di Natale di Brunico');
const ortisei = find('Ortisei', 'Nadel Urtijëi, il Paese di Natale');
const renon = find('Renon', 'Trenatale del Renon');
assert(!has(merano, '2026-12-25'));
assert(!has(brunico, '2026-12-25'));
assert(!has(ortisei, '2026-12-25'));
assert(!has(ortisei, '2026-12-02'));
assert(has(ortisei, '2026-12-05'));
assert.equal(renon.editions.length, 20);
assert(has(renon, '2026-12-07'));
assert(has(renon, '2026-12-23'));
assert(!has(renon, '2026-12-24'));
assert.equal(brunico.participation.deadline, '2026-04-30');
assert.equal(bressanone.participation.deadline, '2025-03-16');
assert.equal(merano.participation.deadline, '2024-05-10');
assert.match(merano.pricing.details, /2\.878\/3\.500\/4\.000/);
assert.match(merano.pricing.details, /cauzione separata 2\.500/);
assert.match(bressanone.pricing.details, /IVA 22%/);
assert.equal(find('Bolzano', 'Natale nei Quartieri, piazza Mazzini').participation.deadline, '2026-08-17');
assert(find('Fiè allo Sciliar', 'Mercatino di Natale di Fiè allo Sciliar').editions.every(e => e.year === 2025));
assert.equal(find('Scena', 'Schenner Markt').editions[0].start, '2027-08-20');
assert.equal(find('Merano', 'Merano Flower Festival').editions[0].start, '2027-04-22');
assert.equal(find('Bolzano', 'Hotel').editions[0].start, '2026-10-19');
assert(has(find('Corvara in Badia', 'Marcé da Nadé'), '2026-12-25'));
assert(!has(find('Rasun-Anterselva', 'Natale nel Parco'), '2026-12-31'));
assert.match(find('Bolzano', 'Good Life').pricing.details, /Tutti i prezzi senza IVA/);
assert.match(find('Campo Tures', 'Festival del Formaggio').pricing.details, /450.*600.*IVA/s);
for (const e of events) {
    assert(e.source.checkedAt && e.participation.note);
    assert(!/\uFFFD|[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(JSON.stringify(e)));
    for (const d of e.editions) if (d.start) {
        for (let day = new Date(d.start + 'T12:00:00Z'); day <= new Date(d.end + 'T12:00:00Z'); day.setUTCDate(day.getUTCDate() + 1))
            assert(e.months.includes(day.getUTCMonth() + 1), e.name + ': missing month');
    }
}
const server = http.createServer((req,res) => {
    let file = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1);
    if (!path.extname(file)) file += '.html';
    const full = path.resolve(root, file);
    if (!full.startsWith(root + path.sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', ({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css'})[path.extname(full)] || 'text/plain');
    fs.readFile(full,(err,data) => err ? res.writeHead(404).end() : res.end(data));
});
async function run(engine,label,viewport,base) {
    const browser = await engine.launch();
    try {
        const context = await browser.newContext({viewport});
        await context.route('**/*', route => {
            const u = new URL(route.request().url());
            if (u.origin !== base || /\/js\/(?:auth|supabase-config|page-view-tracker)\.js$/.test(u.pathname)) return route.fulfill({status:200,body:''});
            return route.continue();
        });
        const page = await context.newPage(); const errors=[];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(base + '/fiere?provincia=' + encodeURIComponent(province));
        await page.waitForFunction(n => document.querySelector('#list-count').textContent === String(n), events.length);
        assert.equal(await page.locator('#province-filter').inputValue(), province);
        const markers = await page.locator('#map-markers > g').evaluateAll(nodes => nodes.flatMap(n => n.dataset.events.split(',')).sort());
        assert.deepEqual(markers, events.map(e => e.id).sort());
        await page.locator('#extra-filters > summary').click();
        for (const e of [merano,bressanone,brunico,ortisei,renon,
            find('Brunico','Mercato di Stegona'),find('Bolzano','Good Life'),
            find('Bolzano','Tempo Libero'),find('Bolzano','Klimahouse'),
            find('Corvara in Badia','Marcé da Nadé'),find('Fiè allo Sciliar','Mercatino di Natale di Fiè allo Sciliar'),
            find('Lagundo','Mercatino di Natale di Lagundo'),find('Merano','Merano Flower Festival'),
            find('Campo Tures','Festival del Formaggio')]) {
            await page.locator('#fair-search').fill(e.name);
            await page.locator('.fiere-card[data-event-id="' + e.id + '"] .fiere-card-button').click();
            assert.equal(await page.locator('#detail-title').textContent(), e.name);
            assert.equal(await page.locator('#detail-location').textContent(), e.city + ' · ' + province);
            assert.equal(await page.locator('#detail-source').getAttribute('href'), e.source.url);
            assert.equal(await page.locator('#detail-editions .fiere-edition').count(), e.editions.length);
            if (e.pricing) assert.equal(await page.locator('#detail-costs').textContent(), e.pricing.details);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            await page.locator('#close-detail').click();
        }
        assert.deepEqual(errors,[]);
        console.log(label + ': 207 risultati, mappa e 14 dettagli verificati');
    } finally { await browser.close(); }
}
(async()=>{
    assert(process.env.PLAYWRIGHT_MODULE, 'Usare PLAYWRIGHT_MODULE');
    const pw=require(process.env.PLAYWRIGHT_MODULE);
    let base=process.env.FIERE_TEST_BASE_URL;
    if (!base) { await new Promise(r=>server.listen(0,'127.0.0.1',r)); base='http://127.0.0.1:'+server.address().port; }
    if (process.env.FIERE_TEST_BASE_URL) {
        for (const file of ['data/fiere.json','js/pages/fiere.js','fiere.html']) {
            const response=await fetch(base+'/'+file+'?verify=bolzano-20261016'); assert.equal(response.status,200);
            const published=Buffer.from(await response.arrayBuffer());
            const committed=cp.execFileSync('git',['show','HEAD:'+file],{cwd:root,maxBuffer:20*1024*1024});
            const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
            assert.equal(hash(published),hash(committed),file+' corrisponde al commit');
        }
        console.log('Catalogo, script e pagina online identici al commit');
    }
    await run(pw.chromium,'Chromium computer',{width:1440,height:1000},base);
    await run(pw.chromium,'Chromium telefono',{width:390,height:844},base);
    await run(pw.webkit,'WebKit telefono',{width:390,height:844},base);
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
