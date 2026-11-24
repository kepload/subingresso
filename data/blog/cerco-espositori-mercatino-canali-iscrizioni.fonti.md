# Articolo 29: cerco espositori per un mercatino

Preparato e **pubblicato e verificato il 24 novembre 2026**. Titolo assegnato conservato, categoria `Fiere`, autore Redazione Subingresso. Dossier privato `.local/lavori/articoli/20261124-codex1/articolo-29/`. La preparazione non ha eseguito inserimenti; la pubblicazione successivamente autorizzata è documentata sotto. Nessuna campagna, contatto, pagamento o registrazione reali.

## Duplicati live

GET pubblico del 24 novembre: **152 post**, sole colonne `slug,title`, elenco completo conservato in `titoli-live.json` senza stamparlo. Ricerca di espositori, organizzazione, reclutamento, promozione, pubblicità, social, iscrizioni, portali, gruppi, gratuito, visibilità ed evidenza. Slug e titolo assegnati assenti.

Letti excerpt e contenuto soltanto di tre candidati, salvati in `candidati-live-dettaglio.json`:

- `annuncio-gratuito-evidenza-contatti`: vendita di un posteggio e qualità dei contatti dell'acquirente. Qui il lettore è l'organizzatore e il risultato è l'iscrizione di espositori, con confronto fra tre famiglie di canali.
- `dati-visitatori-fiera-domande-organizzatore`: verifica delle dichiarazioni sull'affluenza per chi deve prenotare. Non tratta l'acquisizione di espositori.
- `fiera-social-verifica-organizzatore-pagamento`: controlli prima dell'acconto di chi vuole partecipare. Qui si prepara e si misura l'invito dell'organizzatore.

Nessun tema sostituito o secondo articolo avviato.

## Fonti primarie e limiti

Consultate con browsing e recuperate direttamente il **24 novembre 2026**, tutte con **HTTP 200**. HTML, testo estratto, orari, URL finali e SHA256 in `fonti-ricevute.json` e nei tre file `portale`, `budget`, `utm` del dossier.

- [Eventi e Sagre, aggiungi evento](https://www.eventiesagre.it/aggiungi_evento.html). Passaggio: «NON dà diritto alla pubblicazione automatica dell'evento». La pagina descrive una valutazione redazionale. Uso: distinguere segnalazione, pubblicazione e iscrizioni; verificare l'ammissibilità della richiesta per espositori. Non si estendono le condizioni a tutti i portali. Non usati dati di pubblico, tempi garantiti, prezzi, tassi di successo o promessa che il calendario sia un servizio di reclutamento.
- [Google Ads, budget giornalieri medi](https://support.google.com/google-ads/answer/6385083?hl=it). Passaggio: «in alcuni giorni potresti non raggiungere il budget giornaliero medio, mentre in altri potresti superarlo». Uso limitato al budget medio, distinto dalla spesa effettiva, e al rinvio ai limiti della campagna. Nessuna generalizzazione a Meta, nessun budget minimo, algoritmo, previsione o costo per iscritto attribuito al provider.
- [Google Analytics, parametri UTM](https://support.google.com/analytics/answer/10917952?hl=it). Passaggio: «identificare le campagne che indirizzano il traffico». Uso nel foglio Guida: gli UTM possono distinguere le sorgenti in un sistema configurato, senza provare iscrizioni o deduplicare persone. Nessun tracciamento installato; il file non si collega ad Analytics.

Scelta di gruppi per zona e merce, verifica delle regole e del post visibile, invito completo, periodo comune, definizione di conferma e attribuzione a una sola fonte sono **criteri operativi redazionali**. Non sono obblighi di legge, funzionalità garantite delle piattaforme o risultati misurati. Le pagine Meta risultate limitate all'accesso durante la ricerca non sono state usate come prova. Non servono norme o tariffe per sostenere la promessa del titolo.

## Tabella gratuita e aritmetica

`downloads/tabella-canali-espositori-iscrizioni.xlsx`: quattro fogli, **Guida, Canali, Esempio, Fonti**, dodici righe di input vuote in Canali. Campi per costo effettivo del canale, altre spese già ripartite, ore, valore ora, contatti unici, domande complete e confermati dopo le cancellazioni.

Le formule calcolano costo totale `spesa canale + altre spese + ore × valore ora`, rapporto confermati/contatti e costo per confermato. Con zero confermati conservano il costo, mostrando «NESSUNA CONFERMA» al posto di un falso costo unitario zero. Mancanze, testo, valori negativi o oltre limite, conteggi frazionari, incoerenze fra contatti/domande/confermati e codici duplicati bloccano il riepilogo. Codici con spazi iniziali/finali o oltre 40 caratteri non sono validi. Convalide e istruzioni restano separate dai controlli delle formule, che funzionano anche sui valori incollati.

Deduplica di persone e fatture, fonte non nota, definizione della conferma, ripartizione dei costi comuni e coerenza IVA richiedono l'annotazione dell'utente. Non vengono riconosciuti automaticamente costi o persone ripetuti fra codici diversi. Le ore già pagate nelle spese vanno escluse dal tempo valorizzato per evitare un doppio costo. Non si calcolano ricavi, profitto, fiscalità o causalità del canale.

L'esempio è interamente inventato e separato dal modello: portale `20 + 0 + 2 × 15 = 50`, gruppo `0 + 0 + 3 × 15 = 45`, annuncio `60 + 10 + 1 × 15 = 85` euro. Su 2, 3 e 5 confermati: **25, 15 e 17 €/confermato**. Totale **180 euro, 10 confermati, 18 €/confermato**. Non sono tariffe o prestazioni dei servizi citati.

**34 casi e 418 confronti PASS**, formule XLSX lette con `formulas.ExcelModel` e funzione di riferimento Python indipendente. Verificati file vuoto, ogni campo mancante, zeri, spesa senza conferme, cancellazioni, esclusione delle ore già pagate, costo comune diviso su due righe, decimali, input errati, limiti, doppioni e ultima riga. Nessuna prova di perdita aziendale inventata: il modello misura costi di acquisizione e considera anche spese senza iscritti. Nessuna macro, connessione, query, formula con riferimenti esterni o dato personale. ZIP integro, stampa, convalide e cache iniziali controllate dopo la riapertura. Excel/LibreOffice non avviati. Ricevuta `verifica-tabella.json`.

## Copertina e anteprima

Copertina originale generata con skill `imagegen` e strumento integrato `image_gen`, senza riferimenti: tavolo di lavoro davanti a un mercatino inventato. [Prompt effettivo](cerco-espositori-mercatino-canali-iscrizioni.prompt.md). Conversione Sharp in **WebP 1600 × 900**, originale e asset finale esaminati. Dichiarazione IA nel testo pubblico.

Testo di **2.522 caratteri, 370 parole**, con hook in grassetto, tre risposte iniziali, sei h2, confronto numerico inventato, due slot ADS inline/closing, CTA di download e link finali. Template, CSS, JavaScript, API e servizi del sito invariati.

Anteprima tramite il vero handler `api/blog.js` del worktree, con fixture del solo articolo e data di pubblicazione dichiaratamente fittizia per il rendering. Regole ADS lette dall'endpoint pubblico e conservate. **Chromium 1440/768/320, WebKit 390, Chromium 390 senza JavaScript**: cinque percorsi con titolo, excerpt, canonical, NewsArticle, sezioni, copertina, due ADS distinti e download effettivo identico all'XLSX finale. Tabella mobile con scorrimento interno e indicazione testuale; ultima colonna raggiungibile. Scritture Supabase e provider intercettate, analytics esclusa; nessun evento reale inviato. Screenshot e ricevute nel dossier; nessuna verifica online dell'articolo non ancora pubblicato dichiarata come eseguita.

## Ambito della consegna

Nella preparazione, solo i sei file propri: HTML, JSON con i sei campi consentiti, fonti, prompt, WebP e XLSX. Backup remoto verificato prima della prima modifica. Commit con hook attivi e push esclusivamente del branch assegnato come backup della preparazione; ricevuta Git e hash in `prepared.json`. Nessun merge o push su main, nessuna scrittura DB e nessun documento comune modificato nel primo turno. La pubblicazione è stata eseguita nel successivo turno assegnato dal coordinatore.

## Pubblicazione verificata del 24 novembre 2026

- [Articolo pubblico](https://subingresso.it/blog?post=cerco-espositori-mercatino-canali-iscrizioni), ID `0ea9fa14-2341-4d60-9e65-2d43375cfbbc`, data effettiva DB `2026-11-24T00:47:07.008649+00:00`. Un solo INSERT, protetto dal controllo di assenza e dal vincolo UNIQUE; nessun UPDATE/DELETE, modifica di schema, trigger o servizi.
- Preparazione `e2d98d7e36e1d9eef85bb724afae3b4e49c4b51a`; merge conservativo con baseline `3ad4568a4e36d5b4aeb600d68beaca014c6506ba`, materiali su main `02bac8a8c9f9b23b1a4e476c1ffc6f3f233bc6a3`. Vercel materiali **success**; copertina e XLSX pubblici HTTP 200, identici per SHA256 prima dell'inserimento.
- Schema, vincoli, trigger e stato live riletti prima della scrittura. **154 post precedenti invariati nei nove campi, confrontati per ID; 155 totali.** Ricevute `schema-prima-inserimento.json`, `post-prima-inserimento.json`, `insert-ricevuta.json`, `post-dopo-inserimento.json`, `verifica-dati.json`.
- **Cinque percorsi online PASS**: Chromium 1440/768/320, WebKit 390 e Chromium 390 senza JavaScript. URL HTTP 200, SSR conforme al contenuto definitivo, titolo, descrizione, Open Graph, canonical e NewsArticle; presenza nell'indice e nella sitemap. Due ADS distinti e tabella mobile scorrevole fino all'ultima colonna; nessun overflow o errore JavaScript/asset. Tutti i cinque screenshot online esaminati.
- **Cinque download effettivi online identici**, incluso senza JavaScript: XLSX SHA256 `3f3e35ccd3a6a87a2ad43eb3b4fd25a09197398d8101f55955f2f33cef33ed89`; copertina SHA256 `ddd926d22e7014536ef1b127540dacdd79af84ce470847a0b306710d79cb8f97`. Ricevuta `verifica-online.json`, screenshot e download `online-*`. Richieste di scrittura analytics/provider intercettate.
- Categoria esatta `Fiere`; funzione live del bollino verificata con sola SELECT, dopo normalizzazione mediante la funzione effettiva di `auth.js` per URL canonico e legacy. Nessun account creato, whitelist o trigger modificati. Ricevuta `verifica-bollino.json`.
- Materiali riusati con hash identici e **nessuna ripetizione** della preparazione o dei 34 casi Excel già superati. Cambia soltanto questo file fonti per registrare l'esito. Aggiornate solo la voce 29 dell'elenco editoriale e una breve nota nella memoria del worktree; tutto il testo precedente conservato. Lock del coordinatore PID 13416 non riacquisito.

Checkpoint prima e dopo push e inserimento; backup remoto del turno `backup/session-20261124-014317-articolo-29-pubblicazione`. Audit conclusivo, commit finale dei documenti e hash in `result.json` e `verifica-finale.json` nel dossier. Nessun altro tema avviato.
