// Trento: date commerciali, condizioni economiche e catalogo effettivamente mostrato.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, name), 'utf8'));
const research = read('data/fiere-trento.json');
const catalog = read('data/fiere.json');
const events = catalog.events.filter(e => e.province === 'Trento');
const find = (city, name) => {
    const e = events.find(e => e.city === city && e.name === name);
    assert(e, city + ': ' + name); return e;
};
const contains = (e, day) => e.editions.some(d => d.start <= day && day <= d.end);
assert.equal(events.length, 122);
assert.equal(new Set(events.map(e => e.city)).size, 62);
assert.equal(research.research.municipalities.length, 166);
assert.equal(new Set(research.research.municipalities.map(c => c.city)).size, 166);
assert(research.research.municipalities.every(c => c.query && c.searchArchive && c.outcome));
assert(research.research.exclusions.length >= 8);
assert(research.research.calendar.visualReview);
assert.equal(find('Trento', 'Fiera di San Giuseppe').editions[0].start, '2026-03-15');
assert.equal(find('Cles', 'Fiera di San Rocco').editions[0].start, '2026-08-16');
assert.equal(find('Cles', 'Fiera di maggio').editions[0].start, '2026-05-02');
assert.equal(find('Ossana', 'Fiera di San Michele di Fucine').editions[0].start, '2026-09-27');
assert.equal(find('Rovereto', "Fiera della Festa d'Oro").editions[0].start, '2026-12-20');
assert(!find('Rovereto', 'Fiera di San Marco').editions[0].start);
assert.equal(find('Tione di Trento', 'Fiere del Termen').editions.length, 3);
const ala = find('Ala', 'Natale nei Palazzi Barocchi');
assert.equal(ala.participation.deadline, '2026-10-20');
assert.match(ala.pricing.details, /224.*IVA inclusa/s);
const pomarolo = find('Pomarolo', 'Mercatino di Natale di Pomarolo');
assert.equal(pomarolo.participation.deadline, '2026-10-05');
assert.match(pomarolo.pricing.details, /Cauzione separata 400/);
assert.match(pomarolo.pricing.details, /IVA 22%/);
const ossana = find('Ossana', 'Mercatino di Natale di Ossana');
assert.equal(ossana.participation.deadline, '2026-09-27');
assert.match(ossana.pricing.details, /Cauzione aggiuntiva 100/);
assert.match(ossana.pricing.details, /Regime IVA non esplicitato/);
assert(contains(ossana, '2026-12-25'));
const ciuiga = find('San Lorenzo Dorsino', 'Sagra della Ciuiga, mercatino dei sapori');
assert.equal(ciuiga.editions[0].end, '2026-11-01');
assert.match(ciuiga.participation.note, /somministrazione vietata/);
assert.equal(ciuiga.participation.deadline, '2026-09-04');
assert(!contains(find('Arco', 'Mercatino di Natale di Arco'), '2026-12-25'));
assert(!contains(find('Levico Terme', 'Mercatino di Natale Asburgico'), '2026-12-25'));
assert(!contains(find('Pergine Valsugana', 'Natale a Pergine, mercatino natalizio'), '2026-11-20'));
assert(find('Moena', 'Mercatini di Natale della Fata').editions[0].periodOnly);
assert(!find('Campitello di Fassa', 'Mercatino di Natale di Campitello').editions[0].start);
for (const e of events) {
    assert(e.source.checkedAt && e.participation.note);
    for (const d of e.editions) if (d.start) {
        for (let day = new Date(d.start + 'T12:00:00Z'); day <= new Date(d.end + 'T12:00:00Z'); day.setUTCDate(day.getUTCDate() + 1)) {
            assert(e.months.includes(day.getUTCMonth() + 1), e.name + ': mese mancante');
        }
    }
}
const server = http.createServer((req, res) => {
    let file = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1);
    if (!path.extname(file)) file += '.html';
    const full = path.resolve(root, file);
    if (!full.startsWith(root + path.sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', ({'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css'})[path.extname(full)] || 'text/plain');
    fs.readFile(full, (err, data) => err ? res.writeHead(404).end() : res.end(data));
});
async function run(engine, label, viewport, base) {
    const browser = await engine.launch({headless:true});
    try {
        const context = await browser.newContext({viewport});
        await context.route('**/*', route => {
            const u = new URL(route.request().url());
            // Evita analytics/autenticazione durante la sola lettura del calendario.
            if (u.origin !== base || /\/js\/(?:auth|supabase-config|page-view-tracker)\.js$/.test(u.pathname)) return route.fulfill({status:200,body:''});
            return route.continue();
        });
        const page = await context.newPage();
        const errors = []; page.on('pageerror', e => errors.push(e.message));
        await page.goto(base + '/fiere?provincia=Trento');
        await page.waitForFunction(() => document.querySelector('#list-count').textContent === '122');
        assert.equal(await page.locator('#province-filter').inputValue(), 'Trento');
        const ids = await page.locator('#map-markers > g').evaluateAll(nodes => nodes.flatMap(n => n.dataset.events.split(',')).sort());
        assert.deepEqual(ids, events.map(e => e.id).sort());
        await page.locator('#extra-filters > summary').click();
        for (const e of [ala, pomarolo, ossana, ciuiga,
            find('Trento','Fiera di San Giuseppe'), find('Trento','Mercatino di Natale di Trento'),
            find('Cles','Fiera di San Rocco'), find('Tione di Trento','Fiere del Termen'),
            find('Moena','Mercatini di Natale della Fata'), find('Campitello di Fassa','Mercatino di Natale di Campitello'),
            find('Rovereto','Fiera di San Marco'), find('Riva del Garda','FINE Wine Tourism Marketplace Italy')]) {
            await page.locator('#fair-search').fill(e.name);
            const card = page.locator('.fiere-card[data-event-id="' + e.id + '"]');
            await card.locator('button').click();
            assert.equal(await page.locator('#detail-title').textContent(), e.name);
            assert.equal(await page.locator('#detail-location').textContent(), e.city + ' · Trento');
            assert.equal(await page.locator('#detail-source').getAttribute('href'), e.source.url);
            assert.equal(await page.locator('#detail-editions .fiere-edition').count(), e.editions.length);
            if (e.pricing) assert.equal(await page.locator('#detail-costs').textContent(), e.pricing.details);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            await page.locator('#close-detail').click();
        }
        assert.deepEqual(errors, []);
        console.log(label + ': 122 risultati, mappa, 12 dettagli e costi verificati');
    } finally { await browser.close(); }
}
(async () => {
    const pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    let base = process.env.FIERE_TEST_BASE_URL;
    if (!base) { await new Promise(resolve => server.listen(0,'127.0.0.1',resolve)); base='http://127.0.0.1:' + server.address().port; }
    if (process.env.FIERE_TEST_BASE_URL) {
        const response = await fetch(base + '/data/fiere.json?v=37');
        assert.equal(response.status, 200);
        const hash = data => crypto.createHash('sha256').update(data).digest('hex');
        const published = Buffer.from(await response.arrayBuffer());
        const committed = require('node:child_process').execFileSync('git', ['show','HEAD:data/fiere.json'], {cwd:root,maxBuffer:20*1024*1024});
        assert.equal(hash(published), hash(committed));
        assert.deepEqual(JSON.parse(published.toString('utf8')), catalog);
        console.log('Catalogo online identico al file pubblicato');
    }
    await run(pw.chromium, 'Chromium computer', {width:1440,height:1000}, base);
    await run(pw.chromium, 'Chromium telefono', {width:390,height:844}, base);
    await run(pw.webkit, 'WebKit telefono', {width:390,height:844}, base);
})().catch(e => {console.error(e);process.exitCode=1;}).finally(() => server.close());
