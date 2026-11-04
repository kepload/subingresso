
## Macerata — ricerca documentale del 25 ottobre 2026

Ricerca accessibile attuale conclusa con limiti espliciti: **177 manifestazioni
in 47 comuni**, ricognizione nominale dei **55 comuni provinciali**. Riprese le
61 schede importate già pubblicate: al checkpoint `76d6075` mancava un audit
provinciale autonomo. **61 ID conservati, 116 aggiunte, 6.950 schede esterne
identiche**. Catalogo risultante **7.127 schede**, **6.926 con dati edizione**.
Nessuna altra provincia lavorata e nessuna comunicazione o candidatura a terzi.

Audit `data/fiere-macerata.json`: **121 righe** del calendario regionale su aree
pubbliche riconciliate singolarmente, più **cinque righe fieristiche specializzate**.
**1.294 ricevute tecniche**, **30 gruppi di piste chiuse**, **20 gruppi di esclusioni**
e **33 limiti**. Sono acquisizioni e tentativi, non 1.294 documenti letti integralmente.
Il feed turistico di 2.022 record è uno snapshot; screening di 126 pagine tematiche,
homepage e ricerche dei 55 Comuni, accessi SUAP/albi e approfondimento degli atti
pertinenti emersi. Non dichiarata lettura integrale degli albi storici.

**Pubblicata e verificata online:** commit dati `1eddab3`, Vercel riuscito
in 34 secondi. Cinque asset identici ai blob Git e **177 pagine HTTP200** con
H1, canonical, note e costi corretti. TO DO spuntata dopo verifica: **64 province
concluse, 46 rimanenti su 110**. Ricerca attuale chiusa con i limiti sotto;
nuove edizioni e documenti non pubblicati sono manutenzione futura distinta.

Verifiche: build finale ripetibile, isolamento dei 61 ID e delle 6.950 schede
esterne, settori, suite generale cinque formati e **7.127 pagine/3.094 voci sitemap**.
Test provinciale tramite `PLAYWRIGHT_MODULE`, locale e online: Chromium 1440/320
e WebKit 390, tutte le 177 schede in elenco/mappa e tutti i 177 dialoghi per
formato, otto pagine senza JavaScript per formato. Anche sito reale senza
intercettazioni verificato nei tre formati, con dettaglio Epicomics e costi.
Lettura finale degli ulteriori regolamenti coperta dai controlli dati/SSR e dalle
prove online; gitleaks passato senza bypass. Cache JS117/JSON85.

Backup completo degli originali con `scripts/backup-fiere-research.py`:
`Documents/backup-subingresso/ricerche-fiere-20261025-095902`, **110.529 file,
16.341.867.281 byte**, tutti verificati SHA256, zero errori.
Manifest `6a4a9f269519e007717fc1bf527a75f2a389dccadc66c7760f8fbc74e7b7d00e`, ricevuta `backup-verified.json` nel dossier privato.
Prima copia interrotta per disco pieno; recuperati 10.000.429.133 byte collegando
3.236 duplicati SHA256 soltanto tra backup, senza collegamenti agli originali.
Ripresa del helper in copia privata con sostituzione atomica dei file cambiati:
backup precedente preservato, nuova verifica completa senza errori. Tentativi e
recupero registrati nel dossier; nessun originale o altro lavoro eliminato.
Supplemento finale `supplement-macerata-final` separato, senza modificare il
manifest iniziale, conserva versioni definitive e prove successive.

### Date e condizioni verificate sugli originali

- [Calendario Marche su aree pubbliche, aggiornamento 18 giugno](https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf):
  tutte le 121 righe MC esaminate, incluse le voci generiche del capoluogo,
  dichiarate come titoli descrittivi. 120 voci pubblicate; Fiera di Natale di
  Macerata non aggiunta separatamente in assenza di prova di autonomia rispetto
  alle rassegne documentate. Non affermata per ipotesi l’identità con il Barattolo.
- [Leguminaria, modulo comunale DOC 2026](https://www.comune.appignano.mc.it/wp-content/blogs.dir/4/files/mod.partecip.LEGUMINARIA-17.18-OTTOBRE-2026-2.doc):
  banchi **17–18 ottobre**, non tutta la festa dal 16. **40/60 € al giorno** per
  4×4/8×4 m, sabato da solo non ammesso, bollo 16 € separato; termine 31 agosto
  concluso. Testo binario Word estratto dalla piece table, non impaginazione Word.
- [Montefano Conca](https://www.comune.montefano.mc.it/wp-content/blogs.dir/43/files/bando-2026.pdf):
  2 giugno, 50 non alimentari, 25 € + bollo 16, termine 4 aprile trascorso;
  incongruenza spunta 7:45/8 esplicitata.
  [Sapori d’Autunno](https://www.comune.montefano.mc.it/wp-content/blogs.dir/43/files/3-All.-Det-Bando-Fiera-Sapori-2026.pdf):
  fiera **25 ottobre**, festa 23–25; 18 posteggi principali con sei agricoltori,
  più otto produttori locali esenti. 25 € area principale, 10 € aree Pro Loco,
  bollo distinto; limitazioni elettriche e alimentari riferite all’area corretta.
- [Mela Rosa, programma comunale aggiornato il 23 ottobre](https://www.comune.montesanmartino.mc.it/vivere-il-comune/eventi/saperi-e-sapori-della-mela-rosa/):
  **7–8 novembre**, mercato sabato dalle 15 e domenica dalle 8:30 nella locandina
  originale visualizzata. Regolamento 2018 ripubblicato nel 2024: selezione di
  produttori/trasformatori/rivenditori specializzati, domanda Pro Loco e quota
  fissata dalla Giunta. Importo e modulo 2026 non recuperati; vecchia esenzione
  TOSAP e ingresso gratuito non significano banco gratuito. Non usato il 6 novembre
  di un portale secondario, né gli orari storici 16/9 del regolamento.
- [Le Terre del Tartufo, preadesione originale 2026](https://www.leterredeltartufo.it/wp-content/uploads/2026/10/modello-pre-adesione26.pdf):
  **5–6 dicembre a Pieve Torina**, adesioni aperte dal 16 ottobre. Preadesione
  distinta da concessione e disponibilità; termine e quota assenti nel modello.
  Il sito mescola il programma 2025 con il nuovo avviso: orari/menu 2025 non
  trasferiti al 2026.
- [Zucche Ovunque, delibera 187/2026](https://portorecanati.halleyweb.it/de/attachment.php?serialDocumento=03FHHY020269S):
  25 ottobre, **8–20** nell’atto e **9–20** nel programma pubblico, differenza
  conservata. Gazebo bianchi e tema autunnale; concessione e canone a Mylove,
  nessuna tariffa individuale desunta dal patrocinio gratuito.
- [Epicomics, modulo espositori](https://www.electrofiere.it/epicomics-espositori/):
  7–8 novembre 2026 da programma/biglietteria. Solo modulo aziende: **45 €/metro
  lineare**, minimo due, tavolo 2×0,8 m **15 €**. Calcolo DOM 2 metri + 1 tavolo
  = 105 € verificato senza invio, POST bloccati. IVA, servizi ulteriori e privati
  non precisati: sintesi parziale, non totale universale.
- [Brandozzi, calendario originale](https://www.mercatiniantiquari.com/appuntamenti.html):
  Caccia all’Affare 28 febbraio–1 marzo e 21–22 novembre; Civitanova Vintage
  18–19 luglio, Porto Vintage 25–26 luglio. Requisiti della singola tappa distinti;
  sede civitanovese lungomare/retro Cecchetti resta una discrepanza esplicita.
- Camerino Sant’Antonio **17 gennaio al Vallicenter**, non 18 del registro.
  Infiorata Castelraimondo **5–7 giugno**, mercato Festività separato il 2.
  San Giuliano **30–31 agosto**, Barattolo ospitato senza duplicato.
  Sarnano Patrono **15 agosto** e Assunta **16**, graduatorie separate.
  Porto Recanati fiera **21 giugno**, non il 22 aggiunto dalla mezzanotte;
  mercatino del **26 luglio annullato**, recupero il **6 settembre**.
  Filiera Viva Bolognola: Local Market solo **11 ottobre**, non anche il 10.
- Fiastra Fantasy da programma/mercato originali Keemar **12–13 settembre**,
  dopo pista DiscoverFiastra 404. InChiostri **21–22 marzo**, programma originale
  visualizzato: riquadro espositori 15–19/10–19, apertura generale sabato 14:30
  mantenuta come differenza. Onda d’Arte dal programma originale TdiC 29 agosto;
  regolamento generale letto: call locale scaduta il 21 luglio, gratuità della
  call con costi accessori distinta dalla tariffa del banco Mylove. Il 12 settembre
  è solo riserva maltempo, non seconda edizione. Locandina Treia San Vito
  visualizzata: elenca spettacoli senza isolare le giornate dei banchi.

### Limiti chiusi della ricerca attuale

Allegati Recanati: l’indice comunale trova gli atti correnti, ma tre originali
restituiscono sola navigazione via HTTP e blocco WAF 500 in Chromium. L’Antico
conserva la prima domenica da Cose di Casa, dichiarata fonte secondaria, senza
dodici date confermate. San Vito 14–15 giugno resta calendario regionale;
articolo comunale con sabato 14/domenica 15 riferito al 2025 non riutilizzato.
Regolamenti Civitanova Eventi non recuperati dopo accessi HTTP/browser e prove
dei pulsanti download: niente quote o procedure presunte. Mylove: dominio non
risponde, Facebook pubblico senza post; EvePla completo letto con apertura web
dopo 403 diretto. Fonti secondarie esplicite per le date che ne dipendono.

Cibaria 31 ottobre–4 novembre è soltanto periodo regionale, senza programma
locale 2026; Mielemente 5–8 dicembre dal calendario Città del Miele 2026, mentre
il sito evento è ancora al 2024. Elettronica 19–20 settembre resta calendario:
avviso CB Club di mancato svolgimento senza anno e biglietteria singola 403 non
consentono conferma o annullamento certo del 2026. Petriolo San Martino: 11 novembre
nel registro, graduatoria 2026 senza giorno; termine albo e data 2025 non sono prove.

Esclusi Car Boot Matelica tra privati, mercati bambini, beneficenza, eventi senza
prova di commercio esterno, Antichi Sapori Cessapalombo e Castagnata Penna con
date contraddittorie, Formaggi d’Autore Gualdo sospeso nel 2015, RACI solo proposta
di ripresa, Artistrada con domini in vendita e soli atti 2019 recuperati. Otto
comuni senza schede idonee non sono dichiarati privi di eventi. Quote, bollo,
cauzione, ingresso del pubblico e anni restano separati; sei sintesi costo.

Originali, tentativi, estrazioni e prove:
`C:/Users/utente/Documents/ricerca-fiere-macerata-20261025`.
Backup preventivi tag `backup/session-20261025-095833-fiere-macerata` e ramo
`backup/pre-fiere-macerata-20261025` verificati su origin. Future verifiche di
nuovi bandi, programmi e disponibilità sono manutenzione distinta dalla ricerca
attuale conclusa; nessuna attesa di futuri documenti per chiudere il lavoro corrente.
