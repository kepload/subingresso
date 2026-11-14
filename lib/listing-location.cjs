// Geografia SSR: stessa anagrafica del selettore, senza suggerimenti fuzzy.
const comuni = require('../data/comuni-picker.json');
const localita = require('../data/localita.json').localita;
const geo = require('../data/comuni.json');
const normalize = value => String(value || '').trim().toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
const provinces = new Map();
const names = new Map();
const olderNames = new Map();
const byCode = new Map();
const geoByCode = new Map(geo.map(row => [row.codiceIstat, row]));
const geoByName = new Map(geo.map(row => [normalize(row.nome) + '|' + row.sigla, row]));
for (const row of geo) {
    const key = normalize(row.nome);
    if (!olderNames.has(key)) olderNames.set(key, []);
    olderNames.get(key).push(row);
}

function addName(name, row) {
    const key = normalize(name);
    if (!names.has(key)) names.set(key, new Set());
    names.get(key).add(row);
}
for (const comune of comuni) {
    const point = geoByCode.get(comune.codiceIstat) || geoByName.get(normalize(comune.nome) + '|' + comune.sigla);
    const row = { ...comune, lat: point?.lat, lng: point?.lng };
    byCode.set(row.codiceIstat, row);
    provinces.set(normalize(row.provincia), row.provincia);
    provinces.set(normalize(row.sigla), row.provincia);
    addName(row.nome, row);
}
for (const [, nome, code, lat, lng, aliases = []] of localita) {
    const parent = byCode.get(code);
    if (!parent) continue;
    const row = { ...parent, nome: `${nome} (${parent.nome})`, nomeLocalita: nome, lat, lng };
    for (const name of [nome, ...aliases]) {
        addName(name, row);
        addName(`${name} (${parent.nome})`, row);
    }
}

function resolveListingLocation(listing) {
    const explicitProvince = normalize(listing.provincia);
    const provincia = provinces.get(explicitProvince);
    // Una provincia esplicita ignota non autorizza un'associazione per nome.
    if (explicitProvince && !provincia) return { provincia: '', location: null };
    const region = normalize(listing.regione);
    const canonicalRegion = value => normalize(value).replace(/ sudtirol$/, '').replace(/ vallee d aoste$/, '');
    const sameContext = row => (!provincia || row.provincia === provincia) &&
        (!region || canonicalRegion(row.regione) === canonicalRegion(region));
    const key = normalize(listing.comune);
    const named = [...(names.get(key) || [])];
    let candidates = named.filter(sameContext);
    // Il client conserva un comune ufficiale univoco anche con regione legacy errata.
    if (!candidates.length && !explicitProvince && named.length === 1 && !named[0].nomeLocalita) candidates = named;
    // Come nella ricerca condivisa, un comune ufficiale precede gli alias di località.
    const official = candidates.filter(row => !row.nomeLocalita);
    if (official.length) candidates = official;
    // Compatibilità con i vecchi nomi ufficiali, come listingCoordinates nel client.
    if (!candidates.length) candidates = (olderNames.get(key) || []).filter(sameContext);
    const location = candidates.length === 1 ? candidates[0] : null;
    return { provincia: provincia || location?.provincia || '', location };
}

module.exports = { resolveListingLocation };
