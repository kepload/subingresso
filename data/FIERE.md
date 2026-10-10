# Calendario fiere — fonti e aggiornamento

Pagina pubblica `/fiere`, senza database né servizi cartografici a pagamento.

Aggiornamento del 10 ottobre 2026: 1.927 manifestazioni in 20 regioni, 1.768 con dati
di edizione e 1.513 con almeno una data esatta pubblicata. La selezione originaria
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
`node scripts/test-fiere.cjs`. Cache fiere.js 17, fiere.json 10.

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
La to do list registra Brescia e Lodi completate e le altre 108 unità territoriali da approfondire.

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

## Modificare gli eventi

- `fiere-fonti.json`: schede editoriali, con fonte HTTPS per ogni evento.
- `fiere-importate.json`: snapshot normalizzato dei calendari regionali.
- `fiere-brescia.json`: ricerca provinciale verificata; prevale sugli import di Brescia.
- `fiere-lodi.json`: ricerca di Lodi, copertura dei 60 comuni e riscontri da completare.
- `fiere.json`: asset pubblico generato; non modificarlo direttamente.
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
Cache: fiere.js v=16, fiere.css v=10, fiere.json v=9, italia-province.json v=1.
