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

// Cap di durata totale post-acquisto vetrina, allineati al nuovo default 200gg.
// Vetrina = bonus oltre il default: +30gg / +100gg / +200gg.
const TIER_EXPIRY_CAP_DAYS: Record<string, number> = {
  '10d': 230,
  '30d': 300,
  '90d': 400,
};

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

        const days  = TIER_DAYS[tier];
        const now   = new Date();

        // Se l'annuncio è già featured e non scaduto, estendi a partire da featured_until
        const { data: currentAnn } = await admin
          .from('annunci')
          .select('featured, featured_until, created_at, expires_at')
          .eq('id', annuncioId)
          .single();

        const startFrom = (currentAnn?.featured && currentAnn.featured_until && new Date(currentAnn.featured_until) > now)
          ? new Date(currentAnn.featured_until)
          : now;

        const until = new Date(startFrom.getTime() + days * 24 * 60 * 60 * 1000);

        const createdAt = currentAnn?.created_at ? new Date(currentAnn.created_at) : now;
        const expiryCapDays = TIER_EXPIRY_CAP_DAYS[tier] || 100;
        const cappedExpiresAt = new Date(createdAt.getTime() + expiryCapDays * 24 * 60 * 60 * 1000);
        const currentExpiresAt = currentAnn?.expires_at ? new Date(currentAnn.expires_at) : null;
        const nextExpiresAt = currentExpiresAt && currentExpiresAt > cappedExpiresAt
          ? currentExpiresAt
          : cappedExpiresAt;

        // 2. Attiva vetrina
        const { error: updErr } = await admin
          .from('annunci')
          .update({
            featured:       true,
            featured_until: until.toISOString(),
            featured_tier:  tier,
            featured_since: (currentAnn?.featured ? undefined : now.toISOString()),
            expires_at:      nextExpiresAt.toISOString(),
          })
          .eq('id', annuncioId)
          .eq('user_id', userId); // double-check proprietà

        if (updErr) {
          console.error('UPDATE annunci error:', updErr);
          return new Response('DB error', { status: 500 });
        }

        // 3. Aggiorna pagamento → succeeded (idempotente via upsert su session_id)
        await admin.from('payments').upsert({
          user_id:                userId,
          annuncio_id:            annuncioId,
          amount_cents:           session.amount_total,
          currency:               session.currency || 'eur',
          tier,
          status:                 'succeeded',
          stripe_session_id:      session.id,
          stripe_payment_intent:  session.payment_intent,
          customer_email:         session.customer_details?.email || session.customer_email || null,
          activated_at:           now.toISOString(),
        }, { onConflict: 'stripe_session_id' });

        console.log(`✅ Vetrina ${tier} attivata per annuncio ${annuncioId} fino al ${until.toISOString()}`);
        return new Response('OK', { status: 200 });
      }

      case 'checkout.session.expired':
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object;
        await admin.from('payments')
          .update({ status: 'failed' })
          .eq('stripe_session_id', session.id);
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
