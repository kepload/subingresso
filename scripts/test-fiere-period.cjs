'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
require('../js/pages/fiere.js');
const api = globalThis.FiereCalendar;
const picker = require('../js/fair-date-picker.js');
const catalog = require('../data/fiere.json').events;
const baseState = { months: [], query: '' };
const range = (dateFrom, dateTo) => ({ ...baseState, dateFrom, dateTo });
const edition = (start, end = start) => ({ year: Number(start.slice(0, 4)), start, end, dateType: 'confirmed' });
const event = (id, editions = [], months = [11]) => ({ id, name: id, city: 'Brescia', province: 'Brescia', region: 'Lombardia', months, editions });
const fixtures = [event('starts-before', [edition('2026-11-01', '2026-11-07')]), event('same-day', [edition('2026-11-07')]), event('ends-after', [edition('2026-11-08', '2026-11-15')]), event('old-edition', [edition('2025-11-07')]), event('usual-period'), event('after', [edition('2026-11-09')])];
assert.deepEqual(api.filterEvents(fixtures, range('2026-11-07', '2026-11-08')).map(e => e.id), ['starts-before', 'same-day', 'ends-after']);
assert.equal(api.filterEvents(fixtures, range('2026-11-08', '2026-11-07')).length, 0);
assert.equal(api.filterEvents(fixtures, range('2026-02-30', '2026-03-01')).length, 0);
assert.equal(api.filterEvents(fixtures, range('2026-11-07', '')).length, 0);
assert.deepEqual(api.filterEvents(fixtures, baseState), fixtures);
assert.equal(api.validISODate('2028-02-29'), true);
assert.equal(api.validISODate('2027-02-29'), false);
const multi = event('multiple', [edition('2025-12-31'), edition('2026-12-31', '2027-01-02'), edition('2027-12-31')], [12, 1]);
assert.equal(api.selectEdition(multi, '2026-11-07', [], range('2027-01-01', '2027-01-01')), multi.editions[1]);
assert.equal(api.filterEvents([multi], range('2027-01-01', '2027-01-01')).length, 1);
assert.equal(api.filterEvents([multi], { ...range('2027-01-01', '2027-01-01'), province: 'Roma' }).length, 0);
assert.equal(picker.daysInMonth(2028, 2), 29);
assert.equal(picker.daysInMonth(2029, 2), 28);
assert.deepEqual(picker.preset('month', '2028-02-12'), ['2028-02-01', '2028-02-29']);
assert.deepEqual(picker.preset('three-months', '2026-11-07'), ['2026-11-07', '2027-02-07']);
assert.deepEqual(picker.preset('six-months', '2026-11-07'), ['2026-11-07', '2027-05-07']);
assert.deepEqual(picker.preset('three-months', '2026-01-31'), ['2026-01-31', '2026-04-30']);
assert.deepEqual(picker.preset('six-months', '2026-08-31'), ['2026-08-31', '2027-02-28']);
assert.deepEqual(picker.preset('six-months', '2027-08-31'), ['2027-08-31', '2028-02-29']);
for (const state of [range('2026-11-07', '2026-11-08'), range('2026-12-30', '2027-01-04'), range('2028-02-29', '2028-02-29')]) {
    const expected = catalog.filter(e => e.editions.some(d => d.start && (d.end || d.start) >= state.dateFrom && d.start <= state.dateTo));
    assert.deepEqual(api.filterEvents(catalog, state).map(e => e.id), expected.map(e => e.id));
}
console.log('Date ranges: inclusive boundaries, leap years, year changes, missing dates, old editions, geography and real catalog passed.');

async function browserChecks() {
    const pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    const handler = require('../api/fiera');
    const server = http.createServer((req, res) => {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname.startsWith('/fiere/')) return handler({ query: { slug: decodeURIComponent(url.pathname.slice(7)) } }, { setHeader:(k,v)=>res.setHeader(k,v), status(n){res.statusCode=n;return this;}, send:s=>res.end(s) });
        const file = path.resolve(root, '.' + (url.pathname === '/fiere' ? '/fiere.html' : url.pathname));
        if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
        fs.readFile(file, (err, data) => { if(err)return res.writeHead(404).end(); res.setHeader('Content-Type', ({'.css':'text/css','.js':'application/javascript','.mjs':'application/javascript','.json':'application/json'})[path.extname(file)] || 'text/html; charset=utf-8'); res.end(data); });
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = process.env.FIERE_PERIOD_BASE_URL || 'http://127.0.0.1:' + server.address().port;
    const output = process.env.FIERE_PERIOD_OUTPUT || path.join(root, '.local/verifiche/fiere-periodo-20261107');
    fs.mkdirSync(output, { recursive: true });
    const report = [];
    try {
        for (const [engine, width, height, dark] of [['chromium',1440,900,false],['chromium',768,900,false],['chromium',320,700,false],['chromium',1440,900,true],['webkit',390,844,false],['webkit',390,844,true],['webkit',844,390,false]]) {
            const browser = await pw[engine].launch({ headless: true });
            try {
                const context = await browser.newContext({ viewport:{width,height}, hasTouch:width<800, reducedMotion:'reduce' });
                await context.addInitScript(dark => {
                    const query={select(){return this;},eq(){return this;},in(){return this;},order(){return this;},limit(){return this;},then(resolve){return Promise.resolve({data:[]}).then(resolve);}};
                    window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},from:()=>Object.create(query),rpc:async()=>({data:[]})})};
                    if(dark)document.addEventListener('DOMContentLoaded',()=>document.documentElement.classList.add('admin-dark'));
                }, dark);
                await context.route('**/*', route => {
                    const url = new URL(route.request().url());
                    if (url.pathname === '/rest/v1/rpc/published_organizer_events') return route.fulfill({status:200,contentType:'application/json',body:'[]'});
                    if (url.origin !== new URL(base).origin || !['GET','HEAD'].includes(route.request().method())) return route.abort();
                    if (url.pathname.startsWith('/api/')) return route.fulfill({status:200,contentType:'application/json',body:'[]'});
                    return route.continue();
                });
                const page = await context.newPage(), errors = [];
                page.on('pageerror', error => errors.push(error.message));
                const ready = async () => {
                    await page.waitForFunction(() => document.querySelector('#fair-list')?.getAttribute('aria-busy') === 'false');
                    if(dark) await page.evaluate(() => document.documentElement.classList.add('admin-dark'));
                };
                const overflow = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'No page overflow');
                async function verifyResults() {
                    const params = new URL(page.url()).searchParams;
                    const state = { ...baseState, dateFrom:params.get('dal') || '', dateTo:params.get('al') || '', province:params.get('provincia') || '', region:params.get('regione') || '', category:params.get('tipo') || '' };
                    const expected = api.sortEvents(api.filterEvents(catalog, state), '2026-11-07', [], state);
                    await page.waitForFunction(count => document.querySelector('#list-count').textContent === String(count), expected.length);
                    const ids = await page.locator('.fiere-card').evaluateAll(rows => rows.map(row => row.dataset.eventId));
                    assert.deepEqual(ids, expected.slice(0,12).map(e => e.id));
                    return expected;
                }
                await page.goto(base + '/fiere'); await ready();
                assert.equal(await page.locator('#article-filter, #month-bar, #month-from').count(), 0);
                assert.deepEqual(await page.locator('[data-period]').allTextContents(), ['Questo mese', 'Da oggi a 3 mesi', 'Da oggi a 6 mesi']);
                const inlineDates = () => page.locator('.fair-period-field').evaluateAll(fields => fields.every(field => {
                    const label = field.querySelector('span').getBoundingClientRect();
                    const value = field.querySelector('strong').getBoundingClientRect();
                    const box = field.getBoundingClientRect();
                    const arrow = field.querySelector('svg');
                    const edge = getComputedStyle(arrow).display === 'none' ? box.right - 6 : arrow.getBoundingClientRect().left - 2;
                    return box.height >= 44 && box.height <= 50 && Math.abs((label.top + label.bottom - value.top - value.bottom) / 2) < 2 && value.right <= edge;
                }));
                assert(await inlineDates(), 'Both labels and full values share one line, without overlaps');
                const presetTops = await page.locator('[data-period]').evaluateAll(els => els.map(el => el.getBoundingClientRect().top));
                assert(presetTops.every(top => Math.abs(top - presetTops[0]) < 1), 'Presets stay on one row');
                await overflow();
                await page.locator('#date-from').click();
                assert(await page.locator('#period-dialog').evaluate(el => el.matches(':modal')));
                if(dark) assert.equal(await page.locator('#period-dialog').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(21, 32, 51)');
                assert.equal(await page.locator('#period-day').evaluate(el => Math.round(el.scrollTop / 44) + 1), Number(await page.locator('#period-day').getAttribute('aria-valuenow')));
                const shot = `${process.env.FIERE_PERIOD_BASE_URL ? 'live' : 'local'}-${engine}-${width}-${height}-${dark?'dark':'light'}`;
                await page.screenshot({path:path.join(output,shot+'-picker.png')});
                assert(await page.locator('#period-dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1));
                await page.keyboard.press('Escape');
                assert.equal(new URL(page.url()).searchParams.has('dal'), false);
                assert.equal(await page.evaluate(() => document.documentElement.classList.contains('fair-period-open')), false);
                await page.locator('[data-period=month]').click(); await verifyResults();
                await page.reload(); await ready(); await verifyResults();
                await page.locator('#date-to').click();
                await page.locator('#period-day').focus(); await page.keyboard.press('ArrowUp');
                await page.locator('#period-apply').click(); await verifyResults();
                await page.locator('#province-filter').selectOption('Brescia'); await verifyResults();
                await page.locator('#reset-filters').click();
                assert.equal(new URL(page.url()).searchParams.has('dal'), false);
                assert.equal(new URL(page.url()).searchParams.has('provincia'), false);
                await page.locator('#reset-filters').click();
                assert.equal(await page.locator('#list-count').innerText(), String(catalog.length));
                await page.goto(base+'/fiere?dal=2028-01-31&al=2028-03-02'); await ready();
                assert(await inlineDates(), 'Full dates with two-digit days fit on one line');
                await page.locator('#date-from').click();
                await page.locator('#period-month').focus(); await page.keyboard.press('ArrowDown');
                assert.equal(await page.locator('#period-day').getAttribute('aria-valuenow'), '29');
                assert.equal(await page.locator('#period-day').getAttribute('aria-valuemax'), '29');
                await page.locator('#period-year').focus(); await page.keyboard.press('ArrowDown');
                assert.equal(await page.locator('#period-day').getAttribute('aria-valuenow'), '28');
                await page.locator('#period-close').click();
                assert.equal(new URL(page.url()).searchParams.get('dal'), '2028-01-31', 'Cancel preserves applied range');
                await page.goto(base+'/fiere?dal=2026-12-31&al=2027-01-02'); await ready();
                const expected = await verifyResults();
                if(expected.length) {
                    await page.locator('.fiere-card-button').first().click();
                    const d=api.selectEdition(expected[0],'2026-11-07',[],range('2026-12-31','2027-01-02'));
                    assert((await page.locator('#fair-dialog').innerText()).includes(api.editionLabel(d)));
                    await page.locator('#close-detail').click();
                }
                await page.goto(base+'/fiere?mesi=11&settore=alimentare&articoli=calzature'); await ready();
                assert((await page.locator('#period-note').innerText()).includes('Novembre'));
                assert.equal(new URL(page.url()).searchParams.has('settore'), false);
                assert.equal(new URL(page.url()).searchParams.has('articoli'), false);
                await page.locator('#date-from').click(); await page.locator('#period-apply').click(); await verifyResults();
                for (const kind of ['three-months', 'six-months']) {
                    await page.locator('[data-period="' + kind + '"]').click(); await verifyResults();
                    assert(await inlineDates(), 'Selected dates remain complete and on one line');
                    const params = new URL(page.url()).searchParams;
                    assert.deepEqual([params.get('dal'), params.get('al')], picker.preset(kind, params.get('dal')));
                }
                if(engine === 'chromium' && width === 1440 && !dark) {
                    let releaseCatalog;
                    const held = new Promise(resolve => { releaseCatalog = resolve; });
                    await page.route('**/data/fiere.json*', async route => { await held; await route.continue(); });
                    await page.goto(base + '/fiere', { waitUntil:'domcontentloaded' });
                    await page.locator('[data-period=month]').click();
                    assert(new URL(page.url()).searchParams.has('dal'), 'A choice during loading is saved immediately');
                    releaseCatalog(); await ready(); await verifyResults();
                    await page.unroute('**/data/fiere.json*');
                }
                await overflow();
                await page.screenshot({path:path.join(output,shot+'-results.png')});
                assert.deepEqual(errors, []);
                report.push({engine,width,height,dark,passed:true});
                await context.close();
            } finally { await browser.close(); }
        }
        fs.writeFileSync(path.join(output,process.env.FIERE_PERIOD_BASE_URL?'live-results.json':'local-results.json'),JSON.stringify(report,null,2));
        console.log('Browser: '+report.length+' viewport/theme combinations passed, including WebKit.');
    } finally { server.close(); }
}
if (process.argv.includes('--browser')) browserChecks().catch(error => { console.error(error); process.exitCode=1; });
