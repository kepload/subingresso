// Esiti dichiarati dal proprietario. Prezzi e canali non sono pubblicati.
(function () {
    'use strict';
    let state = null, version = 0, sessionUserId = null;
    const $ = id => document.getElementById(id);
    const dialog = () => $('listingOutcomeDialog');
    const bounds = outcome => outcome === 'rented' ? [120, 120000] : [100, 500000];
    function priceValue(raw) {
        const value = raw.trim();
        if (!value) return null;
        if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) return NaN;
        return Number(value.replace(',', '.'));
    }
    function sameIdentity() { return state && typeof _currentUser !== 'undefined' && _currentUser?.id === state.userId; }
    function error(message, field) {
        $('listingOutcomeError').textContent = message;
        $('listingOutcomeError').hidden = !message;
        const input = $('listingOutcomePrice');
        input.setAttribute('aria-invalid', field === 'price' ? 'true' : 'false');
        if (message) (field === 'price' ? input : $('listingOutcomeError')).focus();
    }
    function render() {
        if (!state) return;
        for (const el of dialog().querySelectorAll('[data-outcome-step]')) el.hidden = Number(el.dataset.outcomeStep) !== state.step;
        const last = state.step === 3 || state.outcome === 'neither';
        $('listingOutcomeProgress').textContent = `Passo ${state.step} di ${state.outcome === 'neither' ? 1 : 3}`;
        $('listingOutcomeBack').hidden = state.step === 1;
        $('listingOutcomeNext').textContent = last ? 'Salva esito' : 'Continua';
        $('listingOutcomePriceLabel').textContent = state.outcome === 'rented' ? 'Canone annuo concordato' : 'Prezzo finale di vendita';
        $('listingOutcomePriceUnit').textContent = state.outcome === 'rented' ? '€ / anno' : '€';
        $('listingOutcomePrice').placeholder = state.outcome === 'rented' ? 'Es. 3000' : 'Es. 15000';
        $('listingOutcomeSourceTitle').textContent = state.outcome === 'rented' ? 'Dove hai trovato l’affittuario?' : 'Dove hai trovato l’acquirente?';
        $('listingOutcomeNeitherNote').hidden = state.outcome !== 'neither';
        for (const control of dialog().querySelectorAll('button,input')) control.disabled = state.busy;
        $('listingOutcomeNext').textContent = state.busy ? 'Salvataggio…' : last ? 'Salva esito' : 'Continua';
    }
    function close() { ++version; if (dialog().open) dialog().close(); state = null; }
    async function open(listing) {
        if (state?.busy || !listing || listing.status !== 'active' || typeof _currentUser === 'undefined' || !_currentUser?.id) return;
        close();
        state = { id: listing.id, userId: _currentUser.id, step: 1, outcome: '', busy: false };
        sessionUserId = state.userId;
        $('listingOutcomeForm').reset();
        $('listingOutcomeListing').textContent = listing.titolo || 'Il tuo annuncio';
        error(''); render(); dialog().showModal();
        dialog().querySelector('input[name="listingOutcome"]')?.focus();
    }
    async function next(event) {
        event.preventDefault();
        if (!sameIdentity()) { close(); return; }
        if (state.busy) return;
        error('');
        if (state.step === 1) {
            state.outcome = dialog().querySelector('input[name="listingOutcome"]:checked')?.value || '';
            if (!state.outcome) { error('Scegli come è andata.'); return; }
            if (state.outcome !== 'neither') { state.step = 2; render(); $('listingOutcomePrice').focus(); return; }
        }
        const price = state.outcome === 'neither' ? null : priceValue($('listingOutcomePrice').value);
        const [min, max] = bounds(state.outcome);
        if (price !== null && (!Number.isFinite(price) || price < min || price > max)) {
            error(`Inserisci un importo tra ${min.toLocaleString('it-IT')} e ${max.toLocaleString('it-IT')} euro, oppure lascia vuoto.`, 'price'); return;
        }
        if (state.step === 2) { state.step = 3; render(); dialog().querySelector('input[name="listingOutcomeSource"]')?.focus(); return; }
        const source = state.outcome === 'neither' ? null : dialog().querySelector('input[name="listingOutcomeSource"]:checked')?.value;
        if (state.outcome !== 'neither' && !source) { error('Scegli dove hai trovato la persona.'); return; }
        state.busy = true; render();
        const requestVersion = version, actor = state.userId;
        try {
            // Rilettura della sessione prima della scrittura; niente risposte di un altro account.
            const session = await _supabase.auth.getSession();
            if (!sameIdentity() || requestVersion !== version) { if (requestVersion === version) close(); return; }
            if (session.error || session.data?.session?.user?.id !== actor) { close(); showToast('Accedi di nuovo prima di salvare.', 'warning'); return; }
            const { data, error: failure } = await _supabase.rpc('record_listing_outcome', {
                p_listing_id: state.id, p_outcome: state.outcome, p_final_price: price, p_source: source
            });
            if (!sameIdentity() || requestVersion !== version) { if (requestVersion === version) close(); return; }
            if (failure || data?.ok !== true) throw failure || Error('Salvataggio non riuscito');
            const outcome = data.outcome;
            close();
            showToast(outcome === 'neither' ? 'Risposta salvata. L’annuncio resta disponibile.' : outcome === 'rented' ? 'Annuncio segnato come affittato.' : 'Annuncio segnato come venduto.', 'success');
            loadMyListings();
            if (typeof _sellerAnalyticsLoaded !== 'undefined' && _sellerAnalyticsLoaded) loadSellerAnalytics();
        } catch (failure) {
            if (sameIdentity() && requestVersion === version) {
                state.busy = false; render();
                error(failure?.code === '22023' || failure?.code === '42501' ? failure.message : 'Non siamo riusciti a salvare. Riprova: le risposte sono ancora qui.');
            }
        }
    }
    function init() {
        $('listingOutcomeForm').addEventListener('submit', next);
        $('listingOutcomeBack').addEventListener('click', () => { if (state && !state.busy) { state.step--; error(''); render(); dialog().querySelector(`[data-outcome-step="${state.step}"] input`)?.focus(); } });
        $('listingOutcomeClose').addEventListener('click', () => { if (!state?.busy) close(); });
        dialog().addEventListener('cancel', event => { event.preventDefault(); if (!state?.busy) close(); });
        dialog().addEventListener('close', () => { if (state) { ++version; state = null; } });
        dialog().addEventListener('change', event => {
            if (state?.step === 1 && event.target.name === 'listingOutcome') { state.outcome = event.target.value; error(''); render(); }
            else if (state && event.target.name === 'listingOutcomeSource') error('');
        });
        $('listingOutcomePrice').addEventListener('input', () => { if (state) error(''); });
        if (typeof _supabase !== 'undefined') _supabase.auth.onAuthStateChange((_event, session) => {
            const previousUser = state?.userId || sessionUserId || (typeof _currentUser !== 'undefined' ? _currentUser?.id : null);
            const nextUser = session?.user?.id || null;
            if (state && session?.user?.id !== state.userId) close();
            if (previousUser && nextUser !== previousUser) {
                if (typeof _listingOutcomeRows !== 'undefined') _listingOutcomeRows.clear();
                if (typeof _myListingsVersion !== 'undefined') ++_myListingsVersion;
            }
            sessionUserId = nextUser;
        });
    }
    window.ListingOutcome = { open };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
