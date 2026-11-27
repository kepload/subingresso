# Fonti e metodo: costo imballaggi street food

Consultazione: 28 novembre 2026, Europe/Rome. Ricerca primaria attuale, nessun contatto a terzi.

## Fonti usate

1. Laboratorio Chimico della Camera di commercio di Torino, [Materiali e oggetti destinati al contatto alimentare](https://www.lab-to.camcom.it/MOCA/), acquisita integralmente il 28/11/2026 via web.open e GET locale, HTML 27.255 byte salvato nel dossier. Passaggi pertinenti, parafrasi: i produttori informano i clienti sulle condizioni d'uso e sulle limitazioni attraverso la documentazione di conformità; alimento, durata e temperatura delle prove dipendono dall'utilizzo reale. Uso: promemoria per verificare documentazione e impiego del prodotto; nessuna certificazione fornita dal calcolatore. Nessuna soglia o temperatura universale viene suggerita.
2. Internova 2000, [100 Forchette legno 16 CM](https://internova2000.com/products/100-forchette-legno-16-cm-eco-friendly), SKU 070551/100, acquisita integralmente via web.open e GET locale. Passaggio pertinente: confezione da 100 pezzi, prezzo pubblicato 3,30 euro IVA esclusa, trasporto calcolato al checkout. Limite: fotografia della scheda consultata, non offerta garantita; promozioni, destinazione, condizioni e totale lordo da confermare. Nel testo pubblico si cita solo il confezionamento; il prezzo non entra nell'XLSX. Nessuna affermazione del venditore su compostabilità, dispersione o conformità è ripresa.

## Ricerca e limiti

Titoli LIVE riletti con richiesta pubblica GET alla tabella blog_posts: 171 post, nessun titolo relativo a imballaggi/vaschette/posate/bicchieri e slug assente; confronto con il dossier titoli-live-prima-avvio.json. Ricevuta privata conservata nel dossier.

La pagina indice web del blog ha avuto timeout. Il risultato indicizzato web.search del Ministero della Salute riportava testo MOCA e data 01/10/2026 (risultato indicizzato iniziale); l'apertura diretta web.open e il GET locale hanno invece restituito una challenge Gcore, anche con HTTP 200. Il corpo locale è conservato come prova del limite, non di lettura riuscita. Anche il PDF ISS ISTISAN 18/24 era indicizzato con la scheda B10.h ma la sua apertura è stata respinta; non è usato come fonte acquisita. EUR-Lex ha restituito una verifica anti-bot, Bio-Pack/ecobiopack robots/403, sanita.puglia.it 403. La fonte primaria MOCA effettivamente letta è il Laboratorio Chimico CCIAA Torino, a cui rinviano articolo e foglio. Nessuna norma su plastica monouso, bioplastiche o riutilizzo è ricavata dai soli risultati indicizzati.

## Metodo del foglio

Due preventivi alternativi completi, stesso kit e stesso numero di ordini. Nessuna scorta iniziale. Tutti gli importi IVA inclusa: costo lordo, senza calcolo di aliquote o recuperabilità IVA.

Per ciascuna voce: fabbisogno = ordini × pezzi per ordine; acquisto in confezioni intere rispettando il minimo; pezzi utilizzabili = parte intera dei pezzi acquistati × (1 - scarto). Il numero di confezioni cresce finché i pezzi utilizzabili coprono il fabbisogno. I pezzi scartati assorbono costo nei pezzi utilizzabili.

Il trasporto totale entra una volta, ripartito sul valore dei beni acquistati, oppure sul numero dei pezzi acquistati se tutti i beni hanno prezzo zero. Il costo dei pezzi consegnati è distinto dall'esborso e dalle scorte residue valorizzate. Le scorte non sono un rimborso. I risultati monetari non sono arrotondati nei passaggi intermedi: visualizzazione a centesimi, costo unitario a quattro decimali; la sola quadratura di controllo è arrotondata ai centesimi per neutralizzare residui floating point. Minimi di carrello, prezzi a scaglioni e sconti vanno confermati per la quantità calcolata.

## Esempi inventati, non listini

120 ordini, un pezzo per tipo, nessuno scarto. A: vaschette 50 pz/10 euro, bicchieri 100 pz/6 euro, posate 100 pz/4 euro; minimo una confezione per voce; trasporto 6 euro. Confezioni comprate 3/2/2: esborso 56, consumato 40,32, costo per ordine 0,3360, scorte 15,68 euro.

B: vaschette 500 pz/75 euro, bicchieri 1000 pz/45 euro, posate 1000 pz/25 euro; minimo una confezione per voce, trasporto 0. Esborso 145, consumato 26,40, costo per ordine 0,2200, scorte 118,60 euro. Importi tutti IVA inclusa per ipotesi. Nessun risparmio osservato o prezzo promesso.

## Risorse e verifiche

Copertina originale generata con image_gen.imagegen integrato, scena inventata, esportazione WebP 1600×900. Prompt effettivo nel file .prompt.md. File Excel senza macro, connessioni o collegamenti esterni, input vuoti ed esempi separati. Formule valutate da formulas con riferimento indipendente Decimal e ricerca binaria delle confezioni; cache rilette dal file definitivo. Anteprime ricavate da celle e stili effettivi: non equivalgono a una prova in Excel o LibreOffice.
