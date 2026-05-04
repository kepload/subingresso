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
--  POST-PATCH: tutti passano la VERA service_role JWT, identica a quella
--  hardcoded nei trigger notify_alert/seller (vedi PATCH_REMOVE_DUPLICATE_TRIGGERS).
--
--  IDEMPOTENTE: cron.unschedule + cron.schedule funzionano sempre.
-- ============================================================

-- Service role JWT (stessa dei trigger notify_alert / notify_seller in prod)
-- Se ruoti la chiave, ricorda di aggiornare anche QUI e nei due trigger.

DO $$
DECLARE
  v_jwt text := '<REVOKED-2026-05-04>';
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

  -- weekly-buyer-digest: cron 0 9 * * 1 (lunedì 9:00)
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

  -- weekly-seller-stats: cron 0 9 * * 1 (lunedì 9:00)
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
SELECT jobname, schedule, command FROM cron.job ORDER BY jobname;
