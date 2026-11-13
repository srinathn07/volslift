# C7 Occupancy simulator

**Priority:** `p0`  
**Build order:** C7  
**Estimated:** 2.5 hours  
**Environment:** Pure logic and scripts. No browser needed to build, though the scenario switcher needs the app to verify.

## Scope

You may create or edit only these paths. If you think you need a file
outside this list, stop and say why instead of editing it.

- `scripts/sim/`
- `app/dev/sim/`
- This folder

**Depends on:** C3 must be green.

## Build

- A seeded generator producing eight weeks of `occupancy_history` with a realistic daily shape: quiet 6 to 9am, building through the afternoon, peak 4 to 7pm, tapering to close. Weekends lower and later. Home game days closed, since TRECS shuts for those.
- A dev-only scenario switcher with named presets, including "Tuesday 5pm peak", "Saturday morning quiet" and "all squat racks busy", which is the demo scenario.
- Fully deterministic from a seed, so the demo is identical on every run.
- Returns 404 in production.

## Done when

- Selecting a scenario changes the board predictably.
- The demo scenario reproduces identically on three runs in a row.

## Smoke items to append to SMOKE.md

Write them so someone who has not read the code can follow them on a
phone. These are the minimum. Add any others this checkpoint needs.

1. Open `/dev/sim` and select the demo scenario. The Gym board matches it.
2. Reload and select it again. The board is identical.
3. Select Saturday morning quiet. Most units read free.
4. Confirm `/dev/sim` 404s in a production build.

## Notes

- **Build this even if it means dropping a p1 checkpoint.** An empty board at judging is the most likely way this project fails, and it has nothing to do with code quality.
- The historical data is simulated and the team says so on stage. Judges respect that and will ask anyway.

## Before marking this done

Run the full gate in `BUILD_SPEC.md` and report pass or fail per item.
Then append the smoke section, commit with `STATE.md` updated in the same
commit, squash merge to `main`, and tag `c07-green`.
