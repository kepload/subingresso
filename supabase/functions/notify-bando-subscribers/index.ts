// ============================================================
//  Subingresso.it — Edge Function: notify-bando-subscribers
//  Trigger: AFTER INSERT/UPDATE su public.annunci.
//  Quando un annuncio diventa active e fresco (<24h), notifica via
//  email TUTTI gli iscritti `bando_alerts` con `regione` matchante.
//  Niente IP/UA/fingerprint nel log: dedup via PK (alert_id, annuncio_id).
//  Internal-only: richiede Bearer SB_SECRET_KEY (chiamato dal trigger DB).
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SB_SECRET_KEY             = Deno.env.get('SB_SECRET_KEY') ?? SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL                = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                  = 'https://subingresso.it';
const MAX_AGE_HOURS             = 24;

function escapeHTML(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPriceHtml(prezzo: number | null, stato: string): string {
  if (!prezzo || prezzo <= 0) return '';
  const s = Number(prezzo).toLocaleString('it-IT');
  return stato === 'Affitto mensile' ? `€ ${s} /anno` : `€ ${s}`;
}

function listingEmailHtml(a: any, regione: string, unsubUrl: string, listingUrl: string): string {
  const titolo  = escapeHTML(a.titolo || 'Nuovo posteggio disponibile');
  const comune  = escapeHTML(a.comune || '');
  const reg     = escapeHTML(regione);
  const stato   = escapeHTML(a.stato || '');
  const tipo    = escapeHTML(a.tipo || '');
  const prezzo  = escapeHTML(formatPriceHtml(a.prezzo, a.stato));
  const cover   = (Array.isArray(a.img_urls) && a.img_urls[0]) ? a.img_urls[0] :
                  (a.dettagli_extra && a.dettagli_extra.images && a.dettagli_extra.images[0]) || null;
  const imgTag  = cover
    ? `<img src="${escapeHTML(cover)}" alt="" style="width:100%;height:200px;object-fit:cover;border-radius:12px;display:block;margin-bottom:14px;">`
    : '';

  return `<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td style="padding:28px 32px 8px;">
          <span style="display:inline-block;background:#dbeafe;color:#1e40af;font-size:11px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;padding:4px 10px;border-radius:6px;">Nuovo posteggio in ${reg}</span>
          <h1 style="margin:14px 0 6px;font-size:20px;font-weight:900;color:#0f172a;line-height:1.3;">${titolo}</h1>
          <p style="margin:0 0 14px;font-size:13px;color:#64748b;font-weight:600;">${comune ? comune + ' · ' : ''}${stato}${tipo ? ' · ' + tipo : ''}${prezzo ? ' · <strong style="color:#0f172a;">' + prezzo + '</strong>' : ''}</p>
        </td></tr>
        ${imgTag ? `<tr><td style="padding:0 32px 0;">${imgTag}</td></tr>` : ''}
        <tr><td style="padding:8px 32px 24px;" align="center">
          <a href="${escapeHTML(listingUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:12px 28px;border-radius:10px;">
            Vedi annuncio →
          </a>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <p style="margin:0;font-size:12px;color:#64748b;line-height:1.55;">
            Ricevi questa email perche' ti sei iscritto agli avvisi per <strong>${reg}</strong>: ti scriviamo sia quando esce un nuovo annuncio privato sia quando esce un nuovo bando pubblico.
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
    const auth = req.headers.get('authorization') || '';
    if (auth !== `Bearer ${SB_SECRET_KEY}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const payload = await req.json().catch(() => null);
    if (!payload) return new Response('Bad request', { status: 400 });

    const op   = String(payload.type || '').toUpperCase();
    const rec  = (payload.record || {}) as Record<string, any>;
    const old  = (payload.old_record || null) as Record<string, any> | null;

    // Solo INSERT con status active OPPURE UPDATE da non-active a active.
    const becameActive = (op === 'INSERT' && rec.status === 'active') ||
                         (op === 'UPDATE' && rec.status === 'active' && (old?.status ?? '') !== 'active');
    if (!becameActive) return new Response(JSON.stringify({ skipped: 'not_active_transition' }), { status: 200 });

    // Annuncio fresco: max 24h dalla creazione.
    if (rec.created_at) {
      const ageMs = Date.now() - new Date(rec.created_at).getTime();
      if (ageMs > MAX_AGE_HOURS * 3600 * 1000) {
        return new Response(JSON.stringify({ skipped: 'too_old' }), { status: 200 });
      }
    }

    if (!rec.regione || !rec.id) {
      return new Response(JSON.stringify({ skipped: 'missing_fields' }), { status: 200 });
    }

    const admin = createClient(SUPABASE_URL, SB_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Subscribers per la regione dell'annuncio.
    const { data: subs, error: subsErr } = await admin
      .from('bando_alerts')
      .select('id, email, unsub_token, regione')
      .eq('regione', rec.regione);
    if (subsErr) {
      console.error('select bando_alerts failed:', subsErr);
      return new Response(JSON.stringify({ error: 'subs_query' }), { status: 500 });
    }
    if (!subs || subs.length === 0) {
      return new Response(JSON.stringify({ sent: 0, regione: rec.regione }), { status: 200 });
    }

    // Filtra subscribers gia' notificati per questo annuncio.
    const { data: alreadySent } = await admin
      .from('bando_alert_log')
      .select('alert_id')
      .eq('annuncio_id', rec.id)
      .in('alert_id', subs.map(s => s.id));
    const alreadySentSet = new Set((alreadySent || []).map(x => x.alert_id));
    const targets = subs.filter(s => !alreadySentSet.has(s.id));

    if (!targets.length) {
      return new Response(JSON.stringify({ sent: 0, regione: rec.regione, all_already_sent: true }), { status: 200 });
    }

    const listingUrl = `${SITE_URL}/annuncio?id=${encodeURIComponent(rec.id)}`;
    let sent = 0;
    let failed = 0;

    for (const sub of targets) {
      const unsubUrl = `${SITE_URL}/unsubscribe?t=${encodeURIComponent(sub.unsub_token)}&type=bando_alert`;

      // Pre-INSERT log (rollback se fail Resend) — pattern identico a notify-alert.
      const { error: logErr } = await admin
        .from('bando_alert_log')
        .insert({ alert_id: sub.id, annuncio_id: rec.id });
      if (logErr) {
        // Conflict (gia' inviato in race) → skip
        continue;
      }

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            from:    FROM_EMAIL,
            to:      sub.email,
            subject: `Nuovo posteggio in ${rec.regione}: ${rec.titolo || 'disponibile ora'}`,
            html:    listingEmailHtml(rec, rec.regione, unsubUrl, listingUrl),
          }),
        });
        if (!res.ok) throw new Error(`Resend ${res.status}`);
        sent++;
      } catch (e) {
        console.error('resend failed for', sub.email, e);
        failed++;
        // Rollback log (cosi' la prossima passata puo' riprovare).
        await admin
          .from('bando_alert_log')
          .delete()
          .eq('alert_id', sub.id)
          .eq('annuncio_id', rec.id);
      }
    }

    // Bump last_listing_sent_at sui subscribers che hanno ricevuto.
    if (sent > 0) {
      const sentIds = targets.slice(0, targets.length).map(t => t.id);
      await admin
        .from('bando_alerts')
        .update({ last_listing_sent_at: new Date().toISOString() })
        .in('id', sentIds);
    }

    return new Response(JSON.stringify({ sent, failed, regione: rec.regione }), { status: 200 });
  } catch (err) {
    console.error('notify-bando-subscribers error:', err);
    return new Response(JSON.stringify({ error: 'server' }), { status: 500 });
  }
});
