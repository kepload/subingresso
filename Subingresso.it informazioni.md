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

- **7 novembre 2026 — schede fiere essenziali:** pubblicato `f8e86ba`, Vercel riuscito; un solo pulsante di ricerca, informazioni aperte, iscrizione in una riga, costi senza box e fonti deduplicate. Rimossi permalink e rimando alle recensioni. Corretto il catalogo tardivo che poteva coprire l’accesso. 10.443 schede controllate; suite funzionali, Chromium/WebKit e due temi passati. Online cinque asset identici, sei risposte SSR e percorsi1440/768/320/390 verificati. Catalogo e consensi invariati, prove senza scritture/email reali. [Modello e prove](data/fiere-dossier/125-schede-minimali-20261107.md).

- **7 novembre 2026 — iscrizioni dalle fiere:** pubblicato `7c63ddf`, Vercel riuscito e sei asset identici ai blob Git. Ricerca locale principale, iscrizione visibile, fonti in fondo con accesso verificato; URL della fiera pulito, canonical/SSR conservati. 10.443 schede e 5.546 voci fiere sitemap verificate; percorsi locali/online Chromium1440/820/768/320 e WebKit390, annullo/ripresa, sessioni scadute/errori, Ctrl+clic e temi passati. Registrazioni/email simulate; catalogo invariato. Search Console aggiornato: 16 clic/1.837 impressioni fiere, dati fino al 4 novembre, antecedenti al cambio del 6. [Dettagli e prove](data/fiere-dossier/124-conversione-iscrizioni-20261107.md).

- **7 novembre 2026 — tre guide del blog:** priorità 21/22/23 completate in tre sessioni separate: rate e pagamento immediato, canoni lombardi, autonegozio usato. Fonti ufficiali, tre copertine originali IA e tre file XLSX gratuiti; 47 scenari sui fogli superati. Materiali `14f917b`, Vercel riuscito; pagine, download identici, SEO/indice/sitemap e Chromium1440/768/320, WebKit390, senzaJS verificati. 128 articoli precedenti invariati, 131 totali; elenco priorità aggiornato. Testi/fonti/prompt in `data/blog/`, prove e ricevute `.local/lavori/articoli/tre-articoli-20261107/`. Nessun nuovo ciclo o invio attivato.

- **6 novembre 2026 — tutte le province concluse:** pubblicato `d461abd`, check Vercel riuscito e catalogo live identico. Pavia +128 schede/70 comuni, quattro aggiornamenti e quattro note; Nuoro +49/38 comuni, due aggiornamenti e sei note. Ricognizione Pavia 186 righe→185 comuni attuali, Nuoro 53 comuni; fonti e limiti nei dossier. 10.443 ID recensioni sincronizzati, 183 pagine e letture API riuscite, Chromium1440/320 e WebKit390 locali/online passati; dati estranei invariati. Due sessioni terminate e checklist **110/110**, nessuna prosecuzione automatica. [Dossier di chiusura](data/fiere-dossier/chiusura-pavia-nuoro-20261106.md).

Esiti precedenti del 6 novembre, Oristano e avvio delle ultime due sessioni
conservati nello [snapshot precedente alla chiusura](docs/archivio/informazioni-esiti-pre-chiusura-province-20261107.md).
