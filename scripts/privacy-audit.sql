-- Ricognizione privacy in sola lettura. Non restituisce dati dei singoli utenti.
-- Non selezionare cron.job.command: altri job possono contenere credenziali.
BEGIN TRANSACTION READ ONLY;

WITH inventory AS (
    SELECT table_name AS tablename, column_name AS columnname, data_type AS datatype,
           ordinal_position
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN ('profiles', 'annunci', 'conversazioni', 'messaggi',
                         'page_views', 'blog_conversions', 'auth_modal_opens',
                         'valutatore_logs', 'payments', 'bando_alerts', 'bando_alert_log')
), jobs AS (
    SELECT jobname, schedule, active
    FROM cron.job
    WHERE jobname ~* '(cleanup|retention|privacy|purge|anonym|anonim)'
), age_summary AS (
SELECT 'page_views' AS category, count(*) AS rows,
       min(created_at) AS oldest, max(created_at) AS newest,
       count(*) FILTER (WHERE created_at < now() - interval '13 months') AS beyond_current_policy
FROM public.page_views
UNION ALL
SELECT 'valutatore_logs', count(*), min(created_at), max(created_at),
       count(*) FILTER (WHERE user_id IS NULL AND created_at < now() - interval '24 months')
FROM public.valutatore_logs
UNION ALL
SELECT 'auth_modal_opens', count(*), min(opened_at), max(opened_at),
       count(*) FILTER (WHERE (signed_up_user_id IS NULL AND opened_at < now() - interval '90 days')
                              OR (signed_up_user_id IS NOT NULL AND opened_at < now() - interval '395 days'))
FROM public.auth_modal_opens
)
SELECT jsonb_build_object(
    'columns', (SELECT jsonb_agg(to_jsonb(i) - 'ordinal_position' ORDER BY tablename, ordinal_position) FROM inventory i),
    'retention_jobs', (SELECT coalesce(jsonb_agg(to_jsonb(j) ORDER BY jobname), '[]'::jsonb) FROM jobs j),
    'age_summary', (SELECT jsonb_agg(to_jsonb(a)) FROM age_summary a)
) AS privacy_audit;

COMMIT;
