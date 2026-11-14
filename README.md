# VolFit

A workout tracker that only offers exercises your gym can actually load, and whose
coaching comes from rules over your own logged sets rather than a guess.

Two things make it different from Hevy or Strong:

1. **Equipment gating.** You pick a gym, VolFit knows what that gym has, and the
   exercise picker will not offer a trap bar deadlift at a gym with no trap bar. When
   something is unavailable it names the closest substitute you can actually load.
2. **Deterministic coaching.** Progression and deload calls are rules with the evidence
   attached, so every suggestion can show the numbers behind it. A language model is
   optional phrasing on top, never the source of a weight recommendation.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # engine tests
npm run build      # production build
```

No environment variables are needed to run the UI. Everything is seeded from
`lib/catalog.ts` and `lib/history.ts`, and sessions you log are saved to IndexedDB on
the device.

## Layout

```
app/
  page.tsx              home: brand, gym pill, streak, routines, week stats
  workout/page.tsx      active workout: set table, rest timer, running tonnage
  exercises/page.tsx    library: gym gating, muscle filters, detail sheet with swaps
  gym/page.tsx          gym accordion: pick a gym, see its kit, picker rules
  routines/new/page.tsx routine builder
  progress/page.tsx     strength chart, consistency heatmap, body weight, PRs
  coach/page.tsx        suggestion cards with "why this suggestion?"
  history/page.tsx      logged sessions by day
  profile/page.tsx      gym, picker rules, local data
components/
  Shell.tsx             Screen, Body, Header, TabBar
  Icons.tsx             inline stroke icons
lib/
  tokens.ts             design tokens from the canvas
  types.ts              domain types
  catalog.ts            equipment, exercises, substitutions, gyms, seed routines
  availability.ts       gym context, gating, substitution engine
  strength.ts           Brzycki e1RM, progression rule, deload rule
  coach.ts              suggestion cards built from the rules
  stats.ts              week stats, PRs, streak chain, heatmap
  history.ts            seed session history
  db.ts                 Dexie local-first store and sync queue
  store.tsx             app state: gym, active session, rest timer
supabase/migrations/    schema with row level security
design/                 DESIGN.md spec plus the original design artboards
```

## How the logic works

**Availability** is a set test. `buildGymContext(gym)` computes the gym's equipment set
and the ids it can load once per gym selection, then filtering is a predicate rather
than a query per row. Bodyweight and bands count as available anywhere.

**Substitution** prefers a curated swap from `exercise.substitutes` when the gym can
load it. Otherwise candidates are scored: same movement pattern is worth most, then the
same primary muscle, minus the distance in how heavily the movement loads. Isolation
lifts never substitute across muscles, which is what stops a skullcrusher being offered
in place of a cable fly.

**Estimated max** is Brzycki, `weight * 36 / (37 - reps)`, capped at 12 reps where the
formula stops meaning anything. 190 lb for 6 reads as 221.

**Progression** fires when the top of the rep range was hit on every working set across
the last two sessions and mean RPE stayed at or below 7. Step is 2.5 to 5 lb upper body,
5 to 10 lower, with the smaller step on light lifts.

**Deload** fires when at least two of three signals agree over a two week window against
the two before it: tonnage up 30 percent or more, mean RPE up half a point or more, mean
reps per set down. One signal alone is just training.

Both return a struct carrying `evidence`, which is what the card's disclosure renders.

## Local-first sessions

The active workout is written to IndexedDB on every change, keyed by a client-generated
id that doubles as the sync idempotency key. `pendingRows()` returns finished workouts
the server has not acknowledged; post them and call `markSynced`. A failed push simply
retries next time, and a reload or a dead battery mid-session loses nothing.

Workouts record the gym they happened at, so lighter numbers at a limited gym are not
read as a regression later.

## Database

`supabase/migrations/0001_init.sql` creates the full schema with row level security, so
a user only ever reaches their own routines, workouts, sets and metrics. Apply it with:

```bash
supabase db push
```

## What is not built yet

- Auth and the sync route. `lib/db.ts` has the queue; nothing posts it yet.
- Server seeding for `equipment`, `exercises` and `exercise_substitutions`. The client
  ships the catalog from `lib/catalog.ts` today; that file is the source of truth to
  generate the seed from.
- Custom exercises and custom gyms, which have buttons but no forms.
- Routine persistence. The builder edits a draft in memory.
- Drag to reorder in the builder, which uses arrow buttons for now.
- The coach composer, which renders but does not call a model.
- Charts are hand-drawn SVG against seeded history. Point them at real aggregates once
  sync lands.
