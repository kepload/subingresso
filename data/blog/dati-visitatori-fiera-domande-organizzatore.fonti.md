# «Migliaia di visitatori»: fonti e verifiche

Priorità **17**, singolo articolo. **Preparato il 14 novembre 2026; non pubblicato in questa fase.** Slug `dati-visitatori-fiera-domande-organizzatore`. Il secondo turno sarà avviato dal coordinatore nell'ordine concordato. Nessuna modifica a documenti comuni, main, DB, template, CSS, JS o servizi.

## Ricerca e duplicati

Letto l'elenco LIVE di **143 post** tramite API pubblica, con titoli, estratti e contenuti conservati nel dossier privato. Nessun post specifico sulle prove di affluenza da chiedere prima di prenotare una fiera, accompagnate da un modello email. Controllati anche i riferimenti generali a partecipazione alle sagre/fiere e servizi inclusi: tema e strumento pratico di questa guida sono distinti. L'articolo già presente sul rimborso per maltempo è collegato come approfondimento, senza duplicarne l'analisi.

L'articolo non misura una fiera reale e non propone una classifica. Le domande su campioni, perimetri, pubblico e posizione sono raccomandazioni redazionali: non vengono presentate come documenti sempre dovuti dall'organizzatore. Nessun obbligo di certificazione esteso a tutte le sagre o manifestazioni su strada. Nessun tasso di acquisto, rendimento, previsione di incasso o dato commerciale inventato. I numeri didattici sono segnalati come inventati.

## Fonti primarie effettivamente lette

Cinque pagine scaricate direttamente **HTTP 200 il 14 novembre 2026**; HTML integrali, estrazioni testuali, data, URL finale, dimensioni e SHA256 in `fonti-ricevute.json` nel dossier. Nessuna deduzione da soli frammenti di ricerca.

- [UFI — What data needs to be audited?](https://www.ufi.org/faq/what-data-needs-to-be-audited/): distingue visitatori e visite comprensive dei ritorni, richiedendo chiarezza sulla misura nel certificato. Usata per chiedere la definizione del conteggio, senza attribuire automaticamente lo standard UFI a ogni evento.
- [FKM — Certification](https://www.fkm.de/en/objective-exhibition-data/certification/): la verifica della presenza effettiva riguarda anche preregistrati e titolari di biglietto. Citata espressamente come riferimento metodologico del sistema fieristico tedesco; non come norma italiana. Non ripresi requisiti dimensionali o cicli di audit.
- [ISFCERT — La certificazione](https://www.isfcert.eu/certificazione/iso-25639-accredia/la-certificazione/): espone separatamente visitatori, visite, provenienza e tipologia opzionale. Non si afferma di avere letto direttamente il testo integrale delle norme ISO.
- [ISFCERT — Le fasi operative](https://www.isfcert.eu/certificazione/iso-25639-accredia/le-fasi-operative/): ambito riferito alla determinata edizione e verifica documentale. L'articolo invita a chiedere l'attestato applicabile; non riprende tempi procedurali come scadenze universali.
- [Regione Emilia-Romagna — Certificazione dei dati](https://imprese.regione.emilia-romagna.it/internazionalizzazione/sistema-fieristico/strumenti_e_approfondimenti/la-certificazione-dei-dati), aggiornamento indicato **28 aprile 2026**: certificazione accreditata e autodichiarazione sono modalità distinte. Non ripresi incentivi storici o requisiti dei bandi come obblighi per ogni evento.

**Limite di accesso risolto:** due vecchi PDF su `isfcert.it` sono emersi nella ricerca ma il recupero diretto ha restituito un errore di certificato TLS scaduto; un'apertura web dell'allegato ha portato alla home nuova. Non utilizzati come fonte finale né scaricati aggirando TLS. La ricerca è proseguita sulle pagine attuali `isfcert.eu`, effettivamente scaricate e lette. Nessun contatto con organizzatori o certificatori.

## Testo e copertina

**800 parole**, apertura operativa, tre punti iniziali, sei h2, email integrale da copiare e due slot ADS `inline`/`closing`. Link alle fonti vicino alle relative affermazioni. Metadati JSON con i soli sei campi richiesti. Link interno al post sul rimborso verificato nell'elenco LIVE.

Copertina originale IA generata con skill `imagegen` e strumento integrato, senza riferimenti. [Prompt integrale conservato](dati-visitatori-fiera-domande-organizzatore.prompt.md). Scena inventata dichiarata nel testo; nessun luogo, soggetto o marchio reale identificato. PNG originale nel dossier privato, conversione tecnica a WebP con Pillow; nessuna modifica generativa successiva.

`images/blog/dati-visitatori-fiera-domande-organizzatore.webp`: **1600×900, 207.626 byte**, SHA256 `62d77ed5ea20ed3ed868591cedc0f1f316826e993f003cc9b58eb7a3498bf003`. File finale ispezionato visivamente, insieme alle schermate desktop e WebKit e alla lettura senza JavaScript.

## Risorsa definitiva

`downloads/scheda-dati-visitatori-fiera.xlsx`: **16.374 byte**, sei fogli: Istruzioni, Dati, Prove, Email, Esempio, Fonti. Tredici domande con ID corrispondenti fra risposte e prove. Campi operativi inizialmente vuoti; stati guidati, date, documento/pagina e limiti separati. «Ricevuto» non significa certificato o sufficiente. Email modificabile da copiare nel proprio programma di posta; nessun invio dal file. Esempio interamente inventato. Link all'articolo esplicitamente indicato come URL previsto dopo la pubblicazione.

**73 controlli PASS sul file definitivo**: ZIP/XML, assenza di macro, formule di calcolo, connessioni e collegamenti a cartelle esterne; sei soli hyperlink HTTPS espliciti; input vuoti; stati validi e non validi; date mancanti, valide, testuali e fuori intervallo; coerenza degli ID; esempi indipendenti; compilazione e riapertura in memoria, con file originale invariato. Test con Openpyxl; **Excel/LibreOffice non avviati**. Le regole di convalida sono state lette dal file reale e valutate indipendentemente; istruzioni esplicite sull'incolla che può eludere i controlli. Non occorrono cache o ricalcoli di formule.

SHA256 XLSX definitivo: `f6f6c2d310c89e646a676e4f47263507d1650c64980b574558e5f4198220b0a9`. Il download WebKit tramite click dalla preview HTTP locale è identico al file definitivo e alla ricevuta `risorsa-verificata.json`.

## Anteprima locale e limiti

Usati gli handler effettivi `api/blog.js` e `api/sitemap.js`, senza modificarli; il nuovo post è aggiunto solo alla fixture in memoria. Verificati titolo, descrizione, canonical, NewsArticle, copertina, indice e sitemap **di anteprima**. La data visualizzata è una fixture del rendering, non una pubblicazione avvenuta. Regole ADS lette dall'endpoint pubblico e salvate: `ads` e `posts` vuoti; selezione esistente applicata al post locale con due creatività fiere distinte. Spazio Vetrine presente; nessun dato commerciale simulato come reale.

**Cinque percorsi PASS:** Chromium 1440/768/320, WebKit 390 e Chromium 390 senza JavaScript. Titolo/sezioni/ADS, copertina caricata, testo leggibile, assenza di overflow ed errori JavaScript; download effettivo WebKit verificato con hash. Screenshot e ricevuta finale `anteprima-verificata.json` conservati. Scritture analytics e provider intercettate; richieste browser a Supabase isolate. Nessun account, annuncio, email, pagamento o altro dato reale di prova creato.

Adattamenti della sola prova: `NewsArticle.image` è l'array prodotto dal template, non una stringa; `naturalWidth` viene corretto dal browser per i descrittori `srcset`, quindi dimensioni del file controllate separatamente. In Chromium senza JS la prima misura precedeva il primo fotogramma della dissolvenza CSS (opacità 0, animazione a tempo 0). Acquisito il primo fotogramma e attesa la normale conclusione, opacità 1 e testo leggibile; nessuno stile o script del sito alterato. Diagnosi e screenshot conservati. Suite completa finale passata dopo l'adattamento.

## Ripresa coordinata

Worktree `.local/worktrees/accelera1-20261114-1721-17`, branch `articolo/accelera1-20261114-1721-17`, baseline `83194ff753205aa22d61df6cf96ac75615dc2a20`. Backup di sessione eseguito dalla root principale e verificato su origin: `backup/session-20261114-172500-articolo-17-dati-visitatori-preparazione`, destinazione `0378eebc5971145158b405da119f6e92932861f6` (HEAD della root, distinta dalla baseline del worktree). Lavoro altrui preservato; nessuna pulizia aggiuntiva.

Dossier privato: `.local/lavori/articoli/accelerazione-codex1-20261114-1721/articolo-17/` nella root principale. Contiene checkpoint, fonti, script di generazione e test, originali e screenshot. Consegna del turno in `prepared.json` e `prepared.md`, con commit dei soli sei materiali e hash definitivi. **Nessun INSERT/UPDATE/DELETE, push a main o pubblicazione eseguito.** Verifiche online, schema/trigger e nuovo baseline LIVE spettano al secondo turno, dopo integrazione sequenziale di `origin/main` secondo mandato; non vanno dichiarate già superate.
