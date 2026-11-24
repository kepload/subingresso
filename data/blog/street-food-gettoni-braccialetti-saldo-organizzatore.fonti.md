# Fonti e limiti: saldo street food con gettoni o braccialetti

Verifica: 24 novembre 2026. Fonti primarie di fornitori, consultate sul web e scaricate nel dossier privato articolo-35 con ricevute HTTP, data e SHA-256 in `fonti-ricevute.json`. Nessuna tariffa proposta come universale, nessuna norma o scadenza legale desunta dalle condizioni di un singolo evento.

- [Event Solutions Group, Pagamenti cashless con token e casse smart](https://eventsolutionsgroup.it/pagamenti-cashless-con-token-e-casse-smart/). Descrive token, conteggi, circuiti RFID, listini per punto vendita e accesso dei concessionari ai report. Distingue dati di vendite, ricariche e credito residuo. Pagina senza data editoriale visibile; GET locale 200. Il lettore web ha inizialmente restituito 403: contenuti ricontrollati con ricerca sul dominio e copia diretta 200. Non si riprendono promesse commerciali di sicurezza o aumento vendite.
- [Weecop, Cashless](https://weecop.fr/fr/logiciels/cashless). Documenta esportazioni per punto vendita, operazioni di ricarica e rimborso, registrazione offline e sincronizzazione successiva. Pagina senza data editoriale visibile; GET 200. Sono capacità del fornitore, non garanzie di disponibilità per ogni manifestazione.
- [Weezevent Help Centre, Cancelling a sale from a cashless terminal](https://help.weezevent.com/en/articles/13406799-cancelling-a-sale-from-a-cashless-terminal). Data esposta: 16 gennaio 2026; GET 200. L'annullamento confermato riaccredita il conto cliente; supporta la distinzione tra vendite e storni. La procedura è specifica WeezPay; l'articolo non impone tale procedura agli altri sistemi.

## Metodo e risorsa

La formula del saldo è una riconciliazione aritmetica editoriale: vendite riconosciute meno trattenute ancora da applicare, più crediti aggiuntivi concordati, meno versamenti effettivamente ricevuti. Non stabilisce diritti, scadenze, adempimenti IVA o reddito. Valori, imponibili, percentuali e rimborsi devono provenire dagli accordi e dai documenti dell'evento. Aliquote diverse richiedono righe distinte; l'IVA delle commissioni va inclusa nelle voci concordate, senza duplicazioni. Nessun calcolo fiscale automatico.

Il file Excel contiene Saldo, Vendite (12 righe), Trattenute (8 righe), Versamenti (8 righe), Guida ed Esempio inventato separato. Dati in euro, fino a due decimali; gettoni interi e valore unitario con massimo due decimali; percentuali da 0 a 100 con quattro decimali. I campi mancanti e non validi impediscono risultati fuorvianti; zero va inserito solo per assenze verificate. Nessuna macro, collegamento esterno o connessione. Il foglio non importa automaticamente report e non rileva sovrapposizioni fra report con riferimenti diversi: controllo manuale necessario.

L'esempio 1.000 - 100 - 30 - 500 = 370 euro è interamente inventato. La quota già pagata resta esclusa dalle trattenute residue. Il saldo può essere negativo; un risultato negativo non costituisce accertamento di un debito. La copertina originale IA rappresenta una scena inventata e non è prova di un evento reale.

## Verifica originalità

Indice pubblico LIVE: 152 slug e titoli, controllati il 24 novembre 2026 senza accesso diretto al database. Nessun tema gettoni, braccialetti, cashless o saldo organizzatore presente. Esaminati i soli candidati pertinenti: verifica dell'organizzatore trovato sui social; registro generale di fine fiera; domande sui numeri dei visitatori. Il registro di fine fiera tratta merce, spese e ore; questo articolo tratta la riconciliazione con chi incassa per il banco. Elenco e copie dei candidati conservati nel dossier privato.
