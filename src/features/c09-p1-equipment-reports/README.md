# C9 Broken equipment reports

**Priority:** `p1`  
**Build order:** C9  
**Estimated:** 1.5 hours  
**Environment:** Needs database credentials.

## Scope

You may create or edit only these paths. If you think you need a file
outside this list, stop and say why instead of editing it.

- `app/(app)/gym/report/` as a thin route
- This folder

**Depends on:** C3 must be green.

## Build

- Report a unit as out of service with an optional note and a category.
- Reported units render distinctly on the board and are excluded as swap candidates.
- An export view listing open reports with timestamps and counts, which is what gets handed to RecSports.
- Rate limited per user per unit per day.

## Done when

- A reported unit disappears from swap results and appears in the export view.

## Smoke items to append to SMOKE.md

Write them so someone who has not read the code can follow them on a
phone. These are the minimum. Add any others this checkpoint needs.

1. Report a unit out of service. It renders distinctly on the board.
2. Tap Find a swap elsewhere. The reported unit never appears as a candidate.
3. Open the export view. The report is listed with its timestamp.
4. Report the same unit again. The second report is refused.

## Notes

- Small, cheap, and the thing that makes a RecSports partnership story concrete rather than hypothetical.

## Before marking this done

Run the full gate in `BUILD_SPEC.md` and report pass or fail per item.
Then append the smoke section, commit with `STATE.md` updated in the same
commit, squash merge to `main`, and tag `c09-green`.
