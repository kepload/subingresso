// ============================================================
//  Subingresso.it - Edge Function: register-bypass
//  Crea un account utilizzabile subito e salva la mail tra
//  quelle da verificare in seguito.
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

    const { email, password, nome, cognome, telefono, welcome_lottery_eligible } = body;
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '');
    if (!cleanEmail || !cleanPassword) return json({ error: 'Email e password obbligatorie' }, 400);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return json({ error: 'Email non valida' }, 400);
    }
    if (cleanPassword.length < 6) {
      return json({ error: 'Password troppo corta' }, 400);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const eligible = welcome_lottery_eligible === true;

    const { data: userData, error: createErr } = await admin.auth.admin.createUser({
      email: cleanEmail,
      password: cleanPassword,
      email_confirm: true,
      user_metadata: { nome: nome || '', cognome: cognome || '', telefono: telefono || '' },
    });

    if (createErr) {
      const msg = createErr.message.toLowerCase();
      const duplicate = msg.includes('already registered') ||
        msg.includes('already been registered') ||
        msg.includes('duplicate');

      if (!duplicate) return json({ error: createErr.message }, 400);

      const existing = await findUserByEmail(admin, cleanEmail);
      if (existing && !existing.email_confirmed_at) {
        const { error: updateErr } = await admin.auth.admin.updateUserById(existing.id, {
          password: cleanPassword,
          email_confirm: true,
          user_metadata: { nome: nome || '', cognome: cognome || '', telefono: telefono || '' },
        });
        if (updateErr) return json({ error: updateErr.message }, 400);
        await upsertProfile(admin, existing.id, nome, cognome, telefono, eligible);
        await logPendingVerification(admin, existing.id, cleanEmail);
        return json({ success: true });
      }

      return json({ error: 'Email gia registrata. Prova ad accedere.' }, 409);
    }

    if (!userData?.user?.id) {
      return json({ error: 'Utente non creato' }, 500);
    }

    await upsertProfile(admin, userData.user.id, nome, cognome, telefono, eligible);
    await logPendingVerification(admin, userData.user.id, cleanEmail);

    return json({ success: true });
  } catch (e) {
    console.error('register-bypass error:', e);
    return json({ error: 'Errore interno' }, 500);
  }
});

async function findUserByEmail(admin: ReturnType<typeof createClient>, email: string) {
  const target = email.trim().toLowerCase();

  for (let page = 1; page <= 10; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      console.error('register-bypass list users error:', error);
      return null;
    }

    const found = data?.users?.find((u) => String(u.email || '').toLowerCase() === target);
    if (found) return found;
    if (!data?.users || data.users.length < 1000) return null;
  }

  return null;
}

async function upsertProfile(
  admin: ReturnType<typeof createClient>,
  userId: string,
  nome: string,
  cognome: string,
  telefono: string,
  welcomeLotteryEligible: boolean,
) {
  try {
    const { error } = await admin.from('profiles').upsert({
      id:                       userId,
      nome:                     nome     || '',
      cognome:                  cognome  || '',
      telefono:                 telefono || '',
      welcome_lottery_eligible: welcomeLotteryEligible,
    });
    if (error) console.error('register-bypass profile upsert error:', error);
  } catch (e) {
    console.error('register-bypass profile upsert exception:', e);
  }
}

async function logPendingVerification(admin: ReturnType<typeof createClient>, userId: string, email: string) {
  try {
    const { error } = await admin.from('pending_email_verifications').insert({ user_id: userId, email });
    if (error) console.error('register-bypass pending email log error:', error);
  } catch (e) {
    console.error('register-bypass pending email log exception:', e);
  }
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
