// ============================================================
//  Subingresso.it — Edge Function: welcome-email
//  Inviata UNA volta dopo la registrazione (chiamata fire-and-forget
//  da register-bypass). Due CTA: pubblica annuncio / cerca posteggi.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FROM_EMAIL                = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                  = 'https://subingresso.it';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const auth = req.headers.get('authorization') || '';
    if (auth !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const body = await req.json().catch(() => null);
    if (!body) return json({ error: 'Body mancante' }, 400);

    const { user_id } = body;
    if (!user_id) return json({ error: 'user_id obbligatorio' }, 400);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData, error: userErr } = await supabase.auth.admin.getUserById(user_id);
    if (userErr || !userData?.user?.email) {
      console.error('welcome-email: utente non trovato', userErr);
      return json({ error: 'Utente non trovato' }, 404);
    }

    const email = userData.user.email;
    const meta  = userData.user.user_metadata || {};
    const nome  = String(meta.nome || '').trim();

    // Recupera unsub_token per link disiscrizione (best effort)
    let unsubToken = '';
    try {
      const { data: prof } = await supabase
        .from('profiles')
        .select('unsub_token')
        .eq('id', user_id)
        .maybeSingle();
      unsubToken = prof?.unsub_token || '';
    } catch (_) {}

    const greeting = nome ? `Ciao ${escapeHtml(nome)},` : 'Ciao,';
    const subject  = '👋 Benvenuto su Subingresso.it';
    const vendiUrl    = `${SITE_URL}/vendi.html`;
    const annunciUrl  = `${SITE_URL}/annunci.html`;
    const dashboardUrl = `${SITE_URL}/dashboard.html`;
    const unsubUrl = unsubToken
      ? `${SITE_URL}/unsubscribe.html?t=${unsubToken}&type=all`
      : `${SITE_URL}/contatti.html`;

    const html = `
      <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f1f5f9;">
        <div style="background:#2563eb;padding:32px;">
          <span style="color:#fff;font-size:24px;font-weight:900;letter-spacing:-0.5px;">Subingresso<span style="opacity:.7">.it</span></span>
        </div>
        <div style="padding:36px 32px 28px;">
          <p style="margin:0 0 6px;color:#2563eb;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">👋 Benvenuto</p>
          <h2 style="margin:0 0 14px;font-size:24px;font-weight:900;color:#0f172a;line-height:1.25;">${greeting}<br>grazie di esserti registrato.</h2>
          <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 28px;">
            Subingresso.it è il primo portale italiano dedicato alla
            <strong style="color:#0f172a;">compravendita di concessioni mercatali e posteggi ambulanti</strong>.
            Da qui puoi pubblicare la tua attività in pochi minuti oppure cercare un posteggio nella tua zona.
          </p>

          <!-- CTA 1: Vendi -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:22px 22px;margin:0 0 14px;">
            <p style="margin:0 0 4px;color:#10b981;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;">🛒 Hai un'attività da cedere?</p>
            <h3 style="margin:0 0 8px;font-size:17px;font-weight:900;color:#0f172a;">Pubblica il tuo annuncio gratis</h3>
            <p style="margin:0 0 14px;color:#64748b;font-size:13px;line-height:1.5;">
              Bastano 2 minuti. Riceverai i contatti degli interessati direttamente sulla tua email — niente intermediari.
            </p>
            <a href="${vendiUrl}" style="display:inline-block;background:#10b981;color:#fff;padding:12px 22px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px;">
              Pubblica annuncio →
            </a>
          </div>

          <!-- CTA 2: Compra -->
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:22px 22px;margin:0 0 28px;">
            <p style="margin:0 0 4px;color:#2563eb;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.5px;">🔍 Stai cercando un posteggio?</p>
            <h3 style="margin:0 0 8px;font-size:17px;font-weight:900;color:#0f172a;">Trova quello giusto per te</h3>
            <p style="margin:0 0 14px;color:#64748b;font-size:13px;line-height:1.5;">
              Sfoglia gli annunci attivi oppure attiva un alert: ti avvertiamo via email appena viene pubblicato un posteggio nella tua zona.
            </p>
            <a href="${annunciUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:12px 22px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px;">
              Esplora gli annunci →
            </a>
          </div>

          <!-- Come funziona -->
          <div style="border-top:1px solid #f1f5f9;padding-top:24px;">
            <p style="margin:0 0 14px;color:#0f172a;font-size:14px;font-weight:800;">Come funziona, in 3 passi:</p>
            <table style="width:100%;border-collapse:collapse;" cellspacing="0" cellpadding="0">
              <tr>
                <td style="vertical-align:top;width:32px;padding:0 0 12px;"><span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background:#2563eb;color:#fff;border-radius:50%;font-size:12px;font-weight:800;">1</span></td>
                <td style="vertical-align:top;padding:0 0 12px;color:#475569;font-size:13px;line-height:1.5;">Pubblichi (o trovi) un annuncio gratis.</td>
              </tr>
              <tr>
                <td style="vertical-align:top;width:32px;padding:0 0 12px;"><span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background:#2563eb;color:#fff;border-radius:50%;font-size:12px;font-weight:800;">2</span></td>
                <td style="vertical-align:top;padding:0 0 12px;color:#475569;font-size:13px;line-height:1.5;">Le parti si contattano direttamente, senza intermediari.</td>
              </tr>
              <tr>
                <td style="vertical-align:top;width:32px;padding:0;"><span style="display:inline-block;width:24px;height:24px;line-height:24px;text-align:center;background:#2563eb;color:#fff;border-radius:50%;font-size:12px;font-weight:800;">3</span></td>
                <td style="vertical-align:top;padding:0;color:#475569;font-size:13px;line-height:1.5;">Il subingresso si chiude in Comune, con la documentazione richiesta.</td>
              </tr>
            </table>
          </div>

          <p style="margin:28px 0 0;color:#64748b;font-size:13px;line-height:1.6;">
            Se hai dubbi, scrivici: rispondiamo tutti i giorni.<br>
            Da <a href="${dashboardUrl}" style="color:#2563eb;font-weight:600;text-decoration:none;">la tua dashboard</a> puoi gestire annunci, preferiti e alert.
          </p>
        </div>
        <div style="padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;background:#fafbfc;">
          <p style="margin:0 0 6px;color:#94a3b8;font-size:12px;">
            Subingresso.it · La piattaforma italiana per la compravendita di concessioni mercatali
          </p>
          <p style="margin:0;color:#94a3b8;font-size:11px;">
            <a href="${SITE_URL}/privacy.html" style="color:#94a3b8;">Privacy</a> ·
            <a href="${SITE_URL}/termini.html" style="color:#94a3b8;">Termini</a> ·
            <a href="${unsubUrl}" style="color:#94a3b8;">Disiscriviti</a>
          </p>
        </div>
      </div>`;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: email, subject, html }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('welcome-email Resend error:', res.status, errBody);
      return json({ error: 'Email error' }, 500);
    }

    console.log(`welcome-email inviata a ${email}`);
    return json({ ok: true });

  } catch (e) {
    console.error('welcome-email error:', e);
    return json({ error: 'Errore interno' }, 500);
  }
});

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  } as Record<string, string>)[c] || c);
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
