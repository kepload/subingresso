// ============================================================
//  Subingresso.it — Edge Function: ultimi utenti admin dashboard
//  Restituisce le ultime iscrizioni con email e permette delete account, solo per admin.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'DELETE') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return json({ error: 'Missing token' }, 401);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    const requester = userRes?.user;
    if (userErr || !requester) return json({ error: 'Unauthorized' }, 401);

    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', requester.id)
      .maybeSingle();

    if (profileErr || profile?.is_admin !== true) {
      return json({ error: 'Forbidden' }, 403);
    }

    if (req.method === 'DELETE') {
      const body = await req.json().catch(() => null);
      const userId = String(body?.user_id || '').trim();
      const email = String(body?.email || '').trim().toLowerCase();

      if (!userId) return json({ error: 'User id mancante' }, 400);
      if (userId === requester.id) {
        return json({ error: 'Non puoi eliminare il tuo account admin da qui.' }, 400);
      }

      const { data: targetData, error: targetErr } = await admin.auth.admin.getUserById(userId);
      if (targetErr || !targetData?.user) return json({ error: 'Utente non trovato' }, 404);

      const targetEmail = (targetData.user.email || '').toLowerCase();
      if (email && email !== targetEmail) {
        return json({ error: 'Email di conferma non corrisponde all’utente.' }, 400);
      }

      const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
      if (deleteErr) return json({ error: deleteErr.message }, 500);

      return json({ success: true, deleted: { id: userId, email: targetData.user.email } });
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: 'SUPABASE_SERVICE_ROLE_KEY mancante nei secrets della funzione' }, 500);
    }

    // Usa REST API diretta per evitare incompatibilità SDK su Deno
    const usersRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
      headers: {
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      }
    });
    if (!usersRes.ok) {
      const errBody = await usersRes.text().catch(() => `HTTP ${usersRes.status}`);
      return json({ error: `Errore listUsers: ${errBody}` }, 500);
    }
    const usersData = await usersRes.json();

    const users = ((usersData.users || []) as Array<Record<string, unknown>>)
      .sort((a, b) => new Date(String(b.created_at || 0)).getTime() - new Date(String(a.created_at || 0)).getTime())
      .slice(0, 5)
      .map((user: Record<string, unknown>) => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        confirmed_at: user.email_confirmed_at,
        nome: (user.user_metadata as Record<string, unknown>)?.nome || '',
        cognome: (user.user_metadata as Record<string, unknown>)?.cognome || '',
      }));

    return json({ users });
  } catch (e) {
    console.error('admin-recent-users error:', e);
    return json({ error: 'Errore interno' }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
