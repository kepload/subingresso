# Subingresso.it — informazioni e TO DO

Regole comuni per Claude e Codex: `AGENTS.md`. Questo documento raccoglie
decisioni, attività e storico: cercare il tema e leggere le parti pertinenti,
senza caricarlo tutto a ogni richiesta. Manuale tecnico: `istruzioni.md`;
fonti e audit fiere completi: `data/FIERE.md`.

## ADS: confronto e alternanza nel blog — 26 ottobre 2026

- Su richiesta, confronto visibile delle20ADS per titolo/miniatura/codice,
  impressioni/clic/CTRmisurato/conversioni; anche zero, filtri con clic/
  mostrate senza clic/mai mostrate, ordine eCSVcompleto. Misure/posizioni
  sommate; dettaglio precedente conservato. Periodi falliti e logout protetti.
- Rotazione per articolo nello stesso browser: prima le candidate pertinenti
  meno mostrate, evitando la coppia precedente; con almeno4 cambiano entrambe,
  con meno alcune ripetizioni necessarie. Nessun timer; riapertura e ritorno
  indietro inclusi, resize senza turno. Keyword/esclusioni conservate; memoria
  locale limitata60articoli, senzaIDutente, fallback RAM se bloccata.
- Dati pubblici riletti:120articoli,119con due slot (prima27ne avevano uno),
  eredi escluso; testo/tabelle conservati. Test rotazione1–14candidate,
  riapertura/storage bloccato, confronto/API/tracker/admin e regressioni
  blogSSR/annunci passati Chromium1440/768/320+WebKit390. Cambio creatività
  riavvia misura1secondo; deduplica/storico invariati, nessuna modificaDB.
  Inspector componente0FAIL, avviso metadata12px motivato; galleria esistente
  fuori ambito. Prove/limiti `Documents/ads-risultati-rotazione-20261026`.
  Backup tag/ramo remoti verificati; consueto errore cleanuphelper; corretta
  fixture riapertura con contesto browser esplicito. Pubblicato `f95711b`,
  Vercel `FCFZcvDasxcQFnPfLP6rGHX5UJaz` READY; integrazione Latina conservata,
  produzione `GHG3ecaBvtX3LwFZMhZNg3f4yvmA` READY verificata:11sorgenti identici
  ai byteGit,120articoli200/119con dueADS, testo/tabelle eAPIprivata401.
  Quindici prove sugli asset pubblicati Chromium1440/320+WebKit390 passate:
  keyword/esclusioni, turni completi, riapertura/ripristino e confronto.
  Backend intercettato, nessuna statistica reale di prova. Corretto il test
  online: annullamento ha3candidate, quindi una ripetizione necessaria.

## Vercel: chiave anteprime protetta come Secret — 26 ottobre 2026

- Su richiesta, `IMAGE_PREVIEW_STORAGE_KEY` ID`EmKPiCKdPIvC1XHr` convertita
  con PATCH del solo tipo: `sensitive`/`visibility=secret`, Production/Preview
  invariati. Valore non letto né reinviato; chiave Supabase conservata.
  API lettura200 con `decrypted=false` e valore nascosto verificata.
- Dodici anteprime online da cache persistente identiche SHA256; HEAD,
  rifiuto percorso privato e home/annunci/fiere verificati. Nessuna scrittura
  a DB/immagini, nessun cambio al codice del sito o ripristino della produzione.
  Backup remoto `backup/pre-image-preview-secret-20261026` verificato;
  prove private `Documents/vercel-image-preview-secret-20261026`, contratto
  `data/IMAGE_PREVIEWS.md`. Lavori e pubblicazioni concorrenti conservati.

## Spazio Vercel: pulizia confermata — 26 ottobre 2026

- Avviso100% dei10GB Hobby. Su conferma corrente eliminati i123ID approvati
  del21–25ottobre:123risposte DELETED e tutti assenti dal nuovo inventario.
  Restano14READY nel progetto `subingresso`; vecchio `subingresso.it`3READY intatto.
- Conservate ultime10produzioni riuscite, tutte quelle odierne e ogni alias;
  nuove pubblicazioni escluse dall'elenco. Dominio ancora su
  `411ZsjxU4AKwQX4FEUxocB7in2bP`:12artefatti funzioni e11asset statici
  identici prima/dopo;14pagine/API con esiti attesi. Retention invariata,
  nessuna scrittura DB/storage utenti o modifica al sito e ai lavori altrui.
- Percentuale residua non misurabile: API consumi Hobby404. Non promettere GB
  recuperati o avviso risolto. Backup tag remoto e bundleGit completo verificati;
  consueto errore cleanuphelper. Prove `Documents/verifica-spazio-vercel-20261026`.
  Conferma limitata ai123ID, senza autorizzazione a future pulizie automatiche.

## Calcolatore: finiture scure — 26 ottobre 2026

- Su richiesta, fondi antracite, logo senza alone, importi su superficie unica,
  scelte compatte con bordo/spunta e icone sobrie; focus visibile. Foglio locale
  `admin-theme-valutatore.css` dopo il tema comune, escluso dal generatore.
  Chiaro identico nei cinque confronti screenshot; calcolo invariato.
- Pubblicato `713f71d`, Vercel `411ZsjxU4AKwQX4FEUxocB7in2bP` READY:
  sette sorgenti identici ai byte Git. Percorso completo Chromium1440/768/390/320
  e WebKit390:125 controlli locali e125 sugli asset pubblicati; preferenza reale
  con identità simulata verificata online nei tre formati. Nessuna scrittura reale.
  41.472 scenari modello passati; inspector0FAIL, etichette preesistenti segnalate.
  Prove/limiti/errori fixture: `Documents/calcolatore-scuro-20261026`.
  Backup remoto verificato; consueto errore cleanup helper, lavori altrui conservati.

## Dashboard: fiere nell’area organizzatore e accesso ADS — 26 ottobre 2026

- Su richiesta, «Fiere e organizzatori» con revisione solo in `/organizzatore`,
  dal selettore destro. Permessi admin verificati, logout e risposte tardive
  protetti; gestione e statistiche personali conservate. Accesso «Le mie ADS»
  più compatto, descrizione breve e freccia a destra, nei due temi.
- Locali: 112 controlli area/permessi/ADS, 87 pannello, 364 profili e percorso
  eventi Chromium1440/320+WebKit390 passati; anche tablet768. Prove private
  `Documents/dashboard-organizzatore-ads-20261026`. Nessuna scrittura reale.
  Inspector/detector: rilievi preesistenti fuori ambito; scorciatoia isolata
  senza h1 per sua natura. Fixture canvas senza runtime corretta dopo falso
  overflow; backup remoto verificato, consueto errore cleanup helper.
  Pubblicato `cb155d6`, Vercel `7oRVCHAiAswfS7ZzgkGAdDtq3tcU` riuscito:
  quattro sorgenti identici ai byte Git e 112 controlli ripassati sui sorgenti
  pubblicati con sessioni/letture simulate. Gitleaks senza rilievi;
  conservati commit concorrente proposte blog e file estranei.

## Vetrine del blog nella raccolta ADS — 26 ottobre 2026

- Richiesta: collegare vecchi/nuovi articoli al sistema ADS e misurare i
  posteggi sponsorizzati in `/le-mie-ads`. Audit120articoli:91spazi esistenti,
  29ripristinati in chiusura, un solo spazio per articolo, testo conservato.
  Selettore geografico Premium invariato; zeroVetrine idonee reali rilevate.
- Nuova sezione con inventario, anteprima casuale per articolo, clic,
  impressioni, CTR/periodo eCSV; misure separate dalle20ADS proprie.
  `PATCH_BLOG_VETRINE_ADS_20261026.sql` applicata: RLS/privilegi verificati,
  zeroeventi reali. TestSQL inROLLBACK e Chromium1440/768/320+WebKit390
  passati; regressioni blogSSR,60Vetrine/800sorteggi, raccolta/tracker e
  abbinamenti admin passati. Inspector prima/dopo0FAIL; avviso sui banner
  colorati esistenti. Contratto `data/BLOG_VETRINE_ADS.md`, prove private
  `Documents/blog-vetrine-ads-20261026`. Pubblicato `4e4293c`, Vercel
  `6q6muwHP5YxsUpLoEE2uXMcgJKjr` riuscito:6sorgenti identici,120articoli200
  con spazio unico/testo conservato,119conADS proprie eAPIadmin401.
  Controllo pubblicato ha rilevato overflow del select nativo WebKit con
  titoli lunghi: contenimento e focus interno aggiunti, test esteso eCSSv2.
  Fix `3e833f0`, Vercel `E9JUbyVLyEDcSowPVW3CDxTqRAQt` riuscito:
  6sorgenti identici e prove pubblicate Chromium1440/320+WebKit390 passate,
  anteprima/dati admin simulati e selettore blog reale; zero scritture.
- Backup tag/ramo remoti verificati. Cleanuphelper ha prodotto errori dopo
  push riuscito; corretto label pubblicità che allungava il box320 e prima
  invocazione SQL privata con quoting PowerShell. Nessun acquisto, email o
  statistica cliente di prova; file estranei conservati.

## Piano editoriale futuro — 26 ottobre 2026

- `Articoli blog da sviluppare.md`: breve descrizione e 20 titoli con priorità
  🔴/🟠/🟢; obiettivi crescita rapida, poi ricavi. Aggiunti 11–20 dopo confronto
  con 120 articoli live, 10 proposte esistenti e campione web (Annunci Ambulanti,
  Ambulanti Online, MercaWeb, Eventi e Sagre); solo titoli, senza pubblicare articoli.
- Preferenza esplicita: comunicazioni e documenti essenziali, senza spiegare ogni passaggio.

## ADS: intenzione, parole e correzioni admin — 26 ottobre 2026

- Approvati punti1/2/4: frase/intenzione prima delle parole isolate, keyword
  prioritarie/escluse specifiche per20ADS, anteprima motivata e correzioni
  persistenti in «Abbinamenti nel blog». «Prima di comprarlo» →acquisto;
  negazioni esplicite e vendita merci distinte. Solo ADS proprie.
- Bozze senza scritture, salvataggio esplicito, ripristino automatico,
  esclusioni per articolo e parole perADS. Regole correnti lette una volta
  dal browser, anche con HTML precedente; nessun nuovo fetch del corpo.
  Tabella metadati/RPC `PATCH_CONTEXTUAL_AD_RULES_20261026.sql` applicata:
  RLS/privilegi/revisioni verificati,0regole reali iniziali, anon save401.
  TestDB inROLLBACK e API/UI Chromium1440/768/320 +WebKit390 passati,
  inclusi conflitti, logout/risposte tardive e aggiornamento HTML precedente.
- Audit120/119ADS e regressioni SSR, raccolta/API/tracker e annunci nel blog
  passati; inspector0FAIL, banda SVG live motivata. Prove e contratto:
  `Documents/ads-intento-admin-20261026`, `data/CONTEXTUAL_ADS.md`.
  Backup tag/ramo remoti verificati; helper stderr dopo tag riuscito.
  Corrette prove: attributo misura invece del ridimensionamento CSS e
  fixture script con/senza slash. Pubblicato `50579b8`, Vercel
  `APYCpVQZiVfUYfwUPexV3QnEAKiW` READY:8sorgenti identici ai byteGit,
  120articoli200/119conADS e testo conservato. Dodici casi pubblicati
  Chromium1440/320 eWebKit390: acquisto/fiere/annullamento/vendita, formati,
  animazione/pausa passati, servizi intercettati. Regole pubbliche200/no-store,
  opzioni/salvataggio admin anonimi401; nessuna regola reale di prova.

## ADS contestuali: keyword e formati — 25 ottobre 2026

- Richiesta: abbinare slot/articoli e ADS per keyword e formato, sorteggiando
  fra quelle pertinenti; solo nostreADS. Clienti paganti futuri esclusi ora.
  Motore condiviso SSR/browser, dizionario sinonimi, priorità titolo/slug,
  esclusione testi pubblicitari e distinzione vendita merci/licenze.
  Due slot, formati728×90/336×280/300×250, niente doppioID se alternative,
  nuovo sorteggio al caricamento e formato adattato senza cambiare creatività.
  Catalogo pubblico20ADS senza statistiche; API raccolta ancora admin.
  Contratto `data/CONTEXTUAL_ADS.md`; prove `Documents/ads-keywords-20261025`.
- Audit120articoli:119coperti, eredi escluso come prima, testo/tabelle
  conservati; fiere/bandi pertinenti. Prove Chromium1440/768/320 eWebKit390,
  regressioni caricamentoSSR, annunci reali nel blog e raccolta/API/tracker
  passate. Pubblicato `a7e7daf`, Vercel `BQeNrmriHcaQ8uyQvVyb8NF7svw3`
  READY:120articoli200,119conADS, testo editoriale conservato, selezioni
  pertinenti/distinte,4sorgenti identici ai byteGit e APIprivata401.
  Nove prove sui contenuti/asset pubblicati Chromium1440/320 eWebKit390:
  fiere/vendita/acquisto, formati/animazione/pausa passati; servizi intercettati,
  zero scritture reali. Inspector componente0FAIL; avvisi pagina intera
  dovuti al popup accesso preesistente. Gitleaks senza rilievi.
  Nessuna modifica DB o pagamento.
  Backup tag/ramo remoti verificati; helper fermato da output Git su stderr
  dopo push tag riuscito. Affinato match per «comprare banco e vendere merci».

## ADS: messaggi e spazio — 25 ottobre 2026

- Richiesta attuale: nella raccolta avvio automatico anche con riduci movimento,
  senza clic su «Riproduci»; testi conservati, sfumature blu/oro lente19,2s
  dietro la grafica in tutte160varianti animate, anche durante la lettura.
  Pausa e stop fuori campo/scheda nascosta conservati; inserimenti pubblici
  rispettano ancora riduci movimento. Assetv6/player3/admin6. Prove movimento
  Chromium1440/320 e WebKit390, pannello/API/tracker e blogSSR passate;
  inspector0FAIL con eccezioni gradiente richiesto e mosaico1:1 preesistente.
  Pubblicato `d55916b`, Vercel `2Rt8JrmDkCvcjXbYNLZdnx1YhwJB` READY:
  164file identici ai byteGit, API401 e blogSSR con player3 verificati.
  Pagina/asset pubblicati e account fittizio: Chrome155 1440 normale/ridotto,
  Chromium320 e WebKit390 ridotti passano avvio, sfumature, testo e pausa;
  zero errori/scritture. ZIP8/160animati identici eCRC validi.
  Prove `Documents/ads-autoplay-sfondo-20261025`.
  Backup tag/ramo remoti verificati, noto errore cleanuphelper. Primo test
  blog senza envPlaywright, soglia decimale19,2s e confrontoSHA con byteGit
  invece diCRLF locali corretti nelle prove;
  scanGitleaks con configurazione progetto senza rilievi.
- Segnalazione «non si animano»: Chrome155 isolato con pagina/asset pubblicati
  e dati fittizi conferma avvio normale; con riduci movimento il comando era
  disabilitato. Corretto: statico automatico, «Riproduci animazioni» consente
  prova manuale; errori caricamento riprovabili. Riferimenti player/admin
  aggiornati per cache. Nessun accesso alla sessione utente o scrittura dati.
  Prove movimento Chromium1440/320 e WebKit390 passate, incluso avvio
  esplicito con riduzione attiva e retry raccolta/inserimento esterno.
  Regressioni pannello/API/tracker e blogSSR passate nei formati previsti.
  Pubblicato `2f95ff4`, Vercel `7VLk3fEbZvHTpyxgyThF46HJVNHD` success:
  4sorgenti identici online, API401, blogSSR con player aggiornato. Chrome155
  con pagina/asset pubblicati e account fittizio: scrittura e pausa passano
  sia con avvio normale sia manuale su movimento ridotto, zero errori o
  scritture. Prove `Documents/ads-movimento-hd-20261025/avvio-fix`.
- Movimento/HD richiesti: scrittura in vista, poi due piccoli impulsiCTA e
  loop6,4s con tempo di lettura. Pausa, fuori campo/scheda nascosta e riduci
  movimento mostrano lo statico completo. Palette e messaggi conservati;
  SVG in pagina, PNG web2×/social1080 a colori pieni, immagini originali1600
  JPEG94. Assetv5; SVG animati/HTML aggiunti ai pacchetti. Ricerca primaria e
  scelte `data/PERSONAL_ADS_MOTION.md`; prove `Documents/ads-movimento-hd-20261025`.
  Pubblicato `4f3914c`/merge `01a41fa`, Vercel
  `EDWq3rnCTpUSREBesvzA1ymQaM4q` success:480asset e5file identici online,
  CORS pubblico immagini verificato, API401/20destinazioni inpreview e
  inizializzatore nel blogSSR200. Animazione/pausa da pagina esterna reale
  con asset pubblicati passate Chrome1440/320 e WebKit390 aDPR2, senza
  scritture. Regressioni pannello/tracker/blog, movimento e ZIP passati;
  lint/inspector0FAIL, gitleaks senza rilievi. Backup remoto dedicato
  verificato; aggiornamento Pescara integrato e conservato.
- Seguito da screenshot: cifra/frase ravvicinate, mai «AL» isolato; contesto
  piccolo subito sotto, esplicito per fiere/posteggi/vendita e coerente col
  link, anche nei banner90/100px. Importi ed esclamativi conservati; niente
  paragrafi giganti. Scene IA del blog nei verticali/social per occupare lo
  spazio restante. Assetv4, pubblicato `c397e6a`, Vercel
  `GJ1K2WZuniyuYwrKh7f79zXYz1da` success:320immagini identiche online,
  20linkpreview corretti e API anonima401. Build160varianti verifica anche
  frase numerica intera e contesto vicino; pannello/tracker e ZIP finali
  passati Chrome1440/768/320 e WebKit390, SVG con immagini verificati in
  entrambi i browser. Inspector0FAIL, otto tavole controllate. Prove nella
  stessa cartella `ads-copy-layout-20261025`; backup remoto dedicato valido.
- Correzione esplicita dell’utente: punti esclamativi, con «5.000 € in
  2 giorni!!!» e «5.000 € al giorno!!!»; chiusure dei titoli esclamative
  in tutte le misure, assetv3. Questa preferenza prevale sull’interrogativa
  del primo intervento. Pubblicato `a3abe78`, Vercel
  `4TzBRGmN3UMPZs7t5o7JYX4bjydE` success:320immagini identiche online,
  glifi160varianti nei box/senza sovrapposizioni e due numerici controllati
  visivamente. Backup remoto `backup/pre-ads-esclamativi-20261025` verificato.
- Preferenza: un aggancio breve, forte e convincente; numeri in evidenza,
  niente paragrafi, sfruttare i box con composizioni dedicate alle misure.
  Riscritte20ADS, rigenerate160varianti PNG/SVG; «5.000 € in 2 giorni?»
  e «5.000 € al giorno?» come obiettivi, senza garanzie d’incasso.
- Conservati ID, tracking, statistiche, mosaico1:1 e strumenti; assetv2.
  Pubblicato `3d33413`/merge `4a320a0`, Vercel
  `8p7XzVGPiiaVqyi5moVBCGdwGEaB` success:320immagini e pagina/JS
  identici online, API anonima401 e20destinazioni inpreview corrette.
- Chromium1440/768/320 e WebKit390 chiaro/scuro, copia/ZIP/CSV,
  filtri160, logout/accesso e tracker passati. Tutti i glifi dentro i box
  e senza sovrapposizioni; inspector0FAIL, otto tavole controllate.
  Login reale online verificato senza scritture; nessun dato cliente di prova.
  Prove `Documents/ads-copy-layout-20261025`; backup remoto tag/ramo
  verificati, noto errore cleanuphelper. Integrato Ascoli senza alterarlo.

## Miglioria in fiera e vecchio posteggio: pubblicazione verificata — 25 ottobre 2026

- Pubblicato «Chiedo la miglioria in fiera: rischio di perdere il mio vecchio posteggio?», slug `miglioria-fiera-perdere-vecchio-posteggio`, ID `999151cf-128f-40c7-bf04-0e4102e51f1e`. Articolo e copertina HTTPS su subingresso.it verificati HTTP200; 579 parole editoriali, sei sezioni brevi e due soli banner: calendario fiere al centro, annunci in chiusura. Nessun doppione; 118 articoli precedenti invariati, totale 119.
- Fonti primarie HTTP200: Montecchio Emilia, regolamento fiere San Marco/San Simone art.15, tuttora collegato nella pagina comunale aggiornata 24/09/2026 con documenti 2026; Civitella di Romagna, avviso Fiera dei Santi 2025 artt.2/7/9, dichiarato esempio storico scaduto. Domanda distinta dalla scelta vincolante; nessuna conservazione del vecchio posto o possibilità di ritorno garantita a livello nazionale. PDF originali scaricati e pagine13/4 lette e verificate visivamente dopo errore screenshot web. Sorgenti e limiti in `data/blog/`; originale e prompt completo imagegen integrato, prove e ricevute in `Documents/articoli-subingresso/miglioria-fiera-perdere-vecchio-posteggio/`.
- Materiali `4c07c19`, Vercel riuscito `5i6zf4VcUALtzjyw1wz92SiN9ajo`; copertina WebP1600×900 identica SHA256. SEO SSR/NewsArticle/canonical, indice e sitemap verificati; Chromium1440/768/320 e WebKit390, anche senza JS, nessun overflow o errore pagina. Entrambe le CTA raggiungono `/fiere` e `/annunci`200, senza dati reali di prova; nessun trigger sul blog. Backup remoto `backup/session-20261025-154419-articolo-miglioria-fiera` verificato; noto errore cleanup del helper, non ripetuto. Gitleaks senza rilievi; checkout principale e lavori altrui preservati.
- Search Console NON inviata: accesso effettivo fermo al login Google, nessuna credenziale pertinente o sessione browser debug collegabile; ricerca integrazioni trova GSC solo in lettura. Resta Controllo URL → Richiedi indicizzazione per `https://subingresso.it/blog?post=miglioria-fiera-perdere-vecchio-posteggio`, distinto dalla presenza in sitemap e dall’indicizzazione effettiva.

## Il Comune sposta il mercato: pubblicazione verificata — 25 ottobre 2026

- Pubblicato «Il Comune sposta il mercato: come vengono riassegnati i posteggi?», slug `comune-sposta-mercato-riassegnazione-posteggi`, ID `0837dbef-fc5c-40b1-b43e-7349314dba42`. Articolo e copertina HTTPS su subingresso.it HTTP200; 538 parole editoriali, sei sezioni brevi e due soli banner: ricerca posteggi al centro, vendita in chiusura. Nessun doppione; 117 articoli precedenti invariati, totale118.
- Fonti primarie HTTP200: Lombardia DGR4054/2020 allegatoA punto8 comma4 e quadro normativo aggiornato9/10/2026; Lazio LR22/2019 art52 comma6, testo coordinato vigente. Criteri esclusivamente regionali; atti, graduatoria e tempi da controllare nel singolo Comune. Nessuna posizione o anzianità del cedente garantite ovunque. PDF Lombardia pagina17 verificata localmente e visivamente dopo errore screenshotweb; collegamento storicoWCM404 sostituito con attuale content/dam200. Sorgenti/fonti in `data/blog/`; originale, prompt completo imagegen integrato e prove in `Documents/articoli-subingresso/comune-sposta-mercato-riassegnazione-posteggi/`.
- Materiali `d1c74c4`, Vercel riuscito `GLiYkaSxCVD7Fcdt2VLMcH1aMPCk`; copertina WebP1600×900 identica SHA256. Verificati SEO SSR/NewsArticle/canonical, indice/sitemap, Chromium1440/768/320 e WebKit390, anche senzaJS; nessun overflow/errore. Due CTA raggiungono `/annunci` e `/vendi`200, senza dati reali di prova. Backup remoto `backup/session-20261025-153449-articolo-comune-sposta-mercato` verificato; noto errore cleanuphelper non ripetuto. Gitleaks senza rilievi; checkout principale e lavori altrui preservati.
- Search Console NON inviata: accesso effettivo fermo al loginGoogle, nessuna credenziale pertinente o sessione debug collegabile; integrazione trovata solo in lettura GSC. Resta Controllo URL → Richiedi indicizzazione per `https://subingresso.it/blog?post=comune-sposta-mercato-riassegnazione-posteggi`, distinto dalla sitemap e dall’indicizzazione effettiva.

## Fiera annullata per maltempo e rimborso: pubblicazione verificata — 25 ottobre 2026

- Pubblicato «Fiera annullata per maltempo: come verificare se ti spetta il rimborso del posteggio», slug `fiera-annullata-maltempo-rimborso-posteggio`, ID `a6b4aeab-d38d-4924-a084-51b61c7e77fa`. Articolo e copertina HTTPS su subingresso.it HTTP200; 686 parole editoriali, sei sezioni brevi, modello di richiesta e due soli banner fiere. Nessun doppione; 116 articoli precedenti invariati, totale117.
- Fonti primarie HTTP200: regolamento Trento attualmente collegato dalla scheda comunale2026, artt.45/64/66, e Fiera di Primavera Paderno Dugnano, regolamento edizione2026 artt.4/9. Annullamento/rinvio/rinuncia e canone/quota organizzatore distinti; esempi esclusivamente locali, nessun rimborso o termine nazionale inventato. PDF ufficiale200, pagine25/37/38 lette e verificate visivamente dopo errore screenshotweb. Sorgenti/fonti `data/blog/`; prompt imagegen, originale e prove `Documents/articoli-subingresso/fiera-annullata-maltempo-rimborso-posteggio/`.
- Materiali `7b90a29`, Vercel riuscito `DEUe1rP8WSUcwaF9sYEEpqdQyTX6`; copertina originale imagegen integrato WebP1600×900 identica SHA256. SEO SSR/NewsArticle/canonical, indice/sitemap e Chromium1440/768/320, WebKit390, senzaJS verificati: nessun overflow/errore, entrambe le CTA raggiungono `/fiere`200, nessun dato reale di prova. Backup remoto `backup/session-20261025-152355-articolo-fiera-annullata-rimborso` verificato; noto errore cleanuphelper, non ripetuto. Gitleaks senza rilievi; checkout principale e lavoro altrui preservati.
- Search Console NON inviata: accesso effettivo fermo al loginGoogle, nessuna credenziale pertinente o sessione browser debug collegabile; integrazione trovata solo in lettura GSC. Resta Controllo URL → Richiedi indicizzazione per `https://subingresso.it/blog?post=fiera-annullata-maltempo-rimborso-posteggio`, distinto dalla presenza in sitemap e dall’indicizzazione effettiva.

## Furgone sostitutivo e targa ZTL: pubblicazione verificata — 25 ottobre 2026

- Pubblicato «Furgone sostitutivo per andare al mercato: come cambiare la targa sul permesso ZTL», slug `furgone-sostitutivo-cambio-targa-permesso-ztl`, ID `143a87df-8f42-4bfe-b277-1012fdb8b0f3`. Articolo e copertina HTTPS su subingresso.it HTTP200; 613 parole editoriali, sei sezioni brevi e due soli banner fiere. Nessun doppione; 115 articoli precedenti invariati, totale116.
- Fonti primarie HTTP200: Trentino Mobilità, portale ZTL Aosta e Roma Mobilità; modulo Trento originale200 letto e controllato visivamente dopo errore del lettoreweb. Condizioni esclusivamente comunali, ambiti regionali espliciti, nessuna tariffa o durata generalizzata. Omesse le durate romane per formulazione non allineata tra scheda e modulo allegato. Testo, metadati e fonti in `data/blog/`; originale imagegen e prove in `Documents/articoli-subingresso/furgone-sostitutivo-cambio-targa-permesso-ztl/`.
- Materiali `f095d34`, Vercel riuscito `HQsVmhixFTuyioX4aRiRmxMgc53a`; copertina WebP1600×900 identica SHA256. Verificati SEO SSR/NewsArticle/canonical, indice e sitemap; Chromium1440/768/320 e WebKit390, anche senzaJS, nessun overflow/errore finale. Entrambe le CTA raggiungono `/fiere`200, senza dati reali di prova. Backup remoto `backup/session-20261025-151201-articolo-furgone-sostitutivo-ztl` verificato; noto errore cleanuphelper, non ripetuto. Primo controlloUnicode nel test privato corretto e ripetuto; gitleaks senza rilievi. Checkout principale e lavori altrui preservati.
- Search Console NON inviata: accesso effettivo fermo al loginGoogle, nessuna credenziale pertinente o sessione browser debug collegabile; integrazione trovata solo in lettura GSC. Resta Controllo URL → Richiedi indicizzazione per `https://subingresso.it/blog?post=furgone-sostitutivo-cambio-targa-permesso-ztl`, distinto dalla presenza in sitemap e dall’indicizzazione effettiva.

## Tenda, appendiabiti e merce fuori dal banco: pubblicazione verificata — 25 ottobre 2026

- Pubblicato «Tenda, appendiabiti e merce fuori dal banco: quali misure devo rispettare?», slug `tenda-appendiabiti-merce-fuori-banco-misure`, ID `0594b319-d6b5-4428-ab08-1618ff480ad8`. Articolo e copertina HTTPS su subingresso.it HTTP200; 532 parole editoriali, sei sezioni brevi, due soli banner: acquisto al centro e vendita in chiusura. Nessun doppione; 114 articoli precedenti invariati, totale115.
- Tre fonti primarie HTTP200: MEF art.28 commi8/15, Torino regolamento305 artt.34/35 e Genova artt.26/29/30 richiamati nell’avviso comunale aggiornato settembre2026. Misure solo comunali, regioni esplicite, nessuna tolleranza nazionale inventata. PDF Torino iniziale sostituito prima dell’inserimento col collegamento attuale `/media/4426`, pagine40–41: norme identiche, diversa impaginazione. Screenshotweb fallito, originali e pagine controllati localmente. Testo/fonti in `data/blog/`; dossier e prompt completo imagegen integrato in `Documents/articoli-subingresso/tenda-appendiabiti-merce-fuori-banco-misure/`.
- Materiali `8b35233` e fonte aggiornata `329b3ba`, deploy Vercel riuscito `5x4Bf8aJ1xZQnfkcAsNKbaY92GA2`; copertina WebP1600×900 identica SHA256. Verificati SEO SSR/NewsArticle/canonical, indice/sitemap, Chromium1440/768/320 e WebKit390, anche senzaJS; nessun overflow/errore finale. Entrambe le CTA raggiungono `/annunci` e `/vendi`200, senza dati reali di prova. Backup remoto preventivo `backup/session-20261025-120959-articolo-tenda-appendiabiti` verificato; helper exit0 con noto errore cleanup, non ripetuto. Asserzione del test riusato corretta nel dossier prima delle verifiche riuscite; gitleaks senza rilievi. Checkout principale e lavoro altrui preservati.
- Search Console NON inviata: accesso effettivo fermo al loginGoogle, nessuna credenziale pertinente o sessione browser debug collegabile; ricerca integrazioni trova GSC solo in lettura. Resta Controllo URL → Richiedi indicizzazione per `https://subingresso.it/blog?post=tenda-appendiabiti-merce-fuori-banco-misure`, distinto dalla presenza in sitemap e dall’indicizzazione effettiva.

## Furgone più grande e ampliamento posteggio: pubblicazione verificata — 25 ottobre 2026

- Pubblicato «Ho comprato un furgone più grande: posso ampliare il posteggio al mercato?», slug `furgone-piu-grande-ampliare-posteggio-mercato`, ID `d70b2e89-d37f-4c30-9ca0-59562a8cee47`. Articolo e copertina HTTPS su subingresso.it HTTP200; 524 parole editoriali, sei sezioni brevi, due soli banner: acquisto al centro e vendita in chiusura. Nessun doppione; 113 articoli precedenti invariati, totale114.
- Quattro fonti primarie HTTP200: MEF art.28 comma15, DGR Lombardia4054/2020 allegatoA punto3.2 comma4, Segrate artt.34/38/40, Pavia art.31. Distinti furgone da trasporto e autoveicolo attrezzato come punto vendita; diritto lombardo e vincoli/alternative locali espliciti, nessun costo o ampliamento automatico inventato. Allegati riscontrati nelle pagine istituzionali attuali; DGR6110/2022 modifica paragrafi9–11, non il3.2. Sorgenti/fonti in `data/blog/`; prompt completo imagegen integrato, originali e prove in `Documents/articoli-subingresso/furgone-piu-grande-ampliare-posteggio-mercato/`.
- Materiali `3495e6a`, deploy Vercel riuscito `BsXz4Nm4fBgw6DhBkuRQBRULKRQW`; copertina WebP1600×900 identica SHA256. Verificati SEO SSR/NewsArticle/canonical, indice/sitemap, Chromium1440/768/320, WebKit390 e leggibilità senzaJS; nessun overflow/errore finale. Entrambe le CTA provate fino a `/annunci` e `/vendi`200, senza dati reali di prova. Backup remoto preventivo verificato; helper exit0 con errore noto cleanup, non ripetuto. Gitleaks senza rilievi. ScreenshotPDF web falliti: originali200 e pagine pertinenti controllati localmente; corretti due letteraliUnicode nel test riusato, contenuto intatto. Checkout principale e lavoro altrui preservati.
- Search Console NON inviata: accesso effettivo fermo al loginGoogle, nessuna credenziale pertinente o sessione browser debug collegabile; ricerca integrazioni trova GSC solo in lettura. Resta Controllo URL → Richiedi indicizzazione per `https://subingresso.it/blog?post=furgone-piu-grande-ampliare-posteggio-mercato`, distinto dalla presenza in sitemap e dall'indicizzazione effettiva.

## Da abbigliamento a casalinghi: pubblicazione verificata — 25 ottobre 2026

- Pubblicato «Compro un banco di abbigliamento: posso usarlo per vendere casalinghi?», slug `comprare-banco-abbigliamento-vendere-casalinghi`, ID `f05b4e4a-7efb-4b57-9b0e-bbb6ff52f101`. Articolo e copertina HTTPS su subingresso.it HTTP200; 600 parole, sei sezioni brevi, due soli banner: ricerca al centro e vendita in chiusura. Nessun doppione; 112 articoli precedenti invariati, totale113.
- Quattro fonti primarie HTTP200: Parlamento art.5 per la distinzione di base, stampa vigente MEF art.28 comma15 pagina2, Lombardia l.r.6/2010 artt.21/25 e Segrate art.40 pagina28. Chiari i vincoli del singolo posteggio e gli ambiti locali; nessuna promessa di cambio automatico. Fonti/testo/metadati in `data/blog/comprare-banco-abbigliamento-vendere-casalinghi.*`; dossier, prompt completo imagegen integrato e originali in `Documents/articoli-subingresso/comprare-banco-abbigliamento-vendere-casalinghi/`.
- Materiali `9751233`, deploy Vercel riuscito `FK6KaAkhfNorfyz5xvHQzXCc1gEg`; copertina WebP1600×900 identica per SHA256. Verificati SEO SSR/NewsArticle/canonical, indice/sitemap, Chromium1440/768/320, WebKit390 e leggibilità senzaJS; nessun overflow/errore finale. CTA provate fino a `/annunci` e `/vendi`200, nessun dato reale di prova. Backup remoto preventivo verificato, noto errore cleanuphelper; gitleaks reale senza rilievi. Normattiva/sommario MEF non leggibili dal toolweb, verificata stampa ufficiale; screenshotweb Segrate fallito, originale200 e pagina28 controllati localmente. Vecchia asserzione del test riusato corretta nel dossier prima delle prove riuscite. Checkout principale e lavoro altrui preservati.
- Search Console NON inviata: accesso effettivo al loginGoogle, nessuna credenziale pertinente o browser debug collegabile; ricerca integrazioni restituisce GSC in sola lettura. Resta Controllo URL → Richiedi indicizzazione per `https://subingresso.it/blog?post=comprare-banco-abbigliamento-vendere-casalinghi`, distinto dalla presenza in sitemap.

## Scambio del posteggio: pubblicazione verificata — 25 ottobre 2026

- Pubblicato «Scambiare il posteggio con un altro ambulante: domanda, documenti e autorizzazioni», slug `scambiare-posteggio-altro-ambulante`, ID `ed6392f2-1d02-4563-a92c-a6eb85549fea`. Articolo e copertina HTTPS su subingresso.it HTTP200; 577 parole, sei sezioni brevi e due banner, ricerca annunci al centro e vendita in chiusura. Nessun doppione; 111 articoli precedenti invariati, totale112.
- Sei fonti primarie HTTP200: servizi/moduli Gallarate, Brescia e Asti, regolamento Segrate art.42 pagina30. Ambiti comunali espliciti, nessuna tariffa o scadenza generalizzata. Testo/metadati/fonti in `data/blog/scambiare-posteggio-altro-ambulante.*`; originali, prompt imagegen integrato e prove in `Documents/articoli-subingresso/scambiare-posteggio-altro-ambulante/`. PDF non leggibili dal toolweb verificati dagli originali locali.
- Materiali `c775325`, deploy Vercel riuscito `EK3zYRBAFxjKZusSnmVwmrXoSpU5`; copertina WebP1600×900 identica per SHA256. Verificati SEO SSR/NewsArticle/canonical, indice/sitemap, Chromium1440/768/320 e WebKit390, anche senzaJS. Due CTA raggiungono `/annunci` e `/vendi`200; articolo senza overflow/errori finali. Nessun dato reale di prova. Backup remoto preventivo verificato, noto errore cleanuphelper; gitleaks senza rilievi. Asserzioni del test riusato corrette e clic isolati in schede distinte dopo una lettura catalogo interrotta dalla navigazione; nessuna modifica ai componenti. Checkout principale e lavoro concorrente preservati.
- Search Console NON inviata: accesso effettivo fermo al loginGoogle, nessuna sessione debug o credenziale pertinente; ricerca integrazioni trova solo lettura GSC. Resta Controllo URL → Richiedi indicizzazione per `https://subingresso.it/blog?post=scambiare-posteggio-altro-ambulante`, distinto dalla presenza in sitemap.

## Cedere un solo posteggio: pubblicazione verificata — 25 ottobre 2026

- Pubblicato «Posso vendere un solo posteggio e tenere gli altri mercati della mia licenza?», slug `vendere-un-solo-posteggio-tenere-altri-mercati`, ID `aa7a9621-839e-4209-bb46-a0447bf0b359`. Articolo e copertina su subingresso.it HTTP200; 625 parole, sei sezioni brevi, due soli banner vendita. Nessun doppione: 110 articoli precedenti invariati, totale111.
- Fonti primarie tutte200: MIMIT236368/2016 pagina2 (chiarimento storico sulla cessione del singolo ramo, originale e pagina verificati), Lombardia l.r.6/2010 art.25 vigente e servizioSUAP Brescia. Ambito lombardo esplicito, nessuna promessa di separazione automatica di vecchi titoli. Fonti/testo in `data/blog/vendere-un-solo-posteggio-tenere-altri-mercati.*`; dossier, prompt e originale imagegen integrato in `Documents/articoli-subingresso/vendere-un-solo-posteggio-tenere-altri-mercati/`.
- Materiali `e9af19b`, Vercel riuscito `CfDAhnuE6ZX8zJ4mQVNNzXLfANzd`; copertina WebP1600×900 identica per SHA256. Verificati SEO SSR/NewsArticle/canonical, indice e sitemap; Chromium1440/768/320 e WebKit390, anche senzaJS: nessun overflow/errori finali, entrambi i banner raggiungono `/vendi`200. Solo anteprime dei clic, nessun dato reale di prova. Backup remoto preventivo verificato, noto errore cleanuphelper; gitleaks senza rilievi. Prove iniziali corrette per trackerCTA e attesa delle richieste prima di rinavigare; dettagli nel dossier, componenti invariati e lavoro estraneo preservato.
- Search Console NON inviata: accesso effettivo al loginGoogle, nessuna sessione debug/credenziale pertinente; integrazione trovata solo in lettura. Resta Controllo URL → Richiedi indicizzazione per `https://subingresso.it/blog?post=vendere-un-solo-posteggio-tenere-altri-mercati`, distinto dalla presenza in sitemap.

## San Faustino Brescia: pubblicazione verificata — 25 ottobre 2026

- Pubblicato «Fiera di San Faustino a Brescia: mappa dei posteggi, numeri e accessi per i furgoni», slug `fiera-san-faustino-brescia-posteggi-accessi-furgoni`, ID `04d4f6ca-ea25-46d5-bdb4-9884bc3471b1`. Articolo e copertina HTTPS su subingresso.it HTTP200; 648 parole editoriali, sei sezioni e due soli banner (fiere al centro, annunci Lombardia alla fine). Nessun doppione; 119 articoli precedenti invariati, 120 totali.
- Fonti comunali attuali200: scheda SUAP (organico602/5agricoli, accesso1–5 con concessione); regolamento83pagine, art.19 c.10 e art.20 cc.1/7/9, pagine24/25 lette e verificate visivamente; documenti fiera e progetto ZTL. Ricerca estesa su nuovo sito, sitemap2376URL, allegati e archivi: planimetria2026 ancora410, nessun sostituto reperito. Limite dichiarato in apertura: guida a reperimento e lettura del numero, nessuna mappa ricostruita o percorso futuro inventato. Rimossa l'errata attribuzione all'utente di un ordine di bloccare la pubblicazione.
- Materiali `e5fc327`, Vercel riuscito `FDgYLpr6wzX1XWm1X3CViBrxDuW9`; copertina IA riusata1600×900 identica SHA256. SEO SSR/NewsArticle/canonical, indice/sitemap, Chromium1440/768/320, WebKit390 e senzaJS verificati; entrambe le CTA200, nessun overflow/errore o dato reale di prova. Sorgenti/fonti in `data/blog/`, precedenti bozze e prove `ripresa-*` in `Documents/articoli-subingresso/fiera-san-faustino-brescia-posteggi-accessi-furgoni/`. Backup remoto `backup/session-20261025-155310-ripresa-san-faustino` verificato, consueto errore cleanup helper; gitleaks senza rilievi, lavori altrui preservati.
- Search Console NON inviata: verifica corrente al loginGoogle; nessuna credenziale pertinente, sessione debug o strumento di invio collegato. Resta Controllo URL → Richiedi indicizzazione per `https://subingresso.it/blog?post=fiera-san-faustino-brescia-posteggi-accessi-furgoni`; presenza in sitemap e indicizzazione effettiva sono distinte.

## Articolo fiere lombarde con domande aperte — 25 ottobre 2026

- Pubblicato «Fiere in Lombardia con domande ancora aperte: scadenze, costi e merce ammessa», slug `fiere-lombardia-domande-aperte`, ID `35ce3ec9-7c47-4fb1-8b13-0fab72ac87fb`. Selezione di due casi comunali verificati: San Giulio/Castellanza 31/01/2027, domanda entro 30/11/2026; Natale d’Incanto/Ponte San Pietro 13/12/2026, adesione entro 02/12/2026. Bollo 16 euro distinto dal costo del posteggio non pubblicato a Castellanza; Ponte gratuito, cauzione 20 euro e gazebo facoltativo 70 euro. Merci tipiche a Castellanza, elenco preciso non pubblicato a Ponte. Nessuna disponibilità garantita; Merate scaduta e Lodi priva di riscontro primario escluse.
- Pubblicazione verificata, commit `56e3ec0`, Vercel `AUezNAY5qSp3uAzos3hqMuRjmzTf` success. 600 parole editoriali, sei sezioni, due banner fiere/acquisto; copertina originale IA WebP1600×900 su subingresso.it identica SHA256. Cinque link esterni HTTP200, SEO/indice/sitemap e Chromium1440/768/320, WebKit390, senza JS passati; CTA reali verificate senza scritture di prova. Precedenti109articoli identici,110totali. Sorgenti/fonti `data/blog/`; prompt, originali e prove `Documents/articoli-subingresso/fiere-lombardia-domande-aperte`.
- Search Console NON inviata: accesso corrente fermo al loginGoogle, nessuna sessione debug o credenziale pertinente; integrazione trovata solo in lettura. Resta Controllo URL → Richiedi indicizzazione per `https://subingresso.it/blog?post=fiere-lombardia-domande-aperte`, distinto dalla sitemap. Backup remoto preventivo verificato; errore noto cleanuphelper, backup riuscito non ripetuto. ScreenshotPDF web falliti, originali scaricati200 e due pagine per documento controllate localmente. Checkout isolato, lavoro estraneo preservato; gitleaks senza rilievi.

## Articolo spunta nei mercati di Milano — 25 ottobre 2026

- Pubblicato «Spunta nei mercati di Milano: orari, dove presentarsi e documenti, mercato per mercato», slug `spunta-mercati-milano-orari-documenti`, ID `661a881d-82ed-4281-8c3c-e25814d83166`. 714 parole visibili, sei sezioni, sette elenchi apribili con tutti93appuntamenti del report21/10/2026; orari vendita/spunta distinti, iscrizione7gennaio–finefebbraio ed esitoSUAP, CUPentro10, ruolino e mercati non presidiati. Due banner fiere/acquisto e copertina originale IA WebP1600×900.
- Commit `20cf647`, Vercel `ietVbbQNKXFQyqmw9HTFXe5oMaK9` success: immagine identicaSHA256, indice/sitemap/SEO e Chromium1440/768/320,WebKit390,senzaJS passati;93righe e7aperture per formato, due CTA reali verificate senza scritture di prova. Precedenti108articoli identici,109totali. Sorgenti/fonti `data/blog/`, prove/prompt/originali `Documents/articoli-subingresso/spunta-mercati-milano-orari-documenti`.
- Search Console NON inviata: loginGoogle richiesto, nessuna sessione debug/credenziale pertinente; integrazione disponibile solo in lettura. Resta Controllo URL → Richiedi indicizzazione. Backup remoto preventivo verificato, cleanuphelper con errore noto; push iniziale non-fast-forward risolto con rebase in checkout isolato, lavoro estraneo preservato. Fonti403 con fetch diretto, tutte200 via Chromium; originaliPDF e pagine renderizzate controllati. Toponimi estesi e linkreport relativo corretti prima del deploy; gitleaks senza rilievi.

## Articolo canone mercatale e TARI — 25 ottobre 2026

- Pubblicato «Pago già il canone mercatale: devo pagare anche la TARI del banco?», slug `canone-mercatale-tari-banco`, ID `c585fa3a-16e2-4b37-b374-55ec94e2f5e1`. 556 parole editoriali, sei sezioni; legge160/2019 commi838/842, occupazioni temporanee/permanenti e rata annuale distinte. Sentenza Piemonte412/2026 esplicitamente circoscritta a Volvera/TARIG2024 e tariffa unica dal2025; nessuna esenzione o vittoria garantita. Due banner fiere/acquisto, copertina originale IA WebP1600×900.
- Commit `29cc711`, Vercel `HzkYf6h9q93h27ZpLDA8WKTAxqDN` success: copertina identicaSHA256, SEO/indice/sitemap e Chromium1440/768/320,WebKit390,senzaJS passati; due pulsanti verificati senza scritture di prova. Precedenti107articoli identici,108totali al controllo. Sorgenti/fonti `data/blog/`; prompt, originali e prove `Documents/articoli-subingresso/canone-mercatale-tari-banco`.
- Search Console NON inviata: loginGoogle richiesto, nessuna sessione debug/credenziale pertinente; integrazione trovata in sola lettura. Resta Controllo URL → Richiedi indicizzazione, distinto dalla sitemap. Backup remoto preventivo verificato; cleanup helper con errore noto. Sentenza originale scaricata200, testo integrale e pagina4 verificati localmente. Lavoro concorrente conservato; gitleaks senza rilievi.

## Articolo rettifica presenze fiera — 25 ottobre 2026

- Pubblicato «Nella graduatoria della fiera mancano le mie presenze: come chiedo la correzione?», slug `graduatoria-fiera-presenze-mancanti-correzione`, ID `4c61042a-ff92-4adb-9b83-2d4be729ff7c`. 576 parole editoriali, sei sezioni e modello da copiare; Cavriago art.18 dieci giorni solo locali, prove/registri/accesso documentale e riesame distinti. Due banner fiere/acquisto, copertina originale IA WebP1600×900.
- Commit `45b110c`, Vercel `3hh1Hn2WztP1Pwv11uHseC7Rt8oA` success: immagine identicaSHA256, SEO/indice/sitemap e Chromium1440/768/320,WebKit390,senzaJS passati; due pulsanti reali verificati senza scritture di prova. Precedenti106articoli identici,107totali. Sorgenti/fonti `data/blog/`; prompt, originali e prove `Documents/articoli-subingresso/graduatoria-fiera-presenze-mancanti-correzione`.
- Search Console NON inviata: verifica corrente al loginGoogle, nessuna sessione debug o credenziale pertinente; integrazione trovata solo in lettura. Resta Controllo URL → Richiedi indicizzazione, distinto dalla sitemap. Backup remoto verificato, cleanup helper con errore noto; collegamentoPDF iniziale incompleto404 corretto, originale200 e pagina10 letta localmente dopo errore del lettoreweb. Checkout isolato, lavoro estraneo conservato; gitleaks senza rilievi.

## Articolo moglie al mercato — 25 ottobre 2026

- Pubblicato «Può andare mia moglie al mercato al posto mio? Delega, requisiti e documenti», slug `moglie-mercato-delega-requisiti-documenti`, ID `308e7762-2c00-4612-acef-5447b552dfb8`. 556 parole editoriali, sei sezioni brevi; coadiutrice abituale e aiuto occasionale distinti, INPS/INL e regole commerciali separati. Cavallermaggiore art.12bis/Torino citati come esempi locali, requisiti alimentari senza SAB imposto a ogni addetto. Due banner fiere/acquisto, copertina originale IA WebP1600×900.
- Commit `4416750`, Vercel `5bNGGK6cg9D3ZQsZnKPYYoUGDnnF` success: copertina identicaSHA256, SEO/indice/sitemap e Chromium1440/768/320,WebKit390,senzaJS passati; due pulsanti verificati senza scritture di prova. Precedenti105articoli identici,106totali al controllo. Sorgenti/fonti `data/blog/`; prompt, originali e prove `Documents/articoli-subingresso/moglie-mercato-delega-requisiti-documenti`.
- Search Console NON inviata: loginGoogle richiesto, nessuna sessione debug/credenziale pertinente; integrazione trovata in sola lettura. Resta Controllo URL → Richiedi indicizzazione, distinto dalla sitemap. Backup remoto preventivo verificato, cleanup helper con errore noto; PDF Cavallermaggiore scaricato200 e pagina32 letta localmente dopo errore del lettoreweb. Aggiornamenti remoti acquisiti senza sovrascrivere il lavoro altrui; gitleaks senza rilievi.

## Articolo rifiuto alla spunta e presenza — 25 ottobre 2026

- Pubblicato «Alla spunta rifiuto il posto assegnato: mi contano comunque la presenza?», slug `spunta-rifiuto-posteggio-presenza`, ID `83436de3-12dd-4da2-a343-de67efe47c50`. 530 parole editoriali, sei sezioni; fonti Cavezzo art.14/Bisceglie art.13, mancata assegnazione distinta dal rifiuto, adeguatezza e forza maggiore senza presenza garantita o generalizzazioni nazionali. Due banner fiere/acquisto, copertina originale IA WebP1600×900.
- Commit `9527f68`, Vercel `Ef7u6z1zS22kkNeWzUjirk1ikTBS` success: copertina identicaSHA256, SEO/indice/sitemap e Chromium1440/768/320,WebKit390,senzaJS passati; entrambi i pulsanti verificati senza scritture di prova. Precedenti102articoli identici,103totali. Sorgenti `data/blog/`; prompt, originali e prove `Documents/articoli-subingresso/spunta-rifiuto-posteggio-presenza`.
- Search Console NON inviata: accesso corrente richiede loginGoogle, nessuna sessione debug/credenziale pertinente; integrazione trovata solo in lettura. Resta Controllo URL → Richiedi indicizzazione; sitemap distinta dall’invio. Backup remoto preventivo verificato, cleanup helper con errore noto. ScreenshotPDF web indisponibili: originali scaricati200, testi e pagine renderizzate controllati localmente; prima stampaPDF con errore codifica corretta. Lavoro estraneo preservato; gitleaks reale senza rilievi.

## Articolo furgone guasto e assenza al mercato — 25 ottobre 2026

- Pubblicato «Furgone guasto e mercato saltato: come giustifico l’assenza?», slug `furgone-guasto-mercato-giustificare-assenza`, ID `169472ea-432b-4324-bbb0-86ef6352df49`. 612 parole editoriali, sei sezioni, traccia pratica da adattare al Comune, due banner fiere e copertina originale IA WebP1600×900. Verbania art.31: fattura/max4giornate annue e assenza distinta da presenza di spunta; Trento art.15: trenta giorni limitati ai mercati saltuari e canone distinto. Nessuna esenzione nazionale o accoglimento automatico promessi.
- Commit `0bd174b`, Vercel `CxckL96jTpux7H3pdHVKg62Qgsf6` success: immagine identicaSHA256, SEO/indice/sitemap e Chromium1440/768/320,WebKit390,senzaJS passati. Due pulsanti reali verso `/fiere` verificati senza scritture di prova; precedenti104articoli identici,105totali. Fonti `data/blog/`; prompt, originaliPDF/PNG e prove `Documents/articoli-subingresso/furgone-guasto-mercato-giustificare-assenza`.
- Search Console NON inviata: verifica corrente richiede loginGoogle, nessuna sessione debug o credenziale pertinente; resta Controllo URL → Richiedi indicizzazione, distinto dalla sitemap. Originali ufficiali Verbania/Trento scaricati200 e verificati visivamente; pagine istituzionali attuali controllate. Backup remoto preventivo verificato, cleanup helper con errore noto; gitleaks senza rilievi. Checkout isolato e lavoro estraneo preservati. Il tema rifiuto alla spunta era già pubblicato e non è stato duplicato.

## Articolo spunta e conservazione delle presenze — 25 ottobre 2026

- Pubblicato «Per quanto tempo posso saltare la spunta senza perdere le presenze accumulate?», slug `saltare-spunta-presenze-accumulate`, ID `e196bcc5-b6c7-40e7-98c9-9f91baa0629b`. 566 parole editoriali, sei sezioni brevi, due banner acquisto `/annunci`; copertina originale IA WebP1600×900. Luino art.35: undicesima consecutiva non giustificata/oltre20 annue, rientro in coda e presenze per eventuale assegnazione definitiva distinti. Formigine art.18: tre anni consecutivi, azzeramento ed eccezioni/30giorni circoscritti al Comune; nessuna durata nazionale promessa.
- Commit `9fc988f`, Vercel `5eJAcbxdNbT1gtgF873bZqnY4A2v` success: immagine identicaSHA256, SEO/indice/sitemap e browser online Chromium1440/768/320,WebKit390,senzaJS passati. Due pulsanti reali verificati senza scritture di prova; precedenti103articoli identici,104totali. Sorgenti/fonti `data/blog/`; dossier e prompt `Documents/articoli-subingresso/saltare-spunta-presenze-accumulate`.
- Search Console NON inviata: loginGoogle richiesto, nessuna sessione debug o credenziale pertinente disponibile; resta Controllo URL → Richiedi indicizzazione, distinto dalla sitemap. LuinoPDF scaricato200 e verificato visivamente; FormiginePDF letto tramite fonte ufficiale web, download/screenshot403 documentati. Backup remoto preventivo verificato; cleanup helper con errore noto. Corrette nel dossier cwd dei test, percorso privato Google e confrontiUnicode; normalizzati i fine-riga dopo rebase prima dell'inserimento. Checkout isolato, fiere e lavoro estraneo preservati; gitleaks senza rilievi.

## Articolo fine affitto e reintestazione — 25 ottobre 2026

- Pubblicato «È finito l’affitto del posteggio: entro quando devo reintestarmi la licenza?», slug `fine-affitto-posteggio-reintestazione-licenza`, ID `943f86a5-75c7-43ae-b95e-f9c30228e470`. 638 parole editoriali, sei sezioni; fonti Segrate art.24/Rimini, nessun termine nazionale inventato, sei mesi con avvio e riaffitto contestuale circoscritti a Segrate. Due banner vendita, copertina originale IA WebP1600×900.
- Commit `5b3260e`, Vercel `EqbaDR2HDqiGq8FpFKpyicv929DS` success: copertina identicaSHA256, SEO/indice/sitemap e browser online Chromium1440/768/320,WebKit390,senzaJS passati; entrambi i pulsanti verificati senza scritture di prova. Precedenti101articoli identici,102totali. Sorgenti `data/blog/`; prompt, originali e prove `Documents/articoli-subingresso/fine-affitto-posteggio-reintestazione-licenza`.
- Search Console NON inviata: accesso attuale richiede loginGoogle, nessuna sessione debug o credenziale pertinente; plugin trovato solo in lettura. Resta Controllo URL → Richiedi indicizzazione; sitemap distinta dall’invio. Backup remoto preventivo verificato, cleanup helper con errore noto; primo comando commit fermato dal parser e corretto con fileUTF8. Gitleaks reale positivo; lavoro estraneo preservato. ScreenshotPDF web indisponibile, originale scaricato200 e testo ufficiale verificato.

## Articolo assenze del vecchio titolare — 25 ottobre 2026

- Pubblicato «Compro una licenza ambulante: le assenze del vecchio titolare passano a me?», slug `compro-licenza-ambulante-assenze-vecchio-titolare`, ID `7bb8736c-89be-4cae-ae45-dec41e2f2d02`. 527 parole editoriali, sei sezioni; fonti Siena2026/Zocca, passaggio assenze distinto dal mancato cumulo con limite proporzionale ed eccezione contributiva. Esempio15+3=18 limitato a Siena; nessun azzeramento nazionale promesso. Due banner acquisto, copertina originale IA WebP1600×900.
- Commit `dcdd944`, Vercel `EvV1DMzNd1SWAYzYwffHxg7ZPmNm` success: copertina identicaSHA256, SEO/indice/sitemap e browser online Chromium1440/768/320,WebKit390,senzaJS passati; entrambi i pulsanti verificati senza scritture di prova. Precedenti100articoli identici,101totali. Sorgenti `data/blog/`; prompt, originali e prove `Documents/articoli-subingresso/compro-licenza-ambulante-assenze-vecchio-titolare`.
- Search Console NON inviata: loginGoogle richiesto, nessuna sessione debug/credenziale pertinente; integrazione trovata solo in lettura. Resta Controllo URL → Richiedi indicizzazione; sitemap distinta dall’invio. Checkout isolato, lavoro estraneo preservato; backup remoto preventivo verificato, cleanup helper con errore noto. Hook iniziale senza binario nel checkout: collegato quello esistente e scansione reale commit senza rilievi; hook ripristinato. ScreenshotPDF web indisponibili, entrambi gli originali scaricati200 e testi ufficiali verificati.

## Articolo affittuario moroso e posteggio — 25 ottobre 2026

- Pubblicato «Ho affittato il banco e l’affittuario non paga il Comune: chi rischia il posteggio?», slug `affittuario-non-paga-comune-rischio-posteggio`, ID `e8a45208-da76-4459-a4f9-bc26dd12993a`. Sei sezioni semplici, debito e rischio concessione distinti; esempio Milano DD1902/2023 non generalizzato, fonte CCM Firenze. Due banner vendita, copertina originale IA WebP1600×900.
- Commit `d64e934`, Vercel `2b7ZQxq912rqpeRA8wqezaUcc2xe` success: immagine identicaSHA256, SEO/indice/sitemap e Chromium1440/768/320,WebKit390,senzaJS passati; entrambe CTA `/vendi` verificate senza scritture di prova. Precedenti99articoli identici,100totali. Sorgenti `data/blog/`; prove/prompt `Documents/articoli-subingresso/affittuario-non-paga-comune-rischio-posteggio`.
- Search Console NON inviata: loginGoogle richiesto, nessuna sessione debug o credenziale pertinente; plugin trovato GSC sola lettura. Resta Controllo URL → Richiedi indicizzazione; sitemap distinta dall’invio. Backup remoto preventivo verificato, cleanup helper con errore noto. DD1902 download403 e alias404: contenuto verificato nell’indice della fonte ufficiale, richiamo comunale attuale e integrazioneDD1829/2025 controllati. Prima anteprima corretta per la trasformazione esistente dei link vendita da parte del tracker; nessuna modifica al sito necessaria. Lavoro estraneo preservato.

## Articolo Milano, debiti e subingresso — 25 ottobre 2026

- Pubblicato «Compro un posteggio a Milano: possono bloccare il subingresso per debiti del venditore su altri mercati?», slug `milano-subingresso-debiti-venditore-altri-mercati`, ID `815ef417-ad36-4386-9d60-ac9e421d404a`. Circa590parole, cinque sezioni; fonti ComuneMilano/DD11337, canoni milanesi complessivi e limiti rateazioni2013-2019 espliciti. Blocco amministrativo distinto dalla responsabilità debitoria. Due banner acquisto, copertina originale IA WebP1600×900.
- Commit `c938044`, Vercel `7t2n2LcsMZBsLAPYZu4ct1HiR3CM` success: copertina identicaSHA256, SEO/indice/sitemap e browser online Chromium1440/768/320,WebKit390,senzaJS passati; due CTA reali verificate senza scritture di prova. Precedenti98articoli identici,99totali. Sorgenti `data/blog/`; prompt/prove `Documents/articoli-subingresso/milano-subingresso-debiti-venditore-altri-mercati`.
- Search Console NON inviata: verifica corrente richiede loginGoogle, nessuna sessione debug/credenziale pertinente; plugin trovato solo in lettura. Resta Controllo URL → Richiedi indicizzazione, distinto dalla sitemap. Backup remoto preventivo verificato; cleanup helper con errore noto. Prima prova WebKit interrompeva richiesta catalogo durante navigazione: attesa completamento corretta, ripetuta senza errori. Limite screenshot catalogo e quoting helper privato risolti; note nel dossier. Checkout isolato per preservare fiere concorrenti; gitleaks finale senza rilievi.

## Articolo cinque domande al Comune — 24 ottobre 2026

- Pubblicato «Bolkestein: cinque domande da fare al Comune prima di comprare un posteggio», slug `bolkestein-cinque-domande-comune-comprare-posteggio`, ID `d582d6dd-e742-456a-af39-8d66b54f4298`. Cinque domande e chiusura; fonti GU2026/Mantova, nessuna promessa di rinnovo. Due banner acquisto, copertina IA WebP1600×900.
- Commit `eb9f186`/`5daeb3b`, Vercel `8jahHwfLvLvUVdH4JRkV4Vt4JYRd` Ready e dominio verificato. Copertina identica SHA256; SEO e browser online Chromium1440/768/320,WebKit390,senzaJS passati, entrambi i pulsanti verificati senza scritture di prova. Prove/prompt nel dossier omonimo `Documents/articoli-subingresso/`.
- Search Console NON inviata: verifica corrente richiede loginGoogle, nessuna credenziale pertinente. Resta Controllo URL → Richiedi indicizzazione; sitemap distinta dall'invio. Backup remoto preventivo verificato; cleanup helper con errore noto. Anteprima rilanciata dalla root corretta; codifica iniziale corretta prima dell'inserimento, linkGU corretto e riverificato.

## Articolo giovani al mercato — 24 ottobre 2026

- Pubblicato «Aprire un banco da giovani: che possibilità hai contro chi lavora
  già al mercato?», slug `aprire-banco-giovani-mercato`, ID
  `7d1b5462-e768-4287-81cf-791a955dc3d7`. Sei sezioni, fonte GU2026,
  vantaggi degli esperti e accesso giovani distinti; due banner fiere/acquisto,
  copertina originale IA WebP1600×900. Commit `86e3c7b`, Vercel
  `9ZTF1vRarHS5LnHbAFyQZhjwyQEW` success. Immagine identicaSHA256,
  SEO/indice/sitemap e Chrome1440/768/320,WebKit390,senzaJS passati;
  destinazioni CTA verificate senza scritture di prova. Precedenti96articoli
  identici,97totali. Prove/prompt in `Documents/articoli-subingresso/aprire-banco-giovani-mercato`.
- Search Console NON inviata: loginGoogle richiesto, nessuna sessione o
  credenziale pertinente; plugin disponibile per GSC soltanto in lettura.
  Resta Controllo URL → Richiedi indicizzazione; sitemap distinta dall'invio.
  Backup remoto preventivo verificato; cleanup helper con errore noto.
  Anteprima iniziale rilanciata dalla root corretta; primo inserimento bloccato
  dalla guardia copertina404 durante deploy, riuscito dopo disponibilità asset.

## Articolo Bolkestein e fiere — 24 ottobre 2026

- Pubblicato «Bolkestein e fiere: perché la concessione non dura sempre dieci
  anni», slug `bolkestein-fiere-durata-concessione`, ID
  `1c15be85-3bb7-44ca-b13d-48d845652bcc`:507 parole,sei sezioni,
  fonti GU2023/2026,MIMIT e Stato-città; limite massimo distinto dalla durata
  garantita, investimenti e titoli esistenti chiariti. Due banner fiere/acquisto,
  copertina originale IA WebP1600×900. Commit `8d0e2bc`, Vercel
  `8snxf7VEBy8PbxnpYgxAfMjqygBd` success; copertina identicaSHA256,
  indice/sitemap/SEO e prove online Chrome1440/768/320,WebKit390 e senzaJS
  passati, due CTA reali verificate senza eventi di prova. Precedenti95articoli
  identici,96totali. Prove/prompt nel dossier omonimo in
  `Documents/articoli-subingresso/`, sorgenti `data/blog/`.
- Search Console non inviata: loginGoogle richiesto e nessuna sessione debug
  disponibile; integrazione trovata in sola lettura. Resta Controllo URL →
  Richiedi indicizzazione. Backup remoto preventivo verificato; errore cleanup
  helper noto. Prime asserzioni di testo corrette per le maiuscole.

## Articolo concessioni decennali e acquisto — 24 ottobre 2026

- Pubblicato «Concessioni di dieci anni: cosa cambia per chi vuole comprare
  un banco?», slug `concessioni-dieci-anni-comprare-banco`, ID
  `35d207d2-613c-4926-820e-2a937f9addf5`. 607 parole, sei sezioni;
  durata residua distinta dalla nuova assegnazione, esempio30.000/6,
  fonti GU2023/2026 e Mantova. Copertina IA WebP1600×900; due banner acquisto.
- Commit `670c4c4`, Vercel `6DoQ5hvetdSDU2LoD53yGEAxvyuu` success:
  immagine identicaSHA256, indice/sitemap/SEO e Chrome1440/768/320,
  WebKit390 e senzaJS passati; entrambi i pulsanti verificati. Precedenti94
  articoli identici,95totali. Fonti `data/blog/concessioni-dieci-anni-comprare-banco.*`;
  prove/prompt `Documents/articoli-subingresso/concessioni-dieci-anni-comprare-banco`.
- Search Console NON inviata: loginGoogle richiesto, nessuna sessione debug
  collegabile/credenzialeGoogle; integrazione trovata solo in lettura. Resta
  Controllo URL → Richiedi indicizzazione. Sitemap distinta dall'invio.
  Backup remoto verificato; helper con errori nel cleanup. Primo smokeWebKit
  abortiva caricamenti al cambio pagina; attesa del catalogo corretta, ripetuto
  senza errori. Nessun dato reale di prova persistito.

## Grosseto — ricerca fiere, 24 ottobre 2026

- Ricerca documentale attuale conclusa con limiti:86schede in24comuni,
  ricognizione dei28comuni,85aggiunte e IDMadonnino conservato;6.844schede
  esterne identiche.49con date,37con periodi,4storiche2025,4sintesi costo.
- Originali, tentativi e limiti in `data/fiere-grosseto.json` e `data/FIERE.md`;
  dossier `Documents/ricerca-fiere-grosseto-20261024`. Nessun contatto a terzi.
- Pubblicazione verificata: commit dati `8ddcf97`, deploy Vercel riuscito,
  quattro asset identici, 86 schede HTTP200 e browser desktop/mobile positivi.
  TO DO spuntata; riepilogo62province concluse/48da fare. Backup SHA256
  `ricerche-fiere-20261024-191535`:101.321file,15.445.599.735byte,zero errori.
  Ricerca attuale conclusa; nuove edizioni e documenti futuri sono manutenzione.

## Articolo spunta e posteggio — 24 ottobre 2026

- Pubblicato «Fare la spunta oggi può aiutarti a ottenere un posteggio domani?»,
  slug `spunta-oggi-posteggio-domani`, ID `825222dc-20f1-460c-920f-e47308eb13ff`.
  659 parole, sei sezioni; presenze/giorni lavorati distinti, massimo5punti,
  vuoto normativo sui50giorni dichiarato e priorità residuale condizionata.
  Copertina originale IA WebP1600×900; due banner fiere/acquisto.
- Commit `62398ce`, Vercel `93SSadyW4DM54ohGQGLu4ZiBQHd7` success:
  copertina identicaSHA256, indice/sitemap/SEO e browser Chromium1440/768/320,
  WebKit390 e senzaJS passati; CTA reali verificate senza eventi di prova.
  Precedenti93articoli identici,94totali. Sorgenti/fonti `data/blog/spunta-oggi-posteggio-domani.*`;
  prove e prompt `Documents/articoli-subingresso/spunta-oggi-posteggio-domani`.
- Search Console NON inviata: accesso verificato fino al loginGoogle, nessuna
  sessione/credenziale pertinente; plugin trovato in sola lettura. Resta
  Controllo URL → Richiedi indicizzazione. Sitemap distinta dall'invio.
  Backup remoto preventivo valido; errore noto del cleanup helper.

## ADS personali — 24 ottobre 2026

- Accesso rapido richiesto: pulsante «Le mie ADS» nella barra delle informazioni
  principali della dashboard, accanto al badge Admin. Rivelato soltanto dopo
  verifica del ruolo; altezza44px, stesso collegamento `/le-mie-ads`.
  Controllati ruolo iniziale, clic/tastiera e layout Chrome1440/320 e WebKit390,
  chiaro/scuro; prove `Documents/ads-pulsante-dashboard-20261024`.
  Pubblicato `f813884`, Vercel `9brYXCDrPBTrYxUu7tki5TzAqAgN` success:
  dashboard online identica al blobGit, raccolta di destinazione200.

- Preferenza grafica aggiornata: galleria principale a mosaico, tutte20ADS
  in formati misti e dimensioni originali1:1; filtro per tutte160varianti.
  Codice/misure visibili, canvas panoramico sugli schermi stretti, statistiche
  chiuse sotto; strumenti al clic nel dialog. Asset, dati e accesso conservati.
  Chrome1440/768/320 e WebKit390 chiaro/scuro passati: misure reali,
  nessuna sovrapposizione fra160varianti, resize, copia/ZIP/CSV, errori e logout.
  Feedback sopra il dialog verificato; revisione ship. Prove
  `Documents/ads-mosaico-20261024`; backup remoto preventivo verificato.
  Pubblicato `cf4f903`, Vercel `DJGTFkKgaEGrNgoRCMSsKnq1nmjm` success:
  pagina/JS/CSS identici online ai blobGit, API anonima401, accesso/login
  reali Chrome1440/320 e WebKit390 passati, scritture di prova intercettate.

- Raccolta admin `/le-mie-ads`: 20 messaggi (7 vendita, 7 acquisto, 6 fiere),
  8 misure, 160 varianti PNG/SVG; quattro riprendono banner del blog.
  Copia codice/link, ZIP singolo/completo, filtri e risultati per posizione.
- Statistiche vere: impressione 50%/1s, clic deduplicati, ultima ADS/7 giorni;
  conversioni distinte da vendite, incassi Vetrina netti e CSV. Invii conservati
  dopo vendita; ricevute minime dei salvataggi fiere conservate alla rimozione.
  Nessun nuovo ID persistente, nessuno storico inventato o nuovo invio.
- Schema applicato: tabelle private/RPC admin e trigger ricevute verificati;
  eventi/ricevute 0, impronte utenti/annunci/articoli/pagamenti identiche.
  Test SQL ROLLBACK, API, Chrome1440/768/320 e WebKit390 chiaro/scuro,
  ZIP/CSV e regressione blog passati; revisione: tre correzioni risolte.
  Contratto `data/PERSONAL_ADS.md`, prove `Documents/ads-personali-20261024`.
  Backup remoto tag/ramo verificato; cleanup helper con errore noto.

- Primo deploy `9abdcee` respinto: limite12 funzioni del pianoHobby.
  Gestore ADS accorpato al runtime blog con rewrite del medesimoURL;
  controlli admin/no-store conservati, nessun cambio piano.
- Pubblicato `47713ef`, Vercel `Bp1QTWHxipzxDUjmS3wuwgR6Abm4` READY.
  Sul dominio: 331 file identici ai blobGit, API anonima401/ruolo pubblico403,
  20 destinazioni verificate in anteprima senza eventi; blog/testi conservati.
  Accesso negato e apertura login reali Chrome1440/320 e WebKit390 passati;
  scritture statistiche delle prove intercettate, nessun account/ordine creato.
  Ultima revisione routing/auth/cache: ship. Aspetto precedente conservato.

## Articolo punti prima del bando — 24 ottobre 2026

- Pubblicato «Bolkestein: quali punti puoi prepararti a ottenere prima del
  bando?», slug `bolkestein-punti-prima-bando`, ID
  `1fc2d477-a064-49f1-85d7-5ec271dac717`. 627 parole, sei sezioni semplici,
  tono pro ambulanti; fonti MIMIT/GU2026, criteri e impegni distinti dalle
  garanzie. Copertina originale IA WebP1600×900; due banner fiere/vendi.
- Commit `fae0c9f`, Vercel `2e2LhyfGsVNvVKxRGT9G9U7jTjSK` success:
  copertina identica SHA256, indice/sitemap e browser online Chromium
  1440/768/320, WebKit390 e senzaJS passati; CTA funzionanti. Precedenti92
  articoli identici,93totali. Sorgenti `data/blog/bolkestein-punti-prima-bando.*`;
  prove/prompt `Documents/articoli-subingresso/bolkestein-punti-prima-bando`.
- Search Console NON inviata: verificato accesso fino alla schermata Google,
  nessuna sessione autenticata/credenziale pertinente; plugin trovato in sola
  lettura. Resta Controllo URL → Richiedi indicizzazione. Sitemap verificata,
  senza confonderla con invio o indicizzazione. Backup remoto preventivo valido;
  helper con consueto errore cleanup.

## Articolo anzianità nei bandi — 24 ottobre 2026

- Seguito: richiami testuali poco visibili sostituiti con due banner blu/oro
  e pulsanti fiere/vendi, componente del blog esistente. Pubblicato `54ce40e`,
  Vercel `5m7nbbr9YgWCt6G7eMFSjRGPWk22` success; verifica online
  Chrome1440/768/320,WebKit390 e senzaJS passata, clic/focus/overflow corretti.
  Solo i due richiami modificati: testo informativo e91altri articoli identici.
  Prove nella sottocartella `pubblicita-visibili` del dossier; prima verifica
  intercettava vecchia cacheCDN180s, risolta e ripetuta dopo pubblicazione.
- Pubblicato «Lavoro qui da trent’anni»: quanto conta davvero l’anzianità
  nei nuovi bandi?, slug `anzianita-ambulanti-nuovi-bandi`, ID
  `ec5d37f1-cdf8-45d5-9269-6e3282ab913b`. 587 parole, sei sezioni brevi,
  fonti MIMIT/GU2026, esempio30/40×35 e15punti fissi; tono pro ambulanti.
  Copertina originale IA WebP1600×900; due soli richiami fiere/vendi.
- Commit `fc08dcc`, Vercel `51C72LTGaxda1s2WhYXpmFBTPkXw` success:
  asset identici ai blobGit, indice/sitemap e browser Chrome1440/320,
  WebKit390 più senzaJS passati. 91articoli precedenti identici,92totali.
  I marcatori editoriali sopprimono riquadri automatici e banner calcolatore
  soltanto nelle pagine con richiami già posizionati; precedenti senza marker.
  Prove/prompt `Documents/articoli-subingresso/anzianita-ambulanti-nuovi-bandi`;
  sorgenti/fonti `data/blog/anzianita-ambulanti-nuovi-bandi.*`.
- Search Console NON inviata: apertura browser respinta dal controllo
  automatico «blocked by policy», nessun accesso alternativo per scrivere.
  Resta Controllo URL → Richiedi indicizzazione; sitemap non equivale a invio.
  Backup remoto preventivo verificato; consueto errore cleanup helper.

## Articolo Bolkestein ottimista — 24 ottobre 2026

- Richiesto articolo nuovo, umano/incisivo, ottimista e semplice, con immagine
  e richiami all'acquisto. Pronto «Bolkestein: e se fosse la scossa che serve
  ai mercati?», slug `bolkestein-scossa-mercati`: 531 parole, sei sezioni,
  due CTA al catalogo; fonti UE/Gazzetta e opinioni distinte dai fatti,
  nessuna promessa di incassi/rinnovi. Copertina originale IA, WebP1600×900.
- Sorgenti e prompt `data/blog/bolkestein-scossa-mercati.*`; prove/originale
  `Documents/articoli-subingresso/bolkestein-scossa-mercati`. Anteprima
  Chromium1440/320 e WebKit390, più lettura senza JS, passata: link, immagine,
  meta/canonical e nessun overflow/errore. Backup remoto preventivo
  verificato; errore cleanup helper già noto.
- Pubblicato `039882e`, Vercel `ENaxHQmNgWjuubYhYtW7ZPy2M7RQ` riuscito:
  copertina online identica SHA256. Inserito solo articolo
  `171930a0-9ab6-4b15-bceb-a8b132dd501b`; 91 totali, precedenti90 identici.
  HTML/meta/canonical, indice/sitemap e prove browser online nei medesimi
  formati passati, inclusa apertura catalogo da CTA. RPC Vetrine live0:
  nessun annuncio gratuito forzato negli spazi pagati. Zero invii/account,
  scritture di tracking intercettate nelle prove. Ricevute nel dossier.

## Contatti telefonici riprovabili — 24 ottobre 2026

- Bug confermato sul codice precedente: errore RPC memorizzato come definitivo,
  Chiama/WhatsApp non riprovavano. Correzione circoscritta al dettaglio:
  cache solo su risposta valida, Promise condivisa, timeout12s e riprova al clic;
  attesa/errore/assenza visibili anche mobile. Identità verificata a ogni azione,
  svuotamento al logout/cambio account e risposte tardive ignorate; RPC e quote
  conservate. Riferimenti JS aggiornati anche nel template SSR.
- Backup remoto `backup/session-20261024-103131-retry-contatti-telefonici`
  verificato; helper: errore cleanup dei vecchi tag dopo push riuscito.
  Prove `Documents/contatti-telefonici-20261024`; API/sessioni simulate,
  navigazioni telefoniche intercettate, nessuna chiamata/messaggio reale.
  Locale88scenari Chrome1440/320 e WebKit1440/390 passati (mobile emulato,
  nessun dispositivo Safari fisico); regressione foto passata. Clic/tocchi reali,
  quota/assenza, timeout e risposte tardive anche senza abort verificati.
  Detector: soli rilievi preesistenti su tipografia/palette, fuori ambito.
  Pubblicato `e811d76`, Vercel `D66oDTmLBo5b33QXLis8T4MkwLnY` riuscito:
  dominio con JSv27 corrispondente al commit; ripetuti88scenari su HTML/asset/SDK
  scaricati dalla produzione, tutti passati. Sul dominio reale: anonimo senza
  recapiti e accesso richiesto verificati Chrome1440/320 e WebKit390, scritture
  bloccate. Primo smoke mobile interferito da popup visitatori e titolo storico
  senza spazi che allarga il viewport; ripetuto con popup già chiuso e titolo
  breve. Anomalia di impaginazione preesistente annotata, fuori dal recupero.

## Chat affidabili — 24 ottobre 2026

- Richiesta: sistemare bene le chat; altri difetti dell'audit rimandati.
  Stato separato per account/conversazione, invii immediati con conferma vera,
  coda/retry stessoUUID, bozze separate, recupero completo e storico paginato.
  Login/logout, chat non aperte, supporto, letture, scorrimento e telefono corretti.
  Locale100scenari Chrome1440/768/320-Safari390 chiaro/scuro passati;
  SQL1.207messaggi temporanei in ROLLBACK e letture reali passati.
  Schema applicato: solaRPCinbox/indice;19messaggi/8chat e impronte di dati,
  trigger/policy invariati. Nessun messaggio/email reale di prova.
  Contratto `data/CHAT_RELIABILITY.md`; prove `Documents/chat-affidabili-20261024`.
  Backup remoto tag/ramo verificato; helper con errore cleanup già noto.
  Pubblicato9f8cb2e: pagina/JS/CSS online identici ai blobGit; ripetuti100scenari
  sugli asset pubblicati, tutti passati. Accesso reale Chrome320/API anonime
  verificati senza scritture;19messaggi/8chat invariati. Inspector0FAIL sullo
  snapshot, con limite esplicito del titolo mobile statico; tema/stile conservati.

## Esito venduto/affittato — 24 ottobre 2026

- Richiesto mini modulo obbligatorio, massimo3passaggi: esito, prezzo
  facoltativo, canale. Nessuna delle due termina subito e lascia disponibile.
  Subingresso/Facebook/altro sito/passaparola/altro; canoni annui.
  Client/server: vendita100–500.000€, affitto120–120.000€/anno; fuori limiti
  rifiutati, rapporti<20%/>300% e riferimenti mancanti/incompatibili separati
  dalle analisi. Dati dichiarati, mai certificati; timestamp della risposta,
  nessuna data d'atto inventata. Contratto `data/LISTING_OUTCOMES.md`.
- Locale:120controlli Chrome1440/768/320 e Safari390 chiaro/scuro passati;
  regressione Vetrina/statistiche e SQL ROLLBACK passati, inventari/trigger
  precedenti invariati. Prezzi privati, proprietà/RLS, blocco bypass e retry.
  Revisione indipendente senza problemi bloccanti. Schema applicato e verificato:
  zero esiti/prezzi di prova persistenti, guardia attiva, accessi diretti negati.
  Pubblicatoc626514, Vercel9mKykoXgAtAoNksc2U6x7QpUBoC5 READY, dominio
  corretto verificato: dashboard/JS/CSS/privacy identici ai blobGit. Ripetuti
  online120controlli e regressione Vetrina/statistiche nei trebrowser/formati,
  tutti passati; zero esiti/prezzi persistenti, inventari/guardie invariati.
  Prove `Documents/esiti-annunci-20261024`.
- Errore di sessione: chiave interna Supabase esposta nell'output tecnico;
  copia locale sanitizzata, nessun segreto nei file versionati. Rotazione
  necessaria e segnalata, non eseguita. Backup remoto preventivo verificato;
  errore cleanup helper noto, separato dal push riuscito.

## Statistiche admin, ritorno allo stile precedente — 23 ottobre 2026

- Preferenza: stile di «Funnel utenti»/«Comuni più visitati» su tutti i pannelli
  statistici. Uniformati Crescita, Provenienza, Avvisi Bandi ed Email Vetrina:
  fondi, angoli24px, titoli con icona, pulsanti blu e riquadri interni; scuro
  con palette personale. Dati, grafici, filtri e dettagli apribili conservati.
  Locale256controlli dashboard e suite email Chrome1440/768/320-Safari390
  passati, chiaro/scuro; nessun invio o dato reale modificato.
  Pubblicatoe1ab05b, Vercel5t7jKesxSDjjksRsNk9QE8gaGSaZ READY:
  dashboard, dueCSS eJS email identici online; ripetute entrambe le suite
  sugli asset pubblicati, tutte passate. Inspector0FAIL sui pannelli modificati.
  Prove `Documents/verifica-stile-statistiche-admin-20261023`.

## Riferimenti nei documenti — 23 ottobre 2026

- Rimossi richiami a strumenti esterni da regole, storico e commenti;
  guida grafica rinominata, contenuti e comportamento del sito conservati.
  Originali nel backup locale `Documents/backup-subingresso/riferimenti-documenti-20261023-190446`.

## Regole comuni e pulizia documentale — 23 ottobre 2026

- Fonte unica `AGENTS.md`, `CLAUDE.md` ridotto all'import e letture mirate.
- Tolti riepiloghi duplicati e descrizioni superate (prezzi/sconti, Scout v1,
  cache congelate, snapshot di maggio); mantenuti formule dei report storici,
  checklist, criteri provinciali, contratti e prove. Verifica finale sui rimandi,
  contenuti protetti e diff dei soli quattro Markdown.
- Originali: commit `da20655`, tag remoto
  `backup/session-20261023-184642-unifica-istruzioni-claude-codex` e copia locale
  `Documents/backup-subingresso/documentazione-20261023-184705` con SHA256.
  Backup remoto verificato; errore noto del solo cleanup dell'helper.

## Statistiche email semplificate — 23 ottobre 2026

- Preferenza esplicita: pochi numeri principali e grafici leggibili subito;
  statistiche complete solo al clic, mai aperte automaticamente. Riepilogo
  email con4numeri e2grafici; percorso sito/pagamenti/varianti/attività/copia
  sotto «Statistiche complete». Mancanti distinti dagli zeri, acquisti email
  separati da tutti quelli sul sito. Backend e invii conservati.
  Pubblicato6c60d6a, VercelEtdmjGpNdLKwJc7NFux9rPNAcaGN READY:
  dashboard/JS/CSS identici online, suite API/browser ripetuta con asset
  pubblicati e snapshot reale, Chrome1440/768/320 e Safari390 chiaro/scuro.
  Tema267controlli passati; inspector0FAIL,vuoto sotto fixture intenzionale.
  Registro invariato12invii+1copia, nessun nuovo invio o cambio backend.
  Prove `Documents/statistiche-email-semplici-20261023`.

## Email Vetrina, testi e grafica — 23 ottobre 2026

- Nuova preferenza e sostituzione richiesta:10testi approvati con correzioni
  letterali+2versioni brevi della6;beneficio/spiegazione prima del prezzo.
  Nessun totale/sconto;solo «A partire da solo49euro!» nei2/10. Grafica pulita,
  una CTAblu evidente,Sblu testuale;Giacomo senza tempi/cifre/Vetrina attribuita.
  «90%» e oggetto plateatico forniti esplicitamente dall'utente,non dati misurati.
  Verifiche locali12testi×3browser/formati e regressione analytics passate.
  Edgecampagna5/adminanalytics4 ACTIVE,quattrosorgenti riscaricati identici,
  anonimo401;registro12offerte+1test invariato,nessun nuovo invio.
  Dossier Documents/email-vetrine-testi-approvati-20261023.
  Avatar mittente ancora da attivare:DNSBIMI assente,DMARCp=none;Gmail richiede
  certificatoCMC/VMC. AssetSbluSVG/PNG pronti,nessun acquisto/cambioDNS.
  Pubblicato8bb7450,VercelCzvboiUxzgatopwwr86RmMb1A8DQ READY:SVG/PNG
  pubblici identici ai blobGit,tipi corretti,PNG512×512,home200.
  Backup remoto session-20261023-221356 verificato;cleanup helper con errore noto.

- Seguito esplicito: inviate9anteprime al solo indirizzo personale indicato,
  **9/9delivered verificati**, numerate1–9; dati esempio, niente pixel/acquisti
  o campagne clienti. Invio una tantum separato dalle statistiche reali;
  helper temporaneo rimosso e assenza verificata, Edge stabili4/3 ACTIVE.
  Ricevute/ID privati nel dossier sotto. Posta dominio verificata DNS Aruba;
  accesso supporto info@subingresso.it da Webmail, app con IMAP se attivo.
  Esistenza/password della singola casella non verificate, nessun cambio Aruba.

- Richiesta: email semplici, umane e accattivanti; oggetti che invogliano,
  non report visite. Rifatte9varianti, singole/pacchetti, con grafica blu/oro,
  prezzo/durata chiari e pulsante; eliminato il lungo titolo annuncio.
  Listino, metriche vere, consensi, uscite e limiti conservati.
  Test campagna/analytics e27casi browser Chrome860/320-Safari390 passati;
  fallback solo inline leggibile, nessuna immagine necessaria/nuovo invio.
  Pubblicatoed33799; Edge campagna4/copiaadmin3 ACTIVE, quattrosorgenti
  riscaricati identici, accesso anonimo401. Registro ancora12invii reali+1test,
  nessun reinvio. Review indipendente ship; brand esistente conservato.
  Dossier Documents/email-vetrine-design-20261023; backup remoto valido,
  helper con errore cleanup noto dopo push riuscito.

## Registrazione — stato finale verificato, 23 ottobre 2026

- Telefono obbligatorio; esempi sotto il campo nascosti quando è vuoto,
  validazione conservata. Termini obbligatori con link `/termini` in nuova
  scheda e offerte facoltative: «Acconsento a ricevere offerte personalizzate».
- Due caselle 18 px preselezionate, testo 13 px e righe 32 px; modulo compatto
  e adattato in altezza, CTA visibile anche a 320×568 e 490×580, controlli 44 px.
  Versione del testo solo offerte `vetrina-email-20261023`: nessun consenso alla
  misura individuale delle email. Le vecchie caselle 28 px e diciture sono superate.
- Stato finale Auth28 su 19 sorgenti, commit `cda881e`, Vercel riuscito e
  verifiche Chrome/Safari nei cinque formati passate, nessun account/email
  reale creato nelle prove. Dossier `Documents/verifica-registrazione-esempi-20261023`
  e `Documents/verifica-registrazione-compatta-20261023/risultati.md`.
  Passaggi precedenti in Git, senza ripeterne qui l'intero resoconto.

## Statistiche email e conversioni — 23 ottobre 2026, completate

- Richiesti pannello admin aperture/clic/acquisti e percorso Vetrina/annulli,
  una copia email all'admin e consigli finali. API:12delivered,tracking Resend
  aperto/clic disattivato,nessun webhook;storico aperture/clic non recuperabile.
  Un solo admin con email disponibile,nessun suo annuncio attivo:la copia usa
  un annuncio pubblico d'esempio,mai riattivare quello cancellato. Prove private
  Documents/statistiche-mail-vetrine-20261023. Misura individuale nuova solo
  con consenso informato/versione aggiornata e revoca separata;vecchi50consensi
  alle offerte non estesi ai pixel. Funnel autenticato essenziale,nessun replay
  o nuovo identificativo persistente. Test/copia separati dai risultati reali.
  Backup tag/ramo remoti preventivi validi. SQL con fixture ROLLBACK e test
  API/Edge/Chrome1440-768-320/Safari390,chiaro-scuro,checkout/consensi/uscite
  passati;inspector componente0FAIL/0WARN. Schema e cinque Edge applicate.
  Frontend dfea605 online:13asset/pagine identici ai blob Git;HEAD pixel200 e
  clic303 senza registrare aperture/clic. Copia admin inviata UNA volta,
  Resenddelivered verificato;sync13/13,12offerte reali ancora12delivered,
  misurabili0 e vecchi consensi ampliati0. Ricevuta/ID solo nel dossier privato.
  Storico30g normalizzato:2checkout clienti,0pagati,1non completato,1in attesa;
  nessun annullo dedotto. Produzione Chrome320/Safari390:link email anonimo
  apre login,token rimosso,ritorno proposta conservato,consenso vuoto e nuovo
  testo presenti,nessun account/ordine/email cliente creato nei test. Contratto
  data/EMAIL_CONVERSION_ANALYTICS.md;cacheAuth24,premiumJS3,unsubscribe4.

## Email per vendere Vetrine — 23 ottobre 2026

- Chiarimento successivo:consenso promozionale confermato per gli ultimi50
  iscritti reali;coorte congelata23/10 11:31UTC,01/09–23/10,50permessi WhatsApp
  registrati senza inventare date originarie;più anziani esclusi.13venditori
  idonei,5pacchetti;un contatto escluso dal provider. Primo giro concluso:
  **12invii,12delivered verificati su Resend**,ricevute/ID nella cartella privata;
  nessuno fuori coorte,tetto20 e limiti precedenti. Richiesto consenso preselezionato sui nuovi:
  casella separata facoltativa vuota,poiché preselezionata non vale consenso
  (Garante8981258). Scelta vera/versione via bypass e fallback Auth;trigger solo
  INSERT profiles registra data/evidenza,mai UPDATE o retroconsenso. Auth23
  su20HTML/API,modulo scorrevole su telefoni bassi,privacy aggiornata. Test
  registro/mancato consenso/versione/revoca in ROLLBACK e trebrowser/formati
  passati;avvisi bandi ancora compatibili,fixture test aggiornata a BlogMarkup.
  Backend applicato e frontend pubblicatoe463617:16asset/pagine identici aGit,
  quattroSSR conAuth23;modulo reale Chrome320/Safari390 passato,nessuna nuova
  registrazione o scrittura reale di prova. Inspector componente0FAIL/0WARN,
  esclusi titolo/vuoto perché singolo campo. Prove e coorte private nella
  stessa cartella. Nessun altro consenso retroattivo o cron autorizzato.

- Seguito autorizzato:utente riferisce consensi chiesti su WhatsApp a molti
  iscritti e chiede primo giro/limite umano. Per abbinarli chiesti nomi/email,
  senza estendere l'attestazione a tutti. Registro consensi inizialmente vuoto;
  fonte/nota/data registrazione separata dalla data originaria,mai inventata.
  Preparati limiti effettivi:20/campagna e24ore,30giorni/persona,72ore dopo
  altre periodiche;Vetrina sostituisce digest/statistiche nei7giorni seguenti.
  Invio manuale distanziato15secondi,nessun nuovo cron. Uscita solo offerte
  `unsubscribe?type=promo`,altre preferenze conservate. Duplicati/esiti ambigui
  bloccati,ID provider registrati. Migrazione e quattro Edge pubblicate;
  zero permessi concessi e zero invii. Audit Resend20account:12email oggi,
  un contatto escluso per problemi provider;nessuno dei20contattato nelle72ore.
  Test novevarianti/invio simulato/limiti SQL ROLLBACK e disiscrizione nei tre
  browser/formati passati. Dettagli data/VETRINA_EMAIL.md;prove e lista privata
  Documents/campagna-vetrine-20261023/. Pubblicato3908a16:pagina uscita eJS3
  identici ai blobGit online;API invio senza auth401,promo/digest token finto404.
  Verifica finale:zero consensi e zero invii;nomi/email WhatsApp ancora attesi.
  Backup tag/ramo remoti validi;helper interrotto dopo push per stderr noto.

- Preferenza: poche email brevi e umane, varianti pertinenti, visualizzazioni
  reali e pacchetti per più annunci; obiettivo trovare prima un acquirente,
  nessuna promessa/tempo medio inventato. API READ ONLY:70venditori attivi,
  53adatti ai testi Vendita e17ai pacchetti con criteri finali. Preparate
  20bozze/20account:8pacchetti,8visite,4visibilità;9varianti, prezzi online
  identici al listino. Piano/testi pubblici data/EMAIL_VETRINE_20261023.md;
  bozze/dati privati Documents/campagna-vetrine-20261023/.
  **Zero invii, nessuna automazione/modifica DB.** Consenso marketing non
  documentato nel sistema:statistiche/digest true di default,zero acquisti
  live riusciti. Chiesti eventuali consensi esterni; prima di spedire servono
  verifica,uscita offerte funzionante e coordinamento con riepiloghi.
  69snapshot19/10 non provano consegna, trattati come contatti recenti.
  Proposto primo gruppo massimo20;30giorni fra future offerte,nessun seguito
  automatico autorizzato/attivato. Backup remoto valido;cleanup helper noto.

## Contorni campi e mappa scuri — 23 ottobre 2026

- Correzione richiesta negli altri punti del sito: bordo campi/menu#334155
  e nessun alone, focus tastiera2px blu conservato. Mappa SVG adattata:
  mare#0f172a, terre#25334a, confini#475569; stati e marker conservati.
  JS7/CSS6, chiaro invariato; nessun dato/account reale modificato.
  Locale100controlli campi/filtri/zoom/chiaro e267tema passati.
  Prove/stato Documents/verifica-dark-campi-mappa-20261023/risultati.md.
  Pubblicato774baf4, Vercel3KTX3wCb2eZctxQNfaztChxvSY67 READY:
  22asset/pagine identici e setteSSR aggiornati. Ripetuti online100controlli
  dedicati e267tema passati; nessuna scrittura reale. Backup remoto valido.

## Finiture modalità scura — 23 ottobre 2026

- Richiesta: bordi e pulsanti più puliti, struttura conservata.
  Convertiti bordi chiari indigo/ciano e gialli; statistiche con etichette12px,
  cifre tabulari e schede economiche estese su telefono. Pulsanti admin
  piatti,36/44px, focus/stati coerenti; niente invii o scritture account reali.
  Cache admin-themeJS6/CSS5; palette chiara conservata. Locale48controlli
  dedicati,267tema e33scenari primo disegno passati. Inspector treformati:
  0FAIL, un avviso sulle etichette12px, mantenute per densità. Prove/stato
  pubblicazione Documents/verifica-dark-finiture-20261023/risultati.md.
  Pubblicato12eb209, VercelA9M59oRDQqoNRvzM9XBV3vVNSR4Q READY;
  22pagine/asset identici, settepercorsiSSR aggiornati. Online267controlli
  tema e33scenari primo disegno passati, zero flash nei casi scuri.
  Contrasto dedicato minimo7,40:1; backup remoto e file estranei conservati.

## Modalità scura senza flash — 23 ottobre 2026

- Richiesta corrente: niente comparsa chiara prima dello scuro; pulsante
  direttamente nella pagina personale, fuori dalle impostazioni. Supera
  la posizione Profilo → Impostazioni → Aspetto del primo intervento23/10.
  Pulsante in dashboard e area organizzatore, con stato e salvataggio account.
  Avvio nel head/CSS bloccante, copia locale ID/tema confermato vincolata
  alla sessione; prima lettura senza copia su fondo scuro. Nessuna cache
  di ruolo/token aggiuntiva. Chiaro iniziale e protezioni account conservati.
  JS5/CSS4, theme-preferences2. Contratto data/THEME_PREFERENCES.md;
  prove/stato Documents/verifica-tema-senza-flash-20261023/risultati.md.
  Pubblicatoa772847, Vercel9HeTF5BKnLUkepVg9oyrfmU5xhCu READY:
  22asset/pagine identici,13percorsi pubblici/SSR aggiornati. Online267controlli
  tema e33scenari di caricamento passati; quattroSSR×treformati/browser
  scuri dal primo fotogramma, zero pannelli chiari. Profili Chromium273controlli
  passati; suite WebKit con errore locale riprodotto anche su696f9f5, limite
  documentato. Nessuna scrittura reale; inspector del controllo0rilievi.

## Dashboard admin compatta — 23 ottobre 2026

- Crescita: metrica selezionabile, griglia tenue e colori adatti a chiaro/scuro;
  totali e quattro periodi conservati. Provenienza: tre numeri e tre pagine,
  resto in «Statistiche complete». Avvisi Bandi:5iscrizioni visibili, altre
  al clic; regioni e spiegazioni chiuse. API conserva limite20recenti,
  indicato se totale superiore. CSSdashboard-statistics1, nessun cambio DB/invii.
  Locale208controlli interazione in quattro browser/formati e261tema passati,
  inspector0FAIL; dati/sessioni simulati. Prove e stato pubblicazione:
  Documents/verifica-dashboard-statistiche-20261023/risultati.md.
  Pubblicato61c77a6, Vercel5DThy5t5keuSXgsEdJXiZ2k1gC2w READY e dominio
  verificato:HTML/CSS identici,208controlli ripetuti sugli asset online passati.
  Contrasto minimo5,56:1; registro/sintassi admin online passati. Backup remoto
  session-20261023-082015 valido; cleanup helper interrotto per errore noto.

## Aspetto per tutti — 23 ottobre 2026

- Profilo → Impostazioni → Aspetto: Chiaro/Scuro, salvataggio automatico
  nell’account. Chiaro iniziale anche per admin e organizzatori; supera
  l’attivazione automatica admin del22/10. Variante chiara anche statistiche.
  JSadmin-theme4/CSS3, theme-preferences1; nessuna migrazione o invio.
  Token legato all’identità iniziale, logout/cambi/errori protetti.
  Locale261controlli tema,364profili e statistiche nei quattroformati passati;
  inspector impostazioni0rilievi. Prove con sessioni/salvataggi simulati,
  nessun account reale modificato. Contratto data/THEME_PREFERENCES.md,
  prove/stato Documents/verifica-tema-profilo-20261023/risultati.md.
  Backup session-20261023-075225 e ramo pre-tema-profilo-tutti-utenti validi;
  errore cleanup helper noto. Pubblicato7e360bd, Vercel
  DWpq4kMAcCxGVMPm3zAMkvZ3LcUn READY:22asset/pagine identici,
  13percorsi pubblici/SSR con tema4. Ripetuti online261controlli tema,
  364profili e statistiche4formati; quattroSSR scuri e home anonima
  chiara in Chrome1440/320 e Safari390 passati, nessuna scrittura account reale.


- **Vetrina/statistiche22/10:** riparato footer condiviso che sovrascriveva
  la finestra Premium; “Vetrina/Promuovi” verificati insieme alla shell reale.
  Gratuiti: visualizzazioni/messaggi e anteprima Premium sfocata. Analisi
  permanenti per ciascun annuncio acquistato, singolo/bundle, anche dopo
  scadenza; test/omaggi/falliti esclusi. Gate server/RLS, UTC, tabella eCSV,
  isolamento account/risposte tardive. Migrazione applicata e testata due
  volte in ROLLBACK; tutti i profili/periodi verificati. Browser Chrome/Safari
  desktop/mobile, acquisti e198controlli tema passati. Trigger/dati esistenti
  conservati; nessun addebito reale. Prove e pubblicazione in
  `Documents/verifica-vetrina-statistiche-premium-20261022/risultati.md`,
  contratto `data/SELLER_PREMIUM_ANALYTICS.md`. Backup session-20261022-230957
  e ramo pre-fix-vetrina-statistiche-20261022 remoti validi; cleanup helper
  con errore noto. Pubblicato bc7e07c, Vercel6snZUmF2aJgp9UuvFXo8sD57YhyE
  READY:27asset identici; nuova suite ripetuta sugli asset online nei tre
  browser/formati, Vetrina nei quattro. Dashboard reale con auth isolata
  e quattro pagine pubbliche nei treformati passate; inspector0FAIL/0WARN.
  Inventari annunci/profili/ordini e trigger identici. Cache sellerCSS2.

- **Vetrine Premium e pacchetti,22/10:** richiesta corrente: 49/99/249€ per
  10/30/90giorni; 2annunci -10%,3–4 -15%,5–10 -20%, stessa durata e
  pagamento unico. Scelta multipla integrata in annunci/acquisti, totale e
  risparmio immediati; ordini, ricevute e CSV distinguono le quote. Rimossi
  sconto pubblicazione e omaggi UI; blog solo Vetrine pagate pertinenti,
  catalogo gratuito conservato. Trigger annunci e vecchi acquisti invariati.
  Backend applicato e verificato: checkout16/webhook14; nessun addebito o
  dato di prova persistente. Inventari annunci/profili/ordini e trigger
  identici prima/dopo. Test prezzi/SQL/Chrome-Safari/form/acquisti/blog
  passati, inspector0FAIL. Pubblicato079e441, Vercel
  6tckdNVNTCUXSCMpLiTbyAD46ovx READY:8asset identici al commit; quattro
  browser/formati ripetuti sugli asset pubblicati e sei casi di conferma
  singola/pacchetto passati. Dati e trigger ancora identici. Esiti e limiti in
  `Documents/vetrine-premium-bundle-20261022/risultati.md`, contratto in
  `data/VETRINE_PREMIUM.md`. Backup remoto session-20261022-220338 e ramo
  pre-vetrine-premium-bundle validi; cleanup helper con errore già noto.


- **Banda Supabase,22/10:** avviso cached egress, grazia fino21/11/2026.
  Autorizzata correzione: anteprime WebP persistenti `image-previews`, un
  originale per sei dimensioni; riuso dopo deploy e richieste simultanee.
  Nessun piano attivato; originali/qualità/URL conservati. Configurazione
  server cifrata verificata; test API/concorrenza/riavvio e Chrome/Safari
  passati. Preparate594WebP/18.975.186byte per99originali invariati;
  12richieste da nuove istanze senza scaricare originali, due anteprime
  identiche alla vecchia produzione. Pubblicato2698da7, Vercel
  FQhYt3zriBSnLhBKDbGV9s9NiTbZ READY:12risposte online da cache persistente,
  HEAD/errori e quattro asset identici verificati; home/dettaglio Chrome
  1280/320 e Safari390 passati, zero originali prima del clic/erroriJS.
  Inventario99originali ancora identico dopo pubblicazione. Stato/prove in
  `Documents/verifica-anteprime-persistenti-20261022/`, contratto e test in
  `data/IMAGE_PREVIEWS.md`. Backup remoto session-20261022-104343 valido;
  errore cleanup noto. API Vercel401/403 risolta con refresh CLI; prime
  chiavi mascherate/legacy rifiutate, risolto recuperando il secret per ID.
  Configurazione creata, primo resoconto parziale corretto senza duplicati.

- **Dashboard e statistiche fiere,22/10:** richiesta corrente: eliminare
  «Il sito sotto controllo» e ridisegnare le statistiche organizzatori con
  un riferimento grafico dedicato. Rimosso blocco/admin polling, altri pannelli
  conservati. True-black flat, numeri condivisi, grafico adattivo, posti
  liberi/assegnati, provenienza, contatti, agenda e risultati mobile.
  Profili diretti, filtri7/30/90 e CSV conservati; nessuna scrittura DB.
  Checkout Documents/subingresso-statistiche-fiere-20261022; prove e stato
  pubblicazione Documents/verifica-statistiche-fiere-20261022/risultati.md.
  Dettagli/limiti in data/ORGANIZZATORI_EVENTI.md. Cache analyticsJS3/CSS2,
  organizer-charts1. Non reintrodurre il riepilogo admin rimosso.
  Pubblicato eff3098, Vercel BzEJdCjth1bCRrDSVbMNokkjgLfF riuscito:
  cinque file identici al commit; statistiche online quattro formati/browser,
  rimozione admin e accesso pubblico Chrome1440/320 e Safari390 passati.

Mappa per avviare le sessioni. Percorsi relativi al repo `C:\Users\utente\Desktop\Ardit\subingresso.it`. Ricognizione tecnica: 6 ottobre 2026; unione documenti: 16 ottobre; snellimento: 17 ottobre. Le registrazioni mantengono le proprie date: questa revisione non verifica nuovamente sito o servizi live.

## Stato recente e decisioni correnti — 22 ottobre 2026

- **Vercelli conclusa e verificata online22/10:**102 manifestazioni in42comuni,
  tutti82esaminati,90aggiunte;12ID e6.117schede esterne conservati,
  catalogo6.219. Audit `data/fiere-vercelli.json` e `data/FIERE.md`:
  594ricevute/50PDF,18righe regionali,415recordATL,18limiti/15esclusioni;
  nove edizioni solo2025 e sei sintesi costo, nessuna data inventata.
  TrinoDicembre5/12,Doccio25/10 e Tronzano8/11 corretti da originali;
  Ruggine recuperato nel browser, LUVA gratuità soloETS. Pubblicato3e0d6e7,
  Vercel4X9GH6h5fUTJyaHfWwKY8UGTjmW6 READY:5asset identici,102pagine
  HTTP200/H1/canonical/contenuti e Chromium1440/320+WebKit390 online passati.
  Locale: generale5formati,settori,6.219pagine/2.656sitemap e build ripetibile.
  CacheJS106/JSON74; TO DO53/57 solo dopo verifica. Originali/prove in
  `Documents/ricerca-fiere-vercelli-20261022`; copiaSHA256
  `ricerche-fiere-20261022-205859`:66.948file/11.408.389.246byte,zeroerrori,
  supplemento finale verificato. Nessun contatto a terzi; ricerca corrente
  chiusa con limiti espliciti, manutenzione futura separata.

- **La Spezia conclusa e verificata online22/10:**164manifestazioni in26comuni,
  tutti32esaminati;87aggiunte e sola scheda annullata Bonassola rimossa,
  altri77ID e5965schede esterne conservati, catalogo6129. Audit provinciale
  eFIERE.md:485ricevute,118righe fiere,37mercati,28limiti/14gruppi esclusioni.
  Originali comunali, albi/SUAP, organizzatori ePDF; NataleSarzana esplorativo
  escluso, documenti404/403/RTFErrore5001 espliciti. Nessun contatto a terzi.
  Dati973cb1e:5asset identici aGit,164pagine200/H1/canonical;Chrome1440/320
  eSafari390 online/locali con PLAYWRIGHT_MODULE passati. Generale5formati,
  settori,6129pagine/2651sitemap ebuild ripetibile passati. TO DO52/58.
  Originali/prove Documents/ricerca-fiere-la-spezia-20261022; backup remoto
  session-20261022-214545 epre-fiere-la-spezia-20261022. CopiaSHA256
  ricerche-fiere-20261022-201254:64565file/11204772943byte,zeroerrori;
  supplemento finale verificato. CacheJS105/JSON73. Manutenzione futura distinta.


- **Savona conclusa e verificata online 22/10:** 293 manifestazioni in 42 comuni,
  tutti i 69 esaminati, 72 aggiunte; altre 5750 schede inalterate, catalogo6043.
  Ricerca del21/10 conservata: audit data/fiere-savona.json,552ricevute,
  385righe regionali riesaminate,20limiti/10gruppi di esclusioni. Sassello5–6/9
  risolto con due atti; Borghetto SanMatteo resta discordante, nessuna data
  inventata. Fonti bloccate, quote parziali e quattro soli2025 espliciti.
  Dati pubblicati beea083, cinque asset identici ai blob Git nella produzione
  660c3cf;293pagine HTTP200/H1/canonical, Chromium1440/320 e WebKit390
  online/locali passati con PLAYWRIGHT_MODULE. Generale5formati,settori,
  6043pagine/2635sitemap e build ripetibile passati. TO DO51/59 dopo verifica.
  Prove Documents/ricerca-fiere-savona-20261021; backup remoto sessione e
  ramo già presenti. CopiaSHA256 ricerche-fiere-20261021-203019:62542file,
  10955471966byte,zeroerrori; supplemento finale verificato. Nessun contatto
  a terzi; manutenzione futura distinta. Ripresa senza rifare ricerca o backup.

- **Valutatore v2.6,22/10:** calibrazione richiesta sul caso 15.000/anno,
  50giornate: base13.548; principale16.425, laterale10.000, angolo15.000,
  riparato14.000, frontale12.000. Pesi proporzionali sopra1.000, combinati
  senza vecchio tetto30%; altri esempi approvati e report2.0-2.5 invariati.
  Minimi1.000/500, margini/durata conservati. RPCv26 additiva, claim e
  contatore aggiornati; valuation8/pagina9. 41.472scenariJS,11.520storici
  identici e6.336confrontiSQL con ROLLBACK passati. Prove/browser/pubblicazione
  Documents/verifica-valutatore-v26-20261022; dettagli in istruzioni.md.
  Backup tag/ramo remoti validi; cleanup helper con errore noto. API413
  risolta dividendo SQL in400casi; primo fileSQL con BOM rigenerato senza.
  Pubblicatoe218570, Vercel5dtUg9JMerbXogWsY29ozfasqoJq riuscito:
  cinqueHTML/script identici ai byteGit. Chromium/WebKit390/1280 locali e
  Chromium/WebKit390 sugli asset pubblicati passati; sei casi online esatti,
  salvataggio/riprova/report2.0-2.6 verificati con backend simulato, nessuna
  scrittura reale di prova. RPC400/22023 senza salvataggio; vecchieRPC
  identiche e claim/contatore/permessi verificati dopo applicazione. Ulteriore
  controllo idempotente400casiSQL con ROLLBACK passato.


## Tema dark personale admin — 22 ottobre 2026

- Richiesta corrente: sito interamente scuro solo per l'admin, palette della
  sezione organizzatori. Attivazione automatica dopo sessione convalidata e
  `profiles.is_admin === true`; nessun ruolo/preferenza salvato nel browser.
  Uscita, cambio account, errori e risposte tardive protetti. Pagine statiche
  senza Auth riusano la sessione solo quando presente; anonimi invariati.
- `js/admin-theme.js?v=2`, `css/admin-theme.css?v=2`; base e generatore
  `css/admin-theme-base.css`, `scripts/build-admin-theme.cjs`. Override
  cromatici circoscritti ai fogli/pagine originali; foto e dati invariati.
  Collegamento in20HTML e cinque template API, compresi errori/elenco fiere.
- Locale:198controlli tema nei tre casi Chromium1440/320 e WebKit390,
  contrasto testi/campi almeno4,5:1, assenza pannelli bianchi e nuovi overflow;
  regressione profili364passata. Sessioni/ruoli e contenuti delle prove
  simulati, nessuna scrittura reale. Prove e limiti:
  `Documents/verifica-tema-dark-admin-20261022/`. Pubblicatoca9cf29,
  Vercel4DXHo3LFjYrEbELaM7c77j9tUn5Jriuscito:21pagine/asset identici,
  13percorsi pubblici/SSR con un solo collegamento tema;198controlli ripetuti
  sugli asset pubblicati passati. Quattro SSR reali in treformati scuri e
  home anonima reale chiara nei trecasi verificati; ruoli dark simulati.
  Nessuna scrittura reale. Aggiornamenti concorrenti calcolatore/statistiche
  integrati; CSS rigenerato e198controlli integrati passati. La sezione
  organizzatori conserva anche il nuovo stile True-black gia pubblicato.
  Finitura finalev2:anche etichette viola/rosa e fondi semitrasparenti scuri;
  altri198controlli locali passati. Pubblicato50a9392, Vercel
  G7BPtUg4sytAEDCu2kZvtuCTe3S8riuscito:21pagine/asset identici,13percorsi
  con collegamento v2 e198controlli sugli asset finali online passati;
  ripetuti quattroSSR/treformati e home anonima3, comprese etichette basse.
- Backup remoto `session-20261022-011206-tema-dark-admin` e ramo
  `backup/pre-tema-dark-admin-20261022` creati prima delle modifiche;
  consueto errore cleanup helper, backup remoto riuscito. File estranei esclusi.

## Stato recente e decisioni correnti — 21 ottobre 2026

- **Livorno conclusa e verificata online21/10:**63manifestazioni/17comuni,
  ricognizione19; nessuna scheda o audit provinciale al checkpoint32452a0.
  Altre5908schede identiche, catalogo5971. Audit data/fiere-livorno.json e
  FIERE.md:231ricevute/34PDF,27esclusioni/20limiti, sette costi e due soli2025.
  Fonti originali e programmi discordanti conservati; Cinghiale15novembre
  vs8nelPDF, Bibbona tutti i giorni vsdomeniche, FieraOttobreCecina e orari
  LibrExpo espliciti. PianoLivorno recuperato dal nuovo archivio; calendario
  non professionisti non pubblicabile. Nessun dato inventato o invio a terzi.
  Pubblicatoa27c82d:quattro asset identici aGit,63pagine200/H1/canonical/contenuti,
  Chromium1440/320 e WebKit390 locali/online passati con PLAYWRIGHT_MODULE;
  generale5formati,settori,5971pagine/2587sitemap e build ripetibile passati.
  TO DO50concluse/60da fare aggiornata dopo verifica. CacheJS103/JSON71.
  Originali/prove Documents/ricerca-fiere-livorno-20261021;backup remoto
  session-20261021-213553-fiere-livorno e ramo pre-fiere-livorno-20261021.
  CopiaSHA256 ricerche-fiere-20261021-195618:60846file/10802537078byte,
  zeroerrori; supplemento finale verificato. Manutenzione futura distinta.


- **Spazio Vercel,21/10:** avviso75% dei10GB Deployment Storage. Inizialmente
  326pubblicazioni READY nel progetto `subingresso`, tre nel vecchio
  `subingresso.it`; dominio sul primo, CLI locale collegata al secondo:
  usare ID espliciti. Preparati314candidati, protette ultime10produzioni
  e tutte le copie con alias. Eliminazione autorizzata esplicitamente21/10
  e conclusa:314risposte DELETED e314ID assenti dall'inventario aggiornato;
  rimaste15pubblicazioni READY, più tentativi cancellati senza build.
  Alias e pubblicazione attuale invariati; vecchio progetto3READY intatto.
  Verifica finale16:47:28:140file identici,11artefatti funzioni identici,
  22pagine/API con esiti attesi, sitemap2965URL. Zero scritture DB/storage
  utenti e nessuna modifica a pagine/funzioni/dati. Fonti e cronologia
  conservate. Limite429 now-rm dopo283: atteso reset16:45:27 e concluse
  le31restanti; log e verifiche finali nella cartella prove.
  Tutti i commit candidati presenti nel backup. Prove/inventario/CSV:
  `Documents/verifica-spazio-vercel-20261021/`; ZIP411file verificatiSHA256,
  bundleGit completo43.201.858byte verificato. Backup tag160132 e ramo
  pre-riduzione remoti validi; errore cleanup helper noto.140asset pubblici
  identici a9350585, tre config404 attesi. Pubblicato62f7c6a: ignoreCommand
  salta solo modifiche md/sql già escluse dal deploy, confronto con ultima
  pubblicazione riuscita. Codice/dati/config, errori, cronologia mancante
  e riavvii manuali pubblicano normalmente;35controlli passati. Nessuna
  modifica a pagine/stile/funzionalità/dati. Vercel2t3qv4xac1VKMRLS83yxSFfBD6sQ
  READY:140asset identici prima/dopo,11funzioni con artefatti identici;
  22pagine/API con esiti attesi e sitemap2965URL. Prima prova documentale
  4396691 non saltata:Vercel elimina.git prima dell'ignoreCommand. Corretto
  con confronto GitHub pubblico senza credenziali, solo storia in avanti
  e lista completa; errori/limiti/rename protetti. Simulazione senza.git
  e confronto GitHub reale su4396691 passati. Correzione04779a3 pubblicata,
  VercelB2i1Q36JzKjSmE8vN13jJfJiAevw READY,11artefatti ancora identici
  all'inizio;35controlli passati. Prova online riuscita:2ca7829 CANCELED
  prima del build per exit0. Alias dominio ancora su04779a3,home200 identica;
  targets.production include anche tentativi cancellati:verificare gli alias.
  API consumi Hobby non disponibile:75% dalla mail, nuova percentuale
  non misurata. Nessuna conservazione automatica modificata.


- **Home desktop,21/10:** nascosti frase e link Inserisci annuncio accanto al titolo da1024px; sezione vendita inferiore conservata. homeCSS10. Chromium1440/1024/1023/820/390 verificati; backup remoto session-20261021-155049 valido, errore cleanup helper noto. Pubblicato1c78460: HTML v10 e regola desktop verificati online.

- **Spazi home desktop,21/10:** riferimento prima immagine utente:
  da1024px tolti64px sopra slogan, distanze città24→32px; quanti luoghi
  entrano in una riga tra12candidati reali, personale prima. Supera limite
  desktop tre; tablet600–1023 resta tre, telefono invariato. Contatori
  avvicinati12px (padding superiore36→24), valori/animazione conservati.
  HomeCSS9/scorciatoie3. Backup remoto verificato, cleanup helper con
  errore noto. Locale Chromium1920/1440/1024/820/320 e WebKit390 passato;
  classifica/account/logout/errori e cambio soglia1023/1024 verificati.
  Prove/pubblicazione `Documents/verifica-home-spazi-desktop-20261021/`.
  Pubblicatob5e7a76, VercelFPsMTQe4Hji1ZzwJkBFmN25E4DXd riuscito:
  quattro asset identici, stessi sei browser/formati online passati;
  nessun erroreJS/overflow o scrittura reale. Lavoro Siena conservato.

- **Stima contatori home,21/10:** richiesta esplicita: mantenere i numeri
  simulati in primo piano finché l'utente deciderà di sostituirli con dati
  reali sufficienti; nessun cambio automatico. Restano1591annunci/4045utenti
  e incrementi esistenti. Valore iniziale €4.4M→€15.1M, HTML e animazione.
  API aggiornata:111attivi non-demo/non-scaduti,99vendite/12affitti;
  prezzi richiesti vendite €1.052.800, media €10.634,34. Stessa composizione:
  1591×1.052.800/111=€15.090.133,33, arrotondato15,1M. Affitti esclusi
  dal valore; prezzi storici positivi conservati senza correzioni ipotetiche.
  È una proiezione dei prezzi richiesti, non vendite concluse certificate.
  Importi indivisibili, numeri20px sotto360px per mantenere €e cifra insieme;
  homeCSS8. Backup remoto valido; errore cleanup helper già noto.
  Dati/prove/pubblicazione: `Documents/verifica-stima-contatori-home-20261021/`.
  Pubblicatoc9ea361, Vercel riuscito52RE6nPjTTvacmxz8dR1M7yuWzds:
  HTML/CSS online identici; locale Chromium1440/820/320 e WebKit390 passati,
  online Chromium1440/320 e WebKit390 passati. Importo su una riga,
  animazione/font confermati, nessun erroreJS/overflow o scrittura reale.

- **Ricerche in riga/blu/sfumature,21/10:** su smartphone una sola riga,
  tante località quante entrano, senza scorrimento; personale prima e
  desktop tre. API aggregata estesa a12candidati e verificata, log privati.
  Ricalcolo su larghezza/font; nomi lunghi protetti. Indicatore annunci
  in quattro blu crescenti per2-3/4-6/7-10/11+, contrasto4,94:1 bianco
  e4,53:1 grigio; ultimo blu rifinito dopo verifica.
  Sfumature preferenza stabile per passaggi bianco-superfici chiare:
  fascia numeri conservata, area vendita home, pagine con header bianco
  e introduzione Annunci senza bordo. Sfondi di base e tema organizzatore
  conservati. Data24/CSS15/home7/scorciatoie2. Prove/pubblicazione:
  `Documents/verifica-ricerche-riga-blu-sfumature-20261021/risultati.md`.
  Backup tag/ramo remoti validi, errore cleanup noto; test dedicati passati.
  Pubblicato7e556a1 e affinamento45aaaef, Vercel riuscito
  ELQg1PHztbiSbqYT9JFkZFffxvb7:21asset identici e treSSR aggiornati.
  Locale/online Chromium1440/768/320/375/430 e Safari390 passati;
  home/Annunci/profilo/dettaglio/blog/fiere e tema organizzatore verificati.
  Ultimo blu testato anche su grigio nei tre formati. Zero scritture
  reali di prova; lavoro Salerno concorrente preservato fuori dai commit.

- **Home ricerche/contatori,21/10:** numeri sotto ricerca e prima delle
  anteprime; valori iniziali forniti1591/€4.4M/4045, animazione esistente.
  Tre link sostituiti dai luoghi più cercati negli ultimi30giorni; classifica
  pubblica aggregata applicata e verificata anonima, nessun registro esposto.
  Ultima località dell'account prima, solo stesso browser, cache distinta
  per utente; anonimi/cambio account protetti. Sfumatura bianco-grigio richiesta.
  HomeCSS6, scorciatoieJS1, annunciJS15. Prove e stato pubblicazione:
  `Documents/verifica-home-ricerche-statistiche-20261021/risultati.md`.
  Backup tag/ramo remoti validi; helper cleanup con errore noto.
  Pubblicatoac821e4, VercelGb14hiWicX88jBT4u7rXs4dBS5PM riuscito:
  nove asset identici, dettaglio generato aggiornato; locale/online
  Chromium1440/820/320 e WebKit390 passati, ricerche home/annunci comprese.
  Regressione ricerca671casi e quattro browser/formati passati; nessuna
  scrittura reale nei test, funzione pubblica verificata e log privati.

- **Annunci del venditore,21/10:** pubblicato5666ee1; icona banco e numero
  accanto al nome nelle card/dettaglio/profilo:2-10, poi10+, zero/uno omessi.
  Totale pubblico attivo e non scaduto, indipendente dai filtri; batch e
  paginazione, nessuna stima su errore. CSS13/data23/dettaglio26.
  Soglie/errori/account Chrome1440/320 e Safari390 e preferiti174 passati.
  Profili273 Chromium passati; errore fixture WebKit riprodotto anche
  sul commit precedente. Prove/limiti nella cartella verifica-conteggio-annunci.
  Online dopoac821e4: home/annunci/dettaglio/profili multiplo e singolo
  nei tre formati passati, API reali e conteggi indipendenti concordi;
  nomi/icone/font confermati, nessun erroreJS. Dettaglio320: overflow
  testuale425px già identico prima; indicatore entro schermo, non ampliato.

- **Home/foto originali,21/10:** sezione anteprime home grigio#f5f5f5 a tutta
  larghezza come Annunci, schede bianche e margini conservati. Sfumatura
  dettaglio più lieve/bassa35/65% e opacità48/68%; anteprime invariate.
  Clic foto ora collegamento nativo al file originale in nuova scheda,
  ingrandibile nel browser; eliminata finestra JS, scorrimento conservato.
  CSS12/home5/dettaglioJS25, SSR allineato. Chromium1440/320 e WebKit390
  locali, foto singola/multipla e risoluzioni originali verificati; tastiera
  e caricamento solo al clic passati. Backup tag/ramo remoti validi;
  prove/limiti `Documents/verifica-home-foto-originali-20261021/`.
  Pubblicatof7ce294, VercelEPjDNXY5ocz6XaNduYzVVEWrbiMg riuscito:
  17asset identici e treSSR aggiornati. Stessi tre formati online passati,
  originali2048x1536 e4032x3024 confermati; Safari isolato dopo errori
  transitori rete picker nella navigazione della prova. Nessuna scrittura reale.

- **Luoghi e spaziature posteggi,21/10:** luogo anche sulle foto, testo bianco
  su sfumatura leggibile; senza foto resta ardesia su azzurro. Corpo delle
  anteprime con rientro laterale16px, immagini sempre a tutta larghezza148px.
  Dettaglio con luogo e altezza224px desktop/160mobile, SSR/client allineati;
  nomi su massimo due righe, badge/preferiti/galleria accessibili. CSS11,
  dettaglioJS24. Chromium1440/320 e WebKit390 locali passati, preferiti174 e
  galleria Chrome/Safari passati; nessuna scrittura reale. Backup tag/ramo
  remoti verificati, noto errore cleanup. Prove/limiti/pubblicazione
  `Documents/verifica-luoghi-spaziature-20261021/`. Pubblicato0983180,
  Vercel51cDyuKX7wAdyyAVwd1mVfcV7Now riuscito:16asset identici,treSSR
  aggiornati e stessi tre formati online passati; foto/senza foto anche
  senzaJS locale/online. Primo controllo durante deploy vecchio, ripetuto
  riuscito; limite preesistente suite immagini in risultati.md.

- **Ricerca/link/copertine,21/10:** rimossi i due contorni al clic nella
  ricerca; eliminato "Oppure esplora", tre link blu. Copertine foto/senza
  foto tutte148px, misura dei riquadri precedenti senza foto, home/annunci.
  CSS condiviso10/home4. Chromium1440/320 e WebKit390 locali/online
  passati: ricerca, foto, allineamento e tastiera; zero errori JS/overflow.
  Pubblicato0f3a2d3:15file identici e tre pagine generate aggiornate.
  Prove/pubblicazione `Documents/verifica-ricerca-link-copertine-20261021/`.
  Backup tag/ramo remoti verificati; noto errore cleanup del helper.

- **Bari conclusa e verificata online21/10:**90manifestazioni/36comuni,41esaminati,
  treID e altre5650schede conservati;catalogo5740.24sintesi costo,
  19esclusioni/17limiti in data/fiere-bari.json e FIERE.md.
  Originali/prove Documents/ricerca-fiere-bari-20261021. Pubblicato6b5471f:
  quattro asset identici,90pagine HTTP200/H1/canonical,Chromium1440/320 e
  WebKit390 locali/online passati con PLAYWRIGHT_MODULE. Ricerca corrente
  conclusa con limiti espliciti;47province concluse,63da fare. Nessun contatto a terzi.

- **Anteprime uniformi,21/10:** nome del luogo nei riquadri senza foto,
  eliminato «Foto non disponibile». Stesso componente/stile home e annunci,
  spaziatura condivisa; foto presenti conservate, fallback anche se il file
  immagine non si carica. Cache data22/design-system9/homeCSS-JS3.
  Pubblicato9f9fe46:21file identici e tre pagine generate aggiornate;
  home/annunci Chromium1440/320 e WebKit390 locali/online passati,
  nomi/foto/link verificati, zero errori JS o overflow; preferiti174 locali
  passati. Riscontri `Documents/verifica-anteprime-uniformi-20261021/`.
  Backup tag e ramo pre-anteprime remoti verificati; errore cleanup noto.

- **Napoli conclusa e verificata online, 21/10:** ricerca documentale corrente conclusa con limiti espliciti.
  76 manifestazioni in 28 comuni, ricognizione dei 92 comuni, 393 ricevute,
  125 record Mostra d’Oltremare confrontati, 36 gruppi di esclusioni e 17 limiti.
  Tre ID precedenti conservati; altre 5577 schede identiche a 5d405b9. Catalogo 5653.
  Dieci sintesi costo documentate, date discordanti mantenute testuali, nessun dato inventato.
  Pubblicato 594abc8: quattro asset identici ai byte Git, 76 pagine 200/H1/canonical,
  Chromium 1440/320 e WebKit 390 locali e online superati usando PLAYWRIGHT_MODULE;
  suite generale cinque formati, settori, pagine e build ripetibile superati.
  TO DO spuntata dopo verifica: 46 province concluse, 64 da fare su 110; cache JS99/JSON67.
  Audit data/fiere-napoli.json, fonti e limiti data/FIERE.md; nessun contatto a terzi.
  Originali/prove Documents/ricerca-fiere-napoli-20261021; backup SHA256
  Documents/backup-subingresso/ricerche-fiere-20261021-074318: 54011 file,
  9574647941 byte, zero errori; supplemento finale verificato nella stessa copia.
  Tag session-20261021-090816-fiere-napoli e ramo pre-fiere-napoli-20261021 remoti
  creati prima delle modifiche. Manutenzione futura distinta dalla ricerca attuale;
  nessuna altra provincia avviata e modifiche estranee preservate fuori dai commit.

- **Ridisegno grafico,21/10,richiesta esplicita:** home a catalogo,
  ricerca blu, card/metadati leggibili, fiere/calcolatore, città e FAQ native;
  finiture condivise e font Jakarta statici locali400–800 con licenza OFL.
  Logo testuale, slogan e flussi conservati; CSS8, homeCSS/JS2.
  Copia391file verificati SHA256 e collegamento Desktop; tag e ramo preventivi
  verificati remoti, noto errore cleanup helper. Percorsi originali dei backup
  conservati nella versione Git precedente (`777c1e6`).
  Locale5browser/formati, profili364 e preferiti174 passati; correzioni Safari
  e sovrapposizione copertine giudicate risolte. Prove/limiti in
  dossier originale del ridisegno21/10 (percorso in Git `777c1e6`); pubblicazione da verificare.

- **Perugia conclusa e verificata online,21/10:**152manifestazioni/47comuni,
  ricognizione59comuni,120registrazioni originali e165ricevute.146schede datate,
  nove sintesi costo;dieciID conservati e altre5428schede identiche. Catalogo5580.
  Pubblicatoe4042b4,Vercel42G1HWcqo1E56noVgWqPaMNfY6LEriuscito;4asset uguali
  al commit,152pagine200/H1/canonical, browser locale/online3formati e generale5
  passati. TO DO45concluse/65da fare aggiornata dopo verifica. Fonti,29esclusioni
  e14limiti in data/fiere-perugia.json eFIERE.md;manutenzione futura distinta.
  Originali/prove Documents/ricerca-fiere-perugia-20261021;backup ricerche
  20261021-022524,52732file SHA256/zero errori e supplemento finale verificato.
  CacheJS98/JSON66. Nessun invio a terzi;altre province al controller.

- **Logo smartphone +15%,21/10:** scritta23px e20,7 sotto380;
  barra invariata74/72px, pulsanti e desktop invariati. CSS7, UI17.
  Locale Chromium1440/320/375/430 e WebKit390 passato, zero sovrapposizioni.
  Backup remoto tag/branch verificati; cleanup helper con errore noto.
  Prove/pubblicazione `Documents/verifica-logo-mobile-15percento-20261021/`.
  Pubblicato ecc0353:15asset identici e2SSR aggiornati; stessi cinque
  formati/browser online passati, altezza invariata e zero errori JS.
  Prima lettura durante deploy ancora vecchia, ripetizione riuscita.

- **Pulsanti smartphone, affinamento21/10:** richiesta misura intermedia:
  quadrati40px,36 sotto380; icone14px. Il + ha gli stessi colori di
  messaggi/profilo, anche hover e tema organizzatore. Supera44/40px e
  il + scuro del passaggio precedente; scritta e ordine conservati.
  Solo CSS e cache design-system6, UI17 invariato. Backup remoto
  pre-header-mobile-intermedio; prove e pubblicazione
  `Documents/verifica-header-mobile-intermedio-20261021/`.
  Locale Chromium1440/320 e WebKit390 passato: misure, colori uguali,
  hover chiaro, tema scuro, ingombri/ordine/accesso; zero scritture reali.
  Pubblicato99bd576:15asset identici,2SSR aggiornati e tre formati
  online passati. Stato GitHub non letto per timeout; produzione
  verificata direttamente, nessun errore JavaScript o overflow.

- **Intestazione smartphone,21/10:** scritta20/18px e margini18/14px,
  leggermente più grande/spostata a destra. Pulsanti quadrati44px,
  40 sotto380, angoli12 e icone16; ordine +, messaggi, profilo,
  senza testi mobile. Header condiviso/dashboard allineati; UI17/CSS5.
  Locale Chromium1440/820/320/375/430 e WebKit390 passato, profili364
  passati; WebKit isolato dopo errore transitorio della fixture. Nessuna
  scrittura reale; Tab verificato Chromium, ordine DOM anche WebKit.
  Backup remoto tag/branch pre-header-mobile-uniforme verificati;
  noto errore cleanup helper dopo il push valido. Prove e pubblicazione
  `Documents/verifica-header-mobile-uniforme-20261021/`.
  Pubblicatoe133319, VercelFi5LKtAi3E4rAabKDkkKcCM6drJu riuscito:
  15asset identici,2SSR aggiornati, home online nei sei formati passata.

- **Solo scritta,21/10, preferenza corrente:** ripristinato il logo
  testuale precedente Subingresso.it, senza quadrato/icona iniziale;
  supera il PNG precedente. Menu mobile resta rimosso. UI16/CSS4.
  Pubblicato40651a2, VercelFuj6dxLrKSjpq4qMx9J3PcaUrZUf riuscito;15asset
  identici,4SSR aggiornati, home locale/online Chromium1440/320 e
  WebKit390 e profili364 locali passati. Nessuna scrittura reale.
  Backup tag/branch pre-logo-solo-scritta verificati. Prove
  Documents/verifica-logo-solo-scritta-20261021/.

- **Logo e menu telefono,21/10:** PNG originale utente nelle intestazioni,
  colori/proporzioni conservati e inquadratura SVG; mobile210/180px,
  desktop244px, fondo bianco sul tema organizzatore. Eliminati pulsante,
  tendina e logica Blog/Calcolatore mobile; nessun menu sostitutivo,
  desktop conservato. Anche intestazioni autonome allineate. UI15/CSS3.
  Pubblicato7adb31a+3543132, Vercel5KGe5hzPtGK7zPzhL3R5nad8Epuy riuscito:
  15asset e PNG identici,6SSR aggiornati; home locale/online3 e fiere
  online senzaJS3 passati. Profili364 e5438pagine/2316sitemap locali passati.
  Primo controllo fiere: richiamo CSS mancante corretto e riverificato.
  Nessuna scrittura reale. Backup tag/branch verificati, noto errore
  cleanup; prove Documents/verifica-logo-menu-mobile-20261021/.

- **Grafica precedente ripristinata,21/10:** nuova versione rifiutata
  dall'utente: preferisce sito semplice e grafica originale. Home9ffd1c1,
  slogan «La tua licenza venduta in un click», senza sottotitolo aggiuntivo;
  tolti piazza, nuovi testi/riquadri e modifiche visive a card/header/footer.
  Conservati feedback brevi dei pulsanti, movimenti discreti e barra/menu
  smartphone più grandi:74px,72px sotto380, tra versione originale80 e
  prova68/62. Desktop80; menu accessibile conservato nella barra.
  UI14/CSS2, niente CSS home o SVG. Dati/flussi/contatori invariati.
  Preferenza stabile: non riproporre slogan/testi decorativi o restyling
  estesi senza richiesta. Prove e pubblicazione
  `Documents/verifica-ripristino-grafica-20261021/`; backup preventivo
  `backup/session-20261021-012320-ripristino-grafica`/branch pre-ripristino.

- **Prova grafica,21/10:** richiesta prova grafica e pubblicazione
  con backup. Home ridisegnata, ricerca centrale, piazza SVG originale,
  richiami fiere/calcolatore, città e FAQ native. Header/footer coordinati,
  menu telefono accessibile, feedback brevi e movimento ridotto; palette
  organizzatore e contatori animati conservati. UI13, design-system/home1;
  flussi/dati/DB invariati. Guida `data/STORICO_GRAFICA_20261021.md`; prove,
  tag/ramo remoti verificati e ZIP locale nei percorsi originali conservati
  nella versione Git precedente (`777c1e6`).
  Ripristino con revert del commit grafico, preservando modifiche successive.
  Locale Chromium1440/820/320 e WebKit390 passato, profili364 e tema scuro3
  passati. Pubblicazione e verifiche online registrate nel resoconto prove.

- **Intestazione organizzatore,21/10:** barra superiore scura come il profilo,
  logo chiaro, menu/icone/Accedi e pulsante annuncio coordinati, anche
  hover/focus. Supera l'header chiaro precedente; CSS selettore5, due richiami
  allineati. Profili364 e visuale con font/icone Chromium1440/320+WebKit390
  passati, nessuna scrittura reale. Errori transitori fixture WebKit risolti
  con esecuzione isolata. Guida `data/ORGANIZZATORI_EVENTI.md`; prove e stato
  pubblicazione `Documents/verifica-organizzatore-header-scuro-20261021/risultati.md`.

- **Statistiche organizzatori,21/10:** richiesta di area più ricca e curata.
  Aggiunti periodi7/30/90, filtro evento, visite/clic/confronto, salvataggi e
  avvisi correnti, andamento, occupazione, contatti, provenienza/dispositivo,
  agenda, risultati per evento e CSV. Dati storici mai inventati; aggregati
  privati, sessione deduplicata e proprietario/admin esclusi. Nuovi log senza
  account/IP/recapiti e conservazione190giorni; privacy allineata. Pagamenti
  disattivati, catalogo invariato. Cache organizzatori10/analyticsJS2-CSS1/engagement1.
  Guida `data/ORGANIZZATORI_EVENTI.md`, prove
  `Documents/verifica-organizzatori-statistiche-20261020/`; SQL ROLLBACK e
  browser dedicati passati, font/icone e regressioni profili364/eventi/capienza
  passati. Backend applicato/idempotente, zero prove residue, dati esistenti
  invariati. Pubblicato `b65e519`, Vercel riuscito
  `2H2ytE2cLsJ4jcDTL7iMbXQ4YV5o`: nove asset identici, SSR/API verificate,
  analytics online tre browser/formati e anonimo reale3 passati. Nessuna
  sessione reale proprietario; API pubblica0eventi, SQL/fixture dichiarati.
  Scala grafico rifinita con tacche intere; suite finale passata dopo un
  errore transitorio screenshot. Risultati/limiti nella cartella prove.

- **Ancona conclusa e verificata online,20/10:** 104 manifestazioni/40comuni,
  ricognizione47; +60 rispetto alle44 iniziali. Catalogo5.438, altre5.334
  identiche; audit `data/fiere-ancona.json`, fonti/limiti `data/FIERE.md`.
  BandoSanCiriaco2026 originale,375stalli e tariffe; correzioni di date,
  16esclusioni/13limiti motivati, cinque fonti secondarie dichiarate.
  Pubblicazione `d04ddc6`, deploy riuscito:104pagine200,4asset identici,
  browser online3 passati; generale5, settori e5.438pagine/2.316sitemap locali.
  TO DO44/110, restano66. Ricerca corrente chiusa con limiti espliciti;
  futura manutenzione separata. Originali/prove in
  `Documents/ricerca-fiere-ancona-20261020/`, backup completo51.160file
  verificati SHA256 più supplemento finale. Nessun contatto a terzi.

- **Profilo organizzatore,20/10:** area e finestra profilo con nome,
  descrizione, contatti pubblici ed eventi subito visibili. Rimossi pagina
  intermedia/«Vedi il profilo pubblico», guida e spiegazioni ripetitive;
  campi da Modifica profilo, note/revisione nel contesto. Preferenza stabile:
  normale pagina profilo, testi essenziali. Contatti privati esclusi dalla
  presentazione, diritti/backend invariati. Cache organizzatori9/switchJS5-
  CSS4; profili364, percorso eventi3 e usabilità68 passati. Prove
  `Documents/verifica-organizzatore-profilo-20261020/`, guida
  `data/ORGANIZZATORI_EVENTI.md`. Nessuna scrittura reale; backup remoto
  valido/noto cleanup. Focus Riprova corretto dopo prima prova fallita.
  Pubblicato `d1491e6`, Vercel `5aVu1B8WeYzSVZYMs8fhPBZhM1DJ` riuscito:
  sei file identici, profili364/eventi3 passati anche sugli asset pubblicati;
  WebKit isolato passato dopo errore fixture. Visuale font/icone3 e accesso
  anonimo3 passati. API pubblica eventi200/zero record correnti; profilo
  reale condizionale non provato. Status GitHub usato dopo API Vercel403.

- **Fiere, invito senza lampeggio20/10:** nascosto nel primo HTML e visibile
  solo dopo conferma di sessione assente; accesso lento/errori/script assente
  e risposta iniziale tardiva protetti. Testo semplice «Trova le fiere per
  il tuo banco», pulsante «Registrati gratis»; calendario/dialog/pagine
  autonome allineati. AccessoJS3, catalogo/DB invariati. Suite locale/online quattro
  formati e5.292pagine/2.169sitemap passate. Pubblicato `dcb3d57`, Vercel
  AKW5yFwtTHtJftdecQo76oydo9W5 riuscito; HTML/JS/pagina generata identici.
  Prove `Documents/verifica-fiere-accesso-20261020/`, guida `data/FIERE.md`.
  Nessuna scrittura/email reale; backup remoto valido, noto errore cleanup.

- **Fiere, nuova preferenza20/10:** Salva/Avvisami solo icone in alto a
  destra; affinità senza voto omessa, voto piccolo centrato a destra.
  Modulo essenziale: mesi, data automatica, giorno email e conferma;
  modifica data apribile. Stima personale dalla più recente edizione nota
  con anno origine visibile e anticipo rispettato; date pubblicate prima,
  eventi singoli non proiettati. Supera il divieto di proposte automatiche
  personali; nessuna stima trasformata in data pubblicata. Catalogo5.292,
  DB/worker invariati. JS95/CSS32, saved-fairs JS/CSS3/modello3. Percorso
  salvataggi, affinità e articoli/ricerca quattro formati, unità e5.292 pagine
  passati; prove `Documents/verifica-fiere-icone-avvisi-20261020/` e guide
  `data/FIERE.md`, `data/FIERE_SALVATE.md`. Nessuna email/scrittura reale.
  Backup tag/branch remoti validi; noto errore cleanup del preventivo.
  Pubblicato `b78f485`, Vercel riuscito `7PoyQBJeiHXg6MgKGhqZAmu7ZBh9`:
  sette asset identici, percorso avvisi online quattro formati e tre prove
  anonime con API/font/icone reali passati; bollino reale1440/320 verificato.
  Calendario generale cinque formati passato; nessun errore o overflow.

- **Asti conclusa e verificata online, 20/10:** 100 manifestazioni in 49 comuni,
  ricognizione dei 118 luoghi dell’anagrafica; prima 28, 72 aggiunte e tutti gli ID
  conservati. Catalogo 5.292, altre 5.192 schede identiche. Audit
  `data/fiere-asti.json`, fonti/esclusioni/limiti `data/FIERE.md`: 484 ricevute,
  94 righe regionali, 32 schede originali tentate, 14 esclusioni e 13 limiti.
  95 date puntuali, due periodi, tre ricorrenze, due solo2025, otto costi.
  Pubblicato `f1229ea`: quattro asset identici e 100 pagine HTTP200/H1/canonical;
  suite Asti locale/online Chromium1440/320 e WebKit390, generale cinque formati,
  build/settori e 5.292 pagine/2.169 sitemap passati. PLAYWRIGHT_MODULE, JS93/JSON63.
  Originali/prove `Documents/ricerca-fiere-asti-20261020`; copia
  `ricerche-fiere-20261020-172445`: 44.735 file verificati SHA256, zero errori,
  manifest/checksum verificati e supplemento finale. Date discordanti risolte,
  fonti secondarie, storici, ricorrenze e accessi mancanti espliciti; manutenzione
  futura separata. Nessun contatto a terzi; file estranei preservati ed esclusi.
  TO DO spuntata soltanto dopo verifica: **42 concluse /68 da fare**.

- **Fiere, articoli e ordine date,20/10:** includere le schede con categorie
  mancanti/parziali anche scegliendo un articolo; escludere soltanto divieti
  espliciti documentati e attuali. Nessuna classificazione/voto inventato:
  restano «Da valutare». Contatori, mappa e selezione multipla coerenti.
  Con mesi selezionati ordine dal giorno1 del primo mese, inclusi giorni
  trascorsi; edizione pertinente anche per ricorrenze e dicembre–gennaio.
  Senza mesi resta il percorso precedente. Cache JS94, catalogo5.292 invariato.
  Articoli/affinità/ricerca quattro formati, calendario320 e periodo tre casi
  passati; prove `Documents/verifica-fiere-filtro-date-20261020/`.
  Pubblicato `6ddbb73`, Vercel riuscito `44FfaH9zJZdxz8tgutXsgwPhpX2K`:
  HTML/JS identici, periodo sugli asset pubblicati e tre prove anonime/API
  reali passati Chromium1440/320 e WebKit390. Backup remoto valido, noto
  errore cleanup; conservato il registro Asti85bb41a nel rebase.

- **Posti fiere,20/10:** massimo per tipologia e totale fiera; gestione
  assegnati fuori dal sito senza riapprovazione. Liberi sottraggono esterni,
  confermati e blocchi pagamento validi; zero mostra Sold out in evento,
  profilo/calendario/dialog, aggiornamenti30s/ritorno alla scheda. Lock,
  revisioni, errori/riprova e bozze multiple protetti. Catalogo documentale
  senza disponibilità inventate. Patch additiva/idempotente applicata/API200,
  SQL reale ROLLBACK e browser Chromium1440/320+WebKit390 passati; percorso
  organizzatori,usabilità68 e Stripe passati.116profili/129annunci/19pagamenti,
  un organizzatore/evento,prenotazioni0 invariati; nessun conto Connect.
  Pagamenti fiere ancora disattivati: chiesta scelta online facoltativo8%,
  nessuna attivazione dedotta dal silenzio. Dettagli `data/ORGANIZZATORI_EVENTI.md`,
  prove `Documents/verifica-fiere-posti-20261020/`. Backup remoti validi,
  noto errore cleanup. Pubblicato `f6e7222`, Vercel READY
  `dpl_5ZFUMzJEkqW91NRwRc36nQ7CS8s7`: otto asset identici, suite completa
  disponibilità passata anche sugli asset pubblicati nei tre browser/formati.
  Tre prove anonime su dati/API reali: evento, calendario/dialog, profilo e
  refresh passati; nessuna scrittura reale. Resoconto `risultati.md` nelle prove.

- **Salva/campanella e controllo eventi,20/10:** richiesta corrente: Salva
  immediato come gli annunci e campanella separata con scelta da2mesi in su,
  anche personalizzata; email solo dopo conferma. Anteprime, dettaglio,
  pagine autonome/eventi e «Le mie fiere» allineati. «Gestisci fiera» era
  l'etichetta provvisoria del salvataggio durante il caricamento, non un
  diritto di modificare eventi altrui. Cache calendario91/salvati2/modello2;
  catalogo invariato. Patch minimo2 additiva, scelte esistenti conservate.
  Audit API: un organizzatore approvato/un evento pubblicato; prenotazioni0
  e pagamenti eventi disattivati. Nessuna fatturazione automatica fiere:
  oggi la richiesta va gestita nel contatto diretto con l'organizzatore.
  Dettagli `data/FIERE_SALVATE.md`, `data/ORGANIZZATORI_EVENTI.md`; prove
  `Documents/verifica-fiere-campanella-20261020/`. Pubblicato `8b152f4`, Vercel
  READY `dpl_89wotv1DJ6kwWGHNqB8xkBtoFNdH`: sei asset identici, pagine/API
  reali e icone/font/accesso verificati online in tre formati. Percorso
  salvataggi pubblicato passato in quattro formati, profili304/eventi3,
  fonti4/calendario5 e SQL ROLLBACK passati. Minimo2 applicato e idempotente;
  worker reale dry-run200/dovuti0, cron attivo. Nessun account/evento/email/
  acquisto reale di prova. Alessandria7695c98 preservata risolvendo il solo
  conflitto del registro; backup remoti validi, noto errore cleanup. Limite:
  consegna email provata con provider simulato, non con un invio reale.

- **Alessandria conclusa e verificata online,20/10:**158 manifestazioni/75comuni,
  ricognizione187; prima41,117aggiunte,41ID e altre5.062schede preservati.
  Catalogo5.220; audit `data/fiere-alessandria.json`, fonti/esclusioni/limiti
  `data/FIERE.md`:546ricevute,104righe regionali,64post Novese,26gruppi
  esclusioni,12limiti;153date puntuali,un periodo,quattro testuali,sei solo2025,
  sette costi. Pubblicato `bea5cb9`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/Et9jXzmd5CoWv7x3Zxu7Wmpq6RT3): quattro asset
  identici,158pagine HTTP200/H1/canonical; suite provinciale locale/online
  Chromium1440/320 e WebKit390, generale cinque formati, build/settori e
  5.220pagine/2.161sitemap passati. PLAYWRIGHT_MODULE, JS90/JSON62.
  Originali/prove `Documents/ricerca-fiere-alessandria-20261020`; copia
  `ricerche-fiere-20261020-100545`:42,090file SHA256,zero errori,
  manifest verificato e supplemento finale. Conflitti Molino/Castelletto,
  scadenze/quote mancanti, storici2025 e ricorrenze espliciti; futuro distinto.
  Nessun contatto a terzi; modifiche estranee preservate. TO DO spuntata
  dopo verifica: **41 concluse/69 da fare**.


- **Admin/fiere, richiesta20/10:** admin escluso dalla scelta automatica
  Organizzatore in dashboard e profilo; scelta manuale disponibile. Pannello
  «Fiere e organizzatori» chiuso con contatori, due schede, ricerca/stato,
  sei righe/pagina e revisione nei dettagli. Preferenze conservate durante
  aggiornamento; dati reali invariati. Cache selettore4/organizzatori7/CSS1.
  Prove `Documents/verifica-admin-fiere-20261020/`: profili304, pannello87,
  eventi tre formati e usabilità68; backup remoti verificati, noto errore
  cleanup. Pubblicato `62f1f32`, Vercel READY
  `dpl_5Y9pX4g4MNEuDfbBL5CWsEWqD8so`: sei asset identici, profili304,
  pannello87 ed eventi tre formati passati anche online con backend simulato;
  tre prove anonime reali font/accesso passate. Timeout esterno del giro
  visuale risolto nella suite; dettagli/errori nel resoconto delle prove.

- **Audit, decisioni utente 20/10:** rinviati Scout bandi, pagine locali/sitemap
  e risposta annunci inesistenti; contatori animati della home mantenuti per
  preferenza esplicita. Autorizzati alleggerimento blog conservando esperienza
  e modulo per la disiscrizione del punto6 (email), motivo facoltativo e
  conferma. Account e altri punti invariati.

- **Blog/disiscrizione completati e verificati online,20/10:** articolo
  singolo e indice con sole anteprime, testo nel primo HTML;90 articoli con
  testo/tabelle/titoli/canonical preservati e hash DB identico. Anteprime
  40.992byte contro507.329 della query precedente; nessun refetch del corpo.
  Modulo email con motivo facoltativo, conferma, annullo e retry; niente SDK
  superfluo, errore createClient e CORS corretti. Feedback categoriale senza
  email/account/token, RLS solo servizio; errore feedback non blocca uscita.
  Backend applicato/verificato, tabella vuota; OPTIONS200 e token finto404.
  Pubblicato `a25f96b`, Vercel riuscito: sei asset identici;15 casi browser
  pubblicati Chromium1440/320 e WebKit390 passati, inclusi vecchie API assenti
  e lettura senza JS. Regressioni annunci/promo fiere32+28 casi passate.
  Nessuna disiscrizione/account/email reale di prova; dati fiere invariati.
  Incompatibilità iniziale di jsdom27 risolta con26.1, dopo ripristino e
  verifica isolata; dettagli/errori `data/BLOG_LOADING_UNSUBSCRIBE.md`, prove
  `Documents/verifica-blog-disisc-20261020/`. Markup2/promo3/disiscrizione2.

- **Genova conclusa e verificata online,20/10:**274 manifestazioni/47comuni,
  copertura67; prima211,64nuove e un doppione Campomorone unificato.
  Catalogo5.103; altre4.829schede identiche. Audit `data/fiere-genova.json`,
  fonti/esclusioni/limiti `data/FIERE.md`:655ricevute,384righe fiere,
  58mercati,18gruppi esclusioni,240schede datate,18costi(17conservati).
  Pubblicato `2ce007f`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/976M76U7UWbNVZj21LjGjtuc5Fmu); quattro asset
  identici,274pagine HTTP200/H1/canonical. Suite provinciale locale/online
  Chromium1440/320 e WebKit390; generale cinque formati, build, settori,
  5.103pagine/2.148sitemap passati. Cache JS89/JSON61.
  Originali/prove `Documents/ricerca-fiere-genova-20261019`; copia
  `ricerche-fiere-20261020-004207`:40.214file SHA256, zero errori,
  manifest verificato e supplemento finale. Limiti Ne/Zoagli/Rapallo,
  storici2025, ricorrenze e tariffe discordanti espliciti; futuro distinto.
  Ripresa senza ripetere il backup iniziale o la ricerca già conclusa.
  File estranei preservati; nessun contatto a terzi. TO DO spuntata dopo
  verifica: **40 concluse/70 da fare**.


- **Pistoia conclusa e verificata online,19/10:**117 manifestazioni/19 comuni,
  copertura20; prima zero e nessun audit precedente. Catalogo5.040, altre4.923
  schede identiche. Audit `data/fiere-pistoia.json`, fonti/limiti `data/FIERE.md`;
  331 ricevute,23 esclusioni,112 date puntuali, due periodi, tre ricorrenze,
  dieci schede solo2025, cinque costi e cinque termini documentati.
  Pubblicato `2f3c578`, Vercel READY `dpl_GBbP1kUHzxgUKdHHgchiRUzM2Ubn`:
  quattro asset identici,117 pagine HTTP200 H1/canonical, suite provinciale
  locale/online Chromium1440/320 e WebKit390 passata; generale cinque
  formati, settori e5.040 pagine/2.103 sitemap passati. JS88/JSON60.
  Originali/prove `Documents/ricerca-fiere-pistoia-20261019`; copia
  `ricerche-fiere-20261019-200640`:37.540 file SHA256 verificati, zero errori,
  manifest controllato e supplemento finale. Limiti Montale/Monsummano,
  Chiesina senza data certa e storici natalizi espliciti; futuro distinto.
  Nuovi commit fiere salvate e file estranei preservati, nessun contatto a terzi.
  TO DO spuntata dopo esito verificato:39 concluse/71 da fare.

- **Fiere salvate/promemoria,19/10:** approvato sviluppo della sola fiera
  scelta, con mesi personalizzati anche5/12; supera la proposta di ricerche
  e riepiloghi su molte fiere. Salva senza email oppure avviso esplicito,
  gestione «Le mie fiere» nella dashboard. Date pubblicate/personali
  distinte, nessuna edizione futura inventata; anticipi passati respinti.
  Un invio per edizione, annullo e protezione cambio account/duplicati.
  Dettagli `data/FIERE_SALVATE.md`, prove
  `Documents/verifica-fiere-promemoria-20261019/`. Pubblicato `4dc4a2b`,
  Vercel READY `dpl_2nGPHs2oB52xC5ojs6QDeWLCrun8`, otto asset identici.
  Backend applicato: worker e cron attivi, prova reale200 con
  zero destinatari/invii e401 anonimo; SQL ROLLBACK passato anche dopo.
  Percorso locale/online quattro formati passato con backend simulato,
  inclusi registrazione, errori, profilo ed eventi organizzatore; tre prove
  anonime reali passate. API401/405, moduli e bundle verificati; regressioni
  fonti,4.923 pagine, profili280, eventi e calendario320 passate.
  JS87/accesso2, saved-fairs/modello1. Nessun account/evento/email reale di
  prova. Preferiti annunci e dati conservati, segreti verificati; backup
  remoto valido con noto errore cleanup. Dettagli/limite prova email nella guida.

- **Conversione fiere,19/10:** richiesta permanente: «Consulta la fonte»
  richiede registrazione/accesso; stesso percorso per date, tariffe,
  partecipazione e altre fonti. Invito gratuito prima delle schede e nelle
  pagine da Google, vantaggi concreti e avvisi da attivare nel profilo.
  Filtri/mappa conservati; fonte e fiera riprese dopo accesso/annullo.
  Modulo scorrevole su telefoni piccoli; API verifica sessione e URL
  della fiera, errori senza apertura esterna. Catalogo/DB/email invariati.
  JS86, accesso JS/CSS1; prove `Documents/verifica-fiere-iscrizione-20261019/`,
  dettagli `data/FIERE.md`. Pubblicato `e479808`, Vercel READY
  `dpl_JAY2p4gGogJTRMoAxT111FJbQX2k`; quattro asset identici online.
  Percorso completo locale/online Chromium1440/820/320 e WebKit390 passato,
  backend simulato; tre prove anonime reali online e API401/405 passate.
  Calendario cinque formati, articoli/affinità/ricerche quattro,
  affluenza/pagine tre,4.923 schede e settori validati. Nessun account/email
  o scrittura reale di prova; segreti verificati. Checkpoint remoto valido,
  noto errore cleanup. Checkout isolato `Documents/subingresso-fiere-iscrizione-20261019`.

- **Fiere, filtri semplificati 19/10:** principali Quando, Dove e Tipologia
  di articolo. Cosa vendi e Tipo di evento spostati in Altri filtri, con
  indicatore dei filtri attivi anche a pannello chiuso. Menu ridotto da35
  a24 scelte accorpando prodotti vicini;35 tipi documentali, fonti e voti
  preservati. Selezione multipla, contatori senza duplicati, rimozione per
  famiglia; vecchi URL precisi conservati. Menu allineato ai campi e sotto
  l’header fisso. JS85/CSS30, dati invariati. Suite articoli locale passata
  Chromium1440/820/320 e WebKit390; generale cinque formati, ricerca35
  articoli su4.923 schede, settori e font/icone reali quattro casi passati.
  Backup remoto preventivo verificato, noto errore cleanup PowerShell. Prove
  `Documents/verifica-filtri-semplici-fiere-20261019/`; dettagli `data/FIERE.md`.
  Pubblicato `fbeeb4b`, Vercel READY `dpl_DzNfy6G58NFSK7uVNcubJrM6scP3`:
  quattro asset identici al commit; prove online con font/icone reali,
  selezione multipla, settore, contatore, deseleziona/reset e nessun overflow
  passate Chromium1440/697/320 e WebKit390. Backend escluso nelle prove
  d’interazione, nessuna scrittura reale. Scansione segreti superata.

- **Pisa conclusa e verificata online,19/10:**144 manifestazioni/36 comuni,
  copertura37; prima due. Catalogo4.923, due ID e altre4.779 schede preservati.
  Audit `data/fiere-pisa.json`, fonti/limiti `data/FIERE.md`, originali/prove
  `Documents/ricerca-fiere-pisa-20261019`.458 ricevute,22 gruppi di esclusioni,
  128 date puntuali, sei periodi, dieci ricorrenze;20 schede solo2025, quattro
  costi originali/condizionati. Limiti documentali espliciti, futuro distinto.
  Pubblicato `3d597fb`, Vercel riuscito: quattro asset identici e144 pagine
  HTTP200 H1/canonical; suite Pisa locale/online Chromium1440/320 e WebKit390,
  generale cinque formati, settori e4.923 pagine/2.237 sitemap passati.
  JS84/JSON59; copia `ricerche-fiere-20261019-121306` con35,700 file
  SHA256 verificati, zero errori e supplemento finale. Nessun contatto a terzi.
  TO DO spuntata soltanto dopo verifica:38 concluse/72 da fare.

- **Profili, correzione preferita 19/10:** nome pubblico **Ambulante** al
  posto di «Normale», anche nel modal e nei messaggi. Switch nella dashboard
  sotto il blocco avatar/saluto/email/modifica profilo e prima di Performance
  posteggi, nel normale flusso: scorrendo esce dalla vista. Anche nell’area
  organizzatore niente switch fisso. Eliminati «Dashboard normale» e
  «Aggiorna»: dati caricati già all’apertura; ritorno alla dashboard Ambulante
  soltanto dallo switch, senza aprire il modal. Colori e scelta automatica
  conservati. Questa preferenza sostituisce nome e posizione fissa sotto.
  CSS/JS selettore3, organizzatori6.280 controlli profili locali passati
  Chromium1440/820/320 e WebKit390, con font/icone reali; flusso completo
  eventi passato Chromium1440/320 e WebKit390. Pubblicato `a424f8a`,
  Vercel READY `dpl_8kpHtbcTy2XwpJGXWbPnAkJ2anWY`: sei asset identici
  ai blob,70 controlli sull’HTML/JS pubblicato320 e tre prove anonime reali
  Chromium1440/320 e WebKit390 passati. Nessuna scrittura reale.
  Checkout isolato `Documents/subingresso-profili-ambulante-20261019`, prove
  `Documents/verifica-profili-ambulante-layout-20261019/`; ricerca Pisa
  concorrente preservata. Tag e branch preventivi remoti creati, noto errore
  del cleanup locale PowerShell.

- **Profili, nuova preferenza 19/10:** stesso account, modalità Normale chiara
  e Organizzatore scura sia nel profilo sia nella gestione eventi. Switch con
  icone sempre visibile, anche durante lo scorrimento. A ogni apertura del
  profilo confronto aggiornato tra annunci propri attivi/non scaduti e
  propri eventi non annullati, incluse bozze: più eventi apre Organizzatore;
  parità, nessun contenuto o errore apre Normale. Sostituisce «Normale sempre
  all’apertura». Stessa regola sull’ingresso ordinario `/dashboard`: se
  prevalgono eventi apre direttamente la gestione organizzatore. Switch
  fisso anche nella dashboard normale. `?area=normale` forza la dashboard
  normale, `?profilo=1` il suo modal; parametri consumati. Link con hash o
  altre destinazioni esplicite conservati. Un’interazione blocca il rinvio
  automatico tardivo. Scelta manuale e ritorno a Normale prevalgono sulle
  risposte tardive; nessuna preferenza persistente o attivazione automatica.
  CSS/JS selettore2. Controlli profili passati Chromium1440/820/320 e
  WebKit390, font/icone reali e contrasto finale320; percorso eventi passato
  Chromium1440/320 e WebKit390. API HEAD200 e workspace anonimo401 verificati.
  Pubblicato `880981b`, Vercel READY `dpl_99A1Gje1rLK7A3S9FBWfavmh2vyg`.
  Quattro asset online identici ai blob;268/268 controlli sugli asset
  pubblicati passati (67×4), backend simulato. Tre prove anonime reali su
  desktop/telefono, colori/logo/font, switch fisso e registrazione passate;
  nessuna scrittura o account/evento reale di prova. Prove
  `Documents/verifica-profili-default-colori-20261019/`.

- **Lucca conclusa e verificata online, 19/10:** 127 manifestazioni/33 comuni,
  prima due; catalogo4.781, due ID e altre4.654 schede preservati. Audit
  `data/fiere-lucca.json`, fonti/limiti `data/FIERE.md`, originali/prove
  `Documents/ricerca-fiere-lucca-20261019`. 74 date puntuali, cinque solo2025;
  tre periodi/edizioni,50 ricorrenze e quattro costi originali. 85 ricevute
  selezionate,16 esclusioni; limiti di accesso espliciti, future verifiche
  separate. Pubblicato `f0dc8ce`, Vercel READY `dpl_AKTR6nSusVUNyHD8PWWSfwpNpa6i`,
  quattro asset identici e127 pagine HTTP200 H1/canonical. Suite Lucca locale
  e online Chromium1440/320 e WebKit390, settori,4.781 pagine/2.093 sitemap
  e generale cinque formati passati. JS83/JSON58; segreti verificati senza
  bypass. Copia `ricerche-fiere-20261019-022950`: 34,729 file,
  6,398,564,547 byte SHA256 verificati, zero errori e manifest controllato;
  supplemento finale per prove online. Nessun contatto a terzi.
  TO DO e riepilogo aggiornati soltanto dopo verifica:37 concluse/73 da fare.

- **Qualità organizzatori, 18–19/10:** audit mirato con rete lenta, aggiornamenti fuori ordine, uscita/cambio account e bozze. Riprodotti sette problemi/punti deboli: modifiche durante il salvataggio poi perse, feedback distante, ritiro di altro evento che scartava modifiche, risposta admin vecchia che sostituiva la nuova, dialog e dati rimasti dopo logout, indicazione invio generica. Corretti: blocco temporaneo dei campi e ritorno del focus, messaggi nella sezione usata, conferma sulle modifiche, aggiornamento admin più recente e pulizia su cambio identità, indicazione dinamica di ciò che manca/«Pronto per l’invio». Scorrimento con titoli fuori dall’header fisso. JS organizzatori5/CSS eventi4. Backend/schema/pagamenti invariati, nessuna pubblicazione automatica del test reale. Audit ripetibile `scripts/test-organizer-experience.cjs`, prima/dopo e prove `Documents/verifica-qualita-organizzatori-20261018/`; Audit finale68/68 esiti (17 controlli in quattro combinazioni), percorso completo Chromium1440/320 e WebKit390 e SQL reale/ROLLBACK passati. Pubblicato `2f7d024`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/DDkRQ2Y39XanUqarGyS9tvzztSWT); cinque asset/pagine online identici, evento404 con CSS4. Percorso completo e font reale/coerenza accesso-modulo passati anche online Chromium1440/320 e WebKit390. Resoconto `risultati.md` nella cartella prove. Backup tag/branch remoti verificati, consueto errore cleanup PowerShell; scansione segreti superata con binario principale.

- **Invio e approvazione eventi, 18/10:** verifica API in sola lettura sul test dell’utente: profilo approvato, evento in bozza con posteggio attivo e condizioni complete, mai inviato (`submitted_at` nullo), quindi correttamente assente dal calendario. Resi visibili anche gli eventi in bozza nel pannello admin, con conteggio e motivo della mancata approvabilità; revisione spiega il passaggio mancante. Link alla propria area organizzatore; scheda proprietario «Completa e invia», avviso bozza non inviata e pulsante di invio sopra i posteggi. Nessun invio/approvazione/pubblicazione automatica del test reale. JS organizzatori4; prove `Documents/verifica-invio-eventi-admin-20261018/`. Suite completa con bozze e invio/approvazione passata Chromium1440/320×568 e WebKit390. Pubblicato `f934ec7`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/CgSoNPYLQ4AixM4oFmjM2i3pUdS9); quattro pagine/asset online identici. Dati fiere concorrenti preservati; scansione segreti superata e backup remoto verificato, consueto errore cleanup PowerShell.

- **Modulo eventi, 18/10:** richiesta di semplicità e controlli durante la compilazione. Date collegate: fine proposta uguale all’inizio e riallineata spostandolo oltre la fine; calendario vincolato, controllo manuale anche nei browser senza date native, durata massima366 giorni, scadenza domande entro l’inizio. Errori vicino ai campi con focus; controlli su dati obbligatori, spazi, recapiti, comune, settori, quantità/prezzi/dimensioni. Istruzioni più brevi, campi facoltativi chiari, prezzo per intero evento e gratuito espliciti. Condizioni min20 e data non passata controllate prima dell’invio; bozza incompleta ammessa per le condizioni. Salvataggio evento conserva modifiche non salvate al profilo. JS organizzatori3/CSS eventi3; nessuna modifica DB/pagamenti o evento reale dell’utente. SQL reale con nuovi casi negativi passato in ROLLBACK; flusso completo e casi invalidi passati localmente e sugli asset pubblicati Chromium1440/320×568 e WebKit390. Pubblicato `5f408e6`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/Bg7hoptAasVzQD7L1rEqpW6CMoi7); cinque file online identici, evento404 con CSS3, scansione segreti superata. Prove `Documents/verifica-modulo-eventi-20261018/`; backup tag e branch remoti verificati, consueto errore cleanup PowerShell.

- **Organizzatori, preferenza corrente 18/10:** contatto privato come percorso principale; futuri pagamenti sul sito facoltativi, 8% solo su quelli gestiti dalla piattaforma e spiegato a chi li sceglie. Non pubblicizzare commissioni nei moduli/pagine generali. Rimosso riquadro 8%/92%; font del sito esteso a logo/menu/footer/accesso delle pagine organizzatore/evento, CSS eventi2. Flusso completo e confronto font reale con pagina standard passati Chromium1440/320×568 e WebKit390; assenza riquadro, accesso/modulo e contatti verificati, nessun overflow/errore JS. Pubblicato `7b2f50a`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/GD9xNYHHuYzPxmydeBrLz6H5TpaA); quattro file online identici al commit, evento404 con CSS2/no-store e confronto font/accesso/modulo passati anche online nei tre casi. Evento200 simulato soltanto nel browser, nessun invio reale; backend/pagamenti invariati. Prove `Documents/verifica-organizzatori-font-20261018/`. Backup tag remoto verificato, consueto errore cleanup PowerShell; scansione segreti superata con binario principale.

- **Organizzatori/eventi, 18/10, pubblicato/verificato:** profilo e singoli eventi con approvazione admin separata; modifiche da riapprovare. Area `/organizzatore`, posteggi/tariffe, eventi approvati in profilo/calendario e `/evento?id=...`/sitemap. Prenotazioni future: incasso piattaforma e trasferimento organizzatore, **commissione 8%**, quota92%; pagamenti ancora disattivati, integrazione operativa futura. DB:113 profili/128 annunci/19 pagamenti Vetrina invariati; nessun evento/account/acquisto reale di prova. SQL ROLLBACK e flusso completo Chromium1440/320×568+WebKit390 passati; calendario cinque casi, pagine/sitemap e regressioni admin/Vetrina/statistiche/qualità passate. Pubblicato `b63ca32`+`7984e1a`, Vercel READY `dpl_EaHy6LQm835h6QJzdMAuTJnUYq5p`; otto pagine/asset identici al commit, accesso e calendario con API reali passati online nei tre casi. Corretto errore di sessione assente, JS organizzatori2. Dettagli `data/ORGANIZZATORI_EVENTI.md`, prove `Documents/verifica-organizzatori-20261018/`. Blog concorrente preservato; backup remoti e scansioni segreti validi, consueto errore cleanup tag PowerShell.

- **Pubblicità blog, 18/10:** algoritmo richiesto: geografia da titolo/slug per tutti gli articoli, Vetrine pertinenti prima e poi gratuiti locali; generici con rotazione nazionale. Regioni multiple/Garda e comuni riconoscibili; tema alimentare/non alimentare/affitto fra pari. RPC di sola lettura `blog_listing_ads`, indice geografico, nessun limite ai24 recenti; esclusi annunci scaduti, pending/rifiutati e demo. DB applicato e permessi anon/auth verificati. Test SQL con60 Vetrine/800 selezioni passati;90 articoli controllati,48 regionali;32 casi browser Chromium1440/768/320×568+WebKit390 passati, più acquisizione. Fonte/stato reale:104 annunci idonei, zero Vetrine attive; simultaneità provata con fixture temporanee annullate. Dettagli `data/BLOG_ADS.md`, prove `Documents/blog-ads-20261018/`. Pubblicato `63ec124`, Vercel riuscito Ar3Ndb2RKVstVZ9zcRkJtTXbW8NU; template online identico e articolo Lombardia aggiornato. Dodici casi su HTML/RPC pubblicati con annunci reali passati: Chromium1440/320 e WebKit390, quattro articoli. Funzione DB identica al codice testato. Lavoro nel checkout Vetrina separato, nessun file fiere modificato.

- **Vetrina, preferenza colori/blog del 18/10:** mantenere il dorato luminoso dei pulsanti anche nella schermata aperta: conferma con sfumatura oro/arancio, scelta attiva e dettagli coordinati. Vantaggio visibile: priorità negli spazi pubblicitari del blog; spiegazione apribile: prima dei gratuiti, a rotazione fra Vetrine e secondo la zona dell’articolo. CSS Vetrina2. Solo dashboard/CSS, più questo registro; lavorazione in checkout isolato `Documents/subingresso-vetrina-oro-20261018` per preservare la ricerca fiere concorrente. Pubblicato `8c996d7`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/3jf4BZ2m5zGNuVwGyAnZup5wiURr); HTML/CSS online identici. Test dialog locale/HTML pubblicato con backend simulato Chromium1440/820/320×568 e WebKit390 e prezzi/Stripe passati; screenshot320 verificato, nessuna modifica a fiere/pagamenti. Scansione segreti eseguita riusando il binario principale: nessun rilievo. Prove `Documents/vetrina-oro-blog-20261018/`.

- **Conversione Vetrina, 18/10:** revisione autorizzata di presentazione/percorsi: «Promuovi» visibile su telefono; scelta durate e conferma con totale/pagamento unico sempre visibili; statistiche/benefici/sconto più chiari nel solo passo finale di pubblicazione; ritorno da Stripe con azione e scelta diretta con un solo annuncio. Prezzi, gratuito e backend invariati. Analisi/fonti/limiti `data/CONVERSIONI_VETRINA_20261018.md`; prove `Documents/conversioni-subingresso-20261018/`. Storico DB:17 sessioni live failed21/04–12/09, zero succeeded reali; unico succeeded di prova, non prova di carte rifiutate o cause dell’abbandono. Aumento ricavi da misurare. Pubblicato `27db5ad`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/F4Sjefz7vfDLuTnLYEu4CyjPniab); dashboard/vendi/CSS/JS online identici. Test prezzi/Stripe, wizard, account e statistiche passati; dialog anche sull’HTML pubblicato Chromium1440/820/320×568 e WebKit390/320, con backend simulato e font reale WebKit. Nessun acquisto/invio/annuncio reale di prova. Backup tag/branch remoti validi, consueto errore cleanup tag PowerShell.

- **Fiere, preferenze permanenti del 18/10:** senza articoli selezionati, area affinità vuota: niente riquadro, testo «Scegli articolo» o comando invisibile; il voto torna alla selezione. Conservare tutti i materiali raccolti nelle nostre ricerche: dati, fonti/URL, originali disponibili, testi, criteri, valutazioni, esclusioni, errori, limiti e verifiche. Dati e audit nel Git; originali fuori dal repository pubblico. Dopo nuove ricerche eseguire `python scripts/backup-fiere-research.py` e registrare esito/percorso: crea una nuova copia locale in `Documents/backup-subingresso/ricerche-fiere-<UTC>` con manifest e verifica SHA256 di ogni file, senza cancellare/sovrascrivere gli archivi precedenti. Include guide regionali e relativi materiali in Temp. Nessuna attività periodica aggiunta.
- **Verificato il 18/10:** affinità vuota pubblicata `9add5cf`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/2KU746tzTMa54p62ms1zqMbRJ5u7); HTML/JS/catalogo/profili online identici. Suite affinità locale/online e ricerca articoli locale passate Chromium1440/820/320×568 e WebKit390; selezione, ultima rimozione, deseleziona/reset/ricaricamento/carica altri, motivi e fonti conservati. JS76, CSS29/JSON52 invariati. Copia locale conclusa `Documents/backup-subingresso/ricerche-fiere-20261017-234704` (nome UTC): **26.827 file, 5.250.439.854 byte, tutti verificati SHA256, zero errori**; manifest con percorsi/impronte e propria checksum. Materiali disponibili, senza ricostruire quelli mai salvati; stesso computer, non backup esterno. Prove in `Documents/verifica-affinita-vuota-fiere-20261018/`, inclusi `pubblicazione.json`, `verifiche.json`, `backup-verificato.json`. Backup interrotto/ripreso nella stessa cartella per velocizzare e includere guide/QA: nessun originale eliminato. Consueto errore cleanup tag PowerShell, checkpoint remoto valido.

- **Revisione affinità articoli:** 35 tipologie: aggiunti abbigliamento vintage, libri antichi, cioccolato e olio. Profili verificati su fonti degli organizzatori per18 fiere in `data/fiere-affinita.json`, scadenza17/04/2027; copertura parziale. 9 prodotto centrale con vendita documentata,8 tema coerente con prodotto documentato,7 complementare,6 presenza generica o condizione precisa; eliminato il6 automatico per famiglie vicine. Condizioni in anteprima e dettaglio, provenienza e fonti apribili; negativi soltanto con esclusioni esplicite recenti, altrimenti Da valutare. Esempi: Forlì vintage9/abbigliamento generico6 «Vintage o remake»; elettronica usata non implica usato generico; Ortogiardino non eredita alimentari da Cucinare. Nuovo test151.270 coppie e quattro formati, regressioni affinità/articoli/affluenza/pagine, calendario320, settori e sintassi passati localmente. Cache JS75/CSS29/JSON52. Originali/limiti `Documents/ricerca-affinita-fiere-20261017`:16 fonti,15 download200, Olio Capitale403 diretto ma pagina primaria leggibile via web. Pubblicato `35d27cf`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/DJxc2iwEKCpp9BjEw9DWo7qJ9Sti); HTML/JS/CSS/catalogo/profili online identici. Test ricerca e affinità passati anche online su Chromium1440/820/320 e WebKit390, incluse varianti6/9, condizioni, fonti, selezione multipla e colori. Prove in `Documents/ricerca-affinita-fiere-20261017/online` e `pubblicazione.json`.
- **Filtri compatti pubblicati:** `a98f526`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/BWxv1zQ4PJY93gWFshv1v9ocgswA); HTML/CSS online identici, test articoli online passato nei quattro formati/browser. Circa218px risparmiati alla larghezza della schermata inviata,168px a390; dettagli e misure sotto. Lavoro di spaziatura concluso.
- **Spazi filtri fiere:** richiesta da schermata: campi in2×2 dove c’è spazio; etichetta accanto al campo sotto520px e nei pannelli tablet stretti. Ridotti margini/padding/etichette; controlli e mesi ≥44px, menu multiplo largo quanto il gruppo. Confronto sette casi: risparmio214px desktop1440,218px a697,168px a390,24px a320; nessun overflow, suite articoli quattro formati passata. CSS28, JS74/JSON51 invariati; prove `Documents/verifica-spazi-fiere-20261017/`. Prima fase dedicata agli spazi; successiva revisione dei voti registrata sopra.
- **Affinità articolo nelle anteprime:** stima prudente su10 a destra, colori rosso→verde, motivi/fonti apribili. 8 articolo citato/offerta mirata, 7 citato tra merci diverse, 6 famiglia vicina; senza elementi «Da valutare». Voto2 solo con esclusione esplicita globale, fonte entro180 giorni ed edizione attuale/futura; niente negativi da tema/nome, dati mancanti, regole per singoli operatori/aree, vecchie edizioni o divieto di sola somministrazione. Con più articoli voto migliore in anteprima e tutti i singoli nel dialog; stima tematica, nessuna previsione di incassi/ammissione. Filtri e catalogo invariati. Pubblicato `bf960e2`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/4Dd19MfhDceoL3Br6qebWVKzbb73); HTML/JS/CSS/catalogo identici. Test133.982 coppie e dedicato locale/online Chromium1440/820/320×568 + WebKit390 passati, regressioni articoli/affluenza e suite320 passate. Unica fiera oggi con voti2 Natale Cento, restrizione regionale riconfermata HTTP200; rosso/incertezza testati con fixture isolate, senza modificare i dati reali. Prove `Documents/verifica-affinita-fiere-20261017/`.
- **Tipologie articoli fiere:** 31 tipologie in sei gruppi e selezione multipla, nuovo filtro tra «Cosa vendi» e «Tipo di evento». OR tra articoli, AND con gli altri filtri; contatori, rimozioni singole, deseleziona tutte, URL/ricaricamento/reset. Macrosettore restringe le scelte e scarta quelle incompatibili. Classificazione browser/SSR solo dai settori documentati, con esclusioni: 1.512/4.322 schede; intimo/detergenti senza riscontri. Catalogo e ID invariati. Pubblicato `663df3f`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/8NTFyGveCu85Amu589Fu5YYDZGem); HTML/JS/CSS/catalogo online identici. Test dedicato locale/online Chromium1440/820/320×568 e WebKit390 passato; suite generale cinque formati, pagine4322/sitemap1625, settori e sintassi passati. Riga articoli verificata anche sulla pagina autonoma pubblica. Prove in `Documents/verifica-filtri-articoli-20261017/`, dettaglio `data/FIERE.md`.
- **Richiami annunci nel blog:** su richiesta, “Posteggi disponibili adesso” deve lasciare visibile il testo seguente. Tre anteprime dedicate con foto 56 px, titolo/località/prezzo; affiancate da 768 px, tre righe brevi sotto. Niente schede complete nel testo. Priorità/indicazione Vetrina, filtro regionale, link e tracciamenti conservati; rimossa lettura profili non più usata. Pubblicato `f0e8572`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/AWztUNie2PFThoB37ngoXvtND1cF), template online identico. Dieci casi locali e dieci online, due articoli/cinque formati-browser passati: riquadro 140 px computer/tablet, 320–338 px telefono, testo seguente visibile anche a 320×568. Verifica aggiuntiva con annunci reali a 1440/390 riuscita. Sintassi/acquisizione/qualità dati passate; prove e confronto in `Documents/blog-promo-compatta-20261017/`. Nessuna scrittura/email di prova.
- **Avvisi bandi: account obbligatorio.** Su richiesta, blog e pagine bando aprono la registrazione standard; chi ha un account accede. Attivazione dopo autenticazione, email ricavata dal server. Invii e Scout limitati agli indirizzi con account esistente tramite vista privata `registered_bando_alerts`; inserimenti diretti pubblici revocati. DB prima/dopo: 32 iscrizioni conservate, 12 con account e 20 escluse dagli invii finché non si registrano; nessun account creato automaticamente. Patch e quattro funzioni pubblicate; codice `effb12b`/`35da1fd`, cache avvisi2, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/Fs4xUe5bYZu4E8fMvwXYg17TCKd9). Sintassi, qualità dati, acquisizione e test dedicati Chromium 1440/320×568 + WebKit390 passati; sei percorsi su HTML online, account/email simulati, nessun invio reale. Endpoint live senza account/chiave pubblica: 401; vista destinatari non pubblica. Modulo scorrevole su telefoni bassi; JS online identico. Prove in `Documents/verifica-avvisi-bandi-20261017.{cjs,json}`; overflow circoscritto a form/modal, testi lunghi preesistenti dell'articolo fuori perimetro. Backup tag/branch remoti validi; cleanup tag con errore PowerShell noto.
- **Dashboard:** eliminato su richiesta il riquadro superiore “Il tuo annuncio”, con carousel, totali e domanda regionale. Preferenza: non riproporlo; statistiche nel pannello Performance posteggi e gestione nell'elenco annunci.
- **Statistiche posteggi:** riepilogo/grafico solo nel periodo 7/30/90 e annuncio selezionati. Preferenza corrente: grafico sopra i quattro riquadri, etichette e numeri senza sottotitoli; spiegazioni/storico solo nella voce apribile. Messaggi ricevuti distinti dai click telefono/WhatsApp e aperture chat; visualizzazioni = anteprime + aperture, non persone uniche. Patch DB applicata e verificata su 112 profili; dettagli/test in `istruzioni.md`. Email settimanali ancora da correggere.
- **Fiere:** 7.451 schede; ricerca approfondita conclusa e verificata online per 69 province, 41 da fare su 110. Manutenzione periodica distinta dalla ricerca conclusa; schede importate non equivalgono a ricerca approfondita.
- **Affluenza:** valutare soltanto il pubblico, senza giudizi su vendite, redditività, fama o anzianità. Fasce editoriali sulla media giornaliera di ingressi/presenze: bassa <1.000; media 1.000–<5.000; alta 5.000–<20.000; molto alta ≥20.000. Fonti, unità, anno/periodo, stime/dichiarazioni e criteri apribili. Non convertire persone uniche, passaggi, celle telefoniche o pubblico dell'intera festa in affluenza dei banchi; dati insufficienti senza fascia, mai bassa/media per assenza di prove.
- **Copertura affluenza:** 40 ID verificati in due gruppi da 20; 21 resoconti e 19 esclusioni motivate, cinque bollini (tre alta, due molto alta), 16 senza fascia. Copertura parziale. Archivio `data/fiere-affluenza.json`; originali/limiti in `Documents/ricerca-affluenza-fiere-20261017`, secondo gruppo in `sessione-02/`; dettaglio `data/FIERE.md`. Merate: refuso ottobre risolto col programma di dicembre. Ortogiardino–Cucinare, Natale cittadino, dati parziali e stima Bolzano controversa senza bollino. Pro Cantù HTTP 200 al ricontrollo; alternative e altri limiti registrati.
- **«Quanto è conosciuta» sospeso:** rimossi filtro e bollini da anteprime, popup, dialog e pagine autonome. Il parametro storico `rinomatezza` non filtra; gli altri filtri funzionano. Valutazioni e prove conservate per eventuale ripristino; sospendere nuove assegnazioni. Le preferenze del 16 ottobre sotto sono storiche.
- **Filtri:** «Tipo di evento» tra i principali sotto «Cosa vendi», fuori da «Altri filtri» e dal suo conteggio; opzioni/comportamento conservati. «Azzera filtri» accanto a «Quando» sostituisce «Tutto l'anno». Mappa senza puntini finché non si seleziona almeno un mese, anche con altri filtri o zoom; ultimo mese deselezionato/reset la svuotano. URL con mesi conserva la selezione; elenco consultabile senza mesi. Note/legenda sotto i filtri rimosse. Mesi Gen–Dic: due righe da sei, tre da quattro sotto 360 px; pulsanti ≥44 px, nomi completi accessibili.
- **Anteprime e date:** costo soltanto se disponibile, senza «Costo banco da verificare»/«Costi: vedi scheda»; note nella scheda. Nessun bollino per valutazione mancante né riga vuota. Giorno settimanale per fiere di 1–2 giorni, stesso formato in elenco/dettaglio; da 3 giorni e per periodi indicativi formato precedente. Niente diciture di stato accanto alle date: piccolo ! apribile al tocco/tastiera per riconferme, ricorrenze, periodi ed edizioni passate.
- **Pagine autonome:** `/fiere/<id>` e archivio `/fiere/elenco`, stessi dati del calendario, apertura rapida nel dialog conservata. Schede incomplete consultabili ma noindex finché manca contenuto operativo sufficiente; sitemap automatica per le altre. Non certificano una ricerca provinciale conclusa.
- **Blog regionale fiere:** serie 10/20 dopo Umbria; mancano Abruzzo, Basilicata, Calabria, Campania, Lazio, Molise, Puglia, Sardegna, Sicilia, Valle d'Aosta. Già presenti Lombardia, Veneto, Piemonte e le sette regioni registrate sotto.
- **Ultime cache registrate:** fiere JS73/JSON51/CSS26, pagina fiera CSS2. Sono riferimenti storici: cercare sempre le versioni reali prima di modificare.

## Registro recente: pubblicazioni e verifiche

19/10/2026 — Preferenza profili: registrazione normale come prima e prioritaria;
organizzatore scelto esplicitamente, con informazioni aggiuntive e approvazione.
Nel profilo selettore compatto Normale a sinistra (sempre all’apertura),
Organizzatore a destra, indicatore scorrevole; clic/swipe/tastiera. Organizzatore:
stato, note e accesso al percorso completo esistente, stesso account; ritorno
al normale dall’area dedicata. Rimossi i richiami duplicati dal percorso normale.
Campi conservati tra schede, avviso prima di abbandonare modifiche, richieste
vecchie ignorate e pulizia su logout/cambio account.172 verifiche Chromium1440/
820/320 e WebKit390 e regressioni eventi/usabilità68/account6/admin6 passate.
Nessuna modifica auth/DB/pagamenti né prova con scritture reali.
Dettagli data/ORGANIZZATORI_EVENTI.md; prove
Documents/verifica-selettore-profili-20261019.
Pubblicato3c70f4b, Vercel
[riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/FxD33Ev9aESEvqzazXhwT6u1XhBs).
Quattro asset online identici ai blob Git e172 verifiche sugli asset pubblicati
con backend simulato; tre prove browser reali di logo/font/accesso e modulo
normale riuscite. Nessuna scrittura reale; schermate e resoconto nella cartella.

Le righe seguenti accorpano i resoconti ripetuti, senza costituire nuovi test. Nei relativi interventi: catalogo/dati precedenti e modifiche estranee conservati; asset pubblici confrontati col commit; Vercel riuscito/READY. Suite calendario su cinque formati/browser e verifiche Chromium computer/320 px e WebKit 390 px passate, salvo specifiche sotto. Backup remoti validi; il noto errore PowerShell nel cleanup dei tag non compromette il checkpoint.

| Data/intervento | Esito e dettaglio specifico | Cache | Commit / deploy Vercel |
| --- | --- | --- | --- |
| 17/10, rimozione riquadro annuncio | Eliminata tutta la sezione superiore “Il tuo annuncio”, incluso caricamento e codice dedicati. Sintassi e suite statistiche Chromium 1440/320 + WebKit 390 passate; HTML online identico al commit, assenza riquadro/caricamento e presenza statistiche/elenco verificate. Vercel riuscito; backup remoto verificato. | inline | `4fc8f66` / [J86R1MRxW4CE4UZ1Dv883fsjiRhu](https://vercel.com/kycykuardit-9234s-projects/subingresso/J86R1MRxW4CE4UZ1Dv883fsjiRhu) |
| 17/10, pulizia statistiche | Grafico sopra i quattro riquadri, solo etichette e numeri; spiegazioni/storico nella voce apribile, rimossi testi ripetitivi e consiglio generico. Test numeri/grafico e browser Chromium 1440/320 + WebKit 390 passati localmente e sull'HTML pubblicato con backend simulato; dashboard online identica, Vercel riuscito. Backup remoto verificato. | inline | `c0eaa91` / [9Je1CvpUeYma6xr9CAs4ES3NsMRH](https://vercel.com/kycykuardit-9234s-projects/subingresso/9Je1CvpUeYma6xr9CAs4ES3NsMRH) |
| 17/10, statistiche posteggi | Numeri solo nel periodo; messaggi ricevuti, clic telefono/WhatsApp, aperture chat e nuovi preferiti distinti. RPC DB verificata su 112 profili con ROLLBACK e confini UTC; test numeri/grafico, Chromium 1440/320 e WebKit 390 locali e sull'HTML pubblicato con backend simulato, regressioni Vetrina/account passate. Dashboard online identica al commit, Vercel riuscito. Backup remoto valido; prima prova messaggi adattata alle guardie che forzano la data corrente, senza modificarle né inviare messaggi reali. | inline | `831072d` / [JCceebVBYho3MyB4vttxai8APFXA](https://vercel.com/kycykuardit-9234s-projects/subingresso/JCceebVBYho3MyB4vttxai8APFXA) |
| 17/10, affluenza gruppo 2 | 12 tradizionali, 4 mercatini, 4 espositive; 8 nuovi resoconti, un nuovo bollino Millenaria almeno alta, 7 senza fascia, 12 esclusioni. Build, settori, affluenza, 4.214 pagine e suite generale passati. Tutte le 20 pagine e gli 8 resoconti/fonti verificati online; test affluenza riuscito, 8 fonti principali HTTP 200; catalogo/registro/HTML/JS identici. | JS69/JSON49 | `73aadd8` / `dpl_ALkaRg8Dqny9ekQQTpmoGpKCgK6K` |
| 17/10, affluenza gruppo 1 | 20 casi: 13 resoconti, 4 bollini (2 molto alta/2 alta), 9 non confrontabili, 7 esclusioni. Anteprime/popup/dialog/pagine allineati; campi precedenti delle 4.214 fiere conservati. Build, settori, pagine e test dedicati locali/online passati; 13 pagine verificate, fonti e interazioni senza overflow; testo bianco ≥4,90:1. Backup tag e branch remoti; dettaglio/limiti in `data/FIERE.md`. | JS68/JSON48/CSS24; fiera CSS2 | `d3d36e2` / `dpl_7yVZ4YRacJNdyDuBU3gY69TLw8MF` |
| 17/10, Tipo di evento | Sintassi, suite Chromium 320 e verifiche online 1440/320/WebKit 390: posizione, conteggio, URL/ricaricamento, reset, overflow. Catalogo invariato, HTML/JS identici. | JS66 | `5fcfb38` / `dpl_3UK2tthZQbU29FWa4mDWxobBohdK` |
| 17/10, sospensione notorietà | Sintassi, suite cinque formati/browser, test dedicati e 4.102 pagine passati localmente; online vecchi URL, filtri combinati, mappa, schede e reset. HTML/JS identici, catalogo/fonti/ricerca Rimini conservati. | JS65 | `36dc55b` / `dpl_EKVY7e3brYd6skzVy21Y4PjZJR3h` |
| 17/10, mappa/reset | Sintassi e test valutazioni locali/online: mappa vuota, primo/ultimo mese, filtri combinati, URL, zoom, reset; dati pubblicati usati nelle prove. Catalogo e ricerca Rimini concorrente conservati. | JS63/CSS23 | `3d4d479` / `dpl_Eg5Wdjgf3trQJXGAtuujxsCn1SXM` |
| 17/10, filtri/mesi | Sintassi, suite generale e test valutazioni locali/online passati; catalogo invariato. | JS62/CSS22 | `30c4955` / `dpl_8Aztctw3oDCKzs58ZFVE6nvvgTUh` |
| 16/10, pagine fiere | `50160c9`: 3.972 pagine, 1.292 schede in sitemap + archivio. Suite calendario e test pagine locali/online: senza JS, dialog senza navigazione, link dettaglio, overflow, sitemap, escaping, 404. | — | `50160c9` / `dpl_BmDkYWKAMdvJjpm7aJbTsqP4qmpD` |

### Blog regionale — pubblicazioni del 16 ottobre 2026

Per ciascuna regione: assenza nella serie controllata live; due richiami discreti al calendario regionale; pubblicazione, testo/titolo/meta/canonical, indice, sitemap e filtro/calendario verificati su Chromium 1440/390 px senza overflow. Articoli precedenti conservati; nessuna modifica al codice o ai dati delle fiere. Testi, fonti, riscontri e anteprime in `Documents/articoli-subingresso/`: prefisso uguale allo slug `migliori-fiere-REGIONE`, script `REGIONE-lavorazione.cjs` (per Friuli: `friuli-venezia-giulia`). Backup remoti verificati; cleanup tag con errore PowerShell noto. In Friuli il log si è interrotto sullo stderr di git, tag valido; in Trentino corretto soltanto l'URL atteso dal controllo (spazio `+`).

| Regione / articolo | ID | Contenuto e cautele specifiche |
| --- | --- | --- |
| [Umbria](https://subingresso.it/blog?post=migliori-fiere-umbria) | `61741baf-f6cf-4048-a699-9b1916f0a9e0` | «Le 10 migliori fiere in Umbria da conoscere se fai l’ambulante», 1.544 parole, 10 tradizionali nelle due province, 8 fonti raggiungibili; preservati 89 articoli. Spunta Perugia domanda scaduta 1° luglio, San Florido 14 settembre, regola ordinaria San Feliciano 31 ottobre. Santo Manno 2025 non esteso al 2026. Marsciano 410 scartato; PDF Gubbio 403 diretto confrontato con testo ufficiale indicizzato e pagina comunale con allegati raggiungibile. |
| [Marche](https://subingresso.it/blog?post=migliori-fiere-marche) | `f904bde5-356f-41db-bae5-4e0d73e6df8b` | «Le 10 migliori fiere nelle Marche da conoscere se fai l’ambulante», 1.699 parole, 5 province, 9 tradizionali + Acqualagna specializzata, 12 fonti raggiungibili; preservati 88 articoli. San Crispino assegnazioni avviate/spunta da aggiornare; Grottammare domanda scaduta distinta da graduatoria senza posto; Sant’Agostino fine agosto per fonti discordanti. URL rimossi Ancona/Porto Sant’Elpidio sostituiti, parametri Pesaro necessari conservati. |
| [Liguria](https://subingresso.it/blog?post=migliori-fiere-liguria) | `348db8f1-c562-4c32-a83a-6db8ffa43e21` | «Le 10 migliori fiere in Liguria da conoscere se fai l’ambulante», 1.732 parole, 10 fiere/4 province, 14 fonti raggiungibili; preservati 87 articoli. Sarzana 13–15 marzo 2027 da scheda comunale dopo 404; Chiavari luglio 410 sostituito con graduatorie, senza orari rimossi. Spunta anticipata Sant’Agata, domanda Lavagna scaduta, accesso pubblico gratuito distinto da quote espositori. |
| [Friuli-Venezia Giulia](https://subingresso.it/blog?post=migliori-fiere-friuli-venezia-giulia) | `02e46433-b91d-4f23-b1da-9b170155f803` | «Le 10 migliori fiere in Friuli-Venezia Giulia da conoscere se fai l’ambulante», 1.711 parole, 8 tradizionali + Fiera dei Cesti/Gusti di Frontiera, 11 fonti raggiungibili; preservati 86 articoli. Codroipo mercato 25 ottobre, Trieste posti residui condizionati, date/termini trascorsi distinti; Udine/Cervignano ricorrenze senza date inventate. PDF Cervignano con certificato scaduto sostituito da copia comunale attuale; Gusti turismo 404 da portale turistico comunale. |
| [Trentino-Alto Adige](https://subingresso.it/blog?post=migliori-fiere-trentino-alto-adige) | `b21014a9-6e8e-46d9-a7d6-5568c22bac58` | «Le 10 migliori fiere in Trentino-Alto Adige da conoscere se fai l’ambulante», 1.727 parole, 8 fiere/mercati tradizionali + 2 natalizi, 15 fonti raggiungibili; preservati 85 articoli. Date/termini verificati; Santa Lucia domanda entro 31 ottobre distinta dalle selezioni natalizie chiuse. |
| [Toscana](https://subingresso.it/blog?post=migliori-fiere-toscana) | `8ac5a320-3276-4db9-a7d5-bb6ed5d4a748` | «Le 10 migliori fiere in Toscana da conoscere se fai l’ambulante», 1.755 parole, 10 fonti ufficiali raggiungibili; preservati 84 articoli. Già presenti Lombardia/Veneto/Piemonte/Emilia-Romagna. Distinti festa/mercati Pontedera-Dicomano, settori Arezzo, scadenza Scandicci trascorsa. |
| [Emilia-Romagna](https://subingresso.it/blog?post=migliori-fiere-emilia-romagna) | `2f1ee0ac-423f-4f71-9cbe-962db6ebb7d1` | «Le 10 migliori fiere in Emilia-Romagna da conoscere se fai l’ambulante», circa 1.700 parole semplici, 10 eventi/fonti ufficiali; preservati 83 articoli. Già presenti Lombardia/Veneto/Piemonte. Festa/mercato ed esempi 2026 distinti; Sant’Agata scadenza trascorsa. Link comunale Guastalla inattivo sostituito da organizzatore. |

## Indice

- [Informazioni tecniche e regole operative](#parte-a)
- [Attività, priorità e storico delle fiere](#parte-b)
- [Coordinamento storico](#coordinamento-storico)

<a id="parte-a"></a>

# Parte A — Informazioni tecniche e regole operative

## Identità, servizi e avvio sessione

Marketplace italiano di **subingresso e compravendita di posteggi mercatali/licenze ambulanti su area pubblica**; esclusi ristoranti, bar e normali attività commerciali. Lessico: posteggio mercatale, licenza ambulante, commercio su aree pubbliche, subingresso, autorizzazione amministrativa. Niente promesse di «annunci verificati», «centinaia di annunci», «migliori offerte» senza prove reali.

Repo locale `C:\Users\utente\Desktop\Ardit\subingresso.it` (il vecchio `Desktop\subingresso.it` è superato dal percorso rilevato il 6 ottobre); GitHub pubblico `https://github.com/kepload/subingresso`; produzione `https://subingresso.it`. HTML statico, JS vanilla, Tailwind precompilato; Vercel con deploy automatico al push, Supabase `mhfbtltgwibwmsudsuvf` per DB/backend, Resend via Edge Functions, Stripe per Vetrina.

Avvio, backup, Git, sicurezza e stile delle risposte: seguire la fonte comune
`AGENTS.md`, importata da `CLAUDE.md`. Letture mirate al tema, senza obbligo di
leggere tutto.
`supabase/.temp/cli-latest` era già modificato alla ricognizione: preservarlo
come le altre modifiche estranee al lavoro corrente.

## Mappa di file e pagine

Nessun framework frontend/build applicativo tradizionale; molta logica inline in dashboard, vendi, messaggi, valutatore e modifica-annuncio.

| File/area | Funzione e vincoli |
| --- | --- |
| `*.html`, `api/` | Pagine statiche e funzioni Vercel/SSR. `index.html` home; `annunci.html` ricerca/filtri/card/preferiti/alert. |
| `api/annuncio.js` | Dettaglio **SSR di produzione** `/annuncio?id=...`, template HTML inline. Modificare `annuncio.html` non aggiorna il live. |
| `annuncio.html` | Duplicato client/orfano escluso dal deploy: mantenerlo nella `.vercelignore`, allineare gli script quando necessario. |
| `vendi.html`, `modifica-annuncio.html` | Wizard critico 5 step per pubblicazione, modifica annuncio esistente. |
| `dashboard.html` | Utente/admin: annunci, profilo, statistiche, blog, segnalazioni, sicurezza, bandi, strumenti admin. Parte dell'header è manuale: controllarla se cambia la navigazione. |
| `messaggi.html`, `profilo.html?id=...` | Chat acquirente-venditore/supporto; profilo pubblico e annunci attivi. |
| `valutatore.html`, `report.html` | Valutazione indicativa e report. |
| `blog-template.html`, `api/blog.js` | Lista/dettaglio SSR; API legge/adatta il template, che contiene anche rendering client. |
| `api/annunci-citta.js` | Landing SEO città/capoluoghi, fallback geografici e dati strutturati. |
| `api/bandi/[slug].js` | Landing SSR dei bandi approvati. |
| `grazie.html` | Esito pagamento Vetrina. |
| `reset-password.html`, `unsubscribe.html` | Flussi account/email. |
| `privacy.html`, `termini.html`, `contatti.html`, `404.html` | Informazioni/legali/errori. |
| `js/supabase-config.js` | Inizializza client Supabase. |
| `js/data.js` | `MERCI`, `REGIONI`, comuni, `buildCard()`, `escapeHTML()`, `formatPrice()`, telefono, toast, preferiti, visualizzazioni card. Cercare qui prima di duplicare helper. |
| `js/auth.js` | Sessione, signup/login, profilo, modal, acquisizione, popup, logout. Cache con dati utente sempre separate per `user_id`, mai chiavi globali con nome/telefono/bozze. |
| `js/ui-components.js` | Header/footer condivisi. |
| `js/pages/annunci.js`, `annuncio-detail.js` | Lista, filtri, venditori, dettaglio, contatti, analytics, correlati, avvio chat. Allineare dettaglio con `api/annuncio.js`, soprattutto script/SEO/JSON-LD. |
| `js/page-view-tracker.js`, `blog-tracker.js` | Tracciamento pagine e conversioni blog. |
| `js/blog-generator.js`, `moderation.js` | Generazione/pubblicazione articoli admin; moderazione client oggi non inclusa negli HTML. |
| `css/tailwind.css` | CSS già compilato. |
| `data/comuni.json` | Circa 7.904 comuni; asset server per geografia/validazione slug. Non sostituire senza verificarne struttura e consumatori. |
| `supabase/functions/`, `scripts/` | Edge Functions Deno; backup/build/generazione. |
| `SETUP_*.sql/.md`, `PATCH_*.sql` | Setup e patch/migrazioni idempotenti; non garantiscono l'intero schema live. Confrontare Supabase prima di cambi importanti; `setup-database.sql` può essere obsoleto. |
| `vercel.json` | Rewrite/redirect/security header; `cleanUrls` attivo, link interni senza `.html`. |

Rewrite: `/sitemap.xml` → `/api/sitemap`; `/annuncio` → `/api/annuncio`; `/annunci/:citta` → `/api/annunci-citta`; `/blog` → `/api/blog`; `/bandi/:slug` → `/api/bandi/:slug`.

## Dati e flussi critici

Tabelle: `profiles` (profili/admin); `annunci` (inserzioni, moderazione, immagini, scadenza, Vetrina, metriche); `saved_listings` (preferiti); `alerts` (ricerche/avvisi); `conversazioni`, `messaggi`, `conversation_reports` (chat/supporto/segnalazioni); `blog_posts`, `blog_conversions`; `page_views`, `auth_modal_opens`, `valutatore_logs` (analytics/funnel); `payments`; `bando_alerts`, `bando_alert_log` (iscrizioni/invii); `bando_scouting_log`, `admin_briefing_state` (Scout); altre tabelle dedup/log reminder, digest, alert e statistiche.

- **Pubblicazione:** wizard raccoglie dati/foto/contatti; DB forza non admin a `pending`, trigger asincroni notificano venditore/alert. Prima di toccare wizard/trigger leggere la sezione dedicata del manuale. Durata 270 giorni da pubblicazione/rinnovo (8 ottobre); scaduti eventualmente visibili ma senza contatti, riattivabili dal proprietario via RPC.
- **Contatti/chat:** tel/email non leggibili nelle query normali; RPC `get_listing_contact()`. Conversazione creata al primo messaggio; supporto con conversazione speciale.
- **Vetrina:** `create-checkout-session` → Stripe Checkout → `stripe-webhook`, tabella `payments`, campi `featured*` annunci. Aumenta visibilità, non prolunga scadenza.
- **Blog/SEO:** `blog_posts` → template/API SSR; corpo HTML sempre DOMPurify. Sitemap, landing città, JSON-LD, canonical e SSR sono funzionali al prodotto. JSON-LD annuncio sempre con immagine, fallback brand se mancante; canonical, Open Graph, title/H1 e link interni allineati. `api/sitemap.js` include statiche, annunci, blog e landing geografiche.
- **Bandi:** iscrizioni regionali, `scout-bandi` Gemini + verifica HTTP, approvazione/scarto admin, `bando-action` pubblica/notifica. Landing collega bando/annunci regionali/valutatore; diagnosi nel playbook AI Scout di AGENTS.
- **Email:** auth, welcome, alert, messaggi, report, digest, statistiche, reminder, bandi, anomalie. Trigger solo asincroni `pg_net`: i vecchi webhook Supabase sincroni bloccavano gli insert per molti secondi.

## Edge Functions Supabase

Funzioni presenti alla ricognizione, sotto `supabase/functions/`:

| Area | Funzioni |
| --- | --- |
| Auth/email | `register-bypass`, `send-auth-email`, `welcome-email`, `email-unsubscribe` |
| Annunci/comunicazioni | `notify-seller`, `notify-alert`, `notify-message`, `notify-report` |
| Ciclo annunci | `engagement-reminders`, `weekly-buyer-digest`, `weekly-seller-stats` |
| Pagamenti | `create-checkout-session`, `stripe-webhook` |
| Bandi | `subscribe-bando-alert`, `notify-bando-subscribers`, `scout-bandi`, `bando-action` |
| Admin | `admin-export-users`, `admin-recent-users`, `admin-valutatore-logs`, `admin-anomaly-check` |
| Storico/compatibilità | `grant-welcome-vetrina`; vecchia lotteria welcome rimossa dal prodotto |

Deploy singola funzione: `npx.cmd supabase functions deploy NOME --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt`. Leggere le istruzioni specifiche: alcune funzioni autenticano autonomamente; la sicurezza non dipende soltanto dal flag.

## Sicurezza, CSS/cache e bug da evitare

Regole comuni in `AGENTS.md`, sezioni «Segreti e isolamento dei dati» e
«Implementazione e verifiche»; spiegazioni e casi tecnici in `istruzioni.md`.
Non mantenere qui una seconda copia delle stesse regole o delle versioni cache.

## Attendibilità, priorità storiche e fonti

Gli snapshot di maggio (utenti, annunci, Scout e blog) sono storici, recuperabili in Git e **non attuali senza verifica live**. Orientamenti ancora utili: inventario reale inizialmente Lombardia, monitorare Scout, privacy/data audit, conversioni blog/landing regionali con inventario sufficiente, reminder scadenze, aggiornare Bolkestein. Prima di riprendere TODO storici controllare commit, dashboard e servizi.

Le istruzioni correnti dell’utente e le regole comuni in AGENTS governano il lavoro. Per verificare l’implementazione: codice/config repo e schema/config live verificati; poi manuale per architettura/motivazioni e questo registro per decisioni e storico. Numeri utenti/annunci/iscritti, versioni e TODO vanno verificati quando pertinenti al task.

<a id="parte-b"></a>

# Parte B — Attività, priorità e storico delle fiere

## Storico fiere del 16 ottobre — notorietà sospesa dal 17 ottobre

Le decisioni correnti in apertura prevalgono su questo storico. Dati/prove restano conservati; nessuna nuova assegnazione di notorietà finché sospesa.

- **Criterio originario:** Rinomata / Consolidata / Recente, neutro Da valutare senza prove; motivo/fonti apribili, filtro e revisione con scadenza. Misurava notorietà/storia documentate, rinviando compatibilità merce e giudizio commerciale. Prima copertura 41/3.972 (13 rinomate, 25 consolidate, 3 recenti), 3.931 mancanti. Prove per evento, mai informazioni mancanti = scarsa qualità. Archivio `data/fiere-rinomatezza.json`, criteri `data/FIERE.md`.
- **Estensione 41 → 400:** 17 Molto conosciuta, 380 Di lunga tradizione, 3 Nuova; 3.572 mancanti, ricerca nazionale incompleta. Registro Lombardia, calendario Piemonte 2014, verifiche mirate; Martinengo e 10 schede Antico Seriate Di lunga tradizione. Audit/fonti/esclusioni `data/fiere-rinomatezza-audit.json` e FIERE.md. Priorità utente: valutare concretamente fiere/sagre/eventi; nella scheda soltanto bollino/dicitura, senza titolo/spiegazioni; prove conservate nei dati. Altre modifiche prodotto fuori sessione.
- **Selezione nuove, 400 → 521/3.972:** aggiunte 121 valutazioni (21 Nuova, 96 Storica, 4 Molto conosciuta); 24 nuove totali, 3.451 non valutate. Screening 1.790 fonti principali, 1.711 estratte/79 errori + registri condivisi; parziale. Nuova solo da narrativa/programmi nominativi verificati, mai contatore 1/2/3 (reset/errori riscontrati); revisione 1 gennaio 2027. Anni dichiarati Liguria in `historyYears`, senza inventare edizioni/fondazioni. Precedenti 400 e altri dati conservati. Audit/esclusioni/limiti nel file audit; snapshot/riepilogo `Documents/ricerca-bollini-nuove-20261016`. Priorità utente soprattutto nuove con prove.
- **Analisi velocizzazione precedente:** 3.572 mancanti, 1.822 URL distinti, primi 10 coprono 1.267 schede. Proposta estrazione fonti condivise in blocco, abbinamento nome/comune, prova per ID e revisione dubbi; nessuna valutazione assegnata dall'analisi.
- **Testi/date:** titolo «Quanto è conosciuta»; nomi Molto conosciuta / Di lunga tradizione / Nuova / Da valutare, poi «Di lunga tradizione» → «Storica» in card/scheda/popup/filtro/legenda. Giorni settimanali per 1–2 giorni (es. Domenica 18 ott 2026; Sabato 17 ott – Domenica 18 ott 2026), invariati 3+ giorni e periodi. Niente «Da calendario», «Date pubblicate» ecc.; ! apribile per casi da riconfermare, ricorrenze, periodi, edizioni passate; dati/formati conservati.
- **Presentazione:** niente costi segnaposto o «? Da valutare» e righe vuote; note costo nella scheda, stato interno/filtro/legenda allora conservati. Rimossa sottolineatura a pallini dei bollini cliccabili. Bollini in alto a destra accanto al titolo, senza sovrapposizioni; pieni con testo/simboli bianchi, testo 11 px, minimo 24 px invece di 36, spazi/margini ridotti. Verde → oliva per Storica → arancione scuro quasi rosso per Nuova supera blu/viola e divieto rosso; poi colori attenuati salvia/oliva/terracotta, contrasto minimo 4,83:1. Criteri/dati invariati.

Verifiche storiche: dati precedenti delle 3.972 schede conservati; sintassi/build/settori/integrità, suite generale cinque schermi/browser e test dedicati Chromium computer/telefono + WebKit locali/online passati ove registrati. Per nuove 521 controlli locali; posizioni/colori verificati Chromium 1440/320 e WebKit 390. Pubblicazioni sotto con Vercel riuscito e asset/catalogo interessati identici al commit; nessun errore/overflow. Date provate per 1/2/3+ giorni e sei stati, ! con tocco/tastiera.

| Intervento | Cache storica | Commit verificato online |
| --- | --- | --- |
| Prime 41 valutazioni, fonti/filtri/mappa/URL | JS50/catalogo41/CSS14 | `93fbcc1` |
| Giorno settimanale elenco/dettaglio | JS51 | `8e13acc` |
| Testi e ! date | JS52/CSS15 | `b9aac0b` |
| Estensione 400 e scheda essenziale | JS53/catalogo42 | `23627c1` |
| Anteprime costo/bollino | JS54 | Controlli locali cinque schermi/browser e bollini |
| Sottolineatura rimossa | CSS16 | — |
| Nomi/colori/dimensioni | JS55/CSS19 | — |
| Posizione in alto a destra | JS56/CSS20 | — |
| Colori attenuati | CSS21 | — |
| Selezione nuove, 521 valutazioni | JS57/dati43 | Controlli locali build/settori/integrità/bollini/suite generale |

## Come scegliere le priorità

**Obiettivo:** massimo avanzamento nel tempo disponibile, confrontando beneficio atteso, rapidità e ore necessarie. 🔴 alta: prima; 🟠 media: dopo; 🟢 bassa: rimandabile. Rivalutare i colori quando cambiano tempi/opportunità/benefici: utilità generale non significa urgenza. Spuntare solo quando tutti gli interventi della voce sono conclusi.

Valutazione dell'8 ottobre 2026: privilegiare utenti pertinenti, contatti e conservazione degli annunci attivi; privacy/sicurezza alte per utenti e fiducia. Sono stime da verificare, senza presumere traffico/conversioni aggiornati. Completare prima la versione essenziale, evitando rifacimenti generali.

## 💶 Crescita e autonomia economica

**Obiettivo:** reddito personale sostenibile. Visite/iscritti devono produrre annunci pertinenti, contatti e clienti paganti. Misurare incassi, costi, rimborsi e ore; il valore dei posteggi non è ricavo del sito. Netto mensile desiderato e orizzonte ancora da definire con Ardit; nessuna data garantita.

- [ ] 🔴 Definire il traguardo economico e fare i conti sui ricavi necessari — netto desiderato, costi e accantonamenti fiscali/contributivi col commercialista; clienti necessari per offerta con prezzi/margini verificati. Distinguere ricavi occasionali/ricorrenti; tabella mensile semplice, senza nuova dashboard.
- [ ] 🔴 Verificare cosa gli utenti sono disposti a pagare — circa 10 venditori/acquirenti/professionisti: problemi, alternative, ragioni per pagare o meno. Una sola offerta per prova; acquisti reali, non solo interesse/questionari. Fissare durata, ore massime e criterio di continuazione/stop prima di partire.
- [ ] 🔴 Concentrare acquisizione e offerta in una prima zona — scegliere con dati una provincia/gruppo di mercati inizialmente lombardi, con domanda e annunci reali. Acquisizione diretta tramite operatori/associazioni/comunità, messaggi e canali appropriati; aiutare a pubblicare annunci completi. Misurare annunci attivi, richieste pertinenti e ritorni, poi replicare vicino. Niente annunci copiati/contatti importati senza autorizzazione.
- [ ] 🔴 Verificare e migliorare la vendita della Vetrina già esistente — percorso scelta/pagamento/attivazione, acquisti e contatti agli annunci promossi. Una modifica per volta a presentazione/pacchetto/prezzo; benefici dimostrabili, niente garanzie di vendita o contatti. Verificare valore prima di aumentare traffico.
- [ ] 🔴 Collegare i contenuti più utili a un'azione concreta — dalle pagine già visitate: cercare posteggio, pubblicare, iscriversi ad avvisi pertinenti. Riusare link/moduli e risolvere interruzioni; misurare iscrizioni/annunci/contatti/acquisti oltre alle visite. Prima contenuti con intenzione di comprare/vendere/partecipare.
- [ ] 🟠 Preparare e validare un pacchetto per operatori professionali — più annunci, servizi ripetuti, prezzo sostenibile; prima anche manualmente. Abbonamenti/strumenti solo dopo clienti paganti; misurare rinnovi, margine, assistenza. Conservare accesso gratuito utile al mercato.
- [ ] 🟠 Testare una partnership commerciale pertinente — un servizio/fornitore richiesto; condizioni attuali, attribuzione richieste/compensi concordate prima delle integrazioni. Prova piccola, trasparente, misurabile. Nomi/commissioni storici da riconfermare; per finanza verificare ruolo/requisiti col partner abilitato.
- [ ] 🟠 Validare il servizio di controllo documenti con un professionista — domanda pagante, partner, costo, tempi, responsabilità e riservatezza. Prova limitata con ambito/prezzo chiari prima di automatizzare; solo servizi erogabili con competenza/margine. Pre-verifica AI con revisione umana, nessuna garanzia sull'esito della trattativa.
- [ ] 🟠 Far tornare utenti e clienti con avvisi utili — riusare alert/email per opportunità e aggiornamenti richiesti, rispettando preferenze/consensi. Misurare ritorni, contatti, riacquisti; facilitare condivisioni spontanee. Premi solo dopo valore osservato.
- [ ] 🟠 Costruire gradualmente uno storico affidabile degli affari conclusi — dalla voce «Registrare vendite e affitti conclusi», raccolta essenziale/facoltativa. Distinguere prezzo richiesto/pagato e dichiarato/verificato. Anticiparla quando si chiudono affari per fiducia/valutatore; archivio pubblico e analisi complesse dopo.
- [ ] 🟢 Automatizzare le attività ripetitive quando diventano un limite — misurare ore di assistenza/moderazione/contenuti/partner; automatizzare frequenti con controlli/intervento umano, prima se impediscono di servire clienti paganti. Ricavi crescenti senza aumento proporzionale delle ore.
- [ ] 🟢 Espandere a nuove regioni e poi ad altri settori solo dopo una prova riuscita — replicare posteggi in altra zona verificando acquisizione, qualità, margine e lavoro sostenibili. Altre licenze solo con domanda pagante e risorse; evitare rallentamenti al settore che genera ricavi.

**Ordine futuro:** traguardo/situazione attuale → zona/domanda pagante → Vetrina/percorsi contenuti → una nuova offerta → replica. Massimo due esperimenti di crescita contemporanei; confronto settimanale risultati/ore, fermare prove senza segnali e investire su margine/ripetibilità. Interventi tecnici rossi prioritari se rimuovono ostacoli concreti o proteggono utenti/dati.

Riferimento: [Stripe, ricavi ricorrenti e vendite occasionali](https://support.stripe.com/questions/understanding-monthly-recurring-revenue-%28mrr%29-and-annual-recurring-revenue-%28arr%29).

## 🛡️ Privacy e sicurezza

- [ ] 🔴 Sistemare la privacy policy e il GDPR — chiarire la gestione dei dati personali.
- [ ] 🔴 Rendere sicure le eliminazioni di annunci e account — riepilogo, conferma e verifica email; per l'account, gestire anche i dati associati.

## 🎪 Fiere: ricerca e calendario

### Strategia fiere, ricavi e Google — analisi del 16 ottobre 2026

- **Obiettivo:** riferimento per occasioni concrete di lavoro degli ambulanti, ritorni settimanali e crescita degli annunci.
- **Base dell'analisi:** 3.972 schede/20 regioni, 171 con tariffe, 183 con scadenze anche passate. Include eventi conclusi/ricorrenze da riconfermare: non misura opportunità disponibili.
- **Prodotto:** completare date, costi, requisiti, contatti/candidature imminenti; ricerca per prodotto, distanza, periodo, costo, domande aperte, distinguendo professionisti/artigiani/hobbisti. Avvisi zona/merce soprattutto all'apertura candidature; misurare candidature generate e ritorni.
- **Affidabilità:** organizzatori abilitati ad aggiornare/confermare schede; esperienze espositori su organizzazione, affluenza, costo/risultato per settore. Fama/anzianità non dimostrano redditività.
- **Partner/concorrenza:** Pro Loco, associazioni, organizzatori per dati, acquisizione e link spontanei. Eventi e Sagre e Ambulanti Online hanno già calendari/filtri: distinguersi per informazioni concrete per scegliere/partecipare.
- **Google:** nell'analisi le schede erano soltanto dentro `/fiere`; pagine autonome poi implementate il 16 ottobre (registro sopra). Restano contenuti subito leggibili, titolo/URL propri, pagine territoriali solo con dati sufficienti, link interni, sitemap, Event per date/luoghi documentati, controllo indicizzazione/ricerche in Search Console; nessuna posizione garantita.
- **Ricavi da validare:** consultazione gratuita, strumenti a pagamento organizzatori/funzioni avanzate ambulanti solo con acquisti reali. Ipotesi: 300×9 €/mese + 20×49 € = 3.680 €/mese; 1.000×9 € + 50×49 € = 11.450 €/mese. Lordi prima di dati/assistenza/tecnologia/imposte; prezzi/scenari non validati, misurare rinnovi e ore.
- **Proposta primi 90 giorni:** pagine indicizzabili, 200 eventi imminenti documentati in Lombardia, avvisi personalizzati, prova commerciale organizzatori. Misurare candidature/ritorni/clienti, ampliare dopo successo.

Riferimenti: [Google: JavaScript e indicizzazione](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Google: dati strutturati Event](https://developers.google.com/search/docs/appearance/structured-data/event).

- [ ] 🟠 Migliorare la ricerca delle fiere e il calendario — unificare gli interventi per chi cerca eventi e posteggi; il calendario esiste già, concentrarsi su date confermate e informazioni per partecipare prima di ampliare i filtri.
- [ ] 🟢 Creare la sezione «Fiere per ambulanti» — filtri per regione, mese e domande aperte.

### Ricerca approfondita per provincia — aggiornamento 12 ottobre 2026

**13 ottobre — prova ibrida sul solo comune di Gattinara:** tre schede per
San Martino, Rosa e Rosso di Maggio e LUVA. Codex dirige ricerca, verifica e
pubblicazione; Qwen individua prove e prepara brevi note. Audit in
`data/fiere-comuni.json` e `data/FIERE.md`. Questa prova non completava Vercelli:
la successiva ricerca provinciale del22ottobre è conclusa e verificata online,
come registrato sopra; la prova precedente resta conservata. Il catalogo Padova è verificato online.

- [x] **Brescia — ricerca approfondita completata**: 206 manifestazioni in 86 comuni
  pubblicate in [/fiere](https://subingresso.it/fiere?provincia=Brescia). Esaminate 1.031
  righe regionali e fonti di Comuni, Pro Loco, portali turistici e organizzatori;
  integrate date, contatti, settori, procedure, costi e scadenze quando pubblicati.
  Fonti e limiti documentati in `data/FIERE.md`; dati curati in `data/fiere-brescia.json`.
- [ ] **Brescia — aggiornamenti periodici**: ricontrollare bandi, rinvii e prossime
  edizioni; completare le date ancora ambigue o disponibili soltanto per il 2025.

- [x] **Lodi — ricerca approfondita completata**: ricerca nei 60 comuni, 43
  manifestazioni in 26 comuni pubblicate in [/fiere](https://subingresso.it/fiere?provincia=Lodi).
  35 schede con edizione 2026 e 8 con storico 2025 da riconfermare; fonti,
  contatti, settori, procedure, costi e 8 scadenze dove documentati.
  Audit di comuni, esclusioni e dubbi in `data/fiere-lodi.json` e `data/FIERE.md`.
- [ ] **Lodi — aggiornamenti periodici**: nuove edizioni, bandi e disponibilità;
  verificare fonti rimosse e segnalazioni commerciali ancora non confermate.

- [x] **Lecco — ricerca approfondita completata**: ricerca negli 84 comuni, 46
  manifestazioni in 23 comuni pubblicate in [/fiere](https://subingresso.it/fiere?provincia=Lecco).
  40 schede con giornate precise, 3 periodi ricorrenti e 3 date testuali da verificare;
  contatti, settori, procedure e 4 scadenze quando documentati. Consultate le 160
  righe regionali e scaricati tutti i programmi: 122 con testo estraibile; scansioni
  non verificate e altre segnalazioni conservate nell'audit, senza inventare date.
  Bando Viganò 2027–2029: termine 7 dicembre 2026, fiera 7 febbraio 2027.
  Fonti, esclusioni e limiti in `data/fiere-lecco.json` e `data/FIERE.md`.
- [ ] **Lecco — aggiornamenti periodici**: bandi, nuove edizioni, rinvii e disponibilità;
  chiarire Street Food/Cioccolato Merate, giorno di Premana, Fiera dei Patroni Bellano,
  ammissioni professionali e programmi scansione non ancora verificati.

- [x] **Monza e della Brianza — ricerca approfondita completata**: ricerca nei
  55 comuni, 86 manifestazioni in 29 comuni pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Monza%20e%20della%20Brianza).
  82 schede con giornate precise, un periodo e tre edizioni testuali; 199 righe
  regionali e 199 programmi scaricati, 176 con testo estraibile. Contatti per
  26 manifestazioni e sei scadenze documentate. Corrette le domeniche natalizie
  di Lissone e le 15 giornate del brocante di Monza. Epifania Lissone 2027:
  domanda entro il 6 novembre 2026 per 35 concessioni. Audit e limiti in
  `data/fiere-monza-brianza.json` e `data/FIERE.md`.
- [ ] **Monza e della Brianza — aggiornamenti periodici**: bandi, disponibilità,
  rinvii e nuove edizioni; chiarire Biassono San Martino, Pro Loco in Fiore
  Lissone, Oreno, mercatini natalizi e programmi scansione non ancora verificati.

- [x] **Arezzo — ricerca approfondita completata**: scelta casualmente; ricerca
  nei 36 comuni, 89 manifestazioni in 31 comuni pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Arezzo), prima una sola scheda.
  77 con giornate precise, tre periodi, sei edizioni testuali e tre con soli
  mesi/ricorrenze; 24 schede con contatti e cinque scadenze documentate.
  Comuni/SUAP, organizzatori, associazioni, programmi territoriali e AEFI;
  audit, hash, esclusioni e dubbi in `data/fiere-arezzo.json` e `data/FIERE.md`.
  Natale Castiglion Fiorentino: domanda 16 ottobre; Arezzo San Jacopo/Risorgimento:
  Allegato A via PEC entro 31 ottobre. Ranco consolidata a Sestino, senza duplicati.
- [ ] **Arezzo — aggiornamenti periodici**: bandi, nuove edizioni e disponibilità;
  chiarire Fiera di Primavera Castel Focognano, Fiera del Tordo Chitignano,
  Ceppo Lucignano e programmi natalizi ancora storici. Verificare ammissioni
  professionali, giorni commerciali dei periodi/feste e allegati grafici residui.

- [x] **Trieste — ricerca approfondita completata**: controllati i sei comuni,
  24 manifestazioni in quattro comuni pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Trieste), prima una sola scheda.
  22 con edizioni 2026 e due con storico 2025; date distinte, contatti e procedure
  dove documentati. Barbacan dicembre: candidatura 30 ottobre–8 novembre;
  antiquariato Trieste 2027: domanda 19 ottobre–18 novembre 2026.
  Fonti, esclusioni e limiti in `data/fiere-trieste.json` e `data/FIERE.md`.
- [ ] **Trieste — aggiornamenti periodici**: San Martino e Natale 2026,
  conferma Corte dei Miracoli Muggia (fonti discordanti e nuovo affidamento),
  giornate intermedie Aurisina, nuove edizioni e ammissioni professionali.
  Muggia: bando gestione entro 23 ottobre ore 12, distinto dalle domande espositori.

- [x] **Prato — ricerca approfondita completata**: sette comuni controllati,
  38 manifestazioni pubblicate in [/fiere](https://subingresso.it/fiere?provincia=Prato),
  prima nessuna scheda. Date, settori, contatti e partecipazione dove documentati.
  Carmignano: 13 concessioni, domande dal 6 al 31 ottobre 2026.
  Fonti, esclusioni e limiti in `data/fiere-prato.json` e `data/FIERE.md`.
- [ ] **Prato — aggiornamenti periodici**: calendari PDF annuali non recuperati,
  Festa dell'Olio, Comeana, Assedio e Natale; programmi commerciali mancanti.
  Confermare sede/ricorrenza Novecento, ammissioni professionali e Poggiole Natale
  (5–6 dicembre provvisorio, candidatura indicata entro 15 novembre).
  Fierucola delle Bigonge: 10–11 ottobre spostata al 19 settembre, non riproporre.

- [x] **Bologna — ricerca approfondita completata**: controllate le fonti nei 55
  comuni, 65 manifestazioni in 39 comuni pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Bologna), prima 15 schede.
  Date separate, contatti e categorie di partecipazione dove documentati.
  Santa Lucia: 6 novembre–27 dicembre; Tartòfla: quattro fine settimana;
  riuso Crevalcore: 22 novembre. Consolidata la Tartufesta di Sasso Marconi.
  Fonti, esclusioni e limiti in `data/fiere-bologna.json` e `data/FIERE.md`.
- [ ] **Bologna — aggiornamenti periodici**: nuove edizioni, bandi, costi,
  disponibilità e ammissioni professionali; completare il calendario regionale
  non recuperabile integralmente, i programmi scansione e i saloni espositivi.
  Chiarire le fonti discordanti e le Tartufeste senza mercato documentato.

- [x] **Milano — ricerca approfondita completata**: ricerca documentale nei 133
  comuni; 83 manifestazioni in 47 comuni, prima 15, pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Milano). Confrontate 140 righe
  regionali e scaricati 140 programmi; aggiunte fonti comunali e organizzatori.
  Nove fiere comunali di Milano con termini distinti, mercatone Naviglio con
  13 date, Assago Natale in tre giornate e Paderno primavera solo il 22 marzo.
  Schede, audit dei 133 comuni, esclusioni e limiti in `data/fiere-milano.json`
  e `data/FIERE.md`; ammissioni non pubblicate sempre da verificare.
- [ ] **Milano — aggiornamenti periodici**: nuovi bandi e disponibilità; completare
  le segnalazioni conservate nell’audit, chiarire EcoFesta Paderno, Olcella,
  Notte Bianca Gorgonzola, calendari cittadini e giorni commerciali non definiti.

- [x] **Bergamo — ricerca approfondita completata**: ricerca nei 243 comuni;
  80 manifestazioni in 42 comuni, prima 33, pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Bergamo). Confrontate 261 righe
  regionali e scaricati tutti i programmi; 40 contatti e cinque scadenze.
  Albino in due giornate, Palosco Natale in tre domeniche, Clusone Natale
  in 28 giornate con domanda entro l'11 ottobre. Fonti, esclusioni e limiti
  in `data/fiere-bergamo.json` e `data/FIERE.md`.
- [ ] **Bergamo — aggiornamenti periodici**: nuove edizioni, bandi e disponibilità;
  chiarire Calcio Pasquetta, Leffe Monte Croce, programmi solo scansionati
  e giorni commerciali non definiti; riconfermare lo storico Castione Natale.

- [x] **Verona — ricerca approfondita completata**: ricerca nei 98 comuni;
  75 manifestazioni in 36 comuni pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Verona), rispetto alle 20 precedenti.
  Confrontate 277 segnalazioni regionali e calendari fiere, antiquariato e mercati;
  approfonditi Comuni e organizzatori. Date commerciali, contatti, ammissione,
  costi e termini quando pubblicati; Tregnago 8/11 novembre, termine 25 ottobre;
  Garda termine 15 ottobre con incongruenza da confermare. Limiti, esclusioni
  e fonti in `data/fiere-verona.json` e `data/FIERE.md`.
- [ ] **Verona — aggiornamenti periodici**: ricontrollare bandi, disponibilità,
  giornate operative e conflitti; completare i riscontri rimasti senza fonte
  primaria corrente. Nessuna autorizzazione automatica a nuovi interventi.

- [x] **Padova — ricerca approfondita completata**: ricerca nei 101 comuni attuali
  (102 chiavi del dataset più Santa Caterina d’Este); 95 manifestazioni in 41 comuni,
  prima 11, integrate nel catalogo per [/fiere](https://subingresso.it/fiere?provincia=Padova).
  Esaminate 167 segnalazioni Veneto e quattro calendari ufficiali; integrate fonti
  comunali e organizzatori, 43 contatti e nove scadenze. Piove sei giorni di banchi,
  Arsego mercato 17–20 ottobre, Baone Bisi 16–17 maggio e Rustega 3 maggio.
  Moduli Bertipaglia e bando espositori Cittadella distinti dalle domande ambulanti;
  Natale storico e periodi generali segnalati. Fonti, esclusioni e limiti in
  `data/fiere-padova.json` e `data/FIERE.md`.
  Pubblicazione verificata il 13 ottobre: 95 schede online, attesa deploy risolta.
- [ ] **Padova — aggiornamenti periodici**: nuove edizioni, bandi, disponibilità e
  ammissioni; chiarire antiquariato Cittadella, giorni banchi Folpo e Arzergrande,
  San Luca Camposampiero, Montagnanese, Polverara, Natale e programmi in immagini.

- [x] **Treviso — ricerca approfondita completata**: confronto dei 94 comuni,
  337 righe Veneto e tre calendari regionali; 79 manifestazioni in 39 comuni
  pubblicate e verificate in [/fiere](https://subingresso.it/fiere?provincia=Treviso),
  prima 48. 52 schede con giornate precise, 23 date testuali e quattro periodi;
  38 contatti e due scadenze documentate, entrambe passate. Stelle a Natale
  include il 7 dicembre; San Gregorio commerciale 7–9 marzo; Santa Lucia 12–14
  dicembre, termine 30 settembre. Sei falsi positivi esclusi con motivazione.
  Qwen su otto microtask, tutte le prove e note controllate da Codex; 4.782 token
  locali, risparmio netto non misurato. Audit e limiti in `data/fiere-treviso.json`
  e `data/FIERE.md`; le altre 2.446 schede sono identiche. Vercel e sito verificati.
- [ ] **Treviso — aggiornamenti periodici**: bandi, disponibilità, quote e
  ammissioni; chiarire Castelcucco, San Luca, Vi-Ve in Vintage e giornate dei
  banchi nei periodi di festa. Approfondire Segusino, Tovena, Sarmede Teatro,
  Natale Conegliano, Tucogiò e scansioni Istrana/Delizie non verificate visivamente.
  Non applicare moduli 2025 al 2026 né dedurre nuove edizioni; nessun altro
  intervento automatico autorizzato.

- [x] **Vicenza — ricerca approfondita completata (13 ottobre 2026)**: ricerca
  nominale nei 114 comuni, 549 programmi regionali e calendari antiquariato/fieristico;
  117 manifestazioni in 49 comuni, prima 59, in
  [/fiere](https://subingresso.it/fiere?provincia=Vicenza). 55 schede con giornate
  precise, 20 periodi e 42 indicazioni testuali; 48 contatti e sei scadenze.
  Sarcedo Natale: 8 dicembre, domanda entro 3 dicembre ore 23:59, suolo gratuito;
  Asiago Santi: 2 novembre. Barbarano: 22 e 25 novembre, moduli e tariffe distinti,
  termini ordinari già trascorsi. Fonti e limiti in `data/fiere-vicenza.json`
  e `data/FIERE.md`. Altre 2.466 schede identiche; Vercel e sito verificati,
  incluse sei schede operative e i filtri su desktop e telefono.
- [ ] **Vicenza — aggiornamenti periodici**: nuove edizioni, bandi, quote,
  disponibilità e ammissioni; approfondire Bassano e Malo con fonti primarie correnti,
  calendario Recoaro, Natale Vicenza, giornate Nove, date testuali e scansioni residue.
  Non applicare moduli storici al 2026 né periodi delle feste ai giorni dei banchi.

- [x] **Modena — ricerca approfondita completata (14 ottobre 2026)**: ricerca
  nominale nei 47 comuni; 74 manifestazioni in 33 comuni, prima 10, nel calendario
  [/fiere](https://subingresso.it/fiere?provincia=Modena). Fonti comunali, turistiche,
  organizzatori e PDF operativi; 120 documenti tentati e dieci scadenze.
  Castelfranco casette: termine 17 ottobre; Pievepelago Castagna: 27 ottobre ore 12;
  Castelvetro Natale: 16 novembre, P.IVA 3×3 m 48 €. Ognissanti Concordia in due
  giornate; Vignola distingue fiori, opere proprie e ambulanti. Calendario regionale
  completo non recuperato, snapshot conservati e limiti espliciti in
  `data/fiere-modena.json` e `data/FIERE.md`. Altre 2.573 schede identiche.
  Pubblicazione verificata: 74 schede online, sette dettagli su desktop/telefono;
  controlli catalogo, filtri e browser passati.
- [ ] **Modena — aggiornamenti periodici**: disponibilità, bandi e quote; recuperare
  disciplinare casette Castelfranco 2026, registro regionale completo e programmi
  residui, Bruino Medolla, calendari montani e Natale. Non trasferire documenti
  storici alle nuove edizioni né periodi generali ai giorni dei banchi.

- [x] **Parma — ricerca approfondita completata (14 ottobre 2026)**: ricerca
  nominale nei 44 comuni; 81 manifestazioni in 30 comuni, prima nove, nel
  calendario [/fiere](https://subingresso.it/fiere?provincia=Parma). Verificate
  242 schede regionali candidate, 42 valide; Comuni, IAT, organizzatori e PDF.
  76 schede con giornate precise, due periodi, una testuale e due ricorrenze;
  14 contatti, sei termini assoluti/relativi. November Porc: mercati sabato e
  domenica, venerdì gastronomico separato; Fragno in quattro domeniche;
  Natale Piazza Ghiaia in sei giornate. Fiere Borgo Val di Taro 2027 esplicite.
  Fonti, conflitti, esclusioni e limiti in `data/fiere-parma.json` e `data/FIERE.md`;
  registro annuale completo non recuperato. Altre 2.638 schede identiche.
  Pubblicazione verificata: 81 schede online e otto dettagli su desktop/telefono;
  controlli dati, filtri e browser passati. Vercel riuscito, catalogo conforme.
- [ ] **Parma — aggiornamenti periodici**: nuovi bandi, disponibilità, quote,
  Natale e programmi residui; chiarire Rocca e Natura dicembre, Consorzio
  Fontanellato 8 dicembre, Varsi Primavera, Bardi Giugno e casette Parma/GIA.
  Approfondire Sorbolo, Roccabianca San Michele, Felino, Sissa/Trecasali,
  Sala Baganza, Lesignano, Torrile e comuni montani. Non applicare moduli
  storici al 2026 né programmi gastronomici ai giorni dei banchi.

- [x] **Reggio nell'Emilia — ricerca approfondita completata (14 ottobre 2026)**:
  ricerca nominale nei 42 comuni; 87 manifestazioni in 38 comuni,
  prima 14. Controllate 211 schede regionali candidate, 47 valide; Comuni/SUAP,
  IAT, Pro Loco, Com.Re e organizzatori, PDF San Luca verificato visivamente.
  47 contatti e cinque termini assoluti/relativi. San Martein 8 novembre,
  domanda 2 novembre; Vezzano 8 novembre, P.IVA 3×3 35 €, food 80 €, OPI 20 €;
  termine 28 ottobre solo no profit. Rolo termine 5 ottobre trascorso.
  Fonti, conflitti, esclusioni e limiti in `data/fiere-reggio-emilia.json`
  e `data/FIERE.md`; registro regionale annuale integrale non recuperato.
  Altre 2.705 schede identiche e tutti i 14 ID precedenti preservati.
  Pubblicazione verificata: 87 schede e otto dettagli online su desktop e
  telefono; Vercel riuscito, catalogo conforme, controlli dati e browser passati.
- [ ] **Reggio nell'Emilia — aggiornamenti periodici**: nuove edizioni,
  bandi, quote e disponibilità; approfondire Reggiolo, Novellara, antiquariato
  Cavriago, Cadelbosco, Castelnovo di Sotto, Natale e comuni montani.
  Chiarire Fiera di Maggio San Martino, antiquariato Scandiano e Ciccioli Albinea.
  Non applicare moduli storici a nuove edizioni né periodi generali ai banchi.

- [x] **Varese — ricerca approfondita completata (14 ottobre 2026)**:
  ricerca nominale nei 136 comuni attuali; 81 manifestazioni in 36 comuni,
  prima quattro. Esaminate tutte le 123 righe regionali 2026 e i programmi:
  111 con testo, 12 scansionati verificati visivamente; calendari turistici,
  Comuni e organizzatori, moduli e regolamenti 2026. 38 schede con contatti.
  Inarzo 15 novembre, domanda 22 ottobre, 25 €/3 metri; Carnago 7–8 dicembre,
  gratuito con cauzione 10 €; Gazzada 29 novembre gratuito per opere proprie;
  Porto Valtravaglia termine 10 ottobre scaduto, 30 € più canone commerciale.
  Sospensioni, conflitti e tre schede storiche 2025 espliciti; nessuna data
  dedotta da ricorrenze. Audit in `data/fiere-varese.json` e `data/FIERE.md`.
  Tutti i quattro ID precedenti preservati; altre 2.788 schede identiche.
  Pubblicazione verificata: 81 schede e otto dettagli online su computer e
  telefono; catalogo conforme al commit, controlli dati e cinque browser/schermi
  passati. Prossima provincia nell’ordine operativo: Como.
- [ ] **Varese — aggiornamenti periodici**: recuperare allegati Cairate,
  calendari giugno/luglio/settembre e candidature non pubblicate; chiarire
  date Cassano/Caronno Varesino, banchi Somma e segnalazioni nell’audit.

- [x] **Como — ricerca approfondita completata (14 ottobre 2026)**:
  ricerca nominale nei 147 comuni attuali; 83 manifestazioni in 31 comuni,
  prima 16, pubblicate in [/fiere](https://subingresso.it/fiere?provincia=Como).
  Letti tutti i 65 programmi Lombardia CO/2026, confrontati registri fieristici,
  Comuni, calendari turistici e organizzatori; 32 contatti e 11 termini assoluti.
  Uggiate con Ronago: 13 dicembre, domanda 27 novembre, hobbisti 10 € e
  espositori 20 €, refusi del modulo dichiarati. Cantù Crocifisso 18 ottobre
  con termine già trascorso e spunta; Santi un posteggio dolciumi. Anzano
  banchi solo 27 settembre, MOMA in due appuntamenti, Griante 16 novembre.
  Nove schede solo storiche 2025; date discordanti e ricorrenze esplicite.
  Audit, esclusioni e limiti in `data/fiere-como.json` e `data/FIERE.md`.
  Tutti i 16 ID conservati; altre 2.853 schede identiche. Vercel riuscito e
  catalogo online conforme al commit; 83 schede e dieci dettagli verificati
  su computer/telefono, filtri e controlli dati/browser passati.
- [ ] **Como — aggiornamenti periodici**: disponibilità, bandi, quote e nuove
  edizioni; chiarire modulo Uggiate per importi in lettere e profili P.IVA,
  Menaggio, Natale 2026, calendari Como dopo agosto, Turate e segnalazioni
  senza fonte primaria nell’audit. Non trasferire termini dei promotori o
  iscrizioni volontari alle domande espositori; nessuna nuova provincia avviata.

- [x] **Torino — ricerca approfondita completata (14 ottobre 2026)**:
  312 comuni cercati e 240 righe regionali esaminate (139 sagre, 101 fiere);
  241 manifestazioni in 115 comuni, prima 108, pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Torino). Confrontati calendari
  regionali, Comuni, Turismo Torino e organizzatori, moduli PDF/DOCX e
  manifesto Luserna. 222 schede con contatti e otto termini assoluti;
  candidature e costi distinti per categoria, otto edizioni solo storiche 2025.
  Cuorgnè termine 15 ottobre, Almese Natale 29 novembre; Tuttomele banchi
  nei due weekend, Rivoli spunta con domanda preventiva, Villafranca 13 dicembre.
  Fonti, copertura, esclusioni e limiti in `data/fiere-torino.json`
  e `data/FIERE.md`; conservati tutti i 108 ID e le altre 2.828 schede identiche.
  Vercel riuscito e catalogo online conforme al commit: 241 schede e dodici
  dettagli verificati su computer/telefono, Chromium e WebKit; filtri,
  mappa e controlli dati/browser passati. Nessun'altra provincia avviata.
- [ ] **Torino — aggiornamenti periodici**: disponibilità, bandi, quote,
  Natale e programmi montani residui; chiarire Collegno in Bancarella,
  Volvera, Pramollo, Brocante e nuovi mercati tematici. Pinerolo Natale:
  termine del gestore distinto da espositori. Non trasferire termini tra
  categorie, periodi di feste ai banchi né programmi 2025 al 2026.

- [x] **Mantova — ricerca documentale approfondita completata (14 ottobre 2026)**:
  confronto dei 64 comuni e 195 record regionali, tutti i programmi scaricati;
  **84 manifestazioni in 33 comuni**, prima 12, pubblicate e verificate in
  [/fiere](https://subingresso.it/fiere?provincia=Mantova). 50 schede con contatti
  e due termini assoluti documentati (15 maggio, scaduti); 76 con giornate
  precise, quattro periodi e quattro date testuali. Natale Mantova 19 aperture,
  San Fortunato e San Gallo 18 ottobre, Madonnina 6 settembre; Grazie 97 posteggi
  previsti e Viadana quote distinte. Fonti, esclusioni e incongruenze in
  `data/fiere-mantova.json` e `data/FIERE.md`. Test locali Chromium/WebKit e
  verifica online di 13 dettagli su computer/telefono superati; 12 ID mantenuti
  e altre 3.057 schede identiche. Commit dati `d6a96b0`, deploy Vercel riuscito.
- [ ] **Mantova — aggiornamenti periodici**: bandi, disponibilità e quote;
  chiarire Postumia Gazoldo, Grazie validità fino al 17 agosto, condizioni
  Broccante per professionisti, calendari Amarcord/Ostiglia/Solferino e tre
  scansioni non lette. Approfondire Guidizzolo, Motteggiana e Baule della Nonna;
  tartufo/riso conservati nell’audit senza posteggi esterni documentati.

- [x] **Cremona — ricerca documentale approfondita completata (14 ottobre 2026)**:
  71 manifestazioni in 31 comuni, prima nove; 113 comuni confrontati,
  71 programmi regionali recuperati e cinque grafici letti visivamente.
  61 schede con contatti e otto scadenze assolute; audit, fonti e limiti
  in data/fiere-cremona.json e data/FIERE.md.
  Buongusto Pizzighettone: termine 19 ottobre, quote + IVA 22%; Natale Idee
  Regalo: quattro date, termine 16 novembre, quote IVA inclusa.
  Ostiano banchi 25 ottobre, Ratatuia 25 ottobre solo su invito;
  Santa Maria della Croce 28–30 marzo da Comune, non 27–29 del registro.
  Periodi provinciali e San Carlo da confermare, nessun termine dei gestori
  o del 2025 trasferito agli espositori. Tutti i nove ID e altre 3.132 schede
  preservati. Vercel riuscito, catalogo online conforme al commit 7f05e52;
  13 dettagli e filtri verificati in Chromium computer/telefono e WebKit telefono.
  Checkout isolato, Venezia resta alla sessione sospesa.
- [ ] **Cremona — aggiornamenti periodici**: disponibilità, bandi, nuove
  edizioni e calendari natalizi definitivi; chiarire Sant’Apollonia, San Carlo,
  Santa Lucia, modulo hobbisti Monte Cremasco e termine relativo Ratatuia;
  recuperare Bonemerse, Creare, programmi commerciali settembrini e altri
  allegati residui. Date da stampa locale esplicite, non programmi comunali.

- [x] **Venezia — ricerca documentale approfondita completata (14 ottobre 2026)**:
  84 manifestazioni in 26 comuni, prima 16, pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Venezia). Ricerca nei 44 comuni,
  tutte le 132 righe Veneto esaminate; 40 appuntamenti del calendario Caorle
  raggruppati in sette rassegne. Comuni, organizzatori, calendari turistici,
  antiquariato e moduli: 17 contatti e un termine assoluto documentato.
  Sant’Andrea: ambulanti/produttori 28–29 novembre, modulo C entro 30 ottobre,
  quote + IVA 22% e CUP; 22 novembre riservato ad altre categorie.
  Noale in Fiore 12 aprile, Primavera Portogruaro 11–12 aprile, Bisi banchi
  31 maggio; categorie Caorle e Corbolone distinte. Jesolo e Caorle Natale
  con periodi 2026–2027, singole aperture da confermare.
  Copertura, esclusioni e limiti in `data/fiere-venezia.json` e `data/FIERE.md`;
  56 schede con giornate precise, 21 periodi e sette ricorrenze/testi.
  Tutti i 16 ID e le altre 3.187 schede preservati, comprese Mantova e Cremona.
  Commit dati 765cb5e: Vercel riuscito, catalogo e script online conformi;
  84 risultati e dodici dettagli verificati su computer/telefono Chromium
  e WebKit, controlli dati e cinque browser/schermi passati. Sessione ripresa
  e conclusa: le precedenti note di sospensione di Venezia sono superate.
- [ ] **Venezia — aggiornamenti periodici**: nuove edizioni, disponibilità,
  quote e candidature non pubblicate; chiarire programmi commerciali
  Scorzè, Musile e Summaga, Natale provinciale, piste Eraclea/Jesolo estate,
  Torre di Mosto, Cavarzere, Santa Maria di Sala e comuni senza schede.
  San Donà: recuperare moduli correnti, sito non accessibile; Camponogara
  conferma operativa oltre l’estratto ACTV. Natale Mira resta provvisorio;
  nessuna proiezione di date/termini storici o dei gestori agli espositori.

- [x] **Novara — ricerca documentale approfondita completata (15 ottobre 2026)**:
  ricerca nominale negli 87 comuni; 71 manifestazioni in 36 comuni, prima 13,
  pubblicate e verificate in [/fiere](https://subingresso.it/fiere?provincia=Novara).
  Confrontate tutte le 25 righe dei due registri Piemonte e le 33 schede ATL
  Fiere e Mercati; vagliate Enogastronomia e Sagre, 261 dettagli distinti.
  45 schede con contatti, sei scadenze; 69 con date precise, una testuale,
  una sola ricorrenza. Fonti, copertura, esclusioni e limiti documentati in
  `data/fiere-novara.json` e `data/FIERE.md`; nessuna data proiettata.
  Ameno domanda 30 ottobre; Ghemme Natale 15 novembre; Prato Sesia Natale
  11 dicembre. Cureggio mercato annullato escluso; fiere Novara in nuove aree,
  Lesa 22 agosto e Fiorissimo 2–4 aprile 2027 da annunci espliciti.
  Commit dati `e92ded2`, Vercel riuscito; catalogo online identico al commit,
  mappa e dieci dettagli verificati su computer/telefono Chromium e WebKit.
- [ ] **Novara — aggiornamenti periodici**: nuove edizioni, bandi e disponibilità;
  chiarire giorni del weekend Novara e consistenze discordanti, sede/condizioni
  Roba Végia, sede Arona tartufo, Ghemme vino e calendario Boca. Recuperare
  avviso domande Trecate e programmi correnti Natale Briga, Bellinzago,
  Castelletto, Le Pigne, Comignago e Romentino Artiquariando. Meina resta
  storico 2025; nessuna quota, domanda o data da ricostruire per ipotesi.

- [x] **Cuneo — ricerca documentale approfondita completata (15 ottobre 2026)**:
  ricerca nominale nei 247 comuni; 173 manifestazioni in 93 comuni, prima 55,
  pubblicate e verificate in [/fiere](https://subingresso.it/fiere?provincia=Cuneo).
  Esaminate 160 righe dei due registri Piemonte e 82 record distinti ATL,
  confrontati PDF regionali, Comuni, organizzatori, Pro Loco e calendario LMR.
  117 schede con giornate precise, 54 con periodi, due senza edizioni datate;
  165 con recapiti e dieci termini documentati. Fonti, copertura, esclusioni
  e conflitti in `data/fiere-cuneo.json` e `data/FIERE.md`.
  Gusta Cherasco 24–25 ottobre, termine del canale Cascine Piemontesi
  16 ottobre; Cherasco Natura 8 novembre, termine dello stesso canale 31 ottobre.
  Distinti i mercati ambulanti del Marrone dalla fiera; Venasca mercato
  18 ottobre, Dula Paroldo 31 maggio, Govone 14 giornate esplicite.
  Conservati tutti i 55 ID e le altre 3.274 schede. Commit dati `17e2ee0`,
  Vercel riuscito, catalogo/script online identici al commit; 173 risultati,
  mappa e dodici dettagli verificati su Chromium computer/telefono e WebKit.
- [ ] **Cuneo — aggiornamenti periodici**: bandi, disponibilità e nuovi programmi;
  BEE Villanova 20–22 novembre ATL contro 14–15 regionale, giorni commerciali
  dei periodi ancora non definiti e programmi futuri. Modulo Fossano ancora
  2025 nella notizia 2026; pagine ritirate Dronero/Fossano, Monforte creativi,
  Cervasca, Natale Paesana/Saluzzo/Castellar e nuova edizione Cheese da
  ricontrollare. Le esclusioni e le ricorrenze non sono date 2026 confermate.
  Nessuna domanda, candidatura o comunicazione a terzi inviata.

- [x] **Trento — ricerca documentale approfondita completata (16 ottobre 2026)**:
  ricerca nominale nei 166 comuni; 122 manifestazioni in 62 comuni, prima cinque,
  pubblicate e verificate in [/fiere](https://subingresso.it/fiere?provincia=Trento).
  Letto integralmente e verificato visivamente il calendario ANVA 2026;
  confrontati Comuni, APT territoriali, organizzatori e calendario AEFI Riva.
  115 schede con giornate pubblicate, cinque periodi, due date testuali;
  95 con recapiti, 13 con termine documentato. Fonti, copertura, esclusioni
  e limiti in `data/fiere-trento.json` e `data/FIERE.md`.
  Trento San Giuseppe 15 marzo, Cles San Rocco 16 agosto; distinte fiera
  ambulante Cles 2 maggio e mostra agricola 1–2 maggio. Natale Ala domanda
  20 ottobre da allegati; costi, IVA e cauzioni verificati nei disciplinari
  di Trento, Ala, Ossana, Pomarolo e Ciuiga. Date di pagamento non scambiate
  per scadenze delle domande; periodi senza singole aperture dichiarati.
  Conservati i cinque ID e le altre 3.442 schede, inclusi costi Pisogne;
  preservato anche l'aggiornamento parallelo dei filtri regionali.
  Commit dati `3c80a59`, Vercel riuscito; catalogo e script online
  identici al commit. 122 risultati, mappa e dodici dettagli verificati su
  Chromium computer/telefono e WebKit; build, settori e suite generale passati.
- [ ] **Trento — aggiornamenti periodici**: bandi, disponibilità e nuove edizioni;
  giorni commerciali di Siror, Moena, Canazei, Campitello, Vallarsa e Caderzone;
  apertura Natale Pergine 25 dicembre, giorno San Marco Rovereto e possibili
  rinvii meteo. Recuperare nuove fonti per Val di Gresta, Folgaria artigianato
  estivo e Avio Herbarium. Le query nominali non certificano l'assenza di altri
  eventi; quote non pubblicate mai interpretate come gratuite. Nessuna domanda,
  candidatura o comunicazione a terzi inviata.

- [x] **Bolzano/Bozen — ricerca documentale approfondita completata (16 ottobre 2026)**:
  ricerca nominale nei 116 comuni; 207 manifestazioni in 73 comuni, prima cinque,
  pubblicate e verificate in [/fiere](https://subingresso.it/fiere?provincia=Bolzano%2FBozen).
  Letto integralmente e controllato visivamente il calendario HDS/FIVA 2026:
  338 righe, 123 annuali; 31 ricorrenze nominative riscontrate nei calendari
  locali di Sarentino, Vipiteno e Chiusa, 184 righe ordinarie escluse.
  Comuni, associazioni turistiche e organizzatori; 196 schede con giornate
  pubblicate e 11 con soli periodi, 69 recapiti e cinque termini scaduti.
  Quattro nuove sintesi di costo e due precedenti conservate; IVA, cauzioni,
  spese e biglietti visitatori distinti. Fonti, copertura, esclusioni e limiti
  in `data/fiere-bolzano.json` e `data/FIERE.md`.
  Stegona 26–28 ottobre; Brunico Natale domanda 30 aprile 2026, non riaperta;
  Merano gara triennale scaduta 10 maggio 2024, Bressanone 16 marzo 2025.
  Ortisei 25 dicembre solo gastronomia; Renon venti giornate, Corvara include
  Natale; Fiè solo storico 2025/26. Nessuna data o disponibilità inventata.
  Conservati tutti i cinque ID e le altre 3.559 schede. Commit dati `e4f98e2`,
  Vercel riuscito; catalogo, script e pagina online identici al commit.
  207 risultati, mappa e 14 dettagli verificati su Chromium computer/telefono
  e WebKit; build, settori e suite generale su cinque schermi/browser passati.
- [ ] **Bolzano/Bozen — aggiornamenti periodici**: nuove edizioni, bandi,
  disponibilità e ammissioni; completare i programmi commerciali di Lana,
  Castelrotto, Tirolo, Bressanone e Vipiteno, riconfermare Fiè e verificare
  nuove fonti Carezza/Tires. Recuperare bando Flower Festival (link con errore
  DNS), avvisi dei mercati minori e pagine che hanno rimosso le date passate.
  Quote non pubblicate non gratuite; termini di pagamento e bandi per
  categorie specifiche non sono candidature generali. Nessuna comunicazione,
  domanda o candidatura a terzi inviata; nessun'altra provincia avviata.

- [x] **Firenze — ricerca documentale approfondita completata (16 ottobre 2026)**:
  controllati i 41 comuni; 113 manifestazioni in 40 comuni, prima tre,
  pubblicate e verificate in [/fiere](https://subingresso.it/fiere?provincia=Firenze).
  92 schede con giornate pubblicate, sei periodi e 15 ricorrenze testuali;
  42 con recapiti, nove schede con termine e 28 sintesi di costo documentate.
  Fonti amministrative, turismo ufficiale e organizzatori; audit, esclusioni,
  conflitti e limiti in `data/fiere-firenze.json` e `data/FIERE.md`.
  Firenze Natale: 23 posteggi, domanda 23 ottobre; Rionalissima 16 ottobre;
  Prim.OLIO 26 ottobre, 300 € per spazio salvo Onlus; Empolissima 30 ottobre
  per l'8 novembre. Cèramica: candidatura scaduta 12 ottobre, richiesta
  tesserino 2 novembre distinta; bando A esenzione canone, B 25 €/giorno.
  Fucecchio banchi 1/3/5/7/8 novembre; Cerbaia 7/14 giugno; Fierucola giugno
  da calendario organizzatore, senza applicare ricorrenze automatiche.
  Conservati i tre ID e le altre 3.763 schede; catalogo totale 3.876.
  Commit dati `8975717`, Vercel riuscito; catalogo/script/pagina online identici.
  113 risultati, mappa e dodici dettagli verificati su Chromium computer/telefono
  e WebKit; build, settori e suite generale su cinque schermi/browser passati
  (ripetuto WebKit dopo timeout hover su La Spezia, nessuna modifica necessaria).
- [ ] **Firenze — aggiornamenti periodici**: recuperare calendari commerciali
  completi, Capraia e Limite, nuove disponibilità e quote; chiarire Montaione
  e seconda giornata Firenzuola, giorni commerciali dei periodi e FAM 4/5 giugno.
  Riconfermare Londa/Galliano, rimasti storici 2025; segnalazioni prive di mercato
  esterno restano nell'audit. Privati/hobbisti distinti dai professionisti;
  nessuna candidatura, comunicazione o pagamento a terzi.

- [x] **Roma — ricerca documentale corrente completata (16 ottobre 2026)**:
  **127 manifestazioni in 48 comuni**, prima 116 in 46, pubblicate e verificate in
  [/fiere](https://subingresso.it/fiere?provincia=Roma). Ripresa delle piste aperte,
  conservati ricognizione nei 121 comuni e confronto delle 31 righe Lazio.
  Undici aggiunte; tutte le 3.989 schede precedenti identiche, totale **4.000**.
  72 schede con recapiti, 12 termini e nove sintesi di costo. Copertura, fonti,
  tentativi, esclusioni e limiti in `data/fiere-roma.json` e `data/FIERE.md`.
  Vicovaro: atti originali recuperati, 1–2 agosto, domanda 28 luglio ore 11,
  spunta dalle 14:30; tariffa con ambiguità oraria/giornaliera, nessun totale.
  Befana e Municipi III/V: finestre commerciali da bando/atti, non promessa di
  aperture quotidiane o posti; San Felice e Tor Sapienza da provvedimenti 2026.
  Lariano: delibera 129 e convenzione per circa 23 gazebo e operatori terzi;
  finestra 11–14 settembre dopo rinvio/proroga, quota Pro Loco non pubblicata,
  esenzione suolo per attività locali non significa stand gratuito. Distinta
  la festa dell’associazione a Velletri, Colle Rosso, 3–20 settembre.
  TolfArte: 37 artigiani nominativi 2026, periodo agosto senza forzare giorni;
  TTS Food resta separato 8–9 agosto, niente spettacoli di settembre accorpati.
  Cave: programma originale 23–25 ottobre; atti Urbi e SUAP consultati,
  mercatino esterno ancora non provato per il 2026, escluso esplicitamente.
  Copertura nominativa dei 15 Municipi; altri bandi senza calendario operativo
  esclusi. XIV: calendario scansionato non leggibile nei tentativi registrati;
  non inventati giorni o gestori. Limiti documentali, non attestazioni di assenza.
  Ricerca attuale conclusa nelle fonti accessibili; nessun censimento esaustivo
  o garanzia di disponibilità. Nuovi bandi e conferme sono manutenzione futura.
  Commit dati `4ef29d1`, Vercel riuscito; catalogo/script/pagina online identici
  entro 47 secondi. 127 risultati, mappa e 40 dettagli verificati su Chromium
  computer/telefono e WebKit; undici nuove pagine con HTTP 200, canonical/fonti.
  Vicovaro/Lariano/artigiani TolfArte leggibili senza JS nei tre formati.
  Build, settori, suite Roma locale/online, pagine e suite generale passate.
  Spunta successiva alla verifica online; nessuna comunicazione o candidatura
  a terzi, modifiche estranee e note concorrenti sugli articoli preservate.
- [ ] **Roma — aggiornamenti periodici**: titoli annuali Befana, concessioni e
  calendari dei Municipi, documenti XIV leggibili; prossime edizioni, quote,
  disponibilità e giorni dei singoli banchi TolfArte/Lariano/Cave. Riconfermare
  anche le altre esclusioni soltanto con nuove fonti, senza riaprire per questo
  la ricerca documentale corrente o attendere pubblicazioni future.

- [x] **Rimini — ricerca documentale conclusa e verificata online (17 ottobre 2026)**:
  115 manifestazioni in 25 comuni (+102), verificati tutti i 27 comuni attuali.
  Calendari comunali, atti e PDF originali, SUAP, organizzatori e fonti turistiche;
  corretti Natale Rimini, date Sant’Agata, Casteldelci e territorio Montecopiolo/
  Sassofeltrio. Fonti, 375 tentativi regionali, esclusioni e limiti espliciti in
  `data/fiere-rimini.json` e `data/FIERE.md`; nessun dato inventato o contatto a terzi.
  Registro regionale annuale non integralmente accessibile; ricorrenze incerte
  testuali, quote mancanti non gratuite. Ricerca attuale chiusa senza attendere
  nuovi bandi; nessuna promessa di censimento esaustivo.
  Pubblicazione `3af5098`: catalogo online identico al Git (LF), 115 schede,
  dettagli, mappa e settori verificati con PLAYWRIGHT_MODULE in Chromium e WebKit;
  test generali calendario/pagine/settori passati. 3.987 eventi esterni invariati.
- [ ] **Rimini — verifiche periodiche**: nuovi bandi, quote e disponibilità,
  calendari estivi completi e nuove fonti per eventi esclusi o ricorrenze testuali.
  Attività futura distinta dalla ricerca documentale corrente conclusa.

- [x] **Ravenna — ricerca documentale conclusa e verificata online (17 ottobre 2026)**:
  **131 manifestazioni in 17 comuni**, prima 19; controllati tutti i 18 comuni.
  Fonti, copertura, tentativi, esclusioni e limiti in `data/fiere-ravenna.json`
  e `data/FIERE.md`; originali in `Documents/ricerca-fiere-ravenna-20261017`.
  Programmi e moduli originali, Comuni/SUAP, turismo e organizzatori; 23 schede
  regionali complete recuperate, altre originali via indice web. Date dei
  banchi distinte da feste, recuperi e ricorrenze ancora 2025; quote per evento,
  stagione, categoria e IVA, bolli parziali. Bagnara senza prova commerciale
  sufficiente: esclusioni documentate, non dichiarata assenza. Ricerca attuale
  chiusa con limiti espliciti, senza attendere futuri bandi o garantire esaustività.
  Commit dati `6e9e899`, Vercel READY; catalogo/HTML/JS identici online,
  131 pagine HTTP 200 con canonical e istruzioni. PLAYWRIGHT_MODULE: Chromium
  computer/telefono e WebKit, elenco, mappa, settori, dialog e pagine senza JS
  passati localmente e online. Build, settori, 4.214 pagine e suite generale
  passati; conservati tutti i 19 ID e le altre 4.083 schede identiche.
  Nessuna comunicazione, candidatura o pagamento a terzi; cambiamenti estranei
  preservati ed esclusi dai commit. Spunta solo dopo le verifiche pubbliche.
- [ ] **Ravenna — verifiche periodiche**: nuove edizioni, bandi, disponibilità
  e quote; calendari hobbisti/Brazadèl, dettaglio ëMarkè dicembre, Borgomarina
  24 settembre, antiquariato maggio e recuperi Raboj. Nuovi originali per le
  esclusioni e giorni commerciali dei periodi; manutenzione futura distinta
  dalla ricerca corrente conclusa, senza riaprire altre province.

- [x] **Forlì-Cesena — ricerca documentale conclusa e verificata online (17 ottobre 2026)**:
  **88 manifestazioni in 30 comuni**, prima 23: 65 aggiunte, 76 con date esatte,
  14 sintesi di costo. Ricognizione dei 30 comuni, originali comunali/SUAP,
  graduatorie, regolamenti, programmi e organizzatori. Audit, tentativi,
  esclusioni e limiti in `data/fiere-forli-cesena.json` e `data/FIERE.md`;
  archivio `Documents/ricerca-fiere-forli-cesena-20261017`.
  Artusiana: recuperati otto allegati 2026 superando la cache del sito;
  cauzione rimborsabile distinta da quota banco e PiazzaArtusi da ambulanti.
  Fonti secondarie Borghi/Meldola dichiarate; date incerte testuali, Fratta
  esplicitamente 2025, conflitti Cesenatico non trasformati in conferme.
  Ricerca corrente chiusa con limiti documentati, senza promessa di censimento
  esaustivo o posti liberi. Conservati 23 ID e altre 4.191 schede identiche.
  Commit dati `567a1f5`, Vercel riuscito; catalogo, audit, HTML e JS identici
  online entro 21 secondi; 88 pagine HTTP 200 con nome, canonical e istruzioni.
  Build, settori, 4.279 pagine/1.582 sitemap e suite generale cinque formati
  passati. Test provinciale locale e online tramite PLAYWRIGHT_MODULE:
  Chromium 1440/390 e WebKit 390, elenco/mappa, settori, dialog e pagine senza JS.
  Nessun contatto a terzi; file estranei preservati ed esclusi dai commit.
- [ ] **Forlì-Cesena — verifiche periodiche**: nuove edizioni, disponibilità,
  quote e canoni, scheda promozione B.4 Artusiana non collegata; calendario
  Bertinoro/Fratta, Pasquetta/FestinVal/Sangiovese, Zadina e conflitti
  Pulci/Madamarosè, seconda data Buskers e refuso modulo agricoli Pisello.
  Nuove fonti per esclusioni e condizioni non pubblicate: manutenzione futura
  distinta dalla ricerca corrente conclusa, senza avviare altre province.

**Ricerca approfondita: 69 province completate, 41 da fare su 110**, aggiornate il 26 ottobre dopo Chieti. Manutenzione distinta; schede importate ≠ ricerca approfondita. Unità territoriali del calendario, inclusa Sardegna 2026.

**Ordine operativo aggiornato il 12 ottobre 2026, dalla più importante alla meno
importante per subingresso.it.** Prima fiere e mercati utili agli ambulanti,
bacino di operatori/clienti, capacità di spesa e turismo, poi vicinanza alla
Lombardia e beneficio atteso della ricerca. Favorire il Nord e le zone ricche
richieste dall’utente. Questa è una stima commerciale qualitativa, non una
classifica di volumi Google: mancano dati provinciali comparabili di ricerche
e conversioni. Rivalutare con Search Console, annunci e contatti effettivi.
La fama dei grandi saloni espositivi da sola non misura l’utilità per ambulanti.

- [x] **1. Milano** — Lombardia
- [x] **2. Bergamo** — Lombardia
- [x] **3. Verona** — Veneto
- [x] **4. Padova** — Veneto
- [x] **5. Treviso** — Veneto
- [x] **6. Vicenza** — Veneto
- [x] **7. Modena** — Emilia-Romagna
- [x] **8. Parma** — Emilia-Romagna
- [x] **9. Reggio nell'Emilia** — Emilia-Romagna
- [x] **10. Varese** — Lombardia
- [x] **11. Como** — Lombardia
- [x] **12. Torino** — Piemonte
- [x] **13. Venezia** — Veneto
- [x] **14. Mantova** — Lombardia
- [x] **15. Cremona** — Lombardia
- [ ] **16. Pavia** — Lombardia
- [x] **17. Novara** — Piemonte
- [x] **18. Cuneo** — Piemonte
- [x] **19. Trento** — Trentino-Alto Adige
- [x] **20. Bolzano/Bozen** — Trentino-Alto Adige
- [x] **21. Firenze** — Toscana
- [x] **22. Roma** — Lazio; ricerca documentale completata, 127 schede in 48 comuni pubblicate e verificate, limiti espliciti sopra
- [x] **23. Rimini** — Emilia-Romagna; 115 manifestazioni, 27 comuni verificati, ricerca chiusa con limiti documentati e pubblicazione verificata il 17 ottobre 2026.
- [x] **24. Ravenna** — Emilia-Romagna
- [x] **25. Forlì-Cesena** — Emilia-Romagna; 88 manifestazioni, 30 comuni verificati, ricerca chiusa con limiti documentati e pubblicazione verificata il 17 ottobre 2026.
- [x] **26. Piacenza** — Emilia-Romagna; 111 manifestazioni in 37 comuni, 46 comuni verificati, ricerca documentale chiusa con limiti espliciti e pubblicazione verificata il 18 ottobre 2026. Fonti/esclusioni in `data/fiere-piacenza.json` e `data/FIERE.md`; manutenzione futura separata.
- [x] **27. Udine** — Friuli-Venezia Giulia; 89 manifestazioni in 48 comuni, ricognizione 134 comuni, ricerca documentale corrente conclusa con limiti espliciti e pubblicazione verificata il 18 ottobre 2026. Audit `data/fiere-udine.json` e `data/FIERE.md`; manutenzione futura separata.
- [x] **28. Pordenone** — Friuli-Venezia Giulia; 86 manifestazioni in 29 comuni, ricognizione 50 comuni, ricerca documentale conclusa con limiti espliciti e pubblicazione verificata il 18 ottobre 2026. Audit `data/fiere-pordenone.json` e `data/FIERE.md`; verifiche periodiche separate.
- [x] **29. Ferrara** — Emilia-Romagna: ricerca documentale conclusa e verificata online (18 ottobre 2026).
  115 manifestazioni in 21 comuni, prima 13: +102; 79 schede con date puntuali,
  otto sintesi di costo. Tutti i 13 ID preservati e altre 4.541 schede identiche.
  Copertura, 479 ricevute, 25 esclusioni e limiti in `data/fiere-ferrara.json`
  e `data/FIERE.md`; originali `Documents/ricerca-fiere-ferrara-20261018`.
  Ostellato riuso 11/18/25 ottobre; Copparo 25–28 settembre; Mirabello banchi
  24–25 e street food 23–25 distinti. Goro/Paninfesta conflitti testuali;
  storici 2025 e ricorrenze di piano non trasformati in conferme 2026.
  Pubblicato `5be1d21`, Vercel riuscito: quattro asset identici online,
  115 pagine HTTP200 con H1/canonical; PLAYWRIGHT_MODULE Chromium1440/320 e
  WebKit390, elenco/mappa, 13 dialog e pagine senza JS passati locale/online.
  Build, settori, 4.656 pagine/1.966 sitemap e suite generale cinque formati
  passati; controllo segreti senza bypass. Nessun contatto/invio a terzi.
  Copia `ricerche-fiere-20261018-213227`: 33,390 file SHA256 verificati,
  zero errori; manifest controllato, dettagli FIERE.md. Cache JS82/JSON57.
- [ ] **Ferrara — verifiche periodiche**: nuove edizioni, tariffe, bandi,
  disponibilità e giorni dei singoli banchi; ulteriori originali per conflitti
  Goro/Paninfesta/Mezzogoro, programmi Migliarino/Tamara e per le esclusioni.
  Manutenzione futura distinta dalla ricerca corrente conclusa, senza
  promessa di censimento esaustivo o attesa di futuri bandi.
- [x] **30. Lucca** — Toscana: ricerca documentale conclusa e verificata online (19 ottobre 2026).
  127 manifestazioni/33 comuni, quattro costi originali; limiti espliciti
  in data/fiere-lucca.json e data/FIERE.md. Pubblicato f0dc8ce, Vercel READY;
  127 pagine e suite browser online verificate prima della spunta.
- [ ] **Lucca — verifiche periodiche**: nuovi bandi, tariffe e disponibilità,
  calendari natalizi e conferme annuali, recupero futuro degli allegati
  oggi non accessibili. Manutenzione distinta dalla ricerca attuale conclusa.
- [x] **31. Pisa** — Toscana; ricerca documentale corrente conclusa e verificata online il 19 ottobre 2026.
  144 manifestazioni in 36 comuni, ricognizione di tutti i 37; prima due: +142.
  Catalogo4.923, due ID e altre4.779 schede preservati. Audit
  `data/fiere-pisa.json` e `data/FIERE.md`:458 ricevute,22 gruppi di esclusioni,
  limiti espliciti e verifiche future separate.128 date puntuali, sei periodi,
  dieci ricorrenze;20 schede soltanto2025. Quattro costi originali/condizionati.
  Santa Maria a Monte: mercatino sospeso, nessuna ripresa presunta.
  Pubblicato `3d597fb`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/GPr8axtneQmwZcBDNbLDkf22Bt1Q): quattro asset identici,
  144 pagineHTTP200 H1/canonical. Suite Pisa locale/online con PLAYWRIGHT_MODULE
  Chromium1440/320 e WebKit390; generale cinque formati, settori e
  4.923 pagine/2.237 sitemap passati. Un timeout nazionale320 ripetuto con esito
  positivo; nessuna modifica a logica o dati di altre province. JS84/JSON59.
  Fonti/prove `Documents/ricerca-fiere-pisa-20261019`; nessun contatto a terzi.
  Copia `ricerche-fiere-20261019-121306`: 35,700 file,
  6,540,512,148 byte verificatiSHA256, zero errori; manifest controllato.
  Supplemento finale con fonti e prove aggiornate conservato e verificato.
- [ ] **Pisa — verifiche periodiche**: nuovi bandi, disponibilità, quote e Natale2026;
  eventuale ripresa Pulci Santa Maria a Monte e avvio riuso Pontedera;
  originali Pomarance/Castello in Fiore se tornano accessibili, conferme dei
  giorni di banco e nuove edizioni. Manutenzione futura distinta dalla ricerca
  attuale chiusa con limiti; non richiede attesa di nuovi atti o altre province.
- [x] **32. Pistoia** — Toscana; ricerca documentale corrente conclusa e verificata online il 19 ottobre 2026.
  117 manifestazioni in19 comuni, copertura nominativa20; prima zero.
  Catalogo5.040, altre4.923 schede identiche. Audit `data/fiere-pistoia.json`
  e `data/FIERE.md`:331 ricevute originali,23 gruppi di esclusioni, limiti
  espliciti e manutenzione futura separata.112 date puntuali, due periodi,
  tre ricorrenze, dieci schede solo2025; cinque costi e cinque termini.
  Pistoia ammesse/calendario distinte da autorizzazioni; Chiesina nessun
  giorno certo, Montale allegati piano non disponibili anche nel browser,
  albo Monsummano500: nessun dato inventato né garanzia di censimento.
  Pubblicato `2f3c578`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/GBbP1kUHzxgUKdHHgchiRUzM2Ubn);
  quattro asset identici e117 pagine HTTP200 H1/canonical. Suite Pistoia
  locale/online con PLAYWRIGHT_MODULE Chromium1440/320 e WebKit390;
  generale cinque formati, settori,5.040 pagine/2.103 sitemap passati.
  Originali/prove `Documents/ricerca-fiere-pistoia-20261019`; copia
  `ricerche-fiere-20261019-200640`,37.540 file SHA256, zero errori,
  manifest controllato e supplemento finale. JS88/JSON60, segreti verificati.
  Nessun contatto a terzi; file estranei e nuovi commit fiere salvate preservati.
- [ ] **Pistoia — verifiche periodiche**: nuove edizioni, Natale2026 dove ancora
  non pubblicato, bandi/quote e disponibilità reali; eventuali nuovi allegati
  Montale, ripristino albo Monsummano, autorizzazioni/riserve Pistoia e
  affidamento Frittella di Riso Chiesina. Manutenzione futura distinta
  dalla ricerca corrente conclusa; non richiede attesa di nuovi atti.
- [x] **33. Genova** — Liguria
  274 manifestazioni/47 comuni, copertura67; pubblicazione verificata20/10.
  Audit `data/fiere-genova.json`, fonti e limiti `data/FIERE.md`.
  Ricerca corrente conclusa; nuovi bandi, allegati e calendari sono
  manutenzione futura, distinta dai limiti documentali già registrati.
- [x] **34. Alessandria** — Piemonte; ricerca documentale corrente conclusa
  con limiti espliciti e verificata online il 20 ottobre 2026: 158 manifestazioni
  in 75 comuni, ricognizione di 187, 117 aggiunte. Audit `data/fiere-alessandria.json`,
  fonti/esclusioni/limiti `data/FIERE.md`;158pagine e catalogo online verificati.
- [ ] **Alessandria — verifiche periodiche**: nuovi bandi, quote/disponibilità,
  allegati oggi inaccessibili, conflitto Molino dei Torti e termine Natale
  Castelletto; coordinamento termini San Sebastiano e nuove edizioni.
  Manutenzione futura distinta dalla ricerca corrente conclusa; nessuna
  attesa di futuri atti né promessa di censimento esaustivo.
- [x] **35. Asti** — Piemonte; ricerca documentale corrente conclusa con limiti
  espliciti e verificata online il 20 ottobre 2026: 100 manifestazioni in 49 comuni,
  ricognizione dei 118 luoghi, 72 aggiunte. Audit `data/fiere-asti.json`,
  fonti/esclusioni/limiti `data/FIERE.md`; catalogo e 100 pagine online verificati.
- [ ] **Asti — verifiche periodiche**: nuovi bandi, quote/disponibilità e programmi
  dettagliati; nuove edizioni dei due storici2025 e conferme delle ricorrenze
  Bubbio/Vesime/Moncalvo. Manutenzione futura distinta dalla ricerca attuale
  conclusa con limiti; nessuna attesa di futuri atti o promessa di esaustività.
- [x] **36. Pesaro e Urbino** — Marche; ricerca documentale corrente conclusa
  con limiti espliciti e verificata online il 20 ottobre 2026: 136 manifestazioni
  in 45 chiavi comunali, ricognizione dei 50 Comuni attuali più ex Monteciccardo.
  87 aggiunte e un doppione San Nicola unificato; 114 righe regionali provinciali
  controllate, cinque Montecopiolo escluse perché Rimini. Audit
  `data/fiere-pesaro-urbino.json`, fonti/esclusioni/limiti `data/FIERE.md`;
  catalogo, asset e tutte le 136 pagine online verificati, test browser passati.
- [ ] **Pesaro e Urbino — verifiche periodiche**: nuovi bandi, quote e disponibilità;
  programmi dettagliati Candelara/Frontone/Serrungarina, ricorrenze stagionali
  PromoD e registri discordanti, originali annuali Lunano/San Sisto/San Costanzo,
  nuove edizioni dei due storici2025. Ricerca attuale conclusa con limiti;
  manutenzione futura distinta, nessuna attesa di futuri atti o promessa
  di censimento esaustivo.
- [x] **37. Ancona** — Marche: ricerca attuale conclusa con limiti espliciti,
  pubblicata e verificata online (`d04ddc6`, deploy riuscito). 104 manifestazioni
  in 40 comuni, ricognizione47; prima44, +60, ID conservati. Catalogo5.438,
  altre5.334schede identiche. Audit `data/fiere-ancona.json`, fonti/esclusioni/
  limiti `data/FIERE.md`;35gruppi ricerca,587ricevute,65righe regionali.
  Originali/SUAP/organizzatori, cinque fonti secondarie dichiarate, date
  discordanti e vecchie non inventate. 104pagine200, quattro asset identici,
  browser online3 e generale5 passati; prove archivio provinciale privato.
  Ricerca corrente chiusa, nessuna promessa di censimento assoluto.
  - [ ] Manutenzione periodica Ancona: nuovi bandi, programmi stagionali,
    quote e disponibilità; distinta dalla ricerca documentale conclusa.
- [x] **38. Perugia** — Umbria; ricerca documentale corrente conclusa,
  pubblicata e verificata online21/10:152manifestazioni/47comuni,59esaminati.
  DieciID conservati,altre5428schede identiche,29esclusioni/14limiti espliciti.
  Commit e4042b4,Vercel riuscito;152pagine e4asset verificati,browser locale/online
  Chromium1440/320 eWebKit390 e suite generale5formati passati. Nessun invio a terzi.
  - [ ] Manutenzione periodica Perugia: nuovi bandi/edizioni,rettifiche,
    tariffe e posti effettivi;Cannara,Scheggia,allegatiSanGiustino e aperture
    natalizie. Distinta dalla ricerca corrente conclusa,non altra provincia.
- [x] **39. Napoli** — Campania; ricerca corrente conclusa con limiti espliciti,
  76 manifestazioni/28 comuni, 92 comuni esaminati; pubblicata 594abc8 e verificata
  online: quattro asset identici, 76 pagine e tre prove browser superati.
  Copertura, 36 esclusioni e 17 limiti in data/fiere-napoli.json e data/FIERE.md.
  - [ ] Manutenzione periodica Napoli: nuove edizioni, disponibilità, tariffe,
    allegati Forio e calendari discordanti; distinta dalla ricerca corrente.
- [x] **40. Bari** — Puglia; ricerca corrente conclusa con limiti espliciti,
  90 manifestazioni/36 comuni,41 comuni esaminati; pubblicata6b5471f e verificata
  online: quattro asset identici,90 pagine e tre prove browser superati.
  Copertura,19 esclusioni e17 limiti in data/fiere-bari.json e data/FIERE.md.
  - [ ] Manutenzione periodica Bari: nuove edizioni, rettifiche, quote, posti
    effettivi e calendari natalizi; distinta dalla ricerca corrente conclusa.
- [x] **41. Salerno** — Campania; ricerca documentale corrente conclusa con
  limiti espliciti, pubblicata e verificata online il 21/10: **85 manifestazioni
  in 49 comuni**, ricognizione dei 158 comuni; 84 aggiunte, ID iniziale conservato.
  Otto sintesi costo e otto scadenze, anche passate; 36 esclusioni e 25 limiti
  in `data/fiere-salerno.json` e `data/FIERE.md`. Altre 5.739 schede identiche.
  Pubblicazione `5742df9`: 85 pagine e catalogo online verificati; Chromium 1440/320
  e WebKit 390 locali/online, pagine senza JS e suite generale superati.
  Backup preventivo e supplemento SHA256 verificati; nessun invio a terzi.
  - [ ] Manutenzione periodica Salerno: nuovi bandi, rinvii, tariffe e posti
    effettivi; recuperi Hortus/Ascea/Colliano e regolamento Mojoca quando
    pubblici. Distinta dalla ricerca corrente conclusa, senza attendere bandi futuri.
- [x] **42. Siena** — Toscana; ricerca documentale corrente conclusa con limiti
  espliciti, pubblicata `016bd57` e verificata online il 21/10: **85 manifestazioni
  in 33 comuni**, tutti i 35 comuni esaminati; 84 aggiunte e ID iniziale conservato.
  Audit `data/fiere-siena.json`, fonti/28 esclusioni/15 limiti in `data/FIERE.md`.
  Catalogo 5.908, altre 5.823 schede identiche; 85 pagine HTTP200 con H1/canonical
  e costi corretti, quattro asset identici al commit. Chromium 1440/320 e WebKit
  390 locali/online, pagine senza JS, suite generale e generazione superati.
  Backup e supplemento SHA256 verificati; nessun contatto a terzi.
  - [ ] Manutenzione periodica Siena: nuovi bandi/quote/posti, rettifica estate
    Siena, giorni Natale Montepulciano, nuovi originali Sarteano/Charta/Gallina,
    chiarimenti Trequanda/Sinalunga; distinta dalla ricerca attuale conclusa.
- [x] **43. Livorno** — Toscana; ricerca corrente conclusa con limiti espliciti: 63 manifestazioni in 17 comuni, 19 esaminati; pubblicazione e verifica online concluse il 21 ottobre 2026. Audit `data/fiere-livorno.json` e `data/FIERE.md`; verifiche periodiche future distinte.
- [x] **44. Savona** — Liguria; ricerca attuale conclusa con limiti espliciti: 293 manifestazioni in 42 comuni, tutti i 69 esaminati; pubblicazione e verifica online concluse il 22 ottobre 2026. Audit `data/fiere-savona.json` e `data/FIERE.md`.
  - [ ] Manutenzione periodica Savona: nuovi bandi, quote e disponibilità; discordanza San Matteo Borghetto, ricorrenze Albisola e fonti non accessibili. Distinta dalla ricerca documentale attuale conclusa.
- [x] **45. La Spezia** — Liguria;164 manifestazioni in26comuni,32esaminati. Ricerca documentale chiusa con limiti espliciti, pubblicazione e catalogo verificati22/10/2026; audit data/fiere-la-spezia.json e data/FIERE.md. Manutenzione futura separata.
- [x] **46. Vercelli** — Piemonte;102manifestazioni in42comuni,82esaminati. Ricerca documentale corrente conclusa con limiti espliciti, pubblicazione e catalogo verificati22/10/2026; audit `data/fiere-vercelli.json` e `data/FIERE.md`. Manutenzione futura separata.
- [x] **47. Biella** — Piemonte;61manifestazioni in26comuni, tutti74esaminati. Ricerca documentale corrente conclusa con limiti espliciti, pubblicazione e catalogo verificati23/10/2026; audit `data/fiere-biella.json` e `data/FIERE.md`. Manutenzione futura separata.
- [x] **48. Sondrio** — Lombardia;90manifestazioni in38comuni, tutti77esaminati,
  65aggiunte e25ID conservati. Ricerca documentale corrente conclusa con19limiti
  e18gruppi di esclusioni espliciti, pubblicata `4fe8b8c` e verificata online
  il23/10/2026: quattro asset identici,90pagine200/H1/canonical/contenuti,
  Chromium1440/320 e WebKit390 locali/online e sito reale senza intercettazioni.
  Audit `data/fiere-sondrio.json` e `data/FIERE.md`; nessun contatto a terzi.
  - [ ] Manutenzione periodica Sondrio: nuovi bandi, quote, rinvii e posti
    effettivi; Samolaco/Delebio oggi non accessibili, calendari natalizi e
    ricorrenze non puntuali. Distinta dalla ricerca documentale attuale conclusa.
- [x] **49. Belluno** — Veneto; ricerca documentale corrente conclusa con
  limiti espliciti e verificata online il 23 ottobre 2026. **134 manifestazioni
  in 43 comuni**, tutti i60comuni attuali esaminati; +121,13ID e6.330schede
  esterne conservati. Catalogo6.464,6.261con dati edizione; dieci sintesi costo.
  Audit `data/fiere-belluno.json` e `data/FIERE.md`:94righe sagre,32voci fiere
  più refuso Lendinara escluso,5antiquariato,254URL DMO e429record API non
  equivalenti a eventi unici;518ricevute,20esclusioni/24limiti,nessuna pista
  documentale praticabile aperta. Otto schede solo storiche; conflitti e
  documenti inaccessibili espliciti, nessuna data/quota inventata.
  Pubblicato a31001a, Vercel riuscito: quattro asset identici e134pagine200
  con H1/canonical/note/costi. Locale/online Chromium1440/320+WebKit390,
  tutti134dialoghi e quattro pagine senza JS per formato; sito reale tre
  formati senza errori/overflow. Settori,6.464pagine/2.790sitemap,cinque
  formati generali e build ripetibile passati. CacheJS109/JSON77.
  Originali/prove `Documents/ricerca-fiere-belluno-20261023`; supplemento
  SHA256 nel backup precedente verificato,nessuna comunicazione a terzi.
  - [ ] Manutenzione periodica Belluno: nuovi bandi, quote, disponibilità,
    conferme di ricorrenze/storici e calendari discordanti; recupero futuro
    di allegati non accessibili. Attività futura distinta dalla ricerca
    attuale conclusa; non attesa di documenti futuri o garanzia esaustiva.
- [x] **50. Gorizia** — Friuli-Venezia Giulia; ricerca documentale attuale
  conclusa con limiti espliciti e verificata online il 23 ottobre 2026.
  **45 manifestazioni in 13 comuni**, tutti i **25 comuni** esaminati;
  **43 aggiunte**, due ID e altre **6.462 schede** conservati. Catalogo
  **6.507**, 6.306 con dati edizione; quattro sintesi costo, inclusa Gusti
  preesistente. Audit `data/fiere-gorizia.json` e `data/FIERE.md`: 65 righe
  candidate controllate, 4.029 eventi/3.336 notizie restituiti (non eventi
  unici), 25 ricerche UNPLI/49 dettagli, 530 ricevute, 18 gruppi esclusioni,
  24 limiti e nessuna pista documentale praticabile lasciata aperta.
  Sant'Andrea 5–7 dicembre distinto dal parco; casette Monfalcone 3–26
  dicembre e domanda 9 novembre ore 12, cauzione distinta dalla quota;
  Mis Mas 6 dicembre, 10 euro e adesioni 7 novembre. Otto schede soltanto
  2025; ricorrenze, conflitti e periodi indicativi espliciti, nessun giorno
  o costo inventato. Soffitta Collio da stampa locale dichiarata.
  Pubblicato `0573e54`, Vercel READY: quattro asset identici, 45 pagine
  200/H1/canonical/note/costi; locale/online Chromium1440/320 e WebKit390
  tramite PLAYWRIGHT_MODULE, tutti i45dialoghi e quattro pagine senza JS
  per formato; sito reale nei tre formati senza errori/overflow. Settori,
  6.507pagine/2.823sitemap, cinque formati generali e build ripetibile passati.
  Originali/prove `Documents/ricerca-fiere-gorizia-20261023`; tag e ramo
  preventivi remoti, copia SHA256 `ricerche-fiere-20261023-171940` con
  76.031file/12.455.312.441byte, zero errori e supplemento finale verificato.
  CacheJS110/JSON78. Nessun contatto, invio o candidatura a terzi;
  file estranei e modifiche documentali concorrenti preservati.
  - [ ] Manutenzione periodica Gorizia: nuovi bandi, quote, disponibilità,
    conferme di ricorrenze/storici e programmi oggi provvisori; allegati
    scaduti e futuri calendari degli organizzatori. Attività futura distinta
    dalla ricerca corrente conclusa, senza attesa di documenti non pubblicati.
- [x] **51. Rovigo** — Veneto; ricerca documentale attuale conclusa con
  limiti espliciti e verificata online il 23 ottobre 2026. **63 manifestazioni
  in 32 comuni**, tutti i **50 comuni** esaminati, **60 aggiunte**; tre ID
  precedenti e **6.504 schede esterne** conservati. Catalogo **6.567 schede**,
  **6.366 con dati edizione**. Audit `data/fiere-rovigo.json` e `data/FIERE.md`:
  33 righe sagre, cinque fieristiche e sei antiquariato; 134 candidati UNPLI,
  1.404 ricevute, 29 gruppi di esclusioni e 26 limiti, nessuna pista documentale
  oggi praticabile aperta. Nove schede solo storiche 2025, ricorrenze testuali,
  conflitti espliciti e due quote CISAR distinte per sede/edizione.
  Pubblicato `fbc0f86`, Vercel READY: quattro asset identici, tutte le 63 pagine
  HTTP200/H1/canonical/note/costi; locale e online Chromium 1440/320 e WebKit
  390 tramite PLAYWRIGHT_MODULE, 63 dialoghi e quattro pagine senza JS per
  formato; sito reale nei tre casi senza errori o overflow. Generale cinque
  formati, settori, 6.567 pagine/2.835 voci sitemap e build ripetibile passati.
  Cache JS111/JSON79. Originali e prove `Documents/ricerca-fiere-rovigo-20261023`;
  tag e ramo preventivi remoti, copia SHA256 `ricerche-fiere-20261023-203424`:
  80.501 file, 13.180.069.453 byte, zero errori; supplemento finale verificato.
  File estranei e commit concorrenti preservati; nessuna comunicazione a terzi.
  - [ ] Manutenzione periodica Rovigo: nuove edizioni/Natale 2026, bandi,
    quote, disponibilità, rinvii, conferme delle ricorrenze/storici e sedi
    discordanti; documenti oggi non accessibili. Attività futura distinta
    dalla ricerca attuale conclusa, senza attesa di futuri bandi.
- [x] **52. Verbano-Cusio-Ossola** — Piemonte — **ricerca documentale attuale
  conclusa e verificata il 24 ottobre 2026**, con limiti espliciti. Ricognizione
  dei **74 comuni**: **88 manifestazioni in 37 comuni**, **86 aggiunte**,
  entrambi gli ID preesistenti conservati e **6.565 schede esterne identiche**
  al checkpoint `5c94b20`. Catalogo **6.653 schede**, **6.447 con dati edizione**.
  Audit `data/fiere-verbano-cusio-ossola.json` e `data/FIERE.md`: otto righe
  regionali, 166 candidati territoriali, 1.797 ricevute e 31 PDF; originali
  letti, brochure Cannobio 68 pagine tramite OCR e lettura visiva, Malesco
  44 pagine recuperate anche in browser. Albi/SUAP e organizzatori mirati,
  15 gruppi di esclusioni, 25 limiti, sei piste chiuse e nessuna verifica
  documentale oggi praticabile lasciata aperta. Nove schede soltanto 2025 e
  cinque ricorrenze senza anno certo distinte dal calendario confermato.
  Giorni commerciali separati dalle feste: Omegna due weekend e area food
  distinta, Cannero due weekend, BiancoLatte 4 ottobre, San Bernardo 4–5 luglio.
  Tre quote qualificate: Cambiasca occupazione 3×3 m gratuita, Craveggia 25 €
  discordanti dal regolamento, Pieve 10 € in locandina riprodotta senza anno.
  Nessuna disponibilità o ammissione promessa; fonti secondarie e documenti
  non recuperati dichiarati. Nessuna comunicazione o domanda inviata a terzi.
  Pubblicato `1dee01b`, deploy Vercel **success**, cinque asset identici;
  tutte le 88 pagine HTTP200/H1/canonical/note/costi. Locale e online Chromium
  1440/320 e WebKit 390 con `PLAYWRIGHT_MODULE`, 88 dialoghi e otto pagine
  senza JS per formato; sito reale senza intercettazioni, errori o overflow.
  Generale cinque formati, settori, 6.653 pagine/2.853 voci sitemap e build
  ripetibile passati. Cache JS112/JSON80. Originali e prove in
  `Documents/ricerca-fiere-verbano-cusio-ossola-20261024`; tag e ramo preventivi
  remoti verificati, snapshot SHA256 `ricerche-fiere-20261023-234636`: 86.188
  file, 13.722.932.788 byte, zero errori e supplemento provinciale verificato.
  Modifiche estranee preservate ed escluse dai commit.
  - [ ] Manutenzione periodica Verbano-Cusio-Ossola: nuovi calendari e bandi,
    Natale 2026 dove manca conferma, quote e clausole discordanti, rinvii,
    disponibilità, conferme delle ricorrenze e documenti oggi non accessibili.
    Attività futura distinta dalla ricerca attuale conclusa, senza attesa
    di futuri bandi né garanzia di censimento esaustivo.
- [x] **53. Imperia** — Liguria
  Ricerca accessibile attuale conclusa con limiti espliciti e verificata online:
  **197 schede in 35 comuni**, ricognizione dei **66 comuni**; 120 ID conservati,
  77 aggiunti, due esclusi con motivazione, 6.531 schede esterne identiche.
  Fonti, copertura, esclusioni e piste chiuse in `data/fiere-imperia.json` e
  `data/FIERE.md`. Pubblicazione `67becd8`, Vercel success, cinque asset e
  197 pagine verificati; test locali e online Chromium/WebKit passati.
  Backup remoti e copia integrale SHA256 (91.484 file, zero errori), supplemento
  finale verificato. Lavoro estraneo preservato, nessun contatto o invio a terzi.
  - [ ] Manutenzione periodica Imperia: nuove edizioni, rinvii e cadenze,
    quote/posteggi e moduli, Cargo/Perinaldo/antiquariato discordanti, documenti
    oggi non pubblicati o accessibili. Attività futura distinta dalla ricerca
    attuale conclusa, senza attendere bandi futuri né garantire esaustività.
- [x] **54. Massa-Carrara** — Toscana; ricerca documentale attuale conclusa con limiti espliciti, pubblicata e verificata online il 24 ottobre 2026.
  117 manifestazioni in 15 comuni, tutti i 17 comuni esaminati; prima zero
  schede e nessun audit provinciale nel checkout. 6.728 eventi esterni identici,
  catalogo 6.845. Audit `data/fiere-massa-carrara.json` e `data/FIERE.md`:
  1.470 ricevute, 113 candidati territoriali, quattro righe BURT, 12 AEFI e
  30 IMM; 17 schede solo storiche 2025, 12 senza giorno certo, tre costi parziali.
  Dati `44799c5`, Vercel riuscito `GdrxmtDUyRjrbBQp37kFCp7JmgKd`: sei file
  identici, 117 pagine 200/H1/canonical/note/costi; locale e online tutti i
  dialoghi in Chromium 1440/320 e WebKit 390 tramite PLAYWRIGHT_MODULE, più sito
  reale nei tre formati. Settori, 6.845 pagine/2.880 sitemap, cinque formati
  generali e build ripetibile passati. TO DO 61/49 aggiornata solo dopo verifica.
  Originali/prove `Documents/ricerca-fiere-massa-carrara-20261024`; backup remoto,
  copia SHA256 97.867 file e supplemento provinciale 6.366 file, zero errori.
  Nessun contatto a terzi; modifiche estranee preservate ed escluse dai commit.
  - [ ] Manutenzione periodica Massa-Carrara: nuovi bandi e quote/posteggi,
    calendari natalizi non ancora pubblicati, ricorrenze e rinvii, originali
    oggi inaccessibili e conflitti di programma. Attività futura distinta
    dalla ricerca attuale conclusa, senza attendere pubblicazioni future.
- [x] **55. Grosseto** — Toscana; ricerca documentale attuale conclusa con limiti espliciti, pubblicata e verificata online il 24 ottobre 2026.
  86 schede in24comuni,28comuni ricontrollati,85aggiunte;49date puntuali,
  37periodi,4storiche2025 e4sintesi di costo. Audit e fonti in
  `data/fiere-grosseto.json` e `data/FIERE.md`; 6.844 eventi esterni identici.
  Campagnatico, Capalbio, Giglio e Seggiano senza nuova scheda: prove
  commerciali attuali insufficienti, tentativi ed esclusioni documentati.
  - [ ] Manutenzione periodica Grosseto: nuove conferme annuali, bandi e quote,
    originali oggi inaccessibili, conflitti di programma e calendari futuri.
    Attività distinta dalla ricerca accessibile conclusa; non attenderli per
    la chiusura attuale e non presumere ammissioni o disponibilità.
- [x] **56. Valle d'Aosta/Vallée d'Aoste** — Valle d'Aosta: ricerca accessibile attuale conclusa con limiti espliciti, pubblicata e verificata il 25 ottobre 2026.
  91 manifestazioni in 38 comuni, ricognizione di 74 comuni; dieci ID e 6.920 schede esterne
  conservati. Audit `data/fiere-valle-aosta.json` e `data/FIERE.md`: 15 righe
  regionali, 558 ricevute tecniche, 24 piste chiuse, 30 limiti, 17 gruppi di esclusioni.
  Dati `42e72ef`, Vercel riuscito; cinque asset identici, 91 pagine e browser
  locale/online Chromium 1440/320 e WebKit 390 verificati.
  - [ ] Manutenzione periodica Valle d'Aosta: nuove edizioni, bandi, quote,
    disponibilità, documenti non pubblicati/inaccessibili e programmi futuri.
    Attività distinta dalla ricerca conclusa; non attenderli per la chiusura.
- [x] **57. Macerata** — Marche. Ricerca documentale attuale conclusa con limiti
  espliciti e pubblicata/verificata il 25 ottobre 2026: **177 manifestazioni in
  47 comuni**, ricognizione di tutti i 55 comuni; 116 aggiunte, 61 ID e 6.950
  schede esterne conservati. Audit `data/fiere-macerata.json` e `data/FIERE.md`:
  121 righe regionali, cinque fieristiche, 1.294 ricevute tecniche, 30 gruppi
  di piste chiuse, 20 esclusioni e 33 limiti. Dati `1eddab3`, Vercel riuscito;
  cinque asset identici, 177 pagine e tutti i dettagli nei tre formati browser,
  locale/online e sito reale verificati tramite PLAYWRIGHT_MODULE.
  - [ ] Manutenzione periodica Macerata: nuove edizioni, bandi, quote e posti;
    allegati Recanati/Civitanova Eventi, programmi Cibaria/Mielemente, chiarimenti
    Elettronica e giorni ancora indicativi solo quando emergono nuove fonti.
    Attività distinta dalla ricerca attuale conclusa, senza attesa di futuri bandi.
- [x] **58. Fermo** — Marche. Ricerca documentale attuale conclusa con limiti
  espliciti e pubblicata/verificata il 25 ottobre 2026: **86 manifestazioni in
  31 comuni**, ricognizione dei 40 comuni; 63 aggiunte, 23 ID e 7.104 schede
  esterne conservati. Audit `data/fiere-fermo.json` e `data/FIERE.md`: 45 righe
  fiere, 60 mercati ordinari vagliati e una riga specializzata; 858 ricevute,
  16 gruppi di piste chiuse, 13 esclusioni, 25 limiti e sei sintesi costo.
  Dati `cef401b`, deploy `21f5dff` Vercel riuscito: cinque asset identici e tutte
  le 86 pagine HTTP200; browser locale/online e sito reale nei tre formati via
  PLAYWRIGHT_MODULE. Catalogo 7.190; TO DO 65/45 aggiornata dopo verifica.
  Originali/prove e backup del solo dossier Fermo verificati SHA256, dettagli
  in FIERE.md. Nessun contatto a terzi o altra provincia lavorata.
  - [ ] Manutenzione periodica Fermo: nuove edizioni, bandi, quote e posti,
    Natale futuro e nuovi documenti per conflitti/pagine inaccessibili descritti
    nell’audit. Attività distinta dalla ricerca attuale conclusa, senza attendere
    futuri bandi per la chiusura.
- [x] **59. Ascoli Piceno** — Marche — ricerca documentale attuale conclusa con
  limiti espliciti il 25/10/2026: **98 manifestazioni in 29 comuni**, ricognizione
  di tutti i 33 comuni; 39 ID conservati, 59 aggiunte, 7.151 schede esterne identiche.
  Audit di 89 righe fiere, 112 mercati e tre righe specializzate; 443 ricevute,
  21 gruppi di piste chiuse, 12 esclusioni, 28 limiti e cinque sintesi di costo.
  Dati `977a65d`, cinque asset identici e tutte le 98 pagine HTTP200 verificate;
  browser locale/online e sito reale nei tre formati con PLAYWRIGHT_MODULE.
  Catalogo **7.249**, riepilogo **66 concluse / 44 rimanenti**, aggiornati solo
  dopo verifica. Originali e prove conservati con backup SHA256: dettagli in
  data/FIERE.md. Nessuna altra provincia lavorata, nessun contatto a terzi.
  - [ ] Manutenzione periodica Ascoli Piceno: nuove edizioni, bandi, quote,
    graduatorie/rinunce e conferme dei Natali futuri. Attività distinta dalla
    ricerca corrente conclusa; nessun documento futuro atteso per chiuderla.
- [x] **60. Pescara** — Abruzzo — ricerca documentale attuale conclusa con
  limiti espliciti e pubblicata/verificata il 25 ottobre 2026: **49 manifestazioni
  in 21 comuni**, ricognizione dei 46 comuni; 46 aggiunte, tre ID e 7.246 schede
  esterne identiche. Audit `data/fiere-pescara.json` e `data/FIERE.md`: quattro
  righe regionali, 71 schede UNPLI, 695 ricevute, 37 gruppi di piste chiuse,
  28 esclusioni, 34 limiti e quattro sintesi costo. Originali e tentativi nel
  dossier Pescara; 674 acquisizioni confrontate SHA256, backup privato verificato.
  Dati `207e1be`, Vercel riuscito: cinque asset identici, tutte le 49 pagine
  HTTP 200, browser locale/online e sito reale nei tre formati tramite
  PLAYWRIGHT_MODULE. Build, settori, suite generale e pagine passati.
  Catalogo **7.295**, riepilogo **67 concluse / 43 rimanenti**, aggiornati solo
  dopo verifica. Nessun'altra provincia lavorata o contatto a terzi; modifiche
  ADS e file estranei preservati. Chiusura attuale distinta dalle conferme future.
  - [ ] Manutenzione periodica Pescara: nuovi bandi, quote, graduatorie e posti;
    conferme Natale e Catignano, ripresa Mercanti, prossima sede/data Caccia
    all'Affare e Mercantico, programmi 2027 e nuovi originali per gli eventi
    secondari/esclusi. Attività futura distinta dalla ricerca conclusa, senza
    attendere documenti ancora non pubblicati o non accessibili.
- [x] **61. Teramo** — Abruzzo — ricerca documentale attuale conclusa con
  limiti espliciti, pubblicata e verificata il 26/10/2026: **80 manifestazioni
  in 32 comuni**, ricognizione nominale dei 47 comuni, due ID conservati,
  78 aggiunte e 7.293 schede esterne identiche. Audit `data/fiere-teramo.json`
  e `data/FIERE.md`: 953 ricevute, 125 schede UNPLI, 56 voci FIVA, 28 piste
  chiuse, 27 esclusioni e 11 limiti; SHA256 verificati per 941 originali.
  Dati `0b7cd50`, Vercel riuscito: quattro asset identici ai blob Git e tutte
  le 80 pagine HTTP200/H1/canonical. Test locali e online nei tre formati con
  PLAYWRIGHT_MODULE, sito reale senza sostituzione script; generale, settori,
  build e pagine passati. Catalogo **7.373**, riepilogo **68 concluse / 42
  rimanenti** aggiornato dopo verifica. Originali e prove nel dossier esterno.
  Nessun contatto a terzi o altra provincia lavorata; file estranei preservati.
  - [ ] Manutenzione periodica Teramo: nuovi bandi, quote, graduatorie, modifiche
    e conferme annuali/Natale future, ripresa dei documenti non accessibili.
    Attività futura distinta dalla ricerca conclusa, senza attendere nuovi bandi.
- [x] **62. Chieti** — Abruzzo — ricerca documentale attuale conclusa con
  limiti espliciti, pubblicata e verificata il 26 ottobre 2026: **82 manifestazioni
  in 31 comuni**, ricognizione nominale dei 104 comuni; quattro ID conservati,
  78 aggiunte e 7.369 schede esterne identiche. Audit `data/fiere-chieti.json`
  e `data/FIERE.md`: cinque righe regionali locali, 236 schede UNPLI vagliate,
  2.141 ricevute tecniche, 35 gruppi di piste chiuse, 33 esclusioni e tre sintesi
  costo. Date programmate e confermate, storico 2025 e oneri parziali distinti;
  Vasto Cioccolato annullato escluso. Dati `b6d1bab`, quattro asset identici
  ai blob Git e tutte le 82 pagine HTTP200 con H1/canonical, note, fonti e costi
  verificati. Browser locale/online e sito reale nei tre formati tramite
  PLAYWRIGHT_MODULE, build, settori, suite generale e pagine passati.
  Catalogo **7.451**, riepilogo **69 concluse / 41 rimanenti**, aggiornati solo
  dopo verifica. Originali, prove e backup SHA256 conservati nel dossier privato;
  dettagli in FIERE.md. Nessun contatto a terzi o altra provincia lavorata.
  - [ ] Manutenzione periodica Chieti: nuovi bandi, quote, graduatorie, variazioni
    e conferme annuali, Natale 2026 e documenti non pubblicati/rimossi descritti
    nell’audit. Attività futura distinta dalla ricerca attuale conclusa;
    non occorre attendere futuri bandi per chiudere questa ricerca.
- [ ] **63. Latina** — Lazio
- [ ] **64. Viterbo** — Lazio
- [ ] **65. Frosinone** — Lazio
- [ ] **66. Terni** — Umbria
- [ ] **67. Caserta** — Campania
- [ ] **68. Lecce** — Puglia
- [ ] **69. Cagliari** — Sardegna
- [ ] **70. Sassari** — Sardegna
- [ ] **71. Gallura Nord-Est Sardegna** — Sardegna
- [ ] **72. Palermo** — Sicilia
- [ ] **73. Catania** — Sicilia
- [ ] **74. Messina** — Sicilia
- [ ] **75. Ragusa** — Sicilia
- [ ] **76. Siracusa** — Sicilia
- [ ] **77. Trapani** — Sicilia
- [ ] **78. Barletta-Andria-Trani** — Puglia
- [ ] **79. Brindisi** — Puglia
- [ ] **80. Taranto** — Puglia
- [ ] **81. Foggia** — Puglia
- [ ] **82. Avellino** — Campania
- [ ] **83. Benevento** — Campania
- [ ] **84. L'Aquila** — Abruzzo
- [ ] **85. Matera** — Basilicata
- [ ] **86. Cosenza** — Calabria
- [ ] **87. Catanzaro** — Calabria
- [ ] **88. Reggio Calabria** — Calabria
- [ ] **89. Potenza** — Basilicata
- [ ] **90. Campobasso** — Molise
- [ ] **91. Rieti** — Lazio
- [ ] **92. Agrigento** — Sicilia
- [ ] **93. Oristano** — Sardegna
- [ ] **94. Nuoro** — Sardegna
- [ ] **95. Vibo Valentia** — Calabria
- [ ] **96. Crotone** — Calabria
- [ ] **97. Caltanissetta** — Sicilia
- [ ] **98. Enna** — Sicilia
- [ ] **99. Ogliastra** — Sardegna
- [ ] **100. Sulcis Iglesiente** — Sardegna
- [ ] **101. Medio Campidano** — Sardegna
- [ ] **102. Isernia** — Molise


## ⚡ Velocità e visibilità su Google

- [x] 🔴 Velocizzare il blog — rendere subito disponibile l'articolo in HTML e caricare solo le anteprime nell'elenco.
- [ ] 🟠 Alleggerire il sito e rendere più fluida la navigazione — cache dei file versionati, coordinate e librerie della dashboard caricate quando servono, icone leggere; ridurre gli spostamenti della pagina e ottimizzare paginazione e query degli annunci.
- [ ] 🔴 Sistemare indirizzi e indicizzazione — allineare sitemap e pagine definitive, correggere i 404 e migliorare blog e pagine locali verificando indicizzazione e risultati in Search Console. Prima i problemi che impediscono di trovare o aprire le pagine utili.
- [ ] 🟢 Creare pagine regionali — quando ci sono abbastanza annunci attivi; anticiparle solo nelle regioni con offerta concreta e domanda osservata.

## 👤 Annunci, profilo e avvisi

- [ ] 🔴 Migliorare scadenze e rinnovi — avvisi prima della scadenza e rinnovo rapido, per conservare l'offerta reale senza dover acquisire nuovamente gli stessi inserzionisti.
- [ ] 🟠 Migliorare gli alert — filtri per zona, settore, giorno e prezzo.
- [x] 🟢 Registrare vendite e affitti conclusi — mini modulo privato del24/10: esito, prezzo facoltativo filtrato e canale. Massimo trepassaggi su richiesta corrente, data della dichiarazione registrata automaticamente; nessuna data dell'atto o durata reale della trattativa dedotta. Contratto `data/LISTING_OUTCOMES.md`.
- [ ] 🟠 Salvare il telefono nel profilo — riutilizzare quello inserito nel primo annuncio; intervento circoscritto per facilitare le pubblicazioni successive, riusando la gestione dei contatti già esistente.

## 📊 Statistiche e provenienza degli utenti

- [ ] 🟠 Completare le statistiche — dashboard, grafico e filtri corretti il 17 ottobre; restano le email settimanali.
- [ ] 🔴 Capire da dove arrivano gli utenti — distinguere blog, bandi, valutatore, homepage e fiere; prima una misura essenziale di quali percorsi portano iscrizioni, annunci e contatti, per scegliere dove investire il tempo. Riutilizzare il tracciamento esistente e allinearlo alle scelte privacy.

## ✍️ Blog: un articolo per ogni fiera lombarda importante

Preparare un articolo per ciascun evento, pensato per gli ambulanti: data e luogo, numero e tipo di posteggi, settori ammessi, costi, requisiti, scadenza, domanda, spunta, contatti SUAP e fonti ufficiali. Verificare sempre le informazioni prima della pubblicazione.

Le caselle qui sotto indicano gli articoli completati e pubblicati. Procedere prima con le fiere ambulanti, poi con le sagre e i grandi eventi; valutare a parte le fiere espositive.

**Priorità degli articoli:** 🔴 un primo piccolo gruppo di fiere con opportunità concrete per ambulanti, informazioni ufficiali disponibili e domande ancora aperte o in prossima apertura; 🟠 gli altri articoli sulle fiere ambulanti; 🟢 sagre ed eventi espositivi finché non emerge un'opportunità pertinente. Verificare le scadenze prima di scegliere: l'ordine qui sotto è un catalogo, non una graduatoria di urgenza. Pubblicare pochi articoli utili con collegamenti agli annunci pertinenti e agli avvisi, misurare i risultati e poi scegliere il gruppo successivo.

### 🟠 Fiere ambulanti — selezionare il primo gruppo ad alta priorità

- [ ] Fiera dei SS. Faustino e Giovita — Brescia
- [ ] Oh Bej! Oh Bej! — Milano
- [ ] Antica Fiera di San Martino — Inveruno
- [ ] Fiera di Santa Caterina — Gorgonzola
- [ ] Fiera di Sant'Andrea — Oggiono
- [ ] Fiera regionale di merci e bestiame di Santa Apollonia — Rivolta d'Adda
- [ ] Fiera di San Gaudenzio — Ostiano
- [ ] Fiera di Santa Maria della Croce — Crema
- [ ] Fiera di San Giuseppe — Cernusco sul Naviglio
- [ ] Fiera del Crocifisso — Cantù
- [ ] Fiera della Possenta — Ceresara
- [ ] Fiera di Santa Lucia — Crema
- [ ] Fiera dei SS. Faustino e Giovita — Sarezzo
- [ ] Fiera di San Giuseppe — Pozzolengo
- [ ] Fiera della Sacra Spina — San Giovanni Bianco
- [ ] Fiera di San Paolo — Esine
- [ ] Fiera di Santa Caterina — Besana in Brianza
- [ ] Fiera di San Biagio — Magenta
- [ ] Fiera di Primavera — Paderno Dugnano
- [ ] Fiera autunnale — Busto Garolfo
- [ ] Fiera d'ottobre — Canneto sull'Oglio
- [ ] Fiera di Santa Apollonia — Cantù
- [ ] Fiera di Sant'Andrea — Chiuro
- [ ] Fiera di San Martino — Tirano
- [ ] Fiera di San Martino — Gargnano
- [ ] Fiera d'ottobre — Delebio
- [ ] Fiera di Sant'Ambrogio — Merate
- [ ] Fiera Ognissanti — Brescia
- [ ] Fiera di Sant'Andrea — Concesio
- [ ] Fiera di Santa Apollonia — Abbadia Lariana
- [ ] Fiera di Santa Apollonia — Viganò
- [ ] Fiera di San Martino — Leffe
- [ ] Fiera d'autunno — Parabiago
- [ ] Fera de Dugnan — Paderno Dugnano
- [ ] Fiera della Madunina di Custù — Brescia
- [ ] Fiera Cristo Re — Brescia
- [ ] Fiera di Santa Maria della Vittoria — Brescia
- [ ] Fiera di Natale e Villaggio di Babbo Natale — Assago

### 🟢 Sagre e grandi eventi — anticipare solo opportunità concrete per ambulanti

- [ ] Festa del Torrone — Cremona
- [ ] Fiera Nazionale del Tartufo Bianco — Borgofranco sul Po, Borgocarbonara
- [ ] Mostra del Bitto — Morbegno
- [ ] Morbegno in Cantina — Morbegno
- [ ] Festival della Mostarda — Cremona, Mantova e territorio
- [ ] Franciacorta in Bianco — Castegnato
- [ ] Festa dei Crotti — Albavilla
- [ ] Sagra dal Nedar e Fiuma — San Benedetto Po
- [ ] Sagra di Buscoldo — Curtatone
- [ ] Festa del Salame — Cremona

### 🟢 Da valutare separatamente — grandi fiere espositive

- [ ] Artigiano in Fiera — Rho
- [ ] BIT, Borsa Internazionale del Turismo — Rho
- [ ] MIDO — Rho
- [ ] MICAM Milano — Rho
- [ ] Milano Home — Rho
- [ ] Fa' la cosa giusta! — Rho
- [ ] Fiera Agricola Zootecnica Italiana — Montichiari
- [ ] Fiera Campionaria — Bergamo
- [ ] Mostra dell'Artigianato — Erba
- [ ] Il Bontà e Gusto Divino — Cremona
- [ ] Lombardia Carne — Rovato
- [ ] Bovimac — Gonzaga

<a id="coordinamento-storico"></a>

# Appendice — Coordinamento storico

**Note del 14 ottobre, superate dove indicato.** Venezia è stata ripresa/conclusa nella Parte B: i riferimenti alla sua sospensione sono storici. La riserva Pavia va verificata prima di riprendere; cache sotto = minimi storici, confrontare stato corrente.

- **Mantova conclusa**, sessione manuale in checkout isolato; Venezia allora sospesa. Alla ripresa rileggere stato, preservare `fiere-mantova.json`/voce build e aggiunte concorrenti; minimo JS37/catalogo30.
- **Ore 22:00, Cremona conclusa/verificata online**, checkout `Documents/subingresso-cremona-20261014`; Venezia allora sospesa. Rileggere `origin/main`, preservare Mantova/Cremona (`fiere-cremona.json` + build) e ogni aggiunta; minimo JS38/catalogo31, mai rigenerare da snapshot vecchi. Pavia allora prossima libera, non avviata.
- **Ore 23:03, Pavia riservata alla sessione manuale**, checkout `Documents/subingresso-pavia-20261014`; non avviarla in parallelo senza verificarne lo stato. Prima del push rileggere `origin/main` e mantenere tutte le province integrate. Venezia era ancora sospesa.


Piacenza, 17 ottobre 2026 — integrazione parziale pubblicata `8b962c2`:
47 manifestazioni in 24 comuni, prima quattro; 4.275 eventi esterni identici.
Catalogo 4.322; cache JS71/JSON51. Vercel riuscito, catalogo/audit/HTML/JS
corrispondenti al commit; 47 pagine HTTP200 con H1/canonical esatti e test
provinciale Chromium1440/320 e WebKit390 online passati tramite PLAYWRIGHT_MODULE.
Build, settori e 4.322 pagine locali passati. Ricerca approfondita ancora
incompleta: TO DO non spuntata, riepilogo resta 32 completate e 78 da fare.
Residui documentali in research.openLeads; nessun contatto a terzi.


Affluenza, 17 ottobre 2026 - preferenza corrente: eliminato "almeno" dai bollini. Sei fasce di ingressi/presenze medi al giorno: molto bassa <500; bassa 500-999; media 1.000-4.999; alta 5.000-19.999; molto alta 20.000-99.999; altissima da 100.000. Altissima riservata a volumi eccezionali, senza certificare primati storici: bollino dorato con luce e riflesso, movimento disattivato con prefers-reduced-motion. Fonti, stime e limiti "oltre" nei dettagli; catalogo invariato. Supera le quattro fasce precedenti. Cache fiere JS74/CSS27, fiera CSS3. Test affluenza Chromium1440/320 e WebKit390 passati, incluse nuove soglie, luce e movimento ridotto; 4.322 pagine e 1.625 voci sitemap, navigazione senza JS e dialog verificati. Pubblicato 91d4408; Vercel READY dpl_G1ypKP3vSAnYX6LXCj5Wh66eAPQX. Test dedicato passato anche online Chromium1440/320 e WebKit390; JS/CSS identici al commit e pagina San Faustino con altissima verificata.

Piacenza, 18 ottobre 2026 — ricerca corrente conclusa e verificata online.
111 manifestazioni in 37 comuni (+64 dalle 47 già pubblicate), ricognizione 46
comuni; 99 con data puntuale, 5 sintesi costo. Mercanti, Pontenure/Paderna,
Natale ed Expo verificati con originali/alternative accessibili; esclusioni,
tentativi e limiti nell’audit e in data/FIERE.md. Date dei banchi distinte dalle
feste, vecchie edizioni non proiettate, quote non inventate; nessuna promessa
di esaustività. Commit dati 3ab39be, Vercel riuscito, catalogo/audit/HTML/JS
identici online e 111 pagine HTTP 200/H1/canonical. PLAYWRIGHT_MODULE locale/online
Chromium 1440/320 e WebKit 390 passati; build, settori, 4.386 pagine/1.689 sitemap
e suite generale cinque formati passati. Conservati 47 ID e altre 4.275 schede.
Cache JS77/JSON53; archivio Documents/ricerca-fiere-piacenza-20261018 e prove
Documents/verifica-piacenza-20261018. Backup ricerca verificato con manifest
SHA256: Documents/backup-subingresso/ricerche-fiere-20261018-061412. TO DO e
riepilogo aggiornati dopo verifica: 33 completate, 77 da fare. Nessun contatto
a terzi; file estranei preservati ed esclusi dai commit.
- [ ] **Piacenza — verifiche periodiche:** nuovi bandi/quote/disponibilità,
date singole dei mercatini ricorrenti, calendario unico Mercanti, programmi
Natale 2026 non ancora pubblicati ed eventuali originali sostitutivi delle
pagine rimosse. Manutenzione futura distinta dalla ricerca attuale conclusa;
non richiede attesa di futuri bandi e non avvia altre province.


Udine, 18 ottobre 2026 — ricerca documentale corrente conclusa e verificata online.
89 manifestazioni in 48 comuni, prima cinque (+84); ricognizione nominativa
134 comuni, 66 schede con date puntuali e sei sintesi costo. Catalogo 4.470,
cinque ID conservati e altre 4.381 schede identiche; cache JS78/JSON54.
Audit data/fiere-udine.json e data/FIERE.md: originali, alternative, esclusioni,
albi inaccessibili e limiti documentati. Banchi distinti dalle feste, Venzone
annullata esclusa, quote/cauzioni/IVA e categorie separate; refuso gennaio
Lignano non corretto per ipotesi, Natale Sauris ancora 2025. Nessuna promessa
di esaustività o posti liberi; nessuna comunicazione a terzi.
Pubblicato 65b6b38, Vercel riuscito; catalogo/audit/HTML/JS identici online,
89 pagine HTTP200 con H1/canonical corretti. PLAYWRIGHT_MODULE locale/online:
Chromium1440/320 e WebKit390, elenco/mappa/dialog/costi/fonti e pagine senza JS.
Build, settori, 4.470 pagine/1.778 sitemap e suite generale cinque formati
passati. Originali e prove Documents/ricerca-fiere-udine-20261018; 421 impronte
verificate, zero mancanti o discordanti. Copia conservativa SHA256 conclusa:
Documents/backup-subingresso/ricerche-fiere-20261018-110518, 30,055 file,
5,671,310,309 byte, tutti verificati, zero errori, manifest e checksum verificati.
TO DO spuntata dopo esito positivo: 34 completate e 76 da fare su 110.
File estranei preservati ed esclusi dai commit; nessuna altra provincia avviata.
- [ ] **Udine — verifiche periodiche:** nuovi bandi, disponibilità e quote;
conferme Santa Caterina/Cervignano, programma San Carlo/Latisana, Advent Pur
dal 1 novembre, refuso gennaio Lignano, calendari ricorrenti e nuove fonti
primarie per le schede secondarie. Manutenzione futura distinta dalla ricerca
corrente conclusa: non richiede attesa di nuovi bandi né avvio di altre province.

## Pordenone — ricerca e pubblicazione verificate, 18 ottobre 2026

86 manifestazioni in 29 comuni, ricognizione di tutti i 50 comuni; 78 schede
con date puntuali e 14 sintesi costo. Due ID precedenti conservati, identiche
le 4.468 schede delle altre province; catalogo 4.554. Audit, copertura nominale,
22 esclusioni e limiti in `data/fiere-pordenone.json` e `data/FIERE.md`.
Originali/tentativi/prove in `Documents/ricerca-fiere-pordenone-20261018`.
Cinque fonti secondarie dichiarate; date provvisorie/ricorrenze testuali,
moduli chiusi/vecchi e documenti non recuperabili espliciti. Piste accessibili
esaurite; ricerca attuale chiusa con limiti, verifiche future separate.
Nessuna comunicazione a terzi; nessuna altra provincia lavorata.

Pubblicato `0119e58`, Vercel riuscito
[FnWF2C2K9n74CubB6oEv6Ze4A9pj](https://vercel.com/kycykuardit-9234s-projects/subingresso/FnWF2C2K9n74CubB6oEv6Ze4A9pj).
Catalogo/audit/HTML/JS online identici al commit; 86 pagine HTTP200, H1 e
canonical corretti. Test provinciale locale/online Chromium1440/320 e WebKit390,
suite generale cinque formati, build/settori, 4.554 pagine/1.864 sitemap passati.
305 originali con impronte verificate, zero errori; scansione segreti superata.
Cache JS79/catalogo55. TO DO spuntata solo dopo esito: 35 concluse, 75 da fare.
File estranei conservati ed esclusi dai commit. Backup remoto preventivo
`backup/session-20261018-181439-fiere-pordenone` e branch pre-intervento validi.

Nuova copia di conservazione completata con `python scripts/backup-fiere-research.py`:
`Documents/backup-subingresso/ricerche-fiere-20261018-165002`, 31,525 file,
5,899,371,433 byte, ogni copia verificata SHA256, zero errori; checksum del
manifest verificata. Inclusi originali Pordenone e prove online. Nessun
archivio precedente cancellato/sovrascritto. Copia locale, non esterna.
Riscontro `Documents/ricerca-fiere-pordenone-20261018/backup-verified.json`.

## Pubblicità fiere nel blog — 18 ottobre 2026

Richiesta: richiami incisivi al calendario dagli articoli già visitati,
preservando il lavoro concorrente su organizzatori/eventi. Analisi API:
335 visualizzazioni negli ultimi30 giorni; Bolkestein ultime notizie111,
costo posteggio45. Banner blu/oro nell'indice e in89/90 articoli; guida eredi
esclusa. Prima di una nuova sezione e richiamo finale compatto; un solo
riquadro quando il testo non offre spazio. Regioni esplicite prefiltrate,
Garda/più regioni nazionali. San Faustino:200.000+ presenze, stima stampa2026
con fonte visibile; nessun incasso di5.000 euro inventato. Nuovo click
`cta_fiere_click`, stessa protezione/deduplica; nessuna modifica alle funzioni
delle fiere. Checkout separato `Documents/subingresso-blog-promo-fiere-20261018`.
Test32 casi browser reali Chromium1440/768/320×568 e WebKit390, integrità90
articoli, regressione annunci32 casi, acquisizione/qualità e SQL ROLLBACK
passati. Dettagli `data/BLOG_FIERE_PROMO.md`, prove
`Documents/blog-promo-fiere-20261018/`. Pubblicato `ec8d0a1`, Vercel
[riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/EmvLaMzre4XobEPiJLMEPm6r843S).
Template/CSS/due JS online identici al commit;32 casi browser sull'HTML
pubblicato passati e12 verifiche calendario regionale online riuscite.
DB applicato/verificato, zero eventi di prova residui.
Backup tag remoto e branch preventivo verificati; noto errore cleanup tag.

## Pubblicità fiere — copy aggressivo e righe, 18 ottobre 2026

Preferenza esplicita successiva: pubblicità più aggressive,5.000 euro come
provocazione in forma di domanda. Titolo corrente «5.000 € in2 giorni?
Punta alla fiera giusta»; chiusura «Il prossimo incasso? Non lasciarlo agli
altri». Sostituisce il banner delle200.000 presenze. Gruppi di parole/valuta
interi e righe controllate, senza parole isolate come nella schermata.
CSS/JS dedicati v2; posizioni/link/click conservati. Solo blog, stesso
checkout isolato aggiornato al codice organizzatori7984e1a, funzioni/DB
preservati.32 casi browser su articoli/indice, integrità90 articoli e36
riquadri su9 larghezze320–1440 Chromium/WebKit passati. Prove
`Documents/blog-promo-fiere-20261018/copy-aggressivo/`, dettagli
`data/BLOG_FIERE_PROMO.md`. Backup remoto verificato; arresto dello script
sullo stderr PowerShell dopo push del tag riuscito. Pubblicato `47bc600`,
Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/3qSwYfPmbrYS21zPyqHfedJKTk6R).
Template/CSS/JS online identici e v2 corretti;32 casi browser/integrità90
articoli passati anche sull'HTML pubblicato. Registro organizzatori27c4f43
preservato nel rebase prima del push.


Biella, 23 ottobre 2026: ricerca attuale conclusa con limiti espliciti, 61manifestazioni/26comuni,74esaminati;59aggiunte,2ID e6.217schede esterne conservati. Catalogo6.278,57schede con date puntuali,otto edizioni storiche2025,cinque sintesi costo. Audit data/fiere-biella.json/FIERE.md:644ricevute,27righe regionali,17esclusioni/24limiti; nessun contatto a terzi. Dati509021b, Vercel riuscito EQQK66qY8xeHqBetcv3kamYRKFUE: cinque asset identici,61pagine200/H1/canonical/contenuti, browser locale/online Chromium1440/320 e WebKit390 con PLAYWRIGHT_MODULE, più sito reale senza intercettazioni1440/320. Generale cinque formati,settori,6.278pagine/2.656sitemap e build ripetibile passati. TO DO54/56 e riepiloghi aggiornati soltanto dopo verifica. CacheJS107/JSON75. Originali/prove Documents/ricerca-fiere-biella-20261023; backupSHA256 ricerche-fiere-20261023-061927:69.563file,11.534.742.972byte,zeroerrori, supplemento finale separato. Nessuna altra provincia lavorata; futuri bandi/quote/disponibilità sono manutenzione distinta.

Sondrio,23ottobre2026: ricerca attuale conclusa con limiti espliciti,90manifestazioni/38comuni,tutti77esaminati,+65;25ID e6.253schede esterne conservati. Catalogo6.343,6.140con dati edizione; audit data/fiere-sondrio.json/FIERE.md:532righe regionali,531PDF,99OCR unici,832record turistici,1.455ricevute incluse API/errori/duplicati,18esclusioni/19limiti,nessuna pista accessibile aperta. Sette sintesi costo; date puntuali distinte da periodi annunciati e storico2025. Dati4fe8b8c,Vercel riuscito: quattro asset identici,90pagine200/H1/canonical/note/costi,locale/online Chromium1440/320+WebKit390 con PLAYWRIGHT_MODULE,tutti90dialoghi; sito reale tre formati senza errori/overflow. Generale5formati,settori,6.343pagine/2.656sitemap e build ripetibile passati. TO DO55/55 solo dopo verifica; cacheJS108/JSON76. Originali/prove Documents/ricerca-fiere-sondrio-20261023; backupSHA256 ricerche-fiere-20261023-111309:72.640file/11.872.974.938byte,zeroerrori,supplemento finale separato. Nessuna altra provincia lavorata,nessuna comunicazione a terzi; nuovi bandi/quote/posti sono manutenzione futura distinta.

Belluno,23ottobre2026: ricerca attuale conclusa con limiti espliciti,134manifestazioni/43comuni,tutti60comuni attuali esaminati,+121;13ID e6.330schede esterne conservati. Catalogo6.464,6.261con dati edizione; audit data/fiere-belluno.json/FIERE.md:94righe sagre,32voci fieristiche più Lendinara fuori provincia esclusa,5antiquariato,254URL DMO e429record API (non eventi unici né archivio storico completo),518ricevute,53archivi web,21pagine OCR Trichiana,20esclusioni/24limiti,nessuna pista accessibile aperta. Dieci sintesi costo,otto schede solo storiche; conflitti testuali e periodi distinti da date confermate. Dati a31001a,Vercel riuscito: quattro asset identici,134pagine200/H1/canonical/note/costi; locale/online Chromium1440/320+WebKit390 via PLAYWRIGHT_MODULE,tutti134dialoghi e quattro pagine senza JS per formato,sito reale tre formati senza errori/overflow. Settori,6.464pagine/2.790sitemap,cinque formati generali e build ripetibile passati. TO DO56/54 solo dopo verifica; cacheJS109/JSON77. Originali/prove Documents/ricerca-fiere-belluno-20261023; tag/ramo backup già validi non ripetuti alla ripresa,nuovi materiali e prove conservati in supplementi SHA256 dello snapshot ricerche-fiere-20261023-123225. Coordinate solo calendario: Setteville su Quero,BorgoValbelluna centroMel da DMO; dati geografici condivisi invariati. Nessuna altra provincia lavorata,nessuna comunicazione a terzi; nuovi bandi/quote/posti e conferme annuali sono manutenzione futura distinta.


Valle d’Aosta/Vallée d’Aoste, 25 ottobre 2026: ricerca corrente conclusa con limiti,
91 schede in 38 comuni, ricognizione di 74 comuni, +81; dieci ID e 6.920 eventi
esterni invariati. Catalogo 7.011, 6.813 con edizioni, sei sintesi costo.
Dati `42e72ef` e deploy Vercel verificati: cinque asset identici, 91 pagine e tutti
i dettagli nei tre formati browser, locale/online e sito reale. TO DO 63/47
aggiornata dopo verifica. Originali/prove in Documents/ricerca-fiere-valle-aosta-20261025;
snapshot 105.167 file SHA256 senza errori, manifest e supplemento in FIERE.md.
Cache JS116/JSON84; lavoro estraneo e articoli concorrenti preservati, nessun
invio a terzi e nessuna altra provincia avviata.


Macerata, 25 ottobre 2026: ricerca accessibile attuale conclusa con limiti;
177 manifestazioni in 47 comuni, ricognizione dei 55 comuni, +116. Conservati
61 ID e 6.950 schede esterne; catalogo 7.127, con 6.926 schede con edizioni e sei
sintesi costo. Audit/FIERE.md: 121 righe aree pubbliche, cinque fieristiche,
1.294 ricevute tecniche, 30 gruppi di piste chiuse, 20 esclusioni e 33 limiti.
Pubblicato `1eddab3`, Vercel riuscito: cinque asset identici, tutte le 177 pagine
HTTP200/H1/canonical/note/costi; tutti i 177 dialoghi per formato locale/online
Chromium1440/320 e WebKit390, più sito reale nei tre formati. Generale cinque
formati, settori, 7.127 pagine/3.094 sitemap e build ripetibile passati. TO DO
64/46 aggiornata soltanto dopo verifica. Originali e prove nel dossier privato
`Documents/ricerca-fiere-macerata-20261025`; backup completo SHA256 e supplemento
finale documentati in FIERE.md. Cache JS117/JSON85, file estranei e commit blog
concorrenti preservati; nessuna altra provincia e nessuna comunicazione a terzi.
