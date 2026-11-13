# UI_PATTERNS.md

Benchmarks from the apps lifters actually use. Read this before building any
screen. These are not suggestions. They are the patterns the market has already
converged on, and deviating from them makes the app feel wrong to anyone who
has used a logger before.

## The speed budget

This is the number to design against.

- **Three taps** from opening the app to a logged set, once a session is
  running. That is the benchmark Strong set and it is what we match.
- **One tap** to add a set that repeats the last one.
- **Two taps** to modify weight or reps from the prefilled value.
- Seven to twelve taps is what bad apps cost, usually because they force you
  through routine navigation before you can log anything.

If a flow exceeds the budget, the flow is wrong, not the budget.

## Never open to a feed

An app that opens to a social feed or a dashboard costs two taps before the
user reaches a logging screen. VolsLift opens to one of two states:

- A session is running: open directly into it, at the current exercise.
- No session running: open to a single primary action to start one, with the
  last session's name as the default.

There is no social feed in this app at all.

## The Previous column is the most important feature in the app

Every review of every top logger says the same thing: the single most useful
feature is seeing what you did last time, inline, while you log. It is what
makes progressive overload possible without memory or a notebook.

- Every set row shows the corresponding set from the last time this exercise
  was performed, as `weight x reps`, in `ink-muted`
- The input is **prefilled** with those values, so the common case of
  repeating or slightly beating last session is already typed for you
- If there is no history, the cell reads a dash, never a zero and never blank

Build this in C2. It is not a polish item.

## Set entry

Prefill from the Previous column, then let the user adjust. Two input modes on
the same control:

- Steppers for adjustment: plus and minus, with a long press for a larger
  increment. This is the one-handed path and it handles the common case
- Tapping the number itself opens a numeric keypad for a precise value, because
  plates land on numbers a stepper would take ten presses to reach

Steppers alone are wrong, and a keypad alone is wrong. Every fast logger offers
both.

Include a plate calculator. It is a standard expectation in this category: given
a target weight and the bar, show which plates to load per side.

## Rest timer

- Starts **automatically** when a set is marked complete. The user never
  starts it
- Default per exercise, overridable
- Visible on the session screen without navigating anywhere
- Survives a backgrounded tab

The fastest apps let the user repeat the previous set directly from the
timer notification, without opening the app. Note it as a stretch, it is a real
speed advantage.

## One screen

Sets, reps, the rest timer and exercise notes all live on the session screen.
A lifter mid-set should never navigate to find any of them.

## Gym context changes the visual rules

This is why `DESIGN.md` specifies a dark palette.

- **Gyms are dimly lit.** A dark interface is the default in this category, not
  a preference or a toggle
- **One-handed, mid-set, with sweaty hands.** Tap targets for in-session
  controls go well above the 44px minimum. Use 56px for anything tapped while
  resting between sets
- **Glanceable numbers.** Weight, reps and the timer are the largest text on
  the screen, in tabular figures so they do not jitter as they change
- Near-black rather than pure black, off-white rather than pure white, to
  reduce eye strain under gym lighting

## What the market does not do, and we do

Worth knowing precisely, because it is the pitch.

The two best loggers are described by their own reviewers as recorders rather
than coaches. Strong is "a recorder, not a prescriber." Hevy is "a logger, not a
coach." Neither adapts when the gym does not cooperate. Reviewers also call out
that most apps have no intelligence about plateaus.

That is the gap. VolsLift logs as fast as they do **and** adapts the session when
the equipment you planned on is taken. Nothing in this category does the second
thing.

Do not build coaching, programming, or plate-by-plate prescription. The wedge is
narrow and specific: fast logging, plus intent-preserving substitution when
equipment is unavailable.

## Sources

Patterns above are drawn from published reviews and comparisons of Strong, Hevy,
Boostcamp, Jefit and Setgraph, plus fitness-app design guidance on gym context:

- [Strong App Review](https://repreturn.com/?p=1888)
- [Hevy App Review](https://repreturn.com/?p=1625)
- [Strong vs Hevy](https://repreturn.com/strong-app-vs-hevy/)
- [Workout logger comparison](https://www.boostcamp.app/compare/workout-tracking)
- [Fastest workout trackers](https://lastlift.pages.dev/articles/fastest-workout-tracker-apps/)
- [Fitness app design, UI and UX](https://madegooddesigns.com/fitness-app-design/)
