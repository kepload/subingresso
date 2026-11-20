// Local-only PostgreSQL, Auth/provider fixtures and browser rows. No real accounts or email.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const assert = require('node:assert/strict');
const { stripTypeScriptTypes } = require('node:module');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const auth = read('js/auth.js');
const sql = read('PATCH_FAIR_SIGNUP_BADGE_20261120.sql');
const html = read('dashboard.html');
const id = n => '00000000-0000-4000-8000-' + String(n).padStart(12, '0');

async function database() {
    const { PGlite } = require(process.env.PGLITE_MODULE || '@electric-sql/pglite');
    const db = new PGlite();
    await db.exec(`
        CREATE ROLE anon; CREATE ROLE authenticated; CREATE ROLE service_role;
        CREATE SCHEMA auth; CREATE SCHEMA account_private; CREATE SCHEMA data_quality;
        CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,created_at timestamptz DEFAULT now(),last_sign_in_at timestamptz,email_confirmed_at timestamptz,raw_user_meta_data jsonb);
        CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql AS $$ SELECT current_setting('request.jwt.claim.role',true) $$;
        CREATE TABLE public.profiles(id uuid,nome text,cognome text,telefono text,email_digest boolean,email_stats boolean,is_admin boolean);
        CREATE FUNCTION data_quality.is_admin() RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$ SELECT coalesce((SELECT is_admin FROM public.profiles WHERE id=nullif(current_setting('request.jwt.claim.sub',true),'')::uuid),false) $$;
        CREATE TABLE public.blog_posts(slug text,category text,published_at timestamptz DEFAULT now());
        CREATE TABLE public.annunci(user_id uuid,status text,expires_at timestamptz);
        CREATE TABLE public.messaggi(mittente_id uuid,conversazione_id uuid);
        CREATE TABLE public.conversazioni(id uuid,venditore_id uuid,is_support boolean);
        INSERT INTO public.blog_posts(slug,category) VALUES
          ('migliori-fiere-lombardia','Fiere'),('mercatini-natale-lombardia-domande-costi-merce-2026','Fiere'),
          ('bolkestein-fiere-durata-concessione','Normativa'),('mercato-settimanale-fiera-differenze-posteggio','Guida'),
          ('comprare-posteggio','Guida'),('fiere-in-una-notizia-generica','News');
        INSERT INTO public.blog_posts VALUES('fiera-futura','Fiere',now()+interval '1 day');
        INSERT INTO auth.users(id,raw_user_meta_data) VALUES('${id(99)}','{"registration_path":"/fiere"}');
    `);
    await db.exec(sql);
    await db.exec(sql); // Idempotent; preexisting users are never inferred or rewritten.
    const cases = [
        ['/fiere', true], ['/fiera/san-faustino', true], ['/fiere/san-faustino', true],
        ['/blog/migliori-fiere-lombardia', true], ['/blog/bolkestein-fiere-durata-concessione', true],
        ['/blog/mercatini-natale-lombardia-domande-costi-merce-2026', true],
        ['/blog/mercato-settimanale-fiera-differenze-posteggio', false],
        ['/blog/comprare-posteggio', false], ['/blog/fiere-in-una-notizia-generica', false],
        ['/blog/fiera-futura', false], ['/blog/fiera-inventata', false],
        ['/', false], ['/annunci', false], ['/fiere-sbagliato', false],
        ['/?utm_source=fiere', false], [null, false], ['x'.repeat(201), false]
    ];
    for (const [index, [registrationPath, expected]] of cases.entries()) {
        const userId = id(index + 1);
        await db.query('INSERT INTO auth.users(id,raw_user_meta_data) VALUES($1,$2)', [userId, {registration_path:registrationPath}]);
        const {rows} = await db.query('SELECT count(*)::integer AS n FROM account_private.fair_signups WHERE user_id=$1', [userId]);
        assert.equal(rows[0].n, Number(expected), String(registrationPath));
    }
    // Editable Auth metadata and subsequent sign-ins cannot assign or remove a badge.
    await db.query('UPDATE auth.users SET raw_user_meta_data=$1,last_sign_in_at=now() WHERE id=$2', [{registration_path:'/fiere'}, id(12)]);
    await db.query('UPDATE auth.users SET raw_user_meta_data=$1 WHERE id=$2', [{registration_path:'/'}, id(1)]);
    assert.equal((await db.query('SELECT count(*)::integer AS n FROM account_private.fair_signups')).rows[0].n, 6);
    assert.equal((await db.query('SELECT count(*)::integer AS n FROM account_private.fair_signups WHERE user_id=$1', [id(99)])).rows[0].n, 0);
    for (const role of ['anon','authenticated']) {
        const {rows} = await db.query(`SELECT has_table_privilege($1,'account_private.fair_signups','SELECT') AS can_read,
          has_table_privilege($1,'account_private.fair_signups','INSERT') AS can_write,
          has_function_privilege($1,'account_private.is_fair_registration_path(text)','EXECUTE') AS can_classify`, [role]);
        assert.deepEqual(rows[0], {can_read:false,can_write:false,can_classify:false});
    }
    await db.exec(`SET ROLE anon`);
    await assert.rejects(db.query('SELECT public.admin_user_directory()'), /permission denied/);
    await db.exec(`RESET ROLE; SET ROLE authenticated`);
    await assert.rejects(db.query('SELECT public.admin_user_directory()'), /Accesso amministratore/);
    await db.exec(`RESET ROLE; INSERT INTO public.profiles(id,is_admin) VALUES('${id(99)}',true);
        SELECT set_config('request.jwt.claim.sub','${id(99)}',false); SET ROLE authenticated;`);
    const directory = (await db.query('SELECT public.admin_user_directory() AS result')).rows[0].result;
    assert.equal(directory.total, cases.length + 1);
    assert.equal(directory.users.filter(u=>u.registration_badge==='fiera').length, 6);
    assert(!JSON.stringify(directory).includes('registration_path'));
    await db.exec(`RESET ROLE; SELECT set_config('request.jwt.claim.sub','',false); SELECT set_config('request.jwt.claim.role','service_role',false); SET ROLE service_role;`);
    assert.equal((await db.query('SELECT public.admin_user_directory(0,2) AS result')).rows[0].result.users.length, 2);
    await db.close();
    console.log('PASS database: 17 provenienze, persistenza, nessuna attribuzione retroattiva, grant/RLS, admin e servizio, paginazione, idempotenza.');
}

async function registration() {
    const helper = auth.slice(auth.indexOf('function _getRegistrationPath()'), auth.indexOf('async function _linkValutatoreSession()'));
    const helpers = auth.slice(auth.indexOf('async function _registerBypass('), auth.indexOf('// ── Forgot Password'));
    let sent, fallback;
    const ctx = {window:{location:{href:'https://subingresso.it/fiere.html?email=private@example.it&utm_source=google'}}, URL,
        SUPABASE_URL:'https://fixture.invalid',SUPABASE_ANON_KEY:'public',PROMO_CONSENT_VERSION:'current',
        _supabase:{auth:{signInWithPassword:async()=>({error:{}}),signUp:async data=>{fallback=data;return {data:{},error:{}}}}},
        fetch:async (url,options)=>{sent=JSON.parse(options.body);return {ok:false,status:500,json:async()=>({})};},
        _showAuthError(){},_storePasswordCredential:async()=>{},_afterRegisterSuccess:async()=>{}};
    vm.createContext(ctx); vm.runInContext(helper+helpers,ctx);
    const get = href => {ctx.window.location.href=href;return vm.runInContext('_getRegistrationPath()',ctx);};
    for (const [url,expected] of [
        ['/fiere.html?email=private@example.it','/fiere'],['/fiera/san-faustino/','/fiera/san-faustino'],
        ['/blog?post=bolkestein-fiere-durata-concessione&token=private','/blog/bolkestein-fiere-durata-concessione'],
        ['/blog-template.html?post=migliori-fiere-lombardia','/blog/migliori-fiere-lombardia'],
        ['/blog/migliori-fiere-lombardia/','/blog/migliori-fiere-lombardia'],
        ['/blog?post=guida%2Fprivate','/blog'],['/?utm_source=fiere','/']
    ]) assert.equal(get('https://subingresso.it'+url),expected);
    get('https://subingresso.it/fiere?token=private');
    await vm.runInContext("_registerBypass('fixture@example.it','password','Ada','Rossi','3471234567')",ctx);
    assert.equal(sent.registration_path,'/fiere');
    assert.equal(fallback.options.data.registration_path,'/fiere');
    assert.equal(sent.promotional_email_opt_in,false);
    assert(!JSON.stringify(sent).includes('private'));
    const shared={};vm.runInNewContext(stripTypeScriptTypes(read('supabase/functions/_shared/input.ts')).replace(/export /g,''),shared);
    let handler, created;
    const client={auth:{admin:{createUser:async value=>{created=value;return {data:{user:{id:'fixture'}}};}}},from:()=>({upsert:async()=>({})})};
    vm.runInNewContext(stripTypeScriptTypes(read('supabase/functions/register-bypass/index.ts').replace(/^import .*;\r?\n/gm,'')),{
        ...shared,validEmail:shared.email,createClient:()=>client,Deno:{env:{get:()=> 'fixture'},serve:f=>handler=f},Request,Response,fetch:async()=>new Response('{}'),console
    });
    for (const registrationPath of ['/fiere','/blog/migliori-fiere-lombardia',null,'/fiere?private=1',{path:'/fiere'},'x'.repeat(201)]) {
        const r=await handler(new Request('https://fixture.invalid/register',{method:'POST',body:JSON.stringify({...sent,registration_path:registrationPath})}));
        assert.equal(r.status,200);
        assert.equal(created.user_metadata.registration_path,typeof registrationPath==='string'&&registrationPath.startsWith('/')&&!registrationPath.includes('?')?registrationPath:null);
        assert.equal(created.user_metadata.promotional_email_opt_in,false);
    }
    console.log('PASS registrazione: URL puliti, blog storico/canonico, bypass e fallback, input non valido ignorato, consensi conservati.');
}

async function rows() {
    const source=html.slice(html.indexOf('function _isToday('),html.indexOf('async function loadAdminRecentUsers()'));
    const ctx={escapeHTML:s=>String(s).replaceAll('<','&lt;'),formatFullName:(n,c)=>[n,c].filter(Boolean).join(' ')};
    vm.createContext(ctx);vm.runInContext(source,ctx);
    ctx.user={id:'fixture',email:'fixture@example.invalid',nome:'Ada',registration_badge:'fiera'};
    assert(vm.runInContext('_buildUserRow(user)',ctx).includes('>Fiera</span>'));
    for(const badge of [null,undefined,'<img onerror=alert(1)>']){ctx.user.registration_badge=badge;assert(!vm.runInContext('_buildUserRow(user)',ctx).includes('>Fiera</span>'));}
    if(!process.env.PLAYWRIGHT_MODULE)return console.log('PASS rendering e valori inattesi; browser non richiesto.');
    const {chromium,webkit}=require(process.env.PLAYWRIGHT_MODULE);
    const http=require('node:http');
    const server=http.createServer((req,res)=>{
        if(req.url.startsWith('/css/')) {const file=path.join(root,req.url.split('?')[0]);if(fs.existsSync(file)){res.setHeader('Content-Type','text/css');return res.end(fs.readFileSync(file));}}
        res.setHeader('Content-Type','text/html');res.end(`<!doctype html><html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/css/tailwind.css"><link rel="stylesheet" href="/css/admin-theme.css"></head><body><main style="max-width:900px;margin:24px auto;padding:12px"><div id="rows"></div></main><script>function escapeHTML(s){return String(s).replaceAll('<','&lt;')} function formatFullName(n,c){return [n,c].filter(Boolean).join(' ')}${source}\ndocument.getElementById('rows').innerHTML=_renderUsersWithDividers([{id:'one',email:'fiera@example.invalid',nome:'Ada',created_at:new Date().toISOString(),registration_badge:'fiera'},{id:'two',email:'mercato@example.invalid',nome:'Carlo',created_at:'2026-01-01',registration_badge:null}]);</script></body></html>`);
    });
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    try {
        for(const [name,engine,width] of [['chromium',chromium,1440],['chromium',chromium,320],['webkit',webkit,390]]){
            const browser=await engine.launch({headless:true});
            try {const page=await browser.newPage({viewport:{width,height:850}});
                for(const dark of [false,true]){
                    await page.goto('http://127.0.0.1:'+server.address().port);
                    await page.evaluate(dark=>document.documentElement.classList.toggle('admin-dark',dark),dark);
                    assert.equal(await page.getByText('Fiera',{exact:true}).count(),1);
                    const box=await page.getByText('Fiera',{exact:true}).boundingBox();assert(box.width>20&&box.height>10);
                    assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
                    if(process.env.FAIR_SIGNUP_QA_DIR){fs.mkdirSync(process.env.FAIR_SIGNUP_QA_DIR,{recursive:true});await page.screenshot({path:path.join(process.env.FAIR_SIGNUP_QA_DIR,`${name}-${width}-${dark?'dark':'light'}.png`)});}
                }
            }finally{await browser.close();}
        }
    }finally{server.close();}
    console.log('PASS browser: Chromium 1440/320 e WebKit 390, due temi, bollino solo sugli utenti contrassegnati, nessun overflow.');
}

(async()=>{await database();await registration();await rows();})().catch(error=>{console.error(error);process.exitCode=1;});
