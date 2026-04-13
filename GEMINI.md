# 🗺️ Mappa Strategica Subingresso.it (Guida per Gemini)

Questo file serve a ottimizzare l'uso del contesto e a garantire che ogni modifica sia sicura, veloce e priva di bug.

## 📂 Architettura del Progetto

Per risparmiare contesto, **NON leggere mai l'intero HTML** se devi modificare solo la logica. Cerca i file `.js` corrispondenti.

### ⚙️ Core Logic (Cartella `/js`)
- `supabase-config.js`: Configurazione client Supabase. **Critico per connessione DB.**
- `data.js`: **Il "Cervello" dei dati.** Contiene:
    - Costanti globali: `MERCI`, `REGIONI`, `COMUNI_IT`.
    - Utility: `formatPrice()`, `formatDate()`, `getDistanceKM()`.
    - Sicurezza: `escapeHTML()` (usa SEMPRE questa per iniettare testo nell'HTML).
    - UI Globale: `buildCard()` (genera le card degli annunci in tutto il sito).
- `ui-components.js`: Gestisce Header e Footer dinamici. Se devi cambiare il menu, modifica questo file.
- `auth.js`: Gestione sessione, login, registrazione e sync profili.
- `moderation.js`: Logica di filtraggio contenuti e IA review (lato client).

### 📄 Pagine HTML (Struttura Leggera)
- `index.html`: Home page + Borsino prezzi + FAQ.
- `annunci.html`: Pagina di ricerca con filtri e mappa.
- `annuncio.html`: Dettaglio singolo annuncio (WhatsApp integration).
- `vendi.html`: Form di inserimento (usa `MERCI` da `data.js`).
- `dashboard.html`: Gestione annunci dell'utente loggato.

---

## 🛡️ Protocolli di Sicurezza (Anti-Bug)

### 1. Prevenzione XSS (Mandatorio)
- **MAI** usare `.innerHTML = data.titolo` direttamente.
- **SEMPRE** usare `escapeHTML(data.titolo)` prima di iniettare dati forniti dall'utente.
- Preferisci `.textContent` per elementi semplici.

### 2. Privacy & Supabase (RLS)
- I dati degli utenti (telefoni, nomi) nella tabella `profiles` devono essere protetti.
- Quando modifichi query, verifica sempre che la Row Level Security (RLS) su Supabase sia attiva.

### 3. Gestione Errori
- Se una pagina non carica i dropdown (es. Merci o Regioni), il colpevole è quasi sempre in `js/data.js`.
- Se il login fallisce o la navbar non si aggiorna, controlla `js/auth.js`.

---

## 🚀 Istruzioni per Gemini (Efficienza Contesto)

1. **Prima di agire:** Leggi solo gli script collegati alla funzionalità richiesta.
2. **Componenti UI:** Se l'utente chiede di cambiare un link nel menu, NON toccare gli HTML, vai su `js/ui-components.js`.
3. **Dati:** Se manca una categoria merceologica, aggiungila in `js/data.js` alla costante `MERCI`.
4. **Validazione:** Ogni nuovo campo nel form di `vendi.html` deve essere aggiunto anche alla funzione `submitAnnuncio()` e verificato lato Supabase.

---

## 🛰️ Protocollo di Pubblicazione (GitHub/Vercel)

### 🚨 Regola d'Oro (Mandatoria)
- **Dopo OGNI modifica** ai file, DEVI eseguire il push su GitHub.
- Comandi: `git add .` -> `git commit -m "Descrizione modifica"` -> `git push`.
- Questo garantisce che le modifiche siano subito visibili su Vercel.

---

## 🐛 Bug Storici Risolti (Da non ripetere)
- `ReferenceError: MERCI is not defined`: Risolto centralizzando la costante in `data.js`.
- `XSS in buildCard`: Risolto usando `escapeHTML` per ID, Titoli e Immagini.
- `Redundant Profiles`: Il profilo viene creato via Trigger SQL, `auth.js` fa solo il sync se necessario.
- `Database Setup Errors`: Usa SEMPRE il file sul desktop `SETUP_DEF_SUBINGRESSO.sql` per riconfigurare Supabase (contiene RLS fixati e relazioni corrette).
- `Gemini API "Model not found"`: Alcune chiavi non supportano "1.5-flash". I generatori JS ora fetchano dinamicamente i modelli supportati o usano `gemini-pro` come fallback.
