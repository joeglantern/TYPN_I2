-- Drop existing table if it exists
DROP TABLE IF EXISTS public.gallery;

-- Create a simple gallery table
CREATE TABLE public.gallery (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT DEFAULT '',
    show_in_carousel BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON public.gallery
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.gallery
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.gallery
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.gallery
    FOR DELETE USING (auth.role() = 'authenticated'); 
