// Classifica pubblica aggregata e ultima località separata per account, solo nel browser.
(() => {
    'use strict';
    const prefix = '_si_last_location_v1:';
    const nav = document.getElementById('homeLocationShortcuts');
    let userId = null;
    let popular = [];
    let authRevision = 0;
    let lastRefresh = 0;
    let loading = false;
    const key = place => JSON.stringify([place.nome, place.regione, place.provincia]);
    const valid = place => place && typeof place.id === 'string' && /^(\d{6}|geonames:\d+)$/.test(place.id)
        && ['nome', 'regione', 'provincia'].every(field => typeof place[field] === 'string' && place[field].length > 0 && place[field].length <= 200);

    function recent() {
        if (!userId) return null;
        try {
            const value = JSON.parse(localStorage.getItem(prefix + userId));
            return valid(value) ? value : null;
        } catch (_) { return null; }
    }

    function render() {
        if (!nav) return;
        const last = recent();
        const places = [last, ...popular].filter(Boolean).filter((place, index, all) => all.findIndex(item => key(item) === key(place)) === index).slice(0, 3);
        const links = places.map(place => {
            const a = document.createElement('a');
            a.href = '/annunci?' + new URLSearchParams({ q: place.nome, comune: place.id });
            a.textContent = place.nome;
            a.title = `${place.nome} · ${place.provincia}`;
            if (place === last) {
                a.title = 'La tua ultima ricerca: ' + a.title;
                a.setAttribute('aria-label', place.nome + ', la tua ultima ricerca');
                const icon = document.createElement('i');
                icon.className = 'fas fa-history'; icon.setAttribute('aria-hidden', 'true');
                a.prepend(icon);
            }
            return a;
        });
        nav.replaceChildren(...links);
        nav.hidden = links.length === 0;
    }

    async function remember(place) {
        if (!valid(place)) return;
        const revision = authRevision;
        try {
            const { data, error } = await _supabase.auth.getSession();
            const id = data?.session?.user?.id;
            if (error || !id || revision !== authRevision) return;
            const value = { id: place.id, nome: place.nome, regione: place.regione, provincia: place.provincia };
            localStorage.setItem(prefix + id, JSON.stringify(value));
            userId = id;
            render();
        } catch (_) { /* La ricerca funziona anche con memoria del browser bloccata. */ }
    }

    async function refresh() {
        if (!nav || loading) return;
        loading = true;
        try {
            const { data, error } = await _supabase.rpc('home_top_location_searches');
            if (error || !Array.isArray(data)) return;
            const locations = await ComuniItaliani.load();
            popular = data.map(item => locations.find(place => place.nome === item.name && place.regione === item.regione && place.provincia === item.provincia)).filter(valid);
            lastRefresh = Date.now();
            render();
        } catch (_) { /* Non presentare località inventate come ricerche popolari. */ }
        finally { loading = false; }
    }

    window.LocationShortcuts = { remember };
    try {
        _supabase.auth.onAuthStateChange((_event, session) => {
            authRevision++;
            userId = session?.user?.id || null;
            render();
        });
        const revision = authRevision;
        _supabase.auth.getSession().then(({ data, error }) => {
            if (error || revision !== authRevision) return;
            userId = data?.session?.user?.id || null;
            render();
        }).catch(() => {});
    } catch (_) {}
    if (nav) {
        refresh();
        window.addEventListener('storage', event => { if (!event.key || event.key === prefix + userId) render(); });
        window.addEventListener('pageshow', render);
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && Date.now() - lastRefresh > 300000) refresh();
        });
    }
})();
