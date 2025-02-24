-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Give public access to blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their blog images" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their blog images" ON storage.objects;

-- Storage Policies for blog images
CREATE POLICY "Give public access to blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images' AND (storage.foldername(name))[1] = 'blog');

CREATE POLICY "Allow authenticated users to upload blog images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'images' 
    AND (storage.foldername(name))[1] = 'blog'
);

CREATE POLICY "Allow users to update their blog images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'images' 
    AND (storage.foldername(name))[1] = 'blog'
    AND owner = auth.uid()
);

CREATE POLICY "Allow users to delete their blog images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'images' 
    AND (storage.foldername(name))[1] = 'blog'
    AND owner = auth.uid()
);

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