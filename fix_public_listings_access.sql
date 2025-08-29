-- Fix Public Access to Approved Listings
-- This will allow the browse page to show approved listings

-- Step 1: Remove any conflicting policies
DROP POLICY IF EXISTS "Anyone can view approved listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can view all listings" ON public.listings;

-- Step 2: Create proper public access policy for approved listings
CREATE POLICY "Public can view approved listings" 
ON public.listings 
FOR SELECT 
USING (status = 'approved');

-- Step 3: Allow hosts to see their own listings (any status)
CREATE POLICY "Hosts can view their own listings" 
ON public.listings 
FOR SELECT 
USING (host_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Step 4: Allow admins to see ALL listings
CREATE POLICY "Admins can view all listings" 
ON public.listings 
FOR ALL
USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Step 5: Verify the policies are working
SELECT 'POLICY CHECK:' as step,
       schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'listings'
ORDER BY policyname;

-- Step 6: Test public access to approved listings (this should work)
SELECT 'PUBLIC ACCESS TEST:' as step,
       id, name, location, status, created_at
FROM public.listings 
WHERE status = 'approved'
ORDER BY created_at DESC;
