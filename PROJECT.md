# PROJECT.md

## What this is

VolsLift. A fast, free workout logger that adapts your session when the
equipment you planned on is taken.

**The positioning, which decides every scope question.** The product is a
logger as fast as Strong or Hevy, plus the one thing none of them do: when your
rack is occupied, it hands you a substitute that preserves your training intent.
Reviewers describe the market leaders as "a recorder, not a prescriber" and "a
logger, not a coach." Neither adapts when the gym does not cooperate. That gap
is the whole product.

**The swap engine needs no other users.** Its only input is one tap from the
person standing in the gym saying a unit is taken. There is no crowd-data
dependency and no cold start. Do not design anything that requires other users
to be present.

**Equipment status is a secondary signal, not the premise.** Logging a set also
marks that unit occupied for the user's rest window, so occupancy accrues as a
byproduct and the board gets better as more people log. That is a roadmap
property, not a claim the product depends on. Never present live occupancy as
the core value, and never let a screen break when occupancy data is absent.

## Stack

Locked at hour zero. Do not propose alternatives.

- Next.js, App Router, TypeScript `strict`
- Tailwind, tokens from `DESIGN.md` as CSS variables plus a theme extension
- Supabase: Postgres, auth, realtime
- Vitest for unit tests
- Vercel for deploy
- PWA, no app store. Installed to the home screen

## Decided architecture, do not re-litigate

**Auth is client-side only. There is no middleware and no server-side
session.**

Sessions live in the browser via `@supabase/supabase-js` with localStorage.
Route protection is a client-side guard in a wrapper component that renders a
resolving state until auth settles, then either the app or a redirect to
`/sign-in`.

Why, so nobody re-opens it:

- A cookie-presence check in `middleware.ts` cannot see a localStorage session.
  That combination is incoherent, not a compromise.
- This app is a client-rendered PWA by necessity. Offline set logging needs
  IndexedDB and realtime needs a live socket, so almost nothing renders on the
  server. A server-side session would buy nearly nothing here.
- `@supabase/ssr` would work but splits the client into server, route-handler
  and middleware variants. Across two agents handing off mid-build, that is
  more surface to get wrong than the problem justifies.

Accept the brief resolving state on first paint. That is the cost and it is
cheap. Do not add `@supabase/ssr`, and do not create `middleware.ts`.

## Conventions

- Feature folders under `src/features/`, see `AGENTS.md` for the rules
- No `any`. `npx tsc --noEmit` must exit clean at every checkpoint boundary
- One data-fetching approach, chosen in C0, never mixed with hand-rolled
  `useEffect` fetches
- Generated DB types in `src/lib/types/db.ts`, imported everywhere. No
  hand-written row interfaces
- Timestamps stored in UTC, rendered in `America/New_York`. Knoxville is
  Eastern
- Every mutation carries a client-generated UUID with a unique constraint
  behind it, so a double tap cannot write two rows
- Buttons disable while in flight, in addition to the idempotency key
- Every async action has three visible states: idle, pending, error
- Every list handles four: loading, empty, error, loaded

## Data model

One migration, created in C1, frozen after. All tables exist from the start
even where the feature that uses them lands later.

| Table | Purpose |
| --- | --- |
| `profiles` | User row, UTK email, optional no-axial-load flag |
| `exercises` | Seeded exercise graph with attributes used by the swap engine |
| `equipment_units` | Real TRECS inventory, one row per physical unit, with zone |
| `equipment_events` | Occupancy events. No `user_id` exposed to the client |
| `sessions` | A workout session, start and end |
| `session_plan_items` | Ordered plan items with target sets and rep range |
| `sets` | A logged set: exercise, unit, weight, reps |
| `substitution_cache` | Precomputed swap candidates |
| `equipment_reports` | Out-of-service reports |
| `occupancy_history` | Aggregated history powering inferred occupancy |

`client_uuid` with a unique constraint on `sets`, `equipment_events`, and
`equipment_reports`.

### Exercise attributes

The swap engine scores against these, seeded in C1:

```
id, name
pattern          horiz_push | vert_push | horiz_pull | vert_pull |
                 squat | hinge | lunge | carry | isolation
primary_mover    pecs | quads | lats | ...
synergists[]
equipment_class  barbell | dumbbell | machine | cable | bodyweight
stability_demand 1-5
unilateral       bool
axial_load       bool
rom_profile      short | mid | long
skill_floor      1-5
```

## Row level security

- A user reads and writes only their own `sets` and `sessions`
- `equipment_events` are readable by everyone and expose no identity in any
  view the client can query
- Never display an occupancy count below the k-anonymity threshold, so nobody
  can infer that one specific person is at the gym

## Privacy commitments

These are product commitments, not preferences. Do not build around them.

- No cameras, no computer vision, ever
- Equipment status is anonymous and aggregated
- Class schedules stay on the device
- Geofence checks are evaluated and discarded, never stored as location history
- Social features are opt-in and off by default
- No data sale, no ads

## Environment

Copy `.env.example` to `.env.local`. Keys are shared out of band, never
committed. A Codex cloud environment needs these configured as secrets before
it can verify anything that touches the database.
