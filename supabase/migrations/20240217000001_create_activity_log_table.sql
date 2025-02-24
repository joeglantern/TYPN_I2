create table public.activity_log (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  type text not null check (type in ('member', 'program', 'donation', 'partner')),
  user_id uuid references auth.users(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.activity_log enable row level security;

-- Create policies
create policy "Enable read access for all users" on public.activity_log
  for select using (true);

create policy "Enable insert for authenticated users only" on public.activity_log
  for insert with check (auth.role() = 'authenticated');

-- Create indexes
create index activity_log_type_idx on public.activity_log(type);
create index activity_log_created_at_idx on public.activity_log(created_at desc); 