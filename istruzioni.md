# Manuale tecnico — indice per argomento

Il manuale precedente è stato suddiviso senza tagli il 4 novembre 2026.
Le regole operative comuni restano in [AGENTS.md](AGENTS.md). I riferimenti
descrivono decisioni e implementazioni documentate fino al 1 novembre:
codice, configurazioni e servizi correnti vanno verificati quando pertinenti.
Le sezioni intitolate «Storico», «TODO» o «proposte» non autorizzano interventi.

Aprire il solo riferimento pertinente, oppure cercare con:
`node scripts/project-context.cjs "parola o frase"`.
I percorsi di codice nei riferimenti sono relativi alla root del progetto.

| Argomento iniziale (e sezioni successive) | Riferimento |
|---|---|
| Decisioni correnti e contratti — 23 ottobre 2026 · Qualità dati e profilo admin — 8 ottobre 2026 · altre 7 sezioni | [001-decisioni-correnti-e-contratti-23-ottobre-2026.md](docs/manuale/001-decisioni-correnti-e-contratti-23-ottobre-2026.md) |
| 📍 Inserimento comuni nei form (7 ottobre 2026) · Ricerca dei luoghi (7 ottobre 2026) · altre 1 sezioni | [002-inserimento-comuni-nei-form-7-ottobre-2026.md](docs/manuale/002-inserimento-comuni-nei-form-7-ottobre-2026.md) |
| 🚫 SECURITY: `select('*')` su `annunci` da authenticated è VIETATO · 🎨 CSS: `<style>` inline DOPO Tailwind sovrascrive le utility · altre 2 sezioni | [003-security-select-su-annunci-da-authenticated-e-vietato.md](docs/manuale/003-security-select-su-annunci-da-authenticated-e-vietato.md) |
| 📊 Visualizzazioni Annunci · 💬 Chat / Conversazioni (`messaggi.html`) · altre 1 sezioni | [004-visualizzazioni-annunci.md](docs/manuale/004-visualizzazioni-annunci.md) |
| 🔍 SEO & Google · 🃏 Card Annunci (`buildCard` in `data.js`) · altre 1 sezioni | [005-seo-google.md](docs/manuale/005-seo-google.md) |
| 🔖 Saved Count (preferiti) — visibile, autore privato (6 mag 2026) · Provenienza degli utenti (7 ottobre 2026) · altre 1 sezioni | [006-saved-count-preferiti-visibile-autore-privato-6-mag-2026.md](docs/manuale/006-saved-count-preferiti-visibile-autore-privato-6-mag-2026.md) |
| 🪄 Hero Dashboard Venditore + Milestones (9 mag 2026) · 👤 Display Nome Utente — Anti-duplicato (6 mag 2026) · altre 3 sezioni | [007-hero-dashboard-venditore-milestones-9-mag-2026.md](docs/manuale/007-hero-dashboard-venditore-milestones-9-mag-2026.md) |
| 🐛 Bug Storici Generalizzabili (NON ripetere) · 🤖 Blog Generator (`js/blog-generator.js`) · altre 1 sezioni | [008-bug-storici-generalizzabili-non-ripetere.md](docs/manuale/008-bug-storici-generalizzabili-non-ripetere.md) |
| 💎 Sistema Vetrina a Pagamento · 📬 Email — Sistema Completo (Resend) · altre 2 sezioni | [009-sistema-vetrina-a-pagamento.md](docs/manuale/009-sistema-vetrina-a-pagamento.md) |
| 🛡️ Pannello Sicurezza Admin · 🔔 Alert Anomalie · altre 2 sezioni | [010-pannello-sicurezza-admin.md](docs/manuale/010-pannello-sicurezza-admin.md) |
| 🧙 Form `vendi.html` — Wizard 6 Step (aggiornato 7 ottobre 2026) · 💶 Prezzi Affitto — Annuali · altre 3 sezioni | [011-form-vendi-html-wizard-6-step-aggiornato-7-ottobre-2026.md](docs/manuale/011-form-vendi-html-wizard-6-step-aggiornato-7-ottobre-2026.md) |
| 📞 Telefono — Validazione & E.164 · ⚡ Performance | [012-telefono-validazione-e-164.md](docs/manuale/012-telefono-validazione-e-164.md) |
| 📬 Avvisi Bandi (lead magnet bundle, 6 mag 2026 sera fase 1) · 📈 Growth Chart Admin (`loadAdminGrowthChart`) · altre 1 sezioni | [013-avvisi-bandi-lead-magnet-bundle-6-mag-2026-sera-fase-1.md](docs/manuale/013-avvisi-bandi-lead-magnet-bundle-6-mag-2026-sera-fase-1.md) |
| 📣 Blog Promo Inline · 🏠 Home Page Sezioni | [014-blog-promo-inline.md](docs/manuale/014-blog-promo-inline.md) |
| Valutatore v2.6 (22 ottobre 2026) | [015-valutatore-v2-6-22-ottobre-2026.md](docs/manuale/015-valutatore-v2-6-22-ottobre-2026.md) |
| 📐 Saved Listings (Preferiti) · 🧭 Header Nav · altre 5 sezioni | [016-saved-listings-preferiti.md](docs/manuale/016-saved-listings-preferiti.md) |
| 📰 Articoli "Bandi" — Pattern Replica · 🐌 Pubblicazione Annuncio — Lessons Learned | [017-articoli-bandi-pattern-replica.md](docs/manuale/017-articoli-bandi-pattern-replica.md) |
| ⏳ TODO Aperti · Stato delle verifiche di sicurezza | [018-todo-aperti.md](docs/manuale/018-todo-aperti.md) |
| 💡 Strategia Monetizzazione — proposte storiche, non funzioni attive | [019-strategia-monetizzazione-proposte-storiche-non-funzioni-attive.md](docs/manuale/019-strategia-monetizzazione-proposte-storiche-non-funzioni-attive.md) |
| Calendario fiere — fonti e manutenzione | [020-calendario-fiere-fonti-e-manutenzione.md](docs/manuale/020-calendario-fiere-fonti-e-manutenzione.md) |

## Contratti aggiornati da preferire per questi temi

- Fiere: [indice e regole](data/FIERE.md), [checklist](docs/fiere-province.md).
- Vetrine: `data/VETRINE_PREMIUM.md`, `data/SELLER_PREMIUM_ANALYTICS.md`.
- Email e consensi: `data/VETRINA_EMAIL.md`, `data/EMAIL_CONVERSION_ANALYTICS.md`.
- Annunci, foto, esiti e contatti: `data/LOCALITA.md`, `data/LISTING_PHOTOS.md`,
  `data/LISTING_OUTCOMES.md`; controllare anche i consumatori effettivi.
- ADS interne: `data/PERSONAL_ADS.md`, `data/PERSONAL_AD_CONTEXT.md`,
  `data/CONTEXTUAL_ADS.md`, `data/BLOG_VETRINE_ADS.md`.
- SEO: `data/SEARCH_CONSOLE.md`. Chat: `data/CHAT_RELIABILITY.md`.
- [Attività da rivalidare](docs/attivita.md); [metodo e fonti Codex](docs/CONTESTO.md).
