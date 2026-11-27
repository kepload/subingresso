# Fonti e limiti | articolo 46

Verifica: 27 novembre 2026. Destinatari: ambulanti ed espositori che preparano merce per una fiera italiana. Nessuna intervista, prova sul campo o statistica di vendita. Categoria Fiere: guida interamente dedicata alla preparazione e al consuntivo di una fiera; contratto `data/FAIR_SIGNUP_BADGE.md`, nessuna whitelist modificata.

## Fonti primarie

- **GS1 Italy**, [Quando cambiare il codice EAN su un prodotto](https://gs1it.org/assistenza/codici/quando-cambiare-codice-ean-prodotto/), lettura diretta HTTP 200 il 27 novembre 2026. Passaggio pertinente: «identificare univocamente i capi per modello, taglia e colore». Sostiene la separazione delle varianti; non impone l'acquisto di codici per usare questo foglio. Il codice del file è interno e non genera GTIN. Ricevute `gs1.html`, `gs1.txt`, `fonti-ricevute.json` nel dossier privato.
- **Ge.Fi., Artigiano in Fiera 2026**, [portale espositori](https://pass.artigianoinfiera.it/index.html) e [Regolamento generale italiano, versione 1](https://pass.artigianoinfiera.it/pdf/AF26%20Regolamento%20Generale_IT_versione%201.pdf), entrambi recuperati HTTP 200. Art. 24.2, p. 14 del PDF: «orari d’ingresso; porte di ingresso; sosta dei veicoli» nelle avvertenze trasmesse dall'organizzatore. Non ricava finestre di rifornimento precise: serve la comunicazione riferita alla partecipazione. Documento e testo estratto conservati nel dossier come `regolamento-af26.pdf` e `.txt`.
- **Artigiano in Fiera**, [formazione espositori](https://info.afexhibitors.artigianoinfiera.it/it/video-tutorial), consultata via web il 27 novembre 2026. Presenta sezioni su obiettivi prima della fiera, offerta, allestimento e logistica. Pagina di contesto; video non utilizzati come prova di contenuti non trascritti. Non fornisce quantità raccomandate per il singolo banco.

## Fonte esclusa

Il [regolamento tecnico Fieramilano](https://www.fieramilano.it/content/dam/fieramilano/documenti/sicurezza-e-ambiente---documento-tecnico/Regolamento_tecnico_ITA-EN.pdf) è apparso nella ricerca con un passaggio sul rifornimento. La lettura web diretta restituisce 403; il download Node HTTP 200 contiene soltanto una pagina di blocco Incapsula (212 byte). Non è una verifica del PDF. Il primo tentativo di estrazione è fallito e il testo estratto è vuoto. Fonte quindi esclusa dalle affermazioni pubbliche e dal foglio, sostituita dal regolamento AF2026 effettivamente leggibile. Conservati tentativi e limiti nelle ricevute; nessuna conferma di fasce orarie.

## Metodo del foglio

Calcolo aritmetico della redazione, senza modello di domanda: liberi = giacenza iniziale meno impegni altrove; partenza più unico rifornimento previsto non possono superare i liberi. Il rifornimento non confermato riserva comunque merce ma non copre l'obiettivo. Obiettivo e riserva sono input dell'utente. Mancanti = massimo fra zero e obiettivo più riserva meno copertura confermata. Nessun ordine automatico.

Peso e volume per pezzo sono misurati dall'utente e comprendono l'imballaggio. Due controlli separati per partenza e unico rifornimento, anche se quest'ultimo non è confermato. Limiti disponibili per la merce inseriti dopo le verifiche del mezzo; nessuna certificazione di portata, distribuzione o incastro reale.

Consuntivo indipendente dal Piano: carico e arrivi effettivi più resi vendibili meno vendite lorde dei resi e altre uscite. Non misura vendite perse, tempi di esaurimento, ricavi o domanda futura. Venti varianti, un deposito e un rifornimento; istruzioni per più viaggi nel foglio Guida. Esempio separato, inventato, escluso dai totali.

## Originalità e verifiche

Lettura LIVE di 161 titoli prima della scrittura: nessun tema duplicato fra scorte, taglie e riassortimenti; slug assente. Nuovo controllo immediatamente prima dell'INSERT. Solo sei file propri, template e servizi conservati. Verifiche e hash finali nel dossier `.local/lavori/articoli/20261127-codex2-cinque/articolo-46/`: `verifica-formule.json`, `anteprima-verificata.json`, `online-verificata.json`, ricevute DB/deploy e consegna. Le verifiche sono dichiarate concluse soltanto dalle rispettive ricevute.
