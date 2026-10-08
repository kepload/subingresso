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
        .replace(/^import \{ createClient \} from [^\n]+\n/m, '');
    let handler;
    const context = vm.createContext({
        Deno: { env: { get: () => secret }, serve: fn => { handler = fn; } },
        createClient: () => client, fetch: fetcher, Request, Response, URLSearchParams,
        TextEncoder, crypto: webcrypto, console: { log() {}, error() {} }
    });
    new vm.Script(stripTypeScriptTypes(source), {filename:name}).runInContext(context);
    return handler;
}
async function main() {
    for (const file of ['dashboard.html', 'vendi.html', 'grazie.html']) {
        for (const [, attrs, code] of fs.readFileSync(path.join(root, file), 'utf8').matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
            if (!/\bsrc\s*=|application\/ld\+json/i.test(attrs)) new vm.Script(code, {filename:file});
        }
    }
    let listing = { id, user_id: owner, status: 'active', titolo: 'Test', created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 200 * 86400000).toISOString(), featured_since: null };
    let charge;
    let logged;
    const client = {
        auth: {getUser: async token => ({data: token === 'valid' ? {user:{id:owner,email:'test@example.invalid'}} : null, error:null})},
        from: table => {
            const query = { select() {return this;}, eq() {return this;}, single: async () => ({data:listing}),
                upsert: async (row, options) => {logged = {row, options}; return {error:null};} };
            assert(['annunci','payments'].includes(table));
            return query;
        }
    };
    const checkout = load('create-checkout-session', client, async (url, options) => {
        assert.equal(url, 'https://api.stripe.com/v1/checkout/sessions');
        charge = new URLSearchParams(options.body);
        return Response.json({id:'cs_test_checkout',url:'https://checkout.stripe.com/test'});
    });
    const request = body => new Request('https://example.invalid/checkout', {method:'POST',
        headers:{Authorization:'Bearer valid','Content-Type':'application/json'},body:JSON.stringify(body)});
    for (const [tier, normal, discounted] of [['10d',2490,2241],['30d',4990,4491],['90d',9990,8991]]) {
        for (const creation of [false,true]) {
            listing.status = creation ? 'pending' : 'active';
            const res = await checkout(request({annuncio_id:id,tier,source:creation?'vendi_creation':'dashboard',amount:1,
                expected_amount_cents:creation?discounted:normal}));
            assert.equal(res.status,200);
            assert.equal(Number(charge.get('line_items[0][price_data][unit_amount]')),creation?discounted:normal);
            assert.equal(logged.row.amount_cents,creation?discounted:normal);
            assert.equal(logged.options.ignoreDuplicates,true);
            const display = (creation?discounted:normal)/100;
            const file = fs.readFileSync(path.join(root,creation?'vendi.html':'dashboard.html'),'utf8');
            assert(file.includes(display.toFixed(2).replace('.',',')));
        }
    }
    // Sorgente manipolata non basta per ottenere lo sconto su un annuncio vecchio.
    listing.status = 'active'; listing.created_at = new Date(Date.now()-86400000).toISOString();
    assert.equal((await checkout(request({annuncio_id:id,tier:'30d',source:'vendi_creation',expected_amount_cents:4990}))).status,200);
    assert.equal(charge.get('line_items[0][price_data][unit_amount]'),'4990');
    assert.equal((await checkout(request({annuncio_id:id,tier:'30d',expected_amount_cents:3990}))).status,409);
    assert.equal((await checkout(request({annuncio_id:id,tier:'30d'}))).status,409);
    listing.status = 'pending';
    assert.equal((await checkout(request({annuncio_id:id,tier:'30d'}))).status,400);
    listing.status = 'active'; listing.user_id = 'someone-else';
    assert.equal((await checkout(request({annuncio_id:id,tier:'30d'}))).status,403);
    listing.user_id = owner; listing.expires_at = new Date(Date.now()-86400000).toISOString();
    assert.equal((await checkout(request({annuncio_id:id,tier:'30d'}))).status,400);
    assert.equal((await checkout(request({annuncio_id:id,tier:'999d'}))).status,400);

    let calls = [];
    let dbError = false;
    const hook = load('stripe-webhook', {
        rpc: async (name,args) => {calls.push({name,args});return dbError?{error:{message:'db unavailable'}}:{data:{waiting_approval:true}};},
        from: () => ({update: () => {const q={eq: () => q,then: resolve => Promise.resolve({error:null}).then(resolve)};return q;}})
    });
    async function event(type, paid=true, valid=true) {
        const body = JSON.stringify({id:'evt_test',type,data:{object:{id:'cs_test_signed',payment_status:paid?'paid':'unpaid',
            amount_total:2241,currency:'eur',payment_intent:'pi_test',
            metadata:{annuncio_id:id,user_id:owner,tier:'10d'}}}});
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
    dbError = true;
    assert.equal((await event('checkout.session.completed')).status,500);
    console.log('OK: script HTML, sei prezzi/sconti, gate sconto, proprietario, scadenza, firma Stripe, pagamento incompleto e retry DB.');
}
main().catch(error => {console.error(error);process.exitCode=1;});
