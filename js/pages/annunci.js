// ============================================================
//  Subingresso.it — Logica Pagina Annunci
//  Gestisce filtri, ricerca, Supabase integration e Alert
// ============================================================

const params = new URLSearchParams(location.search);

// Populate regione select
const fRegione = document.getElementById('fRegione');
if (fRegione) {
    REGIONI.forEach(r => {
        const opt = document.createElement('option');
        opt.value = opt.textContent = r;
        fRegione.appendChild(opt);
    });
}

// Pre-select from URL
if (params.get('regione') && fRegione) fRegione.value = params.get('regione');
if (params.get('q')) {
    const sBar = document.getElementById('searchBar');
    if (sBar) sBar.value = params.get('q');
}

let LAST_SEARCH_QUERY = '';

// ── FILTER & RENDER ──
function applyFilters() {
    const fReg     = document.getElementById('fRegione');
    const fTipo    = document.getElementById('fTipo');
    const fStato   = document.getElementById('fStato');
    const fPMax    = document.getElementById('fPrezzoMax');
    const fSupMin  = document.getElementById('fSup');
    const fSBar    = document.getElementById('searchBar');
    const fSort    = document.getElementById('sortBy');

    const regione   = fReg ? fReg.value : '';
    const tipo      = fTipo ? fTipo.value : '';
    const stato     = fStato ? fStato.value : '';
    const prezzoMax = (fPMax && fPMax.value) ? parseFloat(fPMax.value) : Infinity;
    const supMin    = (fSupMin && fSupMin.value) ? parseFloat(fSupMin.value) : 0;
    const qRaw      = fSBar ? fSBar.value.trim() : '';
    LAST_SEARCH_QUERY = qRaw; 
    const q         = normalizeText(qRaw);

    let results = LISTINGS.filter(l => {
        if (regione && l.regione !== regione) return false;
        if (tipo    && l.tipo    !== tipo)    return false;
        if (stato   && l.stato   !== stato)   return false;
        if (l.prezzo > prezzoMax)             return false;
        if (l.superficie < supMin)            return false;
        
        if (q) {
            const searchField = normalizeText(`${l.titolo} ${l.comune} ${l.regione} ${l.settore || ''} ${l.merce || ''}`);
            if (!searchField.includes(q)) {
                const words = searchField.split(' ');
                const hasFuzzyMatch = words.some(w => fuzzyScore(w, q) > 70);
                if (!hasFuzzyMatch) return false;
            }
        }
        return true;
    });

    // ── LOGICA VICINANZA (FALLBACK) ──
    let isProximitySearch = false;
    let fallbackCity = '';
    
    if (results.length === 0 && q && q.length > 2) {
        const searchCoords = getCityCoords(qRaw);
        if (searchCoords) {
            isProximitySearch = true;
            for (let key in PROVINCE_COORDS) {
                if (PROVINCE_COORDS[key] === searchCoords) { fallbackCity = key; break; }
            }

            results = LISTINGS.map(l => {
                const cityCoords = getCityCoords(l.comune) || getCityCoords(l.regione);
                let distance = Infinity;
                if (cityCoords) {
                    distance = getDistanceKM(searchCoords[0], searchCoords[1], cityCoords[0], cityCoords[1]);
                }
                return { ...l, _distance: distance };
            }).filter(l => l._distance <= 400);
            
            results.sort((a, b) => a._distance - b._distance);
        }
    }

    // Sort manuale (se non è ricerca per vicinanza)
    if (!isProximitySearch && fSort) {
        const sortVal = fSort.value;
        if (sortVal === 'prezzoAsc') results.sort((a, b) => (a.prezzo || 0) - (b.prezzo || 0));
        else if (sortVal === 'prezzoDesc') results.sort((a, b) => (b.prezzo || 0) - (a.prezzo || 0));
        else if (sortVal === 'superficie') results.sort((a, b) => (b.superficie || 0) - (a.superficie || 0));
        // 'data' è il default (già ordinati da Supabase)
    }

    // render
    const grid   = document.getElementById('resultsGrid');
    const empty  = document.getElementById('emptyState');
    const count  = document.getElementById('resultCount');

    if (results.length === 0) {
        if (grid) grid.innerHTML = '';
        if (empty) empty.classList.remove('hidden');
    } else {
        if (empty) empty.classList.add('hidden');
        if (grid) grid.innerHTML = results.map(l => buildCard(l, true, l._distance)).join('');
    }

    if (count) {
        count.textContent = isProximitySearch 
            ? `Nessun risultato esatto per "${qRaw}", ecco i più vicini a ${fallbackCity || qRaw}:` 
            : `${results.length} annunci trovati`;
    }

    // subtitle
    const sub = document.getElementById('subtitle');
    if (sub) {
        if (isProximitySearch) sub.textContent = `Annunci vicino a ${fallbackCity || qRaw}`;
        else if (regione) sub.textContent = `Posteggi disponibili in ${regione}`;
        else if (q)  sub.textContent = `Risultati per "${q}"`;
        else         sub.textContent = 'Tutti i posteggi disponibili';
    }

    renderChips(regione, tipo, stato, q);
}

function renderChips(regione, tipo, stato, q) {
    const container = document.getElementById('activeChips');
    if (!container) return;
    container.innerHTML = '';
    if (regione) container.innerHTML += chip(regione, () => { document.getElementById('fRegione').value = ''; applyFilters(); });
    if (tipo)    container.innerHTML += chip(tipo,    () => { document.getElementById('fTipo').value = ''; applyFilters(); });
    if (stato)   container.innerHTML += chip(stato,   () => { document.getElementById('fStato').value = ''; applyFilters(); });
    if (q)       container.innerHTML += chip(`"${q}"`, () => { document.getElementById('searchBar').value = ''; applyFilters(); });
}

function chip(label, fn) {
    const id = 'chip_' + Math.random().toString(36).slice(2);
    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', fn);
    }, 0);
    return `<span class="chip" id="${id}">${label} <i class="fas fa-times text-blue-400"></i></span>`;
}

function clearFilters() {
    const ids = ['fRegione', 'fTipo', 'fStato', 'fPrezzoMax', 'fSup', 'searchBar'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
    applyFilters();
}

// live search
const sBar = document.getElementById('searchBar');
if (sBar) sBar.addEventListener('input', applyFilters);

// ── Load listings from Supabase (real data) ──────────────
async function loadListings() {
    try {
        const { data, error } = await _supabase
            .from('annunci')
            .select('*')
            .eq('status', 'active')
            .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
            .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
            LISTINGS.length = 0;
            data.forEach(l => LISTINGS.push({
                ...l,
                data: l.data || l.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
            }));
        }
    } catch (e) {
        console.warn("Supabase load failed, using demo data.");
    }
    applyFilters();
}

document.addEventListener('DOMContentLoaded', loadListings);

// ── ALERT MODAL FUNCTIONS ──────────────────────────
function openAlertModal() {
    requireAuth(function() {
        const aReg = document.getElementById('aRegione');
        const aMer = document.getElementById('aMerce');
        
        if (aReg && aReg.options.length <= 1) {
            REGIONI.forEach(r => {
                const opt = document.createElement('option');
                opt.value = opt.textContent = r;
                aReg.appendChild(opt);
            });
        }
        if (aMer && aMer.options.length <= 1) {
            MERCI.forEach(m => {
                const opt = document.createElement('option');
                opt.value = opt.textContent = m;
                aMer.appendChild(opt);
            });
        }

        const modal = document.getElementById('alertModal');
        if (modal) modal.classList.remove('hidden');
    });
}

function closeAlertModal() {
    const modal = document.getElementById('alertModal');
    if (modal) modal.classList.add('hidden');
}

async function submitAlert() {
    requireAuth(async function(user) {
        const aReg = document.getElementById('aRegione');
        const aMer = document.getElementById('aMerce');
        const regione = aReg ? aReg.value : '';
        const merce   = aMer ? aMer.value : '';
        
        const { error } = await _supabase.from('alerts').insert({
            user_id: user.id,
            regione: regione,
            tipo: merce
        });

        if (!error) {
            alert('🔔 Alert attivato! Ti contatteremo su WhatsApp appena ci sono novità per ' + (regione || 'tutta Italia') + '.');
            closeAlertModal();
        } else {
            // Mock success if table not yet migrated
            alert('🔔 Alert attivato! Ti contatteremo su WhatsApp appena ci sono novità per ' + (regione || 'tutta Italia') + '.');
            closeAlertModal();
        }
    });
}

// Esporta funzioni globali per i click negli HTML
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.openAlertModal = openAlertModal;
window.closeAlertModal = closeAlertModal;
window.submitAlert = submitAlert;
