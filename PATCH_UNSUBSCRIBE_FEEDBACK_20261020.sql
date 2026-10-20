-- Optional categorical feedback. No email, user ID, token or free text.
BEGIN;
CREATE TABLE IF NOT EXISTS public.email_unsubscribe_feedback (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_on date NOT NULL DEFAULT CURRENT_DATE,
    email_type text NOT NULL CHECK (email_type IN ('digest','stats','all','bando_alert')),
    reason text NOT NULL CHECK (reason IN ('too_many','not_relevant','not_using','already_found','other'))
);
ALTER TABLE public.email_unsubscribe_feedback ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.email_unsubscribe_feedback FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON public.email_unsubscribe_feedback TO service_role;
COMMIT;
