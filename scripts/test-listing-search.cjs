// Audit ripetibile: tutte le inserzioni di uno snapshot pubblico, senza scritture DB.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const fixtures = [
    { id: 'rivoltella', titolo: 'Posteggio Settimanale Rivoltella – Abbigliamento', comune: 'Rivoltella', regione: 'Lombardia', provincia: null, settore: 'Abbigliamento', giorni: 'Domenica', superficie: 35, prezzo: 10000, descrizione: 'Clientela fissa e posizione centrale.' },
    { id: 'multi', titolo: 'Licenze mercati', comune: 'Empoli - Pontedera-Fucecchio', regione: 'Toscana', prezzo: 22000, giorni: 'Lunedì, Martedì', superficie: 40 },
    { id: 'typo', titolo: 'Licenza ambulante', comune: 'terranova Bracciolini', regione: 'Toscana', prezzo: 5000, superficie: 20 },
    { id: 'described', titolo: 'Licenza mercato', comune: 'Chioggia', regione: 'Veneto', provincia: 'Venezia', descrizione: 'Banco di scarpe ortopediche e ricambi esclusivi.', prezzo: 8000, superficie: 25 },
    { id: 'extra', titolo: 'Mercato comune', comune: 'Milano', regione: 'Lombardia', dettagli_extra: JSON.stringify({ descrizione: 'Giacche impermeabili artigianali' }), prezzo: 18000, superficie: 30 },
    { id: 'sold', titolo: 'Venduto Rivoltella', comune: 'Rivoltella', regione: 'Lombardia', status: 'sold' },
    { id: 'pending', titolo: 'In attesa Rivoltella', comune: 'Rivoltella', regione: 'Lombardia', status: 'pending' },
    { id: 'deleted', titolo: 'Eliminato Rivoltella', comune: 'Rivoltella', regione: 'Lombardia', status: 'deleted' }
].map(row => ({ stato: 'Vendita', tipo: 'Mercato settimanale', user_id: 'seller', status: 'active', ...row }));
const snapshot = process.env.SEARCH_AUDIT_SNAPSHOT ? JSON.parse(fs.readFileSync(process.env.SEARCH_AUDIT_SNAPSHOT, 'utf8')) : [];
const listings = [...snapshot.map(row => ({ user_id: 'seller', ...row })), ...fixtures];
const publicListings = listings.filter(row => row.status === 'active');
const sandbox = { window: {}, AbortController, setTimeout, clearTimeout, fetch: async url => ({ ok: true, json: async () => JSON.parse(fs.readFileSync(path.join(root, url.split('?')[0]), 'utf8')) }) };
vm.createContext(sandbox);
for (const file of ['js/comune-picker.js', 'js/location-search.js', 'js/listing-search.js']) vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), sandbox);

const backend = `window._supabase={from(table){let columns='',filters=[];const q={select(value){columns=value;return q},eq(key,value){filters.push(row=>row[key]===value);return q},neq(key,value){filters.push(row=>row[key]!==value);return q},or(){filters.push(row=>row.status==='active'||row.user_id===window.TEST_SEARCH_USER?.id);return q},not(){return q},gt(){return q},order(){return q},limit(){return q},in(){return q},then(resolve){const source=window.TEST_EMPTY?[]:${JSON.stringify(listings)};const data=table==='annunci'?source.filter(row=>filters.every(filter=>filter(row))).map(row=>Object.fromEntries(columns.split(',').map(key=>key.trim()).filter(key=>key in row).map(key=>[key,row[key]]))):[];return Promise.resolve({data,error:window.TEST_ERROR?{message:'Connection unavailable',code:'NETWORK'}:null}).then(resolve)}};return q}};`;
const auth = `window.getCurrentUser=async()=>window.TEST_SEARCH_USER||null;window.updateAuthNav=()=>{};buildCard=(l,small,distance)=>'<article data-id="'+l.id+'" data-distance="'+distance+'">'+escapeHTML(l.titolo)+'</article>';window.observeCardViews=()=>{};`;
const server = http.createServer((req,res) => {
    let file = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).slice(1) || 'index.html';
    if (!path.extname(file)) file += '.html';
    const full = path.resolve(root, file);
    if (!full.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    res.setHeader('Content-Type', ({ '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json' })[path.extname(full)] || 'text/plain');
    if (file === 'js/supabase-config.js') return res.end(backend);
    if (file === 'js/auth.js') return res.end(auth);
    if (['js/ui-components.js','js/page-view-tracker.js'].includes(file)) return res.end('');
    fs.readFile(full, (error,data) => error ? res.writeHead(404).end() : res.end(data));
});

function mutations(value) {
    const text = sandbox.window.ComuniItaliani.normalize(value);
    const variants = new Set([text, text.toUpperCase(), '  ' + text.replaceAll(' ', '   ') + '  ', text.split(' ').reverse().join(' ')]);
    const tokens = text.split(' ');
    for (let n = 0; n < tokens.length; n++) {
        const word = tokens[n];
        if (word.length < 4 || /^\d+$/.test(word)) continue;
        const replace = changed => { const copy = tokens.slice(); copy[n] = changed; variants.add(copy.join(' ')); };
        for (let i = 0; i < word.length; i++) {
            replace(word.slice(0,i) + word.slice(i+1));
            replace(word.slice(0,i) + 'x' + word.slice(i));
            replace(word.slice(0,i) + (word[i] === 'x' ? 'z' : 'x') + word.slice(i+1));
            if (i + 1 < word.length) replace(word.slice(0,i) + word[i+1] + word[i] + word.slice(i+2));
        }
    }
    return [...variants];
}

async function checkBrowser(engine, name, mobile, base) {
    const browser = await engine.launch({ headless:true });
    try {
        const context = await browser.newContext({ viewport: mobile ? { width:390,height:844 } : { width:1280,height:900 }, hasTouch:mobile });
        await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.fulfill({ status:200,body:'' }));
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        for (const query of ['Rivoltella','Rivoltela','Rivolttella','Rivotlella','abbigliament rivoltela','rivol']) {
            await page.goto(base);
            await page.locator('#searchInput').fill(query);
            await page.locator('#searchInput').press('Enter');
            await page.waitForURL('**/annunci?*');
            await page.locator('[data-id="rivoltella"]').waitFor();
            assert.equal(new URL(page.url()).searchParams.get('q'), query);
        }
        await page.locator('#searchBar').fill('Rivoltella');
        await page.locator('#searchBarWrapper button').click();
        await page.locator('[data-id="rivoltella"]').waitFor();
        assert.equal(await page.locator('[data-id="sold"],[data-id="pending"],[data-id="deleted"]').count(), 0);
        await page.evaluate(async () => { window.TEST_SEARCH_USER={id:'different-buyer'};await loadListings(); });
        await page.locator('[data-id="rivoltella"]').waitFor();
        assert.equal(await page.locator('[data-id="sold"],[data-id="pending"],[data-id="deleted"]').count(), 0);
        for (const [query,id] of [['scarpe ortopdiche','described'],['impermeabli artigianali','extra'],['terraNUOVA bracciolini','typo'],['Pontedera','multi'],['Fucecchio','multi']]) {
            await page.locator('#searchBar').fill(query);
            await page.locator('#searchBar').press('Enter');
            await page.locator('[data-id="'+id+'"]').waitFor();
        }
        // Provincia suggerita e coordinate di ogni città esplicitamente elencata.
        await page.locator('#searchBar').fill('Fucecchio');
        const choice=page.getByRole('option').filter({hasText:'Fucecchio (FI)'});
        await (mobile?choice.tap():choice.click());
        await page.selectOption('#radiusKm','50');
        await page.locator('[data-id="multi"]').waitFor();
        await page.waitForFunction(() => Number.parseFloat(document.querySelector('[data-id="multi"]')?.dataset.distance) < 1);
        assert(Number(await page.locator('[data-id="multi"]').getAttribute('data-distance')) < 1);

        // Verifica nel filtro reale che ogni annuncio dello snapshot si trovi per luogo e titolo.
        if (snapshot.length && name==='chromium' && !mobile && !process.env.SEARCH_SKIP_DOM_MATRIX) {
            const failures = await page.evaluate(async rows => {
                clearFilters();
                const failures=[];
                for (const row of rows) for (const query of [row.comune,row.titolo]) {
                    sBar.value=query;
                    await applyFilters();
                    await new Promise(resolve=>setTimeout(resolve,180));
                    if (!document.querySelector('[data-id="'+row.id+'"]')) failures.push({id:row.id,query});
                }
                return failures;
            }, snapshot);
            assert.deepEqual(failures,[]);
            console.log('OK DOM: luogo e titolo di tutti i '+snapshot.length+' annunci pubblici.');
        }

        await page.evaluate(() => clearFilters());
        await page.locator('#searchBar').fill('Rivoltella');
        await page.locator('#searchBar').press('Enter');
        await page.selectOption('#fRegione','Toscana',{force:true});
        await page.locator('#emptyState').waitFor({state:'visible'});
        assert.equal(await page.locator('[data-id="rivoltella"]').count(),0);
        await page.evaluate(() => clearFilters());
        const filterChecks = await page.evaluate(async () => {
            const failures=[];
            const check=async (label,predicate)=>{await applyFilters();await new Promise(resolve=>setTimeout(resolve,180));const actual=[...document.querySelectorAll('[data-id]')].map(el=>el.dataset.id).sort();const expected=LISTINGS.filter(predicate).map(row=>row.id).sort();if(JSON.stringify(actual)!==JSON.stringify(expected))failures.push({label,actual,expected});};
            document.getElementById('fPrezzoMin').value='10.000';document.getElementById('fPrezzoMax').value='20.000';
            await check('prezzo italiano',row=>row.prezzo!=null&&Number(row.prezzo)>=10000&&Number(row.prezzo)<=20000);
            document.getElementById('fPrezzoMin').value='';document.getElementById('fPrezzoMax').value='';document.getElementById('fSup').value='35';
            await check('superficie',row=>row.superficie!=null&&Number(row.superficie)>=35);
            document.getElementById('fSup').value='';document.getElementById('fStato').value='Vendita';
            await check('vendita',row=>row.stato==='Vendita');
            document.getElementById('fStato').value='';document.getElementById('fTipo').value='Mercato settimanale';
            await check('tipo',row=>ComuniItaliani.normalize(row.tipo)==='mercato settimanale');
            document.getElementById('fTipo').value='';
            const day=document.querySelector('#dayChipsDesktop [data-day="Domenica"]');day.classList.add('selected');
            await check('giorni',row=>String(row.giorni||'').split(',').map(_normalizeDayName).includes('domenica'));
            day.classList.remove('selected');
            // Gli stessi vincoli devono valere dopo una scelta geografica.
            return failures;
        });
        assert.deepEqual(filterChecks,[]);
        if (mobile) {
            await page.evaluate(() => { document.getElementById('m_fPrezzoMin').value='10.000';document.getElementById('m_fPrezzoMax').value='20.000';applyMobileFilters(); });
            await page.waitForFunction(()=>[...document.querySelectorAll('[data-id]')].every(el=>{const price=LISTINGS.find(row=>row.id===el.dataset.id).prezzo;return price!=null&&price>=10000&&price<=20000;}));
            await page.evaluate(() => clearFilters());
        }
        await page.selectOption('#sortBy','prezzoAsc');
        const ordered = await page.evaluate(async () => { await applyFilters();await new Promise(resolve=>setTimeout(resolve,180));return [...document.querySelectorAll('[data-id]')].map(el=>LISTINGS.find(row=>row.id===el.dataset.id).prezzo).filter(value=>value!=null); });
        assert.deepEqual(ordered,ordered.slice().sort((a,b)=>a-b));
        await page.evaluate(async () => { window.TEST_EMPTY=true;await loadListings(); });
        await page.locator('#emptyState').waitFor({state:'visible'});
        assert.equal(await page.evaluate(()=>LISTINGS.length),0,'una risposta vuota cancella i risultati precedenti');
        await page.evaluate(async () => { window.TEST_EMPTY=false;window.TEST_ERROR=true;await loadListings(); });
        await page.getByText('Impossibile caricare gli annunci').waitFor();
        await page.evaluate(async () => { window.TEST_ERROR=false;await loadListings(); });
        await page.locator('[data-id="rivoltella"]').waitFor();
        assert.deepEqual(errors,[]);
        console.log('OK '+name+' '+(mobile?'mobile':'desktop')+': Invio/Cerca, refusi, frasi, descrizioni, multi-città, account, filtri, ordine, errore e retry.');
    } finally { await browser.close(); }
}

(async () => {
    const alias = { comune:'Quero Vas',regione:'Veneto',titolo:'Licenza' };
    assert.equal(sandbox.window.ListingSearch.score(alias,'Setteville'),0);
    await sandbox.window.LocationSearch.load();
    await sandbox.window.LocationSearch.loadGeo();
    assert(sandbox.window.ListingSearch.score(alias,'Setteville')>0,'ricostruisce il contesto dopo il caricamento/ripristino dei comuni');
    const score = sandbox.window.ListingSearch.score;
    let count=0;
    for (const row of process.env.SEARCH_SKIP_MATRIX ? [] : publicListings) {
        for (const value of [row.comune,row.titolo]) for (const query of mutations(value)) { assert(score(row,query)>0, 'Non trovato: '+row.id+' / '+query);count++; }
        for (const part of row.comune.split(/[,;/|]|\s*-\s*/).map(part=>part.trim()).filter(Boolean)) assert(score(row,part)>0,'Città multipla non trovata: '+part);
    }
    assert.equal(score(fixtures[0],'Rivoltella calzature'),0,'tutte le parole richieste devono corrispondere');
    assert.equal(score(fixtures[0],'Roma'),0,'evita parole estranee');
    assert(score(fixtures[0],'Rivoltella')>score(fixtures[0],'Rivoltela'),'il nome esatto precede il refuso');
    if (count) console.log('OK '+count+' ricerche: '+snapshot.length+' annunci reali e regressioni, ogni posizione di eliminazione/inserimento/sostituzione/scambio di una lettera, maiuscole, spazi e parole invertite.');
    const before=JSON.stringify(listings);
    if (process.env.SEARCH_UNIT_ONLY) return;
    const playwright=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base='http://127.0.0.1:'+server.address().port;
    try { for(const name of (process.env.COMUNE_TEST_BROWSERS || 'chromium,webkit').split(',')) for(const mobile of [false,true]) await checkBrowser(playwright[name],name,mobile,base); }
    finally { await new Promise(resolve=>server.close(resolve)); }
    assert.equal(JSON.stringify(listings),before,'la ricerca non modifica gli annunci');
})().catch(error=>{console.error(error);process.exitCode=1;});
