// ============================================================
//  Subingresso.it — Edge Function: engagement-reminders
//  Schedulato da pg_cron 1x al giorno (10:00 UTC).
//  Cerca utenti registrati esattamente 3 o 7 giorni fa che
//  NON hanno ancora pubblicato un annuncio attivo, e gli manda
//  un reminder Day 3 (soft) o Day 7 (più persuasivo).
//  Idempotente via email_reminder_log (unique user_id+kind).
//  Rispetta opt-out via profiles.email_digest.
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SB_SECRET_KEY             = Deno.env.get('SB_SECRET_KEY') ?? SUPABASE_SERVICE_ROLE_KEY;
const FROM_EMAIL                = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                  = 'https://subingresso.it';

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Kind = 'day3' | 'day7';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const auth = req.headers.get('authorization') || '';
  if (auth !== `Bearer ${SB_SECRET_KEY}` && auth !== `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...CORS, 'Content-Type': 'application/json' } });
  }

  const supabase = createClient(SUPABASE_URL, SB_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const summary = { day3: { processed: 0, sent: 0, skipped: 0, errors: 0 },
                      day7: { processed: 0, sent: 0, skipped: 0, errors: 0 } };

    for (const kind of ['day3', 'day7'] as Kind[]) {
      const days = kind === 'day3' ? 3 : 7;
      // Finestra di 24h centrata sul giorno X-days fa (UTC)
      const from = new Date(Date.now() - (days + 1) * 24 * 36e5).toISOString();
      const to   = new Date(Date.now() - (days)     * 24 * 36e5).toISOString();

      // Candidati: utenti registrati nella finestra
      const { data: candidates, error: candErr } = await supabase
        .from('profiles')
        .select('id, nome, email_digest, unsub_token, created_at')
        .gte('created_at', from)
        .lt('created_at', to);

      if (candErr) {
        console.error(`${kind} candidate fetch failed`, candErr);
        continue;
      }

      const cands = (candidates || []) as Array<Record<string, unknown>>;
      summary[kind].processed = cands.length;
      if (cands.length === 0) continue;

      const ids = cands.map(c => String(c.id));

      // Quali hanno già almeno 1 annuncio non-deleted? (skip)
      const { data: published } = await supabase
        .from('annunci')
        .select('user_id')
        .in('user_id', ids)
        .neq('status', 'deleted');
      const publishedSet = new Set(((published || []) as Array<Record<string, unknown>>).map(r => String(r.user_id)));

      // Quali hanno già ricevuto questo reminder? (skip)
      const { data: alreadySent } = await supabase
        .from('email_reminder_log')
        .select('user_id')
        .in('user_id', ids)
        .eq('kind', kind);
      const sentSet = new Set(((alreadySent || []) as Array<Record<string, unknown>>).map(r => String(r.user_id)));

      for (const c of cands) {
        const uid = String(c.id);
        if (publishedSet.has(uid)) { summary[kind].skipped++; continue; }
        if (sentSet.has(uid))      { summary[kind].skipped++; continue; }
        if (c.email_digest === false) { summary[kind].skipped++; continue; }

        // Recupera email da auth.users
        const { data: ud, error: udErr } = await supabase.auth.admin.getUserById(uid);
        const email = ud?.user?.email;
        if (udErr || !email) { summary[kind].skipped++; continue; }

        const nome = String(c.nome || '').trim();
        const unsubToken = String(c.unsub_token || '');

        const ok = await sendReminder({ email, nome, kind, unsubToken });
        if (ok) summary[kind].sent++;
        else    summary[kind].errors++;

        // Logga sempre (success o errore) per evitare retry in loop
        await supabase.from('email_reminder_log').insert({
          user_id: uid,
          kind,
          success: ok,
          error_msg: ok ? null : 'send failed',
        }).then(() => {}, () => {});
      }
    }

    return json({ ok: true, summary });
  } catch (e) {
    console.error('engagement-reminders error:', e);
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});

async function sendReminder(args: { email: string; nome: string; kind: Kind; unsubToken: string }): Promise<boolean> {
  const { email, nome, kind, unsubToken } = args;
  const greeting = nome ? `Ciao ${escapeHtml(nome)},` : 'Ciao,';
  const vendiUrl   = `${SITE_URL}/vendi.html`;
  const annunciUrl = `${SITE_URL}/annunci.html`;
  const unsubUrl = unsubToken
    ? `${SITE_URL}/unsubscribe.html?t=${unsubToken}&type=all`
    : `${SITE_URL}/contatti.html`;

  let subject: string;
  let intro:   string;
  let body:    string;
  let ctaLabel: string;
  let ctaHref:  string;

  if (kind === 'day3') {
    subject = '⏰ Pronto a pubblicare il tuo posteggio?';
    intro   = `${greeting}<br>ti sei iscritto su Subingresso.it qualche giorno fa.`;
    body    = `Pubblicare il primo annuncio richiede meno di 5 minuti. Hai già tutto quello che serve: un titolo, una descrizione, il prezzo e — se vuoi — qualche foto.<br><br>Più rapido pubblichi, prima i potenziali acquirenti possono vedere la tua offerta.`;
    ctaLabel = 'Pubblica il mio annuncio';
    ctaHref  = vendiUrl;
  } else {
    subject = '👋 Ti aspettiamo su Subingresso.it';
    intro   = `${greeting}<br>è passata una settimana dalla tua iscrizione e non hai ancora pubblicato.`;
    body    = `Capiamo che decidere richiede tempo. Nel frattempo, dai un'occhiata agli annunci attivi nella tua zona — può essere un'idea utile sia per vendere che per esplorare il mercato.<br><br>Pubblicare resta sempre <strong>gratuito</strong>, e il primo annuncio pubblicato attiva un bonus vetrina di 30 giorni.`;
    ctaLabel = 'Esplora annunci attivi';
    ctaHref  = annunciUrl;
  }

  const html = `
    <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:1px solid #f1f5f9;">
      <div style="background:#2563eb;padding:28px;">
        <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Subingresso<span style="opacity:.7">.it</span></span>
      </div>
      <div style="padding:32px 28px 24px;">
        <p style="margin:0 0 14px;font-size:18px;font-weight:900;color:#0f172a;line-height:1.3;">${intro}</p>
        <p style="color:#475569;font-size:15px;line-height:1.65;margin:0 0 24px;">${body}</p>
        <a href="${ctaHref}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:900;font-size:14px;padding:14px 28px;border-radius:12px;text-align:center;">${ctaLabel}</a>
        <p style="margin:32px 0 0;font-size:11px;color:#94a3b8;border-top:1px solid #f1f5f9;padding-top:14px;line-height:1.5;">
          Hai ricevuto questa email perché ti sei registrato su Subingresso.it.
          <a href="${unsubUrl}" style="color:#94a3b8;text-decoration:underline;">Disiscriviti</a>.
        </p>
      </div>
    </div>`;

  try {
    const resp = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: email, subject, html }),
    });
    if (!resp.ok) {
      console.error('Resend reminder error:', resp.status, await resp.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (e) {
    console.error('sendReminder threw:', e);
    return false;
  }
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
