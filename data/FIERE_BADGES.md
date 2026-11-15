# Bollini iscrizioni e hobbisti nelle anteprime

Decisione del 15 novembre 2026: aggiungere «Iscrizioni aperte», «In scadenza»
e «Hobbisti ammessi». Escluso il bollino della corrente. Restano i bollini
«Spunte ammesse» e le informazioni già presenti sulle schede.

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
