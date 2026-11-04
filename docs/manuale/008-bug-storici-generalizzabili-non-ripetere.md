
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
