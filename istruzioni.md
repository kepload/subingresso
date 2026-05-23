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

## 🚨 Anti-Leak Segreti (post-incidente 4 mag 2026)

**Cosa successe**: ho recuperato la `service_role` JWT con `db query`, l'ho iniettata hardcoded in `PATCH_CRON_AUTH_20260504.sql`, ho committato + pushato. GitHub secret scanning l'ha rilevata in <5 min. Sito pubblico → repo pubblico → bot scraper.

**Difese ora attive**:
1. **`.gitleaks.toml`** + **`.git/hooks/pre-commit`**: gitleaks scansiona ogni commit, blocca se trova `sb_secret_*` o JWT service_role. Binario `scripts/.bin/gitleaks.exe` (gitignored). Custom rules per pattern Supabase nuovi. Allowlist per FAKE/EXAMPLE/`<REVOKED-...>`.
2. **GitHub Push Protection** (Repo Settings → Code security): blocca push lato server.
3. **Regole CLAUDE.md** anti-leak.

**Regole operative**:
- **MAI** hardcodare segreti in `.sql`, `.md`, `.ts`, `.js`, `.json`, ecc.
- **PATCH SQL con chiave** → file template con `:'service_jwt'` + `psql -v service_jwt="$KEY"`. OPPURE file in `/tmp/` (fuori repo), apply, delete.
- **MAI** fare `db query` per ottenere una chiave e poi `Write/Edit` quel valore in un file dentro il repo.
- Bypass `git commit --no-verify` SOLO se 100% sicuro che il diff è pulito.
- Se chiave esposta: 1) rotala su Supabase Dashboard, 2) sanitizza HEAD, 3) `git filter-branch` + force-push, 4) elimina backup branch remoto.

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

**REGOLA EVERGREEN — Audit prima del commit nuovo Tailwind**: prima di shippare un componente con responsive variants, fare audit `awk 'BEGIN{RS="}"} /pattern/' css/tailwind.css | grep -oE '...'` per CONFERMARE che le classi `lg:`/`md:`/`sm:` esistano nel build. Il content scanner di Tailwind v3 lavora solo se il template è scansionato dal config; classi nuove richiedono `npx tailwindcss -i tailwind.input.css -o css/tailwind.css --minify` + bump `?v=N` su tutti i file (21 file usano `tailwind.css?v=`). Bug 9 mag 2026 sera: bento blog list cadeva in `sm:grid-cols-2` su lg+ perché `lg:grid-cols-1` non era compilato → 2 col affiancate invece di 1 stack verticale alla destra del hero. Stessa categoria di mancanze: `lg:text-6xl`, `lg:text-lg`, `md:text-5xl`, `md:text-xl`, `md:p-8`, `hover:shadow-2xl`, `hover:shadow-lg`, `group-hover:scale-[1.02]`, `hover:-translate-y-*`, `line-clamp-3`, `content-start`. Sintomi tipici: layout collassa, hover non risponde, dimensioni font non scalano sui breakpoint.

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
- Mobile: due pannelli (`convPanel` + `chatPanel`), si alterna visibilità. `backToConversations()` torna alla lista. NON fondere i div.
- **Join profiles in `conversazioni` rompe PostgREST** (stesso bug di annunci). 3 fetch separati: (1) conv+annuncio, (2) profiles `.in('id', userIds)`, (3) lastMessage per conv. Merge manuale.
- **Header chat**: thumb annuncio cliccabile (cover img_urls[0]) + titolo + "Venditore · Prezzo" + chevron, va a `/annuncio?id=`. Lato admin chat supporto: thumb life-ring + nome utente.
- **Avatar reali in lista**: foto profilo dell'interlocutore (controparte). Fallback iniziale su sfondo blue-600. `<img loading="lazy" decoding="async">` no resize server (free plan).
- **Doppia spunta mie bolle**: `fa-check` grigio = inviato, `fa-check-double` blu (`text-blue-500`) = letto. Realtime UPDATE listener su `messaggi.letto` aggiorna in tempo reale quando l'altro apre la chat.
- **"Sta scrivendo…"**: broadcast Supabase su `_realtimeChannel` (`channel.send({type:'broadcast', event:'typing', payload:{u}})`) con throttle 1.5s emit, auto-hide 2.5s ricezione, hide all'arrivo INSERT. Zero scritture DB.
- **Lazy conv create**: niente più creazione conv al click "Contatta". `startChat()` in `annuncio-detail.js` se non esiste conv passa `?annuncio=<id>` (deep-link draft). `messaggi.html` apre in `_draftAnnuncio` mode (header + thumb annuncio + empty state, senza riga DB). `sendMessage` crea conv on-the-fly al primo INSERT. `loadConversations` filtra `c.lastMessage || c.is_support` come safety net per conv vuote già esistenti.
- **Chat di Supporto** (PATCH_SUPPORT_CHAT_20260504.sql): `conversazioni.is_support bool` + `annuncio_id` ora nullable + unique partial index `(acquirente_id) WHERE is_support`. RPC `support_admin_id()` SECURITY DEFINER. Lato non-admin: pseudo-conv `SUPPORT_DRAFT_ID='__support_draft__'` sempre **in fondo** (non in cima — l'utente vuole low-key) anche senza messaggi. Avatar/thumb = logo Subingresso (`fa-exchange-alt` su bg-blue-600). Empty state copy: "Ciao! Raccontaci come possiamo aiutarti…". Deep link `/messaggi?support=1` apre direttamente. Footer ha voce "Supporto". Lato admin: titolo conv = nome utente + badge "Supporto".

## 🚩 Segnalazioni Conversazioni (DSA compliance)

- Schema (`PATCH_REPORTS_20260504.sql`): tabella `conversation_reports(id, conversazione_id, reporter_id, reason CHECK scam/harassment/spam/other, details, status open/reviewed/dismissed, reviewed_at, reviewed_by, admin_notes)`. RLS: INSERT solo partecipanti conv. SELECT/UPDATE solo `is_admin`. Unique partial idx `(reporter_id, conversazione_id) WHERE status='open'` = anti-flood (1 sola open per coppia).
- 2 RPC SECURITY DEFINER: `admin_list_reports(p_status)` joina reporter+annuncio+is_support. `admin_update_report_status(report_id, status, notes)` valida is_admin + 3 status ammessi.
- Frontend `messaggi.html`: kebab `⋮` nell'header chat (fuori da `chatHeaderLink` per evitare bubble click), nascosto su draft/supporto/no-conv. Modal con 4 radio motivo + textarea details (max 500). Submit: INSERT + fetch fire-and-forget Edge `notify-report` con JWT user. 23505 → "Hai già una segnalazione aperta su questa chat".
- Edge function `notify-report` (`--no-verify-jwt`): valida `auth.getUser(jwt)` + `report.reporter_id === user.id`. Email a tutti gli admin con motivo + dettagli + ultimi 3 messaggi + link a `dashboard.html#reports` e `/messaggi?conv=`.
- Pannello dashboard.html dentro `adminPanel`: anchor `#reports`, tab Aperte/Gestite/Archiviate, badge rosso conteggio open. Bottoni Apri chat / Marca gestita / Archivia / Riapri.
- **Auto-hide pannello** (5 mag 2026): `#reportsPanel` parte con class `hidden`. `loadAdminReports()` lo rivela solo se Aperte > 0. Le storiche in Gestite/Archiviate non lo riportano visibile (sarebbe rumore inutile). 1 RPC in più per il count delle aperte, costo zero.

## 🔍 SEO & Google

- `api/sitemap.js`: sitemap dinamica Vercel, auto-include annunci attivi + blog + 141 città. `vercel.json` rewrite `/sitemap.xml → /api/sitemap`.
- Google Search Console verificato (file `googlead37f27accd4fd2b.html` in root).
- JSON-LD `Product+BreadcrumbList` in `annuncio-detail.js` E in `api/annuncio.js` (SSR). JSON-LD `ItemList` in `annunci.js`. JSON-LD `NewsArticle` in `blog.html` (era `BlogPosting`, cambiato per Discover).
- **Regola evergreen (16 mag 2026)**: il `Product` JSON-LD deve SEMPRE avere `image` (campo obbligatorio per il rich result "Schede commercianti" di SC), altrimenti errore critico e scheda scartata. Annunci senza foto → fallback brand `https://subingresso.it/og/og-home.jpg?v=1`. Lo stesso fallback alimenta `og:image` (mai vuota). Il fix va tenuto allineato in DUE punti: `api/annuncio.js` (var `ogImg`) e `js/pages/annuncio-detail.js` (il client RICOSTRUISCE e sovrascrive `_jsonLd` post-hydration, Googlebot lo renderizza). I 3 warning non critici (brand/spedizione/reso) non si applicano a una cessione di concessione: ignorabili. `cleanUrls` ON: pagina indicizzata e rankabile anche col rich result non idoneo, non è un blocco SEO.
- Pagine geo `/annunci/[citta]` SSR in `api/annunci-citta.js` con FAQPage + AggregateOffer + ItemList + BreadcrumbList. Capoluoghi (137) hanno pagina speciale anche senza annunci. Comune ISTAT non capoluogo senza annunci → 302 a `/annunci?q=<nome>`. Slug invalido → 404 + noindex.
- **Matching 3-tier per capoluoghi** (5 mag 2026): la pagina `/annunci/[capoluogo]` ora unisce in ordine: (1) comune esatto, (2) stessa provincia se il capoluogo è di provincia (heuristica `provincia.startsWith(cityName)` → Brescia=Brescia ✓, Forlì=Forlì-Cesena ✓, Sirmione=Brescia ✗), (3) entro 200 km in fallback. Lookup provincia/lat/lng via `comuni.json` server-side perché `annunci.provincia` è quasi sempre NULL (vendi.html non lo popola). H1/title/description riflettono lo scope ('comune' / 'provincia' / 'mixed' / 'radius'). Capoluoghi turistici (Sirmione/Capri/...) saltano tier2 e vanno direttamente al radius. Slug ISTAT non-capoluogo NON espande (resta redirect 302 a `/annunci?q=`) per evitare di indicizzare 7904 pagine sottili.
- **`api/annuncio.js` SSR**: serve la pagina annuncio per SEO/Google. Template HTML INLINE (non legge file da disco), 358 righe. **`annuncio.html` è un file orfano duplicato** in repo: NON deployato (in `.vercelignore`) perché con `cleanUrls` interceptava `/annuncio` PRIMA del rewrite, servendo template vuoto a Google → "Annuncio non trovato" indicizzato (bug 6 mag 2026). NON rimuovere `annuncio.html` da `.vercelignore`, NON spostarlo nel deploy. Le `?v=` degli script (data/ui-components/auth/annuncio-detail) vanno tenute allineate dentro `api/annuncio.js` quando bumpate altrove (precedente disallineamento v=6/v=4/v=5 vs v=9/v=11/v=10 risolto 4 mag 2026).
- `data/comuni.json` (1.4 MB, 7904 record): bundle statico, validazione slug + redirect.
- **Link interni senza `.html`** (5 mag 2026): tutti gli `href` interni puntano a `/annunci`, `/vendi`, `/annuncio?id=…` ecc. cleanUrls in vercel.json gestisce il fallback. NON rimettere `.html` o si genera chain redirect 308. `redirectTo` Supabase password reset usa `/reset-password` (no `.html`).
- **canonical valutatore** = `/valutatore` (senza `.html`), allineato a sitemap. Stesso per og:url, JSON-LD `url`.
- **og:image home** (5 mag 2026): self-hosted in `/og/og-home.jpg` (1200×630, JPEG q90, ~95KB). Generata ad hoc: piazza italiana sfocata + bancarelle + scritta "Subingresso.it" centrata. Lavagnette VUOTE — la prima versione aveva "FRESCO LOCALE / PRODOTTI ITALIANI" ma framing produce-market è off-brand (sito vende licenze, non cibo). Tag espliciti `og:image:width/height` + `twitter:card=summary_large_image` + `?v=N` per forzare re-scrape social. **`/annunci` e `/blog` ancora con foto Pexels** (l'utente ha chiesto fix solo home).
- **og:image annuncio** dinamico: prima foto dell'annuncio via `api/annuncio.js` SSR. NON tocca la home og:image.
- **Layout bento `/blog` lista (9 mag 2026)**: `renderList()` in `blog-template.html` non è più mono-colonna. Su lg+ outer grid 3-col: hero card grossa `col-span-2` (cover 16:9 + badge categoria + H1 + excerpt 3 righe) a sinistra, side stack di 4 card orizzontali (img 96x96 + titolo line-clamp-3, layout via `display:grid; grid-template-columns:96px 1fr` inline come safety net) a destra. Sotto: grid 3-col uniforme per il resto. Su mobile collassa tutto a 1 col. Main si allarga a `max-w-7xl` solo se lista (singoli post restano `max-w-3xl` per leggibilità). Banner valutatore nascosto sulla lista (intent discovery, non venditore). Intro SSR masthead: eyebrow + H1 hero `text-4xl→md:text-5xl→lg:text-6xl` con accent blu su "mercati" + lead `text-lg/xl` + 5 chip tematici colorati + 2 paragrafi SEO sotto divisore. Niente più box bianco.
- **`api/blog.js` cache header**: `Cache-Control: public, max-age=0, s-maxage=180, stale-while-revalidate=600, must-revalidate`. `max-age=0` forza browser a revalidare ad ogni hit (CDN resta cached 180s). Fix bug 9 mag dove browser teneva HTML stale post-fix.
- **`api/blog.js` SSR (7 mag 2026)**: serve `/blog?post=<slug>` e `/blog` (lista) via rewrite incondizionato `/blog -> /api/blog`. Fetch del post da `blog_posts` Supabase, riusa `blog-template.html` come template via `fs.readFileSync(path.join(process.cwd(), 'blog-template.html'))` e fa string-replace dei meta tag head (`title`, `description`, `og:*`, `canonical`, `twitter:image`) + inietta `<script type="application/ld+json">` NewsArticle + `<meta robots max-image-preview:large>`. Slug invalido = 404 + noindex (no soft-404). Cache `s-maxage=180`. **Il template DEVE chiamarsi `blog-template.html`, NON `blog.html`**: testato 7 mag 2026 — con `blog.html` deployato come static, cleanUrls intercetta `/blog` PRIMA del rewrite e la function non viene mai invocata (stesso bug noto di `annuncio.html`). **NON mettere il template in `.vercelignore`** o la function fallisce con `FUNCTION_INVOCATION_FAILED` (`includeFiles` in functions config NON ribalta l'esclusione di .vercelignore — testato 7 mag 2026). **NON usare rewrite con `has` query** per `/blog`: il filesystem statico vince comunque sul rewrite condizionale. Lo stesso pattern di `api/annuncio.js` (rewrite incondizionato + nome file template diverso) funziona.
- **Lista `/blog` SSR custom (9 mag 2026, anti-thin-content)**: quando il path è `/blog` senza `?post=`, `api/blog.js` ora customizza meta tag SEO (`Blog Subingresso — Guide, Bandi e Compravendita Posteggi Mercatali` + description ottimizzata) e inietta una `<section id="blogListIntro">` con H1 + ~165 parole di intro originale (3 paragrafi: cosa offre il blog, regioni coperte, focus territori turistici). Iniezione tramite replace sul marker `<div id="loading"`. Ragione: 8 mag 2026 SC mostrava `/blog` tra "Discovered, currently not indexed" — la lista era pure card grid, classificata come thin content da Google. Cache `s-maxage=180`.
- **Annunci correlati SSR su `/annuncio` (9 mag 2026)**: `api/annuncio.js` ora fa un secondo fetch a Supabase per 3 annunci attivi della stessa regione (esclusione self) e popola direttamente l'HTML del `#relatedSection` (prima era `hidden` finché il client lato JS lo riempiva post-hydration → Google non vedeva i link). Card SSR semplificata: cover + comune + titolo + prezzo, link diretto a `/annuncio?id=`. Bottone "Vedi tutti" linka `/annunci?regione=X`. Il client-side mantiene il populate via `buildCard` con `relatedGrid.innerHTML = ...` (sovrascrive il SSR ma stessi link). Effetto: 6+ link interni nuovi visibili a Googlebot per ogni pagina annuncio → spinge crawl/indicizzazione delle 6 pagine annuncio ancora "Discovered, not crawled".
- **Meta SEO completi** (description, canonical, og:type/site_name/locale/url/title/desc, twitter:card) anche su contatti/privacy/termini/annunci.
- **`messaggi.html` ha `<meta robots noindex,nofollow>`** in aggiunta al Disallow di robots.txt.
- **Sitemap online**: 247 URL, refresh 1h, status 200.

## 🃏 Card Annunci (`buildCard` in `data.js`)

- La card è un `<div class="group ...">` NON un `<a>` — link separati: cover/titolo/freccia → `annuncioUrl`, venditore → `profiloUrl`. NON tornare a wrapper `<a>` unico.
- Link venditore: `<a>` reale a `/profilo?id=USER_ID` (no `.html`) con `onclick="event.stopPropagation()"`.
- **Bordo laterale**: `border-l-[3px] border-l-emerald-400` Vendita, `border-l-blue-400` Affitto. Featured: niente striscia, ring dorato.
- **Sfondo card**: `bg-emerald-50/70` Vendita, `bg-blue-50/70` Affitto. Featured: `bg-gradient-to-b from-amber-50/50 to-white`.
- **`settore` NON è colonna diretta** di `annunci` — è in `dettagli_extra` o non esiste.
- **Salva preferiti**: icona `fa-bookmark` (NON cuore — il cuore è stato sostituito per coerenza con la pagina annuncio interna). Saved=`fas fa-bookmark text-blue-600`, non-saved=`far fa-bookmark text-slate-400`. `SAVED_IDS` Set globale, `_refreshSaveButtons(id)` aggiorna tutti i bottoni della stessa annuncio in DOM.
- **Badge giorno mercato** (`_dayBadge(giorni, tipo, size)` in data.js): un badge per ogni giorno con palette dal freddo (Lun sky/cyan) al caldo (Dom red/orange). Multi-giorno = multi-badge separati (NIENTE "+N counter"). Per fiere: vuoto. Stile inline con hex (Tailwind precompilato non include classi dinamiche). Param `size`: 'sm' card, 'md' pagina detail. Helper replicato anche server-side in `api/annuncio.js` come `dayBadgeHTML()`.
- **Niente più merce** sulla card (era `• Oggettistica`, sostituita dal badge giorno; era già duplicata col titolo).
- **Container parent badge**: `flex flex-wrap items-center gap-1.5` per gestire wrap quando i giorni sono molti.
- **Home `/`**: griglia `grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5`, allineata a `/annunci` (era 3 col allargate, modificato per coerenza).

## 📐 Dimensioni Immagini

- Card anteprima: `h-20` mobile, `h-28` desktop.
- Pagina annuncio: `h-36` mobile, `md:h-64` desktop (ridotto -20% rispetto al primo design).

## 🔖 Saved Count (preferiti) — visibile, autore privato (6 mag 2026)

Il venditore può vedere **quanti** hanno salvato il proprio annuncio, ma NON CHI (privacy by-design).

**Schema (`PATCH_AMO_EXTEND_AND_SAVED_COUNT_20260506.sql`):**
- Colonna `annunci.saved_count int NOT NULL DEFAULT 0`
- Backfill iniziale: `UPDATE annunci SET saved_count = (SELECT count FROM saved_listings WHERE annuncio_id = a.id)`
- Index `idx_saved_listings_annuncio` su `(annuncio_id)` per trigger lookup
- Trigger `trg_sync_saved_count` AFTER INSERT/DELETE su saved_listings → +1/-1 atomico su annunci.saved_count. Function SECURITY DEFINER per bypassare RLS owner-only di annunci

**Privacy:** RLS di `saved_listings` resta owner-only (l'utente vede solo i propri preferiti). `saved_count` è AGGREGATO (un int, non rivela autori) → safe da esporre. Pattern simile a `visualizzazioni`.

**Display:**
- Pagina annuncio (`annuncio.html` + `annuncio-detail.js?v=17`): `#savedCount` accanto a `#viewCount` nel title block. Visibile a TUTTI (social proof) se `saved_count > 0`. Privacy preservata.
- Dashboard "I miei annunci" (`loadMyListings`): icona bookmark blu nella riga stats, sempre visibile se `saved_count > 0`. Select aggiornato per includere `saved_count`.
- Email weekly-seller-stats: aggiunta card "Salvati 🔖" accanto a "Annunci attivi" / "Views totali". `bySeller.totalSaved` aggregato. Edge function re-deployata 6 mag 2026.

## 📊 Funnel Registrazione per Sorgente (6 mag 2026)

Tracciamento full funnel per capire conversion rate per ogni sorgente che apre il modal registrazione (popup vetrina, banner blog, click "Pubblica annuncio", nav "Accedi", salva preferito, valutatore, tel reveal, direct).

**Schema (`PATCH_AUTH_MODAL_OPENS_20260506.sql`):**
- Tabella `auth_modal_opens(id, source CHECK enum 9 valori, opened_at, anon_session, time_bucket, signed_up_user_id FK profiles ON DELETE SET NULL)`
- UNIQUE `(source, anon_session, time_bucket)` → dedup automatico per minuto: doppi click + aperture multiple non gonfiano i dati
- RLS: INSERT a anon+authenticated, NO select/update/delete (solo via RPC SECURITY DEFINER)
- RPC `amo_link_signup(text)`: chiamata in `_afterRegisterSuccess`, valorizza `signed_up_user_id` per la sessione anonima del nuovo utente. Safety 24h.
- RPC `admin_signup_funnel_by_source(int days)`: ritorna `{period_days, total_opens, total_signups, rows[{source, opens, signups, conversion_pct}]}`. Check is_admin.
- Cron `auth-modal-opens-cleanup` ogni notte alle 04:00: DELETE anonimi >90gg, signed-up >395gg.

**Lato client:**
- `_amo_session` UUID generato in `sessionStorage` alla prima apertura modal (no localStorage = scompare a tab close)
- `_trackModalOpen(source)` async silent-fail in `auth.js` chiamata da `openAuthModal(tab, contextMsg, source)` con il terzo arg
- `time_bucket` = "YYYYMMDDHHMM" UTC → finestra dedup 1 minuto
- **12 sorgenti tipizzate** (post 6 mag 2026): `popup_vetrina, blog_promo, vendi_submit, nav_accedi, salva_preferito, valutatore_create, welcome_popup, tel_reveal, direct, chat_click, whatsapp_click, call_click`
- 11 call site di `openAuthModal` aggiornati con la source corretta + 3 call site `requireAuth(callback, source)` in `annuncio-detail.js` (chat/whatsapp/call). `requireAuth` propaga la source a `openAuthModal`

**Lotteria welcome_lottery_eligible** ora attivata da `_reg_src IN ('popup_vetrina', 'blog_promo')`. Retro-compat: accetta anche il vecchio `'popup'` se residuo in sessione.

**Pannello admin** in `dashboard.html` SOPRA "Valutatore Logs": `loadAdminSignupSources()` carica via RPC, mostra top 5 sorgenti per opens (con icona, label, opens, signups, CR% colorato verde/blu/grigio in base a soglia). Bottone "Mostra altre N" toggle inline. Selettore periodo 30g/90g/1y. `_amoState` global state.

**Compliance GDPR:**
- Pseudonimo by-design (no IP, no UA, no fingerprint)
- Privacy.html aggiornata: voce in sez. 5 (cookie/storage di prima parte) + sez. 6 (retention)
- Base giuridica: legittimo interesse (art. 6.1.f GDPR)
- **NO cookie banner necessario** — analytics aggregata di prima parte ricade in esenzione Garante 2021

## 🪄 Hero Dashboard Venditore + Milestones (9 mag 2026)

Ritenzione seller: appena entri in dashboard vedi una **hero card** del tuo annuncio top con stats live + chip "in zona", e una **stack di milestone banner** (achievement) per gli eventi non ancora visti. Pattern alla Subito/Immobiliare, fa percepire che l'annuncio "lavora per te".

**Schema (`PATCH_SELLER_DASHBOARD_20260509.sql`):**
- Tabella `listing_milestones(id, annuncio_id, user_id, kind CHECK 10 valori, triggered_at, seen_at)` UNIQUE(annuncio_id, kind) anti-duplicati. Index parziale `(user_id, triggered_at DESC) WHERE seen_at IS NULL` per query "non viste". RLS owner-SELECT, INSERT/UPDATE solo via SECURITY DEFINER.
- Trigger `trg_check_listing_milestones` AFTER UPDATE su `annunci` (WHEN visualizzazioni o saved_count cambiano): scatta `first_view`, `views_10/50/100/500`, `first_save`, `saves_5/10`. Pattern soglia `NEW >= N AND COALESCE(OLD,0) < N` evita false-positive su repeat update. EXCEPTION → RAISE WARNING (non blocca update annuncio).
- Trigger `trg_check_message_milestone` AFTER INSERT su `messaggi`: scatta `first_message` e `msgs_5` solo per messaggi DA acquirente verso venditore (mittente IS DISTINCT FROM venditore_id della conv). Count totale ricalcolato a ogni INSERT — accettabile per N basso.
- 4 RPC SECURITY DEFINER: `dashboard_seller_summary()` ritorna jsonb con array `listings[]` (ogni annuncio attivo dell'utente con views_total, saved_total, saved_7d, msg_total, msg_7d, msg_unread, regional_alerts, regional_active_buyers). `unseen_milestones()` top 10 non viste join titolo+comune. `mark_milestone_seen(id)` / `mark_all_milestones_seen()` upsert seen_at.
- **regional_active_buyers** = count distinct `conversazioni.acquirente_id` dove `annuncio.regione = al.regione AND created_at > now()-30d AND acquirente != al.user_id`. Privacy: aggregato, no IDs.
- **regional_alerts** = count `bando_alerts.regione = al.regione` (acquirenti passivi iscritti agli avvisi).
- Niente backfill: solo eventi post-deploy. Annunci con visualizzazioni già >=10 NON triggherano `views_10` retroattivamente — i trigger usano OLD vs NEW e OLD esiste solo dopo UPDATE.

**Frontend (`dashboard.html`):**
- Section `#milestonesBanner` + `#sellerHeroSection` iniettate sopra `#onboardingWidget`. Hero hidden by default → revealed se RPC ritorna almeno 1 listing.
- `loadSellerHero()` carica + render. State `_sellerHeroState = {listings, idx}` con carousel (frecce + dot indicators) se più annunci. Passare l'oggetto listing a `openVetrinaModal()` via wrapper `openVetrinaFromHero(idx)` perché l'API esistente richiede oggetto, non ID.
- 4 stat box (Views, Salvati, Messaggi, Da leggere) con delta `+N 7g` colorato. Da leggere usa `msg_unread` direct, evidenziato red se >0.
- `regionalChip` (gradient blue→violet) sotto stat: "In Calabria: 3 iscritti agli avvisi · 8 compratori attivi (30g)". Mostrato solo se almeno una metric > 0.
- `loadMilestones()` mostra max 3 banner verde gradient + bottone "+N altri · segna tutti come visti" se >3. `_MILESTONE_COPY` mappa kind → emoji + title + line. Singolo dismiss × o bulk dismiss.
- **NON usare** `formatPrice` direttamente, usare typeof check `typeof formatPrice === 'function'` come fallback (data.js carica async dopo dashboard.html sometimes).

**Effetto utente atteso**: dopo aver pubblicato, ogni volta che torna in dashboard vede subito (a) numeri vivi del proprio annuncio (b) banner verdi celebrativi se sono successe cose (c) "compratori attivi nella tua zona" che fa percepire domanda. Soddisfazione pubblicazione + nudge a tornare.

## 👤 Display Nome Utente — Anti-duplicato (6 mag 2026)

**Bug storico**: utenti che mettevano nome+cognome insieme nel campo "Nome" del form registrazione (es. nome="Gianfranco Dona", cognome="Dona") venivano displayati ovunque come "Gianfranco Dona Dona" perché tutti i 10 punti display facevano `[nome,cognome].filter(Boolean).join(' ').trim()` naive.

**Fix:**
1. **`formatFullName(nome, cognome)` globale in `data.js`** — dedup PER PAROLA case-insensitive. Match parola intera (NO substring) per evitare falsi positivi tipo "Maria Donatella" + "Dona". Drop-in 1:1 del pattern naive: per nomi puliti il comportamento è identico, dedup attiva solo se cognome è già una parola del nome.
2. **`auth.js handleRegister` sanitize input**: se l'ultima parola di `regNome` (case-insensitive) combacia con `regCognome`, la rimuove dal nome PRIMA di salvare. Previene il bug per i futuri utenti.
3. **10 display point migrati** a `formatFullName`: dashboard.html (5: nameEl, admin user list, filter search, USER_NAMES, conv chat), index.html (USER_NAMES home), messaggi.html (`_displayName`), profilo.html (header), annunci.js (USER_NAMES grid), annuncio-detail.js (sellerFullName).
4. **Edge functions NON toccate** (notify-message, notify-report, register-bypass): basso rischio user-facing, le email sono per admin. Sanitization client-side è sufficiente per il caso d'uso web. Server-side sanitize in register-bypass è un nice-to-have futuro (deploy con `--no-verify-jwt`).

**Riparazione utente esistente** (Gianfranco): `UPDATE public.profiles SET nome='Gianfranco' WHERE id=...; UPDATE auth.users SET raw_user_meta_data=jsonb_set(...,'{nome}','"Gianfranco"') WHERE id=...;` — applicato 6 mag 2026.

## 🚫 Visitor Popup — Quando NON mostrarlo (6 mag 2026)

`_scheduleVisitorPopup` (auth.js) controlla 3 condizioni prima di mostrare il popup "Vendi il tuo posteggio? 🎰":

1. **Mai in `/vendi`** — early return in schedule + double-check in fire (helper `_isOnVendiPage()`). L'utente che sta pubblicando un annuncio NON viene distratto.
2. **Mai mentre il modal auth è aperto** — se `_isAuthModalOpen()` al momento del fire, ri-schedula in 3s. Loop di check finché modal chiuso.
3. **Auto-suppress se utente si logga durante l'attesa**: `onAuthStateChange` (auth.js:908) chiama `_suppressVisitorPopup` → setta `_vp=1` → loop esce.

Il popup quindi: (a) si vede in homepage/annunci/blog dopo 8s se anonimo, (b) NON si vede se nel frattempo è stato aperto il modal auth → l'utente chiude senza loggarsi → popup compare alla prossima opportunità (3s loop), (c) NON si vede mai in `/vendi`.

## 🪤 Sunk-Cost Auth nel funnel vendi (6 mag 2026)

L'utente non loggato compila tutti i 5 step SENZA vedere mai il banner "devi registrarti", e SCOPRE il modal solo al click "Pubblica annuncio gratis". Massimizza il sunk cost: chi ha già scritto titolo+descrizione+foto è incentivato a finire.

- `authBanner` (banner blu in cima a vendi.html) **non viene più mostrato all'apertura** — solo lasciato nel DOM hidden per backwards compat. Sostituito da `#signupNote` discreto SOTTO il bottone "Pubblica" che appare se utente !logged: *"Per i nuovi utenti è incluso un account gratis — bastano 30 secondi, nessuna email da confermare."*
- Quando il click "Pubblica" trova `!user`, `submitAnnuncio()` registra `window.__onLoginSuccess` callback + chiama `openAuthModal('register', contextMsg)` con messaggio: *"Manca solo l'ultimo passo: crea l'account gratis. Il tuo annuncio sarà pubblicato subito dopo."*
- Il flusso auto-resume esisteva già: `_afterRegisterSuccess` (auth.js:615) e `handleLogin` (auth.js:516) chiamano `__onLoginSuccess` → callback richiama `submitAnnuncio()` → utente loggato → submit reale parte. Niente reload, `_files` foto sopravvivono in memoria.
- **Caso draft anonimo**: se l'utente abbandona e torna dopo, draft (senza nome/tel — scope per user_id) si ripristina. Click Pubblica → modal → registra fornendo nome/tel → `prefillContactFromSession()` popola `fNome`/`fTel` → submit OK.
- `openAuthModal(tab, contextMsg)` in auth.js: secondo argomento opzionale → mostra `#authContextBanner` in cima al modal (info-circle blu). Se omesso, banner nascosto. Cleanup in `closeAuthModal`. Riusabile da altre pagine che vogliono spiegare il "perché" del modal.

## 📷 Limite Foto per Annuncio (6 mag 2026)

- **Free / non-vetrina = max 1 foto.** **Vetrina attiva = max 5 foto** (e si attiva la Rotazione Dinamica già esistente in `data.js:377`, che cambia la cover ogni render se `featured && allImgs.length > 1`).
- `vendi.html`: hard-coded 1 foto, `<input>` senza `multiple`. Messaggio errore se >1: "Puoi caricare 1 sola foto." (no menzione vetrina, niente CTA upsell). Sotto il dropzone: `Un annuncio con foto vende fino a 3 volte di più.` con icona bolt amber.
- `modifica-annuncio.html`: `_maxPhotos` dinamico settato dopo fetch annuncio. Se `isListingFeatured(l)` → 5 + hint con corona "Vetrina attiva: puoi caricare fino a 5 foto, mostrate a rotazione." Altrimenti 1 + stesso copy di vendi. `<input>` resta `multiple` (gestione lato JS).
- **Rimossa CTA upsell vetrina** dal box foto in entrambe le pagine ("Sblocca 5 foto e Rotazione Dinamica con la Vetrina Premium" + il blob blu): l'utente vuole flusso pulito, l'upsell vive solo nel modal vetrina di dashboard.html.
- Edge case: utente con annuncio già in vetrina con 5 foto → vetrina scade → torna in modifica-annuncio: `_maxPhotos=1` ma le 5 foto già caricate restano (display lato annuncio.html prende solo `img_urls[0]` se non featured). Non vengono cancellate, solo non aggiungibili oltre il limite del momento.

## 🐛 Bug Storici Generalizzabili (NON ripetere)

- **`expires_at`** può non esistere nel DB — query in `annunci.js` non filtra. NON reintrodurre il filtro finché non popolato per tutti.
- **`LISTINGS` in `data.js` è vuoto** — solo Supabase. Non rimettere demo.
- **Status annunci**: `checkContent()` sincrona in `vendi.html` imposta `status: 'active'/'pending'` direttamente all'insert. NON usare insert-pending + setTimeout-update (fallisce per RLS).
- **`let history`** in JS causa crash silenzioso (conflitto `window.history`). Usare `stepHistory` o altro nome.
- **Input numerici con locale italiano**: `type="text" inputmode="numeric"` + parsing manuale (strip punti, replace virgola→punto, parseFloat).
- **Immagini annunci**: salvate in `dettagli_extra.images` E in `img_urls`. Devono essere in entrambi.
- **`tel`/`email` mai esposti a anon**: `annuncio-detail.js` `select(...)` senza tel/email. Fetch RPC `get_listing_contact()` solo dopo `auth.getUser()` confermato.
- **Trigger `trg_enforce_annunci_status`**: forza `status='pending'` su INSERT non-admin, blocca promozione ad active via UPDATE.
- **Validazioni `vendi.html`**: prezzo 101€-400.000€ (min portato a 101 il 6 mag 2026 per impedire il "100€ tondo civetta"). Descrizione min 10 char. Anti-spam 1 min. **Limiti NON mostrati in UI** — l'utente che sbaglia legge solo "Prezzo troppo basso/alto, controlla bene" (volutamente vago, alza la friction sui prezzi civetta). Stesso check in `modifica-annuncio.html`.
- **NON join `profiles(...)` nelle select** di annunci/conversazioni — rompe PostgREST. Sempre fetch separato + merge.
- **`_supabase.rpc().catch()` NON ESISTE** v2 — usare async/await.
- **Regex Python multi-line `[\s\S]*?`** per riscrivere codice è pericolosa: ha già cancellato funzioni intere. Edit puntuale > regex.
- **Caratteri Unicode invisibili** (U+200A, U+0300, 0x01) iniettati da editor rompono replace silenziosamente.
- **Select Supabase incompleta = filtro silente broken**: 5 mag 2026, `loadListings()` in `js/pages/annunci.js` non includeva `giorni` nella select primary, solo nel fallback. Risultato: `l.giorni` undefined → filtro chip giorni sempre 0 risultati. Verificare SEMPRE che la select includa tutte le colonne usate da filtri/UI.
- **Confronti accent-insensitive**: il regex `/lunedi(?!ì)/g` non catturava forme unicode equivalenti (`ì` precomposto U+00EC vs `i+̀` combining grave). Soluzione robusta: `s.normalize('NFD').replace(/[̀-ͯ]/g, '')` rimuove tutti i diacritici. Pattern usato in `_normalizeDayName` (annunci.js) e `_dayBadge` (data.js).
- **`modifica-annuncio.html` forza `status='pending'` su ogni UPDATE** (linea 414): è design intenzionale per re-moderare ogni edit, ma genera N richieste di approvazione admin per lo stesso annuncio quando l'utente modifica più volte (typo→foto→prezzo = 3 approvazioni). Il trigger `enforce_annunci_status` permette il regression `active→pending` (blocca solo l'opposto). Per alleggerire admin overhead: opzione "trust whitelist" (dopo N annunci approvati, modifiche restano active) — non implementata, da valutare se l'overhead diventa pesante.
- **`vendi.html` salva il telefono in `annunci.contatto`/`annunci.tel` ma NON aggiorna `profiles.telefono`** se vuoto. Causa il drop nel funnel admin "primo annuncio→telefono nel profilo": utenti che hanno annunci attivi senza telefono in profilo. Fix futuro: dopo INSERT annuncio fare upsert su `profiles.telefono` se vuoto. Non urgente.
- **Bucket timezone mismatch** (6 mag 2026, growth chart admin): la RPC `admin_page_views_stats` ritorna `bucket = date_trunc('month', created_at)` in UTC. Il client costruiva il loop dei mesi con `new Date(y, m, 1)` (local time Roma) e poi calcolava la key con `getUTCMonth()` → in CEST/CET il 1 del mese local cade nel mese precedente UTC, quindi la key non matchava mai il bucket → linea Visite a 0. Regola: quando matchi bucket DB con loop client, usa local time **consistentemente** (`getFullYear`/`getMonth`, non `getUTC*`). Stesso vale per `dayKey` su `daily_30`.
- **Stripe test mode in payments**: una transazione `cs_test_*` con `status='succeeded'` può finire in DB durante lo sviluppo e gonfiare le stats revenue. Sempre filtrare `stripe_session_id LIKE 'cs_live_%'` quando si calcolano metriche di guadagno.
- **Nuove colonne su tabelle column-restricted = GRANT SELECT esplicito** (6 mag 2026 sera): `annunci` ha REVOKE column-level su `tel`/`email` per `authenticated` → la tabella è "column-restricted" e Postgres NON propaga il SELECT tabella-level alle nuove colonne. `saved_count` aggiunta dal PATCH del mattino senza GRANT esplicito → ogni `select(...,saved_count,...)` da anon/authenticated tornava **42501 permission denied for table annunci** → dashboard "I miei annunci" e annuncio-detail mostravano "Nessun annuncio". Fix: `GRANT SELECT (col) ON annunci TO anon, authenticated;` nel PATCH stesso. Regola evergreen: ogni `ALTER TABLE annunci ADD COLUMN` (e analogo su `profiles`) deve essere seguito dal GRANT colonna-level esplicito per anon+authenticated.
- **Whitelist enum lato JS deve restare allineata col CHECK constraint DB** (9 mag 2026): `_AMO_VALID_SOURCES` in `auth.js` aveva 9 valori, il PATCH `PATCH_AMO_EXTEND_AND_SAVED_COUNT_20260506.sql` aveva esteso il CHECK del DB a 12 (aggiunto `chat_click,whatsapp_click,call_click`) ma la lista JS è rimasta vecchia. Risultato: `_trackModalOpen('chat_click')` veniva mappato a `'direct'` dal filtro client → 30gg di funnel rotto, tutti i click contatto annuncio attribuiti a `direct`. Regola: **ogni volta che estendi un CHECK enum sul DB, grep il valore old vs new in tutto il codice** prima di committare il PATCH.
- **URL sanitization: `match` > `replace+slice`** (9 mag 2026, page-view-tracker): per estrarre uno slug pulito da una query string usare `match(/^[a-z0-9-]{1,N}/)` — stoppa al primo char invalido. `replace(/[^a-z0-9-]/g,'')` invece **rimuove i char invalidi e concatena il resto**, producendo schifezze tipo `aprire-attivita-...avvihttpssubingressoitblo` se la URL è malformata. Vale per qualsiasi sanitization da fonte non controllata (URL, referer, params).
- **Refactor che migra a funzioni globali = verifica che TUTTI gli HTML che le usano carichino lo script che le ospita** (12 mag 2026): `messaggi.html` chiamava `formatFullName` (data.js) in `_displayName` + `showToast` (data.js) in 9 punti, ma NON linkava `js/data.js`. `formatFullName` lanciava `ReferenceError` al primo render conv → `.map()` falliva → `innerHTML` mai settato → lista conv VUOTA pur con 8 conv + 16 msg nel DB. L'errore era silenziato perché il try/catch del boot non aggiornava la UI in modo visibile (loadingState già hidden, chatLayout già visible). Bug latente dal 6 mag 2026 (refactor "10 display point migrati a formatFullName"). Regola: ogni volta che sposti una funzione in data.js o ui-components.js, **grep `<funzione>(` su tutti i `.html` e verifica che lo script tag esista**. Fix: aggiunto `<script src="js/data.js?v=17">` in messaggi.html.

## 🤖 Blog Generator (`js/blog-generator.js`)

- 11 chiamate API sequenziali (~2-3 min). Gira nel browser: chiudere la pagina interrompe.
- Ogni call con suo `maxTokens`: contenuto 4000, revisione 8000, metadati SEO 500.
- Step finale chiede solo `title/slug/excerpt` (NON content nel JSON) — content usato direttamente da JS.
- Pulizia markdown: regex locale prima, AI solo se restano tabelle pipe.
- Anti-duplicati: prompt con lista temi vietati + check similarità titolo (>50% parole).

## 📝 Stile Editoriale Blog

- Target lunghezza: **2.200-3.000 char** per articoli normali. NIENTE articoli enciclopedici lunghi.
- Stile: paragrafi 2-3 righe, frasi nette + una più lunga ogni tanto, numeri concreti (`4.500€ INPS`, `40-80% del fatturato`), espressioni reali ambulante (*"fai conto"*, *"spendi e dormi"*, *"al banco"*), no trattini lunghi (—), no `"esploriamo" / "approfondiamo" / "in conclusione"`, no liste perfette uniformi.
- **FORMATO SCANSIONABILE (regola dura, 16 mag 2026 — il 79% degli utenti scansiona, non legge)**: feedback utente "capitoli lunghi e noiosi". Standard nuovo, modello = `mercati-ambulanti-veneto` (riscritto v2, 2875 char):
  - **Hook**: 1-2 frasi cortissime, la prima in `<strong>`.
  - **Blocco "In breve:"** subito dopo l'hook: 3 bullet che danno già la risposta (snippet-friendly Google).
  - **Tante `<h2>` brevi e curiose** (5-7 per articolo), sezioni corte: 2-3 paragrafi MINI o una lista.
  - **Paragrafi 1-2 righe**, molte frasi singole isolate in `<p>` a sé. Niente blocco da 4+ righe.
  - **Prima frase di ogni sezione/bullet in `<strong>`**: leggendo solo i bold si capisce tutto l'articolo. (Sostituisce la vecchia regola "7-15 grassetti": ora il bold guida la scansione, non si conta.)
  - Liste puntate per ogni elenco, niente paragrafoni descrittivi.
  - CTA al picco di tensione (memoria [[feedback_cta_in_alto_blog]]) + close. Per filone regionale link `/annunci?regione=X` SENZA `.html` (tracciato).
  - **Da retrofittare con questo formato**: `mercati-ambulanti-lombardia`, `quanto-costa-un-posteggio-al-mercato` (ancora vecchio stile a blocchi densi).
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
- **Vetrina NON estende `expires_at`** (rimosso 6 mag 2026): chi compra/riceve vetrina mantiene il default 200gg post. Vetrina = solo featured/posizione/visibilità. Stripe-webhook + adminGrantVetrina ripuliti, edge function re-deployata.
- **Admin Vetrina gratuita**: `adminGrantVetrina(30|90)` scrive `featured_tier='admin_free'`. `adminRevokeVetrina(id)` azzera.
- **Card featured redesign**: glow box-shadow aureo, sfondo gradient amber-50/50→white, barra top 3px, badge crown + animate-pulse, footer "Annuncio in Vetrina ★★★★★".
- **Modal pricing layout** (6 mag 2026): totale grande (`€ 59,90`) + giornaliero leggibile sotto (`€ 0,67 / giorno` text-xs). Niente più "una tantum" sui bottoni — la rassicurazione anti-rinnovo è nel footer del modal accanto al lock Stripe (`pagamento unico, no abbonamento`). Sottotitoli a sinistra puliti dal duplicato del giornaliero. Benefit grid ridotta a 3 colonne: `+ Visualizzazioni / Vendi prima / In cima` (rimosso "Post più lungo" perché vetrina non estende più `expires_at`).
- **Box admin "Guadagno Vetrine"** (sostituisce "In Vetrina"): RPC `admin_revenue_stats()` SECURITY DEFINER bypassa RLS owner-only di `payments`. Filtra `status='succeeded' AND stripe_session_id LIKE 'cs_live_%'` (esclude test mode + admin_free + welcome_lottery che non passano da payments). Box vira al verde quando `today_cents > 0` con pill `+ €X oggi` sotto. Layout: label, totale grande, pill verde animata se vendita oggi. Patch in `PATCH_ADMIN_REVENUE_20260506.sql` (idempotente).
- **Vetrina nel wizard `vendi.html` — Step 6 (16 mag 2026)**: il wizard è ora **6 step** (`_TOTAL_STEPS`). Lo step 5 (titolo/descrizione/foto/contatti + preview) termina con un bottone "Avanti" (`_goToPublishStep()` → valida step5 → `goToStep(6)`); lo step 6 è il chooser di monetizzazione finale, mostrato DOPO che tutto è compilato (massimo sunk cost). 4 opzioni radio (`_pubChoice`, default `'free'` preselezionato): Gratis €0 / Vetrina 10g / 30g / 90g con **prezzi scontati -10%** (€17,91 / €35,91 / €53,91). **Copy/layout snelli (17 mag 2026, redesign mobile)**: RIMOSSO il box ambra "Solo ora… Vetrina scontata del 10%…" (disordinava e sprecava spazio su mobile). Lo sconto ora è comunicato SOLO da un **bollino `-10%` in `position:absolute` (top:-8px;right:14px, inline-style anti-Tailwind-precompilato, zero spazio occupato)** nell'angolo delle 3 card a pagamento. Card ristrutturate per non andare a capo su smartphone: la riga del titolo NON contiene più il prezzo (era un `flex justify-between` che strozzava il titolo → "Vetrina/30/giorni" a capo). Ora: titolo `whitespace-nowrap` (+ chip Popolare/Miglior valore inline solo 30/90), e su riga separata sotto `prezzo-scontato (font-black) + prezzo-barrato + · €X/g`. Bottoni accorciati: `Pubblica gratis` / `Attiva Vetrina · € N` (prima "Pubblica e attiva la Vetrina · …" andava a capo). I benefici restano nella FAQ Vetrina in fondo (3 `<details>` zero-JS chiusi). I benefici sono ora in una **FAQ Vetrina** in fondo (3 `<details>` nativi zero-JS, chiusa di default, non invadente: dove viene spinto / quanto dura / si può attivare dopo). Le 3 note impilate sotto il bottone → 1 sola riga `#pubFootNote` dinamica (gratis: "controllato prima della pubblicazione" · pagamento: "Stripe, una tantum, nessun abbonamento, pubblicato comunque") + `#signupNote` breve solo per anonimi. `_selectPubChoice()` aggiorna stile `.pub-opt.selected` + label `#submitBtn` + testo `#pubFootNote` (via `_refreshPublishChoiceUI`; il vecchio `#pubPayNote` non esiste più). `submitAnnuncio()`: dopo l'INSERT (annuncio creato sempre, resta `pending` per moderazione) se `_pubChoice!=='free'` e NON ha appena vinto la lotteria → chiama `create-checkout-session` con `source:'vendi_creation'` e redirige a Stripe; se annulla/fallisce l'annuncio **resta pubblicato** (nessun dato perso) + toast. STEP_NAMES/progressBar/resetForm aggiornati a `_TOTAL_STEPS`.
- **Sconto -10% "solo alla pubblicazione" — gate SERVER-SIDE (16 mag 2026)**: in `create-checkout-session/index.ts`. Il client manda solo `source`; lo sconto NON è falsificabile perché la edge function lo applica solo se: `source==='vendi_creation'` **E** annuncio dell'utente **E** `featured_since IS NULL` (mai stato in vetrina) **E** `created_at` < 60 min fa. `amount = round(tier*0.90)`, product name suffisso "· sconto pubblicazione -10%", metadata `source`+`discount=vendi_launch10`, `payments.amount_cents` = importo scontato (revenue RPC `cs_live_%` resta corretta, importi solo più bassi). Lo status check è rilassato: in creation flow accetta anche `pending` (l'annuncio appena creato è sempre pending per `trg_enforce_annunci_status`); il webhook (service_role, bypassa il trigger) setta `featured*` anche su pending → la vetrina diventa visibile appena l'admin approva. `cancel_url` creation flow → `dashboard.html?pubblicato=1&vetrina=annullata`. **Tradeoff accettato**: il countdown vetrina parte all'acquisto anche se l'annuncio è ancora in moderazione (la moderazione admin è rapida; rifiuto raro, già filtrato da `checkContent()`). Webhook e `stripe-webhook` NON modificati (lo sconto tocca solo il prezzo, non i giorni).
- **Priorità visibilità annunci in Vetrina nei box "consigliati" (16 mag 2026)**: chi paga ha priorità. Helper `_featuredFirst(list, n)` (replicato in `js/pages/annuncio-detail.js` e `blog-template.html`, usa `isListingFeatured` da data.js): partiziona featured-attivi vs resto, **mescola i featured** (rotazione equa, non sempre gli stessi 3), concatena, taglia a n. Applicato a: (a) correlati client `annuncio-detail.js` (fetch pool 24 ordinato created_at desc → `_featuredFirst(pool,3)`), (b) box live blog `_loadBandoListingsBox` (limit 24 → `_featuredFirst(pool,3)`, fallback 0-risultati invariato). SSR `api/annuncio.js` correlati: 2 fetch REST — prima `featured=eq.true&featured_until=gt.<now>` ordinato `featured_since.desc` limit 3, poi riempie con `created_at.desc` (ordine deterministico, no random, perché pagina cacheata a CDN). La griglia `/annunci` (`annunci.js`) era **già** featured-first (sort stabile dopo il sort utente, righe ~209/244) — non toccata. `annuncio-detail.js` bumpato `?v=18`→`?v=19` in `annuncio.html` + `api/annuncio.js`.
- **Box admin "Valore Annunci"** (8 mag 2026, gasometro): 5° card della grid stats admin (`grid-cols-2 md:grid-cols-3 lg:grid-cols-5`). Stile soft indigo (gradient `from-indigo-50 to-white`, border `indigo-100`). RPC `admin_total_listing_value()` SECURITY DEFINER ritorna jsonb `{total_eur, vendita_eur, affitto_eur, n_vendita, n_affitto, rent_multiplier:8, civetta_floor:1000}`. Formula: vendita = `SUM(GREATEST(prezzo, 1000))` (neutralizza prezzi civetta sub-1k), affitto = `SUM(prezzo * 8)` capitalizzazione conservativa del canone annuale. Solo annunci `status='active'`. Hint sotto: "N vendita + M affitto ×8". Patch `PATCH_ADMIN_TOTAL_VALUE_20260508.sql`. È puramente motivazionale per il founder, niente UX user-facing.

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

## 🛡️ Pannello Sicurezza Admin

- **`pendingReviewSection` sopra "Crescita del sito"** in `dashboard.html`. Bordo amber-300, shadow-md. Hidden by default → visibile se `loadPendingListings()` trova data.length > 0. Errore mostrato anche se hidden.
- **`securityPanel`** sempre visibile (gradient slate scuro). Comportamento collassabile (6 mag 2026):
  - **0 anomalie**: solo header + bottone "Esegui check" + pill verde inline `✓ Tutto ok`. Padding simmetrico `pt-5 pb-5` per centrare la riga. Le 4 stat box (`securityStats`) e il blocco "Tutto sotto controllo" (`securityAllClear`) sono nascosti — rumore inutile quando va bene.
  - **≥1 anomalia**: ricompaiono le 4 stat box (signup 1h/24h/7g/non confermati) + `securitySuspectSection` + `securityAlertsSection`. Padding torna `pt-6 pb-6`, header riacquista `mb-5`.
  - 4 badge stats: signup ultima ora (red ≥20), 24h, 7g, non confermati 24h (red ≥10).
  - `securitySuspectSection`: account che matchano pattern probe/scanner (`.invalid$`, `.test$`, `.local$`, `.example$`, domini temp-mail, `^word_unixtimestamp@`, keyword `rlstest|hunter_|owasp|sqlmap|injection|xsstest|burpcollab`). Bottone Elimina.
  - `securityAlertsSection`: ultime 5 entries di `admin_alerts_log` con `issues_count > 0`.
  - Bottone "Esegui check" → POST a `admin-anomaly-check`.
- **RPC `admin_security_overview()`** SECURITY DEFINER, check `is_admin = true`. Ritorna jsonb con signups + suspect + alerts.
- **RPC `admin_listings_per_regione()`** lista regioni con count annunci attivi.
- **`auth.audit_log_entries` è VUOTA** — per IP/UA reali serve Logs Explorer Dashboard.

## 🔔 Alert Anomalie

- Edge function `admin-anomaly-check` cron `0 9 * * *`. Tabella `admin_alerts_log` rate-limit 12h.
- Check: annunci 24h=0 (crit), iscritti 7d=0 (crit), page views 24h<5 (warn), pending >3g (warn), spike signup 1h>20 (crit anti-bot).
- Email styled via Resend a tutti gli admin solo se ≥1 issue.
- **Auto-decay 4h** (10 mag 2026): pannello `securityAlertsSection` filtra lato client `checked_at > now()-4h`. L'edge function manda email immediate, il pannello è "live status" non storico. Lo storico completo resta su `admin_alerts_log` a livello DB. Caso d'uso: alert "Nessun annuncio in 24h" può scattare per silenzio organico (utente smette di promuovere su Facebook) e l'admin non vuole vedere falsi-positivi per ore.

## 🔍 Filtri Annunci

- **Sidebar mobile** `hidden lg:block`. Bottone "Filtri" apre bottom-sheet `#mobileFiltersSheet`.
- Input `m_*` (`m_fRegione`, `m_fTipo`, `m_fStato`, `m_fPrezzoMax`, `m_fSup`). `applyMobileFilters()` copia `m_` → sidebar.
- **Filtro giorni** (multi-select chip): `#dayChipsDesktop` + `#dayChipsMobile` in `annunci.html`. CSS `.day-chip` / `.day-chip.selected`. Logica in `js/pages/annunci.js`: `_normalizeDayName()` (NFD + strip diacritici), `_getSelectedDays()`, `toggleDayChip(btn)`. Filtro: intersezione `l.giorni.split(',')` con selected. **CRITICO**: la select primary di `loadListings()` DEVE includere `giorni` — se omesso il filtro è sempre 0 (bug 5 mag 2026).
- **Pannello desktop filtri** (5 mag 2026): una sola riga `grid-cols-2 md:grid-cols-3 lg:grid-cols-6`, chip giorni full-width sotto un divider, bottoni Azzera/Applica a destra. Sheet mobile resta verticale come prima.
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
- Prezzo: 101-400.000€ (range realistico posteggi mercatali, min 101 per bloccare il "100€ tondo civetta"), **input via `style=""` inline** (padding/font/color) per battere la cascade `.field-input`. Sotto l'input: box amber soft con nudge anti-prezzo-civetta ("scrivi il prezzo reale, un prezzo civetta vende in media 3 volte meno"). I limiti NON sono mostrati in UI — chi sbaglia vede solo "Prezzo troppo basso/alto, controlla bene".
- **Preview card live nello step 5** (6 mag 2026): `#previewCard` sopra il bottone Pubblica, max-w 300px centrata, `pointer-events:none`. Funzione `_renderPreview()` costruisce un fakeListing (id `__preview__`, user_id `null` → cade su iniziale di `contatto`, status `active`, no featured/expires) e chiama `buildCard()` da data.js. Trigger: ingresso step 5 (subito + dopo `prefillContactFromSession`), `oninput` su `fTitolo`+`fNome`, dopo `_handleFiles` push, dopo `removeFile`. Foto via `URL.createObjectURL(_files[0])` salvato in `_previewObjectURL` globale e revocato prima di crearne uno nuovo (anti memory-leak). `getOptimizedImageUrl` cade nel try/catch su URL `blob:` e ritorna l'object URL invariato → preview funziona.
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
- **Tailwind precompilato** `css/tailwind.css?v=4` (~50KB minified). Build: `npx tailwindcss -i tailwind.input.css -o css/tailwind.css --minify`. NO più CDN.
- **Page views tracking interno**: tabella `page_views`. Tracker `js/page-view-tracker.js?v=2` su 17 pagine pubbliche, dedup per (visitor, path, session). **Per `/blog?post=<slug>` il tracker promuove lo slug nel path** → salva `/blog/<slug>` (sanitizzato `[a-z0-9-]{1,80}`). Senza questa estensione tutti i post collassano in `/blog`.
- **Blog conversions** (6 mag 2026 sera, fase 0): tabella `blog_conversions(id, post_slug, regione, kind, visitor_id, session_id, created_at)` con `kind` ∈ `cta_annunci_click | alert_signup | box_listing_click`. RLS: solo INSERT da anon+authenticated, SELECT bloccato (admin via RPC). Helper globale `window.trackBlogConversion(kind, slug, regione)` in `js/blog-tracker.js`. In `blog.html` listener delegato sui click verso `/annunci?regione=X` → traccia `cta_annunci_click` automaticamente (regione letta dall'href, non dedotta dallo slug). Gli altri due `kind` saranno agganciati nelle fasi 1 (form alert) e 2 (box live posteggi).
- **RPC `admin_blog_stats(p_days)`** SECURITY DEFINER + check is_admin. Aggrega views (`page_views.path LIKE '/blog/%'`, slug estratto via regex) + conversioni per kind. Ritorna `{period_days, total_views, total_conversions, rows[]}` ordinato per views desc, ogni riga ha `slug, title, category, views, unique_visitors, cta_clicks, alert_signups, box_clicks, total_conv, cr_pct`. Pannello "Performance blog" in `dashboard.html` sopra Valutatore Logs, selettore 30g/90g/1y.

## 📬 Avvisi Bandi (lead magnet bundle, 6 mag 2026 sera fase 1)

Sistema "Avvisi" — chi si iscrive con (email, regione) riceve come **bundle obbligatorio** sia gli avvisi bandi pubblici sia i nuovi annunci privati della stessa regione. Single opt-in (no double-confirm), unsub in 1 click via token.

- **Schema:** `bando_alerts(id uuid, email, regione, source, unsub_token uuid UNIQUE, created_at, last_listing_sent_at, last_bando_digest_sent_at)` UNIQUE(email,regione). `bando_alert_log(alert_id, annuncio_id)` PK composita per dedup invii.
- **RLS:** anon+authenticated solo INSERT su `bando_alerts`. Niente accesso pubblico al log. Edge functions usano service_role per bypass.
- **Edge `subscribe-bando-alert`** (public, `--no-verify-jwt`): honeypot `website`, time-on-form ≥2.5s, temp-mail blacklist 35 domini (stesso set di `register-bypass`), pattern probe `.invalid|.test|.local|.example`, whitelist 20 regioni. INSERT idempotente, email welcome via Resend solo per nuove iscrizioni.
- **Edge `notify-bando-subscribers`** (internal, Bearer SB_SECRET_KEY): trigger AFTER INSERT/UPDATE OF status su `annunci`. Solo transizione da non-active a active, solo annunci freschi (<24h). Query subscribers per `regione`, dedup via `bando_alert_log`, rollback log se Resend fail.
- **Trigger `trg_notify_bando_subscribers`** + function `notify_bando_subscribers_on_annunci()` SECURITY DEFINER → `net.http_post` con Bearer dalla stessa chiave del trigger esistente `notify_alert`.
- **Pattern chiave service nei trigger** (regola evergreen): la `sb_secret_*` NON deve mai stare in un file versionato. Approccio adottato: file SQL nel repo è **template** con placeholder `__SB_SECRET__`. Apply via shell: estrai chiave runtime con `pg_get_functiondef('public.notify_alert_on_annunci'::regproc)` + regex, sed in file `/tmp/`, applica, elimina. La gitleaks pre-commit valida che il repo resti pulito.
- **Unsubscribe:** `email-unsubscribe` esteso con `type='bando_alert'` → DELETE riga `bando_alerts` per quel token. Pagina `unsubscribe.html` mostra messaggio con regione.
- **Privacy:** voce dedicata in sez. 4 (base giuridica art. 6.1.b — esecuzione servizio richiesto) + retention sez. 6 (fino a cancellazione utente, log 13 mesi).
- **SEO bonus blog (Fase 4, 6 mag 2026 sera):** (a) **JSON-LD `FAQPage`** iniettato sugli articoli `bandi-*` con 4 Q&A canoniche regione-interpolate (quando escono, dove cercare, subingresso, durata decennale) → rich result Google in SERP. Helper `_injectFaqJsonLd(regione)` rimuove anche se siamo su un non-bandi. (b) **Box "Bandi in regioni vicine"** sotto il box live: mappa `_NEIGHBORS` hardcoded 20 regioni → 3 vicine geografiche (Calabria→Basilicata/Sicilia/Puglia, Lombardia→Piemonte/E.-R./Veneto, ecc.), 3 card con titolo + excerpt dei post vicini pescati da `_allPosts` già caricato. (c) **RPC `admin_bump_post_freshness(slug)`** SECURITY DEFINER + bottone `fa-rotate-right` in ogni riga del pannello "Performance blog" admin: bumpa `published_at = now()` per spingere Google a ricrawlare l'articolo. Conferma via `showConfirm`, toast risultato. Niente bumping batch (volume attuale non lo richiede).
- **UI client (Fase 2-3, 6 mag 2026 sera):** in `blog.html`, branch condizionale per articoli `bandi-posteggi-mercatali-*` via mappa `SLUG_TO_REGIONE` (tutti i 20 slug confermati DB). Sui bandi: (a) banner valutatore in cima nascosto (off-intent), (b) promo Vetrina dopo 3° `</p>` sostituita dal **form Avvisi** inline (email + honeypot `website` + time-on-form, chiama `subscribe-bando-alert`, tracking `alert_signup`). **Box live "Posteggi disponibili adesso"** sostituisce il blocco "voglio comprare/vendere" su **tutti i post del blog** (Fase 3.1): bandi → filtro regione + lead "mentre aspetti il prossimo bando…" + fallback "Ancora pochi posteggi qui" su 0 risultati con scroll-anchor al form sopra; non-bandi → versione generic (3 annunci recenti misti, no filter, no fallback). Listener delegato traccia `box_listing_click` solo dentro `[data-box-listings]`. **Link città inline** (Fase 3.3): TreeWalker post-render wrappa la prima occorrenza di 50+ città (capoluoghi + bandi-rilevanti come Tropea/Pizzo/Diamante/Foligno/Sulmona) in `<a>` verso `/annunci?regione=X&q=Citta` (bandi) o `/annunci?q=Citta` (non-bandi). Skip ancestor `A/STRONG/EM/B/I/H1-6/BUTTON/CODE`, max 5 link/articolo, sort per lunghezza desc (gestisce "Reggio Calabria" prima di "Reggio"), word boundary unicode-safe.
- **RPC `admin_page_views_stats()`** total/today/monthly/yearly/daily-30. RPC `admin_funnel_stats()` ritorna 5 campi ma la dashboard ne renderizza 4 (signups, primo annuncio, annuncio contattato, conversazione attiva). `profile_complete` (telefono) ignorato — opzionale al signup, ridondante. `first_contact_received` = distinct `venditore_id` da `conversazioni`. `first_message_sent` = distinct `mittente_id` da `messaggi`.

## 📈 Growth Chart Admin (`loadAdminGrowthChart`)

- 4 serie line chart: Iscritti / Annunci / Vetrine / Visite. Tab: **30gg / Mese / Anno / Storico**.
- **Doppio asse Y** (6 mag 2026): Visite su `y1` (asse destro, ticks viola, formattazione `k` per migliaia), iscritti/annunci/vetrine su `y` sinistro. Necessario perché le visite sono di ordini di grandezza superiori e schiacciavano le altre tre linee.
- **Bucket key in local time**: `monthKey`/`yearKey`/`dayKey` usano `getFullYear/getMonth/getDate` (non `getUTC*`). Vedi nota timezone in "Bug Storici Generalizzabili".
- **30gg** usa `daily_30` della RPC con bucket UTC truncato a giorno → mismatch di 1-2h alle estremità giornata in Roma è accettabile (visibile solo con pochissime views/giorno). Per fix preciso al 100% serve `date_trunc('day', x AT TIME ZONE 'Europe/Rome')` lato RPC.
- **Storico**: parte dal primo `created_at` trovato fra profiles/annunci/vetrine, mese per mese fino ad oggi.
- **Le serie rappresentano incrementi nel periodo**, non totali cumulativi (sottotitolo `(nuovi per mese)`). Nessuna modalità cumulativa.
- Legenda HTML statica sotto al canvas (non Chart.js legend, disabilitata): include hint `→ scala dx` su Visite.

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

- `expires_at` 200 giorni di default (5 mag 2026, ex 100). SQL: `ALTER TABLE annunci ADD COLUMN IF NOT EXISTS expires_at timestamptz;`
- **Vetrina NON estende `expires_at`** (rimosso 6 mag 2026): tutti i post valgono 200gg, vetrina = solo featured. Niente più cap differenziati 230/300/400. `adminGrantVetrina(days)` + `stripe-webhook` toccano solo i campi `featured*`.
- **NON filtrare su `expires_at`** finché non popolato per tutti — gli scaduti restano visibili ma con badge "Scaduto", contatti bloccati via `_blockIfExpired()` (chat/whatsapp/chiama mostrano toast). RPC `renew_listing(p_id uuid)` SECURITY DEFINER, owner-only, bumpa `expires_at = now()+200gg`. Bottone "Riattiva" in dashboard.html appare per annunci `active` con `expires_at < now()`.

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
- `PATCH_CRON_AUTH_20260504.sql` è **template** (richiede `psql -v service_jwt=...`). NON committare mai con chiave hardcoded.
- `DIAGNOSE_PUBLISH_SLOW.sql` per ispezionare trigger/coda pg_net.

### Trigger annunci attivi
- `notify_alert_trigger` (async, alert acquirenti).
- `notify_seller_trigger` (async, "ricevuto/online/rifiutato").
- `trg_enforce_annunci_status` (BEFORE, forza pending non-admin, blocca featured non-admin).
- `trg_check_listing_milestones` (AFTER UPDATE, scatta milestone views/saved se OLD<N AND NEW>=N — vedi sezione "Hero Dashboard Venditore").
- `trg_check_message_milestone` (AFTER INSERT su `messaggi`, scatta `first_message`/`msgs_5` per messaggi acquirente→venditore).

### Cron pg_cron attivi
- `unfeature-expired-daily` 03:00 — cleanup vetrine scadute.
- `increment-featured-views` ogni 6h.
- `weekly-buyer-digest` Lun 09:00 (TODO: spalmare).
- `weekly-seller-stats` Lun 09:00 (TODO: spalmare).
- `admin-anomaly-check` 09:00 daily.
- `engagement-reminders` 10:00 daily.

## 🌐 Cache Versions Correnti

- `data.js?v=17` (6 mag 2026 — `toggleSaveListing` passa source `salva_preferito` a `openAuthModal`).
- `auth.js?v=18` (9 mag 2026 — fix `_AMO_VALID_SOURCES`: aggiunti `chat_click,whatsapp_click,call_click` (mancavano dal 6 mag, venivano filtrati a `'direct'` falsando il funnel)).
- `js/pages/annunci.js?v=6` (6 mag 2026 — formatFullName per USER_NAMES).
- `js/pages/annuncio-detail.js?v=19` (16 mag 2026 — correlati con `_featuredFirst()`: annunci in Vetrina prima, mescolati per rotazione equa; fetch pool 24 invece di limit 3. Allineato in `annuncio.html` + `api/annuncio.js`. Storico v=17: `call_click`/`chat_click`/`whatsapp_click`, `#savedCount`).
- `annuncio-detail.js?v=14` (5 mag 2026 — banner "Annuncio scaduto" + blocco contatti via `_blockIfExpired()` su startChat/makeCall/openWhatsApp).
- `ui-components.js?v=11` (5 mag 2026 — voce "Supporto" nel footer).
- `annunci.js?v=5` (5 mag 2026 — `_normalizeDayName` NFD + select include `giorni` + layout pannello compatto).
- `css/tailwind.css?v=4` (10 mag 2026 — rebuild dopo aggiunta classi nuove hero seller dashboard: md:w-44, md:flex-row, md:p-4, md:gap-5, md:text-5xl, md:text-xl, md:p-8, group-hover:scale-105, lg:grid-cols-1, lg:text-6xl, lg:text-lg).
- `page-view-tracker.js?v=3` (9 mag 2026 — slug sanitization: `match(/^[a-z0-9-]{1,120}/)` invece di `replace+slice(80)` per stoppare al primo char invalido. Era un bug che produceva slug malformati tipo `aprire-attivita-...avvihttpssubingressoitblo` quando la URL conteneva concatenazioni post-sanitize. Limit alzato 80→120 per slug bandi lunghi.).
- **Bumpare `?v=` quando modifichi un file caricato con cache busting.** Le HTML invece NON hanno cache buster — il browser può servirle stale fino a Ctrl+Shift+R.
- **Regola evergreen (16 mag 2026)**: i link nel corpo articolo (`<a>` dentro `#blogPostContent.prose`) erano INVISIBILI — Tailwind preflight azzera `a { color/text-decoration: inherit }` e `.prose` non li stilava. Fix: regola `.prose a` (blu #2563eb + bold + underline) nello `<style>` inline di `blog-template.html`. Vale per TUTTI gli articoli + le città auto-linkate. NON rimuovere. I box CTA (`.not-prose`) hanno classi proprie, non toccati.
- **`blog-template.html` (7 mag 2026)**: ex `blog.html`, rinominato per non confliggere col rewrite SSR `/blog -> /api/blog`. Contiene tutto il JS client del blog: modificarlo qui (NON in `api/blog.js` che è solo SSR head). I `?v=` interni di data.js/auth.js/ui-components.js restano allineati al resto del sito.

## 📰 Articoli "Bandi" — Pattern Replica

Pivot da "tutorial generico bandi" a "lista bandi reali" + sezione regionale unica + CTA `/annunci?regione=X`. Motivo: search intent mismatch — query "posteggi mercato [regione]" è transactional, il tutorial era informational → bounce alto, zero conversioni.

### Stato (6 mag 2026 — 20/20 COMPLETO)
- ✅ **20 fatte**: Lombardia (autonomo), Piemonte, Lazio, Veneto, Emilia-Romagna, Toscana, Campania, Puglia, Sicilia, Liguria, Marche, Trentino-A.A., Sardegna, Friuli-V.G., Valle d'Aosta, Umbria, Abruzzo, Molise, Basilicata, Calabria.
- Le ultime 5 (Umbria/Abruzzo/Molise/Basilicata/Calabria, basso volume search) chiuse il 6 mag 2026 sera.

### Template
- Slug: `bandi-posteggi-mercatali-{regione}` (lowercase, hyphenated). Categoria DB: `Bandi`.
- Lunghezza target: 3.300-4.500 char (sforare a 5k OK se bandi ricchi, vedi Sicilia/Lombardia).
- Format: HTML (DOMPurify-safe: `<p>`, `<strong>`, `<em>`, `<h2>`, `<ul><li>`, `<a href target="_blank" rel="noopener">`).
- 7-15 grassetti, frasi 10-15 parole, NO trattini lunghi, NO "esploriamo/approfondiamo/in conclusione".
- Struttura fissa: intro con problema → "Bandi attivi adesso" → "Bandi scaduti recentemente" (per "rosicare" — stile dell'utente) → **sezione regionale unica** (vedi sotto) → "Dove cercare i bandi nuovi" (3-4 link) → "Perché i bandi sono pochi" → "Subingresso: la via più veloce" → CTA `/annunci?regione=Nome` + `/vendi`.
- Per ogni bando: Comune, n. posteggi, scadenza esatta, durata concessione, settore, link/PEC. Date precise > vaghe.

### Sistemi regionali speciali scoperti (ognuno ha la sua "regola d'oro")
- **Umbria**: regione di festival, i bandi più ricchi sono eventistici annuali (Eurochocolate Perugia, Umbria Jazz, Festival Spoleto, Quintana Foligno, Calendimaggio Assisi, Tartufo Norcia). Eurochocolate ha tariffe 2-6k€ per i 9gg. Norcia post-sisma 2016 ha bandi atipici di riassegnazione container del Quadrilatero del Tartufo.
- **Abruzzo**: doppio binario costa/montagna. Bandi marzo-aprile per costa estiva (Pescara, Montesilvano, Vasto), settembre-ottobre per montagna invernale (Roccaraso, Pescasseroli). L'Aquila offre tariffe agevolate 3 anni nel centro storico riaperto post-sisma 2009. Costa dei Trabocchi (ciclovia 42km Vasto-Francavilla) bandi nuovi food/artigianato dal 2024.
- **Molise**: la regione **più accessibile d'Italia**. Bandi ricevono 10-15 domande dove in Lombardia ne riceverebbero 80-100 → vincibili al primo tentativo. Trampolino per costruirsi decennale e poi espandersi. Costa cortissima (35 km), Tratturi UNESCO 2019 nicchia food artigianale a concorrenza zero.
- **Basilicata**: tre economie distinte. Matera post-2019 (Capitale Cultura) con boom turistico permanente da 320k→700k visitatori e tariffe Sassi premium ma fatturati 3-4x. Costa tirrenica corta premium (Maratea), costa ionica più lunga e popolare (Metaponto-Policoro). Vulture (Aglianico DOC) sagre enologiche autunnali.
- **Calabria**: 716 km di costa (più lunga del Sud dopo Sicilia). Tirreno premium nazionale/internazionale (Costa degli Dei: Pizzo-Tropea-Capo Vaticano), Ionio popolare familiare (Riviera dei Gelsomini). 4 sagre cardine: Peperoncino Festival Diamante (100k+ visitatori, settembre), Cipolla Tropea, Tartufo Pizzo, Bergamotto Reggio.
- **Emilia-Romagna**: Comuni trasmettono elenco posteggi liberi a gennaio + luglio.
- **Campania**: 30 luglio scadenza Comuni → Regione → BURC + decreto unico (es. Decreto Dirigenziale 66/2025).
- **Puglia**: 30 aprile + 30 settembre Comuni → BURP entro 30gg → bandi semestrali maggio/ottobre. Sistema più organizzato d'Italia.
- **Marche**: calendario regionale annuale via DDDAPIM ogni gennaio (BUR Marche).
- **Sanremo**: scadenza unica 31 gennaio ogni anno.
- **Imperia**: sistema "spunta" giornaliera per posteggi liberi.
- **Veneto**: 90gg pubblicazione bando, 30gg domanda, 15gg revisioni.
- **Roma 18.000 concessioni**: bandone Gualtieri approvato mag 2024, slittato al 2026 per ricorsi TAR + ANA-UGL.
- **Palermo 906/2.135 vacanti**: situazione anomala (40% libero), Confimprese chiede tassa partecipazione 30€ vs 180€.
- **Savona Bolkestein 2032**: rappresentanti Fiva al MIMIT aprile 2026, concessioni attuali fino al 2032.
- **Trentino-Alto Adige**: due Province autonome (Trento L.P. 17/2010, Bolzano L.P. 7/2000) con regole proprie. Bolzano pubblica i bandi in italiano e tedesco, domande presentabili in entrambe le lingue. Mercatini di Natale = finestra annuale separata: bando giugno-luglio per casette stagionali novembre-gennaio (Bolzano, Merano, Bressanone, Trento, Rovereto, Brunico).
- **Sardegna**: due binari paralleli — mercati cittadini storici (San Benedetto Cagliari, Lu Mercatu Sassari, Sa Mura Oristano) con bandi rari, e posteggi turistici stagionali sulla costa con bandi annuali ricorrenti (1 giu - 15 set). Apertura finestra marzo-aprile. LR 5/2006 sul commercio. Settori top stagionali: gelato, cocco, bibite, abbigliamento mare.
- **Friuli-Venezia Giulia**: regione a statuto speciale, LR 29/2005 sul commercio. Particolarità chiave: clienti transfrontalieri (Slovenia/Austria) a Trieste, Gorizia, Tarvisiano cambiano il valore di alcuni posteggi. Costa Lignano-Grado = polmone turistico estivo, bandi stagionali giu-set ogni anno. Mercato delle Pulci di San Giacomo (Trieste) = appuntamento mensile storico per antiquariato/usato.
- **Valle d'Aosta**: regione a statuto speciale bilingue italiano-francese, LR 12/1999. **Fiera di Sant'Orso** ad Aosta (30-31 gennaio) = evento millenario, oltre 1000 banchi, bando dedicato esce settembre-ottobre dell'anno precedente. Stazioni sciistiche (Courmayeur, Cervinia, La Thuile, Pila, Champoluc) hanno bandi separati invernali (dic-apr) ed estivi (lug-ago). 74 Comuni piccoli = pochi bandi MA concorrenza bassissima → vincibili al primo tentativo.

### Workflow tecnico
- Articoli stanno SOLO in DB Supabase (`blog_posts`), non in file repo. NESSUN git push necessario.
- UPDATE: file SQL temp in `/tmp/`, dollar-quote `$content$ ... $content$` per evitare escape, eseguito con `supabase db query --linked --file /tmp/X.sql`. Rimuovere file dopo.
- **Bumpare `published_at = now()`**: freshness signal Google, ricrawl più probabile (la tabella non ha `updated_at`).
- **Aggiornare anche `excerpt`**: è la meta description su Google, conta per CTR.
- Filtro `?regione=Nome` su /annunci: valore deve matchare ESATTAMENTE quello in `js/data.js` (es. `Emilia-Romagna` col trattino, `Friuli-Venezia Giulia` col trattino e spazio, `Valle d'Aosta` con apostrofo, `Trentino-Alto Adige` col trattino).
- Sitemap dinamica fa fetch ogni 1h, niente da rigenerare.

### Output finora — char per articolo
Calabria 8866, Basilicata 7898, Abruzzo 7371, Molise 7276, Umbria 6403, Valle d'Aosta 5478, Friuli-V.G. 5416, Lombardia 5322, Trentino-A.A. 5278, Sardegna 5165, Sicilia 4950, Liguria 4385, Lazio 4291, Puglia 4246, Campania 4110, Emilia-R. 4015, Veneto 3993, Toscana 3814, Marche 3730, Piemonte 3347.

## 🐌 Pubblicazione Annuncio — Lessons Learned

- Tutti i webhook UI sync rimossi (30 apr 2026): annunci aveva 5 webhook che bloccavano INSERT 15-20s. Sostituiti con 2 trigger custom async via pg_net. INSERT < 800ms post-fix.
- **NON ricreare webhook UI dalla Dashboard.**
- Timeout INSERT su `annunci` = 45s in `vendi.html` (`_withTimeout`).

## ⏳ TODO Aperti

### 🎯 PROSSIMI PASSI — ripresa dopo fine sessione 22 mag 2026 (leggere per primo)

**⚡ STILE: l'utente è un vibe coder. Rispondere CORTO e SEMPLICE, zero gergo, niente papiri. Vedi CLAUDE.md regola n.1 + memoria feedback_stile_risposte.**

**Chiuso il 22 mag 2026:**
- ✅ Riposizionata copy SEO di `/annunci` (H1 più corto "Posteggi e licenze ambulanti" + boilerplate spostato in fondo, era brutto in alto).
- ✅ Flag `is_demo` su `annunci` (21) + `profiles` (10 utenti seed `a1b2c3d4-*`): i demo restano visibili al pubblico ma spariscono dai numeri admin (Annunci Totali 38, Attivi 30, Utenti 30). RPC `admin_total_listing_value`/`admin_listings_per_regione`/`admin_funnel_stats` + query dashboard filtrate. **Lezione**: su `annunci`/`profiles` ogni colonna nuova serve `GRANT SELECT (col)` esplicito (grant SELECT è column-level per tel/email REVOKE), altrimenti la dashboard mostra 0.
- ✅ Cura cannibalizzazione `quanto costa un posteggio al mercato` (3 pagine competevano, 0 clic su 23 impr): titolo `quanto-costa` col prezzo ("da 2.000 a 100.000€"), link incrociati costa↔vale, excerpt differenziati, published_at bumpato. Misurare CTR tra ~1 sett.
- 📈 SC 22 mag: Bolkestein vola (16 clic/84 impr/pos 4,1, raddoppiato in 4gg). Query transazionali Step 1 ancora 0 (normale, 2gg).

**Chiuso il 20 mag 2026** (l'utente nota assenza dalle SERP transazionali "vendo licenza ambulante" → analisi competitor + Step 1 SEO):
- ✅ **Step 1 SEO transazionale**: rifatti title/meta/og/twitter + H1 + intro SEO su `/annunci` e `/vendi`. Linguaggio query reale ("Vendere Licenza Ambulante o Posteggio Mercatale", "Licenze Ambulanti e Posteggi Mercatali in Vendita") al posto di "Inserisci Annuncio Gratis" / "Annunci". Aggiunta `<section>` SEO intro stile Idealista in `/annunci` sopra i risultati. `/vendi` ora ha un H1 (prima non esisteva nel body, Google vedeva solo `<title>`). Commit `1348a7a`, pushato. **Step 2 (landing regionali SSR) NON ancora fatto** — è la mossa successiva.
- ✅ **Analisi competitor consolidata**: SERP delle query core dominata da **annunciambulanti.it** (6.444 annunci, 1.586 Lombardia, 20 landing regionali, freshness 15 mag). Mercaweb fragile (101 annunci, no filtri geo). Piano completo per superarli in `~/.claude/memory/project_compete_annunciambulanti.md` — riassunto: inventario beachhead Lombardia (50-100 reali) → Step 2 SSR landing regionali (`api/annunci.js`) → differenziazione di prodotto (servizio SUAP, prezzi medi pubblici, valutatore in evidenza). Cantiere 3-6 mesi, non chiudibile in una sessione.

**Chiuso il 18 mag 2026** (da SC: 151 clic / 0 conversioni → diagnosi funnel):
- ✅ **TODO 14**: `blog-template.html` ora traccia `cta_annunci_click` anche su `/annunci` puro / `/annunci?q=` (regione=null). Commit `de9c27a`, pushato.
- ✅ **Box posteggi al picco di tensione**: sui non-bandi il box "Posteggi disponibili adesso" è iniettato INLINE al 3° `</p>` (al posto del banner off-intent "Vetrina gratis", TODO 13 metà) invece che in fondo. Flag `_inlineBoxInjected`, `finalCtaBlock` condizionale, fallback box-in-coda se <3 `<p>`. Copy box regione=null reso intent-aligned. Commit `5e25af4`, pushato. **Bandi invariati.** `blog-template.html` NON ha cache-buster → Ctrl+Shift+R per vederlo.
- ✅ **Cover 77/77** (erano 53 senza): bulk assign da pool Pexels già live/verificato sui bandi, mappate per categoria (no stessa foto 2× nella stessa categoria, escluso id 1187299 = fallback codice). Prerequisito Google News/Discover (TODO 17) sbloccato. Solo DB.
- ✅ **`mercati-ambulanti-lazio`** pubblicato (v2, 3223 char, cover, CTA `/annunci?regione=Lazio`). **Filone "mercati ambulanti [regione]" CHIUSO 5/5.**
- ✅ **TODO 21**: `suap ortisei` atterra su `bandi-posteggi-mercatali-trentino-alto-adige` (era tangenziale). Aggiunta sezione `<h2>Ortisei e la Val Gardena: il caso SUAP</h2>` prima di "Perché i bandi sono pochi" (5278→6432 char), excerpt aggiornato (Ortisei/Val Gardena/SUAP), `published_at` bumpato. No thin content.

Ordine consigliato prossima sessione:
1. **SC indicizzazione**: coda in `C:\Users\utente\Desktop\indicizzazione-prioritari.txt`, 10/giorno. Aggiungere `/annunci`, `/vendi` (Step 1 appena fatto, vanno ri-crawlati per intercettare le query transazionali), `mercati-ambulanti-lazio`, e ri-submittare `bandi-posteggi-mercatali-trentino-alto-adige` (aggiornato).
2. **Inventario reale beachhead** (priorità n.1 del piano competitor): demo già cancellati il 22 mag (TODO 3 ✅), ora 34 annunci veri. Puntare a 50-100 in Lombardia. Strumento principale: attivare il lead magnet email sull'hub Bolkestein (audience venditori spaventati). Vedi `project_compete_annunciambulanti.md`.
3. **Step 2 SEO — `api/annunci.js` per landing regionali SSR**: title/meta/H1 customizzati per `?regione=X`, sull'esempio di `api/blog.js`. Da NON fare prima di avere ≥5 annunci attivi per regione (Google nota le pagine zero-content). Vedi piano competitor.
4. **TODO 11 — Fase 5 piano blog conversion**: ora sbloccata (tracking funziona + 7-14gg dati + box riposizionato). Pannello "Performance blog" admin.
5. Serie **"Mercati settimanali [città]"** (TODO 16, batch v2), **6 Tier 2 + 3 Tier 3 Bolkestein** (TODO 19).
- **Decisioni utente in sospeso** (non toccare senza via): Privacy policy placeholder pre go-live (TODO 4), Data audit (TODO 18, richiesto esplicitamente), A/B copy **popup_vetrina** 0-conv (TODO 13, resta solo la metà popup_vetrina).
- **Promemoria temporizzato**: maintenance mensile hub Bolkestein dovuta **~metà giugno 2026** (RPC `admin_bump_post_freshness` + ri-datare top + nuovo bullet cronologia) o decade dalle SERP "ultime notizie 2026".
- **Stato filone regionale**: **5/5 chiuso** (Lombardia/Veneto/Emilia-Romagna/Toscana/Lazio, tutti v2).

21. ~~**`suap ortisei` — filone da capire**~~ ✅ CHIUSO 18 mag 2026. Atterrava (tangenziale) su `bandi-posteggi-mercatali-trentino-alto-adige`. Risolto con sezione dedicata `<h2>Ortisei e la Val Gardena: il caso SUAP</h2>` nello stesso articolo (no nuovo thin article: 4 impr di volume) + excerpt rifatto + `published_at=now()`. Pattern generalizzabile: query geo-specifica ad alto CTR che atterra su pagina region-wide → aggiungere sezione locale all'articolo esistente, non crearne uno nuovo.

1. **Indicizzazione Search Console**: continuare ~10 URL/giorno. Lista in `C:\Users\utente\Desktop\indicizzazione-search-console.txt` (utility, non parte del repo).
2. ~~**Replica articolo bandi alle 5 regioni rimaste**: Umbria, Abruzzo, Molise, Basilicata, Calabria.~~ ✅ Chiuso 6 mag 2026 sera. **20/20 regioni complete**.
3. ~~**Annunci Demo**: 10 annunci finti~~ ✅ FATTO 22 mag 2026. Eliminati hard-delete **21 annunci demo** (`is_demo=true`: 11 sotto admin Ardit + 10 sotto seed) + **10 account finti** seed `a1b2c3d4-*` / `*.demo@subingresso.it` (sia `profiles` che `auth.users` — profiles NON ha FK verso auth.users). Restano 34 annunci veri attivi, 32 utenti veri, account admin intatto. Cancellazione via Management API in 1 transazione. Collateral accettato: sparite 5 chat di 2 utenti veri (Gimmy, alessio) sui demo. Vedi memoria `project_annunci_demo.md`.
4. **Privacy policy**: 3 placeholder `[NOME TITOLARE]`, `[INDIRIZZO + P.IVA]`, `[EMAIL CONTATTO]` da compilare prima del go-live legale.
5. **Spalmare 2 cron settimanali su giorni diversi** (5 min, allunga vita free Resend).
6. **CSP**: 1 settimana di lavoro, da pianificare.
7. **Cleanup conv vuote già esistenti**: `DELETE FROM conversazioni c WHERE NOT EXISTS (SELECT 1 FROM messaggi m WHERE m.conversazione_id = c.id);` — opzionale, il filtro client-side già le nasconde.
8. **Step 3 lifecycle annunci scaduti**: edge function + cron daily che manda 2 email al venditore. (a) "scade tra 7gg, riattivalo" con link diretto a renew, (b) il giorno della scadenza "è scaduto, contatti bloccati, riattivalo in 1 click". Tabella `expiry_notification_log(annuncio_id, kind, sent_at)` UNIQUE per dedup. ~150 righe TS Deno + setup SQL + cron `pg_cron`. **Non ancora fatto**, sessione 5 mag chiusa con Step 1+2 done.
9. **og:image `/annunci` e `/blog`**: ancora foto Pexels frutta/verdura. Sostituire con immagini on-brand quando disponibili (stessa convenzione self-hosted in `/og/`).
10. **Trust whitelist modifiche annuncio**: valutare se attivare auto-approvazione modifiche dopo N annunci approvati per ridurre admin overhead delle re-revisioni.
11. **Fase 5 piano blog conversion** — solo dopo 7-14gg di dati: aprire pannello "Performance blog" admin (dashboard.html sopra Valutatore) + RPC `admin_blog_stats(p_days)`. Identificare 3-5 regioni con CR% basso (<1%) e tante views (>50) → riscrivere copy di quegli articoli mirando a CTA più chiare + paragrafi sopra il fold più orientati al "subingresso veloce vs bando lento". Anche guardare iscrizioni a `bando_alerts` per regione (RPC futura: count by regione → indicatore di intent forte). Tracking dati: tabella `blog_conversions` con `kind ∈ {cta_annunci_click, alert_signup, box_listing_click}`.
12. **`welcome_popup` source dichiarato ma morto** (9 mag 2026): nel `_AMO_VALID_SOURCES` + DB CHECK constraint, ma nessuna call site lo usa. Decidere se costruire il welcome popup post-registrazione (CTA "completa il profilo" o "carica avatar") oppure rimuoverlo dall'enum.
13. **A/B test copy popup_vetrina + blog_promo** (9 mag 2026): in 30gg ZERO conversion da entrambi (codice tracker OK, è copy/UX issue). Popup vetrina mostra "🎰 Vinci 30 giorni di Vetrina" — provare alternative meno gambling-vibe ("Iscriviti gratis e pubblica il tuo annuncio"). Blog_promo idem: "Vetrina gratis" è off-intent per chi legge guide compravendita.
14. **CTA `cta_annunci_click` non scatta su `/annunci` puro** (9 mag 2026): il listener delegato in `blog-template.html` fa `href.indexOf('/annunci?regione=') === 0` → niente match per link senza regione. Sui top 7 articoli non-bandi (44 views totali) ZERO click tracciati. Estendere il listener anche a `/annunci` senza regione, con `regione=null`.
15. ~~**Articolo "Quanto costa un posteggio al mercato"**~~ ✅ Chiuso 16 mag 2026. Pubblicato `quanto-costa-un-posteggio-al-mercato` (cat `Guida`, autore `Redazione Subingresso`, 6009 char, cover NULL, `published_at=now()`). Title con frase query esatta in apertura. Angolo distinto dal sibling `quanto-vale-*` (valutazione rivendita): qui costo = (a) prezzo d'acquisto con **5 fasce** 2k→100k+, (b) spese fisse annue (INPS ~4.2-4.5k, Canone Unico, TARI, mezzo, commercialista → 7-12k/anno). Sezione "partire da zero" intercetta `posti mercato` + `come aprire una bancarella al mercato` (bando gratis ma lento vs subingresso veloce). Conversione naturale: CTA valutatore al picco tensione (3° §, regola "CTA in alto"), /annunci a metà, close valutatore+/annunci+/vendi. Chiude anche mossa 20.4. Solo DB, no git push, sitemap auto +1h.
16. **Serie "Mercati settimanali [città]" e "Mercati ambulanti [regione]"** (9 mag 2026): 2 nuovi filoni editoriali confermati da SC. Top 10 città (Modena/Brescia/Bergamo/Milano/Bologna/Torino/Verona/Padova/Firenze/Napoli) + 5 regioni rimaste (Lombardia/Veneto/Emilia/Toscana/Lazio). **Filone "mercati ambulanti [regione]" APERTO il 16 mag 2026**: pubblicato `mercati-ambulanti-lombardia` (cat `Guide Regionali`, autore `Redazione Subingresso`, 4252 char, cover NULL, `published_at=now()`). Angolo *discovery* (quali mercati / dove rende il banco) distinto da `bandi-posteggi-mercatali-lombardia` (concorso) e `posteggi-mercatali-lombardia-guida-acquisto-vendita` (processo) → no cannibalizzazione. CTA `/annunci?regione=Lombardia` (forma SENZA `.html` → tracciata dal listener `cta_annunci_click`) al picco tensione + close valutatore/annunci/vendi. **16 mag 2026**: pubblicato anche `mercati-ambulanti-veneto` (cat `Guide Regionali`, 4271 char, cover NULL, CTA `/annunci?regione=Veneto` tracciata, leva turismo costa/lago/Venezia + Prato della Valle Padova). Pubblicato anche `mercati-ambulanti-emilia-romagna` (2901 char, formato scansionabile v2, CTA `/annunci?regione=Emilia-Romagna` tracciata, angolo food valley + riviera + nugget "Comuni pubblicano posteggi liberi gen+lug"). `mercati-ambulanti-veneto` riscritto v2 scansionabile (4271→2875). Pubblicato anche `mercati-ambulanti-toscana` (2933 char, v2, CTA `/annunci?regione=Toscana`, angolo turismo internazionale + Mercato del Forte + Fiera Antiquaria Arezzo). **Retrofit v2 COMPLETATO 16 mag**: `mercati-ambulanti-lombardia` (4252→2605) e `quanto-costa-un-posteggio-al-mercato` (6009→3029) riscritti scansionabili. **Tutti gli articoli nuovi/recenti ora sono v2.** **Resta**: Lazio (regione) + serie città. **SC**: quota 16 mag ESAURITA — coda 17 mag: #1 `quanto-costa-un-posteggio-al-mercato` (8 impr/0 clic), #2 `mercati-ambulanti-lombardia`, #3 `mercati-ambulanti-veneto`, #4 `mercati-ambulanti-emilia-romagna`, poi hub Bolkestein dopo rewrite 20.1. File `Desktop\indicizzazione-prioritari.txt` (utility, fuori repo) aggiornato.
17. **JSON-LD `author` Organization → Person + pagina `/autori/<slug>`** (9 mag 2026): segnale E-E-A-T più forte per Google Discover. Discover NON ha iscrizione, è automatico — Subingresso ha già requisiti tecnici (NewsArticle schema, mobile, HTTPS) ma serve volume traffico stabile (>5k impr/mese, oggi 263) + author authority. Eligibility realistica: 3-6 mesi.
19. **Roadmap editoriale Bolkestein-ambulanti** (10 mag 2026 → aggiornato 11 mag 2026): Search Console conferma trazione, ultime 24h 4 query Bolkestein su 7 (13/17 impr, 2/2 clic). **Stato**: ✅ hub `bolkestein-ambulanti-ultime-notizie-2026` pubblicato 11 mag (cat `Normativa`, 6930 char, cronologia gen→mag 2026 mese per mese, fonti MIMIT/EUR-Lex, dual CTA, box "Aggiornato [data]" + nota maintenance mensile in fondo). ✅ Tier 2 primo `subingresso-bolkestein-licenza-ambulante-2026` pubblicato 11 mag (cat `Normativa`, 6036 char, finestra 2026-2028, esempi concreti Bologna 35k€ / Comune piccolo 8k€, sezione "cosa NON funziona più", inter-link bidirezionale con hub). Mancano: 6 Tier 2 (`roma-18000-concessioni-ambulanti-2026`, `proroga-2032-concessioni-ambulanti-legge-77-2020`, `procedura-infrazione-ue-italia-ambulanti-bolkestein`, `associazioni-ambulanti-bolkestein-confronto`, `sentenze-tar-consiglio-stato-bolkestein-ambulanti`, `linee-guida-mimit-regioni-anci-bandi-ambulanti-2026`) + 3 Tier 3 (`concessione-ambulante-scadenza-2026-guida-pratica`, `diritto-insistenza-bolkestein-ambulanti-2026`, `diventare-ambulante-2026-bolkestein-accesso`). **Maintenance committed**: l'hub va datato e aggiornato ogni mese (RPC `admin_bump_post_freshness` dal pannello admin + cambio "Aggiornato l'XX [mese] 2026" in cima + un nuovo bullet nella cronologia per il mese passato) o decade dalle SERP "ultime notizie 2026" in 60gg. Cover image NULL per entrambi (pattern già usato dal pre-esistente `bolkestein-ambulanti-cosa-cambia-2026`). Nota: `bolkestein-ambulanti-cosa-cambia-2026` (2615 char, generato dal blog generator) esiste già ed è in cat `Normativa`: tenerlo come articolo "intro/guida" subordinato al nuovo hub, oppure consolidare in futuro.
18. **Data audit — cosa salviamo, cosa dovremmo salvare** (9 mag 2026, richiesta esplicita utente): rivedere insieme quali dati persistiamo e quali sono "buchi" — in particolare: (a) **annunci eliminati** (oggi solo soft-delete `status='deleted'`, niente storico delle ragioni o del momento), (b) **annunci venduti/affittati** (oggi non tracciamo l'esito — chi ha venduto, a quanto, in quanto tempo), (c) potenzialmente: log delle modifiche annunci, ricerche utente, eventi conversione (passaggi acquirente↔venditore), abandono carrello vetrina. Outcome data per posteggi venduti = gold per stats "tempo medio di vendita" / "prezzo finale vs richiesto" stile Idealista. Discutere prima di shippare.
20. **Mosse SEO post-pubblicazione Bolkestein** (12 mag 2026, da SC ultime 24h: 27 impr / 1 clic / 8 query, 22 impr Bolkestein = 81%). **Punto critico**: `bolkestein ambulanti ultime notizie 2026` ha **11 impr / 0 clic** (CTR 0%) — siamo in SERP sull'hub ma title/desc non convince o posizione bassa. Mosse in ordine di ROI atteso:
    - ~~**(1+3) Riscrivere title + excerpt del hub Bolkestein**~~ ✅ FATTO 16 mag 2026. Nuovo title `Bolkestein ambulanti, ultime notizie 2026: 150.000 licenze a rischio (aggiornato 16 maggio)`, nuovo excerpt con numero+data+tensione, nuova voce datata "16 maggio 2026. Conto alla rovescia sul TAR" in cima alla cronologia, riga top ri-datata, `published_at=now()`. 6930→7383 char. **Prossima maintenance mensile dovuta ~metà giugno 2026** (RPC `admin_bump_post_freshness` + cambio data top + nuovo bullet cronologia, o decade dalle SERP "ultime notizie 2026" in 60gg). Resta da fare SC re-submit hub (coda 17 mag, ora sbloccato).
    - **(2) Indicizzazione manuale SC dei 4 articoli Bolkestein** (hub + subingresso + vendere + comprare). Ispezione URL → Richiedi indicizzazione. Quota 10/giorno, ne bastano 4.
    - **(4) Articolo `quanto-costa-un-posteggio-al-mercato`** (già nel TODO 15): query `quanto costa un posteggio al mercato` ha 1 impr/24h, atterriamo su `quanto-vale-un-posteggio-mercatale` titolo non identico. Quick win: H1 IDENTICO + 4-5 fasce prezzo per tipologia + CTA valutatore. Intercetta anche `posti mercato` (2 impr) e `come aprire una bancarella al mercato` (1 impr) di rimbalzo. 30-40 min.
    - **(5) Internal linking** dal footer/homepage/`/blog` lista al hub Bolkestein per authority topica. 15 min.
    - Note nuove query 12 mag emerse: `bolkestein ambulanti` (2 impr), `ambulanti bolkestein` (2 impr) — già intercettate dal hub. `posti mercato` (2 impr) — nuovo filone generico da capire (se cresce → articolo dedicato). `come aprire una bancarella al mercato` (1 impr) — query entry-level, target chi vuole iniziare attività ambulante.

### TODO chiusi (23 mag 2026)
- ~~**Bug vivo: lotteria welcome morta in `auth.js`**~~ ✅ Il codice cercava RPC `try_welcome_lottery` + colonna `welcome_lottery_eligible`/`welcome_lottery_won` **inesistenti in prod** → l'upsert profilo falliva (rischio perdita nome/telefono su alcune registrazioni). Rimosso il popup "ruota della fortuna" + `_tryLottery`/`_spinWheel`/`_showLotteryResult`; popup benvenuto ora solo CTA "Pubblica annuncio". Pulita anche edge function `register-bypass` (scriveva la colonna inesistente in silenzio) + **redeploy**. Bump `auth.js?v=18 → v=19` su 14 HTML. Commit `365f562`. Verificato: i profili li crea il trigger DB `handle_new_user`, gli upsert falliti erano ridondanti. **Restano resti innocui** (TODO 12): `grant-welcome-vetrina` ancora chiamata da `vendi.html` (ritorna `granted:false`), enum `welcome_popup`, colonna `vetrina_welcome_days`. Vedi memoria `project_welcome_lottery_orphan.md`.

### TODO chiusi (12 mag 2026)
- ~~Bug "lista messaggi vuota" sul sito (`/messaggi` pannello vuoto pur con 8 conv + 16 msg nel DB)~~ ✅ Causa root: `messaggi.html` chiamava `formatFullName` (data.js) e `showToast` (data.js) senza linkare `js/data.js`. `ReferenceError` faceva crashare `.map()` di `renderConvList`, l'eccezione veniva silenziata dal try/catch del boot. Bug latente dal 6 mag (refactor "Display nome anti-duplicato"). Fix: aggiunto `<script src="js/data.js?v=17">`. Regola evergreen aggiunta in "Bug Storici Generalizzabili".
- ~~Audit silenzioso bug pattern uguali in tutto il sito~~ ✅ Verificate funzioni globali (data.js, auth.js, ui-components.js) vs script linkati in tutti i 19 HTML root. Nessun altro mismatch. Verificati anche `let history`, `_supabase.rpc().catch()`, escape case mismatch, promesse senza catch, syntax check JS, header/footer injection. Allineati 4 HTML minori (`contatti.html`, `modifica-annuncio.html`, `privacy.html`, `termini.html`) ai cache buster correnti (`?v=18` per auth.js, `?v=11` per ui-components.js).

### TODO chiusi (11 mag 2026)
- ~~Roadmap Bolkestein parte 1: hub "ultime notizie 2026" + Tier 2 "subingresso e Bolkestein" mancanti~~ ✅ Pubblicati entrambi in `blog_posts` con upsert idempotente (ON CONFLICT slug). Trigger: SC ultime 24h mostra 4 query Bolkestein su 7 totali, 13/17 impr e 2/2 clic atterrano già su contenuti tangenziali. Hub (6930 char) con cronologia gen→mag 2026, fonti, dual CTA `/annunci` + `/vendi`. Tier 2 (6036 char) con finestra 2026-2028, esempi Bologna 35k€ / Comune piccolo 8k€, "cosa non funziona più", inter-link al hub. Categoria `Normativa` (riusata dal pre-esistente `bolkestein-ambulanti-cosa-cambia-2026`). Sitemap dinamica li include in 1h. **Restano 6 Tier 2 + 3 Tier 3** + commitment maintenance mensile dell'hub.

### TODO chiusi (9 mag 2026)
- ~~Box admin "Valore Annunci" gasometro~~ ✅ 5° card stats grid (`grid-cols-2 md:grid-cols-5`), RPC `admin_total_listing_value()` SECURITY DEFINER, formula vendita = `SUM(GREATEST(prezzo, 1000))` + affitto = `SUM(prezzo*8)` capitalizzazione conservativa. Solo `status='active'`. Stile soft indigo. PATCH idempotente.
- ~~`/blog` (lista) classificata "Discovered, not indexed" — thin content~~ ✅ `api/blog.js` ora customizza meta SEO + inietta `<section id="blogListIntro">` 165 parole originali (3 paragrafi: cosa offre, regioni coperte, focus territori turistici) sopra le card.
- ~~6 pagine `/annuncio?id=` "Discovered, not crawled" per scarsi link interni~~ ✅ `api/annuncio.js` SSR-popola `#relatedSection` con 3 annunci stessa regione (esclusione self). Card semplificate con cover+comune+titolo+prezzo. Bottone "Vedi tutti" a `/annunci?regione=X`. Client mantiene rendering ma usa stessi link. +4 link interni per pagina visibili a Googlebot.
- ~~3 bug critici nel funnel registrazione e tracking page views~~ ✅ (a) `_AMO_VALID_SOURCES` esteso a 12 valori (mancavano `chat_click,whatsapp_click,call_click` → 30gg di click contatto attribuiti a `direct`), (b) page-view-tracker slug sanitization riscritta con `match` invece di `replace+slice` (slug malformati tipo `aprire-attivita-...avvihttpssubingressoitblo` quando URL aveva concatenazioni), (c) `_insertBlogPromo` ora nasconde il banner per utenti loggati post-render. Bumpato `auth.js?v=18` e `page-view-tracker.js?v=3` su tutti gli HTML.
- ~~File `Desktop/indicizzazione-priorita.txt` con 50 URL ordinati per richiesta indicizzazione manuale SC~~ ✅ creato (10/giorno × 5 giorni). Top: `/blog`, `/annunci`, articoli blog non-bandi (`affittare-o-vendere`, `quanto-vale`, `costi-nascosti`, `come-negoziare-prezzo`, ecc.), 11 annunci ricchi (Milano €42k, Como €25k, Verona €23k…), pagine geo capoluoghi maggiori (Torino, Roma, Firenze, Bologna, Genova).

### TODO chiusi (7 mag 2026)
- ~~Blog post NON SSR: tutti i `/blog?post=<slug>` servivano lo stesso HTML statico con title generico "Blog & Guide per Ambulanti"~~ ✅ creato `api/blog.js` SSR (rewrite incondizionato `/blog -> /api/blog`), template rinominato `blog.html -> blog-template.html` per evitare cleanUrls intercept. Ora i 20 articoli bandi rispondono con title/desc/canonical/og:*/JSON-LD NewsArticle specifici. Test 3-tier passato (Lombardia, Calabria, slug fake → 404+noindex, lista /blog → 200). Lessons learned aggiunte alla sezione SEO & Google.

### TODO chiusi (6 mag 2026)
- ~~10 articoli blog regioni con tutorial generico (Piemonte→Marche)~~ ✅ riscritti con bandi reali + sezione regionale unica + CTA `/annunci?regione=`. Lombardia era già fatta. Restano 9 regioni a basso volume (Friuli, Trentino, Valle d'Aosta, Umbria, Abruzzo, Molise, Basilicata, Calabria, Sardegna).
- ~~Vetrina estendeva `expires_at` (cap 230/300/400)~~ ✅ rimosso. Tutti i post valgono 200gg, vetrina = solo featured/posizione. Stripe-webhook re-deployato pulito.

### TODO chiusi (6 mag 2026 — sessione sera)
- ~~Bug grosso: admin e user di prova non vedevano i propri annunci attivi nella dashboard "I miei annunci"~~ ✅ causa: `saved_count` (colonna aggiunta dal patch del mattino) senza GRANT SELECT per anon/authenticated, postgres non lo propaga su tabelle column-restricted (REVOKE su tel/email). `select(...,saved_count,...)` tornava 42501 silenzioso → "Nessun annuncio". Fix: GRANT SELECT (saved_count) ON annunci, niente codice JS toccato. Aggiornato anche PATCH originale + bullet evergreen in istruzioni.
- ~~Card "I miei annunci" dashboard non cliccabili → utente non poteva vedere come appare il proprio annuncio dal pubblico~~ ✅ thumbnail + titolo wrappati in `<a target="_blank">` verso `/annuncio?id=ID`, hover ring blu / text-blue-600. Bottoni azione invariati (fratelli dell'<a>, non figli, niente conflitti).
- ~~Articoli bandi 5 regioni rimaste (Umbria, Abruzzo, Molise, Basilicata, Calabria)~~ ✅ tutte e 5 riscritte con nuovo template (bandi reali + sezione regionale unica + CTA `/annunci?regione=`). **20/20 regioni italiane ora coperte.** Lengths: Umbria 6403, Abruzzo 7371, Molise 7276, Basilicata 7898, Calabria 8866.
- ~~Piano blog conversion 4 fasi su 5~~ ✅ Fase 0 (tracking per-articolo + blog_conversions + pannello Performance Blog admin). Fase 1 (sistema Avvisi backend: bando_alerts + edge subscribe-bando-alert + edge notify-bando-subscribers + trigger DB + estensione email-unsubscribe + privacy.html). Fase 2 (UI bandi: form Avvisi inline + box live + rimozione valutatore/Vetrina off-intent). Fase 3 (box live esteso ai non-bandi + link città inline). Fase 4 (FAQ JSON-LD + box "Bandi in regioni vicine" + bumping freshness admin). Fase 5 lasciata per prossima sessione (richiede 7-14gg di dati). Test E2E sistema Avvisi superato: idempotenza, multi-regione, unsub funzionante.

### TODO chiusi (6 mag 2026 — sessione pomeriggio)
- ~~Prezzi civetta a 100€ tondo per attirare click~~ ✅ min 101 (blocca il "100 tondo"), max 400.000 (range realistico posteggi), messaggi vaghi senza rivelare i limiti, nudge box amber "prezzo civetta vende 3 volte meno".
- ~~Form Foto: caricava 5 foto a tutti + CTA upsell vetrina invasivo~~ ✅ free 1 foto / vetrina attiva 5, nudge "vende fino a 3 volte di più", CTA upsell vetrina rimosso.
- ~~Step 5 senza preview: utente non vedeva come sarebbe apparsa la card~~ ✅ preview live via `buildCard()` con fakeListing, oninput su titolo/nome, object URL per foto.
- ~~Auth banner "devi registrarti" all'apertura vendi spoilerava il sunk cost~~ ✅ banner rimosso all'apertura, sostituito da microcopy sotto bottone Pubblica + modal contestuale al click.
- ~~Visitor popup vetrina si mostrava anche durante creazione annuncio~~ ✅ mai in `/vendi`, attesa loop 3s se modal auth aperto.
- ~~"Gianfranco Dona Dona" e simili display naive `[nome,cognome].join`~~ ✅ helper globale `formatFullName()` PER PAROLA + sanitize input al register + 10 display point migrati + Gianfranco DB fixato.
- ~~Sospetto popup vetrina non converte: serve dato per sorgente~~ ✅ tabella `auth_modal_opens` pseudonima + 12 sorgenti tipizzate + RPC admin + pannello dashboard "Funnel registrazione per sorgente" sopra Valutazioni + GDPR privacy aggiornata (no cookie banner necessario).
- ~~Salvati nei preferiti: il venditore non vedeva quante persone avevano salvato il suo annuncio~~ ✅ colonna `annunci.saved_count` + trigger atomico, autori restano privati (RLS owner-only invariata), display in pagina annuncio + dashboard + email weekly.
- ~~Funnel non distingueva click "Messaggia" / "WhatsApp" / "Chiama"~~ ✅ aggiunti chat_click/whatsapp_click/call_click, `requireAuth(callback, source)` propaga la source.

### TODO chiusi (5 mag 2026)
- ~~Search Console "Pagina con reindirizzamento": canonical valutatore + strip .html~~ ✅ canonical e link interni allineati.
- ~~`/annunci/[capoluogo]` mostrava solo annunci nel comune esatto~~ ✅ ora 3-tier comune→provincia→200km.
- ~~Pannello Segnalazioni admin sempre visibile anche con 0 segnalazioni~~ ✅ auto-hide se Aperte=0.
- ~~Funnel admin con "Telefono nel profilo" confondente~~ ✅ ridotto a 4 step puliti.
- ~~Default lifecycle annuncio 100gg troppo corto vs cicli reali (3-12 mesi)~~ ✅ 200gg + cap vetrina riallineati.
- ~~Annunci scaduti spariscono o restano con contatti aperti~~ ✅ visibili con badge + contatti bloccati + bottone Riattiva.
- ~~og:image home Pexels frutta off-brand~~ ✅ rimossa, sostituita con immagine custom self-hosted.

### Bug minori segnalati ma non urgenti
- `moderation.js` non incluso in HTML (mitigato da trigger DB).
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

### Outreach partner (priorizzato per fase trazione)
- **Subito (Tier 1, zero attrito)**: registrazione su **Awin Italia** + **Adtraction** (network affiliate aggregano Cofidis/Younited/Hype/CrediPass). Outreach LinkedIn a **broker creditizi OAM** (Auxilia Finance, Credipass, BPIfutura) — affamati di lead, no soglia volume. Email a fornitori italiani (**Gazebo Italiano, GAM, Bilance Vetrino**) per partnership tipo Amazon-affiliate ma diretta (5-10% margine vs 3% Amazon, no cookie 24h). **Banca Etica** sì (brand-aligned, accetta volumi piccoli come content partnership).
- **Aspettare 60-90gg (Tier 2, hanno CRM "rifiutato")**: **Cofidis Business** (`02 366 16 334`, programma "Diventa Partner" con 25k+ partner), **PerMicro** (`permicro.it/membership`), **Banche grandi** (Sella, BPM). **Se rifiutano oggi con 3-4k pageviews chiudono la porta per 2-3 anni**. Soglia di credibilità minima: ~10k pageviews/mese + 1 case study lead venduto via network affiliate.
- **6+ mesi**: associazioni di categoria (ANA-UGL, Confimprese ambulanti, Federconfcommercio) — lente ma cumulative SEO/backlinks.
- **Annunciambulanti.it riassessment** (8 mag 2026): fatturato stimato **€1-3.5k/mese** (NON €100-500 come prima stima): hanno AdSense (caricato JS, non visibile in static fetch), vetrine paywall progressivo nel form di vendita, Amazon affiliate 4-prodotti (gazebo/pesi/luci LED/tavoli alluminio). **Zero partner finanziari diretti** → first-mover totale per Subingresso nel verticale.

### Espansione multi-vertical (architettura proposta, anno 2+)
- **TAM aggregato 10 verticali italiani** (tabacchi 50k, posteggi 150k, autoscuole 7k, balneari 10k, distributori 22k, farmacie 20k, edicole 12k, compro-oro 10k, taxi 30k, bar/ristoranti 330k): **~25-40k cessioni/anno, GMV €2.5-9 miliardi/anno**. SOM realistico Subingresso a 5 anni = **€100-700k ARR** (mediana €300-500k). NON VC fundable, sì angel/exit M&A €1-5M.
- **Top picks da aggredire (in ordine)**: **Tabacchi** (TAM 10x, asset €100-500k = vetrine €99-399 plausibili, zero competitor verticale) → **Stabilimenti balneari** (timing Bolkestein 2027) → **Autoscuole** (clean play, no competitor).
- **Architettura tecnica**: path-based `/posteggi/*` `/tabacchi/*` ecc., NO subdomain (frammenta SEO). Single-table inheritance: `annunci` aggiunge `vertical text` enum + `vertical_fields jsonb` (validazione lato app). Tabella `vertical_pricing(vertical, tier, days, price_cents)` per pricing differenziato. Codice in `js/verticals/<slug>.js` registry con config (wizardSteps, cardFields, filters, brandColor, blogCategory). Costo nuovo verticale = **3-5 giorni dev + 20 articoli SEO**. Account/chat/vetrine/lead-gen restano cross-vertical.
- **Migrazione SEO-safe**: tieni `/annunci`, `/blog`, `/vendi`, `/annuncio` come alias di `/posteggi/*` per 12-18 mesi prima di 301-redirect. Niente perdita autorità.

### Filoni editoriali identificati (da SC, 9 mag 2026)
- **"quanto costa un posteggio al mercato"** — query informazionale top-volume, 0 clic su 4 impressioni → atterra su `quanto-vale-un-posteggio-mercatale` (titolo correlato ma non perfetto). Articolo dedicato `quanto-costa-un-posteggio-al-mercato` con H1 IDENTICO + CTA al valutatore = quick win.
- **"mercati settimanali [città]"** — Modena impressioni raddoppiate (2→4) ma nessuna pagina dedicata. Pattern replicabile su top 10 città mercatali (Modena, Brescia, Bergamo, Milano, Bologna, Torino, Verona, Padova, Firenze, Napoli).
- **"mercati ambulanti [regione]"** — Piemonte CTR 40% confermato. Replicare per Lombardia, Veneto, Emilia-Romagna, Toscana, Lazio. Intent diverso dai bandi-* (informational vs concorso pubblico).
