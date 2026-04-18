-- ============================================================
--  SUBINGRESSO.IT — SETUP COMPLETO E DEFINITIVO (2026)
--  Istruzioni: Incolla tutto in Supabase SQL Editor e premi RUN.
--  Questo file può essere eseguito più volte senza errori.
-- ============================================================

-- ── 1. PULIZIA PRELIMINARE (Opzionale, garantisce zero errori)
-- Non cancelliamo le tabelle per non perdere dati, ma resettiamo le funzioni e trigger

-- ── 2. PROFILI UTENTI ──────────────────────────────────────
create table if not exists public.profiles (
    id          uuid references auth.users(id) on delete cascade primary key,
    nome        text,
    cognome     text,
    telefono    text,
    avatar_url  text,
    created_at  timestamptz default now()
);

-- Funzione per creare profilo automatico
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nome, cognome, telefono)
  values (
    new.id,
    new.raw_user_meta_data->>'nome',
    new.raw_user_meta_data->>'cognome',
    new.raw_user_meta_data->>'telefono'
  )
  on conflict (id) do update set
    nome = excluded.nome,
    cognome = excluded.cognome,
    telefono = excluded.telefono;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 3. ANNUNCI (Relazione corretta con Profiles) ────────────
create table if not exists public.annunci (
    id          uuid default gen_random_uuid() primary key,
    user_id     uuid references public.profiles(id) on delete cascade not null,
    titolo      text not null,
    descrizione text,
    stato       text default 'Vendita',
    categoria   text default 'Mercati',
    tipo        text,
    settore     text,
    dettagli_extra jsonb,
    regione     text,
    provincia   text,
    comune      text,
    superficie  numeric,
    giorni      text,
    prezzo      numeric,
    contatto    text,
    tel         text,
    email       text,
    img_urls    text[],
    expires_at  timestamptz,
    status      text default 'pending', -- pending / active / sold / deleted
    created_at  timestamptz default now()
);

create index if not exists annunci_status_idx    on public.annunci(status);
create index if not exists annunci_user_id_idx   on public.annunci(user_id);


-- ── 4. CONVERSAZIONI & MESSAGGI ─────────────────────────────
create table if not exists public.conversazioni (
    id              uuid default gen_random_uuid() primary key,
    annuncio_id     uuid references public.annunci(id) on delete cascade not null,
    acquirente_id   uuid references public.profiles(id) on delete cascade not null,
    venditore_id    uuid references public.profiles(id) on delete cascade not null,
    created_at      timestamptz default now(),
    unique(annuncio_id, acquirente_id),
    constraint conversazioni_acquirente_id_fkey foreign key (acquirente_id) references public.profiles(id) on delete cascade,
    constraint conversazioni_venditore_id_fkey foreign key (venditore_id) references public.profiles(id) on delete cascade
);

create table if not exists public.messaggi (
    id                  uuid default gen_random_uuid() primary key,
    conversazione_id    uuid references public.conversazioni(id) on delete cascade not null,
    mittente_id         uuid references public.profiles(id) on delete cascade not null,
    testo               text not null,
    letto               boolean default false,
    created_at          timestamptz default now()
);


-- ── 5. BLOG (Robot IA) ──────────────────────────────────────
create table if not exists public.blog_posts (
    id          uuid default gen_random_uuid() primary key,
    slug        text unique not null,
    title       text not null,
    excerpt     text,
    content     text not null,
    category    text default 'Tecnico',
    author      text default 'Robot IA',
    published_at timestamptz default now()
);


-- ── 6. SICUREZZA (Row Level Security) ───────────────────────
alter table public.profiles      enable row level security;
alter table public.annunci       enable row level security;
alter table public.conversazioni enable row level security;
alter table public.messaggi      enable row level security;
alter table public.blog_posts    enable row level security;

-- Reset e creazione Policy Profili
drop policy if exists "Lettura pubblica profili" on public.profiles;
drop policy if exists "Tutti possono leggere i profili" on public.profiles;
create policy "Lettura pubblica profili" on public.profiles for select using (true);

drop policy if exists "Update proprio profilo" on public.profiles;
drop policy if exists "Utente modifica solo il proprio profilo" on public.profiles;
create policy "Update proprio profilo" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Inserimento profilo" on public.profiles;
drop policy if exists "Trigger inserisce profilo" on public.profiles;
create policy "Inserimento profilo" on public.profiles for insert with check (true);

-- Policy Annunci
drop policy if exists "Lettura pubblica annunci" on public.annunci;
drop policy if exists "Tutti possono vedere gli annunci attivi" on public.annunci;
create policy "Lettura pubblica annunci" on public.annunci for select using (status = 'active' or auth.uid() = user_id or auth.email() = 'kycykuardit@gmail.com');

drop policy if exists "Inserimento annunci" on public.annunci;
create policy "Inserimento annunci" on public.annunci for insert with check (auth.uid() = user_id);

drop policy if exists "Gestione propri annunci" on public.annunci;
create policy "Gestione propri annunci" on public.annunci for update using (auth.uid() = user_id or auth.email() = 'kycykuardit@gmail.com');

-- Policy Blog
drop policy if exists "Lettura pubblica blog" on public.blog_posts;
create policy "Lettura pubblica blog" on public.blog_posts for select using (true);

-- ── 7. REALTIME ─────────────────────────────────────────────
-- Aggiunge le tabelle alla replica in tempo reale (se non già presenti)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messaggi') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messaggi;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'conversazioni') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.conversazioni;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'blog_posts') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
    END IF;
END $$;

-- ── 8. STORAGE BUCKETS ──────────────────────────────────────
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true) on conflict do nothing;
insert into storage.buckets (id, name, public) values ('listings', 'listings', true) on conflict do nothing;

drop policy if exists "Avatar pubblici leggibili" on storage.objects;
create policy "Avatar pubblici leggibili" on storage.objects for select using (bucket_id = 'avatars');
drop policy if exists "Utente carica proprio avatar" on storage.objects;
create policy "Utente carica proprio avatar" on storage.objects for insert with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
drop policy if exists "Utente aggiorna proprio avatar" on storage.objects;
create policy "Utente aggiorna proprio avatar" on storage.objects for update using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "Listings pubblici leggibili" on storage.objects;
create policy "Listings pubblici leggibili" on storage.objects for select using (bucket_id = 'listings');
drop policy if exists "Utente carica immagini annuncio" on storage.objects;
create policy "Utente carica immagini annuncio" on storage.objects for insert with check (bucket_id = 'listings' and auth.uid() is not null);


-- ── 9. POLICY CONVERSAZIONI & MESSAGGI ──────────────────────
drop policy if exists "Lettura conversazioni proprie" on public.conversazioni;
create policy "Lettura conversazioni proprie" on public.conversazioni for select using (auth.uid() = acquirente_id or auth.uid() = venditore_id);
drop policy if exists "Inserimento conversazioni" on public.conversazioni;
create policy "Inserimento conversazioni" on public.conversazioni for insert with check (auth.uid() = acquirente_id);

drop policy if exists "Lettura messaggi propri" on public.messaggi;
create policy "Lettura messaggi propri" on public.messaggi
  for select using (
    exists (
      select 1 from public.conversazioni c
      where c.id = conversazione_id
        and (c.acquirente_id = auth.uid() or c.venditore_id = auth.uid())
    )
  );
drop policy if exists "Inserimento messaggi" on public.messaggi;
create policy "Inserimento messaggi" on public.messaggi
  for insert with check (
    auth.uid() = mittente_id and
    exists (
      select 1 from public.conversazioni c
      where c.id = conversazione_id
        and (c.acquirente_id = auth.uid() or c.venditore_id = auth.uid())
    )
  );
drop policy if exists "Aggiornamento messaggi letti" on public.messaggi;
create policy "Aggiornamento messaggi letti" on public.messaggi
  for update using (
    exists (
      select 1 from public.conversazioni c
      where c.id = conversazione_id
        and (c.acquirente_id = auth.uid() or c.venditore_id = auth.uid())
    )
  );


-- ── 10. TRIGGER STATUS ANNUNCI (Admin bypass) ────────────────
create or replace function public.enforce_annunci_status()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' then
    if (select email from auth.users where id = auth.uid()) != 'kycykuardit@gmail.com' then
      new.status := 'pending';
    end if;
  end if;
  if tg_op = 'UPDATE' then
    if (select email from auth.users where id = auth.uid()) != 'kycykuardit@gmail.com' then
      if old.status = 'pending' and new.status = 'active' then
        new.status := 'pending';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_annunci_status on public.annunci;
create trigger trg_enforce_annunci_status
  before insert or update on public.annunci
  for each row execute procedure public.enforce_annunci_status();


-- ── 11. ALERTS (Notifiche per nuovi annunci) ─────────────────
create table if not exists public.alerts (
    id         uuid default gen_random_uuid() primary key,
    user_id    uuid references public.profiles(id) on delete cascade not null,
    comune     text,
    lat        float8,
    lng        float8,
    created_at timestamptz default now()
);

-- Aggiunge le colonne se la tabella esiste già senza di esse
alter table public.alerts add column if not exists comune text;
alter table public.alerts add column if not exists lat    float8;
alter table public.alerts add column if not exists lng    float8;

alter table public.alerts enable row level security;

drop policy if exists "Lettura propri alert" on public.alerts;
create policy "Lettura propri alert" on public.alerts for select using (auth.uid() = user_id);
drop policy if exists "Inserimento alert" on public.alerts;
create policy "Inserimento alert" on public.alerts for insert with check (auth.uid() = user_id);
drop policy if exists "Cancellazione alert" on public.alerts;
create policy "Cancellazione alert" on public.alerts for delete using (auth.uid() = user_id);


-- ✅ SETUP COMPLETATO!
