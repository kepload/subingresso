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

Ultimo esito **6 novembre 2026**: **107 province concluse e 3 aperte su 110**,
Pavia inclusa tra le aperte e **riservata**. Pubblicate le quattro ricerche
isolate: L'Aquila +30, Cosenza +40, Catanzaro +52 e Reggio Calabria +31.
Catalogo **10.202** dopo Potenza (+83 in 55 comuni, 2 note economiche storiche); tutte le 10.119 schede e 471 note precedenti invariate, Agrigento e Campobasso incluse.
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

- **6 novembre 2026 — filtri fiere:** pubblicato `e92df8f`; «Tipologia di articolo» spostata in «Altri filtri», principali solo Quando/Dove. Indicatore delle tipologie attive a sezione chiusa. SEO, ingressi e selezioni/URL/azzera verificati; Chromium1440/820/320 e WebKit390 locali/online passati. Catalogo invariato. Prove `.local/verifiche/fiere-tipologia-secondari/`.


- **6 novembre 2026 - Potenza:** pubblicato `34d1bed`, Vercel Ready `dpl_FGiuw5uR51RQ5pAoyMxbx6nouUL9`; +83 schede e 2 note storiche, ricognizione 100/100. Catalogo live identico, 10.119 schede/471 note precedenti invariate; build/settori/SEO/SSR e browser locali/online passati; 10.202 ID recensioni sincronizzati e 83 letture API riuscite. [Fonti e limiti](data/fiere-dossier/potenza-20261106.md). Potenza ultima delle tre, 6.1 sol low, sessione fermata alla conclusione; nessuna altra provincia autorizzata o prosecuzione automatica.

- **6 novembre 2026 - Campobasso:** pubblicato `e494dd3`, Vercel Ready `dpl_H7yYjcoixfLkZ6vcifqqc85xGNaQ`; +226 schede e 9 note, ricognizione 84/84. Catalogo live identico, 9.893 schede/462 note precedenti invariate, due build/settori/SEO e browser locali/online passati; 10.119 ID recensioni sincronizzati e 226 letture API riuscite. [Fonti e limiti](data/fiere-dossier/campobasso-20261106.md): 197 schede storiche 2021, 10 con edizioni 2026. Richiesta corrente: una sola provincia aggiuntiva, 6.1 sol low; Potenza ferma, nessuna prosecuzione automatica.

- **6 novembre 2026 — Agrigento:** pubblicato `3fdaa4c`, Vercel Ready `dpl_8GrHAbAfLaYrmAkTQ5bxMxErMAdy`; +34 schede e 8 note, ricognizione 43 comuni. Catalogo live identico, dati precedenti invariati, build/settori/SEO e Chromium1440/320 + WebKit390 locali/online passati; 9.893 ID recensioni sincronizzati e 34 letture API riuscite. [Fonti e limiti](data/fiere-dossier/agrigento-20261106.md). Richiesta corrente: chiudere soltanto una provincia con 6.1 sol low; Potenza e Campobasso ferme, prosecuzione da decidere dopo controllo quota, nessuna ripresa automatica.

- **6 novembre 2026 — finiture ricerca fiere:** pubblicato `a03c064`; X centrata con SVG e titolo «Trova la fiera giusta per te» sopra Quando. Centro verificato in chiaro/scuro su Chromium1440/320 e WebKit390; percorso calendario verificato anche online. Catalogo invariato, pubblicazione sotto mutex. Prove `.local/verifiche/fiere-titolo-chiudi/`.


- **6 novembre 2026 — ingressi Google nelle fiere:** pubblicato `b843e2c`; URL indicizzati conservati, calendario con scheda aperta, provincia/mesi coerenti e ritorno alla ricerca. Procedura ufficiale in evidenza e favicon ripristinato. Verifiche locali e online Chromium1440/768/320 e WebKit390; recensioni, accesso e promemoria simulati passati. Catalogo invariato; integrazione isolata sotto mutex. [Contratto e limiti](data/fiere-dossier/123-ingressi-google-calendario-20261106.md).




- **6 novembre 2026 — Caltanissetta:** +16 schede in 11 comuni, una nota economica;
  ricognizione dei 22 comuni con limiti espliciti. Pubblicato `3f1b508`,
  Vercel Ready; catalogo online identico e 9.843 schede precedenti invariate.
  Build ripetibile, settori, SEO/SSR e Chromium 1440/320 + WebKit 390 locali/online
  passati; 9.859 ID recensioni sincronizzati e 16 letture API riuscite.
  [Fonti e limiti](data/fiere-dossier/caltanissetta-20261106.md).
  Sessione conclusa dopo questa provincia; Pavia riservata, nessun loop avviato.


Esiti precedenti (Crotone e attività del 4–5 novembre) conservati
[nello snapshot del 5 novembre](docs/archivio/informazioni-esiti-20261105.md).

Avvii delle sessioni conservati nello [snapshot dedicato](docs/archivio/informazioni-avvii-20261106.md).

Esiti Rieti/Vibo conservati nello [snapshot del 6 novembre](docs/archivio/informazioni-esiti-pre-potenza-20261106.md).
