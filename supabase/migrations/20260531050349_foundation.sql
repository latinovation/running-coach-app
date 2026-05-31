-- Custom types
create type public.user_role as enum ('runner', 'coach');
create type public.relationship_status as enum ('pending', 'active', 'archived');

-- Profiles table (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Coach-athlete relationships
create table public.coach_athlete_relationships (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references public.profiles(id) on delete cascade,
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  status public.relationship_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint unique_coach_athlete unique (coach_id, athlete_id),
  constraint no_self_coaching check (coach_id != athlete_id)
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.coach_athlete_relationships enable row level security;

-- Profiles RLS policies
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can read related profiles"
  on public.profiles for select
  using (
    id in (
      select coach_id from public.coach_athlete_relationships
      where athlete_id = auth.uid() and status = 'active'
      union
      select athlete_id from public.coach_athlete_relationships
      where coach_id = auth.uid() and status = 'active'
    )
  );

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Coach-athlete relationship RLS policies
create policy "Coaches can read own relationships"
  on public.coach_athlete_relationships for select
  using (coach_id = auth.uid());

create policy "Athletes can read own relationships"
  on public.coach_athlete_relationships for select
  using (athlete_id = auth.uid());

create policy "Coaches can create relationships"
  on public.coach_athlete_relationships for insert
  with check (
    coach_id = auth.uid()
    and exists (
      select 1 from public.profiles where id = auth.uid() and role = 'coach'
    )
  );

create policy "Coaches can update relationships"
  on public.coach_athlete_relationships for update
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

create policy "Athletes can update own relationships"
  on public.coach_athlete_relationships for update
  using (athlete_id = auth.uid())
  with check (athlete_id = auth.uid());

-- Auto-create profile on signup via database trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, role, display_name)
  values (
    new.id,
    (new.raw_user_meta_data->>'role')::public.user_role,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage buckets
insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('workout-media', 'workout-media', false),
  ('message-media', 'message-media', false),
  ('uploads', 'uploads', false);

-- Storage RLS: avatars bucket
create policy "Public avatar read"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
