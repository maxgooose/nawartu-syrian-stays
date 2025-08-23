-- Fix security warnings for function search paths
CREATE OR REPLACE FUNCTION public.get_listing_average_rating(listing_uuid uuid)
RETURNS TABLE (
  average_rating numeric,
  review_count integer
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ROUND(AVG(rating::numeric), 1) as average_rating,
    COUNT(*)::integer as review_count
  FROM public.reviews
  WHERE listing_id = listing_uuid;
$$;

CREATE OR REPLACE FUNCTION public.can_review_booking(booking_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.bookings b
    JOIN public.profiles p ON b.guest_id = p.id
    WHERE b.id = booking_uuid
      AND p.user_id = auth.uid()
      AND b.status = 'completed'::booking_status
      AND b.check_out_date < CURRENT_DATE
      AND NOT EXISTS (
        SELECT 1 FROM public.reviews r 
        WHERE r.booking_id = booking_uuid
      )
  );
$$;