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
   const names=()=>page.locator('#homeLocationShortcuts a:visible').allTextContents();
   const personalA=width<600||width>=1024?['Brescia','Milano','Trento','Verona']:['Brescia','Milano','Trento'];
   assert.deepEqual(await names(),['Milano','Trento','Verona']);
   const layout=await page.evaluate(()=>{const search=document.querySelector('.home-search').getBoundingClientRect(),stats=document.querySelector('.home-stats').getBoundingClientRect(),list=document.querySelector('.home-listings').getBoundingClientRect();return{between:stats.top>=search.bottom&&stats.bottom<=list.top,gradient:getComputedStyle(document.querySelector('.home-stats-section')).backgroundImage,unique:['statListings','statValue','statUsers'].every(id=>document.querySelectorAll('#'+id).length===1),width:document.documentElement.scrollWidth};});
   assert(layout.between&&layout.unique&&layout.gradient.includes('linear-gradient'));assert(layout.width<=width);
   assert.equal(await page.locator('#statListings').textContent(),'1.591');assert.equal(await page.locator('#statValue').textContent(),'€ 15.1M');assert.equal(await page.locator('#statUsers').textContent(),'4.045');
   assert(await page.locator('#statValue').evaluate(el=>{const range=document.createRange();range.selectNodeContents(el);return range.getClientRects().length===1&&range.getBoundingClientRect().width<=el.parentElement.clientWidth+.5;}),'Importo intero su una riga, anche a 320px');
   const href=await page.locator('#homeLocationShortcuts a').first().getAttribute('href');assert(href.includes('comune=015146')&&href.includes('q=Milano'));
   if(artifacts)await page.screenshot({path:path.join(artifacts,`${name}-${width}-anonimo.png`)});
   await page.evaluate(()=>LocationShortcuts.remember(qaPlaces[3]));assert.deepEqual(await names(),['Milano','Trento','Verona']);
   await page.evaluate(async()=>{localStorage.setItem('_sub_searches','["Ricerca di un altro visitatore"]');qaSwitch('account-A');await LocationShortcuts.remember(qaPlaces[3]);});
   assert.deepEqual(await names(),personalA);assert.equal(await page.locator('#homeLocationShortcuts a').first().getAttribute('aria-label'),'Brescia, la tua ultima ricerca');
   if(artifacts)await page.screenshot({path:path.join(artifacts,`${name}-${width}-personale.png`)});
   await page.evaluate(()=>qaSwitch('account-B'));assert.deepEqual(await names(),['Milano','Trento','Verona']);
   await page.evaluate(()=>LocationShortcuts.remember(qaPlaces[2]));assert.deepEqual(await names(),['Verona','Milano','Trento']);
   await page.evaluate(()=>qaSwitch('account-A'));assert.deepEqual(await names(),personalA);
   // Una risposta della sessione precedente non salva la località sul nuovo account.
   await page.evaluate(async()=>{qaDelay=30;const pending=LocationShortcuts.remember(qaPlaces[4]);qaSwitch('account-B');await pending;qaDelay=0;});
   assert.deepEqual(await names(),['Verona','Milano','Trento']);await page.evaluate(()=>qaSwitch('account-A'));assert.deepEqual(await names(),personalA);
   await page.evaluate(()=>qaSwitch(null));assert.deepEqual(await names(),['Milano','Trento','Verona']);
   // La classifica viene riletta tornando alla pagina dopo cinque minuti.
   await page.evaluate(()=>{qaPopular=[qaPlaces[4],qaPlaces[3],qaPlaces[0]];const original=Date.now;Date.now=()=>original()+301000;document.dispatchEvent(new Event('visibilitychange'));});
   await page.waitForFunction(()=>document.querySelector('#homeLocationShortcuts a').textContent==='Bergamo');assert.deepEqual(await names(),['Bergamo','Brescia','Milano']);
   await page.evaluate(async()=>{qaSwitch('account-A');const original=Storage.prototype.setItem;Storage.prototype.setItem=()=>{throw Error('bloccato');};await LocationShortcuts.remember(qaPlaces[4]);Storage.prototype.setItem=original;});assert.deepEqual(await names(),['Brescia','Bergamo','Milano']);
   // Più candidati: una riga su telefono e desktop; tablet conserva tre link.
   await page.evaluate(()=>{
    qaSwitch(null);
    qaPlaces.push(...[['Roma','058091'],['Pisa','050026'],['Como','013075'],['Bari','072006'],['Torino','001272'],['Genova','010025'],['Firenze','048017']].map(([nome,id])=>({nome,id,regione:'Prova',provincia:'Prova'})));
    qaPopular=qaPlaces.slice(0,12);const now=Date.now;Date.now=()=>now()+301000;document.dispatchEvent(new Event('visibilitychange'));
   });
   await page.waitForFunction(()=>document.querySelectorAll('#homeLocationShortcuts a').length===12);
   await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(50);
   const row=await page.locator('#homeLocationShortcuts').evaluate(el=>{const r=el.getBoundingClientRect(),links=[...el.querySelectorAll('a')].filter(a=>!a.hidden);return{height:r.height,count:links.length,inside:links.every(a=>{const b=a.getBoundingClientRect();return Math.abs(b.top-r.top)<1&&b.right<=r.right+.5;}),overflow:document.documentElement.scrollWidth>innerWidth};});
   assert(row.inside&&!row.overflow&&row.height<=33);assert(width<600||width>=1024?row.count>3:row.count===3);
   if(artifacts)await page.screenshot({path:path.join(artifacts,`${name}-${width}-riga-completa.png`)});
   if(width>=1024){
    await page.setViewportSize({width:1023,height:1000});await page.waitForTimeout(80);assert.equal((await names()).length,3);
    await page.setViewportSize({width:1024,height:1000});await page.waitForTimeout(80);assert((await names()).length>3);
    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.setViewportSize({width,height:1000});await page.waitForTimeout(80);
   }
   if(width<600){
    await page.setViewportSize({width:430,height:1000});await page.waitForTimeout(80);const wide=(await names()).length;
    await page.setViewportSize({width:320,height:1000});await page.waitForTimeout(80);assert((await names()).length<=wide);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.evaluate(async()=>{qaSwitch('account-A');const p={...qaPlaces[0],nome:'San Giovanni '+ 'Borgo '.repeat(25)};await LocationShortcuts.remember(p);});
    assert.equal((await names()).length,1);assert(await page.locator('#homeLocationShortcuts a:first-child .home-shortcut-name').evaluate(el=>el.scrollWidth>el.clientWidth));
    assert(await page.locator('#homeLocationShortcuts').evaluate(el=>el.getBoundingClientRect().height<=33));
   }
   await page.goto(`http://127.0.0.1:${server.address().port}/fixture?fail`);await page.waitForFunction(()=>qaCalls===1);assert.equal(await page.locator('#homeLocationShortcuts').isVisible(),false);
   assert.deepEqual(errors,[]);console.log('PASS',name,width,'ordine contatori, sfumatura, classifica, personale, deduplica, account/logout, risposte vecchie, aggiornamento, errori');
  }finally{await browser.close();}
 }}finally{await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
