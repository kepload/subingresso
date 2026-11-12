// Esegue il vero handler e l'helper frequenza in VM, senza rete o credenziali reali.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'supabase/functions/weekly-buyer-digest/index.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const imports = [
  "import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';",
  "import { recentVetrinaRecipients } from '../_shared/email-frequency.mjs';",
];
let handlerSource = source;
for (const line of imports) {
  assert(handlerSource.includes(line), `Import reale atteso: ${line}`);
  handlerSource = handlerSource.replace(line, '');
}
assert(!/^import\s/m.test(handlerSource), 'Ogni dipendenza deve essere isolata esplicitamente');
const frequencySource = fs.readFileSync(path.join(root, 'supabase/functions/_shared/email-frequency.mjs'), 'utf8')
  .replace('export async function recentVetrinaRecipients', 'async function recentVetrinaRecipients');
const code = stripTypeScriptTypes(handlerSource);
const now = Date.parse('2026-11-12T09:00:00Z');
const week = '2026-11-09';
class FixtureDate extends Date {
  constructor(...args) { super(...(args.length ? args : [now])); }
  static now() { return now; }
}

// Catalogo colonne verificato in sola lettura il 12/11/2026; nessuna riga reale.
const schema = {
  annunci: 'id user_id titolo descrizione stato categoria tipo settore dettagli_extra regione provincia comune superficie giorni prezzo contatto tel email data status created_at img_urls expires_at visualizzazioni featured featured_until featured_tier featured_since tel_clicks video_url saved_count is_demo',
  alerts: 'id user_id regione comune tipo raggio_km created_at lat lng',
  profiles: 'id nome cognome telefono created_at avatar_url is_admin email_digest email_stats unsub_token vetrina_welcome_days is_demo',
  weekly_digest_log: 'user_id week_start sent_at',
  vetrina_email_log: 'id user_id campaign variant status created_at sent_at provider_id provider_event error_code listing_ids subject is_test tracking_token tracking_enabled delivery_confirmed opened_at clicked_at last_open_at last_click_at open_count click_count offered_tier template_family',
};
const clone = value => JSON.parse(JSON.stringify(value));
const listing = (id, extra = {}) => ({
  id, user_id: 'seller', titolo: `Posteggio ${id}`, prezzo: 12000,
  tipo: 'Vendita', settore: 'Non alimentare', comune: 'Milano', regione: 'Lombardia',
  status: 'active', created_at: '2026-11-11T12:00:00Z', img_urls: ['https://images.invalid/cover.jpg'],
  ...extra,
});
const listings = count => Array.from({ length: count }, (_, i) => listing(`listing-${i}`));
const alert = (id, extra = {}) => ({ user_id: id, comune: 'Milano', lat: 45.46, lng: 9.19, ...extra });
const profile = (id, extra = {}) => ({ id, email_digest: true, unsub_token: `fixture-token-${id}`, ...extra });
const privateMarker = 'private-fixture@example.invalid fixture-token-private fixture-secret-private';
const dbError = (code = '42703') => ({ code, message: privateMarker, details: privateMarker, hint: privateMarker });
const results = [];

function load(options = {}) {
  const rows = clone({
    annunci: options.annunci ?? listings(3), alerts: options.alerts ?? [alert('buyer')],
    profiles: options.profiles ?? [profile('buyer')], weekly_digest_log: options.sent ?? [],
    vetrina_email_log: options.offers ?? [],
  });
  const queries = [], writes = [], lookups = [], deliveries = [], logs = [], events = [];
  const faults = options.faults ?? {};
  let handler;
  const db = {
    from(table) {
      assert(Object.hasOwn(schema, table), `Tabella inattesa: ${table}`);
      const query = { table, operation: 'select', columns: null, filters: [], order: null };
      let pending;
      const builder = {
        select(columns) { query.columns = columns.split(',').map(c => c.trim()); return this; },
        eq(key, value) { query.filters.push(['eq', key, value]); return this; },
        neq(key, value) { query.filters.push(['neq', key, value]); return this; },
        gte(key, value) { query.filters.push(['gte', key, value]); return this; },
        in(key, values) { query.filters.push(['in', key, Array.from(values)]); return this; },
        order(key, value) { query.order = { key, ascending: value.ascending }; return this; },
        upsert(value) { query.operation = 'upsert'; query.value = clone(value); return this; },
        then(resolve, reject) {
          pending ??= Promise.resolve().then(() => {
            queries.push(clone(query));
            events.push(`${table}:${query.operation}`);
            const columns = new Set(schema[table].split(' '));
            const requested = [...(query.columns ?? []), ...query.filters.map(f => f[1]), ...(query.order ? [query.order.key] : []), ...Object.keys(query.value ?? {})];
            const missing = requested.filter(c => !columns.has(c));
            if (missing.length) return { data: null, error: dbError('42703') };
            const fault = faults[`${table}:${query.operation}`];
            if (fault?.throws) throw new Error(privateMarker);
            if (fault) return { data: fault.partial ? clone(rows[table]) : null, error: fault.error ?? dbError() };
            if (query.operation === 'upsert') {
              assert.equal(table, 'weekly_digest_log');
              writes.push(clone(query.value));
              const existing = rows[table].find(r => r.user_id === query.value.user_id && r.week_start === query.value.week_start);
              if (existing) Object.assign(existing, query.value);
              else rows[table].push({ ...query.value, sent_at: new FixtureDate().toISOString() });
              return { data: null, error: null };
            }
            assert(query.columns && !query.columns.includes('*'), 'Solo colonne esplicite');
            let data = rows[table].filter(row => query.filters.every(([op, key, value]) => {
              if (op === 'eq') return row[key] === value;
              if (op === 'neq') return row[key] != null && row[key] !== value;
              if (op === 'gte') return row[key] >= value;
              if (op === 'in') return value.includes(row[key]);
              throw new Error(`Filtro inatteso: ${op}`);
            }));
            if (query.order) {
              const { key, ascending } = query.order;
              data.sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0) * (ascending ? 1 : -1));
            }
            return { data: data.map(row => Object.fromEntries(query.columns.map(c => [c, row[c]]))), error: null };
          });
          return pending.then(resolve, reject);
        },
      };
      return builder;
    },
    auth: { admin: { async getUserById(id) {
      lookups.push(id); events.push('recipient');
      if (options.authThrows) throw new Error(privateMarker);
      if (options.authError) return { data: null, error: options.authError };
      return { data: { user: { email: options.noEmail ? null : `${id}@example.invalid` } }, error: null };
    } } },
  };
  vm.runInNewContext(`${frequencySource}\n${code}`, {
    Deno: {
      env: { get: name => ({
        SUPABASE_URL: 'https://backend.invalid', SB_SECRET_KEY: options.serviceFallback ? undefined : 'fixture-internal',
        SUPABASE_SERVICE_ROLE_KEY: 'fixture-service', RESEND_API_KEY: 'fixture-provider',
      })[name] },
      serve: fn => { handler = fn; },
    },
    createClient: (url, key) => {
      assert.equal(url, 'https://backend.invalid');
      assert.equal(key, options.serviceFallback ? 'fixture-service' : 'fixture-internal');
      return db;
    },
    fetch: async (url, init) => {
      assert.equal(url, 'https://api.resend.com/emails', 'Qualsiasi altra rete è vietata');
      assert.equal(init.method, 'POST');
      assert.equal(init.headers.Authorization, 'Bearer fixture-provider');
      const payload = JSON.parse(init.body);
      assert(payload.to.endsWith('@example.invalid'), 'Solo destinatari fittizi');
      deliveries.push(payload); events.push('provider');
      if (options.providerThrows) throw new Error(privateMarker);
      return new Response(privateMarker, { status: options.providerStatus ?? 200 });
    },
    Request, Response, Date: FixtureDate,
    console: { error: (...values) => logs.push(JSON.stringify(values)) },
  }, { filename: sourcePath });
  assert.equal(typeof handler, 'function');
  const call = async (authorization = `Bearer ${options.serviceFallback ? 'fixture-service' : 'fixture-internal'}`) => {
    const response = await handler(new Request('https://function.invalid/weekly-buyer-digest', {
      method: 'POST', headers: { authorization },
    }));
    return { status: response.status, body: await response.text(), contentType: response.headers.get('content-type') };
  };
  return { rows, queries, writes, lookups, deliveries, logs, events, call };
}

async function test(name, options, check) {
  const fixture = load(options);
  const response = await fixture.call();
  await check(fixture, response);
  const output = [response.body, ...fixture.logs].join(' ');
  for (const secret of privateMarker.split(' ')) assert(!output.includes(secret), `${name}: diagnostica privata`);
  for (const delivery of fixture.deliveries) {
    assert(!output.includes(delivery.to), `${name}: destinatario nei log`);
    const token = /fixture-token-[a-z-]+/.exec(delivery.html)?.[0];
    if (token) assert(!output.includes(token), `${name}: token nei log`);
  }
  results.push({ case: name, status: response.status, provider_calls: fixture.deliveries.length });
}

function failedBeforeDelivery(fixture, response, stage, code) {
  assert.equal(response.status, 500);
  assert.equal(response.contentType, 'application/json');
  assert.deepEqual(JSON.parse(response.body), { error: 'Digest failed', stage, ...(code ? { code } : {}) });
  assert(!/Skip|No alerts|OK|inviati/.test(response.body));
  assert.equal(fixture.deliveries.length, 0);
  assert.equal(fixture.writes.length, 0);
  assert.equal(fixture.logs.length, 1);
}

(async () => {
  const unauthorized = load();
  assert.equal((await unauthorized.call('Bearer untrusted')).status, 401);
  assert.equal(unauthorized.queries.length, 0);
  assert.equal(unauthorized.deliveries.length, 0);
  results.push({ case: 'unauthorized: no DB/provider', status: 401, provider_calls: 0 });

  for (const count of [0, 1, 2]) {
    await test(`${count} annunci: skip legittimo`, { annunci: listings(count) }, (f, r) => {
      assert.equal(r.status, 200); assert.equal(r.body, `Skip: solo ${count} annunci nuovi`);
      assert.deepEqual(f.queries.map(q => q.table), ['vetrina_email_log', 'annunci']);
      assert.equal(f.lookups.length + f.writes.length + f.deliveries.length + f.logs.length, 0);
    });
  }
  await test('tre annunci: schema corrente, contenuto, deduplica persistita', {}, async (f, r) => {
    assert.equal(r.status, 200); assert.equal(r.body, 'OK — 1 digest inviati');
    assert.equal(f.deliveries.length, 1); assert.equal(f.writes.length, 1);
    assert.deepEqual(f.writes[0], { user_id: 'buyer', week_start: week });
    const query = f.queries.find(q => q.table === 'annunci');
    assert(query.columns.includes('settore')); assert(!query.columns.includes('merce'));
    assert.deepEqual(query.filters, [['eq', 'status', 'active'], ['gte', 'created_at', '2026-11-05T09:00:00.000Z']]);
    assert.deepEqual(query.order, { key: 'created_at', ascending: false });
    const mail = f.deliveries[0];
    assert.equal(mail.from, 'Subingresso.it <noreply@subingresso.it>');
    assert.equal(mail.subject, '📬 3 nuovi posteggi vicino a Milano questa settimana');
    assert(mail.html.includes('https://subingresso.it/unsubscribe.html?t=fixture-token-buyer&type=digest'));
    assert.equal((mail.html.match(/annuncio\.html\?id=/g) ?? []).length, 3);
    assert.deepEqual(f.events.slice(-2), ['provider', 'weekly_digest_log:upsert']);
    const second = await f.call();
    assert.equal(second.body, 'OK — 0 digest inviati');
    assert.equal(f.deliveries.length, 1); assert.equal(f.writes.length, 1);
  });

  for (const [table, stage] of [
    ['vetrina_email_log', 'recent_offers'], ['annunci', 'annunci'], ['alerts', 'alerts'],
    ['profiles', 'profiles'], ['weekly_digest_log', 'digest_log_read'],
  ]) {
    for (const partial of [false, true]) {
      await test(`${table}: errore DB con data ${partial ? 'parziale' : 'null'}`, {
        faults: { [`${table}:select`]: { error: dbError(), partial } },
      }, (f, r) => {
        failedBeforeDelivery(f, r, stage, table === 'vetrina_email_log' ? undefined : '42703');
        assert.equal(f.events.at(-1), `${table}:select`, 'Stop immediato');
        assert.equal(f.lookups.length, 0);
      });
    }
    await test(`${table}: eccezione query senza dettagli privati`, {
      faults: { [`${table}:select`]: { throws: true } },
    }, (f, r) => failedBeforeDelivery(f, r, stage));
  }
  for (const code of ['PGRST205', '42P01', privateMarker]) {
    await test(`codice DB diagnostico ${code === privateMarker ? 'non valido' : code}`, {
      faults: { 'annunci:select': { error: dbError(code) } },
    }, (f, r) => failedBeforeDelivery(f, r, 'annunci', code === privateMarker ? undefined : code));
  }
  await test('nessun alert: skip legittimo', { alerts: [] }, (f, r) => {
    assert.equal(r.status, 200); assert.equal(r.body, 'No alerts');
    assert.equal(f.lookups.length + f.deliveries.length + f.writes.length + f.logs.length, 0);
  });
  for (const [name, options] of [
    ['consenso digest disattivato', { profiles: [profile('buyer', { email_digest: false })] }],
    ['profilo mancante', { profiles: [] }],
    ['già inviato nella settimana', { sent: [{ user_id: 'buyer', week_start: week }] }],
  ]) {
    await test(name, options, (f, r) => {
      assert.equal(r.status, 200); assert.equal(r.body, 'OK — 0 digest inviati');
      assert.equal(f.lookups.length + f.deliveries.length + f.writes.length, 0);
    });
  }
  for (const status of ['sent', 'reserved', 'unknown', 'failed']) {
    await test(`offerta ${status} entro 7 giorni: digest sostituito`, {
      offers: [{ user_id: 'buyer', status, created_at: '2026-11-05T09:00:00.000Z' }],
    }, (f, r) => {
      assert.equal(r.body, 'OK — 0 digest inviati');
      assert.equal(f.lookups.length + f.deliveries.length + f.writes.length, 0);
      const query = f.queries[0];
      assert.deepEqual(query.filters, [['gte', 'created_at', '2026-11-05T09:00:00.000Z'], ['neq', 'status', 'cancelled']]);
    });
  }
  for (const [name, options] of [
    ['offerta annullata', { offers: [{ user_id: 'buyer', status: 'cancelled', created_at: '2026-11-11T00:00:00Z' }] }],
    ['offerta oltre 7 giorni', { offers: [{ user_id: 'buyer', status: 'sent', created_at: '2026-11-05T08:59:59.999Z' }] }],
    ['log di altra settimana', { sent: [{ user_id: 'buyer', week_start: '2026-11-02' }] }],
    ['preferenza legacy null conservata', { profiles: [profile('buyer', { email_digest: null })] }],
    ['chiave servizio di fallback', { serviceFallback: true }],
    ['alert nazionale', { alerts: [alert('buyer', { lat: null, lng: null, comune: null })] }],
    ['coordinate da regione', { annunci: listings(3).map(a => ({ ...a, comune: 'Località fixture' })) }],
    ['località sconosciuta inclusa', { annunci: listings(3).map(a => ({ ...a, comune: 'Località fixture', regione: 'Regione fixture' })) }],
  ]) {
    await test(name, options, (f, r) => { assert.equal(r.status, 200); assert.equal(f.deliveries.length, 1); assert.equal(f.writes.length, 1); });
  }
  for (const [name, annunci] of [
    ['annuncio proprio escluso: solo due match', [...listings(2), listing('own', { user_id: 'buyer' })]],
    ['oltre 200 km escluso: solo due match', [...listings(2), listing('far', { comune: 'Roma', regione: 'Lazio' })]],
  ]) {
    await test(name, { annunci }, (f, r) => {
      assert.equal(r.body, 'OK — 0 digest inviati');
      assert.equal(f.lookups.length + f.deliveries.length + f.writes.length, 0);
    });
  }
  await test('massimo 5, ordine, ultimi 7 giorni, attivi, escaping', {
    annunci: [
      ...listings(6).map((a, i) => ({ ...a, created_at: `2026-11-${String(6 + i).padStart(2, '0')}T12:00:00Z` })),
      listing('boundary', { created_at: '2026-11-05T09:00:00.000Z' }),
      listing('old', { created_at: '2026-11-05T08:59:59.999Z' }),
      listing('inactive', { status: 'pending' }),
      listing('escaped', { titolo: '<Tag & "x">', created_at: '2026-11-12T08:00:00Z' }),
    ],
  }, (f, r) => {
    assert.equal(r.status, 200); assert.equal(f.deliveries.length, 1);
    const mail = f.deliveries[0];
    assert(mail.subject.startsWith('📬 5 '));
    assert(mail.html.includes('<strong>8 nuovi posteggi</strong>'));
    assert(mail.html.includes('&lt;Tag &amp; &quot;x&quot;&gt;')); assert(!mail.html.includes('<Tag'));
    assert.deepEqual(Array.from(mail.html.matchAll(/annuncio\.html\?id=([^"\s]+)/g), m => m[1]), ['escaped', 'listing-5', 'listing-4', 'listing-3', 'listing-2']);
  });
  await test('annunci fuori finestra e inattivi non contano per la soglia', {
    annunci: [...listings(2), listing('old', { created_at: '2026-11-04T12:00:00Z' }), listing('pending', { status: 'pending' })],
  }, (f, r) => { assert.equal(r.body, 'Skip: solo 2 annunci nuovi'); assert.equal(f.deliveries.length, 0); });
  await test('alert duplicati: una email per utente e consensi isolati', {
    alerts: [alert('buyer'), alert('buyer'), alert('other'), alert('optout')],
    profiles: [profile('buyer'), profile('other'), profile('optout', { email_digest: false })],
  }, (f, r) => {
    assert.equal(r.body, 'OK — 2 digest inviati');
    assert.deepEqual(f.lookups, ['buyer', 'other']);
    assert.deepEqual(f.writes.map(w => w.user_id), ['buyer', 'other']);
  });
  for (const options of [{ authError: dbError('PGRST301') }, { authThrows: true }]) {
    await test('errore lettura destinatario: stop prima di Resend', options,
      (f, r) => failedBeforeDelivery(f, r, 'recipient', options.authError?.code));
  }
  await test('email assente: nessun invio/log', { noEmail: true }, (f, r) => {
    assert.equal(r.body, 'OK — 0 digest inviati'); assert.equal(f.deliveries.length + f.writes.length, 0);
  });
  for (const throws of [false, true]) {
    await test(`errore scrittura deduplica ${throws ? 'eccezione' : 'DB'}: esito parziale esplicito`, {
      alerts: [alert('buyer'), alert('other')], profiles: [profile('buyer'), profile('other')],
      faults: { 'weekly_digest_log:upsert': throws ? { throws: true } : { error: dbError('23505') } },
    }, (f, r) => {
      assert.equal(r.status, 500); assert.equal(JSON.parse(r.body).stage, 'digest_log_write');
      assert.equal(f.deliveries.length, 1, 'Il provider aveva già accettato la prima email');
      assert.equal(f.writes.length, 0); assert.deepEqual(f.lookups, ['buyer']);
      assert(!/OK|Skip|inviati/.test(r.body));
    });
  }
  await test('provider rifiuta: nessuna deduplica o retry, comportamento conservato', { providerStatus: 429 }, (f, r) => {
    assert.equal(r.body, 'OK — 0 digest inviati'); assert.equal(f.deliveries.length, 1); assert.equal(f.writes.length, 0);
    assert.equal(f.logs.length, 1); assert(f.logs[0].includes('429'));
  });
  await test('eccezione provider: diagnostica privata esclusa', { providerThrows: true }, (f, r) => {
    assert.equal(r.status, 500); assert.equal(JSON.parse(r.body).stage, 'provider');
    assert.equal(f.deliveries.length, 1); assert.equal(f.writes.length, 0);
  });
  console.log(JSON.stringify(results, null, 2));
  console.log(`PASS: ${results.length} scenari sul vero handler e helper frequenza. Solo fixture e provider simulati; nessuna rete.`);
})().catch(error => { console.error(error.stack); process.exitCode = 1; });
