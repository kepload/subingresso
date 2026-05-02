// ============================================================
//  Subingresso.it — Logica Dettaglio Annuncio
//  Gestisce visualizzazione, WhatsApp, Chiamate e Chat
// ============================================================

let _currentListing = null;
let _contactFetched = false; // true dopo che initPage ha fetchato tel per utente loggato

// Helper to fetch contact info robustly
async function fetchContactInfo(listing) {
    if (!listing) return;
    let finalTel = null;
    let finalEmail = null;

    try {
        if (listing.id) {
            const { data: contactData } = await _supabase
                .from('annunci').select('tel, email').eq('id', listing.id).maybeSingle();
            if (contactData) {
                finalTel = contactData.tel;
                finalEmail = contactData.email;
            }
        }
    } catch (e) {
        console.error("Errore fetch contatto annuncio:", e);
    }

    // Fallback: se tel è vuoto o non ha numeri, prendilo dal profilo venditore
    const cleanTel = finalTel ? String(finalTel).replace(/\D/g, '') : '';
    if (!cleanTel && listing.user_id) {
        try {
            const { data: seller } = await _supabase.from('profiles').select('telefono').eq('id', listing.user_id).maybeSingle();
            if (seller && seller.telefono) {
                finalTel = seller.telefono;
            }
        } catch (e) {
            console.error("Errore fetch contatto venditore:", e);
        }
    }

    listing.tel = finalTel;
    listing.email = finalEmail;
    listing.telFetched = true;

    const telEl = document.getElementById('cTel');
    if (telEl) telEl.textContent = finalTel || 'Contatto riservato';
}

async function loadListing() {
    const params  = new URLSearchParams(location.search);
    const idParam = params.get('id');
    if (!idParam) return null;

    // Usa i dati pre-renderizzati dal server se disponibili (evita un secondo fetch)
    if (window.__SSR_LISTING__ && window.__SSR_LISTING__.id) {
        return window.__SSR_LISTING__;
    }

    let listing = null;

    try {
        const { data } = await _supabase
            .from('annunci')
            .select('id, titolo, descrizione, stato, tipo, settore, regione, provincia, comune, superficie, giorni, prezzo, contatto, dettagli_extra, img_urls, user_id, status, created_at, featured, featured_until, featured_tier')
            .eq('id', idParam)
            .maybeSingle();

        if (data) {
            listing = {
                ...data,
                data: data.data || data.created_at?.split('T')[0],
                merce: data.merce || data.settore || 'Altro'
            };
        }
    } catch (e) {
        console.error("Errore caricamento annuncio:", e);
    }

    if (!listing) {
        const numId = parseInt(idParam);
        listing = LISTINGS.find(l => l.id === numId);
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

    // UI Update — formato SEO allineato con SSR (api/annuncio.js buildTitle)
    const _titleParts = [listing.stato || 'Annuncio', 'posteggio'];
    if (listing.tipo)  _titleParts.push(listing.tipo);
    if (listing.settore && listing.settore !== listing.tipo) _titleParts.push(listing.settore);
    if (listing.comune)  _titleParts.push(`a ${listing.comune}`);
    if (listing.provincia)      _titleParts.push(`(${listing.provincia})`);
    else if (listing.regione)   _titleParts.push(`(${listing.regione})`);
    document.title = `${_titleParts.join(' ')} – Subingresso.it`;

    // OG / meta tag dinamici
    const _setMeta = (id, val) => { const el = document.getElementById(id); if (el && val) el.setAttribute('content', val); };
    const _prezzoOg = listing.prezzo
        ? `€${Number(listing.prezzo).toLocaleString('it-IT')}${listing.stato === 'Affitto mensile' ? '/anno' : ''}`
        : 'Trattativa riservata';
    const _desc = `${listing.stato} posteggio ${listing.tipo || ''} a ${listing.comune} (${listing.regione}) — ${_prezzoOg}. ${(listing.descrizione || '').substring(0, 100)}`;
    _setMeta('metaDesc', _desc);
    _setMeta('ogTitle', document.title);
    _setMeta('ogDesc', _desc);
    _setMeta('ogUrl', window.location.href);

    // Canonical (aggiornato dinamicamente per ogni annuncio)
    let _can = document.getElementById('_canonical');
    if (!_can) { _can = document.createElement('link'); _can.id = '_canonical'; _can.rel = 'canonical'; document.head.appendChild(_can); }
    _can.href = window.location.href;

    if (notFoundEl) notFoundEl.classList.add('hidden');
    if (detailEl) {
        detailEl.classList.remove('hidden');
        detailEl.classList.add('grid');
    }

    // Mostra barra contatti fissa su mobile
    const mobileCta = document.getElementById('mobileCta');
    if (mobileCta) {
        mobileCta.classList.add('visible');
        const mainContent = document.getElementById('mainContent');
        if (mainContent) mainContent.classList.add('has-cta');
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

    // Banner "In Vetrina" se l'annuncio è featured e non scaduto
    const isFeatured = listing.featured === true
        && listing.featured_until
        && new Date(listing.featured_until) > new Date();

    let badgeContainer = document.getElementById('titleBadges');
    if (!badgeContainer) {
        const titoloEl = document.getElementById('titolo');
        if (titoloEl) {
            badgeContainer = document.createElement('div');
            badgeContainer.id = 'titleBadges';
            badgeContainer.className = 'flex flex-wrap items-center gap-2 mb-3';
            titoloEl.parentNode.insertBefore(badgeContainer, titoloEl);
        }
    }

    if (isFeatured && badgeContainer && !document.getElementById('featuredBanner')) {
        const banner = document.createElement('div');
        banner.id = 'featuredBanner';
        banner.className = 'inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm';
        banner.innerHTML = '<i class="fas fa-star"></i> Annuncio in Vetrina';
        badgeContainer.appendChild(banner);

    }

    // Campi base (Sicurezza: textContent)
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
    
    setTxt('badgeTipo', listing.tipo);
    setTxt('badgeMerce', listing.merce);
    setTxt('titolo', listing.titolo);
    setTxt('descrizione', listing.descrizione);

    setTxt('dataPub', formatDate(listing.data));

    // Traccia visita diretta (+2) e mostra contatore — completamente asincrono e isolato
    (async () => {
        try {
            await _supabase.rpc('increment_views', { listing_id: listing.id, amount: Math.random() < 0.5 ? 1 : 2 });
            const { data: vd } = await _supabase
                .from('annunci').select('visualizzazioni').eq('id', listing.id).maybeSingle();
            const vcEl = document.getElementById('viewCount');
            const vcVal = document.getElementById('viewCountVal');
            if (vcEl && vcVal && vd?.visualizzazioni != null) {
                vcVal.textContent = vd.visualizzazioni;
                vcEl.classList.remove('hidden');
                vcEl.classList.add('flex');
            }
        } catch (_) {}
    })();
    setTxt('cNome', listing.contatto || 'Privato');
    setTxt('cTel', listing.tel || 'Contatto riservato');

    const luogoSpan = document.querySelector('#luogo span');
    if (luogoSpan) luogoSpan.textContent = `${listing.comune}, ${listing.provincia || ''} (${listing.regione})`;

    // Prezzo (Sicurezza: localeString)
    const _prezzoStr = listing.prezzo
        ? `€ ${Number(listing.prezzo).toLocaleString('it-IT')}${listing.stato === 'Affitto mensile' ? '<span class="text-xl font-bold text-slate-400 ml-1">/anno</span>' : ''}`
        : 'Trattativa riservata';
    const prezzoEl = document.getElementById('prezzo');
    if (prezzoEl) prezzoEl.innerHTML = _prezzoStr;
    const prezzoMobile = document.getElementById('prezzoMobile');
    if (prezzoMobile) prezzoMobile.innerHTML = _prezzoStr;
    const prezzoSub = document.getElementById('prezzoSub');
    if (prezzoSub) prezzoSub.textContent = 'prezzo richiesto · trattabile';

    // Immagini (Placeholder o Reali)
    const coverContainer = document.getElementById('coverDiv');
    
    let extra = listing.dettagli_extra;
    if (typeof extra === 'string') {
        try { extra = JSON.parse(extra); } catch(e) { extra = null; }
    }
    
    const allImgs = (listing.img_urls && listing.img_urls.length > 0) ? listing.img_urls : (extra && extra.images ? extra.images : []);
    const showImgs = isFeatured ? allImgs : (allImgs.length > 0 ? [allImgs[0]] : []);
    
    if (coverContainer && showImgs.length > 0) {
        let imgsHtml = '';
        if (showImgs.length === 1) {
            imgsHtml = `<img src="${escapeHTML(showImgs[0])}" alt="${escapeHTML(listing.titolo)}" class="w-full h-full object-cover">`;
        } else {
            imgsHtml = `
                <div class="flex overflow-x-auto snap-x snap-mandatory h-full w-full no-scrollbar">
                    ${showImgs.map(img => `<img src="${escapeHTML(img)}" alt="${escapeHTML(listing.titolo)}" class="w-full h-full object-cover flex-shrink-0 snap-center min-w-full">`).join('')}
                </div>
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full z-10 pointer-events-none flex items-center gap-1.5 shadow-md">
                    <i class="fas fa-arrows-alt-h"></i> Scorri le ${showImgs.length} foto
                </div>
            `;
        }

        coverContainer.innerHTML = `
            ${imgsHtml}
            <span id="statoBadge" class="absolute top-6 left-6 z-10 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg uppercase tracking-widest ${listing.stato === 'Vendita' ? 'bg-emerald-500' : 'bg-blue-600'}">${escapeHTML(listing.stato)}</span>
        `;
        _setMeta('ogImage', showImgs[0]);
    }

    // JSON-LD strutturato (Product + BreadcrumbList) — generato automaticamente per ogni annuncio
    const _jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Product",
                "name": listing.titolo,
                "description": _desc,
                "url": window.location.href,
                ...(showImgs[0] ? { "image": showImgs[0] } : {}),
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "EUR",
                    "price": listing.prezzo || 0,
                    "availability": "https://schema.org/InStock"
                },
                "additionalProperty": [
                    listing.tipo       && { "@type": "PropertyValue", "name": "Tipo",       "value": listing.tipo },
                    listing.comune     && { "@type": "PropertyValue", "name": "Comune",     "value": listing.comune },
                    listing.regione    && { "@type": "PropertyValue", "name": "Regione",    "value": listing.regione },
                    listing.superficie && { "@type": "PropertyValue", "name": "Superficie", "value": `${listing.superficie} m²` },
                    listing.giorni     && { "@type": "PropertyValue", "name": "Giorni",     "value": listing.giorni },
                ].filter(Boolean)
            },
            {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Home",    "item": "https://subingresso.it/" },
                    { "@type": "ListItem", "position": 2, "name": "Annunci", "item": "https://subingresso.it/annunci" },
                    { "@type": "ListItem", "position": 3, "name": listing.titolo }
                ]
            }
        ]
    };
    let _ldEl = document.getElementById('_jsonLd');
    if (!_ldEl) { _ldEl = document.createElement('script'); _ldEl.id = '_jsonLd'; _ldEl.type = 'application/ld+json'; document.head.appendChild(_ldEl); }
    _ldEl.textContent = JSON.stringify(_jsonLd);

    // Scheda tecnica (Sicurezza: escapeHTML)
    const techRows = [
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

    // Annunci correlati — fetch da Supabase nella stessa regione
    (async () => {
        const relatedSection = document.getElementById('relatedSection');
        const relatedGrid    = document.getElementById('relatedGrid');
        if (!relatedSection || !relatedGrid || !listing.regione) return;
        try {
            const { data: related } = await _supabase
                .from('annunci')
                .select('*')
                .eq('status', 'active')
                .eq('regione', listing.regione)
                .neq('id', listing.id)
                .limit(3);
            if (related && related.length > 0) {
                relatedSection.classList.remove('hidden');
                relatedGrid.innerHTML = related.map(l => buildCard(l)).join('');
                observeCardViews();
            }
        } catch (_) {}
    })();

    // Seller card
    if (listing.user_id) {
        try {
            const [{ data: seller }, { count: sellerCount }] = await Promise.all([
                _supabase.from('profiles').select('nome, cognome, avatar_url, created_at').eq('id', listing.user_id).single(),
                _supabase.from('annunci').select('id', { count: 'exact', head: true }).eq('user_id', listing.user_id).eq('status', 'active')
            ]);

            if (seller) {
                const card     = document.getElementById('sellerCard');
                const avatarEl = document.getElementById('sellerAvatar');
                const nameEl   = document.getElementById('sellerName');
                const sinceEl  = document.getElementById('sellerSince');
                const badgeEl  = document.getElementById('sellerBadge');
                const linkEl   = document.getElementById('sellerProfileLink');

                const sellerFullName = [seller.nome, seller.cognome].filter(Boolean).join(' ').trim();
                if (seller.avatar_url) {
                    avatarEl.innerHTML = `<img src="${escapeHTML(seller.avatar_url)}" class="w-full h-full object-cover">`;
                } else {
                    avatarEl.textContent = (sellerFullName || 'U').charAt(0).toUpperCase();
                }
                nameEl.textContent  = sellerFullName || 'Utente';
                sinceEl.textContent = `Iscritto dal ${new Date(seller.created_at).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}`;
                if (badgeEl) badgeEl.innerHTML = getProfileBadges(seller.created_at, sellerCount || 0);
                if (linkEl)  linkEl.href = `profilo.html?id=${listing.user_id}`;
                if (card)    card.classList.remove('hidden');
            }
        } catch (_) {}
    }

    // Check proprietario (UI Speciale per il possessore)
    try {
        const { data: _authData } = await _supabase.auth.getUser();
        const user = _authData?.user ?? null;

        if (user) {
            _contactFetched = true; // loggato — settato subito, prima di qualsiasi fetch

            // Fetch tel/email solo per utenti autenticati (mai esposto a utenti anonimi)
            await fetchContactInfo(_currentListing);
        }

        if (user && listing.user_id && String(listing.user_id).trim() === String(user.id).trim()) {
            // 1. Aggiungiamo un badge sopra il titolo
            const titoloEl = document.getElementById('titolo');
            let badgeContainer = document.getElementById('titleBadges');
            if (!badgeContainer && titoloEl) {
                badgeContainer = document.createElement('div');
                badgeContainer.id = 'titleBadges';
                badgeContainer.className = 'flex flex-wrap items-center gap-2 mb-3';
                const anchor = document.getElementById('titleRow') || titoloEl;
                anchor.parentNode.insertBefore(badgeContainer, anchor);
            }
            if (badgeContainer && !document.getElementById('ownerBadge')) {
                const badge = document.createElement('div');
                badge.id = 'ownerBadge';
                badge.className = 'inline-flex items-center gap-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm';
                badge.innerHTML = '<i class="fas fa-user-check text-blue-400"></i> Il tuo annuncio';
                badgeContainer.appendChild(badge);
            }

            // 2. Trasformiamo il pulsante chat in "Modifica Annuncio"
            const chatBtn = document.getElementById('chatBtn');
            if (chatBtn) {
                chatBtn.innerHTML = '<i class="fas fa-edit"></i> Modifica Annuncio';
                chatBtn.onclick = () => { location.href = `modifica-annuncio.html?id=${listing.id}`; };
                chatBtn.className = 'w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 transition flex items-center justify-center gap-3 shadow-xl shadow-blue-100';
            }

            // 3. Nascondiamo il pulsante chiama/whatsapp/salva (proprio annuncio)
            const contactBtn = document.getElementById('contactBtn');
            const whatsappBtn = document.getElementById('whatsappBtn');
            const saveBtn = document.getElementById('saveBtn');
            const saveBtnMobile = document.getElementById('saveBtnMobile');
            if (contactBtn) contactBtn.classList.add('hidden');
            if (whatsappBtn) whatsappBtn.classList.add('hidden');
            if (saveBtn) saveBtn.classList.add('hidden');
            if (saveBtnMobile) saveBtnMobile.classList.add('hidden');
        } else if (!user) {
            // Utente non loggato: maschera numeri di telefono nella descrizione
            const descrEl = document.getElementById('descrizione');
            if (descrEl) {
                descrEl.textContent = maskPhones(descrEl.textContent);
            }
            // Aggiorna label pulsanti con lucchetto
            const chatBtn = document.getElementById('chatBtn');
            const waBtn   = document.getElementById('whatsappBtn');
            const callBtn = document.getElementById('contactBtn');
            if (chatBtn) chatBtn.innerHTML = '<i class="fas fa-lock text-blue-200 mr-2"></i> Accedi per scrivere';
            if (waBtn)   waBtn.innerHTML   = '<i class="fab fa-whatsapp text-xl mr-1"></i><i class="fas fa-lock text-emerald-200 text-xs"></i> Accedi per WhatsApp';
            if (callBtn) callBtn.innerHTML = '<i class="fas fa-lock text-slate-400 mr-2"></i> Accedi per chiamare';
        }
    } catch (e) {
        console.error("Errore check proprietario:", e);
    }
}

// ── Azioni ──────────────────────────────────────────────

function executeCall(listing) {
    if (!listing.telFetched) {
        showToast('Recupero numero in corso, riprova tra un istante…', 'info');
        return;
    }
    let tel = listing.tel;
    if (!tel || String(tel).includes('*')) { showToast('Numero di telefono non disponibile.', 'error'); return; }
    const clean = String(tel).replace(/\D/g, '');
    if (!clean) { showToast('Nessun numero di telefono valido associato a questo annuncio.', 'error'); return; }
    if (typeof listing.id !== 'number') (async () => { try { await _supabase.rpc('increment_tel_clicks', { listing_id: listing.id }); } catch(_){} })();
    window.location.href = `tel:${clean}`;
}

function makeCall() {
    const listing = _currentListing;
    if (!listing) return;

    if (_contactFetched) {
        executeCall(listing);
        return;
    }

    requireAuth(async function () {
        if (!listing.telFetched) {
            await fetchContactInfo(listing);
        }
        executeCall(listing);
    });
}

async function startChat() {
    requireAuth(async function (user) {
        const listing = _currentListing;
        if (!listing || typeof listing.id === 'number' || !listing.user_id) {
            showToast('Questa funzione è disponibile solo per gli annunci reali.', 'warning');
            return;
        }
        if (listing.status === 'deleted') {
            showToast('Questo annuncio non è più disponibile.', 'warning');
            return;
        }
        if (listing.status === 'pending') {
            showToast('Questo annuncio è in attesa di approvazione.', 'info');
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
            showToast('Errore nella chat. Riprova.', 'error');
        }
    });
}

function executeWhatsApp(listing) {
    if (!listing.telFetched) {
        showToast('Recupero numero in corso, riprova tra un istante…', 'info');
        return;
    }
    let tel = listing.tel;
    if (!tel || String(tel).includes('*')) { showToast('WhatsApp non disponibile per questo annuncio.', 'error'); return; }
    const clean = String(tel).replace(/\D/g, '');
    if (!clean) { showToast('Nessun numero di telefono valido associato a questo annuncio.', 'error'); return; }
    const finalTel = clean.startsWith('3') && clean.length === 10 ? '39' + clean : clean;
    const luogo = [listing.comune, listing.provincia ? `(${listing.provincia})` : ''].filter(Boolean).join(' ');
    const text = encodeURIComponent(`Ciao! Ho visto il tuo annuncio su Subingresso.it: "${listing.titolo}"${luogo ? ` a ${luogo}` : ''}. È ancora disponibile? Grazie mille 🙏`);
    if (typeof listing.id !== 'number') (async () => { try { await _supabase.rpc('increment_tel_clicks', { listing_id: listing.id }); } catch(_){} })();
    window.location.href = `https://wa.me/${finalTel}?text=${text}`;
}

function openWhatsApp() {
    const listing = _currentListing;
    if (!listing) return;

    if (_contactFetched) {
        executeWhatsApp(listing);
        return;
    }

    requireAuth(async function () {
        if (!listing.telFetched) {
            await fetchContactInfo(listing);
        }
        executeWhatsApp(listing);
    });
}

// Maschera numeri di telefono italiani (mobile 3xx e fissi 0x). Separatori: spazio, trattino, punto.
function maskPhones(text) {
    return text.replace(/(\+?39[\s\-\.]?)?\b(3\d{2}|0\d{1,3})([\s\-\.]?\d{3,4}){1,3}\b/g, '●●● ●●●●●●●');
}

// Ripristina pulsanti e descrizione dopo il login
async function restoreContactUI() {
    document.getElementById('loginContactBanner')?.remove();

    const chatBtn = document.getElementById('chatBtn');
    const waBtn   = document.getElementById('whatsappBtn');
    const callBtn = document.getElementById('contactBtn');
    if (chatBtn) chatBtn.innerHTML = '<i class="fas fa-comment-alt"></i> Invia Messaggio';
    if (waBtn)   waBtn.innerHTML   = '<i class="fab fa-whatsapp text-xl"></i> WhatsApp';
    if (callBtn) callBtn.innerHTML = '<i class="fas fa-phone-alt text-slate-400"></i> Chiama Ora';

    // Ripristina descrizione originale (senza mascheratura)
    const descrEl = document.getElementById('descrizione');
    if (descrEl && _currentListing?.descrizione) {
        descrEl.textContent = _currentListing.descrizione;
    }

    // Fetch tel/email ora che l'utente è autenticato
    _contactFetched = true; // loggato — settato subito, prima del fetch
    if (_currentListing?.id) {
        await fetchContactInfo(_currentListing);
    }
}

// Inizializza
document.addEventListener('DOMContentLoaded', initPage);

// Quando l'utente effettua il login, aggiorna l'UI senza ricaricare la pagina
try {
    _supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') restoreContactUI();
    });
} catch (e) {}

// Export globali per HTML
window.makeCall = makeCall;
window.startChat = startChat;
window.openWhatsApp = openWhatsApp;

// ── Salva preferito (annuncio corrente) ────────────────────
async function _saveCurrentListing() {
    if (!_currentListing || !_currentListing.id) return;
    if (typeof window.toggleSaveListing === 'function') {
        await window.toggleSaveListing(_currentListing.id, null);
        _refreshLocalSaveButtons();
    }
}

function _refreshLocalSaveButtons() {
    if (!_currentListing) return;
    const saved = (typeof SAVED_IDS !== 'undefined') && SAVED_IDS.has(_currentListing.id);
    const desktopBtn = document.getElementById('saveBtn');
    const mobileBtn  = document.getElementById('saveBtnMobile');

    if (desktopBtn) {
        const icon = desktopBtn.querySelector('i');
        if (saved) {
            if (icon) icon.className = 'fas fa-bookmark text-lg';
            desktopBtn.classList.add('bg-blue-50', 'border-blue-200', 'text-blue-600');
            desktopBtn.classList.remove('border-slate-200', 'text-slate-400');
            desktopBtn.title = 'Salvato nei preferiti';
            desktopBtn.setAttribute('aria-label', 'Salvato nei preferiti');
        } else {
            if (icon) icon.className = 'far fa-bookmark text-lg';
            desktopBtn.classList.remove('bg-blue-50', 'border-blue-200', 'text-blue-600');
            desktopBtn.classList.add('border-slate-200', 'text-slate-400');
            desktopBtn.title = 'Salva nei preferiti';
            desktopBtn.setAttribute('aria-label', 'Salva nei preferiti');
        }
    }
    if (mobileBtn) {
        const icon = mobileBtn.querySelector('i');
        if (icon) icon.className = saved ? 'fas fa-bookmark text-blue-600' : 'far fa-bookmark text-slate-400';
    }
}

// Sync iniziale del bottone "Salva" quando i preferiti vengono caricati
window.addEventListener('listingLoaded', _refreshLocalSaveButtons);
// Sync periodico dopo il primo render della pagina annuncio
setTimeout(_refreshLocalSaveButtons, 1500);
setTimeout(_refreshLocalSaveButtons, 4000);

window._saveCurrentListing = _saveCurrentListing;
