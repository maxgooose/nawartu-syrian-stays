-- Debug Why Approved Listings Aren't Showing
-- Run this in Supabase SQL Editor to diagnose the issue

-- Step 1: Check if the listings actually exist and are approved
SELECT 'LISTINGS CHECK:' as debug_step,
       id, name, location, status, 
       host_id,
       (SELECT email FROM public.profiles WHERE id = host_id) as host_email,
       created_at
FROM public.listings 
WHERE status = 'approved'
ORDER BY created_at DESC;

-- Step 2: Check if there are ANY listings at all
SELECT 'ALL LISTINGS:' as debug_step,
       COUNT(*) as total_count,
       COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
       COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
       COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count
FROM public.listings;

-- Step 3: Check current RLS policies on listings table
SELECT 'RLS POLICIES:' as debug_step, 
       schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'listings';

-- Step 4: Test if you can access listings as current user
SELECT 'ACCESS TEST:' as debug_step,
       'Current user can see these listings:' as info,
       COUNT(*) as visible_listings
FROM public.listings;

-- Step 5: Check your current auth context
SELECT 'AUTH CHECK:' as debug_step,
       auth.uid() as current_auth_uid,
       (SELECT email FROM public.profiles WHERE user_id = auth.uid()) as current_email,
       (SELECT role FROM public.profiles WHERE user_id = auth.uid()) as current_role;

-- Step 6: Manual test of the exact query the frontend uses
SELECT 'FRONTEND QUERY TEST:' as debug_step,
       l.*,
       p.full_name as host_full_name
FROM public.listings l
LEFT JOIN public.profiles p ON l.host_id = p.id
WHERE l.status = 'approved'
ORDER BY l.created_at DESC;
