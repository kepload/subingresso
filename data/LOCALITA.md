# Frazioni, quartieri e località italiane

`localita.json` integra i comuni ufficiali di `comuni-picker.json` con 55.288
località, senza modificare il dataset delle landing SEO `comuni.json`.

Fonti: [GeoNames](https://www.geonames.org/) (estratto italiano scaricato il
7 ottobre 2026) e [ISTAT / geojson-italy](https://github.com/guglielmo/geojson-italy)
(confini comunali 2026). Entrambe sono distribuite con licenza
[Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/).
L'asset è un'elaborazione: selezione dei centri attuali, collegamento ai comuni
ISTAT del sito, gestione dei cambi di codice e delle fusioni, deduplicazione e
coordinate arrotondate a cinque decimali. La classificazione include frazioni,
quartieri e piccoli insediamenti, senza attribuire a tutti lo status di frazione.

Si escludono centri abbandonati, storici, distrutti e le sedi con lo stesso nome
del comune già presente. Un comune viene associato tramite codice amministrativo
GeoNames, anagrafica dopo fusioni/cambi di codice, oppure poligono ISTAT contenente
il punto. Le 28 località senza un collegamento affidabile vengono escluse;
non si usa il comune più vicino. La fonte non garantisce la copertura di ogni
località italiana. Hash delle fonti, conteggi e schema sono nell'asset JSON.

Rigenerazione (Python, nessuna dipendenza aggiuntiva): scaricare fuori dal repo
`https://download.geonames.org/export/dump/IT.zip` e
`https://raw.githubusercontent.com/guglielmo/geojson-italy/main/geojson/limits_IT_municipalities.geojson`,
poi eseguire:

```powershell
python scripts/build-localita.py PERCORSO_IT.zip PERCORSO_CONFINI.geojson
```

Ogni riga compatta contiene `[geonameId, nome, codiceIstatComune, lat, lng,
aliases?]`. Il loader recupera provincia e regione dal comune ufficiale.
La selezione usa `geonames:ID`; nei dati dell'annuncio si conserva
`Località (Comune)` nel campo `comune` esistente, per distinguere gli omonimi
anche nella stessa provincia e recuperare bozze e annunci senza cambiare schema.
