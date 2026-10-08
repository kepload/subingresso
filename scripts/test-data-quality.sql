-- Nessuna email o dato test persistente: anche la coda pg_net viene annullata.
BEGIN;
CREATE FUNCTION pg_temp.must_fail(sql text,expected text DEFAULT NULL) RETURNS void LANGUAGE plpgsql AS $$
DECLARE failed boolean:=false;
BEGIN
  BEGIN EXECUTE sql; EXCEPTION WHEN OTHERS THEN
    failed:=true;
    IF expected IS NOT NULL AND SQLSTATE<>expected THEN RAISE EXCEPTION 'Errore diverso dal previsto: % (%), query %',SQLERRM,SQLSTATE,sql; END IF;
  END;
  IF NOT failed THEN RAISE EXCEPTION 'Scrittura/accesso non valido accettato: %',sql; END IF;
END $$;
DO $$ DECLARE owner_id uuid; admin_id uuid; admin_email text; BEGIN
 SELECT p.id INTO owner_id FROM public.profiles p JOIN auth.users u ON u.id=p.id WHERE NOT coalesce(p.is_admin,false) AND NOT p.is_demo LIMIT 1;
 SELECT p.id,u.email INTO admin_id,admin_email FROM public.profiles p JOIN auth.users u ON u.id=p.id WHERE p.is_admin LIMIT 1;
 IF owner_id IS NULL OR admin_id IS NULL THEN RAISE EXCEPTION 'Identità test mancanti'; END IF;
 PERFORM set_config('dq.owner',owner_id::text,true); PERFORM set_config('dq.admin',admin_id::text,true); PERFORM set_config('dq.admin_email',admin_email,true);
 PERFORM set_config('dq.listing',gen_random_uuid()::text,true); PERFORM set_config('dq.conversation',gen_random_uuid()::text,true);
 PERFORM set_config('dq.session',gen_random_uuid()::text,true);
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',owner_id,'role','authenticated','email','qa@example.invalid')::text,true);
 PERFORM set_config('request.jwt.claim.sub',owner_id::text,true);
END $$;
SET LOCAL ROLE authenticated;
DO $$ DECLARE uid uuid:=current_setting('dq.owner')::uuid; v_id uuid:=current_setting('dq.listing')::uuid; BEGIN
 PERFORM pg_temp.must_fail('SELECT public.admin_get_recent_users(1)','42501');
 PERFORM pg_temp.must_fail('SELECT public.admin_control_room()','42501');
 PERFORM pg_temp.must_fail(format('SELECT public.admin_user_details(%L)',uid),'42501');
 PERFORM pg_temp.must_fail(format('UPDATE public.profiles SET is_admin=true WHERE id=%L',uid),'42501');
 PERFORM pg_temp.must_fail(format('UPDATE public.profiles SET created_at=now() WHERE id=%L',uid),'42501');
 PERFORM pg_temp.must_fail(format('UPDATE public.profiles SET telefono=%L WHERE id=%L','test3471234567',uid),'23514');
 PERFORM pg_temp.must_fail('SELECT telefono FROM public.profiles LIMIT 1','42501');
 IF (public.get_my_profile()->>'nome') IS NULL THEN RAISE EXCEPTION 'Profilo privato non disponibile'; END IF;
 UPDATE public.profiles SET telefono='+39 347 1234567' WHERE profiles.id=uid;
 INSERT INTO public.annunci(id,user_id,titolo,descrizione,stato,tipo,settore,comune,provincia,regione,superficie,giorni,prezzo,contatto,tel,status,img_urls,dettagli_extra,created_at)
 VALUES(v_id,uid,'Prova controlli qualità dati','Posteggio di prova per verificare i controlli automatici senza pubblicazione definitiva.',
  'Affitto mensile','Mercato settimanale','Abbigliamento e accessori','Brescia','Brescia','Lombardia',12.5,'Sabato',15000.50,'Test qualità','0039 347 1234567','active','{}','{"images":[]}',now()-interval '50 years');
 IF NOT EXISTS(SELECT 1 FROM public.annunci a WHERE a.id=v_id AND a.status='pending' AND a.created_at>now()-interval '1 minute' AND a.prezzo=15000.50 AND a.superficie=12.5) THEN RAISE EXCEPTION 'Dati validi persi o stato falso'; END IF;
 PERFORM pg_temp.must_fail(format('UPDATE public.annunci SET prezzo=100 WHERE id=%L',v_id),'23514');
 PERFORM pg_temp.must_fail(format('UPDATE public.annunci SET prezzo=%L WHERE id=%L','NaN',v_id),'23514');
 PERFORM pg_temp.must_fail(format('UPDATE public.annunci SET superficie=0 WHERE id=%L',v_id),'23514');
 PERFORM pg_temp.must_fail(format('UPDATE public.annunci SET superficie=10.999 WHERE id=%L',v_id),'23514');
 PERFORM pg_temp.must_fail(format('UPDATE public.annunci SET tel=%L WHERE id=%L','mail3471234567',v_id),'23514');
 PERFORM pg_temp.must_fail(format('UPDATE public.annunci SET provincia=%L WHERE id=%L','Milano',v_id),'23514');
 PERFORM pg_temp.must_fail(format('UPDATE public.annunci SET settore=%L WHERE id=%L','Settore inventato',v_id),'23514');
 PERFORM pg_temp.must_fail(format('UPDATE public.annunci SET visualizzazioni=1000000 WHERE id=%L',v_id),'42501');
 PERFORM pg_temp.must_fail(format('UPDATE public.annunci SET expires_at=now()+interval ''20 years'' WHERE id=%L',v_id),'42501');
 INSERT INTO public.alerts(user_id,comune,regione,lat,lng,raggio_km) VALUES(uid,'Brescia','Lombardia',0,0,100);
 IF NOT EXISTS(SELECT 1 FROM public.alerts WHERE user_id=uid AND comune='Brescia' AND lat BETWEEN 45 AND 46 AND lng BETWEEN 10 AND 11 AND raggio_km=100) THEN RAISE EXCEPTION 'Coordinate alert non ricalcolate'; END IF;
 PERFORM pg_temp.must_fail(format('INSERT INTO public.alerts(user_id,comune) VALUES(%L,%L)',uid,'località inventata'));
 PERFORM pg_temp.must_fail(format('INSERT INTO public.alerts(user_id,comune,raggio_km) VALUES(%L,%L,0)',uid,'Brescia'));
 PERFORM pg_temp.must_fail(format('INSERT INTO public.conversazioni(annuncio_id,acquirente_id,venditore_id) VALUES(%L,%L,%L)',v_id,uid,current_setting('dq.admin')));
END $$;
RESET ROLE;
DO $$ BEGIN
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('dq.admin'),'role','authenticated','email',current_setting('dq.admin_email'))::text,true);
 PERFORM set_config('request.jwt.claim.sub',current_setting('dq.admin'),true);
END $$;
SET LOCAL ROLE authenticated;
DO $$ DECLARE result jsonb; uid uuid:=current_setting('dq.owner')::uuid; BEGIN
 result:=public.admin_control_room();
 IF NOT(result ? 'summary') OR NOT(result ? 'issues') OR NOT(result ? 'automations') THEN RAISE EXCEPTION 'Riepilogo admin incompleto'; END IF;
 IF (result->'summary'->>'locations_loaded')::int<60000 THEN RAISE EXCEPTION 'Anagrafica incompleta'; END IF;
 IF (public.admin_user_details(uid)->>'id')::uuid<>uid THEN RAISE EXCEPTION 'Profilo admin errato'; END IF;
 IF jsonb_array_length(public.admin_user_directory(0,1)->'users')<>1 THEN RAISE EXCEPTION 'Directory admin errata'; END IF;
 UPDATE public.annunci SET status='active' WHERE id=current_setting('dq.listing')::uuid;
END $$;
RESET ROLE;
DO $$ BEGIN
 PERFORM set_config('request.jwt.claims',jsonb_build_object('sub',current_setting('dq.owner'),'role','authenticated','email','qa@example.invalid')::text,true);
 PERFORM set_config('request.jwt.claim.sub',current_setting('dq.owner'),true);
END $$;
DO $$ DECLARE buyer uuid; aid uuid:=gen_random_uuid(); bid uuid:=gen_random_uuid(); lid uuid:=current_setting('dq.listing')::uuid; BEGIN
 SELECT p.id INTO buyer FROM public.profiles p WHERE p.id<>current_setting('dq.owner')::uuid AND NOT EXISTS(SELECT 1 FROM public.alerts al WHERE al.user_id=p.id) LIMIT 1;
 IF buyer IS NULL THEN RAISE EXCEPTION 'Destinatario geografico test mancante'; END IF;
 INSERT INTO public.alerts(id,user_id,comune,regione,raggio_km) VALUES(aid,buyer,'Milano','Lombardia',25);
 IF EXISTS(SELECT 1 FROM public.matching_listing_alerts(lid) WHERE user_id=buyer AND comune='Milano') THEN RAISE EXCEPTION 'Avviso fuori raggio'; END IF;
 UPDATE public.alerts SET raggio_km=100 WHERE id=aid;
 IF NOT EXISTS(SELECT 1 FROM public.matching_listing_alerts(lid) WHERE user_id=buyer AND comune='Milano') THEN RAISE EXCEPTION 'Avviso nel raggio non trovato'; END IF;
 UPDATE public.alerts SET tipo='Fiera' WHERE id=aid;
 IF EXISTS(SELECT 1 FROM public.matching_listing_alerts(lid) WHERE user_id=buyer AND comune='Milano') THEN RAISE EXCEPTION 'Tipo avviso ignorato'; END IF;
 INSERT INTO public.alerts(id,user_id,regione) VALUES(bid,buyer,'Lazio');
 IF EXISTS(SELECT 1 FROM public.matching_listing_alerts(lid) WHERE user_id=buyer AND comune IS NULL) THEN RAISE EXCEPTION 'Regione avviso ignorata'; END IF;
 UPDATE public.alerts SET regione='Lombardia' WHERE id=bid;
 IF NOT EXISTS(SELECT 1 FROM public.matching_listing_alerts(lid) WHERE user_id=buyer AND comune IS NULL) THEN RAISE EXCEPTION 'Avviso regionale non trovato'; END IF;
 IF EXISTS(SELECT 1 FROM public.matching_listing_alerts(lid) WHERE user_id=current_setting('dq.owner')::uuid) THEN RAISE EXCEPTION 'Avviso al proprietario'; END IF;
END $$;
SET LOCAL ROLE authenticated;
DO $$ DECLARE uid uuid:=current_setting('dq.owner')::uuid; BEGIN
 UPDATE public.annunci SET titolo='Prova modifica e revisione obbligatoria' WHERE id=current_setting('dq.listing')::uuid;
 IF NOT EXISTS(SELECT 1 FROM public.annunci WHERE id=current_setting('dq.listing')::uuid AND status='pending') THEN RAISE EXCEPTION 'Modifica senza moderazione'; END IF;
 INSERT INTO public.conversazioni(id,acquirente_id,venditore_id,is_support) VALUES(current_setting('dq.conversation')::uuid,uid,current_setting('dq.admin')::uuid,true);
 INSERT INTO public.messaggi(conversazione_id,mittente_id,testo) VALUES(current_setting('dq.conversation')::uuid,uid,'Messaggio di prova');
 PERFORM pg_temp.must_fail(format('INSERT INTO public.messaggi(conversazione_id,mittente_id,testo) VALUES(%L,%L,%L)',current_setting('dq.conversation'),uid,'   '));
 PERFORM pg_temp.must_fail(format('UPDATE public.messaggi SET testo=%L WHERE conversazione_id=%L','Messaggio falsificato',current_setting('dq.conversation')));
END $$;
RESET ROLE;
SET LOCAL ROLE anon;
DO $$ DECLARE s text:=current_setting('dq.session'); before_count integer; BEGIN
 IF has_table_privilege('anon','public.profiles','TRUNCATE') OR has_table_privilege('authenticated','public.annunci','TRUNCATE') THEN RAISE EXCEPTION 'TRUNCATE ancora aperto'; END IF;
 PERFORM pg_temp.must_fail('SELECT public.admin_get_recent_users(1)','42501');
 INSERT INTO public.page_views(path,visitor_id,session_id,created_at) VALUES('/annunci',s,s,now()-interval '50 years');
 INSERT INTO public.page_views(path,visitor_id,session_id) VALUES('/annunci',s,s);
 PERFORM pg_temp.must_fail(format('INSERT INTO public.page_views(path,visitor_id,session_id) VALUES(%L,%L,%L)','/reset?token=segreto',s,s));
 PERFORM pg_temp.must_fail(format('INSERT INTO public.blog_conversions(post_slug,kind,visitor_id,session_id) VALUES(%L,%L,%L,%L)','guida','alert_signup',s,s),'42501');
 INSERT INTO public.blog_conversions(post_slug,kind,visitor_id,session_id) VALUES('guida','cta_annunci_click',s,s),('guida','cta_annunci_click',s,s);
END $$;
RESET ROLE;
DO $$ DECLARE s text:=current_setting('dq.session'); BEGIN
 IF (SELECT count(*) FROM public.page_views WHERE session_id=s)<>1 OR NOT EXISTS(SELECT 1 FROM public.page_views WHERE session_id=s AND created_at>now()-interval '1 minute') THEN RAISE EXCEPTION 'Deduplica/date visite errate'; END IF;
 IF (SELECT count(*) FROM public.blog_conversions WHERE session_id=s)<>1 THEN RAISE EXCEPTION 'Deduplica blog errata'; END IF;
END $$;
SELECT 'OK: input, ruoli, annunci, geografia, chat, statistiche e admin' AS result;
ROLLBACK;
