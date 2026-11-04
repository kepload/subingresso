// Real pages, auth UI and API handler; isolated backend, no users/emails/reviews created.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http'), assert = require('node:assert/strict');
const root = path.resolve(__dirname,'..'), handler = require('../api/saved-fairs'), fairHandler = require('../api/fiera'), eventHandler = require('../api/evento');
const { events } = require('../api/_fiere');
const sample = events.find(e=>e.id==='lombardia-brescia-fiera-dei-santi-faustino-e-giovita');
const other = events.find(e=>e.id!==sample.id);
const uidA='aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa', uidB='bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb';
const managed={id:'cccccccc-1111-4111-8111-cccccccccccc',organizer_id:uidB,title:'Fiera QA organizzata',city:'Milano',province:'Milano',region:'Lombardia',category:'mercatino',start_date:'2025-06-01',end_date:'2025-06-01',sectors:['artigianato'],goods:'Artigianato',description:'Evento simulato',places:[],status:'published'};
const nativeFetch=global.fetch;
let rows=[], writes=0, failSave=false, failRead=false, delayRead=0, delaySave=0;
const response=(data,status=200)=>({ok:status<400,status,json:async()=>data});
global.fetch=async(url,options={})=>{
    const data=options.body?JSON.parse(options.body):{},uid=(options.headers?.Authorization||'').replace('Bearer qa-','');
    if(url.endsWith('/auth/v1/user'))return [uidA,uidB].includes(uid)?response({id:uid}):response({},401);
    if(url.endsWith('/published_organizer_events'))return response([managed]);
    if(url.endsWith('/read_fair_reviews')){
        if(delayRead)await new Promise(r=>setTimeout(r,delayRead));
        if(failRead)return response({code:'XX000'},503);
        const list=rows.filter(r=>r.fair_id===data.p_id&&r.kind===data.p_kind);
        return response({count:list.length,average:list.length?4:null,organization:4,turnout:null,value:3,reviews:list.slice(data.p_offset,data.p_offset+10).map(({user_id,fair_id,kind,...row})=>row)});
    }
    if(url.endsWith('/publish_fair_review')){
        writes++;
        if(delaySave)await new Promise(r=>setTimeout(r,delaySave));
        if(failSave)return response({code:'XX000'},503);
        const d=data.p_data;
        if(rows.some(r=>r.user_id===uid&&r.fair_id===d.fair_id&&r.visit_month.slice(0,4)===d.visit_month.slice(0,4)))return response({code:'23505'},400);
        const row={...d,id:'review-'+writes,user_id:uid,author:'Mario',created_at:new Date().toISOString()};rows.unshift(row);return response({id:row.id});
    }
    return response([]);
};
const sdk=`
let qaUid=localStorage.getItem('qa-review-user'),qaListeners=[];
function qaSession(){return qaUid?{access_token:'qa-'+qaUid,user:{id:qaUid,email:'qa@example.invalid',user_metadata:{nome:'Mario',cognome:'QA'}}}:null}
function qaIdentity(uid){qaUid=uid;uid?localStorage.setItem('qa-review-user',uid):localStorage.removeItem('qa-review-user');qaListeners.forEach(fn=>fn(uid?'SIGNED_IN':'SIGNED_OUT',qaSession()))}
const query={select(){return this},eq(){return this},in(){return this},order(){return this},limit(){return this},insert(){return this},upsert(){return this},update(){return this},maybeSingle:async()=>({data:{nome:'Mario',cognome:'QA',telefono:'+393471234567',is_admin:false}}),single:async()=>({data:{nome:'Mario',telefono:'+393471234567'}}),then(resolve){return Promise.resolve({data:[],count:0,error:null}).then(resolve)}};
const client={auth:{getSession:async()=>({data:{session:qaSession()}}),getUser:async()=>({data:{user:qaSession()?.user||null}}),onAuthStateChange:fn=>{qaListeners.push(fn);return{data:{subscription:{unsubscribe(){}}}}},signInWithPassword:async()=>{qaIdentity('${uidA}');return{data:{session:qaSession()}}},signOut:async()=>{qaIdentity(null);return{}},resetPasswordForEmail:async()=>({})},from:()=>Object.create(query),rpc:async()=>({data:[]})};window.supabase={createClient:()=>client};`;
async function invoke(fn,req){const r={status:200,headers:{},body:''};await fn(req,{setHeader(k,v){r.headers[k]=v},status(n){r.status=n;return this},json(v){r.headers['Content-Type']='application/json';r.body=JSON.stringify(v)},send(v){r.headers['Content-Type']='text/html; charset=utf-8';r.body=v}});return r;}
const server=http.createServer(async(req,res)=>{
    try{
        const url=new URL(req.url,'http://localhost'),q=Object.fromEntries(url.searchParams);let result;
        if(url.pathname==='/api/saved-fairs'){let body='';for await(const p of req)body+=p;result=await invoke(handler,{method:req.method,headers:req.headers,query:q,body:body||undefined});}
        else if(url.pathname.startsWith('/fiere/'))result=await invoke(fairHandler,{method:'GET',query:{...q,slug:decodeURIComponent(url.pathname.split('/').pop())}});
        else if(url.pathname==='/evento')result=await invoke(eventHandler,{method:'GET',query:q});
        if(result){res.writeHead(result.status,result.headers);return res.end(result.body)}
        const file=path.resolve(root,'.'+(url.pathname==='/fiere'?'/fiere.html':url.pathname));if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
        const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml'};
        res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.readFile(file,(e,b)=>e?res.writeHead(404).end():res.end(b));
    }catch(e){console.error(e);res.writeHead(500).end()}
});
async function apiChecks(){
    const valid={kind:'catalog',fair_id:sample.id,visit_month:'2025-06-01',sector:'artigianato',rating:4,organization:null,turnout:null,value:null,body:'Esperienza di prova sul banco per verificare il flusso completo delle recensioni.',recommend:'yes',confirmed:true};
    const post=async(body,token='qa-'+uidA)=>invoke(handler,{method:'POST',headers:token?{authorization:'Bearer '+token}:{},query:{reviews:'1'},body});
    assert.equal((await post(valid,null)).status,401);
    assert.equal((await post(valid,'invalid')).status,401);
    assert.equal((await post({...valid,rating:8})).status,400);
    assert.equal((await post({...valid,visit_month:'2099-01-01'})).status,400);
    assert.equal((await post({...valid,confirmed:false})).status,400);
    assert.equal((await post({...valid,body:'short'})).status,400);
    assert.equal((await post({...valid,fair_id:'missing'})).status,404);
    assert.equal((await post('{invalid')).status,400);
    assert.equal((await post({...valid,user_id:uidB})).status,201);assert.equal(rows[0].user_id,uidA);
    assert.equal((await post(valid)).status,409);
    const get=await invoke(handler,{method:'GET',headers:{},query:{reviews:'1',kind:'catalog',id:sample.id}});assert.equal(get.status,200);assert(!get.body.includes(uidA));assert(!get.body.includes('telefono'));
    assert.equal((await invoke(handler,{method:'GET',query:{reviews:'1',kind:'catalog',id:sample.id,offset:'-1'}})).status,400);
    assert.equal((await invoke(handler,{method:'DELETE',query:{reviews:'1'}})).status,405);
    rows=[];writes=0;console.log('PASS API: auth, validation, canonical fair, owner, duplicates, public privacy, methods');
}
async function browserChecks(engine,name,width,height,base){
    rows=[];writes=0;failSave=false;failRead=false;delayRead=0;delaySave=0;
    const browser=await engine.launch({headless:true});
    try{
        const context=await browser.newContext({viewport:{width,height}}),errors=[];
        await context.route('**/*',async route=>{
            const url=new URL(route.request().url());
            if(url.hostname==='cdn.jsdelivr.net')return route.fulfill({contentType:'text/javascript',body:sdk});
            if(url.pathname.endsWith('/functions/v1/register-bypass'))return route.fulfill({json:{ok:true}});
            if(url.hostname.endsWith('.supabase.co'))return route.fulfill({json:url.pathname.endsWith('/published_organizer_events')?[managed]:[]});
            if(process.env.FAIR_REVIEWS_BASE_URL&&url.origin===new URL(base).origin&&['/api/saved-fairs','/evento'].includes(url.pathname)){
                const req=route.request(),result=await invoke(url.pathname==='/evento'?eventHandler:handler,{method:req.method(),headers:req.headers(),query:Object.fromEntries(url.searchParams),body:req.postData()});
                return route.fulfill({status:result.status,headers:result.headers,body:result.body});
            }
            if(url.origin===new URL(base).origin||url.hostname==='cdnjs.cloudflare.com'||url.hostname==='fonts.gstatic.com'||url.hostname==='fonts.googleapis.com')return route.continue();
            return route.abort();
        });
        const page=await context.newPage();page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
        let section=page.locator('#fair-reviews');
        const overflow=async()=>{assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+width+' page overflow');const b=await section.boundingBox();assert(b.x>=0&&b.x+b.width<=width+1,name+width+' section overflow')};
        const screenshot=async(label)=>{fs.mkdirSync(path.join(root,'.local/verifiche/recensioni-fiere'),{recursive:true});await section.scrollIntoViewIfNeeded();if(await section.evaluate(el=>Boolean(el.closest('dialog')))){await page.screenshot({path:path.join(root,`.local/verifiche/recensioni-fiere/${name}-${width}-${label}-viewport.png`)});await section.locator('[type=submit]').scrollIntoViewIfNeeded();await page.screenshot({path:path.join(root,`.local/verifiche/recensioni-fiere/${name}-${width}-${label}-azioni.png`)});}else await section.screenshot({path:path.join(root,`.local/verifiche/recensioni-fiere/${name}-${width}-${label}.png`)});};
        const next=async()=>section.locator('[type=submit]').click();
        const step=async(n)=>{await page.waitForFunction(n=>document.querySelector('.fr-progress')?.getAttribute('aria-valuenow')===String(n),n);assert.equal(await page.locator('#authOverlay').isVisible(),false);};
        await page.goto(base+'/fiere/'+sample.id);await section.getByRole('button',{name:'Scrivi una recensione',exact:true}).click();await step(1);
        await next();await section.locator('[data-fr-error]').waitFor({state:'visible'});
        await section.locator('[name=visit_month]').fill('2025-02');await section.locator('[name=sector]').selectOption('artigianato');await next();await step(2);
        await next();await section.locator('[data-fr-error]').waitFor({state:'visible'});
        await section.locator('[name=rating][value="4"]').check();await section.locator('[name=organization][value="5"]').check();await screenshot('valutazioni');await overflow();await next();await step(3);
        const body='Buona organizzazione e pubblico interessato ai prodotti del mio banco. Tornerei per una prossima edizione. <img src=x onerror="window.qaXss=true">';
        await section.locator('[name=body]').fill(body);await section.locator('[name=recommend][value=yes]').check();await next();await step(4);assert.equal(writes,0);await screenshot('riepilogo-guest');await overflow();
        await page.reload();await section.getByRole('button',{name:'Riprendi la recensione'}).click();await step(4);assert.equal(await section.locator('.fr-review-body').textContent(),body);assert.equal(await page.evaluate(()=>window.qaXss),undefined);
        await next();await section.locator('[data-fr-error]').waitFor({state:'visible'});assert.equal(await page.locator('#authOverlay').isVisible(),false);
        await section.locator('[name=confirmed]').check();await next();await page.locator('#registerForm').waitFor({state:'visible'});assert.equal(writes,0);
        assert((await page.locator('#authContextMsg').textContent()).includes('recensione'));assert.equal(await page.locator('#regTelefono').getAttribute('required'),'');assert.equal(await page.locator('#regPromoOptIn').getAttribute('required'),null);await page.locator('#regPromoOptIn').uncheck();
        await page.keyboard.press('Escape');await section.locator('.fr-form').waitFor({state:'visible'});assert.equal(await section.locator('.fr-review-body').textContent(),body);
        await next();await page.locator('#tabLogin').click();await page.locator('#loginEmail').fill('qa@example.invalid');await page.locator('#loginPassword').fill('qa-password');await page.locator('#loginBtn').click();
        await section.getByRole('button',{name:'Pubblica la recensione',exact:true}).waitFor();assert.equal(writes,0);assert.equal(await section.locator('.fr-review-body').textContent(),body);
        failSave=true;await next();await section.locator('[data-fr-error]').waitFor({state:'visible'});assert.equal(rows.length,0);failSave=false;
        await next();await section.locator('.fr-success').waitFor();assert.equal(rows.length,1);assert.equal(rows[0].user_id,uidA);assert.equal(await section.locator('.fr-review-body').textContent(),body);await screenshot('pubblicata');await overflow();
        assert.equal(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k.startsWith('fair_review_v1:')).length),0);
        await page.evaluate(()=>qaIdentity(null));await section.getByRole('button',{name:'Scrivi una recensione',exact:true}).click();await step(1);
        await section.locator('[name=visit_month]').fill('2024-02');await section.locator('[name=sector]').selectOption('alimentare');await next();await step(2);
        await page.evaluate(id=>qaIdentity(id),uidB);await section.getByRole('button',{name:'Scrivi una recensione',exact:true}).click();await step(1);assert.equal(await section.locator('[name=sector]').inputValue(),'');
        await page.evaluate(()=>qaIdentity(null));await section.getByRole('button',{name:'Riprendi la recensione'}).click();await step(2);
        await page.goto(base+'/fiere/'+other.id);await section.getByRole('button',{name:'Scrivi una recensione',exact:true}).click();await step(1);assert.equal(await section.locator('[name=sector]').inputValue(),'');
        await page.goto(base+'/evento?id='+managed.id);await section.getByRole('button',{name:'Scrivi una recensione',exact:true}).click();await step(1);assert((await section.locator('.fr-context').textContent()).includes(managed.title));
        await page.goto(base+'/fiere?q=Faustino');await page.locator('.fiere-card[data-event-id="'+sample.id+'"] .fiere-card-button').click();section=page.locator('#detail-reviews');
        await section.getByRole('button',{name:'Riprendi la recensione'}).click();await step(2);await screenshot('calendario');await overflow();
        await section.locator('[name=rating][value="3"]').check();await next();await step(3);await section.locator('[name=body]').fill('Esperienza per verificare la registrazione alla fine del percorso, con bozza conservata.');await section.locator('[name=recommend][value=maybe]').check();await next();await step(4);await section.locator('[name=confirmed]').check();await next();await page.locator('#registerForm').waitFor({state:'visible'});assert.equal(await page.locator('#fair-dialog').isVisible(),false);
        await page.locator('#regNome').fill('Mario');await page.locator('#regCognome').fill('QA');await page.locator('#regEmail').fill('qa@example.invalid');await page.locator('#regTelefono').fill('3471234567');await page.locator('#regPassword').fill('QaTest-pass123!');await page.locator('#regTermsAccepted').check();await page.waitForTimeout(2700);await page.locator('#registerBtn').click();
        await page.locator('#authOverlay').waitFor({state:'hidden'});await page.locator('#fair-dialog').waitFor({state:'visible'});await section.getByRole('button',{name:'Pubblica la recensione',exact:true}).waitFor();assert.equal(rows.length,1);
        await page.evaluate(()=>document.documentElement.classList.add('admin-dark'));await screenshot('dark');await overflow();
        // An in-flight write must never leave another account's draft visible.
        delaySave=350;const sent=page.waitForRequest(r=>r.url().includes('/api/saved-fairs?reviews=1')&&r.method()==='POST');await next();await sent;await page.evaluate(()=>qaIdentity(null));
        await section.getByRole('button',{name:'Scrivi una recensione',exact:true}).waitFor();assert.equal(await section.locator('.fr-form').count(),0);
        await page.waitForTimeout(450);assert.equal(await section.locator('.fr-success').count(),0);delaySave=0;
        // Public retry and pagination use real API validation over isolated fixtures.
        failRead=true;await page.goto(base+'/fiere/'+sample.id);section=page.locator('#fair-reviews');await section.getByRole('button',{name:'Riprova a caricare',exact:true}).waitFor();failRead=false;
        rows=Array.from({length:12},(_,i)=>({id:'public-'+i,kind:'catalog',fair_id:sample.id,author:'Ambulante QA',visit_month:'2025-02-01',sector:'artigianato',rating:4,body:'Esperienza pubblica simulata per verificare la paginazione delle recensioni.',recommend:'yes',created_at:'2026-11-04'}));
        await section.getByRole('button',{name:'Riprova a caricare',exact:true}).click();await section.locator('.fr-review').nth(9).waitFor();assert.equal(await section.locator('.fr-review').count(),10);await section.getByRole('button',{name:'Mostra altre recensioni'}).click();await section.locator('.fr-review').nth(11).waitFor();assert.equal(await section.locator('.fr-review').count(),12);
        assert.deepEqual(errors,[]);console.log('PASS browser '+name+' '+width+': steps, validation, reload, auth cancellation/login/registration, retry, publication, XSS, identity/fair isolation, organizer, calendar, dark, overflow');
    }finally{await browser.close()}
}
(async()=>{
    await apiChecks();const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');await new Promise(r=>server.listen(0,'127.0.0.1',r));
    const base=process.env.FAIR_REVIEWS_BASE_URL||'http://127.0.0.1:'+server.address().port;
    for(const [name,width,height]of [['chromium',1440,1000],['chromium',820,1000],['chromium',320,720],['webkit',390,844]]){
        if(process.env.FAIR_REVIEWS_TEST_WIDTH&&Number(process.env.FAIR_REVIEWS_TEST_WIDTH)!==width)continue;
        await browserChecks(pw[name],name,width,height,base);
    }
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=nativeFetch;server.close()});
