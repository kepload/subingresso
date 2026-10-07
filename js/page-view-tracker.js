// ── Page view tracker (fire-and-forget) ─────────────────────────
// Logs 1 page view per (visitor, path, session) into public.page_views.
// Runs site-wide. Failures are silent and never block the page.
(function () {
    if (typeof window === 'undefined') return;
    if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') return;

    // Riusa il contesto della sessione: solo percorsi pubblici e codici campagna,
    // mai query complete, token o dati inseriti nei moduli.
    function cleanPath(value) {
        var url = new URL(value || '/', location.origin);
        var path = url.pathname.replace(/\/+$/, '').replace(/\.html$/, '') || '/';
        if (path === '/index') path = '/';
        if (path === '/blog' || path === '/blog-template') {
            path = '/blog';
            var slug = (url.searchParams.get('post') || '').toLowerCase().match(/^[a-z0-9-]{1,120}/);
            if (slug) path += '/' + slug[0];
        }
        // Le altre query (anche id di annunci e token di reset) sono escluse.
        return path.slice(0, 200);
    }
    function campaign(value) {
        var text = String(value || '').toLowerCase();
        return /^[a-z0-9_-]{1,80}$/.test(text) ? text : '';
    }
    function externalOrigin(value) {
        try {
            var url = new URL(value);
            var ownHost = location.hostname.toLowerCase().replace(/^www\./, '');
            if (!/^https?:$/.test(url.protocol) || url.hostname.toLowerCase().replace(/^www\./, '') === ownHost) return '';
            return url.origin.slice(0, 250);
        } catch (_) { return ''; }
    }
    var memoryContext;
    window.getAcquisitionContext = function () {
        if (memoryContext) return memoryContext;
        var params = new URLSearchParams(location.search);
        var context = {
            landing_path: cleanPath(location.href),
            referrer: externalOrigin(document.referrer),
            utm_source: campaign(params.get('utm_source')),
            utm_medium: campaign(params.get('utm_medium')),
            utm_campaign: campaign(params.get('utm_campaign'))
        };
        try {
            if (sessionStorage.getItem('_acq_captured')) {
                context.landing_path = cleanPath(sessionStorage.getItem('_acq_landing_path') || location.href);
                context.referrer = externalOrigin(sessionStorage.getItem('_acq_referrer'));
                ['utm_source', 'utm_medium', 'utm_campaign'].forEach(function (key) {
                    context[key] = campaign(sessionStorage.getItem('_acq_' + key));
                });
            }
            Object.keys(context).forEach(function (key) { sessionStorage.setItem('_acq_' + key, context[key]); });
            sessionStorage.setItem('_acq_captured', '1');
        } catch (_) {}
        memoryContext = context;
        return context;
    };
    window.getAcquisitionContext();

    function _track() {
        try {
            if (navigator && navigator.webdriver === true) return;
            var path = cleanPath(location.href);
            var acquisition = window.getAcquisitionContext();

            var dedupKey = '_pv_' + path;
            if (sessionStorage.getItem(dedupKey) === '1') return;
            sessionStorage.setItem(dedupKey, '1');

            var visitorId = localStorage.getItem('_visitor_id');
            if (!visitorId) {
                visitorId = (window.crypto && crypto.randomUUID)
                    ? crypto.randomUUID()
                    : (Date.now().toString(36) + Math.random().toString(36).slice(2, 12));
                localStorage.setItem('_visitor_id', visitorId);
            }
            var sessionId = sessionStorage.getItem('_session_id');
            if (!sessionId) {
                sessionId = (window.crypto && crypto.randomUUID)
                    ? crypto.randomUUID()
                    : (Date.now().toString(36) + Math.random().toString(36).slice(2, 12));
                sessionStorage.setItem('_session_id', sessionId);
            }

            var body = JSON.stringify({
                path: path,
                visitor_id: visitorId,
                session_id: sessionId,
                referrer: acquisition.referrer || null,
                utm_source: acquisition.utm_source || null,
                utm_campaign: acquisition.utm_campaign || null
            });

            fetch(SUPABASE_URL + '/rest/v1/page_views', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                    'Prefer': 'return=minimal'
                },
                body: body,
                keepalive: true
            }).then(function (response) {
                if (!response.ok) sessionStorage.removeItem(dedupKey);
            }).catch(function () {
                try { sessionStorage.removeItem(dedupKey); } catch (_) {}
            });
        } catch (_) {}
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(_track, 0);
    } else {
        window.addEventListener('DOMContentLoaded', function () { setTimeout(_track, 0); }, { once: true });
    }
})();
