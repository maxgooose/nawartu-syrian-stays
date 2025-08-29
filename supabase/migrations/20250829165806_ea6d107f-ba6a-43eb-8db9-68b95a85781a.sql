-- Fix infinite recursion in profiles RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Create new policies without recursion
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role = 'admin'::user_role
  )
);

CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role = 'admin'::user_role
  )
)
WITH CHECK (
  auth.uid() = user_id OR 
  auth.uid() IN (
    SELECT user_id FROM public.profiles WHERE role = 'admin'::user_role
  )
);