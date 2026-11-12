# Fonti e limiti: confronto dei candidati all'affitto

Preparato il **12 novembre 2026**, priorità **32** dell'elenco editoriale,
su incarico di sviluppare un solo articolo. Il tema 14 resta aperto: il confronto
aggiornato tra ricerche e offerta non è acquisibile durante il disservizio e
le ricerche geografiche non documentano una domanda per settore.
Il coordinatore ha confermato l'assegnazione della voce 32; la 33 è di un'altra sessione.

## Fonti primarie consultate

- [Comune di Paderno Dugnano, subentro nel commercio su aree pubbliche](https://www.comune.paderno-dugnano.mi.it/servizi/imprese-e-commercio/dettaglio-servizio/Commercio-al-dettaglio-su-aree-pubbliche-su-posteggio-in-concessione-segnalare-il-subentro-il-trasferimento-di-sede-il-cambiamento-di-ragione-sociale-la-sospensione-dellattivita-e-la-cessazione/):
  distinzione tra requisiti personali e professionali per l'alimentare,
  documenti e canale SUAP. Pagina aggiornata il 29 maggio 2026, servizio attivo.
  Esempio locale esplicitamente distinto dalle procedure degli altri Comuni;
  nell'articolo non si fissano scadenze, costi, rinnovi o avvii automatici.
- [Registro Imprese, visura ordinaria e storica](https://www.registroimprese.it/visura-camerale-ordinaria-storica-e-certificato):
  contenuto informativo su impresa, attività e cariche. La visura non è
  presentata come certificazione di solvibilità o verifica dei singoli candidati.
- [Fondazione Italiana del Notariato, affitto d'azienda](https://elibrary.fondazionenotariato.it/articolo.asp?art=26/2602):
  inquadramento dell'azienda e distinzione dall'uso di un singolo spazio.
  Riferimento dottrinale, senza estendere al caso concreto tutte le conclusioni
  del contributo o introdurre clausole contrattuali da firmare.
- [Garante Privacy, principi del trattamento](https://www.garanteprivacy.it/home/principi-fondamentali-del-trattamento):
  dati necessari, accessi e conservazione limitati; i codici A/B non rendono
  anonimo un confronto riconducibile a persone. Il modello non risolve tutti
  gli obblighi di informativa e base giuridica.

Tutte e quattro le pagine acquisite HTTP 200 il 12 novembre 2026.
URL, orari UTC, copie e SHA256 in
`.local/lavori/articoli/affitto-confronto-candidati-20261112/fonti-ricevute.json`.
Le pagine di Milano (403) e NormeLombardia (risposta «Request Rejected», anche
con HTTP 200) non sono state usate come prova di consultazione integrale.
La ricerca web mostrava estratti ufficiali dell'art. 25 lombardo; l'articolo
evita di ricavarne termini procedurali senza lettura completa.

## Metodo editoriale e scheda

Sei sezioni, circa 640 parole incluse le ADS renderizzate e le fonti;
tre risposte iniziali, due spazi pubblicitari esistenti e slot Vetrine conservato.
Non modifica template, moduli, pagamenti, annunci, utenti, invii o servizi.
Confronto tra la stessa attività e condizioni, con passaggi distinti:
Da chiedere, Dichiarato, Ricevuto, Verificato, Non pertinente motivato.
Documento mancante non equiparato a inaffidabilità; nessuna selezione
automatica, soglia di solvibilità o criterio basato su caratteristiche personali.

L'esempio A **1.200 euro/mese** e B **1.100 euro/mese** è inventato.
Garanzia promessa per A, bozza ricevuta per B: nessuno è già approvato.
Canone, deposito e fideiussione restano distinti; importi, durata e condizioni
sono punti da esaminare con il professionista, senza minimi standard o
garanzie di recupero. Requisiti e pratica concreta rinviati al SUAP competente.

`downloads/confronto-candidati-affitto-posteggio.xlsx`:
Istruzioni, Confronto vuoto, Esempio separato e Fonti.
Quattordici voci e 56 celle vuote nel modello; riscontri testuali e stati
a tendina. Nessuna formula, macro, connessione, allegato incorporato,
punteggio o invio automatico. Riferimenti documentali separati e dati essenziali.
Verificati contenitore ZIP, schede, celle vuote, convalide a blocco,
intestazioni di stampa, assenza di formule/connessioni/collegamenti esterni
di calcolo, valori e stati dell'esempio. I link alle fonti restano normali link
documentali aperti dall'utente. Generatore e ricevuta `verifica-scheda.json`
nel dossier privato; nessun test di calcolo necessario per questa scheda.

Copertina originale con skill imagegen e strumento integrato, WebP 1600×900.
Scena inventata dichiarata nell'articolo; prompt nel file `.prompt.md` e
originale nel dossier privato. Nessuna fotografia di candidati o affitti reali.

## Backup e verifiche

Backup preventivo su origin verificato:
`backup/session-20261112-231714-articolo-priorita-blog-20261112`, HEAD `ed172fe`.
Primo push del tag rifiutato per errore temporaneo GitHub 500; secondo riuscito,
tag remoto verificato con `ls-remote`. Modifiche estranee conservate.

Anteprima con codice SSR corrente: Chromium 1440/768/320 e WebKit 390,
più lettura senza JavaScript. Controllati sei titoli di sezione, download,
copertina, title/description/canonical/NewsArticle, due ADS e slot Vetrine;
nessun overflow o errore JavaScript. Scritture browser intercettate.
Regole contestuali vuote come fixture dichiarata, con selezione predefinita:
le regole live non sono certificate durante l'indisponibilità del database.

## Stato della pubblicazione

**In attesa del database: non dichiarato pubblicato.**
REST Supabase HTTP 522; query Management, anche `SELECT 1`, HTTP 544 per
timeout di connessione; blog pubblico HTTP 503. Progetto segnalato
ACTIVE_HEALTHY dall'API di gestione, dato che non prova la disponibilità SQL.
[Incidente ufficiale Supabase: Database Connection Errors](https://status.supabase.com/incidents/01M78QJT3GQX4V7VV88MBTQ5X3)
in corso durante i controlli. Nessun riavvio, modifica di configurazione
o aggiramento del servizio tentato.

Lo snapshot del 10 novembre e il registro non mostrano il tema tra gli
articoli precedenti; manca ancora il controllo live completo di duplicati,
schema e trigger. Nessun INSERT eseguito prima di tali verifiche.
URL previsto, **non ancora pubblicato**:
`https://subingresso.it/blog?post=affitto-posteggio-confrontare-candidati`.
Materiali, controlli e stato finale nel dossier privato indicato sopra;
la voce 32 va spuntata soltanto dopo inserimento e verifica della pagina live.

**Materiali salvati e distribuiti:** commit `70142c0` su origin/main,
Vercel riuscito `8nuyXZoHHtJwTsnP9iDDzVBdQBrS`. Copertina e XLSX online
HTTP 200 con SHA256 identici ai file locali. Il successo del deploy dei file
non equivale alla pubblicazione dell'articolo nel database. Ultima verifica
servizi alle **22:29 UTC del 12 novembre**: REST 522, SQL 544 per timeout,
blog 503. Non eseguiti INSERT, controlli live di indice/sitemap del nuovo post
o confronto finale completo degli articoli preesistenti. Nessun ciclo attivato.
