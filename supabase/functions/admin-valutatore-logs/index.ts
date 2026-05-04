// ============================================================
//  Subingresso.it — Edge Function: admin valutatore logs
//  Restituisce i log del valutatore per la dashboard admin.
//  Bypassa la RLS (che blocca SELECT) usando service_role.
//  Verifica che il chiamante sia autenticato e is_admin = true.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SB_SECRET_KEY             = Deno.env.get('SB_SECRET_KEY') ?? SUPABASE_SERVICE_ROLE_KEY;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'GET' && req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return json({ error: 'Missing token' }, 401);

    const admin = createClient(SUPABASE_URL, SB_SECRET_KEY);

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

    // Limit configurabile via querystring (default 500, max 2000)
    const url = new URL(req.url);
    const limitRaw = parseInt(url.searchParams.get('limit') || '500', 10);
    const limit = Math.min(Math.max(limitRaw, 1), 2000);

    const { data: logs, error: logsErr } = await admin
      .from('valutatore_logs')
      .select(`
        id, created_at, session_token, user_id, annuncio_id,
        fatturato, frequenza, durata_fiera, stagionalita, zona, settore, posizione, anzianita,
        prezzo_min, prezzo_avg, prezzo_max, affitto_annuo, affitto_mensile,
        referrer, utm_source, utm_medium, utm_campaign, landing_path,
        device_type, country, region, tempo_compilazione_sec, algoritmo_version,
        user_linked_at, annuncio_linked_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (logsErr) return json({ error: logsErr.message }, 500);

    // Arricchisce con email utente (se collegato) — fetch in batch
    const userIds = Array.from(new Set((logs || [])
      .map((l: any) => l.user_id)
      .filter(Boolean)));

    let emailMap: Record<string, string> = {};
    if (userIds.length) {
      const { data: rows } = await admin
        .rpc('admin_get_recent_users', { p_limit: 5000 });
      const allUsers = (rows as Array<Record<string, unknown>>) || [];
      for (const u of allUsers) {
        if (userIds.includes(String(u.id))) {
          emailMap[String(u.id)] = String(u.email || '');
        }
      }
    }

    const enriched = (logs || []).map((l: any) => ({
      ...l,
      user_email: l.user_id ? (emailMap[l.user_id] || null) : null,
    }));

    // Funnel aggregato (last 30 days)
    const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const recent = (logs || []).filter((l: any) => l.created_at >= since30);
    const stats = {
      totale_30d:        recent.length,
      registrati_30d:    recent.filter((l: any) => l.user_id).length,
      pubblicato_30d:    recent.filter((l: any) => l.annuncio_id).length,
      totale_all:        (logs || []).length,
    };

    return json({ logs: enriched, stats });

  } catch (e) {
    console.error('admin-valutatore-logs error:', e);
    return json({ error: 'Errore interno' }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
