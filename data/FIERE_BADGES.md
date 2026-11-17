# Bollini iscrizioni e hobbisti nelle anteprime

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
aperte, ambra tenue per la scadenza, grigio azzurro per gli hobbisti. Le parole
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
