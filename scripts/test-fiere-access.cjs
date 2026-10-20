// Real pages/auth UI; isolated sessions and network fixtures, no real signups or emails.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { events } = require('../api/_fiere');
const sourceHandler = require('../api/fiere-source');
const pageHandler = require('../api/fiera');
const root = path.resolve(__dirname, '..');
const nativeFetch = global.fetch;
let authMode = 'valid', apiCalls = 0;
global.fetch = async (url, options) => {
    assert.match(url, /\/auth\/v1\/user$/);
    apiCalls++;
    assert.equal(options.headers.Authorization, 'Bearer qa-session');
    if (authMode === 'offline') throw Error('offline');
    if (authMode === 'expired') return { ok: false, status: 401 };
    return { ok: true, json: async () => ({ id: 'qa-user' }) };
};
async function call(body, authorization, method = 'POST') {
    const result = { headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(value) { this.body = value; } };
    await sourceHandler({ method, body, headers: { authorization } }, result);
    assert.equal(result.headers['Cache-Control'], 'private, no-store');
    return result;
}
const sample = events.find(event => event.pricing && event.participation.url && event.editions.length);
const request = { id: sample.id, url: sample.source.url };
const sdk = `
window.qaListeners=[]; window.qaSession=window.qaInitialSession||null; window.qaLoginFails=false;
window.qaPendingSessions=[];
window.qaReleaseSessions=()=>{window.qaHoldSessions=false;qaPendingSessions.splice(0).forEach(resolve=>resolve());};
window.qaGetSession=async()=>{const session=qaSession;if(window.qaHoldSessions)await new Promise(resolve=>qaPendingSessions.push(resolve));return window.qaSessionError?{data:{session:null},error:{message:'offline'}}:{data:{session}};};
window.qaSetSession=value=>{qaSession=value;qaListeners.forEach(fn=>fn(value?'SIGNED_IN':'SIGNED_OUT',value));};
window.qaLogin=()=>qaSetSession({access_token:'qa-session',user:{id:'qa-user',email:'qa@example.invalid',user_metadata:{nome:'Prova'}}});
const qaQuery={select(){return this},eq(){return this},neq(){return this},or(){return this},in(){return this},limit(){return this},insert(){return this},upsert(){return this},single:async()=>({data:{nome:'Prova'}}),then(resolve){return Promise.resolve({data:[],count:0}).then(resolve)}};
const qaClient={auth:{getSession:qaGetSession,getUser:async()=>({data:{user:qaSession?.user||null}}),onAuthStateChange:fn=>{qaListeners.push(fn);return{data:{subscription:{unsubscribe(){}}}}},signInWithPassword:async()=>{if(qaLoginFails)return{error:{message:'invalid'}};qaLogin();return{data:{session:qaSession}}},signOut:async()=>{qaSetSession(null);return{}},resetPasswordForEmail:async()=>({})},from:()=>Object.create(qaQuery),rpc:async()=>({data:[]})};
window.supabase={createClient:()=>qaClient};`;
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/api/fiere-source') {
        let body = ''; for await (const part of req) body += part;
        return sourceHandler({ method: req.method, headers: req.headers, body }, {
            setHeader: (key, value) => res.setHeader(key, value), status(code) { res.statusCode = code; return this; }, json(value) { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value)); }
        });
    }
    if (url.pathname.startsWith('/fiere/')) return pageHandler({ query: { slug: decodeURIComponent(url.pathname.slice(7)) } }, {
        setHeader: (key, value) => res.setHeader(key, value), status(code) { res.statusCode = code; return this; }, send(html) { res.end(html); }
    });
    const file = path.resolve(root, (url.pathname === '/fiere' ? '/fiere.html' : url.pathname).slice(1));
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' })[path.extname(file)] || 'text/plain');
    fs.readFile(file, (error, data) => error ? res.writeHead(404).end() : res.end(data));
});
async function initialSessionChecks(context, base, width) {
    for (const route of ['/fiere', '/fiere/' + sample.id]) {
        for (const state of ['signed-in', 'guest', ...(width === 1440 ? ['error', 'late-read'] : [])]) {
            const page = await context.newPage();
            await page.addInitScript(state => {
                window.qaHoldSessions = true;
                window.qaInitialSession = state === 'signed-in' ? { access_token: 'qa-session', user: { id: 'qa-user', email: 'qa@example.invalid', user_metadata: { nome: 'Prova' } } } : null;
                window.qaSessionError = state === 'error';
                window.qaGuestFrames = [];
                const sampleFrame = () => {
                    if ([...document.querySelectorAll('[data-fiere-guest]')].some(element => element.getClientRects().length)) window.qaGuestFrames.push(performance.now());
                    requestAnimationFrame(sampleFrame);
                };
                requestAnimationFrame(sampleFrame);
            }, state);
            await page.goto(base + route);
            await page.waitForFunction(() => window.FiereAccess && qaPendingSessions.length);
            const frames = () => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)))));
            await frames();
            assert.equal(await page.locator('[data-fiere-guest]:not([hidden])').count(), 0, state + ': invitation hidden while session is pending');
            assert.deepEqual(await page.evaluate(() => qaGuestFrames), [], state + ': no guest frame before authentication');
            if (route === '/fiere') await page.waitForSelector('.fiere-card-button');
            const content = page.locator(route === '/fiere' ? '.fiere-card-button' : 'main > section:not(.fiere-access)').first();
            const before = await content.boundingBox();
            if (state === 'late-read') await page.evaluate(() => qaLogin());
            await page.evaluate(() => qaReleaseSessions());
            if (state === 'guest') {
                await page.locator('.fiere-access').waitFor({ state: 'visible' });
                assert.equal(await page.locator('.fiere-access-register').innerText(), 'Registrati gratis');
                assert.equal(await page.locator('#fiere-access-title').innerText(), 'Trova le fiere per il tuo banco');
                await page.evaluate(() => qaLogin());
                assert.equal(await page.locator('.fiere-access').isVisible(), false);
                await page.evaluate(() => qaSetSession(null));
                assert(await page.locator('.fiere-access').isVisible(), 'Logout restores the invitation');
            } else {
                await frames();
                assert.deepEqual(await page.evaluate(() => qaGuestFrames), [], state + ': invitation never appears');
                const after = await content.boundingBox();
                assert.equal(after.y, before.y, state + ': content does not jump when authentication settles');
            }
            if (process.env.FIERE_ACCESS_QA_DIR) {
                fs.mkdirSync(process.env.FIERE_ACCESS_QA_DIR, { recursive: true });
                await page.screenshot({ path: path.join(process.env.FIERE_ACCESS_QA_DIR, (route === '/fiere' ? 'calendario' : 'scheda') + '-' + width + '-' + state + '.png'), fullPage: true });
            }
            await page.close();
        }
    }
}
async function run(engine, name, width, height, base) {
    const browser = await engine.launch({ headless: true });
    try {
        const context = await browser.newContext({ viewport: { width, height } });
        const errors = [], opened = [];
        context.on('page', page => {
            page.on('pageerror', error => errors.push(error.message));
            page.on('framenavigated', frame => { if (frame === page.mainFrame() && frame.url().startsWith('https://')) opened.push(frame.url()); });
        });
        await context.route('**/*', route => {
            const url = new URL(route.request().url());
            if (url.hostname === 'cdn.jsdelivr.net') return route.fulfill({ contentType: 'application/javascript', body: sdk });
            if (process.env.FIERE_ACCESS_BASE_URL && url.pathname === '/api/fiere-source') return call(route.request().postDataJSON(), route.request().headers().authorization).then(result => route.fulfill({ status: result.code, json: result.body }));
            if (url.pathname.endsWith('/functions/v1/register-bypass')) return route.fulfill({ contentType: 'application/json', body: '{"ok":true}' });
            if (url.origin === new URL(base).origin) return route.continue();
            if (route.request().isNavigationRequest()) return route.fulfill({ contentType: 'text/html', body: '<h1>Fonte di prova</h1>' });
            if (url.pathname.includes('/rest/')) return route.fulfill({ contentType: 'application/json', body: '[]' });
            return route.abort();
        });
        await initialSessionChecks(context, base, width);
        const page = await context.newPage();
        page.setDefaultTimeout(15000);
        const overflow = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name + width + ' overflow');
        const close = async () => { await page.keyboard.press('Escape'); await page.waitForFunction(() => document.getElementById('authOverlay').classList.contains('hidden')); };
        await page.goto(base + '/fiere?provincia=' + encodeURIComponent(sample.province) + '&utm_source=blog');
        await page.waitForSelector('.fiere-card-button');
        await overflow();
        assert(await page.locator('[data-fiere-register]').first().isVisible());
        await page.locator('[data-fiere-register]').first().click();
        assert(await page.locator('#registerForm').isVisible());
        await close();
        await page.locator('.fiere-card-button').first().click();
        const chosen = await page.locator('#detail-title').innerText();
        const source = page.locator('#detail-source');
        const destination = await source.getAttribute('data-fiere-source');
        assert(destination?.startsWith('https://'));
        assert((await source.getAttribute('href')).startsWith('/fiere?fiera='));
        assert.equal(await page.locator('#fair-dialog a[href^="https://"]').count(), 0);
        const before = opened.length;
        await source.click();
        assert.equal(await page.locator('#fair-dialog').evaluate(dialog => dialog.open), false);
        assert(await page.locator('#registerForm').isVisible());
        assert((await page.locator('#authContextMsg').innerText()).includes('fonte che hai scelto'));
        assert.equal(opened.length, before);
        await overflow();
        if (process.env.FIERE_ACCESS_QA_DIR) {
            fs.mkdirSync(process.env.FIERE_ACCESS_QA_DIR, { recursive: true });
            await page.screenshot({ path: path.join(process.env.FIERE_ACCESS_QA_DIR, name + '-' + width + '-accesso.png'), fullPage: true });
        }
        await close();
        assert(await page.locator('#fair-dialog').isVisible());
        assert.equal(await page.locator('#detail-title').innerText(), chosen);
        assert.equal(await page.evaluate(() => window.__onLoginSuccess), null);
        assert.equal(new URL(page.url()).searchParams.get('provincia'), sample.province);
        // Login errors stay in place; successful login continues the chosen source.
        await source.click(); await page.locator('#tabLogin').click();
        await page.locator('#loginEmail').fill('qa@example.invalid');
        await page.locator('#loginPassword').fill('qa-password');
        await page.evaluate(() => { qaLoginFails = true; });
        await page.locator('#loginBtn').click();
        await page.locator('#authError').waitFor({ state: 'visible' });
        assert.equal(opened.length, before);
        await page.evaluate(() => { qaLoginFails = false; });
        await page.locator('#loginBtn').click();
        await page.waitForURL(destination);
        // Pages reached from Google have the same gate, including without JS.
        await page.goto(base + '/fiere/' + sample.id);
        await page.waitForFunction(() => window.FiereAccess);
        assert(await page.locator('[data-fiere-register]').first().isVisible());
        assert.equal(await page.locator('main a[href^="https://"]').count(), 0);
        const tariff = page.locator('a[data-fiere-source]').filter({ hasText: 'Fonte delle tariffe' });
        await tariff.click(); assert(await page.locator('#registerForm').isVisible());
        await close();
        await page.locator('[data-fiere-login]').first().click();
        assert(await page.locator('#loginForm').isVisible()); await close();
        await overflow();
        if (process.env.FIERE_ACCESS_QA_DIR) await page.screenshot({ path: path.join(process.env.FIERE_ACCESS_QA_DIR, name + '-' + width + '-scheda.png'), fullPage: true });
        // An already authenticated user opens a validated source directly.
        await page.evaluate(() => qaLogin());
        assert.equal(await page.locator('[data-fiere-guest]').first().isVisible(), false);
        const popupPromise = context.waitForEvent('page');
        await tariff.click(); const popup = await popupPromise;
        await popup.waitForURL(sample.pricing.sourceUrl); await popup.close();
        // Failure stays closed and can be retried. Logout restores the invitation.
        authMode = 'offline'; await tariff.click();
        await page.locator('[data-fiere-feedback]').waitFor({ state: 'visible' });
        assert((await page.locator('[data-fiere-feedback]').innerText()).includes('Riprova'));
        authMode = 'expired'; await tariff.click();
        await page.locator('#loginForm').waitFor({ state: 'visible' }); await close();
        authMode = 'valid'; await page.evaluate(() => qaSetSession(null));
        assert(await page.locator('[data-fiere-guest]').first().isVisible());
        // Signup uses the actual registration handler, then opens the exact source.
        await tariff.click();
        await page.locator('#regNome').fill('Prova');
        await page.locator('#regCognome').fill('Iscrizione');
        await page.locator('#regEmail').fill('qa@example.invalid');
        await page.locator('#regPassword').fill('qa-password');
        await page.locator('#registerForm button[type="submit"]').click();
        await page.waitForURL(sample.pricing.sourceUrl);
        // Opening the internal fallback in another tab still requires authentication.
        await page.goto(base + '/fiere?provincia=' + encodeURIComponent(sample.province) + '&fiera=' + encodeURIComponent(sample.id) + '&fonte=' + encodeURIComponent(sample.source.url));
        await page.locator('#registerForm').waitFor({ state: 'visible' });
        await close();
        assert.equal(await page.locator('#detail-title').innerText(), sample.name);
        await context.close();
        const nojs = await browser.newContext({ javaScriptEnabled: false, viewport: { width, height } });
        const staticPage = await nojs.newPage(); await staticPage.goto(base + '/fiere/' + sample.id);
        assert.equal(await staticPage.locator('.fiere-access').isVisible(), false, 'HTML starts with invitation hidden even without JavaScript');
        assert.equal(await staticPage.locator('main a[href^="https://"]').count(), 0);
        assert.equal(await staticPage.locator('h1').innerText(), sample.name);
        const unavailable = await browser.newContext({ viewport: { width, height } });
        await unavailable.route('**/*', route => {
            const url = new URL(route.request().url());
            return url.origin === new URL(base).origin && !url.pathname.endsWith('/fiere-access.js') ? route.continue() : route.abort();
        });
        const partial = await unavailable.newPage();
        await partial.goto(base + '/fiere'); await partial.locator('.fiere-card-button').first().click();
        assert.equal(await partial.locator('.fiere-access').isVisible(), false, 'Unavailable auth does not show a misleading invitation');
        assert.equal(await partial.locator('#fair-dialog a[href^="https://"]').count(), 0, 'Unavailable access script fails closed');
        await unavailable.close();
        assert.equal(errors.length, 0, errors.join('\n'));
        console.log(name + ' ' + width + ': no invitation flash or layout jump, delayed session, guest/login/logout, calendar, Google page, signup/login, cancellation, exact source, auth errors, fallback, no-JS and overflow passed');
    } finally { authMode = 'valid'; await browser.close(); }
}
(async () => {
    assert.equal((await call(request)).code, 401); assert.equal(apiCalls, 0);
    assert.equal((await call(request, 'Bearer qa-session', 'GET')).code, 405);
    assert.equal((await call(request, 'Bearer qa-session')).body.url, request.url);
    assert.equal((await call({ ...request, url: 'https://example.invalid/' }, 'Bearer qa-session')).code, 404);
    assert.equal((await call({ ...request, id: 'missing' }, 'Bearer qa-session')).code, 404);
    authMode = 'expired'; assert.equal((await call(request, 'Bearer qa-session')).code, 401);
    authMode = 'offline'; assert.equal((await call(request, 'Bearer qa-session')).code, 503);
    authMode = 'valid';
    for (const url of [sample.participation.url, sample.pricing.sourceUrl, sample.editions[0].sourceUrl]) assert.equal((await call({ id: sample.id, url }, 'Bearer qa-session')).code, 200);
    console.log('API authentication, allowed sources, no open redirects, failure handling and cache passed');
    const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = process.env.FIERE_ACCESS_BASE_URL || 'http://127.0.0.1:' + server.address().port;
    for (const [name, width, height] of [['chromium', 1440, 1000], ['chromium', 820, 1000], ['chromium', 320, 568], ['webkit', 390, 844]]) await run(playwright[name], name, width, height, base);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { global.fetch = nativeFetch; server.close(); });
