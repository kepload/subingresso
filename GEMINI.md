# 🗺️ Mappa Strategica Subingresso.it (Guida per Gemini)

Questo file è il "Manuale Operativo" per Gemini. Serve a garantire modifiche sicure, veloci e a basso consumo di contesto.

## 🧠 Strategia di Gestione Contesto (Efficienza)

1. **Approccio Chirurgico:** NON leggere mai interi file HTML o JS se non necessario. Usa `grep_search` per trovare le righe interessate.
2. **Uso dei Sub-Agenti (Mandatorio per Task Complessi):**
   - **`codebase_investigator`**: Per analisi architetturali o ricerche su più file.
   - **`generalist`**: Per modifiche ripetitive o batch (es. aggiornare 3+ file contemporaneamente).
   - *Obiettivo:* Riassumere il lavoro pesante in un unico messaggio nella chat principale.
3. **Memoria di Progetto:** Usa `save_memory(scope='project')` per salvare fatti strutturali (schema DB, colori, API key simulate) che devono persistere tra le sessioni.
4. **Monitoraggio Contesto (Mandatorio):** 
   - Alla fine di ogni messaggio, fornisci una stima del consumo del contesto.
   - Dopo una funzione pesante o dopo circa 10-15 messaggi, suggerisci esplicitamente all'utente di aprire una nuova chat per mantenere le performance elevate.

## 📂 Architettura & Core Logic (Cartella `/js`)

- `supabase-config.js`: Connessione DB.
- `data.js`: **Il Cervello.** Contiene `MERCI`, `REGIONI`, `COMUNI_IT`, `formatPrice()`, `buildCard()`.
- `ui-components.js`: Header/Footer dinamici. Modifica qui per cambiare menu o navigazione.
- `auth.js`: Sessioni e sync profili.
- `moderation.js`: Filtraggio contenuti IA (client-side).

## 🛡️ Protocolli di Sicurezza & Qualità

- **XSS Prevention:** Usa SEMPRE `escapeHTML()` da `data.js` prima di iniettare testo fornito dall'utente. Mai `.innerHTML` diretto su dati variabili.
- **Supabase RLS:** Verifica sempre la Row Level Security dopo modifiche alle query.
- **Validazione:** Ogni campo in `vendi.html` deve essere sincronizzato con la funzione `submitAnnuncio()` e lo schema DB.

## 🚀 Workflow di Pubblicazione (GitHub/Vercel)

### 🚨 REGOLA D'ORO (Mandatoria)
Dopo **OGNI** modifica ai file, esegui il push per attivare la build su Vercel:
1. `git add .`
2. `git commit -m "Descrizione precisa della modifica"`
3. `git push`

## 🐛 Bug Storici & Soluzioni
- `ReferenceError`: Centralizzato tutto in `data.js`.
- `Gemini API "Quota exceeded"`: Implementato Retry Loop con modelli alternativi.
- `AI Generatore`: Usa chiamate multi-step, no elenchi puntati, solo paragrafi lunghi e CTA.
- `Database Setup`: Usa `SETUP_DEF_SUBINGRESSO.sql` per ripristinare i permessi corretti (specialmente per Admin/Blog).
