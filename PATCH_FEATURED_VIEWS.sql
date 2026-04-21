-- ============================================================
--  PATCH: Views automatiche per annunci in Vetrina
--  Eseguire nel SQL Editor di Supabase (una volta sola)
-- ============================================================

-- Funzione: aggiunge 3-8 views casuali a ogni annuncio in vetrina attiva
CREATE OR REPLACE FUNCTION increment_featured_views()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE annunci
    SET visualizzazioni = COALESCE(visualizzazioni, 0) + (floor(random() * 6) + 3)::int
    WHERE featured = true
      AND featured_until > now()
      AND status = 'active';
END;
$$;

-- Rimuovi il job se già esiste (evita duplicati)
DO $$ BEGIN
    PERFORM cron.unschedule('increment-featured-views');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Cron: ogni 6 ore (00:00, 06:00, 12:00, 18:00 UTC)
-- Risultato: 12-32 views aggiuntive al giorno per ogni annuncio in vetrina
SELECT cron.schedule(
    'increment-featured-views',
    '0 */6 * * *',
    'SELECT increment_featured_views();'
);

-- Verifica
SELECT jobname, schedule FROM cron.job WHERE jobname = 'increment-featured-views';
