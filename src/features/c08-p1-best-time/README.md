# C8 Best time to go, plus wait estimates

**Priority:** `p1`  
**Build order:** C8  
**Estimated:** 2.5 hours  
**Environment:** Needs database credentials.

## Scope

You may create or edit only these paths. If you think you need a file
outside this list, stop and say why instead of editing it.

- `app/(app)/gym/when/` as a thin route
- This folder

**Depends on:** C7 must be green.

## Build

- Paste or pick class times, stored on the device, never sent anywhere. Say that in the UI in one line.
- The three best gym windows in the next seven days, ranked by predicted occupancy against free time.
- Per-zone wait estimate from a simple queueing model over unit count and historical arrival rate, shown as a rounded range like "about 8 to 12 minutes", never a single number.
- Home game days marked as closed rather than quiet.

## Done when

- Windows change sensibly when the schedule changes.
- No window is ever recommended during a closure.

## Smoke items to append to SMOKE.md

Write them so someone who has not read the code can follow them on a
phone. These are the minimum. Add any others this checkpoint needs.

1. Enter a class schedule. Three windows appear, none overlapping a class.
2. Change one class time. The windows change.
3. Check a home game day. It is marked closed, not quiet.
4. Every wait estimate is a range, never a single number.

## Notes

- Cuttable. First to go if the build is behind.

## Before marking this done

Run the full gate in `BUILD_SPEC.md` and report pass or fail per item.
Then append the smoke section, commit with `STATE.md` updated in the same
commit, squash merge to `main`, and tag `c08-green`.
