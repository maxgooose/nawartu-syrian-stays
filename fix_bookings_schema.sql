-- Fix bookings table schema - Add missing ID document columns
-- Run this in Supabase Dashboard → SQL Editor

-- Add ID document fields to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS id_document_type TEXT,
ADD COLUMN IF NOT EXISTS id_document_number TEXT;

-- Optional: Add constraint to ensure both fields are provided together
ALTER TABLE public.bookings
DROP CONSTRAINT IF EXISTS id_document_both_present;

ALTER TABLE public.bookings
ADD CONSTRAINT id_document_both_present CHECK (
  (id_document_type IS NULL AND id_document_number IS NULL) OR
  (id_document_type IS NOT NULL AND id_document_number IS NOT NULL)
);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND table_schema = 'public'
AND column_name IN ('id_document_type', 'id_document_number');
