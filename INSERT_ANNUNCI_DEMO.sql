-- ============================================================
--  SUBINGRESSO.IT - 10 Annunci Demo Realistici
--  Eseguire nel SQL Editor di Supabase.
--
--  Crea 10 profili finti, rimuove i vecchi annunci demo riconoscibili
--  dai contatti sotto, poi reinserisce annunci assegnati ai profili fake.
--  ATTENZIONE: usare solo per seed/demo, da eliminare quando arrivano annunci veri.
-- ============================================================

-- Utenti fake in auth.users. UUID fissi per poterli ritrovare e pulire.
INSERT INTO auth.users (
  id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data,
  is_super_admin, instance_id
)
VALUES
  ('a1b2c3d4-0001-4000-8000-000000000000', 'authenticated', 'authenticated', 'carla.martinelli.market@gmail.com', '', now() - interval '2 years 3 months', now() - interval '2 years 3 months', now(), '{"nome":"Carla","cognome":"Martinelli"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0002-4000-8000-000000000000', 'authenticated', 'authenticated', 'marco.visentini84@libero.it', '', now() - interval '1 year 8 months', now() - interval '1 year 8 months', now(), '{"nome":"Marco","cognome":"Visentini"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0003-4000-8000-000000000000', 'authenticated', 'authenticated', 'elena.rossetti.garda@gmail.com', '', now() - interval '1 year 1 month', now() - interval '1 year 1 month', now(), '{"nome":"Elena","cognome":"Rossetti"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0004-4000-8000-000000000000', 'authenticated', 'authenticated', 'giovanna.ferrara56@gmail.com', '', now() - interval '3 years', now() - interval '3 years', now(), '{"nome":"Giovanna","cognome":"Ferrara"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0005-4000-8000-000000000000', 'authenticated', 'authenticated', 'r.agazzi.desenzano@hotmail.it', '', now() - interval '2 years', now() - interval '2 years', now(), '{"nome":"Roberto","cognome":"Agazzi"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0006-4000-8000-000000000000', 'authenticated', 'authenticated', 'luigi.bianchi.verona@gmail.com', '', now() - interval '1 year 5 months', now() - interval '1 year 5 months', now(), '{"nome":"Luigi","cognome":"Bianchi"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0007-4000-8000-000000000000', 'authenticated', 'authenticated', 'stefania.colombo.bg@gmail.com', '', now() - interval '10 months', now() - interval '10 months', now(), '{"nome":"Stefania","cognome":"Colombo"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0008-4000-8000-000000000000', 'authenticated', 'authenticated', 'antonio.perini.peschiera@libero.it', '', now() - interval '2 years 7 months', now() - interval '2 years 7 months', now(), '{"nome":"Antonio","cognome":"Perini"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0009-4000-8000-000000000000', 'authenticated', 'authenticated', 'mirella.grassi.como@gmail.com', '', now() - interval '3 years 2 months', now() - interval '3 years 2 months', now(), '{"nome":"Mirella","cognome":"Grassi"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000'),
  ('a1b2c3d4-0010-4000-8000-000000000000', 'authenticated', 'authenticated', 'f.negrini87.bs@gmail.com', '', now() - interval '1 year', now() - interval '1 year', now(), '{"nome":"Federico","cognome":"Negrini"}', '{"provider":"email","providers":["email"]}', false, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  raw_user_meta_data = EXCLUDED.raw_user_meta_data,
  updated_at = now();

INSERT INTO public.profiles (id, nome, cognome, created_at)
VALUES
  ('a1b2c3d4-0001-4000-8000-000000000000', 'Carla',    'Martinelli', now() - interval '2 years 3 months'),
  ('a1b2c3d4-0002-4000-8000-000000000000', 'Marco',    'Visentini',  now() - interval '1 year 8 months'),
  ('a1b2c3d4-0003-4000-8000-000000000000', 'Elena',    'Rossetti',   now() - interval '1 year 1 month'),
  ('a1b2c3d4-0004-4000-8000-000000000000', 'Giovanna', 'Ferrara',    now() - interval '3 years'),
  ('a1b2c3d4-0005-4000-8000-000000000000', 'Roberto',  'Agazzi',     now() - interval '2 years'),
  ('a1b2c3d4-0006-4000-8000-000000000000', 'Luigi',    'Bianchi',    now() - interval '1 year 5 months'),
  ('a1b2c3d4-0007-4000-8000-000000000000', 'Stefania', 'Colombo',    now() - interval '10 months'),
  ('a1b2c3d4-0008-4000-8000-000000000000', 'Antonio',  'Perini',     now() - interval '2 years 7 months'),
  ('a1b2c3d4-0009-4000-8000-000000000000', 'Mirella',  'Grassi',     now() - interval '3 years 2 months'),
  ('a1b2c3d4-0010-4000-8000-000000000000', 'Federico', 'Negrini',    now() - interval '1 year')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  cognome = EXCLUDED.cognome,
  created_at = EXCLUDED.created_at;

-- Pulisce eventuali demo vecchi, inclusi quelli inseriti a nome admin.
DELETE FROM public.annunci
WHERE contatto IN (
  'Carla M.', 'Marco V.', 'Elena R.', 'Giovanna F.', 'Roberto A.',
  'Luigi B.', 'Stefania C.', 'Antonio P.', 'Mirella G.', 'Federico N.'
)
OR user_id IN (
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
);

INSERT INTO annunci (
  user_id, titolo, descrizione, stato, tipo, settore, regione, provincia, comune,
  superficie, giorni, prezzo, contatto, status, created_at, expires_at, img_urls, dettagli_extra
)
VALUES
(
  'a1b2c3d4-0001-4000-8000-000000000000',
  'Vendo posteggio abbigliamento donna - Mercato Porta Genova, Milano',
  'Cedo per pensionamento posteggio fisso non alimentare di 32 mq al Mercato di Porta Genova, con fronte espositivo ampio e profondita sufficiente per banco, appendiabiti e scorta. Posizione centrale su percorso pedonale ad alta visibilita, clientela locale consolidata e buon passaggio nel fine settimana. Attivita avviata nel 2008, autorizzazione e concessione in ordine. Inclusi struttura portaabiti, due banconi, teli laterali, illuminazione e parte dell arredo espositivo. Disponibile affiancamento iniziale per presentare fornitori e clientela abituale.',
  'Vendita', 'Fisso', 'Abbigliamento', 'Lombardia', 'MI', 'Milano',
  32, 'Lunedi, Mercoledi, Venerdi, Sabato',
  58000, 'Carla M.', 'active',
  now() - interval '18 days', now() - interval '18 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0002-4000-8000-000000000000',
  'Posteggio calzature in vendita - Mercato di Sirmione',
  'Vendo posteggio fisso di 28 mq al mercato del venerdi di Sirmione, in zona di forte passaggio turistico e residente. Settore calzature, borse e accessori, con 11 anni di presenza continuativa nello stesso mercato. Il banco ha spazio adeguato per espositori scarpe su piu lati, deposito leggero e ombrellone rinforzato. Posizione ad angolo tra due file, visibile da entrambi i flussi pedonali. Cedo per trasferimento in altra regione. Documentazione visionabile prima di qualsiasi accordo.',
  'Vendita', 'Fisso', 'Calzature', 'Lombardia', 'BS', 'Sirmione',
  28, 'Venerdi',
  44000, 'Marco V.', 'active',
  now() - interval '7 days', now() - interval '7 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0003-4000-8000-000000000000',
  'Vendo posteggio bigiotteria e accessori - Lazise, Lago di Garda',
  'Cedo posteggio fisso di 24 mq al mercato del lunedi di Lazise, area non alimentare adatta a bigiotteria, accessori moda e borse. La stagione estiva porta un flusso importante di turisti italiani e stranieri, mentre nei mesi invernali resta una clientela locale stabile. Attivita avviata 8 anni fa, con buona riconoscibilita nel mercato. Inclusi banco modulare, espositori verticali, teli, ombrellone e valigie campionario. Cessione per motivi familiari, prezzo trattabile davanti a proposta concreta.',
  'Vendita', 'Fisso', 'Bigiotteria e accessori', 'Veneto', 'VR', 'Lazise',
  24, 'Lunedi',
  28000, 'Elena R.', 'active',
  now() - interval '31 days', now() - interval '31 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0004-4000-8000-000000000000',
  'Posteggio tessuti e merceria in vendita - Torri del Benaco',
  'Vendo posteggio fisso di 30 mq al mercato del giovedi di Torri del Benaco, settore tessuti, stoffe, filati e merceria. Lo spazio consente banco lungo, portarotoli, espositori laterali e passaggio comodo per la clientela. Clientela locale affezionata, composta soprattutto da persone che acquistano con regolarita durante l anno, con incremento turistico nella bella stagione. Presente nel mercato dal 2009. Inclusa attrezzatura completa: banconi, portarotoli, teli, struttura e pesi. Cedo per pensionamento.',
  'Vendita', 'Fisso', 'Tessuti e merceria', 'Veneto', 'VR', 'Torri del Benaco',
  30, 'Giovedi',
  19000, 'Giovanna F.', 'active',
  now() - interval '45 days', now() - interval '45 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0005-4000-8000-000000000000',
  'Posteggio abbigliamento 40 mq - Grande Mercato di Desenzano del Garda',
  'Vendo posteggio fisso di 40 mq al mercato del martedi di Desenzano del Garda, uno dei mercati piu frequentati della provincia di Brescia. Settore abbigliamento uomo e donna, con spazio per doppio fronte espositivo, appendiabiti, banco cassa e deposito leggero. Posizione centrale con forte passaggio pedonale, clientela mista di residenti e turisti. Dodici anni di attivita continuativa senza interruzioni. Attrezzatura completa inclusa. Cedo per apertura negozio fisso, documentazione in ordine.',
  'Vendita', 'Fisso', 'Abbigliamento', 'Lombardia', 'BS', 'Desenzano del Garda',
  40, 'Martedi',
  52000, 'Roberto A.', 'active',
  now() - interval '12 days', now() - interval '12 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0006-4000-8000-000000000000',
  'Cedo posteggio ortofrutta - Mercato rionale Porta Vescovo, Verona',
  'Vendo posteggio alimentare di 35 mq al mercato rionale di Porta Vescovo, quartiere residenziale di Verona con clientela stabile. Tre giorni a settimana: martedi, giovedi e sabato. Lo spazio e adatto a banco ortofrutta completo, cassette, bilance e piccolo appoggio per scorta giornaliera. Attivita avviata nel 2015, concessione regolare e posizione conosciuta dalla clientela. Incluse due bilance certificate, cassettame, ombrellone rinforzato e struttura frigo portatile. Cedo per pensionamento anticipato.',
  'Vendita', 'Fisso', 'Frutta e verdura', 'Veneto', 'VR', 'Verona',
  35, 'Martedi, Giovedi, Sabato',
  23000, 'Luigi B.', 'active',
  now() - interval '22 days', now() - interval '22 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0007-4000-8000-000000000000',
  'Vendo posteggio pelletteria e borse - Bergamo, mercato weekend',
  'Cedo posteggio fisso non alimentare di 27 mq nel mercato del weekend in zona Bergamo. Settore pelletteria: borse, cinture, portafogli e accessori in pelle. Misura adatta a espositori su tre lati, bacheche porta-borse e banco centrale senza comprimere il passaggio. Nei fine settimana la zona registra buon flusso di residenti e visitatori, soprattutto nelle mezze stagioni. Presente da 7 anni con clientela turistica affezionata. Inclusi espositori in metallo, bacheche e valigia porta-campionario.',
  'Vendita', 'Fisso', 'Pelletteria e borse', 'Lombardia', 'BG', 'Bergamo',
  27, 'Sabato, Domenica',
  32000, 'Stefania C.', 'active',
  now() - interval '38 days', now() - interval '38 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0008-4000-8000-000000000000',
  'Posteggio oggettistica e casalinghi in vendita - Peschiera del Garda',
  'Vendo posteggio fisso di 30 mq al mercato del mercoledi di Peschiera del Garda, settore oggettistica, casalinghi e articoli da regalo. Lo spazio permette esposizione ordinata di merce fragile, banconi metallici e scaffali bassi. Clientela mista di residenti, turisti e famiglie in vacanza sul Garda. Attivita avviata 6 anni fa con inserimento progressivo nel mercato locale. Posizione centrale tra due incroci di file. Inclusi banconi, ombrellone rinforzato ed espositori girevoli. Cedo per motivi di salute.',
  'Vendita', 'Fisso', 'Oggettistica', 'Veneto', 'VR', 'Peschiera del Garda',
  30, 'Mercoledi',
  17500, 'Antonio P.', 'active',
  now() - interval '55 days', now() - interval '55 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0009-4000-8000-000000000000',
  'Vendo posteggio abbigliamento bambino - Mercato di Camerlata, Como',
  'Cedo posteggio fisso di 30 mq al mercato di Camerlata, quartiere residenziale di Como con alta presenza di famiglie. Due giorni a settimana: lunedi e giovedi. Settore abbigliamento bambino 0-14 anni. Lo spazio consente appendiabiti, scaffali per taglie, banco prova e zona scorte. Dieci anni di presenza continuativa nello stesso posteggio, clientela di mamme e nonni fidelizzata. Attrezzatura inclusa: appendiabiti per bambini, scaffali, bancone e tendaggio. Possibile cessione stock separata.',
  'Vendita', 'Fisso', 'Abbigliamento bambino', 'Lombardia', 'CO', 'Como',
  30, 'Lunedi, Giovedi',
  25000, 'Mirella G.', 'active',
  now() - interval '9 days', now() - interval '9 days' + interval '200 days',
  '{}', '{}'
),
(
  'a1b2c3d4-0010-4000-8000-000000000000',
  'Affitto posteggio abbigliamento donna - Mercato Via Triumplina, Brescia',
  'Affitto posteggio fisso di 32 mq al mercato di Via Triumplina, Brescia. Due giorni a settimana: martedi e sabato. Settore abbigliamento donna, con spazio adeguato per struttura portaabiti, bancone, specchio e deposito leggero. Zona residenziale consolidata, clientela locale affezionata e stabile. Cerco subentro serio per periodo minimo di due anni con opzione di rinnovo. Posteggio funzionante e in regola, nessun arretrato con il Comune. Ideale per chi vuole iniziare senza acquistare subito.',
  'Affitto', 'Fisso', 'Abbigliamento', 'Lombardia', 'BS', 'Brescia',
  32, 'Martedi, Sabato',
  4200, 'Federico N.', 'active',
  now() - interval '14 days', now() - interval '14 days' + interval '200 days',
  '{}', '{}'
);

SELECT
  a.titolo,
  a.comune,
  a.superficie,
  a.prezzo,
  a.contatto,
  p.nome || ' ' || COALESCE(p.cognome, '') AS profilo_nome,
  a.status
FROM annunci a
JOIN profiles p ON p.id = a.user_id
WHERE a.contatto IN (
  'Carla M.', 'Marco V.', 'Elena R.', 'Giovanna F.', 'Roberto A.',
  'Luigi B.', 'Stefania C.', 'Antonio P.', 'Mirella G.', 'Federico N.'
)
ORDER BY a.created_at DESC;
