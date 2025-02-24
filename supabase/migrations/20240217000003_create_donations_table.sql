create table public.donations (
  id uuid default gen_random_uuid() primary key,
  donor_name text not null,
  donor_email text not null,
  amount numeric not null check (amount > 0),
  currency text not null default 'USD',
  program_id uuid references public.content(id),
  type text not null check (type in ('one-time', 'monthly', 'annual')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  payment_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.donations enable row level security;

-- Create policies
create policy "Enable read access for authenticated users only" on public.donations
  for select using (auth.role() = 'authenticated');

create policy "Enable insert for all users" on public.donations
  for insert with check (true);

create policy "Enable update for authenticated users only" on public.donations
  for update using (auth.role() = 'authenticated');

-- Create indexes
create index donations_status_idx on public.donations(status);
create index donations_type_idx on public.donations(type);
create index donations_created_at_idx on public.donations(created_at desc);
create index donations_program_id_idx on public.donations(program_id); 