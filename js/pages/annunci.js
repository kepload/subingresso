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

    // ── LOGICA VICINANZA (SEMPRE ATTIVA SE IL TESTO È UN LUOGO) ──
    let isProximitySearch = false;
    let searchCity = '';
    let results = [];

    const searchCoords = q && q.length > 1 ? getCityCoords(qRaw) : null;

    if (searchCoords) {
        // Ricerca per luogo: mostra tutti gli annunci entro 200km, ordinati per distanza
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
                if (l._distance > 200) return false;
                if (regione && l.regione !== regione) return false;
                if (tipo    && l.tipo    !== tipo)    return false;
                if (stato   && l.stato   !== stato)   return false;
                if (l.prezzo > prezzoMax)             return false;
                if (l.superficie < supMin)            return false;
                return true;
            });

        results.sort((a, b) => a._distance - b._distance);
    } else {
        // Ricerca per testo libero (settore, parola chiave, ecc.)
        results = LISTINGS.filter(l => {
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

        // Sort manuale
        if (fSort) {
            const sortVal = fSort.value;
            if (sortVal === 'prezzoAsc') results.sort((a, b) => (a.prezzo || 0) - (b.prezzo || 0));
            else if (sortVal === 'prezzoDesc') results.sort((a, b) => (b.prezzo || 0) - (a.prezzo || 0));
            else if (sortVal === 'superficie') results.sort((a, b) => (b.superficie || 0) - (a.superficie || 0));
        }
    }

    // render con transizione
    const grid   = document.getElementById('resultsGrid');
    const empty  = document.getElementById('emptyState');
    const count  = document.getElementById('resultCount');

    const doRender = () => {
        if (results.length === 0) {
            if (grid) grid.innerHTML = '';
            if (empty) empty.classList.remove('hidden');
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

    // Se il grid ha già contenuto, fade-out → svuota → fade-in
    if (grid && grid.children.length > 0) {
        grid.style.transition = 'opacity 0.15s ease';
        grid.style.opacity = '0';
        setTimeout(() => {
            doRender();
            grid.style.opacity = '1';
        }, 160);
    } else {
        doRender();
    }

    // Aggiorna badge filtri attivi su mobile
    const activeCount = [regione, tipo, stato, q, (prezzoMax !== Infinity ? 1 : 0), (supMin > 0 ? 1 : 0)]
        .filter(Boolean).length;
    const badge = document.getElementById('filterBadge');
    if (badge) {
        if (activeCount > 0) { badge.textContent = activeCount; badge.classList.remove('hidden'); }
        else { badge.classList.add('hidden'); }
    }

    if (count) {
        count.style.transition = 'opacity 0.15s ease';
        count.style.opacity = '0';
        setTimeout(() => {
            count.textContent = isProximitySearch
                ? `${results.length} annunci entro 200km da ${searchCity || qRaw}`
                : `${results.length} annunci trovati`;
            count.style.opacity = '1';
        }, 160);
    }

    // subtitle
    const sub = document.getElementById('subtitle');
    if (sub) {
        if (isProximitySearch) sub.textContent = `Posteggi vicino a ${searchCity || qRaw} (ordinati per distanza)`;
        else if (regione) sub.textContent = `Posteggi disponibili in ${regione}`;
        else if (q)  sub.textContent = `Risultati per "${qRaw}"`;
        else         sub.textContent = 'Tutti i posteggi disponibili';
    }

    renderChips(regione, tipo, stato, q);

    // JSON-LD ItemList — aggiornato automaticamente ad ogni filtro/render
    _injectItemListLd(results, regione, tipo, q);
}

// ── Tracciamento visualizzazioni anteprima (+1) ──────────

function _injectItemListLd(items, regione, tipo, q) {
    const name = [
        'Annunci posteggi mercatali',
        regione ? `in ${regione}` : '',
        tipo    ? `— ${tipo}`    : '',
        q       ? `— ${q}`      : '',
    ].filter(Boolean).join(' ');

    const ld = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": name,
        "numberOfItems": items.length,
        "itemListElement": items.slice(0, 20).map((l, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "url": `https://www.subingresso.it/annuncio?id=${l.id}`,
            "name": l.titolo
        }))
    };

    let el = document.getElementById('_ldItemList');
    if (!el) { el = document.createElement('script'); el.id = '_ldItemList'; el.type = 'application/ld+json'; document.head.appendChild(el); }
    el.textContent = JSON.stringify(ld);
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

// live search con feedback visivo
const sBar = document.getElementById('searchBar');
if (sBar) {
    sBar.addEventListener('input', () => {
        // Pulse sulla barra di ricerca
        sBar.parentElement.classList.remove('search-active');
        void sBar.parentElement.offsetWidth; // reflow per riavviare animazione
        sBar.parentElement.classList.add('search-active');
        applyFilters();
    });
}

// ── Load listings from Supabase (real data) ──────────────
async function loadListings() {
    try {
        const user = await getCurrentUser();
        
        // Costruiamo la query base: tutti gli annunci attivi
        let query = _supabase
            .from('annunci')
            .select('*')
            .order('created_at', { ascending: false });

        // Se l'utente è loggato, può vedere i propri annunci (qualsiasi status) 
        // ALTRIMENTI vede solo quelli active.
        // Nota: La RLS del DB garantisce già che l'utente non possa vedere i pending degli altri.
        // Ma per pulizia lato client, se non siamo admin o proprietari, filtriamo gli active.
        if (user) {
            query = query.neq('status', 'deleted').or(`status.eq.active,user_id.eq.${user.id}`);
        } else {
            query = query.eq('status', 'active');
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
            LISTINGS.length = 0;
            data.forEach(l => LISTINGS.push({
                ...l,
                data: l.data || l.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
            }));

            // Fetch avatar URL per ogni venditore unico
            const uniqueIds = [...new Set(data.map(l => l.user_id).filter(Boolean))];
            if (uniqueIds.length) {
                const { data: profiles } = await _supabase
                    .from('profiles').select('id, avatar_url').in('id', uniqueIds);
                if (profiles) profiles.forEach(p => { if (p.avatar_url) USER_AVATARS[p.id] = p.avatar_url; });
            }
        }
    } catch (e) {
        console.error("Supabase load failed:", e);
    }
    applyFilters();
}

document.addEventListener('DOMContentLoaded', loadListings);

// ── ALERT MODAL FUNCTIONS ──────────────────────────
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

        // Geocodifica lato client
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
            alert('🔔 Alert attivato! Riceverai una email quando esce un annuncio' + (comune ? ' vicino a ' + comune : '') + '.');
        } else {
            console.error('Alert error:', error);
            alert('Errore durante il salvataggio dell\'alert. Riprova.');
        }
    });
}

// Mobile filters bottom sheet
function openMobileFilters() {
    const overlay = document.getElementById('mobileFiltersOverlay');
    const sheet   = document.getElementById('mobileFiltersSheet');
    if (!sheet) return;

    // Popola regioni se vuote
    const mReg = document.getElementById('m_fRegione');
    if (mReg && mReg.options.length <= 1) {
        REGIONI.forEach(r => { const o = document.createElement('option'); o.value = o.textContent = r; mReg.appendChild(o); });
    }

    // Sincronizza valori dal sidebar desktop
    [['fRegione','m_fRegione'],['fTipo','m_fTipo'],['fStato','m_fStato'],['fPrezzoMax','m_fPrezzoMax'],['fSup','m_fSup']]
        .forEach(([src, dst]) => { const s = document.getElementById(src), d = document.getElementById(dst); if (s && d) d.value = s.value; });

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
    [['m_fRegione','fRegione'],['m_fTipo','fTipo'],['m_fStato','fStato'],['m_fPrezzoMax','fPrezzoMax'],['m_fSup','fSup']]
        .forEach(([src, dst]) => { const s = document.getElementById(src), d = document.getElementById(dst); if (s && d) d.value = s.value; });
    closeMobileFilters();
    applyFilters();
}

function resetMobileFilters() {
    ['m_fRegione','m_fTipo','m_fStato','m_fPrezzoMax','m_fSup'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
}

// Esporta funzioni globali per i click negli HTML
window.applyFilters       = applyFilters;
window.openMobileFilters  = openMobileFilters;
window.closeMobileFilters = closeMobileFilters;
window.applyMobileFilters = applyMobileFilters;
window.resetMobileFilters = resetMobileFilters;
window.clearFilters = clearFilters;
window.openAlertModal = openAlertModal;
window.closeAlertModal = closeAlertModal;
window.submitAlert = submitAlert;
