-- Create storage buckets for Nawartu
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('property-images', 'property-images', true),
  ('profile-avatars', 'profile-avatars', true);

-- RLS Policies for property-images bucket
CREATE POLICY "Property images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images');

CREATE POLICY "Hosts can upload property images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Hosts can update their property images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Hosts can delete their property images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'property-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policies for profile-avatars bucket
CREATE POLICY "Profile avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'profile-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'profile-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);