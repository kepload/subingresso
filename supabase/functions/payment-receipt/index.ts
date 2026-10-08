import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': 'https://subingresso.it',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Metodo non consentito' }, 405);
  const token = (req.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Accedi per vedere la ricevuta.' }, 401);
  try {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SB_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: { user }, error: authError } = await admin.auth.getUser(token);
    if (authError || !user) return json({ error: 'Sessione scaduta. Accedi di nuovo.' }, 401);
    let body;
    try { body = await req.json(); } catch { return json({ error: 'Richiesta non valida.' }, 400); }
    if (typeof body.order_id !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.order_id)) {
      return json({ error: 'Ordine non valido.' }, 400);
    }
    const { data: order, error } = await admin.from('payments')
      .select('stripe_payment_intent, status').eq('id', body.order_id).eq('user_id', user.id).maybeSingle();
    if (error) return json({ error: 'Ricevuta non disponibile. Riprova.' }, 503);
    if (!order) return json({ error: 'Ordine non trovato.' }, 404);
    if (!order.stripe_payment_intent || !['succeeded','refunded'].includes(order.status)) {
      return json({ error: 'La ricevuta sarà disponibile dopo la conferma del pagamento.' }, 409);
    }
    const response = await fetch(`https://api.stripe.com/v1/payment_intents/${encodeURIComponent(order.stripe_payment_intent)}?expand%5B%5D=latest_charge`, {
      headers: { Authorization: `Bearer ${Deno.env.get('STRIPE_SECRET_KEY')!}` },
      signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) return json({ error: 'Stripe non è disponibile. Riprova tra poco.' }, 502);
    const intent = await response.json();
    // Recupera anche il rimborso quando si apre la ricevuta, utile se il
    // relativo webhook Stripe è in ritardo o non è ancora sottoscritto.
    const charge = intent.latest_charge;
    if (Number.isInteger(charge?.amount_refunded) && charge.amount_refunded > 0) {
      const { error: refundError } = await admin.rpc('record_vetrina_refund', {
        p_intent: order.stripe_payment_intent, p_refunded_cents: charge.amount_refunded,
      });
      if (refundError) return json({ error: 'Aggiornamento del pagamento in corso. Riprova.' }, 503);
    }
    const receipt = charge?.receipt_url;
    if (!receipt) return json({ error: 'Ricevuta non ancora disponibile su Stripe.' }, 409);
    const url = new URL(receipt);
    if (url.protocol !== 'https:' || !['pay.stripe.com','receipt.stripe.com'].includes(url.hostname)) {
      return json({ error: 'Ricevuta non disponibile.' }, 502);
    }
    return json({ url: url.href });
  } catch {
    return json({ error: 'Non siamo riusciti a recuperare la ricevuta. Riprova.' }, 503);
  }
});
