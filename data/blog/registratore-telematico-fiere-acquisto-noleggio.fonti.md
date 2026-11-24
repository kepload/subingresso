# Registratore telematico per fiere: fonti e preparazione

Articolo unico **27**, titolo invariato rispetto a `job.json`. Preparato il **23 novembre 2026** nel branch esclusivo `articolo/codex1-20261123-27`; pubblicato e verificato il **24 novembre 2026** nel turno assegnato. Le prove preparatorie seguenti sono state riutilizzate; l'esito pubblico è riportato in fondo.

## Duplicati

Elenco LIVE dei **147 post**, con slug, titolo ed excerpt, recuperato via GET pubblico il 23/11/2026 alle 18:16 UTC e salvato nel dossier privato. Nessun articolo sul confronto acquisto/noleggio del registratore telematico. Il più vicino, `partecipare-fiera-incasso-minimo`, calcola le vendite necessarie per coprire una fiera; questo articolo confronta strumenti e contratti su un anno. Distinto anche dalle guide generali fiscali e ai costi del posteggio. Nessun post esistente modificato.

## Fonti primarie ricontrollate

Originali, testo estratto, data di recupero, risposta HTTP e SHA256 in `fonti-ricevute.json` nel dossier privato. I documenti usati sono stati scaricati direttamente con **HTTP 200**, anche quando il browser di ricerca riceveva 403.

- [Agenzia delle Entrate, guida Scontrino elettronico](https://www.agenziaentrate.gov.it/portale/documents/20143/233439/Guida_ScontrinoElettronico.pdf), aggiornamento febbraio 2021, pp. 5-8: strumenti disponibili, gratuità della procedura web e necessità di rete durante l'operazione, verifica periodica biennale. Documento storico utilizzato solo per questi principi; non ripresi bonus 2019-2020, sanzioni, periodi transitori o istruzioni sui giorni di chiusura. Pochi giorni di attività non vengono presentati come esonero automatico; il caso fiscale personale va verificato.
- [Agenzia delle Entrate, FAQ POS-RT](https://www.agenziaentrate.gov.it/portale/documents/d/guest/faq_collegamento_pos_rt_2503), aggiornate al **25 marzo 2026**, FAQ 1, 2 e 21: associazione tramite portale, nessuna necessità di cambiare/adeguare il registratore per il solo collegamento e modalità per ambulanti.
- [Agenzia delle Entrate, manuale operativo POS-RT](https://www.agenziaentrate.gov.it/portale/documents/d/guest/allegato-2_-manuale-operativo2026-04-29), versione nel percorso **29 aprile 2026**, p. 7: modalità Dispositivo ambulante. Letto per verificare il contesto attuale; l'articolo non propone una procedura fiscale completa o scadenze personali.
- [Maroga, noleggio temporaneo](https://maroga.it/noleggio), fonte diretta del fornitore: condizioni con minimo di giorni, cauzione rimborsabile, servizi inclusi e limiti geografici. Usata per dimostrare che il giorno lavorato può differire da quello fatturato, non come listino di mercato o raccomandazione. Nessuna disponibilità commerciale verificata né promessa al lettore.

Il tentativo su `https://www.gril.it/Misuratori_Fiscali_breve.html` ha restituito errori di rete/certificato; fonte scartata, senza disabilitare la verifica TLS. Nessun fatto dell'articolo si basa sui suoi frammenti indicizzati. Non sono stati cercati altri articoli da sviluppare.

## Simulatore

`downloads/simulatore-registratore-telematico-fiere.xlsx`, sei fogli: Istruzioni, Confronto, Noleggi, Esempio, Noleggi esempio, Fonti. Input reali inizialmente vuoti; esempi inventati separati. Nessuna macro, connessione o importazione di listini. Collegamenti informativi alle fonti, senza credenziali o dati personali.

La media gestionale dell'acquisto è `prezzo / anni + fissi annui + verifica / intervallo + altri annui`. L'esborso del primo anno è `prezzo intero + fissi annui + altri annui + verifica effettivamente pagata nel primo anno`. Non sono misure da sommare, né calcoli di ammortamento fiscale. Assunti costi annui costanti; esclusi imposte, interessi, inflazione e ricavo da rivendita.

Il noleggio somma `quantità fatturata × tariffa + extra` per un massimo di 12 periodi. Si possono usare giorni o pacchetti, con i minimi del preventivo inseriti esplicitamente. I giorni al banco sono separati. Le cauzioni rimborsabili sono escluse dal costo e mostrate come somma degli anticipi, non picco simultaneo. IVA sulla medesima base scelta col professionista; nessun recupero automatico.

Esempio inventato: prezzo 720, uso 4 anni, fissi 60, verifica 80 ogni 2 anni, altri 20, verifica aggiuntiva nel primo anno zero. Media annua 300, esborso primo anno 800. Quattro noleggi da un giorno lavorato, ciascuno con tre unità fatturate da 15 e 10 di extra: costo 220, differenza -80, cauzioni complessive 400. Nessuno di questi importi è un prezzo reale, medio o consigliato.

**102 scenari superati** tramite `formulas.ExcelModel`, leggendo le formule effettive e confrontandole con aritmetica Python indipendente: input mancanti, testo, negativi, anni/intervalli zero o frazionari, quantità frazionarie, zero attività, 12 periodi, pacchetti, minimi giornalieri, decimali, acquisto/noleggio/pari costo, somme giornate eccessive e cauzioni. Verificati 76 formule, cache iniziali, archivio ZIP e riapertura con openpyxl. Ricevuta privata `verifica-formule.json` con hash definitivo.

## Copertina e controlli

Copertina originale IA generata con skill imagegen e strumento integrato, scena inventata dichiarata nel testo. [Prompt integrale](registratore-telematico-fiere-acquisto-noleggio.prompt.md). PNG originale privato; WebP finale **1600×900**, senza marchi, prezzi o scritte leggibili. Conversione con Pillow.

Testo principale entro il riferimento 2.200-3.000 caratteri, sei h2 brevi, tre risposte iniziali e primo punto di ciascuna sezione in strong. Due slot ADS identici al riferimento, inline e closing; CTA verso annunci e pubblicazione annuncio. Nessuna modifica a template, CSS, JS, API o documenti comuni.

Anteprima con renderer SSR corrente e fixture locale: Chromium **1440/768/320**, WebKit **390**, Chromium **390 senza JavaScript**. Controllati titolo, descrizione, canonical, NewsArticle, contenuto, copertina, due ADS e assenza di overflow/errori JavaScript. Download effettivo da server locale in WebKit e senza JavaScript, verificato per SHA256 contro l'XLSX definitivo. Scritture analytics/provider intercettate. Script privato adattato dal riferimento `netto-vendita-banco-20261113`, mantenendo esclusivamente la modalità anteprima.

Regole ADS vuote di fixture: nessuna certificazione delle regole live o della pubblicazione. Le date nei metadati della sola anteprima sono fittizie e non costituiscono un inserimento DB. Screenshot e ricevuta browser finali nel dossier privato.

Backup preventivo remoto della preparazione verificato: `backup/session-20261123-191631-articolo-27-registratore`, target `c0bc8d66a81d5f0be8569ccc895207aed4322e34`. Consegna e hash originali in `prepared.json` e `prepared.md` nel source_dossier. Pubblicazione completata nel secondo incarico del coordinatore.

## Pubblicazione verificata il 24 novembre 2026

[Articolo pubblico](https://subingresso.it/blog?post=registratore-telematico-fiere-acquisto-noleggio), ID `19137b66-e26a-4cb7-9e39-847a0e95f8ff`, data DB `2026-11-24T00:31:25.490456Z`. Categoria esatta **Fiere** allineata nel commit `f3fbcc4` prima dell'INSERT, secondo `data/FAIR_SIGNUP_BADGE.md`. La funzione live `account_private.is_fair_registration_path` riconosce il percorso dell'articolo; verifica in sola lettura, nessuna registrazione di prova. Nessuna modifica a whitelist, schema o servizi.

Baseline origin/main `1a5180f5295ec5681f1bec6847ad89cc2cad8883`, merge conservativo e push materiali `cbedb77de450b8c51f59345f948605b915980797`. Vercel riuscito e asset pubblici HTTP 200, identici per SHA256, prima dell'inserimento. Lock globale detenuto dal coordinatore PID 13416, non acquisito di nuovo. Checkpoint prima e dopo push e mutazioni; primo push fallito per errore di rete, riferimenti remoti riconciliati prima del tentativo riuscito.

Schema e vincoli live ricontrollati: nove colonne, slug UNIQUE, nessun trigger applicativo. **Un solo INSERT**, nessun UPDATE/DELETE. Snapshot prima e dopo: **152 post precedenti identici in tutti i nove campi**, 153 totali. Copertina, Excel, prompt e testo dell'articolo identici alla preparazione originale; aggiornati soltanto categoria dei metadati e questo esito.

**Cinque percorsi online PASS:** Chromium 1440/768/320, WebKit 390, Chromium 390 senza JavaScript. HTTP 200, contenuto SSR, titolo/descrizione/canonical/NewsArticle coerenti, presenza nell'indice e sitemap, copertina caricata e due ADS sulle fiere. Nessun overflow, errore JavaScript o asset del sito mancante; screenshot desktop e mobile esaminati. Cinque download effettivi identici all'Excel definitivo, anche WebKit e senza JS. Scritture analytics/provider intercettate.

Riutilizzati i 102 scenari sulle 76 formule già superati, senza rigenerare il simulatore o la copertina. Il controllo degli hash conferma il riuso degli asset e delle prove pertinenti. Nessun nuovo listino, ricerca normativa o test Excel desktop dichiarato.

Ricevute pubblicazione: `.local/lavori/articoli/20261124-codex1/articolo-27/` nella root principale: `checkpoint.json`, `schema-prima-inserimento.json`, snapshot post, `insert-ricevuta.json`, `categoria-fiera-live.json`, `verifica-online.json`, screenshot/download `online-*`, ricevute deploy e `result.json`/`result.md`. Prove preparatorie conservate in `.local/lavori/articoli/20261123-codex1/articolo-27/`. Backup di sessione remoto verificato: `backup/session-20261124-012755-articolo-27-pubblicazione`.

Aggiornata soltanto la voce 27 dell'elenco e un breve esito nella memoria del worktree, senza cambiare le altre voci. Nessun invio, account, annuncio o pagamento reale di prova. Nessun problema aperto.
