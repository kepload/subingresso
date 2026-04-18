// ============================================================
//  Subingresso.it — Edge Function: notifica email al venditore
//  Trigger 1: INSERT su annunci → email "ricevuto, in verifica"
//  Trigger 2: UPDATE su annunci (status → active) → email "online!"
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FROM_EMAIL                = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                  = 'https://www.subingresso.it';

Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    if (payload.table !== 'annunci') return new Response('Ignored', { status: 200 });

    const record   = payload.record;
    const oldRecord = payload.old_record;

    // Determina il tipo di notifica
    let tipo: 'ricevuto' | 'online' | null = null;

    if (payload.type === 'INSERT') {
      tipo = 'ricevuto';
    } else if (payload.type === 'UPDATE' && record.status === 'active' && oldRecord?.status !== 'active') {
      tipo = 'online';
    }

    if (!tipo) return new Response('Ignored', { status: 200 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Recupera email del venditore
    const { data: { user } } = await supabase.auth.admin.getUserById(record.user_id);
    if (!user?.email) return new Response('No seller email', { status: 200 });

    const titoloSafe  = (record.titolo || 'Il tuo annuncio').replace(/[<>]/g, '');
    const annuncioUrl = `${SITE_URL}/annuncio.html?id=${record.id}`;
    const dashboardUrl = `${SITE_URL}/dashboard.html`;

    let subject: string;
    let bodyHtml: string;

    if (tipo === 'ricevuto') {
      subject = `✅ Annuncio ricevuto — ${titoloSafe}`;
      bodyHtml = `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f1f5f9;">
          <div style="background:#2563eb;padding:28px 32px;">
            <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Subingresso<span style="opacity:.7">.it</span></span>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 6px;color:#10b981;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">✅ Annuncio ricevuto</p>
            <h2 style="margin:0 0 12px;font-size:20px;font-weight:900;color:#0f172a;">${titoloSafe}</h2>
            <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Il tuo annuncio è stato ricevuto con successo ed è attualmente <strong style="color:#f59e0b;">in attesa di approvazione</strong>.<br><br>
              Verificheremo i dettagli e lo pubblicheremo il prima possibile. Riceverai un'altra email non appena sarà online.
            </p>
            <a href="${dashboardUrl}" style="display:inline-block;background:#0f172a;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
              Vai alla Dashboard →
            </a>
          </div>
          <div style="padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              Subingresso.it · La piattaforma italiana per la compravendita di concessioni mercatali<br>
              <a href="${SITE_URL}/privacy.html" style="color:#94a3b8;">Privacy</a> · <a href="${SITE_URL}/termini.html" style="color:#94a3b8;">Termini</a>
            </p>
          </div>
        </div>`;
    } else {
      subject = `🎉 Il tuo annuncio è online — ${titoloSafe}`;
      bodyHtml = `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f1f5f9;">
          <div style="background:#2563eb;padding:28px 32px;">
            <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Subingresso<span style="opacity:.7">.it</span></span>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 6px;color:#2563eb;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">🎉 Annuncio approvato</p>
            <h2 style="margin:0 0 12px;font-size:20px;font-weight:900;color:#0f172a;">${titoloSafe}</h2>
            <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Il tuo annuncio è stato approvato ed è ora <strong style="color:#10b981;">visibile a tutti</strong> su Subingresso.it.<br><br>
              Gli acquirenti interessati potranno contattarti direttamente dalla pagina dell'annuncio.
            </p>
            <a href="${annuncioUrl}" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
              Vedi il tuo annuncio →
            </a>
          </div>
          <div style="padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              Subingresso.it · La piattaforma italiana per la compravendita di concessioni mercatali<br>
              <a href="${SITE_URL}/privacy.html" style="color:#94a3b8;">Privacy</a> · <a href="${SITE_URL}/termini.html" style="color:#94a3b8;">Termini</a>
            </p>
          </div>
        </div>`;
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM_EMAIL, to: user.email, subject, html: bodyHtml }),
    });

    if (!res.ok) {
      console.error('Resend error:', res.status, await res.text());
      return new Response('Email error', { status: 500 });
    }

    console.log(`Email "${tipo}" inviata a ${user.email}`);
    return new Response('OK', { status: 200 });

  } catch (e) {
    console.error('Errore edge function notify-seller:', e);
    return new Response('Internal error', { status: 500 });
  }
});
