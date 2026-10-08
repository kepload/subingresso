const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),owner='11111111-1111-1111-1111-111111111111';
const payload={checked_at:new Date().toISOString(),issues_total:28,offset:0,page_size:25,
 summary:{listings_checked:100,listings_with_issues:93,profiles_checked:104,profiles_with_issues:1,optional_phone_missing:2,pending_listings:4,pending_bandi:3,open_reports:2,support_unread:5,expired_listings:7,expiring_listings:2,gross_cents:9990,refunded_cents:1000,paid_waiting:2,paid_activation_problem:1,new_users_30d:12,new_listings_30d:8,valuations_30d:16,locations_loaded:63182,bando_subscribers:7,last_candidate:null,last_anomaly_check:null,old_valuation_model:90},
 issues:Array.from({length:25},(_,i)=>({kind:i===0?'profilo':'annuncio',id:'22222222-2222-2222-2222-'+String(i).padStart(12,'0'),label:i===0?'Mario <img src=x onerror="window.INJECTED=true">':'Posteggio al mercato di Brescia '+i,context:'Brescia · Lombardia',status:'active',issues:['localita','descrizione'],severity:'warning'})),
 automations:[{jobname:'scout-bandi-daily',active:true,last_status:'succeeded',last_started_at:new Date().toISOString()},{jobname:'weekly-seller-stats',active:false,last_status:null,last_started_at:null}]};
let html=fs.readFileSync(path.join(root,'dashboard.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
const fixture=`<script>
window.PAYLOAD=${JSON.stringify(payload)};window.RPC_CALLS=[];window.FAIL=false;window.DELAY=false;window.PENDING=[];
window.escapeHTML=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
window._supabase={auth:{onAuthStateChange:fn=>{window.AUTH_CHANGE=fn;}},rpc:async(name,args)=>{window.RPC_CALLS.push({name,args});if(window.FAIL)return {error:{message:'offline'}};if(window.DELAY)return new Promise(resolve=>window.PENDING.push(resolve));
if(name==='admin_user_details')return {data:{id:args.p_user_id,email:'utente@example.it',nome:'Mario',cognome:'Rossi',telefono:'347 1234567',created_at:new Date().toISOString(),verification_mode:'bypass',listings:1,alerts:1,valuations:0}};
return {data:{...window.PAYLOAD,issues:args.p_offset?window.PAYLOAD.issues.slice(0,3):window.PAYLOAD.issues}};}};
</script><script src="/js/admin-control-room.js"></script><script>
document.addEventListener('DOMContentLoaded',()=>{document.getElementById('loadingState').classList.add('hidden');document.getElementById('dashContent').classList.remove('hidden');document.getElementById('adminPanel').classList.remove('hidden');AdminControlRoom.start('${owner}');});
</script>`;
html=html.replace('</body>',fixture+'</body>');
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/dashboard'){res.setHeader('Content-Type','text/html;charset=utf-8');res.end(html);return;}
 const file=path.resolve(root,'.'+url.pathname);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/plain');
 fs.readFile(file,(err,data)=>err?res.writeHead(404).end():res.end(data));
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 try{for(const[engine,name]of[[chromium,'chromium'],[webkit,'webkit']]){
  const browser=await engine.launch({headless:true});
  try{for(const width of [1440,390,320]){
   const page=await browser.newPage({viewport:{width,height:950}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('https://**/*',route=>route.abort());
   await page.goto(base+'/dashboard');await page.locator('.acr-card').first().waitFor();assert.equal(await page.locator('.acr-card').count(),8);
   assert.equal(await page.locator('#acrIssues img').count(),0);assert.equal(await page.evaluate(()=>window.INJECTED),undefined);
   const overflow=await page.locator('#adminControlRoom').evaluate(el=>el.scrollWidth>el.clientWidth+1);assert(!overflow,`${width}: overflow pannello`);
   await page.locator('#acrQualitySummary').click();
   await page.locator('[data-user-id]').first().click();await page.locator('#acrUserContent').getByText('utente@example.it',{exact:true}).waitFor();
   await page.locator('#acrUserClose').click();await page.locator('#acrNext').click();await page.waitForFunction(()=>document.getElementById('acrPageInfo').textContent.startsWith('26'));
   const download=page.waitForEvent('download');await page.locator('#acrExport').click();const file=await(await download).path();const csv=fs.readFileSync(file,'utf8');assert.equal(csv.split('\r\n').length,29);assert(csv.includes('Provincia')||csv.includes('Comune, provincia o regione'));
   await page.evaluate(()=>window.FAIL=true);await page.locator('#acrRefresh').click();await page.waitForFunction(()=>document.getElementById('acrState').dataset.state==='error');assert((await page.locator('#acrState').textContent()).includes('risalgono'));
   await page.evaluate(()=>{window.FAIL=false;window.DELAY=true;AdminControlRoom.refresh();AdminControlRoom.refresh();});
   await page.waitForFunction(()=>window.PENDING.length===2);await page.evaluate(()=>{window.PENDING[1]({data:window.PAYLOAD});});await page.waitForFunction(()=>!document.getElementById('acrRefresh').disabled);
   await page.evaluate(()=>{window.PENDING[0]({data:{...window.PAYLOAD,summary:{...window.PAYLOAD.summary,listings_with_issues:999}}});});
   assert(!(await page.locator('#acrMetrics').textContent()).includes('999'));
   if(process.env.ADMIN_SCREENSHOTS&&name==='chromium'){await page.evaluate(()=>document.getElementById('acrQualityDetails').open=false);fs.mkdirSync(process.env.ADMIN_SCREENSHOTS,{recursive:true});await page.locator('#adminControlRoom').screenshot({path:path.join(process.env.ADMIN_SCREENSHOTS,`admin-${width}.png`)});}
   await page.evaluate(()=>window.AUTH_CHANGE('SIGNED_IN',{user:{id:'other-user'}}));assert.equal(await page.locator('.acr-card').count(),0);assert(await page.locator('#adminPanel').evaluate(el=>el.classList.contains('hidden')));assert.deepEqual(errors,[]);
   console.log(`OK: ${name} ${width}px, riepilogo, XSS, dettagli, paginazione, CSV completo, errori, concorrenza e cambio account`);await page.close();
  }}finally{await browser.close();}
 }}finally{server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
