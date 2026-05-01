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
