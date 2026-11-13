# C5 Reroute my workout

**Priority:** `p0`  
**Build order:** C5  
**Estimated:** 3.5 hours  
**Environment:** Needs database credentials.

## Scope

You may create or edit only these paths. If you think you need a file
outside this list, stop and say why instead of editing it.

- `app/(app)/plan/` as a thin route
- This folder

**Depends on:** C4 must be green.

## Build

- A session plan: ordered items, each with an exercise, target sets and a target rep range.
- A reroute action that walks the remaining items and, for each one whose unit is busy, tries three things in order: move a later item with a free unit earlier, substitute via C4, or leave it and flag it.
- Primary-mover coverage is preserved. If the original plan hit quads, hinge and horizontal press, the rerouted plan hits all three.
- A visible before-and-after diff listing exactly what moved and what was swapped, each with its reason line.

## Done when

- With a seeded all-racks-busy state, one tap produces a valid plan covering the same primary movers.
- The diff names every change.
- Rerouting twice in a row produces the same plan.

## Smoke items to append to SMOKE.md

Write them so someone who has not read the code can follow them on a
phone. These are the minimum. Add any others this checkpoint needs.

1. Build a three-item plan. Set the simulator to all squat racks busy. Tap Reroute.
2. The new plan still covers every primary mover from the original.
3. The diff lists each move and each swap with a reason.
4. Tap Reroute again. The plan is identical.

## Before marking this done

Run the full gate in `BUILD_SPEC.md` and report pass or fail per item.
Then append the smoke section, commit with `STATE.md` updated in the same
commit, squash merge to `main`, and tag `c05-green`.
