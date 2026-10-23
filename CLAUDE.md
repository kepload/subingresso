# Regole Claude — Subingresso.it

Finiture dark23/10: bordi chiari indigo/ciano e gialli convertiti in linee
discrete; statistiche admin con etichette12px e cifre tabulari, due schede
economiche a tutta larghezza su telefono. Pulsanti admin piatti, stati/focus
coerenti,44px su mobile. Struttura e funzioni conservate; niente invii reali.
Cache corrente admin-themeJS6/CSS5; prove/stato pubblicazione in
Documents/verifica-dark-finiture-20261023/risultati.md.

Tema personale23/10, correzione flash: pulsante Modalità scura direttamente
nella pagina profilo/dashboard e nell’area organizzatore, fuori da impostazioni
e moduli. Chiaro iniziale per tutti; preferenza auth.user_metadata.site_theme.
Script sincrono all’inizio del head e CSS bloccante prima del body, anche SSR.
Copia locale _si_theme_preference_v1 limitata a ID/tema confermato, usata solo
con la stessa sessione. Prima lettura senza copia: attesa su fondo scuro.
GET riconcilia; errore temporaneo conserva aspetto, 401/403/logout/cambio
identità invalidano. PUT sempre con token iniziale; nessun ruolo in cache.
JSadmin-theme6/CSS5, theme-preferences2. Contratto data/THEME_PREFERENCES.md;
prove/stato Documents/verifica-tema-senza-flash-20261023/risultati.md.


Vetrina/statistiche22/10: shell UI solo `body > header/footer`, mai quelli
dei dialoghi; ui-components18. Annunci gratuiti: visualizzazioni e messaggi
nel periodo, anteprima Premium sfocata senza dati reali nascosti. Analisi
complete permanenti per ogni annuncio con pagamento live riuscito,
anche in bundle e dopo scadenza/rimborso; mai test, omaggi o soli featured.
Gate server/RLS, grafico/tabella/CSV solo annunci sbloccati; dettagli in
`data/SELLER_PREMIUM_ANALYTICS.md`. Cache sellerCSS2, premiumCSS4,
accountJS4, admin-themeJS4/CSS3. Trigger annunci e dati storici invariati.

Vetrine Premium22/10: 49/99/249 euro per10/30/90giorni; pacchetti
2annunci -10%,3–4 -15%,5–10 -20%, stessa durata e pagamento unico.
Listino condiviso js/vetrina-pricing.js; contratto/migrazione/verifiche in
`data/VETRINE_PREMIUM.md`. Nessuno sconto pubblicazione o omaggio UI;
blog solo Vetrine pagate, catalogo gratuito conservato. Trigger annunci
invariati; ordini precedenti e sessioni aperte rispettati. Nuovi asset
pricing1/premiumJS2-CSS3/account3. Non ripristinare i vecchi prezzi.

Anteprime22/10: `api/image.js`/`lib/image-preview-cache.cjs` riusano WebP nel
bucket `image-previews` anche dopo i deploy; un originale per sei dimensioni.
Secret solo in environment cifrato Vercel, originali mai modificati.
Contratto, errori e verifiche in `data/IMAGE_PREVIEWS.md`; nessun piano attivato.

- `admin-theme.js?v=6`, `admin-theme.css?v=5`, `theme-preferences.css?v=2`: avvio senza flash e finiture dark, pulsante diretto nel profilo, chiaro iniziale. Tutti gli HTML/API; generatore CSS esclude il foglio delle preferenze. Contratto data/THEME_PREFERENCES.md.

- 🛡️ **BACKUP TAG OBBLIGATORIO (regola n.0)**: prima della prima modifica di OGNI nuova sessione, lancia `.\scripts\session-backup.ps1 -Reason "<descrizione-corta>"`. Crea un tag git su HEAD + push remoto. Ritorno garantito con `git reset --hard backup/session-YYYYMMDD-HHMMSS-...`.
- ⚡ **STILE RISPOSTE (regola n.1)**: l'utente è un vibe coder, non un programmatore. Rispondi **corto e semplice**. Niente papiri, niente muri di testo, niente gergo tecnico (SSR, RPC, GRANT, cannibalizzazione...) senza spiegarlo in 2-3 parole. Dopo una modifica dì **cosa cambia per lui** in 1-2 frasi. Fai il lavoro, spiega poco. Vedi memoria [[feedback_stile_risposte]].
- Quando l'utente dice che sta per chiudere la sessione (es. "chiudo", "a dopo", "fine sessione", "salva tutto"), aggiorna `istruzioni.md` con tutte le info utili emerse nella sessione (solo info non duplicate, super riassuntive).
- Dashboard admin: pochi numeri e grafici utili. Spiegazioni e dettagli nei pannelli apribili, senza muri di testo (preferenza utente, 8 ottobre 2026).
- Leggi sempre `istruzioni.md` prima di iniziare a lavorare su qualsiasi task.
- Qualità dati (8 ottobre 2026): `DATA_QUALITY_AUDIT_20261008.md`, patch DB `PATCH_DATA_QUALITY_20261008.sql`, anagrafica privata `data_quality` e seed `scripts/seed-data-locations.cjs`. Non rimuovere trigger o inventare correzioni storiche. Telefoni tramite `get_my_profile` / `admin_user_details`; profiles pubblici con colonne esplicite. Riepilogo admin, filtri, dettagli e CSV. Test `test-data-quality.*`, `test-admin-control-room.cjs`, vendi/ricerca. Cache correnti data 21, auth 22, annunci 13, vendi-support 2, valuation 2, blog-tracker 2; auth richiede data.js anche nelle pagine di servizio. Conteggi completi, email confermata tecnicamente distinta dal possesso della casella.
- `AGENTS.md` esiste e contiene le stesse regole in formato adatto a Codex CLI. Mantenere allineato quando si modifica una delle due fonti.
- Provenienze (7 ottobre 2026): dashboard admin, `PATCH_ACQUISITION_20261007.sql`; cache `auth.js?v=21`, `page-view-tracker.js?v=4`, `js/pages/valutatore.js?v=3`. Dettagli e verifiche in `istruzioni.md`.
- Valutatore (22 ottobre 2026): v2.6, nuovi pesi proporzionali per passaggio, angolo e sole. Caso 15.000 annui/50 giornate, sole parziale e concessione ignota: base 13.548; principale 16.425, laterale 10.000, angolo 15.000, riparato 14.000, sole davanti 12.000. Pesi sulla parte sopra 1.000; minimi cessione 1.000/affitto 500 e limiti di margine/durata conservati. RPC `save_valutazione_v26`; report 2.0-2.5 invariati. Cache `js/valuation.js?v=8`, `js/pages/valutatore.js?v=9`; dettagli in `istruzioni.md`.
- Località (8 ottobre 2026): comuni e 55.288 frazioni/quartieri/centri minori in ricerca e form; `comune-picker.js?v=7`, `location-search.js?v=8`, `location-search-worker.js?v=3`, `listing-search.js?v=1`, `js/pages/annunci.js?v=11`. Refusi in background, fallback a blocchi; il worker importa la stessa versione del motore: aggiornare entrambi i riferimenti e il cache buster del worker quando cambia. Invio/Cerca su luoghi riconosciuti, anche con refusi, mostrano i dintorni entro 100 km dal più vicino al più lontano; Vetrina solo a parità di distanza. Centro completo visibile, omonimi risolti usando il contesto degli annunci pubblici e modificabili dai suggerimenti. Nessuna modifica ai dati degli annunci. Fonti in `data/LOCALITA.md`, dettagli in `istruzioni.md`.
- Immagini (7 ottobre 2026): `api/image.js` crea anteprime WebP/cache senza modificare gli originali; `image-urls.js?v=1` prima di `data.js?v=19`, `annuncio-detail.js?v=26`. Originali caricati solo al clic sul dettaglio. Upload foto conserva il file esatto fino a 20 MB. Dettagli e test in `istruzioni.md`.
- Calendario fiere (8 ottobre 2026): `/fiere`, 200 eventi (10 per regione), filtri per mesi/intervallo/regione/tipo e mappa SVG. Periodi indicativi e fonti nelle schede; catalogo in `data/fiere-fonti.json`, rigenerazione `python scripts/build-fiere.py`, dettagli in `data/FIERE.md`. Navigazione condivisa `ui-components.js?v=17`.

- Caricamento località (9 ottobre 2026): normalizzazione e indici iniziali a blocchi di circa 8 ms con pause del browser, per mantenere attivi clic e digitazione durante la preparazione dei 63.182 luoghi. Dati, alias, coordinate, ordine e gestione errori conservati. Minuscolo Unicode standard equivalente all’italiano, verificato su nomi e alias; orologio controllato ogni 16 record per limitare il costo delle pause. Cache comune-picker 7, location-search 8, worker 3; tutti i riferimenti, inclusi form e import del worker, aggiornati. Regressione sul caricamento iniziale in scripts/test-location-background.cjs (Chromium/WebKit).

## 🚨 Regole anti-leak segreti (dopo incidente 4 mag 2026)

- **MAI hardcodare segreti in file versionati** (`.sql`, `.md`, `.ts`, `.js`, `.json`, ecc.). Il repo è pubblico su GitHub.
- Segreti significa: `sb_secret_*`, JWT `eyJ...service_role`, API keys (Stripe, Resend), password DB, token amministrativi.
- **PATCH SQL che richiedono una chiave**: scrivere il file come template con variabile psql (`:'service_jwt'`) e applicarlo via `psql -v service_jwt="$KEY"`. OPPURE creare il file SQL fisicamente in `/tmp/` (fuori dal repo), applicarlo, eliminarlo.
- **MAI recuperare una chiave via query DB e iniettarla in un Write/Edit** verso un path dentro il repo.
- **Pre-commit hook gitleaks attivo** in `.git/hooks/pre-commit` — se rileva un segreto blocca il commit. Non bypassare con `--no-verify` se non sei certo al 100%.
- **Push protection GitHub attiva** — secondo strato di sicurezza lato server.
- Se una chiave finisce in un commit per errore: 1) sanitizza il file, 2) dì all'utente di ruotarla su Supabase Dashboard, 3) riscrivi la history con `git filter-branch` + force-push.

Preferiti (19 ottobre 2026): stato unico card/dettaglio, cache sessionStorage limitata all'utente verificato, evento savedListingsChanged; niente timer 1,5/4 secondi. UI immediata, blocco per annuncio durante richiesta e minimo 500 ms, timeout 15 s, rollback con avviso, risposte vecchie ignorate. Modifiche non confermate prima della navigazione protette fino alla verifica; logout/cambio account puliscono la cache. Dashboard usa setSavedListingsCache, non mutare SAVED_IDS direttamente. Cache data 22, annuncio-detail 25; suite scripts/test-saved-listings.cjs (SAVED_USE_PUBLISHED, SAVED_QA_DIR, PLAYWRIGHT_MODULE).

Conteggio annunci venditore (21 ottobre 2026): icona banco + 2-10, 10+ oltre dieci, nascosto con zero/uno. Totale pubblico attivo e non scaduto, indipendente dai filtri; richieste condivise/paginate in data.js, nessun numero su errore. Presente nelle card, dettaglio e profilo; conteggio eventi organizzatore conservato. Cache data23/design-system13/dettaglio26; test scripts/test-seller-listing-counts.cjs.

Home (21 ottobre 2026): contatori tra ricerca e anteprime, sfumatura bianco-grigio richiesta. Tre luoghi più cercati su 30 giorni da home_top_location_searches, accesso pubblico solo aggregato; ultima località prima per account sullo stesso browser (_si_last_location_v1:ID), nessuna adozione della cronologia anonima. Helper location-shortcuts1, homeCSS6, annunci15; test scripts/test-home-location-shortcuts.cjs.

Affinamento successivo21/10: smartphone una sola riga con tutti i luoghi che entrano tra12candidati, desktop tre, personale prima. Indicatore quattro blu progressivamente luminosi2-3/4-6/7-10/11+. Preferenza stabile: sfumature nei passaggi bianco->sfondo chiaro, senza sfocare testi; tema organizzatore conservato. Cache correnti data24/design-system15/home7/location-shortcuts2. Test riga/resize/nomi lunghi, colori e contrasto nei due script dedicati.
