const { byId } = require('./_fiere');
const DB = 'https://mhfbtltgwibwmsudsuvf.supabase.co';
const KEY = 'sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
class RequestError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
const esc = value => String(value || '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
async function rpc(name, data, bearer) {
    const response = await fetch(DB + '/rest/v1/rpc/' + name, {
        method: 'POST', headers: { apikey: KEY, Authorization: bearer, 'Content-Type': 'application/json' },
        body: JSON.stringify(data), signal: AbortSignal.timeout(8000)
    });
    const result = await response.json();
    if (!response.ok) {
        if (response.status === 401 || result.code === '42501') throw new RequestError('Accedi per gestire le tue fiere.', 401);
        if (result.code === '40001') throw new RequestError('La fiera è stata modificata altrove. Riapri e riprova.', 409);
        if (['22023', '22007', '22008', '22P02', '23514'].includes(result.code)) throw new RequestError(result.code === '22023' ? result.message : 'Controlla la data e i mesi del promemoria.');
        throw new RequestError('Impossibile aggiornare le fiere salvate. Riprova tra poco.', 503);
    }
    return result;
}
async function loadFair(kind, id, bearer, model) {
    if (kind === 'catalog') {
        const event = byId.get(id);
        return event ? { ...model.fairMetadata(event, kind), available: true } : null;
    }
    if (kind !== 'organizer' || !UUID.test(id || '')) return null;
    const list = await rpc('published_organizer_events', { p_id: id }, bearer);
    return list?.[0] ? { ...model.fairMetadata(list[0], kind), available: true } : null;
}
function unsubscribePage(token, message = '') {
    return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Promemoria fiera — Subingresso.it</title><style>body{font:16px/1.6 system-ui;margin:0;padding:24px;background:#f3f6fa;color:#17324f}main{max-width:520px;margin:10vh auto;background:white;border:1px solid #dae2eb;border-radius:18px;padding:26px}h1{font-size:25px}button{background:#194c82;color:white;border:0;border-radius:9px;padding:13px 18px;font:inherit;cursor:pointer}a{color:#194c82}</style></head><body><main><a href="/">Subingresso.it</a><h1>Promemoria della fiera</h1>${message ? `<p role="status">${esc(message)}</p>` : `<p>Vuoi disattivare il promemoria collegato a questa email? La fiera resterà tra quelle salvate.</p><form method="post" action="/api/saved-fairs?unsubscribe=${esc(token)}"><button type="submit">Disattiva questo promemoria</button></form>`}<p><a href="/dashboard?area=normale#fiere">Gestisci le mie fiere →</a></p></main></body></html>`;
}
module.exports = async function handler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Vary', 'Authorization');
    res.setHeader('X-Robots-Tag', 'noindex');
    const token = typeof req.query?.unsubscribe === 'string' ? req.query.unsubscribe : '';
    if (token) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        if (!UUID.test(token)) return res.status(400).send(unsubscribePage('', 'Collegamento non valido. Puoi gestire gli avvisi dal tuo profilo.'));
        if (req.method === 'GET') return res.status(200).send(unsubscribePage(token));
        if (req.method !== 'POST') return res.status(405).send(unsubscribePage('', 'Usa il pulsante di conferma.'));
        try {
            const response = await fetch(DB + '/functions/v1/fair-reminders', {
                method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'unsubscribe', token }), signal: AbortSignal.timeout(12000)
            });
            if (!response.ok) throw new Error('Unavailable');
            return res.status(200).send(unsubscribePage('', 'Promemoria disattivato. Nessun altro avviso verrà inviato per questa scelta.'));
        } catch (_) { return res.status(503).send(unsubscribePage('', 'Impossibile disattivare il promemoria. Riprova o apri le tue fiere nel profilo.')); }
    }
    if (!['GET', 'POST'].includes(req.method)) { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'Metodo non consentito.' }); }
    const bearer = req.headers?.authorization;
    if (typeof bearer !== 'string' || !/^Bearer \S+$/i.test(bearer)) return res.status(401).json({ error: 'Registrati o accedi per salvare la fiera.' });
    try {
        const auth = await fetch(DB + '/auth/v1/user', { headers: { apikey: KEY, Authorization: bearer }, signal: AbortSignal.timeout(8000) });
        if ([401, 403].includes(auth.status)) throw new RequestError('Accedi per gestire le tue fiere.', 401);
        if (!auth.ok) throw new RequestError('Impossibile verificare l’accesso. Riprova.', 503);
        if (!(await auth.json())?.id) throw new RequestError('Accedi per gestire le tue fiere.', 401);
        const model = await import('../js/fair-reminder-model.mjs');
        if (req.method === 'GET') {
            const rows = await rpc('my_saved_fairs', {}, bearer);
            const kind = req.query?.kind, id = req.query?.id;
            if (!kind && !id) return res.status(200).json({ saved: rows });
            const saved = rows.find(row => row.fair_kind === kind && row.fair_id === id) || null;
            const fair = await loadFair(kind, id, bearer, model) || (saved ? { kind, id, name: saved.fair_name, city: saved.city, dates: [], path: model.fairPath(kind, id), available: false } : null);
            if (!fair) throw new RequestError('Questa fiera non è più disponibile.', 404);
            return res.status(200).json({ fair, saved });
        }
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        if (body?.action === 'remove') {
            if (!UUID.test(body.id || '') || !Number.isInteger(body.revision)) throw new RequestError('Richiesta non valida.');
            await rpc('remove_saved_fair', { p_id: body.id, p_expected_revision: body.revision }, bearer);
            return res.status(200).json({ removed: true });
        }
        if (body?.action !== 'save' || !Number.isInteger(body.revision) || typeof body.reminder_enabled !== 'boolean') throw new RequestError('Richiesta non valida.');
        const error = model.validateReminder(body);
        if (error) throw new RequestError(error);
        let fair = await loadFair(body.kind, body.fair_id, bearer, model);
        if (!fair && !body.reminder_enabled) {
            const rows = await rpc('my_saved_fairs', {}, bearer), saved = rows.find(row => row.fair_kind === body.kind && row.fair_id === body.fair_id);
            if (saved) fair = { name: saved.fair_name, city: saved.city, dates: [] };
        }
        if (!fair) throw new RequestError('Questa fiera non è più disponibile. Puoi rimuoverla dalle fiere salvate.', 404);
        const saved = await rpc('save_fair', { p_expected_revision: body.revision, p_data: {
            fair_kind: body.kind, fair_id: body.fair_id, fair_name: fair.name, city: fair.city,
            reference_date: body.reference_date || null, date_origin: fair.dates.includes(body.reference_date) ? 'published' : 'personal',
            reminder_enabled: body.reminder_enabled, months_before: Number.isInteger(body.months_before) ? body.months_before : 5
        } }, bearer);
        return res.status(200).json({ saved });
    } catch (error) {
        const status = error instanceof SyntaxError ? 400 : error.status || 503;
        return res.status(status).json({ error: status === 503 ? 'Servizio momentaneamente non disponibile. Riprova tra poco.' : error instanceof SyntaxError ? 'Richiesta non valida.' : error.message });
    }
};
