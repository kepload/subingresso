// ============================================================
//  Subingresso.it — Logica Pagina Annunci
//  Gestisce filtri, ricerca, Supabase integration e Alert
// ============================================================

const params = new URLSearchParams(location.search);

const fRegione = document.getElementById('fRegione');
if (fRegione) {
    REGIONI.forEach(r => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = r;
        fRegione.appendChild(opt);
    });
}

if (params.get('regione') && fRegione) fRegione.value = params.get('regione');
const fStatoParam = document.getElementById('fStato');
if (params.get('stato') && fStatoParam) fStatoParam.value = params.get('stato');
if (params.get('q')) {
    const sBar = document.getElementById('searchBar');
    if (sBar) sBar.value = params.get('q');
}

let LAST_SEARCH_QUERY = '';

// ── CONSTANTS ──
const SECTOR_KEYWORDS = [
    'frutta', 'verdura', 'abbigliamento', 'calzature', 'pesce', 'fiori', 'formaggi',
    'salumi', 'dolci', 'giocattoli', 'biancheria', 'borse', 'ferramenta', 'piante',
    'cosmetici', 'libri', 'accessori', 'intimo', 'artigianato', 'alimentari',
    'elettronica', 'tessuti', 'scarpe', 'cappelli', 'spezie', 'casalinghi'
];
const SEARCH_HISTORY_KEY = '_sub_searches';
const PLACEHOLDER_TEXTS = [
    'Cerca comune, città…',
    'Es. Milano, Roma, Napoli…',
    'Es. frutta, abbigliamento…',
    'Es. mercato settimanale…',
    'Es. Lombardia, affitto…',
];

// ── SEARCH HISTORY ──
function getSearchHistory() {
    try { return JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || '[]'); } catch { return []; }
}
function saveSearchHistory(q) {
    if (!q || q.length < 2) return;
    let h = getSearchHistory().filter(x => x !== q);
    h.unshift(q);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(h.slice(0, 5)));
}
function removeFromHistory(q) {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(getSearchHistory().filter(x => x !== q)));
}

// ── AUTOCOMPLETE ──
let _sugActiveIdx = -1;

function _hideSuggestions() {
    const ul = document.getElementById('searchSuggestions');
    if (ul) { ul.classList.add('hidden'); ul.innerHTML = ''; }
    _sugActiveIdx = -1;
}

function _showSuggestions(input) {
    const ul = document.getElementById('searchSuggestions');
    if (!ul) return;
    const q = input.value.trim();
    const qNorm = normalizeText(q);
    let html = '';

    if (!q) {
        const history = getSearchHistory();
        if (!history.length) { _hideSuggestions(); return; }
        html += `<li class="sug-section">Ricerche recenti</li>`;
        history.forEach(h => {
            const safe = h.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
            html += `<li data-val="${escapeHTML(h)}"><i class="fas fa-clock-rotate-left text-slate-300 text-[11px] w-4 flex-shrink-0"></i><span class="flex-1 truncate">${escapeHTML(h)}</span><button class="sug-del" onclick="_removeHistory(event,'${escapeHTML(safe)}')"><i class="fas fa-times text-[10px]"></i></button></li>`;
        });
    } else {
        const cities = Object.keys(PROVINCE_COORDS)
            .filter(c => {
                const cn = normalizeText(c);
                return cn.startsWith(qNorm) || (qNorm.length >= 3 && cn.includes(qNorm));
            })
            .sort((a, b) => {
                const aN = normalizeText(a), bN = normalizeText(b);
                return (aN.startsWith(qNorm) ? 0 : 1) - (bN.startsWith(qNorm) ? 0 : 1) || a.localeCompare(b, 'it');
            })
            .slice(0, 6);

        const sectors = SECTOR_KEYWORDS
            .filter(s => s.startsWith(qNorm) || (qNorm.length >= 3 && s.includes(qNorm)))
            .slice(0, 3);

        if (!cities.length && !sectors.length) { _hideSuggestions(); return; }

        if (cities.length) {
            html += `<li class="sug-section">Comuni / Città</li>`;
            cities.forEach(c => {
                html += `<li data-val="${escapeHTML(c)}"><i class="fas fa-map-marker-alt text-blue-300 text-[11px] w-4 flex-shrink-0"></i>${escapeHTML(c)}</li>`;
            });
        }
        if (sectors.length) {
            html += `<li class="sug-section">Settore merceologico</li>`;
            sectors.forEach(s => {
                html += `<li data-val="${escapeHTML(s)}"><i class="fas fa-tag text-slate-300 text-[11px] w-4 flex-shrink-0"></i>${escapeHTML(s)}</li>`;
            });
        }
    }

    _sugActiveIdx = -1;
    ul.innerHTML = html;
    ul.classList.remove('hidden');
}

// ── FILTER & RENDER ──
function parseItalianNumber(value, fallback = 0) {
    const raw = String(value || '').trim();
    if (!raw) return fallback;
    const normalized = raw.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
    const parsed = parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
}

// ── Filtro giorni mercato ────────────────────────────────────
// Normalizza nome giorno: trim, lowercase, NFD + strip diacritici.
// Risultato senza accenti (es. 'Lunedì' → 'lunedi') così evita problemi di
// confronto fra forme unicode equivalenti (precomposto vs combining grave).
function _normalizeDayName(s) {
    return String(s || '').trim().toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');
}
// Legge i chip selezionati nella sidebar desktop (fonte di verità).
// Se siamo in modalità mobile (sheet aperto), il mobile ha già copiato in desktop al apply.
function _getSelectedDays() {
    const el = document.getElementById('dayChipsDesktop');
    if (!el) return [];
    return Array.from(el.querySelectorAll('.day-chip.selected')).map(b => b.dataset.day);
}

function applyFilters() {
    const fReg    = document.getElementById('fRegione');
    const fTipo   = document.getElementById('fTipo');
    const fStato  = document.getElementById('fStato');
    const fPMin   = document.getElementById('fPrezzoMin');
    const fPMax   = document.getElementById('fPrezzoMax');
    const fSupMin = document.getElementById('fSup');
    const fSBar   = document.getElementById('searchBar');
    const fSort   = document.getElementById('sortBy');

    const regione   = fReg   ? fReg.value   : '';
    const tipo      = fTipo  ? fTipo.value  : '';
    const stato     = fStato ? fStato.value : '';
    const prezzoMin = (fPMin && fPMin.value)     ? parseItalianNumber(fPMin.value, 0)        : 0;
    const prezzoMax = (fPMax && fPMax.value)     ? parseItalianNumber(fPMax.value, Infinity) : Infinity;
    const supMin    = (fSupMin && fSupMin.value) ? parseItalianNumber(fSupMin.value, 0)      : 0;
    const selectedDays = _getSelectedDays();
    const wantedDaysSet = selectedDays.length
        ? new Set(selectedDays.map(_normalizeDayName))
        : null;
    const qRaw      = fSBar ? fSBar.value.trim() : '';
    LAST_SEARCH_QUERY = qRaw;
    const q = normalizeText(qRaw);

    if (qRaw.length >= 2) saveSearchHistory(qRaw);
    _hideSuggestions();

    const radiusEl = document.getElementById('radiusKm');
    const radius   = radiusEl ? (parseInt(radiusEl.value) || 200) : 200;

    let isProximitySearch = false;
    let searchCity = '';
    let results = [];

    const searchCoords = q && q.length > 1 ? getCityCoords(qRaw) : null;

    if (searchCoords) {
        isProximitySearch = true;
        for (let key in PROVINCE_COORDS) {
            if (PROVINCE_COORDS[key] === searchCoords) { searchCity = key; break; }
        }

        results = LISTINGS
            .map(l => {
                const cityCoords = getCityCoords(l.comune) || getCityCoords(l.regione);
                const distance = cityCoords
                    ? getDistanceKM(searchCoords[0], searchCoords[1], cityCoords[0], cityCoords[1])
                    : Infinity;
                return { ...l, _distance: distance };
            })
            .filter(l => {
                if (l._distance > radius)                  return false;
                if (regione && l.regione !== regione)      return false;
                if (tipo    && l.tipo    !== tipo)         return false;
                if (stato   && l.stato   !== stato)        return false;
                if (prezzoMin > 0 && l.prezzo < prezzoMin) return false;
                if (l.prezzo > prezzoMax)                  return false;
                if (l.superficie < supMin)                 return false;
                if (wantedDaysSet) {
                    const annDays = (l.giorni || '').split(',').map(_normalizeDayName).filter(Boolean);
                    if (!annDays.some(d => wantedDaysSet.has(d))) return false;
                }
                return true;
            });

        results.sort((a, b) => {
            const fa = isListingFeatured(a) ? 1 : 0;
            const fb = isListingFeatured(b) ? 1 : 0;
            if (fa !== fb) return fb - fa;
            return a._distance - b._distance;
        });
    } else {
        results = LISTINGS.filter(l => {
            if (regione && l.regione !== regione)      return false;
            if (tipo    && l.tipo    !== tipo)         return false;
            if (stato   && l.stato   !== stato)        return false;
            if (prezzoMin > 0 && l.prezzo < prezzoMin) return false;
            if (l.prezzo > prezzoMax)                  return false;
            if (l.superficie < supMin)                 return false;
            if (wantedDaysSet) {
                const annDays = (l.giorni || '').split(',').map(_normalizeDayName).filter(Boolean);
                if (!annDays.some(d => wantedDaysSet.has(d))) return false;
            }

            if (q) {
                const desc = typeof l.dettagli_extra === 'object' ? (l.dettagli_extra?.descrizione || '') : '';
                const searchField = normalizeText(`${l.titolo} ${l.comune} ${l.regione} ${l.settore || ''} ${l.merce || ''} ${desc}`);
                if (!searchField.includes(q)) {
                    const hasFuzzyMatch = searchField.split(' ').some(w => fuzzyScore(w, q) > 70);
                    if (!hasFuzzyMatch) return false;
                }
            }
            return true;
        });

        const sortVal = fSort ? fSort.value : '';
        if (sortVal === 'prezzoAsc')       results.sort((a, b) => (a.prezzo || 0) - (b.prezzo || 0));
        else if (sortVal === 'prezzoDesc') results.sort((a, b) => (b.prezzo || 0) - (a.prezzo || 0));
        else if (sortVal === 'superficie') results.sort((a, b) => (b.superficie || 0) - (a.superficie || 0));

        results.sort((a, b) => {
            const fa = isListingFeatured(a) ? 1 : 0;
            const fb = isListingFeatured(b) ? 1 : 0;
            return fb - fa;
        });
    }

    const radiusRow = document.getElementById('radiusRow');
    if (radiusRow) radiusRow.classList.toggle('visible', isProximitySearch);

    const grid  = document.getElementById('resultsGrid');
    const empty = document.getElementById('emptyState');
    const count = document.getElementById('resultCount');

    const doRender = () => {
        if (results.length === 0) {
            if (grid) grid.innerHTML = '';
            if (empty) {
                empty.innerHTML = _buildEmptyState(
                    isProximitySearch, searchCoords, searchCity, qRaw, radius,
                    regione, tipo, stato, prezzoMin, prezzoMax, supMin
                );
                empty.classList.remove('hidden');
            }
        } else {
            if (empty) empty.classList.add('hidden');
            if (grid) {
                grid.innerHTML = results.map((l, i) =>
                    `<div class="card-animate" style="animation-delay:${Math.min(i, 6) * 45}ms">${buildCard(l, true, l._distance)}</div>`
                ).join('');
                observeCardViews();
            }
        }
    };

    if (grid && grid.children.length > 0) {
        grid.style.transition = 'opacity 0.15s ease';
        grid.style.opacity = '0';
        setTimeout(() => { doRender(); grid.style.opacity = '1'; }, 160);
    } else {
        doRender();
    }

    const activeCount = [regione, tipo, stato, q, (prezzoMin > 0 ? 1 : 0), (prezzoMax < Infinity ? 1 : 0), (supMin > 0 ? 1 : 0)].filter(Boolean).length;
    const badge = document.getElementById('filterBadge');
    if (badge) {
        if (activeCount > 0) { badge.textContent = activeCount; badge.classList.remove('hidden'); }
        else badge.classList.add('hidden');
    }

    if (count) {
        count.style.transition = 'opacity 0.15s ease';
        count.style.opacity = '0';
        setTimeout(() => {
            count.textContent = isProximitySearch
                ? `${results.length} annunci entro ${radius} km da ${searchCity || qRaw}`
                : `${results.length} annunci trovati`;
            count.style.opacity = '1';
        }, 160);
    }

    const sub = document.getElementById('subtitle');
    if (sub) {
        if (isProximitySearch) sub.textContent = `Posteggi vicino a ${searchCity || qRaw} (ordinati per distanza)`;
        else if (regione)      sub.textContent = `Posteggi disponibili in ${regione}`;
        else if (q)            sub.textContent = `Risultati per "${qRaw}"`;
        else                   sub.textContent = 'Tutti i posteggi disponibili';
    }

    renderChips(regione, tipo, stato, q, prezzoMin, prezzoMax, supMin, selectedDays);
    _injectItemListLd(results, regione, tipo, q);
}

// ── SMART EMPTY STATE ──
function _buildEmptyState(isProximity, coords, searchCity, qRaw, radius, regione, tipo, stato, prezzoMin, prezzoMax, supMin) {
    if (isProximity && coords) {
        const nearby = _getNearestCitiesWithListings(coords, 4);
        const nbHtml = nearby.length
            ? `<div class="mt-5 flex flex-wrap justify-center gap-2">${nearby.map(c => {
                const safe = c.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
                return `<button onclick="_searchCity('${safe}')" class="chip">${escapeHTML(c)}</button>`;
              }).join('')}</div>`
            : '';
        return `
            <i class="fas fa-map-marker-alt text-slate-200 text-6xl mb-4"></i>
            <p class="text-slate-400 font-bold text-lg">Nessun posteggio entro ${radius} km da ${escapeHTML(searchCity || qRaw)}</p>
            <p class="text-slate-400 text-sm mt-1">Prova ad ampliare il raggio o cerca in un'altra zona.</p>
            ${nbHtml}
            <button onclick="clearFilters()" class="mt-5 text-xs text-blue-600 font-bold hover:underline">Azzera tutti i filtri</button>`;
    }

    if (qRaw) {
        return `
            <i class="fas fa-search text-slate-200 text-6xl mb-4"></i>
            <p class="text-slate-400 font-bold text-lg">Nessun risultato per <span class="text-slate-600">"${escapeHTML(qRaw)}"</span></p>
            <p class="text-slate-400 text-sm mt-1">Prova con un termine diverso o esplora tutti gli annunci.</p>
            <button onclick="clearFilters()" class="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">Vedi tutti gli annunci</button>`;
    }

    const hints = [];
    if (prezzoMax < Infinity) hints.push('Rimuovi il limite di prezzo massimo');
    if (prezzoMin > 0)        hints.push('Rimuovi il prezzo minimo');
    if (supMin > 0)           hints.push('Rimuovi il filtro superficie');
    if (tipo)                 hints.push(`Rimuovi il tipo "${tipo}"`);
    if (stato)                hints.push(`Rimuovi "${stato}"`);
    if (regione)              hints.push(`Rimuovi la regione "${regione}"`);

    return `
        <i class="fas fa-filter text-slate-200 text-6xl mb-4"></i>
        <p class="text-slate-400 font-bold text-lg">Nessun posteggio con questi filtri</p>
        <p class="text-slate-400 text-sm mt-1">Prova a rimuovere qualche filtro per vedere più risultati.</p>
        ${hints.length ? `<p class="text-slate-400 text-xs mt-2 font-medium">${escapeHTML(hints[0])}</p>` : ''}
        <button onclick="clearFilters()" class="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">Azzera tutti i filtri</button>`;
}

function _getNearestCitiesWithListings(coords, maxCount) {
    const seen = new Set();
    const cities = [];
    LISTINGS.forEach(l => {
        const cc = getCityCoords(l.comune) || getCityCoords(l.regione);
        if (!cc) return;
        const d = getDistanceKM(coords[0], coords[1], cc[0], cc[1]);
        const name = l.comune || l.regione;
        if (name && !seen.has(name)) { seen.add(name); cities.push({ name, d }); }
    });
    return cities.sort((a, b) => a.d - b.d).slice(0, maxCount).map(c => c.name);
}

window._searchCity = function(city) {
    const sBar = document.getElementById('searchBar');
    if (sBar) sBar.value = city;
    applyFilters();
};

window._removeHistory = function(e, q) {
    e.stopPropagation();
    removeFromHistory(q);
    const sBar = document.getElementById('searchBar');
    if (sBar) _showSuggestions(sBar);
};

// ── JSON-LD ItemList ──
function _injectItemListLd(items, regione, tipo, q) {
    const name = ['Annunci posteggi mercatali', regione ? `in ${regione}` : '', tipo ? `— ${tipo}` : '', q ? `— ${q}` : ''].filter(Boolean).join(' ');
    const ld = {
        "@context": "https://schema.org", "@type": "ItemList", "name": name,
        "numberOfItems": items.length,
        "itemListElement": items.slice(0, 20).map((l, i) => ({
            "@type": "ListItem", "position": i + 1,
            "url": `https://subingresso.it/annuncio?id=${l.id}`, "name": l.titolo
        }))
    };
    let el = document.getElementById('_ldItemList');
    if (!el) { el = document.createElement('script'); el.id = '_ldItemList'; el.type = 'application/ld+json'; document.head.appendChild(el); }
    el.textContent = JSON.stringify(ld);
}

// ── CHIPS ──
function renderChips(regione, tipo, stato, q, prezzoMin, prezzoMax, supMin, selectedDays) {
    const container = document.getElementById('activeChips');
    if (!container) return;
    container.innerHTML = '';
    if (regione)          container.innerHTML += chip(regione,  () => { document.getElementById('fRegione').value = ''; applyFilters(); });
    if (tipo)             container.innerHTML += chip(tipo,     () => { document.getElementById('fTipo').value = ''; applyFilters(); });
    if (stato)            container.innerHTML += chip(stato,    () => { document.getElementById('fStato').value = ''; applyFilters(); });
    if (q)                container.innerHTML += chip(`"${q}"`, () => { document.getElementById('searchBar').value = ''; applyFilters(); });
    if (prezzoMin > 0)    container.innerHTML += chip(`min €${prezzoMin.toLocaleString('it')}`, () => { const el = document.getElementById('fPrezzoMin'); if (el) el.value = ''; applyFilters(); });
    if (prezzoMax < Infinity) container.innerHTML += chip(`max €${prezzoMax.toLocaleString('it')}`, () => { const el = document.getElementById('fPrezzoMax'); if (el) el.value = ''; applyFilters(); });
    if (supMin > 0)       container.innerHTML += chip(`≥${supMin}m²`, () => { const el = document.getElementById('fSup'); if (el) el.value = ''; applyFilters(); });
    if (Array.isArray(selectedDays) && selectedDays.length) {
        const short = selectedDays.map(d => d.slice(0, 3)).join('+');
        container.innerHTML += chip(`Giorni: ${short}`, () => { _clearAllDayChips(); applyFilters(); });
    }
}

function chip(label, fn) {
    const id = 'chip_' + Math.random().toString(36).slice(2);
    setTimeout(() => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); }, 0);
    return `<span class="chip" id="${id}">${escapeHTML(label)} <i class="fas fa-times text-blue-400"></i></span>`;
}

function _clearAllDayChips() {
    ['dayChipsDesktop', 'dayChipsMobile'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.querySelectorAll('.day-chip.selected').forEach(b => b.classList.remove('selected'));
    });
}

function toggleDayChip(btn) {
    if (!btn) return;
    btn.classList.toggle('selected');
    // Sincronizza l'altro container (desktop ↔ mobile) se il chip omologo esiste
    const day = btn.dataset.day;
    const isMobile = btn.parentElement && btn.parentElement.id === 'dayChipsMobile';
    const otherId  = isMobile ? 'dayChipsDesktop' : 'dayChipsMobile';
    const other = document.getElementById(otherId);
    if (other && day) {
        const twin = other.querySelector('.day-chip[data-day="' + day + '"]');
        if (twin) twin.classList.toggle('selected', btn.classList.contains('selected'));
    }
    // Auto-apply solo se siamo in modalità desktop (mobile applica al "Mostra risultati")
    if (!isMobile) applyFilters();
}
window.toggleDayChip = toggleDayChip;

function clearFilters() {
    ['fRegione', 'fTipo', 'fStato', 'fPrezzoMin', 'fPrezzoMax', 'fSup', 'searchBar'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    _clearAllDayChips();
    applyFilters();
}

// ── Search bar interactions ──
const sBar = document.getElementById('searchBar');
if (sBar) {
    sBar.addEventListener('input', () => {
        sBar.parentElement.classList.remove('search-active');
        void sBar.parentElement.offsetWidth;
        sBar.parentElement.classList.add('search-active');
        _showSuggestions(sBar);
    });
    sBar.addEventListener('focus', () => _showSuggestions(sBar));
    sBar.addEventListener('blur',  () => setTimeout(_hideSuggestions, 200));
    sBar.addEventListener('keydown', (e) => {
        const ul = document.getElementById('searchSuggestions');
        const items = ul ? [...ul.querySelectorAll('li[data-val]')] : [];
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            _sugActiveIdx = Math.min(_sugActiveIdx + 1, items.length - 1);
            items.forEach((li, i) => li.classList.toggle('sug-active', i === _sugActiveIdx));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            _sugActiveIdx = Math.max(_sugActiveIdx - 1, -1);
            items.forEach((li, i) => li.classList.toggle('sug-active', i === _sugActiveIdx));
        } else if (e.key === 'Enter') {
            if (_sugActiveIdx >= 0 && items[_sugActiveIdx]) {
                sBar.value = items[_sugActiveIdx].dataset.val;
                _hideSuggestions();
            }
            applyFilters();
        } else if (e.key === 'Escape') {
            _hideSuggestions();
            sBar.blur();
        }
    });
}

const _sugUl = document.getElementById('searchSuggestions');
if (_sugUl) {
    _sugUl.addEventListener('mousedown', (e) => {
        const li = e.target.closest('li[data-val]');
        if (li && !e.target.closest('.sug-del')) {
            e.preventDefault();
            if (sBar) sBar.value = li.dataset.val;
            _hideSuggestions();
            applyFilters();
        }
    });
}

// Rotating placeholder
let _phIdx = 0;
setInterval(() => {
    const sb = document.getElementById('searchBar');
    if (sb && document.activeElement !== sb && !sb.value) {
        _phIdx = (_phIdx + 1) % PLACEHOLDER_TEXTS.length;
        sb.placeholder = PLACEHOLDER_TEXTS[_phIdx];
    }
}, 3000);

// ── Load listings from Supabase ──────────────────────────────
async function loadListings() {
    try {
        const user = await getCurrentUser();

        let query = _supabase
            .from('annunci')
            .select('id, user_id, titolo, stato, status, tipo, settore, regione, comune, superficie, giorni, prezzo, contatto, dettagli_extra, img_urls, created_at, featured, featured_until, visualizzazioni')
            .order('created_at', { ascending: false });

        if (user) {
            query = query.neq('status', 'deleted').or(`status.eq.active,user_id.eq.${user.id}`);
        } else {
            query = query.eq('status', 'active');
        }

        let { data, error } = await query;
        if (error && /column|schema|PGRST204/i.test(`${error.message || ''} ${error.code || ''}`)) {
            console.warn('Optimized listing select failed, retrying with safe select', error);
            // NB: niente select('*') — anon non ha grant su tel/email (privacy).
            let fallbackQuery = _supabase
                .from('annunci')
                .select('id,user_id,titolo,descrizione,stato,categoria,tipo,settore,dettagli_extra,regione,provincia,comune,superficie,giorni,prezzo,contatto,data,status,created_at,img_urls,expires_at,visualizzazioni,featured,featured_until,featured_tier,featured_since,tel_clicks,video_url')
                .order('created_at', { ascending: false });
            fallbackQuery = user
                ? fallbackQuery.neq('status', 'deleted').or(`status.eq.active,user_id.eq.${user.id}`)
                : fallbackQuery.eq('status', 'active');
            ({ data, error } = await fallbackQuery);
        }

        if (!error && data && data.length > 0) {
            LISTINGS.length = 0;
            data.forEach(l => LISTINGS.push({
                ...l,
                merce: l.merce || l.settore || 'Altro',
                data: l.data || l.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
            }));

            const uniqueIds = [...new Set(data.map(l => l.user_id).filter(Boolean))];
            if (uniqueIds.length) {
                const { data: profiles } = await _supabase
                    .from('profiles').select('id, avatar_url, nome, cognome').in('id', uniqueIds);
                if (profiles) profiles.forEach(p => {
                    if (p.avatar_url) USER_AVATARS[p.id] = p.avatar_url;
                    const fullName = [p.nome, p.cognome].filter(Boolean).join(' ').trim();
                    if (fullName) USER_NAMES[p.id] = fullName;
                });
            }
        }
    } catch (e) {
        console.error("Supabase load failed:", e);
        const grid  = document.getElementById('resultsGrid');
        const empty = document.getElementById('emptyState');
        const count = document.getElementById('resultCount');
        if (grid)  grid.innerHTML = '';
        if (count) count.textContent = '';
        if (empty) {
            empty.innerHTML = `
                <i class="fas fa-wifi text-slate-200 text-6xl mb-4"></i>
                <p class="text-slate-400 font-bold text-lg">Impossibile caricare gli annunci</p>
                <p class="text-slate-400 text-sm mt-1">Controlla la connessione e riprova.</p>
                <button onclick="loadListings()" class="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">Riprova</button>`;
            empty.classList.remove('hidden');
        }
        return;
    }
    applyFilters();
}

document.addEventListener('DOMContentLoaded', loadListings);

// ── ALERT MODAL ──────────────────────────────────────────────
function openAlertModal() {
    requireAuth(function() {
        const modal = document.getElementById('alertModal');
        if (modal) modal.classList.remove('hidden');
        const input = document.getElementById('aComune');
        if (input) input.value = LAST_SEARCH_QUERY || '';
        const err = document.getElementById('aCoordError');
        if (err) err.classList.add('hidden');
    });
}

function closeAlertModal() {
    const modal = document.getElementById('alertModal');
    if (modal) modal.classList.add('hidden');
}

async function submitAlert() {
    requireAuth(async function(user) {
        const input  = document.getElementById('aComune');
        const errEl  = document.getElementById('aCoordError');
        const comune = input ? input.value.trim() : '';

        if (errEl) errEl.classList.add('hidden');

        const coords = comune ? getCityCoords(comune) : null;
        if (comune && !coords) {
            if (errEl) errEl.classList.remove('hidden');
            return;
        }

        const record = { user_id: user.id, comune: comune || null };
        if (coords) { record.lat = coords[0]; record.lng = coords[1]; }

        const { error } = await _supabase.from('alerts').insert(record);

        if (!error) {
            closeAlertModal();
            showToast('Alert attivato! Riceverai una email quando esce un annuncio' + (comune ? ' vicino a ' + comune : '') + '.', 'success');
        } else {
            console.error('Alert error:', error);
            showToast("Errore durante il salvataggio dell'alert. Riprova.", 'error');
        }
    });
}

// ── MOBILE FILTERS ───────────────────────────────────────────
function openMobileFilters() {
    const overlay = document.getElementById('mobileFiltersOverlay');
    const sheet   = document.getElementById('mobileFiltersSheet');
    if (!sheet) return;

    const mReg = document.getElementById('m_fRegione');
    if (mReg && mReg.options.length <= 1) {
        REGIONI.forEach(r => { const o = document.createElement('option'); o.value = o.textContent = r; mReg.appendChild(o); });
    }

    [['fRegione','m_fRegione'],['fTipo','m_fTipo'],['fStato','m_fStato'],['fPrezzoMin','m_fPrezzoMin'],['fPrezzoMax','m_fPrezzoMax'],['fSup','m_fSup']]
        .forEach(([src, dst]) => { const s = document.getElementById(src), d = document.getElementById(dst); if (s && d) d.value = s.value; });

    // Sync chip giorni desktop → mobile
    const dDesk = document.getElementById('dayChipsDesktop');
    const dMob  = document.getElementById('dayChipsMobile');
    if (dDesk && dMob) {
        dMob.querySelectorAll('.day-chip').forEach(mb => {
            const twin = dDesk.querySelector('.day-chip[data-day="' + mb.dataset.day + '"]');
            mb.classList.toggle('selected', !!(twin && twin.classList.contains('selected')));
        });
    }

    overlay?.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => sheet.classList.add('open'));
}

function closeMobileFilters() {
    const overlay = document.getElementById('mobileFiltersOverlay');
    const sheet   = document.getElementById('mobileFiltersSheet');
    sheet?.classList.remove('open');
    setTimeout(() => { overlay?.classList.add('hidden'); document.body.style.overflow = ''; }, 320);
}

function applyMobileFilters() {
    [['m_fRegione','fRegione'],['m_fTipo','fTipo'],['m_fStato','fStato'],['m_fPrezzoMin','fPrezzoMin'],['m_fPrezzoMax','fPrezzoMax'],['m_fSup','fSup']]
        .forEach(([src, dst]) => { const s = document.getElementById(src), d = document.getElementById(dst); if (s && d) d.value = s.value; });

    // Sync chip giorni mobile → desktop (desktop è la fonte di verità per applyFilters)
    const dDesk = document.getElementById('dayChipsDesktop');
    const dMob  = document.getElementById('dayChipsMobile');
    if (dDesk && dMob) {
        dDesk.querySelectorAll('.day-chip').forEach(db => {
            const twin = dMob.querySelector('.day-chip[data-day="' + db.dataset.day + '"]');
            db.classList.toggle('selected', !!(twin && twin.classList.contains('selected')));
        });
    }

    closeMobileFilters();
    applyFilters();
}

function resetMobileFilters() {
    ['m_fRegione', 'm_fTipo', 'm_fStato', 'm_fPrezzoMin', 'm_fPrezzoMax', 'm_fSup'].forEach(id => {
        const el = document.getElementById(id); if (el) el.value = '';
    });
    const dMob = document.getElementById('dayChipsMobile');
    if (dMob) dMob.querySelectorAll('.day-chip.selected').forEach(b => b.classList.remove('selected'));
}

// ── EXPORTS ──────────────────────────────────────────────────
function toggleDesktopFilters() {
    const panel = document.getElementById('desktopFiltersPanel');
    const btn = document.getElementById('desktopFilterToggle');
    if (!panel) return;
    const opening = panel.classList.contains('hidden');
    panel.classList.toggle('hidden', !opening);
    if (btn) {
        btn.classList.toggle('bg-blue-600', opening);
        btn.classList.toggle('bg-slate-900', !opening);
    }
}

window.applyFilters       = applyFilters;
window.loadListings       = loadListings;
window.toggleDesktopFilters = toggleDesktopFilters;
window.openMobileFilters  = openMobileFilters;
window.closeMobileFilters = closeMobileFilters;
window.applyMobileFilters = applyMobileFilters;
window.resetMobileFilters = resetMobileFilters;
window.clearFilters       = clearFilters;
window.openAlertModal     = openAlertModal;
window.closeAlertModal    = closeAlertModal;
window.submitAlert        = submitAlert;
