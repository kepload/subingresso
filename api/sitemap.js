// ============================================================
//  Subingresso.it — Sitemap XML Dinamica (Vercel Serverless)
//  Si aggiorna automaticamente ad ogni crawl di Google.
//  Include: pagine statiche + tutti gli annunci attivi + tutti i post blog.
// ============================================================

const SUPABASE_URL      = 'https://mhfbtltgwibwmsudsuvf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';
const SITE              = 'https://subingresso.it';

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

const STATIC_PAGES = [
    { loc: '/',           changefreq: 'daily',   priority: '1.0' },
    { loc: '/annunci',    changefreq: 'daily',   priority: '0.9' },
    { loc: '/vendi',      changefreq: 'monthly', priority: '0.8' },
    { loc: '/valutatore', changefreq: 'monthly', priority: '0.7' },
    { loc: '/blog',       changefreq: 'weekly',  priority: '0.7' },
    { loc: '/contatti',   changefreq: 'yearly',  priority: '0.5' },
    { loc: '/privacy',    changefreq: 'yearly',  priority: '0.4' },
    { loc: '/termini',    changefreq: 'yearly',  priority: '0.4' },
];

function urlTag(loc, lastmod, changefreq, priority) {
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

module.exports = async function handler(req, res) {
    const today   = new Date().toISOString().split('T')[0];
    const headers = {
        'apikey':        SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    };

    let listings = [];
    let posts    = [];
    let cities   = [];

    try {
        const [lRes, pRes, cRes] = await Promise.all([
            fetch(`${SUPABASE_URL}/rest/v1/annunci?select=id,created_at&status=eq.active`, { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/blog_posts?select=slug,published_at`,           { headers }),
            fetch(`${SUPABASE_URL}/rest/v1/annunci?select=comune&status=eq.active&comune=not.is.null`, { headers }),
        ]);
        if (lRes.ok) listings = await lRes.json();
        if (pRes.ok) posts    = await pRes.json();
        if (cRes.ok) {
            const raw = await cRes.json();
            // Distinct comuni non vuoti
            const seen = new Set();
            for (const r of raw) {
                const c = (r.comune || '').trim();
                if (c) seen.add(c);
            }
            cities = Array.from(seen);
        }
    } catch (_) {
        // fallback: solo pagine statiche
    }

    const parts = [
        // Pagine statiche
        ...STATIC_PAGES.map(p =>
            urlTag(SITE + p.loc, today, p.changefreq, p.priority)
        ),
        // Un URL per ogni annuncio attivo (generato automaticamente)
        ...listings.map(l =>
            urlTag(
                `${SITE}/annuncio?id=${l.id}`,
                l.created_at ? l.created_at.split('T')[0] : today,
                'weekly',
                '0.8'
            )
        ),
        // Un URL per ogni post del blog
        ...posts.map(p =>
            urlTag(
                `${SITE}/blog?post=${encodeURIComponent(p.slug)}`,
                p.published_at ? p.published_at.split('T')[0] : today,
                'monthly',
                '0.7'
            )
        ),
        // Una pagina per ogni città con annunci attivi
        ...cities.map(c =>
            urlTag(
                `${SITE}/annunci/${cityToSlug(c)}`,
                today,
                'weekly',
                '0.8'
            )
        ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${parts.join('\n')}\n</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(xml);
};
