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
