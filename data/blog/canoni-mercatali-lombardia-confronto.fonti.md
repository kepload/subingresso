# Canoni mercatali lombardi: fonti, calcoli e limiti

Priorità 22 del piano. Ricerca e sviluppo del 7 novembre 2026 in sessione
separata. Sei sezioni, 629 parole visibili; due slot ADS contestuali inline e
closing già usati dal blog, senza modifiche al template o al sistema Vetrine.
Titolo approvato conservato integralmente. Nessuna scrittura DB da questa
sessione: pubblicazione e verifiche online coordinate dalla sessione principale.

## Metodo di confronto

Scenario tecnico omogeneo: banco non alimentare di 20 m², 52 presenze, 6 ore
intere per presenza. Categorie locali più alte dove applicabili: A a Monza,
I a Brescia; categorie non equivalenti per pubblico o valore commerciale.
Le 52 presenze e le 6 ore non sono calendari o orari certificati di tutti i
mercati reali. Distinte occupazioni temporanee ricorrenti e canone annuale
permanente; nessuna divisione artificiosa dell'annuo per 52.
Totali prima di arrotondamenti del versamento, extra separati, nessuna quota
rifiuti aggiunta automaticamente. Non classifica di redditività o preventivo.

## Fonti primarie

### Monza: conferma 2026 e tariffa già ridotta

- [Scheda comunale corrente](https://comune.monza.it/it/servizi/canone-unico-patrimoniale-e-mercatale):
  dichiara espressamente applicabili nel 2026 le tariffe approvate dalla Giunta
  con deliberazione n. 29 del 28 gennaio 2025. Non presentata come delibera 2026.
- [Delibera e tariffario](https://municipium-images-production-autopilot.s3.eu-south-1.amazonaws.com/s3/4470/allegati/servizi/tributi-finanze-e-contravvenzioni/delibera-giunta-n-29-del-28-01-2025.pdf):
  pagina 30 del PDF, allegato pagina 21 di 23, tabella 21 beni durevoli:
  categoria A 0,732 euro/m²/giorno, B 0,600, C 0,499, D 0,383.
  Le riduzioni sono già riflesse nelle tariffe finali: nessun ulteriore 30%
  sottratto. Nota sotto tabella: fino a 9 ore tariffa/24×ore effettive;
  frazioni d'ora arrotondate all'ora successiva. Fasce oltre 9 ore esistenti
  escluse dal calcolatore, che accetta solo ore intere da 1 a 9.
  Calcolo indipendente: 0,732÷24×6×20×52 = **190,32 euro**.
- PDF scaricato HTTP200, SHA256
  `3e31cf42bee9b8019000a5ce3529ed932c30bc755370637502d1676c8dee7276`;
  pagina 30 resa immagine e letta visivamente nel dossier privato.

### Olginate: frazionamento e riduzione del 30%

- [Scheda tariffe 2026](https://www.comune.olginate.lc.it/amministrazione/documenti_e_dati/documenti_tecnici_di_supporto/documento_215.html),
  [servizio comunale corrente](https://www.comune.olginate.lc.it/servizi/tributi_finanze_e_contravvenzioni/servizio_43.html):
  delibera Giunta n. 129 del 5 novembre 2025 per l'anno 2026, allegato A,
  pagina 11 PDF, posto fisso coefficiente 1,25 e tariffa sviluppata 0,75 euro.
  Spunta separata: forfait 8 euro/giorno indipendentemente dai m².
- [Regolamento mercatale vigente collegato dal Comune](https://www.comune.olginate.lc.it/amministrazione/documenti_e_dati/atti_normativi/documento_213.html):
  modifica C.C. n. 3 del 4 aprile 2023, pagina 10 PDF, art. 9 comma 6:
  tariffa giornaliera divisa in ventiquattresimi; mercato cittadino 7:30–14:00,
  6 ore e mezza. Art. 10 commi 1–2: massimo 9 ore, riduzione 30% per
  ricorrenza settimanale/giornaliera. Calcolo comune con 6 ore, diverso
  dall'orario reale esplicitato: 0,75÷24×6×0,70×20×52 = **136,50 euro**.
- Originali recuperati con l'azione di download pubblica della pagina
  (`SCHIOCCIOLA`/`EGDOCVISJS.HBL`, sola richiesta del file, nessuna istanza o
  contatto inviato). URL generato dal sito conservato nella ricevuta privata.
  Il lettore web non apre l'URL di download; HTTP200 diretto con originale
  PDF verificato localmente. Tariffario SHA256
  `78bd1834c27c28eb5ad2d59fb5f68c228dadc7a7851b82fbf017bee228bc5773`.
  Pagine tariffario 10–11 e regolamento 10 rese in immagini; tariffario 11
  e regolamento 10 letti per controllare unità, riduzione e orario.

### Brescia: tariffa oraria, tipologia e ricorrenza

- [Pagina comunale corrente](https://comune.brescia.it/it/documenti_pubblici/canone-concessione-mercati),
  aggiornata il 26 marzo 2026; distingue il canone mercatale dal CUP generico.
  Anche la pagina CUP 2026 è stata controllata: gli allegati A/B/C del CUP
  non sono stati sostituiti al tariffario mercatale.
- [Tariffario mercati attualmente collegato](https://comune.brescia.it/s3/906/allegati/docpubbl/trib/canone-concessione-mercati/tariffe-canone-concessione-mercati.pdf):
  pagina unica, categoria I 0,068 euro/m²/ora, coefficiente di tipologia 0,50
  alla voce occupazione mercati/posteggi isolati oltre 31 giorni. La nota
  prescrive tariffa della categoria stradale × coefficiente tipologia.
  Usato il valore orario pubblicato 0,068, senza ricostruirlo a diversa
  precisione dal giornaliero. Categorie II/III/IV non selezionate.
- [Regolamento aggiornato efficace dal 1 gennaio 2026](https://comune.brescia.it/s3/906/allegati/docpubbl/fiscalit/reg-canone-concessione-mercati.pdf):
  C.C. n. 25 del 28 aprile 2025; art. 9 comma 5: in assenza di aggiornamento
  annuale si applicano le tariffe già in vigore. Art. 10 commi 1–2, pagine
  6–7 PDF: frazionamento orario fino a 9 ore; riduzione 40% sui mercati
  ricorrenti, calendarizzati oltre 15 giorni/anno con cadenza settimanale
  o giornaliera. Riduzione distinta dal coefficiente tipologia oltre 31 giorni.
  Calcolo nell'ipotesi esplicita scelta: 0,068×0,50×0,60×6×20×52 =
  **127,296**, mostrato **127,30 euro**. Non tariffa nuova deliberata nel 2026,
  ma tariffa vigente collegata dal Comune con disciplina aggiornata 2026.
- Tariffario scaricato HTTP200 e controllato visivamente; regolamento
  originale scaricato e pagine 6–7 conservate come immagini. Applicabilità
  della categoria e dei coefficienti da verificare sul caso concreto.

## File scaricabile e verifiche

`downloads/calcolatore-canoni-mercatali.xlsx`, tre schede:

1. Confronto: esempio precaricato, ingressi azzurri e formule visibili.
   I coefficienti restano espliciti e modificabili: il file non decide la
   classificazione giuridica quando cambia il numero delle presenze.
2. Il tuo mercato: modello vuoto con tariffa netta per m²/presenza da ottenere
   dal conteggio comunale, superficie, presenze ed extra separati. Extra
   ignoti non equivalgono a zero: totale con extra vuoto finché non compilati.
3. Istruzioni e fonti: condizioni d'uso, limiti e collegamenti ufficiali.

Formule eseguite dal motore `formulas.ExcelModel`, 18 scenari verificati con
attesi indipendenti `Decimal`: tre importi pubblicati, superficie dimezzata,
presenze zero, dati mancanti/negativi, ore zero/oltre limite/frazionate,
presenze frazionate, divisore zero, tariffa zero esplicita, coefficiente
Brescia cambiato, modello vuoto, extra ignoti/zero/50 ed esenzione.
Assenza di macro, connessioni dati ed externalLinks nel pacchetto XLSX.
Report completo in `.local/lavori/articoli/canoni-mercatali-lombardia-confronto/verifica-calcolatore.json`.

Copertina originale con imagegen integrato, WebP 1600×900 e dicitura IA
nell'articolo. Prompt completo nel file `.prompt.md` omonimo; originale
nel dossier privato. Scena inventata, nessun mercato reale documentato.

## Limiti ed esiti di ricerca

Lazzate è stato controllato e poi escluso dal confronto: tariffario 2026
scaricato e pagina mercati letta, ma non abbastanza esplicito per ricostruire
senza ambiguità il rapporto fra importi esposti e frazionamento/riduzioni.
Non usati prezzi inferiti o quote prive di unità confermata.
Il browser web non recuperava il blog; catalogo controllato tramite API
pubblica in sola lettura. Nessun articolo dedicato allo stesso confronto,
distinto da costi generici e guida canone/TARI già presenti.
Prove SSR/browser e verifica di pubblicazione a cura del coordinatore.
