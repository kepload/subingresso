// ============================================================
//  Subingresso.it — Edge Function: scout-bandi
//  Cron giornaliero (08:00). Per ogni regione con iscritti attivi
//  in bando_alerts, chiama Gemini con Google Search grounding e
//  chiede "bandi posteggi mercatali usciti negli ultimi 7 giorni".
//  Confronta con bando_scouting_log (dedup per regione+content_hash),
//  inserisce i nuovi come 'pending', e manda una mail riassuntiva
//  agli admin con bottoni Approva/Scarta (link ai token).
//
//  Auth: Bearer SB_SECRET_KEY (cron pg_cron, no JWT utente).
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL              = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SB_SECRET_KEY             = Deno.env.get('SB_SECRET_KEY') ?? SUPABASE_SERVICE_ROLE_KEY;
const RESEND_API_KEY            = Deno.env.get('RESEND_API_KEY')!;
const GEMINI_API_KEY            = Deno.env.get('GEMINI_API_KEY') ?? '';
const FROM_EMAIL                = 'Subingresso.it <noreply@subingresso.it>';
const SITE_URL                  = 'https://subingresso.it';
const FUNCTIONS_URL             = `${SUPABASE_URL}/functions/v1`;

// Modello scelto: Gemini 2.5 Flash (free tier attivo per chiavi nuove,
// gemini-2.0-flash ha quota 0 sui progetti freschi creati nel 2026).
const GEMINI_MODEL = 'gemini-2.5-flash';

function escapeHTML(s: unknown): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ── Prompt builder ────────────────────────────────────────
function buildPrompt(regione: string): string {
  return `Sei un assistente che monitora bandi pubblici italiani per commercio ambulante / posteggi mercatali.

CERCA SUL WEB bandi pubblici **usciti negli ULTIMI 7 GIORNI** in Italia, Regione **${regione}**, per assegnazione di posteggi mercatali, concessioni decennali su aree pubbliche, autorizzazioni ambulanti tipo A o B, mercati settimanali, fiere comunali.

FILTRA STRETTAMENTE:
- Solo bandi PUBBLICI freschi (Comune/Regione, BUR ufficiali, albo pretorio, PEC ufficiali).
- ESCLUDI: annunci privati, siti di compravendita, articoli giornalistici generici, blog non istituzionali, bandi scaduti.
- ESCLUDI risultati che vengono da subingresso.it, annunciambulanti.it, immobiliare.it, subito.it, kijiji.it.

Per OGNI bando trovato che soddisfa i criteri, ritorna un oggetto JSON con:
- titolo: stringa breve (max 120 char), tipo "Bando posteggio mercato XYZ - Comune di ABC"
- link: URL diretto al bando ufficiale (PDF o pagina istituzionale)
- comune: nome del Comune (stringa)
- scadenza: data scadenza domande in formato YYYY-MM-DD se nota, altrimenti null
- riassunto: 2-3 frasi (max 280 char), dire quanti posteggi, settore se noto, link/PEC dove fare domanda

RITORNA SOLO UN ARRAY JSON valido. Niente testo prima o dopo. Niente backtick.
Se NON trovi nulla di rilevante, ritorna [].

Esempio output valido:
[{"titolo":"Bando 3 posteggi mercato settimanale Comune di Asti","link":"https://comune.asti.it/bandi/2026/posteggi.pdf","comune":"Asti","scadenza":"2026-06-15","riassunto":"3 posteggi liberi nel mercato del sabato, settore generi alimentari e non. Domande via PEC entro 15 giugno 2026."}]`;
}

// ── Gemini call con Google Search grounding ────────────────
async function askGemini(regione: string): Promise<any[]> {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY non configurata, skip');
    return [];
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: buildPrompt(regione) }] }],
    tools: [{ google_search: {} }],
    generationConfig: {
      temperature: 0.3,
      // 2.5-flash usa thoughts internamente (~700-1000 token).
      // Margine alto per evitare MAX_TOKENS cutoff sui risultati.
      maxOutputTokens: 8192,
    },
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`Gemini ${regione} ${res.status}:`, await res.text());
      return [];
    }
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('') ?? '';
    if (!text) {
      const finishReason = json?.candidates?.[0]?.finishReason;
      console.warn(`Gemini ${regione}: empty text. finishReason=${finishReason}`);
      return [];
    }
    // Strip markdown fence ```json ... ``` se presente
    const cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/g, '').trim();
    // Estrai il primo array JSON (anche se Gemini mette commenti o ripete)
    const m = cleaned.match(/\[[\s\S]*?\](?=\s*$|\s*\[)/) || cleaned.match(/\[[\s\S]*\]/);
    if (!m) {
      console.warn(`Gemini ${regione}: nessun JSON array trovato in: ${cleaned.slice(0, 200)}`);
      return [];
    }
    try {
      const arr = JSON.parse(m[0]);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      console.warn(`Gemini ${regione}: JSON parse fallito:`, m[0].slice(0, 200));
      return [];
    }
  } catch (e) {
    console.error(`Gemini ${regione} exception:`, e);
    return [];
  }
}

// ── Email briefing agli admin ──────────────────────────────
function briefingEmailHtml(items: any[]): string {
  const rows = items.map(it => {
    const titolo = escapeHTML(it.titolo);
    const regione = escapeHTML(it.regione);
    const comune = escapeHTML(it.comune || '—');
    const scadenza = escapeHTML(it.scadenza || '—');
    const riass = escapeHTML(it.ai_summary || '');
    const link = escapeHTML(it.link);
    const approveUrl = `${FUNCTIONS_URL}/bando-action?t=${encodeURIComponent(it.approve_token)}&a=approve`;
    const rejectUrl  = `${FUNCTIONS_URL}/bando-action?t=${encodeURIComponent(it.reject_token)}&a=reject`;
    return `
<tr><td style="padding:18px 0;border-bottom:1px solid #f1f5f9;">
  <span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:10px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;padding:3px 8px;border-radius:5px;margin-bottom:6px;">${regione}</span>
  <h3 style="margin:4px 0 6px;font-size:15px;font-weight:900;color:#0f172a;line-height:1.35;">${titolo}</h3>
  <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">📍 ${comune} · ⏰ Scad. ${scadenza}</p>
  <p style="margin:0 0 10px;font-size:13px;color:#334155;line-height:1.55;">${riass}</p>
  <p style="margin:0 0 12px;font-size:12px;"><a href="${link}" style="color:#2563eb;text-decoration:underline;">→ Apri bando originale</a></p>
  <div>
    <a href="${approveUrl}" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;font-weight:800;font-size:13px;padding:8px 16px;border-radius:8px;margin-right:6px;">✓ Invia agli iscritti</a>
    <a href="${rejectUrl}" style="display:inline-block;background:#fff;color:#64748b;border:1px solid #e2e8f0;text-decoration:none;font-weight:700;font-size:13px;padding:7px 14px;border-radius:8px;">✗ Scarta</a>
  </div>
</td></tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f172a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <tr><td style="padding:28px 32px 8px;">
          <span style="display:inline-block;background:#dbeafe;color:#1e40af;font-size:11px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;padding:4px 10px;border-radius:6px;">AI Scout · Briefing giornaliero</span>
          <h1 style="margin:14px 0 8px;font-size:22px;font-weight:900;color:#0f172a;line-height:1.3;">${items.length} bando${items.length===1?'':'i'} potenzialmente rilevante${items.length===1?'':'i'}</h1>
          <p style="margin:0 0 6px;font-size:13px;color:#64748b;line-height:1.55;">Approva quelli reali, scarta i falsi positivi. La mail agli iscritti parte solo dopo il tuo click.</p>
        </td></tr>
        <tr><td style="padding:0 32px;"><table width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>
        <tr><td style="padding:20px 32px 28px;">
          <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.6;">Anche dalla dashboard: <a href="${SITE_URL}/dashboard#bandoScouting" style="color:#64748b;text-decoration:underline;">apri pannello AI Scout</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// ── Main handler ───────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const auth = req.headers.get('authorization') || '';
    if (auth !== `Bearer ${SB_SECRET_KEY}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const admin = createClient(SUPABASE_URL, SB_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Regioni con almeno 1 iscritto attivo
    const { data: subs, error: subsErr } = await admin
      .from('bando_alerts')
      .select('regione');
    if (subsErr) {
      console.error('select bando_alerts:', subsErr);
      return new Response(JSON.stringify({ error: 'subs_query' }), { status: 500 });
    }
    const regioni = Array.from(new Set((subs || []).map(s => s.regione).filter(Boolean)));
    if (regioni.length === 0) {
      return new Response(JSON.stringify({ skipped: 'no_subscribers' }), { status: 200 });
    }

    const newItems: any[] = [];
    const stats: Record<string, number> = {};

    for (const regione of regioni) {
      const results = await askGemini(regione);
      stats[regione] = results.length;
      for (const r of results) {
        if (!r || typeof r !== 'object') continue;
        const link = String(r.link || '').trim();
        const titolo = String(r.titolo || '').trim();
        if (!link || !titolo) continue;
        if (link.length > 1000 || titolo.length > 300) continue;
        // Filtro veloce dominio non-istituzionale
        const lowLink = link.toLowerCase();
        if (lowLink.includes('subingresso.it') ||
            lowLink.includes('annunciambulanti.it') ||
            lowLink.includes('subito.it') ||
            lowLink.includes('kijiji.it') ||
            lowLink.includes('immobiliare.it')) continue;

        const contentHash = await sha256Hex(`${regione}|${link}`);
        const riassunto = String(r.riassunto || '').slice(0, 600);
        const comune = String(r.comune || '').slice(0, 120);
        const scadenza = r.scadenza ? String(r.scadenza).slice(0, 30) : null;
        const summaryFull = riassunto + (comune ? `\nComune: ${comune}` : '') + (scadenza ? `\nScadenza: ${scadenza}` : '');

        const { data: ins, error: insErr } = await admin
          .from('bando_scouting_log')
          .insert({
            regione,
            titolo: titolo.slice(0, 300),
            link,
            fonte: 'gemini',
            ai_summary: summaryFull.slice(0, 1500),
            content_hash: contentHash,
          })
          .select('id, approve_token, reject_token')
          .maybeSingle();
        if (insErr) {
          // 23505 unique_violation = già visto, skip silenzioso
          if (insErr.code !== '23505') console.warn(`insert ${regione}:`, insErr.message);
          continue;
        }
        if (ins) {
          newItems.push({
            regione,
            titolo,
            link,
            comune,
            scadenza,
            ai_summary: riassunto,
            approve_token: ins.approve_token,
            reject_token: ins.reject_token,
          });
        }
      }
    }

    // Briefing solo se ci sono novità
    if (newItems.length > 0) {
      const { data: adminRows } = await admin
        .from('profiles')
        .select('id, nome')
        .eq('is_admin', true);
      const adminIds = (adminRows || []).map(r => r.id);
      if (adminIds.length > 0) {
        const { data: adminUsers } = await admin.auth.admin.listUsers();
        const adminEmails = (adminUsers?.users || [])
          .filter(u => adminIds.includes(u.id) && u.email)
          .map(u => u.email!);

        if (adminEmails.length > 0) {
          const html = briefingEmailHtml(newItems);
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: adminEmails,
              subject: `🔍 AI Scout: ${newItems.length} bando${newItems.length===1?'':'i'} da rivedere`,
              html,
            }),
          });
        }
      }
    }

    return new Response(JSON.stringify({
      regioni_scanned: regioni.length,
      new_items: newItems.length,
      per_regione: stats,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('scout-bandi error:', err);
    return new Response(JSON.stringify({ error: 'server' }), { status: 500 });
  }
});
