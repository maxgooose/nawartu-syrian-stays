-- Fix infinite recursion by using security definer function
-- Drop problematic policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Create security definer function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT role::text FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Create new policies using the function
CREATE POLICY "Users and admins can view profiles" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.get_current_user_role() = 'admin'
);

CREATE POLICY "Users and admins can update profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  public.get_current_user_role() = 'admin'
)
WITH CHECK (
  auth.uid() = user_id OR 
  public.get_current_user_role() = 'admin'
);