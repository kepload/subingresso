-- ============================================================
--  PATCH: rimuove i trigger webhook UI duplicati su annunci
--  Data: 2026-04-30
--
--  PROBLEMA: ogni INSERT su annunci scatenava 3 webhook sincroni
--  (notify-alert, notify_alert_update, notify_alert_trigger custom)
--  che chiamavano la stessa edge function notify-alert.
--  Risultato: INSERT lento 15-20 secondi + 3 email duplicate per
--  ogni nuovo annuncio.
--
--  FIX: rimossi i 2 webhook UI (creati involontariamente da chi
--  configurava i webhook dalla Dashboard di Supabase). Si tiene
--  solo il trigger custom `notify_alert_trigger` che usa pg_net
--  in modo asincrono (fire-and-forget, non blocca l'INSERT).
--
--  RISULTATO: INSERT da 20+ secondi a <700ms (misurato dopo il fix).
--
--  IDEMPOTENTE: si puo' rieseguire senza errori.
-- ============================================================

DROP TRIGGER IF EXISTS "notify-alert"        ON public.annunci;
DROP TRIGGER IF EXISTS  notify_alert_update  ON public.annunci;

-- Verifica trigger rimasti su annunci (output atteso, AFTER INSERT/UPDATE):
--   - " notify_seller_insert"   (webhook UI sync verso notify-seller)
--   - notify_alert_trigger      (custom async pg_net verso notify-alert)
--   - notify_seller_update      (webhook UI sync, solo UPDATE)
--   - trg_enforce_annunci_status (BEFORE INSERT/UPDATE, locale)
SELECT tgname AS trigger_name,
       CASE tgenabled WHEN 'O' THEN 'enabled' ELSE 'disabled' END AS state
FROM pg_trigger
WHERE tgrelid = 'public.annunci'::regclass
  AND NOT tgisinternal
ORDER BY tgname;
