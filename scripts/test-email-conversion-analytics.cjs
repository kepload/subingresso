// Isolated provider/API and real browser tests. Never sends email or charges a card.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module');
const {webcrypto}=require('node:crypto');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.EMAIL_ANALYTICS_QA_DIR;
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const uid='11111111-1111-1111-1111-111111111111',token='22222222-2222-2222-2222-222222222222';
const baseline={checked_at:'2026-10-23T13:00:00Z',tracking_started_at:'2026-10-23T13:00:00Z',email:{sent:12,delivered:12,measured:0,unmeasured:12,opened:0,clicked:0,paid:0,revenue_cents:0},site:{opened:0,closed:0,attempts:0,checkouts:0,paid:0,cancelled:0,incomplete:0,pending:0,errors:0,revenue_cents:0},history:{checkouts:2,paid:0,incomplete:1,pending:1},choices:[],recent:[],sample:null,variants:Array.from({length:6},(_,i)=>({family:i<3?'single':'bundle',variant:i%3,sent:2,delivered:2,measured:0,opened:0,clicked:0,paid:0,revenue_cents:0}))};
async function apiTests(){
 const handler=require('../api/vetrina-mail.js'),original=global.fetch;let calls=[];
 global.fetch=async(url,options)=>{calls.push({url,body:JSON.parse(options.body)});throw Error('offline');};
 async function call(method,kind,t=token,headers={}){const response={headers:{},setHeader(k,v){this.headers[k]=v;},status(s){this.code=s;return this;},end(body){this.body=body;return this;}};await handler({method,query:{kind,t,url:'https://attacker.invalid'},headers},response);return response;}
 try{
  assert.equal((await call('POST','click')).code,405);assert.equal(calls.length,0);
  assert.equal((await call('GET','click','bad')).headers.Location,'/dashboard');assert.equal(calls.length,0);
  assert.equal((await call('HEAD','open')).body,undefined);assert.equal(calls.length,0);
  await call('GET','click',token,{'sec-purpose':'prefetch;prerender'});assert.equal(calls.length,0);
  const pixel=await call('GET','open');assert.equal(pixel.headers['Content-Type'],'image/gif');assert(Buffer.isBuffer(pixel.body));assert.equal(calls.length,1);
  const click=await call('GET','click');assert.equal(click.code,303);assert.equal(click.headers.Location,'/dashboard?ve='+token);assert.equal(click.headers['Referrer-Policy'],'no-referrer');assert.equal(calls[1].body.p_kind,'click');
 }finally{global.fetch=original;}
 // Privileged Edge: JWT/admin checks, recipient fixed to authenticated admin,
 // idempotent sample claim, unknown provider response and preserved delivery.
 let admin=true,claimed=true,providerMode='ok',writes=[],sends=0;
 const item={delivery_id:uid,tracking_token:token,tracking_enabled:true};
 const client={auth:{getUser:async()=>({data:{user:{id:uid}}}),admin:{getUserById:async()=>({data:{user:{email:'owner@example.invalid'}}})}},
  rpc:async(name,args)=>{assert.equal(name,'claim_vetrina_email_sample');assert.equal(args.p_user,uid);const result=claimed?item:null;claimed=false;return{data:result};},
  from(table){let update=null;const q={select(){return q;},eq(){return q;},not(){return q;},order(){return q;},update(value){update=value;writes.push({table,value});return q;},single:async()=>({data:{is_admin:admin}}),limit:async()=>({data:table==='profiles'?[{id:uid}]:[{id:uid,provider_id:token,delivery_confirmed:true}]}),then(resolve,reject){return Promise.resolve({error:null}).then(resolve,reject);}};return q;}};
 let edge;const source=read('supabase/functions/admin-email-analytics/index.ts').replace(/^import[^\n]+\n/gm,'');
 new vm.Script(stripTypeScriptTypes(source)).runInNewContext({Deno:{env:{get:k=>k==='SB_SECRET_KEY'?'internal-test-key':'test'},serve:fn=>edge=fn},createClient:()=>client,Request,Response,AbortSignal,console:{error(){}},setTimeout:fn=>{fn();},vetrinaEmailPayload:(_item,recipient)=>{assert.equal(recipient,'owner@example.invalid');return{payload:{to:[recipient],subject:'Test'},listing_ids:[],quote:{tier:'10d'},family:'stats'};},fetch:async(url,options)=>{if(options.method==='POST'){sends++;assert.equal(options.headers['Idempotency-Key'],'vetrina-email-sample/'+uid);assert.deepEqual(JSON.parse(options.body).to,['owner@example.invalid']);if(providerMode==='unknown')throw Error('timeout');return Response.json({id:token});}return Response.json({last_event:'bounced'});}});
 const request=(action,auth='valid')=>edge(new Request('https://backend.invalid',{method:'POST',headers:auth?{Authorization:'Bearer '+auth}:{},body:JSON.stringify({action,email:'attacker@example.invalid'})}));
 assert.equal((await request('sample','')).status,401);admin=false;assert.equal((await request('sample')).status,403);assert.equal(sends,0);admin=true;
 assert.equal((await request('sample')).status,200);assert.equal(sends,1);assert.equal((await request('sample')).status,200);assert.equal(sends,1);
 claimed=true;providerMode='unknown';assert.equal((await request('sample')).status,502);assert(writes.some(w=>w.value.status==='unknown'));assert.equal((await request('sample')).status,200);assert.equal(sends,2,'unknown sends never retried');
 await request('sync');assert(writes.some(w=>w.value.provider_event==='bounced'&&w.value.delivery_confirmed===true));
 console.log('PASS API/Edge: no open redirect; HEAD/prefetch excluded; failures preserve link; admin-only; own recipient; daily claim; no timeout retry; delivery retained.');
}
function fixture(){
 const html=read('dashboard.html'),start=html.indexOf('<section id="email-vetrine"'),end=html.indexOf('<!-- Pending Review List',start);
 return `<!doctype html><html lang="it" data-admin-theme-page="dashboard"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/css/tailwind.css"><link rel="stylesheet" href="/css/dashboard-statistics.css"><link rel="stylesheet" href="/css/admin-theme.css"><link rel="stylesheet" href="/css/admin-email-analytics.css"><style>@font-face{font-family:'Plus Jakarta Sans';font-weight:400;src:url('/css/fonts/jakarta-400.woff')}@font-face{font-family:'Plus Jakarta Sans';font-weight:600;src:url('/css/fonts/jakarta-600.woff')}@font-face{font-family:'Plus Jakarta Sans';font-weight:700;src:url('/css/fonts/jakarta-700.woff')}body{font:14px/1.6 'Plus Jakarta Sans',sans-serif;margin:0;background:#f5f6f8;color:#18212f}main{max-width:1200px;margin:32px auto;padding:0 20px}h1{font-size:24px;font-weight:700;margin:0 0 24px}button,select{font:inherit}html.admin-dark body{background:#101114;color:#f2f4f7}</style></head><body><main><h1>Dashboard admin</h1><div id="adminPanel">${html.slice(start,end)}</div></main><script>
 const SUPABASE_URL='https://backend.invalid',SUPABASE_ANON_KEY='test-public';window.currentUser={id:'${uid}'};window.callbacks=[];window.actions=[];window.baseline=${JSON.stringify(baseline)};window.mode='normal';
 function escapeHTML(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
 const _supabase={auth:{getSession:async()=>({data:{session:currentUser?{user:currentUser,access_token:'test-token'}:null}}),onAuthStateChange:fn=>callbacks.push(fn)},rpc:async(name,args)=>{if(mode==='fail')return{error:{message:'offline'}};if(mode==='race')await new Promise(r=>setTimeout(r,args.p_days===7?100:5));const data=structuredClone(baseline);if(mode==='race')data.email.delivered=args.p_days;return{data};}};
 window.fetch=async(url,options)=>{actions.push(JSON.parse(options.body));return{ok:true,json:async()=>({message:'Copia di prova simulata.',failed:0})};};
 </script><script src="/js/admin-email-analytics.js"></script><script>AdminEmailAnalytics.start(currentUser);</script></body></html>`;
}
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(url.pathname==='/dashboard'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(fixture());}const full=path.resolve(root,'.'+url.pathname);if(!full.startsWith(root+path.sep))return res.writeHead(403).end();res.setHeader('Content-Type',({'.css':'text/css','.js':'text/javascript','.woff':'font/woff'})[path.extname(full)]||'application/octet-stream');fs.readFile(full,(e,data)=>e?res.writeHead(404).end():res.end(data));});
async function browserTest(engine,name,width,height,base){
 const browser=await engine.launch({headless:true});try{
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/dashboard');await page.waitForFunction(()=>document.querySelectorAll('#mailVariantRows tr').length===6);
  assert.deepEqual(await page.locator('.mail-metrics dd').allTextContents(),['12','—','—','0','0,00 €']);assert((await page.locator('#mailMeasurementNote').innerText()).includes('non sono ricostruibili'));
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  assert(await page.locator('#mailVariantRows').evaluate(el=>el.closest('.mail-table-wrap').scrollWidth>=el.closest('.mail-table-wrap').clientWidth));
  if(out)await page.screenshot({path:path.join(out,`${name}-${width}-chiaro.png`),fullPage:true});
  await page.locator('#mailSendSample').click();assert.deepEqual(await page.evaluate(()=>actions),[{action:'sample'}]);await page.locator('#mailRefresh').click();await page.waitForFunction(()=>actions.length===2);
  await page.evaluate(()=>{mode='race';AdminEmailAnalytics.setDays(7);AdminEmailAnalytics.setDays(90);});await page.waitForTimeout(160);assert.equal(await page.locator('.mail-metrics dd').first().innerText(),'90','stale period response ignored');
  await page.evaluate(()=>{mode='normal';baseline.email.measured=12;baseline.email.unmeasured=0;baseline.email.opened=8;baseline.email.clicked=4;baseline.email.paid=1;baseline.email.revenue_cents=17820;baseline.choices=[{tier:'30d',users:2}];baseline.recent=[{kind:'offer_open',nome:'<img src=x onerror=window.xss=true>',tier:'30d',created_at:baseline.checked_at}];AdminEmailAnalytics.setDays(30);});await page.waitForFunction(()=>document.querySelector('.mail-metrics dd').nextElementSibling.textContent.includes('inviate')&&document.getElementById('mailTierChoices').textContent.includes('30 giorni'));
  assert.equal(await page.locator('.mail-metrics dd').nth(1).innerText(),'8');assert.equal(await page.locator('.mail-metrics dd').nth(4).innerText(),'178,20 €');assert.equal(await page.locator('#mailRecentEvents img').count(),0);assert.equal(await page.evaluate(()=>window.xss),undefined);
  await page.evaluate(()=>document.documentElement.classList.add('admin-dark'));assert.equal(await page.locator('#email-vetrine').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(21, 23, 26)');
  if(out)await page.screenshot({path:path.join(out,`${name}-${width}-scuro.png`),fullPage:true});
  await page.evaluate(()=>{mode='fail';AdminEmailAnalytics.setDays(7);});await page.waitForFunction(()=>document.getElementById('mailAnalyticsStatus').textContent.includes('non disponibili'));assert.equal(await page.locator('.mail-metrics dd').first().innerText(),'12','failure retains previous values');
  await page.evaluate(()=>{mode='race';AdminEmailAnalytics.setDays(7);currentUser=null;callbacks.forEach(fn=>fn('SIGNED_OUT',null));});await page.waitForTimeout(150);assert(await page.locator('#email-vetrine').isHidden());assert.equal(await page.locator('.mail-metrics dd').count(),0);assert.deepEqual(errors,[]);
  console.log(`PASS ${name} ${width}: unavailable vs zero, exact amounts, variants, own sample, period races, logout, safe names, light/dark, mobile overflow.`);
 }finally{await browser.close();}
}
async function journeyTests(){
 let current={id:uid},events=[],opened=[],sessionDelay=0,callbacks=[];const address=new URL('https://subingresso.it/dashboard?ve='+token+'&vf='+uid+'&vetrina=annullata'),history=[];
 const context={URL,URLSearchParams,AbortSignal,crypto:webcrypto,location:{href:address.href,origin:address.origin,assign:url=>history.push(url)},history:{state:null,replaceState:(_s,_t,url)=>history.push(url)},document:{readyState:'complete'},SUPABASE_URL:'https://backend.invalid',SUPABASE_ANON_KEY:'public',_supabase:{auth:{getSession:async()=>{await new Promise(r=>setTimeout(r,sessionDelay));return{data:{session:current?{user:current,access_token:'test'}:null}};},onAuthStateChange:fn=>callbacks.push(fn)}},VetrinaPremium:{open:async(...args)=>opened.push(args)},fetch:async(_url,opt)=>{const body=JSON.parse(opt.body);events.push(body);return{ok:true,json:async()=>({accepted:true,context:{listing_ids:[uid],tier:'10d',tracked:true}})};}};context.window=context;
 vm.runInNewContext(read('js/vetrina-journey.js'),context);assert.equal(history[0],'/dashboard?vetrina=annullata','tokens removed before page trackers');await context.VetrinaJourney.start(current);assert.equal(events[0].p_kind,'checkout_cancel');assert.equal(events[1].p_kind,'email_landing');assert.equal(opened[0][1].tier,'10d');assert.equal(opened[0][1].source,'email');
 sessionDelay=30;const pending=context.VetrinaJourney.record('checkout_attempt');current={id:token};callbacks.forEach(fn=>fn('SIGNED_IN',{user:current}));await pending;assert.equal(events.length,2,'account switch prevents stale request');current=null;callbacks.forEach(fn=>fn('SIGNED_OUT',null));assert.equal(await context.VetrinaJourney.record('offer_open'),null);
 console.log('PASS journey: URL tokens stripped, cancellation, exact offered tier, owned email context, account switch/logout guards; no persistent IDs.');
}
(async()=>{if(out)fs.mkdirSync(out,{recursive:true});if(!process.env.EMAIL_ANALYTICS_INSPECT){await apiTests();await journeyTests();}await new Promise(r=>server.listen(process.env.EMAIL_ANALYTICS_INSPECT?3024:0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;if(process.env.EMAIL_ANALYTICS_INSPECT){console.log(base+'/dashboard');return;}try{for(const [engine,name,w,h]of[[chromium,'Chrome',1440,1000],[chromium,'Chrome',768,1000],[chromium,'Chrome',320,700],[webkit,'Safari',390,844]])await browserTest(engine,name,w,h,base);}finally{server.close();}})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
