# C4 The swap engine

**Priority:** `p0`  
**Build order:** C4  
**Estimated:** 5 hours  
**Environment:** Pure logic. Verifiable with tsc, vitest and a build. No database needed, so this is the best candidate for whichever agent lacks credentials.

## Scope

You may create or edit only these paths. If you think you need a file
outside this list, stop and say why instead of editing it.

- This folder
- `tests/c04-p0-swap-engine/`

**Depends on:** None beyond C1's seed.

## Build

- A pure scoring function over the exercise attributes seeded in C1:
```
similarity = 0.35 * same_primary_mover
           + 0.25 * same_pattern
           + 0.15 * resistance_profile_match
           + 0.15 * stability_within_1
           + 0.10 * rom_match
           - 0.15 if skill_floor delta > 1

rank = similarity * p_available * distance_decay(walk_seconds)
```
- An intent gate applied **before** scoring, derived from the target rep range of the item being swapped. 1 to 5 reps: candidate must be heavily loadable, barbell or a loaded machine, and cables and flies are excluded outright. 6 to 15 reps: dumbbell, machine and cable variations all eligible. 16 or more: anything hitting the same primary mover.
- A fatigue rule deprioritizing a candidate whose pattern the user already trained in this session.
- An optional per-user no-axial-load flag that hard-filters loaded spinal compression.
- A templated one-line reason string per result, assembled from which criteria matched, for example "Same horizontal press, loadable for heavy sets, 40 ft away." Never generated text, always assembled from the matched criteria.
- Bottom sheet UI labeled "Find a swap", showing the top three with their reason, status and walk distance.

## Done when

- All five required tests pass.
- The sheet renders three results with reasons in under 200ms with no spinner.

## Smoke items to append to SMOKE.md

Write them so someone who has not read the code can follow them on a
phone. These are the minimum. Add any others this checkpoint needs.

1. Open a busy unit on the Gym board and tap Find a swap. Three results appear with a reason line each.
2. The sheet never shows a cable or fly variation for a heavy barbell press.
3. Every result shows its current status and walk distance.
4. No result is a unit currently marked busy or out of service.

## Notes

- This is the differentiator and it must be deterministic and explainable, not a model call. "Is this just an LLM wrapper" is the question that sinks hackathon projects. Use an LLM offline to help author the attribute seed in C1, then freeze it.
- **Required tests, these exact cases:**
    1. Barbell bench at 3 reps returns no cable or fly variation
    2. Barbell bench at 10 reps does return dumbbell press and machine press
    3. Back squat with the no-axial-load flag returns no axially loaded candidate
    4. Units marked busy never appear in results
    5. Two candidates with equal similarity are ordered by walk distance
- The intent gate is the thirty-second talking point that separates this from every other "AI suggests exercises" project in the room. Do not weaken it.

## Before marking this done

Run the full gate in `BUILD_SPEC.md` and report pass or fail per item.
Then append the smoke section, commit with `STATE.md` updated in the same
commit, squash merge to `main`, and tag `c04-green`.
