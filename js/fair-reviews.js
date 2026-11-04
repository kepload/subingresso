// One contextual component for calendar details and standalone fair/event pages.
(function (global) {
    'use strict';
    const sectors = { alimentare: 'Alimentare', abbigliamento: 'Abbigliamento e accessori', artigianato: 'Artigianato e opere proprie', casa: 'Casa e altri prodotti', altro: 'Altro' };
    const recommendations = { yes: 'Sì, la consiglio', maybe: 'Dipende dal banco', no: 'Non la consiglio' };
    const criteria = { organization: 'Organizzazione', turnout: 'Affluenza al banco', value: 'Rapporto costi e risultati' };
    const labels = ['La tua partecipazione', 'Come ti sei trovato?', 'La tua esperienza', 'Rivedi e pubblica'];
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    function sectionHTML(kind, id, name, city) {
        return `<section id="fair-reviews" class="fr" data-fair-reviews data-fair-kind="${esc(kind)}" data-fair-id="${esc(id)}" data-fair-name="${esc(name)}" data-fair-city="${esc(city)}"><h2>Recensioni degli ambulanti</h2><p>Hai lavorato a questa fiera? Racconta com’è andata con il tuo banco.</p><noscript>Abilita JavaScript per leggere e scrivere le recensioni.</noscript></section>`;
    }
    if (typeof module !== 'undefined' && module.exports) module.exports = { sectionHTML };
    if (!global.document) return;
    const instances = new Map();
    let identity = null, identityReady = false, authVersion = 0;
    const currentMonth = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit' }).format(new Date());
    const monthLabel = value => /^20\d\d-\d\d-01$/.test(value || '') ? new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value)) : '';
    const emptyDraft = () => ({ step: 1, visit_month: '', sector: '', rating: null, organization: null, turnout: null, value: null, body: '', recommend: '', confirmed: false });
    const key = s => 'fair_review_v1:' + (s.owner || 'guest') + ':' + s.kind + ':' + s.id;
    function restore(s) {
        try {
            const draft = JSON.parse(localStorage.getItem(key(s)));
            if (!draft || draft.version !== 1) return null;
            if (Date.now() - draft.savedAt > 30 * 86400000) { localStorage.removeItem(key(s)); return null; }
            return { ...emptyDraft(), ...draft.data, step: Math.min(4, Math.max(1, Number(draft.data.step) || 1)), confirmed: false };
        } catch (_) { return null; }
    }
    function save(s) {
        if (!s.editing || s.owner !== identity) return;
        try {
            localStorage.setItem(key(s), JSON.stringify({ version: 1, savedAt: Date.now(), data: { ...s.draft, confirmed: false } }));
            s.storageError = false;
        } catch (_) { s.storageError = true; }
        const status = s.root.querySelector('[data-fr-saved]');
        if (status) status.textContent = s.storageError ? 'La bozza non può essere salvata in questo browser. Tieni aperta questa pagina.' : 'Bozza salvata su questo dispositivo per 30 giorni.';
    }
    function message(s, text, success = false) {
        const area = s.root.querySelector('[data-fr-error]');
        if (area) { area.textContent = text; area.hidden = !text; area.classList.toggle('fr-error', !success); area.classList.toggle('fr-success', success); area.setAttribute('role', success ? 'status' : 'alert'); }
    }
    async function request(s, offset = 0) {
        const response = await fetch('/api/saved-fairs?reviews=1&kind=' + encodeURIComponent(s.kind) + '&id=' + encodeURIComponent(s.id) + '&offset=' + offset, { signal: AbortSignal.timeout(12000) });
        const data = await response.json();
        if (!response.ok) throw Error(data.error || 'Impossibile caricare le recensioni. Riprova.');
        return data;
    }
    function stars(rating) {
        return `<span class="fr-stars" aria-label="${esc(rating)} su 5">${[1,2,3,4,5].map(i => `<i class="${i <= Math.round(rating) ? 'fas' : 'far'} fa-star" aria-hidden="true"></i>`).join('')}</span>`;
    }
    function reviewsHTML(s) {
        if (s.loadError) return `<p class="fr-error" role="status">${esc(s.loadError)}</p><button type="button" class="fr-button" data-fr-action="retry">Riprova a caricare</button>`;
        if (!s.result) return '<p role="status">Caricamento delle recensioni…</p>';
        const result = s.result;
        if (!result.count) return '<div class="fr-empty"><p><strong>Il tuo banco, il primo punto di vista.</strong></p><p>Questa fiera non ha ancora recensioni. La tua esperienza può aiutare altri ambulanti a scegliere.</p></div>';
        return `<div class="fr-summary"><strong>${esc(result.average)}<small> / 5</small></strong><div>${stars(result.average)}<p>${esc(result.count)} ${result.count === 1 ? 'recensione' : 'recensioni'} di ambulanti</p></div></div><dl class="fr-criteria">${Object.entries(criteria).filter(([k]) => result[k] != null).map(([k,v]) => `<div><dt>${esc(v)}</dt><dd>${esc(result[k])} / 5</dd></div>`).join('')}</dl><div class="fr-review-list">${result.reviews.map(review => `<article class="fr-review"><div class="fr-review-heading"><strong>${esc(review.author)}</strong>${stars(review.rating)}</div><p class="fr-meta">${esc(monthLabel(review.visit_month))} · ${esc(sectors[review.sector] || 'Altro')}</p><p class="fr-review-body">${esc(review.body)}</p><p class="fr-recommend">${esc(recommendations[review.recommend] || '')}</p><a class="fr-report" href="mailto:info@subingresso.it?subject=${encodeURIComponent('Segnalazione recensione '+review.id)}&amp;body=${encodeURIComponent('Fiera: '+s.name+'\nRecensione: '+review.id+'\nSegnalazione: ')}">Segnala questa recensione</a></article>`).join('')}</div>${result.reviews.length < result.count && result.reviews.length < 10000 ? '<button type="button" class="fr-button" data-fr-action="more">Mostra altre recensioni</button>' : ''}`;
    }
    function ratingField(s, field, label, required = false) {
        return `<fieldset class="fr-rating"><legend>${esc(label)}${required ? ' *' : ''}</legend><div class="fr-rating-options">${[1,2,3,4,5].map(i => `<label title="${i} su 5"><input type="radio" name="${field}" value="${i}"${s.draft[field] === i ? ' checked' : ''}><span><i class="${s.draft[field] >= i ? 'fas' : 'far'} fa-star" aria-hidden="true"></i><span class="fr-sr">${i} su 5</span></span></label>`).join('')}${!required ? `<label class="fr-not-rated"><input type="radio" name="${field}" value=""${s.draft[field] == null ? ' checked' : ''}><span>Non valutabile</span></label>` : ''}</div></fieldset>`;
    }
    function formHTML(s) {
        const d = s.draft;
        let content;
        if (d.step === 1) content = `<p>Parla di un’edizione a cui hai partecipato come ambulante.</p><label class="fr-field">Quando hai partecipato? *<input type="month" name="visit_month" min="2000-01" max="${currentMonth()}" value="${esc(d.visit_month.slice(0,7))}" required></label><label class="fr-field">Settore del tuo banco *<select name="sector" required><option value="">Scegli il settore</option>${Object.entries(sectors).map(([k,v]) => `<option value="${k}"${d.sector === k ? ' selected' : ''}>${esc(v)}</option>`).join('')}</select></label><p class="fr-help">Bastano pochi passaggi. Ti chiederemo di registrarti o accedere solo alla fine.</p>`;
        if (d.step === 2) content = `<p>Valuta la fiera dal punto di vista del tuo banco.</p>${ratingField(s,'rating','Esperienza complessiva',true)}<p class="fr-help">1 = molto negativa · 5 = molto positiva. Le altre valutazioni sono facoltative.</p>${Object.entries(criteria).map(([k,v]) => ratingField(s,k,v)).join('')}`;
        if (d.step === 3) content = `<label class="fr-field">Com’è andata con il tuo banco? *<textarea name="body" rows="6" minlength="40" maxlength="2000" placeholder="Come ti sei trovato con l’organizzazione? Che tipo di pubblico hai incontrato? Torneresti con il tuo banco?" required aria-describedby="fr-body-help">${esc(d.body)}</textarea></label><p class="fr-help" id="fr-body-help"><span data-fr-counter>${[...d.body].length}</span> / 2.000 caratteri · minimo 40. Racconta fatti ed esperienza personale, senza recapiti o dati di altre persone.</p><fieldset class="fr-recommendations"><legend>La consiglieresti ad altri ambulanti? *</legend>${Object.entries(recommendations).map(([k,v]) => `<label><input type="radio" name="recommend" value="${k}"${d.recommend === k ? ' checked' : ''}> ${esc(v)}</label>`).join('')}</fieldset>`;
        if (d.step === 4) content = `<div class="fr-preview"><div class="fr-review-heading"><strong>${esc(monthLabel(d.visit_month))} · ${esc(sectors[d.sector])}</strong>${stars(d.rating)}</div><dl class="fr-criteria">${Object.entries(criteria).filter(([k]) => d[k] != null).map(([k,v]) => `<div><dt>${esc(v)}</dt><dd>${d[k]} / 5</dd></div>`).join('')}</dl><p class="fr-review-body">${esc(d.body)}</p><strong>${esc(recommendations[d.recommend])}</strong></div><button type="button" class="fr-link" data-fr-action="edit">Modifica la recensione</button><label class="fr-confirm"><input type="checkbox" name="confirmed"${d.confirmed ? ' checked' : ''}>Confermo di aver partecipato con il mio banco e che la recensione racconta la mia esperienza.</label><p class="fr-help">La recensione sarà pubblica con il tuo nome di battesimo, mese di partecipazione e settore. Email e telefono restano privati.</p>${!identity ? '<div class="fr-auth-note"><strong>La tua recensione è pronta.</strong><p>Registrati gratis o accedi per pubblicarla. Ritroverai qui tutto quello che hai scritto.</p></div>' : '<p class="fr-help">Puoi pubblicare una recensione per ogni edizione annuale.</p>'}`;
        return `<form class="fr-form" novalidate><div class="fr-progress-meta"><span>Passo ${d.step} di 4</span><span>${Math.round(d.step / 4 * 100)}%</span></div><div class="fr-progress" role="progressbar" aria-label="Avanzamento recensione" aria-valuemin="0" aria-valuemax="4" aria-valuenow="${d.step}" aria-valuetext="Passo ${d.step} di 4"><span style="width:${d.step / 4 * 100}%"></span></div><h3 tabindex="-1" data-fr-step-title>${labels[d.step - 1]}</h3><p class="fr-context">${esc(s.name)} · ${esc(s.city)}</p>${content}<p class="fr-error" data-fr-error role="alert" hidden></p><div class="fr-actions">${d.step > 1 ? '<button type="button" class="fr-button" data-fr-action="back">Indietro</button>' : ''}<button class="fr-button fr-primary" type="submit">${d.step < 4 ? 'Continua' : identity ? 'Pubblica la recensione' : 'Registrati e pubblica'}</button></div><button type="button" class="fr-link" data-fr-action="close">Salva e torna alle recensioni</button><p class="fr-help" data-fr-saved>${s.storageError ? 'La bozza non può essere salvata in questo browser. Tieni aperta questa pagina.' : 'Bozza salvata su questo dispositivo per 30 giorni.'}</p></form>`;
    }
    function render(s, focus = false) {
        if (instances.get(s.root) !== s) return;
        const saved = restore(s);
        s.root.innerHTML = `<div class="fr-heading"><h2>Recensioni degli ambulanti</h2>${!s.editing ? `<button type="button" class="fr-button fr-primary" data-fr-action="write"${identityReady ? '' : ' disabled'}>${saved ? 'Riprendi la recensione' : 'Scrivi una recensione'}</button>` : ''}</div>${s.editing ? formHTML(s) : `<p class="fr-intro">Esperienze di chi ha partecipato con il proprio banco.</p>${s.success ? '<p class="fr-success" role="status">Recensione pubblicata. Grazie per aver condiviso la tua esperienza!</p>' : ''}${reviewsHTML(s)}<p class="fr-help">Esperienze personali degli ambulanti, non verifiche di Subingresso.it. Date, costi e condizioni ufficiali restano nella scheda della fiera.</p>`}`;
        if (focus) s.root.querySelector('[data-fr-step-title], [data-fr-action="write"]')?.focus({ preventScroll: true });
    }
    async function load(s, more = false) {
        const sequence = ++s.sequence;
        const button = s.root.querySelector('[data-fr-action="more"]');
        if (button) { button.disabled = true; button.textContent = 'Caricamento…'; }
        try {
            const result = await request(s, more ? s.result.reviews.length : 0);
            if (sequence !== s.sequence || instances.get(s.root) !== s) return;
            s.result = { ...result, reviews: more ? [...s.result.reviews, ...result.reviews.filter(row => !s.result.reviews.some(old => old.id === row.id))] : result.reviews }; s.loadError = '';
        } catch (error) {
            if (sequence !== s.sequence || instances.get(s.root) !== s) return;
            if (more) { if (button) { button.disabled = false; button.textContent = 'Riprova a caricare altre recensioni'; } return; }
            s.loadError = error.message;
        }
        if (!s.editing && sequence === s.sequence) render(s);
    }
    function validate(s, step) {
        const d = s.draft;
        if (step === 1 && (!/^20\d\d-(0[1-9]|1[0-2])-01$/.test(d.visit_month) || d.visit_month.slice(0,7) > currentMonth())) return 'Scegli il mese in cui hai partecipato, fino al mese attuale.';
        if (step === 1 && !sectors[d.sector]) return 'Scegli il settore del tuo banco.';
        if (step === 2 && ![1,2,3,4,5].includes(d.rating)) return 'Scegli da 1 a 5 stelle per l’esperienza complessiva.';
        if (step === 3 && ([...d.body.trim()].length < 40 || [...d.body.trim()].length > 2000)) return 'Scrivi da 40 a 2.000 caratteri sulla tua esperienza.';
        if (step === 3 && !recommendations[d.recommend]) return 'Indica se consiglieresti questa fiera.';
        if (step === 4 && !d.confirmed) return 'Conferma di aver partecipato con il tuo banco prima di pubblicare.';
        return '';
    }
    async function submit(s) {
        if (s.busy || s.owner !== identity) return;
        for (let step = 1; step <= s.draft.step; step++) {
            const error = validate(s, step);
            if (error) { s.draft.step = step; save(s); render(s, true); message(s, error); return; }
        }
        if (s.draft.step < 4) { s.draft.step++; save(s); render(s, true); return; }
        save(s);
        s.busy = true;
        const submission = s.submission = (s.submission || 0) + 1;
        const version = authVersion;
        s.root.querySelectorAll('button, input, select, textarea').forEach(el => { el.disabled = true; });
        const submitButton = s.root.querySelector('[type="submit"]');
        if (submitButton) { submitButton.textContent = 'Verifica in corso…'; submitButton.setAttribute('aria-busy', 'true'); }
        try {
            const { data, error } = await _supabase.auth.getSession();
            if (error) throw Error('Impossibile verificare l’accesso. La bozza è conservata: riprova.');
            if (version !== authVersion || instances.get(s.root) !== s) return;
            const session = data?.session;
            if (!session?.user) { authenticate(s); return; }
            if (session.user.id !== s.owner) throw Error('La sessione è cambiata. Riapri la tua recensione.');
            const response = await fetch('/api/saved-fairs?reviews=1', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token }, body: JSON.stringify({ ...s.draft, kind: s.kind, fair_id: s.id }), signal: AbortSignal.timeout(12000) });
            const result = await response.json();
            if (version !== authVersion || instances.get(s.root) !== s) return;
            if (response.status === 401) { authenticate(s); return; }
            if (!response.ok) throw Error(result.error || 'Impossibile pubblicare. Riprova.');
            try { localStorage.removeItem(key(s)); } catch (_) {}
            s.editing = false; s.draft = emptyDraft(); s.success = true;
            await load(s);
        } catch (error) {
            if (version === authVersion && instances.get(s.root) === s) { render(s); message(s, error.name === 'TimeoutError' ? 'La pubblicazione sta impiegando troppo tempo. La bozza è conservata. Riprova: non verranno create recensioni duplicate.' : error.message); }
        } finally {
            if (s.submission === submission) s.busy = false;
            if (s.submission === submission && instances.get(s.root) === s && version === authVersion) {
                s.root.querySelectorAll('button, input, select, textarea').forEach(el => { el.disabled = false; });
                const button = s.root.querySelector('[type="submit"]');
                if (button) { button.textContent = identity ? 'Pubblica la recensione' : 'Registrati e pubblica'; button.removeAttribute('aria-busy'); }
            }
        }
    }
    function authenticate(s) {
        if (!global.FiereAccess?.authenticate) throw Error('Accesso non disponibile. Ricarica la pagina: la bozza è conservata.');
        s.authIntent = true;
        global.FiereAccess.authenticate(async () => {
            const { data } = await _supabase.auth.getSession();
            reconcile(data?.session?.user?.id || null);
            if (instances.get(s.root) === s && s.owner === identity) {
                s.authIntent = false; render(s, true);
                message(s, 'Accesso completato. Controlla la recensione e premi “Pubblica la recensione”.', true);
            }
        }, s.root.querySelector('[type="submit"]'), 'La tua recensione è pronta. Registrati gratis o accedi per pubblicarla: tutti i passaggi compilati sono conservati.');
        const overlay = document.getElementById('authOverlay');
        if (overlay) {
            const observer = new MutationObserver(() => {
                if (!overlay.classList.contains('hidden')) return;
                observer.disconnect();
                _supabase.auth.getSession().then(({ data }) => { if (!data?.session) s.authIntent = false; }).catch(() => { s.authIntent = false; });
            });
            observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
        }
    }
    function reconcile(next) {
        identityReady = true;
        const changed = next !== identity;
        if (changed) authVersion++;
        identity = next;
        for (const s of instances.values()) {
            if (changed) {
                if (s.authIntent && !s.owner && next && s.editing) {
                    const previous = key(s); s.owner = next; save(s);
                    if (!s.storageError) try { localStorage.removeItem(previous); } catch (_) {}
                } else {
                    s.owner = next; s.draft = emptyDraft(); s.editing = false; s.authIntent = false; s.success = false;
                    s.busy = false; s.submission = (s.submission || 0) + 1;
                }
            }
            if (changed || !s.busy) render(s);
        }
    }
    function mount(root, fair) {
        const previous = instances.get(root);
        if (previous) previous.sequence++;
        root.classList.add('fr');
        const s = { root, kind: fair.kind, id: fair.id, name: fair.name, city: fair.city, owner: identity, draft: emptyDraft(), sequence: 0 };
        instances.set(root, s); render(s); load(s);
        if (root.dataset.frBound) return;
        root.dataset.frBound = 'true';
        root.addEventListener('click', event => {
            const button = event.target.closest('[data-fr-action]');
            const state = instances.get(root); if (!button || !state || state.busy) return;
            const action = button.dataset.frAction;
            if (action === 'write') { global._suppressVisitorPopup?.(); state.draft = restore(state) || emptyDraft(); state.editing = true; state.success = false; save(state); render(state, true); }
            if (action === 'back' || action === 'edit') { state.draft.step = action === 'edit' ? 1 : state.draft.step - 1; save(state); render(state, true); }
            if (action === 'close') { save(state); state.editing = false; state.authIntent = false; render(state, true); }
            if (action === 'retry' || action === 'more') load(state, action === 'more');
        });
        const input = event => {
            const s = instances.get(root), el = event.target;
            if (!s?.editing || s.busy || !Object.hasOwn(s.draft, el.name)) return;
            if (el.name === 'visit_month') s.draft.visit_month = el.value ? el.value + '-01' : '';
            else if (['rating', ...Object.keys(criteria)].includes(el.name)) s.draft[el.name] = el.value ? Number(el.value) : null;
            else s.draft[el.name] = el.type === 'checkbox' ? el.checked : el.value;
            save(s); message(s, '');
            if (el.name === 'body') { const counter = root.querySelector('[data-fr-counter]'); if (counter) counter.textContent = [...el.value].length; }
            if (el.type === 'radio' && el.closest('.fr-rating')) {
                el.closest('.fr-rating').querySelectorAll('i').forEach((icon, i) => { icon.className = (s.draft[el.name] >= i + 1 ? 'fas' : 'far') + ' fa-star'; });
            }
        };
        root.addEventListener('input', input); root.addEventListener('change', input);
        root.addEventListener('submit', event => { event.preventDefault(); submit(instances.get(root)); });
    }
    function init() {
        document.querySelectorAll('[data-fair-reviews]').forEach(root => mount(root, { kind: root.dataset.fairKind, id: root.dataset.fairId, name: root.dataset.fairName, city: root.dataset.fairCity }));
        try {
            const version = authVersion;
            _supabase.auth.getSession().then(({ data }) => { if (version === authVersion) reconcile(data?.session?.user?.id || null); }).catch(() => { if (version === authVersion) reconcile(null); });
            _supabase.auth.onAuthStateChange((_event, session) => { setTimeout(() => reconcile(session?.user?.id || null), 0); });
        } catch (_) { reconcile(null); }
        window.addEventListener('beforeunload', event => {
            if ([...instances.values()].some(s => s.editing && (s.storageError || s.busy))) { event.preventDefault(); event.returnValue = ''; }
        });
    }
    global.FairReviews = { mount, sectionHTML };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
