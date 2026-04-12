// ============================================================
//  Subingresso.it — Logica Dettaglio Annuncio
//  Gestisce visualizzazione, WhatsApp, Chiamate e Chat
// ============================================================

let _currentListing = null;

async function loadListing() {
    const params   = new URLSearchParams(location.search);
    const idParam  = params.get('id');
    console.log("🔍 Tentativo caricamento ID:", idParam);
    
    let listing    = null;

    if (!idParam) {
        console.error("❌ Nessun ID trovato nella URL!");
        return null;
    }

    // 1. Tenta il caricamento da Supabase (Annunci REALI)
    try {
        console.log("📡 Interrogazione Supabase...");
        const { data, error } = await _supabase
            .from('annunci')
            .select('*')
            .eq('id', idParam)
            .maybeSingle();

        if (error) {
            console.error("❌ Errore query Supabase:", error);
        }

        if (data) {
            console.log("✅ Annuncio trovato su DB:", data);
            listing = { 
                ...data, 
                data: data.data || data.created_at?.split('T')[0],
                // Normalizziamo settore/merce se i nomi dei campi differiscono nel DB
                merce: data.merce || data.settore || 'Altro'
            };
        } else {
            console.warn("⚠️ Nessun annuncio reale trovato con questo ID.");
        }
    } catch (e) {
        console.error("❌ Eccezione durante il caricamento:", e);
    }

    // 2. Fallback: Dati demo statici
    if (!listing) {
        console.log("🧩 Tentativo fallback su dati demo...");
        const numId = parseInt(idParam);
        listing = LISTINGS.find(l => l.id === numId);
        if (listing) console.log("✅ Annuncio demo trovato:", listing);
    }

    return listing;
}

async function initPage() {
    const listing = await loadListing();
    _currentListing = listing;

    const notFoundEl = document.getElementById('notFound');
    const detailEl   = document.getElementById('detailLayout');

    if (!listing) {
        if (notFoundEl) notFoundEl.classList.remove('hidden');
        if (detailEl) detailEl.classList.add('hidden');
        return;
    }

    // UI Update
    document.title = `${listing.titolo} — Subingresso.it`;
    if (notFoundEl) notFoundEl.classList.add('hidden');
    if (detailEl) {
        detailEl.classList.remove('hidden');
        detailEl.classList.add('grid');
    }

    // Breadcrumb
    const bcReg = document.getElementById('bcRegione');
    if (bcReg) bcReg.textContent = listing.regione;

    // Stato badge
    const statoBadge = document.getElementById('statoBadge');
    if (statoBadge) {
        statoBadge.textContent = listing.stato;
        if (listing.stato === 'Vendita') {
            statoBadge.classList.add('bg-emerald-500');
        } else {
            statoBadge.classList.add('bg-blue-600');
        }
    }

    // Campi base (Sicurezza: textContent)
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
    
    setTxt('badgeTipo', listing.tipo);
    setTxt('badgeMerce', listing.merce);
    setTxt('titolo', listing.titolo);
    setTxt('descrizione', listing.descrizione);
    setTxt('dataPub', formatDate(listing.data));
    setTxt('cNome', listing.contatto || 'Privato');
    setTxt('cTel', listing.tel || 'Contatto riservato');

    const luogoSpan = document.querySelector('#luogo span');
    if (luogoSpan) luogoSpan.textContent = `${listing.comune}, ${listing.provincia || ''} (${listing.regione})`;

    // Prezzo (Sicurezza: localeString)
    const prezzoEl = document.getElementById('prezzo');
    if (prezzoEl) {
        prezzoEl.textContent = `€ ${Number(listing.prezzo || 0).toLocaleString('it-IT')}`;
    }
    const prezzoSub = document.getElementById('prezzoSub');
    if (prezzoSub) {
        prezzoSub.textContent = listing.stato === 'Affitto mensile' ? 'al mese' : 'prezzo richiesto · trattabile';
    }

    // Immagini (Placeholder o Reali)
    const coverContainer = document.querySelector('.bg-gradient-to-br.from-slate-100');
    
    let extra = listing.dettagli_extra;
    if (typeof extra === 'string') {
        try { extra = JSON.parse(extra); } catch(e) { extra = null; }
    }
    
    const firstImg = (listing.img_urls && listing.img_urls[0]) || (extra && extra.images && extra.images[0]);
    
    if (coverContainer && firstImg) {
        // Rimuoviamo l'icona e mettiamo l'immagine
        coverContainer.innerHTML = `
            <img src="${escapeHTML(firstImg)}" class="w-full h-full object-cover">
            <span id="statoBadge" class="absolute top-6 left-6 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg uppercase tracking-widest ${listing.stato === 'Vendita' ? 'bg-emerald-500' : 'bg-blue-600'}">${escapeHTML(listing.stato)}</span>
        `;
    }

    // Scheda tecnica (Sicurezza: escapeHTML)
    const techRows = [
        { icon:'fa-map-marker-alt', label:'Regione',    val: listing.regione },
        { icon:'fa-city',           label:'Comune',     val: `${listing.comune} (${listing.provincia || ''})` },
        { icon:'fa-store',          label:'Tipo',       val: listing.tipo },
        { icon:'fa-tag',            label:'Merce',      val: listing.merce },
        { icon:'fa-ruler-combined', label:'Superficie', val: `${listing.superficie} m²` },
        { icon:'fa-calendar-alt',   label:'Giorni',     val: listing.giorni },
        { icon:'fa-exchange-alt',   label:'Stato',      val: listing.stato },
    ];
    const rowsGrid = document.getElementById('detailRows');
    if (rowsGrid) {
        rowsGrid.innerHTML = techRows.map(r => `
            <div class="detail-row">
                <div class="detail-icon"><i class="fas ${r.icon}"></i></div>
                <div class="flex-grow">
                    <div class="detail-label">${escapeHTML(r.label)}</div>
                    <div class="detail-val">${escapeHTML(String(r.val))}</div>
                </div>
            </div>`).join('');
    }

    // Annunci correlati
    const relatedSection = document.getElementById('relatedSection');
    const relatedGrid    = document.getElementById('relatedGrid');
    if (relatedSection && relatedGrid) {
        const related = LISTINGS.filter(l => l.regione === listing.regione && l.id !== listing.id).slice(0, 3);
        if (related.length > 0) {
            relatedSection.classList.remove('hidden');
            relatedGrid.innerHTML = related.map(l => buildCard(l)).join('');
        }
    }

    // Check proprietario (cambia pulsante Chat)
    try {
        const { data: { user } } = await _supabase.auth.getUser();
        if (user && listing.user_id && listing.user_id === user.id) {
            const btn = document.getElementById('chatBtn');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-check-circle"></i> Gestisci annuncio';
                btn.onclick = () => location.href = 'dashboard.html';
                btn.className = 'w-full bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-blue-600 transition flex items-center justify-center gap-3 shadow-lg shadow-slate-200';
            }
        }
    } catch (e) {}
}

// ── Azioni ──────────────────────────────────────────────

function makeCall() {
    requireAuth(function () {
        const listing = _currentListing;
        if (!listing || !listing.tel) {
            alert('Numero di telefono non disponibile.');
            return;
        }
        if (listing.tel.includes('*')) {
            alert('Numero oscurato per questo annuncio di archivio.');
            return;
        }
        const cleanTel = listing.tel.replace(/\D/g, '');
        const btn = document.getElementById('contactBtn');
        const info = document.getElementById('contactInfo');
        if (btn) btn.classList.add('hidden');
        if (info) info.classList.remove('hidden');
        window.location.href = `tel:${cleanTel}`;
    });
}

async function startChat() {
    requireAuth(async function (user) {
        const listing = _currentListing;
        if (!listing || typeof listing.id === 'number' || !listing.user_id) {
            alert('Questa funzione è disponibile solo per gli annunci reali carichi sul database.');
            return;
        }
        if (listing.user_id === user.id) {
            location.href = 'dashboard.html';
            return;
        }

        try {
            const { data: existing } = await _supabase
                .from('conversazioni')
                .select('id')
                .eq('annuncio_id', listing.id)
                .eq('acquirente_id', user.id)
                .maybeSingle();

            let convId = existing?.id;

            if (!convId) {
                const { data: created, error } = await _supabase
                    .from('conversazioni')
                    .insert({
                        annuncio_id:   listing.id,
                        acquirente_id: user.id,
                        venditore_id:  listing.user_id
                    })
                    .select('id')
                    .single();

                if (error) throw error;
                convId = created.id;
            }

            location.href = `messaggi.html?conv=${convId}`;
        } catch (err) {
            console.error(err);
            alert('Errore nella chat. Riprova.');
        }
    });
}

function openWhatsApp() {
    requireAuth(function () {
        const listing = _currentListing;
        if (!listing || !listing.tel || listing.tel.includes('*')) {
            alert('WhatsApp non disponibile per questo annuncio.');
            return;
        }
        const cleanTel = listing.tel.replace(/\D/g, '');
        let finalTel = cleanTel.startsWith('3') && cleanTel.length === 10 ? '39' + cleanTel : cleanTel;
        const text = encodeURIComponent(`Ciao! Ti contatto da Subingresso.it per: "${listing.titolo}". Grazie!`);
        window.open(`https://api.whatsapp.com/send?phone=${finalTel}&text=${text}`, '_blank');
    });
}

// Inizializza
document.addEventListener('DOMContentLoaded', initPage);

// Export globali per HTML
window.makeCall = makeCall;
window.startChat = startChat;
window.openWhatsApp = openWhatsApp;
