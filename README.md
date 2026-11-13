# VolsLift

A free workout tracker for UTK students, built around an equipment-level gym
crowd meter. See whether a specific squat rack is in use before you walk to
TRECS, and when it is taken, get a substitute that keeps your workout intact.

Built at VolHacks.

## The idea

Most gym apps tell you how busy a building is. One number for the whole
facility does not answer the question people actually have, which is whether
the thing they came to use is free.

VolsLift answers it at the equipment level, and the data comes from a place
that scales: **logging is sensing.** When you log a set on Rack 2, the set goes
in your log and Rack 2 is marked occupied for your rest window. Occupancy is a
byproduct of people tracking their own workouts, not of altruistic check-ins.
No cameras, no hardware, no separate reporting burden.

When a unit is taken, the swap engine suggests alternatives that respect what
you were actually doing. Heavy triples get a loadable substitute, not a cable
fly.

## Privacy

- No cameras and no computer vision, ever
- Equipment status is anonymous and aggregated, with a k-anonymity floor so
  nobody can infer that one specific person is at the gym
- Class schedules stay on the device
- Social features are opt-in and off by default
- No data sale, no ads

## Getting started

```bash
npm install
cp .env.example .env.local   # keys shared out of band, never committed
npm run dev -- -H 0.0.0.0    # reachable from a phone on the same WiFi
```

Then open `/preview` to work at phone dimensions on a laptop.

## Repo layout

```
AGENTS.md          read first, every session
BUILD_SPEC.md      the gate, the build sequence, the handoff protocol
PROJECT.md         stack, conventions, data model
DESIGN.md          UI rules, non-negotiable
STATE.md           where the build is right now
SMOKE.md           manual test checklist
app/               thin routes only
src/features/      one folder per checkpoint, priority in the name
src/components/ui/ shared primitives
src/lib/           cross-feature helpers
supabase/          one migration and the seed
```

## How this gets built

Two agents in alternation, Claude Code and Codex, swapping whenever one runs
out of usage. The repo is the only shared memory between them. Start with
`AGENTS.md`, then `STATE.md`.

Checkpoint folders are named `c<NN>-p<0|1>-<slug>`: build order, priority,
name. `p0` ships or the submission fails. `p1` is cuttable.
