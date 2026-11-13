// A-05: pagina reale, browser reali e provider/rete interamente simulati.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const proof = process.env.A05_PROOFS;
const engine = process.env.FORM_TEST_BROWSER || 'chromium';
const width = Number(process.env.FORM_TEST_WIDTH || (engine === 'webkit' ? 390 : 1280));
const owner = '11111111-1111-4111-8111-111111111111';
const id = '22222222-2222-4222-8222-222222222222';
const photo = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWNQyVyLFTEMLQkAikpOgV4lvm4AAAAASUVORK5CYII=', 'base64');
const file = name => ({ name, mimeType: 'image/png', buffer: photo });
const listing = { id, user_id: owner, titolo: 'Posteggio fixture a Brescia', stato: 'Vendita', comune: 'Brescia', provincia: 'Brescia', regione: 'Lombardia', superficie: 24, prezzo: 15000, descrizione: 'Posteggio al mercato del sabato con spazio per abbigliamento e accessori.', contatto: 'Contatto fixture', img_urls: ['https://fixture.invalid/old-1.png', 'https://fixture.invalid/old-2.png'], dettagli_extra: { fixture: 'conservato' } };
const stub = `
window.qa={listing:${JSON.stringify(listing)},pauses:[],waiting:[],releases:[],uploads:[],updates:[],userCalls:0,fail:'',reads:{},errors:[]};
window.qaGate=stage=>new Promise(resolve=>{qa.waiting.push(stage);if(qa.pauses.includes(stage))qa.releases.push({stage,resolve});else resolve()});
window.qaRelease=stage=>{const i=qa.releases.findIndex(item=>item.stage===stage);if(i>=0)qa.releases.splice(i,1)[0].resolve()};
window.qaUser=async()=>{if(++qa.userCalls>1){await qaGate('auth');if(qa.fail==='auth')return null;if(qa.fail==='authThrow')throw Error('fixture auth offline')}return {id:'${owner}'}};
window.qaClient={
auth:{getSession:async()=>({data:{session:{user:{id:'${owner}'}}}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},
rpc:async()=>({data:[{tel:'3470000000'}],error:null}),
from:table=>{let update;const q={select(){return q},eq(){return q},update(v){update=v;return q},maybeSingle:async()=>({data:{is_admin:false},error:null}),single:async()=>{
if(!update)return {data:qa.listing,error:null};qa.updates.push(structuredClone(update));await qaGate('update');
if(qa.fail==='updateThrow')throw Error('fixture update offline');
return {data:qa.fail==='empty'||qa.fail==='update'?null:{id:'${id}'},error:qa.fail==='update'?{message:'fixture update rejected'}:null};
}};return q},
storage:{from:()=>({upload:async(name,f)=>{qa.uploads.push({name,file:f.name,size:f.size,type:f.type});await qaGate('upload'+qa.uploads.length);if(qa.fail==='uploadThrow')throw Error('fixture upload offline');return {error:qa.fail==='upload'?{message:'fixture upload rejected'}:null}},getPublicUrl:name=>({data:{publicUrl:'https://fixture.invalid/'+name}})})}
};window.supabase={createClient:()=>qaClient};`;
const auth = 'window.getCurrentUser=()=>qaUser();window.openAuthModal=()=>{};';
const results = [];
let browser;
const server = http.createServer((req, res) => {
    let file = decodeURIComponent(new URL(req.url, 'http://local').pathname).slice(1);
    if (file === 'dashboard') return res.end('<h1>Dashboard fixture</h1>');
    if (!path.extname(file)) file += '.html';
    const full = path.resolve(root, file);
    if (!full.startsWith(root + path.sep)) return res.writeHead(403).end();
    const special = file === 'js/auth.js' ? auth : ['js/page-view-tracker.js', 'js/site-analytics.js'].includes(file) ? '' : null;
    res.setHeader('Content-Type', ({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' })[path.extname(file)] || 'application/octet-stream');
    if (special !== null) return res.end(special);
    if (file === 'modifica-annuncio.html' && process.env.FORM_TEST_HTML) return res.end(fs.readFileSync(process.env.FORM_TEST_HTML));
    fs.readFile(full, (error, data) => error ? res.writeHead(404).end() : res.end(data));
});
async function fixture(options = {}) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, hasTouch: width < 600, reducedMotion: 'reduce' });
    const base = process.env.FORM_TEST_BASE_URL || 'http://127.0.0.1:' + server.address().port;
    const network = { publicReads: 0, blockedWrites: 0 };
    let releaseLocation;
    const locationGate = new Promise(resolve => { releaseLocation = resolve; });
    await context.addInitScript(() => {
        const Reader = FileReader;
        window.FileReader = class extends Reader {
            readAsDataURL(file) {
                if (file.name.startsWith('broken')) { setTimeout(() => this.dispatchEvent(new ProgressEvent('error')), 650); return; }
                setTimeout(() => super.readAsDataURL(file), window.qa?.reads[file.name] || 0);
            }
        };
    });
    await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin === base) {
            if (process.env.FORM_TEST_BASE_URL) {
                // Verifica online in sola lettura, con identità/provider fittizi.
                if (route.request().method() !== 'GET') { network.blockedWrites++; return route.abort(); }
                if (url.pathname === '/js/auth.js') return route.fulfill({ contentType: 'text/javascript', body: auth });
                if (['/js/page-view-tracker.js', '/js/site-analytics.js'].includes(url.pathname)) return route.fulfill({ contentType: 'text/javascript', body: '' });
                if (url.pathname === '/dashboard') return route.fulfill({ contentType: 'text/html', body: '<h1>Dashboard fixture</h1>' });
                network.publicReads++;
            }
            if (options.slowLocation && /data\/(comuni-picker|localita)\.json/.test(url.pathname)) await locationGate;
            return route.continue();
        }
        if (url.hostname === 'cdn.jsdelivr.net') return route.fulfill({ contentType: 'text/javascript', body: stub });
        if (url.hostname === 'fixture.invalid') return route.fulfill({ contentType: 'image/png', body: photo });
        // Nessuna richiesta raggiunge Supabase, analytics, font o altri provider.
        return route.fulfill({ body: '' });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.setDefaultTimeout(8000);
    await page.goto(base + '/modifica-annuncio?id=' + id);
    await page.locator('#editContainer').waitFor({ state: 'visible' });
    if (!options.slowLocation) await page.waitForFunction(() => !!_comunePicker.getValue());
    const save = page.locator('button[onclick="updateAnnuncio()"]');
    return { context, page, save, errors, releaseLocation, network };
}
async function record(name, run, options) {
    if (process.env.A05_CASE && !name.includes(process.env.A05_CASE)) return;
    const f = await fixture(options);
    try {
        await run(f);
        assert.deepEqual(f.errors, [], 'nessun errore JavaScript non gestito');
        assert.equal(f.network.blockedWrites, 0, 'nessuna richiesta mutativa al sito');
        results.push({ name, passed: true, publicReads: f.network.publicReads });
        console.log('PASS ' + name);
    } catch (error) {
        results.push({ name, passed: false, error: error.message });
        console.error('FAIL ' + name + ': ' + error.message);
        if (proof) await f.page.screenshot({ path: path.join(proof, engine + '-' + width + '-' + name + '-failed.png'), fullPage: true });
    } finally { f.releaseLocation(); await f.context.close(); }
}
async function waitStage(page, stage) { await page.waitForFunction(stage => qa.releases.some(item => item.stage === stage), stage); }
async function locked(page) {
    assert.equal(await page.locator('#annuncioForm').evaluate(form => form.inert), true);
    assert.equal(await page.locator('#annuncioForm').getAttribute('aria-busy'), 'true');
    assert.equal(await page.locator('button[onclick="updateAnnuncio()"]').isDisabled(), true);
}
async function snapshot(page) {
    return page.evaluate(() => ({
        fields: [...document.querySelectorAll('#annuncioForm input:not([type=file]), #annuncioForm textarea, #annuncioForm select')].map(el => [el.id, el.value, el.checked]),
        urls: [..._currentImageUrls], files: _newFiles.map(f => f.name), photos: preview.children.length
    }));
}
async function attack(page) {
    for (const selector of ['#fTitolo', '#fDescrizione', '#fSuperficie', '#fPrezzo', '#fNome', '#fTel', '#fComune', 'label.radio-card:nth-child(2)', '#previewContainer button', '#dropzone']) {
        const target = page.locator(selector).first();
        await target.scrollIntoViewIfNeeded();
        const box = await target.boundingBox();
        await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
        await page.keyboard.type('Modifica durante attesa');
    }
    // I callback tardivi del selettore file e le invocazioni duplicate sono inerti.
    await page.evaluate(() => {
        handleFiles([new File(['fixture'], 'late.png', { type: 'image/png' })]);
        removePreview(preview.querySelector('button'), true);
        updateAnnuncio();
        document.getElementById('annuncioForm').dispatchEvent(new Event('submit', { cancelable: true }));
    });
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.getElementById('annuncioForm').contains(document.activeElement)), false, 'Tab esclude il modulo bloccato');
}
async function checkPayload(page, expectedTitle = listing.titolo, expectedFiles = ['first.png', 'second.png']) {
    const state = await page.evaluate(() => ({ updates: qa.updates, uploads: qa.uploads }));
    assert.equal(state.updates.length, 1);
    const data = state.updates[0];
    assert.equal(data.titolo, expectedTitle);
    assert.equal(data.stato, 'Vendita');
    assert.equal(data.comune, 'Brescia');
    assert.equal(data.provincia, 'Brescia');
    assert.equal(data.regione, 'Lombardia');
    assert.equal(data.superficie, 24);
    assert.equal(data.prezzo, 15000);
    assert.equal(data.descrizione, listing.descrizione);
    assert.equal(data.contatto, listing.contatto);
    assert.equal(data.tel, '347 0000000');
    assert.equal(data.status, 'pending');
    assert.equal(data.dettagli_extra.fixture, 'conservato');
    assert.deepEqual(data.dettagli_extra.images, data.img_urls);
    assert.deepEqual(data.img_urls.slice(0, 2), listing.img_urls);
    assert.deepEqual(state.uploads.map(item => item.file), expectedFiles);
    assert.deepEqual(data.img_urls.slice(2), state.uploads.map(item => 'https://fixture.invalid/' + item.name));
}
(async () => {
    if (proof) fs.mkdirSync(proof, { recursive: true });
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    browser = await playwright[engine].launch({ headless: true });
    await record('lock-auth-uploads-update-success', async ({ page, save }) => {
        await page.locator('#fileInput').setInputFiles([file('first.png'), file('second.png')]);
        await page.waitForFunction(() => preview.children.length === 4 && [...preview.querySelectorAll('img')].every(img => img.hasAttribute('src')));
        await page.evaluate(() => { qa.pauses = ['auth', 'upload1', 'upload2', 'update']; });
        const before = await snapshot(page);
        await save.focus();
        await page.keyboard.press('Enter');
        for (const stage of ['auth', 'upload1', 'upload2', 'update']) {
            await waitStage(page, stage);
            await locked(page);
            if (stage === 'auth') assert.equal(await page.evaluate(() => document.activeElement.id), 'saveStatus');
            await attack(page);
            assert.deepEqual(await snapshot(page), { ...before, fields: before.fields.map(row => row[0] === 'fTel' ? [row[0], '347 0000000', row[2]] : row) });
            if (stage === 'update') {
                await checkPayload(page);
                if (proof) await page.screenshot({ path: path.join(proof, engine + '-' + width + '-saving.png'), fullPage: true });
            }
            await page.evaluate(stage => qaRelease(stage), stage);
        }
        await page.waitForFunction(() => document.getElementById('saveStatus').textContent.includes('inviate'));
        assert.equal(await page.locator('#annuncioForm').evaluate(form => form.inert), true, 'blocco fino alla navigazione dopo successo');
        await page.evaluate(() => { updateAnnuncio(); handleFiles([new File(['x'], 'after-success.png', { type: 'image/png' })]); });
        assert.equal(await page.evaluate(() => qa.updates.length), 1);
        await page.waitForURL('**/dashboard');
    });
    for (const failure of ['auth', 'authThrow', 'upload', 'uploadThrow', 'update', 'updateThrow', 'empty']) {
        await record('recover-' + failure, async ({ page, save }) => {
            await page.locator('#fileInput').setInputFiles(file('first.png'));
            await page.waitForFunction(() => preview.children.length === 3 && preview.lastElementChild.querySelector('img').hasAttribute('src'));
            await page.evaluate(failure => { qa.fail = failure; }, failure);
            await save.click();
            await page.waitForFunction(() => !document.querySelector('button[onclick="updateAnnuncio()"]').disabled);
            assert.equal(await page.locator('#annuncioForm').evaluate(form => form.inert), false);
            assert.equal(await page.locator('#annuncioForm').getAttribute('aria-busy'), null);
            assert.equal(await page.evaluate(() => document.activeElement.getAttribute('onclick')), 'updateAnnuncio()');
            assert.equal(await page.locator('#fRegione').isDisabled(), true);
            assert.equal(await page.locator('#fProvincia').getAttribute('readonly'), '');
            assert.equal(await page.locator('#previewContainer > div').count(), 3);
            await page.locator('#fTitolo').fill('Titolo nuovo dopo errore');
            await page.locator('#previewContainer button').first().click();
            await page.locator('#fileInput').setInputFiles(file('second.png'));
            await page.waitForFunction(() => preview.children.length === 3 && preview.lastElementChild.querySelector('img').hasAttribute('src'));
            await page.evaluate(() => { qa.fail = ''; qa.pauses = ['update']; qa.updates = []; qa.uploads = []; qa.waiting = []; });
            await save.focus();
            await page.keyboard.press('Enter');
            await waitStage(page, 'update');
            const data = await page.evaluate(() => qa.updates[0]);
            assert.equal(data.titolo, 'Titolo nuovo dopo errore');
            assert.deepEqual(data.img_urls.slice(0, 1), [listing.img_urls[1]]);
            assert.equal(data.img_urls.length, 3);
            assert.deepEqual(await page.evaluate(() => qa.uploads.map(item => item.file)), ['first.png', 'second.png']);
            if (proof && failure === 'update') await page.screenshot({ path: path.join(proof, engine + '-' + width + '-retry.png'), fullPage: true });
            await page.evaluate(() => qaRelease('update'));
            await page.waitForFunction(() => document.getElementById('saveStatus').textContent.includes('inviate'));
        });
    }
    await record('pending-photos-preserve-order', async ({ page, save }) => {
        await page.evaluate(() => { qa.reads = { 'first.png': 650, 'second.png': 20 }; qa.pauses = ['update']; });
        await page.locator('#fileInput').setInputFiles([file('first.png'), file('second.png')]);
        await save.click();
        await locked(page);
        assert.equal(await page.evaluate(() => qa.uploads.length), 0, 'upload attende tutte le anteprime');
        await waitStage(page, 'update');
        await checkPayload(page);
        assert.deepEqual(await page.evaluate(() => [...preview.children].slice(2).map(div => _photoFiles.get(div).name)), ['first.png', 'second.png']);
    });
    await record('pending-photo-failure-aborts-and-recovers', async ({ page, save }) => {
        await page.locator('#fileInput').setInputFiles(file('broken.png'));
        await save.click();
        await page.waitForFunction(() => !document.querySelector('button[onclick="updateAnnuncio()"]').disabled);
        assert.equal(await page.locator('#annuncioForm').evaluate(form => form.inert), false);
        assert.equal(await page.evaluate(() => qa.updates.length + qa.uploads.length), 0);
        assert.equal(await page.locator('#previewContainer > div').count(), 2);
        assert.equal(await page.evaluate(() => document.activeElement.getAttribute('onclick')), 'updateAnnuncio()');
        await page.locator('#fileInput').setInputFiles(file('replacement.png'));
        await page.evaluate(() => { qa.pauses = ['update']; });
        await save.click();
        await waitStage(page, 'update');
        assert.equal(await page.evaluate(() => qa.updates[0].img_urls.length), 3);
    });
    await record('remove-pending-photo-does-not-return', async ({ page, save }) => {
        await page.evaluate(() => { qa.reads = { 'removed.png': 300 }; qa.pauses = ['update']; });
        await page.locator('#fileInput').setInputFiles(file('removed.png'));
        await page.locator('#previewContainer button').last().click();
        await save.click();
        await waitStage(page, 'update');
        assert.deepEqual(await page.evaluate(() => qa.updates[0].img_urls), listing.img_urls);
        assert.equal(await page.locator('#previewContainer > div').count(), 2);
        assert.equal(await page.evaluate(() => qa.uploads.length), 0);
    });
    await record('removed-photo-read-error-does-not-block', async ({ page, save }) => {
        await page.locator('#fileInput').setInputFiles(file('broken-removed.png'));
        await page.locator('#previewContainer button').last().click();
        await page.evaluate(() => { qa.pauses = ['update']; });
        await save.click();
        await waitStage(page, 'update');
        assert.deepEqual(await page.evaluate(() => qa.updates[0].img_urls), listing.img_urls);
    });
    await record('all-photos-removed', async ({ page, save }) => {
        await page.locator('#previewContainer button').first().click();
        await page.locator('#previewContainer button').first().click();
        await page.evaluate(() => { qa.pauses = ['update']; });
        await save.click();
        await waitStage(page, 'update');
        assert.deepEqual(await page.evaluate(() => qa.updates[0].img_urls), []);
    });
    await record('max-five-files-in-selection-order', async ({ page, save }) => {
        await page.evaluate(() => { qa.reads = { 'first.png': 350 }; qa.pauses = ['update']; });
        await page.locator('#fileInput').setInputFiles(['first.png', 'second.png', 'third.png', 'excess.png'].map(file));
        await save.click();
        await waitStage(page, 'update');
        assert.equal(await page.locator('#previewContainer > div').count(), 5);
        assert.deepEqual(await page.evaluate(() => qa.uploads.map(item => item.file)), ['first.png', 'second.png', 'third.png']);
        assert.equal(await page.evaluate(() => qa.updates[0].img_urls.length), 5);
    });
    await record('validation-keeps-form-editable', async ({ page, save }) => {
        await page.locator('#fTitolo').fill('x');
        await save.click();
        assert.equal(await page.locator('#annuncioForm').evaluate(form => form.inert), false);
        assert.equal(await save.isDisabled(), false);
        assert.equal(await page.evaluate(() => qa.userCalls), 1);
        assert.equal(await page.evaluate(() => qa.updates.length), 0);
    });
    await record('location-loading-and-late-blur', async ({ page, save, releaseLocation }) => {
        await page.locator('#fComune').fill('Brescia');
        await save.click();
        assert.equal(await save.isDisabled(), false, 'località non pronta: nessun salvataggio');
        releaseLocation();
        await page.waitForFunction(() => !!_comunePicker.getValue());
        await page.locator('#fComune').focus();
        await page.evaluate(() => { qa.pauses = ['auth', 'update']; });
        await page.evaluate(() => { updateAnnuncio(); });
        await waitStage(page, 'auth');
        await locked(page);
        await page.waitForTimeout(160); // Il blur geografico termina durante l'attesa Auth.
        assert.equal(await page.locator('#fComune').inputValue(), 'Brescia');
        await page.evaluate(() => qaRelease('auth'));
        await waitStage(page, 'update');
        await checkPayload(page, listing.titolo, []);
    }, { slowLocation: true });
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
    const report = { engine, width, html: process.env.FORM_TEST_BASE_URL || process.env.FORM_TEST_HTML || 'modifica-annuncio.html', cases: results, passed: results.length > 0 && results.every(item => item.passed), remoteWrites: 0 };
    if (proof) fs.writeFileSync(path.join(proof, engine + '-' + width + '-results.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ engine, width, passed: report.passed, cases: results.length }));
    if (!report.passed) process.exitCode = 1;
});
