## Affluenza documentata — 17 ottobre 2026

Decisione corrente: descrivere soltanto il volume di pubblico. Nessun voto
su vendite, margini, organizzazione, notorietà o anzianità dell'evento.
I vecchi dati di rinomatezza restano archiviati e non alimentano i bollini.

Prima ricognizione mirata, non rappresentativa delle 4.214 fiere: 20 casi
con fonti già individuate o consuntivi ricercabili. Archivio separato per ID
stabile: `fiere-affluenza.json`, con 13 resoconti e sette esclusioni motivate.
I 13 resoconti producono quattro bollini e nove sezioni con il dato originale
senza fascia: non sono state inventate assegnazioni nei livelli media/bassa.

Le fasce **editoriali iniziali**, convenzionali e pubbliche, usano la media
per giornata effettiva di apertura: bassa sotto 1.000; media da 1.000 a meno
di 5.000; alta da 5.000 a meno di 20.000; molto alta da 20.000. Le soglie
descrivono volumi assoluti; non densità per metro, clienti per banco o vendite.
Il primo gruppo, dominato da grandi eventi con comunicati pubblici, non è
una calibrazione statistica nazionale. Soglie e versione del metodo vanno
rivalutate esplicitamente quando il campione sarà più ampio.

| Fiera | Dato dell'edizione | Esito iniziale |
| --- | --- | --- |
| San Faustino, Brescia 2026 | oltre 200.000 presenze in un giorno, cronaca locale, metodo non pubblicato | molto alta, **stima riportata** |
| Godega 2026 | 100.000 presenze in tre giorni dichiarate dal Comune | molto alta, **dato dichiarato** |
| FAZI 2025 | oltre 42.000 presenze in tre giorni, consuntivo organizzatore | **almeno** alta, dato dichiarato |
| Tempo Libero 2026 | quasi 40.000 ingressi in quattro giorni, consuntivo organizzatore | alta, dato dichiarato approssimativo |

Nessuno dei quattro casi è presentato come conteggio certificato. Il dato
“quasi 40.000” resta approssimativo; “oltre” è un limite minimo e il bollino
indica “almeno” quando potrebbe essere superata anche la fascia successiva.
Unità originali, area coperta, periodo, fonte, data di consultazione e note
sono accessibili nel dialog e nella pagina autonoma. Le anteprime e i popup
mostrano soltanto le fasce assegnabili, senza righe vuote per gli altri casi.

Visitatori non definiti, visitatori unici e passaggi restano separati da
ingressi/presenze. Non si dividono persone uniche per giorni per ottenere
accessi medi. Scope dell'intera festa o conteggi parziali non producono un
bollino. Alba: 90.000 ingressi riferiti al Mercato, calendario 2025 non
verificato qui, quindi nessuna divisione per tutti i giorni di calendario.
Scandicci: il totale della Fiera non viene trasferito al Fierone del giovedì.
AcquariaItalia: il dato pubblico riguarda il 19–20 settembre, senza B2B del 21.
Pordenonelegge: stima del festival diffuso, senza attribuzione all'area vendite.

I dati scadono dopo al massimo due anni dall'edizione e al termine della
revisione, fissata inizialmente al 17 aprile 2027. Se il catalogo contiene
un'edizione successiva già conclusa, il bollino precedente si sospende e
il dato storico resta leggibile con anno. Nuovi dati richiedono un nuovo
riscontro, non una rivalutazione automatica tramite parole nel nome.

Originali e manifest con stato HTTP e SHA256 fuori dal repository:
`Documents/ricerca-affluenza-fiere-20261017/sources-1792224624229/`.
La rivista Confcommercio su Bovimac è indicizzata ma il PDF diretto risponde
404: usato il resoconto Radio Pico con intervista al presidente della Fiera.
DaniReef diretto risponde 403: usata la pagina ufficiale AcquariaItalia.
VeronaNetwork diretto 403, testo indicizzato consultato soltanto per motivare
l'esclusione dei dati percentuali e delle porzioni, senza assegnare un voto.
Non sono stati contattati organizzatori, associazioni o ambulanti.

Verifiche: build, validazione delle prove, confini delle quattro fasce,
unità e scope non confrontabili, scadenze, iniezione HTML/URL, preservazione
dei campi precedenti e interazioni browser in `scripts/test-fiere-attendance.cjs`.
La copertura resta parziale e dovrà proseguire con consuntivi equivalenti.

Pubblicazione d3d36e2, Vercel READY dpl_7yVZ4YRacJNdyDuBU3gY69TLw8MF.
HTML, JavaScript, entrambi i CSS e catalogo online identici al commit.
Verificate le 13 pagine autonome e le interazioni sul sito pubblico con
Chromium 1440/320 e WebKit 390; build, settori, pagine, archivio dei vecchi
bollini e suite calendario su cinque formati/browser passati localmente.
Preservati tutti i campi precedenti delle 4.214 manifestazioni.
