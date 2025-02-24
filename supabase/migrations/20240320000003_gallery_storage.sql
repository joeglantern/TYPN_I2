-- Create the gallery bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('gallery', 'gallery', true, false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for gallery
CREATE POLICY "Give public access to gallery images"
ON storage.objects FOR SELECT
USING (bucket_id = 'gallery');

CREATE POLICY "Allow authenticated users to upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Allow users to update their gallery images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery' AND owner = auth.uid());

CREATE POLICY "Allow users to delete their gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery' AND owner = auth.uid());

-- Add comment to track migration
COMMENT ON TABLE storage.objects IS 'Storage objects with gallery bucket and policies'; 