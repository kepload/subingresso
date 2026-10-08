// Calendar audit: catalogue integrity, matching list/map results and real browser interactions.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const os = require('node:os');
const root = path.resolve(__dirname, '..');
const { events } = JSON.parse(fs.readFileSync(path.join(root, 'data/fiere.json'), 'utf8'));
const boundaries = JSON.parse(fs.readFileSync(path.join(root, 'data/italia-regioni.json'), 'utf8'));
require('../js/pages/fiere.js');
const api = globalThis.FiereCalendar;
const regions = [...new Set(events.map(e => e.region))];
assert.equal(events.length, 200);
assert.equal(new Set(events.map(e => e.id)).size, 200);
assert.equal(regions.length, 20);
assert.deepEqual([...boundaries.features.map(f => f.properties.name)].sort(), regions.slice().sort());
for (const region of regions) assert.equal(events.filter(e => e.region === region).length, 10);
for (const event of events) {
    assert(event.source.url.startsWith('https://') && event.source.label);
    assert(event.months.every(m => Number.isInteger(m) && m >= 1 && m <= 12));
    assert.equal(new Set(event.months).size, event.months.length);
    const [x,y] = api.project(event.lng,event.lat);
    assert(x >= 0 && x <= 660 && y >= 0 && y <= 730, event.city + ' outside map');
}
assert.deepEqual(api.intervalMonths(11, 2), [11,12,1,2]);
assert.deepEqual(api.intervalMonths(4, 4), [4]);
assert.deepEqual(api.intervalMonths(0, 3), []);
const server = http.createServer((req,res) => {
    let file = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1) || 'index.html';
    if (!path.extname(file)) file += '.html';
    const full = path.resolve(root,file);
    if (!full.startsWith(root + path.sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', ({'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json'})[path.extname(full)] || 'text/plain');
    if (['js/supabase-config.js','js/page-view-tracker.js','js/auth.js'].includes(file)) return res.end('');
    fs.readFile(full, (error,data) => error ? res.writeHead(404).end() : res.end(data));
});

async function run(engine,name,viewport,base) {
    const browser = await engine.launch({headless:true});
    try {
        const context = await browser.newContext({viewport,hasTouch:viewport.width < 720});
        await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.fulfill({status:200,body:''}));
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        async function count(n) {
            await page.waitForFunction(n => document.querySelector('#list-count').textContent === String(n),n);
        }
        async function matches(expected) {
            await count(expected.length);
            const ids = await page.locator('#map-markers > g').evaluateAll(markers => markers.flatMap(m => m.dataset.events.split(',')).sort());
            assert.deepEqual(ids,expected.map(e => e.id).sort());
            const list = await page.locator('.fiere-card').evaluateAll(cards => cards.map(c => c.dataset.eventId));
            assert(list.every(id => ids.includes(id)));
            assert.equal(list.length, Math.min(12,expected.length));
        }
        await page.goto(base + '/fiere');
        await count(200);
        await page.waitForFunction(() => document.querySelector('#map-regions').children.length === 20);
        assert.equal(await page.locator('.nav-link-fiere').getAttribute('aria-current'), 'page');
        assert.equal(await page.locator('#month-bar button').count(),12);
        await matches(events);
        await page.locator('#load-more').click();
        assert.equal(await page.locator('.fiere-card').count(),24);
        for (const region of regions) {
            await page.selectOption('#region-filter',region);
            await matches(events.filter(e => e.region === region));
        }
        await page.locator('#reset-filters').click();
        await page.locator('[data-month="11"]').click();
        await matches(events.filter(e => e.months.includes(11)));
        await page.locator('[data-month="12"]').click();
        await matches(events.filter(e => e.months.some(m => [11,12].includes(m))));
        await page.selectOption('#month-from','11');
        await page.selectOption('#month-to','2');
        await matches(events.filter(e => e.months.some(m => [11,12,1,2].includes(m))));
        assert.equal(new URL(page.url()).searchParams.get('mesi'),'11,12,1,2');
        await page.reload();
        await matches(events.filter(e => e.months.some(m => [11,12,1,2].includes(m))));
        await page.selectOption('#type-filter','tradizionale');
        await matches(events.filter(e => e.category === 'tradizionale' && e.months.some(m => [11,12,1,2].includes(m))));
        await page.locator('#reset-filters').click();
        await page.locator('#fair-search').fill('CARRU');
        await matches(events.filter(e => e.city === 'Carrù'));
        await page.locator('.fiere-card-button').first().click();
        assert.equal(await page.locator('#fair-dialog').evaluate(d => d.open),true);
        assert.equal(await page.locator('#detail-source').getAttribute('href'),events.find(e => e.city === 'Carrù').source.url);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#fair-dialog').evaluate(d => d.open),false);
        await page.locator('#fair-search').fill('zzzz-no-result');
        await matches([]);
        assert(await page.locator('#empty-results').isVisible());
        await page.locator('#empty-reset').click();
        await count(200);
        const veneto = page.locator('#map-regions [data-region="Veneto"]');
        await veneto.focus(); await page.keyboard.press('Enter');
        await matches(events.filter(e => e.region === 'Veneto'));
        const marker = page.locator('#map-markers > g').first();
        await marker.focus(); await page.keyboard.press('Enter');
        assert(await page.locator('#map-popup').isVisible());
        await page.locator('.fiere-popup-event').first().click();
        assert.equal(await page.locator('#fair-dialog').evaluate(d => d.open),true);
        await page.locator('#close-detail').click();
        await page.locator('#reset-filters').click();
        await count(200);
        const before = await page.locator('#italy-map').getAttribute('viewBox');
        await page.locator('#map-zoom-in').click();
        assert.notEqual(await page.locator('#italy-map').getAttribute('viewBox'),before);
        await page.locator('#map-home').click();
        assert.equal(await page.locator('#italy-map').getAttribute('viewBox'),before);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),false,'Horizontal overflow');
        await page.evaluate(() => window.scrollTo(0,0));
        await page.screenshot({path:path.join(os.tmpdir(),'subingresso-fiere-'+name+'-'+viewport.width+'.png'),fullPage:false});
        await page.locator('.fiere-map-panel').screenshot({path:path.join(os.tmpdir(),'subingresso-fiere-map-'+name+'-'+viewport.width+'.png')});

        // A failed request must be recoverable without reloading the page.
        let failCatalog = true;
        await context.route('**/data/fiere.json?*', route => failCatalog ? route.fulfill({status:503,body:'unavailable'}) : route.continue());
        await page.reload();
        await page.locator('#catalog-error').waitFor({state:'visible'});
        failCatalog = false;
        await page.locator('#retry-catalog').click();
        await count(200);
        let failMap = true;
        await context.route('**/data/italia-regioni.json?*', route => failMap ? route.fulfill({status:503,body:'unavailable'}) : route.continue());
        await page.reload();
        await page.locator('#map-error').waitFor({state:'visible'});
        await count(200);
        failMap = false;
        await page.locator('#retry-map').click();
        await page.waitForFunction(() => document.querySelector('#map-regions').children.length === 20);
        assert.equal(await page.locator('#map-error').isVisible(),false);
        assert.deepEqual(errors,[]);
        console.log(name + ' ' + viewport.width + ': passed filters, all regions, list/map consistency, details, keyboard, retries and overflow');
    } finally { await browser.close(); }
}
(async () => {
    const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    try {
        await run(playwright.chromium,'chromium',{width:1440,height:1100},base);
        await run(playwright.chromium,'chromium',{width:390,height:844},base);
        await run(playwright.webkit,'webkit',{width:390,height:844},base);
        await run(playwright.chromium,'chromium',{width:320,height:800},base);
        console.log('Catalogue: 200 unique events, 20 regions, 10 per region, valid sources and coordinates.');
    } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => {console.error(error);process.exitCode=1;server.close();});
