// A-07: vero handler SSR, backend fittizio; nessuna scrittura o rete esterna.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const Module = require('node:module');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const out = process.env.A07_PROOFS || path.join(root, '.local/verifiche/a07');
fs.mkdirSync(out, { recursive: true });
let handler = require('../api/annunci-citta.js');
if (process.env.A07_HANDLER) {
    const original = path.join(root, 'api/annunci-citta.js');
    const loaded = new Module(original, module);
    loaded.filename = original;
    loaded.paths = module.paths;
    loaded._compile(fs.readFileSync(process.env.A07_HANDLER, 'utf8'), original);
    handler = loaded.exports;
}
const fixture = (id, comune, provincia, extra = {}) => ({ id, comune, provincia,
    titolo: `Posteggio ${id}`, descrizione: 'Dati fittizi per la verifica', prezzo: 12000,
    stato: 'Vendita', status: 'active', img_urls: [], created_at: '2026-10-01T12:00:00Z', ...extra });
const standard = Array.from({ length: 6 }, (_, i) => fixture(`standard-${i}`, 'Brescia', 'Brescia'));
const cases = [];
async function render(data, citta = 'brescia', failure = '') {
    const realFetch = global.fetch;
    let query;
    global.fetch = async (url, options) => {
        query = new URL(url);
        assert.equal(query.origin, 'https://mhfbtltgwibwmsudsuvf.supabase.co');
        assert.equal(query.searchParams.get('status'), 'eq.active');
        assert.equal(query.searchParams.get('order'), 'featured.desc,created_at.desc');
        assert.equal(query.searchParams.get('limit'), '500');
        assert(!query.searchParams.get('select').includes('*'));
        assert(!/telefono|email|contatto|profiles/.test(query.searchParams.get('select')));
        assert(!options.method || options.method === 'GET');
        if (failure === 'network') throw Error('Offline simulato');
        const columns = query.searchParams.get('select').split(',');
        const visible = data.filter(row => row.status === 'active')
            .sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || b.created_at.localeCompare(a.created_at))
            .slice(0, 500).map(row => Object.fromEntries(columns.filter(k => k in row).map(k => [k, row[k]])));
        return { ok: !failure, json: async () => visible };
    };
    const response = { headers: {}, code: 0, body: '',
        setHeader(k, v) { this.headers[k.toLowerCase()] = v; return this; },
        status(code) { this.code = code; return this; },
        send(body) { this.body = body; return this; }, end() { return this; } };
    try { await handler({ query: { citta } }, response); } finally { global.fetch = realFetch; }
    response.ids = [...response.body.matchAll(/<a href="\/annuncio\?id=([^"]+)"/g)].map(m => m[1]);
    response.graph = response.body.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    response.graph = response.graph ? JSON.parse(response.graph[1])['@graph'] : [];
    return response;
}
async function check(name, fn) { await fn(); cases.push({ name, passed: true }); }
async function inclusion(name, listing, expected, city = 'brescia', primary = standard) {
    await check(name, async () => {
        const response = await render([...primary, listing], city);
        assert.equal(response.ids.includes(listing.id), expected, name);
    });
}
async function main() {
    await inclusion('Rivoltella nel formato salvato dal selettore', fixture('rivoltella', 'Rivoltella (Desenzano del Garda)', 'Brescia'), true);
    if (process.env.A07_CRITICAL_ONLY) return;
    await inclusion('Comune standard', fixture('desenzano', 'Desenzano del Garda', 'Brescia'), true);
    await inclusion('Caso pubblico riconfermato con fixture', fixture('villaggio-badia', 'Villaggio Badia (Roncadelle)', 'Brescia'), true);
    await inclusion('Provincia esplicita anche senza anagrafica', fixture('new-place', 'Nuova località di fixture', 'Brescia'), true);
    await inclusion('Provincia esplicita senza comune', fixture('province-only', null, 'Brescia'), true);
    await inclusion('Sigla provincia', fixture('province-code', 'Rivoltella', 'BS'), true);
    await inclusion('Località con accenti e spazi', fixture('normalized', ' RIVOLTÈLLA (Desenzano del Garda) ', '  brèscia '), true);
    await inclusion('Località univoca senza provincia', fixture('no-province', 'Rivoltella (Desenzano del Garda)', null), true);
    await inclusion('Comune univoco senza provincia', fixture('unique-city', 'Desenzano del Garda', ''), true);
    await inclusion('Comune ufficiale univoco con regione legacy errata', fixture('legacy-region', 'Desenzano del Garda', null, { regione: 'Sicilia' }), true);
    await inclusion('Omonimo con provincia Brescia', fixture('bare-bs', 'Rivoltella', 'Brescia'), true);
    await inclusion('Omonimo con provincia Pavia escluso dal tier provinciale', fixture('bare-pv', 'Rivoltella', 'Pavia'), false);
    await inclusion('Omonimo senza contesto escluso', fixture('ambiguous', 'Rivoltella', null), false);
    await inclusion('Provincia contraddittoria non aggira il tier1', fixture('wrong-target-province', 'Brescia', 'Roma'), false);
    await inclusion('Provincia ignota non usa le coordinate del nome', fixture('unknown-province', 'Desenzano del Garda', 'Provincia fittizia'), false, 'brescia', []);
    await inclusion('Coordinate non indovinate da comune tra parentesi', fixture('invented-locality', 'Località inventata (Desenzano del Garda)', null), false, 'brescia', []);
    await inclusion('Dati geografici assenti', fixture('empty', null, null), false);
    await inclusion('Omonimo comune Castro LE non associato a Bergamo', fixture('castro-le', 'Castro', 'Lecce'), false, 'bergamo', standard.map(l => ({ ...l, comune: 'Bergamo', provincia: 'Bergamo' })));
    await inclusion('Omonimo comune Castro BG', fixture('castro-bg', 'Castro', 'Bergamo'), true, 'bergamo', []);
    await inclusion('Omonimo comune senza provincia non indovinato', fixture('castro-unknown', 'Castro', null), false, 'bergamo', []);
    await inclusion('Regione risolve omonimo senza provincia', fixture('castro-region', 'Castro', null, { regione: 'Puglia' }), true, 'lecce', []);
    await inclusion('Regione non forza coordinate incompatibili', fixture('wrong-region', 'Castro', null, { regione: 'Sicilia' }), false, 'lecce', []);
    await inclusion('Nuovo comune dopo fusione', fixture('settev', 'Setteville', null), true, 'belluno', []);
    await inclusion('Vecchio nome comunale senza provincia', fixture('old-name', 'Quero Vas', null), true, 'belluno', []);
    await inclusion('Provincia non inventata per località ambigua nella stessa provincia', fixture('same-province-ambiguous', 'San Pietro', null), false, 'brescia', []);
    await inclusion('Provincia nota sufficiente anche con località ambigua', fixture('same-province-known', 'San Pietro', 'Brescia'), true);
    await inclusion('Località fuori provincia nel raggio con etichetta km', fixture('pv-radius', 'Rivoltella (Rosasco)', 'Pavia'), true, 'brescia', []);
    await check('Distanza dalla località e non dal comune padre', async () => {
        const response = await render([fixture('rivoltella-radius', 'Rivoltella (Desenzano del Garda)', 'Brescia')], 'sirmione');
        assert.deepEqual(response.ids, ['rivoltella-radius']);
        assert.match(response.body, /Rivoltella \(Desenzano del Garda\) · 5 km/);
    });
    await check('Nessuna espansione provinciale per città turistica', async () => {
        assert.deepEqual((await render([fixture('remote-province', 'Località ignota', 'Brescia')], 'sirmione')).ids, []);
    });
    await check('Comune ordinario conserva solo match esatto', async () => {
        const response = await render([fixture('parent', 'Bussolengo', 'Verona'), fixture('fraction', 'Località di fixture (Bussolengo)', 'Verona')], 'bussolengo');
        assert.deepEqual(response.ids, ['parent']);
    });
    await check('Comune ordinario senza match mantiene redirect', async () => {
        const response = await render([], 'bussolengo');
        assert.equal(response.code, 302);
        assert.equal(response.headers.location, '/annunci?q=Bussolengo');
    });
    await check('Slug ignoto e invalido conservano risposta', async () => {
        const unknown = await render([], 'citta-fittizia-a07');
        assert.equal(unknown.code, 404); assert.match(unknown.body, /content="noindex"/);
        assert.equal((await render([], '<script>')).headers.location, '/annunci');
    });
    await check('Placeholder ed errori provider conservati', async () => {
        for (const failure of ['', 'http', 'network']) {
            const response = await render([], 'brescia', failure);
            assert.equal(response.code, 200); assert.match(response.body, /0 annunci attivi/);
        }
    });
    await check('Annunci non attivi esclusi dalla query pubblica', async () => {
        const data = ['pending', 'sold', 'rejected', 'draft'].map(status => fixture(status, 'Brescia', 'Brescia', { status }));
        assert.deepEqual((await render(data)).ids, []);
    });
    await check('Tier, ordinamento, scaduti e deduplica conservati', async () => {
        const data = [fixture('radius', 'Rivoltella (Rosasco)', 'Pavia', { featured: true }),
            fixture('expired', 'Brescia', 'Brescia', { featured: true, expires_at: '2000-01-01' }),
            fixture('city-featured', 'Brescia', 'Brescia', { featured: true }),
            fixture('city-recent', 'Brescia', 'Brescia', { created_at: '2026-11-01T12:00:00Z' }),
            fixture('prov-featured', 'Rivoltella (Desenzano del Garda)', 'Brescia', { featured: true }),
            fixture('prov-other', 'Desenzano del Garda', 'Brescia')];
        assert.deepEqual((await render(data)).ids, ['city-featured', 'city-recent', 'prov-featured', 'prov-other', 'radius', 'expired']);
    });
    await check('Soglia sei e limite cinquanta conservati', async () => {
        const many = Array.from({ length: 55 }, (_, i) => fixture(`listing-${i}`, 'Rivoltella (Desenzano del Garda)', 'Brescia'));
        const response = await render(many);
        assert.equal(response.ids.length, 50);
        assert.equal(response.graph.find(row => row['@type'] === 'ItemList').numberOfItems, 50);
        assert.equal(response.graph.find(row => row['@type'] === 'ItemList').itemListElement.length, 10);
    });
    await check('SEO, cache ed escaping conservati', async () => {
        const response = await render([...standard, fixture('safe', 'Nuova <località>', 'Brescia', { titolo: '<script>alert(1)</script>' })]);
        assert.equal(response.headers['cache-control'], 's-maxage=3600, stale-while-revalidate=86400');
        assert.match(response.body, /rel="canonical" href="https:\/\/subingresso.it\/annunci\/brescia"/);
        assert.match(response.body, /content="index,follow,max-image-preview:large"/);
        assert.match(response.body, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
        assert.match(response.body, /Nuova &lt;località&gt;/);
        assert.deepEqual(response.graph.map(row => row['@type']), ['ItemList', 'BreadcrumbList', 'AggregateOffer', 'FAQPage']);
    });
    await check('Coordinate e omonimi coerenti con resolver condiviso', async () => {
        const sandbox = { window: {}, AbortController, setTimeout, clearTimeout, fetch: async url => ({ ok: true,
            json: async () => JSON.parse(fs.readFileSync(path.join(root, url.split('?')[0]), 'utf8')) }) };
        vm.createContext(sandbox);
        for (const file of ['js/comune-picker.js', 'js/location-search.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox);
        await sandbox.window.LocationSearch.load(); await sandbox.window.LocationSearch.loadGeo();
        const { resolveListingLocation } = require('../lib/listing-location.cjs');
        for (const listing of [fixture('a', 'Rivoltella (Desenzano del Garda)', 'Brescia'), fixture('b', 'Rivoltella', 'Pavia'),
            fixture('c', 'Castro', 'Lecce'), fixture('d', 'Castro', null), fixture('e', 'Desenzano del Garda', null)]) {
            const actual = resolveListingLocation(listing).location;
            const expected = sandbox.window.LocationSearch.listingCoordinates(listing.comune, listing.regione, listing.provincia);
            assert.deepEqual(actual ? [actual.lat, actual.lng] : null, expected ? Array.from(expected) : null);
        }
    });
    if (process.env.A07_SKIP_BROWSER) return;
    const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    const response = await render([...standard, fixture('browser-rivoltella', 'Rivoltella (Desenzano del Garda)', 'Brescia')]);
    const server = http.createServer((req, res) => {
        const url = new URL(req.url, 'http://localhost');
        if (url.pathname.startsWith('/annunci/')) { res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.end(response.body); }
        const file = path.resolve(root, '.' + url.pathname);
        if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
        res.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : 'application/javascript');
        fs.readFile(file, (error, bytes) => error ? res.writeHead(404).end() : res.end(bytes));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        for (const [engine, width] of [['chromium', 1440], ['chromium', 320], ['webkit', 390]]) {
            const browser = await playwright[engine].launch({ headless: true });
            try {
                await check(`Browser SSR ${engine} ${width}`, async () => {
                    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
                    const base = `http://127.0.0.1:${server.address().port}`;
                    await context.route('**/*', route => {
                        const url = new URL(route.request().url());
                        // Nessun tracking/provider; gli script di shell sono fuori da A-07.
                        if (url.origin !== base || (url.pathname.endsWith('.js') && !url.pathname.endsWith('/admin-theme.js'))) return route.fulfill({ status: 200, body: '' });
                        return route.continue();
                    });
                    const page = await context.newPage();
                    await page.goto(base + '/annunci/brescia');
                    const card = page.locator('a[href="/annuncio?id=browser-rivoltella"]');
                    await card.waitFor({ state: 'visible' });
                    assert.match(await card.innerText(), /Rivoltella \(Desenzano del Garda\)/);
                    assert.equal(await page.locator('.card-grid > a').count(), 7);
                    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://subingresso.it/annunci/brescia');
                    await page.locator('details summary').first().click();
                    assert.equal(await page.locator('details').first().getAttribute('open'), '');
                    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
                    await page.screenshot({ path: path.join(out, `${engine}-${width}.png`), fullPage: true });
                    await context.close();
                });
            } finally { await browser.close(); }
        }
    } finally { await new Promise(resolve => server.close(resolve)); }
}
main().then(() => {
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ passed: true, count: cases.length, cases, externalWrites: 0 }, null, 2));
    console.log(`A-07: ${cases.length} scenari PASS`);
}).catch(error => {
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({ passed: false, cases, error: error.message, externalWrites: 0 }, null, 2));
    console.error(error); process.exitCode = 1;
});
