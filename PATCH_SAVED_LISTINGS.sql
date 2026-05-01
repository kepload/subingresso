-- ============================================================
--  Subingresso.it — Annunci preferiti (saved_listings)
--  Permette agli utenti registrati di salvare annunci.
--  Trigger naturale di registrazione per gli anonimi.
--  IDEMPOTENTE: si può rieseguire senza errori.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.saved_listings (
    user_id     uuid        NOT NULL REFERENCES auth.users(id)     ON DELETE CASCADE,
    annuncio_id uuid        NOT NULL REFERENCES public.annunci(id) ON DELETE CASCADE,
    created_at  timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, annuncio_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_listings_user
    ON public.saved_listings (user_id, created_at DESC);

ALTER TABLE public.saved_listings ENABLE ROW LEVEL SECURITY;

-- RLS: solo l'owner legge e scrive i propri preferiti
DROP POLICY IF EXISTS "saved_listings_select_own" ON public.saved_listings;
CREATE POLICY "saved_listings_select_own" ON public.saved_listings
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_listings_insert_own" ON public.saved_listings;
CREATE POLICY "saved_listings_insert_own" ON public.saved_listings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_listings_delete_own" ON public.saved_listings;
CREATE POLICY "saved_listings_delete_own" ON public.saved_listings
    FOR DELETE USING (auth.uid() = user_id);
