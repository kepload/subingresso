# Fonti e verifiche: market privato e posteggio comunale

Articolo unico **25**, preparato il **23 novembre 2026** nel branch `articolo/codex1-20261123-25`. Questa consegna riguarda soltanto la preparazione: nessuna pubblicazione e nessun accesso diretto al database.

## Tema e duplicati

Letto l'indice pubblico LIVE di **147 post**, con slug, titolo ed estratto; le descrizioni delle schede compatte sono state integrate dai metadati delle relative pagine pubbliche. Nessun doppione semantico sul confronto diretto tra market privato e posteggio comunale per costo, durata e possibilità di cessione.

Gli articoli più vicini trattano separatamente canoni mercatali lombardi, costo del posteggio, affitto sostenibile, durata delle concessioni e fiere. Qui si confrontano invece natura dell'accordo, voci da chiedere, scadenza e condizioni di trasferimento. Non si ricavano prezzi di mercato, convenienza economica o disponibilità di posti.

Elenco e valutazione in `blog-live-elenco.json`, `blog-live-ricevuta.json` e `duplicati.json` nel dossier privato assegnato.

## Fonti primarie consultate il 23 novembre 2026

Tutte le fonti utilizzate sono state scaricate **HTTP 200** e lette nel testo effettivo. Originali, estratti, data UTC, URL e SHA256 sono conservati in `fonti-ricevute.json` nel dossier.

- [East Market, pagina espositori](https://eastmarketmilano.com/evento/espositore/): iscrizione valida per l'evento corrente e selezione dell'organizzatore. Esempio circoscritto a un solo market; nessuna regola generale sulla durata dei contratti privati. I 5 euro citati altrove nella pagina sono il biglietto visitatori, non una quota per il banco: non vengono usati.
- [Comune di Brescia, canone mercatale](https://www.comune.brescia.it/it/documenti_pubblici/canone-concessione-mercati): superficie, durata, tipologia e zona come fattori del canone. La pagina contiene anche valori base e informazioni storiche: non sono presentati come tariffa attuale di un banco né come prezzo nazionale.
- [Legge 214/2023, articolo 11](https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2023-12-30;214~art11), commi 1 e 4: nuove concessioni decennali con selezione e distinzione dai titoli esistenti. Testo mostrato in vigore dal 31 dicembre 2023. Non si promettono rinnovi, proroghe o dieci nuovi anni con l'acquisto. La durata concreta va verificata con titolo, atti applicabili e SUAP.
- [Codice civile, articolo 1406](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=1406&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=2&atto.codiceRedazionale=042U0262&atto.dataPubblicazioneGazzetta=1942-04-04): disciplina ordinaria della cessione del contratto con prestazioni corrispettive non ancora eseguite e consenso dell'altra parte. Non viene estesa automaticamente alla locazione commerciale o alla cessione d'azienda. Il primo URI di ricerca aveva aperto il decreto di approvazione: escluso, sostituito con l'articolo effettivo dell'allegato, `tipoArticolo=2`.
- [Comune di Brescia, assegnazione e subingresso](https://www.comune.brescia.it/it/servizi/servizio-mercati-e-fiere): area anche privata nella disponibilità comunale, requisiti e trasferimento di azienda o ramo con documentazione. Esempio amministrativo locale; termini e modalità locali non sono generalizzati a tutte le regioni.

Le indicazioni sui preventivi e la scheda sono strumenti redazionali per raccogliere dati. Non si attribuiscono importi reali a organizzatori o Comuni. Nessun contatto o modulo è stato inviato.

## Risorsa gratuita

`downloads/confronto-market-privato-posteggio-comunale.xlsx`, cinque fogli: **Leggi prima, Confronto, Esempio inventato, Documenti, Fonti**.

Un periodo comune e due alternative. Sedici input numerici inizialmente vuoti; giornate intere maggiori di zero, importi non negativi. Tutte le voci vanno compilate, usando zero solo dopo verifica. Risultati dipendenti vuoti con dati mancanti, testo, negativi o giornate non valide.

Costi complessivi = sei voci, con eventuale acquisto iniziale contato interamente; costo medio = costi divisi per giornate previste; denaro da impegnare = costi più cauzione restituibile. Nessun ammortamento fiscale, incasso, margine o prezzo di rivendita calcolato. Le istruzioni distinguono questi conti dal bilancio completo dell'attività e richiamano le spese già incluse, per evitare doppioni.

Esempio interamente inventato e separato: privato, 300 euro su 3 giornate = 100 euro a giornata, cauzione 100 e impegno 400; comunale, 600 su 12 = 50 euro a giornata, cauzione 200 e impegno 800. Nessuna cifra è una tariffa effettiva.

**140 scenari superati**, formule lette dal file e valutate con `formulas.ExcelModel` contro aritmetica Python indipendente. Controllati vuoti, testo in ogni input, numeri come testo, negativi, zeri, giornate frazionarie o nulle, decimali e costi iniziali elevati. Verificati cache iniziali, esempio, ZIP, convalide, aree di stampa e assenza di macro o connessioni. Ricevuta `verifica-formule.json`; download effettivo in WebKit identico al file distribuito.

## Copertina e anteprima

Copertina originale generata con skill `imagegen` e strumento integrato, convertita in **WebP 1600×900**. Scena inventata dichiarata nell'articolo. [Prompt integrale](market-privato-posteggio-comunale-confronto.prompt.md).

Articolo di **2.778 caratteri** di testo, con sei sezioni, tre risposte iniziali, due slot ADS identici al riferimento e CTA pertinenti. **Cinque percorsi superati**: Chromium 1440/768/320, WebKit 390 e Chromium 390 senza JavaScript. Rendering SSR corrente, titolo, descrizione, canonical, NewsArticle, immagine caricata, due ADS contestuali e assenza di overflow o errori JavaScript verificati. Screenshot desktop e 320 esaminati visivamente. Link verso annunci e pubblicazione HTTP 200.

Anteprima su server privato `127.0.0.1`, chiuso al termine. Scritture browser e chiamate provider intercettate; regole ADS lette dalla sola API pubblica. Il download WebKit è stato verificato dal server locale perché l'intercettazione di una risposta su URL di produzione non garantiva il download locale. La dimensione fisica della copertina è verificata sul file; `naturalWidth` nel browser varia correttamente con il `srcset`.

Backup preventivo remoto verificato: `backup/session-20261123-191616-articolo-25-market-privato`, baseline `c0bc8d66a81d5f0be8569ccc895207aed4322e34`. Solo sei file esclusivi dell'articolo; nessuna modifica a template, codice, main, database o documenti comuni. Preparazione completa e impronte definitive in `prepared.json` e `prepared.md` nel dossier privato.
