// Ricerca testuale negli annunci: parole in qualsiasi ordine e piccoli refusi.
// Non modifica i dati e non attribuisce coordinate a nomi incerti.
(function () {
    'use strict';
    const normalize = window.ComuniItaliani.normalize;
    const ignored = new Set('a ad al allo alla ai agli alle da dal dallo dalla dai dagli dalle di del dello della dei degli delle in nel nello nella nei negli nelle su sul sullo sulla sui sugli sulle con per tra fra e ed il lo la i gli le un uno una l d'.split(' '));
    const indexes = new WeakMap();
    const words = text => normalize(text).split(' ').filter(word => word && !ignored.has(word));

    function distance(a, b, limit) {
        if (Math.abs(a.length - b.length) > limit) return limit + 1;
        let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
        let beforePrevious;
        for (let i = 1; i <= a.length; i++) {
            const current = [i];
            for (let j = 1; j <= b.length; j++) {
                current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
                if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) current[j] = Math.min(current[j], beforePrevious[j - 2] + 1);
            }
            if (Math.min(...current) > limit) return limit + 1;
            beforePrevious = previous;
            previous = current;
        }
        return previous[b.length];
    }

    function wordScore(word, query) {
        if (word === query) return 100;
        if (query.length >= 2 && word.startsWith(query)) return 80;
        const limit = query.length >= 8 ? 2 : query.length >= 3 ? 1 : 0;
        if (!limit) return 0;
        const changes = distance(word, query, limit);
        if (changes <= limit) return 60 - changes * 10;
        if (query.length >= 4 && word.length > query.length) {
            for (let length = query.length - limit; length <= query.length + limit; length++) {
                if (distance(word.slice(0, length), query, limit) <= limit) return 30;
            }
        }
        return 0;
    }

    function index(listing) {
        const previous = indexes.get(listing);
        if (previous?.version === window.LocationSearch.dataVersion) return previous.fields;
        let extra = listing.dettagli_extra;
        if (typeof extra === 'string') { try { extra = JSON.parse(extra); } catch { extra = null; } }
        const context = window.LocationSearch.listingContext(listing.comune, listing.regione, listing.provincia);
        const fields = [
            [listing.comune, 5], [listing.titolo, 4],
            [[listing.regione, listing.provincia, listing.tipo, listing.stato, listing.settore, listing.merce, listing.categoria, listing.giorni, ...context].filter(Boolean).join(' '), 3],
            [[listing.descrizione, extra?.descrizione].filter(Boolean).join(' ').replace(/<[^>]*>/g, ' '), 1]
        ].map(([text, weight]) => ({ text: normalize(text), words: [...new Set(words(text))], weight }));
        indexes.set(listing, { version: window.LocationSearch.dataVersion, fields });
        return fields;
    }

    function score(listing, query) {
        const raw = normalize(query);
        if (!raw) return 1;
        const fields = index(listing);
        const terms = words(raw);
        // Una ricerca composta solo da articoli conserva comunque il testo inserito.
        if (!terms.length) return fields.some(field => field.text.includes(raw)) ? 1 : 0;
        let total = 0;
        for (const term of terms) {
            let best = 0;
            for (const field of fields) {
                for (const word of field.words) {
                    const match = wordScore(word, term);
                    if (match) best = Math.max(best, match * 10 + field.weight);
                }
                if (field.words.join('') === term) best = Math.max(best, 1000 + field.weight);
            }
            if (!best) return 0;
            total += best;
        }
        // Il luogo esatto e la frase esatta nel titolo precedono i risultati approssimativi.
        const exactPlace = fields[0].text === raw || words(fields[0].text).join('') === terms.join('');
        return total / terms.length + (exactPlace ? 3000 : fields[1].text.includes(raw) ? 2000 : 0);
    }

    function matchesName(name, wanted) {
        const a = words(name), b = words(wanted);
        if (!a.length || !b.length) return false;
        if (a.join('') === b.join('')) return true;
        return a.length === b.length && b.every((word, i) => wordScore(a[i], word) >= 50);
    }

    window.ListingSearch = { score, matchesName, distance };
})();
