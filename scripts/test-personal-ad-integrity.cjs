'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),handler=require('../lib/personal-ads-handler.cjs');
process.env.PERSONAL_ADS_EVENT_KEY='fixture-only-key-'.repeat(5);
const metadata={article_slug:'integrity-fixture',creative_version:6,source:'blog',visible_ms:1500,page_ms:3000,device_class:'phone'};
const events=new Map(),requests=[];
const originalFetch=global.fetch;
global.fetch=async(url,options)=>{
 if(!String(url).endsWith('/personal_ad_event_v3'))return originalFetch(url,options);
 const signed=JSON.parse(options.body);assert.equal(signed.p_signature,crypto.createHmac('sha256',process.env.PERSONAL_ADS_EVENT_KEY).update('event:'+signed.p_payload).digest('hex'));
 const data=JSON.parse(signed.p_payload),key=[data.ad,data.format,data.placement,data.kind,data.session,data.context.article_slug,data.context.creative_version].join('|');
 if(data.kind==='click')assert([...events.values()].some(e=>e.id===data.impression&&e.kind==='impression'&&e.session===data.session));
 const id=events.get(key)?.id||crypto.randomUUID();events.set(key,{...data,id});
 return new Response(JSON.stringify(id));
};
async function invoke(q,method='GET',headers={},body){
 const response={code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(v){this.body=v;return this;},end(){return this;}};
 await handler({query:q,method,headers,body},response);return response;
}
const origin={origin:'https://subingresso.it','sec-fetch-site':'same-origin','user-agent':'Mozilla/5.0 Chrome/149.0 Safari/537.36'};
async function apiTests(){
 const data={ad:'fiere-01',format:'300x250',placement:'qa_api',sid:'api-integrity-session',ctx:JSON.stringify(metadata)};
 for(let n=0;n<80;n++){const r=await invoke({...data,action:'click'});assert.equal(r.code,303);assert(!new URL(r.headers.Location).searchParams.has('pa'));}assert.equal(events.size,0,'GET burst must not write');
 assert.equal((await invoke({action:'impression'},'GET')).code,405);
 assert.equal((await invoke({action:'impression'},'POST',origin,{...data,ctx:JSON.stringify({...metadata,visible_ms:900})})).code,204);
 assert.equal((await invoke({action:'impression'},'POST',{...origin,origin:'https://external.invalid'},data)).code,204);
 const impression=await invoke({action:'impression'},'POST',origin,data);assert.equal(impression.code,200);assert(impression.body.ticket);assert.equal(events.size,1);
 for(const change of [{ticket:'forged'}, {ticket:impression.body.ticket,sid:'different-session'}, {ticket:impression.body.ticket,ad:'fiere-02'}, {ticket:impression.body.ticket,ctx:JSON.stringify({...metadata,creative_version:7})}]){const r=await invoke({action:'click'},'POST',origin,{...data,...change});assert(!new URL(r.headers.Location).searchParams.has('pa'));}assert.equal(events.size,1);
 for(const headers of [{...origin,'user-agent':'Googlebot'}, {...origin,purpose:'prefetch'}, {...origin,cookie:'si_internal_analytics=1'}, {...origin,origin:'https://external.invalid'}]){await invoke({action:'click'},'POST',headers,{...data,ticket:impression.body.ticket});}assert.equal(events.size,1);
 const click=await invoke({action:'click'},'POST',origin,{...data,ticket:impression.body.ticket});assert(new URL(click.headers.Location).searchParams.has('pa'));assert.equal(events.size,2);
 const repeat=await invoke({action:'click'},'POST',origin,{...data,ticket:impression.body.ticket});assert.equal(repeat.headers.Location,click.headers.Location);assert.equal(events.size,2);
 const tampered=impression.body.ticket.slice(0,-1)+(impression.body.ticket.endsWith('0')?'1':'0');await invoke({action:'click'},'POST',origin,{...data,ticket:tampered});assert.equal(events.size,2);
 // A signing-key outage keeps the public destination available and creates no event.
 const saved=process.env.PERSONAL_ADS_EVENT_KEY;delete process.env.PERSONAL_ADS_EVENT_KEY;
 const fallback=await invoke({action:'click'},'POST',origin,{...data,ticket:impression.body.ticket});assert.equal(fallback.code,303);assert(!new URL(fallback.headers.Location).searchParams.has('pa'));process.env.PERSONAL_ADS_EVENT_KEY=saved;
 events.clear();
}
function fixture(query){const automated=query.get('automated')==='1',admin=query.get('admin')==='1';return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:20px;font:16px Arial}a{display:block;width:280px;height:250px;background:#1656cc;color:white}img{width:280px;height:250px}</style></head><body><script>
 ${automated?'':"Object.defineProperty(navigator,'webdriver',{get:()=>false});"}
 sessionStorage.setItem('_session_id',sessionStorage.getItem('_session_id')||'browser-'+crypto.randomUUID());
 window.callbacks=[];window.qaAdmin=${admin};window._supabase={auth:{getSession:async()=>({data:{session:qaAdmin?{user:{id:'00000000-0000-4000-8000-000000000001'},access_token:'fixture-user'}:null}}),getUser:async()=>({data:{user:{id:'00000000-0000-4000-8000-000000000001'}}}),onAuthStateChange:fn=>callbacks.push(fn)},from:()=>({select:()=>({eq:()=>({single:async()=>({data:{is_admin:qaAdmin,is_demo:false}})})})}),rpc:async()=>({data:false})};
 </script><a id="ad" href="/api/personal-ads?action=click&ad=fiere-01&format=300x250&placement=qa_browser" data-personal-ad="fiere-01" data-pa-format="300x250" data-pa-placement="qa_browser" data-pa-context='{"article_slug":"integrity-fixture","creative_version":6,"source":"blog"}'><img alt="Fiera" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='250'%3E%3C/svg%3E"></a><script src="/js/personal-ads-tracker.js?v=5"></script></body></html>`;}
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://fixture');
 if(url.pathname==='/destination'){res.setHeader('Content-Type','text/html');return res.end('<!doctype html><title>Destinazione</title><p>Fiere</p>');}
 if(url.pathname==='/blog'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(fixture(url.searchParams));}
 if(url.pathname==='/js/personal-ads-tracker.js'){res.setHeader('Content-Type','text/javascript');return res.end(fs.readFileSync(process.env.PERSONAL_ADS_TRACKER_PATH||path.join(root,url.pathname)));}
 if(url.pathname==='/api/personal-ads'){
  let body='';for await(const chunk of req)body+=chunk;
  requests.push({action:url.searchParams.get('action'),method:req.method,body});
  const headers={...req.headers,...(req.headers.origin?{origin:'https://subingresso.it'}:{})};
  const r=await invoke(Object.fromEntries(url.searchParams),req.method,headers,body||undefined);
  for(const [k,v]of Object.entries(r.headers))res.setHeader(k,k==='Location'?'/destination'+new URL(v).search:v);res.statusCode=r.code;
  if(r.body){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(r.body));}else res.end();return;
 }
 res.statusCode=404;res.end();
});
async function browserTest(engine,name,width,base){
 const browser=await engine.launch();try{
  const context=await browser.newContext({viewport:{width,height:850},userAgent:name==='WebKit'?'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/146.0.0.0 Safari/537.36'});await context.route('https://**/*',r=>r.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url=base+'/blog?post=integrity-fixture';
  async function ready(){const incoming=page.waitForResponse(r=>r.url().includes('action=impression'),{timeout:6000});await page.goto(url);const response=await incoming;assert.equal(response.status(),200,JSON.stringify(requests.at(-1)));await page.waitForTimeout(50);}
  await ready();
  const clickRequests=()=>requests.filter(r=>r.action==='click'&&r.method==='POST').length;
  let before=clickRequests();
  await page.evaluate(()=>{const a=document.getElementById('ad');a.addEventListener('click',e=>e.preventDefault(),{once:true});a.click();});await page.waitForTimeout(150);assert.equal(clickRequests(),before,'synthetic click');
  await page.locator('#ad').focus();await page.waitForTimeout(50);assert.equal(clickRequests(),before,'focus alone');
  await Promise.all([page.waitForURL(base+'/destination?**'),page.locator('#ad').click()]);assert(new URL(page.url()).searchParams.has('pa'),JSON.stringify(requests.slice(-2)));assert.equal(clickRequests(),before+1,'trusted mouse click');
  await ready();before=clickRequests();
  const popupEvent=page.waitForEvent('popup');await page.locator('#ad').click({button:'middle'});const popup=await popupEvent;await popup.waitForURL(base+'/destination?**');assert(new URL(popup.url()).searchParams.has('pa'));assert.equal(clickRequests(),before+1,'middle click');assert(page.url().startsWith(base));await popup.close();
  await ready();before=clickRequests();await page.locator('#ad').focus();await Promise.all([page.waitForURL(base+'/destination?**'),page.keyboard.press('Enter')]);assert(new URL(page.url()).searchParams.has('pa'));assert.equal(clickRequests(),before+1,'keyboard');
  await page.goto(url+'&admin=1');before=requests.filter(r=>r.action==='impression').length;await page.waitForTimeout(1400);assert.equal(requests.filter(r=>r.action==='impression').length,before,'admin excluded');
  await page.goto(url+'&automated=1');before=requests.filter(r=>r.action==='impression').length;await page.waitForTimeout(1400);assert.equal(requests.filter(r=>r.action==='impression').length,before,'webdriver excluded');
  await ready();before=clickRequests();await page.evaluate(()=>callbacks.forEach(fn=>fn('SIGNED_OUT',null)));await page.evaluate(()=>{document.getElementById('ad').addEventListener('click',e=>e.preventDefault(),{once:true});document.getElementById('ad').click();});assert.equal(clickRequests(),before,'logout invalidates receipt');
  assert.deepEqual(errors,[]);return {engine:name,width,mouse:true,middle:true,keyboard:true,synthetic:false,admin_excluded:true,webdriver_excluded:true};
 }finally{await browser.close();}
}
(async()=>{try{
 await apiTests();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port,results=[];
 for(const [engine,name,width]of [[chromium,'Chromium',1440],[chromium,'Chromium',320],[webkit,'WebKit',390]])results.push(await browserTest(engine,name,width,base));
 const result={passed:true,api:true,browsers:results,real_event_writes:0};console.log(JSON.stringify(result));if(process.env.PERSONAL_AD_INTEGRITY_QA_DIR)fs.writeFileSync(path.join(process.env.PERSONAL_AD_INTEGRITY_QA_DIR,'integrity-browser.json'),JSON.stringify(result,null,2));
 }finally{server.close();global.fetch=originalFetch;}})().catch(e=>{console.error(e.stack);process.exitCode=1;});
