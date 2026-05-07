// ============================================================
//  Subingresso.it — SSR Blog Post (Vercel Serverless)
//  Serve /blog?post=<slug> con title/description/canonical/og/JSON-LD
//  pre-renderizzati server-side. Senza ?post= il rewrite non scatta
//  e il fallback cleanUrls serve blog.html statico.
//  Il body del template resta blog.html (single source of truth):
//  riusiamo lo stesso file e sostituiamo solo i meta tag dell'head.
// ============================================================

const fs   = require('fs');
const path = require('path');

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
    const slug = (req.query && req.query.post) ? String(req.query.post).trim() : '';

    let post = null;
    if (slug) {
        try {
            const r = await fetch(
                `${SUPABASE_URL}/rest/v1/blog_posts?slug=eq.${encodeURIComponent(slug)}&select=slug,title,excerpt,published_at,cover_image_url,author,category`,
                { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` } }
            );
            if (r.ok) {
                const arr = await r.json();
                if (Array.isArray(arr) && arr.length > 0) post = arr[0];
            }
        } catch (_) {}
    }

    let html = getBlogTemplate();

    if (post) {
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
                     `<title>${eTitle}</title>`)
            .replace(/<meta name="description" id="metaBlogDesc"[^>]*>/,
                     `<meta name="description" id="metaBlogDesc" content="${eDesc}">`)
            .replace(/<meta property="og:title" id="ogBlogTitle"[^>]*>/,
                     `<meta property="og:title" id="ogBlogTitle" content="${eTitle}">`)
            .replace(/<meta property="og:description" id="ogBlogDesc"[^>]*>/,
                     `<meta property="og:description" id="ogBlogDesc" content="${eDesc}">`)
            .replace(/<meta property="og:type"[^>]*>/,
                     `<meta property="og:type" content="article">`)
            .replace(/<meta property="og:url" id="ogBlogUrl"[^>]*>/,
                     `<meta property="og:url" id="ogBlogUrl" content="${eCan}">`)
            .replace(/<meta property="og:image" id="ogBlogImage"[^>]*>/,
                     `<meta property="og:image" id="ogBlogImage" content="${eImg}">`)
            .replace(/<meta name="twitter:image" id="twitterImage"[^>]*>/,
                     `<meta name="twitter:image" id="twitterImage" content="${eImg}">`)
            .replace(/<link rel="canonical" id="canonicalBlog"[^>]*>/,
                     `<link rel="canonical" id="canonicalBlog" href="${eCan}">`);

        const robotsAndLd =
            `<meta name="robots" content="index,follow,max-image-preview:large">\n` +
            `    <script type="application/ld+json" id="_ldBlog">${safeJson(jsonLd)}</script>\n`;

        html = html.replace('</head>', `    ${robotsAndLd}</head>`);

        res.setHeader('Cache-Control', 'public, s-maxage=180, stale-while-revalidate=600');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(200).send(html);
        return;
    }

    // Slug fornito ma non trovato: noindex per non indicizzare soft-404.
    if (slug) {
        html = html.replace('</head>',
            `    <meta name="robots" content="noindex,nofollow">\n</head>`);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.status(404).send(html);
        return;
    }

    // Nessun slug: serve il template senza modifiche (caso teorico — il rewrite
    // condizionale non dovrebbe mandare qui richieste senza ?post=).
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
};
