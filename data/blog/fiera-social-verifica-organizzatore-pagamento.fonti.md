# Articolo 26: fiera trovata sui social

Preparato il 23 novembre e **pubblicato e verificato il 24 novembre 2026**. Titolo assegnato conservato; categoria `Fiere`, autore Redazione Subingresso. La preparazione non ha eseguito pubblicazioni o scritture DB; la successiva pubblicazione autorizzata è documentata sotto. Dossier privato: `.local/lavori/articoli/20261123-condiviso/codex2/articolo-26/`.

## Ambito e duplicati

Letti il **23 novembre 2026 tutti i 149 titoli live**, tramite GET pubblico con sole colonne id, slug, title e category. Slug e titolo assenti. Ricevute `titoli-live.json` e `duplicati.json`.

I post su dati dei visitatori, domande respinte e rimborso per maltempo trattano problemi diversi. Qui il tema è l'identità di chi propone un posto sui social, il collegamento con l'edizione e la sede, le condizioni scritte e il destinatario dell'acconto. Nessun caso reale, organizzatore identificabile, pagamento o prova sul campo simulati.

## Fonti primarie lette il 23 novembre 2026

Copie HTML, estrazioni testuali, orari, URL finali e SHA256 nel dossier privato; sei pagine recuperate direttamente con **HTTP 200**. Consultati anche i testi con lo strumento web. Nessuna interrogazione dei registri con dati di persone o imprese reali.

- [Registro Imprese: visura camerale](https://www.registroimprese.it/visura-camerale-ordinaria-storica-e-certificato). Passaggio pertinente: «la denominazione, la forma giuridica, la sede legale, il codice fiscale». La pagina descrive anche le cariche. Uso: confronto dei dati dell'impresa e di chi firma. Limiti: riguarda i soggetti iscritti; la visura non è una certificazione dell'evento o una garanzia commerciale. Non riportati prezzi, validità universali o obblighi associativi.
- [INI-PEC: ricerca](https://www.inipec.gov.it/cerca-pec) e [funzionamento](https://www.inipec.gov.it/come-funziona-ini-pec). Passaggio pertinente: «Sezione Imprese» e «Sezione Professionisti». Uso: reperire separatamente la PEC pertinente. Limite: non dimostra che una pagina social appartenga al soggetto; non è un elenco generale di tutte le associazioni. Il testo normativo riprodotto nella pagina è informativo: non usato per ricavare nuovi obblighi.
- [Agenzia delle Entrate: verifica partita IVA](https://telemanagrafici.agenziaentrate.gov.it/VerificaPIVA/Scegli.jsp). Passaggio pertinente: «stato di attività e sulla denominazione o sul cognome e nome del titolare». Uso: confrontare titolare e stato, senza trasformarli in giudizio di affidabilità. Il modulo richiede una verifica manuale con codice di sicurezza; non eseguite ricerche di soggetti reali.
- [Agenzia delle Entrate: verifica codice fiscale](https://telemanagrafici.agenziaentrate.gov.it/VerificaCF/Scegli.jsp). Passaggio pertinente: «Verifica e corrispondenza tra il codice fiscale e la denominazione di un soggetto diverso da persona fisica». Uso: suggerire il controllo appropriato per un ente che comunica il CF. Limiti: non prova rappresentanza, autorizzazione o partita IVA; nessun dato inventato usato nel servizio.
- [Banca d'Italia: verifica del beneficiario](https://www.bancaditalia.it/media/notizia/la-banca-d-italia-fornisce-informazioni-sulla-verifica-del-beneficiario-vop-per-i-bonifici-ordinari-e-istantanei/Banca/), notizia del 20 ottobre 2025 riletta oggi. Passaggio pertinente: «corrispondenza, mancata corrispondenza, corrispondenza parziale o impossibilità di verifica». Uso: leggere l'esito nome-IBAN prima di confermare. Limite: il servizio confronta dati bancari e non certifica l'effettiva organizzazione della fiera. Non eseguito alcun bonifico, accesso bancario o test finanziario reale.

Le indicazioni di cercare un contatto indipendente, confermare edizione e sede, conservare le prove e chiarire le condizioni sono **raccomandazioni operative editoriali**, costruite sui limiti dei controlli. Non sono obblighi legali universali, clausole contrattuali o promesse di rimborso. Una ricerca senza risultato non prova una frode. Nessun contatto a terzi.

## Risorsa gratuita

`downloads/checklist-fiera-social-organizzatore-pagamento.xlsx`: cinque fogli, Istruzioni, Dati, Controlli, Esempio, Fonti. Sedici campi inizialmente vuoti; dodici controlli con stato, riferimento alla prova e data da annotare. L'esempio è dichiarato inventato e lascia aperto il cambio IBAN. Non contiene nomi, codici fiscali, coordinate bancarie o eventi reali.

Gli stati ammessi dipendono dalla riga. «Non applicabile» è consentito solo per Registro Imprese, cambio coordinate e verifica nome-IBAN, con motivazione. Le formule contano le righe annotate, segnalano prove mancanti e dubbi; non controllano il contenuto delle prove e non autorizzano pagamenti. Un incolla può aggirare le convalide: limite spiegato nelle istruzioni.

**28 casi di formule e 392 confronti PASS**, formule lette dall'XLSX e valutate con `formulas.ExcelModel`, riferimento indipendente in Python. Controllati input vuoti, stato non valido/testuale/numerico, prova vuota/spazi/numerica, non applicabilità ammessa e vietata, casi completi e parziali. Integrità ZIP, riapertura, celle iniziali, stampa, convalide, cinque link HTTPS, assenza di macro, connessioni e formule esterne verificate. Cache iniziali ricalcolate e controllate nel file definitivo. Excel/LibreOffice non avviati. Ricevuta: `risorsa-verificata.json`.

## Copertina originale

Generata con skill imagegen e strumento integrato `image_gen`, senza riferimenti fotografici, il 23 novembre 2026. [Prompt effettivo](fiera-social-verifica-organizzatore-pagamento.prompt.md). Scena inventata con mani, invito social astratto e checklist; nessun evento o dato leggibile. Dichiarazione IA nel testo pubblico. Originale conservato; WebP finale **1600 × 900**, 239.510 byte, esaminato visivamente.

## Verifiche e consegna

Testo pubblico **2.471 caratteri, 372 parole**, hook e tre risposte iniziali, sei h2, CTA nel corpo e finale, fonti in fondo. Rendering tramite il vero handler `api/blog.js` del worktree, HTTP locale e fixture del solo articolo; data di pubblicazione e regole ADS sono fixture dichiarate, nessun dato live simulato come effettivo.

**Cinque percorsi PASS**: Chromium 1440/768/320, WebKit 390, Chromium 390 senza JavaScript. Verificati titolo, excerpt, canonical, JSON-LD NewsArticle, sei sezioni, due ADS con ID distinti, copertina caricata e assenza di overflow/errori JS. Cinque screenshot conservati e ispezionati. Download effettivo con click WebKit e senza JS: **16.153 byte**, SHA256 uguale al file finale. Richieste di scrittura e API/provider isolate; nessuna analitica reale. Ricevute: `fixture-ssr.json`, `anteprima-verificata.json`, `richieste-intercettate.json`.

Correzioni alla sola verifica: i link delle creatività ADS non sono file statici; `naturalWidth` risente dei descrittori `srcset` e non misura la dimensione fisica del WebP; lo script del CDN Supabase deve essere caricato mentre le chiamate dati restano intercettate. Senza JavaScript, attesa del completamento dell'animazione CSS misurata da Node. Quattro prove browser già riuscite sono state riprese dalla ricevuta intermedia e non ripetute durante l'ultima correzione. Nessuna modifica a componenti del sito.

Hash finali degli asset:

- Copertina: `4e285f61042a1be65d2866c8f6f2551dfc04500f338d3c71e39fc40b14a4f94f`.
- Checklist XLSX: `8e8044a469d04a1f0b0c6546b5d763fbb52c077bdd67a95291c041b03e90c376`.

Alla preparazione il dossier conteneva script di anteprima, fixture del solo post, ricevute e checkpoint, senza modalità di pubblicazione nello script locale. Backup di sessione e ramo remoto preventivo del coordinatore verificati. Committati soltanto i sei file assegnati; elenco editoriale, registro e main non modificati in quella fase. Template, CSS, JS, API e servizi invariati anche nella pubblicazione.

## Pubblicazione verificata del 24 novembre 2026

- [Articolo online](https://subingresso.it/blog?post=fiera-social-verifica-organizzatore-pagamento), ID `157bfc33-4f45-4880-a676-52cccae6117c`. Un solo INSERT, dopo lettura live di schema, vincoli, trigger e post; nessun UPDATE/DELETE o modifica di servizi, schema e whitelist.
- Materiali preparati `b65f7c9ce72208ce3ac15108ab37e3f419112b46`, merge conservativo e sito `b990b99e7086445f8276c22335823b6cbccdb57b`. Il push era già riuscito il 23 novembre: alla ripresa non è stato ripetuto. [Deploy Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/9MRkMnuntUjpcYWwnh3sk18AfdKs); asset pubblici HTTP 200 con i due hash riportati sopra, verificati prima dell'INSERT.
- Testo, copertina e XLSX della preparazione riutilizzati senza nuove ricerche o generazioni. Risorsa definitiva: cinque fogli, 28 casi / 392 confronti formula già PASS; nessuna macro o connessione.
- SSR, titolo, excerpt, canonical, JSON-LD NewsArticle, sei sezioni, ADS distinte, indice e sitemap verificati online. Chromium 1440/768/320, WebKit 390 e Chromium 390 senza JS: cinque percorsi PASS, nessun overflow o errore JS. Download effettivi WebKit e senza JS uguali al file definitivo; HTML e asset pubblici reali, con scritture analytics/provider intercettate. Screenshot desktop e WebKit esaminati.
- SELECT della funzione privata `account_private.is_fair_registration_path` sui percorsi prodotti dal normalizzatore Auth esistente per URL canonico, legacy `.html?post=` e percorso normalizzato: tutti riconosciuti dal bollino Fiera. Nessun account creato e nessuna modifica ai servizi.
- Confronto completo dei nove campi letti: **151 articoli precedenti invariati, 152 totali**. Aggiornata soltanto la riga 26 dell'elenco, aggiunta una voce datata al riepilogo e completato questo dossier fonti, conservando tutte le voci altrui.
- Ricevute private: `schema-pre-insert.json`, `insert-intent.json`, `insert-ricevuta.json`, `deploy-b990b99.json`, `online-verificata.json`, `indice-sitemap-verificati.json`, `bollino-fiera-verificato.json`, `post-preservati-finale.json`, `result.json` e `result.md`.
