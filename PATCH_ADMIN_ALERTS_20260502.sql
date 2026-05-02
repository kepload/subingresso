-- Tabella di log per gli anomaly check + cron schedulato.
-- Protegge anche da spam: la edge function consulta l'ultima riga
-- prima di inviare un'email per fare rate-limit interno.

create table if not exists public.admin_alerts_log (
    id           bigserial primary key,
    checked_at   timestamptz not null default now(),
    issues_count int         not null default 0,
    issues       jsonb,
    notified     boolean     not null default false
);

create index if not exists admin_alerts_log_checked_at_idx
    on public.admin_alerts_log (checked_at desc);

alter table public.admin_alerts_log enable row level security;

drop policy if exists admin_alerts_log_select_admin on public.admin_alerts_log;
create policy admin_alerts_log_select_admin on public.admin_alerts_log
    for select to authenticated
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Schedule cron giornaliero ore 09:00 UTC (= 11:00 ora estiva IT, 10:00 invernale)
-- Riusa il pattern dei cron weekly-*: net.http_post a edge function deployata
-- con --no-verify-jwt.
do $$
begin
    perform cron.unschedule('admin-anomaly-check');
exception when others then
    null;
end $$;

select cron.schedule(
    'admin-anomaly-check',
    '0 9 * * *',
    $cmd$
    select net.http_post(
        url := 'https://mhfbtltgwibwmsudsuvf.supabase.co/functions/v1/admin-anomaly-check',
        headers := '{"Content-Type":"application/json"}'::jsonb,
        body := '{}'::jsonb
    );
    $cmd$
);
