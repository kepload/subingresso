// ============================================================
//  Subingresso.it — Edge Function: scout-bandi (v4 multi-step)
//
//  PIPELINE PER REGIONE (mini-task focalizzati per Gemini Flash):
//    STEP 1 [Gemini]  Discovery URL nei domini whitelist (max 15)
//    STEP 2 [Code]    HTTP HEAD + GET parziale + keyword check
//    STEP 3 [Gemini]  Estrazione strutturata da snippet HTML/PDF
//    STEP 4 [Gemini]  Verifica boolean keep/drop per ogni struct
//    STEP 5 [Code]    Dedup hash + insert DB
//
//  Briefing email: 1 ogni 3 giorni (72h gap, override se >=10
//  pending accumulati). Throttle via admin_briefing_state.
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

const GEMINI_MODEL              = 'gemini-2.5-flash';
const GEMINI_SLEEP_MS           = 2500;    // Throttle per stare nei 15 RPM
const HTTP_TIMEOUT_MS           = 10000;
const BRIEFING_GAP_HOURS        = 72;      // 3 giorni
const BRIEFING_URGENT_COUNT     = 10;      // forza invio se accumulati >=10
const MAX_CANDIDATES_PER_REG    = 15;
const MAX_VALIDATED_PER_REG     = 8;       // limite snippet → step 3

// ── Whitelist domini istituzionali ────────────────────────
interface RegioneSources { domini: string[]; calendario?: string; }
const REGIONE_SOURCES: Record<string, RegioneSources> = {
  'Piemonte':        { domini: ['regione.piemonte.it','bollettino.regione.piemonte.it','comune.torino.it','comune.novara.it','comune.asti.it','comune.alessandria.it','comune.cuneo.it','comune.biella.it','comune.vercelli.it','comune.verbania.it','comune.collegno.to.it','comune.moncalieri.to.it'], calendario: 'Bandi piemontesi in finestre irregolari.' },
  'Lombardia':       { domini: ['regione.lombardia.it','bollettino.regione.lombardia.it','comune.milano.it','comune.brescia.it','comune.bergamo.it','comune.como.it','comune.monza.it','comune.varese.it','comune.pavia.it','comune.mantova.it','comune.cremona.it','comune.lecco.it','comune.lodi.it','comune.sondrio.it'], calendario: 'Milano e Brescia con più frequenza.' },
  'Veneto':          { domini: ['regione.veneto.it','bur.regione.veneto.it','comune.venezia.it','comune.verona.it','comune.padova.it','comune.vicenza.it','comune.treviso.it','comune.belluno.it','comune.rovigo.it'], calendario: '90gg pubblicazione, 30gg domanda.' },
  'Emilia-Romagna':  { domini: ['regione.emilia-romagna.it','bur.regione.emilia-romagna.it','comune.bologna.it','comune.modena.it','comune.parma.it','comune.reggioemilia.it','comune.ferrara.it','comune.ravenna.it','comune.rimini.it','comune.forli.fc.it','comune.piacenza.it'], calendario: 'Posteggi liberi trasmessi gennaio + luglio.' },
  'Toscana':         { domini: ['regione.toscana.it','burt.regione.toscana.it','comune.firenze.it','comune.pisa.it','comune.livorno.it','comune.lucca.it','comune.arezzo.it','comune.siena.it','comune.prato.it','comune.grosseto.it','comune.pistoia.it'] },
  'Lazio':           { domini: ['regione.lazio.it','comune.roma.it','comune.frosinone.it','comune.viterbo.it','comune.latina.it','comune.rieti.it'], calendario: 'Roma: bandone Gualtieri 2026, slittamenti TAR.' },
  'Campania':        { domini: ['regione.campania.it','burc.regione.campania.it','comune.napoli.it','comune.salerno.it','comune.caserta.it','comune.benevento.it','comune.avellino.it'], calendario: '30 luglio scadenza Comuni → BURC + decreto unico.' },
  'Puglia':          { domini: ['regione.puglia.it','burp.regione.puglia.it','comune.bari.it','comune.lecce.it','comune.brindisi.it','comune.taranto.it','comune.foggia.it'], calendario: '30 apr + 30 set Comuni → BURP, bandi semestrali.' },
  'Calabria':        { domini: ['regione.calabria.it','comune.catanzaro.it','comune.reggiocalabria.it','comune.cosenza.it','comune.crotone.it','comune.vibovalentia.it','comune.tropea.vv.it','comune.pizzo.vv.it','comune.diamante.cs.it','comune.maratea.pz.it'], calendario: 'Sagre: Peperoncino Diamante, Cipolla Tropea, Tartufo Pizzo.' },
  'Sicilia':         { domini: ['regione.sicilia.it','gurs.regione.sicilia.it','comune.palermo.it','comune.catania.it','comune.messina.it','comune.siracusa.it','comune.trapani.it','comune.agrigento.it','comune.ragusa.it'], calendario: 'Palermo 40% posteggi vacanti; bandi su GURS.' },
  'Sardegna':        { domini: ['regione.sardegna.it','buras.regione.sardegna.it','comune.cagliari.it','comune.sassari.it','comune.nuoro.it','comune.oristano.it','comune.olbia.ot.it'], calendario: 'Stagionali costa: bandi mar-apr per 1 giu - 15 set.' },
  'Liguria':         { domini: ['regione.liguria.it','bur.regione.liguria.it','comune.genova.it','comune.savona.it','comune.imperia.it','comune.sanremo.im.it','comune.laspezia.it'], calendario: 'Sanremo: 31 gen. Imperia: spunta giornaliera.' },
  'Marche':          { domini: ['regione.marche.it','bur.regione.marche.it','comune.ancona.it','comune.pesaro.pu.it','comune.macerata.it','comune.ascoli.it','comune.fermo.it','comune.urbino.pu.it','comune.grottammare.ap.it','comune.civitanova.mc.it'], calendario: 'DDDAPIM regionale ogni gennaio.' },
  'Abruzzo':         { domini: ['regione.abruzzo.it','bura.regione.abruzzo.it','comune.laquila.it','comune.pescara.it','comune.teramo.it','comune.chieti.it','comune.vasto.ch.it','comune.montesilvano.pe.it','comune.roccaraso.aq.it'], calendario: 'Costa mar-apr, montagna set-ott.' },
  'Molise':          { domini: ['regione.molise.it','bur.regione.molise.it','comune.campobasso.it','comune.isernia.it','comune.termoli.cb.it'], calendario: '10-15 domande per bando vs 80-100 Lombardia.' },
  'Basilicata':      { domini: ['regione.basilicata.it','burb.regione.basilicata.it','comune.potenza.it','comune.matera.it','comune.melfi.pz.it','comune.policoro.mt.it'], calendario: 'Matera premium turistico, Maratea/Metaponto-Policoro.' },
  'Umbria':          { domini: ['regione.umbria.it','bur.regione.umbria.it','comune.perugia.it','comune.terni.it','comune.foligno.pg.it','comune.assisi.pg.it','comune.spoleto.pg.it','comune.norcia.pg.it'], calendario: 'Eurochocolate Perugia, Umbria Jazz, Quintana Foligno.' },
  'Trentino-Alto Adige': { domini: ['provincia.tn.it','provincia.bz.it','comune.trento.it','comune.bolzano.it','comune.merano.bz.it','comune.bressanone.bz.it','comune.rovereto.tn.it'], calendario: 'Mercatini Natale: bando giu-lug per nov-gen.' },
  'Friuli-Venezia Giulia': { domini: ['regione.fvg.it','bur.regione.fvg.it','comune.trieste.it','comune.udine.it','comune.pordenone.it','comune.gorizia.it','comune.lignano-sabbiadoro.ud.it'], calendario: 'Lignano-Grado: bandi stagionali giu-set.' },
  "Valle d'Aosta":   { domini: ['regione.vda.it','bur.regione.vda.it','comune.aosta.it','comune.courmayeur.ao.it','comune.la-thuile.ao.it'], calendario: "Sant'Orso Aosta: bando set-ott anno precedente." },
};

const VALIDATION_KEYWORDS = ['posteggio','posteggi','mercato','mercati','mercatale','concessione','concessioni','aree pubbliche','ambulante','ambulanti','commercio','fiera','fiere','bando','avviso','spunta','sagra'];
const INSTITUTIONAL_TLD = /\.(it|gov\.it|eu)\//i;

// ── Helpers ───────────────────────────────────────────────
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }
function escapeHTML(s: unknown): string {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}
function extractJsonArray(text: string): any[] | null {
  if (!text) return null;
  const cleaned = text.replace(/```(?:json)?\s*/gi,'').replace(/```\s*$/g,'').trim();
  const m = cleaned.match(/\[[\s\S]*\]/);
  if (!m) return null;
  try { const arr = JSON.parse(m[0]); return Array.isArray(arr) ? arr : null; } catch { return null; }
}

// ── Gemini call generica ──────────────────────────────────
async function callGemini(prompt: string, opts?: { useSearch?: boolean; maxTokens?: number; temperature?: number; }): Promise<string> {
  if (!GEMINI_API_KEY) return '';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const body: any = {
    contents: [{ role:'user', parts:[{text: prompt}] }],
    generationConfig: {
      temperature: opts?.temperature ?? 0.25,
      maxOutputTokens: opts?.maxTokens ?? 4096,
    },
  };
  if (opts?.useSearch) body.tools = [{ google_search: {} }];
  try {
    const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if (!res.ok) {
      console.error(`Gemini ${res.status}:`, (await res.text()).slice(0,300));
      return '';
    }
    const json = await res.json();
    const text = json?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text).filter(Boolean).join('') ?? '';
    if (!text) console.warn('Gemini empty text. finishReason=', json?.candidates?.[0]?.finishReason);
    return text;
  } catch (e) { console.error('Gemini exception:', e); return ''; }
}

// ============================================================
// STEP 1 — Discovery: Gemini con Search grounding ristretto a whitelist
// Output: array di URL candidati (max 15)
// ============================================================
async function step1_discoverCandidates(regione: string): Promise<{url: string, snippet?: string}[]> {
  const sources = REGIONE_SOURCES[regione];
  if (!sources) return [];
  const siteOps = sources.domini.map(d => `site:${d}`).join(' OR ');
  const cal = sources.calendario ? `\nContesto regionale: ${sources.calendario}` : '';

  const prompt = `MINI-TASK: trovare URL di bandi pubblici recenti per posteggi mercatali in Regione ${regione}.

Usa Google Search con query molto specifiche, restringendo ai domini istituzionali. Esempio di query corretta:
("bando posteggio" OR "concessione mercatale" OR "assegnazione posteggi" OR "avviso pubblico mercato") (${siteOps})
${cal}

ESCLUDI: blog, articoli giornalistici, annunci privati, bandi scaduti da oltre 30 giorni.

OUTPUT: SOLO un array JSON di oggetti {url, snippet}. Niente altro testo.
- url: URL diretto del bando (.it/.gov.it, mai redirect)
- snippet: 1-2 frasi del bando lette dalla search (anteprima)

Massimo 15 risultati. Se non trovi nulla, ritorna [].`;

  const text = await callGemini(prompt, { useSearch: true, maxTokens: 8192, temperature: 0.2 });
  const arr = extractJsonArray(text);
  if (!arr) return [];
  return arr
    .filter((x:any) => x && typeof x.url === 'string')
    .map((x:any) => ({ url: x.url, snippet: x.snippet ? String(x.snippet) : undefined }))
    .slice(0, MAX_CANDIDATES_PER_REG);
}

// ============================================================
// STEP 2 — HTTP validation + fetch snippet locale
// Solo i link che esistono e contengono keyword passano.
// ============================================================
interface ValidatedCandidate { url: string; finalUrl: string; geminiSnippet?: string; bodySnippet: string; }

async function step2_fetchAndValidate(url: string, regione: string): Promise<{ok: boolean, finalUrl?: string, snippet?: string, reason?: string}> {
  // URL ben formato
  let u: URL;
  try { u = new URL(url); } catch { return { ok:false, reason:'URL malformato' }; }

  // Vertex AI redirect (search grounding) → seguiamo, validation finale su URL canonico
  // Domini direttamente non istituzionali ma NON Vertex: blocco subito (subito.it, blog, ecc.)
  const isVertexRedirect = u.hostname === 'vertexaisearch.cloud.google.com';
  if (!isVertexRedirect && !INSTITUTIONAL_TLD.test(u.href)) {
    return { ok:false, reason:'tld non istituzionale' };
  }

  // GET parziale (segue redirect)
  try {
    const ctrl = new AbortController();
    const timeoutId = setTimeout(() => ctrl.abort(), HTTP_TIMEOUT_MS);
    const res = await fetch(url, {
      method: 'GET', signal: ctrl.signal, redirect: 'follow',
      headers: { 'Range': 'bytes=0-16383', 'User-Agent': 'Mozilla/5.0 (compatible; SubingressoBot/1.0)' },
    });
    clearTimeout(timeoutId);
    if (!res.ok && res.status !== 206) return { ok:false, reason:`HTTP ${res.status}` };

    // URL finale dopo redirect (per Vertex link diventa il sito vero)
    const finalUrl = res.url || url;
    let finalU: URL;
    try { finalU = new URL(finalUrl); } catch { return { ok:false, reason:'final URL malformato' }; }

    // Adesso valida il dominio canonico contro la whitelist (e tld istituzionale)
    if (!INSTITUTIONAL_TLD.test(finalU.href)) {
      return { ok:false, reason:`tld finale ${finalU.hostname} non istituzionale` };
    }
    const sources = REGIONE_SOURCES[regione];
    if (sources) {
      const host = finalU.hostname.toLowerCase();
      const wlMatch = sources.domini.some(d => host === d || host === 'www.'+d || host.endsWith('.'+d));
      if (!wlMatch) return { ok:false, reason:`dominio ${host} fuori whitelist` };
    }

    const text = await res.text();
    const lower = text.toLowerCase();
    const isPdf = finalUrl.toLowerCase().endsWith('.pdf') || (res.headers.get('content-type')||'').includes('pdf');
    if (isPdf) {
      if (VALIDATION_KEYWORDS.some(k => finalUrl.toLowerCase().includes(k))) {
        return { ok:true, finalUrl, snippet: '[PDF] '+finalUrl.split('/').pop() };
      }
      return { ok:true, finalUrl, snippet: '[PDF generico] '+finalUrl.split('/').pop() };
    }
    const matched = VALIDATION_KEYWORDS.filter(k => lower.includes(k));
    if (matched.length < 2) return { ok:false, reason:`solo ${matched.length} keyword nel body (min 2)` };
    const titleM = text.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const h1M = text.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const stripped = text.replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0, 800);
    const snippet = [titleM?.[1]?.trim(), h1M?.[1]?.trim(), stripped].filter(Boolean).join(' | ');
    return { ok:true, finalUrl, snippet: snippet.slice(0, 1000) };
  } catch (e) {
    return { ok:false, reason:'fetch fail: '+(e instanceof Error ? e.message : e) };
  }
}

// ============================================================
// STEP 3 — Structured Extraction (Gemini, batch)
// Da snippet → struttura JSON {titolo, comune, scadenza, n_posteggi, settore, riassunto}
// ============================================================
interface StructuredBando {
  url: string;
  titolo: string;
  comune: string;
  scadenza: string | null;
  n_posteggi: number | null;
  settore: string | null;
  riassunto: string;
}

async function step3_extractStructured(regione: string, candidates: ValidatedCandidate[]): Promise<StructuredBando[]> {
  if (candidates.length === 0) return [];
  const inputList = candidates.slice(0, MAX_VALIDATED_PER_REG).map((c, i) =>
    `[${i}]\nurl: ${c.finalUrl}\ngeminiSnippet: ${c.geminiSnippet || '(none)'}\nbodySnippet: ${c.bodySnippet.slice(0, 700)}`
  ).join('\n\n');

  const prompt = `MINI-TASK: estrazione dati strutturati da bandi italiani per posteggi mercatali in Regione ${regione}.

Per ognuno dei seguenti snippet (sono già stati pre-filtrati come PROBABILI bandi reali), ESTRAI esattamente questi campi:

INPUT:
${inputList}

OUTPUT: SOLO un array JSON. Per ogni input [i], un oggetto con:
- url: stringa (riprendi esattamente il valore di url)
- titolo: max 120 char, formato "Bando ..." o "Avviso pubblico ..." con Comune indicato
- comune: nome Comune (es. "Catanzaro", "Modena")
- scadenza: data YYYY-MM-DD se nota, altrimenti null
- n_posteggi: numero intero se noto, altrimenti null
- settore: stringa breve (es. "alimentare", "non alimentare", "misto", "hobbisti", "fiera"), altrimenti null
- riassunto: 1-2 frasi max 220 char (chi pubblica, n. posteggi, scadenza, dove fare domanda)

Mantieni ordine identico all'input. Includi TUTTI gli input, anche quelli ambigui (la verifica boolean è in un passo successivo).`;

  const text = await callGemini(prompt, { useSearch: false, maxTokens: 6144, temperature: 0.15 });
  const arr = extractJsonArray(text);
  if (!arr) return [];
  return arr
    .filter((x:any) => x && typeof x.url === 'string' && typeof x.titolo === 'string')
    .map((x:any) => ({
      url: String(x.url),
      titolo: String(x.titolo).slice(0, 300),
      comune: String(x.comune || '').slice(0, 120),
      scadenza: x.scadenza ? String(x.scadenza).slice(0, 30) : null,
      n_posteggi: typeof x.n_posteggi === 'number' ? x.n_posteggi : null,
      settore: x.settore ? String(x.settore).slice(0, 80) : null,
      riassunto: String(x.riassunto || '').slice(0, 600),
    }));
}

// ============================================================
// STEP 4 — Verification (Gemini, batch boolean)
// Per ogni struttura: keep / drop con motivo
// ============================================================
async function step4_verify(regione: string, structures: StructuredBando[]): Promise<StructuredBando[]> {
  if (structures.length === 0) return [];
  const inputList = structures.map((s, i) =>
    `[${i}] titolo: ${s.titolo}\n    comune: ${s.comune}\n    scadenza: ${s.scadenza ?? 'n/d'}\n    settore: ${s.settore ?? 'n/d'}\n    riassunto: ${s.riassunto}\n    url: ${s.url}`
  ).join('\n');

  const prompt = `MINI-TASK: verificare se queste sono REALMENTE bandi pubblici ATTIVI per posteggi mercatali in Regione ${regione}.

INPUT:
${inputList}

Per ogni [i] decidi keep o drop applicando QUESTI CRITERI:
✓ KEEP: bando pubblico per assegnazione posteggi / concessioni / mercato / sagra / fiera / spunta — pubblicato da Comune o Regione, attivo o scaduto da meno di 14 giorni.
✗ DROP: bando scaduto >14gg, bando non riguardante ambulante/posteggio (es. solo edilizia, scuola, sociale), titolo troppo generico, link su quotidiano/blog, annuncio privato.

OUTPUT: SOLO array JSON, un oggetto per ogni input nello stesso ordine, con:
- keep: true | false
- motivo: 1 frase breve

Esempio: [{"keep":true,"motivo":"Bando comunale attivo, posteggi mercato sabato"},{"keep":false,"motivo":"Avviso scaduto 6 mesi fa"}]`;

  const text = await callGemini(prompt, { useSearch: false, maxTokens: 2048, temperature: 0.1 });
  const arr = extractJsonArray(text);
  if (!arr) {
    // Fallback conservativo: se Gemini non risponde, manteniamo TUTTO (sarà l'admin a decidere)
    console.warn(`step4 ${regione}: nessuna response, fallback keep-all`);
    return structures;
  }
  const out: StructuredBando[] = [];
  for (let i = 0; i < structures.length; i++) {
    const v = arr[i];
    if (v && v.keep !== false) out.push(structures[i]);
    else console.log(`step4 drop [${regione}/${i}]: ${v?.motivo || 'no motivo'}`);
  }
  return out;
}

// ============================================================
// Email briefing — invio con throttling 1/3 giorni
// ============================================================
function briefingEmailHtml(items: any[], totalPending: number): string {
  const rows = items.map(it => {
    const titolo = escapeHTML(it.titolo);
    const regione = escapeHTML(it.regione);
    const comune = escapeHTML(it.comune || '—');
    const scadenza = escapeHTML(it.scadenza || '—');
    const settore = escapeHTML(it.settore || '');
    const riass = escapeHTML(it.ai_summary || it.riassunto || '');
    const link = escapeHTML(it.link || it.url);
    const approveUrl = `${FUNCTIONS_URL}/bando-action?t=${encodeURIComponent(it.approve_token)}&a=approve`;
    const rejectUrl  = `${FUNCTIONS_URL}/bando-action?t=${encodeURIComponent(it.reject_token)}&a=reject`;
    return `
<tr><td style="padding:18px 0;border-bottom:1px solid #f1f5f9;">
  <span style="display:inline-block;background:#fef3c7;color:#92400e;font-size:10px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;padding:3px 8px;border-radius:5px;margin-bottom:6px;">${regione}${settore?' · '+settore:''}</span>
  <h3 style="margin:4px 0 6px;font-size:15px;font-weight:900;color:#0f172a;line-height:1.35;">${titolo}</h3>
  <p style="margin:0 0 6px;font-size:12px;color:#64748b;font-weight:600;">📍 ${comune} · ⏰ ${scadenza}</p>
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
<span style="display:inline-block;background:#dbeafe;color:#1e40af;font-size:11px;font-weight:900;letter-spacing:0.05em;text-transform:uppercase;padding:4px 10px;border-radius:6px;">AI Scout · Briefing 3 giorni</span>
<h1 style="margin:14px 0 8px;font-size:22px;font-weight:900;color:#0f172a;line-height:1.3;">${totalPending} bando${totalPending===1?'':'i'} pending da rivedere</h1>
<p style="margin:0 0 6px;font-size:13px;color:#64748b;line-height:1.55;">Tutti pre-validati con pipeline a 4 step (discovery → HTTP check → estrazione → verifica). Approva quelli reali, scarta i falsi.</p>
</td></tr>
<tr><td style="padding:0 32px;"><table width="100%" cellpadding="0" cellspacing="0">${rows}</table></td></tr>
<tr><td style="padding:20px 32px 28px;">
<p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;line-height:1.6;">Anche dalla dashboard: <a href="${SITE_URL}/dashboard#bandoScouting" style="color:#64748b;text-decoration:underline;">pannello AI Scout</a> · Prossimo briefing tra 3 giorni</p>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

async function maybeSendBriefing(admin: any): Promise<{sent: boolean, pending: number, reason: string}> {
  // Conta TUTTI i pending (non solo nuovi del giro)
  const { data: pendingRows } = await admin
    .from('bando_scouting_log')
    .select('id, regione, titolo, link, ai_summary, approve_token, reject_token, discovered_at')
    .eq('status', 'pending')
    .order('discovered_at', { ascending: false });
  const pending = pendingRows || [];
  if (pending.length === 0) return { sent:false, pending:0, reason:'no_pending' };

  const { data: state } = await admin.from('admin_briefing_state').select('*').eq('id', 1).maybeSingle();
  const lastAt = state?.last_briefing_at ? new Date(state.last_briefing_at) : null;
  const hoursAgo = lastAt ? (Date.now() - lastAt.getTime()) / 3600000 : Infinity;
  const isUrgent = pending.length >= BRIEFING_URGENT_COUNT;

  if (!isUrgent && hoursAgo < BRIEFING_GAP_HOURS) {
    return { sent:false, pending: pending.length, reason: `throttled (last ${hoursAgo.toFixed(1)}h ago, gap ${BRIEFING_GAP_HOURS}h)` };
  }

  // Estrai email admin
  const { data: adminProfiles } = await admin.from('profiles').select('id').eq('is_admin', true);
  const adminIds = (adminProfiles || []).map((r:any) => r.id);
  if (adminIds.length === 0) return { sent:false, pending: pending.length, reason: 'no_admin_profiles' };
  const { data: adminUsers } = await admin.auth.admin.listUsers();
  const adminEmails = (adminUsers?.users || []).filter((u:any) => adminIds.includes(u.id) && u.email).map((u:any) => u.email);
  if (adminEmails.length === 0) return { sent:false, pending: pending.length, reason: 'no_admin_emails' };

  // Display top 15 nel mail per limitare HTML size
  const display = pending.slice(0, 15);
  const html = briefingEmailHtml(display, pending.length);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: adminEmails,
      subject: `🔍 AI Scout: ${pending.length} bando${pending.length===1?'':'i'} da rivedere${isUrgent ? ' (URGENTE)' : ''}`,
      html,
    }),
  });
  if (!res.ok) {
    console.error('Briefing Resend fail:', await res.text());
    return { sent:false, pending: pending.length, reason: `resend_${res.status}` };
  }

  await admin.from('admin_briefing_state').upsert({
    id: 1,
    last_briefing_at: new Date().toISOString(),
    last_briefing_items_count: pending.length,
    updated_at: new Date().toISOString(),
  });

  return { sent:true, pending: pending.length, reason: isUrgent ? 'urgent_override' : 'gap_elapsed' };
}

// ============================================================
// MAIN HANDLER — orchestrazione pipeline
// ============================================================
Deno.serve(async (req) => {
  try {
    const auth = req.headers.get('authorization') || '';
    if (auth !== `Bearer ${SB_SECRET_KEY}`) return new Response('Unauthorized', { status: 401 });

    const admin = createClient(SUPABASE_URL, SB_SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: subs, error: subsErr } = await admin.from('bando_alerts').select('regione');
    if (subsErr) {
      console.error('subs query:', subsErr);
      return new Response(JSON.stringify({ error: 'subs_query' }), { status: 500 });
    }
    const regioni = Array.from(new Set((subs || []).map((s:any) => s.regione).filter(Boolean)));
    if (regioni.length === 0) return new Response(JSON.stringify({ skipped: 'no_subscribers' }), { status: 200 });

    const stats: Record<string, any> = {};
    let totalInserted = 0;

    for (const regione of regioni) {
      const regStats:any = { step1_discovered: 0, step2_validated: 0, step2_rejected: 0, step3_extracted: 0, step4_verified: 0, inserted: 0, duplicate: 0 };

      // STEP 1
      const discovered = await step1_discoverCandidates(regione);
      regStats.step1_discovered = discovered.length;
      if (discovered.length === 0) { stats[regione] = regStats; continue; }
      await sleep(GEMINI_SLEEP_MS);

      // STEP 2 (no AI, può andare parallelo). Segue redirect Vertex → final URL canonico.
      const validated: ValidatedCandidate[] = [];
      const seenFinalUrls = new Set<string>();
      const fetchResults = await Promise.all(discovered.map(d => step2_fetchAndValidate(d.url, regione).then(r => ({d, r}))));
      for (const { d, r } of fetchResults) {
        if (r.ok && r.snippet && r.finalUrl) {
          // Dedup intra-batch: stesso final URL trovato da query diverse → 1 solo
          if (seenFinalUrls.has(r.finalUrl)) { regStats.step2_rejected++; continue; }
          seenFinalUrls.add(r.finalUrl);
          validated.push({ url: d.url, finalUrl: r.finalUrl, geminiSnippet: d.snippet, bodySnippet: r.snippet });
          regStats.step2_validated++;
        } else {
          regStats.step2_rejected++;
        }
      }
      if (validated.length === 0) { stats[regione] = regStats; continue; }

      // STEP 3
      const structures = await step3_extractStructured(regione, validated);
      regStats.step3_extracted = structures.length;
      if (structures.length === 0) { stats[regione] = regStats; continue; }
      await sleep(GEMINI_SLEEP_MS);

      // STEP 4
      const verified = await step4_verify(regione, structures);
      regStats.step4_verified = verified.length;
      if (verified.length === 0) { stats[regione] = regStats; continue; }
      await sleep(GEMINI_SLEEP_MS);

      // STEP 5: dedup + insert
      for (const s of verified) {
        const contentHash = await sha256Hex(`${regione}|${s.url}`);
        const summaryFull = s.riassunto + (s.comune ? `\nComune: ${s.comune}` : '') + (s.scadenza ? `\nScadenza: ${s.scadenza}` : '') + (s.n_posteggi ? `\nPosteggi: ${s.n_posteggi}` : '') + (s.settore ? `\nSettore: ${s.settore}` : '');
        const { data: ins, error: insErr } = await admin.from('bando_scouting_log').insert({
          regione, titolo: s.titolo, link: s.url, fonte: 'gemini+multistep+validated',
          ai_summary: summaryFull.slice(0, 1500), content_hash: contentHash,
        }).select('id').maybeSingle();
        if (insErr) {
          if (insErr.code === '23505') regStats.duplicate++;
          else console.warn(`insert ${regione}:`, insErr.message);
          continue;
        }
        if (ins) { regStats.inserted++; totalInserted++; }
      }
      stats[regione] = regStats;
    }

    // BRIEFING throttled 1/3gg
    const briefing = await maybeSendBriefing(admin);

    return new Response(JSON.stringify({
      regioni_scanned: regioni.length,
      total_new_inserted: totalInserted,
      per_regione: stats,
      briefing,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('scout-bandi error:', err);
    return new Response(JSON.stringify({ error: 'server', detail: String(err) }), { status: 500 });
  }
});
