// Real HTML, auth handlers and saved-fair client; isolated Supabase/email fixtures.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const { events } = require('../api/_fiere');
const savedHandler = require('../api/saved-fairs'), fairHandler = require('../api/fiera'), eventHandler = require('../api/evento');
const nativeFetch = global.fetch;
const sample = events.find(event => event.id === 'lombardia-brescia-fiera-dei-santi-faustino-e-giovita');
const future = String(new Date().getUTCFullYear() + 3) + '-06-30';
const managed = { id: 'aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', organizer_id: 'bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb', title: 'QA Mercatino organizzato',
    city: 'Milano', province: 'Milano', region: 'Lombardia', category: 'mercatino', venue: 'Piazza QA', start_date: future, end_date: future,
    sectors: ['artigianato'], goods: 'Artigianato', description: 'Evento simulato per le verifiche.', participation_rules: 'Contatta l’organizzatore per le condizioni.', organization_name: 'Organizzatore QA',
    latitude: 45.46, longitude: 9.19, updated_at: '2026-10-19', places: [{ id: 'place', label: 'Banco', price_cents: 3000, quantity: 10, active: true }] };
let state = { rows: new Map(), writes: [], failSave: false, delaySave: 0 };
const response = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });
const owner = options => (options?.headers?.Authorization || '').replace('Bearer qa-', '');
global.fetch = async (url, options) => {
    const uid = owner(options), args = options?.body ? JSON.parse(options.body) : {};
    if (url.endsWith('/auth/v1/user')) return ['A', 'B'].includes(uid) ? response({ id: uid }) : response({}, 401);
    if (url.endsWith('/published_organizer_events')) return response(!args.p_id || args.p_id === managed.id ? [managed] : []);
    if (url.endsWith('/my_saved_fairs')) return response([...state.rows.values()].filter(row => row.user_id === uid));
    if (url.endsWith('/save_fair')) {
        if (state.delaySave) await new Promise(resolve => setTimeout(resolve, state.delaySave));
        if (state.failSave) return response({ code: 'XX000' }, 503);
        const data = args.p_data, k = uid + ':' + data.fair_kind + ':' + data.fair_id, old = state.rows.get(k);
        if (old && old.revision !== args.p_expected_revision) return response({ code: '40001' }, 400);
        const { reminderDate } = await import('../js/fair-reminder-model.mjs');
        const value = { ...data, id: old?.id || crypto.randomUUID(), user_id: uid, revision: (old?.revision || 0) + 1,
            remind_on: data.reminder_enabled ? reminderDate(data.reference_date, data.months_before) : null, sent_at: null, delivery_status: null };
        state.rows.set(k, value); state.writes.push(value); return response(value);
    }
    if (url.endsWith('/remove_saved_fair')) {
        const match = [...state.rows.entries()].find(([, row]) => row.id === args.p_id && row.user_id === uid);
        if (match) { if (match[1].revision !== args.p_expected_revision) return response({ code: '40001' }, 400); state.rows.delete(match[0]); }
        return response(true);
    }
    throw Error('Unexpected server fetch: ' + url);
};
const sdk = `window.qaListeners=[];
window.qaSession=()=>{const id=sessionStorage.getItem('qa-id');return id?{access_token:'qa-'+id,user:{id,email:'qa@example.invalid',user_metadata:{nome:'Prova'}}}:null};
window.qaIdentity=id=>{id?sessionStorage.setItem('qa-id',id):sessionStorage.removeItem('qa-id');qaListeners.forEach(fn=>fn(id?'SIGNED_IN':'SIGNED_OUT',qaSession()));};
const query={select(){return this},eq(){return this},neq(){return this},or(){return this},in(){return this},limit(){return this},insert(){return this},upsert(){return this},single:async()=>({data:{nome:'Prova'}}),then(resolve){return Promise.resolve({data:[],count:0}).then(resolve)}};
const client={auth:{getSession:async()=>({data:{session:qaSession()}}),getUser:async()=>({data:{user:qaSession()?.user||null}}),onAuthStateChange:fn=>{qaListeners.push(fn);return{data:{subscription:{unsubscribe(){}}}}},signInWithPassword:async()=>{qaIdentity('A');return{data:{session:qaSession()}}},signOut:async()=>{qaIdentity(null);return{}},resetPasswordForEmail:async()=>({})},from:()=>Object.create(query),rpc:async()=>({data:[]})};window.supabase={createClient:()=>client};`;
function dashboardFixture() {
    const html = fs.readFileSync(path.join(root, 'dashboard.html'), 'utf8');
    const start = html.indexOf('function showTab(tab)'), end = html.indexOf("document.getElementById('dashboardTabs')", start);
    const tabs = html.slice(start, end);
    return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace('</body>', `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script src="/js/supabase-config.js?v=3"></script><script src="/js/image-urls.js?v=1"></script><script src="/js/data.js?v=21"></script><script src="/js/auth.js?v=22"></script><script src="/js/fiere-access.js?v=2"></script><script type="module" src="/js/saved-fairs.js?v=3"></script><script>
let _alertsLoaded=false,_savedLoaded=false,_valutazioniLoaded=false;const VetrinaAccount={load(){}};${tabs}
document.addEventListener('DOMContentLoaded',()=>{document.getElementById('loadingState').classList.add('hidden');document.getElementById('dashContent').classList.remove('hidden');showTab('fiere');});
</script></body>`);
}
async function invoke(handler, req) {
    const result = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(data) { this.body = JSON.stringify(data); this.headers['Content-Type'] = 'application/json'; }, send(body) { this.body = body; if (!this.headers['Content-Type']) this.headers['Content-Type'] = 'text/html; charset=utf-8'; } };
    await handler(req, result); return result;
}
const server = http.createServer(async (req, res) => {
    try {
        const url = new URL(req.url, 'http://localhost');
        let result;
        if (url.pathname === '/api/saved-fairs') { let body = ''; for await (const part of req) body += part; result = await invoke(savedHandler, { method: req.method, headers: req.headers, query: Object.fromEntries(url.searchParams), body: body || null }); }
        else if (url.pathname.startsWith('/fiere/')) result = await invoke(fairHandler, { query: { slug: decodeURIComponent(url.pathname.slice(7)) } });
        else if (url.pathname === '/evento') result = await invoke(eventHandler, { query: Object.fromEntries(url.searchParams) });
        if (result) { res.writeHead(result.code, result.headers); return res.end(result.body); }
        if (url.pathname === '/dashboard') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); return res.end(dashboardFixture()); }
        const file = path.resolve(root, (url.pathname === '/fiere' ? '/fiere.html' : url.pathname).slice(1));
        if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
        res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.mjs': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json' })[path.extname(file)] || 'text/plain');
        fs.readFile(file, (error, data) => error ? res.writeHead(404).end() : res.end(data));
    } catch (error) { console.error(error); res.writeHead(500).end(); }
});
async function run(engine, name, width, height, base) {
    state = { rows: new Map(), writes: [], failSave: false, delaySave: 0 };
    const browser = await engine.launch({ headless: true });
    try {
        const context = await browser.newContext({ viewport: { width, height } }), errors = [];
        await context.route('**/*', async route => {
            const url = new URL(route.request().url());
            if (url.hostname === 'cdn.jsdelivr.net') return route.fulfill({ contentType: 'application/javascript', body: sdk });
            if (url.pathname.endsWith('/functions/v1/register-bypass')) return route.fulfill({ json: { ok: true } });
            if (url.pathname.includes('/rest/v1/')) return route.fulfill({ json: url.pathname.endsWith('/published_organizer_events') ? [managed] : [] });
            if (url.origin === new URL(base).origin && url.pathname === '/dashboard') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: dashboardFixture() });
            if (process.env.SAVED_FAIRS_BASE_URL && url.origin === new URL(base).origin && (url.pathname === '/api/saved-fairs' || url.pathname === '/evento')) {
                const request = route.request();
                const result = await invoke(url.pathname === '/evento' ? eventHandler : savedHandler, { method: request.method(), headers: request.headers(), body: request.postData(), query: Object.fromEntries(url.searchParams) });
                return route.fulfill({ status: result.code, headers: result.headers, body: result.body });
            }
            return url.origin === new URL(base).origin ? route.continue() : route.abort();
        });
        let stage = 'calendar';
        const page = await context.newPage(); page.setDefaultTimeout(16000); page.on('pageerror', error => { errors.push(error.message); console.error('Browser error [' + stage + '] at ' + page.url() + ': ' + error.stack); });
        if (process.env.SAVED_FAIRS_DEBUG) page.on('requestfailed', request => { if (request.url().includes('/api/saved-fairs')) console.error('Request failed [' + stage + ']: ' + request.method() + ' ' + request.failure()?.errorText); });
        const open = async () => { await page.locator('[data-remind-fair]').last().click(); await page.locator('#sf-form').waitFor({ state: 'visible' }); };
        const save = async () => { await page.locator('#sf-submit').click(); await page.locator('#saved-fair-dialog').waitFor({ state: 'hidden' }); };
        const overflow = async () => assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), name + width + ' overflow');
        await page.goto(base + '/fiere?q=Faustino');
        await page.locator('.fiere-card[data-event-id="' + sample.id + '"] .fiere-card-button').click();
        await page.locator('#detail-save-fair').click();
        await page.locator('#registerForm').waitFor({ state: 'visible' }); assert.equal(state.writes.length, 0);
        await page.keyboard.press('Escape'); await page.locator('#fair-dialog').waitFor({ state: 'visible' });
        await page.locator('#detail-save-fair').click(); await page.locator('#tabLogin').click();
        await page.locator('#loginEmail').fill('qa@example.invalid'); await page.locator('#loginPassword').fill('fixture-password'); await page.locator('#loginBtn').click();
        await page.waitForFunction(() => document.querySelector('#detail-save-fair').dataset.saved === 'true' && !document.querySelector('#detail-save-fair').disabled);
        assert.equal(state.writes.length, 1); assert.equal(state.writes[0].reminder_enabled, false);
        assert.equal(await page.locator('#saved-fair-dialog').count(), 0, 'Save is one click without a settings dialog');
        assert.equal(await page.locator('#detail-save-fair').getAttribute('data-saved'), 'true');
        assert(await page.locator('#fair-dialog').isVisible());
        stage = 'standalone'; await page.goto(base + '/fiere/' + sample.id);
        await page.waitForFunction(() => document.querySelector('[data-save-fair]').dataset.saved === 'true');
        assert.equal(await page.locator('[data-save-fair]').innerText(), ''); assert.match(await page.locator('[data-save-fair]').getAttribute('aria-label'), /Rimuovi/);
        assert.equal(await page.locator('[data-remind-fair]').innerText(), ''); assert.equal(await page.locator('[data-remind-fair]').getAttribute('aria-label'), 'Avvisami');
        await open(); assert.equal(await page.locator('#sf-enabled').isChecked(), true);
        assert.equal(await page.locator('#sf-months').inputValue(), '2');
        assert(await page.locator('#sf-months').isVisible(), 'Bell immediately shows the month choice');
        assert((await page.locator('#sf-date').inputValue()) > new Date().toISOString().slice(0, 10), 'Date is prefilled automatically');
        assert.equal(await page.locator('#sf-date-help').innerText(), 'Data pubblicata');
        assert.equal(await page.locator('#sf-date-edit').getAttribute('open'), null);
        await page.locator('#sf-date-edit summary').click();
        await page.locator('#sf-date').fill(future); await page.locator('#sf-months').fill('1'); await page.locator('#sf-submit').click();
        assert((await page.locator('#sf-error').innerText()).includes('2 a 120')); assert.equal(state.writes.length, 1);
        await page.locator('[data-sf-months="5"]').click();
        const model = await import('../js/fair-reminder-model.mjs');
        assert((await page.locator('#sf-preview').innerText()).includes(model.dateLabel(model.reminderDate(future, 5))));
        assert((await page.locator('#sf-date-help').innerText()).includes('indicativa'));
        state.delaySave = 180;
        await page.locator('#sf-submit').evaluate(button => { button.click(); button.click(); });
        assert(await page.locator('#sf-date').isDisabled());
        await page.locator('#saved-fair-dialog').waitFor({ state: 'hidden' }); state.delaySave = 0;
        assert.equal(state.writes.length, 2); assert.equal(state.writes[1].months_before, 5);
        stage = 'profile'; await page.goto(base + '/dashboard?area=normale#fiere');
        await page.locator('.sf-card').waitFor(); assert.equal(await page.locator('#dashboardTabs [role="tab"]').count(), 6);
        assert((await page.locator('.sf-card').innerText()).includes(sample.name));
        await page.locator('.sf-card [data-remind-fair]').click(); await page.locator('#sf-form').waitFor({ state: 'visible' });
        await page.locator('[data-sf-months="12"]').click();
        assert.equal(await page.locator('#sf-months').inputValue(), '12'); await save();
        assert((await page.locator('.sf-card').innerText()).includes('12 mesi prima'));
        await page.locator('.sf-card [data-remind-fair]').click(); await page.locator('#sf-form').waitFor({ state: 'visible' });
        await page.locator('#sf-months').fill('6'); state.failSave = true;
        await page.locator('#sf-submit').click(); await page.locator('#sf-error').waitFor({ state: 'visible' });
        assert.equal(await page.locator('#sf-months').inputValue(), '6'); assert.equal(state.rows.values().next().value.months_before, 12);
        state.failSave = false;
        const writesBefore = state.writes.length;
        await page.locator('#sf-date-edit summary').click(); await page.locator('#sf-date').fill('2020-01-01'); await page.locator('#sf-submit').click();
        assert.equal(state.writes.length, writesBefore); assert(await page.locator('#sf-error').isVisible());
        await page.locator('#sf-date').fill(future); await save();
        await page.locator('.sf-card [data-remind-fair]').click(); await page.locator('#sf-form').waitFor({ state: 'visible' });
        await overflow();
        if (process.env.SAVED_FAIRS_QA_DIR) { fs.mkdirSync(process.env.SAVED_FAIRS_QA_DIR, { recursive: true }); await page.screenshot({ path: path.join(process.env.SAVED_FAIRS_QA_DIR, name + '-' + width + '-promemoria.png') }); }
        await page.keyboard.press('Escape');
        stage = 'organizer'; await page.goto(base + '/evento?id=' + managed.id); await open();
        assert.equal(await page.locator('#sf-date').inputValue(), future);
        await page.locator('[data-sf-months="12"]').click(); await save();
        assert(state.rows.has('A:organizer:' + managed.id));
        await page.goto(base + '/fiere?q=' + encodeURIComponent('QA Mercatino organizzato'));
        await page.locator('.fiere-card[data-event-id="organizzatore-' + managed.id + '"] .fiere-card-button').click();
        assert.equal(await page.locator('#detail-save-fair').getAttribute('data-fair-kind'), 'organizer');
        await open(); assert.equal(await page.locator('#sf-months').inputValue(), '12');
        stage = 'account B'; await page.evaluate(() => qaIdentity('B'));
        await page.locator('#saved-fair-dialog').waitFor({ state: 'hidden' });
        await page.waitForFunction(() => document.querySelector('#detail-save-fair').dataset.saved === 'false');
        assert(await page.locator('#fair-dialog').isVisible());
        await open(); assert.equal(await page.locator('#sf-enabled').isChecked(), true); assert.equal(await page.locator('#sf-disable').isVisible(), false);
        assert.equal(state.writes.filter(row => row.user_id === 'B').length, 0, 'Opening the bell does not subscribe');
        await page.keyboard.press('Escape');
        stage = 'account A'; await page.evaluate(() => qaIdentity('A'));
        await page.waitForFunction(() => document.querySelector('#detail-save-fair').dataset.saved === 'true');
        await page.goto(base + '/dashboard?area=normale#fiere'); await page.waitForFunction(() => document.querySelectorAll('.sf-card').length === 2);
        await overflow();
        if (process.env.SAVED_FAIRS_QA_DIR) await page.screenshot({ path: path.join(process.env.SAVED_FAIRS_QA_DIR, name + '-' + width + '-mie-fiere.png'), fullPage: true });
        await page.locator('.sf-card [data-remind-fair]').first().click(); await page.locator('#sf-form').waitFor({ state: 'visible' });
        await page.locator('#sf-disable').click(); await page.locator('#saved-fair-dialog').waitFor({ state: 'hidden' });
        assert((await page.locator('.sf-card').first().innerText()).includes('senza promemoria'));
        await page.locator('.sf-card [data-save-fair]').first().click();
        await page.waitForFunction(() => document.querySelectorAll('.sf-card').length === 1);
        const before = state.writes.length;
        stage = 'logout'; await page.evaluate(() => qaIdentity(null));
        await page.waitForFunction(() => document.querySelector('[data-saved-fairs-list]').textContent.includes('Accedi'));
        assert.equal(await page.locator('.sf-card').count(), 0); assert.equal(state.writes.length, before);
        stage = 'registration'; await page.goto(base + '/fiere/' + sample.id);
        await page.locator('[data-remind-fair]').click(); await page.locator('#registerForm').waitFor({ state: 'visible' });
        await page.locator('#regNome').fill('Prova'); await page.locator('#regCognome').fill('Promemoria');
        await page.locator('#regEmail').fill('qa@example.invalid'); await page.locator('#regPassword').fill('fixture-password');
        await page.locator('#registerBtn').click(); await page.locator('#sf-form').waitFor({ state: 'visible' });
        assert.equal(state.writes.length, before, 'Registration resumes the chosen fair without saving or subscribing automatically');
        await page.keyboard.press('Escape');
        stage = 'toggle errors and duplicate clicks';
        state.failSave = true;
        await page.locator('[data-save-fair]').click();
        await page.waitForFunction(() => !document.querySelector('[data-save-fair]').disabled);
        assert.equal(await page.locator('[data-save-fair]').getAttribute('data-saved'), 'false', 'Failed save restores the icon');
        assert.equal(state.writes.length, before);
        state.failSave = false; state.delaySave = 250;
        await page.locator('[data-save-fair]').evaluate(button => { button.click(); button.click(); });
        await page.waitForFunction(() => document.querySelector('[data-save-fair]').dataset.saved === 'true' && !document.querySelector('[data-save-fair]').disabled);
        assert.equal(state.writes.length, before + 1, 'Rapid double save creates one write');
        assert.equal(state.writes.at(-1).reminder_enabled, false);
        await page.locator('[data-save-fair]').click();
        await page.waitForFunction(() => document.querySelector('[data-save-fair]').dataset.saved === 'false' && !document.querySelector('[data-save-fair]').disabled);
        state.delaySave = 0;
        const beforeOtherTab = state.writes.length;
        state.rows.set('A:catalog:' + sample.id, state.writes.at(-1));
        await page.locator('[data-save-fair]').click();
        await page.waitForFunction(() => document.querySelector('[data-save-fair]').dataset.saved === 'true' && !document.querySelector('[data-save-fair]').disabled);
        assert.equal(state.writes.length, beforeOtherTab, 'Save keeps an existing favorite from another tab instead of removing it');
        assert(state.rows.has('A:catalog:' + sample.id));
        await page.locator('[data-save-fair]').click();
        await page.waitForFunction(() => document.querySelector('[data-save-fair]').dataset.saved === 'false' && !document.querySelector('[data-save-fair]').disabled);
        stage = 'card actions'; await page.goto(base + '/fiere?q=Faustino');
        const card = page.locator('.fiere-card[data-event-id="' + sample.id + '"]');
        const layout = await card.evaluate(card => { const actions = card.querySelector('.sf-fair-actions').getBoundingClientRect(), title = card.querySelector('h3').getBoundingClientRect(); return { right: actions.x >= title.right, top: Math.abs(actions.y - title.y) < 2, labels: [...card.querySelectorAll('.saved-fair-button')].map(button => button.textContent.trim()) }; });
        assert(layout.right && layout.top); assert.deepEqual(layout.labels, ['', '']);
        await card.locator('[data-save-fair]').click();
        await page.waitForFunction(id => document.querySelector('[data-event-id="' + id + '"] [data-save-fair]').dataset.saved === 'true' && !document.querySelector('[data-event-id="' + id + '"] [data-save-fair]').disabled, sample.id);
        await card.locator('[data-remind-fair]').click(); await page.locator('#sf-form').waitFor({ state: 'visible' });
        assert((await page.locator('#sf-date').inputValue()) > new Date().toISOString().slice(0, 10)); await page.locator('[data-sf-months="2"]').click(); await save();
        assert.equal(state.rows.get('A:catalog:' + sample.id).months_before, 2);
        await card.locator('.fiere-card-button').click();
        assert.equal(await page.locator('#detail-save-fair').getAttribute('data-saved'), 'true');
        assert.equal(await page.locator('#fair-dialog [data-remind-fair]').getAttribute('data-enabled'), 'true');
        await overflow();
        if (process.env.SAVED_FAIRS_QA_DIR) await page.screenshot({ path: path.join(process.env.SAVED_FAIRS_QA_DIR, name + '-' + width + '-salva-campanella.png') });
        stage = 'automatic estimate';
        const historical = events.find(event => event.name.startsWith('Antica Fiera di Arsego'));
        const fair = model.fairMetadata(historical), suggested = model.suggestFairDate(fair, 2);
        assert(suggested.estimated);
        await page.goto(base + '/fiere/' + historical.id); const beforeEstimate = state.writes.length;
        await open();
        assert.equal(state.writes.length, beforeEstimate, 'Opening an estimated date does not activate email');
        assert.equal(await page.locator('#sf-date').inputValue(), suggested.date);
        assert((await page.locator('#sf-date-help').innerText()).includes(String(suggested.sourceYear)));
        assert.equal(await page.locator('#sf-date-edit').getAttribute('open'), null);
        await page.locator('#sf-months').fill('7');
        assert.equal(await page.locator('#sf-date').inputValue(), model.suggestFairDate(fair, 7).date);
        await overflow();
        if (process.env.SAVED_FAIRS_QA_DIR) await page.screenshot({ path: path.join(process.env.SAVED_FAIRS_QA_DIR, name + '-' + width + '-avviso-stimato.png') });
        await save();
        assert.equal(state.writes.at(-1).date_origin, 'personal', 'An estimate is never stored as a published date');
        await open(); assert((await page.locator('#sf-date-help').innerText()).includes('Stimata'));
        await page.keyboard.press('Escape');
        assert.deepEqual(errors, []);
        console.log(name + ' ' + width + ': one-click save, visible bell, minimum 2 months, 5/12 months, separate consent, auth/resume/cancel, past/personal dates, double click/rollback/retry, dashboard, organizer event, card/detail sync, account isolation/logout and overflow passed');
        await context.close();
    } finally { await browser.close(); }
}
(async () => {
    const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = process.env.SAVED_FAIRS_BASE_URL || 'http://127.0.0.1:' + server.address().port;
    for (const [name, width, height] of [['chromium', 1440, 1000], ['chromium', 820, 1000], ['chromium', 320, 568], ['webkit', 390, 844]]) {
        if (process.env.SAVED_FAIRS_TEST_ENGINE && process.env.SAVED_FAIRS_TEST_ENGINE !== name) continue;
        if (process.env.SAVED_FAIRS_TEST_WIDTH && Number(process.env.SAVED_FAIRS_TEST_WIDTH) !== width) continue;
        await run(playwright[name], name, width, height, base);
    }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { global.fetch = nativeFetch; server.close(); });
