-- Estensione funnel sources (chat/whatsapp/call) + saved_count su annunci.
-- Idempotente. Privacy-safe: saved_count è AGGREGATO, non rivela chi ha salvato.

-- ── 1) Estendi CHECK constraint auth_modal_opens.source ──
ALTER TABLE public.auth_modal_opens
    DROP CONSTRAINT IF EXISTS auth_modal_opens_source_check;

ALTER TABLE public.auth_modal_opens
    ADD CONSTRAINT auth_modal_opens_source_check CHECK (source IN (
        'popup_vetrina','blog_promo','vendi_submit','nav_accedi',
        'salva_preferito','valutatore_create','welcome_popup',
        'tel_reveal','direct',
        'chat_click','whatsapp_click','call_click'
    ));

-- ── 2) Colonna saved_count su annunci ──
ALTER TABLE public.annunci ADD COLUMN IF NOT EXISTS saved_count int NOT NULL DEFAULT 0;

-- GRANT SELECT esplicito: la tabella ha grants column-level (REVOKE su tel/email)
-- quindi le nuove colonne NON ereditano automaticamente il SELECT. Senza questo
-- GRANT, qualsiasi select che include saved_count torna 42501 (permission denied)
-- → dashboard "I miei annunci" e pagina annuncio rotti per anon/authenticated.
GRANT SELECT (saved_count) ON public.annunci TO anon, authenticated;

-- Index su saved_listings.annuncio_id (per trigger lookup veloce)
CREATE INDEX IF NOT EXISTS idx_saved_listings_annuncio ON public.saved_listings(annuncio_id);

-- ── 3) Backfill iniziale (idempotente — ricalcola da zero ogni volta) ──
WITH counts AS (
    SELECT annuncio_id, COUNT(*)::int AS cnt
    FROM public.saved_listings
    GROUP BY annuncio_id
)
UPDATE public.annunci a
SET saved_count = COALESCE(c.cnt, 0)
FROM public.annunci a2
LEFT JOIN counts c ON c.annuncio_id = a2.id
WHERE a.id = a2.id
  AND a.saved_count IS DISTINCT FROM COALESCE(c.cnt, 0);

-- ── 4) Trigger function: mantieni saved_count sincronizzato ──
-- SECURITY DEFINER perché l'INSERT/DELETE su saved_listings viene fatto
-- dall'utente (RLS owner-only) ma deve poter aggiornare annunci.saved_count
-- (RLS impedirebbe l'UPDATE su annunci di altri utenti).
CREATE OR REPLACE FUNCTION public._sync_saved_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.annunci
        SET saved_count = saved_count + 1
        WHERE id = NEW.annuncio_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.annunci
        SET saved_count = GREATEST(saved_count - 1, 0)
        WHERE id = OLD.annuncio_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_saved_count ON public.saved_listings;
CREATE TRIGGER trg_sync_saved_count
AFTER INSERT OR DELETE ON public.saved_listings
FOR EACH ROW EXECUTE FUNCTION public._sync_saved_count();
