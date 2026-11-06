# Ingressi Google nel calendario — 6 novembre 2026

Richiesta: le singole fiere trovate su Google aprono il calendario con la
scheda in primo piano, per proseguire facilmente verso altre fiere nella zona.

`api/fiera.js` riusa `fiere.html` e `js/fair-detail.js`: stesso dettaglio
server/client, URL e canonical originali, robots e soglie SEO invariati.
HTML iniziale con dati e fonti leggibili anche senza JavaScript; bootstrap
JSON protetto da chiusure script. Favicon anche su elenchi e territori.
La data di revisione template nella sitemap è il 6 novembre, senza alterare
le date di verifica delle fonti.

Provincia e mesi della scheda sono i filtri iniziali, salvo filtri espliciti.
Chiudi, Escape e sfondo tornano a `/fiere` conservando i filtri; il comando
«Cerca altre fiere in zona» seleziona il territorio anche dal calendario normale.
Lettura immediata con catalogo lento/assente; retry senza riaprire schede chiuse.
Login e promemoria possono sospendere e ripristinare la scheda senza perderla.

In evidenza: date con relativo stato, prodotti, procedura ufficiale esterna,
ricerca di altre fiere. Seguono condizioni, contatti, costi, edizioni,
approfondimenti apribili e recensioni. Nessuna disponibilità o data inventata.
Dati del catalogo e ricerche provinciali non modificati.

Verifiche: `test-fiere-entry.cjs`, `test-fiere-seo.cjs`, `test-fiere-pages.cjs`,
`test-fiere-access.cjs`, `test-fair-reviews.cjs`, `test-saved-fairs.cjs`.
Chromium 1440/820/768/320 e WebKit 390 secondo suite; 9.859 pagine e
5.117 voci fiere sitemap al momento del controllo. Scritture e invii simulati.
Due suite storiche falliscono identicamente sul checkout precedente:
`test-fiere.cjs:686` (data ricerca Brescia), `test-fiere-attendance.cjs:40`
(valutazione fissata a ottobre rispetto al tempo corrente). Nessun dato
alterato per farle passare.

Prove private: `.local/verifiche/fiere-ingresso-google/`. Inspector completo:
segnalazioni su gradienti, microtesti e pannelli del calendario preesistente,
fuori dal dettaglio; ombra e sovrapposizione sono quelle del dialog richiesto.
Il dettaglio usa testi 13–28px, controlli 44–48px, font e temi esistenti.
DESIGN.md prevale sul sidecar Impeccable segnalato come meno aggiornato.

Lavoro in worktree dedicato. Integrazione e pubblicazione con mutex
`Local\SubingressoFierePublish20261106`, condiviso dalle tre sessioni
provinciali. Backup remoto di sessione e ramo pre-intervento verificati.
