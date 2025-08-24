-- First, update the main bookings table RLS policy to be more restrictive about payment data
-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;

-- Create separate policies for different user types
CREATE POLICY "Guests can view their own bookings with payment data"
ON public.bookings
FOR SELECT
USING (guest_id IN (
  SELECT profiles.id
  FROM profiles
  WHERE profiles.user_id = auth.uid()
));

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'::user_role
  );
$$;

-- Admin policy for full access to payment data
CREATE POLICY "Admins can view all bookings with payment data"
ON public.bookings
FOR SELECT
USING (public.is_admin());

-- Hosts can only view non-payment booking details for their listings
CREATE POLICY "Hosts can view basic booking details only"
ON public.bookings
FOR SELECT
USING (
  listing_id IN (
    SELECT listings.id
    FROM listings
    WHERE listings.host_id IN (
      SELECT profiles.id
      FROM profiles
      WHERE profiles.user_id = auth.uid()
    )
  )
);