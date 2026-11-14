# Subingresso.it — stato corrente e accesso alle informazioni

Memoria riorganizzata il **4 novembre 2026**. Questo resta il documento aperto
dal collegamento sul Desktop. Lo storico completo è conservato, consultabile
senza caricarlo a ogni sessione.

## Progetto e fonti

Marketplace italiano per compravendita/affitto di **posteggi mercatali e licenze
ambulanti su area pubblica**. Contatto diretto, ricerca geografica, fiere,
blog e valutatore indicativo; organizzatori con percorsi dedicati.
Ristoranti, bar e generiche attività commerciali sono fuori dal verticale attuale.

- Root: `C:\Users\utente\Desktop\Ardit\subingresso.it`.
- Repository pubblico: <https://github.com/kepload/subingresso>.
- Sito: <https://subingresso.it>. HTML/JS vanilla, Tailwind precompilato,
  API Vercel; Supabase, Stripe e Resend. Il push su main avvia il deploy.
- Regole comuni: [AGENTS.md](AGENTS.md). Implementazione: codice e configurazioni;
  schema, servizi e statistiche live da verificare quando coinvolti.
  Date, conteggi e versioni nei resoconti sono snapshot.

## Stato delle fiere e automazioni

Ultimo esito **7 novembre 2026**: **110 province concluse, nessuna aperta**.
Le ultime due, Pavia e Nuoro, completate in due sessioni separate contemporanee:
**177 nuove schede, sei aggiornamenti espliciti e dieci nuove note economiche**.
Catalogo **10.443 schede e 487 note**; 10.260 schede precedenti non interessate
e tutte le 477 note precedenti invariate. Tutti gli ID conservati.
Ricerca conclusa con limiti espliciti, non censimento certificato; nuove edizioni,
bandi e prezzi sono manutenzione futura da autorizzare separatamente.

**I tre loop sono conclusi e arrestati.** Task Dual A/B/C e Chiusura1810
disabilitati; vecchio Auto già disabilitato. La chiusura di Pavia e Nuoro
non riavvia i cicli né autorizza manutenzioni o riprese al rinnovo. Le vecchie
autorizzazioni a usare quota, account o sessioni parallele sono storico.
Non avviare controller, task o ricerche dalle istruzioni archiviate.

- [Checklist completa: 110 province](docs/fiere-province.md).
- [Regole, fonti e dossier per provincia](data/FIERE.md).
- Audit `data/fiere-*.json`; fonti e prove private nei percorsi dei dossier.
- Nuove edizioni/bandi/prezzi sono manutenzione separata dalla ricerca conclusa.
  Notorietà sospesa dal 17 ottobre; affluenza solo da prove documentate.

## Decisioni da ritrovare senza rileggere lo storico

- Italiano semplice, comunicazioni e documenti essenziali. Dashboard con pochi
  numeri principali, grafici leggibili e dettagli apribili. Completezza e qualità
  dei dati utili restano prioritarie; evitare spiegazioni ripetute nell'interfaccia.
- Non inventare dati commerciali o consensi. I contatori dimostrativi della home
  seguono l'eccezione storica dell'utente: non presentarli come statistiche reali
  né convertirli di propria iniziativa. Dettagli nello storico del 21 ottobre.
- Brand e interfaccia: [PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md),
  `data/THEME_PREFERENCES.md`. Logo testuale e menu mobile rimosso su richiesta.
- Registrazione: telefono e termini obbligatori; consenso promozionale separato
  e facoltativo. Non ripristinare vecchie ipotesi di raccolta progressiva.
- Moduli: pochissime parole e scelte, adatti ad anziani e non madrelingua;
  niente spiegazioni ordinarie, conferme o messaggi sulle bozze superflui.
- Recensioni fiere: tre schermate essenziali e account solo alla fine;
  bozza locale per 30 giorni, recensioni pubbliche nelle schede e nel calendario.
  Contratto e sincronizzazione dei nuovi ID: `data/FIERE_RECENSIONI.md`.
- Schede fiere essenziali: informazioni già aperte, un solo pulsante di ricerca
  per periodo/provincia, iscrizione in una riga, costi senza riquadro. Niente
  rimandi alle recensioni, link alla stessa scheda o ricerche equivalenti.
  Fonte in fondo con account obbligatorio; documentazione aggiuntiva deduplicata.
  [Contratto corrente](data/fiere-dossier/125-schede-minimali-20261107.md).
- Vetrine: giorni acquistati conservati, selezione esplicita fino a 10 posteggi,
  sconto progressivo; giorni evidenti, opzioni e totale leggibili. Contratti
  `data/VETRINE_PREMIUM.md`, `data/SELLER_PREMIUM_ANALYTICS.md`.
- Email: consensi, deduplica e consegne reali; `data/VETRINA_EMAIL.md`,
  `data/EMAIL_CONVERSION_ANALYTICS.md`. Nessun invio implicito dai TODO.
- Profili eliminati: contatore automatico aggregato dal 9 novembre 2026,
  inizializzato con una cancellazione verificata; storico anteriore incompleto.
  Fonte live e controllo esclusione dalle email in `data/ACCOUNT_DELETIONS.md`.
- ADS interne al sito: pochi indicatori principali e grafico generale;
  niente pulsante Aggiorna, nuovi numeri al ricaricamento. Contratti
  `data/PERSONAL_ADS.md`, `data/PERSONAL_AD_CONTEXT.md`,
  `data/CONTEXTUAL_ADS.md`, `data/BLOG_VETRINE_ADS.md`.
- Esiti annunci: mini modulo privato, massimo tre passaggi; distinguere prezzo
  dichiarato/verificato e data della dichiarazione/atto. `data/LISTING_OUTCOMES.md`.
- SEO: collegamento diretto Search Console, niente intermediari obbligatori.
  `node scripts/search-console.cjs status`; se configurato aggiornare `report`
  prima delle analisi. Referrer e ricerche pubbliche non certificano posizioni.
  Fiere orientate a chi partecipa come ambulante/venditore/espositore;
  impressioni generiche non equivalgono a interesse professionale. Nessuna
  posizione garantita; contratto e verifiche in `data/SEARCH_CONSOLE.md`.
- File privati in `.local/`, esclusi da Git/deploy. Ultima revisione pulizia
  documentata il 27 ottobre; proposta mensile al primo lavoro utile, senza
  cancellazioni automatiche. Regole complete in AGENTS.

## Priorità e lavoro futuro

Obiettivo: reddito personale sostenibile da utenti pertinenti, annunci,
contatti e acquisti reali. Netto desiderato e orizzonte ancora da definire.
Valutare beneficio, ore e rapidità; massimo due esperimenti di crescita insieme.
Prima versione essenziale; nessuna promessa di ricavi o data garantita.

Il [piano delle attività](docs/attivita.md) conserva crescita, privacy,
sicurezza, rinnovi, statistiche, performance e catalogo editoriale.
È un elenco da rivalidare, non un'autorizzazione a eseguirlo. Alcune caselle
storiche degli articoli non riflettono le pubblicazioni successive: verificare
`Articoli blog da sviluppare.md`, contenuti effettivi e registro.

## Bug da correggere — audit dell'11 novembre 2026

**Audit originale: 30 rilievi, 2 P1, 24 P2 e 4 P3.** Corretti e applicati
**C-07/C-01 l'11 novembre, C-03/C-09 il 12, A-01/A-05 il 13 e A-07 il 14 novembre**, con sessioni isolate
e integrazione sequenziale. Restano **23 aperti: 19 P2 e 4 P3**. Permessi SQL,
rifiuti HTTP, bundle e asset pubblicati verificati; comportamento con fixture
in browser e provider simulati. Nessun account o invio reale di prova, né
verifica end-to-end del mittente Auth o delle consegne del digest.

### P1 — sicurezza: corretti l'11 novembre 2026

| ID | Problema |
|---|---|
| C-07 | Corretto: cinque RPC con controllo admin su profilo autorevole e grant anonimi revocati; definizioni e permessi live verificati. Contratto `data/ADMIN_AUTHORIZATION.md`. |
| C-01 | Corretto: verifica firma e timestamp prima degli invii; segreto configurato sui due lati, Edge v12 attiva. No-op firmato 200, richieste non autentiche/scadute 401. Contratto `data/AUTH_EMAIL_HOOK.md`. |

### P2 — corretti il 12 novembre 2026

| ID | Esito |
|---|---|
| C-03 | Logout/cambio identità svuotano il profilo e revocano le risposte tardive; apertura con identità verificata. 244 controlli browser e asset pubblicati conformi. `data/DASHBOARD_SESSION_ISOLATION.md`. |
| C-09 | Query su `settore` e stop sugli errori DB; Edge v19 verificata, cron conservato. 51 scenari locali, nessuna esecuzione live di prova. `data/WEEKLY_BUYER_DIGEST.md`. |

### P2 — corretti il 13 novembre 2026

| ID | Esito |
|---|---|
| A-01 | ID stabile nella bozza e riconciliazione per ID/proprietario: risposta persa, timeout e retry dopo ricaricamento non creano un secondo annuncio. 50 scenari Chromium/WebKit PASS, schema e asset online verificati. Limite preesistente del runtime WebKit su foto IndexedDB; contratto `data/LISTING_PUBLICATION.md`. |
| A-05 | Modulo bloccato durante il salvataggio, snapshot unico e ordine foto conservato anche con letture lente; errore con ripresa e focus su Salva. 48 scenari locali e due online Chromium/WebKit PASS, provider simulati e HTML pubblicato identico. Contratto `data/LISTING_PHOTOS.md`; A-06/A-14/A-15 invariati. |

### P2 — corretto il 14 novembre 2026

| ID | Esito |
|---|---|
| A-07 | Pagine città: provincia esplicita e anagrafica corrente, coordinate solo per luoghi univoci. 41 scenari locali e due browser online PASS; campione prima escluso ora presente a Brescia, tre pagine conformi al vero handler. Contratto `data/LOCALITA.md`; ambiti, limiti e SEO conservati. |

### P2 — difetti ancora aperti, per categoria

Prossimi nell'ordine iniziale del riesame: **A-09/B-04**;
gli altri restano P2 senza una graduatoria ulteriore
certificata. Un problema condizionale non implica un guasto per tutti gli utenti.

**Account, comunicazioni e servizi — 6**

| ID | Problema |
|---|---|
| C-02 | L'invio email Auth dichiara successo anche quando il provider fallisce. |
| C-04 | Ricaricare la pagina interrompe il recupero password già inizializzato. |
| C-05 | La registrazione diretta via API accetta il telefono obbligatorio mancante. |
| C-08 | Il mittente può falsificare la conferma di lettura dei propri messaggi. |
| C-10 | Il riepilogo venditori confronta la settimana con il totale storico anziché con la settimana precedente dichiarata. |
| C-11 | Durante la rotazione dei segreti Stripe, firme multiple valide possono causare il rifiuto di notifiche legittime in base all'ordine delle firme. |

**Annunci, ricerca e marketplace — 6**

| ID | Problema |
|---|---|
| A-09 | Alle pagine città mancano navigazione e footer condivisi. |
| A-02 | Memoria del browser piena o bloccata: la ricerca si interrompe e conserva risultati precedenti. |
| A-03 | La nuova ricerca non aggiorna l'URL: ricaricamento e condivisione ripristinano la ricerca precedente. |
| A-04 | Dopo un errore, applicare filtri può nascondere errore e «Riprova», mostrando dati precedenti. |
| A-08 | Le fasce prezzo delle pagine città mescolano prezzo totale di vendita e canone annuo di affitto. |
| A-10 | Il dettaglio annuncio renderizzato dal server perde il nome del contatto e il contatore dei preferiti. |

**Fiere, recensioni e organizzatori — 4**

| ID | Problema |
|---|---|
| B-04 | Lo zoom della mappa ingrandisce i bordi dei puntini fino a rendere illeggibili i conteggi dei gruppi; confermato online. |
| B-01 | Un errore di rilettura dopo un salvataggio riuscito nasconde tutta l'area organizzatore, compreso il messaggio d'errore. |
| B-02 | Le funzioni delle recensioni non rispettano sempre il ritiro dell'evento o la sospensione dell'organizzatore. |
| B-03 | Una nuova recensione durante la lettura può bloccare «Mostra altre» in un ciclo senza avanzamento. |

**Accessibilità e moduli — 3**

| ID | Problema |
|---|---|
| C-06 | Il modulo di accesso/registrazione presenta problemi di focus, etichette e contrasto. |
| A-11 | Nei filtri mobile il focus resta dietro il pannello e non viene contenuto; Escape non chiude. |
| A-15 | Quattro campi dell'editor non hanno etichette accessibili associate. |

### P3 — difetti minori

| ID | Categoria | Problema |
|---|---|---|
| A-06 | Foto | Riprovare una modifica può ricaricare foto già inviate, lasciando file non associati. |
| A-12 | SEO | Il canonical del dettaglio viene riscritto includendo tracking e frammenti. |
| A-13 | SEO | Un annuncio inesistente risponde HTTP 200 senza noindex, come pagina valida e indicizzabile. |
| A-14 | Layout | L'editor supera la larghezza dello schermo a 320 px. |

**Prove e limiti.** Riproduzioni sensibili locali con dati fittizi; codice e
configurazioni online confrontati separatamente. Non sono dimostrati incidenti
già avvenuti, account sottratti o pagamenti persi. C-11 deriva dal confronto di
una prova locale già raccolta con il contratto ufficiale Stripe: nessuna rotazione
reale verificata; il controllo aggiuntivo C è stato fermato da un blocco automatico
e il riesame è rimasto documentale, senza ulteriori test. Test obsoleti, verifiche
incomplete e sospetti esclusi restano nei rapporti, non sono ulteriori bug.
L'audit originale non autorizzava modifiche. Gli incarichi successivi hanno
riguardato soltanto C-07/C-01, C-03/C-09, A-01/A-05 e A-07; gli altri rilievi non autorizzano
nuovi interventi.

Fonti private sotto `.local/verifiche/audit-tre-sessioni-20261111/`:
[sintesi e priorità](.local/verifiche/audit-tre-sessioni-20261111/sintesi.md),
[A — marketplace](.local/verifiche/audit-tre-sessioni-20261111/A-marketplace/report.md),
[B — fiere e contenuti](.local/verifiche/audit-tre-sessioni-20261111/B-fiere-contenuti/report.md),
[C — account e servizi](.local/verifiche/audit-tre-sessioni-20261111/C-account-servizi/report.md),
[integrazione C-11](.local/verifiche/audit-tre-sessioni-20261111/riesame-stripe.md).
ID originali e materiali conservati. Le sessioni di correzione successive
sono registrate nel riepilogo recente e nel coordinamento privato.

## Come trovare i dettagli

| Necessità | Aprire soltanto quando pertinente |
|---|---|
| Architettura, flussi, bug, email, pagamenti | [Indice del manuale](istruzioni.md) → singolo riferimento |
| Fonti e limiti di una provincia | [Indice fiere](data/FIERE.md) → dossier e audit relativo |
| Organizzatori ed eventi | `data/ORGANIZZATORI_EVENTI.md` |
| Luoghi, foto, anteprime, chat, statistiche | Contratto pertinente in `data/` |
| Decisioni storiche, ID, commit, prove di pubblicazione | [Snapshot integrale fino al 1 novembre](docs/archivio/informazioni-fino-20261101.md), solo ricerca mirata |
| Metodo Codex, fonti ufficiali e ripresa del lavoro | [Gestione del contesto](docs/CONTESTO.md) |

Ricerca con output limitato: `node scripts/project-context.cjs "tema"`.
Aggiungere `--storico` soltanto per decisioni/ID/commit precedenti.
Il registro storico non va letto integralmente. Nuove decisioni vanno nel
documento pertinente; questo riepilogo contiene solo lo stato utile alla ripresa.

## Registro recente

- **14 novembre 2026 — articolo 17, dati sui visitatori della fiera:** [pubblicato e verificato](https://subingresso.it/blog?post=dati-visitatori-fiera-domande-organizzatore), materiali `f77b091`, integrazione `01797b4`, Vercel riuscito. Scheda XLSX e modello email: 73 controlli PASS; cinque percorsi online, lettura senza JS, quattro download identici, SEO/indice/sitemap verificati. I 146 post precedenti invariati, 147 totali. [Fonti e prove](data/blog/dati-visitatori-fiera-domande-organizzatore.fonti.md); consegna privata `accelerazione-codex1-20261114-1721/articolo-17/result.json`. Solo punto 17, nessun invio.

- **14 novembre 2026 — articolo 16, scelta fra due fiere:** [pubblicato e verificato](https://subingresso.it/blog?post=due-fiere-stesso-fine-settimana-scegliere), materiali `c42642f`, integrazione `b8abddb`, Vercel riuscito. XLSX: 352 scenari formule PASS; cinque percorsi online, lettura senza JS, quattro download identici, SEO/indice/sitemap verificati. I 145 post precedenti invariati, 146 totali. [Fonti e prove](data/blog/due-fiere-stesso-fine-settimana-scegliere.fonti.md); consegna privata `accelerazione-codex1-20261114-1721/articolo-16/result.json`. Solo punto 16, nessun invio.

- **14 novembre 2026 — articolo 15, liquidità nei primi 90 giorni:** [pubblicato e verificato](https://subingresso.it/blog?post=liquidita-posteggio-primi-90-giorni), materiali `a89a707`, integrazione `e311eae`, Vercel riuscito. XLSX: 1.724 controlli / 45 configurazioni; cinque percorsi online, lettura senza JS, download identico, SEO/indice/sitemap verificati. I 144 post precedenti invariati, 145 totali. [Fonti e prove](data/blog/liquidita-posteggio-primi-90-giorni.fonti.md); consegna privata `accelerazione-codex1-20261114-1721/articolo-15/result.json`. Solo punto 15, nessun invio.

- **14 novembre 2026 — articolo 8, convenienza della fiera:** [pubblicato e verificato](https://subingresso.it/blog?post=partecipare-fiera-incasso-minimo), materiali `7d340ff`, Vercel riuscito. XLSX: 264 scenari formule PASS; cinque percorsi online, lettura senza JS, download identico, SEO/indice/sitemap verificati. I 143 post precedenti invariati, 144 totali. [Fonti e prove](data/blog/partecipare-fiera-incasso-minimo.fonti.md); consegna privata `ripresa-codex1-20261114-1710/articolo-08/result.json`. Solo punto 8, account Codex 1; nessun invio.

- **14 novembre 2026 — articolo 7, comprare un giro di mercati:** [pubblicato e verificato](https://subingresso.it/blog?post=comprare-giro-mercati-margini-ore-chilometri), materiali `7db1617`, Vercel riuscito. XLSX: 878 scenari formule PASS; cinque percorsi online, lettura senza JS, download identico, SEO/indice/sitemap verificati. I 142 post precedenti invariati, 143 totali. [Fonti e prove](data/blog/comprare-giro-mercati-margini-ore-chilometri.fonti.md); consegna privata `ciclo-quote-20261114-1305/articolo-07/result.json`. Solo punto 7, nessun invio.

- **14 novembre 2026 — articolo 6, canone d'affitto sostenibile:** [pubblicato e verificato](https://subingresso.it/blog?post=affittare-posteggio-canone-margine), materiali `8eef1f2`, Vercel riuscito. Foglio XLSX: 264 casi formule PASS; cinque percorsi online, download identico, SEO/indice/sitemap verificati. I 141 post precedenti invariati, 142 totali. [Fonti e prove](data/blog/affittare-posteggio-canone-margine.fonti.md); consegna privata `ciclo-quote-20261114-1305/articolo-06/result.json`. Solo punto 6, nessun invio.

- **14 novembre 2026 — articolo 63, concorrenza dopo l'acquisto:** [pubblicato e verificato](https://subingresso.it/blog?post=comprare-banco-venditore-riapre-stesso-mercato), materiali `850d922`, Vercel riuscito. Scheda XLSX: 71 controlli PASS; cinque percorsi online, download identico, SEO/indice/sitemap verificati. I 140 post precedenti invariati, 141 totali. [Fonti e prove](data/blog/comprare-banco-venditore-riapre-stesso-mercato.fonti.md); consegna privata `ciclo-quote-20261114-1305/articolo-63/result.json`. Solo punto 63, nessun invio.

- **14 novembre 2026 — articolo 61, riconsegna banco in affitto:** [pubblicato e verificato](https://subingresso.it/blog?post=riconsegnare-banco-affitto-verbale-inventario), materiali `ae230e9`, Vercel riuscito. Verbale XLSX con 220 scenari PASS e copertina IA originale; cinque percorsi browser online, lettura senza JS, download identico, SEO/indice/sitemap verificati. I 139 post precedenti sono invariati, 140 totali. Solo punto 61; nessun invio o modifica ai servizi. [Fonti e prove](data/blog/riconsegnare-banco-affitto-verbale-inventario.fonti.md); consegna nel dossier privato `ciclo-quote-20261114-1305/articolo-61/`.

- **14 novembre 2026 — nuovo ciclo articoli autorizzato:** coordinatore solo direttore; un articolo alla volta in una sessione nuova e worktree separato. Prima Codex 1 fino al **10% residuo delle 5 ore**, con interruzione e passaggio dei materiali incompleti a nuova sessione Codex 2; su Codex 2 al **40% residuo** stop ai nuovi avvii e completamento dell'unico articolo corrente. Quote native controllate ogni 15 secondi; nessuna ripartenza al rinnovo. Priorità alte aperte 14/41/51/61/63, poi medie e basse; dati insufficienti documentati senza inventare o cambiare tema nella stessa sessione. Autori responsabili di ricerca, risorse e pubblicazione verificata; consegne controllate prima del successivo. Stato effettivo, sessioni, soglie ed esiti nel [coordinamento privato](.local/lavori/articoli/ciclo-quote-20261114-1305/COORDINAMENTO.md) e relativo `status.json`. Nessuna estensione a fiere, bug, invii o cicli futuri.

- **14 novembre 2026 — corretto A-07:** materiali `377dcc0`/`605d076`, Vercel `dpl_8cCxScwr8jTTm8NqQEoMGgcax5hC` READY sul dominio. Provincia esplicita e località correnti nelle landing; nessuna coordinata assegnata a omonimi irrisolti, compatibilità dei comuni univoci con regione storica errata conservata. 41 scenari locali PASS, 63.182 voci senza provincia errata; tre pagine online conformi all'handler e due browser PASS. Brescia include ora il campione «Villaggio Badia (Roncadelle)»: 10 schede invece di 9. Asset A-01/A-05 invariati; nessuna scrittura di prova online o modifica a DB/servizi. Restano 23 aperti; nessuna prosecuzione autonoma. [Contratto](data/LOCALITA.md), prove e limiti `.local/lavori/bugfix-sequenziali-20261113-2137/A-07-esito.md`.

- **13 novembre 2026 — corretto A-05:** modifica annunci con campi/foto bloccati fino all'esito, ordine delle anteprime stabile e ripresa da errore con focus su Salva. Materiali `629a1a8`, Vercel `dpl_6anH15EFLD6s5LYpTVoghLrw6gYb` READY e HTML identico; 48 scenari locali e due sul sito pubblico PASS, provider simulati. A-01: 50 regressioni PASS e quattro asset invariati. Nessuna mutazione di dati reali di prova, modifica SQL/Edge o intervento sugli altri bug. Restano 24 rilievi aperti; nessuna prosecuzione autonoma. [Contratto](data/LISTING_PHOTOS.md), rapporto e prove `.local/lavori/bugfix-sequenziali-20261113-2137/A-05-esito.md`.

- **13 novembre 2026 — corretto A-01:** pubblicazione idempotente con ID salvato nella bozza e recupero dell'esito per ID/proprietario, senza upsert o modifiche SQL/Edge. Materiali `c46a43e`, Vercel `dpl_CA1E7AYhUKGo7HPEDF5ZVMF78Tj7` READY e quattro asset identici. 50 scenari A-01 Chromium/WebKit PASS, regressione completa Chromium e località WebKit PASS; errore foto IndexedDB del runtime WebKit riprodotto anche sull'HTML precedente. Nessun dato/email/pagamento di prova online. Restano 25 rilievi aperti; nessuna prosecuzione autonoma. [Contratto](data/LISTING_PUBLICATION.md), rapporto e prove `.local/lavori/bugfix-sequenziali-20261113-2137/A-01-esito.md`.

- **13 novembre 2026 — pubblicati quattro articoli da sessioni parallele:** quattro nuove sessioni isolate, priorità 43/52/53/62, con copertine IA e XLSX. Materiali integrati `0c710b2`, Vercel riuscito; venti percorsi browser online PASS, download WebKit identici, SEO/indice/sitemap verificati. I 135 post precedenti sono invariati, 139 totali. Il 51 resta aperto per dati non comparabili, 14/41 invariati. Nessun invio o modifica ai servizi. Fonti, ID e prove: [43](data/blog/domande-respinte-fiere-checklist.fonti.md), [62](data/blog/vendere-banco-dossier-documenti-acquirenti.fonti.md), [52](data/blog/acquisto-attivita-ambulante-debiti-fiscali.fonti.md), [53](data/blog/comprare-banco-ancora-affittato.fonti.md). Coordinamento privato `.local/lavori/articoli/quattro-articoli-20261113-1853/COORDINAMENTO.md`.

- **13 novembre 2026 — articolo netto vendita banco:** punto 42 pubblicato, materiali `d691d07`, Vercel riuscito; 56 casi sulle formule e cinque percorsi browser online PASS, incluso download WebKit identico e lettura senza JS. URL, SEO, indice/sitemap, copertina e XLSX verificati; 134 post precedenti invariati, 135 totali. Punti 14/41 aperti: per il 41 fonti recuperate insufficienti a un confronto quantitativo verificato. Un solo articolo, nessun ciclo o invio. [Fonti, ID, limiti e prove](data/blog/vendere-banco-netto-imposte-spese.fonti.md).

- **13 novembre 2026 — pubblicati gli articoli 32/33:** ripristinato l'accesso Supabase, verificati duplicati/schema/assenza di trigger e inseriti solo i due post preparati il 12. Pagine, SEO, indice/sitemap, copertine e XLSX online verificati; dieci percorsi browser PASS, compresi download WebKit e lettura senza JS. I 132 articoli precedenti sono invariati, 134 totali. Materiali `70142c0`/`d232448`, deploy `45ab266` riuscito; nessuna modifica ai servizi o invio. Voce 14 ancora aperta. ID, fonti, storico del blocco e prove nei dossier [confronto candidati](data/blog/affitto-posteggio-confrontare-candidati.fonti.md) e [caparra](data/blog/caparra-comprare-posteggio-verifiche-notaio.fonti.md).

- **12 novembre 2026 — corretti C-03/C-09:** altre due sessioni isolate, otto file distinti senza collisioni; integrazione e pubblicazione sequenziali del coordinatore. Materiali `cb4a034`, Vercel riuscito e tre asset pubblici identici. C-03: 244 controlli browser PASS, più acquisti/statistiche; vecchia suite profilo incompleta per fixture parziale, limite documentato. C-09: Edge v19 ACTIVE, schema/bundle/cron/segreti verificati; 51 scenari e regressione email PASS. Nessun account/email di prova o digest live invocato; consegne future non certificate. Backup, rapporti e ricevute in `.local/lavori/bugfix-paralleli-20261112-0750/COORDINAMENTO.md`. Restano 26 rilievi aperti; nessuna prosecuzione automatica.

- **11 novembre 2026 — corretti i due P1 C-07/C-01:** due sessioni parallele in worktree distinti, sei file senza sovrapposizione; integrazione e interventi live eseguiti dal coordinatore in sequenza. C-07: cinque RPC corrette, definizioni/permessi live conformi e 17 gruppi PostgreSQL locali PASS. C-01: secret predisposto, Edge v12 attiva, 64 test locali e cinque smoke Deno PASS; online no-op firmato 200, firma errata/assente/scaduta 401. Nessuna email o mutazione dei dati reali di prova; mittente Auth end-to-end non testato. Due arresti preliminari dei controlli metadati risolti prima del deploy. Backup, rapporti e ricevute in `.local/lavori/bugfix-paralleli-20261111-1714/COORDINAMENTO.md`. Restano 28 rilievi aperti.

- **11 novembre 2026 — filtri e ordinamenti annunci.** Pubblicato `e979626`, Vercel riuscito. Giorni mobile attivi solo con «Mostra risultati», chiusura e azzeramento coerenti, contatore comprensivo dei giorni come unico gruppo. Data/prezzo/superficie rispettati anche con Vetrine, scaduti in fondo. Test Chromium/WebKit desktop/mobile locali e sui due file pubblicati passati; asset online identici. Contratto `data/VETRINE_PREMIUM.md`, prove `.local/verifiche/annunci-bugfix-20261111/published-results.json`; dati simulati, nessuna scrittura esterna di prova.

- **11 novembre 2026 — regola pulizia Vercel:** task Windows attivo ogni dieci giorni; prossima scadenza 21 novembre 10:03, PC acceso e utente connesso, recupero delle scadenze saltate. Due prove reali con esito 0: 24 copie eliminate, dieci versioni di produzione READY e due anteprime con domini protette; home/fiere/blog HTTP 200. Passati 17 test mirati e 35 controlli build. Regola, limiti e prove in [docs/VERCEL_CLEANUP.md](docs/VERCEL_CLEANUP.md). GitHub richiedeva un token che l'accesso CLI non può creare (403).

- **11 novembre 2026 — spazio Vercel:** su richiesta eliminato un solo deploy, `dpl_EEchH6FhupAkY5deRJgiqNMYU7Fp` del 7 novembre (`1adfc5d`, mappa ristretta già rifiutata e ripristinata con `67bddf8`), privo di alias attivi. Rimozione confermata dalla CLI e assenza dall'elenco API; versione online `f91377b` e due precedenti READY verificate, home/fiere/blog HTTP 200. MB recuperati da verificare in Usage.

- **10 novembre 2026 — articolo annuncio gratuito o in evidenza:** priorità 31 pubblicata, materiali `f91377b`, Vercel riuscito; foglio XLSX con 56 scenari superati e copertina IA originale. Pagina, download identico, SEO/indice/sitemap e quattro formati browser più lettura senza JS verificati. 131 articoli precedenti invariati, 132 totali. [Fonti e prove](data/blog/annuncio-gratuito-evidenza-contatti.fonti.md).

- **9 novembre 2026 — schede fiere anche per visitatori:** pubblicato `805c380`, Vercel riuscito. Dati comuni prima, «Prodotti e settori» neutro; posteggi/iscrizioni/costi distinti per espositori. Solo schede aperte. 10.443 schede controllate; tre asset identici e tre SSR online, percorsi Chromium/WebKit e due temi verificati. [Contratto e prove](data/fiere-dossier/125-schede-minimali-20261107.md).

- **9 novembre 2026 — contatore cancellazioni e verifica email:** l'account appena eliminato non compare nelle iscrizioni email, negli avvisi, nei permessi promozionali o nelle consegne collegate; non idoneo alle promozioni. Contatore automatico aggregato inizializzato a una cancellazione verificata, senza identita personali e con storico precedente dichiarato incompleto. [Fonte e criteri](data/ACCOUNT_DELETIONS.md).

- **9 novembre 2026 — cancellazione account richiesta in chat:** su istruzione esplicita eliminati accesso, profilo, chat di supporto e dati collegati dell'account individuato dalla richiesta e dalle risposte del gestore. Nessun annuncio, pagamento o segnalazione; verifica separata: account/profilo/chat assenti, nessun riferimento residuo all'ID nelle colonne verificate. Nessun invio. Ricevuta minima privata in `.local/lavori/cancellazione-account-20261109/receipt.json`.

- **9 novembre 2026 — selettore periodo fiere:** pubblicato `8f529a9`, Vercel riuscito e tre asset identici. Su correzione dell’utente, rotelle sempre sotto Dal/Al e pulsante in fondo; versione laterale rifiutata. Giorni/mesi ciclici, anni finiti, frase e barra rimossi. Dieci combinazioni locali e16 controlli layout online passati. [Contratto e prove](data/fiere-dossier/126-ricerca-periodo-iphone-20261107.md).

- **7 novembre 2026 — mappa fiere:** su richiesta annullata la variante quadrata `1adfc5d`; ripristino `67bddf8` pubblicato e verificato. Mappa ampia a destra, intera nel viewport desktop; titolo, istruzioni, mare e menu rimossi. Vercel riuscito, HTML/CSS identici,13 combinazioni locali e desktop chiaro/scuro online passati. [Contratto e prove](data/fiere-dossier/127-mappa-desktop-20261107.md).

- **7 novembre 2026 — calendario fiere:** pubblicato `dff17c9`: titolo «Il calendario delle fiere», testi date/zona uniformi400 e riflesso sui campi vuoti, fermo dopo scelta e con movimento ridotto. Dal/Al in riga a48px; periodi mese/3/6 mesi, prodotto rimosso. Vercel riuscito, quattro asset identici e sette combinazioni più quattro controlli animazione passati anche online. Backup originali e correzioni conservati. [Comportamento, backup e prove](data/fiere-dossier/126-ricerca-periodo-iphone-20261107.md).

- **7 novembre 2026 — SEO fiere:** pubblicato `6fe7f4d`, Vercel riuscito; titoli e testi orientati ad ambulanti/espositori. 10.443 schede e 5.546 voci sitemap verificate; tre asset identici online, sette pagine e quattro formati browser passati. Posizioni future da misurare. [Contratto e limiti](data/SEARCH_CONSOLE.md).

- **7 novembre 2026 — schede fiere essenziali:** pubblicato `f8e86ba`, Vercel riuscito; un solo pulsante di ricerca, informazioni aperte, iscrizione in una riga, costi senza box e fonti deduplicate. Rimossi permalink e rimando alle recensioni. Corretto il catalogo tardivo che poteva coprire l’accesso. 10.443 schede controllate; suite funzionali, Chromium/WebKit e due temi passati. Online cinque asset identici, sei risposte SSR e percorsi1440/768/320/390 verificati. Catalogo e consensi invariati, prove senza scritture/email reali. [Modello e prove](data/fiere-dossier/125-schede-minimali-20261107.md).

- **7 novembre 2026 — iscrizioni dalle fiere:** pubblicato `7c63ddf`, Vercel riuscito e sei asset identici ai blob Git. Ricerca locale principale, iscrizione visibile, fonti in fondo con accesso verificato; URL della fiera pulito, canonical/SSR conservati. 10.443 schede e 5.546 voci fiere sitemap verificate; percorsi locali/online Chromium1440/820/768/320 e WebKit390, annullo/ripresa, sessioni scadute/errori, Ctrl+clic e temi passati. Registrazioni/email simulate; catalogo invariato. Search Console aggiornato: 16 clic/1.837 impressioni fiere, dati fino al 4 novembre, antecedenti al cambio del 6. [Dettagli e prove](data/fiere-dossier/124-conversione-iscrizioni-20261107.md).

- **7 novembre 2026 — tre guide del blog:** priorità 21/22/23 completate in tre sessioni separate: rate e pagamento immediato, canoni lombardi, autonegozio usato. Fonti ufficiali, tre copertine originali IA e tre file XLSX gratuiti; 47 scenari sui fogli superati. Materiali `14f917b`, Vercel riuscito; pagine, download identici, SEO/indice/sitemap e Chromium1440/768/320, WebKit390, senzaJS verificati. 128 articoli precedenti invariati, 131 totali; elenco priorità aggiornato. Testi/fonti/prompt in `data/blog/`, prove e ricevute `.local/lavori/articoli/tre-articoli-20261107/`. Nessun nuovo ciclo o invio attivato.

- **6 novembre 2026 — tutte le province concluse:** pubblicato `d461abd`, check Vercel riuscito e catalogo live identico. Pavia +128 schede/70 comuni, quattro aggiornamenti e quattro note; Nuoro +49/38 comuni, due aggiornamenti e sei note. Ricognizione Pavia 186 righe→185 comuni attuali, Nuoro 53 comuni; fonti e limiti nei dossier. 10.443 ID recensioni sincronizzati, 183 pagine e letture API riuscite, Chromium1440/320 e WebKit390 locali/online passati; dati estranei invariati. Due sessioni terminate e checklist **110/110**, nessuna prosecuzione automatica. [Dossier di chiusura](data/fiere-dossier/chiusura-pavia-nuoro-20261106.md).

Esiti precedenti del 6 novembre, Oristano e avvio delle ultime due sessioni
conservati nello [snapshot precedente alla chiusura](docs/archivio/informazioni-esiti-pre-chiusura-province-20261107.md).
