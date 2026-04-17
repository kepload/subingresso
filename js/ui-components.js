// ============================================================
//  Subingresso.it — Componenti UI Centralizzati
//  Gestisce Header e Footer in modo dinamico
// ============================================================

const UI = {
    header: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <a href="index.html" class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div class="bg-blue-600 text-white w-9 h-9 sm:w-11 h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <i class="fas fa-store text-sm sm:text-lg"></i>
            </div>
            <span class="text-lg sm:text-2xl font-extrabold tracking-tight">Subingresso<span class="text-blue-600">.it</span></span>
        </a>
        <nav class="hidden lg:flex absolute left-1/2 -translate-x-1/2 gap-12 text-xs font-black text-slate-400 uppercase tracking-[.15em]">
            <a href="annunci.html" class="nav-link-annunci hover:text-slate-900 transition">Annunci</a>
            <a href="valutatore.html" class="hover:text-slate-900 transition">Calcolatore</a>
            <a href="blog.html"    class="nav-link-blog hover:text-slate-900 transition">Blog</a>
        </nav>
        <div class="flex items-center gap-2 sm:gap-3">
            <div id="authNav" class="flex items-center gap-2 sm:gap-3"></div>
            <a href="vendi.html" class="bg-slate-900 text-white w-9 h-9 sm:w-10 sm:h-10 lg:w-auto lg:px-7 lg:py-3 rounded-lg sm:rounded-xl lg:rounded-[16px] text-xs sm:text-sm font-bold hover:bg-blue-600 transition-all duration-300 shadow-sm flex items-center justify-center gap-2">
                <i class="fas fa-plus text-[10px] sm:text-xs"></i>
                <span class="hidden lg:inline">Inserisci annuncio</span>
            </a>
        </div>
    </div>`,

    footer: `
    <div class="max-w-7xl mx-auto px-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div class="md:col-span-2">
                <div class="flex items-center gap-3 mb-4">
                    <div class="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center">
                        <i class="fas fa-store"></i>
                    </div>
                    <span class="text-xl font-extrabold">Subingresso<span class="text-blue-400">.it</span></span>
                </div>
                <p class="text-slate-400 font-medium leading-relaxed max-w-xs text-sm">
                    La piattaforma italiana per la compravendita di concessioni mercatali tra privati.
                </p>
            </div>
            <div>
                <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Navigazione</h4>
                <ul class="space-y-2.5 text-slate-400 font-medium text-sm">
                    <li><a href="index.html"   class="hover:text-white transition">Home</a></li>
                    <li><a href="annunci.html" class="hover:text-white transition">Annunci</a></li>
                    <li><a href="vendi.html"   class="hover:text-white transition">Inserisci annuncio</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Informazioni</h4>
                <ul class="space-y-2.5 text-slate-400 font-medium text-sm">
                    <li><a href="index.html#come-funziona" class="hover:text-white transition">Come funziona</a></li>
                    <li><a href="privacy.html"   class="hover:text-white transition">Privacy Policy</a></li>
                    <li><a href="termini.html"   class="hover:text-white transition">Termini di servizio</a></li>
                    <li><a href="contatti.html"  class="hover:text-white transition">Contatti</a></li>
                </ul>
            </div>
        </div>
        <div class="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p class="text-slate-500">&copy; 2025 Subingresso.it. Tutti i diritti riservati.</p>
            <div class="flex items-center gap-4">
                <a href="blog.html" class="text-[10px] text-slate-700 hover:text-slate-500 transition uppercase font-bold tracking-widest">Blog</a>
            </div>
        </div>
    </div>`
};

function initUI() {
    const headerEl = document.querySelector('header');
    const footerEl = document.querySelector('footer');

    if (headerEl) {
        headerEl.className = "bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100";
        headerEl.innerHTML = UI.header;
        
        // Attiva link corrente
        const page = window.location.pathname;
        if (page.includes('annunci.html')) {
            headerEl.querySelector('.nav-link-annunci')?.classList.add('text-blue-600');
        } else if (page.includes('blog.html')) {
            headerEl.querySelector('.nav-link-blog')?.classList.add('text-blue-600');
        }
    }

    if (footerEl) {
        footerEl.className = "bg-slate-900 text-white py-14";
        footerEl.innerHTML = UI.footer;
    }
}

// ── COOKIE BANNER ────────────────────────────────────────────
function initCookieBanner() {
    if (localStorage.getItem('cookie_consent')) return;

    const banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Consenso cookie');
    banner.innerHTML = `
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            <div class="flex items-start gap-3 flex-1 min-w-0">
                <div class="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i class="fas fa-cookie-bite text-white text-sm"></i>
                </div>
                <div class="min-w-0">
                    <p class="text-slate-900 font-black text-sm sm:text-base leading-snug">Usiamo i cookie</p>
                    <p class="text-slate-500 font-medium text-xs sm:text-sm mt-0.5 leading-relaxed">
                        Per migliorare la tua esperienza e analizzare il traffico.
                        <a href="privacy.html" class="text-blue-600 hover:underline font-bold ml-0.5 whitespace-nowrap">Privacy Policy</a>
                    </p>
                </div>
            </div>
            <div class="flex gap-2.5 w-full sm:w-auto flex-shrink-0">
                <button id="cookieDeny"
                    class="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors duration-150 whitespace-nowrap">
                    Solo necessari
                </button>
                <button id="cookieAccept"
                    class="flex-1 sm:flex-none px-5 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-150 whitespace-nowrap shadow-sm shadow-blue-100">
                    Accetta tutti
                </button>
            </div>
        </div>
    `;

    Object.assign(banner.style, {
        position:     'fixed',
        bottom:       '0',
        left:         '0',
        right:        '0',
        zIndex:       '9999',
        background:   '#ffffff',
        borderTop:    '1px solid #f1f5f9',
        padding:      'clamp(14px, 3vw, 22px) clamp(16px, 4vw, 32px)',
        boxShadow:    '0 -8px 32px rgba(15,23,42,.08)',
        transform:    'translateY(100%)',
        transition:   'transform 0.35s cubic-bezier(0.34, 1.26, 0.64, 1)',
    });

    document.body.appendChild(banner);
    requestAnimationFrame(() => { banner.style.transform = 'translateY(0)'; });

    function _dismiss(choice) {
        localStorage.setItem('cookie_consent', choice);
        banner.style.transform = 'translateY(110%)';
        banner.addEventListener('transitionend', () => banner.remove(), { once: true });
    }

    document.getElementById('cookieAccept').addEventListener('click', () => _dismiss('all'));
    document.getElementById('cookieDeny').addEventListener('click',   () => _dismiss('essential'));
}

// Inizializza al caricamento
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { initUI(); initCookieBanner(); });
} else {
    initUI();
    initCookieBanner();
}
