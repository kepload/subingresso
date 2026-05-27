-- Cron giornaliero AI Scout Bandi: 08:00 UTC (= 10:00 Roma in estate, 09:00 in inverno)
-- Template: applica via psql -v service_jwt="<sb_secret_*>"
-- Esempio: psql "$DB_URL" -v service_jwt="sb_secret_..." -f PATCH_CRON_SCOUT_BANDI_20260527.sql

-- Rimuovi vecchia versione se esiste (idempotente)
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'scout-bandi-daily';

SELECT cron.schedule(
    'scout-bandi-daily',
    '0 8 * * *',
    $$
    SELECT net.http_post(
        url := 'https://mhfbtltgwibwmsudsuvf.supabase.co/functions/v1/scout-bandi',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || :'service_jwt'
        ),
        body := jsonb_build_object('source', 'cron'),
        timeout_milliseconds := 60000
    );
    $$
);
