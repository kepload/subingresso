// Same static presentation in the browser and on the server. No network or DOM access.
(function (root) {
'use strict';
function escapeHTML(value) {return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
const previewColumns = 'slug,title,excerpt,published_at,cover_image_url,category';
const postColumns = previewColumns + ',content,author';
const listingSlot = '<div id="bandoListingsBox" class="not-prose blog-listings-slot"><div class="text-center text-slate-300 py-8"><i class="fas fa-spinner fa-spin"></i></div></div>';
const SLUG_TO_REGIONE = {
    'lombardia': 'Lombardia', 'piemonte': 'Piemonte', 'lazio': 'Lazio', 'veneto': 'Veneto',
    'emilia-romagna': 'Emilia-Romagna', 'toscana': 'Toscana', 'campania': 'Campania', 'puglia': 'Puglia',
    'sicilia': 'Sicilia', 'liguria': 'Liguria', 'marche': 'Marche', 'trentino-alto-adige': 'Trentino-Alto Adige',
    'sardegna': 'Sardegna', 'friuli-venezia-giulia': 'Friuli-Venezia Giulia', 'valle-d-aosta': "Valle d'Aosta",
    'umbria': 'Umbria', 'abruzzo': 'Abruzzo', 'molise': 'Molise', 'basilicata': 'Basilicata', 'calabria': 'Calabria'
};
const BANDI_PREFIX = 'bandi-posteggi-mercatali-';
function _regioneFromSlug(s) {
    if (!s || s.indexOf(BANDI_PREFIX) !== 0) return null;
    return SLUG_TO_REGIONE[s.slice(BANDI_PREFIX.length)] || null;
}

function _bandoAlertFormHtml(regione) {
    var reg = escapeHTML(regione);
    return '<div class="bando-alert not-prose my-8 rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 md:p-6">'
      + '<div class="flex items-start gap-3 mb-1">'
      +   '<div class="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"><i class="fas fa-bell"></i></div>'
      +   '<div class="min-w-0 flex-1">'
      +     '<h3 class="font-black text-slate-900 text-base md:text-lg leading-tight">Avvisi per bandi e posteggi in ' + reg + '</h3>'
      +     '<p class="text-xs text-slate-500 font-semibold mt-1 leading-relaxed">Registrati gratis al sito per ricevere i nuovi bandi pubblici e gli annunci di posteggi in zona. Se hai già un account, accedi e attiva gli avvisi.</p>'
      +   '</div>'
      + '</div>'
      + '<form id="bandoAlertForm" class="flex flex-col sm:flex-row gap-2 mt-4">'
      +   '<button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-black text-sm px-6 py-3 rounded-xl transition shadow-sm">Registrati e attiva avvisi</button>'
      + '</form>'
      + '<p id="bandoAlertMsg" role="status" class="hidden mt-3 text-xs font-bold"></p>'
      + '<p class="mt-3 text-[10px] text-slate-400 leading-relaxed">Annulli l\'iscrizione in un click dal link in ogni email. <a href="/privacy" class="underline hover:text-slate-600">Privacy</a>.</p>'
      + '</div>';
}




function insertPromo(html, region) {
    const _IS_BANDI = !!region, _BLOG_REGIONE = region;
    let _inlineBoxInjected = false;
    // Inietta dopo il 3° paragrafo (picco di tensione: la gente non legge fino in fondo).
    // Se l'articolo è troppo corto (<3 <p>) non inserisce nulla → fallback box in coda.
    _inlineBoxInjected = false;
    let count = 0, splitAt = -1, idx = 0;
    while (idx < html.length) {
        const found = html.indexOf('</p>', idx);
        if (found === -1) break;
        idx = found + 4;
        if (++count === 3) { splitAt = idx; break; }
    }
    if (splitAt === -1) return {html, inline: false};

    // Sui post "bandi-*" il visitor è acquirente: form Avvisi (lead magnet intent-aligned).
    // Sugli altri (incl. hub Bolkestein) il vecchio banner "Vetrina gratis" era off-intent
    // e a 0 conversioni (TODO 13): lo sostituiamo col box live dei posteggi, QUI al picco
    // di tensione invece che in fondo all'articolo (dove quasi nessuno arrivava).
    let promo;
    if (_IS_BANDI) {
        promo = _bandoAlertFormHtml(_BLOG_REGIONE);
    } else {
        promo = `<div id="bandoListingsBox" class="not-prose blog-listings-slot"><div class="text-center text-slate-300 py-8"><i class="fas fa-spinner fa-spin"></i></div></div>`;
        _inlineBoxInjected = true;
    }
    return {html: html.slice(0, splitAt) + promo + html.slice(splitAt), inline: _inlineBoxInjected};
}


function _pexelsUrl(base, w, h) {
    if (!base) return '';
    const sep = base.includes('?') ? '&' : '?';
    return base + sep + 'auto=compress&cs=tinysrgb&w=' + w + (h ? '&h=' + h : '') + '&fit=crop';
}


function articleMarkup(post, safeContent) {
    // safeContent has already passed DOMPurify in the caller.
    const date = new Date(post.published_at).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });
    const safeTitle = escapeHTML(post.title), cover = post.cover_image_url || '';
    // Hero image markup. Eager + fetchpriority=high perché è above the fold.
    const heroHtml = cover ? `
        <img src="${escapeHTML(_pexelsUrl(cover, 1200, 675))}"
             srcset="${escapeHTML(_pexelsUrl(cover, 600, 338))} 600w, ${escapeHTML(_pexelsUrl(cover, 900, 506))} 900w, ${escapeHTML(_pexelsUrl(cover, 1200, 675))} 1200w, ${escapeHTML(_pexelsUrl(cover, 1600, 900))} 1600w"
             sizes="(max-width: 768px) 100vw, 768px"
             alt="${safeTitle}"
             loading="eager" fetchpriority="high" decoding="async"
             class="w-full aspect-[16/9] object-cover rounded-3xl mb-8 bg-slate-100">
    ` : '';


    const region = _regioneFromSlug(post.slug), promo = insertPromo(safeContent, region);
    const _bodyHtml = promo.html;
    const finalCtaBlock = region || !promo.inline ? listingSlot : '';
    return `
        ${heroHtml}
        <p class="text-blue-600 font-bold text-xs uppercase tracking-widest mb-4 text-left">${date}</p>
        <h1 class="text-4xl font-black tracking-tight text-slate-900 mb-10 leading-tight text-left">${safeTitle}</h1>
        <div id="blogPostContent" class="prose font-medium text-left">${_bodyHtml}</div>
        ${finalCtaBlock}
        <div id="relatedBandi"></div>
        <div class="mt-12 pt-10 border-t border-slate-100 text-left">
            <a href="/blog" class="text-sm font-bold text-slate-400 hover:text-blue-600 transition">← Torna all'indice degli articoli</a>
        </div>
    `;
}

function listMarkup(posts, promoHtml) {
    if (posts.length === 0) {
        return `<p class="text-slate-400 text-center py-12">Nessun articolo presente al momento.</p>`;
    }

    const _date = (iso) => new Date(iso).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' });

    const _badge = (category) => {
        if (!category) return '';
        const cat = String(category);
        const isBandi = cat.toLowerCase() === 'bandi';
        const cls = isBandi
            ? 'bg-blue-600 text-white'
            : 'bg-slate-900 text-white';
        return `<span class="inline-block ${cls} text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md">${escapeHTML(cat)}</span>`;
    };

    const _heroCard = (p) => {
        const safeSlug = encodeURIComponent(p.slug);
        const safeTitle = escapeHTML(p.title);
        const safeExcerpt = escapeHTML(p.excerpt || 'Guida tecnica completa con riferimenti normativi e consigli pratici.');
        const cover = p.cover_image_url || '';
        const thumbHtml = cover ? `
            <img src="${escapeHTML(_pexelsUrl(cover, 1200, 675))}"
                 srcset="${escapeHTML(_pexelsUrl(cover, 600, 338))} 600w, ${escapeHTML(_pexelsUrl(cover, 1200, 675))} 1200w, ${escapeHTML(_pexelsUrl(cover, 1600, 900))} 1600w"
                 sizes="(max-width: 1024px) 100vw, 720px"
                 alt="${safeTitle}"
                 loading="eager" fetchpriority="high" decoding="async"
                 class="w-full aspect-[16/9] object-cover bg-slate-100 group-hover:scale-105 transition-transform duration-500">
        ` : '<div class="w-full aspect-[16/9] bg-slate-100"></div>';
        return `
        <a href="/blog?post=${safeSlug}" class="group block bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 h-full">
            <div class="relative overflow-hidden">
                ${thumbHtml}
                <div class="absolute top-4 left-4">${_badge(p.category)}</div>
            </div>
            <div class="p-6 md:p-8">
                <p class="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">${_date(p.published_at)}</p>
                <h2 class="text-2xl md:text-3xl font-black text-slate-900 group-hover:text-blue-600 transition tracking-tight leading-tight mb-3">${safeTitle}</h2>
                <p class="text-slate-500 text-sm md:text-base font-medium leading-relaxed line-clamp-3">${safeExcerpt}</p>
                <p class="text-blue-600 text-xs font-black uppercase tracking-widest mt-5 inline-flex items-center gap-1.5">Leggi <i class="fas fa-arrow-right text-[10px]"></i></p>
            </div>
        </a>`;
    };

    const _sideCard = (p) => {
        const safeSlug = encodeURIComponent(p.slug);
        const safeTitle = escapeHTML(p.title);
        const cover = p.cover_image_url || '';
        // Layout grid 96px + 1fr inline: garantisce orizzontale a prescindere da Tailwind/cache.
        // Specificita' style inline (1,0,0,0) batte qualsiasi class.
        const thumb = cover
            ? `<img src="${escapeHTML(_pexelsUrl(cover, 240, 240))}"
                    alt="${safeTitle}"
                    width="96" height="96"
                    loading="lazy" decoding="async"
                    style="width:96px;height:96px;object-fit:cover;border-radius:12px;background:#f1f5f9"
                    class="bg-slate-100">`
            : '<div style="width:96px;height:96px;border-radius:12px;background:#f1f5f9"></div>';
        return `
        <a href="/blog?post=${safeSlug}" style="display:grid;grid-template-columns:96px 1fr;gap:12px;align-items:center" class="group bg-white rounded-2xl p-3 border border-slate-100 hover:border-blue-200 hover:shadow-md transition">
            ${thumb}
            <div style="min-width:0">
                ${_badge(p.category)}
                <h3 style="margin-top:8px" class="text-sm font-black text-slate-900 group-hover:text-blue-600 transition tracking-tight leading-snug line-clamp-3">${safeTitle}</h3>
                <p style="margin-top:6px" class="text-[10px] font-bold text-slate-400 uppercase">${_date(p.published_at)}</p>
            </div>
        </a>`;
    };

    const _gridCard = (p) => {
        const safeSlug = encodeURIComponent(p.slug);
        const safeTitle = escapeHTML(p.title);
        const safeExcerpt = escapeHTML(p.excerpt || 'Guida pratica con riferimenti normativi.');
        const cover = p.cover_image_url || '';
        const thumb = cover
            ? `<img src="${escapeHTML(_pexelsUrl(cover, 600, 338))}"
                    srcset="${escapeHTML(_pexelsUrl(cover, 400, 225))} 400w, ${escapeHTML(_pexelsUrl(cover, 600, 338))} 600w, ${escapeHTML(_pexelsUrl(cover, 900, 506))} 900w"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    alt="${safeTitle}"
                    loading="lazy" decoding="async"
                    class="w-full aspect-[16/9] object-cover bg-slate-100 group-hover:scale-105 transition-transform duration-500">`
            : '<div class="w-full aspect-[16/9] bg-slate-100"></div>';
        return `
        <a href="/blog?post=${safeSlug}" class="group block bg-white rounded-2xl overflow-hidden border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
            <div class="overflow-hidden">${thumb}</div>
            <div class="p-5">
                ${_badge(p.category)}
                <h3 class="text-base lg:text-lg font-black text-slate-900 group-hover:text-blue-600 transition tracking-tight leading-snug mt-2.5 line-clamp-2">${safeTitle}</h3>
                <p class="text-slate-500 text-xs font-medium leading-relaxed mt-2 line-clamp-2">${safeExcerpt}</p>
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">${_date(p.published_at)}</p>
            </div>
        </a>`;
    };

    const [hero, ...rest] = posts;
    const sideStack = rest.slice(0, 4);
    const gridRest  = rest.slice(4);

    return `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
            <div class="lg:col-span-2">${_heroCard(hero)}</div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-3">
                ${sideStack.map(_sideCard).join('')}
            </div>
        </div>
        ${promoHtml}
        ${gridRest.length ? `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            ${gridRest.map(_gridCard).join('')}
        </div>` : ''}
    `;
}


const api = {articleMarkup, listMarkup, insertPromo, alertForm: _bandoAlertFormHtml, pexelsUrl: _pexelsUrl, regionFromSlug: _regioneFromSlug, regions: SLUG_TO_REGIONE, previewColumns, postColumns};
if (typeof module !== 'undefined' && module.exports) module.exports = api;
else root.BlogMarkup = api;
})(typeof window !== 'undefined' ? window : globalThis);
