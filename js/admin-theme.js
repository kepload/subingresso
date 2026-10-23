// Preferenza personale dell'account; chiaro finche non si sceglie esplicitamente scuro.
(function () {
    'use strict';
    let client, identity = null, revision = 0, accountVersion = 0, sheet;
    let preference = 'light', ready = false, saving = null;
    const root = document.documentElement;
    const authKey = 'sb-mhfbtltgwibwmsudsuvf-auth-token';
    root.dataset.adminThemePage = (location.pathname.split('/').filter(Boolean)[0] || 'index').replace(/\.html$/, '');
    const originalThemeColor = document.querySelector('meta[name="theme-color"]');
    const originalColor = originalThemeColor?.content;
    let themeColor = originalThemeColor;
    const normalize = value => value === 'dark' ? 'dark' : 'light';

    function controls(message) {
        const select = document.getElementById('profileThemePreference');
        if (select) { select.value = preference; select.disabled = !ready || !!saving; }
        const status = document.getElementById('profileThemeStatus');
        if (status && message !== undefined) status.textContent = message;
    }

    function applyTheme(value) {
        const dark = value === 'dark';
        root.classList.toggle('admin-dark', dark);
        if (!dark) {
            if (originalThemeColor) originalThemeColor.content = originalColor;
            else { themeColor?.remove(); themeColor = null; }
        } else {
            if (!themeColor) {
                themeColor = document.createElement('meta');
                themeColor.name = 'theme-color';
                document.head.append(themeColor);
            }
            themeColor.content = '#0b1220';
        }
    }

    function resetIdentity(next) {
        ++accountVersion;
        identity = next;
        preference = 'light'; ready = false; saving = null;
        applyTheme('light'); controls('');
    }

    function loadStyles() {
        if (sheet) return sheet;
        sheet = new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/admin-theme.css?v=3';
            link.onload = resolve;
            link.onerror = () => { link.remove(); sheet = null; reject(new Error('Tema non disponibile')); };
            document.head.append(link);
        });
        return sheet;
    }

    async function refresh() {
        if (saving) return;
        const request = ++revision;
        try {
            const { data: sessionData, error: sessionError } = await client.auth.getSession();
            if (request !== revision || saving) return;
            const sessionUser = sessionData?.session?.user;
            if (sessionError || !sessionUser) { resetIdentity(null); return; }
            if (identity !== sessionUser.id) resetIdentity(sessionUser.id);
            const { data: userData, error: userError } = await client.auth.getUser();
            if (request !== revision || saving) return;
            const user = userData?.user;
            if (userError || !user || user.id !== identity) throw new Error('Sessione non disponibile');
            const next = normalize(user.user_metadata?.site_theme);
            if (next === 'dark') await loadStyles();
            if (request !== revision || saving) return;
            preference = next; ready = true;
            applyTheme(next); controls('');
        } catch (_) {
            if (request === revision && !saving) {
                preference = 'light'; ready = false;
                applyTheme('light'); controls('Aspetto non disponibile. Ricarica per riprovare.');
            }
        }
    }

    async function setPreference(value) {
        if (!client || !ready || saving || !['light', 'dark'].includes(value)) { controls(); return false; }
        if (value === preference) { controls(); return true; }
        const operation = { owner: identity, version: accountVersion };
        const current = () => saving === operation && identity === operation.owner && accountVersion === operation.version;
        saving = operation; ++revision;
        controls('Salvataggio dell’aspetto…');
        try {
            // Caricare prima il CSS evita di salvare un tema che non si puo mostrare.
            if (value === 'dark') await loadStyles();
            if (!current()) return false;
            const { data: sessionData, error: sessionError } = await client.auth.getSession();
            if (!current()) return false;
            const session = sessionData?.session;
            if (sessionError || session?.user?.id !== operation.owner) throw new Error('Sessione cambiata');
            // Token esplicito: un cambio account non sposta la scrittura su altri utenti.
            const { data: userData, error: userError } = await client.auth.getUser(session.access_token);
            if (!current()) return false;
            if (userError || userData?.user?.id !== operation.owner) throw new Error('Sessione non valida');
            const response = await fetch('https://mhfbtltgwibwmsudsuvf.supabase.co/auth/v1/user', {
                method: 'PUT',
                headers: {
                    apikey: 'sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN',
                    Authorization: 'Bearer ' + session.access_token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ data: { site_theme: value } }),
                signal: AbortSignal.timeout(15000)
            });
            if (!response.ok) throw new Error('Salvataggio non riuscito');
            const user = await response.json();
            if (!current()) return false;
            if (user.id !== operation.owner || user.user_metadata?.site_theme !== value) throw new Error('Conferma non valida');
            preference = value;
            applyTheme(value); controls('Aspetto salvato nel tuo account.');
            // Solo invalidazione: nessun ruolo, tema o token in cache aggiuntive.
            try { localStorage.setItem('_si_theme_changed', JSON.stringify({ id: operation.owner, at: Date.now() })); } catch (_) {}
            return true;
        } catch (_) {
            if (current()) controls('Impossibile salvare l’aspetto. Riprova.');
            return false;
        } finally {
            if (current()) { saving = null; controls(); }
        }
    }

    window.SiteTheme = { refresh, setPreference };

    async function start() {
        const select = document.getElementById('profileThemePreference');
        select?.addEventListener('change', () => setPreference(select.value));
        controls();
        try {
            if (typeof _supabase !== 'undefined') client = _supabase;
            else {
                if (!localStorage.getItem(authKey)) return;
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
                if (next !== identity || event === 'SIGNED_OUT') { ++revision; resetIdentity(next); }
                // Le chiamate Auth devono avvenire fuori dal callback Supabase.
                setTimeout(refresh, 0);
            });
            document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
            window.addEventListener('storage', event => {
                if (event.key === authKey || event.key === '_si_theme_changed' || event.key === null) refresh();
            });
            window.addEventListener('pageshow', event => {
                if (event.persisted) { ++revision; resetIdentity(null); refresh(); }
            });
            refresh();
        } catch (_) { resetIdentity(null); }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
