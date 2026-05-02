-- Admin funnel stats RPC (idempotente).
-- Ritorna i 5 step del funnel sia all-time sia ultimi 30 giorni.
-- Protetto da check is_admin (security definer).

create or replace function public.admin_funnel_stats()
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
        'all_time', json_build_object(
            'signups', (select count(*) from public.profiles),
            'profile_complete', (
                select count(*) from public.profiles
                where telefono is not null and telefono <> ''
            ),
            'first_listing', (
                select count(distinct user_id) from public.annunci
                where status <> 'deleted' and user_id is not null
            ),
            'first_contact_received', (
                select count(distinct venditore_id) from public.conversazioni
                where venditore_id is not null
            ),
            'first_message_sent', (
                select count(distinct mittente_id) from public.messaggi
                where mittente_id is not null
            )
        ),
        'last_30_days', json_build_object(
            'signups', (
                select count(*) from public.profiles
                where created_at >= now() - interval '30 days'
            ),
            'profile_complete', (
                select count(*) from public.profiles
                where created_at >= now() - interval '30 days'
                  and telefono is not null and telefono <> ''
            ),
            'first_listing', (
                select count(distinct a.user_id) from public.annunci a
                join public.profiles p on p.id = a.user_id
                where a.status <> 'deleted'
                  and a.user_id is not null
                  and p.created_at >= now() - interval '30 days'
            ),
            'first_contact_received', (
                select count(distinct c.venditore_id) from public.conversazioni c
                join public.profiles p on p.id = c.venditore_id
                where c.venditore_id is not null
                  and p.created_at >= now() - interval '30 days'
            ),
            'first_message_sent', (
                select count(distinct m.mittente_id) from public.messaggi m
                join public.profiles p on p.id = m.mittente_id
                where m.mittente_id is not null
                  and p.created_at >= now() - interval '30 days'
            )
        )
    ) into res;
    return res;
end;
$$;

grant execute on function public.admin_funnel_stats() to authenticated;
