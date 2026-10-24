// Pagina, shell e Auth reali; database e realtime simulati. Nessun invio esterno.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..'), out = process.env.CHAT_QA_DIR;
const U = '11111111-1111-4111-8111-111111111111', V = '22222222-2222-4222-8222-222222222222';
const SELLER_A = '33333333-3333-4333-8333-333333333333', SELLER_B = '44444444-4444-4444-8444-444444444444', ADMIN = '55555555-5555-4555-8555-555555555555';
const A = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', B = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const LA = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', LB = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const id = i => '10000000-0000-4000-8000-' + String(i).padStart(12, '0');
const initialUser = { id: U, user_metadata: { nome: 'Carlo', site_theme: 'light' } };
const profiles = [{ id: U, nome: 'Carlo', cognome: 'Riva' }, { id: V, nome: 'Sara', cognome: 'Verdi' }, { id: SELLER_A, nome: 'Elena', cognome: 'Bianchi' }, { id: SELLER_B, nome: 'Marco', cognome: 'Neri' }, { id: ADMIN, nome: 'Subingresso', cognome: '', is_admin: true }];
const listings = [
    { id: LA, user_id: SELLER_A, titolo: 'Posteggio mercato del sabato', stato: 'Affitto mensile', tipo: 'Mercato settimanale', prezzo: 3000, comune: 'Brescia', status: 'active', expires_at: null },
    { id: LB, user_id: SELLER_B, titolo: 'Licenza mercato di Verona', stato: 'Vendita', tipo: 'Mercato settimanale', prezzo: 15000, comune: 'Verona', status: 'active', expires_at: null }
];
function baseDB() {
    return { conversations: [{ id: A, annuncio_id: LA, acquirente_id: U, venditore_id: SELLER_A, is_support: false, created_at: '2026-10-20T08:00:00+00:00' },
        { id: B, annuncio_id: LB, acquirente_id: U, venditore_id: SELLER_B, is_support: false, created_at: '2026-10-21T08:00:00+00:00' }],
        messages: [{ id: id(1), conversazione_id: A, mittente_id: SELLER_A, testo: 'Il posteggio è disponibile il sabato.', letto: false, created_at: '2026-10-24T08:00:00.000001+00:00' },
            { id: id(2), conversazione_id: B, mittente_id: SELLER_B, testo: 'La licenza di Verona è ancora disponibile.', letto: false, created_at: '2026-10-24T09:00:00.000002+00:00' }],
        profiles: structuredClone(profiles), listings: structuredClone(listings) };
}
function authMock({ user, dark }) {
    window.qa = { user, callbacks: [], channels: [], failAuth: false };
    window.PasswordCredential = undefined;
    const session = () => qa.user ? { user: qa.user, access_token: 'fixture-' + qa.user.id, refresh_token: 'fixture-refresh' } : null;
    if (user) {
        user.user_metadata.site_theme = dark ? 'dark' : 'light';
        localStorage.setItem('sb-mhfbtltgwibwmsudsuvf-auth-token', JSON.stringify(session()));
        localStorage.setItem('_si_theme_preference_v1', JSON.stringify({ id: user.id, theme: dark ? 'dark' : 'light' }));
    }
    qa.setUser = user => { qa.user = user; qa.callbacks.forEach(cb => cb(user ? 'SIGNED_IN' : 'SIGNED_OUT', session())); };
    qa.emit = (table, event, row) => { for (const channel of qa.channels) if (!channel.removed) for (const listener of channel.listeners) if (listener.type === 'postgres_changes' && listener.filter.table === table && listener.filter.event === event) listener.callback({ new: row }); };
    qa.status = status => { for (const channel of qa.channels) if (!channel.removed && channel.name.startsWith('chat-inbox-')) channel.callback?.(status); };
    window.qaSupabase = { auth: {
        async getSession() { return { data: { session: session() }, error: null }; },
        async getUser() { return qa.failAuth ? { data: { user: null }, error: { message: 'offline' } } : { data: { user: qa.user }, error: null }; },
        onAuthStateChange(callback) { qa.callbacks.push(callback); setTimeout(() => callback('INITIAL_SESSION', session()), 0); return { data: { subscription: { unsubscribe() {} } } }; },
        async signInWithPassword() { qa.setUser({ id: '11111111-1111-4111-8111-111111111111', user_metadata: { nome: 'Carlo' } }); return { data: { session: session() }, error: null }; },
        async signOut() { qa.setUser(null); return { error: null }; }
    }, from(table) { const q = { select() { return this; }, eq() { return this; }, neq() { return this; }, in() { return this; }, or() { return this; }, order() { return this; }, range() { return this; }, limit() { return this; }, insert() { return this; }, update() { return this; }, single() { return this; }, maybeSingle() { return this; }, then(resolve) { return Promise.resolve({ data: table === 'profiles' ? { nome: 'Carlo' } : [], count: 0, error: null }).then(resolve); } }; return q; },
        async rpc() { return { data: null, error: null }; },
        channel(name) { const channel = { name, listeners: [], removed: false, on(type, filter, callback) { this.listeners.push({ type, filter, callback }); return this; }, subscribe(callback) { this.callback = callback; setTimeout(() => { if (!this.removed) callback?.('SUBSCRIBED'); }, 0); return this; }, async send() {} }; qa.channels.push(channel); return channel; },
        async removeChannel(channel) { channel.removed = true; }
    };
}
const normalize = value => value.replace('Z', '+00:00').replace(/(\.\d+)?\+00:00$/, (_, f) => '.' + (f || '.').slice(1).padEnd(6, '0'));
const compare = (a, b) => normalize(a.created_at).localeCompare(normalize(b.created_at)) || a.id.localeCompare(b.id);
async function fixture(browser, options = {}) {
    const db = options.db || baseDB(), requests = [], writes = [], errors = [], holds = new Map(), started = [];
    const control = { failMessages: 0, failInbox: 0, failSend: 0, loseAck: false, holdSend: false, reportRequests: [], requestFailures: [] };
    const context = await browser.newContext({ viewport: { width: options.width || 1440, height: options.height || 900 }, hasTouch: Boolean(options.touch), reducedMotion: 'reduce' });
    await context.addInitScript(authMock, { user: options.anon ? null : structuredClone(initialUser), dark: Boolean(options.dark) });
    await context.route('**/*', async route => {
        const req = route.request(), url = new URL(req.url()), method = req.method();
        const reply = (body, status = 200, headers = {}) => route.fulfill({ status, contentType: 'application/json', headers, body: JSON.stringify(body) });
        if (url.pathname.startsWith('/rest/v1/')) {
            const table = url.pathname.slice('/rest/v1/'.length), body = req.postDataJSON();
            const actor = req.headers().authorization?.replace('Bearer fixture-', '');
            requests.push({ table, method, params: Object.fromEntries(url.searchParams), body, actor });
            const convFilter = url.searchParams.get('conversazione_id')?.replace('eq.', '') || body?.conversazione_id || '';
            const tag = table + ':' + method + ':' + convFilter; started.push(tag);
            const snapshot = holds.has(tag) && table === 'messaggi' && method === 'GET' ? structuredClone(db.messages) : null;
            if (holds.has(tag)) await holds.get(tag).promise;
            if (method !== 'GET') writes.push({ table, method, body, actor });
            if (table === 'rpc/get_chat_inbox') {
                if (control.failInbox-- > 0) return reply({ message: 'unavailable' }, 503);
                const items = db.conversations.filter(c => c.acquirente_id === actor || c.venditore_id === actor).map(c => {
                    const list = db.messages.filter(m => m.conversazione_id === c.id).sort(compare), lastMessage = list.at(-1) || null;
                    return { ...c, annuncio: db.listings.find(l => l.id === c.annuncio_id) || null,
                        other_profile: db.profiles.find(p => p.id === (c.acquirente_id === actor ? c.venditore_id : c.acquirente_id)),
                        lastMessage, activity_at: lastMessage?.created_at || c.created_at, unread_count: list.filter(m => m.mittente_id !== actor && !m.letto).length };
                }).filter(c => c.lastMessage || c.is_support).sort((a, b) => compare({ id: b.id, created_at: b.activity_at }, { id: a.id, created_at: a.activity_at }))
                    .filter(c => !body.p_before_at || compare({ id: c.id, created_at: c.activity_at }, { id: body.p_before_id, created_at: body.p_before_at }) < 0);
                return reply({ items: items.slice(0, body.p_limit), has_more: items.length > body.p_limit, is_admin: actor === ADMIN, support_admin_id: ADMIN });
            }
            if (!['messaggi', 'conversazioni', 'profiles', 'annunci', 'conversation_reports'].includes(table)) return reply([]);
            if (table === 'messaggi' && method === 'GET' && control.failMessages-- > 0) return reply({ message: 'unavailable' }, 503);
            let rows = table === 'messaggi' ? snapshot || db.messages : table === 'conversazioni' ? db.conversations : table === 'profiles' ? db.profiles : table === 'annunci' ? db.listings : [];
            if (method === 'POST') {
                if (table === 'messaggi') {
                    if (control.failSend-- > 0) return reply({ message: 'unavailable' }, 503);
                    if (rows.some(row => row.id === body.id)) return reply({ code: '23505' }, 409);
                    if (actor !== body.mittente_id) return reply({ code: '42501' }, 403);
                    const saved = { ...body, letto: false, created_at: '2026-10-24T12:00:00.' + String(writes.length).padStart(6, '0') + '+00:00' }; rows.push(saved);
                    if (control.loseAck) { control.loseAck = false; return route.abort('failed'); }
                    return reply([saved], 201);
                }
                if (table === 'conversazioni') {
                    if (rows.some(row => row.id === body.id || (row.acquirente_id === body.acquirente_id && (body.is_support ? row.is_support : row.annuncio_id === body.annuncio_id)))) return reply({ code: '23505' }, 409);
                    const saved = { ...body, created_at: new Date().toISOString(), annuncio: db.listings.find(l => l.id === body.annuncio_id) || null }; rows.push(saved); return reply([saved], 201);
                }
                if (table === 'conversation_reports') { control.reportRequests.push(body); return reply([{ id: id(9999) }], 201); }
            }
            for (const [key, value] of url.searchParams) {
                if (['select', 'order', 'limit', 'or'].includes(key)) continue;
                if (value.startsWith('eq.')) rows = rows.filter(row => String(row[key]) === value.slice(3));
                else if (value.startsWith('neq.')) rows = rows.filter(row => String(row[key]) !== value.slice(4));
                else if (value.startsWith('in.(')) { const ids = value.slice(4, -1).split(','); rows = rows.filter(row => ids.includes(row[key])); }
            }
            const cursor = url.searchParams.get('or')?.match(/^\(created_at\.(lt|gt)\.(.*),and\(created_at\.eq\.(.*),id\.(lt|gt)\.(.*)\)\)$/);
            if (cursor) rows = rows.filter(row => cursor[1] === 'lt' ? compare(row, { created_at: cursor[2], id: cursor[5] }) < 0 : compare(row, { created_at: cursor[2], id: cursor[5] }) > 0);
            if (method === 'PATCH') { for (const row of rows) Object.assign(row, body); return route.fulfill({ status: 204 }); }
            rows = rows.slice();
            if (url.searchParams.get('order')) rows.sort((a, b) => url.searchParams.get('order').includes('.desc') ? compare(b, a) : compare(a, b));
            rows = rows.slice(0, Number(url.searchParams.get('limit') || 1000));
            return reply(rows);
        }
        if (url.pathname === '/auth/v1/user') return reply(options.anon ? {} : { ...initialUser, user_metadata: { site_theme: options.dark ? 'dark' : 'light' } });
        if (url.pathname.startsWith('/functions/v1/')) return reply({ ok: true });
        if (out && url.hostname === 'cdnjs.cloudflare.com') {
            const asset = path.join(out, 'fonts', url.pathname.endsWith('.css') ? 'fontawesome.css' : path.basename(url.pathname));
            if (fs.existsSync(asset)) return route.fulfill({ contentType: asset.endsWith('.css') ? 'text/css' : 'font/woff2', body: fs.readFileSync(asset) });
        }
        if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('supabase-js')) return route.fulfill({ contentType: 'text/javascript', body: 'window.supabase={createClient:()=>window.qaSupabase};' });
        if (url.origin !== 'http://127.0.0.1:34871') return route.fulfill({ contentType: url.pathname.endsWith('.css') ? 'text/css' : 'text/plain', body: '' });
        const relative = url.pathname === '/messaggi' ? 'messaggi.html' : url.pathname.slice(1), file = path.resolve(root, relative);
        if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return route.fulfill({ status: 404, body: '' });
        const published = options.published?.get(relative);
        return route.fulfill({ contentType: ({ '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff' })[path.extname(file)] || 'application/octet-stream', body: published || fs.readFileSync(file) });
    });
    const page = await context.newPage(); page.on('pageerror', e => errors.push(e.message));
    const hold = tag => { let release; const promise = new Promise(r => release = r); holds.set(tag, { promise, release }); };
    const release = tag => { const item = holds.get(tag); holds.delete(tag); item?.release(); };
    await page.goto('http://127.0.0.1:34871/messaggi' + (options.search || ''));
    await page.waitForSelector(options.anon ? '#notLoggedIn' : '[data-conversation]', { state: options.anon ? 'visible' : 'attached' });
    const open = async conv => { await page.locator('[data-conversation="' + conv + '"]').click(); await page.locator('#msgInput').waitFor({ state: 'visible' }); };
    return { page, context, db, requests, writes, errors, control, hold, release, started, open, async close() { holds.forEach(item => item.release()); assert.deepEqual(errors, [], 'Errori JavaScript'); await context.close(); } };
}
async function until(predicate) { for (let i = 0; i < 300; ++i) { if (predicate()) return; await new Promise(r => setTimeout(r, 10)); } throw Error('Condizione backend non raggiunta'); }
async function shot(page, label) {
    if (!out) return;
    await page.screenshot({ path: path.join(out, label + '.png'), fullPage: true });
    if (label.endsWith('-chat')) {
        const html = (await page.content()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
        fs.writeFileSync(path.join(out, label + '-fixture.html'), html);
    }
}
let passed = 0;
async function run(engine, label, width, touch, dark, published) {
    const browser = await engine.launch({ headless: true }), options = { width, touch, dark, published };
    async function check(name, action, extra = {}) {
        const app = await fixture(browser, { ...options, ...extra });
        try { await action(app); passed++; console.log('OK ' + label + ' ' + name); } catch (error) { await shot(app.page, label + '-FAIL-' + name); throw error; } finally { await app.close(); }
    }
    try {
        await check('risposte-fuori-ordine', async app => {
            app.hold('messaggi:GET:' + A); await app.open(A); await until(() => app.started.includes('messaggi:GET:' + A));
            if (width < 768) await app.page.locator('#chatBack').click();
            await app.open(B); await app.page.locator('#messagesContainer').getByText('La licenza di Verona è ancora disponibile.', { exact: true }).waitFor();
            app.release('messaggi:GET:' + A); await app.page.waitForTimeout(100);
            assert.equal(await app.page.locator('#messagesContainer').getByText('Il posteggio è disponibile il sabato.', { exact: true }).count(), 0);
            assert((await app.page.locator('#chatOtherName').textContent()).includes('Verona'));
        });
        await check('invio-e-cambio-chat', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled);
            app.hold('messaggi:POST:' + A); await app.page.locator('#msgInput').fill('Risposta soltanto a Elena'); await app.page.locator('#chatSend').click();
            await until(() => app.started.includes('messaggi:POST:' + A));
            if (width < 768) await app.page.locator('#chatBack').click();
            await app.open(B); app.release('messaggi:POST:' + A); await app.page.waitForTimeout(100);
            assert.equal(await app.page.locator('#messagesContainer').getByText('Risposta soltanto a Elena', { exact: true }).count(), 0);
            assert.equal(app.db.messages.filter(m => m.testo === 'Risposta soltanto a Elena')[0].conversazione_id, A);
        });
        await check('invio-immediato-conferma-e-duplicati', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled);
            app.hold('messaggi:POST:' + A); await app.page.locator('#msgInput').fill('Va bene, grazie!'); await app.page.locator('#chatSend').click();
            await app.page.locator('.chat-delivery').filter({ hasText: 'Invio…' }).waitFor();
            app.release('messaggi:POST:' + A); await app.page.locator('.chat-delivery').filter({ hasText: 'Inviato' }).waitFor();
            const saved = app.db.messages.find(m => m.testo === 'Va bene, grazie!'); await app.page.evaluate(row => { qa.emit('messaggi', 'INSERT', row); qa.emit('messaggi', 'INSERT', row); }, saved);
            assert.equal(await app.page.locator('#messagesContainer [data-msg-id="' + saved.id + '"]').count(), 1);
            await app.page.evaluate(row => qa.emit('messaggi', 'UPDATE', { ...row, letto: true }), saved);
            await app.page.locator('[data-msg-id="' + saved.id + '"] .chat-delivery').filter({ hasText: 'Letto' }).waitFor();
            await shot(app.page, label + '-chat');
        });
        await check('retry-nessun-doppio-invio', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled); app.control.failSend = 1;
            await app.page.locator('#msgInput').fill('Vorrei più informazioni.'); await app.page.locator('#chatSend').click();
            await app.page.locator('[data-retry-message]').waitFor(); await app.page.locator('[data-retry-message]').click();
            await app.page.locator('.chat-delivery').filter({ hasText: 'Inviato' }).waitFor();
            const attempts = app.writes.filter(w => w.table === 'messaggi' && w.method === 'POST');
            assert.equal(attempts.length, 2); assert.equal(attempts[0].body.id, attempts[1].body.id);
            assert.equal(app.db.messages.filter(m => m.testo === 'Vorrei più informazioni.').length, 1);
        });
        await check('risposta-persa-ma-messaggio-salvato', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled); app.control.loseAck = true;
            await app.page.locator('#msgInput').fill('Confermo per sabato.'); await app.page.locator('#chatSend').click();
            await app.page.locator('.chat-delivery').filter({ hasText: 'Inviato' }).waitFor();
            assert.equal(app.db.messages.filter(m => m.testo === 'Confermo per sabato.').length, 1);
            assert.equal(app.writes.filter(w => w.table === 'messaggi' && w.method === 'POST').length, 1);
        });
        await check('retry-dopo-conferma-e-verifica-perse', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled);
            app.control.loseAck = true; app.control.failMessages = 1;
            await app.page.locator('#msgInput').fill('Non duplicare questa risposta.'); await app.page.locator('#chatSend').click();
            await app.page.locator('[data-retry-message]').waitFor(); await app.page.locator('[data-retry-message]').click();
            await app.page.locator('.chat-delivery').filter({ hasText: 'Inviato' }).waitFor();
            assert.equal(app.db.messages.filter(m => m.testo === 'Non duplicare questa risposta.').length, 1);
        });
        await check('invii-rapidi-in-ordine', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled);
            app.hold('messaggi:POST:' + A);
            for (const text of ['Prima risposta', 'Seconda risposta']) { await app.page.locator('#msgInput').fill(text); await app.page.locator('#chatSend').click(); }
            app.release('messaggi:POST:' + A);
            await app.page.waitForFunction(() => [...document.querySelectorAll('.chat-delivery')].filter(n => n.textContent.includes('Inviato')).length === 2);
            assert.deepEqual(app.db.messages.filter(m => m.mittente_id === U).map(m => m.testo), ['Prima risposta', 'Seconda risposta']);
        });
        await check('logout-durante-invio-con-coda', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled);
            app.hold('messaggi:POST:' + A);
            for (const text of ['Invio autorizzato da Carlo', 'In coda solo per Carlo']) { await app.page.locator('#msgInput').fill(text); await app.page.locator('#chatSend').click(); }
            await until(() => app.started.includes('messaggi:POST:' + A));
            await app.page.evaluate(user => qa.setUser(user), { id: V, user_metadata: { nome: 'Sara' } });
            app.release('messaggi:POST:' + A); await app.page.locator('[data-conversation="__support_draft__"]').waitFor();
            await app.page.waitForTimeout(100);
            assert.equal(app.db.messages.some(m => m.testo === 'In coda solo per Carlo'), false);
            assert.equal(await app.page.locator('#messagesContainer').textContent(), '');
            assert.equal(app.writes.filter(w => w.table === 'messaggi' && w.actor !== U).length, 0);
        });
        await check('bozze-separate', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled); await app.page.locator('#msgInput').fill('Bozza per Elena');
            if (width < 768) await app.page.locator('#chatBack').click(); await app.open(B);
            assert.equal(await app.page.locator('#msgInput').inputValue(), '');
            if (width < 768) await app.page.locator('#chatBack').click(); await app.open(A);
            assert.equal(await app.page.locator('#msgInput').inputValue(), 'Bozza per Elena');
        });
        await check('stesso-account-non-azzera-la-bozza', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled);
            await app.page.locator('#msgInput').fill('Testo ancora da completare');
            await app.page.evaluate(user => qa.setUser(user), initialUser); await app.page.waitForTimeout(80);
            assert.equal(await app.page.locator('#msgInput').inputValue(), 'Testo ancora da completare');
            assert.equal(await app.page.evaluate(() => qa.channels.filter(c => !c.removed && c.name.startsWith('chat-inbox-')).length), 1);
        });
        await check('logout-e-cambio-account', async app => {
            await app.open(A); await app.page.getByText('Il posteggio è disponibile il sabato.', { exact: true }).last().waitFor();
            await app.page.evaluate(() => qa.setUser(null)); await app.page.locator('#notLoggedIn').waitFor();
            assert.equal(await app.page.locator('#messagesContainer').textContent(), '');
            await app.page.evaluate(user => qa.setUser(user), { id: V, user_metadata: { nome: 'Sara' } });
            await app.page.locator('[data-conversation="__support_draft__"]').waitFor();
            assert.equal(await app.page.locator('[data-conversation="' + A + '"]').count(), 0);
            assert.equal(await app.page.evaluate(() => qa.channels.filter(c => !c.removed && c.name.includes('11111111')).length), 0);
        });
        await check('login-dalla-pagina', async app => {
            await app.page.locator('#notLoggedIn button').click(); await app.page.locator('#loginEmail').fill('carlo@example.invalid');
            await app.page.locator('#loginPassword').fill('solo-fixture'); await app.page.locator('#loginBtn').click();
            await app.page.locator('[data-conversation="' + A + '"]').waitFor(); assert.equal(await app.page.locator('#notLoggedIn').isVisible(), false);
        }, { anon: true });
        await check('supporto-senza-conversazioni', async app => {
            await app.open('__support_draft__'); assert((await app.page.locator('#messagesContainer').textContent()).includes('Raccontaci'));
            await app.page.locator('#msgInput').fill('Ho bisogno di aiuto.'); await app.page.locator('#chatSend').click();
            await app.page.locator('.chat-delivery').filter({ hasText: 'Inviato' }).waitFor();
            assert.equal(app.db.conversations.length, 1); assert.equal(app.db.conversations[0].is_support, true);
        }, { db: { ...baseDB(), conversations: [], messages: [] } });
        await check('nuova-chat-solo-al-primo-invio', async app => {
            await app.page.waitForSelector('#msgInput:not([disabled])'); assert.equal(app.db.conversations.length, 0);
            await app.page.locator('#msgInput').fill('Buongiorno, è ancora disponibile?'); await app.page.locator('#chatSend').click();
            await app.page.locator('.chat-delivery').filter({ hasText: 'Inviato' }).waitFor();
            assert.equal(app.db.conversations.length, 1); assert.equal(app.db.messages.length, 1);
            assert.equal(app.db.messages[0].conversazione_id, app.db.conversations[0].id);
        }, { db: { ...baseDB(), conversations: [], messages: [] }, search: '?annuncio=' + LA });
        await check('nuovo-messaggio-chat-non-aperta', async app => {
            await app.open(A);
            const message = { id: id(333), conversazione_id: B, mittente_id: SELLER_B, testo: 'Possiamo sentirci domani.', created_at: '2026-10-24T12:30:00Z', letto: false };
            app.db.messages.push(message); await app.page.evaluate(row => qa.emit('messaggi', 'INSERT', row), message);
            if (width < 768) await app.page.locator('#chatBack').click();
            await app.page.locator('[data-conversation="' + B + '"]').filter({ hasText: 'Possiamo sentirci domani.' }).waitFor();
            assert.equal(await app.page.locator('#messagesContainer').getByText(message.testo, { exact: true }).count(), 0);
        });
        await check('riconnessione-recupera-oltre-dieci', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled);
            for (let i = 0; i < 123; ++i) app.db.messages.push({ id: id(1000 + i), conversazione_id: A, mittente_id: SELLER_A, testo: 'Aggiornamento recuperato ' + i, created_at: '2026-10-24T10:00:00.' + String(i).padStart(6, '0') + '+00:00', letto: false });
            await app.page.evaluate(() => { qa.status('CHANNEL_ERROR'); qa.status('SUBSCRIBED'); });
            await app.page.locator('#messagesContainer').getByText('Aggiornamento recuperato 122', { exact: true }).waitFor();
            assert.equal(await app.page.locator('#messagesContainer [data-msg-id]').count(), 124);
        });
        await check('realtime-durante-caricamento', async app => {
            app.hold('messaggi:GET:' + A); await app.open(A); await until(() => app.started.includes('messaggi:GET:' + A));
            const message = { id: id(876), conversazione_id: A, mittente_id: SELLER_A, testo: 'Risposta arrivata durante il caricamento', created_at: '2026-10-24T12:30:00Z', letto: false };
            app.db.messages.push(message); await app.page.evaluate(row => qa.emit('messaggi', 'INSERT', row), message); app.release('messaggi:GET:' + A);
            await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled);
            assert.equal(await app.page.locator('#messagesContainer [data-msg-id="' + message.id + '"]').count(), 1);
        });
        await check('storico-paginato-e-posizione', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled);
            assert.equal(await app.page.locator('#messagesContainer [data-msg-id]').count(), 50);
            await app.page.locator('#chatOlder').click(); await app.page.waitForFunction(() => document.querySelectorAll('#messagesContainer [data-msg-id]').length === 100);
            assert.equal(await app.page.locator('#messagesContainer [data-msg-id]').count(), 100);
            const ids = await app.page.locator('#messagesContainer [data-msg-id]').evaluateAll(nodes => nodes.map(n => n.dataset.msgId)); assert.equal(new Set(ids).size, 100);
        }, { db: (() => { const db = baseDB(); db.messages = Array.from({ length: 1205 }, (_, i) => ({ id: id(i + 1), conversazione_id: A, mittente_id: SELLER_A, testo: 'Messaggio di storico ' + i, letto: true, created_at: '2026-10-24T08:00:00.' + String(i).padStart(6, '0') + '+00:00' })); return db; })() });
        await check('errore-caricamento-e-riprova', async app => {
            app.control.failMessages = 1; await app.open(A); await app.page.locator('#chatMessageError').waitFor();
            assert.equal(await app.page.locator('#messagesContainer').getByText('Inizia la conversazione!').count(), 0);
            await app.page.locator('#chatRetryMessages').click(); await app.page.locator('#messagesContainer').getByText('Il posteggio è disponibile il sabato.', { exact: true }).waitFor();
        });
        await check('errore-inbox-conserva-le-conversazioni', async app => {
            app.control.failInbox = 1; await app.page.locator('#chatRefresh').click(); await app.page.locator('#inboxError').waitFor();
            assert.equal(await app.page.locator('[data-conversation="' + A + '"]').count(), 1);
            await app.page.locator('#chatRetryInbox').click(); await app.page.locator('#inboxError').waitFor({ state: 'hidden' });
        });
        await check('scorrimento-non-salta-ai-nuovi', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled);
            await app.page.locator('#messagesContainer').evaluate(node => node.scrollTop = 0);
            const before = await app.page.locator('#messagesContainer').evaluate(node => node.scrollTop);
            const message = { id: id(999), conversazione_id: A, mittente_id: SELLER_A, testo: 'Nuovo messaggio in fondo', created_at: '2026-10-24T12:30:00Z', letto: false };
            app.db.messages.push(message); await app.page.evaluate(row => qa.emit('messaggi', 'INSERT', row), message);
            assert.equal(await app.page.locator('#messagesContainer').evaluate(node => node.scrollTop), before);
            await app.page.locator('#chatNewMessages').waitFor();
        }, { db: (() => { const db = baseDB(); db.messages = Array.from({ length: 30 }, (_, i) => ({ id: id(i + 1), conversazione_id: A, mittente_id: SELLER_A, testo: 'Dettagli del posteggio e del mercato, messaggio ' + i, letto: true, created_at: '2026-10-24T08:00:00.' + String(i).padStart(6, '0') + '+00:00' })); return db; })() });
        await check('testi-lunghi-e-layout', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled);
            const text = '<img src=x onerror="window.chatXss=1"> & "ciao"\nمرحبا 你好 ' + 'A'.repeat(900);
            await app.page.locator('#msgInput').fill(text); await app.page.locator('#chatSend').click(); await app.page.locator('.chat-delivery').filter({ hasText: 'Inviato' }).waitFor();
            assert.equal(await app.page.evaluate(() => window.chatXss), undefined);
            assert(await app.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
            assert(await app.page.locator('#chatForm').evaluate(node => node.getBoundingClientRect().right <= innerWidth));
            assert.equal(await app.page.locator('#msgInput').evaluate(node => getComputedStyle(node).fontSize), '16px');
            await shot(app.page, label + '-testo-lungo');
        });
        await check('lettura-non-segna-messaggi-nascosti', async app => {
            await app.open(A); await app.page.waitForFunction(() => !document.getElementById('msgInput').disabled);
            if (width < 768) await app.page.locator('#chatBack').click(); else await app.open(B);
            const message = { id: id(987), conversazione_id: A, mittente_id: SELLER_A, testo: 'Messaggio non ancora aperto', created_at: '2026-10-24T12:30:00Z', letto: false };
            app.db.messages.push(message); await app.page.evaluate(row => qa.emit('messaggi', 'INSERT', row), message); await app.page.waitForTimeout(150);
            assert.equal(message.letto, false);
        });
        await check('canone-chat-annuo', async app => { await app.open(A); assert((await app.page.locator('#chatHeaderMeta').textContent()).includes('/anno')); });
        await check('segnalazione-destinatario-fisso', async app => {
            await app.open(A); await app.page.locator('#chatKebabBtn').click(); await app.page.locator('#chatReport').click();
            await app.page.locator('input[name=reason][value=spam]').check(); await app.page.locator('textarea[name=details]').fill('Segnalazione di prova isolata.');
            await app.page.locator('#reportSubmitBtn').click(); await app.page.locator('#reportModal').waitFor({ state: 'hidden' });
            assert.equal(app.control.reportRequests.length, 1); assert.equal(app.control.reportRequests[0].conversazione_id, A);
        });
    } finally { await browser.close(); }
}
(async () => {
    if (out) fs.mkdirSync(out, { recursive: true });
    const published = new Map();
    if (process.env.CHAT_USE_PUBLISHED === '1') for (const file of ['messaggi.html', 'js/pages/messaggi.js', 'css/messaggi.css']) {
        const response = await fetch('https://subingresso.it/' + file, { signal: AbortSignal.timeout(20000) }); assert(response.ok);
        const text = await response.text(), committed = require('node:child_process').execFileSync('git', ['show', 'HEAD:' + file], { cwd: root, encoding: 'utf8' });
        assert.equal(text, committed, 'Asset pubblicato ' + file); published.set(file, text);
    }
    const formats = process.env.CHAT_TEST_QUICK ? [[chromium, 'Chrome-1440-light', 1440, false, false]]
        : [[chromium, 'Chrome-1440-light', 1440, false, false], [chromium, 'Chrome-768-dark', 768, false, true], [chromium, 'Chrome-320-light', 320, true, false], [webkit, 'Safari-390-dark', 390, true, true]];
    for (const args of formats) await run(...args, published);
    if (out) fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify({ passed, externalWrites: 0, formats: formats.map(row => row[1]), published: published.size > 0 }, null, 2));
    console.log(passed + ' scenari chat superati; zero scritture esterne.');
})().catch(error => { console.error(error); process.exitCode = 1; });
