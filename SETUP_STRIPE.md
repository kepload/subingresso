# 🏦 Setup Vetrina Stripe — Subingresso.it

Tutti i passaggi per attivare la vendita della **Vetrina in Evidenza** (€19/30gg, €39/90gg).

---

## 📋 Prerequisiti

- Account Stripe attivo (https://dashboard.stripe.com). Registrazione gratuita. Per **incassare in Italia** serve:
  - Partita IVA / C.F. attiva
  - IBAN italiano (conto intestato a te/tua società)
- Account Supabase con accesso Dashboard
- Dominio `subingresso.it` già attivo (serve per success URL e webhook)

## 💰 Commissioni Stripe (Italia, carte EU)

| Tier | Prezzo | Commissione Stripe | Netto per te |
|------|--------|--------------------|--------------|
| 30 gg | €19 | 1,5% + €0,25 = **€0,54** | **€18,46** |
| 90 gg | €39 | 1,5% + €0,25 = **€0,84** | **€38,16** |

*Carte non-EU: 2,5% + €0,25. Per incasso IVA corretto: tu sei il merchant, emetti fattura per ogni transazione (Stripe NON gestisce l'IVA al posto tuo).*

---

## 🗄️ STEP 1 — Database (SQL Editor Supabase)

1. Supabase Dashboard → SQL Editor → New query
2. Incolla e lancia il file `SETUP_VETRINA.sql` (tutto, in una volta)
3. Verifica output: deve dire `SETUP VETRINA COMPLETATO`
4. Verifica che pg_cron abbia il job: `SELECT * FROM cron.job;` deve mostrare `unfeature-expired-daily`

**Attenzione Windows SQL Editor web:** se l'Editor di Supabase mangia gli asterischi del cron (bug noto), riscrivi `'0 3 * * *'` a mano.

---

## 🔑 STEP 2 — Chiavi Stripe

### Ottieni le chiavi
1. https://dashboard.stripe.com/apikeys
2. Copia:
   - **Publishable key** → `pk_live_...` (o `pk_test_...` per test)
   - **Secret key** → `sk_live_...` (o `sk_test_...` per test)

### Imposta i secrets su Supabase
1. Dashboard Supabase → **Edge Functions → Manage secrets**
2. Aggiungi:
   ```
   STRIPE_SECRET_KEY = sk_live_XXXXXXXXXXXXX
   ```
   (In modalità test usa `sk_test_...`)

---

## 🚀 STEP 3 — Deploy Edge Functions

Due function da deployare:
- `create-checkout-session` (JWT verify: **ON**)
- `stripe-webhook` (JWT verify: **OFF** — critico, Stripe non manda JWT)

### Opzione A — CLI Supabase (se funziona sul tuo Windows)
```bash
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook --no-verify-jwt
```

### Opzione B — Dashboard (se CLI fallisce)
1. Supabase Dashboard → Edge Functions → Create a new function
2. Nome: `create-checkout-session`
3. Copia-incolla il contenuto di `supabase/functions/create-checkout-session/index.ts`
4. Deploy
5. Nello stesso pannello, **Details → Verify JWT = ON**
6. Ripeti per `stripe-webhook`:
   - **Details → Verify JWT = OFF** (importantissimo)

---

## 🪝 STEP 4 — Webhook Stripe

Stripe deve sapere dove inviare gli eventi di pagamento.

1. https://dashboard.stripe.com/webhooks → **+ Add endpoint**
2. URL endpoint:
   ```
   https://<PROJECT_REF>.supabase.co/functions/v1/stripe-webhook
   ```
   (sostituisci `<PROJECT_REF>` con il tuo — lo trovi in Supabase Dashboard → Project Settings → Reference ID. Es: `mhfbtltgwibwmsudsuvf`)
3. Eventi da ascoltare:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `checkout.session.async_payment_failed`
4. Crea → copia il **Signing secret** (`whsec_...`)
5. Supabase Dashboard → Edge Functions → Manage secrets → aggiungi:
   ```
   STRIPE_WEBHOOK_SECRET = whsec_XXXXXXXXXXXXX
   ```

---

## ⚙️ STEP 5 — Publishable key nel frontend

La publishable key è pubblica per design. Non serve configurarla direttamente nel codice perché il Checkout Stripe è **hosted** (l'utente viene reindirizzato su checkout.stripe.com, non serve carta tokenization lato client).

Se in futuro vorrai integrare Stripe Elements (pagamenti embedded), aggiungi `window.STRIPE_PUBLISHABLE_KEY = 'pk_live_...'` in un file JS dedicato.

---

## ✅ STEP 6 — Test End-to-End

### Modalità Test (consigliata prima del live)
1. Usa le chiavi `sk_test_` e `pk_test_`
2. Carta di test Stripe:
   - Numero: `4242 4242 4242 4242`
   - Data: qualsiasi futura (es. `12/30`)
   - CVC: qualsiasi (es. `123`)
3. Flusso:
   - Vai su `dashboard.html`, clicca "Metti in vetrina" su un tuo annuncio `active`
   - Scegli tier → redirect Stripe Checkout
   - Paga con la carta test
   - Redirect su `grazie.html`
   - Entro ~5 secondi dovrebbe mostrare "Il tuo annuncio è in vetrina!"
4. Controlla su Supabase:
   ```sql
   SELECT * FROM payments ORDER BY created_at DESC LIMIT 5;
   SELECT id, titolo, featured, featured_until FROM annunci WHERE featured = true;
   ```

### Troubleshooting
| Sintomo | Causa probabile | Fix |
|---------|----------------|-----|
| `grazie.html` resta in "verifica" | Webhook non chiamato | Controlla logs in Supabase → Edge Functions → stripe-webhook → Logs |
| `Invalid signature` nei log webhook | `STRIPE_WEBHOOK_SECRET` errato | Rigenera su Stripe → riaggiorna secret Supabase |
| `annuncio_id mancante` nei log | Metadata non passati | Verifica che `create-checkout-session` includa metadata |
| Utente paga ma nessun `payment` in DB | `stripe-webhook` ha JWT verify ON | Disattivalo |
| Cron `unfeature-expired` non gira | pg_cron non abilitato | `CREATE EXTENSION IF NOT EXISTS pg_cron;` |

### Passaggio a Live
1. Su Stripe → Activate account (servono documenti + IBAN)
2. Sostituisci `STRIPE_SECRET_KEY` con `sk_live_...`
3. Crea nuovo webhook con URL identico ma mode = Live
4. Sostituisci `STRIPE_WEBHOOK_SECRET` con il nuovo `whsec_...` Live
5. Fatti un bonifico test da €0,01 (se possibile) — oppure paga tu una vetrina sul tuo annuncio e verifica arrivo fondi nel tuo IBAN dopo ~7gg (payout Stripe default).

---

## 🔐 Sicurezza

- ✅ Il trigger `enforce_annunci_status` blocca ogni tentativo di self-promozione client-side: solo il webhook (service_role) può mettere `featured = true`.
- ✅ La firma Stripe è verificata HMAC-SHA256 con tolleranza 5 min (anti-replay).
- ✅ L'edge function `create-checkout-session` verifica che chi paga sia proprietario dell'annuncio e che l'annuncio sia `active`.
- ✅ RLS su `payments`: ogni utente vede solo i propri.
- ✅ Prezzi server-side: il client non può passare un amount custom.

---

## 💸 Fiscalità (IMPORTANTE)

Stripe non è Merchant of Record per l'Italia — **tu sei il venditore**. Ogni pagamento incassato è ricavo soggetto a:
- Fattura elettronica (SDI) al cliente
- IVA 22% da versare
- Reddito da dichiarare

Se non hai P.IVA o non vuoi gestire la fatturazione:
- **Alternativa**: usare **Lemon Squeezy** (Merchant of Record, 5% + €0,50). Loro fatturano il cliente, tu fatturi solo a loro come "commissione" (fiscalmente più semplice).
- Per switchare: stesso approccio architetturale (edge function + webhook), cambia solo le API.

---

## 📊 Monitoring

Dashboard Stripe: https://dashboard.stripe.com/payments

Query utili in Supabase:

```sql
-- Ricavi ultimi 30 giorni
SELECT
    SUM(amount_cents) / 100.0 AS eur_incassati,
    COUNT(*)                   AS transazioni
FROM payments
WHERE status = 'succeeded'
  AND created_at > now() - interval '30 days';

-- Vetrine attive ora
SELECT titolo, featured_tier, featured_until
FROM annunci
WHERE featured = true
ORDER BY featured_until DESC;

-- Conversion pending → succeeded
SELECT
    status,
    COUNT(*),
    ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) AS pct
FROM payments
GROUP BY status;
```
