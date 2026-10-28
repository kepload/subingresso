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

Il selettore restituisce le regioni `Trentino-Alto Adige` e `Valle d'Aosta`.
La validazione server degli annunci riconosce anche questi nomi brevi rispetto
alle denominazioni bilingui dell'anagrafica privata; comune e provincia devono
comunque corrispondere esattamente. Sono accettati anche i nomi bilingui storici,
senza riscrivere dati o duplicare località. Patch riapplicabile
`PATCH_LISTING_LOCATION_REGIONS_20261028.sql`; regressione server
`node scripts/test-listing-location-regions.cjs` (transazione con ROLLBACK).

Dal 28 ottobre 2026 il passo 2 conferma la scelta tramite la RPC pubblica di
sola lettura `validate_listing_location(comune, provincia, regione)` (argomenti
`p_comune`, `p_provincia`, `p_regione`). Restituisce solo un booleano e usa
`data_quality.listing_location_valid`, la stessa regola privata chiamata dalla
validazione finale. La tabella geografica resta privata. Non ci sono copie
aggiuntive dell'anagrafica o valori accettati soltanto dal browser.

Avanti attende la conferma; errori di rete/timeout restano al campo con retry e
bozza conservata. Doppio invio, cambio località, account e navigazione non fanno
avanzare con una risposta vecchia. Una bozza ripresa al passo 6 viene verificata
prima degli upload; un rifiuto geografico finale torna al passo 2 con un messaggio
leggibile. Patch `PATCH_LISTING_LOCATION_PREFLIGHT_20261028.sql`.

Prima di pubblicare cambiamenti ad anagrafica, selettore o validazione eseguire
`node scripts/audit-listing-locations.cjs`: legge tutte le voci attraverso il
loader effettivo del selettore e confronta ogni combinazione con preflight e
validazione completa del database, comprese le forme regionali storiche. Non
inserisce annunci. Ultimo audit: 7.894 comuni + 55.288 località = 63.182,
zero rifiuti; dati online semanticamente identici a quelli verificati.
