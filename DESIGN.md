# DESIGN.md

The design target is a native iOS utility app, not a product landing page.
Everything that makes a build look AI-generated comes from landing-page
instincts. This file is law. An agent that disagrees records the objection in
`STATE.md` and changes nothing.

Read `UI_PATTERNS.md` alongside this for the interaction benchmarks.

## The app is dark

Not a theme, not a toggle. Gyms are dimly lit and every serious logger in this
category is dark for that reason. There is no light mode in this build.

## Banned, no exceptions

- Gradients anywhere: backgrounds, buttons, text, icons, borders
- Purple, violet, indigo, or any blue-to-teal pairing
- Glassmorphism, `backdrop-filter`, frosted or translucent panels
- Emoji in any part of the interface
- Sparkle, wand, robot, or brain icons
- The words AI, smart, powered, intelligent, or magic in any user-facing
  string. The swap feature is labeled "Find a swap". Keep internal names in
  code and out of the UI
- Pure black `#000` and pure white `#FFF` anywhere
- Neon or saturated accent colors beyond the tokens below
- Border radius above 12px on any rectangle
- Centered body copy, hero text, or large numbers used as decoration
- Cards nested inside cards
- More than two font weights on one screen
- Animation longer than 180ms, and any spring, bounce, or scale-on-hover
- Shimmer or skeleton loaders. Use a static neutral block or nothing
- Toasts for routine success. Success is shown by the data changing
- Icon-only buttons, except back and close
- A social feed, anywhere, for any reason

## Tokens, use these exact values

| Token | Value | Used for |
| --- | --- | --- |
| `canvas` | `#0E0E0F` | App background |
| `surface` | `#1A1A1C` | Cards, rows, sheets |
| `raised` | `#242428` | The active exercise card, the open sheet |
| `ink` | `#F5F4F2` | Primary text, numbers |
| `ink-muted` | `#9A9792` | Labels, the Previous column, secondary text |
| `hairline` | `rgba(245,244,242,0.10)` | All separation, 1px |
| `accent` | `#FF8200` | Primary action, active tab marker, live dot |
| `on-accent` | `#0E0E0F` | Text on an accent button |
| `free` | `#4ADE80` | Equipment free |
| `busy` | `#F87171` | Equipment in use |
| `unknown` | `#6B6B70` | No data |

The accent is UT orange. On this background it has enough contrast to carry a
primary button with near-black text on it, which is the one place a saturated
color is allowed to fill an area. Everywhere else it appears as a small mark:
the active tab indicator and the live dot. Never use it for status.

## Type, spacing, shape

- Font: system stack only.
  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
  No webfont, no Inter. The system font is what makes it read as native
- Scale: 12, 13, 15, 17, 22, 28, 40. Body is 15. The in-session weight, reps
  and timer use 28 or 40 because they are read at arm's length
- Weights 400 and 600, nothing else
- Spacing: 4, 8, 12, 16, 24, 32, 48. No arbitrary values
- Radius: 8 on cards and buttons, 12 on bottom sheets, fully round only on
  status dots
- Separation is a 1px `hairline` border. The one shadow token is reserved for
  the bottom sheet and the tab bar

## Required on every screen

- `font-variant-numeric: tabular-nums` on every weight, rep count, timer, and
  occupancy number so digits do not jitter as they update
- 44px minimum tap target anywhere, **56px for any control tapped during a
  session**, because that happens one-handed with sweaty hands
- Text left-aligned, labels in sentence case, no title case buttons, no ALL
  CAPS except an optional 11px section label with 0.06em letterspacing
- Every list has a written empty state as a plain sentence, for example
  "No sets logged yet."
- No horizontal scroll at 360px width
- Copy is short and flat. "Log set", not "Log Your Set!". No exclamation marks
  anywhere

## Layout

The app is phone-only. The shell is a `max-width: 430px` column centered on
`canvas`, with the tab bar pinned inside it. There is no desktop layout and no
breakpoint.

- Use `100dvh`, never `100vh`. Safari's `100vh` includes the address bar and
  pushes the tab bar off screen
- Pad the tab bar with `env(safe-area-inset-bottom)`
- Every primary action sits in the bottom third of the screen. Logging a set is
  done standing at a rack with one hand
- Set the theme color meta to `canvas` so the browser chrome matches
