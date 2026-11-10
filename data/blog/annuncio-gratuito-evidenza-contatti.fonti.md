# Fonti e limiti — annuncio gratuito o in evidenza

Articolo sviluppato il **10 novembre 2026** dalla priorità 31 dell'elenco, su richiesta dell'utente di sviluppare uno degli articoli. Scelta editoriale: aiutare chi vende un posteggio a confrontare la spesa monetaria e la qualità delle richieste ricevute. Nessun uso di statistiche private, casi clienti o risultati commerciali non documentati.

## Fonti primarie

- [Google Ads, definizione di azione di conversione](https://support.google.com/google-ads/answer/6032150?hl=it): una chiamata e un acquisto sono esempi di azioni distinte. Impiegata solo per spiegare la distinzione tra passaggi. Non si attribuiscono a Google i criteri editoriali di contatto pertinente, le formule del file, un metodo sperimentale o funzionalità di misurazione di Subingresso.
- [Garante Privacy, principi fondamentali del trattamento](https://www.garanteprivacy.it/home/principi-fondamentali-del-trattamento): minimizzazione e limitazione della conservazione. Il file richiede solo conteggi aggregati, senza nomi, telefoni o copie delle chat. Non propone nuovi strumenti di tracciamento né una valutazione completa degli obblighi del singolo venditore.
- [Pubblicazione su Subingresso](https://subingresso.it/vendi): pubblicazione gratuita verificata sulla pagina corrente. Vetrina nell'area personale riscontrata nell'implementazione e nel contratto `data/VETRINE_PREMIUM.md`. Nessun listino congelato nell'articolo, nessuna offerta di acquisto o modifica a prezzi, pagamenti, giorni acquistati o promozioni.

Tre fonti raggiunte HTTP 200 il 10 novembre 2026. Copie, URL, orario UTC e SHA256 in `.local/lavori/articoli/annuncio-gratuito-evidenza-20261110/fonti-ricevute.json`.

## Metodo ed esempio

Confronto descrittivo tra due finestre, senza attribuzione causale o promessa di vendita. Criterio editoriale di pertinenza uguale nei due gruppi; ogni persona conta una volta nell'intero confronto, nel gruppo del primo contatto. Anche le visite successive appartengono al medesimo gruppo. Periodi con gli stessi giorni della settimana, condizioni e intervallo di osservazione; festività, modifiche e canali sovrapposti da annotare. Provenienza non nota distinta da attribuzione alla promozione. Nessuna soglia consigliata di investimento o aumento automatico della spesa.

Esempio **inventato**, non listino, caso reale o stima di mercato. Gratis: 30 giorni, zero spesa monetaria, 10 persone nuove, tre pertinenti, una visita conclusa. In evidenza: 30 giorni, 100 euro di spesa totale, 20 persone nuove, otto pertinenti, due visite concluse. Costo per pertinente **12,50 euro**, costo per visita **50 euro**. Nessun costo incrementale attribuito ai cinque pertinenti in più. Tempo personale escluso; nessun calcolo di ricavo, utile o ROI.

## File gratuito e verifica

`downloads/confronto-annuncio-gratuito-evidenza.xlsx`: Istruzioni, Confronto vuoto, Esempio separato. Date come annotazione testuale; sette input numerici per periodo: giorni, pubblicazione, promozione, altre spese attribuibili, persone nuove, pertinenti, persone con visita conclusa. Spese sulla stessa base IVA e senza duplicazioni. Una sola visita conteggiata per persona pertinente. Il foglio non decide se un costo è fiscalmente detraibile o deducibile.

Controlli nelle formule oltre alle convalide delle celle: giorni interi 1–366, costi 0–1.000.000 ciascuno, conteggi interi 0–1.000.000, visite ≤ pertinenti ≤ persone. Numeri mancanti o incoerenti lasciano vuoti tutti i risultati. Denominatori zero producono un messaggio, senza divisioni per zero. Risultati: somma dei costi, persone/giorno, pertinenti/giorno, quota pertinente, costo per pertinente e per visita. Nessuna macro, connessione dati o riferimento a cartelle esterne; solo collegamenti documentali scelti dall'utente. Ricalcolo automatico e risultati iniziali in cache per le anteprime.

**56 scenari superati** con `formulas.ExcelModel` sulle formule lette dall'XLSX, confrontate con aritmetica Python indipendente: 14 casi su entrambe le colonne di entrambe le schede. Coperti esempio, zero risultati, zero visite, durata e voci di costo diverse, campi vuoti, testo, importi negativi, giorni nulli/frazionari/eccessivi, conteggi incoerenti e persone frazionarie. Controllati anche archivio ZIP, modello vuoto, formule conservate e risultati in cache. Generatore, esiti e hash nel dossier privato. SHA256 definitivo: `27681631d30323f6cdc6b5b83c3cd1d1e0681b9f46e4ef053cf3a590b0a6727e`.

## Articolo e copertina

Sei sezioni, circa 680 parole incluse pubblicità e fonti, tre punti iniziali. Due slot contestuali `inline`/`closing` e spazio Vetrine dal rendering esistente; nessuna modifica di interfaccia o template. Rimando alla guida già pubblicata per correggere l'annuncio, download gratuito e collegamento alla pubblicazione.

Copertina originale creata con la skill imagegen e lo strumento integrato, senza scritte: scena inventata dichiarata IA nell'articolo. WebP 1600×900; prompt integrale nel file `.prompt.md`, originale nel dossier privato.

Prima della scrittura rilevati **131 articoli**, nessun duplicato pertinente; contenuti precedenti salvati privatamente per il confronto dopo l'inserimento. Schema corrente verificato, slug univoco e nessun trigger sulla tabella `blog_posts`. Backup remoto preventivo `backup/session-20261110-220139-articolo-annuncio-gratuito-evidenza` verificato su origin, HEAD `775c2ab`.

Anteprima passata in Chromium 1440/768/320 e WebKit 390, più lettura senza JavaScript: copertina, sei sezioni, collegamento al file, canonical, NewsArticle, due ADS pertinenti e nessun overflow. Tutte le scritture del browser intercettate; nessuna email, contatto o acquisto di prova. Pubblicazione e riscontri online da registrare al completamento.
