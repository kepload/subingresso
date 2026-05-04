// ============================================================
//  Subingresso.it — Edge Function: Stats settimanali venditori
//  Trigger: cron settimanale (lunedì 9:00).
//  1 email per venditore con riepilogo views dei suoi annunci active
//  + delta vs settimana precedente (da weekly_stats_snapshot).
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SB_SECRET_KEY             = Deno.env.get('SB_SECRET_KEY') ?? SUPABASE_SERVICE_ROLE_KEY;
const FROM_EMAIL                = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                  = 'https://subingresso.it';

function escapeHtml(s: string): string {
  return (s || '').replace(/[<>&"']/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]!));
}

function getWeekStart(): string {
  const d = new Date();
  const day = d.getDay() || 7;
  if (day !== 1) d.setDate(d.getDate() - (day - 1));
  return d.toISOString().slice(0, 10);
}

Deno.serve(async (req) => {
  try {
    const auth = req.headers.get('authorization') || '';
    if (auth !== `Bearer ${SB_SECRET_KEY}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    const supabase = createClient(SUPABASE_URL, SB_SECRET_KEY);
    const weekStart = getWeekStart();

    // Tutti gli annunci active raggruppati per user_id
    const { data: listings } = await supabase
      .from('annunci')
      .select('id, titolo, user_id, visualizzazioni')
      .eq('status', 'active');

    if (!listings || listings.length === 0) {
      return new Response('No listings', { status: 200 });
    }

    // Aggrega per venditore
    const bySeller = new Map<string, { totalViews: number; count: number; titoli: string[] }>();
    for (const l of listings) {
      const entry = bySeller.get(l.user_id) || { totalViews: 0, count: 0, titoli: [] };
      entry.totalViews += (l.visualizzazioni || 0);
      entry.count += 1;
      if (entry.titoli.length < 3) entry.titoli.push(l.titolo);
      bySeller.set(l.user_id, entry);
    }

    const sellerUids = [...bySeller.keys()];

    // Preferenze email_stats
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email_stats, unsub_token')
      .in('id', sellerUids);
    const prefMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Ultimo snapshot per ciascuno (per calcolo delta)
    const { data: prevSnapshots } = await supabase
      .from('weekly_stats_snapshot')
      .select('user_id, total_views, week_start')
      .in('user_id', sellerUids)
      .neq('week_start', weekStart)
      .order('week_start', { ascending: false });

    const prevMap = new Map<string, number>();
    for (const s of (prevSnapshots || [])) {
      if (!prevMap.has(s.user_id)) prevMap.set(s.user_id, s.total_views);
    }

    // Snapshot già creato questa settimana? (idempotenza)
    const { data: thisWeek } = await supabase
      .from('weekly_stats_snapshot')
      .select('user_id')
      .eq('week_start', weekStart);
    const alreadyDone = new Set(thisWeek?.map(r => r.user_id) || []);

    let totalSent = 0;

    for (const uid of sellerUids) {
      if (alreadyDone.has(uid)) continue;
      const pref = prefMap.get(uid);
      if (!pref || pref.email_stats === false) continue;

      const stats = bySeller.get(uid)!;
      const prevViews = prevMap.get(uid) ?? 0;
      const weekViews = stats.totalViews - prevViews;

      // Salva snapshot (anche se non invia email, per avere storico)
      await supabase.from('weekly_stats_snapshot').upsert({
        user_id: uid,
        week_start: weekStart,
        total_views: stats.totalViews,
        active_listings: stats.count,
      });

      // Se nessuna view questa settimana, skip (email inutile)
      if (weekViews <= 0) continue;

      const { data: userData } = await supabase.auth.admin.getUserById(uid);
      const email = userData?.user?.email;
      if (!email) continue;

      const delta = prevViews > 0 ? Math.round(((weekViews / prevViews) * 100)) : null;
      const deltaLabel = delta !== null
        ? (delta >= 0 ? `+${delta}% rispetto alla scorsa settimana` : `${delta}% rispetto alla scorsa settimana`)
        : 'Prima settimana di dati';
      const deltaColor = delta !== null && delta >= 0 ? '#10b981' : '#64748b';

      const titoliHtml = stats.titoli.map(t =>
        `<li style="padding:6px 0;color:#334155;font-size:13px;font-weight:600;">${escapeHtml(t)}</li>`
      ).join('');

      const unsubUrl = `${SITE_URL}/unsubscribe.html?t=${pref.unsub_token}&type=stats`;

      const subject = `📊 Questa settimana: ${weekViews} visualizzazioni sui tuoi annunci`;
      const html = `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:540px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #f1f5f9;">
          <div style="background:#2563eb;padding:28px 32px;">
            <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Subingresso<span style="opacity:.7">.it</span></span>
          </div>
          <div style="padding:32px;">
            <p style="margin:0 0 6px;color:#2563eb;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">📊 Il tuo riepilogo settimanale</p>
            <h2 style="margin:0 0 20px;font-size:22px;font-weight:900;color:#0f172a;">I tuoi annunci stanno lavorando</h2>

            <div style="background:#f8fafc;border-radius:12px;padding:24px;margin-bottom:20px;text-align:center;">
              <p style="margin:0 0 4px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Visualizzazioni questa settimana</p>
              <p style="margin:0 0 6px;color:#0f172a;font-size:44px;font-weight:900;line-height:1;">${weekViews} 👀</p>
              <p style="margin:0;color:${deltaColor};font-size:13px;font-weight:700;">${deltaLabel}</p>
            </div>

            <div style="display:flex;gap:12px;margin-bottom:24px;">
              <div style="flex:1;background:#f8fafc;border-radius:10px;padding:16px;text-align:center;">
                <p style="margin:0 0 4px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;">Annunci attivi</p>
                <p style="margin:0;color:#0f172a;font-size:22px;font-weight:900;">${stats.count}</p>
              </div>
              <div style="flex:1;background:#f8fafc;border-radius:10px;padding:16px;text-align:center;">
                <p style="margin:0 0 4px;color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;">Views totali</p>
                <p style="margin:0;color:#0f172a;font-size:22px;font-weight:900;">${stats.totalViews}</p>
              </div>
            </div>

            ${stats.titoli.length ? `
            <p style="margin:0 0 8px;color:#0f172a;font-size:14px;font-weight:700;">I tuoi annunci:</p>
            <ul style="margin:0 0 24px;padding-left:20px;">${titoliHtml}</ul>
            ` : ''}

            <a href="${SITE_URL}/dashboard.html" style="display:inline-block;background:#2563eb;color:#fff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
              Vai alla Dashboard →
            </a>

            <p style="margin:28px 0 0;color:#94a3b8;font-size:12px;line-height:1.6;font-style:italic;">
              💡 Consiglio: annunci con foto aggiornate e descrizione dettagliata ricevono il 3x delle visualizzazioni.
            </p>
          </div>
          <div style="padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
              Ricevi questa email perché hai annunci attivi su Subingresso.it.<br>
              <a href="${unsubUrl}" style="color:#94a3b8;">Disattiva stats settimanali</a> ·
              <a href="${SITE_URL}/privacy.html" style="color:#94a3b8;">Privacy</a>
            </p>
          </div>
        </div>`;

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM_EMAIL, to: email, subject, html }),
      });

      if (res.ok) totalSent++;
      else console.error(`Resend error ${email}:`, await res.text());
    }

    return new Response(`OK — ${totalSent} stats inviate`, { status: 200 });
  } catch (e) {
    console.error('weekly-seller-stats error:', e);
    return new Response('Error', { status: 500 });
  }
});
