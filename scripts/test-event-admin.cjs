// Interfaccia reale, API simulate: nessuna modifica ad account o eventi reali.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const H=require('./test-organizer-events.cjs');
const out=process.env.EVENT_ADMIN_QA_DIR;
function workspace(){
 const organizers=Array.from({length:11},(_,i)=>({user_id:'org-'+i,organization_name:'Organizzatore '+i,organization_type:'associazione',status:i===0?'pending':'approved',description:'Organizzazione per le prove.',contact_name:'REFERENTE PRIVATO QA',private_phone:'+39 333 1234567',revision:1}));
 const events=Array.from({length:19},(_,i)=>({id:'event-'+i,organizer_id:'org-0',title:i===0?'Fiera <img src=x onerror="window.qaXSS=true">':'Fiera '+i,organization_name:'Organizzatore 0',organizer_status:'approved',city:i===1?'Forlì':'Milano',province:'Milano',region:'Lombardia',status:i<3?'pending':i<8?'draft':'published',start_date:'2027-11-06',end_date:'2027-11-07',description:'Evento completo per le prove.',sectors:['artigianato'],places:[],revision:1}));
 return {organizers,events};
}
async function run(engine,name,width,base){
 let data=workspace(),fail=false,calls=0;
 const browser=await engine.launch({headless:true}),page=await browser.newPage({viewport:{width,height:950}}),errors=[];
 const checks=[];const check=(ok,label)=>{assert(ok,label);checks.push(label);};
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.fulfill({status:200,body:''}));
 await page.route(base+'/qa/rpc',route=>{const {name}=route.request().postDataJSON();assert.equal(name,'admin_event_workspace');calls++;return route.fulfill({json:fail?{error:{message:'Connessione non disponibile. Riprova.'}}:{data}});});
 const loaded=()=>page.locator('#eventAdminPanel[aria-busy=false]').waitFor();
 const refresh=async()=>{await page.locator('#eventAdminRefresh').click();await loaded();};
 try{
  await page.goto(base+'/qa/admin');await loaded();
  check(!await page.locator('#eventAdminWorkspace').evaluate(el=>el.open),'Elenco chiuso all’ingresso');
  check(await page.locator('#eventAdminPanel').evaluate(el=>el.getBoundingClientRect().height<140),'Riepilogo compatto sotto 140px');
  check((await page.locator('#eventAdminSummary').innerText()).includes('1 profilo e 3 eventi in revisione'),'Richieste visibili nel riepilogo chiuso');
  if(out)await page.locator('#eventAdminPanel').screenshot({path:path.join(out,`${name}-${width}-chiuso.png`)});
  await page.locator('#eventAdminWorkspace>summary').click();
  check(await page.locator('.ea-row').count()===6,'Massimo sei righe per pagina');
  check(await page.locator('#eventAdminPageInfo').innerText()==='1–6 di 19','Totale e intervallo visibili');
  check(await page.locator('#eventAdminPanel img').count()===0 && !await page.evaluate(()=>window.qaXSS),'Titoli trattati come testo');
  check(await page.locator('.ea-row .ev-status').first().innerText()==='In revisione','Revisione prima delle bozze');
  await page.locator('#eventAdminNext').click();
  check(await page.locator('#eventAdminPageInfo').innerText()==='7–12 di 19','Pagina successiva');
  await refresh();check(await page.locator('#eventAdminPageInfo').innerText()==='7–12 di 19','Aggiornamento conserva pagina');
  await page.locator('#eventAdminSearch').fill('forli');
  check(await page.locator('.ea-row').count()===1 && (await page.locator('.ea-row').innerText()).includes('Forlì'),'Ricerca per luogo senza accenti');
  await page.locator('#eventAdminFilter').selectOption('draft');
  check((await page.locator('#adminEventQueue').innerText()).includes('Nessun risultato'),'Filtri combinati e stato vuoto');
  await page.locator('#eventAdminSearch').fill('');
  check(await page.locator('.ea-row').count()===5,'Filtro bozze');
  await page.locator('[data-admin-id]').first().click();
  check(!await page.locator('#eventApprove').isVisible() && (await page.locator('#eventReviewBody').innerText()).includes('non ancora inviata'),'Dettaglio bozza senza approvazione');
  await page.locator('#eventReviewClose').click();
  await page.locator('#adminOrganizerTab').click();
  check(await page.locator('#eventAdminFilter').inputValue()==='all','Stato incompatibile azzerato cambiando scheda');
  check(await page.locator('.ea-row').count()===6 && !await page.locator('#adminEventDetails').isVisible(),'Una sola lista di organizzatori visibile');
  await page.locator('#eventAdminSearch').fill('Organizzatore 10');
  check(await page.locator('.ea-row').count()===1,'Ricerca organizzatore');
  await page.locator('[data-admin-id]').click();
  check((await page.locator('#eventReviewBody').innerText()).includes('REFERENTE PRIVATO QA'),'Dati completi nel solo dettaglio');
  await page.locator('#eventReviewClose').click();
  check(!(await page.locator('#eventAdminPanel').innerText()).includes('REFERENTE PRIVATO QA'),'Dati privati assenti dalle righe');
  await page.locator('#eventAdminSearch').fill('');
  await page.locator('#adminOrganizerTab').focus();await page.keyboard.press('Home');
  check(await page.locator('#adminEventTab').getAttribute('aria-selected')==='true','Navigazione schede da tastiera');
  await page.locator('#eventAdminFilter').selectOption('published');
  fail=true;await refresh();
  check(await page.locator('#eventAdminMessage').isVisible() && await page.locator('.ea-row').count()===6,'Errore visibile e dati precedenti conservati');
  fail=false;await refresh();
  check(!await page.locator('#eventAdminMessage').isVisible() && await page.locator('#eventAdminFilter').inputValue()==='published','Ripresa conserva filtro');
  if(out)await page.locator('#eventAdminPanel').screenshot({path:path.join(out,`${name}-${width}-aperto.png`)});
  await page.locator('#eventAdminWorkspace>summary').click();await page.evaluate(()=>EventOrganizers.startAdmin());
  check(!await page.locator('#eventAdminWorkspace').evaluate(el=>el.open),'Riepilogo rimane chiuso');
  await page.locator('#eventAdminWorkspace>summary').click();
  data.events=[];await refresh();
  check(await page.locator('#eventAdminNext').isDisabled() && await page.locator('#eventAdminPrevious').isDisabled(),'Dati ridotti riallineano la pagina');
  check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Nessun overflow');
  const ids=await page.locator('[id]').evaluateAll(els=>els.map(el=>el.id));check(new Set(ids).size===ids.length,'ID univoci');
  fail=true;await page.reload();await loaded();
  check((await page.locator('#eventAdminSummary').innerText()).includes('Caricamento non riuscito'),'Errore iniziale riconoscibile anche a pannello chiuso');
  await page.locator('#eventAdminWorkspace>summary').click();fail=false;await refresh();
  check(await page.locator('#adminOrganizerTab').getAttribute('aria-selected')==='true','Riprova ripristina dati e scheda con richieste');
  await page.locator('#adminOrganizerTab').click();await page.locator('[data-admin-id]').first().click();
  await page.evaluate(()=>{qaUser=null;qaAuth('SIGNED_OUT',null);});
  check(await page.locator('[data-admin-id]').count()===0 && await page.locator('#eventReviewBody').innerText()==='' && !await page.locator('#eventReviewDialog').isVisible(),'Logout pulisce liste e revisione');
  check(errors.length===0,'Nessun errore JavaScript: '+errors.join('; '));
  console.log(`OK: ${name} ${width}px, ${checks.length} controlli pannello fiere (${calls} letture simulate)`);
  return {name,width,checks};
 }finally{await browser.close();}
}
(async()=>{
 if(out)fs.mkdirSync(out,{recursive:true});
 if(process.env.EVENT_ADMIN_USE_PUBLISHED)for(const file of ['dashboard.html','css/event-admin.css','js/organizzatori.js','js/profile-switch.js']){
  const response=await fetch('https://subingresso.it/'+file.replace(/\.html$/,''),{cache:'no-store'});assert.equal(response.status,200);
  assert.equal((await response.text()).replace(/\r\n/g,'\n'),fs.readFileSync(path.join(__dirname,'..',file),'utf8').replace(/\r\n/g,'\n'),file+' pubblicato diverso');
 }
 await new Promise(resolve=>H.server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+H.server.address().port,results=[];
 try{for(const [engine,name,width] of [[chromium,'Chromium',1440],[chromium,'Chromium',320],[webkit,'WebKit',390]])results.push(await run(engine,name,width,base));}
 finally{await new Promise(resolve=>H.server.close(resolve));}
 if(out)fs.writeFileSync(path.join(out,'pannello.json'),JSON.stringify({at:new Date().toISOString(),results},null,2));
})().catch(error=>{console.error(error);H.server.close();process.exitCode=1;});
