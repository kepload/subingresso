// Tema personale: il ruolo viene verificato sul server, mai salvato nel browser.
(function () {
    'use strict';
    let client, identity = null, revision = 0, sheet;
    const root = document.documentElement;
    root.dataset.adminThemePage = (location.pathname.split('/').filter(Boolean)[0] || 'index').replace(/\.html$/, '');
    const originalThemeColor = document.querySelector('meta[name="theme-color"]');
    const originalColor = originalThemeColor?.content;
    let themeColor = originalThemeColor;

    function clearTheme() {
        root.classList.remove('admin-dark');
        if (originalThemeColor) originalThemeColor.content = originalColor;
        else { themeColor?.remove(); themeColor = null; }
    }

    function loadStyles() {
        if (sheet) return sheet;
        sheet = new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/admin-theme.css?v=1';
            link.onload = resolve;
            link.onerror = () => { link.remove(); sheet = null; reject(new Error('Tema non disponibile')); };
            document.head.append(link);
        });
        return sheet;
    }

    async function refresh() {
        const request = ++revision;
        try {
            const { data: sessionData, error: sessionError } = await client.auth.getSession();
            if (request !== revision) return;
            const sessionUser = sessionData?.session?.user;
            if (sessionError || !sessionUser) { identity = null; clearTheme(); return; }
            if (identity !== sessionUser.id) { identity = sessionUser.id; clearTheme(); }
            // getUser convalida la sessione prima di leggere il ruolo pubblico.
            const { data: userData, error: userError } = await client.auth.getUser();
            if (request !== revision) return;
            const user = userData?.user;
            if (userError || !user || user.id !== identity) { clearTheme(); return; }
            const { data: profile, error } = await client.from('profiles')
                .select('is_admin').eq('id', user.id).single();
            if (request !== revision) return;
            if (error || profile?.is_admin !== true) { clearTheme(); return; }
            await loadStyles();
            if (request !== revision) return;
            root.classList.add('admin-dark');
            if (!themeColor) {
                themeColor = document.createElement('meta');
                themeColor.name = 'theme-color';
                document.head.append(themeColor);
            }
            themeColor.content = '#0b1220';
        } catch (_) {
            if (request === revision) clearTheme();
        }
    }

    async function start() {
        try {
            if (typeof _supabase !== 'undefined') client = _supabase;
            else {
                // Le pagine informative non caricano Auth. Senza sessione restano
                // statiche; chi ha gia effettuato l'accesso riusa la stessa sessione.
                if (!localStorage.getItem('sb-mhfbtltgwibwmsudsuvf-auth-token')) return;
                if (!window.supabase?.createClient) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
                        script.onload = resolve; script.onerror = reject;
                        document.head.append(script);
                    });
                }
                client = window.supabase.createClient('https://mhfbtltgwibwmsudsuvf.supabase.co',
                    'sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN');
            }
            client.auth.onAuthStateChange((event, session) => {
                const next = session?.user?.id || null;
                if (next !== identity || event === 'SIGNED_OUT') {
                    ++revision; identity = next; clearTheme();
                }
                // Le chiamate Auth devono avvenire fuori dal callback Supabase.
                setTimeout(refresh, 0);
            });
            document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
            window.addEventListener('pageshow', event => {
                if (event.persisted) { ++revision; identity = null; clearTheme(); refresh(); }
            });
            refresh();
        } catch (_) { clearTheme(); }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
