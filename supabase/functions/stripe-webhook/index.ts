// ============================================================
//  Subingresso.it — Edge Function: stripe-webhook
//  Riceve eventi Stripe, verifica firma, attiva vetrina.
//  IMPORTANTE: "Verify JWT" deve essere DISATTIVATO per questa function
//  (Supabase Dashboard → Edge Functions → stripe-webhook → Configuration).
//  Stripe non invia JWT — la sicurezza è data dalla firma HMAC.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_WEBHOOK_SECRET     = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SB_SECRET_KEY             = Deno.env.get('SB_SECRET_KEY') ?? SUPABASE_SERVICE_ROLE_KEY;

const TIER_DAYS: Record<string, number> = {
  '10d': 10,
  '30d': 30,
  '90d': 90,
};

// La vetrina non estende piu' expires_at del post (rimosso 6 mag 2026).
// Il default 200gg vale per tutti, vetrina = solo featured/posizione/visibilita'.

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  const rawBody = await req.text();

  // 1. Verifica firma HMAC Stripe (manualmente, per evitare SDK e polyfill)
  const verified = await verifyStripeSignature(rawBody, signature, STRIPE_WEBHOOK_SECRET);
  if (!verified) {
    console.error('Signature verification FAILED');
    return new Response('Invalid signature', { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch (_) {
    return new Response('Invalid JSON', { status: 400 });
  }

  console.log(JSON.stringify({
    event: 'stripe-webhook:received',
    type: event.type,
    id: event.id,
  }));

  const admin = createClient(SUPABASE_URL, SB_SECRET_KEY);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;

        // Pagamento non completato (es. pending bonifico)
        if (session.payment_status !== 'paid') {
          console.log('Session not paid, skip:', session.id, session.payment_status);
          return new Response('OK (unpaid)', { status: 200 });
        }

        const metadata    = session.metadata || {};
        const annuncioId  = metadata.annuncio_id;
        const userId      = metadata.user_id;
        const tier        = metadata.tier;

        if (!annuncioId || !userId || !tier || !TIER_DAYS[tier]) {
          console.error('Metadata mancanti o invalidi:', metadata);
          return new Response('Missing metadata', { status: 200 }); // 200 per non far riprovare Stripe
        }

        // Pagamento e giorni sono registrati nella stessa transazione.
        // Su pending attende l'approvazione; i replay Stripe non aggiungono giorni.
        const { data: activation, error: activationErr } = await admin.rpc('apply_vetrina_payment', {
          p_session_id: session.id,
          p_annuncio_id: annuncioId,
          p_user_id: userId,
          p_tier: tier,
          p_amount_cents: session.amount_total,
          p_currency: session.currency,
          p_payment_intent: session.payment_intent,
          p_customer_email: session.customer_details?.email || session.customer_email || null,
        });
        if (activationErr) {
          console.error('Vetrina activation error:', activationErr);
          return new Response('DB error', { status: 500 });
        }
        console.log('Vetrina payment processed:', session.id, activation);
        return new Response('OK', { status: 200 });
      }

      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
        await admin.from('payments')
          .update({ status: 'failed' })
          .eq('stripe_session_id', session.id)
          .eq('status', 'pending');
        return new Response('OK', { status: 200 });
      }

      default:
        return new Response('Event ignored', { status: 200 });
    }
  } catch (e) {
    console.error('stripe-webhook error:', e);
    return new Response('Internal error', { status: 500 });
  }
});

// ── Verifica firma HMAC-SHA256 Stripe (manuale) ─────────────
async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(
    header.split(',').map(p => p.split('=') as [string, string])
  );
  const t   = parts.t;
  const v1  = parts.v1;
  if (!t || !v1) return false;

  // Tolleranza 5 minuti contro replay attack
  const timestamp = parseInt(t, 10);
  if (isNaN(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;

  const signedPayload = `${t}.${payload}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signedPayload));
  const expected = Array.from(new Uint8Array(sig))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  // Comparazione a tempo costante
  if (expected.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}
