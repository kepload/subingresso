# Subingresso.it — Guida Setup Completo

Segui questi passi nell'ordine. Ci vogliono circa 30 minuti.

---

## PASSO 1 — Crea il database su Supabase (GRATIS)

1. Vai su **https://supabase.com** e clicca **"Start your project"**
2. Registrati con Google o email
3. Clicca **"New Project"**
   - Organization: il tuo nome
   - Project name: `Subingresso.it`
   - Database password: scegli una password e **salvala** (non ti servirà spesso)
   - Region: **West EU (Ireland)** — il più vicino all'Italia
4. Attendi ~2 minuti che il progetto si avvii

---

## PASSO 2 — Esegui il setup del database

1. Nel tuo progetto Supabase, vai su **SQL Editor** (icona </> nella barra sinistra)
2. Clicca **"New Query"**
3. Apri il file `setup-database.sql` (è nella cartella del sito) con Blocco Note
4. Seleziona tutto il testo (Ctrl+A) e copialo
5. Incollalo nell'SQL Editor di Supabase
6. Clicca **"Run"** (pulsante verde in basso a destra)
7. Dovresti vedere: `Success. No rows returned`

---

## PASSO 3 — Copia le tue chiavi API

1. Vai su **Settings** (ingranaggio in basso a sinistra) → **API**
2. Copia:
   - **Project URL** (es. `https://abcdefghij.supabase.co`)
   - **anon public** key (stringa lunga che inizia con `eyJ...`)

3. Apri il file `js/supabase-config.js` con Blocco Note
4. Sostituisci:
   - `https://XXXXXXXXXXXXXXXX.supabase.co` → il tuo **Project URL**
   - `eyXXXXXXXXXXXXXXXXXXXXXXXXX` → la tua **anon public key**
5. Salva il file

---

## PASSO 4 — Disabilita la conferma email (facoltativo ma consigliato all'inizio)

Questo permette agli utenti di registrarsi senza dover confermare l'email.

1. Vai su **Authentication** → **Settings** → **Email Auth**
2. Disattiva **"Enable email confirmations"**
3. Salva

*(Puoi riattivarlo in seguito quando il sito è pronto per il pubblico)*

---

## PASSO 5 — Carica il sito online (GRATIS)

### Opzione A — Netlify (più semplice)
1. Vai su **https://netlify.com** e registrati
2. Clicca **"Add new site"** → **"Deploy manually"**
3. Trascina l'intera cartella `Subingresso.it_Prototype` nel browser
4. Il sito sarà online in 30 secondi con un URL tipo `https://xyz.netlify.app`

### Opzione B — Vercel
1. Vai su **https://vercel.com** e registrati
2. Clicca **"Add New Project"** → **"Upload"**
3. Carica la cartella del sito

---

## PASSO 6 — Compra un dominio (opzionale)

1. Vai su **https://namecheap.com** o **https://aruba.it**
2. Cerca `Subingresso.it.it` — costa circa €10-15/anno
3. Dopo l'acquisto, collega il dominio a Netlify/Vercel seguendo la loro guida

---

## Come gestire il sito nel quotidiano

### Gli utenti si registrano da soli
La registrazione è automatica. Gli utenti ricevono un'email di conferma (se non hai disabilitato il passo 4) e poi possono accedere.

### Monitorare utenti e annunci
1. Vai su **https://app.supabase.com** → il tuo progetto
2. Clicca **"Table Editor"** per vedere tutti gli annunci, utenti e messaggi
3. Puoi eliminare annunci inappropriati direttamente da qui

### Modificare un annuncio manualmente
1. In Supabase → Table Editor → `annunci`
2. Clicca sulla riga → modifica il campo → conferma

### Aggiungere articoli al blog
1. Apri `blog.html` con un editor di testo (Blocco Note va bene)
2. Cerca `<!-- FINE ARTICOLI -->` (o un articolo esistente)
3. Copia il blocco HTML di un articolo e modificalo con i nuovi contenuti
4. Salva e ri-carica su Netlify/Vercel

---

## Risoluzione problemi comuni

**"Error: Invalid API key"**
→ Hai sbagliato a copiare la chiave in `supabase-config.js`. Riprova dal passo 3.

**Gli utenti non riescono ad accedere dopo la registrazione**
→ Abilita il passo 4 (disabilita conferma email) oppure digli di controllare lo spam.

**Il form annunci non invia**
→ Controlla che `supabase-config.js` sia salvato correttamente con le tue chiavi.

**Il sito mostra annunci demo invece di quelli reali**
→ Normale finché non ci sono annunci nel database. Quando arriva il primo annuncio vero, sostituisce automaticamente i dati demo.

---

## Riepilogo file importanti

| File | Cosa fa |
|------|---------|
| `js/supabase-config.js` | **Le tue chiavi** — da compilare subito |
| `setup-database.sql` | SQL da eseguire una sola volta su Supabase |
| `js/auth.js` | Sistema di login/registrazione |
| `dashboard.html` | Pannello utenti (I miei annunci, conversazioni) |
| `messaggi.html` | Chat in tempo reale tra utenti |
| `blog.html` | Articoli del blog — aggiungine quanti vuoi |
