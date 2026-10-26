BEGIN;
CREATE TABLE IF NOT EXISTS public.contextual_ad_rules (
 scope text NOT NULL CHECK(scope IN ('ad','post')),
 key text NOT NULL CHECK(length(key) BETWEEN 1 AND 180),
 rule jsonb NOT NULL CHECK(jsonb_typeof(rule)='object'),
 revision bigint NOT NULL DEFAULT 1 CHECK(revision>0),
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(scope,key)
);
ALTER TABLE public.contextual_ad_rules ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.contextual_ad_rules FROM PUBLIC,anon,authenticated;

CREATE OR REPLACE FUNCTION public.contextual_ad_rules()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT jsonb_build_object(
 'ads',COALESCE((SELECT jsonb_object_agg(key,jsonb_build_object('rule',rule,'revision',revision)) FROM public.contextual_ad_rules WHERE scope='ad'),'{}'::jsonb),
 'posts',COALESCE((SELECT jsonb_object_agg(key,jsonb_build_object('rule',rule,'revision',revision)) FROM public.contextual_ad_rules WHERE scope='post'),'{}'::jsonb));
$$;
REVOKE ALL ON FUNCTION public.contextual_ad_rules() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.contextual_ad_rules() TO anon,authenticated;

CREATE OR REPLACE FUNCTION public.admin_contextual_ad_rules()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin IS TRUE)
 THEN RAISE EXCEPTION 'Solo amministratore' USING ERRCODE='42501'; END IF;
 RETURN public.contextual_ad_rules();
END;
$$;
REVOKE ALL ON FUNCTION public.admin_contextual_ad_rules() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_contextual_ad_rules() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_save_contextual_ad_rule(p_scope text,p_key text,p_rule jsonb,p_revision bigint)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE field text; terms jsonb; term text; result jsonb;
BEGIN
 IF auth.uid() IS NULL OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid() AND is_admin IS TRUE)
 THEN RAISE EXCEPTION 'Solo amministratore' USING ERRCODE='42501'; END IF;
 IF p_scope IS NULL OR p_scope NOT IN ('ad','post') OR p_key IS NULL OR p_revision IS NULL OR p_revision<0
 OR p_rule IS NULL OR jsonb_typeof(p_rule)<>'object' OR octet_length(p_rule::text)>8000
 THEN RAISE EXCEPTION 'Regola non valida' USING ERRCODE='22023'; END IF;
 IF p_scope='ad' THEN
  IF p_key !~ '^(vendi-0[1-7]|compra-0[1-7]|fiere-0[1-6])$'
   OR (p_rule-'priorityKeywords'-'excludedKeywords')<>'{}'::jsonb
   OR NOT (p_rule ?& ARRAY['priorityKeywords','excludedKeywords'])
  THEN RAISE EXCEPTION 'ADS o campi non validi' USING ERRCODE='22023'; END IF;
  FOREACH field IN ARRAY ARRAY['priorityKeywords','excludedKeywords'] LOOP
   terms:=p_rule->field;
   IF jsonb_typeof(terms)<>'array' OR jsonb_array_length(terms)>20
   THEN RAISE EXCEPTION 'Massimo 20 parole o frasi per campo' USING ERRCODE='22023'; END IF;
   IF EXISTS(SELECT 1 FROM jsonb_array_elements(terms) v WHERE jsonb_typeof(v)<>'string')
   THEN RAISE EXCEPTION 'Parole non valide' USING ERRCODE='22023'; END IF;
   FOR term IN SELECT jsonb_array_elements_text(terms) LOOP
    IF length(term) NOT BETWEEN 2 AND 80 OR term !~ '^[a-z0-9]+( [a-z0-9]+)*$'
    THEN RAISE EXCEPTION 'Parole non valide' USING ERRCODE='22023'; END IF;
   END LOOP;
   IF (SELECT count(DISTINCT v) FROM jsonb_array_elements_text(terms) v)<>jsonb_array_length(terms)
   THEN RAISE EXCEPTION 'Parole duplicate' USING ERRCODE='22023'; END IF;
  END LOOP;
 ELSE
  IF length(p_key)>180 OR p_key !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
   OR NOT EXISTS(SELECT 1 FROM public.blog_posts WHERE slug=p_key)
   OR (p_rule-'topics'-'excludedAds')<>'{}'::jsonb
   OR NOT (p_rule ?& ARRAY['topics','excludedAds'])
  THEN RAISE EXCEPTION 'Articolo o campi non validi' USING ERRCODE='22023'; END IF;
  IF p_rule->'topics'<>'null'::jsonb THEN
   terms:=p_rule->'topics';
   IF jsonb_typeof(terms)<>'array' OR jsonb_array_length(terms)>4
   THEN RAISE EXCEPTION 'Argomenti non validi' USING ERRCODE='22023'; END IF;
   IF EXISTS(SELECT 1 FROM jsonb_array_elements(terms) v WHERE jsonb_typeof(v)<>'string' OR v#>>'{}' NOT IN ('fiere','vendita','acquisto','mercati'))
   THEN RAISE EXCEPTION 'Argomenti non validi' USING ERRCODE='22023'; END IF;
  END IF;
  terms:=p_rule->'excludedAds';
  IF jsonb_typeof(terms)<>'array' OR jsonb_array_length(terms)>20
  THEN RAISE EXCEPTION 'Esclusioni non valide' USING ERRCODE='22023'; END IF;
  IF EXISTS(SELECT 1 FROM jsonb_array_elements(terms) v WHERE jsonb_typeof(v)<>'string' OR v#>>'{}' !~ '^(vendi-0[1-7]|compra-0[1-7]|fiere-0[1-6])$')
  THEN RAISE EXCEPTION 'ADS escluse non valide' USING ERRCODE='22023'; END IF;
 END IF;
 INSERT INTO public.contextual_ad_rules(scope,key,rule,revision,updated_at)
 SELECT p_scope,p_key,p_rule,1,clock_timestamp() WHERE p_revision=0
 ON CONFLICT(scope,key) DO NOTHING;
 IF NOT FOUND THEN
  UPDATE public.contextual_ad_rules SET rule=p_rule,revision=revision+1,updated_at=clock_timestamp()
  WHERE scope=p_scope AND key=p_key AND revision=p_revision AND p_revision>0;
  IF NOT FOUND THEN RAISE EXCEPTION 'Regola modificata da un altro accesso. Ricarica prima di salvare.' USING ERRCODE='40001'; END IF;
 END IF;
 SELECT jsonb_build_object('rule',rule,'revision',revision) INTO result FROM public.contextual_ad_rules WHERE scope=p_scope AND key=p_key;
 RETURN result;
END;
$$;
REVOKE ALL ON FUNCTION public.admin_save_contextual_ad_rule(text,text,jsonb,bigint) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_save_contextual_ad_rule(text,text,jsonb,bigint) TO authenticated;
COMMIT;
