// Card e pulsanti reali, rete/sessioni simulate: nessuna scrittura su account reali.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
let dataSource = fs.readFileSync(path.join(root, 'js/data.js'), 'utf8');
let detailSource = fs.readFileSync(path.join(root, 'js/pages/annuncio-detail.js'), 'utf8');
let template = fs.readFileSync(path.join(root, 'annuncio.html'), 'utf8');
const listing = { id:'11111111-1111-4111-8111-111111111111', titolo:'Posteggio di prova', stato:'Vendita', tipo:'Mercato', comune:'Brescia', regione:'Lombardia', prezzo:1000 };
const firstUser = '22222222-2222-4222-8222-222222222222', secondUser = '33333333-3333-4333-8333-333333333333';
const storageKey = '_saved_listings_v1';
function fixture() {
    const buttons = ['saveBtn','saveBtnMobile'].map(id => template.match(new RegExp('<button id="'+id+'"[\\s\\S]*?</button>'))?.[0]).join('');
    assert(buttons.includes('aria-busy="true"') && buttons.includes('disabled'));
    return `<!doctype html><html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="/css/tailwind.css"><body><main style="padding:24px"><h1>Preferiti</h1><div style="position:relative;height:64px">${buttons}</div><div id="cards" style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px"></div></main><script>
window.qaListeners=[];window.qaToasts=[];window.qaAuth=[];
window.qaUser=JSON.parse(sessionStorage.getItem('qa-user')||'${JSON.stringify(firstUser)}');
window.qaSwitch=user=>{qaUser=user;sessionStorage.setItem('qa-user',JSON.stringify(user));qaListeners.forEach(fn=>fn(user?'SIGNED_IN':'SIGNED_OUT',user?{user:{id:user}}:null));};
const _supabase={auth:{getSession:async()=>({data:{session:qaUser?{user:{id:qaUser}}:null}}),onAuthStateChange:fn=>{qaListeners.push(fn);return{data:{subscription:{unsubscribe(){}}}};}},from:table=>{
    if(table!=='saved_listings')throw Error('Tabella inattesa: '+table);
    const query={op:'read',filters:{},select(){return this;},insert(value){this.op='insert';this.value=value;return this;},delete(){this.op='delete';return this;},eq(k,v){this.filters[k]=v;return this;},abortSignal(signal){this.signal=signal;return this;},then(resolve,reject){return fetch('/qa/saved',{method:'POST',signal:this.signal,body:JSON.stringify({op:this.op,filters:this.filters,value:this.value})}).then(r=>r.json()).then(resolve,reject);}};return query;
}};
window.openAuthModal=(...args)=>qaAuth.push(args);
</script><script src="/js/image-urls.js"></script><script src="/js/data.js"></script><script>
showToast=(...args)=>qaToasts.push(args);
let _currentListing=${JSON.stringify(listing)};
${detailSource.slice(detailSource.indexOf('// ── Salva preferito (annuncio corrente)'))}
window.qaRender=()=>{document.getElementById('cards').innerHTML=buildCard(${JSON.stringify(listing)})+buildCard(${JSON.stringify(listing)});};qaRender();
</script></body></html>`;
}
const server = http.createServer((req,res)=>{
    const url = new URL(req.url,'http://localhost');
    if(url.pathname==='/fixture'){res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(fixture());}
    if(url.pathname==='/js/data.js'){res.setHeader('Content-Type','text/javascript; charset=utf-8');return res.end(dataSource);}
    if(url.pathname==='/js/image-urls.js'){res.setHeader('Content-Type','text/javascript; charset=utf-8');return res.end(fs.readFileSync(path.join(root,'js/image-urls.js')));}
    if(url.pathname==='/css/tailwind.css'){res.setHeader('Content-Type','text/css');return res.end(fs.readFileSync(path.join(root,'css/tailwind.css')));}
    res.writeHead(404).end();
});
async function poll(predicate){for(let i=0;i<200;i++){if(predicate())return;await new Promise(r=>setTimeout(r,10));}throw Error('Richiesta simulata mancante');}
async function run(engine,name,width,base){
    const browser=await engine.launch({headless:true});
    const context=await browser.newContext({viewport:{width,height:844},hasTouch:width<500});
    const page=await context.newPage(), errors=[], reads=[], writes=[], db=new Map([[firstUser,new Set()],[secondUser,new Set()]]);
    let holdReads=true, holdWrites=true, failRead=false, failWrite=null, calls=0, checks=0;
    const check=(condition,message)=>{assert(condition,message);checks++;};
    page.on('pageerror',e=>errors.push(e.message));
    context.setDefaultTimeout(6000);
    await context.route('**/qa/saved',async route=>{
        calls++;
        const query=route.request().postDataJSON(), user=query.value?.user_id||query.filters.user_id;
        assert(db.has(user));
        const records=db.get(user);
        if(query.op==='read'){
            const result=failRead?{error:{message:'offline'}}:{data:[...records].map(annuncio_id=>({annuncio_id}))};
            if(holdReads)await new Promise(resolve=>reads.push(resolve));
            return route.fulfill({json:result});
        }
        const failure=failWrite;failWrite=null;
        if(holdWrites)await new Promise(resolve=>writes.push({resolve,query}));
        if(!failure){if(query.op==='insert')records.add(query.value.annuncio_id);else records.delete(query.filters.annuncio_id);}
        return route.fulfill({json:failure?{error:failure}:{error:null}});
    });
    const buttons=page.locator('#saveBtn,#saveBtnMobile,[data-save-id]');
    const state=async(saved,busy)=>{
        await page.waitForFunction(({saved,busy})=>[...document.querySelectorAll('#saveBtn,#saveBtnMobile,[data-save-id]')].every(el=>el.dataset.saved===String(Number(saved)) && el.disabled===busy && el.getAttribute('aria-pressed')===String(saved)),{saved,busy});checks++;
    };
    const releaseRead=async()=>{await poll(()=>reads.length);reads.shift()();await page.waitForFunction(()=>_savedLoad===null);};
    const releaseWrite=async()=>{await poll(()=>writes.length);writes.shift().resolve();};
    const click=()=>page.locator(width<500?'#saveBtnMobile':'#saveBtn').click();
    const refresh=()=>page.evaluate(()=>loadSavedListingsCache());
    try {
        await page.goto(base+'/fixture?id='+listing.id);
        await poll(()=>reads.length);
        check(await buttons.evaluateAll(els=>els.every(el=>el.disabled&&el.querySelector('i').classList.contains('fa-spinner'))),'Nessun falso non-salvato prima della verifica');
        await page.evaluate(()=>{loadSavedListingsCache();loadSavedListingsCache();});
        check(calls===1,'Letture iniziali condivise');
        await new Promise(r=>setTimeout(r,4200));await releaseRead();await state(false,false);
        check(await buttons.count()===4,'Card duplicate e dettaglio desktop/mobile');
        const start=Date.now();await page.locator('[data-save-id]').first().click();await state(true,true);
        check(Date.now()-start<600,'Risposta visiva immediata, prima della rete');
        check(new URL(page.url()).pathname==='/fixture','Il clic Salva sulla card non apre il link');
        await page.evaluate(()=>{_saveCurrentListing();toggleSaveListing(_currentListing.id);qaRender();});
        await state(true,true);await poll(()=>writes.length);
        check(writes.length===1,'Clic ripetuti bloccati anche dopo ricostruzione card');
        const stale=page.evaluate(()=>loadSavedListingsCache());await releaseRead();await stale;await state(true,true);
        await releaseWrite();await state(true,false);
        check(db.get(firstUser).has(listing.id),'Un solo salvataggio confermato');

        await page.goto(base+'/fixture?id='+listing.id);await poll(()=>reads.length);
        await state(true,false);check(await page.locator('#saveBtn i').getAttribute('class').then(c=>c.includes('fa-bookmark')),'Aprendo il dettaglio resta salvato prima della risposta');
        await page.evaluate(()=>{_currentListing=null;_refreshLocalSaveButtons();});await state(true,false);
        await releaseRead();await state(true,false);
        await click();await state(false,true);await releaseWrite();await state(false,false);
        check(!db.get(firstUser).has(listing.id),'Pulsante pronto anche mentre i dati dell’annuncio stanno arrivando');
        await page.reload();await poll(()=>reads.length);await state(false,false);await releaseRead();

        // Navigazione con modifica non ancora confermata: stato visibile ma protetto.
        await page.evaluate(({key,id})=>sessionStorage.setItem(key,JSON.stringify({userId:qaUser,ids:[id],pending:[id]})),{key:storageKey,id:listing.id});
        await page.reload();await poll(()=>reads.length);await state(true,true);
        const before=calls;await page.evaluate(()=>_saveCurrentListing());check(calls===before,'Modifica precedente da verificare non accetta un nuovo clic');
        await releaseRead();await state(false,false);
        check(await page.evaluate(()=>qaToasts.length)===1,'Navigazione durante salvataggio interrotto mostra la mancata conferma');

        failWrite={message:'offline',code:'network'};await click();await state(true,true);await releaseWrite();await state(false,false);
        check(await page.evaluate(()=>qaToasts.length)===2,'Errore visibile e ripristino dopo salvataggio fallito');
        check(!(await page.evaluate(key=>JSON.parse(sessionStorage.getItem(key)).ids,storageKey)).includes(listing.id),'Cache ripristinata dopo errore');
        await click();await releaseWrite();await state(true,false);
        failWrite={message:'offline',code:'network'};await click();await state(false,true);await releaseWrite();await state(true,false);
        check(db.get(firstUser).has(listing.id),'Rimozione fallita conserva il preferito');

        // Una lettura iniziata prima del clic termina dopo la scrittura.
        const old=page.evaluate(()=>loadSavedListingsCache());await poll(()=>reads.length);
        await click();await releaseWrite();await state(false,false);await releaseRead();await old;await state(false,false);
        check(!db.get(firstUser).has(listing.id),'Risposta vecchia non annulla una rimozione confermata');
        holdWrites=false;await click();await state(true,true);await page.evaluate(()=>_saveCurrentListing());await state(true,false);
        check(db.get(firstUser).has(listing.id),'Doppio clic bloccato anche con server veloce');
        holdWrites=true;

        failWrite={message:'already exists',code:'23505'};await click();await releaseWrite();await state(true,false); // DELETE deve invece fallire.
        await click();await releaseWrite();await state(false,false);
        failWrite={message:'already exists',code:'23505'};await click();await releaseWrite();await state(true,false);
        check(await page.evaluate(()=>qaToasts.length)===4,'Duplicato INSERT gestito come successo, altri errori segnalati');

        await click();await poll(()=>writes.length);
        await page.evaluate(user=>qaSwitch(user),secondUser);await poll(()=>reads.length);
        check(await page.evaluate(()=>SAVED_IDS.size)===0,'Cambio account pulisce subito i preferiti');
        await releaseRead();await state(false,false);await releaseWrite();await state(false,false);
        check(await page.evaluate(()=>_savedUserId)===secondUser,'Risposta vecchio account ignorata');
        await page.evaluate(()=>qaSwitch(null));await state(false,false);
        check(await page.evaluate(key=>sessionStorage.getItem(key),storageKey)===null,'Logout elimina la cache');
        await click();await poll(()=>true);await page.waitForFunction(()=>qaAuth.length===1);
        check(await page.evaluate(()=>qaAuth[0][2])==='salva_preferito','Ospite mantiene il percorso di accesso');
        check(await page.evaluate(()=>sessionStorage.getItem('_pending_save_listing'))===listing.id,'Intento di salvataggio conservato');
        await page.evaluate(user=>qaSwitch(user),firstUser);await poll(()=>reads.length);await releaseRead();await state(false,false);
        holdReads=false;
        const pending=page.evaluate(()=>processPendingSaveListing());await releaseWrite();await pending;await state(true,false);
        check(await page.evaluate(()=>sessionStorage.getItem('_pending_save_listing'))===null,'Preferito salvato una volta dopo accesso');

        await page.evaluate(()=>{qaSwitch(null);sessionStorage.clear();Storage.prototype.setItem=function(){throw Error('blocked');};Storage.prototype.getItem=function(){throw Error('blocked');};});
        await page.evaluate(user=>qaSwitch(user),firstUser).catch(()=>{}); // Il test ripristina l'evento separatamente.
        await page.evaluate(user=>{qaUser=user;qaListeners.forEach(fn=>fn('SIGNED_IN',{user:{id:user}}));},firstUser);
        await state(true,false);
        await page.evaluate(()=>qaSwitch(null)).catch(()=>{});
        await page.evaluate(()=>{qaUser=null;qaListeners.forEach(fn=>fn('SIGNED_OUT',null));});
        failRead=true;
        await page.evaluate(user=>{qaUser=user;qaListeners.forEach(fn=>fn('SIGNED_IN',{user:{id:user}}));},secondUser);
        await page.waitForFunction(()=>document.querySelector('#saveBtn i').classList.contains('fa-exclamation-circle'));
        check(await page.locator('#saveBtn').isEnabled(),'Errore di verifica offre un nuovo tentativo');
        failRead=false;await click();await releaseWrite();await state(true,false);
        check(db.get(secondUser).has(listing.id),'Riprova funziona anche con memoria browser indisponibile');
        check(errors.length===0,'Nessun errore JavaScript: '+errors.join(', '));
        if(process.env.SAVED_QA_DIR){fs.mkdirSync(process.env.SAVED_QA_DIR,{recursive:true});fs.writeFileSync(path.join(process.env.SAVED_QA_DIR,name+'-'+width+'.json'),JSON.stringify({checks,calls,errors},null,2));await page.screenshot({path:path.join(process.env.SAVED_QA_DIR,name+'-'+width+'.png'),fullPage:true});}
        console.log('OK: '+name+' '+width+'px, '+checks+' controlli; rete lenta, card/dettaglio, navigazione, doppio clic, errori, risposte vecchie, account e memoria bloccata.');
    } finally {await context.close();await browser.close();}
}
(async()=>{
    if(process.env.SAVED_USE_PUBLISHED){
        for(const [file,assign] of [['js/data.js',v=>dataSource=v],['js/pages/annuncio-detail.js',v=>detailSource=v],['annuncio.html',v=>template=v]]){
            const response=await fetch('https://subingresso.it/'+(file==='annuncio.html'?'annuncio':file));assert.equal(response.status,200);const source=await response.text();
            if(file!=='annuncio.html')assert.equal(source.replace(/\r\n/g,'\n'),fs.readFileSync(path.join(root,file),'utf8').replace(/\r\n/g,'\n'),file+' online diverso');
            assign(source);
        }
    }
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const base='http://127.0.0.1:'+server.address().port;
    try{for(const [engine,name,width] of [[chromium,'Chromium',1440],[chromium,'Chromium',320],[webkit,'WebKit',390]])await run(engine,name,width,base);}
    finally{await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1;});
