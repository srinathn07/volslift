# C6 Floor map

**Priority:** `p0`  
**Build order:** C6  
**Estimated:** 3 hours  
**Environment:** Mostly assets and layout. Can be built without database credentials against seeded state.

## Scope

You may create or edit only these paths. If you think you need a file
outside this list, stop and say why instead of editing it.

- This folder
- `public/trecs-floor.svg`

**Depends on:** C3 must be green.

## Build

- A hand-drawn schematic SVG of the TRECS fitness floor. Schematic, not architectural. Label zones by what students actually call them, not by facility names.
- Zone fill bound to live occupancy using the status tokens. Unknown zones render in `unknown` gray, never green.
- Tapping a zone filters the board below it. Tapping again clears the filter.
- Pins for the named large machines so the walk-distance claims in C4 have something visible behind them.

## Done when

- Zone colors change live alongside the board.
- Every tap target is at least 44px.
- The map fits 390px with no scroll and no pan gesture needed.

## Smoke items to append to SMOKE.md

Write them so someone who has not read the code can follow them on a
phone. These are the minimum. Add any others this checkpoint needs.

1. Open the Gym tab. The map renders fully inside 390px with no sideways scroll.
2. Tap a zone. The board below filters to that zone and the zone is visibly selected.
3. Tap it again. The filter clears.
4. Log a set in another window. The zone color changes without a refresh.

## Notes

- If the build is behind schedule, this degrades to a zone list on the board. That costs a visual and no function.

## Before marking this done

Run the full gate in `BUILD_SPEC.md` and report pass or fail per item.
Then append the smoke section, commit with `STATE.md` updated in the same
commit, squash merge to `main`, and tag `c06-green`.
