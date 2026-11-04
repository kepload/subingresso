
## Articoli incompleti e ordine del periodo — 20 ottobre 2026

Preferenza esplicita: scegliendo una tipologia, conservare anche le fiere
con categorizzazione assente o parziale. `matchesArticles()` ammette i casi
non documentati e rimuove soltanto le incompatibilità esplicite e attuali
già riconosciute da `articleAffinity()`. Rimangono le cautele su fonti vecchie,
operatori/aree specifiche e somministrazione. Più articoli sono in OR;
gli altri filtri restano applicati. Contatori e mappa usano la stessa regola.
`articleTypes()` e i punteggi non cambiano: l'assenza di prove resta «Da valutare».
Catalogo5.292 invariato; calzature29 documentate,5.292 risultati non esclusi.

Con mesi selezionati, `selectEdition()` sceglie fra le edizioni che ricadono
nei mesi richiesti partendo dal primo giorno del primo mese, anziché da oggi.
`sortEvents()` applica lo stesso riferimento: giorni trascorsi nello stesso
periodo inclusi, ricorrenze pertinenti, intervalli fra mesi e dicembre–gennaio
con anni reali. Date non puntuali restano distinte dalle date precise; nessuna
edizione futura dedotta. Senza mesi selezionati la precedenza esistente resta.
Stessa scelta in elenco, popup della mappa, URL/ripristino e Mostra altre fiere.
Cache `fiere.js`94; nessun dato, disponibilità, pagamento o promemoria modificato.

Verifiche: articoli, affinità e ricerca Chromium1440/820/320 e WebKit390 passati;
calendario generale320, settori e185.220 coppie fiera/articolo passati. Prova
mirata con fixture isolate: giorno1, passato, categorie parziali, esclusione,
ricorrenza, caricamento, reload, intervallo e cambio anno passati nei tre casi
Chromium1440/320 e WebKit390. Corretto MIME `.mjs` nei server delle tre suite;
primi fallimenti limitati al runner/aspettative obsolete e risolti. Artefatti
`Documents/verifica-fiere-filtro-date-20261020/`, checkout isolato
`Documents/subingresso-fiere-filtro-date-20261020`. Backup remoto verificato,
noto errore cleanup PowerShell. Pubblicato `6ddbb73`, Vercel
[riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/44FfaH9zJZdxz8tgutXsgwPhpX2K).
HTML/JS pubblicati identici al codice verificato; prova periodo ripetuta sugli
asset pubblicati Chromium1440/320 e WebKit390 e tre prove anonime/API reali
passate negli stessi casi. Brescia/ottobre parte dal3ottobre, prima data
documentata disponibile, con schede non classificate visibili e «Da valutare».
Nessuna scrittura reale. Registro Asti85bb41a preservato nel rebase.
