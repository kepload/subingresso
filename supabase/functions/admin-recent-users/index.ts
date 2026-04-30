// ============================================================
//  Subingresso.it — Edge Function: ultimi utenti admin dashboard
//  Usa RPC admin_get_recent_users (SECURITY DEFINER) invece
//  dell'Auth Admin API che restituisce "Database error finding users"
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

    // Verifica che il chiamante sia autenticato
    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    const requester = userRes?.user;
    if (userErr || !requester) return json({ error: 'Unauthorized' }, 401);

    // Verifica che sia admin
    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', requester.id)
      .maybeSingle();

    if (profileErr || profile?.is_admin !== true) {
      return json({ error: 'Forbidden' }, 403);
    }

    // ── DELETE: elimina account utente ──────────────────────
    if (req.method === 'DELETE') {
      const body = await req.json().catch(() => null);
      const userId = String(body?.user_id || '').trim();
      const email  = String(body?.email  || '').trim().toLowerCase();

      if (!userId) return json({ error: 'User id mancante' }, 400);
      if (userId === requester.id) {
        return json({ error: 'Non puoi eliminare il tuo account admin da qui.' }, 400);
      }

      // Verifica utente via RPC (evita Auth Admin API)
      const { data: targetRows, error: targetErr } = await admin
        .rpc('admin_get_recent_users', { p_limit: 1000 });

      const target = (targetRows as Array<Record<string, unknown>> || []).find(u => u.id === userId);
      if (targetErr || !target) return json({ error: 'Utente non trovato' }, 404);

      const targetEmail = String(target.email || '').toLowerCase();
      if (email && email !== targetEmail) {
        return json({ error: "Email di conferma non corrisponde all'utente." }, 400);
      }

      const { error: deleteErr } = await admin.auth.admin.deleteUser(userId);
      if (deleteErr) return json({ error: deleteErr.message }, 500);

      return json({ success: true, deleted: { id: userId, email: target.email } });
    }

    // ── GET/POST: lista ultimi iscritti via RPC ─────────────
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      return json({ error: 'SUPABASE_SERVICE_ROLE_KEY mancante nei secrets della funzione' }, 500);
    }

    // RPC SECURITY DEFINER che legge auth.users direttamente
    const { data: authRows, error: rpcErr } = await admin
      .rpc('admin_get_recent_users', { p_limit: 2000 });

    if (rpcErr) {
      if (rpcErr.code === '42883' || rpcErr.message?.includes('does not exist')) {
        return json({
          error: 'Funzione SQL mancante. Esegui SETUP_ADMIN_USERS_FN.sql nel SQL Editor di Supabase.',
        }, 500);
      }
      return json({ error: rpcErr.message }, 500);
    }

    const rows = (authRows as Array<Record<string, unknown>> || []);
    const ids = rows.map(u => u.id as string).filter(Boolean);

    // Fetch parallelo: profili + pending verifications + annunci counts
    const [profilesRes, pendingRes, annunciRes] = await Promise.all([
      ids.length
        ? admin.from('profiles').select('id, nome, cognome').in('id', ids)
        : Promise.resolve({ data: [] }),
      ids.length
        ? admin.from('pending_email_verifications').select('user_id, verified_at').in('user_id', ids)
        : Promise.resolve({ data: [], error: null }),
      ids.length
        ? admin.from('annunci').select('user_id, status').in('user_id', ids)
        : Promise.resolve({ data: [] }),
    ]);

    const profileMap = new Map(
      ((profilesRes.data || []) as Array<Record<string, unknown>>).map(p => [String(p.id), p])
    );

    const pendingMap = new Map(
      ((pendingRes.data || []) as Array<Record<string, unknown>>)
        .filter(p => !p.verified_at)
        .map(p => [String(p.user_id), true])
    );

    // Conta annunci per utente
    const annunciMap = new Map<string, { total: number; active: number }>();
    for (const a of (annunciRes.data || []) as Array<Record<string, unknown>>) {
      const key = String(a.user_id);
      if (!annunciMap.has(key)) annunciMap.set(key, { total: 0, active: 0 });
      const entry = annunciMap.get(key)!;
      entry.total++;
      if (a.status === 'active') entry.active++;
    }

    const users = rows
      .sort((a, b) => new Date(String(b.created_at || 0)).getTime() - new Date(String(a.created_at || 0)).getTime())
      .map((u: Record<string, unknown>) => {
        const p = profileMap.get(String(u.id)) as Record<string, unknown> || {};
        const verificationPending = pendingMap.has(String(u.id));
        const counts = annunciMap.get(String(u.id)) || { total: 0, active: 0 };
        return {
          id:                   u.id,
          email:                u.email,
          created_at:           u.created_at,
          last_sign_in_at:      u.last_sign_in_at,
          confirmed_at:         u.confirmed_at,
          email_verified:       Boolean(u.confirmed_at) && !verificationPending,
          verification_pending: verificationPending,
          nome:                 p.nome    || '',
          cognome:              p.cognome || '',
          annunci_active:       counts.active,
          annunci_total:        counts.total,
        };
      });

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
