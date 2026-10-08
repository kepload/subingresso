# Calendario fiere — prima versione

Pagina pubblica `/fiere`, senza database né servizi cartografici a pagamento.

Il catalogo è una selezione editoriale di 200 eventi, dieci per regione, con fiere
tradizionali, mostre mercato, sagre, feste, mercatini ed esposizioni. Non è una
classifica certificata delle dieci manifestazioni più visitate. Le fonti di ogni
scheda sono state ricercate l'8 ottobre 2026; i mesi sono orientativi, non date
confermate di una futura edizione. I riferimenti storici e le manifestazioni
biennali sono segnalati nelle schede. Nessun link costituisce un bando attivo.

## Modificare gli eventi

- `fiere-fonti.json`: catalogo curato da aggiornare, con fonte HTTPS per ogni evento.
- `fiere.json`: asset pubblico generato; non modificarlo direttamente.
- `comuni.json`: coordinate dei comuni, già usate dal sito. Il puntino indica il
  centro del comune e non il luogo preciso dell'evento o l'ingresso.
- `python scripts/build-fiere.py`: rigenera il catalogo, controllando comuni,
  mesi, categorie, identificativi univoci e dieci eventi per regione.
- `node scripts/test-fiere.cjs`: controlli del catalogo e test browser. Impostare
  `PLAYWRIGHT_MODULE` se Playwright è installato fuori dal progetto.

Per aggiornare gli asset, aumentare i riferimenti `?v=` in `js/pages/fiere.js`.
Per ampliare il numero di eventi, aggiornare anche la validazione e i testi
con il conteggio nella pagina e in home. Non inventare date esatte: una futura
evoluzione dovrà distinguere l'evento ricorrente dalla singola edizione, con
date di inizio/fine, fonte e data di verifica, luogo, bando, contatti e posteggi.

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
