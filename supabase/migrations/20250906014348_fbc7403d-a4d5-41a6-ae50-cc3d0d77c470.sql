-- Update the handle_new_user function to better handle Google OAuth data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, preferred_language, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'full_name', 
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'given_name' || ' ' || NEW.raw_user_meta_data ->> 'family_name',
      ''
    ),
    COALESCE(NEW.raw_user_meta_data ->> 'preferred_language', 'ar'),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', '')
  );
  RETURN NEW;
END;
$$;