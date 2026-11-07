(function (global) {
    'use strict';
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const safeURL = value => /^https:\/\//i.test(value || '') ? esc(value) : '';
    function calendarPath(event) {
        return '/fiere?provincia=' + encodeURIComponent(event.province) + '&mesi=' + event.months.join(',');
    }
    function render(event, calendar, reviews = '', landing = false) {
        const source = (url, label, id = '') => {
            if (!safeURL(url)) return '';
            const parsed = new URL(url), internal = parsed.origin === 'https://subingresso.it';
            const href = internal ? parsed.pathname + parsed.search + parsed.hash : '/fiere?fiera=' + encodeURIComponent(event.id) + '&fonte=' + encodeURIComponent(url);
            return `<a${id ? ` id="${id}"` : ''} href="${esc(href)}"${internal ? '' : ` data-fiere-id="${esc(event.id)}" data-fiere-source="${safeURL(url)}"`}>${esc(label)}</a>`;
        };
        const participation = event.participation || {};
        const labels = { public: 'Fiera su area pubblica', selected: 'Ammissione tramite organizzatore', exhibitors: 'Partecipazione come espositore' };
        const edition = calendar.selectEdition(event, new Intl.DateTimeFormat('en-CA', {timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()));
        const when = edition ? (!edition.start && edition.label ? edition.label : calendar.editionLabel(edition)) : event.months.map(m => calendar.MONTHS[m - 1]).join(', ');
        const status = edition ? calendar.editionStatus(edition) : 'Periodo abituale. Date da confermare.';
        const deadline = calendar.deadlineStatus(participation);
        const kind = event.managedEventId ? 'organizer' : 'catalog', id = event.managedEventId || event.id;
        const heading = landing ? 'h1' : 'h2';
        const summary = (event.summary || '').trim();
        let note = (participation.note || '').trim();
        // Descriptions repeated at the start of an application note are shown once.
        if (summary && note.startsWith(summary)) note = note.slice(summary.length).trim();
        const facts = [
            ['Luogo', event.venue], ['Orari', event.hours], ['Organizzatore', event.organizer],
            ['Articoli', calendar.articleTypes(event).map(key => calendar.ARTICLE_TYPES[key].label).join(' · ')],
            ['Posteggi', event.stallCount ? event.stallCount + ' · ' + (event.stallCountNote || 'organico della manifestazione, non posti liberi') : '']
        ].filter(([, value]) => value).map(([label, value]) => `<dt>${esc(label)}</dt><dd>${esc(value)}</dd>`).join('');
        const contacts = Object.entries(event.contacts || {}).filter(([key, value]) => ['phone','email','pec'].includes(key) && value).map(([key, value]) => `<p>${{phone:'Telefono',email:'Email',pec:'PEC'}[key]}: <a href="${esc(key === 'phone' ? 'tel:' + value.replace(/[^\d+]/g,'') : 'mailto:' + value)}">${esc(value)}</a></p>`).join('');
        const otherEditions = (event.editions || []).filter(item => item !== edition);
        const editionHTML = otherEditions.map(item => `<p><strong>${esc(calendar.editionLabel(item))}</strong>${calendar.editionStatus(item) ? ' · ' + esc(calendar.editionStatus(item)) : ''}</p>`).join('');
        const research = calendar.articleResearch(event);
        const researchHTML = research ? `<section class="fiere-detail-info"><h3>Articoli documentati</h3><ul>${Object.entries(research.articles).filter(([, item]) => item.role !== 'unknown').map(([key, item]) => `<li>${esc(calendar.ARTICLE_TYPES[key].label)}${item.condition ? ' — ' + esc(item.condition) : ''}</li>`).join('')}</ul></section>` : '';
        const attendance = calendar.attendanceInfo(event);
        const attendanceHTML = attendance ? `<section id="detail-attendance" class="fiere-detail-info"><h3>Affluenza</h3><p>${esc(attendance.total)} · edizione ${esc(attendance.year)}</p><p class="fiere-detail-meta">${esc(attendance.status)}</p></section>` : '';
        const applyURL = participation.url || event.source?.url;
        // Extra documentary links never repeat the main source action or one another.
        const documents = new Map();
        function addDocument(url, label, id = '') {
            if (safeURL(url) && url !== applyURL && !documents.has(url)) documents.set(url, { label, id });
        }
        addDocument(event.source?.url, event.source?.label || 'Fonte della fiera', 'detail-source');
        addDocument(event.pricing?.sourceUrl, 'Fonte delle tariffe', 'detail-costs-source');
        addDocument(event.calendarSource?.url, event.calendarSource?.label || 'Calendario di riferimento');
        for (const item of event.editions || []) addDocument(item.sourceUrl, 'Date · ' + calendar.editionLabel(item));
        if (attendance) {
            addDocument(attendance.record.source.url, attendance.record.source.label);
            for (const item of attendance.record.additionalSources || []) addDocument(item.url, item.label);
        }
        for (const item of research?.sources || []) addDocument(item.url, item.label);
        const documentaryNotes = [
            attendance ? `<p>${esc(attendance.record.note)}</p><p>${esc(attendance.comparison)}</p><p>Periodo: ${esc(attendance.record.start)} – ${esc(attendance.record.end)}. Fonte consultata il ${esc(attendance.record.checkedAt)}.</p><p>${esc(calendar.attendanceCriteria())}</p>` : '',
            research ? `<p>${esc(research.theme)}. Fonti consultate il ${esc(research.checkedAt)}.</p>` : ''
        ].join('');
        const documentation = documents.size || documentaryNotes ? `<details class="fiere-detail-sources"><summary>Fonti</summary>${[...documents].map(([url, item]) => '<p>' + source(url, item.label + ' ↗', item.id) + '</p>').join('')}${documentaryNotes}</details>` : '';
        const count = event.managedAvailability;
        return `<div class="fiere-dialog-top"><span id="detail-category" class="fiere-detail-category">${esc(calendar.CATEGORIES[event.category] || 'Fiera')}</span><button id="close-detail" type="button" aria-label="Chiudi la scheda" autofocus><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></div>
        <${heading} id="detail-title">${esc(event.name)}</${heading}><p id="detail-location">${esc(event.city)} · ${esc(event.province)}</p>
        ${count ? `<p id="detail-availability" class="fiere-availability" data-sold-out="${count.available === 0}">${esc(count.available === 0 ? 'Sold out · Posti esauriti' : count.available + ' posti disponibili su ' + count.capacity)}</p>` : ''}
        <div class="fiere-detail-overview"><div><span>Quando</span><strong>${esc(when)}</strong>${status ? `<p>${esc(status)}</p>` : ''}</div><div><span>Per il tuo banco</span><p>${esc(event.sectors || 'Prodotti ammessi da verificare con l’organizzatore.')}</p></div></div>
        ${summary || facts || event.frequencyNote ? `<section class="fiere-detail-about" aria-label="Informazioni sulla fiera">${summary ? `<p id="detail-description">${esc(summary)}</p>` : ''}${facts ? `<dl id="detail-facts" class="fiere-detail-facts">${facts}</dl>` : ''}${event.frequencyNote ? `<p id="detail-frequency">${esc(event.frequencyNote)}</p>` : ''}</section>` : ''}
        <a id="detail-explore" class="fiere-primary" href="${esc(calendarPath(event))}">Cerca altre fiere in zona →</a>
        <div class="fiere-detail-tools"><div class="sf-fair-actions"><button id="detail-save-fair" type="button" class="saved-fair-button" aria-label="Salva la fiera" title="Salva" data-save-fair data-fair-kind="${kind}" data-fair-id="${esc(id)}"><i class="far fa-bookmark" aria-hidden="true"></i></button><button type="button" class="saved-fair-button" aria-label="Avvisami" title="Avvisami" data-remind-fair data-fair-kind="${kind}" data-fair-id="${esc(id)}" aria-haspopup="dialog"><i class="far fa-bell" aria-hidden="true"></i></button></div><p class="fiere-access-note fiere-detail-account" data-fiere-guest hidden><a class="fiere-detail-register" href="/fiere?iscrizione=1" data-fiere-register>Registrati gratis</a> per salvare le fiere.</p></div>
        <section class="fiere-detail-info"><h3>Partecipazione</h3>${labels[participation.type] ? `<p id="detail-participation-label">${esc(labels[participation.type])}</p>` : ''}<p id="detail-participation-note">${esc(note || (summary ? '' : 'Modalità da verificare con l’organizzatore.'))}</p>${deadline ? `<p id="detail-deadline" class="fiere-detail-deadline">${esc(deadline)}</p>` : ''}${!event.managedEventId ? '<p class="fiere-detail-meta">Il posto è confermato solo dopo l’assegnazione.</p>' : ''}${contacts ? `<div id="detail-contacts" class="fiere-contacts">${contacts}</div>` : ''}</section>
        <section class="fiere-detail-info"><h3>Costi</h3><p id="detail-costs">${esc(event.pricing?.details || participation.costs || 'Da verificare con l’organizzatore.')}</p>${event.pricing ? `<p id="detail-costs-meta" class="fiere-detail-meta">${esc((event.pricing.period ? 'Tariffe ' + event.pricing.period : 'Anno tariffario da verificare') + (event.pricing.checkedAt ? ' · fonte consultata il ' + event.pricing.checkedAt : ''))}</p>` : ''}</section>
        ${editionHTML ? `<section class="fiere-detail-info"><h3>Altre edizioni</h3><div id="detail-editions">${editionHTML}</div></section>` : ''}
        ${researchHTML}${attendanceHTML}
        ${reviews || '<section id="detail-reviews" class="fr" aria-label="Recensioni degli ambulanti"></section>'}
        <div class="fiere-detail-footer">${source(applyURL, event.managedEventId ? 'Pagina dell’organizzatore →' : 'Consulta la fonte ↗', 'detail-apply')}<span class="fiere-detail-source-access" data-fiere-guest hidden>Accesso richiesto</span><p id="detail-source-label">${esc((event.source?.label || 'Fonte') + (event.source?.checkedAt ? ' · consultata il ' + event.source.checkedAt : ' · date da verificare'))}</p>${documentation}</div>`;
    }
    const api = { render, calendarPath };
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
    global.FairDetail = api;
})(typeof window !== 'undefined' ? window : globalThis);
