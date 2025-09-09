# Image Upload Issue Fix - RESOLVED ✅

## Issue Identified
Hosts are unable to upload images when **editing existing listings** (after admin approval). The issue was actually a **bucket name mismatch**, not RLS policies.

## Root Cause
**CRITICAL WORKFLOW BUG:** The `EditListing.tsx` component was using the wrong storage bucket:

1. **CreateListing.tsx**: ✅ Uses `bucketName="listing-images"` (correct)
2. **EditListing.tsx**: ❌ Missing `bucketName` prop, defaulted to `"property-images"` (doesn't exist)
3. **ImageUpload.tsx**: ❌ Had wrong default `bucketName = "property-images"`

**Timeline:**
1. Host creates listing (no images) → Works ✅
2. Admin approves listing
3. Host tries to add images via Edit → **Fails** ❌ (wrong bucket)

This explains why the issue happened specifically after listing approval!

## Current Problematic Policy
```sql
CREATE POLICY "Hosts can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## Fix Required
The policy needs to also check that the user has the 'host' role in the profiles table.

## Manual Fix Instructions

### Option 1: Through Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Storage** → **Policies**
3. Find the policies for `listing-images` bucket
4. Delete the existing policies:
   - "Hosts can upload listing images" 
   - "Hosts can update their listing images"
   - "Hosts can delete their listing images"

5. Create new policies with the following SQL:

```sql
-- For INSERT (upload)
CREATE POLICY "Hosts can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'host'::user_role
  )
);

-- For UPDATE
CREATE POLICY "Hosts can update their listing images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'host'::user_role
  )
);

-- For DELETE
CREATE POLICY "Hosts can delete their listing images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'listing-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'host'::user_role
  )
);
```

### Option 2: Through SQL Editor
1. Go to **SQL Editor** in your Supabase dashboard
2. Run the migration file: `supabase/migrations/20250110000000_fix_listing_images_rls_policy.sql`

## Testing the Fix
1. Have a user become a host through the `/become-host` page
2. Navigate to `/create-listing` 
3. Try uploading images
4. Check browser console for detailed error logs (added in the fix)

## Additional Improvements Made
- Added detailed error logging in ImageUpload component
- Logs will show exact error messages, file details, and user information
- This will help diagnose any remaining issues

## Files Modified
- `src/components/ImageUpload.tsx` - Added better error logging
- `supabase/migrations/20250110000000_fix_listing_images_rls_policy.sql` - New migration file with RLS policy fix
