// Browser regressions. Requires Playwright; optional PLAYWRIGHT_MODULE and
// PLAYWRIGHT_CHROMIUM_EXECUTABLE let an existing local installation be used.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const publishedHtml = process.env.FORM_TEST_HTML ? fs.readFileSync(process.env.FORM_TEST_HTML,'utf8') : null;
const ownerA = '11111111-1111-1111-1111-111111111111';
const ownerB = '22222222-2222-2222-2222-222222222222';
const draftKey = owner => 'subingresso_draft_v2_' + owner;
const authKey = 'sb-test-auth-token';
const session = owner => ({ user: { id: owner, email: 'test@example.invalid', user_metadata: {} }, access_token: 'test-token', refresh_token: 'test-refresh', expires_at: 9999999999 });
const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWNQyVyLFTEMLQkAikpOgV4lvm4AAAAASUVORK5CYII=', 'base64');
const photos = n => Array.from({ length: n }, (_, i) => ({ name: `foto-${i}.png`, mimeType: 'image/png', buffer: image }));

for (const file of ['vendi.html', 'modifica-annuncio.html']) {
    for (const [, source] of fs.readFileSync(path.join(root, file), 'utf8').matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(source, { filename: file });
}
const sandbox = { window: {}, sessionStorage: { getItem: () => null, setItem: () => {} } };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root, 'js/pages/vendi-support.js'), 'utf8'), sandbox);
const support = sandbox.window.VendiSupport;
let variants = 0;
for (const tipo of ['Mercato settimanale', 'Fiera']) for (const stato of ['Vendita', 'Affitto mensile']) {
    const data = { tipo, stato, comune: 'Brescia', merce: 'Abbigliamento e accessori', superficie: '24', giorni: 'Sabato', nomeFiera: 'Fiera di San Faustino' };
    const titles = support.titleCandidates(data);
    assert(titles.length >= 40);
    variants += titles.length;
    for (const title of titles) {
        assert(title.includes('Brescia'));
        assert(title.length <= 110);
        assert(!/ottim|clientela|reddit|in regola/i.test(title));
        assert(stato === 'Vendita' ? !/affitt/i.test(title) : !/vendo|vendita|cedo|cessione/i.test(title));
    }
    assert.notEqual(support.chooseTitle(data, titles[0]), titles[0]);
}
for (const titolo of support.titleCandidates({tipo:'Mercato settimanale',stato:'Vendita',comune:'Brescia',giorni:'Lunedì, Sabato'})) assert(!titolo.includes('del lunedì, sabato'));
for (const [raw, expected] of [['15.000', 15000], ['15.000,50', 15000.5], ['15000.50', 15000.5], ['12,5', 12.5]]) assert.equal(support.parseNumber(raw, true), expected);
for (const raw of ['12abc', 'Infinity', '1e5', '-24', '1.234.56', '1,234']) assert(Number.isNaN(support.parseNumber(raw, true)), raw);

const clientStub = `
window.__authListeners = [];
window.__testListing = null;
window.__client = {
 auth: {
  onAuthStateChange: fn => { window.__authListeners.push(fn); return {data:{subscription:{unsubscribe(){}}}}; },
  getSession: async () => ({data:{session:JSON.parse(localStorage.getItem('${authKey}') || 'null')}}),
  refreshSession: async () => window.__client.auth.getSession(),
  setSession: async () => window.__client.auth.getSession()
 },
 rpc: () => Promise.resolve({data:[{tel:'3471234567'}],error:null}),
 from: () => {
  const query = { select(){return this;},eq(){return this;},or(){return this;},update(value){window.__savedUpdate=value;return this;},
   single: async () => ({data:window.__savedUpdate?{id:'test-id'}:window.__testListing,error:null}),
   maybeSingle: async () => ({data:{is_admin:false},error:null}),
   then: (resolve, reject) => Promise.resolve({data:[],error:null}).then(resolve,reject)
  }; return query;
 }
};
window.supabase = {createClient:()=>window.__client};
`;
const authStub = `window.getCurrentUser=async()=>JSON.parse(localStorage.getItem('${authKey}')||'null')?.user||null; window.openAuthModal=()=>{window.__authRequested=true;};`;
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let filename = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
    if (!path.extname(filename)) filename += '.html';
    const full = path.resolve(root, filename);
    if (!full.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    if (filename === 'vendi.html' && publishedHtml) { res.setHeader('Content-Type','text/html; charset=utf-8'); res.end(publishedHtml); return; }
    if (filename === 'js/auth.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(authStub); return; }
    if (filename === 'js/page-view-tracker.js' || (filename === 'js/ui-components.js' && !process.env.FORM_TEST_SHELL)) { res.setHeader('Content-Type', 'text/javascript'); res.end(''); return; }
    fs.readFile(full, (error, data) => {
        if (error) { res.writeHead(404).end(); return; }
        res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[path.extname(full)] || 'application/octet-stream');
        res.end(data);
    });
});

(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const browser = await playwright[process.env.FORM_TEST_BROWSER || 'chromium'].launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
    const errors = [];
    const inserts = [];
    let uploads = 0;
    let failUpload = false;
    let locationReply = true;
    let locationDelay = 0;
    let locationCalls = 0;
    let rejectLocationInsert = false;
    async function newPage(owner = null, mobile = false) {
        const context = await browser.newContext({ viewport: process.env.FORM_TEST_WIDTH ? {width:Number(process.env.FORM_TEST_WIDTH),height:900} : mobile ? {width:390,height:844} : {width:1280,height:900}, hasTouch:mobile, reducedMotion: 'reduce' });
        await context.route('https://cdn.jsdelivr.net/**', route => route.fulfill({ contentType:'text/javascript', body:clientStub }));
        await context.route('https://cdnjs.cloudflare.com/**', route => route.fulfill({ body:'' }));
        if (process.env.FORM_TEST_SHELL) await context.route('https://cdnjs.cloudflare.com/**', route => route.continue());
        await context.route('https://fonts.googleapis.com/**', route => route.fulfill({ body:'' }));
        await context.route('https://*.supabase.co/**', async route => {
            const request = route.request();
            const url = request.url();
            if (url.includes('/rpc/validate_listing_location')) {
                locationCalls++;
                const reply=locationReply, delay=locationDelay;
                if(reply==='timeout') {
                    await new Promise(resolve=>setTimeout(resolve,8500));
                    return route.fulfill({contentType:'application/json',body:'true'}).catch(()=>{});
                }
                if(delay) await new Promise(resolve=>setTimeout(resolve,delay));
                if(reply==='offline') return route.abort('failed');
                if(reply==='http') return route.fulfill({status:503,contentType:'application/json',body:'{}'});
                return route.fulfill({contentType:'application/json',body:JSON.stringify(reply)});
            }
            if (url.includes('/storage/')) {
                uploads++;
                const failed = failUpload;
                failUpload = false;
                return route.fulfill({status:failed?500:200,contentType:'application/json',body:'{}'});
            }
            if (url.includes('/annunci') && request.method() === 'POST') {
                if(rejectLocationInsert) { rejectLocationInsert=false; return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({code:'23514',message:'Controlla i dati dell’annuncio: localita'})}); }
                inserts.push(request.postDataJSON());
                return route.fulfill({contentType:'application/json',body:JSON.stringify({id:'test-listing-id'})});
            }
            const own=url.includes('/rpc/get_my_profile');
            return route.fulfill({contentType:'application/json',body:own?'{"nome":"Profilo","cognome":"Test","telefono":"3471234567"}':'[{"nome":"Profilo","cognome":"Test","telefono":"3471234567"}]'});
        });
        if (owner) await context.addInitScript(({ authKey, stored }) => {
            if (!sessionStorage.getItem('fixtureAuth')) { localStorage.setItem(authKey, JSON.stringify(stored)); sessionStorage.setItem('fixtureAuth','1'); }
        }, { authKey, stored:session(owner) });
        const page = await context.newPage();
        page.setDefaultTimeout(10000);
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(base + '/vendi');
        await page.waitForFunction(() => _draftReady && _comunePicker);
        return page;
    }
    async function active(page, step) { await page.waitForFunction(n => document.getElementById('step'+n).classList.contains('active'), step); }
    async function captureThemes(page, stem) {
        if (!process.env.FORM_SCREENSHOT_DIR) return;
        fs.mkdirSync(process.env.FORM_SCREENSHOT_DIR, {recursive:true});
        for (const dark of [false, true]) {
            await page.evaluate(dark => document.documentElement.classList.toggle('admin-dark', dark), dark);
            await page.screenshot({path:path.join(process.env.FORM_SCREENSHOT_DIR,stem + (dark ? '-dark' : '-light') + '.png'),fullPage:true});
            let snapshot = (await page.content()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
            snapshot = snapshot.replace(/(href|src)="(?!https?:|data:|blob:|#|\/)([^"]+)"/g, '$1="/$2"');
            // Keep only the active step in the standalone visual fixture.
            snapshot = snapshot.replace(/<div id="step\d+" class="step-panel">[\s\S]*?(?=<div id="step\d+" class="step-panel|<\/form>)/g, '');
            fs.writeFileSync(path.join(process.env.FORM_SCREENSHOT_DIR,stem + (dark ? '-dark' : '-light') + '.html'), snapshot);
        }
        await page.evaluate(() => document.documentElement.classList.remove('admin-dark'));
    }
    async function next(page, step) { await page.locator('#step'+step).getByRole('button',{name:/^Avanti/}).click(); await active(page,step+1); }
    async function fillWizard(page, fair = false) {
        await page.locator('.tipo-card').first().click();
        await page.locator('#fComune').fill('Brescia');
        await page.waitForFunction(() => !!_comunePicker.getValue());
        if (fair) await page.locator('#tipoBtn1').click();
        await next(page,2);
        if (fair) { await page.locator('#fNomeFieraInput').fill('Fiera di San Faustino'); await page.locator('#fNoteFiera').fill('Ogni febbraio, un giorno'); }
        else await page.locator('[data-day="Sabato"]').click();
        await page.locator('#macroNonAlim').click();
        await page.getByRole('button',{name:'Abbigliamento e accessori',exact:true}).click();
        await page.locator('#fSuperficie').fill('24,5');
        await next(page,3);
        await page.locator('#fPrezzo').fill('15.000,50');
        await next(page,4);
        await page.getByRole('button',{name:'Aiutami a scriverla'}).click();
        await page.locator('#fNome').fill('Contatto scelto');
        await page.locator('#fTel').fill('3477654321');
    }
    try {
        if (process.env.FORM_VISUAL_ONLY) {
            const page = await newPage(ownerA, true);
            assert.equal(await page.locator('main').evaluate(el => getComputedStyle(el).paddingBottom), page.viewportSize().width < 640 ? '128px' : '40px');
            await captureThemes(page, 'tipo');
            await page.locator('.tipo-card').first().click();
            await page.locator('#fComune').fill('A');
            await page.waitForFunction(() => document.getElementById('comuneStatus').textContent === '');
            await captureThemes(page, 'posizione');
            await page.locator('#fComune').fill('Brescia');
            await page.waitForFunction(() => !!_comunePicker.getValue());
            await next(page, 2);
            await page.locator('[data-day="Sabato"]').click();
            await page.locator('#macroNonAlim').click();
            await page.getByRole('button',{name:'Abbigliamento e accessori',exact:true}).click();
            await page.locator('#fSuperficie').fill('24');
            await next(page, 3);
            await page.locator('#fPrezzo').fill('15000');
            await captureThemes(page, 'prezzo');
            await next(page, 4);
            await captureThemes(page, 'dettagli-vuoto');
            assert(await page.locator('#photoAdvice').isVisible());
            await page.locator('#fileInput').setInputFiles(photos(1));
            await page.waitForFunction(() => _files.length === 1);
            assert(await page.locator('#photoAdvice').isHidden());
            await captureThemes(page, 'dettagli-foto');
            await page.locator('#coverPreview .photo-remove').click();
            assert(await page.locator('#photoAdvice').isVisible());
            assert.equal(await page.locator('#photoProgress').count(), 0);
            assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
            assert.deepEqual(errors, []);
            console.log('OK: visual flow, both themes, real footer gap, idle text removed, red advice hides/reappears and no overflow; no remote writes.');
            return;
        }
        // Errori subito al passo 2, retry e risposte tardive senza perdere la bozza.
        const early = await newPage(ownerA,true);
        await early.locator('.tipo-card').first().click();
        await early.evaluate(()=>_comunePicker.setValue('Trento','Trentino-Alto Adige'));
        const earlyNext=early.locator('#locationNextBtn');
        for(const reply of [false,'http',{},'offline','timeout']) {
            locationReply=reply;
            const calls=locationCalls;
            await earlyNext.click();
            await early.waitForFunction(()=>!_nextStepPending && !!document.getElementById('fComune-error'));
            assert.equal(locationCalls,calls+1);
            await active(early,2);
            assert.equal(await early.locator('#fComune').inputValue(),'Trento');
            assert.equal(await earlyNext.isEnabled(),true);
            assert.match(await early.locator('#fComune-error').innerText(),reply===false?/Sceglila di nuovo/:/Premi di nuovo Avanti/);
            assert.equal(await early.evaluate(key=>JSON.parse(localStorage.getItem(key)).comune,draftKey(ownerA)),'Trento');
            assert.equal(uploads,0);assert.equal(inserts.length,0);
        }
        if(process.env.FORM_SCREENSHOT_DIR){
            fs.mkdirSync(process.env.FORM_SCREENSHOT_DIR,{recursive:true});
            await early.screenshot({path:path.join(process.env.FORM_SCREENSHOT_DIR,'localita-errore-passo2.png'),fullPage:true});
        }
        locationReply=true;locationDelay=300;
        await earlyNext.click();
        await early.waitForFunction(()=>_nextStepPending);
        assert.equal(await earlyNext.isDisabled(),true);
        await early.evaluate(()=>_comunePicker.setValue('Aosta',"Valle d'Aosta"));
        await early.waitForFunction(()=>!_nextStepPending);
        await active(early,2);
        assert.equal(await early.locator('#fComune').inputValue(),'Aosta');
        assert.equal(await early.locator('#fComune-error').count(),0);
        const calls=locationCalls;
        await early.evaluate(()=>{nextStep();nextStep();});
        await active(early,3);
        assert.equal(locationCalls,calls+1,'doppio clic: una sola verifica');
        await early.locator('#step3').getByRole('button',{name:'Indietro'}).click();
        await earlyNext.click();
        await early.waitForFunction(()=>_nextStepPending);
        await early.locator('#step2').getByRole('button',{name:'Indietro'}).click();
        await early.waitForFunction(()=>!_nextStepPending);
        await active(early,1);
        locationDelay=0;
        await early.context().close();

        // Bozza già al passo 6: il controllo precede le foto e torna al campo.
        const resumed=await newPage(ownerA,true);
        await fillWizard(resumed);
        const resumedPhotos=process.env.FORM_LOCATION_ONLY==='1'?0:1;
        if(resumedPhotos){
            await resumed.evaluate(() => {
                const save = VendiSupport.savePhotos;
                VendiSupport.savePhotos = (...args) => save(...args).catch(error => { window.__photoSaveError = error.name + ': ' + error.message; throw error; });
            });
            await resumed.locator('#fileInput').setInputFiles(photos(1));
            await resumed.waitForFunction(()=>_files.length===1 && !_photosUnsaved).catch(async error => {
                console.log('Photo fixture state:', await resumed.evaluate(() => ({files:_files.length, unsaved:_photosUnsaved, failed:_photoWriteFailed, photoError:window.__photoSaveError})));
                throw error;
            });
            await resumed.evaluate(()=>_persistDraftPhotos());
        }
        await resumed.locator('#toStep6Btn').click();
        await active(resumed,6);
        await resumed.reload();
        await active(resumed,6);
        const oldUploads=uploads,oldInserts=inserts.length;
        locationReply=false;
        await resumed.locator('#submitBtn').click();
        await active(resumed,2);
        await resumed.locator('#fComune-error').waitFor();
        assert.equal(uploads,oldUploads);assert.equal(inserts.length,oldInserts);
        assert.equal(await resumed.evaluate(()=>_files.length),resumedPhotos);
        assert.equal(await resumed.locator('#fPrezzo').inputValue(),'15000,5');
        locationReply=true;
        await next(resumed,2);
        await resumed.evaluate(()=>goToStep(6));
        rejectLocationInsert=true;
        await resumed.locator('#submitBtn').click();
        await active(resumed,2);
        await resumed.locator('#fComune-error').waitFor();
        assert.equal(await resumed.locator('#stepErrorMsg').isVisible(),false);
        assert(!/23514|localita/.test(await resumed.locator('#fComune-error').innerText()));
        assert.equal(await resumed.evaluate(()=>_files.length),resumedPhotos);
        await resumed.context().close();
        uploads=0;
        console.log('OK: località al passo 2, errori rete/timeout, retry, doppio clic, risposte tardive e bozza ripresa al passo 6.');
        if(process.env.FORM_LOCATION_ONLY==='1') return;

        const locationPage = await newPage(null, true);
        await locationPage.locator('.tipo-card').first().click();
        await locationPage.locator('#fComune').fill('Moniga');
        await locationPage.getByRole('option', {name:/^Moniga del Garda/}).waitFor({state:'visible'});
        if (process.env.FORM_SCREENSHOT_DIR) {
            fs.mkdirSync(process.env.FORM_SCREENSHOT_DIR, {recursive:true});
            await locationPage.screenshot({path:path.join(process.env.FORM_SCREENSHOT_DIR, 'comuni-vendita-mobile.png'),fullPage:true});
        }
        await next(locationPage, 2);
        assert.equal(await locationPage.locator('#fComune').inputValue(), 'Moniga del Garda');
        assert.equal(await locationPage.locator('#fProvincia').inputValue(), 'Brescia');
        assert.equal(await locationPage.locator('#fRegione').inputValue(), 'Lombardia');
        await locationPage.locator('#step3').getByRole('button', {name:'Indietro'}).click();
        await locationPage.locator('#fComune').fill('Castro');
        await locationPage.locator('#step2').getByRole('button', {name:/^Avanti/}).click();
        await active(locationPage, 2);
        assert.equal(await locationPage.locator('#fProvincia').inputValue(), '');
        await locationPage.getByRole('option', {name:/^Castro \(LE\)/}).click();
        await next(locationPage, 2);
        assert.equal(await locationPage.locator('#fProvincia').inputValue(), 'Lecce');
        assert.equal(await locationPage.evaluate(key => JSON.parse(localStorage.getItem(key)).regione, draftKey('guest')), 'Puglia');
        await locationPage.locator('#step3').getByRole('button', {name:'Indietro'}).click();
        await locationPage.locator('#fComune').fill('Rivoltella');
        await locationPage.getByRole('option').filter({hasText:'Rivoltella (Desenzano del Garda)'}).click();
        await next(locationPage, 2);
        await locationPage.reload();
        await active(locationPage, 3);
        assert.equal(await locationPage.locator('#fComune').inputValue(), 'Rivoltella (Desenzano del Garda)');
        assert.equal(await locationPage.locator('#fProvincia').inputValue(), 'Brescia');
        assert.equal(await locationPage.evaluate(key => JSON.parse(localStorage.getItem(key)).comune, draftKey('guest')), 'Rivoltella (Desenzano del Garda)');
        await locationPage.context().close();
        console.log('OK: Moniga abbreviato con Avanti, lista visibile, omonimi e bozza aggiornata dopo la scelta.');

        const page = await newPage(ownerA, true);
        const width = page.viewportSize().width;
        assert.equal(await page.locator('main').evaluate(el => getComputedStyle(el).paddingBottom), width < 640 ? '128px' : '40px');
        const gap = await page.evaluate(() => document.querySelector('footer').getBoundingClientRect().top - document.querySelector('#step1 .grid').getBoundingClientRect().bottom);
        assert(gap >= (process.env.FORM_TEST_WIDTH && Number(process.env.FORM_TEST_WIDTH) >= 640 ? 40 : 128), 'space between choices and footer');
        await captureThemes(page, 'tipo-annuncio-mobile');
        await fillWizard(page);
        assert(await page.locator('#dropzone').isVisible());
        assert(await page.locator('#additionalPhotos').isHidden());
        assert(await page.locator('#photoAdvice').isVisible());
        assert(await page.locator('#draftStatus').isHidden());
        assert.equal(await page.locator('h1:visible').count(), 1);
        assert(!(await page.locator('main').innerText()).includes('Vendi la tua licenza ambulante'));
        assert.equal(await page.locator('#photoAdvice').evaluate(el => getComputedStyle(el).color), 'rgb(220, 38, 38)');
        if (process.env.FORM_SCREENSHOT_DIR) {
            fs.mkdirSync(process.env.FORM_SCREENSHOT_DIR,{recursive:true});
            await page.screenshot({path:path.join(process.env.FORM_SCREENSHOT_DIR,'foto-facoltativa-mobile.png'),fullPage:true});
        }
        const firstPicker = page.waitForEvent('filechooser');
        await page.locator('#dropzone').click();
        await (await firstPicker).setFiles(photos(1));
        await page.waitForFunction(() => _files.length === 1 && !_photosUnsaved);
        assert(await page.locator('#dropzone').isHidden());
        assert(await page.locator('#coverPreview img').isVisible());
        assert(await page.locator('#additionalPhotos').isVisible());
        assert(await page.locator('#photoAdvice').isHidden());
        assert.equal(await page.locator('#photoProgress').count(), 0);
        assert.equal(await page.locator('#previewContainer .photo-empty').count(), 3);
        for (const text of await page.locator('#previewContainer .photo-empty').allTextContents()) assert.match(text, /Facoltativa/);
        if (process.env.FORM_SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.FORM_SCREENSHOT_DIR,'foto-aggiuntive-mobile.png'),fullPage:true});
        await page.locator('#toStep6Btn').click();
        await active(page,6);
        assert.equal(await page.locator('#pubFree').getAttribute('aria-pressed'),'true');
        for (const [tier,price] of [['10d','49'],['30d','99'],['90d','224,10']]) {
            await page.locator('#pub'+tier).click();
            assert.match(await page.locator('#submitBtn').innerText(),new RegExp(price));
            assert.match(await page.locator('#pubFootNote').innerText(),/approvazione.*senza rinnovo automatico/);
        }
        assert.match(await page.locator('#pubPremiumTitle').innerText(),/Vendi più in fretta/);
        assert.match(await page.locator('#pub90d del').innerText(),/249/);
        assert.equal(await page.locator('#pub10d del, #pub30d del').count(),0);
        assert.equal(await page.locator('#pubPromotionDetails .pub-process-graphic').count(),3);
        await page.setViewportSize({width:320,height:568});
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'scelta Vetrina senza overflow a 320px');
        if (process.env.FORM_SCREENSHOT_DIR) await page.screenshot({path:path.join(process.env.FORM_SCREENSHOT_DIR,'vetrina-pubblicazione-320.png'),fullPage:true});
        await page.setViewportSize({width:390,height:844});
        await page.locator('#pubFree').click();
        await page.locator('#step6').getByRole('button',{name:'Indietro'}).click();
        await active(page,5);
        await page.reload();
        await page.waitForFunction(() => _draftReady && _files.length === 1);
        assert(await page.locator('#additionalPhotos').isVisible());
        assert(await page.locator('#draftStatus').isHidden());
        assert.equal((await page.locator('#draftBanner').innerText()).trim(), 'Ricomincia');
        const extraPicker = page.waitForEvent('filechooser');
        await page.locator('#previewContainer .photo-empty').first().click();
        await (await extraPicker).setFiles([photos(2)[1]]);
        await page.waitForFunction(() => _files.length === 2 && !_photosUnsaved);
        await page.locator('#previewContainer .photo-remove').click();
        await page.locator('#coverPreview .photo-remove').click();
        await page.waitForFunction(() => _files.length === 0 && !_photosUnsaved);
        assert(await page.locator('#dropzone').isVisible());
        assert(await page.locator('#additionalPhotos').isHidden());
        console.log('OK: un solo slot iniziale, avviso rosso, tre slot facoltativi dopo la prima foto, recupero silenzioso e Avanti diretto con una foto.');
        const title = await page.locator('#fTitolo').inputValue();
        await page.getByRole('button',{name:'Prova un altro titolo'}).click();
        const changed = await page.locator('#fTitolo').inputValue();
        assert.notEqual(changed,title);
        await page.locator('#step5').getByRole('button',{name:'Indietro'}).click();
        await active(page, 4);
        await page.evaluate(() => document.documentElement.classList.add('admin-dark'));
        const darkAdvice = await page.locator('#priceAdvice').evaluate(el => getComputedStyle(el).backgroundColor);
        assert.equal(darkAdvice, 'rgb(32, 43, 58)', 'price advice uses a dark surface');
        await captureThemes(page, 'prezzo-mobile');
        await page.evaluate(() => document.documentElement.classList.remove('admin-dark'));
        await next(page,4);
        assert.equal(await page.locator('#fTitolo').inputValue(),changed);
        await page.locator('#fTitolo').fill('Il mio posteggio del sabato a Brescia');
        const description = await page.locator('#fDescrizione').inputValue();
        assert(!/clientela fissa|permessi|Ottima posizione|in regola/.test(description));
        await page.locator('#fileInput').setInputFiles(photos(6));
        await page.waitForFunction(() => _files.length === 5 && !_photosUnsaved);
        assert.match(await page.locator('#stepErrorMsg').textContent(),/5 foto/);
        await page.locator('.photo-cover').nth(2).click();
        await page.waitForFunction(() => !_photosUnsaved);
        assert.equal(await page.evaluate(() => _files[0].name),'foto-2.png');
        await page.locator('#fDescrizione').fill(description + ' Il posteggio si trova in piazza, vicino all’ingresso.');
        assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).nome,draftKey(ownerA)),'Contatto scelto');
        await page.reload();
        await page.waitForFunction(() => _draftReady && _files.length === 5);
        await active(page,5);
        assert.equal(await page.locator('#fTitolo').inputValue(),'Il mio posteggio del sabato a Brescia');
        assert.match(await page.locator('#fDescrizione').inputValue(),/vicino all’ingresso/);
        assert.equal(await page.locator('#fNome').inputValue(),'Contatto scelto');
        assert.equal(await page.evaluate(() => _files[0].name),'foto-2.png');
        assert(await page.locator('#draftBanner').isVisible());
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        if (process.env.FORM_SCREENSHOT_DIR) {
            fs.mkdirSync(process.env.FORM_SCREENSHOT_DIR,{recursive:true});
            await page.screenshot({path:path.join(process.env.FORM_SCREENSHOT_DIR,'vendita-mobile.png'),fullPage:true});
        }
        await page.locator('#toStep6Btn').click();
        await active(page,6);
        assert.match(await page.locator('#publishReview').innerText(),/15\.000,5 €/);
        failUpload = true;
        await page.locator('#submitBtn').click();
        await page.waitForFunction(() => !document.getElementById('submitBtn').disabled);
        await active(page,5);
        assert.equal(inserts.length,0);
        assert.match(await page.locator('#stepErrorMsg').textContent(),/ancora in bozza/);
        assert(await page.evaluate(key=>!!localStorage.getItem(key),draftKey(ownerA)));
        const uploadsBeforeRetry = uploads;
        await page.locator('#toStep6Btn').click();
        await page.locator('#submitBtn').click();
        await page.locator('#successMsg').waitFor({state:'visible'});
        assert.equal(uploads,uploadsBeforeRetry+1,'retry only uploads the failed photo');
        assert.equal(inserts.length,1);
        assert.equal(inserts[0].prezzo,15000.5);
        assert.equal(inserts[0].superficie,24.5);
        assert(Math.abs(Date.parse(inserts[0].expires_at)-Date.now()-270*86400000)<60000,'pubblicazione con durata di 270 giorni');
        assert.equal(inserts[0].img_urls.length,5);
        assert.equal(await page.evaluate(key=>localStorage.getItem(key),draftKey(ownerA)),null);
        assert.equal(await page.evaluate(async key=>(await VendiSupport.loadPhotos(key)).length,draftKey(ownerA)),0);
        await page.getByRole('button',{name:'Inserisci un altro'}).click();
        await active(page,1);
        assert.equal(await page.locator('#fComune').inputValue(),'');
        assert.equal(await page.evaluate(() => _files.length),0);
        assert(await page.evaluate(async()=>{
            const bytes=new Uint8Array(6*1024*1024);
            bytes[0]=123;bytes[bytes.length-1]=231;
            const file=new File([bytes],'originale.png',{type:'image/png'});
            const prepared=await _prepareListingImage(file);
            const saved=new Uint8Array(await prepared.file.arrayBuffer());
            return prepared.file===file && saved.length===bytes.length && saved[0]===123 && saved[saved.length-1]===231;
        }),'upload preparation preserves the exact original, including files above the old 5 MB limit');
        console.log('OK: mobile, 5 foto, copertina, bozze con contatti e foto, titoli stabili, upload fallito e retry, pubblicazione e reset.');

        const fair = await newPage(ownerB);
        await fillWizard(fair,true);
        await fair.evaluate(() => _comunePicker.setValue('Monterusciello (Pozzuoli)', 'Campania'));
        const fairDescription = await fair.locator('#fDescrizione').inputValue();
        assert.match(fairDescription,/Ogni febbraio, un giorno/);
        assert(!/\[giorni\]|Sabato|undefined/.test(fairDescription));
        await fair.locator('#toStep6Btn').click();
        await active(fair,6);
        await fair.evaluate(()=>{document.getElementById('fGiorni').value='Sabato';});
        await fair.locator('#submitBtn').click();
        await fair.locator('#successMsg').waitFor({state:'visible'});
        assert.equal(inserts[1].giorni,'Ogni febbraio, un giorno');
        assert.equal(inserts[1].dettagli_extra.nome_fiera,'Fiera di San Faustino');
        assert.equal(inserts[1].img_urls.length,0);
        assert.equal(inserts[1].comune,'Monterusciello (Pozzuoli)');
        assert.equal(inserts[1].provincia,'Napoli');
        assert.equal(inserts[1].regione,'Campania');
        console.log('OK: fiera senza giorni settimanali, periodo libero, descrizione corretta e foto facoltative.');

        const guest = await newPage();
        await guest.locator('.tipo-card').last().click();
        assert(await guest.evaluate(key=>!!localStorage.getItem(key),draftKey('guest')));
        await guest.reload();
        await guest.waitForFunction(()=>_draftReady);
        await active(guest,2);
        assert(await guest.locator('#statoAffitto').isChecked());
        await guest.evaluate(({keyA,keyB,authKey,stored})=>{
            localStorage.setItem(keyA,JSON.stringify({_userId:stored.user.id,comune:'Brescia',regione:'Lombardia',titolo:'Bozza privata A',nome:'Privato A',tel:'3471234567',step:2}));
            localStorage.setItem(keyB,JSON.stringify({_userId:'22222222-2222-2222-2222-222222222222',comune:'Milano',regione:'Lombardia',titolo:'Bozza privata B',nome:'Privato B',step:2}));
            localStorage.setItem(authKey,JSON.stringify(stored));
        },{keyA:draftKey(ownerA),keyB:draftKey(ownerB),authKey,stored:session(ownerA)});
        await guest.reload();
        await guest.waitForFunction(()=>_draftReady);
        assert.equal(await guest.locator('#fTitolo').inputValue(),'Bozza privata A');
        await guest.evaluate(authKey=>localStorage.removeItem(authKey),authKey);
        await guest.reload();
        await guest.waitForFunction(()=>_draftReady);
        assert.equal(await guest.locator('#fTitolo').inputValue(),'');
        assert.equal(await guest.locator('#fNome').inputValue(),'');
        assert(await guest.evaluate(key=>!!localStorage.getItem(key),draftKey(ownerA)));
        await guest.evaluate(({authKey,stored})=>localStorage.setItem(authKey,JSON.stringify(stored)),{authKey,stored:session(ownerB)});
        await guest.reload();
        await guest.waitForFunction(()=>_draftReady);
        assert.equal(await guest.locator('#fTitolo').inputValue(),'Bozza privata B');
        assert.equal(await guest.locator('#fNome').inputValue(),'Privato B');
        console.log('OK: salvataggio dal primo passo e isolamento tra ospite e due account.');

        const migrating = await newPage();
        await fillWizard(migrating,true);
        await migrating.locator('#fileInput').setInputFiles(photos(1));
        await migrating.waitForFunction(()=>!_photosUnsaved);
        const anonymous = await migrating.evaluate(key=>JSON.parse(localStorage.getItem(key)),draftKey('guest'));
        assert.equal(anonymous.nome,undefined);
        assert.equal(anonymous.tel,undefined);
        await migrating.evaluate(({authKey,stored})=>{
            localStorage.setItem(authKey,JSON.stringify(stored));
            window.__authListeners.forEach(fn=>fn('SIGNED_IN',stored));
        },{authKey,stored:session(ownerA)});
        await migrating.waitForFunction(owner=>_draftOwner===owner&&!_photosUnsaved,ownerA);
        await migrating.reload();
        await migrating.waitForFunction(()=>_draftReady&&_files.length===1);
        assert.equal(await migrating.locator('#fNome').inputValue(),'Contatto scelto');
        assert.equal(await migrating.locator('#fTel').inputValue(),'3477654321');
        assert.equal(await migrating.evaluate(key=>localStorage.getItem(key),draftKey('guest')),null);
        await migrating.evaluate(authKey=>{localStorage.removeItem(authKey);window.__authListeners.forEach(fn=>fn('SIGNED_OUT',null));},authKey);
        await migrating.waitForFunction(()=>_draftOwner==='guest'&&_draftReady);
        assert.equal(await migrating.evaluate(()=>_files.length),0);
        assert.equal(await migrating.locator('#fNome').inputValue(),'');
        assert(await migrating.evaluate(key=>!!localStorage.getItem(key),draftKey(ownerA)));
        console.log('OK: passaggio da ospite ad account conserva foto e contatti; uscita dall’account conserva la bozza privata.');

        const legacy = await newPage(ownerA);
        await legacy.evaluate(owner=>localStorage.setItem('subingresso_draft_v1',JSON.stringify({_userId:owner,comune:'Brescia',regione:'Lombardia',giorni:'Sabato',merce:'Abbigliamento e accessori',superficie:'24abc',prezzo:'15000',titolo:'Una bozza precedente',descrizione:'Descrizione del posteggio con dettagli sufficienti.',step:6})),ownerA);
        await legacy.reload();
        await legacy.waitForFunction(()=>_draftReady);
        await active(legacy,6);
        assert(await legacy.evaluate(key=>!!localStorage.getItem(key),draftKey(ownerA)));
        assert.equal(await legacy.evaluate(()=>localStorage.getItem('subingresso_draft_v1')),null);
        const previousInserts = inserts.length;
        await legacy.locator('#submitBtn').click();
        await active(legacy,3);
        assert.equal(inserts.length,previousInserts);
        assert.match(await legacy.locator('#stepErrorMsg').textContent(),/superficie/);
        console.log('OK: recupero delle vecchie bozze e controllo dei passi precedenti prima della pubblicazione.');

        const photoStorage = await newPage();
        await fillWizard(photoStorage);
        await photoStorage.evaluate(()=>{VendiSupport.savePhotos=()=>Promise.reject(new Error('quota'));});
        await photoStorage.locator('#fileInput').setInputFiles(photos(1));
        await photoStorage.waitForFunction(()=>_photoWriteFailed);
        await photoStorage.locator('#fDescrizione').fill('Una descrizione aggiornata dopo il problema con la memoria delle foto.');
        assert.match(await photoStorage.locator('#draftStatus').textContent(),/foto non si sono salvate/);
        assert(await photoStorage.locator('#draftStatus').isVisible());
        assert(await photoStorage.evaluate(()=>{const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;}));
        console.log('OK: errore dell’archivio foto resta visibile e protegge l’uscita dalla pagina.');

        const brokenStorage = await newPage();
        await brokenStorage.evaluate(()=>{
            const original=Storage.prototype.setItem;
            Storage.prototype.setItem=function(key,value){if(key.startsWith('subingresso_draft_v2_'))throw new Error('quota');return original.call(this,key,value);};
        });
        await brokenStorage.locator('.tipo-card').first().click();
        assert.match(await brokenStorage.locator('#draftStatus').textContent(),/non si è salvata/);
        assert(await brokenStorage.locator('#draftStatus').isVisible());
        assert(await brokenStorage.evaluate(()=>{const event=new Event('beforeunload',{cancelable:true});window.dispatchEvent(event);return event.defaultPrevented;}));
        console.log('OK: memoria bloccata segnalata e protezione uscita attiva.');

        const edit = await newPage(ownerA);
        // Existing listing supplied before the inline edit initialization.
        await edit.context().route('**/js/supabase-config.js*', route=>route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(root,'js/supabase-config.js'),'utf8')+`\nwindow.__testListing=${JSON.stringify({id:'test-id',user_id:ownerA,titolo:'Titolo',comune:'Rivoltella (Desenzano del Garda)',regione:'Lombardia',superficie:24,prezzo:15000,descrizione:'Descrizione del posteggio',stato:'Vendita',contatto:'Test',img_urls:['https://example.invalid/old.png'],dettagli_extra:{}})};`}));
        await edit.goto(base+'/modifica-annuncio?id=test-id');
        try { await edit.locator('#editContainer').waitFor({state:'visible'}); }
        catch (error) { console.error('Edit page diagnostics:',errors,await edit.url()); throw error; }
        await edit.waitForFunction(() => !!_comunePicker.getValue());
        assert.equal(await edit.locator('#fComune').inputValue(), 'Rivoltella (Desenzano del Garda)');
        assert.equal(await edit.locator('#fProvincia').inputValue(), 'Brescia');
        await edit.locator('#fileInput').setInputFiles(photos(4));
        await edit.waitForFunction(()=>_newFiles.length===4 && document.querySelectorAll('#previewContainer img').length===5);
        await edit.locator('#previewContainer button').nth(2).click();
        assert.equal(await edit.evaluate(()=>_newFiles.length),3);
        assert.equal(await edit.evaluate(()=>_newFiles[1].name),'foto-2.png');
        await edit.locator('#fComune').fill('Moniga');
        await edit.getByRole('option', {name:/^Moniga del Garda/}).click();
        assert.equal(await edit.locator('#fProvincia').inputValue(), 'Brescia');
        await edit.context().route('**/data/comuni-picker.json*', route => route.fulfill({status:503,body:'unavailable'}));
        await edit.reload();
        await edit.locator('#editContainer').waitFor({state:'visible'});
        await edit.getByRole('button', {name:'Riprova a caricare i comuni'}).waitFor({state:'visible'});
        assert.equal(await edit.locator('#fComune').inputValue(), 'Rivoltella (Desenzano del Garda)');
        await edit.context().unroute('**/data/comuni-picker.json*');
        await edit.getByRole('button', {name:'Riprova a caricare i comuni'}).click();
        await edit.waitForFunction(() => !!_comunePicker.getValue());
        await edit.locator('#previewContainer button').first().click();
        assert.equal(await edit.evaluate(()=>_currentImageUrls.length),0,'removing an existing preview removes its original URL');
        await edit.locator('#fTitolo').fill('Posteggio in vendita a Rivoltella');
        await edit.locator('#fDescrizione').fill('Posteggio di mercato con tutte le informazioni necessarie per valutarlo.');
        await edit.locator('#fSuperficie').fill('12,5');
        await edit.locator('#fPrezzo').fill('15000.50');
        await edit.locator('#fTel').fill('+39 347 1234567');
        await edit.getByRole('button',{name:'Salva Modifiche'}).click();
        await edit.waitForFunction(()=>!!window.__savedUpdate);
        const update=await edit.evaluate(()=>window.__savedUpdate);
        assert.equal(update.prezzo,15000.5);assert.equal(update.superficie,12.5);assert.equal(update.tel,'347 1234567');assert.equal(update.provincia,'Brescia');assert.equal(update.status,'pending');
        console.log('OK: modifica salva 15000.50 senza moltiplicare il prezzo, conserva decimali e normalizza il telefono.');
        console.log('OK: aggiunta e rimozione di più foto anche su annunci gratuiti esistenti.');
        console.log('OK: comune abbreviato e recupero del selettore offline anche in modifica annuncio.');

        await edit.context().close();
        for (const [tier,cents] of [['10d',4900],['30d',9900],['90d',22410]]) {
            const paid=await newPage(ownerA,true),checkoutRequests=[];
            await paid.context().route('**/functions/v1/create-checkout-session',route=>{
                checkoutRequests.push(route.request().postDataJSON());
                return route.fulfill({contentType:'application/json',body:JSON.stringify({url:'https://checkout.stripe.com/c/pay/isolated-test'})});
            });
            await paid.context().route('https://checkout.stripe.com/**',route=>route.fulfill({body:'Pagamento simulato'}));
            await fillWizard(paid);await paid.locator('#toStep6Btn').click();await active(paid,6);
            await paid.locator('#pub'+tier).click();assert.equal(checkoutRequests.length,0,'selection never starts payment');
            await paid.locator('#submitBtn').click();await paid.waitForURL('https://checkout.stripe.com/**');
            assert.equal(checkoutRequests.length,1);assert.equal(checkoutRequests[0].expected_amount_cents,cents);
            assert.equal(checkoutRequests[0].source,'vendi_creation');assert.equal(checkoutRequests[0].tier,tier);
            assert.equal(checkoutRequests[0].offer,tier==='90d'?'publication_90d_v1':undefined);
            await paid.context().close();
        }
        console.log('OK: tre scelte a pagamento inviano importi esatti; offerta solo sui 90 giorni, nessun pagamento alla selezione.');
        assert.deepEqual(errors,[],'uncaught browser errors');
        console.log(`OK: ${variants} varianti di titolo, numeri italiani e sintassi dei due form.`);
    } finally {
        await browser.close();
        await new Promise(resolve=>server.close(resolve));
    }
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
