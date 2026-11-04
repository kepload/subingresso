
## Iscrizione e consultazione delle fonti — 19 ottobre 2026

Preferenza richiesta: «Consulta la fonte» richiede registrazione o accesso.
Invito gratuito con motivi concreti nel calendario, prima delle schede, e
nelle pagine autonome raggiunte da Google. Filtri e mappa conservano la
posizione precedente. Avvisi per bandi/posteggi presentati come da attivare
nel profilo, senza iscrizioni automatiche o promesse di posti/incassi.

Stesso controllo su fonti delle date, tariffe, partecipazione, affluenza e
articoli. `js/fiere-access.js` conserva fonte/fiera durante accesso e annullo;
chiude temporaneamente il dialog nativo per mostrare il modulo comune,
ripristina focus e scheda e rende il modulo scorrevole nei telefoni piccoli.
Fallback interni anche senza il nuovo script, nessun link diretto esterno
nelle pagine senza JS. `/api/fiere-source` verifica la sessione con Supabase
e accetta solo URL documentali associati alla fiera; risposte private/no-store.
Il catalogo e le fonti pubbliche non diventano dati riservati: è un requisito
di accesso alla consultazione dal sito. Nessuna modifica a dati, DB o email.

Cache: calendario JS86, accesso JS/CSS1; CSS calendario30 e JSON59 invariati.
Nuovo test `scripts/test-fiere-access.cjs`: percorso completo con UI auth
reale e backend simulato, annullo/errori/logout, fallback e script assente.
Aggiornate le asserzioni dei test ai link protetti; eliminati conteggi fissi
e data anteriore alla fonte aggiornata nella vecchia suite affinità.
Prove `Documents/verifica-fiere-iscrizione-20261019/`: percorso nuovo locale
e sugli asset pubblicati passato Chromium1440/820/320 e WebKit390, backend
simulato. Anonimi reali online, font/icone e modulo su Chromium1440/320 e
WebKit390 passati senza scritture; API reale401 senza sessione/invalida,
GET405/no-store. Calendario generale cinque formati, articoli/affinità e
ricerche quattro, affluenza/pagine tre e settori passati;4.923 pagine validate.
Scansione segreti passata con il binario del checkout principale.

Pubblicato `e479808`, Vercel READY `dpl_JAY2p4gGogJTRMoAxT111FJbQX2k`;
HTML, JS calendario/accesso e CSS accesso identici online al codice.
Nessuna registrazione, email o scrittura reale di prova. Checkpoint remoto
`backup/session-20261019-181848-fiere-iscrizione-fonti` verificato; noto
errore del cleanup locale. Branch preventivo remoto presente. Nessuna nuova
ricerca: catalogo e originali conservati, backup ricerche non necessario.
Nota operativa: produzione sul progetto Vercel `subingresso`, ID
`prj_QsyHcCh5m4DGRTclNKR6z8MtaRnm`; il `.vercel/project.json` locale
punta al vecchio progetto `subingresso.it` e non è stato modificato.
