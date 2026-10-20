# Versione grafica Emil — 21 ottobre 2026

Richiesta: provare una versione del sito con la skill emil-design-eng,
pubblicarla e conservare un ritorno semplice alla versione precedente.

| Before | After | Why |
| --- | --- | --- |
| Hero centrato e slogan «venduta in un click» | Composizione a due colonne, titolo tipografico e illustrazione SVG originale di una piazza mercatale | Identità più riconoscibile e ricerca in primo piano |
| Ricerca senza etichetta visibile | Etichetta esplicita, form, focus chiaro e collegamenti rapidi alle città | Comprensibilità e uso da tastiera |
| Navigazione nascosta su telefono | Menu apribile con stato accessibile, chiusura con Escape, clic esterno e uscita del focus | Accesso a tutte le sezioni anche da telefono |
| Header e footer con pesi/contrasti diversi | Tipografia, spazi, pulsanti e contrasti coordinati | Continuità tra le pagine |
| Hover estesi e transizioni generiche sulle card | Proprietà esplicite e durate brevi; immagini ferme, feedback discreto alla pressione | Risposta più immediata e meno movimento ripetitivo |
| Richiami a fiere/calcolatore diversi tra dispositivi | Due riquadri dedicati su tutti gli schermi | Strumenti riconoscibili e facilmente raggiungibili |
| FAQ pilotate da max-height JavaScript | Elementi details/summary nativi, esclusivi, senza animazioni da tastiera | Semantica, focus e funzionamento senza JavaScript |

Home: CSS autonomo `css/home.css?v=1`; sistema condiviso
`css/design-system.css?v=1`; illustrazione `og/market-square.svg`.
Header/footer e menu in `js/ui-components.js?v=13`, riferimenti statici e
SSR allineati. Dashboard con markup iniziale allineato e componente comune.
Il foglio condiviso interviene soltanto sui componenti indicati: il tema
scuro organizzatore conserva la propria palette. Nessuna dipendenza nuova.

Dodici annunci recenti, query, contatti, Vetrina/preferiti, contatori animati,
contenuti delle quattro FAQ e dieci destinazioni città conservati. Il task
è grafico: nessuna modifica a dati, invii, pagamenti o wizard di vendita.
In `vendi.html` cambiano solo i richiami al CSS/componente condiviso.
Il titolo SEO, canonical e dati strutturati della home sono conservati.

## Backup e ritorno

Versione prima dell'intervento: `9ffd1c1d526b28f2e2a3119945f0acfe4b6094e7`.
Tag remoto verificato: `backup/session-20261021-005709-emil-design`.
Branch remoto: `backup/pre-emil-design-20261021`.
Copia locale: `Documents/backup-subingresso/emil-design-20261021/sito-prima.zip`.
Istruzioni e verifica archivio nella stessa cartella. Nessuna modifica DB
da annullare. Per tornare indietro usare il revert del commit grafico e
push, conservando i lavori successivi e le modifiche locali; evitare reset
hard del checkout condiviso. Il consueto errore del cleanup tag nello
script preventivo non ha impedito il push del checkpoint, verificato a parte.

## Verifiche

Prove, screenshot prima/dopo e runner in
`Documents/verifica-emil-design-20261021/`. Home e percorsi reali:
Chromium1440/820/320 e WebKit390, ricerca, menu/clic esterno/Escape,
FAQ/tastiera, accesso, calendario, illustrazione, movimento ridotto e
assenza di overflow/errori. Letture API reali; tutte le scritture intercettate.
Primo runner corretto per selettore authOverlay e MIME .mjs del server
di prova; nessuna modifica al prodotto necessaria per quei due errori.
Profili: 364 controlli con backend/sessione simulati. Tema organizzatore
con font/icone reali: Chromium1440/320 e WebKit390 passato.
Acquisizione, qualità dati, sintassi dei template SSR e diff passati.
Stato pubblicazione e ulteriori esiti nel resoconto delle prove.
