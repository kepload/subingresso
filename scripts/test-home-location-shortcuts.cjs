const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),artifacts=process.env.HOME_SEARCH_QA_DIR;
const places=[['015146','Milano','Lombardia','Milano'],['022205','Trento','Trentino-Alto Adige/Südtirol','Trento'],['023091','Verona','Veneto','Verona'],['017029','Brescia','Lombardia','Brescia'],['016024','Bergamo','Lombardia','Bergamo']].map(([id,nome,regione,provincia])=>({id,nome,regione,provincia}));
function fixture(){return fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('</body>',`<script>
window.qaPlaces=${JSON.stringify(places)};window.qaPopular=qaPlaces.slice(0,3);window.qaFail=new URLSearchParams(location.search).has('fail');window.qaUser=null;window.qaListeners=[];window.qaDelay=0;window.qaCalls=0;
window.qaSwitch=id=>{qaUser=id;qaListeners.forEach(fn=>fn(id?'SIGNED_IN':'SIGNED_OUT',id?{user:{id}}:null));};
const ComuniItaliani={load:async()=>qaPlaces};
const _supabase={auth:{getSession:async()=>{const id=qaUser;await new Promise(r=>setTimeout(r,qaDelay));return{data:{session:id?{user:{id}}:null}};},onAuthStateChange:fn=>qaListeners.push(fn)},rpc:async name=>{if(name!=='home_top_location_searches')throw Error('RPC inattesa');qaCalls++;return qaFail?{data:null,error:{message:'offline'}}:{data:qaPopular.map(p=>({name:p.nome,regione:p.regione,provincia:p.provincia})),error:null};}};
</script><script src="/js/location-shortcuts.js"></script></body>`);}
const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;if(pathname==='/fixture'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(fixture());}const file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(file,(error,bytes)=>{if(error)return res.writeHead(404).end();res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.woff')?'font/woff':'text/javascript; charset=utf-8');res.end(bytes);});});
(async()=>{
 if(artifacts)fs.mkdirSync(artifacts,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{for(const[engine,name,width]of[[chromium,'Chromium',1440],[chromium,'Chromium',820],[chromium,'Chromium',320],[webkit,'WebKit',390]]){
  const browser=await engine.launch({headless:true});try{
   const page=await browser.newPage({viewport:{width,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto(`http://127.0.0.1:${server.address().port}/fixture`);await page.locator('#homeLocationShortcuts a').first().waitFor();
   const names=()=>page.locator('#homeLocationShortcuts a').allTextContents();
   assert.deepEqual(await names(),['Milano','Trento','Verona']);
   const layout=await page.evaluate(()=>{const search=document.querySelector('.home-search').getBoundingClientRect(),stats=document.querySelector('.home-stats').getBoundingClientRect(),list=document.querySelector('.home-listings').getBoundingClientRect();return{between:stats.top>=search.bottom&&stats.bottom<=list.top,gradient:getComputedStyle(document.querySelector('.home-stats-section')).backgroundImage,unique:['statListings','statValue','statUsers'].every(id=>document.querySelectorAll('#'+id).length===1),width:document.documentElement.scrollWidth};});
   assert(layout.between&&layout.unique&&layout.gradient.includes('linear-gradient'));assert(layout.width<=width);
   assert.equal(await page.locator('#statListings').textContent(),'1.591');assert.equal(await page.locator('#statValue').textContent(),'€ 4.4M');assert.equal(await page.locator('#statUsers').textContent(),'4.045');
   const href=await page.locator('#homeLocationShortcuts a').first().getAttribute('href');assert(href.includes('comune=015146')&&href.includes('q=Milano'));
   if(artifacts)await page.screenshot({path:path.join(artifacts,`${name}-${width}-anonimo.png`)});
   await page.evaluate(()=>LocationShortcuts.remember(qaPlaces[3]));assert.deepEqual(await names(),['Milano','Trento','Verona']);
   await page.evaluate(async()=>{localStorage.setItem('_sub_searches','["Ricerca di un altro visitatore"]');qaSwitch('account-A');await LocationShortcuts.remember(qaPlaces[3]);});
   assert.deepEqual(await names(),['Brescia','Milano','Trento']);assert.equal(await page.locator('#homeLocationShortcuts a').first().getAttribute('aria-label'),'Brescia, la tua ultima ricerca');
   if(artifacts)await page.screenshot({path:path.join(artifacts,`${name}-${width}-personale.png`)});
   await page.evaluate(()=>qaSwitch('account-B'));assert.deepEqual(await names(),['Milano','Trento','Verona']);
   await page.evaluate(()=>LocationShortcuts.remember(qaPlaces[2]));assert.deepEqual(await names(),['Verona','Milano','Trento']);
   await page.evaluate(()=>qaSwitch('account-A'));assert.deepEqual(await names(),['Brescia','Milano','Trento']);
   // Una risposta della sessione precedente non salva la località sul nuovo account.
   await page.evaluate(async()=>{qaDelay=30;const pending=LocationShortcuts.remember(qaPlaces[4]);qaSwitch('account-B');await pending;qaDelay=0;});
   assert.deepEqual(await names(),['Verona','Milano','Trento']);await page.evaluate(()=>qaSwitch('account-A'));assert.deepEqual(await names(),['Brescia','Milano','Trento']);
   await page.evaluate(()=>qaSwitch(null));assert.deepEqual(await names(),['Milano','Trento','Verona']);
   // La classifica viene riletta tornando alla pagina dopo cinque minuti.
   await page.evaluate(()=>{qaPopular=[qaPlaces[4],qaPlaces[3],qaPlaces[0]];const original=Date.now;Date.now=()=>original()+301000;document.dispatchEvent(new Event('visibilitychange'));});
   await page.waitForFunction(()=>document.querySelector('#homeLocationShortcuts a').textContent==='Bergamo');assert.deepEqual(await names(),['Bergamo','Brescia','Milano']);
   await page.evaluate(async()=>{qaSwitch('account-A');const original=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('bloccato');};await LocationShortcuts.remember(qaPlaces[4]);Storage.prototype.setItem=original;});assert.deepEqual(await names(),['Brescia','Bergamo','Milano']);
   await page.goto(`http://127.0.0.1:${server.address().port}/fixture?fail`);await page.waitForFunction(()=>qaCalls===1);assert.equal(await page.locator('#homeLocationShortcuts').isVisible(),false);
   assert.deepEqual(errors,[]);console.log('PASS',name,width,'ordine contatori, sfumatura, classifica, personale, deduplica, account/logout, risposte vecchie, aggiornamento, errori');
  }finally{await browser.close();}
 }}finally{await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
