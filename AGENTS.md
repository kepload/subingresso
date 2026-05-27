# AGENTS.md — Subingresso.it

> File letto da Codex CLI (e qualsiasi altro agente AI) all'inizio di OGNI sessione.
> Mantenere allineato con `CLAUDE.md` quando si modifica.
> Per la mappa tecnica completa del progetto: leggi `istruzioni.md` (812 righe, sezione 0).

---

## 0) Cosa fare PRIMA di toccare qualsiasi file

**OBBLIGATORIO ad ogni nuova sessione, prima della prima modifica:**

```powershell
.\scripts\session-backup.ps1 -Reason "<descrizione-corta>"
```

Crea un tag git `backup/session-YYYYMMDD-HHMMSS-<reason>` e lo pusha su GitHub. Punto di ritorno sicuro se le modifiche della sessione vanno male.

**Per tornare indietro in caso di disastro:**
```powershell
git tag -l "backup/session-*"                              # lista i checkpoint
git reset --hard backup/session-YYYYMMDD-HHMMSS-<reason>   # ripristina
```

Snapshot full del repo (escluso `node_modules`) anche in:
`C:\Users\utente\Documents\backup-subingresso\snapshot-2026-05-27-codex-handoff\`

---

## 1) Stile risposte (regola d'oro)

L'utente è un **vibe coder**, non un programmatore. Risposte **corte, semplici, italiane, zero gergo**. Niente papiri tecnici, niente muri di testo. Dopo una modifica spiega in 1-2 frasi **cosa cambia per lui**. Fai il lavoro, spiega poco.

- ❌ "Ho ridefinito la RPC `admin_x()` con `SECURITY DEFINER` e propagato i grants…"
- ✅ "Aggiunto pannello Avvisi. Apri dashboard, lo vedi sopra Performance blog."

---

## 2) Sicurezza segreti (post-incidente 4 mag 2026)

**MAI hardcodare segreti** in file versionati (`.sql`, `.md`, `.ts`, `.js`, `.json`). Il repo è pubblico su GitHub.

Segreti = `sb_secret_*`, JWT `eyJ...service_role`, Stripe keys, Resend keys, password DB.

**Per PATCH SQL che richiedono una chiave**: file template con `:'service_jwt'` + `psql -v service_jwt="$KEY"`, oppure file in `/tmp/` (fuori repo), applica, elimina.

**MAI** recuperare una chiave via query DB e iniettarla in un Write/Edit verso un path dentro il repo.

**Pre-commit hook gitleaks attivo** in `.git/hooks/pre-commit`. **Push protection GitHub attiva**. Non bypassare `--no-verify` se non sei certo al 100%.

---

## 3) Workflow git

- Dopo **OGNI** modifica ai file: `git add . && git commit -m "..." && git push`. Sempre. Senza aspettare richiesta.
- Su modifiche grosse (≥10 file o config core): prima crea branch `backup/pre-X` su GitHub.
- Commit message con virgolette o multilinea → usa `git commit -F file` (tempfile), NON `-m "..."` (PowerShell rompe).

---

## 4) Ambiente

- **OS**: Windows 11. Shell di default: **PowerShell 5.1** (Windows PowerShell, NON Core).
- **Working dir**: `C:\Users\utente\Desktop\subingresso.it`
- **Repo GitHub**: https://github.com/kepload/subingresso (pubblico)
- **Deploy**: Vercel auto on push, ~30s
- **DB**: Supabase project `mhfbtltgwibwmsudsuvf`. CLI in `scripts\.bin\supabase.exe`. Token in `.claude\settings.local.json` env `SUPABASE_ACCESS_TOKEN`.

### Quirks PowerShell 5.1 (verificati con sangue)
- `&&` e `||` NON funzionano → usa `; if ($?) { ... }`
- Niente em-dash `—` in stringhe `"..."` con encoding misto → usa `--`
- `2>&1` su exe nativi (git, npm) wrappa stderr come `NativeCommandError` e setta `$?=$false` anche con exit 0 → NON redirigere stderr di nativi
- `git commit -m "msg con virgolette"` rompe il parser → `git commit -F tempfile.txt`
- Default encoding `Out-File` è UTF-16 LE → passa `-Encoding utf8` se altri tool devono leggere

---

## 5) Stack progetto

HTML statico + JS vanilla + Tailwind precompilato + Supabase (Postgres + Edge Functions + Storage + Auth) + Vercel SSR per `/blog`, `/annuncio`, `/api/*`.

Struttura `/js`:
- `data.js` = "il cervello" (MERCI, REGIONI, helpers, `buildCard`, `escapeHTML`, `formatPrice`, `showToast`)
- `auth.js` = sessioni, modal auth, popup visitor/welcome, tracking modal_opens
- `ui-components.js` = header/footer dinamici
- `pages/*.js` = logica delle pagine specifiche

**Non toccare senza leggere `istruzioni.md`**:
- Trigger DB su `annunci` (3 attivi)
- Sistema vetrina Stripe
- Email Resend (8 edge functions)
- RLS column-level su `annunci.tel/email`
- `api/annuncio.js` SSR (template inline)
- `api/blog.js` SSR (legge `blog-template.html`)

---

## 6) Tailwind — solo classi precompilate

Il CSS è `css/tailwind.css` precompilato (~50KB). **NON usare arbitrary values** come `pl-[4.5rem]`: non sono nel build, falliscono silenziosamente.

Per classi nuove → `npx tailwindcss -i tailwind.input.css -o css/tailwind.css --minify` + bump `?v=N` su tutti gli HTML che caricano `tailwind.css?v=` (21 file).

Prima di aggiungere una classe responsive (`lg:`/`md:`), verifica che esista nel build con grep su `css/tailwind.css`.

`<style>` inline DOPO `<link tailwind.css>` sovrascrive le utility a parità di specificità → usa `style=""` inline su elementi singoli.

---

## 7) Database — colonne column-restricted

Su `annunci` e `profiles`, `tel` e `email` sono in REVOKE column-level per `authenticated`. Quindi:

- `select('*')` su `annunci` da authenticated → errore `42501`. **Sempre select esplicito** senza tel/email.
- Ogni nuova colonna su `annunci`/`profiles` → richiede `GRANT SELECT (col) ON annunci TO anon, authenticated;` esplicito.
- Per leggere tel/email del proprio annuncio: RPC `get_listing_contact()` (owner-bypass + admin-bypass + rate limit).

**Niente join `profiles(...)` in select di `annunci`/`conversazioni`** → rompe PostgREST. Fetch separato + merge manuale.

`_supabase.rpc().catch()` **NON esiste** in Supabase JS v2. Usa `async/await + try/catch`.

---

## 8) Bug pattern noti (NON ripetere)

- Regex Python multi-line `[\s\S]*?` per riscrivere codice → ha già cancellato funzioni intere. Edit puntuale > regex.
- Caratteri Unicode invisibili (U+200A, U+0300, 0x01) iniettati da editor rompono replace silenziosamente.
- Whitelist enum lato JS deve restare allineata col CHECK constraint DB. Dopo `ALTER TABLE` con nuovo enum → grep il valore in tutto il codice.
- Bucket key timezone: client e DB devono usare lo stesso (entrambi UTC o entrambi local).
- Refactor che migra funzioni a `data.js` o `ui-components.js` → grep `<funzione>(` su tutti gli HTML e verifica che lo script tag esista.
- Cache buster `?v=N`: bumpalo quando modifichi `data.js`, `auth.js`, `ui-components.js`, `pages/*.js`, `tailwind.css`.

---

## 9) Cache buster correnti (aggiornare a ogni modifica)

- `data.js?v=17`
- `auth.js?v=18`
- `ui-components.js?v=11`
- `js/pages/annunci.js?v=6`
- `js/pages/annuncio-detail.js?v=19` (anche in `annuncio.html` + `api/annuncio.js`)
- `css/tailwind.css?v=4`
- `page-view-tracker.js?v=3`

---

## 10) Memoria di progetto persistente

`istruzioni.md` (812 righe) = manuale completo. Leggere all'inizio della sessione per task non banali. Aggiornarlo:
- Ogni ~5 modifiche significative (regola "feedback_istruzioni_update")
- Quando l'utente dice "chiudo / fine sessione / sto per chiudere" → riassumere le info utili emerse e aggiungerle (no duplicati, super sintetico)

`CLAUDE.md` = stesse regole, formato Claude. Tienili allineati o, se diverge, AGENTS.md è la fonte di verità per Codex.

---

## 11) Cosa NON fare mai senza ok esplicito utente

- Eliminare annunci o utenti dal DB (anche soft delete) — chiedere prima
- Modificare `vendi.html` wizard se non strettamente necessario (è critico)
- Toccare trigger DB di `annunci`
- Cambiare schema email/Resend (rate limit free 100/giorno)
- Push su `main` con file > 50MB o segreti
- Modifiche estese (>10 file) senza prima creare un branch backup

---

## 12) 🚨 PLAYBOOK AI SCOUT BANDI — Cosa fare se si rompe

Il sistema AI Scout è autonomo: gira ogni mattina alle 08:00 UTC via cron pg_cron, chiama Gemini, scopre bandi, manda mail di briefing throttled (1 ogni 3 giorni). Funziona senza interventi finché Google non cambia regole.

### File chiave del sistema
- `supabase/functions/scout-bandi/index.ts` — pipeline multi-step (Gemini + HTTP validation)
- `supabase/functions/bando-action/index.ts` — endpoint approve/reject + invio mail
- `api/bandi/[slug].js` — landing page SSR sul sito
- `dashboard.html` — pannello admin "AI Scout Bandi"
- Cron: `cron.job WHERE jobname = 'scout-bandi-daily'`
- Tabelle: `bando_scouting_log`, `admin_briefing_state`, `bando_alerts`

### 🔴 Diagnostica veloce (in che stato è il sistema?)

```bash
# Da Bash, dalla root del repo:
cd "C:/Users/utente/Desktop/subingresso.it"
export SUPABASE_ACCESS_TOKEN="$(cat .claude/settings.local.json | grep -oE 'sbp_[a-zA-Z0-9]+')"
cat > /tmp/health.sql << 'EOF'
-- 1. Cron attivo?
SELECT jobid, jobname, schedule, active FROM cron.job WHERE jobname = 'scout-bandi-daily';
-- 2. Quando l'ultimo scout ha girato?
SELECT MAX(discovered_at) AS last_scout FROM bando_scouting_log;
-- 3. Status counters
SELECT status, COUNT(*) FROM bando_scouting_log GROUP BY status;
-- 4. Ultima mail briefing
SELECT last_briefing_at, last_briefing_items_count FROM admin_briefing_state;
-- 5. Iscritti per regione
SELECT regione, COUNT(*) FROM bando_alerts GROUP BY regione ORDER BY COUNT(*) DESC;
EOF
./scripts/.bin/supabase.exe db query --linked --file /tmp/health.sql --output json
```

### 🟡 PROBLEMA 1: Scout ritorna 0 risultati per giorni

**Sintomo**: `bando_scouting_log` non riceve nuovi insert da 3+ giorni nonostante il cron giri.

**Causa più probabile**: Gemini modello deprecato o cambio API. Verifica con curl diretto:
```bash
curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$GEMINI_KEY" -H "Content-Type: application/json" -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```
Se vedi `404 NOT_FOUND` o `429 RESOURCE_EXHAUSTED`, cambia modello.

**Fix — cambia modello Gemini** (1 riga di codice):
1. Apri `supabase/functions/scout-bandi/index.ts`
2. Cerca `const GEMINI_MODEL = 'gemini-2.5-flash';`
3. Sostituisci con uno dei fallback in ordine di preferenza:
   - `gemini-flash-latest` (alias che punta sempre al più recente flash)
   - `gemini-2.5-flash-lite` (free tier più generoso)
   - `gemini-flash-lite-latest`
   - Se Google annuncia un `gemini-3-flash` GA: usalo
4. Re-deploy:
   ```bash
   npx supabase functions deploy scout-bandi --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt
   ```
5. Trigger manuale e verifica (vedi sezione "Test manuale").

### 🟡 PROBLEMA 2: Errore 429 RESOURCE_EXHAUSTED

**Sintomo**: nei log Supabase Functions vedi "Gemini 429" ripetuti.

**Causa**: quota free esaurita o limite RPM superato.

**Fix opzionali (in ordine di sforzo crescente)**:
- A) **Aspetta 24h** se è limite giornaliero (250 RPD per `gemini-2.5-flash`)
- B) **Aumenta sleep tra chiamate** in `scout-bandi/index.ts`: cerca `GEMINI_SLEEP_MS = 2500;` → portalo a `5000`
- C) **Cambia modello** a uno con quota più alta (`gemini-2.5-flash-lite` ha 1000 RPD)
- D) **Rigenera la GEMINI_API_KEY** se sospetti che la chiave sia stata abusata:
  1. Vai su https://aistudio.google.com → API key → Delete vecchia + Create nuova
  2. `npx supabase secrets set GEMINI_API_KEY=<nuova> --project-ref mhfbtltgwibwmsudsuvf`

### 🟡 PROBLEMA 3: Briefing non arriva mai (o arriva troppo)

**Sintomo**: mail di briefing non parte anche se ci sono pending. Oppure parte ogni giorno (non rispetta il 3-giorni).

**Diagnostica**:
```sql
SELECT * FROM admin_briefing_state WHERE id = 1;
SELECT COUNT(*) FROM bando_scouting_log WHERE status = 'pending';
```

**Fix**:
- Se `last_briefing_at` è NULL → la prossima mail parte alla prima esecuzione scout. Ok.
- Se vuoi **forzare invio adesso** (es. dopo lungo silenzio):
  ```sql
  UPDATE admin_briefing_state SET last_briefing_at = now() - interval '4 days' WHERE id = 1;
  ```
  Poi trigger manuale scout (vedi sezione test).
- Se vuoi **cambiare intervallo** (default 72h → es. ogni 7 giorni):
  In `scout-bandi/index.ts`, cerca `BRIEFING_GAP_HOURS = 72` → cambia a `168` per settimanale.

### 🟡 PROBLEMA 4: Landing page `/bandi/<slug>` torna 404

**Sintomo**: l'utente clicca il link dalla mail e vede "Bando non disponibile".

**Diagnostica**:
```sql
SELECT id, regione, status, published_slug, published_at
FROM bando_scouting_log
WHERE published_slug IS NOT NULL
ORDER BY published_at DESC LIMIT 10;
```

**Possibili cause**:
- Slug nella URL non corrisponde a un record (typo)
- Record esiste ma `status != 'approved'/'sent'` (la RPC `get_published_bando` filtra solo questi)
- RPC non grants → verifica `\df get_published_bando` ha `EXECUTE TO anon`

**Fix**: ri-grant la RPC se persa:
```sql
GRANT EXECUTE ON FUNCTION public.get_published_bando(text) TO anon, authenticated;
```

### 🟢 Test manuale dello scout (forzare un giro fuori dal cron)

```bash
cd "C:/Users/utente/Desktop/subingresso.it"
export SUPABASE_ACCESS_TOKEN="$(cat .claude/settings.local.json | grep -oE 'sbp_[a-zA-Z0-9]+')"
cat > /tmp/trigger.sql << 'EOF'
SELECT net.http_post(
  url := 'https://mhfbtltgwibwmsudsuvf.supabase.co/functions/v1/scout-bandi',
  headers := jsonb_build_object(
    'Content-Type','application/json',
    'Authorization', 'Bearer ' || (regexp_match(
      pg_get_functiondef('public.notify_bando_subscribers_on_annunci'::regproc),
      'Bearer\s+(sb_secret_[A-Za-z0-9_-]+)'
    ))[1]
  ),
  body := jsonb_build_object('source','manual'),
  timeout_milliseconds := 300000
) AS rid;
EOF
./scripts/.bin/supabase.exe db query --linked --file /tmp/trigger.sql --output json
# Aspetta 3-4 min, poi:
cat > /tmp/result.sql << 'EOF'
SELECT status_code, content::text FROM net._http_response ORDER BY id DESC LIMIT 1;
EOF
./scripts/.bin/supabase.exe db query --linked --file /tmp/result.sql --output json
```

### 🔧 Manutenzione regolare (raccomandata ogni 1-2 mesi)

**Pulizia rejected anziani** (mantieni DB snello):
```sql
DELETE FROM bando_scouting_log
WHERE status = 'rejected' AND reviewed_at < now() - interval '90 days';
```

**Pulizia sent anziani** (le pagine landing restano comunque indicizzate, ma il record si può alleggerire):
```sql
DELETE FROM bando_scouting_log
WHERE status = 'sent' AND sent_at < now() - interval '180 days';
```

**Verifica tag di backup remoti** (così sai a che punto puoi tornare):
```bash
git ls-remote --tags origin "backup/session-*" | head -20
```

### 📝 Modifiche tipiche

**Aggiungere una nuova regione alla whitelist** (es. se cresce iscritti):
1. Apri `supabase/functions/scout-bandi/index.ts`
2. Cerca `const REGIONE_SOURCES`
3. Aggiungi entry con stesso pattern:
   ```ts
   'NuovaRegione': { domini: ['regione.xxx.it', 'comune.capoluogo.it', ...], calendario: '...' },
   ```
4. Re-deploy: `npx supabase functions deploy scout-bandi --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt`

**Cambiare il "tono" del prompt** (es. se Gemini sbaglia troppo):
1. In `scout-bandi/index.ts`, sezione `buildPrompt` (Step 1) o `step3_extractStructured` o `step4_verify`
2. Modifica testo prompt (mantieni la richiesta di OUTPUT JSON)
3. Re-deploy.

**Disattivare temporaneamente il cron** (es. durante manutenzione):
```sql
UPDATE cron.job SET active = false WHERE jobname = 'scout-bandi-daily';
-- Per riattivare: SET active = true
```

**Pubblicare un bando A MANO** (senza Gemini, es. trovato tu su Facebook):
```sql
INSERT INTO bando_scouting_log (regione, titolo, link, fonte, ai_summary, content_hash, status, published_slug, published_at)
VALUES (
  'Lombardia',
  'Bando posteggi mercato Brescia 2026',
  'https://www.comune.brescia.it/bandi/...',
  'manuale',
  'Tot. 5 posteggi nel mercato del lunedì in piazza...',
  encode(sha256(('Lombardia|manuale-' || gen_random_uuid()::text)::bytea), 'hex'),
  'approved',
  'bando-posteggi-brescia-2026-lombardia',
  now()
);
-- Poi forza l'invio chiamando bando-action con l'approve_token del record (lo vedi dal SELECT).
```

### 📊 Monitoraggio salute (ogni settimana, 30 sec)

Apri la dashboard admin → guarda il pannello "AI Scout Bandi":
- **Pending > 0** = bandi in attesa di tua revisione, da gestire
- **Sent > 0 con destinatari tot crescente** = sistema funziona, mail partono
- **Tutto a 0 da settimane** = qualcosa non gira, attiva diagnostica veloce

### 💰 Quote e costi (stato 27 mag 2026)

- **Gemini Flash gratis**: 250 RPD `gemini-2.5-flash`, 1000 RPD `gemini-2.5-flash-lite`. Usiamo ~16-80 RPD → margine larghissimo.
- **Resend gratis**: 100 mail/giorno, 3000/mese. Briefing throttled a 1 ogni 3gg → ~10/mese. Mail iscritti: variabile col volume.
- **Supabase free**: 500MB DB, 2GB transfer, 50K MAU. Nulla cambia.
- **Vercel free**: 100GB bandwidth, 100GB-hours serverless. Le pagine /bandi cache CDN 10 min → ~zero costo.

**Quando upgradare**: solo Resend potrebbe servire se acquisisci 1000+ iscritti agli avvisi. Soglia ~30 mail/giorno con un bando approvato. Allora $20/mese (Resend) o Brevo free 300/giorno.

---

## 13) Stato attuale (27 mag 2026 sera, post handoff Codex)

- 34 annunci reali attivi, 32 utenti veri
- Demo eliminati 22 mag, lotteria welcome rimossa 23 mag
- Vetrina Stripe attiva, sconto -10% alla pubblicazione
- Blog: 20/20 regioni bandi + 5/5 mercati ambulanti + hub Bolkestein (formato v2)
- **Pannello admin "Avvisi Bandi"** live (`admin_bando_alerts_stats`)
- **AI Scout Bandi v4 multi-step**: Gemini 2.5 Flash con whitelist domini + HTTP validation + structured extraction + verification. Cron 08:00 UTC daily. 3 bandi reali già pending in DB (Grottammare, Catanzaro, Crotone)
- **Briefing email throttled** 1 ogni 3 giorni (urgent override se ≥10 pending) — protegge quota Resend
- **Landing page `/bandi/<slug>`** SSR su Vercel: cross-sell annunci regione + valutatore + form iscrizione. Le mail agli iscritti linkano la NOSTRA pagina, non il PDF Comune. Aggiunge SEO long-tail. Test live: https://subingresso.it/bandi/bando-fiera-mariana-2026-crotone-calabria
- Iscritti `bando_alerts` (4): Piemonte, Campania, Marche, Calabria
- 1 bando già **pubblicato** (Crotone) — manualmente, senza ancora aver inviato la mail. Quando admin approverà via pannello/mail, parte la prima vera mail
- Prossima priorità: far crescere annunci veri in Lombardia (50-100 target) via lead magnet email su hub Bolkestein

Dettagli completi e TODO aperti → `istruzioni.md`.
