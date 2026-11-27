# Calendario di cassa mercatino: fonti e limiti

Verifica effettuata il **27 novembre 2026**. Ricerca web e recupero diretto HTTP 200; ricevute con data, URL e SHA-256 in `.local/lavori/articoli/20261127-codex2-cinque/articolo-68/fonti-ricevute.json` della root comune. Nessuna intervista, vendita o prova sul campo dichiarata.

## Fonti primarie

1. **Camera di commercio di Bolzano, Linee guida per il finanziamento delle imprese, pp. 24-25.** [PDF ufficiale](https://www.camcom.bz.it/sites/default/files/uploaded_files/sviluppo_impresa/Leitfaden%20Finanzierung%20IT.pdf). Passaggio pertinente: «I crediti verso i clienti non sono pertanto automaticamente denaro (cash).» La guida separa capacità di pagare e utile, confronta date di entrata/uscita e propone scenari alternativi. Limite: pubblicazione generale non datata nella pagina consultata, non listino o normativa attuale, nessuna durata standard obbligatoria applicata al mercatino. Copia PDF nel dossier.

2. **Banca d’Italia, L’economia per tutti, Pianificazione.** [Pagina ufficiale](https://economiapertutti.bancaditalia.it/aree-tematiche/risparmio-e-investimenti/la-pianificazione/index.html). Passaggio pertinente: «fai una previsione di tutte le entrate e le uscite». Riscontro del metodo di registrazione e aggiornamento; pagina rivolta alle famiglie, non fonte di regole fiscali o contrattuali per organizzatori. Non usata per suggerire riserve, aliquote o percentuali universali.

3. **Crea e Reinventa, Pagamenti.** [Pagina dell’organizzatore](https://www.system099.com/riferimenti-pagamenti/). Passaggio pertinente: «IN CASO DI MALTEMPO». La pagina distingue restituzione parziale della quota e trattamento degli eventi invernali con spese elettriche anticipate. Contiene un riferimento esplicito a marzo 2026: non prova condizioni valide per una futura edizione. È un esempio documentale della variabilità dei contratti, senza presentare importi, scadenze o percentuali come regola generale. Non costituisce valutazione della validità giuridica delle clausole. Nessun recapito o identificativo di pagamento riprodotto nei materiali pubblici.

## Metodo e confini

- Ricontrollati 161 titoli LIVE prima della scrittura. Gli articoli su numero di espositori per il pareggio e liquidità del compratore di un posteggio sono distinti: qui si calcola il massimo disavanzo temporaneo di un organizzatore. Ricevuta `duplicati.json`.
- Categoria **Fiere**, coerente con le guide già pubblicate sulla gestione del mercatino: testo rivolto soltanto all’organizzatore dell’evento. Nessuna modifica alla whitelist DB; riconoscimento del percorso da verificare con sola SELECT dopo pubblicazione.
- Nessuna affermazione su prezzi correnti, autorizzazioni, adempimenti universali, termini legali, numero reale di espositori o condizioni commerciali standard.
- Tutti i numeri dell’esempio sono inventati. Dal 1° marzo 2027: cassa iniziale 500; pagamento 1.800; incasso 1.200 il 10; pagamento 1.200 il 20; incasso 2.400 il 25. Base: saldo minimo −1.300, copertura aggiuntiva 1.300, finale 1.100. Con entrambi gli incassi spostati di dieci giorni: minimo −2.500. Con altri 1.000 di rimborsi il 9 aprile: finale 100, stesso minimo. Non sono previsioni di ricavi o tariffe consigliate.
- Cassa iniziale considerata disponibile prima dei movimenti. Il minimo comprende la situazione iniziale e, per prudenza, tutte le uscite di ogni giorno prima degli incassi dello stesso giorno. Il file non impone l’ordine delle righe: saldi calcolati per data, ordine visivo conservato e riordinabile dall’utente.
- 30 movimenti futuri e 10 eventuali rimborsi, con date e importi da compilare. Base, Ritardi e Rimborsi derivano dagli stessi input. Rimborsi applica anche i ritardi e aggiunge restituzioni, senza cancellare automaticamente incassi o costi: non simula un annullamento completo. Si presuppone che le quote da restituire siano state incassate; questa corrispondenza contrattuale va verificata dall’organizzatore.
- La copertura aggiuntiva è il denaro oltre la cassa iniziale necessario per non andare sotto zero, ipotizzato disponibile prima del primo movimento e senza rimborso nel periodo. Il foglio mostra separatamente la cassa iniziale minima richiesta. Non è una domanda di credito né ne stima costi/approvazione. Il saldo finale è liquidità, non utile o imponibile.
- Importi numerici non negativi con massimo due decimali, date intere dal giorno iniziale, ritardi interi 0-3.650 giorni; zero per i pagamenti. Righe parziali, testo numerico, negativi ed errori impediscono i risultati. Righe completamente vuote ammesse. Il foglio Dati parte vuoto, Esempio è separato.
- Risorsa senza macro, collegamenti esterni o connessioni; formule del file definitivo valutate con motore `formulas` e confrontate con riferimento indipendente Python Decimal e calendario ordinato per eventi. Hash e casi effettivamente eseguiti nella ricevuta privata `verifica-formule.json`.
- Copertina originale generata con lo strumento integrato imagegen; prompt effettivo nel file omonimo `.prompt.md`. Scena inventata, 1600×900 WebP.

## Verifiche di pubblicazione

Le ricevute effettive sono conservate nel dossier: handler SSR reale con fixture del solo post, browser Chromium desktop/tablet/320, WebKit390, lettura senza JavaScript e download; analytics e scritture di prova intercettati. Esiti online, deploy, unico INSERT, conservazione post precedenti e lock nel dossier, senza credenziali nei materiali pubblici. Lo stato finale è quello di `result.json`, non una promessa di esito anticipato.
