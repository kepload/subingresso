const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const handler = require('../api/fiera');
const {events,isIndexable,fairPath} = require('../api/_fiere');
function render(query) {
    const result = {headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},send(html){this.html=html;}};
    handler({query},result);return result;
}
for (const event of events) {
    const result = render({slug:event.id});
    assert.equal(result.code,200);
    assert(result.html.includes('https://subingresso.it' + fairPath(event)));
    assert(result.html.includes(isIndexable(event) ? 'content="index,follow"' : 'content="noindex,follow"'));
    assert(!result.html.includes('undefined'));
    assert(!result.html.includes('class="badge '), 'Suspended reputation badge: ' + event.id);
}
assert.equal(render({slug:'inesistente'}).code,404);
assert.equal(render({slug:'elenco',pagina:'0'}).code,404);
assert.equal(render({slug:'elenco',pagina:'1.5'}).code,404);
assert.equal(render({slug:'elenco',pagina:'999'}).code,404);
const listed = [];
for(let page=1;page<=Math.ceil(events.length/100);page++) {
    const result=render({slug:'elenco',pagina:String(page)});
    assert.equal(result.code,200);
    listed.push(...[...result.html.matchAll(/href="\/fiere\/([^"?]+)"/g)].map(m=>decodeURIComponent(m[1])).filter(id=>id!=='elenco'));
}
assert.deepEqual([...new Set(listed)].sort(),events.map(e=>e.id).sort());
assert.equal(listed.length,events.length);
// Catalogue content must remain text, including hostile HTML and attributes.
const sample=events[0], original=sample.summary;
sample.summary='<script>alert("x")</script>';
assert(render({slug:sample.id}).html.includes('&lt;script&gt;'));
sample.summary=original;
const server=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname.startsWith('/fiere/')) {
        const query=Object.fromEntries(url.searchParams);query.slug=decodeURIComponent(url.pathname.slice(7));
        return handler({query},{setHeader:(k,v)=>res.setHeader(k,v),status(n){res.statusCode=n;return this;},send:html=>res.end(html)});
    }
    const file=path.join(root,url.pathname==='/fiere'?'fiere.html':url.pathname);
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end();}res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'application/javascript':file.endsWith('.json')?'application/json':'text/html');res.end(data);});
});
(async()=>{
    const oldFetch=global.fetch;
    global.fetch=async()=>({ok:true,json:async()=>[]});
    try {
        let xml;
        await require('../api/sitemap')({}, {setHeader(){},status(){return this;},send(value){xml=value;}});
        for(const event of events)assert.equal(xml.includes('https://subingresso.it'+fairPath(event)+'</loc>'),isIndexable(event));
    }finally{global.fetch=oldFetch;}
    const playwright=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    const base=process.env.FIERE_PAGES_BASE_URL || 'http://127.0.0.1:'+server.address().port;
    for(const [engine,width] of [['chromium',1440],['chromium',320],['webkit',390]]) {
        const browser=await playwright[engine].launch({headless:true});
        try {
            const context=await browser.newContext({viewport:{width,height:900}});
            await context.route('**/*',route=>new URL(route.request().url()).origin===new URL(base).origin?route.continue():route.abort());
            const page=await context.newPage();
            for(const event of [events.find(isIndexable),events.find(e=>!isIndexable(e)),events.find(e=>e.pricing)]) {
                const response=await page.goto(base+fairPath(event));assert.equal(response.status(),200);
                assert.equal(await page.locator('h1').textContent(),event.name);
                assert(await page.locator('main').isVisible());
                assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
            }
            const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}});
            const staticPage=await nojs.newPage();await staticPage.goto(base+'/fiere/elenco');
            assert.equal(await staticPage.locator('main li').count(),100);
            await staticPage.locator('main li a').first().click();assert.equal(await staticPage.locator('h1').count(),1);
            await page.goto(base+'/fiere?provincia=Milano');
            await page.locator('.fiere-card-button').first().click();
            assert(await page.locator('#fair-dialog').isVisible());
            assert.equal(new URL(page.url()).pathname,'/fiere');
            const destination=await page.locator('#detail-page-link').getAttribute('href');
            await page.locator('#detail-page-link').click();
            assert.equal(new URL(page.url()).pathname,destination);
            console.log(engine+' '+width+': detail, missing data, prices, no-JS navigation, calendar modal and overflow passed');
        }finally{await browser.close();}
    }
    console.log(events.length+' pages validated; '+events.filter(isIndexable).length+' sitemap entries; all list pages and escaping passed.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
