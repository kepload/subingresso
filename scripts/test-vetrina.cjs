// Prezzi/Stripe reali eseguiti con servizi simulati: nessun addebito.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { stripTypeScriptTypes } = require('node:module');
const { webcrypto } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const owner = '11111111-1111-1111-1111-111111111111';
const id = '22222222-2222-2222-2222-222222222222';
const secret = 'webhook-test-secret';

function load(name, client, fetcher) {
    const source = fs.readFileSync(path.join(root, 'supabase/functions', name, 'index.ts'), 'utf8')
        .replace(/^import[^\n]+\n/gm, '');
    let handler;
    const context = vm.createContext({
        Deno: { env: { get: () => secret }, serve: fn => { handler = fn; } },
        createClient: () => client, fetch: fetcher, Request, Response, URLSearchParams,
        TextEncoder, AbortSignal, crypto: webcrypto, console: { log() {}, error() {} }
    });
    new vm.Script(fs.readFileSync(path.join(root,'js/vetrina-pricing.js'),'utf8')).runInContext(context);
    new vm.Script(stripTypeScriptTypes(source), {filename:name}).runInContext(context);
    return handler;
}
async function main() {
    for (const file of ['dashboard.html', 'vendi.html', 'grazie.html']) {
        for (const [, attrs, code] of fs.readFileSync(path.join(root, file), 'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
            if (!/\bsrc\s*=|application\/ld\+json/i.test(attrs)) new vm.Script(code, {filename:file});
        }
    }
    // Payment return: all items must be confirmed before showing success.
    const thanks=fs.readFileSync(path.join(root,'grazie.html'),'utf8');
    const returnScript=[...thanks.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map(m=>m[2]).find(code=>code.includes('const sessionId'));
    for(const [rows,expected,link] of [
        [[{status:'succeeded',annuncio_id:id,tier:'30d',activated_at:'2026-10-22',bundle_size:1}],'stateSuccess','/annuncio?id='+id],
        [Array.from({length:3},()=>({status:'succeeded',annuncio_id:id,tier:'30d',activated_at:'2026-10-22',bundle_size:3})),'stateSuccess','/dashboard#pagamenti'],
        [[{status:'succeeded',annuncio_id:id,tier:'30d',activated_at:null,bundle_size:1}],'stateSuccess',null],
        [[{status:'pending',bundle_size:1}],'stateChecking',null],
        [[{status:'failed',bundle_size:1}],'stateError',null],
        [[{status:'succeeded',bundle_size:2}],'stateChecking',null]
    ]){
        const nodes=new Map(),scheduled=[];
        const el=name=>{
            if(!nodes.has(name)){const classes=new Set(name==='stateChecking'?[]:['hidden']);nodes.set(name,{textContent:'',href:'',classList:{toggle:(c,on)=>on?classes.add(c):classes.delete(c),add:c=>classes.add(c),contains:c=>classes.has(c)}});}
            return nodes.get(name);
        };
        const context=vm.createContext({location:{search:'?session_id=cs_test_return'},URLSearchParams,
            document:{getElementById:el},setTimeout:fn=>scheduled.push(fn),console,
            _supabase:{from:table=>{assert.equal(table,'payments');return{select(){return this},or(value){assert(value.includes('checkout_session_id'));return this},limit:async()=>({data:rows,error:null})};}}
        });
        await new vm.Script(returnScript).runInContext(context);
        assert.equal(el(expected).classList.contains('hidden'),false);
        if(expected!=='stateSuccess')assert(el('stateSuccess').classList.contains('hidden'));
        if(link)assert.equal(el('viewAnnuncioBtn').href,link);
        if(expected==='stateSuccess'&&rows[0].activated_at===null)assert(el('viewAnnuncioBtn').classList.contains('hidden'));
    }
    const Pricing = require('../js/vetrina-pricing.js');
    const ids = Array.from({length:11},(_,i)=>`22222222-2222-2222-2222-${String(i+1).padStart(12,'0')}`);
    let listings = [], charge, logged, orderError=false,expired=false;
    const client = {
        auth:{getUser:async token=>({data:token==='valid'?{user:{id:owner,email:'test@example.invalid'}}:null,error:null})},
        from:table=>{assert.equal(table,'annunci');return{select(){return this;},in:async()=>({data:listings,error:null})};},
        rpc:async(name,args)=>{assert.equal(name,'register_vetrina_checkout');logged=args;return{error:orderError?{message:'offline'}:null};}
    };
    const checkout = load('create-checkout-session',client,async(url,options)=>{
        if(url.endsWith('/expire')){expired=true;return Response.json({});}
        assert.equal(url,'https://api.stripe.com/v1/checkout/sessions');charge=new URLSearchParams(options.body);
        return Response.json({id:'cs_test_checkout',url:'https://checkout.stripe.com/test'});
    });
    const request=body=>new Request('https://example.invalid/checkout',{method:'POST',headers:{Authorization:'Bearer valid','Content-Type':'application/json'},body:JSON.stringify(body)});
    const setListings=n=>{listings=ids.slice(0,n).map(id=>({id,user_id:owner,status:'active',titolo:'Mercato di Brescia',expires_at:new Date(Date.now()+86400000).toISOString()}));};
    for(const [tier,base] of [['10d',4900],['30d',9900],['90d',24900]]) for(let n=1;n<=10;n++){
        setListings(n);const discount=n>=5?20:n>=3?15:n===2?10:0,unit=base*(100-discount)/100;
        assert.deepEqual(JSON.parse(JSON.stringify(Pricing.quote(tier,n))),{tier,days:{'10d':10,'30d':30,'90d':90}[tier],count:n,discount,unit,total:unit*n,listTotal:base*n,savings:(base-unit)*n});
        const response=await checkout(request({annuncio_ids:ids.slice(0,n),tier,expected_amount_cents:unit*n,amount:1,discount:99}));
        assert.equal(response.status,200);assert.equal(logged.p_expected_amount,unit*n);assert.equal(logged.p_listing_ids.length,n);
        let sum=0;for(let i=0;i<n;i++){assert.equal(Number(charge.get(`line_items[${i}][price_data][unit_amount]`)),unit);sum+=unit;}
        assert.equal(sum,unit*n);assert.equal(charge.has('allow_promotion_codes'),false);assert.equal(charge.get('metadata[checkout_version]'),'premium_v1');
    }
    setListings(1);listings[0].status='pending';
    assert.equal((await checkout(request({annuncio_id:ids[0],tier:'30d',source:'vendi_creation',expected_amount_cents:9900}))).status,200);
    assert.equal(charge.get('line_items[0][price_data][unit_amount]'),'9900','no creation discount');
    assert.equal((await checkout(request({annuncio_id:ids[0],tier:'30d',expected_amount_cents:9900}))).status,400);
    setListings(2);listings[1].status='pending';
    assert.equal((await checkout(request({annuncio_ids:ids.slice(0,2),tier:'30d',source:'vendi_creation',expected_amount_cents:17820}))).status,400);
    setListings(1);listings[0].user_id='other';assert.equal((await checkout(request({annuncio_id:ids[0],tier:'30d',expected_amount_cents:9900}))).status,403);
    setListings(1);listings[0].expires_at=new Date(0).toISOString();assert.equal((await checkout(request({annuncio_id:ids[0],tier:'30d',expected_amount_cents:9900}))).status,400);
    setListings(1);
    for(const bad of [{annuncio_ids:[ids[0],ids[0]],tier:'30d'},{annuncio_ids:ids,tier:'30d'},{annuncio_ids:['bad'],tier:'30d'},{annuncio_ids:ids.slice(0,1),tier:'__proto__'},{annuncio_ids:'bad',tier:'30d'}]) assert.equal((await checkout(request(bad))).status,400);
    assert.equal((await checkout(request({annuncio_id:ids[0],tier:'30d',expected_amount_cents:4990}))).status,409);
    assert.equal((await checkout(request({annuncio_id:ids[0],tier:'30d'}))).status,409);
    orderError=true;assert.equal((await checkout(request({annuncio_id:ids[0],tier:'30d',expected_amount_cents:9900}))).status,409);assert(expired);
    assert.equal((await checkout(new Request('https://example.invalid',{method:'POST',body:'{}'}))).status,401);

    let calls = [];
    let dbError = false;
    const hook = load('stripe-webhook', {
        rpc: async (name,args) => {calls.push({name,args});return dbError?{error:{message:'db unavailable'}}:{data:{waiting_approval:true}};},
        from: () => ({update: () => {const q={eq: () => q,then: resolve => Promise.resolve({error:null}).then(resolve)};return q;}})
    });
    async function event(type, paid=true, valid=true, premium=false) {
        const body = JSON.stringify({id:'evt_test',type,data:{object:{id:'cs_test_signed',payment_status:paid?'paid':'unpaid',
            amount_total:2241,amount_refunded:1000,currency:'eur',payment_intent:'pi_test',
            metadata:{annuncio_id:id,user_id:owner,tier:'10d',checkout_version:premium?'premium_v1':undefined}}}});
        const t = Math.floor(Date.now()/1000);
        const key = await webcrypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
        const signature = Buffer.from(await webcrypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${t}.${body}`))).toString('hex');
        return hook(new Request('https://example.invalid/webhook',{method:'POST',body,
            headers:{'stripe-signature':`t=${t},v1=${valid?signature:'00'}`}}));
    }
    assert.equal((await event('checkout.session.completed')).status,200);
    assert.equal(calls[0].name,'apply_vetrina_payment');
    assert.equal(calls[0].args.p_amount_cents,2241);
    assert.equal((await event('checkout.session.completed',false)).status,200);
    assert.equal(calls.length,1);
    assert.equal((await event('checkout.session.completed',true,false)).status,400);
    assert.equal((await event('checkout.session.async_payment_succeeded')).status,200);
    assert.equal((await event('charge.refunded')).status,200);
    assert.equal(calls.at(-1).name,'record_vetrina_refund');
    assert.equal(calls.at(-1).args.p_refunded_cents,1000);
    assert.equal((await event('checkout.session.completed',true,true,true)).status,200);
    assert.equal(calls.at(-1).name,'apply_vetrina_checkout');
    dbError = true;
    assert.equal((await event('checkout.session.completed')).status,500);
    console.log('OK: HTML, 30 combinazioni prezzo/bundle, nessuno sconto automatico, autorizzazioni, prezzi vecchi, checkout non registrato, firma e flusso Stripe precedente.');
}
main().catch(error => {console.error(error);process.exitCode=1;});
