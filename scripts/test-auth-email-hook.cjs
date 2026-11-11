// Fixture locali: nessun servizio reale, nessuna credenziale letta dall'ambiente.
// Installazione isolata e comando: data/AUTH_EMAIL_HOOK.md.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');

const root = path.resolve(__dirname, '..');
const fixtureDir = path.join(root, '.local/auth-email-hook-fixture');
const modulePath = path.join(fixtureDir, 'node_modules/standardwebhooks');
assert.equal(require(path.join(modulePath, 'package.json')).version, '1.0.0');
const { Webhook } = require(modulePath);
const sourcePath = path.join(root, 'supabase/functions/send-auth-email/index.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const importLine = "import { Webhook } from 'npm:standardwebhooks@1.0.0';";
assert(source.includes(importLine), 'Usare la stessa versione nel test e nella funzione Edge');
const code = stripTypeScriptTypes(source.replace(importLine, ''));
const key = Buffer.alloc(32, 0x41); // Solo chiave sintetica di test.
const base64Secret = key.toString('base64');
const fullSecret = `v1,whsec_${base64Secret}`;
const now = Math.floor(Date.now() / 1000);
const input = {
  user: { email: 'fixture@example.invalid', user_metadata: { name: 'Élodie' } },
  email_data: {
    email_action_type: 'recovery', token_hash: 'fixture-hash-c01',
    token_hash_new: 'fixture-new-hash-c01', redirect_to: 'https://subingresso.it/reset-password.html',
  },
};
const body = JSON.stringify(input);
const results = [];

// Firma indipendente dalla libreria sottoposta a prova.
function signedHeaders(payload, { id = 'fixture-hook-id', timestamp = String(now), signingKey = key } = {}) {
  const signature = crypto.createHmac('sha256', signingKey)
    .update(`${id}.${timestamp}.${payload}`).digest('base64');
  return { 'webhook-id': id, 'webhook-timestamp': timestamp, 'webhook-signature': `v1,${signature}` };
}

function load({ secret = fullSecret, providerStatus = 200 } = {}) {
  const calls = [], logs = [];
  let handler;
  vm.runInNewContext(code, {
    Webhook, Request, Response, URL, TextEncoder, atob,
    Deno: {
      env: { get: name => ({
        SEND_EMAIL_HOOK_SECRET: secret ?? undefined, RESEND_API_KEY: 'fixture-provider-key',
        SUPABASE_URL: 'https://backend.invalid', SB_PUBLISHABLE_KEY: 'fixture-publishable-key',
      })[name] },
      serve: value => { handler = value; },
    },
    console: { error: (...values) => logs.push(values.join(' ')) },
    fetch: async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      calls.push({ url, options, payload: JSON.parse(options.body) });
      if (providerStatus === 'throw') throw new Error('Fixture provider offline');
      return new Response('Fixture provider response', { status: providerStatus });
    },
  }, { filename: sourcePath });
  assert.equal(typeof handler, 'function');
  return { handler, calls, logs };
}

async function run(name, {
  payload = body, headers = {}, method = 'POST', secret = fullSecret,
  expectedStatus = 401, expectedCalls = 0, providerStatus = 200,
} = {}) {
  const fixture = load({ secret, providerStatus });
  const request = new Request('https://function.invalid/send-auth-email', {
    method, headers, ...(method === 'GET' || method === 'HEAD' ? {} : { body: payload }),
  });
  request.json = () => { throw new Error('Il body deve essere verificato prima del parsing'); };
  const response = await fixture.handler(request);
  assert.equal(response.status, expectedStatus, name);
  assert.equal(fixture.calls.length, expectedCalls, `${name}: chiamate al provider`);
  const responseText = await response.text();
  for (const value of [fullSecret, base64Secret, 'fixture-hash-c01', 'fixture@example.invalid']) {
    assert(!responseText.includes(value), `${name}: risposta senza dati sensibili`);
    assert(!fixture.logs.join(' ').includes(value), `${name}: log senza dati sensibili`);
  }
  if (expectedStatus === 401 || expectedStatus === 503) {
    assert.equal(JSON.parse(responseText).error.http_code, expectedStatus);
    assert.equal(response.headers.get('Content-Type'), 'application/json');
  }
  results.push({ case: name, status: response.status, mocked_provider_calls: fixture.calls.length });
  return { ...fixture, response, responseText };
}

(async () => {
  // Stabilizza anche l'orologio della libreria reale per i limiti esatti di 300 s.
  const originalNow = Date.now;
  Date.now = () => now * 1000;
  try {
    await run('unsigned request');
    await run('unsigned malformed JSON', { payload: '{broken' });
    for (const token of ['fixture-anon-jwt', 'fixture-user-jwt', 'fixture-service-key']) {
      await run(`Bearer ${token} is insufficient`, { headers: { Authorization: `Bearer ${token}` } });
    }
    const headers = signedHeaders(body);
    for (const field of Object.keys(headers)) {
      const incomplete = { ...headers };
      delete incomplete[field];
      await run(`missing ${field}`, { headers: incomplete });
    }
    await run('wrong signing secret', { headers: signedHeaders(body, { signingKey: Buffer.alloc(32, 0x42) }) });
    await run('tampered email/token', { payload: body.replace('fixture-hash-c01', 'tampered-hash'), headers });
    await run('tampered whitespace', { payload: JSON.stringify(input, null, 2), headers });
    await run('tampered Unicode', { payload: body.replace('Élodie', 'Elodie'), headers });
    await run('tampered id', { headers: { ...headers, 'webhook-id': 'different-id' } });
    await run('tampered timestamp', { headers: { ...headers, 'webhook-timestamp': String(now + 1) } });
    await run('signed malformed JSON', { payload: '{broken', headers: signedHeaders('{broken') });
    for (const seconds of [-301, 301]) {
      await run(`signed timestamp outside tolerance ${seconds}`, {
        headers: signedHeaders(body, { timestamp: String(now + seconds) }),
      });
    }
    for (const timestamp of ['', 'invalid', `${now}junk`, `${now}.0`, `0${now}`, '-1', '9007199254740992']) {
      await run(`invalid timestamp ${timestamp}`, { headers: { ...headers, 'webhook-timestamp': timestamp } });
    }
    for (const signature of ['v1,', 'v2,invalid', 'v1,invalid', 'v1,invalid v1,also-invalid']) {
      await run(`invalid signature ${signature}`, { headers: { ...headers, 'webhook-signature': signature } });
    }
    for (const [name, secret] of [
      ['missing', null], ['empty', ''], ['blank', '  '], ['empty prefix', 'v1,whsec_'],
      ['malformed', 'invalid-hook-secret'], ['short', Buffer.alloc(8).toString('base64')],
      ['long', Buffer.alloc(65).toString('base64')], ['unsupported version', `v2,whsec_${base64Secret}`],
      ['invalid base64 padding', 'A'.repeat(32) + '=A'],
    ]) {
      await run(`${name} configuration fails closed`, { secret, headers, expectedStatus: 503 });
    }
    for (const secret of [fullSecret, `whsec_${base64Secret}`, base64Secret, ` ${fullSecret}\n`]) {
      await run(`valid secret format ${results.length}`, { secret, headers, expectedStatus: 200, expectedCalls: 1 });
    }
    for (const seconds of [-300, 300]) {
      await run(`timestamp tolerance boundary ${seconds}`, {
        headers: signedHeaders(body, { timestamp: String(now + seconds) }), expectedStatus: 200, expectedCalls: 1,
      });
    }
    const prettyBody = JSON.stringify(input, null, 2) + '\n';
    await run('authentic raw Unicode/whitespace body', {
      payload: prettyBody, headers: signedHeaders(prettyBody), expectedStatus: 200, expectedCalls: 1,
    });
    const validSignature = headers['webhook-signature'];
    for (const signatures of [
      `${validSignature} v1,invalid`, `v1,invalid ${validSignature}`,
      `v2,invalid ${validSignature}`, `v1,invalid, ${validSignature}`,
    ]) {
      await run(`multiple signatures ${results.length}`, {
        headers: { ...headers, 'webhook-signature': signatures }, expectedStatus: 200, expectedCalls: 1,
      });
    }
    // Ogni ramo email già gestito conserva destinatario, template e collegamento.
    for (const [action, linkType, subject, hash] of [
      ['signup', 'signup', 'Conferma la tua email', 'fixture-hash-c01'],
      ['recovery', 'recovery', 'Reimposta la tua password', 'fixture-hash-c01'],
      ['invite', 'invite', 'Sei stato invitato', 'fixture-hash-c01'],
      ['magic_link', 'magiclink', 'Il tuo link di accesso', 'fixture-hash-c01'],
      ['email_change_new', 'email_change_new', 'Conferma cambio email', 'fixture-new-hash-c01'],
      ['email_change_current', 'email_change_current', 'Conferma cambio email', 'fixture-hash-c01'],
    ]) {
      const payload = JSON.stringify({ ...input, email_data: { ...input.email_data, email_action_type: action } });
      const { calls, responseText } = await run(`authentic ${action}`, {
        payload, headers: signedHeaders(payload), expectedStatus: 200, expectedCalls: 1,
      });
      assert.equal(responseText, '{}');
      const sent = calls[0];
      assert.deepEqual(sent.payload.to, ['fixture@example.invalid']);
      assert.equal(sent.payload.from, 'Subingresso.it <noreply@subingresso.it>');
      assert(sent.payload.subject.startsWith(subject));
      const expectedLink = new URL('https://backend.invalid/auth/v1/verify');
      for (const [name, value] of Object.entries({ token: hash, type: linkType, redirect_to: input.email_data.redirect_to, apikey: 'fixture-publishable-key' })) {
        expectedLink.searchParams.set(name, value);
      }
      assert(sent.payload.html.includes(expectedLink.toString()));
      assert.equal(sent.options.method, 'POST');
      assert.equal(sent.options.headers.Authorization, 'Bearer fixture-provider-key');
    }
    const noOp = JSON.stringify({ ...input, email_data: { ...input.email_data, email_action_type: 'c01_signed_noop' } });
    await run('signed no-op for deployment verification without email', {
      payload: noOp, headers: signedHeaders(noOp), expectedStatus: 200,
    });
    await run('unsigned no-op still denied', { payload: noOp });
    const missingRecipient = JSON.stringify({ email_data: input.email_data });
    await run('signed missing recipient remains side-effect free', {
      payload: missingRecipient, headers: signedHeaders(missingRecipient), expectedStatus: 200,
    });
    await run('OPTIONS remains side-effect free', { method: 'OPTIONS', expectedStatus: 200 });
    for (const method of ['GET', 'PUT', 'DELETE']) {
      const { response } = await run(`method ${method} denied`, { method, headers, expectedStatus: 405 });
      assert.equal(response.headers.get('Allow'), 'POST, OPTIONS');
    }
    // C-02 resta fuori intervento: documentare e preservare il comportamento esistente.
    for (const providerStatus of [429, 500, 'throw']) {
      await run(`C-02 unchanged provider ${providerStatus}`, {
        headers, providerStatus, expectedStatus: 200, expectedCalls: 1,
      });
    }
  } finally {
    Date.now = originalNow;
  }
  const result = { checked_at: new Date().toISOString(), source_sha256: crypto.createHash('sha256').update(source).digest('hex'), library: 'standardwebhooks@1.0.0', local_only: true, passed: results.length, results };
  fs.writeFileSync(path.join(fixtureDir, 'test-results.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(`OK: ${results.length} test Auth Hook; solo fixture locali, nessun invio reale.`);
})().catch(error => { console.error(error); process.exitCode = 1; });
