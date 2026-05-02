// ── Page view tracker (fire-and-forget) ─────────────────────────
// Logs 1 page view per (visitor, path, session) into public.page_views.
// Runs site-wide. Failures are silent and never block the page.
(function () {
    if (typeof window === 'undefined') return;
    if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') return;

    function _track() {
        try {
            if (navigator && navigator.webdriver === true) return;
            var path = (location.pathname || '/').replace(/\/+$/, '') || '/';
            if (path.length > 200) path = path.slice(0, 200);

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

            var ref = null;
            try {
                if (document.referrer && document.referrer.indexOf(location.host) === -1) {
                    ref = String(document.referrer).slice(0, 250);
                }
            } catch (_) {}

            var body = JSON.stringify({
                path: path,
                visitor_id: visitorId,
                session_id: sessionId,
                referrer: ref
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
