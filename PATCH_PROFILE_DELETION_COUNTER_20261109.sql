-- Contatore aggregato delle cancellazioni effettive, senza identita personali.
-- Base iniziale: una cancellazione verificata prima dell'attivazione.
-- Lo storico precedente non e completo. Una riapplicazione non azzera il totale.
BEGIN;

CREATE SCHEMA IF NOT EXISTS account_private;
REVOKE ALL ON SCHEMA account_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA account_private TO service_role;

CREATE TABLE IF NOT EXISTS account_private.profile_deletion_counter (
    singleton boolean PRIMARY KEY DEFAULT true CHECK (singleton),
    total bigint NOT NULL DEFAULT 0 CHECK (total >= 0),
    verified_before_tracking bigint NOT NULL DEFAULT 0
        CHECK (verified_before_tracking >= 0 AND verified_before_tracking <= total),
    tracking_started_at timestamptz NOT NULL DEFAULT now(),
    last_deletion_at timestamptz,
    earlier_history_complete boolean NOT NULL DEFAULT false
);

ALTER TABLE account_private.profile_deletion_counter ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE account_private.profile_deletion_counter
    FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE account_private.profile_deletion_counter TO service_role;

INSERT INTO account_private.profile_deletion_counter (
    singleton, total, verified_before_tracking, last_deletion_at,
    earlier_history_complete
) VALUES (true, 1, 1, '2026-11-09T14:20:42.314Z', false)
ON CONFLICT (singleton) DO NOTHING;

CREATE OR REPLACE FUNCTION account_private.record_profile_deletion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $function$
BEGIN
    UPDATE account_private.profile_deletion_counter
       SET total = total + 1,
           last_deletion_at = clock_timestamp()
     WHERE singleton;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Contatore cancellazioni non disponibile';
    END IF;
    RETURN OLD;
END;
$function$;

REVOKE ALL ON FUNCTION account_private.record_profile_deletion()
    FROM PUBLIC, anon, authenticated, service_role;

DROP TRIGGER IF EXISTS count_profile_deletion ON public.profiles;
CREATE TRIGGER count_profile_deletion
AFTER DELETE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION account_private.record_profile_deletion();

COMMENT ON TABLE account_private.profile_deletion_counter IS
    'Conteggio aggregato: una cancellazione verificata iniziale, poi ogni DELETE di un profilo. Storico anteriore incompleto; nessun ID, nome o email conservato.';

COMMIT;
