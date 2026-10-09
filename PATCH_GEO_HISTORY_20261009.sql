-- Archivio persistente dei soli conteggi giornalieri, senza sessioni/account.
begin;
create table if not exists public.geo_stats_daily (
 metric text not null check(metric in ('view','search')),
 day date not null, name text not null, regione text not null default '', provincia text not null default '',
 cnt bigint not null check(cnt >= 0),
 primary key(metric,day,name,regione,provincia)
);
alter table public.geo_stats_daily enable row level security;
revoke all on public.geo_stats_daily from public, anon, authenticated;
comment on table public.geo_stats_daily is 'Archivio permanente dei conteggi geografici giornalieri. Non cancellare con i log eventi; nessun identificativo utente/sessione.';

-- Blocca gli insert durante il recupero: nessun evento perso o contato due volte.
lock table public.page_views, public.location_search_events in share row exclusive mode;
do $$ begin
 if not exists(select 1 from pg_trigger where tgrelid='public.page_views'::regclass and tgname='geo_archive_view') then
  insert into public.geo_stats_daily(metric,day,name,regione,provincia,cnt)
  select 'view',(created_at at time zone 'UTC')::date,substring(path from '^/(?:comune|annunci)/([a-z0-9-]+)$'),'','',count(*)
  from public.page_views where path ~ '^/(comune|annunci)/[a-z0-9-]+$'
  group by 2,3 on conflict do nothing;
 end if;
 if not exists(select 1 from pg_trigger where tgrelid='public.location_search_events'::regclass and tgname='geo_archive_search') then
  insert into public.geo_stats_daily(metric,day,name,regione,provincia,cnt)
  select 'search',(created_at at time zone 'UTC')::date,name,regione,provincia,count(*)
  from public.location_search_events group by 2,3,4,5 on conflict do nothing;
 end if;
end $$;
create or replace function public.archive_geo_event()
returns trigger language plpgsql security definer set search_path='' as $$
declare v_metric text; v_name text; v_region text := ''; v_province text := '';
begin
 if tg_table_name='page_views' then
  if new.path !~ '^/(comune|annunci)/[a-z0-9-]+$' then return new; end if;
  v_metric := 'view'; v_name := substring(new.path from '^/(?:comune|annunci)/([a-z0-9-]+)$');
 else
  v_metric := 'search'; v_name := new.name; v_region := new.regione; v_province := new.provincia;
 end if;
 insert into public.geo_stats_daily(metric,day,name,regione,provincia,cnt)
 values(v_metric,(new.created_at at time zone 'UTC')::date,v_name,v_region,v_province,1)
 on conflict(metric,day,name,regione,provincia) do update set cnt=public.geo_stats_daily.cnt+1;
 return new;
end $$;
revoke all on function public.archive_geo_event() from public,anon,authenticated;
drop trigger if exists geo_archive_view on public.page_views;
create trigger geo_archive_view after insert on public.page_views for each row execute function public.archive_geo_event();
drop trigger if exists geo_archive_search on public.location_search_events;
create trigger geo_archive_search after insert on public.location_search_events for each row execute function public.archive_geo_event();

-- 0 = tutto lo storico; finestre di giorni UTC, incluso oggi.
create or replace function public.admin_top_comuni_views(p_days integer default 30)
returns json language plpgsql security definer set search_path='' as $$
declare result json;
begin
 if not coalesce((select is_admin from public.profiles where id=auth.uid()),false) then return json_build_object('error','forbidden'); end if;
 select coalesce(json_agg(t order by t.cnt desc,t.slug),'[]'::json) into result from (
  select name as slug,sum(cnt)::bigint as cnt from public.geo_stats_daily where metric='view'
  and (p_days=0 or day >= (now() at time zone 'UTC')::date - (greatest(1,least(coalesce(p_days,30),365))-1))
  group by name order by cnt desc,name limit 10
 ) t; return result;
end $$;
create or replace function public.admin_top_location_searches(p_days integer default 30)
returns json language plpgsql security definer set search_path='' as $$
declare result json;
begin
 if not coalesce((select is_admin from public.profiles where id=auth.uid()),false) then return json_build_object('error','forbidden'); end if;
 select coalesce(json_agg(t order by t.cnt desc,t.name),'[]'::json) into result from (
  select name,provincia,regione,sum(cnt)::bigint as cnt from public.geo_stats_daily where metric='search'
  and (p_days=0 or day >= (now() at time zone 'UTC')::date - (greatest(1,least(coalesce(p_days,30),365))-1))
  group by name,provincia,regione order by cnt desc,name limit 10
 ) t; return result;
end $$;
revoke all on function public.admin_top_comuni_views(integer),public.admin_top_location_searches(integer) from public,anon;
grant execute on function public.admin_top_comuni_views(integer),public.admin_top_location_searches(integer) to authenticated;
commit;
