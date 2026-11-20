const assert = require('node:assert/strict');
const { events } = require('../data/fiere.json');
const participation = require('../js/fair-participation');
const badges = require('../js/fair-badges');
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
    ['trentino-alto-adige-levico-terme-mercatino-di-natale-asburgico', [['hobby', 'no']]],
    ['lombardia-gonzaga-esotika-pet-show', [['hobby', 'yes']]],
    ['trentino-alto-adige-rovere-della-luna-fiera-di-santa-caterina', [['hobby', 'yes']]]
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
const model = byId('veneto-verona-model-expo-italy');
const vinitaly = byId('veneto-verona-vinitaly');
const badgeLabels = (event, now, edition = event.editions.at(-1)) => badges.get(event, { now, edition }).map(item => item.label);
assert.deepEqual(badgeLabels(model, '2026-11-20T16:00:00Z'), ['Iscrizioni aperte']);
assert.deepEqual(badgeLabels(model, '2026-11-19T16:00:00Z'), []);
assert.deepEqual(badgeLabels(model, '2027-02-18T12:00:00Z'), ['Iscrizioni aperte']);
assert.deepEqual(badgeLabels(model, '2027-02-19T12:00:00Z'), ['In scadenza']);
assert.deepEqual(badgeLabels(model, '2027-02-25T22:59:00Z'), ['In scadenza']);
assert.deepEqual(badgeLabels(model, '2027-02-25T23:00:00Z'), []);
assert.deepEqual(badgeLabels(vinitaly, '2026-11-20T16:00:00Z'), ['In scadenza · collettiva TNO']);
assert.deepEqual(badgeLabels(vinitaly, '2026-11-27T10:59:59Z'), ['In scadenza · collettiva TNO']);
assert.deepEqual(badgeLabels(vinitaly, '2026-11-27T11:00:00Z'), []);
assert.match(badges.get(vinitaly, { now: '2026-11-20T16:00:00Z', edition: vinitaly.editions.at(-1) })[0].title, /Solo collettiva.*Pisa, Lucca e Massa Carrara/);
for (const event of [model, vinitaly]) {
    const edition = event.editions.at(-1);
    for (const wrongEdition of [null, event.editions[0], { ...edition, start: '2027-01-01' }, { ...edition, year: 2028 }]) {
        assert.deepEqual(badgeLabels(event, '2026-11-20T16:00:00Z', wrongEdition), [], event.id + ' application limited to documented edition');
    }
    for (const changed of [
        { ...event, managedEventId: 'other-organizer' },
        { ...event, venue: 'Other exhibition area' },
        { ...event, source: { ...event.source, url: 'https://example.com/new-proof' } },
        { ...event, participation: { ...event.participation, note: 'Different conditions' } },
        { ...event, participation: { ...event.participation, deadline: '2026-11-28' } },
        { ...event, editions: [...event.editions, { ...edition, label: 'New area' }] }
    ]) assert.deepEqual(badgeLabels(changed, '2026-11-20T16:00:00Z', edition), [], event.id + ' application proof invalidation');
}
assert.deepEqual(read(byId('lombardia-gonzaga-esotika-pet-show'), byId('lombardia-gonzaga-esotika-pet-show').editions[0]), []);
assert.match(read(byId('lombardia-gonzaga-esotika-pet-show'))[0].title, /soltanto articoli di seconda mano/);
assert.match(read(byId('trentino-alto-adige-rovere-della-luna-fiera-di-santa-caterina'))[0].title, /mercatino hobbisti separato/);
console.log('PASS participation: only documented badges across the full catalogue; unknowns absent, admissions/bans preserved, closed bookings, edition/area isolation, stale proofs and organizer isolation.');
console.log('PASS new research: four scoped confirmations, same-year edition isolation, changed proofs hidden, application opening/closing/expiry in Rome and collective-only label.');
