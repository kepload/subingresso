(function (global) {
    'use strict';
    const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const CATEGORIES = { tradizionale: 'Fiera tradizionale', artigianato: 'Artigianato e mostre mercato', sagra: 'Sagra o festa', espositiva: 'Fiera espositiva', mercatino: 'Mercatino' };
    const SECTORS = { alimentare: 'Alimentare', 'non-alimentare': 'Non alimentare', antiquariato: 'Antiquariato e vintage', artigianato: 'Artigianato' };
    const ARTICLE_GROUPS = ['Abbigliamento e accessori', 'Casa e persona', 'Altri prodotti', 'Alimentari', 'Artigianato', 'Usato e collezionismo'];
    // Match only goods documented in the source sector text, never a generic
    // event name, its category or an assumed permission to trade.
    const ARTICLE_TYPES = {
        abbigliamento: { label: 'Abbigliamento', group: 0, sectors: ['non-alimentare'], pattern: /\b(?:abbigliamento|vestiti|vestiario|maglieria)\b/ },
        intimo: { label: 'Intimo e calze', group: 0, sectors: ['non-alimentare'], pattern: /\b(?:intimo|biancheria intima|calze|calzini|calzetteria|calzeria|calzamaglie)\b/ },
        calzature: { label: 'Calzature', group: 0, sectors: ['non-alimentare'], pattern: /\b(?:calzature|scarpe|sandali|ciabatte)\b/ },
        pelletteria: { label: 'Borse e pelletteria', group: 0, sectors: ['non-alimentare'], pattern: /\b(?:bors[ae]|pelletteria|portafogli|cinture|accessori in pelle)\b/ },
        bigiotteria: { label: 'Bigiotteria', group: 0, sectors: ['non-alimentare', 'artigianato'], pattern: /\bbigiotteri\w*\b/ },
        casalinghi: { label: 'Casalinghi e cucina', group: 1, sectors: ['non-alimentare'], pattern: /\b(?:casalinghi|articoli (?:per la casa|da cucina)|utensili da cucina|pentol[ae]|stoviglie)\b/ },
        'biancheria-casa': { label: 'Biancheria per la casa', group: 1, sectors: ['non-alimentare'], pattern: /\b(?:biancheria (?:per la casa|da casa|da letto)|tessili (?:per la casa|da casa)|lenzuol[ao]|asciugamani|tovaglie|tendaggi)\b/ },
        cosmetici: { label: 'Cosmetici e profumeria', group: 1, sectors: ['non-alimentare'], pattern: /\b(?:cosmetic\w*|profumeria|profumi|prodotti (?:di bellezza|per la cura della persona)|saponi)\b/ },
        detergenti: { label: 'Detergenti', group: 1, sectors: ['non-alimentare'], pattern: /\b(?:detergenti|detersivi|prodotti per la pulizia)\b/ },
        giocattoli: { label: 'Giocattoli', group: 2, sectors: ['non-alimentare'], pattern: /\b(?:giocattoli|giocattoleria|giochi da tavolo)\b/ },
        libri: { label: 'Libri e fumetti', group: 2, sectors: ['non-alimentare', 'antiquariato'], pattern: /\b(?:libri|libro|libraria|editoria|fumetti)\b/ },
        elettronica: { label: 'Elettronica e accessori telefonici', group: 2, sectors: ['non-alimentare'], pattern: /\b(?:elettronic\w*|telefonia|accessori (?:telefonici|per (?:cellulari|smartphone|telefoni)))\b/ },
        piante: { label: 'Fiori e piante', group: 2, sectors: ['non-alimentare'], pattern: /\b(?:fiori|piante|florovivais\w*|floricoltura|vivaismo|bulbi|sementi)\b/ },
        animali: { label: 'Articoli per animali', group: 2, sectors: ['non-alimentare'], pattern: /\b(?:articoli per animali|accessori per (?:animali|cani|gatti)|prodotti per animali|mangimi|pet food|pet shop)\b/ },
        'salumi-formaggi': { label: 'Salumi e formaggi', group: 3, sectors: ['alimentare'], pattern: /\b(?:salumi|formaggi|latticini|caseari|insaccati)\b/ },
        forno: { label: 'Prodotti da forno', group: 3, sectors: ['alimentare'], pattern: /\b(?:prodotti da forno|pane|panific\w*|focacce|biscotti|taralli)\b/ },
        dolciumi: { label: 'Dolciumi', group: 3, sectors: ['alimentare'], pattern: /\b(?:dolc\w*|cioccolat\w*|pasticceria|caramelle|torrone|gelat[oi])\b/ },
        agricoli: { label: 'Prodotti agricoli', group: 3, sectors: ['alimentare'], pattern: /\b(?:prodotti agricoli|ortofrutta|frutta|verdura|ortaggi|miele|olio (?:di oliva|d oliva|extravergine))\b/ },
        tipici: { label: 'Conserve e prodotti tipici', group: 3, sectors: ['alimentare'], pattern: /\b(?:conserve|confetture|marmellate|sottoli|prodotti tipici|specialita (?:alimentari|gastronomiche))\b/ },
        bevande: { label: 'Bevande', group: 3, sectors: ['alimentare'], pattern: /\b(?:bevande|vino|vini|birra|birre|liquori|distillati|sidro|caffe)\b/ },
        'street-food': { label: 'Street food', group: 3, sectors: ['alimentare'], pattern: /\b(?:street food|food truck|cucina itinerante|cibo di strada|ristorazione ambulante)\b/ },
        cioccolato: { label: 'Cioccolato e cacao', group: 3, sectors: ['alimentare'], pattern: /\b(?:cioccolat\w*|cacao)\b/ },
        olio: { label: 'Olio d’oliva e derivati', group: 3, sectors: ['alimentare'], pattern: /\b(?:olio (?:di oliva|d oliva|extravergine)|prodotti (?:oleari|del settore oleario))\b/ },
        ceramica: { label: 'Ceramica', group: 4, sectors: ['non-alimentare', 'artigianato'], pattern: /\b(?:ceramica|ceramiche|terrecotte|terracotta)\b/ },
        legno: { label: 'Lavorazioni in legno', group: 4, sectors: ['non-alimentare', 'artigianato'], pattern: /\b(?:lavorazioni (?:in|del) legno|artigianato (?:in|del) legno|(?:oggetti|articoli|manufatti|sculture) (?:in|di) legno|intagli(?:o| in legno))\b/ },
        tessili: { label: 'Creazioni tessili', group: 4, sectors: ['non-alimentare', 'artigianato'], pattern: /\b(?:creazioni tessili|artigianato tessile|ricami|ricamo|uncinetto|merletti|tessitura artigianale)\b/ },
        'gioielli-artigianali': { label: 'Gioielli artigianali', group: 4, sectors: ['non-alimentare', 'artigianato'], pattern: /\b(?:(?:gioielli|bigiotteria|monili) (?:artigianal\w*|fatti a mano)|gioielleria artigianale|(?:creazione|produzione) artigianale di gioielli)\b/ },
        decorazioni: { label: 'Decorazioni e articoli da regalo', group: 4, sectors: ['non-alimentare', 'artigianato'], pattern: /\b(?:decorazioni|addobbi|articoli da regalo|oggetti da regalo|presepi)\b/ },
        antiquariato: { label: 'Antiquariato', group: 5, sectors: ['non-alimentare', 'antiquariato'], pattern: /\b(?:antiquariat\w*|brocantage|oggetti d epoca)\b/ },
        modernariato: { label: 'Modernariato', group: 5, sectors: ['non-alimentare', 'antiquariato'], pattern: /\bmodernariato\b/ },
        vintage: { label: 'Vintage', group: 5, sectors: ['non-alimentare', 'antiquariato'], pattern: /\bvintage\b/ },
        usato: { label: 'Usato', group: 5, sectors: ['non-alimentare', 'antiquariato'], pattern: /\b(?:usato|usati|usate|seconda mano|second hand|riuso)\b/ },
        collezionismo: { label: 'Collezionismo', group: 5, sectors: ['non-alimentare', 'antiquariato'], pattern: /\b(?:collezion\w*|oggetti da collezione|filatelia|numismatica|modellismo)\b/ },
        'abbigliamento-vintage': { label: 'Abbigliamento vintage', group: 5, sectors: ['non-alimentare', 'antiquariato'], pattern: /\b(?:abbigliamento|vestiti|capi) (?:vintage|d epoca)\b/ },
        'libri-antichi': { label: 'Libri antichi e da collezione', group: 5, sectors: ['non-alimentare', 'antiquariato'], pattern: /\b(?:libri (?:antichi|d epoca|da collezione)|editoria antiquaria|antiquariato librario)\b/ }
    };
    // Compact choices keep the precise source types for saved URLs and affinity evidence.
    const ARTICLE_OPTIONS = [
        ['abbigliamento', 'Abbigliamento e intimo', ['abbigliamento', 'intimo']],
        ['calzature'], ['pelletteria'],
        ['bigiotteria', 'Gioielli e bigiotteria', ['bigiotteria', 'gioielli-artigianali']],
        ['casalinghi', 'Casa e biancheria', ['casalinghi', 'biancheria-casa']],
        ['cosmetici'], ['detergenti'], ['giocattoli'],
        ['libri', 'Libri e fumetti', ['libri', 'libri-antichi']],
        ['elettronica', 'Elettronica e telefonia'], ['piante'], ['animali'],
        ['salumi-formaggi'], ['forno'],
        ['dolciumi', 'Dolci e cioccolato', ['dolciumi', 'cioccolato']],
        ['agricoli', 'Prodotti agricoli e olio', ['agricoli', 'olio']],
        ['tipici'], ['bevande'], ['street-food'],
        ['ceramica', 'Artigianato e decorazioni', ['ceramica', 'legno', 'tessili', 'decorazioni']],
        ['antiquariato', 'Antiquariato e modernariato', ['antiquariato', 'modernariato']],
        ['vintage', 'Vintage', ['vintage', 'abbigliamento-vintage']],
        ['usato'], ['collezionismo']
    ].map(([key, label, types]) => ({ key, label: label || ARTICLE_TYPES[key].label, types: types || [key], group: ARTICLE_TYPES[key].group }));
    function optionTypes(option, sector = '') {
        return option.types.filter(key => !sector || ARTICLE_TYPES[key].sectors.includes(sector));
    }
    function articleSelections(articles, sector = '') {
        return ARTICLE_OPTIONS.flatMap(option => {
            const available = optionTypes(option, sector);
            const selected = available.filter(key => articles.includes(key));
            if (!selected.length) return [];
            return selected.length === available.length ? [{ label: option.label, types: selected }]
                : selected.map(key => ({ label: ARTICLE_TYPES[key].label, types: [key] }));
        });
    }
    const articleCache = new WeakMap();
    const researchCache = new WeakMap();
    const articleFilterCache = new WeakMap();
    function articleResearch(event, today = todayInRome()) {
        const cached = researchCache.get(event);
        if (cached?.today === today) return cached.value;
        const profile = event.articleResearch;
        const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
        const valid = profile && validDate(profile.checkedAt) && validDate(profile.reviewAfter) && profile.checkedAt <= today && profile.reviewAfter >= today
            && Date.parse(profile.reviewAfter) - Date.parse(profile.checkedAt) <= 366 * 86400000
            && typeof profile.retail === 'boolean' && typeof profile.theme === 'string' && profile.theme
            && Array.isArray(profile.sources) && profile.sources.length && profile.sources.every(source => source?.label && /^https:\/\/[^/\s]+/.test(source.url || ''))
            && profile.articles && Object.entries(profile.articles).every(([key, item]) => Object.hasOwn(ARTICLE_TYPES, key)
                && ['core', 'secondary', 'listed', 'conditional', 'unknown'].includes(item?.role) && typeof item.reason === 'string' && item.reason
                && (item.role !== 'conditional' || (typeof item.condition === 'string' && item.condition)));
        const value = valid ? profile : null;
        researchCache.set(event, { today, value });
        return value;
    }
    function articleTypes(event, today = todayInRome()) {
        const cached = articleCache.get(event);
        if (cached?.today === today) return cached.types;
        // Exclusions end at a source clause boundary. In particular, a ban on
        // serving food must not exclude a documented sale of packaged goods.
        const text = String(event.sectors || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
            .replace(/\b(?:esclus[oaie]|vietat[oaie]|non (?:sono )?ammess[oaie]|divieto di vendita|senza vendita|ad esclusione di)\b[^;.\n)]*/g, '')
            .replace(/[^a-z0-9]+/g, ' ');
        const types = Object.keys(ARTICLE_TYPES).filter(key => ARTICLE_TYPES[key].pattern.test(text));
        const profile = articleResearch(event, today);
        if (profile) for (const [key, item] of Object.entries(profile.articles)) {
            if (item.role !== 'unknown' && !types.includes(key)) types.push(key);
        }
        articleCache.set(event, { today, types });
        return types;
    }
    // A title can corroborate an already documented product; it cannot add
    // products, prove sales or cause a negative rating.
    const ARTICLE_THEMES = {
        abbigliamento: /\b(?:abbigliamento|moda|fashion)\b/, intimo: /\b(?:intimo|calze)\b/,
        calzature: /\b(?:calzature|scarpe)\b/, pelletteria: /\b(?:pelletteria|borse)\b/,
        bigiotteria: /\b(?:bigiotteria|bijoux|gioielli)\b/, casalinghi: /\b(?:casalinghi|casa|arredo)\b/,
        'biancheria-casa': /\b(?:biancheria|tessili)\b/, cosmetici: /\b(?:cosmetica|cosmetici|profumi|bellezza)\b/,
        detergenti: /\b(?:detergenti|pulizia)\b/, giocattoli: /\b(?:giocattoli|giochi)\b/,
        libri: /\b(?:libro|libri|editoria|fumetti|comics)\b/, elettronica: /\b(?:elettronica|elettronico|radio|radiantistica|informatica)\b/,
        piante: /\b(?:fiori|piante|flor\w*|ortogiardino|orticolario|giardino|giardini)\b/,
        animali: /\b(?:animali|pet|cani|gatti)\b/, 'salumi-formaggi': /\b(?:salumi|formaggi|formaggio|tomino)\b/,
        forno: /\b(?:pane|forno|panificazione|focaccia)\b/, dolciumi: /\b(?:dolci|dolciumi|pasticceria)\b/,
        agricoli: /\b(?:agricol\w*|ortofrutta|prodotti agricoli)\b/, tipici: /\b(?:prodotti tipici|sapori|gastronomia|enogastronom\w*)\b/,
        bevande: /\b(?:vino|vini|birra|birre|bevande)\b/, 'street-food': /\b(?:street food|food truck|cucine del mondo|cibo di strada)\b/,
        cioccolato: /\b(?:cioccolat\w*|eurochocolate|cacao)\b/, olio: /\b(?:olio|oli|oleario)\b/,
        ceramica: /\b(?:ceramica|ceramiche)\b/, legno: /\b(?:legno|intaglio)\b/, tessili: /\b(?:ricamo|ricami|tessile|tessili|tessitura)\b/,
        'gioielli-artigianali': /\b(?:gioielli|oreficeria)\b/, decorazioni: /\b(?:decorazioni|addobbi|presepi)\b/,
        antiquariato: /\b(?:antiquari\w*|mercanteinfiera)\b/, modernariato: /\bmodernariato\b/,
        vintage: /\bvintage\b/, usato: /\b(?:usato|riuso|seconda mano)\b/, collezionismo: /\b(?:collezion\w*|filatelia|numismatica|modellismo)\b/,
        'abbigliamento-vintage': /\b(?:vintage|moda)\b/, 'libri-antichi': /\b(?:libri antichi|antiquariat\w*|collezion\w*)\b/
    };
    function articleAffinity(event, article, today = todayInRome()) {
        if (!Object.hasOwn(ARTICLE_TYPES, article)) return null;
        const type = ARTICLE_TYPES[article];
        const result = (score, evidence, reason, extra = {}) => ({ article, label: type.label, score, evidence, reason, method: 'catalog', condition: '', ...extra });
        if (!/^https:\/\//.test(event.source?.url || '')) return result(null, 'unknown', 'Manca una fonte consultabile per i settori di questa fiera.');
        const text = String(event.sectors || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[-’']/g, ' ');
        const isFood = type.group === 3;
        // Restrictions applying to a specific operator, stand or area are not
        // restrictions on the whole fair. Do not infer rejection from its theme.
        const qualified = /\b(?:hobbisti|artigiani|produttori|commercianti|operatori)\b|\b(?:area|sezione|categoria|stand)\b|\b(?:se|salvo|tranne|eccetto)\b/.test(text);
        let excluded = false;
        const rejects = clause => {
            if (/\b(?:somministrazione|degustazione|preparazione)\b/.test(clause)) return false;
            const nonFood = /\bnon alimentar\w*\b/.test(clause);
            const food = /\b(?:alimentar\w*|agroalimentar\w*|enogastronom\w*)\b/.test(clause.replace(/\bnon alimentar\w*\b/g, ''));
            return (nonFood && !isFood) || (food && isFood) || type.pattern.test(clause.replace(/[^a-z0-9]+/g, ' '));
        };
        for (const match of text.matchAll(/\b(?:esclus[oaie]|vietat[oaie]|non (?:sono )?ammess[oaie]|divieto di vendita|senza vendita|ad esclusione di)\b([^;.\n)]*)/g)) {
            if (rejects(match[1])) excluded = true;
        }
        for (const clause of text.split(/[;.\n]/)) {
            const postfix = clause.match(/^(.*?)\b(?:non (?:sono )?ammess[oaie]|vietat[oaie]|esclus[oaie])\s*$/);
            if (postfix && rejects(postfix[1])) excluded = true;
            const only = clause.match(/\b(?:solo|esclusivamente)\s+(?:(?:il|settore|prodotti|merci|generi)\s+)*(non alimentar\w*|alimentar\w*)\b(.*)/);
            if (only && !/\b(?:alimentar\w*|artigian\w*|hobbist\w*)\b/.test(only[2]) && isFood === only[1].startsWith('non ')) excluded = true;
        }
        if (excluded) {
            if (qualified) return result(null, 'unknown', 'La fonte distingue operatori o aree: non è certo che il limite riguardi il tuo banco.');
            const checked = event.source.checkedAt || '';
            const age = Date.parse(today) - Date.parse(checked);
            const currentEdition = (event.editions || []).some(edition => edition.end ? edition.end >= today : edition.year >= Number(today.slice(0, 4)));
            const recent = /^\d{4}-\d{2}-\d{2}$/.test(checked) && Number.isFinite(age) && new Date(checked).toISOString().slice(0, 10) === checked && age >= 0 && age <= 180 * 86400000 && currentEdition;
            return recent
                ? result(2, 'excluded', 'I settori della fonte escludono esplicitamente questo articolo o il suo settore per l’edizione indicata.')
                : result(null, 'unknown', 'È riportata un’esclusione, ma va riconfermata per un’edizione attuale con una fonte recente.');
        }
        const profile = articleResearch(event, today);
        const researched = profile?.articles[article];
        if (researched) {
            const score = { core: profile.retail ? 9 : 8, secondary: profile.retail ? 7 : 6, listed: 6, conditional: 6, unknown: null }[researched.role];
            return result(score, researched.role, researched.reason, { method: 'reviewed', condition: researched.condition || '', sources: profile.sources, checkedAt: profile.checkedAt, theme: profile.theme });
        }
        const documented = articleTypes(event, today);
        if (documented.includes(article)) {
            const title = normalize(event.name);
            let condition = '';
            if (article === 'abbigliamento' && /\babbigliamento (?:e accessori )?(?:vintage|d epoca)\b/.test(text)) condition = 'Abbigliamento vintage';
            if (article === 'libri' && /\b(?:libri (?:antichi|d epoca|da collezione)|editoria del settore)\b/.test(text)) condition = 'Libri del settore indicato';
            if (article === 'dolciumi' && documented.includes('cioccolato') && /\b(?:cioccolat\w*|eurochocolate|cacao)\b/.test(title)) condition = 'Focus cioccolato';
            if (article === 'agricoli' && documented.includes('olio') && /\b(?:olio|oli|oleario)\b/.test(title)) condition = 'Focus settore oleario';
            if (['usato', 'vintage', 'collezionismo'].includes(article) && documented.includes('elettronica') && ARTICLE_THEMES.elettronica.test(title)) condition = 'Solo settore elettronico';
            if (condition) return result(6, 'conditional', 'La scheda riguarda un sottotipo preciso. Il voto è valido per quel sottotipo; gli altri prodotti della categoria restano da verificare.', { condition });
            if (ARTICLE_THEMES[article]?.test(title)) return result(8, 'theme', 'L’articolo è documentato nei settori e coincide con il tema dichiarato della fiera. Non è una previsione delle vendite.');
            const foodTheme = /\b(?:gastronom\w*|enogastronom\w*|sapori|gusto|vino|vini|birra|formaggi|salumi|food)\b/.test(title);
            const fashionTheme = /\b(?:moda|fashion|abbigliamento)\b/.test(title);
            const craftTheme = /\b(?:artigian\w*|creativ\w*)\b/.test(title);
            if ((isFood && foodTheme) || (type.group === 0 && fashionTheme) || (type.group === 4 && craftTheme)) return result(7, 'secondary', 'L’articolo è citato e può completare il tema della fiera, ma non risulta il prodotto centrale.');
            return result(6, 'listed', 'La presenza dell’articolo è documentata, ma mancano elementi sul pubblico interessato a quel prodotto: compatibilità generica da approfondire.');
        }
        return result(null, 'unknown', 'I settori descritti non bastano per stimare l’affinità. L’assenza dell’articolo non prova che sia fuori tema.');
    }
    function articleAffinitySummary(event, articles = [], today = todayInRome()) {
        const items = [...new Set(articles)].filter(key => Object.hasOwn(ARTICLE_TYPES, key)).map(key => articleAffinity(event, key, today));
        const best = items.filter(item => item.score !== null).sort((a, b) => b.score - a.score)[0] || null;
        return { items, best, score: best?.score ?? null };
    }
    // Editorial volume bands, not a forecast or a commercial assessment.
    const ATTENDANCE = {
        exceptional: { label: 'Affluenza altissima', min: 100000 },
        veryHigh: { label: 'Affluenza molto alta', min: 20000 },
        high: { label: 'Affluenza alta', min: 5000 },
        medium: { label: 'Affluenza media', min: 1000 },
        low: { label: 'Affluenza bassa', min: 500 },
        veryLow: { label: 'Affluenza molto bassa', min: 0 }
    };
    function attendanceInfo(event, today = todayInRome()) {
        const a = event.attendance;
        const iso = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
        if (!a || !iso(a.start) || !iso(a.end) || a.start > a.end || a.end > today
            || !iso(a.checkedAt) || a.checkedAt > today || a.checkedAt < a.end
            || !iso(a.reviewAfter) || a.reviewAfter < today
            || Date.parse(today) - Date.parse(a.end) > 730 * 86400000
            || !Number.isSafeInteger(a.value) || a.value <= 0
            || !['exact', 'over', 'about', 'under'].includes(a.relation)
            || !['entries', 'presences', 'visitors', 'uniqueVisitors', 'passages'].includes(a.unit)
            || !['counted', 'declared', 'estimated'].includes(a.status)
            || !['not-published', 'ticketing', 'counters', 'audit'].includes(a.countingMethod)
            || (a.status === 'counted' && a.countingMethod === 'not-published')
            || !['fair', 'whole-event', 'partial'].includes(a.scope)
            || !Number.isInteger(a.openDays) || a.openDays < 0 || a.openDays > (Date.parse(a.end) - Date.parse(a.start)) / 86400000 + 1
            || !a.source || !/^https:\/\/[^/\s]+/.test(a.source.url || '') || !a.source.label || !a.note) return null;
        const units = { entries: 'ingressi', presences: 'presenze', visitors: 'visitatori dichiarati', uniqueVisitors: 'visitatori unici', passages: 'passaggi' };
        const prefixes = { exact: '', over: 'Oltre ', about: 'Circa ', under: 'Meno di ' };
        const format = value => new Intl.NumberFormat('it-IT', { maximumFractionDigits: 0 }).format(value);
        const total = prefixes[a.relation] + format(a.value) + ' ' + units[a.unit];
        const days = a.openDays ? ' in ' + a.openDays + (a.openDays === 1 ? ' giornata' : ' giornate') : '';
        const status = { counted: 'Conteggio documentato', declared: 'Dato dichiarato dalla fonte', estimated: 'Stima riportata dalla fonte' }[a.status];
        let level = null, daily = null;
        const newerEdition = (event.editions || []).some(e => e.end && !e.periodOnly && e.end <= today && e.end > a.end);
        // Unique people, unspecified visitor counts, city-wide festivals and
        // partial counts cannot become comparable daily attendance badges.
        if (!newerEdition && a.scope === 'fair' && a.openDays && ['entries', 'presences'].includes(a.unit) && a.relation !== 'under') {
            daily = a.value / a.openDays;
            level = Object.keys(ATTENDANCE).find(key => daily >= ATTENDANCE[key].min);
        }
        const label = level ? ATTENDANCE[level].label : '';
        const comparison = level
            ? (a.relation === 'over' ? 'Più di ' : a.relation === 'about' ? 'Circa ' : '') + format(daily) + ' ' + units[a.unit] + '/giorno in media sull’edizione.'
            : newerEdition ? 'È disponibile un dato di un’edizione precedente; il bollino attende un riscontro più recente.'
            : 'Dato conservato senza bollino: unità, area o durata non permettono un confronto giornaliero affidabile.';
        return { level, label, total: total + days, status, comparison, year: a.start.slice(0, 4), record: a };
    }
    function attendanceCriteria() {
        return 'Fasce editoriali sulla media giornaliera di ingressi o presenze: molto bassa sotto 500; bassa da 500 a meno di 1.000; media da 1.000 a meno di 5.000; alta da 5.000 a meno di 20.000; molto alta da 20.000 a meno di 100.000; altissima da 100.000. Altissima è riservata a volumi eccezionali e non certifica un primato storico. La media non descrive ogni singola giornata o il passaggio davanti al banco. I conteggi possono includere ritorni della stessa persona. Le cifre dichiarate o stimate restano tali; i dati “oltre” indicano un limite minimo e la fascia si basa su quel limite. Nessun bollino quando mancano dati confrontabili.';
    }
    const REPUTATIONS = {
        rinomata: { label: 'Molto conosciuta', icon: '★', description: 'Richiamo ampio o oltre il territorio locale documentato da fonti e dati.' },
        consolidata: { label: 'Storica', icon: '◆', description: 'Almeno 10 edizioni o 10 anni di storia documentati; richiamo più ampio da accertare.' },
        recente: { label: 'Nuova', icon: '✦', description: 'Prima, seconda o terza edizione documentata. Richiamo ancora da valutare.' },
        unknown: { label: 'Da valutare', icon: '?', description: 'Informazioni insufficienti per assegnare un livello. Non significa che la fiera sia nuova o poco frequentata.' }
    };
    // Explicit editorial evidence only: names, cities and missing data never imply reputation.
    function reputationLevel(event, today = todayInRome()) {
        const rating = event.reputation;
        if (!rating || !Object.hasOwn(REPUTATIONS, rating.level) || rating.level === 'unknown'
            || !/^\d{4}-\d{2}-\d{2}$/.test(rating.reviewAfter || '') || rating.reviewAfter < today
            || !/^\d{4}-\d{2}-\d{2}$/.test(rating.checkedAt || '') || rating.checkedAt > today
            || typeof rating.reason !== 'string' || !rating.reason || !Array.isArray(rating.evidence) || !rating.evidence.length
            || !rating.evidence.every(item => item && typeof item.label === 'string' && item.label && /^https:\/\//.test(item.url))) return 'unknown';
        return rating.level;
    }
    // Territorial grouping includes provinces without catalogue events.
    const REGION_PROVINCES = {
        "Abruzzo": ["Chieti", "L'Aquila", "Pescara", "Teramo"],
        "Basilicata": ["Matera", "Potenza"],
        "Calabria": ["Catanzaro", "Cosenza", "Crotone", "Reggio Calabria", "Vibo Valentia"],
        "Campania": ["Avellino", "Benevento", "Caserta", "Napoli", "Salerno"],
        "Emilia-Romagna": ["Bologna", "Ferrara", "Forlì-Cesena", "Modena", "Parma", "Piacenza", "Ravenna", "Reggio nell'Emilia", "Rimini"],
        "Friuli-Venezia Giulia": ["Gorizia", "Pordenone", "Trieste", "Udine"],
        "Lazio": ["Frosinone", "Latina", "Rieti", "Roma", "Viterbo"],
        "Liguria": ["Genova", "Imperia", "La Spezia", "Savona"],
        "Lombardia": ["Bergamo", "Brescia", "Como", "Cremona", "Lecco", "Lodi", "Mantova", "Milano", "Monza e della Brianza", "Pavia", "Sondrio", "Varese"],
        "Marche": ["Ancona", "Ascoli Piceno", "Fermo", "Macerata", "Pesaro e Urbino"],
        "Molise": ["Campobasso", "Isernia"],
        "Piemonte": ["Alessandria", "Asti", "Biella", "Cuneo", "Novara", "Torino", "Verbano-Cusio-Ossola", "Vercelli"],
        "Puglia": ["Bari", "Barletta-Andria-Trani", "Brindisi", "Foggia", "Lecce", "Taranto"],
        "Sardegna": ["Cagliari", "Gallura Nord-Est Sardegna", "Medio Campidano", "Nuoro", "Ogliastra", "Oristano", "Sassari", "Sulcis Iglesiente"],
        "Sicilia": ["Agrigento", "Caltanissetta", "Catania", "Enna", "Messina", "Palermo", "Ragusa", "Siracusa", "Trapani"],
        "Toscana": ["Arezzo", "Firenze", "Grosseto", "Livorno", "Lucca", "Massa-Carrara", "Pisa", "Pistoia", "Prato", "Siena"],
        "Trentino-Alto Adige": ["Bolzano/Bozen", "Trento"],
        "Umbria": ["Perugia", "Terni"],
        "Valle d'Aosta": ["Valle d'Aosta/Vallée d'Aoste"],
        "Veneto": ["Belluno", "Padova", "Rovigo", "Treviso", "Venezia", "Verona", "Vicenza"]
    };
    const HOME = [0, 0, 660, 730];
    const normalize = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    function intervalMonths(from, to) {
        if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || from > 12 || to < 1 || to > 12) return [];
        const result = [from];
        while (result[result.length - 1] !== to) result.push(result[result.length - 1] % 12 + 1);
        return result;
    }
    function matchesArticles(event, articles, today = todayInRome()) {
        if (!articles?.length) return true;
        let cached = articleFilterCache.get(event);
        if (cached?.today !== today) {
            const text = normalize(event.sectors);
            cached = { today, unrestricted: !/\b(?:esclus\w*|vietat\w*|non (?:sono )?ammess\w*|divieto di vendita|senza vendita|solo)\b/.test(text), matches: new Map() };
            articleFilterCache.set(event, cached);
        }
        // Missing or partial classifications are not evidence of incompatibility.
        // Keep the source-backed classification and affinity scores unchanged.
        return articles.some(type => {
            if (!Object.hasOwn(ARTICLE_TYPES, type)) return false;
            if (cached.unrestricted) return true;
            if (!cached.matches.has(type)) cached.matches.set(type, articleAffinity(event, type, today).evidence !== 'excluded');
            return cached.matches.get(type);
        });
    }
    function filterEvents(events, state, ignoreMonths) {
        const words = normalize(state.query).split(' ').filter(Boolean);
        const today = todayInRome();
        return events.filter(event => (!state.region || event.region === state.region) && (!state.province || event.province === state.province) && (!state.category || event.category === state.category)
            && (!state.sector || event.merchandiseSectors.includes(state.sector))
            && matchesArticles(event, state.articles, today)
            && (ignoreMonths || !state.months.length || event.months.some(month => state.months.includes(month)))
            && words.every(word => normalize([event.name, event.city, event.region, event.province, event.venue, event.sectors].join(' ')).includes(word)));
    }
    // Projection shared by the boundaries and municipality coordinates.
    function project(lng, lat) {
        const mercator = value => Math.log(Math.tan(Math.PI / 4 + value * Math.PI / 360));
        return [50 + (lng - 6.5) * 46, 25 + (mercator(47.2) - mercator(lat)) * 2500];
    }
    const projectedEvents = new WeakMap();
    function clusterEvents(events, threshold) {
        const groups = [];
        for (const event of events) {
            let point = projectedEvents.get(event);
            if (!point) { point = project(event.lng, event.lat); projectedEvents.set(event, point); }
            const group = groups.find(item => (item.x - point[0]) ** 2 + (item.y - point[1]) ** 2 <= threshold ** 2);
            if (group) {
                const count = group.events.length;
                group.x = (group.x * count + point[0]) / (count + 1);
                group.y = (group.y * count + point[1]) / (count + 1);
                group.events.push(event);
            } else groups.push({ x: point[0], y: point[1], events: [event] });
        }
        return groups;
    }
    function todayInRome() {
        const parts = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
        const part = type => parts.find(item => item.type === type).value;
        return part('year') + '-' + part('month') + '-' + part('day');
    }
    function dateLabel(value, withWeekday = false) {
        const label = new Intl.DateTimeFormat('it-IT', { weekday: withWeekday ? 'long' : undefined, day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value + 'T12:00:00'));
        return withWeekday ? label.charAt(0).toUpperCase() + label.slice(1) : label;
    }
    function editionLabel(edition) {
        if (!edition.start) return edition.label + ' · ' + edition.year;
        if (edition.periodOnly) return dateLabel(edition.start) + ' – ' + dateLabel(edition.end);
        // ISO date subtraction uses UTC, so daylight-saving changes do not affect duration.
        const daysBetween = (Date.parse(edition.end) - Date.parse(edition.start)) / 86400000;
        const withWeekday = daysBetween === 0 || daysBetween === 1;
        return edition.start === edition.end ? dateLabel(edition.start, withWeekday) : dateLabel(edition.start, withWeekday) + ' – ' + dateLabel(edition.end, withWeekday);
    }
    function editionMatchesMonths(edition, months) {
        if (!edition.start) return true;
        const cursor = new Date(edition.start.slice(0, 7) + '-01T12:00:00Z');
        while (cursor.toISOString().slice(0, 10) <= edition.end) {
            if (months.includes(cursor.getUTCMonth() + 1)) return true;
            cursor.setUTCMonth(cursor.getUTCMonth() + 1);
        }
        return false;
    }
    function periodStart(today, months) {
        return months.length ? today.slice(0, 4) + '-' + String(months[0]).padStart(2, '0') + '-01' : today;
    }
    function selectEdition(event, today = todayInRome(), months = []) {
        const editions = (event.editions || []).filter(e => !months.length || editionMatchesMonths(e, months));
        const reference = periodStart(today, months);
        const next = editions.filter(e => e.start && e.end >= reference).sort((a, b) => a.start.localeCompare(b.start));
        if (next.length) return next[0];
        const undated = editions.filter(e => !e.start && e.year >= Number(today.slice(0, 4))).sort((a, b) => a.year - b.year);
        if (undated.length) return undated[0];
        return editions.slice().sort((a, b) => b.year - a.year || (months.length ? (a.start || '').localeCompare(b.start || '') : (b.start || '').localeCompare(a.start || '')))[0] || null;
    }
    function editionStatus(edition, today = todayInRome()) {
        if (!edition) return 'Le date esatte sono da confermare con l’organizzatore.';
        if (!edition.start) return (edition.year < Number(today.slice(0, 4)) ? 'Le informazioni si riferiscono al ' + edition.year + '. ' : '') + 'Le date esatte sono da confermare con l’organizzatore.';
        const past = edition.end < today ? 'Questa edizione è già passata. Le date della prossima sono da confermare. ' : '';
        if (edition.periodOnly) return past + 'È indicato il periodo complessivo: verifica i singoli giorni di apertura.';
        if (past) return past.trim();
        return edition.dateType === 'confirmed' ? '' : 'Le date del calendario generale sono da riconfermare con l’organizzatore.';
    }
    function deadlineStatus(participation, today = todayInRome()) {
        if (!participation.deadline) return participation.deadlineLabel || '';
        return (participation.deadline < today ? 'Termine scaduto: ' : 'Scadenza pubblicata: ') + dateLabel(participation.deadline)
            + (participation.deadlineLabel ? ' · ' + participation.deadlineLabel : '');
    }
    function feeLabel(event) {
        if (event.pricing) return 'Costi' + (event.pricing.period ? ' ' + event.pricing.period : '') + ': ' + event.pricing.label;
        return '';
    }
    function sortEvents(events, today = todayInRome(), months = []) {
        const reference = periodStart(today, months);
        const ranked = events.map(event => {
            const edition = selectEdition(event, today, months);
            let group = 2, date = '';
            if (edition) {
                if (edition.start && !edition.periodOnly && edition.end >= reference) {
                    group = 0;
                    date = edition.start < reference ? reference : edition.start;
                } else if ((edition.periodOnly && edition.end >= reference) || (!edition.start && edition.year >= Number(today.slice(0, 4)))) {
                    group = 1;
                } else {
                    group = 3;
                    date = edition.end || edition.start || String(edition.year);
                }
            }
            return { event, group, date };
        });
        ranked.sort((a, b) => a.group - b.group
            || (a.group === 3 && !months.length ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date))
            || a.event.name.localeCompare(b.event.name, 'it') || a.event.city.localeCompare(b.event.city, 'it'));
        return ranked.map(item => item.event);
    }
    const api = { MONTHS, CATEGORIES, SECTORS, ARTICLE_GROUPS, ARTICLE_TYPES, ARTICLE_OPTIONS, articleResearch, articleTypes, articleAffinity, articleAffinitySummary, matchesArticles, ATTENDANCE, attendanceInfo, attendanceCriteria, REPUTATIONS, reputationLevel, intervalMonths, filterEvents, project, clusterEvents, editionLabel, selectEdition, editionStatus, deadlineStatus, feeLabel, sortEvents };
    global.FiereCalendar = api;
    if (typeof document === 'undefined') return;

    const $ = id => document.getElementById(id);
    const state = { events: [], provinces: null, region: '', province: '', category: '', sector: '', articles: [], months: [], query: '', visible: 12, selected: '', view: HOME.slice(), ready: false };
    let searchTimer, mapMarkerTimer, hoveredCard, focusedCard, dateNoteId = 0;
    function node(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }
    function svgNode(tag, attrs) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [key, value] of Object.entries(attrs || {})) element.setAttribute(key, value);
        return element;
    }
    function appendEditionDate(element, edition, fallback) {
        element.append(document.createTextNode(edition ? editionLabel(edition) : fallback));
        const message = editionStatus(edition);
        if (!message) return element;
        const warning = node('span', 'fiere-date-warning');
        const button = node('button', 'fiere-date-warning-button', '!');
        const note = node('span', 'fiere-date-note', message);
        note.id = 'fiere-date-note-' + (++dateNoteId);
        note.hidden = true;
        button.type = 'button'; button.title = message;
        button.setAttribute('aria-label', 'Date da confermare. ' + message);
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', note.id);
        button.addEventListener('click', event => {
            event.preventDefault(); event.stopPropagation();
            note.hidden = !note.hidden;
            button.setAttribute('aria-expanded', String(!note.hidden));
        });
        warning.append(button, note); element.append(warning);
        return element;
    }
    function activate(element, callback) {
        element.addEventListener('click', callback);
        element.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback(); }
        });
    }
    function attendanceBadge(event, clickable = false) {
        const info = attendanceInfo(event);
        if (!info || !info.level) return null;
        const badge = node(clickable ? 'button' : 'span', 'fiere-attendance', info.label);
        badge.dataset.attendance = info.level;
        badge.title = info.total + ' · ' + info.year + ' · ' + info.status;
        if (clickable) {
            badge.type = 'button';
            badge.setAttribute('aria-label', info.label + '. ' + badge.title + '. Apri dati e fonte: ' + event.name);
            badge.addEventListener('click', () => openDetail(event));
        }
        return badge;
    }
    function renderAttendanceDetail(event) {
        const section = $('detail-attendance'), info = attendanceInfo(event);
        section.replaceChildren(); section.hidden = !info;
        if (!info) return;
        section.append(node('h3', '', 'Affluenza'));
        const badge = attendanceBadge(event);
        if (badge) section.append(badge);
        section.append(node('p', '', info.total + ' · edizione ' + info.year), node('p', 'fiere-attendance-meta', info.status));
        const details = node('details', 'fiere-attendance-evidence');
        details.append(node('summary', '', 'Dato, fonte e criterio'), node('p', '', info.record.note), node('p', '', info.comparison));
        const source = node('a', 'fiere-detail-link', info.record.source.label + ' ↗');
        source.href = info.record.source.url; source.target = '_blank'; source.rel = 'noopener noreferrer';
        details.append(source);
        for (const item of info.record.additionalSources || []) {
            if (!/^https:\/\/[^/\s]+/.test(item.url || '') || !item.label) continue;
            const extra = node('a', 'fiere-detail-link', item.label + ' ↗');
            extra.href = item.url; extra.target = '_blank'; extra.rel = 'noopener noreferrer'; details.append(extra);
        }
        details.append(node('p', '', 'Periodo: ' + dateLabel(info.record.start) + ' – ' + dateLabel(info.record.end) + '. Fonte consultata il ' + dateLabel(info.record.checkedAt) + '.'), node('p', '', attendanceCriteria()));
        section.append(details);
    }
    function periodLabel(event) {
        if (event.months.length === 12) return 'Tutto l’anno';
        return event.months.map(month => MONTHS[month - 1]).join(' / ');
    }
    function selectedMonthsLabel() {
        return !state.months.length ? 'Nessun mese selezionato' : state.months.length === 12 ? 'Tutti i mesi' : state.months.map(month => MONTHS[month - 1]).join(', ');
    }
    function syncURL() {
        const url = new URL(location.href);
        for (const key of ['mesi', 'regione', 'provincia', 'tipo', 'settore', 'articoli', 'rinomatezza', 'q']) url.searchParams.delete(key);
        if (state.months.length) url.searchParams.set('mesi', state.months.join(','));
        if (state.region) url.searchParams.set('regione', state.region);
        if (state.province) url.searchParams.set('provincia', state.province);
        if (state.category) url.searchParams.set('tipo', state.category);
        if (state.sector) url.searchParams.set('settore', state.sector);
        if (state.articles.length) url.searchParams.set('articoli', state.articles.join(','));
        if (state.query) url.searchParams.set('q', state.query);
        history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
    function readURL() {
        const params = new URLSearchParams(location.search);
        state.months = [...new Set((params.get('mesi') || '').split(',').map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= 12))];
        state.province = Object.values(REGION_PROVINCES).some(provinces => provinces.includes(params.get('provincia'))) ? params.get('provincia') || '' : '';
        state.region = !state.province && Object.hasOwn(REGION_PROVINCES, params.get('regione')) ? params.get('regione') : '';
        state.category = Object.hasOwn(CATEGORIES, params.get('tipo')) ? params.get('tipo') : '';
        state.sector = Object.hasOwn(SECTORS, params.get('settore')) ? params.get('settore') : '';
        state.articles = [...new Set(params.getAll('articoli').flatMap(value => value.split(',')))].filter(key => Object.hasOwn(ARTICLE_TYPES, key) && (!state.sector || ARTICLE_TYPES[key].sectors.includes(state.sector)));
        state.query = (params.get('q') || '').slice(0, 100);
        $('province-filter').value = state.province || (state.region ? 'regione:' + state.region : '');
        $('type-filter').value = state.category;
        $('sector-filter').value = state.sector;
        $('fair-search').value = state.query;
    }
    function positionArticleMenu() {
        if (!$('article-filter').open) return;
        const rect = $('article-summary').getBoundingClientRect();
        const headerBottom = Math.max(0, document.querySelector('header')?.getBoundingClientRect().bottom || 0);
        const below = innerHeight - rect.bottom - 12, above = rect.top - Math.max(12, headerBottom + 8);
        const openAbove = below < Math.min(280, above);
        $('article-filter').classList.toggle('opens-above', openAbove);
        $('article-filter').querySelector('.fiere-article-menu').style.maxHeight = Math.max(100, Math.min(360, openAbove ? above : below)) + 'px';
    }
    function initArticles() {
        for (let group = 0; group < ARTICLE_GROUPS.length; group++) {
            const fieldset = node('fieldset', 'fiere-article-group');
            fieldset.append(node('legend', '', ARTICLE_GROUPS[group]));
            for (const type of ARTICLE_OPTIONS) {
                if (type.group !== group) continue;
                const label = node('label', 'fiere-article-option');
                const input = node('input');
                input.type = 'checkbox'; input.value = type.key; input.name = 'articoli'; input.disabled = true;
                const count = node('span', 'fiere-article-count');
                count.setAttribute('aria-hidden', 'true');
                label.append(input, node('span', '', type.label), count);
                input.addEventListener('change', () => {
                    const types = optionTypes(type, state.sector);
                    state.articles = input.checked ? [...new Set([...state.articles, ...types])] : state.articles.filter(value => !types.includes(value));
                    changed(false);
                });
                fieldset.append(label);
            }
            $('article-options').append(fieldset);
        }
        $('clear-articles').addEventListener('click', () => { state.articles = []; changed(false); });
        $('article-filter').addEventListener('toggle', positionArticleMenu);
        window.addEventListener('resize', positionArticleMenu);
        window.addEventListener('scroll', positionArticleMenu, { passive: true });
        document.addEventListener('click', event => {
            if (!$('article-filter').contains(event.target)) $('article-filter').open = false;
        });
        $('article-filter').addEventListener('keydown', event => {
            if (event.key === 'Escape' && $('article-filter').open) {
                event.preventDefault(); $('article-filter').open = false; $('article-summary').focus();
            }
        });
    }
    function renderArticles() {
        const counts = Object.fromEntries(ARTICLE_OPTIONS.map(option => [option.key, 0]));
        const today = todayInRome();
        for (const event of filterEvents(state.events, { ...state, articles: [] })) {
            for (const option of ARTICLE_OPTIONS) {
                if (matchesArticles(event, optionTypes(option, state.sector), today)) counts[option.key]++;
            }
        }
        for (const input of $('article-options').querySelectorAll('input')) {
            const type = ARTICLE_OPTIONS.find(option => option.key === input.value);
            const available = optionTypes(type, state.sector);
            const selected = available.filter(key => state.articles.includes(key));
            input.disabled = !state.ready;
            input.checked = Boolean(available.length && selected.length === available.length);
            input.indeterminate = selected.length > 0 && selected.length < available.length;
            input.parentElement.hidden = !available.length;
            input.parentElement.querySelector('.fiere-article-count').textContent = String(counts[input.value]);
        }
        for (const group of $('article-options').children) group.hidden = ![...group.querySelectorAll('label')].some(label => !label.hidden);
        const selections = articleSelections(state.articles, state.sector);
        $('article-summary-text').textContent = !selections.length ? 'Tutte le tipologie' : selections.length === 1 ? selections[0].label : selections.length + ' tipologie selezionate';
        $('clear-articles').disabled = !state.articles.length;
        const chips = document.createDocumentFragment();
        for (const selection of selections) {
            const button = node('button', 'fiere-article-chip');
            button.type = 'button';
            button.setAttribute('aria-label', 'Rimuovi ' + selection.label);
            const cross = node('span', '', '×'); cross.setAttribute('aria-hidden', 'true');
            button.append(node('span', '', selection.label), cross);
            button.addEventListener('click', () => {
                state.articles = state.articles.filter(value => !selection.types.includes(value));
                changed(false); $('article-summary').focus();
            });
            chips.append(button);
        }
        $('selected-articles').replaceChildren(chips);
        $('selected-articles').hidden = !state.articles.length;
        positionArticleMenu();
    }
    function renderMonths() {
        const pool = filterEvents(state.events, state, true);
        for (const button of $('month-bar').children) {
            const month = Number(button.dataset.month);
            button.setAttribute('aria-pressed', String(state.months.includes(month)));
            const count = pool.filter(event => event.months.includes(month)).length;
            button.setAttribute('aria-label', MONTHS[month - 1] + ', ' + count + ' eventi');
        }
    }
    function openArticleAffinity(event) {
        const assessment = articleAffinitySummary(event, state.articles);
        $('fit-event-name').textContent = event.name + ' · ' + event.city;
        const items = document.createDocumentFragment();
        for (const item of assessment.items) {
            const row = node('li', 'fiere-fit-item');
            const head = node('div', 'fiere-fit-item-head');
            const score = node('strong', 'fiere-fit-value', item.score === null ? 'Da valutare' : item.score + '/10');
            if (item.score !== null) score.dataset.score = String(item.score);
            head.append(node('h3', '', item.label), score);
            row.append(head, node('p', '', item.reason));
            if (item.condition) row.append(node('p', 'fiere-fit-condition', item.condition));
            row.append(node('p', 'fiere-fit-provenance', item.method === 'reviewed' ? 'Verifica sulle fonti dell’organizzatore · ' + dateLabel(item.checkedAt) : 'Stima dai settori e dal tema della scheda'));
            if (item.sources) {
                const sources = node('div', 'fiere-fit-sources');
                for (const source of item.sources) {
                    const link = node('a', '', source.label + ' ↗');
                    link.href = source.url; link.target = '_blank'; link.rel = 'noopener noreferrer'; sources.append(link);
                }
                row.append(sources);
            }
            items.append(row);
        }
        $('fit-items').replaceChildren(items);
        $('fit-selection-note').hidden = assessment.items.length < 2;
        $('fit-source-text').textContent = event.sectors || 'La scheda non riporta settori sufficientemente precisi.';
        $('fit-source').href = event.source.url;
        $('fit-source').textContent = event.source.label + ' ↗';
        $('fit-source-date').textContent = event.source.checkedAt ? 'Fonte consultata il ' + dateLabel(event.source.checkedAt) : '';
        prepareSources($('article-fit-dialog'), event);
        $('article-fit-dialog').showModal();
    }
    function articleAffinityBadge(event) {
        const assessment = articleAffinitySummary(event, state.articles);
        if (assessment.score === null) return null;
        const button = node('button', 'fiere-fit-badge');
        button.type = 'button';
        button.dataset.score = String(assessment.score);
        const value = node('strong', 'fiere-fit-number', String(assessment.score));
        value.append(node('span', '', '/10'));
        button.append(value);
        button.setAttribute('aria-label', 'Affinità ' + assessment.best.label + ': ' + assessment.score + ' su 10. ' + (assessment.items.length > 1 ? 'Voto migliore tra ' + assessment.items.length + ' articoli. ' : '') + 'Vedi motivi per ' + event.name);
        button.title = button.getAttribute('aria-label');
        button.addEventListener('click', () => openArticleAffinity(event));
        return button;
    }
    function renderList(events) {
        const fragment = document.createDocumentFragment();
        for (const event of events.slice(0, state.visible)) {
            const card = node('article', 'fiere-card');
            card.dataset.eventId = event.id;
            card.dataset.province = event.province;
            card.dataset.city = event.city;
            card.addEventListener('mouseenter', () => { hoveredCard = card; updateMapHighlight(); });
            card.addEventListener('mouseleave', () => { hoveredCard = null; updateMapHighlight(); });
            card.addEventListener('focusin', () => { focusedCard = card; updateMapHighlight(); });
            card.addEventListener('focusout', e => {
                if (!card.contains(e.relatedTarget)) { focusedCard = null; updateMapHighlight(); }
            });
            const head = node('div', 'fiere-card-head');
            const edition = selectEdition(event, todayInRome(), state.months);
            head.append(node('h3', '', event.name));
            const category = node('span', 'fiere-tag', CATEGORIES[event.category]);
            category.dataset.category = event.category;
            const button = node('button', 'fiere-card-button', 'Apri scheda ↗');
            button.type = 'button';
            button.setAttribute('aria-label', 'Apri scheda: ' + event.name + ', ' + event.city);
            button.addEventListener('click', () => openDetail(event));
            const foot = node('div', 'fiere-card-foot');
            foot.append(category, button);
            const body = node('div', 'fiere-card-body');
            const content = node('div', 'fiere-card-content');
            const side = node('div', 'fiere-card-side');
            if (event.managedAvailability) {
                const count = event.managedAvailability;
                const available = node('p', 'fiere-availability', count.available === 0 ? 'Sold out · Posti esauriti' : count.available + (count.available === 1 ? ' posto disponibile' : ' posti disponibili') + ' su ' + count.capacity);
                available.dataset.soldOut = String(count.available === 0);
                content.append(available);
            }
            const attendance = attendanceBadge(event, true);
            if (attendance) { const wrap = node('div', 'fiere-card-attendance'); wrap.append(attendance); side.append(wrap); }
            const affinity = articleAffinityBadge(event);
            if (affinity) side.append(affinity);
            content.append(node('p', '', event.city + ' · ' + event.province), appendEditionDate(node('p', 'fiere-card-period'), edition, periodLabel(event)));
            const fee = feeLabel(event);
            if (fee) {
                const cost = node('p', 'fiere-card-cost', fee);
                cost.dataset.known = 'true';
                content.append(cost);
            }
            body.append(content);
            if (side.childElementCount) { body.append(side); body.classList.add('fiere-card-body-rated'); }
            const actions = node('div', 'sf-fair-actions');
            for (const action of ['saveFair', 'remindFair']) {
                const control = node('button', 'saved-fair-button'); control.type = 'button'; control.dataset[action] = '';
                control.dataset.fairKind = event.managedEventId ? 'organizer' : 'catalog'; control.dataset.fairId = event.managedEventId || event.id;
                control.setAttribute('aria-label', action === 'saveFair' ? 'Salva la fiera' : 'Avvisami');
                control.title = action === 'saveFair' ? 'Salva' : 'Avvisami';
                const icon = node('i', action === 'saveFair' ? 'far fa-bookmark' : 'far fa-bell'); icon.setAttribute('aria-hidden', 'true');
                control.append(icon); actions.append(control);
            }
            head.append(actions);
            card.append(head, body, foot);
            fragment.append(card);
        }
        $('fair-list').replaceChildren(fragment);
        global.SavedFairs?.refresh();
        hoveredCard = null; focusedCard = null;
        updateMapHighlight();
        $('fair-list').setAttribute('aria-busy', 'false');
        $('empty-results').hidden = events.length > 0 || !state.ready;
        $('load-more').hidden = state.visible >= events.length;
        $('list-count').textContent = String(events.length);
    }
    function polygons(feature) { return feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates; }
    function drawProvinces() {
        const fragment = document.createDocumentFragment();
        for (const feature of state.provinces.features) {
            const province = feature.properties.name;
            const d = polygons(feature).map(polygon => polygon.map(ring => ring.map((point, i) => {
                const projected = project(point[0], point[1]);
                return (i === 0 ? 'M' : 'L') + projected.map(n => n.toFixed(2)).join(',');
            }).join(' ') + ' Z').join(' ')).join(' ');
            const path = svgNode('path', { d, class: 'fiere-province', 'data-province': province, role: 'button', tabindex: '0', 'aria-label': 'Mostra le fiere nella provincia di ' + province, 'fill-rule': 'evenodd' });
            const title = svgNode('title'); title.textContent = province; path.append(title);
            activate(path, () => { if (!state.ready) return; state.region = ''; state.province = province; $('province-filter').value = province; changed(true); });
            fragment.append(path);
        }
        $('map-provinces').replaceChildren(fragment);
    }
    function fitProvince() {
        const features = state.provinces?.features.filter(item => state.province ? item.properties.name === state.province : state.region && REGION_PROVINCES[state.region].includes(item.properties.name)) || [];
        if (!features.length) { state.view = HOME.slice(); return; }
        const points = features.flatMap(feature => polygons(feature).flat(2)).map(point => project(...point));
        const minX = Math.min(...points.map(p => p[0])), maxX = Math.max(...points.map(p => p[0]));
        const minY = Math.min(...points.map(p => p[1])), maxY = Math.max(...points.map(p => p[1]));
        const width = Math.max(maxX - minX + 55, (maxY - minY + 55) * HOME[2] / HOME[3]);
        const height = width * HOME[3] / HOME[2];
        state.view = [(minX + maxX - width) / 2, (minY + maxY - height) / 2, width, height];
    }
    function updateMapView() {
        $('italy-map').setAttribute('viewBox', state.view.join(' '));
        $('map-zoom-in').disabled = state.view[2] <= 12;
        $('map-zoom-out').disabled = state.view[2] >= HOME[2];
    }
    // Keep existing SVG markers during gestures; regroup once zoom input settles.
    function scheduleMapMarkers() {
        clearTimeout(mapMarkerTimer);
        mapMarkerTimer = setTimeout(() => renderMap(filterEvents(state.events, state)), 120);
    }
    function updateMapHighlight() {
        const card = hoveredCard || focusedCard;
        for (const item of $('fair-list').children) {
            item.classList.toggle('is-preview', item === card);
        }
        const previewProvince = !state.province && !state.region ? card?.dataset.province || '' : '';
        const previewEvent = (state.province || state.region) ? card?.dataset.eventId || '' : '';
        for (const path of $('map-provinces').children) {
            path.classList.toggle('is-selected', path.dataset.province === state.province || Boolean(state.region && REGION_PROVINCES[state.region].includes(path.dataset.province)));
            path.classList.toggle('is-preview', path.dataset.province === previewProvince);
        }
        for (const marker of $('map-markers').children) {
            marker.classList.toggle('is-preview', Boolean(previewEvent) && marker.dataset.events.split(',').includes(previewEvent));
        }
        $('map-caption').textContent = previewProvince || (previewEvent ? card.dataset.city : 'Trascina e ingrandisci');
    }
    function renderMap(events) {
        clearTimeout(mapMarkerTimer);
        updateMapView();
        // Convert screen pixels to the SVG coordinate system to keep markers tappable on zoom.
        const scale = Math.max(state.view[2] / Math.max($('italy-map').clientWidth, 1), state.view[3] / Math.max($('italy-map').clientHeight, 1));
        const groups = state.months.length ? clusterEvents(events, 28 * scale) : [];
        const fragment = document.createDocumentFragment();
        for (const group of groups) {
            const cities = [...new Set(group.events.map(event => event.city))];
            const label = group.events.length + (group.events.length === 1 ? ' evento' : ' eventi') + ' · ' + cities.join(', ');
            const marker = svgNode('g', { class: 'fiere-marker', transform: 'translate(' + group.x + ',' + group.y + ')', role: 'button', tabindex: '0', 'aria-label': label, 'data-events': group.events.map(event => event.id).join(',') });
            marker.append(svgNode('circle', { r: 20 * scale, fill: 'transparent' }));
            marker.append(svgNode('circle', { r: (group.events.length > 1 ? 11 : 7) * scale, class: 'pin pin-' + (group.events.length > 1 ? 'cluster' : group.events[0].category) }));
            marker.append(svgNode('circle', { r: (group.events.length > 1 ? 16 : 12) * scale, class: 'preview-ring' }));
            if (group.events.length > 1) {
                const text = svgNode('text', { 'font-size': 10 * scale, style: 'font-size:' + 10 * scale + 'px' });
                text.textContent = String(group.events.length); marker.append(text);
            }
            if (group.events.some(event => event.id === state.selected)) marker.append(svgNode('circle', { r: 15 * scale, class: 'selection-ring' }));
            const title = svgNode('title'); title.textContent = group.events.map(event => event.name + ' (' + event.city + ')').join('\n'); marker.append(title);
            activate(marker, () => openPopup(group));
            fragment.append(marker);
        }
        $('map-markers').replaceChildren(fragment);
        updateMapHighlight();
    }
    function openPopup(group) {
        const cities = [...new Set(group.events.map(event => event.city))];
        $('popup-title').textContent = cities.length === 1 ? cities[0] + ' · ' + group.events.length + ' eventi' : group.events.length + ' eventi nella zona';
        const fragment = document.createDocumentFragment();
        for (const event of sortEvents(group.events, todayInRome(), state.months)) {
            const button = node('button', 'fiere-popup-event', event.name + ' ↗');
            button.type = 'button';
            button.append(node('span', '', event.city + ' · ' + periodLabel(event)));
            const attendance = attendanceBadge(event);
            if (attendance) button.append(attendance);
            button.addEventListener('click', () => openDetail(event));
            fragment.append(button);
        }
        $('popup-events').replaceChildren(fragment);
        $('map-popup').hidden = false;
        $('close-popup').focus({ preventScroll: true });
    }
    function prepareSources(dialog, event) {
        if (global.FiereAccess) { global.FiereAccess.prepare(dialog, event.id); return; }
        // Missing access script must never expose a direct external source link.
        dialog.querySelectorAll('a[href^="https://"]').forEach(link => {
            if (new URL(link.href).origin === 'https://subingresso.it') return;
            link.href = '/fiere?fiera=' + encodeURIComponent(event.id);
            link.removeAttribute('target');
        });
    }
    function openDetail(event) {
        state.selected = event.id;
        renderMap(filterEvents(state.events, state));
        $('detail-category').textContent = CATEGORIES[event.category];
        $('detail-category').dataset.category = event.category;
        $('detail-title').textContent = event.name;
        $('detail-page-link').href = event.managedEventId ? '/evento?id=' + encodeURIComponent(event.managedEventId) : '/fiere/' + encodeURIComponent(event.id);
        const saveFair = $('detail-save-fair');
        saveFair.dataset.fairKind = event.managedEventId ? 'organizer' : 'catalog';
        saveFair.dataset.fairId = event.managedEventId || event.id;
        saveFair.closest('.sf-fair-actions').querySelectorAll('[data-remind-fair]').forEach(button => {
            button.dataset.fairKind = saveFair.dataset.fairKind; button.dataset.fairId = saveFair.dataset.fairId;
        });
        global.SavedFairs?.setFair(saveFair, saveFair.dataset.fairKind, saveFair.dataset.fairId);
        $('detail-location').textContent = event.city + ' · ' + event.province;
        $('detail-months').textContent = periodLabel(event);
        $('detail-frequency').textContent = event.frequencyNote || '';
        $('detail-frequency').hidden = !event.frequencyNote;
        let availability = $('detail-availability');
        if (!availability) { availability = node('p', 'fiere-availability'); availability.id = 'detail-availability'; $('detail-title').after(availability); }
        availability.hidden = !event.managedAvailability;
        if (event.managedAvailability) { const count = event.managedAvailability; availability.textContent = count.available === 0 ? 'Sold out · Posti esauriti' : count.available + (count.available === 1 ? ' posto disponibile' : ' posti disponibili') + ' su ' + count.capacity; availability.dataset.soldOut = String(count.available === 0); }
        $('detail-description').textContent = event.summary || '';
        $('detail-description').hidden = !event.summary;
        renderAttendanceDetail(event);
        const editions = document.createDocumentFragment();
        for (const edition of event.editions || []) {
            const item = node('div', 'fiere-edition');
            item.append(appendEditionDate(node('strong', ''), edition));
            const source = node('a', '', 'Fonte delle date ↗');
            source.href = edition.sourceUrl; source.target = '_blank'; source.rel = 'noopener noreferrer';
            item.append(source); editions.append(item);
        }
        $('detail-editions').replaceChildren(editions);
        $('detail-editions-empty').hidden = Boolean(event.editions?.length);
        const facts = document.createDocumentFragment();
        for (const [label, value] of [['Luogo', event.venue], ['Organizzatore', event.organizer], ['Orari indicati dalla fonte', event.hours], ['Categorie', event.merchandiseSectors.map(sector => SECTORS[sector]).join(' · ') || 'Settori da verificare'], ['Tipologie di articolo', articleTypes(event).map(key => ARTICLE_TYPES[key].label).join(' · ')], ['Settori nella fonte', event.sectors], ['Posteggi dichiarati', event.stallCount ? event.stallCount + ' · ' + (event.stallCountNote || 'organico della manifestazione, non posti liberi') : '']]) {
            if (!value) continue;
            facts.append(node('dt', '', label), node('dd', '', value));
        }
        $('detail-facts').replaceChildren(facts);
        const participation = event.participation;
        const labels = { public: 'Fiera su area pubblica', selected: 'Ammissione tramite organizzatore', exhibitors: 'Partecipazione come espositore', check: 'Condizioni da verificare' };
        $('detail-participation-label').textContent = labels[participation.type];
        $('detail-participation-note').textContent = participation.note;
        $('detail-deadline').textContent = deadlineStatus(participation);
        $('detail-deadline').hidden = !$('detail-deadline').textContent;
        $('detail-costs').textContent = event.pricing?.details || participation.costs || 'Importo non verificato per questa fiera. Chiedi all’organizzatore la quota del banco, il canone e gli eventuali servizi aggiuntivi.';
        $('detail-costs-meta').hidden = !event.pricing;
        if (event.pricing) $('detail-costs-meta').textContent = (event.pricing.period ? 'Tariffe ' + event.pricing.period : 'Fonte senza anno tariffario esplicito: conferma l’edizione') + ' · fonte consultata il ' + dateLabel(event.pricing.checkedAt);
        const costSource = event.pricing?.sourceUrl || (participation.costs ? participation.url : '');
        $('detail-costs-source').hidden = !costSource;
        if (costSource) $('detail-costs-source').href = costSource;
        $('detail-participation-link').hidden = !participation.url;
        if (participation.url) $('detail-participation-link').href = participation.url;
        const contacts = document.createDocumentFragment();
        for (const [type, value] of Object.entries(event.contacts || {})) {
            if (!['phone', 'email', 'pec'].includes(type) || !value) continue;
            const contact = node('p', '');
            contact.append(node('span', '', ({ phone: 'Telefono', email: 'Email', pec: 'PEC' })[type] + ': '));
            const link = node('a', '', value);
            link.href = type === 'phone' ? 'tel:' + value.replace(/[^\d+]/g, '') : 'mailto:' + value;
            contact.append(link); contacts.append(contact);
        }
        $('detail-contacts').replaceChildren(contacts);
        $('detail-source').href = event.source.url;
        $('detail-source-label').textContent = event.source.label + (event.source.checkedAt ? ' · consultata il ' + dateLabel(event.source.checkedAt) : ' · date dell’edizione da verificare');
        $('detail-calendar-source').hidden = !event.calendarSource || event.calendarSource.url === event.source.url;
        if (event.calendarSource) { $('detail-calendar-source').href = event.calendarSource.url; $('detail-calendar-source').textContent = event.calendarSource.label + ' ↗'; }
        $('detail-annunci').href = '/annunci?regione=' + encodeURIComponent(event.region);
        prepareSources($('fair-dialog'), event);
        $('fair-dialog').showModal();
    }
    function render() {
        const events = sortEvents(filterEvents(state.events, state), todayInRome(), state.months);
        renderMonths(); renderArticles(); renderList(events); renderMap(events);
        const articleCount = articleSelections(state.articles, state.sector).length;
        $('results-summary').textContent = events.length + (events.length === 1 ? ' evento' : ' eventi') + ' · ' + (state.province || state.region || 'Tutta Italia') + ' · ' + selectedMonthsLabel() + (state.sector ? ' · ' + SECTORS[state.sector] : '') + (articleCount ? ' · ' + articleCount + (articleCount === 1 ? ' tipologia' : ' tipologie') : '');
        const extraCount = Number(Boolean(state.query)) + Number(Boolean(state.sector)) + Number(Boolean(state.category));
        $('extra-filter-count').textContent = String(extraCount);
        $('extra-filter-count').hidden = !extraCount;
        $('extra-filters').querySelector('summary').setAttribute('aria-label', 'Altri filtri' + (extraCount ? ', ' + extraCount + ' attivi' : ''));
        $('province-filter').style.fontWeight = state.region ? '700' : '400';
        syncURL();
    }
    function changed(refit) {
        state.visible = 12; state.selected = ''; $('map-popup').hidden = true;
        if (refit) fitProvince();
        if (state.ready) render();
    }
    function reset() {
        clearTimeout(searchTimer);
        Object.assign(state, { region: '', province: '', category: '', sector: '', articles: [], months: [], query: '', selected: '', view: HOME.slice(), visible: 12 });
        $('article-filter').open = false;
        $('article-fit-dialog').close();
        for (const id of ['province-filter', 'type-filter', 'sector-filter', 'fair-search', 'month-from', 'month-to']) $(id).value = '';
        changed(false);
    }
    async function fetchJSON(url) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return await response.json();
        } finally { clearTimeout(timer); }
    }
    let editorialEvents = [], managedRequest = 0, managedSnapshot = '';
    async function loadManagedEvents() {
        if (!global.EventData || typeof SUPABASE_URL === 'undefined') return;
        const request = ++managedRequest;
        const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 8000);
        try {
            const response = await fetch(SUPABASE_URL + '/rest/v1/rpc/published_organizer_events', {method:'POST',headers:{apikey:SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:'{}',signal:controller.signal});
            if (!response.ok) throw new Error('Eventi non disponibili');
            const data = await response.json();
            if (!Array.isArray(data)) throw new Error('Dati evento non validi');
            const managed = data.map(global.EventData.toCalendar);
            if (request !== managedRequest) return;
            const snapshot = JSON.stringify(data);
            $('organizer-catalog-error').hidden = true;
            if (snapshot === managedSnapshot) return;
            managedSnapshot = snapshot;
            state.events = editorialEvents.concat(managed);
            $('organizer-catalog-error').hidden = true;
            $('catalog-count').textContent = String(state.events.length);
            render();
            if ($('fair-dialog').open && state.selected?.startsWith('organizzatore-')) {
                const current = managed.find(event => event.id === state.selected);
                const availability = $('detail-availability');
                if (current?.managedAvailability && availability) { const count = current.managedAvailability; availability.textContent = count.available === 0 ? 'Sold out · Posti esauriti' : count.available + (count.available === 1 ? ' posto disponibile' : ' posti disponibili') + ' su ' + count.capacity; availability.dataset.soldOut = String(count.available === 0); }
                if (!current && availability) { availability.hidden = false; availability.textContent = 'Evento non più disponibile. Ricarica la pagina.'; }
            }
        } catch (_) { if (request === managedRequest) $('organizer-catalog-error').hidden = false; }
        finally { clearTimeout(timer); }
    }
    async function loadCatalog() {
        $('retry-catalog').disabled = true;
        $('catalog-error').hidden = true;
        $('fair-list').setAttribute('aria-busy', 'true');
        try {
            const data = await fetchJSON('/data/fiere.json?v=89');
            if (!Array.isArray(data.provinces) || !data.provinces.length || new Set(data.provinces).size !== data.provinces.length
                || !data.provinces.every(province => typeof province === 'string' && province) || !Array.isArray(data.events) || !data.events.length || !data.events.every(event => typeof event.id === 'string'
                && typeof event.province === 'string' && data.provinces.includes(event.province)
                && typeof event.name === 'string' && Array.isArray(event.months) && event.months.length
                && event.months.every(month => Number.isInteger(month) && month >= 1 && month <= 12)
                && Number.isFinite(event.lat) && Number.isFinite(event.lng) && Object.hasOwn(CATEGORIES, event.category)
                && Array.isArray(event.merchandiseSectors) && event.merchandiseSectors.every(sector => Object.hasOwn(SECTORS, sector))
                && typeof event.source?.url === 'string' && /^https:\/\//.test(event.source.url)
                && event.participation && Array.isArray(event.editions))) throw new Error('Invalid catalog');
            state.events = data.events;
            editorialEvents = data.events;
            $('catalog-count').textContent = String(state.events.length);
            $('catalog-info').textContent = data.eventsWithEditionData + ' schede con edizioni documentate · aggiornato il ' + dateLabel(data.catalogUpdatedAt);
            const previous = $('province-filter').value;
            $('province-filter').replaceChildren(node('option', '', 'Tutta Italia'));
            $('province-filter').firstChild.value = '';
            for (const region of Object.keys(REGION_PROVINCES).sort((a, b) => a.localeCompare(b, 'it'))) {
                const option = node('option', '', region);
                option.value = 'regione:' + region;
                option.style.fontWeight = '700';
                $('province-filter').append(option);
                for (const province of REGION_PROVINCES[region]) {
                    const child = node('option', '', '\u00a0\u00a0\u00a0' + province);
                    child.value = province;
                    child.style.fontWeight = '400';
                    $('province-filter').append(child);
                }
            }
            if (!state.ready) readURL(); else $('province-filter').value = previous;
            state.ready = true; $('province-filter').disabled = false; $('sector-filter').disabled = false; fitProvince(); render();
            const requested = state.events.find(event => event.id === new URLSearchParams(location.search).get('fiera'));
            if (requested && global.FiereAccess) { openDetail(requested); global.FiereAccess.resume(requested); }
            loadManagedEvents();
        } catch (error) {
            $('catalog-error').hidden = false;
            $('fair-list').setAttribute('aria-busy', 'false');
            $('results-summary').textContent = 'Calendario non disponibile. Riprova per caricare gli eventi.';
        } finally { $('retry-catalog').disabled = false; }
    }
    async function loadMap() {
        $('retry-map').disabled = true; $('map-error').hidden = true;
        try {
            const data = await fetchJSON('/data/italia-province.json?v=1');
            if (!Array.isArray(data.features) || !data.features.length
                || new Set(data.features.map(feature => feature.properties?.name)).size !== data.features.length
                || !data.features.every(feature => typeof feature.properties?.name === 'string'
                    && ['Polygon', 'MultiPolygon'].includes(feature.geometry?.type) && Array.isArray(feature.geometry.coordinates))) throw new Error('Invalid boundaries');
            state.provinces = data; drawProvinces(); fitProvince();
            renderMap(filterEvents(state.events, state));
        } catch (error) { $('map-error').hidden = false; }
        finally { $('retry-map').disabled = false; }
    }
    function zoom(factor, anchor = [state.view[0] + state.view[2] / 2, state.view[1] + state.view[3] / 2], deferMarkers = false) {
        const width = Math.max(12, Math.min(HOME[2], state.view[2] * factor));
        const height = width * HOME[3] / HOME[2];
        const ratio = width / state.view[2];
        state.view = [anchor[0] - (anchor[0] - state.view[0]) * ratio, anchor[1] - (anchor[1] - state.view[1]) * ratio, width, height];
        $('map-popup').hidden = true;
        if (deferMarkers) { updateMapView(); scheduleMapMarkers(); }
        else renderMap(filterEvents(state.events, state));
    }
    function initMapGestures() {
        const map = $('italy-map'), pointers = new Map();
        let moved = false;
        const point = (x, y) => {
            const p = map.createSVGPoint(); p.x = x; p.y = y;
            const result = p.matrixTransform(map.getScreenCTM().inverse());
            return [result.x, result.y];
        };
        map.addEventListener('wheel', event => {
            event.preventDefault();
            const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? map.clientHeight : 1);
            zoom(Math.exp(Math.max(-1, Math.min(1, delta * .002))), point(event.clientX, event.clientY), true);
        }, { passive: false });
        map.addEventListener('pointerdown', event => {
            if (event.button !== 0) return;
            if (!pointers.size) moved = false;
            pointers.set(event.pointerId, { x: event.clientX, y: event.clientY, startX: event.clientX, startY: event.clientY });
        });
        window.addEventListener('pointermove', event => {
            const previous = pointers.get(event.pointerId);
            if (!previous) return;
            if (!moved && pointers.size === 1 && Math.hypot(event.clientX - previous.startX, event.clientY - previous.startY) < 5) return;
            moved = true; map.classList.add('is-dragging');
            if (event.isTrusted && !map.hasPointerCapture(event.pointerId)) map.setPointerCapture(event.pointerId);
            const old = [...pointers.values()];
            pointers.set(event.pointerId, { ...previous, x: event.clientX, y: event.clientY });
            const current = [...pointers.values()];
            const center = items => items.length > 1 ? [(items[0].x + items[1].x) / 2, (items[0].y + items[1].y) / 2] : [items[0].x, items[0].y];
            const from = point(...center(old)), to = point(...center(current));
            state.view[0] += from[0] - to[0]; state.view[1] += from[1] - to[1];
            if (current.length === 2) {
                const distance = items => Math.hypot(items[0].x - items[1].x, items[0].y - items[1].y);
                const ratio = distance(old) / Math.max(1, distance(current));
                const width = Math.max(12, Math.min(HOME[2], state.view[2] * ratio));
                const scale = width / state.view[2];
                state.view = [from[0] - (from[0] - state.view[0]) * scale, from[1] - (from[1] - state.view[1]) * scale, width, width * HOME[3] / HOME[2]];
            }
            updateMapView();
            $('map-popup').hidden = true;
            if (current.length === 2) scheduleMapMarkers();
        });
        const release = event => {
            pointers.delete(event.pointerId);
            if (map.hasPointerCapture(event.pointerId)) map.releasePointerCapture(event.pointerId);
            if (!pointers.size) map.classList.remove('is-dragging');
        };
        window.addEventListener('pointerup', release);
        window.addEventListener('pointercancel', release);
        map.addEventListener('click', event => { if (moved) { event.preventDefault(); event.stopImmediatePropagation(); } }, true);
        map.addEventListener('dblclick', event => { event.preventDefault(); zoom(.5, point(event.clientX, event.clientY)); });
    }
    function init() {
        initMapGestures();
        initArticles();
        for (let i = 0; i < 12; i++) {
            const button = node('button', 'fiere-month'); button.type = 'button'; button.dataset.month = String(i + 1);
            button.setAttribute('aria-pressed', 'false'); button.setAttribute('aria-label', MONTHS[i]); button.title = MONTHS[i];
            button.append(node('strong', '', MONTHS[i].slice(0, 3)));
            button.addEventListener('click', () => {
                const month = i + 1;
                state.months = state.months.includes(month) ? state.months.filter(item => item !== month) : [...state.months, month].sort((a, b) => a - b);
                $('month-from').value = ''; $('month-to').value = ''; changed(false);
            });
            $('month-bar').append(button);
            for (const id of ['month-from', 'month-to']) { const option = node('option', '', MONTHS[i]); option.value = String(i + 1); $(id).append(option); }
        }
        for (const id of ['month-from', 'month-to']) $(id).addEventListener('change', () => {
            const from = Number($('month-from').value), to = Number($('month-to').value);
            if (!from || !to) return;
            state.months = intervalMonths(from, to); changed(false);
        });
        $('province-filter').addEventListener('change', () => { const value = $('province-filter').value; state.region = value.startsWith('regione:') ? value.slice(8) : ''; state.province = state.region ? '' : value; changed(true); });
        $('type-filter').addEventListener('change', () => { state.category = $('type-filter').value; changed(false); });
        $('sector-filter').addEventListener('change', () => {
            state.sector = $('sector-filter').value;
            state.articles = state.articles.filter(key => !state.sector || ARTICLE_TYPES[key].sectors.includes(state.sector));
            changed(false);
        });
        $('fair-search').addEventListener('input', () => {
            state.query = $('fair-search').value;
            clearTimeout(searchTimer); searchTimer = setTimeout(() => changed(false), 100);
        });
        for (const id of ['reset-filters', 'empty-reset']) $(id).addEventListener('click', reset);
        $('load-more').addEventListener('click', () => { state.visible += 50; renderList(sortEvents(filterEvents(state.events, state), todayInRome(), state.months)); });
        $('close-popup').addEventListener('click', () => { $('map-popup').hidden = true; });
        $('map-zoom-in').addEventListener('click', () => zoom(0.7));
        $('map-zoom-out').addEventListener('click', () => zoom(1 / 0.7));
        $('map-home').addEventListener('click', () => { state.view = HOME.slice(); $('map-popup').hidden = true; renderMap(filterEvents(state.events, state)); });
        $('close-detail').addEventListener('click', () => $('fair-dialog').close());
        $('close-article-fit').addEventListener('click', () => $('article-fit-dialog').close());
        $('article-fit-dialog').addEventListener('click', event => {
            if (event.target !== $('article-fit-dialog')) return;
            const rect = $('article-fit-dialog').getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('article-fit-dialog').close();
        });
        $('fair-dialog').addEventListener('click', event => { if (event.target === $('fair-dialog')) {
            const rect = $('fair-dialog').getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('fair-dialog').close();
        } });
        $('retry-catalog').addEventListener('click', loadCatalog);
        $('retry-organizer-catalog')?.addEventListener('click', loadManagedEvents);
        setInterval(() => { if (!document.hidden && state.ready) loadManagedEvents(); }, 30000);
        window.addEventListener('focus', () => { if (state.ready) loadManagedEvents(); });
        document.addEventListener('visibilitychange', () => { if (!document.hidden && state.ready) loadManagedEvents(); });
        $('retry-map').addEventListener('click', loadMap);
        let resizeTimer;
        window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (state.ready) renderMap(filterEvents(state.events, state)); }, 100); });
        loadCatalog(); loadMap();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
