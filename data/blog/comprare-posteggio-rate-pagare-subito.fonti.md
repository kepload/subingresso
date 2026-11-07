# Fonti e limiti: comprare un posteggio a rate o pagare subito

Priorità 21 approvata dall'utente; sviluppo in sessione separata il **7 novembre 2026**. Taglio pratico per acquisti professionali di attività ambulanti: confronto tra prezzo immediato e prezzo dilazionato, esborsi nominali, interessi, spese, maxirata e disponibilità iniziale. Nessuna offerta di credito o consulenza sul singolo contratto.

## Fonti primarie verificate

- [Camera di commercio di Bolzano, *Linee guida per il finanziamento delle imprese*](https://www.camcom.bz.it/sites/default/files/uploaded_files/sviluppo_impresa/Leitfaden%20Finanzierung%20IT.pdf), seconda edizione ottobre 2021, pp. 18–19: capitale da restituire, interessi, commissioni, TAN/TAEG, ammortamento a rata costante e altre forme. Documento istituzionale usato per concetti generali, **non come fotografia dei tassi nel 2026**. Originale PDF HTTP200, testo e immagine della pagina 18 conservati nel dossier privato; pagina verificata anche con screenshot web.
- [Banca d'Italia, glossario TAN e TAEG](https://economiapertutti.bancaditalia.it/strumenti/glossario/index.html?com.dotmarketing.htmlpage.language=1&letter=T): TAN riferito agli interessi, differenza rispetto al costo complessivo e possibile costo positivo anche con TAN zero. Non si attribuisce al simulatore un TAEG legale né si impone un documento da credito al consumo a ogni imprenditore.
- [Banca d'Italia, credito ai consumatori](https://economiapertutti.bancaditalia.it/aree-tematiche/prestiti/credito-ai-consumatori/): uso personale/familiare distinto da attività imprenditoriale o professionale; tutele dei consumatori non automaticamente estese alle imprese. L'esempio è esplicitamente un acquisto professionale. Non si afferma che un venditore non finanziario possa addebitare interessi o spese in qualunque dilazione al consumatore.
- [Consiglio Notarile di Milano, massima I.16](https://www.consiglionotarilemilano.it/massime-registro-imprese/i-16/), approvata il 6 marzo 2013: cessioni con condizioni e riserva di proprietà nella prassi. Usata per invitare a definire momento del trasferimento e accordi col notaio. Nessuna regola sul subingresso amministrativo desunta automaticamente dal contratto civile; verifiche SUAP lasciate al caso specifico. Non riportati termini procedurali storici come novità del 2026.

Tutte e quattro raggiungibili HTTP200 il 7 novembre 2026, con URL, copie integrali, dimensioni e hash in `.local/lavori/articoli/comprare-posteggio-rate-pagare-subito/fonti-ricevute.json`.

## Esempio e simulatore

Esempio **inventato**, non dato di mercato: 28.000 euro pagamento subito; prezzo dilazionato 30.000, anticipo 10.000, venti rate mensili da 1.000, TAN 0%, maxirata 0, spese iniziali 300, incasso 2 per rata. Spese comuni ipotetiche 1.200 in entrambe le scelte. Totale subito **29.200**, totale rate **31.540**, differenza **2.340**. Disponibilità iniziale 35.000: residuo subito 5.800, con rate 23.500, con impegni futuri ancora da pagare. Ultima scadenza del caso base 1.002 euro.

File `/downloads/simulatore-rate-posteggio.xlsx`: Istruzioni, Modello, Esempio, Piano modello e Piano esempio. Modello inizialmente vuoto; esempio numerico distinto. Tutte le celle input richiedono un numero, zero esplicito se assente; dati mancanti o incoerenti non producono totali. Validazioni e controlli nelle formule. Nessuna macro, connessione dati o invio al sito; i link alle fonti sono collegamenti documentali.

Simulazione a tasso fisso, prima rata dopo un mese, mensilità intere 1–360 e tasso periodale TAN/12. Rata teorica con capitale residuo finale scontato; piano con interessi e rate arrotondati ai centesimi e aggiustamento dell'ultima rata ordinaria. Maxirata di capitale aggiuntiva all'ultima rata ordinaria, non già inclusa in essa. Spese iniziali pagate subito, non finanziate. Somme nominali, **nessun TAEG o attualizzazione**. No preammortamento, tassi variabili, imposte/deducibilità o spese finanziate: costi comuni inseriti dall'utente con valori verificati col professionista. Scelta del livello di riserva lasciata al lettore, senza soglie consigliate.

Generatore e controlli indipendenti nel dossier privato; `riferimento-esempio.json` riporta la ricostruzione numerica del caso illustrato. **24 casi passati** sulle formule effettive del file XLSX con motore `formulas.ExcelModel`, confrontati con una ricostruzione indipendente dei flussi mensili in Python/Decimal. Su entrambe le schede: esempio, TAN 8% con maxirata, una rata, 360 mesi con arrotondamenti, maxirata pari al capitale, TAN zero e zero spese; poi singolo campo vuoto, tutti i campi vuoti, numero rate non intero, anticipo eccessivo, maxirata eccessiva e costo negativo. Saldo capitale finale zero nei casi validi; totali assenti e avviso nei casi incompleti/incoerenti. Esiti attesi e ottenuti in `verifica-formule.json`. Archivio XLSX integro, nessuna macro/connessione/riferimento a cartelle di lavoro esterne; formule con ricalcolo automatico. Hash del file definitivo `3b7fb078f6cd5bdf815bb48ec4366981e90b7ed04043337dc3d09a6581f03294`.

## Contenuti e copertina

Sei sezioni brevi, 630 parole incluse fonti, tre punti In breve. Due slot ADS contestuali `inline`/`closing`; nessun componente aggiuntivo o intervento sui template. Spazio Vetrine conservato dal rendering corrente. Collegamento al foglio incasso minimo già esistente.

Ricognizione pubblica via API prima della scrittura: **128 articoli**, nessun titolo/slug dedicato a rate, anticipo, pagamento immediato o finanziamento dell'acquisto. Snapshot `titoli-prima.json` nel dossier; controllo finale e inserimento coordinati con le altre due sessioni. Questa sessione non scrive sul DB e non pubblica autonomamente.

Copertina originale con **imagegen integrato**, WebP 1600×900, senza scritte. Scena inventata di due operatori che valutano un acquisto al mercato, dichiarata IA nel testo. Prompt integrale nel file `.prompt.md`, originale PNG nel dossier privato. Nessuna immagine riutilizzata di una trattativa reale.

Backup preventivo comune eseguito e verificato dal coordinatore: tag `backup/session-20261107-103514-tre-articoli-blog-21-22-23`, ramo remoto `backup/pre-tre-articoli-blog-20261107-103518`. Pubblicazione e riscontri online a cura della sessione coordinatrice.


## Pubblicazione coordinata verificata

Pubblicato il 7 novembre 2026, ID `7e3e5edb-1ae8-4225-9240-873683c037cc`, materiali commit `14f917b`. Vercel riuscito `9v34mUXL8vYTwRdF2Aw8bqv79ikF`; copertina e file XLSX online identici SHA256. Canonical, NewsArticle, indice e sitemap verificati; Chromium 1440/768/320, WebKit 390 e lettura senza JavaScript passati, download reale WebKit identico. Due ADS acquisto pertinenti e spazio Vetrine conservato. Verifiche automatiche senza scritture di prova. Tutti i 128 articoli precedenti invariati; tre nuovi articoli, totale 131. Prove coordinate in `.local/lavori/articoli/tre-articoli-20261107/`.
