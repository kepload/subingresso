-- ============================================================
--  SUBINGRESSO.IT - 10 annunci demo realistici
--  Eseguire nel SQL Editor di Supabase.
--
--  Crea 10 profili finti, rimuove i vecchi annunci demo riconoscibili
--  e reinserisce solo annunci assegnati a quei profili fake.
--  ATTENZIONE: usare solo per seed/demo, da eliminare quando arrivano annunci veri.
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

DELETE FROM public.annunci
WHERE user_id IN (
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
OR contatto IN (
  'Carla M.', 'Marco V.', 'Elena R.', 'Giovanna F.', 'Roberto A.',
  'Luigi B.', 'Stefania C.', 'Antonio P.', 'Mirella G.', 'Federico N.',
  'Lucia R.', 'Youssef E.', 'Fatima B.', 'Karim A.', 'Samira O.',
  'Hassan R.', 'Nadia C.'
);

INSERT INTO annunci (
  user_id, titolo, descrizione, stato, tipo, settore, regione, provincia, comune,
  superficie, giorni, prezzo, contatto, status, created_at, expires_at, img_urls, dettagli_extra
)
VALUES
(
  'a1b2c3d4-0001-4000-8000-000000000000',
  'Vendo posteggio abbigliamento donna - Milano',
  'Cedo posteggio non alimentare in mercato settimanale a Milano, settore abbigliamento donna. Lo spazio e adatto a banco, appendiabiti e piccola scorta giornaliera. La posizione e su una corsia di passaggio ordinario, senza promesse di incassi o numeri gonfiati. Attivita portata avanti da anni con clientela di zona. Documentazione da verificare con il Comune e con il proprio consulente prima del subingresso. Inclusi struttura banco, teli e parte dell attrezzatura.',
  'Vendita', 'Fisso', 'Abbigliamento', 'Lombardia', 'MI', 'Milano',
  32, 'Lunedi, Mercoledi, Venerdi, Sabato',
  42000, 'Lucia R.', 'active',
  now() - interval '18 days', now() - interval '18 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0002-4000-8000-000000000000',
  'Posteggio calzature in vendita - Sirmione',
  'Vendo posteggio non alimentare al mercato settimanale di Sirmione, settore calzature e accessori. Lo spazio consente espositori scarpe, banco e ombrellone. Nei periodi turistici il passaggio aumenta, ma chi compra deve valutare posizione, concessione, concorrenza e stagionalita. Cessione per cambio zona di lavoro. Attrezzatura base inclusa, merce da trattare separatamente se interessa.',
  'Vendita', 'Fisso', 'Calzature', 'Lombardia', 'BS', 'Sirmione',
  28, 'Venerdi',
  36000, 'Youssef E.', 'active',
  now() - interval '7 days', now() - interval '7 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0003-4000-8000-000000000000',
  'Vendo posteggio bigiotteria e accessori - Lazise',
  'Cedo posteggio non alimentare al mercato di Lazise, adatto a bigiotteria, accessori moda e piccoli articoli regalo. Dimensione comoda per banco modulare, espositori verticali e scorta leggera. Il lavoro e piu interessante nei mesi di maggiore movimento sul lago, mentre fuori stagione richiede continuita e prezzi corretti. Cedo per motivi familiari. Disponibile a mostrare posizione e documenti prima di trattare.',
  'Vendita', 'Fisso', 'Bigiotteria e accessori', 'Veneto', 'VR', 'Lazise',
  24, 'Lunedi',
  24000, 'Fatima B.', 'active',
  now() - interval '31 days', now() - interval '31 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0004-4000-8000-000000000000',
  'Posteggio tessuti e merceria in vendita - Torri del Benaco',
  'Vendo posteggio non alimentare per tessuti, filati e merceria al mercato settimanale di Torri del Benaco. Spazio adatto a banco lungo, portarotoli e qualche espositore laterale. Clientela soprattutto locale, con aumento di passaggio nei periodi turistici. Attrezzatura compresa: banconi, teli, struttura e pesi. Cedo per pensionamento. Prima del subingresso vanno controllati concessione, autorizzazione e compatibilita del settore merceologico.',
  'Vendita', 'Fisso', 'Tessuti e merceria', 'Veneto', 'VR', 'Torri del Benaco',
  30, 'Giovedi',
  19000, 'Giovanna F.', 'active',
  now() - interval '45 days', now() - interval '45 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0005-4000-8000-000000000000',
  'Posteggio abbigliamento in vendita - Desenzano del Garda',
  'Vendo posteggio non alimentare al mercato settimanale di Desenzano del Garda, settore abbigliamento uomo e donna. Lo spazio permette esposizione ordinata con appendiabiti, banco e deposito leggero. Il mercato lavora con residenti e visitatori, ma il prezzo tiene conto anche della stagionalita e della necessita di gestire bene assortimento e margini. Cedo per riorganizzazione attivita. Documentazione disponibile in fase di trattativa.',
  'Vendita', 'Fisso', 'Abbigliamento', 'Lombardia', 'BS', 'Desenzano del Garda',
  40, 'Martedi',
  46000, 'Karim A.', 'active',
  now() - interval '12 days', now() - interval '12 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0006-4000-8000-000000000000',
  'Cedo posteggio ortofrutta - Verona',
  'Vendo posteggio alimentare in mercato rionale a Verona, settore frutta e verdura. Spazio adatto a banco ortofrutta, cassette, bilance e piccola scorta giornaliera. La clientela e prevalentemente di quartiere, quindi conta molto la continuita nella presenza e nella qualita della merce. Sono incluse due bilance certificate, cassette e parte della struttura. Cessione per pensionamento. Verificare requisiti alimentari e autorizzazione prima del subingresso.',
  'Vendita', 'Fisso', 'Frutta e verdura', 'Veneto', 'VR', 'Verona',
  35, 'Martedi, Giovedi, Sabato',
  23000, 'Luigi B.', 'active',
  now() - interval '22 days', now() - interval '22 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0007-4000-8000-000000000000',
  'Vendo posteggio pelletteria e borse - Bergamo',
  'Cedo posteggio non alimentare in zona Bergamo, settore borse, cinture, portafogli e piccola pelletteria. Spazio sufficiente per espositori su piu lati e banco centrale. Lavoro indicato per chi ha gia fornitori e sa gestire assortimento, prezzo medio e rotazione merce. Il valore riguarda il posteggio e l attrezzatura, non vengono promessi incassi. Inclusi espositori, bacheche porta-borse e teli.',
  'Vendita', 'Fisso', 'Pelletteria e borse', 'Lombardia', 'BG', 'Bergamo',
  27, 'Sabato, Domenica',
  28000, 'Samira O.', 'active',
  now() - interval '38 days', now() - interval '38 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0008-4000-8000-000000000000',
  'Posteggio casalinghi in vendita - Peschiera del Garda',
  'Vendo posteggio non alimentare al mercato settimanale di Peschiera del Garda, settore casalinghi, piccoli articoli per la casa e oggettistica. Spazio adatto a banconi bassi, espositori e merce non ingombrante. Il movimento cambia molto tra stagione turistica e mesi ordinari, quindi la valutazione va fatta guardando posizione, giorni effettivi e concorrenza. Cedo per motivi personali. Attrezzatura base inclusa.',
  'Vendita', 'Fisso', 'Oggettistica', 'Veneto', 'VR', 'Peschiera del Garda',
  30, 'Mercoledi',
  17500, 'Antonio P.', 'active',
  now() - interval '55 days', now() - interval '55 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0009-4000-8000-000000000000',
  'Vendo posteggio abbigliamento bambino - Como',
  'Cedo posteggio non alimentare in mercato di zona a Como, settore abbigliamento bambino. Spazio adatto a appendiabiti, scaffali per taglie e banco. Clientela soprattutto locale, quindi il lavoro dipende da assortimento, prezzo e presenza costante. Attrezzatura compresa: appendiabiti, scaffali, banco e copertura. Possibile trattativa separata per parte dello stock. Prima di procedere consiglio verifica della concessione e delle regole comunali sul subingresso.',
  'Vendita', 'Fisso', 'Abbigliamento bambino', 'Lombardia', 'CO', 'Como',
  30, 'Lunedi, Giovedi',
  25000, 'Hassan R.', 'active',
  now() - interval '9 days', now() - interval '9 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0010-4000-8000-000000000000',
  'Affitto posteggio abbigliamento donna - Brescia',
  'Affitto posteggio non alimentare in mercato settimanale a Brescia, settore abbigliamento donna. La proposta e per subentro temporaneo con accordo scritto e durata da definire tra le parti, nel rispetto delle regole comunali. Spazio adatto a struttura portaabiti, banco e piccolo deposito. Non e una vendita della concessione: si valuta affitto del ramo operativo e uso dell attrezzatura. Richiesta serieta e verifica documentale prima di iniziare.',
  'Affitto', 'Fisso', 'Abbigliamento', 'Lombardia', 'BS', 'Brescia',
  32, 'Martedi, Sabato',
  4200, 'Nadia C.', 'active',
  now() - interval '14 days', now() - interval '14 days' + interval '200 days',
  '{}', '{}'
);

SELECT
  a.titolo,
  a.comune,
  a.superficie,
  a.prezzo,
  a.contatto,
  p.nome || ' ' || COALESCE(p.cognome, '') AS autore,
  a.status
FROM annunci a
JOIN profiles p ON p.id = a.user_id
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
