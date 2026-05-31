-- ============================================================
-- V1 Remaining Tables: Conversations, Messages, Calendar, Feed
-- ============================================================

create type public.conversation_type as enum ('coach_athlete', 'ai_agent');
create type public.message_sender_type as enum ('user', 'ai');
create type public.message_media_type as enum ('image', 'screenshot', 'file');
create type public.conflict_type as enum ('travel', 'hiking', 'rest', 'none');
create type public.feed_post_type as enum ('achievement', 'milestone', 'general');
create type public.feed_media_type as enum ('image', 'video');

-- CONVERSATIONS & MESSAGES

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  type public.conversation_type not null,
  relationship_id uuid references public.coach_athlete_relationships(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  sender_type public.message_sender_type not null default 'user',
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.message_media (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.messages(id) on delete cascade,
  file_url text not null,
  media_type public.message_media_type not null default 'image',
  created_at timestamptz not null default now()
);

-- CALENDAR PLANS & EVENTS

create table public.calendar_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  source_file_url text,
  created_at timestamptz not null default now()
);

create table public.calendar_events (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.calendar_plans(id) on delete cascade,
  date date not null,
  phase text,
  location text,
  activities text,
  notes text,
  conflict_type public.conflict_type not null default 'none'
);

-- COMMUNITY FEED

create table public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  post_type public.feed_post_type not null default 'general',
  linked_workout_id uuid references public.workouts(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.feed_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  file_url text not null,
  media_type public.feed_media_type not null default 'image',
  created_at timestamptz not null default now()
);

create table public.feed_cheers (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

-- ENABLE RLS

alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.message_media enable row level security;
alter table public.calendar_plans enable row level security;
alter table public.calendar_events enable row level security;
alter table public.feed_posts enable row level security;
alter table public.feed_media enable row level security;
alter table public.feed_cheers enable row level security;

-- CONVERSATIONS RLS

create policy "Users can read own conversations"
  on public.conversations for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.coach_athlete_relationships
      where id = conversations.relationship_id
      and (coach_id = auth.uid() or athlete_id = auth.uid())
    )
  );

create policy "Users can create conversations"
  on public.conversations for insert
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from public.coach_athlete_relationships
      where id = conversations.relationship_id
      and (coach_id = auth.uid() or athlete_id = auth.uid())
    )
  );

-- MESSAGES RLS

create policy "Users can read messages in own conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
      and (
        c.user_id = auth.uid()
        or exists (
          select 1 from public.coach_athlete_relationships
          where id = c.relationship_id
          and (coach_id = auth.uid() or athlete_id = auth.uid())
        )
      )
    )
  );

create policy "Users can send messages in own conversations"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
      and (
        c.user_id = auth.uid()
        or exists (
          select 1 from public.coach_athlete_relationships
          where id = c.relationship_id
          and (coach_id = auth.uid() or athlete_id = auth.uid())
        )
      )
    )
  );

create policy "Users can update read status"
  on public.messages for update
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
      and (
        c.user_id = auth.uid()
        or exists (
          select 1 from public.coach_athlete_relationships
          where id = c.relationship_id
          and (coach_id = auth.uid() or athlete_id = auth.uid())
        )
      )
    )
  );

-- MESSAGE MEDIA RLS

create policy "Users can read message media"
  on public.message_media for select
  using (
    exists (
      select 1 from public.messages m
      join public.conversations c on c.id = m.conversation_id
      where m.id = message_media.message_id
      and (
        c.user_id = auth.uid()
        or exists (
          select 1 from public.coach_athlete_relationships
          where id = c.relationship_id
          and (coach_id = auth.uid() or athlete_id = auth.uid())
        )
      )
    )
  );

create policy "Users can upload message media"
  on public.message_media for insert
  with check (
    exists (
      select 1 from public.messages m
      where m.id = message_media.message_id
      and m.sender_id = auth.uid()
    )
  );

-- CALENDAR RLS

create policy "Users can read own calendar plans"
  on public.calendar_plans for select
  using (user_id = auth.uid());

create policy "Coaches can read athlete calendar plans"
  on public.calendar_plans for select
  using (
    exists (
      select 1 from public.coach_athlete_relationships
      where coach_id = auth.uid() and athlete_id = calendar_plans.user_id and status = 'active'
    )
  );

create policy "Users can create own calendar plans"
  on public.calendar_plans for insert
  with check (user_id = auth.uid());

create policy "Users can delete own calendar plans"
  on public.calendar_plans for delete
  using (user_id = auth.uid());

create policy "Users can read own calendar events"
  on public.calendar_events for select
  using (
    exists (
      select 1 from public.calendar_plans
      where id = calendar_events.plan_id
      and (
        user_id = auth.uid()
        or exists (
          select 1 from public.coach_athlete_relationships
          where coach_id = auth.uid() and athlete_id = calendar_plans.user_id and status = 'active'
        )
      )
    )
  );

create policy "Users can create own calendar events"
  on public.calendar_events for insert
  with check (
    exists (select 1 from public.calendar_plans where id = calendar_events.plan_id and user_id = auth.uid())
  );

create policy "Users can update own calendar events"
  on public.calendar_events for update
  using (
    exists (select 1 from public.calendar_plans where id = calendar_events.plan_id and user_id = auth.uid())
  );

create policy "Users can delete own calendar events"
  on public.calendar_events for delete
  using (
    exists (select 1 from public.calendar_plans where id = calendar_events.plan_id and user_id = auth.uid())
  );

-- FEED RLS (public read)

create policy "Anyone can read feed posts" on public.feed_posts for select using (true);
create policy "Users can create own posts" on public.feed_posts for insert with check (author_id = auth.uid());
create policy "Users can delete own posts" on public.feed_posts for delete using (author_id = auth.uid());

create policy "Anyone can read feed media" on public.feed_media for select using (true);
create policy "Users can upload feed media" on public.feed_media for insert
  with check (exists (select 1 from public.feed_posts where id = feed_media.post_id and author_id = auth.uid()));

create policy "Anyone can read cheers" on public.feed_cheers for select using (true);
create policy "Users can cheer" on public.feed_cheers for insert with check (user_id = auth.uid());
create policy "Users can remove cheers" on public.feed_cheers for delete using (user_id = auth.uid());

-- STORAGE: message-media bucket

create policy "Users can upload message media files"
  on storage.objects for insert
  with check (bucket_id = 'message-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can read message media files"
  on storage.objects for select
  using (bucket_id = 'message-media');

-- INDEXES

create index idx_messages_conversation on public.messages(conversation_id);
create index idx_messages_created on public.messages(created_at);
create index idx_calendar_events_date on public.calendar_events(date);
create index idx_calendar_events_plan on public.calendar_events(plan_id);
create index idx_feed_posts_created on public.feed_posts(created_at desc);
create index idx_feed_cheers_post on public.feed_cheers(post_id);

-- REALTIME

alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.feed_cheers;
