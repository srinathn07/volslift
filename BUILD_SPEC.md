# BUILD_SPEC.md

How this build runs. Per-checkpoint detail lives in each feature folder's
`README.md`, which is the authoritative spec for that step. This file holds
what cuts across all of them.

## The one prompt

There is one prompt in this build. The user pastes it unchanged, at either
agent, every time. It names no checkpoint. The agent works out where the
project is from the repo and continues from there, which is what makes the same
text work at hour zero, at hour 14, and on a takeover.

```
Read AGENTS.md first and follow it. Then do the following.

ORIENT. Before writing any code:
1. git pull
2. Read in full: AGENTS.md, STATE.md, .agent-lock, DESIGN.md, SMOKE.md, and
   the README.md of the next two feature folders under src/features/.
3. Run: git log --oneline -15, git status, git tag --list
4. Run: npx tsc --noEmit, npm run build, npx vitest run
5. Report in 10 lines or fewer: the last green checkpoint and its tag, the
   head commit, whether the tree is clean, the results of those three
   commands, the lock status and its age, and which checkpoint you are about
   to start.
   If the repo contradicts STATE.md, trust the repo, say so, and fix STATE.md
   before you build anything.
   If STATE.md says C0 is not started, this is hour zero. Start at C0.

BUILD. Take the next checkpoint in order and build it to the done-when
criteria in its folder's README.md. Then, in this order:
- Run the full gate below and report pass or fail per item
- Append this checkpoint's section to SMOKE.md
- Commit, with STATE.md updated in the same commit
- Squash merge to main and tag cNN-green
- Start the next checkpoint

Keep going. Do not wait for me between checkpoints.

HAND BACK TO ME when any of these becomes true, finishing the commit you are
on first:
- You just finished C1 or C3, or you are about to start C11
- The same gate item has failed twice
- You would need to change the schema, add a dependency, or edit a file that
  another feature folder owns
- You are near the end of your usage budget
- Something in a README is ambiguous enough that guessing could cost an hour

To hand back: write STATE.md with the exact next action in one sentence,
delete .agent-lock, push, then tell me in two lines where things stand and
what you want me to check. Then stop.

ALWAYS IN FORCE:
- DESIGN.md is law. No gradients, no emoji, no purple, system font only,
  tabular numerals on every number, 44px tap targets, sentence case labels.
  The words AI, smart, powered and magic appear in no user-facing string.
- Never refactor, restyle, rename or reorganize code you did not write in
  this session. Disagreements go under ## Notes in STATE.md. The code stays.
- Commit at least every 20 minutes even if unfinished, on the checkpoint
  branch, with STATE.md marked partial. Push every commit.
- main holds only green checkpoints. Branch tips may be broken.
- Never report a gate item as passing if you did not run it. Name what you
  could not run and why.
```

## The gate

Run before any checkpoint is marked done. Report pass or fail on each. Any
failure means the checkpoint is not complete.

1. `npx tsc --noEmit` exits clean, with `strict` on and no `any` introduced
2. `npm run build` succeeds
3. `npx vitest run` passes
4. Browser console is clean after walking the new flow: zero errors, zero
   warnings, zero unhandled rejections
5. Every item in `SMOKE.md` passes, including sections from all earlier
   checkpoints. List each item with its result, not a summary
6. No horizontal scroll at 360px width
7. Every new button double-tapped, no duplicate rows written
8. Any new write path exercised with the network disabled, then re-enabled,
   with no data loss and no duplicates
9. Hard refresh in the middle of the new flow leaves the app in a valid state

If you cannot verify an item because you have no browser or no database
credentials, say so explicitly rather than claiming a pass. Those items fall to
the user.

## The build sequence

Priority is in the folder name. `p0` ships or the submission fails, `p1` is
cuttable. Full spec in each folder's `README.md`.

| Step | Folder | Hours | Hands back |
| --- | --- | --- | --- |
| C0 foundation | `c00-p0-foundation` | 2 | |
| C1 auth and schema | `c01-p0-auth-schema` | 2.5 | Yes |
| C2 logger | `c02-p0-logger` | 5 | |
| C3 status engine | `c03-p0-status-engine` | 4 | Yes |
| C4 swap engine | `c04-p0-swap-engine` | 5 | |
| C5 reroute | `c05-p0-reroute` | 3.5 | |
| C6 floor map | `c06-p0-floor-map` | 3 | |
| C7 simulator | `c07-p0-simulator` | 2.5 | |
| C8 best time to go | `c08-p1-best-time` | 2.5 | |
| C9 equipment reports | `c09-p1-equipment-reports` | 1.5 | |
| C10 load translation | `c10-p1-load-translation` | 1.5 | |
| C11 polish and sweep | `c11-p0-polish` | 3 | Before starting |

C4 has no UI dependency on C2, so it can be built in parallel from the moment
C1 lands. C6 can run in parallel with C5.

## Handoff between agents

The repo is the only shared memory. Nothing in either chat survives the switch.

### Instruction file

This repo uses `AGENTS.md` and deliberately has **no** `CLAUDE.md`. Claude Code
reads `AGENTS.md` when no `CLAUDE.md` exists anywhere on the path, and Codex
reads it natively. If both files existed, `CLAUDE.md` would win silently and the
two agents would follow different rules. Do not create one.

Requires Claude Code v2.1.277 or later. Right after installing or upgrading,
`AGENTS.md` is picked up from the next session on, not the current one.

### The lock

`.agent-lock` is committed at the start of work and holds agent name,
checkpoint, branch, and start time.

- Held by the other agent and under 45 minutes old: do not take that checkpoint
- Older than 90 minutes: assume the session died, take over, note it in
  `STATE.md`
- Released by deleting it in the commit that marks the checkpoint green

### Commit discipline

Update `STATE.md` **in the same commit** as the code, never in a commit after
it. Updating it afterwards is one commit too late: if the session dies in
between, there is code on the branch and a baton describing the previous state,
which is worse than no baton at all.

### Taking over mid-build

Three things in the orient report mean the previous session died mid-write: the
lock is still held, the `STATE.md` timestamp is well behind the head commit, or
the gate fails on a checkpoint the baton claims is green. Any of those and the
safest move is a reset to the last green tag rather than repairing a state
nobody understands.

### Split by what each environment can verify

The constraint is not model quality, it is whether the agent can run the app. An
agent without database credentials cannot verify C2 or C3 no matter how good its
code is.

- Pure logic and assets, verifiable with `tsc`, `vitest` and a build:
  C4, C6, C7, C10
- Needs a live database and a browser: C1, C2, C3, C5, C8, C9, C11

Give the environment with working credentials the second group.

## Freeze schedule

- **Hour 0.** Stack locked
- **After C1, around hour 5.** Schema frozen. No migrations for the rest of the
  event
- **After C2, around hour 12.** Dependency freeze
- **Hour 26.** Feature freeze. Only C11 work
- **Hour 30.** Code freeze except crashes and visible breakage
- **Hour 32.** Nothing lands on `main` but a revert

## Cut order when behind

Drop C10, then C9, then C8. If still behind, degrade C6 from an SVG map to a
zone list on the board.

Never cut C2, C3, C4, C7, or C11. C7 feels cuttable and is not: an empty board
at judging is worse than a missing feature, and the simulator is what prevents
it.

When behind, cut a checkpoint. Do not cut the gate.
