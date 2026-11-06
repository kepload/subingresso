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

Ultimo esito **6 novembre 2026**: **104 province concluse e 6 aperte su 110**,
Pavia inclusa tra le aperte e **riservata**. Pubblicate le quattro ricerche
isolate: L'Aquila +30, Cosenza +40, Catanzaro +52 e Reggio Calabria +31.
Catalogo **9.859** dopo Caltanissetta (+16 in 11 comuni); tutte le 9.843 schede precedenti, Rieti inclusa, invariate.
Sessioni terminate dopo la propria provincia; ricerca con limiti espliciti.

**I tre loop sono conclusi e arrestati.** Task Dual A/B/C e Chiusura1810
disabilitati; vecchio Auto già disabilitato. La richiesta singola per Matera
non riavvia i cicli né autorizza altre province o riprese al rinnovo. Le vecchie
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
- Vetrine: giorni acquistati conservati, selezione esplicita fino a 10 posteggi,
  sconto progressivo; giorni evidenti, opzioni e totale leggibili. Contratti
  `data/VETRINE_PREMIUM.md`, `data/SELLER_PREMIUM_ANALYTICS.md`.
- Email: consensi, deduplica e consegne reali; `data/VETRINA_EMAIL.md`,
  `data/EMAIL_CONVERSION_ANALYTICS.md`. Nessun invio implicito dai TODO.
- ADS interne al sito: pochi indicatori principali e grafico generale;
  niente pulsante Aggiorna, nuovi numeri al ricaricamento. Contratti
  `data/PERSONAL_ADS.md`, `data/PERSONAL_AD_CONTEXT.md`,
  `data/CONTEXTUAL_ADS.md`, `data/BLOG_VETRINE_ADS.md`.
- Esiti annunci: mini modulo privato, massimo tre passaggi; distinguere prezzo
  dichiarato/verificato e data della dichiarazione/atto. `data/LISTING_OUTCOMES.md`.
- SEO: collegamento diretto Search Console, niente intermediari obbligatori.
  `node scripts/search-console.cjs status`; se configurato aggiornare `report`
  prima delle analisi. Referrer e ricerche pubbliche non certificano posizioni.
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

- **6 novembre 2026 — ingressi Google nelle fiere:** pubblicato `b843e2c`; URL indicizzati conservati, calendario con scheda aperta, provincia/mesi coerenti e ritorno alla ricerca. Procedura ufficiale in evidenza e favicon ripristinato. Verifiche locali e online Chromium1440/768/320 e WebKit390; recensioni, accesso e promemoria simulati passati. Catalogo invariato; integrazione isolata sotto mutex. [Contratto e limiti](data/fiere-dossier/123-ingressi-google-calendario-20261106.md).


- **6 novembre 2026 — tre nuove sessioni su richiesta:** Potenza, Campobasso e
  Agrigento avviate in parallelo, con thread nuovi e worktree isolati da
  `d240d1b`. Ricerca per comune, verifiche e pubblicazione al termine;
  integrazioni serializzate con mutex, ciascuna sessione si ferma dopo la
  propria provincia. Stato e thread in
  `.local/lavori/tre-province-20261106/sessioni.json`, aggiornamenti nei
  rispettivi `*-stato.json` e rapporti finali. Backup remoto sessione
  `backup/session-20261106-004134-tre-province-potenza-campobasso-agrigento-20261106`
  e ramo `backup/pre-tre-province-20261106` verificati. Pavia riservata;
  Oristano e Nuoro non avviate. Nessun vecchio ciclo riattivato.


- **6 novembre 2026 — Caltanissetta:** +16 schede in 11 comuni, una nota economica;
  ricognizione dei 22 comuni con limiti espliciti. Pubblicato `3f1b508`,
  Vercel Ready; catalogo online identico e 9.843 schede precedenti invariate.
  Build ripetibile, settori, SEO/SSR e Chromium 1440/320 + WebKit 390 locali/online
  passati; 9.859 ID recensioni sincronizzati e 16 letture API riuscite.
  [Fonti e limiti](data/fiere-dossier/caltanissetta-20261106.md).
  Sessione conclusa dopo questa provincia; Pavia riservata, nessun loop avviato.

- **5 novembre 2026 — Rieti:** +69 schede in 53 comuni, ricognizione 73/73
  e quota Greccio 2026/2027 documentata. Pubblicato `6b97ee7`, Vercel Ready;
  9.774 schede e 452 note precedenti invariate, Vibo inclusa. Build, settori,
  SEO/SSR e Chromium 1440/320 e WebKit 390 locali/online passati; 9.843 ID
  recensioni sincronizzati e 69 letture API riuscite. [Fonti e limiti](data/fiere-dossier/rieti-20261105.md).
  Entrambe le sessioni concluse; Pavia riservata, nessuna prosecuzione.

- **5 novembre 2026 — Vibo Valentia:** +23 schede in 10 comuni e quattro note
  economiche; ricognizione dei 50 comuni con limiti. Pubblicato `c5bc603`,
  Vercel Ready; catalogo online identico, 9.751 schede e 448 note precedenti
  invariate. Build ripetibili, settori, SEO/SSR, Chromium 1440/320 e WebKit 390
  locali/online passati; 9.774 ID recensioni sincronizzati, 23 letture API reali
  riuscite. [Fonti e limiti](data/fiere-dossier/vibo-valentia-20261105.md).
  Rieti prosegue separatamente; nessuna altra provincia o automazione avviata.

- **5 novembre 2026 — due nuove sessioni avviate su richiesta:** Rieti e Vibo
  Valentia in parallelo, worktree isolati da `da5ff17`; autorizzata anche la
  pubblicazione al termine delle ricerche e verifiche. Pubblicazioni serializzate
  con mutex; nessun ciclo o altra provincia autorizzati. Pavia riservata.
  Stato, thread, fonti di avvio e rapporti in
  `.local/lavori/rieti-vibo-pubblica-20261105/`. Backup remoto sessione
  `backup/session-20261105-193831-due-province-rieti-vibo-20261105` e ramo
  `backup/pre-rieti-vibo-20261105` verificati. Vibo Valentia pubblicata e verificata;
  Rieti pubblicata e verificata; entrambe le sessioni concluse, senza prosecuzione.

Esiti precedenti (Crotone e attività del 4–5 novembre) conservati
[nello snapshot del 5 novembre](docs/archivio/informazioni-esiti-20261105.md).
