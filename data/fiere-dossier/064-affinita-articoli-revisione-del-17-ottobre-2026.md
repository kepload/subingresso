
## Affinità articoli — revisione del 17 ottobre 2026

Questa revisione sostituisce la prima scala basata soprattutto sulla presenza
di parole nei settori. Non misura probabilità di vendita, incassi, ammissione
o disponibilità. Le35 tipologie comprendono ora abbigliamento vintage, libri
antichi, cioccolato e olio, per distinguere un prodotto preciso dalla categoria
generica. Selezione multipla e OR tra articoli conservati.

11 profili in `fiere-affinita.json` coprono18 fiere: fonti degli organizzatori,
prodotti centrali/complementari, condizioni di pertinenza, vendita documentata,
data di consultazione e scadenza17 aprile2027. Copertura esplicitamente parziale;
per le altre schede la stima usa i soli prodotti documentati e il tema dichiarato.
Nessuna differenza inventata tra appuntamenti dello stesso format.

- 9: prodotto centrale verificato e vendita documentata nelle fonti primarie.
- 8: articolo documentato e coerente con il tema; niente9 senza prova della vendita.
- 7: prodotto documentato che completa il tema o assortimento verificato.
- 6: presenza generica oppure sottotipo/area precisa da rispettare.
- Da valutare: dati insufficienti. Eliminato il6 automatico per famiglie vicine.
- 2: soltanto esclusione esplicita globale con fonte recente ed edizione attuale;
  conservate le cautele su operatori, aree, vecchie edizioni e somministrazione.

Il nome della fiera conferma un tema solo se l'articolo è già documentato:
non aggiunge prodotti e non genera giudizi negativi. Le condizioni compaiono
anche nel riquadro del voto. Il dettaglio distingue verifica sulle fonti e stima
dalla scheda, con collegamenti primari. Pagine autonome con articoli verificati.
Con più articoli, anteprima sul migliore e dettaglio di ciascuno.

Esempi: Forlì abbigliamento vintage9, abbigliamento generico6 «Vintage o remake»;
Expo Elettronica non estende l'usato a ogni merce; Eurochocolate cioccolato9,
dolciumi6; Olio Capitale olio9, prodotti agricoli6; Ortogiardino piante8,
alimentari Da valutare senza ereditare il contemporaneo Cucinare. Orticolario
piante9 dopo lettura del regolamento2026 e della vendita al pubblico. Le tre
sigle dei mercati di Forte dei Marmi sono attribuite ai consorzi documentati,
senza trasferire automaticamente assortimenti tra organizzatori diversi.

`build-fiere.py` valida ID, ruoli, date, fontiHTTPS e condizioni, collega solo
ID esistenti e integra macrosettori esplicitamente supportati. Browser e SSR
ignorano profili scaduti/non validi. Catalogo4322: invariati tutti i campi
precedenti, salvo le unioni dei macrosettori autorizzate nelle18 schede.
Scadenza dei profili e mancata prova non diventano mai giudizi negativi.

Archivio esterno `Documents/ricerca-affinita-fiere-20261017`:18 schede iniziali,
manifest con URL/esiti/impronte,15 download200 su16 fonti. Olio Capitale403 nel
download diretto: contenuto primario consultato via web, limite conservato.
Locandina ufficiale Crevalcore letta anche visivamente per confermare il format.
Nessun contatto a terzi, nessuna nuova ricerca provinciale dichiarata conclusa.

Test `scripts/test-fiere-article-research.cjs`:151.270 coppie (2:9,6:1979,
7:88,8:413,9:33, senza voto148748), solo fonti verificate per9 e solo esclusioni
esplicite per2. Conservazione integrale salvo aggiunte autorizzate, scadenze,
validazione build, varianti/condizioni/fonti e quattro formati/browser passati.
Regressioni articoli e affinità quattro formati, affluenza e pagine Chromium1440/320
e WebKit390, calendario320, settori, build e sintassi passati. Tutte4322 pagine
e1625 voci sitemap validate. Cache JS75/CSS29/catalogo52.

Pubblicato `35d27cf`, Vercel [riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/DJxc2iwEKCpp9BjEw9DWo7qJ9Sti); HTML/JS/CSS/catalogo/profili online identici. Test ricerca e affinità passati anche online su Chromium1440/820/320 e WebKit390, incluse varianti6/9, condizioni, fonti, selezione multipla e colori. Prove in `Documents/ricerca-affinita-fiere-20261017/online` e `pubblicazione.json`.

Filtri compatti già pubblicati in `a98f526`, Vercel
[riuscito](https://vercel.com/kycykuardit-9234s-projects/subingresso/BWxv1zQ4PJY93gWFshv1v9ocgswA).
HTML/CSS online identici e test articoli online Chromium1440/820/320 e WebKit390
passato. Risparmio218px a697px di larghezza,168px a390px; controlli≥44px.
Misure e immagini prima/dopo in `Documents/verifica-spazi-fiere-20261017`.
