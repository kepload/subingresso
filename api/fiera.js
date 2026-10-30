const { events, byId, fairPath, isIndexable, territories } = require('./_fiere');
require('../js/pages/fiere.js');
const calendar = globalThis.FiereCalendar;
const SITE = 'https://subingresso.it';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function link(url, label, external = false) {
    if (!url || (external && !/^https:\/\//i.test(url))) return '';
    return `<a href="${esc(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(label)}</a>`;
}
function sourceLink(event, url, label) {
    if (!url || !/^https:\/\//i.test(url)) return '';
    return `<a href="${esc(url)}" data-fiere-id="${esc(event.id)}" data-fiere-source="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
}
const sourceLinks = event => (url, label, external = false) => external ? sourceLink(event, url, label) : link(url, label);
function accessBanner() {
    return `<section class="fiere-access" data-fiere-guest hidden aria-labelledby="fiere-access-title"><div class="fiere-access-copy"><span class="fiere-access-kicker">Gratis per gli ambulanti</span><h2 id="fiere-access-title">Trova le fiere per il tuo banco</h2><p>Consulta liberamente le fonti ufficiali. Registrati per salvare le fiere e scegliere un promemoria.</p><ul><li>Salva le fiere che ti interessano</li><li>Scegli un promemoria via email</li><li>Attiva dal profilo gli avvisi per bandi e posteggi</li></ul></div><div class="fiere-access-actions"><a href="/fiere?iscrizione=1" class="fiere-access-register" data-fiere-register>Registrati gratis</a><a href="/fiere?iscrizione=1" class="fiere-access-login" data-fiere-login>Hai già un account? Accedi</a><small>Nessun abbonamento.</small></div></section>`;
}
function withAccess(html) {
    return html.replace('<link rel="stylesheet" href="/css/fiera.css?v=4">', '<link rel="stylesheet" href="/css/tailwind.css?v=4"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"><link rel="stylesheet" href="/css/fiera.css?v=4"><link rel="stylesheet" href="/css/fiere-access.css?v=1"><link rel="stylesheet" href="/css/saved-fairs.css?v=3">')
        .replace('<body>', '<body class="fiera-page">')
        .replace('</body>', '<noscript><p class="notice">Le fonti e le procedure esterne sono consultabili anche senza JavaScript. Abilitalo per salvare la fiera e impostare un promemoria.</p></noscript><script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script src="/js/supabase-config.js?v=4"></script><script src="/js/page-view-tracker.js?v=5"></script><script src="/js/site-analytics.js?v=2"></script><script src="/js/image-urls.js?v=1"></script><script src="/js/data.js?v=26"></script><script src="/js/auth.js?v=30"></script><script src="/js/fiere-access.js?v=5"></script><script type="module" src="/js/saved-fairs.js?v=4"></script></body>');
}
function section(title, content) { return `<section><h2>${esc(title)}</h2>${content}</section>`; }
function attendanceSection(event) {
    const link = sourceLinks(event);
    const info = calendar.attendanceInfo(event);
    if (!info) return '';
    const a = info.record;
    return section('Affluenza', `${info.level ? `<p class="fiere-attendance" data-attendance="${esc(info.level)}">${esc(info.label)}</p>` : ''}<p>${esc(info.total)} · edizione ${esc(info.year)}</p><p class="muted">${esc(info.status)}</p><details><summary>Dato, fonte e criterio</summary><p>${esc(a.note)}</p><p>${esc(info.comparison)}</p><p>${link(a.source.url,a.source.label,true)}</p>${(a.additionalSources || []).map(source => '<p>' + link(source.url,source.label,true) + '</p>').join('')}<p>Periodo: ${esc(a.start)} – ${esc(a.end)}. Fonte consultata il ${esc(a.checkedAt)}.</p><p>${esc(calendar.attendanceCriteria())}</p></details>`);
}
function shell(title, description, path, body, indexable = true) {
    const breadcrumbs = {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{ '@type':'ListItem',position:1,name:'Fiere',item:SITE+'/fiere'},{'@type':'ListItem',position:2,name:title,item:SITE+path}]};
    return `<!doctype html><html lang="it"><head><meta charset="utf-8"><script src="/js/admin-theme.js?v=8"></script><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — Subingresso.it</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}"><link rel="canonical" href="${SITE}${esc(path)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${SITE}${esc(path)}"><meta property="og:type" content="website"><script type="application/ld+json">${JSON.stringify(breadcrumbs).replace(/</g, "\\u003c")}</script><link rel="stylesheet" href="/css/fiera.css?v=4"><link rel="stylesheet" href="/css/design-system.css?v=15"><link rel="stylesheet" href="/css/admin-theme.css?v=7"></head><body><header><a href="/" aria-label="Subingresso.it, pagina iniziale" class="brand site-brand flex items-center flex-shrink-0"><span class="site-wordmark">Subingresso<span>.it</span></span></a><nav aria-label="Navigazione principale">${link('/fiere','Calendario fiere')} ${link('/annunci','Posteggi in vendita')}</nav></header><main>${body}</main><footer>${link('/fiere','Calendario e mappa')} · ${link('/fiere/elenco','Tutte le fiere')} · ${link('/contatti','Contatti')} · ${link('/privacy','Privacy')}</footer></body></html>`;
}
function detail(event) {
    const link = sourceLinks(event);
    const participation = event.participation || {};
    const title = `${event.name} a ${event.city}: date e partecipazione`;
    const description = `${event.name} a ${event.city}, ${event.province}: date disponibili, informazioni per partecipare, costi e fonti. Verifica le condizioni per il tuo banco.`;
    const editions = (event.editions || []).map(edition => {
        const warning = calendar.editionStatus(edition);
        return `<li><strong>${esc(calendar.editionLabel(edition))}</strong>${warning ? ` <details><summary>Verifica delle date</summary><p>${esc(warning)}</p></details>` : ''} ${link(edition.sourceUrl, 'Fonte delle date ↗', true)}</li>`;
    }).join('');
    const facts = [['Luogo',event.venue],['Organizzatore',event.organizer],['Orari indicati dalla fonte',event.hours],['Settori nella fonte',event.sectors],['Categorie',(event.merchandiseSectors || []).map(s => calendar.SECTORS[s]).join(' · ')],['Tipologie di articolo',calendar.articleTypes(event).map(key => calendar.ARTICLE_TYPES[key].label).join(' · ')],['Posteggi dichiarati',event.stallCount ? `${event.stallCount} · ${event.stallCountNote || 'organico della manifestazione, non posti liberi'}` : '']].filter(([,value]) => value).map(([label,value]) => `<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`).join('');
    const costs = event.pricing?.details || participation.costs;
    const contacts = Object.entries(event.contacts || {}).filter(([key,value]) => ['email','pec','phone'].includes(key) && value).map(([key,value]) => `<p>${esc({email:'Email',pec:'PEC',phone:'Telefono'}[key])}: ${link(key === 'phone' ? 'tel:' + value.replace(/[^\d+]/g,'') : 'mailto:' + value, value)}</p>`).join('');
    const nearby = events.filter(other => other.id !== event.id && other.province === event.province && isIndexable(other)).slice(0,6);
    const body = `<nav aria-label="Percorso">${link('/fiere','Fiere')} / ${link('/fiere/elenco','Elenco fiere')} / ${territories.some(t => t.name === event.region) ? link('/fiere/' + territories.find(t => t.name === event.region).slug, event.region) + ' / ' : ''}${esc(event.city)}</nav><p class="eyebrow">${esc(calendar.CATEGORIES[event.category] || 'Fiera')} · ${esc(event.region)}</p><h1>${esc(event.name)}</h1><p class="location">${esc(event.city)} · ${esc(event.province)}</p>${participationOverview(event)}${attendanceSection(event)}${event.summary ? `<p>${esc(event.summary)}</p>` : ''}${!isIndexable(event) ? '<p class="notice">Scheda con documentazione informativa da completare. Consulta la fonte o contatta l’organizzatore.</p>' : ''}${section('Date delle edizioni', editions ? `<ul class="editions">${editions}</ul>` : '<p>La prossima edizione non ha ancora una data pubblicata in questa scheda. Consulta la fonte o contatta l’organizzatore.</p>')}<p>Mesi di riferimento: ${esc((event.months || []).map(m => calendar.MONTHS[m-1]).join(', '))}. Non sostituiscono le date confermate.</p>${event.frequencyNote ? `<p>${esc(event.frequencyNote)}</p>` : ''}${facts ? `<dl>${facts}</dl>` : ''}${section('Per partecipare con il tuo banco', `<p>${esc(participation.note || 'Condizioni da verificare con l’organizzatore.')}</p>${calendar.deadlineStatus(participation) ? `<p class="notice">${esc(calendar.deadlineStatus(participation))}</p>` : ''}${link(participation.url,'Consulta la procedura di partecipazione ↗',true)}${contacts}`)}${section('Costi per partecipare', `<p>${esc(costs || 'Importo non verificato per questa fiera. Chiedi all’organizzatore la quota del banco, il canone e gli eventuali servizi aggiuntivi.')}</p>${event.pricing ? `<p class="muted">${esc(event.pricing.period ? 'Tariffe ' + event.pricing.period : 'Anno tariffario da verificare')}${event.pricing.checkedAt ? ' · fonte consultata il ' + esc(event.pricing.checkedAt) : ''}</p>` : ''}${link(event.pricing?.sourceUrl || (costs ? participation.url : ''),'Fonte delle tariffe ↗',true)}`)}${section('Fonti e aggiornamenti', `<p>${link(event.source?.url,'Consulta la fonte ↗',true)}</p>${event.source?.checkedAt ? `<p class="muted">Fonte consultata il ${esc(event.source.checkedAt)}. Verifica eventuali aggiornamenti prima di organizzare la partecipazione.</p>` : '<p class="muted">Date e condizioni dell’edizione da verificare presso la fonte.</p>'}${link(event.calendarSource?.url,event.calendarSource?.label || 'Calendario di riferimento ↗',true)}`)}<p>${link('/fiere?provincia=' + encodeURIComponent(event.province),'Vedi altre fiere in zona sulla mappa →')}</p>${nearby.length ? section('Altre fiere nella provincia', '<ul>' + nearby.map(other => `<li>${link(fairPath(other),other.name + ' · ' + other.city)}</li>`).join('') + '</ul>') : ''}<p>${link('/annunci?regione=' + encodeURIComponent(event.region),'Cerca posteggi in questa regione →')}</p>`;
    const research = calendar.articleResearch(event);
    const researchHTML = research ? section('Articoli verificati', `<p>${esc(research.theme)}. Fonti consultate il ${esc(research.checkedAt)}.</p><ul>${Object.entries(research.articles).filter(([,item]) => item.role !== 'unknown').map(([key,item]) => `<li>${esc(calendar.ARTICLE_TYPES[key].label)}${item.condition ? ' — ' + esc(item.condition) : ''}</li>`).join('')}</ul>${research.sources.map(source => '<p>' + link(source.url,source.label,true) + '</p>').join('')}`) : '';
    const actions = '<div class="sf-fair-actions"><button type="button" class="saved-fair-button" aria-label="Salva la fiera" title="Salva" data-save-fair data-fair-kind="catalog" data-fair-id="' + esc(event.id) + '"><i class="far fa-bookmark" aria-hidden="true"></i></button><button type="button" class="saved-fair-button" aria-label="Avvisami" title="Avvisami" data-remind-fair data-fair-kind="catalog" data-fair-id="' + esc(event.id) + '" aria-haspopup="dialog"><i class="far fa-bell" aria-hidden="true"></i></button></div>';
    return withAccess(shell(title, description, fairPath(event), body + researchHTML + section('Salva e ricontrolla prima di partire', '<p>Puoi salvare la fiera e scegliere un promemoria via email. Il promemoria non presenta una candidatura e non riserva un posteggio.</p>' + actions + accessBanner()), isIndexable(event)));
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
function participationOverview(event) {
    const participation = event.participation || {};
    const state = calendar.deadlineStatus(participation);
    return section('Prima di candidarti', `<dl><dt>Quando</dt><dd>${esc(dateSummary(event))}</dd><dt>Prodotti e operatori</dt><dd>${esc(event.sectors || 'Prodotti e operatori ammessi non documentati: chiedi all’organizzatore.')} I settori descrivono la manifestazione; l’ammissione del singolo operatore va verificata nella procedura.</dd><dt>Candidature</dt><dd>${esc(state || 'Scadenza e apertura attuale delle domande da verificare presso il responsabile. Leggi le condizioni sotto e controlla l’avviso ufficiale.')} Nessuna disponibilità di posti è garantita da questa scheda.</dd><dt>Organizzatore</dt><dd>${esc(event.organizer || 'Nome non documentato separatamente: verifica il soggetto responsabile nella fonte.')}</dd><dt>Procedura</dt><dd>${participation.url ? sourceLink(event, participation.url, 'Apri la procedura esterna ↗') : 'Procedura di candidatura non documentata con un collegamento dedicato. ' + sourceLink(event, event.source?.url, 'Verifica presso la fonte ↗')} La domanda si presenta al Comune o all’organizzatore, fuori da Subingresso.it. Candidatura, eventuale prenotazione e assegnazione del posto sono passaggi distinti: attendi la conferma del responsabile.</dd><dt>Costi e servizi</dt><dd>${esc(event.pricing?.label || 'Consulta i costi documentati qui sotto, se presenti.')} Acqua, elettricità, potenza, attrezzature, IVA e altri servizi sono inclusi soltanto se la fonte lo dichiara; altrimenti chiedi conferma.</dd></dl>`);
}
function territoryLinks() {
    return section('Cerca per territorio', '<p>Prime raccolte regionali con documentazione sufficiente. Le altre zone restano consultabili nel calendario e nell’elenco.</p><ul>' + territories.map(area => `<li>${link('/fiere/'+area.slug, 'Fiere e mercatini in '+area.name)}</li>`).join('') + '</ul>');
}
function territory(area, page) {
    const all = events.filter(event => event.region === area.name && isIndexable(event));
    const sorted = calendar.sortEvents(all, today());
    const pages = Math.ceil(all.length / 60);
    if (!Number.isInteger(page) || page < 1 || page > pages) return null;
    const pagePath = n => '/fiere/'+area.slug+(n > 1 ? '?pagina='+n : '');
    const provinces = [...new Set(all.map(e => e.province))].sort((a,b)=>a.localeCompare(b,'it'));
    const rows = sorted.slice((page-1)*60,page*60).map(event => `<li><h3>${link(fairPath(event),event.name)}</h3><p>${esc(event.city)} (${esc(event.province)}) · ${esc(calendar.CATEGORIES[event.category] || 'Fiera')}</p><p>${esc(dateSummary(event))}</p><p>${esc(event.sectors)}.</p>${event.summary ? `<p>${esc(event.summary)}</p>` : ''}<p class="muted">Fonte verificata il ${esc(event.source.checkedAt)} · ${esc(calendar.deadlineStatus(event.participation || {}) || 'Apertura candidature da verificare nella scheda e nella fonte.')}</p></li>`).join('');
    const body = `<nav aria-label="Percorso">${link('/fiere','Fiere')} / ${esc(area.name)}</nav><h1>Fiere e mercatini in ${esc(area.name)}</h1><p>${esc(area.intro)}</p>${area.source ? '<p>'+link(area.source,area.label+' ↗',true)+'</p>' : ''}<p>${all.length} schede documentate in ${provinces.length} province. La raccolta non è un censimento completo; non certifica posti disponibili. Le date passate restano come riferimento e non vengono proiettate sull’anno successivo.</p>${section('Province nella raccolta', '<details><summary>Apri le province documentate</summary><ul>'+provinces.map(province=>`<li>${link('/fiere?provincia='+encodeURIComponent(province),province+' · '+all.filter(e=>e.province===province).length+' schede documentate; apri la mappa')}</li>`).join('')+'</ul></details>')}<h2>Edizioni e periodi documentati</h2><p>Prima le edizioni non concluse; seguono periodi abituali e riferimenti passati. Apri la scheda per requisiti, costi, fonti e candidatura.</p><ol class="territory-fairs" start="${(page-1)*60+1}">${rows}</ol><nav aria-label="Pagine della regione">${page>1 ? link(pagePath(page-1),'← Precedente') : ''}<span>Pagina ${page} di ${pages}</span>${page<pages ? link(pagePath(page+1),'Successiva →') : ''}</nav>${section('Dalla scelta alla domanda', '<p>Controlla data, prodotti e operatore ammesso. Leggi avviso, scadenza, costi e servizi; presenta poi la domanda nel canale ufficiale esterno. La fonte può richiedere una propria autenticazione. Salva la fiera dalla scheda e imposta un promemoria per ricontrollare: non equivale a prenotare un banco.</p>')}${territoryLinks()}`;
    return shell(`Fiere e mercatini in ${area.name}${page>1 ? ' — pagina '+page : ''}`,`Fiere documentate in ${area.name}: date pubblicate o periodi abituali, prodotti, fonti e procedure per partecipare con il banco.`,pagePath(page),body);
}
function listing(page) {
    const sorted = [...events].sort((a,b) => a.name.localeCompare(b.name,'it') || a.id.localeCompare(b.id));
    const pages = Math.ceil(sorted.length / 100);
    if (!Number.isInteger(page) || page < 1 || page > pages) return null;
    const pagePath = n => '/fiere/elenco' + (n > 1 ? '?pagina=' + n : '');
    const items = sorted.slice((page-1)*100,page*100).map(event => `<li>${link(fairPath(event),event.name)}<span class="muted"> · ${esc(event.city)} (${esc(event.province)})</span></li>`).join('');
    return shell(`Elenco fiere e mercatini in Italia — pagina ${page}`, 'Sfoglia le schede delle fiere: date disponibili, fonti e informazioni per partecipare. Archivio in aggiornamento.',pagePath(page),`<h1>Fiere e mercatini in Italia</h1><p>${link('/fiere','Cerca sulla mappa per mese e zona →')}</p><p>L’archivio viene completato progressivamente. Le informazioni mancanti sono indicate nelle singole schede.</p>${page === 1 ? territoryLinks() : ''}<ul>${items}</ul><nav aria-label="Pagine dell’elenco">${page > 1 ? link(pagePath(page-1),'← Precedente') : ''} <span>Pagina ${page} di ${pages}</span> ${page < pages ? link(pagePath(page+1),'Successiva →') : ''}</nav>`);
}
module.exports = function handler(req,res) {
    const slug = typeof req.query?.slug === 'string' ? req.query.slug : '';
    const area = territories.find(t => t.slug === slug);
    const html = slug === 'elenco' ? listing(Number(req.query.pagina || 1)) : area ? territory(area, Number(req.query.pagina || 1)) : byId.has(slug) ? detail(byId.get(slug)) : null;
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(html ? 200 : 404).send(html || shell('Fiera non trovata','La scheda richiesta non è disponibile.','/fiere', '<h1>Fiera non trovata</h1><p>' + link('/fiere','Torna al calendario fiere') + '</p>',false));
};
