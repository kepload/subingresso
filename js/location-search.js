// Suggerimenti geografici completi, condivisi dalla home e dalla pagina annunci.
(function () {
    'use strict';
    const { normalize, canonicalRegion, forEachChunked } = window.ComuniItaliani;
    const compactKey = key => key.replace(/\b(?:s|san|sant|santo|santa)\b/g, 'san').replace(/ /g, '');
    const compact = value => compactKey(normalize(value));
    let rows = [];
    let exactNames = new Map();
    let coreNames = new Map();
    const placeKey = value => normalize(value).replace(/\b(?:a|di|del|della|delle|dei|degli|da|de|d|l)\b/g, '').replace(/\s+/g, ' ').trim();
    const listingRecordsCache = new Map();
    let rowsById = new Map();
    let provinceCodes = new Set();
    let geo = [];
    let readyPromise;
    let dataVersion = 0;
    const matchesCache = new Map();
    const nonFuzzyMisses = new Set();
    let terms = [];
    let termRows = [];
    let rowsByProvince = new Map();
    let fuzzyWorker;
    let workerFailed = false;
    let requestId = 0;
    const workerRequests = new Map();
    const workerUrl = '/js/location-search-worker.js?v=3';

    function load() {
        if (!readyPromise) {
            readyPromise = window.ComuniItaliani.load().then(async data => {
                rows = [];
                await forEachChunked(data, row => rows.push({ ...row, _compact: [...new Set(row._keys.map(compactKey))],
                    _context: normalize(`${row.nome} ${row.provincia} ${row.sigla} ${row.regione}`) }));
                exactNames = new Map();
                coreNames = new Map();
                listingRecordsCache.clear();
                rowsById = new Map();
                provinceCodes = new Set();
                matchesCache.clear();
                nonFuzzyMisses.clear();
                const names = new Map();
                rowsByProvince = new Map();
                await forEachChunked(rows, row => {
                    rowsById.set(row.id, row);
                    provinceCodes.add(row.sigla);
                    if (!rowsByProvince.has(row.sigla)) rowsByProvince.set(row.sigla, []);
                    rowsByProvince.get(row.sigla).push(row);
                    for (const name of new Set(row._compact)) {
                        if (!names.has(name)) names.set(name, []);
                        names.get(name).push(row);
                    }
                });
                terms = [...names.keys()];
                termRows = [...names.values()];
                await forEachChunked(rows, row => {
                    for (const key of new Set([...row._keys, ...row._compact])) {
                        if (!exactNames.has(key)) exactNames.set(key, []);
                        exactNames.get(key).push(row);
                        const core = placeKey(key);
                        if (!coreNames.has(core)) coreNames.set(core, new Set());
                        coreNames.get(core).add(row);
                    }
                });
                dataVersion++;
                return rows;
            }).catch(error => { readyPromise = null; throw error; });
        }
        return readyPromise;
    }

    let geoPromise;
    function loadGeo() {
        if (!geoPromise) {
            geoPromise = (async () => {
                for (const cache of ['force-cache', 'reload']) {
                    const controller = new AbortController();
                    const timeout = setTimeout(() => controller.abort(), 8000);
                    try {
                        const response = await fetch('/data/comuni.json', { cache, signal: controller.signal });
                        if (!response.ok) throw new Error('Coordinate non disponibili');
                        const data = await response.json();
                        if (!Array.isArray(data) || !data.length) throw new Error('Coordinate incomplete');
                        geo = data.filter(row => Number.isFinite(row.lat) && Number.isFinite(row.lng))
                            .map(row => ({ ...row, _key: normalize(row.nome) }));
                        return;
                    } catch (error) {
                        if (cache === 'reload') throw error;
                    } finally { clearTimeout(timeout); }
                }
            })().catch(error => { geoPromise = null; throw error; });
        }
        return geoPromise;
    }

    function parse(value) {
        const raw = String(value || '').trim();
        let province = raw.match(/\(([a-z]{2})\)\s*$/i);
        let name = raw.replace(/\s*\([a-z]{2}\)\s*$/i, '');
        if (!province && !exactNames.has(normalize(raw))) {
            const suffix = raw.match(/\s+([a-z]{2})\s*$/i);
            if (suffix && provinceCodes.has(suffix[1].toUpperCase())) {
                province = suffix;
                name = raw.slice(0, suffix.index);
            }
        }
        const key = normalize(name.replace(/^comune\s+di\s+/i, ''));
        return { key, packed: compact(key), sigla: province ? province[1].toUpperCase() : '' };
    }

    // Distanza con scambi di lettere adiacenti, limitata a due errori per nomi lunghi.
    function edits(a, b, limit, prefix = false) {
        if (Math.abs(a.length - b.length) > limit) return limit + 1;
        if (a === b) return 0;
        let previous = Array.from({ length: b.length + 1 }, (_, i) => Math.min(i, limit + 1));
        let beforePrevious = new Array(b.length + 1).fill(limit + 1);
        let current = new Array(b.length + 1);
        for (let i = 1; i <= a.length; i++) {
            current.fill(limit + 1);
            current[0] = i;
            let minimum = i;
            for (let j = Math.max(1, i - limit); j <= Math.min(b.length, i + limit); j++) {
                current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
                if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                    current[j] = Math.min(current[j], beforePrevious[j - 2] + 1);
                }
                minimum = Math.min(minimum, current[j]);
            }
            if (minimum > limit) return limit + 1;
            const reusable = beforePrevious;
            beforePrevious = previous;
            previous = current;
            current = reusable;
        }
        return prefix ? Math.min(...previous.slice(Math.max(0, a.length - limit))) : previous[b.length];
    }

    // Ogni nome/alias viene confrontato una sola volta, anche per gli omonimi.
    // Lo stesso generatore gira nel worker e nel fallback a piccoli blocchi.
    function* fuzzyTerms(names, packed) {
        const maxEdits = packed.length >= 7 ? 2 : 1;
        const prefixDistances = new Map();
        for (let index = 0; index < names.length; index++) {
            const name = names[index];
            const prefix = name.slice(0, packed.length + maxEdits);
            if (!prefixDistances.has(prefix)) {
                if (prefixDistances.size >= 100000) prefixDistances.clear();
                // Una matrice sola conserva il minimo su tutte le lunghezze di prefisso.
                prefixDistances.set(prefix, edits(packed, prefix, maxEdits, true));
            }
            const best = prefixDistances.get(prefix);
            yield best <= maxEdits ? [index, best] : null;
        }
    }

    function rankedFuzzy(found, sigla) {
        const best = new Map();
        for (const [index, distance] of found) for (const row of termRows[index]) {
            if ((!sigla || row.sigla === sigla) && (!best.has(row) || distance < best.get(row))) best.set(row, distance);
        }
        return [...best].map(([row, distance]) => ({ row, rank: 4 + distance, fuzzy: true }));
    }

    function remember(key, found) {
        matchesCache.delete(key);
        matchesCache.set(key, found);
        if (matchesCache.size > 80) matchesCache.delete(matchesCache.keys().next().value);
        return found;
    }

    const sortMatches = found => found.sort((a, b) => a.rank - b.rank || Number(!!a.row.nomeLocalita) - Number(!!b.row.nomeLocalita) ||
        a.row.nome.localeCompare(b.row.nome, 'it') || a.row.sigla.localeCompare(b.row.sigla));

    function match(value, limit = 20, allowFuzzy = true) {
        const { key, packed, sigla } = parse(value);
        if (key.length < 2) return [];
        const cacheKey = JSON.stringify([key, packed, sigla]);
        if (matchesCache.has(cacheKey)) return matchesCache.get(cacheKey).slice(0, limit);
        const exact = [...new Set([...(exactNames.get(key) || []), ...(exactNames.get(packed) || [])])]
            .filter(row => !sigla || row.sigla === sigla);
        if (exact.length) return exact.sort((a, b) => Number(!!a.nomeLocalita) - Number(!!b.nomeLocalita) ||
            a.nome.localeCompare(b.nome, 'it') || a.sigla.localeCompare(b.sigla)).slice(0, limit)
            .map(row => ({ row, rank: 0, fuzzy: false }));
        const words = key.split(' ');
        const candidates = sigla ? rowsByProvince.get(sigla) || [] : rows;
        let found = [];
        for (const row of nonFuzzyMisses.has(cacheKey) ? [] : candidates) {
            let rank = Infinity;
            if (row._keys.includes(key) || row._compact.includes(packed)) rank = 0;
            else if (row._keys.some(name => name.startsWith(key)) || row._compact.some(name => name.startsWith(packed))) rank = 1;
            else if (row._keys.some(name => words.every(word => name.includes(word))) || row._compact.some(name => name.includes(packed))) rank = 2;
            // "Castro LE", "Moniga Brescia": provincia, sigla e regione aiutano a scegliere.
            else if (words.length > 1 && words.every(word => row._context.includes(word))) rank = 3;
            if (rank < Infinity) found.push({ row, rank, fuzzy: false });
        }
        if (!found.length && packed.length >= 4) {
            nonFuzzyMisses.add(cacheKey);
            if (nonFuzzyMisses.size > 80) nonFuzzyMisses.delete(nonFuzzyMisses.values().next().value);
            if (!allowFuzzy) return [];
            found = rankedFuzzy([...fuzzyTerms(terms, packed)].filter(Boolean), sigla);
        }
        return remember(cacheKey, sortMatches(found)).slice(0, limit);
    }

    function stopWorker() {
        workerFailed = true;
        fuzzyWorker?.terminate();
        fuzzyWorker = null;
        for (const request of workerRequests.values()) request.reject(new Error('Ricerca in background non disponibile'));
        workerRequests.clear();
    }

    function runWorker(packed, signal) {
        if (workerFailed || typeof Worker === 'undefined') return Promise.reject(new Error('Worker non disponibile'));
        try {
            if (!fuzzyWorker) {
                fuzzyWorker = new Worker(workerUrl);
                fuzzyWorker.onerror = stopWorker;
                fuzzyWorker.onmessageerror = stopWorker;
                fuzzyWorker.onmessage = ({ data }) => {
                    const request = workerRequests.get(data.id);
                    if (request) { workerRequests.delete(data.id); request.resolve(data.found); }
                };
                fuzzyWorker.postMessage({ names: terms });
            }
        } catch { stopWorker(); return Promise.reject(new Error('Worker non disponibile')); }
        return new Promise((resolve, reject) => {
            const id = ++requestId;
            const abort = () => {
                workerRequests.delete(id);
                fuzzyWorker?.postMessage({ cancel: id });
                finish(reject, new DOMException('Ricerca superata', 'AbortError'));
            };
            const timeout = setTimeout(stopWorker, 15000);
            const finish = (callback, value) => { clearTimeout(timeout); signal?.removeEventListener('abort', abort); callback(value); };
            workerRequests.set(id, { resolve: value => finish(resolve, value), reject: error => finish(reject, error) });
            signal?.addEventListener('abort', abort, { once: true });
            if (signal?.aborted) { abort(); return; }
            try { fuzzyWorker.postMessage({ id, packed }); } catch { stopWorker(); }
        });
    }

    async function matchAsync(value, limit = 20, signal) {
        await load();
        if (signal?.aborted) throw new DOMException('Ricerca superata', 'AbortError');
        const { key, packed, sigla } = parse(value);
        const cacheKey = JSON.stringify([key, packed, sigla]);
        const immediate = match(value, limit, false);
        if (immediate.length || key.length < 2 || packed.length < 4 || matchesCache.has(cacheKey)) return immediate;
        let found;
        try { found = await runWorker(packed, signal); }
        catch (error) {
            if (signal?.aborted) throw error;
            found = [];
            const iterator = fuzzyTerms(terms, packed);
            let done = false;
            while (!done) {
                await new Promise(resolve => setTimeout(resolve, 0));
                if (signal?.aborted) throw new DOMException('Ricerca superata', 'AbortError');
                const until = Date.now() + 5;
                do {
                    const next = iterator.next();
                    done = next.done;
                    if (next.value) found.push(next.value);
                } while (!done && Date.now() < until);
            }
        }
        return remember(cacheKey, sortMatches(rankedFuzzy(found, sigla))).slice(0, limit);
    }

    function resolve(value, code) {
        if (code) {
            const chosen = rowsById.get(code);
            if (chosen && (parse(value).key === chosen._key || match(value, 1)[0]?.row === chosen)) return chosen;
        }
        const matches = match(value, rows.length);
        const exact = matches.filter(item => item.rank === 0);
        const official = exact.filter(item => !item.row.nomeLocalita);
        if (official.length) return official.length === 1 ? official[0].row : null;
        if (exact.length) return exact.length === 1 ? exact[0].row : null;
        const prefixes = matches.filter(item => item.rank === 1);
        const municipalities = prefixes.filter(item => !item.row.nomeLocalita);
        if (municipalities.length) return municipalities.length === 1 ? municipalities[0].row : null;
        // I prefissi delle località richiedono una scelta: "frutta" resta una ricerca per settore.
        if (prefixes.length) return null;
        const contextual = matches.filter(item => item.rank === 3);
        return contextual.length === 1 ? contextual[0].row : null;
    }

    // Il luogo digitato avvia la ricerca nei dintorni. Gli omonimi usano il
    // contesto degli annunci pubblici; la scelta resta visibile e modificabile.
    // Questo resolver sceglie il centro della ricerca, mai le coordinate di un annuncio.
    function resolveSearch(value, listings = null) {
        const matches = match(value, rows.length);
        if (!matches.length) return null;
        const { key, packed, sigla } = parse(value);
        let candidates = matches.filter(item => item.rank === 0).map(item => item.row);
        // "Agrate" può essere sia una località sia l'abbreviazione di più
        // comuni: non fissare la località prima di leggere regione/provincia.
        if (candidates.length && candidates.every(row => row.nomeLocalita) && key.length >= 3 &&
            candidates.some(row => placeKey(row.comune).startsWith(placeKey(key) + ' '))) {
            candidates.push(...rows.filter(row => !row.nomeLocalita && (!sigla || row.sigla === sigla) && row._keys.some(alias => alias.startsWith(key + ' '))));
        }
        if (!candidates.length) {
            const municipality = resolve(value);
            if (municipality) return municipality;
            candidates = matches.filter(item => item.row._keys.some(alias => placeKey(alias) === placeKey(key))).map(item => item.row);
            if (!candidates.length && matches[0].fuzzy) {
                const limit = packed.length >= 7 ? 2 : 1;
                const whole = matches.map(item => ({ row: item.row,
                    distance: Math.min(...item.row._compact.map(name => edits(packed, name, limit))) }));
                const best = Math.min(...whole.map(item => item.distance));
                if (best <= limit) candidates = whole.filter(item => item.distance === best).map(item => item.row);
            }
        }
        const official = candidates.filter(row => !row.nomeLocalita);
        if (official.length) candidates = official;
        if (candidates.length === 1) return candidates[0];
        // La home conserva il testo degli omonimi: l'elenco li risolve dopo
        // aver caricato gli annunci, oppure conserva il suggerimento scelto.
        if (!candidates.length || listings === null) return null;
        const support = row => listings.reduce((total, listing) => total +
            Number(listingMatchesLocation(listing.comune, listing.regione, listing.provincia, row)), 0);
        return candidates.map(row => ({ row, support: support(row) }))
            .sort((a, b) => b.support - a.support || a.row.nome.localeCompare(b.row.nome, 'it') || a.row.sigla.localeCompare(b.row.sigla))[0].row;
    }

    function coordinates(record) {
        if (!record) return null;
        if (record.nomeLocalita && Number.isFinite(record.lat) && Number.isFinite(record.lng)) return [record.lat, record.lng];
        let candidates = geo.filter(row => row.codiceIstat === record.codiceIstat);
        if (!candidates.length) candidates = geo.filter(row => row._key === record._key && canonicalRegion(row.regione) === canonicalRegion(record.regione));
        if (!candidates.length) candidates = geo.filter(row => record._keys.includes(row._key) && canonicalRegion(row.regione) === canonicalRegion(record.regione));
        // Le fusioni usano la posizione del primo comune precedente disponibile.
        return candidates.length ? [candidates[0].lat, candidates[0].lng] : null;
    }

    function listingParts(name) {
        const value = String(name || '').trim();
        if (exactNames.has(parse(value).key)) return [value];
        return value.split(/[,;/|]|\s*-\s*/).map(part => part.trim()).filter(Boolean);
    }

    function sameContext(record, region, province, sigla) {
        return (!region || normalize(canonicalRegion(record.regione)) === normalize(canonicalRegion(region))) && (!sigla || record.sigla === sigla) &&
            (!province || normalize(record.provincia) === normalize(province) || normalize(record.sigla) === normalize(province));
    }

    function listingMatchesLocation(name, region, province, record) {
        if (!record) return false;
        return listingParts(name).some(part => {
            const { key, sigla } = parse(part);
            return sameContext(record, region, province, sigla) && record._keys.some(alias =>
                alias === key || placeKey(alias) === placeKey(key) ||
                (key.length >= 4 && placeKey(alias).startsWith(placeKey(key) + ' ')) ||
                window.ListingSearch?.matchesName(key, alias));
        });
    }

    function listingRecords(name, region, province) {
        const cacheKey = JSON.stringify([name, region, province]);
        if (listingRecordsCache.has(cacheKey)) return listingRecordsCache.get(cacheKey);
        const { key, packed, sigla } = parse(name);
        const named = [...new Set([...(exactNames.get(key) || []), ...(exactNames.get(packed) || []), ...(coreNames.get(placeKey(key)) || [])])];
        let candidates = named.filter(row => sameContext(row, region, province, sigla));
        // Un comune ufficiale univoco conserva la propria posizione anche se
        // il vecchio annuncio ha una regione errata. Nessun omonimo viene indovinato.
        if (!candidates.length && !province && !sigla && named.length === 1 && !named[0].nomeLocalita) candidates = named;
        const official = candidates.filter(row => !row.nomeLocalita);
        if (official.length) candidates = official;
        if (!candidates.length) {
            // Solo abbreviazioni di comuni, senza ricerca fuzzy nell'intera anagrafica.
            // Nomi non riconosciuti restano cercabili come testo, senza coordinate inventate.
            candidates = key.length >= 3 ? rows.filter(row => !row.nomeLocalita && sameContext(row, region, province, sigla) &&
                row._keys.some(alias => alias.startsWith(key + ' ') || compact(alias).startsWith(packed))) : [];
        }
        const result = candidates.length === 1 ? candidates : [];
        listingRecordsCache.set(cacheKey, result);
        return result;
    }

    function listingContext(name, region, province) {
        return listingParts(name).flatMap(part => listingRecords(part, region, province))
            .flatMap(row => [row.nome, row.comune, row.provincia, row.sigla, ...row._keys]).filter(Boolean);
    }

    function listingCoordinateCandidates(name, region, province) {
        return listingParts(name).map(part => listingCoordinates(part, region, province)).filter(Boolean);
    }

    function listingCoordinates(name, region, province) {
        const { key, sigla } = parse(name);
        const current = listingRecords(name, region, province);
        if (current.length === 1) return coordinates(current[0]);
        const older = geo.filter(row => row._key === key && sameContext(row, region, province, sigla));
        if (older.length === 1) return [older[0].lat, older[0].lng];
        return null;
    }

    function create({ input, box, onSubmit, regions = [], keywords = [], history = () => [], removeHistory, initialCode = '', searchListings }) {
        let selected = null;
        let selectedValue = '';
        let options = [];
        let active = -1;
        let loading = true;
        let failed = false;
        let revision = 0;
        let currentReady;
        let blurTimer;
        let suggestionTimer;
        let suggestionController;
        let suggestionVersion = 0;
        box.className = 'location-suggestions';
        box.hidden = true;
        box.setAttribute('role', 'listbox');
        box.setAttribute('aria-label', 'Luoghi suggeriti');
        input.setAttribute('role', 'combobox');
        input.setAttribute('aria-autocomplete', 'list');
        input.setAttribute('aria-controls', box.id);
        input.setAttribute('aria-expanded', 'false');
        input.setAttribute('spellcheck', 'false');
        input.setAttribute('autocorrect', 'off');

        function close() {
            suggestionVersion++;
            clearTimeout(suggestionTimer);
            suggestionController?.abort();
            suggestionController = null;
            box.hidden = true;
            active = -1;
            input.setAttribute('aria-expanded', 'false');
            input.removeAttribute('aria-activedescendant');
        }
        function note(message) {
            const el = document.createElement('div');
            el.className = 'location-note';
            el.setAttribute('role', 'status');
            el.textContent = message;
            box.appendChild(el);
        }
        function add(label, detail, data) {
            const index = options.length;
            options.push(data);
            const el = document.createElement('div');
            el.id = `${box.id}-option-${index}`;
            el.className = 'location-option';
            el.setAttribute('role', 'option');
            el.setAttribute('aria-selected', 'false');
            const title = document.createElement('span');
            title.className = 'location-name';
            title.textContent = label;
            el.appendChild(title);
            if (detail) {
                const subtitle = document.createElement('span');
                subtitle.className = 'location-detail';
                subtitle.textContent = detail;
                el.appendChild(subtitle);
            }
            el.addEventListener('pointerdown', event => { if (event.pointerType === 'mouse') event.preventDefault(); });
            el.addEventListener('click', () => choose(index));
            if (data.history && removeHistory) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'location-delete';
                button.textContent = '×';
                button.setAttribute('aria-label', `Rimuovi ricerca ${data.label}`);
                button.addEventListener('click', event => { event.stopPropagation(); removeHistory(data.label); show(); });
                el.appendChild(button);
            }
            box.appendChild(el);
        }
        function show(backgroundMatches = null) {
            close();
            const version = suggestionVersion;
            box.replaceChildren();
            options = [];
            const value = input.value.trim();
            const key = normalize(value);
            if (!key) {
                const recent = history();
                if (!recent.length) return;
                note('Ricerche recenti');
                recent.forEach(label => add(label, '', { label, history: true }));
            } else {
                if (key.length < 2) return;
                if (loading) note('Caricamento di comuni e frazioni… Puoi continuare a scrivere.');
                else if (failed) {
                    note('Non siamo riusciti a caricare comuni e frazioni. Il testo resta qui.');
                    const retry = document.createElement('button');
                    retry.type = 'button';
                    retry.className = 'location-retry';
                    retry.textContent = 'Riprova';
                    retry.addEventListener('click', () => { input.focus(); start(); });
                    box.appendChild(retry);
                } else {
                    const matches = backgroundMatches || match(value, 20, false);
                    if (matches.length) {
                        note(matches[0].fuzzy ? 'Forse cercavi uno di questi luoghi?' : 'Comuni e frazioni · scegli il luogo');
                        matches.forEach(({ row }) => add(`${row.nome} (${row.sigla})`, `${row.nomeLocalita ? 'Località · ' : ''}${row.provincia} · ${canonicalRegion(row.regione)}`, { label: row.nome, row }));
                        if (matches.length === 20) note('Scrivi altre lettere o la provincia per restringere la lista.');
                    }
                    if (!matches.length && backgroundMatches === null && parse(value).packed.length >= 4) {
                        note('Ricerca dei luoghi in corso…');
                        suggestionController = new AbortController();
                        const signal = suggestionController.signal;
                        suggestionTimer = setTimeout(() => {
                            matchAsync(value, 20, signal).then(found => {
                                if (version === suggestionVersion && input.value.trim() === value && document.activeElement === input) show(found);
                            }).catch(() => {});
                        }, 80);
                    }
                }
                const other = regions.filter(name => normalize(name).includes(key)).slice(0, 3);
                if (other.length) { note('Regioni'); other.forEach(label => add(label, '', { label })); }
                const sectors = keywords.filter(name => normalize(name).includes(key)).slice(0, 3);
                if (sectors.length) { note('Settori'); sectors.forEach(label => add(label, '', { label })); }
                if (!options.length && !loading && !failed && !suggestionController) note('Nessun comune o frazione trovato. Prova con la prima parte del nome.');
            }
            if (document.activeElement === input) {
                box.hidden = false;
                input.setAttribute('aria-expanded', 'true');
            }
        }
        function choose(index) {
            const option = options[index];
            if (!option) return;
            clearTimeout(blurTimer);
            selected = option.row || null;
            input.value = option.label;
            selectedValue = input.value;
            close();
            onSubmit();
        }
        function start() {
            loading = true;
            failed = false;
            input.setAttribute('aria-busy', 'true');
            currentReady = load().then(async () => {
                const version = revision;
                const value = input.value;
                const code = initialCode;
                // Anche un link arrivato dalla home con q errata e codice scelto
                // verifica il luogo in background, senza bloccare il caricamento.
                if (code) await matchAsync(value, rows.length);
                loading = false;
                selected = code && version === revision && value === input.value ? resolve(value, code) : null;
                selectedValue = input.value;
                initialCode = '';
                input.removeAttribute('aria-busy');
                if (document.activeElement === input) show();
            }).catch(() => {
                loading = false;
                failed = true;
                input.removeAttribute('aria-busy');
                if (document.activeElement === input) show();
            });
            show();
        }
        input.addEventListener('input', () => { revision++; selected = null; selectedValue = ''; initialCode = ''; show(); });
        input.addEventListener('focus', () => { clearTimeout(blurTimer); show(); });
        input.addEventListener('blur', () => { blurTimer = setTimeout(close, 180); });
        input.addEventListener('keydown', event => {
            if (event.isComposing) return;
            if (event.key === 'Escape') { event.preventDefault(); close(); return; }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                if (box.hidden) show();
                if (!options.length) return;
                const direction = event.key === 'ArrowDown' ? 1 : -1;
                active = active < 0 ? (direction > 0 ? 0 : options.length - 1) : (active + direction + options.length) % options.length;
                const elements = box.querySelectorAll('[role="option"]');
                elements.forEach((el, index) => el.setAttribute('aria-selected', String(index === active)));
                input.setAttribute('aria-activedescendant', elements[active].id);
                elements[active].scrollIntoView({ block: 'nearest' });
            } else if (event.key === 'Enter') {
                event.preventDefault();
                if (!box.hidden && active >= 0) choose(active);
                else onSubmit();
            }
        });
        document.addEventListener('pointerdown', event => { if (event.target !== input && !box.contains(event.target)) close(); });
        start();
        return {
            get ready() { return currentReady; },
            get selected() { return selected && input.value === selectedValue ? selected : null; },
            close,
            async prepare() {
                const version = revision;
                const value = input.value;
                if (!value.trim()) { selected = null; close(); return true; }
                await currentReady;
                if (version !== revision || value !== input.value) return false;
                const textOnly = [...regions, ...keywords].some(label => normalize(label) === normalize(value));
                close();
                if (!this.selected && !textOnly && !failed) await matchAsync(value, rows.length);
                if (version !== revision || value !== input.value) return false;
                selected = this.selected || (!textOnly && !failed ? resolveSearch(value, searchListings ? searchListings() : null) : null);
                selectedValue = value;
                close();
                return true;
            }
        };
    }

    window.LocationSearch = { create, load, loadGeo, match, matchAsync, fuzzyTerms, resolve, resolveSearch, coordinates, listingCoordinates, listingMatchesLocation, listingCoordinateCandidates, listingContext, get dataVersion() { return dataVersion; } };
})();
