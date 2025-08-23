-- Create a function to make the first user an admin
CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if this is the first user
  IF (SELECT COUNT(*) FROM public.profiles) = 1 THEN
    -- Make the first user an admin
    UPDATE public.profiles 
    SET role = 'admin'
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically make first user admin
DROP TRIGGER IF EXISTS make_first_user_admin_trigger ON public.profiles;
CREATE TRIGGER make_first_user_admin_trigger
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.make_first_user_admin();

-- If you already have a user account, you can manually update it to admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';