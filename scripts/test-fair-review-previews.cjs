// Public aggregate and actual calendar UI, with isolated review fixtures.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),handler=require('../api/saved-fairs'),{events}=require('../api/_fiere');
const nativeFetch=global.fetch;
let fail=false,calls=0;
global.fetch=async(url,options={})=>{
 if(url.endsWith('/read_fair_review_summaries')){
  calls++;const {p_fairs}=JSON.parse(options.body);
  if(fail)return {ok:false,status:503,json:async()=>({code:'XX000'})};
  return {ok:true,status:200,json:async()=>p_fairs.map(f=>({...f,count:f.id.includes('card-expo-italia')?2:0,average:f.id.includes('card-expo-italia')?4.5:null}))};
 }
 if(url.endsWith('/read_fair_reviews'))return {ok:true,status:200,json:async()=>({count:0,average:null,reviews:[]})};
 if(url.endsWith('/published_organizer_events'))return {ok:true,status:200,json:async()=>[]};
 return nativeFetch(url,options);
};
async function invoke(query,method='GET'){let status=200,body;await handler({method,query,headers:{}},{setHeader(){},status(n){status=n;return this;},json(data){body=data;}});return {status,body};}
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/saved-fairs'){const result=await invoke(Object.fromEntries(url.searchParams));res.writeHead(result.status,{'Content-Type':'application/json'});return res.end(JSON.stringify(result.body));}
 const file=path.resolve(root,'.'+(url.pathname==='/fiere'?'/fiere.html':url.pathname));
 if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
 fs.readFile(file,(e,data)=>{if(e)return res.writeHead(404).end();res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.woff2':'font/woff2','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(data);});
});
(async()=>{
 const sample=events.find(e=>e.name==='Card Expo Italia');assert(sample);
 const get=fairs=>invoke({reviews:'1',summary:'1',fairs:JSON.stringify(fairs)});
 assert.equal((await get([{kind:'catalog',id:sample.id}])).body[0].average,4.5);
 for(const fairs of [[],null,Array(51).fill({kind:'catalog',id:sample.id}),[{kind:'catalog',id:'missing'}],[{kind:'organizer',id:'invalid'}],[{kind:'catalog',id:{}}]])assert.equal((await get(fairs)).status,400);
 assert.equal((await invoke({reviews:'1',summary:'1',fairs:'{'})).status,400);
 fail=true;assert.equal((await get([{kind:'catalog',id:sample.id}])).status,503);fail=false;
 const old=JSON.parse(require('node:child_process').execFileSync('git',['show','31f225d:data/fiere.json'],{cwd:root,encoding:'utf8',maxBuffer:30e6}));
 const current=JSON.parse(fs.readFileSync(path.join(root,'data/fiere.json'),'utf8'));
 const oldEvents=old.events,now=new Map(current.events.map(e=>[e.id,e]));
 for(const event of oldEvents)assert.deepEqual(now.get(event.id),event,'Existing fair changed: '+event.id);
 assert.equal(now.size,oldEvents.length+3);
 for(const name of ['Card Expo Italia','Florence Cards Show','TCG Nexus Convention','CardFest Napoli'])assert.equal(current.events.filter(e=>e.name===name).length,1);
 console.log('PASS API: bounded batches, invalid IDs/JSON, error handling; all '+oldEvents.length+' previous fairs unchanged, three new fairs, no CardFest duplicate');
 const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=process.env.FAIR_PREVIEWS_BASE_URL||'http://127.0.0.1:'+server.address().port;
 const out=path.join(root,'.local/verifiche/anteprime-tcg');fs.mkdirSync(out,{recursive:true});
 for(const [engine,width] of [['chromium',1440],['chromium',768],['chromium',320],['webkit',390]]){
  const browser=await pw[engine].launch({headless:true});
  try{
   const page=await browser.newPage({viewport:{width,height:900}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({reducedMotion:'reduce'});
   await page.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'text/javascript',body:'window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}})},rpc:async()=>({data:[]}),from:()=>({select(){return this},eq(){return this},order(){return this},limit(){return this},then(fn){return Promise.resolve({data:[]}).then(fn)}})})};'});
    if(url.pathname==='/api/saved-fairs'&&url.searchParams.has('summary')&&process.env.FAIR_PREVIEWS_BASE_URL){const result=await invoke(Object.fromEntries(url.searchParams));return route.fulfill({status:result.status,json:result.body});}
    if(url.pathname.endsWith('/published_organizer_events'))return route.fulfill({json:[]});
    if(['cdnjs.cloudflare.com','fonts.googleapis.com','fonts.gstatic.com'].includes(url.hostname))return route.continue();
    return url.origin===new URL(base).origin?route.continue():route.abort();
   });
   await page.goto(base+'/fiere');await page.locator('.fiere-card').first().waitFor();
   await page.locator('#extra-filters > summary').click();
   await page.locator('#fair-search').fill('Card Expo');
   const card=page.locator('.fiere-card').filter({hasText:'Card Expo Italia'});await card.waitFor();
   const reviews=card.locator('[data-review-summary]');await reviews.locator('.fiere-review-average').filter({hasText:'4,5'}).waitFor();
   assert.equal(await reviews.locator('.fiere-review-star').count(),5);
   assert.deepEqual(await reviews.locator('.fiere-review-star-fill').evaluateAll(nodes=>nodes.map(e=>e.style.width)),['100%','100%','100%','100%','50%']);
   await reviews.click();await page.locator('#detail-reviews').waitFor({state:'visible'});assert(await page.locator('#fair-dialog').evaluate(e=>e.open));
   await page.waitForFunction(()=>{const r=document.querySelector('#detail-reviews h2').getBoundingClientRect();return r.top>=0&&r.bottom<innerHeight;});
   assert.equal(await page.locator('#detail-reviews').evaluate(e=>document.activeElement===e),true);
   await page.keyboard.press('Escape');
   await page.locator('#fair-search').fill('Florence Cards');
   const empty=page.locator('.fiere-card').filter({hasText:'Florence Cards Show'});await empty.locator('[data-review-summary]').filter({hasText:'Scrivi la prima recensione'}).waitFor();
   assert.equal(await empty.locator('.fa-star').count(),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.locator('#fair-search').fill('pokemon');await card.waitFor();
   await card.locator('.fiere-review-average').filter({hasText:'4,5'}).waitFor();
   await page.route('**/api/saved-fairs?reviews=1&summary=1&fairs=*',async route=>{
    const fairs=JSON.parse(new URL(route.request().url()).searchParams.get('fairs'));
    return route.fulfill({json:fairs.map(f=>({...f,count:1,average:4}))});
   });
   await page.reload();await card.locator('.fiere-review-average').filter({hasText:'4,0'}).waitFor();
   assert.deepEqual(await card.locator('.fiere-review-star-fill').evaluateAll(nodes=>nodes.map(e=>e.style.width)),['100%','100%','100%','100%','0%']);
   assert.equal(await card.locator('.fiere-review-count').textContent(),'1 recensione');
   await page.evaluate(()=>scrollTo(0,0));await page.evaluate(()=>document.fonts.ready);
   await page.screenshot({path:path.join(out,engine+'-'+width+'.png'),fullPage:true});
   await page.evaluate(()=>document.documentElement.classList.add('admin-dark'));
   await page.waitForFunction(()=>getComputedStyle(document.querySelector('[data-review-summary]')).color==='rgb(147, 197, 253)');
   await page.screenshot({path:path.join(out,engine+'-'+width+'-dark.png'),fullPage:true});
   assert.deepEqual(errors,[]);
   console.log('PASS '+engine+' '+width+': aggregate/zero, direct reviews, Pokémon search, no overflow/errors, light/dark screenshots');
  }finally{await browser.close();}
 }
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{global.fetch=nativeFetch;server.close();});
