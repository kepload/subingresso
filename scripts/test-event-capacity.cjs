// UI reali con backend simulato; le regole DB sono verificate separatamente in ROLLBACK.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const liveFetch=global.fetch;
const fixture=require('./test-organizer-events.cjs');
const {server,owner,other}=fixture;
let publishedAssets=null;
const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',placeId='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
function seed(){return {calls:[],profile:{user_id:owner,status:'approved',organization_name:'Organizzatore disponibilità QA',organization_type:'associazione',description:'Presentazione pubblica',contact_name:'Privato QA',private_phone:'+39 333 0000000',public_email:'qa@example.invalid',public_phone:'',website:'',revision:1},events:[{id,organizer_id:owner,title:'Fiera disponibilità di collaudo',description:'Un evento di collaudo per verificare disponibilità e posteggi senza creare dati reali.',category:'mercatino',city:'Milano',province:'Milano',region:'Lombardia',venue:'Piazza Duomo',latitude:45.46,longitude:9.19,start_date:'2027-11-06',end_date:'2027-11-07',hours:'9–19',sectors:['artigianato'],goods:'Manufatti',participation_rules:'Contatta l’organizzatore per presentare i documenti e partecipare.',application_deadline:null,status:'published',updated_at:'2026-10-20T12:00:00Z',revision:3,places:[{id:placeId,event_id:id,label:'Banco 3 × 3',quantity:5,price_cents:10000,active:true,external_reserved:2,confirmed:1,held:1,available:1,capacity_revision:1},{id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',event_id:id,label:'Banco grande',quantity:3,price_cents:15000,active:true,external_reserved:3,confirmed:0,held:0,available:0,capacity_revision:1},{id:'dddddddd-dddd-4ddd-8ddd-dddddddddddd',event_id:id,label:'Tipologia nascosta',quantity:100,price_cents:10,active:false,available:100,capacity_revision:1}]}]};}
async function run(engine,name,width,base){
 const db=seed();fixture.setDB(db);const browser=await engine.launch({headless:true});
 try{
  const context=await browser.newContext({viewport:{width,height:width===320?568:950}}),errors=[];
  await context.route('**/*',route=>{const url=new URL(route.request().url());if(url.origin!==base)return route.fulfill({status:200,body:''});let file=url.pathname.slice(1);if(['organizzatore','fiere'].includes(file))file+='.html';const body=publishedAssets?.get(file);return body?route.fulfill({body,contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8'}):route.continue();});
  let fail=false,publicApiFail=false;
  await context.route('**/qa/rpc',async route=>{
   const payload=route.request().postDataJSON();if(payload.name==='published_organizer_events'&&publicApiFail)return route.fulfill({json:{data:null,error:{message:'offline'}}});if(payload.name!=='set_event_capacity')return route.continue();
   const a=payload.args,p=db.events[0].places.find(p=>p.id===a.p_place_id);let error=null;
   if(fail){error='Connessione non disponibile. Riprova.';fail=false;}
   else if(a.p_revision!==p.capacity_revision)error='Disponibilità aggiornata da un’altra sessione. Ricarica e riprova.';
   else if(a.p_quantity<a.p_external_reserved+p.confirmed+p.held)error='Il massimo non può essere inferiore ai posti già assegnati o in pagamento.';
   else Object.assign(p,{quantity:a.p_quantity,external_reserved:a.p_external_reserved,available:a.p_quantity-a.p_external_reserved-p.confirmed-p.held,capacity_revision:p.capacity_revision+1});
   await route.fulfill({json:{data:error?null:p,error:error?{message:error}:null}});
  });
  const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/organizzatore');await page.locator('[data-event-edit]').click();
  await page.locator('#eventCapacity').waitFor({state:'visible'});
  assert.match(await page.locator('#eventCapacitySummary').innerText(),/1 posto disponibile su 8/);
  assert.equal(await page.locator('[data-capacity-place]').count(),2);
  const form=page.locator('[data-capacity-place="'+placeId+'"]');
  assert.match(await form.innerText(),/1 prenotati sul sito · 1 in pagamento/);
  await form.locator('[name=external_reserved]').fill('4');await form.getByRole('button').click();
  await page.waitForFunction(()=>document.querySelector('#eventCapacityMessage').textContent.includes('Il massimo non'));
  assert.equal(db.events[0].places[0].external_reserved,2);assert.equal(await form.locator('[name=external_reserved]').inputValue(),'4');
  await form.locator('[name=external_reserved]').fill('3');await form.getByRole('button').click();
  await page.waitForFunction(()=>document.querySelector('#eventCapacitySummary').textContent.includes('Sold out'));
  assert.equal(db.events[0].status,'published');assert.equal(db.events[0].revision,3);
  const pub=await context.newPage();pub.on('pageerror',e=>errors.push(e.message));
  await pub.goto(base+'/evento?id='+id);assert.match(await pub.locator('[data-event-inventory]').innerText(),/Sold out/);
  assert.doesNotMatch(await pub.locator('main').innerText(),/Tipologia nascosta/);
  await form.locator('[name=capacity]').fill('6');fail=true;await form.getByRole('button').click();
  await page.waitForFunction(()=>document.querySelector('#eventCapacityMessage').textContent.includes('Connessione non disponibile'));
  assert.equal(await form.locator('[name=capacity]').inputValue(),'6');assert.equal(await form.getByRole('button').isEnabled(),true);
  await form.getByRole('button').click();await page.waitForFunction(()=>document.querySelector('#eventCapacitySummary').textContent.includes('1 posto disponibile su 9'));
  await pub.evaluate(()=>window.dispatchEvent(new Event('focus')));await pub.waitForFunction(()=>document.querySelector('[data-event-inventory]').textContent.includes('1 posto disponibile su 9'));
  await pub.goto(base+'/fiere?regione=Lombardia&mesi=11&q=disponibilit');const card=pub.locator('[data-event-id="organizzatore-'+id+'"]');
  await card.waitFor();assert.match(await card.innerText(),/1 posto disponibile su 9/);await card.locator('.fiere-card-button').click();assert.match(await pub.locator('#detail-availability').innerText(),/1 posto disponibile su 9/);
  await form.locator('[name=external_reserved]').fill('4');await form.getByRole('button').click();await page.waitForFunction(()=>document.querySelector('#eventCapacitySummary').textContent.includes('Sold out'));
  await pub.evaluate(()=>window.dispatchEvent(new Event('focus')));await pub.waitForFunction(()=>document.querySelector('#detail-availability').textContent.includes('Sold out'));
  assert.match(await card.innerText(),/Sold out/);await pub.locator('#close-detail').click();
  await pub.goto(base+'/evento?id='+id);publicApiFail=true;await pub.evaluate(()=>window.dispatchEvent(new Event('focus')));await pub.locator('[data-availability-error]').waitFor();publicApiFail=false;
  await pub.evaluate(()=>window.dispatchEvent(new Event('focus')));await pub.locator('[data-availability-error]').waitFor({state:'detached'});
  // Una tipologia con modifiche conserva la bozza mentre si aggiorna l'altra.
  const second=page.locator('[data-capacity-place]').nth(1);await second.locator('[name=capacity]').fill('4');
  await form.locator('[name=capacity]').fill('7');await form.getByRole('button').click();await page.waitForFunction(()=>document.querySelector('#eventCapacityMessage').textContent.includes('Disponibilità aggiornata'));
  assert.equal(await second.locator('[name=capacity]').inputValue(),'4');
  for(const p of [page,pub])assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Overflow '+name+width);
  if(process.env.EVENT_QA_DIR){fs.mkdirSync(process.env.EVENT_QA_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.EVENT_QA_DIR,'capacity-owner-'+name+'-'+width+'.png'),fullPage:true});await page.locator('#eventCapacity').screenshot({path:path.join(process.env.EVENT_QA_DIR,'capacity-controls-'+name+'-'+width+'.png')});await pub.screenshot({path:path.join(process.env.EVENT_QA_DIR,'capacity-public-'+name+'-'+width+'.png'),fullPage:true});}
  db.events[0].status='draft';await pub.evaluate(()=>window.dispatchEvent(new Event('focus')));await pub.getByRole('heading',{name:'Partecipazione non disponibile'}).waitFor();
  assert.deepEqual(errors,[]);console.log('OK: '+name+' '+width+'px: massimo/esterni, sold out/riapertura, aggiornamenti pagina/calendario/dialog, errori/riprova, bozze multiple, ritiro, privacy e overflow.');
 }finally{await browser.close();}
}
(async()=>{
 if(process.env.CAPACITY_USE_PUBLISHED){publishedAssets=new Map();for(const file of ['organizzatore.html','fiere.html','js/event-data.js','js/organizzatori.js','js/event-availability.js','js/pages/fiere.js','css/eventi.css','css/fiere.css']){const response=await liveFetch('https://subingresso.it/'+file.replace(/\.html$/,''),{cache:'no-store'});assert.equal(response.status,200);const body=Buffer.from(await response.arrayBuffer());assert.equal(body.toString('utf8').replace(/\r\n/g,'\n'),fs.readFileSync(path.resolve(__dirname,'..',file),'utf8').replace(/\r\n/g,'\n'),file+' pubblicato diverso dal checkout');publishedAssets.set(file,body);}}
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));try{const base='http://127.0.0.1:'+server.address().port;for(const args of [[chromium,'Chromium',1440],[chromium,'Chromium',320],[webkit,'WebKit',390]])await run(...args,base);}finally{await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
