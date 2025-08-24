-- Add latitude and longitude columns to listings table for Google Maps integration
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add index for spatial queries
CREATE INDEX IF NOT EXISTS idx_listings_coordinates ON public.listings(latitude, longitude);