import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import '../../../js/vetrina-pricing.js';

const Pricing = (globalThis as any).VetrinaPricing;
const SITE_URL = 'https://subingresso.it';
const CORS = { 'Access-Control-Allow-Origin':'*', 'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type' };
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers:{...CORS,'Content-Type':'application/json'} });

Deno.serve(async req => {
    if (req.method === 'OPTIONS') return new Response('ok', {headers:CORS});
    if (req.method !== 'POST') return json({error:'Metodo non consentito'},405);
    try {
        const auth = req.headers.get('Authorization');
        if (!auth?.startsWith('Bearer ')) return json({error:'Accedi per acquistare una Vetrina.'},401);
        const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SB_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
        const {data:identity,error:authError} = await admin.auth.getUser(auth.slice(7));
        if (authError || !identity?.user) return json({error:'Sessione scaduta. Accedi di nuovo.'},401);
        const user = identity.user;
        const body = await req.json().catch(() => null);
        if (!body || typeof body !== 'object') return json({error:'Richiesta non valida.'},400);
        const ids = body.annuncio_ids ?? (body.annuncio_id ? [body.annuncio_id] : []);
        if (!Array.isArray(ids) || !ids.length || ids.length > 10 || new Set(ids).size !== ids.length
            || ids.some(id => typeof id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
            return json({error:'Seleziona da 1 a 10 annunci diversi.'},400);
        }
        let quote;
        try { quote = Pricing.quote(body.tier,ids.length); } catch { return json({error:'Durata non valida.'},400); }
        if (!Number.isInteger(body.expected_amount_cents) || body.expected_amount_cents !== quote.total) {
            return json({error:'Il prezzo è cambiato. Ricarica la pagina e controlla il totale prima di pagare.'},409);
        }
        const creation = body.source === 'vendi_creation' && ids.length === 1;
        const {data:listings,error:listError} = await admin.from('annunci')
            .select('id,user_id,status,titolo,expires_at').in('id',ids);
        if (listError || !listings || listings.length !== ids.length) return json({error:'Uno degli annunci non è disponibile.'},404);
        if (listings.some(a => a.user_id !== user.id)) return json({error:'Puoi promuovere soltanto i tuoi annunci.'},403);
        if (listings.some(a => (a.status !== 'active' && !(creation && a.status === 'pending'))
            || (a.expires_at && Date.parse(a.expires_at) <= Date.now()))) {
            return json({error:'Seleziona annunci attivi e non scaduti. Un nuovo annuncio può attendere l’approvazione.'},400);
        }
        const params = new URLSearchParams({ mode:'payment','payment_method_types[]':'card',locale:'it',
            success_url:SITE_URL+'/grazie?session_id={CHECKOUT_SESSION_ID}',
            cancel_url:SITE_URL+'/dashboard?'+(creation?'pubblicato=1&':'')+'vetrina=annullata',
            customer_email:user.email ?? '', 'metadata[user_id]':user.id,
            'metadata[tier]':body.tier,'metadata[checkout_version]':'premium_v1',
            'metadata[annuncio_id]':ids[0], 'metadata[listing_count]':String(ids.length),
            'payment_intent_data[metadata][user_id]':user.id,
            'payment_intent_data[metadata][listing_count]':String(ids.length) });
        listings.sort((a,b) => ids.indexOf(a.id)-ids.indexOf(b.id)).forEach((a,i) => {
            const prefix = `line_items[${i}]`;
            params.set(prefix+'[quantity]','1');
            params.set(prefix+'[price_data][currency]','eur');
            params.set(prefix+'[price_data][unit_amount]',String(quote.unit));
            params.set(prefix+'[price_data][product_data][name]',Pricing.plans[body.tier].label);
            params.set(prefix+'[price_data][product_data][description]',
                String(a.titolo || 'Annuncio').slice(0,140)+(quote.discount ? ` · Pacchetto ${ids.length} annunci: −${quote.discount}%` : ''));
        });
        const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;
        const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
            method:'POST',headers:{Authorization:'Bearer '+stripeKey,'Content-Type':'application/x-www-form-urlencoded'},
            body:params.toString(),signal:AbortSignal.timeout(15000)
        });
        const session = await response.json();
        if (!response.ok || !session.id || !session.url) return json({error:'Pagamento non disponibile. Riprova tra poco.'},502);
        const {error:registrationError} = await admin.rpc('register_vetrina_checkout', {
            p_session_id:session.id,p_user_id:user.id,p_listing_ids:ids,p_tier:body.tier,
            p_creation:creation,p_expected_amount:quote.total
        });
        if (registrationError) {
            await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session.id)}/expire`, {
                method:'POST',headers:{Authorization:'Bearer '+stripeKey},signal:AbortSignal.timeout(10000)
            });
            return json({error:'Gli annunci sono cambiati o l’ordine non è disponibile. Ricarica prima di riprovare.'},409);
        }
        return json({url:session.url,session_id:session.id,amount_cents:quote.total,listing_count:ids.length});
    } catch (error) {
        console.error('Premium checkout unavailable:',error instanceof Error ? error.name : 'unknown');
        return json({error:'Non siamo riusciti ad aprire il pagamento. Riprova tra poco.'},503);
    }
});
