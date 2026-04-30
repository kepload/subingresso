-- ============================================================
--  PATCH: rimuove TUTTI i webhook UI sincroni su annunci e li
--  sostituisce con trigger custom asincroni via pg_net
--  Data: 2026-04-30
--
--  PROBLEMA: ogni INSERT su annunci scatenava fino a 5 webhook
--  sincroni HTTP (timeout 5000ms ciascuno) che bloccavano la
--  pubblicazione per 15-20+ secondi:
--    - notify-alert            (webhook UI sync, duplicato)
--    - notify_alert_update     (webhook UI sync, duplicato)
--    - notify_alert_trigger    (custom async pg_net, OK)
--    - " notify_seller_insert" (webhook UI sync, AFTER INSERT)
--    - notify_seller_update    (webhook UI sync, AFTER UPDATE)
--
--  FIX:
--    1. Rimossi i 2 webhook UI duplicati di notify-alert.
--    2. Creata function async `notify_seller_on_annunci()` con
--       pg_net.http_post (fire-and-forget) + trigger unico
--       `notify_seller_trigger` che la chiama su INSERT/UPDATE.
--    3. Rimossi i 2 webhook UI sincroni di notify-seller.
--
--  RISULTATO: INSERT da 20+ secondi a <800ms (misurato dopo il fix).
--  Trigger rimasti su annunci:
--    - notify_alert_trigger      (custom async)
--    - notify_seller_trigger     (custom async)
--    - trg_enforce_annunci_status (BEFORE, locale)
--
--  NOTA: la function `notify_seller_on_annunci()` ha un Bearer JWT
--  hardcoded (service_role). Se ruoti la chiave service_role,
--  bisogna riscrivere la function con la nuova chiave.
--
--  IDEMPOTENTE: si puo' rieseguire senza errori.
-- ============================================================

-- Drop dei webhook UI sync (duplicati o sostituiti da trigger async)
DROP TRIGGER IF EXISTS "notify-alert"         ON public.annunci;
DROP TRIGGER IF EXISTS  notify_alert_update   ON public.annunci;
DROP TRIGGER IF EXISTS " notify_seller_insert" ON public.annunci;
DROP TRIGGER IF EXISTS  notify_seller_update  ON public.annunci;

-- IMPORTANTE: il body di pg_net.http_post DEVE essere jsonb (NON ::text).
-- Una versione precedente di notify_alert_on_annunci usava ::text con
-- EXCEPTION WHEN OTHERS THEN NULL: l'errore di tipo veniva silenziato e
-- nessuna email partiva. Ricreiamo entrambe le function correttamente.

CREATE OR REPLACE FUNCTION public.notify_alert_on_annunci()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://mhfbtltgwibwmsudsuvf.supabase.co/functions/v1/notify-alert',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer SERVICE_ROLE_JWT'
      ),
      body := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', to_jsonb(NEW),
        'old_record', CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify trigger: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_alert_trigger ON public.annunci;
CREATE TRIGGER notify_alert_trigger
  AFTER INSERT OR UPDATE ON public.annunci
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_alert_on_annunci();

-- Function async per notify-seller (stessa struttura).
CREATE OR REPLACE FUNCTION public.notify_seller_on_annunci()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  BEGIN
    PERFORM net.http_post(
      url := 'https://mhfbtltgwibwmsudsuvf.supabase.co/functions/v1/notify-seller',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer SERVICE_ROLE_JWT'
      ),
      body := jsonb_build_object(
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA,
        'record', to_jsonb(NEW),
        'old_record', CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END
      )
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'notify trigger: %', SQLERRM;
  END;
  RETURN NEW;
END;
$$;

-- Trigger unico AFTER INSERT/UPDATE (sostituisce i 2 webhook sync)
DROP TRIGGER IF EXISTS notify_seller_trigger ON public.annunci;
CREATE TRIGGER notify_seller_trigger
  AFTER INSERT OR UPDATE ON public.annunci
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_seller_on_annunci();

-- Verifica trigger rimasti su annunci (output atteso):
--   - notify_alert_trigger       (custom async)
--   - notify_seller_trigger      (custom async)
--   - trg_enforce_annunci_status (BEFORE, locale)
SELECT tgname AS trigger_name,
       CASE tgenabled WHEN 'O' THEN 'enabled' ELSE 'disabled' END AS state
FROM pg_trigger
WHERE tgrelid = 'public.annunci'::regclass
  AND NOT tgisinternal
ORDER BY tgname;
