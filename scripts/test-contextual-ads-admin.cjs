'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright'),catalog=require('../lib/personal-ads.cjs'),handler=require('../lib/personal-ads-handler.cjs'),blog=require('../api/blog.js'),admin=require('../lib/contextual-ads-admin.cjs');
const root=path.resolve(__dirname,'..'),out=process.env.CONTEXTUAL_RULES_QA_DIR||path.join(root,'.taste-skill/contextual-rules');fs.mkdirSync(out,{recursive:true});
const uid='00000000-0000-4000-8000-000000000001',clickId='00000000-0000-4000-8000-000000000010',baseline={ads:catalog.ads,formats:catalog.formats,stats:{updated_at:new Date().toISOString(),rows:[]}};
const fixture=fs.readFileSync(path.join(__dirname,'test-personal-ads.cjs'),'utf8').match(/const fixtureScript=(`[^]*?`);/)[1],script=new Function('uid','clickId','baseline','return '+fixture)(uid,clickId,baseline);
const body=Array.from({length:10},(_,i)=>'<h2>Sezione '+i+'</h2><p>'+('Controlla il posteggio, i documenti e il prezzo prima di decidere. '.repeat(8))+'</p>').join('');
const posts=[{slug:'come-valutare-posteggio-prima-di-comprarlo',title:'Come valutare un posteggio prima di comprarlo'},{slug:'fiera-annullata-maltempo',title:'Fiera annullata per maltempo'},{slug:'quanto-vale-posteggio',title:'Quanto vale il mio posteggio?'}].map(p=>({...p,content:body,excerpt:p.title,category:'Guida',published_at:'2026-10-01',cover_image_url:null}));
let settings={ads:{},posts:{}},calls=[],saveCount=0,delay=0,unavailable=false;
const clone=value=>JSON.parse(JSON.stringify(value));
global.fetch=async(raw,options={})=>{
 const u=new URL(raw),args=options.body?JSON.parse(options.body):{},name=u.pathname.split('/').at(-1);calls.push({name,method:options.method||'GET'});
 if(delay)await new Promise(r=>setTimeout(r,delay));
 if(name==='contextual_ad_rules')return new Response(JSON.stringify(unavailable?{}:clone(settings)),{status:unavailable?503:200});
 if(name==='admin_contextual_ad_rules')return new Response(JSON.stringify(options.headers.Authorization==='Bearer '+uid?clone(settings):{code:'42501'}),{status:options.headers.Authorization==='Bearer '+uid?200:403});
 if(name==='admin_save_contextual_ad_rule'){
  if(options.headers.Authorization!=='Bearer '+uid)return new Response('{"code":"42501"}',{status:403});
  if(!admin.validRule(args.p_scope,args.p_key,args.p_rule,args.p_revision))return new Response('{"code":"22023"}',{status:400});
  const group=args.p_scope==='ad'?settings.ads:settings.posts,previous=group[args.p_key];if((previous?.revision||0)!==args.p_revision)return new Response('{"code":"40001"}',{status:409});
  const saved={rule:clone(args.p_rule),revision:args.p_revision+1};group[args.p_key]=saved;saveCount++;return new Response(JSON.stringify(saved));
 }
 if(name==='blog_posts'){const slug=u.searchParams.get('slug')?.replace(/^eq\./,''),rows=slug?posts.filter(p=>p.slug===slug):posts,cols=u.searchParams.get('select')?.split(',');return new Response(JSON.stringify(cols?rows.map(p=>Object.fromEntries(cols.map(k=>[k,p[k]]))):rows));}
 throw Error('Unexpected service '+name);
};
async function api(query,body,token=uid,method=body?'POST':'GET'){
 const result={code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(v){this.body=v;return this;},end(){return this;}};
 await handler({query,body,method,headers:token?{authorization:'Bearer '+token}:{}},result);return result;
}
async function apiTests(){
 let r=await api({action:'context-options'},undefined,null);assert.equal(r.code,401);assert.equal(calls.length,0);
 r=await api({action:'context-options'},undefined,'not-admin');assert.equal(r.code,403);assert(!r.body.settings);
 r=await api({action:'context-options'});assert.equal(r.code,200);assert.equal(r.body.posts.length,3);assert.match(r.headers['Cache-Control'],/no-store/);
 const q={action:'context-preview',post:posts[0].slug,slot:'inline',format:'300x250'};
 r=await api(q);assert.deepEqual(r.body.context.topics,['acquisto']);assert(r.body.selected.startsWith('compra-'));assert(r.body.rows.some(row=>row.id==='vendi-01'&&!row.eligible));assert(!r.body.context.fields);
 const manual={topics:['fiere'],excludedAds:['fiere-01']};r=await api(q,{rule:manual,revision:0});assert.equal(r.code,200);assert.deepEqual(r.body.context.topics,['fiere']);assert(!r.body.rows.find(row=>row.id==='fiere-01').eligible);assert.equal(saveCount,0);
 r=await api({action:'context-save'},{scope:'post',key:posts[0].slug,rule:manual,revision:0});assert.equal(r.code,200);assert.equal(saveCount,1);
 r=await api(q);assert.deepEqual(r.body.context.topics,['fiere']);
 r=await api({action:'context-save'},{scope:'post',key:posts[0].slug,rule:{topics:null,excludedAds:[]},revision:0});assert.equal(r.code,409);
 r=await api({action:'context-save'},{scope:'ad',key:'fiere-01',rule:{priorityKeywords:['x'],excludedKeywords:[]},revision:0});assert.equal(r.code,400);
 r=await api({action:'context-save'},{scope:'ad',key:'fiere-01',rule:{priorityKeywords:[],excludedKeywords:[],kind:'paid'},revision:0});assert.equal(r.code,400);
 r=await api({...q,format:'1080x1920'});assert.equal(r.code,400);r=await api(q,undefined,uid,'DELETE');assert.equal(r.code,405);
 settings={ads:{},posts:{}};saveCount=0;
}
function fixtureHtml(html){return html.replace('<script src="/js/admin-theme.js?v=7"></script>','').replace(/<script src="https:\/\/cdn\.jsdelivr[^>]+><\/script>/,'<script>'+script+'</script>').replace(/<script src="\/?js\/(supabase-config|data|auth)\.js[^>]*><\/script>/g,'');}
function responseAdapter(res){res.status=n=>{res.statusCode=n;return res;};res.json=v=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(v));return res;};res.send=v=>{res.setHeader('Content-Type','text/html');res.end(v);return res;};return res;}
const server=http.createServer(async(req,res)=>{try{
 const u=new URL(req.url,'http://local');if(u.pathname==='/qa'||u.pathname==='/inspect'){if(u.searchParams.has('reset')){settings={ads:{},posts:{}};saveCount=0;}res.setHeader('Content-Type','text/html');let html=fixtureHtml(fs.readFileSync(path.join(root,'le-mie-ads.html'),'utf8'));if(u.pathname==='/inspect')html=html.replace('</body>','<script>window.addEventListener("personal-ads:ready",()=>{document.getElementById("paContextPanel").open=true;const select=document.getElementById("paContextPost"),observer=new MutationObserver(()=>{if(select.options.length>1){observer.disconnect();select.selectedIndex=1;select.dispatchEvent(new Event("change"));}});observer.observe(select,{childList:true});},{once:true});</script></body>');return res.end(html);}
 if(u.pathname==='/api/personal-ads'||u.pathname==='/api/blog'||u.pathname==='/blog'){
  req.query=Object.fromEntries(u.searchParams);if(req.method==='POST'){let chunks='';for await(const chunk of req){chunks+=chunk;if(chunks.length>16000)throw Error('Request too large');}req.body=JSON.parse(chunks||'{}');}
  return u.pathname==='/api/personal-ads'?await handler(req,responseAdapter(res)):await blog(req,responseAdapter(res));
 }
 const file=path.resolve(root,'.'+decodeURIComponent(u.pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;return res.end();}res.setHeader('Content-Type',({'.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml','.woff':'font/woff','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
 }catch(e){res.statusCode=500;res.end(e.message);}});
async function browserTests(base){
 const results=[];
 for(const [type,name,width]of [[chromium,'Chromium',1440],[chromium,'Chromium',768],[chromium,'Chromium',320],[webkit,'WebKit',390]]){
  const b=await type.launch({headless:true});try{const context=await b.newContext({viewport:{width,height:1000},reducedMotion:'reduce'}),p=await context.newPage(),errors=[];
   await context.route('https://**/*',r=>r.abort());p.on('pageerror',e=>errors.push(e.message));await p.goto(base+'/qa?reset=1');await p.evaluate(()=>history.replaceState(null,'','/qa'));await p.locator('#paApp').waitFor({state:'visible'});
   await p.locator('#paContextPanel>summary').click();await p.waitForFunction(()=>document.getElementById('paContextPost').options.length===4);await p.locator('#paContextPost').selectOption(posts[0].slug);
   await p.waitForFunction(()=>document.getElementById('paContextFinding').textContent.includes('Acquisto'));assert((await p.locator('#paContextChosen').textContent()).includes('compra-'));
   await p.locator('#paContextFormat').selectOption('300x250');await p.waitForFunction(()=>document.querySelector('#paContextPreview img')?.getAttribute('width')==='300');assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   const stale=width===1440?await(await p.request.get(base+'/blog?post='+posts[0].slug)).text():null;
   await p.locator('#paContextTopic').selectOption('fiere');await p.waitForFunction(()=>document.getElementById('paContextStatus').textContent.startsWith('Anteprima della correzione'));assert.equal(saveCount,0);assert((await p.locator('#paContextChosen').textContent()).includes('fiere-'));
   await p.locator('#paContextFormat').selectOption('336x280');await p.waitForFunction(()=>document.querySelector('#paContextPreview img')?.getAttribute('width')==='336');assert.equal(await p.locator('#paContextTopic').inputValue(),'fiere');assert.equal(saveCount,0,'changing format preserves draft without saving');
   await p.locator('#paContextSavePost').click();await p.waitForFunction(()=>document.getElementById('paContextStatus').textContent.startsWith('Correzione salvata'));assert.equal(saveCount,1);
   const publicRules=await(await p.request.get(base+'/api/blog?contextual_rules=1')).json();assert.deepEqual(publicRules.posts[posts[0].slug].rule.topics,['fiere']);
   if(stale){const publicPage=await context.newPage(),publicErrors=[];publicPage.on('pageerror',e=>publicErrors.push(e.message));await publicPage.route(base+'/blog?post='+posts[0].slug,r=>r.fulfill({contentType:'text/html',body:fixtureHtml(stale)}));await publicPage.goto(base+'/blog?post='+posts[0].slug);await publicPage.waitForFunction(()=>[...document.querySelectorAll('[data-contextual-ad-slot]')].length>0&&[...document.querySelectorAll('[data-contextual-ad-slot]')].every(el=>el.dataset.adId.startsWith('fiere-')));assert.deepEqual(publicErrors,[]);await publicPage.close();}
   await p.reload();await p.locator('#paApp').waitFor({state:'visible'});await p.locator('#paContextPanel>summary').click();await p.waitForFunction(()=>document.getElementById('paContextPost').options.length===4);await p.locator('#paContextPost').selectOption(posts[0].slug);await p.waitForFunction(()=>document.getElementById('paContextBasis').textContent==='Correzione manuale');assert.equal(await p.locator('#paContextTopic').inputValue(),'fiere');
   await p.locator('#paContextAdPanel>summary').click();await p.locator('#paContextAd').selectOption('fiere-03');await p.locator('#paContextPriority').fill('Anzianità, graduatoria');await p.locator('#paContextExcluded').fill('maltempo');await p.locator('#paContextSaveAd').click();await p.waitForFunction(()=>document.getElementById('paContextStatus').textContent.startsWith('Parole ADS salvate'));assert.deepEqual(settings.ads['fiere-03'].rule.priorityKeywords,['anzianita','graduatoria']);
   settings.ads['fiere-03'].revision++;await p.locator('#paContextPriority').fill('spunta');await p.locator('#paContextSaveAd').click();await p.waitForFunction(()=>document.getElementById('paContextStatus').textContent.includes('altro accesso'));assert.deepEqual(settings.ads['fiere-03'].rule.priorityKeywords,['anzianita','graduatoria']);
   await p.locator('#paContextReloadAd').click();await p.waitForFunction(()=>document.getElementById('paContextStatus').textContent==='Parole salvate ricaricate.');assert((await p.locator('#paContextPriority').inputValue()).includes('anzianita'));
   await p.locator('#paContextAdPanel>summary').click();await p.locator('#paContextResult details>summary').click();await p.screenshot({path:path.join(out,`${name}-${width}-matching.png`),fullPage:false});await p.evaluate(()=>document.documentElement.classList.add('admin-dark'));await p.screenshot({path:path.join(out,`${name}-${width}-dark.png`),fullPage:false});await p.evaluate(()=>document.documentElement.classList.remove('admin-dark'));
   await p.locator('#paContextResetPost').click();await p.waitForFunction(()=>document.getElementById('paContextStatus').textContent.startsWith('Correzione salvata'));assert.equal(settings.posts[posts[0].slug].rule.topics,null);
   delay=200;await p.locator('#paContextRefresh').click();await p.evaluate(()=>{qaUser=null;qaCallbacks.forEach(fn=>fn('SIGNED_OUT',null));});await p.locator('#paApp').waitFor({state:'hidden'});await p.waitForTimeout(350);delay=0;assert.equal(await p.locator('#paContextRows tr').count(),0);assert.equal(await p.locator('#paContextPriority').inputValue(),'');assert.equal(await p.locator('#paContextPreview img').count(),0);assert.deepEqual(errors,[]);
   results.push({name,width,preview:true,review_before_save:true,persistent:true,normalized_keywords:true,conflict:true,reset:true,logout_race:true,errors});await context.close();
  }finally{await b.close();}
 }
 return results;
}
(async()=>{await apiTests();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;if(process.argv.includes('--serve')){console.log(base+'/qa');return;}try{const results=await browserTests(base);fs.writeFileSync(path.join(out,'admin-browser.json'),JSON.stringify({api:true,results},null,2));console.log(JSON.stringify({api:true,results}));}finally{server.close();}})().catch(e=>{console.error(e.stack);server.close();process.exitCode=1;});
