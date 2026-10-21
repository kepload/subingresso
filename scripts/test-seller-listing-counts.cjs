// Conteggi reali del venditore, con dati/sessioni simulati e nessuna scrittura esterna.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const artifactDir = process.env.SELLER_COUNT_QA_DIR;
const users = ['solo', 'due', 'quattro', 'dieci', 'molti', 'vuoto'];
const rows = users.flatMap((user_id, index) => Array.from({ length: [1, 2, 4, 10, 11, 0][index] }, (_, i) => ({ id: user_id + i, user_id, status: 'active', expires_at: null })));
rows.push({ user_id: 'due', status: 'pending' }, { user_id: 'due', status: 'deleted' }, { user_id: 'due', status: 'active', expires_at: '2000-01-01T00:00:00Z' });
const listing = { id: 'listing', titolo: 'Posteggio mercato', tipo: 'Mercato', giorni: 'Lunedì', comune: 'Brescia', regione: 'Lombardia', stato: 'Vendita', prezzo: 12000, created_at: '2026-01-01', status: 'active' };
function fixture() {
    return `<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/css/tailwind.css"><link rel="stylesheet" href="/css/design-system.css"><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"><body><main style="padding:16px;max-width:1100px;margin:auto"><h1>Posteggi dello stesso venditore</h1><div id="cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px"></div></main><script>
window.qaRows=${JSON.stringify(rows)};window.qaRequests=[];window.qaFail=false;
const _supabase={from:table=>({filters:{},select(columns){this.columns=columns;return this;},in(key,values){this.ids=values;return this;},eq(key,value){this.filters[key]=value;return this;},or(value){this.expiry=value;return this;},order(){return this;},range(start,end){this.start=start;this.end=end;return this;},async then(resolve,reject){try{qaRequests.push({table,columns:this.columns,ids:this.ids,filters:this.filters,expiry:this.expiry,start:this.start,end:this.end});await new Promise(r=>setTimeout(r,20));if(qaFail)return resolve({data:null,error:{message:'offline'}});const now=this.expiry?.match(/expires_at.gt.([^,]+)/)?.[1];const data=qaRows.filter(row=>this.ids.includes(row.user_id)&&row.status===this.filters.status&&(!row.expires_at||Date.parse(row.expires_at)>Date.parse(now))).slice(this.start,this.end+1).map(row=>({user_id:row.user_id}));resolve({data,error:null});}catch(e){reject(e);}}})};
</script><script src="/js/image-urls.js"></script><script src="/js/data.js"></script><script>
for(const id of ${JSON.stringify(users)}) USER_NAMES[id]=id==='quattro'?'Giovanni Alessandro Mercatale Cognome Molto Lungo':id;
window.render=()=>{document.getElementById('cards').innerHTML=${JSON.stringify(users)}.map(id=>buildCard({...${JSON.stringify(listing)},id,user_id:id})).join('');};render();
</script></body></html>`;
}
const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://localhost').pathname;
    if (pathname === '/fixture') { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.end(fixture()); return; }
    const file = path.resolve(root, '.' + pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.readFile(file, (error, bytes) => {
        if (error) { res.writeHead(404).end(); return; }
        res.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : file.endsWith('.woff') ? 'font/woff' : 'text/javascript; charset=utf-8'); res.end(bytes);
    });
});
(async () => {
    if (artifactDir) fs.mkdirSync(artifactDir, { recursive: true });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    try {
        for (const [engine, name, width] of [[chromium, 'Chromium', 1440], [chromium, 'Chromium', 320], [webkit, 'WebKit', 390]]) {
            const browser = await engine.launch({ headless: true });
            try {
                const page = await browser.newPage({ viewport: { width, height: 1000 } });
                const errors = []; page.on('pageerror', error => { errors.push(error.message); console.error('Browser:', error.message); });
                await page.goto(`http://127.0.0.1:${server.address().port}/fixture`);
                await page.waitForFunction(() => USER_ACTIVE_LISTING_COUNTS.size === 6);
                assert.deepEqual(await page.locator('.seller-listing-count-slot').allTextContents(), ['', '2', '4', '10', '10+', '']);
                assert.equal(await page.locator('[data-seller-listing-count="molti"] [aria-label="11 annunci attivi"]').count(), 1);
                assert.equal(await page.locator('[data-seller-listing-count="solo"]').isVisible(), false);
                const requests = await page.evaluate(() => qaRequests);
                assert.equal(requests.length, 1, 'Una sola richiesta per le card della pagina');
                assert.equal(requests[0].columns, 'user_id');
                assert.equal(requests[0].filters.status, 'active');
                assert(requests[0].expiry.includes('expires_at.is.null'));
                assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
                if (artifactDir) await page.screenshot({ path: path.join(artifactDir, `${name}-${width}-soglie.png`), fullPage: true });
                // Il conteggio copre anche annunci che non sono nelle card o nei filtri correnti.
                await page.locator('[data-listing-id="due"] a[href="/profilo?id=due"]').focus();
                assert.equal(await page.evaluate(() => document.activeElement.href.endsWith('/profilo?id=due')), true);
                // Paginazione API: il milleunesimo annuncio appartiene a un altro venditore.
                await page.evaluate(() => {
                    USER_ACTIVE_LISTING_COUNTS.clear(); qaRequests.length = 0;
                    qaRows = [...Array.from({ length: 1000 }, () => ({ user_id: 'molti', status: 'active' })), ...Array.from({ length: 2 }, () => ({ user_id: 'due', status: 'active' }))]; render(); render();
                });
                await page.waitForFunction(() => USER_ACTIVE_LISTING_COUNTS.get('due') === 2);
                assert.equal(await page.locator('[data-seller-listing-count="due"]').textContent(), '2');
                assert.equal(await page.evaluate(() => qaRequests.length), 2, 'Pagine complete e richieste duplicate accorpate');
                // Su errore nessun numero inventato; un rendering successivo può riprovare.
                await page.evaluate(() => { USER_ACTIVE_LISTING_COUNTS.clear(); qaFail = true; render(); });
                await page.waitForFunction(() => !_sellerCountPending.size && !_sellerCountQueue.size);
                assert.equal(await page.locator('.seller-listing-count').count(), 0);
                await page.evaluate(() => { qaFail = false; render(); });
                await page.waitForFunction(() => USER_ACTIVE_LISTING_COUNTS.get('due') === 2);
                // Più di 80 venditori non producono un URL senza limite.
                await page.evaluate(() => {
                    USER_ACTIVE_LISTING_COUNTS.clear(); qaRequests.length = 0;
                    document.getElementById('cards').innerHTML = Array.from({ length: 81 }, (_, i) => sellerListingCountHtml('utente-' + i)).join('');
                });
                await page.waitForFunction(() => USER_ACTIVE_LISTING_COUNTS.size === 81);
                assert.deepEqual(await page.evaluate(() => qaRequests.map(r => r.ids.length)), [80, 1]);
                assert.deepEqual(errors, []);
                console.log('PASS', name, width, 'soglie, scaduti/revisione, totale, paginazione, errore/riprova, profilo, batch');
            } finally { await browser.close(); }
        }
    } finally { await new Promise(resolve => server.close(resolve)); }
})().catch(error => { console.error(error); process.exitCode = 1; });
