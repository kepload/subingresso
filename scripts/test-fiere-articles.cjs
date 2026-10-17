// Documented merchandise only; multi-selection is a union, combined with the other filters.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
require('../js/pages/fiere.js');
const api = globalThis.FiereCalendar;
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data/fiere.json'), 'utf8'));
const events = catalog.events;
const classify = sectors => api.articleTypes({ sectors });
assert.equal(Object.keys(api.ARTICLE_TYPES).length, 31);
assert.deepEqual(classify('Abbigliamento, calzature, borse e pelletteria, intimo e calze'), ['abbigliamento', 'intimo', 'calzature', 'pelletteria']);
assert.deepEqual(classify('Biancheria per la casa; casalinghi; profumeria; detersivi'), ['casalinghi', 'biancheria-casa', 'cosmetici', 'detergenti']);
assert.deepEqual(classify('Bigiotteria artigianale, borse, ceramica, lavorazioni in legno e ricamo'), ['pelletteria', 'bigiotteria', 'ceramica', 'legno', 'tessili', 'gioielli-artigianali']);
assert.deepEqual(classify('Antiquariato, modernariato, vintage, usato e collezionismo'), ['antiquariato', 'modernariato', 'vintage', 'usato', 'collezionismo']);
assert.deepEqual(classify('Prodotti agricoli; salumi e formaggi; prodotti da forno; dolciumi; prodotti tipici; vini e birre; street food'), ['salumi-formaggi', 'forno', 'dolciumi', 'agricoli', 'tipici', 'bevande', 'street-food']);
assert.deepEqual(classify('Giocattoli, fumetti, elettronica e accessori telefonici, fiori e piante, articoli per animali'), ['giocattoli', 'libri', 'elettronica', 'piante', 'animali']);
for (const sectors of ['', 'Merci varie', 'Misto', 'Non alimentare', 'Alimentare', 'Artigianato e hobbistica', 'Oggettistica']) assert.deepEqual(classify(sectors), []);
assert.deepEqual(api.articleTypes({ name: 'Fiera delle scarpe e dei libri', sectors: 'Merci varie' }), []);
assert.deepEqual(classify('Hobbistica e opere proprie; esclusi alimentari, antiquariato e libri'), []);
assert.deepEqual(classify('Non ammessi abbigliamento, calzature e borse; artigianato'), []);
assert.deepEqual(classify('Artigianato (vietati libri e fumetti); piante'), ['piante']);
assert.deepEqual(classify('Dolci e bevande confezionate; esclusa somministrazione'), ['dolciumi', 'bevande']);
assert.deepEqual(classify('Alimentari (ad esclusione di ambulanti con autorizzazioni per somministrazione alimenti e bevande) e non alimentari'), []);
assert.deepEqual(classify('Produttori esclusivamente alimentari; formaggi'), ['salumi-formaggi']);
const state = { months: [], query: '', articles: ['calzature', 'dolciumi'] };
const union = events.filter(e => classify(e.sectors).some(type => state.articles.includes(type)));
assert(union.length > api.filterEvents(events, { ...state, articles: ['calzature'] }).length);
assert.deepEqual(api.filterEvents(events, state), union);
assert.deepEqual(api.filterEvents(events, { ...state, region: 'Lombardia', months: [10], category: 'tradizionale' }), union.filter(e => e.region === 'Lombardia' && e.months.includes(10) && e.category === 'tradizionale'));
assert.deepEqual(api.filterEvents(events, { months: [], query: '' }), events, 'Old URLs and callers keep their results');
const digest = text => createHash('sha256').update(text.replace(/\r\n/g, '\n')).digest('hex');
assert.equal(digest(fs.readFileSync(path.join(root, 'data/fiere.json'), 'utf8')), digest(execFileSync('git', ['show', 'HEAD:data/fiere.json'], { cwd: root, encoding: 'utf8', maxBuffer: 40 * 1024 * 1024 })), 'Catalogue remains unchanged');
console.log('Article classification, exclusions, union, combined filters and catalogue preservation passed.');
const handler = require('../api/fiera');
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/fiere/')) return handler({ query: { slug: decodeURIComponent(url.pathname.slice(7)) } }, {
        setHeader: (key, value) => res.setHeader(key, value), status(code) { res.statusCode = code; return this; }, send: html => res.end(html)
    });
    const file = path.resolve(root, (url.pathname === '/fiere' ? '/fiere.html' : url.pathname).slice(1));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' })[path.extname(file)] || 'text/plain');
    fs.readFile(file, (error, data) => error ? res.writeHead(404).end() : res.end(data));
});
async function run(engine, engineName, width, height, base) {
    const browser = await engine.launch({ headless: true });
    try {
        const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 720 });
        await context.route('**/*', route => {
            const url = new URL(route.request().url());
            if (['/js/supabase-config.js', '/js/auth.js', '/js/page-view-tracker.js'].includes(url.pathname)) return route.fulfill({ contentType: 'application/javascript', body: '' });
            return url.origin === new URL(base).origin ? route.continue() : route.abort();
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const count = async expected => page.waitForFunction(expected => document.querySelector('#list-count').textContent === String(expected), expected);
        const checkbox = type => page.locator('#article-options input[value="' + type + '"]');
        async function verify(expected, months = false) {
            await count(expected.length);
            assert.deepEqual(await page.locator('.fiere-card').evaluateAll(cards => cards.map(c => c.dataset.eventId)), api.sortEvents(expected).slice(0, 12).map(e => e.id));
            assert.deepEqual(await page.locator('#map-markers > g').evaluateAll(markers => markers.flatMap(m => m.dataset.events.split(',')).sort()), months ? expected.map(e => e.id).sort() : []);
            assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        }
        await page.goto(base + '/fiere');
        await verify(events);
        await page.locator('#article-summary').click();
        assert.equal(await page.locator('#article-options input').count(), 31);
        for (const type of ['calzature', 'dolciumi']) await checkbox(type).check();
        await verify(union);
        assert.equal(await page.locator('#selected-articles button').count(), 2);
        assert.equal(await page.locator('#article-summary-text').innerText(), '2 tipologie selezionate');
        assert.deepEqual(new URL(page.url()).searchParams.get('articoli').split(',').sort(), ['calzature', 'dolciumi']);
        assert(await checkbox('calzature').isChecked());
        await page.locator('#article-summary').focus();
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#article-filter').getAttribute('open'), null);
        await page.locator('[data-month="10"]').click();
        await page.selectOption('#province-filter', 'regione:Lombardia');
        await page.selectOption('#type-filter', 'tradizionale');
        const combined = union.filter(e => e.months.includes(10) && e.region === 'Lombardia' && e.category === 'tradizionale');
        await verify(combined, true);
        await page.reload();
        await verify(combined, true);
        assert.equal(await page.locator('#selected-articles button').count(), 2);
        await page.locator('#reset-filters').click();
        await verify(events);
        assert.equal(await page.locator('#selected-articles button').count(), 0);
        assert.equal(new URL(page.url()).searchParams.get('articoli'), null);
        // A broad sector narrows the choices and clears incompatible selections.
        await page.goto(base + '/fiere?articoli=calzature,dolciumi');
        await verify(union);
        await page.selectOption('#sector-filter', 'alimentare');
        const food = api.filterEvents(events, { months: [], query: '', sector: 'alimentare', articles: ['dolciumi'] });
        await verify(food);
        assert.equal(await page.locator('#selected-articles button').count(), 1);
        await page.locator('#article-summary').click();
        assert.equal(await checkbox('calzature').isVisible(), false);
        assert(await checkbox('dolciumi').isChecked());
        await page.locator('#clear-articles').click();
        await verify(events.filter(e => e.merchandiseSectors.includes('alimentare')));
        await page.locator('#article-summary').focus();
        await page.keyboard.press('Escape');
        // URL values are deduplicated, validated and checked against the sector.
        await page.goto(base + '/fiere?articoli=calzature,calzature,inesistente,toString&articoli=dolciumi');
        await verify(union);
        assert.equal(new URL(page.url()).searchParams.getAll('articoli').length, 1);
        assert.equal(new URL(page.url()).searchParams.get('articoli'), 'calzature,dolciumi');
        await page.goto(base + '/fiere?settore=alimentare&articoli=calzature,dolciumi');
        await verify(food);
        assert.equal(new URL(page.url()).searchParams.get('articoli'), 'dolciumi');
        // Chips remove individual types; keyboard checkboxes and empty results work.
        await page.goto(base + '/fiere?articoli=calzature,dolciumi');
        await verify(union);
        await page.getByRole('button', { name: 'Rimuovi Calzature', exact: true }).click();
        await verify(events.filter(e => api.articleTypes(e).includes('dolciumi')));
        await page.locator('#article-summary').click();
        await checkbox('dolciumi').focus();
        await page.keyboard.press('Space');
        await verify(events);
        await checkbox('intimo').check();
        await verify([]);
        assert(await page.locator('#empty-results').isVisible());
        await page.locator('#article-summary').focus();
        await page.keyboard.press('Escape');
        await page.locator('#empty-reset').click();
        await verify(events);
        // Detail dialog and the standalone page share the same source-backed types.
        const shoes = api.sortEvents(events.filter(e => api.articleTypes(e).includes('calzature')))[0];
        await page.goto(base + '/fiere?articoli=calzature');
        await count(events.filter(e => api.articleTypes(e).includes('calzature')).length);
        await page.locator('.fiere-card-button').first().click();
        assert((await page.locator('#detail-facts').innerText()).includes('Calzature'));
        await page.locator('#detail-page-link').click();
        assert((await page.locator('main dl').innerText()).includes('Calzature'));
        assert.equal(new URL(page.url()).pathname, '/fiere/' + shoes.id);
        // Every choice fits a touch target and the menu scrolls on short screens.
        await page.goto(base + '/fiere?articoli=calzature,dolciumi');
        await verify(union);
        await page.locator('#article-summary').click();
        assert(await page.locator('#article-options label').evaluateAll(labels => labels.every(label => label.getBoundingClientRect().height >= 44)));
        assert(await page.locator('.fiere-article-menu').evaluate(menu => menu.scrollHeight > menu.clientHeight));
        assert(await page.locator('.fiere-article-menu').evaluate(menu => { const rect = menu.getBoundingClientRect(); return rect.top >= 0 && rect.bottom <= innerHeight; }));
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        if (process.env.FIERE_ARTICLES_OUTPUT) {
            fs.mkdirSync(process.env.FIERE_ARTICLES_OUTPUT, { recursive: true });
            await page.screenshot({ path: path.join(process.env.FIERE_ARTICLES_OUTPUT, engineName + '-' + width + '-menu.png'), fullPage: false });
        }
        assert.deepEqual(errors, []);
        console.log(engineName + ' ' + width + 'x' + height + ': multi-select, OR results, list/map, URL/reload, sectors, reset, keyboard, details and overflow passed.');
    } finally { await browser.close(); }
}
(async () => {
    const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = process.env.FIERE_TEST_BASE_URL || 'http://127.0.0.1:' + server.address().port;
    try {
        for (const [engine, width, height] of [['chromium', 1440, 1000], ['chromium', 820, 1000], ['chromium', 320, 568], ['webkit', 390, 844]]) await run(playwright[engine], engine, width, height, base);
        const assigned = events.filter(e => api.articleTypes(e).length).length;
        console.log('Source-backed types: ' + assigned + '/' + events.length + ' events. Generic source descriptions remain unclassified.');
    } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
