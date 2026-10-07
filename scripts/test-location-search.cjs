// Copertura di tutti i comuni e regressioni sulle due pagine reali, desktop/mobile.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const comuni = require('../data/comuni-picker.json');
const localita = require('../data/localita.json').localita;
const sandbox = { window: {}, AbortController, setTimeout, clearTimeout,
    fetch: async url => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(path.join(root, url.split('?')[0]), 'utf8')) }) };
vm.createContext(sandbox);
for (const file of ['js/comune-picker.js', 'js/location-search.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox);
for (const file of ['index.html', 'annunci.html']) {
    for (const [tag, source] of fs.readFileSync(path.join(root, file), 'utf8').matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
        if (!tag.includes('application/ld+json')) new vm.Script(source, { filename: file });
    }
}
const mockListings = [
    { id: 'near-moniga', comune: 'Moniga del Garda', regione: 'Lombardia', titolo: 'Posteggio Moniga' },
    { id: 'castro-bg', comune: 'Castro', regione: 'Lombardia', titolo: 'Posteggio Castro BG' },
    { id: 'castro-le', comune: 'Castro', regione: 'Puglia', titolo: 'Posteggio Castro LE' },
    { id: 'rivoltella-bs', comune: 'Rivoltella (Desenzano del Garda)', regione: 'Lombardia', titolo: 'Mercato Rivoltella BS' },
    { id: 'rivoltella-pv', comune: 'Rivoltella (Rosasco)', regione: 'Lombardia', titolo: 'Mercato Rivoltella PV' },
    { id: 'monterusciello', comune: 'Monterusciello', regione: 'Campania', titolo: 'Mercato Monterusciello' }
];
const backend = `window._supabase={from(table){const q={select(){return q},eq(){return q},neq(){return q},or(){return q},not(){return q},order(){return q},limit(){return q},in(){return q},then(resolve){return Promise.resolve({data:table==='annunci'?${JSON.stringify(mockListings)}:[],error:null}).then(resolve)}};return q}};`;
const auth = `window.getCurrentUser=async()=>null; buildCard=l=>'<article data-id="'+l.id+'">'+escapeHTML(l.titolo)+'</article>'; window.observeCardViews=()=>{};`;
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let filename = decodeURIComponent(url.pathname).slice(1) || 'index.html';
    if (!path.extname(filename)) filename += '.html';
    const full = path.resolve(root, filename);
    if (!full.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    res.setHeader('Content-Type', ({ '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json' })[path.extname(full)] || 'application/octet-stream');
    if (filename === 'js/supabase-config.js') { res.end(backend); return; }
    if (filename === 'js/auth.js') { res.end(auth); return; }
    if (['js/ui-components.js', 'js/page-view-tracker.js'].includes(filename)) { res.end(''); return; }
    fs.readFile(full, (error, data) => { if (error) res.writeHead(404).end(); else res.end(data); });
});

async function check(engine, name, mobile, base) {
    const browser = await engine.launch({ headless: true });
    try {
        const context = await browser.newContext({ viewport: mobile ? { width:390, height:844 } : { width:1280, height:900 }, hasTouch:mobile });
        await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.fulfill({ status:200, body:'' }));
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const choose = option => mobile ? option.tap() : option.click();
        for (const [url, id] of [['/', 'searchInput'], ['/annunci', 'searchBar']]) {
            await page.goto(base + url);
            await page.evaluate(() => locationSearch.ready);
            const input = page.locator('#' + id);
            if (mobile) assert.equal(await input.evaluate(el => getComputedStyle(el).fontSize), '16px');
            for (const [query, expected] of [
                ['Moniga', 'Moniga del Garda (BS)'], ['Morterone', 'Morterone (LC)'],
                ['laquila', "L'Aquila (AQ)"], ['aglie', 'Agliè (TO)'],
                ['brecsia', 'Brescia (BS)'], ['montemgno', 'Montemagno Monferrato (AT)'],
                ['Quero Vas', 'Setteville (BL)'], ['Castro LE', 'Castro (LE)'],
                ['Rivoltella', 'Rivoltella (Desenzano del Garda) (BS)'],
                ['Monterusciello', 'Monterusciello (Pozzuoli) (NA)'],
                ['Torre del Lago', 'Torre del Lago Puccini (Viareggio) (LU)']
            ]) {
                await input.fill(query);
                await page.getByRole('option').filter({ hasText:expected }).waitFor({ state:'visible' });
                assert.equal(await input.inputValue(), query, 'non modifica il testo mentre si scrive');
            }
            await input.fill('Castro');
            await input.press('Enter');
            assert.equal(await page.locator('[role="listbox"]').isVisible(), true, 'chiede la provincia per gli omonimi');
            await choose(page.getByRole('option').filter({ hasText:'Castro (LE)' }));
            if (id === 'searchInput') {
                await page.waitForURL('**/annunci?*');
                assert.equal(new URL(page.url()).searchParams.get('comune'), comuni.find(row => row.nome === 'Castro' && row.sigla === 'LE').codiceIstat);
                await page.waitForFunction(() => document.getElementById('subtitle').textContent.includes('vicino a Castro'));
            }
            await page.locator('#resultCount').filter({ hasText:'1 annunci' }).waitFor();
            await page.locator('[data-id="castro-le"]').waitFor();
            assert.equal(await page.locator('[data-id="castro-bg"]').count(), 0, 'il comune omonimo distante non entra nei risultati');
        }
        await page.goto(base + '/annunci');
        await page.evaluate(() => locationSearch.ready);
        const input = page.locator('#searchBar');
        await input.fill('Moniga');
        await input.press('ArrowDown');
        assert.equal(await input.inputValue(), 'Moniga', 'le frecce non riscrivono la query');
        await input.press('Enter');
        await page.locator('#subtitle').filter({ hasText:'vicino a Moniga del Garda' }).waitFor();
        await page.locator('[data-id="near-moniga"]').waitFor();
        await input.fill('frutta');
        await page.getByRole('option', { name:'frutta', exact:true }).waitFor({ state:'visible' });
        await input.press('Escape');
        assert.equal(await input.getAttribute('aria-expanded'), 'false');

        await page.goto(base + '/');
        await page.evaluate(() => locationSearch.ready);
        await page.locator('#searchInput').fill('Rivoltella');
        await choose(page.getByRole('option').filter({hasText:'Rivoltella (Desenzano del Garda)'}));
        await page.waitForURL('**/annunci?*');
        assert.equal(new URL(page.url()).searchParams.get('comune'), 'geonames:3169227');
        await page.waitForFunction(() => locationSearch.selected?.id === 'geonames:3169227');
        await page.selectOption('#radiusKm', '50');
        await page.evaluate(() => applyFilters());
        await page.locator('[data-id="rivoltella-bs"]').waitFor();
        assert.equal(await page.locator('[data-id="rivoltella-pv"]').count(), 0);
        await page.locator('#searchBar').fill('Monterusciello');
        await choose(page.getByRole('option').filter({hasText:'Monterusciello (Pozzuoli)'}));
        await page.locator('[data-id="monterusciello"]').waitFor();

        // Risposta lenta: mostra i suggerimenti appena arrivano, senza perdere quanto scritto.
        let release;
        const gate = new Promise(resolve => { release = resolve; });
        await page.route('**/data/comuni-picker.json*', async route => { await gate; await route.continue(); });
        await page.goto(base + '/');
        await page.locator('#searchInput').fill('Morterone');
        await page.getByRole('status').filter({ hasText:'Caricamento' }).waitFor();
        release();
        await page.getByRole('option').filter({ hasText:'Morterone (LC)' }).waitFor({ state:'visible' });
        await page.unroute('**/data/comuni-picker.json*');

        // Il retry conserva la query dopo entrambi i tentativi falliti.
        await page.route('**/data/comuni-picker.json*', route => route.fulfill({ status:503, body:'offline' }));
        await page.goto(base + '/');
        await page.locator('#searchInput').fill('Morterone');
        await page.getByRole('button', { name:'Riprova', exact:true }).waitFor({ state:'visible' });
        await page.unroute('**/data/comuni-picker.json*');
        await choose(page.getByRole('button', { name:'Riprova', exact:true }));
        await page.getByRole('option').filter({ hasText:'Morterone (LC)' }).waitFor({ state:'visible' });
        assert.equal(await page.locator('#searchInput').inputValue(), 'Morterone');
        assert.deepEqual(errors, []);
        if (process.env.LOCATION_SCREENSHOT && name === 'chromium') await page.screenshot({ path: process.env.LOCATION_SCREENSHOT + (mobile ? '-mobile.png' : '-desktop.png') });
        console.log(`OK ${name} ${mobile ? 'mobile' : 'desktop'}: home, annunci, comuni piccoli, omonimi, refusi, tastiera, rete lenta e retry`);
    } finally { await browser.close(); }
}

(async () => {
    const search = sandbox.window.LocationSearch;
    await search.load();
    await search.loadGeo();
    for (const row of comuni) assert(search.match(`${row.nome} (${row.sigla})`).some(item => item.row.codiceIstat === row.codiceIstat), `Comune assente: ${row.nome} (${row.sigla})`);
    const byCode = new Map(comuni.map(row => [row.codiceIstat, row]));
    for (const row of localita) {
        const parent = byCode.get(row[2]);
        assert(parent, `Località senza comune: ${row[1]}`);
        const found = search.match(`${row[1]} (${parent.nome}) (${parent.sigla})`).find(item => item.row.id === `geonames:${row[0]}`);
        assert(found, `Località assente: ${row[1]} (${parent.nome})`);
        assert.deepEqual(Array.from(search.coordinates(found.row)), row.slice(3, 5));
    }
    assert.equal(search.resolve('Rivoltella'), null);
    const rivoltella = search.resolve('Rivoltella (Desenzano del Garda)', 'geonames:3169227');
    assert.equal(rivoltella.comune, 'Desenzano del Garda');
    assert.deepEqual(Array.from(search.coordinates(rivoltella)), [45.45, 10.55]);
    assert.equal(search.resolve('Monterusciello').comune, 'Pozzuoli');
    assert.deepEqual(Array.from(search.listingCoordinates('Monterusciello', 'Campania')), [40.86874, 14.08276]);
    assert.equal(search.resolve('Moniga').nome, 'Moniga del Garda');
    assert.equal(search.resolve('Castro'), null);
    assert.equal(search.resolve('frutta'), null);
    assert.equal(search.resolve('brecsia'), null, 'i refusi richiedono una scelta');
    assert(search.coordinates(search.resolve('Moniga')));
    assert(search.coordinates(search.resolve('Quero Vas')));
    assert(search.listingCoordinates('Moniga', 'Lombardia'));
    console.log(`OK copertura di tutti i ${comuni.length} comuni e ${localita.length} località, alias e coordinate`);
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
        for (const name of (process.env.COMUNE_TEST_BROWSERS || 'chromium,webkit').split(',')) for (const mobile of [false, true]) await check(playwright[name], name, mobile, base);
    } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
