-- ============================================================
--  PATCH_ADMIN_SECURITY_OVERVIEW_20260503.sql
--  RPC SECURITY DEFINER per il pannello "Sicurezza & Anomalie"
--  della dashboard admin.
--
--  Aggrega in un'unica chiamata:
--   - conteggi signup (1h / 24h / 7g) e non confermati 24h
--   - account sospetti (pattern probe/scanner) ultimi 7g
--   - ultime 10 entries di admin_alerts_log
--   - timestamp dell'ultimo anomaly check
--
--  Esegui in Supabase SQL Editor o via CLI:
--    ./scripts/.bin/supabase.exe db query --linked --file PATCH_ADMIN_SECURITY_OVERVIEW_20260503.sql
-- ============================================================

create or replace function public.admin_security_overview()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  result jsonb;
begin
  -- Solo admin
  if not exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Forbidden' using errcode = '42501';
  end if;

  with
    signup_counts as (
      select
        (select count(*) from auth.users where created_at > now() - interval '1 hour')   as last_hour,
        (select count(*) from auth.users where created_at > now() - interval '24 hours') as last_24h,
        (select count(*) from auth.users where created_at > now() - interval '7 days')   as last_7d,
        (select count(*) from auth.users
           where created_at > now() - interval '24 hours'
             and email_confirmed_at is null)                                              as unconfirmed_24h
    ),
    suspects as (
      select id, email, created_at, email_confirmed_at, last_sign_in_at
      from auth.users
      where created_at > now() - interval '7 days'
        and (
          -- TLD finti / di test (RFC 2606)
          email ~* '\.(invalid|test|local|example)$'
          -- domini email usa-e-getta noti
          or email ~* '@(temp|tempmail|10minute|10minutemail|guerrilla|mailinator|yopmail|throwaway|sharklasers|getnada|maildrop|trashmail|fakemail|pwned)'
          -- pattern script: parola_unixtimestamp@dominio
          or email ~ '^[a-z]+_[0-9]{9,11}'
          -- keyword tipiche di tester di sicurezza
          or email ~* '(rlstest|hunter_|probe_|owasp|sqlmap|injection|xsstest|admin\+test|burpcollab)'
        )
      order by created_at desc
      limit 20
    ),
    recent_alerts as (
      select id, checked_at, issues_count, issues, notified
      from public.admin_alerts_log
      order by checked_at desc
      limit 10
    )
  select jsonb_build_object(
    'signups_last_hour', (select last_hour       from signup_counts),
    'signups_last_24h',  (select last_24h        from signup_counts),
    'signups_last_7d',   (select last_7d         from signup_counts),
    'unconfirmed_24h',   (select unconfirmed_24h from signup_counts),
    'suspect_signups',   coalesce((select jsonb_agg(jsonb_build_object(
        'id',         id,
        'email',      email,
        'created_at', created_at,
        'confirmed',  email_confirmed_at is not null,
        'signed_in',  last_sign_in_at is not null
    )) from suspects), '[]'::jsonb),
    'recent_alerts',     coalesce((select jsonb_agg(jsonb_build_object(
        'id',           id,
        'checked_at',   checked_at,
        'issues_count', issues_count,
        'issues',       coalesce(issues, '[]'::jsonb),
        'notified',     notified
    )) from recent_alerts), '[]'::jsonb),
    'last_anomaly_check', (
      select checked_at from public.admin_alerts_log
      order by checked_at desc limit 1
    ),
    'generated_at', now()
  ) into result;

  return result;
end;
$$;

revoke all     on function public.admin_security_overview() from public;
revoke all     on function public.admin_security_overview() from anon;
grant  execute on function public.admin_security_overview() to authenticated;
