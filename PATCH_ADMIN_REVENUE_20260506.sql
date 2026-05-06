-- Admin revenue stats per dashboard (idempotente).
-- Bypassa la RLS owner-only di payments via SECURITY DEFINER + check is_admin.
-- Esclude di default tutto cio' che non e' status='succeeded' (le vetrine regalate
-- admin non passano nemmeno da payments — vanno direttamente su annunci.featured_tier='admin_free').

create or replace function public.admin_revenue_stats()
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
        'lifetime_cents', coalesce((
            select sum(amount_cents) from public.payments where status = 'succeeded'
        ), 0),
        'mtd_cents', coalesce((
            select sum(amount_cents) from public.payments
            where status = 'succeeded'
              and created_at >= date_trunc('month', now())
        ), 0),
        'count_paid', (
            select count(*) from public.payments where status = 'succeeded'
        ),
        'count_paid_mtd', (
            select count(*) from public.payments
            where status = 'succeeded'
              and created_at >= date_trunc('month', now())
        )
    ) into res;

    return res;
end;
$$;

grant execute on function public.admin_revenue_stats() to authenticated;
