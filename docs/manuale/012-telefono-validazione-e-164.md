
## 📞 Telefono — Validazione & E.164

- **`phoneToTelLink(raw)`** in `data.js`: ritorna E.164 strict (`+39XXXXXXXXXX`). Riconosce: già-E.164, `0039`, `39` (12-13 cifre), cellulare `3xx` (9-10 cifre), fisso `0xx` (9-11 cifre).
- **`isValidItalianPhone(raw)`**: strict `/^\+39\d{9,11}$/` dopo normalize.
- **`normalizePhone(raw)`**: ritorna formato display locale `347 1234567` per UI/storage.
- **`setupPhoneInput(inputEl, opts)`**: widget UX hint live (grigio vuoto / verde valido + preview / rosso invalido). Normalize on blur.
- Wirate in: `auth.js` `regTelefono`, `vendi.html` `fTel`, `modifica-annuncio.html` `fTel`, `dashboard.html` `pTelefono`.
- Bottone "Chiama" usa `phoneToTelLink()` → `tel:+39...`. Formato del link WhatsApp invariato.

### Recupero contatti nel dettaglio — 24 ottobre 2026

`js/pages/annuncio-detail.js`: `telFetched` indica soltanto una risposta RPC
valida, anche senza numero; errori, payload malformati e timeout di 12 secondi
restano riprovabili al clic. Richiesta condivisa fra prefetch, Chiama e WhatsApp;
un solo intento durante l'attesa. Stati persistenti e accessibili anche mobile.
Ogni azione passa da `requireAuth`; cache e richieste sono legate all'identità
verificata. Logout/cambio account svuotano tel/email e invalidano risposte e
azioni tardive, anche rientrando nello stesso account. Nessun fallback fuori da
`get_listing_contact`, nessun cambio di quota/RLS. Azioni telefoniche bloccate
per annunci scaduti/non attivi e anteprima moderazione.
Regressione `scripts/test-phone-contacts.cjs`: Chrome e WebKit desktop/mobile,
rete lenta, errore/riprova, timeout, deduplica, assenza e isolamento; API/sessioni
simulate e navigazioni tel/WhatsApp intercettate. `PHONE_PUBLISHED_DIR` ripete
le prove sugli asset scaricati dal sito, `PLAYWRIGHT_MODULE` riusa il driver locale.

## ⚡ Performance

- **`updateAuthNav()` in `auth.js`** usa `getSession()` (localStorage, no rete) per render istantaneo. Badge messaggi non letti in IIFE async separata. NON tornare a `getUser()`.
- **Skeleton loader `annunci.html`**: 6 card placeholder pulse, sostituite dal primo `applyFilters()`.
- **Tailwind precompilato** `css/tailwind.css?v=4` (~50KB minified). Build: `npx tailwindcss -i tailwind.input.css -o css/tailwind.css --minify`. NO più CDN.
- **Page views tracking interno**: tabella `page_views`. Tracker `js/page-view-tracker.js?v=2` su 17 pagine pubbliche, dedup per (visitor, path, session). **Per `/blog?post=<slug>` il tracker promuove lo slug nel path** → salva `/blog/<slug>` (sanitizzato `[a-z0-9-]{1,80}`). Senza questa estensione tutti i post collassano in `/blog`.
- **Blog conversions** (6 mag 2026 sera, fase 0): tabella `blog_conversions(id, post_slug, regione, kind, visitor_id, session_id, created_at)` con `kind` ∈ `cta_annunci_click | alert_signup | box_listing_click`. RLS: solo INSERT da anon+authenticated, SELECT bloccato (admin via RPC). Helper globale `window.trackBlogConversion(kind, slug, regione)` in `js/blog-tracker.js`. In `blog.html` listener delegato sui click verso `/annunci?regione=X` → traccia `cta_annunci_click` automaticamente (regione letta dall'href, non dedotta dallo slug). Gli altri due `kind` saranno agganciati nelle fasi 1 (form alert) e 2 (box live posteggi).
- **RPC `admin_blog_stats(p_days)`** SECURITY DEFINER + check is_admin. Aggrega views (`page_views.path LIKE '/blog/%'`, slug estratto via regex) + conversioni per kind. Ritorna `{period_days, total_views, total_conversions, rows[]}` ordinato per views desc, ogni riga ha `slug, title, category, views, unique_visitors, cta_clicks, alert_signups, box_clicks, total_conv, cr_pct`. Pannello "Performance blog" in `dashboard.html` sopra Valutatore Logs, selettore 30g/90g/1y.
