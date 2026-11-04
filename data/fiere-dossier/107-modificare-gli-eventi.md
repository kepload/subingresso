
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
