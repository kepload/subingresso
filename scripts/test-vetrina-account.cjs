// Servizi e ordini simulati: nessun pagamento o invio email reale.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { stripTypeScriptTypes } = require('node:module');
const { chromium, webkit } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname,'..');
const owner = '11111111-1111-1111-1111-111111111111';
const listing = '22222222-2222-2222-2222-222222222222';
const orderId = '33333333-3333-3333-3333-333333333333';

async function backend() {
    let handler, found = true, queryOwner, stripeCalls = 0, upstream = true, refunds = 0, receipt = 'https://pay.stripe.com/receipts/payment/example';
    const source = fs.readFileSync(path.join(root,'supabase/functions/payment-receipt/index.ts'),'utf8').replace(/^import[^\n]+\n/,'');
    const client = { rpc:async(name,args) => {assert.equal(name,'record_vetrina_refund');assert.equal(args.p_refunded_cents,1000);refunds++;return{};},auth:{getUser:async token => ({data:{user:token === 'valid' ? {id:owner} : null}})},from:() => ({
        select(){return this;},eq(key,value){if(key === 'user_id') queryOwner = value; return this;},
        maybeSingle:async () => ({data:found ? {status:'succeeded',stripe_payment_intent:'pi_example'} : null}),
    })};
    vm.runInNewContext(stripTypeScriptTypes(source),{Deno:{env:{get:()=> 'test-config'},serve:fn=>handler=fn},createClient:()=>client,
        Response,Request,URL,AbortSignal,fetch:async()=>{stripeCalls++;return new Response(JSON.stringify({latest_charge:{receipt_url:receipt,amount_refunded:1000}}),{status:upstream?200:503});}});
    const request = token => new Request('https://example.invalid',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({order_id:orderId})});
    assert.equal((await handler(request('invalid'))).status,401);
    assert.equal(stripeCalls,0);
    found = false; assert.equal((await handler(request('valid'))).status,404); assert.equal(stripeCalls,0);
    found = true; let result = await handler(request('valid'));
    assert.equal(queryOwner,owner); assert.equal(result.status,200); assert.equal(result.headers.get('cache-control'),'no-store');
    assert.equal((await result.json()).url,receipt); assert.equal(refunds,1);
    receipt = 'https://evil.example/receipts'; assert.equal((await handler(request('valid'))).status,502);
    upstream = false; assert.equal((await handler(request('valid'))).status,502);
    console.log('OK: ricevute autenticazione, filtro proprietario, dominio Stripe, no-store e guasti Stripe.');
}
const html = fs.readFileSync(path.join(root,'dashboard.html'),'utf8');
const tabs = html.slice(html.indexOf('function showTab(tab)'),html.indexOf('let _valutazioniLoaded = false;'));
const fixtureScript = `
let _currentUser = {id:'${owner}',email:'test@example.invalid',created_at:'2026-01-01',email_confirmed_at:'2026-01-01'};
let _alertsLoaded = true,_savedLoaded = true,_valutazioniLoaded = true;
window.toasts=[];function showToast(message){toasts.push(message);}
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function isListingExpired(l){return !!l.expires_at && new Date(l.expires_at)<new Date();}
function openVetrinaModal(l){window.promoted=l.id;}
function goToProfilo(){document.getElementById('profiloModal').classList.remove('hidden');}
function closeProfiloModal(){document.getElementById('profiloModal').classList.add('hidden');}
window.charts=[];class Chart{constructor(canvas,config){this.config=config;charts.push(this);}destroy(){this.destroyed=true;}}
window.fail=false;window.delay=0;
const allOrders=Array.from({length:52},(_,i)=>({id:i===0?'${orderId}':('00000000-0000-0000-0000-'+String(i).padStart(12,'0')),
annuncio_id:'${listing}',listing_id_snapshot:'${listing}',listing_title:i===0?'=HYPERLINK(1)':i===1?'\u003cimg src=x onerror=window.xss=true\u003e':'Posteggio mercato Brescia',tier:'30d',status:i===2?'pending':i===3?'failed':i===4?'refunded':'succeeded',
amount_cents:4990,currency:'eur',refunded_cents:i===4?4990:0,created_at:'2026-10-08',paid_at:i===2?null:'2026-10-08',activated_at:'2026-10-08',promotion_starts_at:'2026-10-08',promotion_ends_at:'2026-11-07',has_receipt:true,history:[{at:'2026-10-08',kind:'created'}]}));
const campaign={id:'${listing}',title:'Posteggio mercato Brescia',status:'active',available:true,active:true,featured_until:'2026-11-07',impressions:240,detail_views:38,contact_actions:6,daily:[{day:new Date().toISOString().slice(0,10),impressions:240,detail_views:38,contact_actions:6}]};
const _supabase={rpc:async(name,args)=>{if(name!=='dashboard_vetrina_account')throw Error(name);const sleep=window.delay;await new Promise(r=>setTimeout(r,sleep));if(window.fail)return{error:{message:'offline'}};const orders=allOrders.filter(p=>args.p_status==='all'||p.status===args.p_status);return{data:{orders:orders.slice(args.p_offset,args.p_offset+50),total:orders.length,campaigns:[campaign],summary:{paid_orders:50,spent_cents:249500,refunded_cents:4990}}};},
from:()=>({select(){return this;},eq(){return this;},order:async()=>({data:[{id:'${listing}',titolo:'Posteggio mercato Brescia',status:'active'}]}),maybeSingle:async()=>({data:{id:'${listing}',titolo:'Posteggio mercato Brescia',status:'active'}})}),auth:{onAuthStateChange:fn=>window.authChange=fn,resetPasswordForEmail:async()=>({})}};
${tabs}
`;
const fixture = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace('</body>',`<script>${fixtureScript}</script><script src="/js/vetrina-account.js"></script><script>loadingState.classList.add('hidden');dashContent.classList.remove('hidden');VetrinaAccount.fillProfile(_currentUser);showTab('pagamenti');</script></body>`);
const server = http.createServer((req,res)=>{
    const url = new URL(req.url,'http://localhost');
    if(url.pathname === '/dashboard')return res.end(fixture);
    const file = path.resolve(root,'.'+url.pathname);
    if(!file.startsWith(root+path.sep))return res.writeHead(403).end();
    res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':'text/html');
    fs.readFile(file,(error,data)=>error?res.writeHead(404).end():res.end(data));
});
async function browser(engine,name,width,base) {
    const browser = await engine.launch({headless:true});
    try {
        const page = await browser.newPage({viewport:{width,height:900},acceptDownloads:true});
        const errors=[];page.on('pageerror',error=>errors.push(error.message));
        await page.route('https://**/*',route=>route.abort());
        await page.goto(base+'/dashboard');
        await page.locator('.v-account-order').first().waitFor();
        assert.equal(await page.locator('.v-account-order').count(),50);
        assert.equal(await page.locator('#tabPagamenti').getAttribute('aria-selected'),'true');
        assert.equal(await page.locator('#sectionAnnunci').isVisible(),false);
        assert.equal(await page.evaluate(()=>!!window.xss),false);
        assert.equal(await page.evaluate(()=>charts[0].config.data.datasets[0].data.reduce((a,b)=>a+b,0)),240);
        assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'overflow '+width);
        await page.locator('#vetrinaAccountPages button').last().click();
        await page.waitForFunction(()=>document.querySelectorAll('.v-account-order').length===2);
        await page.selectOption('#vetrinaAccountStatus','pending');
        await page.waitForFunction(()=>document.querySelectorAll('.v-account-order').length===1);
        assert.match(await page.locator('.v-account-order').innerText(),/In attesa di pagamento/);
        await page.evaluate(()=>{window.delay=100;VetrinaAccount.setDays(90);window.delay=0;VetrinaAccount.setDays(7);});
        await page.waitForTimeout(150);
        assert.equal(await page.evaluate(()=>charts.at(-1).config.data.labels.length),7);
        const downloadEvent=page.waitForEvent('download');
        await page.locator('#vetrinaExport').click();
        const download=await downloadEvent;
        const csv=fs.readFileSync(await download.path(),'utf8');
        assert.equal(csv.split('\r\n').length,53);
        assert(csv.includes("'=HYPERLINK(1)"));
        await page.evaluate(()=>{window.fail=true;VetrinaAccount.load();});
        await page.locator('.v-account-error').waitFor();
        assert.equal(await page.locator('.v-account-order').count(),0);
        await page.evaluate(()=>window.fail=false);await page.locator('.v-account-error button').click();
        await page.locator('.v-account-order').waitFor();
        await page.locator('.v-account-primary').click();await page.locator('#vetrinaAccountChooser').waitFor();
        await page.locator('#vetrinaAccountChooser button[data-listing]').click();
        assert.equal(await page.evaluate(()=>window.promoted),listing);
        await page.evaluate(()=>goToProfilo());
        assert.equal(await page.locator('#profileEmailStatus').innerText(),'Confermata');
        assert.equal(await page.locator('#profilePublicLink').getAttribute('href'),'/profilo?id='+owner);
        await page.evaluate(()=>closeProfiloModal());
        if(process.env.ACCOUNT_SCREENSHOT && name==='chromium' && width===390) {
            await page.selectOption('#vetrinaAccountStatus','all');await page.locator('.v-account-order').first().waitFor();
            await page.locator('#vetrinaAccountChooser').evaluate(node=>node.remove());
            await page.locator('#dashboardTabs').scrollIntoViewIfNeeded();
            await page.screenshot({path:process.env.ACCOUNT_SCREENSHOT});
        }
        await page.evaluate(()=>window.authChange('SIGNED_OUT',null));
        assert.equal(await page.locator('.v-account-order').count(),0);
        assert.deepEqual(errors,[]);
        console.log('OK: '+name+' '+width+'px, scheda privata, grafici, XSS, paginazione, filtri, concorrenza, CSV, errori/retry e acquisto.');
    } finally { await browser.close(); }
}
(async()=>{await backend();await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
try {for(const [engine,name] of [[chromium,'chromium'],[webkit,'webkit']])for(const width of [1440,390,320])await browser(engine,name,width,base);}
finally {server.close();}})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
