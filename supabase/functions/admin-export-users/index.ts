// ============================================================
//  Subingresso.it — Edge Function: export CSV utenti (admin)
//  Scarica un CSV con dati utili per partner/lead-gen.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'GET' && req.method !== 'POST') {
    return jsonErr('Method not allowed', 405);
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return jsonErr('Missing token', 401);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    const requester = userRes?.user;
    if (userErr || !requester) return jsonErr('Unauthorized', 401);

    const { data: profile, error: profileErr } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', requester.id)
      .maybeSingle();

    if (profileErr || profile?.is_admin !== true) {
      return jsonErr('Forbidden', 403);
    }

    // ── Fetch dati utenti ─────────────────────────────────
    const { data: authRows, error: rpcErr } = await admin
      .rpc('admin_get_recent_users', { p_limit: 5000 });
    if (rpcErr) return jsonErr(rpcErr.message, 500);

    const rows = (authRows as Array<Record<string, unknown>>) || [];
    const ids = rows.map(u => u.id as string).filter(Boolean);

    // Profili + annunci + messaggi + conversazioni in parallelo
    const [profilesRes, annunciRes, messaggiRes, conversazioniRes] = await Promise.all([
      ids.length
        ? admin.from('profiles')
            .select('id, nome, cognome, telefono, email_digest, email_stats')
            .in('id', ids)
        : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
      ids.length
        ? admin.from('annunci')
            .select('user_id, status')
            .in('user_id', ids)
        : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
      ids.length
        ? admin.from('messaggi')
            .select('mittente_id')
            .in('mittente_id', ids)
        : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
      ids.length
        ? admin.from('conversazioni')
            .select('venditore_id')
            .in('venditore_id', ids)
        : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),
    ]);

    const profileMap = new Map(
      ((profilesRes.data || []) as Array<Record<string, unknown>>).map(p => [String(p.id), p])
    );

    const annunciMap = new Map<string, { total: number; active: number }>();
    for (const a of (annunciRes.data || []) as Array<Record<string, unknown>>) {
      const key = String(a.user_id);
      const entry = annunciMap.get(key) || { total: 0, active: 0 };
      entry.total++;
      if (a.status === 'active') entry.active++;
      annunciMap.set(key, entry);
    }

    const messaggiMap = new Map<string, number>();
    for (const m of (messaggiRes.data || []) as Array<Record<string, unknown>>) {
      const key = String(m.mittente_id);
      messaggiMap.set(key, (messaggiMap.get(key) || 0) + 1);
    }

    const conversazioniMap = new Map<string, number>();
    for (const c of (conversazioniRes.data || []) as Array<Record<string, unknown>>) {
      const key = String(c.venditore_id);
      conversazioniMap.set(key, (conversazioniMap.get(key) || 0) + 1);
    }

    // ── Costruisci CSV ────────────────────────────────────
    const headers = [
      'id',
      'email',
      'nome',
      'cognome',
      'telefono',
      'created_at',
      'last_sign_in_at',
      'email_confirmed',
      'email_digest_optin',
      'email_stats_optin',
      'annunci_attivi',
      'annunci_totali',
      'messaggi_inviati',
      'contatti_ricevuti',
    ];

    const lines: string[] = [headers.join(',')];

    rows
      .sort((a, b) =>
        new Date(String(b.created_at || 0)).getTime() -
        new Date(String(a.created_at || 0)).getTime()
      )
      .forEach((u) => {
        const id = String(u.id);
        const p = (profileMap.get(id) as Record<string, unknown>) || {};
        const counts = annunciMap.get(id) || { total: 0, active: 0 };
        const sent = messaggiMap.get(id) || 0;
        const received = conversazioniMap.get(id) || 0;
        const row = [
          csv(id),
          csv(u.email),
          csv(p.nome),
          csv(p.cognome),
          csv(p.telefono),
          csv(u.created_at),
          csv(u.last_sign_in_at),
          csv(u.confirmed_at ? 'true' : 'false'),
          csv(p.email_digest === false ? 'false' : 'true'),
          csv(p.email_stats === false ? 'false' : 'true'),
          csv(counts.active),
          csv(counts.total),
          csv(sent),
          csv(received),
        ];
        lines.push(row.join(','));
      });

    const body = '﻿' + lines.join('\r\n'); // BOM UTF-8 per Excel
    const today = new Date().toISOString().slice(0, 10);

    return new Response(body, {
      status: 200,
      headers: {
        ...CORS,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="subingresso-utenti-${today}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('admin-export-users error:', e);
    return jsonErr('Errore interno', 500);
  }
});

function csv(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (s.includes('"') || s.includes(',') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function jsonErr(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
