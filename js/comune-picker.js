// Selettore geografico condiviso: impedisce combinazioni comune/regione errate.
(function () {
    'use strict';

    let comuniPromise = null;

    // Nomi ancora usati localmente dopo fusioni o cambi di denominazione.
    // Il valore è sempre il comune ufficiale ISTAT attuale da salvare.
    const COMUNE_ALIASES = {
        'alano di piave': 'Setteville',
        'albaredo arnaboldi': 'Campospinoso Albaredo',
        'bardello': 'Bardello con Malgesso e Bregano',
        'bregano': 'Bardello con Malgesso e Bregano',
        'campospinoso': 'Campospinoso Albaredo',
        'carceri': "Santa Caterina d'Este",
        'casorzo': 'Casorzo Monferrato',
        'castegnero': 'Castegnero Nanto',
        'gambugliano': 'Sovizzo',
        'grana': 'Grana Monferrato',
        'ionadi': 'Jonadi',
        'lirio': 'Montalto Pavese',
        'malgesso': 'Bardello con Malgesso e Bregano',
        'montagna': 'Montagna sulla strada del vino',
        'monteciccardo': 'Pesaro',
        'montemagno': 'Montemagno Monferrato',
        'moransengo': 'Moransengo-Tonengo',
        'murisengo': 'Murisengo Monferrato',
        'nanto': 'Castegnero Nanto',
        'pont canavese': 'Pont Canavese',
        'popoli': 'Popoli Terme',
        'quero vas': 'Setteville',
        'ronago': 'Uggiate con Ronago',
        'salorno': 'Salorno sulla strada del vino',
        'tonengo': 'Moransengo-Tonengo',
        'tripi': 'Tripi - Abakainon',
        'uggiate trevano': 'Uggiate con Ronago',
        'vighizzolo d este': "Santa Caterina d'Este"
    };

    function normalize(value) {
        return String(value || '').trim().toLocaleLowerCase('it-IT').normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, ' ')
            .trim()
            .replace(/\s+/g, ' ');
    }

    function canonicalRegion(regione) {
        if (regione === 'Trentino-Alto Adige/Südtirol') return 'Trentino-Alto Adige';
        if (regione === "Valle d'Aosta/Vallée d'Aoste") return "Valle d'Aosta";
        return regione;
    }

    async function fetchDataset(url, cache) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        try {
            const response = await fetch(url, { cache, signal: controller.signal });
            if (!response.ok) throw new Error('Elenco località non disponibile');
            return await response.json();
        } finally {
            clearTimeout(timeout);
        }
    }

    // Lascia al browser il tempo di gestire clic e digitazione durante gli indici.
    async function forEachChunked(items, visit) {
        let until = Date.now() + 8;
        for (const item of items) {
            visit(item);
            if (Date.now() >= until) {
                await new Promise(resolve => setTimeout(resolve, 0));
                until = Date.now() + 8;
            }
        }
    }

    async function fetchComuni(cache) {
        const [rows, localita] = await Promise.all([
            fetchDataset('/data/comuni-picker.json?v=20260221', cache),
            fetchDataset('/data/localita.json?v=20261007', cache)
        ]);
        if (!Array.isArray(rows) || !rows.length || rows.some(row => !row.nome || !row.codiceIstat || !row.regione || !row.sigla || !row.provincia)) {
            throw new Error('Elenco comuni incompleto');
        }
        if (localita.schemaVersion !== 1 || !Array.isArray(localita.localita) || !localita.localita.length) {
            throw new Error('Elenco frazioni incompleto');
        }
        const comuni = [];
        await forEachChunked(rows, row => comuni.push({
            ...row, id: row.codiceIstat, _key: normalize(row.nome),
            _keys: [normalize(row.nome), ...Object.keys(COMUNE_ALIASES).filter(alias => COMUNE_ALIASES[alias] === row.nome)]
        }));
        const byCode = new Map(comuni.map(row => [row.codiceIstat, row]));
        const places = [];
        await forEachChunked(localita.localita, entry => {
            const [geonameId, nomeLocalita, codiceIstat, lat, lng, aliases = []] = entry;
            const parent = byCode.get(codiceIstat);
            if (!parent || !geonameId || typeof nomeLocalita !== 'string' || !nomeLocalita.trim() || !Number.isFinite(lat) || !Number.isFinite(lng) || !Array.isArray(aliases)) {
                throw new Error('Località senza comune o coordinate');
            }
            const nome = `${nomeLocalita} (${parent.nome})`;
            const names = [nomeLocalita, ...aliases];
            places.push({
                nome, nomeLocalita, comune: parent.nome, codiceIstat, lat, lng,
                id: `geonames:${geonameId}`, provincia: parent.provincia, sigla: parent.sigla, regione: parent.regione,
                _key: normalize(nome),
                _keys: [...new Set([normalize(nome), ...names.flatMap(name => [normalize(name), normalize(`${name} ${parent.nome}`)])])]
            });
        });
        return [...comuni, ...places];
    }

    function loadComuni() {
        if (!comuniPromise) {
            comuniPromise = fetchComuni('force-cache').catch(() => fetchComuni('reload')).catch(error => {
                comuniPromise = null; // Un errore di rete non deve bloccare tutti i tentativi successivi.
                throw error;
            });
        }
        return comuniPromise;
    }

    // Piccoli refusi compaiono nei suggerimenti, ma richiedono sempre una scelta esplicita.
    function oneEditApart(a, b) {
        if (Math.abs(a.length - b.length) > 1) return false;
        let i = 0;
        while (i < a.length && a[i] === b[i]) i++;
        if (a.length === b.length) {
            return a.slice(i + 1) === b.slice(i + 1) ||
                (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
        }
        return a.length > b.length ? a.slice(i + 1) === b.slice(i) : a.slice(i) === b.slice(i + 1);
    }

    function createComunePicker({ comuneInput, regioneSelect, provinciaInput, suggestionsEl, statusEl }) {
        let comuni = [];
        let selected = null;
        let suggestions = [];
        let activeIndex = -1;
        let loading = false;
        let loadFailed = false;
        let restoredRegion = null;
        let ready;
        let revision = 0;
        let blurTimer;
        const retryButton = document.createElement('button');
        retryButton.type = 'button';
        retryButton.className = 'comune-retry';
        retryButton.textContent = 'Riprova a caricare i comuni';
        retryButton.hidden = true;
        statusEl.after(retryButton);
        statusEl.setAttribute('role', 'status');
        comuneInput.setAttribute('role', 'combobox');
        comuneInput.setAttribute('aria-autocomplete', 'list');
        comuneInput.setAttribute('aria-controls', suggestionsEl.id);
        comuneInput.setAttribute('aria-describedby', statusEl.id);
        comuneInput.setAttribute('aria-expanded', 'false');
        suggestionsEl.setAttribute('role', 'listbox');
        suggestionsEl.setAttribute('aria-label', 'Comuni e frazioni suggeriti');

        function status(message, tone = 'slate') {
            statusEl.textContent = message;
            statusEl.className = `text-xs text-${tone === 'emerald' ? 'emerald-700' : tone === 'red' ? 'red-600' : 'slate-500'} mt-2 font-semibold`;
        }

        function closeSuggestions() {
            suggestionsEl.hidden = true;
            activeIndex = -1;
            comuneInput.setAttribute('aria-expanded', 'false');
            comuneInput.removeAttribute('aria-activedescendant');
        }

        function clearSelection(keepText = true) {
            selected = null;
            comuneInput.dataset.comuneKey = '';
            if (!keepText) comuneInput.value = '';
            provinciaInput.value = '';
            regioneSelect.value = '';
        }

        function apply(record, notify = true) {
            selected = record;
            restoredRegion = null;
            comuneInput.value = record.nome;
            comuneInput.dataset.comuneKey = record.id;
            regioneSelect.value = canonicalRegion(record.regione);
            provinciaInput.value = record.provincia;
            comuneInput.removeAttribute('aria-invalid');
            status(`${record.nomeLocalita ? 'Località' : 'Comune'} selezionato: ${record.nome} · ${record.provincia} (${record.sigla}) · ${canonicalRegion(record.regione)}`, 'emerald');
            closeSuggestions();
            if (notify) comuneInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        function resolve(rawValue, preferredRegion) {
            const siglaMatch = String(rawValue || '').match(/\(([A-Z]{2})\)\s*$/i);
            const cleanValue = String(rawValue || '').replace(/\s*\([A-Z]{2}\)\s*$/i, '');
            const enteredKey = normalize(cleanValue);
            const key = normalize(COMUNE_ALIASES[enteredKey] || cleanValue);
            let matches = comuni.filter(row => row._keys.includes(key));
            if (siglaMatch) matches = matches.filter(row => row.sigla.toLowerCase() === siglaMatch[1].toLowerCase());
            const official = matches.filter(row => !row.nomeLocalita);
            if (official.length) matches = official;
            if (!matches.length && key.length >= 3) {
                matches = comuni.filter(row => row._keys.some(name => name.startsWith(key)));
                if (siglaMatch) matches = matches.filter(row => row.sigla.toLowerCase() === siglaMatch[1].toLowerCase());
                const municipalities = matches.filter(row => !row.nomeLocalita);
                if (municipalities.length) matches = municipalities;
            }
            if (matches.length > 1 && preferredRegion) {
                const regional = matches.filter(row => canonicalRegion(row.regione) === canonicalRegion(preferredRegion));
                if (regional.length === 1) return regional[0];
            }
            return matches.length === 1 ? matches[0] : null;
        }

        function fillSuggestions(rawValue) {
            closeSuggestions();
            suggestionsEl.replaceChildren();
            suggestions = [];
            if (loading) { status('Caricamento di comuni e frazioni… Puoi già scrivere il nome.'); return; }
            if (loadFailed) { status('Comuni e frazioni non si sono caricati. Premi Riprova: quello che hai scritto resta qui.', 'red'); return; }
            const key = normalize(String(rawValue || '').replace(/\s*\([A-Z]{2}\)\s*$/i, ''));
            const siglaMatch = String(rawValue || '').match(/\(([A-Z]{2})\)\s*$/i);
            if (key.length < 2) { status('Scrivi almeno 2 lettere: comuni e frazioni compaiono qui sotto.'); return; }
            const words = key.split(' ').filter(Boolean);
            const candidates = siglaMatch ? comuni.filter(row => row.sigla.toLowerCase() === siglaMatch[1].toLowerCase()) : comuni;
            const exact = candidates.filter(row => row._keys.includes(key));
            const exactSet = new Set(exact);
            const starts = candidates.filter(row => !exactSet.has(row) && row._keys.some(name => name.startsWith(key)));
            const startsSet = new Set(starts);
            const contains = exact.length + starts.length >= 20 ? [] : candidates.filter(row =>
                !exactSet.has(row) && !startsSet.has(row) && row._keys.some(name => words.every(word => name.includes(word)))
            );
            let matches = [...exact, ...starts, ...contains];
            let fuzzy = false;
            if (!matches.length && key.length >= 4) {
                matches = candidates.filter(row => row._keys.some(name =>
                    [name, name.slice(0, key.length - 1).trim(), name.slice(0, key.length).trim(), name.slice(0, key.length + 1).trim()]
                        .some(candidate => oneEditApart(key, candidate))
                ));
                fuzzy = matches.length > 0;
            }
            if (siglaMatch) matches = matches.filter(row => row.sigla.toLowerCase() === siglaMatch[1].toLowerCase());
            suggestions = matches.slice(0, 20);
            suggestions.forEach((row, index) => {
                const option = document.createElement('div');
                option.id = `${suggestionsEl.id}-option-${index}`;
                option.className = 'comune-option';
                option.setAttribute('role', 'option');
                option.setAttribute('aria-selected', 'false');
                const name = document.createElement('span');
                name.className = 'comune-option-name';
                name.textContent = `${row.nome} (${row.sigla})`;
                const detail = document.createElement('span');
                detail.className = 'comune-option-detail';
                detail.textContent = `${row.nomeLocalita ? 'Località · ' : ''}${row.provincia} · ${canonicalRegion(row.regione)}`;
                option.append(name, detail);
                // Mantiene il focus: blur non deve scegliere un altro comune prima del tocco.
                option.addEventListener('pointerdown', event => event.preventDefault());
                option.addEventListener('click', () => { clearTimeout(blurTimer); apply(row); });
                suggestionsEl.appendChild(option);
            });
            if (!suggestions.length) {
                status('Nessun comune o frazione trovato. Controlla il nome o scrivi solo la prima parte.', 'red');
                return;
            }
            status(fuzzy ? 'Forse cercavi uno di questi luoghi? Tocca quello corretto.' :
                matches.length > 20 ? 'Tocca il luogo oppure scrivi altre lettere per restringere la lista.' :
                resolve(rawValue) ? 'Tocca il luogo suggerito oppure prosegui: lo completiamo noi.' :
                'Tocca il comune o la frazione corretta nella lista qui sotto.');
            if (document.activeElement === comuneInput) {
                suggestionsEl.hidden = false;
                comuneInput.setAttribute('aria-expanded', 'true');
            }
        }

        function commit() {
            if (selected && comuneInput.value === selected.nome && comuneInput.dataset.comuneKey === selected.id) return selected;
            const found = resolve(comuneInput.value, restoredRegion);
            if (found) apply(found);
            else clearSelection();
            return found;
        }

        comuneInput.addEventListener('input', () => {
            revision++;
            restoredRegion = null;
            clearSelection();
            fillSuggestions(comuneInput.value);
        });
        comuneInput.addEventListener('focus', () => {
            clearTimeout(blurTimer);
            fillSuggestions(comuneInput.value);
        });
        comuneInput.addEventListener('blur', () => {
            blurTimer = setTimeout(() => { commit(); closeSuggestions(); }, 120);
        });
        comuneInput.addEventListener('change', commit);
        comuneInput.addEventListener('keydown', event => {
            if (event.isComposing) return;
            if (event.key === 'Escape') { closeSuggestions(); event.preventDefault(); return; }
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                if (suggestionsEl.hidden) fillSuggestions(comuneInput.value);
                if (!suggestions.length) return;
                const direction = event.key === 'ArrowDown' ? 1 : -1;
                activeIndex = activeIndex < 0 ? (direction > 0 ? 0 : suggestions.length - 1) :
                    (activeIndex + direction + suggestions.length) % suggestions.length;
                Array.from(suggestionsEl.children).forEach((option, index) => option.setAttribute('aria-selected', String(index === activeIndex)));
                const option = suggestionsEl.children[activeIndex];
                comuneInput.setAttribute('aria-activedescendant', option.id);
                option.scrollIntoView({ block: 'nearest' });
            } else if (event.key === 'Enter') {
                event.preventDefault(); // Mai inviare il form mentre si sta scegliendo il comune.
                if (!suggestionsEl.hidden && activeIndex >= 0) apply(suggestions[activeIndex]);
                else if (!commit()) fillSuggestions(comuneInput.value);
            }
        });

        function startLoading() {
            loading = true;
            loadFailed = false;
            retryButton.hidden = true;
            comuneInput.setAttribute('aria-busy', 'true');
            fillSuggestions(comuneInput.value);
            ready = loadComuni().then(rows => {
                comuni = rows;
                loading = false;
                comuneInput.removeAttribute('aria-busy');
                if (document.activeElement !== comuneInput && commit()) return;
                fillSuggestions(comuneInput.value);
            }).catch(error => {
                loading = false;
                loadFailed = true;
                comuneInput.removeAttribute('aria-busy');
                retryButton.hidden = false;
                fillSuggestions(comuneInput.value);
                throw error;
            });
            ready.catch(() => {}); // Il messaggio e Riprova gestiscono anche il caricamento iniziale.
            return ready;
        }
        retryButton.addEventListener('click', () => { comuneInput.focus(); startLoading(); });
        startLoading();
        return {
            get ready() { return ready; },
            setValue(comune, regione) {
                const currentRevision = ++revision;
                clearSelection();
                closeSuggestions();
                comuneInput.value = comune || '';
                restoredRegion = regione || null;
                return ready.then(() => {
                    if (currentRevision !== revision) return;
                    const found = resolve(comune, regione);
                    if (found) apply(found, false);
                    else { clearSelection(); fillSuggestions(comuneInput.value); }
                });
            },
            getValue() {
                if (!commit()) { fillSuggestions(comuneInput.value); return null; }
                return { comune: selected.nome, provincia: selected.provincia, regione: canonicalRegion(selected.regione) };
            }
        };
    }

    window.createComunePicker = createComunePicker;
    // Home e ricerca annunci usano gli stessi dati, alias e tentativi di caricamento dei form.
    window.ComuniItaliani = { load: loadComuni, normalize, canonicalRegion, forEachChunked };
})();
