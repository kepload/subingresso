// Parità dei risultati e pagina reattiva durante refusi, cancellazione e fallback.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const fixture = `<!doctype html><input id="query"><div id="box"></div>
<script src="/js/comune-picker.js?v=6"></script><script src="/js/location-search.js?v=7"></script>
<script>window.submissions=[];query.value=new URLSearchParams(location.search).get('q')||'';window.picker=LocationSearch.create({input:document.querySelector('#query'),box:document.querySelector('#box'),initialCode:new URLSearchParams(location.search).get('comune')||'',onSubmit:async()=>{if(await picker.prepare())submissions.push({value:query.value,id:picker.selected?.id})}});</script>`;
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/') return res.end(fixture);
    const file = path.resolve(root, '.' + url.pathname);
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    res.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'application/json');
    fs.readFile(file, (error, data) => error ? res.writeHead(404).end() : res.end(data));
});
const queries = ['brecsia', 'montemgno', 'Rivoltela', 'Rivolttella', 'Rivotlella', 'brecsia BS', 'Quero Vas', 'Castro', 'Castro LE', 'Agrate', 'laquila', 'abbigliament rivoltela'];
async function check(engine, name, base) {
    const browser = await engine.launch({ headless: true });
    try {
        const page = await browser.newPage();
        await page.addInitScript(() => {
            window.initialLoadTicks = [];
            window.initialLoadTimer = setInterval(() => initialLoadTicks.push(performance.now()), 16);
        });
        await page.goto(base);
        await page.evaluate(() => picker.ready);
        const initialLoad = await page.evaluate(() => {
            clearInterval(initialLoadTimer);
            const ticks = [...initialLoadTicks, performance.now()];
            return { ticks: ticks.length, maxGap: Math.max(0, ...ticks.slice(1).map((time, index) => time - ticks[index])) };
        });
        assert(initialLoad.ticks > 10, 'il browser resta attivo durante la preparazione iniziale delle località');
        assert(initialLoad.maxGap < 250, 'nessuna pausa di un secondo durante la preparazione iniziale');
        console.log(`${name}: caricamento iniziale, timer attivo ${initialLoad.ticks} volte, pausa massima ${Math.round(initialLoad.maxGap)} ms`);
        await page.evaluate(() => {
            // Oracolo originale, indipendente dall'ottimizzazione della matrice.
            function distance(a, b, limit) {
                if (Math.abs(a.length - b.length) > limit) return limit + 1;
                let previous = Array.from({ length: b.length + 1 }, (_, i) => i), beforePrevious;
                for (let i = 1; i <= a.length; i++) {
                    const current = [i];
                    for (let j = 1; j <= b.length; j++) {
                        current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
                        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) current[j] = Math.min(current[j], beforePrevious[j - 2] + 1);
                    }
                    if (Math.min(...current) > limit) return limit + 1;
                    beforePrevious = previous; previous = current;
                }
                return previous[b.length];
            }
            let seed = 42;
            const random = n => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return (seed >>> 8) % n; };
            const word = length => Array.from({ length }, () => 'abcd'[random(4)]).join('');
            for (let n = 0; n < 100; n++) {
                const packed = word(4 + random(12)), limit = packed.length >= 7 ? 2 : 1;
                const names = Array.from({ length: 500 }, (_, index) => {
                    if (index < 250) return word(1 + random(22));
                    let name = packed;
                    for (let edit = 0, count = random(4); edit < count; edit++) {
                        const at = random(name.length), operation = random(4);
                        if (operation === 0) name = name.slice(0, at) + name.slice(at + 1);
                        else if (operation === 1) name = name.slice(0, at) + word(1) + name.slice(at);
                        else if (operation === 2) name = name.slice(0, at) + word(1) + name.slice(at + 1);
                        else if (at + 1 < name.length) name = name.slice(0, at) + name[at + 1] + name[at] + name.slice(at + 2);
                    }
                    return name + (random(2) ? word(random(10)) : '');
                });
                const actual = [...LocationSearch.fuzzyTerms(names, packed)].filter(Boolean);
                const expected = [];
                names.forEach((name, index) => {
                    let best = limit + 1;
                    for (let length = packed.length - limit; length <= packed.length + limit; length++) best = Math.min(best, distance(packed, name.slice(0, length), limit));
                    if (best <= limit) expected.push([index, best]);
                });
                if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('Differenza rispetto al calcolo originale dei refusi: ' + packed);
            }
        });
        const expected = await page.evaluate(queries => Object.fromEntries(queries.map(query => [query,
            LocationSearch.match(query, 100000).map(item => [item.row.id, item.rank, item.fuzzy])])), queries);
        if (process.env.GEO_BASELINE_SCRIPT && name === 'Chromium') {
            const baseline = await page.evaluate(async ({ source, queries }) => {
                const current = LocationSearch;
                (0, eval)(source);
                const original = LocationSearch;
                await original.load();
                const started = performance.now();
                const results = Object.fromEntries(queries.map(query => [query, original.match(query, 100000).map(item => [item.row.id, item.rank, item.fuzzy])]));
                const milliseconds = Math.round(performance.now() - started);
                window.LocationSearch = current;
                return { results, milliseconds };
            }, { source: fs.readFileSync(process.env.GEO_BASELINE_SCRIPT, 'utf8'), queries });
            assert.deepEqual(expected, baseline.results, 'risultati e ordine identici alla versione pubblicata prima della modifica');
            console.log(`OK parità con versione precedente: ${queries.length} query complete, vecchio tempo sincrono ${baseline.milliseconds} ms`);
        }
        // Pagina nuova: la cache sincrona non deve nascondere il percorso worker.
        await page.reload();
        await page.evaluate(() => picker.ready);
        let workers = 0;
        page.on('worker', () => workers++);
        for (const query of queries) {
            const actual = await page.evaluate(async query => (await LocationSearch.matchAsync(query, 100000))
                .map(item => [item.row.id, item.rank, item.fuzzy]), query);
            assert.deepEqual(actual, expected[query], `${name}: parità worker per ${query}`);
        }
        assert.equal(workers, 1, 'un solo worker condiviso');
        // Un refuso nuovo viene calcolato mentre timer e interazioni restano attivi.
        const timing = await page.evaluate(async () => {
            let ticks = 0, longestGap = 0, previous = performance.now();
            const timer = setInterval(() => { const now = performance.now(); longestGap = Math.max(longestGap, now - previous); previous = now; ticks++; }, 10);
            const start = performance.now();
            await LocationSearch.matchAsync('monterusciellx', 100000);
            clearInterval(timer);
            return { milliseconds: Math.round(performance.now() - start), ticks, longestGap: Math.round(longestGap) };
        });
        assert(timing.ticks > 1, 'la pagina continua a elaborare eventi durante il refuso');
        console.log(`${name}: refuso ${timing.milliseconds} ms, timer attivo ${timing.ticks} volte, pausa massima ${timing.longestGap} ms`);

        const input = page.locator('#query');
        await input.fill('brecsix');
        await page.waitForTimeout(100);
        await input.fill('Castro LE');
        await page.getByRole('option').filter({ hasText: 'Castro (LE)' }).waitFor();
        await page.waitForTimeout(700);
        assert.equal(await input.inputValue(), 'Castro LE');
        assert.equal(await page.getByRole('option').filter({ hasText: 'Brescia' }).count(), 0, 'il vecchio refuso non sovrascrive i suggerimenti');
        await input.fill('montemagnx');
        await input.press('Escape');
        await page.waitForTimeout(700);
        assert.equal(await input.getAttribute('aria-expanded'), 'false', 'Escape resta chiuso dopo il worker');
        await input.fill('brecsia');
        await input.press('Enter');
        await page.waitForFunction(() => submissions.length > 0);
        assert.equal(await page.evaluate(() => submissions.at(-1).id), '017029', 'Invio attende il luogo corretto');

        // Invio durante il calcolo, poi nuova digitazione: niente invio del vecchio testo.
        await page.reload();
        await page.evaluate(() => picker.ready);
        await input.fill('brecsia');
        await input.press('Enter');
        await input.fill('Moniga');
        await page.waitForTimeout(1200);
        assert.equal(await page.evaluate(() => submissions.length), 0);

        await page.goto(base + '?q=brecsia&comune=017029');
        await page.evaluate(() => picker.ready);
        assert.equal(await page.evaluate(() => picker.selected?.id), '017029', 'link dalla home con refuso e codice scelto');
        assert.equal(await input.inputValue(), 'brecsia', 'il link conserva il testo originale');

        for (const failure of ['unavailable', 'network', 'crash']) {
            if (failure === 'unavailable') await page.addInitScript(() => { window.Worker = undefined; });
            if (failure === 'network') await page.route('**/location-search-worker.js*', route => route.abort());
            if (failure === 'crash') {
                await page.unroute('**/location-search-worker.js*');
                await page.route('**/location-search-worker.js*', route => route.fulfill({ contentType: 'text/javascript', body: 'throw new Error("worker test")' }));
            }
            // Per network/crash serve una pagina senza lo script che disattiva Worker.
            const fallback = failure === 'unavailable' ? page : await browser.newPage();
            if (fallback !== page) await fallback.route('**/location-search-worker.js*', route => failure === 'network' ? route.abort() : route.fulfill({ contentType: 'text/javascript', body: 'throw new Error("worker test")' }));
            await fallback.goto(base);
            await fallback.evaluate(() => picker.ready);
            const result = await fallback.evaluate(async () => {
                let ticks = 0;
                const timer = setInterval(() => ticks++, 10);
                const found = await LocationSearch.matchAsync('brecsia', 100000);
                clearInterval(timer);
                return { ticks, found: found.map(item => [item.row.id, item.rank, item.fuzzy]) };
            });
            assert.deepEqual(result.found, expected.brecsia, `${name}: nessun risultato perso nel fallback ${failure}`);
            assert(result.ticks > 1, 'fallback a blocchi, senza congelare la pagina');
            if (fallback !== page) await fallback.close();
        }
        console.log(`OK ${name}: worker, refusi, alias, omonimi, Invio, Escape, risultati obsoleti e tre fallback`);
    } finally { await browser.close(); }
}
(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    try { for (const [name, engine] of [['Chromium', chromium], ['WebKit', webkit]]) await check(engine, name, base); }
    finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
