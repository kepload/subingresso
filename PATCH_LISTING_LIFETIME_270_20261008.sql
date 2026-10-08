-- Durata annunci: 270 giorni per pubblicazione e rinnovo.
-- Lo storico attivo/in revisione riceve almeno 270 giorni dalla pubblicazione
-- e 70 giorni in più rispetto alla scadenza precedente. Vetrine invariate.
-- Backup privato delle date e applicazione dello storico una sola volta.
BEGIN;
SET LOCAL lock_timeout='5s';
LOCK TABLE public.annunci IN SHARE ROW EXCLUSIVE MODE;

DO $policy$
DECLARE target regprocedure; definition text; old_interval text := 'interval ''200 days''';
BEGIN
  FOREACH target IN ARRAY ARRAY['data_quality.guard_listing()'::regprocedure,'public.renew_listing(uuid)'::regprocedure] LOOP
    definition := pg_get_functiondef(target);
    IF position(old_interval IN definition)>0 THEN
      IF (length(definition)-length(replace(definition,old_interval,'')))/length(old_interval)<>1 THEN
        RAISE EXCEPTION 'Durata inattesa nella funzione %',target;
      END IF;
      EXECUTE replace(definition,old_interval,'interval ''270 days''');
    ELSIF position('interval ''270 days''' IN definition)=0 THEN
      RAISE EXCEPTION 'Durata da verificare nella funzione %',target;
    END IF;
  END LOOP;
END $policy$;

ALTER TABLE public.annunci ALTER COLUMN expires_at SET DEFAULT (now()+interval '270 days');

DO $history$
BEGIN
  IF to_regclass('data_quality.listing_expiry_270_backup') IS NULL THEN
    CREATE TABLE data_quality.listing_expiry_270_backup AS
      SELECT a.id,a.expires_at AS previous_expiry,
        greatest(a.expires_at+interval '70 days',a.created_at+interval '270 days') AS next_expiry,
        md5((to_jsonb(a)-'expires_at')::text) AS other_fields_hash,now() AS applied_at
      FROM public.annunci a WHERE NOT a.is_demo AND a.status IN ('active','pending');
    ALTER TABLE data_quality.listing_expiry_270_backup ADD PRIMARY KEY(id);
    REVOKE ALL ON TABLE data_quality.listing_expiry_270_backup FROM PUBLIC,anon,authenticated;
    IF EXISTS(SELECT 1 FROM data_quality.listing_expiry_270_backup WHERE next_expiry IS NULL OR next_expiry<previous_expiry) THEN
      RAISE EXCEPTION 'Scadenze storiche non prolungabili';
    END IF;
    UPDATE public.annunci a SET expires_at=b.next_expiry
      FROM data_quality.listing_expiry_270_backup b WHERE a.id=b.id AND a.expires_at IS DISTINCT FROM b.next_expiry;
    IF EXISTS(SELECT 1 FROM public.annunci a JOIN data_quality.listing_expiry_270_backup b USING(id)
      WHERE a.expires_at IS DISTINCT FROM b.next_expiry OR md5((to_jsonb(a)-'expires_at')::text)<>b.other_fields_hash) THEN
      RAISE EXCEPTION 'Modificati campi diversi dalla scadenza: annullamento';
    END IF;
  END IF;
END $history$;
COMMIT;
