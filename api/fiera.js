const FairReviews = require('../js/fair-reviews');
const { events, byId, fairPath, isIndexable, territories } = require('./_fiere');
require('../js/pages/fiere.js');
const calendar = globalThis.FiereCalendar;
const SITE = 'https://subingresso.it';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function link(url, label, external = false) {
    if (!url || (external && !/^https:\/\//i.test(url))) return '';
    return `<a href="${esc(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(label)}</a>`;
}
function section(title, content) { return `<section><h2>${esc(title)}</h2>${content}</section>`; }
function shell(title, description, path, body, indexable = true) {
    const breadcrumbs = {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{ '@type':'ListItem',position:1,name:'Fiere',item:SITE+'/fiere'},{'@type':'ListItem',position:2,name:title,item:SITE+path}]};
    return `<!doctype html><html lang="it"><head><meta charset="utf-8"><script src="/js/admin-theme.js?v=8"></script><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — Subingresso.it</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}"><link rel="canonical" href="${SITE}${esc(path)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${SITE}${esc(path)}"><meta property="og:type" content="website"><script type="application/ld+json">${JSON.stringify(breadcrumbs).replace(/</g, "\\u003c")}</script><link rel="icon" type="image/svg+xml" href="/favicon-v2.svg"><link rel="stylesheet" href="/css/fiera.css?v=4"><link rel="stylesheet" href="/css/design-system.css?v=15"><link rel="stylesheet" href="/css/admin-theme.css?v=7"></head><body><header><a href="/" aria-label="Subingresso.it, pagina iniziale" class="brand site-brand flex items-center flex-shrink-0"><span class="site-wordmark">Subingresso<span>.it</span></span></a><nav aria-label="Navigazione principale">${link('/fiere','Calendario fiere')} ${link('/annunci','Posteggi in vendita')}</nav></header><main>${body}</main><footer>${link('/fiere','Calendario e mappa')} · ${link('/fiere/elenco','Tutte le fiere')} · ${link('/contatti','Contatti')} · ${link('/privacy','Privacy')}</footer></body></html>`;
}
// The indexed URL serves the real explorer, with the same detail markup as the client.
// Keep content in the first HTML response, including when JavaScript is unavailable.
const fs = require('node:fs');
const path = require('node:path');
const FairDetail = require('../js/fair-detail');
const explorerTemplate = fs.readFileSync(path.join(__dirname, '..', 'fiere.html'), 'utf8');
function detail(event) {
    const publicFair = event.participation?.type === 'public';
    const exhibitorFair = ['selected', 'exhibitors'].includes(event.participation?.type);
    const intent = publicFair ? 'posteggi per ambulanti' : exhibitorFair ? 'partecipare come espositore' : 'partecipare con il banco';
    const audience = publicFair ? 'ambulanti' : exhibitorFair ? 'espositori' : 'ambulanti ed espositori';
    const title = `${event.name} a ${event.city}: ${intent}`;
    const description = `${event.name} a ${event.city}, ${event.province}: informazioni per ${audience} su date, prodotti e partecipazione. Consulta modalità di domanda, costi e fonte ufficiale.`;
    const url = SITE + fairPath(event);
    const breadcrumbs = {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Fiere',item:SITE+'/fiere'},{'@type':'ListItem',position:2,name:event.name,item:url}]};
    const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
    const reviews = FairReviews.sectionHTML('catalog', event.id, event.name, event.city, event.editions).replace('id="fair-reviews"', 'id="detail-reviews"');
    const markup = FairDetail.render(event, calendar, reviews, true);
    return explorerTemplate
        .replace(/<title>[^<]*<\/title>/, () => `<title>${esc(title)} — Subingresso.it</title>`)
        .replace(/<meta name="description" content="[^"]*">/, () => `<meta name="description" content="${esc(description)}"><meta name="robots" content="${isIndexable(event) ? 'index,follow' : 'noindex,follow'}">`)
        .replace(/<link rel="canonical" href="[^"]*">/, () => `<link rel="canonical" href="${esc(url)}">`)
        .replace(/<meta property="og:url" content="[^"]*">/, () => `<meta property="og:url" content="${esc(url)}">`)
        .replace(/<meta property="og:title" content="[^"]*">/, () => `<meta property="og:title" content="${esc(title)}">`)
        .replace(/<meta property="og:description" content="[^"]*">/, () => `<meta property="og:description" content="${esc(description)}">`)
        .replace('</head>', () => `<script id="fiera-breadcrumbs" type="application/ld+json">${json(breadcrumbs)}</script></head>`)
        .replace('<h1 id="page-title" class="fiere-page-title">Fiere per ambulanti</h1>', '<h2 id="page-title" class="fiere-page-title">Fiere per ambulanti</h2>')
        .replace('<dialog id="fair-dialog" class="fiere-dialog" aria-labelledby="detail-title"></dialog>', () => `<dialog id="fair-dialog" class="fiere-dialog" aria-labelledby="detail-title" open data-landing-fair="${esc(event.id)}">${markup}</dialog>`)
        .replace('</body>', () => `<script id="initial-fair" type="application/json">${json(event)}</script><noscript><style>#calendario{display:none}#close-detail{display:none}#fair-dialog[open]{position:relative;inset:auto;max-height:none;margin:24px auto}#fair-dialog .sf-fair-actions{display:none}</style></noscript></body>`);
}
function today() {
    return new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
function dateSummary(event) {
    const edition = calendar.selectEdition(event, today());
    if (!edition) return 'Periodo abituale: ' + (event.months || []).map(m => calendar.MONTHS[m-1]).join(', ') + '. Date della prossima edizione da confermare.';
    const state = edition.end && edition.end < today() ? 'Edizione passata' : edition.periodOnly ? 'Periodo annunciato, singole aperture da verificare' : edition.dateType === 'confirmed' && edition.start ? 'Date pubblicate dalla fonte' : 'Date indicative da riconfermare';
    return state + ': ' + calendar.editionLabel(edition);
}
function territoryLinks() {
    return section('Cerca per territorio', '<p>Fiere e mercatini per ambulanti ed espositori, con prodotti e procedure nelle schede. Le altre zone restano consultabili nel calendario e nell’elenco.</p><ul>' + territories.map(area => `<li>${link('/fiere/'+area.slug, 'Fiere per ambulanti in '+area.name)}</li>`).join('') + '</ul>');
}
function territory(area, page) {
    const all = events.filter(event => event.region === area.name && isIndexable(event));
    const sorted = calendar.sortEvents(all, today());
    const pages = Math.ceil(all.length / 60);
    if (!Number.isInteger(page) || page < 1 || page > pages) return null;
    const pagePath = n => '/fiere/'+area.slug+(n > 1 ? '?pagina='+n : '');
    const provinces = [...new Set(all.map(e => e.province))].sort((a,b)=>a.localeCompare(b,'it'));
    const rows = sorted.slice((page-1)*60,page*60).map(event => `<li><h3>${link(fairPath(event),event.name)}</h3><p>${esc(event.city)} (${esc(event.province)}) · ${esc(calendar.CATEGORIES[event.category] || 'Fiera')}</p><p>${esc(dateSummary(event))}</p><p>${esc(event.sectors)}.</p>${event.summary ? `<p>${esc(event.summary)}</p>` : ''}<p class="muted">Fonte verificata il ${esc(event.source.checkedAt)} · ${esc(calendar.deadlineStatus(event.participation || {}) || 'Apertura candidature da verificare nella scheda e nella fonte.')}</p></li>`).join('');
    const body = `<nav aria-label="Percorso">${link('/fiere','Fiere')} / ${esc(area.name)}</nav><h1>Fiere per ambulanti in ${esc(area.name)}</h1><p>${esc(area.intro)}</p>${area.source ? '<p>'+link(area.source,area.label+' ↗',true)+'</p>' : ''}<p>${all.length} schede documentate in ${provinces.length} province. La raccolta non è un censimento completo; non certifica posti disponibili. Le date passate restano come riferimento e non vengono proiettate sull’anno successivo.</p>${section('Province nella raccolta', '<details><summary>Apri le province documentate</summary><ul>'+provinces.map(province=>`<li>${link('/fiere?provincia='+encodeURIComponent(province),province+' · '+all.filter(e=>e.province===province).length+' schede documentate; apri la mappa')}</li>`).join('')+'</ul></details>')}<h2>Edizioni e periodi documentati</h2><p>Prima le edizioni non concluse; seguono periodi abituali e riferimenti passati. Apri la scheda per requisiti, costi, fonti e candidatura.</p><ol class="territory-fairs" start="${(page-1)*60+1}">${rows}</ol><nav aria-label="Pagine della regione">${page>1 ? link(pagePath(page-1),'← Precedente') : ''}<span>Pagina ${page} di ${pages}</span>${page<pages ? link(pagePath(page+1),'Successiva →') : ''}</nav>${section('Dalla scelta alla domanda', '<p>Per partecipare come venditore o espositore, controlla data, prodotti e operatore ammesso. Leggi avviso, scadenza, costi e servizi; presenta poi la domanda nel canale ufficiale esterno. La fonte può richiedere una propria autenticazione. Salva la fiera dalla scheda e imposta un promemoria per ricontrollare: non equivale a prenotare un banco.</p>')}${territoryLinks()}`;
    return shell(`Fiere per ambulanti in ${area.name}${page>1 ? ' — pagina '+page : ''}`,`Fiere e mercatini in ${area.name} per ambulanti ed espositori: date, prodotti, requisiti e procedure di domanda per partecipare con il banco.`,pagePath(page),body);
}
function listing(page) {
    const sorted = [...events].sort((a,b) => a.name.localeCompare(b.name,'it') || a.id.localeCompare(b.id));
    const pages = Math.ceil(sorted.length / 100);
    if (!Number.isInteger(page) || page < 1 || page > pages) return null;
    const pagePath = n => '/fiere/elenco' + (n > 1 ? '?pagina=' + n : '');
    const items = sorted.slice((page-1)*100,page*100).map(event => `<li>${link(fairPath(event),event.name)}<span class="muted"> · ${esc(event.city)} (${esc(event.province)})</span></li>`).join('');
    return shell(`Elenco fiere per ambulanti ed espositori — pagina ${page}`, 'Fiere e mercatini dove partecipare con il banco: sfoglia le schede per ambulanti ed espositori e consulta date, prodotti, modalità di domanda e fonti.',pagePath(page),`<h1>Fiere per ambulanti in Italia</h1><p>${link('/fiere','Cerca sulla mappa per mese e zona →')}</p><p>Cerca le fiere dove partecipare come venditore o espositore. Le informazioni mancanti sono indicate nelle singole schede.</p>${page === 1 ? territoryLinks() : ''}<ul>${items}</ul><nav aria-label="Pagine dell’elenco">${page > 1 ? link(pagePath(page-1),'← Precedente') : ''} <span>Pagina ${page} di ${pages}</span> ${page < pages ? link(pagePath(page+1),'Successiva →') : ''}</nav>`);
}
module.exports = function handler(req,res) {
    const slug = typeof req.query?.slug === 'string' ? req.query.slug : '';
    const area = territories.find(t => t.slug === slug);
    const html = slug === 'elenco' ? listing(Number(req.query.pagina || 1)) : area ? territory(area, Number(req.query.pagina || 1)) : byId.has(slug) ? detail(byId.get(slug)) : null;
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(html ? 200 : 404).send(html || shell('Fiera non trovata','La scheda richiesta non è disponibile.','/fiere', '<h1>Fiera non trovata</h1><p>' + link('/fiere','Torna al calendario fiere') + '</p>',false));
};
