
## Rinomatezza — 16 ottobre 2026

Indicatore editoriale di notorietà e storia, distinto da compatibilità della
merce, qualità organizzativa, posti disponibili, incassi e date confermate.
Tre livelli e uno stato neutro:

- **Rinomata**: riscontri espliciti di richiamo ampio o sovralocale, da fonte
  istituzionale, organizzatore, associazione di categoria o cronaca datata.
  Un titolo «nazionale», una grande città o molti posteggi da soli non bastano.
- **Consolidata**: almeno 10 edizioni o 10 anni di storia documentati, senza
  elementi sufficienti in questa valutazione per attribuire richiamo più ampio.
  Non garantisce continuità ininterrotta né conferma una nuova edizione.
- **Recente**: prima, seconda o terza edizione esplicitamente documentata,
  con riscontro nell'anno corrente o precedente; nessun giudizio negativo.
- **Da valutare**: prove insufficienti, dato non valido o revisione scaduta;
  non equivale a nuova, sconosciuta, poco frequentata o scadente.

Archivio indipendente `fiere-rinomatezza.json`, per ID stabile. **41 valutazioni
iniziali su 3.972 schede: 13 Rinomata, 25 Consolidata, 3 Recente**; le altre
3.931 restano da valutare. Copertura dichiarata nella legenda. Non è una
ricerca completa della rinomatezza delle fiere nazionali. Nessun numero o
livello attribuito per riempire i dati mancanti. Gli audit provinciali
pregressi forniscono numeri di edizione e proprie fonti già documentati;
questa sessione aggiunge il controllo delle fonti di richiamo e debutto.

Ogni valutazione ha motivo, prove, link, anno del riscontro, data editoriale
e termine di revisione. `year` è l'anno dell'edizione quando esplicito;
per le descrizioni permanenti senza anno è l'anno della consultazione, non
una data di fondazione o un'affluenza inventata. Il build verifica livelli,
prove minime, anni, URL, date e corrispondenza ID, rifiuta record non validi;
la revisione scade entro due anni, per Recente entro l'anno successivo al
riscontro. Il browser degrada a Da valutare dopo il termine. La valutazione
editoriale della portata è qualitativa, non un punteggio scientifico.

Esempi e limiti: San Faustino Brescia usa la cronaca di ÈliveBrescia TV del
15 febbraio 2026 (oltre 200.000 presenze riportate), insieme all'organico
comunale di 602 posteggi. Sant'Orso Aosta: pubblico italiano e straniero
secondo CNA, cifra annua dichiarata, non conteggio certificato da noi.
Alba: 90.000 ingressi al Mercato Mondiale nel 2025, non 600.000 ingressi
alla fiera ricavati dai flussi turistici di tutto il territorio. Cuneo e
Stegona: la valutazione dell'evento principale non si propaga ai mercati
straordinari o ad altre ricorrenze nella stessa località. Mozzate: seconda
edizione del 2025, non 2026 nonostante l'aggiornamento della pagina comunale.
Primaluna: debutto della Fiera della Luna distinto dalla festa patronale.
Maggiora esclusa dalla valutazione Recente: brochure della prima edizione
storica non prova il numero d'edizione corrente. Brentonico esclusa: il
testo «non aggiunti come seconda edizione» riguarda un rinvio, non l'anzianità.

UI: bollino apribile nelle card, livello nei popup mappa, motivo e fonti
nel dettaglio; filtro combinabile con mesi/zona/settore/tipo/nome, URL
`rinomatezza=rinomata|consolidata|recente|unknown`, azzeramento completo.
Cache JS50/catalogo41/CSS14. Le 3.972 identità e tutti i campi preesistenti
restano invariati; le valutazioni sono aggiunte dopo gli audit provinciali.
Test dedicato `scripts/test-fiere-reputation.cjs`: prove/negativi/scadenza,
conservazione catalogo e flussi browser. Build e settori passati; suite
generale superata nei cinque formati/browser, con nuova verifica a 320 px
dopo aver compattato i filtri sui telefoni più stretti. Test dedicato
Chromium computer/telefono e WebKit passato localmente e in produzione.
Pubblicato con commit **93fbcc1**, Vercel READY
`dpl_GrgvRv34HYtETDxRRTAz1rMczAep`; HTML, JS, CSS e catalogo online
identici al commit, con terminazioni di riga normalizzate. Verificati online
i quattro stati, fonti del dettaglio, combinazione provincia/rinomatezza,
mappa, URL e ricaricamento, tastiera, reset e assenza di overflow.
Test con autenticazione e tracking esclusi per evitare dati artificiali.
