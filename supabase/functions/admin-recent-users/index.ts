// ============================================================
//  Subingresso.it — Edge Function: ultimi utenti admin dashboard
//  Restituisce le ultime iscrizioni con email, solo per admin.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'GET')     return json({ error: 'Method not allowed' }, 405);

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

    const { data, error } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 50,
    });
    if (error) return json({ error: error.message }, 500);

    const users = (data?.users || [])
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5)
      .map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        confirmed_at: user.email_confirmed_at,
        nome: user.user_metadata?.nome || '',
        cognome: user.user_metadata?.cognome || '',
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
