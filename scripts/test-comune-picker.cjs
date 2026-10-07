// Regressioni del selettore su Chromium e WebKit, con mouse e tocco.
// PLAYWRIGHT_MODULE può indicare un'installazione locale di playwright-core.
// COMUNE_TEST_BROWSERS permette di includere altri motori installati, es. firefox.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const rows = require('../data/comuni-picker.json');
const canonicalRegion = region => region.replace('/Südtirol', '').replace("/Vallée d'Aoste", '');
const regions = [...new Set(rows.map(row => canonicalRegion(row.regione)))];
const fixture = `<!doctype html><html lang="it"><meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/css/comune-picker.css"><style>body{font:16px Arial;padding:24px}.comune-picker{max-width:450px}input{box-sizing:border-box;width:100%;padding:14px}#next{display:block;margin-top:300px}</style>
<label for="comune">Comune</label><div class="comune-picker"><input id="comune" autocomplete="off"><div id="suggestions" class="comune-suggestions" hidden></div></div>
<p id="status"></p><input id="provincia" readonly><select id="regione" disabled><option value=""></option></select><button id="next">Avanti</button>
<script src="/js/comune-picker.js"></script><script>
const comune=document.getElementById('comune'), regione=document.getElementById('regione');
for(const region of ${JSON.stringify(regions)}) regione.add(new Option(region,region));
window.changes=0; comune.addEventListener('change',()=>window.changes++);
window.picker=createComunePicker({comuneInput:comune,regioneSelect:regione,provinciaInput:document.getElementById('provincia'),suggestionsEl:document.getElementById('suggestions'),statusEl:document.getElementById('status')});
document.getElementById('next').onclick=()=>window.locationValue=picker.getValue();
</script></html>`;
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/picker') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(fixture); return; }
    const file = path.resolve(root, '.' + url.pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (error, data) => {
        if (error) { res.writeHead(404).end(); return; }
        res.setHeader('Content-Type', ({'.js':'text/javascript','.css':'text/css','.json':'application/json'})[path.extname(file)] || 'application/octet-stream');
        res.end(data);
    });
});
async function check(engine, name, mobile, base) {
    const browser = await engine.launch({headless:true});
    try {
        const context = await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:900},hasTouch:mobile});
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        const input = page.locator('#comune');
        const choose = async option => mobile ? option.tap() : option.click();
        const value = () => page.evaluate(() => picker.getValue());
        const expectValue = async (comune, provincia, regione) => assert.deepEqual(await value(), {comune,provincia,regione});
        await page.goto(base + '/picker');
        await page.evaluate(() => picker.ready);
        if (mobile) assert.equal(await input.evaluate(el => getComputedStyle(el).fontSize), '16px');
        await input.fill('Moniga');
        await page.getByRole('option', {name:/Moniga del Garda \(BS\)/}).waitFor({state:'visible'});
        assert.equal(await input.inputValue(), 'Moniga', 'non completa il nome mentre si scrive');
        await choose(page.locator('#next'));
        await expectValue('Moniga del Garda', 'Brescia', 'Lombardia');
        assert.equal(await input.inputValue(), 'Moniga del Garda');
        assert(await page.evaluate(() => changes > 0), 'avvisa il form e il salvataggio bozza');

        await input.fill('Castro');
        assert.equal(await value(), null, 'non sceglie un omonimo arbitrariamente');
        assert.equal(await page.locator('#provincia').inputValue(), '');
        await choose(page.getByRole('option', {name:/^Castro \(LE\)/}));
        await expectValue('Castro', 'Lecce', 'Puglia');
        await input.fill('Castro');
        assert.equal(await value(), null, 'la scelta precedente non nasconde gli omonimi');
        await choose(page.getByRole('option', {name:/^Castro \(BG\)/}));
        await expectValue('Castro', 'Bergamo', 'Lombardia');

        await input.fill('Castro');
        await input.press('ArrowDown');
        await input.press('ArrowDown');
        const highlighted = await page.locator('[role="option"][aria-selected="true"]').innerText();
        await input.press('Enter');
        assert.match(highlighted, /Castro \(LE\)/);
        await expectValue('Castro', 'Lecce', 'Puglia');
        await input.fill('Castro');
        await input.press('Enter');
        assert.equal(await value(), null, 'Invio senza una scelta non risolve gli omonimi');
        await input.press('Escape');
        assert.equal(await input.getAttribute('aria-expanded'), 'false');

        for (const [raw, comune, provincia, regione] of [
            ['  MONIGA   DEL GARDA  ', 'Moniga del Garda', 'Brescia', 'Lombardia'],
            ['Moniga (BS)', 'Moniga del Garda', 'Brescia', 'Lombardia'],
            ['salo', 'Salò', 'Brescia', 'Lombardia'],
            ["l’aquila", "L'Aquila", "L'Aquila", 'Abruzzo'],
            ['alano di piave', 'Setteville', 'Belluno', 'Veneto'],
            ['Castro (LE)', 'Castro', 'Lecce', 'Puglia']
        ]) { await input.fill(raw); await expectValue(comune, provincia, regione); }
        await page.evaluate(() => picker.setValue('Castro', 'Puglia'));
        await expectValue('Castro', 'Lecce', 'Puglia');
        await input.fill('Rivoltella');
        assert.equal(await value(), null, 'le frazioni omonime richiedono una scelta');
        await choose(page.getByRole('option').filter({hasText:'Rivoltella (Desenzano del Garda)'}));
        await expectValue('Rivoltella (Desenzano del Garda)', 'Brescia', 'Lombardia');
        await page.evaluate(() => picker.setValue('Rivoltella (Desenzano del Garda)', 'Lombardia'));
        await expectValue('Rivoltella (Desenzano del Garda)', 'Brescia', 'Lombardia');
        await input.fill('Monterusciello');
        await choose(page.getByRole('option').filter({hasText:'Monterusciello (Pozzuoli)'}));
        await expectValue('Monterusciello (Pozzuoli)', 'Napoli', 'Campania');
        await input.fill('Monigaa');
        assert.equal(await value(), null, 'i refusi non vengono corretti in silenzio');
        await choose(page.getByRole('option', {name:/^Moniga del Garda/}));
        await expectValue('Moniga del Garda', 'Brescia', 'Lombardia');
        await input.fill('zzzzzzzz');
        assert.equal(await value(), null);
        assert.match(await page.locator('#status').innerText(), /Nessun comune/);
        await input.fill('');
        assert.equal(await value(), null);
        assert.equal(await page.locator('#regione').inputValue(), '');
        await input.fill('Sa');
        assert.equal(await page.locator('#suggestions').getByRole('option').count(), 20);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const bounds = await page.locator('#suggestions').boundingBox();
        assert(bounds.x >= 0 && bounds.x + bounds.width <= (mobile ? 390 : 1280));
        if (process.env.FORM_SCREENSHOT_DIR && name === 'webkit' && mobile) {
            fs.mkdirSync(process.env.FORM_SCREENSHOT_DIR, {recursive:true});
            await input.fill('Moniga');
            await page.screenshot({path:path.join(process.env.FORM_SCREENSHOT_DIR, 'comuni-mobile.png')});
        }

        let release;
        const gate = new Promise(resolve => { release = resolve; });
        await page.route('**/data/comuni-picker.json*', async route => { await gate; await route.continue(); });
        await page.goto(base + '/picker');
        await input.fill('Moniga');
        assert.match(await page.locator('#status').innerText(), /Caricamento/);
        release();
        await page.evaluate(() => picker.ready);
        await page.getByRole('option', {name:/^Moniga del Garda/}).waitFor({state:'visible'});
        await choose(page.getByRole('option', {name:/^Moniga del Garda/}));
        await expectValue('Moniga del Garda', 'Brescia', 'Lombardia');
        await page.unroute('**/data/comuni-picker.json*');

        let attempts = 0;
        await page.route('**/data/comuni-picker.json*', route => {
            attempts++;
            return attempts <= 2 ? route.fulfill({status:503,body:'unavailable'}) : route.continue();
        });
        await page.goto(base + '/picker');
        await page.getByRole('button', {name:'Riprova a caricare i comuni'}).waitFor({state:'visible'});
        assert.equal(attempts, 2, 'riprova automaticamente prima di chiedere un tocco');
        await input.fill('Moniga');
        await choose(page.getByRole('button', {name:'Riprova a caricare i comuni'}));
        await page.evaluate(() => picker.ready);
        await choose(page.getByRole('option', {name:/^Moniga del Garda/}));
        await expectValue('Moniga del Garda', 'Brescia', 'Lombardia');
        assert.equal(attempts, 3);
        await page.unroute('**/data/comuni-picker.json*');
        let localitaAttempts = 0;
        await page.route('**/data/localita.json*', route => {
            localitaAttempts++;
            return localitaAttempts <= 2 ? route.fulfill({status:503,body:'offline'}) : route.continue();
        });
        await page.goto(base + '/picker');
        await input.fill('Monterusciello');
        await page.getByRole('button', {name:'Riprova a caricare i comuni'}).waitFor({state:'visible'});
        assert.equal(localitaAttempts, 2);
        await choose(page.getByRole('button', {name:'Riprova a caricare i comuni'}));
        await page.evaluate(() => picker.ready);
        await choose(page.getByRole('option').filter({hasText:'Monterusciello (Pozzuoli)'}));
        await expectValue('Monterusciello (Pozzuoli)', 'Napoli', 'Campania');
        await page.unroute('**/data/localita.json*');
        await page.route('**/data/comuni-picker.json*', route => route.fulfill({status:503,body:'unavailable'}));
        await page.goto(base + '/picker');
        await page.evaluate(() => picker.setValue('Castro', 'Puglia').catch(() => {}));
        await page.getByRole('button', {name:'Riprova a caricare i comuni'}).waitFor({state:'visible'});
        assert.equal(await input.inputValue(), 'Castro');
        await page.unroute('**/data/comuni-picker.json*');
        await choose(page.getByRole('button', {name:'Riprova a caricare i comuni'}));
        await page.evaluate(() => picker.ready);
        await expectValue('Castro', 'Lecce', 'Puglia');
        assert.deepEqual(errors, [], 'nessun errore non gestito nel browser');
        console.log(`OK: ${name} ${mobile?'tocco mobile':'desktop'}: abbreviazioni, omonimi, tastiera, accenti, alias, refusi, caricamento lento e retry.`);
    } finally { await browser.close(); }
}
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try {
        for (const name of (process.env.COMUNE_TEST_BROWSERS || 'chromium,webkit').split(',')) for (const mobile of [false, true]) {
            await check(playwright[name], name, mobile, base);
        }
    } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
