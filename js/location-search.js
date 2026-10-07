// Suggerimenti geografici completi, condivisi dalla home e dalla pagina annunci.
(function () {
    'use strict';
    const { normalize, canonicalRegion } = window.ComuniItaliani;
    const compact = value => normalize(value).replace(/\b(?:s|san|sant|santo|santa)\b/g, 'san').replace(/ /g, '');
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

    function load() {
        if (!readyPromise) {
            readyPromise = window.ComuniItaliani.load().then(data => {
                rows = data.map(row => ({ ...row, _compact: row._keys.map(compact),
                    _context: normalize(`${row.nome} ${row.provincia} ${row.sigla} ${row.regione}`) }));
                exactNames = new Map();
                coreNames = new Map();
                listingRecordsCache.clear();
                rowsById = new Map(rows.map(row => [row.id, row]));
                provinceCodes = new Set(rows.map(row => row.sigla));
                for (const row of rows) for (const key of new Set([...row._keys, ...row._compact])) {
                    if (!exactNames.has(key)) exactNames.set(key, []);
                    exactNames.get(key).push(row);
                    const core = placeKey(key);
                    if (!coreNames.has(core)) coreNames.set(core, new Set());
                    coreNames.get(core).add(row);
                }
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
    function edits(a, b, limit) {
        if (Math.abs(a.length - b.length) > limit) return limit + 1;
        let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
        let beforePrevious;
        for (let i = 1; i <= a.length; i++) {
            const current = [i];
            for (let j = 1; j <= b.length; j++) {
                current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
                if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                    current[j] = Math.min(current[j], beforePrevious[j - 2] + 1);
                }
            }
            if (Math.min(...current) > limit) return limit + 1;
            beforePrevious = previous;
            previous = current;
        }
        return previous[b.length];
    }

    function match(value, limit = 20) {
        const { key, packed, sigla } = parse(value);
        if (key.length < 2) return [];
        const exact = [...new Set([...(exactNames.get(key) || []), ...(exactNames.get(packed) || [])])]
            .filter(row => !sigla || row.sigla === sigla);
        if (exact.length) return exact.sort((a, b) => Number(!!a.nomeLocalita) - Number(!!b.nomeLocalita) ||
            a.nome.localeCompare(b.nome, 'it') || a.sigla.localeCompare(b.sigla)).slice(0, limit)
            .map(row => ({ row, rank: 0, fuzzy: false }));
        const words = key.split(' ');
        const candidates = sigla ? rows.filter(row => row.sigla === sigla) : rows;
        let found = [];
        for (const row of candidates) {
            let rank = Infinity;
            if (row._keys.includes(key) || row._compact.includes(packed)) rank = 0;
            else if (row._keys.some(name => name.startsWith(key)) || row._compact.some(name => name.startsWith(packed))) rank = 1;
            else if (row._keys.some(name => words.every(word => name.includes(word))) || row._compact.some(name => name.includes(packed))) rank = 2;
            // "Castro LE", "Moniga Brescia": provincia, sigla e regione aiutano a scegliere.
            else if (words.length > 1 && words.every(word => row._context.includes(word))) rank = 3;
            if (rank < Infinity) found.push({ row, rank, fuzzy: false });
        }
        if (!found.length && packed.length >= 4) {
            const maxEdits = packed.length >= 7 ? 2 : 1;
            for (const row of candidates) {
                let best = maxEdits + 1;
                for (const name of row._compact) {
                    for (let length = packed.length - maxEdits; length <= packed.length + maxEdits; length++) {
                        best = Math.min(best, edits(packed, name.slice(0, length), maxEdits));
                    }
                }
                if (best <= maxEdits) found.push({ row, rank: 4 + best, fuzzy: true });
            }
        }
        found.sort((a, b) => a.rank - b.rank || Number(!!a.row.nomeLocalita) - Number(!!b.row.nomeLocalita) ||
            a.row.nome.localeCompare(b.row.nome, 'it') || a.row.sigla.localeCompare(b.row.sigla));
        return found.slice(0, limit);
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
        let candidates = [...new Set([...(exactNames.get(key) || []), ...(exactNames.get(packed) || []), ...(coreNames.get(placeKey(key)) || [])])]
            .filter(row => sameContext(row, region, province, sigla));
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

    function create({ input, box, onSubmit, regions = [], keywords = [], history = () => [], removeHistory, initialCode = '' }) {
        let selected = null;
        let options = [];
        let active = -1;
        let loading = true;
        let failed = false;
        let revision = 0;
        let currentReady;
        let blurTimer;
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
        function show() {
            close();
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
                    const matches = match(value);
                    if (matches.length) {
                        note(matches[0].fuzzy ? 'Forse cercavi uno di questi luoghi?' : 'Comuni e frazioni · scegli il luogo');
                        matches.forEach(({ row }) => add(`${row.nome} (${row.sigla})`, `${row.nomeLocalita ? 'Località · ' : ''}${row.provincia} · ${canonicalRegion(row.regione)}`, { label: row.nome, row }));
                        if (matches.length === 20) note('Scrivi altre lettere o la provincia per restringere la lista.');
                    }
                }
                const other = regions.filter(name => normalize(name).includes(key)).slice(0, 3);
                if (other.length) { note('Regioni'); other.forEach(label => add(label, '', { label })); }
                const sectors = keywords.filter(name => normalize(name).includes(key)).slice(0, 3);
                if (sectors.length) { note('Settori'); sectors.forEach(label => add(label, '', { label })); }
                if (!options.length && !loading && !failed) note('Nessun comune o frazione trovato. Prova con la prima parte del nome.');
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
            close();
            onSubmit();
        }
        function start() {
            loading = true;
            failed = false;
            input.setAttribute('aria-busy', 'true');
            currentReady = load().then(() => {
                loading = false;
                selected = initialCode ? resolve(input.value, initialCode) : null;
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
        input.addEventListener('input', () => { revision++; selected = null; initialCode = ''; show(); });
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
            get selected() { return selected && input.value === selected.nome ? selected : null; },
            close,
            async prepare() {
                const version = revision;
                const value = input.value;
                if (!value.trim()) { selected = null; close(); return true; }
                await currentReady;
                if (version !== revision || value !== input.value) return false;
                selected = this.selected;
                if (selected) input.value = selected.nome;
                close();
                return true;
            }
        };
    }

    window.LocationSearch = { create, load, loadGeo, match, resolve, coordinates, listingCoordinates, listingMatchesLocation, listingCoordinateCandidates, listingContext, get dataVersion() { return dataVersion; } };
})();
