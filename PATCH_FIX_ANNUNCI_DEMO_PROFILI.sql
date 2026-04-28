-- ============================================================
--  SUBINGRESSO.IT - Patch annunci demo gia' online
--  Eseguire nel SQL Editor di Supabase.
--
--  Scopo:
--  1. crea/aggiorna 10 profili finti;
--  2. riassegna SOLO gli annunci demo gia' creati;
--  3. corregge descrizioni, superfici e prezzi troppo inventati.
--
--  La patch tocca solo annunci con user_id demo oppure con i vecchi
--  contatti demo usati nel seed precedente.
-- ============================================================

INSERT INTO auth.users (
  id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data,
  is_super_admin, instance_id
)
VALUES
  ('a1b2c3d4-0001-4000-8000-000000000000', 'authenticated', 'authenticated', 'lucia.rinaldi.demo@subingresso.it', '', now() - interval '2 years 3 months', now() - interval '2 years 3 months', now(), '{"nome":"Lucia","cognome":"Rinaldi"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0002-4000-8000-000000000000', 'authenticated', 'authenticated', 'youssef.elamrani.demo@subingresso.it', '', now() - interval '1 year 8 months', now() - interval '1 year 8 months', now(), '{"nome":"Youssef","cognome":"El Amrani"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0003-4000-8000-000000000000', 'authenticated', 'authenticated', 'fatima.benali.demo@subingresso.it', '', now() - interval '1 year 1 month', now() - interval '1 year 1 month', now(), '{"nome":"Fatima","cognome":"Benali"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0004-4000-8000-000000000000', 'authenticated', 'authenticated', 'giovanna.ferrara.demo@subingresso.it', '', now() - interval '3 years', now() - interval '3 years', now(), '{"nome":"Giovanna","cognome":"Ferrara"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0005-4000-8000-000000000000', 'authenticated', 'authenticated', 'karim.aitlahcen.demo@subingresso.it', '', now() - interval '2 years', now() - interval '2 years', now(), '{"nome":"Karim","cognome":"Ait Lahcen"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0006-4000-8000-000000000000', 'authenticated', 'authenticated', 'luigi.bianchi.demo@subingresso.it', '', now() - interval '1 year 5 months', now() - interval '1 year 5 months', now(), '{"nome":"Luigi","cognome":"Bianchi"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0007-4000-8000-000000000000', 'authenticated', 'authenticated', 'samira.oudghiri.demo@subingresso.it', '', now() - interval '10 months', now() - interval '10 months', now(), '{"nome":"Samira","cognome":"Oudghiri"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0008-4000-8000-000000000000', 'authenticated', 'authenticated', 'antonio.perini.demo@subingresso.it', '', now() - interval '2 years 7 months', now() - interval '2 years 7 months', now(), '{"nome":"Antonio","cognome":"Perini"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0009-4000-8000-000000000000', 'authenticated', 'authenticated', 'hassan.rachidi.demo@subingresso.it', '', now() - interval '3 years 2 months', now() - interval '3 years 2 months', now(), '{"nome":"Hassan","cognome":"Rachidi"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0010-4000-8000-000000000000', 'authenticated', 'authenticated', 'nadia.conti.demo@subingresso.it', '', now() - interval '1 year', now() - interval '1 year', now(), '{"nome":"Nadia","cognome":"Conti"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();

INSERT INTO public.profiles (id, nome, cognome, created_at)
VALUES
  ('a1b2c3d4-0001-4000-8000-000000000000', 'Lucia',    'Rinaldi',    now() - interval '2 years 3 months'),
  ('a1b2c3d4-0002-4000-8000-000000000000', 'Youssef',  'El Amrani',  now() - interval '1 year 8 months'),
  ('a1b2c3d4-0003-4000-8000-000000000000', 'Fatima',   'Benali',     now() - interval '1 year 1 month'),
  ('a1b2c3d4-0004-4000-8000-000000000000', 'Giovanna', 'Ferrara',    now() - interval '3 years'),
  ('a1b2c3d4-0005-4000-8000-000000000000', 'Karim',    'Ait Lahcen', now() - interval '2 years'),
  ('a1b2c3d4-0006-4000-8000-000000000000', 'Luigi',    'Bianchi',    now() - interval '1 year 5 months'),
  ('a1b2c3d4-0007-4000-8000-000000000000', 'Samira',   'Oudghiri',   now() - interval '10 months'),
  ('a1b2c3d4-0008-4000-8000-000000000000', 'Antonio',  'Perini',     now() - interval '2 years 7 months'),
  ('a1b2c3d4-0009-4000-8000-000000000000', 'Hassan',   'Rachidi',    now() - interval '3 years 2 months'),
  ('a1b2c3d4-0010-4000-8000-000000000000', 'Nadia',    'Conti',      now() - interval '1 year')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  cognome = EXCLUDED.cognome,
  created_at = EXCLUDED.created_at;

UPDATE public.annunci
SET user_id = 'a1b2c3d4-0001-4000-8000-000000000000',
    titolo = 'Vendo posteggio abbigliamento donna - Milano',
    descrizione = 'Cedo posteggio non alimentare in mercato settimanale a Milano, settore abbigliamento donna. Lo spazio e adatto a banco, appendiabiti e piccola scorta giornaliera. La posizione e su una corsia di passaggio ordinario, senza promesse di incassi o numeri gonfiati. Attivita portata avanti da anni con clientela di zona. Documentazione da verificare con il Comune e con il proprio consulente prima del subingresso. Inclusi struttura banco, teli e parte dell attrezzatura.',
    superficie = 32,
    giorni = 'Lunedi, Mercoledi, Venerdi, Sabato',
    prezzo = 42000,
    contatto = 'Lucia R.'
WHERE user_id = 'a1b2c3d4-0001-4000-8000-000000000000'
   OR (contatto = 'Carla M.' AND titolo ILIKE '%Porta Genova%');

UPDATE public.annunci
SET user_id = 'a1b2c3d4-0002-4000-8000-000000000000',
    titolo = 'Posteggio calzature in vendita - Sirmione',
    descrizione = 'Vendo posteggio non alimentare al mercato settimanale di Sirmione, settore calzature e accessori. Lo spazio consente espositori scarpe, banco e ombrellone. Nei periodi turistici il passaggio aumenta, ma chi compra deve valutare posizione, concessione, concorrenza e stagionalita. Cessione per cambio zona di lavoro. Attrezzatura base inclusa, merce da trattare separatamente se interessa.',
    superficie = 28,
    giorni = 'Venerdi',
    prezzo = 36000,
    contatto = 'Youssef E.'
WHERE user_id = 'a1b2c3d4-0002-4000-8000-000000000000'
   OR (contatto = 'Marco V.' AND titolo ILIKE '%Sirmione%');

UPDATE public.annunci
SET user_id = 'a1b2c3d4-0003-4000-8000-000000000000',
    titolo = 'Vendo posteggio bigiotteria e accessori - Lazise',
    descrizione = 'Cedo posteggio non alimentare al mercato di Lazise, adatto a bigiotteria, accessori moda e piccoli articoli regalo. Dimensione comoda per banco modulare, espositori verticali e scorta leggera. Il lavoro e piu interessante nei mesi di maggiore movimento sul lago, mentre fuori stagione richiede continuita e prezzi corretti. Cedo per motivi familiari. Disponibile a mostrare posizione e documenti prima di trattare.',
    superficie = 24,
    giorni = 'Lunedi',
    prezzo = 24000,
    contatto = 'Fatima B.'
WHERE user_id = 'a1b2c3d4-0003-4000-8000-000000000000'
   OR (contatto = 'Elena R.' AND titolo ILIKE '%Lazise%');

UPDATE public.annunci
SET user_id = 'a1b2c3d4-0004-4000-8000-000000000000',
    titolo = 'Posteggio tessuti e merceria in vendita - Torri del Benaco',
    descrizione = 'Vendo posteggio non alimentare per tessuti, filati e merceria al mercato settimanale di Torri del Benaco. Spazio adatto a banco lungo, portarotoli e qualche espositore laterale. Clientela soprattutto locale, con aumento di passaggio nei periodi turistici. Attrezzatura compresa: banconi, teli, struttura e pesi. Cedo per pensionamento. Prima del subingresso vanno controllati concessione, autorizzazione e compatibilita del settore merceologico.',
    superficie = 30,
    giorni = 'Giovedi',
    prezzo = 19000,
    contatto = 'Giovanna F.'
WHERE user_id = 'a1b2c3d4-0004-4000-8000-000000000000'
   OR (contatto = 'Giovanna F.' AND titolo ILIKE '%Torri del Benaco%');

UPDATE public.annunci
SET user_id = 'a1b2c3d4-0005-4000-8000-000000000000',
    titolo = 'Posteggio abbigliamento in vendita - Desenzano del Garda',
    descrizione = 'Vendo posteggio non alimentare al mercato settimanale di Desenzano del Garda, settore abbigliamento uomo e donna. Lo spazio permette esposizione ordinata con appendiabiti, banco e deposito leggero. Il mercato lavora con residenti e visitatori, ma il prezzo tiene conto anche della stagionalita e della necessita di gestire bene assortimento e margini. Cedo per riorganizzazione attivita. Documentazione disponibile in fase di trattativa.',
    superficie = 40,
    giorni = 'Martedi',
    prezzo = 46000,
    contatto = 'Karim A.'
WHERE user_id = 'a1b2c3d4-0005-4000-8000-000000000000'
   OR (contatto = 'Roberto A.' AND titolo ILIKE '%Desenzano%');

UPDATE public.annunci
SET user_id = 'a1b2c3d4-0006-4000-8000-000000000000',
    titolo = 'Cedo posteggio ortofrutta - Verona',
    descrizione = 'Vendo posteggio alimentare in mercato rionale a Verona, settore frutta e verdura. Spazio adatto a banco ortofrutta, cassette, bilance e piccola scorta giornaliera. La clientela e prevalentemente di quartiere, quindi conta molto la continuita nella presenza e nella qualita della merce. Sono incluse due bilance certificate, cassette e parte della struttura. Cessione per pensionamento. Verificare requisiti alimentari e autorizzazione prima del subingresso.',
    superficie = 35,
    giorni = 'Martedi, Giovedi, Sabato',
    prezzo = 23000,
    contatto = 'Luigi B.'
WHERE user_id = 'a1b2c3d4-0006-4000-8000-000000000000'
   OR (contatto = 'Luigi B.' AND titolo ILIKE '%ortofrutta%');

UPDATE public.annunci
SET user_id = 'a1b2c3d4-0007-4000-8000-000000000000',
    titolo = 'Vendo posteggio pelletteria e borse - Bergamo',
    descrizione = 'Cedo posteggio non alimentare in zona Bergamo, settore borse, cinture, portafogli e piccola pelletteria. Spazio sufficiente per espositori su piu lati e banco centrale. Lavoro indicato per chi ha gia fornitori e sa gestire assortimento, prezzo medio e rotazione merce. Il valore riguarda il posteggio e l attrezzatura, non vengono promessi incassi. Inclusi espositori, bacheche porta-borse e teli.',
    superficie = 27,
    giorni = 'Sabato, Domenica',
    prezzo = 28000,
    contatto = 'Samira O.'
WHERE user_id = 'a1b2c3d4-0007-4000-8000-000000000000'
   OR (contatto = 'Stefania C.' AND titolo ILIKE '%Bergamo%');

UPDATE public.annunci
SET user_id = 'a1b2c3d4-0008-4000-8000-000000000000',
    titolo = 'Posteggio casalinghi in vendita - Peschiera del Garda',
    descrizione = 'Vendo posteggio non alimentare al mercato settimanale di Peschiera del Garda, settore casalinghi, piccoli articoli per la casa e oggettistica. Spazio adatto a banconi bassi, espositori e merce non ingombrante. Il movimento cambia molto tra stagione turistica e mesi ordinari, quindi la valutazione va fatta guardando posizione, giorni effettivi e concorrenza. Cedo per motivi personali. Attrezzatura base inclusa.',
    superficie = 30,
    giorni = 'Mercoledi',
    prezzo = 17500,
    contatto = 'Antonio P.'
WHERE user_id = 'a1b2c3d4-0008-4000-8000-000000000000'
   OR (contatto = 'Antonio P.' AND titolo ILIKE '%Peschiera%');

UPDATE public.annunci
SET user_id = 'a1b2c3d4-0009-4000-8000-000000000000',
    titolo = 'Vendo posteggio abbigliamento bambino - Como',
    descrizione = 'Cedo posteggio non alimentare in mercato di zona a Como, settore abbigliamento bambino. Spazio adatto a appendiabiti, scaffali per taglie e banco. Clientela soprattutto locale, quindi il lavoro dipende da assortimento, prezzo e presenza costante. Attrezzatura compresa: appendiabiti, scaffali, banco e copertura. Possibile trattativa separata per parte dello stock. Prima di procedere consiglio verifica della concessione e delle regole comunali sul subingresso.',
    superficie = 30,
    giorni = 'Lunedi, Giovedi',
    prezzo = 25000,
    contatto = 'Hassan R.'
WHERE user_id = 'a1b2c3d4-0009-4000-8000-000000000000'
   OR (contatto = 'Mirella G.' AND titolo ILIKE '%Como%');

UPDATE public.annunci
SET user_id = 'a1b2c3d4-0010-4000-8000-000000000000',
    titolo = 'Affitto posteggio abbigliamento donna - Brescia',
    descrizione = 'Affitto posteggio non alimentare in mercato settimanale a Brescia, settore abbigliamento donna. La proposta e per subentro temporaneo con accordo scritto e durata da definire tra le parti, nel rispetto delle regole comunali. Spazio adatto a struttura portaabiti, banco e piccolo deposito. Non e una vendita della concessione: si valuta affitto del ramo operativo e uso dell attrezzatura. Richiesta serieta e verifica documentale prima di iniziare.',
    superficie = 32,
    giorni = 'Martedi, Sabato',
    prezzo = 4200,
    contatto = 'Nadia C.'
WHERE user_id = 'a1b2c3d4-0010-4000-8000-000000000000'
   OR (contatto = 'Federico N.' AND titolo ILIKE '%Triumplina%');

SELECT
  a.id,
  a.titolo,
  a.comune,
  a.superficie,
  a.prezzo,
  a.contatto,
  p.nome || ' ' || COALESCE(p.cognome, '') AS autore,
  a.user_id
FROM public.annunci a
JOIN public.profiles p ON p.id = a.user_id
WHERE a.user_id IN (
  'a1b2c3d4-0001-4000-8000-000000000000',
  'a1b2c3d4-0002-4000-8000-000000000000',
  'a1b2c3d4-0003-4000-8000-000000000000',
  'a1b2c3d4-0004-4000-8000-000000000000',
  'a1b2c3d4-0005-4000-8000-000000000000',
  'a1b2c3d4-0006-4000-8000-000000000000',
  'a1b2c3d4-0007-4000-8000-000000000000',
  'a1b2c3d4-0008-4000-8000-000000000000',
  'a1b2c3d4-0009-4000-8000-000000000000',
  'a1b2c3d4-0010-4000-8000-000000000000'
)
ORDER BY a.created_at DESC;
