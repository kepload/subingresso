# Schede fiere essenziali — 7 novembre 2026

Nuova richiesta: una scheda generale leggibile scorrendo, con pochi comandi,
spaziature uniformi e nessuna ripetizione. Supera la disposizione con pannello
iscrizione e ricerche multiple del dossier 124; conserva l’accesso obbligatorio
prima dell’apertura di una fonte esterna.

## Modello comune

- Titolo, città/provincia, date con il loro stato e prodotti; descrizione,
  luogo, orari e altri dati presenti sono già aperti, senza riquadri colorati.
- Un solo pulsante «Cerca altre fiere in zona»: provincia e mesi della scheda.
  Rimosse le alternative per regione, provincia senza mesi e annunci.
- Salva e promemoria conservano le due icone. L’iscrizione è una riga semplice,
  senza pannello promozionale o secondo comando Accedi; l’accesso resta nel
  modulo abituale. Nessun avviso o consenso attivato implicitamente.
- Partecipazione e costi sono sezioni di testo con stessi titoli e spaziature.
  Prezzi e limiti verificati restano integri; in assenza di importi, soltanto
  «Da verificare con l’organizzatore». Nessun riquadro vuoto o tariffa inventata.
- La descrizione non viene ripetuta quando è già il prefisso esatto della nota
  di partecipazione. La data principale compare una volta; altre edizioni sono
  una lista semplice, quando esistono. Articoli documentati e affluenza sono aperti.
- Le recensioni si raggiungono scorrendo, senza il rimando aggiuntivo in alto.
  Rimosso il link che riapriva la stessa scheda.
- Una fonte principale discreta in fondo. Eventuali documenti distinti e note
  metodologiche sono nell’unico approfondimento «Fonti»; URL duplicati rimossi,
  inclusa l’eventuale coincidenza tra procedura, calendario e tariffe.

## Implementazione e vincoli

`js/fair-detail.js` contiene il modello comune a SSR e calendario, inclusa
l’affluenza. Rimossi i due renderer separati di quest’ultima. Stili del dettaglio
in `css/fiere.css`, con token e temi esistenti; eliminata la classe che attivava
il riquadro azzurro dei costi. Il calendario esterno al dettaglio non è ridisegnato.
I collegamenti agli eventi degli organizzatori rimangono interni.

Corretta anche una sovrapposizione emersa durante la registrazione da campanella:
il caricamento tardivo del catalogo non riapre più la fiera già selezionata sopra
il modulo di accesso o promemoria. Prova ripetibile con catalogo trattenuto fino
all’apertura della registrazione, seguita da rilascio e annullo.

Catalogo/ID, recensioni, salvataggi, avvisi, consensi, API e database conservati.
Le fonti esterne seguono il percorso interno e la verifica account del dossier124;
anche Ctrl+clic e assenza di JavaScript non producono un link esterno diretto.
Contenuto SSR, indirizzi/canonical, condizioni di indicizzabilità e filtri
restano quelli esistenti. Nessuna nuova ricerca editoriale o automazione.

## Verifiche

Suite ingresso, fonti/accesso, tutte le pagine/SEO, articoli/filtri,
organizzatori, salvataggi e recensioni, con browser e API simulate dove si scrive.
10.443 pagine e 5.546 voci fiere sitemap al controllo. Verificati un solo percorso
di ricerca, informazioni aperte, assenza del permalink/rimando recensioni,
deduplica fonti, conservazione di luogo/orari e note d’affluenza, costi senza
sfondo anche nel tema scuro. Prova visuale reale Vittoria a1440/768/390/320,
tema chiaro/scuro; percorsi Chromium e WebKit secondo suite.

Prove private `.local/verifiche/fiere-minimali-20261107/`. Inspector e detector
estesi includono anche gradienti, microtesti e pannelli preesistenti del calendario;
la sovrapposizione è il dialog richiesto, il font è quello di DESIGN.md.
Backup remoto di sessione e ramo pre-intervento verificati prima delle modifiche.

Pubblicato `f8e86ba528256a1b085f0d36bf9a2cd81eab7179`, controllo
[Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/3KcMQ2VvgVqqZsVveN8razHEboiA).
Cinque asset online identici ai blob Git; sei risposte SSR su tre fiere con/senza
parametri, canonical, singola ricerca e deduplica corretti. Suite ingresso
ripetuta online Chromium1440/768/320 e WebKit390, compreso catalogo tardivo
durante l’accesso. Prova con SDK/icone reali nei due temi a quattro larghezze;
controllo specifico di costi e fonte in fondo su due schede mobili scure.
Ricevuta `published.json`, screenshot e misure nella cartella privata delle prove.

## Schede utili anche ai visitatori — 9 novembre 2026

Intervento richiesto soltanto sulle schede aperte, senza estendere il lavoro a
home, calendario, elenchi, SEO o nuove funzioni. Modello comune SSR/client in
`js/fair-detail.js`, riferimento cache aggiornato in `fiere.html`.
Etichetta della disponibilità allineata anche nell'aggiornamento della scheda
gestita in `js/pages/fiere.js`, compreso singolare/plurale; cache aggiornata.

- Prima date e stato, descrizione, luogo/orari, «Prodotti e settori», articoli e
  organizzatore. Rimossa l'etichetta «Per il tuo banco»; i campi assenti non
  producono informazioni o sezioni vuote. Valori e descrizioni conservati.
- Altre edizioni e affluenza documentata precedono le informazioni professionali.
- Organico dei posteggi e disponibilità degli eventi gestiti sono dentro la
  partecipazione degli espositori. Esaurimento esplicitamente riferito ai
  posteggi; scadenze precedute da «Iscrizioni espositori».
- «Costi per esporre» indica le tariffe del banco. Nessuna deduzione sul costo
  d'ingresso del pubblico. Condizioni, importi, note, fonti e date restano integri.
- Ricerca locale, Salva/campanella, accesso alle fonti e recensioni professionali
  conservati. Nessuna modifica al catalogo, alle API o al database.

Backup remoto `backup/session-20261109-200131-schede-fiere-visitatori` verificato.
Suite ingresso Chromium1440/768/320 e WebKit390 passata; suite pagine con
10.443 schede e 5.546 voci fiere sitemap passata, inclusi dati mancanti, prezzi,
assenza JS e escaping. Suite SEO passata. Controllo visivo su tre fiere a
1440/768/390/320 nei due temi, senza overflow. Inspector conserva le stesse
segnalazioni del calendario preesistente e della sovrapposizione del dialog;
nessun ridisegno fuori perimetro. La preview statica non serve le API delle
recensioni: eventuali errori locali di quel blocco non sono dati di produzione.
Prove private `.local/verifiche/schede-fiere-visitatori-20261109/`.

Pubblicato `805c3808352e07f8b9906dd36a47cd6bc12d8e35`, controllo
[Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/DoSt8jc4JG8tfKr5YABb841h2zD8).
Tre asset online identici ai blob Git; tre schede SSR con nuove etichette
verificate. Suite ingresso ripetuta online Chromium1440/768/320 e WebKit390,
passata anche senza JS e con catalogo tardivo. Controllo visivo online con
SDK/icone reali a1440/390 nei due temi, senza overflow. Ricevuta `published.json`
e catture online nella cartella delle prove. Catalogo e dati persistenti invariati.
