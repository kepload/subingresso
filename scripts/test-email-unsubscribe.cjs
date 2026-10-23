// Backend and browser flows with simulated users, tokens and writes only.
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
let writes=[],feedbackFail=false,feedbackThrow=false,reminderFail=false,handler;
const client={from(table){return {
 update(value){this.value=value;this.operation='update';return this;},delete(){this.operation='delete';return this;},eq(key,value){this.token=value;return this;},
 async select(){if(this.token!=='valid-token')return {data:[],error:null};writes.push({table,operation:this.operation,value:this.value,token:this.token});return {data:table==='profiles'?[{id:'fixture-user'}]:[{id:'fixture-subscription',regione:'Lombardia'}],error:null};},
 async insert(value){if(feedbackThrow)throw Error('offline');if(feedbackFail)return {error:{message:'offline'}};writes.push({table,value});return {error:null};}
 };},async rpc(name,args){writes.push({rpc:name,args});return {data:name==='stop_vetrina_offers'?args.p_token==='valid-token':null,error:reminderFail?{message:'offline'}:null};}};
const code=fs.readFileSync(path.join(root,'supabase/functions/email-unsubscribe/index.ts'),'utf8').replace(/^import \{ createClient \} from [^\n]+\n/m,'');
new vm.Script(stripTypeScriptTypes(code)).runInNewContext({Deno:{env:{get:()=>''},serve:fn=>{handler=fn;}},createClient:()=>client,Request,Response,Set,console:{warn(){},error(){}}});
async function call(body,method='POST'){return handler(new Request('https://fixture.test/unsubscribe',{method,headers:{'Content-Type':'application/json'},...(method==='POST'?{body:JSON.stringify(body)}:{})}));}
(async()=>{
 const preflight=await call(null,'OPTIONS');assert.equal(preflight.status,200);assert(preflight.headers.get('Access-Control-Allow-Headers').includes('apikey'));
 assert.equal((await call(null,'GET')).status,405);assert.deepEqual(writes,[]);
 assert.equal((await call({type:'digest'})).status,400);assert.deepEqual(writes,[]);
 for(const type of ['digest','stats','all','bando_alert','promo']){
  writes=[];const r=await call({token:'valid-token',type,reason:'too_many'});assert.equal(r.status,200);const data=await r.json();assert.equal(data.ok,true);assert.equal(data.feedback_saved,true);
  const row=writes.find(w=>w.table==='email_unsubscribe_feedback');assert.deepEqual(JSON.parse(JSON.stringify(row.value)),{email_type:type,reason:'too_many'});assert.equal(Object.keys(row.value).length,2);
  if(type==='digest')assert.deepEqual(JSON.parse(JSON.stringify(writes[0].value)),{email_digest:false});
  if(type==='stats')assert.deepEqual(JSON.parse(JSON.stringify(writes[0].value)),{email_stats:false});
  if(type==='all')assert(writes.some(w=>w.rpc==='stop_fair_reminders'));
  if(type==='bando_alert')assert.equal(writes[0].operation,'delete');
  if(type==='promo'){assert.equal(writes[0].rpc,'stop_vetrina_offers');assert(!writes.some(w=>w.table==='profiles'),'promo opt-out preserves weekly preferences');}
 }
 for(const reason of [undefined,'',{},'invalid','<script>']){writes=[];const data=await (await call({token:'valid-token',type:'digest',reason})).json();assert(data.ok);assert(!writes.some(w=>w.table==='email_unsubscribe_feedback'));}
 for(const flag of ['feedbackFail','feedbackThrow']){feedbackFail=flag==='feedbackFail';feedbackThrow=flag==='feedbackThrow';const data=await (await call({token:'valid-token',type:'stats',reason:'other'})).json();assert.equal(data.ok,true);assert.equal(data.feedback_saved,false);}feedbackFail=feedbackThrow=false;
 writes=[];assert.equal((await call({token:'invalid-token',type:'all',reason:'other'})).status,404);assert.deepEqual(writes,[]);
 reminderFail=true;assert.equal((await call({token:'valid-token',type:'all',reason:'other'})).status,503);assert(!writes.some(w=>w.table==='email_unsubscribe_feedback'));reminderFail=false;
 for(const [engine,label,width,height] of [[chromium,'Chromium',1440,900],[chromium,'Chromium',320,568],[webkit,'WebKit',390,844]]){
  const browser=await engine.launch({headless:true});try{
   const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage(),requests=[],errors=[];let fail=false,hold=false;
   await context.route('https://subingresso.it/**',route=>{const u=new URL(route.request().url()),file=path.join(root,u.pathname==='/unsubscribe'?'unsubscribe.html':u.pathname);return fs.existsSync(file)&&fs.statSync(file).isFile()?route.fulfill({path:file,contentType:file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':undefined}):route.fulfill({status:404,body:''});});
   await context.route('https://*.supabase.co/**',async route=>{if(!route.request().url().includes('/email-unsubscribe'))return route.fulfill({json:[]});requests.push(route.request().postDataJSON());if(hold)await new Promise(resolve=>setTimeout(resolve,250));return route.fulfill({status:fail?503:200,json:fail?{ok:false,error:'Riprova tra poco.'}:{ok:true,feedback_saved:!!requests.at(-1).reason}});});
   page.on('pageerror',e=>errors.push(e.message));
   const url='https://subingresso.it/unsubscribe?t=fixture-token&type=digest';
   await page.goto(url);assert.equal(requests.length,0,'opening an email link does not unsubscribe');assert(await page.locator('#unsubscribeForm').isVisible());assert.equal(await page.locator('#unsubscribeReason').getAttribute('required'),null);
   assert.match(await page.locator('#unsubscribeDescription').innerText(),/riepilogo settimanale/);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   if(process.env.UNSUBSCRIBE_QA_DIR){fs.mkdirSync(process.env.UNSUBSCRIBE_QA_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.UNSUBSCRIBE_QA_DIR,label+'-'+width+'-form.png'),fullPage:true});}
   await page.locator('#unsubscribeSubmit').click();await page.locator('#success').waitFor({state:'visible'});assert.equal(requests.length,1);assert.equal(requests[0].reason,undefined,'reason is optional');assert.equal(await page.locator('#unsubscribeFeedbackThanks').isVisible(),false);
   await page.goto(url);await page.locator('#unsubscribeReason').selectOption('not_relevant');fail=true;await page.locator('#unsubscribeSubmit').click();await page.locator('#unsubscribeSubmitError').waitFor({state:'visible'});assert(await page.locator('#unsubscribeForm').isVisible());assert.equal(await page.locator('#unsubscribeReason').inputValue(),'not_relevant');assert.equal(await page.locator('#unsubscribeSubmit').isEnabled(),true);
   fail=false;hold=true;const before=requests.length;await page.locator('#unsubscribeForm').evaluate(form=>{form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));form.dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));});await page.locator('#success').waitFor({state:'visible'});assert.equal(requests.length,before+1,'double click sends one request');assert.equal(requests.at(-1).reason,'not_relevant');assert(await page.locator('#unsubscribeFeedbackThanks').isVisible());hold=false;
   await page.goto(url);const beforeCancel=requests.length;await page.locator('#unsubscribeCancel').click();assert.equal(requests.length,beforeCancel,'keeping emails does not send any unsubscribe request');
   await page.goto('https://subingresso.it/unsubscribe');assert(await page.locator('#error').isVisible());assert.equal(requests.length,beforeCancel);assert.deepEqual(errors,[]);
   await page.goto('https://subingresso.it/unsubscribe?t=fixture-token&type=promo');assert.match(await page.locator('#unsubscribeDescription').innerText(),/offerte per le Vetrine/);await page.locator('#unsubscribeSubmit').click();await page.locator('#success').waitFor({state:'visible'});assert.match(await page.locator('#successMsg').innerText(),/avvisi.*restano attivi/);assert.equal(await page.locator('#unsubscribeReactivate').isVisible(),false);assert.equal(requests.at(-1).type,'promo');
   // Unsubscribe must also work without newer optional browser APIs.
   await page.addInitScript(()=>{Object.hasOwn=undefined;window.AbortController=undefined;});
   await page.goto(url);await page.locator('#unsubscribeSubmit').click();await page.locator('#success').waitFor({state:'visible'});assert.deepEqual(errors,[]);
   await context.close();console.log(label+' '+width+': optional reason, confirmation, cancel, retry, double click and invalid links passed; no SDK error.');
  }finally{await browser.close();}
 }
 console.log('PASS: email scopes, direct API compatibility, CORS preflight, categorical feedback only, failure isolation and browser confirmation. No real accounts, emails or subscriptions modified.');
})().catch(e=>{console.error(e);process.exitCode=1;});
