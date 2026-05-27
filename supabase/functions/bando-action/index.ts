// ============================================================
//  Subingresso.it — Edge Function: bando-action
//  Endpoint pubblico (no JWT) chiamato dai bottoni nelle email di
//  briefing AI Scout: ?t=<token>&a=approve|reject
//  Se 'approve': cambia status a 'sent' e invia broadcast email a
//  tutti gli iscritti bando_alerts della regione del bando.
//  Se 'reject': cambia status a 'rejected'.
//  Idempotente: clic doppio non riinvia.
//  Ritorna pagina HTML di conferma.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SB_SECRET_KEY             = Deno.env.get('SB_SECRET_KEY') ?? SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL                = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                  = 'https://subingresso.it';

function escapeHTML(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Slug generator: "Bando posteggi Fiera Mariana 2026 — Comune di Crotone"
// → "bando-posteggi-fiera-mariana-2026-crotone-calabria"
function makeSlug(titolo: string, regione: string): string {
  const base = `${titolo} ${regione}`
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // strip accenti
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 110);
  return base || 'bando';
}

async function ensureUniqueSlug(admin: any, baseSlug: string, ownId: string): Promise<string> {
  // Verifica unicità; in caso di collisione aggiungi suffisso -2, -3, ...
  let slug = baseSlug;
  for (let i = 0; i < 10; i++) {
    const candidate = i === 0 ? slug : `${baseSlug}-${i+1}`;
    const { data } = await admin
      .from('bando_scouting_log')
      .select('id')
      .eq('published_slug', candidate)
      .neq('id', ownId)
      .maybeSingle();
    if (!data) return candidate;
  }
  // Fallback estremo: aggiungi hash random
  return `${baseSlug}-${Math.random().toString(36).slice(2, 8)}`;
}

function confirmPage(title: string, message: string, color: 'green'|'red'|'gray' = 'green'): string {
  const c = color === 'green' ? '#16a34a' : (color === 'red' ? '#dc2626' : '#64748b');
  const bg = color === 'green' ? '#dcfce7' : (color === 'red' ? '#fee2e2' : '#f1f5f9');
  return `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8">
<title>${escapeHTML(title)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;background:#f8fafc;color:#0f172a;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px;}
.box{background:#fff;border-radius:16px;padding:36px;max-width:480px;text-align:center;box-shadow:0 1px 3px rgba(0,0,0,0.06);}
.icon{display:inline-flex;align-items:center;justify-content:center;width:64px;height:64px;border-radius:50%;background:${bg};color:${c};font-size:32px;margin-bottom:18px;font-weight:900;}
h1{margin:0 0 12px;font-size:22px;font-weight:900;color:#0f172a;}
p{margin:0 0 18px;font-size:14px;color:#64748b;line-height:1.55;}
a{display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:11px 22px;border-radius:10px;}
</style></head>
<body><div class="box">
<div class="icon">${color==='green'?'✓':(color==='red'?'✗':'•')}</div>
<h1>${escapeHTML(title)}</h1>
<p>${escapeHTML(message)}</p>
<a href="${SITE_URL}/dashboard#bandoScouting">Apri dashboard</a>
</div></body></html>`;
}

// Email per gli iscritti: link al landing page Subingresso, NON al PDF Comune.
// L'utente atterra su /bandi/<slug> che ha riassunto + bando ufficiale + cross-sell
// annunci privati della regione + valutatore + iscrizione avvisi.
function bandoEmailHtml(item: any, unsubUrl: string, landingUrl: string): string {
  const titolo = escapeHTML(item.titolo);
  const reg = escapeHTML(item.regione);
  const summary = escapeHTML(item.ai_summary || '');
  return `<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td style="padding:28px 32px 8px;">
          <span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:11px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;padding:4px 10px;border-radius:6px;">Nuovo bando pubblico · ${reg}</span>
          <h1 style="margin:14px 0 8px;font-size:20px;font-weight:900;color:#0f172a;line-height:1.3;">${titolo}</h1>
          <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.6;white-space:pre-line;">${summary}</p>
        </td></tr>
        <tr><td style="padding:0 32px 24px;" align="center">
          <a href="${escapeHTML(landingUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:12px 28px;border-radius:10px;">
            Vedi il bando →
          </a>
        </td></tr>
        <tr><td style="padding:0 32px 22px;">
          <p style="margin:0;font-size:12px;color:#64748b;line-height:1.55;">
            Sulla pagina troverai: <strong>il link al bando ufficiale</strong>, <strong>posteggi privati in ${reg} subito disponibili</strong> (per chi non vuole aspettare un bando), e il <strong>valutatore gratuito</strong> se stai cedendo un posteggio.
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px 32px;border-top:1px solid #f1f5f9;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.6;">
            <a href="${escapeHTML(unsubUrl)}" style="color:#64748b;text-decoration:underline;">Annulla iscrizione</a> · <a href="${SITE_URL}" style="color:#64748b;text-decoration:underline;">Subingresso.it</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('t') || '';
    const action = url.searchParams.get('a') || '';

    if (!token || !['approve', 'reject'].includes(action)) {
      return new Response(confirmPage('Link non valido', 'Il link mancante o malformato.', 'red'),
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    const admin = createClient(SUPABASE_URL, SB_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Trova il record per il token (approve o reject)
    const col = action === 'approve' ? 'approve_token' : 'reject_token';
    const { data: row, error } = await admin
      .from('bando_scouting_log')
      .select('id, regione, titolo, link, ai_summary, status, sent_count')
      .eq(col, token)
      .maybeSingle();

    if (error || !row) {
      return new Response(confirmPage('Bando non trovato', 'Forse il link è già stato usato o è invalido.', 'gray'),
        { status: 404, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // Idempotenza: se già processato, mostra stato attuale
    if (row.status !== 'pending') {
      const titleMap: Record<string,string> = {
        sent: 'Già inviato',
        approved: 'Già approvato (invio in corso)',
        rejected: 'Già scartato',
        failed: 'Invio precedente fallito',
      };
      const msgMap: Record<string,string> = {
        sent: `Email inviata a ${row.sent_count} iscritti il giorno precedente.`,
        approved: 'Approvazione registrata, ma il broadcast non è ancora partito. Riprova dalla dashboard.',
        rejected: 'Hai già scartato questo bando.',
        failed: 'Il primo tentativo è andato male, riprova dalla dashboard.',
      };
      return new Response(confirmPage(titleMap[row.status] || 'Stato sconosciuto', msgMap[row.status] || '', 'gray'),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // ── REJECT ────────────────────────────────────────────
    if (action === 'reject') {
      await admin.from('bando_scouting_log').update({
        status: 'rejected', reviewed_at: new Date().toISOString(),
      }).eq('id', row.id);
      return new Response(confirmPage('Scartato', `Il bando "${row.titolo}" non sarà inviato agli iscritti.`, 'red'),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    // ── APPROVE: genera slug + marca approved + crea landing page + manda broadcast ──
    const baseSlug = makeSlug(row.titolo, row.regione);
    const finalSlug = await ensureUniqueSlug(admin, baseSlug, row.id);

    await admin.from('bando_scouting_log').update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      published_slug: finalSlug,
      published_at: new Date().toISOString(),
    }).eq('id', row.id);

    const landingUrl = `${SITE_URL}/bandi/${finalSlug}`;

    // Carica iscritti della regione
    const { data: subs } = await admin
      .from('bando_alerts')
      .select('id, email, unsub_token')
      .eq('regione', row.regione);

    if (!subs || subs.length === 0) {
      await admin.from('bando_scouting_log').update({
        status: 'sent', sent_at: new Date().toISOString(), sent_count: 0,
      }).eq('id', row.id);
      return new Response(confirmPage('Nessun iscritto', `Nessuno è iscritto agli avvisi per ${row.regione}. Bando approvato ma non inviato.`, 'gray'),
        { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }

    let sent = 0, failed = 0;
    for (const sub of subs) {
      const unsubUrl = `${SITE_URL}/unsubscribe?t=${encodeURIComponent(sub.unsub_token)}&type=bando_alert`;
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: sub.email,
            subject: `📢 Nuovo bando in ${row.regione}: ${row.titolo}`,
            html: bandoEmailHtml(row, unsubUrl, landingUrl),
          }),
        });
        if (!res.ok) throw new Error(`Resend ${res.status}`);
        sent++;
      } catch (e) {
        console.error('resend failed', sub.email, e);
        failed++;
      }
    }

    await admin.from('bando_scouting_log').update({
      status: failed === subs.length ? 'failed' : 'sent',
      sent_at: new Date().toISOString(),
      sent_count: sent,
    }).eq('id', row.id);

    await admin.from('bando_alerts')
      .update({ last_bando_digest_sent_at: new Date().toISOString() })
      .in('id', subs.map(s => s.id));

    return new Response(
      confirmPage('Inviato!', `Bando inviato a ${sent} iscritti di ${row.regione}${failed > 0 ? ` (${failed} falliti)` : ''}.`, 'green'),
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (err) {
    console.error('bando-action error:', err);
    return new Response(confirmPage('Errore', 'Qualcosa è andato storto. Riprova dalla dashboard.', 'red'),
      { status: 500, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }
});
