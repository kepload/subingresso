/* Presentation only. Search, account and listing actions use the shared modules. */
(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    if ('IntersectionObserver' in window && !reduced.matches) {
        const observer = new IntersectionObserver(entries => {
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                entry.target.classList.add('home-reveal');
                entry.target.style.transform = 'translateY(18px)';
                requestAnimationFrame(() => requestAnimationFrame(() => {
                    entry.target.style.transform = 'none';
                }));
                observer.unobserve(entry.target);
            }
        }, { threshold: .12 });
        document.querySelectorAll('.home-section-title, .home-tool, .home-step, .home-city, .home-faq-intro').forEach(el => observer.observe(el));
    }
    const grid = document.getElementById('previewGrid');
    if (grid) {
        const prepareCards = () => grid.querySelectorAll('[data-listing-id]:not([data-ui])').forEach(card => {
            card.setAttribute('data-ui', '');
            const cover = card.firstElementChild;
            const title = card.querySelector('h3');
            if (title) cover.setAttribute('aria-label', 'Apri ' + title.textContent.trim());
            if (cover.querySelector('img')) return;
            const locationIcon = card.querySelector('.fa-map-marker-alt');
            const place = locationIcon?.parentElement.textContent.trim().split(',')[0];
            const placeholder = cover.querySelector('div');
            if (!place || !placeholder) return;
            placeholder.classList.add('home-card-place');
            placeholder.replaceChildren();
            const city = document.createElement('strong');
            city.textContent = place;
            const caption = document.createElement('small');
            caption.textContent = 'Foto non disponibile';
            const group = document.createElement('div');
            group.append(city, caption);
            placeholder.append(group);
            placeholder.setAttribute('aria-hidden', 'true');
        });
        prepareCards();
        new MutationObserver(prepareCards).observe(grid, { childList: true });
    }
    const faq = document.querySelector('.home-faq');
    if (faq) faq.addEventListener('toggle', event => {
        const current = event.target;
        if (!(current instanceof HTMLDetailsElement) || !current.open) return;
        faq.querySelectorAll('details[open]').forEach(detail => {
            if (detail !== current) detail.open = false;
        });
    }, true);
})();
