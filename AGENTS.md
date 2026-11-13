# AGENTS.md

VolsLift. A fast, free workout logger that adapts your session when the
equipment you planned on is taken. Built at VolHacks by two agents working in
alternation, Claude Code and Codex. The repo is the only shared memory between them. Assume you
have never seen this project before, because the agent before you is gone.

## Read these before doing anything

1. `STATE.md` — where the build is and what to do next. Authoritative.
2. `BUILD_SPEC.md` — the gate, the build sequence, the handoff protocol.
3. `src/features/<your checkpoint>/README.md` — the spec for the step you are on.
4. `DESIGN.md` — styling rules. Non-negotiable. The app is dark.
5. `UI_PATTERNS.md` — interaction benchmarks from the apps lifters actually
   use. Read before building any screen.
6. `SMOKE.md` — the manual test checklist you must run.
7. `PROJECT.md` — stack, conventions, data model.

## Where code goes

Every checkpoint owns a folder under `src/features/`, named
`c<NN>-p<0|1>-<slug>`. The number is build order, the `p` is priority:
`p0` ships or the submission fails, `p1` is cuttable. Each folder has a
`README.md` that is the authoritative spec for that step.

- Code for checkpoint `CNN` goes **inside that checkpoint's folder**. A feature
  folder holds its own components, hooks, logic, and types.
- `src/components/ui/` is for primitives used by three or more features
  (Button, Row, Sheet, Stepper). Nothing feature-specific goes here.
- `src/lib/` is for cross-feature helpers only: the Supabase client, generated
  DB types, date and formatting utilities.
- `app/` holds routes. Route files stay thin and import from the feature
  folder. No business logic in `app/`.
- `supabase/` holds the single migration and the seed. Frozen after C1.
- `tests/` mirrors the feature folder names.
- Do not create a new top-level folder. Do not rename, move, or merge a feature
  folder.
- If something genuinely belongs to two features, put it in `src/lib/` and note
  why under `## Notes` in `STATE.md`.

## Rules for every agent

- Work through the checkpoints in order, starting from the one `STATE.md` names
  as next. Never skip ahead or reorder them.
- Stop and hand back to the user after C1, after C3, before C11, and any time
  the same gate item fails twice.
- Read `.agent-lock` first. If it is held and under 45 minutes old, stop and say
  so. If it is over 90 minutes old, take over and note the takeover in
  `STATE.md`.
- Never refactor, restyle, rename or reorganize code another agent wrote.
  Disagreements go under `## Notes` in `STATE.md`. The code stays.
- Update `STATE.md` in the same commit as the code, never in a later commit.
- Commit at least every 20 minutes, even unfinished, on the checkpoint branch,
  with `STATE.md` marked partial.
- Push every commit. Unpushed work does not exist to the other agent.
- `main` holds only green checkpoints. Branch tips may be broken.
- Never add a dependency unless the checkpoint's README names it.
- Never run a schema migration. The schema is frozen after C1.
- Run the gate in `BUILD_SPEC.md` before reporting a checkpoint done, and report
  pass or fail per item. Never report a pass you did not run.
- Do not re-plan the project or reorder the checkpoints.

## Commands

```
npm run dev -- -H 0.0.0.0   # dev server, reachable from a phone on the LAN
npx tsc --noEmit            # must exit clean
npm run build               # must succeed
npx vitest run              # unit tests
npm run gate                # tsc, build and vitest in sequence
```

## Commit format

```
C4 [claude]: add intent gate to swap scorer
C4 [codex]: assemble reason strings for swap results
```

## Branches

One branch per checkpoint, named after the feature folder:
`c04-p0-swap-engine`. Squash merge to `main` and tag `c04-green` in the same
step.
