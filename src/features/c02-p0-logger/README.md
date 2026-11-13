# C2 Workout logger

**Priority:** `p0`  
**Build order:** C2  
**Estimated:** 5 hours  
**Environment:** Needs database credentials.

## Scope

You may create or edit only these paths. If you think you need a file
outside this list, stop and say why instead of editing it.

- `app/(app)/log/` as a thin route
- This folder
- `src/lib/offline/`

**Depends on:** None beyond C1.

## Build

- Start and finish a session.
- Exercise picker with instant search and recents at the top.
- Set entry using **steppers, not a keyboard**. Plus and minus 5 lb on weight with long-press for 25, plus and minus 1 on reps. Typing numbers on a phone between sets is what kills logger apps.
- Repeat last set in two taps, as the default action once a first set exists.
- Rest timer auto-starting on set save, with a default per exercise, surviving a backgrounded tab.
- Equipment unit selector on any exercise bound to a unit, defaulting to the last unit used.
- Current session set list, grouped by exercise.
- Idempotency key per set write, offline queue in IndexedDB, background sync on reconnect.

## Done when

- A three-exercise session logs in under 90 seconds of real interaction.
- With the network disabled, three sets log and appear in the UI, then sync on reconnect with no duplicates.
- Double-tapping save writes one row.
- Backgrounding the tab for 60 seconds and returning shows the correct remaining rest time.

## Smoke items to append to SMOKE.md

Write them so someone who has not read the code can follow them on a
phone. These are the minimum. Add any others this checkpoint needs.

1. Start a session, log three sets of one exercise using only the steppers. No keyboard appears.
2. Log a second set with repeat-last-set. It takes two taps.
3. Double-tap save hard. Only one set is added.
4. Turn the network off, log three sets, turn it back on. All three appear once, not twice.
5. Save a set, background the tab 60 seconds, return. The rest timer shows the right remaining time.
6. Finish the session. The set list shows every set grouped by exercise.

## Notes

- This is the core write path and C3 depends on its data. Give it the strongest builder.

## Before marking this done

Run the full gate in `BUILD_SPEC.md` and report pass or fail per item.
Then append the smoke section, commit with `STATE.md` updated in the same
commit, squash merge to `main`, and tag `c02-green`.
