// Shared by the calendar dialogs and the fair pages reached from search engines.
(function () {
    'use strict';
    let signedIn = false, account = null, operation = 0, activeAuth = null, authRevision = 0;
    const fallback = (id, url) => '/fiere?fiera=' + encodeURIComponent(id) + '&fonte=' + encodeURIComponent(url);
    const session = async () => {
        if (typeof _supabase === 'undefined') throw new Error('Accesso non disponibile. Ricarica la pagina e riprova.');
        const result = await _supabase.auth.getSession();
        if (result.error) throw new Error('Impossibile verificare l’accesso. Riprova tra poco.');
        return result.data?.session;
    };
    function refresh(value) {
        authRevision++;
        if (account && account !== value?.user?.id) operation++;
        account = value?.user?.id || null;
        signedIn = Boolean(value?.user);
        document.querySelectorAll('[data-fiere-guest]').forEach(element => { element.hidden = signedIn; });
    }
    function prepare(container, id) {
        container.dataset.fiereId = id;
        container.querySelectorAll('a').forEach(link => {
            const url = link.getAttribute('href') || '';
            delete link.dataset.fiereSource;
            delete link.dataset.fiereId;
            if (!/^https:\/\//i.test(url)) return;
            // Organizer events point to an internal page, not an editorial source.
            if (['https://subingresso.it', location.origin].includes(new URL(url).origin)) return;
            link.dataset.fiereSource = url;
            link.dataset.fiereId = id;
            link.href = fallback(id, url);
            link.removeAttribute('target');
        });
    }
    function feedback(text, trigger) {
        const root = trigger?.closest('dialog, main') || document.querySelector('main');
        if (!root) return;
        let message = root.querySelector('[data-fiere-feedback]');
        if (!message) {
            message = document.createElement('p');
            message.className = 'fiere-access-feedback';
            message.dataset.fiereFeedback = '';
            message.setAttribute('role', 'status');
            (trigger?.parentElement || root).append(message);
        }
        message.textContent = text;
        message.hidden = !text;
    }
    function signup(tab, request, trigger) {
        if (typeof window.openAuthModal !== 'function') {
            feedback('Accesso non disponibile. Ricarica la pagina e riprova.', trigger);
            return;
        }
        const dialogs = [...document.querySelectorAll('dialog[open]')];
        dialogs.forEach(dialog => dialog.close());
        const restore = () => {
            dialogs.forEach(dialog => { if (dialog.isConnected && !dialog.open) dialog.showModal(); });
            if (trigger?.isConnected) trigger.focus({ preventScroll: true });
        };
        const callback = () => {
            activeAuth = null;
            restore();
            session().then(refresh).catch(() => {});
            if (request?.callback) request.callback();
            else if (request) openSource(request, trigger);
        };
        activeAuth = { callback, restore };
        window.__onLoginSuccess = callback;
        window.openAuthModal(tab, request?.context || (request
            ? 'Registrati gratis o accedi per consultare la fonte e verificare come partecipare. Dopo l’accesso apriamo la fonte che hai scelto.'
            : 'Registrati gratis per vedere come partecipare alle fiere. Puoi anche salvarle e scegliere un promemoria via email.'), 'direct');
        // The site's auth modal is outside the native fair dialog's top layer.
        const overlay = document.getElementById('authOverlay');
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-label', 'Accesso a Subingresso.it');
        const observer = new MutationObserver(() => {
            if (!overlay.classList.contains('hidden')) return;
            observer.disconnect();
            if (activeAuth?.callback !== callback) return;
            activeAuth = null;
            if (window.__onLoginSuccess === callback) window.__onLoginSuccess = null;
            restore();
        });
        observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
        document.getElementById(tab === 'login' ? 'loginEmail' : 'regNome')?.focus();
    }
    async function openSource(request, trigger, popup = null) {
        const current = ++operation;
        try {
            feedback('', trigger);
            trigger?.setAttribute('aria-busy', 'true');
            const value = await session();
            if (current !== operation) { popup?.close(); return; }
            refresh(value);
            if (!value?.access_token || !value.user) {
                popup?.close();
                signup('register', request, trigger);
                return;
            }
            const response = await fetch('/api/fiere-source', {
                method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + value.access_token },
                body: JSON.stringify(request), signal: AbortSignal.timeout(12000)
            });
            if (current !== operation) { popup?.close(); return; }
            if (response.status === 401) {
                popup?.close();
                refresh(null);
                signup('login', request, trigger);
                return;
            }
            const result = await response.json();
            if (!response.ok || result.url !== request.url || !/^https:\/\//i.test(result.url)) {
                throw new Error(result.error || 'Fonte non disponibile. Riprova tra poco.');
            }
            window.SiteAnalytics?.track('fair_source', {success: true}, request.id);
            if (popup && !popup.closed) popup.location.replace(result.url);
            else location.assign(result.url);
        } catch (error) {
            popup?.close();
            feedback(error.name === 'TimeoutError' ? 'La verifica sta impiegando troppo tempo. Riprova.' : error.message || 'Connessione non disponibile. Riprova.', trigger);
        } finally { trigger?.removeAttribute('aria-busy'); }
    }
    document.addEventListener('click', event => {
        const trigger = event.target.closest('a[data-fiere-source], [data-fiere-register], [data-fiere-login]');
        if (!trigger) return;
        event.preventDefault();
        if (trigger.getAttribute('aria-busy') === 'true') return;
        if (trigger.hasAttribute('data-fiere-source')) {
            let popup = null;
            if (signedIn) {
                popup = window.open('about:blank', '_blank');
                if (popup) popup.opener = null;
            }
            openSource({ id: trigger.dataset.fiereId, url: trigger.dataset.fiereSource }, trigger, popup);
        } else signup(trigger.hasAttribute('data-fiere-login') ? 'login' : 'register', null, trigger);
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && activeAuth) { event.preventDefault(); window.closeAuthModal(); }
        if (event.key === 'Tab' && activeAuth) {
            const controls = [...document.querySelectorAll('#authOverlay button, #authOverlay input, #authOverlay a[href]')].filter(element => !element.disabled && element.tabIndex >= 0 && element.getClientRects().length);
            const first = controls[0], last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        }
    });
    function init() {
        // Guest invitations start hidden in the HTML, including while auth is loading.
        // A late initial read must not undo a newer login/logout event.
        const revision = authRevision;
        session().then(value => { if (revision === authRevision) refresh(value); }).catch(() => {});
        try {
            _supabase.auth.onAuthStateChange((_event, value) => {
                // A pending response must never open a source after logout/account change.
                refresh(value);
            });
        } catch (_) { /* Authentication unavailable: source clicks fail closed. */ }
        const query = new URLSearchParams(location.search);
        if (query.has('iscrizione')) signup('register', null, document.querySelector('[data-fiere-register]'));
    }
    window.FiereAccess = { prepare, fallback, authenticate(callback, trigger, context) { signup('register', { callback, context }, trigger); }, resume(event) {
        const query = new URLSearchParams(location.search), url = query.get('fonte');
        if (query.get('fiera') !== event.id || !url || !/^https:\/\//i.test(url)) return;
        query.delete('fiera'); query.delete('fonte');
        history.replaceState(null, '', location.pathname + (query.size ? '?' + query : '') + location.hash);
        const trigger = document.querySelector('#detail-source');
        openSource({ id: event.id, url }, trigger);
    } };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
