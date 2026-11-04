
## Ricerca approfondita — territorio di Trieste

Ricerca dell’11 ottobre 2026 nei **sei comuni**: Trieste, Muggia, Duino Aurisina,
San Dorligo della Valle, Monrupino e Sgonico. Da una scheda a **24 manifestazioni
in quattro comuni** (+23); 22 con edizioni 2026 e due con storico 2025. Tutte hanno
almeno una giornata pubblicata, ma lo storico non conferma una nuova edizione.

Fonti: Comuni/SUAP, [Discover Trieste](https://www.discover-trieste.it/vivi/trieste-now),
PromoTurismoFVG, organizzatori e associazioni. Il
[calendario fieristico regionale del 5 maggio 2026](https://www.regione.fvg.it/rafvg/export/sites/default/RAFVG/economia-imprese/commercio-terziario/FOGLIA102/documentazione/Calendario_fiere_regionale_2026_ver_05_05_2026.pdf)
contiene due manifestazioni triestine: Olio Capitale e Triestespresso Expo;
entrambe riscontrate con i siti degli organizzatori e distinte dalle fiere ambulanti.
`fiere-trieste.json` conserva copertura comunale, 45 URL, hash dei download,
testi comunali letti in Chromium, esclusioni e verifiche residue. Originali HTML,
PDF e testi fuori repository in `Documents/ricerca-fiere-trieste-20261011`.
Un HTML comunale può essere solo un guscio JavaScript: le informazioni operative
sono state lette nella pagina renderizzata e negli allegati, non dedotte dal codice HTTP.

Informazioni operative verificate:

- [San Nicolò 2026](https://www.comune.trieste.it/it/novita-227102/notizie-227103/partecipazione-operatori-commerciali-fiera-di-san-nicolo-di-trieste-28-novembre-6-dicembre-2026-326318),
  28 novembre–6 dicembre: PEC per interesse agli eventuali posteggi residui,
  dopo esaurimento della graduatoria. Recapiti e documenti richiesti nella scheda;
  nessuna disponibilità garantita o scadenza inventata.
- [Mercatino antiquario di Trieste](https://www.comune.trieste.it/it/mercatino-dellantiquariato-e-dellusato-210668):
  domande per il **2027 dal 19 ottobre al 18 novembre 2026**, sorteggio primo
  semestre 20 novembre ore 10; ammessi anche commercianti di settore. SUO,
  graduatorie, pagoPA e assegnazione giornaliera dei posti non occupati entro 8:30.
  Scadenza dichiarata per il 2027, separata dalle 13 giornate pubblicate del 2026.
  Inserite anche le **13 giornate 2027** approvate con delibera 536 del 5 ottobre
  2026, compresa la data aggiuntiva Barcolana del 10 ottobre 2027.
- [Barbacan Produce, regolamento 2026](https://www.barbacanproduce.com/wp-content/uploads/2026/01/Regolamento-BP-2026.pdf):
  13 dicembre, candidatura 30 ottobre–8 novembre; 80 euro IVA inclusa,
  produttori diretti con partita IVA e hobbisti, selezione, spazio 2 × 1,5 m.
  Le due edizioni serali hanno orari diversi da quelle diurne.
- Muggia META e CreAttivaMente: date separate, comprese le giornate aggiuntive.
  Cavana: mercatino Mericordo distinto da CreAttivaMente, stessa piazza ma date
  e organizzatori diversi. Ponterosso e Borgo: mantenute le date esplicite anche
  quando non coincidono con la ricorrenza generica descritta dalla fonte.
- Madonna d’Agosto Muggia Vecchia: **solo 15 agosto** per i mercatini, non l’intero
  programma 5–16 agosto. Aurisina: estremi 18 aprile/17 ottobre precisi,
  terzo sabato del mese testuale; nessuna espansione automatica dei giorni intermedi.

Limiti: San Martino Prosecco conserva soltanto l’11 novembre 2025 ufficiale;
la data 2026 da calendario generato con AI resta da confermare. Natale Trieste
conserva 7 dicembre 2025–6 gennaio 2026, senza trasposizione al Natale 2026.
Monrupino e Sgonico: calendari comunali ancora con eventi 2025; sagre,
degustazioni e Nozze Carsiche senza opportunità commerciale 2026 verificata
non pubblicate. Ciò non prova assenza di eventi.

Corte dei Miracoli Muggia esclusa dalle date operative: pagine PromoTurismoFVG
contraddittorie, una titolata «ANNULLATO» per lavori e altre con date future.
Il [nuovo avviso comunale di gestione](https://comune.muggia.ts.it/it/novita-44201/avvisi-44605/avviso-pubblico-per-laffidamento-in-gestione-del-mercatino-delle-pulci-e-degli-hobby-174509)
scade il **23 ottobre 2026 alle 12**, riguarda il gestore e non gli espositori;
non dimostra la ripresa del mercatino. PDF letto, domanda via PEC e durata
due anni rinnovabili documentate nell’audit. Mercatino dei Fiori di Muggia
Vecchia escluso perché principalmente scambio/donazione; Majenca, Notti del Vino
e Sagra Sgonico escluse senza mercatino esterno documentato. Mercati ordinari
settimanali e programmi culturali non aggiunti per aumentare il conteggio.

Il build sostituisce solo Trieste; confronto con il catalogo precedente:
tutte le altre province identiche. Cache fiere.js 21, fiere.json 14.
Verificati build, settori, controlli catalogo/provincia e suite browser completa
(Chromium 1440/820/390/320 e WebKit 390). Dopo l’aggiunta delle date 2027,
ricontrollati dati e dettagli Trieste su Chromium/WebKit: scadenze, costo,
fonte comunale, 26 edizioni antiquariato e assenza del mercatino discordante.
