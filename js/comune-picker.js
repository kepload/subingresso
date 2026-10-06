// Selettore geografico condiviso: impedisce combinazioni comune/regione errate.
(function () {
    'use strict';

    let comuniPromise = null;

    function normalize(value) {
        return String(value || '').trim().toLocaleLowerCase('it-IT').normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '').replace(/[’`]/g, "'").replace(/\s+/g, ' ');
    }

    function canonicalRegion(regione) {
        if (regione === 'Trentino-Alto Adige/Südtirol') return 'Trentino-Alto Adige';
        if (regione === "Valle d'Aosta/Vallée d'Aoste") return "Valle d'Aosta";
        return regione;
    }

    function loadComuni() {
        if (!comuniPromise) {
            comuniPromise = fetch('/data/comuni.json', { cache: 'force-cache' })
                .then(response => {
                    if (!response.ok) throw new Error('Elenco comuni non disponibile');
                    return response.json();
                })
                .then(rows => rows.map(row => ({ ...row, _key: normalize(row.nome) })));
        }
        return comuniPromise;
    }

    function createComunePicker({ comuneInput, regioneSelect, provinciaInput, datalist, statusEl }) {
        let comuni = [];
        let selected = null;

        function clearSelection(keepText = true) {
            selected = null;
            comuneInput.dataset.comuneKey = '';
            if (!keepText) comuneInput.value = '';
            provinciaInput.value = '';
            regioneSelect.value = '';
            statusEl.textContent = 'Scrivi almeno 2 lettere e scegli il comune suggerito.';
            statusEl.className = 'text-xs text-slate-500 mt-2 font-semibold';
        }

        function apply(record) {
            selected = record;
            comuneInput.value = record.nome;
            comuneInput.dataset.comuneKey = record.codiceIstat;
            regioneSelect.value = canonicalRegion(record.regione);
            provinciaInput.value = record.provincia;
            statusEl.textContent = `${record.provincia} (${record.sigla}) · ${canonicalRegion(record.regione)}`;
            statusEl.className = 'text-xs text-emerald-700 mt-2 font-bold';
            datalist.innerHTML = '';
        }

        function resolve(rawValue, preferredRegion) {
            const siglaMatch = String(rawValue || '').match(/\(([A-Z]{2})\)\s*$/i);
            const cleanValue = String(rawValue || '').replace(/\s*\([A-Z]{2}\)\s*$/i, '');
            const key = normalize(cleanValue);
            let matches = comuni.filter(row => row._key === key);
            if (siglaMatch) matches = matches.filter(row => row.sigla.toLowerCase() === siglaMatch[1].toLowerCase());
            if (matches.length > 1 && preferredRegion) {
                const regionMatch = matches.find(row => canonicalRegion(row.regione) === preferredRegion);
                if (regionMatch) return regionMatch;
            }
            return matches.length === 1 ? matches[0] : null;
        }

        function fillSuggestions(rawValue) {
            const key = normalize(rawValue);
            datalist.innerHTML = '';
            if (key.length < 2) return;
            const starts = comuni.filter(row => row._key.startsWith(key));
            const contains = starts.length >= 20 ? [] : comuni.filter(row => !row._key.startsWith(key) && row._key.includes(key));
            [...starts, ...contains].slice(0, 20).forEach(row => {
                const option = document.createElement('option');
                option.value = `${row.nome} (${row.sigla})`;
                option.label = `${row.provincia} · ${canonicalRegion(row.regione)}`;
                datalist.appendChild(option);
            });
        }

        comuneInput.addEventListener('input', () => {
            const found = resolve(comuneInput.value, regioneSelect.value);
            if (found) apply(found);
            else {
                clearSelection();
                fillSuggestions(comuneInput.value);
            }
        });
        comuneInput.addEventListener('blur', () => {
            const found = resolve(comuneInput.value, regioneSelect.value);
            if (found) apply(found);
        });

        const ready = loadComuni().then(rows => { comuni = rows; });
        return {
            ready,
            setValue(comune, regione) {
                return ready.then(() => {
                    comuneInput.value = comune || '';
                    const found = resolve(comune, regione);
                    if (found) apply(found);
                    else clearSelection();
                });
            },
            getValue() {
                if (!selected || comuneInput.dataset.comuneKey !== selected.codiceIstat) return null;
                return { comune: selected.nome, provincia: selected.provincia, regione: canonicalRegion(selected.regione) };
            }
        };
    }

    window.createComunePicker = createComunePicker;
})();
