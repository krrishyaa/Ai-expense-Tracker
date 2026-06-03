-- Run this entire file in Supabase Dashboard → SQL Editor → New query → Run
-- It is safe to run multiple times; statements are idempotent.

-- ----------------------------------------------------------------------------
-- Profiles (linked to auth.users)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text not null,
  display_name text,
  currency text not null default 'INR',
  avatar_seed text,
  onboarded boolean not null default false,
  created_at timestamptz default now()
);

-- Backfill new columns for existing rows
alter table public.profiles
  add column if not exists display_name text;
alter table public.profiles
  add column if not exists currency text not null default 'INR';
alter table public.profiles
  add column if not exists avatar_seed text;
alter table public.profiles
  add column if not exists onboarded boolean not null default false;

-- ----------------------------------------------------------------------------
-- Categories
-- ----------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#6b7280',
  created_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Expenses
-- ----------------------------------------------------------------------------
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  description text not null,
  amount numeric(12, 2) not null check (amount >= 0),
  date date not null default current_date,
  is_recurring boolean default false,
  recurring_frequency text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ----------------------------------------------------------------------------
-- Budgets
-- ----------------------------------------------------------------------------
create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  period text not null default 'monthly' check (period in ('daily', 'weekly', 'monthly', 'yearly')),
  created_at timestamptz default now(),
  unique (user_id, category_id, period)
);

-- ----------------------------------------------------------------------------
-- Auto-create profile when a user signs up
-- (uses username from signup metadata and a random avatar seed)
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, currency, avatar_seed, onboarded)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'currency', 'INR'),
    encode(gen_random_bytes(6), 'hex'),
    false
  )
  on conflict (id) do update
    set username = excluded.username;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- Row Level Security
-- ----------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.expenses enable row level security;
alter table public.budgets enable row level security;

-- Profiles policies
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Categories policies
drop policy if exists "categories_all_own" on public.categories;
create policy "categories_all_own" on public.categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Expenses policies
drop policy if exists "expenses_all_own" on public.expenses;
create policy "expenses_all_own" on public.expenses for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Budgets policies
drop policy if exists "budgets_all_own" on public.budgets;
create policy "budgets_all_own" on public.budgets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Username login (email stays in auth; login form uses username only)
-- ----------------------------------------------------------------------------
alter table public.profiles drop constraint if exists profiles_username_unique;
alter table public.profiles add constraint profiles_username_unique unique (username);

create or replace function public.get_login_email_for_username(p_username text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  select u.email into v_email
  from auth.users u
  inner join public.profiles p on p.id = u.id
  where lower(p.username) = lower(trim(p_username))
  limit 1;
  return v_email;
end;
$$;

revoke all on function public.get_login_email_for_username(text) from public;
grant execute on function public.get_login_email_for_username(text) to anon, authenticated;
