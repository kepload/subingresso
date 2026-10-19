const SITE = 'https://subingresso.it';
const escape = value => String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const date = value => new Intl.DateTimeFormat('it-IT', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value + 'T12:00:00Z'));
export function reminderPayload(item, email) {
    const link = item.fair_kind === 'organizer' ? '/evento?id=' + encodeURIComponent(item.fair_id) : '/fiere/' + encodeURIComponent(item.fair_id);
    const name = String(item.fair_name).replace(/[\r\n]/g, ' ').slice(0, 240);
    const when = date(item.reference_date), personal = item.date_origin === 'personal';
    const intro = 'Hai chiesto un promemoria ' + item.months_before + ' mesi prima di questa fiera.';
    const reference = (personal ? 'Data indicativa scelta da te: ' : 'Data di riferimento della scheda: ') + when + '.';
    const unsubscribe = SITE + '/api/saved-fairs?unsubscribe=' + encodeURIComponent(item.unsub_token);
    return {
        from: 'Subingresso.it <noreply@subingresso.it>', to: [email],
        subject: 'Il tuo promemoria per ' + name,
        html: `<div style="font:16px/1.6 system-ui,sans-serif;max-width:560px;margin:auto;color:#213d59"><div style="padding:22px;background:#153f69;color:white;font-size:23px;font-weight:800">Subingresso.it</div><div style="padding:24px;border:1px solid #d9e3ed"><h1 style="font-size:23px;line-height:1.3">È il momento di controllare come partecipare</h1><h2 style="font-size:20px">${escape(name)}</h2><p>${escape(item.city)}</p><p>${escape(intro)}</p><p><strong>${escape(reference)}</strong></p><p>Controlla sulla fonte le date aggiornate, i requisiti e i termini per presentare la domanda. Questo promemoria non conferma iscrizioni aperte o posti disponibili.</p><p><a href="${escape(SITE + link)}" style="display:inline-block;padding:13px 20px;background:#19558f;color:#fff;text-decoration:none;border-radius:9px;font-weight:700">Apri la fiera →</a></p><p style="font-size:13px"><a href="${SITE}/dashboard?area=normale#fiere">Gestisci le mie fiere</a> · <a href="${escape(unsubscribe)}">Disattiva questo promemoria</a></p></div></div>`,
        text: name + '\n' + item.city + '\n\n' + intro + '\n' + reference + '\nControlla sulla fonte come partecipare: il promemoria non conferma iscrizioni aperte o posti disponibili.\n' + SITE + link + '\n\nDisattiva il promemoria: ' + unsubscribe,
        headers: { 'List-Unsubscribe': '<' + unsubscribe + '>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
    };
}
export async function runFairReminders(client, options = {}) {
    const request = options.fetch || globalThis.fetch;
    const summary = { claimed: 0, sent: 0, cancelled: 0, retries: 0, failed: 0 };
    async function rpc(name, args) {
        const response = await client.rpc(name, args);
        if (response.error) throw Error('Operazione promemoria non disponibile: ' + name);
        return response.data;
    }
    if (options.dryRun) return { dry_run: true, ...(await rpc('claim_fair_reminders', { p_dry_run: true })) };
    if (!options.apiKey) throw Error('Invio email non configurato.');
    const items = await rpc('claim_fair_reminders', { p_limit: 20 }); summary.claimed = items.length;
    if (!items.length) return summary;
    let catalog;
    if (items.some(item => item.fair_kind === 'catalog')) {
        try {
            const response = await request(SITE + '/data/fiere.json', { signal: AbortSignal.timeout(15000) });
            if (!response.ok) throw Error('Unavailable');
            const value = await response.json();
            if (!Array.isArray(value.events) || !value.events.length) throw Error('Invalid catalogue');
            catalog = new Map(value.events.map(event => [event.id, event]));
        } catch (_) {
            for (const item of items) await rpc('finish_fair_reminder', { p_delivery_id: item.delivery_id, p_outcome: 'retry', p_error: 'Calendario non disponibile. Nessuna email inviata.' });
            summary.retries = items.length; return summary;
        }
    }
    for (const item of items) {
        let outcome = 'retry', message = '', providerId = null;
        try {
            let event;
            if (item.fair_kind === 'catalog') event = catalog.get(item.fair_id);
            else event = (await rpc('published_organizer_events', { p_id: item.fair_id }))?.[0];
            const dates = item.fair_kind === 'catalog' ? (event?.editions || []).filter(edition => !edition.periodOnly).map(edition => edition.start) : [event?.start_date];
            if (!event || (item.date_origin === 'published' && !dates.includes(item.reference_date))) {
                outcome = 'cancelled'; message = 'La fiera o la data non sono più pubblicate. Verifica le impostazioni nel profilo.';
            } else {
                let payload = item.payload;
                if (!payload) {
                    const user = await client.auth.admin.getUserById(item.user_id);
                    if (user.error || !user.data?.user?.email) { outcome = 'failed'; message = 'Indirizzo email dell’account non disponibile.'; }
                    else payload = reminderPayload(item, user.data.user.email);
                }
                if (payload) {
                    payload = await rpc('prepare_fair_reminder', { p_delivery_id: item.delivery_id, p_payload: payload });
                    if (!payload) { outcome = 'cancelled'; message = 'Promemoria disattivato o modificato prima dell’invio.'; }
                    else {
                        try {
                            const response = await request('https://api.resend.com/emails', {
                                method: 'POST', headers: { Authorization: 'Bearer ' + options.apiKey, 'Content-Type': 'application/json', 'Idempotency-Key': 'fair-reminder/' + item.delivery_id },
                                body: JSON.stringify(payload), signal: AbortSignal.timeout(15000)
                            });
                            if (response.ok) {
                                const sent = await response.json();
                                if (typeof sent.id !== 'string' || !sent.id) throw Error('Risposta del provider da verificare.');
                                outcome = 'sent'; providerId = sent.id;
                            } else if (response.status === 429) { outcome = 'retry'; message = 'Limite temporaneo del provider: invio in coda.'; }
                            else if (response.status >= 500 || response.status === 409) { outcome = 'unknown'; message = 'Esito del provider da verificare. Riprova con la stessa chiave.'; }
                            else { outcome = 'failed'; message = 'Il provider non ha accettato l’email (' + response.status + ').'; }
                        } catch (_) { outcome = 'unknown'; message = 'Esito della richiesta email incerto. Riprova con la stessa chiave.'; }
                    }
                }
            }
            await rpc('finish_fair_reminder', { p_delivery_id: item.delivery_id, p_outcome: outcome, p_provider_id: providerId, p_error: message || null });
            if (outcome === 'sent') summary.sent++;
            else if (outcome === 'cancelled') summary.cancelled++;
            else if (outcome === 'failed') summary.failed++;
            else summary.retries++;
        } catch (_) {
            summary.retries++;
            // A failed final DB write after provider acceptance must remain uncertain.
            try { await rpc('finish_fair_reminder', { p_delivery_id: item.delivery_id, p_outcome: providerId ? 'unknown' : 'retry', p_error: 'Elaborazione interrotta. Invio da verificare prima del retry.' }); } catch (_) { /* The expired lease is recovered by the next run. */ }
        }
        if (options.pause) await options.pause(600);
    }
    return summary;
}
