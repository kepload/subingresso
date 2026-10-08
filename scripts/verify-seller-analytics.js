// Esegue le funzioni reali del pannello, con DOM/RPC/grafico controllati.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const html = fs.readFileSync(path.join(__dirname, '..', 'dashboard.html'), 'utf8');
let scripts = 0;
for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (/\bsrc\s*=|application\/ld\+json/i.test(match[1])) continue;
    new vm.Script(match[2]);
    scripts++;
}
const nodes = new Map();
function node(id) {
    if (!nodes.has(id)) {
        const classes = new Set(['hidden']);
        nodes.set(id, {
            innerHTML: '', value: 'all', className: '',
            classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c) },
            get options() { return [...this.innerHTML.matchAll(/value="([^"]*)"/g)].map(m => ({ value: m[1] })); },
            getContext: () => ({})
        });
    }
    return nodes.get(id);
}
const pending = [];
const context = vm.createContext({
    document: { getElementById: node }, console: { warn() {} },
    escapeHTML: s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]),
    _supabase: { rpc: (name, args) => {
        if (name === 'dashboard_vetrina_stats') return Promise.resolve({ data: { listings: [
            { id: 'first', impressions: 12, detail_views: 5, contact_actions: 2, waiting_days: 0 },
            { id: 'other', impressions: 999, detail_views: 999, contact_actions: 999, waiting_days: 0 }
        ] } });
        assert.equal(name, 'dashboard_seller_analytics');
        return new Promise(resolve => pending.push({ days: args.p_days, resolve }));
    } },
    isListingFeatured: l => !!l.featured && new Date(l.featured_until) > new Date(),
    isListingExpired: l => !!l.expires_at && new Date(l.expires_at) <= new Date(),
    Chart: class {
        constructor(canvas, config) { this.data = config.data; }
        update() {} destroy() {}
    }
});
vm.runInContext(html.slice(html.indexOf('// Seller analytics'), html.indexOf('async function loadMyListings()')), context);
const evaluate = code => vm.runInContext(code, context);
const listing = {
    id: 'first', titolo: '<img src=x onerror=alert(1)>', views_total: 20,
    saved_total: 3, tel_clicks_total: 2, msg_total: 1, photo_count: 1,
    description_length: 300, prezzo: 1000,
    daily: [{ day: new Date().toISOString().slice(0, 10), views: 4, call_clicks: 1, whatsapp_clicks: 1, chat_clicks: 1, saves: 2 }]
};
async function main() {
    const first = evaluate('loadSellerAnalytics(30)');
    pending.shift().resolve({ data: { days: 30, listings: [listing] } });
    await first;
    assert.match(node('sellerAnalyticsSummary').innerHTML, /Visite/);
    assert.match(node('sellerAnalyticsSummary').innerHTML, /Contatti/);
    assert.match(node('sellerAnalyticsListingSelect').innerHTML, /&lt;img/);
    assert.equal(node('sellerAnalyticsChartWrap').classList.contains('hidden'), false);
    assert.equal(evaluate('_sellerAnalyticsChart.data.labels.length'), 30);
    assert.equal(evaluate('_sellerAnalyticsChart.data.datasets[1].data.reduce((a, b) => a + b, 0)'), 3);
    assert.match(node('sellerVetrinaResults').innerHTML, /Risultati durante la Vetrina/);
    assert.match(node('sellerVetrinaResults').innerHTML, /Apparizioni/);
    assert.doesNotMatch(node('sellerVetrinaResults').innerHTML, /999/);

    // La risposta precedente non deve sovrascrivere il periodo appena scelto.
    const older = evaluate('loadSellerAnalytics(7)');
    const newer = evaluate('loadSellerAnalytics(90)');
    const oldRequest = pending.shift();
    pending.shift().resolve({ data: { days: 90, listings: [listing] } });
    await newer;
    oldRequest.resolve({ data: { days: 7, listings: [] } });
    await older;
    assert.equal(evaluate('_sellerAnalyticsState.days'), 90);
    assert.equal(evaluate('_sellerAnalyticsChart.data.labels.length'), 90);

    // Annuncio selezionato senza risultati: nessun grafico vuoto.
    node('sellerAnalyticsListingSelect').value = 'missing';
    evaluate('renderSellerAnalytics()');
    assert.match(node('sellerAnalyticsSummary').innerHTML, /Nessun annuncio/);
    assert.equal(node('sellerAnalyticsChartWrap').classList.contains('hidden'), true);
    assert.equal(node('sellerVetrinaResults').innerHTML, '');
    node('sellerAnalyticsListingSelect').value = 'all';

    const failed = evaluate('loadSellerAnalytics()');
    pending.shift().resolve({ error: { message: 'network error' } });
    await failed;
    assert.match(node('sellerAnalyticsSummary').innerHTML, /Riprova/);
    assert.doesNotMatch(node('sellerAnalyticsSummary').innerHTML, /in attivazione/);
    assert.equal(node('sellerAnalyticsChartWrap').classList.contains('hidden'), true);
    const retry = evaluate('loadSellerAnalytics()');
    pending.shift().resolve({ data: { days: 90, listings: [listing] } });
    await retry;
    assert.match(node('sellerAnalyticsSummary').innerHTML, /Tasso contatto/);
    assert.equal(node('sellerAnalyticsHistoryNote').classList.contains('hidden'), false);

    evaluate("_sellerVetrinaStats = {listings:[{id:'first',waiting_days:30}],error:false}; renderSellerAnalytics()");
    assert.match(node('sellerVetrinaResults').innerHTML, /30 giorni acquistati in attesa/);
    evaluate("_sellerVetrinaStats = {listings:[],error:true}; renderSellerAnalytics()");
    assert.match(node('sellerVetrinaResults').innerHTML, /Riprova/);
    assert.doesNotMatch(node('sellerVetrinaResults').innerHTML, /card mostrate/);
    console.log(`OK: ${scripts} script validi; riepiloghi, grafico, privacy DOM, periodi, risposte fuori ordine, stato vuoto e riprova.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
