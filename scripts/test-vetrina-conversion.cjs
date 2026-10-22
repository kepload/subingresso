// Premium component with real HTML/CSS/JS and isolated auth/Stripe. No charges.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.VETRINA_QA_DIR;
const published=new Map();
const read=file=>published.get(file)||fs.readFileSync(path.join(root,file),'utf8');
const owner='11111111-1111-1111-1111-111111111111';
const rows=Array.from({length:12},(_,i)=>({id:`22222222-2222-2222-2222-${String(i+1).padStart(12,'0')}`,user_id:owner,
 titolo:i===11?'<img src=x onerror=window.xss=true>': ['Posteggio al mercato di Brescia','Banco alimentare a Bergamo','Posteggio del sabato a Milano','Licenza mercato di Como'][i%4],
 status:'active',comune:['Brescia','Bergamo','Milano','Como'][i%4],regione:'Lombardia',img_urls:[],expires_at:'2099-01-01'}));
function fixture(){
 const html=read('dashboard.html');
 const modal=html.slice(html.indexOf('<div id="vetrinaModal"'),html.indexOf('<!-- ══════════════ MODAL PROFILO'));
 const wrappers=html.slice(html.indexOf('// Premium controller shared'),html.indexOf('// ════════════ ADMIN: Valutatore Logs'));
 const styles=[...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/gi)].map(m=>m[0]).filter(tag=>!tag.includes('https://')).join('');
 const mock=`let _currentUser={id:'${owner}'};const SUPABASE_URL='https://backend.invalid',SUPABASE_ANON_KEY='public-test-key';
 window.rows=${JSON.stringify(rows)};window.requests=[];window.mode='error';window.delay=0;window.listDelay=0;window.listError=false;window.rowCount=12;window.authCallbacks=[];
 function escapeHTML(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}function showToast(){}
 const _supabase={auth:{getSession:async()=>({data:{session:window.mode==='no-session'?null:{user:_currentUser,access_token:'test-token'}}}),onAuthStateChange:fn=>{authCallbacks.push(fn);return{};}},
 from:()=>({select(){return this},eq(){return this},order(){return this},range:async()=>{await new Promise(r=>setTimeout(r,listDelay));return{data:rows.slice(0,rowCount),error:listError?{message:'offline'}:null};}})};
 window.fetch=async(url,options)=>{requests.push({url,headers:options.headers,body:JSON.parse(options.body)});await new Promise(r=>setTimeout(r,delay));return mode==='success'?{ok:true,json:async()=>({url:'https://checkout.stripe.com/c/pay/isolated-test'})}:{ok:false,json:async()=>({error:'Pagamento non disponibile. Riprova.'})};};`;
 return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${styles}<style>@font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:400;font-display:swap;src:url('/css/fonts/jakarta-400.woff') format('woff');}@font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:500;font-display:swap;src:url('/css/fonts/jakarta-500.woff') format('woff');}@font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:600;font-display:swap;src:url('/css/fonts/jakarta-600.woff') format('woff');}@font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:700;font-display:swap;src:url('/css/fonts/jakarta-700.woff') format('woff');}@font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:800;font-display:swap;src:url('/css/fonts/jakarta-800.woff') format('woff');}body{font-family:'Plus Jakarta Sans',sans-serif;background:#f5f6f8}main{max-width:1100px;margin:30px auto;padding:24px}h1{font-size:24px;font-weight:700}main button{padding:14px}</style></head><body><main><h1>Subingresso.it · Le tue Vetrine</h1><button id="open" onclick='openVetrinaModal(${JSON.stringify(rows[0])})'>Promuovi il tuo annuncio</button><button id="bulk" onclick="VetrinaPremium.open()">Promuovi più annunci</button></main>${modal}<script>${mock}</script><script src="/js/vetrina-pricing.js"></script><script src="/js/vetrina-premium.js"></script><script>${wrappers}\nif(location.search.includes('inspect'))document.addEventListener('DOMContentLoaded',()=>openVetrinaModal(rows[0]));</script></body></html>`;
}
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/dashboard'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(fixture());}
 const file=decodeURIComponent(url.pathname.slice(1)),full=path.resolve(root,file);
 if(!full.startsWith(root+path.sep))return res.writeHead(403).end();
 res.setHeader('Content-Type',({'.css':'text/css','.js':'text/javascript','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream');
 if(published.has(file))return res.end(published.get(file));
 fs.readFile(full,(e,data)=>e?res.writeHead(404).end():res.end(data));
});
async function run(engine,name,width,height,base){
 const browser=await engine.launch({headless:true});
 try{
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://checkout.stripe.com/**',r=>r.fulfill({body:'Pagamento simulato'}));
  await page.goto(base+'/dashboard');await page.locator('#open').click();
  const cta=page.locator('#vetrinaCheckoutButton');await page.waitForFunction(()=>document.querySelectorAll('#premiumListings input').length===12);
  assert.equal(await page.locator('#tier30d').getAttribute('aria-pressed'),'true');
  assert.equal(await cta.evaluate(el=>getComputedStyle(el).backgroundImage),'none','legacy CSS must not override Premium');
  assert.equal(await cta.evaluate(el=>getComputedStyle(el).boxShadow),'none');
  assert.match(await page.locator('#premiumTotal').innerText(),/99,00/);assert.equal(await page.evaluate(()=>requests.length),0);
  assert.equal(await page.locator('#premiumListings strong img').count(),0,'user title escaped');
  assert.equal(await page.evaluate(()=>window.xss),undefined);
  const check=page.locator('#premiumListings input');
  for(const [index,total,discount] of [[1,'178,20','10%'],[2,'252,45','15%'],[3,'336,60','15%'],[4,'396,00','20%']]){
   await check.nth(index).check();assert.match(await page.locator('#premiumTotal').innerText(),new RegExp(total));assert((await page.locator('#premiumSaving').innerText()).includes(discount));
  }
  if(out)await page.screenshot({path:path.join(out,`${name}-${width}-pacchetto.png`)});
  for(let i=5;i<10;i++)await check.nth(i).check();assert(await check.nth(10).isDisabled());
  assert.match(await page.locator('#premiumTotal').innerText(),/792,00/);
  await page.locator('#tier90d').click();assert.match(await page.locator('#premiumTotal').innerText(),/1.992,00/);
  const bounds=await cta.boundingBox();assert(bounds.y>=0&&bounds.y+bounds.height<=height,'checkout always visible');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  assert.equal(await page.locator('.premium-duration strong').evaluateAll(elements=>elements.every(el=>{const range=document.createRange();range.selectNodeContents(el);const text=range.getBoundingClientRect(),box=el.getBoundingClientRect();return text.left>=box.left-1&&text.right<=box.right+1;})),true,'prices fit inside each duration option');

  await cta.click();await page.waitForFunction(()=>document.getElementById('vetrinaLoadingMsg').textContent.includes('Riprova'));
  const request=await page.evaluate(()=>requests.at(-1));assert.equal(request.body.expected_amount_cents,199200);assert.equal(request.body.annuncio_ids.length,10);assert.equal(request.headers.apikey,'public-test-key');
  await page.evaluate(()=>{delay=150;startCheckout();startCheckout();});await page.waitForTimeout(250);
  assert.equal(await page.evaluate(()=>requests.length),2,'one request on double click');
  await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'open');
  await page.locator('#bulk').click();await page.waitForFunction(()=>document.querySelectorAll('#premiumListings input').length===12);assert(await cta.isDisabled());
  await check.first().check();await page.evaluate(()=>{mode='no-session';});await cta.click();
  await page.waitForFunction(()=>document.getElementById('vetrinaLoadingMsg').textContent.includes('Sessione scaduta'));assert(await cta.isEnabled());
  await page.evaluate(()=>{mode='success';delay=200;startCheckout();});await page.waitForFunction(()=>requests.length===3);await page.keyboard.press('Escape');await page.waitForTimeout(250);assert(page.url().includes('/dashboard'),'no late redirect');
  await page.locator('#open').click();await page.waitForFunction(()=>document.querySelectorAll('#premiumListings input').length===12);
  await page.evaluate(()=>{_currentUser=null;authCallbacks.forEach(cb=>cb('SIGNED_OUT',null));});assert(await page.locator('#vetrinaModal').evaluate(el=>el.classList.contains('hidden')));
  await page.evaluate(()=>{_currentUser={id:'11111111-1111-1111-1111-111111111111'};listError=true;});await page.locator('#bulk').click();await page.getByRole('button',{name:'Riprova',exact:true}).waitFor();assert(await cta.isDisabled());
  await page.evaluate(()=>{listError=false;rowCount=0;});await page.getByRole('button',{name:'Riprova',exact:true}).click();await page.getByText('Non hai annunci attivi da promuovere.').waitFor();assert(await cta.isDisabled());
  await page.keyboard.press('Escape');await page.evaluate(()=>{rowCount=12;delay=0;});await page.locator('#open').click();await page.waitForFunction(()=>document.querySelectorAll('#premiumListings input').length===12);
  await page.evaluate(()=>document.documentElement.classList.add('admin-dark'));
  assert.equal(await cta.evaluate(el=>getComputedStyle(el).backgroundImage),'none');
  assert.equal(await cta.evaluate(el=>getComputedStyle(el).color),'rgb(21, 41, 67)');
  if(out)await page.screenshot({path:path.join(out,`${name}-${width}-scuro.png`)});
  await cta.click();await page.waitForURL('https://checkout.stripe.com/**');assert.deepEqual(errors,[]);
  console.log(`OK ${name} ${width}: prezzi/bundle, selezione 0–10, limiti, XSS, errori/riprova, doppi clic, sessione, chiusura, redirect, mobile e scuro.`);
 }finally{await browser.close();}
}
(async()=>{
 if(out)fs.mkdirSync(out,{recursive:true});
 if(process.env.VETRINA_USE_PUBLISHED)for(const file of ['dashboard.html','js/vetrina-pricing.js','js/vetrina-premium.js','css/vetrina-premium.css']){
  const response=await fetch('https://subingresso.it/'+file.replace(/\.html$/,''));assert(response.ok);published.set(file,await response.text());
 }
 await new Promise(resolve=>server.listen(process.env.VETRINA_INSPECT?3018:0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 if(process.env.VETRINA_INSPECT){console.log(base+'/dashboard?inspect=1');return;}
 try{for(const [engine,name,width,height]of[[chromium,'Chrome',1440,1000],[chromium,'Chrome',768,1000],[chromium,'Chrome',320,568],[webkit,'Safari',390,844]])await run(engine,name,width,height,base);}finally{server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
