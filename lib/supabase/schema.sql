-- EdgeFinder Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  tier text not null default 'free' check (tier in ('free', 'pro')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  daily_analysis_count int not null default 0,
  daily_analysis_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================
-- BETS TABLE
-- ============================================
create table public.bets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sport text not null,
  game_description text not null,
  bet_type text not null check (bet_type in ('spread', 'moneyline', 'total', 'prop')),
  selection text not null,
  odds int not null,
  stake decimal(10, 2) not null check (stake > 0),
  result text check (result in ('win', 'loss', 'push', 'pending')),
  profit_loss decimal(10, 2),
  closing_line int,
  notes text,
  game_date timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.bets enable row level security;

create policy "Users can view own bets"
  on public.bets for select
  using (auth.uid() = user_id);

create policy "Users can insert own bets"
  on public.bets for insert
  with check (auth.uid() = user_id);

create policy "Users can update own bets"
  on public.bets for update
  using (auth.uid() = user_id);

create policy "Users can delete own bets"
  on public.bets for delete
  using (auth.uid() = user_id);

-- ============================================
-- ANALYSES TABLE
-- ============================================
create table public.analyses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  sport text not null,
  event_id text not null,
  home_team text not null,
  away_team text not null,
  analysis_content jsonb not null default '{}',
  confidence_score int check (confidence_score >= 1 and confidence_score <= 10),
  odds_snapshot jsonb not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.analyses enable row level security;

create policy "Users can view own analyses"
  on public.analyses for select
  using (auth.uid() = user_id);

create policy "Users can insert own analyses"
  on public.analyses for insert
  with check (auth.uid() = user_id);

-- ============================================
-- UFC FIGHTERS TABLE
-- ============================================
create table public.ufc_fighters (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  record text not null,
  weight_class text not null,
  stats jsonb not null default '{}',
  recent_form jsonb not null default '[]',
  updated_at timestamptz not null default now()
);

alter table public.ufc_fighters enable row level security;

create policy "Anyone can view fighters"
  on public.ufc_fighters for select
  to authenticated
  using (true);

-- ============================================
-- INDEXES
-- ============================================
create index bets_user_id_idx on public.bets(user_id);
create index bets_game_date_idx on public.bets(game_date);
create index bets_sport_idx on public.bets(sport);
create index analyses_user_id_idx on public.analyses(user_id);
create index analyses_event_id_idx on public.analyses(event_id);
create index ufc_fighters_name_idx on public.ufc_fighters(name);

-- ============================================
-- HELPER FUNCTION: Reset daily analysis count
-- ============================================
create or replace function public.check_and_reset_daily_count(p_user_id uuid)
returns int as $$
declare
  v_count int;
  v_reset_at timestamptz;
begin
  select daily_analysis_count, daily_analysis_reset_at
  into v_count, v_reset_at
  from public.profiles
  where id = p_user_id;

  -- Reset if last reset was before today
  if v_reset_at < date_trunc('day', now()) then
    update public.profiles
    set daily_analysis_count = 0, daily_analysis_reset_at = now()
    where id = p_user_id;
    return 0;
  end if;

  return v_count;
end;
$$ language plpgsql security definer;
