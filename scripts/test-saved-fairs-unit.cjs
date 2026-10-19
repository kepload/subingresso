const assert = require('node:assert/strict');
const handler = require('../api/saved-fairs');
const { events } = require('../api/_fiere');
const nativeFetch = global.fetch;
(async () => {
    const model = await import('../js/fair-reminder-model.mjs');
    assert.equal(model.reminderDate('2028-03-31', 1), '2028-02-29');
    assert.equal(model.reminderDate('2027-03-31', 1), '2027-02-28');
    assert.equal(model.reminderDate('2028-02-29', 12), '2027-02-28');
    assert.equal(model.reminderDate('2029-02-15', 5), '2028-09-15');
    for (const months of [0, 121, 1.5, NaN]) assert.equal(model.reminderDate('2029-02-15', months), null);
    for (const date of ['2027-02-30', 'bad', '<script>', '', null]) assert.equal(model.validDate(date), false);
    assert.equal(model.todayInRome(new Date('2026-10-24T22:30:00Z')), '2026-10-25');
    assert.equal(model.todayInRome(new Date('2026-10-25T23:30:00Z')), '2026-10-26');
    assert.equal(model.validateReminder({ reminder_enabled: false }), null);
    assert.match(model.validateReminder({ reminder_enabled: true, reference_date: '2027-02-15', months_before: 12 }, '2026-10-19'), /già passata/);
    assert.equal(model.validateReminder({ reminder_enabled: true, reference_date: '2028-02-15', months_before: 12 }, '2026-10-19'), null);

    const sample = events.find(event => event.editions.some(edition => edition.start > model.todayInRome()));
    const response = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });
    let authStatus = 200, writes = [], own = [], lastSnapshot, actionCalls = 0;
    global.fetch = async (url, options) => {
        if (url.endsWith('/auth/v1/user')) return response({ id: 'owner' }, authStatus);
        if (url.endsWith('/functions/v1/fair-reminders')) { actionCalls++; return response({ ok: true }); }
        if (url.endsWith('/my_saved_fairs')) return response(own);
        if (url.endsWith('/published_organizer_events')) return response([]);
        if (url.endsWith('/save_fair')) { lastSnapshot = JSON.parse(options.body); writes.push(lastSnapshot); return response({ id: 'saved', ...lastSnapshot.p_data, revision: 1 }); }
        if (url.endsWith('/remove_saved_fair')) { writes.push(JSON.parse(options.body)); return response(true); }
        throw Error('Unexpected URL: ' + url);
    };
    async function call(method, body, query = {}, authorization = 'Bearer fixture') {
        const result = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(value) { this.body = value; }, send(value) { this.html = value; } };
        await handler({ method, body, query, headers: { authorization } }, result);
        assert.equal(result.headers['Cache-Control'], 'private, no-store'); return result;
    }
    assert.equal((await call('GET', null, {}, '')).code, 401);
    authStatus = 401; assert.equal((await call('GET')).code, 401); authStatus = 200;
    assert.equal((await call('DELETE')).code, 405);
    assert.equal((await call('GET', null, { kind: 'catalog', id: 'missing' })).code, 404);
    const metadata = await call('GET', null, { kind: 'catalog', id: sample.id });
    assert.equal(metadata.body.fair.name, sample.name);
    const body = { action: 'save', kind: 'catalog', fair_id: sample.id, revision: 0, reminder_enabled: false, reference_date: null, months_before: 5, fair_name: 'FORGED', user_id: 'OTHER' };
    assert.equal((await call('POST', body)).code, 200);
    assert.equal(lastSnapshot.p_data.fair_name, sample.name); assert.equal(lastSnapshot.p_data.user_id, undefined);
    assert.equal(lastSnapshot.p_data.date_origin, 'personal');
    assert.equal((await call('POST', { ...body, reminder_enabled: true, reference_date: '2020-01-01' })).code, 400);
    assert.equal((await call('POST', { ...body, fair_id: 'missing' })).code, 404);
    assert.equal((await call('POST', { ...body, reminder_enabled: 'true' })).code, 400);
    const unsubscribe = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const confirmation = await call('GET', null, { unsubscribe }, '');
    assert.equal(confirmation.code, 200); assert(confirmation.html.includes('method="post"')); assert.equal(actionCalls, 0);
    assert.equal((await call('POST', {}, { unsubscribe }, '')).code, 200); assert.equal(actionCalls, 1);
    assert.equal((await call('GET', null, { unsubscribe: '<script>' }, '')).code, 400);

    const { reminderPayload, runFairReminders } = await import('../supabase/functions/_shared/fair-reminder-mail.mjs');
    const item = { id: 'saved', delivery_id: 'delivery', user_id: 'owner', fair_kind: 'catalog', fair_id: sample.id, fair_name: '<img src=x onerror=alert(1)>\nFiera', city: '<Milano>', reference_date: '2029-02-15', date_origin: 'personal', months_before: 12, unsub_token: unsubscribe };
    const payload = reminderPayload(item, 'qa@example.invalid');
    assert(payload.html.includes('&lt;img')); assert(!payload.html.includes('<img')); assert(!payload.subject.includes('\n'));
    assert(payload.text.includes('Data indicativa scelta da te')); assert(payload.html.includes('/api/saved-fairs?unsubscribe='));
    async function workerCase({ provider = 200, failNetwork = false, publish = true, prepare = true, origin = 'personal', kind = 'catalog', catalogFail = false, dryRun = false } = {}) {
        const outcomes = [], requests = [], messages = [], current = { ...item, date_origin: origin, fair_kind: kind };
        const client = { auth: { admin: { getUserById: async () => ({ data: { user: { email: 'qa@example.invalid' } } }) } }, rpc: async (name, args) => {
            if (name === 'claim_fair_reminders') return { data: args.p_dry_run ? { due: 1 } : [current] };
            if (name === 'published_organizer_events') return { data: publish ? [{ id: sample.id, start_date: item.reference_date }] : [] };
            if (name === 'prepare_fair_reminder') { messages.push(args.p_payload); return { data: prepare ? args.p_payload : null }; }
            if (name === 'finish_fair_reminder') { outcomes.push(args); return { data: true }; }
            throw Error(name);
        } };
        const result = await runFairReminders(client, { apiKey: 'not-a-real-key', dryRun, fetch: async (url, options) => {
            requests.push({ url, options });
            if (url.includes('/data/fiere.json')) return catalogFail ? response({}, 503) : response({ events: publish ? [sample] : [{ id: 'another', editions: [] }] });
            if (failNetwork) throw Error('timeout');
            return response({ id: 'provider-fixture' }, provider);
        } });
        return { result, outcomes, messages, requests };
    }
    let result = await workerCase(); assert.equal(result.result.sent, 1); assert.equal(result.outcomes[0].p_outcome, 'sent');
    assert.equal(result.requests.find(request => request.url.includes('resend.com')).options.headers['Idempotency-Key'], 'fair-reminder/delivery');
    assert.equal((await workerCase({ provider: 429 })).outcomes[0].p_outcome, 'retry');
    assert.equal((await workerCase({ provider: 500 })).outcomes[0].p_outcome, 'unknown');
    assert.equal((await workerCase({ failNetwork: true })).outcomes[0].p_outcome, 'unknown');
    assert.equal((await workerCase({ provider: 422 })).outcomes[0].p_outcome, 'failed');
    assert.equal((await workerCase({ prepare: false })).outcomes[0].p_outcome, 'cancelled');
    assert.equal((await workerCase({ publish: false })).result.cancelled, 1);
    assert.equal((await workerCase({ origin: 'published' })).result.cancelled, 1, 'Unpublished future editions never become confirmed automatically');
    assert.equal((await workerCase({ kind: 'organizer', origin: 'published' })).result.sent, 1);
    assert.equal((await workerCase({ kind: 'organizer', publish: false })).result.cancelled, 1);
    assert.equal((await workerCase({ catalogFail: true })).result.retries, 1);
    result = await workerCase({ dryRun: true }); assert.equal(result.requests.length, 0); assert.equal(result.outcomes.length, 0);
    console.log('PASS: model calendar months/DST; API ownership, canonical metadata, invalid/past dates, unsubscribe confirmation; email escaping, exact source, 12 months, deduplication key, cancellation, provider limits, uncertain results, retries and dry-run. All email/network calls simulated.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => { global.fetch = nativeFetch; });
