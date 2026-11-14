# State

Last green checkpoint: C1a — c01a-green
Head commit: 4c077f5 C1a [claude]: add password + demo sign-in paths
Branch: main
Last agent: claude
Updated: 2026-11-14 01:10 ET
Gate at last commit: PASS — tsc --noEmit && next build && vitest run all green.

## In progress

Nothing. C1 and C1a are complete.

## Next action

Start C2 (workout logger). Read the C2 checkpoint README before writing any
code. C2 has NOT been built. The feature folder contains only a README — no
implementation exists on any branch or tag. It must be built from scratch.

## Completed checkpoints

- C0 — c00-green: foundation, design system, AppShell, TabBar, /preview
- C1 — c01-green: auth schema, migration, seed, RLS, magic-link sign-in, DB types
- C1a — c01a-green: password sign-in, demo account button, sign-out on Me tab

## Do not touch

`app/globals.css` — all design tokens, no editing outside C0 scope.
`tailwind.config.ts` — token mirror, frozen.

## Notes

- Repo lives at `/Users/snath07/dev/volslift` (cloned to dev/ subdirectory,
  not the home directory). Always cd here before any git command.
- @types/react, @types/react-dom, @types/node, postcss, autoprefixer added as
  devDependencies. Build-time requirements, not feature packages.
- tsconfig.json `include` is scoped to `app/**`, `src/**`, `tests/**`.
- next.config.mjs (not .ts) — Next.js 14 does not support .ts config files.
- /preview returns 404 in production.
- No CLAUDE.md on purpose. See BUILD_SPEC.md handoff section.
- DEMO_PASSWORD has no NEXT_PUBLIC_ prefix — injected via server component
  props in app/sign-in/page.tsx so it never appears as a client env var.

## History

- Scaffold created, 2026-11-13 00:50 ET
- C0 green, 2026-11-13 19:25 ET — gate passed
- C1 green, 2026-11-13 20:15 ET — gate passed
- C1a green, 2026-11-14 01:10 ET — gate passed
