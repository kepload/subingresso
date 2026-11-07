# Calendario fiere — regole e indice dei dossier

Indice creato il 4 novembre 2026. Tutte le sezioni del precedente dossier
sono conservate integralmente nei riferimenti sotto, nello stesso ordine.
Aprire soltanto la provincia o il contratto pertinente. I percorsi di codice
e degli originali citati nei dossier sono relativi alla root del progetto.

## Stato e vincoli da conservare

- [Checklist unica](../docs/fiere-province.md): aggiornata il 7 novembre,
  110 concluse e nessuna aperta su 110; L'Aquila, Cosenza, Catanzaro e Reggio Calabria
  verificate online il 5 novembre su richiesta circoscritta,
  Pavia e Nuoro concluse e verificate online; automazioni ferme.
  Nessuna ripresa autorizzata dal presente indice o dai vecchi resoconti.
- Verificare dati e commit effettivi, preservare ID, fonti e province estranee.
  Non rigenerare da snapshot precedenti. Build: `scripts/build-fiere.py`;
  catalogo: `data/fiere-fonti.json`; audit: `data/fiere-*.json`.
- Distinguere edizioni confermate, periodi, storico, annullamenti e candidatura.
  Non dedurre disponibilità, affluenza, costi o condizioni mancanti. Bollo,
  canone, IVA e servizi separati; anno e limiti espliciti.
- Una ricerca conclusa con limiti non è un censimento certificato. Nuovi bandi,
  prezzi e date sono manutenzione futura distinta. Nessun contatto a terzi
  o invio di domande senza richiesta. Notorietà ancora sospesa dal 17 ottobre.
- Prima della chiusura verificare fonti, build ripetibile, date, filtri,
  dettaglio e pubblicazione con i controlli pertinenti. Importazioni non
  equivalgono a ricerca approfondita. Organizzatori: `ORGANIZZATORI_EVENTI.md`.
- Recensioni degli ambulanti: [percorso e contratto](FIERE_RECENSIONI.md).
  Dopo nuove aggiunte al catalogo sincronizzare gli ID ammessi alle recensioni:
  `node scripts/fair-reviews-db.cjs --sync-catalog` (ID mancanti e date documentate,
  senza modificare le recensioni).

Ricerca mirata: `node scripts/project-context.cjs "nome provincia"`.

## Ricerche e contratti completi

- [Ricerca per periodo con date a scorrimento — 7 novembre 2026](fiere-dossier/126-ricerca-periodo-iphone-20261107.md): prova Dal/Al pubblicata e ripristinabile; filtro prodotto rimosso, intervalli su date pubblicate e vecchi link per mese compatibili.

- [Schede fiere essenziali — 7 novembre 2026](fiere-dossier/125-schede-minimali-20261107.md): un’unica ricerca, informazioni aperte, costi senza box, nessun rimando alle recensioni o link alla stessa scheda; fonti deduplicate in fondo, sempre con account.

- [Ricerca interna, iscrizione e fonti — 7 novembre 2026](fiere-dossier/124-conversione-iscrizioni-20261107.md): ricerca locale in primo piano, iscrizione visibile, siti esterni in fondo e apertura con account; supera il precedente accesso libero alle fonti dalle schede.

- [Chiusura Pavia e Nuoro — 6 novembre 2026](fiere-dossier/chiusura-pavia-nuoro-20261106.md): due ricerche isolate, 177 nuove schede, sei aggiornamenti e dieci note economiche; pubblicazione e controlli online verificati. Tutte le 110 province concluse con limiti espliciti.

- [Oristano — 6 novembre 2026](fiere-dossier/oristano-20261106.md): 64 nuove schede in 45 comuni, ricognizione degli 87 comuni e quattro note economiche; pubblicazione verificata, fonti e limiti nel dossier.

- [Ingressi Google nel calendario — 6 novembre 2026](fiere-dossier/123-ingressi-google-calendario-20261106.md): scheda già aperta, ritorno alla ricerca locale, fonti pubbliche e URL indicizzati conservati.

- [Caltanissetta — 6 novembre 2026](fiere-dossier/caltanissetta-20261106.md): +16 schede in 11 comuni e una nota economica; ricognizione dei 22 comuni con limiti, pubblicata e verificata online.

- [Rieti — 5 novembre 2026](fiere-dossier/rieti-20261105.md): +69 schede in 53 comuni e una quota espositore documentata, verificate online; ricognizione dei 73 comuni con limiti.

- [Vibo Valentia — 5 novembre 2026](fiere-dossier/vibo-valentia-20261105.md): +23 schede in 10 comuni e quattro note economiche, verificate online; ricognizione dei 50 comuni con limiti.

- [Crotone — 5 novembre 2026](fiere-dossier/crotone-20261105.md): +11 schede in 9 comuni pubblicate e verificate online; ricerca con limiti.

- [L'Aquila - 5 novembre 2026](fiere-dossier/laquila-20261105.md)
- [Cosenza - 5 novembre 2026](fiere-dossier/cosenza-20261105.md)
- [Catanzaro - 5 novembre 2026](fiere-dossier/catanzaro-20261105.md)
- [Reggio Calabria - 5 novembre 2026](fiere-dossier/reggio-calabria-20261105.md)

- [Card show e anteprime recensioni — 4 novembre 2026](fiere-dossier/122-carte-collezionabili-20261104.md): tre nuove fiere, CardFest già presente, ricerca mirata senza riavvio delle automazioni.

- [Ogliastra — ricerca documentale, 4 novembre 2026](fiere-dossier/120-ogliastra-20261104.md)
- [Sulcis Iglesiente — ricerca documentale, 4 novembre 2026](fiere-dossier/121-sulcis-iglesiente-20261104.md)
- [Matera — ricerca documentale, 4 novembre 2026](fiere-dossier/118-matera-ricerca-documentale-4-novembre-2026.md)
- [Benevento — ricerca documentale, 1 novembre 2026](fiere-dossier/001-benevento-ricerca-documentale-1-novembre-2026.md)
- [Foggia — ricerca documentale, 31 ottobre 2026](fiere-dossier/002-foggia-ricerca-documentale-31-ottobre-2026.md)
- [Avellino — ricerca documentale, 31 ottobre 2026](fiere-dossier/003-avellino-ricerca-documentale-31-ottobre-2026.md)
- [Isernia — ricerca documentale, 31 ottobre 2026](fiere-dossier/004-isernia-ricerca-documentale-31-ottobre-2026.md)
- [Taranto — ricerca documentale, 31 ottobre 2026](fiere-dossier/005-taranto-ricerca-documentale-31-ottobre-2026.md)
- [Brindisi — ricerca documentale, 31 ottobre 2026](fiere-dossier/006-brindisi-ricerca-documentale-31-ottobre-2026.md)
- [SEO e percorso documentale — 31 ottobre 2026](fiere-dossier/007-seo-e-percorso-documentale-31-ottobre-2026.md)
- [Enna — ricerca documentale, 30 ottobre 2026](fiere-dossier/008-enna-ricerca-documentale-30-ottobre-2026.md)
- [Barletta-Andria-Trani — ricerca documentale, 30 ottobre 2026](fiere-dossier/009-barletta-andria-trani-ricerca-documentale-30-ottobre-2026.md)
- [Trapani — ricerca e pubblicazione, 30 ottobre 2026](fiere-dossier/010-trapani-ricerca-e-pubblicazione-30-ottobre-2026.md)
- [Siracusa — ricerca e pubblicazione, 30 ottobre 2026](fiere-dossier/011-siracusa-ricerca-e-pubblicazione-30-ottobre-2026.md)
- [Ragusa — ricerca e pubblicazione, 29 ottobre 2026](fiere-dossier/012-ragusa-ricerca-e-pubblicazione-29-ottobre-2026.md)
- [Messina — ricerca e pubblicazione, 29 ottobre 2026](fiere-dossier/013-messina-ricerca-e-pubblicazione-29-ottobre-2026.md)
- [Catania — ricerca e pubblicazione, 29 ottobre 2026](fiere-dossier/014-catania-ricerca-e-pubblicazione-29-ottobre-2026.md)
- [Palermo — ricerca e pubblicazione, 29 ottobre 2026](fiere-dossier/015-palermo-ricerca-e-pubblicazione-29-ottobre-2026.md)
- [Gallura Nord-Est Sardegna — ricerca e pubblicazione, 29 ottobre 2026](fiere-dossier/016-gallura-nord-est-sardegna-ricerca-e-pubblicazione-29-ottobre-2026.md)
- [Sassari — ricerca documentale e pubblicazione, 29 ottobre 2026](fiere-dossier/017-sassari-ricerca-documentale-e-pubblicazione-29-ottobre-2026.md)
- [Caserta — ricerca documentale del 27 ottobre 2026](fiere-dossier/018-caserta-ricerca-documentale-del-27-ottobre-2026.md)
- [Cagliari — ricerca documentale del 27 ottobre 2026](fiere-dossier/019-cagliari-ricerca-documentale-del-27-ottobre-2026.md)
- [Lecce — ricerca documentale e pubblicazione, 28 ottobre 2026](fiere-dossier/020-lecce-ricerca-documentale-e-pubblicazione-28-ottobre-2026.md)
- [Terni — ricerca documentale, 27 ottobre 2026](fiere-dossier/021-terni-ricerca-documentale-27-ottobre-2026.md)
- [Frosinone — completamento della ricerca documentale, 26 ottobre 2026](fiere-dossier/022-frosinone-completamento-della-ricerca-documentale-26-ottobre-2026.md)
- [Viterbo — ricerca documentale del 26 ottobre 2026](fiere-dossier/023-viterbo-ricerca-documentale-del-26-ottobre-2026.md)
- [Latina — ricerca documentale del 26 ottobre 2026](fiere-dossier/024-latina-ricerca-documentale-del-26-ottobre-2026.md)
- [Chieti — ricerca documentale del 26 ottobre 2026](fiere-dossier/025-chieti-ricerca-documentale-del-26-ottobre-2026.md)
- [Pescara — ricerca documentale del 25 ottobre 2026](fiere-dossier/026-pescara-ricerca-documentale-del-25-ottobre-2026.md)
- [Ascoli Piceno — ricerca documentale del 25 ottobre 2026](fiere-dossier/027-ascoli-piceno-ricerca-documentale-del-25-ottobre-2026.md)
- [Fermo — ricerca documentale del 25 ottobre 2026](fiere-dossier/028-fermo-ricerca-documentale-del-25-ottobre-2026.md)
- [Macerata — ricerca documentale del 25 ottobre 2026](fiere-dossier/029-macerata-ricerca-documentale-del-25-ottobre-2026.md)
- [Valle d'Aosta/Vallée d'Aoste — ricerca documentale del 25 ottobre 2026](fiere-dossier/030-valle-d-aosta-vallee-d-aoste-ricerca-documentale-del-25-ottobre-2.md)
- [Grosseto — ricerca documentale del 24 ottobre 2026](fiere-dossier/031-grosseto-ricerca-documentale-del-24-ottobre-2026.md)
- [Massa-Carrara — ricerca documentale del 24 ottobre 2026](fiere-dossier/032-massa-carrara-ricerca-documentale-del-24-ottobre-2026.md)
- [Imperia — ricerca documentale del 24 ottobre 2026](fiere-dossier/033-imperia-ricerca-documentale-del-24-ottobre-2026.md)
- [Verbano-Cusio-Ossola — ricerca documentale del 24 ottobre 2026](fiere-dossier/034-verbano-cusio-ossola-ricerca-documentale-del-24-ottobre-2026.md)
- [Rovigo — ricerca documentale del 23 ottobre 2026](fiere-dossier/035-rovigo-ricerca-documentale-del-23-ottobre-2026.md)
- [Gorizia — ricerca documentale del 23 ottobre 2026](fiere-dossier/036-gorizia-ricerca-documentale-del-23-ottobre-2026.md)
- [Belluno — ricerca documentale del 23 ottobre 2026](fiere-dossier/037-belluno-ricerca-documentale-del-23-ottobre-2026.md)
- [Sondrio — ricerca documentale del 23 ottobre 2026](fiere-dossier/038-sondrio-ricerca-documentale-del-23-ottobre-2026.md)
- [Biella — ricerca documentale del 23 ottobre 2026](fiere-dossier/039-biella-ricerca-documentale-del-23-ottobre-2026.md)
- [Vercelli — ricerca documentale del 22 ottobre 2026](fiere-dossier/040-vercelli-ricerca-documentale-del-22-ottobre-2026.md)
- [Livorno — ricerca documentale del 21 ottobre 2026](fiere-dossier/041-livorno-ricerca-documentale-del-21-ottobre-2026.md)
- [Siena — ricerca documentale del 21 ottobre 2026](fiere-dossier/042-siena-ricerca-documentale-del-21-ottobre-2026.md)
- [Salerno — ricerca documentale del 21 ottobre 2026](fiere-dossier/043-salerno-ricerca-documentale-del-21-ottobre-2026.md)
- [Bari — ricerca documentale del 21 ottobre 2026](fiere-dossier/044-bari-ricerca-documentale-del-21-ottobre-2026.md)
- [Napoli — ricerca documentale del 21 ottobre 2026](fiere-dossier/045-napoli-ricerca-documentale-del-21-ottobre-2026.md)
- [Perugia — ricerca documentale del 21 ottobre 2026](fiere-dossier/046-perugia-ricerca-documentale-del-21-ottobre-2026.md)
- [Ancona — ricerca documentale del 20 ottobre 2026](fiere-dossier/047-ancona-ricerca-documentale-del-20-ottobre-2026.md)
- [Pesaro e Urbino — ricerca documentale del 20 ottobre 2026](fiere-dossier/048-pesaro-e-urbino-ricerca-documentale-del-20-ottobre-2026.md)
- [Schede compatte — 20 ottobre 2026](fiere-dossier/049-schede-compatte-20-ottobre-2026.md)
- [Articoli incompleti e ordine del periodo — 20 ottobre 2026](fiere-dossier/050-articoli-incompleti-e-ordine-del-periodo-20-ottobre-2026.md)
- [Asti — ricerca documentale conclusa e verificata online (20 ottobre 2026)](fiere-dossier/051-asti-ricerca-documentale-conclusa-e-verificata-online-20-ottobre.md)
- [Alessandria — ricerca documentale conclusa e verificata online (20 ottobre 2026)](fiere-dossier/052-alessandria-ricerca-documentale-conclusa-e-verificata-online-20-o.md)
- [Genova — ricerca documentale conclusa e verificata online, 20 ottobre 2026](fiere-dossier/053-genova-ricerca-documentale-conclusa-e-verificata-online-20-ottobr.md)
- [Pistoia — ricerca documentale conclusa e verificata online, 19 ottobre 2026](fiere-dossier/054-pistoia-ricerca-documentale-conclusa-e-verificata-online-19-ottob.md)
- [Invito iscrizione senza lampeggio — 20 ottobre 2026](fiere-dossier/055-invito-iscrizione-senza-lampeggio-20-ottobre-2026.md)
- [Iscrizione e consultazione delle fonti — 19 ottobre 2026](fiere-dossier/056-iscrizione-e-consultazione-delle-fonti-19-ottobre-2026.md)
- [Filtri semplificati — 19 ottobre 2026](fiere-dossier/057-filtri-semplificati-19-ottobre-2026.md)
- [Pisa — ricerca documentale conclusa e verificata online, 19 ottobre 2026](fiere-dossier/058-pisa-ricerca-documentale-conclusa-e-verificata-online-19-ottobre.md)
- [Lucca — ricerca documentale conclusa e verificata online, 19 ottobre 2026](fiere-dossier/059-lucca-ricerca-documentale-conclusa-e-verificata-online-19-ottobre.md)
- [Ferrara — ricerca documentale conclusa e verificata online, 18 ottobre 2026](fiere-dossier/060-ferrara-ricerca-documentale-conclusa-e-verificata-online-18-ottob.md)
- [Pordenone — ricerca documentale del 18 ottobre 2026](fiere-dossier/061-pordenone-ricerca-documentale-del-18-ottobre-2026.md)
- [Udine — ricerca documentale corrente, 18 ottobre 2026](fiere-dossier/062-udine-ricerca-documentale-corrente-18-ottobre-2026.md)
- [Conservazione ricerche e affinità senza selezione — 18 ottobre 2026](fiere-dossier/063-conservazione-ricerche-e-affinita-senza-selezione-18-ottobre-2026.md)
- [Affinità articoli — revisione del 17 ottobre 2026](fiere-dossier/064-affinita-articoli-revisione-del-17-ottobre-2026.md)
- [Piacenza — ricerca documentale conclusa il 18 ottobre 2026](fiere-dossier/065-piacenza-ricerca-documentale-conclusa-il-18-ottobre-2026.md)
- [Piacenza — integrazione parziale del 17 ottobre 2026](fiere-dossier/066-piacenza-integrazione-parziale-del-17-ottobre-2026.md)
- [Forlì-Cesena — ricerca documentale del 17 ottobre 2026](fiere-dossier/067-forli-cesena-ricerca-documentale-del-17-ottobre-2026.md)
- [Ravenna — ricerca documentale del 17 ottobre 2026](fiere-dossier/068-ravenna-ricerca-documentale-del-17-ottobre-2026.md)
- [Rimini — ricerca documentale del 17 ottobre 2026](fiere-dossier/069-rimini-ricerca-documentale-del-17-ottobre-2026.md)
- [Selezione assistita, priorità alle nuove — 16 ottobre 2026](fiere-dossier/070-selezione-assistita-priorita-alle-nuove-16-ottobre-2026.md)
- [Nomi e colori dei bollini — 16 ottobre 2026](fiere-dossier/071-nomi-e-colori-dei-bollini-16-ottobre-2026.md)
- [Anteprime senza dati mancanti — 16 ottobre 2026](fiere-dossier/072-anteprime-senza-dati-mancanti-16-ottobre-2026.md)
- [Valutazioni ampliate e scheda essenziale — 16 ottobre 2026](fiere-dossier/073-valutazioni-ampliate-e-scheda-essenziale-16-ottobre-2026.md)
- [Rinomatezza — 16 ottobre 2026](fiere-dossier/074-rinomatezza-16-ottobre-2026.md)
- [Roma — ricerca documentale corrente completata, pubblicata e verificata (16 ottobre 2026)](fiere-dossier/075-roma-ricerca-documentale-corrente-completata-pubblicata-e-verific.md)
- [Roma — ripresa documentale del 16 ottobre 2026, provincia ancora parziale](fiere-dossier/076-roma-ripresa-documentale-del-16-ottobre-2026-provincia-ancora-par.md)
- [Roma — ricerca parziale, 16 ottobre 2026](fiere-dossier/077-roma-ricerca-parziale-16-ottobre-2026.md)
- [Bolzano/Bozen — ricerca provinciale, 16 ottobre 2026](fiere-dossier/078-bolzano-bozen-ricerca-provinciale-16-ottobre-2026.md)
- [Trento — ricerca provinciale, 16 ottobre 2026](fiere-dossier/079-trento-ricerca-provinciale-16-ottobre-2026.md)
- [Integrazione costi Pisogne — 16 ottobre 2026](fiere-dossier/080-integrazione-costi-pisogne-16-ottobre-2026.md)
- [Costi per partecipare con il banco — 15 ottobre 2026](fiere-dossier/081-costi-per-partecipare-con-il-banco-15-ottobre-2026.md)
- [Ricerca documentale Cuneo — 15 ottobre 2026](fiere-dossier/082-ricerca-documentale-cuneo-15-ottobre-2026.md)
- [Ricerca approfondita Novara — 15 ottobre 2026](fiere-dossier/083-ricerca-approfondita-novara-15-ottobre-2026.md)
- [Ricerca approfondita Venezia — 14 ottobre 2026](fiere-dossier/084-ricerca-approfondita-venezia-14-ottobre-2026.md)
- [Ricerca approfondita Cremona — 14 ottobre 2026](fiere-dossier/085-ricerca-approfondita-cremona-14-ottobre-2026.md)
- [Ricerca approfondita Torino — 14 ottobre 2026](fiere-dossier/086-ricerca-approfondita-torino-14-ottobre-2026.md)
- [Ricerca approfondita Como — 14 ottobre 2026](fiere-dossier/087-ricerca-approfondita-como-14-ottobre-2026.md)
- [Ricerca approfondita Varese — 14 ottobre 2026](fiere-dossier/088-ricerca-approfondita-varese-14-ottobre-2026.md)
- [Ricerca approfondita — provincia di Reggio nell’Emilia, 14 ottobre 2026](fiere-dossier/089-ricerca-approfondita-provincia-di-reggio-nellemilia-14-ottobre-20.md)
- [Ricerca approfondita — provincia di Parma, 14 ottobre 2026](fiere-dossier/090-ricerca-approfondita-provincia-di-parma-14-ottobre-2026.md)
- [Ricerca approfondita — provincia di Modena, 14 ottobre 2026](fiere-dossier/091-ricerca-approfondita-provincia-di-modena-14-ottobre-2026.md)
- [Ricerca approfondita — provincia di Vicenza, 13 ottobre 2026](fiere-dossier/092-ricerca-approfondita-provincia-di-vicenza-13-ottobre-2026.md)
- [Prova ibrida per comune — Gattinara, 13 ottobre 2026](fiere-dossier/093-prova-ibrida-per-comune-gattinara-13-ottobre-2026.md)
- [Ricerca approfondita — provincia di Padova, 12 ottobre 2026](fiere-dossier/094-ricerca-approfondita-provincia-di-padova-12-ottobre-2026.md)
- [Verona: ricerca approfondita — 11 ottobre 2026](fiere-dossier/095-verona-ricerca-approfondita-11-ottobre-2026.md)
- [Bergamo: ricerca approfondita — 11 ottobre 2026](fiere-dossier/096-bergamo-ricerca-approfondita-11-ottobre-2026.md)
- [Milano: ricerca approfondita — 11 ottobre 2026](fiere-dossier/097-milano-ricerca-approfondita-11-ottobre-2026.md)
- [Bologna: ricerca approfondita — 11 ottobre 2026](fiere-dossier/098-bologna-ricerca-approfondita-11-ottobre-2026.md)
- [Ricerca approfondita — provincia di Prato, 11 ottobre 2026](fiere-dossier/099-ricerca-approfondita-provincia-di-prato-11-ottobre-2026.md)
- [Filtri per settore merceologico — 10 ottobre 2026](fiere-dossier/100-filtri-per-settore-merceologico-10-ottobre-2026.md)
- [Calendari importati](fiere-dossier/101-calendari-importati.md)
- [Ricerca approfondita — territorio di Trieste](fiere-dossier/102-ricerca-approfondita-territorio-di-trieste.md)
- [Ricerca approfondita — provincia di Brescia](fiere-dossier/103-ricerca-approfondita-provincia-di-brescia.md)
- [Ricerca approfondita — provincia di Arezzo](fiere-dossier/104-ricerca-approfondita-provincia-di-arezzo.md)
- [Ricerca approfondita — provincia di Lodi](fiere-dossier/105-ricerca-approfondita-provincia-di-lodi.md)
- [Ricerca approfondita — provincia di Lecco](fiere-dossier/106-ricerca-approfondita-provincia-di-lecco.md)
- [Modificare gli eventi](fiere-dossier/107-modificare-gli-eventi.md)
- [Mappa e licenza](fiere-dossier/108-mappa-e-licenza.md)
- [Ricerca approfondita — Monza e della Brianza, 10 ottobre 2026](fiere-dossier/109-ricerca-approfondita-monza-e-della-brianza-10-ottobre-2026.md)
- [Ricerca approfondita — Treviso, 13 ottobre 2026](fiere-dossier/110-ricerca-approfondita-treviso-13-ottobre-2026.md)
- [Ricerca Mantova — 14 ottobre 2026](fiere-dossier/111-ricerca-mantova-14-ottobre-2026.md)
- [Ricerca Firenze — 16 ottobre 2026](fiere-dossier/112-ricerca-firenze-16-ottobre-2026.md)
- [Affluenza documentata — 17 ottobre 2026](fiere-dossier/113-affluenza-documentata-17-ottobre-2026.md)
- [Affluenza — secondo gruppo di 20, 17 ottobre 2026](fiere-dossier/114-affluenza-secondo-gruppo-di-20-17-ottobre-2026.md)
- [Savona — ricerca documentale del 21 ottobre 2026](fiere-dossier/115-savona-ricerca-documentale-del-21-ottobre-2026.md)
- [La Spezia — ricerca provinciale del 22 ottobre 2026](fiere-dossier/116-la-spezia-ricerca-provinciale-del-22-ottobre-2026.md)
- [Teramo — ricerca provinciale del 26 ottobre 2026](fiere-dossier/117-teramo-ricerca-provinciale-del-26-ottobre-2026.md)

- [Medio Campidano ? 4 novembre 2026](fiere-dossier/119-medio-campidano-20261104.md)

- [Agrigento — 6 novembre 2026](fiere-dossier/agrigento-20261106.md): +34 schede e 8 note economiche; 43 comuni esaminati, limiti espliciti, pubblicazione verificata.

- [Campobasso - 6 novembre 2026](fiere-dossier/campobasso-20261106.md): +226 schede e 9 note; 84 comuni esaminati. Prevalenza di fonti storiche 2021, limiti espliciti; pubblicazione verificata.

- [Potenza - 6 novembre 2026](fiere-dossier/potenza-20261106.md): +83 schede e 2 note storiche; 100 comuni esaminati, limiti espliciti, pubblicazione verificata.
