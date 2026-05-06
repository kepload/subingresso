-- Fase 0.2: tracking conversioni blog (CTA annunci, alert signup, click box live).
-- Pseudonimo by-design: solo visitor_id/session_id (no IP, no UA, no email).
-- RLS: anon+authenticated INSERT, SELECT solo via RPC SECURITY DEFINER per admin.

BEGIN;

CREATE TABLE IF NOT EXISTS public.blog_conversions (
    id          bigserial PRIMARY KEY,
    post_slug   text,
    regione     text,
    kind        text NOT NULL CHECK (kind IN ('cta_annunci_click','alert_signup','box_listing_click')),
    visitor_id  text,
    session_id  text,
    created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_conv_slug    ON public.blog_conversions (post_slug);
CREATE INDEX IF NOT EXISTS idx_blog_conv_kind    ON public.blog_conversions (kind);
CREATE INDEX IF NOT EXISTS idx_blog_conv_created ON public.blog_conversions (created_at DESC);

ALTER TABLE public.blog_conversions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Insert conversioni blog" ON public.blog_conversions;
CREATE POLICY "Insert conversioni blog"
    ON public.blog_conversions
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

GRANT INSERT ON public.blog_conversions TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE public.blog_conversions_id_seq TO anon, authenticated;

COMMIT;
