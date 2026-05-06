-- Fase 4.3 — RPC admin per "rinfrescare" published_at di un blog post.
-- Bumping mirato (slug) per spingere Google a ricrawl articoli stale.
-- SECURITY DEFINER + check is_admin.

CREATE OR REPLACE FUNCTION public.admin_bump_post_freshness(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_caller uuid := auth.uid();
    v_is_admin boolean;
    v_new_ts timestamptz;
BEGIN
    IF v_caller IS NULL THEN
        RAISE EXCEPTION 'unauthorized' USING ERRCODE = '42501';
    END IF;
    SELECT COALESCE(is_admin, false) INTO v_is_admin FROM public.profiles WHERE id = v_caller;
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
    END IF;

    UPDATE public.blog_posts
       SET published_at = now()
     WHERE slug = p_slug
     RETURNING published_at INTO v_new_ts;

    IF v_new_ts IS NULL THEN
        RETURN jsonb_build_object('ok', false, 'error', 'slug_not_found');
    END IF;

    RETURN jsonb_build_object('ok', true, 'slug', p_slug, 'published_at', v_new_ts);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_bump_post_freshness(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_bump_post_freshness(text) TO authenticated;
