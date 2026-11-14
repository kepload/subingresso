# Affittare un posteggio: canone sostenibile e margine

Punto **6** dell'elenco, unico incarico della sessione nuova Codex 2 del **14 novembre 2026**. Titolo assegnato conservato integralmente. Slug originale `affittare-posteggio-canone-margine`.

## Ambito e duplicati

Letti e conservati i **141 post LIVE** prima di scrivere. Nessuno dedicato al tetto dell'affitto dal lato di chi prende il banco. I contenuti vicini restano distinti: `quanto-deve-incassare-banco-convenire` calcola le vendite necessarie prima dell'acquisto; `affittare-o-vendere-posteggio-mercatale-quando-conviene` confronta le scelte del titolare; `canoni-mercatali-lombardia-confronto` tratta tariffe pubbliche. Nessuna loro modifica e nessuna percentuale tipica di affitto o fatturato ripresa come dato.

Il nuovo articolo parte da vendite e costi documentabili del medesimo posteggio e ricava lo spazio mensile per il canone al titolare. Non valuta il prezzo di mercato, non garantisce redditi e non sostituisce contratto, SUAP o professionista. Perimetro e quote delle spese comuni espliciti; separati canone pubblico, scorte, cauzione, anticipi e cassa.

## Fonti primarie verificate

Tre fonti scaricate **HTTP 200** il 14 novembre 2026, originali, testi estratti, ora e SHA256 conservati nel dossier privato:

- [Camera di commercio di Bologna, Vademecum per futuri imprenditori](https://www.bo.camcom.gov.it/sites/default/files/promozione-interna/sportello-genesi/Progetti_d_impresa_Vademecum_per_futuri_imprenditori.pdf#page=43): pagina PDF 43, numerazione stampata 33. Margine di contribuzione = prezzo meno costi variabili; percentuale sul prezzo di vendita e copertura dei costi fissi. Fonte didattica generale, non indagine su ambulanti o canoni correnti. Il sito reindirizza al dominio istituzionale `bo.camcom.it`. SHA256 originale `21dbc4c1ed9457365810900020ec9c73acc572b46ffc52754491d915f5421167`.
- [Camera di commercio di Torino, Mettersi in proprio: il progetto imprenditoriale](https://www.to.camcom.it/book/export/html/6019): sezione 5.2, costi fissi/variabili, punto di pareggio e limiti delle ipotesi semplificatrici; simulazioni fiscali da affidare al professionista. Guida didattica del **2015**, consultata oggi, non normativa fiscale aggiornata o previsione economica del 2026. SHA256 `645f3a861e0e6533a63ea4758be9dd7658126941efae4ca1ca7b595e8703c6c0`.
- [Comune di Monza, Canone unico patrimoniale e mercatale](https://comune.monza.it/it/servizi/canone-unico-patrimoniale-e-mercatale): servizio locale che distingue le occupazioni e pubblica le tariffe applicabili nel 2026. Usato esclusivamente per identificare la voce pubblica, separata dall'affitto contrattuale: nessun importo trasferito ad altri Comuni e nessuna tariffa usata nell'esempio. SHA256 `5ca99ac6e8590ce5184852994973546333e142bf65a2a21011273855f01b9a49`.

La scheda Milano sui subingressi risponde **403** al download diretto ed è esclusa dalle fonti pubbliche e dal foglio. Non si ricostruiscono procedure o termini da frammenti del motore di ricerca. La richiesta di verifica con SUAP e professionista non afferma una procedura nazionale unica.

## Metodo e limiti del calcolo

Proposta redazionale orientativa, derivata dall'identità ricavi meno costi variabili e dalle somme che il lettore vuole o deve riservare. Non è un calcolo di utile fiscale o un bilancio di cassa completo.

- Vendite mensili = giornate effettive × vendite medie per giornata.
- Margine percentuale = 1 − costi variabili sulle vendite / 100; non ricarico sul costo.
- Margine mensile = vendite mensili × margine percentuale.
- Tetto mensile = margine mensile − altre spese − canone pubblico a carico − riserva fiscale/contributiva − somma personale − riserva per imprevisti/rate/reinvestimenti.
- Differenza dopo affitto = tetto − affitto richiesto; tetto negativo conservato e spiegato come mancanza anche senza affitto.
- Vendite necessarie = (somme da riservare + affitto richiesto) / margine percentuale; risultato giornaliero solo con giornate maggiori di zero.

Imposte, contributi e trattamento IVA sono dati da concordare col professionista, senza aliquote automatiche. Le riserve vanno riviste quando cambia scenario. Costi variabili percentuali e medie giornaliere sono ipotesi costanti del modello; sconti, stagionalità e costi a gradini possono modificarle. Una quota ragionata delle spese comuni e del reddito personale deve riguardare gli stessi posteggi dei ricavi. Nessun doppio conteggio di costi o spese già incluse nell'affitto. L'annuo diviso dodici non sposta le scadenze.

Esempio **interamente inventato**, relativo a un mese di quattro mercati di un singolo posteggio: 4 × 1.000 euro, costi variabili 60%, margine 1.600; riserve 400 + 50 + 150 + 600 + 100 = 1.300; tetto 300; affitto 250; differenza 50. Con tre giornate: margine 1.200, tetto −100, differenza −350. Le quattro giornate non sono una media garantita; 150 euro non sono una stima fiscale. Nessun dato commerciale reale inventato.

## Risorsa definitiva

`downloads/calcolo-canone-affitto-posteggio.xlsx`: cinque fogli, Istruzioni, Calcolo, Esempio, Documenti e Fonti. Due scenari vuoti da compilare, due esempi inventati; nove input obbligatori per colonna. Le celle gialle raccolgono valori, le verdi contengono formule. Mancanti, testi anche numerici, negativi, giorni frazionari/oltre 31 e percentuali oltre 100 bloccano i risultati numerici. Giorni zero e margine nullo ricevono un esito dedicato; nessuna divisione per zero.

**264 casi superati**, 66 scenari in ciascuna delle quattro colonne di Calcolo/Esempio: **2.376 confronti** su nove formule effettive, lette dal file e valutate con `formulas.ExcelModel` rispetto ad aritmetica Python indipendente. Compresi esempio, giornata persa, zero affitto, affitto sul tetto/oltre tetto, margine 0/100%, decimali, spese superiori al margine, dati mancanti/testuali/negativi in ogni input e dodici scenari con valori indipendenti. Cache iniziali, struttura ZIP, convalide, stampa e colori letti dal file definitivo. Nessuna macro, connessione dati, formula di rete o collegamento a un workbook esterno; tre normali hyperlink alle fonti.

Excel e LibreOffice non avviati: è dichiarato il motore di verifica usato, senza attribuirgli una prova in quelle applicazioni. Il motore Python considera numeriche anche alcune stringhe numeriche: controllo esplicito `ISTEXT` nelle formule per bloccarle. Nessuna modifica a dipendenze o software condivisi.

SHA256 definitivo XLSX: `9bf455565f7698c3959710bb44ea9969f6c2f21601ce0e1920655b5bd82d45a3`.

## Copertina e anteprima

Copertina originale generata con lo strumento integrato `image_gen`, skill imagegen; prompt esatto nel file `.prompt.md`. Scena inventata e dichiarata nell'articolo, originale privato conservato, WebP **1600×900**, 199.844 byte. Controllata visivamente. SHA256 `8bc15992fa269e0d60d7cc9b87f6c456a2624a45c478a0ab886610ef29461806`.

Verificatore privato adattato dal dossier `netto-vendita-banco-20261113`, senza eseguire i vecchi modi mutativi. Cinque percorsi di anteprima **PASS**: Chromium 1440/768/320, WebKit 390 e Chromium 390 senza JavaScript. Sei h2, tre punti iniziali, 601 parole visibili, due slot ADS distinti, titolo/descrizione/canonical/NewsArticle, copertina e risorsa funzionanti. Nessun overflow o errore JavaScript; download effettivo WebKit identico al definitivo. Screenshot desktop e 320 esaminati. Provider e scritture analytics intercettati; nessun dato reale di prova.

## Pubblicazione verificata il 14 novembre 2026

Materiali commit `8eef1f2cbcc69afb3483bff79a73d8ea7c7d4c3a`, push da worktree esclusivo con main remoto ancora coincidente con la base attesa; nessun reset, rebase o force push. Hook pre-commit e scansione gitleaks effettivi, senza rilievi. Deploy Vercel **success**, [ricevuta del deploy](https://vercel.com/kycykuardit-9234s-projects/subingresso/AU3kiAyL3ojsXtW441XHxPUusDUc); prima dell'INSERT copertina e risorsa pubbliche HTTP 200 con SHA256 identici al definitivo.

Schema, vincoli, trigger e duplicati LIVE riletti immediatamente prima dell'inserimento: nove colonne, PK id, slug univoco, nessun trigger applicativo; 141 post precedenti invariati. **Un solo INSERT** del post `63fbaaac-0af5-485b-a3fb-eb27d8653ab6`, senza UPDATE/DELETE. Data effettiva nella ricevuta privata `pubblicazione.json`. [Articolo pubblico](https://subingresso.it/blog?post=affittare-posteggio-canone-margine).

Cinque percorsi browser **online PASS**, stessi formati dell'anteprima; download effettivo WebKit identico al definitivo, nessun overflow o errore JavaScript, lettura senza JS e due slot ADS verificati. SSR, titolo, descrizione, canonical, NewsArticle, indice e sitemap conformi. Tutti i **141 post precedenti invariati** nei nove campi della tabella, **142 totali**; nessun dato reale di prova o invio. Copertina e file pubblico hanno gli stessi hash riportati sopra.

Dossier privato: `.local/lavori/articoli/ciclo-quote-20261114-1305/articolo-06/` nella root principale. Ricevute: `fonti-ricevute.json`, `verifica-formule.json`, `schema-prima-inserimento.json`, file di anteprima, checkpoint JSON/Markdown e `operations.jsonl`. Nessuna cancellazione o modifica a servizi condivisi.
