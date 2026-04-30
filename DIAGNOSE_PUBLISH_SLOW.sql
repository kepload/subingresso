-- ============================================================
--  DIAGNOSTICA: INSERT su annunci lentissimo (>20s)
--  Esegui questo nel SQL Editor di Supabase per capire cosa
--  rallenta la pubblicazione di un annuncio.
-- ============================================================

-- ── 1. ELENCO TRIGGER ATTIVI SU annunci ─────────────────────
-- Mostra tutti i trigger BEFORE/AFTER INSERT/UPDATE/DELETE
SELECT
    tgname        AS trigger_name,
    CASE tgenabled WHEN 'O' THEN 'enabled' WHEN 'D' THEN 'disabled' ELSE tgenabled::text END AS state,
    pg_get_triggerdef(oid) AS definition
FROM pg_trigger
WHERE tgrelid = 'public.annunci'::regclass
  AND NOT tgisinternal
ORDER BY tgname;


-- ── 2. SORGENTE DELLE FUNZIONI CHIAMATE DAI TRIGGER ─────────
-- Mostra il body delle function trigger sull'annunci (cerca pg_net,
-- net.http_post, supabase_functions.http_request, ecc).
SELECT
    n.nspname AS schema,
    p.proname AS function,
    pg_get_functiondef(p.oid) AS source
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname IN (
    'enforce_annunci_status',
    'notify_alert_on_annunci',
    'handle_new_user'
)
ORDER BY p.proname;


-- ── 3. CODA pg_net: richieste pendenti / fallite ─────────────
-- Se il trigger usa pg_net e la coda e' piena, l'INSERT puo' rallentare.
SELECT count(*) AS pending_requests
FROM net.http_request_queue;

-- Ultimi 10 risultati pg_net (errori vs successi)
SELECT id, status_code, error_msg, created
FROM net._http_response
ORDER BY created DESC
LIMIT 10;


-- ── 4. STATO REALTIME / PUBLICATION ──────────────────────────
-- Se annunci e' in supabase_realtime con replica identity full,
-- ogni INSERT scatena replicazione che puo' rallentare.
SELECT pubname, schemaname, tablename
FROM pg_publication_tables
WHERE tablename = 'annunci';

SELECT relname,
       CASE relreplident WHEN 'd' THEN 'default' WHEN 'n' THEN 'nothing'
                          WHEN 'f' THEN 'full' WHEN 'i' THEN 'index' END AS replica_identity
FROM pg_class
WHERE relname = 'annunci';


-- ── 5. TEST INSERT MANUALE (rimuovere user_id reale dell'admin) ─
-- DECOMMENTARE per testare. Se l'INSERT manuale e' veloce (<1s)
-- ma quello dal sito e' lento, il problema e' lato client/REST.
-- Se l'INSERT manuale e' lento anche qui, e' un trigger DB.
/*
\timing on
INSERT INTO public.annunci (
    user_id, titolo, descrizione, stato, tipo, settore,
    regione, comune, superficie, giorni, prezzo,
    contatto, tel, status
)
VALUES (
    (SELECT id FROM auth.users WHERE email = 'kycykuardit@gmail.com'),
    'TEST DIAGNOSTICO - cancellare', 'Test descrizione lunga abbastanza',
    'Vendita', 'Mercato settimanale', 'Frutta e verdura',
    'Lombardia', 'Milano', 10, 'Lunedi', 1000,
    'Test', '3470000000', 'pending'
)
RETURNING id;
*/


-- ── 6. WORKAROUND: DISABILITA TEMPORANEAMENTE notify_alert_trigger ─
-- Se la diagnostica mostra che notify_alert_trigger e' la causa,
-- DECOMMENTARE per disabilitarlo (le email alert smettono di partire,
-- ma la pubblicazione torna istantanea). Riattivare poi il trigger
-- una volta sistemato.
/*
ALTER TABLE public.annunci DISABLE TRIGGER notify_alert_trigger;
-- per riattivare:
-- ALTER TABLE public.annunci ENABLE TRIGGER notify_alert_trigger;
*/
