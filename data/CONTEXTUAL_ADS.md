# ADS contestuali del blog — 25 ottobre 2026

Solo creatività proprie pubblicate e attive. Nessuna campagna di clienti,
pagamento, budget o nuova raccolta di dati personali viene attivata.

## Selezione

`lib/personal-ads.cjs`: `targeting.kind`, `active`, `keywords`, `formats` per
creatività. Temi canonici: fiere →6ADS calendario; vendita →7ADS vendita;
acquisto →7ADS ricerca; mercati →14ADS vendita/ricerca. Il dizionario in
`js/contextual-ads.js` riconosce parole, sinonimi e frasi, con normalizzazione
di accenti/punteggiatura e confini di parola. Vendere merci non significa
vendere la licenza: i verbi commerciali richiedono un oggetto pertinente.

Titolo/slug determinano prima il tema specifico. Se parlano solo di
mercati/posteggi si usa il tema generale; altrimenti estratto, categoria e
testo. Pesi8/3/1, termini distinti e corpo limitato a5segnali per tema;
temi secondari entro il20% del migliore. Sono scelte editoriali, senza
attribuire risultati commerciali o capacità semantiche di un modello IA.

Si legge solo il contenuto editoriale: pubblicità, player, `.not-prose`,
script e navigazione esclusi dalla copia di analisi. Keyword negli attributi
degli slot, nessuna profilazione e nessuna richiesta aggiuntiva dell'articolo.
Filtri tema + campagna propria attiva + formato PRIMA del sorteggio uniforme.
Secondo slot senza ripetere ID se esistono alternative. Nessun match: niente
banner. Guide agli eredi/successione/decesso: esclusione preesistente.

## Slot, cache e formati

Massimo due slot `inline`/`closing`. I richiami editoriali esistenti vengono
sostituiti nella stessa posizione; altrimenti prima di una nuova sezione,
dopo6paragrafi/1000caratteri ed entro il70% del testo, più chiusura.
Articoli brevi: sola chiusura. Tabelle, avvisi bandi e annunci reali conservati.

Larghezza utile almeno640px →728×90; almeno336px →336×280; altrimenti300×250.
Riduzione proporzionale quando serve; nessun ingrandimento o ritaglio.
Il candidato deve avere quella variante; se manca si prova una misura
ammessa più piccola. Verticali/social esclusi dai due slot attuali.
Resize senza cambiare creatività o perdere la pausa manuale.

HTML server già pertinente e leggibile senza JS. A ogni caricamento con JS
nuovo sorteggio locale indipendente dalla cache CDN; nessuna rotazione a
timer durante la lettura. Senza JS resta la scelta del documento in cache.
Player esistente: animazioni, pausa, visibilità e fallback riduci movimento.
Etichetta visibile «Pubblicità · Subingresso.it».

## Dati pubblici e misura

`scripts/build-contextual-ads.cjs` genera `js/house-ads-catalog.js`: solo ID,
testi pubblicati, destinazioni, versioni e targeting. Niente statistiche,
note interne o account. `--check` rileva disallineamenti; il build delle
immagini lo aggiorna. L'API privata conserva il controllo admin.
Link/tracker esistenti, formato reale, posizioni `blog_inline`/`blog_closing`.
Regione solo se univoca in titolo/slug; Garda nazionale. Statistiche e
conteggi storici invariati; nessuna nuova tabella o migrazione.

## Campagne future

Filtro `kind === 'house'` obbligatorio: `paid`/utenti restano esclusi anche
con keyword e formati compatibili. Per abilitarli servirà lavoro distinto
su titolarità, moderazione, date, budget, disponibilità, priorità, rendiconti
e destinazioni ammesse. Riusabile la catena contesto →slot/formati →candidate
→sorteggio; nessuna prenotazione o capacità commerciale promessa adesso.

## Verifiche

`scripts/test-contextual-ads.cjs`: temi, parole intere, retail distinto,
filtri attive/proprie/formati, estrazione di tutte le candidate, duplicati,
assenza match, eredi, testo/tabelle/posizioni, resize e pausa, movimento
ridotto. Chromium1440/768/320 e WebKit390; servizi/scritture simulati.
`CONTEXTUAL_ADS_POSTS` accetta copia degli articoli pubblici; artefatti in
`CONTEXTUAL_ADS_QA_DIR`. Regressioni SSR/caricamento e annunci correlati nei
test blog esistenti. Nessuna scrittura di prova nel database pubblicato.
