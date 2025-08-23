-- Create reviews table
CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL,
  guest_id uuid NOT NULL,
  listing_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  comment text NOT NULL,
  host_response text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(booking_id) -- One review per booking
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reviews
CREATE POLICY "Anyone can view reviews for approved listings"
ON public.reviews
FOR SELECT
USING (listing_id IN (
  SELECT id FROM public.listings 
  WHERE status = 'approved'::listing_status
));

CREATE POLICY "Guests can view their own reviews"
ON public.reviews
FOR SELECT
USING (guest_id IN (
  SELECT id FROM public.profiles 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Hosts can view reviews for their listings"
ON public.reviews
FOR SELECT
USING (listing_id IN (
  SELECT id FROM public.listings 
  WHERE host_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Guests can create reviews for completed bookings"
ON public.reviews
FOR INSERT
WITH CHECK (
  -- Must be their own booking
  guest_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
  AND
  -- Booking must be completed
  booking_id IN (
    SELECT id FROM public.bookings 
    WHERE guest_id IN (
      SELECT id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
    AND status = 'completed'::booking_status
    AND check_out_date < CURRENT_DATE
  )
);

CREATE POLICY "Hosts can update reviews with responses"
ON public.reviews
FOR UPDATE
USING (listing_id IN (
  SELECT id FROM public.listings 
  WHERE host_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
))
WITH CHECK (listing_id IN (
  SELECT id FROM public.listings 
  WHERE host_id IN (
    SELECT id FROM public.profiles 
    WHERE user_id = auth.uid()
  )
));

-- Trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate average rating for a listing
CREATE OR REPLACE FUNCTION public.get_listing_average_rating(listing_uuid uuid)
RETURNS TABLE (
  average_rating numeric,
  review_count integer
) 
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    ROUND(AVG(rating::numeric), 1) as average_rating,
    COUNT(*)::integer as review_count
  FROM public.reviews
  WHERE listing_id = listing_uuid;
$$;

-- Function to check if user can review a booking
CREATE OR REPLACE FUNCTION public.can_review_booking(booking_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
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