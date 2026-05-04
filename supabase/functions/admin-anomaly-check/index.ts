// ============================================================
//  Subingresso.it — Edge Function: admin-anomaly-check
//  Schedulato da pg_cron 1x al giorno (09:00 UTC).
//  Esegue una serie di check sullo stato del sito; se trova
//  qualcosa di anomalo, invia un'email di alert all'admin.
//  Rate-limit interno: max 1 alert ogni 12 ore.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FROM_EMAIL                = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                  = 'https://subingresso.it';
const RATE_LIMIT_HOURS          = 12;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Issue = { severity: 'warn' | 'crit'; title: string; detail: string };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Auth: SERVICE_ROLE (cron) o JWT di un admin loggato (bottone dashboard).
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }
  if (token !== SUPABASE_SERVICE_ROLE_KEY) {
    const { data: { user }, error: uErr } = await supabase.auth.getUser(token);
    if (uErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }
    const { data: prof } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
    if (!prof?.is_admin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...CORS, 'Content-Type': 'application/json' } });
    }
  }

  try {
    // ── Rate-limit: salta se ultimo check inviato < 12h fa ─────
    const { data: lastLog } = await supabase
      .from('admin_alerts_log')
      .select('checked_at, notified')
      .eq('notified', true)
      .order('checked_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastLog?.checked_at) {
      const ageH = (Date.now() - new Date(String(lastLog.checked_at)).getTime()) / 36e5;
      if (ageH < RATE_LIMIT_HOURS) {
        return json({ skipped: true, reason: `rate-limited (${ageH.toFixed(1)}h)` });
      }
    }

    const issues: Issue[] = [];

    // ── 1. Annunci pubblicati nelle ultime 24h ───────────────
    const since24h = new Date(Date.now() - 24 * 36e5).toISOString();
    const { count: listings24h } = await supabase
      .from('annunci')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since24h)
      .neq('status', 'deleted');
    if ((listings24h ?? 0) === 0) {
      issues.push({
        severity: 'crit',
        title: 'Nessun annuncio pubblicato in 24h',
        detail: 'Nelle ultime 24 ore non è stato pubblicato alcun annuncio. Possibile rottura del flusso di pubblicazione (vendi.html / register-bypass / pg_net trigger).',
      });
    }

    // ── 2. Iscritti negli ultimi 7 giorni ────────────────────
    const since7d = new Date(Date.now() - 7 * 24 * 36e5).toISOString();
    const { count: signups7d } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since7d);
    if ((signups7d ?? 0) === 0) {
      issues.push({
        severity: 'crit',
        title: 'Nessun nuovo iscritto in 7 giorni',
        detail: 'Nessuna registrazione completata negli ultimi 7 giorni. Verifica register-bypass e form di signup.',
      });
    }

    // ── 3. Page views ultime 24h ─────────────────────────────
    const { count: pv24h } = await supabase
      .from('page_views')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since24h);
    if ((pv24h ?? 0) < 5) {
      issues.push({
        severity: 'warn',
        title: 'Traffico anomalo basso',
        detail: `Solo ${pv24h ?? 0} pagine viste nelle ultime 24 ore. Possibile sito offline o tracker rotto (page-view-tracker.js).`,
      });
    }

    // ── 4. Annunci pending da > 3 giorni ─────────────────────
    const since3d = new Date(Date.now() - 3 * 24 * 36e5).toISOString();
    const { count: pendingOld } = await supabase
      .from('annunci')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lt('created_at', since3d);
    if ((pendingOld ?? 0) > 0) {
      issues.push({
        severity: 'warn',
        title: `${pendingOld} annunci pending non moderati da > 3 giorni`,
        detail: 'Annunci in attesa di moderazione vecchi: l\'utente che li ha pubblicati sta aspettando.',
      });
    }

    // ── 5. Spike anomalo signups ultima ora (>20) ────────────
    const since1h = new Date(Date.now() - 36e5).toISOString();
    const { count: signups1h } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', since1h);
    if ((signups1h ?? 0) > 20) {
      issues.push({
        severity: 'crit',
        title: `Spike di iscrizioni: ${signups1h} in 1 ora`,
        detail: 'Numero anomalo di nuove registrazioni nell\'ultima ora. Possibile attacco bot o spam.',
      });
    }

    // ── Log + email se ci sono issues ────────────────────────
    if (issues.length === 0) {
      await supabase.from('admin_alerts_log').insert({
        issues_count: 0,
        issues: [],
        notified: false,
      });
      return json({ ok: true, issues_count: 0 });
    }

    // Trova email admin
    const { data: adminRows } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_admin', true)
      .limit(5);

    const adminIds = (adminRows || []).map(r => String(r.id));
    const adminEmails: string[] = [];
    for (const id of adminIds) {
      try {
        const { data } = await supabase.auth.admin.getUserById(id);
        const email = data?.user?.email;
        if (email) adminEmails.push(email);
      } catch (_) {}
    }
    if (adminEmails.length === 0) {
      console.error('admin-anomaly-check: nessun admin con email trovato');
      await supabase.from('admin_alerts_log').insert({
        issues_count: issues.length,
        issues,
        notified: false,
      });
      return json({ error: 'No admin email', issues_count: issues.length }, 500);
    }

    const subject = `🚨 Subingresso — ${issues.length} alert${issues.length > 1 ? 's' : ''}`;
    const html = renderEmail(issues);

    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      adminEmails,
        subject,
        html,
      }),
    });

    const sent = resp.ok;
    if (!sent) {
      const errBody = await resp.text().catch(() => '');
      console.error('Resend error:', resp.status, errBody);
    }

    await supabase.from('admin_alerts_log').insert({
      issues_count: issues.length,
      issues,
      notified: sent,
    });

    return json({ ok: true, issues_count: issues.length, notified: sent });
  } catch (e) {
    console.error('admin-anomaly-check error:', e);
    return json({ error: String(e?.message || e) }, 500);
  }
});

function renderEmail(issues: Issue[]): string {
  const rows = issues.map(i => {
    const color = i.severity === 'crit' ? '#dc2626' : '#d97706';
    const bg    = i.severity === 'crit' ? '#fef2f2' : '#fffbeb';
    const ico   = i.severity === 'crit' ? '⛔' : '⚠️';
    return `
      <div style="background:${bg};border-left:4px solid ${color};padding:14px 18px;border-radius:10px;margin:0 0 12px;">
        <p style="margin:0 0 6px;color:${color};font-size:14px;font-weight:900;">${ico} ${escapeHtml(i.title)}</p>
        <p style="margin:0;color:#334155;font-size:13px;line-height:1.5;">${escapeHtml(i.detail)}</p>
      </div>`;
  }).join('');

  const now = new Date().toISOString();
  return `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #f1f5f9;">
      <div style="background:#0f172a;padding:24px;">
        <span style="color:#fff;font-size:18px;font-weight:900;">🚨 Subingresso — Anomaly Check</span>
      </div>
      <div style="padding:24px;">
        <p style="margin:0 0 18px;color:#475569;font-size:13px;">Check eseguito ${escapeHtml(now)}. Trovati <strong>${issues.length}</strong> alert.</p>
        ${rows}
        <p style="margin:24px 0 0;font-size:11px;color:#94a3b8;">
          Apri la <a href="${SITE_URL}/dashboard.html" style="color:#2563eb;">dashboard admin</a> per investigare.
        </p>
      </div>
    </div>`;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
