export const MAX_MONTHS = 120;
export const MIN_MONTHS = 2;
export function validDate(value) {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function todayInRome(now = new Date()) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}
export function reminderDate(value, months) {
    if (!validDate(value) || !Number.isInteger(months) || months < 1 || months > MAX_MONTHS) return null;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1 - months, 1));
    const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate();
    date.setUTCDate(Math.min(day, lastDay));
    return date.toISOString().slice(0, 10);
}
export function dateLabel(value) {
    return validDate(value) ? new Intl.DateTimeFormat('it-IT', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value + 'T12:00:00Z')) : 'Data da scegliere';
}
export function fairPath(kind, id) {
    return kind === 'organizer' ? '/evento?id=' + encodeURIComponent(id) : '/fiere/' + encodeURIComponent(id);
}
export function fairMetadata(event, kind = 'catalog', today = todayInRome()) {
    const dates = kind === 'organizer' ? [event.start_date] : (event.editions || []).filter(item => !item.periodOnly).map(item => item.start);
    const editions = kind === 'catalog' ? (event.editions || []).slice().sort((a, b) => b.year - a.year || (b.start || '').localeCompare(a.start || '')) : [];
    const latest = editions[0];
    const estimateFrom = latest && (validDate(latest.start) ? latest.start : Number.isInteger(latest.year) && event.months?.length ? latest.year + '-' + String(Math.min(...event.months)).padStart(2, '0') + '-01' : null);
    return {
        kind, id: event.id, name: kind === 'organizer' ? event.title : event.name,
        city: event.city, region: kind === 'organizer' ? event.region : event.region,
        dates: [...new Set(dates.filter(date => validDate(date) && date > today))].sort(),
        estimateFrom: validDate(estimateFrom) ? estimateFrom : null,
        path: fairPath(kind, event.id)
    };
}
export function suggestFairDate(fair, months = MIN_MONTHS, today = todayInRome()) {
    if (!Number.isInteger(months) || months < MIN_MONTHS || months > MAX_MONTHS) return null;
    const published = fair.dates.find(date => date > today && reminderDate(date, months) >= today);
    if (published) return { date: published, estimated: false, sourceYear: null };
    if (fair.kind !== 'catalog' || !validDate(fair.estimateFrom)) return null;
    const sourceYear = Number(fair.estimateFrom.slice(0, 4)), month = Number(fair.estimateFrom.slice(5, 7)), day = Number(fair.estimateFrom.slice(8, 10));
    for (let year = Math.max(sourceYear, Number(today.slice(0, 4))); year <= Number(today.slice(0, 4)) + 10; year++) {
        const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
        const date = year + '-' + String(month).padStart(2, '0') + '-' + String(Math.min(day, last)).padStart(2, '0');
        if (date > today && reminderDate(date, months) >= today && date <= String(Number(today.slice(0, 4)) + 10) + today.slice(4)) return { date, estimated: true, sourceYear };
    }
    return null;
}
export function validateReminder(input, today = todayInRome()) {
    const reference = input.reference_date || null;
    if (reference && !validDate(reference)) return 'Scegli una data valida per la fiera.';
    if (reference && reference > String(Number(today.slice(0, 4)) + 10) + today.slice(4)) return 'Scegli una data entro i prossimi dieci anni.';
    if (!input.reminder_enabled) return null;
    if (!reference || reference <= today) return 'Scegli una data futura per la fiera.';
    if (!Number.isInteger(input.months_before) || input.months_before < MIN_MONTHS || input.months_before > MAX_MONTHS) return 'Scegli da 2 a 120 mesi di anticipo.';
    const target = reminderDate(reference, input.months_before);
    if (!target || target < today) return 'La data del promemoria è già passata: riduci i mesi o scegli un’altra data per la fiera.';
    return null;
}
