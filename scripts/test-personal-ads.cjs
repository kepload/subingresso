'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),catalog=require('../lib/personal-ads.cjs'),handler=require('../api/personal-ads.js');
const out=process.env.PERSONAL_ADS_TEST_OUT||path.join(root,'.taste-skill/personal-ads-qa');fs.mkdirSync(out,{recursive:true});
const uid='00000000-0000-4000-8000-000000000001',clickId='00000000-0000-4000-8000-000000000010';
const baseline={ads:catalog.ads,formats:catalog.formats,stats:{updated_at:'2026-10-24T17:30:00Z',started_at:null,rows:[]}};
async function apiTests(){
 const original=global.fetch,calls=[];let mode='normal';
 global.fetch=async(url,options)=>{calls.push({url,args:JSON.parse(options.body),auth:options.headers.Authorization});if(mode==='network')throw Error('offline');if(mode==='denied')return new Response(JSON.stringify({code:'42501'}),{status:403});return new Response(JSON.stringify(url.endsWith('admin_personal_ads')?baseline.stats:clickId));};
 async function run(query={},headers={},method='GET'){const result={code:200,headers:{},setHeader(k,v){this.headers[k]=v;},status(c){this.code=c;return this;},json(body){this.body=body;return this;},end(){return this;}};await handler({query,headers,method},result);return result;}
 try{
  let r=await run();assert.equal(r.code,401);assert(!r.body.ads);assert.equal(calls.length,0);
  mode='denied';r=await run({},{authorization:'Bearer user-token'});assert.equal(r.code,403);assert(!r.body.ads);
  mode='normal';r=await run({days:'90'},{authorization:'Bearer admin-token'});assert.equal(r.code,200);assert.equal(r.body.ads.length,20);assert.equal(r.body.formats.length,8);assert.equal(calls.at(-1).args.p_days,90);assert.equal(r.headers['Cache-Control'],'private, no-store');
  r=await run({action:'click',ad:'bad',format:'300x250'});assert.equal(r.code,404);
  const q={action:'click',ad:'fiere-01',format:'300x250',placement:'articolo_centro',region:'Lombardia',sid:'synthetic-session'};
  r=await run(q);let location=new URL(r.headers.Location);assert.equal(r.code,303);assert.equal(location.pathname,'/fiere');assert.equal(location.searchParams.get('regione'),'Lombardia');assert.equal(location.searchParams.get('pa'),clickId);assert.equal(calls.at(-1).args.p_session,'synthetic-session');
  const count=calls.length;for(const [query,headers,method]of [[{...q,preview:'1'},{},'GET'],[q,{'user-agent':'Googlebot'},'GET'],[q,{purpose:'prefetch'},'GET'],[q,{},'HEAD']]){r=await run(query,headers,method);assert(!new URL(r.headers.Location).searchParams.has('pa'));}assert.equal(calls.length,count);
  mode='network';r=await run({...q,region:'https://evil.invalid',destination:'https://evil.invalid'});location=new URL(r.headers.Location);assert.equal(location.origin,'https://subingresso.it');assert.equal(location.pathname,'/fiere');assert(!location.searchParams.has('regione'));assert(!location.searchParams.has('pa'));assert.equal(r.code,303);
 }finally{global.fetch=original;}
}
const fixtureScript=`window.qaMode='normal';window.qaUser={id:'${uid}'};window.qaCallbacks=[];window.qaClipboard='';window.qaClaims=[];window.qaImpressions=[];window.qaBaseline=${JSON.stringify(baseline)};window.qaDelay=0;window.qaAdmin=false;
Object.defineProperty(navigator,'clipboard',{value:{writeText:async value=>{window.qaClipboard=value;}}});
window._supabase={auth:{getUser:async()=>({data:{user:window.qaUser}}),getSession:async()=>({data:{session:window.qaUser?{user:window.qaUser,access_token:window.qaUser.id}:null}}),onAuthStateChange:fn=>{window.qaCallbacks.push(fn);return{data:{subscription:{unsubscribe(){}}}};}},from:()=>({select:()=>({eq:()=>({single:async()=>({data:{is_admin:window.qaAdmin,is_demo:false}})})})}),rpc:async(name,args)=>{if(name==='personal_ad_claim')qaClaims.push(args);else qaImpressions.push(args);return{data:name==='personal_ad_claim'?true:'${clickId}'}}};
const qaFetch=window.fetch.bind(window);window.fetch=async(url,options)=>{if(String(url).startsWith('/api/personal-ads?days=')){const wait=window.qaDelay,result=structuredClone(window.qaBaseline),mode=window.qaMode;await new Promise(r=>setTimeout(r,wait));return{ok:mode==='normal',status:mode==='denied'?403:mode==='normal'?200:503,json:async()=>mode==='normal'?result:{error:mode==='denied'?'Questa raccolta è riservata all’amministratore.':'Statistiche non disponibili. Riprova.'}};}return qaFetch(url,options);};window.openAuthModal=()=>{window.qaLoginOpened=true;};`;
function fixture(){return fs.readFileSync(path.join(root,'le-mie-ads.html'),'utf8')
 .replace('<script src="/js/admin-theme.js?v=7"></script>','')
 .replace(/<script src="https:\/\/cdn\.jsdelivr[^>]+><\/script>/,'<script>'+fixtureScript+'</script>')
 .replace(/<script src="\/js\/(supabase-config|data|auth)\.js[^>]*><\/script>/g,'')
 .replace('<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">','');}
const trackerFixture=()=>`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0}a{display:block;width:300px;height:250px;background:#123b7a;color:white;margin:24px}</style></head><body><script>${fixtureScript}window.qaUser=null;Object.defineProperty(navigator,'webdriver',{get:()=>false});sessionStorage.setItem('_session_id','synthetic-session-123');</script><a data-personal-ad="vendi-01" data-pa-format="300x250" data-pa-placement="test_centro" href="/api/personal-ads?action=click&ad=vendi-01&format=300x250&placement=test_centro">Banner di prova</a><script src="/js/personal-ads-tracker.js"></script></body></html>`;
const server=http.createServer((req,res)=>{const url=new URL(req.url,'http://local');if(url.pathname==='/qa'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(fixture());}if(url.pathname==='/tracker'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(trackerFixture());}if(url.pathname==='/sheet'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<html><body style="background:#eee;margin:24px;font:14px Arial"><h1>Subingresso.it — prove delle 20 ADS</h1><div style="display:grid;grid-template-columns:repeat(4,300px);gap:20px">'+catalog.ads.map(ad=>'<div><p>'+ad.id+'</p><img width="300" height="250" src="/images/personal-ads/'+ad.id+'-300x250.png"></div>').join('')+'</div></body></html>');}const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.woff':'font/woff','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');fs.readFile(file,(e,body)=>e?res.writeHead(404).end():res.end(body));});
async function browserTests(engine,name,width,height,base){
 const browser=await engine.launch({headless:true});try{
  const context=await browser.newContext({viewport:{width,height},acceptDownloads:true,reducedMotion:'reduce'});await context.route('https://**/*',route=>route.abort());
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/qa');await page.locator('#paApp').waitFor({state:'visible'});
  assert.equal(await page.locator('.pa-choice').count(),20);assert.deepEqual(await page.locator('#paTotals dd').allTextContents(),['0','0','0','0,00 €']);
  assert.equal(await page.locator('#paStatsDetails').getAttribute('open'),null);
  // Carica anche le miniature fuori dalla piega prima della cattura completa.
  // Cambia solo il momento del fetch, senza alterare immagini o geometria.
  await page.evaluate(async()=>{await document.fonts.ready;document.querySelectorAll('img[loading="lazy"]').forEach(img=>img.loading='eager');await Promise.all(Array.from(document.images).map(img=>img.decode()));document.getElementById('paList').scrollTop=0;window.scrollTo(0,0);});
  for(const theme of ['light','dark']){await page.evaluate(theme=>document.documentElement.classList.toggle('admin-dark',theme==='dark'),theme);await page.screenshot({path:path.join(out,`${name}-${width}-${theme}.png`),fullPage:true});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'overflow '+name+width+theme);}
  await page.evaluate(()=>document.documentElement.classList.remove('admin-dark'));
  for(const [goal,count]of [['fiere',6],['vendi',7],['compra',7],['all',20]]){await page.locator('[data-goal="'+goal+'"]').click();assert.equal(await page.locator('.pa-choice').count(),count);}
  await page.locator('#paSearch').fill('non-esiste');assert.equal(await page.locator('.pa-choice').count(),0);assert(await page.locator('#paEditor').isHidden());await page.locator('#paSearch').fill('');
  for(const format of catalog.formats){await page.locator('#paFormat').selectOption(format.id);await page.waitForFunction(()=>{const img=document.getElementById('paPreview');return img.complete&&img.naturalWidth>0;});assert.equal(await page.locator('#paPreview').evaluate(img=>img.naturalWidth),format.width);}
  await page.locator('#paPlacement').fill('articolo_bandi_centro');await page.locator('#paCopyHtml').click();assert((await page.evaluate(()=>qaClipboard)).includes('data-pa-placement="articolo_bandi_centro"'));
  await page.locator('#paCopyLink').click();assert.equal(new URL(await page.evaluate(()=>qaClipboard)).searchParams.get('placement'),'articolo_bandi_centro');
  await page.locator('#paPlacement').fill('email@example.com');assert(await page.locator('#paCopyHtml').isDisabled());await page.locator('#paPlacement').fill('articolo_bandi_centro');
  await page.evaluate(()=>{qaBaseline.stats.rows=[{ad_id:'vendi-01',format:'300x250',placement:'articolo_bandi_centro',impressions:10,clicks:4,measured_clicks:3,converted_clicks:1,signups:1,listings:1,contacts:0,fairs:0,paid_orders:1,revenue_cents:4900,refunded_cents:0}];});await page.locator('#paRefresh').click();await page.waitForFunction(()=>document.querySelector('#paTotals dd').textContent==='10');assert.deepEqual(await page.locator('#paTotals dd').allTextContents(),['10','4','1','49,00 €']);
  await page.evaluate(()=>qaMode='offline');await page.locator('#paRefresh').click();await page.waitForFunction(()=>document.getElementById('paStatus').textContent.includes('ultimo aggiornamento'));assert.equal(await page.locator('#paTotals dd').first().textContent(),'10');await page.evaluate(()=>qaMode='normal');
  if(name==='Chromium'&&width===1440){
   await page.locator('#paStatsDetails').evaluate(el=>el.open=true);const csv=page.waitForEvent('download');await page.locator('#paExport').click();const csvFile=path.join(out,'risultati.csv');await(await csv).saveAs(csvFile);assert(fs.readFileSync(csvFile,'utf8').includes('"vendi-01"'));await page.locator('#paStatsDetails').evaluate(el=>el.open=false);
   await page.locator('#paFormat').selectOption('300x250');const single=page.waitForEvent('download');await page.locator('#paPack').click();await(await single).saveAs(path.join(out,'vendi-01-8-formati.zip'));
   const all=page.waitForEvent('download');await page.locator('#paDownloadAll').click();await(await all).saveAs(path.join(out,'subingresso-20-ads.zip'));
   await page.goto(base+'/sheet');await page.screenshot({path:path.join(out,'20-creativita.png'),fullPage:true});await page.goto(base+'/qa');await page.locator('#paApp').waitFor({state:'visible'});
  }
  await page.evaluate(()=>{qaDelay=200;document.getElementById('paRefresh').click();setTimeout(()=>{qaUser={id:'00000000-0000-4000-8000-000000000099'};qaMode='denied';qaCallbacks.forEach(fn=>fn('SIGNED_IN',{user:qaUser}));},20);});await page.waitForTimeout(450);assert(await page.locator('#paApp').isHidden());assert.equal(await page.locator('.pa-choice').count(),0);assert.equal(await page.locator('#paCode').inputValue(),'');
  await page.evaluate(()=>{qaUser=null;qaCallbacks.forEach(fn=>fn('SIGNED_OUT',null));});await page.locator('#paLogin').waitFor({state:'visible'});assert(await page.locator('#paApp').isHidden());assert.deepEqual(errors,[]);
  return {browser:name,width,passed:true};
 }finally{await browser.close();}
}
async function trackerTests(base){
 const browser=await chromium.launch({headless:true});try{
  const page=await browser.newPage({viewport:{width:800,height:600}});await page.goto(base+'/tracker?pa='+clickId);assert(!page.url().includes('pa='));await page.waitForFunction(()=>qaImpressions.length===1);assert.equal(await page.evaluate(()=>qaImpressions.length),1);
  await page.evaluate(()=>window.dispatchEvent(new Event('resize')));await page.waitForTimeout(1100);assert.equal(await page.evaluate(()=>qaImpressions.length),1,'dedup');
  await page.locator('a').focus();assert.equal(new URL(await page.locator('a').getAttribute('href')).searchParams.get('sid'),'synthetic-session-123');
  await page.evaluate(()=>{qaUser={id:'00000000-0000-4000-8000-000000000002'};qaCallbacks.forEach(fn=>fn('SIGNED_IN',{user:qaUser}));});await page.waitForFunction(()=>qaClaims.length===1);assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('_pa_last_click_v1')).owner),'00000000-0000-4000-8000-000000000002');
  await page.evaluate(()=>{qaUser=null;qaCallbacks.forEach(fn=>fn('SIGNED_OUT',null));});await page.waitForTimeout(60);assert.equal(await page.evaluate(()=>sessionStorage.getItem('_pa_last_click_v1')),null);
  await page.evaluate(()=>{qaUser={id:'00000000-0000-4000-8000-000000000001'};qaAdmin=true;qaCallbacks.forEach(fn=>fn('SIGNED_IN',{user:qaUser}));});await page.waitForTimeout(80);await page.locator('a').focus();await page.locator('a').dispatchEvent('pointerdown');assert.equal(new URL(await page.locator('a').getAttribute('href')).searchParams.get('preview'),'1');
  // Banner editoriale: vedere solo la CTA non basta per l'impressione.
  await page.goto(base+'/tracker');await page.evaluate(()=>{qaImpressions.length=0;document.querySelector('a').remove();const b=document.createElement('aside');b.dataset.fierePromo='inline';b.style.cssText='height:800px;width:320px;margin-top:-600px;position:relative;background:#123b7a';b.innerHTML='<h2 class="bfp-title">Fai girare il banco.</h2><a class="bfp-button" href="/fiere" style="position:absolute;bottom:0;margin:0;width:200px;height:44px">Apri fiere</a>';document.body.append(b);});await page.waitForTimeout(1200);assert.equal(await page.evaluate(()=>qaImpressions.length),0,'CTA visibile con meno di metà banner');
  await page.evaluate(()=>document.querySelector('aside').style.marginTop='0px');await page.waitForFunction(()=>qaImpressions.length===1);assert.equal(await page.evaluate(()=>qaImpressions[0].p_ad),'fiere-03');
 }finally{await browser.close();}
}
(async()=>{await apiTests();await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
 if(process.argv.includes('--serve')){console.log(base+'/qa');return;}
 try{const results=[];for(const [engine,name,width,height]of [[chromium,'Chromium',1440,1000],[chromium,'Chromium',768,1024],[chromium,'Chromium',320,568],[webkit,'WebKit',390,844]])results.push(await browserTests(engine,name,width,height,base));await trackerTests(base);fs.writeFileSync(path.join(out,'browser-test.json'),JSON.stringify({api:true,tracker:true,results},null,2));console.log(JSON.stringify({api:true,tracker:true,results}));}finally{server.close();}
})().catch(error=>{console.error(error.stack);server.close();process.exitCode=1;});
