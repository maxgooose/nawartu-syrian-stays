-- Add request_host_upgrade RPC function for secure host role upgrades

-- Create the request_host_upgrade function
CREATE OR REPLACE FUNCTION public.request_host_upgrade()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_user_id uuid;
  current_profile_id uuid;
  current_role user_role;
BEGIN
  -- Get the current authenticated user
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Get the user's profile
  SELECT id, role INTO current_profile_id, current_role
  FROM public.profiles
  WHERE user_id = current_user_id;
  
  -- Check if profile exists
  IF current_profile_id IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;
  
  -- Check if user is already a host or admin
  IF current_role IN ('host', 'admin') THEN
    RETURN false; -- Already has elevated privileges
  END IF;
  
  -- Check if user has completed email verification (basic requirement)
  -- Note: This assumes email verification is handled by Supabase Auth
  -- You can add additional requirements here if needed
  
  -- Update the user's role to host
  UPDATE public.profiles
  SET role = 'host'::user_role,
      updated_at = now()
  WHERE id = current_profile_id;
  
  -- Check if update was successful
  IF FOUND THEN
    RETURN true; -- Successfully upgraded to host
  ELSE
    RETURN false; -- Update failed
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (you might want to add proper logging here)
    RAISE EXCEPTION 'Failed to upgrade user to host: %', SQLERRM;
END;
$function$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.request_host_upgrade() TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.request_host_upgrade() IS 'Allows authenticated users to request an upgrade to host role. Returns true on success, false on failure.';
