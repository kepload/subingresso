// ============================================================
//  Subingresso.it - Edge Function: grant-welcome-vetrina
//  Applica la Vetrina welcome solo al proprietario vincitore.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SB_SECRET_KEY             = Deno.env.get('SB_SECRET_KEY') ?? SUPABASE_SERVICE_ROLE_KEY;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Non autenticato' }, 401);
    const token = authHeader.replace('Bearer ', '').trim();

    const admin = createClient(SUPABASE_URL, SB_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes?.user) return json({ error: 'Token non valido' }, 401);

    const body = await req.json().catch(() => null);
    const annuncioId = String(body?.annuncio_id || '').trim();
    if (!annuncioId) return json({ error: 'annuncio_id mancante' }, 400);

    const userId = userRes.user.id;
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('welcome_lottery_won')
      .eq('id', userId)
      .maybeSingle();
    if (profileErr) return json({ error: 'Profilo non trovato' }, 400);
    if (profile?.welcome_lottery_won !== true) return json({ granted: false });

    const { data: annuncio, error: annErr } = await admin
      .from('annunci')
      .select('id, user_id')
      .eq('id', annuncioId)
      .maybeSingle();
    if (annErr || !annuncio) return json({ error: 'Annuncio non trovato' }, 404);
    if (annuncio.user_id !== userId) return json({ error: 'Annuncio non tuo' }, 403);

    const { error: updateErr } = await admin
      .from('annunci')
      .update({
        featured:       true,
        featured_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        featured_tier:  'welcome_lottery',
        featured_since: new Date().toISOString(),
      })
      .eq('id', annuncioId)
      .eq('user_id', userId);
    if (updateErr) return json({ error: updateErr.message }, 500);

    const { error: consumeErr } = await admin
      .from('profiles')
      .update({ welcome_lottery_won: false })
      .eq('id', userId);
    if (consumeErr) console.error('grant-welcome-vetrina consume error:', consumeErr);

    return json({ granted: true });
  } catch (e) {
    console.error('grant-welcome-vetrina error:', e);
    return json({ error: 'Errore interno' }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
