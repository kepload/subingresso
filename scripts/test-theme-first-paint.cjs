// HTML/CSS originali, autenticazione simulata: nessuna scrittura su account reali.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const {execFileSync} = require('node:child_process');
const assert = require('node:assert/strict');
const {chromium, webkit} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const out = process.env.THEME_PAINT_QA_DIR;
const authKey = 'sb-mhfbtltgwibwmsudsuvf-auth-token', cacheKey = '_si_theme_preference_v1';
const published = new Map(), results = [];
const read = file => published.get(file) || fs.readFileSync(path.join(root,file),'utf8');
if(out) fs.mkdirSync(out,{recursive:true});
function fixture(file, baseline) {
    let html = baseline ? execFileSync('git',['show','696f9f5:'+file],{cwd:root,encoding:'utf8'}) : read(file);
    html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, tag=>tag.includes('/js/admin-theme.js')?tag:'');
    html = html.replace('<head>','<head><base href="/">');
    const mock = `<script>
const qaSession=JSON.parse(localStorage.getItem('${authKey}'));
window.qaCallbacks=[];window.qaDelay=900;window.qaWrites=0;
const _supabase={auth:{getSession:async()=>({data:{session:qaSession}}),getUser:async()=>{await new Promise(r=>setTimeout(r,qaDelay));return{data:{user:{id:'paint-owner',user_metadata:{site_theme:new URLSearchParams(location.search).get('theme')||'dark'}}}};},onAuthStateChange:fn=>{qaCallbacks.push(fn);return{};}}};
${file==='dashboard.html'?"loadingState.classList.add('hidden');dashContent.classList.remove('hidden');welcomeTitle.textContent='Il tuo profilo';":''}
${file==='organizzatore.html'?"organizerLoading.hidden=true;organizerWorkspace.hidden=false;":''}
</script>`;
    return html.replace('</body>',mock+'</body>');
}
const server=http.createServer((req,res)=>{
    const url=new URL(req.url,'http://localhost');
    if(url.pathname.startsWith('/qa/')) {
        res.setHeader('Content-Type','text/html; charset=utf-8');
        return res.end(fixture(url.pathname.slice(4),url.searchParams.has('baseline')));
    }
    if(url.pathname==='/js/admin-theme.js'&&url.searchParams.has('old')) {
        res.setHeader('Content-Type','text/javascript');
        return res.end(execFileSync('git',['show','696f9f5:js/admin-theme.js'],{cwd:root}));
    }
    const file=path.resolve(root,'.'+url.pathname);
    if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;return res.end();}
    res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':file.endsWith('.woff')?'font/woff':'application/octet-stream');
    // Ritardo CSS deliberato: deve bloccare il disegno, anche a cache fredda.
    setTimeout(()=>res.end(published.get(path.relative(root,file).replaceAll('\\','/'))||fs.readFileSync(file)),file.endsWith('admin-theme.css')?180:0);
});
async function run(engine,name,width){
    const browser=await engine.launch({headless:true});
    const base='http://127.0.0.1:'+server.address().port;
    try {
        const cases=[
            {label:'prima della correzione',baseline:true,cache:'dark',file:'dashboard.html',theme:'dark'},
            {label:'ricaricamento scuro',cache:'dark',file:'dashboard.html',theme:'dark'},
            {label:'vecchia sessione senza cache',file:'dashboard.html',theme:'dark'},
            {label:'cache di altro account',cache:'foreign',file:'dashboard.html',theme:'dark'},
            {label:'cache corrotta',cache:'corrupt',file:'dashboard.html',theme:'dark'},
            {label:'home scura',cache:'dark',file:'index.html',theme:'dark'},
            {label:'organizzatore scuro',cache:'dark',file:'organizzatore.html',theme:'dark'},
            {label:'profilo chiaro esplicito',cache:'light',file:'dashboard.html',theme:'light'},
            {label:'anonimo con cache scura residua',anonymous:true,cache:'dark',file:'index.html',theme:'light'},
            {label:'preferenza iniziale mancante',file:'dashboard.html',theme:'light'},
            {label:'storage bloccato',blocked:true,file:'dashboard.html',theme:'light'}
        ];
        for(const c of cases){
            const context=await browser.newContext({viewport:{width,height:900},colorScheme:'dark',reducedMotion:'reduce'});
            await context.route('**/*',route=>{
                if(new URL(route.request().url()).origin!==base)return route.fulfill({status:200,body:''});
                if(c.baseline&&route.request().url().includes('/js/admin-theme.js'))return route.fulfill({status:200,contentType:'text/javascript',body:execFileSync('git',['show','696f9f5:js/admin-theme.js'],{cwd:root,encoding:'utf8'})});
                return route.continue();
            });
            await context.addInitScript(({authKey,cacheKey,c})=>{
                if(!c.anonymous)localStorage.setItem(authKey,JSON.stringify({user:{id:'paint-owner',user_metadata:{}},access_token:'fake-test-token',refresh_token:'fake-test-refresh'}));
                if(c.cache)localStorage.setItem(cacheKey,c.cache==='corrupt'?'{':JSON.stringify({id:c.cache==='foreign'?'other-owner':'paint-owner',theme:c.cache==='light'?'light':'dark'}));
                window.qaFrames=[];
                function frame(){
                    if(document.body){
                        const root=getComputedStyle(document.documentElement),body=getComputedStyle(document.body);
                        const pending=document.documentElement.classList.contains('theme-pending');
                        qaFrames.push({at:performance.now(),pending,dark:document.documentElement.classList.contains('admin-dark'),bg:pending?root.backgroundColor:body.backgroundColor,visible:body.visibility});
                    }
                    if(performance.now()<2400)requestAnimationFrame(frame);
                }
                requestAnimationFrame(frame);
                if(c.blocked)Object.defineProperty(window,'localStorage',{get(){throw new DOMException('Storage blocked','SecurityError');}});
            },{authKey,cacheKey,c});
            const page=await context.newPage();
            // Lo storage bloccato non deve impedire il caricamento del mock Auth.
            if(c.blocked)await page.route('**/qa/**',async route=>route.fulfill({status:200,contentType:'text/html',body:fixture(c.file,false).replace(`JSON.parse(localStorage.getItem('${authKey}'))`,'null')}));
            await page.goto(base+'/qa/'+c.file+'?theme='+c.theme+(c.baseline?'&baseline':''));
            await page.waitForTimeout(350);
            if(out&&['ricaricamento scuro','vecchia sessione senza cache'].includes(c.label))await page.screenshot({path:path.join(out,`${name}-${width}-${c.cache?'cached':'first'}.png`)});
            await page.waitForTimeout(1300);
            const state=await page.evaluate(()=>({frames:qaFrames,dark:document.documentElement.classList.contains('admin-dark'),pending:document.documentElement.classList.contains('theme-pending'),writes:qaWrites}));
            const light=state.frames.filter(f=>!f.pending&&!['rgb(11, 18, 32)','rgb(8, 8, 8)'].includes(f.bg));
            const pendingLight=state.frames.filter(f=>f.pending&&f.bg!=='rgb(11, 18, 32)');
            assert(state.frames.length>2,c.label+': campionamento assente');
            assert.equal(state.dark,c.theme==='dark',c.label+': tema finale');
            assert.equal(state.pending,false,c.label+': caricamento concluso');
            assert.equal(state.writes,0);
            if(c.baseline)assert(light.length>0,'Il test deve riprodurre il flash originale');
            else if(c.theme==='dark'){
                assert.equal(light.length,0,c.label+': fotogrammi chiari '+JSON.stringify(light.slice(0,3)));
                assert.equal(pendingLight.length,0,c.label+': attesa chiara');
                if(c.cache==='dark')assert(state.frames.every(f=>f.visible==='visible'),c.label+': contenuti visibili subito');
            } else if(c.cache==='light'||c.anonymous)assert(state.frames.every(f=>!f.dark&&!f.pending),c.label+': chiaro immediato');
            if(!c.baseline&&c.cache==='dark'&&!c.anonymous){
                // Ripristino da cronologia: nessun reset temporaneo al chiaro.
                await page.evaluate(()=>window.dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));
                assert(await page.evaluate(()=>document.documentElement.classList.contains('admin-dark')));
                // Logout da altra scheda: invalidazione immediata, senza attendere GET.
                await page.evaluate(({authKey})=>{localStorage.removeItem(authKey);window.dispatchEvent(new StorageEvent('storage',{key:authKey}));},{authKey});
                assert(!await page.evaluate(()=>document.documentElement.classList.contains('admin-dark')));
            }
            results.push({name,width,...c,lightFrames:light.length,pendingFrames:state.frames.filter(f=>f.pending).length,frames:state.frames});
            console.log(name+' '+width+': '+c.label+' OK ('+light.length+' fotogrammi chiari)');
            await context.close();
        }
    } finally {await browser.close();}
}
(async()=>{
    if(process.env.THEME_PAINT_USE_PUBLISHED)for(const file of ['js/admin-theme.js','css/admin-theme.css','css/theme-preferences.css','dashboard.html','index.html','organizzatore.html']){
        const r=await fetch('https://subingresso.it/'+(file==='index.html'?'':file.replace(/\.html$/,'')),{cache:'no-store'});
        assert(r.ok,file);const body=await r.text();assert.equal(body.replace(/\r\n/g,'\n'),read(file).replace(/\r\n/g,'\n'),file+' pubblicato diverso');published.set(file,body);
    }
    await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
    try {for(const [engine,name,width] of [[chromium,'Chromium',1440],[chromium,'Chromium',320],[webkit,'WebKit',390]])await run(engine,name,width);}
    finally{server.close();if(out)fs.writeFileSync(path.join(out,'frames.json'),JSON.stringify(results,null,2));}
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
