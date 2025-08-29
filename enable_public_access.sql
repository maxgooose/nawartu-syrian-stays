-- Enable Public Access to Approved Listings
-- Simple fix - just ensure public can see approved listings

-- Step 1: Remove the restrictive public policy if it exists
DROP POLICY IF EXISTS "Anyone can view approved listings" ON public.listings;
DROP POLICY IF EXISTS "Public can view approved listings" ON public.listings;

-- Step 2: Create a simple public access policy for approved listings
CREATE POLICY "Public access to approved listings" 
ON public.listings 
FOR SELECT 
USING (status = 'approved');

-- Step 3: Test that it works
SELECT 'TEST - Public should see these approved listings:' as info,
       id, name, location, status, created_at
FROM public.listings 
WHERE status = 'approved'
ORDER BY created_at DESC;
