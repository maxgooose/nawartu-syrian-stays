-- Create a restricted view for hosts that excludes sensitive payment data
CREATE OR REPLACE VIEW public.host_bookings AS
SELECT 
  id,
  listing_id,
  guest_id,
  check_in_date,
  check_out_date,
  total_nights,
  status,
  special_requests,
  admin_notes,
  created_at,
  updated_at
FROM public.bookings;

-- Enable RLS on the view
ALTER VIEW public.host_bookings SET (security_barrier = true);

-- Create RLS policies for the host view
CREATE POLICY "Hosts can view bookings for their listings"
ON public.host_bookings
FOR SELECT
USING (listing_id IN (
  SELECT listings.id
  FROM listings
  WHERE listings.host_id IN (
    SELECT profiles.id
    FROM profiles
    WHERE profiles.user_id = auth.uid()
  )
));

-- Update the main bookings table RLS policy to be more restrictive about payment data
-- First drop the existing policy
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

CREATE POLICY "Hosts can view booking details but no payment data"
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
  AND FALSE -- This will be handled by the host_bookings view instead
);

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