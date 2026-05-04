# 🗺️ Mappa Strategica Subingresso.it

Manuale operativo per le sessioni AI. Contiene solo informazioni "evergreen": regole, pattern, stato sistema, bug ricorrenti.

## 🎯 Business Focus

- **Core attuale:** Subingresso e compravendita di **posteggi mercatali** (mercati pubblici su suolo pubblico, licenze ambulanti tipo A e B).
- **Espansione futura:** Tutte le **licenze pubbliche** italiane (commerciali, autorizzazioni amministrative, concessioni).
- **NON è un sito di ristoranti, bar o locali** — il settore è esclusivamente commercio ambulante su aree pubbliche.
- Termini corretti nei copy/SEO: "posteggio mercatale", "licenza ambulante", "commercio su aree pubbliche", "subingresso", "autorizzazione amministrativa".
- NON usare promesse "annunci verificati" / "centinaia di annunci" / "migliori offerte" (nessuna verifica reale).

## 📂 Architettura `/js`

- `supabase-config.js`: connessione DB.
- `data.js`: **Il Cervello.** Contiene `MERCI`, `REGIONI`, `COMUNI_IT`, `formatPrice()`, `buildCard()`, `escapeHTML()`, `normalizePhone()`, `phoneToTelLink()`, `isValidItalianPhone()`, `setupPhoneInput()`, `showToast()`, `observeCardViews()`.
- `ui-components.js`: Header/Footer dinamici. Modificare qui per cambiare nav.
- `auth.js`: sessioni, sync profili, popup visitor/welcome, `_acq_*` tracking, `signOut()` (clear cache scope-ate + draft).
- `moderation.js`: filtraggio contenuti IA (client-side). Attualmente NON incluso negli HTML — moderazione effettiva via trigger DB `enforce_annunci_status`.

## 🛡️ Sicurezza & Qualità

- **XSS Prevention:** SEMPRE `escapeHTML()` da `data.js` prima di iniettare testo utente. Mai `.innerHTML` diretto su dati variabili.
- **Supabase RLS:** Verificare RLS dopo modifiche alle query.
- **Validazione:** Ogni campo in `vendi.html` sincronizzato con `submitAnnuncio()` e schema DB.
- **DOMPurify** per blog: `post.content` SEMPRE via `DOMPurify.sanitize()` prima di iniettarlo. Titolo/excerpt/slug usano `escapeHTML()` / `encodeURIComponent()`.

## 🔐 Sicurezza Repository

- **MAI committare `node_modules/`** — già in `.gitignore`. Se GitHub segnala secret esposti, controllare prima `node_modules`.
- **`.gitignore` minimo:** `.vercel`, `node_modules/`, `package-lock.json`, `package.json`
- **Chiavi API/secret** mai in JS committati. Solo env var Supabase (Dashboard → Edge Functions → Secrets).
- **`SUPABASE_ANON_KEY`** in `supabase-config.js` è in realtà la nuova `sb_publishable_*` (la vecchia anon JWT è disabilitata e revocata). Pubblica per design.
- **`SB_SECRET_KEY`** env var nelle Edge Functions = `sb_secret_*`. Sostituisce la vecchia `SUPABASE_SERVICE_ROLE_KEY` JWT (legacy disabilitata + revocata 4 mag 2026 dopo leak su GitHub commit 24079e60).
- **`SB_PUBLISHABLE_KEY`** env var nelle Edge Functions = `sb_publishable_*`. Usata da `send-auth-email` per costruire link verify (param `apikey`).
- **MAI committare chiavi**: nemmeno PATCH SQL temporanei. Applicare via psql `-v` o file in `/tmp` non versionato.

## 🚀 Workflow Pubblicazione (REGOLA D'ORO)

Dopo **OGNI** modifica ai file: `git add . && git commit -m "..." && git push`. Sempre. Senza aspettare richiesta utente.

## 🔒 SECURITY: Cache profilo SCOPE per user_id (4 mag 2026)

**Bug storico fixato**: cache `_vc_nome`, `_vc_tel`, `_profile_nome`, `_profile_tel` erano chiavi globali in localStorage. Su device condiviso il prossimo utente vedeva prefilled nome/tel del precedente in `vendi.html` → poteva pubblicare annuncio con telefono altrui.

**Regole correnti:**
- Tutte le cache profilo SCOPE per user_id: helper `_userKey(base, userId)` in `vendi.html` → `_vc_nome_u_<id8>`, ecc.
- `_prefillFromCache(userId)` richiede userId; senza scope NON legge nulla.
- `prefillContactFromSession()` SOVRASCRIVE sempre i campi se ha dati freschi DB (anche se cache già riempita).
- `sessionStorage._last_prefill_user`: rileva cambio user e svuota i campi prima del prefill.
- Draft listing **NON contiene più nome/tel** + traccia `_userId`. Draft di altro user → scartato.
- `signOut()` in `auth.js` pulisce: chiavi legacy globali, tutte le `_*_u_*` scope-ate, `subingresso_draft_v1`, `_last_prefill_user`.
- **NON aggiungere mai** chiavi localStorage globali per dati utente. Sempre scope per user_id.

## 🚫 SECURITY: `select('*')` su `annunci` da authenticated è VIETATO

Dal 3 mag 2026 (`PATCH_CONTACT_REVEAL_20260503.sql`) `tel`/`email` sono REVOKE per `authenticated`. `select('*')` restituisce 42501.

**Sempre usare select esplicito** con colonne safe (no `tel`, no `email`):
`id, user_id, titolo, descrizione, stato, categoria, tipo, settore, dettagli_extra, regione, provincia, comune, superficie, giorni, prezzo, contatto, data, status, created_at, img_urls, expires_at, visualizzazioni, featured, featured_until, featured_tier, featured_since, video_url`

Per leggere tel/email del proprio annuncio (es. modifica): RPC `get_listing_contact()` (owner-bypass + admin-bypass + rate limit 50/h non-owner). Anche `profiles` per anon è REVOKE: telefono solo via RPC o per owner.

## 🎨 CSS: `<style>` inline DOPO Tailwind sovrascrive le utility

In molti HTML (vendi, valutatore, dashboard) lo `<style>` inline viene caricato **dopo** `css/tailwind.css`. A parità di specificità (`0,1,0`) vince l'ultimo dichiarato → classi custom `.field-input { padding:.75rem 1rem; font-size:.9rem; font-weight:600 }` sovrascrivono `pl-X`/`text-X`/`font-X` di Tailwind.

**Soluzioni** (in ordine di preferenza):
1. `style=""` inline (specificità `1,0,0,0`, batte SEMPRE qualsiasi classe). Best per fix puntuali.
2. Modificare la classe custom direttamente in `<style>`.
3. NON usare `!important`.

**Tailwind precompilato**: solo classi standard (`pl-12`, `pl-16`, `pl-20`...). Mai arbitrary values come `pl-[4.5rem]` (non sono nel CSS compilato → fallback). Per custom: scegliere il più vicino della scala o rebuildare CSS.

## 🖼️ Sistema Profilo Pubblico

- **`profilo.html?id=USER_ID`**: pagina pubblica con avatar, nome, data iscrizione, badge, annunci attivi.
- **Badge profilo**: `getProfileBadges(createdAt, activeListings)` in `data.js`. 5 badge: Nuovo Iscritto (<30gg), In Crescita (1-6m), Affidabile (6-12m), Veterano (>1anno), Top Venditore (5+ annunci).
- **Mini-venditore nelle card**: `buildCard()` usa `USER_NAMES[l.user_id]` (popolato da fetch separato `profiles` con `.in('id', uniqueIds)`) come primario, `l.contatto` fallback. **NON usare join `profiles(...)` nella select annunci** — rompe PostgREST.
- **Avatar upload**: bucket Supabase Storage `avatars` (pubblico). Usare `upsert` non `update` su `profiles.avatar_url`.
- **Modal profilo in dashboard**: aperto da `goToProfilo()`. Su mobile bottom sheet (`items-end`, `max-h-[92dvh]`). NON esiste più tab "Profilo".
- **Cache `USER_AVATARS`/`USER_NAMES`** globali in `data.js`. Aggiornano tutte le card se l'utente cambia nome.

### Onboarding widget (dashboard)
- 4 step: email confermata, telefono profilo, avatar, primo annuncio. Si nasconde a 4/4.
- **"Carica foto profilo"**: apre direttamente file picker via `document.getElementById('avatarInput').click()` (non più redirect a tab profilo). Refresh widget + toast dopo upload.
- **Overlay upload avatar**: `#avatarUploadOverlay` fullscreen blur con spinner + 4 messaggi rotanti ogni 1.8s con fade ("Sto preparando…", "Caricamento sicuro…", "Quasi fatto…", "Salvataggio nel tuo profilo…") + banner "Non chiudere la pagina" + `beforeunload` guard. Spinner anche su `#welcomeAvatar`. Cleanup robusto in `finally`.

## 📊 Visualizzazioni Annunci

- Colonna `visualizzazioni integer DEFAULT 0` in `annunci`. Funzione DB: `increment_views(listing_id uuid, amount integer)` SECURITY DEFINER con GRANT a anon/authenticated.
- Anteprima card: +1 via `observeCardViews()` in `data.js` — scroll listener con `getBoundingClientRect`. Chiamarla dopo ogni render `buildCard()`.
- **`_supabase.rpc().catch()` NON ESISTE** in Supabase JS v2 — usare `async/await`.
- Visita diretta: random 1-2 views (`Math.random() < 0.5 ? 1 : 2`) via RPC in `annuncio-detail.js`.
- **`visualizzazioni` NON va nella select principale di `annuncio-detail.js`** — fetcharlo in IIFE asincrona isolata.
- Display: `#viewCount` + `#viewCountVal` nel title block.

## 💬 Chat / Conversazioni (`messaggi.html`)

- Lista mostra **titolo posteggio** (primario) + **nome venditore** (secondario blu).
- Header chat: titolo posteggio in `#chatOtherName`, "{nome venditore} · Vedi annuncio →" in `#chatListingLink`.
- Mobile: due pannelli (`convPanel` + `chatPanel`), si alterna visibilità. `backToConversations()` torna alla lista. NON fondere i div.
- **Join profiles in `conversazioni` rompe PostgREST** (stesso bug di annunci). 3 fetch separati: (1) conv+annuncio, (2) profiles `.in('id', userIds)`, (3) lastMessage per conv. Merge manuale.

## 🔍 SEO & Google

- `api/sitemap.js`: sitemap dinamica Vercel, auto-include annunci attivi + blog + 141 città. `vercel.json` rewrite `/sitemap.xml → /api/sitemap`.
- Google Search Console verificato (file `googlead37f27accd4fd2b.html` in root).
- JSON-LD `Product+BreadcrumbList` in `annuncio-detail.js`. JSON-LD `ItemList` in `annunci.js`. JSON-LD `NewsArticle` in `blog.html` (era `BlogPosting`, cambiato per Discover).
- Pagine geo `/annunci/[citta]` SSR in `api/annunci-citta.js` con FAQPage + AggregateOffer + ItemList + BreadcrumbList. Capoluoghi (137) hanno pagina speciale anche senza annunci. Comune ISTAT non capoluogo senza annunci → 302 a `/annunci?q=<nome>`. Slug invalido → 404 + noindex.
- `data/comuni.json` (1.4 MB, 7904 record): bundle statico, validazione slug + redirect.

## 🃏 Card Annunci (`buildCard` in `data.js`)

- La card è un `<div class="group ...">` NON un `<a>` — link separati: cover/titolo/freccia → `annuncioUrl`, venditore → `profiloUrl`. NON tornare a wrapper `<a>` unico.
- Link venditore: `<a>` reale a `profilo.html?id=USER_ID` con `onclick="event.stopPropagation()"`.
- **Bordo laterale**: `border-l-[3px] border-l-emerald-400` Vendita, `border-l-blue-400` Affitto. Featured: niente striscia, ring dorato.
- **Sfondo card**: `bg-emerald-50/70` Vendita, `bg-blue-50/70` Affitto. Featured: `bg-gradient-to-b from-amber-50/50 to-white`.
- **`settore` NON è colonna diretta** di `annunci` — è in `dettagli_extra` o non esiste.
- Cuoricino preferiti in alto a destra. `SAVED_IDS` Set globale.

## 📐 Dimensioni Immagini

- Card anteprima: `h-20` mobile, `h-28` desktop.
- Pagina annuncio: `h-36` mobile, `md:h-64` desktop (ridotto -20% rispetto al primo design).

## 🐛 Bug Storici Generalizzabili (NON ripetere)

- **`expires_at`** può non esistere nel DB — query in `annunci.js` non filtra. NON reintrodurre il filtro finché non popolato per tutti.
- **`LISTINGS` in `data.js` è vuoto** — solo Supabase. Non rimettere demo.
- **Status annunci**: `checkContent()` sincrona in `vendi.html` imposta `status: 'active'/'pending'` direttamente all'insert. NON usare insert-pending + setTimeout-update (fallisce per RLS).
- **`let history`** in JS causa crash silenzioso (conflitto `window.history`). Usare `stepHistory` o altro nome.
- **Input numerici con locale italiano**: `type="text" inputmode="numeric"` + parsing manuale (strip punti, replace virgola→punto, parseFloat).
- **Immagini annunci**: salvate in `dettagli_extra.images` E in `img_urls`. Devono essere in entrambi.
- **`tel`/`email` mai esposti a anon**: `annuncio-detail.js` `select(...)` senza tel/email. Fetch RPC `get_listing_contact()` solo dopo `auth.getUser()` confermato.
- **Trigger `trg_enforce_annunci_status`**: forza `status='pending'` su INSERT non-admin, blocca promozione ad active via UPDATE.
- **Validazioni `vendi.html`**: prezzo 100€-10.000.000€. Descrizione min 10 char. Anti-spam 1 min.
- **NON join `profiles(...)` nelle select** di annunci/conversazioni — rompe PostgREST. Sempre fetch separato + merge.
- **`_supabase.rpc().catch()` NON ESISTE** v2 — usare async/await.
- **Regex Python multi-line `[\s\S]*?`** per riscrivere codice è pericolosa: ha già cancellato funzioni intere. Edit puntuale > regex.
- **Caratteri Unicode invisibili** (U+200A, U+0300, 0x01) iniettati da editor rompono replace silenziosamente.

## 🤖 Blog Generator (`js/blog-generator.js`)

- 11 chiamate API sequenziali (~2-3 min). Gira nel browser: chiudere la pagina interrompe.
- Ogni call con suo `maxTokens`: contenuto 4000, revisione 8000, metadati SEO 500.
- Step finale chiede solo `title/slug/excerpt` (NON content nel JSON) — content usato direttamente da JS.
- Pulizia markdown: regex locale prima, AI solo se restano tabelle pipe.
- Anti-duplicati: prompt con lista temi vietati + check similarità titolo (>50% parole).

## 📝 Stile Editoriale Blog

- Target lunghezza: 2.200-3.200 char per articoli normali. NIENTE articoli enciclopedici lunghi.
- Stile: paragrafi 2-3 righe, frasi nette + una più lunga ogni tanto, numeri concreti (`4.500€ INPS`, `40-80% del fatturato`), espressioni reali ambulante (*"fai conto"*, *"spendi e dormi"*, *"al banco"*), no trattini lunghi (—), no `"esploriamo" / "approfondiamo" / "in conclusione"`, no liste perfette uniformi.
- Grassetti 7-15 per articolo sulle frasi chiave del paragrafo (non parole singole banali).
- Articoli "Bandi posteggi": stile semplificato per non-madrelingua (frasi 10-15 parole, termini tecnici spiegati al primo uso).
- CTA finale verso `/vendi.html` e `/annunci.html`.
- Immagini cover: Pexels CDN con resize on-the-fly (`?auto=compress&cs=tinysrgb&w=X&h=Y&fit=crop`). Salvare URL nudo in DB, helper `_pexelsUrl(base, w, h)` in blog.html aggiunge i parametri.

### Tabella `blog_posts`
`id, slug, title, excerpt, content, category, author, published_at, cover_image_url`. **NON ha `updated_at`** — per forzare freshness aggiornare `published_at`.

## 💎 Sistema Vetrina a Pagamento

- **Tier:** 10d €19,90, 30d €39,90, 90d €59,90 (MIGLIOR VALORE). Prezzi hardcoded server-side in `create-checkout-session/index.ts`.
- **Schema DB:** `annunci.featured bool`, `featured_until timestamptz`, `featured_tier text`, `featured_since timestamptz`. Tabella `payments` con RLS.
- **Trigger `enforce_annunci_status` esteso:** blocca anche modifiche manuali a `featured*` da non-admin/non-service_role. Solo webhook può promuovere.
- **Edge Functions:**
  - `create-checkout-session` — **Verify JWT = ON**, deployata con `--no-verify-jwt` (gateway 401 con sb_publishable_*). Token validato manualmente dentro la function.
  - `stripe-webhook` — **Verify JWT = OFF** (Stripe non manda JWT). Verifica firma HMAC-SHA256 con tolleranza 5min anti-replay. Estende `featured_until` se già in vetrina.
- **Frontend:** `dashboard.html` modal vetrina mobile-friendly (bottom sheet su mobile). `data.js` helper `isListingFeatured(l)`. `annunci.js` ordinamento featured-first. `annuncio-detail.js` banner gradient amber-orange.
- **Idempotenza:** upsert su `stripe_session_id` unique in `payments`.
- **Cron `unfeature-expired-daily`:** `'0 3 * * *'` chiama `unfeature_expired()`.
- **Secrets:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
- **CRITICO fetch Edge Functions dal browser:** sempre `'apikey': SUPABASE_ANON_KEY` negli headers oltre ad `Authorization: Bearer <token>`. Senza apikey → 401.
- **Privilegio Vetrina post lifetime:** vetrina 30gg estende post a max 200gg da `created_at`, vetrina 90gg max 300gg. Cap non superabile.
- **Admin Vetrina gratuita**: `adminGrantVetrina(30|90)` scrive `featured_tier='admin_free'`. `adminRevokeVetrina(id)` azzera.
- **Card featured redesign**: glow box-shadow aureo, sfondo gradient amber-50/50→white, barra top 3px, badge crown + animate-pulse, footer "Annuncio in Vetrina ★★★★★".

## 🎰 Lotteria Welcome Vetrina

- Colonne `profiles`: `welcome_lottery_eligible bool DEFAULT true`, `welcome_lottery_won bool DEFAULT false`.
- Eleggibilità SOLO da popup/promo: `sessionStorage._reg_src='popup'` settato prima del modal registrazione. Upsert profilo legge il flag — se assente → `eligible=false`.
- RPC `try_welcome_lottery(p_user_id)`: controlla eligible + entro 30gg → tira dado (`random() < 0.001`, 0,1%) → setta `eligible=false` sempre; se vince `won=true`. Risultato via ruota canvas (4 spicchi, 4 sec easing-out).
- Alla pubblicazione del primo annuncio: RPC `grant_welcome_vetrina(annuncio_id, user_id)` → applica 30gg con `featured_tier='welcome_lottery'`.

## 📬 Email — Sistema Completo (Resend)

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

## 🛡️ Pannello Sicurezza Admin

- **`pendingReviewSection` sopra "Crescita del sito"** in `dashboard.html`. Bordo amber-300, shadow-md. Hidden by default → visibile se `loadPendingListings()` trova data.length > 0. Errore mostrato anche se hidden.
- **`securityPanel`** sempre visibile (gradient slate scuro):
  - 4 badge stats: signup ultima ora (red ≥20), 24h, 7g, non confermati 24h (red ≥10).
  - `securitySuspectSection`: account che matchano pattern probe/scanner (`.invalid$`, `.test$`, `.local$`, `.example$`, domini temp-mail, `^word_unixtimestamp@`, keyword `rlstest|hunter_|owasp|sqlmap|injection|xsstest|burpcollab`). Bottone Elimina.
  - `securityAlertsSection`: ultime 5 entries di `admin_alerts_log` con `issues_count > 0`.
  - `securityAllClear`: 0 sospetti + 0 anomalie.
  - Bottone "Esegui check" → POST a `admin-anomaly-check`.
- **RPC `admin_security_overview()`** SECURITY DEFINER, check `is_admin = true`. Ritorna jsonb con signups + suspect + alerts.
- **RPC `admin_listings_per_regione()`** lista regioni con count annunci attivi.
- **`auth.audit_log_entries` è VUOTA** — per IP/UA reali serve Logs Explorer Dashboard.

## 🔔 Alert Anomalie

- Edge function `admin-anomaly-check` cron `0 9 * * *`. Tabella `admin_alerts_log` rate-limit 12h.
- Check: annunci 24h=0 (crit), iscritti 7d=0 (crit), page views 24h<5 (warn), pending >3g (warn), spike signup 1h>20 (crit anti-bot).
- Email styled via Resend a tutti gli admin solo se ≥1 issue.

## 🔍 Filtri Annunci

- **Sidebar mobile** `hidden lg:block`. Bottone "Filtri" apre bottom-sheet `#mobileFiltersSheet`.
- Input `m_*` (`m_fRegione`, `m_fTipo`, `m_fStato`, `m_fPrezzoMax`, `m_fSup`). `applyMobileFilters()` copia `m_` → sidebar.
- **Filtro giorni** (multi-select chip): `#dayChipsDesktop` + `#dayChipsMobile` in `annunci.html`. CSS `.day-chip` / `.day-chip.selected`. Logica in `js/pages/annunci.js`: `_normalizeDayName()` accent-insensitive, `_getSelectedDays()`, `toggleDayChip(btn)`. Filtro: intersezione `l.giorni.split(',')` con selected. Backfill DB: `PATCH_GIORNI_ACCENT_BACKFILL_20260504.sql` uniforma accenti.
- **Ricerca**: searchBar lancia `applyFilters()` solo su click "Cerca" o Invio (non più live). Filtri sidebar restano live `onchange`.
- **Ricerca per luogo**: se `getCityCoords` riconosce il testo → mostra annunci entro 200km ordinati per distanza.
- **`PROVINCE_COORDS` in `data.js`**: aggiungere comuni se ricerca vicinanza non li trova.

## 🔐 Admin Check

- NON email hardcodata — legge `profiles.is_admin = true`.
- Colonna: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;`
- Assegnare admin: `UPDATE profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = '...');`
- In `dashboard.html`: `_isAdmin` set dopo fetch profilo.

## 🧙 Form `vendi.html` — Wizard 5 Step

- 5 step. `fTipo`, `fMerce`, `fGiorni` sono `<input type="hidden">` aggiornati via JS (non select). `stato` radio hidden via `selectStato()`.
- Step 1 auto-avanza al click. Step 5 auto-suggest titolo da comune+tipo+settore.
- Prezzo: 100-10.000.000€, **input via `style=""` inline** (padding/font/color) per battere la cascade `.field-input`.
- Anti-spam: 1 minuto. Timestamp PRIMA dell'insert, rimosso su errore.
- **Telefono OBBLIGATORIO** (commit `3b5ac17`): `required` HTML5, asterisco rosso, banner `#missingPhoneBanner` se prefill non trova telefono nel profilo, bordo giallo, focus automatico, messaggio errore esplicito.
- **Cache name/tel scope per user_id** (vedi sezione SECURITY).
- **JWT auto-refresh**: `_isSessionExpired` + `_refreshSessionIfNeeded`. Se INSERT fallisce con JWT/auth/RLS, refresh + retry una volta.
- **Fallback sessione `_getSessionForSubmit`**: prova getSession, poi setSession da localStorage, poi sessione stored.
- **Login timeout 12s** in `auth.js` `handleLogin` (Promise.race).
- **Errore submit dettagliato**: `Errore [code]: <message Supabase reale>` (max 160 char).
- **Direct fetch INSERT** (`_directInsertAnnuncio`): bypass supabase-js che hangava 45s.
- **Upload foto via fetch diretto** Storage con timeout 25s, progress "1/N".
- **Cache localStorage `_profile_nome_u_<id>`/`_profile_tel_u_<id>`** (scope) per prefill istantaneo.
- **Smart name**: evita duplicazione "Ardit Kycyku Kycyku" (cognome già in nome).
- **Bug noti vendi.html**:
  - Anti-spam NaN: `parseInt(localStorage.getItem(lastPostKey)) || 0` (string coercion bug).
  - Rimozione foto: `WeakMap` `_fileMap` mappa div→File. `removeFile()` usa `_files.indexOf(div._fileRef)` non l'indice DOM.

## 💶 Prezzi Affitto — Annuali

- DB salva **prezzo annuale** per affitti.
- Display: solo annuale ovunque. Card `€ X /anno`. Pagina annuncio `€ X` + `/anno` inline + sottotitolo `/anno · trattabile`.
- Badge card: "Affitto" (non "Affitto mensile").
- `formatPrice()` in `data.js`: affitto → `€ X /anno`, vendita → `€ X`.
- **`#prezzoMobile`** in `annuncio.html`: elemento `lg:hidden` sotto il titolo, aggiornato da `annuncio-detail.js`.

## 🗑️ Eliminazione Annunci & Account

- **Annunci**: `status='deleted'` (soft delete). NON DELETE fisico.
- `annunci.js` filtra `.neq('status','deleted')`. `dashboard.html` `loadMyListings()` idem.
- Admin "Tutti gli annunci" con tasto Elimina (`deleteAnnuncio(id)`).
- **Account**: SQL `delete_my_account()` SECURITY DEFINER cascata: messaggi → conversazioni → notify_alert_log → annunci → profiles → auth.users. NON `user_id = NULL` su annunci (NOT NULL).
- Sezione "Zona pericolosa" nel modal profilo, richiede di scrivere `ELIMINA`.

## 🔑 Recupero Password

- Link "Password dimenticata?" nel form login → tab `forgot`.
- `handleForgotPassword()` chiama `resetPasswordForEmail` con `redirectTo: 'https://subingresso.it/reset-password.html'` HARDCODED — NON `window.location.origin`.
- `reset-password.html`: rileva token URL, ascolta `onAuthStateChange PASSWORD_RECOVERY`, timeout 6s → "Link non valido". No token → redirect home.
- Supabase Auth → URL Configuration: `Site URL = https://subingresso.it`, `Redirect URLs` include `https://subingresso.it/**`.
- **Email templates IT** in Authentication → Email Templates ("Confirm signup", "Reset password"). Tasto unico `{{ .ConfirmationURL }}`.
- **Rate limit Supabase**: 1 email/h per indirizzo. Test con alias Gmail `+test1`/`+test2`.

## 📞 Telefono — Validazione & E.164

- **`phoneToTelLink(raw)`** in `data.js`: ritorna E.164 strict (`+39XXXXXXXXXX`). Riconosce: già-E.164, `0039`, `39` (12-13 cifre), cellulare `3xx` (9-10 cifre), fisso `0xx` (9-11 cifre).
- **`isValidItalianPhone(raw)`**: strict `/^\+39\d{9,11}$/` dopo normalize.
- **`normalizePhone(raw)`**: ritorna formato display locale `347 1234567` per UI/storage.
- **`setupPhoneInput(inputEl, opts)`**: widget UX hint live (grigio vuoto / verde valido + preview / rosso invalido). Normalize on blur.
- Wirate in: `auth.js` `regTelefono`, `vendi.html` `fTel`, `modifica-annuncio.html` `fTel`, `dashboard.html` `pTelefono`.
- Bottone "Chiama" usa `phoneToTelLink()` → `tel:+39...`. WhatsApp non toccato.

## ⚡ Performance

- **`updateAuthNav()` in `auth.js`** usa `getSession()` (localStorage, no rete) per render istantaneo. Badge messaggi non letti in IIFE async separata. NON tornare a `getUser()`.
- **Skeleton loader `annunci.html`**: 6 card placeholder pulse, sostituite dal primo `applyFilters()`.
- **Tailwind precompilato** `css/tailwind.css?v=2` (~50KB minified). Build: `npx tailwindcss -i tailwind.input.css -o css/tailwind.css --minify`. NO più CDN.
- **Page views tracking interno**: tabella `page_views`. Tracker `js/page-view-tracker.js` su 17 pagine pubbliche, dedup per (visitor, path, session).
- **RPC `admin_page_views_stats()`** total/today/monthly/yearly/daily-30. RPC `admin_funnel_stats()` 5 step (signups, primo annuncio, telefono profilo, contatto, messaggio).

## 🔔 Notifiche UI

- **`showToast(message, type)`** in `data.js` — globale. Tipi: `success`/`error`/`warning`/`info`. Bottom-right, auto-dismiss 4s. Sostituisce `alert()`.
- **`showConfirm({title, message, okLabel, variant})`** in `dashboard.html` — Promise<bool>. Varianti: `danger`/`warning`/`alert`/`admin`. Sostituisce `confirm()`. Solo dashboard.
- **NON usare `alert()` o `confirm()` nativi.**

## 📣 Blog Promo Inline

- `_insertBlogPromo(html)` in `blog.html`: banner dopo il 3° `</p>`. Solo non loggati.
- Click setta `sessionStorage._reg_src='popup'` → eleggibile lotteria.
- < 3 paragrafi → no banner.

## 🏠 Home Page Sezioni

- Ordine: Hero → Ultimi Annunci (12 card) → Vendi in 3 passi → FAQ.
- `loadRecentListings()` `.limit(12)`, `created_at DESC`, fallback `LISTINGS.slice(0,12)`.
- Banner mobile sopra "Vendi in 3 passi": link verde a `valutatore.html`.

## 🧮 Valutatore (`valutatore.html`)

- 6 step. **Bug critico**: NON usare `history` come var (conflitto `window.history`). Usare `stepHistory`.
- **Formula** (calibrata 1 mag 2026):
  ```js
  base = factors.fatturato * 1.18;
  moltFreq = (frequenza === 'fiera') ? durataFiera : frequenza;
  totale = base * moltFreq * zona * settore * posizione * anni * stagionalita;
  rentRaw = totale * 0.25;
  rentCap = fatturato * 0.58 * stagionalita;
  rentAvg = Math.min(rentRaw, rentCap);
  ```
  Mult: giornaliero=1.5/settimanale=1.0/fiera=durataFiera (1g=0.3, weekend=0.5, sett+=0.7); zona storica=2.0/capoluogo=1.25/rionale=0.65; alimentare=1.3, non-alim=1.0; angolare=1.25/linea=1.0; storica=1.25/recente=1.0; stagionale=0.7/annuale=1.0.
- **`base * 1.18`** è scelta business (sopravvalutazione +18% per spingere a pubblicare). NON oltre +20%.
- **Quando si toccano moltiplicatori** aggiornare `_FREQ_LABELS` / `_ZONA_LABELS` / `_SETT_LABELS` / `_POS_LABELS` / `_ANNI_LABELS` / `_STAG_LABELS` / `_FIERA_LABELS` (chiavi devono matchare il nuovo valore — `String(1.0)='1'`). Senza match `_label()` ritorna null → log Supabase skippato.
- **Step 3 zona terza opzione**: label utente "**Piccolo Comune / Quartiere**" (rinominata, prima "Mercato Rionale"). Tag interno `_ZONA_LABELS['0.65']` resta `'rionale'` per log storici.
- **Tabella `valutatore_logs`** + RPC `link_valutatore_to_user`/`link_valutatore_to_annuncio`. RLS owner-SELECT.
- **`/api/geo.js`**: serverless Vercel, `{country, region}` da headers `x-vercel-ip-country`.
- **Tracking ondata 1**: `valutatore_logs` ha `referrer`, `utm_*`, `landing_path`, `device_type`, `country`, `region`, `tempo_compilazione_sec`, `algoritmo_version`.
- **Step 6**: cessione (verde) sopra, affitto annuo (blu) sotto. Numero con spazio sottile separatore migliaia (`toLocaleString('it-IT').replace(/\./g,' ')`).
- **`#disclaimer`** in fondo (`scroll-mt-20`): "stima orientativa, ogni mercato unico, prezzi variano, non è perizia".

## 📐 Saved Listings (Preferiti)

- Tabella `saved_listings (user_id, annuncio_id, created_at)` RLS owner-only.
- Cuoricino in `data.js buildCard()` + `annuncio.html`.
- Click anonimo → modal registrazione + `_pending_save_listing` in sessionStorage. Post-signup `processPendingSaveListing()`.
- `SAVED_IDS` Set globale in `data.js`. `loadSavedListingsCache()` in auth.js dopo login.
- Nascosto sui propri annunci.

## 🧭 Header Nav

- Layout: `flex justify-between` <lg, `grid grid-cols-3` da lg.
- Ordine: **Calcolatore | Annunci | Blog**.
- Bottoni: messaggi/profilo `w-9/w-10 rounded-lg/xl bg-slate-100`. Icona `fa-user`.
- `dashboard.html` ha header hardcoded ma **markup allineato 1:1 a `UI.header`** di `ui-components.js` (logo responsive 36→44px, bottone "+" sempre visibile come icona su mobile). Se modifichi `ui-components.js` aggiornare a mano anche dashboard.html.

## 📅 Scadenza Post

- `expires_at` 100 giorni di default. SQL: `ALTER TABLE annunci ADD COLUMN IF NOT EXISTS expires_at timestamptz;`
- Vetrina 30gg → cap 200gg. Vetrina 90gg → cap 300gg. Cap non superabile.
- Logica in `adminGrantVetrina(days)` + `stripe-webhook` su `checkout.session.completed`.
- **NON filtrare su `expires_at`** finché non popolato per tutti.

## ⚠️ Deploy & Troubleshooting Supabase

### CLI
- `./scripts/.bin/supabase.exe db query --linked --file <file.sql> --output json` per SQL diretto.
- Token in `.claude/settings.local.json` `env.SUPABASE_ACCESS_TOKEN`.
- Edge functions: `npx.cmd supabase functions deploy <name> --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt`.
- Management API alternativa: `POST https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query` con `Authorization: Bearer <token>`.

### Note
- **Asterischi cron mangiati dall'SQL Editor web**: copiando `'0 9 * * 1'` a volte rimuove asterischi → "invalid schedule". Riscriverli a mano o copiare da file `.sql` locale.
- **Webhook UI vs trigger pg_net**: webhook UI bloccano INSERT 15-20s e non includono `old_record`. Sempre trigger custom async via `pg_net`.
- **`pg_net.http_post`** body è `jsonb` non `::text`.
- **Supabase CLI npm globale fallisce su Windows** — usare standalone (`scripts/.bin/`) o Dashboard.

### File SQL chiave (in repo, non eliminare)
- `SETUP_DEF_SUBINGRESSO.sql` (master setup, sezione 12 con RLS PII).
- `SETUP_VETRINA.sql`, `SETUP_STRIPE.md`, `SETUP_VALUTATORE_LOGS.sql`, `SETUP_WELCOME_VETRINA.sql`, `SETUP_WEEKLY_EMAILS.md`, `SETUP_EMAIL_BYPASS.sql`.
- `PATCH_*` per modifiche idempotenti riapplicabili.
- `DIAGNOSE_PUBLISH_SLOW.sql` per ispezionare trigger/coda pg_net.

### Trigger annunci attivi
- `notify_alert_trigger` (async, alert acquirenti).
- `notify_seller_trigger` (async, "ricevuto/online/rifiutato").
- `trg_enforce_annunci_status` (BEFORE, forza pending non-admin, blocca featured non-admin).

### Cron pg_cron attivi
- `unfeature-expired-daily` 03:00 — cleanup vetrine scadute.
- `increment-featured-views` ogni 6h.
- `weekly-buyer-digest` Lun 09:00 (TODO: spalmare).
- `weekly-seller-stats` Lun 09:00 (TODO: spalmare).
- `admin-anomaly-check` 09:00 daily.
- `engagement-reminders` 10:00 daily.

## 🌐 Cache Versions Correnti

- `data.js?v=9` (cuoricino + SAVED_IDS + toggleSaveListing).
- `auth.js?v=11` (4 mag 2026 — anti-bot: honeypot + time-on-form + blacklist temp-mail + pattern probe).
- `annuncio-detail.js?v=10` (censorPhonesHTML + bookmark).
- `css/tailwind.css?v=2` (precompilato).
- `page-view-tracker.js?v=1`.
- **Bumpare `?v=` quando modifichi un file caricato con cache busting.**

## 📰 Articoli "Bandi" — Pattern Replica

Pivot da "tutorial generico bandi" a "lista bandi reali" (test pilota Lombardia). Replicare alle altre 19 regioni se metriche Search Console migliorano.

- Slug: `bandi-posteggi-mercatali-{regione}`.
- Categoria DB: `Bandi`.
- Lunghezza: 2.500-5.500 char. Stile: paragrafi 2-3 righe, frasi nette, numeri concreti, espressioni reali.
- Struttura: intro + "Esempi di bandi pubblicati di recente" (5-7 voci con `<h3>` per Comune) + "Dove cercare oggi" + "Cosa serve" + "Tempi e graduatoria" + "Se non vuoi aspettare" → CTA.
- Per ogni bando: mercato/giorno, dimensione, scadenza, modalità invio, link Comune.
- **Onestà esplicita** intro: "quasi tutti scaduti — pattern si ripete ogni anno". Evita bounce.
- Bumpare `published_at` a `now()` per refresh `dateModified`.

## 🐌 Pubblicazione Annuncio — Lessons Learned

- Tutti i webhook UI sync rimossi (30 apr 2026): annunci aveva 5 webhook che bloccavano INSERT 15-20s. Sostituiti con 2 trigger custom async via pg_net. INSERT < 800ms post-fix.
- **NON ricreare webhook UI dalla Dashboard.**
- Timeout INSERT su `annunci` = 45s in `vendi.html` (`_withTimeout`).

## ⏳ TODO Aperti

1. **Indicizzazione Search Console**: continuare ~10 URL/giorno. Lista in `C:\Users\utente\Desktop\indicizzazione-search-console.txt` (utility, non parte del repo).
2. **Metriche articolo Lombardia bandi**: monitorare 7-14 giorni → decisione GO/NO-GO replica alle altre 19 regioni.
3. **Annunci Demo**: 10 annunci finti (Carla M., Marco V.) admin. Da cancellare quando ci saranno 30+ annunci reali.
4. **Privacy policy**: 3 placeholder `[NOME TITOLARE]`, `[INDIRIZZO + P.IVA]`, `[EMAIL CONTATTO]` da compilare prima del go-live legale.
5. **Spalmare 2 cron settimanali su giorni diversi** (5 min, allunga vita free Resend).
6. **Search Console "Pagina con reindirizzamento"**: canonical valutatore + strip `.html` da href interni.
7. **CSP**: 1 settimana di lavoro, da pianificare.

### Bug minori segnalati ma non urgenti
- `moderation.js` non incluso in HTML (mitigato da trigger DB).
- Link interni `annuncio.html?id=` vs `/annuncio?id=` bypassano SSR (impatto SEO minimo).
- Admin hardcoded in `setup-database.sql` vecchio (in prod usate già `is_admin`).
- UPDATE policy senza `WITH CHECK` (Postgres riusa USING).
- Bug foto `modifica-annuncio.html` (`img[src^="http"]` fragile).

## 🚨 SECURITY Open Vectors

- `profiles.telefono` accessibile a `authenticated` per non rompere altre query (vendi.html prefill, dashboard own profile). Vector secondario scrape telefoni profili senza context annuncio.
- Dump completo schema (`supabase db dump --linked --schema public`) per allineare repo a prod (manca: featured*, expires_at, visualizzazioni, page_views, valutatore_logs, saved_listings, alerts).

## 💡 Strategia Monetizzazione

- **NON puntare al volume annunci** ma **lead gen finanziaria verticale**.
- **Tier 1**: microcredito (PerMicro, Banca Etica).
- **Tier 2**: prestiti consumer (Cofidis/Findomestic/Compass/Younited).
- **Tier 3**: broker creditizi OAM (Auxilia, Credipass, BPIfutura) — ingresso più rapido.
- Modelli CPL EUR 15-50 o CPA 1-5%.
- **Lead capture progressive**: mai chiedere telefono al primo contatto. Email+password al signup. Nome/telefono solo quando serve (pubblicazione, alert SMS, finanziamento).
- **Espansione futura** a edicole, autoscuole, compro oro (TAM affine, no leader verticale).
- **Plateau utenti realistico**: 10-20k registrati, 2.500-6.000 MAU.
- **Costi infra a regime**: anno 1 €0-20/mese (free), anno 2-3 €20-40/mese (Resend Pro), plateau €30-50/mese.
- **Stack ottimizzato futuro** (>2k utenti): Cloudflare Pages (sostituisce Vercel) + Cloudflare R2 (sostituisce Supabase Storage) + Brevo (sostituisce Resend).
