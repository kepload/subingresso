# Fonti e verifiche: comprare un banco ancora affittato

Priorità **53**, ruolo **D**. **Pubblicato e verificato il 13 novembre 2026.** `prepared:true`, `published:true`. Un solo articolo; ripiego 6 non utilizzato.

## Ambito e duplicati

Letti **135 titoli live** tramite API pubblica il 13 novembre 2026, prima della scrittura. Nessun articolo specifico sull'acquisto da un proprietario mentre la gestione è ancora affidata a un terzo. Il post esistente `fine-affitto-posteggio-reintestazione-licenza` riguarda il rientro alla fine dell'affitto; quello sulla caparra cita soltanto l'esistenza di affitti. Questa guida raccoglie invece i controlli dell'acquirente prima dell'impegno, tenendo distinti acquisto, rilascio e avvio.

Nessuna operazione reale esaminata, data di disponibilità stimata o frequenza commerciale inventata. L'esempio marzo/giugno/luglio è dichiarato inventato. La scheda organizza domande per notaio e SUAP, senza proporre clausole, un termine di disdetta o una sequenza amministrativa universali.

## Fonti primarie lette

Normattiva: pagine scaricate direttamente **HTTP 200**, testo selezionato effettivamente letto, versione **vigente al 13/11/2026**. Copie HTML, estrazioni e hash nel dossier privato:

- [Codice civile, art. 1372](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=1372&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=2&atto.codiceRedazionale=042U0262&atto.dataPubblicazioneGazzetta=1942-04-04): efficacia e scioglimento del contratto. Non usato per attribuire da solo all'acquirente una posizione specifica.
- [Codice civile, art. 1599](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=1599&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=2&atto.codiceRedazionale=042U0262&atto.dataPubblicazioneGazzetta=1942-04-04): condizioni ed eccezioni dell'opponibilità della locazione al terzo acquirente. Nessuna estensione automatica a tutti gli affitti d'azienda, beni mobili o concessioni pubbliche.
- [Codice civile, art. 1602](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=1602&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=2&atto.codiceRedazionale=042U0262&atto.dataPubblicazioneGazzetta=1942-04-04): subentro dell'acquirente tenuto a rispettare la locazione. La compatibilità col contratto d'azienda e le conseguenze concrete sono affidate al professionista.
- [Codice civile, art. 1615](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=1615&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=2&atto.codiceRedazionale=042U0262&atto.dataPubblicazioneGazzetta=1942-04-04) e [art. 2562](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=2562&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=2&atto.codiceRedazionale=042U0262&atto.dataPubblicazioneGazzetta=1942-04-04): inquadramento del godimento produttivo e rinvio alla disciplina dell'usufrutto d'azienda; non se ne ricava un termine standard.
- [Comune di Paderno Dugnano, commercio su posteggio in concessione](https://www.comune.paderno-dugnano.mi.it/servizi/imprese-e-commercio/dettaglio-servizio/Commercio-al-dettaglio-su-aree-pubbliche-su-posteggio-in-concessione-segnalare-il-subentro-il-trasferimento-di-sede-il-cambiamento-di-ragione-sociale-la-sospensione-dellattivita-e-la-cessazione/): **HTTP 200**, pagina aggiornata il 29 maggio 2026. Certificazione notarile per subingresso, SCIA formalmente completa e controlli successivi. Citata soltanto come esempio locale; non prova la consegna materiale e non risolve la specifica sequenza di vendita durante un affitto.

Per il solo inquadramento è stato letto anche il [Capitolo 1 della Fondazione Italiana del Notariato, di Maria Pia Nastri](https://elibrary.fondazionenotariato.it/articolo.asp?art=26/2602), **HTTP 200**: le regole generali della locazione si applicano all'affitto d'azienda secondo compatibilità. È uno studio storico, non una fonte di aggiornamento per diritto concorsuale, imposte o procedimenti amministrativi. Nessuna di queste sue parti è ripresa.

**Limiti di accesso:** il tool web non apriva le URL puntuali Normattiva; la lettura diretta ha recuperato i testi e la data di vigenza. Milano ha risposto **403**; NormeLombardia ha restituito una pagina di rifiuto, pur con HTTP 200: entrambe escluse dalle affermazioni finali. Non si è ricostruita una regola da frammenti indicizzati. Ricevute: `fonti-ricevute.json`.

## Risorsa definitiva

`downloads/scheda-acquisto-banco-affittato.xlsx`, **18.275 byte**, sette fogli: Istruzioni, Banco, Affitto, Calendario, Verifiche, Esempio, Fonti. Tutti i campi operativi iniziano vuoti. Separati natura del termine, data ipotizzata, data riscontrata, responsabile, prova e stato. L'esempio inventato lascia non riscontrati rilascio e pratica SUAP. Nessuna formula, macro, connessione dati o collegamento a cartelle esterne; sette hyperlink HTTPS espliciti, nessun invio.

**72 controlli PASS sul file definitivo**: integrità ZIP, input vuoti, struttura e stampa, esempio, copertura delle convalide, stati ammessi/non ammessi, date mancanti/valide/testuali/fuori intervallo, compilazione e riapertura di una copia in memoria. Convalide lette dal file reale e valutate indipendentemente; Excel/LibreOffice non avviati. Istruzioni esplicite: un incolla può eludere le convalide; «Verificato» richiede prova e responsabile. Nessuna conclusione legale deriva dal riempimento del foglio.

SHA256 finale XLSX: `b1cff271cc8832f06998de90b0aa6626abfd676f40765cd87e8c968d88519dd6`. Ricevuta `risorsa-verificata.json`; il download effettivo WebKit dalla preview HTTP locale ha lo stesso hash. Nessuna cache di formule necessaria o aggiunta.

## Copertina e anteprima

Copertina originale con skill imagegen e strumento integrato `image_gen`, nessuna immagine di riferimento. [Prompt conservato](comprare-banco-ancora-affittato.prompt.md). File `images/blog/comprare-banco-ancora-affittato.webp`, **1600×900**, **210.370 byte**, SHA256 `40bc40a32e29142271590973d015aee8db0e5f1df8bbb052e0a9ec409b2fca72`. Scena inventata dichiarata nel testo. Originale generato conservato nella posizione predefinita dello strumento; asset finale presente nel worktree.

**615 parole**, sei h2, hook e tre punti iniziali; due ADS `inline`/`closing`, download e link di approfondimento. Rendering SSR corrente, senza modifiche a template, CSS, servizi o schema. Regole ADS lette dall'API pubblica, restituite vuote `ads/posts`; selezione esistente applicata al post locale: creatività per **acquisto**, due ID distinti per visita. Spazio Vetrine presente nel markup; dati commerciali non simulati come reali.

**Cinque percorsi PASS:** Chromium 1440/768/320, WebKit 390, Chromium 390 senza JavaScript. Verificati titolo, descrizione, canonical, NewsArticle, copertina caricata, sei sezioni, due ADS, assenza di overflow/errori JavaScript, lettura senza JS e download effettivo. Quattro screenshot conservati; desktop e WebKit esaminati visivamente. Richieste di scrittura browser intercettate, letture Supabase isolate per la preview; nessun account, invio o dato reale modificato.

**Correzione alla prova:** il primo tentativo di download con intercettazione della pagina pubblica ha ottenuto il documento HTML del sito per un asset non ancora online, anziché l'XLSX locale (2.681 byte). Il controllo hash lo ha respinto. L'anteprima finale usa un server HTTP locale in sola lettura e il click WebKit scarica correttamente **18.275 byte**. Non era un difetto del file XLSX; prova finale riuscita prima dell’inserimento del post.

## Consegna e pubblicazione coordinata

Backup remoto preventivo verificato: `backup/session-20261113-185723-articolo-d-banco-affittato-53`, HEAD `2d3cc91`. Worktree esclusivo `.local/worktrees/quattro-articoli-20261113-1853-d`, branch `articolo/quattro-d-20261113-1853`.

Dossier: `.local/lavori/articoli/quattro-articoli-20261113-1853/D/`. Ricevuta anteprima: `comprare-banco-ancora-affittato-anteprima-verificata.json`, con hash di contenuto, copertina e risorsa. Generatore e verifica della risorsa, script solo anteprima, fonti e screenshot conservati. L'autore non modifica registro/elenco editoriale e non esegue INSERT/UPDATE/DELETE nel DB. URL previsto: <https://subingresso.it/blog?post=comprare-banco-ancora-affittato>.

**Pubblicato e verificato il 13 novembre 2026.** La pagina pubblica e le risorse sono state verificate; esiti sotto.


## Pubblicazione verificata il 13 novembre 2026

[Articolo pubblico](https://subingresso.it/blog?post=comprare-banco-ancora-affittato), ID `78b8459b-62e1-4d4e-b531-ac8d25794742`. Preparato nella nuova sessione Codex 7 e pubblicato dal coordinatore. Materiali integrati `0c710b2`, Vercel riuscito `6QnGn7Cfa3NdRpbB1TSkgFyMZBwk`; copertina e XLSX online HTTP 200 con hash identici alle consegne.

Prima degli inserimenti: lettura dei 135 articoli correnti, controllo duplicati, schema e vincoli; nessun trigger applicativo. Quattro soli nuovi post inseriti in sequenza. I 135 precedenti sono invariati in tutti i campi letti; totale 139. Nessun invio o modifica ai servizi.

Pagina HTTP 200, titolo, descrizione, canonical, NewsArticle, indice e sitemap verificati. Cinque percorsi online PASS: Chromium 1440/768/320, WebKit 390 e lettura senza JavaScript; download WebKit identico, due ADS contestuali, nessun overflow o errore JavaScript. Scritture del browser intercettate.

Ricevute di inserimento, HTML, screenshot, esito del singolo post ed `esito-finale.json` nel dossier del coordinatore `.local/lavori/articoli/quattro-articoli-20261113-1853/`. La consegna iniziale dell’autore resta conservata come prova della fase precedente alla pubblicazione.
