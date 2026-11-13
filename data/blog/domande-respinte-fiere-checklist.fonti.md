# Fonti e verifiche: domande respinte alle fiere

Priorità **43**, ruolo A, 13 novembre 2026. **Pubblicato e verificato il 13 novembre 2026.** `prepared:true,published:true`. Nessun ricorso al ripiego 61.

## Ambito e duplicati

Riletti via API pubblica i **135 titoli live** prima della preparazione. Nessun articolo specifico sulle cause di esclusione documentate e sulla checklist prima dell'invio. La guida sulle presenze mancanti riguarda la correzione del punteggio; questo testo distingue ammissibilità, invio ed esito. Baseline privata `titoli-live.json`.

I casi sono esiti di edizioni concluse, non bandi aperti né campione statistico. Nessuna frequenza nazionale, tasso di esclusione o generalizzazione fra Comuni. Nessun nome, protocollo, titolo identificativo o altro dato degli operatori esclusi viene riprodotto nei materiali pubblici.

## Fonti primarie effettivamente lette

Quattro PDF ufficiali scaricati **HTTP 200**, originali conservati nel dossier privato con SHA256, ricevuta `fonti-ricevute.json`. Testi estratti per pagina; verificata visivamente la tabella dei motivi di Lecce. Consultazione del **13 novembre 2026**.

- [Giaveno, determina 459 del 6 settembre 2024](https://www.comune.giaveno.to.it/it-it/download/determina-n-459-del-06-09-2024-graduatoria-fiera-mercato-d-autunno-2024-160711-9-1010-0268a4fadaf3f2e7a6ee19bd418366f5), pagina 2: quattro domande non accolte perché fuori tempo utile. È un fatto amministrativo di quell'edizione; il termine locale non è esteso ad altre fiere.
- [Giaveno, determina 503 del 10 settembre 2026](https://www.comune.giaveno.to.it/en-us/download/dt-503-del-10-09-2026-graduatoria-fiera-d-autunno-2026-174616-9-1010-1de352bdf7615765c1883d6e93fcc4e6), pagine 2–3: procedura digitale e diritti con pagoPA; cinque domande respinte per requisiti di partecipazione. Il testo non attribuisce automaticamente le esclusioni al mancato pagamento. Nessuna specificazione più precisa dei motivi viene dedotta dal requisito generale.
- [Giaveno, determina 520 del 18 settembre 2026](https://www.comune.giaveno.to.it/en-us/download/dt-520-del-18-09-2026-rettifica-graduatoria-fiera-d-autunno-2026-174678-9-1010-7ad9835fbf56ae8959f253fc13fe9ae1), pagina 2: rettifica delle presenze degli ammessi; conferma esplicita dell'allegato 2 invariato. Non conteggiata come nuova serie di domande o nuovi dinieghi.
- [Lecce, graduatoria Fiera natalizia del 25 novembre 2025](https://www.comune.lecce.it/docs/default-source/notizie/graduatoria-natale-2025_pubblica.pdf), pagina 5: motivi relativi a requisiti incompleti, attività non ammessa e richiesta di vendita con autonegozio. Pagina 4: graduatoria distinta per automarket sulla carreggiata di piazza Mazzini. Nessun divieto generale degli autonegozi; la dicitura generica sui requisiti non consente di indicare quale documento mancasse. Nessuna identificazione degli interessati riprodotta.

I controlli su firma, delega, leggibilità, ricevute e versione degli allegati sono una proposta redazionale da applicare all'avviso specifico. Non vengono presentati come cause riscontrate negli esiti se questi non le dettagliano. Tempi e modalità di osservazioni/riesame restano quelli del singolo atto; nessun termine giuridico universale inventato. Per contestazioni è indicata assistenza qualificata.

Le prime richieste Node agli originali Giaveno si sono fermate per catena certificato non verificabile; nessun TLS disabilitato. Recupero riuscito con lo stack Windows `Invoke-WebRequest`, quattro risposte 200 conservate. Non è stato necessario usare i vecchi PDF Brescia o i frammenti indicizzati non scaricabili.

## Risorsa gratuita finale

`downloads/checklist-domanda-fiera-prima-invio.xlsx`, cinque fogli: Istruzioni, Checklist, Registro invio, Esempio inventato, Fonti. **18 controlli** con stati vuoti e lista Da verificare / Verificato / Non richiesto; prova e azione da annotare. Registro vuoto con 16 righe per invii, ricevute, integrazioni, risposte, esiti e rettifiche. Metadati dell'edizione, date, ora limite e riferimenti dell'avviso. Esempio completamente inventato e separato.

**24 controlli superati sul file definitivo** con openpyxl e lettura XML/ZIP: input vuoti, stati consentiti e casi non validi, intervalli delle convalide, date/orario, esempio, fogli, filtri, stampa, blocchi, collegamenti alle quattro fonti, archivio valido e assenza di macro, formule o connessioni dati. Nessuna cache Excel da ricalcolare. Le convalide sono controllate nel file, non attraverso l'interfaccia Excel; l'incolla può aggirarle e questo limite è scritto nelle istruzioni. Non esiste un risultato automatico di ammissibilità. Ricevuta privata `risorsa-verificata.json`.

SHA256 XLSX finale: `5688a221460521b42e8074f783af41ec6aabd19b9625075621bb32d754cc2a33`.

## Copertina e anteprima

Copertina originale generata con skill imagegen e strumento integrato; scena inventata dichiarata nel testo. [Prompt integrale](domande-respinte-fiere-checklist.prompt.md). Conversione e ritaglio centrale in WebP **1600×900**; immagine finale visionata. SHA256: `d17752887a1222d54cb7bd7b08783dd0037ed73d4321547b81c12469fb03beb6`.

Articolo di circa **549 parole**, sei sezioni h2, hook, tre punti iniziali e due slot ADS inline/closing. Rendering corrente del worktree, template e servizi invariati. Verificati titolo, descrizione, canonical pubblico, NewsArticle, sanitizzazione, copertina e link al download. Slot Vetrine presente nel rendering; dati delle inserzioni simulati vuoti, nessun dato personale caricato.

**Cinque percorsi PASS:** Chromium 1440/768/320, WebKit 390 e Chromium senza JavaScript. Nessun overflow o errore JavaScript; due ADS contestuali per fiere, regole pubbliche lette prima dell'anteprima. Download effettivo in WebKit con SHA256 identico al file finale. Screenshot desktop/mobile esaminati. Tutte le scritture browser intercettate; nessun invio o account di prova.

L'anteprima usa un server locale temporaneo su loopback per servire i file del worktree. I primi tentativi con intercettazione dell'origine pubblica non coprivano il download nativo di WebKit e restituivano la pagina 404 pubblica; la prova definitiva usa il download locale effettivo. Un controllo iniziale dal cwd errato e un controllo dei percorsi Windows nell'helper locale sono stati corretti negli strumenti privati, senza modificare il sito. Ricevuta definitiva `domande-respinte-fiere-checklist-anteprima-verificata.json` con hash coerenti.

## Isolamento e consegna

Worktree `.local/worktrees/quattro-articoli-20261113-1853-a`, branch `articolo/quattro-a-20261113-1853`. Backup preventivo remoto verificato: `backup/session-20261113-185719-quattro-articoli-a-domande-fiere`, base `2d3cc91`. Nessuna modifica al checkout principale, ai file editoriali comuni, ai template o ai dati del database.

Dossier privato: `.local/lavori/articoli/quattro-articoli-20261113-1853/A/`. Contiene originali, ricevute, baseline, generatori, controlli, screenshot e `consegna.json` / `consegna.md`. Il coordinatore ha completato integrazione, deploy, inserimento DB e controlli sui veri URL; esiti sotto.


## Pubblicazione verificata il 13 novembre 2026

[Articolo pubblico](https://subingresso.it/blog?post=domande-respinte-fiere-checklist), ID `57b40695-f0cf-4c3b-a53f-edc12be7f595`. Preparato nella nuova sessione Codex 4 e pubblicato dal coordinatore. Materiali integrati `0c710b2`, Vercel riuscito `6QnGn7Cfa3NdRpbB1TSkgFyMZBwk`; copertina e XLSX online HTTP 200 con hash identici alle consegne.

Prima degli inserimenti: lettura dei 135 articoli correnti, controllo duplicati, schema e vincoli; nessun trigger applicativo. Quattro soli nuovi post inseriti in sequenza. I 135 precedenti sono invariati in tutti i campi letti; totale 139. Nessun invio o modifica ai servizi.

Pagina HTTP 200, titolo, descrizione, canonical, NewsArticle, indice e sitemap verificati. Cinque percorsi online PASS: Chromium 1440/768/320, WebKit 390 e lettura senza JavaScript; download WebKit identico, due ADS contestuali, nessun overflow o errore JavaScript. Scritture del browser intercettate.

Ricevute di inserimento, HTML, screenshot, esito del singolo post ed `esito-finale.json` nel dossier del coordinatore `.local/lavori/articoli/quattro-articoli-20261113-1853/`. La consegna iniziale dell’autore resta conservata come prova della fase precedente alla pubblicazione.
