-- Real-Time Booking & Availability Management System
-- Migration: 20250101000000_availability_management_system.sql

-- Create availability status enum
CREATE TYPE public.availability_status AS ENUM (
  'available', 
  'booked', 
  'blocked', 
  'maintenance', 
  'reserved'
);

-- Create constraint types enum
CREATE TYPE public.constraint_type AS ENUM (
  'min_stay', 
  'max_stay', 
  'advance_booking', 
  'same_day_booking', 
  'weekend_only', 
  'seasonal_pricing',
  'weekend_pricing',
  'holiday_pricing'
);

-- Create property availability table for real-time tracking
CREATE TABLE public.property_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status availability_status NOT NULL DEFAULT 'available',
  price_modifier DECIMAL(5,2) DEFAULT 1.00, -- For dynamic pricing (1.0 = base price, 1.5 = 50% increase)
  min_stay_nights INTEGER DEFAULT 1,
  max_stay_nights INTEGER DEFAULT 30,
  reserved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- For temporary reservations
  reserved_until TIMESTAMP WITH TIME ZONE, -- When reservation expires
  notes TEXT, -- Host notes for blocked dates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(listing_id, date)
);

-- Create booking constraints table
CREATE TABLE public.booking_constraints (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  constraint_type constraint_type NOT NULL,
  value JSONB NOT NULL, -- Flexible constraint storage
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_property_availability_listing_date ON public.property_availability(listing_id, date);
CREATE INDEX idx_property_availability_status ON public.property_availability(status);
CREATE INDEX idx_property_availability_reserved_until ON public.property_availability(reserved_until) WHERE reserved_until IS NOT NULL;
CREATE INDEX idx_booking_constraints_listing ON public.booking_constraints(listing_id);
CREATE INDEX idx_booking_constraints_dates ON public.booking_constraints(start_date, end_date);

-- Enable RLS
ALTER TABLE public.property_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_constraints ENABLE ROW LEVEL SECURITY;

-- RLS Policies for property_availability
CREATE POLICY "Anyone can view available dates" 
ON public.property_availability 
FOR SELECT 
USING (status IN ('available', 'booked'));

CREATE POLICY "Hosts can view all their property availability" 
ON public.property_availability 
FOR SELECT 
USING (listing_id IN (SELECT id FROM public.listings WHERE host_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Hosts can manage their property availability" 
ON public.property_availability 
FOR ALL 
USING (listing_id IN (SELECT id FROM public.listings WHERE host_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "System can create reservations" 
ON public.property_availability 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "System can update reservations" 
ON public.property_availability 
FOR UPDATE 
USING (true);

-- RLS Policies for booking_constraints
CREATE POLICY "Anyone can view active constraints" 
ON public.booking_constraints 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Hosts can manage their constraints" 
ON public.booking_constraints 
FOR ALL 
USING (listing_id IN (SELECT id FROM public.listings WHERE host_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

-- Function to initialize availability for a listing (next 365 days)
CREATE OR REPLACE FUNCTION initialize_listing_availability(
  p_listing_id UUID,
  p_days_ahead INTEGER DEFAULT 365
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.property_availability (listing_id, date, status)
  SELECT 
    p_listing_id,
    generate_series(
      CURRENT_DATE,
      CURRENT_DATE + (p_days_ahead || ' days')::interval,
      '1 day'::interval
    )::date,
    'available'
  ON CONFLICT (listing_id, date) DO NOTHING;
END;
$$;

-- Function to check availability for date range
CREATE OR REPLACE FUNCTION check_availability(
  p_listing_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_guests INTEGER DEFAULT 1
)
RETURNS TABLE(
  is_available BOOLEAN,
  available_nights INTEGER,
  total_nights INTEGER,
  base_price DECIMAL(10,2),
  total_price DECIMAL(10,2),
  constraints JSONB,
  blocked_dates DATE[]
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_nights INTEGER;
  v_available_nights INTEGER;
  v_base_price DECIMAL(10,2);
  v_total_price DECIMAL(10,2);
  v_constraints JSONB;
  v_blocked_dates DATE[];
  v_listing_max_guests INTEGER;
BEGIN
  -- Calculate total nights
  v_total_nights := p_check_out - p_check_in;
  
  -- Get listing details
  SELECT max_guests, price_per_night_usd 
  INTO v_listing_max_guests, v_base_price
  FROM listings 
  WHERE id = p_listing_id;
  
  -- Check if listing exists and guest count is valid
  IF v_listing_max_guests IS NULL THEN
    RETURN QUERY SELECT false, 0, v_total_nights, 0::DECIMAL(10,2), 0::DECIMAL(10,2), '{}'::jsonb, ARRAY[]::DATE[];
    RETURN;
  END IF;
  
  IF p_guests > v_listing_max_guests THEN
    RETURN QUERY SELECT false, 0, v_total_nights, v_base_price, 0::DECIMAL(10,2), 
      jsonb_build_object('error', 'Too many guests')::jsonb, ARRAY[]::DATE[];
    RETURN;
  END IF;
  
  -- Check available nights and get blocked dates
  SELECT 
    COUNT(*) FILTER (WHERE pa.status = 'available'),
    ARRAY_AGG(pa.date) FILTER (WHERE pa.status != 'available')
  INTO v_available_nights, v_blocked_dates
  FROM generate_series(p_check_in, p_check_out - 1, '1 day'::interval) AS date_series(date)
  LEFT JOIN property_availability pa ON pa.listing_id = p_listing_id AND pa.date = date_series.date::date;
  
  -- Calculate total price with modifiers
  SELECT COALESCE(SUM(
    v_base_price * COALESCE(pa.price_modifier, 1.0)
  ), v_base_price * v_total_nights) 
  INTO v_total_price
  FROM generate_series(p_check_in, p_check_out - 1, '1 day'::interval) AS date_series(date)
  LEFT JOIN property_availability pa ON pa.listing_id = p_listing_id AND pa.date = date_series.date::date
  WHERE COALESCE(pa.status, 'available') = 'available';
  
  -- Get booking constraints
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'type', bc.constraint_type,
      'value', bc.value,
      'start_date', bc.start_date,
      'end_date', bc.end_date
    )
  ), '[]'::jsonb) INTO v_constraints
  FROM booking_constraints bc
  WHERE bc.listing_id = p_listing_id
    AND bc.is_active = true
    AND (bc.start_date IS NULL OR bc.start_date <= p_check_out)
    AND (bc.end_date IS NULL OR bc.end_date >= p_check_in);
  
  RETURN QUERY SELECT
    (v_available_nights = v_total_nights),
    v_available_nights,
    v_total_nights,
    v_base_price,
    v_total_price,
    v_constraints,
    COALESCE(v_blocked_dates, ARRAY[]::DATE[]);
END;
$$;

-- Function to reserve dates (temporary hold)
CREATE OR REPLACE FUNCTION reserve_dates(
  p_listing_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_user_id UUID,
  p_hold_duration_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_availability_check RECORD;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if dates are still available
  SELECT * INTO v_availability_check 
  FROM check_availability(p_listing_id, p_check_in, p_check_out, 1);
  
  IF NOT v_availability_check.is_available THEN
    RETURN FALSE;
  END IF;
  
  -- Calculate expiration time
  v_expires_at := now() + (p_hold_duration_minutes || ' minutes')::interval;
  
  -- Create or update availability records for the date range
  INSERT INTO property_availability (listing_id, date, status, reserved_by, reserved_until)
  SELECT 
    p_listing_id, 
    generate_series(p_check_in, p_check_out - 1, '1 day'::interval)::date,
    'reserved',
    p_user_id,
    v_expires_at
  ON CONFLICT (listing_id, date) 
  DO UPDATE SET 
    status = CASE 
      WHEN property_availability.status = 'available' THEN 'reserved'
      ELSE property_availability.status
    END,
    reserved_by = CASE 
      WHEN property_availability.status = 'available' THEN p_user_id
      ELSE property_availability.reserved_by
    END,
    reserved_until = CASE 
      WHEN property_availability.status = 'available' THEN v_expires_at
      ELSE property_availability.reserved_until
    END,
    updated_at = now()
  WHERE property_availability.status = 'available';
  
  RETURN TRUE;
END;
$$;

-- Function to release reservation
CREATE OR REPLACE FUNCTION release_reservation(
  p_listing_id UUID,
  p_check_in DATE,
  p_check_out DATE,
  p_user_id UUID DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE property_availability
  SET 
    status = 'available',
    reserved_by = NULL,
    reserved_until = NULL,
    updated_at = now()
  WHERE listing_id = p_listing_id
    AND date >= p_check_in
    AND date < p_check_out
    AND status = 'reserved'
    AND (p_user_id IS NULL OR reserved_by = p_user_id);
END;
$$;

-- Function to confirm booking (convert reservation to booked)
CREATE OR REPLACE FUNCTION confirm_booking(
  p_booking_id UUID,
  p_listing_id UUID,
  p_check_in DATE,
  p_check_out DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update availability to booked
  UPDATE property_availability
  SET 
    status = 'booked',
    reserved_by = NULL,
    reserved_until = NULL,
    updated_at = now()
  WHERE listing_id = p_listing_id
    AND date >= p_check_in
    AND date < p_check_out
    AND status IN ('available', 'reserved');
  
  -- Update booking status
  UPDATE bookings
  SET 
    status = 'confirmed',
    updated_at = now()
  WHERE id = p_booking_id;
  
  RETURN TRUE;
END;
$$;

-- Function to cleanup expired reservations
CREATE OR REPLACE FUNCTION cleanup_expired_reservations()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE property_availability
  SET 
    status = 'available',
    reserved_by = NULL,
    reserved_until = NULL,
    updated_at = now()
  WHERE status = 'reserved'
    AND reserved_until < now();
END;
$$;

-- Function to get listing availability for date range
CREATE OR REPLACE FUNCTION get_listing_availability(
  p_listing_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  date DATE,
  status availability_status,
  price_modifier DECIMAL(5,2),
  min_stay_nights INTEGER,
  is_available BOOLEAN
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.date,
    COALESCE(pa.status, 'available'::availability_status) as status,
    COALESCE(pa.price_modifier, 1.0) as price_modifier,
    COALESCE(pa.min_stay_nights, 1) as min_stay_nights,
    COALESCE(pa.status, 'available'::availability_status) = 'available' as is_available
  FROM generate_series(p_start_date, p_end_date, '1 day'::interval) AS d(date)
  LEFT JOIN property_availability pa ON pa.listing_id = p_listing_id AND pa.date = d.date::date
  ORDER BY d.date;
END;
$$;

-- Trigger to automatically initialize availability when a listing is approved
CREATE OR REPLACE FUNCTION trigger_initialize_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only initialize when listing becomes approved
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    PERFORM initialize_listing_availability(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_listing_approved
  AFTER UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_initialize_availability();

-- Trigger to update timestamps
CREATE TRIGGER update_property_availability_timestamp
  BEFORE UPDATE ON public.property_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_booking_constraints_timestamp
  BEFORE UPDATE ON public.booking_constraints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample constraints for demo
INSERT INTO public.booking_constraints (listing_id, constraint_type, value, is_active)
SELECT 
  l.id,
  'min_stay'::constraint_type,
  jsonb_build_object('nights', 2),
  true
FROM public.listings l
WHERE l.status = 'approved'
LIMIT 5;

-- Initialize availability for existing approved listings
DO $$
DECLARE
  listing_record RECORD;
BEGIN
  FOR listing_record IN SELECT id FROM public.listings WHERE status = 'approved' LOOP
    PERFORM initialize_listing_availability(listing_record.id);
  END LOOP;
END $$;

-- Create a job to cleanup expired reservations (this would typically be handled by pg_cron or similar)
-- For now, we'll just create the function and document that it should be called periodically
COMMENT ON FUNCTION cleanup_expired_reservations() IS 'This function should be called every 5 minutes via cron job or scheduled task';
