// ============================================================
//  Subingresso.it — Logica Dettaglio Annuncio
//  Gestisce visualizzazione, WhatsApp, Chiamate e Chat
// ============================================================

let _currentListing = null;
let _contactUserId = null;
let _contactVersion = 0;
let _contactRequest = null;
let _contactAction = null;
const _moderationPreview = new URLSearchParams(location.search).get('anteprima') === 'moderazione';

function listingPhotoLink(url, title, index, gallery) {
    return `<a href="${escapeHTML(url)}" target="_blank" rel="noopener" aria-label="Apri foto ${index + 1} originale in una nuova scheda" style="cursor:zoom-in" class="block w-full h-full ${gallery ? 'flex-shrink-0 snap-center min-w-full' : ''}"><img src="${escapeHTML(getOptimizedImageUrl(url, 1280))}" alt="${escapeHTML(title)}" decoding="async" ${index > 0 ? 'loading="lazy"' : 'fetchpriority="high"'} class="w-full h-full object-cover"></a>`;
}

// Mette davanti gli annunci in Vetrina attiva (chi paga ha priorità di
// visibilità nei box "consigliati"). I featured vengono mescolati per dare
// rotazione equa quando sono più dei posti disponibili; gli altri restano
// nell'ordine ricevuto (created_at desc). isListingFeatured arriva da data.js.
function _featuredFirst(list, n) {
    const f = [], r = [];
    (list || []).forEach(l => {
        ((typeof isListingFeatured === 'function' && isListingFeatured(l)) ? f : r).push(l);
    });
    for (let i = f.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [f[i], f[j]] = [f[j], f[i]];
    }
    return f.concat(r).slice(0, n);
}

// Helper to fetch contact info via RPC `get_listing_contact`.
// Anti-scraping: la RPC è SECURITY DEFINER e applica rate limit silenzioso
// (50 contatti unique/ora) + log su contact_reveals. Owner e admin sono in
// bypass — vedono sempre tutto senza consumo quota.
function _clearContactInfo(listing) {
    if (!listing) return;
    listing.tel = null;
    listing.email = null;
    listing.telFetched = false;
}

function _setContactUser(userId) {
    if (_contactUserId === userId) return false;
    _contactUserId = userId;
    _contactVersion++;
    _contactRequest?.controller.abort();
    _contactRequest = null;
    _contactAction = null;
    _clearContactInfo(_currentListing);
    _renderPhoneContactUI('idle');
    return true;
}

function _renderPhoneContactUI(state, message) {
    const loading = state === 'loading';
    const retry = state === 'error';
    const text = message || (loading ? 'Recupero del numero in corso…'
        : state === 'empty' ? 'Numero di telefono non disponibile per questo annuncio.' : '');
    const telEl = document.getElementById('cTel');
    if (telEl) telEl.textContent = _currentListing?.tel || text || 'Contatto riservato';

    document.querySelectorAll('[onclick="makeCall()"], [onclick="openWhatsApp()"]').forEach(button => {
        const whatsapp = button.getAttribute('onclick') === 'openWhatsApp()';
        const mobile = !!button.closest('#mobileCta');
        const actionLabel = retry ? (whatsapp ? 'Riprova WhatsApp' : 'Riprova chiamata')
            : !_contactUserId ? (whatsapp ? 'Accedi per WhatsApp' : 'Accedi per chiamare')
            : whatsapp ? 'WhatsApp' : 'Chiama Ora';
        const label = loading ? (mobile ? 'Attendi…' : 'Recupero numero…')
            : mobile ? (retry ? 'Riprova' : 'WhatsApp') : actionLabel;
        const icon = whatsapp ? 'fab fa-whatsapp' : 'fas fa-phone-alt';
        button.innerHTML = `<i class="${icon}" aria-hidden="true"></i><span>${label}</span>`;
        button.disabled = loading;
        button.setAttribute('aria-busy', String(loading));
        button.setAttribute('aria-label', loading ? 'Recupero numero in corso' : actionLabel);
        button.setAttribute('aria-describedby', mobile ? 'phoneContactStatusMobile' : 'phoneContactStatus');
    });

    // Stato persistente vicino ai pulsanti, anche nella barra fissa su telefono.
    const desktop = document.getElementById('contactBtn')?.parentElement;
    const mobile = document.getElementById('mobileCta');
    [desktop, mobile].forEach((container, index) => {
        if (!container) return;
        const id = index ? 'phoneContactStatusMobile' : 'phoneContactStatus';
        let status = document.getElementById(id);
        if (!status) {
            status = document.createElement('p');
            status.id = id;
            status.className = 'text-sm font-bold text-slate-600';
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');
            status.setAttribute('aria-atomic', 'true');
            if (index) {
                Object.assign(status.style, { position: 'absolute', bottom: '100%', left: '0', right: '0',
                    padding: '12px 16px 0', backgroundColor: 'inherit' });
                container.prepend(status);
            } else container.appendChild(status);
        }
        status.textContent = text;
        status.hidden = !text;
    });
}

// Solo risposte valide sono definitive; errori e timeout liberano la richiesta.
// Il contesto include l'identità e la sua versione per ignorare risposte tardive.
function fetchContactInfo(listing, userId) {
    if (!listing?.id || !userId || userId !== _contactUserId) return Promise.resolve(false);
    if (listing.telFetched) return Promise.resolve(true);
    if (_contactRequest?.listing === listing) return _contactRequest.promise;

    const request = { listing, userId, version: _contactVersion, controller: new AbortController() };
    const isCurrent = () => _contactRequest === request && _currentListing === listing
        && _contactUserId === userId && _contactVersion === request.version;
    _contactRequest = request;
    _renderPhoneContactUI('loading');
    request.promise = (async () => {
        const timeout = setTimeout(() => request.controller.abort(), 12000);
        try {
            const { data, error } = await _supabase.rpc('get_listing_contact', { p_annuncio_id: listing.id })
                .abortSignal(request.controller.signal);
            if (!isCurrent()) return false;
            if (error) throw error;
            if (!Array.isArray(data) || (data.length && (!data[0] || typeof data[0] !== 'object'
                || !('tel' in data[0] || 'seller_telefono' in data[0])))) throw new Error('Invalid contact response');
            const row = data[0];
            listing.tel = row?.tel || row?.seller_telefono || null;
            listing.email = row?.email || null;
            listing.telFetched = true;
            _renderPhoneContactUI(listing.tel ? 'ready' : 'empty');
            return true;
        } catch (error) {
            if (isCurrent()) {
                _clearContactInfo(listing);
                _renderPhoneContactUI('error', error.code === '42501'
                    ? 'Contatto riservato o limite di richieste raggiunto. Riprova più tardi.'
                    : 'Impossibile recuperare il numero. Tocca Chiama o WhatsApp per riprovare.');
            }
            return false;
        } finally {
            clearTimeout(timeout);
            if (_contactRequest === request) _contactRequest = null;
        }
    })();
    return request.promise;
}

async function loadListing() {
    const params  = new URLSearchParams(location.search);
    const idParam = params.get('id');
    if (!idParam) return null;

    // Usa i dati pre-renderizzati dal server se disponibili (evita un secondo fetch)
    if (!_moderationPreview && window.__SSR_LISTING__ && window.__SSR_LISTING__.id) {
        return window.__SSR_LISTING__;
    }

    let listing = null;

    try {
        const { data } = await _supabase
            .from('annunci')
            .select('id, titolo, descrizione, stato, tipo, settore, regione, provincia, comune, superficie, giorni, prezzo, contatto, dettagli_extra, img_urls, user_id, status, created_at, featured, featured_until, featured_tier, saved_count, expires_at, video_url')
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

    if (!listing && !_moderationPreview) {
        const numId = parseInt(idParam);
        listing = LISTINGS.find(l => l.id === numId);
    }

    return listing;
}

async function initPage() {
    if (_moderationPreview) {
        try {
            if (!await ListingModeration.authorize()) return;
        } catch (_) {
            ListingModeration.showUnavailable('Impossibile caricare l’anteprima. Riprova dalla dashboard.');
            return;
        }
    }
    const listing = await loadListing();
    _currentListing = listing;
    _clearContactInfo(listing);
    _renderPhoneContactUI('idle');
    _refreshLocalSaveButtons();

    const notFoundEl = document.getElementById('notFound');
    const detailEl   = document.getElementById('detailLayout');

    if (!listing) {
        if (_moderationPreview) {
            ListingModeration.showUnavailable('Annuncio non disponibile. Torna alla dashboard e riprova.');
            return;
        }
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
    if (mobileCta && !_moderationPreview) {
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

    // Banner "Annuncio Scaduto" + degrado UX dei bottoni di contatto.
    // Il rendering è non-distruttivo: se più tardi l'annuncio viene riattivato
    // basta reload pagina, niente roba persistente da resettare.
    const isExpired = _isListingExpiredLocal(listing);
    if (isExpired) {
        // Badge accanto al titolo
        if (badgeContainer && !document.getElementById('expiredBanner')) {
            const banner = document.createElement('div');
            banner.id = 'expiredBanner';
            banner.className = 'inline-flex items-center gap-2 bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm';
            banner.innerHTML = '<i class="fas fa-clock"></i> Annuncio Scaduto';
            badgeContainer.appendChild(banner);
        }
        // Banner spiegazione sopra i bottoni di contatto
        const priceCardBtns = document.getElementById('chatBtn');
        if (priceCardBtns && !document.getElementById('expiredNotice')) {
            const notice = document.createElement('div');
            notice.id = 'expiredNotice';
            notice.className = 'mb-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 text-xs font-bold leading-relaxed';
            notice.innerHTML = '<div class="flex items-start gap-2"><i class="fas fa-clock text-amber-500 text-base mt-0.5"></i><div><p class="font-black mb-1">Annuncio scaduto</p><p class="font-semibold text-amber-800">Il venditore non riceve più contatti finché non lo riattiva. Se lo conosci, segnalaglielo direttamente.</p></div></div>';
            priceCardBtns.parentNode.insertBefore(notice, priceCardBtns);
        }
        // Stile bottoni: più spenti, lucchetto. Click resta intercettato dal toast.
        ['chatBtn', 'whatsappBtn', 'contactBtn'].forEach(id => {
            const b = document.getElementById(id);
            if (!b) return;
            b.classList.add('opacity-50', 'cursor-not-allowed');
        });
        // Stessa cosa sui CTA mobile
        const mobileCta = document.getElementById('mobileCta');
        if (mobileCta) mobileCta.classList.add('opacity-60');
    }

    // Campi base (Sicurezza: textContent)
    const setTxt = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
    
    setTxt('badgeTipo', listing.tipo);
    const giornoSlot = document.getElementById('badgeGiornoSlot');
    if (giornoSlot && typeof _dayBadge === 'function') {
        giornoSlot.innerHTML = _dayBadge(listing.giorni, listing.tipo, 'md');
    }
    setTxt('titolo', listing.titolo);
    setTxt('descrizione', listing.descrizione);

    setTxt('dataPub', formatDate(listing.data));

    // Saved count: visibile a tutti (social proof). Privacy preservata: nessuno
    // può sapere CHI ha salvato (RLS owner-only su saved_listings), solo IL NUMERO.
    if (listing.saved_count != null && listing.saved_count > 0) {
        const sc = document.getElementById('savedCount');
        const scv = document.getElementById('savedCountVal');
        if (sc && scv) {
            scv.textContent = listing.saved_count;
            sc.classList.remove('hidden');
            sc.classList.add('flex');
        }
    }

    // Una visita al dettaglio = un evento, distinto dall'apparizione della card.
    (async () => {
        if (_moderationPreview) return;
        try {
            await _supabase.rpc('track_listing_view', { listing_id: listing.id, view_type: 'detail' });
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
    const showImgs = allImgs.filter(url => {
        try { return ['https:', 'http:'].includes(new URL(url).protocol); } catch (_) { return false; }
    });
    
    if (coverContainer) {
        coverContainer.classList.toggle('listing-detail-cover--place', showImgs.length === 0);
        let imgsHtml = '';
        if (showImgs.length === 1) {
            imgsHtml = listingPhotoLink(showImgs[0], listing.titolo, 0, false) + '<span class="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/40 text-white text-[10px] font-black px-3 py-1.5 rounded-full pointer-events-none">Tocca per ingrandire</span>';
        } else if (showImgs.length > 1) {
            imgsHtml = `
                <div class="flex overflow-x-auto snap-x snap-mandatory h-full w-full no-scrollbar">
                    ${showImgs.map((img, index) => listingPhotoLink(img, listing.titolo, index, true)).join('')}
                </div>
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full z-10 pointer-events-none flex items-center gap-1.5 shadow-md">
                    <i class="fas fa-arrows-alt-h"></i> Scorri le ${showImgs.length} foto · Tocca per ingrandire
                </div>
            `;
        }

        coverContainer.innerHTML = `
            ${imgsHtml}
            <div class="listing-detail-place" aria-hidden="true"><strong>${escapeHTML(String(listing.comune || listing.titolo || '').split(',')[0].trim())}</strong></div>
            <span id="statoBadge" class="absolute top-6 right-6 z-10 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg uppercase tracking-widest ${listing.stato === 'Vendita' ? 'bg-emerald-500' : 'bg-blue-600'}">${escapeHTML(listing.stato)}</span>
        `;
        if (showImgs.length) _setMeta('ogImage', showImgs[0]);
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
                // Senza 'image' Google scarta la scheda Product. Fallback brand se l'annuncio non ha foto.
                "image": showImgs[0] || 'https://subingresso.it/og/og-home.jpg?v=1',
                "brand": { "@type": "Brand", "name": "Subingresso.it" },
                "offers": {
                    "@type": "Offer",
                    "priceCurrency": "EUR",
                    "price": listing.prezzo || 0,
                    "availability": "https://schema.org/InStock",
                    "itemCondition": "https://schema.org/UsedCondition",
                    // Subingresso = trasferimento d'attività: nessun reso possibile.
                    "hasMerchantReturnPolicy": {
                        "@type": "MerchantReturnPolicy",
                        "applicableCountry": "IT",
                        "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
                    },
                    // Nessuna spedizione: il compratore non paga costi di consegna (0 €, IT).
                    "shippingDetails": {
                        "@type": "OfferShippingDetails",
                        "shippingRate": { "@type": "MonetaryAmount", "value": 0, "currency": "EUR" },
                        "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "IT" },
                        "deliveryTime": {
                            "@type": "ShippingDeliveryTime",
                            "handlingTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 0, "unitCode": "DAY" },
                            "transitTime": { "@type": "QuantitativeValue", "minValue": 0, "maxValue": 0, "unitCode": "DAY" }
                        }
                    }
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
    if (!_moderationPreview) {
        if (!_ldEl) { _ldEl = document.createElement('script'); _ldEl.id = '_jsonLd'; _ldEl.type = 'application/ld+json'; document.head.appendChild(_ldEl); }
        _ldEl.textContent = JSON.stringify(_jsonLd);
    }

    // Scheda tecnica (Sicurezza: escapeHTML)
    const techRows = [
        { icon:'fa-store',          label:'Tipo',       val: listing.tipo },
        { icon:'fa-tag',            label:'Merce',      val: listing.merce },
        { icon:'fa-ruler-combined', label:'Superficie', val: `${listing.superficie} m²` },
        { icon:'fa-calendar-alt',   label:'Giorni',     val: listing.giorni },
        { icon:'fa-exchange-alt',   label:'Stato',      val: listing.stato },
    ];
    if (_moderationPreview && extra && typeof extra === 'object') {
        if (extra.nome_fiera) techRows.push({ icon: 'fa-store', label: 'Nome fiera', val: extra.nome_fiera });
        if (extra.note_fiera) techRows.push({ icon: 'fa-info-circle', label: 'Note fiera', val: extra.note_fiera });
    }
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
        if (_moderationPreview) return;
        const relatedSection = document.getElementById('relatedSection');
        const relatedGrid    = document.getElementById('relatedGrid');
        if (!relatedSection || !relatedGrid || !listing.regione) return;
        try {
            // NB: select esplicito senza tel/email (REVOKE per authenticated dal 3 mag 2026).
            // Fetchamo più candidati e poi mettiamo davanti gli annunci in
            // Vetrina (chi paga ha priorità di visibilità qui). Tra i featured
            // si pesca a caso a ogni visita per rotazione equa, così non sono
            // sempre gli stessi 3 a comparire.
            const { data: pool } = await _supabase
                .from('annunci')
                .select('id, user_id, titolo, descrizione, stato, categoria, tipo, settore, dettagli_extra, regione, provincia, comune, superficie, giorni, prezzo, contatto, data, status, created_at, img_urls, expires_at, visualizzazioni, featured, featured_until, featured_tier, featured_since, video_url')
                .eq('status', 'active')
                .eq('regione', listing.regione)
                .neq('id', listing.id)
                .order('created_at', { ascending: false })
                .limit(24);
            const related = _featuredFirst(pool, 3);
            if (related.length > 0) {
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
                    .or(`expires_at.gt.${new Date().toISOString()},expires_at.is.null`)
            ]);

            if (seller) {
                const card     = document.getElementById('sellerCard');
                const avatarEl = document.getElementById('sellerAvatar');
                const nameEl   = document.getElementById('sellerName');
                const sinceEl  = document.getElementById('sellerSince');
                const badgeEl  = document.getElementById('sellerBadge');
                const linkEl   = document.getElementById('sellerProfileLink');

                const sellerFullName = formatFullName(seller.nome, seller.cognome);
                if (seller.avatar_url) {
                    avatarEl.innerHTML = `<img src="${escapeHTML(getOptimizedImageUrl(seller.avatar_url, 96))}" decoding="async" class="w-full h-full object-cover">`;
                } else {
                    avatarEl.textContent = (sellerFullName || 'U').charAt(0).toUpperCase();
                }
                nameEl.textContent  = sellerFullName || 'Utente';
                if (Number.isInteger(sellerCount)) USER_ACTIVE_LISTING_COUNTS.set(listing.user_id, sellerCount);
                nameEl.insertAdjacentHTML('afterend', sellerListingCountHtml(listing.user_id));
                sinceEl.textContent = `Iscritto dal ${new Date(seller.created_at).toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}`;
                if (badgeEl) badgeEl.innerHTML = getProfileBadges(seller.created_at, sellerCount || 0);
                if (linkEl)  linkEl.href = `/profilo?id=${listing.user_id}`;
                if (card)    card.classList.remove('hidden');
            }
        } catch (_) {}
    }

    // Check proprietario (UI Speciale per il possessore)
    try {
        const contactVersion = _contactVersion;
        const { data: _authData, error: authError } = await _supabase.auth.getUser();
        if (contactVersion !== _contactVersion || authError) return;
        const user = _authData?.user ?? null;
        _setContactUser(user?.id || null);

        if (user) {
            // Fetch tel/email solo per utenti autenticati (mai esposto a utenti anonimi)
            await fetchContactInfo(listing, user.id);
            if (_contactUserId !== user.id) return;
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
                chatBtn.onclick = () => { location.href = `/modifica-annuncio?id=${listing.id}`; };
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
            // Utente non loggato: censura parziale numeri telefono in descrizione
            // (prime cifre visibili, ultime ●●●, link blu → popup registrazione)
            const descrEl = document.getElementById('descrizione');
            if (descrEl) {
                descrEl.innerHTML = censorPhonesHTML(descrEl.textContent);
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
    if (_moderationPreview) ListingModeration.mount(listing);
}

// ── Azioni ──────────────────────────────────────────────

// Annuncio scaduto: blocca tutte le azioni di contatto con un toast esplicito.
// expires_at NULL = legacy/non popolato → consideralo NON scaduto.
function _isListingExpiredLocal(listing) {
    return !!(listing && listing.expires_at && new Date(listing.expires_at) < new Date());
}
function _blockIfExpired(listing) {
    if (!_isListingExpiredLocal(listing)) return false;
    showToast('Questo annuncio è scaduto. Il venditore deve riattivarlo per ricevere contatti.', 'warning');
    return true;
}

async function trackListingContactEvent(listing, eventType) {
    if (!listing || typeof listing.id === 'number') return;
    try {
        const { error } = await _supabase.rpc('track_listing_event', {
            listing_id: listing.id,
            event_type: eventType,
            amount: 1
        });
        if (error) throw error;
    } catch (_) {
        if (eventType === 'call' || eventType === 'whatsapp') {
            try { await _supabase.rpc('increment_tel_clicks', { listing_id: listing.id }); } catch (_) {}
        }
    }
}

function executeCall(listing) {
    if (!listing.telFetched) {
        showToast('Recupero numero in corso, riprova tra un istante…', 'info');
        return;
    }
    let tel = listing.tel;
    if (!tel || String(tel).includes('*')) { showToast('Numero di telefono non disponibile.', 'error'); return; }
    // Usa formato E.164 ("+39XXXXXXXXXX") per il dialer:
    // strip naive di tutto-tranne-cifre dava "393452749815" che il telefono
    // salvava in rubrica così com'era invece di formattare correttamente.
    const link = (typeof phoneToTelLink === 'function') ? phoneToTelLink(tel) : String(tel).replace(/\D/g, '');
    if (!link) { showToast('Nessun numero di telefono valido associato a questo annuncio.', 'error'); return; }
    (async () => { await trackListingContactEvent(listing, 'call'); })();
    window.location.href = `tel:${link}`;
}

function makeCall() {
    _requestPhoneAction(executeCall, 'call_click');
}

function _blockPhoneContact(listing) {
    if (_blockIfExpired(listing)) return true;
    if (_moderationPreview || (listing.status && listing.status !== 'active')) {
        showToast('Contatti non disponibili per questo annuncio.', 'warning');
        return true;
    }
    return false;
}

function _requestPhoneAction(execute, source) {
    const listing = _currentListing;
    if (!listing || _blockPhoneContact(listing)) return;
    const contactVersion = _contactVersion;
    requireAuth(async function (user) {
        if (!user || listing !== _currentListing || _blockPhoneContact(listing)) return;
        if (contactVersion !== _contactVersion && user.id !== _contactUserId) return;
        _setContactUser(user.id);
        // Un solo intento durante il recupero, anche fra Chiama e WhatsApp.
        if (_contactAction) return;
        const action = { version: _contactVersion };
        _contactAction = action;
        try {
            if (await fetchContactInfo(listing, user.id) && _contactAction === action
                && _contactVersion === action.version && !_blockPhoneContact(listing)) execute(listing);
        } finally {
            if (_contactAction === action) _contactAction = null;
        }
    }, source);
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
        if (_blockIfExpired(listing)) return;
        if (listing.user_id === user.id) {
            location.href = '/dashboard';
            return;
        }

        try {
            const { data: existing } = await _supabase
                .from('conversazioni')
                .select('id')
                .eq('annuncio_id', listing.id)
                .eq('acquirente_id', user.id)
                .maybeSingle();

            // Niente creazione: la conv nasce al primo messaggio inviato.
            await trackListingContactEvent(listing, 'chat');
            location.href = existing?.id
                ? `/messaggi?conv=${existing.id}`
                : `/messaggi?annuncio=${listing.id}`;
        } catch (err) {
            console.error(err);
            showToast('Errore nella chat. Riprova.', 'error');
        }
    }, 'chat_click');
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
    (async () => { await trackListingContactEvent(listing, 'whatsapp'); })();
    window.location.href = `https://wa.me/${finalTel}?text=${text}`;
}

function openWhatsApp() {
    _requestPhoneAction(executeWhatsApp, 'whatsapp_click');
}

// Censura parziale numeri di telefono italiani.
// Mostra le prime cifre, sostituisce le ultime con ● e wrappa tutto in un link blu
// che apre il popup di registrazione (incentiva il signup).
// Riconosce mobile (3xx), fisso (0x) e prefissi internazionali (+39, 0039).
// Validazione lunghezza: 9-13 cifre totali → esclude prezzi (50000), anni (2024), mq (30), ecc.
function censorPhonesHTML(text) {
    // Lookbehind/ahead per evitare di matchare in mezzo a un altro numero
    // (es. coordinate 41.9027, codici alfanumerici). Fallback senza lookbehind
    // per browser legacy che non lo supportano (iOS Safari <16.4).
    let re;
    try {
        re = new RegExp(
            "(?<![\\d.,])(?:(?:\\+|00)\\s?39[\\s./\\-]?)?(?:3\\d{2}|0\\d{1,3})[\\s./\\-]?\\d{2,4}[\\s./\\-]?\\d{2,4}(?:[\\s./\\-]?\\d{2,4})?(?!\\d)",
            "g"
        );
    } catch (_) {
        re = /(?:(?:\+|00)\s?39[\s./\-]?)?(?:3\d{2}|0\d{1,3})[\s./\-]?\d{2,4}[\s./\-]?\d{2,4}(?:[\s./\-]?\d{2,4})?/g;
    }
    const escapeMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    const safe = String(text).replace(/[&<>"']/g, c => escapeMap[c]);
    return safe.replace(re, (match) => {
        const digits = match.replace(/\D/g, '');
        if (digits.length < 9 || digits.length > 14) return match;
        // 11 cifre tutte attaccate = probabile P.IVA o IBAN, non telefono
        if (digits.length === 11 && !/[\s./\-]/.test(match)) return match;
        const keep = Math.max(3, Math.min(5, digits.length - 5));
        let seen = 0, out = '';
        for (const ch of match) {
            if (/\d/.test(ch)) {
                out += (seen++ < keep) ? ch : '●';
            } else {
                out += ch;
            }
        }
        return `<a href="#" onclick="event.preventDefault(); if(typeof openAuthModal==='function') openAuthModal('register', undefined, 'tel_reveal');" class="text-blue-600 font-black hover:underline cursor-pointer" title="Registrati per vedere il numero completo">${out}</a>`;
    });
}

// Ripristina pulsanti e descrizione dopo il login
async function restoreContactUI() {
    const contactVersion = _contactVersion;
    let user;
    try {
        const { data, error } = await _supabase.auth.getUser();
        if (error || contactVersion !== _contactVersion || !data?.user) return;
        user = data.user;
    } catch (_) { return; }
    _setContactUser(user.id);
    document.getElementById('loginContactBanner')?.remove();

    const chatBtn = document.getElementById('chatBtn');
    if (chatBtn && _currentListing?.user_id !== user.id) chatBtn.innerHTML = '<i class="fas fa-comment-alt"></i> Invia Messaggio';

    // Ripristina descrizione originale (senza mascheratura)
    const descrEl = document.getElementById('descrizione');
    if (descrEl && _currentListing?.descrizione) {
        descrEl.textContent = _currentListing.descrizione;
    }

    // Fetch tel/email ora che l'utente è autenticato
    if (_currentListing?.id) {
        await fetchContactInfo(_currentListing, user.id);
    }
}

// Inizializza
document.addEventListener('DOMContentLoaded', initPage);

// Quando l'utente effettua il login, aggiorna l'UI senza ricaricare la pagina
try {
    _supabase.auth.onAuthStateChange((event, session) => {
        const userId = event === 'SIGNED_OUT' ? null : session?.user?.id || null;
        const changed = _setContactUser(userId);
        // Neanche getUser/RPC dentro il lock del callback di Supabase Auth.
        if (event === 'SIGNED_IN' && changed) setTimeout(restoreContactUI, 0);
    });
} catch (e) {}

// Export globali per HTML
window.makeCall = makeCall;
window.startChat = startChat;
window.openWhatsApp = openWhatsApp;

// ── Salva preferito (annuncio corrente) ────────────────────
async function _saveCurrentListing() {
    const id = _currentListing?.id || new URLSearchParams(window.location.search).get('id');
    if (!id) return;
    if (typeof window.toggleSaveListing === 'function') {
        await window.toggleSaveListing(id, null);
        _refreshLocalSaveButtons();
    }
}

function _refreshLocalSaveButtons() {
    const id = _currentListing?.id || new URLSearchParams(window.location.search).get('id');
    if (!id) return;
    const state = getSaveListingState(id);
    const saved = state.saved;
    const desktopBtn = document.getElementById('saveBtn');
    const mobileBtn  = document.getElementById('saveBtnMobile');

    if (desktopBtn) {
        const icon = desktopBtn.querySelector('i');
        if (saved) {
            if (icon) icon.className = state.icon + ' text-lg';
            desktopBtn.classList.add('bg-blue-50', 'border-blue-200', 'text-blue-600');
            desktopBtn.classList.remove('border-slate-200', 'text-slate-400');
        } else {
            if (icon) icon.className = state.icon + ' text-lg';
            desktopBtn.classList.remove('bg-blue-50', 'border-blue-200', 'text-blue-600');
            desktopBtn.classList.add('border-slate-200', 'text-slate-400');
        }
    }
    if (mobileBtn) {
        const icon = mobileBtn.querySelector('i');
        if (icon) icon.className = state.icon;
    }
    [desktopBtn, mobileBtn].filter(Boolean).forEach(btn => {
        btn.disabled = state.busy;
        btn.dataset.saved = saved ? '1' : '0';
        btn.title = state.label;
        btn.setAttribute('aria-label', state.label);
        btn.setAttribute('aria-pressed', String(saved));
        btn.setAttribute('aria-busy', String(state.busy));
    });
}

// Sync iniziale del bottone "Salva" quando i preferiti vengono caricati
window.addEventListener('savedListingsChanged', _refreshLocalSaveButtons);
_refreshLocalSaveButtons();

window._saveCurrentListing = _saveCurrentListing;
