// Gli avvisi richiedono il normale account del sito. Nessuna iscrizione con la sola email.
(function () {
    const style = document.createElement('style');
    style.textContent = '#authOverlay.bando-auth{overflow-y:auto;align-items:flex-start}#authOverlay.bando-auth>div{margin:auto}';
    document.head.appendChild(style);
    window.bindBandoAlertForm = function (formId, messageId, regione, source) {
        const form = document.getElementById(formId);
        const message = document.getElementById(messageId);
        const button = form?.querySelector('button[type="submit"]');
        if (!form || !message || !button || !regione) return;
        let busy = false;

        function feedback(text, success = false) {
            message.textContent = text;
            message.className = 'mt-3 text-xs font-bold ' + (success ? 'text-emerald-600' : 'text-red-600');
        }

        function label(session) {
            if (!busy) button.textContent = session?.user ? 'Attiva avvisi' : 'Registrati e attiva avvisi';
        }
        _supabase.auth.getSession().then(({ data }) => label(data?.session)).catch(() => {});
        _supabase.auth.onAuthStateChange((_event, session) => label(session));

        async function activate() {
            try {
                const { data, error } = await _supabase.auth.getSession();
                if (error || !data?.session?.access_token) throw new Error('Accedi al sito per attivare gli avvisi.');
                const response = await fetch(SUPABASE_URL + '/functions/v1/subscribe-bando-alert', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', apikey: SUPABASE_ANON_KEY,
                        Authorization: 'Bearer ' + data.session.access_token },
                    body: JSON.stringify({ regione, source,
                        visitor_id: (() => { try { return localStorage.getItem('_visitor_id'); } catch (_) { return null; } })(),
                        session_id: (() => { try { return sessionStorage.getItem('_session_id'); } catch (_) { return null; } })() })
                });
                const result = await response.json().catch(() => ({}));
                if (!response.ok || !result.success) throw new Error(result.error || 'Avvisi non attivati. Riprova.');
                feedback(result.already_subscribed
                    ? 'Gli avvisi per ' + regione + ' sono già attivi sul tuo account.'
                    : 'Avvisi per ' + regione + ' attivati sul tuo account.', true);
            } catch (error) {
                feedback(error.message || 'Errore di connessione. Riprova.');
            } finally {
                busy = false;
                button.disabled = false;
                _supabase.auth.getSession().then(({ data }) => label(data?.session)).catch(() => {});
            }
        }

        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            if (busy) return;
            busy = true;
            button.disabled = true;
            message.classList.add('hidden');
            try {
                const { data, error } = await _supabase.auth.getSession();
                if (error) throw error;
                if (data?.session?.user) return await activate();

                const previous = window.__onLoginSuccess;
                let observer;
                const afterLogin = function () {
                    observer?.disconnect();
                    document.getElementById('authOverlay')?.classList.remove('bando-auth');
                    return activate();
                };
                window.__onLoginSuccess = afterLogin;
                openAuthModal('register', 'Per ricevere gli avvisi per ' + regione + ', registrati o accedi al sito.', 'blog_promo');
                // Chiudere il modulo annulla la richiesta: un accesso successivo non attiva avvisi per errore.
                const overlay = document.getElementById('authOverlay');
                overlay.classList.add('bando-auth');
                observer = new MutationObserver(function () {
                    if (!overlay.classList.contains('hidden')) return;
                    observer.disconnect();
                    overlay.classList.remove('bando-auth');
                    if (window.__onLoginSuccess === afterLogin) {
                        window.__onLoginSuccess = previous;
                        busy = false;
                        button.disabled = false;
                    }
                });
                observer.observe(overlay, { attributes: true, attributeFilter: ['class'] });
            } catch (_) {
                busy = false;
                button.disabled = false;
                feedback('Impossibile aprire la registrazione. Riprova.');
            }
        });
    };
})();
