-- LunaraFit database schema
-- Run this in your Supabase SQL editor

-- Enable Row Level Security
create extension if not exists "uuid-ossp";

-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  birth_year integer,
  cycle_length integer default 28,
  period_length integer default 5,
  last_period_date date,
  fitness_level text check (fitness_level in ('beginner', 'intermediate', 'advanced')),
  plan text default 'free' check (plan in ('free', 'monthly', 'yearly')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can manage their own profile"
  on public.profiles for all using (auth.uid() = id);

-- Workouts table
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  name text not null,
  exercises jsonb default '[]',
  feel text[] default '{}',
  notes text default '',
  phase text default 'unknown',
  created_at timestamptz default now()
);

alter table public.workouts enable row level security;
create policy "Users can manage their own workouts"
  on public.workouts for all using (auth.uid() = user_id);

create index workouts_user_date on public.workouts (user_id, date desc);

-- Cycle days table
create table public.cycle_days (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date not null,
  period boolean default false,
  mood text check (mood in ('bad', 'neutral', 'good', 'great', 'energized')),
  symptoms text[] default '{}',
  created_at timestamptz default now(),
  unique (user_id, date)
);

alter table public.cycle_days enable row level security;
create policy "Users can manage their own cycle days"
  on public.cycle_days for all using (auth.uid() = user_id);

create index cycle_days_user_date on public.cycle_days (user_id, date desc);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
