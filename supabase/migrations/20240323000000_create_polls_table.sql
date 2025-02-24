-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.poll_votes CASCADE;
DROP TABLE IF EXISTS public.polls CASCADE;

-- Create polls table
CREATE TABLE public.polls (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    options JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Create poll_votes table
CREATE TABLE public.poll_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    selected_option INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(poll_id, user_id)
);

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Simple policies for polls
CREATE POLICY "Enable access to all users" ON public.polls FOR ALL USING (true);

-- Simple policies for poll_votes
CREATE POLICY "Enable read access for all users" ON public.poll_votes
    FOR SELECT USING (true);

CREATE POLICY "Enable voting for authenticated users" ON public.poll_votes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes
CREATE INDEX polls_status_idx ON public.polls(status);
CREATE INDEX poll_votes_poll_id_idx ON public.poll_votes(poll_id);
CREATE INDEX poll_votes_user_id_idx ON public.poll_votes(user_id);

-- Grant permissions
GRANT ALL ON public.polls TO authenticated;
GRANT ALL ON public.poll_votes TO authenticated; 
