// Percorso reale scelta > conferma > Stripe, con backend isolato: zero addebiti.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = process.env.VETRINA_QA_DIR;
const html = fs.readFileSync(process.env.VETRINA_DASHBOARD_FILE || path.join(root, 'dashboard.html'), 'utf8');
const modal = html.slice(html.indexOf('<!-- ══════════════ MODAL VETRINA'), html.indexOf('<!-- ══════════════ MODAL PROFILO'));
const code = html.slice(html.indexOf('// ── Vetrina Modal'), html.indexOf('// ════════════ ADMIN: Valutatore Logs'));
const owner = '11111111-1111-1111-1111-111111111111';
const listing = { id: '22222222-2222-2222-2222-222222222222', titolo: '<img src=x onerror=window.xss=true> Mercato di Brescia' };
const mock = `
let _currentUser = {id:'${owner}'};
const SUPABASE_URL='https://backend.invalid', SUPABASE_ANON_KEY='public-test-key';
window.requests=[];window.mode='error';window.delay=0;window.previewDelay=0;
const _supabase={auth:{getSession:async()=>({data:{session:window.mode==='no-session'?null:{user:_currentUser,access_token:'test-token'}}})},from:()=>({select(){return this},eq(){return this},maybeSingle:async()=>{await new Promise(r=>setTimeout(r,window.previewDelay));return {data:${JSON.stringify(listing)}}}})};
function buildCard(){return '<article><a href="/annuncio">Anteprima annuncio</a></article>'}
function showToast(){}
window.fetch=async(url,options)=>{window.requests.push({url,headers:options.headers,body:JSON.parse(options.body)});await new Promise(r=>setTimeout(r,window.delay));return window.mode==='success'?{ok:true,json:async()=>({url:'https://checkout.stripe.com/c/pay/test-only'})}:{ok:false,json:async()=>({error:'Servizio non disponibile. Riprova.'})}};
`;
const fixture = `<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/css/tailwind.css"><link rel="stylesheet" href="/css/vetrina-conversion.css"><body><button id="open" onclick='openVetrinaModal(${JSON.stringify(listing)})'>Promuovi</button>${modal}<script>${mock}\n${code}</script></body></html>`;
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/dashboard') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.end(fixture); }
    const file = path.resolve(root, '.' + url.pathname);
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : 'text/javascript');
    fs.readFile(file, (error, data) => error ? res.writeHead(404).end() : res.end(data));
});
async function run(engine, name, width, height, base) {
    const browser = await engine.launch({ headless: true });
    try {
        const page = await browser.newPage({ viewport: { width, height } });
        const errors = []; page.on('pageerror', e => errors.push(e.message));
        await page.route('https://**/*', route => route.fulfill({ status: 200, contentType: 'text/html', body: 'Stripe simulato' }));
        await page.goto(base + '/dashboard');
        await page.locator('#open').focus();
        await page.keyboard.press('Enter');
        const cta = page.locator('#vetrinaCheckoutButton');
        await cta.waitFor();
        assert.equal(await page.locator('#tier30d').getAttribute('aria-pressed'), 'true');
        assert.match(await cta.innerText(), /30 giorni · € 49,90/);
        assert.equal(await page.locator('#vetrinaListingTitle img').count(), 0);
        assert.equal(await page.evaluate(() => window.requests.length), 0, 'aprire non avvia pagamenti');
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        let box = await cta.boundingBox(); assert(box.y >= 0 && box.y + box.height <= height, 'CTA visibile senza scorrere');
        const trust = await page.locator('.v-offer-trust').boundingBox(); assert(trust.y + trust.height <= height, 'rassicurazione visibile');
        await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => document.activeElement.className), 'v-offer-close');
        await page.keyboard.press('Shift+Tab'); assert.equal(await page.evaluate(() => document.activeElement.id), 'vetrinaCheckoutButton');
        if (output) await page.screenshot({ path: path.join(output, `${name}-${width}-scelta.png`) });
        for (const [tier, cents, label] of [['10d',2490,'24,90'],['30d',4990,'49,90'],['90d',9990,'99,90']]) {
            const before = await page.evaluate(() => window.requests.length);
            await page.locator('#tier' + tier).click();
            assert.equal(await page.evaluate(() => window.requests.length), before, 'scegliere non avvia Stripe');
            assert.match(await cta.innerText(), new RegExp(label));
            await cta.click();
            await page.waitForFunction(() => document.getElementById('vetrinaLoadingMsg').textContent.includes('Riprova'));
            const request = await page.evaluate(() => window.requests.at(-1));
            assert.deepEqual(request.body, { annuncio_id: listing.id, tier, expected_amount_cents: cents });
            assert.equal(request.headers.apikey, 'public-test-key');
            assert.equal(await cta.isEnabled(), true, 'errore riprovabile');
        }
        await page.evaluate(() => { window.delay = 150; startCheckout(); startCheckout(); });
        await page.waitForTimeout(220);
        assert.equal(await page.evaluate(() => window.requests.length), 4, 'doppi clic: una sola sessione');
        await page.locator('.v-offer-details summary').first().click();
        await page.locator('.v-offer-details summary').last().click();
        await page.locator('.v-offer-body').evaluate(el => el.scrollTop = el.scrollHeight);
        box = await cta.boundingBox(); assert(box.y + box.height <= height, 'CTA ferma anche con dettagli aperti');
        await page.keyboard.press('Escape');
        assert.equal(await page.evaluate(() => document.activeElement.id), 'open');
        await page.locator('#open').click();
        assert.equal(await page.locator('#tier30d').getAttribute('aria-pressed'), 'true', 'nuova apertura ripristina scelta');
        await page.evaluate(() => { window.mode = 'no-session'; });
        await cta.click(); await page.waitForFunction(() => document.getElementById('vetrinaLoadingMsg').textContent.includes('Sessione scaduta'));
        assert.equal(await cta.isEnabled(), true);
        await page.evaluate(() => { window.mode = 'success'; window.delay = 100; startCheckout(); });
        await page.waitForFunction(() => window.requests.length === 5);
        await page.evaluate(() => closeVetrinaModal());
        await page.waitForTimeout(150);
        assert(page.url().includes('/dashboard'), 'chiusura: nessun redirect tardivo');
        await page.locator('#open').click();
        await page.evaluate(() => { window.delay = 0; });
        await cta.click(); await page.waitForURL('https://checkout.stripe.com/**');
        assert.deepEqual(errors, []);
        console.log(`OK: ${name} ${width}x${height}, scelta/tre prezzi, conferma esplicita, errori/riprova, doppio clic, sessione, chiusura, tastiera e CTA visibile.`);
    } finally { await browser.close(); }
}
(async () => {
    if (output) fs.mkdirSync(output, { recursive: true });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    try { for (const [engine, name, width, height] of [[chromium,'chromium',1440,1000],[chromium,'chromium',820,1000],[chromium,'chromium',320,568],[webkit,'webkit',390,844]]) await run(engine,name,width,height,base); }
    finally { server.close(); }
})().catch(error => { console.error(error); server.close(); process.exitCode = 1; });
