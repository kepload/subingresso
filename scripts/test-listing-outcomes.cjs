// Mini modulo reale, script e stili pubblicabili; backend simulato, nessuna scrittura esterna.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict'),vm=require('node:vm');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),out=process.env.OUTCOMES_QA_DIR,cache=new Map();
const read=f=>cache.get(f)||fs.readFileSync(path.join(root,f),'utf8');
const actor='11111111-1111-4111-8111-111111111111',id='22222222-2222-4222-8222-222222222222';
function fixture(){
 const html=read('dashboard.html'),modal=html.slice(html.indexOf('<dialog id="listingOutcomeDialog"'),html.indexOf('</dialog>',html.indexOf('<dialog id="listingOutcomeDialog"'))+9);
 const listingCode=html.slice(html.indexOf('async function loadMyListings()'),html.indexOf('function closeListingOptionsMenus()'));
 const markCode=html.slice(html.indexOf('async function markAsSold(id)'),html.indexOf('async function deleteListing(id)'));
 return `<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/css/tailwind.css"><link rel="stylesheet" href="/css/design-system.css"><link rel="stylesheet" href="/css/admin-theme.css"><link rel="stylesheet" href="/css/theme-preferences.css"><link rel="stylesheet" href="/css/listing-outcome.css"><style>body{background:#f5f5f5}main{margin:40px auto;max-width:900px;padding:16px}h1{font-size:24px;margin-bottom:24px}.admin-dark body{background:#0b1220}button{cursor:pointer}</style></head><body><main><h1>I tuoi annunci</h1><div id="myListingsGrid"></div></main>${modal}<script>
 let _currentUser={id:${JSON.stringify(actor)}},_myListingsVersion=0,_listingOutcomeRows=new Map(),_sellerAnalyticsLoaded=false;
 let row={id:${JSON.stringify(id)},user_id:_currentUser.id,titolo:'Posteggio mercato di Brescia',stato:'Vendita',tipo:'Mercato',prezzo:15000,comune:'Brescia',regione:'Lombardia',status:'active',created_at:'2026-10-01',dettagli_extra:{}};
 window.requests=[];window.callbacks=[];window.delay=0;window.fail=false;window.outcomeRows=[];window.toasts=[];
 const _supabase={auth:{getSession:async()=>({data:{session:{user:_currentUser}}}),onAuthStateChange:cb=>callbacks.push(cb)},rpc:async(name,args)=>{requests.push({name,args});await new Promise(r=>setTimeout(r,delay));if(fail)return {error:{message:'offline'}};if(name==='get_my_listing_outcomes')return {data:outcomeRows};row.status=args.p_outcome==='neither'?'active':'sold';outcomeRows=[{listing_id:row.id,outcome:args.p_outcome}];return {data:{ok:true,outcome:args.p_outcome,price_quality:args.p_final_price===null?'missing':'plausible'}};},from:()=>({select(){return this},eq(){return this},neq(){return this},order:async()=>({data:[row]})})};
 function escapeHTML(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}function showToast(...args){toasts.push(args)}function getOptimizedImageUrl(s){return s}
 ${listingCode}\n${markCode}
 window.reset=async()=>{row.status='active';requests=[];outcomeRows=[];fail=false;delay=0;_currentUser={id:${JSON.stringify(actor)}};await loadMyListings();};window.changeUser=()=>{_currentUser={id:'33333333-3333-4333-8333-333333333333'};callbacks.forEach(cb=>cb('SIGNED_IN',{user:_currentUser}));};reset();
 </script><script src="/js/listing-outcome.js"></script><script>document.addEventListener('DOMContentLoaded',()=>{const params=new URLSearchParams(location.search);if(params.has('preview')){document.documentElement.classList.toggle('admin-dark',params.get('theme')==='dark');ListingOutcome.open(row);if(params.get('preview')==='source'){document.querySelector('input[value=sold]').click();document.getElementById('listingOutcomeNext').click();document.getElementById('listingOutcomeNext').click();}}});</script></body></html>`;
}
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://local').pathname;
 if(pathname==='/fixture'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end(fixture());return;}
 const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{const data=cache.get(path.relative(root,file).replaceAll('\\','/'))||fs.readFileSync(file);res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.woff')?'font/woff':'text/javascript; charset=utf-8');res.end(data);}catch(_){res.writeHead(404).end();}
});
async function shots(page,name){if(out)await page.screenshot({path:path.join(out,name+'.png'),fullPage:true});}
(async()=>{
 if(out)fs.mkdirSync(out,{recursive:true});
 if(process.env.OUTCOMES_USE_PUBLISHED==='1')for(const f of ['dashboard.html','js/listing-outcome.js','css/listing-outcome.css']){
  const r=await fetch('https://subingresso.it/'+f);assert(r.ok);const text=await r.text();
  // Il deploy usa i blob Git LF, il checkout Windows può avere CRLF.
  const committed=require('node:child_process').execFileSync('git',['show','HEAD:'+f],{cwd:root,encoding:'utf8'});
  const hash=s=>require('node:crypto').createHash('sha256').update(s).digest('hex');
  assert.equal(hash(text),hash(committed),'Published Git blob '+f);cache.set(f,text);
 }
 const dashboard=read('dashboard.html');for(const m of dashboard.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){if(m[1].trim())new vm.Script(m[1]);}
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));let cases=0;
 if(process.env.OUTCOMES_PREVIEW==='1'){console.log('Preview http://127.0.0.1:'+server.address().port+'/fixture?preview=source');return;}
 try{
 for(const [engine,browserName,width,height] of [[chromium,'Chrome',1440,900],[chromium,'Chrome',768,900],[chromium,'Chrome',320,568],[webkit,'Safari',390,844]]){
  const browser=await engine.launch({headless:true});try{
   const page=await browser.newPage({viewport:{width,height}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:')?route.continue():route.abort());
   await page.goto(`http://127.0.0.1:${server.address().port}/fixture`);await page.waitForFunction(()=>!!window.ListingOutcome);
   for(const dark of [false,true]){
    await page.evaluate(dark=>document.documentElement.classList.toggle('admin-dark',dark),dark);
    const tag=`${browserName}-${width}-${dark?'dark':'light'}`;
    const reset=async()=>{await page.evaluate(()=>reset());await page.getByRole('button',{name:'Venduto o affittato?'}).click();await page.waitForSelector('#listingOutcomeDialog[open]');};
    await reset();assert.equal(await page.locator('#listingOutcomeDialog input:checked').count(),0);await shots(page,tag+'-esito');
    await page.getByRole('button',{name:'Continua',exact:true}).click();assert(await page.locator('#listingOutcomeError').isVisible());
    await page.locator('input[name=listingOutcome][value=sold]').check();await page.getByRole('button',{name:'Continua',exact:true}).click();
    for(const bad of ['1','10','10000000','-1','abc','15000.001','Infinity']){await page.locator('#listingOutcomePrice').fill(bad);await page.getByRole('button',{name:'Continua',exact:true}).click();assert(await page.locator('#listingOutcomeError').isVisible(),bad);assert.equal(await page.locator('#listingOutcomePrice').getAttribute('aria-invalid'),'true');cases++;}
    await page.locator('#listingOutcomePrice').fill('15000,50');await shots(page,tag+'-prezzo');await page.getByRole('button',{name:'Continua',exact:true}).click();
    await page.getByRole('button',{name:'Salva esito'}).click();assert(await page.locator('#listingOutcomeError').isVisible());
    await page.locator('input[name=listingOutcomeSource][value=facebook]').check();await shots(page,tag+'-canale');
    assert(await page.locator('#listingOutcomeNext').evaluate(el=>el.getBoundingClientRect().bottom<=innerHeight),'Save visible without scrolling');
    await page.evaluate(()=>delay=180);await page.getByRole('button',{name:'Salva esito'}).click();assert(await page.locator('#listingOutcomeNext').isDisabled());
    await page.waitForFunction(()=>!document.getElementById('listingOutcomeDialog').open);let calls=await page.evaluate(()=>requests.filter(r=>r.name==='record_listing_outcome'));assert.equal(calls.length,1);assert.equal(calls[0].args.p_final_price,15000.5);assert.equal(calls[0].args.p_source,'facebook');await page.waitForFunction(()=>document.getElementById('myListingsGrid').textContent.includes('Venduto'));cases++;
    await reset();await page.locator('input[value=rented]').check();await page.getByRole('button',{name:'Continua',exact:true}).click();assert.equal(await page.locator('#listingOutcomePriceLabel').textContent(),'Canone annuo concordato');assert.equal(await page.locator('#listingOutcomePriceUnit').textContent(),'€ / anno');await page.locator('#listingOutcomePrice').fill('3000');await page.getByRole('button',{name:'Continua',exact:true}).click();await page.locator('input[name=listingOutcomeSource][value=subingresso]').check();await page.getByRole('button',{name:'Salva esito'}).click();await page.waitForFunction(()=>document.getElementById('myListingsGrid').textContent.includes('Affittato'));cases++;
    await reset();await page.locator('input[value=neither]').check();await page.getByRole('button',{name:'Salva esito'}).click();await page.waitForFunction(()=>!document.getElementById('listingOutcomeDialog').open);calls=await page.evaluate(()=>requests.filter(r=>r.name==='record_listing_outcome'));assert.equal(calls[0].args.p_source,null);assert.equal(calls[0].args.p_final_price,null);assert.equal(await page.evaluate(()=>row.status),'active');cases++;
    await reset();await page.locator('input[value=sold]').check();await page.getByRole('button',{name:'Continua',exact:true}).click();await page.getByRole('button',{name:'Continua',exact:true}).click();await page.locator('input[name=listingOutcomeSource][value=other]').check();await page.evaluate(()=>fail=true);await page.getByRole('button',{name:'Salva esito'}).click();await page.waitForFunction(()=>!document.getElementById('listingOutcomeError').hidden);assert(await page.locator('#listingOutcomeDialog').isVisible());assert(await page.locator('input[value=other]').isChecked());await page.evaluate(()=>fail=false);await page.getByRole('button',{name:'Salva esito'}).click();await page.waitForFunction(()=>!document.getElementById('listingOutcomeDialog').open);assert.equal((await page.evaluate(()=>requests.find(r=>r.name==='record_listing_outcome'))).args.p_final_price,null);cases++;
    await reset();await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>requests.filter(r=>r.name==='record_listing_outcome').length),0);assert(!(await page.locator('#listingOutcomeDialog').isVisible()));cases++;
    await reset();await page.evaluate(()=>changeUser());assert(!(await page.locator('#listingOutcomeDialog').isVisible()));assert.equal(await page.evaluate(()=>_listingOutcomeRows.size),0);cases++;
    await reset();await page.locator('input[value=sold]').check();await page.getByRole('button',{name:'Continua',exact:true}).click();await page.getByRole('button',{name:'Continua',exact:true}).click();await page.locator('input[name=listingOutcomeSource][value=other]').check();await page.evaluate(()=>delay=250);await page.getByRole('button',{name:'Salva esito'}).click();await page.evaluate(()=>changeUser());await page.waitForTimeout(300);assert(!(await page.locator('#listingOutcomeDialog').isVisible()));cases++;
    await reset();assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert(await page.locator('#listingOutcomeDialog').evaluate(el=>el.scrollWidth<=el.clientWidth));
    await page.keyboard.press('Shift+Tab');assert(await page.evaluate(()=>document.getElementById('listingOutcomeDialog').contains(document.activeElement)));await page.keyboard.press('Escape');cases++;
   }
   assert.deepEqual(errors,[]);await page.close();console.log(browserName+' '+width+' light/dark passed');
  }finally{await browser.close();}
 }
 console.log(cases+' outcome checks passed; no external requests');
 }finally{server.close();}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
