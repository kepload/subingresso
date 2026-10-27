'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
const setup=`
window.qaMode='owner';window.qaDelay=0;window.qaCalls=[];window.qaCallbacks=[];window.qaWrites=[];
const ids={owner:'00000000-0000-4000-8000-000000000001',second:'00000000-0000-4000-8000-000000000002',customer:'00000000-0000-4000-8000-000000000003'};
const session=()=>qaMode==='anonymous'?null:{user:{id:ids[qaMode]},access_token:'token-'+qaMode};
window.qaSwitch=mode=>{qaMode=mode;for(const fn of qaCallbacks)fn(mode==='anonymous'?'SIGNED_OUT':'SIGNED_IN',session());};
window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:session()}}),getUser:async()=>({data:{user:session()?.user||null}}),onAuthStateChange:fn=>{qaCallbacks.push(fn);return{data:{subscription:{unsubscribe(){}}}};}},from:()=>({select:()=>({eq:()=>({single:async()=>({data:{is_admin:qaMode==='owner',is_demo:false}})})})}),rpc:async(name,args)=>{qaCalls.push({name,args});const captured=qaMode,wait=qaDelay;await new Promise(r=>setTimeout(r,wait));return{data:name==='analytics_tracking_context'?{user_id:ids[captured]||null,excluded:['owner','second'].includes(captured)}:null};}})};
`;
const server=http.createServer((req,res)=>{
 if(req.url.startsWith('/js/')){res.setHeader('Content-Type','text/javascript');return res.end(fs.readFileSync(path.join(root,req.url.split('?')[0])));}
 res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html><body><h1>Fixture</h1><a href='/annunci'>Annunci</a><a id='banner' href='/vendi' data-personal-ad='vendi-01' data-pa-format='editoriale'>Pubblica</a><script>${setup}</script><script src='/js/supabase-config.js'></script><script src='/js/page-view-tracker.js'></script><script src='/js/blog-tracker.js'></script><script src='/js/site-analytics.js'></script><script src='/js/personal-ads-tracker.js'></script></body></html>`);
});
async function testHandler(){
 const handler=require('../lib/personal-ads-handler.cjs'),original=global.fetch;
 let calls=0;global.fetch=async()=>{calls++;return new Response(JSON.stringify('00000000-0000-4000-8000-000000000010'));};
 try{const res={headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},end(){}};
 await handler({method:'GET',query:{action:'click',ad:'vendi-01',format:'editoriale'},headers:{cookie:'other=1; si_internal_analytics=1; another=2'}},res);
 assert.equal(res.code,303);assert.equal(new URL(res.headers.Location).pathname,'/vendi');assert.equal(calls,0);
 }finally{global.fetch=original;}
}
(async()=>{
 await testHandler();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 let checks=1;
 try{for(const engine of [chromium,webkit]){
  const browser=await engine.launch();try{for(const width of [1440,390]){
   const context=await browser.newContext({viewport:{width,height:900}}),writes=[],errors=[];
   await context.addInitScript(()=>Object.defineProperty(navigator,'webdriver',{get:()=>false}));
   await context.route('https://mhfbtltgwibwmsudsuvf.supabase.co/**',route=>{writes.push({url:route.request().url(),auth:route.request().headers().authorization});return route.fulfill({status:201,contentType:'application/json',body:'0'});});
   const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));await page.goto(base+'/blog?post=qa-post');
   await page.waitForFunction(()=>window.AnalyticsIdentity&&window.SiteAnalytics);
   assert.equal(await page.evaluate(async()=>(await AnalyticsIdentity.context()).allowed),false);checks++;
   await page.evaluate(async()=>{await trackBlogConversion('cta_annunci_click','qa-post');SiteAnalytics.track('listing_contact',{action:'whatsapp'});await SiteAnalytics.flush();});
   assert.equal(writes.length,0);assert((await context.cookies()).some(c=>c.name==='si_internal_analytics'));checks+=2;
   await page.waitForFunction(()=>new URL(document.getElementById('banner').href).pathname==='/api/personal-ads');
   assert.equal(await page.evaluate(()=>{const a=document.getElementById('banner');a.dispatchEvent(new Event('pointerdown'));return new URL(a.href).searchParams.get('preview');}),'1');checks++;
   await page.evaluate(()=>qaSwitch('second'));assert.equal(await page.evaluate(async()=>(await AnalyticsIdentity.context()).allowed),false);checks++;
   await page.evaluate(()=>qaSwitch('anonymous'));assert.equal(await page.evaluate(async()=>(await AnalyticsIdentity.context()).allowed),false);checks++;
   const old=await page.evaluate(()=>localStorage.getItem('_visitor_id'));
   await page.evaluate(()=>qaSwitch('customer'));assert.equal(await page.evaluate(async()=>(await AnalyticsIdentity.context()).allowed),true);checks++;
   assert.notEqual(await page.evaluate(()=>localStorage.getItem('_visitor_id')),old);checks++;
   assert(!(await context.cookies()).some(c=>c.name==='si_internal_analytics'));checks++;
   await page.waitForFunction(()=>{const a=document.getElementById('banner');a.dispatchEvent(new Event('pointerdown'));return new URL(a.href).searchParams.get('preview')!=='1';});checks++;
   await page.evaluate(async()=>{await trackBlogConversion('cta_annunci_click','qa-post');SiteAnalytics.track('search_results',{results:3});await SiteAnalytics.flush();});
   assert(writes.some(w=>w.url.endsWith('/blog_conversions')&&w.auth==='Bearer token-customer'));assert(writes.some(w=>w.url.endsWith('/track_site_events')&&w.auth==='Bearer token-customer'));checks+=2;
   writes.length=0;
   await page.evaluate(async()=>{qaDelay=100;qaSwitch('owner');const old=trackBlogConversion('cta_annunci_click','qa-stale');qaSwitch('customer');await old;qaDelay=0;});
   assert(!writes.some(w=>w.url.endsWith('/blog_conversions')));checks++;
   writes.length=0;
   await page.evaluate(async()=>{qaDelay=100;qaSwitch('owner');const old=AnalyticsIdentity.context();qaSwitch('customer');await old;qaDelay=0;});
   assert.equal(await page.evaluate(async()=>(await AnalyticsIdentity.context()).userId),'00000000-0000-4000-8000-000000000003');checks++;
   await page.evaluate(()=>qaSwitch('owner'));await page.evaluate(()=>AnalyticsIdentity.context());await page.reload();await page.evaluate(()=>AnalyticsIdentity.context());
   await page.evaluate(async()=>{await trackBlogConversion('cta_annunci_click','qa-post');await SiteAnalytics.flush();});assert.equal(writes.length,0);checks++;
   assert.deepEqual(errors,[]);checks++;await context.close();
  }}finally{await browser.close();}
 }
 console.log(JSON.stringify({passed:true,checks,engines:['Chromium','WebKit'],widths:[1440,390],real_writes:0}));
 }finally{server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
