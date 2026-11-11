'use strict';
// Offline PostgreSQL regression suite. No project credentials or remote services.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { PGlite } = require(process.env.PGLITE_MODULE || '@electric-sql/pglite');
const root = path.resolve(__dirname, '..');
const patch = fs.readFileSync(path.join(root, 'PATCH_ADMIN_AUTHORIZATION_20261111.sql'), 'utf8');
const baselineFile = process.argv.find(arg => arg.startsWith('--baseline='))?.slice('--baseline='.length);
const results = [];
const ids = {
  admin: '11111111-1111-4111-8111-111111111111',
  user: '22222222-2222-4222-8222-222222222222',
  demo: '33333333-3333-4333-8333-333333333333',
  excluded: '44444444-4444-4444-8444-444444444444',
  missing: '55555555-5555-4555-8555-555555555555',
  nullAdmin: '66666666-6666-4666-8666-666666666666',
  demoAdmin: '77777777-7777-4777-8777-777777777777',
  scouting: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
};
const rpcs = [
  { name: 'admin_bando_alerts_stats', signature: '()', call: '()' },
  { name: 'admin_bando_scouting_list', signature: '(text, integer)', call: '()' },
  { name: 'admin_bando_scouting_decide', signature: '(uuid, text)', call: `('${ids.scouting}', 'reject')` },
  { name: 'admin_blog_stats', signature: '(integer)', call: '()' },
  { name: 'admin_bump_post_freshness', signature: '(text)', call: `('fixture-post')` }
];
const fixture = `
CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role BYPASSRLS;
CREATE SCHEMA auth; CREATE SCHEMA data_quality;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$
 SELECT coalesce(nullif(current_setting('request.jwt.claim.sub', true), ''),
   nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'sub')::uuid
$$;
CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$
 SELECT coalesce(nullif(current_setting('request.jwt.claim.role', true), ''),
   nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'role')
$$;
GRANT USAGE ON SCHEMA public, auth TO anon, authenticated, service_role;
CREATE TABLE public.profiles(id uuid PRIMARY KEY, is_admin boolean, is_demo boolean, excluded boolean);
INSERT INTO public.profiles VALUES
 ('${ids.admin}', true, false, true), ('${ids.user}', false, false, false),
 ('${ids.demo}', false, true, false), ('${ids.excluded}', false, false, true),
 ('${ids.nullAdmin}', null, false, false), ('${ids.demoAdmin}', true, true, true);
CREATE VIEW data_quality.analytics_profiles AS
 SELECT * FROM public.profiles WHERE is_admin IS NOT TRUE AND is_demo IS NOT TRUE AND NOT excluded;
CREATE TABLE public.bando_alerts(id integer PRIMARY KEY, email text, regione text, source text, created_at timestamptz, excluded boolean);
INSERT INTO public.bando_alerts VALUES
 (1, 'fixture@example.invalid', 'Lombardia', 'fixture', now(), false),
 (2, 'excluded@example.invalid', 'Lazio', 'internal', now(), true);
CREATE VIEW data_quality.analytics_bando_alerts AS SELECT * FROM public.bando_alerts WHERE NOT excluded;
CREATE TABLE public.bando_scouting_log(id uuid PRIMARY KEY, regione text, titolo text, link text, fonte text, ai_summary text,
 status text, discovered_at timestamptz, reviewed_at timestamptz, reviewed_by uuid, sent_at timestamptz,
 sent_count integer, approve_token uuid, reject_token uuid, published_slug text, published_at timestamptz);
INSERT INTO public.bando_scouting_log VALUES
 ('${ids.scouting}', 'Lombardia', 'Bando fixture', 'https://example.invalid/bando', 'fixture', 'summary',
 'pending', '2026-11-10T12:00:00Z', null, null, null, 0,
 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'fixture-bando', '2026-11-10T12:00:00Z');
CREATE TABLE public.blog_posts(slug text PRIMARY KEY, title text, category text, published_at timestamptz);
INSERT INTO public.blog_posts VALUES ('fixture-post', 'Fixture post', 'fixture', '2020-01-01T00:00:00Z');
CREATE TABLE public.page_views(path text, visitor_id text, created_at timestamptz, excluded boolean);
INSERT INTO public.page_views VALUES
 ('/blog/fixture-post', 'visitor-fixture', now(), false), ('/blog/fixture-post', 'excluded-visitor', now(), true);
CREATE VIEW data_quality.analytics_page_views AS SELECT * FROM public.page_views WHERE NOT excluded;
CREATE TABLE public.blog_conversions(post_slug text, kind text, created_at timestamptz, excluded boolean);
INSERT INTO public.blog_conversions VALUES
 ('fixture-post', 'cta_annunci_click', now(), false), ('fixture-post', 'alert_signup', now(), true);
CREATE VIEW data_quality.analytics_blog_conversions AS SELECT * FROM public.blog_conversions WHERE NOT excluded;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bando_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bando_scouting_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.profiles, public.bando_alerts, public.bando_scouting_log, public.blog_posts TO anon, authenticated;
`;
let db;
function pass(label) { results.push(label); console.log('PASS ' + label); }
async function actor(role, id = '', claimRole = role, claims = {}) {
  await db.exec('RESET ROLE');
  await db.query(`SELECT set_config('request.jwt.claim.sub', $1, false),
    set_config('request.jwt.claim.role', $2, false), set_config('request.jwt.claims', $3, false)`,
    [id, claimRole, JSON.stringify(claims)]);
  assert(['anon', 'authenticated', 'service_role', 'postgres'].includes(role));
  await db.exec('SET ROLE ' + role);
}
async function value(sql) { return (await db.query(sql)).rows[0].result; }
async function rpc(item, args = item.call) { return value(`SELECT public.${item.name}${args} AS result`); }
async function denied(item, label) {
  await assert.rejects(() => rpc(item), error => error.code === '42501', label + ': ' + item.name);
}
async function resetMutations() {
  await actor('postgres');
  await db.exec(`UPDATE public.bando_scouting_log SET status='pending', reviewed_by=null, reviewed_at=null;
    UPDATE public.blog_posts SET published_at='2020-01-01T00:00:00Z';`);
}
async function state() {
  await actor('postgres');
  return (await db.query(`SELECT (SELECT row_to_json(t) FROM
    (SELECT status, reviewed_by, reviewed_at FROM public.bando_scouting_log) t) AS scouting,
    (SELECT published_at::text FROM public.blog_posts) AS published_at`)).rows[0];
}
async function readOutputs(role, id) {
  await actor(role, id);
  return [await rpc(rpcs[0]), await rpc(rpcs[1]), await rpc(rpcs[3])];
}
async function checkBaseline(functions) {
  await db.exec(functions.map(f => f.definition.trim() + ';').join('\n'));
  await db.exec(rpcs.map(f => `REVOKE ALL ON FUNCTION public.${f.name}${f.signature} FROM PUBLIC;
    GRANT EXECUTE ON FUNCTION public.${f.name}${f.signature} TO anon, authenticated, service_role;`).join('\n'));
  await actor('anon');
  assert.equal((await rpc(rpcs[0])).recent[0].email, 'fixture@example.invalid');
  assert.equal((await rpc(rpcs[1])).rows[0].approve_token, 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  assert.equal((await rpc(rpcs[2])).ok, true);
  assert.equal((await state()).scouting.reviewed_by, null);
  await actor('authenticated', ids.demo);
  assert.equal((await rpc(rpcs[3])).total_views, 1);
  await actor('authenticated', ids.missing);
  assert.equal((await rpc(rpcs[4])).ok, true);
  pass('baseline: anonymous bando access, demo blog access and missing-profile blog mutation reproduced locally');
  await resetMutations();
  const outputs = await readOutputs('authenticated', ids.admin);
  await actor('service_role');
  assert.equal((await rpc(rpcs[0])).total, 1);
  assert.equal((await rpc(rpcs[1])).rows.length, 1);
  assert.equal((await rpc(rpcs[2])).ok, true);
  for (const f of rpcs.slice(3)) await denied(f, 'baseline service without admin user');
  pass('baseline: legitimate service bando access and blog identity requirement verified');
  await resetMutations();
  return outputs;
}
(async () => {
  db = new PGlite();
  await db.waitReady;
  // Any accidental network request after the engine has loaded is a hard failure.
  global.fetch = async () => { throw Error('Network forbidden in admin authorization tests'); };
  await db.exec(fixture);
  let originalOutputs;
  if (baselineFile) {
    const snapshot = JSON.parse(fs.readFileSync(path.resolve(baselineFile), 'utf8'));
    const functions = snapshot.metadata.functions.filter(f => f.nspname === 'public' && rpcs.some(r => r.name === f.proname));
    assert.equal(functions.length, 5);
    originalOutputs = await checkBaseline(functions);
  } else {
    // Reproduce the existing explicit anon ACL and default PUBLIC execution grant.
    await db.exec(`CREATE FUNCTION public.admin_bando_alerts_stats() RETURNS jsonb LANGUAGE sql AS $$ SELECT '{}'::jsonb $$;
      CREATE FUNCTION public.admin_bando_scouting_list(p_status text DEFAULT 'pending', p_limit integer DEFAULT 50) RETURNS jsonb LANGUAGE sql AS $$ SELECT '{}'::jsonb $$;
      CREATE FUNCTION public.admin_bando_scouting_decide(p_id uuid, p_action text) RETURNS jsonb LANGUAGE sql AS $$ SELECT '{}'::jsonb $$;
      CREATE FUNCTION public.admin_blog_stats(p_days integer DEFAULT 30) RETURNS jsonb LANGUAGE sql AS $$ SELECT '{}'::jsonb $$;
      CREATE FUNCTION public.admin_bump_post_freshness(p_slug text) RETURNS jsonb LANGUAGE sql AS $$ SELECT '{}'::jsonb $$;`);
    await db.exec(rpcs.map(f => `GRANT EXECUTE ON FUNCTION public.${f.name}${f.signature} TO anon, authenticated, service_role`).join(';'));
  }
  await db.exec(patch);
  const firstDefinitions = (await db.query(`SELECT proname, prosrc, proacl::text FROM pg_proc
    WHERE pronamespace='public'::regnamespace AND proname LIKE 'admin_%' ORDER BY proname`)).rows;
  await db.exec(patch);
  const secondDefinitions = (await db.query(`SELECT proname, prosrc, proacl::text FROM pg_proc
    WHERE pronamespace='public'::regnamespace AND proname LIKE 'admin_%' ORDER BY proname`)).rows;
  assert.deepEqual(secondDefinitions, firstDefinitions);
  pass('migration applies and is idempotent with existing explicit anon grants');
  for (const f of rpcs) {
    const grants = await db.query(`SELECT has_function_privilege('anon', $1, 'EXECUTE') AS anon,
      has_function_privilege('authenticated', $1, 'EXECUTE') AS authenticated,
      has_function_privilege('service_role', $1, 'EXECUTE') AS service,
      EXISTS(SELECT 1 FROM pg_proc p, LATERAL aclexplode(coalesce(p.proacl, acldefault('f', p.proowner))) a
        WHERE p.oid=$1::regprocedure AND a.grantee=0 AND a.privilege_type='EXECUTE') AS public`, ['public.' + f.name + f.signature]);
    assert.deepEqual(grants.rows[0], { anon: false, authenticated: true, service: true, public: false });
  }
  pass('all five ACLs deny anon and PUBLIC, retaining authenticated and service_role');
  await actor('anon');
  assert.equal(await value('SELECT count(*)::int AS result FROM public.bando_alerts'), 0);
  for (const f of rpcs) await denied(f, 'anonymous ACL');
  await actor('anon', ids.admin);
  for (const f of rpcs) await denied(f, 'anonymous ACL even with admin subject');
  pass('anonymous role blocked by ACL, including a simulated admin subject');
  const forbidden = [
    ['missing profile', ids.missing], ['ordinary user', ids.user], ['demo non-admin', ids.demo],
    ['excluded non-admin', ids.excluded], ['NULL admin flag', ids.nullAdmin], ['missing subject', '']
  ];
  for (const [label, id] of forbidden) {
    await resetMutations();
    const before = await state();
    await actor('authenticated', id);
    for (const f of rpcs) await denied(f, label);
    assert.deepEqual(await state(), before, label + ': no mutations');
    pass(label + ': all five RPCs denied with 42501, no side effects');
  }
  // Defense in depth: test the body even if an anon grant is accidentally reintroduced.
  await db.exec('BEGIN');
  await db.exec(rpcs.map(f => `GRANT EXECUTE ON FUNCTION public.${f.name}${f.signature} TO anon`).join(';'));
  await actor('anon');
  for (const f of rpcs) {
    await db.exec('SAVEPOINT anonymous_body');
    await denied(f, 'anonymous body');
    await db.exec('ROLLBACK TO SAVEPOINT anonymous_body');
  }
  await actor('postgres');
  await db.exec('ROLLBACK');
  pass('bodies fail closed for anonymous callers even with temporary EXECUTE grants');
  for (const id of [ids.admin, ids.demoAdmin]) {
    await resetMutations();
    const outputs = await readOutputs('authenticated', id);
    assert.equal(outputs[0].total, 1);
    assert.equal(outputs[0].recent[0].email, 'fixture@example.invalid');
    assert.equal(outputs[1].rows[0].published_slug, 'fixture-bando');
    assert.equal(outputs[1].counts.published_pages, 1);
    assert.equal(outputs[2].total_views, 1);
    assert.equal(outputs[2].total_conversions, 1);
    assert.equal(outputs[2].rows[0].title, 'Fixture post');
    if (originalOutputs) assert.deepEqual(outputs, originalOutputs);
    await actor('authenticated', id);
    assert.equal((await rpc(rpcs[2])).action, 'rejected');
    assert.equal((await rpc(rpcs[4])).ok, true);
    const changed = await state();
    assert.equal(changed.scouting.reviewed_by, id);
    assert(new Date(changed.published_at) > new Date('2020-01-01T00:00:00Z'), 'fixture blog timestamp updated');
    await actor('authenticated', id);
    assert.deepEqual(await rpc(rpcs[4], "('missing-post')"), { ok: false, error: 'slug_not_found' });
    await assert.rejects(() => rpc(rpcs[2]), error => error.message.includes('already rejected'));
    pass((id === ids.admin ? 'admin excluded from analytics' : 'demo admin') + ': full outputs, exclusions, mutations and business errors preserved');
  }
  for (const id of [ids.admin, '']) {
    await resetMutations();
    await actor('authenticated', id);
    if (id) {
      assert.equal((await rpc(rpcs[2], `('${ids.scouting}', 'approve')`)).action, 'approved');
      assert.equal((await state()).scouting.reviewed_by, id);
    } else {
      // Real service identity from JWT role claim; no user profile needed.
      await actor('service_role');
      assert.equal((await rpc(rpcs[0])).total, 1);
      assert.equal((await rpc(rpcs[1])).rows.length, 1);
      assert.equal((await rpc(rpcs[2], `('${ids.scouting}', 'approve')`)).action, 'approved');
      assert.equal((await state()).scouting.reviewed_by, null);
    }
  }
  await actor('service_role');
  for (const f of rpcs.slice(3)) await denied(f, 'service blog still requires admin user');
  pass('admin approval and service approval remain available; blog service still requires admin identity');
  await resetMutations();
  await actor('service_role', '', '', { role: 'service_role' });
  assert.equal((await rpc(rpcs[0])).total, 1);
  assert.equal((await rpc(rpcs[1])).rows.length, 1);
  assert.equal((await rpc(rpcs[2])).action, 'rejected');
  await actor('service_role', ids.admin);
  for (const f of rpcs.slice(3)) assert(await rpc(f));
  pass('service JWT JSON claims and service with genuine admin subject preserved');
  await actor('postgres', '', '');
  for (const f of rpcs) await denied(f, 'NULL role and NULL subject');
  pass('NULL role and NULL subject fail closed without relying on ACL');
  console.log(JSON.stringify({ status: 'PASS', groups: results.length, engine: 'PGlite PostgreSQL',
    baseline_reproduced: !!baselineFile, production_requests: 0, production_writes: 0 }, null, 2));
})().catch(error => { console.error(error.stack); process.exitCode = 1; }).finally(async () => { if (db) await db.close(); });
