# Recensioni delle fiere — 4 novembre 2026

Richiesta: percorso a passaggi come «vendi posteggio», con barra di progresso,
registrazione soltanto alla fine e recensioni dentro il contesto della fiera.

## Percorso e contenuti

- Stesso componente nel dettaglio del calendario, nelle pagine `/fiere/:id`
  e negli eventi pubblicati `/evento?id=...`. Collegamento alle recensioni
  vicino all'intestazione della scheda del catalogo.
- Tre schermate essenziali: edizione; stelle; commento facoltativo e
  pubblicazione. Barra di avanzamento, ritorno indietro e chiusura con X.
  Nessuna spiegazione ordinaria sulle bozze, nessun contatore dei caratteri,
  selezione del settore, domanda di raccomandazione o riepilogo separato.
- «Questa edizione»/«Quest’anno», «L’anno scorso», «Altra edizione».
  Se c’è una sola edizione già iniziata nell’anno, la selezione assegna le sue
  date documentate e avanza. Più date nello stesso anno: scelta delle date,
  oppure «Non ricordo la data» per indicare soltanto l’anno. Oltre quattro
  edizioni si usa un selettore, senza una lista lunghissima. Anno manuale dal
  1900 all’attuale. Edizioni future escluse; nessuna data proiettata da anni
  diversi o ricavata dai soli mesi abituali. Anno senza date: resta solo anno.
- Stelle normali senza riquadri, riempimento cumulativo al clic e anteprima
  al passaggio del mouse; focus soltanto per tastiera. Rimossi «Non valutabile»
  e i testi ridondanti. Le valutazioni secondarie possono restare vuote.
- Lettura pubblica, dieci recensioni per pagina. Media complessiva e medie dei
  criteri soltanto dalle recensioni effettive. Stato vuoto senza voti inventati.
  Affluenza al banco e risultati sono esperienze personali, distinte dai dati
  documentali e dalle stime di affinità della scheda.
- L'ospite compila tutto; il modulo di registrazione esistente viene aperto
  soltanto al pulsante finale, con accesso alternativo. Telefono e termini
  obbligatori, consenso promozionale separato e facoltativo come nel sito.
  Il popup generico viene disattivato quando si comincia a scrivere.
- Dopo l'accesso, la recensione resta compilata e viene pubblicata soltanto
  premendo il pulsante. L'annullo dell'accesso conserva la bozza e ripristina
  il dettaglio nel calendario. Nessuna email di invito o promemoria aggiunta.
- Nome di battesimo, edizione, voti ed eventuale commento sono pubblici. Il
  settore resta visibile soltanto nei contributi precedenti che lo indicavano. Email,
  telefono e ID dell'account non compaiono nella lettura pubblica. Il link di
  segnalazione prepara un'email con l'ID della recensione; nessun invio automatico.

## Bozze e controlli

`localStorage` per proprietario verificato, tipo e ID fiera; ospite separato.
Recupero tramite «Riprendi la recensione», anche sullo stesso browser dopo
ricaricamento. Scadenza 30 giorni dall'ultima modifica, eliminazione alla
riapertura della relativa bozza scaduta o dopo pubblicazione. Non sincronizzate
tra dispositivi. La bozza ospite passa all'account solo nel percorso di accesso
della recensione. Cambio account/logout azzerano il contenuto in memoria e
ignorano le risposte tardive; non mostrano le bozze altrui. Errori di memoria
sono espliciti e attivano l'avviso all'uscita.

Anno dal 1900 all’attuale in Europa/Roma, oppure date documentate già iniziate;
per gli eventi organizzatore valgono soltanto le proprie date pubblicate.
Commento facoltativo fino a 2.000 caratteri, voto complessivo 1–5 obbligatorio,
altri voti facoltativi. Una recensione per account/fiera/edizione: sono ammesse
più edizioni documentate nello stesso anno. Una recensione riferita al solo
anno impedisce ulteriori contributi per quell’anno, per evitare duplicati
ambigui. Massimo dieci pubblicazioni in 24 ore per account, blocco transazionale.
La partecipazione è dichiarata dall'autore, non certificata dalla piattaforma.

## Implementazione e manutenzione

- `js/fair-reviews.js`, `css/fair-reviews.css`: componente condiviso, tema
  personale, tastiera e movimento ridotto. Testo utente sempre escapato.
- `js/fair-review-editions.js`: stesso modello di date e anni in browser/API.
  Dati trasmessi dalle schede SSR e dal dettaglio del calendario.
- `api/saved-fairs.js?reviews=1` inoltra a `lib/fair-reviews.cjs`: nessuna nuova
  funzione Vercel. Metadati canonici dal catalogo o dagli eventi pubblicati;
  utente verificato prima di pubblicare. Risposte no-store.
- `PATCH_FIERE_RECENSIONI_20261104.sql` e
  `PATCH_FIERE_RECENSIONI_SEMPLICI_20261104.sql`: tabelle nello schema riservato
  `fair_review_private`, RLS attiva e nessun grant diretto ad anon/authenticated.
  RPC pubblica `read_fair_reviews` senza dati privati e scrittura autenticata
  `publish_fair_review`, identità da `auth.uid()`, telefono da profilo.
- Registro degli ID e delle edizioni del catalogo per rifiutare date/fiere inventate anche nelle
  chiamate RPC dirette. **Dopo aggiunte al catalogo**, eseguire
  `node scripts/fair-reviews-db.cjs --sync-catalog`; inserisce gli ID mancanti e
  aggiorna le date documentate, senza eliminare record o modificare recensioni. Gli eventi organizzatore si verificano
  direttamente sulle rispettive righe pubblicate.
- `node scripts/fair-reviews-db.cjs`: migrazione e fixture in transazione
  con ROLLBACK. `--apply` installa e sincronizza esplicitamente lo schema.
  Schema installato, 9.584 ID sincronizzati il 4 novembre; API reale di lettura
  verificata con conteggio zero. Nessun account o recensione reale di prova.

## Verifiche

`scripts/test-fair-reviews.cjs`: API reale con rete simulata e pagine/auth reali
in Chromium 1440/820/320 e WebKit 390. Copre passaggi, obbligatorietà,
registrazione soltanto alla fine, annullo/login/registrazione, recupero,
retry, pubblicazione, XSS, isolamento per fiera/account, logout durante
pubblicazione, paginazione, calendario, organizzatori, tema scuro e overflow.

SQL reale in ROLLBACK: grant/RLS, blocco anonimo, identità non falsificabile,
duplicati, più edizioni nello stesso anno, date future/inventate, anno senza
date inventate, client precedente, commento vuoto, limiti e aggregati pubblici.
Regressioni pagine fiere (9.584 schede), accesso fonti e fiere salvate passate.
Screenshot e revisione visiva diretta in `.local/verifiche/recensioni-fiere/`.
Conservati font, blu/inchiostro, controlli e temi del sistema esistente;
nessuna modifica a `DESIGN.md` o al suo sidecar necessaria.

Pubblicato `ce50ce9`, produzione Ready
`dpl_HkuKxf2K7v1mKh5XgHehMFb9PaN6`, alias `https://subingresso.it`.
Cinque asset online identici al commit, dettaglio SSR con componente presente,
API reale lettura pubblica 200/conteggio zero, pubblicazione anonima 401,
fiera inesistente 404 e metodo non ammesso 405. Percorso completo ripassato
sui file online nelle quattro combinazioni browser/formato, sessioni/backend
di scrittura simulati. Ulteriore controllo senza simulazioni su Chromium
1440/320 e WebKit 390: SDK reale, lettura pubblica e primi passi ospite,
nessun errore browser o overflow. Nessun account, recensione o invio reale
di collaudo. Backup remoto di sessione e ramo preventivo verificati.

Semplificazione successiva: migrazione applicata e 9.584 metadati sincronizzati.
L’unica recensione preesistente è invariata in ogni campo: conteggio e impronta
MD5 prima/dopo identici, senza stampare il testo. Bozze della versione a quattro
passaggi recuperate nella schermata finale; mese e testo originali preservati.
Controlli delle tre schermate e stelle in Chromium 1440/820/320 e WebKit 390;
prove in `.local/verifiche/recensioni-semplici/`. Esito pubblicazione da aggiornare.
