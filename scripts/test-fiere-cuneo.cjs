// Cuneo: source conflicts, separate commercial days, admission terms and live catalogue.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const catalog = read('data/fiere.json');
const audit = read('data/fiere-cuneo.json');
const events = catalog.events.filter(e => e.province === 'Cuneo');
const event = (city, name) => {
    const found = events.find(e => e.city === city && e.name.includes(name));
    assert(found, city + ': ' + name); return found;
};
const dates = e => e.editions.map(d => d.start);
assert.equal(events.length, 173);
assert.equal(audit.events.length, 173);
assert.deepEqual(audit.research.municipalityCoverage.map(c => c.city).sort(), read('data/comuni.json').filter(c => c.provincia === 'Cuneo').map(c => c.nome).sort());
assert.equal(audit.research.regionalRecordAudit.length, 160);
assert.equal(new Set(audit.research.atlRecordAudit.map(r => r.recordId)).size, 82);
assert.equal(events.filter(e => e.participation.deadline).length, 10);
const marrone = event('Cuneo', 'Mercati straordinari');
assert.deepEqual(dates(marrone), ['2026-10-17','2026-10-18']);
assert.equal(marrone.participation.deadline, '2026-10-02');
assert.match(marrone.participation.costs, /25/);
assert.deepEqual(marrone.merchandiseSectors, ['non-alimentare']);
assert.equal(event('Cuneo','Fiera Nazionale').participation.deadline, '2026-08-14');
const martin = event('Casteldelfino','Martin');
assert.deepEqual(dates(martin), ['2026-10-18']);
assert.equal(martin.participation.deadline, '2026-10-14');
assert.match(martin.participation.costs, /gratuita/);
assert.deepEqual(dates(event('Paroldo','Dula')), ['2026-05-31']);
assert.deepEqual(dates(event('Venasca','Castagna')), ['2026-10-18']);
assert.deepEqual(dates(event('Sampeyre','Michele')), ['2026-09-27']);
assert.deepEqual(dates(event('Brossasco','Legno')), ['2026-05-01','2026-05-03']);
assert.deepEqual(dates(event('Monastero di Vasco','Asino')), ['2026-05-17']);
assert.deepEqual(dates(event('Roccaforte Mondovì','Erbe')), ['2026-06-02']);
assert.deepEqual(dates(event('Piasco','Autunno')), ['2026-10-11']);
assert.deepEqual(dates(event('Roccabruna','Valle')), ['2026-10-04']);
assert.deepEqual(dates(event('Carrù','Bue')), ['2026-12-17']);
const bee = event('Villanova Mondovì','Bee');
assert.deepEqual(dates(bee), ['2026-11-20']);
assert.equal(bee.editions[0].end, '2026-11-22');
assert(bee.editions[0].periodOnly);
assert.match(bee.frequencyNote, /14–15 novembre/);
assert.deepEqual(dates(event('Chiusa di Pesio','Re Marrone')), ['2026-10-25']);
assert.deepEqual(dates(event('Vinadio','Pecora')), ['2026-10-25']);
assert.deepEqual(dates(event('Farigliano','Nicolao')), ['2026-12-06']);
assert.deepEqual(dates(event('Saluzzo',"Nazionale dell'Artigianato")), ['2026-04-11','2026-04-12','2026-04-18','2026-04-19']);
assert.equal(event('Saluzzo',"Nazionale dell'Antiquariato").editions[0].end, '2026-06-02');
assert.equal(event('Saluzzo','Mercato dei Santi').editions.length, 3);
assert.equal(event('Alba','Tartufo').editions.length, 18);
assert(event('Alba','Tartufo').editions.every(d => [0,6].includes(new Date(d.start + 'T12:00:00Z').getUTCDay())));
const govone = event('Govone','Magico');
assert.equal(govone.editions.length, 14);
assert(dates(govone).includes('2026-12-07'));
assert(!dates(govone).includes('2026-12-04'));
assert.match(govone.participation.note, /non vincolante/);
assert.equal(event('Cherasco','Gusta Cherasco - La Piazza').participation.deadline, '2026-10-16');
assert.equal(event('Cherasco','Natura').participation.deadline, '2026-10-31');
assert.match(event('Fossano','Coloratissimo').participation.note, /2025/);
assert.equal(event('Fossano','Coloratissimo').participation.deadline, '2026-10-04');
assert.match(event('Fossano','Coloratissimo').participation.costs, /1,23.*10 m².*5/);
assert.equal(event('Fossano','Coloratissimo').stallCount, 60);
assert.equal(event('Savigliano','Fiera di Primavera').participation.deadline, '2026-01-15');
assert.match(event('Savigliano','Fiera di Primavera').participation.costs, /35.*22/);
assert.equal(event('Cortemilia','Roba Veja').participation.deadline, '2026-08-07');
assert.equal(event('Bra','Cheese').editions.length, 0);
assert.equal(event('Santo Stefano Belbo','Senza Tempo').editions.length, 0);
assert(!events.some(e => e.city === 'Marmora' || e.name === 'Cavoli Tuoi'));
assert(audit.research.exclusionsAndUnresolved.some(e => e.city === 'Marmora' && /2017/.test(e.reason)));
for (const e of events) {
    assert(!Array.isArray(e.contacts));
    assert(!e.participation.applicationUrl);
    assert(!/[\u0000-\u0008\ufffd]/.test(JSON.stringify(e)));
}
console.log('Cuneo data passed: 173 events, 247 municipalities, 160 regional rows, 82 ATL records; dates, costs, deadlines and exclusions.');
if (process.argv.includes('--data-only')) process.exit(0);

const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
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
                // Isolate calendar checks from third-party auth and analytics.
                await page.route('**/*', route => {
                    const url = new URL(route.request().url());
                    if (['/js/supabase-config.js','/js/page-view-tracker.js','/js/auth.js'].includes(url.pathname)) return route.fulfill({status:200,body:''});
                    return url.origin === new URL(base).origin ? route.continue() : route.fulfill({status:200,body:''});
                });
                assert.equal((await page.goto(base + '/fiere?provincia=Cuneo', {waitUntil:'domcontentloaded'})).status(),200);
                await page.waitForFunction(() => document.querySelector('#list-count').textContent === '173');
                await page.waitForFunction(() => document.querySelectorAll('#map-provinces > *').length === 110);
                assert.equal(await page.locator('#province-filter').inputValue(), 'Cuneo');
                while (await page.locator('#load-more').isVisible()) await page.locator('#load-more').click();
                assert.equal(await page.locator('#fair-list article').count(), 173);
                const markers = await page.locator('#map-markers > g').evaluateAll(nodes => nodes.flatMap(n => n.dataset.events.split(',')));
                assert.deepEqual(markers.sort(), events.map(e => e.id).sort());
                for (const e of [marrone,martin,govone,bee,event('Cherasco','Gusta Cherasco - La Piazza'),event('Cherasco','Natura'),event('Venasca','Castagna'),event('Sampeyre','Michele'),event('Fossano','Coloratissimo'),event('Alba','Tartufo'),event('Bra','Cheese'),event('Savigliano','Fiera di Primavera')]) {
                    await page.locator('[data-event-id="' + e.id + '"] button').click();
                    await page.locator('#fair-dialog').waitFor({state:'visible'});
                    assert.equal(await page.locator('#detail-title').textContent(), e.name);
                    assert.equal(await page.locator('#detail-source').getAttribute('data-fiere-source'), e.source.url);
                    assert.equal(await page.locator('#detail-participation-note').textContent(), e.participation.note);
                    if (e.participation.url) assert.equal(await page.locator('#detail-participation-link').getAttribute('data-fiere-source'), e.participation.url);
                    if (e.participation.costs) assert.equal(await page.locator('#detail-costs').textContent(), e.participation.costs);
                    if (e.participation.deadline) assert.match(await page.locator('#detail-deadline').textContent(), /[0-9]/);
                    assert.equal(await page.locator('#detail-editions > div').count(), e.editions.length);
                    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
                    await page.locator('#close-detail').click();
                }
                assert.deepEqual(errors, []);
                checks.push({engine,viewport,count:173,details:12,errors});
                console.log(engine + ' ' + viewport.width + ': Cuneo list, map, 12 details and overflow passed.');
            } finally { await browser.close(); }
        }
        if (process.env.FIERE_VERIFICATION_FILE) fs.writeFileSync(process.env.FIERE_VERIFICATION_FILE, JSON.stringify({base,checkedAt:new Date().toISOString(),checks},null,2));
    } finally { if (server.listening) await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); if (server.listening) server.close(); process.exitCode = 1; });
