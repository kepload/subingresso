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
    const faq = document.querySelector('.home-faq');
    if (faq) faq.addEventListener('toggle', event => {
        const current = event.target;
        if (!(current instanceof HTMLDetailsElement) || !current.open) return;
        faq.querySelectorAll('details[open]').forEach(detail => {
            if (detail !== current) detail.open = false;
        });
    }, true);
})();
