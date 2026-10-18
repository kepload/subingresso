# Subingresso.it — informazioni e TO DO

Mappa per avviare le sessioni. Percorsi relativi al repo `C:\Users\utente\Desktop\Ardit\subingresso.it`. Ricognizione tecnica: 6 ottobre 2026; unione documenti: 16 ottobre; snellimento: 17 ottobre. Le registrazioni mantengono le proprie date: questa revisione non verifica nuovamente sito o servizi live.

## Stato recente e decisioni correnti — 18 ottobre 2026

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
- **Fiere:** 4.554 schede; ricerca approfondita conclusa e verificata online per 35 province, 75 da fare su 110. Manutenzione periodica distinta dalla ricerca conclusa; schede importate non equivalgono a ricerca approfondita.
- **Affluenza:** valutare soltanto il pubblico, senza giudizi su vendite, redditività, fama o anzianità. Fasce editoriali sulla media giornaliera di ingressi/presenze: bassa <1.000; media 1.000–<5.000; alta 5.000–<20.000; molto alta ≥20.000. Fonti, unità, anno/periodo, stime/dichiarazioni e criteri apribili. Non convertire persone uniche, passaggi, celle telefoniche o pubblico dell'intera festa in affluenza dei banchi; dati insufficienti senza fascia, mai bassa/media per assenza di prove.
- **Copertura affluenza:** 40 ID verificati in due gruppi da 20; 21 resoconti e 19 esclusioni motivate, cinque bollini (tre alta, due molto alta), 16 senza fascia. Copertura parziale. Archivio `data/fiere-affluenza.json`; originali/limiti in `Documents/ricerca-affluenza-fiere-20261017`, secondo gruppo in `sessione-02/`; dettaglio `data/FIERE.md`. Merate: refuso ottobre risolto col programma di dicembre. Ortogiardino–Cucinare, Natale cittadino, dati parziali e stima Bolzano controversa senza bollino. Pro Cantù HTTP 200 al ricontrollo; alternative e altri limiti registrati.
- **«Quanto è conosciuta» sospeso:** rimossi filtro e bollini da anteprime, popup, dialog e pagine autonome. Il parametro storico `rinomatezza` non filtra; gli altri filtri funzionano. Valutazioni e prove conservate per eventuale ripristino; sospendere nuove assegnazioni. Le preferenze del 16 ottobre sotto sono storiche.
- **Filtri:** «Tipo di evento» tra i principali sotto «Cosa vendi», fuori da «Altri filtri» e dal suo conteggio; opzioni/comportamento conservati. «Azzera filtri» accanto a «Quando» sostituisce «Tutto l'anno». Mappa senza puntini finché non si seleziona almeno un mese, anche con altri filtri o zoom; ultimo mese deselezionato/reset la svuotano. URL con mesi conserva la selezione; elenco consultabile senza mesi. Note/legenda sotto i filtri rimosse. Mesi Gen–Dic: due righe da sei, tre da quattro sotto 360 px; pulsanti ≥44 px, nomi completi accessibili.
- **Anteprime e date:** costo soltanto se disponibile, senza «Costo banco da verificare»/«Costi: vedi scheda»; note nella scheda. Nessun bollino per valutazione mancante né riga vuota. Giorno settimanale per fiere di 1–2 giorni, stesso formato in elenco/dettaglio; da 3 giorni e per periodi indicativi formato precedente. Niente diciture di stato accanto alle date: piccolo ! apribile al tocco/tastiera per riconferme, ricorrenze, periodi ed edizioni passate.
- **Pagine autonome:** `/fiere/<id>` e archivio `/fiere/elenco`, stessi dati del calendario, apertura rapida nel dialog conservata. Schede incomplete consultabili ma noindex finché manca contenuto operativo sufficiente; sitemap automatica per le altre. Non certificano una ricerca provinciale conclusa.
- **Blog regionale fiere:** serie 10/20 dopo Umbria; mancano Abruzzo, Basilicata, Calabria, Campania, Lazio, Molise, Puglia, Sardegna, Sicilia, Valle d'Aosta. Già presenti Lombardia, Veneto, Piemonte e le sette regioni registrate sotto.
- **Ultime cache registrate:** fiere JS73/JSON51/CSS26, pagina fiera CSS2. Sono riferimenti storici: cercare sempre le versioni reali prima di modificare.

## Registro recente: pubblicazioni e verifiche

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

1. Leggere `AGENTS.md` (fonte operativa Codex), `istruzioni.md` (manuale, bug, sistemi/TODO), `CLAUDE.md` (riepilogo parallelo; se diverge prevale AGENTS).
2. Controllare `git status --short`, diff e ultimi commit; conservare le modifiche estranee. `supabase/.temp/cli-latest` risultava già modificato alla ricognizione: non sovrascriverlo/committarlo automaticamente.
3. Prima della prima modifica, dalla root: `.\scripts\session-backup.ps1 -Reason "descrizione-corta"`. Crea/pusha tag `backup/session-...`; non serve per sola analisi.
4. Leggere i file coinvolti e cercare tutti i riferimenti con `rg`; patch puntuali, verifica sintassi/flusso, aggiornamenti cache/documentazione/schema quando necessari; commit/push secondo AGENTS.

Risposte italiane, semplici e brevi. PowerShell 5.1: comandi separati e controllo `$?`, niente `&&`/`||`; commit complessi con `git commit -F file-temporaneo`.

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

- Repo pubblico: mai secret, JWT service role, `sb_secret_*`, chiavi Stripe/Resend/Gemini o password nei file versionati. Chiave pubblicabile frontend pubblica per design; privilegiate solo environment secret. Non aggirare alla leggera gitleaks/pre-commit/push protection.
- `annunci`/`profiles`: tel/email column-restricted, `select('*')` autenticato può fallire `42501`; colonne esplicite senza PII. Nuove colonne possono richiedere `GRANT SELECT (col)` per `anon`, `authenticated`.
- Niente join PostgREST `profiles(...)` da annunci/conversazioni: fetch separati + merge JS. `_supabase.rpc(...).catch(...)` non valido in Supabase JS v2: `await` + `try/catch`.
- Testo utente nel DOM con `escapeHTML()`, HTML articoli con DOMPurify. Cache sempre per utente: già avvenuta contaminazione di nome/telefono su dispositivi condivisi.
- Mai eliminare utenti/annunci, anche soft delete, senza consenso esplicito; non toccare trigger annunci, schema email o vendi se il task non lo richiede chiaramente.
- Tailwind precompilato: verificare le classi; nuove utility/arbitrary values come `pl-[4.5rem]` falliscono senza rebuild: `npx.cmd tailwindcss -i tailwind.input.css -o css/tailwind.css --minify`.
- Dopo rebuild aggiornare `tailwind.css?v=N` in tutti gli HTML. Per modifiche a data/auth/ui-components/page-view-tracker/pages JS, incrementare ogni riferimento, inclusi template SSR inline. Cercare versioni reali con `rg`: alla ricognizione auth HTML v20 contro documenti v18.
- `<style>` dopo Tailwind può sovrascrivere utility: controllare specificità/ordine; `!important` non prima soluzione.
- Regex multiline ampie hanno cancellato funzioni: edit puntuali. Unicode invisibili rompono confronti/replace. Enum/whitelist JS e `CHECK` DB devono restare allineati. Duplicazione statico/SSR causa disallineamenti SEO/cache: cercare tutti i punti.

## Attendibilità, priorità storiche e fonti

Snapshot fine maggio in AGENTS/manuale (34 annunci reali, 32 utenti, Scout attivo, blog regionale completato) **non attuale senza verifica live**. Orientamenti ancora utili: inventario reale inizialmente Lombardia, monitorare Scout, privacy/data audit, conversioni blog/landing regionali con inventario sufficiente, reminder scadenze, aggiornare Bolkestein. Prima di riprendere TODO storici controllare commit, dashboard e servizi.

Ordine delle fonti: codice/config repo → schema/config live verificati Supabase/Vercel/Stripe/Resend → AGENTS per operatività/sicurezza → istruzioni per architettura/motivazioni/storico → questo riepilogo. Numeri utenti/annunci/iscritti, versioni e TODO vanno verificati quando pertinenti al task.

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
`data/fiere-comuni.json` e `data/FIERE.md`. **Vercelli resta da approfondire**:
questa prova non completa la provincia. Il catalogo Padova è ora verificato online.

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

**Ricerca approfondita: 35 province completate, 75 da fare su 110**, aggiornate il 18 ottobre dopo Pordenone. Manutenzione distinta; schede importate ≠ ricerca approfondita. Unità territoriali del calendario, inclusa Sardegna 2026.

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
- [ ] **29. Ferrara** — Emilia-Romagna
- [ ] **30. Lucca** — Toscana
- [ ] **31. Pisa** — Toscana
- [ ] **32. Pistoia** — Toscana
- [ ] **33. Genova** — Liguria
- [ ] **34. Alessandria** — Piemonte
- [ ] **35. Asti** — Piemonte
- [ ] **36. Pesaro e Urbino** — Marche
- [ ] **37. Ancona** — Marche
- [ ] **38. Perugia** — Umbria
- [ ] **39. Napoli** — Campania
- [ ] **40. Bari** — Puglia
- [ ] **41. Salerno** — Campania
- [ ] **42. Siena** — Toscana
- [ ] **43. Livorno** — Toscana
- [ ] **44. Savona** — Liguria
- [ ] **45. La Spezia** — Liguria
- [ ] **46. Vercelli** — Piemonte
- [ ] **47. Biella** — Piemonte
- [ ] **48. Sondrio** — Lombardia
- [ ] **49. Belluno** — Veneto
- [ ] **50. Gorizia** — Friuli-Venezia Giulia
- [ ] **51. Rovigo** — Veneto
- [ ] **52. Verbano-Cusio-Ossola** — Piemonte
- [ ] **53. Imperia** — Liguria
- [ ] **54. Massa-Carrara** — Toscana
- [ ] **55. Grosseto** — Toscana
- [ ] **56. Valle d'Aosta/Vallée d'Aoste** — Valle d'Aosta
- [ ] **57. Macerata** — Marche
- [ ] **58. Fermo** — Marche
- [ ] **59. Ascoli Piceno** — Marche
- [ ] **60. Pescara** — Abruzzo
- [ ] **61. Teramo** — Abruzzo
- [ ] **62. Chieti** — Abruzzo
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

- [ ] 🔴 Velocizzare il blog — rendere subito disponibile l'articolo in HTML e caricare solo le anteprime nell'elenco.
- [ ] 🟠 Alleggerire il sito e rendere più fluida la navigazione — cache dei file versionati, coordinate e librerie della dashboard caricate quando servono, icone leggere; ridurre gli spostamenti della pagina e ottimizzare paginazione e query degli annunci.
- [ ] 🔴 Sistemare indirizzi e indicizzazione — allineare sitemap e pagine definitive, correggere i 404 e migliorare blog e pagine locali verificando indicizzazione e risultati in Search Console. Prima i problemi che impediscono di trovare o aprire le pagine utili.
- [ ] 🟢 Creare pagine regionali — quando ci sono abbastanza annunci attivi; anticiparle solo nelle regioni con offerta concreta e domanda osservata.

## 👤 Annunci, profilo e avvisi

- [ ] 🔴 Migliorare scadenze e rinnovi — avvisi prima della scadenza e rinnovo rapido, per conservare l'offerta reale senza dover acquisire nuovamente gli stessi inserzionisti.
- [ ] 🟠 Migliorare gli alert — filtri per zona, settore, giorno e prezzo.
- [ ] 🟢 Registrare vendite e affitti conclusi — data, tempi e prezzo facoltativo; utile per analisi future, con beneficio immediato meno diretto rispetto ad acquisizione e rinnovi.
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
sullo stderr PowerShell dopo push del tag riuscito. Pubblicazione da verificare.
