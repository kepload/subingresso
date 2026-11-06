// Read-only browser checks for arrivals from search, shared URLs and the calendar.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const root = path.resolve(__dirname, '..');
const handler = require('../api/fiera');
const { events, isIndexable } = require('../api/_fiere');
const fair = events.find(e => e.id === 'lombardia-biassono-fiera-di-san-martino');
function render(event) {
    let html;
    handler({query:{slug:event.id}}, {setHeader(){},status(n){assert.equal(n,200);return this;},send(s){html=s;}});
    return html;
}
for (const event of [fair, events.find(isIndexable), events.find(e => !isIndexable(e)), events.find(e => e.pricing)]) {
    const html = render(event);
    assert(html.includes('id="italy-map"'));
    assert(html.includes('open data-landing-fair="'+event.id+'"'));
    assert(html.includes('rel="canonical" href="https://subingresso.it/fiere/'+event.id+'"'));
    assert(html.includes('rel="icon"'));
    assert(html.includes(isIndexable(event) ? 'content="index,follow"' : 'content="noindex,follow"'));
    assert.equal(JSON.parse(html.match(/<script id="initial-fair" type="application\/json">(.*?)<\/script>/s)[1]).id,event.id);
}
const original = fair.summary;
try {
    fair.summary = '</script><script>window.qaInjected=true</script> $&';
    const html = render(fair);
    assert(html.includes('&lt;/script&gt;&lt;script&gt;'));
    assert(!html.includes('<script>window.qaInjected'));
    assert.equal(JSON.parse(html.match(/<script id="initial-fair" type="application\/json">(.*?)<\/script>/s)[1]).summary,fair.summary);
} finally { fair.summary = original; }
const server = http.createServer((req,res) => {
    const url = new URL(req.url,'http://localhost');
    if (url.pathname.startsWith('/fiere/')) return handler({query:{slug:decodeURIComponent(url.pathname.slice(7))}}, {setHeader:(k,v)=>res.setHeader(k,v),status(n){res.statusCode=n;return this;},send:s=>res.end(s)});
    const file = path.join(root,url.pathname === '/fiere' ? 'fiere.html' : url.pathname);
    if (!file.startsWith(root+path.sep)) { res.writeHead(403); return res.end(); }
    fs.readFile(file,(error,data) => { if(error){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.css')?'text/css':/\.m?js$/.test(file)?'application/javascript':file.endsWith('.json')?'application/json':'text/html; charset=utf-8');res.end(data); });
});
(async()=>{
    const pw = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
    const base = process.env.FIERE_ENTRY_BASE_URL || 'http://127.0.0.1:'+server.address().port;
    for (const [engine,width] of [['chromium',1440],['chromium',768],['chromium',320],['webkit',390]]) {
        const browser = await pw[engine].launch({headless:true});
        try {
            const context = await browser.newContext({viewport:{width,height:900}});
            await context.addInitScript(() => {
                const query = {select(){return this;},eq(){return this;},in(){return this;},order(){return this;},limit(){return this;},then(resolve){return Promise.resolve({data:[]}).then(resolve);}};
                window.supabase = {createClient:()=>({auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},from:()=>Object.create(query),rpc:async()=>({data:[]})})};
            });
            await context.route('**/*', route => {
                const url = new URL(route.request().url());
                if (url.origin !== new URL(base).origin || !['GET','HEAD'].includes(route.request().method()) || url.pathname.startsWith('/api/')) return route.abort();
                return route.continue();
            });
            const page = await context.newPage(), errors=[];
            page.on('pageerror',e=>errors.push(e.message));
            await page.goto(base+'/fiere/'+fair.id);
            await page.waitForFunction(()=>document.querySelector('#fair-dialog').matches(':modal'));
            await page.waitForFunction(()=>document.querySelector('#fair-list').getAttribute('aria-busy')==='false');
            assert.equal(await page.locator('#detail-title').innerText(),fair.name);
            assert.equal(await page.locator('#province-filter').inputValue(),fair.province);
            assert.deepEqual(await page.locator('#month-bar [aria-pressed="true"]').evaluateAll(els=>els.map(e=>Number(e.dataset.month))),fair.months);
            assert(await page.locator('#detail-apply').isVisible());
            assert.equal(await page.locator('#detail-apply').getAttribute('href'),fair.participation.url || fair.source.url);
            assert.equal(await page.locator('#detail-apply').getAttribute('target'),'_blank');
            assert(await page.locator('#detail-explore').isVisible());
            await page.waitForFunction(()=>document.querySelector('#map-markers').children.length>0);
            assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
            assert(await page.locator('#fair-dialog').evaluate(el=>el.scrollWidth<=el.clientWidth));
            await page.evaluate(()=>document.documentElement.classList.add('admin-dark'));
            assert.equal(await page.locator('#fair-dialog').evaluate(el=>getComputedStyle(el).color),'rgb(241, 245, 249)');
            await page.evaluate(()=>document.documentElement.classList.remove('admin-dark'));
            if (process.env.FIERE_ENTRY_QA_DIR) {
                fs.mkdirSync(process.env.FIERE_ENTRY_QA_DIR,{recursive:true});
                await page.screenshot({path:path.join(process.env.FIERE_ENTRY_QA_DIR,'detail-'+engine+'-'+width+'.png')});
            }
            await page.locator('#detail-explore').click();
            assert.equal(new URL(page.url()).pathname,'/fiere');
            assert.equal(new URL(page.url()).searchParams.get('provincia'),fair.province);
            assert.equal(new URL(page.url()).searchParams.get('mesi'),fair.months.join(','));
            assert(!await page.locator('#fair-dialog').isVisible());
            assert.equal(await page.evaluate(()=>window.scrollY),0,'closing starts at the local search controls');
            assert(await page.locator('.fiere-card-button').count()>1);
            await page.reload();
            await page.waitForSelector('.fiere-card-button');
            assert(!await page.locator('#fair-dialog').isVisible(),'reload must not reopen the dismissed fair');
            await page.locator('.fiere-card-button').first().click();
            assert(await page.locator('#fair-dialog').isVisible());
            await page.keyboard.press('Escape');
            assert(!await page.locator('#fair-dialog').isVisible());
            await page.goto(base+'/fiere?fiera='+fair.id);
            await page.waitForFunction(()=>document.querySelector('#fair-dialog').matches(':modal'));
            assert.equal(await page.locator('#province-filter').inputValue(),fair.province);
            await page.locator('#close-detail').click();
            assert(!new URL(page.url()).searchParams.has('fiera'));
            await page.goto(base+'/fiere?q='+encodeURIComponent(fair.city));
            await page.locator('[data-event-id="'+fair.id+'"] .fiere-card-button').click();
            await page.locator('#detail-explore').click();
            assert.equal(await page.locator('#province-filter').inputValue(),fair.province);
            assert.equal(new URL(page.url()).searchParams.has('q'),false,'explore clears the exact fair name');
            // A slow catalogue must not block reading or closing the SSR detail.
            await page.route('**/data/fiere.json*',route=>route.abort());
            await page.goto(base+'/fiere/'+fair.id);
            await page.waitForFunction(()=>document.querySelector('#fair-dialog').matches(':modal'));
            await page.keyboard.press('Escape');
            assert.equal(new URL(page.url()).pathname,'/fiere');
            await page.locator('#catalog-error').waitFor();
            await page.unroute('**/data/fiere.json*');
            await page.locator('#retry-catalog').click();
            await page.waitForSelector('.fiere-card-button');
            assert(!await page.locator('#fair-dialog').isVisible(),'a retry must not reopen a dismissed detail');
            assert.equal(await page.locator('#province-filter').inputValue(),fair.province);
            assert.deepEqual(errors,[]);
            const nojs = await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}});
            const staticPage = await nojs.newPage();
            await staticPage.goto(base+'/fiere/'+fair.id);
            assert.equal(await staticPage.locator('h1').innerText(),fair.name);
            assert.equal(await staticPage.locator('#detail-apply').getAttribute('href'),fair.participation.url || fair.source.url);
            assert(await staticPage.locator('#detail-explore').isVisible());
            console.log(engine+' '+width+': SSR, modal, sources, local filters, close/reload, retry, no-JS and overflow passed.');
        } finally { await browser.close(); }
    }
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
