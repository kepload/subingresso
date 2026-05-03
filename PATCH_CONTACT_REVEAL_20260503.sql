-- ============================================================
--  PATCH_CONTACT_REVEAL_20260503.sql
--  Soft fix scraping massivo annunci.tel/email da authenticated:
--   - revoke tel/email su annunci da authenticated
--   - RPC get_listing_contact(p_annuncio_id) con:
--       - owner bypass (sempre vede il proprio)
--       - admin bypass
--       - rate-limit silenzioso 50 unique reveal/ora per utente
--       - log su contact_reveals (audit + analytics futuri)
--   - tabella contact_reveals con RLS owner-or-seller-or-admin
--
--  Effetto utente: zero. La pagina annuncio chiama l'RPC al posto
--  della select diretta, l'utente vede tel/email come prima.
--  Effetto scraper: blocca dopo 50 annunci unici/ora.
--
--  NB: profiles.telefono resta accessibile a authenticated per non
--  rompere mille altre query (vendi.html prefill, dashboard, ecc).
--  Il vector primario di scraping era annunci.tel/email — quello
--  che lega telefono ad annuncio specifico — ed è chiuso.
-- ============================================================

-- 1. Tabella contact_reveals (audit + rate-limit)
create table if not exists public.contact_reveals (
    id           bigserial primary key,
    revealer_id  uuid not null references auth.users(id) on delete cascade,
    annuncio_id  uuid not null references public.annunci(id) on delete cascade,
    seller_id    uuid not null references auth.users(id) on delete cascade,
    created_at   timestamptz not null default now(),
    unique (revealer_id, annuncio_id)
);

create index if not exists contact_reveals_revealer_created_idx
    on public.contact_reveals (revealer_id, created_at desc);
create index if not exists contact_reveals_seller_created_idx
    on public.contact_reveals (seller_id, created_at desc);

alter table public.contact_reveals enable row level security;

drop policy if exists contact_reveals_select on public.contact_reveals;
create policy contact_reveals_select on public.contact_reveals
    for select to authenticated
    using (
        revealer_id = auth.uid()
        or seller_id = auth.uid()
        or exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
    );

-- 2. Revoke tel/email su annunci da authenticated.
--    Authenticated può continuare a leggere tutto il resto dell'annuncio.
revoke select on public.annunci from authenticated;
grant select (
    id, user_id, titolo, descrizione, stato, categoria, tipo, settore,
    dettagli_extra, regione, provincia, comune, superficie, giorni, prezzo,
    contatto, data, status, created_at, img_urls, expires_at, visualizzazioni,
    featured, featured_until, featured_tier, featured_since, tel_clicks, video_url
) on public.annunci to authenticated;

-- 3. RPC get_listing_contact: rivela tel/email/telefono per un singolo annuncio
create or replace function public.get_listing_contact(p_annuncio_id uuid)
returns table (tel text, email text, seller_telefono text)
language plpgsql
security definer
set search_path = public
as $$
declare
    v_user_id   uuid;
    v_seller_id uuid;
    v_is_admin  boolean;
    v_count     int;
begin
    v_user_id := auth.uid();
    if v_user_id is null then
        raise exception 'Login richiesto' using errcode = '42501';
    end if;

    -- Verifica esistenza annuncio (e ottiene seller_id)
    select a.user_id into v_seller_id
    from public.annunci a
    where a.id = p_annuncio_id and a.status = 'active';

    if v_seller_id is null then
        raise exception 'Annuncio non trovato' using errcode = 'P0002';
    end if;

    -- Bypass owner: nessun rate limit, nessun log
    if v_seller_id = v_user_id then
        return query
        select a.tel, a.email, p.telefono
        from public.annunci a
        left join public.profiles p on p.id = a.user_id
        where a.id = p_annuncio_id;
        return;
    end if;

    -- Bypass admin: nessun rate limit, nessun log
    select coalesce(p.is_admin, false) into v_is_admin
    from public.profiles p where p.id = v_user_id;

    if v_is_admin then
        return query
        select a.tel, a.email, p.telefono
        from public.annunci a
        left join public.profiles p on p.id = a.user_id
        where a.id = p_annuncio_id;
        return;
    end if;

    -- Rate limit: max 50 reveal UNIQUE per ora.
    -- ON CONFLICT DO NOTHING fa sì che riaprire lo stesso annuncio non
    -- consumi quota → l'utente normale non sente il limite.
    select count(*) into v_count
    from public.contact_reveals
    where revealer_id = v_user_id
      and created_at > now() - interval '1 hour';

    if v_count >= 50 then
        raise exception 'Hai raggiunto il limite di richieste contatti. Riprova tra un''ora.'
            using errcode = '42501';
    end if;

    -- Log reveal (idempotente per coppia revealer/annuncio)
    insert into public.contact_reveals (revealer_id, annuncio_id, seller_id)
    values (v_user_id, p_annuncio_id, v_seller_id)
    on conflict (revealer_id, annuncio_id) do nothing;

    return query
    select a.tel, a.email, p.telefono
    from public.annunci a
    left join public.profiles p on p.id = a.user_id
    where a.id = p_annuncio_id;
end;
$$;

revoke all     on function public.get_listing_contact(uuid) from public;
revoke all     on function public.get_listing_contact(uuid) from anon;
grant  execute on function public.get_listing_contact(uuid) to authenticated;

notify pgrst, 'reload schema';
