# ADS contestuali del blog — 26 ottobre 2026

Solo creatività proprie pubblicate e attive. Nessuna campagna di clienti,
pagamento, budget o nuova raccolta di dati personali viene attivata.
Gli spazi dei posteggi in Vetrina usano il selettore geografico separato;
dal 26 ottobre compaiono nella stessa raccolta admin con misure distinte:
`BLOG_VETRINE_ADS.md`. Non sono candidate del motore delle 20 creatività.

## Selezione

`lib/personal-ads.cjs`: `targeting.kind`, `active`, `keywords`, `formats`,
`priorityKeywords`, `excludedKeywords` per
creatività. Temi canonici: fiere →6ADS calendario; vendita →7ADS vendita;
acquisto →7ADS ricerca; mercati →14ADS vendita/ricerca. Il dizionario in
`js/contextual-ads.js` riconosce parole, sinonimi e frasi, con normalizzazione
di accenti/punteggiatura e confini di parola. Vendere merci non significa
vendere la licenza: i verbi commerciali richiedono un oggetto pertinente.

Il titolo viene prima dello slug. La frase completa distingue valutazione
generica, acquisto e vendita: «prima di comprarlo/acquistarlo» prevale sulla
parola «valutare», «quanto costa» è acquisto, «quanto vale» è vendita.
Negazioni esplicite come «non voglio vendere» escludono il relativo obiettivo.
Forza dei segnali:5pronomi riferiti al bene,4transazione,3fiere,1valutazione
o tema generale. Nel primo campo utile restano i temi entro il30% del
segnale più forte; un titolo solo generale resta mercati. Fallback da
estratto/categoria/corpo con pesi8/5/3/1 per titolo/slug/intro/corpo e temi
entro il20% del migliore. Segnali distinti, massimo5per tema nel corpo.
Sono regole editoriali verificabili, senza dichiarare comprensione IA.

Si legge solo il contenuto editoriale: pubblicità, player, `.not-prose`,
script e navigazione esclusi dalla copia di analisi. Keyword negli attributi
degli slot, nessuna profilazione e nessuna richiesta aggiuntiva dell'articolo.
Filtri tema + campagna propria attiva + formato + esclusioni PRIMA del
sorteggio. Ogni ADS ha frasi prioritarie ed escluse specifiche in
`lib/personal-ad-targeting.cjs`; per esempio il richiamo «5.000 € in2giorni»
è escluso dagli articoli su annullamento/maltempo/rimborsi. Le priorità non
rendono idonea una ADS di un argomento diverso. Peso di estrazione:
`1 + min(8, 3×priorità nel titolo/slug + priorità in intro/corpo)`; parole
ripetute non moltiplicano il peso. Ogni candidata conserva una possibilità.
Nel browser la scelta avviene fra le candidate mostrate meno volte nello
stesso articolo, evitando la coppia della visita precedente quando possibile;
le priorità ordinano per sorteggio pesato le candidate con pari turni.
Tutte partecipano: nessuna può essere saltata indefinitamente per il peso.
Con almeno4candidate compatibili entrambi i banner cambiano; con2o3 alcune
ripetizioni sono necessarie; con1 la stessa creatività occupa i due slot.
Secondo slot senza ripetere ID se esistono alternative. Nessun match: niente
banner. Guide agli eredi/successione/decesso: esclusione preesistente.

## Slot, cache e formati

Massimo due slot `inline`/`closing`. I richiami editoriali esistenti vengono
sostituiti nella stessa posizione; altrimenti prima di una nuova sezione,
dopo6paragrafi/1000caratteri ed entro il70% del testo, più chiusura.
Anche articoli brevi o con un solo richiamo ricevono entrambi gli slot:
quello interno usa una separazione fra i blocchi più vicina al centro quando
non esiste la soglia lunga. Tabelle, avvisi bandi e annunci reali conservati.

Larghezza utile almeno640px →728×90; almeno336px →336×280; altrimenti300×250.
Riduzione proporzionale quando serve; nessun ingrandimento o ritaglio.
Il candidato deve avere quella variante; se manca si prova una misura
ammessa più piccola. Verticali/social esclusi dai due slot attuali.
Resize senza cambiare creatività o perdere la pausa manuale.

HTML server già pertinente e leggibile senza JS, con regole salvate incluse
nel bootstrap. Il browser legge una volta le regole correnti da
`/api/blog?contextual_rules=1` senza cache: correzioni applicate anche con
HTML CDN precedente, senza rileggere il corpo dell'articolo. Su errore usa
il bootstrap server. Nuovo turno al caricamento, riapertura e ripristino
`pageshow.persisted`, nessuna rotazione a timer. Memoria locale per articolo
`_pa_rotation_v1`, massimo60articoli: soli IDcreatività, contatori di turni,
ultima coppia e momento del turno, senza identificatore utente. Si conserva
fra schede/aperture nello stesso browser; se la memoria è bloccata resta
un fallback in RAM e la riapertura completa torna al sorteggio. Il server
non legge né conserva turni e continua a sorteggiare HTML pertinente.
Resize non consuma un turno. Senza JS resta la scelta nella cache blog ordinaria
(180s più il possibile stale-while-revalidate600s): non si promette una
correzione istantanea per quel caso.
Player esistente: animazioni, pausa, visibilità e fallback riduci movimento.
Etichetta visibile «Pubblicità · Subingresso.it».

## Dati pubblici e misura

`scripts/build-contextual-ads.cjs` genera `js/house-ads-catalog.js`: solo ID,
testi pubblicati, destinazioni, versioni e targeting. Niente statistiche,
note interne o account. `--check` rileva disallineamenti; il build delle
immagini lo aggiorna. L'API privata conserva il controllo admin.
Link/tracker esistenti, formato reale, posizioni `blog_inline`/`blog_closing`.
Al cambio ID/formato/posizione nello stesso elemento il tracker azzera il
timer e richiede nuovamente metà banner visibile per1secondo; deduplica
storica della sessione invariata. I turni non sono impressioni misurate.
Regione solo se univoca in titolo/slug; Garda nazionale. Statistiche e
conteggi storici invariati; metadati delle correzioni separati, descritti sotto.

## Correzioni e anteprima admin

In `/le-mie-ads`, aprire «Abbinamenti nel blog»: articolo, slot, formato,
esempio casuale, parole riconosciute, candidate e motivi di esclusione.
Le modifiche all'argomento o alle ADS escluse producono soltanto anteprime;
«Salva correzione articolo» applica la regola. «Ripristina automatico» salva
la configurazione automatica con esclusioni vuote. «Nessuna ADS» è esplicito.
L'esclusione delle guide agli eredi resta prioritaria anche sulle correzioni.
Le parole della singola ADS hanno un salvataggio distinto, valido su tutti
gli articoli: massimo20frasi per campo, normalizzate, da2a80caratteri.

`PATCH_CONTEXTUAL_AD_RULES_20261026.sql`: tabella metadati
`contextual_ad_rules` (`scope`, `key`, `rule`, `revision`, `updated_at`),
RLS attiva, nessun accesso diretto anon/authenticated. RPC pubblica di sola
lettura `contextual_ad_rules()` espone soltanto regole e revisioni, senza
dati account. `admin_contextual_ad_rules()` e
`admin_save_contextual_ad_rule(...)` verificano ogni volta `auth.uid()` e
`profiles.is_admin`. Revisioni confrontate atomicamente: conflitto40001,
API409, nessuna sovrascrittura silenziosa. Validazione SQL e API per campi,
ID, articolo esistente, temi, parole e dimensioni; nessun cambio tipo paid.

Endpoint admin nello stesso runtime `/api/personal-ads`:
GET `context-options`/`context-preview`, POST `context-preview` (bozza,
nessuna scrittura) e POST `context-save`. Tutto `no-store`, token admin
verificato prima di leggere. Sessione/identità riconfermate; logout e
risposte tardive puliscono i dati. Anteprime senza link di tracciamento.
La migrazione viene applicata separatamente dal push, prima del deploy;
non cambia annunci, statistiche, pagamenti o invii.

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

Estensione26/10: `test-contextual-ads-admin.cjs` verifica API/permessi,
bozze senza salvataggio, persistenza, keyword, conflitti, ripristino,
risposte tardive/logout e aggiornamento di un HTML server precedente con
regole fresche. Browser Chromium1440/768/320 e WebKit390 chiaro/scuro;
servizi simulati. `test-contextual-ad-rules-db.cjs` verifica funzioni reali,
RLS, validazione e revisioni in ROLLBACK con identità/tabelle sintetiche.
Prove `Documents/ads-intento-admin-20261026`; nessuna campagna pagante attivata.
