# URGENT: Fix Authentication Issue for New Users

## Problem Identified
New users cannot sign up because the RLS (Row Level Security) INSERT policy on the `profiles` table is blocking the `handle_new_user()` trigger from creating profiles.

## Root Cause
- The INSERT policy: `WITH CHECK (auth.uid() = user_id)` 
- The trigger runs with `SECURITY DEFINER` privileges
- During trigger execution, `auth.uid()` is NULL but `user_id` is the new user's ID
- The check fails, preventing profile creation
- This leads to "authentication issue couldnot stablish session" errors

## IMMEDIATE FIX REQUIRED

### Step 1: Apply the Migration
Run this SQL in your Supabase SQL Editor **immediately**:

```sql
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
```

### Step 2: Test New User Registration
1. Try creating a new user account with Google OAuth
2. Try creating a new user account with email/password
3. Verify that profiles are created successfully
4. Verify that session establishment works

### Step 3: Optional - Clean up existing broken accounts
If there are users who signed up but don't have profiles, you may need to:
1. Identify them: `SELECT * FROM auth.users WHERE id NOT IN (SELECT user_id FROM public.profiles);`
2. Create profiles for them manually or have them re-register

## Alternative Solution (if the above doesn't work)
If the above solution has security concerns, use this more restrictive approach:

```sql
-- Drop the policy
DROP POLICY IF EXISTS "Allow profile creation" ON public.profiles;

-- Create a function to check if this is a trigger-based insert
CREATE OR REPLACE FUNCTION public.is_trigger_context()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('application_name', true) = 'handle_new_user';
$$;

-- Update the trigger to set context
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
SET application_name = 'handle_new_user'
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

-- Create policy that allows trigger context
CREATE POLICY "Allow profile creation" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR public.is_trigger_context()
);
```

## Status
- [x] Issue identified
- [x] Root cause found  
- [x] Migration created
- [ ] **URGENT: Apply migration to database**
- [ ] Test new user registration
- [ ] Verify fix works

**This needs to be applied immediately to restore new user registration functionality.**
