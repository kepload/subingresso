-- ============================================================
--  Top 10 comuni per page_views (ultimi 30 giorni).
--  Usato dal mini-pannello admin in dashboard.html.
--  Dopo il rollback /comune → /annunci (2 mag 2026), traccia path
--  /annunci/<slug> invece di /comune/<slug>.
--  Esegui questa patch nel SQL Editor di Supabase per aggiornarla.
-- ============================================================

create or replace function public.admin_top_comuni_views(p_days integer default 30)
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

    select coalesce(json_agg(row_to_json(t) order by t.cnt desc), '[]'::json) into res
    from (
        select
            substring(path from '^/annunci/([a-z0-9-]+)$') as slug,
            count(*)::int                                  as cnt
        from public.page_views
        where path like '/annunci/%'
          and path ~ '^/annunci/[a-z0-9-]+$'
          and created_at >= (now() - (p_days || ' days')::interval)
        group by slug
        having substring(path from '^/annunci/([a-z0-9-]+)$') is not null
        order by cnt desc
        limit 10
    ) t;

    return res;
end;
$$;

grant execute on function public.admin_top_comuni_views(integer) to authenticated;
