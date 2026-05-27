// ============================================================
//  Subingresso.it — SSR Bando Landing Page (Vercel Serverless)
//  Path: /bandi/<slug>  →  /api/bandi/[slug]
//
//  Mostra un bando pubblico approvato dall'admin con:
//   - Titolo, regione, comune, scadenza, riassunto AI
//   - CTA "Apri bando ufficiale" (link originale Comune/Regione)
//   - Cross-sell: 3 annunci attivi della stessa regione
//   - CTA valutatore (per chi vuole stimare valore posteggio)
//   - CTA iscrizione avvisi se non già iscritto
//   - SEO meta tags + JSON-LD GovernmentService
// ============================================================

const SUPABASE_URL      = 'https://mhfbtltgwibwmsudsuvf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';
const SITE              = 'https://subingresso.it';

function esc(s) {
    if (s === null || s === undefined) return '';
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function safeJson(obj) { return JSON.stringify(obj).replace(/<\//g, '<\\/'); }

function formatScadenza(s) {
    if (!s) return null;
    try {
        const d = new Date(s);
        if (isNaN(d.getTime())) return s;
        return d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch (_) { return s; }
}

function formatPrice(prezzo, stato) {
    if (!prezzo || prezzo <= 0) return '';
    const n = Number(prezzo).toLocaleString('it-IT');
    return stato === 'Affitto mensile' ? `€ ${n} /anno` : `€ ${n}`;
}

function cardHTML(l) {
    const url = `/annuncio?id=${encodeURIComponent(l.id)}`;
    const cover = (Array.isArray(l.img_urls) && l.img_urls[0]) ? l.img_urls[0]
                : (l.dettagli_extra && l.dettagli_extra.images && l.dettagli_extra.images[0]) || null;
    const prezzo = esc(formatPrice(l.prezzo, l.stato));
    const titolo = esc(l.titolo || 'Posteggio');
    const comune = esc(l.comune || '');
    const stato = esc(l.stato || '');
    const isVen = (l.stato === 'Vendita');
    const accent = isVen ? 'border-l-emerald-400 bg-emerald-50/60' : 'border-l-blue-400 bg-blue-50/60';
    const badgeBg = isVen ? '#10b981' : '#3b82f6';
    const img = cover
        ? `<img src="${esc(cover)}" alt="${titolo}" loading="lazy" decoding="async" style="width:100%;height:140px;object-fit:cover;display:block;">`
        : `<div style="width:100%;height:140px;background:#e2e8f0;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:11px;">Nessuna foto</div>`;
    return `<a href="${esc(url)}" class="block rounded-2xl border border-l-[3px] ${accent} overflow-hidden hover:shadow-lg transition group">
        ${img}
        <div style="padding:14px;">
            <div style="display:inline-block;background:${badgeBg};color:#fff;font-size:10px;font-weight:900;padding:2px 8px;border-radius:6px;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;">${stato}</div>
            <h3 style="margin:0 0 4px;font-size:14px;font-weight:900;color:#0f172a;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${titolo}</h3>
            <p style="margin:0;font-size:11px;color:#64748b;font-weight:700;">${comune}${prezzo ? ' · <strong style="color:#0f172a">'+prezzo+'</strong>' : ''}</p>
        </div>
    </a>`;
}

module.exports = async function handler(req, res) {
    // Estrazione slug: con la dynamic route Vercel arriva come req.query.slug;
    // con il rewrite query-string come req.query.slug=<val>.
    const slug = (req.query && (req.query.slug || (Array.isArray(req.query.slug) ? req.query.slug[0] : ''))) || '';
    const cleanSlug = String(slug).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 120);

    if (!cleanSlug) {
        res.status(400).setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.end(notFoundPage('Slug bando mancante'));
    }

    // Fetch bando via RPC pubblica
    const headers = {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
    };
    let bando = null;
    try {
        const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_published_bando`, {
            method: 'POST', headers,
            body: JSON.stringify({ p_slug: cleanSlug }),
        });
        if (r.ok) {
            const data = await r.json();
            if (data && typeof data === 'object' && data.id) bando = data;
        }
    } catch (_) {}

    if (!bando) {
        res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Robots-Tag', 'noindex');
        return res.end(notFoundPage('Bando non trovato'));
    }

    // Fetch annunci della regione (cross-sell)
    let listings = [];
    try {
        const lurl = `${SUPABASE_URL}/rest/v1/annunci?select=id,user_id,titolo,stato,tipo,comune,prezzo,img_urls,dettagli_extra,featured,featured_until&status=eq.active&regione=eq.${encodeURIComponent(bando.regione)}&order=featured.desc,created_at.desc&limit=6`;
        const r = await fetch(lurl, { headers });
        if (r.ok) listings = await r.json();
    } catch (_) {}

    // Featured first ordering
    const now = Date.now();
    listings.sort((a, b) => {
        const aF = a.featured && a.featured_until && new Date(a.featured_until).getTime() > now ? 1 : 0;
        const bF = b.featured && b.featured_until && new Date(b.featured_until).getTime() > now ? 1 : 0;
        return bF - aF;
    });
    const topListings = listings.slice(0, 3);

    // SEO data
    const titolo = bando.titolo || `Bando posteggi mercatali ${bando.regione}`;
    const regione = bando.regione || '';
    const comune = '';  // l'ai_summary spesso ha "Comune: X" dentro
    const scadFmt = formatScadenza(bando.scadenza);
    const summary = bando.ai_summary || '';
    const cleanSummary = summary.replace(/\n/g, ' ').slice(0, 160);
    const fullUrl = `${SITE}/bandi/${cleanSlug}`;
    const pageTitle = `${titolo} — ${regione} | Subingresso.it`;
    const pageDesc = `${cleanSummary} Scopri anche posteggi privati disponibili subito in ${regione}.`;
    const ogImg = `${SITE}/og/og-home.jpg?v=1`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'GovernmentService',
        'name': titolo,
        'description': summary.slice(0, 500),
        'serviceType': 'Bando assegnazione posteggi mercatali',
        'provider': { '@type': 'GovernmentOrganization', 'name': `Pubblica Amministrazione ${regione}` },
        'areaServed': { '@type': 'AdministrativeArea', 'name': regione, 'addressCountry': 'IT' },
        'url': fullUrl,
        'inLanguage': 'it-IT',
    };
    const breadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE + '/' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Annunci ' + regione, 'item': SITE + '/annunci?regione=' + encodeURIComponent(regione) },
            { '@type': 'ListItem', 'position': 3, 'name': titolo, 'item': fullUrl },
        ],
    };

    const cardsHtml = topListings.length
        ? topListings.map(cardHTML).join('')
        : `<div style="text-align:center;padding:32px;color:#94a3b8;font-size:13px;">Ancora pochi annunci privati in ${esc(regione)}. <a href="/annunci?regione=${encodeURIComponent(regione)}" style="color:#2563eb;font-weight:700;text-decoration:underline;">Esplora tutta la regione →</a></div>`;

    const cleanSummaryFull = esc(summary);

    const html = `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(pageTitle)}</title>
<meta name="description" content="${esc(pageDesc)}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${esc(fullUrl)}">
<meta property="og:title" content="${esc(pageTitle)}">
<meta property="og:description" content="${esc(pageDesc)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${esc(fullUrl)}">
<meta property="og:image" content="${esc(ogImg)}">
<meta property="og:site_name" content="Subingresso.it">
<meta property="og:locale" content="it_IT">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="${esc(ogImg)}">
<link rel="icon" type="image/svg+xml" href="/favicon-v2.svg">
<link rel="stylesheet" href="/css/tailwind.css?v=4">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<script type="application/ld+json">${safeJson(jsonLd)}</script>
<script type="application/ld+json">${safeJson(breadcrumb)}</script>
<style>
.summary-block { white-space: pre-line; }
.cta-box { transition: transform .15s ease; }
.cta-box:hover { transform: translateY(-2px); }
</style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen flex flex-col">
<div id="header"></div>

<main class="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">

  <!-- Breadcrumb -->
  <nav class="text-xs text-slate-500 font-bold mb-4 flex flex-wrap items-center gap-2">
    <a href="/" class="hover:text-blue-600">Home</a>
    <span class="text-slate-300">›</span>
    <a href="/annunci?regione=${encodeURIComponent(regione)}" class="hover:text-blue-600">Annunci ${esc(regione)}</a>
    <span class="text-slate-300">›</span>
    <span class="text-slate-700">Bando</span>
  </nav>

  <!-- HERO BANDO -->
  <section class="bg-white rounded-3xl shadow-sm border border-amber-200 overflow-hidden mb-8">
    <div class="bg-gradient-to-r from-amber-50 to-orange-50 px-6 md:px-8 py-6 border-b border-amber-100">
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <span class="inline-block bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">Bando pubblico</span>
        <span class="inline-block bg-white border border-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">${esc(regione)}</span>
        ${scadFmt ? `<span class="inline-block bg-red-50 text-red-700 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">Scad. ${esc(scadFmt)}</span>` : ''}
      </div>
      <h1 class="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-2">${esc(titolo)}</h1>
    </div>
    <div class="px-6 md:px-8 py-6">
      <div class="summary-block text-base text-slate-700 leading-relaxed mb-6">${cleanSummaryFull || '<em class="text-slate-400">Riassunto non disponibile.</em>'}</div>
      <a href="${esc(bando.link)}" target="_blank" rel="noopener nofollow" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm md:text-base px-6 py-3 rounded-xl transition">
        <i class="fas fa-external-link-alt"></i>
        Apri bando ufficiale
      </a>
      <p class="text-[11px] text-slate-400 mt-3 leading-relaxed">
        ⚠️ Verifica sempre i dettagli sul sito ufficiale del Comune/Regione prima di presentare la domanda.
        Le informazioni qui sopra sono sintetizzate automaticamente e potrebbero non essere complete.
      </p>
    </div>
  </section>

  <!-- CROSS-SELL ANNUNCI PRIVATI -->
  <section class="mb-8">
    <div class="flex items-end justify-between mb-4 flex-wrap gap-2">
      <div>
        <h2 class="text-xl md:text-2xl font-black text-slate-900">Posteggi privati in ${esc(regione)}, subito disponibili</h2>
        <p class="text-sm text-slate-500 mt-1">Non aspettare il prossimo bando: questi sono in vendita o affitto adesso, su accordo diretto.</p>
      </div>
      <a href="/annunci?regione=${encodeURIComponent(regione)}" class="text-xs md:text-sm font-black text-blue-600 hover:underline whitespace-nowrap">Vedi tutti →</a>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${cardsHtml}
    </div>
  </section>

  <!-- CTA VALUTATORE -->
  <section class="cta-box bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-6 md:p-8 mb-8">
    <div class="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
      <div class="flex-1">
        <span class="inline-block bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded mb-2">Strumento gratuito</span>
        <h3 class="text-lg md:text-xl font-black text-slate-900 mb-1">Stai cedendo un posteggio in ${esc(regione)}?</h3>
        <p class="text-sm text-slate-700 leading-relaxed">Calcola quanto vale realmente in 2 minuti. Algoritmo basato su 30+ variabili (zona, giorni, settore, fatturato).</p>
      </div>
      <a href="/valutatore" class="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm px-5 py-3 rounded-xl whitespace-nowrap transition">
        <i class="fas fa-calculator"></i> Apri valutatore
      </a>
    </div>
  </section>

  <!-- CTA ISCRIZIONE AVVISI -->
  <section class="cta-box bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-6 md:p-8 mb-8">
    <div class="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
      <div class="flex-1">
        <span class="inline-block bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded mb-2">Avvisi gratuiti</span>
        <h3 class="text-lg md:text-xl font-black text-slate-900 mb-1">Ricevi i prossimi bandi per ${esc(regione)} via email</h3>
        <p class="text-sm text-slate-700 leading-relaxed">Niente spam, solo bandi reali quando escono. + Annunci privati dell'area.</p>
      </div>
      <form id="quickSubBandoAlert" class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <input type="email" id="qsEmail" required placeholder="La tua email" class="flex-1 md:w-64 px-3 py-2.5 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500">
        <input type="text" name="website" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;opacity:0;">
        <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-5 py-2.5 rounded-xl whitespace-nowrap transition">Iscrivimi</button>
      </form>
    </div>
    <p id="qsMsg" class="mt-3 text-xs font-bold hidden"></p>
  </section>

</main>

<div id="footer"></div>

<script>
window.SUPABASE_URL = '${SUPABASE_URL}';
window.SUPABASE_ANON_KEY = '${SUPABASE_ANON_KEY}';
window._BANDO_REGIONE = '${esc(regione)}';
window._formStartedAt = Date.now();
</script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="/js/supabase-config.js?v=2"></script>
<script src="/js/data.js?v=17"></script>
<script src="/js/ui-components.js?v=11"></script>
<script src="/js/auth.js?v=18"></script>
<script>
// Quick subscribe form
(function(){
  const form = document.getElementById('quickSubBandoAlert');
  const msg = document.getElementById('qsMsg');
  if (!form || !msg) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('qsEmail').value.trim().toLowerCase();
    const website = form.website.value;
    const dt = Date.now() - (window._formStartedAt || 0);
    if (website || dt < 2500) { msg.textContent = 'Email non valida'; msg.className = 'mt-3 text-xs font-bold text-red-600'; return; }
    msg.className = 'mt-3 text-xs font-bold text-slate-500'; msg.textContent = 'Iscrizione in corso…';
    try {
      const res = await fetch(window.SUPABASE_URL + '/functions/v1/subscribe-bando-alert', {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'apikey': window.SUPABASE_ANON_KEY, 'Authorization':'Bearer ' + window.SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, regione: window._BANDO_REGIONE, source: 'bando_page', website, dt }),
      });
      if (res.ok) {
        msg.className = 'mt-3 text-xs font-bold text-emerald-600';
        msg.textContent = '✓ Iscrizione registrata! Ti scriviamo appena escono nuovi bandi in ' + window._BANDO_REGIONE + '.';
        form.reset();
      } else {
        const err = await res.json().catch(()=>({}));
        msg.className = 'mt-3 text-xs font-bold text-red-600';
        msg.textContent = err.error || 'Errore: riprova fra qualche minuto';
      }
    } catch (_) {
      msg.className = 'mt-3 text-xs font-bold text-red-600';
      msg.textContent = 'Errore di rete, riprova';
    }
    msg.classList.remove('hidden');
  });
})();
</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=600, stale-while-revalidate=3600');
    res.status(200).end(html);
};

function notFoundPage(reason) {
    return `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="robots" content="noindex">
<title>Bando non trovato — Subingresso.it</title>
<link rel="stylesheet" href="/css/tailwind.css?v=4">
</head><body class="bg-slate-50 min-h-screen flex items-center justify-center p-6 text-center font-sans">
<div class="max-w-md bg-white rounded-3xl shadow-sm border border-slate-200 p-10">
<div class="text-6xl mb-4">📭</div>
<h1 class="text-2xl font-black text-slate-900 mb-2">Bando non disponibile</h1>
<p class="text-sm text-slate-500 mb-6">${esc(reason)}. Potrebbe essere stato rimosso o non ancora pubblicato.</p>
<a href="/blog" class="inline-block bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-5 py-2.5 rounded-xl">Vai al blog bandi</a>
</div></body></html>`;
}
