// Preferenza personale dell'account; chiaro finche non si sceglie esplicitamente scuro.
(function () {
    'use strict';
    let client, identity = null, revision = 0, accountVersion = 0, sheet;
    let preference = 'light', ready = false, saving = null;
    const root = document.documentElement;
    const authKey = 'sb-mhfbtltgwibwmsudsuvf-auth-token';
    const preferenceKey = '_si_theme_preference_v1';
    root.dataset.adminThemePage = (location.pathname.split('/').filter(Boolean)[0] || 'index').replace(/\.html$/, '');
    let originalThemeColor, originalColor, themeColor;
    const normalize = value => value === 'dark' ? 'dark' : 'light';
    function storedJSON(key) {
        try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; }
    }

    // Eseguito nel head, prima del primo disegno. La cache riguarda solo
    // l'aspetto ed e valida esclusivamente per l'identita della sessione locale.
    try {
        const session = storedJSON(authKey);
        const cached = storedJSON(preferenceKey);
        if (session?.user?.id && session.access_token && session.refresh_token) {
            identity = session.user.id;
            const confirmed = cached?.id === identity && ['light', 'dark'].includes(cached.theme);
            preference = normalize(confirmed ? cached.theme : session.user.user_metadata?.site_theme);
            root.classList.toggle('admin-dark', preference === 'dark');
            // Primo accesso dopo l'aggiornamento: attendere la preferenza evita
            // il flash anche se i metadati della vecchia sessione sono obsoleti.
            if (!confirmed) root.classList.add('theme-pending');
        } else localStorage.removeItem(preferenceKey);
    } catch (_) {}

    function remember() {
        try {
            if (identity) localStorage.setItem(preferenceKey, JSON.stringify({ id: identity, theme: preference }));
            else localStorage.removeItem(preferenceKey);
        } catch (_) {}
    }

    function finishInitialTheme() { root.classList.remove('theme-pending'); }

    function controls(message) {
        const button = document.getElementById('profileThemePreference');
        if (button) {
            button.setAttribute('aria-pressed', String(preference === 'dark'));
            button.disabled = !ready || !!saving;
            button.setAttribute('aria-busy', String(!!saving));
            const state = button.querySelector('[data-theme-state]');
            if (state) state.textContent = preference === 'dark' ? 'Attiva' : 'Disattivata';
        }
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
        try { localStorage.removeItem(preferenceKey); } catch (_) {}
        applyTheme('light'); finishInitialTheme(); controls('');
    }

    function loadStyles() {
        if (sheet) return sheet;
        sheet = new Promise((resolve, reject) => {
            const existing = document.querySelector('link[href*="/css/admin-theme.css"]');
            if (existing?.sheet) { resolve(); return; }
            existing?.remove();
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/admin-theme.css?v=4';
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
            const { data: userData, error: userError } = await Promise.race([
                client.auth.getUser(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Tempo scaduto')), 15000))
            ]);
            if (request !== revision || saving) return;
            const user = userData?.user;
            if (userError) {
                if ([401, 403].includes(userError.status)) { resetIdentity(null); return; }
                throw new Error('Sessione non disponibile');
            }
            if (!user || user.id !== identity) { resetIdentity(null); return; }
            const next = normalize(user.user_metadata?.site_theme);
            if (next === 'dark') await loadStyles();
            if (request !== revision || saving) return;
            preference = next; ready = true;
            remember(); applyTheme(next); finishInitialTheme(); controls('');
        } catch (_) {
            if (request === revision && !saving) {
                ready = false;
                applyTheme(preference); finishInitialTheme(); controls('Aspetto non disponibile. Ricarica per riprovare.');
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
            remember(); applyTheme(value); controls('Aspetto salvato nel tuo account.');
            // Segnale per le altre schede; nessun ruolo o token aggiuntivo.
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
        originalThemeColor = document.querySelector('meta[name="theme-color"]');
        originalColor = originalThemeColor?.content;
        themeColor = originalThemeColor;
        const button = document.getElementById('profileThemePreference');
        button?.addEventListener('click', () => setPreference(preference === 'dark' ? 'light' : 'dark'));
        controls();
        try {
            if (typeof _supabase !== 'undefined') client = _supabase;
            else {
                if (!localStorage.getItem(authKey)) { finishInitialTheme(); return; }
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
                if (event.key === authKey || event.key === null) {
                    try {
                        const next = JSON.parse(localStorage.getItem(authKey))?.user?.id || null;
                        if (next !== identity) { ++revision; resetIdentity(next); }
                    } catch (_) { ++revision; resetIdentity(null); }
                }
                if (event.key === authKey || event.key === '_si_theme_changed' || event.key === null) refresh();
            });
            window.addEventListener('pageshow', event => {
                if (event.persisted) refresh();
            });
            refresh();
        } catch (_) { resetIdentity(null); }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
