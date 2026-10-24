// Migrazione e fixture nella stessa transazione: zero scritture pubbliche persistenti.
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const migration = fs.readFileSync(path.join(root, 'PATCH_CHAT_RELIABILITY_20261024.sql'), 'utf8');
const start = migration.indexOf('CREATE OR REPLACE FUNCTION public.get_chat_inbox(');
const end = migration.indexOf('END $fn$;', start) + 'END $fn$;'.length;
let clone = migration.slice(start, end).replace('public.get_chat_inbox(', 'public.qa_chat_inbox_test(');
for (const [from, to] of [['public.conversazioni', 'pg_temp.qa_chat_conversations'], ['public.messaggi', 'pg_temp.qa_chat_messages'], ['public.profiles', 'pg_temp.qa_chat_profiles'], ['public.annunci', 'pg_temp.qa_chat_listings']]) clone = clone.replaceAll(from, to);
const fixture = `
CREATE TEMP TABLE qa_chat_conversations (LIKE public.conversazioni INCLUDING DEFAULTS);
CREATE TEMP TABLE qa_chat_messages (LIKE public.messaggi INCLUDING DEFAULTS);
CREATE TEMP TABLE qa_chat_profiles (id uuid, nome text, cognome text, avatar_url text, is_admin boolean);
CREATE TEMP TABLE qa_chat_listings (id uuid, titolo text, img_urls text[], prezzo numeric, stato text, tipo text, comune text, status text);
INSERT INTO qa_chat_profiles(id,nome,cognome,is_admin) VALUES
('11111111-1111-4111-8111-111111111111','Carlo','Riva',false),
('22222222-2222-4222-8222-222222222222','Sara','Verdi',false),
('33333333-3333-4333-8333-333333333333','Elena','Bianchi',false);
INSERT INTO qa_chat_listings(id,titolo,prezzo,stato,tipo,comune,status) VALUES
('cccccccc-cccc-4ccc-8ccc-cccccccccccc','Posteggio mercato',3000,'Affitto mensile','Mercato settimanale','Brescia','active');
INSERT INTO qa_chat_conversations(id,annuncio_id,acquirente_id,venditore_id,is_support,created_at) VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','cccccccc-cccc-4ccc-8ccc-cccccccccccc','11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333',false,'2026-10-20'),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',null,'22222222-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111',false,'2026-10-20'),
('dddddddd-dddd-4ddd-8ddd-dddddddddddd',null,'22222222-2222-4222-8222-222222222222','33333333-3333-4333-8333-333333333333',false,'2026-10-20'),
('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',null,'11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333',true,'2026-10-20'),
('ffffffff-ffff-4fff-8fff-ffffffffffff',null,'11111111-1111-4111-8111-111111111111','33333333-3333-4333-8333-333333333333',false,'2026-10-20');
INSERT INTO qa_chat_messages(id,conversazione_id,mittente_id,testo,letto,created_at)
SELECT ('10000000-0000-4000-8000-'||lpad(i::text,12,'0'))::uuid,'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','33333333-3333-4333-8333-333333333333',
    'Storico '||i,i<=1202,'2026-10-24T10:00:00Z'::timestamptz+i*interval '1 microsecond' FROM generate_series(1,1205) i;
INSERT INTO qa_chat_messages(conversazione_id,mittente_id,testo,letto,created_at) VALUES
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','22222222-2222-4222-8222-222222222222','Richiesta nel ruolo venditore',false,'2026-10-24T09:00:00Z'),
('dddddddd-dddd-4ddd-8ddd-dddddddddddd','22222222-2222-4222-8222-222222222222','Non visibile a Carlo',false,'2026-10-24T11:00:00Z');
${clone}
REVOKE ALL ON FUNCTION public.qa_chat_inbox_test(integer,timestamptz,uuid) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.qa_chat_inbox_test(integer,timestamptz,uuid) TO authenticated;
DO $test$
DECLARE result jsonb; next_page jsonb; user_id uuid; item jsonb; expected uuid; count_unread bigint;
BEGIN
 IF has_function_privilege('anon','public.get_chat_inbox(integer,timestamptz,uuid)','EXECUTE')
 OR NOT has_function_privilege('authenticated','public.get_chat_inbox(integer,timestamptz,uuid)','EXECUTE') THEN RAISE EXCEPTION 'Grant inbox'; END IF;
 PERFORM set_config('request.jwt.claims','{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}',true);
 PERFORM set_config('request.jwt.claim.sub','11111111-1111-4111-8111-111111111111',true);
 SET LOCAL ROLE authenticated;
 result:=public.qa_chat_inbox_test(100);
 IF jsonb_array_length(result->'items')<>3 THEN RAISE EXCEPTION 'Inbox fixture non corretta'; END IF;
 IF result->'items'->0->'lastMessage'->>'testo'<>'Storico 1205' OR (result->'items'->0->>'unread_count')::integer<>3 THEN RAISE EXCEPTION 'Ultimo messaggio o non letti oltre limite 1000'; END IF;
 IF result->'items'->0->'annuncio'->>'stato'<>'Affitto mensile' THEN RAISE EXCEPTION 'Unita canone mancante'; END IF;
 IF result::text LIKE '%Non visibile%' OR result::text LIKE '%telefono%' OR result::text LIKE '%email%' THEN RAISE EXCEPTION 'Dati estranei o recapiti privati'; END IF;
 result:=public.qa_chat_inbox_test(1);
 IF NOT (result->>'has_more')::boolean THEN RAISE EXCEPTION 'Paginazione mancante'; END IF;
 next_page:=public.qa_chat_inbox_test(1,(result->'items'->0->>'activity_at')::timestamptz,(result->'items'->0->>'id')::uuid);
 IF next_page->'items'->0->>'id'<>'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb' THEN RAISE EXCEPTION 'Cursore non stabile'; END IF;
 BEGIN PERFORM public.qa_chat_inbox_test(40,now(),null); RAISE EXCEPTION 'Cursore parziale accettato'; EXCEPTION WHEN invalid_parameter_value THEN NULL; END;
 RESET ROLE;
 PERFORM set_config('request.jwt.claim.sub','',true); PERFORM set_config('request.jwt.claims','{}',true);
 BEGIN PERFORM public.qa_chat_inbox_test(); RAISE EXCEPTION 'Anonimo accettato'; EXCEPTION WHEN insufficient_privilege THEN NULL; END;
 -- Dati reali: solo SELECT. Ogni interlocutore vede esclusivamente le proprie righe.
 FOR user_id IN SELECT acquirente_id FROM public.conversazioni UNION SELECT venditore_id FROM public.conversazioni LOOP
  PERFORM set_config('request.jwt.claim.sub',user_id::text,true);
  PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',user_id,'role','authenticated')::text,true);
  SET LOCAL ROLE authenticated;
  result:=public.get_chat_inbox(100);
  RESET ROLE;
  FOR item IN SELECT value FROM jsonb_array_elements(result->'items') LOOP
   IF item->>'acquirente_id'<>user_id::text AND item->>'venditore_id'<>user_id::text THEN RAISE EXCEPTION 'Conversazione altrui'; END IF;
   SELECT m.id INTO expected FROM public.messaggi m WHERE m.conversazione_id=(item->>'id')::uuid ORDER BY m.created_at DESC,m.id DESC LIMIT 1;
   IF expected::text IS DISTINCT FROM item->'lastMessage'->>'id' THEN RAISE EXCEPTION 'Ultimo messaggio reale discordante'; END IF;
   SELECT count(*) INTO count_unread FROM public.messaggi m WHERE m.conversazione_id=(item->>'id')::uuid AND m.mittente_id<>user_id AND coalesce(m.letto,false)=false;
   IF count_unread<>(item->>'unread_count')::bigint THEN RAISE EXCEPTION 'Non letti reali discordanti'; END IF;
  END LOOP;
 END LOOP;
END $test$;
SELECT jsonb_build_object('passed',true,'rollback',true,'synthetic_messages',1207,'public_message_writes',0) AS result;
ROLLBACK;
`;
(async () => {
    const query = migration.replace(/COMMIT;\s*$/, '') + fixture;
    const token = process.env.SUPABASE_ACCESS_TOKEN || JSON.parse(fs.readFileSync(path.join(root, '.claude/settings.local.json'), 'utf8')).env.SUPABASE_ACCESS_TOKEN;
    const response = await fetch('https://api.supabase.com/v1/projects/mhfbtltgwibwmsudsuvf/database/query', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify({ query }), signal: AbortSignal.timeout(45000) });
    const rows = await response.json(); if (!response.ok) throw Error('SQL test: ' + JSON.stringify(rows));
    assert(rows.some(row => row.result?.passed));
    if (process.env.CHAT_QA_DIR) fs.writeFileSync(path.join(process.env.CHAT_QA_DIR, 'database-test.json'), JSON.stringify(rows, null, 2));
    console.log('OK SQL/ROLLBACK: isolamento, 1207 messaggi sintetici, ultimo messaggio, non letti, cursori, grant e parita con dati reali in sola lettura.');
})().catch(error => { console.error(error.message); process.exitCode = 1; });
