# Recensioni delle fiere — 4 novembre 2026

Richiesta: percorso a passaggi come «vendi posteggio», con barra di progresso,
registrazione soltanto alla fine e recensioni dentro il contesto della fiera.

## Percorso e contenuti

- Stesso componente nel dettaglio del calendario, nelle pagine `/fiere/:id`
  e negli eventi pubblicati `/evento?id=...`. Collegamento alle recensioni
  vicino all'intestazione della scheda del catalogo.
- Quattro passaggi: mese e settore del banco; esperienza complessiva e
  valutazioni facoltative; racconto e consiglio; riepilogo, dichiarazione di
  partecipazione e pubblicazione. Si può tornare indietro e modificare.
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
- Nome di battesimo, mese, settore, voti e testo sono pubblici. Email,
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

Mese tra gennaio 2000 e il mese attuale in Europa/Roma; per un evento
organizzatore deve corrispondere alle date pubblicate e l'evento deve essere
già iniziato. Testo 40–2.000 caratteri, voto complessivo 1–5, altri criteri
facoltativi. Una recensione per account/fiera/anno; massimo dieci pubblicazioni
in 24 ore per account, con blocco transazionale contro richieste concorrenti.
La partecipazione è dichiarata dall'autore, non certificata dalla piattaforma.

## Implementazione e manutenzione

- `js/fair-reviews.js`, `css/fair-reviews.css`: componente condiviso, tema
  personale, tastiera e movimento ridotto. Testo utente sempre escapato.
- `api/saved-fairs.js?reviews=1` inoltra a `lib/fair-reviews.cjs`: nessuna nuova
  funzione Vercel. Metadati canonici dal catalogo o dagli eventi pubblicati;
  utente verificato prima di pubblicare. Risposte no-store.
- `PATCH_FIERE_RECENSIONI_20261104.sql`: tabelle nello schema riservato
  `fair_review_private`, RLS attiva e nessun grant diretto ad anon/authenticated.
  RPC pubblica `read_fair_reviews` senza dati privati e scrittura autenticata
  `publish_fair_review`, identità da `auth.uid()`, telefono da profilo.
- Registro degli ID del catalogo per rifiutare fiere inventate anche nelle
  chiamate RPC dirette. **Dopo aggiunte al catalogo**, eseguire
  `node scripts/fair-reviews-db.cjs --sync-catalog`; inserisce solo ID mancanti,
  senza eliminare record o recensioni. Gli eventi organizzatore si verificano
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
duplicati, date future, ID canonici, dichiarazione, limiti e aggregati pubblici.
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
