
## 📐 Saved Listings (Preferiti)

- Tabella `saved_listings (user_id, annuncio_id, created_at)` RLS owner-only.
- Cuoricino in `data.js buildCard()` + `annuncio.html`.
- Click anonimo → modal registrazione + `_pending_save_listing` in sessionStorage. Post-signup `processPendingSaveListing()`.
- `SAVED_IDS` Set globale in `data.js`. `loadSavedListingsCache()` in auth.js dopo login.
- Nascosto sui propri annunci.

## 🧭 Header Nav

- Layout: `flex justify-between` <lg, `grid grid-cols-3` da lg.
- Ordine: **Calcolatore | Annunci | Blog**.
- Bottoni: ordine +, messaggi, profilo anche nel DOM; mobile tre quadrati40px (36 sotto380), angoli12px e icone14px. + con gli stessi colori di messaggi/profilo anche nel tema organizzatore; icona `fa-user`.
- `dashboard.html` ha header hardcoded ma **markup allineato 1:1 a `UI.header`** di `ui-components.js` (logo responsive 36→44px, bottone "+" sempre visibile come icona su mobile). Se modifichi `ui-components.js` aggiornare a mano anche dashboard.html.

## 📅 Scadenza Post

Durata 270 giorni: `PATCH_LISTING_LIFETIME_270_20261008.sql`, creazione/riattivazione/test/email allineati. Storico active/pending prorogato una volta (+70 giorni, almeno created_at +270); backup privato `data_quality.listing_expiry_270_backup`. Conteggio admin attivi esclude scaduti.

- `expires_at` 270 giorni di default (8 ottobre 2026, ex 200). SQL: `ALTER TABLE annunci ADD COLUMN IF NOT EXISTS expires_at timestamptz;`
- **Vetrina NON estende `expires_at`** (rimosso 6 mag 2026): tutti i post valgono 270gg, vetrina = solo featured. Niente più cap differenziati 230/300/400. `adminGrantVetrina(days)` + `stripe-webhook` toccano solo i campi `featured*`.
- **NON filtrare su `expires_at`** finché non popolato per tutti — gli scaduti restano visibili ma con badge "Scaduto", contatti bloccati via `_blockIfExpired()` (chat/whatsapp/chiama mostrano toast). RPC `renew_listing(p_id uuid)` SECURITY DEFINER, owner-only, bumpa `expires_at = now()+270gg`. Bottone "Riattiva" in dashboard.html appare per annunci `active` con `expires_at < now()`.

## 🔍 AI Scout Bandi (27 mag 2026, v4 multi-step)

Sistema semi-automatico per scoprire bandi pubblici reali e inviarli agli iscritti `bando_alerts`. **Hybrid 95% auto + 5% umano**: l'AI cerca con pipeline a 4 step, l'admin clicca "invia" o "scarta" (via mail o pannello).

**Filosofia**: Gemini Flash gratuita è meno brava su task ambigui ma ottima su mini-task focalizzati. Splittiamo il problema "trova bandi" in 4 sotto-task piccoli e ben definiti. Ogni step ha un singolo job. Risultato: qualità ×3 senza cambiare modello.

**Pipeline per regione (3 chiamate Gemini + validazione HTTP):**
1. **STEP 1 Discovery [Gemini+Search]** → max 15 URL candidati su domini whitelist. Prompt mini-task focalizzato.
2. **STEP 2 HTTP validation [Code, parallel]** → fetch GET (Range 0-16383), keyword check sul body, dominio whitelist enforce. Estrae snippet titolo+h1+body. Drop link morti / off-topic. Max 8 sopravvissuti.
3. **STEP 3 Structured Extraction [Gemini batch]** → da snippet → JSON `{url, titolo, comune, scadenza, n_posteggi, settore, riassunto}`. Mini-task: "estrai dati strutturati".
4. **STEP 4 Verification [Gemini batch]** → boolean keep/drop per ognuno con motivo. Mini-task: "è un bando reale e attivo? sì/no". Fallback conservativo (keep-all) se Gemini non risponde.
5. **Insert DB** con dedup hash `SHA256(regione|url)`.

**Throttling**: sleep 2500ms tra ogni call Gemini per stare entro 15 RPM free tier. Tempo totale giro: ~3-4 min per 4 regioni (largo entro limite edge function).

**Briefing throttled (`admin_briefing_state` singleton):** dopo ogni giro, `maybeSendBriefing()` controlla:
- Pending totali in DB (non solo nuovi del giro)
- `last_briefing_at` vs `BRIEFING_GAP_HOURS = 72` (= 3 giorni)
- Override `BRIEFING_URGENT_COUNT = 10` se accumulati troppi pending
- Manda email solo se gap elapsed o urgent. Aggiorna `last_briefing_at` solo su invio reale.
- Salva quota Resend (lui spende mail per iscritti veri, non per se stesso).

**Schema briefing state (`PATCH_ADMIN_BRIEFING_STATE_20260527.sql`):**
- Tabella `admin_briefing_state(id smallint PK CHECK id=1, last_briefing_at, last_briefing_items_count, updated_at)` con singola riga (singleton).
- RLS on, accesso solo via edge function service_role.

**Telemetry response edge function:**
```json
{
  "regioni_scanned": 4,
  "total_new_inserted": 2,
  "per_regione": {
    "Calabria": {"step1_discovered":3, "step2_validated":2, "step2_rejected":1, "step3_extracted":2, "step4_verified":2, "inserted":1, "duplicate":1}
  },
  "briefing": {"sent": true, "pending": 7, "reason": "gap_elapsed"}
}
```

### Diagnostica Scout Bandi

Il vecchio Scout v1 è sostituito dalla pipeline sopra. File principali:
`supabase/functions/scout-bandi/index.ts`, `bando-action/index.ts`,
`api/bandi/[slug].js`, pannello in `dashboard.html`.

Prima di intervenire, leggere stato cron `scout-bandi-daily`, ultimo
`discovered_at`, conteggi per `status`, `admin_briefing_state` e iscrizioni
effettive. Errori/quota Gemini: verificare risposta e disponibilità del modello
prima di cambiare `GEMINI_MODEL` o `GEMINI_SLEEP_MS`; quote e prezzi di maggio
non sono un riferimento corrente. Briefing: controllare pending e gap 72 ore;
landing 404: slug, stato approved/sent e permessi di `get_published_bando`.

Non forzare invii, pubblicare bandi, cambiare cron o cancellare log per una
semplice diagnosi. Non estrarre secret dalle definizioni SQL per stamparli.
Test manuali con effetti reali e pulizie richiedono ambito autorizzato.

## Backup e memoria comune

Regole e comandi in `AGENTS.md`. `CLAUDE.md` contiene solo `@AGENTS.md`,
compatibile anche con la versione Claude Code installata al 23 ottobre
(2.1.156). Non ricreare riepiloghi paralleli né letture integrali obbligatorie.

## ⚠️ Deploy & Troubleshooting Supabase

### CLI
- `./scripts/.bin/supabase.exe db query --linked --file <file.sql> --output json` per SQL diretto.
- Token in `.claude/settings.local.json` `env.SUPABASE_ACCESS_TOKEN`.
- Edge functions: `npx.cmd supabase functions deploy <name> --project-ref mhfbtltgwibwmsudsuvf --no-verify-jwt`.
- Management API alternativa: `POST https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query` con `Authorization: Bearer <token>`.

### Note
- **Asterischi cron mangiati dall'SQL Editor web**: copiando `'0 9 * * 1'` a volte rimuove asterischi → "invalid schedule". Riscriverli a mano o copiare da file `.sql` locale.
- **Webhook UI vs trigger pg_net**: webhook UI bloccano INSERT 15-20s e non includono `old_record`. Sempre trigger custom async via `pg_net`.
- **`pg_net.http_post`** body è `jsonb` non `::text`.
- **Supabase CLI npm globale fallisce su Windows** — usare standalone (`scripts/.bin/`) o Dashboard.

### File SQL chiave (in repo, non eliminare)
- `SETUP_DEF_SUBINGRESSO.sql` (master setup, sezione 12 con RLS PII).
- `SETUP_VETRINA.sql`, `SETUP_STRIPE.md`, `SETUP_VALUTATORE_LOGS.sql`, `SETUP_WELCOME_VETRINA.sql`, `SETUP_WEEKLY_EMAILS.md`, `SETUP_EMAIL_BYPASS.sql`.
- `PATCH_*` per modifiche idempotenti riapplicabili.
- `PATCH_CRON_AUTH_20260504.sql` è **template** (richiede `psql -v service_jwt=...`). NON committare mai con chiave hardcoded.
- `DIAGNOSE_PUBLISH_SLOW.sql` per ispezionare trigger/coda pg_net.

### Trigger annunci attivi
- `notify_alert_trigger` (async, alert acquirenti).
- `notify_seller_trigger` (async, "ricevuto/online/rifiutato").
- `trg_enforce_annunci_status` (BEFORE, forza pending non-admin, blocca featured non-admin).
- `trg_check_listing_milestones` (AFTER UPDATE, scatta milestone views/saved se OLD<N AND NEW>=N — vedi sezione "Hero Dashboard Venditore").
- `trg_check_message_milestone` (AFTER INSERT su `messaggi`, scatta `first_message`/`msgs_5` per messaggi acquirente→venditore).

### Cron pg_cron — elenco documentale da verificare live
- `unfeature-expired-daily` 03:00 — cleanup vetrine scadute.
- `increment-featured-views`: disattivato l'8 ottobre 2026; elenco storico, non riattivare.
- `weekly-buyer-digest` Lun 09:00 (TODO: spalmare).
- `weekly-seller-stats` Lun 09:00 (TODO: spalmare).
- `admin-anomaly-check` 09:00 daily.
- `engagement-reminders` 10:00 daily.

## Versioni degli asset

Leggere i riferimenti effettivi nei sorgenti con `rg`. Un elenco manuale
congelato diventa obsoleto: aggiornare tutti i consumatori dell'asset modificato,
inclusi HTML, template SSR e import dei worker, secondo `AGENTS.md`.
