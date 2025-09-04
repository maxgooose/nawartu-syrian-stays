-- Add ID document fields to bookings
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS id_document_type TEXT,
ADD COLUMN IF NOT EXISTS id_document_number TEXT;

-- Optional: simple check constraint to ensure if one is provided, both are provided
ALTER TABLE public.bookings
ADD CONSTRAINT id_document_both_present CHECK (
  (id_document_type IS NULL AND id_document_number IS NULL) OR
  (id_document_type IS NOT NULL AND id_document_number IS NOT NULL)
);

