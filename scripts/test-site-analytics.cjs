'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.SITE_ANALYTICS_TEST_OUT;
const dashboard=fs.readFileSync(path.join(root,'dashboard.html'),'utf8');
const panel=dashboard.slice(dashboard.indexOf('            <details id="siteAnalyticsPanel"'),dashboard.indexOf('            <!-- Funnel utenti -->'));
const rows=Array.from({length:101},(_,i)=>({id:'event-'+i,created_at:'2026-10-26T12:00:00Z',name:i%2?'publish_error':'search_results',page:'search',entity:i===0?'<img src=x onerror="window.injected=true">':'pubblico-'+i,device:'mobile',source:'blog',entry_page:'blog',campaign:i===0?'=FORMULA':'autunno',medium:'social',channel:'telegram',authenticated:false,data:{results:0,empty:true,field:'fDescrizione',error_code:'validation',step:5}}));
const baseReport={until:'2026-10-26T18:00:00Z',started_at:'2026-10-26T12:00:00Z',days:30,total:101,summary:{sessions:8,searches:51,empty_searches:51,errors:50},groups:[{name:'publish_error',page:'publish',entity:null,device:'mobile',source:'blog',data:{step:5,field:'fDescrizione',error_code:'validation'},events:50,sessions:3}]};
const stub=`const SUPABASE_URL='https://example.invalid',SUPABASE_ANON_KEY='public-test-key';
window.listeners=[];window.authValue=null;window.failAdmin=false;window.slowAdmin=0;
const _supabase={auth:{getSession:async()=>({data:{session:window.authValue}}),onAuthStateChange:fn=>{listeners.push(fn);return {data:{subscription:{unsubscribe(){}}}};}},rpc:async(name,args)=>{if(name!=='admin_site_analytics')return {data:null};await new Promise(r=>setTimeout(r,window.slowAdmin));if(window.failAdmin)return {error:{message:'offline'}};const all=${JSON.stringify(rows)};return {data:{...${JSON.stringify(baseReport)},days:args.p_days,rows:all.slice(args.p_offset,args.p_offset+args.p_limit)}};}};
`;
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');let file=url.pathname.slice(1);
 if(file.startsWith('js/')||file.startsWith('css/')){const full=path.resolve(root,file);if(!full.startsWith(root+path.sep))return res.writeHead(403).end();res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/css');return fs.readFile(full,(e,b)=>e?res.writeHead(404).end():res.end(b));}
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.end(`<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/css/tailwind.css"><link rel="stylesheet" href="/css/dashboard-statistics.css"><link rel="stylesheet" href="/css/admin-theme.css"><link rel="stylesheet" href="/css/site-analytics.css"><body style="margin:0;padding:16px;font-family:Arial"><main style="max-width:1000px;margin:auto"><h1>Subingresso.it</h1>${file==='admin'?panel:'<article style="min-height:2800px"><h2>Guida per il mercato</h2><a id="cta" href="/vendi">Pubblica annuncio</a></article>'}</main><script>${stub}</script><script src="/js/page-view-tracker.js"></script><script src="/js/site-analytics.js"></script>${file==='admin'?'<script src="/js/admin-site-analytics.js"></script>':''}</body></html>`);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;let checks=0;
 try{
  for(const [engine,width] of [[chromium,1440],[chromium,768],[chromium,320],[webkit,390]]){
   const browser=await engine.launch({headless:true});
   try{
    const context=await browser.newContext({viewport:{width,height:900},acceptDownloads:true});const batches=[],errors=[];let failOnce=false;
    await context.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));
    await context.route('https://example.invalid/**',async route=>{if(route.request().url().endsWith('track_site_events')){const body=route.request().postDataJSON();batches.push(body.p_events);if(failOnce){failOnce=false;return route.fulfill({status:503,body:'{}'});}return route.fulfill({contentType:'application/json',body:String(body.p_events.length)});}return route.fulfill({status:201,body:''});});
    const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));await page.clock.install();
    await page.goto(base+'/blog/test-articolo?utm_source=telegram&utm_medium=social&utm_campaign=autunno');
    await page.waitForFunction(()=>window.SiteAnalytics);await page.waitForTimeout(200);
    await page.evaluate(()=>{SiteAnalytics.track('search_results',{results:0,empty:true,query:'PRIVATE QUERY',password:'PRIVATE PASSWORD',description:'PRIVATE DESCRIPTION',has_query:true});SiteAnalytics.track('search_results',{results:0,empty:true,query:'PRIVATE QUERY',password:'PRIVATE PASSWORD',description:'PRIVATE DESCRIPTION',has_query:true});return SiteAnalytics.flush();});
    let events=batches.flat();assert.equal(events.filter(e=>e.name==='search_results').length,1);checks++;
    const search=events.find(e=>e.name==='search_results');assert(!JSON.stringify(search).includes('PRIVATE'));assert.equal(search.medium,'social');assert.equal(search.channel,'telegram');assert.equal(search.entity,'test-articolo');assert.equal(search.device,width<=767?'mobile':width<=1024?'tablet':'desktop');checks+=5;
    await page.clock.fastForward(16000);await page.evaluate(()=>SiteAnalytics.flush());
    assert(batches.flat().some(e=>e.name==='blog_read'&&e.data.visible_seconds>=15));checks++;
    await page.evaluate(()=>window.dispatchEvent(new ErrorEvent('error',{error:new Error('PRIVATE STACK MESSAGE'),message:'PRIVATE STACK MESSAGE'})));await page.evaluate(()=>SiteAnalytics.flush());
    assert(batches.flat().some(e=>e.name==='technical_error'&&e.data.error_code==='javascript'));assert(!JSON.stringify(batches).includes('PRIVATE STACK'));checks+=2;
    const sessionBefore=search.session_id;
    await page.evaluate(()=>{authValue={user:{id:'11111111-1111-4111-8111-111111111111'},access_token:'synthetic'};listeners.forEach(fn=>fn('SIGNED_IN',authValue));});await page.clock.fastForward(10);
    await page.evaluate(()=>{listeners.forEach(fn=>fn('SIGNED_OUT',null));});await page.clock.fastForward(10);
    await page.evaluate(()=>{SiteAnalytics.track('auth_open',{action:'register'});return SiteAnalytics.flush();});
    assert.notEqual(batches.flat().findLast(e=>e.name==='auth_open').session_id,sessionBefore);checks++;
    await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pagehide')));await page.clock.fastForward(20);
    assert(batches.flat().some(e=>e.name==='page_leave'));checks++;
    await page.waitForTimeout(200);failOnce=true;await page.evaluate(()=>{SiteAnalytics.track('fair_open',{},'retry-fair');return SiteAnalytics.flush();});await page.waitForTimeout(200);await page.clock.fastForward(2000);await page.waitForTimeout(200);const retried=batches.flat().filter(e=>e.name==='fair_open'&&e.entity==='retry-fair');assert.equal(retried.length,2);assert.equal(retried[0].id,retried[1].id);checks+=2;
    await page.goto(base+'/reset-password?token=PRIVATE_TOKEN&email=PRIVATE_EMAIL');await page.waitForTimeout(100);
    await page.evaluate(()=>SiteAnalytics.flush());assert(!JSON.stringify(batches).includes('PRIVATE_TOKEN'));checks++;
    await context.addInitScript(()=>{Storage.prototype.getItem=function(){throw Error('blocked');};Storage.prototype.setItem=function(){throw Error('blocked');};});
    await page.goto(base+'/blog/storage-blocked');await page.waitForTimeout(100);await page.evaluate(()=>SiteAnalytics.track('publish_start'));await page.evaluate(()=>SiteAnalytics.flush());assert(batches.flat().some(e=>e.name==='publish_start'&&e.entity==='storage-blocked'));checks++;
    await page.goto(base+'/admin');await page.waitForTimeout(100);await page.locator('#siteAnalyticsPanel>summary').click();await page.waitForFunction(()=>document.getElementById('saKpis').textContent.includes('8'));
    assert.deepEqual(await page.locator('.sa-kpis strong').allTextContents(),['8','51','51','50']);checks++;
    await page.getByText('Azioni e passaggi',{exact:true}).click();await page.getByText('Registro degli eventi',{exact:true}).click();
    assert.equal(await page.locator('#saRows tr').count(),100);await page.locator('#saNext').click();await page.waitForFunction(()=>document.querySelectorAll('#saRows tr').length===1);checks++;
    const download=page.waitForEvent('download');await page.locator('#saExport').click();const artifact=await download;const filename=out?path.join(out,`site-events-${engine===webkit?'WebKit':'Chromium'}-${width}.csv`):await artifact.path();if(out)await artifact.saveAs(filename);const csv=fs.readFileSync(filename,'utf8');assert.equal(csv.trim().split(/\r?\n/).length,102);assert(!csv.includes('session_id'));assert(csv.includes("'=FORMULA"));checks+=3;
    assert.equal(await page.evaluate(()=>window.injected===true),false);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);checks+=2;
    if(out)await page.screenshot({path:path.join(out,`analytics-${engine===webkit?'WebKit':'Chromium'}-${width}.png`),fullPage:true});
    await page.evaluate(()=>document.documentElement.classList.add('admin-dark'));
    const darkControl=await page.locator('#saDays').evaluate(el=>({color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));assert.equal(darkControl.color,'rgb(241, 245, 249)');assert.equal(darkControl.background,'rgb(15, 23, 42)');checks+=2;
    if(out)await page.screenshot({path:path.join(out,`analytics-${engine===webkit?'WebKit':'Chromium'}-${width}-dark.png`),fullPage:true});
    await page.evaluate(()=>window.failAdmin=true);await page.locator('#saRefresh').click();await page.waitForFunction(()=>document.getElementById('saState').textContent.includes('non disponibili'));assert.equal(await page.locator('#saKpis').textContent(),'');checks++;
    await page.evaluate(()=>window.failAdmin=false);await page.locator('#saRefresh').click();await page.waitForFunction(()=>document.getElementById('saKpis').textContent.includes('8'));
    await page.evaluate(()=>{window.slowAdmin=300;document.getElementById('saRefresh').click();window.listeners.forEach(fn=>fn('SIGNED_IN',{user:{id:'another'},access_token:'synthetic'}));});await page.waitForTimeout(400);assert.equal(await page.locator('#saKpis').textContent(),'');checks++;
    assert.deepEqual(errors,[]);checks++;await context.close();
   }finally{await browser.close();}
  }
  console.log(JSON.stringify({passed:true,checks,real_writes:0}));if(out)fs.writeFileSync(path.join(out,'browser-analytics.json'),JSON.stringify({passed:true,checks,real_writes:0},null,2));
 }finally{server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
