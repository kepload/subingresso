// One catalogue for calendar, detail pages and sitemap. Stable IDs survive new editions.
const catalog = require('../data/fiere.json');
const events = catalog.events;
const byId = new Map(events.map(event => [event.id, event]));
const fairPath = event => '/fiere/' + encodeURIComponent(event.id);
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const identity = event => normalize(event.city) + '|' + normalize(event.name);
const identities = new Map();
for (const event of events) identities.set(identity(event), (identities.get(identity(event)) || 0) + 1);
const descriptions = new Map();
const description = event => normalize([event.summary, event.participation?.note].filter(Boolean).join(' '));
for (const event of events) descriptions.set(description(event), (descriptions.get(description(event)) || 0) + 1);
function qualityIssues(event) {
    const issues = [];
    if (!/^https:\/\/[^/\s]+/i.test(event.source?.url || '') || !/^\d{4}-\d{2}-\d{2}$/.test(event.source?.checkedAt || '')) issues.push('fonte o data di verifica mancanti');
    if (!event.name || !event.city || !event.province || !event.region) issues.push('identità territoriale incompleta');
    if ((identities.get(identity(event)) || 0) > 1) issues.push('possibile duplicato da revisionare');
    const text = [event.summary, event.participation?.note].filter(Boolean).join(' ');
    if (text.length < 180 || new Set(normalize(text).split(' ')).size < 22) issues.push('contenuto descrittivo insufficiente');
    if ((descriptions.get(description(event)) || 0) > 1) issues.push('testo descrittivo seriale da arricchire');
    if (!event.months?.length && !event.editions?.length) issues.push('periodo non documentato');
    if (!event.sectors || (!event.venue && !event.editions?.length && !event.summary)) issues.push('dettagli autonomi insufficienti');
    if (event.seo?.noindex === true) issues.push('esclusione editoriale');
    return issues;
}
function isIndexable(event) { return qualityIssues(event).length === 0; }
// Deliberately finite: no arbitrary combinations of filters become landing pages.
const territories = [
    {slug:'lombardia',name:'Lombardia',intro:'Fiere comunali, mostre mercato e sagre: il calendario regionale distingue manifestazioni su area pubblica ed eventi espositivi. La presenza nel calendario non sostituisce il bando del Comune né autorizza la vendita.',source:'https://www.dati.lombardia.it/Commercio/Sagre-e-fiere-su-area-pubblica/hs8z-dcey',label:'Registro regionale di sagre e fiere su area pubblica'},
    {slug:'piemonte',name:'Piemonte',intro:'Le fonti regionali distinguono fiere e fiere mercato dalle sagre. Controlla nella scheda il settore della manifestazione e la procedura comunale: esposizione, somministrazione e vendita ambulante possono avere requisiti diversi.',source:'https://www.regione.piemonte.it/gestione/commercio/fiere/find.php?fine=1000&inizio=0&mese=-1&provincia=-1&qualifica=-1&scelta=2',label:'Calendario regionale delle fiere e fiere mercato'},
    {slug:'emilia-romagna',name:'Emilia-Romagna',intro:'Dalle fiere tradizionali ai mercatini e agli eventi gastronomici: le schede raccolgono calendari e avvisi dei singoli Comuni e organizzatori. Verifica se la procedura riguarda un posteggio ordinario, la spunta o una selezione di espositori: non sono equivalenti.'}
].filter(area => events.filter(event => event.region === area.name && isIndexable(event)).length >= 20);
module.exports = { catalog, events, byId, fairPath, isIndexable, qualityIssues, territories };
