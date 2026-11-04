// Shared canonical edition choices: never invent dates from a recurrence.
(function (root) {
    'use strict';
    const today = () => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
    function normalize(editions = []) {
        const unique = new Map();
        for (const edition of editions) {
            const start = edition.start, end = edition.end || start;
            if (!validDate(start) || !validDate(end) || end < start) continue;
            const key = 'date:' + start + ':' + end;
            unique.set(key, { key, year: Number(start.slice(0, 4)), start, end });
        }
        return [...unique.values()].sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
    }
    function choices(editions, year, now = today()) {
        return normalize(editions).filter(e => e.year === Number(year) && e.start <= now);
    }
    function yearAllowed(editions, year, now = today()) {
        if (!Number.isInteger(Number(year)) || Number(year) < 1900 || Number(year) > Number(now.slice(0, 4))) return false;
        const known = normalize(editions).filter(e => e.year === Number(year));
        return !known.length || known.some(e => e.start <= now);
    }
    function resolve(editions, key, now = today()) {
        if (typeof key !== 'string') return null;
        if (/^year:(19|20)\d{2}$/.test(key)) {
            const year = Number(key.slice(5));
            return yearAllowed(editions, year, now) ? { key, year, start: null, end: null } : null;
        }
        return normalize(editions).find(e => e.key === key && e.start <= now) || null;
    }
    function label(edition) {
        if (!edition) return '';
        const year = edition.year || edition.visit_year || edition.edition_year;
        const start = edition.start || edition.visit_start, end = edition.end || edition.visit_end || start;
        if (!start) return String(year || '');
        const date = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
        return start === end ? date.format(new Date(start)) : date.format(new Date(start)) + ' – ' + date.format(new Date(end));
    }
    const model = { today, validDate, normalize, choices, yearAllowed, resolve, label };
    if (typeof module !== 'undefined' && module.exports) module.exports = model;
    root.FairReviewEditions = model;
})(typeof window === 'undefined' ? globalThis : window);
