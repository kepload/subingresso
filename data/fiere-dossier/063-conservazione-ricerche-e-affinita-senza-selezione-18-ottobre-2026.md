
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
