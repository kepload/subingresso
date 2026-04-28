-- ============================================================
--  SUBINGRESSO.IT - Profili Finti per Annunci Demo
--  File opzionale: INSERT_ANNUNCI_DEMO.sql crea gia' questi profili.
--  Usalo solo se vuoi preparare/aggiornare i profili senza toccare annunci.
-- ============================================================

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

SELECT id, nome, cognome, created_at
FROM profiles
WHERE id IN (
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
ORDER BY created_at DESC;
