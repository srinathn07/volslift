# PITCH.md

The demo presentation. Six slides, three minutes, one live demo running
alongside. Built for VolHacks: AI or Software, and Overall.

## The one sentence

Every logger records what you did. VolsLift is the one that adapts when the
gym does not cooperate.

## Slide plan

Six slides. Not seven. Hackathon demos die on slide count, and every slide you
add is time taken from the live demo, which is the only part that convinces
anyone.

| # | Slide | Time | Job |
| --- | --- | --- | --- |
| 1 | The problem | 20s | Make the pain physical and specific |
| 2 | Why existing apps don't help | 20s | Establish the gap with their own words |
| 3 | *(live demo, no slide)* | 90s | Prove it |
| 4 | How the swap engine decides | 30s | Show the engineering |
| 5 | What's real, what's seeded | 15s | Credibility |
| 6 | Where it goes | 15s | The flywheel, in one sentence |

### Slide 1, the problem

One photo of the rack line at TRECS at 5pm. Three lines of text, no more.

You plan a session. You get there. Every rack is taken. You wander, improvise
badly, do half the work you came for, and the session is wrecked.

If someone surveys 40 people at TRECS before the hackathon, the number goes
here and it is worth more than any feature on any later slide. "31 of 40 said
they have shortened or abandoned a workout because equipment was taken."

### Slide 2, why existing apps don't help

This is the strongest slide in the deck because it is not our opinion. The two
best loggers in the market are described by their own reviewers as recorders
rather than coaches. Strong is "a recorder, not a prescriber." Hevy is "a
logger, not a coach." Reviewers also note that most apps have no intelligence
about plateaus.

They are excellent at recording what happened. Not one of them does anything
when the equipment you planned on is occupied. That is the gap, and it is the
entire product.

### Slide 4, how the swap engine decides

One slide, no animation. Two things on it.

The scoring function:

```
similarity = 0.35 * same_primary_mover
           + 0.25 * same_pattern
           + 0.15 * resistance_profile_match
           + 0.15 * stability_within_1
           + 0.10 * rom_match
           - 0.15 if skill_floor delta > 1

rank = similarity * p_available * distance_decay(walk_seconds)
```

And the intent gate, which is the part that matters:

| Target reps | What is eligible |
| --- | --- |
| 1 to 5 | Heavily loadable only. Barbell or loaded machine. Cables and flies excluded outright |
| 6 to 15 | Dumbbell, machine and cable variations all open up |
| 16+ | Anything hitting the same primary mover |

Say out loud: this is a deterministic graph with unit tests, not a model call.
That sentence pre-empts the question that kills hackathon projects.

### Slide 5, what's real and what's seeded

Fifteen seconds, and it buys more credibility than anything else in the deck.
Name exactly what is real: the logger, the swap engine, the exercise graph, the
tests. Name exactly what is seeded: the occupancy history, the equipment
inventory if it was not fully surveyed. Judges ask anyway. Being the team that
volunteers it reads as rigor.

### Slide 6, where it goes

One sentence: logging a set also marks that rack occupied for your rest window,
so the more people log, the better the live board gets, with no cameras and no
check-in burden on anyone.

That is a flywheel sentence, not a dependency. Do not claim live occupancy
works today.

## The live demo, 90 seconds

Rehearse this until it is muscle memory. Beat by beat:

1. **Open the app.** It is already mid-session, on the Log tab. No dashboard,
   no feed. (3s)
2. **Log a set in three taps.** Point at the Previous column: last session's
   weight and reps, already prefilled. Say "this is the thing every lifter
   actually uses." (10s)
3. **The rest timer starts itself.** Nobody tapped it. (3s)
4. **Next exercise is squats. Tap that the rack is taken.** One tap. Say
   plainly: this needs no other users, you are the sensor for your own session.
   (8s)
5. **The swap sheet opens with three options, each carrying a reason line.**
   Read one out: "Same quad-dominant pattern, loadable for heavy sets, 40 feet
   away." (15s)
6. **THE MOMENT. Do not cut this beat.** Point out that it offered no cable or
   fly variation, because today is heavy triples. Then change the target rep
   range to 12 and watch the options change in front of them. (20s)
7. **Reroute the session.** One tap reorders what is left to fit what is open,
   and the diff names every change with its reason. (20s)
8. **Land it.** "Same session, same volume, nothing skipped, no waiting." (5s)

Beat 6 is the climax, not beat 5. Anyone can show a substitution list. Changing
the rep range and watching the engine's answer change is what proves it is
reasoning about training intent rather than pattern matching. If you are running
long, cut beat 7 before you cut beat 6.

## Questions you will get, and the answers

**Is this just an LLM wrapper?** No. Deterministic scoring over a seeded
exercise graph, with five named unit tests. Nothing is generated at runtime,
including the reason strings, which are assembled from the criteria that
matched.

**Who uses this besides serious lifters?** Anyone training in a shared gym.
TRECS alone sees around 4,000 visitors a day, and all 32,000-plus UTK students
hold a membership.

**How is it free?** No camera infrastructure, no hardware, no runtime model
calls. Marginal cost per user is effectively zero at campus scale.

**Could someone get hurt following a swap?** Substitutes preserve the movement
pattern and the training intent, it never prescribes a new program, and it never
suggests a load above what that user has already logged for that movement.
There is an optional no-axial-load flag that hard-filters loaded spinal
compression.

**Why wouldn't Hevy just build this?** They have positioned as recorders for a
decade and their reviewers describe them that way. If they build it, we were
right.

## Mechanics, the boring part that decides it

- **Record a backup video of the full demo.** Non-negotiable. Venue wifi fails,
  phones lock, Supabase hiccups. A team that falls back to video calmly looks
  prepared. A team that stands there refreshing loses.
- **Two phones.** One presenting, one already in the correct state as a hot
  spare.
- **Pre-set the demo scenario** and verify it ten minutes before you are called.
- **One presenter, one driver.** Never three people passing a laptop around.
- **Six slides, 16:9, dark to match the app.** Use the app's own tokens so the
  deck and the product look like one thing.
- **Rehearse three times on the real build**, not on the plan. Time it. If you
  are over three minutes, cut slide 6 before you cut a demo beat.

## What not to put in the deck

- No team photos, no "meet the team" slide, no tech-stack logo wall
- No TAM or market-size slide. It is a hackathon, not a seed round
- No screenshots of the app. You are demoing it live, so a screenshot just
  spends time telling them what they are about to see
- No animation beyond a plain cut between slides
