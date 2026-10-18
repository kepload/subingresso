// HTML, selettore e salvataggio reali; sessioni/RPC simulati, nessun account modificato.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const nativeFetch = global.fetch;
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const H = require('./test-organizer-events.cjs');
const root = path.resolve(__dirname, '..'), artifacts = process.env.PROFILE_QA_DIR;
const files = ['dashboard.html', 'organizzatore.html', 'css/profile-switch.css', 'js/profile-switch.js'];
let assets = new Map(files.map(file => [file, fs.readFileSync(path.join(root, file), 'utf8')]));
function fixture() {
    const html = assets.get('dashboard.html');
    const modalFunctions = html.slice(html.indexOf('let _profilePhoneBound = false;'), html.indexOf('function showDeleteAccountConfirm()'));
    const saveFunction = html.slice(html.indexOf('async function saveProfile(e)'), html.indexOf('// ── Custom Confirm Dialog'));
    const returnToProfile = html.slice(html.indexOf('    ProfileSwitcher.setBaseline();'), html.indexOf('    loadOnboardingWidget(user, profile);'));
    assert(modalFunctions.includes('ProfileSwitcher.open(_currentUser)'));
    assert(saveFunction.includes('ProfileSwitcher.setBaseline(profileSnapshot)'));
    return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace('</body>', `<script>
window.qaUser={id:'${H.owner}',email:'qa@example.invalid',created_at:'2026-01-01',email_confirmed_at:'2026-01-01',app_metadata:{provider:'email'}};
let _currentUser=qaUser,_profileReady=true;window.qaListeners=[];window.qaWrites=[];window.qaFailSave=false;window.qaSaveDelay=0;
const _supabase={auth:{getUser:async()=>({data:{user:qaUser}}),onAuthStateChange:fn=>{qaListeners.push(fn);return{data:{subscription:{unsubscribe(){}}}}},resetPasswordForEmail:async()=>({})},
rpc:async(name,args)=>{const r=await fetch('/qa/rpc',{method:'POST',headers:{'X-QA-User':qaUser?.id||''},body:JSON.stringify({name,args})});return r.json();},
from:table=>({upsert(value){qaWrites.push({table,value});return this;},select(){return this;},single:async()=>{await new Promise(resolve=>setTimeout(resolve,qaSaveDelay));return qaFailSave?{error:{message:'offline'}}:{data:{id:qaUser.id}};}})};
window.updateAuthNav=()=>{};window.signOut=()=>{};
</script><script src="/js/data.js?v=20"></script><script src="/js/ui-components.js?v=12"></script><script src="/js/event-data.js?v=1"></script><script src="/js/vetrina-account.js?v=2"></script><script src="/js/profile-switch.js?v=1"></script><script>
${modalFunctions}
${saveFunction}
loadingState.classList.add('hidden');dashContent.classList.remove('hidden');
pNome.value='Nome QA';pCognome.value='Cognome QA';pTelefono.value='+39 333 1234567';pEmailDigest.checked=true;pEmailStats.checked=false;
VetrinaAccount.fillProfile(_currentUser);
${returnToProfile}
</script></body>`);
}
const state = () => ({profile:null,events:[],calls:[],failRPC:false,calendarFail:false,publicFail:false});
const profile = status => ({user_id:H.owner,organization_name:'Mercatini QA',status,review_note:'',private_phone:'PRIVATO NON MOSTRARE',contact_name:'REFERENTE PRIVATO NON MOSTRARE',revision:1});
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
        check(H.getDB().calls.length===0,'Nessuna richiesta organizzatore o nuova registrazione per il profilo normale');
        const geometry=await page.locator('#profileSwitch').evaluate(el=>({width:el.getBoundingClientRect().width,height:el.getBoundingClientRect().height,buttons:[...el.querySelectorAll('button')].map(b=>b.getBoundingClientRect().height)}));
        check(geometry.width<=360 && geometry.height<=56 && geometry.buttons.every(height=>height>=44),'Selettore compatto con pulsanti comodi da toccare');
        check(await normal.evaluate(el=>getComputedStyle(el).fontFamily===getComputedStyle(document.body).fontFamily),'Font coerente con il sito');
        const top=await normal.evaluate(el=>el.getBoundingClientRect().top);
        await page.locator('.profile-panels').evaluate(el=>el.scrollTop=1000);
        check(await normal.evaluate(el=>el.getBoundingClientRect().top)===top,'Selettore sempre visibile durante lo scorrimento');
        await page.locator('.profile-panels').evaluate(el=>el.scrollTop=0);
        await page.locator('#pNome').fill('Nome modificato QA');await page.locator('#pEmailDigest').uncheck();
        await organizer.click();await ready();
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
        await page.locator('.profile-switch-page a').first().click();
        await page.locator('#profileNormalPanel').waitFor({state:'visible'});
        check(await normal.getAttribute('aria-selected')==='true' && !new URL(page.url()).searchParams.has('profilo'),'Ritorno al profilo normale aperto, parametro consumato');
        for(const status of ['pending','approved','rejected','suspended']){
            H.getDB().profile={...profile(status),review_note:status==='rejected'?'<img src=x onerror="window.qaXSS=1"> Controlla i dati':''};
            await organizer.click();await ready();
            check(await page.locator('.profile-organizer-status').getAttribute('data-status')===status,'Stato organizzatore '+status);
            check(await page.locator('.profile-organizer-secondary[href^="/profilo?id="]').isVisible()===(status==='approved'),'Profilo pubblico solo se approvato: '+status);
            check(!/PRIVATO NON MOSTRARE/.test(await page.locator('#profileOrganizerContent').innerText()) && !await page.evaluate(()=>window.qaXSS),'Contatti privati esclusi e testo sicuro: '+status);
            if(artifacts && ['approved','pending'].includes(status))await page.locator('.profile-dialog').screenshot({path:path.join(artifacts,`${name}-${width}-${status}.png`)});
        }
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
        await open();check(await normal.getAttribute('aria-selected')==='true','Ogni riapertura parte da Normale');
        await page.evaluate(()=>qaSaveDelay=250);await page.locator('#profileForm button[type=submit]').click();
        await organizer.click();await ready();await page.waitForTimeout(1100);
        check(await page.locator('#profileOrganizerPanel').isVisible(),'Salvataggio normale in corso non chiude la scheda organizzatore appena aperta');
        await page.evaluate(()=>qaSaveDelay=0);await normal.click();
        await page.locator('[aria-label="Chiudi il profilo"]').focus();await page.keyboard.press('Shift+Tab');
        check(await page.locator('#profiloModal').evaluate(el=>el.contains(document.activeElement)),'Focus contenuto nel dialogo');
        if(artifacts){await page.locator('.profile-panels').evaluate(el=>el.scrollTop=0);await page.locator('.profile-dialog').screenshot({path:path.join(artifacts,`${name}-${width}-normale.png`)});}
        await page.emulateMedia({reducedMotion:'reduce'});
        check(await page.locator('#profileSwitch').evaluate(el=>getComputedStyle(el,'::before').transitionDuration)==='0s','Animazione disattivata con movimento ridotto');
        await organizer.click();await ready();
        hold=true;await organizer.click();await waitFor(()=>pending.length===1);
        await page.evaluate(()=>{qaUser=null;qaListeners.forEach(fn=>fn('SIGNED_OUT',null));});
        pending.shift()();await page.waitForTimeout(120);
        check(!await page.locator('#profiloModal').isVisible() && await page.locator('#profileOrganizerContent').innerText()==='','Logout chiude il profilo e invalida la risposta in volo');
        await page.evaluate(id=>{qaUser=_currentUser={id,email:'qa@example.invalid'};qaListeners.forEach(fn=>fn('SIGNED_IN',{user:qaUser}));},H.owner);
        await open();hold=true;await organizer.click();await waitFor(()=>pending.length===1);
        await page.evaluate(id=>{qaUser={id};qaListeners.forEach(fn=>fn('SIGNED_IN',{user:qaUser}));},H.other);
        pending.shift()();await page.waitForTimeout(120);
        check(!await page.locator('#profiloModal').isVisible() && await page.locator('#profileOrganizerContent').innerText()==='','Cambio account invalida il vecchio profilo');
        check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Nessun contenuto fuori dallo schermo');
        check(errors.length===0,'Nessun errore JavaScript: '+errors.join('; '));
        console.log(`OK: ${name} ${width}x${height}, ${result.checks.length} verifiche profili.`);
        return result;
    } catch(error) {
        if(artifacts)await page.screenshot({path:path.join(artifacts,`errore-${name}-${width}.png`),fullPage:true});
        console.error('Ultime chiamate',H.getDB().calls.slice(-3).map(call=>call.name));console.error(await page.evaluate(()=>({qaUser,_currentUser,message:profileOrganizerContent.textContent,errors:window.qaErrors})));throw error;
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
