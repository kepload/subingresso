

## Ricerca approfondita — provincia di Prato, 11 ottobre 2026

Sette comuni controllati, 38 manifestazioni (prima zero): Prato 23, Carmignano 3,
Montemurlo 4, Poggio a Caiano 2, Vernio 4, Vaiano 1, Cantagallo 1.
Audit riproducibile, fonti per scheda ed esclusioni in `data/fiere-prato.json`.
`python scripts/build-fiere.py` sostituisce solo questa provincia, lasciando
intatti gli altri override e gli import nazionali. Totale: 2.187 manifestazioni.

Fonti principali: [Comune di Prato](https://www.comune.prato.it/it/per-i-cittadini/tempo-libero/partecipare-mercatini-fierucole/pagina4191.html),
comunicati mensili e cartellone Tempo Libero, Comuni, Pro Loco e organizzatori.
[Carmignano](https://prato.confesercenti.it/wp-content/uploads/sites/6/2026/09/AVVISO-PUBBLICO-FIERA-DI-CARMIGNANO.pdf):
13 concessioni decennali, domande 6–31 ottobre, due riserve, massimo due posti;
ricorrenza della fiera testuale, senza inventare programma operativo.

- Bigonge: ordinanza sposta 10–11 ottobre al 19 settembre; ottobre eliminato.
- Mercatale Viva: giornate distinte, nessun intervallo continuo tra le domeniche.
- Mercato Europeo: organizzatore 10–13 settembre, comunicati 11–13; conflitto esplicito.
- San Giuseppe Vernio: mercato 10 maggio, esclusa la giornata collaterale del 9.
- Sapori e Saperi: terza domenica nel calendario viabilità 2026, febbraio–dicembre
  senza agosto; nessuna proiezione su altri anni. Natale Montemurlo: 20 dicembre.
- Novecento: sede/ricorrenza discordanti, mantenute testuali da riconfermare.
- Poggiole Natale: 5–6 dicembre da fonte specialistica, calendario provvisorio;
  candidatura indicata entro 15 novembre, tariffe e dotazioni riferite al 2026.
- Beer Festival e Sant'Anna: bancarelle documentate dalla stampa locale;
  partecipazione professionale e disponibilità da verificare direttamente.

Ricerca documentale, non censimento esaustivo né garanzia di posti. PDF annuali
Prato non recuperati; utilizzati comunicati, cartellone e ordinanze accessibili.
Esclusi mercati ordinari, beneficenza e sagre con solo ristoro. Da aggiornare
Comeana, Festa dell'Olio, Assedio e Natale dove manca un programma commerciale
2026 verificabile; non trasferiti dettagli 2025. Nessuna data 2027 dedotta.
Controlli: build, settori e regressioni delle date/scadenze; browser del calendario.

Pagina pubblica `/fiere`, senza database né servizi cartografici a pagamento.

Aggiornamento dell’11 ottobre 2026: 2.149 manifestazioni in 20 regioni, 1.988 con dati
di edizione e 1.715 con almeno una data esatta pubblicata. La selezione originaria
di 200 eventi è integrata da calendari regionali ufficiali e approfondimenti
presso Comuni e organizzatori. La ricerca provinciale approfondita di Brescia
comprende 206 manifestazioni in 86 comuni, rispetto alle precedenti 50 schede.
La copertura nazionale resta parziale: gli import regionali non equivalgono
a una ricerca approfondita completata per ogni provincia.

Le date `confirmed` provengono da programmi o avvisi locali pubblicati; le date
`calendar` da calendari regionali. Questo distingue le fonti, senza garantire
che l'evento non subisca variazioni. Le ricorrenze testuali restano testuali:
non si trasformano regole come «ultima domenica di giugno» in date inventate.
Gli intervalli complessivi dei mercatini periodici sono marcati `periodOnly`:
non indicano attività quotidiana e non vengono conteggiati come date esatte.
Gli appuntamenti distinti sono edizioni separate della stessa manifestazione,
non un periodo continuo. Le date passate e i termini scaduti sono segnalati
dinamicamente secondo il giorno corrente in Italia. Le date non vengono
proiettate al prossimo anno. Per le schede senza edizione restano mesi
indicativi e una richiesta esplicita di verifica.

Luoghi, orari, settori, organici e contatti sono quelli dichiarati nelle fonti,
quando disponibili. Possono riferirsi al programma complessivo e non a tutti
i singoli giorni di vendita. Il numero dei posteggi non è disponibilità residua.
Le procedure specifiche, i costi e le scadenze hanno una fonte dedicata; negli
altri casi la scheda chiede di contattare l'organizzatore/SUAP. Un link a un
avviso scaduto non viene presentato come domanda aperta.
