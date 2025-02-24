create table public.partners (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  logo_url text,
  website_url text,
  status text not null default 'pending' check (status in ('pending', 'active', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.partners enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.partners
  for select using (true);

create policy "Enable insert for authenticated users only" on public.partners
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for authenticated users only" on public.partners
  for update using (auth.role() = 'authenticated');

create policy "Enable delete for authenticated users only" on public.partners
  for delete using (auth.role() = 'authenticated');

-- Create indexes
create index partners_status_idx on public.partners(status);
create index partners_created_at_idx on public.partners(created_at desc); 