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

Ultimo esito **5 novembre 2026**: **102 province concluse e 8 aperte su 110**,
Pavia inclusa tra le aperte e **riservata**. Pubblicate le quattro ricerche
isolate: L'Aquila +30, Cosenza +40, Catanzaro +52 e Reggio Calabria +31.
Catalogo **9.774** dopo Vibo Valentia (+23 in 10 comuni); tutte le 9.751 schede precedenti invariate.
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
  Rieti resta nella propria sessione isolata.

- **5 novembre 2026 — Crotone:** pubblicate 11 nuove schede in 9 comuni,
  ricognizione nominale dei 27 comuni con limiti espliciti. Commit `1c53ab9`,
  Vercel Ready; catalogo online identico e tutte le 9.740 schede precedenti
  invariate. Build ripetibile, settori, SEO e browser Chromium 1440/320 e
  WebKit 390 locali e online passati; 9.751 ID recensioni sincronizzati, letture
  API reali riuscite. Nessun costo corrente dedotto; fonti, errori di accesso
  e limiti nel [dossier](data/fiere-dossier/crotone-20261105.md). Nessun loop avviato.

- **5 novembre 2026 - quattro province:** integrate e pubblicate su richiesta
  L'Aquila, Cosenza, Catanzaro e Reggio Calabria: +153 schede e 22 riscontri
  economici. Tutte le 9.587 schede e 426 note economiche precedenti invariate;
  due build identiche, SEO/SSR e browser locali Chromium 1440/320 e WebKit 390
  superati. Commit `96e62d3`, Vercel Ready, catalogo e asset online verificati;
  registro recensioni sincronizzato a 9.740 ID, letture API reali riuscite.
  Prove in `.local/verifiche/quattro-20261105`; fonti e limiti nei quattro
  dossier provinciali. Test generale storico fermo su aspettativa Brescia
  gia falsa nella base precedente; nessun dato estraneo modificato.
  Nessun riavvio dei loop o ricerca aggiuntiva.

- **4 novembre 2026 — contatori ADS:** su richiesta corretta la raccolta e
  ripuliti i report da 80 a 3 clic misurati: escluse 71 richieste del picco
  abbinate ai log e 6 altre non verificabili, con ragioni distinte. Tutti i
  205 eventi originali invariati e recuperabili, backup verificato. Migrazione
  applicata: firme server, ricevuta dell'impressione, deduplica e limiti;
  vecchie RPC chiuse, GET senza scritture. Prove SQL in ROLLBACK e browser
  Chromium/WebKit passate; codice `073f292` online Ready, asset e API reali
  verificati senza nuovi eventi di prova. Contratto e
  limiti per future campagne: `data/PERSONAL_AD_INTEGRITY.md`. Prove private
  in `.local/verifiche/ads-counter-20261104`; audit iniziale nella cartella
  `audit-clic-ads-20261104`. Nessun indizio di intrusione nei controlli svolti.

- **4 novembre 2026 — anteprime recensioni e card show:** aggiunti media /5,
  conteggio e accesso diretto alle recensioni nelle anteprime del calendario.
  Preferenza successiva: cinque stelle proporzionali, voto «4,0» e conteggio
  più piccolo accanto; verificati 4,0/4,5 e temi chiaro/scuro su desktop/mobile.
  Stelle grafiche online `719bb95`, Vercel Ready e asset verificati.
  Tre nuove fiere da fonti organizzatore: Card Expo Italia, Florence Cards
  Show e TCG Nexus; CardFest Napoli già presente. Catalogo 9.587, precedenti
  9.584 schede invariate, ID recensioni sincronizzati. RPC riepiloghi installata;
  recensioni esistenti invariate (conteggio/impronta), test SQL in ROLLBACK e
  browser desktop/mobile passati. [Fonti e prove](data/fiere-dossier/122-carte-collezionabili-20261104.md).
  Pubblicato `0c29326`, Vercel Ready; asset, API e browser reali online verificati,
  incluso scorrimento/focus alle recensioni in Safari.
  Ricerca mirata; nessun monitoraggio automatico o riavvio dei loop.

- **4 novembre 2026 — recensioni fiere:** versione iniziale `ce50ce9`, poi
  semplificata su richiesta con `e7cff2a`, produzione Ready e file verificati.
  Tre schermate, edizione rapida/anno manuale, più date nello stesso anno,
  stelle senza riquadri e commento facoltativo; account soltanto alla fine.
  Recensione preesistente invariata in ogni campo, vecchie bozze recuperabili.
  SQL in ROLLBACK, flussi online Chromium 1440/820/320 e WebKit 390, controlli
  anonimi reali e regressioni passati. Nessun account, recensione o email
  reale di prova. Contratto e prove in `data/FIERE_RECENSIONI.md`.

- **4 novembre 2026 ? due sessioni singole:** Ogliastra e Sulcis Iglesiente,
  23 schede ciascuna; ricognizione dei rispettivi 23 e 24 comuni con limiti.
  Commit `bd2aa19`, produzione Ready e catalogo identico online; pagine, filtri
  e dettagli verificati in Chromium 1440/320 e WebKit 390. Tutte le 9.538
  schede precedenti invariate; cinque riscontri economici aggiunti. Backup
  remoto verificato, nessuna ripresa dei loop. Entrambe le sessioni terminate.
  Dossier [Ogliastra](data/fiere-dossier/120-ogliastra-20261104.md) e
  [Sulcis](data/fiere-dossier/121-sulcis-iglesiente-20261104.md).

- **4 novembre 2026 ? Medio Campidano:** nove schede in nove comuni da fonti
  ufficiali/organizzatori; ricognizione web in gruppi dei 28 comuni con limiti.
  Commit `04d94df`, produzione Ready e nove pagine pi? filtro/dialogo verificati
  in Chromium 1440/320 e WebKit 390. Catalogo 9.538, precedenti 9.529 invariati.
  Stato 94/16; Pavia riservata e automazioni ferme. Fonti e limiti nel
  [dossier](data/fiere-dossier/119-medio-campidano-20261104.md).


- **4 novembre 2026 — Matera:** aggiunte e verificate online 55 schede in
  20 comuni, ricognizione nominale dei 31 comuni e tre riscontri economici;
  9.474 schede precedenti invariate. Date, periodi e storico distinti.
  Commit `820892d`, produzione Ready; casella 85 chiusa dopo le prove live,
  stato 93/17. [Fonti, limiti e verifiche](data/fiere-dossier/118-matera-ricerca-documentale-4-novembre-2026.md).
- **4 novembre 2026 — verifica successiva:** sei ricerche reali recuperano
  correttamente i riferimenti; nessuna modifica al codice applicativo o ai dati.
  Adeguato anche `scripts/backup-fiere-research.py` ai dossier separati e al
  nuovo helper: copia e SHA256 di 16 file verificati in una fixture locale.
  Dettagli nel rapporto dell'ottimizzazione; nessun backup reale delle ricerche avviato.
- **4 novembre 2026 — ottimizzazione contesto:** stato corrente separato dallo
  storico integrale; manuale e dossier fiere divisi per letture mirate,
  checklist provinciale deduplicata e ricerca con output limitato. Originali
  salvati con SHA256 e backup remoto verificato; correzione del cleanup del
  backup inclusa. Verifiche e misure in `docs/archivio/ottimizzazione-20261104.md`.
  Nessun cambiamento a dati, interfacce, automazioni o invii del sito.
