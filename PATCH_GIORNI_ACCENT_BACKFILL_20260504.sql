-- ============================================================
--  PATCH_GIORNI_ACCENT_BACKFILL_20260504.sql
--  Normalizza gli accenti dei giorni della settimana in annunci.giorni
--  (alcuni record erano salvati senza accento — "Lunedi" invece di "Lunedì").
--  Necessario per il nuovo filtro "Giorni del mercato": il match basato
--  su nome canonico richiede coerenza.
--
--  Idempotente. Applica solo ai record che cambierebbero.
-- ============================================================

update public.annunci
   set giorni =
        regexp_replace(
        regexp_replace(
        regexp_replace(
        regexp_replace(
        regexp_replace(
            giorni,
            'Lunedi(?!ì)',    'Lunedì',    'g'),
            'Martedi(?!ì)',   'Martedì',   'g'),
            'Mercoledi(?!ì)', 'Mercoledì', 'g'),
            'Giovedi(?!ì)',   'Giovedì',   'g'),
            'Venerdi(?!ì)',   'Venerdì',   'g')
 where giorni is not null
   and giorni ~ '(Lunedi|Martedi|Mercoledi|Giovedi|Venerdi)(?!ì)';

-- Report finale
select giorni, count(*) as cnt
from public.annunci
where giorni is not null and giorni <> '' and status = 'active'
group by giorni
order by cnt desc;
