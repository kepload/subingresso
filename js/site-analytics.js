// Eventi definiti, contesto minimo, coda limitata: nessun contenuto dei moduli.
(function () {
    'use strict';
    if (window.SiteAnalytics || navigator.webdriver === true || typeof SUPABASE_URL === 'undefined') return;
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const names = new Set('page_enter page_engagement page_leave search_results publish_start publish_step publish_error publish_resume publish_attempt publish_success photo_select photo_error auth_open auth_tab auth_attempt auth_error auth_success signup_success auth_confirmation valuation_start valuation_step valuation_error valuation_result valuation_save fair_search fair_open fair_source fair_save fair_reminder blog_read cta_click listing_open listing_contact listing_save message_sent vetrina_action technical_error'.split(' '));
    const numeric = new Set('step results radius rank photos http_status visible_seconds elapsed_seconds scroll_percent month_from month_to days_mask price_min_band price_max_band area_band'.split(' '));
    const booleans = new Set('has_query empty resumed success saved reminder needs_confirmation'.split(' '));
    const tokens = new Set('region province place field error_code action target target_entity placement offer market category tier'.split(' '));
    let queue = [], sending = 0, timer, token = '', ready = false, owner = null, epoch = 0, sequence = 0;
    let session = crypto.randomUUID(), started = performance.now(), visibleAt = document.hidden ? null : performance.now(), visibleMs = 0, maxScroll = 0;
    const recent = new Map(), checkpoints = new Set();
    try { const old = sessionStorage.getItem('_session_id'); if (uuid.test(old || '')) session = old; else sessionStorage.setItem('_session_id', session); } catch (_) {}
    function pageName(value) {
        try {
            const p = new URL(value || location.href, location.origin).pathname.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
            if (p === '/' || p === '/index') return 'home';
            if (/^\/annuncio$/.test(p)) return 'listing';
            if (/^\/annunci(?:\/|$)/.test(p)) return 'search';
            if (/^\/vendi$/.test(p)) return 'publish';
            if (/^\/fiere\//.test(p)) return 'fair';
            if (/^\/fiere$/.test(p)) return 'fairs';
            if (/^\/evento$/.test(p)) return 'event';
            if (/^\/(blog|blog-template|bandi)(?:\/|$)/.test(p)) return 'blog';
            if (/^\/valutatore$/.test(p)) return 'valuation';
            if (/^\/(dashboard|organizzatore|le-mie-ads|profilo)$/.test(p)) return 'dashboard';
            if (/^\/messaggi$/.test(p)) return 'messages';
            if (/^\/reset-password$/.test(p)) return 'auth';
        } catch (_) {}
        return 'other';
    }
    const page = pageName();
    function entity() {
        const u = new URL(location.href), parts = u.pathname.split('/').filter(Boolean);
        const value = ['listing','event'].includes(page) ? u.searchParams.get('id') : page === 'blog' ? u.searchParams.get('post') || parts[1] : page === 'fair' ? parts[1] : null;
        return /^[a-z0-9][a-z0-9-]{0,119}$/.test(value || '') ? value : null;
    }
    function source() {
        try { if (!document.referrer) return 'direct'; const r = new URL(document.referrer); return r.origin === location.origin ? pageName(r.href) : 'external'; } catch (_) { return 'direct'; }
    }
    function errorCode(error) {
        const status = Number(error?.status || error?.statusCode || 0), code = String(error?.code || error?.name || '').toLowerCase();
        if (status === 401) return 'unauthorized'; if (status === 403) return 'forbidden'; if (status === 429) return 'rate_limit';
        if (status >= 500) return 'server'; if (/timeout|abort/.test(code)) return 'timeout';
        if (/photo|upload/.test(code)) return 'upload'; if (/storage|quota/.test(code)) return 'storage';
        if (/invalid.*credentials/.test(code)) return 'credentials'; if (/confirm/.test(code)) return 'confirmation';
        if (error instanceof TypeError || /network|fetch/.test(code)) return 'network'; return 'unknown';
    }
    function track(name, data = {}, targetEntity) {
        try {
            if (!names.has(name) || navigator.webdriver === true || queue.length >= 100) return;
            const clean = {};
            for (const [k, v] of Object.entries(data)) {
                if (numeric.has(k) && Number.isFinite(v) && v >= 0) clean[k] = Math.min(1000000, Math.round(v));
                else if (booleans.has(k) && typeof v === 'boolean') clean[k] = v;
                else if (tokens.has(k) && typeof v === 'string' && v.length <= 100) clean[k] = v;
            }
            const key = name + ':' + (targetEntity || '') + ':' + JSON.stringify(clean), now = performance.now();
            if (now - (recent.get(key) ?? -10000) < 1000) return;
            recent.set(key, now); if (recent.size > 300) recent.delete(recent.keys().next().value);
            const acq = window.getAcquisitionContext?.() || {};
            let channel = acq.utm_source || ''; try { if (!channel && acq.referrer) channel = new URL(acq.referrer).hostname; } catch (_) {}
            queue.push({ id: crypto.randomUUID(), session_id: session, name, page, entity: targetEntity || entity(), device: innerWidth <= 767 ? 'mobile' : innerWidth <= 1024 ? 'tablet' : 'desktop', source: source(), entry_page: pageName(acq.landing_path), campaign: acq.utm_campaign || null, medium: acq.utm_medium || null, channel: channel || null, data: clean });
            if (!timer) timer = setTimeout(flush, 800);
        } catch (_) { /* La misura non interferisce mai con la funzione usata. */ }
    }
    async function flush(exiting = false) {
        clearTimeout(timer); timer = null;
        if (sending && !exiting || !ready || !queue.length) return;
        const batch = queue.splice(0, 20), current = epoch;
        sending++;
        try {
            const response = await fetch(SUPABASE_URL + '/rest/v1/rpc/track_site_events', { method: 'POST', headers: { apikey: SUPABASE_ANON_KEY, Authorization: 'Bearer ' + (token || SUPABASE_ANON_KEY), 'Content-Type': 'application/json' }, body: JSON.stringify({ p_events: batch }), keepalive: true, signal: AbortSignal.timeout(6000) });
            if (!response.ok && response.status >= 500) throw new Error('retry');
            for (const item of batch) retryCount.delete(item.id);
        } catch (_) {
            if (current === epoch) for (const item of batch.reverse()) { const tries = retryCount.get(item.id) || 0; if (tries < 2 && queue.length < 100) { retryCount.set(item.id, tries + 1); queue.unshift(item); } }
        } finally { sending--; if (queue.length && current === epoch && !timer) timer = setTimeout(flush, 1500); }
    }
    const retryCount = new Map();
    function credentials(value) {
        const next = value?.user?.id || null;
        if (owner && owner !== next) { epoch++; queue = []; recent.clear(); retryCount.clear(); session = crypto.randomUUID(); }
        owner = next; token = value?.access_token || ''; ready = true; flush();
    }
    function bucket(value, size) { return Number.isFinite(value) && value > 0 ? Math.min(1000, Math.ceil(value / size)) : 0; }
    window.SiteAnalytics = { track, flush, pageName, errorCode, bucket };
    function placement(link) { return link.closest('header') ? 'header' : link.closest('footer') ? 'footer' : link.closest('#relatedGrid,#relatedSection') ? 'similar' : link.closest('[data-listing-id],[data-id]') ? 'card' : 'body'; }
    document.addEventListener('click', event => {
        const link = event.target.closest('a[href]'); if (!link) return;
        try {
            const url = new URL(link.href, location.origin); if (url.origin !== location.origin) return;
            const target = pageName(url.href); if (target === 'other' || target === page && target !== 'listing') return;
            const id = url.searchParams.get('id');
            track('cta_click', { target, placement: placement(link), ...(uuid.test(id || '') ? {target_entity:id} : {}) });
        } catch (_) {}
    }, { capture: true });
    function visibility() { if (visibleAt !== null) visibleMs += performance.now() - visibleAt; visibleAt = document.hidden ? null : performance.now(); }
    function progress() { const length = document.documentElement.scrollHeight - innerHeight; maxScroll = Math.max(maxScroll, length > 0 ? Math.min(100, Math.round(scrollY / length * 100)) : 100); }
    function engagement(final) {
        progress(); const seconds = Math.min(86400, Math.round((visibleMs + (visibleAt === null ? 0 : performance.now() - visibleAt)) / 1000));
        const data = { visible_seconds: seconds, elapsed_seconds: Math.min(86400, Math.round((performance.now() - started) / 1000)), scroll_percent: maxScroll };
        if (final) track('page_leave', data);
        else if (seconds >= 15 && !checkpoints.has(Math.floor(seconds / 15))) { checkpoints.add(Math.floor(seconds / 15)); if (checkpoints.size <= 20) track(page === 'blog' ? 'blog_read' : 'page_engagement', data); }
    }
    document.addEventListener('visibilitychange', () => { visibility(); if (document.hidden) { engagement(false); flush(true); } });
    window.addEventListener('pagehide', () => { engagement(true); flush(true); });
    window.addEventListener('pageshow', event => { if (event.persisted) { started = performance.now(); visibleMs = 0; visibleAt = document.hidden ? null : performance.now(); checkpoints.clear(); track('page_enter', { resumed: true }); } });
    window.addEventListener('error', event => { if (event.target?.src?.startsWith(location.origin)) track('technical_error', { error_code: 'resource' }); else if (event.error) track('technical_error', { error_code: 'javascript' }); }, true);
    window.addEventListener('unhandledrejection', event => track('technical_error', { error_code: errorCode(event.reason) }));
    function init() {
        track('page_enter');
        if (typeof _supabase === 'undefined') return;
        try {
            // Differire il flush evita richieste RPC dentro il lock del callback Auth.
            _supabase.auth.onAuthStateChange((_event, value) => { const order = ++sequence; setTimeout(() => { if (order === sequence) credentials(value); }, 0); });
            const order = sequence;
            _supabase.auth.getSession().then(result => { if (!result.error && order === sequence) credentials(result.data?.session); }).catch(() => {});
        } catch (_) {}
        setInterval(() => { if (!document.hidden) engagement(false); }, 15000);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
