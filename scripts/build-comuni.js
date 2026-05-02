// ============================================================
//  Build dataset comuni italiani per pagine SEO /comune/[slug].
//  Merge: matteocontrini/comuni-json (anagrafica ISTAT) +
//         MatteoHenryChinaski (lat/lng).
//  Output: data/comuni.json (array, ~7900 record).
//  Eseguire: node scripts/build-comuni.js
// ============================================================
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const comuniRaw = require(path.join(root, 'data/_comuni_raw.json'));
const geoRaw = require(path.join(root, 'data/_geo_raw.json'));

// Mappa istat-int -> {lat, lng}
const geoByIstat = new Map();
for (const g of geoRaw) {
    const lat = parseFloat(g.lat);
    const lng = parseFloat(g.lng);
    if (!isNaN(lat) && !isNaN(lng)) {
        geoByIstat.set(String(parseInt(g.istat, 10)), { lat, lng });
    }
}

// Slugify italiano: minuscolo, accenti rimossi, apostrofi/spazi -> -, no doppi -.
function slugify(name) {
    return name
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip diacritici
        .replace(/['`]/g, '-')                            // apostrofi -> -
        .replace(/[^a-z0-9]+/g, '-')                      // resto non-alnum -> -
        .replace(/^-+|-+$/g, '')                          // trim -
        .replace(/-+/g, '-');                             // collassa --
}

// Build records
const records = comuniRaw.map(c => {
    const istatInt = String(parseInt(c.codice, 10));
    const geo = geoByIstat.get(istatInt);
    return {
        slug: slugify(c.nome),
        nome: c.nome,
        regione: c.regione.nome,
        provincia: c.provincia.nome,
        sigla: c.sigla,
        popolazione: c.popolazione || null,
        lat: geo ? geo.lat : null,
        lng: geo ? geo.lng : null,
        codiceIstat: c.codice
    };
});

// Dedup slug: se collisione, append -<sigla>.
const slugCount = new Map();
for (const r of records) slugCount.set(r.slug, (slugCount.get(r.slug) || 0) + 1);

const seen = new Set();
let dedupedCount = 0;
for (const r of records) {
    if (slugCount.get(r.slug) > 1 || seen.has(r.slug)) {
        r.slug = `${r.slug}-${r.sigla.toLowerCase()}`;
        dedupedCount++;
    }
    seen.add(r.slug);
}

// Verifica unicità finale
const finalSlugs = new Set();
const dups = [];
for (const r of records) {
    if (finalSlugs.has(r.slug)) dups.push(r.slug);
    finalSlugs.add(r.slug);
}

// Stats
const withGeo = records.filter(r => r.lat !== null).length;
const withPop = records.filter(r => r.popolazione !== null).length;

console.log('Totale comuni:', records.length);
console.log('Con coordinate:', withGeo, `(${(withGeo/records.length*100).toFixed(1)}%)`);
console.log('Con popolazione:', withPop, `(${(withPop/records.length*100).toFixed(1)}%)`);
console.log('Slug deduplicati con sigla:', dedupedCount);
console.log('Slug duplicati residui:', dups.length, dups.slice(0, 5));

// Sort per nome (più leggibile in fileche bundle stabili)
records.sort((a, b) => a.nome.localeCompare(b.nome, 'it'));

// Scrivi file finale
const outPath = path.join(root, 'data/comuni.json');
fs.writeFileSync(outPath, JSON.stringify(records));
const stat = fs.statSync(outPath);
console.log(`\nScritto data/comuni.json: ${(stat.size/1024).toFixed(0)} KB`);

// Sanity check: 5 città storiche
['Roma', 'Milano', 'Forlì', "L'Aquila", 'Salò'].forEach(nome => {
    const r = records.find(x => x.nome === nome);
    console.log(`  ${nome} -> slug="${r?.slug}" lat=${r?.lat} lng=${r?.lng}`);
});
