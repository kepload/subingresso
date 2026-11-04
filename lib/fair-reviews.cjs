const { byId } = require('../api/_fiere');
const DB = 'https://mhfbtltgwibwmsudsuvf.supabase.co';
const KEY = 'sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';
const SECTORS = ['alimentare', 'abbigliamento', 'artigianato', 'casa', 'altro'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
class RequestError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
async function rpc(name, data, bearer = 'Bearer ' + KEY) {
    const response = await fetch(DB + '/rest/v1/rpc/' + name, { method: 'POST', headers: { apikey: KEY, Authorization: bearer, 'Content-Type': 'application/json' }, body: JSON.stringify(data), signal: AbortSignal.timeout(8000) });
    const result = await response.json();
    if (response.ok) return result;
    if (response.status === 401 || result.code === '42501') throw new RequestError('Registrati o accedi per pubblicare.', 401);
    if (result.code === '23505') throw new RequestError('Hai già recensito questa edizione. Puoi lasciare una nuova recensione per un altro anno.', 409);
    if (result.code === 'P0001') throw new RequestError('Hai già pubblicato molte recensioni oggi. Riprova domani.', 429);
    if (result.code === '22023') throw new RequestError(result.message);
    if (['23514','23502','22P02','22007','22008','22003'].includes(result.code)) throw new RequestError('Controlla i campi della recensione.');
    throw new RequestError('Recensioni momentaneamente non disponibili. Riprova tra poco.', 503);
}
function validate(data) {
    const currentMonth = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit' }).format(new Date());
    if (!/^20\d{2}-(0[1-9]|1[0-2])-01$/.test(data.visit_month || '') || data.visit_month.slice(0,7) > currentMonth) return 'Scegli un mese di partecipazione già trascorso o quello attuale.';
    if (!SECTORS.includes(data.sector)) return 'Scegli il settore del tuo banco.';
    if (!Number.isInteger(data.rating) || data.rating < 1 || data.rating > 5) return 'Scegli una valutazione da 1 a 5.';
    for (const field of ['organization','turnout','value']) if (data[field] != null && (!Number.isInteger(data[field]) || data[field] < 1 || data[field] > 5)) return 'Controlla le valutazioni di dettaglio.';
    if (typeof data.body !== 'string' || [...data.body.trim()].length < 40 || [...data.body.trim()].length > 2000) return 'Scrivi da 40 a 2.000 caratteri sulla tua esperienza.';
    if (!['yes','maybe','no'].includes(data.recommend)) return 'Indica se consiglieresti questa fiera.';
    if (data.confirmed !== true) return 'Conferma di aver partecipato con il tuo banco.';
    return '';
}
module.exports = async function handler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    if (!['GET','POST'].includes(req.method)) { res.setHeader('Allow','GET, POST'); return res.status(405).json({error:'Metodo non consentito.'}); }
    try {
        const body = req.method === 'POST' ? typeof req.body === 'string' ? JSON.parse(req.body) : req.body : req.query;
        if (!body || JSON.stringify(body).length > 15000) throw new RequestError('Richiesta non valida.');
        const kind = body.kind, id = req.method === 'POST' ? body.fair_id : body.id;
        if (kind === 'catalog') { if (!byId.has(id)) throw new RequestError('Fiera non disponibile.',404); }
        else if (kind === 'organizer' && UUID.test(id || '')) {
            if (!(await rpc('published_organizer_events',{p_id:id}))[0]) throw new RequestError('Evento non disponibile.',404);
        } else throw new RequestError('Fiera non valida.',404);
        if (req.method === 'GET') {
            const offset = body.offset == null ? 0 : Number(body.offset);
            if (!Number.isInteger(offset) || offset < 0 || offset > 10000) throw new RequestError('Pagina non valida.');
            return res.status(200).json(await rpc('read_fair_reviews',{p_kind:kind,p_id:id,p_offset:offset}));
        }
        const bearer = req.headers?.authorization;
        if (typeof bearer !== 'string' || !/^Bearer \S+$/i.test(bearer)) throw new RequestError('Registrati o accedi per pubblicare.',401);
        const error = validate(body); if (error) throw new RequestError(error);
        const auth = await fetch(DB + '/auth/v1/user',{headers:{apikey:KEY,Authorization:bearer},signal:AbortSignal.timeout(8000)});
        if ([401,403].includes(auth.status)) throw new RequestError('Accedi di nuovo. La tua bozza è conservata.',401);
        if (!auth.ok) throw new RequestError('Impossibile verificare l’accesso. Riprova.',503);
        if (!(await auth.json())?.id) throw new RequestError('Accedi per pubblicare.',401);
        const review = await rpc('publish_fair_review',{p_data:{kind,fair_id:id,visit_month:body.visit_month,sector:body.sector,rating:body.rating,organization:body.organization ?? null,turnout:body.turnout ?? null,value:body.value ?? null,body:body.body.trim(),recommend:body.recommend,confirmed:true}},bearer);
        return res.status(201).json({review});
    } catch (error) {
        const status = error instanceof SyntaxError ? 400 : error.status || 503;
        return res.status(status).json({error:status === 503 ? 'Recensioni momentaneamente non disponibili. La tua bozza resta disponibile: riprova.' : error instanceof SyntaxError ? 'Richiesta non valida.' : error.message});
    }
};
module.exports.validate = validate;
