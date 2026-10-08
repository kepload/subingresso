// ============================================================
//  Subingresso.it — Edge Function: notifica email nuovo annuncio
//  Trigger: Database Webhook su INSERT/UPDATE nella tabella `annunci`
//  Rispetta località, raggio, regione e tipo salvati nell'avviso.
//  Controlli anti-spam:
//   1. Solo INSERT active OPPURE UPDATE pending→active (strict)
//   2. Annuncio deve essere fresco (created_at > ora - 24h)
//   3. Dedup via tabella notify_alert_log (UNIQUE user_id+annuncio_id)
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY             = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL               = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SB_SECRET_KEY              = Deno.env.get('SB_SECRET_KEY') ?? SUPABASE_SERVICE_ROLE_KEY;
const FROM_EMAIL                 = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                   = 'https://subingresso.it';
const MAX_AGE_HOURS              = 24;

function escapeHTML(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

Deno.serve(async (req) => {
  try {
    const auth = req.headers.get('authorization') || '';
    if (auth !== `Bearer ${SB_SECRET_KEY}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const payload = await req.json();

    if (payload.table !== 'annunci') {
      return new Response('Ignored (wrong table)', { status: 200 });
    }

    const annuncio = payload.record as {
      id: string;
      titolo: string;
      prezzo: number;
      tipo: string;
      merce: string;
      superficie: number;
      regione: string;
      comune: string;
      status: string;
      user_id: string;
      created_at: string;
    };

    // Log diagnostico COMPLETO (visibile in Supabase → Logs)
    // Cattura tutto il payload per debug se ancora arrivano falsi positivi
    console.log(JSON.stringify({
      event: 'notify-alert:received',
      type: payload.type,
      annuncio_id: annuncio?.id,
      titolo: annuncio?.titolo,
      new_status: annuncio?.status,
      created_at: annuncio?.created_at,
      age_hours: annuncio?.created_at
        ? ((Date.now() - new Date(annuncio.created_at).getTime()) / 3600000).toFixed(2)
        : null,
    }));

    // ── CONTROLLO 1: status active + annuncio fresco ──
    // Qualunque evento (INSERT o UPDATE) su un annuncio active e fresco (<24h)
    // può inviare email. Il dedup log (CONTROLLO 3) previene email doppie,
    // quindi non serve dipendere da old_record (che Supabase non sempre include).
    if (annuncio.status !== 'active') {
      console.log(JSON.stringify({
        event: 'notify-alert:skipped',
        reason: 'status non active',
        type: payload.type,
        new_status: annuncio.status,
      }));
      return new Response('Not active', { status: 200 });
    }

    // ── CONTROLLO 2: freschezza annuncio ──
    // Se l'annuncio ha più di MAX_AGE_HOURS, non è "nuova opportunità"
    // ma una riattivazione/refresh → skip
    if (annuncio.created_at) {
      const ageMs = Date.now() - new Date(annuncio.created_at).getTime();
      const ageHours = ageMs / (1000 * 60 * 60);
      if (ageHours > MAX_AGE_HOURS) {
        console.log(`notify-alert:skipped (annuncio troppo vecchio: ${ageHours.toFixed(1)}h)`);
        return new Response('Listing too old', { status: 200 });
      }
    }

    const supabase = createClient(SUPABASE_URL, SB_SECRET_KEY);

    // Tutti gli alert tranne quello del venditore stesso
    const { data: alerts, error: matchError } = await supabase.rpc('matching_listing_alerts', {p_listing_id:annuncio.id});
    if (matchError) throw new Error('Matching geografico non disponibile');

    if (!alerts || alerts.length === 0) {
      return new Response('No alerts', { status: 200 });
    }

    const matchingAlerts = new Map<string, typeof alerts[0]>();

    for (const a of alerts) {
      if (matchingAlerts.has(a.user_id)) continue;
      matchingAlerts.set(a.user_id, a);
    }

    if (matchingAlerts.size === 0) {
      return new Response('No matching alerts', { status: 200 });
    }

    const prezzoStr = annuncio.prezzo
      ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(annuncio.prezzo)
      : 'Trattativa privata';

    const annuncioUrl = `${SITE_URL}/annuncio?id=${annuncio.id}`;
    const titoloRaw   = annuncio.titolo || 'Nuovo annuncio';
    const titoloSafe  = escapeHTML(titoloRaw);
    const luogoStr    = escapeHTML(annuncio.comune || annuncio.regione || 'Italia');
    const tipoSafe    = escapeHTML(annuncio.tipo   || '');
    const merceSafe   = escapeHTML(annuncio.merce  || '');
    const dettagliRows = [
      tipoSafe  ? `<tr><td style="color:#64748b;font-size:13px;padding:4px 0;">Tipo</td><td style="color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${tipoSafe}</td></tr>` : '',
      merceSafe ? `<tr><td style="color:#64748b;font-size:13px;padding:4px 0;">Settore</td><td style="color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${merceSafe}</td></tr>` : '',
    ].join('');

    const candidateUids = [...matchingAlerts.keys()];

    // ── CONTROLLO 3: dedup via notify_alert_log ──
    // INSERT con ON CONFLICT DO NOTHING e returning: se la riga esiste già,
    // non torna niente → skip quell'utente per questo annuncio
    const { data: inserted, error: logErr } = await supabase
      .from('notify_alert_log')
      .upsert(
        candidateUids.map(uid => ({ user_id: uid, annuncio_id: annuncio.id })),
        { onConflict: 'user_id,annuncio_id', ignoreDuplicates: true }
      )
      .select('user_id');

    if (logErr) {
      console.error('notify-alert:log error', logErr);
      return new Response('Log error', { status: 500 });
    }

    const freshUids = new Set((inserted ?? []).map(r => r.user_id));
    if (freshUids.size === 0) {
      console.log('notify-alert:skipped (tutti gli utenti hanno già ricevuto email per questo annuncio)');
      return new Response('All already notified', { status: 200 });
    }

    const freshUidList = candidateUids.filter(uid => freshUids.has(uid));
    const userFetches = freshUidList.map(uid => supabase.auth.admin.getUserById(uid));
    const usersResults = await Promise.all(userFetches);

    let sent = 0;
    await Promise.all(
      usersResults.map(async ({ data }, idx) => {
        const email = data?.user?.email;
        if (!email) return;

        const uid = freshUidList[idx];
        const alert = matchingAlerts.get(uid)!;
        const searchParams = new URLSearchParams();
        if (alert.comune) searchParams.set('q', alert.comune);
        else if (annuncio.regione) searchParams.set('regione', annuncio.regione);
        const cercaUrl = `${SITE_URL}/annunci.html?${searchParams.toString()}`;

        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to:   email,
            subject: `🔔 Nuova piazza disponibile vicino a te — ${titoloRaw}`,
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
                        <td style="color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${luogoStr}</td>
                      </tr>
                      ${dettagliRows}
                      <tr>
                        <td style="color:#64748b;font-size:13px;padding:4px 0;">Prezzo</td>
                        <td style="color:#2563eb;font-size:16px;font-weight:900;text-align:right;">${prezzoStr}</td>
                      </tr>
                    </table>
                  </div>
                  <a href="${annuncioUrl}"
                     style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;margin-bottom:12px;">
                    Vedi questo annuncio →
                  </a>
                  <br>
                  <a href="${cercaUrl}"
                     style="display:inline-block;color:#2563eb;padding:10px 0;text-decoration:none;font-size:13px;font-weight:600;">
                    Vedi tutti gli annunci nella tua zona →
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

        if (res.ok) {
          sent++;
          console.log(`Email inviata a ${email}`);
        } else {
          const resendBody = await res.text();
          console.error(`Resend error per ${email}:`, resendBody);
          await supabase.from('notify_alert_log').delete().eq('user_id', uid).eq('annuncio_id', annuncio.id);
        }
      })
    );

    return new Response(`OK — ${sent} email inviate`, { status: 200 });

  } catch (e) {
    console.error('Errore edge function notify-alert:', e);
    return new Response('Internal error', { status: 500 });
  }
});
