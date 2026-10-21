// Sessioni e ruoli simulati; HTML/CSS reali. Nessuna scrittura su account o servizi.
const fs = require('node:fs'), path = require('node:path'), http = require('node:http');
const assert = require('node:assert/strict');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const out = process.env.ADMIN_THEME_QA_DIR;
const published = new Map();
const read = file => published.get(file) || fs.readFileSync(path.join(root, file), 'utf8');
if (out) fs.mkdirSync(out, { recursive: true });
const bootstrap = `<script>
window.qaUser={id:'admin-qa'};window.qaRole=true;window.qaFailure=false;window.qaDelay=0;window.qaCallbacks=[];window.qaReads=[];
const _supabase={auth:{getSession:async()=>({data:{session:qaUser?{user:qaUser}:null}}),getUser:async()=>({data:{user:qaUser}}),onAuthStateChange:fn=>{qaCallbacks.push(fn);return{};}},from:table=>({select(columns){qaReads.push({table,columns});return this;},eq(){return this;},async single(){const role=qaRole,failed=qaFailure;await new Promise(r=>setTimeout(r,qaDelay));return{data:{is_admin:role},error:failed?{message:'offline'}:null};}})};
window.qaChange=(id,role,event='SIGNED_IN')=>{qaUser=id?{id}:null;qaRole=role;qaCallbacks.forEach(fn=>fn(event,qaUser?{user:qaUser}:null));};
window.qaRefresh=()=>document.dispatchEvent(new Event('visibilitychange'));
</script>`;
const components = `<main style="padding:24px;max-width:900px;margin:auto"><h1 class="text-slate-900">Tema personale admin</h1><section class="bg-white text-slate-900" style="padding:24px;margin:20px 0"><h2>Pannello</h2><p class="text-slate-500">Testo secondario leggibile</p><input placeholder="Cerca un comune"><button class="bg-blue-600 text-white" style="padding:12px">Cerca</button></section><section class="bg-red-50 text-red-700" style="padding:16px">Errore: riprova.</section><section class="bg-emerald-50 text-emerald-700" style="padding:16px">Operazione riuscita.</section><dialog open class="sf-dialog" style="position:relative;margin-top:20px"><header><h2>Avvisami</h2></header><form><label class="sf-field">Promemoria<select><option>Una settimana prima</option></select></label><button class="sf-button-primary sf-button">Salva promemoria</button></form></dialog></main>`;

function fixture(file, before = false) {
    let html = file && file !== 'fallback' ? read(file) : `<!doctype html><html><head><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/css/tailwind.css"><link rel="stylesheet" href="/css/design-system.css"><link rel="stylesheet" href="/css/saved-fairs.css"></head><body><header></header>${components}<footer></footer></body></html>`;
    html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    html = html.replace('<head>', '<head><base href="/">');
    let content = '';
    if (file === 'index.html' || file === 'annunci.html') {
        content = `<script>const grid=document.querySelector('#previewGrid,#resultsGrid');if(grid)grid.innerHTML=buildCard({id:'qa-annuncio',titolo:'Posteggio mercato settimanale',comune:'Milano',provincia:'MI',regione:'Lombardia',tipo:'vendita',prezzo:12500,mq:20,giorni:['Lunedì'],merce:'non-alimentare',user_id:'qa-venditore',profiles:{nome:'Ambulante'}});</script>`;
    }
    if (file === 'dashboard.html') content += `<script>document.getElementById('loadingState').classList.add('hidden');document.getElementById('dashContent').classList.remove('hidden');document.getElementById('welcomeTitle').textContent='Admin';</script>`;
    const auth = file === 'fallback' ? bootstrap.replace('const _supabase=', 'window.qaClient=').replace('</script>', "window.qaCreated=0;window.supabase={createClient:()=>{qaCreated++;return qaClient;}};</script>") : bootstrap;
    return html.replace('</body>', auth + `<script src="/js/image-urls.js"></script><script src="/js/data.js"></script><script src="/js/ui-components.js"></script>` + content + (before ? '' : `<script src="/js/admin-theme.js"></script>`) + '</body>');
}
const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/qa/') || url.searchParams.has('qa')) {
        const file = url.pathname.startsWith('/qa/') ? url.pathname.slice(4) : url.pathname.slice(1);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.end(fixture(file === 'components' ? null : file, url.searchParams.has('before')));
    }
    const file = path.resolve(root, '.' + url.pathname);
    if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) { res.statusCode = 404; return res.end(); }
    res.setHeader('Content-Type', file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'text/javascript' : file.endsWith('.woff') ? 'font/woff' : 'application/octet-stream');
    res.end(published.get(path.relative(root,file).replaceAll('\\','/')) || fs.readFileSync(file));
});
const dark = page => page.evaluate(() => document.documentElement.classList.contains('admin-dark'));
const waitDark = page => page.waitForFunction(() => document.documentElement.classList.contains('admin-dark'));
const waitLight = page => page.waitForFunction(() => !document.documentElement.classList.contains('admin-dark'));
const results = [];
async function run(engine, name, width) {
    const browser = await engine.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const base = `http://127.0.0.1:${server.address().port}`;
    await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.fulfill({ status: 200, body: '' }));
    const page = await context.newPage();
    const checks = [], errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const check = (value, label) => { assert(value, label); checks.push(label); };
    try {
        await page.goto(base + '/qa/components'); await waitDark(page);
        check(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor) === 'rgb(11, 18, 32)', 'Admin verificato: fondo organizzatori');
        check(await page.locator('input').evaluate(el => getComputedStyle(el).colorScheme) === 'dark', 'Campi e controlli nativi scuri');
        const ratios = await page.evaluate(() => {
            const lum = rgb => { const v=rgb.map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4;});return .2126*v[0]+.7152*v[1]+.0722*v[2]; };
            const parse = color => (color.match(/[\d.]+/g)||[]).map(Number);
            return ['.text-slate-900','.text-slate-500','.bg-red-50','.bg-emerald-50','input','.sf-field select'].map(selector=>{
                const el=document.querySelector(selector);let node=el,bg;
                while(node){bg=parse(getComputedStyle(node).backgroundColor);if(bg.length===3||bg[3]===1)break;node=node.parentElement;}
                const a=lum(parse(getComputedStyle(el).color)),b=lum(bg.slice(0,3));return {selector,ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
            });
        });
        check(ratios.every(p=>p.ratio>=4.5), 'Contrasto dei testi e dei campi almeno 4,5:1: '+JSON.stringify(ratios));
        check(await page.evaluate(() => qaReads.filter(r => r.table === 'profiles').length > 0 && qaReads.filter(r => r.table === 'profiles').every(r => r.columns === 'is_admin')), 'Soltanto lettura del ruolo, nessun dato privato');
        await page.evaluate(() => qaChange(null, false, 'SIGNED_OUT')); await waitLight(page);
        check(!await dark(page), 'Uscita azzera subito il tema');
        await page.evaluate(() => qaChange('utente', false)); await page.waitForTimeout(100);
        check(!await dark(page), 'Utente normale resta chiaro');
        await page.evaluate(() => qaChange('falso-admin', 'true')); await page.waitForTimeout(100);
        check(!await dark(page), 'Stringa true rifiutata');
        await page.evaluate(() => { qaFailure=true; qaChange('admin-qa', true); }); await page.waitForTimeout(100);
        check(!await dark(page), 'Errore di lettura non abilita il tema');
        await page.evaluate(() => { qaFailure=false; qaChange('admin-qa', true); }); await waitDark(page);
        await page.evaluate(() => { qaDelay=250; qaRefresh(); }); await page.waitForTimeout(40);
        await page.evaluate(() => qaChange('altro-account', false)); await page.waitForTimeout(400);
        check(!await dark(page), 'Risposta admin tardiva non passa al nuovo account');
        await page.evaluate(() => { qaDelay=0; qaChange('admin-qa', true); }); await waitDark(page);
        await page.evaluate(() => { qaRole=false; qaRefresh(); }); await waitLight(page);
        check(!await dark(page), 'Revoca del ruolo riletta al ritorno');
        await page.evaluate(() => qaChange('admin-qa', true)); await waitDark(page);
        check(await page.locator('link[href*="admin-theme.css"]').count() === 1, 'Un solo foglio di stile dopo i cambi account');
        await page.goto(base + '/qa/fallback'); await page.waitForTimeout(100);
        check(!await dark(page) && await page.evaluate(()=>qaCreated===0), 'Pagina statica anonima: nessun client aggiunto');
        await page.evaluate(()=>localStorage.setItem('sb-mhfbtltgwibwmsudsuvf-auth-token','{}'));
        await page.reload(); await waitDark(page);
        check(await page.evaluate(()=>qaCreated===1), 'Pagina statica: sessione admin riutilizzata senza Auth globale');
        await page.evaluate(()=>localStorage.removeItem('sb-mhfbtltgwibwmsudsuvf-auth-token'));
        for (const file of ['index.html', 'annunci.html', 'dashboard.html', 'messaggi.html', 'fiere.html', 'valutatore.html', 'profilo.html', 'organizzatore.html', 'privacy.html', 'vendi.html', '404.html', 'reset-password.html', 'unsubscribe.html']) {
            await page.goto(base + '/' + file + '?qa&before');
            await page.evaluate(() => document.fonts.ready);
            const before = await page.evaluate(() => ({width:document.documentElement.scrollWidth,bg:getComputedStyle(document.body).backgroundColor}));
            if (out && ['index.html','organizzatore.html'].includes(file)) await page.screenshot({ path:path.join(out,`before-${file}-${name}-${width}.png`),fullPage:true });
            await page.goto(base + '/' + file + '?qa'); await waitDark(page);
            await page.evaluate(() => document.fonts.ready);
            const after = await page.evaluate(() => ({width:document.documentElement.scrollWidth,bg:getComputedStyle(document.body).backgroundColor,image:getComputedStyle(document.body).backgroundImage}));
            check(after.bg === (file === 'organizzatore.html' ? before.bg : 'rgb(11, 18, 32)'), file + ': fondo scuro uniforme, tema organizzatore conservato');
            check(after.image === 'none', file + ': nessuna sfumatura bianca residua');
            const lightPanels = await page.evaluate(()=>[...document.querySelectorAll('body *')].filter(el=>{
                const r=el.getBoundingClientRect(),s=getComputedStyle(el);if(r.width<80||r.height<35||!el.checkVisibility())return false;
                const c=(s.backgroundColor.match(/[\d.]+/g)||[]).map(Number);return c.length>=3&&c.slice(0,3).every(n=>n>220)&&(c.length===3||c[3]>.8);
            }).map(el=>el.tagName+'.'+el.className).slice(0,10));
            check(lightPanels.length===0, file+': nessun pannello bianco residuo '+lightPanels.join(', '));
            check(after.width <= Math.max(width,before.width), file + ': nessun nuovo overflow');
            if (out) await page.screenshot({ path:path.join(out,`after-${file}-${name}-${width}.png`),fullPage:true });
        }
        check(errors.length === 0, 'Nessun errore JavaScript: ' + errors.join('; '));
        console.log(name + ' ' + width + ': ' + checks.length + ' controlli passati');
        results.push({name,width,checks,errors});
    } finally { await browser.close(); }
}
(async()=>{
    if (process.env.ADMIN_THEME_USE_PUBLISHED) {
        const files=['js/admin-theme.js','css/admin-theme.css',...fs.readdirSync(root).filter(f=>f.endsWith('.html')&&!['annuncio.html','googlead37f27accd4fd2b.html'].includes(f))];
        for (const file of files) {
            const url=file==='index.html'?'':file.endsWith('.html')?file.slice(0,-5):file;
            const response=await fetch('https://subingresso.it/'+url,{cache:'no-store'});
            const body=await response.text();
            assert.equal(body.replace(/\r\n/g,'\n'),read(file).replace(/\r\n/g,'\n'),file+' pubblicato diverso');
            published.set(file,body);
        }
        console.log(files.length+' pagine/asset pubblicati identici');
    }
    await new Promise(resolve=>server.listen(Number(process.env.ADMIN_THEME_PORT)||0,'127.0.0.1',resolve));
    if(process.env.ADMIN_THEME_PREVIEW_ONLY){console.log('Local: http://127.0.0.1:'+server.address().port+'/index.html?qa');return;}
    try { for(const [engine,name,width] of [[chromium,'Chromium',1440],[chromium,'Chromium',320],[webkit,'WebKit',390]]) await run(engine,name,width); }
    finally { await new Promise(resolve=>server.close(resolve)); if(out)fs.writeFileSync(path.join(out,'checks.json'),JSON.stringify(results,null,2)); }
})().catch(error=>{console.error(error);process.exitCode=1;server.close();});
