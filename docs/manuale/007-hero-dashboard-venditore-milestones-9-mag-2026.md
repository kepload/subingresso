
## 🪄 Hero Dashboard Venditore + Milestones (9 mag 2026)

Ritenzione seller: appena entri in dashboard vedi una **hero card** del tuo annuncio top con stats live + chip "in zona", e una **stack di milestone banner** (achievement) per gli eventi non ancora visti. Pattern alla Subito/Immobiliare, fa percepire che l'annuncio "lavora per te".

**Schema (`PATCH_SELLER_DASHBOARD_20260509.sql`):**
- Tabella `listing_milestones(id, annuncio_id, user_id, kind CHECK 10 valori, triggered_at, seen_at)` UNIQUE(annuncio_id, kind) anti-duplicati. Index parziale `(user_id, triggered_at DESC) WHERE seen_at IS NULL` per query "non viste". RLS owner-SELECT, INSERT/UPDATE solo via SECURITY DEFINER.
- Trigger `trg_check_listing_milestones` AFTER UPDATE su `annunci` (WHEN visualizzazioni o saved_count cambiano): scatta `first_view`, `views_10/50/100/500`, `first_save`, `saves_5/10`. Pattern soglia `NEW >= N AND COALESCE(OLD,0) < N` evita false-positive su repeat update. EXCEPTION → RAISE WARNING (non blocca update annuncio).
- Trigger `trg_check_message_milestone` AFTER INSERT su `messaggi`: scatta `first_message` e `msgs_5` solo per messaggi DA acquirente verso venditore (mittente IS DISTINCT FROM venditore_id della conv). Count totale ricalcolato a ogni INSERT — accettabile per N basso.
- 4 RPC SECURITY DEFINER: `dashboard_seller_summary()` ritorna jsonb con array `listings[]` (ogni annuncio attivo dell'utente con views_total, saved_total, saved_7d, msg_total, msg_7d, msg_unread, regional_alerts, regional_active_buyers). `unseen_milestones()` top 10 non viste join titolo+comune. `mark_milestone_seen(id)` / `mark_all_milestones_seen()` upsert seen_at.
- **regional_active_buyers** = count distinct `conversazioni.acquirente_id` dove `annuncio.regione = al.regione AND created_at > now()-30d AND acquirente != al.user_id`. Privacy: aggregato, no IDs.
- **regional_alerts** = count `bando_alerts.regione = al.regione` (acquirenti passivi iscritti agli avvisi).
- Niente backfill: solo eventi post-deploy. Annunci con visualizzazioni già >=10 NON triggherano `views_10` retroattivamente — i trigger usano OLD vs NEW e OLD esiste solo dopo UPDATE.

**Frontend (`dashboard.html`):**
- Section `#milestonesBanner` + `#sellerHeroSection` iniettate sopra `#onboardingWidget`. Hero hidden by default → revealed se RPC ritorna almeno 1 listing.
- `loadSellerHero()` carica + render. State `_sellerHeroState = {listings, idx}` con carousel (frecce + dot indicators) se più annunci. Passare l'oggetto listing a `openVetrinaModal()` via wrapper `openVetrinaFromHero(idx)` perché l'API esistente richiede oggetto, non ID.
- 4 stat box (Views, Salvati, Messaggi, Da leggere) con delta `+N 7g` colorato. Da leggere usa `msg_unread` direct, evidenziato red se >0.
- `regionalChip` (gradient blue→violet) sotto stat: "In Calabria: 3 iscritti agli avvisi · 8 compratori attivi (30g)". Mostrato solo se almeno una metric > 0.
- `loadMilestones()` mostra max 3 banner verde gradient + bottone "+N altri · segna tutti come visti" se >3. `_MILESTONE_COPY` mappa kind → emoji + title + line. Singolo dismiss × o bulk dismiss.
- **NON usare** `formatPrice` direttamente, usare typeof check `typeof formatPrice === 'function'` come fallback (data.js carica async dopo dashboard.html sometimes).

**Effetto utente atteso**: dopo aver pubblicato, ogni volta che torna in dashboard vede subito (a) numeri vivi del proprio annuncio (b) banner verdi celebrativi se sono successe cose (c) "compratori attivi nella tua zona" che fa percepire domanda. Soddisfazione pubblicazione + nudge a tornare.

## 👤 Display Nome Utente — Anti-duplicato (6 mag 2026)

**Bug storico**: utenti che mettevano nome+cognome insieme nel campo "Nome" del form registrazione (es. nome="Gianfranco Dona", cognome="Dona") venivano displayati ovunque come "Gianfranco Dona Dona" perché tutti i 10 punti display facevano `[nome,cognome].filter(Boolean).join(' ').trim()` naive.

**Fix:**
1. **`formatFullName(nome, cognome)` globale in `data.js`** — dedup PER PAROLA case-insensitive. Match parola intera (NO substring) per evitare falsi positivi tipo "Maria Donatella" + "Dona". Drop-in 1:1 del pattern naive: per nomi puliti il comportamento è identico, dedup attiva solo se cognome è già una parola del nome.
2. **`auth.js handleRegister` sanitize input**: se l'ultima parola di `regNome` (case-insensitive) combacia con `regCognome`, la rimuove dal nome PRIMA di salvare. Previene il bug per i futuri utenti.
3. **10 display point migrati** a `formatFullName`: dashboard.html (5: nameEl, admin user list, filter search, USER_NAMES, conv chat), index.html (USER_NAMES home), messaggi.html (`_displayName`), profilo.html (header), annunci.js (USER_NAMES grid), annuncio-detail.js (sellerFullName).
4. **Edge functions NON toccate** (notify-message, notify-report, register-bypass): basso rischio user-facing, le email sono per admin. Sanitization client-side è sufficiente per il caso d'uso web. Server-side sanitize in register-bypass è un nice-to-have futuro (deploy con `--no-verify-jwt`).

**Riparazione utente esistente** (Gianfranco): `UPDATE public.profiles SET nome='Gianfranco' WHERE id=...; UPDATE auth.users SET raw_user_meta_data=jsonb_set(...,'{nome}','"Gianfranco"') WHERE id=...;` — applicato 6 mag 2026.

## 🚫 Visitor Popup — Quando NON mostrarlo (6 mag 2026)

`_scheduleVisitorPopup` (auth.js) controlla 3 condizioni prima di mostrare il popup "Vendi il tuo posteggio?" (copy aggiornata 23 mag 2026: niente più lotteria, CTA "Registrati gratis", icona 🏪):

1. **Mai in `/vendi`** — early return in schedule + double-check in fire (helper `_isOnVendiPage()`). L'utente che sta pubblicando un annuncio NON viene distratto.
2. **Mai mentre il modal auth è aperto** — se `_isAuthModalOpen()` al momento del fire, ri-schedula in 3s. Loop di check finché modal chiuso.
3. **Auto-suppress se utente si logga durante l'attesa**: `onAuthStateChange` (auth.js:908) chiama `_suppressVisitorPopup` → setta `_vp=1` → loop esce.

Il popup quindi: (a) si vede in homepage/annunci/blog dopo 8s se anonimo, (b) NON si vede se nel frattempo è stato aperto il modal auth → l'utente chiude senza loggarsi → popup compare alla prossima opportunità (3s loop), (c) NON si vede mai in `/vendi`.

## 🪤 Sunk-Cost Auth nel funnel vendi (6 mag 2026)

L'utente non loggato compila tutti i 5 step SENZA vedere mai il banner "devi registrarti", e SCOPRE il modal solo al click "Pubblica annuncio gratis". Massimizza il sunk cost: chi ha già scritto titolo+descrizione+foto è incentivato a finire.

- `authBanner` (banner blu in cima a vendi.html) **non viene più mostrato all'apertura** — solo lasciato nel DOM hidden per backwards compat. Sostituito da `#signupNote` discreto SOTTO il bottone "Pubblica" che appare se utente !logged: *"Per i nuovi utenti è incluso un account gratis — bastano 30 secondi, nessuna email da confermare."*
- Quando il click "Pubblica" trova `!user`, `submitAnnuncio()` registra `window.__onLoginSuccess` callback + chiama `openAuthModal('register', contextMsg)` con messaggio: *"Manca solo l'ultimo passo: crea l'account gratis. Il tuo annuncio sarà pubblicato subito dopo."*
- Il flusso auto-resume esisteva già: `_afterRegisterSuccess` (auth.js:615) e `handleLogin` (auth.js:516) chiamano `__onLoginSuccess` → callback richiama `submitAnnuncio()` → utente loggato → submit reale parte. Niente reload, `_files` foto sopravvivono in memoria.
- **Caso draft anonimo**: se l'utente abbandona e torna dopo, draft (senza nome/tel — scope per user_id) si ripristina. Click Pubblica → modal → registra fornendo nome/tel → `prefillContactFromSession()` popola `fNome`/`fTel` → submit OK.
- `openAuthModal(tab, contextMsg)` in auth.js: secondo argomento opzionale → mostra `#authContextBanner` in cima al modal (info-circle blu). Se omesso, banner nascosto. Cleanup in `closeAuthModal`. Riusabile da altre pagine che vogliono spiegare il "perché" del modal.

## 📷 Limite Foto per Annuncio (6 mag 2026)

- **Free / non-vetrina = max 1 foto.** **Vetrina attiva = max 5 foto** (e si attiva la Rotazione Dinamica già esistente in `data.js:377`, che cambia la cover ogni render se `featured && allImgs.length > 1`).
- `vendi.html`: hard-coded 1 foto, `<input>` senza `multiple`. Messaggio errore se >1: "Puoi caricare 1 sola foto." (no menzione vetrina, niente CTA upsell). Sotto il dropzone: `Un annuncio con foto vende fino a 3 volte di più.` con icona bolt amber.
- `modifica-annuncio.html`: `_maxPhotos` dinamico settato dopo fetch annuncio. Se `isListingFeatured(l)` → 5 + hint con corona "Vetrina attiva: puoi caricare fino a 5 foto, mostrate a rotazione." Altrimenti 1 + stesso copy di vendi. `<input>` resta `multiple` (gestione lato JS).
- **Rimossa CTA upsell vetrina** dal box foto in entrambe le pagine ("Sblocca 5 foto e Rotazione Dinamica con la Vetrina Premium" + il blob blu): l'utente vuole flusso pulito, l'upsell vive solo nel modal vetrina di dashboard.html.
- Edge case: utente con annuncio già in vetrina con 5 foto → vetrina scade → torna in modifica-annuncio: `_maxPhotos=1` ma le 5 foto già caricate restano (display lato annuncio.html prende solo `img_urls[0]` se non featured). Non vengono cancellate, solo non aggiungibili oltre il limite del momento.
