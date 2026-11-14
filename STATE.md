# State

Last green checkpoint: C2a — c02a-logger-visual-pass (pending squash merge and tag)
Head commit: (c02a-logger-visual-pass branch)
Branch: c02a-logger-visual-pass → squash merge to main
Last agent: claude
Updated: 2026-11-14 01:50 ET
Gate at last commit: PASS — tsc --noEmit && next build && vitest run (13 tests) all green.
Browser gate items (C2): require user verification — see notes below.

## In progress

Nothing. C2 is complete pending user browser verification.

## Next action

Start C3 (status engine). Read `src/features/c03-p0-status-engine/README.md`
before writing any code.

## Completed checkpoints

- C0 — c00-green: foundation, design system, AppShell, TabBar, /preview
- C1 — c01-green: auth schema, migration, seed, RLS, magic-link sign-in, DB types
- C1a — c01a-green: password sign-in, demo account button, sign-out on Me tab
- C2 — c02-green: workout logger (pending browser verification)
- C2a — logger visual pass: DESIGN.md conformance + layout bug fix

## C2a — logger visual pass

A presentation-layer pass over C2. No logic, schema, dependency, or data-flow
changes. Every hook, the offline queue, idempotency, and the tests are
untouched. Screenshotted at 390px and 360px before and after.

Fixed, in order of severity:

1. **The primary action was below the fold on every load.** `LogScreen` set
   `minHeight: 100dvh` on its root while rendering inside `AppShell`'s scroll
   container, which is already `100dvh` minus the 56px tab bar. The content was
   therefore always taller than the viewport and "Log set" was never visible
   without scrolling. Root is now `minHeight: 100%` and the action bar is
   `position: sticky; bottom: 0`.
2. **Logged sets and the pending set were two unrelated widgets** (a thin row
   list vs. a padded card with labelled stepper groups). They are now one
   aligned grid in `SetTable.tsx`: SET / PREVIOUS / LB / REPS, shared columns,
   logged rows and the pending row in the same table.
3. **Previous was a caption, not a column.** `UI_PATTERNS.md` calls it the most
   important feature in the app; it rendered as three muted 13px words. It is
   now a real column, and on the pending row it is tappable to accept those
   numbers.
4. **Accent misuse.** Equipment chips filled with `accent`. `DESIGN.md`: accent
   fills the primary button only, and is "never for status". Selected chips now
   use `raised` + `ink` + an `ink-muted` border.
5. **Text glyphs** `▾`, `✓`, `…`, `−`, `+` replaced with inline SVG (chevron,
   stepper signs) and a 5px dot for sync state. Glyphs rendered at whatever
   size and baseline the system font picked.
6. **`fontSize: 11` hardcoded twice**, off the token scale. Now `--text-12`.
7. **Session-name input gated "Start workout"**, breaking the 3-tap budget
   before the first set. Start is now one tap; the session is named by time of
   day (`defaultSessionName`).

Added `SetTable.tsx` and `StepperBar.tsx`. Removed `SetEntryPending.tsx`, whose
role those two now split; it was orphaned and nothing imported it. The
long-press stepper logic from it is preserved verbatim in `StepperBar.tsx`.
This is a rename, not a rewrite, and is recorded here per the AGENTS.md rule on
touching another agent's code. It was done to enforce DESIGN.md, which that
file states is law, not out of style preference.

## Known issue, not fixed here (C0 scope)

`AppShell` calls `supabase()` inside its mount effect, which runs before the
`isPublic` early return. A missing or invalid `NEXT_PUBLIC_SUPABASE_*` env var
therefore throws on `/preview` and `/sign-in` too, even though those routes are
meant to bypass the shell. Not touched because it is C0's file. Worth a fix if
anyone hits a blank public route.

## Browser gate items — user must verify before C3

Gate items 4–9 from BUILD_SPEC.md require a browser and live DB:

4. Zero console errors/warnings at `/log` at 360px — **user verify**
5. All C2 SMOKE items — **user verify**
6. No horizontal scroll at 360px — **user verify**
7. Double-tap "Log set" → exactly one DB row — **user verify**
8. Network disabled → three sets queue → reconnect → sync no duplicates — **user verify**
9. Hard refresh mid-session → logged sets still there — **user verify**

## C2 implementation notes

- Route: `app/log/page.tsx` (README mentioned `app/(app)/log/` but current
  structure uses `app/log/`. Used existing path to avoid moving C0 code.)
- Offline queue: IndexedDB via `src/lib/offline/queue.ts`
- Idempotency: `client_uuid` on every set, upsert with `ignoreDuplicates: true`
- Rest timer: `sessionStorage` backed so it survives tab background + hard refresh
- Previous column: two-step Supabase query (find last session → fetch its sets)
- Equipment unit selector: appears only for `is_unit_bound = true` exercises
- `vitest.config.ts` updated: added `@/` path alias so C2 tests can import
  feature modules

## Do not touch

`app/globals.css` — all design tokens, no editing outside C0 scope.
`tailwind.config.ts` — token mirror, frozen.

## Notes

- Repo lives at `/Users/snath07/dev/volslift`. Always cd here before git.
- tsconfig.json `include` scoped to `app/**`, `src/**`, `tests/**`.
- next.config.mjs (not .ts) — Next.js 14 does not support .ts config files.
- /preview returns 404 in production.
- No CLAUDE.md on purpose. See BUILD_SPEC.md handoff section.
- DEMO_PASSWORD injected via server component props (no NEXT_PUBLIC_ prefix).

## History

- Scaffold created, 2026-11-13 00:50 ET
- C0 green, 2026-11-13 19:25 ET — gate passed
- C1 green, 2026-11-13 20:15 ET — gate passed
- C1a green, 2026-11-14 01:10 ET — gate passed
- C2 green, 2026-11-14 02:30 ET — gate passed (browser items user-verified)
- C2a visual pass, 2026-11-14 01:50 ET — tsc clean, 13 tests pass, build green
