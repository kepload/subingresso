
## Filtri per settore merceologico — 10 ottobre 2026

### Tipologie di articolo e selezione multipla — 17 ottobre 2026

Su richiesta, filtro principale «Tipologia di articolo» tra «Cosa vendi» e
«Tipo di evento»: 31 scelte in sei gruppi, checkbox combinabili anche tra
gruppi diversi. Le tipologie selezionate sono in **OR**; settore, territorio,
mesi, evento e testo rimangono in **AND**. Contatori delle opzioni calcolati
senza il filtro articoli, rispettando gli altri filtri. Scelte visibili e
rimuovibili singolarmente; «Deseleziona tutte» riguarda soltanto gli articoli,
«Azzera filtri» azzera tutto. Con un macrosettore si mostrano le tipologie
pertinenti e si eliminano le selezioni incompatibili. URL `articoli=id,id`,
valori ripetuti/ignoti scartati e selezione conservata al ricaricamento.

Classificazione condivisa browser/SSR in `articleTypes()` di `fiere.js`,
esclusivamente sul campo `sectors` già documentato. Nessuna attribuzione dal
nome, da «merci varie», da artigianato generico o dalla categoria evento.
Esclusioni esplicite ignorate; divieto di somministrazione distinto dalla
vendita documentata. Copertura iniziale: **1.512 su 4.322 schede**; intimo e
detergenti non hanno ancora riscontri espliciti. Non è una nuova ricerca né
garanzia di ammissione. Catalogo, ID, fonti e macrosettori invariati. Dettagli
nel dialog e nelle pagine autonome allineati; menu scorrevole che si apre
verso lo spazio disponibile, checkbox e rimozioni alte almeno 44 px.

Cache JS72/CSS25, JSON51 invariato. Test dedicato
`scripts/test-fiere-articles.cjs` (opzionali `PLAYWRIGHT_MODULE`,
`FIERE_TEST_BASE_URL`, `FIERE_ARTICLES_OUTPUT`): classificazioni, esclusioni,
OR/AND, conservazione catalogo, URL/ricaricamento, reset, tastiera, elenco,
mappa, schede e overflow su Chromium 1440/820/320×568 e WebKit390.
Schermate in `Documents/verifica-filtri-articoli-20261017/`.
Verifiche locali passate: test dedicato, suite generale calendario su cinque
formati/browser, 4.322 pagine/1.625 sitemap, settori e sintassi. Backup tag
remoto prima delle modifiche; cleanup locale con errore PowerShell noto.
Pubblicato `663df3f`, Vercel riuscito
`8NTFyGveCu85Amu589Fu5YYDZGem` (stato GitHub/Vercel success).
HTML, JS72, CSS25 e catalogo pubblico identici ai locali dopo normalizzazione
CRLF/LF. Test dedicato passato anche online nei quattro formati/browser;
riga «Tipologie di articolo» verificata nella pagina autonoma pubblica.
Esiti di pubblicazione e copertura in `pubblicazione.json`/`copertura.json`
nella cartella delle prove. Nessuna modifica al DB o comunicazione a terzi.

### Affinità articolo — 17 ottobre 2026

Intervento successivo spazi filtri: campi principali in2×2, oppure etichetta
96px/campo sui telefoni e nei pannelli tablet stretti. Ridotti margini,
padding e titoli, mantenendo controlli/mesi ≥44px e il menu articoli aperto
senza overflow. CSS28, JS74 e JSON51 invariati. Suite articoli sui quattro
formati/browser passata; confronto sette casi in
`Documents/verifica-spazi-fiere-20261017/misure.json`: a697px altezza
613→395; a390px613→445, a320px519→495. Ricerca di una valutazione
articoli più precisa in corso separatamente: nessun nuovo punteggio in
questo intervento di sola disposizione dei filtri.

Richiesta: stima prudente di pertinenza dell’articolo, su10, nella parte
destra delle anteprime e con colori rosso→verde. Nessuna previsione di
vendite, incassi, affluenza, concorrenza o ammissione. Algoritmo editoriale
trasparente `articleAffinity()`/`articleAffinitySummary()` in fiere.js:

- **8:** articolo esplicitamente citato, soli prodotti della stessa famiglia
  e assenza di indicazioni di offerta generica; **7:** citato tra merci varie
  o settori diversi; **6:** famiglia merceologica vicina, articolo non citato.
- **2:** esclusione esplicita dell’articolo/settore o solo settore opposto,
  senza ambiguità su operatori/aree/eccezioni; fonte HTTPS con data valida
  non futura, consultata entro180 giorni, edizione ancora attuale/futura.
- Mancanza di prove, limiti per hobbisti/operatori/aree, vecchie edizioni o
  fonti non recenti: **Da valutare**, senza voto né rosso. Divieti di sola
  somministrazione non escludono la vendita. Nessun negativo dal nome o dal
  tipo evento; non assegnati9/10 o10/10 senza ulteriori evidenze.

Filtri articoli precedenti conservati: elenco selettivo invariato. Con più
articoli il riquadro mostra il migliore con dicitura «Migliore su N»; dialog
accessibile con tutti i singoli voti, motivi, fonte/testo originale, scala e
limiti. Nessun articolo: pulsante «Scegli articolo» apre il filtro. Target
almeno44 px e contrasto ≥4,5:1. Nessuna modifica a catalogo, ID o fonti.

Controllate133.982 coppie (4.322×31): 7 voti2, 7.243 voti6, 1.558 voti7,
888 voti8 e124.286 senza voto. I sette negativi sono i soli articoli
alimentari a Natale Cento: la fonte regionale 2026, ricontrollata HTTP200
il17 ottobre, conferma «previsto misto ma attualmente solo settore non
alimentare». Prato Sesia: limitazioni reali ma edizione conclusa11 ottobre,
quindi nessun negativo trasferito al futuro. TUTTOMELE: regole hobbisti
non generalizzate alle bancarelle. Questi conteggi non sono nuove ricerche.

Cache JS73/CSS26, JSON51 invariato. Test dedicato
`scripts/test-fiere-affinity.cjs`: unità, freschezza/eccezioni, tutti i valori
del catalogo e browser Chromium1440/820/320×568 + WebKit390 passati.
Regressioni articoli sui quattro formati, affluenza sui tre formati e suite
generale calendario320 passate; schermate in
`Documents/verifica-affinita-fiere-20261017/`. Backup remoto verificato
`backup/session-20261017-221322-affinita-articolo-fiere`; script interrotto
dal noto wrapping PowerShell sullo stderr nativo, tag remoto presente.
Pubblicato `bf960e2`, Vercel riuscito
`4Dd19MfhDceoL3Br6qebWVKzbb73`; HTML, JS73, CSS26 e JSON51 identici ai
locali normalizzando CRLF/LF. Test dedicato passato anche online nei quattro
formati/browser; voti reali verificati e fixture isolate per rosso/incertezza,
senza scrivere dati di prova. Esiti e fonte Cento nella cartella delle prove.

### Macrosettori

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
`node scripts/test-fiere.cjs`. Cache fiere.js 20, fiere.json 13.
