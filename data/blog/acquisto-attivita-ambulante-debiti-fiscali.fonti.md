# Debiti fiscali nell'acquisto di attività ambulante: fonti e verifiche

Ruolo **C**, priorità effettiva **52**, 13 novembre 2026. Un solo articolo; ripiego 63 non utilizzato.

**Stato: materiali pronti; pubblicazione e controlli live a cura del coordinatore.** Nessun inserimento o aggiornamento nel database eseguito da questa sessione.

## Tema e ambito

Letti i **135 titoli e sommari live** prima della preparazione. Nessun articolo dedicato al certificato fiscale specifico per l'acquirente di azienda. La guida esistente sugli arretrati del venditore nei mercati milanesi riguarda la pratica comunale; quella sulla caparra prepara le verifiche per il notaio. Qui si distingue la responsabilità tributaria dell'acquirente e si raccoglie la documentazione per il commercialista.

Ambito: normale acquisto di azienda o ramo di attività ambulante. Non si estendono automaticamente queste regole a quote societarie, beni isolati o operazioni nella crisi d'impresa. Nessun dato commerciale, aliquota, importo di debito osservato o clausola contrattuale universale. L'unico esempio è dichiaratamente inventato.

## Fonti primarie lette

- [D.Lgs. 472/1997, articolo 14](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=14&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=0&atto.codiceRedazionale=097G0499&atto.dataPubblicazioneGazzetta=1998-01-08): scaricato HTTP 200, selezione al 13/11/2026. Pagina con testo in vigore dal 29/6/2024 al 31/12/2026. Commi 1–2: solidarietà, preventiva escussione, limite del valore, annualità e atti rilevanti alla data del trasferimento. Comma 3: certificato negativo e mancato rilascio entro quaranta giorni. Commi 4–5: frode; commi 5-bis/ter: casi speciali, esclusi dalla guida operativa ordinaria. L'articolo invita a verificare ricezione, ufficio, contenuto e rapporto temporale con l'atto; non offre un conto alla rovescia o una garanzia automatica.
- [Agenzia delle Entrate, provvedimento 25 giugno 2001](https://www.gazzettaufficiale.it/eli/id/2001/07/06/001A7407/sg), testo HTML HTTP 200 e [GU n. 155/2001, PDF integrale](https://www.gazzettaufficiale.it/eli/gu/2001/07/06/155/sg/pdf), HTTP 200: distinti modello generico A e modello specifico B; letti gli allegati C/D, pagine 57/58, e ispezionate le pagine del PDF. L'allegato C distingue anche i termini e l'ufficio competente. È una fonte storica sulla distinzione dei certificati: non viene usata per affermare tariffe, modulistica o canali attuali universali.
- [AdER, Situazione debitoria, 7 aprile 2026](https://www.agenziaentrateriscossione.gov.it/link-esterni/Online-la-nuova-versione-del-servizio-Situazione-debitoria-e-la-guida), HTTP 200 nella richiesta diretta: contenuti del prospetto e accesso dell'interessato o intermediario. Il testo web del motore ha dato 403 all'apertura; la copia ufficiale diretta è stata recuperata integralmente. Il prospetto è proposto come documento integrativo, senza attribuirgli l'effetto del certificato specifico.
- [D.Lgs. 173/2024, articolo 102](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=102&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=1&atto.codiceRedazionale=24G00191&atto.dataPubblicazioneGazzetta=2024-11-28), HTTP 200 con articolo dell'allegato selezionato e decorrenza **1 gennaio 2027**. La guida circoscrive i riferimenti al 2026 e chiede un nuovo controllo per atti successivi. Prima richiesta all'indice dell'atto e tentativo all'endpoint di sessione non sufficienti: usata la pagina finale del singolo articolo.

Controllo di contesto: articolo 2560 c.c., recuperato HTTP 200 nella pagina finale, per tenere distinti gli altri debiti aziendali. Non si trae dalla contabilità un'esclusione generale del rischio fiscale. La Cassazione 26076/2026 è emersa nella ricerca, ma non è stata usata: endpoint con errore TLS nelle richieste Python e pagina senza testo nella lettura Windows. Nessun principio ricostruito dai soli frammenti del motore.

Copie originali, date, URL, esiti e SHA256 in `fonti-ricevute.json` nel dossier privato `C` di `.local/lavori/articoli/quattro-articoli-20261113-1853/`. Le risposte fallite o prive del testo non vengono presentate come prova normativa.

## Risorsa gratuita

`downloads/scheda-debiti-fiscali-acquisto-ambulante.xlsx`: sei fogli, Istruzioni, Operazione, Documenti, Domande, Esempio e Fonti. Dodici campi dell'operazione, undici documenti, undici domande; date della richiesta, della risposta e della situazione distinte. Campi operativi vuoti, stati documentali iniziali “Da richiedere”, esempio inventato separato. La ricezione di AdER non chiude la riga del certificato per la cessione.

**38 controlli superati sul file definitivo**: struttura, input vuoti, stati, date, esempio, stampa, collegamenti e ZIP. Convalide di tipo lista/data con errore stop; casi delle regole verificati senza eseguire Excel desktop. Limite dichiarato: l'incolla può eludere le convalide. Nessuna formula, cache di calcolo fiscale, macro, connessione, query, oggetto incorporato o collegamento dati esterno. Cinque semplici link a fonti ufficiali.

SHA256 XLSX finale: `f5169951b3ee25188463f1f7499de513e2970370b94072ea21cf28f06cbdd79f`. Ricevuta `risorsa-verificata.json`, con lo stesso hash usato nell'anteprima e nei quattro download browser.

## Copertina e anteprima

Copertina originale con skill imagegen, strumento integrato; [prompt integrale](acquisto-attivita-ambulante-debiti-fiscali.prompt.md). WebP opaco **1600×900**, scena inventata dichiarata nell'articolo. SHA256: `8119e3264974be904193e5c20d5b0bf5e2866eceddb68eb0fa85e9313e120985`.

Articolo **568 parole** nel rendering, sei H2, hook, tre punti iniziali, slot ADS `inline`/`closing`, download e fonti. Controllati SSR effettivo tramite `api/blog.js`, titolo, descrizione, canonical, NewsArticle e sanitizzazione. Cinque percorsi PASS: Chromium 1440/768/320, WebKit 390 e Chromium 390 senza JavaScript. Nessun overflow o errore JavaScript; ADS contestuali distinte e coerenti con l'acquisto. Download realmente effettuati da server locale in tutti i quattro formati con JavaScript, SHA256 identico al file finale. Scritture browser intercettate; nessun invio o accesso ad account. Regole ADS di anteprima in fixture: non equivalgono a verifica delle regole live.

Ricevuta `acquisto-attivita-ambulante-debiti-fiscali-anteprima-verificata.json`, HTML SSR e screenshot nel dossier C. Il primo tentativo da cwd errata è stato corretto; download annullato su risposte intercettate HTTPS risolto verificando il trasferimento reale con un server locale. Nessuna modifica al rendering di produzione.

Il coordinatore deve ancora integrare, distribuire gli asset, inserire il post e verificare pagina pubblica, download, indice e sitemap. Questo dossier non dichiara il post pubblicato.
