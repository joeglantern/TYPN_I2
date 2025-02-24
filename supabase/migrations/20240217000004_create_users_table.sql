-- Drop existing function and trigger if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Drop and recreate the table
drop table if exists public.users cascade;

create table public.users (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text not null,
  email text unique not null,
  avatar_url text,
  role text not null default 'member' check (role in ('member', 'chapter_leader', 'admin')),
  status text not null default 'active' check (status in ('active', 'pending', 'inactive')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- Create policies
create policy "Public profiles are viewable by everyone"
  on public.users for select
  using (true);

create policy "Users can insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (
    id,
    username,
    full_name,
    email,
    avatar_url,
    role,
    status
  ) values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(md5(random()::text), 1, 10)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    'member',
    'active'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create indexes
create index users_username_idx on public.users(username);
create index users_email_idx on public.users(email);
create index users_created_at_idx on public.users(created_at desc); 