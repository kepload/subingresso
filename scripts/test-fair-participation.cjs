const assert = require('node:assert/strict');
const { events } = require('../data/fiere.json');
const participation = require('../js/fair-participation');
const byId = id => events.find(event => event.id === id);
const read = (event, edition = event.editions.at(-1)) => participation.get(event, { edition, now: '2026-11-20T14:00:00Z' });
const cases = [
    ['lombardia-brescia-fiera-dei-santi-faustino-e-giovita', [['spunta', 'yes']]],
    ['lombardia-brescia-brescia-mineral-show', []],
    ['lombardia-concesio-fiera-di-sant-andrea', [['spunta', 'yes']]],
    ['lombardia-gussago-fiera-dell-uva', [['spunta', 'no']]],
    ['lombardia-castegnato-mercatini-di-natale', [['hobby', 'yes']]],
    ['lombardia-paitone-mercatini-di-natale', [['hobby', 'yes']]],
    ['lombardia-coccaglio-festa-patronale-e-mercatini', [['hobby', 'yes']]],
    ['lombardia-desenzano-del-garda-mercatino-dell-antiquariato', [['spunta', 'yes'], ['hobby', 'yes']]],
    ['lombardia-desenzano-del-garda-un-mondo-di-vintage', [['spunta', 'yes'], ['hobby', 'yes']]],
    ['valle-d-aosta-nus-lo-martchia-de-tsalende', [['spunta', 'no']]],
    ['trentino-alto-adige-levico-terme-mercatino-di-natale-asburgico', [['hobby', 'no']]]
];
for (const [id, expected] of cases) {
    const event = byId(id);
    assert.deepEqual(read(event).map(item => [item.topic, item.status]), expected, id);
    for (const edition of [null, { ...event.editions.at(-1), year: 2030 }, { ...event.editions.at(-1), label: 'Another area' }]) {
        assert.deepEqual(read(event, edition), [], id + ' exact edition');
    }
    for (const changed of [
        { ...event, managedEventId: 'organizer' },
        { ...event, venue: 'Altra area della manifestazione' },
        { ...event, source: { ...event.source, url: 'https://example.com/changed' } },
        { ...event, participation: { ...event.participation, note: 'Changed conditions' } },
        { ...event, editions: [...event.editions, { year: 2030, start: '2030-01-01' }] }
    ]) assert.deepEqual(read(changed, event.editions.at(-1)), [], id + ' stale evidence');
}
for (const event of events) {
    const rows = read(event);
    assert(rows.length <= 2, event.id);
    assert.equal(new Set(rows.map(item => item.topic)).size, rows.length, event.id + ' no conflicting badges');
    assert(rows.every(item => ['spunta', 'hobby'].includes(item.topic) && ['yes', 'no'].includes(item.status)));
    assert(rows.every(item => /^https:\/\//.test(item.sourceUrl)), event.id);
    assert(rows.every(item => !/da verificare/i.test(item.label)), event.id + ' no unknown labels');
}
assert.match(participation.notices(byId('lombardia-coccaglio-festa-patronale-e-mercatini'), { edition: byId('lombardia-coccaglio-festa-patronale-e-mercatini').editions.at(-1) })[0], /prenotati; iscrizioni chiuse/);
assert.deepEqual(participation.get(null), []);
console.log('PASS participation: only documented badges across the full catalogue; unknowns absent, admissions/bans preserved, closed bookings, edition/area isolation, stale proofs and organizer isolation.');
