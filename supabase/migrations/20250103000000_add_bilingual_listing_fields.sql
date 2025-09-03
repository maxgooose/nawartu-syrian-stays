-- Add bilingual support for listing names, descriptions, and locations
-- This migration adds separate English and Arabic fields for better language separation

-- Add new bilingual columns to listings table
ALTER TABLE public.listings 
ADD COLUMN name_en TEXT,
ADD COLUMN name_ar TEXT,
ADD COLUMN description_en TEXT,
ADD COLUMN description_ar TEXT,
ADD COLUMN location_en TEXT,
ADD COLUMN location_ar TEXT;

-- Migrate existing data: assume current name/description/location are in Arabic by default
-- Hosts can later update with English versions
UPDATE public.listings 
SET 
  name_ar = name,
  description_ar = description,
  location_ar = location
WHERE name_ar IS NULL OR description_ar IS NULL OR location_ar IS NULL;

-- For now, set English versions to the same as Arabic (hosts will update these)
UPDATE public.listings 
SET 
  name_en = name,
  description_en = description,
  location_en = location
WHERE name_en IS NULL OR description_en IS NULL OR location_en IS NULL;

-- Add constraints to ensure at least one language version exists
ALTER TABLE public.listings 
ADD CONSTRAINT check_name_not_both_null 
CHECK (name_en IS NOT NULL OR name_ar IS NOT NULL);

ALTER TABLE public.listings 
ADD CONSTRAINT check_description_not_both_null 
CHECK (description_en IS NOT NULL OR description_ar IS NOT NULL);

ALTER TABLE public.listings 
ADD CONSTRAINT check_location_not_both_null 
CHECK (location_en IS NOT NULL OR location_ar IS NOT NULL);

-- Add comment explaining the migration
COMMENT ON COLUMN public.listings.name_en IS 'English version of listing name';
COMMENT ON COLUMN public.listings.name_ar IS 'Arabic version of listing name';
COMMENT ON COLUMN public.listings.description_en IS 'English version of listing description';
COMMENT ON COLUMN public.listings.description_ar IS 'Arabic version of listing description';
COMMENT ON COLUMN public.listings.location_en IS 'English version of listing location';
COMMENT ON COLUMN public.listings.location_ar IS 'Arabic version of listing location';
COMMENT ON COLUMN public.listings.name IS 'Deprecated: use name_en and name_ar instead';
COMMENT ON COLUMN public.listings.description IS 'Deprecated: use description_en and description_ar instead';
COMMENT ON COLUMN public.listings.location IS 'Deprecated: use location_en and location_ar instead';
