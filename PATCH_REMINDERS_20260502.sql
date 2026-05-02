-- Tabella log per dedup invii reminder (idempotenza).
-- Una riga per (user_id, kind) garantisce zero invii duplicati anche
-- se la cron viene riavviata o gira più volte.

create table if not exists public.email_reminder_log (
    id         bigserial primary key,
    user_id    uuid not null,
    kind       text not null check (kind in ('day3','day7')),
    sent_at    timestamptz not null default now(),
    success    boolean not null default true,
    error_msg  text,
    constraint email_reminder_log_user_kind_unique unique (user_id, kind)
);

create index if not exists email_reminder_log_sent_at_idx
    on public.email_reminder_log (sent_at desc);

alter table public.email_reminder_log enable row level security;

drop policy if exists email_reminder_log_select_admin on public.email_reminder_log;
create policy email_reminder_log_select_admin on public.email_reminder_log
    for select to authenticated
    using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin));

-- Cron giornaliero alle 10:00 UTC (= 12:00 ora estiva IT).
-- Volutamente diverso da admin-anomaly-check (09:00) per non sovrapporre.
do $$
begin
    perform cron.unschedule('engagement-reminders');
exception when others then
    null;
end $$;

select cron.schedule(
    'engagement-reminders',
    '0 10 * * *',
    $cmd$
    select net.http_post(
        url := 'https://mhfbtltgwibwmsudsuvf.supabase.co/functions/v1/engagement-reminders',
        headers := '{"Content-Type":"application/json"}'::jsonb,
        body := '{}'::jsonb
    );
    $cmd$
);
