REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.grant_first_user_admin() FROM anon, authenticated, public;