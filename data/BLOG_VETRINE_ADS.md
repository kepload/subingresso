# Vetrine nel blog e nella raccolta ADS — 26 ottobre 2026

Gli annunci in Vetrina Premium sono un tipo di pubblicità nella pagina admin
`/le-mie-ads`, separato dalle 20 creatività proprie. Nessun nuovo pagamento,
invio, promozione automatica o modifica agli annunci. Il motore delle nostre
ADS e le correzioni per articolo restano descritti in `CONTEXTUAL_ADS.md`.

## Spazi e pertinenza

`BlogMarkup.articleMarkup` crea un solo spazio posteggi: nel testo per le
guide precedenti; in chiusura per bandi, articoli brevi e articoli con banner
editoriali. Questi ultimi prima non avevano lo spazio: ricognizione corrente
120 articoli, 91 con spazio e 29 ripristinati, senza modificare il testo nel DB.
Anche gli articoli futuri usano il template. Gli spazi Vetrina sono aggiuntivi
ai due banner propri, restano compatti e sono riconoscibili come pubblicità.

Selezione `blog_listing_ads` esistente: solo Vetrine pagate 10/30/90 giorni,
attive, pubbliche, non demo e non scadute; geografia editoriale, preferenza
città/settore/affitto e sorteggio fra pari, massimo tre, senza duplicati.
Nessun riempimento gratuito o fuori zona; senza candidati il riquadro sparisce.
Si rileggono le promozioni anche al ripristino dalla cache del browser.

## Misura

`PATCH_BLOG_VETRINE_ADS_20261026.sql`, `js/blog-listing-ads-tracker.js`:
tabella `blog_listing_ad_events`, con soli ID annuncio, slug articolo,
posizione `blog_inline`/`blog_closing`, tipo, sessione esistente e data.
Nessun nuovo identificatore persistente, IP, email o recapito. RLS attiva;
nessun accesso diretto anon/authenticated. RPC `blog_listing_ad_event`
valida annuncio, articolo pubblicato, geografia, sessione, posizione e tipo.
Proprietario autenticato, admin e demo esclusi anche sul server; automazioni
riconosciute escluse nel browser. Non si promette di riconoscere un proprietario
che visita senza accesso o tutti i bot. Lock/dedup atomici per sessione,
annuncio, articolo, posizione e tipo; limite 250 eventi/ora per sessione.

Impressione: almeno metà anteprima visibile per un secondo continuo con
pagina attiva. Clic sinistro o centrale, senza rallentare il collegamento
diretto: POST `keepalive`; su errore si continua la navigazione. Nessuna
scrittura dalle anteprime della raccolta. Isolamento di sessione e risposte
tardive; nessuna attribuzione inventata di conversioni o vendite.

Gli eventi non sostituiscono gli aggregati storici del blog né le impressioni
generiche degli annunci: queste serie restano separate e non vanno sommate.
Nessuna ricostruzione retroattiva. CTR = clic con precedente impressione
nella stessa sessione/annuncio/articolo/posizione e nel periodo / impressioni
del periodo. I clic senza impressione restano nei clic totali; zero
impressioni produce «—». Deduplica per sessione, non persone uniche.

## Raccolta e anteprima

RPC `admin_blog_listing_ads`, accessibile solo ad admin verificato ogni volta:
inventario attivo più annunci con eventi nel periodo, risultati per annuncio,
articolo e posizione, 7/30/90/365 giorni. Le promozioni terminate mantengono i
risultati nel periodo. Non si espongono sessioni né dati account.

`/api/personal-ads?action=listing-stats` e `listing-preview&post=...`:
token admin prima di leggere, `private, no-store`. Statistiche, anteprima
casuale del vero selettore e CSV in «Posteggi in Vetrina nel blog».
Errori conservano gli ultimi risultati con avviso; CSV conserva il periodo
dei dati effettivamente caricati. Logout/cambio identità/permesso negato
puliscono il contenuto; anteprime tardive non riappaiono dopo l'uscita.
La nuova migrazione va applicata prima del deploy del browser.

## Verifiche

`scripts/test-blog-vetrine-ads-db.cjs`: funzioni SQL effettive, fixture in
ROLLBACK, RLS/admin, validazione, deduplica, geografia, scadenza, esclusioni,
CTR/periodo e storico. `scripts/test-blog-vetrine-ads.cjs`: API/accessi,
quattro modalità di posizionamento, interfaccia chiara/scura, anteprima,
CSV, errore/ripresa, logout e tracker in Chromium 1440/768/320 e WebKit390.
`PLAYWRIGHT_MODULE` seleziona il modulo browser, `BLOG_VETRINE_QA_DIR` gli
artefatti; `BLOG_VETRINE_SERVE=1` serve la fixture locale per l'inspector.

Ricognizione di tutti i 120 testi, regressioni blog/SSR, annunci correlati,
raccolta/tracker propri e motore contestuale. Prove private in
`Documents/blog-vetrine-ads-20261026`; nessuna statistica/acquisto reale
di prova. Inventario reale iniziale: zero Vetrine idonee; simultaneità e
interazioni sono provate con fixture, non presentate come traffico reale.
