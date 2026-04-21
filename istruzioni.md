# 🗺️ Mappa Strategica Subingresso.it (Guida per Gemini)

Questo file è il "Manuale Operativo" per Gemini. Serve a garantire modifiche sicure, veloci e a basso consumo di contesto.

## 🎯 Business Focus (IMPORTANTE)

- **Core attuale:** Subingresso e compravendita di **posteggi mercatali** (mercati pubblici su suolo pubblico, licenze ambulanti tipo A e B).
- **Espansione futura:** Tutte le **licenze pubbliche** italiane (licenze commerciali, autorizzazioni amministrative, concessioni).
- **NON è un sito di ristoranti, bar o locali** — il settore è esclusivamente il commercio ambulante su aree pubbliche e le licenze/autorizzazioni pubbliche.
- Nelle descrizioni, copy e SEO usare sempre termini corretti: "posteggio mercatale", "licenza ambulante", "commercio su aree pubbliche", "subingresso", "autorizzazione amministrativa".

## 🧠 Strategia di Gestione Contesto (Efficienza)

1. **Approccio Chirurgico:** NON leggere mai interi file HTML o JS se non necessario. Usa `grep_search` per trovare le righe interessate.
2. **Uso dei Sub-Agenti (Mandatorio per Task Complessi):**
   - **`codebase_investigator`**: Per analisi architetturali o ricerche su più file.
   - **`generalist`**: Per modifiche ripetitive o batch (es. aggiornare 3+ file contemporaneamente).
   - *Obiettivo:* Riassumere il lavoro pesante in un unico messaggio nella chat principale.
3. **Memoria di Progetto:** Usa `save_memory(scope='project')` per salvare fatti strutturali (schema DB, colori, API key simulate) che devono persistere tra le sessioni.
4. **Monitoraggio Contesto (Mandatorio):** 
   - Alla fine di ogni messaggio, fornisci una stima del consumo del contesto.
   - Dopo una funzione pesante o dopo circa 10-15 messaggi, suggerisci esplicitamente all'utente di aprire una nuova chat per mantenere le performance elevate.

## 📂 Architettura & Core Logic (Cartella `/js`)

- `supabase-config.js`: Connessione DB.
- `data.js`: **Il Cervello.** Contiene `MERCI`, `REGIONI`, `COMUNI_IT`, `formatPrice()`, `buildCard()`.
- `ui-components.js`: Header/Footer dinamici. Modifica qui per cambiare menu o navigazione.
- `auth.js`: Sessioni e sync profili.
- `moderation.js`: Filtraggio contenuti IA (client-side).

## 🛡️ Protocolli di Sicurezza & Qualità

- **XSS Prevention:** Usa SEMPRE `escapeHTML()` da `data.js` prima di iniettare testo fornito dall'utente. Mai `.innerHTML` diretto su dati variabili.
- **Supabase RLS:** Verifica sempre la Row Level Security dopo modifiche alle query.
- **Validazione:** Ogni campo in `vendi.html` deve essere sincronizzato con la funzione `submitAnnuncio()` e lo schema DB.

## 🔐 Sicurezza Repository (REGOLE CRITICHE)

- **MAI committare `node_modules/`** — già in `.gitignore`. Se GitHub segnala secret esposti, controllare prima se è colpa di node_modules entrato per errore.
- **`.gitignore` minimo obbligatorio:** `.vercel`, `node_modules/`, `package-lock.json`, `package.json`
- **Chiavi API e secret** non vanno mai in file JS committati. Usare solo variabili d'ambiente Supabase (Dashboard → Edge Functions → Secrets).
- **`SUPABASE_ANON_KEY`** in `supabase-config.js` è pubblica per design — non è un secret da nascondere.
- **`SUPABASE_SERVICE_ROLE_KEY`** è solo nelle Edge Functions come env var — MAI nei file JS del frontend.

## 🚀 Workflow di Pubblicazione (GitHub/Vercel)

### 🚨 REGOLA D'ORO (Mandatoria)
Dopo **OGNI** modifica ai file, esegui **SEMPRE E IMMEDIATAMENTE** il push per attivare la build su Vercel. Non aspettare che l'utente lo chieda:
1. `git add .`
2. `git commit -m "Descrizione precisa della modifica"`
3. `git push`

## 🖼️ Sistema Profilo Pubblico (Aggiunto Aprile 2026)

- **`profilo.html?id=USER_ID`**: pagina pubblica con avatar, nome, data iscrizione, badge, annunci attivi del venditore.
- **Badge profilo**: funzione `getProfileBadges(createdAt, activeListings)` in `data.js`. 5 badge: Nuovo Iscritto (<30gg), In Crescita (1-6m), Affidabile (6-12m), Veterano (>1anno), Top Venditore (5+ annunci).
- **Seller card in `annuncio.html`**: sidebar mostra avatar+nome+badge+link al profilo. Popolata da `annuncio-detail.js` con query separata a `profiles`.
- **Mini-venditore nelle card**: `buildCard()` mostra iniziale+nome usando `l.contatto` (già in `annunci`). NON usare join `profiles(nome, avatar_url)` nella select — rompe le query perché PostgREST non riconosce la relazione.
- **Avatar upload**: bucket Supabase Storage `avatars` (pubblico). Usa `upsert` non `update` per salvare `avatar_url` in `profiles`. Bucket creato via `SETUP_DEF_SUBINGRESSO.sql`.
- **Modal profilo in dashboard**: aperto da `goToProfilo()` (click avatar o link in cima). NON esiste più la tab "Profilo" — è diventato un popup. Elemento `profileNameDisplay` rimosso dal DOM: usare `if (nameEl)` prima di settare `.textContent` o crasha silenziosamente bloccando tutto il codice successivo (incluso caricamento avatar).
- **Storage buckets nel SQL**: sezione 8 del `SETUP_DEF_SUBINGRESSO.sql` crea `avatars` e `listings` con policy RLS. Rieseguire il file completo per crearli.

## 📊 Visualizzazioni Annunci (Aprile 2026)
- Colonna `visualizzazioni integer DEFAULT 0` in `annunci`. Funzione DB: `increment_views(listing_id uuid, amount integer)` SECURITY DEFINER con GRANT a anon/authenticated.
- Anteprima card: +1 via `observeCardViews()` in `data.js` (pubblica, no underscore) — `requestAnimationFrame` + `getBoundingClientRect` + scroll listener. Chiamarla dopo ogni render di `buildCard()`.
- **`_supabase.rpc().catch()` NON ESISTE** in Supabase JS v2 — usare sempre `async/await`: `const { error } = await _supabase.rpc(...)`.
- Visita diretta: random 1-2 views (`Math.random() < 0.5 ? 1 : 2`) invece di fisso.
- Visita diretta: +2 via RPC in `annuncio-detail.js` ad ogni apertura pagina.
- **`visualizzazioni` NON va nella select principale di `annuncio-detail.js`** — se la colonna manca o RLS la blocca, tutta la query restituisce errore e l'annuncio non si carica. Fetchare in IIFE asincrona isolata dopo il caricamento della pagina.
- Display: `#viewCount` (span con `id`) + `#viewCountVal` nel title block di `annuncio.html`. Mostrato solo se il fetch ha successo.

## 🖼️ Immagine Annuncio (`annuncio.html`)
- Il div copertina ha `id="coverDiv"`. Usare `getElementById('coverDiv')` in `annuncio-detail.js` — MAI `querySelector` su classi CSS Tailwind (fragile e causa immagine non caricata).

## 💬 Chat / Conversazioni (`messaggi.html`)
- La lista conversazioni mostra **titolo posteggio** (primario) + **nome venditore** (secondario in blu) — non il nome utente.
- L'header della chat aperta mostra titolo posteggio in `#chatOtherName` e `"{nome venditore} · Vedi annuncio →"` in `#chatListingLink`.

## 🔍 SEO & Google (Aprile 2026)
- `api/sitemap.js`: sitemap dinamica Vercel, auto-include annunci attivi e blog da Supabase. `vercel.json` ha rewrite `/sitemap.xml → /api/sitemap`. Il file statico `sitemap.xml` è stato eliminato.
- Google Search Console verificato (file `googlead37f27accd4fd2b.html` in root). Sitemap inviato.
- JSON-LD Product+BreadcrumbList iniettato dinamicamente da `annuncio-detail.js`. JSON-LD ItemList da `annunci.js`. JSON-LD BlogPosting da `blog.html` in `renderPost()`.

## 🐛 Bug Storici & Soluzioni
- **`expires_at`**: la colonna potrebbe non esistere nel DB. La query in `annunci.js` NON filtra su di essa — non reintrodurre quel filtro.
- **`LISTINGS` in `data.js` è vuoto** — i dati arrivano solo da Supabase. Non rimettere dati demo.
- **Status annunci**: `checkContent()` sincrona in `vendi.html` imposta `status: 'active'/'pending'` direttamente all'insert. NON usare il pattern insert-pending + setTimeout-update (fallisce silenziosamente per RLS).
- **Contatti protetti**: `annuncio-detail.js` maschera numeri di telefono nella descrizione e cambia label pulsanti per utenti non loggati. `onAuthStateChange → restoreContactUI()` ripristina tutto dopo login.
- `ReferenceError`: Centralizzato tutto in `data.js`.
- `Gemini API "Quota exceeded"`: Implementato Retry Loop con modelli alternativi.
- `AI Generatore`: Usa chiamate multi-step, no elenchi puntati, solo paragrafi lunghi e CTA.
- `Database Setup`: Usa `SETUP_DEF_SUBINGRESSO.sql` per ripristinare i permessi corretti (specialmente per Admin/Blog).
- **`let history`** in `valutatore.html` causava crash silenzioso dell'intero script — rinominato in `stepHistory`. MAI usare `history` come nome variabile (conflitto con `window.history`).
- **Input `type="number"` con locale italiano**: usare sempre `type="text" inputmode="numeric"` + parsing manuale (strip punti, replace virgola→punto, parseFloat).
- **Immagini annunci**: salvate in `dettagli_extra.images` E in `img_urls` (array). Devono essere in entrambi i campi o non appaiono in `buildCard()`.
- **Conversazioni/Messaggi**: `SETUP_DEF_SUBINGRESSO.sql` ora include le policy RLS mancanti per `conversazioni` e `messaggi`.
- **Join profiles in `conversazioni` rompe PostgREST** (stesso problema di `annunci`). `messaggi.html` usa 3 fetch separati: (1) conv+annuncio, (2) profiles con `.in('id', userIds)`, (3) lastMessage per ogni conv. Merge manuale. NON usare `acquirente:profiles!fkey(...)` nella select.
- **`tel`/`email` mai esposti a utenti anonimi**: `annuncio-detail.js` fa `select(...)` senza `tel`/`email`. Li fetcha separatamente solo dopo `auth.getUser()` confermato. `restoreContactUI()` è `async` e fetcha `tel` dopo login.
- **Trigger `trg_enforce_annunci_status`** in `SETUP_DEF_SUBINGRESSO.sql`: forza `status='pending'` su INSERT per non-admin, blocca promozione ad `active` via UPDATE. **Da eseguire nel SQL Editor di Supabase** per attivarlo.
- **Validazioni `vendi.html`**: prezzo minimo 100€, max 10.000.000€. Nessun minimo sulla descrizione. Double submit bloccato con `if (btn.disabled) return`. `modifica-annuncio.html` ha ancora le sue validazioni separate.

## 🔒 Sicurezza Blog (`blog.html`)
- **DOMPurify** caricato da CDN prima di `data.js`. Il contenuto dei post (`post.content`) DEVE passare per `DOMPurify.sanitize()` prima di essere iniettato in `innerHTML`. Titolo, excerpt e slug usano `escapeHTML()` / `encodeURIComponent()`.

## 🔗 Pagine statiche del footer
- `termini.html` e `contatti.html` esistono (create Aprile 2026). Il footer in `ui-components.js` li linka. NON rimettere `href="#"` su quei due link.

## 📣 OG Meta Tag dinamici (`annuncio.html`)
- Il `<head>` ha tag con ID: `metaDesc`, `ogTitle`, `ogDesc`, `ogImage`, `ogUrl`. Vengono aggiornati da `annuncio-detail.js` tramite `_setMeta()` dopo il caricamento del listing. NON rimuovere quegli ID o gli og tag smettono di aggiornarsi.

## 📱 Chat responsive (`messaggi.html`)
- I due pannelli hanno id `convPanel` (lista) e `chatPanel` (chat). Su mobile si alterna la visibilità tra i due. `backToConversations()` torna alla lista. NON fondere i due div o si rompe il comportamento mobile.

## 🖼️ Avatar venditori nelle card (`data.js` + `annunci.js`)
- `USER_AVATARS` è una cache globale definita in `data.js` (`const USER_AVATARS = {}`). NON fare join `profiles` nella query annunci (rompe PostgREST) — invece `annunci.js` fa un fetch separato a `profiles(id, avatar_url)` dopo aver caricato i listing, con `.in('id', uniqueIds)`.
- `buildCard()` legge `USER_AVATARS[l.user_id]` per mostrare la foto; se assente mostra la lettera iniziale.
- Il badge venditore (`_sellerBadge`) usa la data dell'inserzione più vecchia dello stesso `user_id` come proxy della data di iscrizione.

## 🃏 Struttura card annunci (`buildCard` in `data.js`)
- La card è un `<div class="group ...">` NON un `<a>` — ha link separati: cover → `annuncioUrl`, titolo → `annuncioUrl`, venditore → `profiloUrl`, freccia → `annuncioUrl`. NON tornare a wrapper `<a>` unico o il link profilo smette di funzionare.
- Il link venditore usa `onclick="event.stopPropagation()"` ed è un `<a>` reale a `profilo.html?id=USER_ID`.

## 📐 Dimensioni immagine
- **Card anteprima**: `h-20` mobile, `h-28` desktop (rapporto ~5:1 su mobile).
- **Pagina annuncio** (`annuncio.html`): `h-44` mobile, `h-80` desktop.

## 🔍 Filtri mobile (`annunci.html` + `annunci.js`)
- Su mobile il sidebar filtri è `hidden lg:block` — NON è visibile. Il bottone "Filtri" è accanto al contatore risultati e apre un bottom-sheet (`#mobileFiltersSheet`).
- Gli input del bottom-sheet usano il prefisso `m_` (`m_fRegione`, `m_fTipo`, `m_fStato`, `m_fPrezzoMax`, `m_fSup`). `applyMobileFilters()` copia i valori `m_` → sidebar e chiama `applyFilters()`.
- `openMobileFilters()` sincronizza i valori dal sidebar → `m_` prima di aprire. NON modificare gli ID `m_` o la sincronizzazione si rompe.

## 🚫 Banner login rimosso (`annuncio-detail.js`)
- Il blocco `loginContactBanner` ("Accedi per vedere i contatti") è stato rimosso — era ridondante con i pulsanti lucchetto. La logica di mascheramento numeri e i lock sui pulsanti restano intatti.

## 🔍 Ricerca Annunci (`js/pages/annunci.js`)
- Se il testo cercato è un luogo riconoscibile (`getCityCoords` lo trova), mostra **sempre** tutti gli annunci entro 200km ordinati per distanza — non solo come fallback.
- `PROVINCE_COORDS` in `data.js`: aggiungere qui nuovi comuni se la ricerca per vicinanza non li trova. Toscolano Maderno già aggiunto.

## 🔐 Admin Check (Aprile 2026)
- L'accesso admin NON usa più email hardcodata — legge `profiles.is_admin = true` dal DB.
- Colonna aggiunta con: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;`
- Per assegnare admin: `UPDATE profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = '...');`
- In `dashboard.html`: variabile `_isAdmin` impostata dopo il fetch del profilo. Tutte le funzioni admin la usano.

## 🧙 Form `vendi.html` — Wizard 5 Step (Aprile 2026)
- Completamente riscritto come wizard a step. NON è più un form unico.
- `fTipo`, `fMerce`, `fGiorni` sono `<input type="hidden">` aggiornati via JS (non più select).
- `stato` sono radio hidden aggiornati da `selectStato()`.
- Step 1 auto-avanza al click. Step 5 ha auto-suggest del titolo da comune+tipo+settore.
- Nessun minimo di caratteri sulla descrizione. Prezzo: min 100€, max 10.000.000€.
- Anti-spam: 1 minuto (era 5). Timestamp impostato PRIMA dell'insert, rimosso su errore.

## 💶 Prezzi Affitto — Annuali (Aprile 2026)
- Il DB ora salva il **prezzo annuale** per gli affitti (il vecchio mensile × 12 è stato aggiornato via SQL).
- Display: mostra `prezzo ÷ 12 /mese` in grande + `prezzo /anno` sotto — sia in card (`data.js`) che in dettaglio (`annuncio-detail.js`).
- Badge sulle card: mostra "Affitto" (non "Affitto mensile").
- `formatPrice()` in `data.js` rimane per la vendita. Per l'affitto la card usa HTML inline con calcolo ÷12.

## 🗑️ Eliminazione Annunci
- `status='deleted'` = eliminato. NON viene fatto un DELETE fisico dal DB.
- `annunci.js`: filtra `.neq('status','deleted')` anche per utenti loggati (era bug: li mostrava con badge rosso).
- `dashboard.html` `loadMyListings()`: filtra `.neq('status','deleted')`.
- Admin ha sezione "Tutti gli annunci" con tasto Elimina su ciascuno (`deleteAnnuncio(id)`).

## 📊 Dashboard Admin — Statistiche
- 5 card: Annunci Totali · **Annunci Attivi** (verde, `admStatAttivi`) · Utenti Iscritti · In Attesa · Robot Blog.

## 🧭 Navigazione Header (Aprile 2026)
- Layout: `flex justify-between` sotto `lg`, `grid grid-cols-3` da `lg` in su — centramento corretto della nav.
- Ordine nav: **Calcolatore | Annunci | Blog**.
- Bottoni header: messaggi e profilo sono `w-9/w-10 rounded-lg/xl bg-slate-100` — icona `fa-user` per profilo (non più lettera iniziale).
- `dashboard.html` ha header hardcoded (non usa `ui-components.js`) — aggiornarlo manualmente se si modifica la nav.

## 📬 Email Settimanali (Digest + Stats) — Aprile 2026
- 3 nuove Edge Functions: `weekly-buyer-digest` (lunedì: top annunci in zona), `weekly-seller-stats` (lunedì: views/delta ai venditori), `email-unsubscribe` (1-click da link email).
- Tabelle dedicate: `weekly_digest_log(user_id, week_start)` PK anti-doppio-invio; `weekly_stats_snapshot(user_id, week_start, total_views, active_listings)` per delta settimana-su-settimana.
- Colonne nuove `profiles`: `email_digest bool`, `email_stats bool`, `unsub_token text` (UUID senza trattini, indexed).
- UI preferenze: 2 checkbox nel modal profilo di `dashboard.html` (pre-fill da profile, update via saveProfile).
- Pagina `unsubscribe.html` (noindex): chiama edge function `email-unsubscribe` via POST con `{token, type}`. type può essere `digest`, `stats`, `all`.
- **Verify JWT deve essere DISATTIVATO** sulle 3 function (cron + unsubscribe accedono senza utente loggato).
- Cron Supabase via `pg_cron` + `pg_net`: `0 9 * * 1` (lunedì 9:00 UTC). Setup completo in `SETUP_WEEKLY_EMAILS.md`.
- Regole anti-spam: digest skip se <3 annunci rilevanti per utente; stats skip se 0 views settimana; entrambi skip se già inviato (via log/snapshot).

## 📧 Edge Functions — Alert Email (`notify-alert` + `notify-seller`)
- `SITE_URL = 'https://subingresso.it'` (senza www) in tutte e 3 le notify functions.
- **Check UPDATE STRICT**: richiede `old_record.status === 'pending'` (non `!== 'active'`, che passava con undefined → email fantasma). Solo prima approvazione pending→active triggera email, le riattivazioni da 'deleted'/'scaduto' non mandano nulla.
- **Controllo freschezza** (`notify-alert`): annuncio con `created_at > 24h` → skip (evita email su riattivazioni vecchie).
- **Tabella `notify_alert_log(user_id, annuncio_id, sent_at)`** PK composita: dedup hard — una sola email per coppia utente/annuncio, per sempre. Creata in `SETUP_DEF_SUBINGRESSO.sql` sezione 10. Se email fallisce via Resend, rollback della riga (retry possibile).
- Richiede **"Include old record"** abilitato nel webhook Supabase → Database → Webhooks → `notify-alert` e `notify-seller`, altrimenti UPDATE pending→active non triggerano email.
- Log diagnostico all'inizio della function: `type`, `has_old_record`, `old_status`, `new_status`, `created_at` — visibile in Supabase → Logs.
- Email include link diretto all'annuncio + link ricerca pre-filtrata sulla zona dell'alert.

## 🤖 Blog Generator (`js/blog-generator.js`)
- **11 chiamate API sequenziali** (~2-3 min totali). Gira nel browser: se chiudi la pagina si interrompe.
- Ogni call ha il suo `maxTokens`: sezioni contenuto → 4000, revisione → 8000, metadati SEO → 500.
- Lo step finale chiede **solo** `title/slug/excerpt` (NON il content nel JSON) — il content viene usato direttamente dalla variabile JS.
- Pulizia markdown: prima regex locale, poi AI solo se trovate tabelle `| pipe |` residue.
- Anti-duplicati: prompt con lista temi vietati + controllo similarità titolo (>50% parole) prima di pubblicare.

## 💎 Sistema Vetrina a Pagamento (Aprile 2026)
- **Tier attivi:** €19 per 30 giorni, €39 per 90 giorni (-32% sul tier breve). Prezzi hardcoded server-side in `supabase/functions/create-checkout-session/index.ts` (TIERS = `{ '30d': 1900, '90d': 3900 }`) — il client NON può passare un amount custom.
- **Schema DB:** colonne nuove su `annunci`: `featured bool`, `featured_until timestamptz`, `featured_tier text`, `featured_since timestamptz`. Tabella nuova `payments` con RLS (ogni utente vede solo le proprie righe). Setup completo in `SETUP_VETRINA.sql`.
- **Trigger `enforce_annunci_status` esteso:** ora blocca anche auto-modifiche al campo `featured*` da parte di utenti non-admin/non-service_role. Solo il webhook (service_role) può promuovere un annuncio a `featured = true`.
- **Edge Functions:**
  - `create-checkout-session` — **Verify JWT = ON**. Valida ownership + status `active`, crea sessione Stripe Checkout via fetch diretto (no SDK Deno → evita polyfill issues), passa metadata `user_id/annuncio_id/tier` sia su session che su payment_intent.
  - `stripe-webhook` — **Verify JWT = OFF** (Stripe non manda JWT). Verifica firma HMAC-SHA256 manuale con tolleranza 5 min anti-replay. Gestisce `checkout.session.completed` / `expired` / `async_payment_failed`. Se annuncio già in vetrina non scaduta → estende da `featured_until` (utente non perde giorni).
- **Frontend:**
  - `dashboard.html`: bottone "Metti in vetrina" sugli annunci `active`, modal con 2 tier, `startCheckout(tier)` chiama l'edge function con bearer token. Toast `?vetrina=annullata` se utente torna dal Checkout senza pagare.
  - `grazie.html`: polling ogni 2s (max 20s) su `payments` via `stripe_session_id`. 4 stati (checking/success/slow/error).
  - `data.js`: helper `isListingFeatured(l)` + card con ring `ring-2 ring-amber-300` e badge "Vetrina" ⭐ quando featured non scaduto.
  - `js/pages/annunci.js`: ordinamento featured-first in entrambi i branch (prossimità + testo). Sort stabile: prima criterio normale, poi risort per `featured`.
  - `annuncio-detail.js`: select include `featured, featured_until, featured_tier` + banner gradient amber-orange sopra il titolo.
- **Idempotenza:** upsert su `stripe_session_id` (unique) in `payments` → doppio webhook non duplica la riga. `featured_until` calcolato da `now()` oppure da `featured_until` esistente se in estensione.
- **Cron `unfeature-expired-daily`:** pg_cron schedule `'0 3 * * *'` chiama funzione `unfeature_expired()` che azzera `featured*` per annunci con `featured_until < now()`. Se l'Editor web di Supabase mangia gli asterischi, riscriverli a mano.
- **Secrets Supabase necessari:** `STRIPE_SECRET_KEY` (sk_live/sk_test) e `STRIPE_WEBHOOK_SECRET` (whsec_). Setup step-by-step in `SETUP_STRIPE.md`.
- **Fiscalità:** Stripe NON è Merchant of Record — serve P.IVA per fatturazione elettronica SDI. Alternativa valutabile in futuro: Lemon Squeezy (MoR, 5% + €0,50).
- **CRITICO deploy CLI:** `create-checkout-session` va deployata con `--no-verify-jwt` (come `stripe-webhook`). Il gateway Supabase con JWT verify ON restituisce 401 perché il token `sb_publishable_...` (nuovo formato anon key) non supera la validazione gateway — la function già valida il token manualmente dentro il codice.
- **CRITICO fetch Edge Functions dal browser:** aggiungere sempre `'apikey': SUPABASE_ANON_KEY` negli headers del `fetch()` diretto oltre ad `Authorization: Bearer <token>`. Senza questo header Supabase restituisce 401.
- **Views automatiche vetrina:** `PATCH_FEATURED_VIEWS.sql` — eseguire in SQL Editor per cron `increment-featured-views` (ogni 6h, +3-8 views casuali per annuncio in vetrina attiva).
- **Card featured redesign:** glow box-shadow aureo, sfondo `bg-gradient-to-b from-amber-50/50 to-white`, barra top 3px, badge crown + animate-pulse, footer strip "Annuncio in Vetrina ★★★★★".

## ⚠️ Note Operative Deploy & Troubleshooting (Supabase)
- **Supabase CLI su Windows:** L'installazione di `supabase` via npm globale fallisce tipicamente su Windows. Per fare il deploy delle Edge Functions, usare l'eseguibile standalone (scaricato da GitHub Releases) o aggiornare il codice manualmente dalla Dashboard web (copia-incolla).
- **Bug SQL Editor (Asterischi Cron):** Copiando/incollando orari cron come `'0 9 * * 1'` direttamente nell'SQL Editor web di Supabase, a volte l'interfaccia rimuove gli asterischi creando spazi vuoti (causando l'errore `invalid schedule`). Per risolvere, assicurati di copiare la query da un file `.sql` locale pulito o riscrivi gli asterischi a mano.
- **Webhook e old_record:** Il check `STRICT` in `notify-alert` e `notify-seller` richiede rigorosamente `old_record.status === 'pending'`. Non inserire logiche di "fallback" se il webhook non include l'old_record, altrimenti update banali (es. contatore visite) causeranno false email di "nuovo annuncio".
