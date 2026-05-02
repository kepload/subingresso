# Informazioni Operative

## Sessione 29 Aprile 2026

- Registrazione: decisione prodotto = gli utenti devono poter entrare subito anche senza email verificata. La verifica email diventa non bloccante e va recuperata piu' avanti.
- `register-bypass`: deve creare/abilitare l'utente con `email_confirm: true`, salvare la mail in `pending_email_verifications`, creare/aggiornare `profiles`, e non bloccare mai la registrazione per errori di tracking verifica.
- Edge Functions modificate in repo ma NON deployate automaticamente da Vercel: `register-bypass` e `admin-recent-users` vanno deployate su Supabase manualmente/CLI.
- Deploy CLI: `npx.cmd supabase functions deploy register-bypass --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt`. Il `SUPABASE_ACCESS_TOKEN` adesso e' salvato in `.claude/settings.local.json` (verificato funzionante 30 apr).
- Ruota welcome: deve apparire subito dopo registrazione partita dal popup (`sessionStorage._reg_src='popup'`). Il profilo riceve `welcome_lottery_eligible=true`; registrazione normale invece `false`.
- Admin utenti recenti: non usare solo `auth.users.email_confirmed_at` per dire "Confermata", perche' il bypass lo valorizza per permettere login. Usare `email_verified=false` se esiste riga non verificata in `pending_email_verifications`.
- Commit principali: `455d053 Allow immediate signup access`, `055a123 Recover from signup function errors`, `e6a1f68 Show pending email verification in admin`.

## Sessione 30 Aprile 2026

- Verificato end-to-end il flusso utente con Chrome headless e Supabase reale: registrazione nuovo utente, ripresa pubblicazione da `vendi.html`, creazione annuncio `status='pending'`, cleanup account/annuncio via `delete_my_account()`.
- Corretto flusso pubblicazione: se l'utente clicca "Pubblica" da anonimo, dopo registrazione/login il submit riprende automaticamente e precompila nome/telefono dal profilo. Commit: `19df5cf Harden registration and listing flow`.
- `register-bypass` in repo e' stato reso piu' robusto: email normalizzata, client Supabase service_role senza sessione persistente, profilo/log verifica non fatali. In produzione pero' la function rispondeva ancora 500 finche' non viene deployata.
- Aggiunta Edge Function `grant-welcome-vetrina`: applica la vetrina welcome solo con JWT valido e annuncio di proprieta'. Il frontend la chiama solo se `localStorage._welcome_vetrina_won_<userId>='1'`, evitando chiamate/RPC inutili nel percorso normale.
- Deploy Supabase Edge Functions: `SUPABASE_ACCESS_TOKEN` in `.claude/settings.local.json`. Comandi:
  - `npx.cmd supabase functions deploy register-bypass --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt`
  - `npx.cmd supabase functions deploy grant-welcome-vetrina --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt`
- In alternativa per query SQL/DDL al DB live (senza CLI): Supabase Management API → `POST https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query` con `Authorization: Bearer <SUPABASE_ACCESS_TOKEN>`.
- Migliorato supporto Password Manager Chrome/Google: campi auth con `name`/`autocomplete` corretti e chiamata a `navigator.credentials.store()` dopo login/registrazione riusciti. Commit: `619a778 Improve password manager support`.
- Migliorato feedback del bottone finale in `vendi.html`: al click mostra subito "Verifica in corso...", poi "Pubblicazione in corso..."; se manca login o validazione fallisce, il bottone si riattiva. Commit: `385bb5e Improve listing submit feedback`.
- Stato SEO da ricordare: Search Console mostra sitemap riuscita con 44 URL, ma solo 2 pagine indicizzate e 21 "Rilevata, ma attualmente non indicizzata". Priorita' futura: pagine regionali/landing long-tail e backlink settoriali/locali.

## Sessione 30 Aprile 2026 (sera) — Fix pubblicazione lenta + email rotte

### Problema iniziale
- Pubblicazione annuncio falliva con timeout (20s prima, poi 45s). DB benchmark mostrava INSERT lento 15-20s.

### Causa root
- 5 trigger AFTER INSERT/UPDATE su `annunci`: `notify-alert`, `notify_alert_update`, `notify_alert_trigger` (custom), `" notify_seller_insert"` (con spazio iniziale!), `notify_seller_update`. Tutti sincroni tranne il custom. Per ogni INSERT, 3 chiamate HTTP sincrone con timeout 5s + 3 email duplicate alla stessa edge function `notify-alert`.

### Fix DB (applicati via Management API, non solo committati)
- Drop dei 4 webhook UI sincroni: `"notify-alert"`, `notify_alert_update`, `" notify_seller_insert"`, `notify_seller_update`.
- Creata function async `notify_seller_on_annunci()` con `pg_net.http_post()` + nuovo trigger `notify_seller_trigger`.
- Trigger finali su `annunci`: `notify_alert_trigger` (async), `notify_seller_trigger` (async), `trg_enforce_annunci_status` (BEFORE locale). Patch idempotente in `PATCH_REMOVE_DUPLICATE_TRIGGERS_20260430.sql`.
- **CRITICO**: `pg_net.http_post(url text, body jsonb, ...)` — il body DEVE essere `jsonb`, NON `::text`. La function originale usava `body := jsonb_build_object(...)::text` con `EXCEPTION WHEN OTHERS THEN NULL` → il type mismatch veniva silenziato → nessuna email partiva. Ora corretto + `RAISE WARNING` invece di `NULL`.
- Risultato: INSERT da 15-20s a <800ms. Email funzionano (verificato con INSERT di test che ha generato 200 OK su entrambe le edge function).

### Fix client (vendi.html)
- Il client `supabase-js@2` aveva episodi di hang/lock interni: l'INSERT timeout-ava 45s anche quando il server rispondeva in 1s.
- Sostituito tutto con fetch diretto a PostgREST/Storage:
  - `_directInsertAnnuncio()` per INSERT su annunci
  - `prefillContactFromSession()` legge sessione da localStorage via `_getStoredSupabaseSession()` e fetcha `/rest/v1/profiles` direttamente. NIENTE `_supabase.auth.getSession()` (era la chiamata che hangava anche dentro gli header del fetch).
  - Upload foto via `fetch POST /storage/v1/object/listings/...` con timeout 25s e progress "1/N".
- Cache localStorage (`_profile_nome`, `_profile_tel`) per prefill istantaneo al prossimo caricamento.
- Login (`auth.js handleLogin`): timeout 12s su `signInWithPassword` per evitare bottone "Attendi…" stuck.
- Smart name: evita duplicazione tipo `nome="Ardit Kycyku" + cognome="Kycyku" → "Ardit Kycyku Kycyku"`.
- Cache bust: `auth.js?v=4` su tutte le pagine.

### File diagnostici
- `DIAGNOSE_PUBLISH_SLOW.sql`: query per ispezionare trigger su annunci, function bodies, coda pg_net, replica identity.
- `PATCH_REMOVE_DUPLICATE_TRIGGERS_20260430.sql`: idempotente, riproduce le modifiche DB.

### Commit principali (in ordine)
- `6f9cf4f Show detailed publish error message`
- `1d1304c Auto-refresh JWT scaduto`
- `a9de110 Login timeout 12s`
- `7f6fc0e Increase publish timeout to 45s + diagnostic SQL`
- `47fc4fb Remove 3 duplicate notify-alert triggers`
- `960252c Convert notify-seller webhooks to async`
- `839c751 Fix critico: pg_net body deve essere jsonb non ::text`
- `c7d62d8 Direct fetch INSERT + prefill cache`
- `db1a251 Fetch diretto profile + storage upload`
- `f8709dd Prefill leggi sessione da localStorage senza supabase-js`

## Sessione 1 Maggio 2026 - Pulizia incoerenze sito

- Commit pushato: `6c76084 Clean up site inconsistencies`.
- Rimossa dai meta/SSR la promessa fuorviante "annunci verificati"; usare "contatto diretto" finche' non esiste una verifica reale.
- Filtri annunci: label utente "Affitto" ma valore interno ancora `Affitto mensile` per compatibilita' con i dati esistenti.
- Input numerici nei filtri annunci convertiti a `type="text" inputmode="numeric"`; parsing italiano in `js/pages/annunci.js` con punti migliaia e virgola decimale.
- SSR `api/annuncio.js` e `api/annunci-citta.js`: l'affitto annuale ora funziona sia con `Affitto` sia con `Affitto mensile`; prezzo mobile SSR usa lo stesso markup con `/anno`.
- Dashboard: rimossi join fragili `profiles!` da conversazioni e join diretto `profiles(...)` da pending listings; usare fetch separati su `profiles` + merge manuale.
- `modifica-annuncio.html`: preserva `dettagli_extra` esistente quando aggiorna le immagini, invece di sovrascriverlo con solo `{ images }`.
- `.vercelignore`: esclusi dal deploy file `.md`, `.sql`, `.claude`, `.vercel`, `scripts/.bin`, `supabase/.temp`.
- Eliminati SQL demo/vecchi non piu' utili: `INSERT_ANNUNCI_DEMO.sql`, `INSERT_PROFILI_DEMO.sql`, `PATCH_FIX_ANNUNCI_DEMO_PROFILI.sql`.
- Conservati SQL infrastrutturali/diagnostici (`SETUP_*`, `PATCH_*` non demo, `DIAGNOSE_PUBLISH_SLOW.sql`, `setup-database.sql`) perche' ancora utili.
- Verifiche eseguite: `node --check` sui JS, grep pattern vecchi (`Annunci verificati`, `profiles!`, `type="number"`, `annua e mensile`) senza risultati.

## Sessione 1 Maggio 2026 (sera) - Tracking valutatore + storico nel profilo + restyle

### Strategia consolidata
- Bolkestein: non e' un rischio reale (l'anzianita' viene mantenuta nel ricalcolo). Non serve scenario B per ora, restiamo verticali (no estensione ad altre licenze locali).
- Direzione: smettere di pensare il sito come "bacheca", posizionarsi come "primo operatore digitale del subingresso italiano" (funnel end-to-end).
- Monetizzazione roadmap: Tier 1 microcredito (PerMicro, Banca Etica), Tier 2 prestiti consumer (Cofidis/Findomestic/Compass/Younited), Tier 3 broker creditizi OAM (Auxilia, Credipass, BPIfutura) come ingresso piu' rapido. Modelli CPL EUR 15-50 o CPA 1-5%.
- Lead capture: progressive profiling, mai chiedere telefono al primo contatto. Email+password al signup, nome/telefono solo quando serve (pubblicazione annuncio, alert SMS, richiesta finanziamento).
- Dati: oggi raccogliamo abbastanza. Prossime aggiunte ad alto ROI = `intent` (vendi/compra/curioso) + `comune_posteggio` (autocomplete da COMUNI_IT). Tutto il resto (budget, telefono, P.IVA) si aggiunge solo quando arrivano i partner.

### Tracking valutatore Ondata 1 (commit `a6db49b`)
- ALTER `valutatore_logs`: +10 colonne (`referrer`, `utm_source/medium/campaign`, `landing_path`, `device_type`, `country`, `region`, `tempo_compilazione_sec`, `algoritmo_version`).
- `/api/geo.js`: serverless Vercel che ritorna `{country, region}` dagli header `x-vercel-ip-country` (gratis).
- `js/auth.js` cattura referrer esterno + UTM + landing_path al primo hit della sessione in `sessionStorage._acq_*`.
- `valutatore.html` ha lo stesso fallback inline (utenti che atterrano direttamente sul valutatore).
- Edge function `admin-valutatore-logs` (service_role + check `is_admin`) deployata con `--no-verify-jwt`.
- Admin panel in `dashboard.html`: sezione "Valutazioni" con stats badges (30g/registrati/pubblicato) + ultimi 5 + modale "Mostra altre" con search.

### Saved listings - preferiti (commit `4ad6a08`)
- Tabella `saved_listings (user_id, annuncio_id, created_at)` con RLS owner-only (SELECT/INSERT/DELETE).
- Cuoricino in `data.js buildCard()` (in alto a destra delle card).
- Tasto "Salva nei Preferiti" in `annuncio.html` (desktop + mobile cuoricino).
- Tab "Preferiti" in dashboard con badge contatore rosso.
- Click anonimo -> apre modal registrazione + salva `_pending_save_listing` in sessionStorage. Dopo signup `processPendingSaveListing()` salva automaticamente.
- `SAVED_IDS` Set globale in `data.js`. `loadSavedListingsCache()` chiamata da auth.js dopo login.
- Nascosto sui propri annunci.

### Report dettagliato + storico nel profilo (commit `e2c2dd3` + `d8d306e`)
- Nuova policy RLS SELECT su `valutatore_logs` per owner (`auth.uid() = user_id`).
- `report.html?id=UUID` (o `?session=TOKEN`): pagina report con stima, breakdown moltiplicatori, comparabili da DB (annunci attivi nel range +-50%), checklist documenti, bottone "Stampa / PDF" (window.print con @media print).
- Tab "Valutazioni" in `dashboard.html` con lista delle proprie valutazioni (data, stima cessione+affitto, zona/settore/freq, fatturato, badge "Pubblicato" se `annuncio_id`). Bottone "Apri report" -> `report.html?id=UUID`.
- `showTab()` legge hash URL: `dashboard.html#valutazioni` apre la tab.

### Flusso post-signup dal valutatore
- Click "Crea account" sul valutatore -> `_post_auth_intent='valutatore_save'` in sessionStorage.
- `auth.js _checkPostAuthIntent()`: dopo signup salva `_highlight_session` e fa redirect a `dashboard.html#valutazioni` (NON piu' a `report.html` standalone).
- `_linkValutatoreSession()` ora awaited per evitare race condition: il log deve avere user_id collegato prima del redirect.

### Highlight valutazione appena fatta (commit `3997e0c`)
- Click "Vai alle mie valutazioni" (loggato) -> salva `sessionStorage._highlight_session = _val_session` -> dashboard.
- Card valutazione hanno `data-session-token`. Dopo `loadMyValutazioni()`, `_highlightFreshValutazione()` cerca la card e applica `.valutazione-highlight` per ~6s (border verde + box-shadow pulsante 4 cicli) + `scrollIntoView`.

### Restyle pagina risultato valutatore
- Card simmetriche verde (Cessione) + blu (Affitto annuo): label minuscola in alto sinistra, numero grande sotto, dettagli (range / mese+ROI) come stat block a destra dentro la stessa card.
- "Nuova valutazione" sostituito da icona reload (no scritta).
- Card "Salva la tua valutazione" compatta: layout orizzontale, icona + titolo + bottone inline.
- Step 6 full-screen: nasconde `#seoContent`, `#siteFooter`, `.pre-result` (titolo+progress) via `body.is-result`.
- Main full viewport SEMPRE (`min-height: calc(100vh - 68px)`): durante step intermedi il contenuto SEO scorre sotto la piega ma resta indicizzabile da Google.
- Mobile (<=640px): `justify-content: flex-start` (no spazio vuoto sopra), card "Salva valutazione" ulteriormente compatta (icona ridotta, descrizione nascosta, padding stretto).

### Bug storici risolti questa sessione
- **CRITICO**: la regex Python che doveva aggiungere `snapSmall()` ha cancellato `snap()`. Risultato: `calculate()` lanciava ReferenceError silenzioso (try/catch difensivo lo nascondeva) e i risultati restavano "EUR --". **Lezione**: mai usare regex multi-line `[\s\S]*?` su pattern di funzioni multipli senza riverificare l'output. Edit puntuale o Read+Edit e' piu' sicuro.
- File HTML editati da editor che iniettano caratteri Unicode invisibili: U+200A (hair space) nello spazio del `replace`, U+0300 (combining grave accent) negli accenti italiani, control char 0x01 (SOH) lasciati da regex Python. Causa replace falliti silenziosi. Pulizia con Python: `bytes(b for b in raw if b >= 0x20 or b in (0x09, 0x0A, 0x0D))`.
- `nextStep()`: ora mostra step 6 PRIMA di chiamare `calculate()`. Se calculate() lanciava errore, lo step 5 si nascondeva ma lo step 6 non veniva attivato -> schermata vuota. Try/catch difensivo + ordine separato.

### Cache versioni attuali
- `data.js?v=7` (cuoricino + SAVED_IDS + toggleSaveListing)
- `auth.js?v=8` (_acq_*, processPendingSaveListing, _checkPostAuthIntent, _highlight_session)
- `annuncio-detail.js?v=5`
- Bump cache su tutte le pagine principali quando si modifica uno di questi file.

### Search Console (TODO non fatto)
- Avviso del 27 apr "Pagina con reindirizzamento": causa = `valutatore.html` ha canonical `/valutatore.html` (URL che redirige a `/valutatore` per `cleanUrls: true`) + tutti gli href interni del sito sono `.html` (creano 308 redirect). Fix proposto ma non eseguito: cambio canonical valutatore + strip `.html` da href interni.

### Prossime sessioni - opzioni in coda
- (a) Aggiungere step `intent` (vendi/compra/curioso) + `comune_posteggio` al valutatore (alto ROI, ~1h).
- (b) Pannello admin per export CSV lead (preparazione partner finanziari).
- (c) Banner "completa profilo" in dashboard al primo login per raccogliere nome+cognome (telefono solo nel form pubblicazione).
- (d) Sistemare i redirect `.html` per Search Console.
- (e) Generazione PDF server-side (edge function + Puppeteer/pdfshift) per report — oggi MVP usa `window.print()`.
- (f) Reminder Day 3 / Day 7 per iscritti inattivi — richiede prima campo `intent` (vedi punto a) per essere mirati.
- (g) Re-engagement Day 30 per utenti totalmente inattivi (no login, no annunci, no preferiti).

## Sessione 1 Maggio 2026 (sera 2) - Welcome email Day 0

### Obiettivo
Primi iscritti non pubblicavano. Aggiunta welcome email transazionale subito dopo signup per riattivare l'attenzione con 2 CTA chiare (pubblica / cerca).

### Edge Function `welcome-email` (nuova, n.7)
- File: `supabase/functions/welcome-email/index.ts`. Inviata via Resend con `from: noreply@subingresso.it`.
- Subject: `👋 Benvenuto su Subingresso.it`. Saluto personalizzato `Ciao {nome}` se presente in `user_metadata.nome`, altrimenti `Ciao,`.
- Layout: header blu, hero, **2 CTA box affiancate** (verde "Pubblica annuncio" → `/vendi.html`, blu "Esplora annunci" → `/annunci.html`), sezione "Come funziona in 3 passi", footer con privacy/termini/disiscriviti.
- Link unsubscribe: `unsubscribe.html?t={unsub_token}&type=all` (best effort, fallback `/contatti.html` se manca il token).
- Body atteso: `{ user_id: UUID }`. Edge function recupera email + metadata via service_role.

### Wiring in `register-bypass`
- Aggiunta `triggerWelcomeEmail(userId)` **fire-and-forget** (no `await`): non blocca la response al client e ogni errore è solo `console.error`. Mantiene il principio "registrazione mai bloccata da email".
- Chiamata SOLO sul percorso "utente nuovo creato". NON viene rimandata sul ramo "account riattivato" (utente esisteva non confermato): logica = welcome è one-shot, già inviata in passato.
- Auth header service_role + `apikey`. URL: `${SUPABASE_URL}/functions/v1/welcome-email`.

### Deploy
- `npx.cmd supabase functions deploy welcome-email --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt`
- `npx.cmd supabase functions deploy register-bypass --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt`

### Mappa email aggiornata (7 edge functions, 13 tipi)
- Transazionali: `send-auth-email` (5), `notify-seller` (3), `notify-alert` (1), `notify-message` (1), **`welcome-email` (1, NUOVO)**.
- Cron settimanali: `weekly-seller-stats` (1), `weekly-buyer-digest` (1).
- Cap consigliato: max 1 email/settimana per utente sommando tutte le sorgenti.

## Sessione 2 Maggio 2026 - Strategia infra-costi e analisi competitor

### Limiti email Supabase: NON applicabili
- Il limite "2 email/ora" del SMTP built-in Supabase è bypassato: tutte le email auth passano dall'Auth Hook `send-auth-email` → Resend. Tutte le transazionali e cron chiamano direttamente Resend. Quindi i limiti veri sono solo quelli di Resend.

### Soglie upgrade tier free → pagamento (ordine in cui satureranno)
- **Vercel Hobby → Pro $20/mese**: già *fuori policy* (sito commerciale). Tecnicamente da fare ora ma utente ha detto "aggiornerò quando rompono". OK così.
- **Resend Free (3000/mese, 100/giorno) → Pro $20/mese**: si satura PRIMA per via dei cron settimanali. Soglia pratica ~80-100 utenti email-attivi totali. **Quick win gratis prima dell'upgrade**: spalmare `weekly-buyer-digest` (lunedì) e `weekly-seller-stats` (giovedì) su giorni diversi → dimezza il picco giornaliero.
- **Supabase Free → Pro $25/mese**: il vincolo NON è MAU (50k irraggiungibili nel settore), ma **storage foto 1GB**. Soglia ~300-400 annunci con foto (5 × 500KB).

### Costi a regime realistico (TAM 10-20k utenti, NON 50k+)
- Anno 1 (2026): tutto free → **€0-20/mese**
- Anno 2-3: Resend Pro + magari Vercel → **€20-40/mese**
- Plateau (anno 3-4+): stack ottimizzato → **€30-50/mese** (~€500/anno)
- Il €135/mese probabilmente non si raggiungerà mai: era scenario 5k+ utenti attivi che è oltre il TAM realistico del settore (150k ambulanti totali in Italia, ~5-10% turnover/anno).

### Stack ottimizzato per quando avrà senso (>2k utenti)
- **Cloudflare Pages** (gratis, anche commerciale, illimitato) → sostituisce Vercel
- **Cloudflare R2** (storage foto: 10GB free + ZERO egress, S3-compatible) → sostituisce Supabase Storage
- **Brevo** ($9/mese Starter, $25/mese 40k email) → sostituisce Resend Pro/Scale (taglia 65-70% costo email)
- **Supabase Pro** ($25) → resta, è il cuore (DB+Auth+Edge Functions). Migrare significa riscrivere tutto, non conviene.
- Effort migrazione: Vercel→Pages 1-2h, Resend→Brevo 2-3h (cambio API in 7 edge functions), Supabase→R2 4-6h (script migrazione foto + cambio URL in DB + upload via API S3).

### Analisi mercato e TAM
- **Ambulanti Italia**: ~150k operatori, 5-10% turnover annuo = 7.500-15.000 transazioni teoriche/anno. Quote di mercato realistica per Subingresso: 30-60% nel medio termine = 500-3.500 transazioni/anno gestite.
- **Plateau utenti realistico**: 10-20k registrati totali, 2.500-6.000 MAU.
- **38.000 cessioni di attività commerciali** censite in Italia nel 2025 (+18% vs 2022, +12% prevista 2026). Mercato totale "cessione attività con licenza" = miliardi/anno.

### Mercati adiacenti per espansione (TAM "trasferimenti licenze IT")
Stima totale ~€0.5-5 miliardi/anno. Difficoltà ingresso (1=facile, 5=quasi impossibile):
- ✅ **Edicole** (1/5) — nessun verticale, target affine, anno 2
- ✅ **Autoscuole** (1/5) — vergine, ticket €50-200k, anno 2
- ✅ **Compro Oro** (1-2/5) — vergine, anno 2-3
- 🟡 **Taxi/NCC** (2/5) — niente leader verticale, ticket €100-180k, anno 3
- 🟡 **Tabacchi** (3/5) — Cedesitabaccheria + Tabaccherievendita aggredibili (UX vecchia), anno 3-4
- 🟠 **B&B** (3/5) — generalisti immobiliari forti
- 🟠 **Stabilimenti balneari** (4/5) — Mondo Balneare presidio + Bolkestein incertezza, aspettare
- 🟠 **Distributori carburante** (4/5) — mercato chiuso B2B
- 🔴 **Farmacie** (5/5) — **NO**, 5 mediatori storici (Pharmascout, Pharmabroker, Farma5, FaroFarma, FarmaCaratto)

### Player generalisti italiani da tenere d'occhio
- Tier 1 (DA alto): **Casa.it** (sezione attività e licenze), **Subito.it**, Immobiliare.it, Idealista
- Tier 2 (verticali cessione attività): **B2scout**, **Attivita24** (più evoluto: AI matchmaking + NDA digitale + valutazione), Commerciali.it, Annunci Industriali, VetrinaFacile, ConsultingItaliaGroup, sel.bz.it
- Pericolo reale: nessuno fa SEO programmatica verticale né integra lead gen finanziaria specializzata. Tu vinci con long-tail iper-specifica + contenuti normativi + valutatore + dati strutturati di settore.

### Lezione strategica chiave (modello da replicare)
**Immobiliare.it 2024**: €108M fatturato, **+€27M utile** (25% margine).
**Subito.it 2024**: €86M fatturato, **-€15M perdita**.
Stessa scala, performance opposta. Differenza: Immobiliare.it monetizza con **lead gen mutui** (MutuiOnline), Subito.it è classifieds puro.
**Roadmap monetizzazione Subingresso**: NON puntare al volume annunci, puntare alla **lead gen finanziaria verticale** (microcredito, broker OAM). A 5k utenti, 5-10% lead conversion × CPL €30 = €7.5-15k/anno revenue su €600/anno infra. Margine ~95%. Replicabile su edicole/autoscuole/compro oro = entrate moltiplicate, costi infra invariati.

### Prossime sessioni - opzioni aggiunte
- (h) **Pagine programmatiche per i ~8.000 comuni italiani** (subingresso.it/comune/{slug}) — singolo lavoro che porta più di tutto verso leadership SEO. Anche con 0 annunci attivi, riempire con dati settore/normativa/mercati/dati valutatore per attirare traffico organico.
- (i) **Spalmare i 2 cron settimanali su giorni diversi** (gratis, allunga vita free Resend) — 5 minuti di lavoro.

## Sessione 2 Maggio 2026 (giorno) — UI/UX, perf, analytics, allarmi, reminders

### Privacy policy riscritta
- Vecchia privacy era generica: mancavano page_views, valutatore_logs, saved_listings, Resend/Supabase/Vercel come responsabili, trasferimenti extra-UE, comunicazioni informative weekly, opt-in marketing.
- Nuova versione GDPR-compliant in `privacy.html` con: titolare (placeholder), categorie dati per schema reale, base giuridica per finalità, lista responsabili, sezione cookie/localStorage, tempi conservazione, 6 diritti GDPR + reclamo Garante.
- **DA COMPILARE prima del go-live legale**: 3 placeholder `[NOME TITOLARE]`, `[INDIRIZZO + P.IVA]`, `[EMAIL DI CONTATTO]`.

### Tailwind CDN → CSS precompilato (mobile speedup)
- Sostituito `<script src="cdn.tailwindcss.com">` con `<link rel="stylesheet" href="css/tailwind.css?v=2">` su tutte le 18 pagine HTML.
- `tailwind.config.js` aggiornato con safelist per classi toggle-ate via JS (animate-pulse, hidden, flex, grid…). Output ~50KB minified.
- Build: `npx tailwindcss -i tailwind.input.css -o css/tailwind.css --minify`
- Backup branch: `backup/pre-tailwind-cutover` (commit 58704d6) su GitHub per rollback istantaneo.
- Beneficio: -300KB JS runtime + niente JIT scan DOM al boot. Mobile first paint visibilmente più rapido.

### Page views tracking (analytics interno)
- Tabella `public.page_views` (path, visitor_id, session_id, referrer, created_at). RLS: anon insert, select admin-only.
- RPC `admin_page_views_stats()` torna total/today/monthly/yearly/daily-30 (security definer).
- Tracker JS `js/page-view-tracker.js` caricato su tutte le 17 pagine pubbliche, 1 view per (visitor, path, session) via sessionStorage dedup.
- Dashboard admin: linea violet "Visite" sul grafico esistente + badge "Visite oggi" + "Totali" accanto al titolo.

### Funnel admin (insight su drop-off)
- RPC `admin_funnel_stats()` torna 5 step (signups, primo annuncio, telefono profilo, contatto ricevuto, messaggio inviato), all-time + last 30d.
- Dashboard: pannello "Funnel utenti" con barre colorate, % vs iscritti, drop-off vs step precedente. Toggle Tutti / Ultimi 30g.
- Numeri 02/05: 22 → 17 → 12 → 3 → 2. Drop-off principale tra "Primo annuncio" e "Contatto ricevuto" (-75%).

### Export CSV utenti (admin)
- Edge function `admin-export-users` (--no-verify-jwt ma check is_admin via RPC). Bottone in dashboard "Ultimi iscritti".
- CSV UTF-8 + BOM (apre in Excel) con: id, email, nome/cognome/telefono, created_at, last_sign_in, email_confirmed, opt-in marketing, annunci attivi/totali, messaggi inviati, contatti ricevuti.
- Abilita lead-gen finanziaria verticale (filtro `email_stats_optin=true AND annunci_attivi>=1` → lista pulita per partner OAM/microcredito).

### Allarmi anomalie (admin)
- Edge function `admin-anomaly-check` schedulata pg_cron `0 9 * * *`. Tabella `admin_alerts_log` per rate-limit 12h.
- Check: annunci 24h=0 (crit), iscritti 7d=0 (crit), page views 24h<5 (warn), pending listings >3g (warn), spike signups 1h>20 (crit, anti-bot).
- Email styled via Resend a tutti gli admin solo se >=1 issue. In giornate "tutto ok" niente email.

### Onboarding widget (utente)
- In `dashboard.html` sopra le tabs: card gradient blue-50 con 4 step + barra progresso. Si nasconde a 4/4.
- Step: email confermata, telefono profilo, avatar, primo annuncio. CTA inline (goToProfilo per telefono+foto, vendi.html per annuncio).
- Attacca direttamente i drop-off del funnel (12/22 hanno telefono, 17/22 hanno annuncio).

### Reminder Day 3 / Day 7
- Edge function `engagement-reminders` schedulata `0 10 * * *`. Tabella `email_reminder_log` con `unique(user_id, kind)` per dedup garantito.
- Skip automatici: ha già pubblicato, ha email_digest=false, ha già ricevuto stesso reminder.
- Day 3: tono soft "pubblica in 5 min" → vendi.html. Day 7: persuasivo + bonus vetrina → annunci.html. Link unsubscribe in fondo.

### Edge functions deployate questa sessione (4 nuove, totale 11)
- `admin-export-users` (CSV download)
- `admin-anomaly-check` (alert giornaliero)
- `engagement-reminders` (Day 3/7)
- (più tabelle nuove: `page_views`, `admin_alerts_log`, `email_reminder_log`)

### Cron pg_cron attivi (4 totali)
- `unfeature-expired-daily` 03:00 — cleanup vetrine scadute
- `increment-featured-views` ogni 6h
- `weekly-buyer-digest` Lun 09:00 (TODO i: spalmare su giorno diverso)
- `weekly-seller-stats` Lun 09:00 (TODO i: spalmare)
- `admin-anomaly-check` 09:00 daily (NEW)
- `engagement-reminders` 10:00 daily (NEW)

### Bug fix questa sessione
- Save listing button spostato da contact card a icona bookmark accanto titolo annuncio. Posizione: `position:absolute top-0 right-0` dentro wrapper `relative pr-12` (flex+min-w-0 dava wrap per-character su mobile Safari).
- Cover annuncio ridotto -20% verticale (h-44→h-36 mobile, md:h-80→md:h-64 desktop).
- Mobile CTA "Invia Messaggio" → "Messaggio" (era 14 chars, wrappava su iPhone SE).
- Card annunci: border-slate-100→200, +shadow-sm shadow-slate-300/40. Premium glow sottile.
- Skeleton home (`#previewGrid`): 6 card animate-pulse via IIFE inline (annunci.html aveva già skeleton).
- **Bug critico fixato**: `vendi.html` riga 1233 sovrascriveva profilo utente con form.contatto/form.tel a ogni pubblicazione. Fix: `or=(nome.is.null,nome.eq.)` filtro PostgREST → update solo se campo vuoto. Onboarding ok, admin che pubblica per altri NON sovrascrive più il proprio profilo.
- **Censura telefoni parziale** in descrizione annuncio per non-loggati: regex IT (mobile/fisso/+39/0039), 9-14 cifre, lookbehind anti-falsi-positivi (coordinate, IBAN). Output: `338 12●●●●●` come link blu → `openAuthModal('register')`. Skip P.IVA 11 cifre senza separatori.
- Title block annuncio: bug overflow mobile causato da inserimento `#titleBadges` come 3° figlio del flex titolo+bookmark. Fix: id `#titleRow` come anchor + insertBefore prima del wrapper.

### Cache versioni attuali (FINE SESSIONE 2 MAGGIO)
- `data.js?v=8` (card outline + min-w-0 + statoBg)
- `auth.js?v=8` (invariato dalla sessione precedente)
- `annuncio-detail.js?v=9` (censorPhonesHTML + bookmark absolute + titleRow anchor)
- `css/tailwind.css?v=2` (precompilato 50KB, no più CDN runtime)
- `page-view-tracker.js?v=1`

### Prossima sessione (h: pagine programmatiche 8000 comuni)
Lavoro grosso, dividere in 5 sotto-sessioni:
- **A** Dati comuni (verifica/import COMUNI_IT, schema slug, indici).
- **B** Route SSR base `api/comune.js` + `vercel.json` rewrite + 5 test manuali.
- **C** Contenuto dinamico (annunci nel comune, cities vicine entro 50km, valutatore aggregati, JSON-LD Place).
- **D** Interlinking + sitemap (`api/sitemap.js` con tutte le URL `/comune/*`, footer "comuni vicini", breadcrumb).
- **E** Polish + monitoring (robots.txt, sitemap submit Search Console, mini-pannello admin "Top comuni per page_views").

Avvertenze per la prossima sessione:
- Non rompere il sito esistente — branch `feature/comuni` consigliato.
- Se aggiungi classi Tailwind nuove, **rebuilda CSS** (`npx tailwindcss ...`) e bumpa `?v=`.
- Backup di emergenza: `git reset --hard backup/pre-tailwind-cutover`.
