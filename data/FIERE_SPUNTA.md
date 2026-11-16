# Bollino «Spunte ammesse» nelle anteprime

Richiesta del 15 novembre 2026: nelle anteprime delle fiere che prevedono la
spunta mostrare un bollino verde tenue «Spunte ammesse». Dal 16 novembre
sono autorizzati anche i divieti espliciti «No spunte», descritti in
[FIERE_BADGES.md](FIERE_BADGES.md). L'assenza di bollini comprende anche
informazioni insufficienti e non prova un divieto.

## Regola dei dati

`js/fair-spunta.js` contiene conferme esplicite per ID, con URL della fonte
e copia esatta delle modalità di partecipazione del catalogo. La prima
revisione comprende **168 schede**, incluse le nove fiere comunali di Brescia.
Si tratta di una lettura dei dati già documentati, non di una nuova verifica
delle fonti esterne o della disponibilità attuale.

Il bollino appare solo se ID, fonte e nota coincidono ancora. Una modifica
alle condizioni o alla fonte lo nasconde fino a nuova revisione. Non cercare
la sola parola «spunta» nel testo, non dedurre l'ammissione dalla categoria,
da un calendario o dall'assenza di divieti. Restano esclusi richiami generici
al SUAP, divieti, informazioni soltanto storiche non confermate, rinvii senza
nuovo avviso e note riferite a un'altra fiera.

In particolare, niente conferma per San Luca a Sezze dalla nota della Croce,
per la Fiera agricola di Chiavari dalla nota di Sant'Antonio, per le altre
fiere di Cervia dall'orario di Cervia Mare, né per San Serafino a Montegranaro
dall'avviso precedente al rinvio. Alla Cattedrale di Pistoia resta distinto
il percorso della fiera in centro.

Il bollino descrive la modalità prevista, con i requisiti e le restrizioni
della singola scheda. Non significa iscrizioni aperte, accesso senza domanda
o posteggio garantito; vale per l'edizione o il regolamento documentati.
Nuove edizioni e cambiamenti di disciplina richiedono una revisione esplicita
della conferma. Gli eventi degli organizzatori non ereditano le conferme del
catalogo editoriale.

## Interfaccia e manutenzione

- `fiere.html` carica il modulo prima del calendario; le pagine autonome
  ereditano lo stesso template, senza una seconda implementazione.
- Il calendario mostra il bollino accanto alla categoria nella lista e nei
  riquadri della mappa. Testo leggibile anche senza distinguere il verde,
  fondo tenue, nessuna icona o animazione aggiuntiva.
- Gli indicatori vanno a capo sui telefoni stretti; «Apri scheda» resta
  separato e disponibile. Il tema scuro usa verde chiaro su fondo verde scuro.
- Se manca il modulo, il calendario resta utilizzabile senza bollini.
- Aggiornare il riferimento `?v=` del modulo quando cambiano le conferme;
  mantenere invariati i dati del catalogo non coinvolti.

Verifica: `scripts/test-fiere-spunta.cjs` controlla casi positivi e negativi,
invalidazione delle prove, lista e mappa, apertura scheda, contrasto almeno
4,5:1, assenza di sovrapposizioni e overflow a 1440/768/390/320 px in Chromium
e a 390 px in WebKit. Autenticazione, recensioni e organizzatori simulati:
nessuna scrittura, iscrizione, email o richiesta di spunta reale.

Prove private nel worktree
`.local/worktrees/bollino-spunte-20261115/.local/verifiche/spunta/`.
Passati anche i controlli delle 10.443 pagine fiera, navigazione senza JS,
sitemap, dettaglio e intervalli di ricerca. I vecchi test affluenza e articoli
hanno aspettative superate (`Dato, fonte e criterio` e `#article-summary`, già
assenti prima della modifica): limiti registrati, nessun intervento estraneo.

## Pubblicazione verificata

Implementazione `05baf58`, Vercel `dpl_12miimRALXiUCpbmk8mvw6MKrDNt` READY e
associata a `subingresso.it` il 15 novembre 2026. HTML e tre asset pubblicati
identici ai sorgenti. Ripetute con esito PASS tutte e cinque le configurazioni
del test specifico sul dominio pubblico, con gli stessi provider simulati.
Scansione gitleaks dell'intero commit PASS. Catalogo, SQL, servizi e dati degli
organizzatori non modificati.
