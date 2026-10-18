// Rete lenta, risposte fuori ordine, cambio account e usabilità. Solo fixture isolate.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const H=require('./test-organizer-events.cjs');
const id='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',secondId='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
function fixture(){return {profile:{user_id:H.owner,organization_name:'Organizzazione QA',organization_type:'associazione',description:'Organizzazione di mercatini per il collaudo.',contact_name:'REFERENTE PRIVATO QA',private_phone:'+39 333 1234567',public_email:'pubblico@example.invalid',public_phone:'',website:'',status:'approved',revision:2},events:[{id,organizer_id:H.owner,title:'Mercatino completo per le prove',description:'Un evento di collaudo con informazioni complete per tutti gli espositori.',category:'mercatino',region:'Lombardia',province:'Milano',city:'Milano',venue:'Piazza del mercato',start_date:'2027-11-06',end_date:'2027-11-07',hours:'9–19',sectors:['artigianato'],goods:'Artigianato locale',participation_rules:'Contattare l’organizzatore per domanda e documenti.',status:'draft',revision:2,review_note:'',updated_at:'2026-10-18T12:00:00Z',places:[{id:'cccccccc-cccc-4ccc-8ccc-cccccccccccc',label:'Banco 3 × 3 m',quantity:12,price_cents:10000,width_m:3,depth_m:3,description:'Corrente inclusa',active:true}]}],calls:[],failRPC:false,calendarFail:false,publicFail:false};}
const poll=async predicate=>{for(let i=0;i<100;i++){if(predicate())return;await new Promise(resolve=>setTimeout(resolve,20));}throw Error('Risposta simulata non ricevuta');};
async function run(engine,name,width,height,base){
 H.setDB(fixture());const browser=await engine.launch({headless:true}),result={browser:name,width,height};
 const pending=[],errors=[];let holdSaves=false,holdAdmin=false;
 try{
  const context=await browser.newContext({viewport:{width,height}});context.setDefaultTimeout(12000);
  await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.fulfill({status:200,body:''}));
  await context.route(base+'/qa/rpc',async route=>{
   const name=route.request().postDataJSON().name,response=await route.fetch();
   if((holdSaves&&name==='save_organizer_event')||(holdAdmin&&name==='admin_event_workspace'))await new Promise(release=>pending.push({name,release}));
   await route.fulfill({response});
  });
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  page.on('dialog',dialog=>dialog.message().includes('modifiche non salvate')?dialog.dismiss():dialog.accept());
  await page.goto(base+'/organizzatore');await page.locator('[data-event-edit]').click();
  await page.locator('#organizerEventForm[aria-busy=false]').waitFor();
  await page.waitForTimeout(500);
  result.editorHeadingVisible=await page.locator('#eventEditorTitle').evaluate(el=>el.getBoundingClientRect().top>=(document.querySelector('header')?.getBoundingClientRect().bottom||0));
  result.readinessSpecific=/Pronto per l’invio/.test(await page.locator('#eventSubmissionHint').innerText());
  if(process.env.EVENT_QA_DIR){fs.mkdirSync(process.env.EVENT_QA_DIR,{recursive:true});await page.locator('#eventPlacesEditor').screenshot({path:path.join(process.env.EVENT_QA_DIR,'invio-'+name+'-'+width+'.png')});}
  const title=page.locator('#organizerEventForm [name=title]');await title.fill('Titolo da salvare con rete lenta');holdSaves=true;
  const saveButton=page.getByRole('button',{name:'Salva bozza',exact:true});await saveButton.focus();await saveButton.press('Enter');await poll(()=>pending.some(p=>p.name==='save_organizer_event'));
  await title.evaluate(input=>input.focus());await page.keyboard.type(' MODIFICA DURANTE ATTESA');
  result.editsBlockedDuringSave=await title.inputValue()==='Titolo da salvare con rete lenta';
  holdSaves=false;pending.find(p=>p.name==='save_organizer_event').release();
  await page.getByText('Bozza salvata. Aggiungi o controlla i posteggi, poi invia l’evento in revisione.',{exact:true}).waitFor();
  await page.waitForFunction(()=>!document.querySelector('#organizerEventForm button[type=submit]').disabled);
  result.keyboardFocusRestored=await page.getByRole('button',{name:'Salva bozza',exact:true}).evaluate(el=>el===document.activeElement);
  result.saveFeedbackNearby=await page.getByText('Bozza salvata. Aggiungi o controlla i posteggi, poi invia l’evento in revisione.',{exact:true}).evaluate(el=>el.closest('#eventEditor')!==null);
  await page.reload();await page.locator('[data-event-edit]').click();await page.locator('#organizerEventForm[aria-busy=false]').waitFor();
  const copy=H.clone(H.getDB().events[0]);copy.id=secondId;copy.title='Secondo evento da ritirare';H.getDB().events.push(copy);
  await page.reload();await page.locator('[data-event-edit="'+id+'"]').click();await page.locator('#organizerEventForm[aria-busy=false]').waitFor();
  await title.fill('MODIFICA DA CONSERVARE');await page.locator('[data-event-cancel="'+secondId+'"]').click();
  result.unsavedChangesPreservedOnOtherWithdrawal=await title.inputValue()==='MODIFICA DA CONSERVARE'&&H.getDB().events.find(e=>e.id===secondId).status==='draft';
  await page.reload();
  const admin=await context.newPage();admin.on('pageerror',error=>errors.push(error.message));await admin.goto(base+'/qa/admin');await admin.locator('[data-admin-kind=event]').first().waitFor();
  H.getDB().events[0].title='Risposta precedente';holdAdmin=true;await admin.locator('#eventAdminRefresh').click();await poll(()=>pending.filter(p=>p.name==='admin_event_workspace').length===1);
  H.getDB().events[0].title='Risposta più recente';await admin.locator('#eventAdminRefresh').click();await poll(()=>pending.filter(p=>p.name==='admin_event_workspace').length===2);
  pending.filter(p=>p.name==='admin_event_workspace')[1].release();await admin.getByRole('heading',{name:'Risposta più recente',exact:true}).waitFor();
  pending.filter(p=>p.name==='admin_event_workspace')[0].release();await admin.waitForTimeout(80);
  result.latestAdminResponseWins=await admin.getByRole('heading',{name:'Risposta più recente',exact:true}).count()===1;
  holdAdmin=false;await admin.locator('#adminEventQueue [data-admin-id]').first().click();await admin.locator('#eventReviewDialog').waitFor({state:'visible'});
  result.dialogFitsViewport=await admin.locator('#eventReviewDialog').evaluate(el=>el.scrollWidth<=el.clientWidth+1);
  await admin.locator('#eventReviewClose').click();await admin.locator('#adminOrganizerDetails').evaluate(el=>el.open=true);await admin.locator('[data-admin-kind=organizer]').click();
  assert((await admin.locator('#eventReviewBody').innerText()).includes('REFERENTE PRIVATO QA'));
  holdAdmin=true;await admin.locator('#eventReviewClose').click();await admin.locator('#eventAdminRefresh').click();await poll(()=>pending.filter(p=>p.name==='admin_event_workspace').length===3);
  await admin.locator('[data-admin-kind=organizer]').click();
  await admin.evaluate(()=>{window.qaUser=null;window.qaAuth?.('SIGNED_OUT',null);});
  pending.filter(p=>p.name==='admin_event_workspace')[2].release();await admin.waitForTimeout(80);
  result.signOutClosesReview=await admin.locator('#eventReviewDialog').evaluate(el=>!el.open);
  result.signOutClearsPrivateData=!(await admin.locator('#eventReviewBody').textContent()).includes('REFERENTE PRIVATO QA')&&await admin.locator('[data-admin-id]').count()===0;
  holdAdmin=false;await admin.evaluate(id=>{window.qaUser={id};EventOrganizers.startAdmin(id);},H.admin);await admin.locator('[data-admin-kind=organizer]').waitFor({state:'attached'});
  const beforeRefresh=H.getDB().calls.filter(call=>call.name==='admin_event_workspace').length;await admin.locator('#eventAdminRefresh').click();await admin.locator('#eventAdminPanel[aria-busy=false]').waitFor();
  result.adminCanRestartWithoutDuplicateActions=H.getDB().calls.filter(call=>call.name==='admin_event_workspace').length===beforeRefresh+1;
  await admin.locator('#adminOrganizerDetails').evaluate(el=>el.open=true);await admin.locator('[data-admin-kind=organizer]').click();
  await admin.evaluate(id=>{window.qaUser={id};window.qaAuth('SIGNED_IN',{user:qaUser});},H.other);
  result.accountSwitchClearsReview=await admin.locator('#eventReviewDialog').evaluate(el=>!el.open)&&await admin.locator('[data-admin-id]').count()===0&&await admin.locator('#eventReviewBody').textContent()==='';
  result.noOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
  result.uniqueIds=await page.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);return ids.length===new Set(ids).size;});
  result.labelsPresent=await page.locator('#organizerWorkspace input,#organizerWorkspace select,#organizerWorkspace textarea').evaluateAll(inputs=>inputs.every(input=>input.labels.length>0));
  result.touchTargets=await page.locator('#organizerWorkspace button').evaluateAll(buttons=>buttons.filter(button=>button.getClientRects().length).every(button=>button.getBoundingClientRect().height>=44));
  result.noPageErrors=errors.length===0;
  console.log(JSON.stringify(result));return result;
 }finally{for(const p of pending)p.release();await browser.close();}
}
(async()=>{
 await new Promise(resolve=>H.server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+H.server.address().port,results=[];
 try{for(const [engine,name,width,height]of [[chromium,'Chromium',1440,950],[chromium,'Chromium',820,1000],[chromium,'Chromium',320,568],[webkit,'WebKit',390,844]]){if(process.env.EVENT_TEST_WIDTH&&Number(process.env.EVENT_TEST_WIDTH)!==width)continue;results.push(await run(engine,name,width,height,base));}
  const report={at:new Date().toISOString(),results};if(process.env.EVENT_QA_DIR){fs.mkdirSync(process.env.EVENT_QA_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.EVENT_QA_DIR,'experience-'+(process.env.EVENT_AUDIT_OBSERVE?'before':'after')+'.json'),JSON.stringify(report,null,2));}
  if(!process.env.EVENT_AUDIT_OBSERVE)for(const result of results)for(const[key,value]of Object.entries(result))if(typeof value==='boolean')assert.equal(value,true,result.browser+' '+result.width+' '+key);
 }finally{await new Promise(resolve=>H.server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;H.server.close();});
