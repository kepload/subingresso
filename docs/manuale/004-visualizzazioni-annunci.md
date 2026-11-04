
## 📊 Visualizzazioni Annunci

### Anteprima moderazione admin (7 ottobre 2026)

- Dashboard: titolo e pulsante `Anteprima completa` aprono `/annuncio?id=...&anteprima=moderazione`.
- `api/annuncio.js` invia solo il template per l’anteprima, con `private, no-store` e `noindex, nofollow`. I contenuti vengono letti dal client solo dopo verifica sessione e `profiles.is_admin`, attraverso le RLS esistenti; nessuna chiave privilegiata nel frontend.
- `js/listing-moderation.js` gestisce barra fissa Approva/Rifiuta, motivo del rifiuto, errori e logout. Update solo da `pending`, con controllo del record restituito; conserva i dettagli aggiornati. I trigger email esistenti restano invariati.
- Il dettaglio mostra tutte le foto, eventuale video e note fiera, senza incrementare visualizzazioni né creare JSON-LD durante la revisione. Script dettaglio aggiornato a `v=20` nei due template.
- Verifica: `python scripts/verify-listing-moderation.py` (Chromium e WebKit, dati simulati); `scripts/verify-listing-moderation.sql` controlla accessi e colonne usando fixture temporanee con le policy live, senza moderare annunci reali.

### Statistiche venditore (correzione 17 ottobre 2026)

- Rimossa su richiesta la sezione superiore “Il tuo annuncio”: scheda/carousel, riepilogo complessivo e domanda regionale. Rimossi contenitore, caricamento RPC e funzioni dedicate; restano statistiche per periodo e gestione degli annunci. Pubblicato `4fc8f66`, Vercel riuscito `J86R1MRxW4CE4UZ1Dv883fsjiRhu`; HTML online identico, assenza riquadro/caricamento e presenza statistiche/elenco verificate. Sintassi, suite numeri e browser Chromium 1440/320 + WebKit 390 passati; backup remoto `backup/session-20261017-172903-rimuovi-riquadro-annuncio` verificato.
- Preferenza utente aggiornata: grafico sopra i quattro riquadri, solo etichetta e numero (es. “Click WhatsApp”), nessun sottotitolo ripetitivo o spiegazione visibile. Definizioni/storico nella voce apribile; rimossi sottotitolo del pannello, note Vetrina ripetute e suggerimento generico “Annunci in ordine”. Periodo compatto; calcoli e filtri conservati. Pubblicato `c0eaa91`, Vercel riuscito `9Je1CvpUeYma6xr9CAs4ES3NsMRH`: HTML identico al commit, test numeri e browser locali/online con backend simulato Chromium 1440/320 e WebKit 390 passati; immagini in `Documents/verifica-statistiche-20261017/pulizia`. Backup remoto `backup/session-20261017-172250-statistiche-pulizia-testi` verificato.
- `Performance posteggi`: numeri e grafico soltanto nel periodo 7/30/90 giorni selezionato, stesso filtro annuncio. Quattro card: visualizzazioni (anteprime + aperture), messaggi ricevuti sul sito, clic telefono, clic WhatsApp; chat aperte e nuove aggiunte ai preferiti separati. Nessun totale storico o tasso che sommi clic e messaggi. I clic non confermano telefonate/invii esterni; le risposte del venditore e il supporto non sono messaggi ricevuti dai compratori.
- Patch live `PATCH_SELLER_ANALYTICS_PERIOD_20261017.sql`: RPC privata estesa, giorni e confini UTC restituiti dal DB, messaggi giornalieri da eventi effettivi anche senza visite nello stesso giorno. Totali precedenti mantenuti solo per compatibilità; nessun backfill inventato. Storico visite/clic/preferiti dal 6 ottobre: avviso parziale e punti mancanti nel grafico, non zeri anteriori alla rilevazione. Hero superiore identificata come riepilogo complessivo, eliminato il falso “— 7g” sulle viste.
- Prove: `scripts/verify-seller-analytics.sql` con ROLLBACK, 112 profili, isolamento e aggregati reali per 7/30/90, contatori, fixture temporanee per messaggi a mezzanotte/confini, date future, risposte/supporto e UTC anche con fuso +14. Guardie dati e trigger conservati. `scripts/verify-seller-analytics.js`; browser `scripts/test-seller-analytics.cjs` con Chart.js reale, Chromium 1440/320 e WebKit 390, fusi diversi, zero recente con 900 storiche, cambio annuncio/periodo, richieste fuori ordine, errori/riprova e overflow. Nessun messaggio reale nei test; snapshot funzione precedente e immagini in `Documents/verifica-statistiche-20261017`. Email settimanali ancora da correggere separatamente.
- Pubblicato `831072d`, Vercel riuscito `JCceebVBYho3MyB4vttxai8APFXA`; dashboard online identica al commit. Stesse prove browser sull'HTML pubblicato con backend simulato passate, regressioni Vetrina e area pagamenti su sei formati/browser passate. Backup remoto `backup/session-20261017-165933-statistiche-periodi-contatti` verificato; modifiche concorrenti Forlì-Cesena conservate.

Correzione storica del 6 ottobre:

- Il pannello `Performance posteggi` chiamava `dashboard_seller_analytics`, ma `PATCH_LISTING_ANALYTICS_20260620.sql` non era mai stata applicata in produzione. RPC e `listing_stats_daily` mancavano: ogni account vedeva "Statistiche in attivazione".
- Patch applicata al DB il 6 ottobre 2026, in transazione. Il deploy Vercel non esegue SQL: le nuove patch database vanno applicate e verificate separatamente.
- RPC privata per `authenticated`, filtrata su `auth.uid()`, senza limite di 50 annunci. Totali precedenti conservati; dati giornalieri disponibili solo dall'attivazione. Gli incrementi casuali del vecchio cron Vetrina non alimentano il grafico.
- Controlli: `scripts/verify-seller-analytics.sql` prova tutti i profili con ruolo autenticato, periodi 7/30/90, isolamento, viste/contatti/preferiti e annulla gli eventi di prova con `ROLLBACK`. `node scripts/verify-seller-analytics.js` verifica il pannello e la sintassi degli script inline.
- Se il caricamento fallisce, il pannello offre `Riprova` e nasconde il grafico vuoto. Risposte di richieste precedenti non sovrascrivono il periodo scelto.

- Colonna `visualizzazioni integer DEFAULT 0` in `annunci`. Client attuali: `track_listing_view(listing_id, view_type)` per anteprima/dettaglio; `increment_views` è interna/service_role, accetta solo +1, esclude proprietario/demo/scaduti/non attivi.
- Anteprima card: +1 via `observeCardViews()` in `data.js` — scroll listener con `getBoundingClientRect`. Chiamarla dopo ogni render `buildCard()`.
- **`_supabase.rpc().catch()` NON ESISTE** in Supabase JS v2 — usare `async/await`.
- Visita diretta attuale: +1 con `view_type='detail'`. Il vecchio random 1–2 e il cron Vetrina casuale sono storici; non ripristinarli.
- **`visualizzazioni` NON va nella select principale di `annuncio-detail.js`** — fetcharlo in IIFE asincrona isolata.
- Display: `#viewCount` + `#viewCountVal` nel title block.

## 💬 Chat / Conversazioni (`messaggi.html`)

Contratto corrente: `data/CHAT_RELIABILITY.md`. Controller esterno
`js/pages/messaggi.js`, stili `css/messaggi.css`; il vecchio script inline è superato.
Due pannelli distinti (`convPanel`/`chatPanel`), uno alla volta sul telefono.
Inbox via RPC riservata `get_chat_inbox`: ultimo/non letti per ciascuna chat,
senza join PostgREST su profiles o recupero globale di tutti i messaggi.
Stato isolato per utente/conversazione, destinatario e token fissati all'operazione,
merge per ID, coda e retry con lo stesso UUID per evitare duplicati.
Ultimi50/storico paginato, recupero completo dei messaggi persi, realtime anche
sulle chat non aperte e polling di sicurezza. Letture solo con chat visibile/focus;
logout/cambio account cancellano tutto, login nella pagina riprende il flusso.
Supporto sempre in fondo anche a inbox vuota, riga creata solo al primo invio;
URL `/messaggi?conv=`, `?annuncio=` e `?support=1` conservati. Nessun nuovo cron,
trigger email o testo messaggi in storage. Test browser100scenari e SQL ROLLBACK.

## 🚩 Segnalazioni Conversazioni (DSA compliance)

- Schema (`PATCH_REPORTS_20260504.sql`): tabella `conversation_reports(id, conversazione_id, reporter_id, reason CHECK scam/harassment/spam/other, details, status open/reviewed/dismissed, reviewed_at, reviewed_by, admin_notes)`. RLS: INSERT solo partecipanti conv. SELECT/UPDATE solo `is_admin`. Unique partial idx `(reporter_id, conversazione_id) WHERE status='open'` = anti-flood (1 sola open per coppia).
- 2 RPC SECURITY DEFINER: `admin_list_reports(p_status)` joina reporter+annuncio+is_support. `admin_update_report_status(report_id, status, notes)` valida is_admin + 3 status ammessi.
- Frontend `messaggi.html`: kebab `⋮` nell'header chat (fuori da `chatHeaderLink` per evitare bubble click), nascosto su draft/supporto/no-conv. Modal con 4 radio motivo + textarea details (max 500). Submit: INSERT + fetch fire-and-forget Edge `notify-report` con JWT user. 23505 → "Hai già una segnalazione aperta su questa chat".
- Edge function `notify-report` (`--no-verify-jwt`): valida `auth.getUser(jwt)` + `report.reporter_id === user.id`. Email a tutti gli admin con motivo + dettagli + ultimi 3 messaggi + link a `dashboard.html#reports` e `/messaggi?conv=`.
- Pannello dashboard.html dentro `adminPanel`: anchor `#reports`, tab Aperte/Gestite/Archiviate, badge rosso conteggio open. Bottoni Apri chat / Marca gestita / Archivia / Riapri.
- **Auto-hide pannello** (5 mag 2026): `#reportsPanel` parte con class `hidden`. `loadAdminReports()` lo rivela solo se Aperte > 0. Le storiche in Gestite/Archiviate non lo riportano visibile (sarebbe rumore inutile). 1 RPC in più per il count delle aperte, costo zero.
