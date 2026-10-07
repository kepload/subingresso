(function () {
    'use strict';
    const model = window.PosteggioValuation;
    const form = document.getElementById('calculatorForm');
    const steps = ['incasso', 'mercato', 'zona', 'clientela', 'passaggio', 'posizione', 'sole', 'concessione'];
    const data = { baseIncasso: 'giorno', incasso: '', giornate: '', utileGiorno: null };
    let step = 0, busy = false, result = null, saved = false, saving = null, requestId = null;
    const started = Date.now();
    const session = Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join('');
    // Token nuovo per compilazione: nessuna vecchia sessione di un altro utente
    // viene recuperata da un dispositivo condiviso.
    try { localStorage.removeItem('_val_session'); } catch (_) {}
    function fmt(n) { return Number.isFinite(n) ? Math.round(n).toLocaleString('it-IT', { useGrouping: true }) : '—'; }
    function updateIncomeExample() {
        const daily = data.baseIncasso === 'giorno';
        const example = daily ? 150 + Math.floor(Math.random() * 601) : 2000 + Math.floor(Math.random() * 681) * 100;
        document.getElementById('fatturato').placeholder = 'Es. ' + fmt(example);
        document.getElementById('incassoPrefix').textContent = daily ? 'Incasso medio ' : 'Incasso totale ';
        document.getElementById('incassoPeriod').textContent = daily ? 'in una giornata' : 'in un anno';
    }
    function error(message) {
        const el = document.getElementById('valError');
        el.textContent = message || ''; el.hidden = !message;
    }
    function showStep() {
        form.querySelectorAll('.step-card').forEach(el => el.classList.toggle('active', el.dataset.step === steps[step]));
        document.getElementById('valResults').hidden = true;
        document.body.classList.remove('is-result');
        document.getElementById('backBtn').hidden = step === 0;
        document.getElementById('progressBar').style.width = ((step + 1) / steps.length * 100) + '%';
        document.getElementById('stepCount').textContent = (step + 1) + ' / ' + steps.length;
        error('');
        const heading = form.querySelector('.step-card.active h2');
        if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
    function readMoney() {
        data.incasso = model.parseMoney(document.getElementById('fatturato').value);
        data.utileGiorno = document.getElementById('utileGiorno').value.trim() === '' ? null : model.parseMoney(document.getElementById('utileGiorno').value);
    }
    function readMarket() {
        data.giornate = Number(document.getElementById('giornate').value);
        if (data.concessione === 'breve') data.mesiResidui = Number(document.getElementById('mesiResidui').value);
    }
    function validateStep() {
        if (step === 0) {
            readMoney();
            if (!Number.isFinite(data.incasso) || data.incasso <= 0 || data.incasso > (data.baseIncasso === 'giorno' ? 50000 : 2000000)) throw new Error('Inserisci un incasso valido di questo posteggio. Esempio: 500 oppure 25.000.');
            if (data.utileGiorno !== null && !Number.isFinite(data.utileGiorno)) throw new Error('Controlla l’importo che resta dopo le spese, oppure lascia vuoto.');
        } else if (step === 1) {
            readMarket();
            if (!data.frequenza || !data.settore) throw new Error('Scegli il tipo di mercato e cosa vendi.');
            if (!Number.isInteger(data.giornate) || data.giornate < 1 || data.giornate > (data.frequenza === 'settimanale' ? 53 : 366)) throw new Error(data.frequenza === 'settimanale' ? 'Inserisci da 1 a 53 giornate all’anno: conta solo questo posteggio.' : 'Inserisci da 1 a 366 giornate effettive all’anno.');
            const annual = data.baseIncasso === 'giorno' ? data.incasso * data.giornate : data.incasso;
            if (annual < 100 || annual > 2000000 || annual / data.giornate > 50000) throw new Error('Incasso e giornate non sono coerenti. Controlla i dati.');
            if (data.utileGiorno !== null && data.utileGiorno > annual / data.giornate) throw new Error('Dopo le spese non può restare più dell’incasso. Torna indietro e controlla.');
        } else if (!data[steps[step]]) throw new Error('Tocca una delle risposte.');
    }
    function next() {
        if (busy) return;
        try {
            validateStep();
            if (step < steps.length - 1) { step++; showStep(); }
            else { readMarket(); result = model.estimate(data); render(); }
        } catch (e) { error(e.message); }
    }
    form.addEventListener('click', function (event) {
        const btn = event.target.closest('button[data-key]');
        if (!btn || busy || btn.closest('.step-card')?.dataset.step !== steps[step]) return;
        const key = btn.dataset.key;
        if (!Object.prototype.hasOwnProperty.call(model.choices, key) || !model.choices[key].includes(btn.dataset.value)) return;
        data[key] = btn.dataset.value;
        btn.parentElement.querySelectorAll('button[data-key="' + key + '"]').forEach(el => {
            const selected = el === btn; el.classList.toggle('selected', selected); el.setAttribute('aria-pressed', String(selected));
        });
        error('');
        if (key === 'baseIncasso') {
            updateIncomeExample();
            return;
        }
        if (key === 'concessione') document.getElementById('anniResiduiWrap').hidden = data.concessione !== 'breve';
        if (['frequenza', 'settore', 'concessione'].includes(key)) return;
        // Nessun timer: un doppio tocco non può saltare una domanda.
        next();
    });
    form.querySelectorAll('[data-next]').forEach(btn => btn.addEventListener('click', next));
    form.querySelectorAll('input').forEach(input => input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); next(); } }));
    document.getElementById('backBtn').addEventListener('click', () => { if (step > 0) { step--; showStep(); } });
    document.getElementById('editAnswers').addEventListener('click', () => { if (!busy) { step = 0; showStep(); } });
    function render() {
        form.querySelectorAll('.step-card').forEach(el => el.classList.remove('active'));
        document.getElementById('valResults').hidden = false;
        document.body.classList.add('is-result');
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        error('');
        const ok = result.status === 'ok';
        document.getElementById('priceCards').hidden = !ok;
        document.getElementById('valSaveCard').hidden = !ok;
        document.getElementById('resultHeading').textContent = ok ? 'La tua stima indicativa' : 'Prima verifica il titolo del posteggio';
        document.getElementById('resultNotes').replaceChildren();
        result.notes.forEach(note => { const p = document.createElement('p'); p.textContent = note; document.getElementById('resultNotes').appendChild(p); });
        if (!ok) return;
        document.getElementById('totalAvg').textContent = '€ ' + fmt(result.avg);
        document.getElementById('priceMin').textContent = fmt(result.min);
        document.getElementById('priceMax').textContent = fmt(result.max);
        document.getElementById('rentValue').textContent = fmt(result.rent);
        document.getElementById('rentMonthly').textContent = fmt(result.monthly);
        document.getElementById('roiValue').textContent = result.roi.toLocaleString('it-IT');
        document.getElementById('resultBasis').textContent = 'Questo posteggio: € ' + fmt(result.input.fatturato) + ' di incassi all’anno · ' + result.input.giornate + ' giornate.';
        saved = false; requestId = crypto.randomUUID();
        document.getElementById('valSaveBtn').disabled = true;
        document.getElementById('valSaveBtn').textContent = 'Salvataggio…';
        saving = saveResult().finally(() => { busy = false; document.getElementById('valSaveBtn').disabled = false; });
    }
    function context() {
        const read = k => { try { return (sessionStorage.getItem(k) || '').slice(0, 300); } catch (_) { return ''; } };
        return { referrer: read('_acq_referrer'), utm_source: read('_acq_utm_source'), utm_medium: read('_acq_utm_medium'), utm_campaign: read('_acq_utm_campaign'),
            landing_path: location.pathname, device_type: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop', tempo_compilazione_sec: Math.min(86400, Math.round((Date.now() - started) / 1000)) };
    }
    async function saveResult() {
        busy = true;
        let timer;
        try {
            if (typeof _supabase === 'undefined') throw new Error('Servizio non disponibile');
            const request = _supabase.rpc('save_valutazione_v2', { p_input: result.input, p_session_token: session, p_request_id: requestId, p_context: context() });
            const { data: log, error: err } = await Promise.race([request, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Salvataggio non confermato')), 10000); })]);
            if (err || !log) throw new Error('Salvataggio non riuscito');
            // Gli importi salvati vengono ricalcolati sul server.
            if (Number(log.prezzo_avg) !== result.avg || Number(log.prezzo_min) !== result.min || Number(log.prezzo_max) !== result.max) throw new Error('Modello da aggiornare: ricarica la pagina');
            saved = true;
            await updateSaveCard();
        } catch (e) {
            saved = false;
            document.getElementById('valSaveBtn').textContent = 'Riprova a salvare';
            document.getElementById('valSaveDesc').textContent = 'La stima è visibile, ma il salvataggio del report non è confermato.';
        } finally {
            clearTimeout(timer);
        }
    }
    async function updateSaveCard() {
        if (!saved) return;
        const { data: auth } = await _supabase.auth.getSession();
        if (auth?.session?.user) {
            const { error: err } = await _supabase.rpc('link_valutatore_to_user', { p_session_token: session });
            if (err) throw err;
            document.getElementById('valSaveBtn').textContent = 'Apri le mie valutazioni';
            document.getElementById('valSaveDesc').textContent = 'Report salvato nel tuo profilo.';
        } else {
            document.getElementById('valSaveBtn').textContent = 'Crea account e conserva';
            document.getElementById('valSaveDesc').textContent = 'Conserva questa stima nel tuo profilo.';
        }
    }
    document.getElementById('valSaveBtn').addEventListener('click', async function () {
        if (saving) await saving;
        if (!saved) { saving = saveResult(); await saving; busy = false; return; }
        const { data: auth } = await _supabase.auth.getSession();
        if (auth?.session?.user) {
            const { error: err } = await _supabase.rpc('link_valutatore_to_user', { p_session_token: session });
            if (err) { document.getElementById('valSaveDesc').textContent = 'Non riesco a collegare il report. Riprova tra poco.'; return; }
            try { sessionStorage.setItem('_highlight_session', session); } catch (_) {}
            location.href = '/dashboard#valutazioni';
        } else if (typeof window.openAuthModal === 'function') {
            try { localStorage.setItem('_val_session', session); sessionStorage.setItem('_post_auth_intent', 'valutatore_save'); } catch (_) {}
            window.__onLoginSuccess = () => updateSaveCard().catch(() => {});
            window.openAuthModal('register', undefined, 'valutatore_create');
        }
    });
    window._valUpdateSaveCard = () => updateSaveCard().catch(() => {});
    updateIncomeExample();
    showStep();
})();
