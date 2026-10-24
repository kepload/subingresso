// Pagine reali o fixture; tutte le scritture sono intercettate.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {chromium, webkit} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const template = fs.readFileSync(process.env.BLOG_FIERE_TEMPLATE || path.join(root,'blog-template.html'),'utf8');
const out = process.env.BLOG_FIERE_QA_DIR;
const content = Array.from({length:10},(_,i)=>'<h2>Sezione '+i+'</h2><p>'+('Informazioni utili al banco. '.repeat(12))+'</p>').join('');
const posts = process.env.BLOG_FIERE_POSTS ? JSON.parse(fs.readFileSync(process.env.BLOG_FIERE_POSTS,'utf8')) : [
    ['bolkestein-ambulanti-ultime-notizie-2026','Bolkestein ambulanti'],
    ['quanto-costa-un-posteggio-al-mercato','Quanto costa un posteggio'],
    ['bandi-posteggi-mercatali-veneto','Bandi posteggi in Veneto'],
    ['migliori-fiere-lombardia','Fiere in Lombardia'],
    ['migliori-mercati-lago-di-garda-posteggi-ambulanti','Mercati del Garda'],
    ['eredita-licenza-ambulante-successione-posteggio-mercatale-guida-eredi','Guida agli eredi']
].map(([slug,title])=>({slug,title,content,category:'Guida',published_at:'2026-10-01'}));
const chosen = ['bolkestein-ambulanti-ultime-notizie-2026','quanto-costa-un-posteggio-al-mercato','bandi-posteggi-mercatali-veneto','migliori-fiere-lombardia','migliori-mercati-lago-di-garda-posteggi-ambulanti','spuntista-mercato-come-funziona','eredita-licenza-ambulante-successione-posteggio-mercatale-guida-eredi'];
const summary = [];
async function run(engine, name, width, height) {
    const browser = await engine.launch({headless:true});
    try {
        for (const post of [null,...posts.filter(p=>chosen.includes(p.slug))]) {
            const page=await browser.newPage({viewport:{width,height}}), errors=[], events=[];
            await page.addInitScript(()=>{
                Object.defineProperty(navigator,'webdriver',{get:()=>false});
                sessionStorage.setItem('_vp','1');localStorage.setItem('_visitor_id','fixture-fiere-visitor');sessionStorage.setItem('_session_id','fixture-fiere-session');
            });
            await page.route('https://subingresso.it/**', route=>{
                const url=new URL(route.request().url());
                if(url.pathname==='/blog') return route.fulfill({contentType:'text/html',body:template});
                const file=path.join(root,url.pathname);
                if(fs.existsSync(file)&&fs.statSync(file).isFile())return route.fulfill({path:file});
                return route.fulfill({status:404,body:''});
            });
            await page.route('https://mhfbtltgwibwmsudsuvf.supabase.co/**', route=>{
                const req=route.request(),url=new URL(req.url());
                if(url.pathname.endsWith('/rpc/blog_listing_ads')) return route.fulfill({json:{regions:[],listings:[]}});
                if(req.method()!=='GET'){events.push({path:url.pathname,body:req.postDataJSON()});return route.fulfill({json:[]});}
                if(url.pathname==='/rest/v1/blog_posts')return route.fulfill({json:posts});
                return route.fulfill({json:[]});
            });
            page.on('pageerror',error=>errors.push(error.message));
            await page.goto('https://subingresso.it/blog'+(post?'?post='+post.slug:''),{waitUntil:'domcontentloaded'});
            await page.locator(post?'#blogPostContent':'#blogContainer > .grid').first().waitFor();
            const sensitive=post&&post.slug.startsWith('eredita-');
            const cards=page.locator('[data-fiere-promo]');
            if(sensitive)assert.equal(await cards.count(),0);
            else {
                assert(await cards.count()>=1);
                assert(await cards.count()<=2);
                if(post){
                    const region=post.slug.includes('veneto')?'Veneto':post.slug.includes('lombardia')?'Lombardia':null;
                    const href=await page.locator('[data-fiere-cta]').first().getAttribute('href');
                    const tracked=new URL(href,'https://subingresso.it');
                    if(tracked.pathname==='/api/personal-ads'){
                        assert.equal(tracked.origin,'https://subingresso.it');assert.equal(tracked.searchParams.get('action'),'click');assert.equal(tracked.searchParams.get('ad'),'fiere-01');assert.equal(tracked.searchParams.get('format'),'editoriale');assert.equal(tracked.searchParams.get('region'),region);
                    }else assert.equal(href,region?'/fiere?regione='+region:'/fiere');
                    const before=await cards.count();
                    await page.evaluate(p=>BlogFierePromo.mount(document.querySelector('#blogPostContent'),p,SLUG_TO_REGIONE),post);
                    assert.equal(await cards.count(),before,'mount ripetuto non duplica');
                    await page.locator('[data-fiere-cta]').first().evaluate(link=>{link.addEventListener('click',e=>e.preventDefault(),{once:true});link.dispatchEvent(new MouseEvent('click',{bubbles:true,cancelable:true}));});
                    await page.waitForTimeout(60);
                    const event=events.find(e=>e.body?.kind==='cta_fiere_click');
                    assert(event,'Click fiere registrato');assert.equal(event.body.post_slug,post.slug);assert.equal(event.body.regione,region);
                    assert(!events.some(e=>e.body?.kind==='cta_annunci_click'),'Click fiere distinto dagli annunci');
                }
                for(const card of await cards.all()) {
                    await card.scrollIntoViewIfNeeded();
                    const metrics=await card.evaluate(el=>({left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right,height:el.getBoundingClientRect().height,heading:getComputedStyle(el.querySelector('.bfp-title')).color,button:getComputedStyle(el.querySelector('.bfp-button')).color,target:el.querySelector('.bfp-button').getBoundingClientRect().height}));
                    assert(metrics.left>=0&&metrics.right<=width,JSON.stringify(metrics));
                    assert(metrics.height<=380,JSON.stringify({width,slug:post?.slug,metrics}));assert(metrics.target>=44);
                    assert.equal(metrics.heading,await card.evaluate(el=>el.classList.contains('bfp-compact'))?'rgb(15, 23, 42)':'rgb(255, 255, 255)');
                    assert.equal(metrics.button,'rgb(23, 37, 84)');
                    const phrases=await card.locator('.bfp-keep,.bfp-number').evaluateAll(els=>els.map(el=>({text:el.textContent,lines:el.getClientRects().length,right:el.getBoundingClientRect().right})));
                    assert(phrases.every(p=>p.lines===1&&p.right<=width),'Frasi intere sulle righe: '+JSON.stringify(phrases));
                }
                assert.match(await cards.first().locator('.bfp-title').innerText(),/5\.000\s*€\s*in 2 giorni\?/,'Importo come domanda provocatoria');
                if(out&&(!post||post.slug===chosen[0]||post.slug===chosen[2])) {
                    fs.mkdirSync(out,{recursive:true});await cards.first().screenshot({path:path.join(out,`${name}-${width}-${post?.slug||'index'}.png`)});
                }
            }
            // Ogni articolo conserva testo e box già esistenti.
            if(post){assert.equal(await page.locator('#bandoListingsBox').count(),1);assert.equal(await page.locator('#blogPostContent > table').count(),(post.content.match(/<table\b/gi)||[]).length);}
            assert.deepEqual(errors,[]);
            if(!post && name==='chromium' && width===1440) {
                const audit=await page.evaluate(all=>all.map(post=>{
                    const wrapper=document.createElement('div'),article=document.createElement('div');
                    article.innerHTML=DOMPurify.sanitize(post.content);wrapper.append(article);
                    const before=article.innerHTML;
                    BlogFierePromo.mount(article,post,SLUG_TO_REGIONE);
                    const count=wrapper.querySelectorAll('[data-fiere-promo]').length;
                    const href=wrapper.querySelector('[data-fiere-cta]')?.getAttribute('href');
                    wrapper.querySelectorAll('[data-fiere-promo]').forEach(el=>el.remove());
                    return {slug:post.slug,count,href,contentPreserved:article.innerHTML===before};
                }),posts);
                assert(audit.every(row=>row.contentPreserved&&row.count<=2),'Testi, liste e tabelle conservati su tutti gli articoli');
                if(out)fs.writeFileSync(path.join(out,'all-posts.json'),JSON.stringify(audit,null,2));
            }
            summary.push({name,width,height,slug:post?.slug||'index',cards:await cards.count()});
            await page.close();
        }
        console.log(`OK ${name} ${width}x${height}: copy, frasi intere, link, tracciamento e contenuti conservati.`);
    } finally {await browser.close();}
}
(async()=>{
    for(const [engine,name,width,height] of [[chromium,'chromium',1440,900],[chromium,'chromium',768,1024],[chromium,'chromium',320,568],[webkit,'webkit',390,844]])await run(engine,name,width,height);
    if(out)fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify({at:new Date().toISOString(),summary},null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
