// ============================================================
//  Subingresso.it — Configurazione Supabase
// ============================================================

const SUPABASE_URL      = 'https://mhfbtltgwibwmsudsuvf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Iq_aEMAdzRnu9sig32B4WQ_bmez4bgN';

// Inizializzazione client reale
const _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Identity for measurement only. Product actions never depend on this result.
(() => {
    const marker = '_analytics_internal', cookie = 'si_internal_analytics';
    let cached = null, pending = null, revision = 0;
    function readMarker() { try { return localStorage.getItem(marker) === '1'; } catch (_) { return document.cookie.split(';').some(x => x.trim() === cookie + '=1'); } }
    function mark(value) {
        try { value ? localStorage.setItem(marker, '1') : localStorage.removeItem(marker); } catch (_) {}
        document.cookie = cookie + '=' + (value ? '1' : '') + '; Path=/; Max-Age=' + (value ? '31536000' : '0') + '; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    }
    function ids(rotate = false) {
        const get = (storage, key) => { let value = storage.getItem(key); if (rotate || !value) { value = crypto.randomUUID(); storage.setItem(key, value); } return value; };
        try {
            const visitor = get(localStorage, '_visitor_id'), session = get(sessionStorage, '_session_id');
            if (rotate) { sessionStorage.removeItem('_amo_session'); for (const key of Object.keys(sessionStorage)) if (key.startsWith('_pv_')) sessionStorage.removeItem(key); }
            return { p_visitor: visitor, p_session: session, p_auth_session: sessionStorage.getItem('_amo_session') };
        } catch (_) { return {}; }
    }
    async function resolve() {
        const order = revision;
        try {
            const result = await _supabase.auth.getSession();
            if (order !== revision) return { allowed: false, token: '', userId: null };
            if (result.error) return { allowed: false, token: '', userId: null };
            const session = result.data?.session;
            if (!session?.user?.id) return cached = { allowed: !readMarker(), token: '', userId: null };
            const response = await _supabase.rpc('analytics_tracking_context', ids());
            if (order !== revision) return { allowed: false, token: '', userId: null };
            if (response.error || response.data?.user_id !== session.user.id || typeof response.data.excluded !== 'boolean') return { allowed: false, token: '', userId: null };
            const excluded = response.data.excluded;
            if (!excluded && readMarker()) ids(true);
            mark(excluded);
            return cached = { allowed: !excluded, token: session.access_token, userId: session.user.id };
        } catch (_) { return { allowed: false, token: '', userId: null }; }
    }
    function context() {
        if (cached) return Promise.resolve(cached);
        if (!pending) { const task = resolve(); pending = task; task.finally(() => { if (pending === task) pending = null; }); }
        return pending;
    }
    window.AnalyticsIdentity = { context, preview: () => readMarker() || cached?.allowed !== true };
    _supabase.auth.onAuthStateChange(() => { ++revision; cached = null; pending = null; setTimeout(context, 0); });
    setTimeout(context, 0);
})();
