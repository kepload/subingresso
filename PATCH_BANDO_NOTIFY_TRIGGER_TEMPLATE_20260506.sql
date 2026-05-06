-- Fase 1.3 — Trigger DB → notify-bando-subscribers edge.
--
-- ATTENZIONE: questo è un TEMPLATE. Il placeholder __SB_SECRET__ va sostituito
-- con la sb_secret_* PRIMA di applicare, e il file applicato deve stare FUORI
-- dal repo (es. /tmp). Mai committare la chiave hardcoded.
--
-- Apply pattern (in bash):
--   K=$(./scripts/.bin/supabase.exe db query --linked ...)  # estrai dal trigger esistente
--   sed "s|__SB_SECRET__|$K|" PATCH_BANDO_NOTIFY_TRIGGER_TEMPLATE_20260506.sql > /tmp/apply.sql
--   ./scripts/.bin/supabase.exe db query --linked --file /tmp/apply.sql
--   rm -f /tmp/apply.sql
--
-- Idempotente: ricreare la function aggiorna il body senza dropare il trigger.

CREATE OR REPLACE FUNCTION public.notify_bando_subscribers_on_annunci()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    BEGIN
        PERFORM net.http_post(
            url := 'https://mhfbtltgwibwmsudsuvf.supabase.co/functions/v1/notify-bando-subscribers',
            headers := jsonb_build_object(
                'Content-Type',  'application/json',
                'Authorization', 'Bearer __SB_SECRET__'
            ),
            body := jsonb_build_object(
                'type',       TG_OP,
                'table',      TG_TABLE_NAME,
                'schema',     TG_TABLE_SCHEMA,
                'record',     to_jsonb(NEW),
                'old_record', CASE WHEN TG_OP = 'UPDATE' THEN to_jsonb(OLD) ELSE NULL END
            )
        );
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'notify_bando_subscribers_on_annunci: %', SQLERRM;
    END;
    RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_notify_bando_subscribers ON public.annunci;
CREATE TRIGGER trg_notify_bando_subscribers
    AFTER INSERT OR UPDATE OF status ON public.annunci
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_bando_subscribers_on_annunci();
