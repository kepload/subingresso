(function (global) {
    'use strict';
    const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const CATEGORIES = { tradizionale: 'Fiera tradizionale', artigianato: 'Artigianato e mostre mercato', sagra: 'Sagra o festa', espositiva: 'Fiera espositiva', mercatino: 'Mercatino' };
    const HOME = [0, 0, 660, 730];
    const normalize = text => String(text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    function intervalMonths(from, to) {
        if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || from > 12 || to < 1 || to > 12) return [];
        const result = [from];
        while (result[result.length - 1] !== to) result.push(result[result.length - 1] % 12 + 1);
        return result;
    }
    function filterEvents(events, state, ignoreMonths) {
        const words = normalize(state.query).split(' ').filter(Boolean);
        return events.filter(event => (!state.region || event.region === state.region) && (!state.category || event.category === state.category)
            && (ignoreMonths || !state.months.length || event.months.some(month => state.months.includes(month)))
            && words.every(word => normalize([event.name, event.city, event.region, event.province, event.venue, event.sectors].join(' ')).includes(word)));
    }
    // Projection shared by the boundaries and municipality coordinates.
    function project(lng, lat) {
        const mercator = value => Math.log(Math.tan(Math.PI / 4 + value * Math.PI / 360));
        return [50 + (lng - 6.5) * 46, 25 + (mercator(47.2) - mercator(lat)) * 2500];
    }
    function clusterEvents(events, threshold) {
        const groups = [];
        for (const event of events) {
            const point = project(event.lng, event.lat);
            const group = groups.find(item => Math.hypot(item.x - point[0], item.y - point[1]) <= threshold);
            if (group) {
                const count = group.events.length;
                group.x = (group.x * count + point[0]) / (count + 1);
                group.y = (group.y * count + point[1]) / (count + 1);
                group.events.push(event);
            } else groups.push({ x: point[0], y: point[1], events: [event] });
        }
        return groups;
    }
    function todayInRome() {
        const parts = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
        const part = type => parts.find(item => item.type === type).value;
        return part('year') + '-' + part('month') + '-' + part('day');
    }
    function dateLabel(value) {
        return new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value + 'T12:00:00'));
    }
    function editionLabel(edition) {
        if (!edition.start) return edition.label + ' · calendario ' + edition.year;
        if (edition.periodOnly) return 'Periodo: ' + dateLabel(edition.start) + ' – ' + dateLabel(edition.end) + ' · giorni da verificare';
        return edition.start === edition.end ? dateLabel(edition.start) : dateLabel(edition.start) + ' – ' + dateLabel(edition.end);
    }
    function selectEdition(event, today = todayInRome()) {
        const editions = event.editions || [];
        const next = editions.filter(e => e.start && e.end >= today).sort((a, b) => a.start.localeCompare(b.start));
        if (next.length) return next[0];
        const undated = editions.filter(e => !e.start && e.year >= Number(today.slice(0, 4))).sort((a, b) => a.year - b.year);
        if (undated.length) return undated[0];
        return editions.slice().sort((a, b) => b.year - a.year || (b.start || '').localeCompare(a.start || ''))[0] || null;
    }
    function editionStatus(edition, today = todayInRome()) {
        if (edition.periodOnly) return 'Appuntamenti periodici · calendario ' + edition.year + (edition.end < today ? ' · periodo concluso' : '');
        if (!edition.start) return 'Calendario ' + edition.year + ' · data esatta da verificare';
        if (edition.end < today) return 'Edizione conclusa';
        const source = edition.dateType === 'calendar' ? 'Da calendario' : 'Date pubblicate';
        return source + (edition.start <= today ? ' · periodo in corso' : '');
    }
    function deadlineStatus(participation, today = todayInRome()) {
        if (!participation.deadline) return participation.deadlineLabel || '';
        return (participation.deadline < today ? 'Termine scaduto: ' : 'Scadenza pubblicata: ') + dateLabel(participation.deadline)
            + (participation.deadlineLabel ? ' · ' + participation.deadlineLabel : '');
    }
    const api = { MONTHS, CATEGORIES, intervalMonths, filterEvents, project, clusterEvents, editionLabel, selectEdition, editionStatus, deadlineStatus };
    global.FiereCalendar = api;
    if (typeof document === 'undefined') return;

    const $ = id => document.getElementById(id);
    const state = { events: [], regions: null, region: '', category: '', months: [], query: '', visible: 12, selected: '', view: HOME.slice(), ready: false };
    let searchTimer;
    function node(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }
    function svgNode(tag, attrs) {
        const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
        for (const [key, value] of Object.entries(attrs || {})) element.setAttribute(key, value);
        return element;
    }
    function activate(element, callback) {
        element.addEventListener('click', callback);
        element.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback(); }
        });
    }
    function periodLabel(event) {
        if (event.months.length === 12) return 'Tutto l’anno · appuntamenti periodici';
        return event.months.map(month => MONTHS[month - 1]).join(' / ');
    }
    function selectedMonthsLabel() {
        return !state.months.length || state.months.length === 12 ? 'Tutto l’anno' : state.months.map(month => MONTHS[month - 1]).join(', ');
    }
    function sortEvents(events) {
        if (!state.months.length || state.months.length === 12) {
            const today = todayInRome();
            const rank = event => {
                const edition = selectEdition(event, today);
                if (!edition) return [2, ''];
                if (edition.periodOnly && edition.end >= today) return [1, ''];
                if (edition.start && edition.end >= today) return [0, edition.start];
                if (!edition.start && edition.year >= Number(today.slice(0, 4))) return [1, ''];
                return [3, ''];
            };
            return events.slice().sort((a, b) => {
                const ra = rank(a), rb = rank(b);
                return ra[0] - rb[0] || ra[1].localeCompare(rb[1]) || a.name.localeCompare(b.name, 'it') || a.city.localeCompare(b.city, 'it');
            });
        }
        const orderedMonths = state.months.length ? state.months : intervalMonths(1, 12);
        const first = event => Math.min(...event.months.map(month => orderedMonths.indexOf(month)).filter(index => index >= 0));
        return events.slice().sort((a, b) => first(a) - first(b) || a.name.localeCompare(b.name, 'it') || a.city.localeCompare(b.city, 'it'));
    }
    function syncURL() {
        const url = new URL(location.href);
        for (const key of ['mesi', 'regione', 'tipo', 'q']) url.searchParams.delete(key);
        if (state.months.length) url.searchParams.set('mesi', state.months.join(','));
        if (state.region) url.searchParams.set('regione', state.region);
        if (state.category) url.searchParams.set('tipo', state.category);
        if (state.query) url.searchParams.set('q', state.query);
        history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
    function readURL() {
        const params = new URLSearchParams(location.search);
        state.months = [...new Set((params.get('mesi') || '').split(',').map(Number).filter(n => Number.isInteger(n) && n >= 1 && n <= 12))];
        state.region = [...$('region-filter').options].some(option => option.value === params.get('regione')) ? params.get('regione') || '' : '';
        state.category = Object.hasOwn(CATEGORIES, params.get('tipo')) ? params.get('tipo') : '';
        state.query = (params.get('q') || '').slice(0, 100);
        $('region-filter').value = state.region;
        $('type-filter').value = state.category;
        $('fair-search').value = state.query;
    }
    function renderMonths() {
        const pool = filterEvents(state.events, state, true);
        $('all-months').setAttribute('aria-pressed', String(state.months.length === 12));
        $('all-months').setAttribute('aria-label', state.months.length === 12 ? 'Deseleziona tutti i mesi' : 'Seleziona tutti i mesi');
        for (const button of $('month-bar').children) {
            const month = Number(button.dataset.month);
            button.setAttribute('aria-pressed', String(state.months.includes(month)));
            const count = pool.filter(event => event.months.includes(month)).length;
            button.setAttribute('aria-label', MONTHS[month - 1] + ', ' + count + ' eventi');
        }
    }
    function renderList(events) {
        const fragment = document.createDocumentFragment();
        for (const event of events.slice(0, state.visible)) {
            const card = node('article', 'fiere-card');
            card.dataset.eventId = event.id;
            const head = node('div', 'fiere-card-head');
            const edition = selectEdition(event);
            head.append(node('h3', '', event.name), node('span', 'fiere-card-indicative', edition ? editionStatus(edition) : 'Periodo indicativo'));
            const category = node('span', 'fiere-tag', CATEGORIES[event.category]);
            category.dataset.category = event.category;
            const button = node('button', 'fiere-card-button', 'Apri scheda ↗');
            button.type = 'button';
            button.setAttribute('aria-label', 'Apri scheda: ' + event.name + ', ' + event.city);
            button.addEventListener('click', () => openDetail(event));
            const foot = node('div', 'fiere-card-foot');
            foot.append(category, button);
            card.append(head, node('p', '', event.city + ' · ' + event.region), node('p', 'fiere-card-period', edition ? editionLabel(edition) : periodLabel(event)), foot);
            fragment.append(card);
        }
        $('fair-list').replaceChildren(fragment);
        $('fair-list').setAttribute('aria-busy', 'false');
        $('empty-results').hidden = events.length > 0 || !state.ready;
        $('load-more').hidden = state.visible >= events.length;
        $('list-count').textContent = String(events.length);
    }
    function polygons(feature) { return feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates; }
    function drawRegions() {
        const fragment = document.createDocumentFragment();
        for (const feature of state.regions.features) {
            const region = feature.properties.name;
            const d = polygons(feature).map(polygon => polygon.map(ring => ring.map((point, i) => {
                const projected = project(point[0], point[1]);
                return (i === 0 ? 'M' : 'L') + projected.map(n => n.toFixed(2)).join(',');
            }).join(' ') + ' Z').join(' ')).join(' ');
            const path = svgNode('path', { d, class: 'fiere-region', 'data-region': region, role: 'button', tabindex: '0', 'aria-label': 'Mostra le fiere in ' + region, 'fill-rule': 'evenodd' });
            const title = svgNode('title'); title.textContent = region; path.append(title);
            activate(path, () => { state.region = region; $('region-filter').value = region; changed(true); });
            fragment.append(path);
        }
        $('map-regions').replaceChildren(fragment);
    }
    function fitRegion() {
        const feature = state.regions?.features.find(item => item.properties.name === state.region);
        if (!feature) { state.view = HOME.slice(); return; }
        const points = polygons(feature).flat(2).map(point => project(...point));
        const minX = Math.min(...points.map(p => p[0])), maxX = Math.max(...points.map(p => p[0]));
        const minY = Math.min(...points.map(p => p[1])), maxY = Math.max(...points.map(p => p[1]));
        const width = Math.max(maxX - minX + 55, (maxY - minY + 55) * HOME[2] / HOME[3]);
        const height = width * HOME[3] / HOME[2];
        state.view = [(minX + maxX - width) / 2, (minY + maxY - height) / 2, width, height];
    }
    function renderMap(events) {
        $('italy-map').setAttribute('viewBox', state.view.join(' '));
        for (const path of $('map-regions').children) path.classList.toggle('is-selected', path.dataset.region === state.region);
        // Convert screen pixels to the SVG coordinate system to keep markers tappable on zoom.
        const scale = Math.max(state.view[2] / Math.max($('italy-map').clientWidth, 1), state.view[3] / Math.max($('italy-map').clientHeight, 1));
        const groups = clusterEvents(events, 20 * scale);
        const fragment = document.createDocumentFragment();
        for (const group of groups) {
            const cities = [...new Set(group.events.map(event => event.city))];
            const label = group.events.length + (group.events.length === 1 ? ' evento' : ' eventi') + ' · ' + cities.join(', ');
            const marker = svgNode('g', { class: 'fiere-marker', transform: 'translate(' + group.x + ',' + group.y + ')', role: 'button', tabindex: '0', 'aria-label': label, 'data-events': group.events.map(event => event.id).join(',') });
            marker.append(svgNode('circle', { r: 20 * scale, fill: 'transparent' }));
            marker.append(svgNode('circle', { r: (group.events.length > 1 ? 11 : 7) * scale, class: 'pin pin-' + (group.events.length > 1 ? 'cluster' : group.events[0].category) }));
            if (group.events.length > 1) {
                const text = svgNode('text', { 'font-size': 10 * scale, style: 'font-size:' + 10 * scale + 'px' });
                text.textContent = String(group.events.length); marker.append(text);
            }
            if (group.events.some(event => event.id === state.selected)) marker.append(svgNode('circle', { r: 15 * scale, class: 'selection-ring' }));
            const title = svgNode('title'); title.textContent = group.events.map(event => event.name + ' (' + event.city + ')').join('\n'); marker.append(title);
            activate(marker, () => openPopup(group));
            fragment.append(marker);
        }
        $('map-markers').replaceChildren(fragment);
        $('map-caption').textContent = 'Tocca un puntino';
        $('map-zoom-in').disabled = state.view[2] <= 90;
        $('map-zoom-out').disabled = state.view[2] >= HOME[2];
    }
    function openPopup(group) {
        const cities = [...new Set(group.events.map(event => event.city))];
        $('popup-title').textContent = cities.length === 1 ? cities[0] + ' · ' + group.events.length + ' eventi' : group.events.length + ' eventi nella zona';
        const fragment = document.createDocumentFragment();
        for (const event of sortEvents(group.events)) {
            const button = node('button', 'fiere-popup-event', event.name + ' ↗');
            button.type = 'button';
            button.append(node('span', '', event.city + ' · ' + periodLabel(event)));
            button.addEventListener('click', () => openDetail(event));
            fragment.append(button);
        }
        $('popup-events').replaceChildren(fragment);
        $('map-popup').hidden = false;
        $('close-popup').focus({ preventScroll: true });
    }
    function openDetail(event) {
        state.selected = event.id;
        renderMap(filterEvents(state.events, state));
        $('detail-category').textContent = CATEGORIES[event.category];
        $('detail-category').dataset.category = event.category;
        $('detail-title').textContent = event.name;
        $('detail-location').textContent = event.city + ' · ' + event.region;
        $('detail-months').textContent = periodLabel(event);
        $('detail-frequency').textContent = event.frequencyNote || '';
        $('detail-frequency').hidden = !event.frequencyNote;
        $('detail-description').textContent = event.summary || '';
        $('detail-description').hidden = !event.summary;
        const editions = document.createDocumentFragment();
        for (const edition of event.editions || []) {
            const item = node('div', 'fiere-edition');
            item.append(node('strong', '', editionLabel(edition)), node('p', '', editionStatus(edition)));
            const source = node('a', '', 'Fonte delle date ↗');
            source.href = edition.sourceUrl; source.target = '_blank'; source.rel = 'noopener noreferrer';
            item.append(source); editions.append(item);
        }
        $('detail-editions').replaceChildren(editions);
        $('detail-editions-empty').hidden = Boolean(event.editions?.length);
        const facts = document.createDocumentFragment();
        for (const [label, value] of [['Luogo', event.venue], ['Organizzatore', event.organizer], ['Orari indicati dalla fonte', event.hours], ['Settori', event.sectors], ['Posteggi dichiarati', event.stallCount ? event.stallCount + ' · ' + (event.stallCountNote || 'organico della manifestazione, non posti liberi') : '']]) {
            if (!value) continue;
            facts.append(node('dt', '', label), node('dd', '', value));
        }
        $('detail-facts').replaceChildren(facts);
        const participation = event.participation;
        const labels = { public: 'Fiera su area pubblica', selected: 'Ammissione tramite organizzatore', exhibitors: 'Partecipazione come espositore', check: 'Condizioni da verificare' };
        $('detail-participation-label').textContent = labels[participation.type];
        $('detail-participation-note').textContent = participation.note;
        $('detail-deadline').textContent = deadlineStatus(participation);
        $('detail-deadline').hidden = !$('detail-deadline').textContent;
        $('detail-costs').textContent = participation.costs || '';
        $('detail-costs').hidden = !participation.costs;
        $('detail-participation-link').hidden = !participation.url;
        if (participation.url) $('detail-participation-link').href = participation.url;
        const contacts = document.createDocumentFragment();
        for (const [type, value] of Object.entries(event.contacts || {})) {
            if (!['phone', 'email', 'pec'].includes(type) || !value) continue;
            const contact = node('p', '');
            contact.append(node('span', '', ({ phone: 'Telefono', email: 'Email', pec: 'PEC' })[type] + ': '));
            const link = node('a', '', value);
            link.href = type === 'phone' ? 'tel:' + value.replace(/[^\d+]/g, '') : 'mailto:' + value;
            contact.append(link); contacts.append(contact);
        }
        $('detail-contacts').replaceChildren(contacts);
        $('detail-source').href = event.source.url;
        $('detail-source-label').textContent = event.source.label + (event.source.checkedAt ? ' · consultata il ' + dateLabel(event.source.checkedAt) : ' · date dell’edizione da verificare');
        $('detail-calendar-source').hidden = !event.calendarSource || event.calendarSource.url === event.source.url;
        if (event.calendarSource) { $('detail-calendar-source').href = event.calendarSource.url; $('detail-calendar-source').textContent = event.calendarSource.label + ' ↗'; }
        $('detail-annunci').href = '/annunci?regione=' + encodeURIComponent(event.region);
        $('fair-dialog').showModal();
    }
    function render() {
        const events = sortEvents(filterEvents(state.events, state));
        renderMonths(); renderList(events); renderMap(events);
        $('results-summary').textContent = events.length + (events.length === 1 ? ' evento' : ' eventi') + ' · ' + (state.region || 'Tutta Italia') + ' · ' + selectedMonthsLabel();
        const extraCount = Number(Boolean(state.category)) + Number(Boolean(state.query));
        $('extra-filter-count').textContent = String(extraCount);
        $('extra-filter-count').hidden = !extraCount;
        $('extra-filters').querySelector('summary').setAttribute('aria-label', 'Altri filtri' + (extraCount ? ', ' + extraCount + ' attivi' : ''));
        syncURL();
    }
    function changed(refit) {
        state.visible = 12; state.selected = ''; $('map-popup').hidden = true;
        if (refit) fitRegion();
        if (state.ready) render();
    }
    function reset() {
        clearTimeout(searchTimer);
        Object.assign(state, { region: '', category: '', months: [], query: '', selected: '', view: HOME.slice(), visible: 12 });
        for (const id of ['region-filter', 'type-filter', 'fair-search', 'month-from', 'month-to']) $(id).value = '';
        changed(false);
    }
    async function fetchJSON(url) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        try {
            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) throw new Error('HTTP ' + response.status);
            return await response.json();
        } finally { clearTimeout(timer); }
    }
    async function loadCatalog() {
        $('retry-catalog').disabled = true;
        $('catalog-error').hidden = true;
        $('fair-list').setAttribute('aria-busy', 'true');
        try {
            const data = await fetchJSON('/data/fiere.json?v=3');
            if (!Array.isArray(data.events) || !data.events.length || !data.events.every(event => typeof event.id === 'string'
                && typeof event.name === 'string' && Array.isArray(event.months) && event.months.length
                && event.months.every(month => Number.isInteger(month) && month >= 1 && month <= 12)
                && Number.isFinite(event.lat) && Number.isFinite(event.lng) && Object.hasOwn(CATEGORIES, event.category)
                && typeof event.source?.url === 'string' && /^https:\/\//.test(event.source.url)
                && event.participation && Array.isArray(event.editions))) throw new Error('Invalid catalog');
            state.events = data.events;
            $('catalog-count').textContent = String(state.events.length);
            $('catalog-info').textContent = data.eventsWithEditionData + ' schede con edizioni da fonti ufficiali · aggiornato il ' + dateLabel(data.catalogUpdatedAt);
            const previous = state.region;
            $('region-filter').replaceChildren(node('option', '', 'Tutta Italia'));
            $('region-filter').firstChild.value = '';
            for (const region of [...new Set(state.events.map(event => event.region))].sort((a, b) => a.localeCompare(b, 'it'))) {
                const option = node('option', '', region); option.value = region; $('region-filter').append(option);
            }
            if (!state.ready) readURL(); else { state.region = previous; $('region-filter').value = previous; }
            state.ready = true; fitRegion(); render();
        } catch (error) {
            $('catalog-error').hidden = false;
            $('fair-list').setAttribute('aria-busy', 'false');
            $('results-summary').textContent = 'Calendario non disponibile. Riprova per caricare gli eventi.';
        } finally { $('retry-catalog').disabled = false; }
    }
    async function loadMap() {
        $('retry-map').disabled = true; $('map-error').hidden = true;
        try {
            const data = await fetchJSON('/data/italia-regioni.json?v=1');
            if (!Array.isArray(data.features) || data.features.length !== 20) throw new Error('Invalid boundaries');
            state.regions = data; drawRegions(); fitRegion();
            renderMap(filterEvents(state.events, state));
        } catch (error) { $('map-error').hidden = false; }
        finally { $('retry-map').disabled = false; }
    }
    function zoom(factor) {
        const width = Math.max(90, Math.min(HOME[2], state.view[2] * factor));
        const height = width * HOME[3] / HOME[2];
        state.view = [state.view[0] + (state.view[2] - width) / 2, state.view[1] + (state.view[3] - height) / 2, width, height];
        $('map-popup').hidden = true; renderMap(filterEvents(state.events, state));
    }
    function init() {
        for (let i = 0; i < 12; i++) {
            const button = node('button', 'fiere-month'); button.type = 'button'; button.dataset.month = String(i + 1);
            button.setAttribute('aria-pressed', 'false'); button.append(node('strong', '', MONTHS[i]));
            button.addEventListener('click', () => {
                const month = i + 1;
                state.months = state.months.includes(month) ? state.months.filter(item => item !== month) : [...state.months, month].sort((a, b) => a - b);
                $('month-from').value = ''; $('month-to').value = ''; changed(false);
            });
            $('month-bar').append(button);
            for (const id of ['month-from', 'month-to']) { const option = node('option', '', MONTHS[i]); option.value = String(i + 1); $(id).append(option); }
        }
        for (const id of ['month-from', 'month-to']) $(id).addEventListener('change', () => {
            const from = Number($('month-from').value), to = Number($('month-to').value);
            if (!from || !to) return;
            state.months = intervalMonths(from, to); changed(false);
        });
        $('all-months').addEventListener('click', () => { state.months = state.months.length === 12 ? [] : intervalMonths(1, 12); $('month-from').value = ''; $('month-to').value = ''; changed(false); });
        $('region-filter').addEventListener('change', () => { state.region = $('region-filter').value; changed(true); });
        $('type-filter').addEventListener('change', () => { state.category = $('type-filter').value; changed(false); });
        $('fair-search').addEventListener('input', () => {
            state.query = $('fair-search').value;
            clearTimeout(searchTimer); searchTimer = setTimeout(() => changed(false), 100);
        });
        for (const id of ['reset-filters', 'empty-reset']) $(id).addEventListener('click', reset);
        $('load-more').addEventListener('click', () => { state.visible += 12; renderList(sortEvents(filterEvents(state.events, state))); });
        $('close-popup').addEventListener('click', () => { $('map-popup').hidden = true; });
        $('map-zoom-in').addEventListener('click', () => zoom(0.7));
        $('map-zoom-out').addEventListener('click', () => zoom(1 / 0.7));
        $('map-home').addEventListener('click', () => { state.view = HOME.slice(); $('map-popup').hidden = true; renderMap(filterEvents(state.events, state)); });
        $('close-detail').addEventListener('click', () => $('fair-dialog').close());
        $('fair-dialog').addEventListener('click', event => { if (event.target === $('fair-dialog')) {
            const rect = $('fair-dialog').getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) $('fair-dialog').close();
        } });
        $('retry-catalog').addEventListener('click', loadCatalog);
        $('retry-map').addEventListener('click', loadMap);
        let resizeTimer;
        window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { if (state.ready) renderMap(filterEvents(state.events, state)); }, 100); });
        loadCatalog(); loadMap();
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})(typeof window !== 'undefined' ? window : globalThis);
