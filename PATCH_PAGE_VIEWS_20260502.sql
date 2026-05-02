-- Page views tracking (idempotente)
-- Tracks anonymous + logged page views site-wide.
-- Read-only by admins; insert open to anon (RLS).

create table if not exists public.page_views (
    id          bigserial primary key,
    path        text not null check (length(path) <= 250),
    visitor_id  text check (length(visitor_id) <= 80),
    session_id  text check (length(session_id) <= 80),
    referrer    text check (length(referrer) <= 300),
    created_at  timestamptz not null default now()
);

create index if not exists page_views_created_at_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx       on public.page_views (path);

alter table public.page_views enable row level security;

drop policy if exists page_views_insert_public on public.page_views;
create policy page_views_insert_public on public.page_views
    for insert
    to anon, authenticated
    with check (true);

drop policy if exists page_views_select_admin on public.page_views;
create policy page_views_select_admin on public.page_views
    for select
    to authenticated
    using (
        exists (
            select 1 from public.profiles p
            where p.id = auth.uid() and p.is_admin = true
        )
    );

create or replace function public.admin_page_views_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
    is_adm boolean;
    res    json;
begin
    select coalesce((select is_admin from public.profiles where id = auth.uid()), false)
        into is_adm;
    if not is_adm then
        return json_build_object('error', 'forbidden');
    end if;

    select json_build_object(
        'total', (select count(*) from public.page_views),
        'today', (select count(*) from public.page_views where created_at >= date_trunc('day', now())),
        'monthly_12', (
            select coalesce(json_agg(json_build_object('bucket', bucket, 'count', cnt) order by bucket), '[]'::json)
            from (
                select date_trunc('month', created_at) as bucket, count(*)::int as cnt
                from public.page_views
                where created_at >= (date_trunc('month', now()) - interval '11 months')
                group by 1
            ) t
        ),
        'all_monthly', (
            select coalesce(json_agg(json_build_object('bucket', bucket, 'count', cnt) order by bucket), '[]'::json)
            from (
                select date_trunc('month', created_at) as bucket, count(*)::int as cnt
                from public.page_views
                group by 1
            ) t
        ),
        'yearly', (
            select coalesce(json_agg(json_build_object('bucket', bucket, 'count', cnt) order by bucket), '[]'::json)
            from (
                select date_trunc('year', created_at) as bucket, count(*)::int as cnt
                from public.page_views
                group by 1
            ) t
        ),
        'daily_30', (
            select coalesce(json_agg(json_build_object('bucket', bucket, 'count', cnt) order by bucket), '[]'::json)
            from (
                select date_trunc('day', created_at) as bucket, count(*)::int as cnt
                from public.page_views
                where created_at >= (now() - interval '30 days')
                group by 1
            ) t
        )
    ) into res;

    return res;
end;
$$;

grant execute on function public.admin_page_views_stats() to authenticated;
