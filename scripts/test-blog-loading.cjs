// Readable server HTML, small queries, safe hydration and existing interactions.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),handler=require(process.env.BLOG_RENDER_HANDLER||'../api/blog');
const longBody=Array.from({length:10},(_,i)=>`<h2>Sezione ${i}</h2><p>${'Informazioni per scegliere la piazza e partecipare con il banco. '.repeat(15)}</p>`).join('')+'<table><tr><th>Prezzo</th></tr><tr><td>20 €</td></tr></table>';
const posts=[
 {slug:'quanto-costa-un-posteggio-al-mercato',title:'Quanto costa un posteggio?',content:longBody},
 {slug:'bandi-posteggi-mercatali-lombardia',title:'Bandi Lombardia',content:longBody},
 {slug:'bandi-posteggi-mercatali-veneto',title:'Bandi Veneto',content:longBody},
 {slug:'bandi-posteggi-mercatali-piemonte',title:'Bandi Piemonte',content:longBody},
 {slug:'eredita-licenza-ambulante-successione-posteggio-mercatale-guida-eredi',title:'Guida agli eredi',content:longBody},
 {slug:'attacco-fixture',title:'Titolo </script><script>window.xss=true</script> $&',content:'<p>Testo valido</p><script>window.xss=true</script><img src=x onerror="window.xss=true"><a href="javascript:alert(1)">Link</a><table><tr><td>Integro</td></tr></table>'},
 {slug:'motion-fixture',title:'ADS animata nel blog',content:longBody+'<span data-pa-player><a href="/fiere" data-personal-ad="fiere-01" data-pa-format="300x250" data-pa-placement="test_motion"><img src="/images/personal-ads/fiere-01-300x250.svg?v=5" data-pa-motion="/images/personal-ads/fiere-01-300x250.animated.svg?v=5" width="300" height="250" alt="Scegli la fiera giusta per te"></a></span><script>window.unsafeEmbed=true</script>'}
].map(p=>({...p,excerpt:'Anteprima di '+p.title,published_at:'2026-10-01',category:'Guida',author:'Redazione',cover_image_url:null}));
const queries=[];
function rowsFor(url){const u=new URL(url);queries.push(u);let rows=posts;if(u.searchParams.has('slug')) {const filter=u.searchParams.get('slug');if(filter.startsWith('eq.'))rows=posts.filter(p=>p.slug===filter.slice(3));else if(filter.startsWith('like.'))rows=posts.filter(p=>p.slug.startsWith('bandi-posteggi-mercatali-'));}const cols=u.searchParams.get('select').split(',');return rows.map(p=>Object.fromEntries(cols.map(c=>[c,p[c]])));}
let failPost=false,failRelated=false;
global.fetch=async(url)=>{const u=new URL(url);if(failPost||failRelated&&u.searchParams.get('slug')?.startsWith('like.'))return new Response('{}',{status:503});return new Response(JSON.stringify(rowsFor(url)),{headers:{'Content-Type':'application/json'}});};
async function render(slug){const out={headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.statusCode=n;return this;},send(s){this.html=s;return this;}};await handler({query:slug===undefined?{}:{post:slug}},out);return out;}
const results={};
(async()=>{
 for(const slug of [undefined,...posts.map(p=>p.slug),'inesistente']) {
  const before=queries.length,r=await render(slug);results[slug||'index']=r;const doc=new JSDOM(r.html).window.document;
  assert.equal(r.statusCode,slug==='inesistente'?404:200);
  assert(!doc.querySelector('#blogContainer').classList.contains('hidden'));
  if(slug&&slug!=='inesistente') {assert.equal(doc.querySelector('h1').textContent,posts.find(p=>p.slug===slug).title);assert(doc.querySelector('#blogPostContent').textContent.length>10);const bootstrap=JSON.parse(doc.querySelector('#blogBootstrap').textContent);assert.equal(bootstrap.post.content,undefined);assert.equal(doc.querySelectorAll('#bandoListingsBox').length,1);assert.equal(doc.querySelectorAll('#blogPostContent table').length,1);assert(!doc.querySelector('#blogPostContent script'));assert(!doc.querySelector('#blogPostContent [onerror]'));}
  const used=queries.slice(before);for(const q of used){assert.notEqual(q.searchParams.get('select'),'*');if(!q.searchParams.get('slug')?.startsWith('eq.'))assert(!q.searchParams.get('select').split(',').includes('content'));}
 }
 failPost=true;const unavailable=await render(posts[0].slug);assert.equal(unavailable.statusCode,503);assert.equal(unavailable.headers['Cache-Control'],'private, no-store');failPost=false;
 failRelated=true;const stillReadable=await render(posts[1].slug);assert.equal(stillReadable.statusCode,200);assert(stillReadable.html.includes('Informazioni per scegliere'));failRelated=false;
 for(const [engine,label,width,height] of [[chromium,'Chromium',1440,900],[chromium,'Chromium',320,568],[webkit,'WebKit',390,844]]){
  const browser=await engine.launch({headless:true});
  try {for(const key of ['index',posts[0].slug,posts[1].slug,posts[4].slug,'motion-fixture','inesistente']){
   const context=await browser.newContext({viewport:{width,height},reducedMotion:'no-preference'}),page=await context.newPage(),errors=[],bodyQueries=[],writeRequests=[];
   await context.route('https://subingresso.it/**',route=>{const u=new URL(route.request().url());if(u.pathname==='/blog')return route.fulfill({contentType:'text/html',body:results[key].html});const file=path.join(root,u.pathname);return fs.existsSync(file)&&fs.statSync(file).isFile()?route.fulfill({path:file}):route.fulfill({status:404,body:''});});
   await context.route('https://mhfbtltgwibwmsudsuvf.supabase.co/**',route=>{const req=route.request(),u=new URL(req.url());if(u.pathname.endsWith('/blog_posts')){bodyQueries.push(u.href);return route.fulfill({json:[]});}if(u.pathname.endsWith('/blog_listing_ads'))return route.fulfill({json:{regions:[],listings:[]}});if(req.method()!=='GET')writeRequests.push(u.pathname);return route.fulfill({json:[]});});
   page.on('pageerror',e=>errors.push(e.message));const url='https://subingresso.it/blog'+(key==='index'?'':'?post='+key);
   await page.goto(url,{waitUntil:'domcontentloaded'});await page.waitForTimeout(400);assert.deepEqual(errors,[]);assert.deepEqual(bodyQueries,[],'hydration does not fetch article data again');assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(key!== 'index'&&key!=='inesistente'){assert(await page.locator('#blogPostContent').isVisible());assert.equal(await page.locator('#blogPostContent table').count(),1);assert.equal(await page.locator('#bandoListingsBox').count(),1);assert.equal(await page.evaluate(()=>!!window.xss),false);if(key===posts[1].slug){assert.equal(await page.locator('#bandoAlertForm').count(),1);assert.equal(await page.locator('#relatedBandi a').count(),2);}if(key===posts[4].slug)assert.equal(await page.locator('[data-fiere-promo]').count(),0);else assert(await page.locator('[data-fiere-promo]').count()>0);}
   if(key==='motion-fixture'){assert.equal(await page.evaluate(()=>!!window.unsafeEmbed),false);await page.locator('img[data-pa-motion]').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('img[data-pa-motion]').dataset.paPlaying==='true');await page.locator('[data-pa-pause]').click();assert.equal(await page.locator('[data-pa-motion-host]').count(),0);assert.deepEqual(errors,[]);}
   const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width,height}});await nojs.route(url,route=>route.fulfill({contentType:'text/html',body:results[key].html}));const np=await nojs.newPage();await np.goto(url);if(key==='index')assert.equal(await np.locator('#blogContainer a[href^="/blog?post="]').count(),posts.length);else if(key!=='inesistente')assert((await np.locator('#blogPostContent').innerText()).length>10);await nojs.close();await context.close();
  }console.log(label+' '+width+': readable without JS; no repeated article queries; previews, tables, promotions, related regions and hydration passed.');}finally{await browser.close();}
 }
 console.log('PASS: index metadata only; single article body; safe HTML/JSON; real 404 vs unavailable 503; optional related failure; three browser formats.');
})().catch(e=>{console.error(e);process.exitCode=1;});
