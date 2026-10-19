(function () {
    'use strict';
    const modal = document.getElementById('profiloModal');
    if (!modal) return;
    const track = document.getElementById('profileSwitch');
    const tabs = [...track.querySelectorAll('[role="tab"]')];
    const panels = { normal: document.getElementById('profileNormalPanel'), organizer: document.getElementById('profileOrganizerPanel') };
    const content = document.getElementById('profileOrganizerContent');
    const scroller = modal.querySelector('.profile-panels');
    const defaultStatus = document.getElementById('profileDefaultStatus');
    let userId = null, request = 0, returnFocus = null, baseline = null, gesture = null, suppressClickUntil = 0;
    const snapshot = () => JSON.stringify([...document.getElementById('profileForm').elements].filter(el => el.tagName === 'INPUT').map(el => el.type === 'checkbox' ? el.checked : el.value));
    const isOpen = () => !modal.classList.contains('hidden');
    const esc = value => EventData.esc(value);
    let dashboardUsed = false;
    const markDashboardUsed = () => { dashboardUsed = true; };
    document.addEventListener('pointerdown', markDashboardUsed, { once: true, capture: true });
    document.addEventListener('keydown', markDashboardUsed, { once: true, capture: true });

    async function activity(ownerId, signal) {
        const { data: { user }, error: authError } = await _supabase.auth.getUser();
        if (authError || !ownerId || user?.id !== ownerId) throw Error('Accesso richiesto');
        const [listings, workspace] = await Promise.all([
            _supabase.from('annunci').select('id', { count: 'exact', head: true })
                .eq('user_id', ownerId).eq('status', 'active')
                .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString()).abortSignal(signal),
            _supabase.rpc('organizer_workspace').abortSignal(signal)
        ]);
        if (listings.error || !Number.isInteger(listings.count) || workspace.error || !Array.isArray(workspace.data?.events)) throw Error('Dati non disponibili');
        const events = workspace.data.events.filter(event => event.status !== 'cancelled').length;
        return { mode: workspace.data.profile && events > listings.count ? 'organizer' : 'normal', workspace: workspace.data };
    }

    async function startDashboard(user) {
        userId = user?.id || null;
        const url = new URL(location.href);
        if (url.searchParams.get('area') === 'normale') {
            url.searchParams.delete('area');
            history.replaceState(null, '', url.pathname + url.search + url.hash);
            return;
        }
        // Link a pagamenti, statistiche o profilo conservano la destinazione esplicita.
        if (url.search || url.hash || isOpen() || dashboardUsed) return;
        const current = ++request, ownerId = userId;
        const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 10000);
        try {
            const result = await activity(ownerId, controller.signal);
            if (current === request && userId === ownerId && !isOpen() && !dashboardUsed && result.mode === 'organizer') location.replace('/organizzatore');
        } catch (_) {
            // La dashboard normale resta utilizzabile anche senza il conteggio.
        } finally {
            clearTimeout(timer);
        }
    }

    function select(mode, focus = false, workspace = null) {
        const changed = track.dataset.selected !== mode;
        track.dataset.selected = mode;
        modal.dataset.profile = mode;
        document.getElementById('profileDialogTitle').textContent = mode === 'organizer' ? 'Profilo organizzatore' : 'Profilo ambulante';
        defaultStatus.hidden = true;
        track.removeAttribute('aria-busy');
        tabs.forEach(tab => {
            const selected = tab.dataset.profile === mode;
            tab.setAttribute('aria-selected', String(selected));
            tab.tabIndex = selected ? 0 : -1;
            if (selected && focus) tab.focus();
        });
        Object.entries(panels).forEach(([key, panel]) => { panel.hidden = key !== mode; });
        if (changed) scroller.scrollTop = 0;
        ++request;
        if (mode === 'organizer') loadOrganizer(workspace);
    }

    async function chooseDefault() {
        const current = ++request, ownerId = userId;
        const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 10000);
        defaultStatus.hidden = false;
        panels.normal.hidden = true;
        track.setAttribute('aria-busy', 'true');
        try {
            const result = await activity(ownerId, controller.signal);
            if (current !== request || userId !== ownerId || !isOpen()) return;
            select(result.mode, track.contains(document.activeElement), result.workspace);
        } catch (_) {
            if (current === request && userId === ownerId && isOpen()) select('normal', track.contains(document.activeElement));
        } finally {
            clearTimeout(timer);
        }
    }

    async function loadOrganizer(workspace = null) {
        const current = ++request, ownerId = userId, restoreFocus = content.contains(document.activeElement);
        const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 15000);
        content.setAttribute('aria-busy', 'true');
        content.innerHTML = '<p role="status">Caricamento del profilo organizzatore…</p>';
        try {
            if (!ownerId) throw Error('Accesso richiesto');
            const { data: { user }, error: authError } = await _supabase.auth.getUser();
            if (current !== request || !isOpen()) return;
            if (authError || user?.id !== ownerId) throw Error('Accesso richiesto');
            let result = { data: workspace };
            if (!workspace) {
                let query = _supabase.rpc('organizer_workspace');
                if (typeof query.abortSignal === 'function') query = query.abortSignal(controller.signal);
                result = await query;
            }
            const { data, error } = result;
            if (current !== request || userId !== ownerId || !isOpen()) return;
            if (error || !data || !Array.isArray(data.events)) throw Error('Profilo non disponibile');
            const profile = data.profile;
            const icon = '<div class="profile-organizer-icon" aria-hidden="true"><i class="fas fa-calendar-alt"></i></div>';
            if (!profile) {
                content.innerHTML = icon + '<h3>Organizzi fiere o mercatini?</h3><p>Usa lo stesso account: aggiungi i dati dell’organizzazione e i contatti per chi vuole partecipare.</p><p>Il profilo sarà controllato dall’amministratore. Dopo l’approvazione potrai creare i tuoi eventi.</p><a class="profile-organizer-primary" href="/organizzatore">Crea profilo organizzatore <span aria-hidden="true">→</span></a>';
                return;
            }
            const statuses = {
                approved: ['Approvato', 'Il tuo profilo è approvato. Puoi creare e gestire i tuoi eventi.'],
                pending: ['In revisione', 'Il tuo profilo è stato inviato. Troverai l’esito qui e nell’area organizzatore.'],
                rejected: ['Da correggere', 'Controlla le indicazioni dell’amministratore, aggiorna i dati e invia di nuovo il profilo.'],
                suspended: ['Sospeso', 'Il profilo e gli eventi non sono pubblici. Consulta le indicazioni dell’amministratore.']
            };
            const [label, description] = statuses[profile.status] || ['Da verificare', 'Apri l’area organizzatore per controllare il tuo profilo.'];
            content.innerHTML = icon + '<h3>' + esc(profile.organization_name) + '</h3><span class="profile-organizer-status" data-status="' + esc(profile.status) + '">' + label + '</span><p>' + description + '</p>' + (profile.review_note ? '<p class="profile-organizer-note">' + esc(profile.review_note) + '</p>' : '') + '<a class="profile-organizer-primary" href="/organizzatore">' + (profile.status === 'rejected' ? 'Correggi il profilo' : 'Gestisci profilo ed eventi') + ' <span aria-hidden="true">→</span></a>' + (profile.status === 'approved' ? '<a class="profile-organizer-secondary" href="/profilo?id=' + encodeURIComponent(ownerId) + '">Vedi il profilo pubblico</a>' : '');
        } catch (_) {
            if (current !== request || userId !== ownerId || !isOpen()) return;
            content.innerHTML = '<h3>Profilo non disponibile</h3><p>Non riesco a caricare le informazioni. Riprova tra poco.</p><button type="button" class="profile-organizer-primary" data-profile-retry>Riprova</button><a class="profile-organizer-secondary" href="/organizzatore">Apri l’area organizzatore</a>';
        } finally {
            clearTimeout(timer);
            if (current === request) {
                content.setAttribute('aria-busy', 'false');
                if (restoreFocus) content.querySelector('button,a')?.focus();
            }
        }
    }

    track.addEventListener('click', event => {
        if (performance.now() < suppressClickUntil) { event.preventDefault(); return; }
        const tab = event.target.closest('[data-profile]');
        if (tab) select(tab.dataset.profile, true);
    });
    track.addEventListener('keydown', event => {
        const index = tabs.indexOf(document.activeElement);
        if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + 2) % 2;
        select(tabs[next].dataset.profile, true);
    });
    track.addEventListener('pointerdown', event => {
        if (event.pointerType === 'touch' && event.isPrimary) gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    });
    track.addEventListener('pointercancel', () => { gesture = null; });
    track.addEventListener('pointerup', event => {
        if (!gesture || event.pointerId !== gesture.id) return;
        const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
        gesture = null;
        if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            event.preventDefault();
            suppressClickUntil = performance.now() + 400;
            select(dx > 0 ? 'organizer' : 'normal', true);
        }
    });
    content.addEventListener('click', event => {
        if (event.target.closest('[data-profile-retry]')) loadOrganizer();
        if (event.target.closest('a') && baseline !== null && baseline !== snapshot() && !window.confirm('Hai modifiche al profilo ambulante non salvate. Vuoi uscire senza salvarle?')) event.preventDefault();
    });
    modal.addEventListener('keydown', event => {
        if (!isOpen()) return;
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeProfiloModal(); return; }
        if (event.key !== 'Tab') return;
        const focusable = [...modal.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(el => !el.disabled && el.tabIndex >= 0 && el.getClientRects().length);
        const index = focusable.indexOf(document.activeElement);
        if ((event.shiftKey && index <= 0) || (!event.shiftKey && (index < 0 || index === focusable.length - 1))) {
            event.preventDefault();
            (event.shiftKey ? focusable.at(-1) : focusable[0])?.focus();
        }
    });
    _supabase.auth.onAuthStateChange((_event, session) => {
        if (!userId || session?.user?.id === userId) return;
        closeProfiloModal();
        userId = null;
    });
    window.ProfileSwitcher = {
        startDashboard,
        open(user, mode = null) {
            userId = user?.id || null;
            const opener = document.activeElement;
            returnFocus = opener && opener !== document.body && opener !== document.documentElement && !modal.contains(opener) ? opener : document.querySelector('.dashboard-user button');
            select(mode === 'organizer' ? 'organizer' : 'normal');
            scroller.scrollTop = 0;
            tabs[mode === 'organizer' ? 1 : 0].focus();
            if (!mode) chooseDefault();
        },
        close() {
            ++request;
            content.replaceChildren();
            content.removeAttribute('aria-busy');
            if (returnFocus?.isConnected) returnFocus.focus();
            returnFocus = null;
            gesture = null;
        },
        snapshot,
        viewToken: () => request,
        setBaseline(saved = snapshot()) { baseline = saved; }
    };
})();
