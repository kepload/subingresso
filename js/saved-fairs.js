import { dateLabel, fairPath, reminderDate, todayInRome, validateReminder } from './fair-reminder-model.mjs?v=1';

let userId = null, epoch = 0, rows = new Map(), loaded = false, loading = null, dialog, current = null, opening = 0, busy = false;
let parents = [], returnTo = null;
const requests = new Set();
const $ = id => document.getElementById(id);
const key = (kind, id) => kind + ':' + id;
const element = (tag, className, text) => { const node = document.createElement(tag); node.className = className || ''; if (text !== undefined) node.textContent = text; return node; };
function identity(value) {
    const next = value?.user?.id || null;
    if (next === userId) return;
    epoch++; userId = next; rows.clear(); loaded = false; loading = null; busy = false;
    requests.forEach(controller => controller.abort()); requests.clear();
    if (dialog?.open) close(true);
    refreshButtons(); render();
}
async function session() {
    if (typeof _supabase === 'undefined') throw Error('Accesso non disponibile. Ricarica la pagina.');
    const result = await _supabase.auth.getSession();
    if (result.error) throw Error('Impossibile verificare l’accesso. Riprova.');
    identity(result.data?.session);
    return result.data?.session;
}
async function api(path = '', body) {
    const value = await session();
    if (!value?.user || !value.access_token) throw Object.assign(Error('Accedi per gestire le tue fiere.'), { status: 401 });
    const version = epoch, controller = new AbortController(); requests.add(controller);
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
        const response = await fetch('/api/saved-fairs' + path, { method: body ? 'POST' : 'GET', mode: 'same-origin',
            headers: { Authorization: 'Bearer ' + value.access_token, ...(body ? { 'Content-Type': 'application/json' } : {}) },
            ...(body ? { body: JSON.stringify(body) } : {}), signal: controller.signal });
        const result = await response.json();
        if (version !== epoch) throw Error('La sessione è cambiata.');
        if (!response.ok) throw Object.assign(Error(result.error || 'Impossibile aggiornare la fiera. Riprova.'), { status: response.status });
        return result;
    } catch (error) {
        if (error.name === 'AbortError') throw Error(version === epoch ? 'La richiesta sta impiegando troppo tempo. Riprova.' : 'La sessione è cambiata.');
        throw error;
    } finally { clearTimeout(timeout); requests.delete(controller); }
}
function announce(text, failure = false) {
    if (typeof window.showToast === 'function') { window.showToast(text, failure ? 'error' : 'success'); return; }
    let notice = $('saved-fairs-notice');
    if (!notice) { notice = element('p', 'sf-notice'); notice.id = 'saved-fairs-notice'; notice.setAttribute('role', 'status'); document.querySelector('main')?.prepend(notice); }
    notice.textContent = text;
}
function refreshButtons() {
    document.querySelectorAll('[data-save-fair]').forEach(button => {
        const saved = rows.has(key(button.dataset.fairKind, button.dataset.fairId));
        button.dataset.saved = loaded && saved ? 'true' : 'false';
        button.textContent = userId && !loaded ? '☆ Gestisci fiera' : saved ? '★ Fiera salvata · Modifica' : '☆ Salva questa fiera';
        button.setAttribute('aria-haspopup', 'dialog');
    });
    const badge = $('savedFairsBadge');
    if (badge) { badge.textContent = String(rows.size); badge.classList.toggle('hidden', !rows.size); }
}
async function load() {
    if (!userId) { render(); return; }
    if (loading) return loading;
    const version = epoch;
    loading = (async () => {
        try {
            const result = await api();
            if (version !== epoch) return;
            rows = new Map(result.saved.map(row => [key(row.fair_kind, row.fair_id), row])); loaded = true;
            refreshButtons(); render();
        } catch (error) {
            if (version !== epoch) return;
            render(error.message);
        } finally { if (version === epoch) loading = null; }
    })();
    return loading;
}
function render(error) {
    const list = document.querySelector('[data-saved-fairs-list]');
    if (!list) return;
    list.replaceChildren(); list.setAttribute('aria-busy', String(Boolean(userId && !loaded && !error)));
    if (error) {
        list.append(element('p', 'sf-error', error));
        const retry = element('button', 'sf-button', 'Riprova'); retry.type = 'button'; retry.addEventListener('click', () => load()); list.append(retry); return;
    }
    if (!userId || !loaded) { list.append(element('p', 'sf-empty', userId ? 'Caricamento delle fiere salvate…' : 'Accedi per ritrovare le tue fiere.')); return; }
    if (!rows.size) {
        const empty = element('p', 'sf-empty', 'Non hai ancora salvato una fiera. '), link = element('a', 'sf-link', 'Esplora il calendario →'); link.href = '/fiere'; empty.append(link); list.append(empty); return;
    }
    for (const row of rows.values()) {
        const card = element('article', 'sf-card'), heading = element('h3'), link = element('a', '', row.fair_name);
        link.href = fairPath(row.fair_kind, row.fair_id); heading.append(link); card.append(heading, element('small', '', row.city));
        if (row.reference_date) card.append(element('p', '', 'Data di riferimento: ' + dateLabel(row.reference_date)), element('small', '', row.date_origin === 'personal' ? 'Data indicativa scelta da te.' : 'Data riportata nella scheda.'));
        let text = 'Salvata senza promemoria email.';
        if (row.sent_at) text = 'Promemoria inviato il ' + dateLabel(row.sent_at.slice(0, 10)) + '.';
        else if (row.reminder_enabled) {
            text = row.reference_date <= todayInRome() ? 'Edizione trascorsa. Scegli una nuova data per un altro promemoria.' : 'Avviso ' + row.months_before + ' mesi prima: ' + dateLabel(row.remind_on) + '.';
            if (['cancelled', 'failed', 'needs_review'].includes(row.delivery_status)) text = 'Promemoria sospeso: apri Gestisci per verificare la data o le impostazioni.';
            else if (row.delivery_status === 'retry') text = 'Promemoria in coda. Riproveremo l’invio senza creare un secondo avviso.';
            else if (row.delivery_status === 'sending') text = 'Invio del promemoria in corso.';
        }
        card.append(element('p', '', text));
        const edit = element('button', 'sf-button', 'Gestisci fiera e promemoria'); edit.type = 'button'; edit.addEventListener('click', () => open(row.fair_kind, row.fair_id, edit)); card.append(edit); list.append(card);
    }
}
function initDialog() {
    if (dialog) return;
    dialog = element('dialog', 'sf-dialog'); dialog.id = 'saved-fair-dialog'; dialog.setAttribute('aria-labelledby', 'sf-title');
    dialog.innerHTML = `<header><h2 id="sf-title">Salva questa fiera</h2><button type="button" id="sf-close" class="sf-close" aria-label="Chiudi salvataggio fiera">×</button></header><div id="sf-loading" class="sf-dialog-body" role="status">Caricamento della fiera…</div><form id="sf-form" novalidate hidden><p id="sf-name" class="sf-name"></p><label class="sf-field" for="sf-date">Data della fiera<input id="sf-date" type="date" name="reference_date"></label><label id="sf-date-options-label" class="sf-field" for="sf-date-options" hidden>Date presenti nella scheda<select id="sf-date-options"><option value="">Scegli una data</option></select></label><p id="sf-date-help" class="sf-help"></p><label class="sf-check"><input id="sf-enabled" type="checkbox"><span>Ricordami di controllare l’iscrizione</span></label><div id="sf-reminder-fields" hidden><label class="sf-field" for="sf-months">Quanti mesi prima?<input id="sf-months" type="number" min="1" max="120" step="1" inputmode="numeric" value="5"></label><div class="sf-presets" aria-label="Anticipo del promemoria"><button type="button" data-sf-months="3">3 mesi</button><button type="button" data-sf-months="5">5 mesi</button><button type="button" data-sf-months="6">6 mesi</button><button type="button" data-sf-months="12">12 mesi · 1 anno</button></div></div><p id="sf-preview" class="sf-preview" role="status" aria-live="polite"></p><p class="sf-help">Un solo promemoria per l’edizione scelta, all’email del tuo account. Ti ricorda di verificare come partecipare: non conferma che le iscrizioni siano aperte.</p><p id="sf-error" class="sf-error" role="alert" hidden></p><div class="sf-actions"><button id="sf-submit" type="submit" class="sf-button sf-button-primary">Salva fiera</button><button id="sf-remove" type="button" class="sf-button sf-button-danger" hidden>Rimuovi dai salvati</button><button id="sf-cancel" type="button" class="sf-button">Annulla</button></div><p><a class="sf-link" href="/dashboard?area=normale#fiere">Vai alle mie fiere →</a></p></form>`;
    document.body.append(dialog);
    $('sf-close').addEventListener('click', () => close()); $('sf-cancel').addEventListener('click', () => close());
    dialog.addEventListener('cancel', event => { event.preventDefault(); if (!busy) close(); });
    dialog.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (!busy && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) close(); } });
    $('sf-form').addEventListener('submit', save); $('sf-remove').addEventListener('click', remove);
    for (const id of ['sf-date', 'sf-months', 'sf-enabled']) $(id).addEventListener('input', preview);
    $('sf-date-options').addEventListener('change', () => { if ($('sf-date-options').value) $('sf-date').value = $('sf-date-options').value; preview(); });
    dialog.querySelectorAll('[data-sf-months]').forEach(button => button.addEventListener('click', () => { $('sf-months').value = button.dataset.sfMonths; preview(); }));
}
function close(force = false) {
    if (busy && !force) return;
    opening++; current = null;
    dialog?.close();
    parents.forEach(parent => { if (parent.isConnected && !parent.open) parent.showModal(); }); parents = [];
    if (returnTo?.isConnected) returnTo.focus({ preventScroll: true }); returnTo = null;
}
function formData() { return { reference_date: $('sf-date').value || null, reminder_enabled: $('sf-enabled').checked, months_before: Number($('sf-months').value) }; }
function preview() {
    if (!current) return;
    const input = formData(), known = current.fair.dates.includes(input.reference_date);
    $('sf-date-help').textContent = !current.fair.available ? 'Questa fiera non è più pubblicata. Puoi conservarla senza avviso o rimuoverla.' : known ? 'Data riportata nella scheda. Verifica sempre eventuali aggiornamenti.' : input.reference_date ? 'Data indicativa scelta da te: non è una conferma della prossima edizione.' : 'La prossima data non è pubblicata. Puoi salvare la fiera e, per il promemoria, scegliere una data indicativa.';
    $('sf-reminder-fields').hidden = !input.reminder_enabled;
    const error = validateReminder(input), target = reminderDate(input.reference_date, input.months_before);
    $('sf-preview').classList.toggle('sf-error', Boolean(error));
    $('sf-preview').textContent = !input.reminder_enabled ? 'La fiera sarà salvata senza inviare email.' : error || (current.saved?.sent_at && (input.reference_date === current.saved.reference_date || current.fair.kind === 'organizer') ? 'Il promemoria per questa edizione è già stato inviato. Non verrà ripetuto.' : 'Ti ricorderemo di controllare l’iscrizione il ' + dateLabel(target) + '.');
    $('sf-submit').textContent = input.reminder_enabled ? 'Salva fiera e promemoria' : current.saved ? 'Salva modifiche' : 'Salva fiera';
}
async function open(kind, id, trigger) {
    try {
        const value = await session();
        if (!value?.user) {
            if (!window.FiereAccess?.authenticate) throw Error('Accesso non disponibile. Ricarica la pagina.');
            window.FiereAccess.authenticate(() => open(kind, id, trigger), trigger, 'Registrati gratis o accedi per salvare questa fiera e scegliere quando ricevere il promemoria.'); return;
        }
        initDialog();
        if (!dialog.open) { parents = [...document.querySelectorAll('dialog[open]')]; parents.forEach(parent => parent.close()); returnTo = trigger; dialog.showModal(); }
        const attempt = ++opening, version = epoch; current = null;
        $('sf-form').hidden = true; $('sf-loading').hidden = false; $('sf-loading').textContent = 'Caricamento della fiera…'; $('sf-error').hidden = true;
        const result = await api('?kind=' + encodeURIComponent(kind) + '&id=' + encodeURIComponent(id));
        if (attempt !== opening || version !== epoch || !dialog.open) return;
        current = result;
        locked(false);
        if (result.saved) rows.set(key(kind, id), result.saved);
        else rows.delete(key(kind, id));
        refreshButtons(); render();
        $('sf-name').textContent = result.fair.name + ' · ' + result.fair.city;
        $('sf-date').value = result.saved?.reference_date || result.fair.dates[0] || '';
        $('sf-months').value = String(result.saved?.months_before || 5);
        $('sf-enabled').checked = Boolean(result.saved?.reminder_enabled && result.fair.available);
        $('sf-enabled').disabled = !result.fair.available;
        $('sf-remove').hidden = !result.saved;
        $('sf-date-options').replaceChildren(new Option('Scegli una data', ''));
        result.fair.dates.forEach(date => $('sf-date-options').append(new Option(dateLabel(date), date)));
        $('sf-date-options-label').hidden = result.fair.dates.length < 2;
        $('sf-loading').hidden = true; $('sf-form').hidden = false; preview(); $('sf-enabled').focus();
    } catch (error) {
        if (error.status === 401 && window.FiereAccess?.authenticate) {
            close(true);
            window.FiereAccess.authenticate(() => open(kind, id, trigger), trigger, 'La sessione è scaduta. Accedi per gestire questa fiera e il suo promemoria.');
            return;
        }
        if (dialog?.open) { $('sf-loading').hidden = false; $('sf-loading').textContent = error.message; }
        else announce(error.message, true);
    }
}
function locked(value) {
    busy = value;
    dialog.querySelectorAll('input,select,button').forEach(control => { control.disabled = value || (control.id === 'sf-enabled' && current && !current.fair.available); });
    $('sf-form').setAttribute('aria-busy', String(value));
}
async function save(event) {
    event.preventDefault(); if (busy || !current) return;
    const input = formData(), error = validateReminder(input);
    if (error) { $('sf-error').textContent = error; $('sf-error').hidden = false; $('sf-error').scrollIntoView({ block: 'nearest' }); (input.reference_date ? $('sf-months') : $('sf-date')).focus(); return; }
    const version = epoch, source = current; locked(true); $('sf-error').hidden = true; $('sf-submit').textContent = 'Salvataggio…';
    try {
        const result = await api('', { action: 'save', kind: source.fair.kind, fair_id: source.fair.id, revision: source.saved?.revision || 0, ...input });
        if (version !== epoch) return;
        rows.set(key(source.fair.kind, source.fair.id), result.saved); loaded = true; refreshButtons(); render();
        locked(false); close(); announce(input.reminder_enabled ? 'Fiera salvata. Promemoria impostato per il ' + dateLabel(result.saved.remind_on) + '.' : 'Fiera salvata senza promemoria email.');
    } catch (failure) {
        if (version !== epoch) return;
        $('sf-error').textContent = failure.message; $('sf-error').hidden = false;
    } finally { if (version === epoch) { locked(false); if (current) preview(); } else busy = false; }
}
async function remove() {
    if (busy || !current?.saved) return;
    const source = current, version = epoch; locked(true); $('sf-error').hidden = true;
    try {
        await api('', { action: 'remove', id: source.saved.id, revision: source.saved.revision });
        if (version !== epoch) return;
        rows.delete(key(source.fair.kind, source.fair.id)); refreshButtons(); render(); locked(false); close(); announce('Fiera rimossa. Il suo promemoria è stato disattivato.');
    } catch (error) { if (version === epoch) { $('sf-error').textContent = error.message; $('sf-error').hidden = false; } }
    finally { if (version === epoch) locked(false); else busy = false; }
}
document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-save-fair]'); if (!trigger) return;
    event.preventDefault(); open(trigger.dataset.fairKind, trigger.dataset.fairId, trigger);
});
window.SavedFairs = { load, render, start(value) { identity({ user: value }); if (userId) load(); },
    setFair(button, kind, id) { if (!button) return; button.dataset.fairKind = kind; button.dataset.fairId = id; refreshButtons(); } };
try {
    _supabase.auth.onAuthStateChange((_event, value) => { const before = userId; identity(value); if (before !== userId && userId) setTimeout(() => load(), 0); });
    session().then(value => { if (value?.user) load(); }).catch(() => {});
} catch (_) { /* Clicks report unavailable authentication without saving anything. */ }
refreshButtons();
