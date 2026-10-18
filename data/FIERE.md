# Calendario fiere — fonti e aggiornamento

## Udine — ricerca documentale corrente, 18 ottobre 2026

**89 manifestazioni in 48 comuni**, prima cinque: 84 aggiunte, 66 schede con
almeno una data puntuale, 117 voci di edizione e sei sintesi di costo.
Catalogo nazionale 4.470; conservati i cinque ID pubblicati e le altre 4.381
schede. Audit `data/fiere-udine.json`, integrazione `scripts/build-fiere.py`;
cache fiere JS78/JSON54. Nessuna ricerca avviata su altre province.

Ripresa dai materiali conservati e dalle cinque schede pubblicate: nel commit
iniziale `a078dba` e in questo documento non esisteva ancora un audit Udine.
Checkpoint remoto già creato `backup/session-20261018-083453-fiere-udine` e
branch `backup/pre-fiere-udine-20261018`, conservati senza ripeterli alla ripresa.
Originali, testi, risultati e tentativi in
`Documents/ricerca-fiere-udine-20261018`; 444 ricevute di acquisizione nell’audit,
oltre alle ricerche e alle prove browser. I documenti di terzi restano fuori
dal repository pubblico, comprese graduatorie con dati personali.

Metodo: ricognizione nominativa dei 134 comuni, confronto con calendario
regionale del 4 giugno 2026 e 31 pagine del motore PromoTurismoFVG filtrato
2026–6 gennaio 2027 (216 occorrenze dichiarate, 31 candidati udinesi deduplicati;
non archivio integrale degli eventi passati). Le sette righe regionali Udine
sono sei manifestazioni perché Biker Fest ha due edizioni. Consultati originali
comunali/SUAP, programmi, regolamenti, moduli, organizzatori e alternative per
404, certificati scaduti e siti JavaScript; pagine dinamiche lette con Chromium
tramite `PLAYWRIGHT_MODULE`. La copertura dei 134 comuni è una ricognizione
nominativa, non una lettura integrale dei loro albi. Nessuna comunicazione a terzi.

Riscontri decisivi e distinzioni operative:

- Codroipo: delibera 230 del 30 settembre e graduatoria originale dei precari;
  mercato San Simone **25 ottobre**, distinto dalla festa 17–28. Graduatoria
  esistente non significa che vi siano posti ancora assegnabili.
- Udine Santa Caterina: regolamento 2023 con 182 posteggi, spunta alle 8,
  vendita 9–19 e divieto generatori. Appalto tecnico 2026 non è domanda banco;
  nessun atto trovato risolve le date discordanti 20–22/23 novembre. Mantenuto
  novembre testuale senza calcolare una conferma dal regolamento.
- Cervignano San Martino: originale comunale del regolamento 2010 recuperato
  dopo dominio vecchio con certificato scaduto/404. Domanda almeno 60 giorni
  prima, ricorrenza testuale e possibili deroghe; calendario, quote e graduatoria
  2026 non recuperati. Albo bloccato dal firewall anche in Chromium, servizi
  e calendario comunali invece letti. Questo limite è esplicito nella scheda.
- Tolmezzo: Festa della Mela, **banchi 19–20 settembre**, non intera festa
  17–20; regolamento distingue categorie, giorni e superfici aggiuntive.
  Gonars: 30 € ambulanti/10 € hobbisti e altre categorie dal modulo autunnale,
  senza trasferirli alla primavera. Pasian: Soffitte in Festa riservato a privati,
  contributo 10 €, divieti e termine il giorno prima; non opportunità professionale.
- Lignano: Villaggio del Gusto, domanda **31 ottobre 2026**, selezione fino
  a 15 food/5 oggettistica, non posti residui. Casette e IVA 22%, cauzioni e
  consumi distinti. Refuso «1–6 gennaio 2026» nel programma 2026/27 non corretto
  per ipotesi: blocco testuale da chiarire. Sandy Wheels senza quota ma con
  cauzione strutture 250 € e RC esclusa; termini food discordanti e trascorsi.
  Bersaglieri 28–31 maggio: 500 € IVA inclusa per l’intera manifestazione,
  non al giorno; pagine PDF renderizzate perché l’estrazione perde caratteri.
- Bertiolo: programma originale prova mercati il **15 e 22 marzo**, non
  l’intera festa. Corno: recuperato libretto 2026 dopo errore TLS, ma moduli
  bancarelle ancora 2024 e quote prive d’anno: nessun prezzo attuale inventato.
- Forni di Sopra: programma immagine Erbe, banchi **14 e 21 giugno**, non
  i sabati; Funghi **13 settembre**, non il 12 contenuto nell’URL. Forni Avoltri:
  calendario originale 2026 conferma Festa del Mercato il 24 ottobre; la vecchia
  Festa dei Frutti di Bosco 2022 non viene trasformata in un’edizione attuale.
- Recuperati EXPO Distretto Cervignano dal sito originale, Vendoglio da Comune
  e locandina PDF, Ronchis dalla locandina originale: banchi solo **27 settembre
  e 4 ottobre**. Carlino: programma comunale con hobbisti solo **20 settembre**.
  Primulacco: mostra mercato fiori 15–24 maggio ogni giorno esplicitamente,
  distinta dal mercatino scolastico. Sauris Prosciutto: due fine settimana,
  non nove giorni continui. Casa Moderna esclude chiusure 6–8 ottobre.
- Sappada: coordinate mancanti nell’anagrafica condivisa; quattro schede usano
  il centro abitato dal nodo OpenStreetMap 64778154, letto via API, con fonte
  dedicata. Non rappresentano il posteggio esatto e non modificano l’anagrafica.

Esclusioni motivate nell’audit: **Festa della Zucca Venzone 2026 annullata**
dall’organizzatore; mercatini solo scolastici, beneficenza gestita dai volontari,
vendite di singoli negozi, mostre senza vendita provata, sagre con sola cucina
associativa e mercati settimanali ordinari. Dodici schede dichiarano una fonte
secondaria; anche l’edizione ottobre Mortegliano è secondaria, distinta dalla
primaria di aprile. Fonti primarie alternative cercate e limiti conservati.

Ricerca documentale attuale conclusa con limiti espliciti, senza promessa di
censimento esaustivo, posti liberi o autorizzazioni. Le piste individuate sono
state chiuse con originali/alternative accessibili o esclusioni motivate;
non occorre attendere bandi futuri. **Verifiche periodiche separate:** nuovi
bandi e quote, conferme Santa Caterina/Cervignano, programma San Carlo/Latisana,
Advent Pur annunciato dal 1 novembre, refuso gennaio Lignano, ricorrenze e
sostituzione delle fonti secondarie. Sauris Natale resta edizione 2025.

Pubblicato **65b6b38**, [Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/73k8m5MUtcc3NEcfsiwvjTGKXwHn); catalogo, audit,
HTML e JS identici ai file del commit, **89 pagine HTTP 200 con H1 e canonical
corretti**. Test provinciale passato localmente e online su Chromium 1440/320
e WebKit 390; suite generale locale sui cinque formati, build, settori e
4.470 pagine/1.778 voci sitemap passati. Scansione segreti senza rilievi.
Verificate 421 impronte degli originali, zero file mancanti o discordanti.
Nuova copia della ricerca conclusa in
`Documents/backup-subingresso/ricerche-fiere-20261018-110518`:
**30,055 file, 5,671,310,309 byte, tutti verificati SHA256, zero errori**;
manifest e propria checksum verificati. Include l’archivio Udine e le prove
online raccolte; nessun archivio precedente eliminato o sovrascritto.
TO DO spuntata e riepilogo aggiornato **dopo verifica**: 34 province concluse,
76 da fare su 110. File estranei preservati ed esclusi dai commit.
Prove `Documents/ricerca-fiere-udine-20261018/publication-data.json`,
`online-validation.json`, `originals-validation.json`, `backup-verified.json`;
metadati finali verificati separatamente nel successivo deploy di registrazione.
Test dedicato `scripts/test-fiere-udine.cjs`: dati precedenti, ID, esclusioni,
date commerciali, IVA/cauzioni, ricorrenze, elenco/mappa e pagine senza JavaScript
su Chromium 1440/320 e WebKit 390; variabile `FIERE_UD_BASE_URL` per il sito pubblico.

## Conservazione ricerche e affinità senza selezione — 18 ottobre 2026

Preferenza permanente: conservare tutti i materiali raccolti nelle ricerche,
comprese fonti, originali disponibili, estrazioni, criteri, voti, esclusioni,
tentativi falliti, limiti e prove. Cataloghi/audit nel Git; documenti di terzi
fuori dal repository e dal sito pubblico. Dopo nuove ricerche usare
`python scripts/backup-fiere-research.py`: nuova copia locale senza cancellazioni,
manifest con percorsi/dimensioni/SHA256, controllo di ogni copia, uscita in errore
se manca anche un file. Comprende gli archivi fiere in Documents, costi Pisogne,
bollini, dati delle copie di lavoro provinciali e sorgenti/riproduzione del repo.
Include anche fonti/articoli regionali e materiali delle guide trovati in Temp.
Non recupera materiali mai salvati; non attiva esecuzioni periodiche e la copia
sullo stesso computer non costituisce un backup esterno. Prima copia conclusa
il18/10, `Documents/backup-subingresso/ricerche-fiere-20261017-234704` (UTC):
26.827 file,5.250.439.854 byte, tutti verificati SHA256, zero errori; manifest
con percorsi/dimensioni/impronte e propria checksum verificata. Copia ripresa
nella stessa cartella per velocizzare e includere guide/QA, nessun originale
eliminato. Esito `Documents/verifica-affinita-vuota-fiere-20261018/backup-verificato.json`.

Senza articoli selezionati, nessun elemento affinità viene creato nelle anteprime;
la colonna destra resta disponibile per l'affluenza. Selezionando un articolo
tornano voto o «Da valutare» e motivi/fonti. Cache JS76, CSS29/catalogo52 invariati.
Test affinità e ricerca articoli locali passati nei quattro casi Chromium1440,
820,320×568 e WebKit390. Suite affinità passata anche online: vuoto iniziale,
ultimo articolo rimosso, «Deseleziona tutte», reset, caricamento altre schede e
ricaricamento; voto/motivi/fonti, selezione multipla, colori e tastiera conservati.
151.270 coppie e conservazione del catalogo verificate. Pubblicato `9add5cf`,
Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/2KU746tzTMa54p62ms1zqMbRJ5u7);
HTML/JS/catalogo/profili online identici al commit. Prove e immagini in
`Documents/verifica-affinita-vuota-fiere-20261018`, esiti in `verifiche.json`
e `pubblicazione.json`. Backup remoto `backup/session-20261018-014508-fiere-affinita-vuota-archivi`
verificato; consueto errore PowerShell nel cleanup tag, checkpoint valido.

## Affinità articoli — revisione del 17 ottobre 2026

Questa revisione sostituisce la prima scala basata soprattutto sulla presenza
di parole nei settori. Non misura probabilità di vendita, incassi, ammissione
o disponibilità. Le35 tipologie comprendono ora abbigliamento vintage, libri
antichi, cioccolato e olio, per distinguere un prodotto preciso dalla categoria
generica. Selezione multipla e OR tra articoli conservati.

11 profili in `fiere-affinita.json` coprono18 fiere: fonti degli organizzatori,
prodotti centrali/complementari, condizioni di pertinenza, vendita documentata,
data di consultazione e scadenza17 aprile2027. Copertura esplicitamente parziale;
per le altre schede la stima usa i soli prodotti documentati e il tema dichiarato.
Nessuna differenza inventata tra appuntamenti dello stesso format.

- 9: prodotto centrale verificato e vendita documentata nelle fonti primarie.
- 8: articolo documentato e coerente con il tema; niente9 senza prova della vendita.
- 7: prodotto documentato che completa il tema o assortimento verificato.
- 6: presenza generica oppure sottotipo/area precisa da rispettare.
- Da valutare: dati insufficienti. Eliminato il6 automatico per famiglie vicine.
- 2: soltanto esclusione esplicita globale con fonte recente ed edizione attuale;
  conservate le cautele su operatori, aree, vecchie edizioni e somministrazione.

Il nome della fiera conferma un tema solo se l'articolo è già documentato:
non aggiunge prodotti e non genera giudizi negativi. Le condizioni compaiono
anche nel riquadro del voto. Il dettaglio distingue verifica sulle fonti e stima
dalla scheda, con collegamenti primari. Pagine autonome con articoli verificati.
Con più articoli, anteprima sul migliore e dettaglio di ciascuno.

Esempi: Forlì abbigliamento vintage9, abbigliamento generico6 «Vintage o remake»;
Expo Elettronica non estende l'usato a ogni merce; Eurochocolate cioccolato9,
dolciumi6; Olio Capitale olio9, prodotti agricoli6; Ortogiardino piante8,
alimentari Da valutare senza ereditare il contemporaneo Cucinare. Orticolario
piante9 dopo lettura del regolamento2026 e della vendita al pubblico. Le tre
sigle dei mercati di Forte dei Marmi sono attribuite ai consorzi documentati,
senza trasferire automaticamente assortimenti tra organizzatori diversi.

`build-fiere.py` valida ID, ruoli, date, fontiHTTPS e condizioni, collega solo
ID esistenti e integra macrosettori esplicitamente supportati. Browser e SSR
ignorano profili scaduti/non validi. Catalogo4322: invariati tutti i campi
precedenti, salvo le unioni dei macrosettori autorizzate nelle18 schede.
Scadenza dei profili e mancata prova non diventano mai giudizi negativi.

Archivio esterno `Documents/ricerca-affinita-fiere-20261017`:18 schede iniziali,
manifest con URL/esiti/impronte,15 download200 su16 fonti. Olio Capitale403 nel
download diretto: contenuto primario consultato via web, limite conservato.
Locandina ufficiale Crevalcore letta anche visivamente per confermare il format.
Nessun contatto a terzi, nessuna nuova ricerca provinciale dichiarata conclusa.

Test `scripts/test-fiere-article-research.cjs`:151.270 coppie (2:9,6:1979,
7:88,8:413,9:33, senza voto148748), solo fonti verificate per9 e solo esclusioni
esplicite per2. Conservazione integrale salvo aggiunte autorizzate, scadenze,
validazione build, varianti/condizioni/fonti e quattro formati/browser passati.
Regressioni articoli e affinità quattro formati, affluenza e pagine Chromium1440/320
e WebKit390, calendario320, settori, build e sintassi passati. Tutte4322 pagine
e1625 voci sitemap validate. Cache JS75/CSS29/catalogo52.

Pubblicato `35d27cf`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/DJxc2iwEKCpp9BjEw9DWo7qJ9Sti); HTML/JS/CSS/catalogo/profili online identici. Test ricerca e affinità passati anche online su Chromium1440/820/320 e WebKit390, incluse varianti6/9, condizioni, fonti, selezione multipla e colori. Prove in `Documents/ricerca-affinita-fiere-20261017/online` e `pubblicazione.json`.

Filtri compatti già pubblicati in `a98f526`, Vercel
[riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/BWxv1zQ4PJY93gWFshv1v9ocgswA).
HTML/CSS online identici e test articoli online Chromium1440/820/320 e WebKit390
passato. Risparmio218px a697px di larghezza,168px a390px; controlli≥44px.
Misure e immagini prima/dopo in `Documents/verifica-spazi-fiere-20261017`.

## Piacenza — ricerca documentale conclusa il 18 ottobre 2026

111 manifestazioni in 37 comuni: dalle 47 già pubblicate, 64 aggiunte.
Ricognizione nominale dei 46 comuni; 99 schede con almeno una data puntuale
non limitata al periodo della festa, cinque sintesi costo con condizioni.
Catalogo nazionale 4.386; conservati i 47 ID e le altre 4.275 schede identiche.
Questa continuazione supera i residui e lo stato parziale del 17 ottobre sotto.

Audit riproducibile `fiere-piacenza.json`: fonti e tentativi della continuazione,
copertura per comune con percorsi amministrativi, esclusioni motivate e limiti.
Originali/estrazioni/impronte in `Documents/ricerca-fiere-piacenza-20261018`;
prima sessione conservata. Backup remoto preventivo
`backup/session-20261018-074700-piacenza-verifiche-residue`.

Letti avviso e convenzione Pontenure: 10 € a presenza per hobbisti, i 147 €
sono onere del gestore; scadenza 27 maggio per la gestione, non espositori.
Paderna: autunno 10–11 ottobre 2026 e primavera 2026/2027 da originali, senza
scambiare biglietti pubblico per quote banco. Mercanti: singole tappe documentate
da Comuni, ordinanze e organizzatori; calendario unico non recuperato, niente
40 date ricostruite. Rivergaro: ordinanze e PDF originali, viabilità distinta
da orari vendita. San Giorgio: mercato 20 settembre, non tre sere di festa.
Allegati Municipium recuperati dal medesimo deposito pubblico alternativo
quando API/cloud403; albi Halley alternativi dopo link dinamici senza navigazione.

AEFI 2026: entrambe le pagine, 23 righe e schede originali; confrontate tutte
le pagine correnti Expo con date esplicite 2026/2027. Convegni puri esclusi,
saloni professionali distinti da spunta ambulanti; mostra scambio ornitologia
11–13 dicembre, non giorni alloggiamento/giudizio. Natale: originali A/Mano,
Vigoleno e Grazzano, cancellazioni riconosciute, vecchie edizioni2025 separate;
casette volontariato non sono bando commerciale. Giornate Ciliegie 7/14 giugno,
Gropparello 13 settembre e Castagne 4 ottobre distinte dalle intere feste.
SpazioStore: riservato a privati, 15 € a piazzola con esenzioni; non candidatura
per ambulanti professionali e non tariffa generale del mercato agricolo.

Limiti: calendario regionale annuale non recuperato nella precedente sessione,
albi correnti non storici integrali, SUAP in area personale senza autenticazione;
originali Gossolengo e Castel San Giovanni rimossi410 (Gossolengo confermato
anche dal volantino originale, Castel San Giovanni resta `periodOnly`).
Pagine intermittenti e fonti indicizzate dichiarate; quote e date mancanti
non inventate. Comuni senza schede non dichiarati senza eventi. Ricerca attuale
chiusa dopo le piste accessibili, con limiti espliciti e senza garanzia di
censimento esaustivo. Nuovi bandi, quote, date e documenti rimossi sono verifiche
periodiche future: non occorre attenderli per chiudere la ricerca corrente.

Pubblicazione dati `3ab39be`, [Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/8r4JVcHUb1yPv7XqBPif4b8Xfqgy); catalogo,
audit, HTML e JS corrispondenti al Git (normalizzazione LF). Tutte le 111 pagine
pubbliche HTTP 200, H1/canonical e istruzioni controllati. PLAYWRIGHT_MODULE:
Chromium 1440/320 e WebKit 390, elenco/mappa, pagine senza JS e overflow passati
localmente e online. Build, settori, 4.386 pagine/1.689 sitemap e suite generale
cinque formati passati. Cache JS77/JSON53, nessuna modifica grafica.
Prove in `Documents/verifica-piacenza-20261018`. Copia ricerca verificata
`Documents/backup-subingresso/ricerche-fiere-20261018-061412`, manifest/SHA256,
nessun precedente sovrascritto; conteggi nel manifest. Nessun contatto a terzi.
TO DO spuntata soltanto dopo verifica: 33 province concluse, 77 rimanenti su 110.

## Piacenza — integrazione parziale del 17 ottobre 2026

47 manifestazioni in 24 comuni (prima quattro; +43), catalogo nazionale 4.322.
Conservati i quattro ID iniziali e le altre 4.275 schede identiche.
**Ricerca approfondita non conclusa**: Piacenza resta non spuntata e il conteggio
rimane 32 province completate, 78 da fare. L’elenco dei 46 comuni nell’audit
è ricognizione preliminare, non una dichiarazione di copertura approfondita.
Fonte riproducibile `fiere-piacenza.json`; stato, esclusioni, tentativi e piste
aperte in `research`. Archivio esterno `Documents/ricerca-fiere-piacenza-20261017`.
Backup remoto `backup/session-20261017-170713-fiere-piacenza`.

Letti i regolamenti originali Piacenza e Cortemaggiore 2026 e recuperati 17
allegati pubblici Pianello/Bobbio tramite il meccanismo di download delle pagine
(SCHIOCCIOLA, sola lettura). Conservati originali, estrazioni e impronte SHA256;
planimetrie scansionate senza testo ancora da leggere visivamente. Nessun dato
personale degli elenchi operatori ripubblicato nell’audit. Pianello: quota 30 €
più canone per superficie, importi/arrotondamenti differenti per posteggio, nessun
prezzo totale universale. Bobbio: domanda scaduta 10 maggio, 21 giugno 8–19,
alimentari senza food truck in Piazza Duomo, non alimentari in altre due aree.

Bettola 13–14 settembre: il 12 è annullato nella pagina comunale aggiornata.
Coppa Carpaneto: solo fiera banchi del 6 settembre, non festa 4–7; Aglio
Monticelli: market 3–4 ottobre, non spettacoli 1–4. Morfasso solo domenica
12 luglio. Curiosando: nove giornate condivise, 6 settembre discordante escluso;
San Giuseppe è componente della stessa scheda. Bobbio Vintage del 21 giugno
è la componente del programma San Giovanni, non un secondo mercatino duplicato.
Grazzano: organizzatore 14 novembre 2026–6 gennaio 2027, finestra `periodOnly`,
non apertura quotidiana. Castelvetro: data speciale 8 dicembre conservata,
giorno settimanale errato della fonte non replicato. Caorso e Travo ricorrenze
scritte senza trasformare un intero periodo in presenza quotidiana.

Limiti concreti: Visit Piacenza restituisce 500/timeout nei download diretti,
anche con www, senza slash, query alternativa, HTTP e Chromium; sitemap XML
leggibili, molte pagine consultate via web su versioni indicizzate. Le risposte
web archiviate non garantiscono che la pagina corrente sia identica. Regione:
ricerca annuale non accessibile via HTTP/browser/web; la pagina iniziale dichiara
solo fiere dal giorno di consultazione. Nessun censimento annuale completo dedotto.
Cadeo: avviso comunale espositori del 12 aprile emerso, pagina puntuale non
recuperata via web; confronto calendario turistico e indice comunale. Esclusa
Cuore di Mamma 2026 per sospensione esplicita. Le vecchie fiere soppresse di
Piacenza non riattivate dal nome di una nuova festa. Mercato medievale Gropparello:
commercio esterno non dimostrato; bambini/beneficenza e solo pasti esclusi.

Restano verifiche praticabili, elencate nell’audit: calendari e albi/SUAP comunali,
Mercanti di Qualità (fonte secondaria Gossolengo con giorni incoerenti scartata),
Agazzano, Castel San Giovanni, Gossolengo, Busslanein, Pontenure/Paderna,
mercatini natalizi e saloni Expo annuali. I comuni senza schede non sono dichiarati
privi di eventi. Queste sono attività residue della ricerca corrente, distinte
dalla manutenzione periodica futura. Nessuna comunicazione o domanda a terzi.

Pubblicazione `8b962c2` verificata: [Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/6dw7jRvmAWsowHAhMhNiBA6VNDNu).
Catalogo pubblico identico al blob Git (SHA256
`a0b70349eff49901a68e213b6e372cfc7a8073f9bb8921080a9cf9b946607b26`);
HTML, JS e audit corrispondenti dopo normalizzazione CRLF/LF. Tutte le 47
pagine online HTTP200, H1 e canonical esatti. Suite provinciale locale/online
Chromium1440/320 e WebKit390: tutti gli ID in elenco e mappa, tre pagine senza
JavaScript, nessun errore o overflow. Build, settori e verifica delle 4.322
pagine/1.625 voci sitemap passati. Cache JS71/catalogo51. Riepilogo aggiornato
solo per schede pubblicate: 4.322; province concluse restano 32, mancanti 78.
La pubblicazione verificata non chiude la ricerca approfondita di Piacenza.

## Forlì-Cesena — ricerca documentale del 17 ottobre 2026

88 manifestazioni in 30 comuni, dalle 23 schede iniziali: 65 aggiunte,
76 con almeno una data esatta, 14 sintesi di costo. Ricognizione nominale
dei 30 comuni; copertura non significa censimento esaustivo né posti liberi.
Tutte le 4.191 schede delle altre province e i 23 identificativi conservati.
Audit, fonti, tentativi, esclusioni e limiti in `fiere-forli-cesena.json`;
originali fuori repository in `Documents/ricerca-fiere-forli-cesena-20261017`.
Backup remoto `backup/session-20261017-162614-fiere-forli-cesena`.

Calendari e ordinanze Forlì/Cesena, graduatorie Dovadola/Civitella/Galeata,
moduli Gambettola e Roncofreddo, regolamento Sogliano, organizzatore Mixer,
turismo e programmi originali confrontati. I 1.046 URL nel manifest sono
tentativi HTTP, inclusi 480 endpoint regionali esplorativi abortiti: non
1.046 documenti letti. Pagine comunali JS renderizzate; sei originali
controllati anche visivamente. Download HTTP 200 può essere shell o pagina
inesistente: esiti applicativi distinti nei limiti. Nessun contatto a terzi.

Correzioni principali: Dovadola 18/25 ottobre, Natale Forlì dal 21 novembre
al 6 gennaio, Libro dal 25 settembre al 2 novembre; San Crispino mercato
24/25 ottobre, 23 solo street food. Montiano mercato solo 20 settembre,
Pisello ambulanti solo 17 maggio. Sogliano tre domeniche e IVA esclusa,
Roncofreddo IVA inclusa e categorie distinte. Abbonamenti, cauzioni,
contributi e biglietti pubblico non confusi con costo giornaliero banco.

Limiti chiusi documentalmente: storico regionale non recuperabile con
query annuali. Artusiana: link comunale pagina inesistente, REST e slug
alternativo falliti; ultimo tentativo con query anticache sullo slug2025
recupera il contenuto aggiornato2026. Letti quattro allegati mercato e
quattro PiazzaArtusi: domanda mercato20maggio ore13, cauzione100€
rimborsabile, non quota banco; PiazzaArtusi associazioni1giugno ore9,
canale separato. Scheda promozione B.4 richiamata ma non collegata, da
recuperare per nuove candidature. Avviso logistico non è domanda banco.
Borghi e Meldola: poster originali riprodotti e cronache secondarie
dichiarate, moduli/quote non reperiti. Predappio originale organizzatore
leggibile via ricerca ma download vuoto, seconda giornata non inventata.
Fratta conserva esplicitamente edizione2025; Bertinoro estate, Zadina,
FestinVal/Pasquetta e Sangiovese restano testuali dove necessario.
Pulci 14 settembre e Madamarosè 2 luglio in conflitto: sole date condivise.
Sole feste gastronomiche/spettacoli, bambini e usato solo privati esclusi
quando manca prova di opportunità compatibile. Altre esclusioni nell’audit.

Ricerca attuale conclusa nelle fonti accessibili; future pubblicazioni,
nuove quote, disponibilità e calendari annuali sono manutenzione distinta.
Controlli locali passati: build, settori, 4.279 pagine e 1.582 voci sitemap;
suite generale su cinque formati/browser. Test provinciale: 88 ID in elenco
e mappa, settori, dialog e pagine senza JavaScript su Chromium 1440/390
e WebKit 390. Confronto integrale: altre 4.191 schede identiche.

Cache fiere.js70/catalogo50. Pubblicazione dati `567a1f5`, Vercel riuscito:
[deploy verificato](https://vercel.com/kycykuardit-9234s-projects/subingresso/7r3DM9rL3ykhVFbLc8wt2LShJZmT).
Catalogo, audit provinciale, HTML e JS online identici dopo 21 secondi.
Tutte le 88 pagine pubbliche HTTP 200, H1 e canonical esatti, istruzioni
presenti. Test provinciale passato anche online su Chromium 1440/390 e
WebKit 390: ID elenco e mappa, settori, cinque dialog, tre pagine senza JS,
nessun errore o overflow. Riscontri in `verification-online.json` esterno.
TO DO spuntata solo dopo questi esiti; riepilogo aggiornato a **32 province
completate, 78 rimanenti su 110**, totale nazionale **4.279**. Future verifiche
periodiche distinte e limiti conservati; nessun’altra provincia avviata.


## Ravenna — ricerca documentale del 17 ottobre 2026

**131 manifestazioni in 17 comuni**, prima 19: **+112 nette**. Ricognizione
dei **18 comuni** della provincia; conservati tutti i 19 ID preesistenti e
le **4.083 schede delle altre province identiche**. Catalogo totale **4.214**.
Audit, copertura nominativa, originali/impronte, tentativi, esclusioni e limiti
in `fiere-ravenna.json`; archivio esterno `Documents/ricerca-fiere-ravenna-20261017`.
115 schede con giornate pubblicate, cinque con periodi e undici solo testuali;
56 con recapiti, sette con termine documentato, undici sintesi di costo.

Ricerca documentale corrente conclusa con limiti espliciti, senza censimento
esaustivo o garanzia di posteggi. Verifiche periodiche future distinte dalla
chiusura attuale. Nessun contatto, messaggio, candidatura o pagamento a terzi.
Pubblicazione `6e9e899`, Vercel **READY** `dpl_CxVSS2yEMfG8gRprq7RjbhSm36bX`.
Catalogo, HTML e JS online identici entro 15 secondi dall’avvio della verifica;
131 pagine pubbliche HTTP 200 con nome, canonical e istruzioni. Test online
Chromium 1440/390 e WebKit 390 passati: elenco/ID, mappa, settori, dialog e
pagine senza JS. TO DO spuntata soltanto dopo questi riscontri: **31 province
completate, 79 rimanenti su 110**.

- **Fonti:** programmi e moduli originali comunali/Pro Loco/Consorzi, SUAP,
  turismo regionale e locale, calendari e API pubbliche. 196 risultati Bassa
  Romagna selezionati per pertinenza, non presentati come censimento integrale.
  522 tentativi/download archiviati, non tutti prove positive o documenti letti
  integralmente. Registro regionale: **221 tentativi**, compresi 180 URL
  esplorativi (numeri 1–10 nei 18 comuni): 23 originali HTTP 200 letti, 73 HTTP
  500 e 84 errori di connessione in quel lotto. Ulteriori tentativi e originali
  tramite indice web registrati; gli errori non provano assenza di fiere.
- **Cervia:** nove mercatini tematici estivi con calendari nominativi;
  Borgomarina termina il 17 settembre nella scheda turistica, 24 settembre
  del modulo resta in conflitto e non è confermato. Notte Rosa mercatino
  **20–21 giugno** dal modulo, non 19–20 del testo incoerente. Sapore di Sale
  banchi **4–6 settembre**, festa dal 3 distinta. Mercato Europeo **11–13**,
  non allungato alle mostre dall’8. Mercati straordinari dal Comune, non
  gli orari di ingresso/uscita operatori scambiati per vendita.
- **Quote Cervia:** Borgomarina stagione 732/976 € IVA inclusa (3/6 metri);
  Lume 305/610 € secondo area, intera stagione; Uovo 183 € tre giorni,
  Cozza 195,20/268,40 €, Notte Rosa 195,20/244 €, Sapore di Sale 244/366 €,
  Tattoo 122/183 € per evento e dimensione, IVA inclusa. Caplèt 200 € senza
  chiarimento IVA. Domanda estiva 31 marzo trascorsa; saldo 1 maggio dopo
  ammissione non è scadenza candidatura. Categorie/documenti dal regolamento.
- **Ravenna:** Pulce d’Acqua **11 aprile**, non 12 della fonte turistica;
  cancellato 10 maggio, inserito 7 giugno dal calendario organizzatore aggiornato
  13 maggio. Intervallo opzioni 0–385 € non assunto come quota universale.
  Fatto ad Arte: produzione propria non seriale, PEC e **32 € di bolli**, solo
  costo parziale; 60 giorni è durata procedimento. Natale 2025/26 storico,
  non conferma dicembre 2026. Antiquariato maggio in conflitto: mese testuale.
  Sant’Alberto: esistenza commerciale dal registro, avvio 25 contro festa
  comunale 26–27; soltanto etichetta, nessun giorno preciso inventato.
- **Bagnacavallo:** opuscolo originale San Michele: fiera 25/26/27/29 settembre,
  non 28 dedotto dal titolo; mercatini creativi, libri, vintage, Garage Sale
  e Caritas distinti per area/categoria. Raboj: 10 €/giorno commercianti/OPI,
  20 € collezionisti/hobbisti/privati, volontariato gratuito; recuperi 3/17
  maggio contraddittori esclusi. Quote non estese a Erbe Palustri, banchi
  solo 12–13 settembre. Tartufesta distingue festa e sabato/domenica mercato.
- **Brisighella:** calendario Pro Loco **Tartufo 22 novembre**, supera 21 regionale;
  Natale 13 e 20 dicembre. Agricoli ex soci COPAF per le categorie riservate,
  non libera ammissione di ogni produttore. **Riolo:** Scalogno banchi nei sei
  giorni 17–19/24–26 luglio dal Consorzio; degustazione 5 € non quota banco.
  Uva solo periodo testuale, festa 25–27 distinta dall’avvio fiera regionale 26.
  Festa Maggio 10–11 maggio da originale; Libro escluso: riprese giornalistiche
  trovate, programma primario non recuperato dopo Pro Loco, Comune, IF ed Ecomuseo.
- **Faenza:** Nott de Bisò, San Lazzaro e banchi professionali del Carnevale
  recuperati dal registro: Carnevale dei Ragazzi non confuso col mercatino
  riservato ai bambini. Argillà selettivo, registrazione 3/4 settembre non
  scadenza domanda. ëMarkè quattro martedì luglio da API, MEI modulo chiuso,
  dicembre 12–13 da riquadri originali comunali: dettaglio/API 403 e sito
  organizzatore in timeout, nessuna condizione dedotta. 100 Ceramiche 23–24
  maggio significa dieci stand, non cento posti liberi. Primavera gratuita e
  baratto a gettoni esclusi come opportunità commerciali.
- **Casola:** due regolamenti originali Primavera: 25 aprile e 1 maggio,
  domanda 18 aprile scaduta; quote 10–30 € per categoria/spazio/giorni/tavolo,
  importi OPI e commercianti distinti, refusi 3 maggio non nuove date.
  Fiera comunale 23 stalli solo 25 aprile distinta dal mercatino artistico
  Pro Loco in altre vie: quote non trasferite. Tartufo 8 marzo, recupero 15
  solo eventuale. Vintage 19 settembre 2026 confermato anche nei dati
  strutturati turistici; poster Pro Loco 2025 non proiettato. Sórbole 17–18
  ottobre compreso nei Frutti Dimenticati, non duplicato come altra festa.
- **Altri comuni:** Lavezzola fiera 15–17 maggio; Cotignola Segavecchia
  ambulanti 12/15 marzo distinta da Caritas 12–15. Alfonsine programma recente
  28–31 maggio prevale su 21–24 regionale, resta periodo senza singoli banchi.
  Lugo, Fusignano, Massa, Sant’Agata e Solarolo: separati giorni di vendita,
  periodi senza dettaglio e ricorrenze ancora 2025. Brazadèl Castel Bolognese
  annuale con mercato documentato ma senza giorno 2026 confermato. Bagnara:
  Popoli e Castello esclusi dopo programmi originali anche scansionati,
  privi di prova sufficiente di mercatino per esterni; non dichiarata assenza.

Controlli dedicati `scripts/test-fiere-ravenna.cjs` tramite `PLAYWRIGHT_MODULE`:
131 risultati e ID originali, integrità delle altre province, date/quote,
mappa, settori, dialog e pagine autonome senza JS in Chromium 1440/390 e
WebKit 390. Build, settori e 4.214 pagine autonome validati; suite generale
sui cinque formati/browser passata (320 ripetuto dopo timeout, senza modifiche
al prodotto). Cache pagina **JS67**, catalogo **JSON47**. Originali e risultati
dei test conservati nell’archivio esterno; nessun file estraneo incluso.

## Rimini — ricerca documentale del 17 ottobre 2026

**115 manifestazioni in 25 comuni**, prima 13: **+102 nette**. Controllati i
**27 comuni attuali**, inclusi Montecopiolo e Sassofeltrio. Correzione territoriale
solo nel build del calendario: anagrafica condivisa e coordinate preservate.
Dati, comuni, fonti/impronte, tentativi, esclusioni e limiti in `fiere-rimini.json`;
originali in `Documents/ricerca-fiere-rimini-20261017`.

La ricerca documentale attuale è chiusa con limiti espliciti. Le future verifiche
periodiche sono distinte: non serve attendere nuovi bandi o garantire un
censimento esaustivo. Nessun messaggio, email o domanda inviato a terzi.

- **Rimini:** calendari PDF 2026 e 2027 letti integralmente e controllati
  visivamente. Pasqua sospesa in entrambi. Separate alberi di Natale (2 posti,
  ID originale conservato), generi vari (27) e casette Tre Martiri (27, nessuna
  domanda possibile). Generi vari 2026 solo **20/21/22/24 dicembre**, esclusi
  mercoledì e sabato; domanda **20 ottobre 2026**. Fogheraccia 2027: domanda
  19 settembre 2026–17 gennaio 2027; Primavera: 22 settembre–20 gennaio 2027.
  **20 euro istruttoria + 16 bollo**, esclusi canone e altri oneri. Per autunno
  e domeniche di dicembre solo eventuale lista di attesa, non disponibilità.
- **Sant’Agata:** Tartufo **4/11/18/25 ottobre e 1 novembre**; Natale
  **6/7/8/13/20 dicembre**. Obbligatorie tutte le cinque giornate. Domande alla
  Pro Loco, termini 30 giugno/1 settembre trascorsi. PDF di moduli e regolamenti
  originali: quote per categoria, mq, strutture e IVA, senza bollo comunale.
- **MotoGP Misano:** 35 posti esterni (14 alimentari, 21 non alimentari), gare
  11–13 settembre e occupazione dalle 15 del 10 distinte. **61/55 euro per metro
  lineare**, più canone e utenze. Termine principale 31 luglio 2026; refuso
  2025 nella ripetizione al punto 6 segnalato. Cattolica ingegno: 14 posti e
  massimo 28 turnanti; domanda 2 marzo–1 aprile, **30 euro SUAP** più canone.
  Ventena con refuso 2025 e avvio eventualmente successivo: date testuali.
- **Santarcangelo:** San Martino mercato generale 7–11 novembre, anteprima 6
  solo ristoro/settori tematici; San Michele 26–27 settembre. Casteldelci corretto
  al **1 novembre**, superato il 15 regionale. Coriano **21–22 novembre**:
  termini e modulo 2024 non estesi al 2026. Pugliano: cinque lunedì, termine
  15 luglio trascorso e SCIA alimentare dopo accettazione. San Marco testuale
  per avviso 2026 con domanda al 2025. Sassofeltrio banchi **3–4 ottobre** dalle
  14, non venerdì 2. Maiolo mercatino solo 21 giugno. Mangiarsano 4 ottobre
  distinto dalle tre domeniche successive della Castagna.
- **Riccione Christmas Village:** **28 novembre 2026–10 gennaio 2027**, selezioni
  annunciate aperte da Promo D, senza termine o tariffa casetta pubblici.
  Notte delle Streghe: domanda **13 giugno 2026**, bollo 16 euro, commercianti
  e area handmade distinti. Giardini d’Autore primavera a Rimini; autunno
  **19–20 settembre a Castello Benelli, Bellaria**, superato il vecchio luogo.
- Ricorrenze estive per località con giornate separate. Misano solo settembre
  documentato; via Perugia e venerdì Cavour restano testuali. San Gregorio e
  feste senza giorni dei singoli banchi marcati `periodOnly`. Saloni IEG con
  contratto stand, non spunta; date 2027 solo se pubblicate. Cattolica Retrò
  deriva dall’avviso organizzativo, non da bando per singoli espositori.

**Esclusioni:** Gemmano gastronomia senza prova di area venditori esterni;
Montegridolfo concorso olio, non mostra mercato (28 novembre termine campioni,
13 dicembre premi). Bambini e riuso di oggetti propri esclusi dalle opportunità
professionali. Locandina Saludecio vista: professionisti non documentati, non
dichiarati vietati. Natale Santarcangelo con URL 2026 è 2025–2026. Al Mèni e
Matrioška con programmi storici; Smanèt settembre originale 404, censita solo
primavera da comunicato attuale. Mercati ordinari, soli spettacoli, gare e pasti
esclusi; gratuità visitatori, concorsi e appalti gestori non sono costi banco.

**Limiti reali:** registro regionale annuale storico non ottenuto integralmente.
375 richieste numerate nei 25 comuni dell’anagrafica, retry HTTP/HTTPS, Chromium
e fallback TLS falliti; risultati originali disponibili via web e snapshot
precedenti confrontati con Comuni, SUAP, organizzatori e portali territoriali.
Nessun errore trattato come assenza. 403/404, dettagli dietro login e refusi
registrati; nessun accesso privato. Tre pagine Rimini Turismo scaricate dopo
SSLError con controllo certificato disattivato, confrontate separatamente con
il dominio ufficiale. Alcune ricorrenze incomplete restano testuali o parziali,
senza inventare giornate; nuove pubblicazioni appartengono alla revisione futura.

Catalogo nazionale **4.102** eventi, **3.987 schede esterne a Rimini identiche**
al commit iniziale `1c6e0cb`. Test `scripts/test-fiere-rimini.cjs` mediante
PLAYWRIGHT_MODULE: preservazione, giorni commerciali, tariffe, mappa, settori,
dettagli e pagine senza JavaScript; Chromium 1440/390 e WebKit 390.
Cache JS64/catalogo46. **Pubblicazione verificata online il 17 ottobre 2026**,
commit `3af5098`: catalogo identico al Git pubblicato (SHA-256
`1c08d60906ebb09bfb1a6077e3289178d5b1fd064e374def2df2af466e5c6ab8`, fine riga LF).
115 schede verificate live su Chromium 1440/390 e WebKit 390, inclusi
mappa, settori, dettagli e pagine senza JavaScript. Passati anche i test
generali calendario, pagine e settori. TO DO spuntata dopo la verifica:
**30 province concluse, 80 rimanenti**; aggiornamenti periodici distinti.


## Selezione assistita, priorità alle nuove — 16 ottobre 2026

Pubblicate 121 valutazioni aggiuntive: 21 Nuova, 96 Storica e 4 Molto conosciuta.
Totale 521 su 3.972: 24 Nuova, 476 Storica, 21 Molto conosciuta; 3.451 ancora
senza valutazione. Non è una classificazione nazionale conclusa.

Screening delle 1.790 fonti principali individuali o poco condivise delle schede
non valutate: 1.711 risposte estratte e 79 errori; una risposta riuscita non
certifica completezza o pertinenza. Esaminati anche registri condivisi Liguria,
Veneto, Piemonte, Bolzano, Lazio e Lombardia; Marche con errore certificato e
Trento con HTTP 403 restano limiti del recupero in blocco. I singoli riscontri
effettivamente usati sono verificati e accompagnati da impronta della fonte.

Metodo riutilizzabile: scaricare ogni fonte una sola volta, estrarre candidati,
controllare manualmente nome/Comune/contesto/edizione e pubblicare solo le prove
approvate per ID. La coda dei candidati non assegna bollini. Script, snapshot
integrali e log in `Documents/ricerca-bollini-nuove-20261016`; decisioni, fonti,
impronte, esclusioni, errori e candidati residui in `fiere-rinomatezza-audit.json`.

Nuova richiede prova narrativa del debutto o delle prime tre edizioni, con
revisione il 1° gennaio 2027. Non basta il contatore 1/2/3 del registro sagre:
«Mi fido di te» dichiara la sesta edizione nel titolo ma uno nel campo; Natale
con Gusto è documentato già nel 2016 nonostante il campo due. MonzaCon esclusa
perché Winter è la seconda ma Summer 2026 porta il totale a quattro; Marzaglia
a Gonzaga non diventa nuova per la nuova sede. Anticamente Sangio è mensile:
la seconda annualità non documenta al massimo tre appuntamenti.

La colonna «ANNI STORICITA» della Regione Liguria è conservata in `historyYears`,
con soglia minima dieci nel build, senza inventare edizioni o fondazioni.
Molto conosciuta richiede riscontro esplicito di richiamo ampio; i 500.000 di
Scandicci sono dichiarazione promozionale dell'organizzatore, non consuntivo
certificato. Dati precedenti, date, costi, settori e ID conservati.
Cache JS57/catalogo43; colori morbidi CSS21 e posizione in alto a destra conservati.
Controlli locali passati: build, settori, confronto integrale dei campi precedenti,
test bollini Chromium computer/telefono e WebKit, suite generale a 1440/820/390/320
pixel e WebKit 390. Regressioni per contatori amministrativi errati, numerazioni
stagionali e nuova sede; soglia historyYears verificata con casi validi/invalidi.

## Nomi e colori dei bollini — 16 ottobre 2026

«Di lunga tradizione» diventa «Storica» in tutta l'interfaccia, inclusi filtro
e legenda. Colori correnti richiesti: Molto conosciuta verde, Storica giallo
oliva, Nuova arancione scuro vicino al rosso. Sostituiti blu e viola.
Altezza minima 24 px invece di 36, padding 2×7 px, icone 12 px, margini ridotti;
testo conservato a 11 px. Nuova richiesta: sfondi a colore pieno con testo
e simboli bianchi, senza sfondi pastello;
simboli e diciture distinguono i livelli anche senza colore. Nessuna modifica
a criteri, valutazioni, dati o ID interni (`rinomata`, `consolidata`, `recente`).
Conservata l'assenza di sottolineature e bollini per dati mancanti.
Cache JS55/CSS19.
Sintassi, contrasto dei tre colori e test bollini su Chromium computer/telefono
e WebKit passati; conservazione dei dati verificata.

## Anteprime senza dati mancanti — 16 ottobre 2026

Preferenza utente: costo nelle anteprime soltanto con una tariffa documentata
in `pricing`; nessuna riga «Costo banco da verificare» o «Costi: vedi scheda».
Le note di partecipazione senza tariffa restano consultabili nella scheda.
Nessun bollino «? Da valutare» nelle card, nei popup mappa o nel dettaglio;
il contenitore viene omesso o nascosto, senza righe vuote. I tre livelli
assegnati restano visibili; stato interno, filtro e legenda conservati.
Cache JS54. Nessuna modifica ai dati, alle tariffe o alle valutazioni.
Sintassi e suite generale passate su cinque schermi/browser; test bollini
passato su Chromium computer/telefono e WebKit, inclusi stato senza bollino,
apertura scheda da tastiera, filtri e conservazione del catalogo.

## Valutazioni ampliate e scheda essenziale — 16 ottobre 2026

400 valutazioni su 3.972 eventi (prima 41): 17 Molto conosciuta,
380 Di lunga tradizione, 3 Nuova; 3.572 ancora da valutare.
Prima estensione documentale, non completamento della ricerca nazionale.
136 aggiunte dai numeri di edizione del registro Lombardia scaricato oggi;
214 dal confronto nominativo e per comune con il calendario Piemonte 2014;
nove nuove valutazioni e un livello aggiornato con verifiche specifiche.
Motivi e fonti per ID nell'archivio
`fiere-rinomatezza.json`; corrispondenze, esclusioni e impronte dei download
in `fiere-rinomatezza-audit.json`. Download conservati fuori repository in
`Documents/ricerca-valutazioni-fiere-20261016`.

Confronti storici esaminati prima dell'inserimento: nessuna assegnazione
automatica a partire dalla somiglianza dei nomi. Escluse Sant'Agata/Santa
Caterina di Santhià, None al Cioccolato/variante natalizia e Expocasa/Casalia;
esclusi i numeri uguali all'anno, gli abbonamenti e trasferimenti a eventi
diversi. I calendari attestano una storia documentale, non lo svolgimento
ininterrotto, la fondazione o il richiamo del pubblico. Le fonti attuali delle
schede provinciali conservano le proprie date di ricerca; non tutte sono state
scaricate nuovamente oggi. Il richiamo richiede riscontri separati.

Martinengo: periodico Pro Loco luglio 2016 e presentazione 2025. Seriate:
venti edizioni nel registro 2026 e notiziario comunale giugno 2016; stessa
rassegna ASAV, valutazione sulle dieci schede mensili. Entrambi Di lunga
tradizione. Campionaria, Creattiva, Sant'Alessandro e FAZI: ampio richiamo
documentato dai consuntivi degli organizzatori; Torrone: provenienza nazionale
del pubblico dichiarata dall'organizzatore. Cifre dichiarate, non certificate
da Subingresso. Castione: 23ª edizione riferita al 2025/26, non al Natale 2026.

Scheda: soltanto bollino e dicitura, rimossi titolo, spiegazioni e pannello
delle prove; documentazione conservata nei dati. Tooltip con la sola dicitura.
Cache JS53/catalogo42. Identità e tutti gli altri campi dei 3.972 eventi
conservati. Test dedicato aggiornato alla presentazione essenziale.
Pubblicato `23627c1`, Vercel READY `dpl_8UikWgaKQ5a5SB3zUzAVETkg3R63`;
HTML, JS e catalogo online identici. Build, settori e suite generale su cinque
schermi/browser passati. Test dedicato locale e online su Chromium computer,
telefono e WebKit riuscito: bollini, filtri, mappa, URL, tastiera e overflow.

## Rinomatezza — 16 ottobre 2026

Indicatore editoriale di notorietà e storia, distinto da compatibilità della
merce, qualità organizzativa, posti disponibili, incassi e date confermate.
Tre livelli e uno stato neutro:

- **Rinomata**: riscontri espliciti di richiamo ampio o sovralocale, da fonte
  istituzionale, organizzatore, associazione di categoria o cronaca datata.
  Un titolo «nazionale», una grande città o molti posteggi da soli non bastano.
- **Consolidata**: almeno 10 edizioni o 10 anni di storia documentati, senza
  elementi sufficienti in questa valutazione per attribuire richiamo più ampio.
  Non garantisce continuità ininterrotta né conferma una nuova edizione.
- **Recente**: prima, seconda o terza edizione esplicitamente documentata,
  con riscontro nell'anno corrente o precedente; nessun giudizio negativo.
- **Da valutare**: prove insufficienti, dato non valido o revisione scaduta;
  non equivale a nuova, sconosciuta, poco frequentata o scadente.

Archivio indipendente `fiere-rinomatezza.json`, per ID stabile. **41 valutazioni
iniziali su 3.972 schede: 13 Rinomata, 25 Consolidata, 3 Recente**; le altre
3.931 restano da valutare. Copertura dichiarata nella legenda. Non è una
ricerca completa della rinomatezza delle fiere nazionali. Nessun numero o
livello attribuito per riempire i dati mancanti. Gli audit provinciali
pregressi forniscono numeri di edizione e proprie fonti già documentati;
questa sessione aggiunge il controllo delle fonti di richiamo e debutto.

Ogni valutazione ha motivo, prove, link, anno del riscontro, data editoriale
e termine di revisione. `year` è l'anno dell'edizione quando esplicito;
per le descrizioni permanenti senza anno è l'anno della consultazione, non
una data di fondazione o un'affluenza inventata. Il build verifica livelli,
prove minime, anni, URL, date e corrispondenza ID, rifiuta record non validi;
la revisione scade entro due anni, per Recente entro l'anno successivo al
riscontro. Il browser degrada a Da valutare dopo il termine. La valutazione
editoriale della portata è qualitativa, non un punteggio scientifico.

Esempi e limiti: San Faustino Brescia usa la cronaca di ÈliveBrescia TV del
15 febbraio 2026 (oltre 200.000 presenze riportate), insieme all'organico
comunale di 602 posteggi. Sant'Orso Aosta: pubblico italiano e straniero
secondo CNA, cifra annua dichiarata, non conteggio certificato da noi.
Alba: 90.000 ingressi al Mercato Mondiale nel 2025, non 600.000 ingressi
alla fiera ricavati dai flussi turistici di tutto il territorio. Cuneo e
Stegona: la valutazione dell'evento principale non si propaga ai mercati
straordinari o ad altre ricorrenze nella stessa località. Mozzate: seconda
edizione del 2025, non 2026 nonostante l'aggiornamento della pagina comunale.
Primaluna: debutto della Fiera della Luna distinto dalla festa patronale.
Maggiora esclusa dalla valutazione Recente: brochure della prima edizione
storica non prova il numero d'edizione corrente. Brentonico esclusa: il
testo «non aggiunti come seconda edizione» riguarda un rinvio, non l'anzianità.

UI: bollino apribile nelle card, livello nei popup mappa, motivo e fonti
nel dettaglio; filtro combinabile con mesi/zona/settore/tipo/nome, URL
`rinomatezza=rinomata|consolidata|recente|unknown`, azzeramento completo.
Cache JS50/catalogo41/CSS14. Le 3.972 identità e tutti i campi preesistenti
restano invariati; le valutazioni sono aggiunte dopo gli audit provinciali.
Test dedicato `scripts/test-fiere-reputation.cjs`: prove/negativi/scadenza,
conservazione catalogo e flussi browser. Build e settori passati; suite
generale superata nei cinque formati/browser, con nuova verifica a 320 px
dopo aver compattato i filtri sui telefoni più stretti. Test dedicato
Chromium computer/telefono e WebKit passato localmente e in produzione.
Pubblicato con commit **93fbcc1**, Vercel READY
`dpl_GrgvRv34HYtETDxRRTAz1rMczAep`; HTML, JS, CSS e catalogo online
identici al commit, con terminazioni di riga normalizzate. Verificati online
i quattro stati, fonti del dettaglio, combinazione provincia/rinomatezza,
mappa, URL e ricaricamento, tastiera, reset e assenza di overflow.
Test con autenticazione e tracking esclusi per evitare dati artificiali.

## Roma — ricerca documentale corrente completata, pubblicata e verificata (16 ottobre 2026)

Ripresa dall’audit già pubblicato di 116 schede: **127 manifestazioni in 48
comuni**, undici aggiunte; **4.000** schede nazionali. Tutte le 3.989 precedenti
schede identiche, incluse le 3.873 delle altre province. Ricognizione iniziale
nei 121 comuni conservata. Cache JS61/catalogo45. Backup remoto
`backup/session-20261016-230947-roma-chiusura-documentale` creato prima delle
modifiche; il noto errore di cleanup tag non compromette il checkpoint.

Ricerca corrente chiusa nelle fonti accessibili con limiti espliciti in
`fiere-roma.json`, `research.closure20261016`. Pubblicazione e verifica finale
concluse prima della spunta: **29 province completate, 81 rimaste**. Le sezioni
parziali successive sono lo storico e non descrivono l’esito di questa ripresa.
Evidenze fuori repository: `Documents/ricerca-fiere-roma-20261016/chiusura`.

- **Vicovaro**: archivio determine con `ricerca=1`, determina 52/2026, avviso
  PDF, modulo DOCX e ordinanza 27/2026 originali recuperati. Fiera **1–2 agosto**,
  domanda **28 luglio ore 11**, spunta **1 agosto dalle 14:30**. Vendita 1 agosto
  17–2 agosto 13. Canone a superficie e **+30%** per tardive/spunta; testo orario
  contro formula giornaliera: totale non calcolato. Ordinanza con refuso 2025
  sulla presenza; giorni 2026 concordanti nel titolo e nell’avviso. Avviso letto
  integralmente e visivamente; il vecchio indice delle news non è la fonte.
- **Befana**: bando commerciale originale QH20250056076, artt. 1.1 e 6,
  prevede **1 dicembre–6 gennaio** fino al 2027/28. Inserito periodo 2026/27,
  subordinato a titolo annuale. Sei banchi della selezione 2025 non sono posti
  disponibili. Graduatorie finali QH/464/2025; il termine 9 novembre culturale
  non diventa domanda commerciale. Nessuna nuova selezione aperta dichiarata.
- **Municipi III/V**: letti avvisi, verbali e graduatorie. Tre aree con proposte
  nel III: Euganei, Adriatico, Jovine; esclusi nove siti senza proposte. Finestra
  8 dicembre–8 gennaio, anche non continuativa; riconferma gestore 1 ottobre
  2026 non è termine per i banchi. V: sola Viale Agosta, 1 dicembre–7 gennaio;
  esclusa Gardenie senza proposte. Quattro schede `periodOnly`, senza promessa
  di aperture quotidiane. San Felice 16–17 maggio e Tor Sapienza 30–31 maggio
  da provvedimenti commerciali finali 2026: soltanto operatori già aventi titolo,
  nessuna libera spunta dedotta. Orari vendita distinti da montaggio/smontaggio.
- **Altri Municipi**: copertura nominativa dei 15 in audit. I già presente;
  II/IV/VI/VII/XI/XIII/XV: mercati ordinari e circo esclusi. VIII: integrazione
  CM/2120/2025 permette proposte su aree valutate ex post. IX: letto avviso e
  rettifica CN/1054/2026; XII: otto sedi domenicali da avviso 2026; X: pagina
  CO/2329/2024 priva di allegati/esito. Non trasformati in calendari operativi.
  XIV: recuperata pagina graduatoria CT/1897/2024 con avviso e calendario E;
  PDF calendario scansionato di tre pagine senza testo, esito PDF cache miss.
  Tentati web, screenshot, Chromium e download HTTP/HTTPS www/non-www: celle
  non leggibili, nessuna trascrizione di date o gestori. Blocchi WAF/TLS locali
  documentati; letture disponibili tramite strumento web conservate come
  estratti, senza dichiararle copie originali scaricate. Questi limiti non
  dimostrano assenza di eventi e non richiedono di attendere nuovi bandi.
- **Lariano**: locandina comunale originale del rinvio letta visivamente:
  inaugurazione 11 settembre 18:30, non 10. Recuperate delibere 85/129, sei
  determine e sei ordinanze Halley, inclusa proroga all’ultimo giorno 14.
  Delibera 129 e convenzione allegata provano circa **23 gazebo**, artigiani
  ed espositori terzi selezionati Pro Loco: inclusa area fiera **11–14 settembre**,
  finestra `periodOnly`, non orario dei singoli banchi. Il 16 è smontaggio.
  Esenzione suolo solo per attività locali, quote Pro Loco non pubblicate:
  nessuno stand gratuito dedotto. Schema approvato distinto dalla firma. Distinta la manifestazione
  dell’associazione **a Velletri, Colle Rosso, 3–20 settembre**, confermata dal
  Comune/ordinanza 337/2026, letta anche in Chromium. Canale spazi espositivi
  dell’organizzatore nell’indice primario; homepage www/non-www e programma
  diretti HTTP503. Indirizzo vecchio in footer non usato come sede corrente,
  menu e dati promozionali non diventano quote espositore o disponibilità.
- **Cave**: pagina/locandina ufficiale del 13 ottobre 2026 lette e immagine
  originale scaricata: **23–25 ottobre** supera calendario generico 22–25.
  Orari documentati di stand e cantine, ma mercatini artigiani ancora nella
  notizia 2025. Settore esterno escluso, nessuna estensione dei 40 espositori
  storici al 2026. Letti PDF originali determine 833/834 e delibera 47/2026
  da consultazione atti Urbi: affidamento/contributi, non bando espositori.
  Finestra progetto 17–31 ottobre non è calendario commerciale. Ricerca 2026
  castagna: tre risultati, mercat: quattro estranei, artigian: nessuno.
  Albo e SUAP associato XI Comunità Montana verificati, nessuna istanza inviata.
  Le due schede commerciali già verificate restano identiche.
- **TolfArte**: ricerca interna porta alla pagina originale `/artigiani/`,
  Artigianato 2026, **37 espositori** con prodotti e lavorazioni. Inclusa
  scheda separata dal TTS Food, con solo agosto e nota sui giorni dei banchi
  non pubblicati separatamente; non attribuiti 7–9 agosto o settembre a tutti
  gli artigiani. Homepage/programma e VisitLazio confrontati. Art Bonus,
  aggiornato nel 2026 ma riferito alla raccolta 2025, non prova il calendario.
- **Residui**: Borghetto Flaminio nella fonte turistica comunale è amatoriale,
  orari rinviati ai contatti: non pubblicata opportunità professionale né
  prezzo da aggregatore. Archivio Montelanico letto: moduli ancora 2025,
  nessuna quota/domanda 2026 dedotta. Altre esclusioni motivate del precedente
  audit conservate: non costituiscono un elenco di eventi confermati mancanti.

**Manutenzione futura distinta dalla ricerca attuale:** nuove concessioni,
calendari nominativi, conferme e quote dei singoli espositori; giorni commerciali
Cave/Lariano/TolfArte e documenti XIV leggibili. Copertura non esaustiva, nessuna
garanzia di posti o di accesso professionale. Nessun invio o contatto a terzi.
72 schede con recapiti, 12 con termine e nove con sintesi costo.

Pubblicato commit dati `4ef29d1`, Vercel riuscito; i tre file pubblici confrontati
con impronte SHA-256 coincidono con il commit, deploy verificato in 47 secondi.
127 risultati/mappa e **40 dettagli** provati online su Chromium computer/telefono
e WebKit telefono. Undici nuove pagine autonome HTTP 200, canonical e fonte;
Vicovaro, Lariano e artigiani TolfArte leggibili senza JavaScript e senza overflow
nei tre browser/formati. Build, due test settori, test Roma locale/online, suite
pagine (4.000 schede, 1.298 in sitemap), suite generale su cinque formati passati.
Spunta e riepilogo aggiornati soltanto dopo verifica online. Conservate modifiche
preesistenti estranee e note concorrenti del documento unificato; nessun invio a terzi.

## Roma — ripresa documentale del 16 ottobre 2026, provincia ancora parziale

Aggiunte 17 tappe TTS Food 2026 da archivio e pagine dell’organizzatore lette
in Chromium: **116 schede in 46 comuni**, 68 con recapiti; 11 termini e sette
sintesi di costo invariati. Catalogo nazionale **3.989**, altre 3.873 schede
identiche al commit `4a83bc2`; tutte le precedenti 99 schede Roma conservate.
Cache JS60/catalogo44. Nessuna previsione 2027 né gratuità dei posteggi dedotta.

TolfArte: **solo food court 8–9 agosto, 17–24** nel programma operativo;
archivio/riepilogo riportano 7–9, conflitto segnalato. Nessuna estensione al
settore artigianale o alla ripresa teatrale di settembre. Casal Monastero
10–12 aprile esclusa perché l’archivio la dichiara annullata, anche se la pagina
conserva il vecchio programma. Cucine itineranti selezionate, nessuna libera
ammissione dei banchi generalisti; quote e termini non pubblicati nelle fonti.

Fonti e decisioni in `fiere-roma.json`, `research.followUp20261016`; 18 pagine
operative della sola provincia archiviate fuori repo (una annullata).
Befana: termine 9 novembre ore 10 dell’avviso culturale non trasferito ai banchi.
Vicovaro riletto su due domini in Chromium: link ancora 2023/2022 contro indice
2026, atto corrente non recuperato. Cave mantiene conflitto 22–25/23–25 ottobre;
Lariano ha cronaca successiva 11–14 settembre per maltempo contro programma
10–13, distinta dalla festa trasferita a Velletri: fonti operative primarie
ancora insufficienti. Calendari finali dei 15 Municipi non ricostruiti.
**Roma resta da completare; riepilogo invariato 28 completate e 82 rimaste.**
Nessun contatto o invio a terzi. Pubblicato commit dati `fbc506b`; deploy Vercel
riuscito sul successivo commit documentale concorrente `bb9ab1e`, che contiene
i dati. Catalogo, JS e pagina live identici al commit dati, prima corrispondenza
20:49 UTC entro dieci minuti dal push. Build, settori, sintassi e conservazione
di tutte le 3.972 schede precedenti verificati; suite generale passata su cinque
formati/browser. Test Roma locale e online: 116 risultati, mappa e 29 dettagli
su Chromium 1440/390 e WebKit 390, sempre con `PLAYWRIGHT_MODULE`.
Tutte le 17 nuove pagine autonome HTTP 200 con nome, fonte, canonical e condizioni;
Tolfa, Anguillara e Guidonia leggibili senza JS e senza overflow nei tre formati.
Audit e TO DO aggiornati dopo i controlli online; provincia non completata.

## Roma — ricerca parziale, 16 ottobre 2026

**Provincia non completata e da non spuntare.** Ricerca nominale nei 121 comuni,
confronto integrale delle 31 righe del registro fieristico Lazio del 9 ottobre
2026: quattro fuori provincia ignorate, due rassegne ripetute raggruppate.
Integrate **99 manifestazioni in 43 comuni**, prima tre; 51 con recapiti,
11 con termine documentato, sette con sintesi dei costi. Il termine di Blue
Planet è della selezione camerale, non della generalità degli espositori.
Le tre identità iniziali e tutte le altre **3.873 schede** sono conservate.
Totale nazionale **3.972**; cache JS **49**, catalogo **40**.

Audit in `fiere-roma.json`: copertura per comune, ricevute HTTP/hash distinte
dalla verifica del contenuto, decisioni sul registro, esclusioni e limiti.
Archivio esterno: `Documents/ricerca-fiere-roma-20261016`; 235 download, inclusi
riscontri di contesto non usati nel catalogo. Nessun testo integrale delle
fonti o documento di terzi aggiunto al repository. Le ricerche nominali non
equivalgono all'accesso completo agli archivi comunali né provano l'assenza
di altre fiere. Fonte regionale dei saloni distinta dalle fiere di strada.

Informazioni operative verificate:

- **Castel San Pietro Romano Natale**: 13/20/27 dicembre, domanda **15 novembre**
  via modulo/email alla Pro Loco; artigianato **50 €/giorno**, gastronomia
  **70 €/giorno**, casetta montata ed energia fornite; IVA non specificata.
- **Segni**: fiera ambulante **24–25 ottobre**, sagra generale 22–25; domanda
  **9 ottobre ore 24**, già scaduta. Non alimentari **35 €**, alimentari
  artigianali **66 €**, stand gastronomici **300 €**, area food **165 €**,
  più suolo quando dovuto; altre tipologie distinte. Disciplinare con refuso
  2025 nell'art. 5, resto del documento e pagina 2026.
- **Bajocco Albano**: 11–13 settembre, quota **130 € + IVA** per tre giornate;
  il **1 settembre è saldo bonifico**, non domanda. Foto e selezione manufatti,
  gazebo/tavolo massimo 3 m, illuminazione propria e smontaggio ogni sera.
- **Grottaferrata**: 21–29 marzo; interno A 9 m² **1.134 € nuovi / 1.026 €**
  clienti 2025, più iscrizione **200 €**, IVA esclusa. Totali calcolati
  **1.334/1.226 € + IVA**; altre superfici/aree e food truck distinti.
  Tavole grafiche del listino lette visivamente; preadesione non vincolante.
- **Montelibretti**: San Nicola 10 maggio, domanda 24 aprile ore 12;
  Carmine 11 ottobre, storici 23 settembre ore 10 e nuovi 29 settembre ore 10.
  Termini scaduti. Spunta **80 € omnicomprensivi** in entrambe; maggio
  prenotati **30 € + 0,60 €/m² + 0,055 €/m² TARI**. Ottobre 30 € riservati
  alla categoria indicata nel bando, non tariffa universale.
- **Tivoli** 19 marzo, domanda 5 febbraio, scelta posteggi 2–6 marzo distinta;
  **Velletri Madonna delle Grazie** 3 maggio, spunta richiesta entro 3 aprile;
  **Pentecoste Valmontone** 24 maggio, richiesta entro 31 marzo.
- **Nettuno**: 2–3 e 9–10 maggio, non tutto il periodo; **Castel Gandolfo**
  mercatino lungolago 20–25 luglio, escluso il 26 della festa. Anzio raggruppa
  appuntamenti per rassegna/organizzatore, senza creare mercati giornalieri fittizi.
- **Maker Faire**: 23–25 ottobre da CCIAA, supera 17–19 nel registro;
  **Landriana primavera** 28–29 marzo, supera 27–29 regionale. **Blue Planet**
  Darsena di Fiumicino dalla CCIAA, non vecchia sede Fiera Roma.
- **Roma Natale I Municipio**: quattro aree con periodi del bando pluriennale,
  titolo annuale e aperture da confermare; nessuna candidatura dei singoli banchi
  dedotta dall'affidamento ai gestori. VGMT nella nuova sede Forte Trionfale.

**Da completare prima di chiudere la provincia:** calendari commerciali finali
dei Municipi di Roma, programma commerciale Befana distinto dalle iniziative
culturali; atti correnti Vicovaro; due formule/sedi Lariano e programmi commerciali
Tolfa/Cave. Approfondire inoltre le piste di Anguillara, Cerveteri, Montelanico,
Monterotondo, Palombara e gli altri candidati registrati nell'audit. Alcuni siti
restituiscono archivi vecchi, contenuti vuoti o soft 404: Ladispoli bando è 404
anche in Chromium; Trevignano superata la verifica browser e letto integralmente.
Allumiere: riepilogo settembre contro testo ottobre, conflitto visibile in scheda.
Carpineto e Santa Lucia Bracciano restano storici 2025; ricorrenze senza edizione
non proiettate sul 2026. Quote mancanti non gratuite, nessun posto garantito.

Build, settori e suite generale passati sui cinque formati/browser previsti.
Test dedicato `scripts/test-fiere-roma.cjs` passato localmente e in produzione
con `PLAYWRIGHT_MODULE`: computer/telefono Chromium e telefono WebKit, 99 risultati,
mappa e dodici dettagli operativi. Commit dati **1429fa3**, Vercel riuscito;
catalogo, JS e pagina online identici ai file del commit (confronto su `git show`,
non sulle terminazioni CRLF del checkout Windows). Verifica conclusa entro dieci
minuti dal push. Registro e immagini dei test nell'archivio esterno.
TO DO registrata dopo la verifica nel documento unificato
`Subingresso.it informazioni.md`: Roma non spuntata, **28 completate e 82 rimaste**.
L'unificazione concorrente `c69b400` è stata preservata; il vecchio file TO DO
resta il rinvio al documento unico. Nessun cambiamento estraneo incluso nei commit.
Nessun messaggio, email, modulo, candidatura o pagamento inviato a terzi.

## Bolzano/Bozen — ricerca provinciale, 16 ottobre 2026

Ricerca documentale nei **116 comuni** dell'anagrafica: **207 manifestazioni
in 73 comuni**, prima cinque. Dati, query nominali, decisioni sulle righe,
fonti con esiti HTTP/impronte, esclusioni e limiti in `fiere-bolzano.json`;
evidenze locali in `Documents/ricerca-fiere-bolzano-20261016`. Ricerca
documentale, non certificazione di ogni evento esistente o di posti liberi.

Letto integralmente e controllato visivamente il calendario bilingue
[HDS/Unione commercio-FIVA 2026](https://www.suedtirol.com/media/uefdukdb/2025-12-19-hds-marktkalender-2026-calendario-mercati-unione-komprimiert-komprimiert-2.pdf),
22 pagine, situazione dicembre 2025. **338 righe**: 123 annuali, 73 mensili,
142 quindicinali. Incluse le annuali; 31 ricorrenze nominative di Sarentino,
Vipiteno e Chiusa riscontrate nei rispettivi calendari locali, anche se HDS
le classifica nel ciclo mensile. Escluse le altre 184 righe ordinarie e i
mercati settimanali. Stegona 26–28 ottobre consolidato in un solo evento.
Quando la guida pubblica solo località e data, il titolo «Mercato annuale
di … (giorno mese)» è una descrizione redazionale, non un nome ufficiale.
I settori non documentati rimangono da verificare.

Confrontati Comuni, associazioni turistiche territoriali, organizzatori,
calendario fieristico provinciale e siti dei saloni. Conservati tutti i
cinque ID iniziali e le altre **3.559 schede identiche**, comprese ricerche,
prezzi e filtri regionali già pubblicati. Totale nazionale **3.766**.
**196 schede con almeno una giornata pubblicata e 11 con soli periodi**;
69 con recapiti, cinque con termine assoluto, tutti già trascorsi.
Quattro nuove sintesi di prezzo e le due precedenti dei saloni conservate.

Distinzioni operative e conflitti:

- Stegona: commercio **26–28 ottobre**, non la durata del luna park;
  Polizia commerciale/SUAP del Comune, senza posteggi garantiti.
  «Iscrizione non richiesta» nelle pagine turistiche riguarda i visitatori.
- Bolzano: Primavera **3 maggio**, Autunno **11 ottobre**, San Martino
  **15 novembre**, Api **8 dicembre**, Domenica d'Oro **20 dicembre**;
  Festa dei Fiori **30 aprile–1 maggio**, dal calendario comunale.
- Natale Bolzano: inaugurazione **26 novembre ore 17**, sito dedicato
  dal **27 novembre**, fine **6 gennaio**; periodo conservato senza
  garantire apertura ogni giorno. Commercio: termine **28 febbraio 2026**;
  gastronomie private 26 giugno, 11 stand 3 luglio, vini 10 luglio, birre
  13 luglio: procedure distinte e scadute. Natale nei Quartieri, piazza
  Mazzini: **27 novembre–20 dicembre**, weekend/festivi, termine **17 agosto**.
- [Brunico Natale](https://www.bruneck.com/mercatino): **27 novembre–6 gennaio**,
  chiuso il 25 dicembre. PDF preiscrizione **30 aprile 2026**: elenco/foto
  prodotti e descrizione attività a events@bruneck.com, poi commissione;
  non conferma di partecipazione. Il richiamo a candidarsi sulla pagina
  non riapre il termine. Brochure di contorno ancora 2025/26.
- [Merano Natale](https://www.merano-suedtirol.it/it/merano/informazioni-servizi/eventi/mercatini-di-natale-merano.html):
  **26 novembre–6 gennaio**, chiuso il 25 dicembre. Gare 2024/25–2026/27:
  domanda **10 maggio 2024 ore 12**, non aperta; modulo riservato agli
  espositori selezionati. Nuovi bandi annunciati per primavera 2027.
  Commercio 6 m²: acconto 1.500 € più saldo 1.378/2.000/2.500 €, tutti
  **+ IVA**; totale calcolato **2.878/3.500/4.000 € + IVA** secondo settore.
  Spese anticipate 400 € + IVA, cauzione **separata 2.500 €**, consumi
  e gadget extra. Gastronomia: basi d'asta e spese/cauzione distinte nella
  scheda; il **31 ottobre è pagamento**, non termine per nuove domande.
- Bressanone Natale: periodo **27 novembre–6 gennaio**, aperture festive
  da confermare. Bando per 2025/26–2027/28, domanda **16 marzo 2025**:
  30 stand commerciali/artigianali e cinque gastronomici previsti, non liberi.
  Chiosco singolo non alimentare **3.000–3.500 €**, alimentare **3.500–4.000 €**,
  Logo Alto Adige **4.500–5.000 €**, **+ IVA 22%**; doppio raddoppia.
  Gastronomia doppio/triplo **24.000–42.000 € + IVA 22%**, secondo posizione;
  consumi oltre soglie e detrazioni casetta propria esplicitati. Controllate
  visivamente pagine del bando con termine e tavole prezzi, e tariffario Merano.
- Chiusa Natale: **27–29 novembre, 4–8, 11–13 e 18–23 dicembre**.
  Renon: **20 giornate** dalla pagina orari corrente, inclusi **7, 23 e
  26 dicembre**, assenti nella descrizione abbreviata. Avvento contadino
  **8 dicembre** separato. Sarentino: **10 giornate 28 novembre–20 dicembre**,
  download/browser correnti prevalgono sull'indice web rimasto al 2025.
- Ortisei: **28–29 novembre e dal 5 dicembre al 6 gennaio**; chiuso
  30 novembre–4 dicembre; **25 dicembre solo gastronomia**, escluso dal
  calendario dei banchi. Orari speciali e scheda POI prevalgono sulla tabella
  automatica e sulle vecchie brochure. Corvara include invece esplicitamente
  il 25 dicembre; mercatino **4–8, 11–13 dicembre e 18 dicembre–6 gennaio**.
- Rasun Natale: **5–6, 12–13, 19–20 e 26–27 dicembre**; il 31 dicembre
  è festa serale separata. Lagundo: giornate esplicite, non tutto il periodo.
  Lana, Castelrotto e Tirolo mantengono periodi senza aperture quotidiane
  presunte; Fiè conserva **solo storico 2025/26**. Castelrotto: dettaglio
  2026 ma panoramica 2025 e frammenti 2024, limiti indicati nella scheda.
- Good Life **13–15 novembre**, percorso corretto `/goodlife`, non `/good-life`:
  stand S **118 €/m² + 200 € + IVA**, altri pacchetti/dimensioni e extra in
  scheda; gratuità startup condizionata, non generale. Hotel **19–22 ottobre**;
  Interpoma **25–27 novembre**; Klimahouse **27–30 gennaio 2027** e storico
  **28–31 gennaio 2026**. Tempo Libero 2026 **16–19 aprile** dall'organizzatore,
  superato il vecchio decreto con 30 aprile–3 maggio; 2027 **15–18 aprile**.
  Prowinter **10–12 gennaio 2027**, B2B; call startup 25 ottobre distinta
  dalle domande generali. Saloni su contratto, non posteggi a spunta.
- Scena **20 agosto 2027** e Flower Festival **22–25 aprile 2027** sono
  annunci espliciti correnti, non proiezioni. Link al bando Flower con errore
  DNS: nessuna quota/scadenza inventata. WineFestival **6–10 novembre** è
  periodo con settori in giorni diversi; Sapori del Maso Lana **18 aprile**,
  Festival Formaggio Campo Tures **13–15 marzo**, Niglmarkt **7 novembre**.
  Campo Tures: stand 2 m² **450 € diretti / 600 € altri + IVA**; vetrina
  frigo opzionale 350 € + IVA. Dotazioni in scheda; agevolazione di pagamento
  31 dicembre 2025 distinta dalla candidatura, nessun rinnovo presunto.

Esclusi riuso privato, beneficenza, mercati per soli hobbisti e sagre con
solo ristoro senza commercio esterno documentato. Happymarkt richiede tessera
hobbista: nessuna ammissione professionale generalista dedotta. Carezza e
Tires senza programma commerciale corrente sufficientemente verificato;
altre piste e limiti dei mercati minori registrati, non spostati ad altre
province. Le query nominali non certificano assenza di eventi; non tutti
gli albi sono stati letti integralmente. Errori HTTP e pagine dinamiche che
rimuovono date trascorse conservati nel manifesto. Quote assenti non sono
gratuità. Nessuna comunicazione, domanda o candidatura a terzi inviata.

Cache `fiere.js` **47**, catalogo **38**. Verifiche dati/browser in
`scripts/test-fiere-bolzano.cjs`, tramite `PLAYWRIGHT_MODULE`.
Commit dati `e4f98e2`: **Vercel riuscito**, HTTP 200, catalogo, script e
pagina pubblica identici ai file Git del commit. Catalogo SHA-256
`ef541466f9573def4eb154cafa28f365d01af608de0bc541679988682c68f331`.
Verificati online 207 risultati, identità elenco/mappa e **14 dettagli**
su Chromium computer/telefono e WebKit telefono, inclusi prezzi e fonti.
Build riproducibile, test settori, test provinciale e suite generale su
cinque schermi/browser superati. Esito in `research.publication` nell'audit
e `verification-live.json` nell'archivio locale. La TO DO è stata spuntata
**solo dopo** questi riscontri: **27 province completate, 83 rimanenti**.
Backup remoto `backup/session-20261016-090314-fiere-bolzano` e branch
`backup/pre-fiere-bolzano-20261016`. Cambiamenti preesistenti a CLI, PDF
dashboard e cache Python preservati e non committati. Nessun'altra provincia,
database, email o attività della lista modificata.

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

## Integrazione costi Pisogne — 16 ottobre 2026

La ricerca puntuale richiesta dall'utente ha recuperato il listino della
Mostra Mercato **12–16 agosto 2026**, prima sfuggito alla ricognizione delle
fonti. Il sito dell'organizzatore è pubblicato con Canva: i collegamenti
non compaiono come normali ancore nell'HTML iniziale. Il modulo Google,
raggiungibile dalla pagina comunale, e il sito renderizzato collegano lo
stesso [regolamento pubblico](https://drive.google.com/file/d/1DpcmBoSrxO096Ldn9WmP9lSbYhj4w2hJ/view).
Il modulo chiama il link XXVII, ma il PDF scaricato `Regolamento MM26.pdf`
riporta **XXVIII edizione e date 2026**: verificato il contenuto, non soltanto
l'etichetta. Quattro pagine lette, articolo 5 controllato anche visivamente.

Artigiani/hobbisti: esterno base 250 €, ricevuta +10% = 275 € oppure fattura
+IVA22% = 305 €; interno base 350 €, rispettivamente 385/427 €. Alimentari
senza somministrazione: esterno base 300 € +IVA22% = 366 € con fattura.
Forma fiscale secondo le condizioni dell'organizzatore, senza garantire
che qualsiasi operatore possa adottare indifferentemente ricevuta/fattura.
Quote per tutte le cinque serate, postazione esterna 3×3 m e corrente 1 kW
comprese; gazebo bianco e allestimento propri. Somministrazione esclusa dal
listino generale. Acconto 50% compreso nel totale, non ulteriore costo.

Aggiornato soltanto l'overlay costi della scheda; gli altri eventi e i campi
estranei ai costi sono conservati. 127 sintesi e 147 note sui costi.
Archivio `Documents/ricerca-costi-pisogne-20261016`, PDF/hash/testo e schermata.
Nessun modulo inviato e nessun organizzatore contattato. Cache JS44/catalogo36;
data catalogo 16 ottobre. La ricognizione generale rimane quella del 15.

## Costi per partecipare con il banco — 15 ottobre 2026

Ricognizione delle fonti e dei link di partecipazione delle **3.447 schede**:
1.870 URL iniziali distinti dopo rimozione dei frammenti, 453 recuperi di
collegamenti e approfondimenti, 2.182 estrazioni testuali riuscite su 2.323
richieste. **Questi conteggi non sono documenti tutti letti integralmente né
altrettante fonti pertinenti**: 259 fonti con possibili importi sono state
individuate automaticamente, poi vagliate per escludere biglietti visitatori,
ristorazione, visite, sanzioni, tariffe degli organizzatori e vecchie edizioni.
47 ricerche mirate archiviate, oltre ai primi riscontri web. Non è un
censimento esaustivo di tutti i listini pubblicati sul web.

**40 schede con nuove informazioni sui costi**, oltre alle 106 note già
presenti: totale 146. Il nuovo archivio editoriale `fiere-costi.json` contiene
126 sintesi con fonte, periodo tariffario, data di consultazione e natura del
costo: 50 quote, 26 tariffe per unità, 30 costi parziali, 13 condizioni
particolari e sette quote esplicitamente gratuite. Questi numeri non indicano
126 preventivi completi. Le 86 note recuperate dagli audit precedenti ne
conservano la data di verifica; 40 integrazioni provengono dalla ricerca
corrente. Le altre 20 note restano nel dettaglio senza un prezzo sintetico
certificato, spesso perché richiedono un preventivo o un canone da determinare.

Fonti e decisioni principali:

- [Grottammare, tabella 2026](https://www.comune.grottammare.ap.it/wp-content/uploads/2026/05/TARIFFE-2026.pdf):
  tabella letta anche visivamente; tariffa base 3×3 m 90 € per due giorni,
  con vie a maggiore potenzialità, somministrazione, artigiani ed espositori
  trattati separatamente. Il percorso contiene maggio, ma il documento cita
  la delibera dell'8 ottobre 2026: anno letto nel documento.
- [Genova, tariffe 2026](https://www.comune.genova.it/sites/default/files/2025-12/Tariffe%202026.pdf)
  e [calendario comunale](https://www.comune.genova.it/sites/default/files/2026-01/calendario%20fiere%202026_0.pdf):
  canoni al m²/giorno per 17 fiere nominalmente presenti nel calendario.
  Non estesi automaticamente a saloni privati o altri eventi cittadini.
  Per quattro fiere il tariffario è speciale; discordanza seconda categoria
  3,95 € nel dispositivo/3,90 € nell'allegato dichiarata nelle schede.
- [Aosta, Marché Vert Noël 2026/2027](https://aosta-api.municipiumapp.it/s3/266/allegati/sport/avviso-edizione-2026_con-data_signed.pdf):
  intero periodo 3.800/4.000/10.000 € secondo attività, IVA e servizi base
  compresi; caparra compresa nel totale, potenziamento e parcheggio extra.
- [Gusti di Frontiera, linee guida 2026](https://gustidifrontiera.it/documents/59/LINEE_GUIDA_2026_.pdf):
  vendita non alimentare/alimentare 250/450 €, somministrazione 950/1.400 €,
  maggiorazione oltre 25 m² e servizi da pagare separatamente.
- [Borgotaro, modulo alimentari 2026](https://www.sagradelfungodiborgotaro.it/wp-content/uploads/2026/03/modulo-enoagroalimentare-2026-1.pdf):
  banco 3×3 m 200/350 € + IVA per uno/due weekend, corrente separata.
  Non trasferito ai non alimentari o a giornate singole.
- [Balon e Gran Balon](https://www.balon.it/partecipa-balon-torino-vendere-al-balon/):
  29/90 € per spazio standard, oltre 30 € annuali per anagrafica. Anno
  tariffario non esplicito: nessuna attribuzione arbitraria al 2026.
- [MonzaCon, modulo Summer 2026](https://www.monzacon.com/downloads/Modulo_Espositore_MonzaCon_SE26.pdf):
  evidenziati anche i 70 € di iscrizione/assicurazione oltre allo spazio;
  [Villa Roberti](https://mercatinobrugine.it/wp-content/uploads/2025/10/Mercatino-Pieghevole_MM-2.pdf):
  aggiunte le opzioni Barchessa 30/35 € oltre alle piazzole 40/50 € già note.
- Klimahouse: listino pubblicato **2027**, mostrato con quell'anno anche
  quando la scheda conserva date storiche 2026. Tempo Libero: prezzi
  pubblicati senza anno tariffario esplicito e senza interpretare gli
  scaglioni come progressivi. Listini non proiettati su altre edizioni.
- Prato: quota 105 € e bollo 16 €, ma l'articolo non chiarisce se la quota
  copra una o entrambe le domeniche. Chiari: 25 € riguarda l'11 gennaio.
  Gaggiano: modulo corrente con quote P.IVA 20/30 €, testo secondario con
  riferimenti precedenti segnalato. Uggiate: mantenuta avvertenza sui numeri
  e le lettere discordanti. Avvisi con bolli/diritti rimangono costi parziali.
- Laigueglia e Amantea: prezzi ricavati da resoconti giornalistici datati,
  qualificati come tali e da confermare con il Comune. Cosenza: tariffario
  riportato da Confartigianato, con refuso nella data della delibera dichiarato.
  Non spacciati per preventivi direttamente confermati dal Comune.

Archivio di ricerca fuori dal repository:
`C:/Users/utente/Documents/ricerca-costi-fiere-20261015`, con manifesto,
testi, hash, ricerche, selezione editoriale e controllo d'integrazione.
Nessun Comune o organizzatore contattato. Download falliti, pagine dinamiche,
listini solo grafici e preventivi riservati limitano la copertura: **importo
non verificato non significa gratuito né prezzo certamente non pubblicato**.

Nel sito: riga costi nell'elenco; sezione dedicata nel dettaglio, fonte
cliccabile, anno delle tariffe e data di consultazione. Nessun importo
stimato da dimensioni ipotetiche. Build con overlay dopo gli audit
provinciali: tutti gli ID e i campi estranei ai costi restano identici.
Cache `fiere.js` 43, catalogo 35, CSS 13.
Build, controlli settori e suite del calendario passati su Chromium
1440/820/390/320 e WebKit 390: costi nel dettaglio e nell'elenco, fonte,
anno diverso dall'edizione, gratuità e importo mancante, filtri, elenco/mappa,
tastiera, errori/riprova e assenza di overflow. Primo avvio browser fermato
per una versione Playwright senza relativo eseguibile; usato il pacchetto
già presente compatibile con i browser installati, senza cambiare dipendenze.

## Ricerca documentale Cuneo — 15 ottobre 2026

**173 manifestazioni in 93 comuni**, rispetto alle 55 precedenti. Ricerca
nominale nei **247 comuni**, lettura delle **160 righe provinciali** dei due
registri Piemonte (86 fiere e 74 sagre/fiere mercato), confronto con i due PDF
regionali e approfondimenti su Comuni, organizzatori, Pro Loco e associazioni.
Visit Cuneese: categorie mercati/mercatini **23**, fiere/sagre **46**, Autunno
con Gusto **57**, filtrate dal 1 gennaio al 31 dicembre 2026: **82 record
distinti** esaminati. Le schede passate vengono ritirate: questo risultato
non costituisce un archivio annuale completo. Calendario LMR pubblico
renderizzato in Chromium; esaminate le schede pertinenti alla provincia,
senza dichiarare lettura integrale dei 142 marcatori misti anche fuori Cuneo.

Schede, copertura comunale, decisioni su tutte le righe regionali e ATL,
esclusioni, conflitti e manifesto delle fonti in `fiere-cuneo.json`.
Archivio locale: `C:/Users/utente/Documents/ricerca-fiere-cuneo-20261015`.
Richieste HTTP, pagine, PDF, ricerche e riscontri browser sono conservati
fuori dal repository. Il manifesto comprende anche homepage, elenchi,
omonimie, materiale non pertinente ed errori: **il numero di richieste
non è il numero di prove utili lette integralmente**. Non pubblicati i
documenti originali di terzi.

**117 schede con giornate precise**, 54 con soli periodi da confermare e due
senza edizioni datate (Cheese biennale e Mercatino Senza Tempo). **165 schede
con recapiti**, **10 termini assoluti** pubblicati; le scadenze trascorse
rimangono storiche, senza trasformarle in domande aperte. Nessuna disponibilità
di posteggi garantita, nessuna ricorrenza proiettata su nuove date.

Informazioni operative e principali decisioni:

- [Mercati straordinari del Marrone, Comune di Cuneo](https://www.comune.cuneo.it/documento_pubblico/modulo-di-adesione-per-il-commercio-su-area-pubblica-di-tipo-a-e-b-in-occasione-dei-mercati-straordinari-del-marrone-17-18-ottobre-2026/):
  **17 e 18 ottobre**, soltanto non alimentare con autorizzazione A/B;
  **25 € per posteggio e mercato**, modulo via PEC, termine **2 ottobre**
  trascorso. Una autorizzazione per un posto 10×4, senza posti uniti.
  Distinti dalla Fiera Nazionale del Marrone **16–18 ottobre**, selezione
  espositori e termine **14 agosto**, non esteso agli ambulanti del mercato.
- [Casteldelfino, Fiero de Son Martin](https://www.comune.casteldelfino.cn.it/Dettaglionews?IDNews=416034):
  mercatino agricolo/zootecnico **18 ottobre**, gratuito; scheda firmata via
  email entro il **14 ottobre**, già trascorso. Assegnazione entro le 8:30,
  via Bellino vicino Pian di Mion. Il 17 è parte della festa, non del mercato.
- [Gusta Cherasco e Cherasco Natura](https://www.confagricolturacuneo.it/cherasco-protagonista-dautunno-due-appuntamenti-dedicati-ai-prodotti-e-alle-eccellenze-del-territorio/):
  area agroalimentare **24–25 ottobre**, adesione **16 ottobre**; Natura
  **8 novembre**, adesione **31 ottobre**. Termini del canale aziende
  Confagricoltura/Cascine Piemontesi, non regola universale per tutti gli
  espositori. Gazebo 3×3 fornito, arredi propri, costi da richiedere.
  Mercato dei manufatti in via Vittorio Emanuele **25 ottobre**, scheda
  distinta per categoria dal mercato alimentare.
- [Chiusa di Pesio](https://www.comune.chiusadipesio.cn.it/Dettaglionews?IDNews=392647):
  Re Marrone mercato **25 ottobre**, Nel paese incantato **6 dicembre**;
  richiesta singola/cumulativa dal portale comunale. Termini e tariffe non
  pubblicati nella notizia. Il Mundajè è una gara interna, non un altro mercato.
- [Govone, portale espositori](https://espositori.magicopaesedinatale.com/):
  **14 giornate** esplicite fra **14 novembre e 20 dicembre**, compresi
  **7–8 dicembre**; ore **10–19** nel calendario espositori. Candidatura
  non vincolante per artigianato/oggettistica; presenza in tutte le giornate,
  selezione, costi comunicati ai selezionati. Richiesta HTTP diretta 403;
  pagina letta con lo strumento web. Date di Asti non importate a Govone.
- [Roccabruna](https://www.confagricolturacuneo.it/aperte-le-iscrizioni-per-la-xxii-fiera-di-valle-di-roccabruna-in-programma-domenica-4-ottobre-2026/):
  mercato **4 ottobre**, termine **25 settembre**; 3×3 a **20/40 €** senza/con
  corrente, oltre 3×3 **40/80 €**, IVA inclusa. Non tutto il 3–4 ottobre.
  Savigliano Primavera **15 marzo**: termine **15 gennaio**, **35 € + IVA22%**,
  occupazione e bollo **16 €** ulteriori; condizioni e modulo 2026 letti.
- Fossano Coloratissimo **10–11 ottobre**, termine **4 ottobre** dalla notizia
  datata 21 settembre. **Il modulo collegato è ancora del 2025**: segnalato,
  non presentato come modulo aggiornato. Non trasferiti termine 3 ottobre e
  giorni 11–12 ottobre del vecchio allegato.
  Regolamento 2026: **10 €** organizzazione + **1,23 €/m²/giorno** CUP,
  TARI **1/2 €/giorno** sotto/sopra 10 m², luce **5 €/giorno**; istanza in
  bollo. Fascia esatta 10 m² non chiarita. Massimo 60 espositori dichiarati,
  non posti liberi; quota non rimborsabile per assenza/disdetta.
- Date commerciali separate dai programmi: Venasca **18 ottobre** (locandina
  comunale letta visivamente, non il 15–18 né il 16–19 di altre fonti);
  Sampeyre **27 settembre** (due immagini comunali), Brossasco **1 e 3 maggio**
  (due pagine PDF scansionate), Monastero di Vasco **17 maggio**, Roccaforte
  Mondovì **2 giugno**, Piasco **11 ottobre**, Paesana **18 ottobre**, Vinadio
  **25 ottobre**, Farigliano **6 dicembre**, Paroldo Dula **31 maggio**
  contro il 2 giugno del registro. Carrù Bue Grasso **17 dicembre** da ATL;
  altri giorni del periodo regionale 17–20 da confermare.
- Alba Tartufo: **18 giornate**, solo sabato/domenica dal **10 ottobre al
  6 dicembre**, non 58 giorni continui. Saluzzo Artigianato: botteghe al
  Quartiere **11–12 e 18–19 aprile**, mostra museale fino al 17 maggio
  distinta; Antiquariato **23 maggio–2 giugno** dall'organizzatore, superato
  il precedente PDF regionale. Mercato dei Santi **30/31 ottobre e 1 novembre**,
  solo fiori/piante; Fiera di San Chiaffredo **7 settembre** distinta dalla
  Festa del 6–7 nel calendario comunale.
- BEE Villanova Mondovì: ATL **20–22 novembre** contro registro **14–15**;
  mostrato come periodo con conflitto esplicito e programma commerciale da
  confermare. Aj a Caraj: conservata giornata regionale **15 novembre**,
  festa ATL anche il 14 senza estenderne automaticamente il mercato.

Limiti/esclusioni: Cavoli Tuoi e Trinità Pocio senza mercato documentato nel
testo accessibile; castagnate di sola ristorazione, concerti e laboratori
esclusi. Mercatino ordinario di Sinio distinto dalle fiere. Marmora Natale:
data dichiarata stimata dall'aggregatore con testo del **2017**, non 2026
confermato. Dronero Mercanti in Fiera, Fossano Natale e alcune schede passate
ATL restituiscono NotConfigured; Monforte creativi e Cervasca hanno dettagli
non recuperabili. Paesana Natale 2025 e testi natalizi Saluzzo/Castellar non
proiettati sul 2026. Fiera Fredda organizzatore ancora sul programma 2025:
calendario 2026 dalla Regione/ATL, nessun costo o termine storico trasferito.
Pagina originaria Cheese HTTP 503: scheda biennale conservata senza date.
Ammissioni professionali e giorni di vendita non documentati restano da
confermare. Nessuna domanda, candidatura, email o comunicazione inviata.

Integrazione limitata a Cuneo: altre **3.274 schede identiche**, tutti i
**55 ID precedenti conservati**. Catalogo **3.447** schede, 3.271 con edizioni,
2.680 con date pubblicate; cache fiere.js **41**, catalogo **34**. Build,
controlli settori e test specifico Cuneo passati in Chromium computer/telefono
e WebKit telefono: 173 risultati, mappa ed elenco coerenti, dodici dettagli.
Passata anche la suite generale del calendario su Chromium 1440/820/390/320
e WebKit 390: filtri, province, dettagli, tastiera, errori/retry e overflow.
Commit dati `17e2ee0`: deploy Vercel riuscito il 15 ottobre, verifica conclusa
alle **08:43 UTC**. Pagina HTTP 200 con fiere.js 41; catalogo e JavaScript
pubblici identici ai blob Git, confrontando i byte del commit e non i fine
riga del checkout Windows. SHA-256 del catalogo pubblicato:
`7e1eb37fc14496437121da28b5017cab66c34ddbdf9e397a02e21323b132c428`.
Verificati online 173 risultati, mappa ed elenco e dodici dettagli su Chromium
computer/telefono e WebKit telefono; anche pagina reale senza intercettare
richieste su computer/telefono, nessun errore JavaScript o overflow. Evidenze
locali `deployment-verification.json`, `verification-online.json`,
`live-smoke.json`, `integration-check.json` e schermate.
TO DO spuntata solo dopo questi riscontri: **25 province completate, 85
rimaste su 110**. Nessun'altra provincia o attività avviata.

## Ricerca approfondita Novara — 15 ottobre 2026

**71 manifestazioni in 36 comuni**, rispetto alle 13 precedenti. Ricerca nominale
negli **87 comuni**, confronto integrale delle **25 righe provinciali** dei due
registri Piemonte (23 sagre/fiere mercato e due fiere). Confrontate le 33 schede
ATL «Fiere e Mercati» e vagliate per evidenza commerciale tutte le pagine delle
categorie Enogastronomia (97 risultati) e Sagre (131): 261 dettagli distinti.
I pasti, le degustazioni e i programmi culturali non diventano automaticamente
opportunità per ambulanti. Non è un censimento esaustivo né una verifica dei
posti disponibili. Query e recuperi HTTP comprendono anche pagine inutili,
omonimi e accessi falliti: non sono altrettante fonti utili lette integralmente.

Override, copertura per comune, 25 decisioni regionali, vaglio ATL, fonti/hash,
esclusioni e limiti in `fiere-novara.json`. Archivio locale:
`C:/Users/utente/Documents/ricerca-fiere-novara-20261015`.
69 schede hanno date precise, una un’edizione testuale e una sola ricorrenza;
45 hanno contatti e sei termini assoluti. Meina conserva soltanto lo storico
2025. Nessuna data proiettata dalle edizioni precedenti o dalle ricorrenze.

- [Fiere Novara, Comune](https://www.comune.novara.it/novita/notizie/fiere-novara-2026):
  per marzo/agosto/novembre sostituite le vecchie aree con Largo Bellini,
  Baluardo Massimo d’Azeglio, Via Brera e Viale Turati. Date esplicite regionali
  7–8 marzo, 1–2 agosto, 14–15 novembre; ATL cita solo la domenica per le prime
  due, limite visibile. Numeri di espositori discordanti, mai posti liberi.
- [Ameno](https://www.amenoturismo.it/mercatino-di-natale-di-ameno-2026-aperte-le-iscrizioni/):
  **14–15 novembre**, domanda entro **30 ottobre**, hobbisti con tesserino.
  Respinte le date 21–22 novembre dedotte da aggregatori.
- [Ghemme, regolamento 2026](https://www.noidelcastello.com/wp-content/uploads/2026/09/Natale-nelle-Cantine-2026-Richiesta-di-candidatura-e-partecipazione-B.pdf):
  Natale nelle Cantine **6/7/8 dicembre**, candidatura solo WhatsApp e selezione.
  Pagamento entro 15 giorni dalla conferma e comunque **15 novembre**.
  Gazebo 3×3 hobbisti/P.IVA 20/30 €/giorno, fino 6×3 35/50; con veicolo
  40/50; cantina per tre giorni con corrente 100/130 €. Gazebo senza corrente;
  quote non restituite per maltempo/annullamento/rinuncia. Ristoro su accordo.
- [Prato Sesia Natale](https://www.pratosesia.com/Mercatino/Mercatino2026/Mercatino2026Iscrizioni.htm):
  **13 dicembre 9–18**, domanda **11 dicembre**, 10 € preiscritti, 20 € senza
  preiscrizione dopo i già iscritti. Artigiani, hobbisti con tesserino e tipicità
  alimentari solo vendita; esclusi libri, antiquariato e alimentari occasionali.
  Modulo 2026 risolve il refuso «14 dicembre» nell’accredito della pagina.
  [Autunno](https://www.pratosesia.com/castagnata/2026/castagnata.htm):
  **11 ottobre**, gratuito, domanda **10 ottobre**, esclusi alimentari,
  antiquariato e libri; nessuna elettricità fornita in entrambe le occasioni.
- Armeno: moduli comunali per produttori/commercianti, Festa di Primavera
  **24 maggio**, termine **31 marzo**; Zootecnica **11 ottobre**, termine
  **20 settembre**. Canone da definire con il Comune, nessuna tariffa inventata.
- [Cureggio Naturale!](https://www.turismonovara.it/it/appuntamentischeda?Id=31859):
  mercato del **10 maggio annullato per maltempo**, escluso. La camminata e
  l’apericena del 9 non diventano un mercato. Trecate polenta **11 ottobre**,
  respinto il refuso 11 settembre di un’altra scheda ATL.
- [Lesa](https://www.lesaturismo.it/wp-content/uploads/2026/06/Lesa-Mercatini-2026-e1782228157818.jpg):
  due locandine lette visivamente, 13 giornate esplicite. Versione successiva:
  **22 agosto**, non 23; il 27 settembre della precedente non riproposto.
  [Pella](https://comune.pella.no.it/Dettaglionews?IDNews=390980): sei giornate
  artigianato/hobbisti e tre antiquariato; periodo generico fino al 9 settembre
  ignorato a favore del dettaglio con ultima data **6 settembre**.
- Banchi separati dalle feste: Grignasco Art & Food **11 ottobre**, Fontaneto
  Mercato della Terra **20 settembre**, Nebbiuno Polenta **6 settembre**,
  Borgomanero Festa dell’Uva artigianato **13 settembre**, Exporice mercato
  **24 maggio**; San Nazzaro street food 9–11 maggio ma bancarelle **solo l’11**.
- [Fiorissimo](https://www.fiorissimo.eu/espositori/): nuova edizione esplicita
  **2–4 aprile 2027**, candidatura online per florovivaisti/artigiani del verde;
  mantenuto il 27–29 marzo 2026 come storico. Maggiora Agri Festival homepage
  **10–12 luglio 2026**; brochure collegata ancora della prima edizione,
  non usata per date o gratuità stand del 2026. Smart Food Sizzano è un salone
  riservato agli operatori del settore, distinto da un mercato ambulante.

Limiti operativi: Trecate agricola avviso domande **410 anche in Chromium**,
evento comunale disponibile con orari 9/10–18 discordanti. Boca vino programma
organizzatore 403, sola data 2 giugno recuperata; Ghemme vino date discordanti,
sola edizione testuale. Calici Novara/Oleggio da ATL, siti organizzatore 403:
biglietti degustazione non sono quote del banco. Arona tartufo 14–15 novembre:
Piazza San Graziano nel testo, Lungolago nel campo automatico, sede da chiarire.
Roba Végia: centro nelle cronache 2026 vs Foro Boario nel regolamento storico;
ricorrenza e condizioni da riconfermare, nessuna ultima domenica calcolata.

Romentino Artiquariando: pagina con date generata con AI, originali non
recuperati; rimane pista, non conferma. Badia Antiqua San Nazzaro: dettaglio
del 2013, non evento corrente. Bellinzago Natale 2022, Briga atto d’indirizzo,
Le Pigne, Comignago e Castelletto Natale conservati nell’audit con i rispettivi
limiti. Omonimie Arona Canarie, Pella Iowa e Galliate Lombardo escluse.
Gattico-Veruno senza coordinate anagrafiche: punto esplicito della mappa ATL
di Curiosando a Veruno, con `coordinateSource`, senza cambiare `comuni.json`.
Nessuna candidatura, domanda o comunicazione inviata a terzi.

Integrazione limitata a Novara; cache pagina **40**, catalogo **33**.
Build riproducibile, controlli settori, regressioni provinciali e calendario
completo passati su Chromium (1440/820/390/320) e WebKit (390). Test Novara:
71 risultati, corrispondenza mappa/elenco e dieci dettagli in tre combinazioni
browser/schermo. Altre **3.258 schede identiche** e tutti i **13 ID Novara**
conservati; catalogo **3.329** schede. Scansione segreti staged senza rilievi.
Commit dati `e92ded2`: Vercel riuscito, pagina HTTP 200 con cache aggiornata.
Catalogo pubblico SHA-256
`0316ed9da979590f362ae3a791965e5eabd59fb47d83becae9696b48a62cc720`
e JavaScript identici ai blob del commit (confronto Git, indipendente dai fine
riga Windows). Verificati online tutti i 71 risultati e la mappa, dieci
dettagli in Chromium computer/telefono e WebKit telefono; anche pagina reale
senza simulare script esterni, nessun errore JavaScript o overflow. Evidenze
locali in `deployment-verification.json`, `verification-online.json` e
`live-smoke.json`. TO DO spuntata solo dopo questi controlli:
**24 province completate, 86 rimaste**. Nessun’altra provincia avviata.

## Ricerca approfondita Venezia — 14 ottobre 2026

84 manifestazioni in 26 comuni, rispetto alle 16 precedenti. Eseguite ricerche
nominali nei 44 comuni e confrontate tutte le 132 righe Venezia del registro
Veneto aggiornato all’8 ottobre: 44 righe integrate in 43 manifestazioni,
consolidando un duplicato; le altre 88 escluse o conservate come piste senza
distinta evidenza commerciale. Confrontati antiquariato Veneto 2026, calendari
fieristici, guida UNPLI, Comuni, portali turistici e organizzatori. Le 40 righe
del calendario commerciale Caorle sono raggruppate in sette rassegne.
Dati, copertura dei comuni, fonti, hash, esclusioni e limiti in
`fiere-venezia.json`; archivio locale
`C:\Users\utente\Documents\ricerca-fiere-venezia-20261014`.

56 schede hanno giornate precise, 21 soltanto periodi e sette edizioni testuali
o ricorrenze. Contatti pubblici in 17 schede e un termine assoluto documentato.
I 290 recuperi HTTP (254 risposte 200) comprendono duplicati, homepage,
candidati estranei e pagine senza contenuto: non sono altrettante fonti utili
lette. Nove letture browser comprendono accessi falliti. Verificati visivamente
il listino C Sant’Andrea, pagina 5, e la tabella delle categorie Caorle, pagina 2.
Non è un censimento esaustivo né una verifica dei posti disponibili.

Correzioni e indicazioni per partecipare:

- [Sant’Andrea, Comune di Portogruaro](https://www.comune.portogruaro.ve.it/it/news/fiera-di-santandrea-2026):
  ambulanti e produttori **28–29 novembre**, modulo C entro **30 ottobre**;
  il 22 riguarda associazioni e hobbisti/artigiani con moduli diversi. Quota
  per due giornate da 50/60 € fino a 250/270 € secondo area e superficie,
  **più IVA 22% e CUP 0,37 €/m²/giorno**; corrente separata. Listino e limiti
  nel [modulo C](https://portogruaro-api.municipiumapp.it/s3/5462/allegati/commercio/2026/allegato-c-commercio-su-area-pubblica-produttori-agricoli.pdf).
  Selezione degli espositori; gas generalmente vietato con eventuali aree
  limitate da concordare. Tabelle B/D con refusi, non applicate agli ambulanti.
- [Festival di Primavera Portogruaro](https://www.prolocoportogruaro.it/festival-di-primavera-2026-a-portogruaro/):
  **11–12 aprile**, sostituisce il 14 aprile del registro.
  [Noale in Fiore](https://www.comune.noale.ve.it/vivere-il-comune/eventi/noaleinfiore-14-aprile-2025/):
  mercato **12 aprile**, distinto dagli eventi collaterali dell’8–11.
- [Pro Loco Mira](https://www.prolocomira.it/eventi.html): Oriago in Fiore
  banchi **29 marzo**, food truck 27–29; Notte Rosa artigianato **12 settembre**,
  ristorazione 11–13. Natale 28–29 novembre resta calendario **provvisorio**;
  la pagina dedicata mercatini.html descrive ancora il 2023.
- [Festa dei Bisi](https://www.prolocoscorze.it/feste/54-festa-dei-bisi/):
  mercatino con hobbisti e commercianti **31 maggio**; la festa complessiva
  29 maggio–8 giugno non diventa un mercato quotidiano.
  [Ocaria Mirano](https://www.giocodelloca.it/Fiera_dell_oca.asp): **7–8 novembre**,
  sabato pomeriggio e domenica, con selezione e prodotti a tema oca.
- [Santo Stefano](https://www.fierasantostefano.it/): salone **31 luglio–4 agosto**,
  distinto dai festeggiamenti Pro Loco fino al 5; non libero accesso ambulanti.
  [Corbolone](https://www.corbolone.it/il-programma/): mercato **27 settembre**;
  [procedura](https://www.corbolone.it/come-partecipare-alla-fiera-di-s-antonio/)
  distinta per commercianti (Polizia Municipale), hobbisti e animali.
- [Caorle, calendario comunale](https://www.comune.caorle.ve.it/wp-content/uploads/2024/11/CALENDARIO-DELLE-MANIFESTAZIONI-STRAORDINARIE-CON-OFFERTA-COMMERCIALE-DI-SUPPORTO.pdf):
  40 appuntamenti, limiti per sito e categoria. Lavoro, Fantasia e Solidarietà
  è riservato alle opere del proprio ingegno; Officine Creattive non prevede
  alimentari. Numeri autorizzati e accesso visitatori non indicano disponibilità.
- [San Maurizio](https://www.mercatinocamposanmaurizio.it/): prossime giornate
  **16–18 ottobre e 4–6 dicembre**. [Mercati straordinari Venezia](https://www.comune.venezia.it/it/content/mercati-deroga-e-mercati-straordinari-anno-2026):
  Lido e Parco Ponci **6, 13, 20 dicembre**, orari differenti.
  [Jesolo Natale](https://jesolo.it/citta-del-natale-2026/): **27 novembre 2026–6 gennaio 2027**,
  pagina corrente letta in Chromium perché l’indice mescolava anni diversi.
  [Caorle Christmas Time](https://www.visitproseccohills.it/it/eventi/dettaglio/caorle_christmas_time%2C18238.html):
  **5 dicembre 2026–6 gennaio 2027**, programma dettagliato ancora da pubblicare.
- [Bibione Lido del Sole](https://www.bibione.eu/eventi/lestate-di-lido-del-sole-2026/):
  cinque rassegne tematiche, giornate distinte. Antiquariato regionale mantenuto
  come ricorrenza, senza generare date; nuovo affidamento Noale distinto dalle
  candidature degli espositori. Salone Nautico: sito attuale annuncia
  esplicitamente **26–30 maggio 2027**, non date 2026 dedotte dal vecchio decreto.

Limiti: San Donà ha restituito errore anche nel browser; Rosario 3–5 ottobre
e 291 posteggi derivano da stampa locale datata, con riscontro ATVO sulla
viabilità, senza ricostruire quote o termini. Camponogara 25 agosto è da
estratto ACTV datato, accesso integrale 403 dichiarato. L’URL apparentemente
PDF di Caorle restituisce una pagina HTML diversa: non usato per le date
natalizie. Costi, nuove candidature e giornate dei banchi non pubblicati
restano da verificare; piste di comuni senza schede, Eraclea, saloni e Natale
residuo conservate nell’audit. Nessuna richiesta o comunicazione a terzi.

Build sul repository corrente, conservando Mantova e Cremona: altre **3.187**
schede identiche e tutti i 16 ID Venezia preservati. Catalogo **3.271** schede;
cache fiere.js **39**, catalogo **32**. Commit dati `765cb5e`: Vercel riuscito,
catalogo pubblico e JavaScript identici ai file del commit, pagina HTTP 200
con cache aggiornata. Verificati online 84 risultati, mappa e dodici dettagli
in Chromium computer/telefono e WebKit telefono: fonti, contatti, moduli,
quote e assenza di errori/overflow. Controlli dati, settori e calendario
completo sui cinque browser/schermi passati. Evidenze locali in
`deployment-verification.json` e `verification-online.json` nell’archivio.
TO DO aggiornata dopo la verifica: **23 province completate, 87 rimaste**.

## Ricerca approfondita Cremona — 14 ottobre 2026

71 manifestazioni in 31 comuni, rispetto alle nove precedenti; 61 schede con
contatti pubblici e otto scadenze assolute documentate. Confrontati i 113 comuni
dell’anagrafica: 100 query singole archiviate e gli altri 13 in ricerche mirate
o combinate. Esaminate 71 registrazioni Lombardia CR/2026 e recuperati tutti i
71 programmi: 66 PDF con testo, quattro immagini e un PDF scansionato;
i cinque programmi grafici sono stati verificati visivamente. Confrontati
Comuni, calendari provinciali/turistici, organizzatori, moduli e regolamenti.
Audit, fonti, hash, esclusioni e limiti in `fiere-cremona.json`; archivio locale
`C:\Users\utente\Documents\ricerca-fiere-cremona-20261014`.

55 schede hanno giornate precise, 14 soltanto periodi e due sole ricorrenze.
Non è un censimento esaustivo né un controllo dei posti disponibili. I recuperi
HTTP nell’audit comprendono candidati, duplicati, homepage, pagine estranee
e risposte senza contenuto: non sono altrettante fonti utili lette. Quattro
edizioni da stampa locale datata 2026 (Izano, Pandino San Giuseppe, Vaiano,
FieraGrumello) sono marcate come calendario e hanno limiti operativi espliciti.

Informazioni operative e correzioni:

- [Buongusto Pizzighettone](https://www.pizzighettone.it/manifestazione/980-Buongusto_2026_Unisciti_a_noi_.php):
  banchi 31 ottobre, 1, 7 e 8 novembre, 10–20; termine 19 ottobre 2026 nel
  modulo Google collegato, fino a esaurimento. Listino verificato visivamente,
  **+ IVA 22%**: esterno circa 20 m² 200/150/310 € per primo/secondo weekend/
  pacchetto; interno ¼ casamatta 270/210/440 €, ½ 410/290/640 €.
  Avviso attuale: primo weekend solo esterno; quote per interni nel listino
  non dimostrano disponibilità. Nessuna iscrizione inviata.
- [Natale Idee Regalo](https://www.pizzighettone.it/manifestazione/990-Natale_Idee_Regalo_Unisciti_a_noi_.php):
  quattro date 6/8/13/20 dicembre, 10–19; termine 16 novembre o esaurimento.
  Quote **IVA inclusa** per 1/2/3/4 giornate: ¼ casamatta 61/109,80/127/133 €;
  ½ 122/219/252/265 €; intera 244/439/505/530 €. Chiedere servizi compresi.
  Hobby e Sapori solo 8/15 marzo (termine 23 febbraio); Tre giorni in Piazza
  e Festival Vintage raggruppati, espositori solo 16/17 maggio (termine 6 maggio).
- [San Pietro Cremona](https://www.comune.cremona.it/media/2846): 28 giugno,
  vendita 7–24, domanda SUAP entro 28 aprile, ormai trascorso. Spunta dopo
  le 7 in graduatoria, poi sorteggio degli autorizzati presenti se restano posti.
  Senza domanda non si maturano presenze. Banchi 12×5 alimentari, 8×5 non
  alimentari; canone senza importo recuperato, condizioni elettriche distinte.
- [Soresina](https://www.comune.soresina.cr.it/it/page/fiere-e-mercati):
  mercato dell’Angelo 6 aprile, termine 31 marzo; Ariadello 10/11 maggio,
  termine 30 aprile. Solo SUAP, 50 € di istruttoria **non costo totale del banco**.
  Avviso Angelo contiene refuso 06/04/2024, senza cambiare l’edizione 2026.
  Sapori e Colori 20 settembre; Ratatuia 22 marzo, 24 maggio, 27 settembre
  e 25 ottobre, quest’ultima **solo su invito**. Regolamento 2026 ammette
  privati/ambulanti/hobbisti, esclude alimentari e merce esclusivamente nuova.
  Termine relativo lunedì/giovedì discordante: nessuna data calcolata.
- [Monte Cremasco](https://comune.montecremasco.cr.it/notizie/3652217/festa-santa-croce-2026-domanda-espositore):
  Santa Croce 25 ottobre; modulo via email con allegati secondo categoria,
  operativo entro 8:30, uscita dalle 18, nessuna energia comunale. P.IVA nel
  modulo da chiarire per hobbisti; nessun termine assoluto o costo inventato.
- Ostiano San Gaudenzio: manifesto comunale letto visivamente, bancarelle
  **25 ottobre**, luna park 24–26; periodo regionale 23–26 non trasferito.
  Crotta d’Adda mercato **11 ottobre**, non la tombolata del 10; Volongo
  mercatino **11 ottobre 8:30–19**, food truck del 9 distinto. Notte Rosa
  Agnadello **25 luglio**, non anche il 26 del registro; Svuota soffitte
  7 giugno, termine 24 maggio trascorso, evento di riuso non mercato generico.
- Castelleone Antiquaria: calendario grafico 2026–27 letto, 13 date esplicite;
  agosto solo **15 agosto**, gennaio successivo **10 gennaio 2027**. Consistenze
  di espositori discordanti fra homepage/locandina non indicate come posti liberi.
- [Quattro stagioni Cremona](https://www.comune.cremona.it/media/2751):
  12 giornate Campagna Amica, dieci antiquariato, sette Bio, senza generare
  ricorrenze; ottobre antiquariato sostituito da 1 novembre. Le quattro sagre
  Coldiretti nel registro sono consolidate nel mercato agricolo, senza duplicati.
  Giovedì d’Estate: sei date esplicite, non un mercato quotidiano per 36 giorni.
- Natale Cremona annunciato dal Comune il 13 ottobre: periodo 28 novembre–
  6 gennaio con apertura giovedì–domenica; mantenuto `periodOnly`, eccezioni
  festive da confermare. Bando 31 luglio per **gestori**, non espositori.
  Le dieci manifestazioni di CremonaFiere sono saloni/mostre con stand,
  distinti da concessioni ambulanti e senza spunta automatica.

Santa Maria della Croce Crema: la scheda comunale 2026 indica **28–30 marzo**,
che sostituisce 27–29 marzo del registro regionale. Orari 8–18 sono estremi
dell’evento, non un calendario giornaliero dei singoli banchi.

Limiti residui: Santa Lucia Crema ha orari discordanti fra scheda 2026 e
pagina ufficio 2025; Natale provinciale spesso mostra domenica più lunedì,
quindi periodi e singole giornate da confermare. Sant’Apollonia: pagina Comune
2025 e periodo regionale generale 26 gennaio–9 febbraio, conservato come
periodo da verificare; stampa 2026 indica 8–9 febbraio senza programma dei
singoli settori. San Carlo Casalmaggiore: guida 1–4 novembre e altre segnalazioni
dal 31 ottobre; vecchia domanda 2025 e termine 60 giorni **non applicati al 2026**.
Bonemerse pagina 410; Creare e programmi commerciali residui da approfondire.
Torricella manifesto verificato: food truck e luna park, nessun mercato
generalista dimostrato. AVIS, Fasulin e altri eventi con soli pasti/spettacoli
esclusi; ammissioni di operatori esterni non dedotte dalla voce «sagra».

Piadena Drizzona non ha coordinate nell’anagrafica: la sola scheda usa le
coordinate del [municipio pubblicate dal Comune](https://www.comune.piadena-drizzona.cr.it/vivere-il-comune/luoghi/municipio/),
con fonte esplicita; marker comunale, non ingresso. Anagrafica invariata.
Build conserva tutti i nove ID precedenti e le altre **3.132 schede identiche**:
3.203 eventi, 3.025 con edizioni. Cache catalogo 31, pagina fiere 38.
Pubblicazione verificata il 14 ottobre 2026 alle 19:59 UTC: commit dati
7f05e52, Vercel riuscito, catalogo online byte per byte identico al commit
(SHA-256 58a4459ad21e56ae51f0df6ba408a8dd48f65dde1ca275a8956d6bf2580ab5d3).
Elenco completo, quattro filtri settori e 13 dettagli controllati in Chromium
1440/390 e WebKit 390, senza errori o overflow. Build e test settori passati;
regressione generale Chromium 1440/820/390/320 e WebKit 390 passata.
Gitleaks del commit eseguito dal binario del checkout originale: nessun segreto.
Il hook nel checkout isolato aveva saltato il controllo per binario assente.
TO DO spuntata solo dopo questi riscontri: 22 province completate, 88 rimaste.

Coordinamento: lavoro svolto in checkout isolato; Venezia resta assegnata
alla sessione sospesa. Alla ripresa partire da `origin/main` e preservare
Mantova, Cremona e ogni altra aggiunta; non rigenerare il catalogo da snapshot
precedenti. Il backup di sessione è stato creato e pubblicato; lo script ha
emesso errori nel solo cleanup dei tag locali (PowerShell `-ErrorAction` passato
a git). Backup remoto riuscito, nessuna correzione dello script in questo task.

## Ricerca approfondita Torino — 14 ottobre 2026

241 manifestazioni in 115 comuni, rispetto alle 108 precedenti. Eseguite 312
ricerche nominali, una per ogni comune dell’anagrafica, ed esaminate tutte le
240 righe dei due registri regionali Torino: 139 sagre/fiere mercato e 101
manifestazioni fieristiche. Confrontati il calendario PDF aggiornato a ottobre,
quello precedente e l’atto di dicembre 2025, fonti comunali, Turismo Torino,
Piemonte Italia e organizzatori. Dati, copertura, fonti, hash, esclusioni e
limiti in `fiere-torino.json`; archivio locale
`C:\Users\utente\Documents\ricerca-fiere-torino-20261014`.

500 recuperi di fonti/documenti, 487 con risposta HTTP 200: questo numero
comprende candidati, homepage, duplicati, pagine senza contenuto e documenti
estranei esclusi, e non indica altrettante fonti pertinenti lette. Manifesto
Luserna verificato visivamente; moduli PDF/DOCX 2026 letti, pagina Pramollo e
form Almese controllati in Chromium usando `PLAYWRIGHT_MODULE`, senza invio.
171 schede hanno date precise, 50 periodi, una edizione testuale e 19 sole
ricorrenze. Otto schede conservano esclusivamente il Natale storico 2025.
Contatti pubblici in 222 schede e otto termini assoluti; ulteriori termini
distinti per categoria sono descritti senza applicarli agli altri operatori.

Correzioni e partecipazione:

- [Cuorgnè](https://cloud.townspaces.it/it/cuorgne): fiera 15 novembre,
  iscrizioni entro 15 ottobre; 35 posteggi dichiarati, non disponibilità.
- [Almese Natale](https://comune.almese.to.it/novita/mercatino-di-natale-2026-aperte-le-iscrizioni/):
  13 dicembre, domanda online entro 29 novembre. Commercianti con sede nel
  Distretto Monte Musinè; artigiani, produttori, OPI e associazioni secondo
  avviso. Conferma organizzatore e importo dopo superficie; nessuna quota
  forfettaria inventata. In caso di maltempo annullato.
- [Tuttomele](https://www.cavour.info/news/tuttomele-2026-regolamento-e-scheda-di-adesione-bancarelle-e-hobbisti):
  banchi esterni e hobbisti solo 7–8 e 14–15 novembre, rispetto alla festa
  generale 7–15. P.IVA: quattro giorni 3×3 senza corrente 120 € + IVA;
  5×3 e 6×3 con corrente 210/220 € + IVA, altre tariffe per Solferino.
  Hobbisti senza P.IVA: 50 €/weekend, tesserino e opere proprie, esclusi
  alimentari/antiquariato/rigatteria; termine 20 settembre già trascorso.
  Le due procedure e l’Expo con pagode a Via Goito restano distinti.
- [Chieri](https://cloud.townspaces.it/it/chieri/home/): mercatoni ambulanti
  8 e 10 novembre, termini rispettivamente 9 e 11 settembre, trascorsi;
  programma e aree gastronomiche da venerdì 6, senza trasferire i termini.
- [Rivoli](https://suolopubblico.comune.rivoli.to.it/Avvisi-e-Notizie/fiera-e-sagra-di-santa-caterina-2026):
  sagra domenica 22 novembre, domanda 23 settembre; fiera lunedì 23,
  domanda 24 settembre. Spunta solo con istanza presentata nei termini,
  graduatoria e posti effettivamente liberi. Una domanda per manifestazione;
  estremi precedente titolare necessari per recuperare presenze da subingresso.
- [Settimo](https://cloud.townspaces.it/it/settimo/home/): Fera dij Còj
  14–15 novembre. Termine ambulanti 30 settembre trascorso; 25 ottobre
  riguarda la sola Vetrina della Fiera, con categoria e condizioni da verificare.
- [Alpignano](https://www.comune.alpignano.to.it/it-it/servizi/imprese-e-commercio/mercati-e-fiere-488-59467-1-8c166a79e7833056ff36265944ac372a):
  San Martino 14 novembre, termini 15 settembre ambulanti/agricoltori e
  1 ottobre espositori/associazioni, trascorsi. Bollo 16 € più canone suolo;
  moduli di primavera con anni discordanti non trasferiti all’autunno.
- [Rivalba](https://www.comune.rivalba.to.it/Dettaglionews?IDNews=413019):
  mostra mercato domenica 8 novembre, non tutto il periodo 6–8. Istanza
  via email, bollo 16 € per operatori ordinari; hobbisti esenti e con modulo
  aggiuntivo. [Viù](https://www.comune.viu.to.it/Dettaglionews?IDNews=415085):
  8 novembre, 8–19; moduli separati, 15 € fino a 3×3 e 20 € oltre, DURC per
  professionali. Nessun termine assoluto trovato per queste due procedure.
- [Villafranca Piemonte](https://www.comune.villafrancapiemonte.to.it/novita/news/2319/FIERA-DELL-27IMMACOLATA):
  avviso del 13 ottobre: Immacolata domenica 13 dicembre, sostituisce il
  6 regionale. Mercato ordinario dell’8 dicembre distinto dalla fiera.
- [Luserna](https://comune.luserna.to.it/novita/news/509/Fiera-dei-Santi-2026):
  manifesto conferma mostra agricola con espositori 1–2 novembre dalle 8
  agli impianti sportivi; cene del 30–31 ottobre separate. Villar Focchiardo
  conferma mostra mercato 17–18 ottobre; concorso dolci non è domanda banchi.
- [Usseglio Toma](https://www.sagradellatoma.it/post/30-mostra-nazionale-della-toma-di-lanzo-e-dei-formaggi-d-alpeggio?site=eventi-usseglio):
  10–12 e 18–19 luglio, senza giorni intermedi. Villar Pellice mostra mercato
  solo 18 ottobre, rispetto alla festa 15–18; Pont Canavese commercio 20–21
  settembre, spettacoli 18–19 separati. Pinerolo macchine agricole consolidato
  nelle due fiere annuali, senza duplicati.
- [Natale è Reale](https://www.natalereale.it/): otto giornate 28/29 novembre
  e 5/6/7/8/12/13 dicembre. Pagine interne in aggiornamento, vecchie quote
  non applicate. Masino autunno 16–18 ottobre per vivaisti selezionati.
  Torino Comics trasferito a Collegno, 30 maggio–1 giugno; Artissima pubblico
  30 ottobre–1 novembre, preview 29 su invito; Restructura 12–14 novembre.
  Saloni specialistici e biglietti visitatori distinti da concessioni ambulanti.
- [Mercati tematici Torino](https://commercio.comune.torino.it/mercati/mercati-periodici-tematici/):
  14 schede leggibili, con ricorrenze e contatti; tre pagine 404 escluse.
  Gran Balòn 11 ottobre e Balòn del Sabato 17/24 ottobre hanno fonte
  organizzatore 2026. Per gli altri nessuna data generata dal calendario;
  descrizioni istituzionali 2024 esplicitamente segnalate.

Limiti: ricerca documentale nelle fonti accessibili, non censimento esaustivo
né verifica posti liberi. Collegno in Bancarella: 21 settembre regionale contro
domenica 20 nei resoconti, conservata edizione testuale. Volvera: pagina
«Annullata 2026» con date/corpo del 16 novembre 2025; non è prova di annullamento
2026, conservato 15 novembre da calendario da riconfermare. Pramollo senza
contenuto anche nel browser, esclusa. Pinerolo Natale: 21 ottobre riguarda
il gestore; periodo 28 novembre–6 gennaio senza giornate espositori verificate,
conservato nell’audit. Nuovi mercati Torino Di Nanni/Rostagno/disco-fumetto
ancora senza calendario operativo recuperato; Brocante nuovo avviso 2026
da chiarire. Fonti montane, Natale, allegati residui e candidature non pubblicate
restano nell’audit. Sagre senza mercato, soli pasti/spettacoli, gite, omonimi
fuori provincia e mercati ordinari esclusi; nessuna comunicazione a terzi.

Val di Chy e Valchiusa, senza coordinate nell’anagrafica, usano nelle sole
schede le coordinate geografiche pubblicate dai rispettivi Comuni, con fonte
esplicita: marker comunale, non ingresso. Anagrafica nazionale invariata.
Build conserva tutti i 108 ID precedenti di Torino e le altre 2.828 schede
identiche; catalogo 3.069 eventi, 2.893 con edizioni. Cache catalogo 29 e
pagina fiere 36.

Pubblicazione verificata il 14 ottobre 2026 alle 17:32 UTC: commit `b24a1fe`,
Vercel riuscito e catalogo online byte per byte identico al file del commit
(SHA-256 `f425e091ff84bc34097c8331bbe1c2ff5a820e0ddc73632fb8963b52f98b7828`).
3.069 schede online, 241 di Torino; verificati elenco completo, filtri dei
quattro settori, mappa e dodici dettagli in Chromium 1440/390 e WebKit 390,
senza errori o overflow. Build, settori e regressione generale Chromium
1440/820/390/320 e WebKit 390 passati. Differenze di fine riga locali Windows
normalizzate dal commit, dati JSON identici. Registro verifiche locale
`verification-live.json`; esito salvato anche nell’audit provinciale.
TO DO spuntata solo dopo questi riscontri: 20 province completate, 90 rimaste.

## Ricerca approfondita Como — 14 ottobre 2026

83 manifestazioni in 31 comuni, rispetto alle 16 precedenti. Ricerca nominale
nei 147 comuni attuali: le 148 chiavi dell’anagrafica includono Ronago e
Uggiate-Trevano, accorpati nell’audit a Uggiate con Ronago. La scheda usa la
chiave geografica storica Uggiate-Trevano, conservando le coordinate nazionali.
Dati, copertura, esclusioni, fonti e hash in `fiere-como.json`; archivio locale
`C:\Users\utente\Documents\ricerca-fiere-como-20261014`.

Confrontate tutte le 65 righe CO/2026 del registro Lombardia hs8z-dcey,
scaricati e letti i 65 programmi, tutti con testo estraibile. Verificati
registro fiere locali (nessuna riga CO), 14 righe fieristiche 2026, calendari
comunali e turistici, organizzatori, bandi e moduli; 389 recuperi HTTP di
pagine/documenti, 365 con risposta 200, che da sola non prova contenuto utile.
Il programma grafico Masigott è stato letto visivamente; bandi Cantù scaricati
dal browser tramite `PLAYWRIGHT_MODULE`. 74 schede hanno almeno una data
precisa, incluse nove con solo storico 2025; cinque hanno periodi, due edizioni
testuali e tre sole ricorrenze. Questi conteggi possono sovrapporsi. Contatti
in 32 schede e 11 termini assoluti; solo Uggiate ha un termine futuro.

Fonti operative e correzioni:

- [Uggiate con Ronago](https://comune.uggiateconronago.co.it/notizie/3659763/mercatino-natale-2026-aperte-adesioni):
  13 dicembre, termine 27 novembre; 50 postazioni dichiarate 3×3 m, non
  disponibilità residua. PDF via email al protocollo, PagoPA, hobbisti 10 €,
  espositori 20 €, associazioni gratuite. Il modulo contiene importi in lettere
  discordanti e una dichiarazione che non contempla chiaramente P.IVA:
  entrambi i limiti sono nella scheda. Rinvio al 20 dicembre solo per maltempo.
- [Cantù, bandi 2026](https://www.comune.cantu.co.it/servizi/imprese_e_commercio/servizio_174.html):
  Crocifisso 18 ottobre, termine 19 agosto; Santi 30 ottobre–2 novembre,
  termine 30 settembre e un posteggio dolciumi in piazzale XXVI Aprile.
  Spunta delle fiere la mattina in ordine di arrivo, senza garanzia. Requisiti
  e bollo distinti dai costi dello spettacolo viaggiante. Apollonia, San Rocco,
  Sant’Antonio, Giubiana e Santa Rita mantengono i propri termini trascorsi.
- [Anzano San Michele](https://www.procedimenti.servizirl.it/sagre/public/programma/26229):
  bancarelle il 27 settembre; il 26 solo danza e gastronomia.
  [Alzate](https://www.procedimenti.servizirl.it/sagre/public/programma/26997):
  commercio 5–8 settembre; moduli zootecnici non trasferiti agli ambulanti.
  [Griante](https://www.procedimenti.servizirl.it/sagre/public/programma/23964):
  manifesto conferma lunedì 16 novembre, 8–16, alimentare e non alimentare.
- [MOMA](https://www.mostrartigianato.com/): 24–25 e 30 ottobre–1 novembre,
  senza giorni intermedi. Selezione espositori e preventivo; ingresso gratuito
  per il pubblico non significa stand gratuito. Como Fun primavera segue AEFI
  18–19 aprile, rispetto al dato regionale 28–29 marzo. Saloni distinti dalle
  concessioni ambulanti e senza spunta automatica.
- [Cernobbio](https://www.comune.cernobbio.co.it/vivere_il_comune/eventi/evento_524.html):
  Lombardia Eventi in 13 giornate, I Bélee in otto; Asso Promo Arte, Campagna
  Amica e Giochi dei nonni hanno invece solo calendario 2025, anche se le
  pagine sono state aggiornate nel 2026. Rassegne hobbistiche, profili da verificare.
- [Domaso](https://www.northlakecomo.net/1340-Eventi-Tradizionale-mercatino-estivo-serale-a-Domaso):
  giovedì estivi, 20 agosto annullato. [Dongo](https://www.northlakecomo.net/1372-Eventi-Mercatino-estivo-a-Dongo):
  mercoledì e tre giornate straordinarie 24–26 luglio. Periodi delle ricorrenze
  mantenuti come tali, senza generare date dal giorno settimanale.
- [Mozzate](https://www.comune.mozzate.co.it/novita/notizie/novita_177.html):
  autori 18 ottobre, termine 9 ottobre trascorso; rinvio al 25 solo per maltempo.
  [Masigott](https://www.comune.erba.co.it/it/eventi/729146): programma 15–18
  ottobre rispetto al 19 regionale; presenza agricoltori solo domenica 18,
  senza inventare giorni dei banchi o ammissioni professionali.
- [Villa Guardia](https://comune.villaguardia.co.it/it/eventi/l-isola-che-c-e):
  L’Isola che c’è 19–20 settembre, fonte comunale e aree/espositori documentati
  dal sito organizzatore; iscrizione volontari distinta dalle candidature stand.

Ricerca documentale nelle fonti accessibili, non censimento esaustivo né
verifica di disponibilità. Como: recuperati calendari maggio–agosto;
avviso casette 2025 con opzione 2026 non conferma un nuovo mercatino.
Menaggio ha estremi discordanti e resta testuale. Natale Carimate, Villa
Guardia, Fino Mornasco, Pianello, Nesso e Faggeto conservano solo il 2025;
Asso 5 dicembre e Sormano 7 dicembre usano le nuove fonti 2026. Gite fuori
provincia, omonimi, spettacoli senza mercato, pasti organizzativi e sagre
senza opportunità commerciale documentata esclusi. Rovello Porro ha solo
segnalazione AI non corroborata; Turate restituisce 410 sulla pagina 2026;
Appiano, Gravedona e altre segnalazioni prive di riscontri sufficienti restano
nell’audit. Nessuna domanda, messaggio o email inviati a terzi.

Validazione locale: build, settori, regressioni dati e calendario in Chromium
1440/820/390/320 e WebKit 390 passati. Dieci schede operative su computer e
telefono senza errori o overflow. Conservati tutti i 16 ID di Como e le altre
2.853 schede, identiche. Commit `68c72cd`: Vercel riuscito, 2.936 schede
online di cui 83 di Como; SHA-256 del catalogo online identico al commit
(`f32b9f301390c525ccddd49865baa3e34427c56881cd941bcb1590098e7c3208`).
Verificati in produzione dieci dettagli a 1440 e 390 pixel, tutti i settori,
elenco completo e assenza di errori/overflow. TO DO spuntata solo dopo questi
riscontri: 19 province completate, 91 rimaste su 110. Nessun’altra provincia
avviata e nessuna comunicazione a terzi.

## Ricerca approfondita Varese — 14 ottobre 2026

81 manifestazioni in 36 comuni (prima quattro); ricerca nominale nei 136
comuni attuali. L’anagrafica conserva le tre unità precedenti a Bardello con
Malgesso e Bregano: copertura accorpata, coordinate nazionali conservate.
Archivio locale: `C:\Users\utente\Documents\ricerca-fiere-varese-20261014`;
schede, copertura comunale, manifesti fonti ed esclusioni in `fiere-varese.json`.

Esaminate le 123 righe 2026/VA del registro regionale hs8z-dcey e tutti i
programmi: 111 con testo e 12 scansioni lette visivamente. Confrontati registro
fiere locali (nessuna riga VA), registro fieristico pluriennale, calendari
Varese Welcome marzo/aprile/maggio/agosto/ottobre, Comuni, Pro Loco e
organizzatori. Calendari grafici 2026 Saronno e Cassano verificati visivamente.
74 schede con almeno una data precisa, inclusi tre soli storici 2025;
38 con contatti, tre termini assoluti e cinque indicazioni di termine.

Condizioni operative: Inarzo 15 novembre, domanda 22 ottobre, 25 €/3 metri
o 50 € doppio, esenzioni dichiarate e niente corrente; pagamento dopo
accettazione. Carnago 7–8 dicembre, gratuito, cauzione rimborsabile 10 €,
hobbisti/proprie produzioni locali, niente rivendita. Gazzada 29 novembre:
gratuito per opere proprie non professionali, fino a esaurimento, sede da
chiarire con Comune. Porto Valtravaglia 5–6 dicembre: termine 10 ottobre ore
12 già trascorso, 30 € diritti più 6,25 €/giorno per commercianti; percentuali
riservate alle categorie non sono disponibilità. Castellanza 1 febbraio:
termine 2 dicembre 2025, procedura transitoria non estesa al 2027.

Conflitti Cassano primavera e Caronno Varesino Natale conservati senza giorno
esatto. Somma centro e mostra-mercato al Castello distinte; Pan di Zenzero
accorpato nelle note. Programmi generali non equivalgono ai giorni dei banchi.
Caronno Pertusella sospeso e Music 4.0 rinviato al 2027 esclusi. Tre storici
2025 (Barasso, Cairate, Castiglione) non trasferiti al 2026. Programmi Varano
2024 e sagre senza mercato esclusi. Siti Pro Loco con contenuti estranei non
usati per candidature. Ricerca nelle fonti accessibili, non censimento
esaustivo: calendari estivi incompleti, timeout Busto, allegati Cairate con
errore interno e altri candidati da approfondire nell’audit. Nessuna domanda
o comunicazione inviata. Quattro ID precedenti e 2.788 altre schede conservati.

Validazione: build, test settori, regressioni provinciali e controlli del
calendario in Chromium 1440/820/390/320 e WebKit 390 passati; nessun errore
o overflow. Commit `2893d5d`: catalogo online identico (SHA-256), 2.869 schede
totali e 81 di Varese. Otto dettagli operativi verificati online sia a 1440
sia a 390 pixel, comprese tariffe, scadenze, storico e date discordanti.


## Ricerca approfondita — provincia di Reggio nell’Emilia, 14 ottobre 2026

**87 manifestazioni in 38 comuni**, rispetto alle 14 schede precedenti.
Scelta la prima provincia aperta nell’ordine commerciale della lista. Ricerca
nominale nei **42 comuni**, controllo di **211 schede regionali candidate**
con **47 manifestazioni valide**, approfondimenti Comuni/SUAP, IAT, Pro Loco,
Consorzio Com.Re, organizzatori e PDF. Il programma scansionato di San Luca
è stato letto visivamente su entrambe le facciate. Ricerca documentale, non
censimento esaustivo e non equivalente a contattare ciascun Comune.

Override riproducibile in `fiere-reggio-emilia.json`, con audit dei comuni,
90 fonti utilizzate con stato HTTP/hash, esclusioni e questioni residue.
Archivio locale in `Documents/ricerca-fiere-reggio-emilia-20261014`:
ricerche, pagine/PDF, immagini del programma, verifiche e schermate browser.
I numerosi download di navigazione sono solo archivio: non tutti sono pertinenti
o verificati nel merito. Il controllo degli ID regionali 1–5 per comune può
perdere numerazioni ulteriori e **non equivale al registro annuale integrale**.
Calendari IAT italiani agosto/settembre non accessibili (401); settembre
recuperato nella versione inglese con testi italiani. Nessuna domanda inviata.

**83 schede** con date precise pubblicate, una con solo periodo generale,
due con date testuali discordanti e una con sola ricorrenza. **47 schede** con
contatti e **cinque** con termini assoluti/relativi o informazioni di scadenza;
non sono cinque domande aperte. Riscontri utili:

- [Vezzano, San Martino 2026](https://www.comune.vezzano-sul-crostolo.re.it/2026/10/xxi-edizione-della-fiera-di-san-martino-modulistica-per-gli-espositori/):
  **8 novembre, 9–19**, allestimento operatori dalle 7:30. Moduli P.IVA:
  3×3 m **35 €**, 4,5×3 **40 €**, 6×3 **50 €**, 8×3 **60 €**; food **80 €**,
  elettricità massimo 3 kW; OPI/hobbisti 3×3 **20 €**, 4,5×3 **27 €**, 6×3
  **35 €**. Trattamento IVA da chiedere. Domande a M&B Group via email/WhatsApp,
  pagamento e modulo entro cinque giorni dall’accettazione. Il termine
  **28 ottobre** e lo spazio gratuito 3×3 valgono **solo per enti no profit**.
  Nei moduli P.IVA/Food è vietato usare bombole del gas: questa condizione
  specifica non è superata dalle clausole GPL del regolamento generico allegato.
- [San Martino in Rio, avviso Pro Loco corrente](https://www.prolocosanmartino.it/festa-ed-san-martein-2026/):
  **San Martein 8 novembre**, dalle 10, domande entro **2 novembre**, salvo
  esaurimento anticipato dei posti. Form distinti per ambulanti/agricoltori,
  ingegno e associazioni. Corretto il **9 novembre** del registro regionale.
- [Rolo, San Simone](https://www.comune.rolo.re.it/novita/notizie/fiera-di-san-simone-2026):
  **24–25 ottobre**, domanda entro **5 ottobre**, già trascorso, con conferma
  via email. Strutture, attrezzature e corrente non fornite. Il venerdì 23
  compare nel programma generale, senza aggiungerlo come giornata dei banchi.
  Moduli richiamati ma non recuperati; sito Roloinfesta HTTP 999 nel download.
- [Montecchio, San Simone](https://www.comune.montecchio-emilia.re.it/amministrazione/uffici/commercio/fiere/fiera-di-san-simone):
  **24, 25 e 26 ottobre** da convocazione commerciale 2026. Planimetria:
  **252 posteggi**, organico e non disponibilità corrente. Assegnazione del
  28 settembre trascorsa, graduatoria e spunta pubblicate. Regolamento online:
  domande almeno 60 giorni prima; canone e accesso residuo da chiedere al SUAP.
  Documenti GPL prima dell’evento via PEC, dove applicabili.
- [Correggio, San Luca e programma PDF](https://www.prolococorreggio.it/fiera-di-san-luca-17-e-18-ottobre-2026/):
  **17–18 ottobre**. Sabato antiquariato/ingegno, produttori e sapori;
  domenica anche fiera-mercato ambulante in viale Cottafavi **8–18**, banchi
  tematici generalmente **9–19**. Mantenuto l’ID precedente, eliminato il
  disallineamento con la vecchia pagina 2025; nessuna procedura 2025 applicata.
  Telefono Pro Loco aggiornato a **0522 705708** dalla home corrente.
- [Comune di Reggio, Giarèda](https://www.comune.reggioemilia.it/servizi/attivita-produttive-e-commercio/giareda):
  mercati **4–6 settembre**, contro il **5–9** del registro. Programma locale
  separa i banchi dalle iniziative religiose del 7–8. San Prospero resta
  **24 novembre**; la determina 2025 non è usata come nuova domanda 2026.
- [IAT ottobre](https://www.reggioemiliawelcome.it/it/eventi/calendari-mensili/ottobre-2026):
  Marola nelle tre domeniche **11/18/25 ottobre**; mercatino piemontese
  **17–18 ottobre**, Creare con Arte **17/24**, Borzano **11**, Roncaglio **18**.
- [Toano, calendario comunale 2026](https://www.comune.toano.re.it/vivere-il-comune/toano-appennino-reggiano/calendario-manifestazioni/):
  Natale **6 dicembre a Cerredolo**, **13 a Toano**; moduli, quote e ammissione
  da chiedere. Il calendario include mercato 12 luglio e usato Corneto 19 luglio.
- [Rio Saliceto, avviso aggiornato](https://www.comune.riosaliceto.re.it/it/eventi/614838):
  Passato/Arti/Ingegno **25 ottobre e 29 novembre**, con contatto piazzole e
  categorie ammesse. Non applicate le esclusioni luglio/dicembre degli aggregatori.
- [Com.Re, calendario 2026](https://www.comre.it/mercatistraordinari/390-programma-eventi-2023):
  mercati straordinari, Corso in Festa, Festa del Gusto, Robi Veci e Sabato in
  Festa; prenotazioni al Consorzio, WhatsApp solo messaggi **334 1308923**.

**Conflitti conservati:** Fiera di Maggio San Martino, **3 maggio** nel registro
contro il programma Pro Loco di fine maggio: nessuna data esatta scelta.
Antiquariato Scandiano: **17 ottobre** IAT contro ultimo sabato Com.Re; voce
testuale e conferma richiesta. Ciccioli Albinea: intestazione 24–25 ma orari
25–26, escluso finché chiarito. Giornate regionali di Cadelbosco/Castelnovo di
Sotto mantengono un avviso sulla verifica commerciale per settore. Brescello
resta mercato **1 novembre**, separato dalla festa generale 30 ottobre–2 novembre.

**Limiti e candidati esclusi:** Reggiolo San Venerio/Zucca, Novellara San Cassiano,
antiquariato Cavriago, Il Cicciolo d’Oro, Rive Vive Boretto, RiusARCI Luzzara,
Levizzano, Handmade e programmi montani richiedono altri riscontri primari sui
banchi. Natale 2025/26 non trasformato in edizione natalizia 2026. Il nuovo sito
Piante e Animali Perduti è `pianteanimaliperduti.it`, con date 26–27 settembre
2026: il vecchio dominio mantiene contenuti 2022/2025 e non fornisce le condizioni
correnti. Georgica unica scheda a Guastalla/Gualtieri; biglietti visitatori
distinti dalle quote espositori. Natura Bio ha notizie 2026 ma anche blocchi
obsoleti/link estranei: non utilizzati per quote o candidature.

Catalogo **2.792 eventi**, **2.636** con edizioni; le altre **2.705 schede sono
identiche**, tutti i **14 ID** precedenti conservati. Cache fiere.js **33**,
catalogo **26**. Verificati localmente 87 risultati e otto dettagli operativi
su desktop e telefono, senza errori o overflow. Passati build, sintassi, settori
e calendario completo su Chromium desktop/tablet/mobile e WebKit mobile.
Pubblicazione verificata: commit `da0acc0`, Vercel riuscito, catalogo online
identico al file nel commit (SHA-256
`470c97d5525bbeb220acb1c095696656ea1f231cc2776fcd3a9da1eb2b748c31`).
Verificate **87 schede** e **otto dettagli operativi** in produzione su desktop
e telefono, senza errori o overflow. Riscontri e schermate nell’archivio locale.
TO DO aggiornato: **17 province completate, 93 rimaste**; prossima Varese.
Nessun nuovo intervento automatico autorizzato.

## Ricerca approfondita — provincia di Parma, 14 ottobre 2026

**81 manifestazioni in 30 comuni**, rispetto alle nove schede precedenti.
Prima provincia aperta nell’ordine commerciale salvato. Ricerca nominale nei
**44 comuni**, approfondimenti di Comuni/SUAP, IAT, Pro Loco, organizzatori e PDF;
verificate **242 schede candidate regionali**, con **42 riscontri validi**.
Il motore regionale corrente restituisce soprattutto gli eventi futuri e non
accetta il filtro annuale tentato: il controllo degli ID noti e delle numerazioni
comunali non equivale a recuperare tutto il registro. La ricerca resta
documentale, non esaustiva, e non equivale a contattare ogni Comune.

Schede, audit dei comuni, fonti/hash, esclusioni e limiti in `fiere-parma.json`;
archivio locale in `Documents/ricerca-fiere-parma-20261014`. **76 schede** hanno
giornate precise pubblicate, due solo periodi, una data testuale e due soltanto
ricorrenze. Una scheda conserva esclusivamente l’edizione 2025; sei appuntamenti
2027 sono pubblicati espressamente, senza proiezioni automatiche. Contatti per
14 schede; sei con scadenza o termine relativo documentato, da distinguere.

Riscontri operativi:

- [November Porc, programma dell’organizzatore](https://www.novemberporc.it/it-IT/Programma.aspx):
  mercati **7–8, 14–15, 21–22 e 28–29 novembre**, dalle 9. Le serate del venerdì
  riguardano PalaPorc e ristorazione: non pubblicate come giornate dei mercati.
  Le due schede Polesine/Zibello mantengono gli ID; aggiunte Sissa e Roccabianca.
- [Bedonia, programma Tartufo](https://www.fieradeltartufodibedonia.it/page.php?idtipologia=9&idpagina=35):
  fiera e stand **17–18 ottobre dalle 9**, anteprima gastronomica del 16 separata;
  prenotazioni dei pranzi distinte dalle domande espositori.
- [Calestano, portale turistico regionale](https://emiliaromagnaturismo.it/it/eventi/calestano-fiera-tartufo-nero-fragno):
  Tartufo Nero di Fragno nelle **quattro domeniche 18/25 ottobre e 1/8 novembre**.
  Il sito storico non recuperato per errore TLS, conservato nel registro locale.
- [Parma, Natale Piazza Ghiaia](https://parmawelcome.it/evento/mercatini-di-natale-in-piazza-ghiaia/):
  **29 novembre, 6/7/8/13/20 dicembre**, 9–19; artigiani, alimentari, produttori
  agricoli e food truck. Contatti Bi&Bi, quote e scadenza espositori da chiedere.
- [Fidenza, avviso operatori 2026](https://www.comune.fidenza.pr.it/wp-content/uploads/2026/05/Avviso-manifestazione-di-interesse-espositori-gran-fiera-2026.pdf):
  operatori in sede fissa e su area pubblica, candidatura via SUAP email/PEC.
  Scheda PAC26: 235 € + IVA piccoli produttori, 440 € + IVA pacchetto vendita,
  505 € + IVA spazio food truck; altre categorie hanno quote proprie.
  PDF termine 6 settembre ore 00, pagina 7 settembre ore 00:01: conflitto
  dichiarato, entrambi trascorsi. Borgofood resta periodo 2–11 ottobre con aree
  e calendari propri, distinto dal mercato fieristico nell’area Luna Park.
- [San Giuseppe, modulo furgoni/ombrelloni](https://www.biebieventi.com/wp-content/uploads/2026/02/FURGONI-E-OMBRELLONI-2026-SANGIUSEPPE.pdf):
  **14–15 marzo**, saldo entro 20 febbraio. Non alimentari con mezzo:
  180/250 € + IVA per uno/due giorni; modulo alimentari senza somministrazione
  3×3: 80/110 € + IVA. Non generalizzare le quote alle altre categorie.
- [Borgo Val di Taro, fiere ordinarie](https://www.plborgovalditaro.it/servizio/fiere-ordinarie/):
  domanda in bollo **almeno 60 giorni prima**, graduatoria e canone superficie.
  Modulo 2027: Pentecoste 17 maggio, Patrono 19 luglio, Lorenzo 10 agosto,
  Matteo 21 settembre; non applicato retroattivamente alle procedure 2026.
- [Fontanellato, regolamento antiquariato](https://www.comune.fontanellato.pr.it/amministrazione/documenti-e-dati/regolamenti/regolamento-mostra-mercato-mercatino-dellantiquariato/):
  aggiornato nel settembre 2025; operatori del settore e hobbisti regolari,
  domanda SuapER/PEC, quota per mq. Abbigliamento/accessori databili a 50 anni.

**Limiti e conflitti da conservare:** Rocca e Natura dice seconda domenica di
dicembre ma il widget termina il 27; Fontanellato Consorzio chiama domenica
l’8 dicembre; Varsi chiama venerdì il 23 maggio. Nessuna data esatta scelta per
le voci incongruenti. Noceto resta 8 novembre da fonte regionale, senza seguire
aggregatori che indicano il giorno patronale 11. Bardi Fiera di Giugno indica
28 maggio nel registro: anomalia esplicita da verificare. Il bando tecnico Felino
è del 2021, il bando Alabastro del 2022 e il PDF Oro/Incenso del 2025: nessuna
quota o data trasferita al 2026. Lo slug Oro/Incenso ora ospita un evento di
Castell’Arquato, fuori provincia. Avviso GIA «Natale 2027» pubblicato nel 2026
escluso finché non è chiarito l’anno. Fiere Sorbolo, San Michele Roccabianca,
Trecasali, Malvasia, Pajsan, Torrile e programmi montani restano nell’audit;
appalti di gestione, semplici pasti/spettacoli e saloni industriali non trattati
come opportunità per qualunque ambulante. Nessuna domanda o messaggio inviato.

Catalogo **2.719 eventi**, 2.564 con edizioni e 2.139 con date pubblicate.
Le altre **2.638 schede sono identiche** e tutti i nove ID Parma precedenti
conservati. Build offline; cache fiere.js **32**, catalogo **25**. Pubblicazione
verificata: commit `dff6cc9`, Vercel riuscito e catalogo online identico al file
nel commit (SHA-256 `19f5f2f6a3cb09dc7b4e045fee36c5fd6622bab017ddaf6bb8a12af98d11e9bf`).
Le **81 schede** e otto dettagli operativi sono stati controllati in produzione
su desktop e telefono, senza errori o overflow. Passati sintassi, build, settori
e calendario completo su Chromium desktop/tablet/mobile e WebKit mobile.
Schermate e riscontri nell’archivio locale. Nessun nuovo intervento automatico.

## Ricerca approfondita — provincia di Modena, 14 ottobre 2026

**74 manifestazioni in 33 comuni**, rispetto alle 10 schede precedenti.
Prima provincia aperta nell’ordine commerciale della lista. Ricerca nominale nei
**47 comuni**, seguita da approfondimenti di Comuni, IAT, Pro Loco, organizzatori
e programmi/moduli PDF; **120 documenti tentati**, con hash o errore di recupero.
La ricerca è documentale, non esaustiva e non equivale a contattare ogni Comune.

Schede e audit in `fiere-modena.json`, archivio di pagine, PDF, ricerche e controlli
in `Documents/ricerca-fiere-modena-20261014`. Il portale regionale completo non
è stato recuperato: errori SSL/connessione, anche nella ricerca con filtro annuale.
Confrontato l’indice regionale e conservate le schede dello snapshot del 9 ottobre,
con aggiornamenti locali dove verificabili. Non dichiarata una ricognizione di
tutte le righe regionali. Gli altri **2.573 eventi sono identici**; totale **2.647**.
Build ripetibile, cache fiere.js **31**, catalogo **24**.

Informazioni operative:

- [Castelfranco Emilia, avviso casette 2026](https://www.comune.castelfranco-emilia.mo.it/novita/avvisi/mostra-mercato-denominata-mercatino-di-natale-in-piazza-garibaldi-anno-2026-organizzata-dal-comune-di-castelfranco-emilia):
  cinque casette, periodo **28 novembre–6 gennaio 2027**, domanda entro **17 ottobre**
  esclusivamente via PEC al SUAP dell’Unione. Il disciplinare corrente non è stato
  recuperato: niente quote/categorie dedotte dal documento 2025 delle sei casette.
- [Pievepelago, avviso della Castagna](https://www.comune.pievepelago.mo.it/notizie/AVVISO-PARTECIPAZIONE-MERCATINO-FESTA-CASTAGNA-2026.html):
  mercato **31 ottobre**, dalle 10 a tarda sera; domanda entro **27 ottobre ore 12**
  via PEC/email indicata nel PDF o protocollo. Partecipazione gratuita;
  allestimento dalle 8:30, attrezzature a proprio carico. Categorie e documenti
  distinti, somministrazione valutata dal Comune, selezione e spazi limitati.
- [Castelvetro, modulo P.IVA](https://www.visitcastelvetro.it/wp-content/uploads/2025/10/DOMANDA-COMPLETApartecipazione_Natale-P.IVA_-1.pdf):
  **8 dicembre 2026, 10–18**, domanda entro **16 novembre**, saldo entro 23 novembre
  dopo accettazione. Spazio 3×3 m **48 € IVA/CUP inclusi**, 1 kW; sconto associati
  20%. Alimentari senza somministrazione e categorie varie con P.IVA; modulo OPI
  separato. PDF ospitati sotto percorso 2025 contengono esplicitamente anno 2026.
- [Sant’Orsola Campogalliano](https://www.comune.campogalliano.mo.it/novita/notizie/fiera-di-santorsola-bando-pubblico-per-lassegnazione-di-otto-posteggi-in-piazza-vittorio-emanuele-ii/):
  **25 ottobre**, otto concessioni temporanee alimentari, tipo A/B, DURC e canone
  regolari; domanda Accesso Unitario entro **7 ottobre**, già trascorso. Lettura
  tramite indice web, download locale 404; nessuna disponibilità residua dedotta.
- [Concordia Ognissanti, aggiornamento 13 ottobre](https://www.comune.concordia.mo.it/novita/avvisi/fiera-dognissanti-2026-planimetria-del-mercato-per-gli-operatori-economici):
  **31 ottobre e 1 novembre**, aggiunta la giornata mancante; planimetria pubblicata
  e comunicazioni individuali già inviate via PEC. Mappa non prova posti liberi.
- [Modena, graduatoria fiere 2027](https://www.comune.modena.it/novita/avvisi/2026/fiera-di-s-antonio-e-s-geminiano-pubblicata-la-graduatoria-di-spunta-per-lassegnazione-temporanea-dei-posteggi-lasciati-liberi-dai-titolari):
  Sant’Antonio **17 gennaio** e San Geminiano **31 gennaio 2027**, schede distinte.
  Anno espressamente pubblicato, non proiezione automatica; graduatoria provvisoria,
  esiti definitivi e nuove domande da verificare.
- [Vignola, programma comunale](https://www.comune.vignola.mo.it/myportal/C_L885/api/content/download?id=69d4c09cdf8edd0099da79b6):
  fiori **11/12 e 18/19 aprile**, opere proprie **12/18/19**, ambulanti **12/19**.
  Sedi distinte. Non usato l’intero periodo della Festa dei Ciliegi come mercato.
- [Spilamberto, programma 2026](https://www.fierasangiovanni.it/edizioni/edizione-2026/):
  stand Rocca documentati **24–28 giugno**, orari distinti per giorno/area.
  800 e dintorni conserva quattro date esplicite e la pausa estiva.
- [Sassuolo, procedure mercati](https://www.comune.sassuolo.mo.it/come-fare-per/informazioni-sui-mercati/):
  domeniche ottobre soltanto al mattino, domanda spunta almeno 30 giorni prima;
  esposizioni giornaliere esterne al mercato con procedure separate. Mercatino
  antiquariato ammette hobbisti con tesserino e commercianti dei settori indicati.

**Limiti da conservare:** dieci scadenze documentate; quelle trascorse sono
segnalate automaticamente dal calendario. Bomporto San Martino, Natale Modena/
Castelfranco e altre rassegne restano periodi, non aperture quotidiane confermate.
Pavullo Autunno: testo domenica 18 ottobre, widget 17; usato il programma testuale,
con conflitto annotato. Approfondire Bruino Medolla, Natale nei comuni, le altre
settimane del Settembre Formiginese, calendari montani e schede regionali storiche.
Montecreto Castagna, Riccò e Riolunato Ricotta non aggiunti finché non è documentato
un mercato: gastronomia e date generali da sole non bastano. Mercanti in erba,
servizio riuso Medolla e falsi positivi di San Prospero fuori provincia esclusi.
Usatissimo esplicitamente riservato ai privati; Collezionando è un salone
specialistico, non spunta. Nessuna domanda inviata, nessun posto o ricavo garantito.

Pubblicazione verificata: commit `11dd0e4`, catalogo online identico al commit
(SHA-256 `3c4b3f83910b71b1b426b44a0e3ea36c0b408c4c121f90bf89c40d5512740f86`). Le **74 schede** sono visibili
in [/fiere?provincia=Modena](https://subingresso.it/fiere?provincia=Modena).
Passati build, sintassi, settori e controlli del calendario su Chromium
desktop/tablet/mobile e WebKit mobile, tutte le province; sette dettagli
operativi verificati anche in produzione su desktop e telefono, senza errori
o overflow. Riscontri e schermate nell?archivio locale.


## Ricerca approfondita — provincia di Vicenza, 13 ottobre 2026

**117 manifestazioni in 49 comuni**, rispetto alle 59 precedenti. Prima provincia
aperta nell’ordine commerciale salvato: bacino vicentino, fiere tradizionali e
turismo dell’Altopiano. Valutazione qualitativa per il pubblico di subingresso.it,
senza attribuire redditi, ricerche Google o conversioni non misurati.

Ricerca nominale nei **114 comuni**, confronto con tutti i **549 programmi** del
[registro Veneto aggiornato all’8 ottobre](https://www.regione.veneto.it/documents/10713/13530434/Calendario+Sagre+e+Fiere+08.10.2026.xlsx/ebd944f5-d5ec-4826-bbc4-faa0a6edce98),
calendari regionali antiquariato e fieristico e approfondimenti di Comuni, Pro Loco
e organizzatori. 89 righe incluse/consolidate; le altre 460 escluse o conservate
per approfondimento, con programma ed esito nell’audit. La ricerca nominale non
equivale a contatto diretto né dimostra assenza di eventi nei comuni senza schede.
Tutte le scelte e le note curate direttamente da Codex, senza assistenti locali.

`fiere-vicenza.json` conserva schede, copertura comunale, programmi, fonti/hash,
errori e limiti; archivi e ricerche in `Documents/ricerca-fiere-vicenza-20261013`.
Build offline ripetibile, cache fiere.js **30**, catalogo **23**. Conservati 58 ID
esistenti e aggiunti 59; esclusa la sfilata di Rossano senza mercato documentato.
Le altre **2.466 schede sono identiche**; totale nazionale **2.583**.

**55 schede con giornate precise, 20 periodi e 42 indicazioni testuali**;
48 con contatti e sei con scadenze. Ricorrenze senza calendario delle singole
edizioni restano testuali. Santorso Natale è storico 2025: nessuna data spostata
al 2026. Tre comuni unificati senza coordinate nell’anagrafica usano centri abitati
GeoNames già presenti in `data/localita.json`, collegati al codice ISTAT attuale:
Barbarano Vicentino, Molvena e Lusiana. Sono punti rappresentativi nel Comune,
non ubicazioni esatte dei banchi; anagrafica condivisa invariata.

Informazioni operative verificate:

- [Sarcedo, avviso 2026](https://www.comune.sarcedo.vi.it/wp-content/uploads/2026/09/ALL_A_AVVISO-MANIFESTAZIONE-INTERESSE-MERCATINO-NATALE2026.pdf):
  8 dicembre 9–18 circa, domanda entro **3 dicembre ore 23:59** via PEC/email o
  protocollo. Ammessi itineranti tipo B, alimentari con SCIA senza sede fissa,
  opere proprie non alimentari e associazioni. Massimo 3×3 m; suolo gratuito,
  corrente ove presente; gazebo a proprio carico. Tardive soltanto se restano
  spazi; con pioggia non si allestisce. Nessuna domanda inviata.
- [Barbarano Mossano, moduli e tariffe](https://www.comune.barbaranomossano.vi.it/home/vivere/Territorio/702--Fiera-di-Santa-Caterina-e-Tradizione-di-Santa-Caterina.html):
  **22 e 25 novembre**, con moduli distinti; almeno 60 giorni prima (calcoli
  23/26 settembre, passati). Il 22 PEC/SUAP con documento e DURC, il 25 email del
  modulo. Per uno/due giorni: ambulanti €80/€100; hobbisti, espositori e produttori
  fino a 3×3 m €25/€40; Via Zonato €65/€80. Niente corrente; PagoPA. PDF tariffe
  verificato anche visivamente, estrazione ordinata inizialmente illeggibile.
- [Asiago, ordinanza 51 del 30 aprile 2026](https://servizionline.comune.asiago.vi.it/c024009/de/attachment.php?serialDocumento=01EBAS020264U&p7m=1&mosdoc=0):
  fiere **3 giugno, 21 settembre e 2 novembre**; titolari entro 7:30, graduatorie
  aggiuntive e precari con verifica contributiva. Vendita fino a 18:30 nelle prime
  due e 18 nella terza. Il termine di 30 giorni riguarda soltanto ditte industriali
  e artigianali in Piazzetta delle Poste. 161 posteggi dichiarati, non posti liberi.
  Fonte pubblica recuperata dopo errore della catena CA, con TLS non verificato;
  nessuna credenziale utilizzata, date riscontrate anche nell’indice web.
- [Thiene Fiori e Sapori, regolamento](https://www.comune.thiene.vi.it/myportal/C_L157/api/content/download?id=69aeada3ad823f008d61cd30):
  2 maggio 15–23 e 3 maggio 9–19. Domanda almeno 30 giorni prima, scadenza
  calcolata 2 aprile; limite del 50% ai venditori professionali. Niente ristorazione
  o mescita nell’area espositori; vini/liquori sigillati. Nessuna quota fissa,
  contributo di solidarietà richiesto senza importo fissato.
- [Colceresa Ciliegia in Festa](https://www.comune.colceresa.vi.it/novita/ciliegia-in-festa-2026-domenica-7-giugno-mercatino/):
  mercato solo **7 giugno**, termine 20 maggio. Moduli separati per hobbisti e
  operatori alimentari/imprenditori agricoli; PDF via email, no foto JPEG.
- [Bostel Rotzo](https://www.bosteldirotzo.it/call-per-espositori-mercatini-estivi-2026-al-bostel-di-rotzo/):
  luglio/agosto, singole giornate non dedotte; domanda e regolamento firmati entro
  31 maggio, offerta libera. Selezione di manufatti storici e prodotti culturali;
  street food escluso salvo autorizzazione specifica.
- [Dueville](https://www.comune.dueville.vi.it/vivere-il-comune/eventi/36-mostra-scambio-citta-di-dueville/):
  pubblico **11–12 luglio**; il 10 è riservato agli espositori/allestimento.
  Prenotazione e conferma; non prenotati soltanto con spazi residui.
- [Enego](https://www.comune.enego.vi.it/novita/mercati-straordinari-il-calendario-degli-appuntamenti-di-agosto/):
  tre mercati straordinari la mattina del **9, 15 e 23 agosto**.
- [San Simeone Marostica](https://www.visitmarostica.eu/it/vivere/eventi/antica-fiera-di-san-simeone/):
  banchi **25 ottobre**; il 24 riguarda le inaugurazioni delle mostre. PDF letto.
- [Soco](https://www.fieradelsoco.it/programma-2026/): mercato **11–16 settembre**,
  ore distinte; [form espositori](https://www.fieradelsoco.it/esporre-antica-fiera-del-soco/)
  separa mercato esterno e mostra coperta con P.IVA. Recupero diretto 403,
  prove consultate tramite indice web; ricontatto 2027 non conferma date future.
- [Lonigo](https://www.fieradilonigo.it/esporre/): settore esterno con ambulanti
  distinto dal coperto; segreteria Lonigo Expo/Delphi. Date 20–23 marzo dal
  programma visitatori; nessun costo stand dedotto dall’ingresso libero.
- [Sandrigo](https://www.comune.sandrigo.vi.it/vivere-il-comune/eventi/fetsa-del-bacala/):
  Mercato Arte e Sapori il **19 settembre** dalle 16; il resto della festa
  gastronomica non diventa automaticamente calendario dei banchi.

**Limiti e prossimi aggiornamenti:** Bassano Franca/Autunno e Malo Santa Croce
rimangono piste con riscontri esterni da approfondire su fonti primarie correnti.
Recuperare calendario Vicenza/Epifania/Natale, date Recoaro e programmi Nove 403.
Il dominio nonholeta.it restituisce contenuti estranei: scartato, usate fonti
comunali/regionali. Vecchio calendario Vicenza reindirizza alla homepage; non
usato come prova. Mercatino scolastico Mussolente, festa Salcedo senza banchi,
VIOFF e saloni industriali senza opportunità pertinenti esclusi. Gli appuntamenti
di hobbisti/opere proprie non garantiscono ammissione di rivenditori professionali.
Nessuna disponibilità, ammissione, proroga o ricavo garantiti.

**Pubblicazione verificata:** commit `b7f1e13`, Vercel riuscito, catalogo online
identico al contenuto del commit (SHA-256
`d10c60628c69a143205f8aafb4cb9596e266650d5dc8c324099c2f332a354c75`).
[/fiere?provincia=Vicenza](https://subingresso.it/fiere?provincia=Vicenza):
117 schede, verifica Chromium desktop/telefono con sei dettagli operativi,
caricamento completo, quattro filtri merceologici, nessun errore o overflow.
Prima del push passati build, sintassi, controlli dati/settori e calendario
Chromium desktop/tablet/mobile e WebKit mobile su tutte le province.
Riscontri e schermate conservati nell’archivio locale della ricerca.

## Prova ibrida per comune — Gattinara, 13 ottobre 2026

Tre schede aggiunte: **Fiera di San Martino**, **Mercatino Rosa e Rosso di Maggio**
e **LUVA · Festa dell’Uva**. È una ricerca sul solo comune di Gattinara,
non sull’intera provincia di Vercelli. Nessun nuovo articolo di blog.

`fiere-comuni.json` conserva fonti, hash, problemi e approvazione Codex.
Il build applica questi audit al singolo comune dopo gli override provinciali,
senza modificare gli altri eventi. Codex sceglie le fonti, verifica dati e
ammissioni e decide l’inclusione. Il programma assegna gli ID delle prove,
estrae i contatti e controlla i doppioni; Qwen3.8-27B Q6 individua i passaggi
pertinenti e prepara note di poche frasi. Sei richieste locali concluse in
circa 250 secondi: tre ricerche di prove e tre note; due note conservate
integralmente, una ritoccata per ridurre le frasi e chiarire l’edizione conclusa.
Questi esiti non certificano accuratezza generale o risparmio cloud.

- [San Martino, avviso comunale](https://comune.gattinara.vc.it/Dettaglionews?IDNews=416044):
  10 novembre 2026, 8–18; domanda entro 16 ottobre solo sportello SPID/CIE;
  nessuna spunta. Concessionari del martedì mantengono il posto. Stalli 45 m²,
  10 × 4,5 m; PagoPA entro 2 novembre, importo non pubblicato.
- [Rosa e Rosso, mercatino](https://visitgattinara.it/notizie/iscrizione-mercatinini-rosa-rosso-maggio-2026):
  30–31 maggio 2026; termine 15 maggio. Quote distinte per hobbisti,
  somministratori e associazioni, non generalizzate agli ambulanti professionali.
  Corrente non fornita e bombole vietate. Edizione conclusa e vecchi moduli 404.
- [LUVA, iscrizioni espositori](https://visitgattinara.it/notizie/luva-2026-iscrizioni-aperte):
  4–6 settembre è il periodo della festa, non una conferma delle singole
  giornate dei banchi (`periodOnly`). Termine, quote e categorie non documentati;
  vecchio modulo 404. Nuove edizioni da verificare, nessuna iscrizione aperta inferita.

**Limiti:** ricerca documentale non esaustiva, calendario regionale PDF non
recuperato integralmente e Natale 2026 non confermato nelle fonti selezionate.
Nessun posto libero, ammissione o ricavo garantiti; nessuna domanda inviata.
Codice, fonti complete, risposte locali e contabilità fuori repository:
`Documents/AI-Fiere-Gattinara-20261013`. Invio dei microtask ora diretto via API
autenticata: nessuna nuova sessione cloud per ogni richiesta locale.

Ricontrollata anche la produzione: il precedente catalogo Padova è ora online
con 2.491 schede e 95 eventi di Padova; i deployment GitHub/Vercel risultano
riusciti. La segnalazione di pubblicazione pendente del 12 ottobre è storico.

## Ricerca approfondita — provincia di Padova, 12 ottobre 2026

**95 manifestazioni in 41 comuni**, rispetto alle 11 schede precedenti.
Scelta della prima provincia aperta nel TO DO, coerente con la priorità commerciale
del Nord: mercatini, bacino padovano e turismo termale. È una valutazione qualitativa
del progetto, senza inventare volumi Google, redditi o conversioni provinciali.

Esaminate le **167 righe provinciali** del registro Veneto aggiornato all’8 ottobre,
i calendari regionali antiquariato, mercati e manifestazioni fieristiche, con
approfondimenti su Comuni e organizzatori. Ricerca nominale sulle 102 chiavi del
dataset geografico, più il nuovo Comune di Santa Caterina d’Este: **101 comuni
attuali**, perché Carceri e Vighizzolo d’Este sono località del Comune unificato.
La verifica nominale non implica contatto diretto con tutti i Comuni o assenza
di eventi dove non sono emersi riscontri. L’anagrafica nazionale non è stata modificata.

`fiere-padova.json` conserva fonti per scheda, audit comunale, esito di tutte le
righe (38 incluse, 17 da approfondire, 112 escluse), 46 documenti/fonti con hash
o errore di recupero e limiti della ricerca. Archivi e ricerche complete fuori
repository: `Documents/ricerca-fiere-padova-20261012`. Non tutte le pagine
scaricate sono pertinenti; i documenti dell’audit selezionano le fonti utilizzate.

Le schede comprendono **51 manifestazioni con giornate precise, 33 con periodi
e 11 con indicazioni testuali**, 43 contatti e nove scadenze documentate.
Otto schede restano esclusivamente storiche 2025–2026: nessuna data natalizia
trasferita automaticamente al Natale 2026–2027. I saloni AEFI sono distinti dai
mercati ambulanti; i loro periodi non garantiscono apertura quotidiana.

Correzioni e informazioni operative:

- [Piove di Sacco](https://www.comune.piovedisacco.pd.it/index.php/it/news/2027661):
  bancarelle il 31 ottobre, 1, 8, 11, 14 e 15 novembre; franca e bestiame l’11.
  Domanda precari entro 11 settembre, bollo 16 € e istruttoria 50 €, oltre al canone.
  La procedura per esposizione senza vendita è distinta; PDF letto tramite
  indicizzazione web, download diretto 403.
- [Arsego](https://www.fieradiarsego.it/programma-2026/): mercato 17–19 ottobre
  e pomeriggio del 20, distinto dall’Expo e gastronomia del 16. Avviso ambulanti:
  termine 31 agosto ore 13. Il listino Expo collegato alla pagina 2026 è del 2025,
  quindi non usato per attribuire tariffe ambulanti correnti.
- [Festa dei Bisi, Baone](https://www.festadeibisi.it/espositori/): espositori
  soltanto 16 maggio pomeriggio e 17 maggio, rispetto al periodo regionale
  22–26 maggio. Termine 30 aprile; 30 € hobbisti/associazioni 3×3 m,
  50 € attività con partita IVA fino a 5×3 m. Vendita bisi e somministrazione
  riservate ai soggetti indicati nel regolamento; iscrizioni chiuse.
- [Saonara](https://www.prolocosaonara.it/mostra-mercato-del-florovivaismo-2026/):
  mostra mercato professionale il 10 maggio, distinta dal mercatino ragazzi del 9.
- [Rustega](https://www.rustega.it/site/wp-content/uploads/2026/02/Domanda-Partecipazione-Fiera-della-Zootecnia-di-Rustega-Edizione-2026.pdf):
  mercato il 3 maggio, termine 10 marzo via email; i giorni del Galà equestre
  non sono giorni dei banchi. Campodarsego Angelo: 6 aprile, termine 10 marzo,
  richieste tardive valutate solo secondo disponibilità e ordine di arrivo.
- [Vo’ San Lorenzo](https://www.comune.vo.pd.it/novita/fiera2025-copy/):
  8–10 agosto, non 7–10; adesione entro 24 luglio a Vivere in Arte.
- [Battaglia Terme](https://www.comune.battaglia-terme.pd.it/vivere-il-comune/eventi/%F0%9F%8C%9F-antica-fiera-di-san-bartolomeo-2026-%F0%9F%8C%9F/):
  banchi San Bartolomeo il 22 agosto, distinta dalla festa 20–23; termine 31 luglio.
- [Gazzo, programma PDF](https://www.comune.gazzo.pd.it/wp-content/uploads/2025/09/Promo-Fiera-franca-2026-9.pdf):
  mostra mercato l’11 ottobre. Il “12” nella pagina comunale è incoerente;
  il 5 ottobre riguarda il raduno mezzi, non una domanda per ambulanti.
- [Bertipaglia](https://www.comune.masera.pd.it/vivere-il-comune/eventi/bertipaglia-dautunno-2026/):
  espositori domenica 18 ottobre; moduli e termine 16 ottobre sono per bambini
  e ragazzi, senza attribuirli ai professionisti. Cittadella Franca 24–26 ottobre:
  bando con termine 30 settembre soltanto per esposizione senza vendita.
- [Tarvisium Celtica](https://www.tarvisiumceltica.it/tarvisium-celtica/):
  organizzatore 17–19 luglio prevale sui due calendari regionali discordanti.
  Noventa Folpo: periodo comunale aggiornato 22–27 ottobre, non 21–26;
  giornate effettive degli ambulanti ancora da verificare.

Mercatini antiquariato: escluse le pause regionali di agosto a Cadoneghe/Padova
e luglio/agosto a Montagnana; dieci ricorrenze provinciali approfondite.
Cittadella indica il servizio di partecipazione «momentaneamente sospeso»:
conservata ricorrenza testuale, senza pubblicare giornate precise o dedurre
la cancellazione della manifestazione. Pontebello: procedura pubblicata per
hobbisti, non automaticamente applicabile ai professionisti. Montegrotto:
otto mostre mercato speciali, oltre alla ricorrenza dell’antiquariato.

**Limiti:** restano segnalazioni importanti in `research.unresolved`, tra cui
San Luca Camposampiero, Montagnanese, Polverara, alcune rassegne di Arzergrande,
programmi soltanto in immagini, Natale e nuove ammissioni professionali.
Nessun posto disponibile o partecipazione garantiti; nessuna domanda o messaggio
inviati. Completare o aggiornare questi riscontri su richiesta.

Build: 2.491 eventi nazionali, 2.336 con edizioni e 1.961 con date pubblicate;
tutte le altre province identiche al catalogo precedente. Cache fiere.js v=27,
JSON v=20. TO DO: 12 province completate, 98 mancanti; prossima Treviso.
Verificati build, classificazione dei settori, regressioni sulle date e sulle
procedure di Padova e suite calendario completa: Chromium 1440/820/390/320 px,
WebKit 390 px, filtri di tutte le province, lista/mappa, dettagli, tastiera,
gestione errori e assenza di overflow. Confronto prima/dopo sulle altre province
superato. Modifiche precedenti dell’utente escluse dal commit.

**Pubblicazione non ancora verificata — 12 ottobre 2026:** commit `61503dc`
inviato a `main`, ma dopo i tentativi di verifica il dominio continua a servire
il catalogo dell’11 ottobre con 11 schede di Padova. GitHub non mostra stato,
check o deployment Vercel per il nuovo commit; quello precedente risulta
pubblicato correttamente. Identità autore invariata. La CLI Vercel non ha una
sessione autenticata; il login automatico è stato interrotto, senza cambiare
configurazioni di hosting. Il vecchio collegamento locale `.vercel/project.json`
indica `subingresso.it`, mentre lo stato GitHub precedente rimanda a `subingresso`:
non usarlo per un deploy manuale senza verificare il progetto corretto.
Controllare integrazione GitHub/Vercel e pubblicare il catalogo, poi verificare
95 schede e hash dell’asset; script di verifica nell’archivio esterno. Nessun
annuncio, account, database o configurazione di produzione modificati.

## Verona: ricerca approfondita — 11 ottobre 2026

75 manifestazioni in 36 comuni, rispetto alle 20 precedenti. Ricerca nominale
nei 98 comuni, esame di 277 segnalazioni del registro sagre Veneto aggiornato
all’8 ottobre, calendari fieristici, antiquariato e mercati; approfondimenti
su Comuni, organizzatori e portali istituzionali. `fiere-verona.json` conserva
copertura comunale, esiti delle righe regionali, hash dei sei documenti scaricati,
fonti, esclusioni e conflitti. Ricerca documentale non esaustiva; nessuna misura
di volumi Google o ricchezza e nessuna garanzia di posteggi disponibili.

- Tregnago: fiera l’8 e 11 novembre, senza banchi il 9/10. Avviso per categorie
  specifiche, domande entro il 25 ottobre; tariffa per m², bollo e pagoPA.
- Garda: pagina aggiornata con termine 15 ottobre, ma frase residua dopo il
  2 ottobre subordinata alla disponibilità. Segnalato il conflitto in scheda;
  allegato DOCX 403, costi e giornate delle casette ancora da confermare.
- San Zeno di Montagna: sette giornate esplicite di mostra mercato, non l’intero
  periodo della festa. Il 22/23/30 ottobre non è confermato un mercato.
- Sommacampagna Slow Food: calendario febbraio–dicembre con 21 giornate,
  aprile solo il 19; produttori selezionati. Villafranca antiquariato: dieci date,
  esclusi luglio e agosto. Ricorrenze generiche non trasformate in date esatte.
- Fiera del Riso: 17 settembre–13 ottobre dell’organizzatore prevale sul vecchio
  intervallo regionale. Natale Bardolino: 21 novembre–6 gennaio 2027 del portale
  territoriale. Taste of Earth e primo giorno Miele Lazise conservano i dubbi.
- Periodi complessivi di sagre e mercatini stagionali con `periodOnly` quando
  manca il dettaglio dei banchi. Vinitaly e altre fiere specializzate richiedono
  contratti espositivi; non sono bandi ambulanti aperti. Ingresso del pubblico
  distinto dal costo del posteggio. Esclusi mercatini dei bambini, beneficenza,
  usato riservato ai privati di Pescantina e saloni B2B non pertinenti.

Tutti i 20 ID preesistenti sono mantenuti; tutte le altre province restano
identiche. Catalogo: 2.407 manifestazioni, 2.250 con edizioni, 1.917 con date
pubblicate. Cache fiere.js v=26, JSON v=19. TO DO: 11 province completate,
99 mancanti; prossima priorità Padova.

## Bergamo: ricerca approfondita — 11 ottobre 2026

80 manifestazioni in 42 comuni, rispetto alle 33 schede precedenti. Ricerca
nominale nei 243 comuni, confronto con 261 righe regionali e download dei
261 programmi. Audit comunale, fonti, documenti, esclusioni e dubbi conservati
in `fiere-bergamo.json`; 40 schede con contatti e cinque con scadenze pubblicate.
Scelta della prossima provincia prioritaria del Nord nel TO DO: bacino commerciale
e turistico, senza attribuire volumi Google o disponibilità di posteggi misurati.

- Albino: fiera solo il 9 e 11 ottobre; Palosco Natale il 6, 13 e 20 dicembre.
- Clusone Natale: 28 giornate esplicite dal 21 novembre al 6 gennaio 2027,
  escluso Natale; domande entro l'11 ottobre 2026. Regolamento con requisiti,
  minimi di partecipazione, tariffe più IVA e cauzione, distinti dall'ingresso.
- Candelora Almenno San Salvatore: bando decennale; Bonate Sopra Ghiaie,
  Ardesio Apparizione e Fiorano San Bernardino con termini specifici pubblicati.
- Mercatanti è selezionata; Campionaria, Creattiva e Sant'Alessandro richiedono
  rapporti con organizzatori espositivi, senza presumere accesso tramite spunta.
- Castione Natale conserva lo storico 2025–gennaio 2026. Leffe Monte Croce
  rimane senza date per incongruenze; tre periodi generali sono `periodOnly`.
- Esclusi Leffe San Rocco senza evidenza di bancarelle professionali, eventi
  annullati e mercatini solo hobbistici. Calcio Pasquetta e altre incongruenze
  rimangono nell'audit per verifica, senza trasformarle in date confermate.

Ricerca documentale non esaustiva: 23 programmi con poco testo o scansioni
non verificati visivamente; alcuni siti rispondono 403 e sono consultati tramite
indicizzazione. Le ricerche per comune sono svolte in gruppi: i link dei risultati
di gruppo non certificano una fonte specifica per ciascun comune. Preservati
32 ID precedenti e tutte le 2.272 schede delle altre province. Catalogo totale
2.352 eventi, 2.192 con edizioni. Cache fiere.js 25 e fiere.json 18.

## Milano: ricerca approfondita — 11 ottobre 2026

83 manifestazioni in 47 comuni (prima 15). Ricerca nominale nei 133 comuni;
confronto con 140 righe del calendario regionale sagre 2026 e tre fiere locali.
Tutti i 140 programmi regionali scaricati; estrazione testuale disponibile,
ma alcuni caratteri non leggibili: non dichiarata verifica visiva integrale.
Audit di fonti, documenti, comuni, esclusioni e dubbi in `fiere-milano.json`.
Scelta coerente con il bacino milanese e la priorità già indicata nel TO DO;
nessun volume di ricerca Google misurato. Ricerca documentale non esaustiva.

- Nove fiere comunali di Milano dal calendario ufficiale 2026, con scadenze
  per la domanda distinte dalle graduatorie. Oh Bej! Oh Bej! 5–8 dicembre,
  domanda entro 6 ottobre, già trascorso alla verifica. I PDF FareImpresa
  restituiscono 403 al download: consultata l’indicizzazione delle fonti ufficiali.
- Naviglio Grande: 13 giornate pubblicate, inclusa 8 febbraio straordinaria;
  dicembre il 20, senza calcolare l’ultima domenica. Fiori e Sapori 12 aprile/4 ottobre.
- Paderno primavera: mercato 22 marzo, non tutto il festival 21–23 marzo.
  Assago Natale: 13, 19 e 20 dicembre, senza intervallo continuo.
- Melegnano Perdono: bancarelle 2, 5 e 6 aprile; domanda ambulanti 31 gennaio,
  espositori/associazioni 6 marzo. Motta fungo: mercato 27 settembre.
- Magenta Curiosità: escluso 4 luglio annullato; mantenuto 14 novembre pubblicato.
  Gaggiano: bancarelle 4 ottobre, tariffa commerciale 30 €/20 € secondo residenza;
  ingresso libero ai visitatori non equivale a posteggio gratuito.
- Rosate: 30 posteggi totali, domanda 31 marzo, spunta solo per concessionari assenti.
  Castano: termine prorogato 18 settembre. Rescaldina: 30 settembre pagamento,
  non domanda. Lainate Manzetta attribuita a Lainate anche se annunciata da Rho.
- I periodi generali con giorni dei venditori non definiti sono `periodOnly`;
  Legnano e Nerviano restano testuali senza calcolare date o termini 2026.
  Artigiano in Fiera è una selezione espositiva, distinta dalla spunta comunale.

Non inclusi concerti, feste con sola ristorazione, mercatini esclusivamente
hobbistici senza evidenza professionale, date ricavate soltanto da ricorrenze.
EcoFesta Paderno, Olcella e Notte Bianca Gorgonzola hanno incongruenze conservate
tra i dubbi. Altre segnalazioni e grandi saloni restano da approfondire.
Nessuna scheda garantisce un posto libero; chiedere categoria, requisiti,
assegnazione e preventivo. Preservati gli ID delle 15 schede precedenti e
tutte le altre province. Build e test calendario/settori/browser richiesti.

## Bologna: ricerca approfondita — 11 ottobre 2026

65 manifestazioni in 39 comuni, rispetto alle 15 schede precedenti. Controllate
le fonti per tutti i 55 comuni; 36 schede con contatti pubblicati.
Fonti curate, audit comunale, hash dei documenti, esclusioni e dubbi in
`data/fiere-bologna.json`. Build offline: `python scripts/build-fiere.py`.

Scelta nel Nord con bacino commerciale/fieristico e capacità di spesa rilevanti:
[indicatori metropolitani](https://inumeridibolognametropolitana.it/sites/inumeridibolognametropolitana.it/files/altri_temi/altri_temicm/fragilita_2025cm.pdf).
L’ordine delle province mancanti nel TO DO privilegia utilità per ambulanti,
bacino, spesa/turismo e vicinanza alla Lombardia; è una stima, senza volumi
Google provinciali verificati. Dopo Milano, completate 9 province su 110.

- Santa Lucia: vendita 6 novembre–27 dicembre 2026; escluso l’allestimento.
- Porta Galliera: 19 novembre 2026–6 gennaio 2027, una sola edizione.
- Tartòfla: otto giornate esplicite in quattro fine settimana; nono giorno non
  dedotto. Sasso Marconi: due fine settimana, consolidate le due denominazioni.
- Crevalcore riuso: PDF annuale controllato visivamente, novembre domenica 22.
- Mercanti all’Alberino: sette giornate pubblicate, incluso 8 dicembre.
- Dolce Fiera: mercato venerdì 5 giugno, non tutto il programma 5–6 giugno.
- Beata Vergine del Sasso: mercatini 30–31 maggio, escluso il ristoro del 29.
- Carmine: mercato straordinario 19 luglio. Ricorrenze mensili senza elenco
  annuale conservate testuali; periodi complessivi distinti dai giorni di mercato.
- Artigiani, hobbisti, produttori ed espositori distinti dagli ambulanti;
  nessuna disponibilità di posteggio dedotta dalle bancarelle.

Ricerca documentale non esaustiva. Portale regionale non recuperabile in modo
completo: mantenuti snapshot precedenti, integrate fonti comunali/metropolitane.
PDF scansione non tutti verificati; allegato Sala Bolognese e regolamento
Monghidoro storici non usati come nuove condizioni 2026. Fonti discordanti
segnalate (Peonia, Fontanelice, Fior di Fiera, orari Mastri). Eventi senza
commercio esterno, mercati ordinari e Tartufeste senza dettaglio commerciale
conservati nelle esclusioni/da approfondire. Saloni BolognaFiere richiedono
ricerca separata; non trattati automaticamente come posteggi ambulanti.

Catalogo attuale: **2.237 manifestazioni**, 2076 con dati di edizione e
1784 con almeno una data esatta pubblicata, in 20 regioni.
Controlli: build, settori, regressioni provinciali e browser del calendario.


## Ricerca approfondita — provincia di Prato, 11 ottobre 2026

Sette comuni controllati, 38 manifestazioni (prima zero): Prato 23, Carmignano 3,
Montemurlo 4, Poggio a Caiano 2, Vernio 4, Vaiano 1, Cantagallo 1.
Audit riproducibile, fonti per scheda ed esclusioni in `data/fiere-prato.json`.
`python scripts/build-fiere.py` sostituisce solo questa provincia, lasciando
intatti gli altri override e gli import nazionali. Totale: 2.187 manifestazioni.

Fonti principali: [Comune di Prato](https://www.comune.prato.it/it/per-i-cittadini/tempo-libero/partecipare-mercatini-fierucole/pagina4191.html),
comunicati mensili e cartellone Tempo Libero, Comuni, Pro Loco e organizzatori.
[Carmignano](https://prato.confesercenti.it/wp-content/uploads/sites/6/2026/09/AVVISO-PUBBLICO-FIERA-DI-CARMIGNANO.pdf):
13 concessioni decennali, domande 6–31 ottobre, due riserve, massimo due posti;
ricorrenza della fiera testuale, senza inventare programma operativo.

- Bigonge: ordinanza sposta 10–11 ottobre al 19 settembre; ottobre eliminato.
- Mercatale Viva: giornate distinte, nessun intervallo continuo tra le domeniche.
- Mercato Europeo: organizzatore 10–13 settembre, comunicati 11–13; conflitto esplicito.
- San Giuseppe Vernio: mercato 10 maggio, esclusa la giornata collaterale del 9.
- Sapori e Saperi: terza domenica nel calendario viabilità 2026, febbraio–dicembre
  senza agosto; nessuna proiezione su altri anni. Natale Montemurlo: 20 dicembre.
- Novecento: sede/ricorrenza discordanti, mantenute testuali da riconfermare.
- Poggiole Natale: 5–6 dicembre da fonte specialistica, calendario provvisorio;
  candidatura indicata entro 15 novembre, tariffe e dotazioni riferite al 2026.
- Beer Festival e Sant'Anna: bancarelle documentate dalla stampa locale;
  partecipazione professionale e disponibilità da verificare direttamente.

Ricerca documentale, non censimento esaustivo né garanzia di posti. PDF annuali
Prato non recuperati; utilizzati comunicati, cartellone e ordinanze accessibili.
Esclusi mercati ordinari, beneficenza e sagre con solo ristoro. Da aggiornare
Comeana, Festa dell'Olio, Assedio e Natale dove manca un programma commerciale
2026 verificabile; non trasferiti dettagli 2025. Nessuna data 2027 dedotta.
Controlli: build, settori e regressioni delle date/scadenze; browser del calendario.

Pagina pubblica `/fiere`, senza database né servizi cartografici a pagamento.

Aggiornamento dell’11 ottobre 2026: 2.149 manifestazioni in 20 regioni, 1.988 con dati
di edizione e 1.715 con almeno una data esatta pubblicata. La selezione originaria
di 200 eventi è integrata da calendari regionali ufficiali e approfondimenti
presso Comuni e organizzatori. La ricerca provinciale approfondita di Brescia
comprende 206 manifestazioni in 86 comuni, rispetto alle precedenti 50 schede.
La copertura nazionale resta parziale: gli import regionali non equivalgono
a una ricerca approfondita completata per ogni provincia.

Le date `confirmed` provengono da programmi o avvisi locali pubblicati; le date
`calendar` da calendari regionali. Questo distingue le fonti, senza garantire
che l'evento non subisca variazioni. Le ricorrenze testuali restano testuali:
non si trasformano regole come «ultima domenica di giugno» in date inventate.
Gli intervalli complessivi dei mercatini periodici sono marcati `periodOnly`:
non indicano attività quotidiana e non vengono conteggiati come date esatte.
Gli appuntamenti distinti sono edizioni separate della stessa manifestazione,
non un periodo continuo. Le date passate e i termini scaduti sono segnalati
dinamicamente secondo il giorno corrente in Italia. Le date non vengono
proiettate al prossimo anno. Per le schede senza edizione restano mesi
indicativi e una richiesta esplicita di verifica.

Luoghi, orari, settori, organici e contatti sono quelli dichiarati nelle fonti,
quando disponibili. Possono riferirsi al programma complessivo e non a tutti
i singoli giorni di vendita. Il numero dei posteggi non è disponibilità residua.
Le procedure specifiche, i costi e le scadenze hanno una fonte dedicata; negli
altri casi la scheda chiede di contattare l'organizzatore/SUAP. Un link a un
avviso scaduto non viene presentato come domanda aperta.

## Filtri per settore merceologico — 10 ottobre 2026

### Tipologie di articolo e selezione multipla — 17 ottobre 2026

Su richiesta, filtro principale «Tipologia di articolo» tra «Cosa vendi» e
«Tipo di evento»: 31 scelte in sei gruppi, checkbox combinabili anche tra
gruppi diversi. Le tipologie selezionate sono in **OR**; settore, territorio,
mesi, evento e testo rimangono in **AND**. Contatori delle opzioni calcolati
senza il filtro articoli, rispettando gli altri filtri. Scelte visibili e
rimuovibili singolarmente; «Deseleziona tutte» riguarda soltanto gli articoli,
«Azzera filtri» azzera tutto. Con un macrosettore si mostrano le tipologie
pertinenti e si eliminano le selezioni incompatibili. URL `articoli=id,id`,
valori ripetuti/ignoti scartati e selezione conservata al ricaricamento.

Classificazione condivisa browser/SSR in `articleTypes()` di `fiere.js`,
esclusivamente sul campo `sectors` già documentato. Nessuna attribuzione dal
nome, da «merci varie», da artigianato generico o dalla categoria evento.
Esclusioni esplicite ignorate; divieto di somministrazione distinto dalla
vendita documentata. Copertura iniziale: **1.512 su 4.322 schede**; intimo e
detergenti non hanno ancora riscontri espliciti. Non è una nuova ricerca né
garanzia di ammissione. Catalogo, ID, fonti e macrosettori invariati. Dettagli
nel dialog e nelle pagine autonome allineati; menu scorrevole che si apre
verso lo spazio disponibile, checkbox e rimozioni alte almeno 44 px.

Cache JS72/CSS25, JSON51 invariato. Test dedicato
`scripts/test-fiere-articles.cjs` (opzionali `PLAYWRIGHT_MODULE`,
`FIERE_TEST_BASE_URL`, `FIERE_ARTICLES_OUTPUT`): classificazioni, esclusioni,
OR/AND, conservazione catalogo, URL/ricaricamento, reset, tastiera, elenco,
mappa, schede e overflow su Chromium 1440/820/320×568 e WebKit390.
Schermate in `Documents/verifica-filtri-articoli-20261017/`.
Verifiche locali passate: test dedicato, suite generale calendario su cinque
formati/browser, 4.322 pagine/1.625 sitemap, settori e sintassi. Backup tag
remoto prima delle modifiche; cleanup locale con errore PowerShell noto.
Pubblicato `663df3f`, Vercel riuscito
`8NTFyGveCu85Amu589Fu5YYDZGem` (stato GitHub/Vercel success).
HTML, JS72, CSS25 e catalogo pubblico identici ai locali dopo normalizzazione
CRLF/LF. Test dedicato passato anche online nei quattro formati/browser;
riga «Tipologie di articolo» verificata nella pagina autonoma pubblica.
Esiti di pubblicazione e copertura in `pubblicazione.json`/`copertura.json`
nella cartella delle prove. Nessuna modifica al DB o comunicazione a terzi.

### Affinità articolo — 17 ottobre 2026

Intervento successivo spazi filtri: campi principali in2×2, oppure etichetta
96px/campo sui telefoni e nei pannelli tablet stretti. Ridotti margini,
padding e titoli, mantenendo controlli/mesi ≥44px e il menu articoli aperto
senza overflow. CSS28, JS74 e JSON51 invariati. Suite articoli sui quattro
formati/browser passata; confronto sette casi in
`Documents/verifica-spazi-fiere-20261017/misure.json`: a697px altezza
613→395; a390px613→445, a320px519→495. Ricerca di una valutazione
articoli più precisa in corso separatamente: nessun nuovo punteggio in
questo intervento di sola disposizione dei filtri.

Richiesta: stima prudente di pertinenza dell’articolo, su10, nella parte
destra delle anteprime e con colori rosso→verde. Nessuna previsione di
vendite, incassi, affluenza, concorrenza o ammissione. Algoritmo editoriale
trasparente `articleAffinity()`/`articleAffinitySummary()` in fiere.js:

- **8:** articolo esplicitamente citato, soli prodotti della stessa famiglia
  e assenza di indicazioni di offerta generica; **7:** citato tra merci varie
  o settori diversi; **6:** famiglia merceologica vicina, articolo non citato.
- **2:** esclusione esplicita dell’articolo/settore o solo settore opposto,
  senza ambiguità su operatori/aree/eccezioni; fonte HTTPS con data valida
  non futura, consultata entro180 giorni, edizione ancora attuale/futura.
- Mancanza di prove, limiti per hobbisti/operatori/aree, vecchie edizioni o
  fonti non recenti: **Da valutare**, senza voto né rosso. Divieti di sola
  somministrazione non escludono la vendita. Nessun negativo dal nome o dal
  tipo evento; non assegnati9/10 o10/10 senza ulteriori evidenze.

Filtri articoli precedenti conservati: elenco selettivo invariato. Con più
articoli il riquadro mostra il migliore con dicitura «Migliore su N»; dialog
accessibile con tutti i singoli voti, motivi, fonte/testo originale, scala e
limiti. Nessun articolo: pulsante «Scegli articolo» apre il filtro. Target
almeno44 px e contrasto ≥4,5:1. Nessuna modifica a catalogo, ID o fonti.

Controllate133.982 coppie (4.322×31): 7 voti2, 7.243 voti6, 1.558 voti7,
888 voti8 e124.286 senza voto. I sette negativi sono i soli articoli
alimentari a Natale Cento: la fonte regionale 2026, ricontrollata HTTP200
il17 ottobre, conferma «previsto misto ma attualmente solo settore non
alimentare». Prato Sesia: limitazioni reali ma edizione conclusa11 ottobre,
quindi nessun negativo trasferito al futuro. TUTTOMELE: regole hobbisti
non generalizzate alle bancarelle. Questi conteggi non sono nuove ricerche.

Cache JS73/CSS26, JSON51 invariato. Test dedicato
`scripts/test-fiere-affinity.cjs`: unità, freschezza/eccezioni, tutti i valori
del catalogo e browser Chromium1440/820/320×568 + WebKit390 passati.
Regressioni articoli sui quattro formati, affluenza sui tre formati e suite
generale calendario320 passate; schermate in
`Documents/verifica-affinita-fiere-20261017/`. Backup remoto verificato
`backup/session-20261017-221322-affinita-articolo-fiere`; script interrotto
dal noto wrapping PowerShell sullo stderr nativo, tag remoto presente.
Pubblicato `bf960e2`, Vercel riuscito
`4Dd19MfhDceoL3Br6qebWVKzbb73`; HTML, JS73, CSS26 e JSON51 identici ai
locali normalizzando CRLF/LF. Test dedicato passato anche online nei quattro
formati/browser; voti reali verificati e fixture isolate per rosso/incertezza,
senza scrivere dati di prova. Esiti e fonte Cento nella cartella delle prove.

### Macrosettori

Quattro macro categorie: alimentare, non alimentare, antiquariato e vintage,
artigianato (incluse creazioni e hobbistica). `merchandiseSectors` è un elenco:
una fiera mista compare in tutti i settori documentati; antiquariato e
artigianato rientrano anche nel non alimentare. La classificazione è ripetibile
nel build, partendo dai settori della fonte; quando mancano o sono generici,
si usano soltanto temi espliciti nel nome della manifestazione. Nessuna
deduzione dal tipo sagra/fiera/mercatino. “Misto” e “merci varie” da soli non
provano la presenza di alimentari. Le schede senza indicazioni sufficienti
restano in “Tutti i settori”, senza attribuzioni ipotetiche. I divieti di
somministrazione non escludono la vendita alimentare; rimangono visibili
i vincoli originali nella scheda e le regole di ammissione dell’organizzatore.

Filtro principale “Cosa vendi” su elenco, mappa e conteggi dei mesi; URL
`settore=alimentare|non-alimentare|antiquariato|artigianato`, combinabile con
provincia, mesi, tipo evento e ricerca. Test della classificazione:
`python scripts/test-fiere-sectors.py`; regressioni browser e catalogo:
`node scripts/test-fiere.cjs`. Cache fiere.js 20, fiere.json 13.

## Calendari importati

- [Lombardia — Sagre e fiere su area pubblica](https://www.dati.lombardia.it/Commercio/Sagre-e-fiere-su-area-pubblica/hs8z-dcey),
  dataset CC0 1.0, API filtrata per anno 2026 e tipo Fiera. Importate 227 righe;
  esclusi concerti, pasti privati e voci senza indicazione di fiera/mercato.
  Ogni scheda conserva il collegamento al programma regionale.
- [Piemonte — Sagre e fiere mercato 2026](https://www.regione.piemonte.it/gestione/commercio/fiere/find.php?fine=1000&inizio=0&mese=-1&provincia=-1&qualifica=-1&scelta=2),
  375 righe importate dopo la risoluzione dei comuni. Le edizioni ricorrenti
  vengono raggruppate. Importati contatti pubblici degli uffici/organizzatori.
- [Marche — Calendario fiere 2026 aggiornato](https://static.regione.marche.it/portals/0/Commercio/mercati%20e%20fiere/Calendario%20FIERE%202026_aggiornamento.pdf),
  aggiornamento di giugno: 218 righe importate. Le righe PDF con colonne o
  continuazioni ambigue sono escluse, non ricostruite per ipotesi. Collegamento
  alla pagina del PDF in ogni scheda.
- [Liguria — Fiere su area pubblica 2026](https://www.regione.liguria.it/component/publiccompetitions/document/54277:fiere-liguria.html),
  XLS aggiornato a settembre: 1.083 righe, 736 importate dopo la risoluzione dei
  comuni. Selezionate fiere, mercatini e manifestazioni con settori commerciali;
  escluse le sole feste gastronomiche/spettacoli senza queste indicazioni. Luogo,
  organizzatore e caselle email degli uffici/associazioni dove pubblicati. I periodi
  superiori a sette giorni sono conservativamente indicati come periodi complessivi,
  con giornate di vendita da verificare. Dieci righe con comuni non risolti escluse;
  altre quattro di Montalto Carpasio senza coordinate nell'anagrafica del sito escluse.
- [Veneto — Sagre e fiere con somministrazione 2026](https://www.regione.veneto.it/web/attivita-produttive/somministrazione-alimenti-e-bevande-nelle-sagre-e-nelle-fiere),
  XLSX aggiornato l'8 ottobre: 1.589 righe di manifestazioni, 163 importate.
  Richiesta menzione esplicita di mercati, bancarelle, ambulanti o espositori;
  non basta la ristorazione temporanea. Setteville non compare nell'anagrafica
  geografica del sito: quattro righe escluse, senza usare coordinate ipotizzate.
  Escluse anche due righe di Lusiana Conco prive di coordinate nell'anagrafica.
  Date alternative, ricorrenze e sequenze come «5-8/12» restano etichette: il
  trattino da solo non prova un intervallo continuo. I settori sono categorie
  fattuali estratte dal programma, non una copia del testo promozionale.
- [Emilia-Romagna — Fiere su aree pubbliche](https://wwwservizi.regione.emilia-romagna.it/sagre/default.asp),
  116 schede restituite dalla ricerca il 9 ottobre, 115 importate. La ricerca
  attuale privilegia gli appuntamenti successivi alla consultazione; non è un
  import completo dell'intero anno. Date giornaliere dalla scheda di dettaglio,
  luoghi, settori (incluse restrizioni) e organico dei posteggi. Esclusa la Fiera
  di luglio di Castello d'Argile, con data di ottobre e nota che indica luglio.
  Per Argenta importate le sole indicazioni sulle domeniche di dicembre: il
  periodo natalizio complessivo non viene trasformato in giorni di vendita.
  Orari malformati presenti nella fonte, come «23:90», non pubblicati.

`fiere-importate.json` conserva data del download, SHA-256 delle sei fonti/snapshot,
conteggi, righe PDF escluse e comuni non risolti. Questi conteggi sono righe
di fonte, non manifestazioni uniche: il build raggruppa le ricorrenze e integra
le schede editoriali della stessa fiera. I documenti originali non sono inclusi
nel repository. Le informazioni importate sono dati fattuali, non copie dei
testi delle pagine. Le fonti delle singole date restano consultabili nel popup.

## Ricerca approfondita — territorio di Trieste

Ricerca dell’11 ottobre 2026 nei **sei comuni**: Trieste, Muggia, Duino Aurisina,
San Dorligo della Valle, Monrupino e Sgonico. Da una scheda a **24 manifestazioni
in quattro comuni** (+23); 22 con edizioni 2026 e due con storico 2025. Tutte hanno
almeno una giornata pubblicata, ma lo storico non conferma una nuova edizione.

Fonti: Comuni/SUAP, [Discover Trieste](https://www.discover-trieste.it/vivi/trieste-now),
PromoTurismoFVG, organizzatori e associazioni. Il
[calendario fieristico regionale del 5 maggio 2026](https://www.regione.fvg.it/rafvg/export/sites/default/RAFVG/economia-imprese/commercio-terziario/FOGLIA102/documentazione/Calendario_fiere_regionale_2026_ver_05_05_2026.pdf)
contiene due manifestazioni triestine: Olio Capitale e Triestespresso Expo;
entrambe riscontrate con i siti degli organizzatori e distinte dalle fiere ambulanti.
`fiere-trieste.json` conserva copertura comunale, 45 URL, hash dei download,
testi comunali letti in Chromium, esclusioni e verifiche residue. Originali HTML,
PDF e testi fuori repository in `Documents/ricerca-fiere-trieste-20261011`.
Un HTML comunale può essere solo un guscio JavaScript: le informazioni operative
sono state lette nella pagina renderizzata e negli allegati, non dedotte dal codice HTTP.

Informazioni operative verificate:

- [San Nicolò 2026](https://www.comune.trieste.it/it/novita-227102/notizie-227103/partecipazione-operatori-commerciali-fiera-di-san-nicolo-di-trieste-28-novembre-6-dicembre-2026-326318),
  28 novembre–6 dicembre: PEC per interesse agli eventuali posteggi residui,
  dopo esaurimento della graduatoria. Recapiti e documenti richiesti nella scheda;
  nessuna disponibilità garantita o scadenza inventata.
- [Mercatino antiquario di Trieste](https://www.comune.trieste.it/it/mercatino-dellantiquariato-e-dellusato-210668):
  domande per il **2027 dal 19 ottobre al 18 novembre 2026**, sorteggio primo
  semestre 20 novembre ore 10; ammessi anche commercianti di settore. SUO,
  graduatorie, pagoPA e assegnazione giornaliera dei posti non occupati entro 8:30.
  Scadenza dichiarata per il 2027, separata dalle 13 giornate pubblicate del 2026.
  Inserite anche le **13 giornate 2027** approvate con delibera 536 del 5 ottobre
  2026, compresa la data aggiuntiva Barcolana del 10 ottobre 2027.
- [Barbacan Produce, regolamento 2026](https://www.barbacanproduce.com/wp-content/uploads/2026/01/Regolamento-BP-2026.pdf):
  13 dicembre, candidatura 30 ottobre–8 novembre; 80 euro IVA inclusa,
  produttori diretti con partita IVA e hobbisti, selezione, spazio 2 × 1,5 m.
  Le due edizioni serali hanno orari diversi da quelle diurne.
- Muggia META e CreAttivaMente: date separate, comprese le giornate aggiuntive.
  Cavana: mercatino Mericordo distinto da CreAttivaMente, stessa piazza ma date
  e organizzatori diversi. Ponterosso e Borgo: mantenute le date esplicite anche
  quando non coincidono con la ricorrenza generica descritta dalla fonte.
- Madonna d’Agosto Muggia Vecchia: **solo 15 agosto** per i mercatini, non l’intero
  programma 5–16 agosto. Aurisina: estremi 18 aprile/17 ottobre precisi,
  terzo sabato del mese testuale; nessuna espansione automatica dei giorni intermedi.

Limiti: San Martino Prosecco conserva soltanto l’11 novembre 2025 ufficiale;
la data 2026 da calendario generato con AI resta da confermare. Natale Trieste
conserva 7 dicembre 2025–6 gennaio 2026, senza trasposizione al Natale 2026.
Monrupino e Sgonico: calendari comunali ancora con eventi 2025; sagre,
degustazioni e Nozze Carsiche senza opportunità commerciale 2026 verificata
non pubblicate. Ciò non prova assenza di eventi.

Corte dei Miracoli Muggia esclusa dalle date operative: pagine PromoTurismoFVG
contraddittorie, una titolata «ANNULLATO» per lavori e altre con date future.
Il [nuovo avviso comunale di gestione](https://comune.muggia.ts.it/it/novita-44201/avvisi-44605/avviso-pubblico-per-laffidamento-in-gestione-del-mercatino-delle-pulci-e-degli-hobby-174509)
scade il **23 ottobre 2026 alle 12**, riguarda il gestore e non gli espositori;
non dimostra la ripresa del mercatino. PDF letto, domanda via PEC e durata
due anni rinnovabili documentate nell’audit. Mercatino dei Fiori di Muggia
Vecchia escluso perché principalmente scambio/donazione; Majenca, Notti del Vino
e Sagra Sgonico escluse senza mercatino esterno documentato. Mercati ordinari
settimanali e programmi culturali non aggiunti per aumentare il conteggio.

Il build sostituisce solo Trieste; confronto con il catalogo precedente:
tutte le altre province identiche. Cache fiere.js 21, fiere.json 14.
Verificati build, settori, controlli catalogo/provincia e suite browser completa
(Chromium 1440/820/390/320 e WebKit 390). Dopo l’aggiunta delle date 2027,
ricontrollati dati e dettagli Trieste su Chromium/WebKit: scadenze, costo,
fonte comunale, 26 edizioni antiquariato e assenza del mercatino discordante.

## Ricerca approfondita — provincia di Brescia

Ricerca documentale completata il 9 ottobre 2026: 206 manifestazioni in 86 comuni.
Esaminate tutte le 1.031 righe 2026 della provincia nel dataset lombardo (118 Fiera,
913 Sagra, 85 comuni), i tre calendari fieristici regionali aggiornati al 4 settembre,
oltre a programmi, avvisi e regolamenti di Comuni, Pro Loco e organizzatori.
Incrociati Visit Brescia, Visit Lake Iseo, Visit Valle Trompia, Turismo Valle Camonica,
Pontedilegno-Tonale e i calendari dei poli Brixia Forum e Centro Fiera Montichiari.
Le schede conservano fonti consultabili, data della verifica e fonti delle singole edizioni.
Incluse anche segnalazioni locali fornite o riprese dagli organizzatori: i tre festival
street food di Marone restano distinti, e Tignale Autentica conserva le quattro serate
esplicitamente pubblicate, senza trasformare il periodo estivo in aperture quotidiane.
Le fonti secondarie sono riconoscibili dal collegamento e richiedono conferma diretta.

`fiere-brescia.json` è la fonte provinciale curata, con metadati della ricerca e
SHA-256 dello snapshot regionale. Il build la applica dopo gli import nazionali:
sostituisce le precedenti schede di Brescia senza modificare le altre province
o gli snapshot originali. Conservati gli identificativi regionali già presenti;
raggruppate le ripetizioni di San Paolo a Esine, miele e libro usato a Vezza d’Oglio.
Il saldo è +156 schede provinciali, dopo il consolidamento di quattro duplicati.

Correzioni e limiti da mantenere negli aggiornamenti:

- La [fiera di Santa Maria Crocifissa di Rosa](https://comune.brescia.it/s3/906/allegati/docpubbl/fiere-e-merc/aggiornamento-procedura-comunicazione-partecipazione-spunta/calendario-fiere-2026.pdf)
  è il 13 dicembre, con termine spunta 14 ottobre: prevale il PDF comunale sulla
  data regionale errata di gennaio. Le tariffe e gli organici delle nove fiere
  cittadine si riferiscono al 2026, senza estenderli alle edizioni 2027.
- I [mercatini di Natale di Ponte di Legno](https://www.prolocopontedilegno.it/mercatini-di-natale-2026/)
  hanno termine domanda 11 ottobre, 30 casette e 29 giornate obbligatorie in sei
  intervalli distinti. Pubblicati costi differenziati tra operatori esterni e locali.
- Il [Casoncello di Barbariga](https://fieradelcasoncello.it/wp-content/themes/casoncello/files/Richiesta%20espositori%202026.pdf)
  ammette espositori il 25–27 settembre, pur iniziando la festa il 24; vieta agli
  espositori la vendita di casoncelli/pasta fresca. Il modulo conserva un termine
  di conferma del 2025: non trasformarlo in una scadenza 2026.
- Il [mercatino del Quarantì](https://www.sagradelquaranti.it/area-espositori/)
  occupa il 29–30 agosto, è gratuito secondo il modulo 2026 e vieta la somministrazione.
- Pontagna: fiera del bestiame il 9 settembre, distinta dalla sagra 6–9 settembre.
  Vezza San Michele: bancarelle 12–13 settembre. Montichiari Fiera del Garda 2027:
  due fine settimana 5–7 e 12–14 febbraio, senza giorni intermedi inventati.
- Ghedi Mestieri e Sapori ha date discordanti; Coccaglio ha un programma indicato
  come ipotetico e un riferimento al 2025. Restano etichette da verificare, senza date esatte.
- Alcuni portali pubblicano ancora soltanto edizioni 2025: mantenute come storico,
  con richiesta di verifica. Ricorrenze testuali e stagioni restano tali, senza
  dedurre giornate giornaliere o inventare la prossima edizione.
- Pisogne Fungo e Castagna: programma comunale 25–27 settembre 2026; la sezione
  appuntamenti conserva vecchie date 2025. Bienno Natale nel Borgo: programma
  turistico comunale 5–8 dicembre 2026, con orari distinti per giornata. Queste
  fonti aggiornate prevalgono sulle schede turistiche rimaste all’edizione 2025.
- Escluse feste con soli pasti, concerti, sport o raduni senza evidenza commerciale;
  escluso «Un tuffo nel passato» a Paratico, riservato agli hobbisti nel documento
  dell’organizzatore. Un evento con bancarelle non prova l’ammissione di ogni ambulante.

La spunta, i bandi pubblici, la selezione privata e le procedure da verificare sono
distinti nella partecipazione. I costi di ingresso visitatori non diventano tariffe
degli espositori. Il completamento documentale non esclude nuove manifestazioni,
rinvii, annullamenti o bandi successivi: aggiornare periodicamente fonti e termini.
La to do list registra Brescia, Lodi, Lecco, Monza e della Brianza e Arezzo completate;
restano 105 unità territoriali da approfondire.

## Ricerca approfondita — provincia di Arezzo

Ricerca documentale dell’11 ottobre 2026 nei **36 comuni**, dopo estrazione casuale
dalla lista incompleta: **89 manifestazioni in 31 comuni**, rispetto alla precedente
sola Fiera Antiquaria. 77 schede hanno giornate precise, tre conservano periodi
complessivi, sei edizioni testuali e tre soltanto mesi/ricorrenze da verificare.
Contatti pubblicati per 24 manifestazioni e cinque scadenze datate; due termini
natalizi successivi alla ricerca, distinti dai tre bandi già conclusi.

Consultati Comuni/SUAP, Confesercenti e Confcommercio, organizzatori, portali
territoriali di Casentino, Valtiberina, Valdichiana e Valdarno, calendario AEFI e
stampa locale. Estratto il testo del programma CASENTINO2000 di 96 pagine e letti
i passaggi pertinenti a mercati/fiere; esaminati disciplinare e domanda natalizia
di Arezzo, avviso di Castiglion Fibocchi, bando di Stia e regolamento di Laterina.
La grafica della planimetria natalizia non è stata verificata visivamente.
`fiere-arezzo.json` conserva esito dei 36 comuni, esclusioni, dubbi, hash di 79
download HTML riusciti e sette PDF; 15 errori HTTP/TLS sono registrati separatamente.
Diverse pagine non scaricabili sono state consultate tramite apertura/ricerca web:
lo stato HTTP e l’hash non dimostrano da soli lettura o correttezza del contenuto.

Il build sostituisce solo Arezzo: **2.037 schede delle altre province identiche**,
ID della Fiera Antiquaria conservato; incremento netto di 88 manifestazioni.

Precisazioni per gli aggiornamenti:

- [Arezzo San Jacopo/Risorgimento](https://www.comune.arezzo.it/novita/fiera-mercatino-di-natale-di-piazza-san-jacopo-e-piazza-risorgimento-1):
  periodo 14 novembre 2026–6 gennaio 2027, calendario giornaliero da verificare;
  Allegato A via PEC entro **31 ottobre**, casette a carico degli espositori,
  divieti di brace, frittura e GPL. Villaggio Tirolese in Piazza Grande è distinto:
  periodo 14 novembre–27 dicembre, aperture settimanali/FAQ senza giorni inventati.
- [Castiglion Fiorentino Natale](https://www.comune.castiglionfiorentino.ar.it/it/news/6487403):
  dieci giornate esplicite di dicembre, domanda entro **16 ottobre** con merci e
  tre fotografie; modulo da chiedere all’organizzazione se il portale non lo mostra.
- Antiquaria: dodici edizioni pubblicate, inclusa quella di tre giorni 1–3 maggio.
  Il modulo comunale ammette le domande oltre il 15 al mese successivo all’invio:
  non slittare di un ulteriore mese e non inventare una scadenza annuale.
- Cavriglia Perdono: **1 agosto fiera, 2 agosto mercato**, non l’intera festa.
  Raggiolo Castagnatura: mercatino della **domenica 1 novembre**, distinto dalla
  cena del 31 ottobre. Lucignano Di Giovedì: food truck documentati il 9 e 16 luglio,
  senza estenderli a picnic/BBQ. Cortona Archidado: mercato 31 maggio–2 giugno.
- [Ranco/Mostra Chianina](https://www.meetvaltiberina.it/chianina2026): **28–29 settembre
  a Ponte Presale, Sestino**; consolidata la manifestazione, nessun duplicato a
  Badia Tedalda. Area Nirvana consolidata in Passioni in Fiera secondo l’organizzatore.
- Stia Assunta: 35 concessioni dodicennali offerte nel bando, non posti residui;
  termine **13 giugno** già scaduto, invio PEC, requisiti di categoria e bollo.
  Poppi San Torello: 46 posteggi, termine 28 marzo concluso. Laterina Medievale:
  24–26 luglio, termine 30 giugno concluso, contributo €100/caparra 30% nel regolamento.
- Fibocchi Rosario: **4 ottobre** nell’avviso comunale, spunta 8:15. Il PDF ha
  intestazione 2025 ma corpo/avviso 2026; nessuna scadenza datata dedotta.
  Terranuova: migliorie riservate ai concessionari, non domanda per nuovi operatori.
- Esclusi mercati dell’usato riservati ai privati, mercatino hobbisti della Maggiolata,
  beneficenza CALCIT e sagre con soli pasti/spettacoli. Soci Ti Mostra conserva la
  sola area street food esterna, distinta dalla mostra scambio del circuito privati.
  Ammissione dei professionisti nei mercatini misti non provata senza regolamento:
  le schede chiedono conferma, senza promettere un posteggio.
- Fiera di Primavera Castel Focognano, Fiera del Tordo Chitignano, Ceppo Lucignano,
  feste senza commercio esterno e nuovi programmi natalizi restano nell’audit;
  non dedurre date da delibere, calendari storici o regole settimanali.

Laterina Pergine Valdarno non ha coordinate nell’anagrafica: per Laterina Medievale
usato il centro della località Laterina da [OpenStreetMap/Mapcarta](https://mapcarta.com/18695812),
con `coordinateSource` nella scheda. Non è la posizione precisa di un banco.
Ricerca completata nelle fonti accessibili, senza garanzia di censimento esaustivo,
apertura delle domande o disponibilità; aggiornamenti periodici nella TO DO list.
Non inviate domande né contattati organizzatori.

## Ricerca approfondita — provincia di Lodi

Ricerca documentale del 10 ottobre 2026 su tutti i 60 comuni: **43 manifestazioni
in 26 comuni**, prima assenti dal catalogo. 35 schede hanno date 2026 documentate;
8 conservano soltanto l’edizione 2025, esplicitamente da riconfermare. Compresi
mercatini periodici, fiere tradizionali, esposizioni e manifestazioni con stand
commerciali; categorie professionali ammesse e disponibilità restano da verificare
quando la fonte non pubblica una procedura. Otto schede hanno una scadenza datata.

Esaminate tutte le tre righe LO/2026 di `hs8z-dcey` e il dataset di fiere locali
`tchp-wt8f` (zero righe LO), oltre al calendario fieristico regionale 2026, programmi
comunali, Provincia/Visit Lodi, Pro Loco, organizzatori, espositori e stampa locale.
`fiere-lodi.json` registra hash dello snapshot, fonti, esito per ciascuno dei 60
comuni, esclusioni e segnalazioni ancora da verificare. Il build applica le due
province curate dopo gli import; le 1.884 schede preesistenti sono conservate.

Precisazioni per gli aggiornamenti:

- Castiglione San Bernardino: mercato **10 maggio**, non tutta la festa 7–10.
  Brembio San Giuseppe: mercatino **15 marzo**, non tutto il programma 13–15.
  Cavenago Madonna della Costa: **22 marzo 2026**, non la ricorrenza del 25.
- Codogno antiquariato: nove date pubblicate; **18 luglio e 15 agosto sospesi**,
  nessuna data di novembre. Fiera autunnale: 17–18 novembre, spunta scaduta il
  23 settembre; la concessione bar/ristorazione del 16 ottobre è una procedura distinta.
- Casaletto: date **11, 18 e 25 ottobre** nel modulo e nel programma PDF 2026;
  l’HTML contiene giorni/date di una vecchia edizione. Domande scadute il 15 settembre.
- Cornegliano/Muzza: 18 e 25 ottobre, domande scadute il 9 ottobre. Il modulo
  pubblica quote per categoria/dimensione; chiarire l’incoerenza sull’ora di
  disallestimento del 18. Le quote non provano l’accettazione o disponibilità.
- Mulazzano: quattro spazi 8×5 m, termine 7 ottobre ed esenzione CUP nell’avviso;
  quattro spazi non significa quattro posti ancora liberi.
- Secugnago: [modulo ufficiale](https://forms.gle/BELAXgzZV1eBNTpJ9)
  conferma **8 dicembre 2026**, iscrizioni entro **20 novembre**, nessuna quota,
  selezione e risposta entro il 25. Prevale sull’avviso con scadenza rimasta al 2025.
- Lodi Sposi Expo si svolge a **Guardamiglio**, distinta da Lodi Weddings Ideas
  in Piazza della Vittoria. ArteVino conserva sei giornate esplicite in due weekend.
- Casalmaiocco resta una sagra da calendario con **vendita esterna da verificare**.
  Fiera di Cavacurta: data 2026 documentata da una partecipante; programma e
  domanda commerciale non reperiti. Fonti secondarie riconoscibili dal collegamento.
- Esclusi processioni, mercatini di torte/beneficenza, pasti e concerti senza
  evidenza commerciale. Turano, Massalengo, Livraga e altre segnalazioni dubbie
  restano nell’audit; non sono date pubblicate come confermate. San Colombano
  al Lambro appartiene a Milano; omonimi di altri territori esclusi.

Le pagine di Castiraga e alcuni allegati comunali possono risultare rimossi o
non accessibili ai controlli automatici: i dati derivano dai contenuti consultati
e dai programmi collegati, non dal solo stato HTTP. Verificare di nuovo i riferimenti
prima della prossima edizione. “Nessuna manifestazione individuata” nel censimento
non prova l’assenza di fiere: eventi non annunciati, fonti non indicizzate e nuovi
bandi richiedono aggiornamenti periodici. Non inviate domande né contattati terzi.

Castelgerundo non ha coordinate nell’anagrafica: per la Fiera dei Filsòn il puntino
usa la località Cavacurta, documentata da [OpenStreetMap/Mapcarta](https://mapcarta.com/18704354).
Coordinate e fonte sono nella scheda; nessuna modifica all’anagrafica nazionale.

## Ricerca approfondita — provincia di Lecco

Ricerca documentale del 10 ottobre 2026 negli **84 comuni**: **46 manifestazioni
in 23 comuni**, rispetto alle precedenti 7 schede. 40 manifestazioni hanno almeno
una giornata precisa pubblicata; tre mercati conservano soltanto il periodo
ricorrente e tre schede date testuali da verificare. Quattro scadenze datate,
con termini scaduti distinti dal bando ancora aperto di Viganò.

Consultate tutte le **160 righe LC/2026 in 11 comuni** del registro sagre/fiere,
scaricati i 160 programmi e letto il testo estraibile da 122; gli altri 38 sono
scansioni o allegati senza testo. Esaminati visivamente i programmi Galbiate
24694, 24655 e 24678; gli altri allegati senza testo rimangono da verificare.
Controllate anche le tre righe LC del calendario fiere locali e la Sagra delle
Sagre nel calendario espositivo regionale, oltre a Comuni, Pro Loco, organizzatori,
portali turistici ufficiali e stampa locale. `fiere-lecco.json` conserva hash,
fonti, audit di tutte le righe regionali, esito degli 84 comuni ed esclusioni/dubbi.
Ricerca documentale completata nelle fonti accessibili, senza garanzia di censimento
esaustivo o di ammissione dei professionisti dove manca un regolamento.

Precisazioni da conservare negli aggiornamenti:

- **Viganò**: bando 2027–2029 per 52 posteggi 8×4 m, domanda telematica entro
  **7 dicembre 2026** secondo l'art. 4 del PDF; data pubblicata **7 febbraio 2027**.
  Nessuna data 2028/2029 dedotta dal bando triennale; assenza di elettricità indicata.
- **Merate Sant'Ambrogio**: 7–8 dicembre 2026, 118 concessioni; termine domande
  **8 ottobre già scaduto**. Il registro Street Food indica 2–4 ottobre, ma l'allegato
  9–11: scheda testuale. Cioccolato: 20 ottobre nel registro/allegato, altre
  segnalazioni 25; conferma locale mancante, nessun giorno presentato come certo.
- **Oggiono Sant'Andrea**: banchi commerciali **25–26 ottobre**, distinta dalla
  parte zootecnica Feron 24–25; nessun duplicato. Graduatoria 2026 già pubblicata,
  eventuale spunta da chiedere al SUAP. Carnevale: confermato 15 febbraio 2026
  nella stampa locale, benché il titolo regionale conservi «edizione 2025».
- **Casatenovo**: 96 posteggi esterni della fiera mercato soltanto **2 agosto**;
  fiera zootecnica espositiva **30 luglio–3 agosto**, procedura distinta. La pagina
  comunale del commercio conserva bolli/riferimenti storici: tariffe non ripubblicate
  come correnti. Festa del Salame in tre weekend: 25–26 aprile, 1–3 e 8–10 maggio.
- **Colico**: periodi complessivi di mercatini domenicali/serali marcati `periodOnly`;
  sospensioni da verificare, nessuna conversione della ricorrenza in date precise.
  Natale conserva le 21 giornate pubblicate della stagione 2025–gennaio 2026,
  senza proiezione a fine 2026. Airuno/Aizurro: **7 e 14 giugno**, non due settimane
  continue. Valgreghentino: bancarelle soltanto **15 marzo**, non tutta la festa 14–15.
- **Lecco Natale**: 25 novembre 2026–6 gennaio 2027 nel portale turistico comunale;
  l'avviso per selezionare il gestore non è domanda di posteggio per il venditore.
  Campagna Amica dedicata ai produttori agricoli; pubblicate solo sei giornate
  esplicite. Imbersago: nove date, ammessi anche professionisti con licenza;
  termine annuale scaduto, eventuali spazi residui secondo regolamento da verificare.
- **Galbiate Natale**: rimossa la vecchia scheda generica; programma originale
  riservato agli hobbisti il **29 novembre**, non vendita continua fino al 7 dicembre.
  Valmadrera Vintage Market riservato a privati/hobbisti/creativi: escluso come
  opportunità professionale. Colle Brianza Burolla 2026 annullata. Premana San Matteo
  resta testuale perché il giorno da scheda automatica non è verificato nell'atto.

Il build sostituisce soltanto Lecco e conserva identiche le **1.920 schede delle
altre province**. Sei identificativi preesistenti conservati; sola rimozione
Galbiate motivata nell'audit. Test provinciali verificano scadenze, contraddizioni,
periodi ricorrenti, weekend e giornate commerciali; test browser su elenco e mappa.
Restano da approfondire 107 province/unità territoriali; Lecco ha una voce separata
per controlli periodici e riscontri non ancora reperiti.

## Modificare gli eventi

- `fiere-fonti.json`: schede editoriali, con fonte HTTPS per ogni evento.
- `fiere-importate.json`: snapshot normalizzato dei calendari regionali.
- `fiere-brescia.json`: ricerca provinciale verificata; prevale sugli import di Brescia.
- `fiere-lodi.json`: ricerca di Lodi, copertura dei 60 comuni e riscontri da completare.
- `fiere-lecco.json`: ricerca di Lecco, copertura degli 84 comuni, programmi e dubbi.
- `fiere-monza-brianza.json`: ricerca nei 55 comuni, audit delle 199 righe MB/2026,
  programmi, bandi, fonti e segnalazioni ancora da verificare.
- `fiere.json`: asset pubblico generato; non modificarlo direttamente.
- `fiere-bergamo.json`: ricerca nei 243 comuni, programmi, fonti e dubbi; override Bergamo.
- `comuni.json`: coordinate dei comuni, già usate dal sito. Il puntino indica il
  centro del comune e non il luogo preciso dell'evento o l'ingresso. Una scheda può
  fornire coordinate documentate della località con `coordinateSource`.
- `python scripts/build-fiere.py`: rigenera il catalogo, controllando comuni,
  mesi, categorie, identificativi univoci, fonti e intervalli delle edizioni.
- `node scripts/test-fiere.cjs`: controlli del catalogo e test browser. Impostare
  `PLAYWRIGHT_MODULE` se Playwright è installato fuori dal progetto.

Per ripetere l'importazione dai file scaricati, installare `beautifulsoup4` e
`pypdf` nell'ambiente di ricerca e usare:

```text
python scripts/import-fiere.py --lombardia file.json --piemonte file.html --marche file.pdf
python scripts/build-fiere.py
node scripts/test-fiere.cjs
```

L'importatore originario ricrea lo snapshot dei primi tre calendari. Per includere
anche quelli aggiunti in questa ricerca, eseguire successivamente (dipendenze
di ricerca aggiuntive `xlrd`, `openpyxl`):

```text
python scripts/import-fiere-extra.py --liguria file.xls --veneto file.xlsx --emilia-romagna dettagli.json --checked-at 2026-10-09
python scripts/build-fiere.py
```

`dettagli.json` è una lista di oggetti `{ "url": "https://.../note.asp?...",
"html": "HTML originale decodificato Windows-1252" }`, scaricati dalla ricerca
regionale. Non include il footer o i contatti regionali nelle schede pubbliche.
L'importatore aggiuntivo aggiorna soltanto le regioni fornite e conserva le altre.
I file originali restano fuori dal repository. Il download non è automatizzato
da questi script; cambiare `--checked-at` solo dopo una nuova consultazione.
Abbreviazioni e varianti accertate della stessa fiera sono raggruppate tramite
`EVENT_ALIASES` nel build; manifestazioni diverse non vengono unite per somiglianza.

L'importatore non accede alla rete; il build non richiede dipendenze esterne.
Aggiornare la data di consultazione solo dopo una nuova ricerca. Le modifiche
editoriali mantengono priorità sui dati regionali della stessa edizione.
Per aggiornare gli asset, aumentare `?v=` in `fiere.html` e `js/pages/fiere.js`.
Il conteggio nell'interfaccia viene letto dal catalogo, senza valori fissi.

## Mappa e licenza

`italia-province.json` contiene i 110 confini di province, città metropolitane e
unità territoriali equivalenti derivati da ISTAT tramite
[geojson-italy di Guglielmo](https://github.com/guglielmo/geojson-italy),
distribuiti con licenza [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Fonti scaricate il 9 ottobre 2026, versione fissata `2026.2`:
https://raw.githubusercontent.com/guglielmo/geojson-italy/2026.2/geojson/limits_IT_provinces.geojson
https://raw.githubusercontent.com/guglielmo/geojson-italy/2026.2/geojson/limits_R_20_municipalities.geojson

Il secondo file fornisce le assegnazioni ufficiali dei 377 comuni sardi dopo la
riforma del 2026, conservate in `sardiniaMunicipalities` nell'asset della mappa.
Il build le applica soltanto alle province del calendario fiere: Olbia passa a
Gallura Nord-Est Sardegna e Muravera a Cagliari. L'anagrafica condivisa dei comuni,
le coordinate e gli altri dati delle manifestazioni restano invariati.

Modifiche: rimozione delle proprietà non necessarie, semplificazione delle linee
a 0,012 gradi e arrotondamento a quattro decimali. Uso esclusivamente illustrativo.
Per rigenerare la mappa dal file originale scaricato:
`python scripts/build-fiere.py --province-boundaries percorso/limits_IT_provinces.geojson --sardinia-municipalities percorso/limits_R_20_municipalities.geojson`.

La mappa SVG raggruppa eventi vicini; selezionare una provincia ingrandisce la zona.
Ogni gruppo permette di aprire tutte le sue schede. Elenco e puntini usano gli
stessi filtri; gli intervalli possono attraversare dicembre/gennaio. I filtri
sono condivisibili attraverso la URL. Non vengono salvati dati degli utenti.

Il filtro Dove mostra tutte le 110 province in ordine alfabetico e Tutta Italia;
le province senza eventi mostrano il messaggio di elenco vuoto. Mappa, schede e
puntini usano la stessa provincia. In Tutta Italia il passaggio sulle schede
evidenzia il confine provinciale; con una provincia selezionata evidenzia il
puntino della manifestazione. I link condivisi usano `provincia=Nome`; i vecchi
parametri `regione` e le province sconosciute vengono eliminati senza interferire
con mesi, tipo e ricerca. L'elenco delle province è nel catalogo per mantenere
utilizzabile il filtro anche quando il caricamento della mappa fallisce.
Cache: fiere.js v=25, fiere.css v=10, fiere.json v=18, italia-province.json v=1.

## Ricerca approfondita — Monza e della Brianza, 10 ottobre 2026

Ricerca nei **55 comuni**, con **86 manifestazioni in 29 comuni**: 82 schede
con giornate precise, un periodo natalizio complessivo e tre edizioni testuali
da verificare. Rispetto alle 14 schede precedenti, 72 aggiunte; tutti i 14 id
conservati. Le 1.952 schede delle altre province restano identiche. Contatti
pubblicati per 26 manifestazioni e sei scadenze, con ambito dell'edizione
indicato. Date regionali e conferme locali mantengono etichette distinte.

Esaminate le **199 righe MB/2026** del registro sagre e fiere, relative a 15
comuni; scaricati tutti i 199 allegati, 176 con testo estraibile oltre 100
caratteri. Nove allegati controllati visivamente, elencati nell'audit. Consultato
anche il dataset delle fiere locali: una riga di Lesmo/Gerno rimasta da chiarire.
Gli altri allegati scansione non sono dichiarati verificati visivamente.
`fiere-monza-brianza.json` conserva audit di ogni riga, hash dei programmi,
copertura comunale, fonti scaricate, esclusioni e piste da riconfermare.

Correzioni e informazioni operative:

- [Lissone Natale](https://static-www.comune.lissone.mb.it/wp-content/uploads/2026/08/BANDO_FIERA_DI_NATALE_2026.pdf):
  tre giornate separate, 6, 13 e 20 dicembre; 35 posteggi, merci natalizie
  limitate dal bando, termine 7 ottobre 2026 già scaduto.
- [Lissone Epifania](https://static-www.comune.lissone.mb.it/wp-content/uploads/2026/08/BANDO_FIERA_EPIFANIA_5_GENNAIO_2027.pdf):
  aggiunta l'edizione del 5 gennaio 2027, 35 concessioni, domanda tramite SUAP
  dal 7 settembre al **6 novembre 2026**. Scadenza riferita soltanto al 2027.
- [Fiera di Lissone](https://www.comune.lissone.mb.it/documento_pubblico/bando-per-concessioni-di-posteggio-fiera-lissone-2026/):
  17–19 ottobre, 50 posteggi, graduatorie pubblicate; termine 18 agosto passato.
  Vendita alimentare e somministrazione con tavoli seguono graduatorie e regole
  distinte. Area e collocazione da planimetria ufficiale.
- [Brocante di Monza](https://www.comune.monza.it/it/page/mercati-periodici):
  15 date del calendario comunale, senza agosto; eliminato l'intervallo continuo
  gennaio–dicembre. Biologico: quarta domenica testuale, senza calcolare date.
- Arcore Sant'Eustorgio: solo lunedì 21 settembre, 133 posteggi, spunta alle 08:00.
  Bovisio San Martino: 8 novembre, 39 posteggi e termine 8 settembre passato.
  Biassono: riapertura fino al 18 settembre alle 10:00, ma giornate della fiera
  ancora testuali; non importate le date da scheda generata con IA.
- Mercatini della Patata di Lazzate: 26–27 settembre, anziché tutta la sagra.
  Mezzago: mercato agricolo 3 maggio, Mezsvago 17 maggio e mercato dei produttori
  della Zucca 18 ottobre. Brugherio: street food 9, 10 e 12 ottobre; gli stand
  hobbisti/associazioni dell'11 non diventano posteggi professionali.
- Streeat Monza: due edizioni, aprile e ottobre; eliminate le suddivisioni
  venerdì/fine settimana. Santo Stefano Vimercate: due righe, una sola edizione.
  Asian Street Food: relazione 29 maggio–2 giugno, anziché soli 1–2 giugno.
- Pro Loco in Fiore Lissone: registro 11–12 aprile, programma 18–19 aprile;
  edizione testuale finché non chiarita. FuoriGP Villasanta corretto sul programma.
  Nova Milanese: street food 19–21 giugno, bancarelle hobbisti soltanto sabato 20.
- MonzaCon: Winter e Summer separate; modulo Summer entro 5 giugno, tariffe
  dell'edizione 2026 esplicitamente indicate, senza riutilizzarle per altre edizioni.
  Villaggio di Natale: proposta Promec 21 novembre–6 gennaio, selezione da
  verificare; giorni di allestimento esclusi dal periodo di apertura.

Ricerca documentale, non garanzia di completezza o di posteggi disponibili.
Comuni senza eventi pubblicabili restano nell'audit; le sagre con soli pasti,
spettacoli, baratto o beneficenza non dimostrano accesso professionale esterno.
Barlassina Natale, Bellusco, Oreno, Notte Medievale, Regno delle Eccellenze
Sabaudi a Vimercate (programma senza descrizione) e altre piste
rimangono da confermare; nessuna data 2027 è dedotta automaticamente.


## Ricerca approfondita — Treviso, 13 ottobre 2026

Catalogo pubblicato e verificato con **79 manifestazioni in 39 comuni**, rispetto alle 48
precedenti. Ricerca nominale sul web dei **94 comuni** e confronto di tutte le
**337 righe** provinciali del registro Veneto aggiornato all’8 ottobre, del
calendario fieristico 24 agosto e dei mercatini antiquari 2026. Approfondite
fonti comunali, IAT, Pro Loco e organizzatori; fonti scaricate con hash, esiti
HTTP, esclusioni e questioni residue in `fiere-treviso.json`. I download sono
un archivio di ricerca: non tutti i documenti sono pertinenti o verificati
visivamente. Nessun Comune contattato né domanda inviata.

**52 schede con giornate precise**, 23 con date testuali e quattro con periodi
complessivi da distinguere dai giorni dei banchi. Contatti organizzativi in
38 schede; due scadenze 2026 documentate, entrambe passate. Conservati 42 ID
precedenti e aggiunti 37. Le **2.446 schede delle altre province sono identiche**.
Sei falsi positivi esclusi e motivati: cena di presentazione Montebelluna,
Sant’Anna Susegana, Sant’Antonio/San Sisto/San Martino Musano e Sant’Augusta
Vittorio Veneto. «Via Mercato» e «Via Mercatelli» non provano un mercato;
il mercatino dei bambini non prova accesso degli ambulanti professionali.

Correzioni e informazioni operative:

- [Stelle a Natale](https://artigianatovivo.it/): **5, 6, 7, 8, 12 e 13 dicembre**;
  il programma dell’organizzatore aggiunge il 7 rispetto al registro regionale.
  Artigianato Vivo: **8–16 agosto**, non 1–16; selezione degli espositori,
  nessuna quota 2026 dedotta dal regolamento 2025.
- [San Gregorio](https://www.comune.valdobbiadene.tv.it/wp-content/uploads/2026/03/Brochure.pdf):
  fiera commerciale **7–9 marzo**; luna park e street food **6–10 marzo**.
  Il periodo generale nella notizia comunale non sostituisce il programma
  commerciale. Bessica: esposizione **7–8 marzo**, concerto del 6 separato.
- [Santa Lucia Agricoltura](https://www.fieresantalucia.it/fiera-internazionale-agricoltura/espositori/):
  **12–14 dicembre**, domanda **30 settembre già scaduta**. Modulo con quota
  d’iscrizione, stand e servizi separati, IVA esclusa; caparra non soggetta
  a IVA. Lo sconto entro luglio non è una tariffa tuttora disponibile.
- [Nervesa in Fiore](https://www.comune.nervesa.tv.it/wp-content/uploads/2026/03/01_Avviso-Mercatino.pdf):
  **17 maggio**, domanda entro **24 aprile ore 12**, gazebo €10/giorno;
  ammessi anche ambulanti A/B nelle merci del bando, niente allaccio elettrico.
  San Girolamo: fiera **27 settembre**, distinta dall’intera sagra.
- [Motta Autunno](https://prolocomottadilivenza.it/): **11 ottobre**; modulo
  ambulanti con licenza A/B e DURC, distinto dalla scheda artigiani/hobbisti.
  Quota e scadenza non recuperate. Mottaflor **29 marzo**, Madonna Agosto
  **8 agosto** nel portale del Distretto del Commercio.
- Antiquariato: Godega e Portobuffolè sospendono luglio/agosto; Trovarobe Badoere
  esclude anche aprile nel registro 2026, eccezione assente nella pagina
  comunale storica. Asolo ha dodici date esplicite e tariffe 2026 per singola
  edizione/abbonamenti; agevolazione nuovi operatori limitata alle prime due
  edizioni. I posti riservati ai professionisti non sono posti liberi.
- [Treviso Borgo Cavour](https://www.mercatini-antiquariato.com/eventi/):
  antiquariato **25 ottobre, 22 novembre, 27 dicembre**; Natale in Borgo
  **13 e 20 dicembre**, evento distinto. Oderzo straordinario **18 ottobre**;
  Morgano Natale **15 novembre e 20 dicembre**, senza applicare quote 2025.
- Castelcucco Santa Lucia: calendari regionali **5–13/6–13 dicembre discordanti**,
  date lasciate testuali. San Luca Treviso conserva **2–25 ottobre** come
  periodo del luna park da portale locale, non giornate certe dei banchi.
  Fiera del Piave e Fiera Veg mantengono i periodi complessivi. Resana Bruscandolo
  conserva il calendario misto aprile/maggio testuale; nessuna espansione ambigua.
- Portobuffolè Natale: fonte comunale **14 dicembre 2025**, anziché il 13 nel
  registro. Castelfranco Natale conserva la stagione **22 novembre 2025–6 gennaio
  2026**, senza proiezione a fine 2026. Vi-Ve in Vintage resta testuale (sito 503).

Restano da completare bandi, disponibilità e ammissioni; Segusino e Tovena,
fiere del teatro Sarmede, Natale Conegliano, Tucogiò e altri programmi residui
sono nell’audit. Il libretto Istrana e la brochure Delizie d’Autunno sono PDF
senza testo estraibile, non dichiarati verificati visivamente. Vinetia ha anno
discordante nella pagina e non diventa automaticamente opportunità di vendita.
Ricerca documentale non esaustiva, senza garanzia di posti o nuove edizioni.

### Aiuto locale, controllato da Codex

Qwen3.8-27B Q6 sul PC collegato: **otto microtask**, quattro di prove e quattro
di note. Circa **288 secondi**, **3.989 token input + 793 output = 4.782 locali**.
Codex ha rivisto 17 etichette con prove e tutte le note; una nota conservata,
due corrette nel significato e una ritoccata nella formulazione. Nervesa:
«corrente» è correttamente mancante nel contesto ritagliato locale; Codex ha
verificato l’assenza dell’allaccio nel PDF completo. Asolo: «esperienza» non
equivale a nuovi commercianti. Motta: non scegliere il modulo hobbisti per
un ambulante. Tutte e quattro le note riviste sono usate nelle schede.

Operation `treviso-fiere-micro-v1-20261013`, conclusa e deduplicata; non ripetere.
Nessuna inferenza cloud aggiuntiva per avvio o polling del locale. Risparmio netto
e percentuale non misurati: manca un confronto sullo stesso caso solo Codex.
Fonti, contesti e risultati privati in
`Documents/AI-Fiere-Treviso-20261013`; nessun accesso autonomo web o pubblicazione
del worker. Il build sostituisce solo Treviso. Cache fiere.js **29**, JSON **22**.
Pubblicazione verificata: commit `2056461`, Vercel riuscito, hash
del catalogo online identico alla versione committata. Controllo pubblico su
desktop e telefono: 79 schede, sei dettagli critici e tutti i quattro filtri
merceologici. Il caricamento iniziale mostra 12 schede; «Mostra altre fiere»
permette di raggiungere tutte le 79. Suite completa Chromium/WebKit superata.
## Ricerca Mantova — 14 ottobre 2026

**84 manifestazioni in 33 comuni**, rispetto alle 12 precedenti. Confrontati
i **64 comuni** dell’anagrafica con il registro regionale MN/2026, ricerche
nominali e calendari provinciali/comunali. Scaricati tutti i **195 programmi**:
193 PDF e due immagini; 189 PDF con testo estraibile, uno dei quattro PDF
scansionati letto visivamente (Stradei). Le altre tre scansioni restano da
verificare e non sono state usate per inventare opportunità commerciali.
Fonti, esiti HTTP/hash, copertura dei comuni, 195 decisioni sui record e dubbi
in `data/fiere-mantova.json`; materiali e strumenti locali in
`Documents/ricerca-fiere-mantova-20261014`.

76 schede hanno giornate precise, quattro conservano un periodo con giorni
commerciali da verificare e quattro date testuali/ricorrenze. Le date di stampa
locale restano marcate `calendar`, senza promozione a conferme primarie.
50 schede con contatti pubblici e due termini assoluti documentati, entrambi
scaduti. Nessuna candidatura, pagamento o comunicazione a terzi.

Verifiche operative principali:

- [Natale Mantova](https://www.mercatinidinatalemantova.it/): **19 aperture**
  7 novembre–27 dicembre, compresi 7/8/24 dicembre; chiuso il 25. Contatto
  Green Eventi per chalet e selezione; il bando gestione non è una domanda
  espositori. Prezzi pattinaggio/trenino esclusi dai costi dello stand.
- [San Fortunato](https://comune.acquanegra.mn.it/eventi/3661329/sagra-san-fortunato-2026):
  locandina letta visivamente, **bancarelle il 18 ottobre dalle 9**; festa
  15–20 ottobre. [San Luca Castel Goffredo](https://www.comune.castelgoffredo.mn.it/it/news/2054982)
  ha il mercato il **18 ottobre**; giostre 15–21 non convertite in sei mercati.
- [Madonnina](https://www.comune.sanmartinodallargine.mn.it/index.php/it/eventi/fiera-della-madonnina-2025-724340):
  locandina 2026 letta visivamente, mercato/hobbisti/espositori **6 settembre,
  8–19**, festa 2–8. Percorso URL con anno vecchio conservato.
- [San Gallo Sabbioneta](https://www.comune.sabbioneta.mn.it/it/news/fiera-di-san-gallo-2026-cinque-giorni-di-festa-musica-e-tradizione-nel-cuore-di-sabbioneta?type=1):
  mercatino **18 ottobre**, programma generale 15–19.
- [Sermide](https://www.comune.sermideefelonica.mn.it/vivere_il_comune/eventi/evento_170.html):
  street food e market **26–28 giugno**, programma generale 25–29.
- [Viadana, modulo posteggio](https://www.prolocoviadana.it/wp-content/uploads/2026/03/ACCORDO-DI-ASSEGNAZIONE-POSTEGGIO-FIERA-2026.pdf):
  San Pietro/Melone **27–28 giugno, 19–24**, obbligo di entrambe le giornate;
  termine **15 maggio**. Somministrazione 70 €/giorno, hobbisti/artisti gratuiti;
  altri stand senza prezzo pubblicato. SCIA sanitaria come richiesta nel modulo.
- [Grazie, bando comunale](https://www.levata.org/cdq1/documenti/albo_pretorio/determina/2026_03/20260252-approvazione-di-bando-pubblico-per-l-assegnazione-dei-posteggi-destinati-al-commercio-su-aree-pubbliche-nell-ambito-dell-antichissima-fiera-delle-grazie-edizione-2026/bando-completo-per-determina.pdf):
  **14–16 agosto**, **97 posteggi previsti**, termine **15 maggio**; domanda SUAP.
  Articolo 1 indica validità fino al 17: conflitto dichiarato, quarta giornata
  non dedotta. Programma generale dal 13 distinto dalle giornate commerciali.
- Mese Mariano: programma regionale distingue **3/10/17/24 maggio**, non
  periodo continuo. San Giuseppe: immagine regionale conferma **15 marzo**,
  luna park 13–17. Possenta: programma comunale **25–31 marzo** supera il
  registro 20–25; area fiera inaugurata **28 marzo**, attività il 29; ulteriori
  giorni dei banchi da chiedere. Stradei: programma scansione conferma mostra
  mercato dell’artigianato/ingegno tutti i giorni **27–31 agosto**.
- [Gonzaga C’era una Volta](https://www.ceraunavoltagonzaga.it/): calendarietto
  letto visivamente, **11 giornate in centro** distinte dalle **tre fiere
  nazionali nei padiglioni**. Regolamento spunta professionisti/privati;
  tariffe online 2025 non riproposte come 2026. Calendario generale Millenaria
  più recente prevale sui vecchi refusi del calendarietto (Bovimac 16–18 gennaio).
- Millenaria, elettronica, Marzaglia, C.A.M.E.R., MilleVini, bonsai, pet show,
  ENCI e 1000GIOCHI: stand commerciali documentati; quote pubblico/competizioni
  distinte da spazi espositori. Marzaglia svolta **a Gonzaga**, non a Modena.
- Museo Diocesano Mantova: dodici date esplicitamente 2026, compresi **24 maggio
  e 27 settembre**; titolo/allegato vecchio 2025 dichiarato. Broccante: rinvii
  dalla stampa locale **26 luglio → 2 agosto**, **30 agosto → 6 settembre**;
  condizioni professionisti/privati discordanti da confermare al Papacqua.
- Vini Passiti: sito organizzatore ormai 2027 senza date; **1–3 maggio 2026**
  da fonte locale, nessuna nuova edizione dedotta. Fiori di Castellaro:
  **1–3 maggio**, ignorato il refuso “quattro giorni”. Naturalmentemantova:
  comunicato 2026 conferma **Parco Te**, non la vecchia sede via Daino.
- Postumia Gazoldo: registro 5–13 luglio, allegato 28 giugno–13 luglio e
  intestazione 2024. Scheda precedente conservata con data testuale e
  ammissioni da riconfermare, nessuna certezza inventata.

Sabbioneta antiquariato: dieci date 2026 esplicite dalla stampa locale, esclusi
gennaio e agosto; provvedimento amministrativo con accesso JavaScript.

Limiti: calendari puntuali Amarcord/Ostiglia/Solferino, bandi e quote
non recuperati integralmente; alcuni siti amministrativi richiedono JavaScript.
MantovaNotizie risponde 406 al download locale, ma le pagine citate sono state
lette tramite strumenti web. Sagre senza mercato esterno restano nell’audit:
in particolare i siti del Tartufo di Borgofranco e del Riso di Mantova mostrano
cucine e prenotazioni ristorante, non domande per posteggi. Segnalazioni
Guidizzolo, Motteggiana e Baule della Nonna conservate per approfondimento.

L’anagrafica non ha coordinate per i due comuni fusi Borgocarbonara/Borgo
Mantovano: usati, senza modificarla, il punto del record regionale 26623 per
Magnar par strada e la mappa provinciale ufficiale per Revere, con
`coordinateSource` esplicita. Tutti i 12 ID precedenti Mantova conservati;
altre **3.057 schede identiche**. Catalogo totale **3.141**. Build provinciale,
test settori e controlli dati/browser verificano giornate, termini, costi e
coordinate. Cache `fiere.js` **37**, catalogo **30**.

Lavoro in checkout separato `Documents/subingresso-mantova-20261014`:
Venezia resta affidata alla sessione sospesa. Commit dati `d6a96b0`, deploy
Vercel riuscito; HTTP 200, catalogo online SHA-256
`ef19d5def607f78a6ff2a4b39a9441911ed75a962f364a5915c9092b8bccd546`
identico al commit. Verificati 84 risultati, 13 dettagli e filtri settori su
computer e telefono senza errori. Test generale Chromium (1440/820/390/320)
e WebKit (390), settori e controlli provinciali superati; ultimo calendario
puntuale Sabbioneta controllato con le asserzioni finali e il dettaglio browser.
TO DO spuntata dopo verifica: 21 province completate, 89 mancanti.
Alla ripresa delle altre sessioni mantenere Mantova nel build e incrementare
le versioni dal valore attuale. Cambiamenti preesistenti conservati.

Nota tecnica: backup `backup/session-20261014-204832-fiere-mantova-isolata`
pubblicato correttamente; la pulizia automatica dei vecchi tag nello script
esistente ha emesso errori, senza impedirne la creazione. Nessuna correzione
fuori ambito. Gitleaks assente nel checkout isolato: eseguita esplicitamente
la scansione del commit con il binario del checkout principale, esito pulito.


## Ricerca Firenze — 16 ottobre 2026

Ricerca documentale nominale nei **41 comuni**, con **113 manifestazioni in
40 comuni**, rispetto alle tre schede precedenti. Audit riproducibile in
`data/fiere-firenze.json`: fonti, HTTP/hash, ricorrenze, esclusioni e limiti.
Materiali locali in `Documents/ricerca-fiere-firenze-20261016` (192 riscontri
HTTP, pagine/testi/PDF, ricerche e controlli visivi dei documenti operativi).
Non è un censimento esaustivo; per Capraia e Limite nessuna scheda integrata
con prova sufficiente, da approfondire il Settembre Limitese.

Fonti prioritarie: Comuni, MET Città Metropolitana, portali turistici ufficiali,
FIVAG CISL, ANVA/Confesercenti e FIVA, La Fierucola e Pro Loco. Nessuna
partecipazione, disponibilità o gratuità dedotta dalla sola esistenza dell'evento.
I programmi non interamente verificati restano limiti, non date inventate.

- **Firenze Natale**: bando comunale con **23 posteggi**, domanda **23 ottobre**
  via STAR 47.80.01R; abeti **4–24 dicembre**, altre categorie **4 dicembre–5
  gennaio 2027**. Due schede secondo i periodi, non 23 eventi fittizi. **46 €**
  sono diritti/bollo domanda; nuova notifica alimentare eventuale **50 €**,
  canone non ricostruito. Sedi, categorie, misure e limitazioni nel bando.
- **Rionalissima 25 ottobre**: domanda **16 ottobre**, **100 € soci / 200 €**
  ordinaria; 323 posteggi previsti, non disponibilità. **Ognissanti 1 novembre**:
  domanda **14 ottobre**, già scaduta, **110 € associati / 220 €** non associati.
- **Empolissima**: **10 maggio, 11 ottobre e 8 novembre**, termini **1 maggio,
  2 ottobre e 30 ottobre**; scheda esplicita che la scadenza futura vale per
  novembre. 85 posteggi da 7×5 m, 79 non alimentari e sei alimentari. DURC,
  selezione e professionisti, privati esclusi. Suolo dell'organizzatore non
  scambiato per tariffa banco.
- **Prim.OLIO 14–15 novembre**: domanda **26 ottobre**; invito/modulo letti:
  **300 € per spazio** aziende agricole, mercato contadino e commerciali;
  gratuità solo volontariato/Onlus. IVA non specificata; concorso olio distinto.
- **Cèramica Montelupo**: **5–8, 12–13 e 19–20 dicembre**, non apertura
  continua. Bando A professionisti: bollo 16 €, FAQ esenzione canone 25 €/giorno,
  RCT e requisiti; B non professionisti: 25 €/giorno, blocchi 100/50/50 €.
  Domanda originaria 30 settembre prorogata **12 ottobre ore 12**, confermata
  dalla nomina commissione del 14 ottobre; richiesta tesserino **2 novembre**
  non è proroga della candidatura. Partecipazione solo per blocchi completi.
- **Cerbaia**: **7 e 14 giugno**, non tutto il periodo Arte e Sport 4–21;
  spunta su 11 posteggi, canone **13 € non alimentari / 17 € alimentari al
  giorno**, suolo e rifiuti compresi. Figline **25 ottobre e 22 novembre**:
  riservati ai concessionari del martedì, domanda scaduta 1 ottobre.
- **Fucecchio Fiera di Novembre**: banchi **1/3/5/7/8 novembre**, 8–20,
  non otto giorni continui; ordinanze allestimento luna park distinte.
- **La Fierucola**: calendario dell'organizzatore prevale sul portale turistico:
  Santo Spirito **14 giugno**, Carmine **7 giugno**; del Pane **6 settembre**
  dalla pagina specifica, malgrado il 5 nel riepilogo. Legnaioli annullata esclusa.
  Distinti Fierucola terza domenica, Oltrarno seconda e Santo Spirito in Fiera
  quarta. Quote antiquariato/Oltrarno mensili, non giornaliere.
- **Scarperia Collezionisti**: 13 giornate nominative, **6 aprile**, **30 agosto**,
  straordinario **20 dicembre**; niente prima domenica automaticamente.
- **Pratolino**: mercato contadino solo **26 luglio**; laboratori il 27 non
  diventano mercato. Reggello merci solo **14 settembre**, festa 11–15;
  Dicomano Fierone **7 ottobre**, distinto dalla festa 9–11; Barberino fiera
  **19/20/22 settembre**, non il 21. Cavallina alimentari fino a mezzanotte,
  non alimentari fino alle 19. Palazzuolo Tortello domanda **12 maggio**, scaduta.
- **Marradi**: cinque giornate 4/11/17/18/25 ottobre, con avvertenza sul
  sabato 17. Montaione **24–25 ottobre**: notizia con refusi “domenica 26”
  e “20265”, giorni delle diverse aree da riconfermare; menù ristoranti fino
  al 30 novembre non importati come mercato. Londa e Galliano conservano
  storico 2025, senza proiezione sul 2026.
- **Greve**: calendari nominativi per frazione; usato privati (quota ordinaria
  10 €), autoproduzioni (15 € salvo gestione associativa), Montefioralle gratuito
  con posti limitati. Posti esauriti dichiarati dove pubblicati; nessuna
  ammissione generalizzata dei professionisti. Nessuna quota trasferita da
  eventi comunali a iniziative con gestione diversa.
- **CCN**: DD 6464 letta, Good Evening Via Romana a calendario 31 ottobre,
  28 novembre e 13 dicembre, subordinato a istruttoria finale. Via Guelfa
  parere negativo ed eventi culturali esclusi. San Giovanni sospesa esclusa.

Limiti residui: calendari commerciali comunali completi, Capraia, nuovi bandi,
quote non pubblicate, giornate commerciali dei periodi, manifesti e date
storiche ancora da riconfermare. Fiera Agricola Mugellana ha conflitto
4/5 giugno sull'apertura: periodo dichiarato, non ogni settore confermato.
HTTP 403/410/timeout archiviati, letture web dichiarate; 200 HTTP da solo non
certifica contenuti. Le date ricorrenti prive di edizione sono testuali.
Nessun contatto a terzi, candidatura, invio di moduli o pagamento.

Conservati i tre identificativi Firenze e tutte le altre province, incluso
l'aggiornamento regionale e i costi Pisogne. Cache JS **48**, catalogo **39**.
Pubblicazione verificata: commit dati `8975717`, stato Vercel riuscito;
catalogo, JS e pagina online identici al commit. 113 risultati e mappa,
dodici dettagli critici con scadenze/costi verificati in produzione su
Chromium computer/telefono e WebKit telefono. Build, test settori e
`scripts/test-fiere-firenze.cjs` passati; suite generale superata sui cinque
formati/browser (1440/820/390/320 Chromium, 390 WebKit). Prima esecuzione
WebKit interrotta da timeout stabilità hover su scheda La Spezia invariata;
ripetizione con le stesse asserzioni passata, nessuna modifica al prodotto
o alle asserzioni. Test ripetuto soltanto per gli ultimi due formati mancanti.
Lista spuntata dopo controllo online: **28 province completate, 82 rimaste**.
Tavarnelle Val di Pesa usa il punto GeoNames 6534685 presente in
`data/localita.json`, estratto 7 ottobre 2026, CC BY 4.0, perché il comune
fuso non ha coordinate in `comuni.json`; anagrafica condivisa invariata.
Backup di sessione pubblicato; consueti errori nella sola pulizia vecchi tag
non ne hanno impedito la creazione. Gitleaks sul commit pulito.
## Affluenza documentata — 17 ottobre 2026

Decisione corrente: descrivere soltanto il volume di pubblico. Nessun voto
su vendite, margini, organizzazione, notorietà o anzianità dell'evento.
I vecchi dati di rinomatezza restano archiviati e non alimentano i bollini.

Prima ricognizione mirata, non rappresentativa delle 4.214 fiere: 20 casi
con fonti già individuate o consuntivi ricercabili. Archivio separato per ID
stabile: `fiere-affluenza.json`, con 13 resoconti e sette esclusioni motivate.
I 13 resoconti producono quattro bollini e nove sezioni con il dato originale
senza fascia: non sono state inventate assegnazioni nei livelli media/bassa.

Le fasce **editoriali iniziali**, convenzionali e pubbliche, usano la media
per giornata effettiva di apertura: bassa sotto 1.000; media da 1.000 a meno
di 5.000; alta da 5.000 a meno di 20.000; molto alta da 20.000. Le soglie
descrivono volumi assoluti; non densità per metro, clienti per banco o vendite.
Il primo gruppo, dominato da grandi eventi con comunicati pubblici, non è
una calibrazione statistica nazionale. Soglie e versione del metodo vanno
rivalutate esplicitamente quando il campione sarà più ampio.

| Fiera | Dato dell'edizione | Esito iniziale |
| --- | --- | --- |
| San Faustino, Brescia 2026 | oltre 200.000 presenze in un giorno, cronaca locale, metodo non pubblicato | molto alta, **stima riportata** |
| Godega 2026 | 100.000 presenze in tre giorni dichiarate dal Comune | molto alta, **dato dichiarato** |
| FAZI 2025 | oltre 42.000 presenze in tre giorni, consuntivo organizzatore | **almeno** alta, dato dichiarato |
| Tempo Libero 2026 | quasi 40.000 ingressi in quattro giorni, consuntivo organizzatore | alta, dato dichiarato approssimativo |

Nessuno dei quattro casi è presentato come conteggio certificato. Il dato
“quasi 40.000” resta approssimativo; “oltre” è un limite minimo e il bollino
indica “almeno” quando potrebbe essere superata anche la fascia successiva.
Unità originali, area coperta, periodo, fonte, data di consultazione e note
sono accessibili nel dialog e nella pagina autonoma. Le anteprime e i popup
mostrano soltanto le fasce assegnabili, senza righe vuote per gli altri casi.

Visitatori non definiti, visitatori unici e passaggi restano separati da
ingressi/presenze. Non si dividono persone uniche per giorni per ottenere
accessi medi. Scope dell'intera festa o conteggi parziali non producono un
bollino. Alba: 90.000 ingressi riferiti al Mercato, calendario 2025 non
verificato qui, quindi nessuna divisione per tutti i giorni di calendario.
Scandicci: il totale della Fiera non viene trasferito al Fierone del giovedì.
AcquariaItalia: il dato pubblico riguarda il 19–20 settembre, senza B2B del 21.
Pordenonelegge: stima del festival diffuso, senza attribuzione all'area vendite.

I dati scadono dopo al massimo due anni dall'edizione e al termine della
revisione, fissata inizialmente al 17 aprile 2027. Se il catalogo contiene
un'edizione successiva già conclusa, il bollino precedente si sospende e
il dato storico resta leggibile con anno. Nuovi dati richiedono un nuovo
riscontro, non una rivalutazione automatica tramite parole nel nome.

Originali e manifest con stato HTTP e SHA256 fuori dal repository:
`Documents/ricerca-affluenza-fiere-20261017/sources-1792224624229/`.
La rivista Confcommercio su Bovimac è indicizzata ma il PDF diretto risponde
404: usato il resoconto Radio Pico con intervista al presidente della Fiera.
DaniReef diretto risponde 403: usata la pagina ufficiale AcquariaItalia.
VeronaNetwork diretto 403, testo indicizzato consultato soltanto per motivare
l'esclusione dei dati percentuali e delle porzioni, senza assegnare un voto.
Non sono stati contattati organizzatori, associazioni o ambulanti.

Verifiche: build, validazione delle prove, confini delle quattro fasce,
unità e scope non confrontabili, scadenze, iniezione HTML/URL, preservazione
dei campi precedenti e interazioni browser in `scripts/test-fiere-attendance.cjs`.
La copertura resta parziale e dovrà proseguire con consuntivi equivalenti.

Pubblicazione d3d36e2, Vercel READY dpl_7yVZ4YRacJNdyDuBU3gY69TLw8MF.
HTML, JavaScript, entrambi i CSS e catalogo online identici al commit.
Verificate le 13 pagine autonome e le interazioni sul sito pubblico con
Chromium 1440/320 e WebKit 390; build, settori, pagine, archivio dei vecchi
bollini e suite calendario su cinque formati/browser passati localmente.
Preservati tutti i campi precedenti delle 4.214 manifestazioni.

## Affluenza — secondo gruppo di 20, 17 ottobre 2026

Verificati 20 ID prima assenti sia da `events` sia da `exclusions`:
12 fiere tradizionali, quattro mercatini e quattro fiere espositive.
Nessuna nuova manifestazione aggiunta al catalogo. Ricerca limitata al pubblico,
senza contatti a organizzatori o ambulanti e senza altre sessioni o subagenti.
Otto resoconti aggiunti, dei quali sette senza fascia; dodici esclusioni con
fonti e motivazioni. Copertura cumulativa: 40 ID (21 resoconti e 19 esclusioni).
Le esclusioni attestano l'esito di questa ricerca, non assenza di pubblico.

| Fiera esaminata | Ultima edizione ricercata e risultato |
| --- | --- |
| Oh Bej! Oh Bej!, Milano | 5–8 dicembre 2025, quattro giorni: atto comunale e cronaca senza totale numerico |
| San Martino, Inveruno | 14–17 novembre 2025: programma, notiziario comunale e cronaca senza consuntivo numerico utilizzabile |
| Santa Caterina, Gorgonzola | 29–30 novembre 2025: programma e ambulanti, nessun totale pubblico verificato |
| Sant'Andrea, Oggiono | 2025: banchi 26–27 ottobre distinti dal programma 24–27; nessun totale numerico verificato |
| Crocifisso, Cantù | 19 ottobre 2025: giornata comunale documentata, nessun consuntivo numerico verificato |
| San Giuseppe, Cernusco sul Naviglio | 15 marzo 2026: sold out riferito agli espositori; nessun totale pubblico |
| San Biagio, Magenta | 3 febbraio 2026: cronaca qualitativa condizionata dal maltempo, nessuna fascia dedotta |
| Primavera, Paderno Dugnano | 22 marzo 2026 per i banchi, programma 21–23: migliaia annue generiche, non consuntivo |
| Santa Apollonia, Rivolta d'Adda | Banchi 8–9 febbraio 2026 distinti dai convegni: nessun totale pubblico verificato |
| Santa Lucia, Crema | 11–12 dicembre 2025: cronaca senza cifre; non confusa con Lodi o Santa Lucia di Piave |
| Antiquaria, Arezzo | 3–4 ottobre 2026: avviso comunale e cronaca, nessun totale pubblico; esclusi numeri di altri eventi |
| Cose d'altri Tempi, Piazzola sul Brenta | 27 settembre 2026 nella Pro Loco: nessun dato separato da Fiori e Colori; conflitto con 20 settembre nel calendario di catalogo conservato e segnalato |
| Nuova Millenaria, Gonzaga | 4–8 settembre 2026, cinque giorni: oltre 25.000 presenze dichiarate dal presidente, metodo non pubblicato; algoritmo: **almeno alta**, oltre 5.000/giorno |
| Fieracavalli, Verona | 6–9 novembre 2025, quattro giorni: oltre 140.000 visitatori e operatori, unità non definita, senza bollino |
| Ortogiardino, Pordenone | 7–15 marzo 2026, nove giorni: oltre 60.000 ingressi congiunti Ortogiardino–Cucinare; senza bollino per la singola fiera |
| Sant'Ambrogio, Merate | 7–8 dicembre 2025: 13.011 visitatori, 17.642 visite con residenti; celle telefoniche, area cittadina/festa diffusa, senza bollino |
| Santi Faustino e Giovita, Sarezzo | Fiera 20–24 febbraio 2026: 34.000 presenze riportate alle 19 del sabato, finestra cumulativa non definita; dato parziale, senza bollino |
| Mostra San Giuseppe, Casale Monferrato | 13–22 marzo 2026, dieci giorni: prima stima circa 143.000 visitatori, in linea con 2025 e leggero rialzo non quantificato; senza bollino |
| Natale, Trento | 21 novembre 2025–6 gennaio 2026: circa 750.000 presenze stimate, contesto natalizio cittadino non isolabile; giorni effettivi non verificati, senza bollino |
| Natale, Bolzano | 28 novembre 2025–6 gennaio 2026: circa un milione di visitatori, stima riportata e contestata; metodo/perimetro non verificati, senza bollino |

Nuovi bollini calcolati esclusivamente dall'algoritmo esistente: bassa 0,
media 0, alta 1, molto alta 0. Totali ora: tre alta, due molto alta e
16 resoconti senza fascia. Conservati integralmente i 13 resoconti e le
sette esclusioni precedenti; nessuna modifica a soglie, interfaccia o criteri.

Merate: il comunicato originale scrive «7 e 8 ottobre», pur indicando domenica
e lunedì; programma comunale e cronache concordano sul 7–8 dicembre.
Il refuso è esplicitato nel resoconto e conservato nell'originale.
Millenaria: la pagina ufficiale ha titolo 2025, programma 2026 e 35.000
visitatori promozionali annui: non usati come consuntivo 2026.
Bolzano: il milione è una cifra controversa, non validata da questa ricerca;
i pernottamenti comunali e i picchi giornalieri non diventano ingressi medi.
`openDays: 0` significa durata effettiva del conteggio non verificata,
mai zero giorni o zero pubblico. Nei resoconti restano area, unità, limiti,
stima/dichiarazione e metodo disponibile; le celle telefoniche di Merate
sono descritte nelle note, senza inventare una nuova categoria di conteggio.

Originali, testi estratti, ricerche, manifest HTTP/SHA256 e confronto iniziale
fuori repository: `Documents/ricerca-affluenza-fiere-20261017/sessione-02/`.
56 URL archiviati; limiti distinti del download diretto: YesMilano e due
LeccoNotizie 403, Pro Cantù 500, programma Paderno 404, pagina turismo
Bolzano 410. Usate alternative leggibili; alcune pagine sono leggibili via
browser di ricerca ma falliscono al download. ABIO inizialmente in timeout
via ricerca è stato poi letto direttamente; Spallanzani mostra una pagina
antibot, sostituita con calendario regionale e scheda evento.
Backup remoto `backup/session-20261017-123732-affluenza-altre-20` verificato;
lo script segnala il noto errore PowerShell nella pulizia dei vecchi tag.
Cache catalogo 49 e fiere.js 69. Pubblicazione e controlli finali sotto.

Controlli locali passati: build, settori, `scripts/test-fiere-attendance.cjs`
(confini, scadenze, unità/scope, 21 resoconti, browser Chromium 1440/320 e
WebKit 390), `scripts/test-fiere-pages.cjs` (4.214 pagine/1.515 sitemap),
suite generale calendario su cinque formati/browser, sintassi e diff.
Confronto JSON integrale: tutti i campi precedenti del catalogo, i 13
resoconti e le sette esclusioni iniziali invariati. File estranei preservati.

Pubblicazione dati `73aadd8`, Vercel READY
`dpl_ALkaRg8Dqny9ekQQTpmoGpKCgK6K`. Catalogo e registro pubblico identici
ai JSON locali, HTML e JS identici dopo normalizzazione CRLF/LF.
Tutte le 20 pagine pubbliche HTTP 200 con presenza/assenza del bollino coerente.
Verificati gli otto nuovi resoconti, testo delle note e collegamenti delle
fonti su Chromium 1440/320 e WebKit 390; Millenaria e Merate controllate anche
nel dialog del calendario. Nessun errore JavaScript o overflow rilevato.
`scripts/test-fiere-attendance.cjs` passato anche sul sito pubblico nei tre
formati/browser, inclusi popup, fonti e dati senza bollino.
Ricontrollati dopo la pubblicazione tutti i 56 URL: le otto fonti principali
dei nuovi resoconti sono HTTP 200. Pro Cantù è tornata HTTP 200; restano i
403/404/410 già documentati, con alternative leggibili e originali conservati.
Riscontri successivi in `sessione-02/dopo-pubblicazione/`, esiti browser in
`verifica-online.json` e schermate nella stessa cartella della sessione.
Nessun nuovo bollino attribuito ai dodici casi privi di dati sufficienti.


Affluenza, 17 ottobre 2026 - preferenza corrente: eliminato "almeno" dai bollini. Sei fasce di ingressi/presenze medi al giorno: molto bassa <500; bassa 500-999; media 1.000-4.999; alta 5.000-19.999; molto alta 20.000-99.999; altissima da 100.000. Altissima riservata a volumi eccezionali, senza certificare primati storici: bollino dorato con luce e riflesso, movimento disattivato con prefers-reduced-motion. Fonti, stime e limiti "oltre" nei dettagli; catalogo invariato. Supera le quattro fasce precedenti. Cache fiere JS74/CSS27, fiera CSS3. Test affluenza Chromium1440/320 e WebKit390 passati, incluse nuove soglie, luce e movimento ridotto; 4.322 pagine e 1.625 voci sitemap, navigazione senza JS e dialog verificati. Pubblicato 91d4408; Vercel READY dpl_G1ypKP3vSAnYX6LXCj5Wh66eAPQX. Test dedicato passato anche online Chromium1440/320 e WebKit390; JS/CSS identici al commit e pagina San Faustino con altissima verificata.
