-- Fix search path for handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name'),
    COALESCE(NEW.raw_user_meta_data ->> 'preferred_language', 'ar')
  );
  RETURN NEW;
END;
$$;

-- Fix search path for update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix search path for check_cash_booking_constraints function
CREATE OR REPLACE FUNCTION public.check_cash_booking_constraints()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if payment method is cash
  IF NEW.payment_method = 'cash' THEN
    -- Check booking is at least 48 hours in advance
    IF NEW.check_in_date <= CURRENT_DATE + INTERVAL '2 days' THEN
      RAISE EXCEPTION 'Cash bookings must be made at least 48 hours before check-in';
    END IF;
    
    -- Check maximum 2 days for cash booking
    IF NEW.total_nights > 2 THEN
      RAISE EXCEPTION 'Cash bookings are limited to maximum 2 nights initially';
    END IF;
    
    -- Check only one active cash booking per user
    IF EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE guest_id = NEW.guest_id 
        AND payment_method = 'cash' 
        AND status IN ('pending', 'confirmed')
        AND check_out_date >= CURRENT_DATE
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'You can only have one active cash booking at a time';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;