// Dashboard/handler/asset reali, SDK e servizi simulati: nessun account o invio reale.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const artifacts = path.resolve(process.env.DASHBOARD_SESSION_QA_DIR || path.join(root, '.local/verifiche/c03-dashboard-session'));
const base = 'http://127.0.0.1:54203';
const results = [];
const A = { id:'11111111-1111-4111-8111-111111111111', email:'ada@example.invalid', nome:'Ada', cognome:'Fixture', telefono:'+393331234567' };
const B = { id:'22222222-2222-4222-8222-222222222222', email:'bea@example.invalid', nome:'Bea', cognome:'Seconda', telefono:'+393339876543' };

function init({ initial }) {
    const key = 'c03-fixture-session';
    if (localStorage.getItem(key) === null) localStorage.setItem(key, JSON.stringify(initial));
    window.qa = { callbacks:[], calls:[], writes:[], holds:JSON.parse(sessionStorage.getItem('c03-fixture-holds') || '[]'), pending:[] };
    Object.defineProperty(qa, 'user', { get:() => JSON.parse(localStorage.getItem(key)) });
    const user = actor => actor ? { ...actor, created_at:'2026-01-01T00:00:00Z', email_confirmed_at:'2026-01-01T00:00:00Z', user_metadata:{site_theme:'light'}, app_metadata:{providers:['email']} } : null;
    const session = () => qa.user ? {user:user(qa.user), access_token:'fixture-token', refresh_token:'fixture-refresh'} : null;
    const emit = () => qa.callbacks.forEach(cb => cb(qa.user ? 'SIGNED_IN' : 'SIGNED_OUT', session()));
    qa.setSession = actor => { localStorage.setItem(key, JSON.stringify(actor)); emit(); };
    addEventListener('storage', event => { if (event.key === key) emit(); });
    const profile = actor => actor ? { ...actor, avatar_url:'https://fixture.invalid/avatar-' + actor.id + '.png', is_admin:false, email_digest:true, email_stats:false } : null;
    const respond = (kind, value) => {
        qa.calls.push(kind);
        if (!qa.holds.includes(kind)) return Promise.resolve(value);
        return new Promise(resolve => qa.pending.push({kind, release:() => resolve(value)}));
    };
    qa.release = kind => { const pending = qa.pending.filter(item => item.kind === kind); qa.pending = qa.pending.filter(item => item.kind !== kind); pending.forEach(item => item.release()); };
    const wrapped = promise => { promise.abortSignal = () => promise; return promise; };
    const rpcData = (name, args, actor) => name === 'get_my_profile' ? (actor ? {nome:actor.nome,cognome:actor.cognome,telefono:actor.telefono} : null)
        : name === 'organizer_workspace' ? {profile:{organization_name:actor?.nome + ' Organizzazione privata', organization_type:'associazione', status:'approved', public_email:actor?.email, public_phone:actor?.telefono}, events:[]}
        : name === 'analytics_tracking_context' ? {user_id:actor?.id, excluded:false}
        : name === 'dashboard_seller_analytics' ? {listings:[],days:args?.p_days || 30}
        : name === 'dashboard_vetrina_stats' ? {listings:[]}
        : name === 'dashboard_vetrina_account' ? {orders:[],campaigns:[],summary:{},total:0} : [];
    function query(table) {
        let one = false, operation = 'select', values;
        const actor = qa.user;
        const q = new Proxy({}, {get(_, key) {
            if (key === 'then') return (resolve, reject) => {
                if (operation !== 'select') qa.writes.push({table, operation, values, actor:actor?.id});
                return respond(operation === 'select' ? table : 'write-profile', {data:table === 'profiles' ? (one ? profile(actor) : [profile(actor)]) : [], error:null, count:0}).then(resolve,reject);
            };
            return (...args) => { if (['single','maybeSingle'].includes(key)) one = true; if (['upsert','insert','update','delete'].includes(key)) { operation = key; values = args[0]; } return q; };
        }});
        return q;
    }
    window.qaClient = {
        auth:{
            getUser:() => qa.throwAuth ? Promise.reject(Error('Fixture offline')) : respond('auth', {data:{user:qa.authError ? null : user(qa.user)},error:qa.authError ? {message:'Fixture session expired'} : null}),
            getSession:async() => ({data:{session:session()},error:null}),
            onAuthStateChange:cb => { qa.callbacks.push(cb); return {data:{subscription:{unsubscribe(){}}}}; },
            signOut:async() => { qa.setSession(null); return {error:null}; },
            resetPasswordForEmail:email => { qa.writes.push({reset:email}); return respond('password', {error:null}); }
        },
        from:query,
        rpc:(name,args) => wrapped(respond(name, {data:rpcData(name,args,qa.user),error:null})),
        storage:{from:() => ({upload:() => respond('avatar', {error:null}),getPublicUrl:() => ({data:{publicUrl:'https://fixture.invalid/late-avatar.png'}})})},
        channel:() => ({on(){return this;},subscribe(){return this;}}), removeChannel:async()=>{}
    };
    sessionStorage.setItem('_vp','1');
}

async function fixture(engine, name, width, height) {
    const browser = await engine.launch({headless:true});
    const context = await browser.newContext({viewport:{width,height},hasTouch:width < 500,reducedMotion:'reduce'});
    await context.addInitScript(init,{initial:A});
    const errors = [], externalMutations = [];
    await context.route('**/*', async route => {
        const request = route.request(), url = new URL(request.url());
        if (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('supabase-js')) return route.fulfill({contentType:'text/javascript',body:'window.supabase={createClient:()=>window.qaClient}'});
        if (url.origin !== base) {
            if (!['GET','HEAD'].includes(request.method())) externalMutations.push({host:url.hostname,path:url.pathname,method:request.method()});
            return route.fulfill({status:200,contentType:url.pathname.endsWith('.css')?'text/css':'application/json',body:url.pathname.endsWith('.css')?'':'[]'});
        }
        let relative = url.pathname.slice(1);
        if (!relative) return route.fulfill({contentType:'text/html',body:'<!doctype html><title>Fixture home</title>'});
        if (!path.extname(relative)) relative += '.html';
        const file = path.resolve(root,relative);
        if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return route.fulfill({status:404,body:''});
        return route.fulfill({contentType:({'.html':'text/html; charset=utf-8','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'})[path.extname(file)] || 'application/octet-stream',body:fs.readFileSync(file)});
    });
    const page = await context.newPage();
    page.on('pageerror',error => errors.push(error.message));
    const other = await context.newPage();
    await other.goto(base + '/');
    const check = (condition, message) => { assert(condition,message); results.push({browser:name,width,check:message}); };
    const go = async(actor=A, query='?area=normale') => {
        await page.goto(base + '/');
        await other.evaluate(actor => qa.setSession(actor),actor);
        await page.goto(base + '/dashboard' + query);
        await page.waitForFunction(phone => document.getElementById('pTelefono').value === phone,actor.telefono);
    };
    const open = async() => { await page.locator('.dashboard-user button').click(); await page.locator('#profileNormalPanel').waitFor({state:'visible'}); };
    const clean = async(label) => {
        await page.waitForFunction(() => !_currentUser && document.getElementById('profiloModal').classList.contains('hidden'));
        const state = await page.evaluate(() => ({
            owner:_currentUser?.id || null, ready:_profileReady, locked:document.body.style.overflow,
            inputs:[...document.querySelectorAll('#profiloModal input')].map(el => ({value:el.type === 'checkbox' ? '' : el.value,checked:el.checked})),
            text:['userEmailDisplay','profileMemberSince','profileEmailStatus','profileLoginMethod','profileSecurityMessage','pTelefonoHint','profileOrganizerContent','userEmail','profileNameDisplay'].map(id => document.getElementById(id)?.textContent || '').join(' '),
            images:document.querySelectorAll('#avatarContainer img,#welcomeAvatar img').length,
            href:document.getElementById('profilePublicLink').getAttribute('href')
        }));
        check(state.owner === null && !state.ready && state.locked === '', label + ': identità revocata e scroll libero');
        check(state.inputs.every(input => input.value === '' && !input.checked),label + ': tutti i campi e consensi svuotati');
        check(!/Ada|Fixture|ada@|393331234567|Organizzazione privata/.test(state.text) && !state.images && !state.href,label + ': recapiti, avatar, metadati, link e contenuto organizzatore rimossi');
    };
    try {
        await go(); await open();
        check(await page.locator('#pNome').inputValue() === A.nome,'Account valido: apertura tramite clic reale');
        await page.locator('#pTelefono').dispatchEvent('input');
        await page.locator('#profileOrganizerTab').click();
        await page.waitForFunction(() => document.getElementById('profileOrganizerContent').textContent.includes('Ada Organizzazione privata'));
        await page.screenshot({path:path.join(artifacts,`${name}-${width}-before-logout.png`)});
        await other.evaluate(() => qa.setSession(null));
        if (process.env.DASHBOARD_SESSION_BASELINE === '1') {
            await page.waitForFunction(() => _currentUser === null);
            await page.locator('.dashboard-user button').click();
            check(await page.locator('#pNome').isVisible() && await page.locator('#pNome').inputValue() === A.nome,'BASELINE: clic reale riapre i dati di A dopo logout da altra scheda');
            await page.screenshot({path:path.join(artifacts,`${name}-${width}-baseline-leak.png`)});
            return;
        }
        await clean('Logout con dialogo aperto');
        await page.locator('#notLoggedIn button').click();
        check(!await page.locator('#profiloModal').isVisible(),'Dopo logout: clic reale richiede accesso e non riapre il profilo');
        await page.evaluate(() => closeAuthModal());
        await page.evaluate(() => goToProfilo('normal'));
        check(!await page.locator('#profiloModal').isVisible(),'Handler profilo nega apertura senza identità');
        await page.screenshot({path:path.join(artifacts,`${name}-${width}-after-logout.png`)});

        await go(); await open(); await page.locator('.profile-close').click();
        await other.evaluate(() => qa.setSession(null)); await clean('Logout con dialogo chiuso');

        // Identità cambiata senza callback: il clic deve verificare il server prima di mostrare i campi.
        await go();
        await page.evaluate(() => localStorage.setItem('c03-fixture-session','null'));
        await page.locator('.dashboard-user button').click();
        check(!await page.locator('#profiloModal').isVisible() && await page.locator('#authOverlay').isVisible(),'Controllo di apertura senza callback: accesso richiesto');
        await page.evaluate(() => closeAuthModal());
        await clean('Identità assente al controllo di apertura');

        // Apertura in attesa, poi logout e risposta getUser vecchia.
        await go(); await page.evaluate(() => qa.holds.push('auth'));
        await page.locator('.dashboard-user button').click();
        await page.waitForFunction(() => qa.pending.some(item => item.kind === 'auth'));
        check(!await page.locator('#profiloModal').isVisible(),'Nessun dato mostrato prima della verifica identità');
        await other.evaluate(() => qa.setSession(null));
        await page.evaluate(() => qa.release('auth')); await clean('Risposta apertura tardiva di A');

        // Rientro nello stesso account: il listener riavvia il bootstrap e rilegge i dati.
        await other.evaluate(actor => qa.setSession(actor),A);
        await page.waitForFunction(phone => document.getElementById('pTelefono').value === phone,A.telefono);
        await open(); check(await page.locator('#userEmailDisplay').textContent() === A.email,'Rientro dopo logout: profilo nuovamente verificato');

        // Cambio diretto A -> B: la cancellazione è sincrona prima della nuova navigazione.
        const beforeReload = await page.evaluate(actor => { qa.setSession(actor); return {name:document.getElementById('pNome').value,email:document.getElementById('userEmailDisplay').textContent,hidden:document.getElementById('profiloModal').classList.contains('hidden')}; },B);
        check(beforeReload.name === '' && beforeReload.email === '' && beforeReload.hidden,'A→B: svuotamento sincrono prima del ricaricamento');
        await page.waitForFunction(phone => document.getElementById('pTelefono').value === phone,B.telefono);
        await open(); check(await page.locator('#pNome').inputValue() === B.nome && await page.locator('#userEmailDisplay').textContent() === B.email,'A→B: il nuovo profilo contiene soltanto B');
        await page.screenshot({path:path.join(artifacts,`${name}-${width}-account-b.png`)});

        await page.locator('#pNome').fill('Bea aggiornata');
        await page.evaluate(() => qa.callbacks.forEach(callback => callback('TOKEN_REFRESHED',{user:qa.user})));
        check(await page.locator('#pNome').inputValue() === 'Bea aggiornata' && await page.locator('#profiloModal').isVisible(),'Rinnovo sessione dello stesso account conserva il modulo');
        await page.locator('#profileForm button[type="submit"]').click();
        await page.waitForFunction(() => qa.writes.length === 1 && !document.querySelector('#profileForm button[type="submit"]').disabled);
        check(await page.evaluate(() => qa.writes[0].values.id === '22222222-2222-4222-8222-222222222222' && qa.writes[0].values.nome === 'Bea aggiornata'),'Account valido: salvataggio reale del form su provider simulato');

        await go(); await page.evaluate(() => qa.holds.push('auth'));
        await page.locator('.dashboard-user button').click();
        await page.waitForFunction(() => qa.pending.some(item => item.kind === 'auth'));
        await page.evaluate(() => { closeProfiloModal(); qa.release('auth'); });
        check(!await page.locator('#profiloModal').isVisible(),'Annullare un’apertura in attesa impedisce la riapertura tardiva');

        // Cambio non ancora notificato dal client SDK: il server identifica B al clic.
        await go();
        await page.evaluate(actor => localStorage.setItem('c03-fixture-session',JSON.stringify(actor)),B);
        await page.locator('.dashboard-user button').click();
        await page.waitForFunction(phone => document.getElementById('pTelefono').value === phone,B.telefono);
        await open();
        check(await page.locator('#pNome').inputValue() === B.nome,'A→B senza callback: apertura autorizzata soltanto dopo nuovo bootstrap');

        // Controllo server negativo e guasto di rete: nessuna apertura con i dati in memoria.
        for (const failure of ['authError','throwAuth']) {
            await go(); await page.evaluate(failure => qa[failure] = true,failure);
            await page.locator('.dashboard-user button').click();
            await page.evaluate(() => closeAuthModal());
            await clean('Verifica identità fallita ' + failure);
        }

        // Dati organizzatore arrivati dopo la chiusura: il contenuto deve restare vuoto.
        await go(); await open();
        await page.evaluate(() => qa.holds.push('organizer_workspace'));
        await page.locator('#profileOrganizerTab').click();
        await page.waitForFunction(() => qa.pending.some(item => item.kind === 'organizer_workspace'));
        await other.evaluate(() => qa.setSession(null));
        await page.waitForFunction(() => !_currentUser);
        await page.evaluate(() => qa.release('organizer_workspace'));
        await clean('Risposta organizzatore tardiva di A');

        // Salvataggio iniziato da A: la risposta non aggiorna baseline o UI dopo l'uscita.
        await go(); await open();
        await page.evaluate(() => qa.holds.push('write-profile'));
        await page.locator('#pNome').fill('Ada modificata');
        await page.locator('#profileForm button[type="submit"]').click();
        await page.waitForFunction(() => qa.pending.some(item => item.kind === 'write-profile'));
        await other.evaluate(() => qa.setSession(null));
        await page.waitForFunction(() => !_currentUser);
        await page.evaluate(() => qa.release('write-profile'));
        await clean('Salvataggio tardivo di A');
        check(await page.evaluate(() => qa.writes.length === 1 && qa.writes[0].values.id === '11111111-1111-4111-8111-111111111111'),'Scrittura simulata resta legata ad A');

        // Upload iniziato da A: nessun upsert né avatar ripristinato quando termina dopo logout.
        await go(); await open();
        await page.evaluate(() => qa.holds.push('avatar'));
        await page.locator('#avatarInput').setInputFiles({name:'fixture.png',mimeType:'image/png',buffer:Buffer.from('fixture')});
        await page.waitForFunction(() => qa.pending.some(item => item.kind === 'avatar'));
        await other.evaluate(() => qa.setSession(null));
        await page.waitForFunction(() => !_currentUser);
        await page.evaluate(() => qa.release('avatar'));
        await clean('Upload avatar tardivo di A');
        check(await page.evaluate(() => qa.writes.length === 0),'Upload tardivo: nessuna scrittura profilo dopo logout');

        // Provider reset simulato: un vecchio successo non deve ripopolare il pannello.
        await go(); await open();
        await page.evaluate(() => qa.holds.push('password'));
        await page.locator('#profilePasswordButton').click();
        await page.waitForFunction(() => qa.pending.some(item => item.kind === 'password'));
        await other.evaluate(() => qa.setSession(null));
        await page.waitForFunction(() => !_currentUser);
        await page.evaluate(() => qa.release('password'));
        await clean('Risposta reset password tardiva di A');

        // Bootstrap reale: logout durante SELECT profilo o RPC privata, poi rilascio A.
        for (const kind of ['auth','profiles','get_my_profile']) {
            await go();
            await page.evaluate(kind => sessionStorage.setItem('c03-fixture-holds',JSON.stringify([kind])),kind);
            await page.reload();
            await page.waitForFunction(kind => qa.pending.some(item => item.kind === kind),kind);
            await other.evaluate(() => qa.setSession(null));
            await page.evaluate(kind => qa.release(kind),kind);
            await clean('Bootstrap tardivo ' + kind);
            await page.evaluate(() => sessionStorage.removeItem('c03-fixture-holds'));
        }
        for (const kind of ['auth','profiles','get_my_profile']) {
            await go();
            await page.evaluate(kind => sessionStorage.setItem('c03-fixture-holds',JSON.stringify([kind])),kind);
            await page.reload();
            await page.waitForFunction(kind => qa.pending.some(item => item.kind === kind),kind);
            const stale = await page.evaluate(({kind, actor}) => {
                sessionStorage.removeItem('c03-fixture-holds');
                qa.setSession(actor);
                qa.release(kind);
                return Promise.resolve().then(() => Promise.resolve()).then(() => ({
                    name:document.getElementById('pNome').value,
                    phone:document.getElementById('pTelefono').value,
                    email:document.getElementById('userEmailDisplay').textContent,
                    ready:_profileReady
                }));
            },{kind, actor:B});
            check(stale.name === '' && stale.phone === '' && stale.email === '' && !stale.ready,'Bootstrap tardivo ' + kind + ' A→B: risposta A non applicata');
            await page.waitForFunction(phone => document.getElementById('pTelefono').value === phone,B.telefono);
            await open();
            check(await page.locator('#pNome').inputValue() === B.nome && await page.locator('#userEmailDisplay').textContent() === B.email,'Bootstrap tardivo ' + kind + ' A→B: nuovo account riletto');
        }
        check(externalMutations.length === 0,'Nessuna mutazione esterna inviata');
        check(errors.length === 0,'Nessun errore JavaScript durante i percorsi' + (errors.length ? ': ' + errors.join(' | ') : ''));
    } finally { await context.close(); await browser.close(); }
}

(async() => {
    fs.mkdirSync(artifacts,{recursive:true});
    for (const [engine,name,width,height] of [[chromium,'chromium',1440,900],[chromium,'chromium',768,900],[chromium,'chromium',320,740],[webkit,'webkit',390,844]]) {
        await fixture(engine,name,width,height);
        console.log(`PASS ${name} ${width}px`);
    }
    fs.writeFileSync(path.join(artifacts,process.env.DASHBOARD_SESSION_BASELINE === '1' ? 'baseline-results.json' : 'results.json'),JSON.stringify(results,null,2));
    console.log(`PASS ${results.length} controlli`);
})().catch(error => { fs.mkdirSync(artifacts,{recursive:true}); fs.writeFileSync(path.join(artifacts,'partial-results.json'),JSON.stringify({results,error:error.stack},null,2)); console.error(error); process.exitCode = 1; });
