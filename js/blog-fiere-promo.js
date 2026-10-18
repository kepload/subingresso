// Richiami al calendario: solo blog, nessuna dipendenza dal codice delle fiere.
(function () {
    'use strict';
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
        if (/\bgarda\b/.test(text)) return {region:null, href:'/fiere'};
        const region = regions.length === 1 ? regions[0] : null;
        return {region, href:'/fiere' + (region ? '?regione=' + encodeURIComponent(region) : '')};
    }
    function card(post, position, regionMap) {
        const ctx = context(post, regionMap);
        const compact = position === 'closing';
        // Domanda provocatoria richiesta dall'utente, senza attribuirla a un
        // incasso documentato di una specifica fiera o presentarla come promessa.
        const title = compact
            ? '<span class="bfp-title-line">Il prossimo incasso?</span><span class="bfp-title-line"><span class="bfp-keep">Non lasciarlo</span> <span class="bfp-keep">agli altri.</span></span>'
            : '<span class="bfp-title-line bfp-money-line"><span class="bfp-number">5.000&nbsp;€</span> <span class="bfp-keep">in 2 giorni?</span></span><span class="bfp-title-line"><span class="bfp-keep">Punta alla</span> <span class="bfp-keep">fiera giusta.</span></span>';
        const description = compact
            ? '<span>Scegli la prossima piazza.</span><span>Il banco ce lo metti tu.</span>'
            : '<span>La cassa non si riempie da sola.</span><span>Scegli dove portare il banco.</span>';
        return '<aside class="blog-fiere-promo not-prose' + (compact ? ' bfp-compact' : '') + '" data-fiere-promo="' + position + '" aria-label="Fiere e mercatini su Subingresso.it">'
            + '<div class="bfp-copy"><span class="bfp-eyebrow">Fiere e mercatini' + (ctx.region ? ' · ' + escape(ctx.region) : ' · Fai girare il banco') + '</span>'
            + '<h2 class="bfp-title">' + title + '</h2><p class="bfp-description">' + description + '</p>'
            + '</div>'
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
