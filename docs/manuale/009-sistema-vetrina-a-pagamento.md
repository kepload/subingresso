
## 💎 Sistema Vetrina a Pagamento

- Fonte del listino: `js/vetrina-pricing.js` e controllo server. 10/30/90 giorni
  a 49/99/249 euro; da 1 a 10 annunci sconti 0/10/15/19/23/26/29/32/35/37%, stessa
  durata e pagamento unico. Solo nel wizard,90giorni −10% a224,10€ dal27ottobre;
  offerta singola non cumulabile, validata dal server sul nuovo annuncio.
  Contratto completo: `data/VETRINE_PREMIUM.md`; patch del 22 ottobre.
- Checkout: `expected_amount_cents` coincide con il totale server, altrimenti
  409 prima del pagamento. Conservare sessioni già aperte, quote per annuncio,
  giorni acquistati, replay, rimborsi e compatibilità dei vecchi acquisti.
- Attivazione atomica con lock: `apply_vetrina_payment` / contratto pacchetti,
  solo servizio. Su annuncio pending il pagamento può essere riuscito senza
  attivazione; `zz_start_paid_vetrina_on_approval` avvia i giorni all'approvazione.
  Rinnovo dalla scadenza corrente; nessuna estensione di `expires_at` (270 giorni).
- Campi `annunci.featured*` protetti da `enforce_annunci_status`; ordini in
  `payments` con RLS. `create-checkout-session` valida il token utente;
  `stripe-webhook` valida firma, tempo e idempotenza. Il flag gateway JWT non
  sostituisce l'autenticazione applicativa. Dal browser servono `apikey` e Bearer.
- UI: prevenire doppi clic, conservare scelta e stato su errore/timeout,
  accettare soltanto URL Stripe previsti; pagamento singolo o pacchetto chiaro.
  Header/footer condivisi solo sui figli diretti del body, non sui dialoghi.
- Statistiche gratuite: visualizzazioni e messaggi nel periodo, anteprima
  Premium sfocata senza dati riservati nascosti nel client. Analisi complete
  permanenti per ogni annuncio con pagamento live riuscito, anche in bundle
  e dopo scadenza/rimborso; esclusi test, omaggi e semplice stato featured.
  Gate server/RLS, UTC e totali coerenti fra grafico, tabella e CSV. Contratto
  `data/SELLER_PREMIUM_ANALYTICS.md`.
- Misure Vetrina da eventi reali, azioni del proprietario escluse, niente
  ricostruzione retroattiva. Il cron casuale `increment-featured-views` è stato
  disattivato l'8 ottobre; non riattivarlo dai vecchi elenchi.
- Blog: soltanto Vetrine pagate pertinenti; catalogo annunci gratuito conservato.
  Geografia/rotazione e distinzione dai correlati: `data/BLOG_ADS.md`.
- Ricavi admin: distinguere pagamenti live riusciti da test/omaggi e conteggiare
  il bundle una volta. Valore richiesto dagli annunci distinto dai ricavi:
  affitti già annuali, nessuna moltiplicazione aggiuntiva e nessun minimo fittizio.
- Verifiche di riferimento: `scripts/test-vetrina.cjs`,
  `scripts/verify-seller-analytics.js`, `scripts/verify-vetrina.sql` (ROLLBACK)
  e test indicati nei contratti. Vecchio sconto/lotteria/layout di maggio sono
  superati; dettagli recuperabili dalla versione precedente in Git.

## 📬 Email — Sistema Completo (Resend)

- Contratti correnti: `data/VETRINA_EMAIL.md` e `data/EMAIL_CONVERSION_ANALYTICS.md`.
  I testi preparatori di `data/EMAIL_VETRINE_20261023.md` non sono ricevute d'invio.
- Campagna del 23 ottobre: 12 offerte reali consegnate nella coorte privata dei
  50 iscritti confermati dall'utente; uno escluso dal provider. Nessuna estensione
  ad altri contatti o nuovo cron. Copia test all'admin e nove anteprime personali
  richieste separatamente restano escluse dalle statistiche reali. ID nei dossier
  privati indicati nel registro; nessun reinvio derivato da questo riepilogo.
- Promozioni: massimo 20 per campagna/24 ore, 30 giorni per persona, almeno
  72 ore dopo altre periodiche; saltare digest/statistiche per 7 giorni dopo
  l'offerta. Deduplica e blocco degli esiti ambigui; niente retry automatici.
- Il consenso alle offerte non autorizza la misura individuale. Aperture/clic
  richiedono scelta informata nuova, versione distinta e revoca separata; i
  vecchi 50 consensi WhatsApp non sono ampliati. Trigger consenso solo INSERT,
  mai riattivarlo da UPDATE profilo/metadati. Le 12 email pregresse non hanno
  aperture/clic recuperabili. Attribuzione 7 giorni, ordini reali e bundle unico.
- Modulo corrente: vedere `js/auth.js` e il riepilogo registrazione sopra;
  le vecchie descrizioni delle caselle vuote non descrivono più l'interfaccia.
  L'uscita `promo` revoca solo offerte; mantenere le altre preferenze.
- Template condiviso `supabase/functions/_shared/vetrina-email.mjs`: dodici
  testi approvati, con beneficio per il venditore e spiegazione della Vetrina.
  Nessun totale/sconto; unica dicitura economica ammessa «A partire da solo
  49 euro!». Un pulsante blu evidente, S blu testuale, tabelle/stili inline e
  Arial. Selezione `copy_id` e stato logo mittente in `data/VETRINA_EMAIL.md`.

### Edge Functions email (7+ totali)
- **Transazionali:** `send-auth-email` (5 tipi auth), `notify-seller` (3 tipi), `notify-alert` (1), `notify-message` (1), `welcome-email` (1).
- **Cron settimanali:** `weekly-buyer-digest` (lun: top annunci in zona), `weekly-seller-stats` (lun: views/delta).
- **Tutte chiamano direttamente Resend** — bypass limite 2/h SMTP Supabase.
- **Cap consigliato:** max 1 email/settimana per utente sommando le sorgenti.
- **`SITE_URL = 'https://subingresso.it'`** (senza www) in tutte le notify.
- **Dominio Resend VERIFICATO** (DKIM `resend._domainkey` + SPF `send` + MX `send` su Aruba). FROM `noreply@subingresso.it`.

### Trigger DB email (async, fire-and-forget)
- **`notify_alert_trigger`** AFTER INSERT/UPDATE → `notify_alert_on_annunci()` via `pg_net.http_post`. Email alert acquirenti.
- **`notify_seller_trigger`** AFTER INSERT/UPDATE → `notify_seller_on_annunci()`. Email venditore "ricevuto/online/rifiutato".
- **NON ricreare webhook UI Supabase** — usare sempre trigger custom con `pg_net` (i webhook UI bloccavano INSERT 15-20s + non includevano `old_record`).
- **CRITICO `pg_net.http_post`**: parametro `body` deve essere `jsonb`, NON `::text`. Una versione precedente con `::text` + `EXCEPTION WHEN OTHERS THEN NULL` falliva silenziosamente.
- **Sempre `RAISE WARNING`** invece di `NULL` nell'exception handler.
- **Tabella `notify_alert_log(user_id, annuncio_id, sent_at)`** PK composita: dedup hard. Rollback su fail Resend.
- **Verify JWT DISATTIVATO** sulle 3 notify (cron + unsubscribe accedono senza utente loggato).
- **Auth check Bearer SB_SECRET_KEY** dentro tutte le 8 Edge Functions interne (notify-message/seller/alert, welcome-email, engagement-reminders, weekly-*, admin-anomaly-check). admin-anomaly-check accetta anche JWT di admin loggato (bottone dashboard). Cron pg_cron e trigger DB notify_alert/seller passano `Bearer sb_secret_*`.
- **Escape HTML** (`escapeHTML()` server-side) su tutti i campi user-controlled iniettati nelle email: senderName, titolo, motivazione, comune, tipo, settore. Subject usa il valore raw (no entità HTML letterali).

### Tabelle email
- `weekly_digest_log(user_id, week_start)` PK anti-doppio.
- `weekly_stats_snapshot(user_id, week_start, total_views, active_listings)` per delta.
- Colonne `profiles`: `email_digest bool`, `email_stats bool`, `unsub_token text` (UUID indexed).
- Pagina `unsubscribe.html` (noindex): POST a `email-unsubscribe` con `{token, type}`. Type: `digest`/`stats`/`all`.

### Reminder Day 3 / Day 7
- Edge function `engagement-reminders` cron `0 10 * * *`. Tabella `email_reminder_log` con `unique(user_id, kind)`.
- Skip se: ha già pubblicato, `email_digest=false`, già ricevuto stesso reminder.
- Day 3: tono soft "pubblica in 5 min". Day 7: persuasivo + bonus vetrina.

### Welcome email Day 0
- Edge function `welcome-email`. Subject `👋 Benvenuto su Subingresso.it`. 2 CTA: pubblica/esplora.
- Wired in `register-bypass` come **fire-and-forget** (no await, non blocca registrazione).
- Solo per ramo "utente nuovo creato", NON per "account riattivato".

## 📧 Auth Email Bypass

- **Problema**: Supabase free 2 email auth/h. Rate limit applicato PRIMA del Send Email Hook, non bypassabile.
- **Soluzione**: Edge function `register-bypass` — se `signUp` fallisce con rate limit, crea utente via `admin.auth.admin.createUser({ email_confirm: true })` + `signInWithPassword`. Utente registrato e loggato senza email.
- **Send Email Hook**: configurato in Auth → Hooks → Send Email → `send-auth-email` via Resend.
- **Tabella `pending_email_verifications`** salva utenti bypass per verifica notturna.
- **Admin "Confermata"**: usare `email_verified=false` se riga in `pending_email_verifications`, NON solo `auth.users.email_confirmed_at`.

## 🤖 Anti-Bot Registrazione (4 mag 2026)

Difese invisibili a UX umana, bloccano bot dumb sul flusso `register-bypass`:

- **Honeypot field** `regWebsite` nel modal register di `auth.js` — `<input name="website">` nascosto via CSS `position:absolute;left:-9999px;opacity:0;tabindex=-1`. Bot lo riempiono → respinti silenziosamente con finto successo (per non rivelare la trappola).
- **Time-on-form**: `window._regFormStartedAt` settato in `switchAuthTab('register')`. Submit < 2.5s = bot → finto successo.
- **Server-side defense in depth** in `register-bypass/index.ts`:
  - Honeypot check sul body `website` field
  - Blacklist 35+ domini temp-mail (mailinator, tempmail, guerrillamail, ecc.)
  - Pattern probe: `/^[a-z]+_\d{9,}@/i` (es. `asd_1730000000@`) e domini `.invalid|.test|.local|.example`
- **Niente CAPTCHA** voluto: zero attrito UX. L'utente ha esplicitamente preferito difese invisibili (sito non è bersaglio specifico).
- Se in futuro serve aggiungere Turnstile/hCaptcha: punto giusto è `auth.js handleRegister` prima di chiamare `_registerBypass`.
