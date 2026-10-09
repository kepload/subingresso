# Calendario fiere — fonti e aggiornamento

Pagina pubblica `/fiere`, senza database né servizi cartografici a pagamento.

Aggiornamento del 9 ottobre 2026: 836 manifestazioni in 20 regioni, 671 con dati
di edizione e 588 con almeno una data esatta pubblicata. La selezione originaria
di 200 eventi è integrata da calendari regionali ufficiali e approfondimenti
presso Comuni e organizzatori. Non è un censimento nazionale completo, né una
classifica per affluenza. La copertura è più ampia in Piemonte (258), Marche
(217) e Lombardia (191); le altre regioni mantengono dieci eventi ciascuna.

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

`fiere-importate.json` conserva data del download, SHA-256 delle tre fonti,
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

L'importatore non accede alla rete; il build non richiede dipendenze esterne.
Aggiornare la data di consultazione solo dopo una nuova ricerca. Le modifiche
editoriali mantengono priorità sui dati regionali della stessa edizione.
Per aggiornare gli asset, aumentare `?v=` in `fiere.html` e `js/pages/fiere.js`.
Il conteggio nell'interfaccia viene letto dal catalogo, senza valori fissi.

## Mappa e licenza

`italia-regioni.json` contiene confini regionali derivati da ISTAT tramite
[geojson-italy di Guglielmo](https://github.com/guglielmo/geojson-italy),
distribuiti con licenza [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Fonte scaricata l'8 ottobre 2026:
https://raw.githubusercontent.com/guglielmo/geojson-italy/main/geojson/limits_IT_regions.geojson

Modifiche: rimozione delle proprietà non necessarie, semplificazione delle linee
a 0,012 gradi e arrotondamento a quattro decimali. Uso esclusivamente illustrativo.
Per rigenerare la mappa dal file originale scaricato:
`python scripts/build-fiere.py --boundaries percorso/limits_IT_regions.geojson`.

La mappa SVG raggruppa eventi vicini; selezionare una regione ingrandisce la zona.
Ogni gruppo permette di aprire tutte le sue schede. Elenco e puntini usano gli
stessi filtri; gli intervalli possono attraversare dicembre/gennaio. I filtri
sono condivisibili attraverso la URL. Non vengono salvati dati degli utenti.
