-- ============================================================
--  PATCH_PHONE_NORMALIZE_BACKFILL_20260503.sql
--  Backfill one-shot: normalizza tutti i numeri telefono già nel DB
--  al formato canonico "347 1234567" (cellulare) / "06 1234567" (fisso),
--  identico a quello che il client (normalizePhone in js/data.js) salva
--  da oggi in poi per i nuovi inserimenti.
--
--  Effetto:
--   - "+393452749815"  -> "345 2749815"
--   - "3452749815"     -> "345 2749815"
--   - "0039 345 2749815" -> "345 2749815"
--   - "345 2749815"    -> "345 2749815" (no-op)
--
--  NB: il bottone Chiama funziona già anche senza questo backfill
--  (phoneToTelLink converte al click). Questa patch è SOLO per
--  consistenza/dedup/UI. Idempotente: rieseguibile senza danno.
-- ============================================================

-- 1. Funzione interna PL/pgSQL — stessa logica di normalizePhone() JS
create or replace function public._normalize_phone_canonical(raw text)
returns text
language plpgsql
immutable
as $$
declare
    s text;
begin
    if raw is null or raw = '' then
        return raw;
    end if;

    -- Strip spazi/trattini/punti/parentesi/slash
    s := regexp_replace(raw, '[\s\-\.\(\)\/]', '', 'g');

    -- Rimuovi prefissi internazionali italiani
    if s like '+390%' then
        s := '0' || substring(s from 5);
    elsif s like '+39%' then
        s := substring(s from 4);
    elsif s like '00390%' then
        s := '0' || substring(s from 6);
    elsif s like '0039%' then
        s := substring(s from 5);
    elsif s ~ '^39\d{10}$' then
        s := substring(s from 3);
    end if;

    -- Mobile italiano (3xx xxxxxxx) → spazio dopo prefisso 3 cifre
    if s ~ '^3\d{9}$' then
        s := substring(s from 1 for 3) || ' ' || substring(s from 4);
    end if;

    return s;
end;
$$;

-- 2. Backfill annunci.tel
update public.annunci
   set tel = public._normalize_phone_canonical(tel)
 where tel is not null
   and tel <> ''
   and tel is distinct from public._normalize_phone_canonical(tel);

-- 3. Backfill profiles.telefono
update public.profiles
   set telefono = public._normalize_phone_canonical(telefono)
 where telefono is not null
   and telefono <> ''
   and telefono is distinct from public._normalize_phone_canonical(telefono);

-- 4. Report finale (per vedere cosa è cambiato)
select
    'annunci.tel' as colonna,
    count(*) filter (where tel is not null and tel <> '')          as totali,
    count(distinct tel) filter (where tel is not null and tel <> '') as distinti
from public.annunci
union all
select
    'profiles.telefono' as colonna,
    count(*) filter (where telefono is not null and telefono <> '')          as totali,
    count(distinct telefono) filter (where telefono is not null and telefono <> '') as distinti
from public.profiles;
