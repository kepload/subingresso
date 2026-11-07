(function (global) {
    'use strict';
    const MONTHS = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
    const ROW = 44;
    const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
        && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
    const iso = (year, month, day) => String(year).padStart(4, '0') + '-' + String(month).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    const daysInMonth = (year, month) => new Date(Date.UTC(year, month, 0)).getUTCDate();
    function today() {
        const parts = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date());
        return ['year', 'month', 'day'].map(type => parts.find(p => p.type === type).value).join('-');
    }
    function addDays(value, count) {
        const date = new Date(value + 'T12:00:00Z');
        date.setUTCDate(date.getUTCDate() + count);
        return date.toISOString().slice(0, 10);
    }
    function preset(kind, reference = today()) {
        const [year, month, day] = reference.split('-').map(Number);
        if (kind === 'month') return [iso(year, month, 1), iso(year, month, daysInMonth(year, month))];
        const months = { 'three-months': 3, 'six-months': 6 }[kind];
        if (!months) return ['', ''];
        const end = new Date(Date.UTC(year, month - 1 + months, 1));
        const endYear = end.getUTCFullYear(), endMonth = end.getUTCMonth() + 1;
        return [reference, iso(endYear, endMonth, Math.min(day, daysInMonth(endYear, endMonth)))];
    }
    const label = value => new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(value + 'T12:00:00Z'));

    function create({ onChange }) {
        const $ = id => document.getElementById(id);
        const dialog = $('period-dialog');
        let saved = ['', ''], draft = [], active = 0, opener, wheels = [], frame;
        const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

        function wheel(element, onSelect) {
            let values = [], selected, timer, paintFrame, drag, dragged = false;
            const nearest = () => Math.max(0, Math.min(values.length - 1, Math.round(element.scrollTop / ROW)));
            function paint() {
                const position = element.scrollTop / ROW;
                for (let i = 0; i < element.children.length; i++) {
                    const distance = Math.min(3, Math.abs(i - position));
                    element.children[i].style.opacity = String(Math.max(.12, 1 - distance * .34));
                    element.children[i].style.transform = 'scale(' + (1 - distance * .045) + ')';
                }
            }
            function settle() {
                clearTimeout(timer);
                const index = nearest(), value = values[index];
                element.scrollTop = index * ROW;
                if (value !== selected) { selected = value; onSelect(value); }
                paint();
            }
            function go(index, smooth = true) {
                index = Math.max(0, Math.min(values.length - 1, index));
                element.scrollTo({ top: index * ROW, behavior: smooth && !reduced() ? 'smooth' : 'instant' });
                if (!smooth || reduced()) settle();
            }
            element.addEventListener('scroll', () => {
                cancelAnimationFrame(paintFrame); paintFrame = requestAnimationFrame(paint);
                clearTimeout(timer); timer = setTimeout(settle, 140);
            }, { passive: true });
            element.addEventListener('click', event => {
                if (dragged) { dragged = false; return; }
                const row = event.target.closest('[data-wheel-index]');
                if (row) go(Number(row.dataset.wheelIndex));
            });
            element.addEventListener('keydown', event => {
                const index = nearest();
                const next = { ArrowUp: index - 1, ArrowDown: index + 1, PageUp: index - 5, PageDown: index + 5, Home: 0, End: values.length - 1 }[event.key];
                if (next === undefined) return;
                event.preventDefault(); go(next, false);
            });
            // Touch uses the browser's own momentum. A mouse can drag, scroll or click.
            element.addEventListener('pointerdown', event => {
                if (event.pointerType !== 'mouse' || event.button !== 0) return;
                drag = { y: event.clientY, top: element.scrollTop, id: event.pointerId };
                dragged = false;
            });
            element.addEventListener('pointermove', event => {
                if (!drag) return;
                if (Math.abs(event.clientY - drag.y) < 4 && !dragged) return;
                dragged = true;
                element.setPointerCapture(drag.id);
                element.classList.add('is-dragging');
                element.style.scrollSnapType = 'none';
                element.scrollTop = drag.top + drag.y - event.clientY;
                event.preventDefault();
            });
            function release() {
                if (!drag) return;
                if (element.hasPointerCapture(drag.id)) element.releasePointerCapture(drag.id);
                drag = null; element.classList.remove('is-dragging'); element.style.scrollSnapType = '';
                if (dragged) settle();
            }
            element.addEventListener('pointerup', release);
            element.addEventListener('pointercancel', release);
            return {
                value: () => values[nearest()],
                flush: settle,
                stop() { clearTimeout(timer); cancelAnimationFrame(paintFrame); },
                set(items, value, text) {
                    clearTimeout(timer);
                    if (items.length !== values.length || items.some((item, i) => item !== values[i])) {
                        values = items;
                        const fragment = document.createDocumentFragment();
                        values.forEach((item, index) => {
                            const row = document.createElement('div');
                            row.className = 'fair-wheel-row'; row.dataset.wheelIndex = String(index);
                            row.setAttribute('aria-hidden', 'true'); row.textContent = text(item); fragment.append(row);
                        });
                        element.replaceChildren(fragment);
                    }
                    selected = value;
                    element.setAttribute('aria-valuemin', String(values[0]));
                    element.setAttribute('aria-valuemax', String(values[values.length - 1]));
                    element.setAttribute('aria-valuenow', String(value));
                    element.setAttribute('aria-valuetext', text(value));
                    element.scrollTop = Math.max(0, values.indexOf(value)) * ROW;
                    paint();
                }
            };
        }
        function syncTabs() {
            for (let i = 0; i < 2; i++) {
                const tab = $(i ? 'period-end' : 'period-start');
                tab.setAttribute('aria-selected', String(i === active)); tab.tabIndex = i === active ? 0 : -1;
                tab.querySelector('strong').textContent = label(draft[i]);
            }
            $('period-wheel-panel').setAttribute('aria-labelledby', active ? 'period-end' : 'period-start');
            const count = Math.round((Date.parse(draft[1]) - Date.parse(draft[0])) / 86400000) + 1;
            $('period-duration').textContent = count === 1 ? '1 giorno' : count.toLocaleString('it-IT') + ' giorni';
        }
        function syncWheels() {
            const [year, month, day] = draft[active].split('-').map(Number), current = Number(today().slice(0, 4));
            const years = draft.map(value => Number(value.slice(0, 4)));
            const first = Math.min(current - 5, ...years), last = Math.max(current + 10, ...years);
            wheels[0].set(Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1), day, String);
            wheels[1].set(Array.from({ length: 12 }, (_, i) => i + 1), month, value => MONTHS[value - 1]);
            wheels[2].set(Array.from({ length: last - first + 1 }, (_, i) => first + i), year, String);
            syncTabs();
        }
        function updateDate(unit, value) {
            const parts = draft[active].split('-').map(Number);
            parts[unit] = value;
            parts[2] = Math.min(parts[2], daysInMonth(parts[0], parts[1]));
            draft[active] = iso(...parts);
            if (draft[0] > draft[1]) draft[1 - active] = draft[active];
            syncWheels();
        }
        wheels = [wheel($('period-day'), value => updateDate(2, value)), wheel($('period-month'), value => updateDate(1, value)), wheel($('period-year'), value => updateDate(0, value))];
        function flush() {
            const day = wheels[0].value(), month = wheels[1].value(), year = wheels[2].value();
            draft[active] = iso(year, month, Math.min(day, daysInMonth(year, month)));
            if (draft[0] > draft[1]) draft[1 - active] = draft[active];
            syncWheels();
        }
        function open(index, trigger) {
            active = index; opener = trigger;
            draft = saved[0] ? saved.slice() : [today(), addDays(today(), 7)];
            dialog.showModal(); document.documentElement.classList.add('fair-period-open');
            syncWheels();
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => { syncWheels(); $(active ? 'period-end' : 'period-start').focus({ preventScroll: true }); });
        }
        function close() {
            cancelAnimationFrame(frame); wheels.forEach(item => item.stop());
            dialog.close(); document.documentElement.classList.remove('fair-period-open');
            opener?.focus({ preventScroll: true });
        }
        $('date-from').addEventListener('click', event => open(0, event.currentTarget));
        $('date-to').addEventListener('click', event => open(1, event.currentTarget));
        for (let i = 0; i < 2; i++) {
            const tab = $(i ? 'period-end' : 'period-start');
            tab.addEventListener('click', () => { flush(); active = i; syncWheels(); });
            tab.addEventListener('keydown', event => {
                if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault(); flush(); active = event.key === 'Home' ? 0 : event.key === 'End' ? 1 : 1 - active;
                syncWheels(); $(active ? 'period-end' : 'period-start').focus();
            });
        }
        $('period-close').addEventListener('click', close);
        dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
        dialog.addEventListener('click', event => {
            if (event.target !== dialog) return;
            const rect = dialog.getBoundingClientRect();
            if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
        });
        $('period-apply').addEventListener('click', () => { flush(); const range = draft.slice(); close(); onChange(...range); });
        document.querySelectorAll('[data-period]').forEach(button => button.addEventListener('click', () => {
            onChange(...preset(button.dataset.period));
        }));
        return {
            sync({ dateFrom = '', dateTo = '', monthsLabel = '' }) {
                saved = validDate(dateFrom) && validDate(dateTo) && dateFrom <= dateTo ? [dateFrom, dateTo] : ['', ''];
                for (let i = 0; i < 2; i++) {
                    const button = $(i ? 'date-to' : 'date-from');
                    button.querySelector('strong').textContent = saved[i] ? label(saved[i]) : 'Scegli data';
                    button.dataset.selected = String(Boolean(saved[i]));
                    button.setAttribute('aria-label', (i ? 'Al: ' : 'Dal: ') + (saved[i] ? label(saved[i]) : 'scegli data'));
                }
                const note = $('period-note');
                note.hidden = !saved[0] && !monthsLabel;
                note.textContent = saved[0] ? 'Fiere con date pubblicate nel periodo.' : monthsLabel ? 'Periodo abituale: ' + monthsLabel : '';
                document.querySelectorAll('[data-period]').forEach(button => {
                    const range = preset(button.dataset.period);
                    button.setAttribute('aria-pressed', String(!monthsLabel && saved.every((date, index) => date === range[index])));
                    button.setAttribute('aria-label', button.textContent + ': ' + label(range[0]) + ' – ' + label(range[1]));
                });
            }
        };
    }
    const api = { create, validDate, daysInMonth, addDays, preset };
    global.FairDatePicker = api;
    if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
