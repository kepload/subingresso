// Browser regressions. Requires Playwright; optional PLAYWRIGHT_MODULE and
// PLAYWRIGHT_CHROMIUM_EXECUTABLE let an existing local installation be used.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const vm = require('node:vm');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const ownerA = '11111111-1111-1111-1111-111111111111';
const ownerB = '22222222-2222-2222-2222-222222222222';
const draftKey = owner => 'subingresso_draft_v2_' + owner;
const authKey = 'sb-test-auth-token';
const session = owner => ({ user: { id: owner, email: 'test@example.invalid', user_metadata: {} }, access_token: 'test-token', refresh_token: 'test-refresh', expires_at: 9999999999 });
const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aA1sAAAAASUVORK5CYII=', 'base64');
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
    if (filename === 'js/auth.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(authStub); return; }
    if (['js/page-view-tracker.js', 'js/ui-components.js'].includes(filename)) { res.setHeader('Content-Type', 'text/javascript'); res.end(''); return; }
    fs.readFile(full, (error, data) => {
        if (error) { res.writeHead(404).end(); return; }
        res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[path.extname(full)] || 'application/octet-stream');
        res.end(data);
    });
});

(async () => {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const base = `http://127.0.0.1:${server.address().port}`;
    const browser = await (process.env.SITE_TEST_WEBKIT ? webkit : chromium).launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
    const errors = [];
    const inserts = [];
    let uploads = 0;
    let failUpload = false;
    async function newPage(owner = null, mobile = false) {
        const context = await browser.newContext({ viewport: {width:Number(process.env.SITE_TEST_WIDTH)||390,height:844}, reducedMotion: 'reduce' });
        await context.route('https://cdn.jsdelivr.net/**', route => route.fulfill({ contentType:'text/javascript', body:clientStub }));
        await context.route('https://cdnjs.cloudflare.com/**', route => route.fulfill({ body:'' }));
        await context.route('https://fonts.googleapis.com/**', route => route.fulfill({ body:'' }));
        await context.route('https://*.supabase.co/**', route => {
            const request = route.request();
            const url = request.url();
            if (url.includes('/storage/')) {
                uploads++;
                const failed = failUpload;
                failUpload = false;
                return route.fulfill({status:failed?500:200,contentType:'application/json',body:'{}'});
            }
            if (url.includes('/annunci') && request.method() === 'POST') {
                inserts.push(request.postDataJSON());
                return route.fulfill({contentType:'application/json',body:JSON.stringify({id:'test-listing-id'})});
            }
            const own=url.includes('/rpc/get_my_profile');
            return route.fulfill({contentType:'application/json',body:own?'{"nome":"Profilo","cognome":"Test","telefono":"3471234567"}':'[{"nome":"Profilo","cognome":"Test","telefono":"3471234567"}]'});
        });
        if (owner) await context.addInitScript(({ authKey, stored }) => {
            if (!sessionStorage.getItem('fixtureAuth')) { localStorage.setItem(authKey, JSON.stringify(stored)); sessionStorage.setItem('fixtureAuth','1'); }
        }, { authKey, stored:session(owner) });
        await context.addInitScript(()=>{window.__siteEvents=[];window.SiteAnalytics={track:(name,data,id)=>window.__siteEvents.push({name,data,id}),errorCode:()=> 'unknown'};});
        const page = await context.newPage();
        page.setDefaultTimeout(10000);
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(base + '/vendi');
        await page.waitForFunction(() => typeof _draftReady!=="undefined" && _draftReady && _comunePicker);
        return page;
    }
    async function active(page, step) { await page.waitForFunction(n => document.getElementById('step'+n).classList.contains('active'), step); }
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
        const page=await newPage(ownerA,true); await fillWizard(page); let checks=0;
        for(const dark of [false,true]){
            await page.evaluate(dark=>document.documentElement.classList.toggle('admin-dark',dark),dark);
            await page.locator('#fDescrizione').fill('Solo prova');
            await page.evaluate(()=>goToStep(6)); await page.waitForTimeout(350);
            await page.evaluate(()=>submitAnnuncio()); await page.waitForTimeout(100);
            assert.equal(await page.locator('#step5').evaluate(el=>el.classList.contains('active')),true);checks++;
            assert.equal(await page.locator('#fDescrizione').getAttribute('aria-invalid'),'true');checks++;
            assert.match(await page.locator('#fDescrizione-error').innerText(),/40/);checks++;
            assert.equal(await page.locator('#fDescrizione').getAttribute('aria-describedby'),'fDescrizione-error');checks++;
            assert.equal(await page.locator('#fDescrizione').evaluate(el=>el===document.activeElement),true);checks++;
            const rect=await page.locator('#fDescrizione-error').boundingBox();const vp=page.viewportSize();assert(rect.y>=0&&rect.y+rect.height<vp.height);checks++;
            assert.equal(await page.locator('#stepError').isVisible(),false);checks++;
            assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);checks++;
            if(process.env.SITE_ANALYTICS_TEST_OUT){const stem=`validation-${process.env.SITE_TEST_WEBKIT?'WebKit':'Chromium'}-${vp.width}-${dark?'dark':'light'}`;await page.screenshot({path:path.join(process.env.SITE_ANALYTICS_TEST_OUT,stem+'.png')});let snapshot=(await page.content()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');snapshot=snapshot.replace(/<link\b[^>]*href="(\/?css\/[^"?]+)[^\"]*"[^>]*>/g,(all,file)=>{const full=path.join(root,file.replace(/^\//,''));return fs.existsSync(full)?'<style>'+fs.readFileSync(full,'utf8')+'</style>':all;});fs.writeFileSync(path.join(process.env.SITE_ANALYTICS_TEST_OUT,stem+'.html'),snapshot);}
            await page.locator('#fDescrizione').fill('Descrizione completa del posteggio al mercato con tutti i dettagli necessari.');
            assert.equal(await page.locator('#fDescrizione-error').count(),0);assert.equal(await page.locator('#fDescrizione').getAttribute('aria-invalid'),null);checks+=2;
            for(const [field,value] of [['fTitolo','ab'],['fNome',''],['fTel','123']]){
                const previous=await page.locator('#'+field).inputValue();await page.locator('#'+field).fill(value);
                await page.evaluate(()=>_validateStep(5));
                assert.equal(await page.locator('#'+field+'-error').isVisible(),true);checks++;
                const errorRect=await page.locator('#'+field+'-error').boundingBox();assert(errorRect.y>=0&&errorRect.y+errorRect.height<vp.height);checks++;
                await page.locator('#'+field).fill(previous);
            }
        }
        const measured=await page.evaluate(()=>window.__siteEvents);assert(measured.some(e=>e.name==='publish_start'));assert(measured.some(e=>e.name==='publish_attempt'));assert(measured.some(e=>e.name==='publish_error'&&e.data.field==='fDescrizione'&&e.data.step===5));assert(!JSON.stringify(measured).includes('Solo prova'));checks+=4;
        assert.deepEqual(errors,[]);assert.equal(inserts.length,0);console.log(JSON.stringify({passed:true,checks,engine:process.env.SITE_TEST_WEBKIT?'WebKit':'Chromium',width:page.viewportSize().width,real_writes:0}));
    } finally {await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
