-- Maximally Growth Network - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Custom types
create type user_role as enum ('agent', 'admin', 'captain');
create type task_priority as enum ('low', 'medium', 'high', 'urgent');
create type task_action as enum ('comment', 'repost', 'react', 'follow', 'connect', 'dm');
create type submission_status as enum ('pending', 'approved', 'rejected');
create type user_level as enum ('rookie', 'operator', 'growth_agent', 'narrative_captain', 'ecosystem_lead');

-- Users table
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  linkedin_url text,
  role user_role default 'agent',
  streak integer default 0,
  xp integer default 0,
  level user_level default 'rookie',
  personality_md text,
  avatar_url text,
  joined_at timestamp with time zone default now()
);

-- Engagement tasks
create table public.engagement_tasks (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  post_url text not null,
  creator_name text not null,
  summary text not null,
  action_required task_action not null,
  suggested_angles text[] default '{}',
  priority task_priority default 'medium',
  expires_at timestamp with time zone not null,
  created_by uuid references public.users(id),
  archived boolean default false,
  created_at timestamp with time zone default now()
);

-- People tasks
create table public.people_tasks (
  id uuid primary key default uuid_generate_v4(),
  profile_url text not null,
  name text not null,
  role_title text not null,
  niche_tags text[] default '{}',
  why_they_matter text not null,
  suggested_action task_action not null,
  connection_note text not null,
  expires_at timestamp with time zone not null,
  created_by uuid references public.users(id),
  archived boolean default false,
  created_at timestamp with time zone default now()
);

-- Narratives
create table public.narratives (
  id uuid primary key default uuid_generate_v4(),
  monthly_theme text not null,
  weekly_theme text not null,
  daily_angle text not null,
  start_date date not null,
  end_date date not null,
  active boolean default true,
  created_at timestamp with time zone default now()
);

-- Post briefs
create table public.post_briefs (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  objective text not null,
  core_idea text not null,
  structure text not null,
  emotional_direction text not null,
  reference_urls text[] default '{}',
  deadline timestamp with time zone not null,
  narrative_id uuid references public.narratives(id),
  created_by uuid references public.users(id),
  created_at timestamp with time zone default now()
);

-- Submissions
create table public.submissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id),
  task_id uuid not null,
  task_type text not null check (task_type in ('engagement', 'people', 'post')),
  proof_url text not null,
  status submission_status default 'pending',
  xp_awarded integer default 0,
  submitted_at timestamp with time zone default now(),
  reviewed_at timestamp with time zone
);

-- Indexes
create index idx_engagement_tasks_active on public.engagement_tasks(archived, expires_at);
create index idx_people_tasks_active on public.people_tasks(archived, expires_at);
create index idx_submissions_user on public.submissions(user_id, task_type);
create index idx_submissions_status on public.submissions(status);
create index idx_narratives_active on public.narratives(active);
create index idx_users_xp on public.users(xp desc);

-- Row Level Security
alter table public.users enable row level security;
alter table public.engagement_tasks enable row level security;
alter table public.people_tasks enable row level security;
alter table public.narratives enable row level security;
alter table public.post_briefs enable row level security;
alter table public.submissions enable row level security;

-- Users policies
create policy "Users can view all users" on public.users
  for select using (true);

create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- Engagement tasks policies
create policy "Anyone can view engagement tasks" on public.engagement_tasks
  for select using (true);

create policy "Admins can manage engagement tasks" on public.engagement_tasks
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- People tasks policies
create policy "Anyone can view people tasks" on public.people_tasks
  for select using (true);

create policy "Admins can manage people tasks" on public.people_tasks
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Narratives policies
create policy "Anyone can view narratives" on public.narratives
  for select using (true);

create policy "Admins can manage narratives" on public.narratives
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Post briefs policies
create policy "Anyone can view post briefs" on public.post_briefs
  for select using (true);

create policy "Admins can manage post briefs" on public.post_briefs
  for all using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- Submissions policies
create policy "Users can view own submissions" on public.submissions
  for select using (auth.uid() = user_id);

create policy "Admins can view all submissions" on public.submissions
  for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

create policy "Users can create submissions" on public.submissions
  for insert with check (auth.uid() = user_id);

create policy "Admins can update submissions" on public.submissions
  for update using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );
