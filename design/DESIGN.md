# VolFit design spec

Source of truth for porting the UI. The `.dc.html` files under `design/project/` are
artboards from a design canvas, not runnable app code: they use an authoring format
(`<x-dc>`, `<sc-for>`, `<sc-if>`, `{{holes}}`) whose logic lives in a `renderVals()`
method. Read them as visual reference and markup to lift; implement behavior per this
document.

## Design tokens

| Token | Value | Use |
| --- | --- | --- |
| `bg` | `#0A0C0E` | screen background |
| `surface` | `#15181C` | cards, rows |
| `surface-2` | `#1C2024` | inputs, icon tiles, nested panels |
| `surface-3` | `#111316` | unavailable / disabled rows |
| `border` | `#262B30` | default border |
| `border-strong` | `#32383E` | secondary button border |
| `text` | `#F4F5F6` | primary text |
| `text-dim` | `#8B939B` | metadata, labels |
| `text-faint` | `#6A7178` | inactive tabs, axis labels |
| `accent` | `#FF5A3C` | primary actions, active nav, brand |
| `accent-soft` | `rgba(255,90,60,0.14)` | accent icon tiles, selected chips |
| `success` | `#35D28A` | completed sets, available equipment, gains |
| `warning` | `#FFB24A` | deload flags, "not at this gym" |
| `muscle tints` | chest `#FF5A3C`, back `#4A90FF`, legs `#35D28A`, shoulders `#C792FF`, arms `#FFB24A` | exercise icons, routine rails |

Type: Space Grotesk 700 for headings, wordmark, and primary button labels. Inter
400/500/600 for body and UI. JetBrains Mono 500/600/700 for every number the user reads
as data (weight, reps, timers, tonnage, counts, dates on axes). Radii: 16 cards, 13 to
14 rows and buttons, 9 to 11 inputs and icon tiles, pill for chips. Min tap target 44px
on controls, 34px on dense in-table controls. Frame 390x844.

## Screens

### Home (`Main.dc.html`)
Brand lockup (accent tile with bar-over-V mark, "Vol" + accent "Fit"), settings button.
Greeting and date. One 42px row holding the gym pill (links to gym select, shows name
and `356/412`) and a streak chip. Primary "Start Empty Workout". AI coach teaser with
the top pending suggestion. Routine list, each row a colored rail, name, exercise count
and last-performed. Three stat tiles (week volume, week workouts, week PRs). Bottom tab
bar: Home, History, Exercises, Progress, Profile.

### Active workout (`Logger.dc.html`)
The screen that matters. Non-scrolling header: workout name, live elapsed time, running
tonnage, settings button, Finish. Scrolling exercise cards, each with a header (icon
tinted by muscle, name, equipment and muscle, overflow menu), a column head row
`SET | PREVIOUS | LB | REPS`, then set rows, then "Add Set".

Set row grid: `28px 1fr 64px 52px 34px`. Previous column is last session's
`weight x reps` for that set index, muted mono, read-only. Weight and reps are numeric
inputs. The check button marks the set done: row background goes
`rgba(53,210,138,0.07)`, button fills `success`, check stroke goes dark, and completing
a set opens the rest timer. Unchecking reverts and does not open it.

Rest sheet: bottom sheet over a scrim, countdown ring (`r=56`, `stroke-dasharray` 351.9,
offset animates), remaining time in mono over total, duration pills
30s / 1 min / 90s / 2 min / Custom with the selected one accented, Skip and Done.

Floating "Add Exercise" over a bottom fade, opens the library.

### Exercise library (`Library.dc.html`)
Header, search, then a gym context row (pin, gym name, `356 of 412 here`, Change). Filter
row: an "At my gym" toggle chip (green when on) then muscle chips.

With the toggle on, exercises whose equipment the gym lacks are filtered out. With it off
they render on `surface-3`, dimmed name, icon tint `#5B6168`, and a `Not here` tag in
`warning` instead of their best set. Tapping any exercise opens a detail sheet: name,
equipment and muscle, an amber swap strip when unavailable ("UT Rec Center has no trap
bar. Closest match in your equipment list: Rack Pull."), heaviest-set history line
chart, form cues, History and a primary CTA that reads "Add to Workout" or
"Add <substitute> instead".

### Your gym (`GymSelect.dc.html`)
Accordion. Each gym is a row (icon, name, `Campus · 356/412 exercises`, selection check,
chevron). Tapping selects that gym and expands its equipment inside the same card:
available kit as chips with a green check, missing kit struck through in `text-faint`,
plus a swap note naming the substitutions. Tapping the open gym collapses it; opening
another moves the panel, so one list is open at most. Below, a collapsed "Picker rules"
row whose summary reads "Hiding 56 unavailable exercises" and expands to the
"Only show available exercises" toggle. Seeded gyms: UT Rec Center (356/412), Planet
Fitness Kingston Pike (188/412, machines and dumbbells only), Home garage (214/412, no
cables or machines).

### Routine builder (`RoutineBuilder.dc.html`)
Cancel, title, Save. Name field. Folder chip and a "Build with AI" entry. Exercise rows
with a drag grip, name, target (`185 lb · 6-8 reps`), a sets button, remove. "Add
Exercise" opens the library, and a note under it states the picker is limited to the
gym's available exercises. Three estimate tiles: working sets, minutes, muscle groups.

### Progress (`Progress.dc.html`)
Range selector. Strength card with exercise chips, estimated 1RM in large mono, delta in
`success`, and a line chart that re-reads per exercise. Consistency heatmap, 16 columns
by 7 rows, four intensity steps from `#1D2227` to `accent`. Body weight card with
sparkline and a log button. PR list with trophy badges, recent ones accented.

### AI coach (`AICoach.dc.html`)
Header states the data it reads. Suggestion cards: a progression card (success icon),
a deload warning (warning icon, bar sparkline of weekly tonnage), and a routine
generator with goal chips. Every card has a "Why this suggestion?" disclosure whose body
shows the evidence as mono stats (reps hit, avg RPE, load step). Composer at the bottom.

## Behavior to implement

Availability is a set test: an exercise is available when its required equipment is in
the selected gym's equipment set. Compute the set once on gym select and hold it in
context; the library filter is a predicate over loaded rows, not a query per row.

Substitution: prefer a curated `exercise_substitutions` row. Fall back to scoring
candidates by same movement pattern, same primary muscle, equipment the gym has, ranked
by similarity of loading pattern.

Estimated 1RM uses Brzycki, `weight * 36 / (37 - reps)`. The numbers in the artboards
assume it (190 x 6 reads as 221).

Progression: recommend a load increase when the top of the rep range was hit on every
working set for the last two or three sessions and reported RPE stayed at or below 7.
Step 2.5 to 5 lb upper body, 5 to 10 lb lower.

Deload: flag when weekly tonnage for a muscle group rises more than about 30 percent
across a two week window while mean session RPE rises and reps per set fall. Require two
of those three signals.

Both rules return a struct, for example
`{ kind: 'progress', exercise_id, from, to, evidence: { reps_hit, avg_rpe, step_pct } }`.
The card renders from the struct and the disclosure renders `evidence`, so the coach is
never wrong about the user's numbers. A model call is optional phrasing on top, and is
genuinely needed only for routine generation from a stated goal, constrained to exercise
ids the gym supports.

Sessions are local-first: the active workout lives in IndexedDB, every set write lands
locally first, and sync pushes to the server using the client row id for idempotency.
Workouts record the gym they happened at, so lighter numbers at a limited gym are not
read as regression.

Timers derive from a stored start timestamp, never from accumulated interval ticks.

## Accessibility carried in the markup

Real `<button>`, `<a href>` and `<input>` throughout, `aria-label` on every icon-only
control, `aria-expanded` on disclosures, `aria-current="page"` on the active tab, charts
as `role="img"` with a sentence-long label, decorative SVG `aria-hidden`. Keep these when
porting. Colors that must be told apart differ in lightness, not only hue.
