# Fonti e confini editoriali

Articolo 57, verificato il 27 novembre 2026. Ricerca web e rilettura diretta HTTP delle pagine primarie: ricevute e copie nel dossier privato. Nessun contatto a terzi, sopralluogo, tariffa commerciale raccolta o risparmio osservato.

| Fonte primaria | Passaggio pertinente (parafrasi) | Uso e limite |
|---|---|---|
| [ACI, calcolo costi chilometrici](https://www.aci.it/servizi/calcolo-costi-chilometrici/) | Il costo totale di utilizzo comprende ammortamento, RCA, manutenzione e altre voci. | Sostiene la distinzione fra costo totale e spese vive. Nessun coefficiente ACI o rimborso fiscale calcolato. |
| [ACI Gov, servizio corrente](https://aci.gov.it/servizio/costi-chilometrici-di-esercizio/) | Gli importi sono aggiornati con i carburanti e altre voci; servizio dedicato ai costi di esercizio. | Verifica attualità del servizio; non riportiamo prezzi né istruzioni di accesso discordanti fra le due pagine. |
| [Casaforte, FAQ](https://www.casaforte.it/it/faq) | Prezzo secondo metratura, città e permanenza; orari secondo centro. Merce esclusa, copertura e preavviso descritti dal gestore. | Fonte commerciale primaria solo sulle proprie condizioni. Nel testo non estendiamo orari, assicurazione o preavviso a tutti i depositi. Conferma richiesta alla sede. |
| [Boxengo, FAQ](https://boxengo.com/faq/) | Gli orari possono cambiare per sede; divieti sulla merce, copertura e aree di scarico. | Seconda fonte primaria sulle condizioni operative; non è una raccomandazione del fornitore o una garanzia per il lettore. |

La metodologia ACI 2022 è stata letta come chiarimento del concetto, non usata come tariffario attuale: https://www.aci.it/fileadmin/documenti/servizi_online/Costi_chilometrici/Metodologia_2022.pdf . Il confronto di spesa viva esclude ammortamento e costi fissi del veicolo che restano invariati. Include un solo coefficiente con carburante già compreso, senza un secondo campo carburante. Tempo facoltativo distinto.

## Originalità e ipotesi

Titoli LIVE riletti via GET pubblico delle sole colonne slug,title,category,published_at: 166 risultati, slug assente; confronto con `titoli-live-prima-avvio.json` della coordinatrice. Nessun articolo sul confronto fra depositi. Il tema vicino `comprare-giro-mercati-margini-ore-chilometri` valuta l'acquisto di un giro: qui si confronta la collocazione di un deposito a lavoro invariato.

Esempio interamente inventato: spese fisse attuale 350 €/mese, alternativo 470 €/mese, 16 giri da 60/20 km, 90/70 minuti, zero extra, 0,25 €/km. Totali 590/550 €, differenza 40 €. Trasloco 240 €, quota su 12 mesi 20 €, risparmio dopo quota 20 €/mese; cauzione da versare 600 €, vecchia restituita nel mese 0 €. Primo mese alternativo 1.390 €, attuale 590 €, differenza -800 €. Le ore in meno sono 5 ore e 20 minuti; valore opzionale 20 €/ora = 106,67 €, non un incasso. Nessuna aliquota o tariffa proposta.

## Risorsa e limiti

XLSX senza macro o connessioni; input vuoti, formule verde chiaro e celle bloccate; esempio inventato separato. Giornate riferite a un mese tipo; fino a 12 giri, 0..31 ripetizioni per giro, km/giorno fino a 2.000, minuti/giorno fino a 1.440, importi fino a 1.000.000 €, coefficiente vivo fino a 10 €/km con quattro decimali, mesi da 1 a 120. Il saldo del primo mese include solo il rientro cauzione confermato nel mese, non il picco giornaliero di cassa. La ripartizione dei costi iniziali non modifica le scadenze di pagamento. Nessun calcolo fiscale, scorte o valore residuo merci.

Il file valuta un mese tipo uguale per entrambe le alternative; variazioni stagionali richiedono confronti separati. Il valore del tempo è una preferenza dell'utente. Nessuna soglia universale di convenienza. Le formule vengono valutate dal file reale con `formulas` e confrontate con un riferimento indipendente Decimal; le ricevute definitive sono nel dossier. Anteprime da celle, cache e stili reali con Pillow, non esecuzione in Excel o LibreOffice.

Copertina originale generata con image_gen.imagegen integrato. Scena inventata: deposito, furgone e mercato non identificabili. Prompt effettivo nel file .prompt.md. Esportazione WebP 1600×900 con Pillow.
