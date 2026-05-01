-- Auto-promote justafiliado@proton.me to admin on signup
CREATE OR REPLACE FUNCTION public.promote_authorized_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'justafiliado@proton.me' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_promote_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_promote_admin
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.promote_authorized_admin();