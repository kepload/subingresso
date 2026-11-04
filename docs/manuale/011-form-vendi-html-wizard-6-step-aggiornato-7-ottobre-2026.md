
## 🧙 Form `vendi.html` — Wizard 6 Step (aggiornato 7 ottobre 2026)

- 6 step: vendita/affitto, posizione, dettagli, prezzo, foto/contenuto/contatti, riepilogo e pubblicazione gratis/Vetrina. `fTipo`, `fMerce`, `fGiorni` sono hidden aggiornati via JS. `stato` radio hidden via `selectStato()`.
- Step6 corrente27ottobre: gratis preselezionato; «Vendi più in fretta il tuo posteggio»,10/30giorni49/99€,90giorni224,10€ anziché249€ (−10% solo alla pubblicazione). CTA «Pubblica e promuovi», descrizioni dei piani eliminate, spiegazione grafica breve. Offerta esplicita e primo ordine su annuncio creato da non oltre10minuti, mai promosso; controlli server/RPC privata. Da pending tutti i giorni partono dall’approvazione. Dashboard a listino e pacchetti invariati; contratto `data/VETRINE_PREMIUM.md`.
- Step 1 auto-avanza al click. `js/pages/vendi-support.js` genera centinaia di varianti di titolo da dati reali (vendita/affitto, mercato/fiera, comune, nome fiera, giorni, settore, superficie), senza qualità inventate. Selezione casuale con memoria degli ultimi 20 suggerimenti nella sessione. Titolo stabile tornando indietro; aggiorna un titolo automatico quando cambiano i dettagli, preserva quello scritto dall'utente. Pulsante per cambiare suggerimento; conferma prima di sostituire un titolo manuale.
- Prezzo: 101-400.000€, **input via `style=""` inline**. `VendiSupport.parseNumber()` legge importi italiani e decimali senza troncamenti o perdita dei centesimi; rifiuta testo, esponenti e valori non finiti. Superficie decimale con esempio larghezza × profondità. Errori sul campo interessato e controllo di tutti i passi prima dell'INSERT.
- Foto: **facoltative**, fino a **5 per tutti, anche gratis**, anche in `modifica-annuncio.html`. Nel wizard un solo slot e invito rosso soltanto senza foto; dopo la prima, copertina grande e tre slot piccoli facoltativi. Nessun elenco formati/contatore sotto le foto, né avviso intermedio su Avanti. Selezione multipla, copertina modificabile e rimozione da telefono. JPEG/JFIF, PNG, WebP, AVIF, GIF, BMP, TIFF e HEIC/HEIF fino a 50 MiB; originali conservati, anteprime separate. Contratto `data/LISTING_PHOTOS.md`.
- Bozze: salvataggio dei dati a ogni input/cambio/azione, già dal primo passo; recupero automatico del passo e dei dati all'apertura. Foto/File in IndexedDB `subingresso_listing_drafts`, store `photos`, stessa chiave del proprietario; scritture serializzate. Salvataggio e recupero silenziosi, solo link Ricomincia al recupero; messaggio visibile in caso di errore, avviso all'uscita solo se il salvataggio è fallito/in corso. Migrazione della vecchia v1 solo al proprietario; passaggio ospite→account conserva il lavoro. Ricominciare richiede conferma; pubblicazione riuscita elimina solo la bozza corrente. Recupero nello stesso browser e dispositivo, non sincronizzato via server.
- Rimosso il blocco introduttivo SEO fisso sopra il wizard: ogni passo usa il proprio titolo H1; title e meta description conservati.
- Fiere: nome facoltativo e unico input libero per periodo/durata (es. ogni ottobre, 5 giorni). Descrizione assistita solo da fatti inseriti: usa `fNoteFiera`, mai i giorni del mercato. Non dichiara permessi regolari, buona posizione o clientela fissa. In INSERT `giorni` per fiere viene dal periodo/nome, senza giorni settimanali residui; dettagli extra fiera solo per il tipo Fiera.
- Step 6: riepilogo con pulsanti Modifica prima della scelta di pubblicazione. La pubblicazione gratuita resta preselezionata.
- **Preview card live nello step 5** (6 mag 2026): `#previewCard` sopra il bottone Pubblica, max-w 300px centrata, `pointer-events:none`. Funzione `_renderPreview()` costruisce un fakeListing (id `__preview__`, user_id `null` → cade su iniziale di `contatto`, status `active`, no featured/expires) e chiama `buildCard()` da data.js. Trigger: ingresso step 5 (subito + dopo `prefillContactFromSession`), `oninput` su `fTitolo`+`fNome`, dopo `_handleFiles` push, dopo `removeFile`. Foto via `URL.createObjectURL(_files[0])` salvato in `_previewObjectURL` globale e revocato prima di crearne uno nuovo (anti memory-leak). `getOptimizedImageUrl` cade nel try/catch su URL `blob:` e ritorna l'object URL invariato → preview funziona.
- Anti-spam: 1 minuto. Timestamp PRIMA dell'insert, rimosso su errore.
- **Telefono OBBLIGATORIO** (commit `3b5ac17`): `required` HTML5, asterisco rosso, banner `#missingPhoneBanner` se prefill non trova telefono nel profilo, bordo giallo, focus automatico, messaggio errore esplicito.
- **Cache name/tel scope per user_id** (vedi sezione SECURITY).
- **JWT auto-refresh**: `_isSessionExpired` + `_refreshSessionIfNeeded`. Se INSERT fallisce con JWT/auth/RLS, refresh + retry una volta.
- **Fallback sessione `_getSessionForSubmit`**: prova getSession, poi setSession da localStorage, poi sessione stored.
- **Login timeout 12s** in `auth.js` `handleLogin` (Promise.race).
- **Errore submit dettagliato**: `Errore [code]: <message Supabase reale>` (max 160 char).
- **Direct fetch INSERT** (`_directInsertAnnuncio`): bypass supabase-js che hangava 45s.
- **Upload foto via fetch diretto** Storage con timeout 120s, progress "1/N". Se una foto fallisce, niente INSERT parziale: annuncio ancora in bozza. Retry riutilizza le foto già caricate nella stessa pagina (WeakMap per File e proprietario).
- **Cache localStorage `_profile_nome_u_<id>`/`_profile_tel_u_<id>`** (scope) per prefill istantaneo.
- **Smart name**: evita duplicazione "Ardit Kycyku Kycyku" (cognome già in nome).
- **Bug noti vendi.html**:
  - Anti-spam NaN: `parseInt(localStorage.getItem(lastPostKey)) || 0` (string coercion bug).
  - Rimozione foto: `WeakMap` `_fileMap` mappa div→File. Anche la modifica annuncio usa ora WeakMap per evitare errori con l'ordine asincrono dei FileReader.
- **Verifica form**: `scripts/test-vendi.cjs` controlla sintassi e flussi browser con backend simulato, senza creare annunci reali. Richiede Playwright; `PLAYWRIGHT_MODULE` e `PLAYWRIGHT_CHROMIUM_EXECUTABLE` permettono di riusare un'installazione locale. Copre mercato/fiera, mobile, titoli, bozze/foto/contatti, isolamento account, migrazione v1, errori memoria/upload e retry, pubblicazione/reset e più foto in modifica.
- **Località, verifica anticipata (28 ottobre 2026)**: Avanti al passo 2 chiama la RPC anonima di sola lettura `validate_listing_location`, con la stessa regola privata del controllo finale. Risposte tardive ignorate dopo cambio di selezione/account/passo; errori rete e timeout restano sul campo e consentono retry. Bozze già al passo 6 verificate prima degli upload; un rifiuto geografico finale torna al passo 2. Anagrafica privata e dati storici invariati. Contratto e audit completo di tutte le 63.182 voci in `data/LOCALITA.md`; regressioni `test-listing-location-regions.cjs`, `audit-listing-locations.cjs` e casi dedicati in `test-vendi.cjs`.

## 💶 Prezzi Affitto — Annuali

- DB salva **prezzo annuale** per affitti.
- Display: solo annuale ovunque. Card `€ X /anno`. Pagina annuncio `€ X` + `/anno` inline + sottotitolo `/anno · trattabile`.
- Badge card: "Affitto" (non "Affitto mensile").
- `formatPrice()` in `data.js`: affitto → `€ X /anno`, vendita → `€ X`.
- **`#prezzoMobile`** in `annuncio.html`: elemento `lg:hidden` sotto il titolo, aggiornato da `annuncio-detail.js`.

## Esito degli annunci — 24 ottobre 2026

«Venduto o affittato?» richiede il mini modulo: esito, importo facoltativo,
canale. Nessuna delle due lascia l'annuncio disponibile. Prezzi e canali
restano privati, dichiarati e non certificati; canoni annui distinti dai
prezzi totali. Controlli client/server e filtro degli importi anomali,
proprietà verificata e chiusura atomica/idempotente tramite RPC obbligatoria.
Lo stato tecnico `sold` indica concluso; il nuovo esito distingue venduto e
affittato. Nessun esito ricostruito per lo storico. Contratto e soglie:
`data/LISTING_OUTCOMES.md`; migrazione `PATCH_LISTING_OUTCOMES_20261024.sql`.

## 🗑️ Eliminazione Annunci & Account

- **Annunci**: `status='deleted'` (soft delete). NON DELETE fisico.
- `annunci.js` filtra `.neq('status','deleted')`. `dashboard.html` `loadMyListings()` idem.
- Admin "Tutti gli annunci" con tasto Elimina (`deleteAnnuncio(id)`).
- **Account**: SQL `delete_my_account()` SECURITY DEFINER cascata: messaggi → conversazioni → notify_alert_log → annunci → profiles → auth.users. NON `user_id = NULL` su annunci (NOT NULL).
- Sezione "Zona pericolosa" nel modal profilo, richiede di scrivere `ELIMINA`.

## 🔑 Recupero Password

- Link "Password dimenticata?" nel form login → tab `forgot`.
- `handleForgotPassword()` chiama `resetPasswordForEmail` con `redirectTo: 'https://subingresso.it/reset-password.html'` HARDCODED — NON `window.location.origin`.
- `reset-password.html`: rileva token URL, ascolta `onAuthStateChange PASSWORD_RECOVERY`, timeout 6s → "Link non valido". No token → redirect home.
- Supabase Auth → URL Configuration: `Site URL = https://subingresso.it`, `Redirect URLs` include `https://subingresso.it/**`.
- **Email templates IT** in Authentication → Email Templates ("Confirm signup", "Reset password"). Tasto unico `{{ .ConfirmationURL }}`.
- **Rate limit Supabase**: 1 email/h per indirizzo. Test con alias Gmail `+test1`/`+test2`.
