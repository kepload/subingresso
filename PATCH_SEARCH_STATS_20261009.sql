-- Ricerche geografiche effettive: nessun testo libero o dato account.
begin;
create table if not exists public.location_search_events (
    session_id uuid not null,
    name text not null,
    regione text not null,
    provincia text not null,
    created_at timestamptz not null default now(),
    primary key (session_id, name, regione, provincia)
);
create index if not exists location_search_events_date on public.location_search_events(created_at);
alter table public.location_search_events enable row level security;
revoke all on public.location_search_events from public, anon, authenticated;

create or replace function public.track_location_search(p_session uuid, p_name text, p_regione text, p_provincia text)
returns void language plpgsql security definer set search_path = '' as $$
begin
    if p_session is null then return; end if;
    if not exists (select 1 from data_quality.locations
        where name = p_name and regione = p_regione and provincia = p_provincia) then return; end if;
    -- Limite per sessione, deduplica anche quando cambiano gli altri filtri.
    if (select count(*) from public.location_search_events where session_id = p_session) >= 100 then return; end if;
    insert into public.location_search_events(session_id, name, regione, provincia)
    values(p_session, p_name, p_regione, p_provincia) on conflict do nothing;
end;
$$;
revoke all on function public.track_location_search(uuid,text,text,text) from public;
grant execute on function public.track_location_search(uuid,text,text,text) to anon, authenticated;

create or replace function public.admin_top_location_searches(p_days integer default 30)
returns json language plpgsql security definer set search_path = '' as $$
declare result json;
begin
    if not coalesce((select is_admin from public.profiles where id = auth.uid()), false) then
        return json_build_object('error','forbidden');
    end if;
    select coalesce(json_agg(t order by t.cnt desc, t.name), '[]'::json) into result from (
        select name, provincia, regione, count(*)::integer as cnt
        from public.location_search_events
        where created_at >= now() - make_interval(days => greatest(1, least(coalesce(p_days,30),365)))
        group by name, provincia, regione order by cnt desc, name limit 10
    ) t;
    return result;
end;
$$;
revoke all on function public.admin_top_location_searches(integer) from public;
grant execute on function public.admin_top_location_searches(integer) to authenticated;
commit;
