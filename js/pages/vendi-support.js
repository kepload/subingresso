// Aiuti del form: suggerimenti basati solo sui dati inseriti e foto delle bozze locali.
(function () {
    'use strict';

    function titleCandidates(data) {
        const c = String(data.comune || '').trim();
        if (!c) return [];
        const rent = data.stato === 'Affitto mensile';
        const fair = data.tipo === 'Fiera';
        const sector = String(data.merce || '').toLocaleLowerCase('it-IT');
        const area = String(data.superficie || '').replace('.', ',');
        const dayList = String(data.giorni || '').toLocaleLowerCase('it-IT').split(', ').filter(Boolean);
        const days = dayList.join(' e ');
        const marketDays = dayList.map(day => 'del ' + day).join(' e ');
        const name = String(data.nomeFiera || '').trim();
        const event = name ? `alla ${/^fiera\b/i.test(name) ? name : 'fiera ' + name}` : 'in fiera';
        let bases;
        if (fair) {
            bases = rent ? [
                `Affitto un posteggio ${event} a ${c}`, `Posteggio ${event} a ${c} in affitto`,
                `${c}: affitto il mio posteggio ${event}`, `Un posteggio ${event} a ${c} da affittare`,
                `A ${c} affitto un posteggio ${event}`, `${c}, posteggio ${event} disponibile in affitto`,
                `Cerchi un posteggio ${event} a ${c}? Lo affitto`, `Il mio posteggio ${event} a ${c} è in affitto`,
                `Propongo in affitto un posteggio ${event} a ${c}`, `Posteggio da affittare ${event} a ${c}`,
                `Il mio posto ${event} a ${c}: lo affitto`, `${c}: posteggio da affittare ${event}`,
                `Ho un posteggio ${event} a ${c} da affittare`, `Affitto il posteggio che ho ${event} a ${c}`,
                `A ${c}, un posteggio ${event} in affitto`, `Posteggio a ${c} ${event}: disponibile in affitto`,
                `${c}, il mio posteggio ${event} è in affitto`, `Metto in affitto un posteggio ${event} a ${c}`
            ] : [
                `Cedo il mio posteggio ${event} a ${c}`, `Vendo un posteggio ${event} a ${c}`,
                `${c}: posteggio ${event} in vendita`, `Posteggio ${event} a ${c}, lo cedo`,
                `A ${c} vendo il mio posteggio ${event}`, `Un posteggio ${event} a ${c} da rilevare`,
                `${c}, cedo un posteggio ${event}`, `Il mio posteggio ${event} a ${c} è in vendita`,
                `Cerchi un posteggio ${event} a ${c}? Cedo il mio`, `Posteggio da rilevare ${event} a ${c}`,
                `Metto in vendita il posteggio ${event} a ${c}`, `Cessione posteggio ${event} a ${c}`,
                `Il mio posto ${event} a ${c}: lo vendo`, `${c}: posteggio da rilevare ${event}`,
                `Ho un posteggio ${event} a ${c} da cedere`, `Vendo il posteggio che ho ${event} a ${c}`,
                `A ${c}, un posteggio ${event} in vendita`, `Posteggio a ${c} ${event}: disponibile in vendita`,
                `Vorrei cedere il mio posteggio ${event} a ${c}`, `${c}, il mio posteggio ${event} è in vendita`,
                `Cedo il posteggio che ho ${event} a ${c}`, `Un posto ${event} a ${c}: vendo il mio posteggio`
            ];
        } else {
            bases = rent ? [
                `Affitto il mio posteggio al mercato di ${c}`, `Posteggio al mercato di ${c} in affitto`,
                `${c}: affitto un posteggio al mercato`, `Un posteggio al mercato di ${c} da affittare`,
                `A ${c} affitto un posteggio mercatale`, `${c}, posteggio mercatale disponibile in affitto`,
                `Il mio posteggio al mercato di ${c} è in affitto`, `Cerchi un posteggio a ${c}? Lo affitto`,
                `Propongo in affitto un posteggio al mercato di ${c}`, `Posteggio da affittare al mercato di ${c}`,
                `Mercato di ${c}: posteggio in affitto`, `Affitto posteggio al mercato settimanale di ${c}`,
                `Il mio posto al mercato di ${c}: lo affitto`, `Ho un posteggio al mercato di ${c} da affittare`,
                `Affitto il posteggio che ho al mercato di ${c}`, `Posteggio a ${c}: disponibile in affitto al mercato`,
                `${c}, il mio posteggio mercatale è in affitto`, `Metto in affitto un posteggio al mercato di ${c}`,
                `Un posto al mercato di ${c}: affitto il mio`, `${c}: un posteggio mercatale da affittare`
            ] : [
                `Cedo il mio posteggio al mercato di ${c}`, `Vendo un posteggio al mercato di ${c}`,
                `${c}: posteggio al mercato in vendita`, `Posteggio al mercato di ${c}, lo cedo`,
                `A ${c} vendo il mio posteggio mercatale`, `Un posteggio al mercato di ${c} da rilevare`,
                `${c}, cedo un posteggio mercatale`, `Il mio posteggio al mercato di ${c} è in vendita`,
                `Cerchi un posteggio a ${c}? Cedo il mio`, `Posteggio da rilevare al mercato di ${c}`,
                `Metto in vendita il mio posteggio al mercato di ${c}`, `Mercato di ${c}: vendo il posteggio`,
                `Cedo un posteggio al mercato settimanale di ${c}`, `${c}: vendo il mio posto al mercato`,
                `Posteggio mercatale in vendita a ${c}`, `Cessione del mio posteggio al mercato di ${c}`,
                `Il mio posto al mercato di ${c}: lo vendo`, `Ho un posteggio al mercato di ${c} da cedere`,
                `Vendo il posteggio che ho al mercato di ${c}`, `Posteggio a ${c}: disponibile in vendita al mercato`,
                `Vorrei cedere il mio posteggio al mercato di ${c}`, `${c}, il mio posteggio mercatale è in vendita`,
                `Cedo il posteggio che ho al mercato di ${c}`, `Un posto al mercato di ${c}: vendo il mio`,
                `${c}: un posteggio mercatale da rilevare`, `Metto in vendita un posteggio mercatale a ${c}`
            ];
            if (days) {
                bases.push(...(rent ? [
                    `Affitto un posteggio a ${c}, mercato ${marketDays}`,
                    `${c}, mercato ${marketDays}: posteggio in affitto`,
                    `${days} al mercato di ${c}: affitto il posteggio`,
                    `Posteggio ${marketDays} a ${c} da affittare`
                ] : [
                    `Cedo un posteggio a ${c}, mercato ${marketDays}`,
                    `${c}, mercato ${marketDays}: vendo il posteggio`,
                    `${days} al mercato di ${c}: cedo il mio posteggio`,
                    `Posteggio ${marketDays} a ${c} in vendita`,
                    `Vendo il mio posteggio ${marketDays} a ${c}`,
                    `Un posto al mercato ${marketDays} a ${c} da rilevare`
                ]));
            }
        }
        const candidates = [];
        bases.forEach(base => {
            candidates.push(base);
            if (sector) candidates.push(`${base} · ${sector}`);
            if (area) candidates.push(`${base}, ${area} m²`);
            if (sector && area) candidates.push(`${base} · ${sector}, ${area} m²`);
        });
        if (sector) candidates.push(`${c}: posteggio per ${sector} ${rent ? 'in affitto' : 'in vendita'}${fair ? ' ' + event : ' al mercato'}`);
        if (area) candidates.push(`Posteggio di ${area} m² a ${c} ${rent ? 'in affitto' : 'in vendita'}${fair ? ' ' + event : ' al mercato'}`);
        const unique = [...new Set(candidates)].filter(title => title.length <= 110);
        return unique.length ? unique : [`${c}: posteggio ${rent ? 'in affitto' : 'in vendita'}`];
    }

    function chooseTitle(data, previous) {
        let recent = [];
        try { recent = JSON.parse(sessionStorage.getItem('subingresso_title_history') || '[]'); } catch (_) {}
        if (!Array.isArray(recent)) recent = [];
        const all = titleCandidates(data);
        const fresh = all.filter(title => title !== previous && !recent.includes(title));
        const pool = fresh.length ? fresh : all.filter(title => title !== previous);
        const title = pool[Math.floor(Math.random() * pool.length)] || all[0] || '';
        try { sessionStorage.setItem('subingresso_title_history', JSON.stringify([...recent, title].slice(-20))); } catch (_) {}
        return title;
    }

    function parseNumber(raw, money = false) {
        let value = String(raw || '').trim().replace(/\s/g, '');
        if (money && /^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(value)) value = value.replace(/\./g, '');
        if (!/^\d+(?:[.,]\d{1,2})?$/.test(value)) return NaN;
        return Number(value.replace(',', '.'));
    }

    let dbPromise;
    let photoQueue = Promise.resolve();
    function database() {
        if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
            const request = indexedDB.open('subingresso_listing_drafts', 1);
            request.onupgradeneeded = () => request.result.createObjectStore('photos');
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
            request.onblocked = () => reject(new Error('Archivio foto occupato'));
        }).catch(error => { dbPromise = null; throw error; });
        return dbPromise;
    }
    function photoTransaction(key, value, action) {
        const operation = photoQueue.catch(() => {}).then(async () => {
            const db = await database();
            return new Promise((resolve, reject) => {
                const tx = db.transaction('photos', action === 'get' ? 'readonly' : 'readwrite');
                const store = tx.objectStore('photos');
                const request = action === 'get' ? store.get(key) : action === 'delete' ? store.delete(key) : store.put(value, key);
                tx.oncomplete = () => resolve(action === 'get' ? (request.result || []) : undefined);
                tx.onerror = tx.onabort = () => reject(tx.error || new Error('Salvataggio foto non riuscito'));
            });
        });
        photoQueue = operation;
        return operation;
    }

    window.VendiSupport = {
        titleCandidates, chooseTitle, parseNumber,
        loadPhotos: key => photoTransaction(key, null, 'get'),
        savePhotos: (key, files) => photoTransaction(key, files.map(file => ({ blob: file, name: file.name, type: file.type, lastModified: file.lastModified })), 'put'),
        deletePhotos: key => photoTransaction(key, null, 'delete')
    };
})();
