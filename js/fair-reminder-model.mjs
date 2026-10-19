export const MAX_MONTHS = 120;
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
    return {
        kind, id: event.id, name: kind === 'organizer' ? event.title : event.name,
        city: event.city, region: kind === 'organizer' ? event.region : event.region,
        dates: [...new Set(dates.filter(date => validDate(date) && date > today))].sort(),
        path: fairPath(kind, event.id)
    };
}
export function validateReminder(input, today = todayInRome()) {
    const reference = input.reference_date || null;
    if (reference && !validDate(reference)) return 'Scegli una data valida per la fiera.';
    if (reference && reference > String(Number(today.slice(0, 4)) + 10) + today.slice(4)) return 'Scegli una data entro i prossimi dieci anni.';
    if (!input.reminder_enabled) return null;
    if (!reference || reference <= today) return 'Scegli una data futura per la fiera.';
    if (!Number.isInteger(input.months_before) || input.months_before < 1 || input.months_before > MAX_MONTHS) return 'Scegli da 1 a 120 mesi di anticipo.';
    const target = reminderDate(reference, input.months_before);
    if (!target || target < today) return 'La data del promemoria è già passata: riduci i mesi o scegli un’altra data per la fiera.';
    return null;
}
