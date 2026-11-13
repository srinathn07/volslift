# C10 Load translation

**Priority:** `p1`  
**Build order:** C10  
**Estimated:** 1.5 hours  
**Environment:** Pure logic. No database needed to build or test.

## Scope

You may create or edit only these paths. If you think you need a file
outside this list, stop and say why instead of editing it.

- This folder
- `tests/c10-p1-load-translation/`

**Depends on:** C4 must be green.

## Build

- When a swap is accepted, suggest a starting weight from the user's own logged ratio between the two exercises.
- Fall back to a population ratio table when they have no history, and label it as an estimate.
- Never suggest a load above anything the user has previously logged for that movement.

## Done when

- A user with bench history gets a dumbbell suggestion derived from their own numbers.
- A brand new user gets a labeled estimate instead.

## Smoke items to append to SMOKE.md

Write them so someone who has not read the code can follow them on a
phone. These are the minimum. Add any others this checkpoint needs.

1. Accept a swap as a user with history. The suggested weight is derived from their own logs.
2. Accept a swap as a new user. The suggestion is labeled an estimate.
3. Confirm no suggestion exceeds the user's logged maximum for that movement.

## Notes

- Cuttable.

## Before marking this done

Run the full gate in `BUILD_SPEC.md` and report pass or fail per item.
Then append the smoke section, commit with `STATE.md` updated in the same
commit, squash merge to `main`, and tag `c10-green`.
