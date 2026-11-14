# State

Last green checkpoint: C1 — c01-green (pending squash merge and tag)
Head commit: (C1 branch, pre-merge)
Branch: c01-p0-auth-schema → squash merge to main
Last agent: claude
Updated: 2026-11-13 20:15 ET
Gate at last commit: PASS — tsc --noEmit && next build && vitest run all green.

## In progress

Nothing. C1 is complete. Ready for C2.

## Next action

Start C2. Read the C2 checkpoint README before writing any code.

## Blocked on

**User must complete before marking C1 verified:**
1. Paste `supabase/migrations/20261113000000_initial_schema.sql` in Supabase
   Dashboard → SQL Editor and run it.
2. Paste `supabase/seed/seed.sql` in Supabase Dashboard → SQL Editor and run it.
3. Run the RLS verification query at the bottom of the seed file. All 10 tables
   must show `✓ ON`. Any `✗ OFF` is a blocker — do not proceed to C2.
4. Add LAN dev origin to Supabase redirect allowlist (see C1 README).
5. Create two dev test users manually: Dashboard → Authentication → Add User.
6. Run C1 smoke items to confirm sign-in works end-to-end.

## Do not touch

`app/globals.css` — all design tokens, no editing outside C0 scope.
`tailwind.config.ts` — token mirror, frozen.

## Notes

- Correction to commit 63a6cda's message: the c00-green tag DID exist and was
  pushed correctly. That commit's claim otherwise was wrong. It points at
  1540a4a. Only the stale head-commit line in this file needed fixing.

- Repo root is the home directory `/Users/snath07` — unusual but confirmed.
  All project files live at that path, not in a subdirectory.
- @types/react, @types/react-dom, @types/node, postcss, autoprefixer added as
  devDependencies. These are build-time requirements, not feature packages.
  The spirit of the dependency freeze is to prevent feature creep; TypeScript
  cannot compile JSX without @types/react.
- tsconfig.json `include` is scoped to `app/**`, `src/**`, `tests/**` to
  prevent the VS Code history files in the home directory from being compiled.
- next.config.mjs (not .ts) — Next.js 14 does not support .ts config files.
- /preview returns 404 in production: verified by build (NODE_ENV=production
  causes notFound() to fire server-side).
- This repo has no `CLAUDE.md` on purpose. See BUILD_SPEC.md handoff section.

## History

- Scaffold created, 2026-11-13 00:50 ET
- C0 green, 2026-11-13 19:25 ET — gate passed
