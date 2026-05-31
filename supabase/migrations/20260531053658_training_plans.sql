-- Workout status enum
create type public.workout_status as enum ('upcoming', 'completed', 'missed', 'modified');

-- Media type enum
create type public.workout_media_type as enum ('screenshot', 'photo', 'document');

-- Training plans
create table public.training_plans (
  id uuid primary key default gen_random_uuid(),
  athlete_id uuid not null references public.profiles(id) on delete cascade,
  coach_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  goal_race text,
  goal_date date,
  goal_time text,
  source_file_url text,
  created_at timestamptz not null default now()
);

-- Training weeks
create table public.training_weeks (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.training_plans(id) on delete cascade,
  week_number int not null,
  date_start date not null,
  date_end date not null,
  focus text,
  notes text,
  constraint unique_plan_week unique (plan_id, week_number)
);

-- Workouts
create table public.workouts (
  id uuid primary key default gen_random_uuid(),
  week_id uuid not null references public.training_weeks(id) on delete cascade,
  date date not null,
  day_of_week text not null,
  prescribed_workout text not null,
  log text,
  avg_hr int,
  perceived_effort int check (perceived_effort between 1 and 5),
  miles numeric,
  strength_misc text,
  strava_activity_id uuid,
  status public.workout_status not null default 'upcoming',
  created_at timestamptz not null default now()
);

-- Comments on workouts
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

-- Workout media
create table public.workout_media (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  file_url text not null,
  media_type public.workout_media_type not null default 'screenshot',
  ai_analysis jsonb,
  created_at timestamptz not null default now()
);

-- Enable RLS on all tables
alter table public.training_plans enable row level security;
alter table public.training_weeks enable row level security;
alter table public.workouts enable row level security;
alter table public.comments enable row level security;
alter table public.workout_media enable row level security;

-- Training plans RLS
create policy "Athletes can read own plans"
  on public.training_plans for select
  using (athlete_id = auth.uid());

create policy "Coaches can read own plans"
  on public.training_plans for select
  using (coach_id = auth.uid());

create policy "Coaches can create plans"
  on public.training_plans for insert
  with check (
    coach_id = auth.uid()
    and exists (
      select 1 from public.coach_athlete_relationships
      where coach_id = auth.uid() and athlete_id = training_plans.athlete_id and status = 'active'
    )
  );

create policy "Athletes can create own plans"
  on public.training_plans for insert
  with check (athlete_id = auth.uid());

create policy "Coaches can update plans"
  on public.training_plans for update
  using (coach_id = auth.uid())
  with check (coach_id = auth.uid());

-- Training weeks RLS
create policy "Users can read weeks of accessible plans"
  on public.training_weeks for select
  using (
    exists (
      select 1 from public.training_plans
      where id = training_weeks.plan_id
      and (athlete_id = auth.uid() or coach_id = auth.uid())
    )
  );

create policy "Plan owners can insert weeks"
  on public.training_weeks for insert
  with check (
    exists (
      select 1 from public.training_plans
      where id = training_weeks.plan_id
      and (athlete_id = auth.uid() or coach_id = auth.uid())
    )
  );

create policy "Coaches can update weeks"
  on public.training_weeks for update
  using (
    exists (
      select 1 from public.training_plans
      where id = training_weeks.plan_id
      and coach_id = auth.uid()
    )
  );

-- Workouts RLS
create policy "Users can read workouts of accessible plans"
  on public.workouts for select
  using (
    exists (
      select 1 from public.training_weeks tw
      join public.training_plans tp on tp.id = tw.plan_id
      where tw.id = workouts.week_id
      and (tp.athlete_id = auth.uid() or tp.coach_id = auth.uid())
    )
  );

create policy "Plan owners can insert workouts"
  on public.workouts for insert
  with check (
    exists (
      select 1 from public.training_weeks tw
      join public.training_plans tp on tp.id = tw.plan_id
      where tw.id = workouts.week_id
      and (tp.athlete_id = auth.uid() or tp.coach_id = auth.uid())
    )
  );

create policy "Athletes can update own workouts"
  on public.workouts for update
  using (
    exists (
      select 1 from public.training_weeks tw
      join public.training_plans tp on tp.id = tw.plan_id
      where tw.id = workouts.week_id
      and tp.athlete_id = auth.uid()
    )
  );

create policy "Coaches can update workouts"
  on public.workouts for update
  using (
    exists (
      select 1 from public.training_weeks tw
      join public.training_plans tp on tp.id = tw.plan_id
      where tw.id = workouts.week_id
      and tp.coach_id = auth.uid()
    )
  );

-- Comments RLS
create policy "Users can read comments on accessible workouts"
  on public.comments for select
  using (
    exists (
      select 1 from public.workouts w
      join public.training_weeks tw on tw.id = w.week_id
      join public.training_plans tp on tp.id = tw.plan_id
      where w.id = comments.workout_id
      and (tp.athlete_id = auth.uid() or tp.coach_id = auth.uid())
    )
  );

create policy "Authenticated users can add comments on accessible workouts"
  on public.comments for insert
  with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.workouts w
      join public.training_weeks tw on tw.id = w.week_id
      join public.training_plans tp on tp.id = tw.plan_id
      where w.id = comments.workout_id
      and (tp.athlete_id = auth.uid() or tp.coach_id = auth.uid())
    )
  );

-- Workout media RLS
create policy "Users can read media on accessible workouts"
  on public.workout_media for select
  using (
    exists (
      select 1 from public.workouts w
      join public.training_weeks tw on tw.id = w.week_id
      join public.training_plans tp on tp.id = tw.plan_id
      where w.id = workout_media.workout_id
      and (tp.athlete_id = auth.uid() or tp.coach_id = auth.uid())
    )
  );

create policy "Users can upload media to accessible workouts"
  on public.workout_media for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.workouts w
      join public.training_weeks tw on tw.id = w.week_id
      join public.training_plans tp on tp.id = tw.plan_id
      where w.id = workout_media.workout_id
      and (tp.athlete_id = auth.uid() or tp.coach_id = auth.uid())
    )
  );

-- Storage policies for workout-media bucket
create policy "Users can upload workout media"
  on storage.objects for insert
  with check (
    bucket_id = 'workout-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read workout media"
  on storage.objects for select
  using (bucket_id = 'workout-media');

create policy "Users can delete own workout media"
  on storage.objects for delete
  using (
    bucket_id = 'workout-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies for uploads bucket
create policy "Users can upload files"
  on storage.objects for insert
  with check (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own uploads"
  on storage.objects for select
  using (
    bucket_id = 'uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Indexes
create index idx_workouts_date on public.workouts(date);
create index idx_workouts_week_id on public.workouts(week_id);
create index idx_training_weeks_plan_id on public.training_weeks(plan_id);
create index idx_comments_workout_id on public.comments(workout_id);
create index idx_workout_media_workout_id on public.workout_media(workout_id);
