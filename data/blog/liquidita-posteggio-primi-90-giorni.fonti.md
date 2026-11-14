# Liquidità dopo l’acquisto del posteggio — fonti e preparazione

Priorità **15**, articolo unico. Preparato il **14 novembre 2026**, **pubblicato e verificato il 14 novembre 2026** nel secondo turno autorizzato dal coordinatore. La preparazione aveva lasciato invariati DB, main e documenti comuni. Slug originale: `liquidita-posteggio-primi-90-giorni`.

## Promessa e controllo duplicati

Letti **143 titoli, slug e anteprime live** prima della scrittura, tramite API pubblica il 14 novembre 2026. Letti poi i corpi di `quanto-deve-incassare-banco-convenire` e `costi-nascosti-posteggio-mercatale`. Il primo stima un obiettivo mensile di vendite; il secondo elenca costi. Nessuno dei due offre il calendario giornaliero dei primi 90 giorni, il minimo di cassa e la differenza rispetto alla riserva scelta. Nessun duplicato specifico trovato. Conteggi e ricevute descrivono questa lettura, non uno stato futuro.

La guida risponde con un metodo e un piano compilabile, non con una cifra universale. Nessuna attività reale, fattura, contratto POS, vendita, costo medio o esito aziendale osservato. Tutti gli importi dell’esempio sono inventati e dichiarati tali. Rate residue distinte da prezzo già pagato; finanziamento già ricevuto distinto da incasso futuro; merce distinta da disponibilità liquide. Nessun calcolo fiscale automatico.

## Fonti primarie effettivamente lette

Tutte recuperate direttamente **HTTP 200 il 14 novembre 2026**, con copia e SHA256 nel dossier privato, ricevuta `fonti-ricevute.json`.

- [Banca d’Italia, La finanza per la piccola impresa](https://economiapertutti.bancaditalia.it/percorsi-formativi/piccole-imprese/scelte-finanziarie-e-rapporti-con-le-banche/la-finanza-della-piccola-impresa/index.html): percorso istituzionale sulla gestione finanziaria e pianificazione della liquidità. Usato per inquadrare il metodo, senza attribuirgli importi o raccomandazioni numeriche per gli ambulanti.
- [Camera di commercio di Bolzano, Linea guida sul finanziamento alle imprese](https://www.camcom.bz.it/sites/default/files/uploaded_files/Pubblicazioni/20697_HK_U-Finanzierung_14_IT.pdf), **prima edizione dicembre 2014**, pp. 9–10 e 15–16: scadenze, pianificazione, riserva e differenza fra liquidità e risultato. Consultazione attuale di una guida storica; impiegati solo concetti generali. Escluse condizioni bancarie, strumenti agevolati, contesto congiunturale e norme della vecchia edizione.
- [INPS, Gestioni artigiani e commercianti: i contributi per il 2026](https://www.inps.it/it/it/inps-comunica/notizie/dettaglio-news-page.news.2026.02.gestioni-artigiani-e-commercianti-i-contributi-per-il-2026.html), notizia **9 febbraio 2026**, circolare n. 14: riferimento corrente al Cassetto previdenziale e agli F24. Nessuna aliquota, minimo, agevolazione o scadenza uguale per tutti riportata nel piano. L’utente deve far verificare il proprio caso e anche le scadenze successive al novantesimo giorno.
- [OIC 10, Rendiconto finanziario, dicembre 2016](https://www.fondazioneoic.eu/wp-content/uploads/2024/11/2016-12-OIC-10-Rendiconto-finanziario-1.pdf), paragrafi 9–14 e 26–40: inquadramento della differenza tra risultato e flussi monetari. Il file è una previsione gestionale, non un rendiconto conforme OIC né un’affermazione sull’obbligo di redigerlo. La bozza OIC del 2026 emersa nella ricerca non è trattata come norma definitiva.

Le formule e la scelta dei 90 giorni sono costruzione editoriale. Non derivano da soglie di legge. Data di disponibilità POS da contratto; canoni e servizi da Comune/documenti personali; fiscalità, contributi e completezza delle scadenze da professionista. Nessun termine standard di accredito, tariffa comunale o percentuale fiscale inventato.

## Piano gratuito definitivo

`downloads/piano-cassa-posteggio-90-giorni.xlsx`, **53.176 byte**, SHA256 **`4cbfc69dacf90d8474b4b80823428f45d5248df30ba74c569587e12981dc4d41`**.

Sei fogli: Istruzioni, Riepilogo, Piano90, Esempio, Scadenze, Fonti. Input personali tutti vuoti. Quattro dati iniziali, tre importi per ciascuno dei 90 giorni, note facoltative. Data iniziale 2020–2100; importi numerici non negativi fino a un miliardo, massimo due decimali; riduzione vendite 0–100%. I risultati restano vuoti finché tutti gli importi giornalieri non sono validi: per assenza di movimento occorre zero. Convalide e controlli nelle formule operano anche se un incolla aggira la convalida. Formule protette senza password, input sbloccati; la protezione non è un confine di sicurezza.

Metodo: saldi giornalieri = saldo iniziale + entrate cumulate − uscite cumulate. Il minimo comprende il saldo prima dell’avvio. Liquidità iniziale necessaria = massimo fra zero e riserva meno minimo dei flussi cumulati, includendo zero. Quanto manca = massimo fra zero e necessità iniziale meno cassa disponibile. Lo scenario ridotto arrotonda ogni giorno gli incassi da vendite ai centesimi dopo la riduzione; altre entrate e uscite restano uguali. Non simula automaticamente ritardi o nuove spese. Il saldo di fine giornata non garantisce disponibilità prima di un pagamento nello stesso giorno.

Scadenze è un promemoria documentale facoltativo, **non alimenta le formule**: istruzioni e intestazione lo dichiarano. Non è un registro contabile. L’esempio separato parte da 4.000 euro, paga 5.000 prima degli incassi e mantiene una riserva scelta di 1.000: necessità iniziale 6.000, differenza 2.000. Le vendite ridotte successive non cancellano quella mancanza iniziale.

**1.724 controlli PASS**, comprendenti **45 configurazioni** delle formule reali con `formulas.ExcelModel`, confrontate con aritmetica Python `Decimal` indipendente e, per gli scenari validi, tutti i 90 saldi base e ridotti. Coperti zero, campi assenti, testo, valori negativi, booleani, date fuori intervallo/con ora, percentuale oltre limite, importi e precisione non ammessi, riduzione zero/100%, centesimi, sola entrata e carenza prima degli incassi. Verificati esempio, convalide, protezione, stampa, input vuoti e cache iniziali. Excel e LibreOffice **non avviati**. Ricalcolo automatico richiesto all’apertura. Ultima correzione solo alle larghezze dell’Esempio, con confronto integrale di celle, formule e cache invariate.

Integrità ZIP, assenza di macro, connessioni, query, incorporamenti e formule con riferimenti esterni verificate. Solo quattro collegamenti HTTPS espliciti alle fonti. Nessun invio dal file. Il download reale WebKit dalla preview HTTP locale e il successivo GET hanno hash identico al definitivo; non è ancora il download pubblico.

## Copertina e articolo

Copertina originale con skill imagegen e strumento integrato `image_gen.imagegen`, senza immagini di riferimento. [Prompt completo](liquidita-posteggio-primi-90-giorni.prompt.md). `images/blog/liquidita-posteggio-primi-90-giorni.webp`, **1600×900**, SHA256 **`4a0812e4a4a9cab69e967d8d7a7b1c8687e2f32236ef3de7d61ffcf1eb674189`**. Originale conservato nella cartella dello strumento, finale nel worktree. Immagine generata e WebP finale esaminati visivamente; scena inventata dichiarata nel testo.

**535 parole nell’articolo SSR**, sei h2, apertura utile, tre punti iniziali, due slot ADS inline/closing, download unico e CTA. Metadati JSON limitati ai sei campi prescritti. Nessuna modifica a template, CSS, JS, helper, API o servizi condivisi. ADS selezionate dal motore esistente con regole lette live; nessuna nuova promessa commerciale aggiunta al catalogo.

## Verifiche locali completate

Adattato il riferimento privato del precedente articolo sul netto di vendita in uno script dedicato **senza modalità mutative** (`verifica-locale.cjs`). Rendering tramite gli handler SSR attuali e fixture del solo nuovo post. Titolo, descrizione, canonical, NewsArticle e relative immagini, sei sezioni, tre punti, ADS distinti, spazio Vetrine e assenza di markup attivo nel corpo verificati. Inclusione nell’indice e nella sitemap controllata con gli handler reali e fixture: non è una verifica di presenza pubblica.

Cinque percorsi PASS: **Chromium 1440/768/320**, **WebKit 390**, **Chromium 390 senza JavaScript**. Copertina caricata, testo leggibile, due ADS presenti, nessun overflow o errore JavaScript. Quattro screenshot conservati; desktop e WebKit esaminati visivamente. Scritture intercettate, letture provider isolate; nessun account, email, messaggio, pagamento o dato reale creato. Scaricamento effettivo WebKit verificato con SHA256.

Le prime due esecuzioni dello script di anteprima avevano asserzioni troppo strette: immagine NewsArticle attesa singola anziché array e `naturalWidth` confuso con la larghezza binaria sotto `srcset`. Corrette soltanto le asserzioni. Copertina e template erano corretti; l’esecuzione finale completa è passata. Le ricevute finali descrivono solo questa esecuzione riuscita.

## Consegna della preparazione e ordine di pubblicazione

Dossier privato: `.local/lavori/articoli/accelerazione-codex1-20261114-1721/articolo-15/` nella root principale. Contiene ricevute fonti, baseline live, contenuti dei due post affini, generatori, test, cache, screenshot e `prepared.json`/`prepared.md` con commit e hash definitivi.

Backup remoto preventivo verificato: `backup/session-20261114-172502-articolo-15-cassa-90-giorni`, commit **`83194ff753205aa22d61df6cf96ac75615dc2a20`**. Il primo push del tag è stato rifiutato; il secondo è riuscito e il tag remoto dereferenziato coincide con HEAD iniziale.

La consegna iniziale riservava pubblicazione e verifiche online al secondo turno, dopo articolo 8 e autori precedenti. Il coordinatore ha autorizzato quel turno; i relativi controlli e gli esiti effettivi sono riportati sotto. `prepared.json` e `prepared.md` restano conservati come ricevute della preparazione.


## Pubblicazione verificata il 14 novembre 2026

[Articolo pubblico](https://subingresso.it/blog?post=liquidita-posteggio-primi-90-giorni), record **`4d5c7e56-fd37-43e1-ab59-4b1c3fa4ebf4`**, data DB **2026-11-14T16:44:33.179922+00:00**. Un solo INSERT; nessun UPDATE/DELETE di post. Tutti i **144 record precedenti invariati nei nove campi**, **145 totali**: confronto integrale delle righe prima e dopo, ripetuto alla verifica online.

Materiali preparati `a89a70713799fa5f55f94e8bd562d1a78c569ef2`; integrato con merge origin/main `ed11e17d4964ae38a3b52d7295d5644f4273b00e`, senza conflitti né perdita dei contributi precedenti. Push materiali `e311eaee2e4decbd2cfe1dd2c4b133d2ce69412d`; [deploy Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/3qLAdYeVDkTpMDHKD6jfNNN5G4Jw). Backup preventivo del secondo turno `backup/session-20261114-174044-pubblica-articolo-15-cassa`, verificato remoto. Gitleaks della root principale eseguito esplicitamente sul lavoro da pubblicare, nessun segreto; hook non alterato o bypassato.

Prima dell’inserimento: schema, vincoli, trigger e duplicati live nuovamente verificati; nove colonne, PK id e slug univoco, nessun trigger applicativo. Copertina e XLSX pubblici **HTTP 200** e hash identici ai definitivi prima dell’INSERT e dopo. Contenuto HTML, metadati, copertina e XLSX invariati rispetto alla preparazione: nessuna rigenerazione o ripetizione dei test di formule necessaria.

**Cinque percorsi online PASS**: Chromium **1440/768/320**, WebKit **390**, Chromium **390 senza JavaScript**. Copertina caricata, sei sezioni e testo effettivamente visibili, due ADS presenti; nessun overflow o errore JavaScript. Quattro screenshot online conservati, desktop e WebKit esaminati visivamente. Scaricamento effettivo WebKit: **53.176 byte**, SHA256 **`4cbfc69dacf90d8474b4b80823428f45d5248df30ba74c569587e12981dc4d41`**, identico alla risorsa finale. Scritture analytics/provider intercettate, nessun account o invio reale di prova.

SSR, titolo, descrizione, canonical e NewsArticle conformi; nuovo slug presente nell’indice e nella sitemap pubblici. La prima asserzione di visibilità senza JS era anticipata rispetto all’animazione CSS: il solo verificatore è stato corretto con osservazioni separate del processo, fino all’opacità effettiva 1. Ricevuta `nojs-visibilita.json`; nessuna modifica al sito per ottenere il passaggio.

Ricevute nel dossier: `schema-prima-insert.json`, `blog-immediatamente-prima-insert.json`, `insert-ricevuta.json`, `blog-immediatamente-dopo-insert.json`, `post-precedenti-preservati.json`, `deploy-materiali.json`, `verifica-online.json`, `download-pubblico.json`, push e scansioni Gitleaks. Elenco aggiornato solo alla voce 15; nota propria nella memoria. Consegna finale privata `result.json`/`result.md` con commit finale e stato verificato.
