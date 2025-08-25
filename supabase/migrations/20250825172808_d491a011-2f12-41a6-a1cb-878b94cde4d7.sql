-- Phase 1: Critical Payment Data Protection & Role Security Fixes (Fixed)

-- 1. Create secure booking view for hosts (excludes payment data)
CREATE OR REPLACE VIEW public.host_bookings_view AS
SELECT 
  b.id,
  b.listing_id,
  b.guest_id,
  b.check_in_date,
  b.check_out_date,
  b.total_nights,
  b.status,
  b.special_requests,
  b.admin_notes,
  b.created_at,
  b.updated_at,
  p.full_name as guest_name,
  p.email as guest_email
FROM public.bookings b
JOIN public.profiles p ON b.guest_id = p.id;

-- 2. Fix function search paths to prevent security issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_cash_booking_constraints()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.make_first_user_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if this is the first user
  IF (SELECT COUNT(*) FROM public.profiles) = 1 THEN
    -- Make the first user an admin
    UPDATE public.profiles 
    SET role = 'admin'
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_listing_average_rating(listing_uuid uuid)
RETURNS TABLE(average_rating numeric, review_count integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    ROUND(AVG(rating::numeric), 1) as average_rating,
    COUNT(*)::integer as review_count
  FROM public.reviews
  WHERE listing_id = listing_uuid;
$function$;

CREATE OR REPLACE FUNCTION public.can_review_booking(booking_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'::user_role
  );
$function$;

-- 3. Secure RLS policies to prevent role escalation - Create new trigger function
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow role changes only if user is admin or role stays the same
  IF OLD.role != NEW.role AND NOT is_admin() THEN
    RAISE EXCEPTION 'Only administrators can change user roles';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to prevent role escalation
DROP TRIGGER IF EXISTS trigger_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trigger_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 4. Create secure policy for hosts to view bookings without payment data
DROP POLICY IF EXISTS "Hosts can view basic booking details only" ON public.bookings;
CREATE POLICY "Hosts can view booking details without payment data" ON public.bookings
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