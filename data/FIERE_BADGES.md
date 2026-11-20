# Bollini iscrizioni e hobbisti nelle anteprime

## Ricerche T/U/V del 20 novembre 2026

Sessanta nuove fiere ricercate, venti per sessione. Quattro fatti circoscritti
superano il riesame delle prove; per le altre 56 nessun nuovo bollino.
La ricerca del gruppo V non ha prodotto conferme pubblicabili: la candidata
Bigolada è stata esclusa per contrasto fra regolamento storico e servizio SUAP.

| Fiera | Bollino | Edizione e limite |
|---|---|---|
| Model Expo Italy, Verona | Iscrizioni aperte | 6–7 marzo 2027; termine 26 febbraio 2027 senza ora. Nuovi espositori previa prequalifica e verifica dei prodotti. |
| Esotika Pet Show, Gonzaga | Hobbisti ammessi | Solo 13–14 novembre 2027, fuori dai cinque mesi prioritari; privati senza partita IVA, massimo tre tavoli e sola merce di seconda mano senza regolare posizione commerciale. |
| Vinitaly, Verona | In scadenza · collettiva TNO | Solo collettiva CCIAA Toscana Nord-Ovest dell’11–14 aprile 2027: imprese di Pisa, Lucca e Massa Carrara con i requisiti della circolare; termine 27 novembre 2026 ore 12:00. Non riguarda le altre aree della fiera. |
| Santa Caterina, Roverè della Luna | Hobbisti ammessi | Solo area hobbisti in piazza Unità d’Italia, 22 novembre 2026 ore 9–18; distinta dal mercato commerciale. Il programma non garantisce ammissioni individuali o posti. |

Le date, le fonti e le note indispensabili sono aggiornate nei soli quattro
record interessati; conservati i 10.443 ID e le altre 10.439 schede.
`fair-participation.js` lega le due ammissioni a fonte, nota, sede e snapshot
delle edizioni. Le due nuove finestre in `fair-badges.js` richiedono anche
snapshot, sede ed esatta data dell’edizione: non basta lo stesso anno.
Gli altri record mantengono il comportamento precedente.

Senza ora pubblicata Model Expo si spegne all’inizio del 26 febbraio, fuso Roma;
Vinitaly si spegne alle 12:00 del 27 novembre. La dicitura «collettiva TNO»
resta nel bollino compatto, con requisiti territoriali nella scheda. Nessun
nuovo bollino di spunta o di incertezza. Le condizioni sono leggibili anche
senza JavaScript e non dipendono dal passaggio del puntatore.

Fonti: [Model Expo](https://www.modelexpoitaly.it/per-partecipare/),
[date Model Expo](https://www.modelexpoitaly.it/informazioni-generali/),
[form Esotika 2027](https://www.esotikapetshow.it/prenotazione-spazi-2027/)
e relativo [regolamento](https://www.esotikapetshow.it/wp-content/uploads/REGOLAMENTO_FIERE_ESOTIKA.pdf),
[collettiva Vinitaly](https://tno.camcom.it/fiere/2027/vinitaly-2027) con circolare e modulo,
[programma comunale Santa Caterina](https://www.comune.roveredellaluna.tn.it/Vivere-il-Comune/Eventi/Fiera-di-Santa-Caterina)
e locandina collegata. Atti successivi e secondo riesame nei dossier privati
`.local/ricerche/fiere-20/20261120-TUV-brescia/`; controllo ulteriore del
coordinatore in `coordinamento/prove-T/` e `coordinamento/prove-U/`.
Download diretti Model Expo 403 registrati; pagine primarie rilette con lo
strumento web e copie della sessione T conservate. PDF Esotika, circolare
Vinitaly e locandina comunale ricontrollati visivamente.

Pubblicazione T/U/V: `09dff1e`, Vercel `dpl_8ZXyeH9vs1bGVqwqvGXCkUWAyZyX` READY, dominio e asset conformi. Build, regressioni, 10.443 pagine e quattro casi online in lista/mappa/scheda, Chromium 1440/320 e WebKit 390, temi chiaro/scuro e HTML senza JS: PASS.

## Solo bollini documentati negli spazi esistenti — 20 novembre 2026

La richiesta corrente sostituisce la precedente scelta degli stati sempre
visibili: **nessun bollino «Spunta da verificare» o «Hobbisti da verificare»**.
Quando manca una conferma non si mostra un bollino, senza dedurne un divieto.
I bollini utili stanno nella riga dei tag già presente in basso nelle anteprime,
con il formato compatto precedente (11 px); la mappa usa lo stesso renderer.
Rimosse la sezione centrale delle anteprime e quella subito dopo la data nella
scheda. Condizioni e limiti documentati restano nel testo della partecipazione
e nelle Fonti, anche senza JavaScript: non dipendono dal passaggio del puntatore.

`js/fair-participation.js` unifica le conferme precedenti e sette riesami
documentali locali. Una conferma richiede fonte e nota immutate, snapshot
immutato delle edizioni e corrispondenza dell'intera edizione selezionata.
Date, aree o condizioni diverse fanno sparire il bollino. Gli eventi degli
organizzatori non ereditano le prove del catalogo. Una mancata conferma non
produce mai un divieto. Ammissione, prenotazione e posto libero restano distinti.

Ogni futura ricerca richiesta comprende applicazione e pubblicazione dei
bollini documentati, senza una seconda conferma. Prima di pubblicare occorrono
fonte primaria effettivamente letta, passaggio e localizzatore, data, edizione,
sede, area/categoria e condizioni, controllo di rettifiche e un secondo riesame.
Una fonte generica, uno snippet, un modulo senza anno o un'altra edizione non
bastano. Prove parziali consentono soltanto un'affermazione esatta e delimitata;
incertezze e contrasti restano nei dossier. Procedura permanente in
[FIERE_RICERCA_20.md](FIERE_RICERCA_20.md#prove-necessarie-per-un-bollino).

Correzione pubblicata con `607d3eb`, Vercel
`dpl_Fw2q3RyNvYTQMaScsSm6quvXTEfn` READY sul dominio il 20 novembre 2026.
Cinque asset conformi; controlli online PASS Chromium 1440/390 e WebKit 390,
lista/mappa/scheda e HTML server. Localmente PASS 10.443 pagine e bollini a
1440/768/390/320 nei due temi. Prove private in
`.local/worktrees/bollini-puliti-20261120/.local/verifiche/bollini-puliti/`.

| Fiera | Informazione aggiunta | Limite visibile |
|---|---|---|
| Sant'Andrea, Concesio | Spunta con graduatoria | 30/11/2026; rettifica 821 del 16/11, graduatoria già pubblicata, nuovi accessi da verificare |
| Fiera dell'Uva, Gussago | No spunte | Solo area mercatale di Piazza Vittorio Veneto, 27/09/2026; punto 8 del bando |
| Natale, Castegnato | Hobbisti ammessi | Creazioni proprie; termine prorogato al 15/11/2026, trascorso |
| Natale, Paitone | Hobbisti ammessi | 13/12/2026; termine domanda 15/11/2026 trascorso |
| Mercatini patronali, Coccaglio | Hobbisti ammessi | 22/11/2026; solo prenotati, iscrizioni chiuse per raggiunto limite |
| Antiquariato, Desenzano | Spunte ammesse | Edizioni 2026 documentate; entro 8:30 sui soli posti liberi, merce conforme |
| Vintage, Desenzano | Spunte ammesse | Edizioni 2026 documentate; entro 8:30 sui soli posti liberi, esclusi prodotti nuovi |

Regole e condizioni sono leggibili nella scheda; le prove aggiuntive sono
nelle Fonti con il consueto accesso. Castegnato: avviso e modulo recuperati
il 20 novembre; proroga conservata nella pagina acquisita il 15, oggi 404.
Gussago: pagina comunale attuale e copia del bando del 15 novembre, oggi non
più recuperabile allo stesso URL temporaneo. Paitone, Coccaglio, Desenzano e
la rettifica di Concesio riletti online. Prove, limiti e verifiche private in
`.local/verifiche/stati-fiere-20261120/` nel worktree dei bollini.

Non è un import delle 340 ricerche private né un giudizio sulla redditività.
Catalogo, ID, prezzi, calendari e dati degli utenti restano quelli esistenti.
Verifiche: `scripts/test-fair-participation.cjs`, test browser dei bollini e
test delle pagine fiera, con provider isolati e controlli senza JavaScript.

Decisione del 15 novembre 2026: aggiungere «Iscrizioni aperte», «In scadenza»
e «Hobbisti ammessi». Escluso il bollino della corrente. Restano i bollini
«Spunte ammesse» e le informazioni già presenti sulle schede.

## Divieti espliciti - 16 novembre 2026

Richiesta corrente: rendere immediatamente visibili anche «No spunte» e
«No hobbisti» nei casi già documentati. La prima copertura comprende cinque
divieti di spunta e due esclusioni degli hobbisti, riesaminati sulle fonti
primarie; non è un'inferenza dall'assenza dei bollini positivi.

| Bollino | Fiera | Edizione autorizzata dalla prova |
|---|---|---|
| No spunte | San Martino, Gattinara | 10 novembre 2026 |
| No spunte | Gran Balòn, Torino | 11 ottobre 2026, regolamento 284 art. 11.4 |
| No spunte | Lo Martchià de Tsalende, Nus | 6 dicembre 2026, decreto 1/2026 punto 3 |
| No spunte | Immacolata Concezione, Popoli Terme | 8 dicembre 2026, avviso punto 10 |
| No spunte | Sant'Agostino, San Gimignano | 29 agosto 2026, divieto comunale specifico |
| No hobbisti | Mostra dell'Usaa, Azzate | 25 ottobre 2026 |
| No hobbisti | Castello in Fiera, Fénis | 11-12 aprile 2026 |

`denialRecords` in `js/fair-badges.js` conserva ID, fonte e nota esatte del
catalogo, snapshot delle edizioni, chiavi delle singole date, URL della prova,
localizzatore, data di consultazione e ambito. Le pagine di Comune/organizzatore
e i PDF sono stati riletti; per Nus, Popoli e Torino anche controllo visivo.
Copie e decisioni private: `.local/verifiche/divieti/` in questo worktree.
Il testo al passaggio del puntatore specifica data e ambito del divieto.

Il bollino negativo richiede l'edizione selezionata esatta. Non si trasferisce
al 2027, a una nuova data del 2026 o alle precedenti edizioni di Azzate.
Se cambiano fonte, nota o elenco delle edizioni, sparisce fino alla revisione.
Gli eventi degli organizzatori restano esclusi. Un divieto positivo e il suo
opposto non vengono mostrati insieme.

Esclusi dai bollini generici: Lucca (restrizione condizionata all'iscrizione
CCIAA), Spazio4 (solo SpazioStore e alcune categorie), Ozieri (soli stalli
esterni), Patrica (regolamento storico non riconfermato), saloni di Cremona
(«nessuna spunta automatica» non dimostra un divieto). Domanda preventiva,
posti esauriti o mancata menzione degli hobbisti non producono bollini negativi.

Stesso renderer di lista e mappa, rosso tenue e parole esplicite, senza nuove
icone o azioni. Tema scuro, contrasto minimo 4,5:1 e impaginazione stretta
sono controllati nel test esistente `scripts/test-fiere-spunta.cjs` insieme
alla conservazione dei bollini positivi, all'invalidazione delle prove e
all'isolamento di data/edizione.

### Pubblicazione dei divieti

Implementazione `27b2d93`, Vercel `dpl_3h4Z9i6o5FitmrFWxkTfH4KrkFb8`
READY e associata a `subingresso.it` il 16 novembre 2026. HTML e quattro
asset identici ai sorgenti. PASS le cinque configurazioni del test specifico
sia localmente sia sul dominio: Chromium 1440/768/390/320 e WebKit 390,
temi chiaro/scuro, lista/mappa, contrasto e assenza di sovrapposizioni.
Controllate anche 10.443 pagine, navigazione senza JavaScript e intervalli
di ricerca. Provider isolati: nessun account, invio o scrittura di prova.
Catalogo e servizi invariati. Ricevuta privata:
`.local/verifiche/divieti/deployment.json` nel worktree dei bollini.

## Consolidamento del 18 novembre 2026

Aggiunti «No hobbisti» a Levico Terme (modulo espositori 2026) e «Hobbisti
ammessi» alla sola area separata della Fiera dei Ciucioi di Lavis, con ambito
esplicito nel testo del bollino. Entrambi dipendono dall’edizione documentata
e dalle prove esatte: non si trasferiscono a nuove date o all’anno seguente.
Per Lavis `hobbyEditionKeys`, `editions` e `hobbyScope` delimitano la conferma;
i record precedenti senza queste proprietà mantengono il comportamento esistente.
Spunta commerciale di Lavis da confermare; scadenze della sola area hobbisti
non trasferite al resto della fiera. Condizioni, limiti e aggiornamento delle
26 schede nel [dossier](fiere-dossier/consolidamento-26-fiere-20261118.md).

## Dati e significato

`js/fair-badges.js` contiene conferme esplicite legate a ID, URL della fonte
e testo esatto delle modalità di partecipazione. Prima copertura: **91
ammissioni hobbisti** e **23 finestre di domanda** documentate nel catalogo.
Non è una nuova ricerca delle fonti esterne né un controllo di posti liberi.

- **Hobbisti ammessi:** il documento prevede questa categoria, talvolta con
  tesserino, prodotti propri, residenza o altri requisiti. Il bollino non
  sostituisce tali condizioni. Nessuna deduzione da «hobbistica» nel tema o
  dall'invito a chiedere se gli hobbisti siano ammessi.
- **Iscrizioni aperte:** domanda prevista dalla documentazione e termine
  ancora valido per l'edizione selezionata. Il record conserva il primo
  giorno noto della finestra: data iniziale esplicita, quando pubblicata,
  altrimenti data della verifica del modulo/invito già disponibile secondo
  il catalogo. Quest'ultima non è presentata come data ufficiale d'apertura.
- **In scadenza:** negli ultimi sette giorni sostituisce «Iscrizioni aperte»;
  i due stati non compaiono insieme. Dopo il termine spariscono entrambi.

Le domande per il 2027 non producono un bollino sull'edizione 2026. Il
termine di pagamento di Ghemme e la data contraddittoria di Borriana sono
esclusi dalle finestre. Per gli hobbisti: esclusi i divieti di Azzate e
SpazioStore a Piacenza, l'ammissione da chiedere a Salsomaggiore e la sezione
Cittaslow di Greve riservata agli artigiani all'opera. Non trasferire regole
fra fiere, categorie o sezioni diverse.

Il fuso è **Europe/Rome**. Con ora finale pubblicata, il bollino si spegne
a quell'ora; senza ora, per prudenza si spegne all'inizio del giorno della
scadenza. Non resta visibile fino a mezzanotte presumendo un orario assente.
Domande, selezione e disponibilità rimangono distinte: il bollino non conferma
un posto né un esito favorevole della domanda.

Una modifica di fonte o nota invalida tutte le conferme della scheda; una
modifica della scadenza invalida la finestra, senza trasformarla in quella
dell'anno seguente. Nuovi documenti richiedono una revisione esplicita del
record e aggiornamento del riferimento `?v=`. Gli eventi degli organizzatori
non ereditano le conferme del catalogo editoriale.

## Interfaccia e verifica

Lista e riquadri della mappa usano lo stesso renderer: blu tenue per domande
aperte, ambra tenue per la scadenza, verde tenue per gli hobbisti. Le parole
rendono lo stato comprensibile senza distinguere i colori; disposizione a capo
sui telefoni e tema scuro. Nessun nuovo pulsante o passaggio di conferma.

Gli stati vengono ricalcolati ogni 30 secondi con pagina visibile e quando
si torna sulla pagina; si aggiornano solo i contenitori dei bollini, senza
ricreare le schede o spostare il focus. Se il modulo manca, la ricerca resta
disponibile con le altre informazioni e il precedente bollino spunta.

`scripts/test-fiere-spunta.cjs` copre ora tutti i bollini, con orologio
controllato e risposte isolate per autenticazione, recensioni e organizzatori.
Controlli su soglia di sette giorni, cambio giorno a Roma, ora finale,
pagamenti e dati incerti, edizione, scadenza e prove modificate, lista/mappa,
focus, contrasto almeno 4,5:1 e layout a 1440/768/390/320 px Chromium e
390 px WebKit. Prove private sotto
`.local/worktrees/bollino-spunte-20261115/.local/verifiche/spunta/`.

## Pubblicazione verificata

Implementazione `9f95cb3`, Vercel `dpl_65LdXCcdYQtML3Ddbogcxgs3ADMb` READY
su `subingresso.it` il 15 novembre 2026. HTML e quattro asset conformi ai
sorgenti; tutte le cinque configurazioni del test PASS sia localmente sia sul
dominio pubblico, con orologio e provider isolati. PASS anche intervalli di
ricerca, 10.443 pagine fiera, navigazione senza JS, sitemap e gitleaks.
Catalogo, SQL e servizi non modificati. Stato e verifica degli asset in
`.local/verifiche/bollini/deployment.json` nel medesimo worktree.
