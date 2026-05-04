// ============================================================
//  Subingresso.it — Edge Function: notifica email nuova segnalazione
//  Chiamata: dal frontend (messaggi.html) DOPO INSERT su conversation_reports.
//  Auth: Bearer <user JWT> nel header Authorization. Verifica interna che
//  il reporter_id del record corrisponda a auth.getUser().id.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL   = Deno.env.get('SUPABASE_URL')!;
const SB_SECRET_KEY  = Deno.env.get('SB_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FROM_EMAIL     = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL       = 'https://subingresso.it';

function escapeHTML(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const REASON_LABELS: Record<string, string> = {
  scam:       'Truffa o tentativo di frode',
  harassment: 'Molestie o insulti',
  spam:       'Spam o pubblicità',
  other:      'Altro',
};

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return new Response('Method not allowed', { status: 405, headers: CORS });

  try {
    const auth   = req.headers.get('authorization') || '';
    const userJwt = auth.replace(/^Bearer\s+/i, '');
    if (!userJwt) return new Response('Unauthorized', { status: 401, headers: CORS });

    const admin = createClient(SUPABASE_URL, SB_SECRET_KEY);
    const { data: { user }, error: userErr } = await admin.auth.getUser(userJwt);
    if (userErr || !user) return new Response('Unauthorized', { status: 401, headers: CORS });

    const body = await req.json().catch(() => ({}));
    const reportId = body?.report_id;
    if (!reportId) return new Response('Missing report_id', { status: 400, headers: CORS });

    // Recupera report
    const { data: report } = await admin
      .from('conversation_reports')
      .select('id, conversazione_id, reporter_id, reason, details, created_at')
      .eq('id', reportId)
      .single();
    if (!report) return new Response('Report not found', { status: 404, headers: CORS });

    // Solo l'autore della segnalazione può triggerare l'email
    if (report.reporter_id !== user.id) {
      return new Response('Forbidden', { status: 403, headers: CORS });
    }

    // Reporter info
    const [{ data: reporterProfile }, reporterAuth] = await Promise.all([
      admin.from('profiles').select('nome, cognome').eq('id', report.reporter_id).single(),
      admin.auth.admin.getUserById(report.reporter_id),
    ]);
    const reporterName  = reporterProfile
      ? `${reporterProfile.nome || ''} ${reporterProfile.cognome || ''}`.trim() || 'Utente'
      : 'Utente';
    const reporterEmail = reporterAuth.data?.user?.email || '—';

    // Conv + annuncio
    const { data: conv } = await admin
      .from('conversazioni')
      .select('id, is_support, annuncio_id, acquirente_id, venditore_id, annuncio:annunci(titolo)')
      .eq('id', report.conversazione_id)
      .single();

    const annuncioTitolo = (conv?.annuncio as any)?.titolo
      || (conv?.is_support ? 'Chat di Supporto' : '—');

    // Ultimi 3 messaggi per contesto
    const { data: lastMsgs } = await admin
      .from('messaggi')
      .select('mittente_id, testo, created_at')
      .eq('conversazione_id', report.conversazione_id)
      .order('created_at', { ascending: false })
      .limit(3);

    const messagesHTML = (lastMsgs || []).slice().reverse().map((m) => {
      const fromReporter = m.mittente_id === report.reporter_id;
      return `<p style="margin:8px 0;color:${fromReporter ? '#1d4ed8' : '#0f172a'};font-size:13px;line-height:1.5;">
        <strong>${fromReporter ? 'Segnalante' : 'Altro utente'}:</strong> ${escapeHTML((m.testo || '').slice(0, 220))}${(m.testo || '').length > 220 ? '…' : ''}
      </p>`;
    }).join('');

    // Lista email admin
    const { data: admins } = await admin
      .from('profiles')
      .select('id')
      .eq('is_admin', true);

    const adminEmails: string[] = [];
    for (const a of (admins || [])) {
      const { data } = await admin.auth.admin.getUserById(a.id);
      if (data?.user?.email) adminEmails.push(data.user.email);
    }
    if (!adminEmails.length) {
      console.warn('No admin emails found, skipping send');
      return new Response('OK (no admins)', { status: 200, headers: CORS });
    }

    const reasonLabel = REASON_LABELS[report.reason] || report.reason;

    const html = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f1f5f9;">
        <div style="background:#dc2626;padding:24px 28px;">
          <span style="color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.3px;">⚠️ Nuova Segnalazione</span>
        </div>
        <div style="padding:28px;">
          <h2 style="margin:0 0 16px;font-size:18px;font-weight:900;color:#0f172a;">Motivo: ${escapeHTML(reasonLabel)}</h2>

          <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 12px;">
            <tr><td style="color:#64748b;font-size:13px;padding:4px 0;width:100px;"><strong>Da:</strong></td>
                <td style="color:#0f172a;font-size:13px;padding:4px 0;">${escapeHTML(reporterName)} &lt;${escapeHTML(reporterEmail)}&gt;</td></tr>
            <tr><td style="color:#64748b;font-size:13px;padding:4px 0;"><strong>Su:</strong></td>
                <td style="color:#0f172a;font-size:13px;padding:4px 0;">
                  ${escapeHTML(annuncioTitolo)}
                  ${conv?.is_support ? '<span style="background:#dbeafe;color:#1e40af;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-left:6px;">Supporto</span>' : ''}
                </td></tr>
          </table>

          ${report.details ? `
          <div style="background:#fef2f2;border-left:4px solid #dc2626;border-radius:8px;padding:14px 18px;margin:16px 0;">
            <p style="margin:0 0 4px;color:#991b1b;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">Dettagli</p>
            <p style="margin:0;color:#7f1d1d;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHTML(report.details)}</p>
          </div>
          ` : ''}

          ${messagesHTML ? `
          <div style="background:#f8fafc;border-radius:8px;padding:14px 18px;margin:16px 0;">
            <p style="margin:0 0 8px;color:#64748b;font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:1px;">Ultimi messaggi</p>
            ${messagesHTML}
          </div>
          ` : ''}

          <div style="margin-top:24px;">
            <a href="${SITE_URL}/dashboard.html#reports"
               style="display:inline-block;background:#0f172a;color:#fff;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-right:8px;margin-bottom:8px;">
              Apri pannello segnalazioni →
            </a>
            <a href="${SITE_URL}/messaggi.html?conv=${report.conversazione_id}"
               style="display:inline-block;background:#fff;color:#0f172a;padding:12px 24px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;border:1px solid #e2e8f0;margin-bottom:8px;">
              Vedi conversazione
            </a>
          </div>
        </div>
        <div style="padding:18px 28px;border-top:1px solid #f1f5f9;text-align:center;">
          <p style="margin:0;color:#94a3b8;font-size:11px;">
            Subingresso.it · Sistema di segnalazione conforme DSA
          </p>
        </div>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    FROM_EMAIL,
        to:      adminEmails,
        subject: `⚠️ Segnalazione (${reasonLabel}) — Subingresso.it`,
        html,
      }),
    });

    if (!res.ok) {
      console.error('Resend error:', res.status, await res.text());
      return new Response('Email error', { status: 500, headers: CORS });
    }

    return new Response('OK', { status: 200, headers: CORS });
  } catch (err) {
    console.error('notify-report error:', err);
    return new Response(`Error: ${(err as Error).message}`, { status: 500, headers: CORS });
  }
});
