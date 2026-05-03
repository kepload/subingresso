-- ============================================================
--  PATCH_RLS_PII_LEAK_20260503.sql
--  Chiude la fuga di PII (telefoni, email) verso utenti anonimi.
--
--  Diagnosi: la RLS in prod permetteva ad anon di leggere annunci
--  attivi e profili, e RLS è row-level non column-level → erano
--  esposti via `GET /rest/v1/annunci?select=tel,email` e
--  `GET /rest/v1/profiles?select=telefono`.
--
--  Soluzione: column-level GRANT al ruolo anon. RLS resta come
--  prima (status=active visibile a tutti). authenticated/admin
--  non vengono toccati — il client loggato continua a vedere
--  tutte le colonne come prima.
--
--  Eseguito 3 mag 2026.
-- ============================================================

-- ── ANNUNCI ─────────────────────────────────────────────────
-- Anon perde l'accesso a tel/email. Tutte le altre colonne restano.
revoke select on public.annunci from anon;

grant select (
  id, user_id, titolo, descrizione, stato, categoria, tipo, settore,
  dettagli_extra, regione, provincia, comune, superficie, giorni, prezzo,
  contatto, data, status, created_at, img_urls, expires_at, visualizzazioni,
  featured, featured_until, featured_tier, featured_since, tel_clicks, video_url
) on public.annunci to anon;

-- ── PROFILES ────────────────────────────────────────────────
-- Anon perde l'accesso a:
--   - telefono            (PII)
--   - is_admin            (info sicurezza)
--   - email_digest        (preferenza interna)
--   - email_stats         (preferenza interna)
--   - unsub_token         (token sensibile)
--   - vetrina_welcome_days (interno)
-- Resta accessibile pubblicamente: id, nome, cognome, avatar_url, created_at
revoke select on public.profiles from anon;

grant select (
  id, nome, cognome, avatar_url, created_at
) on public.profiles to anon;

-- ── NOTE ────────────────────────────────────────────────────
-- 1. Il ruolo `authenticated` non è toccato: gli utenti loggati
--    continuano a leggere tutto (compreso il proprio tel/email).
--    Il client (annuncio-detail.js, vendi.html, dashboard.html)
--    funziona come prima quando logged-in.
--
-- 2. SECONDA BATTUTA — da fare in sessione successiva:
--    Anche `authenticated` non dovrebbe leggere tel/email/telefono
--    di altri utenti. Servono o policy con condizioni cross-row,
--    o una vista pubblica + funzione SECURITY DEFINER per ownership
--    check. Questo richiede refactor del client → fase 2.
--
-- 3. NOTIFY pgrst ricarica la cache schema PostgREST.
notify pgrst, 'reload schema';
