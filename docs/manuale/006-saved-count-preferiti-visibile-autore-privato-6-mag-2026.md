
## 🔖 Saved Count (preferiti) — visibile, autore privato (6 mag 2026)

Il venditore può vedere **quanti** hanno salvato il proprio annuncio, ma NON CHI (privacy by-design).

**Schema (`PATCH_AMO_EXTEND_AND_SAVED_COUNT_20260506.sql`):**
- Colonna `annunci.saved_count int NOT NULL DEFAULT 0`
- Backfill iniziale: `UPDATE annunci SET saved_count = (SELECT count FROM saved_listings WHERE annuncio_id = a.id)`
- Index `idx_saved_listings_annuncio` su `(annuncio_id)` per trigger lookup
- Trigger `trg_sync_saved_count` AFTER INSERT/DELETE su saved_listings → +1/-1 atomico su annunci.saved_count. Function SECURITY DEFINER per bypassare RLS owner-only di annunci

**Privacy:** RLS di `saved_listings` resta owner-only (l'utente vede solo i propri preferiti). `saved_count` è AGGREGATO (un int, non rivela autori) → safe da esporre. Pattern simile a `visualizzazioni`.

**Display:**
- Pagina annuncio (`annuncio.html` + `annuncio-detail.js?v=17`): `#savedCount` accanto a `#viewCount` nel title block. Visibile a TUTTI (social proof) se `saved_count > 0`. Privacy preservata.
- Dashboard "I miei annunci" (`loadMyListings`): icona bookmark blu nella riga stats, sempre visibile se `saved_count > 0`. Select aggiornato per includere `saved_count`.
- Email weekly-seller-stats: aggiunta card "Salvati 🔖" accanto a "Annunci attivi" / "Views totali". `bySeller.totalSaved` aggregato. Edge function re-deployata 6 mag 2026.

## Provenienza degli utenti (7 ottobre 2026)

- Pannello admin **Da dove arrivano gli utenti**, periodi 30/90/365 giorni: Blog, Bandi (anche gli articoli regionali), Valutatore, Homepage, Fiere (articoli con slug/categoria dedicati e link `utm_source=fiere`), Altro. Ingressi = prima pagina rilevata nell'intero storico per `(visitor_id, session_id)`, poi filtro del periodo; visitatori distinti globali non ricavati dalla somma delle righe.
- Patch `PATCH_ACQUISITION_20261007.sql`: UTM source/campaign su `page_views`, landing pulita e UTM su `auth_modal_opens`; RPC `admin_acquisition_stats` riservata agli admin. Una sola attribuzione per nuovo account, dalla prima apertura con landing nei 24h prima del signup. Account admin/demo esclusi dalle iscrizioni. Vecchie iscrizioni senza landing restano **non attribuite**; non dedurle dal bottone cliccato.
- `page-view-tracker.js` espone `getAcquisitionContext()` e conserva `_acq_*` già esistenti: path senza query personali (solo slug blog), referrer ridotto all'origine HTTP(S), UTM limitati a codici `[a-z0-9_-]{1,80}`. `auth.js` riusa il contesto. Il valutatore salva la landing originale, anche se la prima pagina era un articolo.
- Aggiunto il tracker alle landing SSR bandi, annunci e città: lo storico precedente di queste pagine è incompleto. La sessione resta quella esistente in sessionStorage; non introdotta una scadenza di 30 minuti. Traffico storico include anche il gestore e visite automatizzate non riconosciute.
- Nel pannello: canali esterni e generatore di link per fiere/QR. Il vecchio funnel si chiama **Dove viene aperta la registrazione** per distinguerlo dall'acquisizione. I suoi conteggi storici per apertura non sono iscritti unici globali.
- Cache allineate: `auth.js?v=21`, `page-view-tracker.js?v=4`, `js/pages/valutatore.js?v=3`, incluse pagine SSR. `vendi.html` aggiornato solo nei riferimenti cache.
- Verifica: `node scripts/verify-acquisition.cjs`, `scripts/verify-acquisition.sql` (ROLLBACK), prova browser desktop/mobile. Il lavoro non implementa il consenso né risolve gli altri punti aperti dell'audit privacy.

## 📊 Funnel Registrazione per Sorgente (6 mag 2026)

Tracciamento full funnel per capire conversion rate per ogni sorgente che apre il modal registrazione (popup vetrina, banner blog, click "Pubblica annuncio", nav "Accedi", salva preferito, valutatore, tel reveal, direct).

**Schema (`PATCH_AUTH_MODAL_OPENS_20260506.sql`):**
- Tabella `auth_modal_opens(id, source CHECK enum 9 valori, opened_at, anon_session, time_bucket, signed_up_user_id FK profiles ON DELETE SET NULL)`
- UNIQUE `(source, anon_session, time_bucket)` → dedup automatico per minuto: doppi click + aperture multiple non gonfiano i dati
- RLS: INSERT a anon+authenticated, NO select/update/delete (solo via RPC SECURITY DEFINER)
- RPC `amo_link_signup(text)`: chiamata in `_afterRegisterSuccess`, valorizza `signed_up_user_id` per la sessione anonima del nuovo utente. Safety 24h.
- RPC `admin_signup_funnel_by_source(int days)`: ritorna `{period_days, total_opens, total_signups, rows[{source, opens, signups, conversion_pct}]}`. Check is_admin.
- Cron `auth-modal-opens-cleanup` ogni notte alle 04:00: DELETE anonimi >90gg, signed-up >395gg.

**Lato client:**
- `_amo_session` UUID generato in `sessionStorage` alla prima apertura modal (no localStorage = scompare a tab close)
- `_trackModalOpen(source)` async silent-fail in `auth.js` chiamata da `openAuthModal(tab, contextMsg, source)` con il terzo arg
- `time_bucket` = "YYYYMMDDHHMM" UTC → finestra dedup 1 minuto
- **12 sorgenti tipizzate** (post 6 mag 2026): `popup_vetrina, blog_promo, vendi_submit, nav_accedi, salva_preferito, valutatore_create, welcome_popup, tel_reveal, direct, chat_click, whatsapp_click, call_click`
- 11 call site di `openAuthModal` aggiornati con la source corretta + 3 call site `requireAuth(callback, source)` in `annuncio-detail.js` (chat/whatsapp/call). `requireAuth` propaga la source a `openAuthModal`

**`_reg_src`** (`popup_vetrina`/`blog_promo`/`popup`) ora serve SOLO a decidere se mostrare il popup di benvenuto post-registrazione. La lotteria collegata è stata rimossa il 23 mag 2026.

**Pannello admin** in `dashboard.html` SOPRA "Valutatore Logs": `loadAdminSignupSources()` carica via RPC, mostra top 5 sorgenti per opens (con icona, label, opens, signups, CR% colorato verde/blu/grigio in base a soglia). Bottone "Mostra altre N" toggle inline. Selettore periodo 30g/90g/1y. `_amoState` global state.

**Compliance GDPR:**
- Pseudonimo by-design (no IP, no UA, no fingerprint)
- Privacy.html aggiornata: voce in sez. 5 (cookie/storage di prima parte) + sez. 6 (retention)
- Base giuridica: legittimo interesse (art. 6.1.f GDPR)
- **Nota privacy aggiornata 7 ottobre 2026:** l'esenzione dal consenso non è automatica per analytics di prima parte; verificare identificativi persistenti, collegamento ad account e condizioni Garante. Vedi `PRIVACY_DATA_AUDIT_20261007.md`.
