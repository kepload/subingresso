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
let filterRevision = 0;

// ── CONSTANTS ──
const SECTOR_KEYWORDS = [
    'frutta', 'verdura', 'abbigliamento', 'calzature', 'pesce', 'fiori', 'formaggi',
    'salumi', 'dolci', 'giocattoli', 'biancheria', 'borse', 'ferramenta', 'piante',
    'cosmetici', 'libri', 'accessori', 'intimo', 'artigianato', 'alimentari',
    'elettronica', 'tessuti', 'scarpe', 'cappelli', 'spezie', 'casalinghi'
];
const SEARCH_HISTORY_KEY = '_sub_searches';
const PLACEHOLDER_TEXTS = [
    'Cerca comune, frazione…',
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
function _hideSuggestions() { locationSearch.close(); }

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

async function applyFilters() {
    const request = ++filterRevision;
    if (!await locationSearch.prepare()) return;
    const submittedQuery = sBar.value;
    if (locationSearch.selected) await locationGeoReady;
    if (request !== filterRevision || submittedQuery !== sBar.value) return;
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
    const radius   = radiusEl ? (parseInt(radiusEl.value) || 100) : 100;

    let isProximitySearch = false;
    let searchCity = '';
    let results = [];

    const searchRecord = locationSearch.selected;
    const searchCoords = searchRecord ? LocationSearch.coordinates(searchRecord) : null;
    const matchesFilters = l => {
        if (regione && ComuniItaliani.normalize(ComuniItaliani.canonicalRegion(l.regione)) !== ComuniItaliani.normalize(ComuniItaliani.canonicalRegion(regione))) return false;
        if (tipo && ComuniItaliani.normalize(l.tipo) !== ComuniItaliani.normalize(tipo)) return false;
        if (stato && ComuniItaliani.normalize(l.stato) !== ComuniItaliani.normalize(stato)) return false;
        const price = l.prezzo == null || l.prezzo === '' ? NaN : Number(l.prezzo);
        if ((prezzoMin > 0 || prezzoMax < Infinity) && (!Number.isFinite(price) || price < prezzoMin || price > prezzoMax)) return false;
        const area = l.superficie == null || l.superficie === '' ? NaN : Number(l.superficie);
        if (supMin > 0 && (!Number.isFinite(area) || area < supMin)) return false;
        if (wantedDaysSet) {
            const annDays = String(l.giorni || '').split(',').map(_normalizeDayName).filter(Boolean);
            if (!annDays.some(d => wantedDaysSet.has(d))) return false;
        }
        return true;
    };

    if (searchCoords) {
        isProximitySearch = true;
        searchCity = searchRecord.nome;

        results = LISTINGS
            .map(l => {
                const places = LocationSearch.listingCoordinateCandidates(l.comune, l.regione, l.provincia);
                const distance = places.length
                    ? Math.min(...places.map(coords => getDistanceKM(searchCoords[0], searchCoords[1], coords[0], coords[1])))
                    : null;
                return { ...l, _distance: distance };
            })
            .filter(l => {
                // I vecchi annunci possono avere una frazione omonima senza provincia.
                // Mantieni il nome esatto cercato, senza inventare coordinate o distanza.
                if (l._distance === null) {
                    if (!LocationSearch.listingMatchesLocation(l.comune, l.regione, l.provincia, searchRecord)) return false;
                } else if (l._distance > radius)           return false;
                return matchesFilters(l);
            });

        results.sort((a, b) => {
            const sortVal = fSort ? fSort.value : '';
            if (sortVal === 'prezzoAsc') return (a.prezzo || 0) - (b.prezzo || 0);
            if (sortVal === 'prezzoDesc') return (b.prezzo || 0) - (a.prezzo || 0);
            if (sortVal === 'superficie') return (b.superficie || 0) - (a.superficie || 0);
            if (sortVal === 'data') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
            // I nomi storici non localizzabili, ma corrispondenti al luogo
            // cercato, stanno nel gruppo iniziale senza mostrare km inventati.
            const distance = (a._distance ?? 0) - (b._distance ?? 0);
            if (distance) return distance;
            return Number(isListingFeatured(b)) - Number(isListingFeatured(a));
        });
    } else {
        results = LISTINGS.filter(l => {
            if (!matchesFilters(l)) return false;

            if (searchRecord) {
                if (!LocationSearch.listingMatchesLocation(l.comune, l.regione, l.provincia, searchRecord)) return false;
            } else if (q) {
                if (!ListingSearch.score(l, qRaw)) return false;
            }
            return true;
        });

        const sortVal = fSort ? fSort.value : '';
        if (sortVal === 'prezzoAsc')       results.sort((a, b) => (a.prezzo || 0) - (b.prezzo || 0));
        else if (sortVal === 'prezzoDesc') results.sort((a, b) => (b.prezzo || 0) - (a.prezzo || 0));
        else if (sortVal === 'superficie') results.sort((a, b) => (b.superficie || 0) - (a.superficie || 0));

        results.sort((a, b) => {
            if (q && sortVal === 'pertinenza' && !searchRecord) {
                const relevance = ListingSearch.score(b, qRaw) - ListingSearch.score(a, qRaw);
                if (relevance) return relevance;
            }
            const fa = isListingFeatured(a) ? 1 : 0;
            const fb = isListingFeatured(b) ? 1 : 0;
            return fb - fa;
        });
    }

    // Gli scaduti restano visibili in fondo, preservando l'ordine scelto
    // all'interno dei gruppi, anche per distanza, pertinenza e Vetrina.
    results.sort((a, b) => Number(isListingExpired(a)) - Number(isListingExpired(b)));

    const radiusRow = document.getElementById('radiusRow');
    if (radiusRow) radiusRow.classList.toggle('visible', isProximitySearch);
    const defaultSort = fSort?.querySelector('option[value="pertinenza"]');
    if (defaultSort) defaultSort.textContent = isProximitySearch ? 'Più vicini' : 'Più pertinenti';

    const grid  = document.getElementById('resultsGrid');
    const empty = document.getElementById('emptyState');
    const count = document.getElementById('resultCount');

    const doRender = () => {
        if (request !== filterRevision) return;
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

    const hasUnlocatedResults = isProximitySearch && results.some(l => l._distance === null);
    if (count) {
        count.style.transition = 'opacity 0.15s ease';
        count.style.opacity = '0';
        setTimeout(() => {
            if (request !== filterRevision) return;
            count.textContent = isProximitySearch && !hasUnlocatedResults
                ? `${results.length} annunci entro ${radius} km da ${searchCity || qRaw}`
                : `${results.length} annunci trovati`;
            count.style.opacity = '1';
        }, 160);
    }

    const sub = document.getElementById('subtitle');
    if (sub) {
        if (isProximitySearch) sub.textContent = `Posteggi vicino a ${searchCity || qRaw} (${searchRecord.sigla}) · raggio ${radius} km`;
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
        const cc = LocationSearch.listingCoordinates(l.comune, l.regione, l.provincia);
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
const locationSearch = LocationSearch.create({
    input: sBar,
    box: document.getElementById('searchSuggestions'),
    regions: REGIONI,
    keywords: SECTOR_KEYWORDS,
    history: getSearchHistory,
    removeHistory: removeFromHistory,
    initialCode: params.get('comune') || '',
    searchListings: () => LISTINGS.filter(listing => listing.status === 'active'),
    onSubmit: applyFilters
});
const locationGeoReady = LocationSearch.loadGeo().catch(() => {});

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
            .select('id, user_id, titolo, descrizione, categoria, stato, status, tipo, settore, regione, provincia, comune, superficie, giorni, prezzo, contatto, dettagli_extra, img_urls, created_at, expires_at, featured, featured_until, visualizzazioni')
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

        if (error) throw error;
        if (data) {
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
                    const fullName = formatFullName(p.nome, p.cognome);
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
let alertLocationSearch = null;
let alertPrefilledPlace = null;
let alertSaving = false;
function openAlertModal() {
    requireAuth(function() {
        const modal = document.getElementById('alertModal');
        if (modal) modal.classList.remove('hidden');
        const input = document.getElementById('aComune');
        if (input) input.value = LAST_SEARCH_QUERY || '';
        alertPrefilledPlace=null;
        if (!alertLocationSearch) {
            alertLocationSearch = LocationSearch.create({ input, box:document.getElementById('alertLocationSuggestions'),regions:REGIONI,onSubmit:()=>alertLocationSearch?.close() });
            input.addEventListener('input',()=>{alertPrefilledPlace=null;});
        }
        const selected = locationSearch.selected;
        if (selected && input.value === sBar.value.trim()) {input.value=selected.nome;alertPrefilledPlace={value:input.value,place:selected};}
        const err = document.getElementById('aCoordError');
        if (err) err.classList.add('hidden');
    });
}

function closeAlertModal() {
    const modal = document.getElementById('alertModal');
    if (modal) modal.classList.add('hidden');
}

async function submitAlert() {
    if (alertSaving) return;
    alertSaving = true;
    requireAuth(async function(user) {
        const btn=document.getElementById('alertSubmitBtn');
        if(btn)btn.disabled=true;
        try {
        const input  = document.getElementById('aComune');
        const errEl  = document.getElementById('aCoordError');
        const comune = input ? input.value.trim() : '';

        if (errEl) errEl.classList.add('hidden');

        await locationSearch.ready;
        await locationGeoReady;
        const regionName = REGIONI.find(name => normalizeText(name) === normalizeText(comune));
        const place = regionName ? null : alertLocationSearch?.selected || (alertPrefilledPlace?.value===comune?alertPrefilledPlace.place:null) || LocationSearch.resolve(comune);
        const coords = place ? LocationSearch.coordinates(place) : null;
        if (comune && !regionName && (!place || !coords)) {
            if (errEl) errEl.classList.remove('hidden');
            return;
        }

        const radius=Number(document.getElementById('aRadius')?.value||100);
        if(![25,50,100,200,400].includes(radius))throw Error('Raggio non valido');
        const canonical=place?.nome||null;
        const record = { user_id: user.id, comune: canonical, regione:regionName||place?.regione||null,raggio_km:radius };
        if (coords) { record.lat = coords[0]; record.lng = coords[1]; }

        const { error } = await _supabase.from('alerts').insert(record);

        if (!error) {
            closeAlertModal();
            showToast('Alert attivato! '+(canonical?'Annunci entro '+radius+' km da '+canonical:regionName?'Annunci in '+regionName:'Annunci in tutta Italia')+'.', 'success');
        } else {
            console.error('Alert error:', error);
            showToast("Errore durante il salvataggio dell'alert. Riprova.", 'error');
        }
        } catch (_) { showToast('Impossibile salvare l’avviso. Controlla la località e riprova.','error'); }
        finally { alertSaving=false;if(btn)btn.disabled=false; }
    });
    // L'apertura del modulo richiede già l'accesso; se la sessione è terminata consentire il retry dopo login.
    setTimeout(()=>{if(!document.getElementById('alertSubmitBtn')?.disabled)alertSaving=false;},1000);
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
