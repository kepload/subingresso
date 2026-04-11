-- ============================================================
--  Subingresso.it — Setup Database Supabase
--  Istruzioni: incolla tutto questo testo nell'SQL Editor di Supabase
--  https://app.supabase.com → SQL Editor → New Query → Incolla → Run
-- ============================================================


-- ── 1. PROFILI UTENTI ──────────────────────────────────────
create table if not exists public.profiles (
    id          uuid references auth.users(id) on delete cascade primary key,
    nome        text,
    cognome     text,
    telefono    text,
    created_at  timestamptz default now()
);

-- Crea profilo automaticamente ad ogni nuova registrazione
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
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── 2. ANNUNCI ─────────────────────────────────────────────
create table if not exists public.annunci (
    id          uuid default gen_random_uuid() primary key,
    user_id     uuid references auth.users(id) on delete cascade not null,
    titolo      text not null,
    descrizione text,
    stato       text default 'Vendita',         -- Vendita / Affitto d'azienda
    categoria   text default 'Mercati',         -- Mercati / Taxi / Edicole / Tabacchi / Balneari
    tipo        text,                           -- Es: Mercato settimanale, Licenza Auto, ecc.
    settore     text,                           -- Ex "merce", ora abbraccia tutti i settori
    dettagli_extra jsonb,                       -- Campo flessibile per i dati specifici (es: metri quadri per mercati, cilindrata per taxi)
    regione     text,
    provincia   text,
    comune      text,
    superficie  numeric,
    giorni      text,
    prezzo      numeric,
    contatto    text,
    tel         text,
    email       text,
    data        date default current_date,
    status      text default 'active',           -- active / sold / deleted
    created_at  timestamptz default now()
);

-- Indici per le query più comuni
create index if not exists annunci_status_idx    on public.annunci(status);
create index if not exists annunci_regione_idx   on public.annunci(regione);
create index if not exists annunci_user_id_idx   on public.annunci(user_id);


-- ── 3. CONVERSAZIONI ───────────────────────────────────────
create table if not exists public.conversazioni (
    id              uuid default gen_random_uuid() primary key,
    annuncio_id     uuid references public.annunci(id) on delete cascade not null,
    acquirente_id   uuid references auth.users(id) on delete cascade not null,
    venditore_id    uuid references auth.users(id) on delete cascade not null,
    created_at      timestamptz default now(),
    unique(annuncio_id, acquirente_id)   -- una sola conversazione per annuncio/acquirente
);

create index if not exists conv_acquirente_idx on public.conversazioni(acquirente_id);
create index if not exists conv_venditore_idx  on public.conversazioni(venditore_id);


-- ── 4. MESSAGGI ────────────────────────────────────────────
create table if not exists public.messaggi (
    id                  uuid default gen_random_uuid() primary key,
    conversazione_id    uuid references public.conversazioni(id) on delete cascade not null,
    mittente_id         uuid references auth.users(id) on delete cascade not null,
    testo               text not null,
    letto               boolean default false,
    created_at          timestamptz default now()
);

create index if not exists msg_conv_idx on public.messaggi(conversazione_id);


-- ── 5. ROW LEVEL SECURITY (RLS) ────────────────────────────
-- Abilita RLS su tutte le tabelle
alter table public.profiles      enable row level security;
alter table public.annunci       enable row level security;
alter table public.conversazioni enable row level security;
alter table public.messaggi      enable row level security;

-- PROFILES
create policy "Tutti possono leggere i profili"
  on public.profiles for select using (true);

create policy "Utente modifica solo il proprio profilo"
  on public.profiles for update using (auth.uid() = id);

create policy "Trigger inserisce profilo"
  on public.profiles for insert with check (true);

-- ANNUNCI
create policy "Tutti possono vedere gli annunci attivi"
  on public.annunci for select using (status = 'active' or auth.uid() = user_id);

create policy "Utenti registrati possono inserire annunci"
  on public.annunci for insert with check (auth.uid() = user_id);

create policy "Proprietario può aggiornare i propri annunci"
  on public.annunci for update using (auth.uid() = user_id);

create policy "Proprietario può eliminare i propri annunci"
  on public.annunci for delete using (auth.uid() = user_id);

-- CONVERSAZIONI
create policy "Solo i partecipanti vedono le conversazioni"
  on public.conversazioni for select
  using (auth.uid() = acquirente_id or auth.uid() = venditore_id);

create policy "Acquirenti autenticati possono creare conversazioni"
  on public.conversazioni for insert
  with check (auth.uid() = acquirente_id);

-- MESSAGGI
create policy "Solo i partecipanti vedono i messaggi"
  on public.messaggi for select
  using (
    exists (
      select 1 from public.conversazioni c
      where c.id = messaggi.conversazione_id
      and (c.acquirente_id = auth.uid() or c.venditore_id = auth.uid())
    )
  );

create policy "Partecipanti possono inviare messaggi"
  on public.messaggi for insert
  with check (
    auth.uid() = mittente_id and
    exists (
      select 1 from public.conversazioni c
      where c.id = messaggi.conversazione_id
      and (c.acquirente_id = auth.uid() or c.venditore_id = auth.uid())
    )
  );

create policy "Partecipanti possono segnare messaggi come letti"
  on public.messaggi for update
  using (
    exists (
      select 1 from public.conversazioni c
      where c.id = messaggi.conversazione_id
      and (c.acquirente_id = auth.uid() or c.venditore_id = auth.uid())
    )
  );


-- ── 6. REALTIME (per messaggistica in tempo reale) ──────────
-- Abilita la replica in tempo reale per la tabella messaggi
alter publication supabase_realtime add table public.messaggi;
alter publication supabase_realtime add table public.conversazioni;


-- ✅ Setup completato!
-- Ora torna su SETUP.md per i passi successivi.
