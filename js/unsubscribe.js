// Public configuration only. This page needs fetch, not the Supabase SDK.
const SUPABASE_URL = 'https://mhfbtltgwibwmsudsuvf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';
(function () {
    'use strict';
    const params = new URLSearchParams(location.search);
    const token = params.get('t'), type = params.get('type') || 'all';
    const form = document.getElementById('unsubscribeForm');
    const button = document.getElementById('unsubscribeSubmit');
    const reason = document.getElementById('unsubscribeReason');
    const cancel = document.getElementById('unsubscribeCancel');
    const submitError = document.getElementById('unsubscribeSubmitError');
    const descriptions = {
        digest: 'Non riceverai più il riepilogo settimanale degli annunci.',
        stats: 'Non riceverai più le statistiche settimanali dei tuoi annunci.',
        bando_alert: 'Disattiverai gli avvisi su bandi e annunci della regione collegata a questa email.',
        all: 'Disattiverai i riepiloghi settimanali, le statistiche degli annunci e i promemoria delle fiere.'
    };
    document.getElementById('loading').classList.add('hidden');
    if (!token || !Object.hasOwn(descriptions, type)) {
        document.getElementById('error').classList.remove('hidden');
        document.getElementById('errorMsg').textContent = 'Link di disiscrizione non valido. Apri il collegamento presente nella tua email.';
        return;
    }
    document.getElementById('unsubscribeDescription').textContent = descriptions[type];
    form.classList.remove('hidden');
    let busy = false;
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (busy) return;
        busy = true;
        button.disabled = reason.disabled = true;
        button.textContent = 'Disiscrizione in corso…';
        cancel.style.display = 'none';
        submitError.classList.add('hidden');
        try {
            const response = await fetch(SUPABASE_URL + '/functions/v1/email-unsubscribe', {
                method: 'POST', headers: {'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY},
                body: JSON.stringify({token, type, reason: reason.value || undefined}),
                signal: AbortSignal.timeout(20000)
            });
            const data = await response.json();
            if (!response.ok || !data.ok) throw new Error(data.error || 'Non siamo riusciti a completare la disiscrizione. Riprova.');
            form.classList.add('hidden');
            document.getElementById('success').classList.remove('hidden');
            document.getElementById('successMsg').textContent = type === 'bando_alert'
                ? (data.regione ? 'Non riceverai più gli avvisi su bandi e annunci per ' + data.regione + '.' : 'Non riceverai più questi avvisi su bandi e annunci.')
                : descriptions[type];
            document.getElementById('unsubscribeFeedbackThanks').classList.toggle('hidden', !data.feedback_saved);
            document.getElementById('unsubscribeSuccessTitle').focus();
        } catch (error) {
            submitError.textContent = error.name === 'TimeoutError' || error instanceof TypeError
                ? 'Non siamo riusciti a verificare la disiscrizione. Riprova per confermare.'
                : error.message;
            submitError.classList.remove('hidden');
        } finally {
            busy = false;
            button.disabled = reason.disabled = false;
            button.textContent = 'Conferma disiscrizione';
            cancel.style.display = '';
        }
    });
})();
