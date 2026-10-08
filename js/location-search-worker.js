// Solo nomi normalizzati: nessun annuncio, contatto o dato utente nel worker.
'use strict';
self.window = self;
importScripts('/js/comune-picker.js?v=5', '/js/location-search.js?v=6');
let names = [];
const jobs = new Map();
self.onmessage = ({ data }) => {
    if (data.names) { names = data.names; return; }
    if (data.cancel) { jobs.delete(data.cancel); return; }
    const iterator = LocationSearch.fuzzyTerms(names, data.packed);
    jobs.set(data.id, iterator);
    const found = [];
    function step() {
        if (!jobs.has(data.id)) return;
        const until = Date.now() + 8;
        let next;
        do {
            next = iterator.next();
            if (next.value) found.push(next.value);
        } while (!next.done && Date.now() < until);
        if (next.done) {
            jobs.delete(data.id);
            self.postMessage({ id: data.id, found });
        } else setTimeout(step, 0);
    }
    step();
};
