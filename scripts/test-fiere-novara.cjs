// Provincial regressions: documented days, admission terms, exclusions and live UI.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const catalog = read('data/fiere.json');
const audit = read('data/fiere-novara.json');
const events = catalog.events.filter(e => e.province === 'Novara');
const event = (city, name) => {
    const found = events.find(e => e.city === city && e.name.includes(name));
    assert(found, city + ': ' + name); return found;
};
assert.equal(events.length, 71);
assert.equal(audit.events.length, 71);
assert.deepEqual(audit.research.municipalityCoverage.map(c => c.city).sort(), read('data/comuni.json').filter(c => c.provincia === 'Novara').map(c => c.nome).sort());
assert.equal(audit.research.regionalRecordAudit.length, 25);
assert.equal(new Set(audit.research.atlRecordAudit.map(r => r.recordId)).size, 261);
assert.equal(events.filter(e => e.participation.deadline).length, 6);
assert.equal(events.filter(e => Object.keys(e.contacts || {}).length).length, 45);
assert.equal(event('Ameno', 'Natale').participation.deadline, '2026-10-30');
assert.deepEqual(event('Ameno', 'Natale').editions.map(d => d.start), ['2026-11-14','2026-11-15']);
const ghemme = event('Ghemme', 'Natale nelle Cantine');
assert.equal(ghemme.participation.deadline, '2026-11-15');
assert.equal(ghemme.participation.type, 'selected');
assert.match(ghemme.participation.costs, /20.*30.*35.*50.*100.*130/);
assert.match(ghemme.participation.note, /soltanto via WhatsApp/);
assert.deepEqual(ghemme.editions.map(d => d.start), ['2026-12-06','2026-12-07','2026-12-08']);
const prato = event('Prato Sesia', 'Mercatino di Natale');
assert.equal(prato.participation.deadline, '2026-12-11');
assert.match(prato.participation.costs, /10.*20.*Nessun allaccio/);
assert.match(prato.participation.note, /Esclusi antiquariato, libri/);
assert.equal(event('Prato Sesia', "Mercatino d'Autunno").participation.deadline, '2026-10-10');
assert.equal(event('Armeno', 'Primavera').participation.deadline, '2026-03-31');
assert.equal(event('Armeno', 'Zootecnica').participation.deadline, '2026-09-20');
assert.equal(event('Fontaneto d\'Agogna', 'Cipolla').editions[0].start, '2026-09-20');
assert.equal(event('Grignasco', 'Art & Food').editions[0].start, '2026-10-11');
assert.equal(event('Nebbiuno', 'polenta').editions[0].start, '2026-09-06');
assert.equal(event('Novara', 'Exporice').editions[0].start, '2026-05-24');
assert.equal(event('Trecate', 'polenta').editions[0].start, '2026-10-11');
assert.equal(event('Pella', 'artigianato').editions.at(-1).start, '2026-09-06');
const lesaDates = event('Lesa', 'Creativi').editions.map(d => d.start);
assert.equal(lesaDates.length, 13);
assert(lesaDates.includes('2026-08-22'));
assert(!lesaDates.includes('2026-08-23') && !lesaDates.includes('2026-09-27'));
assert(event('Novara', 'Fiorissimo').editions.some(d => d.start === '2027-04-02'));
assert(event('Meina', 'Balocchi').editions.every(d => d.year === 2025));
assert.equal(event('Borgomanero', 'Roba Végia').editions.length, 0);
assert(event('Ghemme', 'Mostra Mercato Ghemme').editions.every(d => !d.start));
assert(!events.some(e => e.city === 'Cureggio' || e.city === 'Romentino'));
assert(audit.research.exclusionsAndUnresolved.some(r => r.city === 'Cureggio' && /annullato/.test(r.reason)));
assert.match(event('Novara', 'Fiera di Novembre').venue, /Bellini.*Azeglio.*Brera/);
assert.equal(event('Gattico-Veruno', 'Curiosando').lat, 45.6924818);
assert.match(event('Gattico-Veruno', 'Curiosando').coordinateSource.url, /Id=31783/);
for (const e of events) {
    assert(!Array.isArray(e.contacts));
    assert(!e.participation.applicationUrl);
    assert(!/[\u0000-\u0008\ufffd]/.test(JSON.stringify(e)));
    assert(!/[ÃĂ]/.test([e.name,e.venue,e.organizer].join(' ')));
}
console.log('Novara data: 71 events, 87 municipalities, 25 regional rows, 261 ATL details; admission, dates and exclusions passed.');
if (process.argv.includes('--data-only')) process.exit(0);

const types = {'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.svg':'image/svg+xml','.png':'image/png'};
const server = http.createServer((req,res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(root, pathname === '/fiere' ? 'fiere.html' : '.' + pathname);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'}); fs.createReadStream(file).pipe(res);
});
(async () => {
    const playwright = require(process.env.PLAYWRIGHT_MODULE);
    let base = process.env.FIERE_BASE_URL;
    if (!base) { await new Promise(resolve => server.listen(0, '127.0.0.1', resolve)); base = 'http://127.0.0.1:' + server.address().port; }
    const checks = [];
    try {
        for (const [engine, viewport] of [['chromium',{width:1440,height:1000}],['chromium',{width:390,height:844}],['webkit',{width:390,height:844}]]) {
            const browser = await playwright[engine].launch({headless:true});
            try {
                const page = await browser.newPage({viewport}); const errors = [];
                page.on('pageerror', error => errors.push(error.message));
                // Third-party analytics/auth are outside the calendar test.
                await page.route('**/*', route => {
                    const url = new URL(route.request().url());
                    if (['/js/supabase-config.js','/js/page-view-tracker.js','/js/auth.js'].includes(url.pathname)) return route.fulfill({status:200,body:''});
                    return url.origin === new URL(base).origin ? route.continue() : route.fulfill({status:200,body:''});
                });
                const response = await page.goto(base + '/fiere?provincia=Novara', {waitUntil:'domcontentloaded'});
                assert.equal(response.status(), 200);
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '71');
                await page.waitForFunction(() => document.querySelectorAll('#map-provinces > *').length === 110);
                assert.equal(await page.locator('#province-filter').inputValue(), 'Novara');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.equal(await page.locator('#fair-list article').count(), 71);
                const markers = await page.locator('#map-markers > g').evaluateAll(nodes => nodes.flatMap(n => n.dataset.events.split(',')));
                assert.deepEqual(markers.sort(), events.map(e => e.id).sort());
                for (const e of [ghemme,prato,event('Ameno','Natale'),event('Armeno','Zootecnica'),event('Lesa','Creativi'),event('Novara','Fiorissimo'),event('Trecate','Agricola'),event('Borgomanero','Roba Végia'),event('Gattico-Veruno','Curiosando'),event('Novara','Fiera di Novembre')]) {
                    await page.locator('[data-event-id="' + e.id + '"] button').click();
                    await page.locator('#fair-dialog').waitFor({state:'visible'});
                    assert.equal(await page.locator('#detail-title').textContent(), e.name);
                    assert.equal(await page.locator('#detail-source').getAttribute('href'), e.source.url);
                    assert.equal(await page.locator('#detail-participation-note').textContent(), e.participation.note);
                    if (e.participation.url) assert.equal(await page.locator('#detail-participation-link').getAttribute('href'), e.participation.url);
                    if (e.participation.costs) assert.equal(await page.locator('#detail-costs').textContent(), e.participation.costs);
                    if (e.participation.deadline) assert.match(await page.locator('#detail-deadline').textContent(), /[0-9]/);
                    assert.equal(await page.locator('#detail-editions > div').count(), e.editions.length);
                    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                    await page.locator('#close-detail').click();
                }
                assert.deepEqual(errors, []);
                checks.push({engine,viewport,count:71,details:10,errors});
                console.log(engine + ' ' + viewport.width + ': Novara list, map, 10 details and overflow passed.');
            } finally { await browser.close(); }
        }
        if (process.env.FIERE_VERIFICATION_FILE) fs.writeFileSync(process.env.FIERE_VERIFICATION_FILE, JSON.stringify({base,checkedAt:new Date().toISOString(),checks},null,2));
    } finally { if (server.listening) await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); if (server.listening) server.close(); process.exitCode = 1; });
