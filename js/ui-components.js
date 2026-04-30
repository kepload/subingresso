// ============================================================
//  Subingresso.it — Componenti UI Centralizzati
//  Gestisce Header e Footer in modo dinamico
// ============================================================

const UI = {
    header: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between lg:grid lg:grid-cols-3">
        <a href="/" class="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <div class="bg-blue-600 text-white w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <i class="fas fa-exchange-alt text-sm sm:text-lg"></i>
            </div>
            <span class="text-lg sm:text-2xl font-extrabold tracking-tight">Subingresso<span class="text-blue-600">.it</span></span>
        </a>
        <nav class="hidden lg:flex justify-center gap-12 text-xs font-black text-slate-400 uppercase tracking-[.15em]">
            <a href="/valutatore" class="nav-link-valutatore hover:text-slate-900 transition">Calcolatore</a>
            <a href="/annunci"   class="nav-link-annunci hover:text-slate-900 transition">Annunci</a>
            <a href="/blog"      class="nav-link-blog hover:text-slate-900 transition">Blog</a>
        </nav>
        <div class="flex items-center justify-end gap-2 sm:gap-3">
            <div id="authNav" class="flex items-center gap-2 sm:gap-3"></div>
            <a href="/vendi" class="bg-slate-900 text-white w-9 h-9 sm:w-10 sm:h-10 lg:w-auto lg:px-7 lg:py-3 rounded-lg sm:rounded-xl lg:rounded-[16px] text-xs sm:text-sm font-bold hover:bg-blue-600 transition-all duration-300 shadow-sm flex items-center justify-center gap-2">
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
                        <i class="fas fa-exchange-alt"></i>
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
                    <li><a href="/"           class="hover:text-white transition">Home</a></li>
                    <li><a href="/annunci"    class="hover:text-white transition">Annunci</a></li>
                    <li><a href="/valutatore" class="hover:text-white transition">Calcolatore</a></li>
                    <li><a href="/blog"       class="hover:text-white transition">Blog</a></li>
                    <li><a href="/vendi"      class="hover:text-white transition">Inserisci annuncio</a></li>
                </ul>
            </div>
            <div>
                <h4 class="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Informazioni</h4>
                <ul class="space-y-2.5 text-slate-400 font-medium text-sm">
                    <li><a href="/#come-funziona" class="hover:text-white transition">Come funziona</a></li>
                    <li><a href="/privacy"   class="hover:text-white transition">Privacy Policy</a></li>
                    <li><a href="/termini"   class="hover:text-white transition">Termini di servizio</a></li>
                    <li><a href="/contatti"  class="hover:text-white transition">Contatti</a></li>
                </ul>
            </div>
        </div>
        <div class="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p class="text-slate-500">&copy; 2026 Subingresso.it. Tutti i diritti riservati.</p>
            <div class="flex items-center gap-4">
                <a href="/blog" class="text-[10px] text-slate-700 hover:text-slate-500 transition uppercase font-bold tracking-widest">Blog</a>
            </div>
        </div>
    </div>`
};

function initUI() {
    const headerEl = document.querySelector('header');
    const footerEl = document.querySelector('footer');

    if (headerEl) {
        headerEl.className = "bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 relative";
        headerEl.innerHTML = UI.header;
        
        // Attiva link corrente
        const page = window.location.pathname;
        if (page.includes('/annunci')) {
            headerEl.querySelector('.nav-link-annunci')?.classList.add('text-blue-600');
        } else if (page.includes('/blog')) {
            headerEl.querySelector('.nav-link-blog')?.classList.add('text-blue-600');
        } else if (page.includes('/valutatore')) {
            headerEl.querySelector('.nav-link-valutatore')?.classList.add('text-blue-600');
        }
    }

    if (footerEl) {
        footerEl.className = "bg-slate-900 text-white py-14";
        footerEl.innerHTML = UI.footer;
    }
}

// Inizializza al caricamento
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initUI);
} else {
    initUI();
}
