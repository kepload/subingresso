// Registrazione/accesso e invii simulati: nessun account o email reale.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict'), http = require('node:http');
const { stripTypeScriptTypes } = require('node:module');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const blog = read('blog-template.html');
const formCode = blog.slice(blog.indexOf('function _bandoAlertFormHtml('), blog.indexOf('function _blogListingPreview('));
const shared = {};
vm.runInNewContext(stripTypeScriptTypes(read('supabase/functions/_shared/input.ts')).replace(/export /g, ''), shared);

async function backend() {
    let handler, existing = false, fail = false, sent = 0;
    const inserts = [];
    const client = { auth: { getUser: async token => ({ data: { user: token === 'valid' ? { id: 'account', email: 'owner@example.it' } : null } }) },
        from: table => ({ select() { return this; }, eq() { return this; },
            maybeSingle: async () => ({ data: existing ? { id: 'alert', unsub_token: 'token' } : null }),
            insert(row) { inserts.push({ table, row }); return this; },
            single: async () => fail ? { error: { code: 'XX001' } } : { data: { id: 'alert', unsub_token: 'token' } }
        }) };
    vm.runInNewContext(stripTypeScriptTypes(read('supabase/functions/subscribe-bando-alert/index.ts').replace(/^import .*;\r?\n/gm, '')),
        { validEmail: shared.email, createClient: () => client, Deno: { env: { get: () => 'fixture' }, serve: fn => handler = fn },
            Request, Response, console: { error() {}, warn() {} }, fetch: async () => { sent++; return new Response('{}'); } });
    const request = (token, body = {}) => new Request('https://example.test', { method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
        body: JSON.stringify({ regione: 'Lombardia', email: 'someone-else@example.it', ...body }) });
    for (const token of [null, 'publishable-key', 'expired']) assert.equal((await handler(request(token))).status, 401);
    assert.equal(inserts.length, 0); assert.equal(sent, 0);
    assert.equal((await handler(request('valid', { regione: 'Unknown' }))).status, 400);
    const response = await handler(request('valid'));
    assert.equal(response.status, 200); assert.equal((await response.json()).success, true);
    assert.equal(inserts[0].row.email, 'owner@example.it'); assert.equal(sent, 1);
    existing = true;
    assert.equal((await (await handler(request('valid'))).json()).already_subscribed, true);
    assert.equal(inserts.length, 1); assert.equal(sent, 1);
    existing = false; fail = true;
    assert.equal((await handler(request('valid'))).status, 500); assert.equal(sent, 1);
    for (const file of ['bando-action', 'notify-bando-subscribers', 'scout-bandi']) {
        assert(read('supabase/functions/' + file + '/index.ts').includes(".from('registered_bando_alerts')"), file);
    }
    console.log('OK backend: account obbligatorio, email dell’account, validazione, duplicati, errori e destinatari.');
}

const fixture = `
window.fixtureSession = null; window.fixtureCalls = []; window.fixtureFail = false;
sessionStorage.setItem('_vp','1');
const SUPABASE_URL='https://backend.test', SUPABASE_ANON_KEY='public-fixture';
const listeners=[];
const _supabase={auth:{
getSession:async()=>({data:{session:fixtureSession}}),getUser:async()=>({data:{user:fixtureSession?.user}}),
onAuthStateChange:fn=>{listeners.push(fn);return{data:{subscription:{unsubscribe(){}}}};},
signInWithPassword:async({email})=>{fixtureSession={access_token:'valid',user:{id:'account',email}};listeners.forEach(fn=>fn('SIGNED_IN',fixtureSession));return{data:{session:fixtureSession}};}
},rpc:async()=>({}),from:()=>({insert:async()=>({})})};
const originalFetch=window.fetch.bind(window);
window.fetch=async(url,options)=>{
if(!String(url).startsWith(SUPABASE_URL))return originalFetch(url,options);
fixtureCalls.push({url,body:JSON.parse(options.body),headers:options.headers});
if(String(url).endsWith('register-bypass'))return new Response('{}');
return new Response(JSON.stringify(fixtureFail?{error:'Avvisi non attivati. Riprova.'}:{success:true,already_subscribed:false}),{status:fixtureFail?500:200});
};
`;
const data = read('js/data.js');
const validators = data.slice(data.indexOf('function italianPhoneDigits'), data.indexOf('// UX helper:'));
const escapeCode = `function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}`;
function scripts(binding) {
    return `<script>${fixture}${validators}</script><script src="/js/blog-markup.js"></script><script src="/js/auth.js?v=30"></script><script src="/js/bando-alerts.js"></script><script>${binding}</script>`;
}
async function renderBando(regione) {
    const context = { module: { exports: {} }, require: file => require(path.join(root, 'api/bandi', file)),
        fetch: async url => new Response(JSON.stringify(String(url).includes('get_published_bando') ?
            { id: 'bando', titolo: 'Bando posteggi', regione, ai_summary: 'Bando di prova', link: 'https://example.it' } : [])) };
    vm.runInNewContext(read('api/bandi/[slug].js'), context);
    let html;
    await context.module.exports({ query: { slug: 'test' } }, { setHeader() {}, status() { return this; }, end(value) { html = value; } });
    for (const [tag, source] of html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)) {
        if (!tag.includes('application/ld+json')) new vm.Script(source);
    }
    const regionScript = html.match(/window\._BANDO_REGIONE = [^\n]+/)[0];
    return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace('</body>',
        scripts(regionScript + "bindBandoAlertForm('quickSubBandoAlert','qsMsg',window._BANDO_REGIONE,'bando_page');") + '</body>');
}
async function browsers() {
    const template = '<!doctype html><html><head><link rel="stylesheet" href="/css/tailwind.css"></head><body><main style="max-width:768px;margin:auto;padding:24px"><div id="testForm"></div></main>' +
        scripts(escapeCode + formCode + "document.getElementById('testForm').innerHTML=_bandoAlertFormHtml('Lombardia');_bindBandoAlertForm('Lombardia','bandi-posteggi-mercatali-lombardia');") + '</body></html>';
    const bando = await renderBando("Valle d'Aosta");
    const server = http.createServer((req, res) => {
        const pathname = new URL(req.url, 'http://localhost').pathname;
        if (pathname === '/blog') return res.end(template);
        if (pathname === '/bandi/test') return res.end(bando);
        const file = path.resolve(root, '.' + pathname);
        if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
        res.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : 'text/javascript');
        fs.readFile(file, (error, bytes) => error ? res.writeHead(404).end() : res.end(bytes));
    });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = 'http://127.0.0.1:' + server.address().port;
    try {
        for (const [engine, name, width] of [[chromium, 'Chromium', 1440], [chromium, 'Chromium', 320], [webkit, 'WebKit', 390]]) {
            const browser = await engine.launch({ headless: true });
            try {
                const page = await browser.newPage({ viewport: { width, height: width === 320 ? 568 : 900 } });
                const errors = []; page.on('pageerror', error => errors.push(error.message));
                await page.route('https://**/*', route => route.abort());
                for (const [url, id, msg, regione] of [['/blog', 'bandoAlertForm', 'bandoAlertMsg', 'Lombardia'], ['/bandi/test', 'quickSubBandoAlert', 'qsMsg', "Valle d'Aosta"]]) {
                    await page.goto(base + url);
                    const button = page.locator('#' + id + ' button');
                    await button.click();
                    await page.locator('#registerForm').waitFor({ state: 'visible' });
                    assert.equal(await page.locator('#' + id + ' input[type=email]').count(), 0);
                    assert.equal(await page.evaluate(() => fixtureCalls.filter(c => c.url.endsWith('subscribe-bando-alert')).length), 0);
                    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
                    // Annullare e accedere altrove non deve iscrivere agli avvisi.
                    await page.evaluate(() => closeAuthModal());
                    await page.waitForFunction(() => !window.__onLoginSuccess);
                    assert.equal(await button.isEnabled(), true);
                    await button.click();
                    await page.fill('#regNome', 'Mario'); await page.fill('#regCognome', 'Rossi');
                    await page.fill('#regEmail', 'owner@example.it'); await page.fill('#regPassword', 'example123');
                    await page.locator('#registerBtn').click();
                    await page.waitForFunction(id => document.getElementById(id).textContent.includes('attivati'), msg);
                    const calls = await page.evaluate(() => fixtureCalls);
                    assert.equal(calls.filter(c => c.url.endsWith('register-bypass')).length, 1);
                    const alert = calls.find(c => c.url.endsWith('subscribe-bando-alert'));
                    assert.equal(alert.headers.Authorization, 'Bearer valid'); assert.equal(alert.body.regione, regione);
                    assert.equal(Object.hasOwn(alert.body, 'email'), false);
                    await page.evaluate(() => window.fixtureFail = true); await button.click();
                    await page.waitForFunction(id => document.getElementById(id).textContent.includes('non attivati'), msg);
                    assert.equal(await button.isEnabled(), true);
                    await page.evaluate(() => window.fixtureFail = false); await button.click();
                    await page.waitForFunction(id => document.getElementById(id).textContent.includes('attivati sul'), msg);
                    // Percorso di accesso per chi ha già un account.
                    await page.reload(); await button.click(); await page.locator('#tabLogin').click();
                    await page.fill('#loginEmail', 'owner@example.it'); await page.fill('#loginPassword', 'example123');
                    await page.locator('#loginBtn').click();
                    await page.waitForFunction(id => document.getElementById(id).textContent.includes('attivati sul'), msg);
                }
                assert.deepEqual(errors, []);
                console.log('OK browser: ' + name + ' ' + width + ', blog e bando, registrazione standard, accesso, annullamento, errori e retry.');
            } finally { await browser.close(); }
        }
    } finally { server.close(); }
}
(async () => { await backend(); await browsers(); })().catch(error => { console.error(error); process.exitCode = 1; });
