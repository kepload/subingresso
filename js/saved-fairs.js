import { dateLabel, fairPath, reminderDate, todayInRome, validateReminder } from './fair-reminder-model.mjs?v=2';

let userId = null, epoch = 0, rows = new Map(), loaded = false, loading = null, dialog, current = null, opening = 0, busy = false;
let parents = [], returnTo = null;
const requests = new Set();
const pending = new Map(), clickLocks = new Set();
let changes = 0;
const $ = id => document.getElementById(id);
const key = (kind, id) => kind + ':' + id;
const element = (tag, className, text) => { const node = document.createElement(tag); node.className = className || ''; if (text !== undefined) node.textContent = text; return node; };
function identity(value) {
    const next = value?.user?.id || null;
    if (next === userId) return;
    epoch++; userId = next; rows.clear(); pending.clear(); loaded = false; loading = null; busy = false;
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
        const id = key(button.dataset.fairKind, button.dataset.fairId), operation = pending.get(id);
        const saved = operation ? operation.saved : rows.has(id);
        button.dataset.saved = String(saved);
        button.innerHTML = '<i class="' + (saved ? 'fas' : 'far') + ' fa-bookmark" aria-hidden="true"></i><span>' + (saved ? 'Salvata' : 'Salva') + '</span>';
        button.setAttribute('aria-pressed', String(saved));
        button.setAttribute('aria-label', saved ? 'Rimuovi la fiera dai salvati' : 'Salva la fiera');
        button.setAttribute('aria-busy', String(Boolean(operation)));
        button.disabled = Boolean(operation);
        button.removeAttribute('aria-haspopup');
    });
    document.querySelectorAll('[data-remind-fair]').forEach(button => {
        const id = key(button.dataset.fairKind, button.dataset.fairId), enabled = Boolean(rows.get(id)?.reminder_enabled);
        button.dataset.enabled = String(enabled);
        button.innerHTML = '<i class="' + (enabled ? 'fas' : 'far') + ' fa-bell" aria-hidden="true"></i><span>' + (enabled ? 'Avviso attivo' : 'Avvisami') + '</span>';
        button.setAttribute('aria-label', enabled ? 'Modifica il promemoria della fiera' : 'Scegli quanti mesi prima ricevere un avviso per la fiera');
        button.setAttribute('aria-haspopup', 'dialog');
        button.disabled = pending.has(id);
    });
    const badge = $('savedFairsBadge');
    if (badge) { badge.textContent = String(rows.size); badge.classList.toggle('hidden', !rows.size); }
}
async function load() {
    if (!userId) { render(); return; }
    if (loading) return loading;
    const version = epoch, snapshot = changes;
    loading = (async () => {
        try {
            const result = await api();
            if (version !== epoch) return;
            if (snapshot !== changes) { loading = null; return load(); }
            rows = new Map(result.saved.map(row => [key(row.fair_kind, row.fair_id), row]));
            loaded = true;
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
            if (['cancelled', 'failed', 'needs_review'].includes(row.delivery_status)) text = 'Promemoria sospeso: apri la campanella per verificare la data o le impostazioni.';
            else if (row.delivery_status === 'retry') text = 'Promemoria in coda. Riproveremo l’invio senza creare un secondo avviso.';
            else if (row.delivery_status === 'sending') text = 'Invio del promemoria in corso.';
        }
        card.append(element('p', '', text));
        const actions = element('div', 'sf-fair-actions');
        for (const action of ['saveFair', 'remindFair']) {
            const button = element('button', 'saved-fair-button'); button.type = 'button';
            button.dataset[action] = ''; button.dataset.fairKind = row.fair_kind; button.dataset.fairId = row.fair_id; actions.append(button);
        }
        card.append(actions); list.append(card);
    }
    refreshButtons();
}
function initDialog() {
    if (dialog) return;
    dialog = element('dialog', 'sf-dialog'); dialog.id = 'saved-fair-dialog'; dialog.setAttribute('aria-labelledby', 'sf-title');
    dialog.innerHTML = `<header><h2 id="sf-title">Promemoria della fiera</h2><button type="button" id="sf-close" class="sf-close" aria-label="Chiudi promemoria fiera">×</button></header><div id="sf-loading" class="sf-dialog-body" role="status">Caricamento della fiera…</div><form id="sf-form" novalidate hidden><p id="sf-name" class="sf-name"></p><label class="sf-check"><input id="sf-enabled" type="checkbox"><span>Ricevi un promemoria via email</span></label><div id="sf-reminder-fields"><label class="sf-field" for="sf-months">Quanti mesi prima della fiera?<input id="sf-months" type="number" min="2" max="120" step="1" inputmode="numeric" value="2"></label><div class="sf-presets" aria-label="Anticipo del promemoria"><button type="button" data-sf-months="2">2 mesi</button><button type="button" data-sf-months="3">3 mesi</button><button type="button" data-sf-months="5">5 mesi</button><button type="button" data-sf-months="6">6 mesi</button><button type="button" data-sf-months="12">12 mesi · 1 anno</button></div><label class="sf-field" for="sf-date">Data della fiera<input id="sf-date" type="date" name="reference_date"></label><label id="sf-date-options-label" class="sf-field" for="sf-date-options" hidden>Date presenti nella scheda<select id="sf-date-options"><option value="">Scegli una data</option></select></label><p id="sf-date-help" class="sf-help"></p></div><p id="sf-preview" class="sf-preview" role="status" aria-live="polite"></p><p class="sf-help">Da 2 mesi in su, anche un numero a tua scelta. Un solo avviso per l’edizione scelta, all’email del tuo account, per ricordarti di controllare come partecipare.</p><p id="sf-error" class="sf-error" role="alert" hidden></p><div class="sf-actions"><button id="sf-submit" type="submit" class="sf-button sf-button-primary">Attiva promemoria</button><button id="sf-remove" type="button" class="sf-button sf-button-danger" hidden>Rimuovi dai salvati</button><button id="sf-cancel" type="button" class="sf-button">Annulla</button></div><p><a class="sf-link" href="/dashboard?area=normale#fiere">Vai alle mie fiere →</a></p></form>`;
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
    $('sf-submit').textContent = input.reminder_enabled ? current.saved?.reminder_enabled ? 'Aggiorna promemoria' : 'Attiva promemoria' : current.saved?.reminder_enabled ? 'Disattiva promemoria' : 'Salva senza avviso';
}
async function open(kind, id, trigger) {
    let attempt, version;
    try {
        const value = await session();
        if (!value?.user) {
            if (!window.FiereAccess?.authenticate) throw Error('Accesso non disponibile. Ricarica la pagina.');
            window.FiereAccess.authenticate(() => open(kind, id, trigger), trigger, 'Registrati gratis o accedi per salvare questa fiera e scegliere quando ricevere il promemoria.'); return;
        }
        initDialog();
        if (!dialog.open) { parents = [...document.querySelectorAll('dialog[open]')]; parents.forEach(parent => parent.close()); returnTo = trigger; dialog.showModal(); }
        attempt = ++opening; version = epoch; current = null;
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
        $('sf-months').value = String(Math.max(2, result.saved?.months_before || 2));
        $('sf-enabled').checked = Boolean(result.fair.available);
        $('sf-enabled').disabled = !result.fair.available;
        $('sf-remove').hidden = !result.saved;
        $('sf-date-options').replaceChildren(new Option('Scegli una data', ''));
        result.fair.dates.forEach(date => $('sf-date-options').append(new Option(dateLabel(date), date)));
        $('sf-date-options-label').hidden = result.fair.dates.length < 2;
        $('sf-loading').hidden = true; $('sf-form').hidden = false; preview(); $('sf-months').focus();
    } catch (error) {
        if (attempt !== undefined && (attempt !== opening || version !== epoch)) return;
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
        changes++; rows.set(key(source.fair.kind, source.fair.id), result.saved); refreshButtons(); render();
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
        changes++; rows.delete(key(source.fair.kind, source.fair.id)); refreshButtons(); render(); locked(false); close(); announce('Fiera rimossa. Il suo promemoria è stato disattivato.');
    } catch (error) { if (version === epoch) { $('sf-error').textContent = error.message; $('sf-error').hidden = false; } }
    finally { if (version === epoch) locked(false); else busy = false; }
}
async function toggle(kind, id, trigger) {
    const idKey = key(kind, id), started = Date.now();
    if (clickLocks.has(idKey)) return;
    clickLocks.add(idKey);
    let version;
    try {
        const value = await session();
        if (!value?.user) {
            if (!window.FiereAccess?.authenticate) throw Error('Accesso non disponibile. Ricarica la pagina.');
            window.FiereAccess.authenticate(() => toggle(kind, id, trigger), trigger, 'Registrati gratis o accedi per salvare questa fiera. Gli avvisi si attivano separatamente dalla campanella.');
            return;
        }
        version = epoch;
        const desiredSaved = !rows.has(idKey);
        pending.set(idKey, { saved: desiredSaved }); refreshButtons();
        const source = await api('?kind=' + encodeURIComponent(kind) + '&id=' + encodeURIComponent(id));
        if (version !== epoch) return;
        changes++;
        if (source.saved) rows.set(idKey, source.saved); else rows.delete(idKey);
        refreshButtons();
        if (!desiredSaved) {
            if (source.saved) await api('', { action: 'remove', id: source.saved.id, revision: source.saved.revision });
            if (version !== epoch) return;
            changes++; rows.delete(idKey);
            announce('Fiera rimossa dai salvati. Eventuale promemoria disattivato.');
        } else if (!source.saved) {
            const result = await api('', { action: 'save', kind, fair_id: id, revision: 0, reminder_enabled: false, months_before: 2, reference_date: source.fair.dates[0] || null });
            if (version !== epoch) return;
            changes++; rows.set(idKey, result.saved);
            announce('Fiera salvata. Per ricevere un avviso, clicca sulla campanella.');
        } else announce('Fiera già salvata. Per il promemoria usa la campanella.');
    } catch (error) {
        if (version === undefined || version === epoch) {
            if (error.status === 401 && window.FiereAccess?.authenticate) {
                window.FiereAccess.authenticate(() => toggle(kind, id, trigger), trigger, 'La sessione è scaduta. Accedi per salvare questa fiera.');
                return;
            }
            announce(error.message, true);
            if (error.status === 409) load();
        }
    } finally {
        if (version !== undefined && Date.now() - started < 500) await new Promise(resolve => setTimeout(resolve, 500 - (Date.now() - started)));
        clickLocks.delete(idKey);
        if (version === epoch) { pending.delete(idKey); refreshButtons(); render(); }
    }
}
document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-save-fair],[data-remind-fair]'); if (!trigger) return;
    event.preventDefault();
    if (pending.has(key(trigger.dataset.fairKind, trigger.dataset.fairId))) return;
    (trigger.hasAttribute('data-remind-fair') ? open : toggle)(trigger.dataset.fairKind, trigger.dataset.fairId, trigger);
});
window.SavedFairs = { load, render, refresh: refreshButtons, start(value) { identity({ user: value }); if (userId) load(); },
    setFair(button, kind, id) { if (!button) return; (button.closest('.sf-fair-actions') || button.parentElement).querySelectorAll('[data-save-fair],[data-remind-fair]').forEach(control => { control.dataset.fairKind = kind; control.dataset.fairId = id; }); refreshButtons(); } };
try {
    _supabase.auth.onAuthStateChange((_event, value) => { const before = userId; identity(value); if (before !== userId && userId) setTimeout(() => load(), 0); });
    session().then(value => { if (value?.user) load(); }).catch(() => {});
} catch (_) { /* Clicks report unavailable authentication without saving anything. */ }
refreshButtons();
