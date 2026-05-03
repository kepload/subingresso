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
- **Validazioni `vendi.html`**: prezzo minimo 100€, max 10.000.000€. Descrizione minimo 10 caratteri (check in step 5 + `checkContent`). Double submit bloccato con `if (btn.disabled) return`. `modifica-annuncio.html` ha ancora le sue validazioni separate.

## 🔒 Sicurezza Blog (`blog.html`)
- **DOMPurify** caricato da CDN prima di `data.js`. Il contenuto dei post (`post.content`) DEVE passare per `DOMPurify.sanitize()` prima di essere iniettato in `innerHTML`. Titolo, excerpt e slug usano `escapeHTML()` / `encodeURIComponent()`.

## 🔗 Pagine statiche del footer
- `termini.html` e `contatti.html` esistono (create Aprile 2026). Il footer in `ui-components.js` li linka. NON rimettere `href="#"` su quei due link.

## 📣 OG Meta Tag dinamici (`annuncio.html`)
- Il `<head>` ha tag con ID: `metaDesc`, `ogTitle`, `ogDesc`, `ogImage`, `ogUrl`. Vengono aggiornati da `annuncio-detail.js` tramite `_setMeta()` dopo il caricamento del listing. NON rimuovere quegli ID o gli og tag smettono di aggiornarsi.

## 📱 Chat responsive (`messaggi.html`)
- I due pannelli hanno id `convPanel` (lista) e `chatPanel` (chat). Su mobile si alterna la visibilità tra i due. `backToConversations()` torna alla lista. NON fondere i due div o si rompe il comportamento mobile.

## 🖼️ Avatar e nome venditori nelle card (`data.js` + `annunci.js`)
- `USER_AVATARS` e `USER_NAMES` sono cache globali in `data.js`. NON fare join `profiles` nella query annunci (rompe PostgREST) — `annunci.js` fa un fetch separato `profiles(id, avatar_url, nome)` con `.in('id', uniqueIds)` e popola entrambe le cache.
- `buildCard()` usa `USER_NAMES[l.user_id]` come nome primario, `l.contatto` come fallback. Questo garantisce che se l'utente cambia nome nel profilo, tutte le sue card si aggiornano.
- Il badge venditore (`_sellerBadge`) usa la data dell'inserzione più vecchia dello stesso `user_id` come proxy della data di iscrizione.

## 🃏 Struttura card annunci (`buildCard` in `data.js`)
- La card è un `<div class="group ...">` NON un `<a>` — ha link separati: cover → `annuncioUrl`, titolo → `annuncioUrl`, venditore → `profiloUrl`, freccia → `annuncioUrl`. NON tornare a wrapper `<a>` unico o il link profilo smette di funzionare.
- Il link venditore usa `onclick="event.stopPropagation()"` ed è un `<a>` reale a `profilo.html?id=USER_ID`.
- **Bordo laterale sinistro**: `border-l-[3px] border-l-emerald-400` per Vendita, `border-l-[3px] border-l-blue-400` per Affitto. Le card featured NON hanno la striscia — mantengono solo il ring dorato. Variabile `statoBorder` in `buildCard`, inclusa in `featuredBorder` solo per le card normali.
- **Tinta sfondo card**: `bg-emerald-50/70` per Vendita, `bg-blue-50/70` per Affitto. Featured: `bg-gradient-to-b from-amber-50/50 to-white` invariato. NON usare `bg-white` fisso.
- **Badge "Dati Verificati" rimosso** dalle card featured — era fuorviante.
- **`settore` NON è una colonna diretta** della tabella `annunci` — non usarla in `select()` esplicite o la query fallisce. È dentro `dettagli_extra` o non esiste. Usare sempre `select('*')` per annunci.

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
- Il DB salva il **prezzo annuale** per gli affitti.
- Display: solo prezzo annuale ovunque — **nessun calcolo mensile**. Card mostra `€ X.XXX /anno`, pagina annuncio mostra `€ X.XXX` con `/anno` inline (span) + sottotitolo `/anno · trattabile`.
- Badge sulle card: mostra "Affitto" (non "Affitto mensile").
- `formatPrice()` in `data.js`: affitto → `€ X /anno`, vendita → `€ X`.
- **`#prezzoMobile`** in `annuncio.html`: elemento `lg:hidden` sotto il titolo per mostrare il prezzo in cima su mobile. Aggiornato da `annuncio-detail.js` insieme a `#prezzo`.

## 🗑️ Eliminazione Annunci
- `status='deleted'` = eliminato. NON viene fatto un DELETE fisico dal DB.
- `annunci.js`: filtra `.neq('status','deleted')` anche per utenti loggati (era bug: li mostrava con badge rosso).
- `dashboard.html` `loadMyListings()`: filtra `.neq('status','deleted')`.
- Admin ha sezione "Tutti gli annunci" con tasto Elimina su ciascuno (`deleteAnnuncio(id)`).

## 📊 Dashboard Admin — Statistiche
- 6 card (grid 2×3): Annunci Totali · **Annunci Attivi** (verde, `admStatAttivi`) · Utenti Iscritti · In Attesa · **In Vetrina** (amber, `admStatVetrina`) · **Lotteria Attiva** (`admStatLotteria`, utenti con `welcome_lottery_eligible=true`).
- Robot Blog rimosso dalle stat card. Il bottone `forceBlogBtn` esiste ancora nel DOM ma è nascosto — `generateArticleNow()` ha null-check per non crashare se il bottone non c'è.

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
- **NON usare il webhook UI di Supabase** per `notify-alert` — l'interfaccia converte automaticamente al tipo "Edge Functions" e non include `old_record`. Usare invece un **trigger PostgreSQL diretto via pg_net** (già attivo in prod).
- **Trigger attivo in DB**: `notify_alert_trigger` AFTER INSERT OR UPDATE ON `annunci` → chiama `public.notify_alert_on_annunci()` via `net.http_post()`. Include sempre `old_record` per UPDATE. Exception handler interno: errori HTTP non bloccano mai le operazioni DB.
- **Logica attuale**: qualunque evento con `status='active'` + annuncio fresco (<24h) → invia. Il dedup log previene email doppie (non serve più dipendere da `old_record`).
- **Controllo freschezza** (`notify-alert`): annuncio con `created_at > 24h` → skip (evita email su riattivazioni vecchie).
- **Tabella `notify_alert_log(user_id, annuncio_id, sent_at)`** PK composita: dedup hard — una sola email per coppia utente/annuncio, per sempre. Se email fallisce via Resend, rollback della riga (retry possibile).
- **RESEND_API_KEY** aggiunta ai secret Supabase Edge Functions (Aprile 2026). Chiave attiva su resend.com.
- **Dominio `subingresso.it` su Resend**: VERIFICATO (Aprile 2026). Record DNS su Aruba: TXT `resend._domainkey` (DKIM) + TXT `send` (SPF) + MX `send` (bounce, aggiunto via Gestione Avanzata → Terzo livello). FROM fisso: `noreply@subingresso.it`. Sistema alert email funzionante end-to-end.
- **Debug**: per testare senza creare annunci, chiamare la function direttamente con payload JSON. Vedere `net._http_response` in SQL Editor per verificare se la chiamata è partita dal trigger.
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

## 🔔 Notifiche UI (Aprile 2026)
- **`showToast(message, type)`** in `data.js` — globale su tutte le pagine. Tipi: `success`/`error`/`warning`/`info`. Appare bottom-right, auto-dismiss 4s. Sostituisce tutti i `alert()` del sito.
- **`showConfirm({title, message, okLabel, variant})`** in `dashboard.html` — restituisce `Promise<bool>`. Varianti: `danger`/`warning`/`alert`/`admin`. Sostituisce tutti i `confirm()` della dashboard. NON è in `data.js`, solo in dashboard.
- **NON usare mai `alert()` o `confirm()` nativi** — usare sempre le versioni interne.

## 🗂️ Dashboard Utente (Aprile 2026)
- **Tab**: "I miei annunci" | "Alert" — la tab "Conversazioni" è stata rimossa.
- **Tab Alert**: `#sectionAlert`, badge `#alertBadge`, lazy-load con flag `_alertsLoaded`. Funzioni: `loadMyAlerts()`, `deleteAlert(id)`.
- **Pannello Moderazione Admin** (`#pendingReviewSection`): `hidden` di default, appare solo se `loadPendingListings()` trova annunci pending. Badge numerico `#pendingCount`.
- **Modal Vetrina mobile**: bottom sheet su mobile (`items-end`), `max-h-[92dvh] overflow-y-auto`, tasto X nel header gradiente.
- **Admin Vetrina gratuita**: `adminOpenVetrinaModal(id)` → modal durata → `adminGrantVetrina(30|90)` scrive `featured=true`, `featured_until`, `featured_tier='admin_free'`. `adminRevokeVetrina(id)` azzera tutto. Se il trigger DB blocca, mostra toast di errore.
- **Moderazione vetrina**: se un utente modifica un annuncio in vetrina, `status` torna `pending` automaticamente (non visibile pubblicamente). L'admin approva/elimina come al solito; i campi `featured*` restano invariati fino all'approvazione o eliminazione.

## 📅 Scadenza Post + Privilegio Vetrina (Aprile 2026)
- **Post normale scade in 100 giorni.** Colonna `expires_at timestamptz` su `annunci` — **SQL da eseguire in Supabase se non ancora fatto:**
  ```sql
  ALTER TABLE annunci ADD COLUMN IF NOT EXISTS expires_at timestamptz;
  UPDATE annunci SET expires_at = created_at + INTERVAL '100 days' WHERE expires_at IS NULL AND status != 'deleted';
  ```
- **Vetrina 30gg → post esteso a max 200 giorni** da `created_at`. **Vetrina 90gg → max 300 giorni.** Cap non superabile: una seconda vetrina non aumenta ulteriormente.
- Logica in `adminGrantVetrina(days)` (`dashboard.html`): fetch `created_at`+`expires_at`, calcola cap, usa `MAX(current, cap)`, aggiorna `expires_at` insieme ai campi `featured*`.
- **`stripe-webhook` edge function (Supabase) da aggiornare manualmente** con la stessa logica: su `checkout.session.completed` leggere `created_at` dell'annuncio e impostare `expires_at` al cap del tier (`30d`→200gg, `90d`→300gg).
- **NON filtrare su `expires_at` nelle query** finché la colonna non è popolata per tutti i post (evita di nascondere post esistenti). Abilitare il filtro `.or('expires_at.is.null,expires_at.gt.<now>')` solo dopo aver eseguito l'UPDATE sopra.

## 🔍 Ricerca Annunci — Tasto Cerca (Aprile 2026)
- La `searchBar` in `annunci.html` NON lancia più la ricerca automatica sull'input. Mostra solo il pulse visivo.
- Bottone **"Cerca"** (blu, dentro la barra) + tasto **Invio** avviano `applyFilters()`. I filtri sidebar (regione, tipo, stato, prezzo, superficie) restano live con `onchange`.

## 💎 Modal Vetrina — Note UI (Aprile 2026)
- Modal compatto senza scroll (`max-w-md`, no `overflow-y-auto`). Bottom sheet su mobile, centrato su desktop.
- **4 benefit in griglia** (ordine): +Visualizzazioni · Vendi prima · In cima · Post più lungo.
- **Badge "Dati Verificati"** rimosso da `annuncio-detail.js` — era fuorviante, nessuna verifica reale avviene.

## 🔔 Popup & Onboarding (Aprile 2026)
- **Popup visitatori** (`auth.js`): modal centrato con blur, appare dopo 8s, verifica sessione al momento dello show (`getSession()`), una volta per sessione (`sessionStorage._vp`). NON usare slide-up — è un modal full overlay come gli altri. Copy: "Registrati e prova a vincere 30 giorni di Vetrina".
- **Popup benvenuto nuovo utente** (`auth.js`): appare al primo login quando il profilo viene creato dai metadati. Salvato in `localStorage._welc_<userId>` per non riapparire. Mostra ruota della fortuna al click.
- **Lotteria vetrina welcome** (sostituisce il vecchio sistema dei 10 giorni garantiti):
  - Colonne `profiles`: `welcome_lottery_eligible bool DEFAULT true`, `welcome_lottery_won bool DEFAULT false`.
  - **Eleggibilità solo da popup/promo**: il visitor popup setta `sessionStorage._reg_src='popup'` prima di aprire il modal di registrazione. L'upsert del profilo legge e consuma il flag — se assente setta `welcome_lottery_eligible=false`. Registrazione normale → NON eleggibile.
  - **Flusso**: click "Tenta la fortuna" nel popup benvenuto → RPC `try_welcome_lottery(p_user_id)` → controlla `eligible=true` + `created_at` entro 30 giorni → tira dado (`random() < 0.001`, 0,1%) → setta `eligible=false` sempre; se vince setta `won=true` → risultato mostrato via ruota animata canvas (4 spicchi: 1 dorato + 3 grigi, 4 secondi easing-out).
  - Se non clicca entro 30 giorni dall'iscrizione → opportunità persa per sempre.
  - Alla pubblicazione del primo annuncio (`vendi.html` → `_tryGrantWelcomeVetrina`) → RPC `grant_welcome_vetrina(annuncio_id, user_id)` → se `won=true` applica 30gg vetrina (`featured_tier='welcome_lottery'`) e setta `won=false`.
  - SQL: `SETUP_WELCOME_VETRINA.sql` (da eseguire su Supabase: aggiunge colonne, crea `try_welcome_lottery`, aggiorna `grant_welcome_vetrina`).

## 🗑️ Eliminazione Account (Aprile 2026)
- Sezione "Zona pericolosa" in fondo al modal profilo (`dashboard.html`). Richiede di scrivere `ELIMINA` nel campo di testo.
- Funzione SQL `delete_my_account()` SECURITY DEFINER: elimina messaggi → conversazioni → notify_alert_log → annunci → profiles → auth.users in cascata. NON fare `user_id = NULL` su annunci (NOT NULL constraint).
- Modal profilo su mobile: bottom sheet (`items-end`), `max-h-[92dvh]`, contenuto `overflow-y-auto flex-1`.

## 🔑 Recupero Password (Aprile 2026)
- Link "Password dimenticata?" nel form login del modal (`auth.js`) — apre tab `forgot` con campo email.
- `handleForgotPassword()` chiama `resetPasswordForEmail` con `redirectTo: 'https://subingresso.it/reset-password.html'` hardcoded — NON usare `window.location.origin` (cambia su vercel.app).
- Pagina `reset-password.html`: rileva token nell'URL (hash o query param), ascolta `onAuthStateChange PASSWORD_RECOVERY`, timeout 6s → mostra "Link non valido". Se accesso diretto senza token → redirect a `index.html`.
- Supabase → Authentication → URL Configuration: `Site URL = https://subingresso.it`, `Redirect URLs` deve includere `https://subingresso.it/**`.
- **Email templates Supabase** aggiornati in italiano: "Confirm signup" e "Reset password" — modificare in Authentication → Email Templates. Tasto unico `{{ .ConfirmationURL }}`.
- Rate limit Supabase: 1 email/ora per stesso indirizzo. Per test usare alias Gmail `+test1`, `+test2` o confermare manualmente da Dashboard → Authentication → Users.

## ⚡ Performance Header & Loading (Aprile 2026)
- **`updateAuthNav()` in `auth.js`**: usa `getSession()` (legge localStorage, nessuna rete) per mostrare i bottoni istantaneamente. Il badge messaggi non letti viene caricato in background in una IIFE asincrona separata. NON tornare a `getUser()` per il primo render — farebbe aspettare 1-2s il caricamento dei bottoni header.
- **Skeleton loader `annunci.html`**: `resultsGrid` contiene 6 card placeholder statiche con animazione pulse. Vengono rimpiazzate automaticamente dal primo `applyFilters()` senza JS aggiuntivo. NON rimuovere — senza di loro la pagina sembra vuota durante il caricamento.

## ⚠️ Note Operative Deploy & Troubleshooting (Supabase)
- **Supabase CLI su Windows:** L'installazione di `supabase` via npm globale fallisce tipicamente su Windows. Per fare il deploy delle Edge Functions, usare l'eseguibile standalone (scaricato da GitHub Releases) o aggiornare il codice manualmente dalla Dashboard web (copia-incolla).
- **Bug SQL Editor (Asterischi Cron):** Copiando/incollando orari cron come `'0 9 * * 1'` direttamente nell'SQL Editor web di Supabase, a volte l'interfaccia rimuove gli asterischi creando spazi vuoti (causando l'errore `invalid schedule`). Per risolvere, assicurati di copiare la query da un file `.sql` locale pulito o riscrivi gli asterischi a mano.
- **Webhook e old_record:** Il check `STRICT` in `notify-alert` e `notify-seller` richiede rigorosamente `old_record.status === 'pending'`. Non inserire logiche di "fallback" se il webhook non include l'old_record, altrimenti update banali (es. contatore visite) causeranno false email di "nuovo annuncio".

## 📧 Email Rate Limit Bypass (Aprile 2026)
- **Problema**: Supabase free plan limita a 2 email auth/ora. Il rate limit si applica PRIMA del Send Email Hook, non bypassabile gratis.
- **Soluzione**: Edge Function `register-bypass` — se `signUp` fallisce con rate limit, crea utente via `admin.auth.admin.createUser({ email_confirm: true })` + `signInWithPassword`. Utente registrato e loggato senza email.
- **`pending_email_verifications`**: tabella dove vengono salvati questi utenti per verifica notturna. SQL in `SETUP_EMAIL_BYPASS.sql` (non ancora eseguito — la tabella non è critica, il bypass funziona anche senza).
- **Send Email Hook**: configurato in Auth → Hooks → Send Email → Edge Function `send-auth-email` via Resend. Funziona per i primi 2/ora normalmente.
- **Vetrina prezzi aggiornati**: 3 tier — 10d €19,90, 30d €39,90, 90d €59,90 (MIGLIOR VALORE). Edge Functions `create-checkout-session` e `stripe-webhook` aggiornate con nuovi importi.
- **`_afterRegisterSuccess()` e `_registerBypass()`**: helper in `auth.js` per evitare duplicazione codice nella gestione post-registrazione.

## 🏠 Home Page — Ordine Sezioni (Aprile 2026)
- Ordine attuale: Hero → **Ultimi Annunci** (12 card, bottone "Vedi tutti" in fondo) → Vendi in 3 passi → FAQ.
- La sezione "Vendi in 3 passi" è stata spostata sotto gli annunci. NON rimetterla sopra.
- `loadRecentListings()` in `index.html`: `.limit(12)`, ordine `created_at DESC`, fallback su `LISTINGS.slice(0,12)`.

## 📣 Blog — Promo Inline (Aprile 2026)
- Funzione `_insertBlogPromo(html)` in `blog.html`: inietta un banner dopo il 3° `</p>` dell'articolo.
- Visibile solo agli utenti non loggati (auth check post-render rimuove `.blog-promo` se sessione attiva).
- Copy: "🎰 Nuovo su Subingresso? Registrati e prova a vincere 30 giorni di Vetrina gratis →". Sfondo ambrato (`bg-amber-50 border-amber-200`).
- Click setta `sessionStorage._reg_src='popup'` → utente è eleggibile alla lotteria.
- Se l'articolo ha meno di 3 paragrafi il banner non viene inserito.
- Banner calcolatore in cima al blog: riga singola compatta (`py-3`), solo titolo + bottone "Calcola →". Spazio superiore `pt-8` (ridotto da `py-16`).

## Sessione 30 Aprile 2026

### Bug Fix vendi.html
- **Anti-spam NaN**: `localStorage.getItem()` ritorna stringa → `Date.now() - "123..."` dava NaN. Fix: `parseInt(localStorage.getItem(lastPostKey)) || 0`.
- **Rimozione foto**: `FileReader.onload` è asincrono → DOM e `_files[]` potevano andare fuori ordine. Fix: `WeakMap` (`_fileMap`) che mappa ogni `div` al suo `File`. `removeFile()` usa `_files.indexOf(div._fileRef)` invece dell'indice DOM.

### Pagine SEO per Città
- **`api/annunci-citta.js`**: nuova Vercel serverless function. Serve `/annunci/milano`, `/annunci/roma` ecc. con HTML SSR completo — meta tag, listing cards visibili a Google, JSON-LD ItemList+BreadcrumbList, testo SEO, canonical.
- **`vercel.json`**: aggiunto rewrite `"/annunci/:citta"` → `"/api/annunci-citta?citta=:citta"`. Non entra in conflitto con `/annunci` (file statico).
- **`api/sitemap.js`**: aggiunti `cityToSlug()` e terza query distinct `comune` da annunci attivi. Ogni città ottiene URL in sitemap (weekly, 0.8). Auto-aggiornato ad ogni crawl.
- **Logica 404**: città senza annunci → risposta 404 + `meta name="robots" content="noindex"`. Google non indicizza pagine vuote.
- **Sitemap già registrata** su Search Console — nessuna azione necessaria, Google ricicla automaticamente.
- **"Discovered not indexed"** (42 pagine in Search Console): normale per sito giovane, si risolve con tempo + traffico. Non richiedere indicizzazione manuale.

## 🐌 Pubblicazione Annuncio — Timeout & Sessione (Aprile 2026)
- **Tutti i webhook UI sync rimossi** (30 apr 2026): annunci aveva 5 webhook AFTER INSERT/UPDATE che bloccavano l'INSERT 15-20s. Sostituiti con 2 trigger custom async via pg_net (`notify_alert_trigger` + `notify_seller_trigger`) che usano `notify_alert_on_annunci()` e `notify_seller_on_annunci()`. Patch in `PATCH_REMOVE_DUPLICATE_TRIGGERS_20260430.sql`. Dopo il fix: INSERT <800ms. **NON ricreare webhook UI dalla Dashboard Supabase** — usare sempre trigger custom con pg_net (fire-and-forget).
- **CRITICO `pg_net.http_post`**: il parametro `body` deve essere `jsonb`, NON `::text`. La firma e' `net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer)`. Una versione precedente di `notify_alert_on_annunci` usava `body := jsonb_build_object(...)::text` + `EXCEPTION WHEN OTHERS THEN NULL` → errore di tipo silenziato → nessuna email inviata. Sempre usare `RAISE WARNING` invece di `NULL` nell'exception handler per non mascherare bug futuri.
- **Trigger annunci finali**: `notify_alert_trigger` (async, email alert acquirenti), `notify_seller_trigger` (async, email venditore "ricevuto/online/rifiutato"), `trg_enforce_annunci_status` (BEFORE, forza pending su INSERT non-admin).
- **Timeout INSERT su `annunci` = 45 secondi** (vendi.html, `_withTimeout`). Margine di sicurezza per cold start edge function `notify-seller` (l'unico webhook sync rimasto).
- **Diagnostica DB lento**: `DIAGNOSE_PUBLISH_SLOW.sql` nella root — query per ispezionare trigger su annunci, sorgente delle function trigger, coda `pg_net`, replica identity. Sezione 6 commentata: `ALTER TABLE public.annunci DISABLE TRIGGER notify_alert_trigger;` come workaround se la coda pg_net è intasata.
- **JWT auto-refresh prima dell'INSERT** (vendi.html, `_isSessionExpired` + `_refreshSessionIfNeeded`): se `expires_at` è entro 30s, forza `refreshSession()`. Se l'INSERT fallisce con errore JWT/auth/RLS, refresha e ritenta UNA volta. Senza questo gli utenti con token scaduto in localStorage vedevano "Errore durante la pubblicazione" senza recovery.
- **Fallback sessione `_getSessionForSubmit`**: se `getSession()` non trova nulla, prova `setSession()` da localStorage; se anche quello fallisce, usa la sessione stored direttamente (NON ritornare null, scatena auth modal inutile su utenti già loggati).
- **Login timeout 12s** (auth.js, `handleLogin`): `signInWithPassword` può hangare a vita su connessioni lente. `Promise.race` con timeout evita il bottone "Attendi…" stuck.
- **Errore di pubblicazione**: il catch block in `submitAnnuncio` mostra ora `Errore [code]: <message Supabase reale>` (max 160 char). Niente più messaggi generici che nascondono RLS/JWT/column errors. Indispensabile per diagnosticare.

## Sessione 30 Aprile – 1 Maggio 2026

### Valutatore — Cambamenti principali
- **`SETUP_VALUTATORE_LOGS.sql` eseguito** su Supabase: tabella `valutatore_logs` + 2 RPC (`link_valutatore_to_user`, `link_valutatore_to_annuncio`). Tutto funzionante.
- **SEO completo valutatore.html**: title, meta, OG, Twitter Card, JSON-LD WebApplication + FAQPage (6 domande), preconnect. Sitemap: priority 0.9, weekly.
- **Step 6 redesign**: valore vendita (verde/emerald) in cima, box affitto (blu) sotto, due CTA "Voglio Vendere" / "Voglio Affittare" → entrambi linkano `vendi.html`. Affitto mensile rimosso (solo annuale). Numero con spazio sottile come separatore migliaia (`toLocaleString('it-IT').replace(/\./g,' ')`).
- **Box affitto UI**: cifra `text-4xl font-black text-blue-700` con `/anno` accanto in `text-3xl font-bold text-blue-400` (flex items-baseline). Sotto piccolo solo "rendimento stimato X%". Niente "all'anno" sotto (ridondante con "/anno" grande).
- **Disclaimer pattern**: NON inline nello step risultato (era invadente). Sotto "Nuova Valutazione" c'è una micro-link `text-[11px] underline` "Stima orientativa — leggi le note" che linka `#disclaimer`. La sezione `#disclaimer` (con `scroll-mt-20`) è in fondo alla pagina, dopo le FAQ, prima del footer — paragrafo che spiega "stima orientativa, ogni mercato ha caratteristiche uniche, prezzi variano nel tempo, non è perizia".
- **Formula calcolatore** (stato attuale, ricalibrata 1 mag 2026 — output prima erano esplosivi: 5k fatturato → 95k valore):
  ```js
  var base = factors.fatturato * 1.18;  // premio commerciale +18% per spingere alla pubblicazione
  var moltFrequenza = (factors.frequenza === 'fiera') ? factors.durataFiera : factors.frequenza;
  var totale = base * moltFrequenza * factors.zona * factors.settore * factors.posizione * factors.anni * factors.stagionalita;
  var rentRaw = totale * 0.25;
  var rentCap = factors.fatturato * 0.58 * factors.stagionalita;
  var rentAvg = Math.min(rentRaw, rentCap);
  ```
  Moltiplicatori: giornaliero=1.5 / settimanale=1.0 / fiera=durataFiera (1g=0.3, weekend=0.5, sett+=0.7); zona storica=2.0 / capoluogo=1.25 / rionale=0.65; alimentare=1.3, non-alim=1.0; angolare=1.25, linea=1.0; anni storica=1.25, recente=1.0; stagionale=0.7, annuale=1.0.
  Calibrazione obiettivo: fatturato 5k → top assoluto ~36k, caso settimanale-storica-alim ~24k, affitto top ~2.9k (cap al 58% del fatturato, premio +16%). Per fatturato 30k rionale dà ~15-23k; per 100k alim storica top dà ~720k.
  **`base * 1.18` è una scelta business** — il valutatore deve sopravvalutare leggermente per convincere il venditore a pubblicare. Non spingerlo oltre +20% (diventa "non credibile"). NON è un bug, è una calibrazione voluta.
  **Quando si toccano i moltiplicatori, aggiornare _FREQ_LABELS / _ZONA_LABELS / _SETT_LABELS / _POS_LABELS / _ANNI_LABELS / _STAG_LABELS / _FIERA_LABELS** in `valutatore.html` (chiavi devono essere stringhe corrispondenti al nuovo valore — String(1.0)='1', String(2.0)='2'). Se non corrispondono, `_label()` ritorna null e `_saveValutatoreLog` skippa il salvataggio Supabase.
- **Bug fix noto**: non usare mai `history` come nome variabile JS → conflitto con `window.history` → crasha tutto. Il nome corretto usato qui è `stepHistory`.
- **Banner mobile homepage**: prima della sezione "Vendi in 3 passi", visibile solo su mobile (`md:hidden`), link verde a valutatore.html.

### Pendenze
(nessuna)

### Note label zona
- Step 3 valutatore: la terza opzione zona ha label utente-facing **"Piccolo Comune / Quartiere"** (rinominata 1 mag 2026, prima era "Mercato Rionale / Periferico" — non chiaro all'utente). Tag interno `_ZONA_LABELS['0.65']` resta `'rionale'` per non spezzare i log Supabase storici. Anche il copy SEO/FAQ sotto la pagina mantiene la parola "rionale" per posizionamento (keyword cercata).

## Stato Ultima Sessione Codex (27 Aprile 2026)
- Sessione dedicata al blog SEO e alla pulizia dei file SQL temporanei.
- Analisi competitor/mercato: Subingresso.it ha prodotto piu' moderno dei competitor verticali, ma dominio giovane e bassa autorita SEO. La strategia migliore e' long-tail operativo: spuntista, decadenza concessione, trasferimento familiare, subingresso locale, guide regionali e problemi concreti degli ambulanti.
- Inseriti online 18 nuovi articoli operativi per ambulanti: Bolkestein, forfettario, INPS, partita IVA, ATECO, spuntista, decadenza concessione, sagre/fiere, HACCP, assicurazioni, guide regionali Toscana/Lazio/Puglia/Sardegna/Centro Italia, trasferimento familiare, prodotti propri, crisi/strategie.
- I 18 articoli operativi sono stati riscritti in stile piu' leggibile: articoli piu' corti, paragrafi brevi, grassetti, tono pratico. Erano stati creati come batch SQL `REWRITE_BLOG_POSTS_READABLE_BATCH_1..6.sql` e poi rimossi per pulizia.
- Trovati 4 articoli quasi vuoti online e completati via SQL: `marketing-digitale-ambulanti-strategie-2026`, `differenza-licenza-ambulante-a-b-scelta`, `certificazione-atp-furgoni-refrigerati-scadenze`, `tasse-occupazione-suolo-guadagni-posteggio-704`. Anche il file temporaneo `COMPLETE_SHORT_BLOG_POSTS.sql` e' stato rimosso.
- Trovati 24 vecchi articoli sopra i 4.000 caratteri. Il primo batch dei 3 peggiori e' stato riscritto e il file temporaneo e' stato rimosso: `tasse-e-contributi--la-guida-fiscale-per-ogni-ambulante-italiano-20`, `comprare-posteggio-ambulante-guida-investimenti-317`, `burocrazia-del-subingresso-nel-commercio-ambulante--la-guida-step-by-step-per-evitare-errori-424`.
- Restano circa 21 vecchi articoli lunghi da accorciare. Priorita' consigliata: `costi-nascosti-posteggio-mercatale`, `vendere-la-tua-licenza-ambulante--la-guida-per-non-farti-fregare-sul-prezzo--723`, `posteggi-mercatali-piemonte-liguria`, `affittare-o-vendere-posteggio-mercatale-quando-conviene`, `come-negoziare-prezzo-posteggio-mercatale`, `come-valutare-posteggio-mercatale-prima-di-comprarlo`.
- Regola editoriale blog da mantenere: niente articoli enciclopedici lunghi; target 2.200-3.200 caratteri, leggibili da telefono, paragrafi corti, `<h2>`, qualche `<strong>`, CTA finale verso `/vendi.html` e `/annunci.html`. Evitare promesse tipo "annunci verificati", "centinaia di annunci", "migliori offerte".
- Cleanup SQL: rimossi i file temporanei blog `INSERT_BLOG_POSTS*.sql`, `REWRITE_BLOG_POSTS_READABLE_BATCH_*.sql`, `REWRITE_OLD_LONG_BLOG_BATCH_1.sql`, `COMPLETE_SHORT_BLOG_POSTS.sql`, `UPDATE_BLOG_POSTS_OPERATIVI_DATE_OGGI.sql`. Conservati invece gli SQL infrastrutturali (`SETUP_*`, `PATCH_*`, `setup-database.sql`) perche' ancora utili.
- Nota SEO realistica: gli articoli fiscali/normativi generici difficilmente supereranno INPS, Agenzia Entrate, commercialisti e AI Overview. Le chance vere sono query specifiche e calde: "spuntista mercato", "decadenza concessione ambulante", "trasferire posteggio a figlio", "subingresso posteggio mercatale [citta]", "vendere posteggio mercato [regione]".

## Sessione 1 Maggio 2026 (parte 2)

### Geo SEO `/annunci/[citta]` — pagine ottimizzate per AI Overview
- `api/annunci-citta.js`: aggiunti **FAQPage** schema (5 Q&A con dati reali dal DB) + **AggregateOffer** schema (lowPrice/highPrice/offerCount). Restano `ItemList` e `BreadcrumbList`. Le risposte FAQ citano "Subingresso.it" ed elencano numero annunci e range prezzi calcolati al volo dalla query — l'AI Overview cita queste frasi.
- **Banner freshness verde** sotto l'hero: dot pulsante CSS, "Aggiornato oggi · {Mese Anno}", "Ultimo annuncio pubblicato {X ore/giorni fa}", range prezzi compatto (es. "da €5k a €25k"). Calcolato da `relativeTime(listings[0].created_at)`.
- **Title/meta CTR-optimized**: pattern `Posteggi Mercatali {Citta} {Mese Anno} | {N} Annunci da €{minK} · Subingresso.it`. Mese/anno auto-aggiornato senza intervento manuale. Meta desc cita range prezzi reale + "zero commissioni" + timestamp ultimo annuncio.
- `og:updated_time` + `article:modified_time` aggiunti al `<head>`.
- `api/sitemap.js`: per ogni città `lastmod` = max(`created_at`) degli annunci attivi (era `today` fisso). `changefreq` da `weekly` a `daily`. Quando arriva un nuovo annuncio in una città, la sitemap dice a Google che la pagina è cambiata.

### Riscrittura 10 articoli blog in stile umano
- Articoli toccati (eseguito via `supabase db query --linked --file ...`): `migliori-mercati-lago-di-garda-posteggi-ambulanti`, `costi-nascosti-posteggio-mercatale`, `vendere-la-tua-licenza-ambulante--la-guida-per-non-farti-fregare-sul-prezzo--723`, `posteggi-mercatali-piemonte-liguria`, `affittare-o-vendere-posteggio-mercatale-quando-conviene`, `come-negoziare-prezzo-posteggio-mercatale`, `come-valutare-posteggio-mercatale-prima-di-comprarlo`, `eredita-licenza-ambulante-successione-posteggio-mercatale-guida-eredi`, `mercati-turistici-o-mercati-rionali-dove-conviene-banco`, `comprare-posteggio-lago-di-garda-turismo-stagionalita`.
- Lunghezza: da 5.500-6.800 a 3.100-3.500 caratteri (-45%).
- **Stile umano** da replicare per le prossime riscritture: paragrafi 2-3 righe, frasi nette alternate a una più lunga ogni tanto, numeri concreti (`4.500€ INPS`, `40-80% del fatturato`, `8-15 mila per furgone usato`), espressioni reali da ambulante (*"fai conto"*, *"spendi e dormi"*, *"non ti salva da una posizione brutta"*, *"piacere"*, *"al banco"*), niente trattini lunghi (—), niente `"esploriamo" / "approfondiamo" / "in conclusione"`, niente liste perfette uniformi. Variare attacco dei paragrafi.
- File SQL temporaneo `REWRITE_BLOG_HUMAN_BATCH_20260501.sql` rimosso dopo esecuzione.

### Tabella `blog_posts` — colonne attuali
- `id, slug, title, excerpt, content, category, author, published_at`. **NON ha `updated_at`** — UPDATE su content non aggiornano timestamp. Se serve forzare freshness, aggiornare `published_at` esplicitamente.

### CLI Supabase — esecuzione SQL diretta
- `./scripts/.bin/supabase.exe db query --linked --file <file.sql> --output json` esegue SQL contro il progetto linkato. Token in `.claude/settings.local.json` (`env.SUPABASE_ACCESS_TOKEN`). Soluzione comoda per UPDATE batch senza usare il SQL Editor web.

### Aggiunta grassetti chiave al primo batch di 10
- Su tutti i 10 articoli del batch precedente sono stati aggiunti **3-8 grassetti** sulla frase chiave del paragrafo (non interi paragrafi).
- Regola: bold solo sulle frasi che riassumono il punto, mai parole banali, max 1-2 per paragrafo. Esempi: *"il posteggio non è più tuo"*, *"non è il prezzo finale"*, *"venditore che ha fretta strana"*, *"il Garda non ti salva"*.

### Batch 2 — riscrittura altri 10 articoli (1 mag 2026)
- Articoli toccati: `mercato-settimanale-fiera-differenze-posteggio`, `rinnovo-concessione-posteggio-mercatale`, `posteggi-mercatali-campania-sicilia-comprare-vendere-licenze-sud`, `posteggi-mercatali-emilia-romagna-guida`, `posteggi-mercatali-veneto-guida-acquisto-vendita`, `licenza-ambulante-tipo-a-tipo-b-differenze`, `posteggi-mercatali-lombardia-guida-acquisto-vendita`, `aprire-attivita-ambulante-da-zero-o-comprare-posteggio-avviato`, `come-fare-subingresso-guida-completa`, `vendere-posteggio-mercatale-guida`.
- Lunghezze: 3.100-3.600 char (testo 2.800-3.220), grassetti 7-11 per articolo, integrati direttamente in fase di stesura.
- Tutti gli articoli > 4.500 char ora sono **zero**: il blog è completamente normalizzato.

### Restano da accorciare (priorità)
~~~14 articoli~~~ **Nessuno** sopra i 4.500 char. Eventuali batch futuri possono lavorare su articoli 3.500-4.500 (zona grigia) se lo stile è ancora datato.

### Nuovo filone: 20 articoli "Bandi posteggi per regione" (1 mag 2026)
- Slug pattern: `bandi-posteggi-mercatali-{regione}` (lombardia, veneto, piemonte, emilia-romagna, liguria, friuli-venezia-giulia, trentino-alto-adige, valle-d-aosta, toscana, marche, lazio, umbria, abruzzo, molise, campania, puglia, basilicata, calabria, sicilia, sardegna).
- **Categoria DB**: `Bandi` (nuova). Distinta dalle precedenti `Guide Regionali`/`Compravendita`/`Guida`.
- Lunghezza: 2.150-2.725 char di testo (sotto il target standard di 2.300-3.200 — voluto: pubblico include molti ambulanti stranieri, frasi corte e vocabolario base).
- Stile semplificato per non-madrelingua: termini tecnici spiegati al primo uso ("bando = annuncio pubblico del Comune", "concessione = permesso", "subingresso = comprare un posteggio già attivo"). Frasi 10-15 parole. Grassetti 15-21 per articolo per scorrimento veloce.
- Struttura uniforme: dove cercare i bandi (Albo Pretorio comunale + BUR/BURP/BURC/GURS regionale + portale SUAP) → quando escono (mar-apr e set-ott, 30 gg dalla pubblicazione per la domanda) → documenti (P.IVA + INPS commercianti + HACCP per alimentari) → graduatoria → alternativa subingresso → CTA.
- Date di pubblicazione **scaglionate** (29 apr → 1 mag 2026) con offset di ~2h tra articoli per simulare pubblicazione spalmata invece di un dump simultaneo (Google se ne accorgerebbe).
- **Google Discover ready (1 mag 2026)**: implementato. Colonna `cover_image_url text` aggiunta a `blog_posts` (nullable). I 20 articoli "Bandi" hanno cover Pexels (CDN Cloudflare con `?auto=compress&cs=tinysrgb&w=X&h=Y&fit=crop` per resize on-the-fly + WebP/AVIF auto, peso ~80-150KB invece di 4MB). `blog.html` ora:
  - Emette `<img>` hero in `renderPost` con `loading="eager" fetchpriority="high"` + `srcset` 4-step (600/900/1200/1600w) + `sizes="(max-width:768px) 100vw, 768px"` + `aspect-[16/9]` per evitare CLS.
  - Emette `<img>` thumbnail in `renderList` con `loading="lazy" decoding="async"` + `srcset` 3-step.
  - Schema `NewsArticle` (era `BlogPosting`) con `image` array a 3 aspect ratios (16:9, 4:3, 1:1) + `datePublished` + `dateModified` + `author` Organization.
  - `og:image` + `twitter:image` dinamici per ogni post (fallback Pexels generico se cover_image_url null per non rompere social share).
  - `<link rel="preconnect" href="https://images.pexels.com" crossorigin>` per accelerare il primo fetch.
- **Helper `_pexelsUrl(base, w, h)`** in blog.html: incolla parametri di resize all'URL Pexels base. Salvare nel DB l'URL nudo `https://images.pexels.com/photos/{id}/pexels-photo-{id}.jpeg` (senza query string), il renderer aggiunge i parametri dinamicamente per ogni dimensione richiesta.
- **Articoli vecchi senza cover**: gestiti con graceful fallback (no hero img mostrata in pagina detail né thumbnail in lista). og:image usa una foto generica per non rompere lo share.

### Filoni futuri suggeriti (long-tail)
- **Mercati storici per nome** (30-40 articoli): Porta Palazzo, Senigallia Naviglio, Vucciria/Capo/Ballarò, Pignasecca, Sant'Ambrogio, Esquilino, Mercato delle Erbe, Prato della Valle, Fera 'O Luni, ecc.
- **Domande pratiche specifiche** (15-20 articoli): "Chi paga il notaio nel subingresso", "Posteggio in comproprietà fra fratelli", "Decadenza per assenze come si difende", "Ricorso TAR posteggio mercatale".
- **Settori specifici** (10-12 articoli): banco fiori, ortofrutta, abbigliamento usato, alimentari, artigianato.
- **Stagionali ricorrenti** (5-6): bandi anno X, mercatini di Natale, sagre primavera, Black Friday ambulanti.

### Pagine geo `/annunci/[citta]` — placeholder indicizzabile (1 mag 2026)
- **`api/_capoluoghi.js`** (nuovo): costante condivisa con 141 città italiane (105 capoluoghi di provincia + 14 turistiche tipo Sirmione/Capri/Taormina + 11 Lago di Garda/Romagna + 11 Riviera/altre). Esporta `CAPOLUOGHI` (array) e `CAPOLUOGHI_BY_SLUG` (map per lookup O(1)).
- **`api/annunci-citta.js`**: nuovo branch nel handler. Quando una città non ha annunci attivi e lo **slug è nella lista capoluoghi** → risponde **200 OK + indicizzabile** con template `renderEmptyCityPage()` (status box "0 annunci attivi a X in questo momento" + CTA verso /vendi e /annunci + sezione info commercio ambulante della città + FAQ 5 Q&A). Schema `BreadcrumbList` + `FAQPage`. Niente AggregateOffer/ItemList senza dati. Niente claim falsi.
- Slug **non in lista** + 0 annunci → 404 + noindex (anti-spam SEO).
- Quando arriva il primo annuncio reale per una città placeholder (es. Roma), la pagina si auto-popola con la lista vera al successivo crawl: zero modifiche al codice.
- **`api/sitemap.js`**: include tutte le 141 città a prescindere dagli annunci. Citta CON annunci → priority 0.8, changefreq daily, lastmod = max(created_at). Città SENZA annunci → priority 0.5, changefreq monthly, lastmod = today.
- **Test smoke** (5 scenari verificati): milano→full-list, napoli→placeholder, roma→placeholder, inventato→404, salo→full-list. Tutti passano.

### Importante: lookup città con accenti
Il bug più sottile risolto: `slugToCity('salo')` ritorna `'Salo'` senza accento → query Supabase `comune=ilike.Salo` non matcha annunci con `comune='Salò'`. Soluzione: lookup PRIMA in `CAPOLUOGHI_BY_SLUG` (che ha il nome corretto con accento), fallback su `slugToCity()` solo per slug non riconosciuti. Tutte le città italiane con accenti (Forlì, Salò, L'Aquila, Cefalù, Cortina d'Ampezzo) sono in lista esplicita.

### Chiusura sessione 1 maggio 2026 — checkpoint operativo
- **Rich Results Test verificato dall'utente**: `/blog?post=bandi-posteggi-mercatali-lombardia` → ✅ 1 elemento `Articles` valido (NewsArticle riconosciuto). `/annunci/milano` → ✅ 3 elementi validi (BreadcrumbList + Carousels=ItemList + FAQ). AggregateOffer non viene contato come "rich result" ma è valido come schema.
- **Indicizzazione manuale Search Console**: l'utente ha indicizzato 9 articoli "Bandi" il 1 mag (Lombardia → Toscana). Quota giornaliera Search Console = ~10-15 URL/giorno. Resto da indicizzare nei giorni successivi tracciato in `C:\Users\utente\Desktop\indicizzazione-search-console.txt` (file utility creato per l'utente, non parte del repo): 11 bandi rimanenti + 17 città con annunci + 10 capoluoghi placeholder + 15 capoluoghi medi opzionali.
- **Decisione "annunci finti per attivare pagine SEO geo"**: scartata. Soluzione adottata: pagine placeholder oneste indicizzabili (vedi blocco sopra). L'utente ha confermato la scelta.
- **Filoni futuri proposti** (in ordine di ROI per il prossimo lavoro):
  1. **Domande dolorose specifiche** (12-15 articoli, 1.800-2.500 char) — "Cosa succede al posteggio se vado in pensione", "Pignoramento posteggio", "Furto al banco", "Posteggio ereditato e divisione fra fratelli", "Multa al banco", "Banchi vicini sleali". Risposte dirette, catturano AI Overview di Google. **Filone consigliato come prossimo**.
  2. **Mercati storici per nome** (30-40 articoli) — Porta Palazzo, Senigallia Naviglio, Vucciria/Capo/Ballarò, Pignasecca, Sant'Ambrogio, Fera 'O Luni, ecc. Lavoro più lungo ma traffico stabile sul lungo periodo.
  3. **Numeri & classifiche** Discover-friendly — "Quanto guadagna davvero un ambulante", "10 posteggi più cari d'Italia", "Settori più redditizi al mercato". 5-7 articoli.
  4. **Storie e casi reali** — diari di vendita/acquisto. 3-5 articoli.
  5. **Tool interattivi** — calcolatore presenze/spunte, calendario mercati per città, stima IRPEF/IVA ambulanti. Landing page, non blog post.
- **`Annunci Demo`** ancora presenti nel DB (10 annunci finti Carla M./Marco V. su admin) — NON cancellati: il sito ne ha ancora bisogno per popolare l'UI mentre arrivano annunci veri. Da rivedere quando ci saranno 30+ annunci reali.

## 🏘️ Pagine /annunci/[citta] estese a 7904 comuni (2 maggio 2026)

**Decisione di rollback parziale**: le pagine `/comune/[slug]` info-first costruite il 2 mag sono state rimosse. L'utente preferisce un'unica route `/annunci/[citta]` con UX coerente al resto del sito invece di una pagina-landing custom.

**Nuovo comportamento di `/annunci/[citta]`**:
- **Capoluoghi (137)**: pagina speciale 200 OK con FAQ, AggregateOffer, schema. Comportamento invariato.
- **Slug con annunci attivi**: pagina speciale listing-first 200 OK. Comportamento invariato.
- **Comune ISTAT valido (in `data/comuni.json`) ma senza annunci e non capoluogo**: **redirect 302 a `/annunci?q=<NomeComune>`** — l'utente atterra sulla pagina annunci classica con la search bar pre-compilata. UX naturale, niente landing custom.
- **Slug invalido (typo, non comune reale)**: 404 + noindex.

### Dataset (mantenuto)
- **`data/comuni.json`** (1.4 MB, 7904 record): slug, nome, regione, provincia, sigla, popolazione, lat/lng, codiceIstat. Usato da `api/annunci-citta.js` per validare slug e fare il redirect verso `/annunci?q=<nome>`. Bundlato statico, zero query DB.
- **`scripts/build-comuni.js`**: merge ISTAT (matteocontrini) + lat/lng (MatteoHenryChinaski). Slug consistenti con `_capoluoghi.js`. 14 dedup automatici con suffisso sigla.
- **`PATCH_TOP_COMUNI_VIEWS_20260502.sql`** + funzione admin `loadTopComuni` in dashboard: già deployati. Funzione RPC `admin_top_comuni_views` esiste su Supabase (eseguita 2 mag). Mostra top 10 path `/annunci/<slug>` per page_views ultimi 30 giorni — pattern path coerente con la nuova architettura, solo si aggiornerà quando ci saranno page_views.

### File rimossi (rollback)
- `api/comune.js` — cancellato.
- Rewrite `/comune/:slug` in `vercel.json` — rimosso.
- 7904 URL `/comune/[slug]` in sitemap — rimossi. Sitemap torna a ~236 URL totali (statiche + annunci + blog + città).
- 10 link `/comune/X` in homepage — sostituiti con `/annunci/X`.

### Da NON ripetere
- Non ricreare pagine landing programmatiche custom per i 7904 comuni: l'utente le considera "paginate speciali che non portano da nessuna parte". UX coerente con il resto del sito > SEO programmatico per comuni piccoli.
- Se in futuro si vuole comunque migliorare il SEO long-tail dei piccoli comuni, valutare prima un approccio meno invasivo (es. testo SEO breve dentro la pagina annunci normale, niente landing dedicata).

## 📰 Test pivot articoli "Bandi" — Lombardia (2 maggio 2026)

**Cambio strategico**: l'utente ha notato che gli articoli `bandi-posteggi-mercatali-{regione}` sono **tutorial generici** sul "come funziona un bando", ma chi cerca "bandi posteggi mercatali abruzzo" vuole vedere **una lista di bandi reali** (anche scaduti). Mismatch di intent → bounce rate alto.

**Test pilota su Lombardia** (1 articolo riscritto, gli altri 19 inalterati per ora):
- Articolo `bandi-posteggi-mercatali-lombardia` riscritto da 3.268 → 5.322 caratteri.
- Title: `Bandi posteggi mercatali in Lombardia: lista recente e dove cercare`.
- Aggiunta sezione "Esempi di bandi pubblicati di recente" con **6 bandi reali** ricercati su Albi Pretorio comunali: Codogno (LO) venerdì + martedì agricoli, Lovere (BG) sabato, Trezzo sull'Adda (MI), Magenta (MI) Fiera San Biagio, Toscolano Maderno (BS) agricoli, Melzo (MI) miglioria.
- **Onestà esplicita** nell'intro: "quasi tutti questi sono già scaduti — non sono offerte attive — ma il pattern si ripete ogni anno negli stessi mercati". Evita che chi atterra si arrabbi.
- `published_at` bumpato a `now()` → forza Google a vedere `dateModified` aggiornato.

**Decisione di scaling**: replicare il pattern alle altre 19 regioni **solo se** dopo 1-2 settimane Search Console mostra miglioramento di CTR/posizione/click sull'articolo Lombardia. Workflow di aggiornamento automatico bandi (scraping albi pretori) **non** prioritario adesso — si fa "pian piano" manualmente con bandi vecchi per riempire.

### Pattern stile rewrite bandi (per replica futura)
- Lunghezza: **2.500-5.500 char** (più dei 2.150-2.725 originali, perché si aggiunge la lista reale).
- Stile: paragrafi 2-3 righe, frasi nette, numeri concreti (3×4 m, scadenze precise, costi 70-150 €), espressioni reali ambulante. Niente "esploriamo/in conclusione/approfondiamo".
- Grassetti 25+, sulle frasi chiave (mai parole singole banali).
- Struttura: intro breve + "Esempi di bandi pubblicati di recente" (5-7 voci con `<h3>` per Comune) + "Dove cercare i bandi attivi oggi" + "Cosa serve per fare domanda" + "Tempi e graduatoria" + "Se non vuoi aspettare un bando" → CTA `/annunci.html` + `/valutatore.html`.
- Per ogni bando, includere quando possibile: **mercato/giorno**, **dimensione posteggio**, **scadenza**, **modalità invio** (PEC firmata, portale telematico, SPID/CNS), **link Comune** (se pertinente).

## ⏳ TODO — Cose pendenti dalla sessione 2 maggio 2026

Lista pratica delle cose lasciate aperte (per non dimenticare).

### Da fare nei prossimi giorni (alta priorità, manuale)
1. **Indicizzazione Search Console**: continuare a sottomettere ~10 URL/giorno (quota giornaliera). Lista da indicizzare già tracciata in `C:\Users\utente\Desktop\indicizzazione-search-console.txt`. Resta da indicizzare: 11 articoli "Bandi" rimanenti + alcune `/annunci/[citta]` con annunci + capoluoghi placeholder.
2. **Spot check live deploy del rollback `/comune` → `/annunci`** (già pushato ma verifica visiva):
   - `https://subingresso.it/annunci/milano` → deve mostrare la pagina speciale Milano (con annunci).
   - `https://subingresso.it/annunci/abano-terme` → deve fare redirect a `/annunci?q=Abano%20Terme` con la search bar pre-compilata.
   - `https://subingresso.it/comune/milano` → deve dare 404 (URL non più attivo).

### Da monitorare (1-2 settimane)
3. **Metriche articolo Lombardia riscritto** (`/blog?post=bandi-posteggi-mercatali-lombardia`): controllare su Search Console fra 7-14 giorni:
   - Impressioni
   - CTR
   - Posizione media sulla query "bandi posteggi mercatali lombardia" e simili
   - Click assoluti
   - **Decisione GO/NO-GO**: se le metriche migliorano vs. periodo precedente, replicare il pattern alle altre 19 regioni. Se peggiorano o restano uguali, abbandonare il filone "lista bandi" e tornare al format tutorial.

### Da fare quando il pilota è validato (medio termine)
4. **Replica articoli bandi alle altre 19 regioni**: stessa struttura della Lombardia con 5-7 bandi reali per regione. Lavoro stimato: ~30-45 min per articolo (ricerca su albi pretori + scrittura) = 10-14 ore totali.
5. **Aggiunta bandi vecchi alle liste già fatte**: l'utente ha detto "li aggiorneremo pian piano col tempo, anche con bandi vecchi". Tenere una cadenza mensile (10-15 minuti) per aggiungere 1-2 bandi storici a ciascuna regione fatta.

### Lungo termine (futuro non prioritario)
6. **Workflow automatico aggiornamento bandi**: scraping degli Albi Pretorio comunali per le top 50 città italiane → estrazione bandi attivi → push automatico nel blog. Investimento dev significativo (5-10 giorni). NON prioritario: ha senso solo se il pivot Lombardia funziona e si decide di scalare seriamente.
7. **Annunci Demo da eliminare**: 10 annunci finti (Carla M., Marco V. ecc.) ancora nel DB. Da cancellare quando ci saranno 30+ annunci reali — ad oggi (2 mag 2026) il sito ne ha bisogno per popolare l'UI.

### Stato deploy/SQL (riferimento rapido)
- `PATCH_TOP_COMUNI_VIEWS_20260502.sql`: **deployato 2 volte** su Supabase. Versione finale traccia path `/annunci/<slug>` (non più `/comune/`). Funzione `admin_top_comuni_views(p_days)` attiva, pannello dashboard "Top comuni" si nasconde finché non ci sono dati.
- Tutte le altre patch SQL del progetto: invariate.

## 🛡️ Sicurezza — Pannello dashboard admin (3 maggio 2026)

### Riordino sezioni dashboard
- **`pendingReviewSection` spostato sopra "Crescita del sito"** in `dashboard.html`. È la PRIMA cosa visibile dell'admin panel quando ci sono annunci da approvare. Bordo `border-2 border-amber-300` + `shadow-md` per renderlo più evidente. Mantiene il comportamento `hidden` di default → si mostra solo se `loadPendingListings()` trova `data.length > 0`.
- **Nuovo `securityPanel`** subito dopo, sempre visibile (gradient slate scuro). Mostra:
  - 4 badge stats: signup ultima ora (red se ≥20), 24h, 7g, non confermati 24h (red se ≥10).
  - `securitySuspectSection` (hidden if vuoto): account che matchano pattern probe/scanner — `.invalid$/.test$/.local$/.example$`, domini temp-mail noti, `^word_unixtimestamp@`, keyword tipo `rlstest|hunter_|owasp|sqlmap|injection|xsstest|burpcollab`. Bottone Elimina inline che riusa `deleteAdminUser()`.
  - `securityAlertsSection` (hidden if vuoto): ultime 5 entries di `admin_alerts_log` con `issues_count > 0`, dettaglio espanso (titolo + detail di ogni issue). Badge "EMAIL INVIATA" se notified.
  - `securityAllClear` (verde): mostrato quando 0 sospetti + 0 anomalie.
  - Bottone "Esegui check" in alto: chiama `admin-anomaly-check` edge function via fetch e ricarica il pannello. Toast informativo (skipped/found/clean).

### Nuovo RPC
- **`admin_security_overview()`** SECURITY DEFINER, granted a `authenticated`. Verifica `profiles.is_admin = true` o `raise exception 'Forbidden'`. Ritorna jsonb con:
  ```json
  {
    "signups_last_hour": int, "signups_last_24h": int, "signups_last_7d": int,
    "unconfirmed_24h": int,
    "suspect_signups": [{id, email, created_at, confirmed, signed_in}],
    "recent_alerts":   [{id, checked_at, issues_count, issues, notified}],
    "last_anomaly_check": timestamptz, "generated_at": timestamptz
  }
  ```
- File: `PATCH_ADMIN_SECURITY_OVERVIEW_20260503.sql`. **Deployato** via CLI il 3 mag 2026.

### Nuove funzioni JS in dashboard.html
- `loadAdminSecurityOverview()` — chiamata nell'init admin (dopo gli altri loader) e dopo `deleteAdminUser` per refresh immediato.
- `renderSecurityOverview(d)` — disegna le 3 sezioni sopra dal jsonb.
- `_securityRelTime(d)` — helper italiano "5 min fa / 3 ore fa / X giorni fa".
- `runAnomalyCheckNow(btn)` — POST a `/functions/v1/admin-anomaly-check` con bearer admin + apikey, mostra toast e ricarica pannello.

### Episodio probe 3 maggio 2026 (motivazione del pannello)
- Trovati 2 account in DB con pattern scanner: `hunter_1777824966@temp.com` e `rlstest_1777824970_a@pwned.invalid`. Creati alle 16:16 UTC, 4 secondi di distanza, via standard `auth/signup` (non bypass), mai confermati, mai loggati. Probabile sessione ChatGPT Codex dell'utente in modalità "in sola lettura" che ha invece eseguito anche signup di test (per probare la RLS leak ipotizzata).
- **`auth.audit_log_entries` è vuota** (0 righe totali) — su questo progetto Supabase l'audit log non è popolato. Per IP/UA reali serve il Logs Explorer del Dashboard Supabase, non il DB.

### Bug RLS che ChatGPT ha segnalato — RISOLTI 3 mag 2026 (P0+P1)

**P0 — RLS PII leak (CONFERMATO live + RISOLTO):**
- Test live: anon poteva scaricare 16 telefoni e 1 email da `/rest/v1/annunci?select=tel,email&status=eq.active`, e 15 telefoni da `/rest/v1/profiles?select=telefono`. Confermato leak attivo.
- Fix: `PATCH_RLS_PII_LEAK_20260503.sql` — `REVOKE SELECT ON public.annunci FROM anon` + `GRANT SELECT (cols safe escluse tel/email)`. Stesso pattern su `profiles` (esclude telefono, is_admin, email_digest, email_stats, unsub_token, vetrina_welcome_days).
- `authenticated` non toccato → utenti loggati continuano a leggere tutto. **TODO sessione 2**: anche authenticated non dovrebbe vedere tel/email/telefono di ALTRI utenti, serve refactor con vista pubblica + ownership check.
- Effetto collaterale gestito: `select('*')` da anon ora dà 42501 → fixati 3 punti del client (`index.html` loadRecentListings, `profilo.html` lista venditore, `js/pages/annunci.js` fallback) sostituendo `select('*')` con select esplicito di tutte le colonne tranne tel/email.
- Le SSR (`api/annuncio.js`, `api/annunci-citta.js`, `api/sitemap.js`) usavano già select esplicito con campi safe → non hanno richiesto modifiche per il leak.

**P0 — Allineamento repo a prod:**
- `SETUP_DEF_SUBINGRESSO.sql` ESISTE nel repo (errore precedente: glob `SETUP*` aveva fallito sulla mia ricerca, l'avevo dato per inesistente). Aggiunta sezione 12 con la patch RLS PII al file. **TODO sessione futura**: dump completo schema (`supabase db dump --linked --schema public`) per allineare TUTTO (manca: featured*, expires_at, visualizzazioni, page_views, valutatore_logs, saved_listings, alerts, ecc.).

**P1 — `/js/config.js` 404:**
- Rimosso `<script src="/js/config.js"></script>` da entrambe le pagine SSR di `api/annunci-citta.js` (capoluogo + placeholder). Il file non esisteva e dava 404 in console.

**P1 — Tailwind CDN nelle SSR:**
- Sostituito `<script src="https://cdn.tailwindcss.com"></script>` con `<link rel="stylesheet" href="/css/tailwind.css?v=2">` in:
  - `api/annunci-citta.js` (2 occorrenze: capoluogo + placeholder)
  - `api/annuncio.js` (1 occorrenza)
- `tailwind.config.js` content esteso da `["./*.html", "./js/**/*.js"]` a `["./*.html", "./js/**/*.js", "./api/**/*.js"]` per scansionare le classi usate nei template SSR.
- CSS ricompilato con `npx tailwindcss -i tailwind.input.css -o css/tailwind.css --minify` (788ms).

### Bug minori ChatGPT — ANCORA APERTI (non urgenti)
- **`moderation.js` morto**: `moderaAnnuncio` definito ma non incluso in nessun HTML. Mitigato dal trigger DB `enforce_annunci_status` che forza `pending` per non-admin. Da decidere: rimuovere il file o includerlo davvero.
- **Link interni `annuncio.html?id=` vs `/annuncio?id=`**: bypassano SSR per click interni. Impatto SEO minimo (Googlebot atterra su URL pulito).
- **Admin hardcoded in `setup-database.sql`** (file vecchio): in prod usate già `is_admin`, è solo igiene del repo.
- **UPDATE policy senza `WITH CHECK`**: Postgres riusa USING come default, è solo pulizia.
- **Bug foto `modifica-annuncio.html` (img[src^="http"])**: fragile ma in pratica funziona.
- **CSP assente**: vero ma 1 settimana di lavoro per non rompere nulla → da pianificare.


---

# 📓 Log Sessioni (da informazioni.md)

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
