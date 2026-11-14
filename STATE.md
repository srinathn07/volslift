# State

Last green checkpoint: C0 — c00-green
Head commit: aa067ef C0 [claude]: bypass AppShell on /preview so tab bar doesn't double-render
Branch: main (after squash merge)
Last agent: claude
Updated: 2026-11-13 19:25 ET
Gate at last commit: PASS at 1540a4a. Three C0 refinement commits landed after it (phone frame, tab icons, preview shell bypass) and were verified by the user running the app, not by a re-run of the gate.

## In progress

Nothing. C0 is complete. Ready for C1.

## Next action

Start C1: auth and schema. Read `src/features/c01-p0-auth-schema/README.md`
and build it to its done-when criteria. Requires Supabase credentials in
`.env.local`.

## Blocked on

`.env.local` must exist with real Supabase keys before C1 can be verified.
See `.env.example` for the required variable names.

## Do not touch

`app/globals.css` — all design tokens, no editing outside C0 scope.
`tailwind.config.ts` — token mirror, frozen.

## Notes

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
