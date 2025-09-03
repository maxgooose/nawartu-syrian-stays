-- Add translation metadata to track auto-translated content
-- This helps distinguish between human-provided and machine translations

-- Add metadata columns to listings table
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS name_en_auto_translated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS name_ar_auto_translated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS description_en_auto_translated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS description_ar_auto_translated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS location_en_auto_translated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS location_ar_auto_translated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_translation_update TIMESTAMP WITH TIME ZONE;

-- Add comments explaining the fields
COMMENT ON COLUMN public.listings.name_en_auto_translated IS 'True if name_en was auto-translated from Arabic';
COMMENT ON COLUMN public.listings.name_ar_auto_translated IS 'True if name_ar was auto-translated from English';
COMMENT ON COLUMN public.listings.description_en_auto_translated IS 'True if description_en was auto-translated from Arabic';
COMMENT ON COLUMN public.listings.description_ar_auto_translated IS 'True if description_ar was auto-translated from English';
COMMENT ON COLUMN public.listings.location_en_auto_translated IS 'True if location_en was auto-translated from Arabic';
COMMENT ON COLUMN public.listings.location_ar_auto_translated IS 'True if location_ar was auto-translated from English';
COMMENT ON COLUMN public.listings.last_translation_update IS 'Timestamp of last automatic translation';

-- Create a function to auto-translate listings on insert/update
CREATE OR REPLACE FUNCTION public.auto_translate_listing()
RETURNS TRIGGER AS $$
DECLARE
  needs_translation BOOLEAN := false;
BEGIN
  -- Check if any translation is needed
  IF (NEW.name_en IS NULL OR NEW.name_en = '') AND (NEW.name_ar IS NOT NULL AND NEW.name_ar != '') THEN
    needs_translation := true;
  ELSIF (NEW.name_ar IS NULL OR NEW.name_ar = '') AND (NEW.name_en IS NOT NULL AND NEW.name_en != '') THEN
    needs_translation := true;
  END IF;

  IF (NEW.description_en IS NULL OR NEW.description_en = '') AND (NEW.description_ar IS NOT NULL AND NEW.description_ar != '') THEN
    needs_translation := true;
  ELSIF (NEW.description_ar IS NULL OR NEW.description_ar = '') AND (NEW.description_en IS NOT NULL AND NEW.description_en != '') THEN
    needs_translation := true;
  END IF;

  IF (NEW.location_en IS NULL OR NEW.location_en = '') AND (NEW.location_ar IS NOT NULL AND NEW.location_ar != '') THEN
    needs_translation := true;
  ELSIF (NEW.location_ar IS NULL OR NEW.location_ar = '') AND (NEW.location_en IS NOT NULL AND NEW.location_en != '') THEN
    needs_translation := true;
  END IF;

  -- Mark fields that need translation (actual translation will be done by the application)
  IF needs_translation THEN
    NEW.last_translation_update := now();
  END IF;

  -- Ensure backward compatibility fields are set
  IF NEW.name IS NULL OR NEW.name = '' THEN
    NEW.name := COALESCE(NEW.name_ar, NEW.name_en, '');
  END IF;
  
  IF NEW.description IS NULL OR NEW.description = '' THEN
    NEW.description := COALESCE(NEW.description_ar, NEW.description_en, '');
  END IF;
  
  IF NEW.location IS NULL OR NEW.location = '' THEN
    NEW.location := COALESCE(NEW.location_ar, NEW.location_en, '');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-translation on insert and update
DROP TRIGGER IF EXISTS auto_translate_listing_trigger ON public.listings;
CREATE TRIGGER auto_translate_listing_trigger
  BEFORE INSERT OR UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_translate_listing();

-- Create a stored procedure to translate existing listings
CREATE OR REPLACE FUNCTION public.translate_existing_listings()
RETURNS void AS $$
BEGIN
  -- This function marks listings that need translation
  -- The actual translation will be done by the application layer
  UPDATE public.listings
  SET last_translation_update = now()
  WHERE (
    (name_en IS NULL OR name_en = '') AND name_ar IS NOT NULL AND name_ar != ''
  ) OR (
    (name_ar IS NULL OR name_ar = '') AND name_en IS NOT NULL AND name_en != ''
  ) OR (
    (description_en IS NULL OR description_en = '') AND description_ar IS NOT NULL AND description_ar != ''
  ) OR (
    (description_ar IS NULL OR description_ar = '') AND description_en IS NOT NULL AND description_en != ''
  ) OR (
    (location_en IS NULL OR location_en = '') AND location_ar IS NOT NULL AND location_ar != ''
  ) OR (
    (location_ar IS NULL OR location_ar = '') AND location_en IS NOT NULL AND location_en != ''
  );
END;
$$ LANGUAGE plpgsql;

-- Mark existing listings for translation
SELECT public.translate_existing_listings();