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

-- Policy Conversazioni
drop policy if exists "Lettura conversazioni partecipanti" on public.conversazioni;
create policy "Lettura conversazioni partecipanti" on public.conversazioni
  for select using (auth.uid() = acquirente_id or auth.uid() = venditore_id);

drop policy if exists "Inserimento conversazioni" on public.conversazioni;
create policy "Inserimento conversazioni" on public.conversazioni
  for insert with check (auth.uid() = acquirente_id);

-- Policy Messaggi
drop policy if exists "Lettura messaggi partecipanti" on public.messaggi;
create policy "Lettura messaggi partecipanti" on public.messaggi
  for select using (
    exists (
      select 1 from public.conversazioni c
      where c.id = conversazione_id
        and (c.acquirente_id = auth.uid() or c.venditore_id = auth.uid())
    )
  );

drop policy if exists "Inserimento messaggi partecipanti" on public.messaggi;
create policy "Inserimento messaggi partecipanti" on public.messaggi
  for insert with check (
    auth.uid() = mittente_id
    and exists (
      select 1 from public.conversazioni c
      where c.id = conversazione_id
        and (c.acquirente_id = auth.uid() or c.venditore_id = auth.uid())
    )
  );

drop policy if exists "Aggiornamento messaggi letto" on public.messaggi;
create policy "Aggiornamento messaggi letto" on public.messaggi
  for update using (
    exists (
      select 1 from public.conversazioni c
      where c.id = conversazione_id
        and (c.acquirente_id = auth.uid() or c.venditore_id = auth.uid())
    )
  );

-- Policy Blog
drop policy if exists "Lettura pubblica blog" on public.blog_posts;
create policy "Lettura pubblica blog" on public.blog_posts for select using (true);

drop policy if exists "Admin inserimento blog" on public.blog_posts;
create policy "Admin inserimento blog" on public.blog_posts for insert with check (auth.email() = 'kycykuardit@gmail.com');

drop policy if exists "Admin modifica blog" on public.blog_posts;
create policy "Admin modifica blog" on public.blog_posts for update using (auth.email() = 'kycykuardit@gmail.com');

drop policy if exists "Admin eliminazione blog" on public.blog_posts;
create policy "Admin eliminazione blog" on public.blog_posts for delete using (auth.email() = 'kycykuardit@gmail.com');

-- ── 6b. PROTEZIONE STATUS ANNUNCI (Anti-bypass) ─────────────
-- Impedisce agli utenti normali di pubblicare direttamente come 'active'
-- bypassando la moderazione tramite chiamate API dirette a Supabase.
CREATE OR REPLACE FUNCTION public.enforce_annunci_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Admin può fare tutto
  IF auth.email() = 'kycykuardit@gmail.com' THEN
    RETURN NEW;
  END IF;

  -- INSERT: utenti normali partono sempre da 'pending'
  IF TG_OP = 'INSERT' THEN
    NEW.status = 'pending';
    RETURN NEW;
  END IF;

  -- UPDATE: utenti normali non possono promuoversi ad 'active' da soli
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'active' AND OLD.status != 'active' THEN
      NEW.status = OLD.status; -- ripristina il valore precedente
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_annunci_status ON public.annunci;
CREATE TRIGGER trg_enforce_annunci_status
  BEFORE INSERT OR UPDATE ON public.annunci
  FOR EACH ROW EXECUTE FUNCTION public.enforce_annunci_status();

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
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

-- Policy storage: chiunque può leggere
drop policy if exists "Lettura pubblica avatars"   on storage.objects;
drop policy if exists "Lettura pubblica listings"  on storage.objects;
create policy "Lettura pubblica avatars"  on storage.objects for select using (bucket_id = 'avatars');
create policy "Lettura pubblica listings" on storage.objects for select using (bucket_id = 'listings');

-- Policy storage: solo utenti autenticati possono caricare nella propria cartella
drop policy if exists "Upload avatar autenticato"   on storage.objects;
drop policy if exists "Upload listing autenticato"  on storage.objects;
create policy "Upload avatar autenticato"  on storage.objects for insert with check (bucket_id = 'avatars'   and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Upload listing autenticato" on storage.objects for insert with check (bucket_id = 'listings'  and auth.uid()::text = (storage.foldername(name))[1]);

-- Policy storage: solo il proprietario può eliminare i propri file
drop policy if exists "Delete avatar proprietario"   on storage.objects;
drop policy if exists "Delete listing proprietario"  on storage.objects;
create policy "Delete avatar proprietario"  on storage.objects for delete using (bucket_id = 'avatars'   and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Delete listing proprietario" on storage.objects for delete using (bucket_id = 'listings'  and auth.uid()::text = (storage.foldername(name))[1]);

-- ── 9. COLONNE MANCANTI (ALTER TABLE sicuro) ────────────────
-- Aggiunge colonne nuove senza toccare dati esistenti
ALTER TABLE public.annunci ADD COLUMN IF NOT EXISTS img_urls    text[];
ALTER TABLE public.annunci ADD COLUMN IF NOT EXISTS expires_at  timestamptz;
ALTER TABLE public.annunci ADD COLUMN IF NOT EXISTS provincia   text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- ── 10. LOG NOTIFICHE ALERT (anti-duplicati) ────────────────
-- Blocca email duplicate: una sola email per coppia (utente, annuncio)
create table if not exists public.notify_alert_log (
    user_id     uuid not null,
    annuncio_id uuid not null,
    sent_at     timestamptz default now(),
    primary key (user_id, annuncio_id)
);
alter table public.notify_alert_log enable row level security;
-- Solo service_role legge/scrive (edge function). Nessuna policy = nessun accesso client.

-- ── 11. EMAIL WEEKLY DIGEST & STATS ──────────────────────────
-- Preferenze email per utente (default ON, facile disattivare via unsubscribe)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_digest boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_stats  boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unsub_token  text DEFAULT replace(gen_random_uuid()::text, '-', '');

-- Backfill token per profili esistenti (idempotente)
UPDATE public.profiles SET unsub_token = replace(gen_random_uuid()::text, '-', '')
WHERE unsub_token IS NULL;

-- Index per lookup rapido via token in email-unsubscribe
create index if not exists idx_profiles_unsub_token on public.profiles (unsub_token);

-- Snapshot settimanale views (per calcolare delta settimana-su-settimana)
create table if not exists public.weekly_stats_snapshot (
    user_id         uuid not null,
    week_start      date not null,
    total_views     integer default 0,
    active_listings integer default 0,
    sent_at         timestamptz default now(),
    primary key (user_id, week_start)
);
alter table public.weekly_stats_snapshot enable row level security;

-- Log digest acquirenti (evita doppio invio nella stessa settimana)
create table if not exists public.weekly_digest_log (
    user_id    uuid not null,
    week_start date not null,
    sent_at    timestamptz default now(),
    primary key (user_id, week_start)
);
alter table public.weekly_digest_log enable row level security;

-- ── 12. RELOAD SCHEMA CACHE ──────────────────────────────────
-- Forza PostgREST a ricaricare lo schema (risolve errori "column not found")
NOTIFY pgrst, 'reload schema';

-- ✅ SETUP COMPLETATO!
