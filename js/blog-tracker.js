// ── Blog conversions tracker (fire-and-forget) ──────────────────
// Logs conversion events into public.blog_conversions.
// Pseudonimo by-design: usa visitor_id/session_id già creati da page-view-tracker.
// Failures are silent. Espone window.trackBlogConversion(kind, slug, regione).
(function () {
    if (typeof window === 'undefined') return;
    if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_ANON_KEY === 'undefined') return;

    function _ids() {
        var v = null, s = null;
        try { v = localStorage.getItem('_visitor_id'); } catch (_) {}
        try { s = sessionStorage.getItem('_session_id'); } catch (_) {}
        return { v: v, s: s };
    }

    window.trackBlogConversion = function (kind, slug, regione) {
        try {
            if (!kind) return;
            if (navigator && navigator.webdriver === true) return;
            var ids = _ids();
            var body = JSON.stringify({
                kind:       String(kind).slice(0, 40),
                post_slug:  slug    ? String(slug).slice(0, 120)    : null,
                regione:    regione ? String(regione).slice(0, 60) : null,
                visitor_id: ids.v,
                session_id: ids.s
            });
            fetch(SUPABASE_URL + '/rest/v1/blog_conversions', {
                method: 'POST',
                headers: {
                    'Content-Type':  'application/json',
                    'apikey':        SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
                    'Prefer':        'return=minimal'
                },
                body: body,
                keepalive: true
            }).catch(function () {});
        } catch (_) {}
    };
})();
