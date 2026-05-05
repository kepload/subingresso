-- ============================================================
-- PATCH_RENEW_LISTING_20260505.sql
-- RPC per riattivare un annuncio scaduto (bumpa expires_at = now() + 200gg).
-- Idempotente, owner-only (auth.uid() = annuncio.user_id), bypass del trigger
-- enforce_annunci_status che blocca update featured*/status non-admin (qui
-- modifichiamo solo expires_at, fuori dal perimetro del trigger).
-- ============================================================

create or replace function public.renew_listing(p_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id    uuid;
    v_owner      uuid;
    v_status     text;
    v_new_expiry timestamptz;
    v_is_admin   boolean;
begin
    v_user_id := auth.uid();
    if v_user_id is null then
        return json_build_object('error', 'not_authenticated');
    end if;

    select user_id, status into v_owner, v_status
        from public.annunci where id = p_id;
    if v_owner is null then
        return json_build_object('error', 'not_found');
    end if;

    select coalesce((select is_admin from public.profiles where id = v_user_id), false)
        into v_is_admin;

    if v_owner <> v_user_id and not v_is_admin then
        return json_build_object('error', 'forbidden');
    end if;

    -- Permettiamo il rinnovo solo per annunci attivi/scaduti, NON per
    -- pending/rejected/deleted/sold (richiedono review o sono terminali).
    if v_status not in ('active') then
        return json_build_object('error', 'invalid_status', 'status', v_status);
    end if;

    v_new_expiry := now() + interval '200 days';

    update public.annunci
        set expires_at = v_new_expiry
        where id = p_id;

    return json_build_object(
        'ok', true,
        'expires_at', v_new_expiry
    );
end;
$$;

grant execute on function public.renew_listing(uuid) to authenticated;
