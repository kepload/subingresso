// ============================================================
//  Subingresso.it — SSR Pagina Comune (Vercel Serverless)
//  Es.: /comune/milano → guida al subingresso a Milano + annunci
//  ─────────────────────────────────────────────────────────────
//  DIFFERENZA da /annunci/[citta]:
//   • /annunci/[citta] = LISTING-first (target: "posteggi mercatali Milano")
//   • /comune/[slug]   = INFO-first    (target: "subingresso licenza Milano")
//  Title/H1/canonical distinti per evitare cannibalizzazione SEO.
//  Coverage: 7904 comuni italiani (ISTAT) vs 141 capoluoghi.
// ============================================================

const SITE = 'https://subingresso.it';

// Bundle statico ~1.4MB; Vercel @vercel/node lo include via require tracing.
const COMUNI = require('../data/comuni.json');

// Index by slug O(1)
const COMUNI_BY_SLUG = Object.create(null);
for (const c of COMUNI) COMUNI_BY_SLUG[c.slug] = c;

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

function fmtPop(n) {
    if (!n || isNaN(n)) return '';
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.', ',') + ' milioni';
    if (n >= 10000)   return Math.round(n / 1000) + ' mila';
    return Number(n).toLocaleString('it-IT');
}

module.exports = async function handler(req, res) {
    const slug = (req.query && req.query.slug) ? String(req.query.slug).trim().toLowerCase() : '';

    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        res.status(302).setHeader('Location', '/annunci').end();
        return;
    }

    const c = COMUNI_BY_SLUG[slug];
    if (!c) {
        res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8').send(`<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8"><title>Comune non trovato — Subingresso.it</title>
<meta name="robots" content="noindex"><link rel="canonical" href="${SITE}/annunci">
</head><body><h1>Comune non trovato</h1>
<p><a href="/annunci">Sfoglia gli annunci →</a></p></body></html>`);
        return;
    }

    const canonicalUrl = `${SITE}/comune/${slug}`;
    const annunciSlug  = `${SITE}/annunci/${slug}`; // pagina sorella listing-first
    const year         = new Date().getFullYear();
    const todayIso     = new Date().toISOString().split('T')[0];

    // ─── SEO: title/desc info-first, query target "subingresso {comune}" ──
    const title = `Subingresso e licenze ambulanti a ${c.nome} | Guida ${year} · Subingresso.it`;
    const description = c.popolazione
        ? `Come fare il subingresso di un posteggio mercatale a ${c.nome} (${c.sigla}, ${fmtPop(c.popolazione)} abitanti): iter SUAP, costi notarili, tempistiche. Annunci attivi e valutazione gratuita.`
        : `Come fare il subingresso di un posteggio mercatale a ${c.nome} (${c.sigla}): iter SUAP, costi notarili, tempistiche. Annunci attivi e valutazione gratuita.`;

    // ─── Schema markup: Place + BreadcrumbList + FAQPage ──────
    const faq = [
        {
            q: `Come funziona il subingresso di un posteggio a ${c.nome}?`,
            a: `Il subingresso a ${c.nome} richiede un atto notarile di cessione d'azienda (o ramo d'azienda) tra venditore e acquirente, seguito da una SCIA al SUAP del Comune di ${c.nome} entro 30 giorni dalla firma. La pratica completa si conclude in 30-60 giorni. Costi notarili tipici: 800-2.500 euro più imposta di registro.`
        },
        {
            q: `Che differenza c'è tra licenza tipo A e tipo B a ${c.nome}?`,
            a: `La licenza di tipo A (concessione di posteggio) dà diritto a un posto fisso in un mercato di ${c.nome} ed è la più richiesta. La licenza di tipo B è itinerante: permette di vendere su aree pubbliche senza posteggio assegnato. Entrambe richiedono partita IVA con codice ATECO commercio ambulante e iscrizione INPS commercianti.`
        },
        {
            q: `Quanto vale un posteggio mercatale a ${c.nome}?`,
            a: `Il valore di un posteggio a ${c.nome} dipende dal fatturato medio del banco, dalla zona del mercato, dal settore merceologico (alimentare, abbigliamento, ecc.), dai giorni di mercato e dagli anni residui di concessione. Su Subingresso.it puoi usare il valutatore gratuito per una stima orientativa.`
        },
        {
            q: `È possibile trasferire un posteggio in famiglia a ${c.nome}?`,
            a: `Sì. Il trasferimento intra-familiare di una concessione di posteggio (a coniuge, figlio o parente fino al terzo grado) è regolato dalle norme regionali e dal regolamento del Comune di ${c.nome}. La pratica al SUAP è generalmente più rapida e con costi inferiori rispetto a una cessione tra estranei.`
        },
        {
            q: `Dove trovo gli annunci di posteggi in vendita a ${c.nome}?`,
            a: `Su Subingresso.it pubblichiamo gli annunci attivi di posteggi mercatali e licenze ambulanti a ${c.nome} e in tutta Italia. Gli annunci sono inseriti direttamente dai titolari delle concessioni o dagli eredi: contatto diretto, nessuna commissione di intermediazione.`
        }
    ];

    const graph = [
        {
            '@type': 'BreadcrumbList',
            'itemListElement': [
                { '@type': 'ListItem', 'position': 1, 'name': 'Home',     'item': `${SITE}/` },
                { '@type': 'ListItem', 'position': 2, 'name': 'Annunci',  'item': `${SITE}/annunci` },
                { '@type': 'ListItem', 'position': 3, 'name': c.regione,  'item': `${SITE}/annunci` },
                { '@type': 'ListItem', 'position': 4, 'name': c.nome,     'item': canonicalUrl }
            ]
        },
        {
            '@type': 'Place',
            'name': c.nome,
            'url':  canonicalUrl,
            'address': {
                '@type': 'PostalAddress',
                'addressLocality': c.nome,
                'addressRegion':   c.regione,
                'addressCountry':  'IT'
            },
            ...(c.lat && c.lng ? {
                'geo': { '@type': 'GeoCoordinates', 'latitude': c.lat, 'longitude': c.lng }
            } : {})
        },
        {
            '@type': 'FAQPage',
            'mainEntity': faq.map(f => ({
                '@type': 'Question',
                'name':  f.q,
                'acceptedAnswer': { '@type': 'Answer', 'text': f.a }
            }))
        }
    ];
    const jsonLd = { '@context': 'https://schema.org', '@graph': graph };

    const faqHtml = faq.map(f => `
      <details style="background:#fff;border:1px solid #f1f5f9;border-radius:14px;padding:16px 20px;margin-bottom:10px;">
        <summary style="font-size:15px;font-weight:800;color:#0f172a;cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;">
          ${esc(f.q)}
          <i class="fas fa-chevron-down" style="color:#94a3b8;font-size:12px;"></i>
        </summary>
        <p style="margin:12px 0 0;font-size:14px;color:#64748b;line-height:1.7;">${esc(f.a)}</p>
      </details>`).join('');

    const popInfo = c.popolazione
        ? `<span style="background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;">${esc(fmtPop(c.popolazione))} abitanti</span>`
        : '';

    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:title"        content="${esc(title)}">
  <meta property="og:description"  content="${esc(description)}">
  <meta property="og:type"         content="article">
  <meta property="og:url"          content="${esc(canonicalUrl)}">
  <meta property="og:updated_time" content="${esc(todayIso)}">
  <meta name="twitter:card"        content="summary_large_image">
  <link rel="canonical" href="${esc(canonicalUrl)}">
  <script src="https://cdn.tailwindcss.com"></script>
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
      <span style="color:#64748b;font-weight:600;">${esc(c.regione)}</span>
      <span style="margin:0 6px;">›</span>
      <span style="color:#0f172a;font-weight:700;">${esc(c.nome)}</span>
    </nav>

    <!-- Hero -->
    <header style="margin-bottom:32px;">
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;">
        <span style="background:#f1f5f9;color:#475569;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;">${esc(c.regione)}</span>
        <span style="background:#f1f5f9;color:#475569;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;">Provincia di ${esc(c.provincia)} (${esc(c.sigla)})</span>
        ${popInfo}
      </div>
      <h1 style="margin:0 0 12px;font-size:clamp(28px,5vw,40px);font-weight:900;color:#0f172a;line-height:1.1;letter-spacing:-.02em;">
        Subingresso a <span style="color:#2563eb;">${esc(c.nome)}</span>
      </h1>
      <p style="margin:0;font-size:17px;color:#64748b;font-weight:500;line-height:1.55;">
        Guida pratica al subingresso di un posteggio mercatale o licenza ambulante a ${esc(c.nome)}: iter, costi, tempistiche e annunci attivi.
      </p>
    </header>

    <!-- CTA box -->
    <div style="background:#fff;border:1px solid #f1f5f9;border-radius:16px;padding:20px;margin-bottom:32px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;">
      <div style="flex:1;min-width:200px;">
        <p style="margin:0 0 4px;font-size:13px;color:#64748b;font-weight:600;">Vuoi vedere subito i posteggi disponibili?</p>
        <p style="margin:0;font-size:15px;color:#0f172a;font-weight:800;">Annunci attivi a ${esc(c.nome)} e dintorni</p>
      </div>
      <a href="${esc(annunciSlug)}" style="background:#2563eb;color:#fff;padding:12px 22px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;">
        <i class="fas fa-search" style="margin-right:6px;"></i> Vedi annunci ${esc(c.nome)}
      </a>
    </div>

    <!-- Sezione informativa: come si fa il subingresso a {comune} -->
    <section style="background:#fff;border:1px solid #f1f5f9;border-radius:20px;padding:32px;margin-bottom:32px;">
      <h2 style="margin:0 0 14px;font-size:22px;font-weight:900;color:#0f172a;">
        Come fare il subingresso a ${esc(c.nome)}
      </h2>
      <p style="margin:0 0 14px;font-size:14px;color:#475569;line-height:1.75;">
        A ${esc(c.nome)} (provincia di ${esc(c.provincia)}) il subingresso di una concessione di posteggio segue le regole del <strong>D.Lgs. 114/1998</strong> e del regolamento comunale sul commercio su aree pubbliche. È una <strong>cessione d'azienda</strong>: il venditore trasferisce all'acquirente il posteggio e il diritto a esercitarvi.
      </p>
      <p style="margin:0 0 14px;font-size:14px;color:#475569;line-height:1.75;">
        L'iter è in tre passi: <strong>(1)</strong> atto notarile di cessione d'azienda (o ramo d'azienda) — costo tipico 800-2.500 € più imposta di registro; <strong>(2)</strong> SCIA al SUAP del Comune di ${esc(c.nome)} entro 30 giorni dalla firma del rogito; <strong>(3)</strong> voltura al Comune della concessione di posteggio.
      </p>
      <p style="margin:0;font-size:14px;color:#475569;line-height:1.75;">
        L'acquirente deve essere in regola con <strong>partita IVA</strong> (codice ATECO commercio ambulante), <strong>iscrizione INPS commercianti</strong>, e — se vende alimentari — <strong>HACCP</strong>. Tempistiche tipiche dell'intera operazione: <strong>30-60 giorni</strong> dalla firma alla piena operatività al banco.
      </p>
    </section>

    <!-- Cosa serve checklist rapida -->
    <section style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:20px;padding:28px;margin-bottom:32px;">
      <h2 style="margin:0 0 16px;font-size:18px;font-weight:900;color:#0f172a;">
        Documenti e requisiti per il subingresso a ${esc(c.nome)}
      </h2>
      <ul style="margin:0;padding:0;list-style:none;">
        <li style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;line-height:1.55;">
          <i class="fas fa-check-circle" style="color:#10b981;margin-top:3px;"></i>
          <span><strong>Atto notarile</strong> di cessione d'azienda (o ramo d'azienda) registrato</span>
        </li>
        <li style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;line-height:1.55;">
          <i class="fas fa-check-circle" style="color:#10b981;margin-top:3px;"></i>
          <span><strong>SCIA al SUAP</strong> del Comune di ${esc(c.nome)} entro 30 giorni</span>
        </li>
        <li style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;line-height:1.55;">
          <i class="fas fa-check-circle" style="color:#10b981;margin-top:3px;"></i>
          <span><strong>Partita IVA</strong> con codice ATECO commercio ambulante (47.81.x / 47.82.x / 47.89.x)</span>
        </li>
        <li style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid #e2e8f0;font-size:14px;color:#475569;line-height:1.55;">
          <i class="fas fa-check-circle" style="color:#10b981;margin-top:3px;"></i>
          <span><strong>Iscrizione INPS</strong> Gestione Commercianti</span>
        </li>
        <li style="display:flex;gap:10px;padding:10px 0;font-size:14px;color:#475569;line-height:1.55;">
          <i class="fas fa-check-circle" style="color:#10b981;margin-top:3px;"></i>
          <span><strong>HACCP</strong> (solo se settore alimentare)</span>
        </li>
      </ul>
    </section>

    <!-- Valutatore CTA -->
    <div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1px solid #a7f3d0;border-radius:16px;padding:24px;margin-bottom:32px;">
      <h2 style="margin:0 0 8px;font-size:18px;font-weight:900;color:#065f46;">
        Hai un posteggio a ${esc(c.nome)} e vuoi venderlo?
      </h2>
      <p style="margin:0 0 16px;font-size:14px;color:#047857;line-height:1.6;">
        Stima il valore del tuo posteggio in 60 secondi con il valutatore gratuito. Inserisci fatturato, zona, settore: ricevi una stima orientativa di vendita e affitto.
      </p>
      <a href="/valutatore" style="display:inline-block;background:#10b981;color:#fff;padding:12px 22px;border-radius:10px;font-weight:800;font-size:14px;text-decoration:none;">
        <i class="fas fa-calculator" style="margin-right:6px;"></i> Valuta il tuo posteggio
      </a>
    </div>

    <!-- FAQ -->
    <section style="margin-bottom:32px;">
      <h2 style="margin:0 0 16px;font-size:20px;font-weight:900;color:#0f172a;">
        Domande frequenti — Subingresso a ${esc(c.nome)}
      </h2>
      ${faqHtml}
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
