# 📧 Setup Email Settimanali (Digest + Stats)

Guida rapida per attivare le 2 nuove email ricorrenti. Richiede 4 step.

---

## ✅ Step 1 — Esegui il SQL aggiornato

Supabase → **SQL Editor** → nuova query → copia e incolla tutto `SETUP_DEF_SUBINGRESSO.sql` → **Run**.

Aggiunge:
- Colonne `profiles.email_digest`, `profiles.email_stats`, `profiles.unsub_token`
- Tabella `weekly_stats_snapshot` (per delta settimanale)
- Tabella `weekly_digest_log` (anti-doppio-invio)

---

## ✅ Step 2 — Deploy delle 3 nuove Edge Functions

Stesso procedimento di sempre (dashboard Supabase → Edge Functions → copia-incolla dal file locale → Deploy):

| Nome function | File locale |
|---|---|
| **weekly-buyer-digest** | `supabase/functions/weekly-buyer-digest/index.ts` |
| **weekly-seller-stats** | `supabase/functions/weekly-seller-stats/index.ts` |
| **email-unsubscribe** | `supabase/functions/email-unsubscribe/index.ts` |

⚠️ **Importante**: per queste 3 function, quando le crei nuove, assicurati di **DISATTIVARE "Verify JWT"** (o "Enforce JWT verification") nelle impostazioni della function — altrimenti il cron e i click sui link unsubscribe non funzionano (nessun utente loggato).

Come si fa: nella pagina della function, clicca **Settings** (o icona ingranaggio) → togli la spunta da "Verify JWT".

---

## ✅ Step 3 — Crea il cron settimanale su Supabase

Supabase → **SQL Editor** → nuova query → incolla e Run:

```sql
-- Abilita le estensioni (una sola volta)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Sostituisci PROJECT_REF con il tuo (es. "mhfbtltgwibwmsudsuvf")
-- Sostituisci SERVICE_ROLE_KEY con la tua service_role key
-- La trovi: Supabase → Project Settings → API → service_role key (rivelatela)

select cron.schedule(
  'weekly-buyer-digest',
  '0 9 * * 1',  -- ogni lunedì ore 9:00 UTC (11:00 Italia estate, 10:00 inverno)
  $$
  select net.http_post(
    url := 'https://PROJECT_REF.supabase.co/functions/v1/weekly-buyer-digest',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);

select cron.schedule(
  'weekly-seller-stats',
  '0 9 * * 1',  -- ogni lunedì ore 9:00 UTC
  $$
  select net.http_post(
    url := 'https://PROJECT_REF.supabase.co/functions/v1/weekly-seller-stats',
    headers := '{"Authorization": "Bearer SERVICE_ROLE_KEY", "Content-Type": "application/json"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

**Dove trovo PROJECT_REF?** → Supabase → Project Settings → General → Reference ID.
**Dove trovo SERVICE_ROLE_KEY?** → Supabase → Project Settings → API → "service_role" (clicca "Reveal").

⚠️ La service_role key dà accesso completo: non condividerla, non metterla in file JS del frontend. Va SOLO nella query di cron.

---

## ✅ Step 4 — Test manuale (prima del primo lunedì)

Per vedere se tutto funziona senza aspettare lunedì:

1. Supabase → Edge Functions → **weekly-buyer-digest** → tab **Invocations** (o "Test")
2. Clicca **Run** (o "Invoke") con body vuoto `{}`
3. Controlla i Logs: dovresti vedere `OK — X digest inviati`
4. Stessa cosa con **weekly-seller-stats**

---

## 🔧 Gestione/Debug

**Vedere gli invii passati:**
```sql
select * from weekly_digest_log order by sent_at desc limit 20;
select * from weekly_stats_snapshot order by sent_at desc limit 20;
```

**Disattivare temporaneamente un cron:**
```sql
select cron.unschedule('weekly-buyer-digest');
-- poi per riattivare, ri-esegui lo schedule dello Step 3
```

**Vedere tutti i cron attivi:**
```sql
select * from cron.job;
```

**Far smettere di mandare email a un utente specifico:**
```sql
update profiles set email_digest = false, email_stats = false where id = 'USER_UUID';
```

---

## 📊 Come funzionano

### weekly-buyer-digest
- Parte ogni lunedì
- Cerca annunci `active` creati negli ultimi 7 giorni
- Per ogni utente con alert + `email_digest=true`: filtra gli annunci entro 200km dalla zona, prende top 5
- Skip l'utente se ha meno di 3 annunci rilevanti (evita email povere)
- Skip se ha già ricevuto digest questa settimana (`weekly_digest_log`)

### weekly-seller-stats
- Parte ogni lunedì
- Per ogni utente con annunci `active` + `email_stats=true`:
  - Somma visualizzazioni di tutti i suoi annunci
  - Confronta con ultimo snapshot salvato → calcola delta
  - Salva nuovo snapshot in `weekly_stats_snapshot`
  - Invia email solo se ha ricevuto views nella settimana (>0)

### email-unsubscribe
- Chiamato da `unsubscribe.html?t=TOKEN&type=digest|stats`
- Aggiorna `email_digest` o `email_stats` a `false` per l'utente col token corrispondente
- 1 click, no login richiesto
