// ============================================================
//  Subingresso.it — Edge Function: subscribe-bando-alert
//  Lead magnet pubblico. L'iscrizione vale per BANDI + ANNUNCI
//  della stessa regione (bundle obbligatorio).
//  Single opt-in: l'iscrizione e' immediata, l'email welcome ha
//  link "annulla in 1 click" come safety GDPR.
//  Anti-bot: honeypot, time-on-form, temp-mail blacklist,
//  pattern probe scanner. (Stesso set di register-bypass.)
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SB_SECRET_KEY             = Deno.env.get('SB_SECRET_KEY') ?? SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY')!;
const FROM_EMAIL                = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                  = 'https://subingresso.it';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_REGIONI = new Set([
  'Lombardia','Piemonte','Lazio','Veneto','Emilia-Romagna','Toscana','Campania','Puglia',
  'Sicilia','Liguria','Marche','Trentino-Alto Adige','Sardegna','Friuli-Venezia Giulia',
  "Valle d'Aosta",'Umbria','Abruzzo','Molise','Basilicata','Calabria',
]);

const TEMP_MAIL_DOMAINS = new Set([
  'mailinator.com','tempmail.com','temp-mail.org','temp-mail.io','10minutemail.com',
  'guerrillamail.com','guerrillamail.info','guerrillamail.biz','guerrillamail.de',
  'sharklasers.com','yopmail.com','throwawaymail.com','getnada.com','maildrop.cc',
  'mintemail.com','mohmal.com','fakeinbox.com','trashmail.com','dispostable.com',
  'mailnesia.com','mytrashmail.com','mailcatch.com','spamgourmet.com','tempr.email',
  'inboxbear.com','emailondeck.com','mail-temp.com','mailtemp.info','tempmailo.com',
  'tempmailaddress.com','discard.email','mailpoof.com','snapmail.cc','tmpmail.org',
  'tmpmail.net','temp-inbox.com','tempmail.plus','cs.email','burnermail.io',
]);

function escapeHTML(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...CORS, 'Content-Type': 'application/json' },
    status,
  });
}

function welcomeEmailHtml(regione: string, unsubUrl: string, annunciUrl: string): string {
  const reg = escapeHTML(regione);
  return `<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td style="padding:32px 32px 16px;">
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:900;color:#0f172a;">Avvisi attivi per ${reg} ✓</h1>
          <p style="margin:0;font-size:15px;line-height:1.55;color:#475569;">
            D'ora in poi ti scriviamo quando esce qualcosa di interessante in <strong>${reg}</strong>.
          </p>
        </td></tr>
        <tr><td style="padding:0 32px 8px;">
          <div style="background:#eff6ff;border:1px solid #dbeafe;border-radius:12px;padding:16px 18px;margin:8px 0 16px;">
            <p style="margin:0 0 6px;font-size:13px;font-weight:800;color:#1e40af;">Cosa riceverai</p>
            <ul style="margin:0;padding-left:20px;font-size:13px;line-height:1.6;color:#334155;">
              <li><strong>Bandi pubblici nuovi</strong> in ${reg} (Comuni, scadenze, link ufficiali)</li>
              <li><strong>Annunci di posteggi privati</strong> appena disponibili nella stessa regione</li>
            </ul>
          </div>
          <p style="margin:0 0 8px;font-size:13px;color:#64748b;">
            Tipicamente ricevi al massimo 1 email a settimana, spesso meno. <strong>Niente spam</strong> e nessuna mail commerciale di terzi.
          </p>
        </td></tr>
        <tr><td style="padding:8px 32px 24px;" align="center">
          <a href="${escapeHTML(annunciUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:14px;padding:12px 28px;border-radius:10px;">
            Intanto: posteggi disponibili in ${reg} →
          </a>
        </td></tr>
        <tr><td style="padding:16px 32px 32px;border-top:1px solid #f1f5f9;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.6;">
            Ricevi questa email perché ti sei iscritto agli avvisi per ${reg} su Subingresso.it.<br>
            <a href="${escapeHTML(unsubUrl)}" style="color:#64748b;text-decoration:underline;">Annulla iscrizione</a> · <a href="${SITE_URL}" style="color:#64748b;text-decoration:underline;">Subingresso.it</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST')    return json({ error: 'Method not allowed' }, 405);

  try {
    const body = await req.json().catch(() => null);
    if (!body) return json({ error: 'Body mancante' }, 400);

    const { email, regione, source, website, ts_form_started } = body as Record<string, unknown>;

    // ── Honeypot: campo "website" pieno = bot. Finto 200 (non rivelo la trappola). ──
    if (typeof website === 'string' && website.trim().length > 0) {
      return json({ success: true, already_subscribed: false });
    }

    // ── Time-on-form: < 2.5s = bot. Finto 200. ──
    if (typeof ts_form_started === 'number' && Number.isFinite(ts_form_started)) {
      const dt = Date.now() - ts_form_started;
      if (dt >= 0 && dt < 2500) {
        return json({ success: true, already_subscribed: false });
      }
    }

    const cleanEmail   = String(email   || '').trim().toLowerCase();
    const cleanRegione = String(regione || '').trim();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 200) {
      return json({ error: 'Email non valida' }, 400);
    }
    const domain = cleanEmail.split('@')[1] || '';
    if (TEMP_MAIL_DOMAINS.has(domain)) return json({ error: 'Email non valida' }, 400);
    if (/^[a-z]+_\d{9,}@/i.test(cleanEmail) || /\.(invalid|test|local|example)$/i.test(domain)) {
      return json({ error: 'Email non valida' }, 400);
    }

    if (!VALID_REGIONI.has(cleanRegione)) {
      return json({ error: 'Regione non valida' }, 400);
    }

    const cleanSource = typeof source === 'string' ? source.slice(0, 120) : null;

    const admin = createClient(SUPABASE_URL, SB_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Idempotenza: se gia' iscritto a (email, regione) niente errore, niente doppia welcome.
    const { data: existing } = await admin
      .from('bando_alerts')
      .select('id, unsub_token')
      .eq('email', cleanEmail)
      .eq('regione', cleanRegione)
      .maybeSingle();

    let alertId: string;
    let unsubToken: string;
    let alreadySubscribed = false;

    if (existing) {
      alertId = existing.id as string;
      unsubToken = existing.unsub_token as string;
      alreadySubscribed = true;
    } else {
      const { data: ins, error: insErr } = await admin
        .from('bando_alerts')
        .insert({ email: cleanEmail, regione: cleanRegione, source: cleanSource })
        .select('id, unsub_token')
        .single();
      if (insErr || !ins) {
        console.error('insert bando_alerts failed:', insErr);
        return json({ error: 'Errore iscrizione' }, 500);
      }
      alertId = ins.id as string;
      unsubToken = ins.unsub_token as string;
    }

    // Email welcome solo per nuove iscrizioni (no double-send se reiscrive).
    if (!alreadySubscribed) {
      const unsubUrl   = `${SITE_URL}/unsubscribe?t=${encodeURIComponent(unsubToken)}&type=bando_alert`;
      const annunciUrl = `${SITE_URL}/annunci?regione=${encodeURIComponent(cleanRegione)}`;
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type':  'application/json',
          },
          body: JSON.stringify({
            from:    FROM_EMAIL,
            to:      cleanEmail,
            subject: `Avvisi attivi per posteggi e bandi in ${cleanRegione}`,
            html:    welcomeEmailHtml(cleanRegione, unsubUrl, annunciUrl),
          }),
        });
      } catch (e) {
        console.error('resend welcome failed:', e);
        // fire-and-forget: l'iscrizione resta salvata, l'utente puo' annullare via prima email vera
      }
    }

    return json({ success: true, already_subscribed: alreadySubscribed, alert_id: alertId });
  } catch (err) {
    console.error('subscribe-bando-alert error:', err);
    return json({ error: 'Errore server' }, 500);
  }
});
