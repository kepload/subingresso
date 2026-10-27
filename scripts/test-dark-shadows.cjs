// CSS e markup reali, senza script applicativi, account o richieste ai servizi.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const assert = require('node:assert/strict');
const { JSDOM } = require('jsdom');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const out = process.env.DARK_SHADOWS_QA_DIR;
const before = !!process.env.DARK_SHADOWS_BEFORE;
const published = new Map();
const read = file => published.get(file) || fs.readFileSync(path.join(root, file), 'utf8');
const colors = ['shadow-amber-100', 'shadow-blue-100', 'shadow-emerald-100', 'shadow-emerald-100/40', 'shadow-emerald-200', 'shadow-slate-200/50', 'shadow-slate-300/40', 'hover:shadow-blue-900/5'];
const sizes = ['shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-2xl'];
if (out) fs.mkdirSync(out, { recursive: true });
function fixture() {
    const doc = new JSDOM(read('annuncio.html')).window.document;
    doc.querySelectorAll('script, link[href^="http"]').forEach(el => el.remove());
    doc.documentElement.className = 'admin-dark';
    doc.documentElement.dataset.adminThemePage = 'annuncio';
    doc.querySelector('#detailLayout').classList.remove('hidden');
    doc.querySelector('#detailLayout').classList.add('grid');
    doc.querySelector('#notFound').classList.add('hidden');
    doc.querySelector('#mobileCta').classList.add('visible');
    doc.querySelector('main').classList.add('has-cta');
    doc.querySelector('#titolo').textContent = 'Posteggio mercato settimanale';
    doc.querySelector('#descrizione').textContent = 'Annuncio dimostrativo per il controllo del tema.';
    doc.querySelector('#prezzo').textContent = '12.500 €';
    doc.querySelector('#prezzoMobile').textContent = '12.500 €';
    doc.querySelector('#coverDiv strong').textContent = 'Milano';
    doc.querySelector('#bcRegione').textContent = 'Lombardia';
    doc.querySelector('#badgeTipo').textContent = 'Vendita';
    doc.querySelector('#statoBadge').textContent = 'Vendita';
    doc.querySelectorAll('[onclick]').forEach(el => el.removeAttribute('onclick'));
    doc.querySelectorAll('link[rel="stylesheet"]').forEach(el => el.setAttribute('href', '/' + el.getAttribute('href').replace(/^\//, '')));
    const samples = doc.createElement('section');
    samples.id = 'shadowSamples';
    samples.style.cssText = 'display:flex;flex-wrap:wrap;gap:28px;padding:32px 0';
    samples.innerHTML = colors.map((color, i) => `<button id="sample${i}" type="button" class="bg-blue-600 text-white px-5 py-3 rounded-xl shadow-lg ${color}">${color}</button>`).join('');
    doc.querySelector('main').append(samples);
    return '<!doctype html>' + doc.documentElement.outerHTML;
}
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/qa/shadows') {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.end(fixture());
    }
    const file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.statusCode = 404; return res.end(); }
    res.setHeader('Content-Type', ({ '.css': 'text/css', '.woff': 'font/woff', '.js': 'text/javascript' })[path.extname(file)] || 'application/octet-stream');
    res.end(published.get(path.relative(root, file).replaceAll('\\', '/')) || fs.readFileSync(file));
});
async function appearance(page, selector) {
    return page.locator(selector).evaluate(el => {
        const css = getComputedStyle(el);
        return { shadow: css.boxShadow, color: css.color, background: css.backgroundColor, outline: css.outlineStyle, outlineWidth: css.outlineWidth, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height };
    });
}
function darkShadow(value) {
    const colors = [...value.matchAll(/rgba?\(([^)]+)\)/g)].map(m => m[1].match(/[\d.]+/g).map(Number));
    return colors.some(c => c.length < 4 || c[3] > 0) && colors.every(c => c.length === 4 && c[3] === 0 || Math.max(...c.slice(0, 3)) <= 32);
}
(async () => {
    if (process.env.DARK_SHADOWS_USE_PUBLISHED) {
        for (const file of ['css/admin-theme.css', 'css/tailwind.css', 'css/design-system.css']) {
            const response = await fetch('https://subingresso.it/' + file);
            assert(response.ok, file + ' HTTP ' + response.status);
            const body = await response.text();
            assert.equal(body.replace(/\r\n/g, '\n'), read(file).replace(/\r\n/g, '\n'), file + ' diverso online');
            published.set(file, body);
        }
        // La preview SSR restituisce solo il template, senza leggere un annuncio reale.
        const response = await fetch('https://subingresso.it/annuncio?id=qa-shadow&anteprima=moderazione');
        assert(response.ok, 'Template SSR HTTP ' + response.status);
        const body = await response.text();
        let expected;
        await require('../api/annuncio.js')({ query: { id: 'qa-shadow', anteprima: 'moderazione' } }, { setHeader() {}, status() { return this; }, send(html) { expected = html; } });
        assert.equal(body.replace(/\r\n/g, '\n'), expected.replace(/\r\n/g, '\n'), 'SSR diverso online');
        published.set('annuncio.html', body);
    }
    await new Promise(resolve => server.listen(Number(process.env.DARK_SHADOWS_PORT) || 0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    if (process.env.DARK_SHADOWS_PREVIEW_ONLY) { console.log(base + '/qa/shadows'); return; }
    const results = [];
    try {
        for (const [engine, name, width] of [[chromium, 'Chromium', 1440], [chromium, 'Chromium', 768], [chromium, 'Chromium', 320], [webkit, 'WebKit', 390]]) {
            const browser = await engine.launch({ headless: true });
            try {
                const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
                const errors = [];
                page.on('pageerror', e => errors.push(e.message));
                await page.route('**/*', route => new URL(route.request().url()).origin === base && route.request().method() === 'GET' ? route.continue() : route.abort());
                await page.goto(base + '/qa/shadows');
                await page.evaluate(() => document.fonts.ready);
                const original = await appearance(page, '#chatBtn');
                if (!before) assert(darkShadow(original.shadow), 'Messaggio: ombra scura');
                if (!before) assert(darkShadow((await appearance(page, '#whatsappBtn')).shadow), 'WhatsApp: ombra scura');
                if (!before) for (const selector of ['#mobileCta button:first-child', '#mobileCta button:nth-child(2)']) assert(darkShadow((await appearance(page, selector)).shadow), 'Barra contatti mobile');
                for (let i = 0; i < colors.length; i++) {
                    const selector = '#sample' + i;
                    await page.locator(selector).hover();
                    const dark = await appearance(page, selector);
                    if (!before) assert(darkShadow(dark.shadow), colors[i] + ': ombra scura anche hover');
                    await page.evaluate(() => document.documentElement.classList.remove('admin-dark'));
                    const light = await appearance(page, selector);
                    assert.notEqual(light.shadow, 'none', 'Il tema chiaro conserva la propria ombra');
                    assert.equal(dark.width, light.width, 'Larghezza invariata');
                    assert.equal(dark.height, light.height, 'Altezza invariata');
                    await page.evaluate(() => document.querySelector('link[href*="admin-theme.css"]').disabled = true);
                    assert.equal((await appearance(page, selector)).shadow, light.shadow, 'Chiaro identico senza override del tema');
                    await page.evaluate(() => { document.querySelector('link[href*="admin-theme.css"]').disabled = false; document.documentElement.classList.add('admin-dark'); });
                }
                for (const size of sizes) {
                    await page.locator('#sample0').evaluate((el, size) => { el.className = 'bg-blue-600 text-white shadow-blue-100 ' + size; }, size);
                    if (!before) assert(darkShadow((await appearance(page, '#sample0')).shadow), size + ': colore indipendente dalla profondità');
                }
                // Gli elementi aggiunti dopo l'apertura ricevono subito lo stesso tema.
                await page.evaluate(() => { const button = document.querySelector('#chatBtn').cloneNode(true); button.id = 'dynamicChat'; document.querySelector('main').append(button); });
                if (!before) assert(darkShadow((await appearance(page, '#dynamicChat')).shadow), 'Contenuto dinamico');
                await page.keyboard.press('Tab');
                await page.locator('#chatBtn').focus();
                const focus = await appearance(page, '#chatBtn');
                assert(focus.outline !== 'none' && parseFloat(focus.outlineWidth) > 0, 'Focus tastiera visibile');
                assert.equal(errors.length, 0, errors.join('; '));
                await page.locator('#chatBtn').evaluate(el => el.blur());
                await page.locator('#dynamicChat').evaluate(el => el.remove());
                await page.evaluate(() => document.querySelector('#shadowSamples').remove());
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Nessun overflow');
                if (out) await page.screenshot({ path: path.join(out, `${before ? 'before' : 'after'}-${name}-${width}.png`), fullPage: true });
                results.push({ name, width, original, errors, colors: colors.length, sizes: sizes.length });
                console.log(name + ' ' + width + ': ' + (before ? 'baseline acquisita' : 'ombre, chiaro, hover, dinamico e focus verificati'));
            } finally { await browser.close(); }
        }
    } finally {
        await new Promise(resolve => server.close(resolve));
        if (out) fs.writeFileSync(path.join(out, before ? 'before.json' : 'after.json'), JSON.stringify(results, null, 2));
    }
})().catch(error => { console.error(error); process.exitCode = 1; server.close(); });
