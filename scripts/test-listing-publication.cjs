// A-01: real wizard in Chromium/WebKit; all remote traffic is simulated.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const playwright = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const owner = '11111111-1111-4111-8111-111111111111';
const other = '22222222-2222-4222-8222-222222222222';
const authKey = 'sb-publication-test-auth-token';
const photo = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAACXBIWXMAAAPoAAAD6AG1e1JrAAAAEUlEQVQImWNQyVyLFTEMLQkAikpOgV4lvm4AAAAASUVORK5CYII=', 'base64');
const key = id => 'subingresso_draft_v2_' + id;
const session = id => ({user:{id},access_token:'fixture-token',refresh_token:'fixture-refresh',expires_at:9999999999});
const draft = id => ({_userId:id,stato:'Vendita',regione:'Lombardia',comune:'Brescia',tipo:'Mercato settimanale',giorni:'Sabato',merce:'Abbigliamento e accessori',superficie:'24',prezzo:'15000',titolo:'Posteggio del sabato a Brescia',descrizione:'Posteggio per abbigliamento al mercato del sabato, ventiquattro metri quadrati.',nome:'Contatto fixture',tel:'3471234567',step:6,photoCount:0,pubChoice:'free'});
const client = `
window.__listeners=[];
window.__client={auth:{
getSession:async()=>({data:{session:JSON.parse(localStorage.getItem('${authKey}')||'null')}}),
refreshSession:async()=>{window.__refreshes=(window.__refreshes||0)+1;return __client.auth.getSession()},
setSession:async()=>__client.auth.getSession(),onAuthStateChange:fn=>{__listeners.push(fn);return {data:{subscription:{unsubscribe(){}}}}}
},rpc:async()=>({data:{nome:'Profilo',telefono:'3471234567'},error:null}),
from:()=>{const q={select(){return this},eq(){return this},or(){return this},update(v){(window.__profileWrites||=[]).push(v);return this},maybeSingle:async()=>({data:{is_admin:false},error:null}),then:(ok,no)=>Promise.resolve({data:[],error:null}).then(ok,no)};return q}};
window.supabase={createClient:()=>__client};`;
const auth = `window.getCurrentUser=async()=>JSON.parse(localStorage.getItem('${authKey}')||'null')?.user;window.openAuthModal=()=>{};`;
const analytics = 'window.SiteAnalytics={track(){},errorCode(e){return e?.code||"fixture"}};';
const server = http.createServer((req,res) => {
    let file = decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1) || 'index.html';
    if (!path.extname(file)) file += '.html';
    const full = path.resolve(root,file);
    if (!full.startsWith(root+path.sep)) return res.writeHead(403).end();
    const special = file==='js/auth.js' ? auth : ['js/site-analytics.js','js/page-view-tracker.js','js/personal-ads-tracker.js'].includes(file) ? analytics : file==='js/ui-components.js' ? '' : null;
    res.setHeader('Content-Type',file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.json')?'application/json':file.endsWith('.css')?'text/css':'text/javascript');
    if (special!==null) return res.end(special);
    if (file==='vendi.html' && process.env.FORM_TEST_HTML) return res.end(fs.readFileSync(process.env.FORM_TEST_HTML));
    fs.readFile(full,(err,data)=>err?res.writeHead(404).end():res.end(data));
});
const results = [];
const limits = [];
(async()=>{
    await new Promise(r=>server.listen(0,'127.0.0.1',r));
    const base='http://127.0.0.1:'+server.address().port;
    const engine=process.env.FORM_TEST_BROWSER||'chromium';
    const browser=await playwright[engine].launch({headless:true});
    async function fixture(options={}) {
        const state={rows:new Map(),posts:[],reads:[],uploads:0,checkouts:[],mode:options.mode||'ok',readMode:'ok',errors:[]};
        const context=await browser.newContext({viewport:{width:engine==='webkit'?390:1280,height:844},reducedMotion:'reduce'});
        await context.addInitScript(({authKey,stored,draftKey,draft})=>{
            if(!sessionStorage.getItem('seeded')){localStorage.setItem(authKey,JSON.stringify(stored));localStorage.setItem(draftKey,JSON.stringify(draft));sessionStorage.setItem('seeded','1')}
            const original=window.setTimeout;
            window.setTimeout=(fn,ms,...args)=>original(fn,ms===30000?120:ms,...args);
        },{authKey,stored:session(owner),draftKey:key(owner),draft:{...draft(owner),...options.draft}});
        await context.route('**/*',async route=>{
            const req=route.request(),url=new URL(req.url());
            if(url.origin===base) return route.continue();
            if(url.hostname==='cdn.jsdelivr.net') return route.fulfill({contentType:'text/javascript',body:client});
            if(!url.hostname.endsWith('.supabase.co')) return route.fulfill({body:''});
            const reply=(body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)}).catch(()=>{});
            if(url.pathname.endsWith('/rpc/validate_listing_location')) return reply(true);
            if(url.pathname.includes('/storage/')) {state.uploads++;return reply({});}
            if(url.pathname.endsWith('/create-checkout-session')) {state.checkouts.push(req.postDataJSON());return reply({error:'fixture checkout unavailable'},503);}
            if(url.pathname.endsWith('/annunci') && req.method()==='GET') {
                state.reads.push(url.search);
                if(state.readMode==='offline') return route.abort('failed');
                if(state.readMode==='invalid') return reply({unexpected:true});
                const id=url.searchParams.get('id')?.replace(/^eq\./,''),uid=url.searchParams.get('user_id')?.replace(/^eq\./,'');
                assert.equal(url.searchParams.get('select'),'id,user_id,status');
                const row=state.rows.get(id);
                if(state.readMode==='wrongOwner') return reply([{id,user_id:other,status:'active'}]);
                return reply(row && row.user_id===uid?[row]:[]);
            }
            if(url.pathname.endsWith('/annunci') && req.method()==='POST') {
                const form=req.postDataJSON(),mode=state.mode;
                state.posts.push(form);
                assert(form.id && form.user_id===owner);
                assert.equal(req.headers().prefer,'return=representation');
                const persisted=await page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key(owner));
                assert.equal(persisted.publication.id,form.id,'identity saved before POST');
                assert.equal(persisted.publication.attempted,true);
                if(mode==='noCommit') return route.abort('failed');
                if(mode==='auth') {state.mode='ok';return reply({code:'PGRST301',message:'JWT expired'},401);}
                if(mode==='expires' || mode==='images') {state.mode='ok';return reply({code:'PGRST204',message:mode==='expires'?'expires_at':'img_urls'},400);}
                if(mode==='conflict') return reply({code:'23505',message:'unrelated unique conflict'},409);
                if(state.rows.has(form.id)) return reply({code:'23505',message:'annunci_pkey'},409);
                const row={id:form.id,user_id:form.user_id,status:mode==='closed'?'deleted':'pending'};
                state.rows.set(form.id,row);
                if(mode==='lost' || mode==='lostUnreadable') return mode==='lost'?route.abort('failed'):route.fulfill({contentType:'application/json',body:'{unreadable'});
                if(mode==='conflictCommitted') return reply({code:'23505',message:'annunci_pkey'},409);
                if(mode==='timeout' || mode==='delayed') {await new Promise(r=>setTimeout(r,mode==='timeout'?300:90));}
                if(mode==='empty') return reply({});
                return reply(row);
            }
            return reply({});
        });
        const page=await context.newPage();
        page.setDefaultTimeout(10000);
        page.on('pageerror',err=>state.errors.push(err.message));
        await page.goto(base+'/vendi');
        await page.waitForFunction(()=>_draftReady && _step===6);
        const click=async()=>{await page.locator('#submitBtn').click();};
        const success=async()=>{await page.locator('#successMsg').waitFor({state:'visible'});assert.deepEqual(state.errors,[]);};
        const failed=async()=>{await page.waitForFunction(()=>!document.getElementById('submitBtn').disabled && !document.getElementById('stepError').classList.contains('hidden'));assert.equal(await page.locator('#successMsg').isVisible(),false);};
        return {page,context,state,click,success,failed};
    }
    async function run(name,fn){await fn();results.push({name,passed:true});console.log('PASS '+name);}
    try {
        for(const mode of ['ok','lost','lostUnreadable','timeout','empty','conflictCommitted']) await run(mode+'-reconciles-one-commit',async()=>{
            const f=await fixture({mode});await f.click();await f.success();assert.equal(f.state.posts.length,1);assert.equal(f.state.rows.size,1);
            assert.match(f.state.posts[0].id,/^[a-f0-9-]{36}$/);assert.equal(await f.page.evaluate(k=>localStorage.getItem(k),key(owner)),null);await f.context.close();
        });
        await run('double-submit-one-request',async()=>{
            const f=await fixture({mode:'delayed'});await f.page.evaluate(()=>{submitAnnuncio();submitAnnuncio();document.getElementById('annuncioForm').dispatchEvent(new Event('submit',{cancelable:true}));});await f.success();assert.equal(f.state.posts.length,1);await f.context.close();
        });
        await run('lost-response-reload-photos-and-promotion',async()=>{
            const f=await fixture({mode:'lost'});
            await f.page.locator('#fileInput').setInputFiles({name:'original.png',mimeType:'image/png',buffer:photo});
            await f.page.waitForFunction(()=>_files.length===1 && (!_photosUnsaved || _photoWriteFailed));
            const photosPersisted=await f.page.evaluate(()=>!_photoWriteFailed);
            if(engine==='chromium') assert(photosPersisted,'native IndexedDB photo persistence');
            if(!photosPersisted) limits.push('Native photo Blob persistence failed in WebKit runtime; the committed photo URL is still recovered without another upload.');
            await f.page.evaluate(()=>{_pubChoice='90d';_saveDraft();});
            f.state.readMode='offline';await f.click();await f.failed();
            const op=await f.page.evaluate(k=>JSON.parse(localStorage.getItem(k)).publication,key(owner));assert.equal(op.attempted,true);
            assert(await f.page.evaluate(k=>!!localStorage.getItem('last_post_time_'+k),owner));
            await f.page.reload();await f.page.waitForFunction(n=>_draftReady && _files.length===n,photosPersisted?1:0);
            assert.equal(await f.page.evaluate(()=>_pubChoice),'90d');
            if(photosPersisted) assert.deepEqual(await f.page.evaluate(async()=>Array.from(new Uint8Array(await _files[0].arrayBuffer()))),Array.from(photo));
            f.state.readMode='ok';await f.click();await f.success();
            assert.equal(f.state.posts.length,1);assert.equal(f.state.uploads,1);assert.equal(f.state.checkouts.length,1);
            assert.equal(f.state.posts[0].img_urls.length,1,'committed photo remains attached');
            assert.equal(f.state.checkouts[0].annuncio_id,op.id);assert.equal(f.state.checkouts[0].expected_amount_cents,22410);assert.equal(f.state.checkouts[0].offer,'publication_90d_v1');await f.context.close();
        });
        await run('no-commit-retry-same-id',async()=>{
            const f=await fixture({mode:'noCommit'});await f.click();await f.failed();f.state.mode='ok';await f.click();await f.success();
            assert.equal(f.state.posts.length,2);assert.equal(f.state.posts[0].id,f.state.posts[1].id);assert.equal(f.state.rows.size,1);await f.context.close();
        });
        await run('no-commit-reload-retry-same-id',async()=>{
            const f=await fixture({mode:'noCommit'});await f.click();await f.failed();await f.page.reload();await f.page.waitForFunction(()=>_draftReady && _step===6);
            f.state.mode='ok';await f.click();await f.success();assert.equal(f.state.posts[0].id,f.state.posts[1].id);assert.equal(f.state.rows.size,1);await f.context.close();
        });
        await run('response-body-timeout-is-reconciled',async()=>{
            const f=await fixture();
            await f.page.evaluate(()=>{
                const original=window.fetch;
                window.fetch=async(input,options)=>{
                    const res=await original(input,options);
                    if(options?.method==='POST' && String(input).includes('/rest/v1/annunci?')) return {ok:true,json:()=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('fixture body stalled','AbortError'))))};
                    return res;
                };
            });
            await f.click();await f.success();assert.equal(f.state.posts.length,1);assert.equal(f.state.rows.size,1);await f.context.close();
        });
        await run('committed-content-is-never-overwritten',async()=>{
            const f=await fixture({mode:'lost'});f.state.readMode='offline';await f.click();await f.failed();
            const first=structuredClone(f.state.posts[0]);
            await f.page.evaluate(()=>{document.getElementById('fTitolo').value='Titolo cambiato dopo la risposta persa';_saveDraft();});
            f.state.readMode='ok';await f.click();await f.success();assert.equal(f.state.posts.length,1);assert.deepEqual(f.state.posts[0],first);assert.equal(await f.page.evaluate(()=>window.__profileWrites?.length||0),0);await f.context.close();
        });
        for(const readMode of ['offline','invalid','wrongOwner']) await run('uncertain-'+readMode+'-blocks-retry',async()=>{
            const f=await fixture({mode:'lost'});f.state.readMode=readMode;await f.click();await f.failed();await f.click();await f.failed();assert.equal(f.state.posts.length,1);assert(await f.page.evaluate(k=>!!localStorage.getItem(k),key(owner)));await f.context.close();
        });
        for(const mode of ['conflict','closed']) await run(mode+'-is-not-success',async()=>{
            const f=await fixture({mode});await f.click();await f.failed();await f.click();await f.failed();assert.equal(f.state.checkouts.length,0);assert.equal(f.state.rows.size,mode==='closed'?1:0);assert(f.state.posts.every(p=>p.id===f.state.posts[0].id));await f.context.close();
        });
        for(const mode of ['auth','expires','images']) await run(mode+'-fallback-keeps-id',async()=>{
            const f=await fixture({mode});await f.click();await f.success();assert.equal(f.state.posts.length,2);assert.equal(f.state.posts[0].id,f.state.posts[1].id);assert.equal(f.state.rows.size,1);await f.context.close();
        });
        await run('storage-failure-blocks-insert',async()=>{
            const f=await fixture();await f.page.evaluate(()=>{Storage.prototype.setItem=function(){throw new Error('quota')};});await f.click();await f.failed();assert.equal(f.state.posts.length,0);await f.context.close();
        });
        await run('account-change-ignores-late-commit',async()=>{
            const f=await fixture({mode:'delayed'});await f.click();await f.page.waitForFunction(()=>_publicationOperation?.attempted);
            await f.page.evaluate(async({authKey,stored,draftKey,draft})=>{localStorage.setItem(draftKey,JSON.stringify(draft));localStorage.setItem(authKey,JSON.stringify(stored));await _syncDraftOwner();},{authKey,stored:session(other),draftKey:key(other),draft:draft(other)});
            await f.page.waitForTimeout(200);
            assert.equal(await f.page.locator('#successMsg').isVisible(),false);assert.equal(f.state.checkouts.length,0);
            assert.equal(await f.page.evaluate(k=>JSON.parse(localStorage.getItem(k))._userId,key(other)),other);
            assert.equal(await f.page.evaluate(()=>window.__profileWrites?.length||0),0);await f.context.close();
        });
        await run('new-intent-new-id-and-antispam',async()=>{
            const f=await fixture();await f.click();await f.success();const first=f.state.posts[0].id;
            await f.page.getByRole('button',{name:'Inserisci un altro'}).click();
            await f.page.evaluate(async d=>{await _applyPendingDraft(d);},draft(owner));await f.click();await f.failed();assert.equal(f.state.posts.length,1,'new listing still respects one minute');
            await f.page.evaluate(()=>{const real=Date.now;Date.now=()=>real()+61000;});await f.click();await f.success();assert.equal(f.state.rows.size,2);assert.notEqual(f.state.posts[1].id,first);await f.context.close();
        });
        for(const publication of [{id:'invalid',owner,attempted:true},{id:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',owner:other,attempted:true}]) await run('invalid-operation-'+publication.owner+'-'+publication.id,async()=>{
            const f=await fixture({draft:{publication}});await f.click();await f.failed();assert.equal(f.state.posts.length,0);await f.context.close();
        });
    } finally {
        await browser.close();await new Promise(r=>server.close(r));
        if(process.env.A01_PROOFS){fs.mkdirSync(process.env.A01_PROOFS,{recursive:true});fs.writeFileSync(path.join(process.env.A01_PROOFS,'publication-'+engine+'.json'),JSON.stringify({engine,passed:results.length,externalWrites:0,limits,results},null,2));}
    }
    console.log('PASS '+results.length+' publication scenarios ('+engine+'); no external writes.');
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
