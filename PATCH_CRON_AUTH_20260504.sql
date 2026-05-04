-- ============================================================
--  PATCH_CRON_AUTH_20260504.sql
--  Fix 4 pg_cron jobs che chiamano Edge Functions senza Authorization
--  valido. Necessario PRIMA di abilitare il check Bearer SERVICE_ROLE
--  nelle Edge Functions weekly-*, engagement-reminders, admin-anomaly-check.
--
--  STATO PRE-PATCH:
--    - admin-anomaly-check  : NESSUN Authorization header
--    - engagement-reminders : NESSUN Authorization header
--    - weekly-buyer-digest  : "Bearer LA_TUA_SERVICE_ROLE_KEY" (placeholder!)
--    - weekly-seller-stats  : "Bearer LA_TUA_SERVICE_ROLE_KEY" (placeholder!)
--
--  POST-PATCH: tutti passano la VERA service_role JWT.
--
--  ⚠️  NON COMMITTARE MAI LA SERVICE_ROLE JWT IN CHIARO.
--  Una versione precedente di questo file (commit 24079e60) conteneva
--  la chiave hardcoded ed e' stata rilevata da GitHub secret scanning.
--  La chiave e' stata RUOTATA su Supabase Dashboard. Questo file e' ora
--  un template da applicare con la chiave passata via psql variable:
--
--    psql "$SUPABASE_DB_URL" -v service_jwt="$SUPABASE_SERVICE_ROLE_KEY" \
--         -f PATCH_CRON_AUTH_20260504.sql
--
--  oppure inline temporaneamente con sostituzione, e NON committare.
--  IDEMPOTENTE: cron.unschedule + cron.schedule funzionano sempre.
-- ============================================================

\if :{?service_jwt}
\else
  \echo 'ERRORE: variabile :service_jwt non settata. Esegui con:'
  \echo '  psql ... -v service_jwt="$SUPABASE_SERVICE_ROLE_KEY" -f PATCH_CRON_AUTH_20260504.sql'
  \quit 1
\endif

DO $$
DECLARE
  v_jwt text := :'service_jwt';
BEGIN
  -- admin-anomaly-check: cron 0 9 * * *
  PERFORM cron.unschedule('admin-anomaly-check');
  PERFORM cron.schedule(
    'admin-anomaly-check',
    '0 9 * * *',
    format($cmd$
      select net.http_post(
        url := 'https://mhfbtltgwibwmsudsuvf.supabase.co/functions/v1/admin-anomaly-check',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer %s'
        ),
        body := '{}'::jsonb
      );
    $cmd$, v_jwt)
  );

  -- engagement-reminders: cron 0 10 * * *
  PERFORM cron.unschedule('engagement-reminders');
  PERFORM cron.schedule(
    'engagement-reminders',
    '0 10 * * *',
    format($cmd$
      select net.http_post(
        url := 'https://mhfbtltgwibwmsudsuvf.supabase.co/functions/v1/engagement-reminders',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer %s'
        ),
        body := '{}'::jsonb
      );
    $cmd$, v_jwt)
  );

  -- weekly-buyer-digest: cron 0 9 * * 1 (lunedi 9:00)
  PERFORM cron.unschedule('weekly-buyer-digest');
  PERFORM cron.schedule(
    'weekly-buyer-digest',
    '0 9 * * 1',
    format($cmd$
      select net.http_post(
        url := 'https://mhfbtltgwibwmsudsuvf.supabase.co/functions/v1/weekly-buyer-digest',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer %s'
        ),
        body := '{}'::jsonb
      );
    $cmd$, v_jwt)
  );

  -- weekly-seller-stats: cron 0 9 * * 1 (lunedi 9:00)
  PERFORM cron.unschedule('weekly-seller-stats');
  PERFORM cron.schedule(
    'weekly-seller-stats',
    '0 9 * * 1',
    format($cmd$
      select net.http_post(
        url := 'https://mhfbtltgwibwmsudsuvf.supabase.co/functions/v1/weekly-seller-stats',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer %s'
        ),
        body := '{}'::jsonb
      );
    $cmd$, v_jwt)
  );
END $$;

-- Verifica finale
SELECT jobname, schedule FROM cron.job ORDER BY jobname;
