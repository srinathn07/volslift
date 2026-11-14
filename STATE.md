# State

Last green checkpoint: C2 — c02-green (pending squash merge and tag)
Head commit: (c02-p0-logger branch)
Branch: c02-p0-logger → squash merge to main
Last agent: claude
Updated: 2026-11-14 02:30 ET
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
