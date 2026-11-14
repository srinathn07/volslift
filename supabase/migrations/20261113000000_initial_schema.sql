-- =============================================================================
-- VolsLift — initial schema
-- ONE migration, all ten tables. No migrations after this point.
-- =============================================================================

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Tables ───────────────────────────────────────────────────────────────────

CREATE TABLE public.profiles (
  id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text        NOT NULL,
  display_name    text,
  unit_preference text        NOT NULL DEFAULT 'lb'
                              CHECK (unit_preference IN ('lb','kg')),
  no_axial_load   boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.exercises (
  id               text PRIMARY KEY,
  name             text NOT NULL,
  pattern          text NOT NULL
                   CHECK (pattern IN (
                     'horiz_push','vert_push','horiz_pull','vert_pull',
                     'squat','hinge','lunge','carry','isolation'
                   )),
  primary_mover    text        NOT NULL,
  synergists       text[]      NOT NULL DEFAULT '{}',
  equipment_class  text        NOT NULL
                   CHECK (equipment_class IN (
                     'barbell','dumbbell','machine','cable','bodyweight'
                   )),
  stability_demand int         NOT NULL CHECK (stability_demand BETWEEN 1 AND 5),
  unilateral       boolean     NOT NULL DEFAULT false,
  axial_load       boolean     NOT NULL DEFAULT false,
  rom_profile      text        NOT NULL
                   CHECK (rom_profile IN ('short','mid','long')),
  skill_floor      int         NOT NULL CHECK (skill_floor BETWEEN 1 AND 5),
  default_rest_seconds int     NOT NULL DEFAULT 120,
  is_unit_bound    boolean     NOT NULL DEFAULT false
);

CREATE TABLE public.equipment_units (
  id                           text PRIMARY KEY,
  name                         text NOT NULL,
  zone                         text NOT NULL,
  kind                         text NOT NULL
                               CHECK (kind IN (
                                 'rack','bench','machine','cable',
                                 'platform','dumbbell_area'
                               )),
  walk_seconds_from_entrance   int  NOT NULL DEFAULT 30
);

CREATE TABLE public.exercise_equipment (
  exercise_id       text NOT NULL REFERENCES public.exercises(id)       ON DELETE CASCADE,
  equipment_unit_id text NOT NULL REFERENCES public.equipment_units(id) ON DELETE CASCADE,
  PRIMARY KEY (exercise_id, equipment_unit_id)
);

CREATE TABLE public.equipment_events (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_unit_id text        NOT NULL REFERENCES public.equipment_units(id),
  occupied_until    timestamptz NOT NULL,
  source            text        NOT NULL CHECK (source IN ('set_log','manual')),
  reporter_id       uuid,                -- intentionally NOT an FK to auth.users;
                                         -- the view below strips this column entirely
  client_uuid       uuid        NOT NULL UNIQUE,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.sessions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL DEFAULT 'Workout',
  started_at  timestamptz NOT NULL DEFAULT now(),
  ended_at    timestamptz,
  client_uuid uuid        NOT NULL UNIQUE
);

CREATE TABLE public.session_plan_items (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id                uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  exercise_id               text NOT NULL REFERENCES public.exercises(id),
  position                  int  NOT NULL,
  target_sets               int  NOT NULL DEFAULT 3,
  target_reps_low           int  NOT NULL DEFAULT 8,
  target_reps_high          int  NOT NULL DEFAULT 12,
  status                    text NOT NULL DEFAULT 'planned'
                            CHECK (status IN ('planned','done','swapped','skipped')),
  swapped_from_exercise_id  text REFERENCES public.exercises(id),
  swap_reason               text
);

CREATE TABLE public.sets (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        uuid        NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  exercise_id       text        NOT NULL REFERENCES public.exercises(id),
  equipment_unit_id text                 REFERENCES public.equipment_units(id),
  set_index         int         NOT NULL,
  weight            numeric     NOT NULL DEFAULT 0,
  reps              int         NOT NULL DEFAULT 0,
  rpe               numeric              CHECK (rpe BETWEEN 1 AND 10),
  is_warmup         boolean     NOT NULL DEFAULT false,
  rest_seconds      int,
  logged_at         timestamptz NOT NULL DEFAULT now(),
  client_uuid       uuid        NOT NULL UNIQUE
);

CREATE TABLE public.substitution_cache (
  exercise_id           text    NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  candidate_exercise_id text    NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  intent_band           text    NOT NULL
                        CHECK (intent_band IN ('strength','hypertrophy','accessory')),
  similarity            numeric NOT NULL CHECK (similarity BETWEEN 0 AND 1),
  reason_codes          text[]  NOT NULL DEFAULT '{}',
  PRIMARY KEY (exercise_id, candidate_exercise_id, intent_band)
);

CREATE TABLE public.equipment_reports (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_unit_id text        NOT NULL REFERENCES public.equipment_units(id),
  reporter_id       uuid        NOT NULL REFERENCES auth.users(id),
  category          text        NOT NULL,
  note              text,
  status            text        NOT NULL DEFAULT 'open'
                    CHECK (status IN ('open','resolved')),
  client_uuid       uuid        NOT NULL UNIQUE,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.occupancy_history (
  equipment_unit_id text    NOT NULL REFERENCES public.equipment_units(id),
  weekday           int     NOT NULL CHECK (weekday    BETWEEN 0 AND 6),
  hour_of_day       int     NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
  occupied_fraction numeric NOT NULL DEFAULT 0 CHECK (occupied_fraction BETWEEN 0 AND 1),
  sample_count      int     NOT NULL DEFAULT 0,
  PRIMARY KEY (equipment_unit_id, weekday, hour_of_day)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX ON public.sessions          (user_id);
CREATE INDEX ON public.session_plan_items(session_id);
CREATE INDEX ON public.sets              (session_id);
CREATE INDEX ON public.sets              (exercise_id);
CREATE INDEX ON public.equipment_events  (equipment_unit_id, occupied_until);
CREATE INDEX ON public.equipment_events  (occupied_until);
CREATE INDEX ON public.substitution_cache(exercise_id, intent_band);
CREATE INDEX ON public.occupancy_history (equipment_unit_id, weekday, hour_of_day);

-- ─── equipment_status view — hides reporter_id ────────────────────────────────
-- Uses security_invoker=false so the view runs as its owner (postgres),
-- bypassing the caller's RLS on equipment_events. The view exposes only
-- the non-identifying columns. Never grant SELECT on the base table.

CREATE VIEW public.equipment_status
  WITH (security_invoker = false)
AS
SELECT
  id,
  equipment_unit_id,
  occupied_until,
  source,
  client_uuid,
  created_at
FROM public.equipment_events
WHERE occupied_until > now();

GRANT SELECT ON public.equipment_status TO anon, authenticated;

-- ─── Row level security ───────────────────────────────────────────────────────

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_units    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sets               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substitution_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.occupancy_history  ENABLE ROW LEVEL SECURITY;

-- profiles — own row only
CREATE POLICY "profiles: own row" ON public.profiles
  FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- exercises — world readable, no client write
CREATE POLICY "exercises: world read" ON public.exercises
  FOR SELECT USING (true);

-- equipment_units — world readable, no client write
CREATE POLICY "equipment_units: world read" ON public.equipment_units
  FOR SELECT USING (true);

-- exercise_equipment — world readable, no client write
CREATE POLICY "exercise_equipment: world read" ON public.exercise_equipment
  FOR SELECT USING (true);

-- equipment_events — INSERT only from authenticated clients (read via view)
CREATE POLICY "equipment_events: authenticated insert" ON public.equipment_events
  FOR INSERT TO authenticated WITH CHECK (true);
-- Deliberately no SELECT policy on the table — use equipment_status view.

-- sessions — own rows only
CREATE POLICY "sessions: own rows" ON public.sessions
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- session_plan_items — own sessions only
CREATE POLICY "session_plan_items: own sessions" ON public.session_plan_items
  FOR ALL USING (
    session_id IN (SELECT id FROM public.sessions WHERE user_id = auth.uid())
  );

-- sets — own sessions only
CREATE POLICY "sets: own sessions" ON public.sets
  FOR ALL USING (
    session_id IN (SELECT id FROM public.sessions WHERE user_id = auth.uid())
  );

-- substitution_cache — world readable (populated by C4 server-side logic)
CREATE POLICY "substitution_cache: world read" ON public.substitution_cache
  FOR SELECT USING (true);

-- equipment_reports — authenticated insert own only, no client read
CREATE POLICY "equipment_reports: own insert" ON public.equipment_reports
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);

-- occupancy_history — world readable (populated by C7 server-side logic)
CREATE POLICY "occupancy_history: world read" ON public.occupancy_history
  FOR SELECT USING (true);

-- ─── Auto-create profile on sign-up ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
