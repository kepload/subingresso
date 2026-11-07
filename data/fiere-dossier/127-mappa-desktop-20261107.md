# Mappa fiere a tutta larghezza — 7 novembre 2026

Richiesta: togliere «Mappa», «Trascina e ingrandisci», «MAR MEDITERRANEO» e
«Legenda e fonti»; usare lo spazio libero a destra e mostrare tutta la mappa
senza scorrere la pagina sul desktop.

Rimosse intestazione, scritta del mare e legenda apribile. Crediti cartografici
conservati nelle informazioni generali. Il contesto dell’anteprima resta nel
nome accessibile della mappa, insieme all’evidenziazione di provincia/puntino.

Pagina senza il vecchio limite1200px: filtri/elenco fino a560px, mappa nello
spazio restante. Da721px pannello sticky a96px, altezza100dvh−112px
(fallback100vh), con16px liberi in basso. Nessun minimo verticale che faccia
uscire la mappa da una finestra bassa. Sul telefono pannello nel flusso,
altezza370px (360px entro380px), limitata all’altezza dello schermo.
Conservati colori, confini, zoom, trascinamento, filtri e catalogo.

Backup remoto verificato prima delle modifiche:
`backup/session-20261107-200439-fiere-mappa-desktop` → `a16c261`.

Prove private: `.local/verifiche/fiere-mappa-20261107/`.
Browser Chromium1920/1440/1366/1280/1024/820/768/721/320 e WebKit390/844,
13 combinazioni fra formati e temi: bordi entro il viewport, posizione durante
lo scroll, apertura filtri, zoom/ripristino, provincia, anteprima accessibile,
crediti, nessun overflow orizzontale o errore JS. A1440×900 mappa796×788px
contro558×634,5px precedenti; superficie cartografica794×786px contro556×540px.
Suite periodi: sette combinazioni Chrome/WebKit e chiaro/scuro passate,
con intervalli, dialogo, scorciatoie e percorsi delle schede invariati.

Controllo visivo e inspector1440/768/390 eseguiti. I rilievi su sfumature,
pulsante di iscrizione, etichette e testi piccoli appartengono allo stile
preesistente, conservato nel perimetro richiesto. Il rilevatore layout segnala
l’assenza di padding nel pannello: intenzionale, è la superficie cartografica
a tutta area; controlli e popup mantengono i loro rientri.

Pubblicato `b321487b73b279fc93e09611f870049bbf472c08`;
[Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/HnSW9xDZuyJvSy76hFmnTi1su6BV).
HTML, CSS e JS online identici ai blob Git del commit (confronto binario;
le copie Windows hanno terminatori diversi). Tutte le13 combinazioni della
mappa passate anche online, nessun errore JS. Trascinamento, cinque
ridimensionamenti consecutivi della stessa finestra, ripristino e selezione
della provincia da tastiera passati nella verifica aggiuntiva. Catalogo
invariato; nessuna scrittura o email reale durante le prove. Ricevute
`published.json`, `live.json`, `resize.json` e screenshot nella cartella prove.

## Correzione: mappa quadrata e priorità alla colonna sinistra

L’utente ha chiesto di stringere la mappa: quadrata, ben allineata a destra,
con più spazio a sinistra per le informazioni principali. Superato quindi il
modello precedente con colonna sinistra limitata a560px e mappa espansa.

Da721px la mappa occupa al massimo il44% della larghezza interna della pagina;
il lato non supera l’altezza disponibile sotto l’header (100dvh−112px,
fallback100vh). Rapporto1:1 e bordo destro allineato al margine della pagina;
la colonna sinistra prende tutto lo spazio restante. A1440×900 mappa609×609px
e sinistra747px, rispetto a796×788px e560px prima della correzione.
A1920×1080 mappa820×820px e sinistra1016px. Su finestre1280×600 la mappa
si riduce a488×488px, senza richiedere scroll per vederla tutta.

Superficie interna ancorata ai quattro lati del pannello: evita differenze
WebKit nel risolvere l’altezza percentuale dentro un contenitore quadrato.
La larghezza esplicita100% conserva il pannello mobile entro il suo spazio,
con le altezze precedenti370/360px. Filtri, titolo e finiture delle date
delle sessioni successive conservati. Asset CSS aggiornato nei riferimenti.

Backup remoto verificato:
`backup/session-20261107-204350-fiere-mappa-quadrata` → `61874a7`.
Prove della correzione in `.local/verifiche/fiere-mappa-20261107/quadrata/`.
Passate13 combinazioni browser/formato/tema: mappa quadrata, colonna sinistra
più larga, superficie interna completa, scroll, zoom e filtri. Controllati
anche trascinamento, cinque ridimensionamenti consecutivi e tastiera.
Inspector1440/768/390: nessun overflow né font mancante; rilievi sugli stili
preesistenti come sopra. Catalogo e funzioni conservati.
Correzione pubblicata `1adfc5d5d0ebf85e73127ca323668799d062a63f`;
[Vercel riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/EEchH6FhupAkY5deRJgiqNMYU7Fp).
HTML e CSS identici online ai blob Git; tutte le13 combinazioni browser/tema
passate anche sul sito, senza overflow o errori JS. Ricevute `published.json`
e `live.json` nella sottocartella `quadrata/`. Anteprima locale chiusa.

## Ripristino della versione ampia

Su richiesta «rimetti come prima», annullata la sola correzione quadrata.
CSS identico alla versione `61874a7`: colonna sinistra fino a560px e mappa
estesa nello spazio restante, altezza entro il viewport. Conservati titolo
del calendario e finiture delle date. Riferimento CSS aggiornato per la cache.
Backup remoto `backup/session-20261107-204948-ripristino-mappa-fiere` → `c2ea2e6`.
Prove in `.local/verifiche/fiere-mappa-20261107/ripristino/`.
