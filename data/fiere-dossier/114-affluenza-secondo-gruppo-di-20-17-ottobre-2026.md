
## Affluenza — secondo gruppo di 20, 17 ottobre 2026

Verificati 20 ID prima assenti sia da `events` sia da `exclusions`:
12 fiere tradizionali, quattro mercatini e quattro fiere espositive.
Nessuna nuova manifestazione aggiunta al catalogo. Ricerca limitata al pubblico,
senza contatti a organizzatori o ambulanti e senza altre sessioni o subagenti.
Otto resoconti aggiunti, dei quali sette senza fascia; dodici esclusioni con
fonti e motivazioni. Copertura cumulativa: 40 ID (21 resoconti e 19 esclusioni).
Le esclusioni attestano l'esito di questa ricerca, non assenza di pubblico.

| Fiera esaminata | Ultima edizione ricercata e risultato |
| --- | --- |
| Oh Bej! Oh Bej!, Milano | 5–8 dicembre 2025, quattro giorni: atto comunale e cronaca senza totale numerico |
| San Martino, Inveruno | 14–17 novembre 2025: programma, notiziario comunale e cronaca senza consuntivo numerico utilizzabile |
| Santa Caterina, Gorgonzola | 29–30 novembre 2025: programma e ambulanti, nessun totale pubblico verificato |
| Sant'Andrea, Oggiono | 2025: banchi 26–27 ottobre distinti dal programma 24–27; nessun totale numerico verificato |
| Crocifisso, Cantù | 19 ottobre 2025: giornata comunale documentata, nessun consuntivo numerico verificato |
| San Giuseppe, Cernusco sul Naviglio | 15 marzo 2026: sold out riferito agli espositori; nessun totale pubblico |
| San Biagio, Magenta | 3 febbraio 2026: cronaca qualitativa condizionata dal maltempo, nessuna fascia dedotta |
| Primavera, Paderno Dugnano | 22 marzo 2026 per i banchi, programma 21–23: migliaia annue generiche, non consuntivo |
| Santa Apollonia, Rivolta d'Adda | Banchi 8–9 febbraio 2026 distinti dai convegni: nessun totale pubblico verificato |
| Santa Lucia, Crema | 11–12 dicembre 2025: cronaca senza cifre; non confusa con Lodi o Santa Lucia di Piave |
| Antiquaria, Arezzo | 3–4 ottobre 2026: avviso comunale e cronaca, nessun totale pubblico; esclusi numeri di altri eventi |
| Cose d'altri Tempi, Piazzola sul Brenta | 27 settembre 2026 nella Pro Loco: nessun dato separato da Fiori e Colori; conflitto con 20 settembre nel calendario di catalogo conservato e segnalato |
| Nuova Millenaria, Gonzaga | 4–8 settembre 2026, cinque giorni: oltre 25.000 presenze dichiarate dal presidente, metodo non pubblicato; algoritmo: **almeno alta**, oltre 5.000/giorno |
| Fieracavalli, Verona | 6–9 novembre 2025, quattro giorni: oltre 140.000 visitatori e operatori, unità non definita, senza bollino |
| Ortogiardino, Pordenone | 7–15 marzo 2026, nove giorni: oltre 60.000 ingressi congiunti Ortogiardino–Cucinare; senza bollino per la singola fiera |
| Sant'Ambrogio, Merate | 7–8 dicembre 2025: 13.011 visitatori, 17.642 visite con residenti; celle telefoniche, area cittadina/festa diffusa, senza bollino |
| Santi Faustino e Giovita, Sarezzo | Fiera 20–24 febbraio 2026: 34.000 presenze riportate alle 19 del sabato, finestra cumulativa non definita; dato parziale, senza bollino |
| Mostra San Giuseppe, Casale Monferrato | 13–22 marzo 2026, dieci giorni: prima stima circa 143.000 visitatori, in linea con 2025 e leggero rialzo non quantificato; senza bollino |
| Natale, Trento | 21 novembre 2025–6 gennaio 2026: circa 750.000 presenze stimate, contesto natalizio cittadino non isolabile; giorni effettivi non verificati, senza bollino |
| Natale, Bolzano | 28 novembre 2025–6 gennaio 2026: circa un milione di visitatori, stima riportata e contestata; metodo/perimetro non verificati, senza bollino |

Nuovi bollini calcolati esclusivamente dall'algoritmo esistente: bassa 0,
media 0, alta 1, molto alta 0. Totali ora: tre alta, due molto alta e
16 resoconti senza fascia. Conservati integralmente i 13 resoconti e le
sette esclusioni precedenti; nessuna modifica a soglie, interfaccia o criteri.

Merate: il comunicato originale scrive «7 e 8 ottobre», pur indicando domenica
e lunedì; programma comunale e cronache concordano sul 7–8 dicembre.
Il refuso è esplicitato nel resoconto e conservato nell'originale.
Millenaria: la pagina ufficiale ha titolo 2025, programma 2026 e 35.000
visitatori promozionali annui: non usati come consuntivo 2026.
Bolzano: il milione è una cifra controversa, non validata da questa ricerca;
i pernottamenti comunali e i picchi giornalieri non diventano ingressi medi.
`openDays: 0` significa durata effettiva del conteggio non verificata,
mai zero giorni o zero pubblico. Nei resoconti restano area, unità, limiti,
stima/dichiarazione e metodo disponibile; le celle telefoniche di Merate
sono descritte nelle note, senza inventare una nuova categoria di conteggio.

Originali, testi estratti, ricerche, manifest HTTP/SHA256 e confronto iniziale
fuori repository: `Documents/ricerca-affluenza-fiere-20261017/sessione-02/`.
56 URL archiviati; limiti distinti del download diretto: YesMilano e due
LeccoNotizie 403, Pro Cantù 500, programma Paderno 404, pagina turismo
Bolzano 410. Usate alternative leggibili; alcune pagine sono leggibili via
browser di ricerca ma falliscono al download. ABIO inizialmente in timeout
via ricerca è stato poi letto direttamente; Spallanzani mostra una pagina
antibot, sostituita con calendario regionale e scheda evento.
Backup remoto `backup/session-20261017-123732-affluenza-altre-20` verificato;
lo script segnala il noto errore PowerShell nella pulizia dei vecchi tag.
Cache catalogo 49 e fiere.js 69. Pubblicazione e controlli finali sotto.

Controlli locali passati: build, settori, `scripts/test-fiere-attendance.cjs`
(confini, scadenze, unità/scope, 21 resoconti, browser Chromium 1440/320 e
WebKit 390), `scripts/test-fiere-pages.cjs` (4.214 pagine/1.515 sitemap),
suite generale calendario su cinque formati/browser, sintassi e diff.
Confronto JSON integrale: tutti i campi precedenti del catalogo, i 13
resoconti e le sette esclusioni iniziali invariati. File estranei preservati.

Pubblicazione dati `73aadd8`, Vercel READY
`dpl_ALkaRg8Dqny9ekQQTpmoGpKCgK6K`. Catalogo e registro pubblico identici
ai JSON locali, HTML e JS identici dopo normalizzazione CRLF/LF.
Tutte le 20 pagine pubbliche HTTP 200 con presenza/assenza del bollino coerente.
Verificati gli otto nuovi resoconti, testo delle note e collegamenti delle
fonti su Chromium 1440/320 e WebKit 390; Millenaria e Merate controllate anche
nel dialog del calendario. Nessun errore JavaScript o overflow rilevato.
`scripts/test-fiere-attendance.cjs` passato anche sul sito pubblico nei tre
formati/browser, inclusi popup, fonti e dati senza bollino.
Ricontrollati dopo la pubblicazione tutti i 56 URL: le otto fonti principali
dei nuovi resoconti sono HTTP 200. Pro Cantù è tornata HTTP 200; restano i
403/404/410 già documentati, con alternative leggibili e originali conservati.
Riscontri successivi in `sessione-02/dopo-pubblicazione/`, esiti browser in
`verifica-online.json` e schermate nella stessa cartella della sessione.
Nessun nuovo bollino attribuito ai dodici casi privi di dati sufficienti.


Affluenza, 17 ottobre 2026 - preferenza corrente: eliminato "almeno" dai bollini. Sei fasce di ingressi/presenze medi al giorno: molto bassa <500; bassa 500-999; media 1.000-4.999; alta 5.000-19.999; molto alta 20.000-99.999; altissima da 100.000. Altissima riservata a volumi eccezionali, senza certificare primati storici: bollino dorato con luce e riflesso, movimento disattivato con prefers-reduced-motion. Fonti, stime e limiti "oltre" nei dettagli; catalogo invariato. Supera le quattro fasce precedenti. Cache fiere JS74/CSS27, fiera CSS3. Test affluenza Chromium1440/320 e WebKit390 passati, incluse nuove soglie, luce e movimento ridotto; 4.322 pagine e 1.625 voci sitemap, navigazione senza JS e dialog verificati. Pubblicato 91d4408; Vercel READY dpl_G1ypKP3vSAnYX6LXCj5Wh66eAPQX. Test dedicato passato anche online Chromium1440/320 e WebKit390; JS/CSS identici al commit e pagina San Faustino con altissima verificata.
