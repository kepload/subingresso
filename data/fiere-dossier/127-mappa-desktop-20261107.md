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
