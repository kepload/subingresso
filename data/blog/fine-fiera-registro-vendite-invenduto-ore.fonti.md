# Fonti e verifiche: registro di fine fiera

Articolo unico **19**, preparato il **23 novembre 2026** nel branch esclusivo `articolo/codex1-20261123-19`. Questa consegna riguarda solo la preparazione: nessun inserimento nel DB, push su main o modifica a documenti comuni.

## Duplicati e perimetro

Prima della stesura sono stati recuperati **147 post LIVE**, con sola lettura anonima dei campi slug, title ed excerpt. Nessun duplicato semantico del consuntivo dopo la fiera con conteggio di venduto/invenduto e ore. I temi più vicini sono `partecipare-fiera-incasso-minimo` (previsione prima di pagare), `due-fiere-stesso-fine-settimana-scegliere` (scelta preventiva tra eventi) e `comprare-giro-mercati-margini-ore-chilometri` (acquisto del giro). Qui si registrano dati effettivi di una singola edizione e si conserva la motivazione per tornare o cambiare.

Baseline e valutazione: `live-posts.json`, `duplicati.json` nel dossier privato assegnato. Nessuna statistica interna o vendita reale attribuita al sito.

## Fonti primarie e limiti

Tutte recuperate con **HTTP 200 il 23 novembre 2026**; originali, ricevute UTC, URL finali e SHA256 in `fonti-ricevute.json` nel dossier.

- [Department for Business and Trade, How to prepare for a trade show as an exhibitor](https://www.business.gov.uk/export-from-uk/learn/categories/prepare-sell-new-country/finding-customers-and-marketing-events/how-prepare-trade-show-exhibitor/), sezioni «Set goals to measure success» e «After a trade show»: obiettivi, resoconto e confronto dopo l'evento. Guida governativa britannica per export e fiere professionali, adattata esplicitamente al banco come metodo gestionale; non è una fonte su regole italiane o rendimenti garantiti.
- [Business.gov.au, Prepare for stocktake](https://business.gov.au/products-and-services/inventory-management/prepare-for-stocktake): conteggio fisico e verifica dei prodotti rispetto ai registri. Usata solo per il principio del controllo delle scorte; escluse le indicazioni fiscali australiane. Il costo dell'invenduto mostrato dal file è un dato gestionale, non una valutazione fiscale.
- [Progetti d'impresa, Vademecum per futuri imprenditori](https://www.bo.camcom.it/sites/default/files/promozione-interna/sportello-genesi/Progetti_d_impresa_Vademecum_per_futuri_imprenditori.pdf#page=43), Città metropolitana di Bologna, ospitato dalla Camera di commercio, **edizione settembre 2020**, pagina stampata 33 (PDF 43): costi variabili e margine di contribuzione. Documento di metodo, senza ricavarne aliquote o tariffe attuali. Le formule del registro sono una proposta redazionale, non un modello certificato dall'ente.

Il metodo somma il lavoro di tutte le persone e chiama il rapporto «residuo per ora di lavoro». Non lo presenta come stipendio, netto del titolare, utile fiscale o liquidità. Vendite e costi devono avere una base IVA coerente da verificare sul proprio caso. Nessuna affermazione su obblighi fiscali, adempimenti o scadenze nuove.

## Registro scaricabile

`downloads/registro-fine-fiera-vendite-invenduto-ore.xlsx`, sei fogli: Leggi qui, Merce, Ore, Bilancio, Esempio e Fonti. Celle gialle compilabili, formule visivamente distinte, convalide numeriche e aree di stampa. **20 righe prodotti/lotti**, quantità in pezzi interi; **12 righe attività/persona**, ore decimali. Una copia per ogni edizione.

Merce: portati, venduti e vendite euro al netto dei resi, scarti/perdite, rientrati contati e costo unitario. Controllo portato meno venduto meno scarti rispetto al rientro fisico. Lotti con costi diversi separati; i pezzi rientrati ancora vendibili sono mostrati al costo, senza sottrarli al residuo. Costo del venduto e degli scarti calcolati separatamente. Il Bilancio sottrae anche posteggio/servizi, viaggio/sosta, aiuti pagati e altre spese/quota generali. Non determina imposte, contributi o compenso proprio; costi già compresi non vanno duplicati.

Righe interamente vuote escluse, dati mancanti/testuali/negativi e quantità incoerenti bloccano i risultati dipendenti. Zero solo per voci verificate assenti; divisione per ore zero lasciata vuota. Le ore di tutti gli operatori comprendono anche gli aiuti già pagati nelle spese: misura della resa dell'intero lavoro, non paga individuale. Nessuna macro, connessione dati o collegamento a workbook esterni; solo tre hyperlink alle fonti, aperti su scelta del lettore.

**Esempio interamente inventato e separato:** 100 pezzi portati, 60 venduti, zero scarti, 40 rientrati; vendite 900 euro, costo unitario 6, costo venduto 360, altre spese 240. Residuo 300 su 20 ore = 15 euro per ora di lavoro; 240 euro di invenduto al costo tenuti separati. Non sono dati reali o promesse di guadagno.

**61 scenari e 9 risultati dell'esempio PASS**, con `formulas.ExcelModel` sulle 161 formule effettive del file e confronto con risultati aritmetici indipendenti. Inclusi campi vuoti, testi/negativi, quantità frazionarie o incongruenti, resi, scarti, scorte maggiori senza alterare il costo del venduto, nessuna vendita, zeri, decimali, perdita, due persone e ultime righe. Cache iniziali corrette, nessun errore formula; ZIP e convalide verificati. Non è stata usata un'installazione desktop di Excel. SHA256 finale XLSX: `4b0c43548df4e786e1ab7c6874b671fb4e5c0250718e80799f11ffeb0878a123`.

## Copertina e articolo

Copertina originale creata con skill `imagegen` e strumento integrato, **1600×900 WebP**; scena inventata dichiarata nell'articolo. [Prompt integrale](fine-fiera-registro-vendite-invenduto-ore.prompt.md). Originale PNG conservato nel dossier privato, nessun asset simulato.

Testo principale **2.928 caratteri, 462 parole**, sei h2, tre risposte iniziali, hook e aperture in grassetto. Due slot ADS identici al riferimento, inline e closing; CTA al registro, al calcolo prima di prenotare e agli annunci. Nessuna modifica a template, CSS, JS, API o servizi.

Anteprima SSR ottenuta con il renderer corrente, alimentato solo dal post preparato; regole ADS lette dal relativo endpoint pubblico. Titolo, descrizione, canonical, NewsArticle, sanificazione, due ADS e spazio Vetrine verificati. **Chromium 1440/768/320, WebKit 390 e Chromium 390 senza JavaScript: PASS**, senza overflow, errori JavaScript o asset locali mancanti. Screenshot desktop e mobili esaminati visivamente. Cinque download effettivi tramite HTTP locale identici all'XLSX finale per SHA256; richieste di scrittura analytics/provider intercettate. Nessuna scrittura reale dal browser.

L'anteprima usa una data dimostrativa del 23 novembre, non una prova di pubblicazione. Le prime verifiche private hanno corretto due limiti dell'harness: controllo della larghezza intrinseca con srcset e download annullato su risposta sintetica. La verifica finale usa dimensioni dell'asset e download reale da server locale; nessuna modifica al prodotto per adattarlo ai test.

## Consegna e ripresa

Backup preventivo verificato su origin: `backup/session-20261123-190040-articolo-19-preparazione`, HEAD iniziale `c0bc8d66a81d5f0be8569ccc895207aed4322e34`.

Dossier: `.local/lavori/articoli/20261123-codex1/articolo-19/`. Contiene job, fonti originali/ricevute, generatore, test, anteprima, screenshot, download di prova e rapporto `prepared.md`/`prepared.json` con hash definitivi dei sei file esclusivi. Gli script di verifica sono adattati dal dossier `netto-vendita-banco-20261113`; l'harness nuovo contiene solo la preparazione, senza modalità di pubblicazione o query mutative. Nessun archivio generale letto, nessun altro articolo sviluppato.

La pubblicazione resta al secondo incarico esplicito del coordinatore, nella stessa sessione e per questo solo articolo. Per ora non esistono verifiche di URL pubblico, deploy, inserimento o immutabilità dei post dopo pubblicazione.
