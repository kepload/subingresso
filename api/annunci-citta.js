// ============================================================
//  Subingresso.it — SSR Pagina Annunci per Città (Vercel Serverless)
//  Es.: /annunci/milano → listing attivi a Milano con meta tag ottimizzati
//  Le città capoluogo (lista in _capoluoghi.js) rispondono SEMPRE 200
//  con placeholder utile anche se non hanno annunci attivi.
// ============================================================

const SUPABASE_URL      = 'https://mhfbtltgwibwmsudsuvf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';
const SITE              = 'https://subingresso.it';

const { CAPOLUOGHI_BY_SLUG } = require('./_capoluoghi.js');

// Dataset 7904 comuni ISTAT — usato solo per riconoscere slug validi.
// Slug nel dataset (ma non capoluogo, senza annunci) → redirect alla
// pagina /annunci?q=<nome> (UX coerente con il resto del sito), invece di 404.
const COMUNI_ALL = require('../data/comuni.json');
const COMUNI_BY_SLUG_ALL = Object.create(null);
const COMUNI_BY_NAME_ALL = Object.create(null);
function _normName(s) {
    if (!s) return '';
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}
for (const c of COMUNI_ALL) {
    COMUNI_BY_SLUG_ALL[c.slug] = c;
    const k = _normName(c.nome);
    if (k && !COMUNI_BY_NAME_ALL[k]) COMUNI_BY_NAME_ALL[k] = c;
}

function haversineKm(lat1, lng1, lat2, lng2) {
    if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return Infinity;
    const R = 6371;
    const toRad = d => d * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat/2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const MESI_IT = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

function esc(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function safeJson(obj) {
    return JSON.stringify(obj).replace(/<\//g, '<\\/');
}

function slugToCity(slug) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function cityToSlug(city) {
    return city.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[àá]/g, 'a')
        .replace(/[èéê]/g, 'e')
        .replace(/[ìí]/g, 'i')
        .replace(/[òó]/g, 'o')
        .replace(/[ùú]/g, 'u')
        .replace(/[^a-z0-9-]/g, '');
}

function formatPrezzo(l) {
    if (!l.prezzo) return 'Prezzo trattabile';
    const n = Number(l.prezzo).toLocaleString('it-IT');
    return (l.stato === 'Affitto' || l.stato === 'Affitto mensile') ? `€${n}/anno` : `€${n}`;
}

function formatPrezzoCompact(n) {
    if (!n || isNaN(n)) return '';
    const num = Number(n);
    if (num >= 1000) return '€' + (num / 1000).toFixed(num >= 10000 ? 0 : 1).replace('.', ',') + 'k';
    return '€' + num.toLocaleString('it-IT');
}

function relativeTime(iso) {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    if (isNaN(then)) return '';
    const diffMs = Date.now() - then;
    const minutes = Math.floor(diffMs / 60000);
    const hours   = Math.floor(diffMs / 3600000);
    const days    = Math.floor(diffMs / 86400000);
    if (minutes < 60)  return minutes <= 1 ? 'pochi minuti fa' : minutes + ' minuti fa';
    if (hours   < 24)  return hours === 1   ? '1 ora fa'        : hours + ' ore fa';
    if (days    < 7)   return days === 1    ? '1 giorno fa'     : days  + ' giorni fa';
    if (days    < 30)  return Math.floor(days / 7) + ' settimane fa';
    return new Date(iso).toLocaleDateString('it-IT');
}

function buildCard(l) {
    const img   = l.img_urls && l.img_urls.length > 0 ? l.img_urls[0] : null;
    const expired = !!(l.expires_at && new Date(l.expires_at) < new Date());
    const badge = expired
        ? '<span style="background:#334155;color:#fff;font-size:11px;font-weight:800;padding:2px 10px;border-radius:20px;letter-spacing:.03em;">Scaduto</span>'
        : (l.stato === 'Vendita'
            ? '<span style="background:#10b981;color:#fff;font-size:11px;font-weight:800;padding:2px 10px;border-radius:20px;letter-spacing:.03em;">Vendita</span>'
            : '<span style="background:#2563eb;color:#fff;font-size:11px;font-weight:800;padding:2px 10px;border-radius:20px;letter-spacing:.03em;">Affitto</span>');
    const desc  = (l.descrizione || '').replace(/\s+/g, ' ').trim().substring(0, 110);
    const tipo  = [l.tipo, l.settore].filter(Boolean).join(' · ');
    const cardOpacity = expired ? 'opacity:.7;' : '';
    // Location hint: comune + (provincia / km dalla città target).
    let locHint = '';
    if (l._scope === 'provincia' && l.comune) {
        locHint = `<i class="fas fa-map-marker-alt" style="color:#94a3b8;margin-right:4px;"></i>${esc(l.comune)}`;
    } else if (l._scope === 'radius' && l.comune) {
        const km = (typeof l._distance === 'number' && isFinite(l._distance)) ? Math.round(l._distance) : null;
        locHint = `<i class="fas fa-map-marker-alt" style="color:#94a3b8;margin-right:4px;"></i>${esc(l.comune)}${km != null ? ` · ${km} km` : ''}`;
    } else if (l.comune) {
        locHint = `<i class="fas fa-map-marker-alt" style="color:#94a3b8;margin-right:4px;"></i>${esc(l.comune)}`;
    }

    return `
  <a href="/annuncio?id=${esc(l.id)}" style="display:block;background:#fff;border:1px solid #f1f5f9;border-radius:16px;overflow:hidden;text-decoration:none;box-shadow:0 1px 4px rgba(15,23,42,.06);transition:box-shadow .2s;${cardOpacity}">
    ${img
        ? `<img src="${esc(img)}" alt="${esc(l.titolo)}" style="width:100%;height:160px;object-fit:cover;" loading="lazy">`
        : `<div style="width:100%;height:160px;background:#f8fafc;display:flex;align-items:center;justify-content:center;"><i class="fas fa-store" style="color:#cbd5e1;font-size:2rem;"></i></div>`
    }
    <div style="padding:16px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
        ${badge}
        ${tipo ? `<span style="font-size:11px;color:#94a3b8;font-weight:700;">${esc(tipo)}</span>` : ''}
      </div>
      <h2 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#0f172a;line-height:1.3;">${esc(l.titolo)}</h2>
      ${locHint ? `<p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">${locHint}</p>` : ''}
      ${desc ? `<p style="margin:0 0 10px;font-size:13px;color:#64748b;line-height:1.5;">${esc(desc)}${l.descrizione && l.descrizione.length > 110 ? '…' : ''}</p>` : ''}
      <p style="margin:0;font-size:18px;font-weight:900;color:#2563eb;">${esc(formatPrezzo(l))}</p>
    </div>
  </a>`;
}

// ============================================================
//  Pagina placeholder per città capoluogo senza annunci.
//  200 OK + indicizzabile + contenuto onesto + CTA + FAQ schema.
// ============================================================
function renderEmptyCityPage(cityName, citySlug, regione, canonicalUrl) {
    const today    = new Date();
    const monthYr  = `${MESI_IT[today.getMonth()]} ${today.getFullYear()}`;
    const todayIso = today.toISOString().split('T')[0];

    const title       = `Posteggi Mercatali ${cityName} ${monthYr} · Subingresso.it`;
    const description = `Cerchi un posteggio mercatale a ${cityName}? Subingresso.it è il marketplace italiano per concessioni e licenze ambulanti. Pubblica gratis il tuo annuncio o ricevi un avviso sui nuovi posteggi a ${cityName}.`;

    const faq = [
        {
            q: `Come funziona il commercio ambulante a ${cityName}?`,
            a: `A ${cityName} i mercati settimanali e i posteggi sono gestiti dal Comune. Per esercitare serve una concessione di posteggio (tipo A) o un'autorizzazione itinerante (tipo B), insieme alla partita IVA con codice ATECO commercio ambulante e all'iscrizione INPS commercianti.`
        },
        {
            q: `Quando si liberano i posteggi al mercato di ${cityName}?`,
            a: `I posteggi si liberano per cessione (subingresso), decadenza o nuovi bandi pubblici. Il Comune di ${cityName} pubblica sull'Albo Pretorio gli avvisi per l'assegnazione dei posteggi liberi, di solito tra marzo-aprile e settembre-ottobre.`
        },
        {
            q: `Come fare il subingresso di un posteggio a ${cityName}?`,
            a: `Il subingresso richiede un atto notarile di cessione d'azienda tra venditore e acquirente, seguito da una SCIA al SUAP del Comune di ${cityName} entro 30 giorni. La pratica completa richiede 3-6 settimane e costa 800-2.500 euro di notarile.`
        },
        {
            q: `Quanto costa un posteggio mercatale a ${cityName}?`,
            a: `Il prezzo di un posteggio mercatale a ${cityName} varia in base a zona, settore merceologico, dimensioni del banco, giorni di mercato e anni di concessione residui. Su Subingresso.it pubblichiamo gli annunci attivi con prezzi reali appena diventano disponibili.`
        },
        {
            q: `Come pubblicare un annuncio per vendere un posteggio a ${cityName}?`,
            a: `La pubblicazione su Subingresso.it è gratuita. Vai sulla pagina "Vendi", crea un account e inserisci i dati del tuo posteggio: foto del banco, fatturato medio, posizione nel mercato, prezzo richiesto. L'annuncio è online subito dopo la moderazione.`
        }
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home',    'item': `${SITE}/` },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Annunci', 'item': `${SITE}/annunci` },
                    { '@type': 'ListItem', 'position': 3, 'name': cityName,  'item': canonicalUrl }
                ]
            },
            {
                '@type': 'FAQPage',
                'mainEntity': faq.map(f => ({
                    '@type': 'Question',
                    'name':  f.q,
                    'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
                }))
            }
        ]
    };

    const faqHtml = faq.map(f => `
      <details style="background:#fff;border:1px solid #f1f5f9;border-radius:14px;padding:16px 20px;margin-bottom:10px;">
        <summary style="font-size:15px;font-weight:800;color:#0f172a;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;">
          ${esc(f.q)}
          <i class="fas fa-chevron-down" style="color:#94a3b8;font-size:12px;"></i>
        </summary>
        <p style="margin:12px 0 0;font-size:14px;color:#64748b;line-height:1.7;">${esc(f.a)}</p>
      </details>`).join('');

    return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:title"       content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type"        content="website">
  <meta property="og:url"         content="${esc(canonicalUrl)}">
  <meta property="og:updated_time" content="${esc(todayIso)}">
  <meta name="twitter:card"       content="summary_large_image">
  <link rel="canonical" href="${esc(canonicalUrl)}">
  <link rel="stylesheet" href="/css/tailwind.css?v=2">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <script type="application/ld+json">${safeJson(jsonLd)}</script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; margin: 0; }
    details[open] summary i.fa-chevron-down { transform: rotate(180deg); }
    details summary i.fa-chevron-down { transition: transform .2s; }
  </style>
</head>
<body>

  <div id="nav-placeholder"></div>

  <main style="max-width:880px;margin:0 auto;padding:32px 16px 64px;">

    <!-- Breadcrumb -->
    <nav style="font-size:13px;color:#94a3b8;margin-bottom:24px;">
      <a href="/" style="color:#64748b;text-decoration:none;font-weight:600;">Home</a>
      <span style="margin:0 6px;">›</span>
      <a href="/annunci" style="color:#64748b;text-decoration:none;font-weight:600;">Annunci</a>
      <span style="margin:0 6px;">›</span>
      <span style="color:#0f172a;font-weight:700;">${esc(cityName)}</span>
    </nav>

    <!-- Hero -->
    <div style="margin-bottom:32px;">
      <h1 style="margin:0 0 12px;font-size:clamp(28px,5vw,40px);font-weight:900;color:#0f172a;line-height:1.1;letter-spacing:-.02em;">
        Posteggi Mercatali a <span style="color:#2563eb;">${esc(cityName)}</span>
      </h1>
      <p style="margin:0;font-size:17px;color:#64748b;font-weight:500;line-height:1.55;">
        Cerchi un posteggio in vendita o vuoi vendere il tuo? ${esc(cityName)} è una piazza che seguiamo da vicino${regione ? ` in ${esc(regione)}` : ''}.
      </p>
    </div>

    <!-- Status box: onesto, nessun annuncio finto -->
    <div style="background:#fff;border:1px solid #f1f5f9;border-radius:20px;padding:28px;margin-bottom:32px;text-align:center;">
      <div style="display:inline-flex;align-items:center;gap:10px;background:#fef3c7;border:1px solid #fde68a;color:#92400e;font-size:13px;font-weight:800;padding:8px 16px;border-radius:999px;margin-bottom:20px;">
        <i class="fas fa-clock" style="font-size:11px;"></i>
        0 annunci attivi a ${esc(cityName)} in questo momento
      </div>
      <h2 style="margin:0 0 12px;font-size:22px;font-weight:900;color:#0f172a;">Sii il primo a pubblicare</h2>
      <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;max-width:560px;margin-left:auto;margin-right:auto;">
        Quando arriverà il primo annuncio a ${esc(cityName)} comparirà automaticamente in questa pagina.
        Puoi pubblicare gratis il tuo posteggio in vendita o affitto, oppure cercare in altre zone d'Italia.
      </p>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;">
        <a href="/vendi" style="background:#10b981;color:#fff;padding:14px 24px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none;box-shadow:0 8px 16px -4px rgba(16,185,129,.3);">
          <i class="fas fa-plus" style="margin-right:6px;"></i> Pubblica annuncio gratis
        </a>
        <a href="/annunci" style="background:#fff;color:#2563eb;border:1px solid #bfdbfe;padding:14px 24px;border-radius:12px;font-weight:800;font-size:14px;text-decoration:none;">
          <i class="fas fa-search" style="margin-right:6px;"></i> Cerca in tutta Italia
        </a>
      </div>
    </div>

    <!-- Testo SEO -->
    <section style="background:#fff;border:1px solid #f1f5f9;border-radius:20px;padding:32px;margin-bottom:32px;">
      <h2 style="margin:0 0 14px;font-size:20px;font-weight:900;color:#0f172a;">
        Il commercio ambulante a ${esc(cityName)}
      </h2>
      <p style="margin:0 0 12px;font-size:14px;color:#64748b;line-height:1.75;">
        Il mercato dei posteggi a ${esc(cityName)}${regione ? `, in ${esc(regione)}` : ''}, è regolato dal Comune attraverso concessioni di durata di norma <strong>dodici anni</strong>. Per ottenere un posteggio si può partecipare a un <strong>bando pubblico</strong> oppure rilevare un'attività esistente tramite <strong>subingresso</strong>: un atto notarile di cessione d'azienda fra venditore e acquirente.
      </p>
      <p style="margin:0 0 12px;font-size:14px;color:#64748b;line-height:1.75;">
        Su Subingresso.it segniamo solo gli annunci reali, pubblicati dai titolari delle concessioni o dagli eredi. Niente intermediazioni, niente commissioni: il contatto è sempre diretto. Quando arriva il primo annuncio per ${esc(cityName)}, lo trovi qui aggiornato in tempo reale.
      </p>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.75;">
        Se hai un posteggio a ${esc(cityName)} e vuoi capire quanto vale prima di metterlo in vendita, parti dal <a href="/valutatore" style="color:#2563eb;font-weight:700;">valutatore gratuito</a>. Se cerchi posteggi simili in altre città italiane, puoi <a href="/annunci" style="color:#2563eb;font-weight:700;">sfogliare gli annunci attivi</a> filtrando per zona, settore e tipologia.
      </p>
    </section>

    <!-- FAQ -->
    <section style="margin-top:32px;">
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#0f172a;">
        Domande frequenti — Posteggi a ${esc(cityName)}
      </h2>
      ${faqHtml}
    </section>

  </main>

  <div id="footer-placeholder"></div>

  <script src="/js/ui-components.js?v=11"></script>

</body>
</html>`;
}

module.exports = async function handler(req, res) {
    const citySlug = (req.query && req.query.citta) ? String(req.query.citta).trim().toLowerCase() : '';

    if (!citySlug || !/^[a-z0-9-]+$/.test(citySlug)) {
        res.status(302).setHeader('Location', '/annunci').end();
        return;
    }

    // Lookup capoluogo: se lo slug è in lista usiamo il nome leggibile della costante
    // (gestisce correttamente "L'Aquila", "Cortina d'Ampezzo", "Forlì" ecc.).
    const capInfo     = CAPOLUOGHI_BY_SLUG[citySlug];
    const istatComune = COMUNI_BY_SLUG_ALL[citySlug];
    const cityName    = capInfo ? capInfo.name : (istatComune ? istatComune.nome : slugToCity(citySlug));
    const regione     = capInfo ? capInfo.regione : (istatComune ? istatComune.regione : '');
    const canonicalUrl = `${SITE}/annunci/${citySlug}`;

    // Coordinate centrali per fallback radius. Preferiamo il record ISTAT (lat/lng affidabili).
    const targetLat = istatComune ? istatComune.lat : null;
    const targetLng = istatComune ? istatComune.lng : null;

    // Provincia di riferimento. Per i capoluoghi prendiamo la provincia ISTAT del comune.
    // Per le 5 città turistiche (Sirmione/Capri/...) la provincia è una grande città
    // diversa: NON espandiamo a provincia (sarebbe fuori scope), solo radius.
    const provinciaRaw   = istatComune ? istatComune.provincia : null;
    const provinciaNorm  = _normName(provinciaRaw);
    const cityNameNorm   = _normName(cityName);
    // Heuristica: città capoluogo della propria provincia se il nome provincia
    // inizia con il nome città (Brescia→"Brescia", Forlì→"Forlì-Cesena").
    const cityIsCapoluogoDiProvincia = !!(capInfo && provinciaNorm && provinciaNorm.startsWith(cityNameNorm));

    // ─── Fetch tutti gli annunci attivi ─────────────────────────
    // Volumi attuali bassi (<50). Cache 1h già attiva. Più flessibile della
    // query con filtro server-side perché ci serve anche il match per provincia
    // (l'annuncio ha solo `comune`, non `provincia` → join lato JS via comuni.json).
    let allActive = [];
    try {
        const r = await fetch(
            `${SUPABASE_URL}/rest/v1/annunci?status=eq.active&select=id,titolo,descrizione,stato,tipo,settore,comune,provincia,prezzo,img_urls,created_at,featured,expires_at&order=featured.desc,created_at.desc&limit=500`,
            {
                headers: {
                    'apikey':        SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                }
            }
        );
        if (r.ok) allActive = await r.json();
    } catch (_) {}

    // Annota ogni annuncio con il record comune (provincia/lat/lng) e la distanza.
    const annotated = allActive.map(l => {
        const ci = l.comune ? COMUNI_BY_NAME_ALL[_normName(l.comune)] : null;
        const distance = (ci && targetLat != null && targetLng != null)
            ? haversineKm(targetLat, targetLng, ci.lat, ci.lng)
            : Infinity;
        return Object.assign({}, l, { _ci: ci, _distance: distance });
    });

    // Tier 1: comune esatto (es. comune = "Brescia").
    const tier1 = annotated.filter(l => _normName(l.comune) === cityNameNorm);
    const tier1Ids = new Set(tier1.map(l => l.id));

    // Espansione (provincia + radius) SOLO per i 137 capoluoghi indicizzati.
    // Per slug ISTAT non-capoluogo manteniamo il comportamento conservativo
    // (solo match esatto, altrimenti redirect): evita di creare 7904 pagine
    // SEO ricche di contenuto non locale.
    const allowExpansion = !!capInfo;
    const RADIUS_KM = 200;

    // Tier 2: stessa provincia (solo se la città è capoluogo di provincia).
    const tier2 = (allowExpansion && cityIsCapoluogoDiProvincia)
        ? annotated.filter(l =>
            !tier1Ids.has(l.id) &&
            l._ci && _normName(l._ci.provincia) === provinciaNorm
        )
        : [];
    const tier2Ids = new Set(tier2.map(l => l.id));

    // Tier 3: entro 200 km dalla città (fallback se i primi due tier sono scarni).
    const tier3 = allowExpansion
        ? annotated
            .filter(l =>
                !tier1Ids.has(l.id) && !tier2Ids.has(l.id) &&
                isFinite(l._distance) && l._distance <= RADIUS_KM
            )
            .sort((a, b) => a._distance - b._distance)
        : [];

    // Marca lo scope su ogni annuncio (per la card, mostra "comune" o "X km").
    const tagScope = (arr, scope) => arr.map(l => Object.assign({}, l, { _scope: scope }));

    // Strategia: tier1 + tier2 sempre. Aggiungiamo tier3 se i primi due
    // sotto soglia (vogliamo una pagina ricca, non 1 sola card).
    const MIN_DESIRED = 6;
    const HARD_CAP    = 50;
    const primaryList = [...tagScope(tier1, 'comune'), ...tagScope(tier2, 'provincia')];
    let listings;
    let scope; // 'comune' | 'provincia' | 'mixed' | 'radius' | 'empty'

    if (primaryList.length >= MIN_DESIRED) {
        listings = primaryList.slice(0, HARD_CAP);
        scope = tier2.length > 0 ? 'provincia' : 'comune';
    } else if (primaryList.length > 0) {
        const padding = HARD_CAP - primaryList.length;
        listings = [...primaryList, ...tagScope(tier3.slice(0, padding), 'radius')];
        scope = 'mixed';
    } else if (tier3.length > 0) {
        listings = tagScope(tier3.slice(0, HARD_CAP), 'radius');
        scope = 'radius';
    } else {
        listings = [];
        scope = 'empty';
    }

    const totalCount = listings.length;

    // ─── Branch zero risultati ───────────────────────────────────
    // Capoluogo senza nulla nemmeno entro 200km → placeholder indicizzabile.
    // Comune ISTAT non capoluogo senza nulla → redirect a /annunci?q=
    // Slug ignoto → 404 noindex.
    if (listings.length === 0) {
        if (capInfo) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
            res.status(200).send(renderEmptyCityPage(cityName, citySlug, regione, canonicalUrl));
            return;
        }
        if (istatComune) {
            res.status(302)
               .setHeader('Location', `/annunci?q=${encodeURIComponent(istatComune.nome)}`)
               .end();
            return;
        }
        res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8').send(`<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8"><title>Nessun annuncio a ${esc(cityName)} — Subingresso.it</title>
<meta name="robots" content="noindex"><link rel="canonical" href="${SITE}/annunci">
</head><body><h1>Nessun annuncio disponibile a ${esc(cityName)}</h1>
<p><a href="/annunci">Cerca in tutta Italia →</a></p></body></html>`);
        return;
    }

    // Etichette dello scope per H1, title, copy.
    const scopeLabel = (() => {
        switch (scope) {
            case 'comune':    return `a ${cityName}`;
            case 'provincia': return `a ${cityName} e provincia`;
            case 'mixed':     return cityIsCapoluogoDiProvincia ? `a ${cityName}, provincia e dintorni` : `a ${cityName} e dintorni`;
            case 'radius':    return `nei dintorni di ${cityName}`;
            default:          return `a ${cityName}`;
        }
    })();
    const scopeLabelShort = (() => {
        switch (scope) {
            case 'comune':    return cityName;
            case 'provincia': return `${cityName} e provincia`;
            case 'mixed':     return `${cityName} e zona`;
            case 'radius':    return `Vicino a ${cityName}`;
            default:          return cityName;
        }
    })();

    // ─── Stats per freshness + price range (Mossa 5 + 6) ───────
    const prezzi = listings.map(l => Number(l.prezzo)).filter(p => p > 0);
    const minPrice = prezzi.length ? Math.min(...prezzi) : 0;
    const maxPrice = prezzi.length ? Math.max(...prezzi) : 0;
    const lastListingIso = listings.reduce((acc, l) => {
        if (!l.created_at) return acc;
        if (!acc || l.created_at > acc) return l.created_at;
        return acc;
    }, null);
    const lastListingRel = lastListingIso ? relativeTime(lastListingIso) : '';
    const today    = new Date();
    const monthYr  = `${MESI_IT[today.getMonth()]} ${today.getFullYear()}`;
    const todayIso = today.toISOString().split('T')[0];

    // Conteggi per stato
    const cntVendita = listings.filter(l => l.stato === 'Vendita').length;
    const cntAffitto = listings.filter(l => l.stato && l.stato.indexOf('Affitto') === 0).length;

    // ─── Title + meta ottimizzati CTR (Mossa 6) ────────────────
    // Manteniamo il nome città front-loaded (è la query SEO), poi aggiungiamo
    // l'estensione di scope solo se è davvero più larga del comune singolo.
    const priceFromTxt = minPrice > 0 ? ` da ${formatPrezzoCompact(minPrice)}` : '';
    const titleSubject = (() => {
        switch (scope) {
            case 'provincia': return `${cityName} e Provincia`;
            case 'mixed':     return cityIsCapoluogoDiProvincia ? `${cityName} e Provincia` : `${cityName} e Zona`;
            case 'radius':    return `Vicino a ${cityName}`;
            default:          return cityName;
        }
    })();
    const title       = `Posteggi Mercatali ${titleSubject} ${monthYr} | ${totalCount} Annunci${priceFromTxt} · Subingresso.it`;
    const description = prezzi.length > 1 && minPrice !== maxPrice
        ? `${totalCount} posteggi mercatali in vendita e affitto ${scopeLabel}. Prezzi reali da ${formatPrezzoCompact(minPrice)} a ${formatPrezzoCompact(maxPrice)}. Contatto diretto venditore, zero commissioni. Aggiornato ${lastListingRel || 'oggi'}.`
        : `${totalCount} posteggi mercatali ${scopeLabel}: licenze ambulanti, banchi e concessioni. Contatto diretto venditore, zero commissioni. Aggiornato ${lastListingRel || 'oggi'}.`;

    // ─── Schema markup (Mossa 4) ───────────────────────────────
    const graph = [
        {
            '@type': 'ItemList',
            'name':  title,
            'description': description,
            'url':   canonicalUrl,
            'numberOfItems': totalCount,
            'itemListElement': listings.slice(0, 10).map((l, i) => ({
                '@type':    'ListItem',
                'position': i + 1,
                'url':      `${SITE}/annuncio?id=${l.id}`,
                'name':     l.titolo,
            }))
        },
        {
            '@type': 'BreadcrumbList',
            'itemListElement': [
                { '@type': 'ListItem', 'position': 1, 'name': 'Home',    'item': `${SITE}/` },
                { '@type': 'ListItem', 'position': 2, 'name': 'Annunci', 'item': `${SITE}/annunci` },
                { '@type': 'ListItem', 'position': 3, 'name': cityName,  'item': canonicalUrl }
            ]
        }
    ];

    if (prezzi.length > 0) {
        graph.push({
            '@type': 'AggregateOffer',
            'name':  `Posteggi mercatali e licenze ambulanti a ${cityName}`,
            'url':   canonicalUrl,
            'offerCount':   totalCount,
            'lowPrice':     minPrice,
            'highPrice':    maxPrice,
            'priceCurrency':'EUR',
            'availability': 'https://schema.org/InStock'
        });
    }

    // FAQPage con dati reali (no claim falsi)
    // La risposta sul conteggio rispetta lo scope mostrato (comune/provincia/dintorni)
    // per non fingere annunci nel comune singolo se in realtà espandiamo.
    const faq = [
        {
            q: `Quanti posteggi mercatali sono in vendita a ${cityName}?`,
            a: `Su Subingresso.it sono attivi ${totalCount} annunci di posteggi mercatali e licenze ambulanti ${scopeLabel}${cntVendita > 0 ? `, di cui ${cntVendita} in vendita` : ''}${cntAffitto > 0 ? ` e ${cntAffitto} in affitto` : ''}. Gli annunci sono pubblicati direttamente dai titolari delle concessioni.`
        },
        {
            q: `Quanto costa un posteggio mercatale a ${cityName}?`,
            a: prezzi.length > 1 && minPrice !== maxPrice
                ? `I prezzi attuali per i posteggi mercatali a ${cityName} su Subingresso.it vanno da ${formatPrezzoCompact(minPrice)} a ${formatPrezzoCompact(maxPrice)}. Il prezzo dipende da zona, settore merceologico, dimensioni del banco e giorni di mercato.`
                : `Il prezzo di un posteggio mercatale a ${cityName} dipende da zona, settore merceologico, dimensioni del banco e giorni di mercato. Su Subingresso.it puoi consultare gli annunci attivi per avere riferimenti reali di mercato.`
        },
        {
            q: `Come funziona il subingresso di un posteggio a ${cityName}?`,
            a: `Il subingresso di una concessione di posteggio mercatale a ${cityName} richiede un atto notarile (cessione d'azienda o ramo d'azienda) e la successiva comunicazione al SUAP del Comune. La pratica si conclude generalmente in 30-60 giorni dalla firma.`
        },
        {
            q: `Posso comprare solo la licenza ambulante senza il posteggio?`,
            a: `Sì, è possibile acquistare una licenza ambulante itinerante (tipo B) senza posteggio fisso. Su Subingresso.it trovi sia concessioni di posteggio (tipo A) sia autorizzazioni itineranti, filtrabili per tipologia.`
        },
        {
            q: `Subingresso.it applica commissioni sulla compravendita?`,
            a: `No. Subingresso.it è un marketplace di annunci: il contatto tra venditore e acquirente è diretto, senza commissioni di intermediazione. La pubblicazione dell'annuncio è gratuita.`
        }
    ];
    graph.push({
        '@type': 'FAQPage',
        'mainEntity': faq.map(f => ({
            '@type': 'Question',
            'name':  f.q,
            'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
        }))
    });

    const jsonLd = { '@context': 'https://schema.org', '@graph': graph };

    const cardsHtml = listings.map(buildCard).join('\n');

    const faqHtml = faq.map(f => `
      <details style="background:#fff;border:1px solid #f1f5f9;border-radius:14px;padding:16px 20px;margin-bottom:10px;">
        <summary style="font-size:15px;font-weight:800;color:#0f172a;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;">
          ${esc(f.q)}
          <i class="fas fa-chevron-down" style="color:#94a3b8;font-size:12px;"></i>
        </summary>
        <p style="margin:12px 0 0;font-size:14px;color:#64748b;line-height:1.7;">${esc(f.a)}</p>
      </details>`).join('');

    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:title"       content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type"        content="website">
  <meta property="og:url"         content="${esc(canonicalUrl)}">
  <meta property="og:updated_time" content="${esc(todayIso)}">
  <meta property="article:modified_time" content="${esc(todayIso)}">
  <meta name="twitter:card"       content="summary_large_image">
  <link rel="canonical" href="${esc(canonicalUrl)}">
  <link rel="stylesheet" href="/css/tailwind.css?v=2">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <script type="application/ld+json">${safeJson(jsonLd)}</script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; margin: 0; }
    .card-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    @media (min-width: 640px)  { .card-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .card-grid { grid-template-columns: repeat(3, 1fr); } }
    details[open] summary i.fa-chevron-down { transform: rotate(180deg); }
    details summary i.fa-chevron-down { transition: transform .2s; }
    .pulse-dot { animation: pulseDot 1.6s ease-in-out infinite; }
    @keyframes pulseDot { 0%,100% { opacity: 1; } 50% { opacity: .35; } }
  </style>
</head>
<body>

  <div id="nav-placeholder"></div>

  <main style="max-width:1152px;margin:0 auto;padding:32px 16px 64px;">

    <!-- Breadcrumb -->
    <nav style="font-size:13px;color:#94a3b8;margin-bottom:24px;">
      <a href="/" style="color:#64748b;text-decoration:none;font-weight:600;">Home</a>
      <span style="margin:0 6px;">›</span>
      <a href="/annunci" style="color:#64748b;text-decoration:none;font-weight:600;">Annunci</a>
      <span style="margin:0 6px;">›</span>
      <span style="color:#0f172a;font-weight:700;">${esc(cityName)}</span>
    </nav>

    <!-- Hero -->
    <div style="margin-bottom:16px;">
      <h1 style="margin:0 0 8px;font-size:clamp(24px,4vw,36px);font-weight:900;color:#0f172a;line-height:1.15;">
        ${scope === 'radius'
            ? `Posteggi Mercatali <span style="color:#2563eb;">vicino a ${esc(cityName)}</span>`
            : (scope === 'provincia' || (scope === 'mixed' && cityIsCapoluogoDiProvincia))
                ? `Posteggi Mercatali a <span style="color:#2563eb;">${esc(cityName)} e provincia</span>`
                : scope === 'mixed'
                    ? `Posteggi Mercatali a <span style="color:#2563eb;">${esc(cityName)}</span> e dintorni`
                    : `Posteggi Mercatali a <span style="color:#2563eb;">${esc(cityName)}</span>`}
      </h1>
      <p style="margin:0;font-size:16px;color:#64748b;font-weight:500;">
        ${totalCount} ${totalCount === 1 ? 'annuncio disponibile' : 'annunci disponibili'}${scope === 'radius' ? ` entro ${RADIUS_KM} km` : (scope === 'mixed' ? ` (provincia e dintorni)` : '')} · banchi mercato, licenze ambulanti, concessioni
      </p>
    </div>

    <!-- Freshness banner (Mossa 5) -->
    <div style="display:flex;flex-wrap:wrap;align-items:center;gap:14px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:12px;padding:10px 16px;margin-bottom:32px;font-size:13px;font-weight:700;color:#065f46;">
      <span style="display:inline-flex;align-items:center;gap:8px;">
        <span class="pulse-dot" style="display:inline-block;width:8px;height:8px;background:#10b981;border-radius:50%;"></span>
        Aggiornato oggi · ${esc(monthYr)}
      </span>
      ${lastListingRel ? `<span style="color:#047857;">Ultimo annuncio pubblicato ${esc(lastListingRel)}</span>` : ''}
      ${prezzi.length > 1 && minPrice !== maxPrice ? `<span style="color:#047857;margin-left:auto;">Prezzi da ${esc(formatPrezzoCompact(minPrice))} a ${esc(formatPrezzoCompact(maxPrice))}</span>` : ''}
    </div>

    <!-- Filtri rapidi -->
    <div style="background:#fff;border:1px solid #f1f5f9;border-radius:16px;padding:16px 20px;margin-bottom:32px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;">
      <span style="font-size:13px;font-weight:700;color:#64748b;">Filtra:</span>
      <a href="/annunci?stato=Vendita" style="background:#eff6ff;color:#2563eb;border:1px solid #bfdbfe;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:800;text-decoration:none;">✦ Solo vendita</a>
      <a href="/annunci?stato=Affitto%20mensile" style="background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;padding:6px 16px;border-radius:20px;font-size:13px;font-weight:800;text-decoration:none;">✦ Solo affitto</a>
      <a href="/annunci" style="margin-left:auto;font-size:13px;font-weight:700;color:#2563eb;text-decoration:none;">Tutti gli annunci Italia →</a>
    </div>

    <!-- Listing cards (indicizzate da Google) -->
    <div class="card-grid">
      ${cardsHtml}
    </div>

    ${totalCount > listings.length ? `
    <div style="margin-top:32px;text-align:center;">
      <a href="/annunci" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 32px;border-radius:12px;font-weight:800;font-size:15px;text-decoration:none;">
        Vedi tutti gli annunci con filtri avanzati →
      </a>
    </div>` : ''}

    <!-- Testo SEO -->
    <section style="margin-top:48px;background:#fff;border:1px solid #f1f5f9;border-radius:20px;padding:32px;">
      <h2 style="margin:0 0 12px;font-size:20px;font-weight:900;color:#0f172a;">
        Compra o affitta un posteggio mercatale a ${esc(cityName)}
      </h2>
      <p style="margin:0 0 12px;font-size:14px;color:#64748b;line-height:1.7;">
        Subingresso.it è la piattaforma italiana specializzata nella compravendita di <strong>concessioni mercatali</strong>,
        posteggi nei mercati rionali, banchi fissi e ambulanti a ${esc(cityName)} e in tutta Italia.
        Gli annunci sono pubblicati da venditori privati e operatori del settore: contatto diretto, nessuna commissione.
      </p>
      <p style="margin:0 0 12px;font-size:14px;color:#64748b;line-height:1.7;">
        Ogni annuncio riporta il tipo di mercato, i giorni di attività, la superficie del banco, il prezzo richiesto
        e la disponibilità a trattativa. Puoi anche <a href="/vendi" style="color:#2563eb;font-weight:700;">pubblicare gratuitamente</a>
        il tuo annuncio e raggiungere acquirenti interessati in tutta Italia.
      </p>
      <p style="margin:0;font-size:14px;color:#64748b;line-height:1.7;">
        Usa il <a href="/valutatore" style="color:#2563eb;font-weight:700;">valutatore gratuito</a> per stimare
        il valore del tuo posteggio a ${esc(cityName)} prima di mettere in vendita.
      </p>
    </section>

    <!-- FAQ (Mossa 4) -->
    <section style="margin-top:32px;">
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#0f172a;">
        Domande frequenti — Posteggi a ${esc(cityName)}
      </h2>
      ${faqHtml}
    </section>

  </main>

  <div id="footer-placeholder"></div>

  <script src="/js/ui-components.js?v=11"></script>

</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
};
