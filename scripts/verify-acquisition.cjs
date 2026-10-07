const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const tracker = fs.readFileSync(path.join(root, 'js/page-view-tracker.js'), 'utf8');
function storage() { const data = new Map(); return { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,String(v)), removeItem: k => data.delete(k) }; }
async function page(url, { session = storage(), local = storage(), referrer = '', ok = true, webdriver = false } = {}) {
    const sent = [];
    const context = { window: {}, location: new URL(url), document: { readyState: 'complete', referrer }, navigator: { webdriver },
        sessionStorage: session, localStorage: local, URL, URLSearchParams, crypto: { randomUUID: () => 'random-id' },
        SUPABASE_URL: 'https://test.supabase.co', SUPABASE_ANON_KEY: 'public', setTimeout: fn => fn(),
        fetch: async (url, options) => { sent.push(JSON.parse(options.body)); return { ok }; } };
    vm.runInNewContext(tracker, context);
    await new Promise(resolve => setImmediate(resolve));
    return { context, sent, session, local };
}
(async () => {
    const first = await page('https://subingresso.it/blog?post=bandi-posteggi-lombardia&email=private@example.it&utm_source=google', { referrer: 'https://www.google.it/search?q=private' });
    assert.equal(first.sent[0].path, '/blog/bandi-posteggi-lombardia');
    assert.equal(first.sent[0].referrer, 'https://www.google.it');
    assert.equal(first.session.getItem('_acq_landing_path'), '/blog/bandi-posteggi-lombardia');
    assert.ok(!JSON.stringify(first.sent).includes('private'));
    const next = await page('https://subingresso.it/valutatore', first);
    assert.equal(next.context.window.getAcquisitionContext().landing_path, '/blog/bandi-posteggi-lombardia');
    assert.equal(next.sent[0].utm_source, 'google');
    const duplicate = await page('https://subingresso.it/valutatore', first);
    assert.equal(duplicate.sent.length, 0);
    const fair = await page('https://subingresso.it/index.html?utm_source=fiere&utm_medium=qr&utm_campaign=san-faustino-2027');
    assert.equal(fair.sent[0].path, '/');
    assert.equal(fair.sent[0].utm_source, 'fiere');
    assert.equal(fair.sent[0].utm_campaign, 'san-faustino-2027');
    const hostile = await page('https://subingresso.it/blog?post=guida%2Fhttps%3A%2F%2Fexample.com&utm_source=private%40mail.it', { referrer: 'https://subingresso.it.evil.com/?token=secret' });
    assert.equal(hostile.sent[0].path, '/blog/guida');
    assert.equal(hostile.sent[0].utm_source, null);
    assert.equal(hostile.sent[0].referrer, 'https://subingresso.it.evil.com');
    const own = await page('https://subingresso.it/bandi/test', { referrer: 'https://www.subingresso.it/blog?utm_source=google' });
    assert.equal(own.sent[0].referrer, null);
    const failed = await page('https://subingresso.it/annunci', { ok: false });
    assert.equal(failed.session.getItem('_pv_/annunci'), null);
    assert.equal((await page('https://subingresso.it/annunci', failed)).sent.length, 1);
    assert.equal((await page('https://subingresso.it/', { webdriver: true })).sent.length, 0);

    // Le nuove colonne devono ricevere solo il contesto minimizzato del tracker.
    const auth = fs.readFileSync(path.join(root,'js/auth.js'),'utf8');
    const authTracking = auth.slice(auth.indexOf('function _getAnonSession()'), auth.indexOf('// ── Open / Close'));
    const inserts = [];
    const authContext = { window: first.context.window, sessionStorage: first.session, crypto: first.context.crypto,
        _supabase: { from: name => ({ insert: async event => inserts.push({ name,event }) }) } };
    vm.createContext(authContext);
    vm.runInContext(authTracking, authContext);
    await vm.runInContext("_trackModalOpen('nav_accedi')", authContext);
    assert.equal(inserts[0].event.landing_path, '/blog/bandi-posteggi-lombardia');
    assert.equal(inserts[0].event.utm_source, 'google');

    const html = fs.readFileSync(path.join(root, 'dashboard.html'), 'utf8');
    const elements = new Map();
    const element = id => { if (!elements.has(id)) elements.set(id,{ textContent: '', innerHTML: '', value: '', setAttribute() {} }); return elements.get(id); };
    const mock = { document: { getElementById: element }, navigator: {}, escapeHTML: text => String(text).replaceAll('<','&lt;').replaceAll('>','&gt;'), _supabase: {} };
    vm.createContext(mock);
    vm.runInContext(html.slice(html.indexOf('let _acquisitionPeriod'), html.indexOf('// ── Funnel registrazione per sorgente (admin,')), mock);
    mock.payload = { total_sessions: 4,total_visitors: 3,total_signups: 2,attributed_signups: 1,unattributed_signups: 1,
        rows: [{ source: 'blog',sessions: 4,visitors: 3,signups: 1,share_pct: 100 }],channels: [{channel:'<img onerror=alert(1)>',sessions:4}] };
    vm.runInContext('renderAdminAcquisition(payload)', mock);
    assert.ok(element('acquisitionBody').innerHTML.includes('Blog'));
    assert.ok(!element('acquisitionChannels').innerHTML.includes('<img'));
    assert.ok(element('acquisitionCoverage').textContent.includes('Senza provenienza ricostruibile: 1'));
    element('acquisitionFairName').value = 'San Faustino — Brescia 2027';
    vm.runInContext('updateAcquisitionFairLink()', mock);
    assert.ok(element('acquisitionFairLink').value.endsWith('utm_campaign=san-faustino-brescia-2027'));
    let pending = [];
    mock._supabase.rpc = () => new Promise(resolve => pending.push(resolve));
    const oldRequest = vm.runInContext('loadAdminAcquisition()',mock);
    const newRequest = vm.runInContext('loadAdminAcquisition()',mock);
    pending[1]({data:mock.payload}); await newRequest;
    pending[0]({data:{...mock.payload,total_sessions:999}}); await oldRequest;
    assert.ok(element('acquisitionSummary').textContent.startsWith('4 ingressi'));
    mock._supabase.rpc = async () => ({ error: new Error('offline') });
    await vm.runInContext('loadAdminAcquisition()',mock);
    assert.ok(element('acquisitionBody').innerHTML.includes('Riprova'));
    assert.equal(element('acquisitionSummary').textContent,'');
    // Sintassi delle pagine e dei template statici caricati dal sito.
    for (const name of fs.readdirSync(root).filter(name => name.endsWith('.html'))) {
        for (const [tag,source] of fs.readFileSync(path.join(root,name),'utf8').matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
            if (!tag.includes('application/ld+json')) new vm.Script(source,{filename:name});
        }
    }
    console.log('OK: provenienza tra pagine, UTM fiere, URL/referrer minimizzati, dedup e retry, signup, dashboard, XSS e cambio periodo.');
})().catch(error => { console.error(error); process.exitCode = 1; });
