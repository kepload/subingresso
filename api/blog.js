// ============================================================
//  Subingresso.it — SSR Blog Post (Vercel Serverless)
//  Index previews and the selected article are readable before JavaScript.
//  The same markup functions serve the browser fallback and server rendering.
// ============================================================

const fs   = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const BlogMarkup = require('../js/blog-markup');
const BlogFierePromo = require('../js/blog-fiere-promo');
const ContextualAds = require('../js/contextual-ads');
// No scripts or external resources are enabled in this server-side DOM.
const sanitizerWindow = new JSDOM('').window;
const DOMPurify = createDOMPurify(sanitizerWindow);

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
    return JSON.stringify(obj).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
}

async function readPosts(search) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/blog_posts?${search}`, {
        headers: {'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`},
        signal: AbortSignal.timeout(8000)
    });
    if (!response.ok) throw new Error('Blog temporarily unavailable');
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Unexpected blog response');
    return rows;
}

function renderBody(html, content, bootstrap) {
    return html.replace('<div id="loading" class="text-center py-20">', '<div id="loading" class="hidden text-center py-20">')
        .replace('<div id="blogContainer" class="hidden"></div>', () => `<div id="blogContainer">${content}</div>`)
        .replace('</main>', () => `</main><script type="application/json" id="blogBootstrap">${safeJson(bootstrap)}</script>`);
}

function hideBanner(html) {
    return html.replace('id="bannerValutatore" class="', 'id="bannerValutatore" class="hidden ');
}

function pexelsUrl(base, w, h) {
    if (!base) return '';
    const sep = base.includes('?') ? '&' : '?';
    return base + sep + 'auto=compress&cs=tinysrgb&w=' + w + (h ? '&h=' + h : '') + '&fit=crop';
}

// Il template e' `blog-template.html` (NON `blog.html`): se si chiamasse
// blog.html, cleanUrls intercetterebbe /blog -> blog.html servendolo come
// static PRIMA del rewrite verso /api/blog (testato 7 mag 2026).
// blog-template.html e' deployato come static ma nessuno lo richiede
// (no link, no sitemap), quindi non viene mai servito agli utenti.
let _BLOG_HTML_CACHE = null;
function getBlogTemplate() {
    if (_BLOG_HTML_CACHE) return _BLOG_HTML_CACHE;
    _BLOG_HTML_CACHE = fs.readFileSync(path.join(process.cwd(), 'blog-template.html'), 'utf8');
    return _BLOG_HTML_CACHE;
}

module.exports = async function handler(req, res) {
    // Servizio ADS nello stesso runtime: conserva le 12 funzioni del piano.
    // Il gestore imposta no-store e controlla il ruolo prima di ogni lettura.
    if (req.query?.personal_ads === '1') return require('../lib/personal-ads-handler.cjs')(req, res);
    if (req.query?.contextual_rules === '1') {
        res.setHeader('Cache-Control','private, no-store');
        if (!['GET','HEAD'].includes(req.method)) return res.status(405).end();
        try { return res.status(200).json(await require('../lib/contextual-ad-rules.cjs').readRules()); }
        catch (_) { return res.status(503).json({error:'Regole temporaneamente non disponibili.'}); }
    }
    const slug = (req.query && req.query.post) ? String(req.query.post).trim() : '';

    let post = null, related = [], unavailable = false;
    if (slug) {
        try {
            const rows = await readPosts(`slug=eq.${encodeURIComponent(slug)}&select=${BlogMarkup.postColumns}&limit=1`);
            post = rows[0] || null;
            // Failure of optional related cards never prevents reading the article.
            if (post && BlogMarkup.regionFromSlug(slug)) {
                try { related = await readPosts(`slug=like.bandi-posteggi-mercatali-*&select=${BlogMarkup.previewColumns}`); } catch (_) {}
            }
        } catch (_) { unavailable = true; }
    }

    let html = getBlogTemplate();

    if (post) {
        let contextualRules={ads:{},posts:{}};
        try { contextualRules=await require('../lib/contextual-ad-rules.cjs').readRules(); } catch (_) {}
        const safeContent = DOMPurify.sanitize(post.content || '');
        let content = BlogMarkup.articleMarkup(post, safeContent);
        // Promotions have the same positions before and after hydration.
        const articleRoot = sanitizerWindow.document.createElement('div');
        articleRoot.innerHTML = content;
        ContextualAds.mount(articleRoot.querySelector('#blogPostContent'), post, BlogMarkup.regions, contextualRules);
        content = articleRoot.innerHTML;
        const {content: _body, ...metadata} = post;
        html = renderBody(html, content, {mode: 'post', post: metadata, related, contextualRules});
        if (BlogMarkup.regionFromSlug(slug) || BlogMarkup.hasEditorialPromos(safeContent)) html = hideBanner(html);
        const fullTitle = `${post.title} — Subingresso.it`;
        const desc      = post.excerpt || post.title;
        const canonical = `${SITE}/blog?post=${encodeURIComponent(post.slug)}`;
        const ogBase    = post.cover_image_url || 'https://images.pexels.com/photos/1187299/pexels-photo-1187299.jpeg';
        const ogImage   = pexelsUrl(ogBase, 1200, 630);

        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            'headline': post.title,
            'description': desc,
            'datePublished': post.published_at,
            'dateModified': post.published_at,
            'url': canonical,
            'inLanguage': 'it-IT',
            'author':    { '@type': 'Organization', 'name': post.author || 'Redazione Subingresso', 'url': SITE },
            'publisher': { '@type': 'Organization', 'name': 'Subingresso.it', 'url': SITE },
            'image': [
                pexelsUrl(ogBase, 1200, 675),
                pexelsUrl(ogBase, 1200, 900),
                pexelsUrl(ogBase, 1200, 1200),
            ]
        };

        const eTitle = esc(fullTitle);
        const eDesc  = esc(desc);
        const eCan   = esc(canonical);
        const eImg   = esc(ogImage);

        html = html
            .replace(/<title>[\s\S]*?<\/title>/,
                     () => `<title>${eTitle}</title>`)
            .replace(/<meta name="description" id="metaBlogDesc"[^>]*>/,
                     () => `<meta name="description" id="metaBlogDesc" content="${eDesc}">`)
            .replace(/<meta property="og:title" id="ogBlogTitle"[^>]*>/,
                     () => `<meta property="og:title" id="ogBlogTitle" content="${eTitle}">`)
            .replace(/<meta property="og:description" id="ogBlogDesc"[^>]*>/,
                     () => `<meta property="og:description" id="ogBlogDesc" content="${eDesc}">`)
            .replace(/<meta property="og:type"[^>]*>/,
                     () => `<meta property="og:type" content="article">`)
            .replace(/<meta property="og:url" id="ogBlogUrl"[^>]*>/,
                     () => `<meta property="og:url" id="ogBlogUrl" content="${eCan}">`)
            .replace(/<meta property="og:image" id="ogBlogImage"[^>]*>/,
                     () => `<meta property="og:image" id="ogBlogImage" content="${eImg}">`)
            .replace(/<meta name="twitter:image" id="twitterImage"[^>]*>/,
                     () => `<meta name="twitter:image" id="twitterImage" content="${eImg}">`)
            .replace(/<link rel="canonical" id="canonicalBlog"[^>]*>/,
                     () => `<link rel="canonical" id="canonicalBlog" href="${eCan}">`);

        const robotsAndLd =
            `<meta name="robots" content="index,follow,max-image-preview:large">\n` +
            `    <script type="application/ld+json" id="_ldBlog">${safeJson(jsonLd)}</script>\n`;

        html = html.replace('</head>', () => `    ${robotsAndLd}</head>`);

        res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=180, stale-while-revalidate=600, must-revalidate');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(html);
        return;
    }

    // Slug fornito ma non trovato: noindex per non indicizzare soft-404.
    if (slug && !unavailable) {
        html = renderBody(html, '<p class="text-center">Post non trovato. <a href="/blog" class="text-blue-600 underline">Torna all’indice</a></p>', {mode: 'not-found'});
        html = html.replace('</head>',
            `    <meta name="robots" content="noindex,nofollow">\n</head>`);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(404).send(html);
        return;
    }

    if (unavailable) {
        html = html.replace('</head>', '<meta name="robots" content="noindex"></head>');
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(503).send(html.replace('<i class="fas fa-spinner fa-spin text-blue-600 text-3xl"></i>', '<p>Articolo temporaneamente non disponibile. <a href="" class="underline">Riprova</a></p>'));
    }

    // Nessun slug: pagina lista /blog. Meta SEO custom + intro testuale unica
    // per evitare il "thin content" (8 mag 2026: 42 pagine "Discovered, not indexed",
    // /blog tra queste).
    const listTitle = 'Blog Subingresso — Guide, Bandi e Compravendita Posteggi Mercatali';
    const listDesc  = 'Guide pratiche e bandi posteggi mercatali in tutte le regioni italiane. Subingresso, licenze ambulanti, fisco, normative. Aggiornato 2026.';
    const listCanonical = `${SITE}/blog`;
    const eListTitle = esc(listTitle);
    const eListDesc  = esc(listDesc);
    const eListCan   = esc(listCanonical);

    html = html
        .replace(/<title>[\s\S]*?<\/title>/,
                 `<title>${eListTitle}</title>`)
        .replace(/<meta name="description" id="metaBlogDesc"[^>]*>/,
                 `<meta name="description" id="metaBlogDesc" content="${eListDesc}">`)
        .replace(/<meta property="og:title" id="ogBlogTitle"[^>]*>/,
                 `<meta property="og:title" id="ogBlogTitle" content="${eListTitle}">`)
        .replace(/<meta property="og:description" id="ogBlogDesc"[^>]*>/,
                 `<meta property="og:description" id="ogBlogDesc" content="${eListDesc}">`)
        .replace(/<meta property="og:url" id="ogBlogUrl"[^>]*>/,
                 `<meta property="og:url" id="ogBlogUrl" content="${eListCan}">`)
        .replace(/<link rel="canonical" id="canonicalBlog"[^>]*>/,
                 `<link rel="canonical" id="canonicalBlog" href="${eListCan}">`);

    const introHtml = `
    <section id="blogListIntro" class="max-w-4xl mx-auto mb-12 px-1">
        <p class="text-xs font-black text-blue-600 uppercase tracking-widest mb-4">Il Blog di Subingresso</p>
        <h1 class="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight mb-6">
            Guide e bandi per chi vive di <span class="text-blue-600">mercati</span>.
        </h1>
        <p class="text-lg md:text-xl text-slate-600 leading-relaxed font-medium mb-8 max-w-3xl">
            Guide pratiche e bandi pubblici per chi vende, compra o gestisce un posteggio mercatale in Italia. Ogni articolo è pensato per chi lavora davvero al banco: ambulanti che cercano di capire la burocrazia del subingresso, venditori che vogliono valutare correttamente la propria licenza, acquirenti che cercano un posteggio in una regione specifica.
        </p>
        <div class="flex flex-wrap items-center gap-2 mb-8">
            <span class="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"><i class="fas fa-bullhorn text-[10px]"></i>Bandi pubblici</span>
            <span class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"><i class="fas fa-handshake text-[10px]"></i>Subingresso</span>
            <span class="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"><i class="fas fa-file-invoice text-[10px]"></i>Fiscalità</span>
            <span class="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"><i class="fas fa-balance-scale text-[10px]"></i>Bolkestein</span>
            <span class="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"><i class="fas fa-map-marker-alt text-[10px]"></i>20 regioni</span>
        </div>
        <div class="border-t border-slate-100 pt-7 max-w-3xl">
            <p class="text-slate-600 leading-relaxed mb-4">Aggiornamenti su tutti i <strong>bandi posteggi mercatali</strong> emessi dai comuni italiani — Lombardia, Piemonte, Lazio, Veneto, Emilia-Romagna, Toscana, Sicilia, Calabria e tutte le altre regioni. Approfondiamo la differenza tra licenza tipo A e tipo B, la fiscalità sui guadagni del posteggio, la tassa di occupazione del suolo pubblico, il rinnovo della concessione, la successione in caso di eredità.</p>
            <p class="text-slate-600 leading-relaxed">Sezione speciale per il <strong>Lago di Garda, la Costa degli Dei, il Salento</strong> e gli altri territori turistici dove il valore di un posteggio cambia con la stagionalità. Aggiornamenti regolari su Bolkestein, sentenze TAR e novità normative che impattano il commercio ambulante italiano.</p>
        </div>
    </section>`;

    // Inietta l'intro subito prima di #loading (sotto il banner valutatore)
    html = html.replace(
        /<div id="loading"/,
        `${introHtml}\n    <div id="loading"`
    );

    try {
        const previews = await readPosts(`select=${BlogMarkup.previewColumns}&order=published_at.desc`);
        html = renderBody(html, BlogMarkup.listMarkup(previews, BlogFierePromo.card({slug:'', title:''}, 'index', BlogMarkup.regions)), {mode: 'list'});
        html = hideBanner(html).replace('id="blogMain" class="max-w-3xl', 'id="blogMain" class="max-w-7xl');
    } catch (_) {
        res.setHeader('Cache-Control', 'private, no-store');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(503).send(html.replace('<i class="fas fa-spinner fa-spin text-blue-600 text-3xl"></i>', '<p>Indice temporaneamente non disponibile. <a href="" class="underline">Riprova</a></p>'));
    }

    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=180, stale-while-revalidate=600, must-revalidate');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
};
