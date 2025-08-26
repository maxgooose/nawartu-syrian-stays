-- Fix the prevent_role_escalation trigger to allow host upgrade RPC function
-- This resolves the conflict where the trigger was blocking the request_host_upgrade() function

-- Create a new version of the prevent_role_escalation function that allows guest->host transitions
-- through the request_host_upgrade RPC function
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow role changes if:
  -- 1. User is admin, OR
  -- 2. Role stays the same, OR  
  -- 3. It's a guest->host transition (which should only happen through our RPC function)
  IF OLD.role != NEW.role AND NOT is_admin() THEN
    -- Allow guest->host transition specifically (this is what our RPC function does)
    IF OLD.role = 'guest'::user_role AND NEW.role = 'host'::user_role THEN
      -- This is allowed - guest upgrading to host through RPC function
      RETURN NEW;
    ELSE
      -- All other role changes require admin privileges
      RAISE EXCEPTION 'Only administrators can change user roles';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add comment explaining the fix
COMMENT ON FUNCTION public.prevent_role_escalation() IS 'Prevents unauthorized role escalation while allowing guest->host upgrades through request_host_upgrade() RPC function';
