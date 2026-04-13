// ============================================================
//  Subingresso.it — Moderazione automatica con Gemini AI
// ============================================================

const GEMINI_API_KEY = window.ENV_GEMINI_API_KEY || ''; // Caricata dinamicamente

const _GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// ── RATE LIMITER (Protezione portafoglio) ────────────────
let _modCalls = [];
function _checkRateLimit() {
    const now = Date.now();
    _modCalls = _modCalls.filter(t => now - t < 60000); // Tieni solo chiamate dell'ultimo minuto
    if (_modCalls.length >= 5) return false; // Max 5 chiamate al minuto per utente
    _modCalls.push(now);
    return true;
}

/**
 * Analizza un annuncio e restituisce:
 *   { status: 'active' | 'pending' | 'rejected', reason: string }
 */
window.moderaAnnuncio = async function (dati) {

    // 1. Rate Limit Check
    if (!_checkRateLimit()) {
        return { status: 'pending', reason: 'Troppe richieste. Riprova tra un minuto.' };
    }

    // Se chiave non configurata, pubblica direttamente senza moderazione
    if (!GEMINI_API_KEY || GEMINI_API_KEY === 'LA-TUA-CHIAVE-QUI') {
        return { status: 'active', reason: 'Moderazione non configurata.' };
    }

    // 2. Tronca descrizione (risparmio token)
    const descrBreve = (dati.descrizione || '').slice(0, 1000);

    const prompt = `Sei il moderatore di Subingresso.it. Analizza e rispondi SOLO JSON: {"status":"active"|"pending"|"rejected","reason":"..."}

Dati:
Titolo: ${dati.titolo}
Prezzo: €${dati.prezzo}
Descrizione: ${descrBreve}

Regole:
- active: pertinente (posteggi mercati/fiere), prezzo realistico.
- pending: vago o sospetto.
- rejected: spam, scarpe/vestiti (non concessioni), truffe, offese, prezzi < 100€ (tranne affitti).`;

    try {
        const res = await fetch(_GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 120
                }
            })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

        // Estrai JSON anche se Gemini aggiunge testo extra
        const match = text.match(/\{[^}]+\}/);
        if (!match) throw new Error('Risposta non valida');

        const parsed = JSON.parse(match[0]);

        // Sanity check sul valore di status
        if (!['active', 'pending', 'rejected'].includes(parsed.status)) {
            parsed.status = 'pending';
        }

        return parsed;

    } catch (err) {
        // Se l'API fallisce per qualsiasi motivo, mettiamo in pending
        // (non blocchiamo l'utente, ma l'annuncio aspetta revisione)
        console.warn('Moderazione AI non disponibile, annuncio in pending:', err.message);
        return {
            status: 'pending',
            reason: 'Verifica automatica temporaneamente non disponibile. L\'annuncio sarà revisionato a breve.'
        };
    }
};
