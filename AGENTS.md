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

## 12) Stato attuale (27 mag 2026)

- 34 annunci reali attivi, 32 utenti veri
- Demo eliminati 22 mag, lotteria welcome rimossa 23 mag
- Vetrina Stripe attiva, sconto -10% alla pubblicazione
- Blog: 20/20 regioni bandi + 5/5 mercati ambulanti + hub Bolkestein (formato v2)
- Pannello admin "Avvisi Bandi" appena aggiunto
- Prossima priorità: far crescere annunci veri in Lombardia (50-100 target) via lead magnet email su hub Bolkestein

Dettagli completi e TODO aperti → `istruzioni.md`.
