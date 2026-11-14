# Working in this repo

VolFit: a workout tracker whose two distinguishing ideas are equipment gating (the
picker only offers what the selected gym can load) and deterministic coaching
(progression and deload rules that carry their own evidence). Keep both honest.

## Design

The UI is specified in `design/DESIGN.md`. Read it before building or changing any
screen.

`design/project/*.dc.html` are design-canvas artboards, not runnable app code: they use
`<x-dc>`, `<sc-for>`, `<sc-if>` and `{{holes}}` with logic in a `renderVals()` method.
Lift their markup and token values; do not import, run, or try to install anything for
them. `design/DESIGN.md` is authoritative when the two disagree.

## Conventions

- Screens are client components using inline styles with values from `lib/tokens.ts`.
  This matches the artboards one to one. Do not introduce Tailwind or CSS modules for a
  single screen; if the whole app moves to a utility framework, move all of it at once.
- Numbers the user reads as data (weight, reps, timers, tonnage, counts, axis labels)
  use `font.mono`. Headings, the wordmark and primary button labels use `font.display`.
  Everything else uses `font.body`.
- Real `<button>`, `<a href>` and `<input>` with `aria-label` on icon-only controls,
  `aria-expanded` on disclosures, `aria-pressed` or `role="switch"` on toggles, and
  `role="img"` plus a sentence-long label on charts. The artboards already do this.
- App state lives in `lib/store.tsx`. Screens read it through `useStore()`; do not add a
  second state container.
- Timers derive from a stored start timestamp via `useElapsed`, never from accumulated
  interval ticks, so a backgrounded tab cannot drift.
- Set inputs hold strings, not numbers, so a half-typed value is not coerced. Convert at
  the boundary.

## Logic rules

`lib/availability.ts` and `lib/strength.ts` are the heart of the app and are covered by
tests in `lib/*.test.ts`. Run `npm test` after touching either.

When changing a rule, change the test first and state the training reason in a comment.
The thresholds are deliberate:

- Progression needs every working set at the top of the range for two sessions and mean
  RPE at or below 7.
- Deload needs two of three signals: tonnage up 30 percent, RPE up 0.5, reps per set
  down. One signal alone is normal training and must not fire.
- Isolation lifts never substitute across muscles.

Suggestions must keep returning a struct with an `evidence` field. The UI renders that
evidence verbatim in the "Why this suggestion?" panel, which is the reason a user can
trust the card. Never generate a weight recommendation from a model; a model may only
rephrase `explain()`.

## Data

`lib/catalog.ts` is the source of truth for equipment, exercises, curated substitutions
and the seeded gyms. `lib/history.ts` seeds session history so charts and coach cards
have something real to read before sync exists. Both get replaced by server queries
later; keep their shapes.

`supabase/migrations/` is additive. Add a new numbered migration rather than editing one
that has been applied.

## Checks before calling something done

```bash
npm test
npm run build
```

Both must pass. The build also type-checks.
