# Subingresso.it — informazioni essenziali per Codex

> Documento di orientamento rapido per iniziare una nuova sessione sul progetto.
> Ultima ricognizione del repository: 6 ottobre 2026.
> Questo file descrive struttura e regole stabili; numeri di utenti, annunci, iscritti, versioni e TODO possono cambiare e vanno verificati nel repository o nei servizi live.

## 1. Identità e obiettivo del progetto

Subingresso.it è un marketplace verticale italiano dedicato al **subingresso e alla compravendita di posteggi mercatali e licenze per commercio ambulante su area pubblica**. Non è un portale per ristoranti, bar o normali attività commerciali.

Lessico corretto nei testi e nella SEO:

- posteggio mercatale;
- licenza ambulante;
- commercio su aree pubbliche;
- subingresso;
- autorizzazione amministrativa.

Non promettere “annunci verificati”, “centinaia di annunci” o “migliori offerte” se non esistono dati reali che lo dimostrino.

## 2. Percorsi, repository e servizi

- Repository locale attuale: `C:\Users\utente\Desktop\Ardit\subingresso.it`
- Repository GitHub pubblico: `https://github.com/kepload/subingresso`
- Produzione: `https://subingresso.it`
- Hosting/deploy: Vercel, deploy automatico dopo il push.
- Database e backend: Supabase, progetto `mhfbtltgwibwmsudsuvf`.
- Sistema email: Resend tramite Supabase Edge Functions.
- Pagamenti Vetrina: Stripe tramite Edge Functions e webhook.
- Frontend: HTML statico, JavaScript vanilla, Tailwind CSS precompilato.

Nota: alcuni documenti più vecchi indicano `C:\Users\utente\Desktop\subingresso.it`; il percorso rilevato nel 2026-10-06 è quello sotto `Desktop\Ardit`.

## 3. Cosa leggere prima di lavorare

Ordine consigliato:

1. `AGENTS.md`: regole operative, sicurezza e playbook. È la fonte principale per Codex.
2. `istruzioni.md`: manuale tecnico approfondito, storico dei bug, sistemi e TODO.
3. `CLAUDE.md`: riepilogo parallelo; se diverge, per Codex prevale `AGENTS.md`.
4. `git status --short` e ultimi commit: servono a distinguere modifiche dell’utente da stato già pubblicato.

Prima della prima modifica al repository, eseguire dalla root:

```powershell
.\scripts\session-backup.ps1 -Reason "descrizione-corta"
```

Lo script crea e pubblica un tag `backup/session-...`. Non è necessario eseguirlo per una semplice analisi senza modifiche.

## 4. Mappa dell’architettura

```text
subingresso.it/
├─ *.html                    pagine statiche e logica inline di alcune aree
├─ api/                      funzioni serverless Vercel e pagine SSR
│  └─ bandi/[slug].js        landing SSR dei bandi
├─ js/
│  ├─ supabase-config.js     inizializzazione client Supabase
│  ├─ data.js                dati condivisi, helper e card annunci
│  ├─ auth.js                autenticazione, profilo, modal e tracking signup
│  ├─ ui-components.js       header e footer comuni
│  ├─ page-view-tracker.js   tracciamento pagine
│  ├─ blog-tracker.js        conversioni blog
│  ├─ blog-generator.js      generazione/pubblicazione articoli lato admin
│  ├─ moderation.js          moderazione client, oggi non inclusa negli HTML
│  └─ pages/                 logica di elenco e dettaglio annunci
├─ css/tailwind.css          CSS Tailwind già compilato
├─ data/comuni.json          circa 7.904 comuni, usato per pagine geo/slug
├─ supabase/functions/       Edge Functions Deno
├─ scripts/                  backup sessione e script di generazione/build
├─ SETUP_*.sql/.md           setup dei sottosistemi
├─ PATCH_*.sql               migrazioni/patch idempotenti
├─ vercel.json               rewrite, redirect e security header
└─ istruzioni.md             memoria tecnica completa del progetto
```

Non esiste un framework frontend o un processo di build applicativo tradizionale. Molta logica delle pagine grandi vive direttamente negli HTML, soprattutto in `dashboard.html`, `vendi.html`, `messaggi.html`, `valutatore.html` e `modifica-annuncio.html`.

## 5. Pagine principali

- `index.html`: home e accesso ai flussi principali.
- `annunci.html` + `js/pages/annunci.js`: ricerca, filtri, card, preferiti e alert.
- `api/annuncio.js`: vera pagina dettaglio SSR usata in produzione su `/annuncio?id=...`.
- `annuncio.html`: duplicato client/orfano tenuto fuori dal deploy; non rimuoverlo dalla `.vercelignore` e mantenere allineati gli script quando necessario.
- `vendi.html`: wizard critico in 5 step per pubblicare un annuncio; contiene molta logica inline.
- `modifica-annuncio.html`: modifica di un annuncio esistente.
- `dashboard.html`: area utente e amministrazione; annunci, profilo, statistiche, blog, segnalazioni, sicurezza, bandi e strumenti admin.
- `messaggi.html`: chat acquirente-venditore e chat supporto.
- `profilo.html?id=...`: profilo pubblico del venditore e annunci attivi.
- `valutatore.html` e `report.html`: valutazione indicativa del posteggio e relativo report.
- `blog-template.html` + `api/blog.js`: lista e dettaglio blog SSR; il template contiene anche il rendering client.
- `api/annunci-citta.js`: landing SEO SSR per città/capoluoghi.
- `api/bandi/[slug].js`: landing SEO dei bandi approvati.
- `grazie.html`: esito del pagamento Vetrina.
- `reset-password.html`, `unsubscribe.html`: flussi account/email.
- `privacy.html`, `termini.html`, `contatti.html`, `404.html`: pagine informative e legali.

Rewrite principali in `vercel.json`:

- `/sitemap.xml` → `/api/sitemap`
- `/annuncio` → `/api/annuncio`
- `/annunci/:citta` → `/api/annunci-citta`
- `/blog` → `/api/blog`
- `/bandi/:slug` → `/api/bandi/:slug`

`cleanUrls` è attivo: nei link interni usare `/annunci`, `/vendi`, `/valutatore`, ecc., non `.html`.

## 6. JavaScript condiviso

### `js/data.js` — il nucleo comune

Contiene dati e helper usati in molte pagine: `MERCI`, `REGIONI`, comuni, `buildCard()`, `escapeHTML()`, `formatPrice()`, helper telefono, toast, preferiti e tracciamento visualizzazioni card. Prima di duplicare una funzione, controllare se esiste qui.

### `js/auth.js`

Gestisce sessione Supabase, registrazione/login, sincronizzazione profilo, modal di autenticazione, sorgenti di acquisizione, popup e logout. Le cache locali con dati utente devono essere sempre separate per `user_id`; mai introdurre chiavi globali contenenti nome, telefono o bozze di un altro utente.

### `js/ui-components.js`

Genera header e footer comuni. `dashboard.html` mantiene parte dell’header a mano: quando cambia la navigazione, controllare anche il markup della dashboard.

### `js/pages/annunci.js` e `annuncio-detail.js`

Gestiscono lista, filtri, profili venditori, dettaglio, contatti, eventi analytics, correlati e avvio chat. La pagina SSR `api/annuncio.js` deve rimanere coerente con `annuncio-detail.js`, in particolare per script, SEO e JSON-LD.

## 7. Dati e sottosistemi principali

Tabelle centrali rilevate nel codice/documentazione:

- `profiles`: profili, dati utente e ruolo admin;
- `annunci`: inserzioni, stato moderazione, immagini, scadenza, Vetrina e metriche;
- `saved_listings`: preferiti;
- `alerts`: ricerche/avvisi degli acquirenti;
- `conversazioni`, `messaggi`: chat e supporto;
- `conversation_reports`: segnalazioni chat;
- `blog_posts`, `blog_conversions`: contenuti e conversioni blog;
- `page_views`, `auth_modal_opens`, `valutatore_logs`: analytics e funnel;
- `payments`: pagamenti Stripe;
- `bando_alerts`, `bando_alert_log`: iscrizioni e invii bandi;
- `bando_scouting_log`, `admin_briefing_state`: AI Scout Bandi;
- varie tabelle di dedup/log per reminder, digest, alert e statistiche.

Il repository contiene file `SETUP_*` e `PATCH_*`, ma non è garantito che rappresentino da soli tutto lo schema live. Per cambi di schema importanti confrontare con Supabase e non assumere che `setup-database.sql` sia aggiornato.

## 8. Flussi funzionali critici

### Pubblicazione annunci

Il wizard `vendi.html` raccoglie dati, foto e contatti. Gli annunci non admin vengono forzati a `pending` dal database. Trigger asincroni notificano venditore e utenti con alert. Non modificare il wizard o i trigger `annunci` senza leggere la sezione dedicata di `istruzioni.md`.

Gli annunci durano 270 giorni dalla pubblicazione o dal rinnovo (8 ottobre 2026). Gli scaduti possono restare visibili, ma i contatti vengono bloccati; il proprietario può riattivarli tramite RPC.

### Contatti e chat

Telefono ed email non vanno letti direttamente nelle normali query. Il contatto dell’annuncio passa dalla RPC `get_listing_contact()`. La chat crea la conversazione solo al primo messaggio; esiste anche una conversazione supporto speciale.

### Vetrina

La promozione a pagamento usa `create-checkout-session`, Stripe Checkout, `stripe-webhook`, tabella `payments` e campi `featured*` su `annunci`. La Vetrina aumenta visibilità ma non prolunga la scadenza dell’annuncio.

### Blog e SEO

Il blog è salvato in `blog_posts`, renderizzato tramite `blog-template.html` e servito SSR da `api/blog.js`. Il contenuto HTML deve passare da DOMPurify. Sitemap, landing città, annunci SSR, JSON-LD e canonical sono parti importanti del prodotto, non decorazioni.

### Avvisi e AI Scout Bandi

Gli utenti si iscrivono per regione. `scout-bandi` usa una pipeline Gemini + verifica HTTP per proporre bandi; l’admin approva o scarta; `bando-action` pubblica e avvia le notifiche. Le landing `/bandi/<slug>` sono SSR e collegano bando, annunci regionali e valutatore. Per diagnosi e manutenzione seguire il playbook in `AGENTS.md`, sezione AI Scout.

### Email e automazioni

Le Edge Functions gestiscono, tra le altre cose: email auth, welcome, alert, messaggi, report, digest settimanali, statistiche venditore, reminder, bandi e anomalie admin. I trigger DB devono usare `pg_net` in modo asincrono; non ricreare webhook Supabase sincroni, perché in passato bloccavano la pubblicazione per molti secondi.

## 9. Edge Functions Supabase

Cartella: `supabase/functions/`. Funzioni presenti alla ricognizione:

- autenticazione/email: `register-bypass`, `send-auth-email`, `welcome-email`, `email-unsubscribe`;
- annunci e comunicazioni: `notify-seller`, `notify-alert`, `notify-message`, `notify-report`;
- lifecycle: `engagement-reminders`, `weekly-buyer-digest`, `weekly-seller-stats`;
- pagamenti: `create-checkout-session`, `stripe-webhook`;
- bandi: `subscribe-bando-alert`, `notify-bando-subscribers`, `scout-bandi`, `bando-action`;
- amministrazione: `admin-export-users`, `admin-recent-users`, `admin-valutatore-logs`, `admin-anomaly-check`;
- storico/compatibilità: `grant-welcome-vetrina` (la vecchia lotteria welcome risulta rimossa dal prodotto).

Deploy tipico di una singola funzione:

```powershell
npx.cmd supabase functions deploy NOME --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt
```

Verificare sempre le istruzioni specifiche: alcune funzioni implementano autonomamente l’autenticazione e la loro sicurezza non dipende solo dal flag di deploy.

## 10. Regole di sicurezza da non violare

- Il repository GitHub è pubblico: non inserire mai secret, JWT service role, `sb_secret_*`, chiavi Stripe/Resend/Gemini o password in file versionati.
- La chiave pubblicabile Supabase nel frontend è pubblica per design; le chiavi privilegiate devono stare solo negli environment secret.
- Il pre-commit gitleaks e la push protection non vanno aggirati alla leggera.
- Su `annunci` e `profiles`, `tel`/`email` hanno restrizioni column-level. Da client autenticato, `select('*')` può fallire con `42501`: usare colonne esplicite e senza PII.
- Ogni nuova colonna su `annunci` o `profiles` può richiedere un `GRANT SELECT (col)` esplicito per `anon` e `authenticated`.
- Non usare join PostgREST `profiles(...)` nelle query di `annunci` o `conversazioni`: eseguire fetch separati e unire i dati in JavaScript.
- Ogni testo utente inserito nel DOM va escapato con `escapeHTML()`; il corpo degli articoli va sanificato con DOMPurify.
- Non cancellare utenti o annunci, neppure con soft delete, senza consenso esplicito dell’utente.
- Non toccare trigger `annunci`, schema email o `vendi.html` se il task non lo richiede chiaramente.

## 11. CSS, cache e compatibilità

Tailwind è precompilato in `css/tailwind.css`. Una classe nuova non è disponibile solo perché appare nell’HTML. Evitare arbitrary values (`pl-[4.5rem]`, ecc.) salvo rebuild del CSS:

```powershell
npx.cmd tailwindcss -i tailwind.input.css -o css/tailwind.css --minify
```

Dopo il rebuild, aggiornare il cache buster di `tailwind.css` in tutti gli HTML. Lo stesso vale per modifiche a `data.js`, `auth.js`, `ui-components.js`, `page-view-tracker.js` e file sotto `js/pages/`: incrementare `?v=N` in ogni pagina e template che li carica, incluse le pagine SSR inline.

Non fidarsi ciecamente dell’elenco versioni in `AGENTS.md`/`istruzioni.md`: alla ricognizione alcuni HTML caricavano `auth.js?v=20`, mentre i documenti riportavano ancora `v=18`. Cercare sempre gli utilizzi reali con `rg`.

Gli `<style>` inclusi dopo Tailwind possono sovrascrivere le utility. Per correzioni puntuali verificare specificità e ordine; non aggiungere `!important` come prima soluzione.

## 12. SEO e rendering server

- `api/annuncio.js` contiene un template HTML inline: una modifica a `annuncio.html` non aggiorna automaticamente la produzione.
- `api/blog.js` legge e adatta `blog-template.html`.
- `api/annunci-citta.js` crea pagine città/capoluogo, con fallback geografici e dati strutturati.
- `api/sitemap.js` include pagine statiche, annunci, blog e landing geografiche.
- Il JSON-LD dell’annuncio deve contenere sempre un’immagine, usando il fallback brand se l’annuncio non ha foto.
- Mantenere allineati canonical, Open Graph, title/H1 e link interni senza `.html`.
- `data/comuni.json` è un asset server-side importante per validazione slug e geografia; non sostituirlo senza verificare struttura e consumatori.

## 13. Git e modo di lavorare

Il repository può avere modifiche non appartenenti alla sessione. Alla ricognizione risultava modificato `supabase/.temp/cli-latest`: non sovrascriverlo o committarlo automaticamente senza capire la provenienza.

Per ogni task:

1. controllare `git status` e diff;
2. creare il backup di sessione prima di modificare;
3. leggere i file coinvolti e cercare tutti i riferimenti con `rg`;
4. fare modifiche puntuali, evitando riscritture regex multi-line aggressive;
5. verificare sintassi e flusso interessato;
6. aggiornare i cache buster, la documentazione o lo schema solo quando necessario;
7. seguire `AGENTS.md` per commit e push automatici delle modifiche al repository.

Su Windows viene usato soprattutto PowerShell 5.1: `&&` e `||` non sono affidabili; usare comandi separati e controllare `$?`. Per messaggi commit complessi è più sicuro `git commit -F file-temporaneo`.

## 14. Errori storici da non ripetere

- Regex multi-line troppo ampie hanno già cancellato funzioni intere: preferire patch locali.
- Caratteri Unicode invisibili possono rompere confronti e sostituzioni.
- Enum/whitelist JavaScript e vincoli `CHECK` del database devono restare sincronizzati.
- `_supabase.rpc(...).catch(...)` non è valido nel client Supabase JS v2: usare `await` con `try/catch`.
- Cache locali non separate per utente hanno causato contaminazione di nome/telefono su dispositivi condivisi.
- Webhook DB sincroni hanno rallentato gli insert: usare trigger asincroni `pg_net`.
- Duplicare logica tra template statici e SSR crea disallineamenti SEO/cache: cercare tutti i punti prima di correggere.
- Nuove classi Tailwind non compilate falliscono silenziosamente.

## 15. Stato e priorità: come trattarli

`AGENTS.md` e `istruzioni.md` riportano uno snapshot operativo di fine maggio 2026: 34 annunci reali, 32 utenti, AI Scout attivo, blog regionale completato e priorità sulla crescita dell’inventario. Questi numeri **non sono da considerare attuali** senza una verifica live.

Le priorità storiche ancora utili come orientamento erano:

- aumentare annunci veri, inizialmente in Lombardia;
- monitorare e affinare AI Scout Bandi;
- completare privacy e data audit;
- migliorare conversioni blog e landing regionali quando c’è abbastanza inventario;
- aggiungere lifecycle email per annunci in scadenza;
- mantenere contenuti Bolkestein aggiornati.

Prima di agire su una priorità, controllare gli ultimi commit, la dashboard e i servizi live. Non assumere che un TODO di maggio sia ancora aperto.

## 16. Checklist rapida da incollare a Codex

```text
Lavora sul repository C:\Users\utente\Desktop\Ardit\subingresso.it.
Prima di modificare: leggi AGENTS.md, poi le sezioni pertinenti di istruzioni.md; controlla git status e crea il tag con scripts\session-backup.ps1.
Preserva le modifiche già presenti. Il repo è pubblico: mai scrivere segreti.
Ricorda: no select('*') su annunci/profiles, no join profiles nelle query annunci/conversazioni, escape dei dati utente, Tailwind precompilato e cache buster da aggiornare.
Per annunci/blog verifica sempre sia rendering client sia SSR Vercel.
Al termine esegui controlli proporzionati, poi segui AGENTS.md per commit e push.
Rispondi in italiano, in modo semplice e breve.
```

## 17. Fonti di verità

In caso di conflitto, usare questo ordine:

1. codice e configurazione attualmente presenti nel repository;
2. schema/configurazione live verificata di Supabase, Vercel, Stripe o Resend;
3. `AGENTS.md` per regole operative e sicurezza;
4. `istruzioni.md` per architettura, motivazioni e storico;
5. questo riepilogo, che serve come mappa iniziale e non sostituisce l’ispezione del task specifico.

