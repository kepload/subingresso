// ============================================================
//  Subingresso.it — Edge Function: notifica email nuovo annuncio
//  Trigger: Database Webhook su INSERT nella tabella `annunci`
//  Invia email agli utenti il cui alert è entro 200km dall'annuncio.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY             = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL               = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FROM_EMAIL                 = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                   = 'https://subingresso.it';
const RADIUS_KM                  = 200;

// Coordinate città italiane (specchio di data.js)
const PROVINCE_COORDS: Record<string, [number, number]> = {
  "Roma": [41.89, 12.49], "Milano": [45.46, 9.19], "Napoli": [40.85, 14.26], "Torino": [45.07, 7.68],
  "Palermo": [38.11, 13.36], "Genova": [44.40, 8.94], "Bologna": [44.49, 11.34], "Firenze": [43.76, 11.25],
  "Bari": [41.11, 16.87], "Catania": [37.50, 15.08], "Venezia": [45.44, 12.31], "Verona": [45.43, 10.99],
  "Brescia": [45.54, 10.21], "Bergamo": [45.69, 9.67], "Salò": [45.60, 10.52], "Desenzano": [45.47, 10.53],
  "Toscolano": [45.68, 10.60], "Toscolano Maderno": [45.68, 10.60], "Maderno": [45.68, 10.60],
  "Gardone": [45.62, 10.55], "Gargnano": [45.70, 10.65], "Limone": [45.81, 10.79],
  "Aosta": [45.73, 7.31],
  // Regioni come fallback
  "Lombardia": [45.46, 9.19], "Lazio": [41.89, 12.49], "Campania": [40.85, 14.26],
  "Piemonte": [45.07, 7.68], "Sicilia": [38.11, 13.36], "Liguria": [44.40, 8.94],
  "Emilia-Romagna": [44.49, 11.34], "Toscana": [43.76, 11.25], "Puglia": [41.11, 16.87],
  "Veneto": [45.44, 12.31], "Calabria": [38.90, 16.60], "Sardegna": [40.12, 9.01],
  "Abruzzo": [42.35, 13.39], "Marche": [43.61, 13.50], "Friuli-Venezia Giulia": [46.06, 13.23],
  "Trentino-Alto Adige": [46.07, 11.12], "Umbria": [43.10, 12.38], "Basilicata": [40.64, 15.80],
  "Molise": [41.56, 14.66], "Valle d'Aosta": [45.73, 7.31]
};

function getDistanceKM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCityCoords(cityName: string): [number, number] | null {
  if (!cityName) return null;
  const city = cityName.trim();
  if (PROVINCE_COORDS[city]) return PROVINCE_COORDS[city];
  // Fuzzy: cerca corrispondenza parziale case-insensitive
  const lower = city.toLowerCase();
  for (const key of Object.keys(PROVINCE_COORDS)) {
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
      return PROVINCE_COORDS[key];
    }
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();

    if (payload.table !== 'annunci') {
      return new Response('Ignored', { status: 200 });
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
    };

    // Invia solo quando un annuncio diventa attivo:
    // - INSERT diretto come active (admin)
    // - UPDATE da non-active → active (approvazione admin)
    //   RICHIEDE old_record != null: senza di esso non possiamo distinguere
    //   l'approvazione da un UPDATE di visualizzazioni/altri campi → falsi positivi
    const isNewActive = payload.type === 'INSERT' && annuncio.status === 'active';
    const isJustApproved = payload.type === 'UPDATE'
      && payload.old_record != null
      && annuncio.status === 'active'
      && payload.old_record.status !== 'active';

    if (!isNewActive && !isJustApproved) {
      return new Response('Not active', { status: 200 });
    }

    // Coordine dell'annuncio: prima prova comune, poi regione
    const annuncioCoords = getCityCoords(annuncio.comune) || getCityCoords(annuncio.regione);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Tutti gli alert tranne quello del venditore stesso
    const { data: alerts } = await supabase
      .from('alerts')
      .select('user_id, comune, lat, lng')
      .neq('user_id', annuncio.user_id);

    if (!alerts || alerts.length === 0) {
      return new Response('No alerts', { status: 200 });
    }

    // Mappa user_id → alert (per costruire il link di ricerca personalizzato)
    const matchingAlerts = new Map<string, typeof alerts[0]>();

    for (const a of alerts) {
      if (matchingAlerts.has(a.user_id)) continue; // già matchato
      // Se l'alert non ha coordinate → notifica per tutta Italia
      if (!a.lat || !a.lng) { matchingAlerts.set(a.user_id, a); continue; }
      // Se l'annuncio non ha coordinate → notifica tutti
      if (!annuncioCoords) { matchingAlerts.set(a.user_id, a); continue; }
      const dist = getDistanceKM(a.lat, a.lng, annuncioCoords[0], annuncioCoords[1]);
      if (dist <= RADIUS_KM) matchingAlerts.set(a.user_id, a);
    }

    if (matchingAlerts.size === 0) {
      return new Response('No matching alerts', { status: 200 });
    }

    const prezzoStr = annuncio.prezzo
      ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(annuncio.prezzo)
      : 'Trattativa privata';

    const annuncioUrl = `${SITE_URL}/annuncio.html?id=${annuncio.id}`;
    const titoloSafe  = (annuncio.titolo || 'Nuovo annuncio').replace(/[<>]/g, '');
    const luogoStr    = annuncio.comune || annuncio.regione || 'Italia';
    const tipoSafe    = (annuncio.tipo   || '').replace(/[<>]/g, '');
    const merceSafe   = (annuncio.merce  || '').replace(/[<>]/g, '');
    const dettagliRows = [
      tipoSafe  ? `<tr><td style="color:#64748b;font-size:13px;padding:4px 0;">Tipo</td><td style="color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${tipoSafe}</td></tr>` : '',
      merceSafe ? `<tr><td style="color:#64748b;font-size:13px;padding:4px 0;">Settore</td><td style="color:#0f172a;font-size:14px;font-weight:600;text-align:right;">${merceSafe}</td></tr>` : '',
    ].join('');

    const userFetches = [...matchingAlerts.keys()].map(uid => supabase.auth.admin.getUserById(uid));
    const usersResults = await Promise.all(userFetches);

    let sent = 0;
    await Promise.all(
      usersResults.map(async ({ data }, idx) => {
        const email = data?.user?.email;
        if (!email) return;

        const uid = [...matchingAlerts.keys()][idx];
        const alert = matchingAlerts.get(uid)!;
        // Link ricerca pre-filtrata sulla zona dell'alert
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
            subject: `🔔 Nuova piazza disponibile vicino a te — ${titoloSafe}`,
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
          console.error(`Resend error per ${email}:`, await res.text());
        }
      })
    );

    return new Response(`OK — ${sent} email inviate`, { status: 200 });

  } catch (e) {
    console.error('Errore edge function notify-alert:', e);
    return new Response('Internal error', { status: 500 });
  }
});
