// ============================================================
//  Subingresso.it — Edge Function: register-bypass
//  Crea un account utente bypassando il rate limit email di Supabase.
//  Chiamata solo quando signUp fallisce con "email rate limit exceeded".
//  Usa la Admin API per creare l'utente già confermato, poi salva
//  l'email in pending_email_verifications per verifica notturna.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json().catch(() => null);
    if (!body) return json({ error: 'Body mancante' }, 400);

    const { email, password, nome, cognome, telefono } = body;
    if (!email || !password) return json({ error: 'Email e password obbligatorie' }, 400);

    // Validazione base email lato server
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json({ error: 'Email non valida' }, 400);
    }
    if (password.length < 6) {
      return json({ error: 'Password troppo corta' }, 400);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Crea utente con email già confermata (bypassa il rate limit di Supabase)
    const { data: userData, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome: nome || '', cognome: cognome || '', telefono: telefono || '' },
    });

    if (createErr) {
      if (createErr.message.toLowerCase().includes('already registered') ||
          createErr.message.toLowerCase().includes('already been registered') ||
          createErr.message.toLowerCase().includes('duplicate')) {
        return json({ error: 'Email già registrata. Prova ad accedere.' }, 409);
      }
      return json({ error: createErr.message }, 400);
    }

    if (!userData?.user?.id) {
      return json({ error: 'Utente non creato' }, 500);
    }

    const userId = userData.user.id;

    const { error: profileErr } = await admin.from('profiles').upsert({
      id:                  userId,
      nome:                nome     || '',
      cognome:             cognome  || '',
      telefono:            telefono || '',
      welcome_lottery_eligible: false,
    });
    if (profileErr) {
      console.error('register-bypass profile upsert error:', profileErr);
    }

    // Salva per verifica email notturna
    const { error: pendingErr } = await admin.from('pending_email_verifications').insert({
      user_id: userId,
      email,
    });
    if (pendingErr) {
      console.error('register-bypass pending email log error:', pendingErr);
    }

    return json({ success: true });

  } catch (e) {
    console.error('register-bypass error:', e);
    return json({ error: 'Errore interno' }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
