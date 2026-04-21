// ============================================================
//  Subingresso.it — Edge Function: Digest settimanale acquirenti
//  Trigger: cron settimanale (lunedì 9:00) via pg_cron o servizio esterno
//  Invia 1 email/settimana a chi ha un alert + email_digest=true,
//  con i top 5 annunci nuovi nella zona (creati ultimi 7 giorni).
//  Skip se ci sono <3 annunci nuovi (per evitare email povere).
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FROM_EMAIL                = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                  = 'https://subingresso.it';
const RADIUS_KM                 = 200;
const MIN_ANNUNCI               = 3;
const MAX_ANNUNCI               = 5;

const PROVINCE_COORDS: Record<string, [number, number]> = {
  "Roma": [41.89, 12.49], "Milano": [45.46, 9.19], "Napoli": [40.85, 14.26], "Torino": [45.07, 7.68],
  "Palermo": [38.11, 13.36], "Genova": [44.40, 8.94], "Bologna": [44.49, 11.34], "Firenze": [43.76, 11.25],
  "Bari": [41.11, 16.87], "Catania": [37.50, 15.08], "Venezia": [45.44, 12.31], "Verona": [45.43, 10.99],
  "Brescia": [45.54, 10.21], "Bergamo": [45.69, 9.67], "Salò": [45.60, 10.52], "Desenzano": [45.47, 10.53],
  "Toscolano": [45.68, 10.60], "Toscolano Maderno": [45.68, 10.60], "Maderno": [45.68, 10.60],
  "Gardone": [45.62, 10.55], "Gargnano": [45.70, 10.65], "Limone": [45.81, 10.79], "Aosta": [45.73, 7.31],
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
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function getCityCoords(cityName: string): [number, number] | null {
  if (!cityName) return null;
  const city = cityName.trim();
  if (PROVINCE_COORDS[city]) return PROVINCE_COORDS[city];
  const lower = city.toLowerCase();
  for (const key of Object.keys(PROVINCE_COORDS)) {
    if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
      return PROVINCE_COORDS[key];
    }
  }
  return null;
}

function formatEuro(n: number | null | undefined): string {
  if (!n) return 'Trattativa privata';
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}

function escapeHtml(s: string): string {
  return (s || '').replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]!));
}

function getWeekStart(): string {
  // Lunedì della settimana corrente, formato YYYY-MM-DD
  const d = new Date();
  const day = d.getDay() || 7;
  if (day !== 1) d.setDate(d.getDate() - (day - 1));
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const weekStart = getWeekStart();
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Annunci nuovi della settimana (active, creati ultimi 7gg)
    const { data: recentAnnunci } = await supabase
      .from('annunci')
      .select('id, titolo, prezzo, tipo, merce, comune, regione, user_id, created_at, img_urls')
      .eq('status', 'active')
      .gte('created_at', sevenDaysAgo)
      .order('created_at', { ascending: false });

    if (!recentAnnunci || recentAnnunci.length < MIN_ANNUNCI) {
      return new Response(`Skip: solo ${recentAnnunci?.length || 0} annunci nuovi`, { status: 200 });
    }

    // Tutti gli alert con email_digest attivo
    const { data: alerts } = await supabase
      .from('alerts')
      .select('user_id, comune, lat, lng');

    if (!alerts || alerts.length === 0) {
      return new Response('No alerts', { status: 200 });
    }

    // Preferenze digest dei profili coinvolti
    const alertUids = [...new Set(alerts.map(a => a.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email_digest, unsub_token')
      .in('id', alertUids);

    const prefMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Già inviato questa settimana? Fetcha log
    const { data: alreadySent } = await supabase
      .from('weekly_digest_log')
      .select('user_id')
      .eq('week_start', weekStart);
    const sentSet = new Set(alreadySent?.map(r => r.user_id) || []);

    let totalSent = 0;

    for (const uid of alertUids) {
      const pref = prefMap.get(uid);
      if (!pref || pref.email_digest === false) continue;
      if (sentSet.has(uid)) continue;

      const userAlert = alerts.find(a => a.user_id === uid)!;

      // Filtra annunci entro 200km dall'alert (se ha coord), escluso propri
      const matched = recentAnnunci.filter(ann => {
        if (ann.user_id === uid) return false;
        if (!userAlert.lat || !userAlert.lng) return true; // alert nazionale
        const coords = getCityCoords(ann.comune) || getCityCoords(ann.regione);
        if (!coords) return true; // se non sappiamo dove, includi
        return getDistanceKM(userAlert.lat, userAlert.lng, coords[0], coords[1]) <= RADIUS_KM;
      }).slice(0, MAX_ANNUNCI);

      if (matched.length < MIN_ANNUNCI) continue;

      // Prendi email
      const { data: userData } = await supabase.auth.admin.getUserById(uid);
      const email = userData?.user?.email;
      if (!email) continue;

      const zonaLabel = userAlert.comune || 'la tua zona';
      const unsubUrl = `${SITE_URL}/unsubscribe.html?t=${pref.unsub_token}&type=digest`;

      const cardsHtml = matched.map(a => {
        const cover = (a.img_urls && a.img_urls[0]) || '';
        const annuncioUrl = `${SITE_URL}/annuncio.html?id=${a.id}`;
        return `
          <a href="${annuncioUrl}" style="display:block;text-decoration:none;margin-bottom:16px;border:1px solid #f1f5f9;border-radius:12px;overflow:hidden;background:#fff;">
            ${cover ? `<div style="height:120px;background:url('${escapeHtml(cover)}') center/cover #f1f5f9;"></div>` : ''}
            <div style="padding:14px 16px;">
              <p style="margin:0 0 4px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;">${escapeHtml(a.comune || a.regione || 'Italia')}</p>
              <h3 style="margin:0 0 8px;font-size:15px;font-weight:800;color:#0f172a;line-height:1.3;">${escapeHtml(a.titolo || 'Nuovo annuncio')}</h3>
              <p style="margin:0;color:#2563eb;font-size:15px;font-weight:900;">${formatEuro(a.prezzo)}</p>
            </div>
          </a>`;
      }).join('');

      const subject = `📬 ${matched.length} nuovi posteggi vicino a ${zonaLabel} questa settimana`;
      const html = `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f1f5f9;">
          <div style="background:#2563eb;padding:28px 32px;">
            <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Subingresso<span style="opacity:.7">.it</span></span>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 6px;color:#2563eb;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">📬 Il tuo riepilogo settimanale</p>
            <h2 style="margin:0 0 20px;font-size:22px;font-weight:900;color:#0f172a;">${matched.length} nuovi annunci da vedere</h2>
            <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Questa settimana sono stati pubblicati <strong>${recentAnnunci.length} nuovi posteggi</strong> su Subingresso.it.
              Ecco i più rilevanti nella tua zona:
            </p>
            ${cardsHtml}
            <a href="${SITE_URL}/annunci.html${userAlert.comune ? `?q=${encodeURIComponent(userAlert.comune)}` : ''}"
               style="display:inline-block;background:#0f172a;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;margin-top:8px;">
              Vedi tutti gli annunci →
            </a>
          </div>
          <div style="padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
              Ricevi questa email perché hai attivato un alert su Subingresso.it.<br>
              <a href="${unsubUrl}" style="color:#94a3b8;">Disiscriviti dal riepilogo settimanale</a> ·
              <a href="${SITE_URL}/privacy.html" style="color:#94a3b8;">Privacy</a>
            </p>
          </div>
        </div>`;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM_EMAIL, to: email, subject, html }),
      });

      if (res.ok) {
        await supabase.from('weekly_digest_log').upsert({ user_id: uid, week_start: weekStart });
        totalSent++;
      } else {
        console.error(`Resend error ${email}:`, await res.text());
      }
    }

    return new Response(`OK — ${totalSent} digest inviati`, { status: 200 });
  } catch (e) {
    console.error('weekly-buyer-digest error:', e);
    return new Response('Error', { status: 500 });
  }
});
