-- ==============================================================================
--  SUBINGRESSO.IT — POTENZIAMENTO VETRINA V2 (Statistiche e Fiducia)
-- ==============================================================================
-- Esegui questo script nel SQL Editor di Supabase per aggiungere le nuove
-- funzioni al database esistente.
-- ==============================================================================

-- 1. Aggiunta colonne alla tabella annunci
ALTER TABLE public.annunci ADD COLUMN IF NOT EXISTS tel_clicks integer DEFAULT 0;
ALTER TABLE public.annunci ADD COLUMN IF NOT EXISTS video_url text;

-- 2. Funzione RPC per incrementare i click sul numero di telefono
-- Questa funzione permette a qualsiasi utente (anche non loggato) di sommare +1 ai click,
-- senza dargli il permesso di modificare altre colonne.
CREATE OR REPLACE FUNCTION public.increment_tel_clicks(listing_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.annunci
  SET tel_clicks = COALESCE(tel_clicks, 0) + 1
  WHERE id = listing_id;
$$;

-- Permessi alla funzione
GRANT EXECUTE ON FUNCTION public.increment_tel_clicks(uuid) TO anon, authenticated;

-- ==============================================================================
--  FATTO! Nessun'altra modifica al database necessaria.
-- ==============================================================================