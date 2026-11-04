
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
