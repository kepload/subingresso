// ============================================================
//  Subingresso.it — Edge Function: export CSV utenti (admin)
//  Scarica il CSV completo per il controllo interno dell'amministratore.
// ============================================================

import { userDirectory } from '../_shared/user-directory.ts';

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
    return jsonErr('Method not allowed', 405);
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return jsonErr('Missing token', 401);

    const admin = createClient(SUPABASE_URL, SB_SECRET_KEY);

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

    const rows = await userDirectory(admin);

    // ── Costruisci CSV ────────────────────────────────────
    const headers = [
      'id',
      'email',
      'nome',
      'cognome',
      'telefono',
      'created_at',
      'last_sign_in_at',
      'email_confirmed_in_supabase',
      'email_confirmation_mode',
      'email_digest_enabled',
      'email_stats_enabled',
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
        const row = [
          csv(id),
          csv(u.email),
          csv(u.nome),
          csv(u.cognome),
          csv(u.telefono),
          csv(u.created_at),
          csv(u.last_sign_in_at),
          csv(u.confirmed_at ? 'true' : 'false'),
          csv(u.verification_mode || 'non_registrato'),
          csv(u.email_digest == null ? '' : String(u.email_digest)),
          csv(u.email_stats == null ? '' : String(u.email_stats)),
          csv(u.annunci_active),
          csv(u.annunci_total),
          csv(u.messaggi_inviati),
          csv(u.contatti_ricevuti),
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
  const raw = String(v);
  const s = /^[\s]*[=+@-]/.test(raw) ? "'" + raw : raw;
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
