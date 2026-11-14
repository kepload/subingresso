# Comprare un giro: margini, ore e chilometri per giornata

Punto **7**, unico incarico della sessione nuova Codex 2 del **14 novembre 2026**. Titolo assegnato mantenuto integralmente; slug originale `comprare-giro-mercati-margini-ore-chilometri`.

## Ambito e duplicati

Elenco dei **142 post LIVE** letto prima di scrivere e conservato nel dossier privato. Nessun confronto dal lato dell'acquirente tra le giornate di un giro per margine, ore e chilometri. Contenuti vicini distinti: `vendere-giro-mercati-annuncio-unico-separati` riguarda come proporre la vendita; `quanto-deve-incassare-banco-convenire` il livello di vendite richiesto; `verificare-incassi-banco-prima-comprare` il riscontro delle vendite; `affittare-posteggio-canone-margine` il tetto del canone. Nessuna loro modifica.

Il confronto proposto usa dati del lettore e medie giornaliere riferite allo stesso periodo. Non è una rilevazione di rendimenti reali, una valutazione del prezzo di acquisto, una previsione fiscale o un bilancio di cassa. Tutti i numeri degli esempi sono inventati, separati dalle fonti. Nessuna soglia oraria universale o promessa di guadagno.

## Fonti primarie e ricevute

Fonti scaricate **HTTP 200 il 14 novembre 2026**, con URL finale, ora, originale e SHA256 in `fonti-ricevute.json` nel dossier privato.

- [Città metropolitana di Bologna, Progetti d'impresa: Vademecum per futuri imprenditori](https://www.bo.camcom.it/sites/default/files/promozione-interna/sportello-genesi/Progetti_d_impresa_Vademecum_per_futuri_imprenditori.pdf#page=43), ospitato dalla Camera di commercio: edizione settembre **2020**, pagina PDF 43, numerazione stampata 33. Base didattica per il margine di contribuzione e la copertura dei costi fissi. Non è un'indagine sugli ambulanti o una fonte fiscale del 2026. SHA256 PDF `21dbc4c1ed9457365810900020ec9c73acc572b46ffc52754491d915f5421167`; estratto della pagina conservato.
- [ACI Gov, Costi chilometrici di esercizio](https://aci.gov.it/servizio/costi-chilometrici-di-esercizio/): pagina aggiornata il **23 aprile 2025**, consultata nella versione corrente. Descrive il servizio per modello di veicolo e il suo aggiornamento, comprendendo voci ulteriori al carburante. Accesso ai valori tramite identità digitale: non eseguito. Nessun costo o tariffa ACI è ripreso nell'esempio; 0,50 euro/km è inventato. SHA256 HTML `b648ac0c64298d9a4b2ae47bd7e140db38b49a2561e570af8005bd4891fc4ad3`.

La vecchia pagina `web.aci.it/servizi/calcolo-costi-chilometrici/`, ancora presente nei risultati di ricerca, reindirizza alla home: esclusa dai riferimenti definitivi. Non sono state ricostruite tariffe da frammenti del motore di ricerca. Le raccomandazioni di verifica con SUAP e professionisti non affermano una procedura o una durata nazionale unica.

## Metodo redazionale e limiti

Una colonna per posteggio/giornata, fino a sette; periodo esplicito comune, al massimo un anno. Ricavi, costo della merce venduta e altri costi variabili per giornata devono avere perimetro e trattamento IVA coerenti, da verificare col commercialista. Le medie non descrivono la variabilità delle singole presenze: confrontare stagioni e assortimenti separatamente.

- Margine dopo merce/variabili = vendite giornaliere − merce venduta e altri variabili.
- Costo mezzo giornaliero = km dell'intero percorso × costo del mezzo in euro/km.
- Residuo giornaliero prima dei comuni = margine dopo merce/variabili − altri costi diretti − costo mezzo.
- Residuo orario per piazza = residuo giornaliero / ore proprie della giornata, incluse attività fuori mercato.
- Ogni valore del periodo = valore giornaliero × numero di giornate effettive; somme separate per ricavi, residui, ore e km.
- Residuo complessivo = somma dei residui del periodo − costi comuni non già attribuiti.
- Ore complessive = somma delle ore delle piazze + ore proprie comuni non già attribuite. Rapporto complessivo = residuo complessivo / ore complessive, senza media semplice dei rapporti giornalieri.

Spese annuali da imputare al periodo senza confondere competenza e scadenza. Documentare le voci coperte dal costo km e non duplicare carburante, manutenzione, assicurazione o ammortamento già inclusi. Il costo degli aiuti pagati va nelle spese; lavoro familiare gratuito da valutare a parte. I costi e le ore comuni vanno contati una volta sola. Il residuo precede imposte, contributi, remunerazione personale e acquisto/rate del giro: non è uno stipendio netto o liquidità disponibile. Non valuta scorte iniziali o investimenti. Togliere una piazza non prova la scomparsa di spese fisse o obblighi di presenza.

Esempio tutto inventato: una presenza per piazza. A: 1.000 − 600 − 70 − 100 × 0,50 = 280 euro, 10 ore, 28 euro/ora. B: 850 − 510 − 50 − 20 × 0,50 = 280 euro, 8 ore, 35 euro/ora. Totali: 1.850 vendite, 560 residuo prima dei comuni, 120 km, 60 euro di mezzo; con 100 euro e 2 ore comuni restano 460 euro su 20 ore = 23 euro/ora.

## Risorsa definitiva e verifica

`downloads/confronto-giro-mercati.xlsx`, cinque fogli: Istruzioni, Calcolo, Esempio, Documenti, Fonti. Calcolo vuoto, Esempio con due piazze inventate. Celle gialle per input e verdi per risultati; stampa e righe bloccate. Giorni interi 0–366, ore proprie giornaliere 0–24 e maggiori di zero quando si lavora; importi e km non negativi. Costi e ore comuni obbligatori, zero solo se verificati assenti. Una colonna completamente vuota viene ignorata; zero giornate esclude i risultati giornalieri e mantiene zero nei totali della colonna. Dati incompleti, testuali anche numerici, booleani o fuori limite bloccano i risultati pertinenti e il totale.

**878 scenari PASS, 8.756 confronti**: formule effettive lette dal file e valutate con `formulas.ExcelModel`, confrontate con aritmetica Python indipendente. Tutte le sette colonne di entrambi i fogli, dati mancanti/testuali/negativi/booleani in ogni input numerico, periodo e mercato mancanti, giorni frazionari/oltre limite, ore nulle/oltre limite, margine negativo, costi km differenti, decimali e scenari indipendenti. Totali con presenze diverse, giornata esclusa, costi e ore comuni, perdite e comuni non validi. Cache iniziali verificate: esempi 28/35 euro per ora e 23 complessivi; risultati vuoti nel foglio da compilare.

ZIP integro; nessuna macro, connessione dati, formula di rete o collegamento a workbook esterni. Due normali hyperlink alle fonti. Non sono stati avviati Excel o LibreOffice: il motore di verifica è dichiarato, senza attribuire prove a quelle applicazioni.

SHA256 definitivo XLSX: `fd3bdabc9916f292a9577a15bf7f83eeaa02d01da44cadc43ebcf63ce755f68a`.

## Copertina e anteprima

Copertina originale generata con strumento integrato `image_gen` e skill imagegen; prompt esatto in `.prompt.md`. Scena inventata dichiarata nell'articolo. Originale privato conservato e WebP finale **1600×900** controllato visivamente. SHA256 `8621a3385225ce55a50314c3c22c0c6f14197906b5cd3b1702f2a57e0fa40be7`.

Verificatore adattato da `netto-vendita-banco-20261113`, senza eseguire i vecchi modi mutativi. Anteprima: Chromium **1440/768/320**, WebKit **390**, Chromium **390 senza JavaScript**. Sei h2, tre punti iniziali, 580 parole visibili, due ADS distinti, titolo/descrizione/canonical/NewsArticle e spazio Vetrine. Nessun overflow o errore JavaScript; download effettivo WebKit identico al file definitivo tramite server locale. Provider e scritture analytics intercettati. Screenshot desktop, 320 e copertina esaminati; visibilità effettiva senza JS verificata, compresi opacità e testo visibile.

Dossier privato: `.local/lavori/articoli/ciclo-quote-20261114-1305/articolo-07/` nella root principale. Checkpoint JSON/Markdown e `operations.jsonl` aggiornati prima/dopo le operazioni remote; ricevute di fonti, formule, anteprima e pubblicazione nello stesso dossier.

## Pubblicazione verificata il 14 novembre 2026

Materiali commit `7db16170296e61a0efbbbd19ab4d7ec45754affd`, push da worktree esclusivo con main remoto ancora coincidente con la base attesa. Hook pre-commit e scansione gitleaks effettivi, senza rilievi. Deploy Vercel **success**, [ricevuta](https://vercel.com/kycykuardit-9234s-projects/subingresso/emfxLyPoK4GuJnb5aBLFTvCU65nX). Prima dell'INSERT, copertina e XLSX pubblici HTTP 200 e SHA256 identici ai definitivi sopra riportati.

Schema, vincoli, trigger e duplicati LIVE riletti subito prima dell'inserimento: nove colonne, PK id, slug univoco, nessun trigger applicativo. **Un solo INSERT**, nessun UPDATE/DELETE, record `3936d55c-e87c-4a52-ad00-06a64b0cc4fe`, `published_at` **2026-11-14 13:48:39.257274+00** (14:48:39 in Italia). [Articolo pubblico](https://subingresso.it/blog?post=comprare-giro-mercati-margini-ore-chilometri).

Cinque percorsi browser **online PASS**: Chromium 1440/768/320, WebKit 390, Chromium 390 senza JS. Download effettivo WebKit identico al definitivo; nessun overflow o errore JavaScript. Lettura senza JS verificata nella visibilità effettiva, con testo e copertina caricata; SSR, titolo, descrizione, canonical, NewsArticle, indice e sitemap conformi. Scritture analytics/provider intercettate. Tutti i **142 post precedenti invariati nei nove campi**, **143 totali**; nessun dato reale di prova o invio.

Ricevute principali: `push-materials.json`, `deploy-materiali.json`, `schema-prima-inserimento.json`, `prima-inserimento.json`, `pubblicazione.json`, `integrita-dopo-inserimento.json`, `asset-pubblici.json`, `verifica-pubblica.json`, file `*-anteprima-verificata.json` e `*-online-verificato.json`. Memoria ed elenco aggiornati esclusivamente per il punto 7; consegna finale `result.json`/`result.md` nel dossier privato.
