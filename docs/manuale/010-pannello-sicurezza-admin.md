
## 🛡️ Pannello Sicurezza Admin

- **`pendingReviewSection` sopra "Crescita del sito"** in `dashboard.html`. Bordo amber-300, shadow-md. Hidden by default → visibile se `loadPendingListings()` trova data.length > 0. Errore mostrato anche se hidden.
- **`securityPanel`** sempre visibile (gradient slate scuro). Comportamento collassabile (6 mag 2026):
  - **0 anomalie**: solo header + bottone "Esegui check" + pill verde inline `✓ Tutto ok`. Padding simmetrico `pt-5 pb-5` per centrare la riga. Le 4 stat box (`securityStats`) e il blocco "Tutto sotto controllo" (`securityAllClear`) sono nascosti — rumore inutile quando va bene.
  - **≥1 anomalia**: ricompaiono le 4 stat box (signup 1h/24h/7g/non confermati) + `securitySuspectSection` + `securityAlertsSection`. Padding torna `pt-6 pb-6`, header riacquista `mb-5`.
  - 4 badge stats: signup ultima ora (red ≥20), 24h, 7g, non confermati 24h (red ≥10).
  - `securitySuspectSection`: account che matchano pattern probe/scanner (`.invalid$`, `.test$`, `.local$`, `.example$`, domini temp-mail, `^word_unixtimestamp@`, keyword `rlstest|hunter_|owasp|sqlmap|injection|xsstest|burpcollab`). Bottone Elimina.
  - `securityAlertsSection`: ultime 5 entries di `admin_alerts_log` con `issues_count > 0`.
  - Bottone "Esegui check" → POST a `admin-anomaly-check`.
- **RPC `admin_security_overview()`** SECURITY DEFINER, check `is_admin = true`. Ritorna jsonb con signups + suspect + alerts.
- **RPC `admin_listings_per_regione()`** lista regioni con count annunci attivi.
- **`auth.audit_log_entries` è VUOTA** — per IP/UA reali serve Logs Explorer Dashboard.

## 🔔 Alert Anomalie

- Edge function `admin-anomaly-check` cron `0 9 * * *`. Tabella `admin_alerts_log` rate-limit 12h.
- Check: annunci 24h=0 (crit), iscritti 7d=0 (crit), page views 24h<5 (warn), pending >3g (warn), spike signup 1h>20 (crit anti-bot).
- Email styled via Resend a tutti gli admin solo se ≥1 issue.
- **Auto-decay 4h** (10 mag 2026): pannello `securityAlertsSection` filtra lato client `checked_at > now()-4h`. L'edge function manda email immediate, il pannello è "live status" non storico. Lo storico completo resta su `admin_alerts_log` a livello DB. Caso d'uso: alert "Nessun annuncio in 24h" può scattare per silenzio organico (utente smette di promuovere su Facebook) e l'admin non vuole vedere falsi-positivi per ore.

## 🔍 Filtri Annunci

- **Sidebar mobile** `hidden lg:block`. Bottone "Filtri" apre bottom-sheet `#mobileFiltersSheet`.
- Input `m_*` (`m_fRegione`, `m_fTipo`, `m_fStato`, `m_fPrezzoMax`, `m_fSup`). `applyMobileFilters()` copia `m_` → sidebar.
- **Filtro giorni** (multi-select chip): `#dayChipsDesktop` + `#dayChipsMobile` in `annunci.html`. CSS `.day-chip` / `.day-chip.selected`. Logica in `js/pages/annunci.js`: `_normalizeDayName()` (NFD + strip diacritici), `_getSelectedDays()`, `toggleDayChip(btn)`. Filtro: intersezione `l.giorni.split(',')` con selected. **CRITICO**: la select primary di `loadListings()` DEVE includere `giorni` — se omesso il filtro è sempre 0 (bug 5 mag 2026).
- **Pannello desktop filtri** (5 mag 2026): una sola riga `grid-cols-2 md:grid-cols-3 lg:grid-cols-6`, chip giorni full-width sotto un divider, bottoni Azzera/Applica a destra. Sheet mobile resta verticale come prima.
- **Ricerca**: searchBar lancia `applyFilters()` solo su click "Cerca" o Invio (non più live). Filtri sidebar restano live `onchange`.
- **Ricerca per luogo**: se `getCityCoords` riconosce il testo → mostra annunci entro 200km ordinati per distanza.
- **`PROVINCE_COORDS` in `data.js`**: aggiungere comuni se ricerca vicinanza non li trova.

## 🔐 Admin Check

- NON email hardcodata — legge `profiles.is_admin = true`.
- Colonna: `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;`
- Assegnare admin: `UPDATE profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = '...');`
- In `dashboard.html`: `_isAdmin` set dopo fetch profilo.
