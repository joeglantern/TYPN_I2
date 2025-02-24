create table public.content (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text not null check (type in ('carousel', 'blog', 'program', 'page')),
  status text not null default 'draft' check (status in ('draft', 'published')),
  media_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.content enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.content
  for select using (true);

create policy "Enable insert for authenticated users only" on public.content
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.content
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only" on public.content
  for delete using (auth.role() = 'authenticated');

-- Create indexes
create index content_type_idx on public.content(type);
create index content_status_idx on public.content(status);
create index content_created_at_idx on public.content(created_at desc); 