// HTML reale e servizi simulati. Tutte le scritture Supabase sono intercettate.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const template = fs.readFileSync(process.env.BLOG_ADS_TEMPLATE_FILE || path.join(root,'blog-template.html'),'utf8');
for (const [,attrs,code] of template.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (!/\bsrc\s*=|application\/ld\+json/i.test(attrs)) new vm.Script(code);
}
const out = process.env.BLOG_ADS_QA_DIR;
const listing = (n, region='Lombardia', paid=false) => ({
    id:'00000000-0000-4000-8000-'+String(n).padStart(12,'0'),user_id:'11111111-1111-4111-8111-111111111111',
    titolo:n===2?'Posteggio <img src=x onerror=window.xss=true>':'Posteggio al mercato '+n,
    status:'active',comune:'Comune di prova',regione:region,stato:n===3?'Affitto mensile':'Vendita',
    prezzo:n===2?null:15000,contatto:'Telefono',featured:paid,featured_until:paid?'2099-01-01':null,
    expires_at:'2099-01-01',img_urls:n===1?['https://fixture.test/photo.svg']:[],dettagli_extra:{}
});
const posts = [
    ['migliori-fiere-lombardia','Le migliori fiere in Lombardia','Fiere'],
    ['bandi-posteggi-mercatali-lombardia','Bandi posteggi mercatali in Lombardia','Bandi'],
    ['quanto-costa-un-posteggio-al-mercato','Quanto costa un posteggio al mercato?','Guida'],
    ['migliori-mercati-lago-di-garda-posteggi-ambulanti','Mercati sul Lago di Garda','Guide Regionali']
].map(([slug,title,category])=>({slug,title,category,published_at:'2026-10-01',author:'Redazione',excerpt:title,cover_image_url:null,
    content:'<p>Prima informazione utile per chi cerca un posteggio.</p><p>Seconda informazione utile per scegliere la zona.</p><p>Terza informazione utile per confrontare le opportunità.</p><p id="following">Questo testo deve restare visibile dopo la pubblicità.</p>'}));
const cases = [
    {name:'regional-paid',post:0,regions:['Lombardia'],rows:[listing(1,'Lombardia',true),listing(2,'Lombardia',true),listing(3,'Lombardia',true)],paid:3},
    {name:'generic-paid',post:2,regions:[],rows:[listing(1,'Veneto',true),listing(2,'Lombardia',true),listing(3,'Piemonte',true)],paid:3},
    {name:'regional-mixed',post:0,regions:['Lombardia'],rows:[listing(1,'Lombardia',true),listing(2),listing(3)],paid:1},
    {name:'generic-free',post:2,regions:[],rows:[listing(1),listing(2,'Veneto'),listing(3,'Piemonte')],paid:0},
    {name:'garda',post:3,regions:['Lombardia','Trentino-Alto Adige','Veneto'],rows:[listing(1,'Veneto',true),listing(2,'Lombardia',true),listing(3,'Trentino-Alto Adige',true)],paid:3},
    {name:'empty-regional',post:0,regions:['Lombardia'],rows:[],paid:0},
    {name:'empty-bandi',post:1,regions:['Lombardia'],rows:[],paid:0},
    {name:'empty-generic',post:2,regions:[],rows:[],paid:0},
];
async function run(engine,name,width,height) {
    const browser=await engine.launch({headless:true});
    try {
        for (const fixture of cases) {
            const page=await browser.newPage({viewport:{width,height}}),errors=[],events=[],requests=[];
            const post=posts[fixture.post]; let fail=false;
            await page.addInitScript(()=>{
                Object.defineProperty(navigator,'webdriver',{get:()=>false});
                sessionStorage.setItem('_vp','1');localStorage.setItem('_visitor_id','fixture-blog-ads');sessionStorage.setItem('_session_id','fixture-blog-session');
            });
            await page.route('https://subingresso.it/blog?**',route=>route.fulfill({contentType:'text/html',body:template}));
            for (const asset of ['js/blog-fiere-promo.js','css/blog-fiere-promo.css','js/blog-tracker.js']) {
                await page.route('https://subingresso.it/'+asset+'?*',route=>route.fulfill({path:path.join(root,asset)}));
            }
            await page.route('https://fixture.test/**',route=>route.fulfill({contentType:'image/svg+xml',body:'<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="#d1d5db"/></svg>'}));
            await page.route('https://mhfbtltgwibwmsudsuvf.supabase.co/**',async route=>{
                const req=route.request(),url=new URL(req.url());
                if(url.pathname.endsWith('/rpc/blog_listing_ads')) {
                    const body=req.postDataJSON();requests.push(body);
                    if(fail)return route.fulfill({status:503,json:{message:'unavailable'}});
                    if(body.p_slug==='slow-fixture') { await new Promise(r=>setTimeout(r,200));return route.fulfill({json:{regions:[],listings:[listing(99)]}}); }
                    if(body.p_slug==='fast-fixture')return route.fulfill({json:{regions:[],listings:[listing(98)]}});
                    return route.fulfill({json:{regions:fixture.regions,listings:fixture.rows}});
                }
                if(req.method()!=='GET') { events.push(req.postDataJSON());return route.fulfill({json:[]}); }
                if(url.pathname==='/rest/v1/blog_posts')return route.fulfill({json:posts});
                return route.fulfill({json:[]});
            });
            page.on('pageerror',error=>errors.push(error.message));
            await page.goto('https://subingresso.it/blog?post='+post.slug,{waitUntil:'domcontentloaded'});
            await page.waitForFunction(()=>document.getElementById('blogPostContent'));
            await page.waitForFunction(()=>!document.querySelector('#bandoListingsBox .fa-spinner'));
            assert.equal(requests[0].p_slug,post.slug);assert.equal(requests[0].p_limit,3);
            assert.equal(await page.locator('#bandoListingsBox').count(),1,'un solo riquadro');
            assert.equal(await page.locator('.blog-posteggio').count(),fixture.rows.length);
            assert.equal(await page.locator('.blog-posteggio-vetrina').count(),fixture.paid);
            assert.equal(await page.evaluate(()=>!!window.xss),false);
            assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
            if(fixture.rows.length) {
                const seeAll=page.locator('.blog-listings-all');
                const region=fixture.regions.length===1?fixture.regions[0]:null;
                assert.equal(await seeAll.getAttribute('href'),region?'/annunci?regione='+encodeURIComponent(region):'/annunci');
                await page.locator('[data-box-listings]').evaluate(el=>window.scrollTo(0,el.getBoundingClientRect().top+scrollY-96));
                const metrics=await page.locator('[data-box-listings]').evaluate(el=>({height:el.getBoundingClientRect().height,next:el.parentElement.nextElementSibling?.getBoundingClientRect().top}));
                assert(metrics.height<=360,JSON.stringify({name,width,fixture:fixture.name,metrics}));
                if(fixture.post!==1)assert(metrics.next<height-24,'testo dopo la pubblicità visibile');
                await page.locator('.blog-posteggio').first().evaluate(el=>{
                    el.addEventListener('click',event=>event.preventDefault(),{once:true});el.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));
                });
                await page.waitForTimeout(100);
                assert(events.some(e=>e?.kind==='box_listing_click'&&e.regione===region),'tracciamento regione effettiva');
                if(out&&['regional-paid','generic-free','garda'].includes(fixture.name)) {
                    fs.mkdirSync(out,{recursive:true});await page.screenshot({path:path.join(out,`${name}-${width}-${fixture.name}.png`)});
                }
            } else if(fixture.name==='empty-regional') {
                assert.equal(await page.locator('#bandoListingsBox a').getAttribute('href'),'/annunci?regione=Lombardia');
            } else if(fixture.name==='empty-bandi') {
                assert.equal(await page.locator('#bandoListingsBox a').getAttribute('href'),'#bandoAlertForm');
            } else assert.equal(await page.locator('#bandoListingsBox').innerText(),'');

            if(fixture.name==='regional-paid') {
                // Un risultato tardivo non può sostituire la selezione della pagina corrente.
                await page.evaluate(()=>Promise.all([_loadBandoListingsBox(null,'slow-fixture'),_loadBandoListingsBox(null,'fast-fixture')]));
                assert.equal(await page.locator('.blog-posteggio').first().getAttribute('data-listing-id'),listing(98).id);
                const before=requests.length;
                await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
                await page.waitForTimeout(150);assert.equal(requests.length,before+1,'rilettura dopo ripristino dalla cache');
                fail=true;await page.evaluate(()=>_loadBandoListingsBox(null,slug));
                assert.equal(await page.locator('#bandoListingsBox').innerText(),'','errore senza mostrare annunci vecchi');
                fail=false;await page.evaluate(()=>_loadBandoListingsBox(null,slug));
                assert.equal(await page.locator('.blog-posteggio').count(),3,'ripresa dopo errore');
            }
            assert.deepEqual(errors,[]);
            await page.close();
        }
        console.log(`OK: ${name} ${width}x${height}, 8 casi; geografia, badge, fallback, link/click, layout compatto, errori/ripresa e risposte tardive.`);
    } finally { await browser.close(); }
}
(async()=>{for(const[engine,name,width,height]of[[chromium,'chromium',1440,900],[chromium,'chromium',768,1024],[chromium,'chromium',320,568],[webkit,'webkit',390,844]])await run(engine,name,width,height);})().catch(error=>{console.error(error);process.exitCode=1;});
