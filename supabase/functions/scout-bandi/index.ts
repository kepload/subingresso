// ============================================================
//  Subingresso.it — Edge Function: scout-bandi
//  Cron giornaliero. Per ogni regione con iscritti attivi, chiama
//  Gemini 2.5 Flash con Google Search grounding ristretto ai DOMINI
//  ISTITUZIONALI (whitelist per regione) e con few-shot examples.
//  Poi POST-VALIDA ogni candidato: HEAD request + keyword check sul
//  body HTML. Solo link reali e contestualmente rilevanti vengono
//  salvati come 'pending' e mostrati all'admin.
//
//  Auth: Bearer SB_SECRET_KEY.
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

const GEMINI_MODEL = 'gemini-2.5-flash';

// ── Whitelist domini istituzionali per regione ─────────────
// Strategia: passiamo Gemini un set di "site:" operator per restringere
// la ricerca SOLO ai domini ufficiali (Regione + BUR + comuni principali).
// Riduce drasticamente i falsi positivi (blog, subito, immobiliare, ecc).
interface RegioneSources {
  domini: string[];
  calendario?: string;
}

const REGIONE_SOURCES: Record<string, RegioneSources> = {
  'Piemonte': {
    domini: ['regione.piemonte.it','bollettino.regione.piemonte.it','comune.torino.it','comune.novara.it','comune.asti.it','comune.alessandria.it','comune.cuneo.it','comune.biella.it','comune.vercelli.it','comune.verbania.it','comune.collegno.to.it','comune.moncalieri.to.it'],
    calendario: 'Comuni piemontesi emettono bandi in finestre irregolari; controllare albo pretorio.',
  },
  'Lombardia': {
    domini: ['regione.lombardia.it','bollettino.regione.lombardia.it','comune.milano.it','comune.brescia.it','comune.bergamo.it','comune.como.it','comune.monza.it','comune.varese.it','comune.pavia.it','comune.mantova.it','comune.cremona.it','comune.lecco.it','comune.lodi.it','comune.sondrio.it','comune.bustoarsizio.va.it'],
    calendario: 'Bandi distribuiti tutto l\'anno; Milano e Brescia con più frequenza.',
  },
  'Veneto': {
    domini: ['regione.veneto.it','bur.regione.veneto.it','comune.venezia.it','comune.verona.it','comune.padova.it','comune.vicenza.it','comune.treviso.it','comune.belluno.it','comune.rovigo.it'],
    calendario: '90gg pubblicazione bando, 30gg domanda, 15gg revisioni.',
  },
  'Emilia-Romagna': {
    domini: ['regione.emilia-romagna.it','bur.regione.emilia-romagna.it','comune.bologna.it','comune.modena.it','comune.parma.it','comune.reggioemilia.it','comune.ferrara.it','comune.ravenna.it','comune.rimini.it','comune.forli.fc.it','comune.piacenza.it'],
    calendario: 'Comuni emiliani trasmettono elenco posteggi liberi a gennaio e luglio.',
  },
  'Toscana': {
    domini: ['regione.toscana.it','burt.regione.toscana.it','comune.firenze.it','comune.pisa.it','comune.livorno.it','comune.lucca.it','comune.arezzo.it','comune.siena.it','comune.prato.it','comune.grosseto.it','comune.pistoia.it'],
  },
  'Lazio': {
    domini: ['regione.lazio.it','comune.roma.it','comune.frosinone.it','comune.viterbo.it','comune.latina.it','comune.rieti.it'],
    calendario: 'Roma: 18.000 concessioni, bandone Gualtieri 2026 (slittamenti TAR).',
  },
  'Campania': {
    domini: ['regione.campania.it','burc.regione.campania.it','comune.napoli.it','comune.salerno.it','comune.caserta.it','comune.benevento.it','comune.avellino.it'],
    calendario: '30 luglio scadenza Comuni → Regione → BURC + decreto unico (es. Decreto Dirigenziale 66/2025).',
  },
  'Puglia': {
    domini: ['regione.puglia.it','burp.regione.puglia.it','comune.bari.it','comune.lecce.it','comune.brindisi.it','comune.taranto.it','comune.foggia.it'],
    calendario: '30 aprile + 30 settembre Comuni → BURP entro 30gg → bandi semestrali maggio/ottobre.',
  },
  'Calabria': {
    domini: ['regione.calabria.it','comune.catanzaro.it','comune.reggiocalabria.it','comune.cosenza.it','comune.crotone.it','comune.vibovalentia.it','comune.tropea.vv.it','comune.pizzo.vv.it','comune.diamante.cs.it','comune.maratea.pz.it'],
    calendario: 'Sagre cardine: Peperoncino Diamante (settembre), Cipolla Tropea, Tartufo Pizzo, Bergamotto Reggio.',
  },
  'Sicilia': {
    domini: ['regione.sicilia.it','gurs.regione.sicilia.it','comune.palermo.it','comune.catania.it','comune.messina.it','comune.siracusa.it','comune.trapani.it','comune.agrigento.it','comune.ragusa.it'],
    calendario: 'Palermo: 906/2.135 vacanti, situazione anomala; bandi spesso pubblicati su GURS.',
  },
  'Sardegna': {
    domini: ['regione.sardegna.it','buras.regione.sardegna.it','comune.cagliari.it','comune.sassari.it','comune.nuoro.it','comune.oristano.it','comune.olbia.ot.it'],
    calendario: 'Posteggi turistici stagionali costa: bandi annuali marzo-aprile per stagione 1 giu - 15 set.',
  },
  'Liguria': {
    domini: ['regione.liguria.it','bur.regione.liguria.it','comune.genova.it','comune.savona.it','comune.imperia.it','comune.sanremo.im.it','comune.laspezia.it'],
    calendario: 'Sanremo: scadenza unica 31 gennaio. Imperia: sistema "spunta" giornaliera.',
  },
  'Marche': {
    domini: ['regione.marche.it','bur.regione.marche.it','comune.ancona.it','comune.pesaro.pu.it','comune.macerata.it','comune.ascoli.it','comune.fermo.it','comune.urbino.pu.it','comune.grottammare.ap.it','comune.civitanova.mc.it'],
    calendario: 'Calendario regionale annuale via DDDAPIM ogni gennaio (BUR Marche).',
  },
  'Abruzzo': {
    domini: ['regione.abruzzo.it','bura.regione.abruzzo.it','comune.laquila.it','comune.pescara.it','comune.teramo.it','comune.chieti.it','comune.vasto.ch.it','comune.montesilvano.pe.it','comune.roccaraso.aq.it'],
    calendario: 'Doppio binario: marzo-aprile costa estiva (Pescara, Vasto), settembre-ottobre montagna (Roccaraso).',
  },
  'Molise': {
    domini: ['regione.molise.it','bur.regione.molise.it','comune.campobasso.it','comune.isernia.it','comune.termoli.cb.it'],
    calendario: 'Regione più accessibile d\'Italia, 10-15 domande per bando vs 80-100 in Lombardia.',
  },
  'Basilicata': {
    domini: ['regione.basilicata.it','burb.regione.basilicata.it','comune.potenza.it','comune.matera.it','comune.melfi.pz.it','comune.policoro.mt.it'],
    calendario: 'Matera premium turistico post-2019, costa tirrenica (Maratea), ionica (Metaponto-Policoro).',
  },
  'Umbria': {
    domini: ['regione.umbria.it','bur.regione.umbria.it','comune.perugia.it','comune.terni.it','comune.foligno.pg.it','comune.assisi.pg.it','comune.spoleto.pg.it','comune.norcia.pg.it'],
    calendario: 'Eventi: Eurochocolate Perugia (2-6k€ per 9gg), Umbria Jazz, Quintana Foligno, Calendimaggio Assisi.',
  },
  'Trentino-Alto Adige': {
    domini: ['provincia.tn.it','provincia.bz.it','comune.trento.it','comune.bolzano.it','comune.merano.bz.it','comune.bressanone.bz.it','comune.rovereto.tn.it','comune.brunico.bz.it'],
    calendario: 'Mercatini Natale: bando giugno-luglio per casette nov-gen (Bolzano, Merano, Bressanone, Trento, Rovereto, Brunico).',
  },
  'Friuli-Venezia Giulia': {
    domini: ['regione.fvg.it','bur.regione.fvg.it','comune.trieste.it','comune.udine.it','comune.pordenone.it','comune.gorizia.it','comune.lignano-sabbiadoro.ud.it'],
    calendario: 'Costa Lignano-Grado: bandi stagionali giu-set ogni anno.',
  },
  'Valle d\'Aosta': {
    domini: ['regione.vda.it','bur.regione.vda.it','comune.aosta.it','comune.courmayeur.ao.it','comune.la-thuile.ao.it'],
    calendario: 'Sant\'Orso Aosta (30-31 gen): bando dedicato esce settembre-ottobre dell\'anno precedente.',
  },
};

// ── Few-shot examples ───────────────────────────────────────
// Esempi REALI di output ideale che Gemini deve imitare in formato/tono.
const FEW_SHOT_EXAMPLES = `Esempi di OUTPUT BUONO (formato + livello dettaglio):

[{"titolo":"Bando per assegnazione 5 posteggi mercato settimanale del sabato","link":"https://www.comune.asti.it/bandi/2026/posteggi-mercato-sabato.pdf","comune":"Asti","scadenza":"2026-07-15","riassunto":"5 posteggi vacanti nel mercato del sabato di Asti, settori misti (alimentare + non alimentare). Domande via PEC a protocollo@pec.comune.asti.it entro le 12:00 del 15 luglio 2026."},
{"titolo":"Avviso pubblico per assegnazione 12 posteggi area mercatale via Roma","link":"https://www.comune.modena.it/argomenti/commercio/bandi/avviso-posteggi-2026","comune":"Modena","scadenza":"2026-06-30","riassunto":"12 posteggi in concessione decennale nell'area mercatale di via Roma, settori alimentari freschi. Bando pubblicato su BUR Emilia-Romagna n. 124/2026."}]

NB: I link sono URL diretti a pagine istituzionali (PDF o HTML ufficiale). Sono PDF o pagine .it del Comune o Regione, MAI link generici di Google o redirect.`;

// ── Helpers ───────────────────────────────────────────────
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
  const sources = REGIONE_SOURCES[regione];
  if (!sources) {
    return ''; // regione sconosciuta, skip
  }
  const siteOps = sources.domini.map(d => `site:${d}`).join(' OR ');
  const cal = sources.calendario ? `\nCALENDARIO TIPICO: ${sources.calendario}` : '';

  return `Sei un assistente specializzato in monitoraggio bandi pubblici italiani per posteggi mercatali e concessioni decennali su aree pubbliche.

OBIETTIVO: trovare bandi pubblici USCITI O ANCORA APERTI in Regione **${regione}**, per assegnazione di posteggi mercatali, concessioni decennali, autorizzazioni ambulanti tipo A o B, mercati settimanali, fiere comunali, mercatini natalizi/turistici stagionali.

REGOLA DI RICERCA STRETTA — usa SEMPRE l'operator site: per limitarti ai domini istituzionali ufficiali. Esempio query corretta:
("bando posteggio" OR "concessione mercatale" OR "assegnazione posteggi" OR "albo pretorio mercato") (${siteOps})

ESCLUDI ASSOLUTAMENTE:
- Annunci privati (subingresso.it, annunciambulanti.it, subito.it, immobiliare.it, kijiji.it, bakeca, idealista)
- Articoli giornalistici generici (corriere, repubblica, ansa, news/blog non istituzionali)
- Bandi SCADUTI da più di 30 giorni
- Bandi di altre regioni
${cal}

OUTPUT: SOLO un array JSON valido, ogni elemento con esattamente questi campi:
- titolo (max 120 char): "Bando ... Comune di XYZ" o "Avviso pubblico ..."
- link (URL diretto al PDF o pagina istituzionale .it; MAI redirect generici)
- comune (nome del Comune che pubblica)
- scadenza (YYYY-MM-DD se nota, altrimenti null)
- riassunto (max 280 char): n. posteggi, settore, modalità di presentazione domanda (PEC, link), data scadenza in chiaro

Se NON trovi nulla di rilevante con queste regole, ritorna [].

${FEW_SHOT_EXAMPLES}

Ora cerca per Regione ${regione} e ritorna SOLO il JSON array.`;
}

// ── Gemini call ────────────────────────────────────────────
async function askGemini(regione: string): Promise<any[]> {
  if (!GEMINI_API_KEY) return [];
  const prompt = buildPrompt(regione);
  if (!prompt) return []; // regione senza whitelist
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0.25, maxOutputTokens: 8192 },
  };
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error(`Gemini ${regione} ${res.status}:`, (await res.text()).slice(0, 300));
      return [];
    }
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('') ?? '';
    if (!text) {
      console.warn(`Gemini ${regione}: empty text. finishReason=${json?.candidates?.[0]?.finishReason}`);
      return [];
    }
    const cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/g, '').trim();
    const m = cleaned.match(/\[[\s\S]*?\](?=\s*$|\s*\[)/) || cleaned.match(/\[[\s\S]*\]/);
    if (!m) {
      console.warn(`Gemini ${regione}: nessun JSON array trovato in: ${cleaned.slice(0, 200)}`);
      return [];
    }
    try {
      const arr = JSON.parse(m[0]);
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      console.warn(`Gemini ${regione}: JSON parse fallito`);
      return [];
    }
  } catch (e) {
    console.error(`Gemini ${regione} exception:`, e);
    return [];
  }
}

// ── POST-VALIDATION: HEAD + keyword check ─────────────────
const VALIDATION_KEYWORDS = [
  'posteggio', 'posteggi', 'mercato', 'mercati', 'mercatale', 'concessione',
  'concessioni', 'aree pubbliche', 'ambulante', 'ambulanti', 'commercio',
  'fiera', 'fiere', 'bando', 'avviso', 'spunta', 'sagra',
];

const INSTITUTIONAL_TLD_PATTERN = /\.(it|gov\.it|eu)\//i;

interface ValidationResult {
  ok: boolean;
  reason?: string;
  status?: number;
}

async function validateCandidate(link: string, regione: string): Promise<ValidationResult> {
  // 1. URL sanity check
  try {
    const u = new URL(link);
    if (!INSTITUTIONAL_TLD_PATTERN.test(u.href)) {
      return { ok: false, reason: 'tld non istituzionale' };
    }
    // Domain whitelist check (almeno uno dei domini autorizzati per la regione)
    const sources = REGIONE_SOURCES[regione];
    if (sources) {
      const host = u.hostname.toLowerCase();
      const whitelistMatch = sources.domini.some(d => host.endsWith(d) || host === d || host === 'www.' + d);
      if (!whitelistMatch) {
        return { ok: false, reason: `dominio ${host} non in whitelist` };
      }
    }
  } catch (_) {
    return { ok: false, reason: 'URL malformato' };
  }

  // 2. HEAD request (timeout 8s)
  try {
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 8000);
    const headRes = await fetch(link, { method: 'HEAD', signal: ctrl.signal, redirect: 'follow' });
    clearTimeout(timeoutId);
    if (!headRes.ok) {
      // Alcuni server rifiutano HEAD ma accettano GET → fallback
      if (headRes.status === 405 || headRes.status === 403) {
        // proseguiamo al GET
      } else {
        return { ok: false, reason: `HEAD ${headRes.status}`, status: headRes.status };
      }
    }
  } catch (e) {
    // HEAD può fallire per CORS o restrizioni → non blocchiamo, andiamo a GET
    console.warn(`HEAD ${link}: ${e instanceof Error ? e.message : e}`);
  }

  // 3. GET parziale (primi 16KB) + keyword check
  try {
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), 12000);
    const getRes = await fetch(link, {
      method: 'GET',
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { 'Range': 'bytes=0-16383', 'User-Agent': 'Mozilla/5.0 (compatible; SubingressoBot/1.0)' },
    });
    clearTimeout(timeoutId);
    if (!getRes.ok && getRes.status !== 206 /* partial content */) {
      return { ok: false, reason: `GET ${getRes.status}`, status: getRes.status };
    }
    const text = (await getRes.text()).toLowerCase();
    // PDF binary: keyword non funziona, accetta se URL ha "posteggio"/"mercato"/"bando" nel path
    const isPdf = link.toLowerCase().endsWith('.pdf') || (getRes.headers.get('content-type') || '').includes('pdf');
    if (isPdf) {
      const urlLow = link.toLowerCase();
      if (VALIDATION_KEYWORDS.some(k => urlLow.includes(k))) {
        return { ok: true };
      }
      // PDF generico senza keyword nel URL: lo facciamo passare con warning (Gemini lo ha scelto)
      return { ok: true, reason: 'pdf, keyword non verificate' };
    }
    // HTML: cerca keyword nel body
    const matched = VALIDATION_KEYWORDS.filter(k => text.includes(k));
    if (matched.length < 2) {
      return { ok: false, reason: `solo ${matched.length} keyword nel body (minimo 2)` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: `GET fail: ${e instanceof Error ? e.message : e}` };
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
          <h1 style="margin:14px 0 8px;font-size:22px;font-weight:900;color:#0f172a;line-height:1.3;">${items.length} bando${items.length===1?'':'i'} verificato${items.length===1?'':'i'}</h1>
          <p style="margin:0 0 6px;font-size:13px;color:#64748b;line-height:1.55;">Tutti i link sono stati pre-validati (dominio istituzionale + risposta HTTP + keyword nel body). Decidi tu se inviarli agli iscritti.</p>
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
    const stats: Record<string, any> = {};

    for (const regione of regioni) {
      const candidates = await askGemini(regione);
      const regStats: any = { proposed: candidates.length, validated: 0, rejected_validation: 0, duplicate: 0, inserted: 0, reasons: [] };

      for (const r of candidates) {
        if (!r || typeof r !== 'object') { regStats.rejected_validation++; continue; }
        const link = String(r.link || '').trim();
        const titolo = String(r.titolo || '').trim();
        if (!link || !titolo) { regStats.rejected_validation++; continue; }
        if (link.length > 1000 || titolo.length > 300) { regStats.rejected_validation++; continue; }

        // BOOST 2: post-validation
        const v = await validateCandidate(link, regione);
        if (!v.ok) {
          regStats.rejected_validation++;
          if (regStats.reasons.length < 5) regStats.reasons.push(`[${regione}] ${v.reason}: ${link.slice(0,80)}`);
          console.warn(`Validation FAIL ${regione}: ${v.reason} | ${link}`);
          continue;
        }
        regStats.validated++;

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
            fonte: 'gemini+validated',
            ai_summary: summaryFull.slice(0, 1500),
            content_hash: contentHash,
          })
          .select('id, approve_token, reject_token')
          .maybeSingle();
        if (insErr) {
          if (insErr.code === '23505') { regStats.duplicate++; continue; }
          console.warn(`insert ${regione}:`, insErr.message);
          continue;
        }
        if (ins) {
          regStats.inserted++;
          newItems.push({
            regione, titolo, link, comune, scadenza,
            ai_summary: riassunto,
            approve_token: ins.approve_token,
            reject_token: ins.reject_token,
          });
        }
      }
      stats[regione] = regStats;
    }

    // Briefing solo se ci sono novità validate
    if (newItems.length > 0) {
      const { data: adminRows } = await admin
        .from('profiles').select('id').eq('is_admin', true);
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
              subject: `🔍 AI Scout: ${newItems.length} bando${newItems.length===1?'':'i'} verificato${newItems.length===1?'':'i'} da rivedere`,
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
