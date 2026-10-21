-- Località più cercate negli ultimi 30 giorni, senza registri o dati personali.
-- Il client mostra tre link su desktop e quelli che entrano in una riga su mobile.
begin;
create or replace function public.home_top_location_searches()
returns table(name text, regione text, provincia text)
language sql stable security definer set search_path = '' as $$
    select e.name, e.regione, e.provincia
    from public.location_search_events e
    where e.created_at >= now() - interval '30 days'
    group by e.name, e.regione, e.provincia
    order by count(*) desc, e.name, e.regione, e.provincia
    limit 12;
$$;
revoke all on function public.home_top_location_searches() from public;
grant execute on function public.home_top_location_searches() to anon, authenticated;
commit;
