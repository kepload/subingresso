// ============================================================
//  Subingresso.it — SSR Pagina Annuncio (Vercel Serverless)
//  Serve ogni annuncio con meta tag, title, canonical e JSON-LD
//  pre-renderizzati server-side per Google. Il JS client-side
//  si occupa dell'interattività dopo l'hydration.
// ============================================================

const SUPABASE_URL      = 'https://mhfbtltgwibwmsudsuvf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';
const SITE              = 'https://subingresso.it';

function esc(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

// Sanitizza JSON da iniettare in <script> inline
function safeJson(obj) {
    return JSON.stringify(obj).replace(/<\//g, '<\\/');
}

function buildTitle(l) {
    const stato = l.stato || 'Annuncio';
    const tipo  = l.tipo   ? ` ${l.tipo}`   : '';
    const merce = (l.settore && l.settore !== l.tipo) ? ` ${l.settore}` : '';
    const dove  = l.comune  ? ` a ${l.comune}` : '';
    const prov  = l.provincia ? ` (${l.provincia})` : (l.regione ? ` (${l.regione})` : '');
    return `${stato} posteggio${tipo}${merce}${dove}${prov} – Subingresso.it`;
}

function buildDesc(l) {
    const isAffitto = l.stato === 'Affitto' || l.stato === 'Affitto mensile';
    const prezzo = l.prezzo
        ? `€${Number(l.prezzo).toLocaleString('it-IT')}${isAffitto ? '/anno' : ''}`
        : 'prezzo da trattare';
    const giorni = l.giorni ? ` Mercato: ${l.giorni}.` : '';
    const sup    = l.superficie ? ` Superficie: ${l.superficie} m².` : '';
    const descr  = (l.descrizione || '').replace(/\s+/g, ' ').trim().substring(0, 110);
    return `${l.stato || 'Vendita'} posteggio mercatale${l.tipo ? ' ' + l.tipo : ''} a ${l.comune || l.regione || 'Italia'} — ${prezzo}.${giorni}${sup}${descr ? ' ' + descr : ''}`;
}

module.exports = async function handler(req, res) {
    const id = (req.query && req.query.id) ? String(req.query.id).trim() : '';

    let listing = null;

    if (id) {
        try {
            const r = await fetch(
                `${SUPABASE_URL}/rest/v1/annunci?id=eq.${encodeURIComponent(id)}&status=neq.deleted&select=id,titolo,descrizione,stato,tipo,settore,regione,provincia,comune,superficie,giorni,prezzo,img_urls,user_id,status,created_at,featured,featured_until`,
                { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
            );
            if (r.ok) {
                const arr = await r.json();
                if (Array.isArray(arr) && arr.length > 0) listing = arr[0];
            }
        } catch (_) {}
    }

    const notFound  = !listing;
    const canonical = id ? `${SITE}/annuncio?id=${encodeURIComponent(id)}` : `${SITE}/annunci`;
    const title     = listing ? buildTitle(listing) : 'Posteggio Mercatale | Subingresso.it';
    const desc      = listing ? buildDesc(listing)  : 'Compra e vendi posteggi mercatali e licenze ambulanti su Subingresso.it. Contatto diretto, nessuna commissione.';
    const img       = (listing && listing.img_urls && listing.img_urls[0]) ? listing.img_urls[0] : '';

    const jsonLd = listing ? {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Product',
                'name': listing.titolo,
                'description': desc,
                'url': canonical,
                ...(img ? { 'image': img } : {}),
                'offers': {
                    '@type': 'Offer',
                    'priceCurrency': 'EUR',
                    'price': listing.prezzo || 0,
                    'availability': listing.status === 'active'
                        ? 'https://schema.org/InStock'
                        : 'https://schema.org/OutOfStock'
                },
                'additionalProperty': [
                    listing.tipo       && { '@type': 'PropertyValue', 'name': 'Tipo',       'value': listing.tipo },
                    listing.comune     && { '@type': 'PropertyValue', 'name': 'Comune',     'value': listing.comune },
                    listing.regione    && { '@type': 'PropertyValue', 'name': 'Regione',    'value': listing.regione },
                    listing.superficie && { '@type': 'PropertyValue', 'name': 'Superficie', 'value': `${listing.superficie} m²` },
                    listing.giorni     && { '@type': 'PropertyValue', 'name': 'Giorni',     'value': listing.giorni },
                ].filter(Boolean)
            },
            {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home',    'item': `${SITE}/` },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Annunci', 'item': `${SITE}/annunci` },
                    { '@type': 'ListItem', 'position': 3, 'name': listing.titolo, 'item': canonical }
                ]
            }
        ]
    } : null;

    // Dati listing passati al client per hydration istantanea (senza secondo fetch Supabase)
    // tel/email NON inclusi per sicurezza — vengono fetchati solo dopo auth
    const ssrListing = listing ? {
        id:           listing.id,
        titolo:       listing.titolo,
        descrizione:  listing.descrizione,
        stato:        listing.stato,
        tipo:         listing.tipo,
        settore:      listing.settore,
        regione:      listing.regione,
        provincia:    listing.provincia,
        comune:       listing.comune,
        superficie:   listing.superficie,
        giorni:       listing.giorni,
        prezzo:       listing.prezzo,
        img_urls:     listing.img_urls,
        user_id:      listing.user_id,
        status:       listing.status,
        created_at:   listing.created_at,
        featured:     listing.featured,
        featured_until: listing.featured_until,
        merce:        listing.settore || 'Altro',
        data:         listing.created_at ? listing.created_at.split('T')[0] : null
    } : null;

    const luogoTxt = listing
        ? [listing.comune, listing.provincia ? `(${listing.provincia})` : '', listing.regione]
              .filter(Boolean).join(', ')
        : '';

    const isAffittoListing = listing && (listing.stato === 'Affitto' || listing.stato === 'Affitto mensile');
    const prezzoStr = listing && listing.prezzo
        ? `€ ${Number(listing.prezzo).toLocaleString('it-IT')}${isAffittoListing ? '<span class="text-xl font-bold text-slate-400 ml-1">/anno</span>' : ''}`
        : 'Trattativa riservata';

    const statoBg = listing && listing.stato === 'Vendita' ? 'bg-emerald-500' : 'bg-blue-600';

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=600');
    res.status(200).send(`<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <title>${esc(title)}</title>
    <meta name="description"        id="metaDesc" content="${esc(desc)}">
    <meta property="og:title"       id="ogTitle"  content="${esc(title)}">
    <meta property="og:description" id="ogDesc"   content="${esc(desc)}">
    <meta property="og:image"       id="ogImage"  content="${esc(img)}">
    <meta property="og:url"         id="ogUrl"    content="${esc(canonical)}">
    <meta property="og:type" content="product">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="canonical" id="_canonical" href="${esc(canonical)}">
    ${jsonLd ? `<script type="application/ld+json" id="_jsonLd">${safeJson(jsonLd)}</script>` : ''}
    ${ssrListing ? `<script>window.__SSR_LISTING__=${safeJson(ssrListing)};</script>` : ''}
    <link rel="stylesheet" href="/css/tailwind.css?v=2">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; overflow-x: hidden; }
        .detail-row { display: flex; gap: .5rem; align-items: flex-start; padding: .75rem 0; border-bottom: 1px solid #f1f5f9; }
        .detail-row:last-child { border-bottom: none; }
        .detail-icon { width: 2rem; color: #94a3b8; font-size: .875rem; flex-shrink: 0; padding-top: 2px; }
        .detail-label { font-size: .7rem; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; }
        .detail-val   { font-weight: 700; font-size: .9rem; color: #0f172a; }
        #mobileCta { display: none; }
        @media (max-width: 1023px) { #mobileCta.visible { display: flex; } }
        #mainContent.has-cta { padding-bottom: 5.5rem; }
    </style>
</head>
<body class="min-h-screen flex flex-col bg-slate-50 text-slate-900">

<header></header>

<main id="mainContent" class="flex-grow max-w-7xl mx-auto px-6 py-10 w-full">

    <nav class="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-8">
        <a href="/" class="hover:text-blue-600 transition">Home</a>
        <i class="fas fa-chevron-right text-[10px]"></i>
        <a href="/annunci" class="hover:text-blue-600 transition">Annunci</a>
        <i class="fas fa-chevron-right text-[10px]"></i>
        <span id="bcRegione" class="text-slate-600">${esc(listing ? listing.regione : '')}</span>
    </nav>

    <div id="notFound" class="${notFound ? '' : 'hidden'} text-center py-24">
        <i class="fas fa-store text-slate-200 text-6xl mb-4"></i>
        <p class="text-slate-400 font-bold text-xl">Annuncio non trovato</p>
        <a href="/annunci" class="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-700 transition">
            Torna agli annunci
        </a>
    </div>

    <div id="detailLayout" class="${notFound ? 'hidden' : 'grid'} grid-cols-1 lg:grid-cols-3 gap-8">

        <div class="lg:col-span-2 space-y-6">

            <div id="coverDiv" class="bg-gradient-to-br from-slate-100 to-blue-50 rounded-3xl h-44 md:h-80 flex items-center justify-center relative overflow-hidden shadow-sm">
                ${img
                    ? `<img src="${esc(img)}" alt="${esc(listing ? listing.titolo : '')}" class="w-full h-full object-cover">`
                    : '<i class="fas fa-store text-blue-200 text-5xl md:text-8xl"></i>'
                }
                <span id="statoBadge" class="absolute top-6 right-6 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg uppercase tracking-widest ${statoBg}">${esc(listing ? listing.stato : '')}</span>
            </div>

            <div class="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <div class="flex flex-wrap gap-2 mb-4">
                    <span id="badgeTipo"  class="bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">${esc(listing ? listing.tipo : '')}</span>
                    <span id="badgeMerce" class="bg-slate-50 text-slate-500 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider border border-slate-100">${esc(listing ? (listing.settore || '') : '')}</span>
                </div>
                <h1 id="titolo" class="text-3xl font-black tracking-tight leading-tight text-slate-900">${esc(listing ? listing.titolo : '')}</h1>
                <p id="prezzoMobile" class="lg:hidden text-3xl font-black text-slate-900 mt-3">${prezzoStr}</p>
                <div class="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-3">
                    <div id="luogo" class="text-slate-500 font-bold text-sm flex items-center gap-2 flex-wrap">
                        <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                            <i class="fas fa-map-marker-alt"></i>
                        </div>
                        <span class="break-words">${esc(luogoTxt)}</span>
                    </div>
                    <div class="flex items-center gap-3 shrink-0 flex-wrap">
                        <span id="viewCount" class="hidden items-center gap-1 text-[10px] text-slate-400 font-bold shrink-0">
                            <i class="fas fa-eye text-[9px]"></i> <span id="viewCountVal">0</span>
                        </span>
                        <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest shrink-0">Pubblicato il <span id="dataPub"></span></p>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <h2 class="font-black text-lg text-slate-900 mb-4 flex items-center gap-2">
                    <i class="fas fa-align-left text-blue-600 text-sm"></i> Descrizione
                </h2>
                <div id="descrizione" class="text-slate-600 font-medium leading-relaxed text-base whitespace-pre-wrap">${esc(listing ? listing.descrizione : '')}</div>
            </div>
        </div>

        <div class="space-y-6">

            <div class="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
                <p id="prezzo" class="text-4xl font-black text-slate-900 mb-4">${listing && listing.prezzo ? `€ ${Number(listing.prezzo).toLocaleString('it-IT')}` : 'Trattativa riservata'}</p>
                <div class="space-y-2">
                    <button onclick="startChat()" id="chatBtn" class="w-full bg-blue-600 text-white py-3 rounded-2xl font-black hover:bg-blue-700 transition active:scale-[.98] flex items-center justify-center gap-3 shadow-lg shadow-blue-100">
                        <i class="fas fa-comment-alt"></i> Invia Messaggio
                    </button>
                    <button onclick="openWhatsApp()" id="whatsappBtn" class="w-full bg-emerald-500 text-white py-3 rounded-2xl font-black hover:bg-emerald-600 transition active:scale-[.98] flex items-center justify-center gap-3 shadow-lg shadow-emerald-100">
                        <i class="fab fa-whatsapp text-xl"></i> WhatsApp
                    </button>
                    <button onclick="makeCall()" id="contactBtn" class="w-full border-2 border-slate-100 text-slate-700 py-3 rounded-2xl font-black hover:bg-slate-50 transition active:scale-[.98] flex items-center justify-center gap-3">
                        <i class="fas fa-phone-alt text-slate-400"></i> Chiama Ora
                    </button>
                </div>
                <div id="contactInfo" class="hidden mt-4 bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                    <div class="flex items-center gap-3 text-sm font-bold">
                        <i class="fas fa-user text-slate-400 w-5"></i>
                        <span id="cNome"></span>
                    </div>
                    <div class="flex items-center gap-3 text-sm font-black text-blue-600">
                        <i class="fas fa-phone text-blue-400 w-5"></i>
                        <span id="cTel"></span>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <div id="detailRows" class="space-y-1"></div>
            </div>

            <div id="sellerCard" class="hidden bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                <p class="text-[10px] font-black uppercase tracking-[.15em] text-slate-400 mb-4">Venditore</p>
                <a id="sellerProfileLink" href="#" class="flex items-center gap-3 mb-4 hover:opacity-75 transition">
                    <div id="sellerAvatar" class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-lg overflow-hidden flex-shrink-0"></div>
                    <div class="min-w-0">
                        <p id="sellerName" class="font-black text-slate-900 truncate"></p>
                        <p id="sellerSince" class="text-xs text-slate-400 font-semibold mt-0.5"></p>
                    </div>
                </a>
                <div id="sellerBadge" class="flex flex-wrap gap-1.5"></div>
            </div>

        </div>
    </div>

    <div id="relatedSection" class="hidden mt-16 pt-16 border-t border-slate-200">
        <div class="flex items-center justify-between mb-10">
            <div>
                <h2 class="text-3xl font-black tracking-tight text-slate-900">Annunci simili</h2>
                <p class="text-slate-500 font-bold mt-1 text-sm uppercase tracking-wider">Nella stessa regione</p>
            </div>
            <a href="/annunci" class="text-blue-600 font-black text-sm hover:underline flex items-center gap-2">
                Vedi tutti <i class="fas fa-arrow-right text-xs"></i>
            </a>
        </div>
        <div id="relatedGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"></div>
    </div>
</main>

<div id="mobileCta" class="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-100 px-4 gap-3" style="padding-top:.75rem;padding-bottom:calc(.75rem + env(safe-area-inset-bottom))">
    <button onclick="startChat()" class="flex-1 bg-blue-600 text-white py-3 rounded-2xl font-black text-sm hover:bg-blue-700 transition active:scale-[.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-100">
        <i class="fas fa-comment-alt"></i> Invia Messaggio
    </button>
    <button onclick="openWhatsApp()" class="flex-1 bg-emerald-500 text-white py-3 rounded-2xl font-black text-sm hover:bg-emerald-600 transition active:scale-[.98] flex items-center justify-center gap-2 shadow-lg shadow-emerald-100">
        <i class="fab fa-whatsapp text-lg"></i> WhatsApp
    </button>
</div>

<footer></footer>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/js/supabase-config.js?v=3"></script>
<script src="/js/data.js?v=9"></script>
<script src="/js/ui-components.js?v=10"></script>
<script src="/js/auth.js?v=11"></script>
<script src="/js/pages/annuncio-detail.js?v=11"></script>
</body>
</html>`);
};
