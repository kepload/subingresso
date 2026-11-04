// One contextual component for calendar details and standalone fair/event pages.
(function (global) {
    'use strict';
    const editions = global.FairReviewEditions || (typeof require === 'function' ? require('./fair-review-editions.js') : null);
    const sectors = { alimentare: 'Alimentare', abbigliamento: 'Abbigliamento e accessori', artigianato: 'Artigianato e opere proprie', casa: 'Casa e altri prodotti', altro: 'Altro' };
    const recommendations = { yes: 'Sì, la consiglio', maybe: 'Dipende dal banco', no: 'Non la consiglio' };
    const criteria = { organization: 'Organizzazione', turnout: 'Affluenza', value: 'Costi e risultati' };
    const labels = ['Quale edizione?', 'Come ti sei trovato?', 'La tua recensione'];
    const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    function sectionHTML(kind, id, name, city, dates = []) {
        return `<section id="fair-reviews" class="fr" data-fair-reviews data-fair-kind="${esc(kind)}" data-fair-id="${esc(id)}" data-fair-name="${esc(name)}" data-fair-city="${esc(city)}" data-fair-editions="${esc(JSON.stringify(editions.normalize(dates)))}"><h2>Recensioni degli ambulanti</h2><noscript>Abilita JavaScript per leggere e scrivere le recensioni.</noscript></section>`;
    }
    if (typeof module !== 'undefined' && module.exports) module.exports = { sectionHTML };
    if (!global.document) return;
    const instances = new Map();
    let identity = null, identityReady = false, authVersion = 0;
    const monthLabel = value => /^20\d\d-\d\d-01$/.test(value || '') ? new Intl.DateTimeFormat('it-IT', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value)) : '';
    const emptyDraft = () => ({ step: 1, edition_key: '', visit_year: null, visit_month: '', sector: 'altro', rating: null, organization: null, turnout: null, value: null, body: '', recommend: null, confirmed: false });
    const key = s => 'fair_review_v1:' + (s.owner || 'guest') + ':' + s.kind + ':' + s.id;
    function restore(s) {
        try {
            const draft = JSON.parse(localStorage.getItem(key(s)));
            if (!draft || ![1, 2].includes(draft.version)) return null;
            if (Date.now() - draft.savedAt > 30 * 86400000) { localStorage.removeItem(key(s)); return null; }
            const data = { ...emptyDraft(), ...draft.data, step: Math.min(3, Math.max(1, Number(draft.data.step) || 1)), confirmed: false };
            if (!data.edition_key && data.visit_month) { data.visit_year = Number(data.visit_month.slice(0, 4)); data.edition_key = 'year:' + data.visit_year; }
            return data;
        } catch (_) { return null; }
    }
    function save(s) {
        if (!s.editing || s.owner !== identity) return;
        try {
            localStorage.setItem(key(s), JSON.stringify({ version: 2, savedAt: Date.now(), data: { ...s.draft, confirmed: false } }));
            s.storageError = false;
        } catch (_) { s.storageError = true; }
        const status = s.root.querySelector('[data-fr-saved]');
        if (status) { status.hidden = !s.storageError; status.textContent = 'Salvataggio non riuscito. Non chiudere la pagina.'; }
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
        if (!result.count) return '<p class="fr-empty">Nessuna recensione. Scrivi la prima.</p>';
        return `<div class="fr-summary"><strong>${esc(result.average)}<small> / 5</small></strong><div>${stars(result.average)}<p>${esc(result.count)} ${result.count === 1 ? 'recensione' : 'recensioni'} di ambulanti</p></div></div><dl class="fr-criteria">${Object.entries(criteria).filter(([k]) => result[k] != null).map(([k,v]) => `<div><dt>${esc(v)}</dt><dd>${esc(result[k])} / 5</dd></div>`).join('')}</dl><div class="fr-review-list">${result.reviews.map(review => `<article class="fr-review"><div class="fr-review-heading"><strong>${esc(review.author)}</strong>${stars(review.rating)}</div><p class="fr-meta">${esc(review.visit_start || !review.visit_month ? editions.label(review) : monthLabel(review.visit_month))}${review.sector && review.sector !== 'altro' ? ' · ' + esc(sectors[review.sector] || '') : ''}</p><p class="fr-review-body">${esc(review.body)}</p><p class="fr-recommend">${esc(recommendations[review.recommend] || '')}</p><a class="fr-report" href="mailto:info@subingresso.it?subject=${encodeURIComponent('Segnalazione recensione '+review.id)}&amp;body=${encodeURIComponent('Fiera: '+s.name+'\nRecensione: '+review.id+'\nSegnalazione: ')}">Segnala questa recensione</a></article>`).join('')}</div>${result.reviews.length < result.count && result.reviews.length < 10000 ? '<button type="button" class="fr-button" data-fr-action="more">Mostra altre recensioni</button>' : ''}`;
    }
    function ratingField(s, field, label, required = false) {
        return `<fieldset class="fr-rating"><legend>${esc(label)}${required ? ' *' : ''}</legend><div class="fr-rating-options">${[1,2,3,4,5].map(i => `<label><input type="radio" name="${field}" value="${i}"${s.draft[field] === i ? ' checked' : ''}><span><i class="${s.draft[field] >= i ? 'fas' : 'far'} fa-star" aria-hidden="true"></i><span class="fr-sr">${i} su 5</span></span></label>`).join('')}</div></fieldset>`;
    }
    function editionControls(s) {
        const currentYear = Number(editions.today().slice(0, 4));
        if (s.chooseYear != null) {
            const dates = editions.choices(s.editions, s.chooseYear);
            return `<button type="button" class="fr-link" data-fr-action="change-year">Cambia anno</button><div class="fr-editions">${dates.length <= 4 ? dates.map(e => `<button type="button" class="fr-edition" data-fr-action="choose-edition" data-edition-key="${esc(e.key)}">${esc(editions.label(e))}<i class="fas fa-chevron-right" aria-hidden="true"></i></button>`).join('') : `<label class="fr-field">Data<select name="edition_key"><option value="">Scegli la data</option>${dates.map(e => `<option value="${esc(e.key)}">${esc(editions.label(e))}</option>`).join('')}</select></label>`}<button type="button" class="fr-link" data-fr-action="choose-edition" data-edition-key="year:${s.chooseYear}">Non ricordo la data</button></div>`;
        }
        return `<div class="fr-editions">${[currentYear,currentYear - 1].filter(y => editions.yearAllowed(s.editions, y) && (s.kind !== 'organizer' || editions.normalize(s.editions).some(e => e.year === y))).map(y => {
            const dates = editions.choices(s.editions, y);
            const title = y === currentYear ? dates.length === 1 ? 'Questa edizione' : 'Quest’anno' : 'L’anno scorso';
            return `<button type="button" class="fr-edition" data-fr-action="choose-year" data-year="${y}"><span><strong>${title}</strong><small>${esc(dates.length === 1 ? editions.label(dates[0]) : y)}</small></span><i class="fas fa-chevron-right" aria-hidden="true"></i></button>`;
        }).join('')}<button type="button" class="fr-edition" data-fr-action="other-edition" aria-expanded="${Boolean(s.otherEdition)}"><span>Altra edizione</span><i class="fas fa-chevron-down" aria-hidden="true"></i></button></div>${s.otherEdition ? `<label class="fr-field">Anno<select name="visit_year"><option value="">Scegli l’anno</option>${Array.from({length:currentYear-1899},(_,i)=>currentYear-i).filter(y=>s.kind !== 'organizer' || editions.normalize(s.editions).some(e=>e.year===y)).map(y=>`<option value="${y}">${y}</option>`).join('')}</select></label>` : ''}`;
    }
    function formHTML(s) {
        const d = s.draft;
        const selected = editions.resolve(s.editions, d.edition_key);
        let content;
        if (d.step === 1) content = editionControls(s);
        if (d.step === 2) content = `${ratingField(s,'rating','Nel complesso',true)}${Object.entries(criteria).map(([k,v]) => ratingField(s,k,v)).join('')}`;
        if (d.step === 3) content = `<div class="fr-chosen-edition"><span>${esc(editions.label(selected))}</span>${stars(d.rating)}</div><label class="fr-field"><span class="fr-sr">Commento facoltativo</span><textarea name="body" rows="4" maxlength="2000" placeholder="Com’è andata? (facoltativo)">${esc(d.body)}</textarea></label><label class="fr-confirm"><input type="checkbox" name="confirmed"${d.confirmed ? ' checked' : ''}>Ho partecipato a questa fiera.</label>`;
        return `<form class="fr-form" novalidate><div class="fr-writer-top"><p class="fr-context">${esc(s.name)} · ${esc(s.city)}</p><button type="button" class="fr-close" data-fr-action="close" aria-label="Chiudi recensione"><i class="fas fa-times" aria-hidden="true"></i></button></div><div class="fr-progress-meta"><span>${d.step} / 3</span></div><div class="fr-progress" role="progressbar" aria-label="Avanzamento recensione" aria-valuemin="0" aria-valuemax="3" aria-valuenow="${d.step}" aria-valuetext="Passo ${d.step} di 3"><span style="width:${d.step / 3 * 100}%"></span></div><h3 tabindex="-1" data-fr-step-title>${labels[d.step - 1]}</h3>${content}<p class="fr-error" data-fr-error role="alert" hidden></p>${d.step > 1 ? `<div class="fr-actions"><button type="button" class="fr-button" data-fr-action="back">Indietro</button><button class="fr-button fr-primary" type="submit">${d.step === 2 ? 'Continua' : identity ? 'Pubblica' : 'Registrati e pubblica'}</button></div>` : ''}<p class="fr-error" data-fr-saved role="alert"${s.storageError ? '' : ' hidden'}>Salvataggio non riuscito. Non chiudere la pagina.</p></form>`;
    }
    function render(s, focus = false) {
        if (instances.get(s.root) !== s) return;
        const saved = restore(s);
        s.root.innerHTML = s.editing ? formHTML(s) : `<div class="fr-heading"><h2>Recensioni degli ambulanti</h2><button type="button" class="fr-button fr-primary" data-fr-action="write"${identityReady ? '' : ' disabled'}>${saved ? 'Riprendi la recensione' : 'Scrivi una recensione'}</button></div>${s.success ? '<p class="fr-success" role="status">Recensione pubblicata.</p>' : ''}${reviewsHTML(s)}`;
        if (focus) s.root.querySelector('[data-fr-step-title], [data-fr-action="write"]')?.focus({ preventScroll: true });
    }
    function chooseEdition(s, key) {
        const selected = editions.resolve(s.editions, key);
        if (!selected) { message(s, 'Scegli un’edizione già svolta.'); return; }
        s.draft.edition_key = selected.key;
        s.draft.visit_year = selected.year;
        s.draft.visit_month = '';
        s.draft.step = 2; s.chooseYear = null; s.otherEdition = false;
        save(s); render(s, true);
    }
    function chooseYear(s, value) {
        const year = Number(value);
        if (!editions.yearAllowed(s.editions, year)) { message(s, 'Questa edizione non si è ancora svolta.'); return; }
        const dates = editions.choices(s.editions, year);
        if (dates.length > 1) { s.chooseYear = year; render(s, true); }
        else chooseEdition(s, dates[0]?.key || 'year:' + year);
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
        if (step === 1 && !editions.resolve(s.editions, d.edition_key)) return 'Scegli l’edizione.';
        if (step === 2 && ![1,2,3,4,5].includes(d.rating)) return 'Scegli da 1 a 5 stelle.';
        if (step === 3 && [...d.body.trim()].length > 2000) return 'Il commento è troppo lungo.';
        if (step === 3 && !d.confirmed) return 'Conferma di aver partecipato.';
        return '';
    }
    async function submit(s) {
        if (s.busy || s.owner !== identity) return;
        for (let step = 1; step <= s.draft.step; step++) {
            const error = validate(s, step);
            if (error) { s.draft.step = step; save(s); render(s, true); message(s, error); return; }
        }
        if (s.draft.step < 3) { s.draft.step++; save(s); render(s, true); return; }
        save(s);
        s.busy = true;
        const submission = s.submission = (s.submission || 0) + 1;
        const version = authVersion;
        s.root.querySelectorAll('button, input, select, textarea').forEach(el => { el.disabled = true; });
        const submitButton = s.root.querySelector('[type="submit"]');
        if (submitButton) { submitButton.textContent = 'Attendi…'; submitButton.setAttribute('aria-busy', 'true'); }
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
            document.dispatchEvent(new CustomEvent('fair-review-published',{detail:{kind:s.kind,id:s.id}}));
            await load(s);
        } catch (error) {
            if (version === authVersion && instances.get(s.root) === s) { render(s); message(s, error.name === 'TimeoutError' ? 'Connessione lenta. Riprova.' : error.message); }
        } finally {
            if (s.submission === submission) s.busy = false;
            if (s.submission === submission && instances.get(s.root) === s && version === authVersion) {
                s.root.querySelectorAll('button, input, select, textarea').forEach(el => { el.disabled = false; });
                const button = s.root.querySelector('[type="submit"]');
                if (button) { button.textContent = identity ? 'Pubblica' : 'Registrati e pubblica'; button.removeAttribute('aria-busy'); }
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
                s.root.querySelector('[type="submit"]')?.focus({ preventScroll: true });
            }
        }, s.root.querySelector('[type="submit"]'), 'Accedi o registrati per pubblicare la recensione.');
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
        const s = { root, kind: fair.kind, id: fair.id, name: fair.name, city: fair.city, editions: editions.normalize(fair.editions || []), owner: identity, draft: emptyDraft(), sequence: 0 };
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
            if (action === 'choose-year') chooseYear(state, button.dataset.year);
            if (action === 'choose-edition') chooseEdition(state, button.dataset.editionKey);
            if (action === 'other-edition') { state.otherEdition = !state.otherEdition; state.chooseYear = null; render(state); state.root.querySelector('[name=visit_year]')?.focus(); }
            if (action === 'change-year') { state.chooseYear = null; render(state, true); }
            if (action === 'retry' || action === 'more') load(state, action === 'more');
        });
        const input = event => {
            const s = instances.get(root), el = event.target;
            if (!s?.editing || s.busy || !Object.hasOwn(s.draft, el.name)) return;
            if (el.name === 'visit_year') { if (event.type === 'change' && el.value) chooseYear(s, el.value); return; }
            if (el.name === 'edition_key') { if (event.type === 'change' && el.value) chooseEdition(s, el.value); return; }
            else if (['rating', ...Object.keys(criteria)].includes(el.name)) s.draft[el.name] = el.value ? Number(el.value) : null;
            else s.draft[el.name] = el.type === 'checkbox' ? el.checked : el.value;
            save(s); message(s, '');
            if (el.type === 'radio' && el.closest('.fr-rating')) {
                el.closest('.fr-rating').querySelectorAll('i').forEach((icon, i) => { icon.className = (s.draft[el.name] >= i + 1 ? 'fas' : 'far') + ' fa-star'; });
            }
        };
        root.addEventListener('input', input); root.addEventListener('change', input);
        root.addEventListener('mouseover', event => {
            if (!matchMedia('(hover: hover)').matches) return;
            const label = event.target.closest('.fr-rating-options label');
            if (!label) return;
            const group = label.closest('.fr-rating'), rating = Number(label.querySelector('input').value);
            group.querySelectorAll('i').forEach((icon, i) => { icon.className = (rating >= i + 1 ? 'fas' : 'far') + ' fa-star'; });
        });
        root.addEventListener('mouseout', event => {
            const group = event.target.closest('.fr-rating');
            if (!group || group.contains(event.relatedTarget)) return;
            const rating = instances.get(root)?.draft[group.querySelector('input').name];
            group.querySelectorAll('i').forEach((icon, i) => { icon.className = (rating >= i + 1 ? 'fas' : 'far') + ' fa-star'; });
        });
        root.addEventListener('submit', event => { event.preventDefault(); submit(instances.get(root)); });
    }
    function init() {
        document.querySelectorAll('[data-fair-reviews]').forEach(root => mount(root, { kind: root.dataset.fairKind, id: root.dataset.fairId, name: root.dataset.fairName, city: root.dataset.fairCity, editions: JSON.parse(root.dataset.fairEditions || '[]') }));
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
