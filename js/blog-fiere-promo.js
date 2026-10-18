// Richiami al calendario: solo blog, nessuna dipendenza dal codice delle fiere.
(function () {
    'use strict';
    const SOURCE = 'https://www.elivebrescia.tv/san-faustino-brescia-bancarelle-600-tirapicio/';
    function escape(value) {
        return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
    }
    function normalized(value) {
        return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    }
    function context(post, regionMap) {
        const text = ' ' + normalized((post.slug || '') + ' ' + (post.title || '')) + ' ';
        const regions = Object.values(regionMap).filter(region => text.includes(' ' + normalized(region) + ' '));
        // Il Garda interessa tre regioni: nessuna destinazione regionale arbitraria.
        if (/\bgarda\b/.test(text)) return {region:null, proof:false, href:'/fiere'};
        const region = regions.length === 1 ? regions[0] : null;
        return {region, proof:!regions.length || region === 'Lombardia', href:'/fiere' + (region ? '?regione=' + encodeURIComponent(region) : '')};
    }
    function card(post, position, regionMap) {
        const ctx = context(post, regionMap);
        const compact = position === 'closing';
        const proof = ctx.proof && !compact;
        const title = compact ? 'Il banco è pronto. La prossima fiera?'
            : proof ? '<span class="bfp-number">200.000+</span> presenze in un giorno.'
            : 'Il prossimo grande incasso? <span class="bfp-accent">Parti dalla fiera giusta.</span>';
        const description = compact ? 'Scegli dove portarlo: cerca per zona, periodo e cosa vendi.'
            : proof ? 'San Faustino, Brescia. E tu, dove porti il banco?'
            : 'Cerca per zona, periodo e cosa vendi. Il prossimo appuntamento ti aspetta.';
        return '<aside class="blog-fiere-promo not-prose' + (compact ? ' bfp-compact' : '') + '" data-fiere-promo="' + position + '" aria-label="Fiere e mercatini su Subingresso.it">'
            + '<div class="bfp-copy"><span class="bfp-eyebrow">Fiere e mercatini' + (ctx.region ? ' · ' + escape(ctx.region) : ' · Trova il tuo prossimo appuntamento') + '</span>'
            + '<h2 class="bfp-title">' + title + '</h2><p class="bfp-description">' + description + '</p>'
            + (proof ? '<p class="bfp-source">Stima della stampa, edizione 2026. <a href="' + SOURCE + '" target="_blank" rel="noopener noreferrer">Fonte: ÈliveBrescia TV</a></p>' : '') + '</div>'
            + '<a class="bfp-button" data-fiere-cta data-regione="' + escape(ctx.region || '') + '" href="' + escape(ctx.href) + '">Trova la fiera giusta <span aria-hidden="true">→</span></a></aside>';
    }
    function mount(article, post, regionMap) {
        if (!article || article.querySelector('[data-fiere-promo]') || article.nextElementSibling?.matches('[data-fiere-promo]')) return;
        // Nessuna pubblicità aggressiva nelle guide rivolte agli eredi.
        if (/eredit|succession|muore/.test(normalized(post.slug))) return;
        const blocks = Array.from(article.children);
        const ordinary = blocks.filter(el => !el.matches('.not-prose') && !el.querySelector('[data-box-listings], #bandoAlertForm'));
        const length = ordinary.reduce((sum, el) => sum + el.textContent.length, 0);
        let characters = 0, paragraphs = 0, anchor = null;
        // Prima di una nuova sezione, dopo almeno sei paragrafi: non divide
        // liste/tabelle e mantiene distanza dagli avvisi/annunci al terzo paragrafo.
        for (const el of ordinary) {
            if (/^H[23]$/.test(el.tagName) && paragraphs >= 6 && characters >= 1000 && characters <= length * .7) { anchor = el; break; }
            characters += el.textContent.length;
            if (el.tagName === 'P') paragraphs++;
        }
        if (anchor) {
            anchor.insertAdjacentHTML('beforebegin', card(post, 'inline', regionMap));
            // Il richiamo finale resta separato dalle CTA già presenti nel testo.
            article.insertAdjacentHTML('afterend', card(post, 'closing', regionMap));
        } else {
            article.insertAdjacentHTML('afterend', card(post, 'end', regionMap));
        }
    }
    document.addEventListener('click', event => {
        const link = event.target.closest && event.target.closest('[data-fiere-cta]');
        const slug = new URLSearchParams(location.search).get('post');
        if (link && slug && window.trackBlogConversion) window.trackBlogConversion('cta_fiere_click', slug, link.dataset.regione || null);
    });
    window.BlogFierePromo = {card, mount, context};
})();
