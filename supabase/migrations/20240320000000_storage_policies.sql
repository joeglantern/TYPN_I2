-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Give public access to files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;

-- Add owner column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'storage' 
        AND table_name = 'objects' 
        AND column_name = 'owner'
    ) THEN
        ALTER TABLE storage.objects ADD COLUMN owner UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Create the images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES ('images', 'images', true, false, 10485760, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Storage Policies

-- Allow public read access to files
CREATE POLICY "Give public access to files"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Allow authenticated uploads
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

-- Allow authenticated updates
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'images' AND owner = auth.uid());

-- Allow authenticated deletes
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'images' AND owner = auth.uid());

-- Create function to set owner on upload
CREATE OR REPLACE FUNCTION storage.set_storage_object_owner()
RETURNS TRIGGER AS $$
BEGIN
    NEW.owner = auth.uid();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set owner
DROP TRIGGER IF EXISTS set_storage_object_owner_trigger ON storage.objects;
CREATE TRIGGER set_storage_object_owner_trigger
    BEFORE INSERT ON storage.objects
    FOR EACH ROW
    EXECUTE FUNCTION storage.set_storage_object_owner();

-- Add comment to track migration
COMMENT ON TABLE storage.objects IS 'Storage objects with owner tracking and public read access'; 