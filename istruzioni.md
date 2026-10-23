# Manuale tecnico — Subingresso.it

Consultazione mirata per argomento, non lettura integrale a ogni sessione.
Le regole comuni di Claude e Codex sono solo in `AGENTS.md`; `CLAUDE.md` le importa.
Decisioni, TODO e registro delle pubblicazioni sono in `Subingresso.it informazioni.md`.
Fonti e ricerche provinciali complete sono in `data/FIERE.md` e negli audit JSON.

## Decisioni correnti e contratti — 23 ottobre 2026

- Registrazione: telefono obbligatorio; termini obbligatori e offerte facoltative,
  due caselle da 18 px preselezionate nell'interfaccia richiesta dall'utente.
  Testo offerte: «Acconsento a ricevere offerte personalizzate». Questo testo
  riguarda soltanto le offerte, non autorizza pixel o misura individuale email.
  Auth28: esempi telefono nascosti a campo vuoto, validazione conservata e invio
  visibile anche su finestre basse. Sorgente: `js/auth.js`; prove nel registro.
- Tema personale: scelta chiaro/scuro in profilo e area organizzatore, chiaro
  iniziale per tutti, preferenza `auth.user_metadata.site_theme`. Avvio senza
  flash; copia locale confermata legata alla stessa sessione, nessun ruolo in
  cache. Errori, logout e cambio identità protetti. Contratto `data/THEME_PREFERENCES.md`.
- UI: sfumature nei passaggi fra bianco e fondi chiari, testi nitidi; dashboard
  con pochi numeri e dettagli apribili. Home: desktop mostra i luoghi che entrano
  in una riga fra 12 candidati; tablet tre; personale prima. I contatori demo
  visibili restano una scelta esplicita dell'utente, non dati reali da riutilizzare
  nelle statistiche o nelle email. Dettagli e prove nel registro.
- Anteprime: WebP persistenti nel bucket `image-previews`, un originale per sei
  dimensioni, riuso dopo deploy e richieste simultanee; originali invariati e
  caricati al clic. Upload conserva il file originale fino a 20 MB. Contratto
  `data/IMAGE_PREVIEWS.md`, codice `api/image.js` e `lib/image-preview-cache.cjs`.
- Luoghi: elaborazione in background senza bloccare l'interfaccia; motore e worker
  con riferimenti coerenti. Non attribuire coordinate tramite refusi o omonimi
  ambigui. Contratto `data/LOCALITA.md`, test `scripts/test-location-background.cjs`.
- Preferiti: stato unico card/dettaglio, cache per utente verificato, rollback
  su errore e risposte tardive ignorate. Nessuna mutazione diretta di `SAVED_IDS`;
  usare gli helper. Contatore venditore solo con almeno due annunci pubblici
  attivi/non scaduti, indipendente dai filtri e senza numeri inventati su errore.
  Test `scripts/test-saved-listings.cjs` e `scripts/test-seller-listing-counts.cjs`.
- Gli esiti di pubblicazione, gli ID e i dossier delle prove stanno nel registro;
  i valori datati nelle sezioni seguenti non attestano lo stato live odierno.

## Qualità dati e profilo admin — 8 ottobre 2026

Audit completo in `DATA_QUALITY_AUDIT_20261008.md`. Applicata `PATCH_DATA_QUALITY_20261008.sql`: nuovi input controllati nei form e sul DB, ruoli/contatori/date protetti, recapiti profili privati, deduplica eventi, avvisi rispettano raggio/regione/tipo. Seed anagrafica `scripts/seed-data-locations.cjs`, 63.182 nomi in schema privato `data_quality`; non ipotizzare coordinate ambigue. Riepilogo admin compatto: quattro indicatori, grafico ad anello dei controlli annunci e barre attività 30 giorni; problemi e automazioni apribili, dettagli utenti e CSV completo. Asset admin-control-room CSS/JS v2. Preferenza utente: poche scritte, grafici utili. Directory utenti paginata senza limite 1.000, conteggi valutazioni completi e campione esplicito. Dati dichiarati/modello disponibili nei log valutatore. Email confermata tecnicamente non dimostra possesso; nessuno stato fittizio da tabella pending inesistente. Telefoni propri via `get_my_profile`, admin via `admin_user_details`; niente SELECT * profiles. Modifica prezzo conserva decimali, bozza usa UUID intero. Auth richiede data.js su tutte le pagine. Cache correnti: data 20, auth 22, annunci 13, vendi-support 2, valuation 2, blog-tracker 2. Test in `scripts/test-data-quality.*`, `test-admin-control-room.cjs` e regressioni vendi/ricerca/acquisizione/vetrina/valutatore. Storico conservato: 93 annunci con località/provincia da verificare, 15 descrizioni brevi, 3 prezzi fuori soglia; anomalie sovrapposte, non sommare. Nessun account/annuncio eliminato.

## Ricerche geografiche admin — 9 ottobre 2026

Entrambi i grafici geografici hanno selettore indipendente 7/30/365/sempre (p_days=0). Patch PATCH_GEO_HISTORY_20261009.sql: archivio permanente geo_stats_daily, soli conteggi per giorno UTC/località, senza sessioni o account; backfill dei dati presenti e trigger AFTER INSERT su page_views e location_search_events. I contatori sopravvivono alla rimozione dei log originali. Non eliminare/troncare questo archivio nei processi di pulizia. Migrazione riapplicabile senza duplicazione. Visite includono path /annunci/slug e storico /comune/slug. Nessuna pulizia dei dati originali introdotta. Verifica live: tutti i conteggi geografici preesistenti recuperati (15 visite al momento della migrazione). Test scripts/test-geo-history.sql transazionale e scripts/test-search-stats.cjs: periodi, permessi, deduplica, persistenza archivio, cambio rapido selettore. Sempre significa tutto lo storico raccolto, non ricostruzione di eventi mai tracciati.

Pannello aggiuntivo Località più cercate, ultimi 30 giorni, sotto Top comuni. Raccolta da questa data in location_search_events tramite track_location_search: solo località validate dall'anagrafica privata, nessun testo libero o dato account, una località per sessione; escluse sole regioni e browser automatizzati. Include ricerche senza risultati. Lettura admin_top_location_searches riservata admin. Patch PATCH_SEARCH_STATS_20261009.sql applicata; test scripts/test-search-stats.cjs e verifica live transazionale di permessi/validazione/deduplica. Annunci JS v14. Non ricostruire lo storico dalle visite.

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
- **Ignore e dipendenze:** rispettare il `.gitignore` effettivo; `package.json` e `package-lock.json` sono versionati. Non ignorarli o rimuoverli seguendo vecchi elenchi.
- **Chiavi API/secret** mai in JS committati. Solo env var Supabase (Dashboard → Edge Functions → Secrets).
- **`SUPABASE_ANON_KEY`** in `supabase-config.js` è in realtà la nuova `sb_publishable_*` (la vecchia anon JWT è disabilitata e revocata). Pubblica per design.
- **`SB_SECRET_KEY`** env var nelle Edge Functions = `sb_secret_*`. Sostituisce la vecchia `SUPABASE_SERVICE_ROLE_KEY` JWT (legacy disabilitata + revocata 4 mag 2026 dopo leak su GitHub commit 24079e60).
- **`SB_PUBLISHABLE_KEY`** env var nelle Edge Functions = `sb_publishable_*`. Usata da `send-auth-email` per costruire link verify (param `apikey`).
- **MAI committare chiavi**: nemmeno PATCH SQL temporanei. Applicare via psql `-v` o file in `/tmp` non versionato.

## Segreti

Regole comuni in `AGENTS.md`, sezione «Segreti e isolamento dei dati».
Non duplicarle qui e non riscrivere la history senza richiesta esplicita.

## Pubblicazione e modifiche

Backup, preservazione del lavoro altrui, commit/push e verifica del deploy:
seguire `AGENTS.md`. Le sezioni tecniche seguenti descrivono i contratti da
conservare, senza autorizzare interventi o invii di propria iniziativa.

## 📍 Inserimento comuni nei form (7 ottobre 2026)

- `js/comune-picker.js?v=7` e `css/comune-picker.css?v=1` condivisi da vendita e modifica: lista visibile con nome, sigla, provincia e regione, selezione tramite tocco/mouse/frecce/Invio. Include i comuni ISTAT e 55.288 frazioni/quartieri/località; non usa il `datalist` nativo del browser.
- Non completa il testo mentre si digita. Nome completo, alias e prefisso univoco di almeno 3 caratteri (es. Moniga → Moniga del Garda) vengono confermati uscendo dal campo o con Avanti. Omonimi richiedono una scelta; accenti/apostrofi/spazi vengono normalizzati. Piccoli refusi propongono suggerimenti da scegliere esplicitamente.
- Una scelta aggiorna provincia/regione e genera `change` per salvare la bozza corretta. Ripristino annunci/bozze conserva la regione degli omonimi; una nuova digitazione elimina quel riferimento. Gli aggiornamenti asincroni non sovrascrivono ciò che si sta scrivendo.
- Fetch con timeout, secondo tentativo automatico e pulsante Riprova senza perdere il testo. Un errore non resta memorizzato nella Promise condivisa. In modifica il form si apre anche se i comuni sono offline.
- Verifiche: `scripts/test-comune-picker.cjs` (Chromium/WebKit, desktop/tocco mobile, accenti, alias, omonimi, tastiera, refusi, rete lenta e retry) e `scripts/test-vendi.cjs` (Avanti con Moniga, omonimi, bozza e recupero in modifica, oltre al wizard completo). Supportano `PLAYWRIGHT_MODULE` per riusare un'installazione locale.
- Frazioni: `data/localita.json` da GeoNames IT e confini ISTAT/geojson-italy, CC BY 4.0; script riproducibile `scripts/build-localita.py`, fonti/limiti in `data/LOCALITA.md`. Provincia/regione ereditate dal comune ufficiale; codici cambiati e fusioni risolti per anagrafica, codici mancanti tramite poligono contenente il punto, mai tramite comune più vicino. Nei dati si salva `Località (Comune)` nel campo `comune`, senza migrazioni DB; bozze e modifica recuperano il nome completo. Test inclusi: Rivoltella nei due comuni, Monterusciello, pubblicazione simulata e retry dell'asset frazioni.


## Ricerca dei luoghi (7 ottobre 2026)

- Caricamento località (9 ottobre 2026): normalizzazione e indici iniziali a blocchi di circa 8 ms con pause del browser, per mantenere attivi clic e digitazione durante la preparazione dei 63.182 luoghi. Dati, alias, coordinate, ordine e gestione errori conservati. Minuscolo Unicode standard equivalente all’italiano, verificato su nomi e alias; orologio controllato ogni 16 record per limitare il costo delle pause. Cache comune-picker 7, location-search 8, worker 3; tutti i riferimenti, inclusi form e import del worker, aggiornati. Regressione sul caricamento iniziale in scripts/test-location-background.cjs (Chromium/WebKit).

- Home e pagina annunci condividono `js/location-search.js?v=8` e `css/location-search.css?v=1`, caricando tutti i 7.894 comuni da `data/comuni-picker.json` e le 55.288 località da `data/localita.json` attraverso il loader di `comune-picker.js`. Gli asset sono serviti dal sito, senza API geografiche esterne durante l'uso.
- Ottimizzazione 8 ottobre: nomi esatti immediati; refusi tramite `js/location-search-worker.js?v=3` (un worker condiviso, solo nomi normalizzati, nessun dato utente o secondo download dei dataset). Attesa di 80 ms per i suggerimenti e cancellazione delle ricerche superate; Invio/Cerca attendono il risultato completo. Escape/blur e nuova digitazione impediscono risultati tardivi. Confronti unici per nomi e prefissi condivisi, matrice limitata alla soglia originale, cache limitate e indice per provincia; tutti gli omonimi vengono ricostruiti dopo il confronto. Se Worker manca o fallisce, stesso algoritmo a blocchi di 5 ms senza perdere risultati. API sincrone mantenute per i lookup esistenti. Il worker importa `location-search.js?v=8`: aggiornare quel riferimento e il cache buster del worker insieme al motore.
- Suggerimenti da 2 lettere, nome/provincia/regione, accenti e apostrofi normalizzati, nomi abbreviati, alias dopo fusioni e refusi fino a 2 errori per nomi lunghi. Invio/Cerca su un luogo riconosciuto avviano la ricerca nei dintorni anche con refusi; gli omonimi digitati vengono risolti nell'elenco usando il contesto regione/provincia degli annunci pubblici corrispondenti, poi l'ordine alfabetico dei suggerimenti a parità. Il centro completo e la sigla sono visibili e si può scegliere un altro omonimo dal menu. Settori, regioni, frasi e prefissi ambigui restano ricerche testuali. Frecce non riscrivono il testo. Timeout, retry e testo preservato.
- La home passa il codice ISTAT (comuni) o `geonames:ID` (località) in `?comune=` per conservare una scelta esplicita o un luogo univoco riconosciuto; per gli omonimi digitati conserva `q` e lascia il contesto all'elenco. Le località usano le proprie coordinate, i comuni quelle di `data/comuni.json`; se mancanti resta la ricerca sul comune esatto. Gli annunci storici con nomi abbreviati univoci e frazioni non qualificate vengono riconosciuti quando non ambigui. `resolveSearch` corregge il centro digitato, mentre i lookup degli annunci non assegnano mai coordinate tramite fuzzy matching. Un comune ufficiale univoco può essere riconosciuto anche con regione storica incoerente, purché non ci sia una provincia/sigla contraddittoria. Nessuna modifica ai record. Anche gli alert salvati usano il luogo scelto. L'indice dei nomi esatti evita di scansionare tutte le località a ogni lookup.
- Annunci storici con frazioni omonime senza provincia (es. Rivoltella): il lookup resta senza coordinate; se corrispondono al luogo cercato e al contesto regione/provincia, restano nel gruppo iniziale dei risultati locali senza mostrare km inventati. La ricerca geografica riconosce anche più città esplicitamente elencate, sigle, preposizioni mancanti e abbreviazioni univoche; usa la distanza minima tra le città riconosciute. Nessuna assegnazione fuzzy di coordinate, nessuna modifica ai record. La ricerca testuale trova anche nomi incerti o errati.
- `js/listing-search.js?v=1`: tutte le parole devono corrispondere, anche in ordine diverso e in campi diversi; normalizzazione di maiuscole, accenti, apostrofi, trattini, spazi, prefissi e refusi (inserimento/eliminazione/sostituzione/scambio; 1 errore da 3 lettere, 2 da 8). Titolo e comune esatti precedono corrispondenze approssimative. Include descrizione principale e descrizione extra JSON/stringa, tipo, settore, categoria, giorni e contesto geografico riconosciuto. Indici in memoria per annuncio; non includono telefono/email o nomi di contatto.
- `js/pages/annunci.js?v=11`: query primaria completa di descrizione, categoria, provincia e scadenza. Risposta DB vuota svuota i risultati, errori mostrano Riprova. Filtri comuni ai rami testuale/geografico, valori numerici mancanti esclusi quando il filtro li richiede, ordinamento prezzo/superficie/data rispettato anche nel raggio. Raggio geografico predefinito **100 km**, ordinamento **Più vicini** dal più vicino al più lontano; Vetrina può prevalere solo a parità di distanza, non scavalca annunci più vicini. Per testo rimane "Più pertinenti"; senza testo mantiene l'ordine di pubblicazione.
- Verifiche: `scripts/test-location-search.cjs` (7.894 comuni, 55.288 località, home/elenco Chromium/WebKit desktop/mobile, Invio con omonimi/refusi, scelta esplicita, raggio, tastiera, rete lenta/retry); `scripts/test-listing-search.cjs`, con `SEARCH_AUDIT_SNAPSHOT` per leggere uno snapshot di annunci pubblici fuori repo, verifica ogni luogo e titolo con una lettera errata in ogni posizione, parole invertite, filtri, multi-città, descrizioni, account e errori. `PLAYWRIGHT_MODULE` permette di riusare il driver Python locale. Nessuna scrittura DB nei test.
- `scripts/test-location-background.cjs`: Chromium/WebKit, parità worker/sincrono e 50.000 confronti contro il calcolo originale, pagina reattiva, Invio durante i refusi, cancellazione e fallback per Worker assente/errore di rete/crash. `GEO_BASELINE_SCRIPT` opzionale confronta tutti i risultati e l'ordine con una copia UTF-8 del motore precedente fuori repo. L'audit prezzi distingue annunci validi e scaduti, che restano visibili in fondo come previsto.

## 🔒 SECURITY: Cache profilo SCOPE per user_id (4 mag 2026)

**Bug storico fixato**: cache `_vc_nome`, `_vc_tel`, `_profile_nome`, `_profile_tel` erano chiavi globali in localStorage. Su device condiviso il prossimo utente vedeva prefilled nome/tel del precedente in `vendi.html` → poteva pubblicare annuncio con telefono altrui.

**Regole correnti:**
- Tutte le cache profilo SCOPE per user_id: helper `_userKey(base, userId)` in `vendi.html` → `_vc_nome_u_<id8>`, ecc.
- `_prefillFromCache(userId)` richiede userId; senza scope NON legge nulla.
- `prefillContactFromSession()` aggiorna i contatti precompilati con il profilo corrente; preserva i campi modificati dall'utente o ripresi dalla bozza del suo account (`dataset.userEdited`). Il cambio account svuota i dati in memoria prima di riprendere la nuova bozza.
- `sessionStorage._last_prefill_user`: rileva cambio user e svuota i campi prima del prefill.
- Bozze v2 in `subingresso_draft_v2_<user_id completo>` (oppure `guest`): si legge solo quella del proprietario corrente. Nome/tel solo nelle bozze degli account autenticati, mai nella bozza ospite. Gli altri account conservano la propria bozza senza mostrarla al nuovo utente.
- `signOut()` in `auth.js` pulisce: chiavi legacy globali, tutte le `_*_u_*` scope-ate, `subingresso_draft_v1`, `_last_prefill_user`. Conserva le bozze v2, riprese solo dopo l'accesso allo stesso account.
- **NON aggiungere mai** chiavi localStorage globali per dati utente. Sempre scope per user_id.

## 🚫 SECURITY: `select('*')` su `annunci` da authenticated è VIETATO

Dal 3 mag 2026 (`PATCH_CONTACT_REVEAL_20260503.sql`) `tel`/`email` sono REVOKE per `authenticated`. `select('*')` restituisce 42501.

**Sempre usare select esplicito** con colonne safe (no `tel`, no `email`):
`id, user_id, titolo, descrizione, stato, categoria, tipo, settore, dettagli_extra, regione, provincia, comune, superficie, giorni, prezzo, contatto, data, status, created_at, img_urls, expires_at, visualizzazioni, featured, featured_until, featured_tier, featured_since, video_url`

Per leggere tel/email del proprio annuncio (es. modifica): RPC `get_listing_contact()` (owner-bypass + admin-bypass + rate limit 50/h non-owner). Anche `profiles` per anon è REVOKE: telefono solo via RPC o per owner.

**Regola colonne (ricorrente)**: ogni colonna NUOVA su `annunci`/`profiles` richiede un `GRANT SELECT (col)` esplicito — su queste tabelle il SELECT è column-level (per il REVOKE su tel/email). Senza, la query torna `42501` silenzioso e la dashboard/pagina mostra 0 o vuoto.

## 🎨 CSS: `<style>` inline DOPO Tailwind sovrascrive le utility

In molti HTML (vendi, valutatore, dashboard) lo `<style>` inline viene caricato **dopo** `css/tailwind.css`. A parità di specificità (`0,1,0`) vince l'ultimo dichiarato → classi custom `.field-input { padding:.75rem 1rem; font-size:.9rem; font-weight:600 }` sovrascrivono `pl-X`/`text-X`/`font-X` di Tailwind.

**Soluzioni** (in ordine di preferenza):
1. `style=""` inline (specificità `1,0,0,0`, batte SEMPRE qualsiasi classe). Best per fix puntuali.
2. Modificare la classe custom direttamente in `<style>`.
3. NON usare `!important`.

**Tailwind precompilato**: solo classi standard (`pl-12`, `pl-16`, `pl-20`...). Mai arbitrary values come `pl-[4.5rem]` (non sono nel CSS compilato → fallback). Per custom: scegliere il più vicino della scala o rebuildare CSS.

**REGOLA EVERGREEN — Audit prima del commit nuovo Tailwind**: prima di shippare un componente con responsive variants, fare audit `awk 'BEGIN{RS="}"} /pattern/' css/tailwind.css | grep -oE '...'` per CONFERMARE che le classi `lg:`/`md:`/`sm:` esistano nel build. Il content scanner di Tailwind v3 lavora solo se il template è scansionato dal config; classi nuove richiedono `npx tailwindcss -i tailwind.input.css -o css/tailwind.css --minify` + bump `?v=N` su tutti i file (21 file usano `tailwind.css?v=`). Bug 9 mag 2026 sera: bento blog list cadeva in `sm:grid-cols-2` su lg+ perché `lg:grid-cols-1` non era compilato → 2 col affiancate invece di 1 stack verticale alla destra del hero. Stessa categoria di mancanze: `lg:text-6xl`, `lg:text-lg`, `md:text-5xl`, `md:text-xl`, `md:p-8`, `hover:shadow-2xl`, `hover:shadow-lg`, `group-hover:scale-[1.02]`, `hover:-translate-y-*`, `line-clamp-3`, `content-start`. Sintomi tipici: layout collassa, hover non risponde, dimensioni font non scalano sui breakpoint.

## Area personale: Vetrine e pagamenti (8 ottobre 2026)

- `dashboard#pagamenti`, `js/vetrina-account.js?v=1`, `css/vetrina-account.css?v=1`: riepilogo, Vetrine per annuncio, grafici 7/30/90 giorni, storico paginato/filtrato, esportazione CSV completa con protezione formule, ricevute e supporto. Modal profilo: iscrizione, email confermata, metodo di accesso, profilo pubblico, reset password e accesso agli acquisti. Nessuna cache persistente; risposte superate e cambio sessione non mostrano dati precedenti.
- `PATCH_ACCOUNT_VETRINE_20261008.sql`: snapshot titolo/id, conferma pagamento, finestre esatte per nuovi acquisti/rinnovi e `payment_history` append-only. Dati degli acquisti pagati congelati, DELETE bloccato e TRUNCATE revocato ai ruoli API; solo proprietario via `dashboard_vetrina_account`. FK originali SET NULL preservano pagamenti dopo eliminazione annuncio/account; metriche private conservate rimuovendo i due FK CASCADE. Un amministratore del database resta tecnicamente in grado di alterare lo schema: non promettere immutabilità assoluta. Le date storiche non ricostruibili restano NULL.
- `payment-receipt`: autentica utente, verifica proprietà ordine e restituisce solo URL ricevuta Stripe, senza cache; nessun dato carta o secret nel browser. Recupera eventuali rimborsi dal Charge alla consultazione. Il webhook gestisce anche `charge.refunded` e `checkout.session.async_payment_succeeded`; per aggiornamento immediato dei rimborsi l'endpoint Stripe deve sottoscrivere `charge.refunded`. Gli eventi duplicati/fuori ordine non diminuiscono il rimborso. Un rimborso aggiorna lo storico economico e non revoca automaticamente i giorni della promozione.
- Statistiche aggregate **per annuncio e periodo**, non attribuite al singolo ordine: i rinnovi condividono la misurazione giornaliera esistente. Transazioni `cs_test_*` marcate TEST, escluse dai totali economici. Checkout senza registrazione ordine non restituisce URL e tenta di scadere la sessione Stripe.
- Verifiche: `scripts/test-vetrina-account.cjs` (Chromium/WebKit, 1440/390/320px, isolamento ricevute, XSS, CSV, pagine, filtri, grafici e retry), `scripts/test-vetrina.cjs`, `scripts/verify-seller-analytics.js`; `scripts/verify-vetrina-account.sql` e `scripts/verify-vetrina.sql` transazionali con ROLLBACK. Nessun addebito/email reale nei test.

## 🖼️ Sistema Profilo Pubblico

- **`profilo.html?id=USER_ID`**: pagina pubblica con avatar, nome, data iscrizione, badge, annunci attivi.
- **Badge profilo**: `getProfileBadges(createdAt, activeListings)` in `data.js`. 5 badge: Nuovo Iscritto (<30gg), In Crescita (1-6m), Affidabile (6-12m), Veterano (>1anno), Top Venditore (5+ annunci).
- **Mini-venditore nelle card**: `buildCard()` usa `USER_NAMES[l.user_id]` (popolato da fetch separato `profiles` con `.in('id', uniqueIds)`) come primario, `l.contatto` fallback. **NON usare join `profiles(...)` nella select annunci** — rompe PostgREST.
- **Avatar upload**: bucket Supabase Storage `avatars` (pubblico). Usare `upsert` non `update` su `profiles.avatar_url`.
- **Anteprime immagini (22 ottobre 2026)**: `api/image.js`/`lib/image-preview-cache.cjs` riusano WebP persistenti nel bucket `image-previews`, anche dopo nuovi deploy. Un download originale prepara sei dimensioni; richieste simultanee nella stessa istanza condividono il lavoro. Scritture solo server con environment cifrato, nessuna modifica a originali/URL frontend/qualità; errori cache senza fallback indiscriminato. Dettagli/test in `data/IMAGE_PREVIEWS.md`, prove/inventario in `Documents/verifica-anteprime-persistenti-20261022/`. Nessun piano a pagamento attivato.
- `js/image-urls.js?v=1` condivide gli URL delle anteprime tra browser e SSR: caricarlo prima di `data.js?v=19`. Dettaglio `annuncio-detail.js?v=22`: originali richiesti solo cliccando le foto, dialog con navigazione/chiusura/tastiera; tutte le foto visibili anche negli annunci gratuiti. SEO continua a riferirsi agli originali.
- Nuovi upload in vendita/modifica conservano il file esatto (max 20 MB), senza compressione distruttiva; `img_urls`/`avatar_url` restano URL originali. File vecchi già compressi in passato conservano la versione disponibile. Non cancellare originali per rigenerare anteprime.
- Verifiche: `scripts/test-image-previews.cjs` (API, orientamento, cache/errori, Chrome desktop e Safari mobile, nessun originale prima del clic) e `scripts/test-vendi.cjs` (upload, retry, conservazione file >5 MB e rimozione anteprime esistenti). Sharp richiede `package.json` e lock versionati.
- **Modal profilo in dashboard**: aperto da `goToProfilo()`. Su mobile bottom sheet (`items-end`, `max-h-[92dvh]`). NON esiste più tab "Profilo".
- **Cache `USER_AVATARS`/`USER_NAMES`** globali in `data.js`. Aggiornano tutte le card se l'utente cambia nome.

### Onboarding widget (dashboard)
- 4 step: email confermata, telefono profilo, avatar, primo annuncio. Si nasconde a 4/4.
- **"Carica foto profilo"**: apre direttamente file picker via `document.getElementById('avatarInput').click()` (non più redirect a tab profilo). Refresh widget + toast dopo upload.
- **Overlay upload avatar**: `#avatarUploadOverlay` fullscreen blur con spinner + 4 messaggi rotanti ogni 1.8s con fade ("Sto preparando…", "Caricamento sicuro…", "Quasi fatto…", "Salvataggio nel tuo profilo…") + banner "Non chiudere la pagina" + `beforeunload` guard. Spinner anche su `#welcomeAvatar`. Cleanup robusto in `finally`.

## 📊 Visualizzazioni Annunci

### Anteprima moderazione admin (7 ottobre 2026)

- Dashboard: titolo e pulsante `Anteprima completa` aprono `/annuncio?id=...&anteprima=moderazione`.
- `api/annuncio.js` invia solo il template per l’anteprima, con `private, no-store` e `noindex, nofollow`. I contenuti vengono letti dal client solo dopo verifica sessione e `profiles.is_admin`, attraverso le RLS esistenti; nessuna chiave privilegiata nel frontend.
- `js/listing-moderation.js` gestisce barra fissa Approva/Rifiuta, motivo del rifiuto, errori e logout. Update solo da `pending`, con controllo del record restituito; conserva i dettagli aggiornati. I trigger email esistenti restano invariati.
- Il dettaglio mostra tutte le foto, eventuale video e note fiera, senza incrementare visualizzazioni né creare JSON-LD durante la revisione. Script dettaglio aggiornato a `v=20` nei due template.
- Verifica: `python scripts/verify-listing-moderation.py` (Chromium e WebKit, dati simulati); `scripts/verify-listing-moderation.sql` controlla accessi e colonne usando fixture temporanee con le policy live, senza moderare annunci reali.

### Statistiche venditore (correzione 17 ottobre 2026)

- Rimossa su richiesta la sezione superiore “Il tuo annuncio”: scheda/carousel, riepilogo complessivo e domanda regionale. Rimossi contenitore, caricamento RPC e funzioni dedicate; restano statistiche per periodo e gestione degli annunci. Pubblicato `4fc8f66`, Vercel riuscito `J86R1MRxW4CE4UZ1Dv883fsjiRhu`; HTML online identico, assenza riquadro/caricamento e presenza statistiche/elenco verificate. Sintassi, suite numeri e browser Chromium 1440/320 + WebKit 390 passati; backup remoto `backup/session-20261017-172903-rimuovi-riquadro-annuncio` verificato.
- Preferenza utente aggiornata: grafico sopra i quattro riquadri, solo etichetta e numero (es. “Click WhatsApp”), nessun sottotitolo ripetitivo o spiegazione visibile. Definizioni/storico nella voce apribile; rimossi sottotitolo del pannello, note Vetrina ripetute e suggerimento generico “Annunci in ordine”. Periodo compatto; calcoli e filtri conservati. Pubblicato `c0eaa91`, Vercel riuscito `9Je1CvpUeYma6xr9CAs4ES3NsMRH`: HTML identico al commit, test numeri e browser locali/online con backend simulato Chromium 1440/320 e WebKit 390 passati; immagini in `Documents/verifica-statistiche-20261017/pulizia`. Backup remoto `backup/session-20261017-172250-statistiche-pulizia-testi` verificato.
- `Performance posteggi`: numeri e grafico soltanto nel periodo 7/30/90 giorni selezionato, stesso filtro annuncio. Quattro card: visualizzazioni (anteprime + aperture), messaggi ricevuti sul sito, clic telefono, clic WhatsApp; chat aperte e nuove aggiunte ai preferiti separati. Nessun totale storico o tasso che sommi clic e messaggi. I clic non confermano telefonate/invii esterni; le risposte del venditore e il supporto non sono messaggi ricevuti dai compratori.
- Patch live `PATCH_SELLER_ANALYTICS_PERIOD_20261017.sql`: RPC privata estesa, giorni e confini UTC restituiti dal DB, messaggi giornalieri da eventi effettivi anche senza visite nello stesso giorno. Totali precedenti mantenuti solo per compatibilità; nessun backfill inventato. Storico visite/clic/preferiti dal 6 ottobre: avviso parziale e punti mancanti nel grafico, non zeri anteriori alla rilevazione. Hero superiore identificata come riepilogo complessivo, eliminato il falso “— 7g” sulle viste.
- Prove: `scripts/verify-seller-analytics.sql` con ROLLBACK, 112 profili, isolamento e aggregati reali per 7/30/90, contatori, fixture temporanee per messaggi a mezzanotte/confini, date future, risposte/supporto e UTC anche con fuso +14. Guardie dati e trigger conservati. `scripts/verify-seller-analytics.js`; browser `scripts/test-seller-analytics.cjs` con Chart.js reale, Chromium 1440/320 e WebKit 390, fusi diversi, zero recente con 900 storiche, cambio annuncio/periodo, richieste fuori ordine, errori/riprova e overflow. Nessun messaggio reale nei test; snapshot funzione precedente e immagini in `Documents/verifica-statistiche-20261017`. Email settimanali ancora da correggere separatamente.
- Pubblicato `831072d`, Vercel riuscito `JCceebVBYho3MyB4vttxai8APFXA`; dashboard online identica al commit. Stesse prove browser sull'HTML pubblicato con backend simulato passate, regressioni Vetrina e area pagamenti su sei formati/browser passate. Backup remoto `backup/session-20261017-165933-statistiche-periodi-contatti` verificato; modifiche concorrenti Forlì-Cesena conservate.

Correzione storica del 6 ottobre:

- Il pannello `Performance posteggi` chiamava `dashboard_seller_analytics`, ma `PATCH_LISTING_ANALYTICS_20260620.sql` non era mai stata applicata in produzione. RPC e `listing_stats_daily` mancavano: ogni account vedeva "Statistiche in attivazione".
- Patch applicata al DB il 6 ottobre 2026, in transazione. Il deploy Vercel non esegue SQL: le nuove patch database vanno applicate e verificate separatamente.
- RPC privata per `authenticated`, filtrata su `auth.uid()`, senza limite di 50 annunci. Totali precedenti conservati; dati giornalieri disponibili solo dall'attivazione. Gli incrementi casuali del vecchio cron Vetrina non alimentano il grafico.
- Controlli: `scripts/verify-seller-analytics.sql` prova tutti i profili con ruolo autenticato, periodi 7/30/90, isolamento, viste/contatti/preferiti e annulla gli eventi di prova con `ROLLBACK`. `node scripts/verify-seller-analytics.js` verifica il pannello e la sintassi degli script inline.
- Se il caricamento fallisce, il pannello offre `Riprova` e nasconde il grafico vuoto. Risposte di richieste precedenti non sovrascrivono il periodo scelto.

- Colonna `visualizzazioni integer DEFAULT 0` in `annunci`. Client attuali: `track_listing_view(listing_id, view_type)` per anteprima/dettaglio; `increment_views` è interna/service_role, accetta solo +1, esclude proprietario/demo/scaduti/non attivi.
- Anteprima card: +1 via `observeCardViews()` in `data.js` — scroll listener con `getBoundingClientRect`. Chiamarla dopo ogni render `buildCard()`.
- **`_supabase.rpc().catch()` NON ESISTE** in Supabase JS v2 — usare `async/await`.
- Visita diretta attuale: +1 con `view_type='detail'`. Il vecchio random 1–2 e il cron Vetrina casuale sono storici; non ripristinarli.
- **`visualizzazioni` NON va nella select principale di `annuncio-detail.js`** — fetcharlo in IIFE asincrona isolata.
- Display: `#viewCount` + `#viewCountVal` nel title block.

## 💬 Chat / Conversazioni (`messaggi.html`)

- Lista mostra **titolo posteggio** (primario) + **nome venditore** (secondario blu).
- Mobile: due pannelli (`convPanel` + `chatPanel`), si alterna visibilità. `backToConversations()` torna alla lista. NON fondere i div.
- **Join profiles in `conversazioni` rompe PostgREST** (stesso bug di annunci). 3 fetch separati: (1) conv+annuncio, (2) profiles `.in('id', userIds)`, (3) lastMessage per conv. Merge manuale.
- **Header chat**: thumb annuncio cliccabile (cover img_urls[0]) + titolo + "Venditore · Prezzo" + chevron, va a `/annuncio?id=`. Lato admin chat supporto: thumb life-ring + nome utente.
- **Avatar reali in lista**: foto profilo dell'interlocutore (controparte). Fallback iniziale su sfondo blue-600. `<img loading="lazy" decoding="async">`, anteprime locali da 96 px; thumb annuncio da 192 px.
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
- **`api/blog.js` SSR (20 ottobre 2026)**: `/blog` usa solo anteprime; `/blog?post=<slug>` richiede il corpo del solo articolo. Testo e presentazione già nel primo HTML, DOMPurify 3.4.17 su jsdom 26.1.0; client attiva le funzioni senza riscaricare il corpo. Presentazione condivisa in `js/blog-markup.js?v=2`, promo fiere v3 compatibile server. Bandi correlati con soli metadati. 404/noindex per post inesistente; 503/no-store per servizio indisponibile; cache ordinaria `s-maxage=180`. Dettagli e prove `data/BLOG_LOADING_UNSUBSCRIBE.md`, `scripts/test-blog-loading.cjs`. **Conservare `blog-template.html` deployato e il rewrite incondizionato `/blog -> /api/blog`**: chiamarlo `blog.html`, escluderlo con `.vercelignore` o usare rewrite condizionale interrompe il percorso server (verifiche del 7 maggio).
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

## Provenienza degli utenti (7 ottobre 2026)

- Pannello admin **Da dove arrivano gli utenti**, periodi 30/90/365 giorni: Blog, Bandi (anche gli articoli regionali), Valutatore, Homepage, Fiere (articoli con slug/categoria dedicati e link `utm_source=fiere`), Altro. Ingressi = prima pagina rilevata nell'intero storico per `(visitor_id, session_id)`, poi filtro del periodo; visitatori distinti globali non ricavati dalla somma delle righe.
- Patch `PATCH_ACQUISITION_20261007.sql`: UTM source/campaign su `page_views`, landing pulita e UTM su `auth_modal_opens`; RPC `admin_acquisition_stats` riservata agli admin. Una sola attribuzione per nuovo account, dalla prima apertura con landing nei 24h prima del signup. Account admin/demo esclusi dalle iscrizioni. Vecchie iscrizioni senza landing restano **non attribuite**; non dedurle dal bottone cliccato.
- `page-view-tracker.js` espone `getAcquisitionContext()` e conserva `_acq_*` già esistenti: path senza query personali (solo slug blog), referrer ridotto all'origine HTTP(S), UTM limitati a codici `[a-z0-9_-]{1,80}`. `auth.js` riusa il contesto. Il valutatore salva la landing originale, anche se la prima pagina era un articolo.
- Aggiunto il tracker alle landing SSR bandi, annunci e città: lo storico precedente di queste pagine è incompleto. La sessione resta quella esistente in sessionStorage; non introdotta una scadenza di 30 minuti. Traffico storico include anche il gestore e visite automatizzate non riconosciute.
- Nel pannello: canali esterni e generatore di link per fiere/QR. Il vecchio funnel si chiama **Dove viene aperta la registrazione** per distinguerlo dall'acquisizione. I suoi conteggi storici per apertura non sono iscritti unici globali.
- Cache allineate: `auth.js?v=21`, `page-view-tracker.js?v=4`, `js/pages/valutatore.js?v=3`, incluse pagine SSR. `vendi.html` aggiornato solo nei riferimenti cache.
- Verifica: `node scripts/verify-acquisition.cjs`, `scripts/verify-acquisition.sql` (ROLLBACK), prova browser desktop/mobile. Il lavoro non implementa il consenso né risolve gli altri punti aperti dell'audit privacy.

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

**`_reg_src`** (`popup_vetrina`/`blog_promo`/`popup`) ora serve SOLO a decidere se mostrare il popup di benvenuto post-registrazione. La lotteria collegata è stata rimossa il 23 mag 2026.

**Pannello admin** in `dashboard.html` SOPRA "Valutatore Logs": `loadAdminSignupSources()` carica via RPC, mostra top 5 sorgenti per opens (con icona, label, opens, signups, CR% colorato verde/blu/grigio in base a soglia). Bottone "Mostra altre N" toggle inline. Selettore periodo 30g/90g/1y. `_amoState` global state.

**Compliance GDPR:**
- Pseudonimo by-design (no IP, no UA, no fingerprint)
- Privacy.html aggiornata: voce in sez. 5 (cookie/storage di prima parte) + sez. 6 (retention)
- Base giuridica: legittimo interesse (art. 6.1.f GDPR)
- **Nota privacy aggiornata 7 ottobre 2026:** l'esenzione dal consenso non è automatica per analytics di prima parte; verificare identificativi persistenti, collegamento ad account e condizioni Garante. Vedi `PRIVACY_DATA_AUDIT_20261007.md`.

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

`_scheduleVisitorPopup` (auth.js) controlla 3 condizioni prima di mostrare il popup "Vendi il tuo posteggio?" (copy aggiornata 23 mag 2026: niente più lotteria, CTA "Registrati gratis", icona 🏪):

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

- Fonte del listino: `js/vetrina-pricing.js` e controllo server. 10/30/90 giorni
  a 49/99/249 euro; pacchetti di 2 annunci −10%, 3–4 −15%, 5–10 −20%, stessa
  durata e pagamento unico. Nessuno sconto pubblicazione, omaggio o lotteria UI.
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

## 🧙 Form `vendi.html` — Wizard 6 Step (aggiornato 7 ottobre 2026)

- 6 step: vendita/affitto, posizione, dettagli, prezzo, foto/contenuto/contatti, riepilogo e pubblicazione gratis/Vetrina. `fTipo`, `fMerce`, `fGiorni` sono hidden aggiornati via JS. `stato` radio hidden via `selectStato()`.
- Step6 corrente22ottobre: pubblicazione gratuita preselezionata e Vetrina Premium49/99/249€ per10/30/90giorni, senza sconto di pubblicazione. Benefici e limiti visibili; da pending la durata parte dall’approvazione. I pacchetti multi annuncio si scelgono dalla dashboard, con totale e risparmio esatti prima di Stripe.
- Step 1 auto-avanza al click. `js/pages/vendi-support.js` genera centinaia di varianti di titolo da dati reali (vendita/affitto, mercato/fiera, comune, nome fiera, giorni, settore, superficie), senza qualità inventate. Selezione casuale con memoria degli ultimi 20 suggerimenti nella sessione. Titolo stabile tornando indietro; aggiorna un titolo automatico quando cambiano i dettagli, preserva quello scritto dall'utente. Pulsante per cambiare suggerimento; conferma prima di sostituire un titolo manuale.
- Prezzo: 101-400.000€, **input via `style=""` inline**. `VendiSupport.parseNumber()` legge importi italiani e decimali senza troncamenti o perdita dei centesimi; rifiuta testo, esponenti e valori non finiti. Superficie decimale con esempio larghezza × profondità. Errori sul campo interessato e controllo di tutti i passi prima dell'INSERT.
- Foto: **facoltative**, fino a **5 per tutti, anche gratis**, anche in `modifica-annuncio.html`. Nel wizard inizialmente un solo slot con invito rosso sulle visite; dopo la prima foto, copertina grande e tre slot piccoli per altre foto, chiaramente facoltativi. Nessun avviso intermedio su Avanti, anche senza foto. Selezione multipla, copertina modificabile e rimozione visibile da telefono. Accetta JPG/PNG/WebP/AVIF fino a 20 MB; conserva gli originali e serve anteprime WebP separate.
- Bozze: salvataggio dei dati a ogni input/cambio/azione, già dal primo passo; recupero automatico del passo e dei dati all'apertura. Foto/File in IndexedDB `subingresso_listing_drafts`, store `photos`, stessa chiave del proprietario; scritture serializzate. Salvataggio e recupero silenziosi, solo link Ricomincia al recupero; messaggio visibile in caso di errore, avviso all'uscita solo se il salvataggio è fallito/in corso. Migrazione della vecchia v1 solo al proprietario; passaggio ospite→account conserva il lavoro. Ricominciare richiede conferma; pubblicazione riuscita elimina solo la bozza corrente. Recupero nello stesso browser e dispositivo, non sincronizzato via server.
- Rimosso il blocco introduttivo SEO fisso sopra il wizard: ogni passo usa il proprio titolo H1; title e meta description conservati.
- Fiere: nome facoltativo e unico input libero per periodo/durata (es. ogni ottobre, 5 giorni). Descrizione assistita solo da fatti inseriti: usa `fNoteFiera`, mai i giorni del mercato. Non dichiara permessi regolari, buona posizione o clientela fissa. In INSERT `giorni` per fiere viene dal periodo/nome, senza giorni settimanali residui; dettagli extra fiera solo per il tipo Fiera.
- Step 6: riepilogo con pulsanti Modifica prima della scelta di pubblicazione. La pubblicazione gratuita resta preselezionata.
- **Preview card live nello step 5** (6 mag 2026): `#previewCard` sopra il bottone Pubblica, max-w 300px centrata, `pointer-events:none`. Funzione `_renderPreview()` costruisce un fakeListing (id `__preview__`, user_id `null` → cade su iniziale di `contatto`, status `active`, no featured/expires) e chiama `buildCard()` da data.js. Trigger: ingresso step 5 (subito + dopo `prefillContactFromSession`), `oninput` su `fTitolo`+`fNome`, dopo `_handleFiles` push, dopo `removeFile`. Foto via `URL.createObjectURL(_files[0])` salvato in `_previewObjectURL` globale e revocato prima di crearne uno nuovo (anti memory-leak). `getOptimizedImageUrl` cade nel try/catch su URL `blob:` e ritorna l'object URL invariato → preview funziona.
- Anti-spam: 1 minuto. Timestamp PRIMA dell'insert, rimosso su errore.
- **Telefono OBBLIGATORIO** (commit `3b5ac17`): `required` HTML5, asterisco rosso, banner `#missingPhoneBanner` se prefill non trova telefono nel profilo, bordo giallo, focus automatico, messaggio errore esplicito.
- **Cache name/tel scope per user_id** (vedi sezione SECURITY).
- **JWT auto-refresh**: `_isSessionExpired` + `_refreshSessionIfNeeded`. Se INSERT fallisce con JWT/auth/RLS, refresh + retry una volta.
- **Fallback sessione `_getSessionForSubmit`**: prova getSession, poi setSession da localStorage, poi sessione stored.
- **Login timeout 12s** in `auth.js` `handleLogin` (Promise.race).
- **Errore submit dettagliato**: `Errore [code]: <message Supabase reale>` (max 160 char).
- **Direct fetch INSERT** (`_directInsertAnnuncio`): bypass supabase-js che hangava 45s.
- **Upload foto via fetch diretto** Storage con timeout 25s, progress "1/N". Se una foto fallisce, niente INSERT parziale: annuncio ancora in bozza. Retry riutilizza le foto già caricate nella stessa pagina (WeakMap per File e proprietario).
- **Cache localStorage `_profile_nome_u_<id>`/`_profile_tel_u_<id>`** (scope) per prefill istantaneo.
- **Smart name**: evita duplicazione "Ardit Kycyku Kycyku" (cognome già in nome).
- **Bug noti vendi.html**:
  - Anti-spam NaN: `parseInt(localStorage.getItem(lastPostKey)) || 0` (string coercion bug).
  - Rimozione foto: `WeakMap` `_fileMap` mappa div→File. Anche la modifica annuncio usa ora WeakMap per evitare errori con l'ordine asincrono dei FileReader.
- **Verifica form**: `scripts/test-vendi.cjs` controlla sintassi e flussi browser con backend simulato, senza creare annunci reali. Richiede Playwright; `PLAYWRIGHT_MODULE` e `PLAYWRIGHT_CHROMIUM_EXECUTABLE` permettono di riusare un'installazione locale. Copre mercato/fiera, mobile, titoli, bozze/foto/contatti, isolamento account, migrazione v1, errori memoria/upload e retry, pubblicazione/reset e più foto in modifica.

## 💶 Prezzi Affitto — Annuali

- DB salva **prezzo annuale** per affitti.
- Display: solo annuale ovunque. Card `€ X /anno`. Pagina annuncio `€ X` + `/anno` inline + sottotitolo `/anno · trattabile`.
- Badge card: "Affitto" (non "Affitto mensile").
- `formatPrice()` in `data.js`: affitto → `€ X /anno`, vendita → `€ X`.
- **`#prezzoMobile`** in `annuncio.html`: elemento `lg:hidden` sotto il titolo, aggiornato da `annuncio-detail.js`.

## Esito degli annunci — 24 ottobre 2026

«Venduto o affittato?» richiede il mini modulo: esito, importo facoltativo,
canale. Nessuna delle due lascia l'annuncio disponibile. Prezzi e canali
restano privati, dichiarati e non certificati; canoni annui distinti dai
prezzi totali. Controlli client/server e filtro degli importi anomali,
proprietà verificata e chiusura atomica/idempotente tramite RPC obbligatoria.
Lo stato tecnico `sold` indica concluso; il nuovo esito distingue venduto e
affittato. Nessun esito ricostruito per lo storico. Contratto e soglie:
`data/LISTING_OUTCOMES.md`; migrazione `PATCH_LISTING_OUTCOMES_20261024.sql`.

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

**17 ottobre 2026, regola corrente:** avvisi solo con account del sito. Blog e landing bando usano `js/bando-alerts.js?v=2`: il pulsante apre il modulo standard in `auth.js`, poi attiva la regione dopo registrazione/accesso; chi è già autenticato attiva direttamente. Chiusura del modulo annulla la richiesta, errori avvisi separati dal successo account. Il modulo avvisi scorre sugli schermi bassi. Endpoint `subscribe-bando-alert` verifica il token con `auth.getUser` e usa soltanto l'email dell'account. `PATCH_BANDO_ACCOUNT_REQUIRED_20261017.sql` revoca INSERT pubblici e crea la vista `registered_bando_alerts`, leggibile solo da service_role: invii bandi/annunci e Scout escludono email senza account esistente. Nessuna creazione automatica di account o eliminazione di iscrizioni pregresse. Verifica live iniziale: 32 righe, 12 con account, 20 sospese dagli invii. Quattro funzioni ripubblicate; test `scripts/test-bando-account.cjs` con backend simulato su Chromium 1440/320 e WebKit 390, più regressioni qualità dati e acquisizione passati.

Il servizio resta un bundle di bandi pubblici e nuovi annunci privati della stessa regione, con cancellazione in un click. I dettagli del 6 maggio sotto sono storici dove superati dal requisito account.

Pubblicazione verificata `effb12b` + `35da1fd`, Vercel riuscito `Fs4xUe5bYZu4E8fMvwXYg17TCKd9`; JS online identico. Sei percorsi su blog Lombardia/landing Calabria con Chromium 1440/320×568 e WebKit390: registrazione standard e attivazione autenticata simulate, chiusura senza iscrizione, nessun errore pagina o overflow dei moduli. Test locali includono accesso, duplicati, errori/retry e protezione email altrui. Prove `Documents/verifica-avvisi-bandi-20261017.{cjs,json}`; nessuna email/account reale di prova. Live endpoint anonimo e chiave pubblica rifiutati 401; vista destinatari privata, INSERT pubblici revocati; ancora 32 righe e 12 destinatari idonei. Il primo controllo globale a 320 rilevava stringhe lunghe preesistenti nell'articolo: escluso dal perimetro, verifica finale circoscritta a form/modal.

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

- **Selezione contestuale,18/10/2026:** `blog_listing_ads(p_slug,p_limit=3)` sostituisce nel solo blog il pool24 + `_featuredFirst`; patch `PATCH_BLOG_LISTING_ADS_20261018.sql` applicata prima del template. Titolo/slug pubblicati → regioni/zone/città riconoscibili; Vetrine locali prima, poi gratuiti locali; generici nazionali. Fra pari pertinenza geografica/tema e sorteggio nuovo; tutti gli annunci idonei partecipano. Pubblici massimo3 e soli campi sicuri, helper/indice anagrafica privati. Esclusi scaduti/non-active/demo, niente cache della scelta e niente timer durante la lettura; cache browser ripristinata rilegge. Anteprime compatte e tracciamenti conservati, regione click anche nelle guide; risposte tardive protette. Test SQL60 Vetrine/800 estrazioni e browser32 casi passati;90 articoli/48 regionali controllati. Zero Vetrine attive reali al controllo. Dettagli/limiti `data/BLOG_ADS.md`, prove `Documents/blog-ads-20261018`; pubblicato63ec124, Vercel riuscito Ar3Ndb2RKVstVZ9zcRkJtTXbW8NU; template/SQL verificati identici, dodici casi online con annunci reali passati Chromium1440/320 e WebKit390 su fiere Lombardia, prezzi, Garda e bandi Lombardia (scritture intercettate). Correlati annunci/fiere/Stripe non modificati.

- `_insertBlogPromo(html)` in `blog-template.html`: dopo il 3° paragrafo, avvisi con account sui bandi; anteprime annunci sugli altri articoli. Consultabili anche da autenticati; con meno di tre paragrafi richiamo in coda.
- 17 ottobre 2026: `_blogListingPreview` sostituisce `buildCard` solo nei richiami blog. Foto 56×56, titolo su massimo due righe, località, vendita/affitto e prezzo; tre colonne da 768 px, tre righe da 82 px sotto. Titolo sezione piccolo, senza introduzione promozionale né spazi superiori eccessivi. CSS confinato a `.blog-listings`; nessuna variazione alle schede nella ricerca annunci. Profilo venditore non caricato nel richiamo.
- Priorità Vetrina con indicazione, foto a rotazione, filtro regione, link dettaglio/“Vedi tutti”, `data-listing-id` per impression e `box_listing_click` conservati. Test dedicati su articoli Umbria e bandi Lombardia, Chromium 1440/768/390/320×568 e WebKit390: riquadro 140 px su computer/tablet, 320–338 telefono; testo seguente visibile a 320×568, link/prezzi/foto/fallback/escaping/tracciamenti corretti. Prove fuori repo `Documents/verifica-blog-promo-compatta-20261017.cjs` e cartella omonima; annunci simulati, nessuna scrittura reale. Il primo test click era bloccato correttamente da `navigator.webdriver`: adattata solo la fixture. Backup remoto pre-modifica valido; noto errore cleanup tag.
- Pubblicato `f0e8572`, Vercel riuscito `AWztUNie2PFThoB37ngoXvtND1cF`; template online identico. Tutti i dieci casi ripetuti sull'HTML pubblicato passati; ulteriori controlli con annunci reali a 1440/390 confermano tre anteprime, 140/320 px e testo seguente visibile. Screenshot e risultati `live.json`/`live-real.json` nella cartella prove. Schede complete della ricerca annunci conservate.

## 🏠 Home Page Sezioni

- Ripristino21/10: restyling esteso rifiutato, grafica9ffd1c1 e vecchio slogan
  senza sottotitolo aggiuntivo. Preferire semplicità, niente copy decorativo.
  UI14/design-system2: solo feedback pulsanti e barra smartphone74/72px con menu.
- Ordine originale: Hero/ricerca/contatori → Ultimi Annunci (12 card) → banner mobile calcolatore → fiere → 3 passi → città → FAQ.
- `loadRecentListings()` `.limit(12)`, `created_at DESC`, fallback `LISTINGS.slice(0,12)`.
- Ripristinati banner e sezioni originali; dettagli/storico in `data/STORICO_GRAFICA_20261021.md`.

## Valutatore v2.6 (22 ottobre 2026)

- Richiesta esplicita: caso non alimentare 15.000 annui/50 giornate, residenti, linea, passaggio regolare, sole parziale, scadenza ignota resta 13.548. Variando una sola risposta: principale 16.425 (almeno +2.500 sui precedenti 13.925), laterale 10.000, angolo 15.000, riparato 14.000, sole davanti 12.000. Gli altri esempi approvati restano identici.
- Calibrazione proporzionale sulla parte sopra 1.000: riferimento G=(commercialRevenueBase(300,50,false)-1000)*0,85*0,98=12.548,3974358974. Principale 15.425/G (+22,9241%), laterale 9.000/G (-28,2777%), angolo 14.000/G (+11,5680%). Sole riparato 13.000*0,98/G (+1,5269%); frontale non alimentare 11.000*0,98/G (-14,0926%), alimentare mantiene il rapporto precedente 0,98/0,95 (-11,3798%). Sole parziale e non noto invariati; nessun premio per esposizione non nota.
- Pesi moltiplicativi a ogni incasso; in v2.6 rimosso il vecchio limite cumulativo 0,7-1,3, che annullerebbe parte del premio angolo con passaggio principale. Curva base, turismo, margini, durata e minimi v2.5 conservati; i vincoli di durata continuano a prevalere sui premi. Non reintrodurre importi aggiuntivi fissi o modificare report storici.
- `PATCH_VALUTATORE_V26.sql` aggiunge `save_valutazione_v26`; claim include 2.0-2.6 e contatore admin indica 2.6. Calcolatore, report e dashboard condividono valuation8; pagina valutatore9. Versioni 2.0-2.5 mantengono calcolo e report originali.
- Verifiche: 41.472 scenari JS e continuita delle curve; 11.520 risultati storici completi identici alla v2.5 precedente; 6.336 confronti JS/SQL, input/permessi/RLS/claim/idempotenza in 16 transazioni ROLLBACK. Generatore `scripts/test-valutatore-db.cjs`: manifest e blocchi da 400 in VAL_DB_QA_DIR o TEMP, per rispettare limite API. Prove `Documents/verifica-valutatore-v26-20261022/`; script browser locale/online in TEMP/subingresso-valutatore-v26-browser.cjs. Pubblicato e218570, Vercel 5dtUg9JMerbXogWsY29ozfasqoJq riuscito: cinque asset identici ai byte Git. Browser locale Chromium/WebKit 390/1280 e online Chromium/WebKit390 passati: riferimenti, salvataggio/riprova, report storici/nuovo e nessun overflow. Backend browser simulato per non creare dati reali; endpoint reale 400/22023 prima del salvataggio. Patch applicata, vecchie RPC identiche; claim/contatore/permessi e ulteriore ROLLBACK idempotente di 400 casi verificati.

### Storico v2.5 (14 ottobre 2026; pesi passaggio/angolo/sole superati dalla v2.6)

- Ultima decisione esplicita utente, prevale sulle eccezioni v2.4: **sotto € 100/giorno cessione sempre € 1.000**, anche fascia min/max; **affitto sempre almeno € 500/anno**. Valgono anche con margine dichiarato nullo o concessione breve; assegnazioni temporanee restano non stimabili. Sono soglie commerciali, non redditività dimostrata: chiarito nel calcolatore/report.
- Ancore non alimentare, condizioni neutre, 52 giornate: 100/giorno → 1.000; 200 → 8.000; 400 → 27.000. Tra 100 e 400: parabola `1000 + (185/3) × (incasso−100) + (incasso−100)²/12`, pendenza crescente. Tra 400 e 1100: raccordo cubico crescente a 50.336, con pendenza finale 52×0,53 (non alimentare) o 52×0,25 (alimentare); poi precedenti quote 53%/71% o 25%/65%.
- Giorni effettivi: si scala solo la componente sopra € 1.000 rispetto a 52. Margine dichiarato adegua la base al rapporto con il 20%, massimo 1,5 volte; fattori di settore/posizione/sole si applicano alla parte sopra € 1.000. Margine/durata possono ridurla fino al minimo, mai sotto. Sotto 100/giorno tutti i fattori sono neutralizzati dalla soglia fissa.
- Affitto conserva il sostegno v2.4 sotto € 3.000/anno, poi applica **sempre** il minimo € 500. Riferimento 320/giorno ×52 → € 2.297/anno conservato. Non ripristinare limiti che abbassano i minimi commerciali senza nuova istruzione dell’utente.
- `PATCH_VALUTATORE_V25.sql` / RPC `save_valutazione_v25`, claim fino a 2.5 e contatore admin 2.5; salvataggi e report 2.0–2.4 conservati. Cache valuation 7, pagina valutatore 8; metodologia e report allineati.
- Verifiche: 41.472 scenari JS e crescita continua alle soglie; 3.744 confronti JS/SQL di vendita/affitto con ROLLBACK, claim/RLS/idempotenza; 1.440 confronti storici invariati. Browser Chromium/WebKit a 390/1280 px: minimi, ancore 100/200/400, salvataggio/retry, report vecchi/nuovi e nessun overflow. Patch applicata e RPC/contatore/permessi verificati live. Backup remoto `backup/session-20261014-122949-valutatore-v25` e branch `backup/pre-valutatore-v25-20261014`.

### Storico v2.4 (14 ottobre 2026; minimi condizionati e sostegno cessione superati dalla v2.5)

- Preferenza utente: piccoli incentivi commerciali alle stime basse per favorire cessione/affitto sul sito; soglie indicative € 1.000 per cessione e € 500/anno per affitto. Riferimento affitto: **320/giorno × 52 giornate → circa € 2.300/anno**. Non sono dati di vendite concluse.
- Cessione: sul valore positivo dopo sole/fattori, sostegno `1000 × (1 − valore/5000)²` solo sotto € 5.000; curva crescente e raccordo continuo, minimo della fascia almeno € 1.000 se la durata lo consente. Margine dichiarato nullo resta zero; limite di durata prevale. Stime di cessione ordinarie ≥ € 5.000 conservate.
- Affitto: base precedente = min(18% valore prima del sostegno cessione, 30% margine annuo). Solo sotto € 3.000/anno: fino a € 1.000 di base, `500 + 1,8 × base`; da € 1.000 a € 3.000, `2300 + 0,35 × (base − 1000)`. Curve continue/crescenti. Limiti: 70% margine annuo e 18% cap di durata; margine insufficiente o durata breve possono produrre meno di € 500. Con 52 giornate, condizioni neutre e spese ignote: 320/giorno → **€ 2.297/anno**; 500/giorno → € 2.496; 1.000/giorno → € 3.120.
- `PATCH_VALUTATORE_V24.sql` / RPC `save_valutazione_v24`: calcolo server uguale al client, claim fino a 2.4, contatore admin 2.4; RPC/report 2.0–2.3 conservati. Cache valuation 6 e pagina valutatore 7. Metodologia pubblica e report allineati. Grafici consegnati fuori repo nella v2.3 restano snapshot di quella versione.
- Verificato: 34.560 scenari JS e crescita alle soglie; 3.744 confronti JS/SQL di cessione/canone con ROLLBACK, claim/RLS/idempotenza; 1.152 confronti con le versioni storiche invariati. Browser Chromium/WebKit a 390 e 1280 px: importi, salvataggio/retry, report vecchi/nuovi e assenza di overflow. Patch applicata e RPC/contatore/permessi verificati live. Backup remoto `backup/session-20261014-115145-valutatore-minimo-1000` e branch `backup/pre-valutatore-minimo1000-20261014`.

### Storico v2.3 (14 ottobre 2026; sotto le soglie commerciali superato dalla v2.4)

- **Ulteriore indicazione utente:** non alimentare € 2.000/giorno ordinario circa € 70–80 mila; € 4.000/giorno al sole almeno € 140 mila. Gli altri dieci casi v2.2 approvati. A 52 giornate i due casi ora valgono **€ 75.140** e **€ 141.531**; incassi ≤€ 1.100 e tutta la curva alimentare conservati.
- Solo non alimentare v2.3: quote di base per giornata **88% / 53% / 71%** sui tratti ≤1100, 1100–2000, >2000. Alimentare resta 88%/25%/65%, poi +30% sulla sua base e premio fino a +15%. Le due curve ora hanno ipotesi differenti: il +30% alimentare non descrive il divario finale fra i settori a tutti gli incassi. Curve crescenti/continue; margini, giornate, concessione e altri fattori v2.2 conservati.
- `PATCH_VALUTATORE_V23.sql` / RPC `save_valutazione_v23`, claim fino a 2.3, contatore admin 2.3, ricarica schema PostgREST; RPC e report storici 2.0–2.2 conservati. Cache valuation 5, pagina valutatore 6. Verifiche: 34.560 scenari JS, 1.728 confronti JS/SQL con ROLLBACK, salvataggio/claim/RLS e compatibilità; browser temporaneo `%TEMP%/subingresso-valutatore-v23-browser.cjs`.
- Grafici consegnabili fuori repo: `C:\Users\utente\Desktop\Ardit\Subingresso - curve valutatore\curve-interattive.html` (7 grafici autonomi, selettori settore/incasso, fascia indicativa, 10 esempi) e `curve-valore.png` (6 pannelli). Dati generati da `js/valuation.js`, non formule duplicate. Sorgenti di generazione `%TEMP%/subingresso-curve-data.cjs`, `subingresso-curve-build.py`, verifiche `subingresso-curve-preview.cjs`; Plotly temporaneo in `%TEMP%/subingresso-curve-libs`. Verificati controlli/dati, desktop/mobile e assenza di richieste esterne. Nella curva concessione le tratteggiate sono scenari stabili, non un rinnovo garantito al mese 36.

### Storico v2.2 (14 ottobre 2026; sola curva non alimentare oltre € 1.100 superata dalla v2.3)

- **Ritaratura richiesta dall’utente:** a 52 giornate, non alimentare € 450/giorno laterale circa € 20 mila; € 1.100/giorno almeno € 50 mila; € 4.000/giorno al sole almeno € 120 mila. Incassi dichiarati già riflettono posizione/esposizione: evitare grandi penalità aggiuntive. Interpretati gli «al mese» dei casi 3/6 come riferimenti agli incassi giornalieri della tabella; domanda di chiarimento facoltativa, assunzione comunicata.
- Base continua per giornata: `0,88 × min(incasso,1100) + 0,25 × min(max(incasso−1100,0),900) + 0,65 × max(incasso−2000,0)`; moltiplicata per giornate effettive. Crescente a tutte le soglie. Margine indicato: base × (margine/incassi)/0,20, massimo 1,5 × base; zero resta zero. Premio alimentare +30%; ulteriore premio graduale da € 2.000/giorno, massimo +15% a € 4.000. Sole alimentare −2% frontale/−1% parziale; non alimentare −5%/−2%. Passaggio alto +3%, laterale −5%, angolo +2%. Altri limiti per concessione/incertezza e canone conservati. Coefficienti commerciali, non statistiche di transazioni.
- Riferimenti verificati, 52 giornate, spese non indicate e concessione stabile: non alimentare 450 laterale **€ 19.562**, 1100 angolo/sole parziale **€ 50.316**, 4000 sole davanti **€ 123.154**. Alimentare ordinario 2000 **€ 80.647**; 3500 angolo/passaggio alto **€ 171.294**, 4000 angolo/sole davanti **€ 193.728**.
- `PATCH_VALUTATORE_V22.sql` aggiunge `save_valutazione_v22`; conserva RPC 2.0/2.1, report e coefficienti storici. Claim accetta 2.0/2.1/2.2; contatore admin corrente 2.2. Cache valuation 4, pagina valutatore 5, riferimenti valutatore/report/dashboard allineati. Test: 34.560 scenari JS e 1.728 confronti JS/SQL con **ROLLBACK**, input annui arrotondati ai centesimi per evitare errori floating point nei dati di test; claim, permessi/RLS, idempotenza e compatibilità precedenti. Browser in `%TEMP%/subingresso-valutatore-v22-browser.cjs`.

### Storico v2.1 (14 ottobre 2026; curva e pesi superati dalla v2.2)

- **Nuova decisione dell’utente:** riconoscere il maggior valore dell’alimentare (+30% di base sul non alimentare) e degli incassi elevati; riferimento circa € 70–80 mila per € 2.000 a giornata in un posteggio settimanale ordinario. Sono ipotesi commerciali del modello, non prezzi di compravendite documentate.
- V2.1: base economica v2 invariata, ×1,30 per alimentare; ulteriore premio continuo `1 + min(0,30; max(0; (incasso medio giornaliero − 1000) / 1000 × 0,15))`. Usa incasso annuo/giornate anche con input annuo. Con 50 giornate, concessione stabile, caratteristiche neutre e spese non indicate: € 2.000/giorno → **€ 74.750**, € 3.000/giorno → **€ 126.750**; a 52 giornate il primo vale € 77.740. Margine dichiarato nullo resta zero; spese elevate e durata breve continuano a limitare il valore. Nessun minimo forzato per attività stagionali o concessioni brevi.
- `PATCH_VALUTATORE_V21.sql` introduce la RPC `save_valutazione_v21` con gli stessi controlli della v2, salva versione 2.1 e moltiplicatori e ammette il claim anonimo sia 2.0 sia 2.1. Conserva la RPC 2.0 per le pagine già aperte; applicare dopo `PATCH_VALUTATORE_V2.sql`. Allinea il contatore admin alla versione 2.1. Nessun report storico modificato. `estimate(input, versione)` e il report mantengono spiegazioni e fattori propri della versione salvata.
- Cache: `js/valuation.js?v=3` in valutatore/report/dashboard, `js/pages/valutatore.js?v=4`. Metodologia pubblica aggiornata. Regressioni: 34.560 scenari JS e 1.296 confronti JS/SQL in transazione **ROLLBACK**, inclusi soglie, input annuo/giornaliero, margini, concessioni, claim, permessi/RLS e compatibilità della vecchia RPC. Browser v2.1: `%TEMP%/subingresso-valutatore-v21-browser.cjs`.

### Storico v2.0 (7 ottobre 2026; coefficienti alimentari superati dalla v2.1)

- `valutatore.html` raccoglie 8 schermate; `js/pages/valutatore.js?v=1` gestisce il flusso; `js/valuation.js?v=1` è il modello condiviso con `report.html` e i test. JS vanilla, CSS locale: nessun rebuild Tailwind necessario.
- **Priorità richiesta dall’utente: stime oneste. Rimosso il premio commerciale +18%** e i moltiplicatori eccessivi del v1. Non ripristinare gonfiature per incentivare gli annunci.
- Incassi del **singolo posteggio**, per giornata o per anno, e giornate effettive (1–366; max 53 per settimanale). Si conta anche la bassa stagione; nessun altro moltiplicatore per frequenza o stagionalità. Settore e anzianità non danno premi automatici.
- Domande: zona (mare/lago, altra turistica, interna), chi compra (residenti/mista/turisti/non so), passaggio (principale/regolare/laterale/non so), uno/due lati di vendita, sole (riparato/frontale/variabile/non so), concessione (3+ anni verificati, breve con mesi 1–35, ignota, temporanea).
- **Ipotesi del modello, non statistiche di compravendite**: base = 50% incasso annuo, oppure min(2,5 × margine annuo dichiarato, 90% incasso annuo). Margine dopo merce/trasporto/canone/personale/altre spese, prima tasse personali e compenso del titolare. Opzionale; 0 non equivale a dato mancante.
- Correzioni: clientela mista in zona turistica +5%; passaggio principale +10%, laterale −15%; due lati +5%; scadenza ignota −15%. Turismo da solo neutro. Sole davanti che copre la merce **−10%**, parte della giornata −5%; applicato dopo il limite di durata, quindi resta coerente anche nelle concessioni brevi.
- Concessione breve: cap = margine annuo × (1 − 1,15^(−mesi/12)) / 0,15. Senza margine si ipotizza il 20% degli incassi. Nessun valore terminale/rinnovo automatico. Assegnazione temporanea: niente prezzo né log, verifica prima al SUAP.
- Fascia ±25% con margine dichiarato, ±35% senza, +5 punti per ogni risposta ignota (clientela/passaggio/sole), +5 per turismo prevalente, +10 per scadenza ignota; max ±55%. Il limite di durata vincola anche l’estremo superiore.
- Canone annuo = min(18% valore, 30% margine annuo). Mensile = equivalente su 12 mesi, anche se stagionale; rapporto canone/valore lordo, nessuna promessa di rendimento. Importi interi identici su schermo, log e report.
- **Non esiste una banca dati di vendite concluse per calibrare i coefficienti.** I test verificano aritmetica, coerenza e sicurezza, non accuratezza commerciale. Per calibrare occorrono prezzi realmente pagati + incassi/spese/giornate dello stesso posteggio. Merce, attrezzature e furgone esclusi. Fonti amministrative/principi linkate nella metodologia non certificano i coefficienti.
- `PATCH_VALUTATORE_V2.sql`: aggiunge `dettagli_calcolo` JSONB e `request_id`; RPC `save_valutazione_v2` valida input e **ricalcola nel DB**. Il client non può scegliere proprietario, annuncio o risultati. INSERT/UPDATE/DELETE/TRUNCATE diretti revocati ad anon/authenticated; SELECT solo owner via RLS. Token casuali 256 bit nuovi per compilazione, claim solo v2 entro 24h, verificata proprietà dell’annuncio nella RPC di collegamento.
- Salvataggio idempotente per request_id, limite 30/ora per sessione o utente autenticato con lock transazionale. **Il limite anonimo per sessione non sostituisce un CAPTCHA/WAF contro bot che creano token nuovi**. Nessuna garanzia assoluta di assenza di vulnerabilità.
- Il report non viene dichiarato salvato se la RPC fallisce; pulsante retry. I report v1 rimangono leggibili, evidenziano il vecchio modello; i v2 mostrano le nuove risposte. Gli annunci di confronto sono vendite attive, non scadute, stesso tipo/settore: prezzi richiesti, non transazioni né prova della stima.
- Test: `node scripts/test-valutatore.cjs` (10.368 scenari + input errati e invarianti). `node scripts/test-valutatore-db.cjs` genera `%TEMP%/subingresso-valutatore-db-test.sql` da eseguire con CLI Supabase: transazione **ROLLBACK**, confronto 36 casi JS/SQL, input ostili, idempotenza, permessi, owner e RLS. Richiede due identità già esistenti; nessuna creazione o eliminazione utenti, nessun dato test persistente.
- Browser verificato con Playwright: 320px, 390px e desktop, sole, mesi residui, assegnazione temporanea, input errati, doppio tocco, storage bloccato, errore/retry salvataggio, report v2 e v1. Script/screenshot temporanei sotto `%TEMP%/subingresso-valutatore-tests`.

## 📐 Saved Listings (Preferiti)

- Tabella `saved_listings (user_id, annuncio_id, created_at)` RLS owner-only.
- Cuoricino in `data.js buildCard()` + `annuncio.html`.
- Click anonimo → modal registrazione + `_pending_save_listing` in sessionStorage. Post-signup `processPendingSaveListing()`.
- `SAVED_IDS` Set globale in `data.js`. `loadSavedListingsCache()` in auth.js dopo login.
- Nascosto sui propri annunci.

## 🧭 Header Nav

- Layout: `flex justify-between` <lg, `grid grid-cols-3` da lg.
- Ordine: **Calcolatore | Annunci | Blog**.
- Bottoni: ordine +, messaggi, profilo anche nel DOM; mobile tre quadrati40px (36 sotto380), angoli12px e icone14px. + con gli stessi colori di messaggi/profilo anche nel tema organizzatore; icona `fa-user`.
- `dashboard.html` ha header hardcoded ma **markup allineato 1:1 a `UI.header`** di `ui-components.js` (logo responsive 36→44px, bottone "+" sempre visibile come icona su mobile). Se modifichi `ui-components.js` aggiornare a mano anche dashboard.html.

## 📅 Scadenza Post

Durata 270 giorni: `PATCH_LISTING_LIFETIME_270_20261008.sql`, creazione/riattivazione/test/email allineati. Storico active/pending prorogato una volta (+70 giorni, almeno created_at +270); backup privato `data_quality.listing_expiry_270_backup`. Conteggio admin attivi esclude scaduti.

- `expires_at` 270 giorni di default (8 ottobre 2026, ex 200). SQL: `ALTER TABLE annunci ADD COLUMN IF NOT EXISTS expires_at timestamptz;`
- **Vetrina NON estende `expires_at`** (rimosso 6 mag 2026): tutti i post valgono 270gg, vetrina = solo featured. Niente più cap differenziati 230/300/400. `adminGrantVetrina(days)` + `stripe-webhook` toccano solo i campi `featured*`.
- **NON filtrare su `expires_at`** finché non popolato per tutti — gli scaduti restano visibili ma con badge "Scaduto", contatti bloccati via `_blockIfExpired()` (chat/whatsapp/chiama mostrano toast). RPC `renew_listing(p_id uuid)` SECURITY DEFINER, owner-only, bumpa `expires_at = now()+270gg`. Bottone "Riattiva" in dashboard.html appare per annunci `active` con `expires_at < now()`.

## 🔍 AI Scout Bandi (27 mag 2026, v4 multi-step)

Sistema semi-automatico per scoprire bandi pubblici reali e inviarli agli iscritti `bando_alerts`. **Hybrid 95% auto + 5% umano**: l'AI cerca con pipeline a 4 step, l'admin clicca "invia" o "scarta" (via mail o pannello).

**Filosofia**: Gemini Flash gratuita è meno brava su task ambigui ma ottima su mini-task focalizzati. Splittiamo il problema "trova bandi" in 4 sotto-task piccoli e ben definiti. Ogni step ha un singolo job. Risultato: qualità ×3 senza cambiare modello.

**Pipeline per regione (3 chiamate Gemini + validazione HTTP):**
1. **STEP 1 Discovery [Gemini+Search]** → max 15 URL candidati su domini whitelist. Prompt mini-task focalizzato.
2. **STEP 2 HTTP validation [Code, parallel]** → fetch GET (Range 0-16383), keyword check sul body, dominio whitelist enforce. Estrae snippet titolo+h1+body. Drop link morti / off-topic. Max 8 sopravvissuti.
3. **STEP 3 Structured Extraction [Gemini batch]** → da snippet → JSON `{url, titolo, comune, scadenza, n_posteggi, settore, riassunto}`. Mini-task: "estrai dati strutturati".
4. **STEP 4 Verification [Gemini batch]** → boolean keep/drop per ognuno con motivo. Mini-task: "è un bando reale e attivo? sì/no". Fallback conservativo (keep-all) se Gemini non risponde.
5. **Insert DB** con dedup hash `SHA256(regione|url)`.

**Throttling**: sleep 2500ms tra ogni call Gemini per stare entro 15 RPM free tier. Tempo totale giro: ~3-4 min per 4 regioni (largo entro limite edge function).

**Briefing throttled (`admin_briefing_state` singleton):** dopo ogni giro, `maybeSendBriefing()` controlla:
- Pending totali in DB (non solo nuovi del giro)
- `last_briefing_at` vs `BRIEFING_GAP_HOURS = 72` (= 3 giorni)
- Override `BRIEFING_URGENT_COUNT = 10` se accumulati troppi pending
- Manda email solo se gap elapsed o urgent. Aggiorna `last_briefing_at` solo su invio reale.
- Salva quota Resend (lui spende mail per iscritti veri, non per se stesso).

**Schema briefing state (`PATCH_ADMIN_BRIEFING_STATE_20260527.sql`):**
- Tabella `admin_briefing_state(id smallint PK CHECK id=1, last_briefing_at, last_briefing_items_count, updated_at)` con singola riga (singleton).
- RLS on, accesso solo via edge function service_role.

**Telemetry response edge function:**
```json
{
  "regioni_scanned": 4,
  "total_new_inserted": 2,
  "per_regione": {
    "Calabria": {"step1_discovered":3, "step2_validated":2, "step2_rejected":1, "step3_extracted":2, "step4_verified":2, "inserted":1, "duplicate":1}
  },
  "briefing": {"sent": true, "pending": 7, "reason": "gap_elapsed"}
}
```

### Diagnostica Scout Bandi

Il vecchio Scout v1 è sostituito dalla pipeline sopra. File principali:
`supabase/functions/scout-bandi/index.ts`, `bando-action/index.ts`,
`api/bandi/[slug].js`, pannello in `dashboard.html`.

Prima di intervenire, leggere stato cron `scout-bandi-daily`, ultimo
`discovered_at`, conteggi per `status`, `admin_briefing_state` e iscrizioni
effettive. Errori/quota Gemini: verificare risposta e disponibilità del modello
prima di cambiare `GEMINI_MODEL` o `GEMINI_SLEEP_MS`; quote e prezzi di maggio
non sono un riferimento corrente. Briefing: controllare pending e gap 72 ore;
landing 404: slug, stato approved/sent e permessi di `get_published_bando`.

Non forzare invii, pubblicare bandi, cambiare cron o cancellare log per una
semplice diagnosi. Non estrarre secret dalle definizioni SQL per stamparli.
Test manuali con effetti reali e pulizie richiedono ambito autorizzato.

## Backup e memoria comune

Regole e comandi in `AGENTS.md`. `CLAUDE.md` contiene solo `@AGENTS.md`,
compatibile anche con la versione Claude Code installata al 23 ottobre
(2.1.156). Non ricreare riepiloghi paralleli né letture integrali obbligatorie.

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

### Cron pg_cron — elenco documentale da verificare live
- `unfeature-expired-daily` 03:00 — cleanup vetrine scadute.
- `increment-featured-views`: disattivato l'8 ottobre 2026; elenco storico, non riattivare.
- `weekly-buyer-digest` Lun 09:00 (TODO: spalmare).
- `weekly-seller-stats` Lun 09:00 (TODO: spalmare).
- `admin-anomaly-check` 09:00 daily.
- `engagement-reminders` 10:00 daily.

## Versioni degli asset

Leggere i riferimenti effettivi nei sorgenti con `rg`. Un elenco manuale
congelato diventa obsoleto: aggiornare tutti i consumatori dell'asset modificato,
inclusi HTML, template SSR e import dei worker, secondo `AGENTS.md`.

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

### Attività da rivalidare

Le priorità correnti sono nel documento informazioni. Le proposte seguenti
provengono dal backlog storico: verificare prima codice, commit e stato live;
non sono incarichi automatici né prova che una funzione manchi ancora.
Numeri utenti/annunci, bandi pending, funnel e scadenze di maggio/giugno non
sono più presentati come stato attuale. L'eventuale rotazione della chiave Gemini
segnalata nel maggio 2026 va verificata senza ristampare o riutilizzare il valore.

**Proposte storiche, stato da verificare prima di riprenderle:**
- **Lead magnet email** sull'hub Bolkestein → porta annunci veri (priorità n.1). Outreach anche via gruppi FB / mercati di persona / associazioni FIVA-ANVA (vedi `project_compete_annunciambulanti.md`).
- **Step 2 SEO landing regionali SSR** (`api/annunci.js`, modello `api/blog.js`): title/meta/H1 per `?regione=X`. Solo dopo ≥5 annunci attivi per regione.
- **Fase 5 blog conversion**: pannello "Performance blog" admin + RPC `admin_blog_stats(p_days)`, dopo 7-14gg di dati → migliorare copy/CTA degli articoli con CR% basso e tante views. Tracking in `blog_conversions`.
- **Serie "Mercati settimanali [città]"** (Modena/Brescia/Bergamo/Milano/Bologna/Torino/Verona/Padova/Firenze/Napoli).
- **Bolkestein — 6 Tier 2 + 3 Tier 3 rimasti**: Tier 2 `roma-18000-concessioni-ambulanti-2026`, `proroga-2032-concessioni-ambulanti-legge-77-2020`, `procedura-infrazione-ue-italia-ambulanti-bolkestein`, `associazioni-ambulanti-bolkestein-confronto`, `sentenze-tar-consiglio-stato-bolkestein-ambulanti`, `linee-guida-mimit-regioni-anci-bandi-ambulanti-2026`; Tier 3 `concessione-ambulante-scadenza-2026-guida-pratica`, `diritto-insistenza-bolkestein-ambulanti-2026`, `diventare-ambulante-2026-bolkestein-accesso`. + re-submit a SC i 4 articoli Bolkestein + internal linking (footer/home/blog) al hub.
- **Privacy policy (pubblicazione 7 ottobre 2026, conformità ancora aperta)**: `privacy.html` pubblicata su richiesta esplicita usando solo Subingresso.it e `info@subingresso.it`, senza nome/indirizzo/P.IVA. Identificazione legale del titolare ancora incompleta ai fini GDPR. Testo adattato al funzionamento attuale: nessun pannello consenso inesistente o TTL visitor ID inventato. Restano da allineare consenso analytics, email promozionali e gestione scadenze: `PRIVACY_DATA_AUDIT_20261007.md`. Bozza completa futura in `PRIVACY_POLICY_BOZZA_20261007.md`. Per sviluppo del sito: dati pertinenti entro limiti definiti, storico lungo solo con anonimizzazione effettiva. Nessuna cancellazione applicata.
- **Step 3 lifecycle annunci scaduti**: edge function + cron daily, 2 email (7gg prima + giorno scadenza), tabella `expiry_notification_log` UNIQUE per dedup. Mai fatto.
- **welcome_popup**: dichiarato nell'enum `_AMO_VALID_SOURCES` ma morto → costruirlo (CTA completa profilo/avatar) o rimuoverlo.
- **Data audit**: annunci eliminati conservati secondo le regole correnti; dal 24 ottobre gli esiti venduto/affittato e i prezzi dichiarati hanno il mini modulo privato (`data/LISTING_OUTCOMES.md`), senza ricostruzione dello storico. Restano da valutare log modifiche e ulteriori eventi di conversione.
- **Spalmare i 2 cron settimanali** su giorni diversi (allunga la quota free Resend).
- **og:image `/annunci` e `/blog`** on-brand (ora frutta/verdura Pexels).
- **Trust whitelist modifiche annuncio**: auto-approvazione dopo N annunci approvati (meno re-revisioni admin).
- **CSP**: ~1 settimana di lavoro, da pianificare.
- **JSON-LD `author` → Person + pagina `/autori/<slug>`** (E-E-A-T per Google Discover; eligibility realistica 3-6 mesi).
- **Cleanup conv vuote** (opzionale): `DELETE FROM conversazioni c WHERE NOT EXISTS (SELECT 1 FROM messaggi m WHERE m.conversazione_id = c.id);` — già nascoste lato client.

### Lavori già conclusi

Esiti nel registro e nei commit; evitare di replicarli in questo manuale.

### Bug minori segnalati ma non urgenti
- `moderation.js` non incluso in HTML (mitigato da trigger DB).
- Admin hardcoded in `setup-database.sql` vecchio (in prod usate già `is_admin`).
- UPDATE policy senza `WITH CHECK` (Postgres riusa USING).
- Rimozione foto in `modifica-annuncio.html` corretta il 7 ottobre 2026 con WeakMap File→preview.

## Stato delle verifiche di sicurezza

Le vecchie note sul telefono pubblico di `profiles` sono superate dalle
restrizioni di colonna e RPC documentate sopra e in `DATA_QUALITY_AUDIT_20261008.md`.
Un vecchio dump SQL non dimostra lo schema live: verificarlo quando serve,
senza cambiare permessi o cancellare dati per allineare il repository.

## 💡 Strategia Monetizzazione — proposte storiche, non funzioni attive

- **NON puntare al volume annunci** ma **lead gen finanziaria verticale**.
- **Tier 1**: microcredito (PerMicro, Banca Etica).
- **Tier 2**: prestiti consumer (Cofidis/Findomestic/Compass/Younited).
- **Tier 3**: broker creditizi OAM (Auxilia, Credipass, BPIfutura) — ingresso più rapido.
- Modelli CPL EUR 15-50 o CPA 1-5%.
- **Ipotesi storica di raccolta progressiva dei contatti**: superata per la registrazione dalla richiesta del 23 ottobre (telefono obbligatorio). Non rimuovere il campo per applicare questa vecchia proposta.
- **Espansione futura** a edicole, autoscuole, compro oro (TAM affine, no leader verticale).
- **Plateau utenti realistico**: 10-20k registrati, 2.500-6.000 MAU.
- **Costi infra a regime**: anno 1 €0-20/mese (free), anno 2-3 €20-40/mese (Resend Pro), plateau €30-50/mese.
- **Stack ottimizzato futuro** (>2k utenti): Cloudflare Pages (sostituisce Vercel) + Cloudflare R2 (sostituisce Supabase Storage) + Brevo (sostituisce Resend).

### Subingresso Protetto / Trattativa Protetta (idea futura)

Obiettivo: aggiungere un servizio di tutela/accompagnamento alla compravendita di posteggi mercatali e licenze ambulanti. Subingresso non deve restare solo un portale annunci: deve diventare il posto dove trovi posteggi, confronti prezzi reali/storico venduti, riduci il rischio prima di comprare e puoi chiudere con supporto documentale/professionale.

Nomi possibili: **Subingresso Protetto**, **Trattativa Protetta**, **Controllo Documenti**. Evitare promesse forti tipo "garanzia totale", "licenza sicura al 100%" o "tutela legale garantita". Copy prudente: "Analizziamo i documenti con supporto AI e revisione umana per evidenziare anomalie, documenti mancanti e punti da verificare prima di procedere."

**Uso AI / ChatGPT**: usarlo come motore di pre-verifica documentale, NON come consulente legale automatico. Puo' leggere autorizzazione/licenza, visura, dati posteggio, regolamento mercato, bozze accordo; trovare incongruenze tra annuncio e documenti; indicare documenti mancanti; preparare domande da fare al venditore; generare checklist notaio/SUAP; produrre mini-report per acquirente/venditore. Serve comunque revisione umana/professionale prima di vendere il servizio come tutela. Per consulenza legale personalizzata serve coinvolgimento appropriato di un professionista autorizzato. Formula corretta: **pre-controllo documentale assistito da AI + revisione umana**.

**Privacy documenti**: non caricare documenti sensibili nel ChatGPT personale. Usare almeno ChatGPT Business/Enterprise o API con impostazioni business, DPA/privacy adeguati e accessi controllati. I documenti devono restare privati e non pubblici.

**Flusso consigliato**:
1. Acquirente clicca "Avvia trattativa protetta" / "Controlla documenti".
2. Paga una quota piccola di avvio/interesse serio.
3. Subingresso contatta il venditore e spiega la procedura.
4. Se il venditore accetta, carica documenti o concorda incontro.
5. AI fa pre-check e report grezzo.
6. Persona/consulente/professionista rivede il report.
7. Acquirente riceve esito: ok / attenzione / sconsigliato / documenti mancanti.
8. Se le parti procedono, upsell ad accompagnamento fino a notaio/SUAP.

Se il venditore non collabora: non incassare subito il pacchetto grosso; rimborsare quota iniziale o convertirla in credito; registrare internamente che il venditore non e' disponibile alla verifica. Regola: soldi grandi solo dopo consenso del venditore e disponibilita' documenti.

**Come convincere il venditore**: non dire "carica documenti per noi". Messaggio migliore: "Un acquirente serio ha richiesto una trattativa protetta per il tuo posteggio. I documenti non saranno pubblici: servono solo al controllo riservato prima dell'eventuale accordo." Benefici: meno perditempo, acquirente piu' serio, piu' fiducia, trattativa piu' veloce, badge "documenti disponibili/verifica completata", nessun costo iniziale nella fase base.

**Prezzi indicativi basati sui dati attuali dashboard (26 giugno 2026)**: 60 annunci totali, 50 attivi, 41 utenti, valore annunci EUR 388.900, 44 vendite + 6 affitti capitalizzati x8, media vendita posteggi circa EUR 7.293, mediana circa EUR 5.000, media fiere circa EUR 4.875, 5% mediana circa EUR 250. Conclusione: prodotto base NON deve costare troppo perche' molti affari sono piccoli.

Prezzi consigliati:
- Avvio richiesta trattativa protetta: EUR 29-49, massimo EUR 99, rimborsabile/convertibile se venditore non collabora.
- Pre-check AI automatico: EUR 49-99.
- Controllo documenti assistito da AI + revisione umana: EUR 199-349, ideale iniziale EUR 249/299.
- Trattativa protetta con chiamata e coordinamento parti: EUR 499-790.
- Accompagnamento offline fino a notaio/SUAP: da EUR 1.200.
- Caso complesso o valore alto: EUR 2.000-4.000+.

Regola per fascia valore: sotto EUR 7.500 tutela max EUR 249-399; EUR 7.500-20.000 tutela EUR 499-990; EUR 20.000-50.000 tutela EUR 1.200-2.000; sopra EUR 50.000 tutela EUR 2.000-4.000+. Prodotto core da testare per primo: **Controllo documenti assistito da AI e revisione umana a EUR 249/299**.

**Versione offline premium**: consulente raggiunge le parti, controlla documenti, coordina venditore/acquirente, accompagna all'atto dal notaio, segue pratica SUAP/subingresso, tutela entrambe le parti senza sostituirsi a notaio/avvocato. Non lanciare subito nazionale: pilot Lombardia + Emilia-Romagna + Veneto con piccola rete di consulenti/professionisti partner.

**Posteggi venduti / storico prezzi**: collegato alla tutela. Spingere i venditori a usare "Segna come venduto" invece di eliminare. Motivo: storico prezzi, fiducia, protezione compratori, dati proprietari difficili da copiare. Solo `sold` deve diventare archivio pubblico; `deleted` resta nascosto. Sezione possibile: "Posteggi venduti", "Storico prezzi posteggi mercatali", "Prezzi reali dei posteggi mercatali". Sui venduti mostrare titolo, comune/regione, tipo mercato/fiera, settore, prezzo richiesto (non finale se non confermato), superficie, giorni mercato, data pubblicazione, data venduto. Nascondere telefono, WhatsApp, chat, email, contatti venditore.

**Posizionamento**: non vendere Subingresso solo come "portale annunci". Posizionamento migliore: **"Il mercato trasparente dei posteggi mercatali"** oppure **"Compra e vendi posteggi mercatali con prezzi piu' chiari"**. Differenza competitor: annunci verticali, storico prezzi, dati di mercato, controllo documenti, trattativa piu' sicura. Parola chiave: **trasparenza**.

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


## Calendario fiere — fonti e manutenzione

- Ricerca e prove provinciali complete: `data/FIERE.md`, audit
  `data/fiere-*.json` e dossier privati `Documents/ricerca-fiere-*`.
  Checklist e decisioni dell'utente: `Subingresso.it informazioni.md`.
  Non replicare qui i resoconti di ogni provincia o conteggi/versioni di cataloghi passati.
- Ripartire dai dati e dall'ultimo commit effettivi; preservare ID, fonti,
  province estranee e modifiche concorrenti. Non rigenerare da snapshot vecchi.
- Build `scripts/build-fiere.py`, catalogo `data/fiere-fonti.json` e test pertinenti
  indicati nel dossier. Verificare build ripetibile, fonti, semantica delle date,
  filtri, dettaglio e stato online prima di dichiarare conclusa una ricerca.
- Date confermate, periodi indicativi, storico e annullamenti restano distinti;
  non inventare disponibilità, costi, contatti o condizioni per gli espositori.
  Ricerca provinciale conclusa con limiti espliciti e manutenzione futura sono
  stati differenti. Non contattare organizzatori o inviare domande senza richiesta.
- Pagine autonome, affinità, affluenza e filtri sono descritti nel contratto
  fiere; organizzatori e offerte commerciali in `data/ORGANIZZATORI_EVENTI.md`.

Le descrizioni tecniche superate sono recuperabili nella versione Git
precedente alla pulizia documentale del 23 ottobre (commit `da20655`).
