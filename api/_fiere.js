// One catalogue for calendar, detail pages and sitemap. Stable IDs survive new editions.
const catalog = require('../data/fiere.json');
const events = catalog.events;
const byId = new Map(events.map(event => [event.id, event]));
const fairPath = event => '/fiere/' + encodeURIComponent(event.id);
function isIndexable(event) {
    return Boolean(event.source?.url && event.participation?.type !== 'check'
        && event.participation?.note && (event.editions?.length || event.summary || event.venue));
}
module.exports = { catalog, events, byId, fairPath, isIndexable };
