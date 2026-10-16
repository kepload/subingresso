# Subingresso.it — informazioni e TO DO

Unione del 16 ottobre 2026. Le informazioni tecniche conservano la ricognizione del 6 ottobre; le attività mantengono le rispettive date. Questa unione non costituisce una nuova verifica del sito o dei servizi live.

## Indice

- [Informazioni tecniche e regole operative](#parte-a)
- [Attività, priorità e storico delle fiere](#parte-b)
- [Coordinamento storico](#coordinamento-storico)

I percorsi relativi citati si riferiscono al repository `C:\Users\utente\Desktop\Ardit\subingresso.it`.

<a id="parte-a"></a>

# Parte A — Informazioni tecniche e regole operative

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

Rispondere in italiano, in modo semplice e breve.

## 16. Fonti di verità

In caso di conflitto, usare questo ordine:

1. codice e configurazione attualmente presenti nel repository;
2. schema/configurazione live verificata di Supabase, Vercel, Stripe o Resend;
3. `AGENTS.md` per regole operative e sicurezza;
4. `istruzioni.md` per architettura, motivazioni e storico;
5. questo riepilogo, che serve come mappa iniziale e non sostituisce l’ispezione del task specifico.

<a id="parte-b"></a>

# Parte B — Attività, priorità e storico delle fiere

### Anteprime essenziali — richiesta del 16 ottobre 2026

**Nomi e colori correnti, 16 ottobre 2026:** «Di lunga tradizione» rinominata
«Storica» in card, scheda, popup, filtro e legenda. Molto conosciuta in verde,
Storica in blu, Nuova in viola; niente rosso per gli eventi nuovi. Conservati
simboli, criteri e dati. Cache JS55/CSS17.

**Bollini, 16 ottobre 2026:** rimossa la sottolineatura a pallini da tutti
i bollini cliccabili, su richiesta dell'utente. Cache CSS16.

**Preferenza corrente:** mostrare il costo nelle anteprime solo quando è
disponibile una tariffa; niente «Costo banco da verificare» o «Costi: vedi
scheda». Nessun bollino «? Da valutare» su card, popup mappa e dettaglio:
mostrare soltanto le valutazioni assegnate, senza righe vuote. Stato interno,
filtro e legenda conservati. Le note sui costi restano nella scheda.
Modifica di presentazione, dati invariati; cache JS54.
Controlli locali passati: suite generale su cinque schermi/browser e bollini
su Chromium computer/telefono e WebKit.

### Quanto è conosciuta la fiera — richiesta del 16 ottobre 2026

**Valutazioni e scheda, 16 ottobre 2026:** nuova priorità dell'utente:
valutare concretamente fiere, sagre ed eventi; nella scheda soltanto bollino
con dicitura, senza titolo e spiegazioni. Prima estensione da 41 a 400
valutazioni su 3.972: 17 Molto conosciuta, 380 Di lunga tradizione, 3 Nuova.
Restano 3.572 da valutare; ricerca nazionale non completata. Registro
Lombardia, confronto calendario Piemonte 2014 e verifiche mirate; audit
con fonti ed esclusioni in data/fiere-rinomatezza-audit.json e data/FIERE.md.
Martinengo e dieci schede dell'Antico Seriate ora Di lunga tradizione.
Prove conservate nei dati, rimosse le spiegazioni dalla scheda pubblica.
Cache JS53/catalogo42. Le altre modifiche al prodotto restano fuori sessione.
Pubblicato `23627c1`, Vercel READY; pagina, JS e catalogo online identici.
Build, settori e suite generale su cinque schermi/browser passati; verifica
dedicata locale e online su Chromium computer/telefono e WebKit riuscita.

**Preferenza testi, 16 ottobre 2026:** usare «Quanto è conosciuta», con bollini
«Molto conosciuta», «Di lunga tradizione», «Nuova» e «Da valutare». Evitare
diciture di stato accanto alle date (Da calendario, Date pubblicate, ecc.):
un piccolo ! apribile indica i casi da riconfermare e spiega il motivo al
tocco, anche per sole ricorrenze, periodi e informazioni di edizioni passate.
Cache fiere.js 52, CSS15. Dati e formati con giorno settimanale conservati.
Pubblicato `b9aac0b`, Vercel riuscito; pagina/JS/CSS online identici.
Controllati su computer, telefono piccolo e WebKit: nomi, sei casi di date,
simbolo ! apribile con tocco/tastiera, senza errori o scorrimento orizzontale.

**Date, 16 ottobre 2026:** giorno della settimana nelle fiere di uno o due
giorni (es. Domenica 18 ott 2026; Sabato 17 ott 2026 – Domenica 18 ott 2026).
Da tre giorni in su resta il formato precedente. Stessa regola in elenco
e dettaglio; periodi indicativi conservati. Cache fiere.js 51.
Pubblicato `8e13acc`, verificato online su computer/telefono e WebKit:
date di 1/2/3+ giorni in elenco e scheda corrette, pagina e JS identici al commit.

Bollini Rinomata, Consolidata e Recente, con stato neutro Da valutare quando
mancano prove. Motivo e fonti apribili, filtro dedicato e revisione con scadenza.
Misura notorietà e storia documentate; compatibilità con il tipo di articolo
e valutazione commerciale rinviate come richiesto. Prima copertura: 41 schede
valutate su 3.972 (13 rinomate, 25 consolidate, 3 recenti); le altre 3.931 da
valutare. Estendere le valutazioni con prove per singolo evento, senza
scambiare informazioni mancanti per scarsa qualità. Archivio e criteri in
`data/fiere-rinomatezza.json` e `data/FIERE.md`. Controlli locali passati su
computer/telefono e WebKit; campi precedenti delle 3.972 schede conservati.
Pubblicato e verificato online il 16 ottobre 2026, commit `93fbcc1`, Vercel
riuscito. Pagina/script/stile/catalogo identici al commit; bollini, motivi,
fonti, filtri, mappa e URL provati su Chromium computer/telefono e WebKit.

## Come funziona questa lista e come scegliere le priorità

**Obiettivo:** far avanzare subingresso.it il più possibile nel tempo disponibile, valutando beneficio atteso, rapidità dei risultati e tempo necessario rispetto alle alternative.

- 🔴 **Priorità alta:** maggior beneficio atteso nel periodo attuale; affrontarle per prime.
- 🟠 **Priorità media:** benefici meno immediati o inferiori alle rosse; affrontarle dopo.
- 🟢 **Priorità bassa:** attività rimandabili per concentrarsi su quelle che fanno avanzare più velocemente.

Rivalutare i colori se cambiano tempi, opportunità o benefici: l'utilità generale non basta a rendere un'attività prioritaria adesso.

Spunta una voce quando sono completati tutti gli interventi indicati.

**Valutazione delle priorità — 8 ottobre 2026:** privilegiare acquisizione di utenti pertinenti, contatti e conservazione degli annunci attivi. Queste priorità sono stime basate sul progetto e sul lavoro previsto, da verificare con i risultati; non presumono dati aggiornati su traffico o conversioni. Privacy e sicurezza restano alte per proteggere utenti e fiducia. Per muoverci veloce, completare prima la versione essenziale di ogni intervento: evitare che una voce diventi un rifacimento generale.

## 💶 Crescita e autonomia economica

**Obiettivo:** costruire un reddito personale sostenibile attraverso subingresso.it. Le visite e gli iscritti servono se portano annunci pertinenti, contatti utili e clienti paganti. Misurare incassi effettivi, costi, rimborsi e tempo di lavoro; il valore dei posteggi pubblicati non è un ricavo del sito. Importo netto mensile desiderato e orizzonte temporale sono ancora da definire con Ardit. Nessuna data di autonomia è garantita.

- [ ] 🔴 Definire il traguardo economico e fare i conti sui ricavi necessari — partire dal reddito netto mensile desiderato, considerare costi e accantonamenti fiscali/contributivi da verificare con il commercialista, poi calcolare quanti clienti servono per ciascuna offerta usando prezzi e margini realmente verificati. Distinguere entrate occasionali e ricorrenti; aggiornare una tabella semplice ogni mese, senza costruire subito una nuova dashboard.
- [ ] 🔴 Verificare cosa gli utenti sono disposti a pagare — raccogliere, con un primo gruppo di circa 10 venditori, acquirenti e operatori professionali, problemi concreti, alternative usate e motivi per pagare o non pagare. Testare una sola offerta alla volta e cercare acquisti reali: interesse dichiarato e questionari non bastano. Per ogni prova fissare prima durata, tempo massimo da investire e criterio per continuare o fermarsi.
- [ ] 🔴 Concentrare acquisizione e offerta in una prima zona — scegliere con i dati una provincia o un gruppo di mercati, inizialmente in Lombardia, dove possiamo far incontrare domanda e annunci reali. Preparare un piccolo piano di acquisizione diretta tramite operatori, associazioni e comunità pertinenti, con messaggi e canali appropriati; aiutare i primi venditori a pubblicare annunci completi. Misurare annunci attivi, richieste pertinenti e ritorno degli utenti, poi replicare nelle zone vicine. Niente annunci copiati o contatti importati senza autorizzazione.
- [ ] 🔴 Verificare e migliorare la vendita della Vetrina già esistente — controllare il percorso dalla scelta al pagamento e all'attivazione; misurare acquisti e contatti ricevuti dagli annunci promossi. Provare una modifica alla volta a presentazione, pacchetto o prezzo. Vendere benefici dimostrabili, senza promettere una vendita o un numero di contatti. Prima capire se l'offerta produce valore, poi aumentare il traffico verso di essa.
- [ ] 🔴 Collegare i contenuti più utili a un'azione concreta — partire dalle pagine che già ricevono visite pertinenti: cercare un posteggio, pubblicare un annuncio o iscriversi agli avvisi giusti. Riusare i collegamenti e i moduli esistenti, correggendo i punti in cui il percorso si interrompe. Valutare iscrizioni, annunci, contatti e acquisti generati, oltre alle visite; dare precedenza a contenuti con intenzione di comprare, vendere o partecipare.
- [ ] 🟠 Preparare e validare un pacchetto per operatori professionali — per chi gestisce più annunci, testare un'offerta chiara con servizi ripetuti e un prezzo sostenibile, inizialmente anche con gestione manuale. Costruire abbonamenti e strumenti dedicati solo dopo i primi clienti paganti; misurare rinnovi, margine e assistenza richiesta. Mantenere un accesso gratuito utile per alimentare il mercato.
- [ ] 🟠 Testare una partnership commerciale pertinente — scegliere un solo servizio o fornitore richiesto dagli utenti, verificare condizioni attuali e concordare come attribuire richieste e compensi prima di sviluppare integrazioni. Partire da una prova piccola, trasparente e misurabile. Le vecchie stime di commissioni e i nomi nel manuale sono ipotesi da riconfermare; per eventuali servizi finanziari verificare prima il ruolo consentito e i requisiti con il partner abilitato.
- [ ] 🟠 Validare il servizio di controllo documenti con un professionista — verificare domanda pagante, partner disponibile, costo di revisione, tempi, responsabilità e gestione riservata dei documenti. Preparare una prova limitata con ambito e prezzo chiari prima di automatizzare. Offrire solo ciò che possiamo erogare con competenza e margine; la pre-verifica AI richiede revisione umana e non garantisce l'esito della trattativa.
- [ ] 🟠 Far tornare utenti e clienti con avvisi utili — riusare gli alert e le email esistenti per opportunità pertinenti e aggiornamenti richiesti, rispettando preferenze e consensi. Misurare ritorni, contatti e riacquisti; facilitare la condivisione spontanea di annunci e pagine utili. Evitare nuovi sistemi di premi prima di vedere che le persone trovano valore nel servizio.
- [ ] 🟠 Costruire gradualmente uno storico affidabile degli affari conclusi — partire dalla voce «Registrare vendite e affitti conclusi» qui sotto, con raccolta essenziale e facoltativa degli esiti. Distinguere prezzo richiesto, prezzo effettivamente pagato e informazioni dichiarate/non verificate. È un investimento di lungo periodo per fiducia e qualità del valutatore: anticipare la raccolta quando iniziano a chiudersi affari, rimandando l'archivio pubblico e le analisi complesse.
- [ ] 🟢 Automatizzare le attività ripetitive quando diventano un limite — registrare prima il tempo speso in assistenza, moderazione, aggiornamento contenuti e gestione partner; automatizzare i compiti frequenti con controlli e possibilità di intervento umano. Anticipare questa voce se il lavoro manuale impedisce di servire clienti paganti. Obiettivo: aumentare i ricavi senza aumentare nella stessa misura le ore di lavoro.
- [ ] 🟢 Espandere a nuove regioni e poi ad altri settori solo dopo una prova riuscita — prima replicare il modello dei posteggi in un'altra zona e verificare che acquisizione, qualità, margine e carico di lavoro restino sostenibili. Valutare altre licenze solo con domanda pagante osservata e risorse sufficienti; evitare che una nuova nicchia rallenti il settore che già genera ricavi.

**Ordine operativo per le future sessioni:** definire il traguardo e misurare la situazione attuale; scegliere una zona e verificare la domanda pagante; migliorare Vetrina e percorsi dai contenuti; provare una sola nuova offerta; replicare ciò che funziona. Tenere al massimo due esperimenti di crescita aperti insieme. Ogni settimana confrontare risultati e ore investite, fermare le prove senza segnali utili e destinare il tempo alle attività con più margine e possibilità di ripetersi. Gli interventi tecnici rossi restano prioritari quando rimuovono un ostacolo concreto a questi percorsi o proteggono utenti e dati.

Per distinguere entrate ricorrenti e vendite occasionali: [definizione di ricavi ricorrenti di Stripe](https://support.stripe.com/questions/understanding-monthly-recurring-revenue-%28mrr%29-and-annual-recurring-revenue-%28arr%29).

## 🛡️ Privacy e sicurezza

- [ ] 🔴 Sistemare la privacy policy e il GDPR — chiarire la gestione dei dati personali.
- [ ] 🔴 Rendere sicure le eliminazioni di annunci e account — riepilogo, conferma e verifica email; per l'account, gestire anche i dati associati.

## 🎪 Fiere: ricerca e calendario

- [ ] 🟠 Migliorare la ricerca delle fiere e il calendario — unificare gli interventi per chi cerca eventi e posteggi; il calendario esiste già, concentrarsi su date confermate e informazioni per partecipare prima di ampliare i filtri.
- [ ] 🟢 Creare la sezione «Fiere per ambulanti» — filtri per regione, mese e domande aperte.

### Ricerca approfondita per provincia — aggiornamento 12 ottobre 2026

**13 ottobre — prova ibrida sul solo comune di Gattinara:** tre schede per
San Martino, Rosa e Rosso di Maggio e LUVA. Codex dirige ricerca, verifica e
pubblicazione; Qwen individua prove e prepara brevi note. Audit in
`data/fiere-comuni.json` e `data/FIERE.md`. **Vercelli resta da approfondire**:
questa prova non completa la provincia. Il catalogo Padova è ora verificato online.

- [x] **Brescia — ricerca approfondita completata**: 206 manifestazioni in 86 comuni
  pubblicate in [/fiere](https://subingresso.it/fiere?provincia=Brescia). Esaminate 1.031
  righe regionali e fonti di Comuni, Pro Loco, portali turistici e organizzatori;
  integrate date, contatti, settori, procedure, costi e scadenze quando pubblicati.
  Fonti e limiti documentati in `data/FIERE.md`; dati curati in `data/fiere-brescia.json`.
- [ ] **Brescia — aggiornamenti periodici**: ricontrollare bandi, rinvii e prossime
  edizioni; completare le date ancora ambigue o disponibili soltanto per il 2025.

- [x] **Lodi — ricerca approfondita completata**: ricerca nei 60 comuni, 43
  manifestazioni in 26 comuni pubblicate in [/fiere](https://subingresso.it/fiere?provincia=Lodi).
  35 schede con edizione 2026 e 8 con storico 2025 da riconfermare; fonti,
  contatti, settori, procedure, costi e 8 scadenze dove documentati.
  Audit di comuni, esclusioni e dubbi in `data/fiere-lodi.json` e `data/FIERE.md`.
- [ ] **Lodi — aggiornamenti periodici**: nuove edizioni, bandi e disponibilità;
  verificare fonti rimosse e segnalazioni commerciali ancora non confermate.

- [x] **Lecco — ricerca approfondita completata**: ricerca negli 84 comuni, 46
  manifestazioni in 23 comuni pubblicate in [/fiere](https://subingresso.it/fiere?provincia=Lecco).
  40 schede con giornate precise, 3 periodi ricorrenti e 3 date testuali da verificare;
  contatti, settori, procedure e 4 scadenze quando documentati. Consultate le 160
  righe regionali e scaricati tutti i programmi: 122 con testo estraibile; scansioni
  non verificate e altre segnalazioni conservate nell'audit, senza inventare date.
  Bando Viganò 2027–2029: termine 7 dicembre 2026, fiera 7 febbraio 2027.
  Fonti, esclusioni e limiti in `data/fiere-lecco.json` e `data/FIERE.md`.
- [ ] **Lecco — aggiornamenti periodici**: bandi, nuove edizioni, rinvii e disponibilità;
  chiarire Street Food/Cioccolato Merate, giorno di Premana, Fiera dei Patroni Bellano,
  ammissioni professionali e programmi scansione non ancora verificati.

- [x] **Monza e della Brianza — ricerca approfondita completata**: ricerca nei
  55 comuni, 86 manifestazioni in 29 comuni pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Monza%20e%20della%20Brianza).
  82 schede con giornate precise, un periodo e tre edizioni testuali; 199 righe
  regionali e 199 programmi scaricati, 176 con testo estraibile. Contatti per
  26 manifestazioni e sei scadenze documentate. Corrette le domeniche natalizie
  di Lissone e le 15 giornate del brocante di Monza. Epifania Lissone 2027:
  domanda entro il 6 novembre 2026 per 35 concessioni. Audit e limiti in
  `data/fiere-monza-brianza.json` e `data/FIERE.md`.
- [ ] **Monza e della Brianza — aggiornamenti periodici**: bandi, disponibilità,
  rinvii e nuove edizioni; chiarire Biassono San Martino, Pro Loco in Fiore
  Lissone, Oreno, mercatini natalizi e programmi scansione non ancora verificati.

- [x] **Arezzo — ricerca approfondita completata**: scelta casualmente; ricerca
  nei 36 comuni, 89 manifestazioni in 31 comuni pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Arezzo), prima una sola scheda.
  77 con giornate precise, tre periodi, sei edizioni testuali e tre con soli
  mesi/ricorrenze; 24 schede con contatti e cinque scadenze documentate.
  Comuni/SUAP, organizzatori, associazioni, programmi territoriali e AEFI;
  audit, hash, esclusioni e dubbi in `data/fiere-arezzo.json` e `data/FIERE.md`.
  Natale Castiglion Fiorentino: domanda 16 ottobre; Arezzo San Jacopo/Risorgimento:
  Allegato A via PEC entro 31 ottobre. Ranco consolidata a Sestino, senza duplicati.
- [ ] **Arezzo — aggiornamenti periodici**: bandi, nuove edizioni e disponibilità;
  chiarire Fiera di Primavera Castel Focognano, Fiera del Tordo Chitignano,
  Ceppo Lucignano e programmi natalizi ancora storici. Verificare ammissioni
  professionali, giorni commerciali dei periodi/feste e allegati grafici residui.

- [x] **Trieste — ricerca approfondita completata**: controllati i sei comuni,
  24 manifestazioni in quattro comuni pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Trieste), prima una sola scheda.
  22 con edizioni 2026 e due con storico 2025; date distinte, contatti e procedure
  dove documentati. Barbacan dicembre: candidatura 30 ottobre–8 novembre;
  antiquariato Trieste 2027: domanda 19 ottobre–18 novembre 2026.
  Fonti, esclusioni e limiti in `data/fiere-trieste.json` e `data/FIERE.md`.
- [ ] **Trieste — aggiornamenti periodici**: San Martino e Natale 2026,
  conferma Corte dei Miracoli Muggia (fonti discordanti e nuovo affidamento),
  giornate intermedie Aurisina, nuove edizioni e ammissioni professionali.
  Muggia: bando gestione entro 23 ottobre ore 12, distinto dalle domande espositori.

- [x] **Prato — ricerca approfondita completata**: sette comuni controllati,
  38 manifestazioni pubblicate in [/fiere](https://subingresso.it/fiere?provincia=Prato),
  prima nessuna scheda. Date, settori, contatti e partecipazione dove documentati.
  Carmignano: 13 concessioni, domande dal 6 al 31 ottobre 2026.
  Fonti, esclusioni e limiti in `data/fiere-prato.json` e `data/FIERE.md`.
- [ ] **Prato — aggiornamenti periodici**: calendari PDF annuali non recuperati,
  Festa dell'Olio, Comeana, Assedio e Natale; programmi commerciali mancanti.
  Confermare sede/ricorrenza Novecento, ammissioni professionali e Poggiole Natale
  (5–6 dicembre provvisorio, candidatura indicata entro 15 novembre).
  Fierucola delle Bigonge: 10–11 ottobre spostata al 19 settembre, non riproporre.

- [x] **Bologna — ricerca approfondita completata**: controllate le fonti nei 55
  comuni, 65 manifestazioni in 39 comuni pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Bologna), prima 15 schede.
  Date separate, contatti e categorie di partecipazione dove documentati.
  Santa Lucia: 6 novembre–27 dicembre; Tartòfla: quattro fine settimana;
  riuso Crevalcore: 22 novembre. Consolidata la Tartufesta di Sasso Marconi.
  Fonti, esclusioni e limiti in `data/fiere-bologna.json` e `data/FIERE.md`.
- [ ] **Bologna — aggiornamenti periodici**: nuove edizioni, bandi, costi,
  disponibilità e ammissioni professionali; completare il calendario regionale
  non recuperabile integralmente, i programmi scansione e i saloni espositivi.
  Chiarire le fonti discordanti e le Tartufeste senza mercato documentato.

- [x] **Milano — ricerca approfondita completata**: ricerca documentale nei 133
  comuni; 83 manifestazioni in 47 comuni, prima 15, pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Milano). Confrontate 140 righe
  regionali e scaricati 140 programmi; aggiunte fonti comunali e organizzatori.
  Nove fiere comunali di Milano con termini distinti, mercatone Naviglio con
  13 date, Assago Natale in tre giornate e Paderno primavera solo il 22 marzo.
  Schede, audit dei 133 comuni, esclusioni e limiti in `data/fiere-milano.json`
  e `data/FIERE.md`; ammissioni non pubblicate sempre da verificare.
- [ ] **Milano — aggiornamenti periodici**: nuovi bandi e disponibilità; completare
  le segnalazioni conservate nell’audit, chiarire EcoFesta Paderno, Olcella,
  Notte Bianca Gorgonzola, calendari cittadini e giorni commerciali non definiti.

- [x] **Bergamo — ricerca approfondita completata**: ricerca nei 243 comuni;
  80 manifestazioni in 42 comuni, prima 33, pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Bergamo). Confrontate 261 righe
  regionali e scaricati tutti i programmi; 40 contatti e cinque scadenze.
  Albino in due giornate, Palosco Natale in tre domeniche, Clusone Natale
  in 28 giornate con domanda entro l'11 ottobre. Fonti, esclusioni e limiti
  in `data/fiere-bergamo.json` e `data/FIERE.md`.
- [ ] **Bergamo — aggiornamenti periodici**: nuove edizioni, bandi e disponibilità;
  chiarire Calcio Pasquetta, Leffe Monte Croce, programmi solo scansionati
  e giorni commerciali non definiti; riconfermare lo storico Castione Natale.

- [x] **Verona — ricerca approfondita completata**: ricerca nei 98 comuni;
  75 manifestazioni in 36 comuni pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Verona), rispetto alle 20 precedenti.
  Confrontate 277 segnalazioni regionali e calendari fiere, antiquariato e mercati;
  approfonditi Comuni e organizzatori. Date commerciali, contatti, ammissione,
  costi e termini quando pubblicati; Tregnago 8/11 novembre, termine 25 ottobre;
  Garda termine 15 ottobre con incongruenza da confermare. Limiti, esclusioni
  e fonti in `data/fiere-verona.json` e `data/FIERE.md`.
- [ ] **Verona — aggiornamenti periodici**: ricontrollare bandi, disponibilità,
  giornate operative e conflitti; completare i riscontri rimasti senza fonte
  primaria corrente. Nessuna autorizzazione automatica a nuovi interventi.

- [x] **Padova — ricerca approfondita completata**: ricerca nei 101 comuni attuali
  (102 chiavi del dataset più Santa Caterina d’Este); 95 manifestazioni in 41 comuni,
  prima 11, integrate nel catalogo per [/fiere](https://subingresso.it/fiere?provincia=Padova).
  Esaminate 167 segnalazioni Veneto e quattro calendari ufficiali; integrate fonti
  comunali e organizzatori, 43 contatti e nove scadenze. Piove sei giorni di banchi,
  Arsego mercato 17–20 ottobre, Baone Bisi 16–17 maggio e Rustega 3 maggio.
  Moduli Bertipaglia e bando espositori Cittadella distinti dalle domande ambulanti;
  Natale storico e periodi generali segnalati. Fonti, esclusioni e limiti in
  `data/fiere-padova.json` e `data/FIERE.md`.
  Pubblicazione verificata il 13 ottobre: 95 schede online, attesa deploy risolta.
- [ ] **Padova — aggiornamenti periodici**: nuove edizioni, bandi, disponibilità e
  ammissioni; chiarire antiquariato Cittadella, giorni banchi Folpo e Arzergrande,
  San Luca Camposampiero, Montagnanese, Polverara, Natale e programmi in immagini.

- [x] **Treviso — ricerca approfondita completata**: confronto dei 94 comuni,
  337 righe Veneto e tre calendari regionali; 79 manifestazioni in 39 comuni
  pubblicate e verificate in [/fiere](https://subingresso.it/fiere?provincia=Treviso),
  prima 48. 52 schede con giornate precise, 23 date testuali e quattro periodi;
  38 contatti e due scadenze documentate, entrambe passate. Stelle a Natale
  include il 7 dicembre; San Gregorio commerciale 7–9 marzo; Santa Lucia 12–14
  dicembre, termine 30 settembre. Sei falsi positivi esclusi con motivazione.
  Qwen su otto microtask, tutte le prove e note controllate da Codex; 4.782 token
  locali, risparmio netto non misurato. Audit e limiti in `data/fiere-treviso.json`
  e `data/FIERE.md`; le altre 2.446 schede sono identiche. Vercel e sito verificati.
- [ ] **Treviso — aggiornamenti periodici**: bandi, disponibilità, quote e
  ammissioni; chiarire Castelcucco, San Luca, Vi-Ve in Vintage e giornate dei
  banchi nei periodi di festa. Approfondire Segusino, Tovena, Sarmede Teatro,
  Natale Conegliano, Tucogiò e scansioni Istrana/Delizie non verificate visivamente.
  Non applicare moduli 2025 al 2026 né dedurre nuove edizioni; nessun altro
  intervento automatico autorizzato.

- [x] **Vicenza — ricerca approfondita completata (13 ottobre 2026)**: ricerca
  nominale nei 114 comuni, 549 programmi regionali e calendari antiquariato/fieristico;
  117 manifestazioni in 49 comuni, prima 59, in
  [/fiere](https://subingresso.it/fiere?provincia=Vicenza). 55 schede con giornate
  precise, 20 periodi e 42 indicazioni testuali; 48 contatti e sei scadenze.
  Sarcedo Natale: 8 dicembre, domanda entro 3 dicembre ore 23:59, suolo gratuito;
  Asiago Santi: 2 novembre. Barbarano: 22 e 25 novembre, moduli e tariffe distinti,
  termini ordinari già trascorsi. Fonti e limiti in `data/fiere-vicenza.json`
  e `data/FIERE.md`. Altre 2.466 schede identiche; Vercel e sito verificati,
  incluse sei schede operative e i filtri su desktop e telefono.
- [ ] **Vicenza — aggiornamenti periodici**: nuove edizioni, bandi, quote,
  disponibilità e ammissioni; approfondire Bassano e Malo con fonti primarie correnti,
  calendario Recoaro, Natale Vicenza, giornate Nove, date testuali e scansioni residue.
  Non applicare moduli storici al 2026 né periodi delle feste ai giorni dei banchi.

- [x] **Modena — ricerca approfondita completata (14 ottobre 2026)**: ricerca
  nominale nei 47 comuni; 74 manifestazioni in 33 comuni, prima 10, nel calendario
  [/fiere](https://subingresso.it/fiere?provincia=Modena). Fonti comunali, turistiche,
  organizzatori e PDF operativi; 120 documenti tentati e dieci scadenze.
  Castelfranco casette: termine 17 ottobre; Pievepelago Castagna: 27 ottobre ore 12;
  Castelvetro Natale: 16 novembre, P.IVA 3×3 m 48 €. Ognissanti Concordia in due
  giornate; Vignola distingue fiori, opere proprie e ambulanti. Calendario regionale
  completo non recuperato, snapshot conservati e limiti espliciti in
  `data/fiere-modena.json` e `data/FIERE.md`. Altre 2.573 schede identiche.
  Pubblicazione verificata: 74 schede online, sette dettagli su desktop/telefono;
  controlli catalogo, filtri e browser passati.
- [ ] **Modena — aggiornamenti periodici**: disponibilità, bandi e quote; recuperare
  disciplinare casette Castelfranco 2026, registro regionale completo e programmi
  residui, Bruino Medolla, calendari montani e Natale. Non trasferire documenti
  storici alle nuove edizioni né periodi generali ai giorni dei banchi.

- [x] **Parma — ricerca approfondita completata (14 ottobre 2026)**: ricerca
  nominale nei 44 comuni; 81 manifestazioni in 30 comuni, prima nove, nel
  calendario [/fiere](https://subingresso.it/fiere?provincia=Parma). Verificate
  242 schede regionali candidate, 42 valide; Comuni, IAT, organizzatori e PDF.
  76 schede con giornate precise, due periodi, una testuale e due ricorrenze;
  14 contatti, sei termini assoluti/relativi. November Porc: mercati sabato e
  domenica, venerdì gastronomico separato; Fragno in quattro domeniche;
  Natale Piazza Ghiaia in sei giornate. Fiere Borgo Val di Taro 2027 esplicite.
  Fonti, conflitti, esclusioni e limiti in `data/fiere-parma.json` e `data/FIERE.md`;
  registro annuale completo non recuperato. Altre 2.638 schede identiche.
  Pubblicazione verificata: 81 schede online e otto dettagli su desktop/telefono;
  controlli dati, filtri e browser passati. Vercel riuscito, catalogo conforme.
- [ ] **Parma — aggiornamenti periodici**: nuovi bandi, disponibilità, quote,
  Natale e programmi residui; chiarire Rocca e Natura dicembre, Consorzio
  Fontanellato 8 dicembre, Varsi Primavera, Bardi Giugno e casette Parma/GIA.
  Approfondire Sorbolo, Roccabianca San Michele, Felino, Sissa/Trecasali,
  Sala Baganza, Lesignano, Torrile e comuni montani. Non applicare moduli
  storici al 2026 né programmi gastronomici ai giorni dei banchi.

- [x] **Reggio nell'Emilia — ricerca approfondita completata (14 ottobre 2026)**:
  ricerca nominale nei 42 comuni; 87 manifestazioni in 38 comuni,
  prima 14. Controllate 211 schede regionali candidate, 47 valide; Comuni/SUAP,
  IAT, Pro Loco, Com.Re e organizzatori, PDF San Luca verificato visivamente.
  47 contatti e cinque termini assoluti/relativi. San Martein 8 novembre,
  domanda 2 novembre; Vezzano 8 novembre, P.IVA 3×3 35 €, food 80 €, OPI 20 €;
  termine 28 ottobre solo no profit. Rolo termine 5 ottobre trascorso.
  Fonti, conflitti, esclusioni e limiti in `data/fiere-reggio-emilia.json`
  e `data/FIERE.md`; registro regionale annuale integrale non recuperato.
  Altre 2.705 schede identiche e tutti i 14 ID precedenti preservati.
  Pubblicazione verificata: 87 schede e otto dettagli online su desktop e
  telefono; Vercel riuscito, catalogo conforme, controlli dati e browser passati.
- [ ] **Reggio nell'Emilia — aggiornamenti periodici**: nuove edizioni,
  bandi, quote e disponibilità; approfondire Reggiolo, Novellara, antiquariato
  Cavriago, Cadelbosco, Castelnovo di Sotto, Natale e comuni montani.
  Chiarire Fiera di Maggio San Martino, antiquariato Scandiano e Ciccioli Albinea.
  Non applicare moduli storici a nuove edizioni né periodi generali ai banchi.

- [x] **Varese — ricerca approfondita completata (14 ottobre 2026)**:
  ricerca nominale nei 136 comuni attuali; 81 manifestazioni in 36 comuni,
  prima quattro. Esaminate tutte le 123 righe regionali 2026 e i programmi:
  111 con testo, 12 scansionati verificati visivamente; calendari turistici,
  Comuni e organizzatori, moduli e regolamenti 2026. 38 schede con contatti.
  Inarzo 15 novembre, domanda 22 ottobre, 25 €/3 metri; Carnago 7–8 dicembre,
  gratuito con cauzione 10 €; Gazzada 29 novembre gratuito per opere proprie;
  Porto Valtravaglia termine 10 ottobre scaduto, 30 € più canone commerciale.
  Sospensioni, conflitti e tre schede storiche 2025 espliciti; nessuna data
  dedotta da ricorrenze. Audit in `data/fiere-varese.json` e `data/FIERE.md`.
  Tutti i quattro ID precedenti preservati; altre 2.788 schede identiche.
  Pubblicazione verificata: 81 schede e otto dettagli online su computer e
  telefono; catalogo conforme al commit, controlli dati e cinque browser/schermi
  passati. Prossima provincia nell’ordine operativo: Como.
- [ ] **Varese — aggiornamenti periodici**: recuperare allegati Cairate,
  calendari giugno/luglio/settembre e candidature non pubblicate; chiarire
  date Cassano/Caronno Varesino, banchi Somma e segnalazioni nell’audit.

- [x] **Como — ricerca approfondita completata (14 ottobre 2026)**:
  ricerca nominale nei 147 comuni attuali; 83 manifestazioni in 31 comuni,
  prima 16, pubblicate in [/fiere](https://subingresso.it/fiere?provincia=Como).
  Letti tutti i 65 programmi Lombardia CO/2026, confrontati registri fieristici,
  Comuni, calendari turistici e organizzatori; 32 contatti e 11 termini assoluti.
  Uggiate con Ronago: 13 dicembre, domanda 27 novembre, hobbisti 10 € e
  espositori 20 €, refusi del modulo dichiarati. Cantù Crocifisso 18 ottobre
  con termine già trascorso e spunta; Santi un posteggio dolciumi. Anzano
  banchi solo 27 settembre, MOMA in due appuntamenti, Griante 16 novembre.
  Nove schede solo storiche 2025; date discordanti e ricorrenze esplicite.
  Audit, esclusioni e limiti in `data/fiere-como.json` e `data/FIERE.md`.
  Tutti i 16 ID conservati; altre 2.853 schede identiche. Vercel riuscito e
  catalogo online conforme al commit; 83 schede e dieci dettagli verificati
  su computer/telefono, filtri e controlli dati/browser passati.
- [ ] **Como — aggiornamenti periodici**: disponibilità, bandi, quote e nuove
  edizioni; chiarire modulo Uggiate per importi in lettere e profili P.IVA,
  Menaggio, Natale 2026, calendari Como dopo agosto, Turate e segnalazioni
  senza fonte primaria nell’audit. Non trasferire termini dei promotori o
  iscrizioni volontari alle domande espositori; nessuna nuova provincia avviata.

- [x] **Torino — ricerca approfondita completata (14 ottobre 2026)**:
  312 comuni cercati e 240 righe regionali esaminate (139 sagre, 101 fiere);
  241 manifestazioni in 115 comuni, prima 108, pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Torino). Confrontati calendari
  regionali, Comuni, Turismo Torino e organizzatori, moduli PDF/DOCX e
  manifesto Luserna. 222 schede con contatti e otto termini assoluti;
  candidature e costi distinti per categoria, otto edizioni solo storiche 2025.
  Cuorgnè termine 15 ottobre, Almese Natale 29 novembre; Tuttomele banchi
  nei due weekend, Rivoli spunta con domanda preventiva, Villafranca 13 dicembre.
  Fonti, copertura, esclusioni e limiti in `data/fiere-torino.json`
  e `data/FIERE.md`; conservati tutti i 108 ID e le altre 2.828 schede identiche.
  Vercel riuscito e catalogo online conforme al commit: 241 schede e dodici
  dettagli verificati su computer/telefono, Chromium e WebKit; filtri,
  mappa e controlli dati/browser passati. Nessun'altra provincia avviata.
- [ ] **Torino — aggiornamenti periodici**: disponibilità, bandi, quote,
  Natale e programmi montani residui; chiarire Collegno in Bancarella,
  Volvera, Pramollo, Brocante e nuovi mercati tematici. Pinerolo Natale:
  termine del gestore distinto da espositori. Non trasferire termini tra
  categorie, periodi di feste ai banchi né programmi 2025 al 2026.

- [x] **Mantova — ricerca documentale approfondita completata (14 ottobre 2026)**:
  confronto dei 64 comuni e 195 record regionali, tutti i programmi scaricati;
  **84 manifestazioni in 33 comuni**, prima 12, pubblicate e verificate in
  [/fiere](https://subingresso.it/fiere?provincia=Mantova). 50 schede con contatti
  e due termini assoluti documentati (15 maggio, scaduti); 76 con giornate
  precise, quattro periodi e quattro date testuali. Natale Mantova 19 aperture,
  San Fortunato e San Gallo 18 ottobre, Madonnina 6 settembre; Grazie 97 posteggi
  previsti e Viadana quote distinte. Fonti, esclusioni e incongruenze in
  `data/fiere-mantova.json` e `data/FIERE.md`. Test locali Chromium/WebKit e
  verifica online di 13 dettagli su computer/telefono superati; 12 ID mantenuti
  e altre 3.057 schede identiche. Commit dati `d6a96b0`, deploy Vercel riuscito.
- [ ] **Mantova — aggiornamenti periodici**: bandi, disponibilità e quote;
  chiarire Postumia Gazoldo, Grazie validità fino al 17 agosto, condizioni
  Broccante per professionisti, calendari Amarcord/Ostiglia/Solferino e tre
  scansioni non lette. Approfondire Guidizzolo, Motteggiana e Baule della Nonna;
  tartufo/riso conservati nell’audit senza posteggi esterni documentati.

- [x] **Cremona — ricerca documentale approfondita completata (14 ottobre 2026)**:
  71 manifestazioni in 31 comuni, prima nove; 113 comuni confrontati,
  71 programmi regionali recuperati e cinque grafici letti visivamente.
  61 schede con contatti e otto scadenze assolute; audit, fonti e limiti
  in data/fiere-cremona.json e data/FIERE.md.
  Buongusto Pizzighettone: termine 19 ottobre, quote + IVA 22%; Natale Idee
  Regalo: quattro date, termine 16 novembre, quote IVA inclusa.
  Ostiano banchi 25 ottobre, Ratatuia 25 ottobre solo su invito;
  Santa Maria della Croce 28–30 marzo da Comune, non 27–29 del registro.
  Periodi provinciali e San Carlo da confermare, nessun termine dei gestori
  o del 2025 trasferito agli espositori. Tutti i nove ID e altre 3.132 schede
  preservati. Vercel riuscito, catalogo online conforme al commit 7f05e52;
  13 dettagli e filtri verificati in Chromium computer/telefono e WebKit telefono.
  Checkout isolato, Venezia resta alla sessione sospesa.
- [ ] **Cremona — aggiornamenti periodici**: disponibilità, bandi, nuove
  edizioni e calendari natalizi definitivi; chiarire Sant’Apollonia, San Carlo,
  Santa Lucia, modulo hobbisti Monte Cremasco e termine relativo Ratatuia;
  recuperare Bonemerse, Creare, programmi commerciali settembrini e altri
  allegati residui. Date da stampa locale esplicite, non programmi comunali.

- [x] **Venezia — ricerca documentale approfondita completata (14 ottobre 2026)**:
  84 manifestazioni in 26 comuni, prima 16, pubblicate in
  [/fiere](https://subingresso.it/fiere?provincia=Venezia). Ricerca nei 44 comuni,
  tutte le 132 righe Veneto esaminate; 40 appuntamenti del calendario Caorle
  raggruppati in sette rassegne. Comuni, organizzatori, calendari turistici,
  antiquariato e moduli: 17 contatti e un termine assoluto documentato.
  Sant’Andrea: ambulanti/produttori 28–29 novembre, modulo C entro 30 ottobre,
  quote + IVA 22% e CUP; 22 novembre riservato ad altre categorie.
  Noale in Fiore 12 aprile, Primavera Portogruaro 11–12 aprile, Bisi banchi
  31 maggio; categorie Caorle e Corbolone distinte. Jesolo e Caorle Natale
  con periodi 2026–2027, singole aperture da confermare.
  Copertura, esclusioni e limiti in `data/fiere-venezia.json` e `data/FIERE.md`;
  56 schede con giornate precise, 21 periodi e sette ricorrenze/testi.
  Tutti i 16 ID e le altre 3.187 schede preservati, comprese Mantova e Cremona.
  Commit dati 765cb5e: Vercel riuscito, catalogo e script online conformi;
  84 risultati e dodici dettagli verificati su computer/telefono Chromium
  e WebKit, controlli dati e cinque browser/schermi passati. Sessione ripresa
  e conclusa: le precedenti note di sospensione di Venezia sono superate.
- [ ] **Venezia — aggiornamenti periodici**: nuove edizioni, disponibilità,
  quote e candidature non pubblicate; chiarire programmi commerciali
  Scorzè, Musile e Summaga, Natale provinciale, piste Eraclea/Jesolo estate,
  Torre di Mosto, Cavarzere, Santa Maria di Sala e comuni senza schede.
  San Donà: recuperare moduli correnti, sito non accessibile; Camponogara
  conferma operativa oltre l’estratto ACTV. Natale Mira resta provvisorio;
  nessuna proiezione di date/termini storici o dei gestori agli espositori.

- [x] **Novara — ricerca documentale approfondita completata (15 ottobre 2026)**:
  ricerca nominale negli 87 comuni; 71 manifestazioni in 36 comuni, prima 13,
  pubblicate e verificate in [/fiere](https://subingresso.it/fiere?provincia=Novara).
  Confrontate tutte le 25 righe dei due registri Piemonte e le 33 schede ATL
  Fiere e Mercati; vagliate Enogastronomia e Sagre, 261 dettagli distinti.
  45 schede con contatti, sei scadenze; 69 con date precise, una testuale,
  una sola ricorrenza. Fonti, copertura, esclusioni e limiti documentati in
  `data/fiere-novara.json` e `data/FIERE.md`; nessuna data proiettata.
  Ameno domanda 30 ottobre; Ghemme Natale 15 novembre; Prato Sesia Natale
  11 dicembre. Cureggio mercato annullato escluso; fiere Novara in nuove aree,
  Lesa 22 agosto e Fiorissimo 2–4 aprile 2027 da annunci espliciti.
  Commit dati `e92ded2`, Vercel riuscito; catalogo online identico al commit,
  mappa e dieci dettagli verificati su computer/telefono Chromium e WebKit.
- [ ] **Novara — aggiornamenti periodici**: nuove edizioni, bandi e disponibilità;
  chiarire giorni del weekend Novara e consistenze discordanti, sede/condizioni
  Roba Végia, sede Arona tartufo, Ghemme vino e calendario Boca. Recuperare
  avviso domande Trecate e programmi correnti Natale Briga, Bellinzago,
  Castelletto, Le Pigne, Comignago e Romentino Artiquariando. Meina resta
  storico 2025; nessuna quota, domanda o data da ricostruire per ipotesi.

- [x] **Cuneo — ricerca documentale approfondita completata (15 ottobre 2026)**:
  ricerca nominale nei 247 comuni; 173 manifestazioni in 93 comuni, prima 55,
  pubblicate e verificate in [/fiere](https://subingresso.it/fiere?provincia=Cuneo).
  Esaminate 160 righe dei due registri Piemonte e 82 record distinti ATL,
  confrontati PDF regionali, Comuni, organizzatori, Pro Loco e calendario LMR.
  117 schede con giornate precise, 54 con periodi, due senza edizioni datate;
  165 con recapiti e dieci termini documentati. Fonti, copertura, esclusioni
  e conflitti in `data/fiere-cuneo.json` e `data/FIERE.md`.
  Gusta Cherasco 24–25 ottobre, termine del canale Cascine Piemontesi
  16 ottobre; Cherasco Natura 8 novembre, termine dello stesso canale 31 ottobre.
  Distinti i mercati ambulanti del Marrone dalla fiera; Venasca mercato
  18 ottobre, Dula Paroldo 31 maggio, Govone 14 giornate esplicite.
  Conservati tutti i 55 ID e le altre 3.274 schede. Commit dati `17e2ee0`,
  Vercel riuscito, catalogo/script online identici al commit; 173 risultati,
  mappa e dodici dettagli verificati su Chromium computer/telefono e WebKit.
- [ ] **Cuneo — aggiornamenti periodici**: bandi, disponibilità e nuovi programmi;
  BEE Villanova 20–22 novembre ATL contro 14–15 regionale, giorni commerciali
  dei periodi ancora non definiti e programmi futuri. Modulo Fossano ancora
  2025 nella notizia 2026; pagine ritirate Dronero/Fossano, Monforte creativi,
  Cervasca, Natale Paesana/Saluzzo/Castellar e nuova edizione Cheese da
  ricontrollare. Le esclusioni e le ricorrenze non sono date 2026 confermate.
  Nessuna domanda, candidatura o comunicazione a terzi inviata.

- [x] **Trento — ricerca documentale approfondita completata (16 ottobre 2026)**:
  ricerca nominale nei 166 comuni; 122 manifestazioni in 62 comuni, prima cinque,
  pubblicate e verificate in [/fiere](https://subingresso.it/fiere?provincia=Trento).
  Letto integralmente e verificato visivamente il calendario ANVA 2026;
  confrontati Comuni, APT territoriali, organizzatori e calendario AEFI Riva.
  115 schede con giornate pubblicate, cinque periodi, due date testuali;
  95 con recapiti, 13 con termine documentato. Fonti, copertura, esclusioni
  e limiti in `data/fiere-trento.json` e `data/FIERE.md`.
  Trento San Giuseppe 15 marzo, Cles San Rocco 16 agosto; distinte fiera
  ambulante Cles 2 maggio e mostra agricola 1–2 maggio. Natale Ala domanda
  20 ottobre da allegati; costi, IVA e cauzioni verificati nei disciplinari
  di Trento, Ala, Ossana, Pomarolo e Ciuiga. Date di pagamento non scambiate
  per scadenze delle domande; periodi senza singole aperture dichiarati.
  Conservati i cinque ID e le altre 3.442 schede, inclusi costi Pisogne;
  preservato anche l'aggiornamento parallelo dei filtri regionali.
  Commit dati `3c80a59`, Vercel riuscito; catalogo e script online
  identici al commit. 122 risultati, mappa e dodici dettagli verificati su
  Chromium computer/telefono e WebKit; build, settori e suite generale passati.
- [ ] **Trento — aggiornamenti periodici**: bandi, disponibilità e nuove edizioni;
  giorni commerciali di Siror, Moena, Canazei, Campitello, Vallarsa e Caderzone;
  apertura Natale Pergine 25 dicembre, giorno San Marco Rovereto e possibili
  rinvii meteo. Recuperare nuove fonti per Val di Gresta, Folgaria artigianato
  estivo e Avio Herbarium. Le query nominali non certificano l'assenza di altri
  eventi; quote non pubblicate mai interpretate come gratuite. Nessuna domanda,
  candidatura o comunicazione a terzi inviata.

- [x] **Bolzano/Bozen — ricerca documentale approfondita completata (16 ottobre 2026)**:
  ricerca nominale nei 116 comuni; 207 manifestazioni in 73 comuni, prima cinque,
  pubblicate e verificate in [/fiere](https://subingresso.it/fiere?provincia=Bolzano%2FBozen).
  Letto integralmente e controllato visivamente il calendario HDS/FIVA 2026:
  338 righe, 123 annuali; 31 ricorrenze nominative riscontrate nei calendari
  locali di Sarentino, Vipiteno e Chiusa, 184 righe ordinarie escluse.
  Comuni, associazioni turistiche e organizzatori; 196 schede con giornate
  pubblicate e 11 con soli periodi, 69 recapiti e cinque termini scaduti.
  Quattro nuove sintesi di costo e due precedenti conservate; IVA, cauzioni,
  spese e biglietti visitatori distinti. Fonti, copertura, esclusioni e limiti
  in `data/fiere-bolzano.json` e `data/FIERE.md`.
  Stegona 26–28 ottobre; Brunico Natale domanda 30 aprile 2026, non riaperta;
  Merano gara triennale scaduta 10 maggio 2024, Bressanone 16 marzo 2025.
  Ortisei 25 dicembre solo gastronomia; Renon venti giornate, Corvara include
  Natale; Fiè solo storico 2025/26. Nessuna data o disponibilità inventata.
  Conservati tutti i cinque ID e le altre 3.559 schede. Commit dati `e4f98e2`,
  Vercel riuscito; catalogo, script e pagina online identici al commit.
  207 risultati, mappa e 14 dettagli verificati su Chromium computer/telefono
  e WebKit; build, settori e suite generale su cinque schermi/browser passati.
- [ ] **Bolzano/Bozen — aggiornamenti periodici**: nuove edizioni, bandi,
  disponibilità e ammissioni; completare i programmi commerciali di Lana,
  Castelrotto, Tirolo, Bressanone e Vipiteno, riconfermare Fiè e verificare
  nuove fonti Carezza/Tires. Recuperare bando Flower Festival (link con errore
  DNS), avvisi dei mercati minori e pagine che hanno rimosso le date passate.
  Quote non pubblicate non gratuite; termini di pagamento e bandi per
  categorie specifiche non sono candidature generali. Nessuna comunicazione,
  domanda o candidatura a terzi inviata; nessun'altra provincia avviata.

- [x] **Firenze — ricerca documentale approfondita completata (16 ottobre 2026)**:
  controllati i 41 comuni; 113 manifestazioni in 40 comuni, prima tre,
  pubblicate e verificate in [/fiere](https://subingresso.it/fiere?provincia=Firenze).
  92 schede con giornate pubblicate, sei periodi e 15 ricorrenze testuali;
  42 con recapiti, nove schede con termine e 28 sintesi di costo documentate.
  Fonti amministrative, turismo ufficiale e organizzatori; audit, esclusioni,
  conflitti e limiti in `data/fiere-firenze.json` e `data/FIERE.md`.
  Firenze Natale: 23 posteggi, domanda 23 ottobre; Rionalissima 16 ottobre;
  Prim.OLIO 26 ottobre, 300 € per spazio salvo Onlus; Empolissima 30 ottobre
  per l'8 novembre. Cèramica: candidatura scaduta 12 ottobre, richiesta
  tesserino 2 novembre distinta; bando A esenzione canone, B 25 €/giorno.
  Fucecchio banchi 1/3/5/7/8 novembre; Cerbaia 7/14 giugno; Fierucola giugno
  da calendario organizzatore, senza applicare ricorrenze automatiche.
  Conservati i tre ID e le altre 3.763 schede; catalogo totale 3.876.
  Commit dati `8975717`, Vercel riuscito; catalogo/script/pagina online identici.
  113 risultati, mappa e dodici dettagli verificati su Chromium computer/telefono
  e WebKit; build, settori e suite generale su cinque schermi/browser passati
  (ripetuto WebKit dopo timeout hover su La Spezia, nessuna modifica necessaria).
- [ ] **Firenze — aggiornamenti periodici**: recuperare calendari commerciali
  completi, Capraia e Limite, nuove disponibilità e quote; chiarire Montaione
  e seconda giornata Firenzuola, giorni commerciali dei periodi e FAM 4/5 giugno.
  Riconfermare Londa/Galliano, rimasti storici 2025; segnalazioni prive di mercato
  esterno restano nell'audit. Privati/hobbisti distinti dai professionisti;
  nessuna candidatura, comunicazione o pagamento a terzi.

- [ ] **Roma — ricerca parziale pubblicata e verificata (16 ottobre 2026)**:
  99 manifestazioni in 43 comuni, prima tre, online in
  [/fiere](https://subingresso.it/fiere?provincia=Roma). Ricerca nominale nei
  121 comuni e confronto delle 31 righe del registro Lazio; 51 recapiti,
  11 termini documentati e sette sintesi di costo. Fonti, copertura,
  esclusioni e limiti in `data/fiere-roma.json` e `data/FIERE.md`.
  Castel San Pietro Natale: 13/20/27 dicembre, domanda 15 novembre,
  quote 50/70 euro a giornata. Segni domanda scaduta 9 ottobre; Bajocco
  1 settembre saldo, non candidatura. Date commerciali separate a Nettuno,
  Castel Gandolfo e Genzano; Maker Faire 23–25 ottobre e Landriana 28–29 marzo.
  Commit dati `1429fa3`, Vercel riuscito; catalogo/script/pagina online
  identici al commit, 99 risultati, mappa e dodici dettagli verificati su
  Chromium computer/telefono e WebKit. Build, settori e suite generale passati.
  **Non completata**: restano calendari commerciali finali dei Municipi di Roma
  e Befana, atti correnti Vicovaro, formule Lariano e programmi commerciali
  Tolfa/Cave, oltre alle piste in audit senza fonte primaria sufficiente.
  Nessuna candidatura o comunicazione a terzi. Modifiche preesistenti preservate.

**Ricerca approfondita: 28 province completate, 82 ancora da fare su 110.**
Riepilogo ricontrollato il 16 ottobre 2026 dopo la pubblicazione parziale di Roma:
Roma resta nelle 82 da completare e non aumenta il conteggio delle concluse.
Le schede importate nelle altre province non equivalgono a ricerca approfondita.
Elenco allineato alle unità territoriali del calendario, inclusa la Sardegna 2026.

**Ordine operativo aggiornato il 12 ottobre 2026, dalla più importante alla meno
importante per subingresso.it.** Prima fiere e mercati utili agli ambulanti,
bacino di operatori/clienti, capacità di spesa e turismo, poi vicinanza alla
Lombardia e beneficio atteso della ricerca. Favorire il Nord e le zone ricche
richieste dall’utente. Questa è una stima commerciale qualitativa, non una
classifica di volumi Google: mancano dati provinciali comparabili di ricerche
e conversioni. Rivalutare con Search Console, annunci e contatti effettivi.
La fama dei grandi saloni espositivi da sola non misura l’utilità per ambulanti.

- [x] **1. Milano** — Lombardia; ricerca completata, vedi sopra
- [x] **2. Bergamo** — Lombardia
- [x] **3. Verona** — Veneto
- [x] **4. Padova** — Veneto; ricerca completata, vedi sopra
- [x] **5. Treviso** — Veneto; ricerca completata, vedi sopra
- [x] **6. Vicenza** — Veneto; ricerca completata, vedi sopra
- [x] **7. Modena** — Emilia-Romagna; ricerca completata, vedi sopra
- [x] **8. Parma** — Emilia-Romagna; ricerca completata, vedi sopra
- [x] **9. Reggio nell'Emilia** — Emilia-Romagna; ricerca completata, vedi sopra
- [x] **10. Varese** — Lombardia; ricerca completata, vedi sopra
- [x] **11. Como** — Lombardia; ricerca completata, vedi sopra
- [x] **12. Torino** — Piemonte; ricerca completata, vedi sopra
- [x] **13. Venezia** — Veneto; ricerca completata e verificata online, vedi sopra
- [x] **14. Mantova** — Lombardia; ricerca completata e verificata online, vedi sopra
- [x] **15. Cremona** — Lombardia; ricerca completata e verificata online, vedi sopra
- [ ] **16. Pavia** — Lombardia
- [x] **17. Novara** — Piemonte; ricerca completata e verificata online, vedi sopra
- [x] **18. Cuneo** — Piemonte; ricerca completata e verificata online, vedi sopra
- [x] **19. Trento** — Trentino-Alto Adige; ricerca completata e verificata online, vedi sopra
- [x] **20. Bolzano/Bozen** — Trentino-Alto Adige; ricerca completata e verificata online, vedi sopra
- [x] **21. Firenze** — Toscana; ricerca completata e verificata online, vedi sopra
- [ ] **22. Roma** — Lazio; 99 schede pubblicate e verificate, ricerca provinciale parziale, vedi sopra
- [ ] **23. Rimini** — Emilia-Romagna
- [ ] **24. Ravenna** — Emilia-Romagna
- [ ] **25. Forlì-Cesena** — Emilia-Romagna
- [ ] **26. Piacenza** — Emilia-Romagna
- [ ] **27. Udine** — Friuli-Venezia Giulia
- [ ] **28. Pordenone** — Friuli-Venezia Giulia
- [ ] **29. Ferrara** — Emilia-Romagna
- [ ] **30. Lucca** — Toscana
- [ ] **31. Pisa** — Toscana
- [ ] **32. Pistoia** — Toscana
- [ ] **33. Genova** — Liguria
- [ ] **34. Alessandria** — Piemonte
- [ ] **35. Asti** — Piemonte
- [ ] **36. Pesaro e Urbino** — Marche
- [ ] **37. Ancona** — Marche
- [ ] **38. Perugia** — Umbria
- [ ] **39. Napoli** — Campania
- [ ] **40. Bari** — Puglia
- [ ] **41. Salerno** — Campania
- [ ] **42. Siena** — Toscana
- [ ] **43. Livorno** — Toscana
- [ ] **44. Savona** — Liguria
- [ ] **45. La Spezia** — Liguria
- [ ] **46. Vercelli** — Piemonte
- [ ] **47. Biella** — Piemonte
- [ ] **48. Sondrio** — Lombardia
- [ ] **49. Belluno** — Veneto
- [ ] **50. Gorizia** — Friuli-Venezia Giulia
- [ ] **51. Rovigo** — Veneto
- [ ] **52. Verbano-Cusio-Ossola** — Piemonte
- [ ] **53. Imperia** — Liguria
- [ ] **54. Massa-Carrara** — Toscana
- [ ] **55. Grosseto** — Toscana
- [ ] **56. Valle d'Aosta/Vallée d'Aoste** — Valle d'Aosta
- [ ] **57. Macerata** — Marche
- [ ] **58. Fermo** — Marche
- [ ] **59. Ascoli Piceno** — Marche
- [ ] **60. Pescara** — Abruzzo
- [ ] **61. Teramo** — Abruzzo
- [ ] **62. Chieti** — Abruzzo
- [ ] **63. Latina** — Lazio
- [ ] **64. Viterbo** — Lazio
- [ ] **65. Frosinone** — Lazio
- [ ] **66. Terni** — Umbria
- [ ] **67. Caserta** — Campania
- [ ] **68. Lecce** — Puglia
- [ ] **69. Cagliari** — Sardegna
- [ ] **70. Sassari** — Sardegna
- [ ] **71. Gallura Nord-Est Sardegna** — Sardegna
- [ ] **72. Palermo** — Sicilia
- [ ] **73. Catania** — Sicilia
- [ ] **74. Messina** — Sicilia
- [ ] **75. Ragusa** — Sicilia
- [ ] **76. Siracusa** — Sicilia
- [ ] **77. Trapani** — Sicilia
- [ ] **78. Barletta-Andria-Trani** — Puglia
- [ ] **79. Brindisi** — Puglia
- [ ] **80. Taranto** — Puglia
- [ ] **81. Foggia** — Puglia
- [ ] **82. Avellino** — Campania
- [ ] **83. Benevento** — Campania
- [ ] **84. L'Aquila** — Abruzzo
- [ ] **85. Matera** — Basilicata
- [ ] **86. Cosenza** — Calabria
- [ ] **87. Catanzaro** — Calabria
- [ ] **88. Reggio Calabria** — Calabria
- [ ] **89. Potenza** — Basilicata
- [ ] **90. Campobasso** — Molise
- [ ] **91. Rieti** — Lazio
- [ ] **92. Agrigento** — Sicilia
- [ ] **93. Oristano** — Sardegna
- [ ] **94. Nuoro** — Sardegna
- [ ] **95. Vibo Valentia** — Calabria
- [ ] **96. Crotone** — Calabria
- [ ] **97. Caltanissetta** — Sicilia
- [ ] **98. Enna** — Sicilia
- [ ] **99. Ogliastra** — Sardegna
- [ ] **100. Sulcis Iglesiente** — Sardegna
- [ ] **101. Medio Campidano** — Sardegna
- [ ] **102. Isernia** — Molise


## ⚡ Velocità e visibilità su Google

- [ ] 🔴 Velocizzare il blog — rendere subito disponibile l'articolo in HTML e caricare solo le anteprime nell'elenco.
- [ ] 🟠 Alleggerire il sito e rendere più fluida la navigazione — cache dei file versionati, coordinate e librerie della dashboard caricate quando servono, icone leggere; ridurre gli spostamenti della pagina e ottimizzare paginazione e query degli annunci.
- [ ] 🔴 Sistemare indirizzi e indicizzazione — allineare sitemap e pagine definitive, correggere i 404 e migliorare blog e pagine locali verificando indicizzazione e risultati in Search Console. Prima i problemi che impediscono di trovare o aprire le pagine utili.
- [ ] 🟢 Creare pagine regionali — quando ci sono abbastanza annunci attivi; anticiparle solo nelle regioni con offerta concreta e domanda osservata.

## 👤 Annunci, profilo e avvisi

- [ ] 🔴 Migliorare scadenze e rinnovi — avvisi prima della scadenza e rinnovo rapido, per conservare l'offerta reale senza dover acquisire nuovamente gli stessi inserzionisti.
- [ ] 🟠 Migliorare gli alert — filtri per zona, settore, giorno e prezzo.
- [ ] 🟢 Registrare vendite e affitti conclusi — data, tempi e prezzo facoltativo; utile per analisi future, con beneficio immediato meno diretto rispetto ad acquisizione e rinnovi.
- [ ] 🟠 Salvare il telefono nel profilo — riutilizzare quello inserito nel primo annuncio; intervento circoscritto per facilitare le pubblicazioni successive, riusando la gestione dei contatti già esistente.

## 📊 Statistiche e provenienza degli utenti

- [ ] 🟠 Correggere le statistiche — dati, grafico, filtri ed email settimanali.
- [ ] 🔴 Capire da dove arrivano gli utenti — distinguere blog, bandi, valutatore, homepage e fiere; prima una misura essenziale di quali percorsi portano iscrizioni, annunci e contatti, per scegliere dove investire il tempo. Riutilizzare il tracciamento esistente e allinearlo alle scelte privacy.

## ✍️ Blog: un articolo per ogni fiera lombarda importante

Preparare un articolo per ciascun evento, pensato per gli ambulanti: data e luogo, numero e tipo di posteggi, settori ammessi, costi, requisiti, scadenza, domanda, spunta, contatti SUAP e fonti ufficiali. Verificare sempre le informazioni prima della pubblicazione.

Le caselle qui sotto indicano gli articoli completati e pubblicati. Procedere prima con le fiere ambulanti, poi con le sagre e i grandi eventi; valutare a parte le fiere espositive.

**Priorità degli articoli:** 🔴 un primo piccolo gruppo di fiere con opportunità concrete per ambulanti, informazioni ufficiali disponibili e domande ancora aperte o in prossima apertura; 🟠 gli altri articoli sulle fiere ambulanti; 🟢 sagre ed eventi espositivi finché non emerge un'opportunità pertinente. Verificare le scadenze prima di scegliere: l'ordine qui sotto è un catalogo, non una graduatoria di urgenza. Pubblicare pochi articoli utili con collegamenti agli annunci pertinenti e agli avvisi, misurare i risultati e poi scegliere il gruppo successivo.

### 🟠 Fiere ambulanti — selezionare il primo gruppo ad alta priorità

- [ ] Fiera dei SS. Faustino e Giovita — Brescia
- [ ] Oh Bej! Oh Bej! — Milano
- [ ] Antica Fiera di San Martino — Inveruno
- [ ] Fiera di Santa Caterina — Gorgonzola
- [ ] Fiera di Sant'Andrea — Oggiono
- [ ] Fiera regionale di merci e bestiame di Santa Apollonia — Rivolta d'Adda
- [ ] Fiera di San Gaudenzio — Ostiano
- [ ] Fiera di Santa Maria della Croce — Crema
- [ ] Fiera di San Giuseppe — Cernusco sul Naviglio
- [ ] Fiera del Crocifisso — Cantù
- [ ] Fiera della Possenta — Ceresara
- [ ] Fiera di Santa Lucia — Crema
- [ ] Fiera dei SS. Faustino e Giovita — Sarezzo
- [ ] Fiera di San Giuseppe — Pozzolengo
- [ ] Fiera della Sacra Spina — San Giovanni Bianco
- [ ] Fiera di San Paolo — Esine
- [ ] Fiera di Santa Caterina — Besana in Brianza
- [ ] Fiera di San Biagio — Magenta
- [ ] Fiera di Primavera — Paderno Dugnano
- [ ] Fiera autunnale — Busto Garolfo
- [ ] Fiera d'ottobre — Canneto sull'Oglio
- [ ] Fiera di Santa Apollonia — Cantù
- [ ] Fiera di Sant'Andrea — Chiuro
- [ ] Fiera di San Martino — Tirano
- [ ] Fiera di San Martino — Gargnano
- [ ] Fiera d'ottobre — Delebio
- [ ] Fiera di Sant'Ambrogio — Merate
- [ ] Fiera Ognissanti — Brescia
- [ ] Fiera di Sant'Andrea — Concesio
- [ ] Fiera di Santa Apollonia — Abbadia Lariana
- [ ] Fiera di Santa Apollonia — Viganò
- [ ] Fiera di San Martino — Leffe
- [ ] Fiera d'autunno — Parabiago
- [ ] Fera de Dugnan — Paderno Dugnano
- [ ] Fiera della Madunina di Custù — Brescia
- [ ] Fiera Cristo Re — Brescia
- [ ] Fiera di Santa Maria della Vittoria — Brescia
- [ ] Fiera di Natale e Villaggio di Babbo Natale — Assago

### 🟢 Sagre e grandi eventi — anticipare solo opportunità concrete per ambulanti

- [ ] Festa del Torrone — Cremona
- [ ] Fiera Nazionale del Tartufo Bianco — Borgofranco sul Po, Borgocarbonara
- [ ] Mostra del Bitto — Morbegno
- [ ] Morbegno in Cantina — Morbegno
- [ ] Festival della Mostarda — Cremona, Mantova e territorio
- [ ] Franciacorta in Bianco — Castegnato
- [ ] Festa dei Crotti — Albavilla
- [ ] Sagra dal Nedar e Fiuma — San Benedetto Po
- [ ] Sagra di Buscoldo — Curtatone
- [ ] Festa del Salame — Cremona

### 🟢 Da valutare separatamente — grandi fiere espositive

- [ ] Artigiano in Fiera — Rho
- [ ] BIT, Borsa Internazionale del Turismo — Rho
- [ ] MIDO — Rho
- [ ] MICAM Milano — Rho
- [ ] Milano Home — Rho
- [ ] Fa' la cosa giusta! — Rho
- [ ] Fiera Agricola Zootecnica Italiana — Montichiari
- [ ] Fiera Campionaria — Bergamo
- [ ] Mostra dell'Artigianato — Erba
- [ ] Il Bontà e Gusto Divino — Cremona
- [ ] Lombardia Carne — Rovato
- [ ] Bovimac — Gonzaga

<a id="coordinamento-storico"></a>

# Appendice — Coordinamento storico

Le note seguenti sono storiche: la registrazione di Venezia nella Parte B dichiara la sessione ripresa e conclusa, superando i riferimenti alla sospensione. La riserva di Pavia risale al 14 ottobre: verificarne lo stato prima di riprendere. Le versioni cache indicate sono minimi storici da confrontare con lo stato attuale.

**Coordinamento sessioni del 14 ottobre:** Mantova conclusa nella sessione
manuale in checkout isolato; **Venezia resta alla sessione sospesa**. Alla ripresa
rileggere lo stato attuale prima di generare/pushare il catalogo: conservare
`fiere-mantova.json` e la sua voce nel build, partire almeno da cache fiere.js 37
e catalogo 30, senza sovrascrivere le aggiunte pubblicate nel frattempo.

**Coordinamento 14 ottobre, ore 22:00: Cremona conclusa e verificata online** in checkout isolato Documents/subingresso-cremona-20261014. Venezia resta alla sessione sospesa. Alla ripresa leggere origin/main e conservare Mantova, fiere-cremona.json e la sua voce nel build, oltre alle altre aggiunte. Partire almeno da cache fiere.js 38 e catalogo 31; non rigenerare da snapshot vecchi. Prossima provincia libera nell’ordine: Pavia, non avviata.

**Coordinamento 14 ottobre, ore 23:03: Pavia riservata alla sessione manuale corrente**, in checkout isolato `Documents/subingresso-pavia-20261014`. Venezia resta alla sessione sospesa. Non avviare Pavia in parallelo; prima di pubblicare rileggere origin/main e mantenere tutte le province gi? integrate.
