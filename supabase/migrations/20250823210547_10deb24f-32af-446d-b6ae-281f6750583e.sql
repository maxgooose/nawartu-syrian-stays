-- Create user roles enum
CREATE TYPE public.user_role AS ENUM ('guest', 'host', 'admin');

-- Create user booking payment method enum
CREATE TYPE public.payment_method AS ENUM ('cash', 'stripe');

-- Create listing status enum
CREATE TYPE public.listing_status AS ENUM ('pending', 'approved', 'rejected');

-- Create booking status enum  
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'guest',
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'ar',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create listings table
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  location TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  price_per_night_usd DECIMAL(10, 2) NOT NULL,
  price_per_night_syp DECIMAL(15, 2),
  max_guests INTEGER NOT NULL DEFAULT 2,
  bedrooms INTEGER DEFAULT 1,
  bathrooms INTEGER DEFAULT 1,
  images TEXT[] DEFAULT '{}',
  status listing_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  total_nights INTEGER NOT NULL,
  total_amount_usd DECIMAL(10, 2) NOT NULL,
  total_amount_syp DECIMAL(15, 2),
  payment_method payment_method NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  special_requests TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure check-out is after check-in
  CONSTRAINT valid_date_range CHECK (check_out_date > check_in_date),
  -- Ensure total nights matches date difference
  CONSTRAINT valid_total_nights CHECK (total_nights = (check_out_date - check_in_date))
);

-- Create terms acceptance table
CREATE TABLE public.terms_acceptance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  terms_version TEXT NOT NULL DEFAULT 'v1.0',
  accepted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin approvals table
CREATE TABLE public.admin_approvals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL, -- 'listing' or 'booking'
  target_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'approved' or 'rejected'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.terms_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_approvals ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for listings
CREATE POLICY "Anyone can view approved listings" 
ON public.listings 
FOR SELECT 
USING (status = 'approved');

CREATE POLICY "Hosts can view their own listings" 
ON public.listings 
FOR SELECT 
USING (host_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Hosts can create listings" 
ON public.listings 
FOR INSERT 
WITH CHECK (host_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'host'));

CREATE POLICY "Hosts can update their own listings" 
ON public.listings 
FOR UPDATE 
USING (host_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create policies for bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (guest_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()) 
       OR listing_id IN (SELECT id FROM public.listings WHERE host_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())));

CREATE POLICY "Guests can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (guest_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update their own bookings" 
ON public.bookings 
FOR UPDATE 
USING (guest_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create policies for terms acceptance
CREATE POLICY "Users can view their own terms acceptance" 
ON public.terms_acceptance 
FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create terms acceptance" 
ON public.terms_acceptance 
FOR INSERT 
WITH CHECK (user_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Create policies for admin approvals (admin only)
CREATE POLICY "Admins can view all approvals" 
ON public.admin_approvals 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins can create approvals" 
ON public.admin_approvals 
FOR INSERT 
WITH CHECK (admin_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
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

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check cash booking constraints
CREATE OR REPLACE FUNCTION public.check_cash_booking_constraints()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for cash booking constraints
CREATE TRIGGER check_cash_booking_constraints_trigger
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_cash_booking_constraints();

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_listings_host_id ON public.listings(host_id);
CREATE INDEX idx_listings_status ON public.listings(status);
CREATE INDEX idx_bookings_guest_id ON public.bookings(guest_id);
CREATE INDEX idx_bookings_listing_id ON public.bookings(listing_id);
CREATE INDEX idx_bookings_dates ON public.bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_payment_method ON public.bookings(payment_method);
CREATE INDEX idx_bookings_status ON public.bookings(status);