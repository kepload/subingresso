const assert = require('node:assert/strict');
const { events } = require('../data/fiere.json');
const participation = require('../js/fair-participation');
const byId = id => events.find(event => event.id === id);
const read = (event, edition = event.editions.at(-1)) => participation.get(event, { edition, now: '2026-11-20T14:00:00Z' });
const cases = [
    ['lombardia-brescia-fiera-dei-santi-faustino-e-giovita', ['yes', 'unknown']],
    ['lombardia-brescia-brescia-mineral-show', ['unknown', 'unknown']],
    ['lombardia-concesio-fiera-di-sant-andrea', ['yes', 'unknown']],
    ['lombardia-gussago-fiera-dell-uva', ['no', 'unknown']],
    ['lombardia-castegnato-mercatini-di-natale', ['unknown', 'yes']],
    ['lombardia-paitone-mercatini-di-natale', ['unknown', 'yes']],
    ['lombardia-coccaglio-festa-patronale-e-mercatini', ['unknown', 'yes']],
    ['lombardia-desenzano-del-garda-mercatino-dell-antiquariato', ['yes', 'yes']],
    ['lombardia-desenzano-del-garda-un-mondo-di-vintage', ['yes', 'yes']],
    ['valle-d-aosta-nus-lo-martchia-de-tsalende', ['no', 'unknown']],
    ['trentino-alto-adige-levico-terme-mercatino-di-natale-asburgico', ['unknown', 'no']]
];
for (const [id, expected] of cases) {
    const event = byId(id);
    assert.deepEqual(read(event).map(item => item.status), expected, id);
    for (const edition of [null, { ...event.editions.at(-1), year: 2030 }, { ...event.editions.at(-1), label: 'Another area' }]) {
        assert.deepEqual(read(event, edition).map(item => item.status), ['unknown', 'unknown'], id + ' exact edition');
    }
    for (const changed of [
        { ...event, managedEventId: 'organizer' },
        { ...event, venue: 'Altra area della manifestazione' },
        { ...event, source: { ...event.source, url: 'https://example.com/changed' } },
        { ...event, participation: { ...event.participation, note: 'Changed conditions' } },
        { ...event, editions: [...event.editions, { year: 2030, start: '2030-01-01' }] }
    ]) assert.deepEqual(read(changed, event.editions.at(-1)).map(item => item.status), ['unknown', 'unknown'], id + ' stale evidence');
}
for (const event of events) {
    const rows = read(event);
    assert.equal(rows.length, 2, event.id);
    assert.deepEqual(rows.map(item => item.topic), ['spunta', 'hobby']);
    assert(rows.every(item => ['yes', 'no', 'unknown'].includes(item.status)));
    assert(rows.every(item => item.status === 'unknown' || /^https:\/\//.test(item.sourceUrl)), event.id);
}
assert.match(participation.notices(byId('lombardia-coccaglio-festa-patronale-e-mercatini'), { edition: byId('lombardia-coccaglio-festa-patronale-e-mercatini').editions.at(-1) })[0], /prenotati; iscrizioni chiuse/);
assert.deepEqual(participation.get(null), []);
console.log('PASS participation: every catalogue event has two explicit states; reviewed admissions, bans, closed bookings, edition/area isolation, stale proofs and organizer isolation.');
