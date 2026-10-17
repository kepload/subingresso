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
            setAttribute() {},
            classList: { add: c => classes.add(c), remove: c => classes.delete(c), contains: c => classes.has(c), toggle: (c, flag) => flag ? classes.add(c) : classes.delete(c) },
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
    saved_total: 333, tel_clicks_total: 222, msg_total: 111, photo_count: 1,
    description_length: 300, prezzo: 1000,
    daily: [{ day: '2026-10-17', views: 4, call_clicks: 1, whatsapp_clicks: 2, chat_clicks: 3, saves: 5, messages: 7 },
        { day: '2026-01-01', views: 9999, call_clicks: 9999, messages: 9999 }]
};
const payload = (days, listings = [listing]) => ({ data: { days, end_day: '2026-10-17', tracking_since: '2026-10-06', listings } });
const values = () => [...node('sellerAnalyticsSummary').innerHTML.matchAll(/leading-none mt-3 truncate">([^<]*)/g)].map(m => m[1]);
async function main() {
    const first = evaluate('loadSellerAnalytics(30)');
    pending.shift().resolve(payload(30));
    await first;
    assert.match(node('sellerAnalyticsSummary').innerHTML, /Visualizzazioni/);
    assert.match(node('sellerAnalyticsSummary').innerHTML, /Messaggi ricevuti/);
    assert.deepEqual(values(), ['4', '7', '1', '2']);
    assert.match(node('sellerAnalyticsActions').textContent, /Chat aperte: 3 · Nuovi preferiti: 5/);
    assert.doesNotMatch(node('sellerAnalyticsSummary').innerHTML, /nel periodo|Tasso contatto|111|222|333/);
    assert.match(node('sellerAnalyticsListingSelect').innerHTML, /&lt;img/);
    assert.equal(node('sellerAnalyticsChartWrap').classList.contains('hidden'), false);
    assert.equal(evaluate('_sellerAnalyticsChart.data.labels.length'), 30);
    assert.equal(evaluate('_sellerAnalyticsChart.data.datasets[0].data.reduce((a, b) => a + b, 0)'), 4);
    assert.equal(evaluate('_sellerAnalyticsChart.data.datasets[1].data.reduce((a, b) => a + b, 0)'), 7);
    assert.equal(evaluate('_sellerAnalyticsChart.data.datasets[2].data.reduce((a, b) => a + b, 0)'), 6);
    assert.equal(evaluate('_sellerAnalyticsChart.data.datasets[3].data.reduce((a, b) => a + b, 0)'), 5);
    assert.equal(evaluate('_sellerAnalyticsChart.data.datasets[0].data[0]'), null, 'Storico indisponibile, non zero');
    assert.match(node('sellerAnalyticsHistoryNote').textContent, /Storico parziale/);
    assert.match(node('sellerAnalyticsPeriod').textContent, /18 set 2026.*17 ott 2026/);
    assert.match(node('sellerVetrinaResults').innerHTML, /Risultati durante la Vetrina/);
    assert.match(node('sellerVetrinaResults').innerHTML, /Apparizioni/);
    assert.doesNotMatch(node('sellerVetrinaResults').innerHTML, /999/);

    // La risposta precedente non deve sovrascrivere il periodo appena scelto.
    const older = evaluate('loadSellerAnalytics(7)');
    const newer = evaluate('loadSellerAnalytics(90)');
    const loadingHTML = node('sellerAnalyticsSummary').innerHTML;
    evaluate('renderSellerAnalytics()');
    assert.equal(node('sellerAnalyticsSummary').innerHTML, loadingHTML, 'Il cambio annuncio durante il caricamento non mostra dati vecchi');
    const oldRequest = pending.shift();
    pending.shift().resolve(payload(90));
    await newer;
    oldRequest.resolve({ data: { days: 7, listings: [] } });
    await older;
    assert.equal(evaluate('_sellerAnalyticsState.days'), 90);
    assert.equal(evaluate('_sellerAnalyticsChart.data.labels.length'), 90);

    // Totali storici elevati, nessun evento nel periodo: tutti i numeri sono zero.
    const emptyPeriod = evaluate('loadSellerAnalytics(7)');
    pending.shift().resolve(payload(7, [{ ...listing, views_total: 900, daily: [] }]));
    await emptyPeriod;
    assert.deepEqual(values(), ['0', '0', '0', '0']);
    assert.equal(node('sellerAnalyticsHistoryNote').classList.contains('hidden'), true);
    assert.doesNotMatch(node('sellerAnalyticsAdvice').innerHTML, /Visualizzazioni senza azioni|Nuovi preferiti nel periodo/);

    // Bucket ancorati ai giorni UTC restituiti dal server, anche a capodanno.
    assert.equal(evaluate("_sellerDailyBuckets(7, '2027-01-02')[0].key"), '2026-12-27');
    assert.equal(evaluate("_sellerDailyBuckets(7, '2027-01-02')[6].key"), '2027-01-02');

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
    evaluate('renderSellerAnalytics()');
    assert.match(node('sellerAnalyticsSummary').innerHTML, /Riprova/, 'Il selettore non cancella un errore di caricamento');
    const retry = evaluate('loadSellerAnalytics()');
    pending.shift().resolve(payload(90));
    await retry;
    assert.deepEqual(values(), ['4', '7', '1', '2']);
    assert.equal(node('sellerAnalyticsHistoryNote').classList.contains('hidden'), false);

    evaluate("_sellerVetrinaStats = {listings:[{id:'first',waiting_days:30}],error:false}; renderSellerAnalytics()");
    assert.match(node('sellerVetrinaResults').innerHTML, /30 giorni acquistati in attesa/);
    evaluate("_sellerVetrinaStats = {listings:[],error:true}; renderSellerAnalytics()");
    assert.match(node('sellerVetrinaResults').innerHTML, /Riprova/);
    assert.doesNotMatch(node('sellerVetrinaResults').innerHTML, /card mostrate/);
    // Il filtro annuncio usa solo il giornaliero di quello selezionato.
    evaluate("_sellerAnalyticsState.listings.push({id:'second', daily:[{day:'2026-10-17', views:12, messages:1}]});");
    node('sellerAnalyticsListingSelect').value = 'second';
    evaluate('renderSellerAnalytics()');
    assert.deepEqual(values(), ['12', '1', '0', '0']);
    node('sellerAnalyticsListingSelect').value = 'all';
    evaluate('renderSellerAnalytics()');
    assert.deepEqual(values(), ['16', '8', '1', '2']);
    console.log(`OK: ${scripts} script validi; numeri solo nel periodo, messaggi distinti dai clic, grafico allineato, UTC, storico mancante, filtri, privacy, richieste fuori ordine ed errori/riprova.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
