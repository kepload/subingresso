// HTML, selettore e salvataggio reali; sessioni/RPC simulati, nessun account modificato.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const nativeFetch = global.fetch;
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const H = require('./test-organizer-events.cjs');
const root = path.resolve(__dirname, '..'), artifacts = process.env.PROFILE_QA_DIR;
const files = ['dashboard.html', 'organizzatore.html', 'profilo.html', 'css/profile-switch.css', 'js/profile-switch.js', 'js/organizzatori.js'];
let assets = new Map(files.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
function fixture() {
    const html = assets.get('dashboard.html');
    const modalFunctions = html.slice(html.indexOf('let _profilePhoneBound = false;'), html.indexOf('function showDeleteAccountConfirm()'));
    const saveFunction = html.slice(html.indexOf('async function saveProfile(e)'), html.indexOf('// ── Custom Confirm Dialog'));
    const returnToProfile = html.slice(html.indexOf('    ProfileSwitcher.setBaseline();'), html.indexOf('    loadOnboardingWidget(user, profile);'));
    assert(modalFunctions.includes('ProfileSwitcher.open(_currentUser,'));
    assert(saveFunction.includes('ProfileSwitcher.setBaseline(profileSnapshot)'));
    return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace('</body>', `<script>
window.qaUser={id:'${H.owner}',email:'qa@example.invalid',created_at:'2026-01-01',email_confirmed_at:'2026-01-01',app_metadata:{provider:'email'}};
let _currentUser=qaUser,_profileReady=true;const user=qaUser;window.qaListeners=[];window.qaWrites=[];window.qaFailSave=false;window.qaSaveDelay=0;window.qaIsAdmin=new URLSearchParams(location.search).has('admin');
const _supabase={auth:{getUser:async()=>({data:{user:qaUser}}),onAuthStateChange:fn=>{qaListeners.push(fn);return{data:{subscription:{unsubscribe(){}}}}},resetPasswordForEmail:async()=>({})},
rpc(name,args){const promise=fetch('/qa/rpc',{method:'POST',headers:{'X-QA-User':qaUser?.id||''},body:JSON.stringify({name,args})}).then(r=>r.json());promise.abortSignal=()=>promise;return promise;},
from:table=>({filters:[],upsert(value){qaWrites.push({table,value});return this;},select(columns,options){this.columns=columns;this.options=options;return this;},eq(key,value){this.filters.push([key,value]);return this;},or(filter){this.orFilter=filter;return this;},abortSignal(signal){if(table==='profiles')return this;return fetch('/qa/listing-count',{signal,method:'POST',body:JSON.stringify({table,columns:this.columns,options:this.options,filters:this.filters,or:this.orFilter})}).then(r=>r.json());},single:async()=>{await new Promise(resolve=>setTimeout(resolve,qaSaveDelay));return qaFailSave?{error:{message:'offline'}}:{data:{id:qaUser.id,is_admin:qaIsAdmin}};}})};
window.updateAuthNav=()=>{};window.signOut=()=>{};
</script><script src="/js/data.js?v=21"></script><script src="/js/ui-components.js?v=15"></script><script src="/js/event-data.js?v=1"></script><script src="/js/vetrina-account.js?v=2"></script><script src="/js/organizzatori.js?v=9"></script><script src="/js/profile-switch.js?v=5"></script><script>
${modalFunctions}
${saveFunction}
loadingState.classList.add('hidden');dashContent.classList.remove('hidden');
pNome.value='Nome QA';pCognome.value='Cognome QA';pTelefono.value='+39 333 1234567';pEmailDigest.checked=true;pEmailStats.checked=false;
VetrinaAccount.fillProfile(_currentUser);
${returnToProfile}
</script></body>`);
}
const state = () => ({profile:null,events:[],listings:[],calls:[],failRPC:false,calendarFail:false,publicFail:false,failCount:false});
const profile = status => ({user_id:H.owner,organization_name:'Mercatini QA',organization_type:'associazione',description:'Organizziamo fiere di artigianato a Milano.',public_email:'eventi@example.invalid',public_phone:'+39 333 7654321',website:'https://example.invalid/eventi',status,review_note:'',private_phone:'PRIVATO NON MOSTRARE',contact_name:'REFERENTE PRIVATO NON MOSTRARE',revision:1});
const waitFor = async predicate => { for(let i=0;i<150;i++){if(predicate())return;await new Promise(resolve=>setTimeout(resolve,20));}throw Error('Risposta simulata mancante'); };
async function run(engine,name,width,height,base) {
    H.setDB(state());
    const browser=await engine.launch({headless:true}), context=await browser.newContext({viewport:{width,height},hasTouch:true});
    const errors=[], pending=[];let hold=false;
    const result={browser:name,width,height,checks:[]};
    const check=(condition,label)=>{assert(condition,label);result.checks.push(label);};
    context.setDefaultTimeout(10000);
    await context.route('**/*',async route=>{
        const url=new URL(route.request().url());
        if(url.origin!==base)return process.env.PROFILE_VISUAL?route.continue():route.fulfill({status:200,body:''});
        if(url.pathname==='/dashboard')return route.fulfill({contentType:'text/html',body:fixture()});
        if(url.pathname==='/organizzatore')return route.fulfill({contentType:'text/html',body:assets.get('organizzatore.html')});
        if(url.pathname==='/js/data.js')return route.fulfill({contentType:'text/javascript',body:fs.readFileSync(path.join(root,'js/data.js'),'utf8')});
        if(assets.has(url.pathname.slice(1)))return route.fulfill({contentType:url.pathname.endsWith('.css')?'text/css':'text/javascript',body:assets.get(url.pathname.slice(1))});
        if(url.pathname==='/qa/listing-count'){
            const query=route.request().postDataJSON();
            assert.equal(query.table,'annunci');assert.equal(query.columns,'id');assert.deepEqual(query.options,{count:'exact',head:true});
            assert.deepEqual(query.filters,[['user_id',H.owner],['status','active']]);assert.match(query.or,/^expires_at.is.null,expires_at.gte.\d{4}-/);
            const db=H.getDB(),now=Date.parse(query.or.split('gte.')[1]);
            const count=db.listings.filter(l=>l.user_id===H.owner&&l.status==='active'&&(!l.expires_at||Date.parse(l.expires_at)>=now)).length;
            return route.fulfill({json:db.failCount?{error:{message:'offline'},count:null}:{count,error:null}});
        }
        if(url.pathname==='/qa/rpc' && route.request().postDataJSON().name==='organizer_workspace' && hold){
            const response=await route.fetch();await new Promise(release=>pending.push(release));return route.fulfill({response});
        }
        return route.continue();
    });
    const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
    const open=async()=>{await page.locator('.dashboard-user button').click();await page.locator('#profileNormalPanel').waitFor({state:'visible'});};
    const normal=page.locator('#profileNormalTab'),organizer=page.locator('#profileOrganizerTab');
    const ready=async()=>page.waitForFunction(()=>document.querySelector('#profileOrganizerContent').getAttribute('aria-busy')==='false');
    try {
        await page.goto(base+'/dashboard');await open();
        check(await normal.getAttribute('aria-selected')==='true' && !await page.locator('#profileOrganizerPanel').isVisible(),'Normale predefinito');
        check(await normal.innerText()==='Ambulante' && await page.locator('#profileDialogTitle').innerText()==='Profilo ambulante','Nome Ambulante nel profilo e nello switch');
        check(H.getDB().calls.length>=1 && H.getDB().calls.every(call=>call.name==='organizer_workspace') && await page.evaluate(()=>qaWrites.length===0),'Scelta iniziale dai dati attuali in sola lettura');
        check(await page.locator('.profile-dialog').evaluate(el=>getComputedStyle(el).backgroundColor)==='rgb(255, 255, 255)','Profilo normale con colori chiari');
        await page.evaluate(()=>ProfileSwitcher.startDashboard(qaUser));
        check(await page.locator('#profileNormalPanel').isVisible(),'Inizializzazione tardiva della dashboard rispetta il profilo gia aperto');
        const geometry=await page.locator('#profileSwitch').evaluate(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,buttons:[...el.querySelectorAll('button')].map(b=>b.getBoundingClientRect().height)}));
        check(geometry.width<=360 && geometry.height<=56 && geometry.buttons.every(height=>height>=44),'Selettore compatto con pulsanti comodi da toccare');
        check(await normal.evaluate(el=>getComputedStyle(el).fontFamily===getComputedStyle(document.body).fontFamily),'Font coerente con il sito');
        const top=await normal.evaluate(el=>el.getBoundingClientRect().top);
        await page.locator('.profile-panels').evaluate(el=>el.scrollTop=1000);
        check(await normal.evaluate(el=>el.getBoundingClientRect().top)===top,'Selettore sempre visibile durante lo scorrimento');
        await page.locator('.profile-panels').evaluate(el=>el.scrollTop=0);
        await page.locator('#pNome').fill('Nome modificato QA');await page.locator('#pEmailDigest').uncheck();
        await organizer.click();await ready();
        check(await page.locator('.profile-dialog').evaluate(el=>getComputedStyle(el).backgroundColor)==='rgb(15, 23, 42)' && await page.locator('#profileDialogTitle').innerText()==='Profilo organizzatore','Colori scuri e titolo distinguono la modalita organizzatore');
        check(await page.getByRole('link',{name:'Crea profilo organizzatore'}).isVisible(),'Nuovo organizzatore: attivazione separata con lo stesso account');
        check(H.getDB().calls.every(call=>call.name==='organizer_workspace') && await page.evaluate(()=>qaWrites.length===0),'Cambio scheda in sola lettura');
        await normal.click();
        check(await page.locator('#pNome').inputValue()==='Nome modificato QA' && !await page.locator('#pEmailDigest').isChecked(),'Dati e preferenze conservati tra le schede');
        await normal.focus();await page.keyboard.press('ArrowRight');await ready();
        check(await organizer.evaluate(el=>el===document.activeElement),'Frecce spostano selezione e focus');
        await page.keyboard.press('Home');check(await normal.getAttribute('aria-selected')==='true','Home torna al profilo normale');
        await page.keyboard.press('End');await ready();await page.keyboard.press('ArrowRight');
        check(await normal.getAttribute('aria-selected')==='true','End e ritorno circolare da tastiera');
        const swipe=async(dx,dy=0)=>normal.evaluate((el,{dx,dy})=>{
            const track=el.parentElement;track.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'touch',isPrimary:true,pointerId:2,clientX:70,clientY:20}));
            track.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,cancelable:true,pointerType:'touch',isPrimary:true,pointerId:2,clientX:70+dx,clientY:20+dy}));
        },{dx,dy});
        await swipe(70);await ready();check(await organizer.getAttribute('aria-selected')==='true','Scorrimento orizzontale verso organizzatore');
        await swipe(-70);check(await normal.getAttribute('aria-selected')==='true','Scorrimento orizzontale verso normale');
        await swipe(50,100);check(await normal.getAttribute('aria-selected')==='true','Scorrimento verticale non cambia profilo');
        await page.waitForTimeout(450);
        await organizer.click();await ready();
        page.once('dialog',dialog=>dialog.dismiss());await page.getByRole('link',{name:'Crea profilo organizzatore'}).click();
        check(new URL(page.url()).pathname==='/dashboard','Avviso prima di abbandonare i dati normali non salvati');
        await normal.click();await page.locator('#profileForm button[type=submit]').click();
        await page.locator('#profiloModal').waitFor({state:'hidden'});
        const write=await page.evaluate(()=>qaWrites.at(-1));
        check(write.table==='profiles' && write.value.nome==='Nome modificato QA' && write.value.email_digest===false && write.value.email_stats===false && !('organization_name' in write.value),'Salvataggio normale invariato, preferenze incluse');
        await open();await organizer.click();await ready();
        await page.getByRole('link',{name:'Crea profilo organizzatore'}).click();
        await page.locator('#organizerProfileForm').waitFor({state:'visible'});
        check(await page.locator('.profile-switch-page [aria-current=page]').innerText()==='Organizzatore','Area organizzatore e modulo completo raggiungibili');
        check(await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor)==='rgb(11, 18, 32)','Area di gestione organizzatore con colori scuri');
        check(await page.locator('header').evaluate(el=>getComputedStyle(el).backgroundColor)==='rgba(15, 23, 42, 0.97)' && await page.locator('header .site-logo').evaluate(el=>getComputedStyle(el).backgroundColor)==='rgb(255, 255, 255)','Intestazione scura e logo originale leggibile su fondo bianco');
        check(await page.locator('#organizerRefresh').count()===0 && await page.getByRole('link',{name:'Dashboard normale',exact:true}).count()===0,'Area organizzatore senza pulsanti Aggiorna e dashboard duplicata');
        await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
        check(await page.locator('.profile-switch-page').evaluate(el=>el.getBoundingClientRect().bottom<=0),'Selettore organizzatore scorre fuori dalla vista');
        await page.evaluate(()=>scrollTo(0,0));
        await page.locator('.profile-switch-page a').first().click();
        await page.locator('#dashContent').waitFor({state:'visible'});
        check(await page.locator('.profile-switch-page [aria-current=page]').innerText()==='Ambulante' && !await page.locator('#profiloModal').isVisible() && !new URL(page.url()).searchParams.has('area'),'Switch organizzatore torna alla dashboard ambulante senza aprire la modifica profilo');
        await open();
        for(const status of ['pending','approved','rejected','suspended']){
            H.getDB().profile={...profile(status),review_note:status==='rejected'?'<img src=x onerror="window.qaXSS=1"> Controlla i dati':''};
            await organizer.click();await ready();
            check(await page.locator('.profile-organizer-status').getAttribute('data-status')===status,'Stato organizzatore '+status);
            check(await page.locator('#profileOrganizerContent a[href^="/profilo?id="]').count()===0,'Profilo visibile subito senza pagina intermedia: '+status);
            check((await page.locator('.organizer-profile-bio').innerText())===profile(status).description && await page.getByRole('link',{name:'eventi@example.invalid',exact:true}).isVisible(),'Descrizione e contatti reali nel profilo: '+status);
            check(await page.getByRole('link',{name:'Modifica profilo',exact:true}).isVisible() && await page.locator('.organizer-profile-events').isVisible(),'Modifica ed eventi nel profilo: '+status);
            check(!/PRIVATO NON MOSTRARE/.test(await page.locator('#profileOrganizerContent').innerText()) && !await page.evaluate(()=>window.qaXSS),'Contatti privati esclusi e testo sicuro: '+status);
            if(artifacts && ['approved','pending'].includes(status))await page.locator('.profile-dialog').screenshot({path:path.join(artifacts,`${name}-${width}-${status}.png`)});
        }
        const previousEvents=H.getDB().events;
        H.getDB().profile=profile('approved');
        H.getDB().events=[{id:'44444444-4444-4444-8444-444444444444',organizer_id:H.owner,title:'Mercatino di artigianato QA',status:'published',city:'Milano',start_date:'2027-11-06',end_date:'2027-11-07',places:[]}];
        await organizer.click();await ready();
        check(await page.getByRole('link',{name:'Mercatino di artigianato QA',exact:true}).isVisible(),'Eventi visibili direttamente nella finestra del profilo');
        if(artifacts)await page.locator('.profile-dialog').screenshot({path:path.join(artifacts,`${name}-${width}-profilo-eventi.png`)});
        const ownerPage=await context.newPage();ownerPage.on('pageerror',error=>errors.push(error.message));
        await ownerPage.goto(base+'/organizzatore');await ownerPage.locator('#organizerWorkspace').waitFor({state:'visible'});
        check(await ownerPage.getByRole('heading',{level:1,name:'Mercatini QA',exact:true}).isVisible() && await ownerPage.locator('.organizer-profile-bio').innerText()===profile('approved').description,'Area organizzatore apre subito il profilo completo');
        check(await ownerPage.getByRole('link',{name:'eventi@example.invalid',exact:true}).isVisible() && await ownerPage.locator('#organizerEvents').innerText().then(text=>text.includes('Mercatino di artigianato QA')),'Contatti ed eventi visibili senza passaggi intermedi');
        check(!await ownerPage.locator('#organizerProfileDetails').evaluate(el=>el.open) && !await ownerPage.locator('#organizerReview').isVisible() && await ownerPage.locator('.ev-steps,#organizerPublicLink').count()===0,'Profilo approvato senza modulo aperto, tutorial o rinvio al profilo pubblico');
        check(!/PRIVATO NON MOSTRARE/.test(await ownerPage.locator('#organizerProfileView').innerText()) && await ownerPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Profilo visibile senza contatti privati o scorrimento orizzontale');
        if(artifacts)await ownerPage.screenshot({path:path.join(artifacts,`${name}-${width}-area-profilo.png`),fullPage:true});
        await ownerPage.goto(base+await page.locator('.profile-organizer-primary').getAttribute('href'));await ownerPage.locator('#organizerWorkspace').waitFor({state:'visible'});
        check(await ownerPage.locator('#organizerProfileDetails').evaluate(el=>el.open) && await ownerPage.locator('[name=organization_name]').evaluate(el=>el===document.activeElement) && !new URL(ownerPage.url()).searchParams.has('modifica'),'Modifica profilo apre i campi e porta il focus al nome');
        H.getDB().profile=profile('pending');await ownerPage.reload();await ownerPage.locator('#organizerWorkspace').waitFor({state:'visible'});
        check(await ownerPage.locator('.organizer-profile-bio').isVisible() && !await ownerPage.locator('#newOrganizerEvent').isVisible() && await ownerPage.locator('#organizerStatus').innerText()==='In revisione','Il proprietario vede il profilo in revisione senza nuovi diritti di pubblicazione');
        await ownerPage.close();H.getDB().profile=profile('suspended');H.getDB().events=previousEvents;
        H.getDB().failRPC=true;await organizer.click();await ready();
        check(await page.getByRole('button',{name:'Riprova',exact:true}).isVisible(),'Errore di rete con possibilità di riprovare');
        await page.getByRole('button',{name:'Riprova',exact:true}).focus();await page.keyboard.press('Enter');await ready();
        check(await page.locator('.profile-organizer-status').isVisible() && await page.locator('.profile-organizer-primary').evaluate(el=>el===document.activeElement),'Riprova recupera dati e focus da tastiera');
        hold=true;await organizer.click();await waitFor(()=>pending.length===1);await normal.click();
        H.getDB().profile={...profile('approved'),organization_name:'Nuova risposta QA'};
        hold=false;await organizer.click();await ready();pending.shift()();await page.waitForTimeout(120);
        check(await page.locator('#profileOrganizerContent h3').innerText()==='Nuova risposta QA','Risposta vecchia ignorata dopo cambio rapido');
        await page.keyboard.press('Escape');await page.locator('#profiloModal').waitFor({state:'hidden'});
        check(await page.locator('#profileOrganizerContent').innerText()==='','Chiusura elimina riepilogo privato');
        check(await page.locator('.dashboard-user button').evaluate(el=>el===document.activeElement),'Chiusura restituisce focus al pulsante di apertura');
        await open();check(await normal.getAttribute('aria-selected')==='true','Senza eventi prevalenti la riapertura parte da Normale');
        await page.evaluate(()=>qaSaveDelay=250);await page.locator('#profileForm button[type=submit]').click();
        await organizer.click();await ready();await page.waitForTimeout(1100);
        check(await page.locator('#profileOrganizerPanel').isVisible(),'Salvataggio normale in corso non chiude la scheda organizzatore appena aperta');
        await page.evaluate(()=>qaSaveDelay=0);await normal.click();
        await page.locator('[aria-label="Chiudi il profilo"]').focus();await page.keyboard.press('Shift+Tab');
        check(await page.locator('#profiloModal').evaluate(el=>el.contains(document.activeElement)),'Focus contenuto nel dialogo');
        if(artifacts){await page.locator('.profile-panels').evaluate(el=>el.scrollTop=0);await page.locator('.profile-dialog').screenshot({path:path.join(artifacts,`${name}-${width}-normale.png`)});}
        await page.emulateMedia({reducedMotion:'reduce'});
        check(await page.locator('#profileSwitch').evaluate(el=>getComputedStyle(el,'::before').transitionDuration)==='0s','Animazione disattivata con movimento ridotto');
        const listing=(status='active',expires_at=null,user_id=H.owner)=>({status,expires_at,user_id});
        const event=status=>({id:'44444444-4444-4444-8444-444444444444',status,title:'Mercatino QA',city:'Milano',start_date:'2027-11-06',end_date:'2027-11-06',places:[]});
        const reopen=async()=>{await page.keyboard.press('Escape');await page.locator('.dashboard-user button').click();await page.waitForFunction(()=>!document.querySelector('#profileSwitch').hasAttribute('aria-busy'));};
        H.getDB().profile=profile('approved');H.getDB().listings=[listing(),listing()];H.getDB().events=[event('draft')];
        await reopen();check(await normal.getAttribute('aria-selected')==='true','Piu posteggi in vendita: profilo normale');
        H.getDB().events=[event('draft'),event('pending')];
        await reopen();check(await normal.getAttribute('aria-selected')==='true','Parita eventi e posteggi: profilo normale');
        H.getDB().events.push(event('published'));
        await reopen();await ready();check(await organizer.getAttribute('aria-selected')==='true','Piu eventi: profilo organizzatore predefinito');
        await normal.click();check(await page.locator('#pNome').inputValue()==='Nome QA' && await normal.getAttribute('aria-selected')==='true','Ritorno manuale alla modalita normale sempre disponibile');
        await reopen();await ready();check(await organizer.getAttribute('aria-selected')==='true','Riapertura ricalcola i contenuti invece di ricordare la scelta manuale');
        H.getDB().events=[event('draft'),event('cancelled'),event('cancelled')];
        await reopen();check(await normal.getAttribute('aria-selected')==='true','Eventi annullati esclusi dalla scelta');
        H.getDB().listings=[listing('sold'),listing('pending'),listing('rejected'),listing('active','2000-01-01T00:00:00Z'),listing('active',null,H.other)];
        await reopen();await ready();check(await organizer.getAttribute('aria-selected')==='true','Venduti, scaduti, non attivi e annunci altrui esclusi; una bozza evento conta');
        await page.keyboard.press('Escape');await page.goto(base+'/dashboard?profilo=1');await page.locator('#profileNormalPanel').waitFor({state:'visible'});
        check(await normal.getAttribute('aria-selected')==='true' && !new URL(page.url()).searchParams.has('profilo'),'Ritorno esplicito a Normale rispettato anche con piu eventi');
        H.getDB().failCount=true;await reopen();check(await normal.getAttribute('aria-selected')==='true','Errore nel conteggio: apertura normale con switch disponibile');H.getDB().failCount=false;
        H.getDB().failRPC=true;await reopen();check(await normal.getAttribute('aria-selected')==='true','Errore eventi: apertura normale con switch disponibile');
        hold=true;await page.keyboard.press('Escape');await page.locator('.dashboard-user button').click();await waitFor(()=>pending.length===1);
        check(await page.locator('#profileDefaultStatus').isVisible() && !await page.locator('#profileNormalPanel').isVisible(),'Attesa iniziale senza mostrare campi destinati a sparire');
        await normal.click();pending.shift()();hold=false;await page.waitForTimeout(120);
        check(await normal.getAttribute('aria-selected')==='true' && await page.locator('#profileNormalPanel').isVisible(),'Scelta manuale prevale sulla risposta automatica tardiva');
        if(artifacts){await organizer.click();await ready();await page.locator('.profile-dialog').screenshot({path:path.join(artifacts,`${name}-${width}-organizzatore-scuro.png`)});await normal.click();}
        await organizer.click();await ready();
        hold=true;await organizer.click();await waitFor(()=>pending.length===1);
        await page.evaluate(()=>{qaUser=null;qaListeners.forEach(fn=>fn('SIGNED_OUT',null));});
        pending.shift()();await page.locator('#profiloModal').waitFor({state:'hidden'});
        check(!await page.locator('#profiloModal').isVisible() && await page.locator('#profileOrganizerContent').innerText()==='','Logout chiude il profilo e invalida la risposta in volo');
        await page.evaluate(id=>{qaUser=_currentUser={id,email:'qa@example.invalid'};qaListeners.forEach(fn=>fn('SIGNED_IN',{user:qaUser}));},H.owner);
        H.getDB().events=[];hold=false;await open();hold=true;await organizer.click();await waitFor(()=>pending.length===1);
        await page.evaluate(id=>{qaUser={id};qaListeners.forEach(fn=>fn('SIGNED_IN',{user:qaUser}));},H.other);
        pending.shift()();await page.locator('#profiloModal').waitFor({state:'hidden'});
        check(!await page.locator('#profiloModal').isVisible() && await page.locator('#profileOrganizerContent').innerText()==='','Cambio account invalida il vecchio profilo');
        hold=false;H.getDB().events=[event('draft')];H.getDB().profile=profile('approved');
        await page.goto(base+'/dashboard');await page.waitForURL(base+'/organizzatore');
        check(await page.locator('.profile-switch-page [aria-current=page]').innerText()==='Organizzatore','Ingresso area personale apre la dashboard organizzatore quando prevalgono gli eventi');
        await page.goto(base+'/dashboard?area=normale');await page.locator('#dashContent').waitFor({state:'visible'});
        check(new URL(page.url()).pathname==='/dashboard' && !new URL(page.url()).searchParams.has('area') && await page.locator('.profile-switch-page [aria-current=page]').innerText()==='Ambulante','Ritorno esplicito alla dashboard ambulante senza reindirizzamento');
        await page.locator('#sellerAnalyticsPanel').evaluate(el=>el.classList.remove('hidden'));
        const layout=await page.evaluate(()=>{const welcome=document.querySelector('.dashboard-user').getBoundingClientRect(),nav=document.querySelector('.profile-switch-page').getBoundingClientRect(),performance=document.querySelector('#sellerAnalyticsPanel').getBoundingClientRect();return{welcomeBottom:welcome.bottom,navTop:nav.top,navBottom:nav.bottom,performanceTop:performance.top,position:getComputedStyle(document.querySelector('.profile-switch-page')).position};});
        check(layout.navTop>=layout.welcomeBottom && layout.navBottom<=layout.performanceTop && !['fixed','sticky'].includes(layout.position),'Switch tra saluto del profilo e Performance posteggi, nel normale scorrimento');
        if(artifacts)await page.screenshot({path:path.join(artifacts,`${name}-${width}-dashboard-ambulante.png`)});
        await page.evaluate(()=>scrollTo(0,document.body.scrollHeight));
        check(await page.locator('.profile-switch-page').evaluate(el=>el.getBoundingClientRect().bottom<=0),'Switch ambulante scorre fuori dalla vista');
        await page.goto(base+'/dashboard#pagamenti');await page.locator('#dashContent').waitFor({state:'visible'});
        check(new URL(page.url()).pathname==='/dashboard' && new URL(page.url()).hash==='#pagamenti','Link diretti alle funzioni normali conservati');
        await page.goto(base+'/dashboard?qa=inizio');await page.keyboard.press('Tab');
        await page.evaluate(()=>{history.replaceState(null,'','/dashboard');return ProfileSwitcher.startDashboard(qaUser);});
        check(new URL(page.url()).pathname==='/dashboard','Interazione prima della fine del caricamento impedisce un rinvio successivo');
        await page.goto(base+'/dashboard?qa=attesa');hold=true;
        await page.evaluate(()=>{history.replaceState(null,'','/dashboard');ProfileSwitcher.startDashboard(qaUser);});await waitFor(()=>pending.length>0);
        await page.locator('.dashboard-user button').click();await normal.click();pending.shift()();hold=false;
        await page.waitForTimeout(120);
        check(new URL(page.url()).pathname==='/dashboard' && await normal.getAttribute('aria-selected')==='true','Apertura manuale del profilo impedisce il reindirizzamento tardivo della dashboard');
        await page.goto(base+'/dashboard?admin=1');
        const adminCalls=H.getDB().calls.length;
        await page.evaluate(async()=>{history.replaceState(null,'','/dashboard');await ProfileSwitcher.startDashboard(qaUser);});
        check(new URL(page.url()).pathname==='/dashboard','Admin escluso dal rinvio automatico anche con piu eventi');
        check(H.getDB().calls.length===adminCalls,'Admin escluso prima di contare eventi e annunci');
        await open();
        check(await normal.getAttribute('aria-selected')==='true','Il profilo admin apre sempre la modalita ambulante');
        await organizer.click();await ready();
        check(await organizer.getAttribute('aria-selected')==='true','Admin puo scegliere manualmente il profilo organizzatore');
        await reopen();
        check(await normal.getAttribute('aria-selected')==='true','Riapertura admin resta normale dopo una scelta manuale');
        await page.keyboard.press('Escape');
        await page.goto(base+'/dashboard?qa=ruolo');
        await page.evaluate(async()=>{qaFailSave=true;history.replaceState(null,'','/dashboard');await ProfileSwitcher.startDashboard(qaUser);});
        check(new URL(page.url()).pathname==='/dashboard','Errore nel controllo del ruolo non causa un rinvio automatico');
        check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Nessun contenuto fuori dallo schermo');
        check(errors.length===0,'Nessun errore JavaScript: '+errors.join('; '));
        console.log(`OK: ${name} ${width}x${height}, ${result.checks.length} verifiche profili.`);
        return result;
    } catch(error) {
        if(artifacts)await page.screenshot({path:path.join(artifacts,`errore-${name}-${width}.png`),fullPage:true});
        console.error('Ultime chiamate',H.getDB().calls.slice(-3).map(call=>call.name));console.error('Errore originale',error);console.error(await page.evaluate(()=>({url:location.href,user:window.qaUser,message:document.getElementById('profileOrganizerContent')?.textContent,errors:window.qaErrors})));throw error;
    } finally {pending.forEach(release=>release());await browser.close();}
}
(async()=>{
    if(artifacts)fs.mkdirSync(artifacts,{recursive:true});
    if(process.env.PROFILE_USE_PUBLISHED){for(const file of files){const response=await nativeFetch('https://subingresso.it/'+(file.endsWith('.html')?file.slice(0,-5):file),{cache:'no-store'});assert.equal(response.status,200);const body=await response.text();assert.equal(body.replace(/\r\n/g,'\n'),assets.get(file).replace(/\r\n/g,'\n'),file+' pubblicato diverso');assets.set(file,body);}}
    await new Promise(resolve=>H.server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+H.server.address().port,results=[];
    try{for(const [engine,name,width,height] of [[chromium,'Chromium',1440,950],[chromium,'Chromium',820,900],[chromium,'Chromium',320,568],[webkit,'WebKit',390,844]]){
        if(process.env.PROFILE_TEST_WIDTH && Number(process.env.PROFILE_TEST_WIDTH)!==width)continue;
        results.push(await run(engine,name,width,height,base));
    }}finally{await new Promise(resolve=>H.server.close(resolve));global.fetch=nativeFetch;}
    if(artifacts)fs.writeFileSync(path.join(artifacts,process.env.PROFILE_USE_PUBLISHED?'profili-online.json':'profili-locale.json'),JSON.stringify({at:new Date().toISOString(),results},null,2));
})().catch(error=>{console.error(error);H.server.close();process.exitCode=1;});
