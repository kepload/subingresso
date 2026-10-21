const { events, byId, fairPath, isIndexable } = require('./_fiere');
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
    const destination = '/fiere?fiera=' + encodeURIComponent(event.id) + '&fonte=' + encodeURIComponent(url);
    return `<a href="${esc(destination)}" data-fiere-id="${esc(event.id)}" data-fiere-source="${esc(url)}" rel="nofollow">${esc(label)}</a>`;
}
const sourceLinks = event => (url, label, external = false) => external ? sourceLink(event, url, label) : link(url, label);
function accessBanner() {
    return `<section class="fiere-access" data-fiere-guest hidden aria-labelledby="fiere-access-title"><div class="fiere-access-copy"><span class="fiere-access-kicker">Gratis per gli ambulanti</span><h2 id="fiere-access-title">Trova le fiere per il tuo banco</h2><p>Registrati gratis per aprire i siti di Comuni e organizzatori e vedere come partecipare.</p><ul><li>Salva le fiere che ti interessano</li><li>Scegli un promemoria via email</li><li>Attiva dal profilo gli avvisi per bandi e posteggi</li></ul></div><div class="fiere-access-actions"><a href="/fiere?iscrizione=1" class="fiere-access-register" data-fiere-register>Registrati gratis</a><a href="/fiere?iscrizione=1" class="fiere-access-login" data-fiere-login>Hai già un account? Accedi</a><small>Nessun abbonamento.</small></div></section>`;
}
function withAccess(html) {
    return html.replace('<link rel="stylesheet" href="/css/fiera.css?v=3">', '<link rel="stylesheet" href="/css/tailwind.css?v=4"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"><link rel="stylesheet" href="/css/fiera.css?v=3"><link rel="stylesheet" href="/css/fiere-access.css?v=1"><link rel="stylesheet" href="/css/saved-fairs.css?v=3">')
        .replace('<body>', '<body class="fiera-page">')
        .replace('</body>', '<noscript><p class="notice">Per registrarti o accedere e aprire le fonti, abilita JavaScript nel browser. Puoi leggere le informazioni della fiera anche senza JavaScript.</p></noscript><script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script><script src="/js/supabase-config.js?v=3"></script><script src="/js/page-view-tracker.js?v=4"></script><script src="/js/image-urls.js?v=1"></script><script src="/js/data.js?v=24"></script><script src="/js/auth.js?v=22"></script><script src="/js/fiere-access.js?v=3"></script><script type="module" src="/js/saved-fairs.js?v=3"></script></body>');
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
    return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} — Subingresso.it</title><meta name="description" content="${esc(description)}"><meta name="robots" content="${indexable ? 'index,follow' : 'noindex,follow'}"><link rel="canonical" href="${SITE}${esc(path)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${SITE}${esc(path)}"><meta property="og:type" content="website"><link rel="stylesheet" href="/css/fiera.css?v=3"><link rel="stylesheet" href="/css/design-system.css?v=15"><script src="/js/admin-theme.js?v=2" defer></script></head><body><header><a href="/" aria-label="Subingresso.it, pagina iniziale" class="brand site-brand flex items-center flex-shrink-0"><span class="site-wordmark">Subingresso<span>.it</span></span></a><nav aria-label="Navigazione principale">${link('/fiere','Calendario fiere')} ${link('/annunci','Posteggi in vendita')}</nav></header><main>${body}</main><footer>${link('/fiere','Calendario e mappa')} · ${link('/fiere/elenco','Tutte le fiere')} · ${link('/contatti','Contatti')} · ${link('/privacy','Privacy')}</footer></body></html>`;
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
    const body = `<nav aria-label="Percorso">${link('/fiere','Fiere')} / ${link('/fiere/elenco','Elenco fiere')} / ${esc(event.city)}</nav><p class="eyebrow">${esc(calendar.CATEGORIES[event.category] || 'Fiera')} · ${esc(event.region)}</p><h1>${esc(event.name)}</h1><p class="location">${esc(event.city)} · ${esc(event.province)}</p>${attendanceSection(event)}${event.summary ? `<p>${esc(event.summary)}</p>` : ''}${!isIndexable(event) ? '<p class="notice">Scheda in aggiornamento: le informazioni per partecipare non sono ancora complete. Consulta la fonte o contatta l’organizzatore.</p>' : ''}${section('Date delle edizioni', editions ? `<ul class="editions">${editions}</ul>` : '<p>La prossima edizione non ha ancora una data pubblicata in questa scheda. Consulta la fonte o contatta l’organizzatore.</p>')}<p>Mesi di riferimento: ${esc((event.months || []).map(m => calendar.MONTHS[m-1]).join(', '))}. Non sostituiscono le date confermate.</p>${event.frequencyNote ? `<p>${esc(event.frequencyNote)}</p>` : ''}${facts ? `<dl>${facts}</dl>` : ''}${section('Per partecipare con il tuo banco', `<p>${esc(participation.note || 'Condizioni da verificare con l’organizzatore.')}</p>${calendar.deadlineStatus(participation) ? `<p class="notice">${esc(calendar.deadlineStatus(participation))}</p>` : ''}${link(participation.url,'Consulta la procedura di partecipazione ↗',true)}${contacts}`)}${section('Costi per partecipare', `<p>${esc(costs || 'Importo non verificato per questa fiera. Chiedi all’organizzatore la quota del banco, il canone e gli eventuali servizi aggiuntivi.')}</p>${event.pricing ? `<p class="muted">${esc(event.pricing.period ? 'Tariffe ' + event.pricing.period : 'Anno tariffario da verificare')}${event.pricing.checkedAt ? ' · fonte consultata il ' + esc(event.pricing.checkedAt) : ''}</p>` : ''}${link(event.pricing?.sourceUrl || (costs ? participation.url : ''),'Fonte delle tariffe ↗',true)}`)}${section('Fonti e aggiornamenti', `<p>${link(event.source?.url,'Consulta la fonte ↗',true)}</p>${event.source?.checkedAt ? `<p class="muted">Fonte consultata il ${esc(event.source.checkedAt)}. Verifica eventuali aggiornamenti prima di organizzare la partecipazione.</p>` : '<p class="muted">Date e condizioni dell’edizione da verificare presso la fonte.</p>'}${link(event.calendarSource?.url,event.calendarSource?.label || 'Calendario di riferimento ↗',true)}`)}<p>${link('/fiere?provincia=' + encodeURIComponent(event.province),'Vedi altre fiere in zona sulla mappa →')}</p>${nearby.length ? section('Altre fiere nella provincia', '<ul>' + nearby.map(other => `<li>${link(fairPath(other),other.name + ' · ' + other.city)}</li>`).join('') + '</ul>') : ''}<p>${link('/annunci?regione=' + encodeURIComponent(event.region),'Cerca posteggi in questa regione →')}</p>`;
    const research = calendar.articleResearch(event);
    const researchHTML = research ? section('Articoli verificati', `<p>${esc(research.theme)}. Fonti consultate il ${esc(research.checkedAt)}.</p><ul>${Object.entries(research.articles).filter(([,item]) => item.role !== 'unknown').map(([key,item]) => `<li>${esc(calendar.ARTICLE_TYPES[key].label)}${item.condition ? ' — ' + esc(item.condition) : ''}</li>`).join('')}</ul>${research.sources.map(source => '<p>' + link(source.url,source.label,true) + '</p>').join('')}`) : '';
    const actions = '<div class="sf-fair-actions"><button type="button" class="saved-fair-button" aria-label="Salva la fiera" title="Salva" data-save-fair data-fair-kind="catalog" data-fair-id="' + esc(event.id) + '"><i class="far fa-bookmark" aria-hidden="true"></i></button><button type="button" class="saved-fair-button" aria-label="Avvisami" title="Avvisami" data-remind-fair data-fair-kind="catalog" data-fair-id="' + esc(event.id) + '" aria-haspopup="dialog"><i class="far fa-bell" aria-hidden="true"></i></button></div>';
    return withAccess(shell(title, description, fairPath(event), body.replace('</h1>', '</h1>' + actions + accessBanner()) + researchHTML, isIndexable(event)));
}
function listing(page) {
    const sorted = [...events].sort((a,b) => a.name.localeCompare(b.name,'it') || a.id.localeCompare(b.id));
    const pages = Math.ceil(sorted.length / 100);
    if (!Number.isInteger(page) || page < 1 || page > pages) return null;
    const pagePath = n => '/fiere/elenco' + (n > 1 ? '?pagina=' + n : '');
    const items = sorted.slice((page-1)*100,page*100).map(event => `<li>${link(fairPath(event),event.name)}<span class="muted"> · ${esc(event.city)} (${esc(event.province)})</span></li>`).join('');
    return shell(`Elenco fiere e mercatini in Italia — pagina ${page}`, 'Sfoglia le schede delle fiere: date disponibili, fonti e informazioni per partecipare. Archivio in aggiornamento.',pagePath(page),`<h1>Fiere e mercatini in Italia</h1><p>${link('/fiere','Cerca sulla mappa per mese e zona →')}</p><p>L’archivio viene completato progressivamente. Le informazioni mancanti sono indicate nelle singole schede.</p><ul>${items}</ul><nav aria-label="Pagine dell’elenco">${page > 1 ? link(pagePath(page-1),'← Precedente') : ''} <span>Pagina ${page} di ${pages}</span> ${page < pages ? link(pagePath(page+1),'Successiva →') : ''}</nav>`);
}
module.exports = function handler(req,res) {
    const slug = typeof req.query?.slug === 'string' ? req.query.slug : '';
    const html = slug === 'elenco' ? listing(Number(req.query.pagina || 1)) : byId.has(slug) ? detail(byId.get(slug)) : null;
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','public, s-maxage=3600, stale-while-revalidate=86400');
    res.status(html ? 200 : 404).send(html || shell('Fiera non trovata','La scheda richiesta non è disponibile.','/fiere', '<h1>Fiera non trovata</h1><p>' + link('/fiere','Torna al calendario fiere') + '</p>',false));
};
