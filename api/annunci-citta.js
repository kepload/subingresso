// ============================================================
//  Subingresso.it — SSR Pagina Annunci per Città (Vercel Serverless)
//  Es.: /annunci/milano → listing attivi a Milano con meta tag ottimizzati
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

function safeJson(obj) {
    return JSON.stringify(obj).replace(/<\//g, '<\\/');
}

// "reggio-emilia" → "Reggio Emilia"
function slugToCity(slug) {
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// "Reggio Emilia" → "reggio-emilia"
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

function buildCard(l) {
    const img   = l.img_urls && l.img_urls.length > 0 ? l.img_urls[0] : null;
    const badge = l.stato === 'Vendita'
        ? '<span style="background:#10b981;color:#fff;font-size:11px;font-weight:800;padding:2px 10px;border-radius:20px;letter-spacing:.03em;">Vendita</span>'
        : '<span style="background:#2563eb;color:#fff;font-size:11px;font-weight:800;padding:2px 10px;border-radius:20px;letter-spacing:.03em;">Affitto</span>';
    const desc  = (l.descrizione || '').replace(/\s+/g, ' ').trim().substring(0, 110);
    const tipo  = [l.tipo, l.settore].filter(Boolean).join(' · ');

    return `
  <a href="/annuncio?id=${esc(l.id)}" style="display:block;background:#fff;border:1px solid #f1f5f9;border-radius:16px;overflow:hidden;text-decoration:none;box-shadow:0 1px 4px rgba(15,23,42,.06);transition:box-shadow .2s;">
    ${img
        ? `<img src="${esc(img)}" alt="${esc(l.titolo)}" style="width:100%;height:160px;object-fit:cover;" loading="lazy">`
        : `<div style="width:100%;height:160px;background:#f8fafc;display:flex;align-items:center;justify-content:center;"><i class="fas fa-store" style="color:#cbd5e1;font-size:2rem;"></i></div>`
    }
    <div style="padding:16px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        ${badge}
        ${tipo ? `<span style="font-size:11px;color:#94a3b8;font-weight:700;">${esc(tipo)}</span>` : ''}
      </div>
      <h2 style="margin:0 0 6px;font-size:15px;font-weight:800;color:#0f172a;line-height:1.3;">${esc(l.titolo)}</h2>
      ${desc ? `<p style="margin:0 0 10px;font-size:13px;color:#64748b;line-height:1.5;">${esc(desc)}${l.descrizione && l.descrizione.length > 110 ? '…' : ''}</p>` : ''}
      <p style="margin:0;font-size:18px;font-weight:900;color:#2563eb;">${esc(formatPrezzo(l))}</p>
    </div>
  </a>`;
}

module.exports = async function handler(req, res) {
    const citySlug = (req.query && req.query.citta) ? String(req.query.citta).trim().toLowerCase() : '';

    if (!citySlug || !/^[a-z0-9-]+$/.test(citySlug)) {
        res.status(302).setHeader('Location', '/annunci').end();
        return;
    }

    const cityName     = slugToCity(citySlug);
    const canonicalUrl = `${SITE}/annunci/${citySlug}`;

    let listings   = [];
    let totalCount = 0;

    try {
        const r = await fetch(
            `${SUPABASE_URL}/rest/v1/annunci?status=eq.active&comune=ilike.${encodeURIComponent(cityName)}&select=id,titolo,descrizione,stato,tipo,settore,comune,provincia,prezzo,img_urls&order=featured.desc,created_at.desc&limit=50`,
            {
                headers: {
                    'apikey':        SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer':        'count=exact',
                }
            }
        );
        if (r.ok) {
            listings = await r.json();
            const cr = r.headers.get('content-range');
            if (cr) {
                const m = cr.match(/\/(\d+)$/);
                if (m) totalCount = parseInt(m[1]);
            } else {
                totalCount = listings.length;
            }
        }
    } catch (_) {}

    // Se non ci sono annunci per questa città, non indicizzare la pagina
    if (listings.length === 0) {
        res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8').send(`<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8"><title>Nessun annuncio a ${esc(cityName)} — Subingresso.it</title>
<meta name="robots" content="noindex"><link rel="canonical" href="${SITE}/annunci">
</head><body><h1>Nessun annuncio disponibile a ${esc(cityName)}</h1>
<p><a href="/annunci">Cerca in tutta Italia →</a></p></body></html>`);
        return;
    }

    const title       = `Posteggi Mercatali a ${cityName} — Subingresso.it`;
    const description = `Trova ${totalCount} posteggi mercatali in vendita e affitto a ${cityName}. Licenze ambulanti, banchi mercato e concessioni su Subingresso.it. Contatto diretto, nessuna commissione.`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
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
                    { '@type': 'ListItem', 'position': 1, 'name': 'Home',      'item': `${SITE}/` },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Annunci',   'item': `${SITE}/annunci` },
                    { '@type': 'ListItem', 'position': 3, 'name': cityName,    'item': canonicalUrl }
                ]
            }
        ]
    };

    const cardsHtml = listings.map(buildCard).join('\n');

    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta property="og:title"       content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type"        content="website">
  <meta property="og:url"         content="${esc(canonicalUrl)}">
  <meta name="twitter:card"       content="summary_large_image">
  <link rel="canonical" href="${esc(canonicalUrl)}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <script type="application/ld+json">${safeJson(jsonLd)}</script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f8fafc; margin: 0; }
    .card-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    @media (min-width: 640px)  { .card-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (min-width: 1024px) { .card-grid { grid-template-columns: repeat(3, 1fr); } }
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
    <div style="margin-bottom:32px;">
      <h1 style="margin:0 0 8px;font-size:clamp(24px,4vw,36px);font-weight:900;color:#0f172a;line-height:1.15;">
        Posteggi Mercatali a <span style="color:#2563eb;">${esc(cityName)}</span>
      </h1>
      <p style="margin:0;font-size:16px;color:#64748b;font-weight:500;">
        ${totalCount} ${totalCount === 1 ? 'annuncio disponibile' : 'annunci disponibili'} · banchi mercato, licenze ambulanti, concessioni
      </p>
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

  </main>

  <div id="footer-placeholder"></div>

  <script src="/js/config.js"></script>
  <script src="/js/ui-components.js?v=9"></script>

</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).send(html);
};
