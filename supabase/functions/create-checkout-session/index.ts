// ============================================================
//  Subingresso.it — Edge Function: create-checkout-session
//  Crea una sessione Stripe Checkout per attivare la Vetrina.
//  Verifica JWT utente, proprietà annuncio, stato active.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET_KEY         = Deno.env.get('STRIPE_SECRET_KEY')!;
const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SB_SECRET_KEY             = Deno.env.get('SB_SECRET_KEY') ?? SUPABASE_SERVICE_ROLE_KEY;
const SITE_URL                  = 'https://subingresso.it';

// Prezzi (centesimi) — fonte di verità server-side, non fidarsi del client
const TIERS: Record<string, { amount: number; days: number; label: string }> = {
  '10d': { amount: 1990, days: 10, label: 'Vetrina 10 giorni' },
  '30d': { amount: 3990, days: 30, label: 'Vetrina 30 giorni' },
  '90d': { amount: 5990, days: 90, label: 'Vetrina 90 giorni' },
};

// Sconto -10% riservato esclusivamente al momento della pubblicazione
// (step finale del wizard vendi.html). NON disponibile altrove: il gate
// è server-side e non falsificabile dal client perché verifica lo stato
// reale della riga annunci (creato adesso + mai stato in vetrina).
const CREATION_SOURCE   = 'vendi_creation';
const CREATION_DISCOUNT = 0.90;                 // -10%
const CREATION_WINDOW_MS = 60 * 60 * 1000;      // annuncio creato < 60 min fa

const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS });
  }

  try {
    // 1. Verifica autenticazione utente via JWT nell'header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Non autenticato' }, 401);
    }
    const token = authHeader.replace('Bearer ', '');

    // Client con service_role per operazioni privilegiate
    const admin = createClient(SUPABASE_URL, SB_SECRET_KEY);

    // Recupera utente dal token
    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return json({ error: 'Token non valido' }, 401);
    }
    const user = userRes.user;

    // 2. Parsing input
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return json({ error: 'Body mancante' }, 400);
    }
    const annuncioId = String(body.annuncio_id || '').trim();
    const tier       = String(body.tier || '').trim();
    const source     = String(body.source || '').trim();
    const isCreationFlow = source === CREATION_SOURCE;

    if (!annuncioId) return json({ error: 'annuncio_id mancante' }, 400);
    if (!TIERS[tier]) return json({ error: 'tier non valido' }, 400);

    const tierCfg = TIERS[tier];

    // 3. Verifica che l'annuncio appartenga all'utente
    const { data: annuncio, error: annErr } = await admin
      .from('annunci')
      .select('id, user_id, status, titolo, featured, featured_until, featured_since, created_at')
      .eq('id', annuncioId)
      .single();

    if (annErr || !annuncio) {
      return json({ error: 'Annuncio non trovato' }, 404);
    }
    if (annuncio.user_id !== user.id) {
      return json({ error: 'Non sei il proprietario di questo annuncio' }, 403);
    }
    // Lo status valido è 'active'. In fase di pubblicazione (creation flow)
    // l'annuncio è appena stato inserito ed è ancora 'pending' (trigger di
    // moderazione enforce_annunci_status): lo accettiamo, la vetrina verrà
    // applicata dal webhook e diventerà visibile appena l'annuncio è approvato.
    if (annuncio.status === 'deleted') {
      return json({ error: 'Annuncio non disponibile.' }, 400);
    }
    if (annuncio.status !== 'active' && !(isCreationFlow && annuncio.status === 'pending')) {
      return json({ error: 'Puoi attivare la vetrina solo su annunci già pubblicati (status active).' }, 400);
    }

    // 3b. Sconto -10% SOLO al momento della pubblicazione, e solo se l'annuncio
    //     è genuinamente appena creato e non è mai stato in vetrina. Questo
    //     rende lo sconto non sfruttabile dalla dashboard o su annunci vecchi.
    let amount = tierCfg.amount;
    let discounted = false;
    const createdMsAgo = annuncio.created_at
      ? (Date.now() - new Date(annuncio.created_at).getTime())
      : Number.MAX_SAFE_INTEGER;
    if (isCreationFlow
        && !annuncio.featured_since
        && createdMsAgo >= 0
        && createdMsAgo < CREATION_WINDOW_MS) {
      amount     = Math.round(tierCfg.amount * CREATION_DISCOUNT);
      discounted = true;
    }
    const productName = discounted
      ? `${tierCfg.label} · sconto pubblicazione -10%`
      : tierCfg.label;

    // 4. Crea sessione Stripe via API diretta (no SDK per alleggerire la function)
    const params = new URLSearchParams();
    params.set('mode', 'payment');
    params.set('payment_method_types[]', 'card');
    params.set('success_url', `${SITE_URL}/grazie.html?session_id={CHECKOUT_SESSION_ID}`);
    // In creation flow l'annuncio è già stato pubblicato: se l'utente annulla
    // il pagamento lo mandiamo in dashboard a vedere il suo annuncio, non a
    // una pagina "annullata" che farebbe pensare di aver perso l'annuncio.
    params.set('cancel_url', isCreationFlow
      ? `${SITE_URL}/dashboard.html?pubblicato=1&vetrina=annullata`
      : `${SITE_URL}/dashboard.html?vetrina=annullata`);
    params.set('customer_email', user.email ?? '');
    params.set('locale', 'it');
    params.set('allow_promotion_codes', 'true');

    // Line item (price_data inline — evita la gestione manuale dei Price su Stripe Dashboard)
    params.set('line_items[0][quantity]', '1');
    params.set('line_items[0][price_data][currency]', 'eur');
    params.set('line_items[0][price_data][unit_amount]', String(amount));
    params.set('line_items[0][price_data][product_data][name]', productName);
    params.set('line_items[0][price_data][product_data][description]',
      `Vetrina in evidenza su Subingresso.it per ${tierCfg.days} giorni · Annuncio: ${(annuncio.titolo || '').slice(0, 80)}`
    );

    // Metadata (chiave per attivare la vetrina nel webhook)
    params.set('metadata[user_id]',     user.id);
    params.set('metadata[annuncio_id]', annuncioId);
    params.set('metadata[tier]',        tier);
    params.set('metadata[source]',      source || 'dashboard');
    params.set('metadata[discount]',    discounted ? 'vendi_launch10' : '');
    params.set('payment_intent_data[metadata][user_id]',     user.id);
    params.set('payment_intent_data[metadata][annuncio_id]', annuncioId);
    params.set('payment_intent_data[metadata][tier]',        tier);

    // Richiesta Stripe
    const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type':  'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const stripeData = await stripeRes.json();
    if (!stripeRes.ok) {
      console.error('Stripe error:', stripeData);
      return json({ error: stripeData.error?.message || 'Errore Stripe' }, 500);
    }

    // 5. Log pending payment (idempotente: upsert su stripe_session_id)
    await admin.from('payments').upsert({
      user_id:           user.id,
      annuncio_id:       annuncioId,
      amount_cents:      amount,
      currency:          'eur',
      tier,
      status:            'pending',
      stripe_session_id: stripeData.id,
      customer_email:    user.email ?? null,
    }, { onConflict: 'stripe_session_id' });

    return json({ url: stripeData.url, session_id: stripeData.id });

  } catch (e) {
    console.error('create-checkout-session error:', e);
    return json({ error: 'Errore interno' }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
