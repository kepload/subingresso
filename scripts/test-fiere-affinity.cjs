const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
require('../js/pages/fiere.js');
const api = globalThis.FiereCalendar;
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'data/fiere.json'), 'utf8'));
const today = '2026-10-17';
const baseEvent = { source: { url: 'https://example.org/fair', label: 'Fonte della fiera', checkedAt: today }, editions: [{ year: 2026, start: '2026-12-01', end: '2026-12-02' }] };
const rate = (sectors, article, patch = {}) => api.articleAffinity({ ...baseEvent, sectors, ...patch }, article, today);
assert.equal(rate('Calzature', 'calzature').score, 6);
assert.equal(rate('Calzature', 'calzature', { name: 'Fiera delle calzature' }).score, 8);
assert.equal(rate('Merci varie, calzature', 'calzature').score, 6);
assert.equal(rate('Abbigliamento, calzature e casalinghi', 'calzature').score, 6);
assert.equal(rate('Abbigliamento', 'calzature').score, null);
assert.equal(rate('Solo settore non alimentare', 'dolciumi').score, 2);
assert.equal(rate('Solo alimentari', 'calzature').score, 2);
assert.equal(rate('Alimentari e non alimentari', 'calzature').score, null);
assert.equal(rate('Artigianato; esclusi alimentari, antiquariato e libri', 'libri').score, 2);
assert.equal(rate('Libri non ammessi', 'libri').score, 2);
assert.equal(rate('Esclusi prodotti non alimentari', 'calzature').score, 2);
assert.equal(rate('Esclusi prodotti non alimentari', 'dolciumi').score, null);
assert.equal(rate('Solo alimentari e non alimentari', 'calzature').score, null);
assert.equal(rate('Dolci confezionati; esclusa somministrazione', 'dolciumi').score, 6);
assert.equal(rate('Vino confezionato; vietata somministrazione di bevande', 'bevande').score, 6);
for (const sectors of ['Merci varie', 'Misto', 'Artigianato', 'Non alimentare', 'Antiquariato', 'Fiera espositiva']) assert.equal(rate(sectors, 'calzature').score, null, sectors);
assert.equal(rate('Solo opere proprie; esclusi alimentari per hobbisti', 'dolciumi').score, null);
assert.equal(rate('Bancarelle alimentari. Hobbisti: esclusi alimentari, antiquariato e libri', 'dolciumi').score, null);
assert.equal(rate('Esclusi alimentari salvo autorizzazione', 'dolciumi').score, null);
assert.equal(rate('Vietati libri nell’area artigianato', 'libri').score, null);
for (const checkedAt of ['2025-01-01', '2026-10-18', '2026-02-30', '', 'invalid']) assert.equal(rate('Non ammessi libri', 'libri', { source: { ...baseEvent.source, checkedAt } }).score, null);
assert.equal(rate('Non ammessi libri', 'libri', { editions: [{ year: 2025, end: '2025-12-20' }] }).score, null);
assert.equal(rate('Non ammessi libri', 'libri', { editions: [{ year: 2026, end: '2026-10-11' }] }).score, null);
assert.equal(rate('Non ammessi libri', 'libri', { editions: [] }).score, null);
assert.equal(rate('Calzature', 'calzature', { source: {} }).score, null);
assert.equal(api.articleAffinity(baseEvent, 'toString', today), null);
assert.equal(api.articleAffinity(baseEvent, 'inesistente', today), null);
assert.deepEqual(api.articleAffinitySummary(baseEvent, [], today), { items: [], best: null, score: null });
const mixed = api.articleAffinitySummary({ ...baseEvent, sectors: 'Calzature; esclusi alimentari' }, ['calzature', 'dolciumi', 'intimo', 'calzature', 'inesistente'], today);
assert.equal(mixed.score, 6);
assert.deepEqual(mixed.items.map(item => item.score), [6, 2, null]);
assert.equal(mixed.items.length, 3);
assert.equal(mixed.best.article, 'calzature');
const cento = catalog.events.find(e => e.id === 'emilia-romagna-cento-fiera-di-natale');
assert.equal(api.articleAffinity(cento, 'dolciumi', cento.source.checkedAt).score, 2, 'Assess the updated catalogue evidence on its checked date');
const cavour = catalog.events.find(e => e.id === 'piemonte-cavour-tuttomele');
assert.equal(api.articleAffinity(cavour, 'dolciumi', today).score, null, 'Hobby-area restrictions cannot reject food traders');
const prato = catalog.events.find(e => e.id === 'piemonte-prato-sesia-mercatino-d-autunno-sagra-della-castagna');
assert.equal(api.articleAffinity(prato, 'libri', today).score, null, 'Past-edition restrictions do not reject future participants');
for (const event of catalog.events) {
    for (const article of Object.keys(api.ARTICLE_TYPES)) {
        const value = api.articleAffinity(event, article, today);
        assert(value.score === null || [2, 6, 7, 8, 9].includes(value.score));
        if (value.score !== null && value.score < 6) assert.equal(value.evidence, 'excluded');
    }
}
const withoutResearch = data => ({ ...data, events: data.events.map(({ articleResearch, merchandiseSectors, ...event }) => event) });
assert.deepEqual(withoutResearch(catalog), withoutResearch(JSON.parse(execFileSync('git', ['show', 'HEAD:data/fiere.json'], { cwd: root, encoding: 'utf8', maxBuffer: 40 * 1024 * 1024 }))));
console.log('Prudent affinity: explicit/unknown, exclusions, freshness, operator/area scope, food-service exception and ' + catalog.events.length * Object.keys(api.ARTICLE_TYPES).length + ' fair/article pairs passed.');
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const file = path.resolve(root, (url.pathname === '/fiere' ? '/fiere.html' : url.pathname).slice(1));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' })[path.extname(file)] || 'text/plain');
    fs.readFile(file, (error, data) => error ? res.writeHead(404).end() : res.end(data));
});
function contrast(foreground, background) {
    const luminance = color => {
        const rgb = color.match(/[\d.]+/g).slice(0, 3).map(Number).map(c => (c /= 255) <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
        return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
    };
    const a = luminance(foreground), b = luminance(background);
    return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}
async function run(engine, label, width, height, base) {
    const browser = await engine.launch({ headless: true });
    try {
        const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 720 });
        await context.route('**/*', route => {
            const url = new URL(route.request().url());
            if (['/js/supabase-config.js', '/js/auth.js', '/js/page-view-tracker.js'].includes(url.pathname)) return route.fulfill({ contentType: 'application/javascript', body: '' });
            return url.origin === new URL(base).origin ? route.continue() : route.abort();
        });
        const page = await context.newPage(), errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(base + '/fiere');
        await page.waitForFunction(count => document.querySelector('#list-count').textContent === String(count), catalog.events.length);
        assert.equal(await page.locator('.fiere-fit-badge').count(), 0);
        assert.equal(await page.getByText('Scegli articolo', { exact: true }).count(), 0);
        await page.locator('#article-summary').click();
        assert(await page.locator('#article-filter').getAttribute('open') !== null);
        await page.locator('#article-options input[value="calzature"]').check();
        await page.locator('#article-summary').focus(); await page.keyboard.press('Escape');
        const expected = api.sortEvents(api.filterEvents(catalog.events, { months: [], query: '', articles: ['calzature'] }));
        await page.waitForFunction(count => document.querySelector('#list-count').textContent === String(count), expected.length);
        const badges = await page.locator('.fiere-card').evaluateAll(cards => cards.map(card => ({ id: card.dataset.eventId, score: Number(card.querySelector('.fiere-fit-badge').dataset.score) })));
        assert.deepEqual(badges, expected.slice(0, 12).map(event => ({ id: event.id, score: api.articleAffinity(event, 'calzature').score })));
        const first = page.locator('.fiere-fit-badge').first();
        const cardBox = await page.locator('.fiere-card-content').first().boundingBox(), badgeBox = await first.boundingBox();
        assert(badgeBox.x >= cardBox.x + cardBox.width, 'Rating stays to the right');
        assert(badgeBox.width >= 44 && badgeBox.height >= 44);
        await first.focus(); await page.keyboard.press('Enter');
        assert(await page.locator('#article-fit-dialog').isVisible());
        assert.equal(await page.locator('#fit-items li').count(), 1);
        assert((await page.locator('#fit-description').innerText()).includes('Non misura vendite'));
        await page.locator('.fiere-fit-criteria summary').click();
        assert.equal(await page.locator('#fit-source').getAttribute('data-fiere-source'), expected[0].source.url);
        assert.equal(await page.locator('#fit-source-text').innerText(), expected[0].sectors);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('#article-fit-dialog').isVisible(), false);
        assert(await first.evaluate(element => element === document.activeElement));
        await page.locator('#article-summary').click();
        await page.locator('#article-options input[value="calzature"]').uncheck();
        await page.waitForFunction(count => document.querySelector('#list-count').textContent === String(count), catalog.events.length);
        assert.equal(await page.locator('.fiere-fit-badge').count(), 0, 'Removing the last article leaves no affinity control');
        await page.locator('#article-options input[value="calzature"]').check();
        await page.waitForSelector('.fiere-fit-badge');
        await page.locator('#clear-articles').click();
        await page.waitForFunction(count => document.querySelector('#list-count').textContent === String(count), catalog.events.length);
        assert.equal(await page.locator('.fiere-fit-badge').count(), 0, 'Clear all removes the affinity control');
        await page.goto(base + '/fiere?articoli=calzature,dolciumi,intimo');
        await page.waitForSelector('.fiere-fit-badge[data-score]');
        await page.locator('.fiere-fit-badge').first().click();
        assert.equal(await page.locator('#fit-items li').count(), 3);
        assert(await page.locator('#fit-selection-note').isVisible());
        await page.locator('#close-article-fit').click();
        await page.reload();
        await page.waitForSelector('.fiere-fit-badge[data-score]');
        assert.equal(new URL(page.url()).searchParams.get('articoli'), 'calzature,dolciumi,intimo');
        await page.locator('#reset-filters').click();
        await page.waitForFunction(count => document.querySelector('#list-count').textContent === String(count), catalog.events.length);
        assert.equal(await page.locator('.fiere-fit-badge').count(), 0);
        await page.locator('#load-more').click();
        assert.equal(await page.locator('.fiere-card').count(), 62);
        assert.equal(await page.locator('.fiere-fit-badge').count(), 0);
        await page.reload();
        await page.waitForFunction(count => document.querySelector('#list-count').textContent === String(count), catalog.events.length);
        assert.equal(await page.locator('.fiere-fit-badge').count(), 0);
        if (process.env.FIERE_AFFINITY_OUTPUT) {
            fs.mkdirSync(process.env.FIERE_AFFINITY_OUTPUT, { recursive: true });
            await page.locator('.fiere-list-panel').scrollIntoViewIfNeeded();
            await page.screenshot({ path: path.join(process.env.FIERE_AFFINITY_OUTPUT, label + '-' + width + '-no-article.png') });
        }
        if (process.env.FIERE_AFFINITY_OUTPUT) {
            fs.mkdirSync(process.env.FIERE_AFFINITY_OUTPUT, { recursive: true });
            await page.goto(base + '/fiere?articoli=calzature');
            await page.waitForSelector('.fiere-fit-badge[data-score]');
            await page.locator('.fiere-list-panel').scrollIntoViewIfNeeded();
            await page.screenshot({ path: path.join(process.env.FIERE_AFFINITY_OUTPUT, label + '-' + width + '-cards.png') });
        }
        // Isolated fixtures make low/unknown scores testable without changing
        // the production catalogue or weakening its existing article filter.
        await context.route('**/data/fiere.json?*', route => {
            const current = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Rome' });
            const future = String(Number(current.slice(0, 4)) + 1) + '-12-01';
            const template = catalog.events[0];
            const definitions = ['Calzature; esclusi alimentari', 'Calzature e casalinghi', 'Calzature; hobbisti: esclusi alimentari'];
            const fixtures = definitions.map((sectors, index) => ({ ...template, articleResearch: undefined, id: 'affinity-fixture-' + index, name: ['Fiera delle calzature', 'Merci diverse', 'Regole per hobbisti'][index], sectors, attendance: undefined, months: [10], merchandiseSectors: ['non-alimentare'], source: { ...template.source, checkedAt: current }, editions: [{ year: Number(future.slice(0, 4)), start: future, end: future, dateType: 'confirmed', sourceUrl: template.source.url }] }));
            return route.fulfill({ json: { ...catalog, events: fixtures } });
        });
        await page.goto(base + '/fiere?articoli=calzature,dolciumi,intimo');
        await page.waitForFunction(() => document.querySelector('#list-count').textContent === '3');
        const fixture = page.locator('[data-event-id="affinity-fixture-0"] .fiere-fit-badge');
        assert.equal(await fixture.getAttribute('data-score'), '8');
        await fixture.click();
        const values = await page.locator('#fit-items .fiere-fit-value').allTextContents();
        assert.deepEqual(values, ['8/10', '2/10', 'Da valutare']);
        const colors = await page.locator('#fit-items .fiere-fit-value').evaluateAll(nodes => nodes.map(node => ({ score: node.dataset.score, color: getComputedStyle(node).color, background: getComputedStyle(node).backgroundColor })));
        for (const value of colors) assert(contrast(value.color, value.background) >= 4.5);
        const [green, red] = colors;
        assert.notEqual(green.color, red.color);
        await page.locator('#close-article-fit').click();
        assert.equal(await page.locator('[data-event-id="affinity-fixture-1"] .fiere-fit-badge').getAttribute('data-score'), '6');
        await page.locator('[data-event-id="affinity-fixture-2"] .fiere-fit-badge').click();
        assert.deepEqual(await page.locator('#fit-items .fiere-fit-value').allTextContents(), ['6/10', 'Da valutare', 'Da valutare']);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        assert.deepEqual(errors, []);
        console.log(label + ' ' + width + 'x' + height + ': real scores, right-side cards, source/criteria, multi-article, neutral/red/green, contrast, touch, keyboard, reload and reset passed.');
    } finally { await browser.close(); }
}
(async () => {
    const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = process.env.FIERE_TEST_BASE_URL || 'http://127.0.0.1:' + server.address().port;
    try { for (const [engine, width, height] of [['chromium', 1440, 1000], ['chromium', 820, 1000], ['chromium', 320, 568], ['webkit', 390, 844]]) await run(playwright[engine], engine, width, height, base); }
    finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
