-- Create enum for user roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'client');
  END IF;
END
$$;

-- Create profiles table linking to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  full_name text,
  avatar_url text,
  created_at timestamptz default now()
);

-- Trigger function to create a profile when a new auth.user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable Row Level Security and policies
alter table public.profiles enable row level security;

-- Policy: users can select their own profile
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile"
      ON public.profiles
      FOR SELECT
      USING ( auth.uid() = id );
  END IF;
END
$$;

-- Policy: admin can perform all actions on profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Admin can access all profiles') THEN
    CREATE POLICY "Admin can access all profiles"
      ON public.profiles
      FOR ALL
      USING (
        exists (
          select 1 from public.profiles
          where id = auth.uid()
          and role = 'admin'
        )
      );
  END IF;
END
$$;
