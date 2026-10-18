# Conversione alla Vetrina — 18 ottobre 2026

Richiesta: analizzare e migliorare i punti che portano a pagare, consultando esperienze reali nei forum. Un unico esperimento di presentazione della Vetrina: prezzi, durata, sconto, pubblicazione gratuita e backend pagamenti conservati.

## Riscontri sul prodotto

- Monetizzazione operativa: Vetrina 10/30/90 giorni dalla pubblicazione e dall'area personale; estensioni e riattivazioni dalla scheda Acquisti. Blog, fiere e valutatore portano verso annunci e registrazione, senza un proprio servizio acquistabile. Non introdotti richiami a pagamento fuori contesto.
- Prima: pulsante Vetrina ridotto alla sola stella su telefono; tre pacchetti che aprivano direttamente Stripe; testo su pagamento unico in una riga troncabile nel footer; ritorno dall'annullamento senza azione per riprendere; scelta dell'annuncio anche quando ce n'era uno solo.
- Lettura aggregata live `payments` del 18/10: **17 sessioni `cs_live_%`, tutte `failed`, quattro utenti distinti; nessuna `succeeded` reale registrata**. Date: 21/04–12/09/2026, prima dei prezzi aggiornati l'8 ottobre. Un pagamento di prova `succeeded`. `failed` comprende checkout scaduti/non completati: non dimostra carte rifiutate né identifica la causa dell'abbandono. Non è il tasso di conversione di tutti i visitatori e non verifica autonomamente il conto Stripe. Query, orario e risultati aggregati fuori dal repo in `Documents/conversioni-subingresso-20261018/baseline-*.json`; nessun dato personale esportato.

## Forum consultati e applicazione

Sono racconti diretti e discussioni pubbliche, non risultati certificati trasferibili al nostro sito. Le percentuali riportate dai loro autori non sono previsioni per Subingresso.

1. [Hacker News, esperienza sulla semplificazione delle scelte in un prodotto finanziario](https://news.ycombinator.com/item?id=32213587): l'autore descrive un miglioramento dopo avere semplificato schermate e scelta iniziale. Precisa che più aspetti cambiarono insieme e la causa non è isolata. **Applicazione:** una durata consigliata nel dialog aperto volontariamente, prezzi confrontabili, un solo pulsante esplicito verso Stripe; dettagli secondari apribili. La pubblicazione gratuita rimane la scelta iniziale nel wizard.
2. [Reddit r/SaaSMarketing, presentazioni e acquisto singolo](https://www.reddit.com/r/SaaSMarketing/comments/1x6q07y/we_spent_2k_on_ads_with_zero_paying_customers/): l'autore racconta acquisti dopo aver offerto un pagamento singolo al momento del bisogno, con sei eventi paganti in due settimane. Segnala campione piccolo e cambiamenti simultanei, senza attribuzione causale. **Applicazione:** rendere evidente che Vetrina è un pagamento unico, vicino al prezzo e al pulsante; non inventare un abbonamento o nuovi prezzi.
3. [Reddit r/eBaySellerAdvice, utilità delle inserzioni promosse](https://www.reddit.com/r/eBaySellerAdvice/comments/12glgpg/is_it_worth_it_to_promote_listings/): venditori riportano risultati diversi per categoria; un venditore di collezionismo descrive maggiore esposizione e raccomanda di controllare impressioni e risultati, distinguendo promozione e organico. **Applicazione:** statistiche esistenti più evidenti nella proposta e nel wizard, senza garantire vendite o incrementi. Le nostre statistiche durante la Vetrina non dimostrano causalità o traffico aggiuntivo.
4. [Hacker News, discussione sui ricavi e sul cambio dei pacchetti](https://news.ycombinator.com/item?id=4376465): il confronto distingue iscrizioni e ricavi e contesta interpretazioni troppo ottimistiche dei tassi. **Applicazione:** valutare pagamenti confermati e incassi, non soltanto clic o selezioni del pacchetto.

Scartati come base decisionale: post promozionali con grandi percentuali senza dati verificabili; aumento/riduzione del prezzo, carte obbligatorie e rimozione del gratuito come ricette generali; urgenza artificiale, testimonianze o numeri di pubblico non verificati. Nessun messaggio inviato nei forum o agli utenti.

## Modifiche

- **Pubblicazione:** vantaggi e statistiche visibili; stessi benefici per tutte le durate, partenza dall'approvazione e risparmio esatto con il -10%; nota finale coerente con la scelta. Eliminata dalla spiegazione la quantità storica non verificata di letture del blog; precisati filtri, distanza e rotazione.
- **Gestione annunci e statistiche:** comando «Promuovi» leggibile anche a 320 px e almeno 44 px di altezza; invito vicino ai dati del proprio annuncio.
- **Dialog:** tre durate selezionabili, 30 giorni consigliati; totale nella conferma e nessun rinnovo sempre visibili. Scelta del pacchetto senza chiamare Stripe: solo la conferma crea la sessione. Dettagli e anteprima apribili, tastiera/Escape/focus; errori leggibili e riprovabili, protezione dai doppi clic, timeout, sessione cambiata e risposte tardive dopo chiusura.
- **Ritorno da Stripe e acquisti:** invito a rivedere le opzioni; con un annuncio attivo si apre direttamente la scelta della durata, con più annunci si sceglie quale, senza annunci idonei si propone di pubblicarne/riattivarne uno. Annunci pending: attendere approvazione; nessuna promessa di riapplicare lo sconto pubblicazione.

## Verifica e lettura futura

Test `test-vetrina.cjs` per prezzi, sconto, firma, autorizzazioni e stati; `test-vendi.cjs` per bozze, foto, pubblicazione, tre scelte, importi e overflow320; `test-vetrina-conversion.cjs` per scelta/conferma, Stripe simulato, errori e tastiera su Chromium1440/820/320×568 e WebKit390; `test-vetrina-account.cjs` per zero/uno/più annunci, ricevute e area privata nei due browser a1440/390/320. Screenshot e risultati in `Documents/conversioni-subingresso-20261018/`. Nessun pagamento, annuncio o invio email reale generato per i test.

Verifica di pubblicazione e confronto degli asset registrati nel file informazioni e nel report `pubblicazione.json` esterno. L'aumento delle conversioni resta **da misurare dopo la pubblicazione**. Confrontare sessioni reali create, pagamenti confermati, clienti paganti e ricavi su periodi confrontabili, escludendo test/rimborsi. Le aperture del dialog non sono oggi censite come evento dedicato: non ricavare una conversione dialog→acquisto dalle sole page view. Nessun nuovo tracciamento o automatismo periodico aggiunto.
