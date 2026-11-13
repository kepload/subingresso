# Fonti ed esito: caparra per comprare un posteggio

Priorità **33**, sviluppata il **12 novembre 2026** in sessione e worktree separati e **pubblicata il 13 novembre 2026** dopo il ripristino di Supabase. Articolo completo con risorsa gratuita. Il punto 14 resta aperto; il distinto articolo 32 è stato pubblicato nella stessa ripresa.

## Fonti primarie e limiti

- [Normattiva, Codice civile art. 1385](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=1385&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=2&atto.codiceRedazionale=042U0262&atto.dataPubblicazioneGazzetta=1942-04-04): caparra confirmatoria, restituzione/imputazione in caso di adempimento e scelta dei rimedi in caso di inadempimento. Non si presenta il doppio come accredito automatico per ogni trattativa saltata.
- [Normattiva, art. 1353](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=1353&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=2&atto.codiceRedazionale=042U0262&atto.dataPubblicazioneGazzetta=1942-04-04): evento futuro e incerto per subordinare l'efficacia o la risoluzione. Nessuna clausola pronta da sottoscrivere.
- [Normattiva, art. 1386](https://www.normattiva.it/atto/caricaDettaglioAtto?atto.articolo.numero=1386&atto.articolo.sottoArticolo=1&atto.articolo.tipoArticolo=2&atto.codiceRedazionale=042U0262&atto.dataPubblicazioneGazzetta=1942-04-04): caparra penitenziale collegata al diritto di recesso pattuito, distinta dalla confirmatoria.
- [Comune di Paderno Dugnano, subentro nel commercio su posteggio in concessione](https://www.comune.paderno-dugnano.mi.it/servizi/imprese-e-commercio/dettaglio-servizio/Commercio-al-dettaglio-su-aree-pubbliche-su-posteggio-in-concessione-segnalare-il-subentro-il-trasferimento-di-sede-il-cambiamento-di-ragione-sociale-la-sospensione-dellattivita-e-la-cessazione/): requisiti, pratica telematica e certificazione notarile dell'avvenuto trasferimento del ramo d'azienda. Esempio locale: nessun termine o requisito esteso a tutti i Comuni. Pagina aggiornata il 29 maggio 2026, consultata il 12 novembre.

Quattro fonti HTTP 200, testo effettivo degli articoli esaminato e copie/hash conservati nel dossier privato. Normattiva mostra il testo vigente al 12 novembre 2026 e ultimo aggiornamento all'atto del 23 ottobre 2026; non si afferma che gli articoli citati siano stati modificati in quella data. Milano restituisce 403 ed è esclusa dalle fonti dell'articolo e del file finale. Alcune aperture via ricerca web non funzionavano; le tre pagine Normattiva sono state raggiunte direttamente e il loro testo controllato. Ricevute in `.local/lavori/articoli/caparra-posteggio-20261112/fonti-ricevute.json` nella root principale.

Checklist, ordine dei controlli e domande sono proposte redazionali da adattare col professionista. Nessuna valutazione del singolo contratto, percentuale consigliata di caparra o garanzia di subingresso. La sequenza fra firma e pratica deve essere praticabile: non si propone di subordinare una firma a un esito ottenibile soltanto dopo quella stessa firma. Esempio inventato: prezzo 20.000, caparra imputata 2.000 e saldo 18.000 euro; imposte e spese separate.

## Risorsa e copertina

`downloads/scheda-caparra-posteggio-notaio.xlsx`: sei fogli, Istruzioni, Dati acquisto, Verifiche, Condizioni, Scadenze e Fonti. Modello vuoto, esiti iniziali Da verificare, menu con quattro stati manuali. Campi per documento/fonte, responsabile, data, prova ed esigenza da discutere; distinzione tra scadenze concordate e termini amministrativi da verificare. Nessuna formula, macro, connessione o invio al sito; quattro collegamenti documentali. Impostazione stampa A4 orizzontale con intestazioni ripetute. Controllati archivio ZIP, fogli, input vuoti, validazione, assenza di formule/connessioni e impostazioni stampa; generatore e ricevuta nel dossier. SHA256: `9cb3ad215f38896a7b28a5d6ea4860e2d34361b1b72ee060f61bb546b096f466`.

Copertina originale con skill imagegen e strumento integrato, WebP 1600×900, scena inventata dichiarata nel testo. Prompt integrale nel file omonimo `.prompt.md`; originale nel dossier privato. Risorsa definitiva: `images/blog/caparra-comprare-posteggio-verifiche-notaio.webp`. SHA256: `bc8b83a206fd4bdd96330ba84c4d1f9ed3b10c12d87f67656a6d67a40c94ef0c`.

## Verifiche e preparazione del 12 novembre

Testo di **594 parole**, sei sezioni brevi, tre punti iniziali, due slot ADS contestuali esistenti e spazio Vetrine conservato. Nessuna modifica ai template. Anteprima isolata con rendering SSR corrente: Chromium 1440/768/320, WebKit 390 e Chromium senza JavaScript **PASS**. Verificati titolo, descrizione, canonical, NewsArticle, copertina, download, due ADS pertinenti all'acquisto e assenza di overflow/errori JavaScript. Tutte le scritture browser intercettate. Le regole contestuali usate nell'anteprima sono una fixture vuota esplicita, con selezione dal catalogo esistente: non una certificazione delle regole o del database live.

Ricerca iniziale dei duplicati: nessun precedente titolo/slug su caparra/preliminare nella baseline storica di 131 articoli del 10 novembre e nei metadati locali; il nuovo titolo stesso è escluso dal confronto. Il controllo live, impossibile durante il blocco, è stato completato il 13 novembre prima della pubblicazione.

Prima prova diretta alle **23:27 CET**: REST **522**, Management SQL **544** anche per `SELECT 1`, pagina blog **503**. Nessun INSERT, nessun aggiornamento di articoli precedenti e nessun intervento sui servizi. Schema e trigger correnti non verificabili: lo script di pubblicazione richiede letture vive, duplicati, schema e trigger prima di un eventuale inserimento. Nuove prove ed esiti Git/Vercel vengono aggiunti sotto.

Backup remoto preventivo verificato: `backup/session-20261112-232224-articolo-caparra-posteggio-33`, HEAD `ed172fe`. Worktree `.local/worktrees/articolo-caparra-posteggio-20261112`, ramo `articolo/caparra-posteggio-20261112`. Materiali e verifiche private nella root principale, `.local/lavori/articoli/caparra-posteggio-20261112/`.

[Articolo pubblico](https://subingresso.it/blog?post=caparra-comprare-posteggio-verifiche-notaio), ID `96355d9d-2b66-4229-9c1a-debffc5e0c4d`, inserito il 13 novembre alle 00:55:18 UTC.

## Distribuzione dei materiali e blocco del 12 novembre

Materiali `d232448`, integrazione di origin/main fino a `04d1013` e push `0302bf2`. Conservati il punto 32, il suo registro aggiornato e tutti i suoi oggetti Git; il punto 14 è invariato. Gitleaks superato sul commit dei materiali e sull'integrazione. Vercel **success**, deploy `79oD19AKq4XRLgtJxanhcdrAxbJc`: copertina e XLSX online HTTP 200, SHA256 identici ai file verificati. Download effettivo del foglio in WebKit 390 sull'anteprima riuscito e identico.

Ultima prova del 12 novembre alle **23:33 CET (22:33 UTC)**: REST **522**, Management SQL **544**, blog **503**, dopo due prove precedenti con lo stesso esito. A quella data nessun INSERT eseguito e nessun ID assegnato; non verificabili duplicati/schema/trigger correnti, pagina pubblica del nuovo post, indice/sitemap o conservazione completa del DB. Nessuna riparazione, automazione o ciclo di riprova avviato. Il solo deploy delle risorse non era una pubblicazione dell'articolo.

Storico e prove nel dossier privato: `consegna.md`, `esito-finale.json`, `verifica-pubblicazione.cjs`, ricevute `stato-live-*.json`, screenshot e copie delle fonti.

## Pubblicazione verificata il 13 novembre 2026

Prima dell'inserimento sono stati letti tutti i titoli correnti, lo schema, i vincoli e i trigger: nessun duplicato del tema, vincolo UNIQUE sullo slug, nessun trigger applicativo. La baseline di 133 post comprendeva il distinto articolo 32 appena pubblicato. Un solo inserimento del punto 33; tutti i 133 record precedenti invariati in ogni campo letto, 134 totali. Anche il confronto con la baseline iniziale dei 132 post prima di entrambi gli inserimenti è riuscito.

Pagina pubblica HTTP 200, titolo, descrizione, canonical, NewsArticle, presenza nell'indice e nella sitemap verificati. Copertina e XLSX HTTP 200 con hash identici, deploy dei materiali `45ab266` riuscito. Verifica online Chromium 1440/768/320, WebKit 390 e lettura senza JavaScript: cinque percorsi PASS, download WebKit identico al file locale, due ADS contestuali per acquirenti, nessun overflow o errore JavaScript. Tutte le scritture del browser intercettate; nessuna email o modifica ai servizi. Ricevute dell'inserimento e delle verifiche, HTML, screenshot ed esito finale nel dossier privato già indicato.
