-- Nuove impostazioni: anticipo minimo di due mesi. Scelte esistenti conservate.
BEGIN;
DO $patch$
DECLARE definition text; updated text;
BEGIN
 definition := pg_get_functiondef('public.save_fair(jsonb,integer)'::regprocedure);
 IF strpos(definition, 'IF enabled AND months < 2 THEN') = 0 THEN
  updated := replace(definition, ' IF enabled THEN', E' IF enabled AND months < 2 THEN\n  RAISE EXCEPTION ''Scegli da 2 a 120 mesi di anticipo.'' USING ERRCODE=''22023'';\n END IF;\n IF enabled THEN');
  IF updated = definition THEN RAISE EXCEPTION 'Guardia save_fair non riconosciuta; nessuna modifica applicata.'; END IF;
  EXECUTE updated;
 END IF;
END $patch$;
NOTIFY pgrst, 'reload schema';
COMMIT;
