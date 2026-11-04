
## Trento — ricerca provinciale, 16 ottobre 2026

Audit in `data/fiere-trento.json`: **122 manifestazioni in 62 comuni**, prima
cinque; ricerca nominale nei **166 comuni** dell'anagrafica. Ogni comune ha
query, riferimento all'archivio, esito e schede integrate. Ricerca documentale,
non certificazione che ogni singolo evento della provincia sia censito.
**115 schede con giornate pubblicate, cinque periodi, due date testuali**;
95 schede con recapiti e 13 con termine documentato, anche già trascorso.

Letto integralmente e controllato visivamente il calendario provinciale
[ANVA Confesercenti 2026](https://tnconfesercenti.it/wp-content/uploads/2026/06/20260368094945_Doppia_PaginaFiere_2026.pdf).
Il vecchio dominio restituiva 403; la pagina Mercati e Fiere era vuota.
Recuperata la notizia 2026 dall'interfaccia pubblica WordPress e scaricato il
PDF con il browser. Date della guida indicate come `calendar`, salvo conferme
locali. Confrontati Comuni, APT Trento, Garda, Valsugana, Fassa, Val di Sole,
Vallagarina, Alpe Cimbra, Val di Non/Primiero e organizzatori. Gli eventi
espositivi AEFI di Riva sono **B2B su contratto**, non posteggi a spunta.

Correzioni e distinzioni principali:

- Trento San Giuseppe **15 marzo**, anticipato dalla determina 2421/2025;
  Santa Croce 3 maggio, Santa Lucia 12–13 dicembre, Festa d'Oro 20 dicembre.
  [Servizio comunale spuntisti](https://www.comune.trento.it/Servizi/Concessione-di-occupazione-temporanea-di-suolo-pubblico-nei-mercati-saltuari-spuntisti)
  aggiornato il 20 aprile 2026: per le due fiere di dicembre domande
  **15 settembre–31 ottobre**, non la vecchia finestra di Spazi Comuni.
- Cles: mostra agricola al CTL **1–2 maggio**, fiera ambulante in centro
  **solo 2 maggio**. San Rocco **16 agosto** da avviso comunale, non 17 agosto
  rimasto nella pagina generale Val di Sole. Ossana settembre **6 e 27**;
  Rovereto Santa Caterina **22 novembre**, Festa d'Oro **20 dicembre** dalla
  guida corrente. San Marco Rovereto conserva la regola annuale testuale:
  nessun giorno 2026 calcolato come se fosse un provvedimento pubblicato.
- Ala: San Luca **17 ottobre**, San Martino **14 novembre**, via Tre Chiodi,
  confermate dall'avviso comunale del 12 ottobre. Natale: **domanda 20 ottobre**
  negli allegati, distinta dal 21 ottobre di scadenza della notizia.
- [Natale Trento](https://natale.visittrento.it/mercatino): 20 novembre–6 gennaio,
  incluso Natale con orario ridotto. Domande chiuse il 9 luglio. Disciplinare
  2026/27 e tariffe verificati anche visivamente: quote per intera edizione,
  differenze per categoria/piazza/struttura, IVA 22%, servizi ed extra espliciti.
- Natale Ala: professionisti **224 € esterno / 320 € interno tutte le date,
  IVA inclusa**; fine settimana e hobbisti hanno tariffe proprie. Ossana:
  partita IVA **200 €**, somministrazione **350 €**, hobbisti **150 €**,
  cauzione separata **100 €**; domanda 27 settembre, saldo 27 ottobre.
  Il 27 novembre apre il percorso presepi, mercato dal **28 novembre**.
- Natale Pomarolo: bando e disciplinare 2026, domanda **5 ottobre ore 12**;
  **400 € vendita / 1.200 € somministrazione + IVA 22%**, cauzione separata
  **400 €**. Dieci casette previste, non dieci posti ancora disponibili.
- Ciuiga: mercato **30 ottobre–1 novembre**, non il refuso «domenica 2»;
  domanda 4 settembre, saldo 12 ottobre. **150 € banco / 270 € cantina**,
  regime IVA non esplicitato; somministrazione vietata, solo assaggi gratuiti.
  Tavole tariffarie di Ala, Ossana, Ciuiga e Pomarolo controllate visivamente.
- Natale Arco, Levico e Lavarone: chiusure e giornate esplicite conservate;
  Pergine: venerdì e 31 dicembre solo gastronomia, non mercato artigianale.
  Il 25 dicembre è discordante nella pagina Pergine e non viene conteggiato.
  Siror, Moena e Canazei conservano soltanto periodi; Campitello solo l'inizio.
  Faedo ricondotto a San Michele all'Adige, Bosentino all'Altopiano della Vigolana.
- Cavareno Charta: mercato **1 agosto**, non tutta la rievocazione;
  Desmontegar: Saperi e Sapori nel weekend **26–27 settembre**, non 24–27.
  Caderzone e Vallarsa hanno periodo complessivo, senza garantire i banchi
  ogni giorno. Brentonico 24–25 ottobre è eventuale rinvio meteo, non replica.

Esclusi mercati ordinari, iniziative esclusivamente private/hobbistiche o
benefiche e sagre senza vendita esterna documentata. Registrati separatamente
gli omonimi fuori provincia, le procedure per gestori/fornitori e i programmi
storici o discordanti. Folgaria artigianato estivo non mostra più le date;
Avio Herbarium e Val di Gresta restano piste senza edizione sufficientemente
confermata. Non sono inventati bandi, quote, posti o nuove edizioni.

Limiti: query individuale per tutti i comuni, non lettura integrale di ogni
albo; alcuni avvisi rispondono 410/403 al recupero diretto e sono stati letti
tramite l'indice web. Disponibilità e ammissioni non accertate quando manca
un bando corrente. Nessun contatto, messaggio o candidatura inviato.
Evidenze e risultati di ricerca in `Documents/ricerca-fiere-trento-20261016`;
URL, stato HTTP e impronte dei download nell'audit versionato. Per quattro
comuni fusi senza coordinate sono documentati punti di riferimento Revò,
Fondo, Zambana e Vigo: non posizioni esatte dei banchi; anagrafica invariata.

Tutti i cinque ID precedenti e i costi già presenti conservati; le altre
**3.442 schede identiche** al catalogo iniziale, compreso l'aggiornamento
Pisogne. Totale nazionale **3.564**. Cache `fiere.js` **46**, catalogo **37**.
Test dedicato `scripts/test-fiere-trento.cjs`, usando `PLAYWRIGHT_MODULE`:
controlli su date, IVA/cauzioni, scadenze, mesi a cavallo d'anno, copertura,
mappa e dodici dettagli su Chromium computer/telefono e WebKit telefono.
Commit dati `3c80a59`: Vercel riuscito, HTTP 200 e catalogo/script online
identici ai file del commit (non alle conversioni CRLF locali). Catalogo SHA-256
`9acf669c2cc0ac5bf9e6c88a882a1352da81bd7e69c2799b2dec4c6e74229e10`. Verificati online 122 risultati, mappa e
dodici dettagli su Chromium computer/telefono e WebKit telefono. Build, test
settori, test provinciale e suite generale sui cinque schermi/browser superati.
TO DO spuntata dopo queste verifiche: **26 province completate, 84 mancanti**.
Backup remoto `backup/session-20261016-082343-fiere-trento`; prima delle modifiche
creato anche `backup/pre-fiere-trento-20261016`. Aggiornamento remoto dei filtri
regionali acquisito senza includerlo nel commit Trento; file preesistenti estranei
conservati e non committati. Nessuna modifica a database o servizi email.
