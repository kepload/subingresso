// ============================================================
//  Subingresso.it — Edge Function: notifica email nuovo annuncio
//  Trigger: Database Webhook su INSERT nella tabella `annunci`
//  Invia email agli utenti che hanno un alert che matcha
//  regione e/o tipo merce del nuovo annuncio.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY             = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL               = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FROM_EMAIL                 = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                   = 'https://www.subingresso.it';

Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    // Accetta solo INSERT su annunci
    if (payload.type !== 'INSERT' || payload.table !== 'annunci') {
      return new Response('Ignored', { status: 200 });
    }

    const annuncio = payload.record as {
      id: string;
      titolo: string;
      prezzo: number;
      regione: string;
      tipo: string;
      status: string;
      user_id: string;
    };

    // Processa solo annunci attivi
    if (annuncio.status !== 'active') {
      return new Response('Not active', { status: 200 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Trova tutti gli alert che matchano regione e/o tipo
    //    Un alert matcha se: (regione vuota O regione uguale) E (tipo vuoto O tipo uguale)
    const { data: alerts } = await supabase
      .from('alerts')
      .select('user_id, regione, tipo')
      .neq('user_id', annuncio.user_id); // non notificare il venditore stesso

    if (!alerts || alerts.length === 0) {
      return new Response('No alerts', { status: 200 });
    }

    const matchingAlerts = alerts.filter(a => {
      const regioneMatch = !a.regione || a.regione === annuncio.regione;
      const tipoMatch    = !a.tipo    || a.tipo    === annuncio.tipo;
      return regioneMatch && tipoMatch;
    });

    if (matchingAlerts.length === 0) {
      return new Response('No matching alerts', { status: 200 });
    }

    // 2. Deduplica user_id (un utente può avere più alert)
    const uniqueUserIds = [...new Set(matchingAlerts.map(a => a.user_id))];

    // 3. Recupera le email degli utenti
    const emailPromises = uniqueUserIds.map(uid =>
      supabase.auth.admin.getUserById(uid)
    );
    const usersResults = await Promise.all(emailPromises);

    const prezzoStr = annuncio.prezzo
      ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(annuncio.prezzo)
      : 'Trattativa privata';

    const annuncioUrl = `${SITE_URL}/annuncio.html?id=${annuncio.id}`;
    const titoloSafe  = (annuncio.titolo || 'Nuovo annuncio').replace(/[<>]/g, '');
    const regioneStr  = annuncio.regione || 'Italia';
    const tipoStr     = annuncio.tipo    || '';

    // 4. Invia email a ciascun utente
    const sendResults = await Promise.all(
      usersResults.map(async ({ data }) => {
        const email = data?.user?.email;
        if (!email) return null;

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to:   email,
            subject: `🔔 Nuovo annuncio per il tuo alert — ${titoloSafe}`,
            html: `
              <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f1f5f9;">
                <div style="background:#2563eb;padding:28px 32px;">
                  <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Subingresso<span style="opacity:.7">.it</span></span>
                </div>
                <div style="padding:32px;">
                  <p style="margin:0 0 6px;color:#2563eb;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">🔔 Il tuo alert ha trovato qualcosa</p>
                  <h2 style="margin:0 0 20px;font-size:20px;font-weight:900;color:#0f172a;">${titoloSafe}</h2>

                  <div style="background:#f8fafc;border-radius:12px;padding:20px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                      <tr>
                        <td style="color:#64748b;font-size:13px;padding:4px 0;">Zona</td>
                        <td style="color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${regioneStr}</td>
                      </tr>
                      ${tipoStr ? `<tr>
                        <td style="color:#64748b;font-size:13px;padding:4px 0;">Categoria</td>
                        <td style="color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${tipoStr}</td>
                      </tr>` : ''}
                      <tr>
                        <td style="color:#64748b;font-size:13px;padding:4px 0;">Prezzo</td>
                        <td style="color:#2563eb;font-size:16px;font-weight:900;text-align:right;">${prezzoStr}</td>
                      </tr>
                    </table>
                  </div>

                  <a href="${annuncioUrl}"
                     style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
                    Vedi annuncio →
                  </a>
                </div>
                <div style="padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;">
                  <p style="margin:0;color:#94a3b8;font-size:12px;">
                    Hai ricevuto questa email perché hai attivato un alert su Subingresso.it.<br>
                    <a href="${SITE_URL}/annunci.html" style="color:#94a3b8;">Gestisci i tuoi alert</a> ·
                    <a href="${SITE_URL}/privacy.html" style="color:#94a3b8;">Privacy</a>
                  </p>
                </div>
              </div>
            `,
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          console.error(`Resend error per ${email}:`, res.status, err);
          return null;
        }

        console.log(`Email alert inviata a ${email} per annuncio ${annuncio.id}`);
        return email;
      })
    );

    const sent = sendResults.filter(Boolean).length;
    return new Response(`OK — ${sent} email inviate`, { status: 200 });

  } catch (e) {
    console.error('Errore edge function notify-alert:', e);
    return new Response('Internal error', { status: 500 });
  }
});
