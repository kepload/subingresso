const { byId } = require('./_fiere');
const DB = 'https://mhfbtltgwibwmsudsuvf.supabase.co';
const KEY = 'sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';

// Only documentary URLs belonging to this fair can be opened through the gate.
function sources(event) {
    return new Set([
        event.source?.url, event.calendarSource?.url, event.participation?.url,
        event.pricing?.sourceUrl,
        ...(event.editions || []).map(item => item.sourceUrl),
        event.attendance?.source?.url,
        ...(event.attendance?.additionalSources || []).map(item => item.url),
        ...(event.articleResearch?.sources || []).map(item => item.url)
    ].filter(url => typeof url === 'string' && /^https:\/\/[^/\s]+/i.test(url)));
}

module.exports = async function handler(req, res) {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('Vary', 'Authorization');
    res.setHeader('X-Robots-Tag', 'noindex');
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ error: 'Metodo non consentito.' });
    }
    const bearer = req.headers?.authorization;
    if (typeof bearer !== 'string' || !/^Bearer \S+$/i.test(bearer)) {
        return res.status(401).json({ error: 'Registrati o accedi per consultare la fonte.' });
    }
    try {
        const response = await fetch(DB + '/auth/v1/user', {
            headers: { apikey: KEY, Authorization: bearer }, signal: AbortSignal.timeout(8000)
        });
        if (response.status === 401 || response.status === 403) {
            return res.status(401).json({ error: 'Accedi per consultare la fonte.' });
        }
        if (!response.ok) throw new Error('Auth unavailable');
        const user = await response.json();
        if (!user?.id) return res.status(401).json({ error: 'Accedi per consultare la fonte.' });
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const event = typeof body?.id === 'string' ? byId.get(body.id) : null;
        if (!event || typeof body?.url !== 'string' || !sources(event).has(body.url)) {
            return res.status(404).json({ error: 'Fonte non disponibile per questa fiera.' });
        }
        return res.status(200).json({ url: body.url });
    } catch (error) {
        if (error instanceof SyntaxError) return res.status(400).json({ error: 'Richiesta non valida.' });
        return res.status(503).json({ error: 'Impossibile verificare l’accesso. Riprova tra poco.' });
    }
};
