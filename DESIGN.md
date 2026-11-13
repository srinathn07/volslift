# DESIGN.md

The design target is a native iOS utility app, not a product landing page.
Everything that makes a build look AI-generated comes from landing-page
instincts. This file is law. An agent that disagrees records the objection in
`STATE.md` and changes nothing.

## Banned, no exceptions

- Gradients anywhere: backgrounds, buttons, text, icons, borders
- Purple, violet, indigo, or any blue-to-teal pairing
- Glassmorphism, `backdrop-filter`, frosted or translucent panels
- Emoji in any part of the interface
- Sparkle, wand, robot, or brain icons
- The words AI, smart, powered, intelligent, or magic in any user-facing
  string. The swap feature is labeled "Find a swap". Keep internal names in
  code and out of the UI
- More than one shadow depth in the whole app
- Border radius above 12px on any rectangle
- Centered body copy, hero text, or large numbers used as decoration
- Cards nested inside cards
- More than two font weights on one screen
- Animation longer than 180ms, and any spring, bounce, or scale-on-hover
- Shimmer or skeleton loaders. Use a static neutral block or nothing
- Toasts for routine success. Success is shown by the data changing
- Icon-only buttons, except back and close

## Tokens, use these exact values

| Token | Value | Used for |
| --- | --- | --- |
| `canvas` | `#FAF9F7` | App background |
| `surface` | `#FFFFFF` | Cards, rows, sheets |
| `ink` | `#1A1715` | Primary text, primary buttons |
| `ink-muted` | `#6E6862` | Secondary text, labels |
| `hairline` | `rgba(26,23,21,0.10)` | All separation, 1px |
| `accent` | `#FF8200` | Live indicator dot and active tab marker only |
| `free` | `#2E7D32` | Equipment free |
| `busy` | `#B3261E` | Equipment in use |
| `unknown` | `#8A8A8A` | No data |

The accent is UT orange and it is rationed. Primary buttons are `ink` with
white text, because white on orange fails contrast and an all-orange app reads
as a school flyer. Orange appears in two places only: the live dot and the 2px
marker under the active tab. Never use orange for status.

## Type, spacing, shape

- Font: system stack only.
  `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.
  No webfont, no Inter. The system font is what makes it read as native
- Scale: 12, 13, 15, 17, 22, 28. Body is 15. Weights 400 and 600, nothing else
- Spacing: 4, 8, 12, 16, 24, 32, 48. No arbitrary values
- Radius: 8 on cards and buttons, 12 on bottom sheets, fully round only on
  status dots
- Separation is a 1px `hairline` border. The one shadow token is reserved for
  the bottom sheet and the tab bar
- Icons: one outline set at 20px with 1.5px stroke. Lucide is fine. Never mix
  sets

## Required on every screen

- `font-variant-numeric: tabular-nums` on every weight, rep count, timer, and
  occupancy number so digits do not jitter as they update
- Minimum 44px tap target on anything interactive
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
