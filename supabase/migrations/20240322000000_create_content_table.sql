-- Drop existing tables and constraints
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.content CASCADE;

-- Create content table
CREATE TABLE public.content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('blog', 'gallery', 'program')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    media_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate donations table
CREATE TABLE public.donations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    donor_name TEXT NOT NULL,
    donor_email TEXT NOT NULL,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    program_id UUID REFERENCES public.content(id),
    type TEXT NOT NULL CHECK (type IN ('one-time', 'monthly', 'annual')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Create policies for content
CREATE POLICY "Enable read access for all users" ON public.content
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.content
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.content
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.content
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create policies for donations
CREATE POLICY "Enable read access for authenticated users only" ON public.donations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for all users" ON public.donations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON public.donations
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create indexes for content
CREATE INDEX content_type_idx ON public.content(type);
CREATE INDEX content_status_idx ON public.content(status);
CREATE INDEX content_created_at_idx ON public.content(created_at DESC);

-- Create indexes for donations
CREATE INDEX donations_status_idx ON public.donations(status);
CREATE INDEX donations_type_idx ON public.donations(type);
CREATE INDEX donations_created_at_idx ON public.donations(created_at DESC);
CREATE INDEX donations_program_id_idx ON public.donations(program_id); 