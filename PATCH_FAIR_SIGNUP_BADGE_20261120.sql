-- Bollino amministrativo permanente dalla pagina effettiva di registrazione.
-- Nessuna deduzione da UTM, prima visita o attività successive all'iscrizione.
BEGIN;

CREATE TABLE IF NOT EXISTS account_private.fair_signups (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    registration_path text NOT NULL CHECK (length(registration_path) <= 200),
    recorded_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE account_private.fair_signups ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON account_private.fair_signups FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION account_private.is_fair_registration_path(p_path text)
RETURNS boolean LANGUAGE sql STABLE SET search_path = '' AS $$
    SELECT coalesce(
        p_path ~ '^/fier[ae](/[a-z0-9_-]+)?$'
        OR EXISTS (
            SELECT 1 FROM public.blog_posts b
            WHERE '/blog/' || b.slug = p_path AND b.published_at <= now()
              AND (
                lower(btrim(b.category)) = 'fiere'
                OR b.slug = ANY (ARRAY[
                    'autorizzazione-temporanea-sagre-fiere-ambulanti',
                    'bolkestein-fiere-durata-concessione',
                    'graduatoria-fiera-presenze-mancanti-correzione',
                    'fiere-lombardia-domande-aperte',
                    'fiera-annullata-maltempo-rimborso-posteggio',
                    'miglioria-fiera-perdere-vecchio-posteggio',
                    'fiera-san-faustino-brescia-posteggi-accessi-furgoni',
                    'domande-respinte-fiere-checklist',
                    'partecipare-fiera-incasso-minimo',
                    'due-fiere-stesso-fine-settimana-scegliere',
                    'dati-visitatori-fiera-domande-organizzatore'
                ])
              )
        ), false);
$$;
REVOKE ALL ON FUNCTION account_private.is_fair_registration_path(text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION account_private.record_fair_signup()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
    v_path text := NEW.raw_user_meta_data->>'registration_path';
BEGIN
    IF length(v_path) <= 200 AND account_private.is_fair_registration_path(v_path) THEN
        INSERT INTO account_private.fair_signups(user_id, registration_path)
        VALUES (NEW.id, v_path) ON CONFLICT (user_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION account_private.record_fair_signup() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS record_fair_signup ON auth.users;
CREATE TRIGGER record_fair_signup AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION account_private.record_fair_signup();

-- Conserva firma, controlli, paginazione e campi dell'elenco corrente.
CREATE OR REPLACE FUNCTION public.admin_user_directory(p_offset integer DEFAULT 0, p_limit integer DEFAULT 1000)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NOT(coalesce(auth.role(),'')='service_role' OR data_quality.is_admin()) THEN RAISE EXCEPTION 'Accesso amministratore richiesto' USING ERRCODE='42501'; END IF;
 IF p_offset<0 OR p_limit NOT BETWEEN 1 AND 2000 THEN RAISE EXCEPTION 'Paginazione non valida'; END IF;
 RETURN jsonb_build_object('total',(SELECT count(*) FROM auth.users),'users',coalesce((SELECT jsonb_agg(to_jsonb(t)) FROM (
   SELECT u.id,u.email,u.created_at,u.last_sign_in_at,u.email_confirmed_at AS confirmed_at,
      p.nome,p.cognome,p.telefono,p.email_digest,p.email_stats,
      u.raw_user_meta_data->>'email_verification_mode' AS verification_mode,
      CASE WHEN f.user_id IS NOT NULL THEN 'fiera' END AS registration_badge,
      (SELECT count(*) FROM public.annunci a WHERE a.user_id=u.id AND a.status='active' AND (a.expires_at IS NULL OR a.expires_at>now())) AS annunci_active,
      (SELECT count(*) FROM public.annunci a WHERE a.user_id=u.id) AS annunci_total,
      (SELECT count(*) FROM public.messaggi m WHERE m.mittente_id=u.id) AS messaggi_inviati,
      (SELECT count(*) FROM public.conversazioni c WHERE c.venditore_id=u.id AND NOT c.is_support AND EXISTS(SELECT 1 FROM public.messaggi m WHERE m.conversazione_id=c.id)) AS contatti_ricevuti
   FROM auth.users u LEFT JOIN public.profiles p ON p.id=u.id
   LEFT JOIN account_private.fair_signups f ON f.user_id=u.id
   ORDER BY u.created_at DESC,u.id LIMIT p_limit OFFSET p_offset
 ) t),'[]'));
END $$;
REVOKE ALL ON FUNCTION public.admin_user_directory(integer,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_user_directory(integer,integer) TO authenticated, service_role;

COMMIT;
