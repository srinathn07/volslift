# C11 Polish, accessibility and the final sweep

**Priority:** `p0`  
**Build order:** C11  
**Estimated:** 3 hours  
**Environment:** Needs database credentials, a browser and a real phone.

> Hand back to the user before starting this checkpoint.

## Scope

You may create or edit only these paths. If you think you need a file
outside this list, stop and say why instead of editing it.

- Any folder, for fixes only. No new features.

**Depends on:** Everything else green or formally cut.

## Build

- A cold-open path. Judges will open the app themselves and a blank logger is a bad first impression. First run lands on the Gym board with real-looking state, not an empty Log tab.
- A pre-seeded demo account with session history so the Plan tab and load translation have something to show.
- Every empty state written as a real sentence. Audit all four tabs.
- Accessibility pass: labels on every input, visible focus states, contrast checked on every text and background pairing, status never communicated by color alone, so every dot carries a text label too.
- All console warnings cleared, not just errors.
- Dev routes verified 404 in a production build. Check `/preview` and `/dev/sim` explicitly.
- Full `SMOKE.md` run on a real phone over the LAN, every section, front to back.
- Three full rehearsals of the demo on the actual build.

## Done when

- Someone outside the team installs it to their home screen, walks the main flow with no guidance, and hits nothing broken.

## Smoke items to append to SMOKE.md

Write them so someone who has not read the code can follow them on a
phone. These are the minimum. Add any others this checkpoint needs.

1. Install to a home screen. It opens with no browser chrome and the status bar area is not white on white.
2. Open cold as a new user. The first screen has content, not an empty state.
3. Walk every section of SMOKE.md on a phone. All pass.
4. Confirm `/preview` and `/dev/sim` both 404 in production.

## Notes

- Reserve this. Do not let it get eaten by feature work.
- No new features in this checkpoint. Fixes only.

## Before marking this done

Run the full gate in `BUILD_SPEC.md` and report pass or fail per item.
Then append the smoke section, commit with `STATE.md` updated in the same
commit, squash merge to `main`, and tag `c11-green`.
