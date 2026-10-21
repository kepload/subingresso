/* Valutazione indicativa v2.6. Ipotesi di modello, NON prezzi di compravendite.
 * Importabile anche in Node per verificare i casi limite.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory();
    else root.PosteggioValuation = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    'use strict';
    const VERSION = '2.6';
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
        let s = raw.trim().replace(/^€\s*/, '');
        if (/^\d{1,3}(?:[\u00a0\u202f ]\d{3})+(?:,\d{1,2})?$/.test(s)) s=s.replace(/[\u00a0\u202f ]/g,'');
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
    // Tre riferimenti a 52 giornate: 100 -> 1.000, 200 -> 8.000, 400 -> 27.000.
    // La parabola ha pendenza crescente. Il raccordo cubico resta crescente e
    // raggiunge la precedente curva a 1.100, con la sua pendenza successiva.
    function commercialRevenueBase(daily, days, food) {
        let value52 = 1000;
        if (daily > 100 && daily <= 400) {
            const x = daily - 100;
            value52 = 1000 + 185 / 3 * x + x * x / 12;
        } else if (daily > 400 && daily < 1100) {
            const t = (daily - 400) / 700;
            value52 = 27000 + 23336 * (1 - Math.pow(1 - t, 3))
                + 700 * 52 * (food ? 0.25 : 0.53) * (t * t * t - t * t);
        } else if (daily >= 1100) {
            value52 = 52 * (968 + Math.min(daily - 1100, 900) * (food ? 0.25 : 0.53)
                + Math.max(daily - 2000, 0) * (food ? 0.65 : 0.71));
        }
        // La soglia di cessione è fissa; solo l'avviamento sopra di essa
        // dipende dalle giornate effettive del singolo posteggio.
        return 1000 + Math.max(0, value52 - 1000) * days / 52;
    }
    function estimate(input, version = VERSION) {
        if (!['2.0', '2.1', '2.2', '2.3', '2.4', '2.5', VERSION].includes(version)) throw new Error('Versione del modello non disponibile.');
        const d = validate(input);
        const current = ['2.2', '2.3', '2.4', '2.5', VERSION].includes(version);
        const commercialCurve = ['2.5', VERSION].includes(version);
        const calibrated = version === VERSION;
        const revisedNonFood = ['2.3', '2.4', '2.5', VERSION].includes(version) && d.settore === 'non_alimentare';
        const knownProfit = d.utileGiorno !== null;
        const surplus = knownProfit ? d.utileGiorno * d.giornate : d.fatturato * 0.20;
        const notes = ['Stima indicativa: coefficienti prudenziali ancora da calibrare su vendite concluse. Merce, furgone e attrezzature esclusi.'];
        if (d.concessione === 'temporanea') return { version, input: d, status: 'non_stimabile', notes: ['Un’assegnazione temporanea non prova un diritto cedibile. Verifica il titolo con il Comune prima di stimare una cessione.'] };
        const dailyRevenue = d.fatturato / d.giornate;
        // Curva continua tarata sui riferimenti commerciali dell'utente.
        // Ogni euro aggiuntivo di incasso aumenta la base, senza scatti di soglia.
        const revenueBase = commercialCurve ? commercialRevenueBase(dailyRevenue, d.giornate, d.settore === 'alimentare') : current ? d.giornate * (
            Math.min(dailyRevenue, 1100) * 0.88
            + Math.min(Math.max(dailyRevenue - 1100, 0), 900) * (revisedNonFood ? 0.53 : 0.25)
            + Math.max(dailyRevenue - 2000, 0) * (revisedNonFood ? 0.71 : 0.65)
        ) : d.fatturato * 0.5;
        const base = current
            ? (knownProfit ? Math.min(revenueBase * (surplus / d.fatturato) / 0.20, revenueBase * 1.5) : revenueBase)
            : (knownProfit ? Math.min(surplus * 2.5, d.fatturato * 0.9) : revenueBase);
        const food = version !== '2.0' && d.settore === 'alimentare';
        const sector = food ? 1.3 : 1;
        const revenuePremium = food ? (current
            ? 1 + Math.min(0.15, Math.max(0, (dailyRevenue - 2000) / 2000 * 0.15))
            : 1 + Math.min(0.3, Math.max(0, (dailyRevenue - 1000) / 1000 * 0.15))) : 1;
        // Frequenza, stagione e anzianità non moltiplicano ricavi già annualizzati.
        // Turismo da solo non garantisce acquisti.
        const tourism = d.zona !== 'interna' && d.clientela === 'mista' ? 1.05 : 1;
        // Riferimento approvato il 22/10/2026: 15.000 annui, 50 giornate,
        // non alimentare, sole variabile e scadenza ignota. La sua parte sopra
        // 1.000 resta invariata; i nuovi pesi sono percentuali, non somme fisse.
        const referenceGoodwill = (commercialRevenueBase(300, 50, false) - 1000) * 0.85 * 0.98;
        const flow = (calibrated ? { alto: 15425 / referenceGoodwill, medio: 1, laterale: 9000 / referenceGoodwill, non_so: 1 }
            : current ? { alto: 1.03, medio: 1, laterale: 0.95, non_so: 1 }
            : { alto: 1.1, medio: 1, laterale: 0.85, non_so: 1 })[d.passaggio];
        const frontage = d.posizione === 'angolare' ? (calibrated ? 14000 / referenceGoodwill : current ? 1.02 : 1.05) : 1;
        // Il vecchio tetto al 30% annullerebbe parte del premio per l'angolo
        // quando il passaggio è principale. In v2.6 i tre pesi si combinano.
        const adjustment = calibrated ? tourism * flow * frontage : Math.min(1.3, Math.max(0.7, tourism * flow * frontage));
        const sun = (calibrated
            ? { riparato: 13000 * 0.98 / referenceGoodwill,
                frontale: 11000 * 0.98 / referenceGoodwill * (food ? 0.98 / 0.95 : 1),
                variabile: food ? 0.99 : 0.98, non_so: 1 }
            : current
            ? { riparato: 1, frontale: food ? 0.98 : 0.95, variabile: food ? 0.99 : 0.98, non_so: 1 }
            : { riparato: 1, frontale: 0.9, variabile: 0.95, non_so: 1 })[d.sole];
        const certainty = d.concessione === 'non_so' ? 0.85 : 1;
        let value = base * sector * revenuePremium * adjustment * certainty;
        let horizonCap = Infinity;
        if (d.concessione === 'breve') {
            horizonCap = surplus * (1 - Math.pow(1.15, -d.anniResidui)) / 0.15;
            value = Math.min(value, horizonCap);
            notes.push('Valore limitato agli anni residui dichiarati; nessun rinnovo automatico ipotizzato.');
        }
        value *= sun;
        horizonCap *= sun;
        if (commercialCurve) {
            horizonCap = Math.max(1000, horizonCap);
            value = dailyRevenue < 100 ? 1000 : Math.max(1000, Math.min(
                1000 + Math.max(0, base - 1000) * sector * revenuePremium * adjustment * certainty * sun,
                horizonCap));
            notes.push('Soglie commerciali fisse: € 1.000 per la cessione e almeno € 500 all’anno per l’affitto. Sotto € 100 di incasso medio a giornata, la cessione è € 1.000. Questi minimi non sono una misura della redditività.');
        }
        const operatingValue = value;
        // Soglia commerciale: sostegno continuo solo alle stime sotto 5.000 euro.
        // Margine nullo e limite di durata prevalgono sulla soglia di 1.000 euro.
        if (version === '2.4' && value > 0 && value < 5000) {
            value = Math.min(value + 1000 * Math.pow(1 - value / 5000, 2), horizonCap);
            notes.push('Per i valori bassi usiamo una soglia commerciale indicativa di € 1.000. L’aumento si riduce gradualmente fino a € 5.000; la durata breve può limitare il risultato.');
        }
        const unknowns = ['clientela', 'passaggio', 'sole'].filter(k => d[k] === 'non_so').length;
        const uncertainty = Math.min(0.55, (knownProfit ? 0.25 : 0.35) + unknowns * 0.05 + (d.clientela === 'turisti' ? 0.05 : 0) + (d.concessione === 'non_so' ? 0.1 : 0));
        const stable = n => Math.round(n * 1e6) / 1e6;
        value = stable(value);
        const commercialFloor = version === '2.4' && value > 0 ? Math.min(1000, horizonCap) : 0;
        const min = Math.floor(stable(commercialCurve ? 1000 + (value - 1000) * (1 - uncertainty)
            : Math.max(value * (1 - uncertainty), commercialFloor)));
        const max = Math.ceil(stable(Math.min(commercialCurve ? 1000 + (value - 1000) * (1 + uncertainty)
            : value * (1 + uncertainty), horizonCap)));
        const avg = Math.round(value);
        const baseRent = Math.min((['2.4', '2.5', VERSION].includes(version) ? operatingValue : value) * 0.18, surplus * 0.30);
        let rentValue = baseRent;
        if (['2.4', '2.5', VERSION].includes(version) && baseRent > 0 && baseRent < 3000) {
            // 500 euro iniziali, circa 2.300 su una base di 1.000; raccordo
            // crescente alla curva precedente a 3.000 euro annui.
            const supportedRent = baseRent <= 1000
                ? 500 + baseRent * 1.8
                : 2300 + (baseRent - 1000) * 0.35;
            rentValue = Math.min(supportedRent, surplus * 0.70, horizonCap * 0.18);
            if (!commercialCurve) notes.push('Per i canoni bassi usiamo una soglia commerciale indicativa di € 500 all’anno e un sostegno graduale fino a € 3.000. Il margine disponibile e la durata residua possono limitare il canone.');
        }
        const rent = Math.floor(stable(commercialCurve ? Math.max(500, rentValue) : rentValue));
        if (!knownProfit) notes.push('Spese non indicate: la fascia è più ampia. Il canone usa un margine ipotetico del 20% degli incassi.');
        if (knownProfit && surplus === 0) notes.push(commercialCurve
            ? 'Margine dichiarato nullo: gli importi mostrati sono solo soglie commerciali, non avviamento o rendimento sostenuti dagli incassi.'
            : 'Con quanto dichiarato non resta un margine: non stimiamo un avviamento positivo. Eventuali beni vanno valutati a parte.');
        if (d.concessione === 'non_so') notes.push('Scadenza e possibilità di subingresso da verificare al SUAP.');
        if (d.clientela === 'turisti') notes.push('Usa la media di tutta la stagione, comprese le giornate deboli.');
        const impacts = [
            ...(version !== '2.0' ? [
                { label: labels.settore[d.settore], delta: Math.round((sector - 1) * 100) },
                ...(food ? [{ label: current ? 'Incasso medio alimentare oltre € 2.000 a giornata' : 'Incasso medio alimentare oltre € 1.000 a giornata', delta: Math.round((revenuePremium - 1) * 100) }] : [])
            ] : []),
            { label: 'Clientela mista in zona turistica', delta: Math.round((tourism - 1) * 100) },
            { label: labels.passaggio[d.passaggio], delta: Math.round((flow - 1) * 100) },
            { label: labels.posizione[d.posizione], delta: Math.round((frontage - 1) * 100) },
            { label: labels.sole[d.sole], delta: Math.round((sun - 1) * 100) },
            { label: labels.concessione[d.concessione], delta: Math.round((certainty - 1) * 100) }
        ];
        if (commercialCurve && value === 1000) impacts.forEach(impact => { impact.delta = 0; });
        return { version, status: 'ok', input: d, base: Math.round(base), surplus: Math.round(surplus), knownProfit, min, avg, max, rent,
            ...(current ? { revenueBase: Math.round(revenueBase) } : {}),
            monthly: Math.round(rent / 12), roi: avg > 0 ? Math.round(rent / avg * 1000) / 10 : 0, uncertainty, impacts, notes };
    }
    return { VERSION, choices, labels, parseMoney, validate, estimate };
});
