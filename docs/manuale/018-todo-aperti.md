
## ⏳ TODO Aperti

### Attività da rivalidare

Le priorità correnti sono nel documento informazioni. Le proposte seguenti
provengono dal backlog storico: verificare prima codice, commit e stato live;
non sono incarichi automatici né prova che una funzione manchi ancora.
Numeri utenti/annunci, bandi pending, funnel e scadenze di maggio/giugno non
sono più presentati come stato attuale. L'eventuale rotazione della chiave Gemini
segnalata nel maggio 2026 va verificata senza ristampare o riutilizzare il valore.

**Proposte storiche, stato da verificare prima di riprenderle:**
- **Lead magnet email** sull'hub Bolkestein → porta annunci veri (priorità n.1). Outreach anche via gruppi FB / mercati di persona / associazioni FIVA-ANVA (vedi `project_compete_annunciambulanti.md`).
- **Step 2 SEO landing regionali SSR** (`api/annunci.js`, modello `api/blog.js`): title/meta/H1 per `?regione=X`. Solo dopo ≥5 annunci attivi per regione.
- **Fase 5 blog conversion**: pannello "Performance blog" admin + RPC `admin_blog_stats(p_days)`, dopo 7-14gg di dati → migliorare copy/CTA degli articoli con CR% basso e tante views. Tracking in `blog_conversions`.
- **Serie "Mercati settimanali [città]"** (Modena/Brescia/Bergamo/Milano/Bologna/Torino/Verona/Padova/Firenze/Napoli).
- **Bolkestein — 6 Tier 2 + 3 Tier 3 rimasti**: Tier 2 `roma-18000-concessioni-ambulanti-2026`, `proroga-2032-concessioni-ambulanti-legge-77-2020`, `procedura-infrazione-ue-italia-ambulanti-bolkestein`, `associazioni-ambulanti-bolkestein-confronto`, `sentenze-tar-consiglio-stato-bolkestein-ambulanti`, `linee-guida-mimit-regioni-anci-bandi-ambulanti-2026`; Tier 3 `concessione-ambulante-scadenza-2026-guida-pratica`, `diritto-insistenza-bolkestein-ambulanti-2026`, `diventare-ambulante-2026-bolkestein-accesso`. + re-submit a SC i 4 articoli Bolkestein + internal linking (footer/home/blog) al hub.
- **Privacy policy (pubblicazione 7 ottobre 2026, conformità ancora aperta)**: `privacy.html` pubblicata su richiesta esplicita usando solo Subingresso.it e `info@subingresso.it`, senza nome/indirizzo/P.IVA. Identificazione legale del titolare ancora incompleta ai fini GDPR. Testo adattato al funzionamento attuale: nessun pannello consenso inesistente o TTL visitor ID inventato. Restano da allineare consenso analytics, email promozionali e gestione scadenze: `PRIVACY_DATA_AUDIT_20261007.md`. Bozza completa futura in `PRIVACY_POLICY_BOZZA_20261007.md`. Per sviluppo del sito: dati pertinenti entro limiti definiti, storico lungo solo con anonimizzazione effettiva. Nessuna cancellazione applicata.
- **Step 3 lifecycle annunci scaduti**: edge function + cron daily, 2 email (7gg prima + giorno scadenza), tabella `expiry_notification_log` UNIQUE per dedup. Mai fatto.
- **welcome_popup**: dichiarato nell'enum `_AMO_VALID_SOURCES` ma morto → costruirlo (CTA completa profilo/avatar) o rimuoverlo.
- **Data audit**: annunci eliminati conservati secondo le regole correnti; dal 24 ottobre gli esiti venduto/affittato e i prezzi dichiarati hanno il mini modulo privato (`data/LISTING_OUTCOMES.md`), senza ricostruzione dello storico. Restano da valutare log modifiche e ulteriori eventi di conversione.
- **Spalmare i 2 cron settimanali** su giorni diversi (allunga la quota free Resend).
- **og:image `/annunci` e `/blog`** on-brand (ora frutta/verdura Pexels).
- **Trust whitelist modifiche annuncio**: auto-approvazione dopo N annunci approvati (meno re-revisioni admin).
- **CSP**: ~1 settimana di lavoro, da pianificare.
- **JSON-LD `author` → Person + pagina `/autori/<slug>`** (E-E-A-T per Google Discover; eligibility realistica 3-6 mesi).
- **Cleanup conv vuote** (opzionale): `DELETE FROM conversazioni c WHERE NOT EXISTS (SELECT 1 FROM messaggi m WHERE m.conversazione_id = c.id);` — già nascoste lato client.

### Lavori già conclusi

Esiti nel registro e nei commit; evitare di replicarli in questo manuale.

### Bug minori segnalati ma non urgenti
- `moderation.js` non incluso in HTML (mitigato da trigger DB).
- Admin hardcoded in `setup-database.sql` vecchio (in prod usate già `is_admin`).
- UPDATE policy senza `WITH CHECK` (Postgres riusa USING).
- Rimozione foto in `modifica-annuncio.html` corretta il 7 ottobre 2026 con WeakMap File→preview.

## Stato delle verifiche di sicurezza

Le vecchie note sul telefono pubblico di `profiles` sono superate dalle
restrizioni di colonna e RPC documentate sopra e in `DATA_QUALITY_AUDIT_20261008.md`.
Un vecchio dump SQL non dimostra lo schema live: verificarlo quando serve,
senza cambiare permessi o cancellare dati per allineare il repository.
