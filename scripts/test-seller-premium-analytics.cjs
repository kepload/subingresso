// Real shell, purchase dialog, chart and seller panel; isolated accounts and API.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.SELLER_PREMIUM_QA_DIR;
const published=new Map(),read=f=>published.get(f)||fs.readFileSync(path.join(root,f),'utf8');
let chart;
function fixture(query){
 const html=read('dashboard.html'),panel=html.slice(html.indexOf('<div id="sellerAnalyticsPanel"'),html.indexOf('<!-- Onboarding widget'));
 const modal=html.slice(html.indexOf('<div id="vetrinaModal"'),html.indexOf('<!-- ══════════════ MODAL PROFILO'));
 const code=html.slice(html.indexOf('// Seller analytics'),html.indexOf('async function loadMyListings()'));
 const wrappers=html.slice(html.indexOf('// Premium controller shared'),html.indexOf('// ════════════ ADMIN: Valutatore Logs'));
 const styles=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/gi)].map(m=>m[0]).filter(t=>!t.includes('https://')).join('');
 return `<!doctype html><html lang="it" data-admin-theme-page="dashboard"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${styles}<link rel="stylesheet" href="/css/admin-theme.css?v=3">
 <style>@font-face{font-family:Jakarta;src:url('/css/fonts/jakarta-400.woff')}@font-face{font-family:Jakarta;src:url('/css/fonts/jakarta-700.woff');font-weight:700 900}body{font-family:Jakarta,sans-serif;background:#f5f5f5}main{max-width:1100px;padding:24px 16px;margin:auto}.admin-dark body{background:#08090b}h1{font-size:24px;font-weight:700;margin:18px 0}.fixture-controls{display:flex;gap:16px;align-items:center;margin-bottom:16px}.fixture-controls button{min-height:44px;padding:10px}</style>
 <script src="/chart.js"></script></head><body><header></header><main><h1>Subingresso.it · Statistiche posteggi</h1><div class="fixture-controls"><button id="open" onclick="VetrinaPremium.open()">Vetrina</button><button id="promote" onclick="openVetrinaModal(rows[0])">Promuovi</button></div>${panel}</main>${modal}<footer id="pageFooter"></footer>
 <script>
 let _currentUser={id:'11111111-1111-1111-1111-111111111111'},_sellerAnalyticsLoaded=false;
 const SUPABASE_URL='https://backend.invalid',SUPABASE_ANON_KEY='test-public';
 window.callbacks=[];window.mode=${JSON.stringify(query.get('scenario')||'free')};window.delay=0;window.fail=false;
 function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 function showToast(){}function isListingFeatured(l){return l.featured===true}function isListingExpired(){return false}
 const daily=[{day:'2026-10-22',views:12,messages:2,call_clicks:3,whatsapp_clicks:4,chat_clicks:1,saves:5}];
 const base={user_id:_currentUser.id,status:'active',created_at:'2026-10-01',expires_at:'2099-01-01',photo_count:1,description_length:300,prezzo:15000,img_urls:[]};
 window.rows=Array.from({length:4},(_,i)=>({...base,id:'22222222-2222-2222-2222-'+String(i+1).padStart(12,'0'),titolo:['Posteggio a Brescia','=HYPERLINK("unsafe")','Posteggio a Bergamo','<img src=x onerror=window.xss=true>'][i],premium_analytics:false,period_views:7,period_messages:1}));
 function data(){const paid=i=>({...rows[i],premium_analytics:true,period_views:12,period_messages:2,daily,featured:false,featured_until:'2026-01-01'});const free=i=>({...rows[i],daily:[{day:'2026-10-22',views:987654,call_clicks:987654,saves:987654}]});return mode==='single'?[paid(0)]:mode==='bundle'?[paid(0),paid(1),free(2)]:mode==='mixed'?[paid(0),free(1)]:[free(0),free(3)];}
 const _supabase={auth:{onAuthStateChange:f=>{callbacks.push(f);return{}},getSession:async()=>({data:{session:{user:_currentUser,access_token:'fake'}}})},rpc:async(name,args)=>{if(name==='dashboard_vetrina_stats')return{data:{listings:[]}};const snapshot=data(),d=delay;await new Promise(r=>setTimeout(r,d));if(fail)return{error:{message:'offline'}};return{data:{days:args.p_days,end_day:'2026-10-22',tracking_since:'2026-10-06',listings:snapshot}}},from:()=>({select(){return this},eq(){return this},order(){return this},range:async()=>({data:rows})})};
 </script><script src="/js/vetrina-pricing.js"></script><script src="/js/vetrina-premium.js"></script><script src="/js/ui-components.js"></script><script>${wrappers}\n${code}\nloadSellerAnalytics(30);</script></body></html>`;
}
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');if(url.pathname==='/dashboard'){res.setHeader('Content-Type','text/html;charset=utf-8');return res.end(fixture(url.searchParams))}
 if(url.pathname==='/chart.js'){res.setHeader('Content-Type','text/javascript');return res.end(chart)}
 const file=decodeURIComponent(url.pathname.slice(1)),full=path.resolve(root,file);if(!full.startsWith(root+path.sep))return res.writeHead(403).end();
 res.setHeader('Content-Type',({'.css':'text/css','.js':'text/javascript','.woff':'font/woff'})[path.extname(file)]||'application/octet-stream');
 if(published.has(file))return res.end(published.get(file));fs.readFile(full,(e,b)=>e?res.writeHead(404).end():res.end(b));
});
async function run(engine,name,width,height,base){
 const browser=await engine.launch({headless:true});try{
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base+'/dashboard');await page.waitForFunction(()=>!_sellerAnalyticsState.loading);
 const values=()=>page.locator('#sellerAnalyticsSummary .leading-none').allTextContents();
 const reload=async mode=>{await page.evaluate(mode=>{window.mode=mode;loadSellerAnalytics(30)},mode);await page.waitForFunction(()=>!_sellerAnalyticsState.loading)};
 assert.deepEqual(await values(),['14','2']);assert.equal(await page.locator('#sellerPremiumAnalytics').isVisible(),false);
 assert.equal(await page.locator('.seller-locked-data').getAttribute('aria-hidden'),'true');assert.equal(await page.locator('.seller-locked-data').evaluate(e=>getComputedStyle(e).filter),'blur(6px)');
 assert.equal(await page.locator('#sellerAnalyticsTable').innerText(),'');assert.equal(await page.evaluate(()=>_sellerAnalyticsChart),null);
 assert.equal(await page.locator('#sellerAnalyticsPanel img').count(),0);assert.equal(await page.evaluate(()=>window.xss),undefined);
 if(out)await page.screenshot({path:path.join(out,name+'-'+width+'-gratuito.png'),fullPage:true});
 for(const trigger of ['#open','#promote','.seller-locked-action button']){
  await page.locator(trigger).click();await page.waitForFunction(()=>document.querySelectorAll('#premiumListings input').length===4);
  assert.equal(await page.locator('#vetrinaModal .site-footer').count(),0);assert.equal(await page.locator('#vetrinaCheckoutButton').isVisible(),true);
  const b=await page.locator('#vetrinaCheckoutButton').boundingBox();assert(b.y>=0&&b.y+b.height<=height);
  await page.keyboard.press('Escape');
 }
 await reload('single');assert.deepEqual(await values(),['12','2','3','4']);assert.equal(await page.locator('#sellerAnalyticsLocked').innerText(),'');
 assert.equal(await page.locator('#sellerAnalyticsSummary').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length),width>650?4:2,'four metrics on desktop, two columns on phones');
 assert.match(await page.locator('#sellerAnalyticsScope').innerText(),/permanente.*scaduta/);
 assert.deepEqual(await page.evaluate(()=>_sellerAnalyticsChart.data.datasets.map(s=>s.data.reduce((a,b)=>a+b,0))),[12,2,8,5]);
 await reload('bundle');assert.deepEqual(await values(),['31','5','6','8']);assert.equal(await page.locator('#sellerAnalyticsTable tbody tr').count(),2);
 assert.match(await page.locator('#sellerAnalyticsScope').innerText(),/2 annunci sbloccati/);assert.equal(await page.locator('#sellerAnalyticsLocked').isVisible(),true);
 assert.equal(await page.evaluate(()=>_sellerAnalyticsChart.data.datasets[0].data.reduce((a,b)=>a+b,0)),24);
 const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:'Esporta CSV',exact:true}).click();const download=await downloadPromise;
 const csv=fs.readFileSync(await download.path(),'utf8');assert(csv.includes('"24 set')===false);assert(csv.includes('"\'=HYPERLINK'));assert(!csv.includes('987654'));assert.equal(csv.split('\r\n').length,3);
 await page.selectOption('#sellerAnalyticsListingSelect','22222222-2222-2222-2222-000000000003');assert.deepEqual(await values(),['7','1']);assert.equal(await page.locator('#sellerPremiumAnalytics').isVisible(),false);assert.equal(await page.evaluate(()=>_sellerAnalyticsChart),null);
 await page.selectOption('#sellerAnalyticsListingSelect','all');await reload('bundle');
 await page.getByRole('button',{name:'Ultimi 7 giorni',exact:true}).click();await page.waitForFunction(()=>!_sellerAnalyticsState.loading);assert.equal(await page.evaluate(()=>_sellerAnalyticsChart.data.labels.length),7);
 if(out)await page.screenshot({path:path.join(out,name+'-'+width+'-bundle.png'),fullPage:true});
 await page.evaluate(()=>document.documentElement.classList.add('admin-dark'));await reload('bundle');
 assert(await page.locator('.seller-locked-action button').evaluate(e=>{const s=getComputedStyle(e),lum=v=>{const c=v.match(/[\d.]+/g).slice(0,3).map(n=>{n=Number(n)/255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4});return .2126*c[0]+.7152*c[1]+.0722*c[2]};const a=lum(s.color),b=lum(s.backgroundColor);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5}),'dark CTA contrast');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no page overflow');
 if(out)await page.screenshot({path:path.join(out,name+'-'+width+'-scuro.png'),fullPage:true});
 await page.evaluate(()=>{fail=true;loadSellerAnalytics()});await page.getByRole('button',{name:'Riprova',exact:true}).waitFor();assert.equal(await page.locator('#sellerPremiumAnalytics').isVisible(),false);assert.equal(await page.locator('#sellerAnalyticsLocked').innerText(),'');
 await page.evaluate(()=>{fail=false});await page.getByRole('button',{name:'Riprova',exact:true}).click();await page.waitForFunction(()=>!_sellerAnalyticsState.loading);
 await page.evaluate(()=>{delay=150;mode='bundle';loadSellerAnalytics(90);delay=0;mode='free';loadSellerAnalytics(7)});await page.waitForTimeout(220);assert.deepEqual(await values(),['14','2']);
 await page.evaluate(()=>{delay=100;loadSellerAnalytics();_currentUser=null;callbacks.forEach(f=>f('SIGNED_OUT',null))});await page.waitForTimeout(150);assert.equal(await page.locator('#sellerAnalyticsPanel').isVisible(),false);assert.equal(await page.locator('#sellerAnalyticsSummary').innerText(),'');
 assert.deepEqual(errors,[]);console.log('OK '+name+' '+width+': full shell/dialog, free/paid/bundle/expired, mixed totals, chart/table/CSV, scope, XSS, dark/mobile, errors, races and logout');
 }finally{await browser.close()}
}
(async()=>{
 if(out)fs.mkdirSync(out,{recursive:true});
 if(process.env.SELLER_PREMIUM_USE_PUBLISHED)for(const file of ['dashboard.html','js/ui-components.js','js/vetrina-premium.js','js/vetrina-pricing.js','css/vetrina-premium.css','css/seller-analytics.css','css/admin-theme.css']){const r=await fetch('https://subingresso.it/'+file.replace(/\.html$/,''));assert(r.ok);published.set(file,await r.text())}
 const r=await fetch('https://cdn.jsdelivr.net/npm/chart.js@4.4.3/dist/chart.umd.min.js');assert(r.ok);chart=await r.text();
 await new Promise(resolve=>server.listen(process.env.SELLER_PREMIUM_INSPECT?3029:0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 if(process.env.SELLER_PREMIUM_INSPECT){console.log(base+'/dashboard');return}
 try{for(const [engine,name,w,h]of[[chromium,'Chrome',1440,1000],[chromium,'Chrome',320,568],[webkit,'Safari',390,844]])await run(engine,name,w,h,base)}finally{server.close()}
})().catch(e=>{console.error(e);server.close();process.exitCode=1});
