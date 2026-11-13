# C3 Equipment status engine

**Priority:** `p0`  
**Build order:** C3  
**Estimated:** 4 hours  
**Environment:** Needs database credentials and a browser.

> Hand back to the user after this checkpoint.

## Scope

You may create or edit only these paths. If you think you need a file
outside this list, stop and say why instead of editing it.

- `app/(app)/gym/` as a thin route
- This folder

**Depends on:** None beyond C2.

## Build

- Writing a set emits an `equipment_event` marking that unit occupied for a window of the logged rest time plus two minutes.
- Occupancy resolver returning one of three tiers per unit, with the tier exposed to the UI: `observed` when an event is live and under 15 minutes old, `inferred` from `occupancy_history` for this hour and weekday, `unknown` when neither exists.
- The Gym board: units grouped by zone, each row showing name, status dot, and freshness as relative time. Zone headers show a count like "4 of 6 free".
- Inferred rows render as a range with the word likely. Unknown rows say "No data" and nothing else. Never show a fabricated number.
- Supabase realtime subscription updating the board in place, re-syncing on `visibilitychange` and on reconnect.
- A secondary action on each row to mark it free or busy manually, rate limited, for people who are not logging.
- k-anonymity: never render a zone count below the threshold in `PROJECT.md`.

## Done when

- Two browser windows side by side: logging a set in one flips the unit to busy in the other within two seconds, with no refresh.
- A unit whose window has elapsed returns to free on its own.
- A unit with no data shows "No data" rather than free.
- The orange live dot appears only while the realtime channel is connected.

## Smoke items to append to SMOKE.md

Write them so someone who has not read the code can follow them on a
phone. These are the minimum. Add any others this checkpoint needs.

1. Open the Gym board in two windows. Log a set on a unit in one. The other flips to busy within two seconds.
2. Wait out the occupancy window. The unit returns to free without a refresh.
3. Find a unit with no history. It reads "No data", not free.
4. Put the tab in the background for two minutes and return. The board re-syncs rather than showing stale state as live.
5. Kill the network. The live dot disappears. Restore it. The dot returns and the board re-syncs.

## Notes

- Honesty in this UI is a judging point. Never invent a number to fill a row.

## Before marking this done

Run the full gate in `BUILD_SPEC.md` and report pass or fail per item.
Then append the smoke section, commit with `STATE.md` updated in the same
commit, squash merge to `main`, and tag `c03-green`.
