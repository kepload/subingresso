-- ============================================================
--  PATCH_ADMIN_LISTINGS_REGIONE_20260503.sql
--  RPC per pannello "Annunci per regione" nella dashboard admin.
--  Ritorna [{regione, count}] degli annunci attivi, ordinato per
--  count desc.
-- ============================================================

create or replace function public.admin_listings_per_regione()
returns table (regione text, cnt bigint)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo admin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  return query
  select
    coalesce(nullif(trim(a.regione), ''), 'Senza regione') as regione,
    count(*)::bigint as cnt
  from public.annunci a
  where a.status = 'active'
  group by 1
  order by cnt desc, regione asc;
end;
$$;

revoke all     on function public.admin_listings_per_regione() from public;
revoke all     on function public.admin_listings_per_regione() from anon;
grant  execute on function public.admin_listings_per_regione() to authenticated;
