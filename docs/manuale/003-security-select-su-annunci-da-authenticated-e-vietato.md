
## 🚫 SECURITY: `select('*')` su `annunci` da authenticated è VIETATO

Dal 3 mag 2026 (`PATCH_CONTACT_REVEAL_20260503.sql`) `tel`/`email` sono REVOKE per `authenticated`. `select('*')` restituisce 42501.

**Sempre usare select esplicito** con colonne safe (no `tel`, no `email`):
`id, user_id, titolo, descrizione, stato, categoria, tipo, settore, dettagli_extra, regione, provincia, comune, superficie, giorni, prezzo, contatto, data, status, created_at, img_urls, expires_at, visualizzazioni, featured, featured_until, featured_tier, featured_since, video_url`

Per leggere tel/email del proprio annuncio (es. modifica): RPC `get_listing_contact()` (owner-bypass + admin-bypass + rate limit 50/h non-owner). Anche `profiles` per anon è REVOKE: telefono solo via RPC o per owner.

**Regola colonne (ricorrente)**: ogni colonna NUOVA su `annunci`/`profiles` richiede un `GRANT SELECT (col)` esplicito — su queste tabelle il SELECT è column-level (per il REVOKE su tel/email). Senza, la query torna `42501` silenzioso e la dashboard/pagina mostra 0 o vuoto.

## 🎨 CSS: `<style>` inline DOPO Tailwind sovrascrive le utility

In molti HTML (vendi, valutatore, dashboard) lo `<style>` inline viene caricato **dopo** `css/tailwind.css`. A parità di specificità (`0,1,0`) vince l'ultimo dichiarato → classi custom `.field-input { padding:.75rem 1rem; font-size:.9rem; font-weight:600 }` sovrascrivono `pl-X`/`text-X`/`font-X` di Tailwind.

**Soluzioni** (in ordine di preferenza):
1. `style=""` inline (specificità `1,0,0,0`, batte SEMPRE qualsiasi classe). Best per fix puntuali.
2. Modificare la classe custom direttamente in `<style>`.
3. NON usare `!important`.

**Tailwind precompilato**: solo classi standard (`pl-12`, `pl-16`, `pl-20`...). Mai arbitrary values come `pl-[4.5rem]` (non sono nel CSS compilato → fallback). Per custom: scegliere il più vicino della scala o rebuildare CSS.

**REGOLA EVERGREEN — Audit prima del commit nuovo Tailwind**: prima di shippare un componente con responsive variants, fare audit `awk 'BEGIN{RS="}"} /pattern/' css/tailwind.css | grep -oE '...'` per CONFERMARE che le classi `lg:`/`md:`/`sm:` esistano nel build. Il content scanner di Tailwind v3 lavora solo se il template è scansionato dal config; classi nuove richiedono `npx tailwindcss -i tailwind.input.css -o css/tailwind.css --minify` + bump `?v=N` su tutti i file (21 file usano `tailwind.css?v=`). Bug 9 mag 2026 sera: bento blog list cadeva in `sm:grid-cols-2` su lg+ perché `lg:grid-cols-1` non era compilato → 2 col affiancate invece di 1 stack verticale alla destra del hero. Stessa categoria di mancanze: `lg:text-6xl`, `lg:text-lg`, `md:text-5xl`, `md:text-xl`, `md:p-8`, `hover:shadow-2xl`, `hover:shadow-lg`, `group-hover:scale-[1.02]`, `hover:-translate-y-*`, `line-clamp-3`, `content-start`. Sintomi tipici: layout collassa, hover non risponde, dimensioni font non scalano sui breakpoint.

## Area personale: Vetrine e pagamenti (8 ottobre 2026)

- `dashboard#pagamenti`, `js/vetrina-account.js?v=1`, `css/vetrina-account.css?v=1`: riepilogo, Vetrine per annuncio, grafici 7/30/90 giorni, storico paginato/filtrato, esportazione CSV completa con protezione formule, ricevute e supporto. Modal profilo: iscrizione, email confermata, metodo di accesso, profilo pubblico, reset password e accesso agli acquisti. Nessuna cache persistente; risposte superate e cambio sessione non mostrano dati precedenti.
- `PATCH_ACCOUNT_VETRINE_20261008.sql`: snapshot titolo/id, conferma pagamento, finestre esatte per nuovi acquisti/rinnovi e `payment_history` append-only. Dati degli acquisti pagati congelati, DELETE bloccato e TRUNCATE revocato ai ruoli API; solo proprietario via `dashboard_vetrina_account`. FK originali SET NULL preservano pagamenti dopo eliminazione annuncio/account; metriche private conservate rimuovendo i due FK CASCADE. Un amministratore del database resta tecnicamente in grado di alterare lo schema: non promettere immutabilità assoluta. Le date storiche non ricostruibili restano NULL.
- `payment-receipt`: autentica utente, verifica proprietà ordine e restituisce solo URL ricevuta Stripe, senza cache; nessun dato carta o secret nel browser. Recupera eventuali rimborsi dal Charge alla consultazione. Il webhook gestisce anche `charge.refunded` e `checkout.session.async_payment_succeeded`; per aggiornamento immediato dei rimborsi l'endpoint Stripe deve sottoscrivere `charge.refunded`. Gli eventi duplicati/fuori ordine non diminuiscono il rimborso. Un rimborso aggiorna lo storico economico e non revoca automaticamente i giorni della promozione.
- Statistiche aggregate **per annuncio e periodo**, non attribuite al singolo ordine: i rinnovi condividono la misurazione giornaliera esistente. Transazioni `cs_test_*` marcate TEST, escluse dai totali economici. Checkout senza registrazione ordine non restituisce URL e tenta di scadere la sessione Stripe.
- Verifiche: `scripts/test-vetrina-account.cjs` (Chromium/WebKit, 1440/390/320px, isolamento ricevute, XSS, CSV, pagine, filtri, grafici e retry), `scripts/test-vetrina.cjs`, `scripts/verify-seller-analytics.js`; `scripts/verify-vetrina-account.sql` e `scripts/verify-vetrina.sql` transazionali con ROLLBACK. Nessun addebito/email reale nei test.

## 🖼️ Sistema Profilo Pubblico

- **`profilo.html?id=USER_ID`**: pagina pubblica con avatar, nome, data iscrizione, badge, annunci attivi.
- **Badge profilo**: `getProfileBadges(createdAt, activeListings)` in `data.js`. 5 badge: Nuovo Iscritto (<30gg), In Crescita (1-6m), Affidabile (6-12m), Veterano (>1anno), Top Venditore (5+ annunci).
- **Mini-venditore nelle card**: `buildCard()` usa `USER_NAMES[l.user_id]` (popolato da fetch separato `profiles` con `.in('id', uniqueIds)`) come primario, `l.contatto` fallback. **NON usare join `profiles(...)` nella select annunci** — rompe PostgREST.
- **Avatar upload**: bucket Supabase Storage `avatars` (pubblico). Usare `upsert` non `update` su `profiles.avatar_url`.
- **Anteprime immagini (22 ottobre 2026)**: `api/image.js`/`lib/image-preview-cache.cjs` riusano WebP persistenti nel bucket `image-previews`, anche dopo nuovi deploy. Un download originale prepara sei dimensioni; richieste simultanee nella stessa istanza condividono il lavoro. Scritture solo server con environment cifrato, nessuna modifica a originali/URL frontend/qualità; errori cache senza fallback indiscriminato. Dettagli/test in `data/IMAGE_PREVIEWS.md`, prove/inventario in `Documents/verifica-anteprime-persistenti-20261022/`. Nessun piano a pagamento attivato.
- `js/image-urls.js?v=1` condivide gli URL delle anteprime tra browser e SSR: caricarlo prima di `data.js?v=19`. Dettaglio `annuncio-detail.js?v=22`: originali richiesti solo cliccando le foto, dialog con navigazione/chiusura/tastiera; tutte le foto visibili anche negli annunci gratuiti. SEO continua a riferirsi agli originali.
- Nuovi upload conservano il file esatto, senza compressione distruttiva: fino a 50 MiB in vendita, 20 MiB in modifica; `img_urls`/`avatar_url` restano URL originali. Formati e decoder in `data/LISTING_PHOTOS.md`. File vecchi già compressi in passato conservano la versione disponibile. Non cancellare originali per rigenerare anteprime.
- Verifiche: `scripts/test-image-previews.cjs` (API, orientamento, cache/errori, Chrome desktop e Safari mobile, nessun originale prima del clic) e `scripts/test-vendi.cjs` (upload, retry, conservazione file >5 MB e rimozione anteprime esistenti). Sharp richiede `package.json` e lock versionati.
- **Modal profilo in dashboard**: aperto da `goToProfilo()`. Su mobile bottom sheet (`items-end`, `max-h-[92dvh]`). NON esiste più tab "Profilo".
- **Cache `USER_AVATARS`/`USER_NAMES`** globali in `data.js`. Aggiornano tutte le card se l'utente cambia nome.

### Onboarding widget (dashboard)
- 4 step: email confermata, telefono profilo, avatar, primo annuncio. Si nasconde a 4/4.
- **"Carica foto profilo"**: apre direttamente file picker via `document.getElementById('avatarInput').click()` (non più redirect a tab profilo). Refresh widget + toast dopo upload.
- **Overlay upload avatar**: `#avatarUploadOverlay` fullscreen blur con spinner + 4 messaggi rotanti ogni 1.8s con fade ("Sto preparando…", "Caricamento sicuro…", "Quasi fatto…", "Salvataggio nel tuo profilo…") + banner "Non chiudere la pagina" + `beforeunload` guard. Spinner anche su `#welcomeAvatar`. Cleanup robusto in `finally`.
