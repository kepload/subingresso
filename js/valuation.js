/* Valutazione indicativa v2.7. Ipotesi commerciali, non prezzi di vendite concluse.
 * Modelli storici mantenuti separati per conservare i report originali.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('./valuation-legacy.js'));
    else root.PosteggioValuation = factory(root.PosteggioValuationLegacy);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (legacy) {
    'use strict';
    const VERSION = '2.7';
    const referenceDays = 50;
    // Le ancore 100/200 sono richieste dall'utente. Le altre sono ipotesi di
    // raccordo da riesaminare: non prezzi osservati o coefficienti di una perizia.
    const revenues = [0, 100, 200, 340, 400, 580, 1000];
    const weakValues = [1000, 3000, 10000, 20400, 24000, 40000, 74000];
    const strongValues = [1000, 5000, 15000, 28250, 33500, 50000, 95000];
    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
    // Interpolazione cubica monotona PCHIP: nessun overshoot tra le ancore.
    function curve(values) {
        // Interpolare il valore per euro di incasso mantiene crescente anche
        // l'efficienza: a incasso annuo invariato, meno giornate non valgono meno.
        values = values.map((v, i) => revenues[i] === 0 ? 0 : (v - 1000) / revenues[i]);
        const n = revenues.length, h = [], delta = [], slope = [];
        for (let i = 0; i < n - 1; i++) {
            h[i] = revenues[i + 1] - revenues[i];
            delta[i] = (values[i + 1] - values[i]) / h[i];
        }
        function endpoint(h0, h1, d0, d1) {
            const m = ((2 * h0 + h1) * d0 - h0 * d1) / (h0 + h1);
            return Math.sign(m) !== Math.sign(d0) ? 0 : Math.min(m, 3 * d0);
        }
        slope[0] = endpoint(h[0], h[1], delta[0], delta[1]);
        slope[n - 1] = endpoint(h[n - 2], h[n - 3], delta[n - 2], delta[n - 3]);
        for (let i = 1; i < n - 1; i++) {
            const w1 = 2 * h[i] + h[i - 1], w2 = h[i] + 2 * h[i - 1];
            slope[i] = delta[i - 1] * delta[i] <= 0 ? 0 : (w1 + w2) / (w1 / delta[i - 1] + w2 / delta[i]);
        }
        return value => {
            const x = clamp(value, revenues[0], revenues[n - 1]);
            let i = n - 2;
            for (let j = 0; j < n - 1; j++) if (x <= revenues[j + 1]) { i = j; break; }
            const t = (x - revenues[i]) / h[i], t2 = t * t, t3 = t2 * t;
            const rate = (2 * t3 - 3 * t2 + 1) * values[i] + (t3 - 2 * t2 + t) * h[i] * slope[i]
                + (-2 * t3 + 3 * t2) * values[i + 1] + (t3 - t2) * h[i] * slope[i + 1];
            return 1000 + x * rate;
        };
    }
    const weakCurve = curve(weakValues), strongCurve = curve(strongValues);
    function daysFactor(days, daily) {
        // A 100/giorno conta soprattutto quante giornate si lavorano; con incassi
        // elevati una stagione corta conserva una quota maggiore dell'avviamento.
        // Nessun premio sopra il riferimento di 50: il fattore resta <=1 fino a 50.
        const exponent = daily <= 100 ? 1 : daily < 200 ? 1 - (daily - 100) * 0.0025
            : daily < 400 ? 0.75 - (daily - 200) * 0.00275 : 0.20;
        return days <= referenceDays ? Math.pow(days / referenceDays, exponent)
            : 1 + Math.log(days / referenceDays);
    }
    function estimate(input, version = VERSION) {
        if (version !== VERSION) return legacy.estimate(input, version);
        const d = legacy.validate(input);
        if (d.concessione === 'temporanea') return {version:VERSION, input:d, status:'non_stimabile', notes:['Un’assegnazione temporanea non prova un diritto cedibile. Verifica il titolo con il Comune prima di stimare una cessione.']};
        const daily = d.fatturato / d.giornate;
        if (daily > 1000 || d.fatturato > 250000) return {version:VERSION, input:d, status:'da_verificare',
            notes:['Per questi incassi serve una valutazione specifica, con spese e margini verificati.']};
        if (d.concessione === 'breve') return {version:VERSION, input:d, status:'da_verificare',
            notes:['Con una scadenza così vicina serve valutare il periodo residuo prima di indicare un prezzo.']};
        if (d.utileGiorno !== null && d.utileGiorno * d.giornate <= 200) return {version:VERSION, input:d, status:'da_verificare',
            notes:['Con questo margine non possiamo stimare un avviamento attendibile. Il valore del titolo e degli eventuali beni va verificato a parte.']};
        const quality = clamp(({laterale:0, medio:0.5, alto:1, non_so:0.5}[d.passaggio]) * 0.8
            + (d.zona !== 'interna' && d.clientela === 'mista' ? 0.2 : 0)
            + (d.posizione === 'angolare' ? 0.1 : 0), 0, 1);
        const weak = weakCurve(daily), strong = strongCurve(daily);
        const value50 = weak + quality * (strong - weak);
        const sector = d.settore === 'alimentare' ? 1.3 : 1;
        const sun = {riparato:1, frontale:0.95, variabile:0.98, non_so:1}[d.sole];
        const certainty = d.concessione === 'non_so' ? 0.85 : 1;
        const knownProfit = d.utileGiorno !== null;
        const surplus = knownProfit ? d.utileGiorno * d.giornate : d.fatturato * 0.20;
        // La media delle giornate non sostituisce gli incassi dell'intero anno.
        const effectiveDays = referenceDays * daysFactor(d.giornate, daily);
        let value = 1000 + (value50 - 1000) * effectiveDays / referenceDays * sector * sun * certainty;
        const beforeProfit = value;
        if (knownProfit) value = 1000 + Math.min((value - 1000) * 1.5,
            Math.sqrt(Math.max(0, value - 1000) * Math.max(0, 5 * surplus - 1000)));
        const caps = [{reason:'due volte gli incassi annui', value:Math.max(1000, 2 * d.fatturato)}];
        if (knownProfit) caps.push({reason:'cinque annualità del margine dichiarato', value:Math.max(1000, 5 * surplus)});
        if (d.anniResidui !== null) caps.push({reason:'durata residua dichiarata', value:Math.max(1000, surplus * (1 - Math.pow(1.15, -d.anniResidui)) / 0.15)});
        const cap = Math.floor(Math.min(...caps.map(c => c.value)));
        const uncapped = value;
        value = Math.max(1000, Math.min(value, cap));
        const unknowns = ['passaggio', 'clientela', 'sole'].filter(k => d[k] === 'non_so').length;
        const uncertainty = Math.min(0.55, (knownProfit ? 0.25 : 0.35) + unknowns * 0.05
            + (d.clientela === 'turisti' ? 0.05 : 0) + (d.concessione === 'non_so' ? 0.1 : 0));
        const stable = v => Math.round(v * 1e6) / 1e6;
        value = stable(value);
        const min = Math.floor(stable(1000 + (value - 1000) * (1 - uncertainty)));
        const max = Math.ceil(stable(Math.min(1000 + (value - 1000) * (1 + uncertainty), cap)));
        const avg = Math.round(value);
        // Stessa struttura prudenziale del canone esistente, con controllo del margine.
        const baseRent = Math.min(value * 0.18, surplus * 0.30);
        let rent = baseRent;
        if (baseRent > 0 && baseRent < 3000) rent = Math.min(baseRent <= 1000 ? 500 + baseRent * 1.8 : 2300 + (baseRent - 1000) * 0.35, surplus * 0.70, cap * 0.18);
        rent = Math.floor(stable(Math.max(500, rent)));
        const notes = ['Stima indicativa sui dati dichiarati. Merce, furgone e attrezzature esclusi.'];
        if (!knownProfit) notes.push('Spese non indicate: la fascia è più ampia. Il canone usa un margine ipotetico del 20% degli incassi.');
        if (d.concessione === 'non_so') notes.push('Scadenza e possibilità di subingresso da verificare al SUAP.');
        if (d.clientela === 'turisti') notes.push('Usa la media di tutta la stagione, comprese le giornate deboli.');
        const impacts = [
            {label:'Passaggio, clientela e lati di vendita', delta:weak > 1000 ? Math.round(((value50 - 1000) / (weak - 1000) - 1) * 100) : 0},
            {label:legacy.labels.settore[d.settore], delta:Math.round((sector - 1) * 100)},
            {label:legacy.labels.sole[d.sole], delta:Math.round((sun - 1) * 100)},
            {label:legacy.labels.concessione[d.concessione], delta:Math.round((certainty - 1) * 100)}
        ];
        return {version:VERSION, status:'ok', input:d, min, avg, max, rent, monthly:Math.round(rent / 12),
            base:Math.round(1000 + (value50 - 1000) * effectiveDays / referenceDays),
            revenueBase:Math.round(1000 + (value50 - 1000) * effectiveDays / referenceDays),
            roi:avg > 0 ? Math.round(rent / avg * 1000) / 10 : 0, impacts,
            beforeProfit:Math.round(beforeProfit), uncapped:Math.round(uncapped), quality, effectiveDays,
            surplus:stable(surplus), knownProfit, uncertainty, cap:stable(cap),
            appliedCaps:caps.filter(c => uncapped > c.value).map(c => c.reason), notes};
    }
    return {...legacy, VERSION, referenceDays, revenues, weakValues, strongValues, weakCurve, strongCurve, daysFactor, estimate};
});
