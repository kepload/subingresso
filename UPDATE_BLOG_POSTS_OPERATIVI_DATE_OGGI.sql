-- ============================================================
-- AGGIORNA DATE ARTICOLI OPERATIVI 2026
-- Eseguire nel SQL Editor di Supabase dopo INSERT_BLOG_POSTS_OPERATIVI_2026.sql
-- Porta i 18 nuovi articoli in cima al blog, scaglionati negli ultimi minuti
-- ============================================================

UPDATE public.blog_posts
SET published_at = CASE slug
  WHEN 'bolkestein-ambulanti-cosa-cambia-2026' THEN now() - interval '1 minute'
  WHEN 'regime-forfettario-ambulante-2026' THEN now() - interval '2 minutes'
  WHEN 'contributi-inps-commercianti-ambulanti-2026' THEN now() - interval '3 minutes'
  WHEN 'aprire-partita-iva-ambulante-2026' THEN now() - interval '4 minutes'
  WHEN 'codici-ateco-ambulanti-2025' THEN now() - interval '5 minutes'
  WHEN 'spuntista-mercato-come-funziona' THEN now() - interval '6 minutes'
  WHEN 'decadenza-concessione-posteggio-ambulante' THEN now() - interval '7 minutes'
  WHEN 'autorizzazione-temporanea-sagre-fiere-ambulanti' THEN now() - interval '8 minutes'
  WHEN 'haccp-ambulanti-alimentari-obblighi' THEN now() - interval '9 minutes'
  WHEN 'assicurazione-ambulanti-cosa-serve' THEN now() - interval '10 minutes'
  WHEN 'posteggi-mercatali-toscana-firenze-prato-livorno' THEN now() - interval '11 minutes'
  WHEN 'posteggi-mercatali-roma-lazio' THEN now() - interval '12 minutes'
  WHEN 'posteggi-mercatali-puglia-bari-lecce-taranto' THEN now() - interval '13 minutes'
  WHEN 'posteggi-mercatali-sardegna-cagliari-turismo' THEN now() - interval '14 minutes'
  WHEN 'posteggi-mercatali-centro-italia-marche-umbria-abruzzo' THEN now() - interval '15 minutes'
  WHEN 'trasferire-posteggio-a-figlio-coniuge' THEN now() - interval '16 minutes'
  WHEN 'vendere-prodotti-propri-ai-mercati' THEN now() - interval '17 minutes'
  WHEN 'crisi-commercio-ambulante-strategie' THEN now() - interval '18 minutes'
  ELSE published_at
END
WHERE slug IN (
  'bolkestein-ambulanti-cosa-cambia-2026',
  'regime-forfettario-ambulante-2026',
  'contributi-inps-commercianti-ambulanti-2026',
  'aprire-partita-iva-ambulante-2026',
  'codici-ateco-ambulanti-2025',
  'spuntista-mercato-come-funziona',
  'decadenza-concessione-posteggio-ambulante',
  'autorizzazione-temporanea-sagre-fiere-ambulanti',
  'haccp-ambulanti-alimentari-obblighi',
  'assicurazione-ambulanti-cosa-serve',
  'posteggi-mercatali-toscana-firenze-prato-livorno',
  'posteggi-mercatali-roma-lazio',
  'posteggi-mercatali-puglia-bari-lecce-taranto',
  'posteggi-mercatali-sardegna-cagliari-turismo',
  'posteggi-mercatali-centro-italia-marche-umbria-abruzzo',
  'trasferire-posteggio-a-figlio-coniuge',
  'vendere-prodotti-propri-ai-mercati',
  'crisi-commercio-ambulante-strategie'
);
