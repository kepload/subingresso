// Registration and marketing preference with fake users, network and email only.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),vm=require('node:vm'),assert=require('node:assert/strict');
const {stripTypeScriptTypes}=require('node:module');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const VERSION='vetrina-email-20261023';
async function backend(){
 const shared={};vm.runInNewContext(stripTypeScriptTypes(read('supabase/functions/_shared/input.ts')).replace(/export /g,''),shared);
 let handler,creates=[],profiles=[],existing=false;
 const client={auth:{admin:{async createUser(value){creates.push(value);return existing?{error:{message:'already registered'}}:{data:{user:{id:'fixture-account'}}};}}},from:()=>({async upsert(value){profiles.push(value);return {error:null};}})};
 vm.runInNewContext(stripTypeScriptTypes(read('supabase/functions/register-bypass/index.ts').replace(/^import .*;\r?\n/gm,'')),{...shared,validEmail:shared.email,createClient:()=>client,Deno:{env:{get:()=> 'fixture-key'},serve:f=>handler=f},Request,Response,fetch:async()=>new Response('{}'),console:{error(){}}});
 const base={email:'fixture@example.it',password:'fixture123',nome:'Ada',cognome:'Rossi',telefono:''};
 const call=patch=>handler(new Request('https://fixture.invalid/register',{method:'POST',body:JSON.stringify({...base,...patch})}));
 for(const value of [undefined,false,true]){creates=[];const r=await call({...(value===undefined?{}:{promotional_email_opt_in:value}),promotional_email_consent_version:VERSION});assert.equal(r.status,200);assert.equal(creates[0].user_metadata.promotional_email_opt_in,value===true);assert.equal(creates[0].user_metadata.promotional_email_consent_version,VERSION);}
 for(const patch of [{promotional_email_opt_in:'true'},{promotional_email_opt_in:1},{promotional_email_opt_in:null},{promotional_email_opt_in:true},{promotional_email_opt_in:true,promotional_email_consent_version:'old'}]){creates=[];assert.equal((await call(patch)).status,400);assert.equal(creates.length,0);}
 existing=true;const before=profiles.length;assert.equal((await call({promotional_email_opt_in:true,promotional_email_consent_version:VERSION})).status,409);assert.equal(profiles.length,before,'duplicate account never updates profile or consent');
 console.log('PASS backend: missing/false stay false, strict boolean and current version, existing account unchanged.');
}
const data=read('js/data.js'),validators=data.slice(data.indexOf('function italianPhoneDigits'),data.indexOf('// UX helper:'));
const fixture=`sessionStorage.setItem('_vp','1');const SUPABASE_URL='https://backend.test',SUPABASE_ANON_KEY='public-fixture';window.fixtureCalls=[];window.fixtureFallback=false;window.fixtureFail=false;window.fixtureSession=null;window.fixtureHold=false;window.fixtureResolve=null;
const chain=new Proxy({}, {get(_t,key){if(key==='then')return resolve=>Promise.resolve({data:null,count:0}).then(resolve);return ()=>chain;}});
const _supabase={from:()=>chain,rpc:async()=>({}),auth:{getSession:async()=>({data:{session:fixtureSession}}),getUser:async()=>({data:{user:fixtureSession?.user}}),onAuthStateChange:()=>({}),signInWithPassword:async()=>{if(fixtureFallback&&!fixtureSession)return{error:{message:'offline'}};fixtureSession={access_token:'fixture-token',user:{id:'fixture-account',email:'fixture@example.it'}};return{data:{session:fixtureSession}};},signUp:async value=>{fixtureCalls.push({kind:'fallback',value});fixtureSession={access_token:'fixture-token',user:{id:'fixture-account',email:value.email}};return{data:{session:fixtureSession}};}}};
window.fetch=async(url,options)=>{if(String(url).endsWith('/register-bypass')){fixtureCalls.push({kind:'bypass',value:JSON.parse(options.body)});if(fixtureHold)await new Promise(resolve=>fixtureResolve=resolve);return new Response(JSON.stringify(fixtureFail?{error:'Riprova tra poco.'}:{}),{status:fixtureFail?400:fixtureFallback?500:200});}return new Response('{}');};`;
function documentHtml(dark=false){return `<!doctype html><html lang="it"${dark?' class="admin-dark"':''}><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Registrazione Subingresso.it</title><link rel="stylesheet" href="/css/tailwind.css"><link rel="stylesheet" href="/css/design-system.css"><link rel="stylesheet" href="/css/admin-theme.css"></head><body style="background:#edf3fa"><script>${fixture}${validators}</script><script src="/js/auth.js"></script><script>addEventListener('DOMContentLoaded',()=>{openAuthModal('register');window._regFormStartedAt=Date.now()-10000;});</script></body></html>`;}
async function fill(page){for(const[id,value]of Object.entries({regNome:'Ada',regCognome:'Rossi',regEmail:'fixture@example.it',regPassword:'fixture123'}))await page.locator('#'+id).fill(value);}
async function main(){
 await backend();
 const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://localhost');if(url.pathname==='/fixture'){res.setHeader('Content-Type','text/html');res.end(documentHtml(url.searchParams.has('dark')));return;}const file=path.join(root,url.pathname);if(!file.startsWith(root)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'application/octet-stream');fs.createReadStream(file).pipe(res);});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 try{
  for(const[engine,label,width,height]of[[chromium,'Chromium',1440,900],[chromium,'Chromium',320,568],[webkit,'WebKit',390,844]]){
   const browser=await engine.launch({headless:true});try{const context=await browser.newContext({viewport:{width,height}}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base+'/fixture');const input=page.locator('#regPromoOptIn');assert.equal(await input.isChecked(),false);assert.equal(await input.getAttribute('required'),null);assert.equal(await input.getAttribute('aria-describedby'),'regPromoHint');assert.equal(await page.locator('#regPromoHint a').getAttribute('href'),'/privacy');
    await input.check();await page.evaluate(()=>closeAuthModal());await page.evaluate(()=>openAuthModal('register'));assert.equal(await input.isChecked(),false,'fresh modal never inherits a previous choice');
    for(const fallback of [false,true])for(const choice of [false,true]){
     await page.goto(base+'/fixture');await page.evaluate(v=>fixtureFallback=v,fallback);await fill(page);if(choice)await page.locator('label[for="regPromoOptIn"]').click();
     await page.locator('#registerBtn').scrollIntoViewIfNeeded();await page.locator('#registerBtn').click();await page.waitForFunction(()=>fixtureCalls.some(c=>c.kind===(fixtureFallback?'fallback':'bypass')));
     const result=await page.evaluate(()=>fixtureCalls);assert.equal(result[0].value.promotional_email_opt_in,choice);assert.equal(result[0].value.promotional_email_consent_version,VERSION);
     if(fallback){const meta=result.find(c=>c.kind==='fallback').value.options.data;assert.equal(meta.promotional_email_opt_in,choice);assert.equal(meta.promotional_email_consent_version,VERSION);}
    }
    await page.goto(base+'/fixture');await fill(page);await input.check();await page.evaluate(()=>{fixtureHold=true;fixtureFail=true;});await page.locator('#registerBtn').scrollIntoViewIfNeeded();await page.locator('#registerBtn').click();await page.waitForFunction(()=>typeof fixtureResolve==='function');assert.equal(await input.isDisabled(),true);await page.evaluate(()=>fixtureResolve());await page.locator('#authError:not(.hidden)').waitFor();assert.equal(await input.isChecked(),true);assert.equal(await input.isDisabled(),false);assert.equal(await page.locator('#registerBtn').isEnabled(),true);
    await page.goto(base+'/fixture'+(width===320?'?dark':''));await input.scrollIntoViewIfNeeded();assert(await input.isVisible());assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#registerBtn').scrollIntoViewIfNeeded();const rect=await page.locator('#registerBtn').boundingBox();assert(rect.y>=0&&rect.y+rect.height<=height,'CTA reachable at small height');
    if(process.env.SIGNUP_PROMO_QA_DIR){fs.mkdirSync(process.env.SIGNUP_PROMO_QA_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.SIGNUP_PROMO_QA_DIR,label+'-'+width+'-signup.png'),fullPage:true});}
    assert.deepEqual(errors,[]);await context.close();console.log(label+' '+width+': optional unchecked choice, label, reset, checked/unchecked bypass and fallback, busy/error retention, small-screen scroll passed.');
   }finally{await browser.close();}
  }
 }finally{await new Promise(resolve=>server.close(resolve));}
 console.log('PASS: no real accounts or emails created.');
}
if(require.main===module)main().catch(e=>{console.error(e);process.exitCode=1;});
module.exports={documentHtml};
