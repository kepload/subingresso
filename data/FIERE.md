# Calendario fiere — fonti e aggiornamento

Pagina pubblica `/fiere`, senza database né servizi cartografici a pagamento.

Aggiornamento del 9 ottobre 2026: 1.728 manifestazioni in 20 regioni, 1.574 con dati
di edizione e 1.331 con almeno una data esatta pubblicata. La selezione originaria
di 200 eventi è integrata da calendari regionali ufficiali e approfondimenti
presso Comuni e organizzatori. Non è un censimento nazionale completo, né una
classifica per affluenza. Aggiunte 892 manifestazioni rispetto alle precedenti 836,
conservando tutte le schede già presenti. La copertura è più ampia in Liguria (632),
Piemonte (258), Marche (217), Lombardia (191), Veneto (170) ed Emilia-Romagna (120);
le altre regioni mantengono dieci eventi ciascuna.

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

## Modificare gli eventi

- `fiere-fonti.json`: schede editoriali, con fonte HTTPS per ogni evento.
- `fiere-importate.json`: snapshot normalizzato dei calendari regionali.
- `fiere.json`: asset pubblico generato; non modificarlo direttamente.
- `comuni.json`: coordinate dei comuni, già usate dal sito. Il puntino indica il
  centro del comune e non il luogo preciso dell'evento o l'ingresso.
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
Cache: fiere.js v=11, fiere.css v=10, fiere.json v=5, italia-province.json v=1.
