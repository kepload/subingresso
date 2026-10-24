// SSR, Auth, SDK Supabase e UI reali; API/sessioni simulate, navigazioni intercettate.
// Nessun contatto, messaggio, evento analytics o dato di prova raggiunge il backend.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict'), { execFileSync } = require('node:child_process');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..'), out = process.env.PHONE_QA_DIR;
const published = process.env.PHONE_PUBLISHED_DIR, fontDir = process.env.PHONE_FONT_DIR;
const U = '11111111-1111-4111-8111-111111111111', V = '22222222-2222-4222-8222-222222222222';
const L = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', S = '33333333-3333-4333-8333-333333333333';
const listing = { id: L, user_id: S, titolo: 'Posteggio mercato del sabato', descrizione: 'Posteggio per commercio ambulante.',
    stato: 'Vendita', tipo: 'Mercato settimanale', settore: 'Non alimentare', regione: 'Lombardia', provincia: 'BS',
    comune: 'Brescia', superficie: 24, giorni: 'Sabato', prezzo: 15000, status: 'active', expires_at: null,
    created_at: '2026-10-20T08:00:00Z', img_urls: [] };
const contact = [{ tel: '333 0000000', email: null, seller_telefono: null }];
const origin = 'https://phone-fixture.test';
let checks = 0;

function authFixture({ anon, owner, authHold, ignoreAbort }) {
    const user = id => ({ id, user_metadata: { nome: 'Utente fixture' } });
    window.qa = { user: anon ? null : user(owner ? '33333333-3333-4333-8333-333333333333' : '11111111-1111-4111-8111-111111111111'),
        callbacks: [], navigation: [], heldAuth: [], holdAuth: Boolean(authHold), authFail: false, ignoreAbort };
    qa.session = () => qa.user ? { user: qa.user, access_token: 'fixture-' + qa.user.id } : null;
    qa.setUser = (id, event) => { qa.user = id ? user(id) : null; qa.callbacks.forEach(cb => cb(event || (id ? 'SIGNED_IN' : 'SIGNED_OUT'), qa.session())); };
    qa.releaseAuth = () => { qa.holdAuth = false; qa.heldAuth.splice(0).forEach(resolve => resolve()); };
    qa.auth = {
        async getSession() { return { data: { session: qa.session() }, error: null }; },
        async getUser() { const snapshot = qa.user; if (qa.holdAuth) await new Promise(resolve => qa.heldAuth.push(resolve));
            return qa.authFail ? { data: { user: null }, error: { message: 'offline' } } : { data: { user: snapshot }, error: null }; },
        onAuthStateChange(cb) { qa.callbacks.push(cb); setTimeout(() => cb('INITIAL_SESSION', qa.session()), 0); return { data: { subscription: { unsubscribe() {} } } }; },
        async signOut() { qa.setUser(null); return { error: null }; }
    };
}

async function ssrHTML(item) {
    const sandbox = { module: { exports: {} }, require: name => require(path.resolve(root, 'api', name)),
        URL, URLSearchParams, Date, console, fetch: async url => Response.json(url.includes('id=eq.') ? [item] : []) };
    vm.runInNewContext(fs.readFileSync(path.join(root, 'api/annuncio.js'), 'utf8'), sandbox);
    let html;
    await sandbox.module.exports({ query: { id: L } }, { setHeader() {}, status() { return this; }, send(body) { html = body; } });
    return html;
}

async function fixture(browser, options = {}) {
    const errors = [], requests = [], writes = [], pending = [];
    const state = { replies: [...(options.replies || [{ data: contact }])], hold: Boolean(options.hold), blockedExternal: [] };
    const item = { ...listing, ...options.listing };
    const context = await browser.newContext({ viewport: { width: options.width, height: 900 }, hasTouch: options.touch,
        isMobile: options.touch, reducedMotion: 'reduce' });
    await context.addInitScript(authFixture, options);
    const html = published ? fs.readFileSync(path.join(published, 'annuncio.html'), 'utf8') : await ssrHTML(item);
    const page = await context.newPage();
    if (options.clock) await page.clock.install();
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/*', async route => {
        const req = route.request(), url = new URL(req.url());
        const reply = (data, status = 200, headers = {}) => route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify(data) });
        if (url.pathname.startsWith('/rest/v1/')) {
            const table = url.pathname.slice('/rest/v1/'.length), body = req.postDataJSON();
            const record = { table, method: req.method(), actor: req.headers().authorization, body, params: Object.fromEntries(url.searchParams) };
            requests.push(record);
            if (req.method() !== 'GET') writes.push(record);
            if (table === 'rpc/get_listing_contact') {
                const result = state.replies.length > 1 ? state.replies.shift() : state.replies[0];
                if (state.hold || result.hold) await new Promise(resolve => pending.push(resolve));
                if (result.abort) return route.abort('failed');
                return reply(result.error || result.data, result.error ? result.status || 503 : 200);
            }
            if (table === 'profiles') return reply({ nome: 'Venditore fixture', cognome: '', created_at: listing.created_at, is_admin: false });
            if (table === 'annunci' && url.searchParams.get('id') === 'eq.' + L && url.searchParams.get('select') !== 'visualizzazioni') return reply(item);
            return reply([], 200, { 'content-range': '0-0/0' });
        }
        if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('supabase-js')) {
            const sdk = fs.readFileSync(published ? path.join(published, 'vendor/supabase.js')
                : path.join(root, 'node_modules/@supabase/supabase-js/dist/umd/supabase.js'), 'utf8');
            return route.fulfill({ contentType: 'text/javascript', body: sdk + `\nconst qaCreateClient=window.supabase.createClient;
                window.supabase.createClient=(u,k)=>{const c=qaCreateClient(u,k,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});c.auth=qa.auth;
                    const rpc=c.rpc.bind(c);c.rpc=(...args)=>{const request=rpc(...args);if(qa.ignoreAbort)request.abortSignal=function(){return this;};return request;};return c;};` });
        }
        if (url.origin !== origin) {
            state.blockedExternal.push(url.hostname);
            // Riusa i font già archiviati, se presenti; nessuna richiesta a terzi.
            const font = fontDir && path.join(fontDir, url.pathname.endsWith('.css') ? 'fontawesome.css' : path.basename(url.pathname));
            return route.fulfill({ contentType: url.pathname.endsWith('.css') ? 'text/css' : 'application/octet-stream', body: font && fs.existsSync(font) ? fs.readFileSync(font) : '' });
        }
        if (url.pathname === '/annuncio') {
            // Solo il dato pubblico della fixture cambia: markup e asset rimangono quelli serviti.
            const body = html.replace(/window\.__SSR_LISTING__\s*=\s*[^<]*?<\/script>/, 'window.__SSR_LISTING__ = ' + JSON.stringify(item) + ';</script>');
            return route.fulfill({ contentType: 'text/html; charset=utf-8', body });
        }
        const relative = url.pathname.slice(1), file = path.resolve(published || root, relative);
        const localFile = path.resolve(root, relative);
        if (!file.startsWith((published || root) + path.sep)) return route.fulfill({ status: 403, body: '' });
        const actual = fs.existsSync(file) ? file : localFile;
        if (!fs.existsSync(actual) || fs.statSync(actual).isDirectory()) return route.fulfill({ status: 404, body: '' });
        let body = fs.readFileSync(actual);
        if (relative === 'js/pages/annuncio-detail.js') {
            if (process.env.PHONE_BASELINE) body = execFileSync('git', ['show', 'HEAD:js/pages/annuncio-detail.js'], { cwd: root });
            let source = body.toString('utf8');
            assert.equal((source.match(/window\.location\.href = `(tel:|https:\/\/wa\.me\/)/g) || []).length, 2);
            // Non assegnare mai tel:/wa.me al browser, neppure in modalità headless.
            source = source.replace('window.location.href = `tel:${link}`;', 'window.qa.navigation.push(`tel:${link}`);')
                .replace('window.location.href = `https://wa.me/${finalTel}?text=${text}`;', 'window.qa.navigation.push(`https://wa.me/${finalTel}?text=${text}`);');
            body = source;
        }
        return route.fulfill({ contentType: ({ '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff' })[path.extname(actual)] || 'text/plain', body });
    });
    await page.goto(origin + '/annuncio?id=' + L + (options.preview ? '&anteprima=moderazione' : ''), { waitUntil: 'load' });
    await page.waitForFunction(() => _currentListing || document.getElementById('notFound')?.textContent.includes('riservata'));
    const calls = () => requests.filter(r => r.table === 'rpc/get_listing_contact');
    const settled = () => page.waitForFunction(() => typeof _contactRequest === 'undefined' ? _currentListing?.telFetched : !_contactRequest);
    const release = () => { state.hold = false; pending.splice(0).forEach(resolve => resolve()); };
    return { page, context, state, calls, settled, release, errors, requests, writes, touch: options.touch,
        async close() { release(); assert.deepEqual(errors, [], 'Errori JavaScript'); await context.close(); } };
}

async function until(test) { for (let i = 0; i < 400; i++) { if (test()) return; await new Promise(r => setTimeout(r, 10)); } throw Error('Richiesta attesa non osservata'); }
async function screenshot(app, label) {
    assert.equal(await app.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Nessun overflow orizzontale');
    if (app.touch) {
        const tops = await app.page.locator('#mobileCta button').evaluateAll(buttons => buttons.map(b => b.getBoundingClientRect().top));
        assert(tops.every(top => Math.abs(top - tops[0]) < 2), 'Pulsanti mobile sulla stessa riga');
    }
    if (!out) return;
    await app.page.screenshot({ path: path.join(out, label + '.png'), fullPage: true });
    fs.writeFileSync(path.join(out, label + '.html'), (await app.page.content()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ''));
}
async function navigate(app, kind) {
    const button = app.page.locator(kind === 'call' ? '#contactBtn' : app.touch ? '#mobileCta [onclick="openWhatsApp()"]' : '#whatsappBtn');
    if (app.touch) await button.tap(); else await button.click();
    await app.page.waitForFunction(() => qa.navigation.length === 1);
    const url = await app.page.evaluate(() => qa.navigation[0]);
    assert(kind === 'call' ? url === 'tel:+393330000000' : url.startsWith('https://wa.me/393330000000?text='));
}

async function run(engine, label, width, touch) {
    const launch = { headless: true };
    if (label.startsWith('Chrome')) launch.channel = 'chrome';
    const browser = await engine.launch(launch);
    async function check(name, action, options = {}) {
        const app = await fixture(browser, { width, touch, ...options });
        try { await action(app); checks++; console.log('PASS', label, name); }
        catch (error) { await screenshot(app, label + '-FAIL-' + name); throw error; }
        finally { await app.close(); }
    }
    try {
        await check('errore-prefetch-poi-successo', async app => {
            await until(() => app.calls().length === 1); await app.settled();
            if (process.env.PHONE_BASELINE) {
                assert.equal(await app.page.evaluate(() => _currentListing.telFetched), true);
                await app.page.evaluate(() => { makeCall(); openWhatsApp(); });
                assert.equal(app.calls().length, 1); assert.equal(await app.page.evaluate(() => qa.navigation.length), 0);
                await screenshot(app, label + '-bug-originale');
                console.log('BASELINE CONFIRMED: errore definitivo, entrambi i clic non riprovano'); return;
            }
            assert.equal(await app.page.evaluate(() => _currentListing.telFetched), false);
            assert.match(await app.page.locator('#phoneContactStatus').textContent(), /riprovare/);
            assert.equal(await app.page.locator('#contactBtn').isDisabled(), false);
            await screenshot(app, label + '-errore');
            await navigate(app, 'call'); assert.equal(app.calls().length, 2);
            assert.equal(await app.page.evaluate(() => _currentListing.telFetched), true);
            assert.equal(await app.page.locator('#phoneContactStatus').isHidden(), true);
        }, { replies: [{ error: { message: 'temporary failure' } }, { data: contact }] });
        if (process.env.PHONE_BASELINE) return;
        await check('whatsapp-riprova-dopo-rete-interrotta', async app => {
            await until(() => app.calls().length === 1); await app.settled();
            await navigate(app, 'whatsapp'); assert.equal(app.calls().length, 2);
        }, { replies: [{ abort: true }, { data: contact }] });
        await check('rete-lenta-click-condivisi', async app => {
            await until(() => app.calls().length === 1);
            assert.equal(await app.page.locator('#contactBtn').isDisabled(), true);
            assert.equal(await app.page.locator('#whatsappBtn').getAttribute('aria-busy'), 'true');
            assert.equal(await app.page.evaluate(() => fetchContactInfo(_currentListing, _contactUserId)
                === fetchContactInfo(_currentListing, _contactUserId)), true, 'Promise condivisa');
            await app.page.evaluate(() => { for (let i = 0; i < 8; i++) { makeCall(); openWhatsApp(); } });
            await app.page.waitForTimeout(100);
            assert.equal(app.calls().length, 1); assert.equal(await app.page.evaluate(() => qa.navigation.length), 0);
            await screenshot(app, label + '-attesa');
            app.release(); await app.page.waitForFunction(() => qa.navigation.length === 1);
            assert.equal(app.calls().length, 1); assert.equal(await app.page.locator('#contactBtn').isDisabled(), false);
            assert.equal(await app.page.evaluate(() => _currentListing.telFetched), true);
        }, { hold: true });
        await check('timeout-poi-riprova', async app => {
            await until(() => app.calls().length === 1);
            // Avanza solo il timeout del contatto, senza rallentare l'intera suite.
            await app.page.clock.fastForward(13000);
            await app.settled(); assert.equal(await app.page.evaluate(() => _currentListing.telFetched), false);
            app.release(); await navigate(app, 'whatsapp'); assert.equal(app.calls().length, 2);
        }, { clock: true, replies: [{ data: contact, hold: true }, { data: contact }] });
        for (const [name, data] of [['numero-assente', [{ tel: null, email: null, seller_telefono: null }]], ['risposta-vuota', []]]) {
            await check(name, async app => {
                await until(() => app.calls().length === 1); await app.settled();
                assert.equal(await app.page.evaluate(() => _currentListing.telFetched), true);
                await app.page.evaluate(() => { makeCall(); openWhatsApp(); }); await app.page.waitForTimeout(100);
                assert.equal(app.calls().length, 1); assert.equal(await app.page.evaluate(() => qa.navigation.length), 0);
                assert.match(await app.page.locator('#phoneContactStatus').textContent(), /non disponibile/);
                await screenshot(app, label + '-' + name);
            }, { replies: [{ data }] });
        }
        await check('risposta-malformata-riprovabile', async app => {
            await until(() => app.calls().length === 1); await app.settled();
            assert.equal(await app.page.evaluate(() => _currentListing.telFetched), false);
            await navigate(app, 'call'); assert.equal(app.calls().length, 2);
        }, { replies: [{ data: null }, { data: contact }] });
        await check('fallback-telefono-venditore', async app => {
            await until(() => app.calls().length === 1); await app.settled();
            await navigate(app, 'call'); assert.equal(app.calls().length, 1);
        }, { replies: [{ data: [{ tel: null, email: null, seller_telefono: '333 0000000' }] }] });
        await check('login-richiesto-e-recupero', async app => {
            await app.page.evaluate(() => makeCall());
            await app.page.waitForFunction(() => document.getElementById('authOverlay')?.classList.contains('flex') || document.getElementById('authOverlay')?.style.display === 'flex');
            assert.equal(app.calls().length, 0);
            await app.page.evaluate(id => { qa.setUser(id); window.__onLoginSuccess?.(); }, U);
            await app.page.waitForFunction(() => qa.navigation.length === 1); assert.equal(app.calls().length, 1);
        }, { anon: true });
        await check('logout-svuota-cache', async app => {
            await until(() => app.calls().length === 1); await app.settled();
            await app.page.evaluate(() => qa.setUser(null));
            assert.deepEqual(await app.page.evaluate(() => [_currentListing.tel, _currentListing.email, _currentListing.telFetched]), [null, null, false]);
            await app.page.evaluate(() => openWhatsApp()); await app.page.waitForTimeout(100);
            assert.equal(app.calls().length, 1); assert.equal(await app.page.evaluate(() => qa.navigation.length), 0);
        });
        await check('cambio-account-risposta-tardiva', async app => {
            await until(() => app.calls().length === 1);
            await app.page.evaluate(() => makeCall()); await app.page.waitForTimeout(40);
            await app.page.evaluate(id => qa.setUser(id), V);
            app.state.hold = false;
            await until(() => app.calls().length === 2); await app.settled();
            app.release(); await app.page.waitForTimeout(60);
            assert.equal(await app.page.evaluate(() => _currentListing.tel), null);
            assert.equal(await app.page.evaluate(() => qa.navigation.length), 0);
            assert(app.calls()[1].actor.includes(V));
        }, { ignoreAbort: true, replies: [{ data: contact, hold: true }, { data: [{ tel: null, seller_telefono: null }] }] });
        await check('cache-non-riusata-da-altro-account', async app => {
            await until(() => app.calls().length === 1); await app.settled();
            await app.page.evaluate(id => qa.setUser(id), V);
            assert.equal(await app.page.evaluate(() => _currentListing.telFetched), false);
            await until(() => app.calls().length === 2); await app.settled();
            await app.page.evaluate(() => makeCall()); await app.page.waitForTimeout(50);
            assert.equal(await app.page.evaluate(() => qa.navigation.length), 0);
            assert.equal(await app.page.evaluate(() => _currentListing.tel), null);
            assert(app.calls()[1].actor.includes(V));
        }, { replies: [{ data: contact }, { data: [{ tel: null, seller_telefono: null }] }] });
        await check('uscita-rientro-stesso-account-risposta-tardiva', async app => {
            await until(() => app.calls().length === 1);
            await app.page.evaluate(id => { qa.setUser(null); qa.setUser(id); }, U);
            await until(() => app.calls().length === 2); await app.settled();
            app.release(); await app.page.waitForTimeout(60);
            assert.equal(await app.page.evaluate(() => _currentListing.tel), null);
            assert.equal(await app.page.evaluate(() => _currentListing.telFetched), false);
            assert.match(await app.page.locator('#phoneContactStatus').textContent(), /riprovare/);
        }, { ignoreAbort: true, replies: [{ data: contact, hold: true }, { error: { message: 'temporary failure' } }] });
        await check('logout-durante-getuser', async app => {
            await until(() => app.calls().length === 1); await app.settled();
            await app.page.evaluate(() => { qa.holdAuth = true; makeCall(); });
            await app.page.waitForFunction(() => qa.heldAuth.length > 0);
            await app.page.evaluate(() => { qa.setUser(null); qa.releaseAuth(); });
            await app.page.waitForTimeout(60);
            assert.equal(await app.page.evaluate(() => qa.navigation.length), 0);
            assert.equal(await app.page.evaluate(() => _currentListing.telFetched), false);
        });
        await check('stesso-account-token-refresh-conserva-cache', async app => {
            await until(() => app.calls().length === 1); await app.settled();
            await app.page.evaluate(id => { qa.setUser(id, 'TOKEN_REFRESHED'); qa.setUser(id); }, U);
            await app.page.waitForTimeout(60); await navigate(app, 'whatsapp'); assert.equal(app.calls().length, 1);
        });
        await check('permesso-o-quota-non-aggirati', async app => {
            await until(() => app.calls().length === 1); await app.settled();
            assert.equal(await app.page.evaluate(() => _currentListing.telFetched), false);
            await app.page.evaluate(() => makeCall()); await until(() => app.calls().length === 2); await app.settled();
            assert.equal(await app.page.evaluate(() => qa.navigation.length), 0);
            assert.match(await app.page.locator('#phoneContactStatus').textContent(), /limite/);
            assert(app.requests.every(r => !/tel|email|telefono/.test(r.params.select || '')));
        }, { replies: [{ error: { code: '42501', message: 'restricted' }, status: 403 }] });
        for (const patch of [{ expires_at: '2020-01-01T00:00:00Z' }, { status: 'deleted' }, { status: 'pending' }]) {
            await check('protezioni-' + (patch.status || 'scaduto'), async app => {
                await until(() => app.calls().length === 1); await app.settled();
                await app.page.evaluate(() => { makeCall(); openWhatsApp(); }); await app.page.waitForTimeout(40);
                assert.equal(await app.page.evaluate(() => qa.navigation.length), 0);
                assert.equal(app.calls().length, 1);
            }, { listing: patch });
        }
        await check('annuncio-scaduto-durante-recupero', async app => {
            await until(() => app.calls().length === 1);
            await app.page.evaluate(() => makeCall()); await app.page.waitForTimeout(40);
            await app.page.evaluate(() => { _currentListing.expires_at = '2020-01-01T00:00:00Z'; });
            app.release(); await app.settled(); await app.page.waitForTimeout(40);
            assert.equal(await app.page.evaluate(() => qa.navigation.length), 0);
        }, { hold: true });
        await check('anteprima-moderazione-protetta', async app => {
            await app.page.evaluate(() => { makeCall(); openWhatsApp(); });
            assert.equal(app.calls().length, 0);
            assert.equal(await app.page.evaluate(() => qa.navigation.length), 0);
        }, { preview: true });
        await check('proprietario-e-layout', async app => {
            await until(() => app.calls().length === 1); await app.settled();
            assert.equal(await app.page.locator('#contactBtn').isHidden(), true);
            assert.equal(await app.page.locator('#whatsappBtn').isHidden(), true);
            assert.match(await app.page.locator('#chatBtn').textContent(), /Modifica/);
            assert.equal(await app.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        }, { owner: true });
    } finally { await browser.close(); }
}

(async () => {
    if (out) fs.mkdirSync(out, { recursive: true });
    for (const [engine, label, width, touch] of [[chromium, 'Chrome-desktop', 1440, false], [chromium, 'Chrome-mobile', 320, true],
        [webkit, 'WebKit-desktop', 1440, false], [webkit, 'WebKit-mobile', 390, true]]) {
        await run(engine, label, width, touch);
        if (process.env.PHONE_BASELINE) break;
    }
    console.log('PASS', checks, 'scenari; sessioni/API simulate, nessuna navigazione telefonica o scrittura reale');
})().catch(error => { console.error(error); process.exitCode = 1; });
