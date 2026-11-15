// Read-only UI checks: real catalogue, isolated auth/reviews/organizer responses.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const { events } = require('../data/fiere.json');
const spunta = require('../js/fair-spunta');
const byId = id => events.find(event => event.id === id);
const sample = byId('lombardia-brescia-fiera-dei-santi-faustino-e-giovita');
assert(spunta.allows(sample));
assert(events.filter(event => event.city === 'Brescia' && spunta.allows(event)).length === 9);
for (const id of [
    'lombardia-borgo-san-giacomo-cose-mai-viste-padernello',
    'sardegna-ozieri-fiera-zootecnica-e-agroalimentare',
    'valle-d-aosta-nus-lo-martchia-de-tsalende',
    'sicilia-castelvetrano-fiera-di-san-giovanni',
    'lazio-sezze-fiera-di-san-luca',
    'liguria-chiavari-fiera-agricola',
    'emilia-romagna-cervia-mercato-straordinario-di-dicembre',
    'marche-montegranaro-fiera-di-san-serafino'
]) {
    assert(byId(id), 'Missing negative regression fixture: ' + id);
    assert.equal(spunta.allows(byId(id)), false, id);
}
for (const event of [
    null, {}, { ...sample, id: 'unknown' },
    { ...sample, managedEventId: 'organizer' },
    { ...sample, source: { ...sample.source, url: 'https://example.com/changed' } },
    { ...sample, participation: { ...sample.participation, note: 'Spunta non ammessa.' } },
    { ...sample, participation: { ...sample.participation, note: sample.participation.note + ' Condizioni aggiornate.' } }
]) assert.equal(spunta.allows(event), false);
console.log('PASS evidence: ' + events.filter(spunta.allows).length + ' confirmations, 9 Brescia fairs, unknown/negative/other-event/changed evidence hidden.');

const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const file = path.resolve(root, '.' + (url.pathname === '/fiere' ? '/fiere.html' : url.pathname));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    fs.readFile(file, (error, data) => {
        if (error) return res.writeHead(404).end();
        res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' })[path.extname(file)] || 'application/octet-stream');
        res.end(data);
    });
});
const authStub = `window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},rpc:async()=>({data:[]}),from:()=>({select(){return this},eq(){return this},order(){return this},limit(){return this},then(fn){return Promise.resolve({data:[]}).then(fn)}})})};`;
function contrast(foreground, background) {
    const luminance = color => color.match(/\d+/g).slice(0, 3).map(Number).map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + .05) / (values[1] + .05);
}
(async () => {
    const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = process.env.SPUNTA_BASE_URL || 'http://127.0.0.1:' + server.address().port;
    const out = path.join(root, '.local/verifiche/spunta', process.env.SPUNTA_BASE_URL ? 'published' : 'local');
    fs.mkdirSync(out, { recursive: true });
    for (const [engine, width] of [['chromium', 1440], ['chromium', 768], ['chromium', 390], ['chromium', 320], ['webkit', 390]]) {
        const browser = await playwright[engine].launch({ headless: true });
        try {
            const page = await browser.newPage({ viewport: { width, height: 1000 } });
            const errors = [];
            page.on('pageerror', error => errors.push(error.message));
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.route('**/*', route => {
                const url = new URL(route.request().url());
                if (url.hostname === 'cdn.jsdelivr.net') return route.fulfill({ contentType: 'text/javascript', body: authStub });
                if (url.pathname === '/api/saved-fairs') {
                    const fairs = JSON.parse(url.searchParams.get('fairs') || '[]');
                    return route.fulfill({ json: url.searchParams.has('summary') ? fairs.map(fair => ({ ...fair, count: 0, average: null })) : { count: 0, average: null, reviews: [] } });
                }
                if (url.pathname.endsWith('/published_organizer_events')) return route.fulfill({ json: [] });
                if (['cdnjs.cloudflare.com', 'fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname)) return route.continue();
                return url.origin === new URL(base).origin ? route.continue() : route.abort();
            });
            const response = await page.goto(base + '/fiere?provincia=Brescia&mesi=1,2,3,4,5,6,7,8,9,10,11,12');
            assert.equal(response.status(), 200);
            await page.locator('.fiere-card').first().waitFor();
            await page.waitForLoadState('networkidle');
            await page.locator('#extra-filters > summary').click();
            await page.locator('#fair-search').fill('Faustino');
            await page.waitForURL(url => url.searchParams.get('q') === 'Faustino');
            const card = page.locator('.fiere-card[data-event-id="' + sample.id + '"]');
            await card.waitFor();
            assert.equal(await card.locator('.fiere-spunta').textContent(), 'Spunte ammesse');
            assert.match(await card.locator('.fiere-spunta').getAttribute('title'), /posti liberi/);
            for (const dark of [false, true]) {
                await page.evaluate(value => document.documentElement.classList.toggle('admin-dark', value), dark);
                const colors = await card.locator('.fiere-spunta').evaluate(element => ({ foreground: getComputedStyle(element).color, background: getComputedStyle(element).backgroundColor }));
                assert(contrast(colors.foreground, colors.background) >= 4.5, JSON.stringify(colors));
                assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
                const geometry = await card.evaluate(element => {
                    const badge = element.querySelector('.fiere-spunta').getBoundingClientRect();
                    const button = element.querySelector('.fiere-card-button').getBoundingClientRect();
                    return { badgeRight: badge.right, buttonLeft: button.left, badgeBottom: badge.bottom, buttonTop: button.top };
                });
                assert(geometry.badgeRight <= geometry.buttonLeft || geometry.badgeBottom <= geometry.buttonTop, 'Badge overlaps open button');
                await card.screenshot({ path: path.join(out, engine + '-' + width + (dark ? '-dark' : '') + '-card.png') });
            }
            await card.locator('.fiere-card-button').click();
            await page.locator('#fair-dialog[open]').waitFor();
            assert.match(await page.locator('#detail-participation-note').textContent(), /comunicazione per partecipare alla spunta/);
            await page.keyboard.press('Escape');
            await page.locator('#fair-search').fill('Cose mai viste');
            await page.waitForURL(url => url.searchParams.get('q') === 'Cose mai viste');
            const negative = page.locator('.fiere-card[data-event-id="lombardia-borgo-san-giacomo-cose-mai-viste-padernello"]');
            await negative.waitFor();
            assert.equal(await negative.locator('.fiere-spunta').count(), 0);
            await page.locator('#fair-search').fill('Brescia');
            await page.waitForURL(url => url.searchParams.get('q') === 'Brescia');
            await page.locator('.fiere-marker[data-events*="' + sample.id + '"]').click();
            await page.locator('#map-popup').waitFor({ state: 'visible' });
            assert.equal(await page.locator('#popup-events .fiere-spunta').count(), 9);
            await page.locator('#map-popup').screenshot({ path: path.join(out, engine + '-' + width + '-map.png') });
            assert.deepEqual(errors, []);
            console.log('PASS ' + engine + ' ' + width + ': card/map, absent badge, details, contrast, no overflow/overlap/errors, light/dark screenshots.');
        } finally { await browser.close(); }
    }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());
