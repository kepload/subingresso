-- Solo il nuovo tipo di click. RLS, deduplica e regole degli eventi restano attive.
BEGIN;
ALTER TABLE public.blog_conversions DROP CONSTRAINT IF EXISTS blog_conversions_kind_check;
ALTER TABLE public.blog_conversions ADD CONSTRAINT blog_conversions_kind_check
    CHECK (kind IN ('cta_annunci_click','alert_signup','box_listing_click','cta_fiere_click'));
COMMIT;
