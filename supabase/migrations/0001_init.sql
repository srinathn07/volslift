-- VolFit initial schema.
-- Equipment is the hinge of the whole app: a gym is a set of equipment, an
-- exercise needs one piece of it, and availability is a set membership test.

create extension if not exists "pgcrypto";

create table equipment (
  id   text primary key,
  name text not null
);

create table gyms (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  note       text,
  -- Null for the seeded public gyms, set for a user's own garage.
  created_by uuid references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table gym_equipment (
  gym_id       uuid not null references gyms (id) on delete cascade,
  equipment_id text not null references equipment (id) on delete cascade,
  primary key (gym_id, equipment_id)
);

create table user_gyms (
  user_id    uuid not null references auth.users (id) on delete cascade,
  gym_id     uuid not null references gyms (id) on delete cascade,
  is_default boolean not null default false,
  primary key (user_id, gym_id)
);

-- At most one default gym per user.
create unique index user_gyms_one_default
  on user_gyms (user_id)
  where is_default;

create type movement_pattern as enum (
  'horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull',
  'squat', 'hinge', 'lunge', 'carry', 'isolation'
);

create table exercises (
  id             text primary key,
  name           text not null,
  muscle         text not null,
  pattern        movement_pattern not null,
  equipment_id   text not null references equipment (id),
  load_class     smallint not null check (load_class between 1 and 5),
  cues           text,
  owner_id       uuid references auth.users (id) on delete cascade,
  created_at     timestamptz not null default now()
);

-- Curated swaps, best first. Scoring in lib/availability.ts covers the rest.
create table exercise_substitutions (
  exercise_id   text not null references exercises (id) on delete cascade,
  substitute_id text not null references exercises (id) on delete cascade,
  rank          smallint not null default 1,
  primary key (exercise_id, substitute_id),
  check (exercise_id <> substitute_id)
);

create table routines (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  tint       text,
  created_at timestamptz not null default now()
);

create table routine_exercises (
  routine_id    uuid not null references routines (id) on delete cascade,
  position      smallint not null,
  exercise_id   text not null references exercises (id),
  target_sets   smallint not null default 3,
  rep_low       smallint not null default 8,
  rep_high      smallint not null default 12,
  target_weight numeric(7, 2),
  primary key (routine_id, position)
);

create table workouts (
  id         uuid primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  -- Where it happened, so lighter numbers at a limited gym are not read as
  -- regression by the coach.
  gym_id     uuid references gyms (id) on delete set null,
  routine_id uuid references routines (id) on delete set null,
  name       text not null,
  started_at timestamptz not null,
  ended_at   timestamptz
);

create table sets (
  -- The client generates this, which makes a retried sync idempotent.
  client_id   uuid primary key,
  workout_id  uuid not null references workouts (id) on delete cascade,
  exercise_id text not null references exercises (id),
  set_index   smallint not null,
  weight      numeric(7, 2) not null default 0,
  reps        smallint not null default 0,
  rpe         numeric(3, 1) check (rpe is null or rpe between 1 and 10),
  done_at     timestamptz,
  unique (workout_id, exercise_id, set_index)
);

create table body_metrics (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  measured_at timestamptz not null default now(),
  weight      numeric(6, 2) not null
);

create index sets_workout_idx on sets (workout_id);
create index sets_exercise_idx on sets (exercise_id, done_at desc);
create index workouts_user_idx on workouts (user_id, started_at desc);
create index body_metrics_user_idx on body_metrics (user_id, measured_at desc);

-- Row level security: a user reaches only their own rows. The catalog tables
-- are readable by anyone signed in, writable only for their own custom rows.
alter table routines         enable row level security;
alter table routine_exercises enable row level security;
alter table workouts         enable row level security;
alter table sets             enable row level security;
alter table body_metrics     enable row level security;
alter table user_gyms        enable row level security;
alter table gyms             enable row level security;
alter table exercises        enable row level security;

create policy "own routines" on routines
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own routine entries" on routine_exercises
  for all using (
    exists (select 1 from routines r where r.id = routine_id and r.user_id = auth.uid())
  ) with check (
    exists (select 1 from routines r where r.id = routine_id and r.user_id = auth.uid())
  );

create policy "own workouts" on workouts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own sets" on sets
  for all using (
    exists (select 1 from workouts w where w.id = workout_id and w.user_id = auth.uid())
  ) with check (
    exists (select 1 from workouts w where w.id = workout_id and w.user_id = auth.uid())
  );

create policy "own metrics" on body_metrics
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own gym list" on user_gyms
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "read shared gyms" on gyms
  for select using (created_by is null or created_by = auth.uid());

create policy "write own gyms" on gyms
  for all using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy "read catalog" on exercises
  for select using (owner_id is null or owner_id = auth.uid());

create policy "write own exercises" on exercises
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
