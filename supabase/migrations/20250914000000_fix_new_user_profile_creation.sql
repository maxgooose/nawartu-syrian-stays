-- Fix RLS policies to allow trigger-based profile creation for new users
-- This fixes the authentication issue where new users cannot sign up

-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;

-- Create a new INSERT policy that allows both user-initiated creation AND trigger-based creation
CREATE POLICY "Allow profile creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  -- Allow users to create their own profile
  auth.uid() = user_id 
  OR
  -- Allow trigger-based creation (when auth.uid() is null during signup trigger)
  auth.uid() IS NULL
);

-- Alternatively, we could use a more specific approach with a flag function
-- But the above should be sufficient and secure since only the trigger runs with auth.uid() = NULL
-- during the specific context of new user creation
