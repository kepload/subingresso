/* Valutazione indicativa v2. Ipotesi di modello, NON prezzi di compravendite.
 * Importabile anche in Node per verificare i casi limite.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.PosteggioValuation = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const VERSION = '2.0';
    const choices = {
        baseIncasso: ['giorno', 'anno'], frequenza: ['settimanale', 'giornaliero', 'fiera'],
        zona: ['mare_lago', 'turistica', 'interna'], clientela: ['residenti', 'mista', 'turisti', 'non_so'],
        passaggio: ['alto', 'medio', 'laterale', 'non_so'], posizione: ['angolare', 'linea'],
        sole: ['riparato', 'frontale', 'variabile', 'non_so'], settore: ['alimentare', 'non_alimentare'],
        concessione: ['stabile', 'breve', 'non_so', 'temporanea']
    };
    const labels = {
        zona: { mare_lago: 'Mare o lago', turistica: 'Altra zona turistica', interna: 'Città, paese o quartiere' },
        clientela: { residenti: 'Soprattutto persone del posto', mista: 'Persone del posto e turisti', turisti: 'Soprattutto turisti', non_so: 'Non so' },
        passaggio: { alto: 'Passaggio principale', medio: 'Passaggio regolare', laterale: 'Zona laterale', non_so: 'Non so' },
        posizione: { angolare: 'Angolo o testata, con due lati di vendita', linea: 'In fila, con un lato di vendita' },
        sole: { riparato: 'Merce riparata / sole dietro', frontale: 'Sole davanti: devo coprire la merce', variabile: 'Solo per una parte della giornata', non_so: 'Non so' },
        settore: { alimentare: 'Alimentare', non_alimentare: 'Non alimentare' },
        frequenza: { settimanale: 'Settimanale', giornaliero: 'Più giorni a settimana', fiera: 'Fiera / evento' },
        concessione: { stabile: 'Almeno 3 anni, verificati', breve: 'Meno di 3 anni', non_so: 'Scadenza da verificare', temporanea: 'Solo questa fiera / assegnazione giornaliera' }
    };
    // Accetta importi italiani e decimali con punto; rifiuta esponenti,
    // suffissi, segni, separatori ambigui e valori non finiti.
    function parseMoney(raw) {
        if (typeof raw === 'number') return Number.isFinite(raw) && raw >= 0 && Math.abs(raw * 100 - Math.round(raw * 100)) < 1e-6 ? raw : NaN;
        if (typeof raw !== 'string') return NaN;
        let s = raw.trim().replace(/^€\s*/, '').replace(/[\u00a0\u202f ]/g, '');
        if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
        else if (/^\d+(,\d{1,2})?$/.test(s)) s = s.replace(',', '.');
        else if (!/^\d+\.\d{1,2}$/.test(s)) return NaN;
        const n = Number(s);
        return Number.isFinite(n) && n >= 0 ? n : NaN;
    }
    function validate(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Compila i dati del posteggio.');
        const d = {};
        Object.keys(choices).forEach(k => {
            if (!choices[k].includes(input[k])) throw new Error('Scegli una risposta per ogni domanda.');
            d[k] = input[k];
        });
        d.incasso = parseMoney(input.incasso);
        d.giornate = Number(input.giornate);
        if (!Number.isInteger(d.giornate) || d.giornate < 1 || d.giornate > 366) throw new Error('Inserisci da 1 a 366 giornate effettive all’anno.');
        if (d.frequenza === 'settimanale' && d.giornate > 53) throw new Error('Per un posteggio settimanale inserisci al massimo 53 giornate all’anno.');
        if (!Number.isFinite(d.incasso) || d.incasso <= 0 || d.incasso > (d.baseIncasso === 'giorno' ? 50000 : 2000000)) throw new Error('Controlla l’incasso: usa solo l’importo di questo posteggio.');
        d.fatturato = d.baseIncasso === 'giorno' ? d.incasso * d.giornate : d.incasso;
        if (d.fatturato < 100 || d.fatturato > 2000000 || d.fatturato / d.giornate > 50000) throw new Error('Incasso e giornate non sono coerenti. Controlla gli importi.');
        const hasProfit = input.utileGiorno != null && String(input.utileGiorno).trim() !== '';
        d.utileGiorno = hasProfit ? parseMoney(input.utileGiorno) : null;
        if (hasProfit && (!Number.isFinite(d.utileGiorno) || d.utileGiorno > d.fatturato / d.giornate)) throw new Error('Quello che resta dopo le spese non può superare l’incasso giornaliero.');
        d.mesiResidui = d.concessione === 'breve' ? Number(input.mesiResidui) : null;
        if (d.concessione === 'breve' && (!Number.isInteger(d.mesiResidui) || d.mesiResidui < 1 || d.mesiResidui > 35)) throw new Error('Indica da 1 a 35 mesi residui di concessione.');
        d.anniResidui = d.mesiResidui === null ? null : d.mesiResidui / 12;
        return d;
    }
    function estimate(input) {
        const d = validate(input);
        const knownProfit = d.utileGiorno !== null;
        const surplus = knownProfit ? d.utileGiorno * d.giornate : d.fatturato * 0.20;
        const notes = ['Stima indicativa: coefficienti prudenziali ancora da calibrare su vendite concluse. Merce, furgone e attrezzature esclusi.'];
        if (d.concessione === 'temporanea') return { version: VERSION, input: d, status: 'non_stimabile', notes: ['Un’assegnazione temporanea non prova un diritto cedibile. Verifica il titolo con il Comune prima di stimare una cessione.'] };
        const base = knownProfit ? Math.min(surplus * 2.5, d.fatturato * 0.9) : d.fatturato * 0.5;
        // Frequenza, stagione, settore e anzianità NON moltiplicano nuovamente
        // ricavi già annualizzati. Turismo da solo non garantisce acquisti.
        const tourism = d.zona !== 'interna' && d.clientela === 'mista' ? 1.05 : 1;
        const flow = { alto: 1.1, medio: 1, laterale: 0.85, non_so: 1 }[d.passaggio];
        const frontage = d.posizione === 'angolare' ? 1.05 : 1;
        const adjustment = Math.min(1.3, Math.max(0.7, tourism * flow * frontage));
        const sun = { riparato: 1, frontale: 0.9, variabile: 0.95, non_so: 1 }[d.sole];
        const certainty = d.concessione === 'non_so' ? 0.85 : 1;
        let value = base * adjustment * certainty;
        let horizonCap = Infinity;
        if (d.concessione === 'breve') {
            horizonCap = surplus * (1 - Math.pow(1.15, -d.anniResidui)) / 0.15;
            value = Math.min(value, horizonCap);
            notes.push('Valore limitato agli anni residui dichiarati; nessun rinnovo automatico ipotizzato.');
        }
        value *= sun;
        horizonCap *= sun;
        const unknowns = ['clientela', 'passaggio', 'sole'].filter(k => d[k] === 'non_so').length;
        const uncertainty = Math.min(0.55, (knownProfit ? 0.25 : 0.35) + unknowns * 0.05 + (d.clientela === 'turisti' ? 0.05 : 0) + (d.concessione === 'non_so' ? 0.1 : 0));
        const stable = n => Math.round(n * 1e6) / 1e6;
        value = stable(value);
        const min = Math.floor(stable(value * (1 - uncertainty)));
        const max = Math.ceil(stable(Math.min(value * (1 + uncertainty), horizonCap)));
        const avg = Math.round(value);
        const rent = Math.floor(stable(Math.min(value * 0.18, surplus * 0.30)));
        if (!knownProfit) notes.push('Spese non indicate: la fascia è più ampia. Il canone usa un margine ipotetico del 20% degli incassi.');
        if (knownProfit && surplus === 0) notes.push('Con quanto dichiarato non resta un margine: non stimiamo un avviamento positivo. Eventuali beni vanno valutati a parte.');
        if (d.concessione === 'non_so') notes.push('Scadenza e possibilità di subingresso da verificare al SUAP.');
        if (d.clientela === 'turisti') notes.push('Usa la media di tutta la stagione, comprese le giornate deboli.');
        const impacts = [
            { label: 'Clientela mista in zona turistica', delta: Math.round((tourism - 1) * 100) },
            { label: labels.passaggio[d.passaggio], delta: Math.round((flow - 1) * 100) },
            { label: labels.posizione[d.posizione], delta: Math.round((frontage - 1) * 100) },
            { label: labels.sole[d.sole], delta: Math.round((sun - 1) * 100) },
            { label: labels.concessione[d.concessione], delta: Math.round((certainty - 1) * 100) }
        ];
        return { version: VERSION, status: 'ok', input: d, base: Math.round(base), surplus: Math.round(surplus), knownProfit, min, avg, max, rent,
            monthly: Math.round(rent / 12), roi: avg > 0 ? Math.round(rent / avg * 1000) / 10 : 0, uncertainty, impacts, notes };
    }
    return { VERSION, choices, labels, parseMoney, validate, estimate };
});
